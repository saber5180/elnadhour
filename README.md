# 🍴 Café de la Paix - Application Web

Une application web moderne pour gérer un café/salon de thé avec une interface publique pour les clients et un tableau de bord d'administration pour gérer le menu et les catégories.

## ✨ Fonctionnalités

### 👥 Interface Client
- **Page d'accueil** : Présentation du café avec sections par catégories
- **Menu/Catalogue** : Affichage des catégories sous forme de cartes
- **Pages de catégories** : Affichage des articles par catégorie
- **Recherche** : Recherche d'articles par nom ou description
- **Design responsive** : Compatible mobile et desktop

### 🔐 Interface Admin
- **Authentification** : Connexion sécurisée par JWT
- **Tableau de bord** : Vue d'ensemble avec statistiques
- **Gestion des catégories** : CRUD complet (Create, Read, Update, Delete)
- **Gestion du menu** : CRUD complet pour les articles
- **Upload d'images** : Support local et URL externes
- **Interface intuitive** : Dashboard moderne et facile à utiliser

## 🛠 Technologies Utilisées

### Frontend
- **React 18** avec Vite
- **Tailwind CSS** pour le design
- **React Router** pour la navigation
- **React Query** pour la gestion d'état et cache
- **React Hook Form** pour les formulaires
- **Axios** pour les requêtes HTTP
- **React Hot Toast** pour les notifications

### Backend
- **Node.js** avec Express
- **PostgreSQL** pour la base de données
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **bcryptjs** pour le hachage des mots de passe
- **Helmet** pour la sécurité
- **CORS** pour les requêtes cross-origin

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- PostgreSQL (version 12 ou supérieure)
- npm ou yarn

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone <repository-url>
cd cafe-app
```

### 2. Configuration de la Base de Données

#### Installer PostgreSQL
- **Windows/Mac** : Télécharger depuis [postgresql.org](https://www.postgresql.org/download/)
- **Ubuntu/Debian** : 
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  ```

#### Créer la base de données
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE cafe_db;

# Créer un utilisateur (optionnel)
CREATE USER cafe_user WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE cafe_db TO cafe_user;

# Quitter
\q
```

### 3. Configuration du Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=cafe_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_very_long_secret_key

# Créer les tables
npm run migrate

# Insérer les données d'exemple
npm run seed
```

### 4. Configuration du Frontend

```bash
# Dans un nouveau terminal, aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install
```

### 5. Lancement de l'application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Le serveur backend sera disponible sur `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
L'application frontend sera disponible sur `http://localhost:3000`

## 👤 Comptes par Défaut

### Administrateur
- **Email** : `admin@cafe.com`
- **Mot de passe** : `admin123`

## 📁 Structure du Projet

```
cafe-app/
├── backend/                 # API Node.js/Express
│   ├── config/             # Configuration de la base de données
│   ├── controllers/        # Logique métier
│   ├── middleware/         # Middlewares (auth, upload)
│   ├── routes/            # Routes API
│   ├── scripts/           # Scripts de migration et seed
│   ├── uploads/           # Dossier pour les images uploadées
│   └── server.js          # Point d'entrée du serveur
│
├── frontend/               # Application React
│   ├── public/            # Fichiers statiques
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── contexts/      # Contextes React (Auth)
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   └── main.jsx       # Point d'entrée React
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion admin
- `GET /api/auth/profile` - Profil utilisateur (protégé)

### Catégories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie (admin)
- `PUT /api/categories/:id` - Modifier une catégorie (admin)
- `DELETE /api/categories/:id` - Supprimer une catégorie (admin)

### Articles du Menu
- `GET /api/menu-items` - Liste des articles
- `GET /api/menu-items?category_id=X` - Articles par catégorie
- `GET /api/menu-items/search?q=terme` - Recherche d'articles
- `POST /api/menu-items` - Créer un article (admin)
- `PUT /api/menu-items/:id` - Modifier un article (admin)
- `DELETE /api/menu-items/:id` - Supprimer un article (admin)

## 🎨 Design & UI

- **Palette de couleurs** : Tons café/beige chaleureux
- **Typographies** : Playfair Display (titres) + Inter (texte)
- **Composants** : Design system cohérent avec Tailwind
- **Responsive** : Mobile-first avec breakpoints adaptatifs
- **Animations** : Transitions fluides et micro-interactions

## 📱 Fonctionnalités Avancées

### Upload d'Images
- Support des formats JPG, PNG, GIF, WebP
- Taille maximum : 5MB
- Stockage local dans `/uploads`
- Alternative par URL externe

### Recherche
- Recherche en temps réel
- Recherche par nom et description
- Filtrage par catégorie

### Sécurité
- Authentification JWT
- Validation des données
- Protection CORS
- Headers de sécurité avec Helmet

## 🚀 Déploiement

### Préparation pour la production

#### Backend
```bash
# Variables d'environnement production
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
JWT_SECRET=very_long_and_secure_secret

# Build et lancement
npm start
```

#### Frontend
```bash
# Build de production
npm run build

# Les fichiers seront dans le dossier dist/
```

### Suggestions de déploiement
- **Backend** : Heroku, DigitalOcean, AWS EC2
- **Frontend** : Vercel, Netlify, AWS S3 + CloudFront
- **Base de données** : Heroku Postgres, AWS RDS, DigitalOcean Managed Database

## 🔧 Scripts Disponibles

### Backend
- `npm start` - Lancement en production
- `npm run dev` - Lancement en développement avec nodemon
- `npm run migrate` - Création des tables
- `npm run seed` - Insertion des données d'exemple

### Frontend
- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Aperçu du build
- `npm run lint` - Vérification ESLint

## 🐛 Dépannage

### Problèmes courants

#### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

#### Erreur de port déjà utilisé
```bash
# Trouver le processus utilisant le port
lsof -i :5000  # pour le backend
lsof -i :3000  # pour le frontend

# Tuer le processus
kill -9 <PID>
```

#### Images ne s'affichent pas
- Vérifier que le dossier `backend/uploads` existe
- Vérifier les permissions du dossier
- S'assurer que le serveur backend est démarré

## 📞 Support

Pour toute question ou problème :
1. Vérifier cette documentation
2. Consulter les logs dans la console
3. Vérifier la configuration de la base de données
4. Créer une issue sur le repository

## 📄 Licence

Ce projet est sous licence MIT.

---

**Développé avec ❤️ pour les amateurs de café**