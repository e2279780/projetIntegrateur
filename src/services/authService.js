import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Inscription d'un nouvel utilisateur avec profil
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 * @param {string} firstName - Prénom
 * @param {string} lastName - Nom
 * @param {string} role - Rôle ('Membre' ou 'Bibliothécaire')
 * @returns {Promise<Object>} Utilisateur créé
 */
export const signup = async (email, password, firstName, lastName, role = 'Membre') => {
  try {
    // Créer l'authentification Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mettre à jour le profil
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    // Créer le document profil dans Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      role, // 'Membre' ou 'Bibliothécaire'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      role,
    };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Connexion d'un utilisateur
 * @param {string} email - Email
 * @param {string} password - Mot de passe
 * @returns {Promise<Object>} Données utilisateur
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Récupérer les données du profil
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    return {
      uid: user.uid,
      email: user.email,
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      role: userData?.role || 'Membre',
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error.message);
    throw new Error('Email ou mot de passe incorrect');
  }
};

/**
 * Déconnexion
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir les données du profil utilisateur actuel
 * @returns {Promise<Object>} Données du profil
 */
export const getCurrentUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Profil utilisateur non trouvé');
    }
    return userDoc.data();
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Mettre à jour le profil utilisateur
 * @param {string} userId - UID de l'utilisateur
 * @param {Object} updates - Données à mettre à jour
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Connexion avec Google
 * @returns {Promise<Object>} Données utilisateur
 */
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Vérifier si l'utilisateur existe déjà dans Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Créer le profil si l'utilisateur est nouveau
      const [firstName, ...lastNameParts] = (user.displayName || 'Utilisateur').split(' ');
      const lastName = lastNameParts.join(' ') || 'Google';

      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        photoURL: user.photoURL || '',
        role: 'Membre', // Rôle par défaut
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authMethod: 'google',
      });
    }

    // Récupérer les données du profil
    const userData = userDoc.exists() ? userDoc.data() : {
      firstName: (user.displayName || '').split(' ')[0],
      lastName: (user.displayName || '').split(' ').slice(1).join(' ') || 'Google',
      role: 'Membre',
    };

    return {
      uid: user.uid,
      email: user.email,
      firstName: userData.firstName || (user.displayName || '').split(' ')[0],
      lastName: userData.lastName || (user.displayName || '').split(' ').slice(1).join(' '),
      role: userData.role || 'Membre',
      photoURL: user.photoURL,
    };
  } catch (error) {
    console.error('Erreur lors de la connexion Google:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Connexion avec Google (version Redirect - alternative)
 * @returns {Promise<Object>} Données utilisateur
 */
export const signupWithGoogle = async () => {
  // Même fonction que loginWithGoogle pour l'inscription
  return loginWithGoogle();
};

/**
 * Écouter les changements d'authentification
 * @param {Function} callback - Fonction de rappel
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
