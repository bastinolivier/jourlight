'use client'

import { useState } from 'react'

type SkillCategory = 'SOFTWARE' | 'HARDWARE' | 'CERTIFICATION' | 'TECHNIQUE'
type SkillLevel = 'NOTIONS' | 'CONFIRME' | 'EXPERT'

interface Skill {
  id: string
  profileId: string
  category: SkillCategory
  name: string
  level: SkillLevel
  order: number
}

interface CompetencesManagerProps {
  profileId: string
  initialSkills: Skill[]
}

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  SOFTWARE: 'Logiciels',
  HARDWARE: 'Matériel',
  CERTIFICATION: 'Certifications',
  TECHNIQUE: 'Techniques',
}

const LEVEL_LABELS: Record<SkillLevel, string> = {
  NOTIONS: 'Notions',
  CONFIRME: 'Confirmé',
  EXPERT: 'Expert',
}

const LEVEL_COLORS: Record<SkillLevel, string> = {
  NOTIONS: '#6b6b88',
  CONFIRME: '#6366f1',
  EXPERT: '#10b981',
}

const SUGGESTIONS: Record<SkillCategory, string[]> = {
  SOFTWARE: [
    'GrandMA2',
    'GrandMA3',
    'QLab',
    'Resolume Arena',
    'disguise',
    'Dante Controller',
    'L-Acoustics Soundvision',
    'ProTools',
    'Ableton Live',
    'Vectorworks',
    'AutoCAD',
    'Capture',
    'WYSIWYG',
    'ETC EOS',
    'Hog 4',
    'MA3D',
    'EASE',
    'Smaart',
  ],
  HARDWARE: [
    'L-Acoustics K2',
    'L-Acoustics KARA',
    'd&b audiotechnik',
    'Adamson',
    'DiGiCo SD7',
    'Avid S6L',
    'Yamaha CL5',
    'Allen & Heath dLive',
    'GLP impression',
    'Robe BMFL',
    'Clay Paky Sharpy',
    'Martin MAC Viper',
    'ETC Source Four',
    'Barco E2',
    'Christie',
    'Green Hippo',
    'Hoist moteur CM',
    'Liftket',
  ],
  CERTIFICATION: [
    'CACES Nacelle',
    'Habilitation électrique B1V',
    'SIAP (Sécurité Incendie)',
    'PSC1',
    'SST',
    'Travaux en hauteur',
    'CACES Chariot',
    'Grutier',
  ],
  TECHNIQUE: [
    'Accroche / gréage',
    'Câblage réseau audio',
    'Protocole DMX',
    'Art-Net / sACN',
    'Dante',
    'AVB',
    'Fibres optiques',
    'Réseaux informatiques',
    'Soudure',
    'Confection câbles',
    'Lecture plans',
    'Conduite spectacle',
  ],
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as SkillCategory[]
const LEVELS = Object.keys(LEVEL_LABELS) as SkillLevel[]

export default function CompetencesManager({ profileId, initialSkills }: CompetencesManagerProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [form, setForm] = useState<{ category: SkillCategory; name: string; level: SkillLevel }>({
    category: 'SOFTWARE',
    name: '',
    level: 'CONFIRME',
  })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = SUGGESTIONS[form.category].filter(
    (s) => s.toLowerCase().includes(form.name.toLowerCase()) && form.name.length > 0
  )

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/competences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur')
      }
      const newSkill = await res.json()
      setSkills((prev) => [...prev, newSkill])
      setForm((p) => ({ ...p, name: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/dashboard/competences/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur')
      setSkills((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setError('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = skills.filter((s) => s.category === cat)
      return acc
    },
    {} as Record<SkillCategory, Skill[]>
  )

  const inputClass =
    'px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition'
  const inputStyle = { background: '#0a0a0f', border: '1px solid #2a2a38', color: '#e8e8f0' }
  const sectionStyle = { background: '#1a1a24', borderColor: '#2a2a38' }

  return (
    <div className="space-y-4">
      {/* Add skill form */}
      <div className="p-5 rounded-xl border" style={sectionStyle}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#e8e8f0' }}>
          Ajouter une compétence
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#a0a0b8' }}>
                Catégorie
              </label>
              <select
                className={`${inputClass} w-full`}
                style={inputStyle}
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as SkillCategory, name: '' }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#a0a0b8' }}>
                Niveau
              </label>
              <select
                className={`${inputClass} w-full`}
                style={inputStyle}
                value={form.level}
                onChange={(e) => setForm((p) => ({ ...p, level: e.target.value as SkillLevel }))}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium mb-1" style={{ color: '#a0a0b8' }}>
              Nom
            </label>
            <input
              type="text"
              required
              className={`${inputClass} w-full`}
              style={inputStyle}
              value={form.name}
              placeholder="ex: GrandMA3, Dante, CACES..."
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }))
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul
                className="absolute z-10 w-full mt-1 rounded-lg border overflow-hidden"
                style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
              >
                {filteredSuggestions.slice(0, 6).map((s) => (
                  <li
                    key={s}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-indigo-500/10 transition-colors"
                    style={{ color: '#e8e8f0' }}
                    onMouseDown={() => {
                      setForm((p) => ({ ...p, name: s }))
                      setShowSuggestions(false)
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error && (
            <p className="text-xs" style={{ color: '#f87171' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={adding || !form.name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            {adding ? 'Ajout...' : '+ Ajouter'}
          </button>
        </form>
      </div>

      {/* Skills list grouped by category */}
      {CATEGORIES.map((cat) => {
        const catSkills = grouped[cat]
        if (catSkills.length === 0) return null
        return (
          <div key={cat} className="p-5 rounded-xl border" style={sectionStyle}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#a0a0b8' }}>
              {CATEGORY_LABELS[cat]}
              <span className="ml-2 text-xs" style={{ color: '#6b6b88' }}>
                ({catSkills.length})
              </span>
            </h2>
            <div className="space-y-2">
              {catSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                  style={{ background: '#0a0a0f' }}
                >
                  <span className="text-sm flex-1" style={{ color: '#e8e8f0' }}>
                    {skill.name}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${LEVEL_COLORS[skill.level]}20`,
                      color: LEVEL_COLORS[skill.level],
                    }}
                  >
                    {LEVEL_LABELS[skill.level]}
                  </span>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    disabled={deletingId === skill.id}
                    className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-100 opacity-40 disabled:opacity-20"
                    style={{ color: '#f87171' }}
                    title="Supprimer"
                  >
                    {deletingId === skill.id ? '...' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {skills.length === 0 && (
        <div
          className="p-8 rounded-xl border text-center text-sm"
          style={{ borderColor: '#2a2a38', color: '#6b6b88' }}
        >
          Aucune compétence ajoutée. Commencez par en ajouter une ci-dessus.
        </div>
      )}
    </div>
  )
}
