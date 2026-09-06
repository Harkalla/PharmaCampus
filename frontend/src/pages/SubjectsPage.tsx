import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSubjects } from '../lib/pharmaData';
import { Subject, User } from '../types';

type SubjectsPageProps = { user: User; onLogout: () => void; };

const SubjectsPage = ({ user, onLogout }: SubjectsPageProps) => {
  const { semester } = useParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchSubjects(semester || 'S5').then(setSubjects).catch(console.error);
  }, [semester]);

  return (
    <Layout user={user} title={`Niveau ${semester || 'S5'}`} onLogout={onLogout}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <Link key={subject.id} to={`/matiere/${subject.id}`} className="card p-6 hover:-translate-y-1 transition">
            <div className="mb-4 flex items-center justify-between">
              <span className="badge bg-brand-100 text-brand-700">{subject.semester}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{subject.category || 'Matière'}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{subject.name}</h3>
            <p className="mt-3 text-sm text-slate-600">{subject.description || 'Matière pédagogique à consulter.'}</p>
            <div className="mt-4 primary-btn w-full justify-center">Voir la matière</div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default SubjectsPage;
