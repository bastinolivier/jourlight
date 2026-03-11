import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

type Params = Promise<{ profileId: string }>

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { profileId } = await params
    const body = await request.json()
    const { senderName, senderEmail, senderOrg, message, missionDate, missionLocation, missionRole } =
      body

    if (!senderName || !senderEmail || !message) {
      return NextResponse.json(
        { error: 'Nom, email et message sont requis.' },
        { status: 400 },
      )
    }

    const profile = await prisma.technicianProfile.findUnique({ where: { id: profileId } })
    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 })
    }

    await prisma.contactRequest.create({
      data: {
        profileId,
        senderName,
        senderEmail,
        senderOrg: senderOrg || null,
        message,
        missionDate: missionDate ? new Date(missionDate) : null,
        missionLocation: missionLocation || null,
        missionRole: missionRole || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
