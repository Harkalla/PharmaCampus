import Layout from '../components/Layout';
import { User } from '../types';

type ProfilePageProps = { user: User; onLogout: () => void; };

const ProfilePage = ({ user, onLogout }: ProfilePageProps) => {
  return (
    <Layout user={user} title="Mon profil" onLogout={onLogout}>
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <img src={user.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'} alt={`Profil de ${user.first_name}`} className="h-28 w-28 rounded-full object-cover ring-4 ring-brand-300/20" />
          <div>
            <p className="section-label">Profil étudiant</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-50">{user.first_name} {user.last_name}</h2>
            <p className="mt-1 text-slate-400">{user.university || 'Faculté'} • {user.semester || 'S5'} • {user.level || 'Licence'}</p>
            <p className="mt-2 text-slate-400">{user.bio || 'Aucune biographie pour le moment.'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="surface-muted p-4"><div className="text-sm text-slate-500">QCM réalisés</div><div className="text-3xl font-bold text-brand-300">12</div></div>
          <div className="surface-muted p-4"><div className="text-sm text-slate-500">Meilleur score</div><div className="text-3xl font-bold text-emerald-300">94%</div></div>
          <div className="surface-muted p-4"><div className="text-sm text-slate-500">Activité</div><div className="text-3xl font-bold text-sky-300">8</div></div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
