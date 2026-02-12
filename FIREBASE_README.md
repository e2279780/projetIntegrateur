# BiblioConnect - Backend Firebase

Documentation complète du système de gestion de bibliothèque en ligne avec Firebase.

## 📋 Table des matières

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Authentification](#authentification)
4. [Gestion des Livres](#gestion-des-livres)
5. [Gestion des Emprunts](#gestion-des-emprunts)
6. [Stockage des Images](#stockage-des-images)
7. [Sécurité](#sécurité)
8. [Structure des Données](#structure-des-données)
9. [Exemples d'Utilisation](#exemples-dutilisation)

---

## 🚀 Installation

### 1. Installer les dépendances Firebase

```bash
npm install firebase
```

### 2. Initialiser Firebase Console

- Accédez à [Firebase Console](https://console.firebase.google.com/)
- Créez un nouveau projet "BiblioConnect"
- Activez les services:
  - **Authentication** (Email/Password)
  - **Cloud Firestore**
  - **Cloud Storage**

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet:

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

---

## ⚙️ Configuration

### Structure des fichiers

```
src/
├── firebase.js              # Configuration Firebase
├── services/
│   ├── authService.js       # Authentification
│   ├── databaseService.js   # CRUD Base de données
│   ├── storageService.js    # Gestion des images
│   └── index.js             # Point d'entrée des services
├── examples.js              # Exemples d'utilisation
└── ...
firestore.rules             # Règles de sécurité Firestore
```

### Déployer les règles Firestore

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

---

## 🔐 Authentification

### Service: `authService.js`

#### `signup(email, password, firstName, lastName, role)`

Créer un nouvel utilisateur avec profil.

```javascript
import { authService } from './services';

const user = await authService.signup(
  'john@example.com',
  'password123',
  'John',
  'Doe',
  'Membre' // 'Membre' ou 'Bibliothécaire'
);
```

**Retour:**
```javascript
{
  uid: 'user123',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'Membre'
}
```

#### `login(email, password)`

Connecter un utilisateur.

```javascript
const user = await authService.login('john@example.com', 'password123');
```

#### `logout()`

Déconnecter l'utilisateur actuel.

```javascript
await authService.logout();
```

#### `getCurrentUserProfile(userId)`

Récupérer le profil d'un utilisateur.

```javascript
const profile = await authService.getCurrentUserProfile('user123');
```

#### `updateUserProfile(userId, updates)`

Mettre à jour le profil.

```javascript
await authService.updateUserProfile('user123', {
  firstName: 'Jean',
  lastName: 'Martin'
});
```

#### `onAuthChange(callback)`

Écouter les changements d'authentification.

```javascript
const unsubscribe = authService.onAuthChange((user) => {
  if (user) {
    console.log('Utilisateur connecté:', user.uid);
  } else {
    console.log('Utilisateur déconnecté');
  }
});

// Pour arrêter l'écoute:
unsubscribe();
```

---

## 📚 Gestion des Livres

### Service: `databaseService.js`

#### Structure d'un Livre

```javascript
{
  id: 'book123',
  title: 'Le Seigneur des Anneaux',
  author: 'J.R.R. Tolkien',
  isbn: '978-2-266-11916-9',
  category: 'Fantasy',
  description: 'Une épopée fantasy légendaire',
  available: true,
  totalCopies: 5,
  availableCopies: 3,
  coverImageUrl: 'https://...',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `addBook(userRole, bookData)` ⚠️ Bibliothécaire uniquement

Ajouter un nouveau livre.

```javascript
const bookId = await databaseService.addBook('Bibliothécaire', {
  title: 'Le Hobbit',
  author: 'J.R.R. Tolkien',
  isbn: '978-2-266-11915-2',
  category: 'Fantasy',
  description: 'L\'aventure commence',
  totalCopies: 3
});
```

#### `getAllBooks()`

Récupérer tous les livres.

```javascript
const books = await databaseService.getAllBooks();
```

#### `getBookById(bookId)`

Récupérer un livre spécifique.

```javascript
const book = await databaseService.getBookById('book123');
```

#### `getBooksByCategory(category)`

Rechercher des livres par catégorie.

```javascript
const fantasyBooks = await databaseService.getBooksByCategory('Fantasy');
```

#### `updateBook(userRole, bookId, updates)` ⚠️ Bibliothécaire uniquement

Mettre à jour un livre.

```javascript
await databaseService.updateBook('Bibliothécaire', 'book123', {
  availableCopies: 2,
  title: 'Le Seigneur des Anneaux - Edition spéciale'
});
```

#### `deleteBook(userRole, bookId)` ⚠️ Bibliothécaire uniquement

Supprimer un livre.

```javascript
await databaseService.deleteBook('Bibliothécaire', 'book123');
```

---

## 📖 Gestion des Emprunts

### Service: `databaseService.js`

#### Structure d'un Emprunt

```javascript
{
  id: 'borrow123',
  userId: 'user123',
  bookId: 'book123',
  borrowDate: Timestamp,
  returnDueDate: Timestamp,
  returnDate: null, // null jusqu'au retour
  isOverdue: false,
  createdAt: Timestamp
}
```

#### `createBorrow(userId, bookId, daysToKeep)`

Emprunter un livre.

```javascript
const borrowId = await databaseService.createBorrow(
  'user123',
  'book123',
  14 // Durée d'emprunt en jours
);
```

**Erreurs possibles:**
- "Aucune copie disponible pour ce livre"
- "Vous avez déjà emprunté ce livre"

#### `returnBorrow(borrowId)`

Retourner un livre emprunté.

```javascript
await databaseService.returnBorrow('borrow123');
```

**Erreurs possibles:**
- "Ce livre a déjà été retourné"

#### `getActiveUserBorrows(userId)`

Récupérer les emprunts actuels d'un utilisateur.

```javascript
const activeBorrows = await databaseService.getActiveUserBorrows('user123');
// Retourne uniquement les emprunts sans returnDate
```

#### `getUserBorrowHistory(userId)`

Récupérer l'historique complet des emprunts.

```javascript
const history = await databaseService.getUserBorrowHistory('user123');
// Retourne tous les emprunts (actuels et retournés)
```

#### `getAllBorrows(userRole)` ⚠️ Bibliothécaire uniquement

Récupérer tous les emprunts de tous les utilisateurs.

```javascript
const allBorrows = await databaseService.getAllBorrows('Bibliothécaire');
```

#### `getOverdueBooks()`

Récupérer les livres en retard.

```javascript
const overdueBooks = await databaseService.getOverdueBooks();
// Retourne les emprunts dont la returnDueDate est passée
```

---

## 🖼️ Stockage des Images

### Service: `storageService.js`

#### `uploadBookCover(bookId, file)`

Uploader une image de couverture de livre.

```javascript
const fileInput = document.querySelector('input[type="file"]');
const imageUrl = await storageService.uploadBookCover(
  'book123',
  fileInput.files[0]
);
```

**Contraintes:**
- Format: image/jpeg, image/png, etc.
- Taille max: 5MB

**Retour:**
```javascript
'https://firebasestorage.googleapis.com/...'
```

#### `replaceBookCover(bookId, oldImageUrl, newFile)`

Remplacer une image existante.

```javascript
const newImageUrl = await storageService.replaceBookCover(
  'book123',
  oldImageUrl,
  newFile
);
```

#### `deleteBookCover(imageUrl)`

Supprimer une image.

```javascript
await storageService.deleteBookCover('https://...');
```

---

## 🔒 Sécurité

### Règles Firestore (`firestore.rules`)

#### Permissions par rôle

| Action | Utilisateur | Bibliothécaire |
|--------|------------|-----------------|
| **Livres** | | |
| Lire | ✅ | ✅ |
| Créer | ❌ | ✅ |
| Modifier | ❌ | ✅ |
| Supprimer | ❌ | ✅ |
| **Emprunts** | | |
| Lire ses emprunts | ✅ | ✅ |
| Lire tous | ❌ | ✅ |
| Créer | ✅ | ✅ |
| Modifier sien | ✅ | ✅ |
| Supprimer | ❌ | ✅ |
| **Profils** | | |
| Lire | ✅ | ✅ |
| Modifier le sien | ✅ | ✅ |

### Bonnes pratiques

1. **Authentification obligatoire** - Tous les utilisateurs doivent être connectés
2. **Vérification des rôles** - Le rôle est vérifié au niveau Firestore
3. **Isolation des données** - Chacun voit uniquement ses données
4. **Immuabilité des profils** - Les rôles ne peuvent pas être modifiés par l'utilisateur

---

## 📊 Structure des Données

### Collection: `users`
```javascript
/users/{userId}
├── uid: string
├── email: string
├── firstName: string
├── lastName: string
├── role: 'Membre' | 'Bibliothécaire'
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Collection: `books`
```javascript
/books/{bookId}
├── title: string
├── author: string
├── isbn: string
├── category: string
├── description: string
├── available: boolean
├── totalCopies: number
├── availableCopies: number
├── coverImageUrl: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Collection: `borrows`
```javascript
/borrows/{borrowId}
├── userId: string
├── bookId: string
├── borrowDate: timestamp
├── returnDueDate: timestamp
├── returnDate: timestamp | null
├── isOverdue: boolean
└── createdAt: timestamp
```

---

## 💡 Exemples d'Utilisation

Consultez le fichier `examples.js` pour des exemples complets:

```javascript
import {
  handleSignup,
  handleLogin,
  handleAddBook,
  handleBorrowBook,
  handleReturnBook,
  // ... autres fonctions
} from './examples';

// Exemple: Créer un utilisateur
await handleSignup();

// Exemple: Ajouter un livre avec couverture
await handleCreateBookWithCover('Bibliothécaire', bookData, coverFile);

// Exemple: Emprunter un livre
await handleBorrowBook(userId, bookId);
```

---

## 🔧 Dépannage

### "Seul un bibliothécaire peut..."
- Vérifiez que l'utilisateur a le rôle 'Bibliothécaire'
- Vérifiez les règles Firestore sont correctement déployées

### "Aucune copie disponible"
- Vérifiez que `availableCopies > 0`
- D'autres utilisateurs peuvent avoir emprunté toutes les copies

### "Vous avez déjà emprunté ce livre"
- Un utilisateur ne peut emprunter le même livre qu'une seule fois
- Il faut d'abord retourner le livre

### Erreurs d'upload d'image
- Vérifiez que le fichier est une image (jpg, png, etc.)
- Vérifiez que la taille < 5MB
- Vérifiez que Cloud Storage est activé sur Firebase

---

## 📞 Support

Pour toute question sur l'implémentation, consultez la [documentation Firebase officielle](https://firebase.google.com/docs).
