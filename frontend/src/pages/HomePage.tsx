import { Link } from 'react-router-dom';
import { User } from '../types';

type HomePageProps = {
  user: User | null;
  onLogout: () => void;
};

const features = [
  { title: 'Cours', description: 'Accédez à des contenus de qualité par matière et par semestre.', link: '/dashboard', icon: '▤' },
  { title: 'Révisions', description: 'Téléchargez et consolidez les supports de cours et fiches.', link: '/documents', icon: '◒' },
  { title: 'QCM', description: 'Testez vos connaissances avec des quiz et des corrections.', link: '/qcm', icon: '✓' },
  { title: 'Examens', description: 'Consultez les anciens examens et les corrigés associés.', link: '/examens', icon: '⌁' },
  { title: 'TP', description: 'Approfondissez les travaux pratiques et la méthodologie.', link: '/dashboard', icon: '⚗' },
  { title: 'Médicaments', description: 'Cherchez des informations essentielles sur les médicaments.', link: '/medicaments', icon: '✚' },
  { title: 'Entraide', description: 'Posez vos questions et partagez vos connaissances.', link: '/entraide', icon: '♧' }
];

const HomePage = ({ user, onLogout }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <header className="border-b border-white/10 bg-[#071412]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-300 text-lg font-black text-[#06211b] shadow-lg shadow-brand-400/20">P</div>
            <div>
              <div className="text-xl font-black tracking-tight text-emerald-50">PharmaCampus</div>
              <div className="hidden text-[10px] uppercase tracking-[0.28em] text-slate-500 sm:block">Apprendre • Réviser • Pratiquer</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="secondary-btn">Mon tableau de bord</Link>
                <button className="primary-btn" onClick={onLogout}>Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login" className="secondary-btn">Se connecter</Link>
                <Link to="/register" className="primary-btn">Créer un compte</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="badge bg-brand-300/10 text-brand-300">Plateforme d’apprentissage pharmaceutique</span>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-emerald-50 sm:text-6xl">Ton campus pour apprendre, réviser et progresser.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              PharmaCampus accompagne les étudiants en pharmacie dans leur parcours académique avec des cours, des examens, des QCM, des documents, des TP et une communauté d’entraide.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login" className="primary-btn">Se connecter</Link>
              <Link to="/register" className="secondary-btn">Créer un compte</Link>
              <Link to="/dashboard" className="secondary-btn">Découvrir la plateforme</Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-300/20 bg-brand-300/[0.07] p-5 shadow-2xl shadow-black/20 sm:p-7">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-brand-300/20 bg-brand-300/10" />
            <div className="relative mb-6 flex items-end justify-between">
              <div>
                <p className="section-label">Ton espace d’étude</p>
                <h2 className="mt-2 text-2xl font-black text-emerald-50">Tout au même endroit.</h2>
              </div>
              <span className="text-4xl" aria-hidden="true">⚕</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-muted p-5">
                <div className="text-3xl font-black text-brand-300">10</div>
                <div className="mt-2 text-sm text-slate-400">Semestres S1 à S10</div>
              </div>
              <div className="surface-muted p-5">
                <div className="text-3xl font-black text-sky-300">24/7</div>
                <div className="mt-2 text-sm text-slate-400">Accès étudiant</div>
              </div>
              <div className="surface-muted p-5">
                <div className="text-3xl font-black text-emerald-300">QCM</div>
                <div className="mt-2 text-sm text-slate-400">Scores en temps réel</div>
              </div>
              <div className="surface-muted p-5">
                <div className="text-3xl font-black text-amber-300">TP</div>
                <div className="mt-2 text-sm text-slate-400">Pratique guidée</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <p className="section-label">Un parcours complet</p>
          <h2 className="mt-2 text-3xl font-black text-emerald-50">Tout ce qu’il faut pour réussir</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Link to={feature.link} key={feature.title} className="card group p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-300/40 hover:bg-white/[0.09]">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-300/10 text-xl text-brand-300 transition group-hover:bg-brand-300 group-hover:text-[#06211b]">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-emerald-50">{feature.title}</h3>
                <p className="text-sm leading-6 text-slate-400">{feature.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
