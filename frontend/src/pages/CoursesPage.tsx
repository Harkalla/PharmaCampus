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

  useEffect(() => {
    apiFetch<{ semesters: SemesterOverview[] }>('/semesters')
      .then((response) => setSemesters(response.semesters))
      .catch(console.error);
  }, []);

  const years = useMemo(() => Array.from(new Set(semesters.map((semester) => semester.year))).sort((a, b) => a - b), [semesters]);

  return (
    <Layout user={user} title="Cours" onLogout={onLogout}>
      <section className="card p-6">
        <p className="section-label">Parcours pédagogique</p>
        <h2 className="mt-2 text-2xl font-black text-emerald-50">Cours → Année → Semestre → Module</h2>
        <p className="mt-2 max-w-2xl text-slate-400">Retrouvez tous les niveaux de pharmacie, de S1 à S10, regroupés par année d’études.</p>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {years.map((year) => (
          <section key={year} className="card p-5">
            <span className="text-sm font-bold text-brand-300">Parcours académique</span>
            <h3 className="mt-2 text-xl font-black text-emerald-50">{yearLabels[year] || `${year}ème année`}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {semesters.filter((semester) => semester.year === year).map((semester) => (
                <Link key={semester.id} to={`/niveaux/${semester.id}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-brand-300 hover:bg-brand-300/10">
                  <span className="text-lg font-black text-emerald-50">{semester.name}</span>
                  <span className="mt-1 block text-xs text-slate-400">{semester.modules.length} modules</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>
    </Layout>
  );
};

export default CoursesPage;