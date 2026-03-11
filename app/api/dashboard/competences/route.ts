import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: { orderBy: [{ category: 'asc' }, { order: 'asc' }] } },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  return NextResponse.json(profile.skills)
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

  const body = await req.json()
  const { category, name, level } = body

  if (!category || !name || !level) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const skill = await prisma.skill.create({
    data: {
      profileId: profile.id,
      category,
      name: name.trim(),
      level,
    },
  })

  return NextResponse.json(skill, { status: 201 })
}
