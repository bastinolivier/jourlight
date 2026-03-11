import Link from 'next/link'

const specialties = [
  { key: 'SON', label: 'Son', emoji: '🎵', desc: 'Ingénieurs son, sonorisateurs' },
  { key: 'LUMIERE', label: 'Lumière', emoji: '💡', desc: 'Régisseurs lumière, opérateurs' },
  { key: 'PLATEAU', label: 'Plateau', emoji: '🎭', desc: 'Régisseurs plateau, machinistes' },
  { key: 'VIDEO', label: 'Vidéo', emoji: '🎬', desc: 'Techniciens vidéo, VJ' },
  { key: 'RIGGING', label: 'Rigging', emoji: '🔗', desc: 'Riggers, accrocheurs' },
  { key: 'MACHINERIE', label: 'Machinerie', emoji: '⚙️', desc: 'Machinistes, constructeurs' },
]

const steps = [
  {
    num: '01',
    title: 'Créez votre profil',
    desc: 'Renseignez vos spécialités, compétences et expériences en quelques minutes.',
  },
  {
    num: '02',
    title: 'Mettez à jour vos disponibilités',
    desc: 'Indiquez vos dates libres en temps réel pour être contacté au bon moment.',
  },
  {
    num: '03',
    title: 'Les productions vous contactent',
    desc: 'Recevez des demandes de mission directement dans votre tableau de bord.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#e8e8f0' }}>
      {/* NAV */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: '#2a2a38' }}
      >
        <span className="text-xl font-bold tracking-widest" style={{ color: '#6366f1' }}>
          JOURLIGHT
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/techniciens"
            className="text-sm hover:text-white transition-colors"
            style={{ color: '#a0a0b8' }}
          >
            Trouver un technicien
          </Link>
          <Link
            href="/login"
            className="text-sm hover:text-white transition-colors"
            style={{ color: '#a0a0b8' }}
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            Créer mon profil
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div
          className="inline-block text-xs font-semibold tracking-widest px-3 py-1 rounded-full mb-6"
          style={{ background: '#1a1a24', color: '#6366f1', border: '1px solid #2a2a38' }}
        >
          PLATEFORME PRO
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          La plateforme des{' '}
          <span style={{ color: '#6366f1' }}>techniciens du spectacle</span>
        </h1>
        <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: '#a0a0b8' }}>
          Trouvez les meilleurs professionnels du son, lumière, plateau et vidéo pour vos
          productions.
        </p>

        {/* SEARCH BAR */}
        <form
          action="/techniciens"
          method="GET"
          className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
        >
          <select
            name="specialty"
            className="flex-shrink-0 px-4 py-3 rounded-lg text-sm font-medium"
            style={{
              background: '#1a1a24',
              color: '#e8e8f0',
              border: '1px solid #2a2a38',
            }}
          >
            <option value="">Toutes spécialités</option>
            <option value="SON">SON</option>
            <option value="LUMIERE">LUMIERE</option>
            <option value="PLATEAU">PLATEAU</option>
            <option value="VIDEO">VIDEO</option>
            <option value="RIGGING">RIGGING</option>
            <option value="MACHINERIE">MACHINERIE</option>
          </select>
          <input
            type="text"
            name="location"
            placeholder="Ville, région…"
            className="flex-1 px-4 py-3 rounded-lg text-sm"
            style={{
              background: '#1a1a24',
              color: '#e8e8f0',
              border: '1px solid #2a2a38',
            }}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            Rechercher
          </button>
        </form>
      </section>

      {/* SPECIALTY CARDS */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Parcourir par spécialité</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {specialties.map((s) => (
            <Link
              key={s.key}
              href={`/techniciens?specialty=${s.key}`}
              className="group p-6 rounded-xl border transition-all hover:border-indigo-500"
              style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
            >
              <div className="text-3xl mb-3">{s.emoji}</div>
              <div className="font-bold text-sm tracking-wide mb-1">{s.label}</div>
              <div className="text-xs" style={{ color: '#6b6b88' }}>
                {s.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="px-6 py-20 border-t"
        style={{ borderColor: '#2a2a38' }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-12 text-center">Comment ça marche</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div
                  className="text-4xl font-bold mb-4"
                  style={{ color: '#6366f1', opacity: 0.6 }}
                >
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b6b88' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div
          className="max-w-2xl mx-auto p-10 rounded-2xl border"
          style={{ background: '#1a1a24', borderColor: '#2a2a38' }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Prêt à rejoindre la plateforme&nbsp;?
          </h2>
          <p className="text-sm mb-8" style={{ color: '#a0a0b8' }}>
            Créez votre profil gratuitement et commencez à recevoir des missions.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            Créer mon profil gratuitement
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="px-6 py-8 border-t text-center text-sm"
        style={{ borderColor: '#2a2a38', color: '#6b6b88' }}
      >
        <span className="font-bold tracking-widest" style={{ color: '#6366f1' }}>
          JOURLIGHT
        </span>
        {' '}— La plateforme des techniciens du spectacle © 2025
      </footer>
    </div>
  )
}
