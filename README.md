# Kit Scolaire App

Application web de gestion des kits scolaires permettant de gérer les établissements, les kits disponibles et les distributions associées.

## Stack technique

- Backend: Node.js + Express + PostgreSQL
- Frontend: React + Vite
- Authentification: JWT
- Base de données: PostgreSQL

## Prérequis

Avant de lancer le projet, assurez-vous d’avoir installé :

- Node.js 18 ou plus
- npm ou yarn
- PostgreSQL 12 ou plus
- Git

## 1. Cloner le projet

```bash
git clone https://github.com/<votre-utilisateur>/kit-scolaire-app.git
cd kit-scolaire-app
```

## 2. Créer la base de données PostgreSQL

Connectez-vous à PostgreSQL et créez la base :

```sql
CREATE DATABASE kit_scolaire_db;
```

Ensuite, vérifiez que l’utilisateur PostgreSQL utilisé dans le projet a bien les droits d’accès à cette base.

## 3. Configuration du backend

Accédez au dossier backend :

```bash
cd backend
```

Installez les dépendances :

```bash
npm install
```

Créez un fichier `.env` si ce n’est pas déjà présent avec ce contenu :

```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=kit_scolaire_db
DB_PORT=5432
JWT_SECRET=mon_super_secret_jwt_2024
```

> Le backend initialise automatiquement les tables et crée un compte administrateur par défaut au premier démarrage.

### Lancer le backend

Mode développement :

```bash
npm run dev
```

Ou en mode production :

```bash
npm start
```

Le serveur démarrera sur :

```text
http://localhost:5000
```

## 4. Configuration du frontend

Ouvrez un nouveau terminal :

```bash
cd frontend
npm install
```

Le frontend est configuré pour appeler l’API sur :

```text
http://localhost:5000/api
```

### Lancer le frontend

```bash
npm run dev
```

Puis ouvrez l’URL affichée dans le terminal, généralement :

```text
http://localhost:5173
```

## 5. Compte administrateur par défaut

Lors du premier lancement du backend, un utilisateur administrateur est automatiquement créé :

- Identifiant : `admin`
- Mot de passe : `admin123`

## 6. Vérification rapide

Pour vérifier que le backend fonctionne :

```bash
curl http://localhost:5000/api/health
```

Réponse attendue :

```json
{ "status": "OK", "message": "API de gestion des kits scolaires en fonctionnement" }
```

## 7. Structure du projet

```text
kit-scolaire-app/
├── backend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── README.md
└── ...
```

## 8. Dépannage

### Erreur de connexion PostgreSQL

Vérifiez :

- que PostgreSQL est bien démarré ;
- que le nom de la base, l’utilisateur et le mot de passe correspondent à ceux du fichier `.env` ;
- que le port `5432` est ouvert et utilisé.

### Port déjà utilisé

Si le port 5000 est occupé, modifiez la variable `PORT` dans le fichier `.env` du backend.

### Frontend non accessible

Vérifiez que le backend est bien démarré avant d’ouvrir l’application frontend.

## 9. Commandes utiles

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Licence

Projet interne de gestion des kits scolaires.

