import { FormEvent, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type SettingsPageProps = { user: User; onLogout: () => void; };

const SettingsPage = ({ user, onLogout }: SettingsPageProps) => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const changePassword = async (event: FormEvent) => {
    event.preventDefault(); setMessage(''); setError('');
    if (passwords.newPassword !== passwords.confirmation) { setError('Les nouveaux mots de passe ne correspondent pas.'); return; }
    try { const response = await apiFetch<{ message: string }>('/profile/password', { method: 'POST', body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }) }); setMessage(response.message); setPasswords({ currentPassword: '', newPassword: '', confirmation: '' }); } catch (err) { setError((err as Error).message); }
  };
  return (
    <Layout user={user} title="Paramètres" onLogout={onLogout}>
      <div className="grid gap-6 lg:grid-cols-2">
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
      <form className="card space-y-4 p-6" onSubmit={changePassword}><h3 className="text-xl font-bold text-emerald-50">Modifier le mot de passe</h3>{['currentPassword', 'newPassword', 'confirmation'].map((field) => <div key={field}><label className="mb-1 block text-sm text-slate-300">{field === 'currentPassword' ? 'Mot de passe actuel' : field === 'newPassword' ? 'Nouveau mot de passe' : 'Confirmation'}</label><div className="relative"><input className="input pr-20" type={show[field] ? 'text' : 'password'} value={passwords[field as keyof typeof passwords]} onChange={(event) => setPasswords({ ...passwords, [field]: event.target.value })} minLength={field === 'currentPassword' ? undefined : 6} maxLength={field === 'currentPassword' ? undefined : 8} required /><button type="button" className="absolute inset-y-0 right-3 text-sm text-brand-300" onClick={() => setShow({ ...show, [field]: !show[field] })}>{show[field] ? 'Masquer' : 'Afficher'}</button></div></div>)}<p className="text-xs text-slate-400">6 à 8 caractères, uniquement lettres et chiffres, avec au moins une lettre et un chiffre.</p>{message && <p className="text-sm text-emerald-300">{message}</p>}{error && <p className="text-sm text-red-300">{error}</p>}<button className="primary-btn" type="submit">Modifier le mot de passe</button></form>
      </div>
    </Layout>
  );
};

export default SettingsPage;
