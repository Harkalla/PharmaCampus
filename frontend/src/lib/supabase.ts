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
