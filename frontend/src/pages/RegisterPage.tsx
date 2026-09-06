import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { signUpWithSupabase } from '../lib/supabase';
import { User } from '../types';

type RegisterPageProps = {
  onLogin: (user: User, token: string) => void;
};

const RegisterPage = ({ onLogin }: RegisterPageProps) => {
  const [form, setForm] = useState({
    firstName: 'Amina',
    lastName: 'Khalid',
    email: 'amina@test.com',
    password: 'test1234',
    country: 'Maroc',
    city: 'Casablanca',
    university: 'Université Hassan II',
    level: 'Licence',
    semester: 'S5',
    bio: 'Étudiante en pharmacie, passionnée par la pharmacologie.',
    photoUrl: ''
  });
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await signUpWithSupabase({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        country: form.country,
        city: form.city,
        university: form.university,
        level: form.level,
        semester: form.semester,
        bio: form.bio,
        photoUrl: form.photoUrl
      });
      onLogin(response.user as User, response.token);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl card p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-300 text-2xl font-black text-[#06211b]">P</div>
          <h1 className="text-3xl font-black text-emerald-50">Créer un compte</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Nom</label>
            <input className="input" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Prénom</label>
            <input className="input" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Pays</label>
            <input className="input" value={form.country} onChange={(e) => handleChange('country', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Région / ville</label>
            <input className="input" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Faculté / université</label>
            <input className="input" value={form.university} onChange={(e) => handleChange('university', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Niveau d’études</label>
            <select className="input" value={form.level} onChange={(e) => handleChange('level', e.target.value)}>
              <option value="Licence">Licence</option>
              <option value="Master">Master</option>
              <option value="Doctorat">Doctorat</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Semestre</label>
            <select className="input" value={form.semester} onChange={(e) => handleChange('semester', e.target.value)}>
              {Array.from({ length: 10 }, (_, index) => `S${index + 1}`).map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-300">Mot de passe</label>
            <input type="password" className="input" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-300">Photo de profil (facultative)</label>
            <input className="input" value={form.photoUrl} onChange={(e) => handleChange('photoUrl', e.target.value)} placeholder="URL de l’image" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-300">Présentation</label>
            <textarea className="input min-h-24" value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} />
          </div>

          {error && <div className="md:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="primary-btn flex-1">Créer mon compte</button>
            <Link to="/login" className="secondary-btn flex-1">Déjà inscrit ?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
