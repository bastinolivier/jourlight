'use client'

import { useState, useEffect, useCallback } from 'react'

type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'

interface DayAvailability {
  date: string // YYYY-MM-DD
  status: AvailabilityStatus | null
}

const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  AVAILABLE: '#10b981',
  BUSY: '#f59e0b',
  UNAVAILABLE: '#ef4444',
}

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'Disponible',
  BUSY: 'Occupé',
  UNAVAILABLE: 'Indisponible',
}

const STATUSES: AvailabilityStatus[] = ['AVAILABLE', 'BUSY', 'UNAVAILABLE']

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function getMonthStartPadding(year: number, month: number): number {
  // Monday-based: Mon=0
  const dow = new Date(year, month, 1).getDay()
  return (dow + 6) % 7
}

export default function DisponibilitesPage() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus | null>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  const fetchMonth = useCallback(async (year: number, month: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/disponibilites?year=${year}&month=${month + 1}`)
      if (res.ok) {
        const data: { date: string; status: AvailabilityStatus }[] = await res.json()
        setAvailability((prev) => {
          const next = { ...prev }
          data.forEach((d) => {
            next[d.date] = d.status
          })
          return next
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMonth(viewYear, viewMonth)
  }, [viewYear, viewMonth, fetchMonth])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function cycleDay(dateStr: string) {
    setAvailability((prev) => {
      const current = prev[dateStr] ?? null
      const idx = current === null ? 0 : STATUSES.indexOf(current) + 1
      const next = idx >= STATUSES.length ? null : STATUSES[idx]
      return { ...prev, [dateStr]: next }
    })
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    const days = getDaysInMonth(viewYear, viewMonth)
    const batch = days.map((d) => {
      const ds = toDateStr(d)
      return { date: ds, status: availability[ds] ?? null }
    })
    try {
      const res = await fetch('/api/dashboard/disponibilites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
      if (res.ok) {
        setDirty(false)
        setSavedMsg(true)
        setTimeout(() => setSavedMsg(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const days = getDaysInMonth(viewYear, viewMonth)
  const padding = getMonthStartPadding(viewYear, viewMonth)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Mes disponibilités</h1>
        <p className="text-sm" style={{ color: '#6b6b88' }}>
          Cliquez sur un jour pour changer son statut. Enregistrez quand vous avez terminé.
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: STATUS_COLORS[s] }}
            />
            <span className="text-xs" style={{ color: '#a0a0b8' }}>
              {STATUS_LABELS[s]}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#2a2a38' }} />
          <span className="text-xs" style={{ color: '#a0a0b8' }}>
            Non défini
          </span>
        </div>
      </div>

      <div className="p-5 rounded-xl border" style={{ background: '#1a1a24', borderColor: '#2a2a38' }}>
        {/* Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
            style={{ background: '#2a2a38', color: '#a0a0b8' }}
          >
            ←
          </button>
          <h2 className="text-sm font-semibold" style={{ color: '#e8e8f0' }}>
            {MONTHS_FR[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
            style={{ background: '#2a2a38', color: '#a0a0b8' }}
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-xs py-1 font-medium" style={{ color: '#6b6b88' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="text-center py-12 text-sm" style={{ color: '#6b6b88' }}>
            Chargement...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Padding cells */}
            {Array.from({ length: padding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const ds = toDateStr(day)
              const status = availability[ds] ?? null
              const isToday = ds === toDateStr(today)
              return (
                <button
                  key={ds}
                  onClick={() => cycleDay(ds)}
                  className="aspect-square rounded-lg text-xs font-medium transition-all hover:opacity-80 flex items-center justify-center"
                  style={{
                    background: status ? `${STATUS_COLORS[status]}30` : '#0a0a0f',
                    border: `1px solid ${status ? STATUS_COLORS[status] : isToday ? '#6366f1' : '#2a2a38'}`,
                    color: status ? STATUS_COLORS[status] : isToday ? '#6366f1' : '#6b6b88',
                  }}
                  title={status ? STATUS_LABELS[status] : 'Non défini'}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="px-6 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: '#6366f1', color: '#fff' }}
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer ce mois'}
        </button>
        {savedMsg && (
          <span className="text-sm" style={{ color: '#4ade80' }}>
            Disponibilités enregistrées !
          </span>
        )}
      </div>
    </div>
  )
}
