'use client'

import { useState } from 'react'

type Specialty =
  | 'SON'
  | 'LUMIERE'
  | 'PLATEAU'
  | 'VIDEO'
  | 'RIGGING'
  | 'MACHINERIE'
  | 'PYROTECHNIE'
  | 'AUTRE'

type TechnicianStatus = 'INTERMITTENT' | 'FREELANCE' | 'SALARIE'

interface Profile {
  id: string
  displayName: string
  bio: string | null
  location: string | null
  yearsExperience: number
  status: TechnicianStatus
  specialties: Specialty[]
  mobility: boolean
  website: string | null
  linkedin: string | null
  languages: string[]
}

interface ProfilFormProps {
  profile: Profile
}

const SPECIALTIES: { value: Specialty; label: string }[] = [
  { value: 'SON', label: 'SON 🎵' },
  { value: 'LUMIERE', label: 'LUMIERE 💡' },
  { value: 'PLATEAU', label: 'PLATEAU 🎭' },
  { value: 'VIDEO', label: 'VIDEO 🎬' },
  { value: 'RIGGING', label: 'RIGGING 🔗' },
  { value: 'MACHINERIE', label: 'MACHINERIE ⚙️' },
  { value: 'PYROTECHNIE', label: 'PYROTECHNIE 🔥' },
  { value: 'AUTRE', label: 'AUTRE' },
]

const STATUS_LABELS: Record<TechnicianStatus, string> = {
  INTERMITTENT: 'Intermittent du spectacle',
  FREELANCE: 'Freelance',
  SALARIE: 'Salarié',
}

export default function ProfilForm({ profile }: ProfilFormProps) {
  const [form, setForm] = useState({
    displayName: profile.displayName,
    bio: profile.bio ?? '',
    location: profile.location ?? '',
    yearsExperience: profile.yearsExperience,
    status: profile.status,
    specialties: profile.specialties as Specialty[],
    mobility: profile.mobility,
    website: profile.website ?? '',
    linkedin: profile.linkedin ?? '',
    languages: profile.languages.join(', '),
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSpecialty(spec: Specialty) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter((s) => s !== spec)
        : [...prev.specialties, spec],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/dashboard/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          languages: form.languages
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur lors de la sauvegarde')
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition'
  const inputStyle = { background: '#1a1a24', border: '1px solid #2a2a38', color: '#e8e8f0' }
  const labelClass = 'block text-xs font-medium mb-1.5'
  const labelStyle = { color: '#a0a0b8' }
  const sectionClass = 'p-5 rounded-xl border mb-4'
  const sectionStyle = { background: '#1a1a24', borderColor: '#2a2a38' }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Identity */}
      <div className={sectionClass} style={sectionStyle}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#e8e8f0' }}>
          Identité
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>
              Nom affiché *
            </label>
            <input
              type="text"
              required
              className={inputClass}
              style={inputStyle}
              value={form.displayName}
              onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>
              Bio
            </label>
            <textarea
              rows={4}
              className={inputClass}
              style={inputStyle}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Décrivez votre parcours et votre expertise..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>
                Localisation
              </label>
              <input
                type="text"
                className={inputClass}
                style={inputStyle}
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Paris, Lyon..."
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                Années d'expérience
              </label>
              <input
                type="number"
                min={0}
                max={60}
                className={inputClass}
                style={inputStyle}
                value={form.yearsExperience}
                onChange={(e) =>
                  setForm((p) => ({ ...p, yearsExperience: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>
              Statut
            </label>
            <select
              className={inputClass}
              style={inputStyle}
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value as TechnicianStatus }))
              }
            >
              {(Object.keys(STATUS_LABELS) as TechnicianStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className={sectionClass} style={sectionStyle}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#e8e8f0' }}>
          Spécialités
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SPECIALTIES.map((spec) => {
            const checked = form.specialties.includes(spec.value)
            return (
              <label
                key={spec.value}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-all"
                style={{
                  background: checked ? '#6366f120' : '#0a0a0f',
                  border: `1px solid ${checked ? '#6366f1' : '#2a2a38'}`,
                  color: checked ? '#e8e8f0' : '#a0a0b8',
                }}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleSpecialty(spec.value)}
                />
                {spec.label}
              </label>
            )
          })}
        </div>
        <label className="flex items-center gap-2 mt-4 cursor-pointer text-sm" style={{ color: '#a0a0b8' }}>
          <input
            type="checkbox"
            checked={form.mobility}
            onChange={(e) => setForm((p) => ({ ...p, mobility: e.target.checked }))}
            className="rounded"
          />
          Disponible pour déplacements
        </label>
      </div>

      {/* Links & Languages */}
      <div className={sectionClass} style={sectionStyle}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#e8e8f0' }}>
          Liens & Langues
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>
              Site web
            </label>
            <input
              type="url"
              className={inputClass}
              style={inputStyle}
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>
              LinkedIn
            </label>
            <input
              type="url"
              className={inputClass}
              style={inputStyle}
              value={form.linkedin}
              onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>
              Langues (séparées par des virgules)
            </label>
            <input
              type="text"
              className={inputClass}
              style={inputStyle}
              value={form.languages}
              onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))}
              placeholder="Français, Anglais, Espagnol"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      {error && (
        <p className="text-sm px-4 py-2 rounded-lg" style={{ background: '#3f1212', color: '#f87171' }}>
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm px-4 py-2 rounded-lg" style={{ background: '#0f2a1a', color: '#4ade80' }}>
          Profil sauvegardé avec succès.
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: '#6366f1', color: '#fff' }}
      >
        {saving ? 'Sauvegarde...' : 'Enregistrer'}
      </button>
    </form>
  )
}
