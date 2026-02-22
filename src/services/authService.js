import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Mise à jour du profil utilisateur dans Firestore et Firebase Auth
 */
export const updateUser = async (userId, updates) => {
  try {
    const user = auth.currentUser;

    // 1. Mise à jour dans Firebase Auth (DisplayName) si le nom est fourni
    if (user && updates.name) {
      await updateProfile(user, {
        displayName: updates.name,
      });
    }

    // 2. Mise à jour dans Firestore
    const userDocRef = doc(db, 'users', userId);
    
    // On sépare le nom complet en firstName/lastName pour Firestore si nécessaire
    // ou on enregistre tel quel selon ta structure
    const nameParts = updates.name ? updates.name.split(' ') : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const dataToUpdate = {
      ...updates,
      firstName: firstName || updates.firstName,
      lastName: lastName || updates.lastName,
      updatedAt: new Date().toISOString(),
    };

    // Nettoyage des undefined pour éviter que Firestore ne plante
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    await updateDoc(userDocRef, dataToUpdate);
    
    return dataToUpdate;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error.message);
    throw new Error(error.message);
  }
};

export const signup = async (email, password, firstName, lastName, role = 'Membre') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { uid: user.uid, email: user.email, firstName, lastName, role };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
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
    throw new Error(error.message || 'Email ou mot de passe incorrect');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const loginWithGoogle = async (role = 'Membre') => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const [firstName, ...lastNameParts] = (user.displayName || 'Utilisateur').split(' ');
      const lastName = lastNameParts.join(' ') || 'Google';

      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        photoURL: user.photoURL || '',
        role: role || 'Membre',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authMethod: 'google',
      });
    }

    const userData = userDoc.exists() ? userDoc.data() : null;

    return {
      uid: user.uid,
      email: user.email,
      firstName: userData?.firstName || (user.displayName || '').split(' ')[0],
      lastName: userData?.lastName || (user.displayName || '').split(' ').slice(1).join(' '),
      role: userData?.role || role || 'Membre',
      photoURL: user.photoURL,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signupWithGoogle = async (role = 'Membre') => loginWithGoogle(role);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// --- CRUCIAL : Exportation de l'objet authService pour correspondre à tes composants ---
export const authService = {
  signup,
  login,
  logout,
  updateUser, // Renommé pour correspondre à l'appel dans Profile.jsx
  loginWithGoogle,
  signupWithGoogle,
  onAuthChange
};