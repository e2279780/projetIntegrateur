# Biblioconnect — API locale et instructions

Ce dépôt contient une petite application React et une API Express locale servant les données des livres de l'application.

## Démarrage rapide

1. Installer les dépendances:

```bash
npm install
```

2. Démarrer l'API (écoute par défaut sur le port `4000`):

```bash
npm run start:api
```

3. Démarrer l'application front (optionnel):

```bash
npm run dev
```

## Endpoints principaux (API locale)

- `GET /api/books`
  - Params optionnels: `q` (recherche texte), `category`, `language`, `page` (1-based), `limit`.
  - Réponse: `{ total, page, limit, data }` où `data` est la page courante.

- `GET /api/books/isbn/:isbn` — récupère un livre par ISBN.

- `GET /api/books/search?q=texte` — recherche simple (titre, auteur, ISBN). Note: `q` fonctionne aussi sur `/api/books`.

- `POST /api/seed` — initialise les données dans Firestore (optionnel)
  - Protégé par clé API: envoyer l'en-tête `x-api-key: <VOTRE_CLÉ>` ou `?apiKey=<VOTRE_CLÉ>`.
  - Par défaut la clé attendue est la valeur de la variable d'environnement `SEED_API_KEY` ou `change-me-to-a-secure-key` si non fournie.
  - Le seed utilise les fonctions définies dans `src/seedBooks.js` et nécessite la configuration Firebase (voir plus bas).

Exemples curl:

```bash
# Liste les 5 premiers livres
curl "http://localhost:4000/api/books?page=1&limit=5"

# Rechercher
curl "http://localhost:4000/api/books?q=pragmatic"

# Par ISBN
curl http://localhost:4000/api/books/isbn/978-0132350884

# Lancer le seed (remplacez <KEY>)
curl -X POST -H "x-api-key: <KEY>" http://localhost:4000/api/seed
```

## Configuration pour le seed Firebase

L'initialisation (`/api/seed`) appelle les fonctions dans `src/seedBooks.js` qui se connectent à Firestore via `src/firebase.js`. Pour que le seed fonctionne vous devez:

- Fournir les variables d'environnement Vite/Firebase (ou un fichier `.env`) utilisées par `src/firebase.js`:
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
- Définir la clé API pour le seed (dans l'environnement du processus Node) :

```bash
export SEED_API_KEY="ma-cle-secrete"
# sous Windows PowerShell:
$env:SEED_API_KEY = "ma-cle-secrete"
```

Puis appeler `/api/seed` avec la clé dans l'en-tête `x-api-key`.

## Remarques

- Les données servies par l'API (hors `/api/seed`) proviennent d'un fichier statique `src/booksData.js` pour éviter de charger Firebase au démarrage.
- Pour la production, remplacez la valeur par défaut de `SEED_API_KEY` par une clé sécurisée et stockez-la dans vos secrets d'environnement.
- Vous pouvez étendre l'API (tri, filtres plus avancés, authentification) si nécessaire.

Si vous voulez, je peux:
- ajouter un endpoint listant les catégories disponibles,
- documenter les modèles de données (schema des livres),
- ou générer un petit Postman collection.
<<<<<<< HEAD
# projetIntegrateur
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> f867cbd (dashboard, login, navbar, signup)
