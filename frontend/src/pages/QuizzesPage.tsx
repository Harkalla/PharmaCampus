import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswers: string[];
  explanation: string;
};

type QuizItem = {
  id: string;
  title: string;
  subject_id?: string;
  questions: string;
};

type QuizzesPageProps = { user: User; onLogout: () => void; };

const QuizzesPage = ({ user, onLogout }: QuizzesPageProps) => {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    apiFetch<{ quizzes: QuizItem[] }>('/quizzes').then((res) => setQuizzes(res.quizzes)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedQuiz) return;
    setQuestions(JSON.parse(selectedQuiz.questions || '[]')); setQuestionIndex(0); setAnswers({}); setResult(null);
  }, [selectedQuiz]);

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((current) => {
      const selected = current[questionId] || [];
      const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
      return { ...current, [questionId]: next };
    });
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;
    const response = await apiFetch<{ score: number; total: number; percentage: number }>('/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId: selectedQuiz.id, answers })
    });
    setResult(response);
  };

  return (
    <Layout user={user} title="QCM et exercices" onLogout={onLogout}>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card p-6">
          <h3 className="text-xl font-bold text-slate-800">QCM disponibles</h3>
          <div className="mt-4 space-y-3">
            {quizzes.map((quiz) => (
              <button key={quiz.id} className="w-full rounded-2xl border border-slate-200 p-3 text-left hover:border-brand-300" onClick={() => setSelectedQuiz(quiz)}>
                {quiz.title}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          {selectedQuiz ? (
            <>
              <h3 className="text-2xl font-bold text-slate-900">{selectedQuiz.title}</h3>
              <div className="mt-3 text-sm text-slate-500">Question {questions.length ? questionIndex + 1 : 0} / {questions.length}</div>
              <div className="mt-5 space-y-5">
                {questions.slice(questionIndex, questionIndex + 1).map((question) => (
                  <div key={question.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 font-semibold text-slate-800">{questionIndex + 1}. {question.question}</div>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label key={option} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={answers[question.id]?.includes(option) || false}
                            onChange={() => handleAnswer(question.id, option)}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="secondary-btn" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}>Précédente</button>{questionIndex < questions.length - 1 ? <button className="primary-btn" onClick={() => setQuestionIndex((index) => index + 1)}>Suivante</button> : <button className="primary-btn" onClick={submitQuiz}>Terminer le QCM</button>}
              </div>
              {result && (
                <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                  Résultat : {result.score}/{result.total} ({result.percentage}%)
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500">{quizzes.length ? 'Sélectionnez un quiz pour commencer.' : '❓ Aucun QCM disponible pour le moment.'}</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuizzesPage;
