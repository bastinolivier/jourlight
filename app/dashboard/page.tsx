import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

const quickLinks = [
  { href: '/dashboard/profil', label: 'Modifier mon profil', icon: '👤', desc: 'Infos, bio, spécialités' },
  { href: '/dashboard/competences', label: 'Mes compétences', icon: '⚡', desc: 'Logiciels, matériel, certifs' },
  { href: '/dashboard/portfolio', label: 'Mon portfolio', icon: '🎬', desc: 'Projets et expériences' },
  { href: '/dashboard/disponibilites', label: 'Mes disponibilités', icon: '📅', desc: 'Calendrier de dispo' },
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: {
          contacts: true,
          projects: true,
          skills: true,
        },
      },
    },
  })

  const pendingContacts = profile
    ? await prisma.contactRequest.count({
        where: { profileId: profile.id, status: 'PENDING' },
      })
    : 0

  const displayName = profile?.displayName ?? session.user.email ?? 'Technicien'

  return (
    <div className="max-w-4xl">
      {/* WELCOME */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Bonjour{profile ? `, ${profile.displayName.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm" style={{ color: '#6b6b88' }}>
          Bienvenue sur votre tableau de bord Jourlight.
        </p>
      </div>

      {/* PROFILE COMPLETENESS */}
      {profile && !profile.bio && (
        <div
          className="mb-6 flex items-center gap-4 p-4 rounded-xl border"
          style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
        >
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-sm font-medium">Complétez votre profil</p>
            <p className="text-xs mt-0.5" style={{ color: '#6b6b88' }}>
              Ajoutez une bio, votre localisation et vos spécialités pour être trouvé plus facilement.
            </p>
          </div>
          <Link
            href="/dashboard/profil"
            className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            Compléter
          </Link>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Vues du profil', value: '—', icon: '👁', note: 'Bientôt disponible' },
          {
            label: 'Contacts reçus',
            value: profile?._count.contacts ?? 0,
            icon: '✉',
            note: `${pendingContacts} en attente`,
          },
          {
            label: 'Projets',
            value: profile?._count.projects ?? 0,
            icon: '🎬',
            note: 'Dans le portfolio',
          },
          {
            label: 'Compétences',
            value: profile?._count.skills ?? 0,
            icon: '⚡',
            note: 'Référencées',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl border"
            style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
            <div className="text-xs font-medium mb-0.5">{stat.label}</div>
            <div className="text-xs" style={{ color: '#6b6b88' }}>
              {stat.note}
            </div>
          </div>
        ))}
      </div>

      {/* QUICK LINKS */}
      <h2 className="text-base font-semibold mb-4" style={{ color: '#a0a0b8' }}>
        Accès rapide
      </h2>
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-indigo-500"
            style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
          >
            <span className="text-xl">{link.icon}</span>
            <div>
              <div className="text-sm font-medium">{link.label}</div>
              <div className="text-xs mt-0.5" style={{ color: '#6b6b88' }}>
                {link.desc}
              </div>
            </div>
            <span className="ml-auto" style={{ color: '#2a2a38' }}>
              →
            </span>
          </Link>
        ))}
      </div>

      {/* PUBLIC PROFILE LINK */}
      {profile && (
        <div
          className="p-4 rounded-xl border flex items-center gap-4"
          style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">Votre profil public</p>
            <p className="text-xs mt-0.5" style={{ color: '#6b6b88' }}>
              /techniciens/{profile.slug}
            </p>
          </div>
          <Link
            href={`/techniciens/${profile.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-lg text-xs font-medium border transition-colors hover:border-indigo-500"
            style={{ borderColor: '#2a2a38', color: '#a0a0b8' }}
          >
            Voir le profil →
          </Link>
        </div>
      )}
    </div>
  )
}
