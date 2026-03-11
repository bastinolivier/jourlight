import Link from 'next/link'
import prisma from '@/lib/db/prisma'
import { Specialty } from '@prisma/client'

const SPECIALTY_LABELS: Record<string, string> = {
  SON: '🎵 Son',
  LUMIERE: '💡 Lumière',
  PLATEAU: '🎭 Plateau',
  VIDEO: '🎬 Vidéo',
  RIGGING: '🔗 Rigging',
  MACHINERIE: '⚙️ Machinerie',
  PYROTECHNIE: '🔥 Pyrotechnie',
  AUTRE: '• Autre',
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  INTERMITTENT: { bg: '#1a2a3a', text: '#60a5fa', label: 'Intermittent' },
  FREELANCE: { bg: '#1a2a1a', text: '#4ade80', label: 'Freelance' },
  SALARIE: { bg: '#2a1a2a', text: '#c084fc', label: 'Salarié' },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type SearchParams = Promise<{ specialty?: string; location?: string; query?: string }>

export default async function TechniciensPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const { specialty, location, query } = params

  const profiles = await prisma.technicianProfile.findMany({
    where: {
      isPublic: true,
      ...(specialty && { specialties: { has: specialty as Specialty } }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(query && {
        OR: [
          { displayName: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      skills: { take: 5, orderBy: { order: 'asc' } },
      availability: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 48,
  })

  const allSpecialties = Object.keys(SPECIALTY_LABELS)

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#e8e8f0' }}>
      {/* NAV */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: '#2a2a38' }}
      >
        <Link href="/" className="text-xl font-bold tracking-widest" style={{ color: '#6366f1' }}>
          JOURLIGHT
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm" style={{ color: '#a0a0b8' }}>
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 rounded-lg"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            Créer mon profil
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">Annuaire des techniciens</h1>
        <p className="text-sm mb-8" style={{ color: '#6b6b88' }}>
          {profiles.length} profil{profiles.length !== 1 ? 's' : ''} trouvé
          {profiles.length !== 1 ? 's' : ''}
          {specialty ? ` en ${SPECIALTY_LABELS[specialty] ?? specialty}` : ''}
        </p>

        {/* FILTERS */}
        <div className="mb-8">
          <form method="GET" className="flex flex-wrap gap-3 items-center">
            {/* Specialty pills */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/techniciens"
                className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                style={
                  !specialty
                    ? { background: '#6366f1', color: '#fff', borderColor: '#6366f1' }
                    : { background: 'transparent', color: '#a0a0b8', borderColor: '#2a2a38' }
                }
              >
                Tous
              </Link>
              {allSpecialties.map((s) => (
                <Link
                  key={s}
                  href={`/techniciens?specialty=${s}${location ? `&location=${location}` : ''}`}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={
                    specialty === s
                      ? { background: '#6366f1', color: '#fff', borderColor: '#6366f1' }
                      : { background: 'transparent', color: '#a0a0b8', borderColor: '#2a2a38' }
                  }
                >
                  {SPECIALTY_LABELS[s]}
                </Link>
              ))}
            </div>

            {/* Search input */}
            <div className="flex gap-2 ml-auto">
              <input
                type="text"
                name="query"
                defaultValue={query}
                placeholder="Rechercher…"
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#1a1a24', color: '#e8e8f0', border: '1px solid #2a2a38' }}
              />
              {specialty && <input type="hidden" name="specialty" value={specialty} />}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: '#6366f1', color: '#fff' }}
              >
                OK
              </button>
            </div>
          </form>
        </div>

        {/* GRID */}
        {profiles.length === 0 ? (
          <div
            className="text-center py-24 rounded-xl border"
            style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
          >
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-semibold mb-2">Aucun profil trouvé</p>
            <p className="text-sm" style={{ color: '#6b6b88' }}>
              Essayez d&apos;autres critères de recherche
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const statusMeta = STATUS_COLORS[profile.status] ?? STATUS_COLORS.FREELANCE
              const isAvailable = profile.availability.some(
                (a) => a.status === 'AVAILABLE',
              )

              return (
                <Link
                  key={profile.id}
                  href={`/techniciens/${profile.slug}`}
                  className="block p-5 rounded-xl border transition-all hover:border-indigo-500 group"
                  style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
                >
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{ background: '#2a2a38', color: '#6366f1' }}
                    >
                      {getInitials(profile.displayName)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{profile.displayName}</div>
                      {profile.location && (
                        <div className="text-xs mt-0.5 truncate" style={{ color: '#6b6b88' }}>
                          📍 {profile.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: statusMeta.bg, color: statusMeta.text }}
                        >
                          {statusMeta.label}
                        </span>
                        {isAvailable && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: '#1a2e1a', color: '#4ade80' }}
                          >
                            Disponible
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  {profile.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {profile.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: '#2a2a38', color: '#a0a0b8' }}
                        >
                          {SPECIALTY_LABELS[s] ?? s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Experience */}
                  {profile.yearsExperience > 0 && (
                    <div className="text-xs" style={{ color: '#6b6b88' }}>
                      {profile.yearsExperience} an{profile.yearsExperience > 1 ? 's' : ''}{' '}
                      d&apos;expérience
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
