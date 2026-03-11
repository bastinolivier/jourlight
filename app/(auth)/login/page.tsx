'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-2" style={{ color: '#e8e8f0' }}>
        Connexion
      </h1>
      <p className="text-sm mb-6" style={{ color: '#6b6b88' }}>
        Accédez à votre espace technicien
      </p>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background: '#2d1a1a', color: '#f87171', border: '1px solid #4a2020' }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium mb-1 tracking-wide"
            style={{ color: '#a0a0b8' }}
          >
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-1"
            style={{
              background: '#0a0a0f',
              color: '#e8e8f0',
              border: '1px solid #2a2a38',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium mb-1 tracking-wide"
            style={{ color: '#a0a0b8' }}
          >
            MOT DE PASSE
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{
              background: '#0a0a0f',
              color: '#e8e8f0',
              border: '1px solid #2a2a38',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: '#6366f1', color: '#fff' }}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: '#6b6b88' }}>
        Pas encore de compte ?{' '}
        <Link href="/register" style={{ color: '#6366f1' }} className="hover:underline">
          Créer mon profil
        </Link>
      </p>
    </>
  )
}
