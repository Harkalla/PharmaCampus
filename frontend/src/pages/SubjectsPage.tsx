import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSubjects } from '../lib/pharmaData';
import { apiFetch } from '../lib/api';
import { Course } from '../types';
import { Subject, User } from '../types';

type SubjectsPageProps = { user: User; onLogout: () => void; };

const moduleDocumentMap: Record<string, number> = {
  'Math / Info': 0,
  'Communication / Anglais': 0,
  'Chimie': 0,
  'Botanique': 0,
  'Biologie végétale': 0,
  'Biologie cellulaire': 0,
  'Anatomie': 0,
  'Langue Étrangère': 0,
  'Chimie Analytique I': 0,
  'Systématique Botanique': 0,
  'Histologie / Embryologie': 0,
  'Initiation à la Pharmacie': 0,
  'Biochimie structurale': 0,
  'Chimie Analytique II': 0,
  'Chimie Organique II': 0,
  'Hématologie Biologique': 0,
  'Microbiologie': 0,
  'Physiologie Végétale': 0,
  'Anglais pour la Pharmacie': 0,
  'Immunologie': 0,
  'Chimie Analytique Instrumentale': 0,
  'Bases de la Biotechnologie': 0,
  'Pharmacologie Générale': 0,
  'Médecine sociale et santé publique': 0,
  'Essais Physicochimiques': 0,
  'Biochimie Métabolique': 0,
  'Microbiologie II / Immunologie': 0,
  'Parasitologie': 1,
  'Pharmacie Galénique I': 0,
  'Pharmacologie Spéciale I': 0,
  "Informatique et Systèmes d'Aide": 0,
  "Méthodes d'Analyse": 0,
  'Pharmacie Hospitalière': 0,
  'Toxicologie': 0,
  'Chimie Thérapeutique I': 0,
  'Langues Étrangères': 0,
  'Pharmacognosie I': 0,
  'Pharmacie Galénique II': 0,
  'Bromatologie - Hydrologie': 0,
  'Chimie Thérapeutique II': 0,
  'Pharmacognosie spéciale et Essais': 0,
  'Pharmacologie Spéciale II': 0,
  'Sémiologie Pathologique I': 0,
  'Toxicologie II': 0,
  'Pharmacotechnie': 1,
  'Biochimie Clinique': 1,
  'Biochimie Pré-Instrumentale': 0,
  'Sémiologie Pathologique II': 0,
  'Mycologie': 0,
  'Hématologie II': 0,
  'Pharmacie clinique': 0,
  'Méthodologie de recherche': 0,
  'Médicaments vétérinaires': 0,
  'Hygiène': 0,
  'Droit pharmaceutique': 0,
  'Applications de biotechnologie': 0,
  'Cosmétologie Médicale': 0,
  'Pharmacie Industrielle': 0,
  "Toxicologie d'Urgence": 0,
  'Gestion Pharmaceutique': 0,
  'Gestion de Projet / Management': 0,
  'Nutrition Diététique': 0
};

const getDocumentCountForModule = (moduleName: string) => moduleDocumentMap[moduleName] ?? 0;

const SubjectsPage = ({ user, onLogout }: SubjectsPageProps) => {
  const { semester } = useParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    Promise.all([fetchSubjects(semester || 'S5'), apiFetch<{ courses: Course[] }>('/courses')]).then(([items, response]) => {
      setSubjects(items);
      setCourses(response.courses.filter((course) => course.semester === (semester || 'S5')));
    }).catch(console.error);
  }, [semester]);

  const currentSemester = semester || 'S5';

  return (
    <Layout user={user} title={`Niveau ${currentSemester}`} onLogout={onLogout}>
      {user.role === 'admin' && (
        <div className="mb-8 rounded-[22px] border border-[#bfead2] bg-[#dff5eb] p-5 text-[#1b2f2a] shadow-sm">
          <p className="text-lg font-extrabold text-[#1d2f2d]">Mode administrateur — ajoutez et gérez les ressources officielles.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button type="button" className="rounded-xl bg-[#d94d5b] px-4 py-3 text-left text-lg font-bold text-white shadow-sm">Ajouter un document</button>
            <button type="button" className="rounded-xl bg-[#7a4be6] px-4 py-3 text-left text-lg font-bold text-white shadow-sm">Ajouter une image</button>
            <button type="button" className="rounded-xl bg-[#197ec3] px-4 py-3 text-left text-lg font-bold text-white shadow-sm">Ajouter une URL</button>
          </div>
        </div>
      )}

      <div className="mb-6 text-[20px] font-bold text-[#1f2b32]">
        {subjects.length ? `Tous les niveaux > ${currentSemester}` : 'Chargement des modules...'}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {subjects.map((subject) => {
          const documentCount = getDocumentCountForModule(subject.name);
          return (
            <Link key={subject.id} to={`/matiere/${subject.id}`} className="group flex min-h-[180px] flex-col justify-between rounded-[18px] border border-[#d3dbe2] bg-white/40 p-4 text-[#1d2530] shadow-sm transition hover:-translate-y-1 hover:border-[#6ec1a5] hover:shadow-md">
              <div className="flex items-center justify-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[#66b79a] bg-[#edfaf4] text-2xl text-[#1f9f72]">📘</span>
              </div>
              <div className="mt-3 text-center text-[1.1rem] font-black leading-tight text-[#1c2430]">{subject.name}</div>
              <div className="mt-2 text-center text-sm text-[#4c5966]">{documentCount} document{documentCount > 1 ? 's' : ''}</div>
            </Link>
          );
        })}
      </div>

      <section className="card mt-8 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="section-label">Bibliothèque pédagogique</p>
            <h2 className="mt-2 text-2xl font-black text-emerald-50">Cours du niveau {currentSemester}</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="input" placeholder="Rechercher un cours" value={query} onChange={(event) => setQuery(event.target.value)} />
            <select className="input" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
              <option value="">Toutes les matières</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {courses.filter((course) => (!subjectFilter || course.subject_id === subjectFilter) && course.title.toLowerCase().includes(query.toLowerCase())).map((course) => (
            <article key={course.id} className="surface-muted p-4">
              <h3 className="font-bold text-emerald-50">{course.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{course.description || 'Cours disponible dans cette matière.'}</p>
              <p className="mt-3 text-xs text-slate-500">{course.level || currentSemester} • {course.semester || 'Semestre non précisé'}</p>
            </article>
          ))}
          {!courses.filter((course) => (!subjectFilter || course.subject_id === subjectFilter) && course.title.toLowerCase().includes(query.toLowerCase())).length && (
            <p className="text-slate-500">📚 Aucun cours disponible pour le moment.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default SubjectsPage;
