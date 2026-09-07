import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset, signInWithSupabase } from '../lib/supabase';
import { User } from '../types';

type LoginPageProps = {
  onLogin: (user: User, token: string) => void;
};

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await signInWithSupabase(email, password);
      if (response.user) onLogin(response.user, response.token);
      else setError('Impossible de récupérer votre profil.');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-8">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-300 text-2xl font-black text-[#06211b]">P</div>
          <h1 className="text-3xl font-black text-emerald-50">Connexion</h1>
          <p className="mt-2 text-sm text-slate-400">Accédez à votre espace PharmaCampus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
            <input type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nom@domaine.com" autoComplete="email" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Mot de passe</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className="input pr-24" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" autoComplete="current-password" required />
              <button type="button" className="absolute inset-y-0 right-3 text-sm font-semibold text-brand-700" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <button className="primary-btn w-full" type="submit">Se connecter</button>
        </form>

        <button type="button" className="mt-4 block w-full text-center text-sm font-semibold text-brand-300" onClick={async () => { setError(''); setResetSent(''); if (!email) { setError('Saisissez votre email pour recevoir le lien.'); return; } try { setResetSent(await requestPasswordReset(email)); } catch (err) { setError((err as Error).message); } }}>Mot de passe oublié ?</button>
        {resetSent && <p className="mt-2 text-center text-sm text-emerald-300">{resetSent}</p>}

        <div className="mt-5 text-center text-sm text-slate-400">
          Pas encore de compte ? <Link to="/register" className="font-semibold text-brand-300">Créer un compte</Link>
        </div>
        <div className="mt-2 text-center text-sm text-slate-400">
          <Link to="/" className="font-semibold text-slate-200">Retour à l’accueil</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
