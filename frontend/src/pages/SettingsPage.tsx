import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type SettingsPageProps = { user: User; onLogout: () => void };
type PreferenceKey = 'general' | 'courses' | 'exams' | 'quizzes' | 'tp' | 'medicines' | 'community' | 'contributions' | 'accepted' | 'refused' | 'announcements';
type Preferences = { notifications: Record<PreferenceKey, boolean>; appearance: 'dark' | 'light' | 'system'; language: 'fr' | 'en'; confirmActions: boolean };

const defaults: Preferences = {
  notifications: { general: true, courses: true, exams: true, quizzes: true, tp: true, medicines: true, community: true, contributions: true, accepted: true, refused: true, announcements: true },
  appearance: 'dark', language: 'fr', confirmActions: true
};

const notificationLabels: Array<[PreferenceKey, string]> = [['general', 'Notifications générales'], ['courses', 'Nouveaux cours'], ['exams', 'Nouveaux examens'], ['quizzes', 'Nouveaux QCM'], ['tp', 'Nouveaux TP'], ['medicines', 'Nouveaux contenus médicaments'], ['community', 'Activité de la communauté'], ['contributions', 'Statut de mes contributions'], ['accepted', 'Contribution acceptée'], ['refused', 'Contribution refusée'], ['announcements', 'Annonces importantes']];

const SettingsPage = ({ user, onLogout }: SettingsPageProps) => {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch<Preferences>('/preferences').then((value) => setPreferences({ ...defaults, ...value, notifications: { ...defaults.notifications, ...value.notifications } })).catch(() => {
      const stored = localStorage.getItem('pharmacampus_preferences');
      if (stored) setPreferences({ ...defaults, ...JSON.parse(stored) });
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.appearance;
    localStorage.setItem('pharmacampus_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const save = async (next: Preferences) => {
    setPreferences(next); setMessage('');
    try { await apiFetch('/preferences', { method: 'PUT', body: JSON.stringify(next) }); setMessage('Préférences enregistrées.'); } catch { setMessage('Préférences enregistrées sur cet appareil.'); }
  };

  return <Layout user={user} title="Paramètres" onLogout={onLogout}><div className="grid gap-6 lg:grid-cols-2">
    <section className="card p-6"><p className="section-label">Compte</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Préférences de notifications</h2><div className="mt-5 space-y-2">{notificationLabels.map(([key, label]) => <label key={key} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300"><span>{label}</span><input type="checkbox" checked={preferences.notifications[key]} onChange={(event) => save({ ...preferences, notifications: { ...preferences.notifications, [key]: event.target.checked } })} /></label>)}</div></section>
    <div className="space-y-6">
      <section className="card p-6"><p className="section-label">Apparence</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Thème de l’application</h2><div className="mt-4 grid grid-cols-3 gap-2">{([['light', '☀️ Clair'], ['dark', '🌙 Sombre'], ['system', '🖥️ Automatique']] as const).map(([value, label]) => <button key={value} className={`secondary-btn ${preferences.appearance === value ? 'border-brand-300 bg-brand-300/15 text-brand-300' : ''}`} onClick={() => save({ ...preferences, appearance: value })}>{label}</button>)}</div></section>
      <section className="card p-6"><p className="section-label">Langue</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Langue</h2><select className="input mt-4" value={preferences.language} onChange={(event) => save({ ...preferences, language: event.target.value as 'fr' | 'en' })}><option value="fr">🇫🇷 Français</option><option value="en">🇬🇧 English (préparation)</option></select></section>
      <section className="card p-6"><p className="section-label">Confidentialité et sécurité</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Actions importantes</h2><label className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300"><span>⚠️ Confirmer avant les actions importantes</span><input type="checkbox" checked={preferences.confirmActions} onChange={(event) => save({ ...preferences, confirmActions: event.target.checked })} /></label><button className="secondary-btn mt-4 w-full" onClick={onLogout}>Déconnexion sécurisée</button></section>
    </div>
    <section className="card p-6 lg:col-span-2"><p className="section-label">À propos</p><h2 className="mt-2 text-2xl font-black text-emerald-50">À propos de PharmaCampus</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">PharmaCampus est une plateforme d’apprentissage destinée aux étudiants en pharmacie. Elle permet d’apprendre, réviser, pratiquer, partager et échanger autour des cours, examens, QCM, travaux pratiques, médicaments et ressources pédagogiques.</p><p className="mt-3 font-semibold text-brand-300">Apprendre • Réviser • Pratiquer • S’entraider</p><p className="mt-4 text-sm text-slate-500">📱 PharmaCampus — Version 1.0.0</p><div className="mt-5 border-t border-white/10 pt-5"><h3 className="font-bold text-emerald-50">📞 Contacter l’administrateur</h3><p className="mt-2 text-sm text-slate-500">Les coordonnées de contact n’ont pas encore été configurées.</p></div></section>
    {message && <p className="text-sm text-emerald-300 lg:col-span-2">{message}</p>}
  </div></Layout>;
};

export default SettingsPage;
