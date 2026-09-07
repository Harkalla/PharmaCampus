import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSubjects } from '../lib/pharmaData';
import { apiFetch } from '../lib/api';
import { Course } from '../types';
import { Subject, User } from '../types';
import { BookOpen, FileImage, FileText, Link2 } from 'lucide-react';

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
        <div className="academic-admin-bar mb-8 rounded-[18px] border border-[#c7d7e8] bg-[#e7f0fa] p-5 text-[#142438] shadow-sm">
          <p className="text-lg font-extrabold text-[#142438]">Mode administrateur — ajoutez et gérez les ressources officielles.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button type="button" onClick={() => openResourceModal('document')} className="academic-admin-button academic-admin-button--document"><FileText size={20} />Ajouter un document</button>
            <button type="button" onClick={() => openResourceModal('image')} className="academic-admin-button academic-admin-button--image"><FileImage size={20} />Ajouter une image</button>
            <button type="button" onClick={() => openResourceModal('url')} className="academic-admin-button academic-admin-button--url"><Link2 size={20} />Ajouter une URL</button>
          </div>
        </div>
      )}

      <div className="mb-6 text-[19px] font-bold text-[#253449]">
        {subjects.length ? `Tous les niveaux > ${currentSemester}` : 'Chargement des modules...'}
      </div>

      <div className="academic-module-grid grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {subjects.map((subject) => {
          const documentCount = Number(subject.document_count || 0);
          const moduleId = subject.module_id || subject.id;
          return (
            <Link key={subject.id} to={`/matiere/${moduleId}`} className="academic-module-card group flex min-h-[180px] flex-col justify-between rounded-[18px] border border-[#cbd5e1] bg-white p-4 text-[#142438] shadow-[0_3px_12px_rgba(65,84,110,0.08)] transition hover:-translate-y-1 hover:border-[#77a8d2] hover:shadow-[0_8px_18px_rgba(65,84,110,0.14)]">
              <div className="flex items-center justify-start">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#9db4ca] bg-[#f3f7fb] text-[#18344d]"><BookOpen size={25} strokeWidth={1.8} /></span>
              </div>
              <div className="mt-3 text-left text-[1.08rem] font-black leading-tight text-[#142438]">{subject.name}</div>
              <div className="mt-3 text-left text-xs text-[#526174]">📄 {documentCount} document{documentCount > 1 ? 's' : ''}</div>
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
