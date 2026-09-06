import Layout from '../components/Layout';
import { User } from '../types';

type SettingsPageProps = { user: User; onLogout: () => void; };

const SettingsPage = ({ user, onLogout }: SettingsPageProps) => {
  return (
    <Layout user={user} title="Paramètres" onLogout={onLogout}>
      <div className="card p-6">
        <h3 className="text-xl font-bold text-slate-800">Préférences du compte</h3>
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-800">Sécurité</div>
            <p className="text-sm text-slate-600">Mot de passe oublié, sessions actives et gestion de sécurité.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-800">Notifications</div>
            <p className="text-sm text-slate-600">Recevoir les mises à jour des cours, examens et discussions.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-semibold text-slate-800">Profil</div>
            <p className="text-sm text-slate-600">Modifier la photo, la bio et les informations académiques.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
