'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#0a0a0f',
    color: '#e8e8f0',
    border: '1px solid #2a2a38',
  }

  const labelStyle = { color: '#a0a0b8' }

  return (
    <>
      <h1 className="text-xl font-bold mb-2" style={{ color: '#e8e8f0' }}>
        Créer mon compte
      </h1>
      <p className="text-sm mb-6" style={{ color: '#6b6b88' }}>
        Rejoignez la plateforme des techniciens du spectacle
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
              PRÉNOM
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              placeholder="Jean"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
              NOM
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              placeholder="Dupont"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
            EMAIL
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="vous@exemple.com"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
            MOT DE PASSE
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="Minimum 6 caractères"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: '#6366f1', color: '#fff' }}
        >
          {loading ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: '#6b6b88' }}>
        Déjà un compte ?{' '}
        <Link href="/login" style={{ color: '#6366f1' }} className="hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  )
}
