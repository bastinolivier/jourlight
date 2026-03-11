'use client'

import { useState } from 'react'

type ContactStatus = 'PENDING' | 'READ' | 'REPLIED' | 'ARCHIVED'

interface Contact {
  id: string
  profileId: string
  senderName: string
  senderEmail: string
  senderOrg: string | null
  message: string
  missionDate: string | null
  missionLocation: string | null
  missionRole: string | null
  status: ContactStatus
  createdAt: string
  updatedAt: string
}

interface ContactsClientProps {
  initialContacts: Contact[]
}

const STATUS_LABELS: Record<ContactStatus, string> = {
  PENDING: 'En attente',
  READ: 'Lu',
  REPLIED: 'Répondu',
  ARCHIVED: 'Archivé',
}

const STATUS_COLORS: Record<ContactStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#6366f120', text: '#6366f1' },
  READ: { bg: '#3b82f620', text: '#3b82f6' },
  REPLIED: { bg: '#10b98120', text: '#10b981' },
  ARCHIVED: { bg: '#2a2a38', text: '#6b6b88' },
}

const STATUS_ORDER: ContactStatus[] = ['PENDING', 'READ', 'REPLIED', 'ARCHIVED']

const FILTER_OPTIONS: { value: ContactStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'READ', label: 'Lus' },
  { value: 'REPLIED', label: 'Répondus' },
  { value: 'ARCHIVED', label: 'Archivés' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ContactsClient({ initialContacts }: ContactsClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [filter, setFilter] = useState<ContactStatus | 'ALL'>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = filter === 'ALL' ? contacts : contacts.filter((c) => c.status === filter)

  async function updateStatus(id: string, status: ContactStatus) {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/dashboard/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const pendingCount = contacts.filter((c) => c.status === 'PENDING').length

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        {FILTER_OPTIONS.map((opt) => {
          const count =
            opt.value === 'ALL'
              ? contacts.length
              : contacts.filter((c) => c.status === opt.value).length
          const active = filter === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: active ? '#6366f1' : '#1a1a24',
                color: active ? '#fff' : '#a0a0b8',
                border: `1px solid ${active ? '#6366f1' : '#2a2a38'}`,
              }}
            >
              {opt.label}
              {count > 0 && (
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                  style={{
                    background: active ? 'rgba(255,255,255,0.2)' : '#2a2a38',
                    color: active ? '#fff' : '#6b6b88',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {pendingCount > 0 && (
        <div
          className="px-4 py-3 rounded-xl border text-sm flex items-center gap-3"
          style={{ background: '#6366f110', borderColor: '#6366f140', color: '#a5b4fc' }}
        >
          <span>✉</span>
          {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente de lecture.
        </div>
      )}

      {filtered.length === 0 && (
        <div
          className="p-8 rounded-xl border text-center text-sm"
          style={{ borderColor: '#2a2a38', color: '#6b6b88' }}
        >
          Aucune demande de contact.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((contact) => {
          const expanded = expandedId === contact.id
          const statusColor = STATUS_COLORS[contact.status]
          return (
            <div
              key={contact.id}
              className="rounded-xl border overflow-hidden"
              style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
            >
              {/* Row */}
              <div
                className="flex items-start gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expanded ? null : contact.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium" style={{ color: '#e8e8f0' }}>
                      {contact.senderName}
                    </span>
                    {contact.senderOrg && (
                      <span className="text-xs" style={{ color: '#6b6b88' }}>
                        · {contact.senderOrg}
                      </span>
                    )}
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium ml-auto"
                      style={{ background: statusColor.bg, color: statusColor.text }}
                    >
                      {STATUS_LABELS[contact.status]}
                    </span>
                  </div>
                  <p className="text-xs mb-1 truncate" style={{ color: '#a0a0b8' }}>
                    {contact.message}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {contact.missionDate && (
                      <span className="text-xs" style={{ color: '#6b6b88' }}>
                        Mission : {formatDate(contact.missionDate)}
                      </span>
                    )}
                    {contact.missionRole && (
                      <span className="text-xs" style={{ color: '#6b6b88' }}>
                        {contact.missionRole}
                      </span>
                    )}
                    <span className="text-xs ml-auto" style={{ color: '#6b6b88' }}>
                      {formatDate(contact.createdAt)}
                    </span>
                  </div>
                </div>
                <span
                  className="flex-shrink-0 text-xs transition-transform"
                  style={{ color: '#6b6b88', transform: expanded ? 'rotate(180deg)' : 'none' }}
                >
                  ▼
                </span>
              </div>

              {/* Expanded */}
              {expanded && (
                <div
                  className="px-4 pb-4 pt-2 border-t"
                  style={{ borderColor: '#2a2a38' }}
                >
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1" style={{ color: '#a0a0b8' }}>
                      Message complet
                    </p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: '#e8e8f0' }}>
                      {contact.message}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs" style={{ color: '#6b6b88' }}>
                    <div>
                      <span className="font-medium" style={{ color: '#a0a0b8' }}>Email : </span>
                      <a
                        href={`mailto:${contact.senderEmail}`}
                        className="hover:underline"
                        style={{ color: '#6366f1' }}
                      >
                        {contact.senderEmail}
                      </a>
                    </div>
                    {contact.missionLocation && (
                      <div>
                        <span className="font-medium" style={{ color: '#a0a0b8' }}>Lieu : </span>
                        {contact.missionLocation}
                      </div>
                    )}
                    {contact.missionDate && (
                      <div>
                        <span className="font-medium" style={{ color: '#a0a0b8' }}>Date mission : </span>
                        {formatDate(contact.missionDate)}
                      </div>
                    )}
                    {contact.missionRole && (
                      <div>
                        <span className="font-medium" style={{ color: '#a0a0b8' }}>Rôle demandé : </span>
                        {contact.missionRole}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_ORDER.filter((s) => s !== contact.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(contact.id, s)}
                        disabled={updatingId === contact.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity disabled:opacity-40"
                        style={{
                          background: STATUS_COLORS[s].bg,
                          color: STATUS_COLORS[s].text,
                          border: `1px solid ${STATUS_COLORS[s].text}40`,
                        }}
                      >
                        Marquer : {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
