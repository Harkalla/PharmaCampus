import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { Subject, Course, DocumentItem, User } from '../types';

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
                <a key={document.id} href={`http://localhost:4000${document.file_path || '/uploads/sample.pdf'}`} target="_blank" rel="noreferrer" className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 hover:border-brand-300">
                  {document.title}
                </a>
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
