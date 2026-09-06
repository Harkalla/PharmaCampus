import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { signUpWithSupabase } from '../lib/supabase';
import { User } from '../types';

type RegisterPageProps = {
  onLogin: (user: User, token: string) => void;
};

const countryCities: Record<string, string[]> = {
  Niger: ['Niamey', 'Maradi', 'Zinder'], Mali: ['Bamako', 'Sikasso', 'Mopti'], Senegal: ['Dakar', 'Thiès', 'Saint-Louis'],
  "Côte d'Ivoire": ['Yamoussoukro', 'Abidjan', 'Bouaké'], 'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou'], Guinée: ['Conakry', 'Nzérékoré', 'Kindia'], Bénin: ['Porto-Novo', 'Cotonou', 'Abomey-Calavi'], Togo: ['Lomé', 'Sokodé', 'Kara'], Ghana: ['Accra', 'Kumasi', 'Tamale'], Nigeria: ['Abuja', 'Lagos', 'Kano'], Mauritanie: ['Nouakchott', 'Nouadhibou', 'Rosso'],
  Cameroun: ['Yaoundé', 'Douala', 'Bafoussam'], Tchad: ["N'Djamena", 'Moundou', 'Sarh'], 'République centrafricaine': ['Bangui', 'Bimbo', 'Berbérati'], 'République démocratique du Congo': ['Kinshasa', 'Lubumbashi', 'Goma'], 'République du Congo': ['Brazzaville', 'Pointe-Noire', 'Dolisie'], Gabon: ['Libreville', 'Port-Gentil', 'Franceville'],
  Maroc: ['Rabat', 'Casablanca', 'Fès'], Algérie: ['Alger', 'Oran', 'Constantine'], Tunisie: ['Tunis', 'Sfax', 'Sousse'], France: ['Paris', 'Lyon', 'Marseille'], Belgique: ['Bruxelles', 'Anvers', 'Liège'], Canada: ['Ottawa', 'Montréal', 'Toronto'], Suisse: ['Berne', 'Genève', 'Zurich']
};

const countries = Object.keys(countryCities);
const facultiesByCity: Record<string, string[]> = { Casablanca: ['Université Hassan II'] };

const RegisterPage = ({ onLogin }: RegisterPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', passwordConfirmation: '',
    country: '', city: '', cityOther: '', university: '', universityOther: '', level: '', semester: '', bio: '',
    photoUrl: ''
  });
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value, ...(field === 'country' ? { city: '', cityOther: '', university: '', universityOther: '' } : {}), ...(field === 'city' ? { university: '', universityOther: '' } : {}) }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[A-Za-z0-9]{6,8}$/.test(form.password) || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError('Le mot de passe doit contenir 6 à 8 caractères, uniquement des lettres et chiffres, avec au moins une lettre et un chiffre.');
      return;
    }
    if (form.password !== form.passwordConfirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setError('');
    try {
      const response = await signUpWithSupabase({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        country: form.country,
        city: form.city === 'Autre' ? form.cityOther : form.city,
        university: form.university === 'Autre' ? form.universityOther : form.university,
        level: form.level,
        semester: form.semester,
        bio: form.bio,
        photoUrl: form.photoUrl
      });
      if (response.user) onLogin(response.user, response.token);
      else setError('Compte créé. Vérifiez votre adresse email avant de vous connecter.');
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
            <input className="input" placeholder="Abdoul Majid" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Prénom</label>
            <input className="input" placeholder="Harouna Idi" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Pays</label>
            <input className="input" list="country-options" value={form.country} onChange={(e) => handleChange('country', e.target.value)} placeholder="Rechercher un pays" required /><datalist id="country-options">{countries.map((country) => <option key={country} value={country} />)}</datalist>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Région / ville</label>
            <select className="input" value={form.city} onChange={(e) => handleChange('city', e.target.value)} disabled={!countryCities[form.country]} required><option value="">Sélectionner une ville</option>{(countryCities[form.country] || []).map((city) => <option key={city}>{city}</option>)}{form.country && <option value="Autre">Autre</option>}</select>
            {form.city === 'Autre' && <input className="input mt-2" placeholder="Entrez votre ville/région" value={form.cityOther} onChange={(e) => setForm({ ...form, cityOther: e.target.value })} required />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Faculté / université</label>
            <select className="input" value={form.university} onChange={(e) => handleChange('university', e.target.value)} disabled={!form.city} required><option value="">Sélectionner une faculté</option>{(facultiesByCity[form.city] || []).map((faculty) => <option key={faculty}>{faculty}</option>)}<option value="Autre">Autre</option></select>
            {form.university === 'Autre' && <input className="input mt-2" placeholder="Nom de votre faculté / établissement" value={form.universityOther} onChange={(e) => setForm({ ...form, universityOther: e.target.value })} required />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Niveau d’études</label>
            <select className="input" value={form.level} onChange={(e) => handleChange('level', e.target.value)} required><option value="">Sélectionner un niveau</option>{Array.from({ length: 10 }, (_, index) => <option key={index} value={`S${index + 1}`}>S{index + 1}</option>)}</select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Semestre</label>
            <select className="input" value={form.semester} onChange={(e) => handleChange('semester', e.target.value)} required>
              <option value="">Sélectionner un semestre</option>
              {Array.from({ length: 10 }, (_, index) => `S${index + 1}`).map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input type="email" className="input" placeholder="pharmacampus@gmail.com" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-300">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-24"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                minLength={6}
                maxLength={8}
                pattern="(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{6,8}"
                title="6 à 8 caractères, avec au moins une lettre et un chiffre"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm font-semibold text-brand-700"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">6 à 8 caractères, uniquement lettres et chiffres, avec au moins une lettre et un chiffre.</p>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-300">Confirmation du mot de passe</label>
            <div className="relative">
              <input
                type={showConfirmation ? 'text' : 'password'}
                className="input pr-24"
                value={form.passwordConfirmation}
                onChange={(e) => handleChange('passwordConfirmation', e.target.value)}
                minLength={6}
                maxLength={8}
                required
              />
              <button type="button" className="absolute inset-y-0 right-3 text-sm font-semibold text-brand-700" onClick={() => setShowConfirmation((visible) => !visible)} aria-label={showConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'}>
                {showConfirmation ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {form.passwordConfirmation && form.password !== form.passwordConfirmation && <p className="mt-1 text-xs text-red-300">Les mots de passe ne correspondent pas.</p>}
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-300">Photo de profil (facultative)</label>
            <input className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setError(e.target.files?.[0] ? 'La photo sera disponible dans la modification du profil après création du compte.' : '')} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-300">Présentation</label>
            <textarea className="input min-h-24" placeholder="Votre présentation (facultative)" value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} />
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
