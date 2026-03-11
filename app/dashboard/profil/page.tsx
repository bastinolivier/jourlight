import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import ProfilForm from './ProfilForm'

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: true },
  })

  if (!profile) redirect('/login')

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Mon profil</h1>
        <p className="text-sm" style={{ color: '#6b6b88' }}>
          Ces informations apparaissent sur votre profil public.
        </p>
      </div>
      <ProfilForm profile={profile} />
    </div>
  )
}
