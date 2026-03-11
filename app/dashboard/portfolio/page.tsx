import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import PortfolioManager from './PortfolioManager'

export default async function PortfolioPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      projects: { orderBy: [{ featured: 'desc' }, { year: 'desc' }, { order: 'asc' }] },
    },
  })

  if (!profile) redirect('/login')

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Mon portfolio</h1>
        <p className="text-sm" style={{ color: '#6b6b88' }}>
          Vos projets et expériences professionnelles.
        </p>
      </div>
      <PortfolioManager profileId={profile.id} initialProjects={profile.projects} />
    </div>
  )
}
