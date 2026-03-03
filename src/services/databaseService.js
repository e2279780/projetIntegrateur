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

// ============= UTILITAIRES =============

/**
 * Générer un prix aléatoire pour un livre (entre 5 et 40 dollars)
 * @returns {number} Prix aléatoire avec 2 décimales
 */
const generateRandomPrice = () => {
  return Math.round((Math.random() * 35 + 5) * 100) / 100;
};

/**
 * Générer un prix déterministe basé sur l'ID du livre
 * Assure que le même livre aura toujours le même prix
 * @param {string} bookId - ID du livre
 * @returns {number} Prix avec 2 décimales
 */
const generateDeterministicPrice = (bookId) => {
  // Créer un nombre basé sur le hash du bookId
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    const char = bookId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en 32-bit integer
  }
  
  // Générer un prix entre 5 et 40 de façon déterministe
  const price = 5 + (Math.abs(hash) % 35);
  // Ajouter une partie décimale
  return Math.round(price * 100 + (Math.abs(hash) % 100)) / 100;
};

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
      price: bookData.price || generateRandomPrice(),
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
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        price: data.price || generateDeterministicPrice(doc.id)
      };
    });
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
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      price: data.price || generateDeterministicPrice(bookId)
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
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        price: data.price || generateDeterministicPrice(doc.id)
      };
    });
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
    // Requête minimale pour éviter les index composites Firestore
    // Simple where sans orderBy - tri côté client
    const q = query(
      collection(db, 'borrows'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    // Filtrer les emprunts actifs et trier côté client
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(borrow => !borrow.returnDate) // Garder seulement les emprunts non retournés
      .sort((a, b) => (b.borrowDate?.toMillis?.() || 0) - (a.borrowDate?.toMillis?.() || 0)); // Tri décroissant
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
    // Requête minimale sans orderBy pour éviter les index composites
    const q = query(
      collection(db, 'borrows'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => (b.borrowDate?.toMillis?.() || 0) - (a.borrowDate?.toMillis?.() || 0)); // Tri décroissant côté client
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

/**
 * Récupérer les informations d'un utilisateur par ID
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Données utilisateur
 */
export const getUserById = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    
    if (!docSnap.exists()) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Mettre à jour un emprunt
 * @param {string} borrowId - ID de l'emprunt
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<void>}
 */
export const updateBorrow = async (borrowId, updates) => {
  try {
    await updateDoc(doc(db, 'borrows', borrowId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'emprunt:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Envoyer une notification à un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} notification - Données de la notification
 * @returns {Promise<string>} ID de la notification créée
 */
export const sendNotification = async (userId, notification) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      userId,
      title: notification.title || 'Alerte de la bibliothèque',
      message: notification.message,
      type: notification.type || 'alert', // alert, info, success, warning
      read: false,
      createdAt: Timestamp.now(),
      bookId: notification.bookId || null,
      borrowId: notification.borrowId || null,
    });

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Récupérer les notifications d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des notifications triées par date
 */
export const getUserNotifications = async (userId) => {
  try {
    // Pas de orderBy pour éviter les index composites
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    // Tri côté client pour éviter l'index
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Marquer une notification comme lue
 * @param {string} notificationId - ID de la notification
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Supprimer une notification
 * @param {string} notificationId - ID de la notification
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error.message);
    throw new Error(error.message);
  }
};

// ============= OPÉRATIONS SUR LES PAIEMENTS =============

/**
 * Sauvegarder les informations de carte bancaire
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} cardData - Données de la carte
 * @returns {Promise<void>}
 */
export const saveCardInfo = async (userId, cardData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      cardInfo: {
        cardNumber: cardData.cardNumber, // Les 4 derniers chiffres
        expiryDate: cardData.expiryDate,
        cardholderName: cardData.cardholderName,
        isConfigured: true,
        updatedAt: Timestamp.now(),
      }
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la carte:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Récupérer les informations de carte bancaire d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Informations de la carte ou null
 */
export const getCardInfo = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data().cardInfo || null;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de carte:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Effectuer un achat de livre
 * @param {string} userId - ID de l'utilisateur
 * @param {string} bookId - ID du livre
 * @returns {Promise<string>} ID de l'achat
 */
export const purchaseBook = async (userId, bookId) => {
  try {
    // Vérifier si l'utilisateur a une carte configurée
    const cardInfo = await getCardInfo(userId);
    if (!cardInfo || !cardInfo.isConfigured) {
      throw new Error('Veuillez configurer une carte bancaire avant d\'acheter un livre');
    }

    // Vérifier si le livre existe
    const book = await getBookById(bookId);
    if (!book) {
      throw new Error('Livre non trouvé');
    }

    // Vérifier si l'utilisateur n'a pas déjà achetéce livre
    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', userId),
      where('bookId', '==', bookId)
    );
    const existingPurchases = await getDocs(q);
    
    if (existingPurchases.size > 0) {
      throw new Error('Vous avez déjà acheté ce livre');
    }

    // Créer l'achat
    const docRef = await addDoc(collection(db, 'purchases'), {
      userId,
      bookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookPrice: book.price || 0,
      bookCoverUrl: book.coverImageUrl || '',
      purchaseDate: Timestamp.now(),
      cardLastDigits: cardInfo.cardNumber,
      status: 'completed',
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'achat du livre:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir les achats d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des achats
 */
export const getUserPurchases = async (userId) => {
  try {
    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const purchasesWithBooks = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const purchaseData = doc.data();
        try {
          // Fetch current book details to get the latest cover URL
          const book = await getBookById(purchaseData.bookId);
          return {
            id: doc.id,
            ...purchaseData,
            bookCoverUrl: book.coverImageUrl || purchaseData.bookCoverUrl || '',
          };
        } catch (err) {
          // If book fetch fails, use stored data
          console.warn(`Couldn't fetch book ${purchaseData.bookId}:`, err.message);
          return {
            id: doc.id,
            ...purchaseData,
          };
        }
      })
    );
    
    return purchasesWithBooks.sort((a, b) => (b.purchaseDate?.toMillis?.() || 0) - (a.purchaseDate?.toMillis?.() || 0));
  } catch (error) {
    console.error('Erreur lors de la récupération des achats:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir tous les achats (pour l'admin)
 * @returns {Promise<Array>} Liste de tous les achats
 */
export const getAllPurchases = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'purchases'));
    
    const purchasesWithBooks = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const purchaseData = doc.data();
        try {
          // Fetch current book details to get the latest cover URL
          const book = await getBookById(purchaseData.bookId);
          return {
            id: doc.id,
            ...purchaseData,
            bookCoverUrl: book.coverImageUrl || purchaseData.bookCoverUrl || '',
          };
        } catch (err) {
          // If book fetch fails, use stored data
          console.warn(`Couldn't fetch book ${purchaseData.bookId}:`, err.message);
          return {
            id: doc.id,
            ...purchaseData,
          };
        }
      })
    );
    
    return purchasesWithBooks.sort((a, b) => (b.purchaseDate?.toMillis?.() || 0) - (a.purchaseDate?.toMillis?.() || 0));
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les achats:', error.message);
    throw new Error(error.message);
  }
};
