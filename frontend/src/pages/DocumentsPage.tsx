import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { formatDate } from '../lib/api';
import { fetchDocuments } from '../lib/pharmaData';
import { DocumentItem, User } from '../types';

type DocumentsPageProps = { user: User; onLogout: () => void; };

const DocumentsPage = ({ user, onLogout }: DocumentsPageProps) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchDocuments(query)
      .then(setDocuments)
      .catch(console.error);
  }, [query]);

  return (
    <Layout user={user} title="Documents" onLogout={onLogout}>
      <div className="card p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input className="input max-w-md" placeholder="Rechercher un document..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <a key={document.id} href={`http://localhost:4000${document.file_path || '/uploads/sample.pdf'}`} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 hover:bg-brand-50">
              <div className="mb-2 flex items-center justify-between">
                <span className="badge bg-brand-100 text-brand-700">{document.type || 'PDF'}</span>
                <span className="text-xs text-slate-500">{document.semester || 'S5'}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{document.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{document.description}</p>
              <div className="mt-3 text-xs text-slate-500">{document.author || 'Source inconnue'} • {formatDate(document.created_at as string | undefined)}</div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DocumentsPage;
