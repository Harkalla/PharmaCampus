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
  const [resourceKind, setResourceKind] = useState<'document' | 'image' | 'url' | null>(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceCategory, setResourceCategory] = useState('Cours');
  const [resourceModule, setResourceModule] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceError, setResourceError] = useState('');
  const [resourceSaving, setResourceSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchSubjects(semester || 'S5'), apiFetch<{ courses: Course[] }>('/courses')]).then(([items, response]) => {
      setSubjects(items);
      setCourses(response.courses.filter((course) => course.semester === (semester || 'S5')));
    }).catch(console.error);
  }, [semester]);

  const currentSemester = semester || 'S5';

  const openResourceModal = (kind: 'document' | 'image' | 'url') => {
    setResourceKind(kind);
    setResourceModule(subjects[0]?.module_id || subjects[0]?.id || '');
    setResourceTitle('');
    setResourceDescription('');
    setResourceUrl('');
    setResourceFile(null);
    setResourceError('');
  };

  const saveResource = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resourceKind || !resourceModule) return;
    setResourceSaving(true);
    setResourceError('');
    const body = new FormData();
    body.append('title', resourceTitle);
    body.append('description', resourceDescription);
    body.append('category', resourceCategory);
    body.append('moduleId', resourceModule);
    body.append('semester', currentSemester);
    body.append('type', resourceKind === 'image' ? 'Image' : resourceKind === 'url' ? 'URL' : 'Document');
    if (resourceUrl) body.append('fileUrl', resourceUrl);
    if (resourceFile) body.append('file', resourceFile);
    try {
      await apiFetch('/admin/documents', { method: 'POST', body });
      setResourceKind(null);
      const refreshed = await fetchSubjects(currentSemester);
      setSubjects(refreshed);
    } catch (error) {
      setResourceError((error as Error).message);
    } finally {
      setResourceSaving(false);
    }
  };

  return (
    <Layout user={user} title={`Semestre ${currentSemester}`} onLogout={onLogout}>
      {user.role === 'admin' && (
        <div className="mb-8 rounded-[22px] border border-[#bfead2] bg-[#dff5eb] p-5 text-[#1b2f2a] shadow-sm">
          <p className="text-lg font-extrabold text-[#1d2f2d]">Mode administrateur — ajoutez et gérez les ressources officielles.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button type="button" onClick={() => openResourceModal('document')} className="rounded-xl bg-[#d94d5b] px-4 py-3 text-left text-lg font-bold text-white shadow-sm">Ajouter un document</button>
            <button type="button" onClick={() => openResourceModal('image')} className="rounded-xl bg-[#7a4be6] px-4 py-3 text-left text-lg font-bold text-white shadow-sm">Ajouter une image</button>
            <button type="button" onClick={() => openResourceModal('url')} className="rounded-xl bg-[#197ec3] px-4 py-3 text-left text-lg font-bold text-white shadow-sm">Ajouter une URL</button>
          </div>
        </div>
      )}

      <div className="mb-6 text-[20px] font-bold text-[#1f2b32]">
        {subjects.length ? `Tous les niveaux > ${currentSemester}` : 'Chargement des modules...'}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {subjects.map((subject) => {
          const documentCount = Number(subject.document_count || 0);
          const moduleId = subject.module_id || subject.id;
          return (
            <Link key={subject.id} to={`/matiere/${moduleId}`} className="group flex min-h-[180px] flex-col justify-between rounded-[18px] border border-[#d3dbe2] bg-white/40 p-4 text-[#1d2530] shadow-sm transition hover:-translate-y-1 hover:border-[#6ec1a5] hover:shadow-md">
              <div className="flex items-center justify-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[#66b79a] bg-[#edfaf4] text-2xl text-[#1f9f72]">📘</span>
              </div>
              <div className="mt-3 text-center text-[1.1rem] font-black leading-tight text-[#1c2430]">{subject.name}</div>
              <div className="mt-3 space-y-1 text-center text-xs text-[#4c5966]"><div>📚 {subject.course_count || 0} cours</div><div>📄 {documentCount} document{documentCount > 1 ? 's' : ''}</div><div>❓ {subject.quiz_count || 0} QCM · 📝 {subject.exam_count || 0} examens</div><div>🔬 {subject.practical_count || 0} TP</div></div>
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

      {resourceKind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <form onSubmit={saveResource} className="w-full max-w-xl rounded-2xl bg-[#10231f] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black text-emerald-50">Ajouter {resourceKind === 'image' ? 'une image' : resourceKind === 'url' ? 'une URL' : 'un document'}</h2><button type="button" className="secondary-btn" onClick={() => setResourceKind(null)}>Fermer</button></div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="input md:col-span-2" required placeholder="Titre *" value={resourceTitle} onChange={(event) => setResourceTitle(event.target.value)} />
              <select className="input" required value={resourceModule} onChange={(event) => setResourceModule(event.target.value)}>{subjects.map((subject) => <option key={subject.id} value={subject.module_id || subject.id}>{subject.name}</option>)}</select>
              <select className="input" value={resourceCategory} onChange={(event) => setResourceCategory(event.target.value)}><option>Cours</option><option>TP</option><option>QCM</option><option>Examen</option><option>Autre</option></select>
              <textarea className="input md:col-span-2" placeholder="Description" value={resourceDescription} onChange={(event) => setResourceDescription(event.target.value)} />
              {resourceKind === 'url' ? <input className="input md:col-span-2" required type="url" placeholder="https://..." value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} /> : <input className="input md:col-span-2" required type="file" accept={resourceKind === 'image' ? 'image/jpeg,image/png,image/webp' : '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'} onChange={(event) => setResourceFile(event.target.files?.[0] || null)} />}
            </div>
            {resourceError && <p className="mt-3 text-sm text-red-300">{resourceError}</p>}
            <div className="mt-6 flex justify-end gap-3"><button type="button" className="secondary-btn" onClick={() => setResourceKind(null)}>Annuler</button><button type="submit" className="primary-btn" disabled={resourceSaving}>{resourceSaving ? 'Enregistrement...' : 'Enregistrer'}</button></div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default SubjectsPage;
