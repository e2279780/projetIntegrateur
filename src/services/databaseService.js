import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

// Detect if running in Node.js or browser and use appropriate Firebase config
const isNode = typeof window === 'undefined';
let db;

if (isNode) {
  // Server-side: use firebaseServer.js with process.env
  const firebaseServer = await import('../firebaseServer.js');
  db = firebaseServer.db;
} else {
  // Client-side: use firebase.js with import.meta.env
  const firebase = await import('../firebase.js');
  db = firebase.db;
}

// ============= OPÉRATIONS SUR LES LIVRES =============

/**
 * Ajouter un nouveau livre (Bibliothécaire uniquement)
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {Object} bookData - Données du livre
 * @returns {Promise<string>} ID du livre créé
 */
export const addBook = async (userRole, bookData) => {
  try {
    if (userRole !== 'Bibliothécaire') {
      throw new Error('Seul un bibliothécaire peut ajouter un livre');
    }

    const docRef = await addDoc(collection(db, 'books'), {
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      category: bookData.category,
      description: bookData.description || '',
      available: true,
      totalCopies: bookData.totalCopies || 1,
      availableCopies: bookData.totalCopies || 1,
      coverImageUrl: bookData.coverImageUrl || '',
      pages: bookData.pages || 0,
      rating: bookData.rating || 0,
      publisher: bookData.publisher || '',
      yearPublished: bookData.yearPublished || new Date().getFullYear(),
      language: bookData.language || 'Fr',
      keywords: bookData.keywords || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Récupérer tous les livres
 * @returns {Promise<Array>} Liste des livres
 */
export const getAllBooks = async () => {
  try {
    const q = query(collection(db, 'books'), orderBy('title'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Récupérer un livre par ID
 * @param {string} bookId - ID du livre
 * @returns {Promise<Object>} Données du livre
 */
export const getBookById = async (bookId) => {
  try {
    const docSnap = await getDoc(doc(db, 'books', bookId));
    
    if (!docSnap.exists()) {
      throw new Error('Livre non trouvé');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Rechercher des livres par catégorie
 * @param {string} category - Catégorie
 * @returns {Promise<Array>} Livres de la catégorie
 */
export const getBooksByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'books'),
      where('category', '==', category),
      orderBy('title')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche par catégorie:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Mettre à jour un livre (Bibliothécaire uniquement)
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string} bookId - ID du livre
 * @param {Object} updates - Données à mettre à jour
 */
export const updateBook = async (userRole, bookId, updates) => {
  try {
    if (userRole !== 'Bibliothécaire') {
      throw new Error('Seul un bibliothécaire peut modifier un livre');
    }

    await updateDoc(doc(db, 'books', bookId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Supprimer un livre (Bibliothécaire uniquement)
 * @param {string} userRole - Rôle de l'utilisateur
 * @param {string} bookId - ID du livre
 */
export const deleteBook = async (userRole, bookId) => {
  try {
    if (userRole !== 'Bibliothécaire') {
      throw new Error('Seul un bibliothécaire peut supprimer un livre');
    }

    await deleteDoc(doc(db, 'books', bookId));
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error.message);
    throw new Error(error.message);
  }
};

// ============= OPÉRATIONS SUR LES EMPRUNTS =============

/**
 * Créer un emprunt
 * @param {string} userId - ID de l'utilisateur
 * @param {string} bookId - ID du livre
 * @param {number} daysToKeep - Nombre de jours d'emprunt
 * @returns {Promise<string>} ID de l'emprunt
 */
export const createBorrow = async (userId, bookId, daysToKeep = 14) => {
  try {
    // Vérifier si le livre existe et est disponible
    const book = await getBookById(bookId);
    if (book.availableCopies <= 0) {
      throw new Error('Aucune copie disponible pour ce livre');
    }

    // Vérifier si l'utilisateur n'a pas déjà emprunté ce livre
    const q = query(
      collection(db, 'borrows'),
      where('userId', '==', userId),
      where('bookId', '==', bookId),
      where('returnDate', '==', null)
    );
    const existingBorrows = await getDocs(q);
    
    if (existingBorrows.size > 0) {
      throw new Error('Vous avez déjà emprunté ce livre');
    }

    const borrowDate = Timestamp.now();
    const returnDueDate = new Date();
    returnDueDate.setDate(returnDueDate.getDate() + daysToKeep);

    // Créer l'emprunt
    const docRef = await addDoc(collection(db, 'borrows'), {
      userId,
      bookId,
      borrowDate,
      returnDueDate: Timestamp.fromDate(returnDueDate),
      returnDate: null, // null jusqu'au retour
      isOverdue: false,
      createdAt: Timestamp.now(),
    });

    // Décrémenter le nombre de copies disponibles
    await updateDoc(doc(db, 'books', bookId), {
      availableCopies: book.availableCopies - 1,
    });

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de l\'emprunt:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Retourner un livre emprunté
 * @param {string} borrowId - ID de l'emprunt
 */
export const returnBorrow = async (borrowId) => {
  try {
    const borrowDoc = await getDoc(doc(db, 'borrows', borrowId));
    
    if (!borrowDoc.exists()) {
      throw new Error('Emprunt non trouvé');
    }

    const borrowData = borrowDoc.data();
    if (borrowData.returnDate) {
      throw new Error('Ce livre a déjà été retourné');
    }

    // Mettre à jour l'emprunt
    await updateDoc(doc(db, 'borrows', borrowId), {
      returnDate: Timestamp.now(),
      isOverdue: new Date() > borrowData.returnDueDate.toDate(),
    });

    // Incrémenter le nombre de copies disponibles
    const book = await getBookById(borrowData.bookId);
    await updateDoc(doc(db, 'books', borrowData.bookId), {
      availableCopies: book.availableCopies + 1,
    });
  } catch (error) {
    console.error('Erreur lors du retour du livre:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir les emprunts actifs d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Emprunts actifs
 */
export const getActiveUserBorrows = async (userId) => {
  try {
    const q = query(
      collection(db, 'borrows'),
      where('userId', '==', userId),
      where('returnDate', '==', null),
      orderBy('borrowDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des emprunts actifs:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir l'historique des emprunts d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Historique des emprunts
 */
export const getUserBorrowHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'borrows'),
      where('userId', '==', userId),
      orderBy('borrowDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir tous les emprunts (Bibliothécaire uniquement)
 * @param {string} userRole - Rôle de l'utilisateur
 * @returns {Promise<Array>} Tous les emprunts
 */
export const getAllBorrows = async (userRole) => {
  try {
    if (userRole !== 'Bibliothécaire') {
      throw new Error('Seul un bibliothécaire peut accéder à tous les emprunts');
    }

    const q = query(
      collection(db, 'borrows'),
      orderBy('borrowDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les emprunts:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir les livres en retard
 * @returns {Promise<Array>} Emprunts en retard
 */
export const getOverdueBooks = async () => {
  try {
    const q = query(
      collection(db, 'borrows'),
      where('returnDate', '==', null)
    );
    const querySnapshot = await getDocs(q);
    
    const now = new Date();
    const overdueBooks = querySnapshot.docs
      .filter(doc => doc.data().returnDueDate.toDate() < now)
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

    return overdueBooks;
  } catch (error) {
    console.error('Erreur lors de la récupération des livres en retard:', error.message);
    throw new Error(error.message);
  }
};
