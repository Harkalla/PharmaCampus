import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSubjects } from '../lib/pharmaData';
import { apiFetch } from '../lib/api';
import { Course } from '../types';
import { Subject, User } from '../types';

type SubjectsPageProps = { user: User; onLogout: () => void; };

const SubjectsPage = ({ user, onLogout }: SubjectsPageProps) => {
  const { semester } = useParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    Promise.all([fetchSubjects(semester || 'S5'), apiFetch<{ courses: Course[] }>('/courses')]).then(([items, response]) => { setSubjects(items); setCourses(response.courses.filter((course) => course.semester === (semester || 'S5'))); }).catch(console.error);
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
      <section className="card mt-8 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="section-label">Bibliothèque pédagogique</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Cours du niveau {semester || 'S5'}</h2></div><div className="flex flex-col gap-2 sm:flex-row"><input className="input" placeholder="Rechercher un cours" value={query} onChange={(event) => setQuery(event.target.value)} /><select className="input" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="">Toutes les matières</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div></div>
        <div className="grid gap-4 md:grid-cols-2">{courses.filter((course) => (!subjectFilter || course.subject_id === subjectFilter) && course.title.toLowerCase().includes(query.toLowerCase())).map((course) => <article key={course.id} className="surface-muted p-4"><h3 className="font-bold text-emerald-50">{course.title}</h3><p className="mt-2 text-sm text-slate-400">{course.description || 'Cours disponible dans cette matière.'}</p><p className="mt-3 text-xs text-slate-500">{course.level || semester || 'Niveau non précisé'} • {course.semester || 'Semestre non précisé'}</p></article>)}{!courses.filter((course) => (!subjectFilter || course.subject_id === subjectFilter) && course.title.toLowerCase().includes(query.toLowerCase())).length && <p className="text-slate-500">📚 Aucun cours disponible pour le moment.</p>}</div>
      </section>
    </Layout>
  );
};

export default SubjectsPage;
