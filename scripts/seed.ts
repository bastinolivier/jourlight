import { PrismaClient, Specialty, TechnicianStatus, SkillCategory, SkillLevel, ProjectType, AvailabilityStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function makeSlug(firstName: string, lastName: string): string {
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  return `${normalize(firstName)}-${normalize(lastName)}`
}

// Availability helpers: March 2026 = current month, April 2026 = next month
function datesForMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(Date.UTC(year, month - 1, d)))
  }
  return days
}

function randomStatus(weights: [AvailabilityStatus, number][]): AvailabilityStatus {
  const total = weights.reduce((sum, [, w]) => sum + w, 0)
  let r = Math.random() * total
  for (const [status, w] of weights) {
    r -= w
    if (r <= 0) return status
  }
  return weights[0][0]
}

const TECHNICIANS = [
  {
    firstName: 'Thomas',
    lastName: 'Leroy',
    email: 'thomas.leroy@example.com',
    specialties: [Specialty.SON] as Specialty[],
    status: TechnicianStatus.INTERMITTENT,
    bio: "Ingénieur son FOH avec 12 ans d'expérience sur les plus grandes scènes françaises et européennes. Passionné par la recherche sonore et l'acoustique live, j'ai travaillé avec des artistes de renom lors de tournées internationales et de festivals emblématiques.",
    yearsExperience: 12,
    location: 'Paris',
    mobility: true,
    languages: ['Français', 'Anglais'],
    skills: [
      { category: SkillCategory.SOFTWARE, name: 'DiGiCo SD12', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'Avid S6L', level: SkillLevel.EXPERT },
      { category: SkillCategory.HARDWARE, name: 'L-Acoustics K2', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'Dante', level: SkillLevel.CONFIRME },
      { category: SkillCategory.SOFTWARE, name: 'QLab', level: SkillLevel.CONFIRME },
      { category: SkillCategory.CERTIFICATION, name: 'Travail en hauteur', level: SkillLevel.CONFIRME },
    ],
    projects: [
      { title: 'Hellfest 2024', role: 'Ingénieur FOH', type: ProjectType.FESTIVAL, year: 2024, client: 'Hellfest Productions', venue: 'Clisson', location: 'Clisson, Loire-Atlantique' },
      { title: 'Indochine – Noir Tour', role: 'Ingénieur FOH', type: ProjectType.TOURNEE, year: 2023, client: 'Indochine', venue: 'Accor Arena', location: 'Paris' },
      { title: 'Francofolies 2023', role: 'Ingénieur son Grande Scène', type: ProjectType.FESTIVAL, year: 2023, client: 'Francofolies de La Rochelle', venue: 'Grande Scène', location: 'La Rochelle' },
      { title: 'Victoires de la Musique 2022', role: 'Ingénieur FOH', type: ProjectType.SPECTACLE, year: 2022, client: 'France Télévisions', venue: 'La Seine Musicale', location: 'Boulogne-Billancourt' },
    ],
    availWeights: [[AvailabilityStatus.AVAILABLE, 60], [AvailabilityStatus.BUSY, 30], [AvailabilityStatus.UNAVAILABLE, 10]] as [AvailabilityStatus, number][],
  },
  {
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@example.com',
    specialties: [Specialty.LUMIERE] as Specialty[],
    status: TechnicianStatus.FREELANCE,
    bio: "Programmeuse lumière sur GrandMA2 et MA3 depuis 10 ans, spécialisée dans la conception de shows lumière spectaculaires pour la scène contemporaine. Mon approche mêle rigueur technique et sensibilité artistique pour créer des atmosphères uniques.",
    yearsExperience: 10,
    location: 'Lyon',
    mobility: true,
    languages: ['Français', 'Anglais', 'Allemand'],
    skills: [
      { category: SkillCategory.SOFTWARE, name: 'GrandMA2', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'GrandMA3', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'WYSIWYG', level: SkillLevel.CONFIRME },
      { category: SkillCategory.SOFTWARE, name: 'Depence', level: SkillLevel.CONFIRME },
      { category: SkillCategory.HARDWARE, name: 'Robe BMFL', level: SkillLevel.EXPERT },
      { category: SkillCategory.HARDWARE, name: 'Ayrton Mistral', level: SkillLevel.CONFIRME },
      { category: SkillCategory.HARDWARE, name: 'Martin MAC Viper', level: SkillLevel.EXPERT },
    ],
    projects: [
      { title: 'Cirque du Soleil – Alegría', role: 'Programmeuse lumière', type: ProjectType.SPECTACLE, year: 2024, client: 'Cirque du Soleil', venue: 'Chapiteau', location: 'Paris' },
      { title: 'Les Nuits de Fourvière 2023', role: 'Opératrice lumière', type: ProjectType.FESTIVAL, year: 2023, client: 'Nuits de Fourvière', venue: 'Théâtre antique', location: 'Lyon' },
      { title: 'Stromae – Multitude Tour', role: 'Programmeuse MA3', type: ProjectType.TOURNEE, year: 2023, client: 'Stromae Productions', venue: 'Accor Arena', location: 'Paris' },
      { title: 'Solidays 2022', role: 'Opératrice lumière Scène Principale', type: ProjectType.FESTIVAL, year: 2022, client: 'Solidarité Sida', venue: 'Hippodrome de Longchamp', location: 'Paris' },
      { title: 'Opéra de Lyon – Saison 2021', role: 'Programmeuse lumière', type: ProjectType.SPECTACLE, year: 2021, client: 'Opéra de Lyon', venue: 'Opéra National de Lyon', location: 'Lyon' },
    ],
    availWeights: [[AvailabilityStatus.AVAILABLE, 50], [AvailabilityStatus.BUSY, 40], [AvailabilityStatus.UNAVAILABLE, 10]] as [AvailabilityStatus, number][],
  },
  {
    firstName: 'Lucas',
    lastName: 'Martin',
    email: 'lucas.martin@example.com',
    specialties: [Specialty.VIDEO] as Specialty[],
    status: TechnicianStatus.INTERMITTENT,
    bio: "Opérateur disguise et spécialiste des installations vidéo immersives depuis 8 ans. J'interviens sur des productions exigeantes alliant mapping vidéo, LED walls et contenus interactifs temps réel pour des concerts, spectacles et événements corporate.",
    yearsExperience: 8,
    location: 'Marseille',
    mobility: true,
    languages: ['Français', 'Anglais'],
    skills: [
      { category: SkillCategory.SOFTWARE, name: 'disguise (d3)', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'Resolume Arena', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'QLab', level: SkillLevel.CONFIRME },
      { category: SkillCategory.HARDWARE, name: 'LED Wall Absen', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'Notch', level: SkillLevel.CONFIRME },
      { category: SkillCategory.TECHNIQUE, name: 'Mapping vidéo architectural', level: SkillLevel.EXPERT },
    ],
    projects: [
      { title: 'Coachella 2024 – Scène Principale', role: 'Opérateur disguise', type: ProjectType.FESTIVAL, year: 2024, client: 'Goldenvoice', venue: 'Empire Polo Club', location: 'Indio, Californie, USA' },
      { title: 'NTI Audio Show 2023', role: 'Technicien vidéo', type: ProjectType.EVENEMENT, year: 2023, client: 'NTI Audio', venue: 'Palais des Congrès', location: 'Paris' },
      { title: 'Roland Garros – Cérémonie ouverture', role: 'Opérateur vidéo', type: ProjectType.EVENEMENT, year: 2023, client: 'Fédération Française de Tennis', venue: 'Court Philippe-Chatrier', location: 'Paris' },
      { title: 'Massive Attack – Mezzanine XXI', role: 'Opérateur disguise', type: ProjectType.TOURNEE, year: 2022, client: 'Massive Attack', venue: 'Grand Rex', location: 'Paris' },
    ],
    availWeights: [[AvailabilityStatus.AVAILABLE, 40], [AvailabilityStatus.BUSY, 50], [AvailabilityStatus.UNAVAILABLE, 10]] as [AvailabilityStatus, number][],
  },
  {
    firstName: 'Sarah',
    lastName: 'Petit',
    email: 'sarah.petit@example.com',
    specialties: [Specialty.PLATEAU, Specialty.MACHINERIE] as Specialty[],
    status: TechnicianStatus.SALARIE,
    bio: "Chef machiniste avec 15 ans d'expérience en production de spectacle vivant. Coordinatrice de plateau rigoureuse, je supervise les équipes technique lors des montages et démontages de décors complexes pour les plus grandes productions nationales.",
    yearsExperience: 15,
    location: 'Bordeaux',
    mobility: false,
    languages: ['Français', 'Espagnol'],
    skills: [
      { category: SkillCategory.CERTIFICATION, name: 'CACES R482 (Nacelles)', level: SkillLevel.EXPERT },
      { category: SkillCategory.CERTIFICATION, name: 'Travail en hauteur', level: SkillLevel.EXPERT },
      { category: SkillCategory.CERTIFICATION, name: 'Secours en hauteur', level: SkillLevel.CONFIRME },
      { category: SkillCategory.TECHNIQUE, name: 'Gestion de plateau', level: SkillLevel.EXPERT },
      { category: SkillCategory.TECHNIQUE, name: 'Lecture de plans scéniques', level: SkillLevel.EXPERT },
      { category: SkillCategory.CERTIFICATION, name: 'SST (Sauveteur Secouriste)', level: SkillLevel.CONFIRME },
      { category: SkillCategory.TECHNIQUE, name: 'Automatismes scéniques', level: SkillLevel.CONFIRME },
    ],
    projects: [
      { title: 'Opéra National de Bordeaux – Saison 2024', role: 'Chef machiniste', type: ProjectType.SPECTACLE, year: 2024, client: 'Opéra National de Bordeaux', venue: 'Grand Théâtre de Bordeaux', location: 'Bordeaux' },
      { title: 'Festival Bordeaux Fête le Vin 2023', role: 'Responsable plateau', type: ProjectType.EVENEMENT, year: 2023, client: 'Mairie de Bordeaux', venue: 'Quais de Bordeaux', location: 'Bordeaux' },
      { title: 'Cavalia – Odysséo', role: 'Chef machiniste', type: ProjectType.SPECTACLE, year: 2022, client: 'Cavalia', venue: 'Grand Chapiteau', location: 'Bordeaux' },
      { title: 'Les Vieilles Charrues 2021', role: 'Responsable machinerie', type: ProjectType.FESTIVAL, year: 2021, client: 'Association Les Vieilles Charrues', venue: 'Site de Kerampuilh', location: 'Carhaix-Plouguer' },
    ],
    availWeights: [[AvailabilityStatus.AVAILABLE, 30], [AvailabilityStatus.BUSY, 20], [AvailabilityStatus.UNAVAILABLE, 50]] as [AvailabilityStatus, number][],
  },
  {
    firstName: 'Antoine',
    lastName: 'Moreau',
    email: 'antoine.moreau@example.com',
    specialties: [Specialty.RIGGING] as Specialty[],
    status: TechnicianStatus.FREELANCE,
    bio: "Rigger chef certifié avec 11 ans d'expérience dans le levage et la suspension de structures pour les spectacles et événements live. Expert en calculs de charges et sécurité des structures, j'interviens sur les plus grandes productions européennes.",
    yearsExperience: 11,
    location: 'Toulouse',
    mobility: true,
    languages: ['Français', 'Anglais'],
    skills: [
      { category: SkillCategory.CERTIFICATION, name: 'Rigging certifié (IGVW SQ P2)', level: SkillLevel.EXPERT },
      { category: SkillCategory.CERTIFICATION, name: 'Travail en hauteur', level: SkillLevel.EXPERT },
      { category: SkillCategory.CERTIFICATION, name: 'Secours en hauteur', level: SkillLevel.EXPERT },
      { category: SkillCategory.CERTIFICATION, name: 'CACES R484 (Ponts roulants)', level: SkillLevel.CONFIRME },
      { category: SkillCategory.TECHNIQUE, name: 'Calcul de charges et structures', level: SkillLevel.EXPERT },
      { category: SkillCategory.TECHNIQUE, name: 'Motorisation scénique', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'Autocad (plans de rigging)', level: SkillLevel.CONFIRME },
      { category: SkillCategory.CERTIFICATION, name: 'Habilitation électrique B1V', level: SkillLevel.CONFIRME },
    ],
    projects: [
      { title: 'Rammstein – European Stadium Tour', role: 'Rigger chef', type: ProjectType.TOURNEE, year: 2023, client: 'Rammstein', venue: 'Stadium de Toulouse', location: 'Toulouse' },
      { title: 'Toulouse les Orgues 2023', role: 'Responsable rigging', type: ProjectType.FESTIVAL, year: 2023, client: 'Festival Toulouse les Orgues', venue: 'Cathédrale Saint-Étienne', location: 'Toulouse' },
      { title: 'TRNSMT Festival Glasgow', role: 'Rigger senior', type: ProjectType.FESTIVAL, year: 2022, client: 'DF Concerts', venue: 'Glasgow Green', location: 'Glasgow, Écosse' },
      { title: 'NTI Audio – Salon professionnel', role: 'Responsable rigging structures', type: ProjectType.EVENEMENT, year: 2022, client: 'NTI Audio', venue: 'Parc des Expositions', location: 'Paris' },
      { title: 'Zac Brown Band – US Tour (rigger invité)', role: 'Rigger', type: ProjectType.TOURNEE, year: 2021, client: 'Southern Ground', venue: 'Venues US', location: 'États-Unis' },
    ],
    availWeights: [[AvailabilityStatus.AVAILABLE, 55], [AvailabilityStatus.BUSY, 35], [AvailabilityStatus.UNAVAILABLE, 10]] as [AvailabilityStatus, number][],
  },
  {
    firstName: 'Emma',
    lastName: 'Bernard',
    email: 'emma.bernard@example.com',
    specialties: [Specialty.SON] as Specialty[],
    status: TechnicianStatus.INTERMITTENT,
    bio: "Ingénieure son moniteurs avec 7 ans d'expérience à la régie retours sur scène. Spécialisée dans les systèmes In-Ear Monitoring et les mixes personnalisés pour artistes exigeants, j'ai travaillé en France et à l'international sur des tournées et festivals majeurs.",
    yearsExperience: 7,
    location: 'Nantes',
    mobility: true,
    languages: ['Français', 'Anglais', 'Portugais'],
    skills: [
      { category: SkillCategory.SOFTWARE, name: 'DiGiCo SD11', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'Avid S6L (monitor)', level: SkillLevel.CONFIRME },
      { category: SkillCategory.HARDWARE, name: 'Sennheiser IEM G4', level: SkillLevel.EXPERT },
      { category: SkillCategory.HARDWARE, name: 'Shure PSM1000', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'Dante', level: SkillLevel.CONFIRME },
      { category: SkillCategory.HARDWARE, name: 'L-Acoustics (monitoring)', level: SkillLevel.CONFIRME },
    ],
    projects: [
      { title: 'Les Vieilles Charrues 2024', role: 'Ingénieure moniteurs', type: ProjectType.FESTIVAL, year: 2024, client: 'Association Les Vieilles Charrues', venue: 'Site de Kerampuilh', location: 'Carhaix-Plouguer' },
      { title: 'Clara Luciani – Cœur Tour', role: 'Ingénieure moniteurs', type: ProjectType.TOURNEE, year: 2023, client: 'PIAS', venue: 'Zénith de Nantes', location: 'Nantes' },
      { title: 'Solidays 2023', role: 'Ingénieure son retours', type: ProjectType.FESTIVAL, year: 2023, client: 'Solidarité Sida', venue: 'Hippodrome de Longchamp', location: 'Paris' },
      { title: 'Francofolies 2022', role: 'Ingénieure moniteurs', type: ProjectType.FESTIVAL, year: 2022, client: 'Francofolies de La Rochelle', venue: 'Grande Scène', location: 'La Rochelle' },
    ],
    availWeights: [[AvailabilityStatus.AVAILABLE, 70], [AvailabilityStatus.BUSY, 20], [AvailabilityStatus.UNAVAILABLE, 10]] as [AvailabilityStatus, number][],
  },
  {
    firstName: 'Jules',
    lastName: 'Rousseau',
    email: 'jules.rousseau@example.com',
    specialties: [Specialty.LUMIERE] as Specialty[],
    status: TechnicianStatus.FREELANCE,
    bio: "Opérateur lumière polyvalent avec 6 ans de terrain sur Hog4 et ETC Eos. Habitué des salles de taille moyenne et des festivals, je m'adapte rapidement aux conditions d'exploitation et aux demandes artistiques variées. Curieux et rigoureux.",
    yearsExperience: 6,
    location: 'Lille',
    mobility: true,
    languages: ['Français', 'Anglais'],
    skills: [
      { category: SkillCategory.SOFTWARE, name: 'Hog4', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'ETC Eos', level: SkillLevel.EXPERT },
      { category: SkillCategory.SOFTWARE, name: 'GrandMA2', level: SkillLevel.CONFIRME },
      { category: SkillCategory.SOFTWARE, name: 'MA Lighting', level: SkillLevel.NOTIONS },
      { category: SkillCategory.HARDWARE, name: 'Robe Pointe', level: SkillLevel.CONFIRME },
      { category: SkillCategory.HARDWARE, name: 'Martin MAC Quantum', level: SkillLevel.CONFIRME },
      { category: SkillCategory.CERTIFICATION, name: 'Travail en hauteur', level: SkillLevel.CONFIRME },
    ],
    projects: [
      { title: 'Eurosonic Noorderslag 2024', role: 'Opérateur lumière', type: ProjectType.FESTIVAL, year: 2024, client: 'Eurosonic Noorderslag', venue: 'Groningen', location: 'Groningen, Pays-Bas' },
      { title: 'Festival de Lille 2023', role: 'Opérateur lumière', type: ProjectType.FESTIVAL, year: 2023, client: 'Mairie de Lille', venue: 'Place du Général de Gaulle', location: 'Lille' },
      { title: 'Ariana Grande – Dangerous Woman Tour (assistant)', role: 'Assistant lumière', type: ProjectType.TOURNEE, year: 2023, client: 'Republic Records', venue: 'Accor Arena', location: 'Paris' },
      { title: 'La Route du Rock 2022', role: 'Opérateur lumière', type: ProjectType.FESTIVAL, year: 2022, client: 'La Route du Rock', venue: 'Fort Saint-Père', location: 'Saint-Malo' },
    ],
    availWeights: [[AvailabilityStatus.AVAILABLE, 65], [AvailabilityStatus.BUSY, 25], [AvailabilityStatus.UNAVAILABLE, 10]] as [AvailabilityStatus, number][],
  },
  {
    firstName: 'Camille',
    lastName: 'Simon',
    email: 'camille.simon@example.com',
    specialties: [Specialty.VIDEO] as Specialty[],
    status: TechnicianStatus.INTERMITTENT,
    bio: "Technicienne LED et vidéo scénique avec 5 ans d'expérience dans l'installation, la configuration et l'exploitation de murs LED et d'écrans scéniques. Spécialisée dans les systèmes Novastar et les architectures vidéo complexes multi-sources.",
    yearsExperience: 5,
    location: 'Strasbourg',
    mobility: true,
    languages: ['Français', 'Allemand', 'Anglais'],
    skills: [
      { category: SkillCategory.HARDWARE, name: 'LED Wall Novastar', level: SkillLevel.EXPERT },
      { category: SkillCategory.HARDWARE, name: 'LED Wall Brompton', level: SkillLevel.CONFIRME },
      { category: SkillCategory.SOFTWARE, name: 'Resolume Avenue', level: SkillLevel.CONFIRME },
      { category: SkillCategory.SOFTWARE, name: 'disguise (d3)', level: SkillLevel.NOTIONS },
      { category: SkillCategory.TECHNIQUE, name: 'Câblage vidéo HD-SDI / HDMI', level: SkillLevel.EXPERT },
      { category: SkillCategory.TECHNIQUE, name: 'Scaleurs et distribution vidéo', level: SkillLevel.CONFIRME },
    ],
    projects: [
      { title: 'Musikmesse Frankfurt 2024', role: 'Technicienne LED', type: ProjectType.EVENEMENT, year: 2024, client: 'Messe Frankfurt', venue: 'Messe Frankfurt', location: 'Francfort, Allemagne' },
      { title: 'Festival Rhin d\'Amour 2023', role: 'Technicienne vidéo', type: ProjectType.FESTIVAL, year: 2023, client: 'Ville de Strasbourg', venue: 'Bords du Rhin', location: 'Strasbourg' },
      { title: 'Victoires de la Musique Classique 2023', role: 'Opératrice LED', type: ProjectType.SPECTACLE, year: 2023, client: 'France 3 Alsace', venue: 'Palais de la Musique et des Congrès', location: 'Strasbourg' },
      { title: 'Marché de Noël de Strasbourg – Show lumières', role: 'Technicienne vidéo', type: ProjectType.EVENEMENT, year: 2022, client: 'Mairie de Strasbourg', venue: 'Place Kléber', location: 'Strasbourg' },
      { title: 'NTI Audio Roadshow 2022', role: 'Technicienne vidéo', type: ProjectType.EVENEMENT, year: 2022, client: 'NTI Audio', venue: 'Divers', location: 'France' },
    ],
    availWeights: [[AvailabilityStatus.AVAILABLE, 75], [AvailabilityStatus.BUSY, 15], [AvailabilityStatus.UNAVAILABLE, 10]] as [AvailabilityStatus, number][],
  },
]

