import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id } = await params

  const contact = await prisma.contactRequest.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  })

  if (!contact) {
    return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
  }

  if (contact.profile.userId !== session.user.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await req.json()
  const { status } = body

  const validStatuses = ['PENDING', 'READ', 'REPLIED', 'ARCHIVED']
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  const updated = await prisma.contactRequest.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json(updated)
}
