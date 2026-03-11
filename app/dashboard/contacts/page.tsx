import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import ContactsClient from './ContactsClient'

export default async function ContactsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) redirect('/login')

  const contacts = await prisma.contactRequest.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = contacts.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    missionDate: c.missionDate?.toISOString() ?? null,
  }))

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Contacts reçus</h1>
        <p className="text-sm" style={{ color: '#6b6b88' }}>
          Demandes de contact envoyées via votre profil public.
        </p>
      </div>
      <ContactsClient initialContacts={serialized} />
    </div>
  )
}