async function main() {
  console.log('🗑️  Clearing existing data...')
  await prisma.contactRequest.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.media.deleteMany()
  await prisma.portfolioProject.deleteMany()
  await prisma.technicianProfile.deleteMany()
  await prisma.loginLog.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 12)
  console.log('🔐 Password hashed')

  const marchDates = datesForMonth(2026, 3)
  const aprilDates = datesForMonth(2026, 4)
  const allDates = [...marchDates, ...aprilDates]

  for (const tech of TECHNICIANS) {
    const slug = makeSlug(tech.firstName, tech.lastName)
    console.log(`👤 Creating ${tech.firstName} ${tech.lastName} (${slug})...`)

    const user = await prisma.user.create({
      data: {
        email: tech.email,
        password: hashedPassword,
        profile: {
          create: {
            slug,
            displayName: `${tech.firstName} ${tech.lastName}`,
            bio: tech.bio,
            specialties: tech.specialties,
            status: tech.status,
            yearsExperience: tech.yearsExperience,
            location: tech.location,
            mobility: tech.mobility,
            languages: tech.languages,
            isPublic: true,
            isVerified: true,
          },
        },
      },
      include: { profile: true },
    })

    const profileId = user.profile!.id

    // Create skills
    await prisma.skill.createMany({
      data: tech.skills.map((s, i) => ({
        profileId,
        category: s.category,
        name: s.name,
        level: s.level,
        order: i,
      })),
    })

    // Create portfolio projects
    for (const [i, proj] of tech.projects.entries()) {
      await prisma.portfolioProject.create({
        data: {
          profileId,
          title: proj.title,
          role: proj.role,
          type: proj.type,
          year: proj.year,
          client: proj.client,
          venue: proj.venue,
          location: proj.location,
          featured: i === 0,
          order: i,
        },
      })
    }

    // Create availability for March + April 2026
    await prisma.availability.createMany({
      data: allDates.map((date) => ({
        profileId,
        date,
        status: randomStatus(tech.availWeights),
      })),
    })

    console.log(`   ✅ Done: ${tech.skills.length} skills, ${tech.projects.length} projects, ${allDates.length} availability entries`)
  }

  console.log('\n✅ Seed complete! Created 8 technicians.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
