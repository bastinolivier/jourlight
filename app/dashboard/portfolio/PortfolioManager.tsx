'use client'

import { useState } from 'react'

type ProjectType = 'SPECTACLE' | 'TOURNEE' | 'FESTIVAL' | 'EVENEMENT' | 'CORPORATE'

interface Project {
  id: string
  profileId: string
  title: string
  role: string
  type: ProjectType
  year: number | null
  description: string | null
  location: string | null
  client: string | null
  venue: string | null
  featured: boolean
  order: number
}

interface PortfolioManagerProps {
  profileId: string
  initialProjects: Project[]
}

const TYPE_LABELS: Record<ProjectType, string> = {
  SPECTACLE: 'Spectacle',
  TOURNEE: 'Tournée',
  FESTIVAL: 'Festival',
  EVENEMENT: 'Événement',
  CORPORATE: 'Corporate',
}

const TYPE_COLORS: Record<ProjectType, string> = {
  SPECTACLE: '#6366f1',
  TOURNEE: '#8b5cf6',
  FESTIVAL: '#f59e0b',
  EVENEMENT: '#10b981',
  CORPORATE: '#3b82f6',
}

const PROJECT_TYPES = Object.keys(TYPE_LABELS) as ProjectType[]

const emptyForm = {
  title: '',
  role: '',
  type: 'SPECTACLE' as ProjectType,
  year: new Date().getFullYear(),
  description: '',
  location: '',
  client: '',
  venue: '',
}

export default function PortfolioManager({ profileId, initialProjects }: PortfolioManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openAdd() {
    setEditingProject(null)
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
  }

  function openEdit(project: Project) {
    setEditingProject(project)
    setForm({
      title: project.title,
      role: project.role,
      type: project.type,
      year: project.year ?? new Date().getFullYear(),
      description: project.description ?? '',
      location: project.location ?? '',
      client: project.client ?? '',
      venue: project.venue ?? '',
    })
    setError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingProject(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      year: form.year || null,
      description: form.description || null,
      location: form.location || null,
      client: form.client || null,
      venue: form.venue || null,
    }
    try {
      if (editingProject) {
        const res = await fetch(`/api/dashboard/portfolio/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur')
        const updated = await res.json()
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        const res = await fetch('/api/dashboard/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error ?? 'Erreur')
        const created = await res.json()
        setProjects((prev) => [created, ...prev])
      }
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce projet ?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/dashboard/portfolio/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur')
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition'
  const inputStyle = { background: '#0a0a0f', border: '1px solid #2a2a38', color: '#e8e8f0' }
  const labelClass = 'block text-xs font-medium mb-1'
  const labelStyle = { color: '#a0a0b8' }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#6366f1', color: '#fff' }}
        >
          + Ajouter un projet
        </button>
      </div>

      {projects.length === 0 && (
        <div
          className="p-8 rounded-xl border text-center text-sm"
          style={{ borderColor: '#2a2a38', color: '#6b6b88' }}
        >
          Aucun projet dans votre portfolio. Ajoutez votre premier projet !
        </div>
      )}

      <div className="grid gap-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-5 rounded-xl border flex gap-4"
            style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h3 className="text-sm font-semibold truncate" style={{ color: '#e8e8f0' }}>
                  {project.title}
                </h3>
                <span
                  className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: `${TYPE_COLORS[project.type]}20`,
                    color: TYPE_COLORS[project.type],
                  }}
                >
                  {TYPE_LABELS[project.type]}
                </span>
              </div>
              <p className="text-xs mb-1" style={{ color: '#a0a0b8' }}>
                {project.role}
                {project.year ? ` · ${project.year}` : ''}
                {project.location ? ` · ${project.location}` : ''}
              </p>
              {project.client && (
                <p className="text-xs" style={{ color: '#6b6b88' }}>
                  Client : {project.client}
                  {project.venue ? ` — ${project.venue}` : ''}
                </p>
              )}
              {project.description && (
                <p className="text-xs mt-2 line-clamp-2" style={{ color: '#6b6b88' }}>
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 flex flex-col gap-2">
              <button
                onClick={() => openEdit(project)}
                className="px-3 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-80"
                style={{ background: '#2a2a38', color: '#a0a0b8' }}
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                disabled={deletingId === project.id}
                className="px-3 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-80 disabled:opacity-30"
                style={{ background: '#3f1212', color: '#f87171' }}
              >
                {deletingId === project.id ? '...' : 'Supprimer'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="w-full max-w-lg rounded-xl border overflow-y-auto max-h-[90vh]"
            style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
          >
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#2a2a38' }}>
              <h2 className="text-sm font-semibold">
                {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
              </h2>
              <button
                onClick={closeModal}
                className="text-lg leading-none"
                style={{ color: '#6b6b88' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className={labelClass} style={labelStyle}>
                  Titre *
                </label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>
                  Rôle / Poste *
                </label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  style={inputStyle}
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="Régisseur son, Chef lumière..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Type
                  </label>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as ProjectType }))}
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Année
                  </label>
                  <input
                    type="number"
                    min={1980}
                    max={2050}
                    className={inputClass}
                    style={inputStyle}
                    value={form.year}
                    onChange={(e) => setForm((p) => ({ ...p, year: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>
                  Description
                </label>
                <textarea
                  rows={3}
                  className={inputClass}
                  style={inputStyle}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Lieu
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    style={inputStyle}
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>
                    Salle / Venue
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    style={inputStyle}
                    value={form.venue}
                    onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>
                  Client / Organisateur
                </label>
                <input
                  type="text"
                  className={inputClass}
                  style={inputStyle}
                  value={form.client}
                  onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))}
                />
              </div>
              {error && (
                <p className="text-xs" style={{ color: '#f87171' }}>
                  {error}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ background: '#6366f1', color: '#fff' }}
                >
                  {saving ? 'Sauvegarde...' : editingProject ? 'Enregistrer' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg text-sm transition-colors"
                  style={{ background: '#2a2a38', color: '#a0a0b8' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
