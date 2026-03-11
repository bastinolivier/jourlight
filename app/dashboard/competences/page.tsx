import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/prisma'
import CompetencesManager from './CompetencesManager'

export default async function CompetencesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: { orderBy: [{ category: 'asc' }, { order: 'asc' }, { name: 'asc' }] } },
  })

  if (!profile) redirect('/login')

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Mes compétences</h1>
        <p className="text-sm" style={{ color: '#6b6b88' }}>
          Logiciels, matériel, certifications et techniques maîtrisés.
        </p>
      </div>
      <CompetencesManager profileId={profile.id} initialSkills={profile.skills} />
    </div>
  )
}
