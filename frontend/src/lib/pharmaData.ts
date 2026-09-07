import { supabase } from './supabase';
import { apiFetch } from './api';
import { Subject, DocumentItem, Medicine, QuestionItem } from '../types';

export async function fetchSubjects(semester?: string): Promise<Subject[]> {
  try {
    const response = await apiFetch<{ subjects: Subject[] }>(semester ? `/subjects?semester=${encodeURIComponent(semester)}` : '/subjects');
    if (response.subjects.length) return response.subjects;
  } catch {
    // The Supabase fallback keeps the existing hosted setup usable.
  }
  if (supabase) {
    let query = supabase.from('subjects').select('*');
    if (semester) query = query.eq('semester', semester);
    const { data, error } = await query.order('name');
    if (!error && data) return data as Subject[];
  }

  const response = await apiFetch<{ subjects: Subject[] }>(semester ? `/subjects?semester=${encodeURIComponent(semester)}` : '/subjects');
  return response.subjects;
}

export async function fetchSubjectById(subjectId: string) {
  try {
    return await apiFetch(`/subject/${subjectId}`);
  } catch {
    // Continue with Supabase when the local API is unavailable.
  }
  if (supabase) {
    const { data: subject, error: subjectError } = await supabase.from('subjects').select('*').eq('id', subjectId).maybeSingle();
    if (!subjectError && subject) {
      const [{ data: courses }, { data: documents }, { data: exams }, { data: quizzes }] = await Promise.all([
        supabase.from('courses').select('*').eq('subject_id', subjectId),
        supabase.from('documents').select('*').eq('subject_id', subjectId),
        supabase.from('exams').select('*').eq('subject_id', subjectId),
        supabase.from('quizzes').select('*').eq('subject_id', subjectId)
      ]);
      return { subject, courses: courses || [], documents: documents || [], exams: exams || [], quizzes: quizzes || [] };
    }
  }

  return apiFetch(`/subject/${subjectId}`);
}

export async function fetchDocuments(query?: string): Promise<DocumentItem[]> {
  if (supabase) {
    let q = supabase.from('documents').select('*').eq('status', 'published');
    if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (!error && data) return data as DocumentItem[];
  }

  const response = await apiFetch<{ documents: DocumentItem[] }>(query ? `/documents?q=${encodeURIComponent(query)}` : '/documents');
  return response.documents;
}

export async function fetchExams(): Promise<any[]> {
  if (supabase) {
    const { data, error } = await supabase.from('exams').select('*').order('year', { ascending: false });
    if (!error && data) return data;
  }
  const response = await apiFetch<{ exams: any[] }>('/exams');
  return response.exams;
}

export async function fetchMedicines(query?: string): Promise<Medicine[]> {
  if (supabase) {
    let q = supabase.from('medicines').select('*');
    if (query) q = q.or(`name.ilike.%${query}%,dci.ilike.%${query}%`);
    const { data, error } = await q.order('name');
    if (!error && data) return data as Medicine[];
  }

  const response = await apiFetch<{ medicines: Medicine[] }>(query ? `/medicines?q=${encodeURIComponent(query)}` : '/medicines');
  return response.medicines;
}

export async function fetchQuestions(): Promise<QuestionItem[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data as QuestionItem[];
  }

  const response = await apiFetch<{ questions: QuestionItem[] }>('/questions');
  return response.questions;
}

export async function createQuestion(payload: { title: string; content: string; category?: string; subjectId?: string }) {
  if (supabase) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Utilisateur non connecté.');

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      title: payload.title,
      content: payload.content,
      category: payload.category || 'Autres',
      subject_id: payload.subjectId || 'general'
    });

    if (!error) return { message: 'Question publiée.' };
  }

  return apiFetch('/questions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
