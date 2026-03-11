import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id } = await params

  const skill = await prisma.skill.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  })

  if (!skill) {
    return NextResponse.json({ error: 'Compétence introuvable' }, { status: 404 })
  }

  if (skill.profile.userId !== session.user.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  await prisma.skill.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
