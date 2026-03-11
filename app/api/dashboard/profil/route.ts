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
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  return NextResponse.json(profile)
}

export async function PUT(req: NextRequest) {
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
  const {
    displayName,
    bio,
    location,
    yearsExperience,
    status,
    specialties,
    mobility,
    website,
    linkedin,
    languages,
  } = body

  const updated = await prisma.technicianProfile.update({
    where: { id: profile.id },
    data: {
      displayName: displayName ?? profile.displayName,
      bio: bio ?? null,
      location: location || null,
      yearsExperience: typeof yearsExperience === 'number' ? yearsExperience : profile.yearsExperience,
      status: status ?? profile.status,
      specialties: Array.isArray(specialties) ? specialties : profile.specialties,
      mobility: typeof mobility === 'boolean' ? mobility : profile.mobility,
      website: website || null,
      linkedin: linkedin || null,
      languages: Array.isArray(languages) ? languages : profile.languages,
    },
  })

  return NextResponse.json(updated)
}
