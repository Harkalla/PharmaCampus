import { createClient } from '@supabase/supabase-js';
import { apiFetch } from './api';
import { User } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}) : null;

type AuthResponse = { user: User | null; token: string };

function normalizeProfileFromUser(user: { id: string; email?: string | null; user_metadata?: Record<string, any> } | null, fallback?: Partial<User>) {
  if (!user) return null;

  return {
    id: user.id,
    first_name: user.user_metadata?.first_name || fallback?.first_name || '',
    last_name: user.user_metadata?.last_name || fallback?.last_name || '',
    email: user.email || fallback?.email || '',
    country: user.user_metadata?.country || fallback?.country || '',
    city: user.user_metadata?.city || fallback?.city || '',
    university: user.user_metadata?.university || fallback?.university || '',
    level: user.user_metadata?.level || fallback?.level || '',
    semester: user.user_metadata?.semester || fallback?.semester || '',
    bio: user.user_metadata?.bio || fallback?.bio || '',
    photo_url: user.user_metadata?.photo_url || fallback?.photo_url || '',
    role: fallback?.role || 'user'
  } as User;
}

async function ensureProfileForUser(user: { id: string; email?: string | null; user_metadata?: Record<string, any> } | null, fallback?: Partial<User>) {
  if (!supabase || !user) return null;

  const profile = normalizeProfileFromUser(user, fallback);
  if (!profile) return null;

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      country: profile.country,
      city: profile.city,
      university: profile.university,
      level: profile.level,
      semester: profile.semester,
      bio: profile.bio,
      photo_url: profile.photo_url,
      role: profile.role
    }, { onConflict: 'id' });

  if (error) {
    console.error('[auth] Impossible de créer ou mettre à jour le profil Supabase:', error);
    return null;
  }

  return profile;
}

export async function signUpWithSupabase(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country?: string;
  city?: string;
  university?: string;
  level?: string;
  semester?: string;
  bio?: string;
  photoUrl?: string;
}): Promise<AuthResponse> {
  const normalizedEmail = payload.email.trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Adresse email invalide.');
  }
  if (!/^[A-Za-z0-9]{6,8}$/.test(payload.password) || !/[A-Za-z]/.test(payload.password) || !/[0-9]/.test(payload.password)) {
    throw new Error('Le mot de passe doit contenir 6 à 8 caractères, uniquement des lettres et chiffres, avec au moins une lettre et un chiffre.');
  }

  if (!supabase) {
    return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ ...payload, email: normalizedEmail }) });
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: payload.password,
    options: {
      data: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        country: payload.country || '',
        city: payload.city || '',
        university: payload.university || '',
        level: payload.level || '',
        semester: payload.semester || '',
        bio: payload.bio || '',
        photo_url: payload.photoUrl || ''
      }
    }
  });

  if (error) throw new Error(error.message);

  const user = data.user;
  if (user) {
    await ensureProfileForUser(user, {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: normalizedEmail,
      country: payload.country || '',
      city: payload.city || '',
      university: payload.university || '',
      level: payload.level || '',
      semester: payload.semester || '',
      bio: payload.bio || '',
      photo_url: payload.photoUrl || '',
      role: 'user'
    });
  }

  return {
    user: user && data.session ? normalizeProfileFromUser(user, {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: normalizedEmail,
      country: payload.country || '',
      city: payload.city || '',
      university: payload.university || '',
      level: payload.level || '',
      semester: payload.semester || '',
      bio: payload.bio || '',
      photo_url: payload.photoUrl || '',
      role: 'user'
    }) : null,
    token: data.session?.access_token || ''
  };
}

