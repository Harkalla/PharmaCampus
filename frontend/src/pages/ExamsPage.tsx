import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { formatDate } from '../lib/api';
import { fetchExams } from '../lib/pharmaData';
import { User } from '../types';

type Exam = {
  id: string;
  title: string;
  semester?: string;
  year?: number;
  file_path?: string;
  answer_file_path?: string;
  created_at?: string;
};

type ExamsPageProps = { user: User; onLogout: () => void; };

const ExamsPage = ({ user, onLogout }: ExamsPageProps) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [query, setQuery] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    fetchExams().then(setExams).catch(console.error);
  }, []);

  return (
    <Layout user={user} title="Examens" onLogout={onLogout}>
      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-3"><input className="input" placeholder="Rechercher un examen" value={query} onChange={(event) => setQuery(event.target.value)} /><select className="input" value={semester} onChange={(event) => setSemester(event.target.value)}><option value="">Tous les niveaux</option>{Array.from({ length: 10 }, (_, index) => <option key={index}>S{index + 1}</option>)}</select><input className="input" placeholder="Année" value={year} onChange={(event) => setYear(event.target.value)} /></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exams.filter((exam) => (!query || exam.title.toLowerCase().includes(query.toLowerCase())) && (!semester || exam.semester === semester) && (!year || String(exam.year) === year)).map((exam) => (
          <div key={exam.id} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="badge bg-brand-100 text-brand-700">{exam.semester || 'S5'}</span>
              <span className="text-xs text-slate-500">{exam.year || '2025'}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
            <p className="mt-2 text-sm text-slate-600">Date d’ajout : {formatDate(exam.created_at)}</p>
            <div className="mt-4 flex gap-2">
              <a href={`http://localhost:4000${exam.file_path || '/uploads/sample.pdf'}`} target="_blank" rel="noreferrer" className="primary-btn flex-1">Ouvrir</a>
              <a href={`http://localhost:4000${exam.answer_file_path || '/uploads/sample.pdf'}`} target="_blank" rel="noreferrer" className="secondary-btn flex-1">Corrigé</a>
            </div>
          </div>
        ))}
        {!exams.filter((exam) => (!query || exam.title.toLowerCase().includes(query.toLowerCase())) && (!semester || exam.semester === semester) && (!year || String(exam.year) === year)).length && <p className="text-slate-500">📝 Aucun examen disponible pour le moment.</p>}
      </div>
    </Layout>
  );
};

export default ExamsPage;
