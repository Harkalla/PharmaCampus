import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { formatDate } from '../lib/api';
import { createQuestion, fetchQuestions } from '../lib/pharmaData';
import { QuestionItem, User } from '../types';

type CommunityPageProps = { user: User; onLogout: () => void; };

const CommunityPage = ({ user, onLogout }: CommunityPageProps) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Pharmacologie');

  const loadQuestions = async () => {
    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createQuestion({ title, content, category, subjectId: 'M1' });
    setTitle('');
    setContent('');
    loadQuestions();
  };

  return (
    <Layout user={user} title="Questions et entraide" onLogout={onLogout}>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <h3 className="text-xl font-bold text-slate-800">Poser une question</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input className="input" placeholder="Titre de la question" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {['Pharmacologie','Chimie','Galénique','Microbiologie','Pharmacognosie','Toxicologie','Biochimie','Pharmacie hospitalière','Autres'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <textarea className="input min-h-32" placeholder="Votre question..." value={content} onChange={(e) => setContent(e.target.value)} />
            <button className="primary-btn w-full" type="submit">Publier</button>
          </form>
        </div>

        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="card p-5">
              <div className="flex items-center gap-3">
                <img src={question.photo_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'} alt="user" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-slate-800">{question.first_name || 'Étudiant'} {question.last_name || ''}</div>
                  <div className="text-xs text-slate-500">{formatDate(question.created_at)} • {question.category}</div>
                </div>
              </div>
              <h4 className="mt-4 text-xl font-bold text-slate-900">{question.title}</h4>
              <p className="mt-2 text-slate-600">{question.content}</p>
              <div className="mt-4 space-y-2">
                {(question.answers || []).map((answer) => (
                  <div key={answer.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    {answer.content}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPage;
