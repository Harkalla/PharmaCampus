import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch, formatDate } from '../lib/api';
import { fetchSubjects } from '../lib/pharmaData';
import { DocumentItem, Subject, User } from '../types';

type ContributionsPageProps = { user: User; onLogout: () => void };

type Contribution = DocumentItem & { status?: string; rejection_reason?: string; year?: number };

const statusLabels: Record<string, string> = {
  pending: 'En attente', published: 'Validé / publié', refused: 'Refusé', archived: 'Archivé'
};

const ContributionsPage = ({ user, onLogout }: ContributionsPageProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [documents, setDocuments] = useState<Contribution[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ title: '', semester: user.semester || 'S5', subjectId: '', category: 'Cours', type: 'PDF', year: String(new Date().getFullYear()), description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDocuments = () => apiFetch<{ documents: Contribution[] }>('/documents/mine').then((response) => setDocuments(response.documents));

  useEffect(() => {
    Promise.all([fetchSubjects(), loadDocuments()]).then(([items]) => setSubjects(items)).catch((err) => setError((err as Error).message));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!file) { setError('Sélectionnez un fichier à envoyer.'); return; }
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    body.append('file', file);
    try {
      await apiFetch('/documents/contribute', { method: 'POST', body });
      setMessage('Votre document a été envoyé. Il est maintenant en attente de validation.');
      setForm((current) => ({ ...current, title: '', description: '' }));
      setFile(null);
      await loadDocuments();
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <Layout user={user} title="Mes contributions" onLogout={onLogout}>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
          <div><p className="section-label">Partager avec la communauté</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Proposer un document</h2></div>
          <input className="input" placeholder="Titre du document" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="input" value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })}>{Array.from({ length: 10 }, (_, index) => `S${index + 1}`).map((semester) => <option key={semester}>{semester}</option>)}</select>
            <select className="input" value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} required><option value="">Matière</option>{subjects.filter((subject) => subject.semester === form.semester).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Cours</option><option>Examen</option><option>Corrigé</option><option>TP</option><option>QCM</option><option>Autre</option></select>
            <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>PDF</option><option>Word</option><option>PowerPoint</option><option>Image</option><option>Vidéo</option></select>
            <input className="input" type="number" placeholder="Année" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
          </div>
          <textarea className="input min-h-28" placeholder="Description (facultative)" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <input className="input" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
          {message && <p className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">{message}</p>}
          {error && <p className="rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
          <button className="primary-btn w-full" type="submit">Envoyer pour validation</button>
        </form>

        <section className="card p-6">
          <div className="mb-5"><p className="section-label">Suivi</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Mes documents envoyés</h2></div>
          <div className="space-y-3">
            {documents.map((document) => <article key={document.id} className="surface-muted p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold text-emerald-50">{document.title}</h3><span className="badge text-brand-300">{statusLabels[document.status || 'pending'] || document.status}</span></div><p className="mt-2 text-sm text-slate-400">{document.description || 'Aucune description.'}</p><p className="mt-3 text-xs text-slate-500">{document.type} {document.year ? `• ${document.year}` : ''} • {formatDate(document.created_at)}</p>{document.rejection_reason && <p className="mt-2 text-sm text-red-300">Motif : {document.rejection_reason}</p>}</article>)}
            {!documents.length && <p className="text-slate-500">Vous n’avez encore envoyé aucun document.</p>}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ContributionsPage;
