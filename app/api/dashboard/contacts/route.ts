import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'

export async function GET() {
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

  const contacts = await prisma.contactRequest.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(contacts)
}
