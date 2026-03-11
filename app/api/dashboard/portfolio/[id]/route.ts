import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

async function getOwnedProject(id: string, userId: string) {
  const project = await prisma.portfolioProject.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  })
  if (!project) return null
  if (project.profile.userId !== userId) return null
  return project
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id } = await params
  const project = await getOwnedProject(id, session.user.id)
  if (!project) {
    return NextResponse.json({ error: 'Projet introuvable ou accès refusé' }, { status: 404 })
  }

  const body = await req.json()
  const { title, role, type, year, description, location, client, venue } = body

  const updated = await prisma.portfolioProject.update({
    where: { id },
    data: {
      title: title ?? project.title,
      role: role ?? project.role,
      type: type ?? project.type,
      year: year ?? project.year,
      description: description ?? null,
      location: location ?? null,
      client: client ?? null,
      venue: venue ?? null,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id } = await params
  const project = await getOwnedProject(id, session.user.id)
  if (!project) {
    return NextResponse.json({ error: 'Projet introuvable ou accès refusé' }, { status: 404 })
  }

  await prisma.portfolioProject.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
