import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { Subject, Course, DocumentItem, User } from '../types';
import { formatDate } from '../lib/api';

type CoursePageProps = { user: User; onLogout: () => void; };

type SubjectDetail = {
  subject: Subject;
  courses: Course[];
  documents: DocumentItem[];
  exams: Array<{ id: string; title: string; year?: number; file_path?: string }>; 
  quizzes: Array<{ id: string; title: string }>; 
};

const CoursePage = ({ user, onLogout }: CoursePageProps) => {
  const { subjectId } = useParams();
  const [data, setData] = useState<SubjectDetail | null>(null);

  useEffect(() => {
    if (!subjectId) return;
    apiFetch<SubjectDetail>(`/subject/${subjectId}`).then((res) => setData(res)).catch(console.error);
  }, [subjectId]);

  return (
    <Layout user={user} title={data?.subject?.name || 'Matière'} onLogout={onLogout}>
      <div className="space-y-6">
        <section className="card p-6">
          <h2 className="text-2xl font-bold text-slate-900">{data?.subject?.name}</h2>
          <p className="mt-2 text-slate-600">{data?.subject?.description}</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h3 className="mb-4 text-xl font-bold text-slate-800">Cours disponibles</h3>
            <div className="space-y-3">
              {data?.courses?.map((course) => (
                <div key={course.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="font-semibold text-slate-800">{course.title}</div>
                  <div className="text-sm text-slate-600">{course.description}</div>
                </div>
              )) || <div className="text-slate-500">Aucun cours disponible.</div>}
            </div>
          </section>

          <section className="card p-6">
            <h3 className="mb-4 text-xl font-bold text-slate-800">Documents</h3>
            <div className="space-y-3">
              {data?.documents?.map((document) => (
                <article key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-slate-800">{document.title}</h4><p className="mt-1 text-xs text-slate-500">{document.type || 'Document'} • {document.category || 'Autre'} • {formatDate(document.created_at)}</p></div><span className="text-xs text-slate-500">{document.file_size ? `${Math.round(document.file_size / 1024)} Ko` : 'Taille inconnue'}</span></div>
                  <p className="mt-2 text-sm text-slate-600">{document.description || 'Ressource pédagogique du module.'}</p>
                  <a href={document.file_url || `http://localhost:4000${document.file_path || ''}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">Ouvrir</a>
                </article>
              )) || <div className="text-slate-500">Aucun document.</div>}
            </div>
          </section>
        </div>

        <section className="card p-6">
          <h3 className="mb-4 text-xl font-bold text-slate-800">QCM et examens</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {data?.quizzes?.map((quiz) => (
              <div key={quiz.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="font-semibold text-slate-800">{quiz.title}</div>
              </div>
            ))}
            {data?.exams?.map((exam) => (
              <div key={exam.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="font-semibold text-slate-800">{exam.title}</div>
                <div className="text-sm text-slate-600">Année {exam.year || '2025'}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CoursePage;
