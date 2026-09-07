import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Bell, BookOpen, FileText, Home, LogOut, Menu, Settings, ShieldCheck, UserRound, Users, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type LayoutProps = {
  user: User;
  title: string;
  children: React.ReactNode;
  onLogout: () => void;
};

const navItems = [
  { to: '/dashboard', label: 'Accueil', icon: '⌂' },
  { to: '/cours', label: 'Cours', icon: '▤' },
  { to: '/documents', label: 'Réviser', icon: '◒' },
  { to: '/entraide', label: 'Communauté', icon: '♧' },
  { to: '/profil', label: 'Profil', icon: '◉' }
];

const Layout = ({ user, title, children, onLogout }: LayoutProps) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; link?: string; is_read?: number }>>([]);

  useEffect(() => {
    apiFetch<{ notifications: Array<{ id: string; title: string; message: string; link?: string; is_read?: number }> }>('/notifications')
      .then((response) => setNotifications(response.notifications)).catch(() => undefined);
  }, []);

  const markRead = async (id?: string) => {
    await apiFetch('/notifications/read', { method: 'PATCH', body: JSON.stringify(id ? { id } : {}) });
    setNotifications((current) => current.map((item) => id && item.id !== id ? item : { ...item, is_read: 1 }));
  };

  const menuItems = user.role === 'admin'
    ? [{ to: '/admin', label: 'Dashboard', icon: ShieldCheck }, { to: '/admin', label: 'Contributions à examiner', icon: FileText }, { to: '/notifications', label: 'Notifications', icon: Bell }, { to: '/settings', label: 'Paramètres administrateur', icon: Settings }]
    : [
      { to: '/dashboard', label: 'Accueil', icon: Home },
      { to: '/profil', label: 'Mon profil', icon: UserRound },
      { to: '/entraide', label: 'Communauté', icon: Users },
      { to: '/cours', label: 'Mes cours', icon: BookOpen },
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/remarques', label: 'Remarques', icon: FileText },
      { to: '/settings', label: 'Paramètres', icon: Settings }
    ];

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      {menuOpen && <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-80 max-w-[86vw] border-r border-white/10 bg-[#071412] p-5 shadow-2xl transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-7 flex items-center justify-between"><div className="text-xl font-black text-emerald-50">PharmaCampus</div><button className="secondary-btn px-3" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu"><X size={18} /></button></div>
        <p className="section-label mb-3">{user.role === 'admin' ? 'Espace administrateur' : 'Espace étudiant'}</p>
        <nav className="space-y-1">{menuItems.map((item) => <NavLink key={`${item.to}-${item.label}`} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-brand-300/15 text-brand-300' : 'text-slate-300 hover:bg-brand-300/10 hover:text-brand-300'}`}><item.icon size={18} aria-hidden="true" />{item.label}</NavLink>)}</nav>
        <button className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-200 hover:bg-red-400/10" onClick={onLogout}><LogOut size={18} />Déconnexion</button>
      </aside>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071412]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <button className="secondary-btn px-3" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu"><Menu size={20} /></button>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-300 text-sm font-black text-[#06211b] shadow-lg shadow-brand-400/20">P</div>
            <div>
              <div className="text-lg font-black tracking-tight text-emerald-50">PharmaCampus</div>
              <div className="hidden text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:block">Apprendre • Réviser • Pratiquer</div>
            </div>
          </Link>

          <div className="hidden flex-1 lg:block" />

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="secondary-btn relative px-3" onClick={() => setNotificationsOpen((open) => !open)} aria-label="Notifications"><Bell size={19} />{notifications.some((item) => !item.is_read) && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-400 px-1 text-[10px] font-black text-white">{notifications.filter((item) => !item.is_read).length}</span>}</button>
              {notificationsOpen && <div className="absolute right-0 top-14 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#10231f] p-3 shadow-2xl"><div className="mb-2 flex items-center justify-between"><strong className="text-emerald-50">Notifications</strong><button className="text-xs text-brand-300" onClick={() => markRead()}>Tout lire</button></div>{notifications.slice(0, 6).map((item) => <button key={item.id} className={`block w-full rounded-xl p-3 text-left ${item.is_read ? 'opacity-60' : 'bg-white/5'}`} onClick={() => { markRead(item.id); setNotificationsOpen(false); if (item.link) navigate(item.link); }}><div className="text-sm font-bold text-emerald-50">{item.title}</div><div className="text-xs text-slate-400">{item.message}</div></button>)}{!notifications.length && <p className="p-3 text-sm text-slate-500">Aucune notification.</p>}</div>}
            </div>
            <Link to="/profil" className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1.5 transition hover:border-brand-300/40 hover:bg-white/10">
              {user.photo_url ? <img src={user.photo_url} alt={`Profil de ${user.first_name}`} className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-300/30" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-300/20 text-brand-300" aria-label="Profil sans photo"><UserRound size={17} /></span>}
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
            <Link to="/cours" className="secondary-btn">Cours S1-S10</Link>
            {user.role !== 'admin' && <Link to="/contributions" className="secondary-btn">Mes contributions</Link>}
            {user.role === 'admin' && <Link to="/admin" className="primary-btn">Espace admin</Link>}
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
