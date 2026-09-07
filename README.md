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

## Envoyer les mises a jour sur GitHub

La commande suivante construit le frontend, cree un commit avec tous les changements suivis et envoie la branche `main` sur GitHub :

```bash
npm run publish -- "Description de la mise a jour"
```

Si aucun message n'est fourni, le commit utilise `Update PharmaCampus`. Les fichiers SQLite locaux restent ignores et ne sont pas envoyes.

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
