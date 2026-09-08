import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { UserRound } from 'lucide-react';

type ProfilePageProps = { user: User; onLogout: () => void; };

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 Mo
const PHOTO_BUCKET = 'pharmacampus-images';

const ProfilePage = ({ user, onLogout }: ProfilePageProps) => {
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activity, setActivity] = useState({ contributions: { total: 0, published: 0, pending: 0, refused: 0 }, quizzes: { total: 0, best: 0, average: 0 } });
  const [form, setForm] = useState({ firstName: user.first_name, lastName: user.last_name, country: user.country || '', city: user.city || '', university: user.university || '', level: user.level || 'Licence', semester: user.semester || 'S5', bio: user.bio || '' });

  useEffect(() => { apiFetch<typeof activity>('/profile/activity').then(setActivity).catch(() => undefined); }, []);

  // Génère un aperçu local de la photo choisie avant l'enregistrement, et le nettoie proprement.
  useEffect(() => {
    if (!photo) { setPhotoPreview(null); return; }
    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError(''); setMessage('');
    if (file) {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        setError('Format non supporté. Utilisez une image JPEG, PNG ou WEBP.');
        event.target.value = '';
        return;
      }
      if (file.size > MAX_PHOTO_SIZE) {
        setError('La photo ne doit pas dépasser 2 Mo.');
        event.target.value = '';
        return;
      }
    }
    setPhoto(file);
    setEditing(true);
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setMessage(''); setSaving(true);
    try {
      if (supabase) {
        // Architecture Supabase : upload de la photo dans le Storage puis mise à jour de la ligne "profiles".
        let photoUrl = user.photo_url || '';

        if (photo) {
          const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
          const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;
          const { error: uploadError } = await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(filePath, photo, { upsert: true, contentType: photo.type });
          if (uploadError) throw new Error(`Envoi de la photo impossible : ${uploadError.message}`);

          const { data: publicUrlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(filePath);
          photoUrl = publicUrlData.publicUrl;
        }

        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: form.firstName,
            last_name: form.lastName,
            country: form.country,
            city: form.city,
            university: form.university,
            level: form.level,
            semester: form.semester,
            bio: form.bio,
            photo_url: photoUrl
          })
          .eq('id', user.id)
          .select()
          .single();
        if (updateError) throw new Error(`Enregistrement du profil impossible : ${updateError.message}`);

        // Garde les métadonnées d'auth alignées (utilisées comme repli si la table "profiles" est vide).
        await supabase.auth.updateUser({ data: { first_name: form.firstName, last_name: form.lastName, photo_url: photoUrl } }).catch(() => undefined);

        Object.assign(user, updatedProfile);
        setMessage('Profil mis à jour avec succès.');
      } else {
        // Repli sur l'ancienne API locale (utilisée uniquement hors configuration Supabase, ex. développement local).
        const body = new FormData();
        Object.entries(form).forEach(([key, value]) => body.append(key, value));
        if (photo) body.append('photo', photo);
        const response = await apiFetch<{ user: typeof user; message: string }>('/profile', { method: 'PATCH', body });
        Object.assign(user, response.user);
        setMessage(response.message);
      }

      setPhoto(null);
      setEditing(false);
    } catch (err) {
      setError((err as Error).message || "L'enregistrement a échoué. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const displayedPhoto = photoPreview || user.photo_url;

  return (
    <Layout user={user} title="Mon profil" onLogout={onLogout}>
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {displayedPhoto ? <img src={displayedPhoto} alt={`Profil de ${user.first_name}`} className="h-28 w-28 rounded-full object-cover ring-4 ring-brand-300/20" /> : <div className="flex h-28 w-28 items-center justify-center rounded-full border border-brand-300/30 bg-brand-300/10 text-brand-300" aria-label="Profil sans photo"><UserRound size={38} /></div>}
          <div>
            <p className="section-label">Profil étudiant</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-50">{user.first_name} {user.last_name}</h2>
            <p className="mt-1 text-slate-400">{user.university || 'Faculté'} • {user.semester || 'S5'} • {user.level || 'Licence'}</p>
            <p className="mt-2 text-slate-400">{user.bio || 'Aucune biographie pour le moment.'}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3"><button className="primary-btn" onClick={() => setEditing((value) => !value)}>{editing ? 'Annuler' : 'Modifier mon profil'}</button><button className="secondary-btn" onClick={() => document.getElementById('profile-photo')?.click()}>Modifier la photo</button><input id="profile-photo" className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} /></div>
        {photoPreview && <p className="mt-2 text-sm text-slate-400">Nouvelle photo sélectionnée — cliquez sur « Enregistrer les modifications » pour la valider.</p>}
        {editing && <form className="mt-6 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2" onSubmit={saveProfile}><input className="input" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} placeholder="Nom" required /><input className="input" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="Prénom" required /><input className="input" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Pays" /><input className="input" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Ville / région" /><input className="input" value={form.university} onChange={(event) => setForm({ ...form, university: event.target.value })} placeholder="Faculté" /><select className="input" value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })}>{Array.from({ length: 10 }, (_, index) => <option key={index}>S{index + 1}</option>)}</select><textarea className="input md:col-span-2" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Présentation" /><div className="md:col-span-2"><button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</button></div></form>}
        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}{error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-muted p-4"><div className="text-sm text-slate-500">Contributions</div><div className="text-3xl font-bold text-brand-300">{activity.contributions.total}</div></div><div className="surface-muted p-4"><div className="text-sm text-slate-500">Validées</div><div className="text-3xl font-bold text-emerald-300">{activity.contributions.published}</div></div><div className="surface-muted p-4"><div className="text-sm text-slate-500">En attente / refusées</div><div className="text-3xl font-bold text-amber-300">{activity.contributions.pending} / {activity.contributions.refused}</div></div><div className="surface-muted p-4"><div className="text-sm text-slate-500">QCM / meilleur score</div><div className="text-3xl font-bold text-sky-300">{activity.quizzes.total} / {activity.quizzes.best}%</div></div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
