import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? '0')
  const month = parseInt(searchParams.get('month') ?? '0')

  if (!year || !month) {
    return NextResponse.json({ error: 'Paramètres year et month requis' }, { status: 400 })
  }

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // last day of month

  const records = await prisma.availability.findMany({
    where: {
      profileId: profile.id,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(
    records.map((r) => ({
      id: r.id,
      date: r.date.toISOString().split('T')[0],
      status: r.status,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  const body: { date: string; status: string | null }[] = await req.json()

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
  }

  // Upsert each day (skip nulls, delete existing)
  const ops = body.map(async (item) => {
    const date = new Date(item.date)
    if (isNaN(date.getTime())) return

    if (!item.status) {
      // Delete record if exists
      await prisma.availability.deleteMany({
        where: { profileId: profile.id, date },
      })
    } else {
      await prisma.availability.upsert({
        where: { profileId_date: { profileId: profile.id, date } },
        create: {
          profileId: profile.id,
          date,
          status: item.status as 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE',
        },
        update: {
          status: item.status as 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE',
        },
      })
    }
  })

  await Promise.all(ops)

  return NextResponse.json({ success: true })
}
