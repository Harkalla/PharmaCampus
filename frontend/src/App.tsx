import { Navigate, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SubjectsPage from './pages/SubjectsPage';
import CoursesPage from './pages/CoursesPage';
import CoursePage from './pages/CoursePage';
import DocumentsPage from './pages/DocumentsPage';
import ExamsPage from './pages/ExamsPage';
import QuizzesPage from './pages/QuizzesPage';
import MedicamentsPage from './pages/MedicamentsPage';
import CommunityPage from './pages/CommunityPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import ContributionsPage from './pages/ContributionsPage';
import RemarksPage from './pages/RemarksPage';
import NotificationsPage from './pages/NotificationsPage';
import { getSupabaseSessionUser, supabase } from './lib/supabase';
import { User } from './types';

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;
    getSupabaseSessionUser()
      .then((sessionUser) => {
        if (sessionUser && !disposed) {
          setUser(sessionUser as User);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));

    if (supabase) {
      const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (disposed) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          try {
            const sessionUser = await getSupabaseSessionUser();
            setUser(sessionUser as User | null);
          } catch {
            setUser(null);
          }
        }
      });
      return () => { disposed = true; subscription.subscription.unsubscribe(); };
    }
    return () => { disposed = true; };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-brand-700">Chargement...</div>;
  }

  const handleLogin = (currentUser: User, token: string) => {
    if (token) {
      localStorage.setItem('pharmacampus_token', token);
    }
    setUser(currentUser);
    navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  const handleLogout = async () => {
    localStorage.removeItem('pharmacampus_token');
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage onLogin={handleLogin} />} />
      <Route path="/dashboard" element={user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/cours" element={user ? <CoursesPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/niveaux/:semester" element={user ? <SubjectsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/matiere/:subjectId" element={user ? <CoursePage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/documents" element={user ? <DocumentsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/contributions" element={user ? <ContributionsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/remarques" element={user ? <RemarksPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/notifications" element={user ? <NotificationsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/examens" element={user ? <ExamsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/qcm" element={user ? <QuizzesPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/medicaments" element={user ? <MedicamentsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/entraide" element={user ? <CommunityPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/messages" element={user ? <MessagesPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/profil" element={user ? <ProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/recherche" element={user ? <SearchPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/admin" element={user?.role === 'admin' ? <AdminPage user={user} onLogout={handleLogout} /> : <Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/settings" element={user ? <SettingsPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
