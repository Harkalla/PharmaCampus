import { Link, NavLink } from 'react-router-dom';
import { User } from '../types';

type LayoutProps = {
  user: User;
  title: string;
  children: React.ReactNode;
  onLogout: () => void;
};

const navItems = [
  { to: '/dashboard', label: 'Accueil', icon: '⌂' },
  { to: '/niveaux/S5', label: 'Cours', icon: '▤' },
  { to: '/documents', label: 'Réviser', icon: '◒' },
  { to: '/entraide', label: 'Communauté', icon: '♧' },
  { to: '/profil', label: 'Profil', icon: '◉' }
];

const utilityItems = [
  { to: '/examens', label: 'Examens' },
  { to: '/qcm', label: 'QCM' },
  { to: '/medicaments', label: 'Médicaments' },
  { to: '/messages', label: 'Messages' },
  { to: '/recherche', label: 'Recherche' }
];

const Layout = ({ user, title, children, onLogout }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071412]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-300 text-sm font-black text-[#06211b] shadow-lg shadow-brand-400/20">P</div>
            <div>
              <div className="text-lg font-black tracking-tight text-emerald-50">PharmaCampus</div>
              <div className="hidden text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:block">Apprendre • Réviser • Pratiquer</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <nav className="hidden items-center gap-3 xl:flex" aria-label="Ressources">
            {utilityItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `rounded-lg px-2 py-1 text-xs font-semibold transition ${isActive ? 'bg-brand-300/15 text-brand-300' : 'text-slate-500 hover:text-emerald-50'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/profil" className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1.5 transition hover:border-brand-300/40 hover:bg-white/10">
              <img src={user.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'} alt={`Profil de ${user.first_name}`} className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-300/30" />
              <span className="hidden text-sm font-semibold text-emerald-50 md:block">{user.first_name}</span>
            </Link>
            <button className="secondary-btn hidden sm:inline-flex" onClick={onLogout}>Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-10 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">PharmaCampus / espace étudiant</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-emerald-50 sm:text-4xl">{title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/niveaux/S5" className="secondary-btn">Niveaux S1-S10</Link>
            <Link to="/admin" className="primary-btn">Espace admin</Link>
          </div>
        </div>

        {children}
      </main>

      <nav className="mobile-nav fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#071412]/95 px-2 pt-2 backdrop-blur-xl lg:hidden" aria-label="Navigation principale">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${isActive ? 'bg-brand-300/15 text-brand-300' : 'text-slate-500 hover:bg-white/5 hover:text-emerald-50'}`}>
              <span className="text-lg leading-none" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
