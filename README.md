# PharmaCampus

Application web de plateforme d'apprentissage destinée aux étudiants en pharmacie.

## Stack
- React + Vite + TypeScript
- Tailwind CSS
- Supabase pour Auth, base de données et stockage

## Variables d'environnement
Créer un fichier `.env` à la racine du projet :

```bash
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique
```

Le fichier `.env` est déjà ajouté dans `.gitignore`.

## Lancer localement

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

## Construire la version de production

```bash
npm --prefix frontend run build
```

## Déploiement
Le projet est prêt pour Vercel ou Netlify.

Configuration recommandée :
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

## Authentification
- Inscription avec Supabase Auth
- Connexion avec Supabase Auth
- Session persistante
- Gestion de profil utilisateur
