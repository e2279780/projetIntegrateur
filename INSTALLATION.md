# Guide Installation Complet - BiblioConnect Firebase

## 🚀 Étapes d'installation

### 1️⃣ Cloner/Accéder au projet
```bash
cd Path/to/ProjetInte
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

Cela installera Firebase et toutes les dépendances du projet.

### 3️⃣ Créer un projet Firebase

1. Accédez à [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Nommez-le "BiblioConnect"
4. Désactivez Google Analytics (optionnel)
5. Cliquez sur "Créer un projet"

### 4️⃣ Récupérer les identifiants Firebase

1. Dans la console Firebase, cliquez sur l'icône ⚙️ (Paramètres)
2. Allez dans "Paramètres du projet"
3. Descendez jusqu'à la section "Vos applications"
4. Cliquez sur "Ajouter une application" > **Web** (</>)
5. Entrez le nom "BiblioConnect Web"
6. Cliquez sur "Enregistrer l'application"
7. Copiez les identifiants de configuration

### 5️⃣ Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet:

```bash
cp .env.example .env.local
```

Éditez le fichier `.env.local` et remplissez-le avec vos identifiants:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### 6️⃣ Activer les services Firebase

#### Authentication (Email/Mot de passe)
1. In Firebase Console → **Authentication**
2. Cliquez sur l'onglet **Sign-in method**
3. Activez **Email/Password**
4. Cliquez sur **Enregistrer**

#### Cloud Firestore
1. Firebase Console → **Firestore Database**
2. Cliquez sur **Create database**
3. Région: `europe-west1` (ou région proche)
4. Mode de démarrage: **Start in test mode** (à sécuriser après!)
5. Cliquez sur **Create**

#### Cloud Storage
1. Firebase Console → **Storage**
2. Cliquez sur **Get started**
3. Région: `europe-west1`
4. Cliquez sur **Done**
5. Dans l'onglet **Rules**, utilisez les règles par défaut ou consultez la documentation

### 7️⃣ Déployer les règles Firestore

Installez Firebase CLI:
```bash
npm install -g firebase-tools
```

Connectez-vous à Firebase:
```bash
firebase login
```

Sélectionnez le projet:
```bash
firebase use --add
```

Déployez les règles de sécurité:
```bash
firebase deploy --only firestore:rules
```

### 8️⃣ Vérifier l'installation

Lancez le serveur de développement:
```bash
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

---

## 📁 Structure des fichiers créés

```
BiblioConnect/
├── src/
│   ├── firebase.js                      # ✅ Config Firebase
│   ├── services/
│   │   ├── authService.js              # ✅ Authentification
│   │   ├── databaseService.js          # ✅ CRUD Base de données
│   │   ├── storageService.js           # ✅ Gestion images
│   │   └── index.js                    # ✅ Point d'entrée
│   ├── appIntegrationExample.jsx        # ✅ Exemples de composants
│   └── examples.js                      # ✅ Exemples de fonctions
├── firestore.rules                      # ✅ Règles de sécurité
├── .firebaserc                          # ✅ Config Firebase CLI
├── .env.local                           # ✅ Variables d'environnement
├── .env.example                         # ✅ Template .env
├── FIREBASE_README.md                   # ✅ Documentation complète
├── setup-firebase.sh                    # ✅ Script d'installation
└── package.json                         # ✅ Firebase ajouté
```

---

## 🧪 Tester l'installation

### Test 1: Vérifier l'import de Firebase

```javascript
// Dans la console du navigateur
import { auth, db, storage } from './src/firebase.js'
console.log('Firebase connecté:', { auth, db, storage })
```

### Test 2: Créer un utilisateur

Consultez [appIntegrationExample.jsx](./src/appIntegrationExample.jsx) pour des exemples de composants.

### Test 3: Vérifier Firestore

1. Firebase Console → **Firestore Database**
2. Créez un nouvel utilisateur via le formulaire d'inscription
3. Vérifiez que une collection `users` a été créée avec un document

---

## 🔒 Sécuriser votre production

⚠️ Les règles par défaut de Firestore permettent l'accès à tous. **À CHANGER AVANT LA PRODUCTION!**

Les fichiers [firestore.rules](./firestore.rules) contiennent des règles sécurisées:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Seul un bibliothécaire peut ajouter un livre
    match /books/{bookId} {
      allow create: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Bibliothécaire';
    }
    // ...
  }
}
```

Après le déploiement:
```bash
firebase deploy --only firestore:rules
```

---

## 📚 Documentation

- [Firebase Website](https://firebase.google.com/)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Cloud Storage](https://firebase.google.com/docs/storage)

Consultez aussi [FIREBASE_README.md](./FIREBASE_README.md) pour une documentation détaillée de l'API.

---

## ✅ Checklist d'installation

- [ ] Installer les dépendances (`npm install`)
- [ ] Créer un projet Firebase
- [ ] Récupérer les identifiants
- [ ] Configurer `.env.local`
- [ ] Activer Authentication
- [ ] Activer Cloud Firestore
- [ ] Activer Cloud Storage
- [ ] Installer Firebase CLI (`npm install -g firebase-tools`)
- [ ] Déployer les règles (`firebase deploy --only firestore:rules`)
- [ ] Tester le serveur (`npm run dev`)
- [ ] Vérifier la connexion à Firebase

---

## 🆘 Dépannage

### Erreur: "Firebase is not defined"
→ Vérifiez que `.env.local` est correctement configuré

### Erreur: "Permission denied" lors de l'écriture
→ Vérifiez les règles Firestore et qu'elles sont déployées

### Erreur: "Identifiant invalide"
→ Vérifiez votre `.env.local` avec les valeurs de Firebase Console

### L'image ne s'upload pas
→ Vérifiez que Cloud Storage est activé et les règles de storage are configurées

---

## 📞 Support

En cas de problème, consultez:
1. [Documents Firebase](https://firebase.google.com/docs)
2. [Stack Overflow - firebase tag](https://stackoverflow.com/questions/tagged/firebase)
3. Logs de la console du navigateur (F12)

Bon développement! 🚀
