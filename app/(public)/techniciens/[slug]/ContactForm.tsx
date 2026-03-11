'use client'

import { useState } from 'react'

interface Props {
  profileId: string
}

export default function ContactForm({ profileId }: Props) {
  const [form, setForm] = useState({
    senderName: '',
    senderEmail: '',
    senderOrg: '',
    message: '',
    missionDate: '',
    missionLocation: '',
    missionRole: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch(`/api/contact/${profileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    background: '#0a0a0f',
    color: '#e8e8f0',
    border: '1px solid #2a2a38',
  }

  const labelStyle = { color: '#a0a0b8' }

  if (status === 'success') {
    return (
      <div
        className="text-center py-10 rounded-xl"
        style={{ background: '#0a0a0f', border: '1px solid #2a2a38' }}
      >
        <div className="text-3xl mb-3">✓</div>
        <p className="font-semibold mb-1">Message envoyé !</p>
        <p className="text-sm" style={{ color: '#6b6b88' }}>
          Votre demande a bien été transmise.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
            VOTRE NOM *
          </label>
          <input
            type="text"
            name="senderName"
            value={form.senderName}
            onChange={handleChange}
            required
            placeholder="Jean Dupont"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
            EMAIL *
          </label>
          <input
            type="email"
            name="senderEmail"
            value={form.senderEmail}
            onChange={handleChange}
            required
            placeholder="contact@production.com"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
            ORGANISATION
          </label>
          <input
            type="text"
            name="senderOrg"
            value={form.senderOrg}
            onChange={handleChange}
            placeholder="Nom de la production"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
            RÔLE RECHERCHÉ
          </label>
          <input
            type="text"
            name="missionRole"
            value={form.missionRole}
            onChange={handleChange}
            placeholder="Ingénieur son FOH"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
            DATE DE MISSION
          </label>
          <input
            type="date"
            name="missionDate"
            value={form.missionDate}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
            LIEU
          </label>
          <input
            type="text"
            name="missionLocation"
            value={form.missionLocation}
            onChange={handleChange}
            placeholder="Paris, Olympia"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1 tracking-wide" style={labelStyle}>
          MESSAGE *
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Décrivez votre projet et vos besoins…"
          className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {status === 'error' && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: '#2d1a1a', color: '#f87171', border: '1px solid #4a2020' }}
        >
          Une erreur est survenue. Veuillez réessayer.
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: '#6366f1', color: '#fff' }}
      >
        {status === 'loading' ? 'Envoi…' : 'Envoyer la demande'}
      </button>
    </form>
  )
}
