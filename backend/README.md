# El Nadhour — backend

API Express + PostgreSQL (compatible **Neon** via `DATABASE_URL`).

## Installation

```bash
npm install
cp .env.example .env
# Éditer .env : DATABASE_URL (Neon) ou variables DB_*
npm run dev
```

Démarrage : `node server.js` (ou `npm run dev` selon `package.json`).

## Variables importantes

| Variable | Usage |
|----------|--------|
| `DATABASE_URL` | Connexion **Neon** (prioritaire si défini). |
| `DB_HOST`, `DB_NAME`, … | PostgreSQL classique si pas de `DATABASE_URL`. |
| `ALLOWED_ORIGINS` | Liste d’URLs **front** autorisées (CORS), séparées par des **virgules**. |
| `CORS_ORIGINS` | Optionnel : 2e liste fusionnée avec `ALLOWED_ORIGINS` (même format), utile pour séparer prod / previews Vercel. |
| `JWT_SECRET` | Secret pour les tokens admin. |
| `CLOUDINARY_URL` **ou** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) | Active le stockage image persistant (recommandé sur Render). |
| `PORT` | Port d’écoute (Render injecte souvent `PORT`). |

## Déploiement Render

1. **Web Service** Node : **Build Command** `npm install` (ou laisser vide).
2. **Start Command** : **`npm start`** — pas `npm run dev` (nodemon n’est pas installé en prod → erreur `nodemon: not found`).
3. Variables : `DATABASE_URL` (Neon), `ALLOWED_ORIGINS`, `JWT_SECRET`, `NODE_ENV=production`.
4. **Images persistantes** : configure Cloudinary (`CLOUDINARY_*`) pour éviter la perte des `/uploads` après redémarrage/sleep Render.
5. Health check optionnel : chemin `/api/health`.
6. URL publique (ex. `https://el-nadhour-backend.onrender.com`) → `VITE_BACKEND_URL` sur Vercel (sans `/api`).

## Schéma base

Au premier démarrage, `db/ensureSchema.js` complète le schéma si besoin. Tu peux aussi lancer `node scripts/migrate.js` une fois.
