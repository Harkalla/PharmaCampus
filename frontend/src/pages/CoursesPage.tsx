import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type SemesterOverview = {
  id: string;
  name: string;
  year: number;
  modules: Array<{ id: string; name: string }>;
};

type CoursesPageProps = { user: User; onLogout: () => void };

const yearLabels: Record<number, string> = {
  1: '1ère année',
  2: '2ème année',
  3: '3ème année',
  4: '4ème année',
  5: '5ème année'
};

const CoursesPage = ({ user, onLogout }: CoursesPageProps) => {
  const [semesters, setSemesters] = useState<SemesterOverview[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ semesters: SemesterOverview[] }>('/semesters')
      .then((response) => setSemesters(response.semesters))
      .catch(console.error);
  }, []);

  const years = useMemo(() => Array.from(new Set(semesters.map((semester) => semester.year))).sort((a, b) => a - b), [semesters]);
  const visibleSemesters = selectedYear ? semesters.filter((semester) => semester.year === selectedYear) : [];

  return (
    <Layout user={user} title="Cours" onLogout={onLogout}>
      <section className="card p-6">
        <p className="section-label">Parcours pédagogique</p>
        <h2 className="mt-2 text-2xl font-black text-emerald-50">Cours → Année → Semestre → Module</h2>
        <p className="mt-2 max-w-2xl text-slate-400">Choisissez votre année pour retrouver uniquement les semestres et les modules correspondants.</p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {years.map((year) => (
          <button key={year} type="button" onClick={() => setSelectedYear(year)} className={`card p-5 text-left transition hover:-translate-y-1 hover:border-brand-300 ${selectedYear === year ? 'border-brand-300 bg-brand-300/10' : ''}`}>
            <span className="text-sm font-bold text-brand-300">Année {year}</span>
            <h3 className="mt-2 text-xl font-black text-emerald-50">{yearLabels[year] || `${year}ème année`}</h3>
            <p className="mt-2 text-sm text-slate-400">S{year * 2 - 1} et S{year * 2}</p>
          </button>
        ))}
      </section>

      {selectedYear && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between"><div><p className="section-label">{yearLabels[selectedYear]}</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Semestres disponibles</h2></div><button type="button" className="secondary-btn" onClick={() => setSelectedYear(null)}>Changer d’année</button></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleSemesters.map((semester) => (
              <Link key={semester.id} to={`/niveaux/${semester.id}`} className="card p-6 transition hover:-translate-y-1 hover:border-brand-300"><span className="text-sm font-bold text-brand-300">Semestre</span><h3 className="mt-2 text-3xl font-black text-emerald-50">{semester.name}</h3><p className="mt-2 text-sm text-slate-400">{semester.modules.length} modules pédagogiques</p><span className="mt-5 inline-flex text-sm font-bold text-brand-300">Voir les modules →</span></Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default CoursesPage;