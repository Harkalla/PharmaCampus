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
  if (!/^[A-Za-z0-9]{6,8}$/.test(payload.password) || !/[A-Za-z]/.test(payload.password) || !/[0-9]/.test(payload.password)) {
    throw new Error('Le mot de passe doit contenir 6 à 8 caractères, uniquement des lettres et chiffres, avec au moins une lettre et un chiffre.');
  }

  if (!supabase) {
    return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
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

  return {
    user: user ? {
      id: user.id,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      country: payload.country || '',
      city: payload.city || '',
      university: payload.university || '',
      level: payload.level || '',
      semester: payload.semester || '',
      bio: payload.bio || '',
      photo_url: payload.photoUrl || '',
      role: 'user'
    } : null,
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

  const profileResponse = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  const profile = profileResponse.data || {
    id: data.user.id,
    first_name: data.user.user_metadata?.first_name || '',
    last_name: data.user.user_metadata?.last_name || '',
    email: data.user.email || normalizedEmail,
    country: data.user.user_metadata?.country || '',
    city: data.user.user_metadata?.city || '',
    university: data.user.user_metadata?.university || '',
    level: data.user.user_metadata?.level || '',
    semester: data.user.user_metadata?.semester || '',
    bio: data.user.user_metadata?.bio || '',
    photo_url: data.user.user_metadata?.photo_url || '',
    role: 'user'
  };

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  return {
    ...(profile || {
      id: session.user.id,
      first_name: session.user.user_metadata?.first_name || '',
      last_name: session.user.user_metadata?.last_name || '',
      email: session.user.email,
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
