# Configuration Google OAuth - BiblioConnect

## 🔧 Comment configurer la connexion Google

### Étape 1: Créer un projet Google Cloud

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Dans le menu de gauche, cliquez sur **APIs & Services** > **Credentials**
4. Cliquez sur **Create Credentials** > **OAuth 2.0 Client ID**
5. Sélectionnez **Web application**
6. Nommez-le "BiblioConnect"

### Étape 2: Configurer les URI autorisés

Dans les **Authorized JavaScript origins**, ajoutez:
```
http://localhost:5173
http://localhost:3000
https://votre-domaine.com
```

Dans les **Authorised redirect URIs**, ajoutez:
```
http://localhost:5173
http://localhost:3000
https://votre-domaine.com
```

Cliquez sur **Create** et copiez votre **Client ID**

### Étape 3: Activer Google Sign-In dans Firebase

1. Allez dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet BiblioConnect
3. Allez dans **Authentication** > **Sign-in method**
4. Cliquez sur **Google**
5. Activez-le (toggle ON)
6. Collez votre **Client ID** depuis Google Cloud
7. Entrez un **Support email** pour les notifications
8. Cliquez sur **Save**

### Étape 4: Whitelister les domaines

1. Dans Firebase Console > **Authentication** > **Settings**
2. Allez dans l'onglet **Authorized domains**
3. Ajoutez vos domaines (Firebase ajoute automatiquement `localhost` et votre domaine Firebase)

---

## 🔐 Variables d'environnement

Aucune configuration supplémentaire n'est nécessaire dans `.env` car Firebase gère tout automatiquement.

---

## 💻 Utilisation dans votre app

### Bouton de connexion avec Google

```jsx
import { LoginExample } from './appIntegrationExample';

// Dans votre composant
<LoginExample />
```

Le composant inclut maintenant:
- Formulaire email/mot de passe
- Bouton "Se connecter avec Google"

### Utilisation du hook

```jsx
import { useUser } from './context/useUser';

function MyComponent() {
  const { user, role, loading } = useUser();
  
  if (user?.photoURL) {
    return <img src={user.photoURL} />;
  }
}
```

---

## 🔍 Détails techniques

### Fonctions disponibles

**authService.js:**

```javascript
// Connexion avec Google (Popup)
const user = await authService.loginWithGoogle();

// Inscription avec Google (même chose)
const user = await authService.signupWithGoogle();

// Connexion classique (email/mot de passe)
const user = await authService.login(email, password);

// Inscription classique
const user = await authService.signup(email, password, firstName, lastName, role);
```

**Objet utilisateur retourné:**
```javascript
{
  uid: "user123",
  email: "user@gmail.com",
  firstName: "John",
  lastName: "Doe",
  role: "Membre",
  photoURL: "https://lh3.googleusercontent.com/..." // Uniquement pour Google
}
```

### Profil Firestore créé automatiquement

Pour les utilisateurs Google:
```json
{
  "uid": "user123",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "photoURL": "https://...",
  "role": "Membre",
  "authMethod": "google",
  "createdAt": "2024-02-12T10:00:00Z",
  "updatedAt": "2024-02-12T10:00:00Z"
}
```

---

## 🐛 Dépannage

### Erreur: "Authorization failed"

**Cause:** Le domaine n'est pas whitelisté  
**Solution:**
1. Vérifiez que votre domaine est dans Firebase > Authentication > Settings > Authorized domains
2. Vérifiez que votre URL correspond exactement (http vs https)

### Erreur: "Sign-in method not enabled"

**Cause:** Google Sign-In n'est pas activé dans Firebase  
**Solution:**
1. Allez dans Firebase > Authentication > Sign-in method
2. Activez **Google**

### Erreur: "popup_closed_by_user"

**Cause:** L'utilisateur a fermé la fenêtre popup  
**Solution:** C'est normal, afficher un message "Fermeture du popup"

### Erreur: "Configuration Error"

**Cause:** Client ID invalide  
**Solution:**
1. Vérifiez le Client ID depuis Google Cloud Console
2. Vérifiez qu'il est correctement configuré dans Firebase

---

## 🔒 Sécurité

### Points importants

1. ✅ Les données utilisateur sont sauvegardées dans Firestore
2. ✅ Le rôle par défaut est "Membre" (empêcher escalade de privilèges)
3. ✅ Les règles Firestore empêchent les modifications non autorisées
4. ✅ Les photos de profil sont servies par Google (HTTPS)

### À faire en production

- [ ] Utiliser `redirectResult` au lieu de `signInWithPopup` si vous avez besoin de redirection
- [ ] Implémenter une vérification d'email optionnelle
- [ ] Ajouter une logique de création de profil personnalisé
- [ ] Limiter les domaines autorisés en production

---

## 📱 Alternative: Redirection au lieu de Popup

Si vous préférez une redirection au lieu d'un popup:

```javascript
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";

const loginWithGoogleRedirect = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
};

// Une fois redirigé, vous récupérez le résultat avec:
// import { getRedirectResult } from "firebase/auth";
// const result = await getRedirectResult(auth);
```

---

## 📚 Ressources

- [Google OAuth Documentation](https://developers.google.com/identity)
- [Firebase Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Console](https://console.firebase.google.com/)

---

## ✅ Checklist

- [ ] Créer un projet Google Cloud
- [ ] Obtenir Client ID
- [ ] Ajouter URI autorisés
- [ ] Activer Google Sign-In dans Firebase
- [ ] Whitelister les domaines
- [ ] Tester la connexion en local
- [ ] Tester en production
