import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiFetch, formatDate } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { User } from '../types';
import { UserRound, BookOpen, Brain, FileText, ClipboardList, FlaskConical, Pill, Users, Send, FileCheck2, Lightbulb, ChevronRight } from 'lucide-react';

type DashboardProps = { user: User; onLogout: () => void; };

type DashboardData = {
  recentSubjects: Array<{ id: string; name: string; semester: string; description?: string }>; 
  recentDocuments: Array<{ id: string; title: string; description?: string; created_at?: string }>; 
  quizzes: Array<{ id: string; title: string; subject_id?: string; questions?: string }>; 
  questions: Array<{ id: string; title: string; content: string; created_at?: string }>; 
  notifications: Array<{ id: string; title: string; message: string; link?: string; created_at?: string }>; 
  attempts: Array<{ id: string; score: number; total: number; submitted_at?: string }>;
};

const DashboardPage = ({ user, onLogout }: DashboardProps) => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!supabase) {
        const response = await apiFetch<DashboardData>('/dashboard');
        setData(response);
        return;
      }

      const [subjectsResponse, documentsResponse, quizzesResponse, postsResponse, notificationsResponse, attemptsResponse] = await Promise.all([
        supabase.from('subjects').select('id, name, semester, description').order('created_at', { ascending: false }).limit(5),
        supabase.from('documents').select('id, title, description, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('quizzes').select('id, title, subject_id').order('created_at', { ascending: false }).limit(5),
        supabase.from('posts').select('id, title, content, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('notifications').select('id, title, message, link, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('quiz_results').select('id, score, total, submitted_at').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(5)
      ]);

      const firstError = [subjectsResponse, documentsResponse, quizzesResponse, postsResponse, notificationsResponse, attemptsResponse]
        .map((response) => response.error)
        .find(Boolean);
      if (firstError) throw new Error(firstError.message);

      setData({
        recentSubjects: subjectsResponse.data || [],
        recentDocuments: documentsResponse.data || [],
        quizzes: quizzesResponse.data || [],
        questions: postsResponse.data || [],
        notifications: notificationsResponse.data || [],
        attempts: attemptsResponse.data || []
      });
    };

    loadDashboard().catch(console.error);
  }, [user.id]);

  return (
    <Layout user={user} title="Tableau de bord" onLogout={onLogout}>
      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-brand-300/20 bg-brand-300/[0.09] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-brand-300/20 bg-brand-300/10" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
              {user.photo_url ? <img src={user.photo_url} alt={`Profil de ${user.first_name}`} className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-300/20" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full border border-brand-300/30 bg-brand-300/10 text-brand-300" aria-label="Profil sans photo"><UserRound size={30} /></div>}
              <div>
                <p className="section-label">Bonjour, {user.first_name}</p>
                <h2 className="mt-2 text-3xl font-black text-emerald-50">Prêt à progresser ?</h2>
                <p className="mt-2 text-sm text-slate-400">{user.university || 'Étudiant en pharmacie'} · {user.semester || 'S5'} · {user.level || 'Licence'}</p>
              </div>
            </div>
              <Link to="/profil" className="secondary-btn shrink-0">Voir mon profil</Link>
            </div>
            <div className="relative mt-8 max-w-xl">
              <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-emerald-50">Progression générale</span><span className="font-bold text-brand-300">32%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full w-[32%] rounded-full bg-brand-300 shadow-[0_0_18px_rgba(125,203,187,0.55)]" /></div>
              <p className="mt-2 text-xs text-slate-500">Continue comme ça, chaque session compte.</p>
            </div>
          </section>

          <section className="quick-access-panel">
            <h3 className="mb-4 text-lg font-bold text-[#142438]">Accès rapide</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Mes cours', desc: 'Cours et ressources pédagogiques.', to: '/niveaux/S5', icon: BookOpen, tint: 'mint' },
                { label: 'Réviser avec moi', desc: 'Quiz générés et révision.', to: '/documents', icon: Brain, tint: 'amber' },
                { label: 'Examens', desc: 'Examens et anciens sujets.', to: '/examens', icon: FileText, tint: 'rose' },
                { label: 'QCM', desc: 'QCM interactifs par module.', to: '/qcm', icon: ClipboardList, tint: 'amber' },
                { label: 'Travaux pratiques', desc: 'TP et travaux pratiques.', to: '/dashboard', icon: FlaskConical, tint: 'sky' },
                { label: 'Médicaments', desc: 'Base de données des médicaments.', to: '/medicaments', icon: Pill, tint: 'violet' },
                { label: 'Communauté', desc: 'Échangez avec les autres étudiants.', to: '/entraide', icon: Users, tint: 'sky' },
                { label: 'Envoyer un document', desc: 'Contribuez en envoyant un document.', to: '/contributions', icon: Send, tint: 'mint' },
                { label: 'Mes documents envoyés', desc: 'Suivez le statut de vos contributions.', to: '/contributions', icon: FileCheck2, tint: 'mint' },
                { label: 'Remarques et suggestions', desc: 'Partagez vos remarques et idées.', to: '/remarques', icon: Lightbulb, tint: 'violet' }
              ].map(({ label, desc, to, icon: Icon, tint }) => (
                <Link key={label} to={to} className="quick-access-card">
                  <span className={`quick-access-icon quick-access-icon--${tint}`}><Icon size={20} aria-hidden="true" /></span>
                  <span className="quick-access-text">
                    <span className="quick-access-title">{label}</span>
                    <span className="quick-access-desc">{desc}</span>
                  </span>
                  <ChevronRight size={18} className="quick-access-chevron" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-6 sm:p-7">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-black text-emerald-50">Dernières matières</h3><Link to="/niveaux/S5" className="text-sm font-semibold text-brand-300">Tout voir</Link></div>
            <div className="space-y-3">
              {data?.recentSubjects?.map((subject) => (
                <Link key={subject.id} to={`/matiere/${subject.id}`} className="block rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-brand-300/40 hover:bg-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-50">{subject.name}</span>
                    <span className="badge bg-brand-300/10 text-brand-300">{subject.semester}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{subject.description || 'Matière pédagogique à consulter.'}</p>
                </Link>
              )) || <div className="text-slate-500">Aucune matière récente.</div>}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <p className="section-label">Explorer</p><h3 className="mt-2 text-xl font-black text-emerald-50">Recherche</h3>
            <Link to="/recherche" className="primary-btn mt-4 w-full">Rechercher cours, documents, QCM...</Link>
          </section>

          <section className="card p-6">
            <h3 className="mb-4 text-xl font-black text-emerald-50">Derniers documents</h3>
            <div className="space-y-3">
              {data?.recentDocuments?.map((document) => (
                <div key={document.id} className="rounded-2xl border border-white/10 bg-black/10 p-3">
                  <div className="font-semibold text-emerald-50">{document.title}</div>
                  <div className="text-xs text-slate-500">{formatDate(document.created_at)}</div>
                </div>
              )) || <div className="text-slate-500">Aucun document récent.</div>}
            </div>
          </section>

          <section className="card p-6">
            <h3 className="mb-4 text-xl font-black text-emerald-50">QCM disponibles</h3>
            <div className="space-y-3">
              {data?.quizzes?.map((quiz) => (
                <Link key={quiz.id} to="/qcm" className="block rounded-2xl border border-white/10 bg-black/10 p-3 text-emerald-50 transition hover:border-brand-300/40 hover:bg-white/[0.08]">
                  {quiz.title}
                </Link>
              )) || <div className="text-slate-500">Aucun QCM disponible.</div>}
            </div>
          </section>

          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-black text-emerald-50">Notifications</h3><span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-300 px-2 text-xs font-black text-[#06211b]">{data?.notifications?.length || 0}</span></div>
            <div className="space-y-3">
              {data?.notifications?.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-white/10 bg-black/10 p-3">
                  <div className="font-semibold text-emerald-50">{notification.title}</div>
                  <div className="text-sm text-slate-400">{notification.message}</div>
                </div>
              )) || <div className="text-slate-500">Aucune notification.</div>}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
