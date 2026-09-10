import { Link } from 'react-router-dom';
import { User } from '../types';

type HomePageProps = {
  user: User | null;
  onLogout: () => void;
};

// Ligne d'icônes simples (style pictogramme, pas d'émojis), dans l'esprit
// des illustrations épurées de Vidal.
const Icon = {
  cours: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 10a4 4 0 0 1 4-4h11v34H12a4 4 0 0 0-4 4V10Z" />
      <path d="M40 10a4 4 0 0 0-4-4H25v34h11a4 4 0 0 1 4 4V10Z" />
    </svg>
  ),
  revisions: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M39 24a15 15 0 1 1-4.4-10.6" />
      <path d="M39 7v9h-9" />
    </svg>
  ),
  qcm: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="34" height="34" rx="4" />
      <path d="M15 24l6 6 12-13" />
    </svg>
  ),
  examens: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 6h14l4 4v32H13V10l4-4Z" />
      <path d="M19 18h10M19 25h10M19 32h6" />
    </svg>
  ),
  tp: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 6h10M21 6v13l-10 19a3 3 0 0 0 2.6 4.5h20.8A3 3 0 0 0 37 38l-10-19V6" />
      <path d="M16 33h16" />
    </svg>
  ),
  medicaments: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="18" width="34" height="14" rx="7" transform="rotate(-35 24 25)" />
      <path d="M24 25l6-6" />
    </svg>
  ),
  entraide: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 15a5 5 0 0 1 5-5h22a5 5 0 0 1 5 5v11a5 5 0 0 1-5 5H21l-8 7v-7h-3a5 5 0 0 1-5-5V15Z" />
    </svg>
  ),
  heroMark: (
    <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M48 10c-9 10-9 18-9 26a9 9 0 0 0 18 0c0-8 0-16-9-26Z" />
      <path d="M20 46c0 20 12 40 28 40s28-20 28-40" />
      <path d="M48 62V30" />
    </svg>
  ),
};

const features = [
  { title: 'Cours', description: 'Accédez à des contenus de qualité par matière et par semestre.', link: '/cours', icon: Icon.cours },
  { title: 'Révisions', description: 'Téléchargez et consolidez les supports de cours et fiches.', link: '/documents', icon: Icon.revisions },
  { title: 'QCM', description: 'Testez vos connaissances avec des quiz et des corrections.', link: '/qcm', icon: Icon.qcm },
  { title: 'Examens', description: 'Consultez les anciens examens et les corrigés associés.', link: '/examens', icon: Icon.examens },
  { title: 'TP', description: 'Approfondissez les travaux pratiques et la méthodologie.', link: '/dashboard', icon: Icon.tp },
  { title: 'Médicaments', description: 'Cherchez des informations essentielles sur les médicaments.', link: '/medicaments', icon: Icon.medicaments },
  { title: 'Entraide', description: 'Posez vos questions et partagez vos connaissances.', link: '/entraide', icon: Icon.entraide },
];

const tabs = [
  { label: 'Accueil', link: '/' },
  { label: 'Cours', link: '/cours' },
  { label: 'Réviser', link: '/qcm' },
  { label: 'Communauté', link: '/entraide' },
  { label: 'Profil', link: '/profile' },
];

const HomePage = ({ user, onLogout }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1B2A4A]">
      {/* Header : logo + navigation horizontale, dans l'esprit Vidal */}
      <header className="border-b border-[#E4E7EC] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#B3123A] text-base font-bold text-white">P</div>
            <span className="text-lg font-bold tracking-tight text-[#1B2A4A]">PharmaCampus</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {tabs.slice(1).map((t) => (
              <Link key={t.label} to={t.link} className="text-sm font-semibold text-[#1B2A4A] hover:text-[#B3123A]">
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden rounded-md border border-[#1B2A4A]/15 px-4 py-2 text-sm font-semibold text-[#1B2A4A] hover:bg-[#F1F3F6] sm:inline-block"
                >
                  Mon tableau de bord
                </Link>
                <button
                  onClick={onLogout}
                  className="rounded-md bg-[#B3123A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#941030]"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-md border border-[#1B2A4A]/15 px-4 py-2 text-sm font-semibold text-[#1B2A4A] hover:bg-[#F1F3F6] sm:inline-block"
                >
                  Se connecter
                </Link>
                <Link to="/register" className="rounded-md bg-[#B3123A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#941030]">
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero : icône à gauche, titre + description à droite, comme la page GPR de Vidal */}
        <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:items-center">
            <div className="mx-auto h-40 w-40 text-[#B3123A] lg:mx-0 lg:h-48 lg:w-48">{Icon.heroMark}</div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1B2A4A] sm:text-4xl">PharmaCampus</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#475467] sm:text-lg">
                Le compagnon d’étude des étudiants en pharmacie, du S1 au S10. Cours, examens, QCM, travaux
                pratiques et fiches médicaments, réunis avec une communauté d’entraide pour progresser à
                chaque semestre.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {user ? (
                  <Link to="/dashboard" className="rounded-md bg-[#B3123A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#941030]">
                    Mon tableau de bord
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="rounded-md bg-[#B3123A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#941030]">
                      Créer un compte
                    </Link>
                    <Link to="/login" className="rounded-md border border-[#1B2A4A]/15 px-5 py-2.5 text-sm font-semibold text-[#1B2A4A] hover:bg-[#F1F3F6]">
                      Se connecter
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Onglets secondaires */}
          <div className="mt-10 flex gap-6 overflow-x-auto border-b border-[#E4E7EC]">
            {tabs.map((t, i) => (
              <Link
                key={t.label}
                to={t.link}
                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-semibold ${
                  i === 0 ? 'border-[#B3123A] text-[#B3123A]' : 'border-transparent text-[#475467] hover:text-[#1B2A4A]'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Grille de cartes, illustrations simples en encart, comme les "Outils digitaux" de Vidal */}
        <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-[#1B2A4A]">Outils PharmaCampus</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="group rounded-lg border border-[#E4E7EC] bg-white p-6 transition hover:border-[#B3123A]/30 hover:shadow-md"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-[#F1F3F6] text-[#1E6FA8] group-hover:bg-[#1E6FA8]/10">
                  <div className="h-8 w-8">{feature.icon}</div>
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-[#1B2A4A]">{feature.title}</h3>
                <p className="text-sm leading-6 text-[#475467]">{feature.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
