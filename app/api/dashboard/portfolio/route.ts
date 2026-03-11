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
    include: {
      projects: { orderBy: [{ featured: 'desc' }, { year: 'desc' }, { order: 'asc' }] },
    },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  return NextResponse.json(profile.projects)
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
  const { title, role, type, year, description, location, client, venue } = body

  if (!title || !role || !type) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const project = await prisma.portfolioProject.create({
    data: {
      profileId: profile.id,
      title: title.trim(),
      role: role.trim(),
      type,
      year: year || null,
      description: description || null,
      location: location || null,
      client: client || null,
      venue: venue || null,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
