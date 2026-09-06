import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type AdminPageProps = { user: User; onLogout: () => void; };

type AdminData = {
  counts: {
    users: number;
    subjects: number;
    documents: number;
    exams: number;
    suggestions: number;
    reports: number;
  };
};

const AdminPage = ({ user, onLogout }: AdminPageProps) => {
  const [data, setData] = useState<AdminData | null>(null);

  useEffect(() => {
    apiFetch<AdminData>('/admin/summary').then((res) => setData(res)).catch(console.error);
  }, []);

  return (
    <Layout user={user} title="Espace administrateur" onLogout={onLogout}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="card p-5"><div className="text-sm text-slate-500">Utilisateurs</div><div className="text-3xl font-bold text-brand-700">{data?.counts.users ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Matières</div><div className="text-3xl font-bold text-brand-700">{data?.counts.subjects ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Documents</div><div className="text-3xl font-bold text-brand-700">{data?.counts.documents ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Examens</div><div className="text-3xl font-bold text-brand-700">{data?.counts.exams ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Suggestions</div><div className="text-3xl font-bold text-brand-700">{data?.counts.suggestions ?? 0}</div></div>
        <div className="card p-5"><div className="text-sm text-slate-500">Signalements</div><div className="text-3xl font-bold text-brand-700">{data?.counts.reports ?? 0}</div></div>
      </div>
    </Layout>
  );
};

export default AdminPage;
