import { FormEvent, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type RemarksPageProps = { user: User; onLogout: () => void };

const RemarksPage = ({ user, onLogout }: RemarksPageProps) => {
  const [form, setForm] = useState({ title: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage(''); setError('');
    try {
      await apiFetch('/suggestions', { method: 'POST', body: JSON.stringify(form) });
      setForm({ title: '', description: '' });
      setMessage('Votre remarque a été envoyée à l’administration.');
    } catch (err) { setError((err as Error).message); }
  };

  return <Layout user={user} title="Remarques" onLogout={onLogout}><form className="card mx-auto max-w-2xl space-y-4 p-6" onSubmit={submit}><div><p className="section-label">Votre avis compte</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Envoyer une remarque</h2><p className="mt-2 text-sm text-slate-400">Signalez un problème, une erreur ou une idée d’amélioration.</p></div><input className="input" placeholder="Sujet" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /><textarea className="input min-h-36" placeholder="Votre remarque" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />{message && <p className="text-sm text-emerald-300">{message}</p>}{error && <p className="text-sm text-red-300">{error}</p>}<button className="primary-btn w-full" type="submit">Envoyer à l’administration</button></form></Layout>;
};

export default RemarksPage;
