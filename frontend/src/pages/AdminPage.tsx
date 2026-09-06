import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { DocumentItem, User } from '../types';

type AdminPageProps = { user: User; onLogout: () => void; };

type AdminData = {
  counts: {
    users: number;
    newUsers?: number;
    subjects: number;
    documents: number;
    publishedDocuments?: number;
    pendingDocuments?: number;
    refusedDocuments?: number;
    courses?: number;
    quizzes?: number;
    exams: number;
    suggestions: number;
    reports: number;
  };
};

type PendingDocument = DocumentItem & { first_name?: string; last_name?: string; year?: number };

const AdminPage = ({ user, onLogout }: AdminPageProps) => {
  const [data, setData] = useState<AdminData | null>(null);
  const [pending, setPending] = useState<PendingDocument[]>([]);
  const [error, setError] = useState('');

  const loadData = () => Promise.all([
    apiFetch<AdminData>('/admin/summary'),
    apiFetch<{ documents: PendingDocument[] }>('/admin/documents/pending')
  ]).then(([summary, documents]) => { setData(summary); setPending(documents.documents); });

  useEffect(() => {
    loadData().catch((err) => setError((err as Error).message));
  }, []);

  const updateStatus = async (id: string, status: 'published' | 'refused') => {
    let rejectionReason = '';
    if (status === 'refused') {
      rejectionReason = window.prompt('Motif obligatoire du refus :', 'Document illisible') || '';
      if (!rejectionReason) return;
    }
    try {
      await apiFetch(`/admin/documents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) });
      await loadData();
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <Layout user={user} title="Espace administrateur" onLogout={onLogout}>
      {error && <div className="mb-4 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5"><div className="text-sm text-slate-500">Utilisateurs</div><div className="text-3xl font-bold text-brand-700">{data?.counts.users ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Nouveaux utilisateurs</div><div className="text-3xl font-bold text-brand-700">{data?.counts.newUsers ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Matières</div><div className="text-3xl font-bold text-brand-700">{data?.counts.subjects ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Documents publiés</div><div className="text-3xl font-bold text-brand-700">{data?.counts.publishedDocuments ?? data?.counts.documents ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-amber-300">En attente</div><div className="text-3xl font-bold text-amber-300">{data?.counts.pendingDocuments ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-red-300">Refusés</div><div className="text-3xl font-bold text-red-300">{data?.counts.refusedDocuments ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Cours</div><div className="text-3xl font-bold text-brand-700">{data?.counts.courses ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Examens</div><div className="text-3xl font-bold text-brand-700">{data?.counts.exams ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">QCM</div><div className="text-3xl font-bold text-brand-700">{data?.counts.quizzes ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Suggestions</div><div className="text-3xl font-bold text-brand-700">{data?.counts.suggestions ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Signalements</div><div className="text-3xl font-bold text-brand-700">{data?.counts.reports ?? 0}</div></div>
      </div>
      <section className="card mt-6 p-6">
        <div className="mb-5 flex items-center justify-between"><div><p className="section-label">Modération</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Documents en attente</h2></div><span className="badge text-amber-300">{pending.length} à traiter</span></div>
        <div className="space-y-3">
          {pending.map((document) => <article key={document.id} className="surface-muted flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-bold text-emerald-50">{document.title}</h3><p className="mt-1 text-sm text-slate-400">{document.first_name} {document.last_name} • {document.semester} • {document.type} {document.year ? `• ${document.year}` : ''}</p><p className="mt-2 text-sm text-slate-500">{document.description || 'Aucune description.'}</p><a className="mt-2 inline-block text-sm font-semibold text-brand-300" href={`http://localhost:4000${document.file_path}`} target="_blank" rel="noreferrer">Prévisualiser le fichier</a></div><div className="flex gap-2"><button className="primary-btn" onClick={() => updateStatus(document.id, 'published')}>Valider</button><button className="secondary-btn border-red-300/30 text-red-200" onClick={() => updateStatus(document.id, 'refused')}>Refuser</button></div></article>)}
          {!pending.length && <p className="text-slate-500">Aucun document en attente.</p>}
        </div>
      </section>
    </Layout>
  );
};

export default AdminPage;
