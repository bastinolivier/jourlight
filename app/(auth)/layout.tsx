import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0a0a0f' }}
    >
      <Link
        href="/"
        className="text-2xl font-bold tracking-widest mb-8 block"
        style={{ color: '#6366f1' }}
      >
        JOURLIGHT
      </Link>
      <div
        className="w-full max-w-md rounded-2xl p-8 border"
        style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
      >
        {children}
      </div>
      <p className="mt-6 text-xs" style={{ color: '#6b6b88' }}>
        La plateforme des techniciens du spectacle
      </p>
    </div>
  )
}
