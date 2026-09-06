import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}) : null;

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
}) {
  if (!supabase) {
    throw new Error('Supabase n’est pas configuré. Ajoutez les variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY.');
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
  if (user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
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
    });

    if (profileError) throw new Error(profileError.message);
  }

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

export async function signInWithSupabase(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase n’est pas configuré. Ajoutez les variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const profileResponse = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  const profile = profileResponse.data || {
    id: data.user.id,
    first_name: data.user.user_metadata?.first_name || '',
    last_name: data.user.user_metadata?.last_name || '',
    email: data.user.email,
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

export async function getSupabaseSessionUser() {
  if (!supabase) {
    return null;
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
