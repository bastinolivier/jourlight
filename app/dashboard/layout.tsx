import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import LogoutButton from './LogoutButton'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: '⬡' },
  { href: '/dashboard/profil', label: 'Profil', icon: '👤' },
  { href: '/dashboard/competences', label: 'Compétences', icon: '⚡' },
  { href: '/dashboard/portfolio', label: 'Portfolio', icon: '🎬' },
  { href: '/dashboard/disponibilites', label: 'Disponibilités', icon: '📅' },
  { href: '/dashboard/contacts', label: 'Contacts', icon: '✉' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0f', color: '#e8e8f0' }}>
      {/* SIDEBAR */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-r"
        style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: '#2a2a38' }}>
          <Link href="/" className="text-lg font-bold tracking-widest" style={{ color: '#6366f1' }}>
            JOURLIGHT
          </Link>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:text-white"
              style={{ color: '#a0a0b8' }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t" style={{ borderColor: '#2a2a38' }}>
          <div className="text-xs truncate mb-3" style={{ color: '#6b6b88' }}>
            {session.user.email}
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header
          className="flex items-center justify-between px-8 py-4 border-b"
          style={{ borderColor: '#2a2a38', background: '#1a1a24' }}
        >
          <div className="text-sm font-medium" style={{ color: '#a0a0b8' }}>
            Tableau de bord
          </div>
          <div className="text-xs" style={{ color: '#6b6b88' }}>
            {session.user.email}
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
