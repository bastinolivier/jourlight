import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/db/prisma'
import ContactForm from './ContactForm'

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

const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  INTERMITTENT: { bg: '#1a2a3a', text: '#60a5fa', label: 'Intermittent' },
  FREELANCE: { bg: '#1a2a1a', text: '#4ade80', label: 'Freelance' },
  SALARIE: { bg: '#2a1a2a', text: '#c084fc', label: 'Salarié' },
}

const SKILL_CATEGORY_LABELS: Record<string, string> = {
  SOFTWARE: 'Logiciels',
  HARDWARE: 'Matériel',
  CERTIFICATION: 'Certifications',
  TECHNIQUE: 'Techniques',
}

const SKILL_LEVEL_META: Record<string, { label: string; color: string }> = {
  NOTIONS: { label: 'Notions', color: '#6b6b88' },
  CONFIRME: { label: 'Confirmé', color: '#60a5fa' },
  EXPERT: { label: 'Expert', color: '#4ade80' },
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  SPECTACLE: 'Spectacle',
  TOURNEE: 'Tournée',
  FESTIVAL: 'Festival',
  EVENEMENT: 'Événement',
  CORPORATE: 'Corporate',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type Params = Promise<{ slug: string }>

export default async function ProfilePage({ params }: { params: Params }) {
  const { slug } = await params

  const profile = await prisma.technicianProfile.findUnique({
    where: { slug },
    include: {
      skills: { orderBy: [{ category: 'asc' }, { order: 'asc' }] },
      projects: { orderBy: [{ featured: 'desc' }, { year: 'desc' }] },
      availability: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 30,
      },
    },
  })

  if (!profile || !profile.isPublic) notFound()

  const statusMeta = STATUS_META[profile.status] ?? STATUS_META.FREELANCE

  // Check if available today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isAvailableToday = profile.availability.some((a) => {
    const d = new Date(a.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime() && a.status === 'AVAILABLE'
  })

  // Group skills by category
  const skillsByCategory = profile.skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = []
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, typeof profile.skills>,
  )

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
        <Link href="/techniciens" className="text-sm" style={{ color: '#a0a0b8' }}>
          ← Annuaire
        </Link>
      </nav>

      {/* AVAILABLE BANNER */}
      {isAvailableToday && (
        <div
          className="px-6 py-3 text-center text-sm font-medium"
          style={{ background: '#1a2e1a', color: '#4ade80' }}
        >
          ✓ Ce technicien est disponible aujourd&apos;hui
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* PROFILE HEADER */}
        <div
          className="p-8 rounded-2xl border mb-6"
          style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
              style={{ background: '#2a2a38', color: '#6366f1' }}
            >
              {getInitials(profile.displayName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ background: statusMeta.bg, color: statusMeta.text }}
                >
                  {statusMeta.label}
                </span>
                {profile.isVerified && (
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: '#1a2a1a', color: '#4ade80' }}
                  >
                    ✓ Vérifié
                  </span>
                )}
              </div>

              {/* Specialties */}
              {profile.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: '#2a2a38', color: '#a0a0b8' }}
                    >
                      {SPECIALTY_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#6b6b88' }}>
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.yearsExperience > 0 && (
                  <span>
                    {profile.yearsExperience} an{profile.yearsExperience > 1 ? 's' : ''}{' '}
                    d&apos;expérience
                  </span>
                )}
                {profile.mobility && <span>🚗 Mobilité nationale</span>}
              </div>

              {profile.bio && (
                <p className="mt-4 text-sm leading-relaxed" style={{ color: '#a0a0b8' }}>
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Contact CTA */}
            <a
              href="#contact"
              className="flex-shrink-0 px-6 py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-90"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              Contacter
            </a>
          </div>
        </div>

        {/* SKILLS */}
        {profile.skills.length > 0 && (
          <section
            className="p-6 rounded-2xl border mb-6"
            style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
          >
            <h2 className="text-lg font-bold mb-5">Compétences</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <h3
                    className="text-xs font-semibold tracking-widest mb-3"
                    style={{ color: '#6366f1' }}
                  >
                    {SKILL_CATEGORY_LABELS[category] ?? category}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {skills.map((skill) => {
                      const levelMeta = SKILL_LEVEL_META[skill.level]
                      return (
                        <div key={skill.id} className="flex items-center justify-between">
                          <span className="text-sm">{skill.name}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ background: '#2a2a38', color: levelMeta.color }}
                          >
                            {levelMeta.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PORTFOLIO */}
        {profile.projects.length > 0 && (
          <section
            className="p-6 rounded-2xl border mb-6"
            style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
          >
            <h2 className="text-lg font-bold mb-5">Portfolio</h2>
            <div className="flex flex-col gap-3">
              {profile.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start gap-4 p-4 rounded-xl"
                  style={{ background: '#0a0a0f' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{project.title}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: '#2a2a38', color: '#a0a0b8' }}
                      >
                        {PROJECT_TYPE_LABELS[project.type] ?? project.type}
                      </span>
                      {project.featured && (
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: '#1a2a3a', color: '#60a5fa' }}
                        >
                          ★ Mis en avant
                        </span>
                      )}
                    </div>
                    <div className="text-sm" style={{ color: '#6b6b88' }}>
                      {project.role}
                      {project.year && ` · ${project.year}`}
                      {project.location && ` · ${project.location}`}
                      {project.client && ` · ${project.client}`}
                    </div>
                    {project.description && (
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6b6b88' }}>
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT FORM */}
        <section
          id="contact"
          className="p-6 rounded-2xl border"
          style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
        >
          <h2 className="text-lg font-bold mb-2">Contacter {profile.displayName}</h2>
          <p className="text-sm mb-6" style={{ color: '#6b6b88' }}>
            Décrivez votre mission et nous transmettrons votre message.
          </p>
          <ContactForm profileId={profile.id} />
        </section>
      </div>
    </div>
  )
}
