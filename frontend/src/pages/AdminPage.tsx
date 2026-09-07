import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { DocumentItem, User } from '../types';
import { formatDate } from '../lib/api';
import { fetchPendingSupabaseContributions, fetchSupabaseAdminSummary, reviewSupabaseContribution, supabase } from '../lib/supabase';

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
  const [published, setPublished] = useState<PendingDocument[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const loadData = async () => {
    if (supabase) {
      const [summary, documents] = await Promise.all([fetchSupabaseAdminSummary(), fetchPendingSupabaseContributions()]);
      setData(summary as AdminData);
      setPending((documents || []) as PendingDocument[]);
      setPublished([]);
      return;
    }
    return Promise.all([
    apiFetch<AdminData>('/admin/summary'),
    apiFetch<{ documents: PendingDocument[] }>('/admin/documents/pending'),
    apiFetch<{ documents: PendingDocument[] }>('/admin/documents')
    ]).then(([summary, documents, allDocuments]) => { setData(summary); setPending(documents.documents); setPublished(allDocuments.documents.filter((document) => document.status === 'published')); });
  };

  useEffect(() => {
    loadData().catch((err) => setError((err as Error).message));
  }, []);

  const updateStatus = async (id: string, status: 'published' | 'refused') => {
    let rejectionReason = '';
    if (status === 'refused') {
      rejectionReason = window.prompt('Motif obligatoire : Document illisible, mauvais niveau, mauvaise matière, document incomplet, document incorrect, doublon, contenu non pertinent ou autre', 'Document illisible') || '';
      if (!rejectionReason) return;
    }
    try {
      if (supabase) await reviewSupabaseContribution(id, status, rejectionReason);
      else await apiFetch(`/admin/documents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason, category: categories[id] || 'Autre' }) });
      await loadData();
    } catch (err) { setError((err as Error).message); }
  };

  const deleteDocument = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return;
    try {
      await apiFetch(`/admin/documents/${id}`, { method: 'DELETE' });
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
          {pending.map((document) => <article key={document.id} className="surface-muted flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-bold text-emerald-50">{document.title}</h3><p className="mt-1 text-sm text-slate-400">{document.first_name} {document.last_name} • {document.semester} • {document.type} {document.year ? `• ${document.year}` : ''}</p><p className="mt-2 text-sm text-slate-500">{document.description || 'Aucune description.'}</p><a className="mt-2 inline-block text-sm font-semibold text-brand-300" href={`http://localhost:4000${document.file_path}`} target="_blank" rel="noreferrer">Prévisualiser le fichier</a></div><div className="flex flex-wrap gap-2"><select className="input min-w-32" value={categories[document.id] || 'Autre'} onChange={(event) => setCategories((current) => ({ ...current, [document.id]: event.target.value }))}><option>Cours</option><option>Examen</option><option>TP</option><option>QCM</option><option>Autre</option></select><button className="primary-btn" onClick={() => updateStatus(document.id, 'published')}>Valider</button><button className="secondary-btn border-red-300/30 text-red-200" onClick={() => updateStatus(document.id, 'refused')}>Refuser</button></div></article>)}
          {!pending.length && <p className="text-slate-500">Aucun document en attente.</p>}
        </div>
      </section>
      <section className="card mt-6 p-6">
        <div className="mb-5"><p className="section-label">Gestion des contenus</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Ressources publiées</h2></div>
        <div className="space-y-3">
          {published.map((document) => <article key={document.id} className="surface-muted flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-bold text-emerald-50">{document.title}</h3><p className="mt-1 text-sm text-slate-400">{document.semester || 'Semestre'} • {document.type || 'Document'} • {formatDate(document.created_at)}</p></div><div className="flex gap-2"><a className="secondary-btn" href={document.file_url || `http://localhost:4000${document.file_path || ''}`} target="_blank" rel="noreferrer">Ouvrir</a><button className="secondary-btn border-red-300/30 text-red-200" onClick={() => deleteDocument(document.id)}>Supprimer</button></div></article>)}
          {!published.length && <p className="text-slate-500">Aucune ressource publiée.</p>}
        </div>
      </section>
    </Layout>
  );
};

export default AdminPage;