export async function signInWithSupabase(email: string, password: string): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) throw new Error('Email et mot de passe requis.');

  if (!supabase) {
    return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email: normalizedEmail, password }) });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error('Votre email n’est pas encore confirmé. Consultez votre boîte de réception.');
    }
    throw new Error('Email ou mot de passe incorrect. Vérifiez vos identifiants Supabase.');
  }
  if (!data.session?.access_token || !data.user) throw new Error('Connexion réussie mais session Supabase absente.');

  let profileResponse = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profileResponse.data) {
    const repairedProfile = await ensureProfileForUser(data.user, {
      email: data.user.email || normalizedEmail
    });
    if (repairedProfile) {
      profileResponse = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
    }
  }

  const profile = profileResponse.data || normalizeProfileFromUser(data.user, {
    email: data.user.email || normalizedEmail,
    role: 'user'
  });

  if (!profile) {
    throw new Error('Aucun profil n’a été trouvé pour cet utilisateur. Vérifiez la configuration de la table profiles dans Supabase.');
  }

  return {
    user: profile,
    token: data.session?.access_token || ''
  };
}

export async function requestPasswordReset(email: string) {
  if (!supabase) throw new Error('La récupération par email nécessite la configuration de Supabase Auth.');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/settings` });
  if (error) throw new Error(error.message);
  return 'Un lien de réinitialisation a été envoyé à cette adresse email.';
}

export async function getSupabaseSessionUser() {
  if (!supabase) {
    const token = localStorage.getItem('pharmacampus_token');
    if (!token) return null;
    try {
      const response = await apiFetch<{ user: User }>('/auth/me');
      return { ...response.user, token };
    } catch {
      localStorage.removeItem('pharmacampus_token');
      return null;
    }
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) {
    return null;
  }

  let profileResponse = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profileResponse.data) {
    const repairedProfile = await ensureProfileForUser(session.user, {
      email: session.user.email || ''
    });
    if (repairedProfile) {
      profileResponse = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
    }
  }

  return {
    ...(profileResponse.data || normalizeProfileFromUser(session.user, {
      email: session.user.email || '',
      role: 'user'
    }) || {
      id: session.user.id,
      first_name: session.user.user_metadata?.first_name || '',
      last_name: session.user.user_metadata?.last_name || '',
      email: session.user.email || '',
      country: session.user.user_metadata?.country || '',
      city: session.user.user_metadata?.city || '',
      university: session.user.user_metadata?.university || '',
      level: session.user.user_metadata?.level || '',
      semester: session.user.user_metadata?.semester || '',
      bio: session.user.user_metadata?.bio || '',
      photo_url: session.user.user_metadata?.photo_url || '',
      role: 'user'
    }),
    token: session.access_token
  };
}

export async function createAdminDocument(payload: {
  title: string;
  description?: string;
  category?: string;
  moduleId: string;
  semester: string;
  type: string;
  file?: File | null;
  fileUrl?: string;
}) {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Session Supabase requise.');

  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileError || profile?.role !== 'admin') throw new Error('Accès réservé à l’administrateur.');

  let filePath = payload.fileUrl || null;
  let fileSize = null;
  let fileName = payload.file?.name || payload.fileUrl || null;

  if (payload.file) {
    const safeName = payload.file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    filePath = `${payload.semester}/${payload.moduleId}/${crypto.randomUUID()}-${safeName}`;
    fileSize = payload.file.size;
    const { error: uploadError } = await supabase.storage.from('pharmacampus-documents').upload(filePath, payload.file, { upsert: false, contentType: payload.file.type });
    if (uploadError) throw new Error(`Upload Storage impossible : ${uploadError.message}`);
  }

  const { data: module, error: moduleError } = await supabase.from('modules').select('id, semester_id').eq('id', payload.moduleId).single();
  if (moduleError || !module) throw new Error('Module Supabase introuvable.');

  const { data, error } = await supabase.from('documents').insert({
    title: payload.title,
    description: payload.description || '',
    module_id: module.id,
    semester_id: module.semester_id,
    semester: payload.semester,
    type: payload.type,
    category: payload.category || 'Autre',
    file_name: fileName,
    file_path: filePath,
    file_url: payload.fileUrl || null,
    file_size: fileSize,
    status: 'published',
    submitted_by: user.id,
    author: user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : 'Administrateur'
  }).select().single();

  if (error) {
    if (payload.file && filePath) await supabase.storage.from('pharmacampus-documents').remove([filePath]);
    throw new Error(`Enregistrement Supabase impossible : ${error.message}`);
  }
  return data;
}

export async function createStudentContribution(payload: {
  title: string;
  description?: string;
  moduleId: string;
  semester: string;
  category: string;
  type: string;
  year?: number;
  file: File;
}) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Session Supabase requise.');
  if (payload.file.size > 20 * 1024 * 1024) throw new Error('Le fichier ne doit pas dépasser 20 Mo.');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role === 'admin') throw new Error('Un administrateur ne peut pas envoyer une proposition étudiante.');

  const { data: subject } = await supabase.from('subjects').select('id').eq('module_id', payload.moduleId).maybeSingle();
  const { data: module } = await supabase.from('modules').select('semester_id').eq('id', payload.moduleId).single();
  const safeName = payload.file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const filePath = `contributions/${payload.semester}/${payload.moduleId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from('pharmacampus-documents').upload(filePath, payload.file, { upsert: false, contentType: payload.file.type });
  if (uploadError) throw new Error(`Upload impossible : ${uploadError.message}`);

  const { data, error } = await supabase.from('document_contributions').insert({
    user_id: user.id,
    title: payload.title,
    description: payload.description || '',
    subject_id: subject?.id || null,
    module_id: payload.moduleId,
    semester_id: module?.semester_id || null,
    semester: payload.semester,
    category: payload.category,
    type: payload.type,
    year: payload.year || null,
    file_name: payload.file.name,
    file_path: filePath,
    file_size: payload.file.size,
    status: 'pending'
  }).select().single();
  if (error) {
    await supabase.storage.from('pharmacampus-documents').remove([filePath]);
    throw new Error(`Proposition impossible à enregistrer : ${error.message}`);
  }
  return data;
}

export async function fetchMySupabaseContributions() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Session Supabase requise.');
  const { data, error } = await supabase.from('document_contributions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchPendingSupabaseContributions() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('document_contributions').select('*').eq('status', 'pending').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchSupabaseAdminSummary() {
  if (!supabase) return null;
  const tables = ['profiles', 'subjects', 'documents', 'courses', 'exams', 'quizzes', 'medicines'] as const;
  const counts = await Promise.all(tables.map(async (table) => {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return count || 0;
  }));
  const { count: pendingDocuments, error: pendingError } = await supabase.from('document_contributions').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  if (pendingError) throw new Error(pendingError.message);
  const { count: publishedDocuments, error: publishedError } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'published');
  if (publishedError) throw new Error(publishedError.message);
  return { counts: { users: counts[0], subjects: counts[1], documents: counts[2], courses: counts[3], exams: counts[4], quizzes: counts[5], medicines: counts[6], publishedDocuments: publishedDocuments || 0, pendingDocuments: pendingDocuments || 0, refusedDocuments: 0, suggestions: 0, reports: 0 } };
}

export async function reviewSupabaseContribution(id: string, status: 'published' | 'refused', rejectionReason?: string) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Session Supabase requise.');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Accès réservé à l’administrateur.');

  const { data: contribution, error: contributionError } = await supabase.from('document_contributions').select('*').eq('id', id).single();
  if (contributionError || !contribution) throw new Error('Proposition introuvable.');

  if (status === 'published') {
    const { error: documentError } = await supabase.from('documents').insert({
      title: contribution.title,
      description: contribution.description,
      subject_id: contribution.subject_id,
      module_id: contribution.module_id,
      semester_id: contribution.semester_id,
      semester: contribution.semester,
      category: contribution.category,
      type: contribution.type,
      file_name: contribution.file_name,
      file_path: contribution.file_path,
      file_size: contribution.file_size,
      status: 'published',
      submitted_by: contribution.user_id,
      year: contribution.year,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    });
    if (documentError) throw new Error(`Publication impossible : ${documentError.message}`);
  }

  const { error } = await supabase.from('document_contributions').update({ status, rejection_reason: rejectionReason || null, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}
