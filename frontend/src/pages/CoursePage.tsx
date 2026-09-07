import { useEffect, useState } from 'react';
import { ChevronRight, Eye, FileImage, FileText, Layers3, Link2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiFetch, formatDate } from '../lib/api';
import { DocumentItem, Subject, User } from '../types';

type CoursePageProps = { user: User; onLogout: () => void };
type SubjectDetail = { subject: Subject; documents: DocumentItem[] };

const getDocumentUrl = (document: DocumentItem) => document.file_url || `http://localhost:4000${document.file_path || ''}`;
const getDocumentType = (document: DocumentItem) => {
  if (document.type === 'URL') return 'URL';
  if (document.type === 'Image') return 'Image';
  const extension = document.file_name?.split('.').pop()?.toUpperCase();
  return extension ? `${extension}/Doc` : 'PDF/Doc';
};
const formatSize = (size?: number) => {
  if (!size) return '0 o';
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
};

const CoursePage = ({ user, onLogout }: CoursePageProps) => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [data, setData] = useState<SubjectDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!subjectId) return;
    apiFetch<SubjectDetail>(`/subject/${subjectId}`).then(setData).catch((requestError) => setError((requestError as Error).message));
  }, [subjectId]);

  const subject = data?.subject;
  const semester = subject?.semester || 'S5';
  const documents = data?.documents || [];

  return (
    <Layout user={user} title="Mes cours" onLogout={onLogout}>
      {user.role === 'admin' && <div className="academic-admin-bar mb-7 rounded-[18px] border border-[#bdeedb] bg-[#effcf6] p-5 text-[#142438] shadow-sm">
        <p className="text-lg font-extrabold">Mode administrateur — ajoutez et gérez les ressources officielles.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button type="button" onClick={() => navigate(`/niveaux/${semester}`)} className="academic-admin-button academic-admin-button--document"><FileText size={20} />Ajouter un document</button>
          <button type="button" onClick={() => navigate(`/niveaux/${semester}`)} className="academic-admin-button academic-admin-button--image"><FileImage size={20} />Ajouter une image</button>
          <button type="button" onClick={() => navigate(`/niveaux/${semester}`)} className="academic-admin-button academic-admin-button--url"><Link2 size={20} />Ajouter une URL</button>
        </div>
      </div>}

      <div className="mb-5 flex flex-wrap items-center gap-2 text-[17px] text-[#5c708c]">
        <Link to="/cours" className="transition hover:text-[#142438]">Tous les niveaux</Link><ChevronRight size={18} />
        <Link to={`/niveaux/${semester}`} className="transition hover:text-[#142438]">{semester}</Link><ChevronRight size={18} />
        <span className="font-bold text-[#142438]">{subject?.name || 'Chargement...'}</span>
      </div>

      {error ? <div className="rounded-[18px] border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</div> : <>
        <div className="mb-5 flex items-center gap-2 text-[16px] text-[#5c708c]"><Layers3 size={21} />{documents.length} document{documents.length !== 1 ? 's' : ''} dans {subject?.name || 'ce module'} ({semester})</div>
        {!documents.length ? <section className="rounded-[20px] border border-dashed border-[#cbd8e7] bg-white/55 px-6 py-20 text-center">
          <h2 className="text-xl font-semibold text-[#263b55]">Aucune ressource pour le moment</h2><p className="mt-2 text-[16px] text-[#8499b7]">Utilisez les boutons ci-dessus pour ajouter un document, une image ou une URL.</p>
        </section> : <section className="overflow-x-auto rounded-[20px] border border-[#d4dfec] bg-white">
          <table className="min-w-[760px] w-full border-collapse text-left"><thead className="border-b border-[#e2e8f0] bg-[#f8fafc] text-xs uppercase tracking-[0.14em] text-[#607493]"><tr><th className="px-5 py-4">Type</th><th className="px-5 py-4">Nom</th><th className="px-5 py-4">Catégorie</th><th className="px-5 py-4">Niveau</th><th className="px-5 py-4">Taille</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Action</th></tr></thead>
            <tbody>{documents.map((document) => <tr key={document.id} className="border-b border-[#edf1f5] last:border-0 hover:bg-[#fbfdff]"><td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-sm font-bold text-[#e8194b]"><FileText size={21} />{getDocumentType(document)}</span></td><td className="px-5 py-4"><div className="font-semibold text-[#172b44]">{document.title}</div><div className="text-sm text-[#91a0b5]">{subject?.name}</div></td><td className="px-5 py-4 text-[#526783]">{document.category || 'Autre'}</td><td className="px-5 py-4 font-semibold text-[#526783]">{semester}</td><td className="px-5 py-4 text-[#526783]">{formatSize(document.file_size)}</td><td className="px-5 py-4 text-[#526783]">{formatDate(document.created_at)}</td><td className="px-5 py-4"><a href={getDocumentUrl(document)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-[#008d71]"><Eye size={19} />Ouvrir</a></td></tr>)}</tbody>
          </table>
        </section>}
      </>}
    </Layout>
  );
};

export default CoursePage;
