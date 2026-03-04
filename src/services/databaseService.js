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
 * Constante pour les frais de retard (en dollars par jour)
 */
const LATE_FEE_PER_DAY = 1.50;

/**
 * Calculer les frais de retard pour un emprunt
 * @param {Date} returnDueDate - Date limite prévue
 * @param {Date} returnDate - Date de retour réel (par défaut: maintenant)
 * @returns {Object} {daysOverdue: number, lateFees: number}
 */
const calculateLateFees = (returnDueDate, returnDate = new Date()) => {
  const dueDateObj = returnDueDate instanceof Date ? returnDueDate : returnDueDate.toDate();
  const daysOverdue = Math.max(0, Math.ceil((returnDate - dueDateObj) / (1000 * 60 * 60 * 24)));
  const lateFees = daysOverdue * LATE_FEE_PER_DAY;
  
  return {
    daysOverdue,
    lateFees: Math.round(lateFees * 100) / 100 // Arrondir à 2 décimales
  };
};

/**
 * Vérifier si l'utilisateur a des frais de retard en attente de paiement
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} {hasOutstandingCharges: boolean, totalCharges: number, overdueBooks: Array}
 */
export const checkUserOutstandingCharges = async (userId) => {
  try {
    // Check overdue borrows first
    const q = query(
      collection(db, 'borrows'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    let totalCharges = 0;
    const overdueBooks = [];
    
    querySnapshot.docs.forEach(doc => {
      const borrow = doc.data();
      // Vérifier les frais impayés: isOverdue = true ET feesSettled = false
      if (borrow.isOverdue && !borrow.feesSettled) {
        totalCharges += (borrow.lateFees || 0);
        overdueBooks.push({
          borrowId: doc.id,
          bookId: borrow.bookId,
          daysOverdue: borrow.daysOverdue || 0,
          lateFees: borrow.lateFees || 0,
          returnDueDate: borrow.returnDueDate
        });
      }
    });

    // Also include any admin-added fees. We fetch by userId and (if available) by email
    const adminFees = [];
    try {
      // First, fees tied to userId
      const feesQuery = query(
        collection(db, 'adminFees'),
        where('userId', '==', userId),
        where('paid', '==', false)
      );
      const feesSnapshot = await getDocs(feesQuery);
      feesSnapshot.docs.forEach(doc => {
        const fee = doc.data();
        totalCharges += fee.amount || 0;
        adminFees.push({
          feeId: doc.id,
          amount: fee.amount || 0,
          message: fee.message || '',
          email: fee.email || null,
        });
      });

      // Also try to include admin fees matching the user's email (if the user exists)
      let userEmail = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userEmail = userDoc.data().email || null;
        }
      // eslint-disable-next-line no-unused-vars
      } catch (_) {
        // ignore
      }

      if (userEmail) {
        const feesByEmailQuery = query(
          collection(db, 'adminFees'),
          where('email', '==', userEmail),
          where('paid', '==', false)
        );
        const feesByEmailSnapshot = await getDocs(feesByEmailQuery);
        feesByEmailSnapshot.docs.forEach(doc => {
          const fee = doc.data();
          // avoid double counting fees already included
          if (!adminFees.find(a => a.feeId === doc.id)) {
            totalCharges += fee.amount || 0;
            adminFees.push({
              feeId: doc.id,
              amount: fee.amount || 0,
              message: fee.message || '',
              email: fee.email || null,
            });
          }
        });
      }
    } catch (errFees) {
      console.error('Erreur lors de la récupération des frais administratifs:', errFees.message);
    }

    return {
      hasOutstandingCharges: totalCharges > 0,
      totalCharges: Math.round(totalCharges * 100) / 100,
      overdueBooks,
      adminFees
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des frais en retard:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Ajouter un frais administratif pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} amount - montant en dollars
 * @param {string} [message] - description optionnelle
 * @returns {Promise<string>} ID du document créé
 */
export const addAdminFee = async (userId, amount, message = '', email = null) => {
  try {
    if ((!userId && !email) || typeof amount !== 'number' || amount <= 0) {
      throw new Error('Paramètres invalides pour le frais administratif');
    }

    const payload = {
      userId: userId || null,
      email: email || null,
      amount,
      message: message || '',
      paid: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'adminFees'), payload);

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du frais administratif:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Créer un emprunt
 * @param {string} userId - ID de l'utilisateur
 * @param {string} bookId - ID du livre
 * @param {number} daysToKeep - Nombre de jours d'emprunt
 * @returns {Promise<string>} ID de l'emprunt
 */
export const createBorrow = async (userId, bookId, daysToKeep = 14) => {
  try {
    // Vérifier si l'utilisateur a des frais en retard
    const chargesCheck = await checkUserOutstandingCharges(userId);
    if (chargesCheck.hasOutstandingCharges) {
      throw new Error(`Vous avez des frais de retard impayés (${chargesCheck.totalCharges}$). Veuillez les régler avant d'emprunter un autre livre.`);
    }

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
      daysOverdue: 0,
      lateFees: 0,
      feesSettled: false,
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
 * @returns {Promise<Object>} {isOverdue: boolean, daysOverdue: number, lateFees: number}
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

    const returnDateNow = new Date();
    const isOverdue = returnDateNow > borrowData.returnDueDate.toDate();
    
    // Calculer les frais de retard s'il y a lieu
    let daysOverdue = 0;
    let lateFees = 0;
    
    if (isOverdue) {
      const { daysOverdue: days, lateFees: fees } = calculateLateFees(
        borrowData.returnDueDate.toDate(),
        returnDateNow
      );
      daysOverdue = days;
      lateFees = fees;
    }

    // Mettre à jour l'emprunt avec les frais
    await updateDoc(doc(db, 'borrows', borrowId), {
      returnDate: Timestamp.now(),
      isOverdue,
      daysOverdue,
      lateFees,
      updatedAt: Timestamp.now(),
    });

    // Incrémenter le nombre de copies disponibles
    const book = await getBookById(borrowData.bookId);
    await updateDoc(doc(db, 'books', borrowData.bookId), {
      availableCopies: book.availableCopies + 1,
    });

    return {
      isOverdue,
      daysOverdue,
      lateFees
    };
  } catch (error) {
    console.error('Erreur lors du retour du livre:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir les emprunts en retard d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Emprunts en retard avec frais calculés
 */
export const getUserOverdueBooks = async (userId) => {
  try {
    const q = query(
      collection(db, 'borrows'),
      where('userId', '==', userId),
      where('returnDate', '==', null)
    );
    const querySnapshot = await getDocs(q);
    
    const now = new Date();
    const overdueBooks = [];

    querySnapshot.docs.forEach(doc => {
      const borrow = doc.data();
      const dueDate = borrow.returnDueDate.toDate();
      
      if (now > dueDate) {
        const { daysOverdue, lateFees } = calculateLateFees(dueDate, now);
        overdueBooks.push({
          borrowId: doc.id,
          ...borrow,
          daysOverdue,
          lateFees,
        });
      }
    });

    return overdueBooks;
  } catch (error) {
    console.error('Erreur lors de la récupération des emprunts en retard:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Payer les frais de retard pour des emprunts (marquer les frais comme réglés)
 * @param {string} userId - ID de l'utilisateur
 * @param {Array<string>} borrowIds - IDs des emprunts à payer
 * @returns {Promise<Object>} Détails du paiement
 */
export const payOverdueCharges = async (userId, borrowIds = []) => {
  try {
    let totalPaid = 0;
    const paymentDetails = [];

    // Si pas de borrowIds spécifiés, payer tous les emprunts en retard
    let borrowsToSettle = borrowIds;
    
    if (borrowsToSettle.length === 0) {
      const overdueBooks = await getUserOverdueBooks(userId);
      borrowsToSettle = overdueBooks.map(b => b.borrowId);
    }

    // Mettre à jour chaque emprunt
    for (const borrowId of borrowsToSettle) {
      const borrowDoc = await getDoc(doc(db, 'borrows', borrowId));
      
      if (borrowDoc.exists()) {
        const borrowData = borrowDoc.data();
        
        // Vérifier que c'est l'utilisateur correct
        if (borrowData.userId !== userId) {
          throw new Error('Accès refusé: cet emprunt ne vous appartient pas');
        }

        const lateFees = borrowData.lateFees || 0;
        totalPaid += lateFees;

        await updateDoc(doc(db, 'borrows', borrowId), {
          feesSettled: true,
          feesSettledDate: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        paymentDetails.push({
          borrowId,
          lateFees,
          settled: true
        });
      }
    }

    let paymentResult = null;
    if (totalPaid > 0) {
      // Créer un enregistrement de paiement
      const paymentRecord = await addDoc(collection(db, 'payments'), {
        userId,
        totalAmount: Math.round(totalPaid * 100) / 100,
        borrowIds: borrowsToSettle,
        paymentDate: Timestamp.now(),
        type: 'late_fees',
        status: 'completed',
        createdAt: Timestamp.now(),
      });
      paymentResult = paymentRecord.id;
    }

    return {
      paymentId: paymentResult,
      totalPaid: Math.round(totalPaid * 100) / 100,
      borrowsSettled: borrowsToSettle.length,
      paymentDetails
    };
  } catch (error) {
    console.error('Erreur lors du paiement des frais:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Payer tous les frais administratifs en attente pour un utilisateur
 * @param {string} userId
 * @returns {Promise<Object>} { totalPaid: number, feesSettled: number }
 */
export const payAdminFees = async (userId) => {
  try {
    const q = query(
      collection(db, 'adminFees'),
      where('userId', '==', userId),
      where('paid', '==', false)
    );
    const snapshot = await getDocs(q);
    let totalPaid = 0;
    const feeIds = [];

    for (const docItem of snapshot.docs) {
      const fee = docItem.data();
      totalPaid += fee.amount || 0;
      feeIds.push(docItem.id);
      await updateDoc(doc(db, 'adminFees', docItem.id), {
        paid: true,
        paidAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    if (feeIds.length > 0) {
      // enregistrer le paiement
      await addDoc(collection(db, 'payments'), {
        userId,
        totalAmount: Math.round(totalPaid * 100) / 100,
        feeIds,
        paymentDate: Timestamp.now(),
        type: 'admin_fees',
        status: 'completed',
        createdAt: Timestamp.now(),
      });
    }

    return {
      totalPaid: Math.round(totalPaid * 100) / 100,
      feesSettled: feeIds.length
    };
  } catch (error) {
    console.error('Erreur lors du paiement des frais administratifs:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Obtenir les emprunts avec frais impayés
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Emprunts avec frais impayés
 */
export const getUnpaidOverdueCharges = async (userId) => {
  try {
    const q = query(
      collection(db, 'borrows'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const unpaidCharges = [];

    querySnapshot.docs.forEach(doc => {
      const borrow = doc.data();
      // Frais impayés: isOverdue = true ET feesSettled = false
      if (borrow.isOverdue && !borrow.feesSettled && borrow.returnDate) {
        unpaidCharges.push({
          borrowId: doc.id,
          ...borrow,
          lateFees: borrow.lateFees || 0
        });
      }
    });

    return unpaidCharges;
  } catch (error) {
    console.error('Erreur lors de la récupération des frais impayés:', error.message);
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
 * Récupérer un utilisateur par email (si existant)
 * @param {string} email
 * @returns {Promise<Object|null>} Données utilisateur ou null si introuvable
 */
export const getUserByEmail = async (email) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const snapshot = await getDocs(q);
    if (snapshot.size === 0) return null;
    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur par email:', error.message);
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
 * @param {string} [shippingMethod] - 'pickup' ou 'delivery'
 * @param {Date} [deliveryDate] - Date de livraison prévue (pour la méthode delivery)
 * @param {number} [shippingFee] - Frais de livraison calculés
 * @returns {Promise<string>} ID de l'achat
 */
export const purchaseBook = async (userId, bookId, shippingMethod = 'pickup', deliveryDate = null, shippingFee = 0) => {
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

    // Vérifier qu'il reste du stock
    if (book.availableCopies !== undefined && book.availableCopies <= 0) {
      throw new Error('Ce livre est en rupture de stock');
    }

    // Vérifier si l'utilisateur n'a pas déjà acheté ce livre
    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', userId),
      where('bookId', '==', bookId)
    );
    const existingPurchases = await getDocs(q);
    
    if (existingPurchases.size > 0) {
      throw new Error('Vous avez déjà acheté ce livre');
    }

    // Build purchase record
    const purchaseRecord = {
      userId,
      bookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookPrice: book.price || 0,
      bookCoverUrl: book.coverImageUrl || '',
      purchaseDate: Timestamp.now(),
      cardLastDigits: cardInfo.cardNumber,
      status: shippingMethod === 'delivery' ? 'pending' : 'completed',
      shippingMethod,
      pickupAddress: shippingMethod === 'pickup' ? '3800 Sherbrooke St E, Montreal, Quebec H1X 2A2' : null,
      deliveryDate: deliveryDate ? Timestamp.fromDate(deliveryDate) : null,
      shippingFee: shippingFee || 0,
      createdAt: Timestamp.now(),
    };

    // Créer l'achat
    const docRef = await addDoc(collection(db, 'purchases'), purchaseRecord);

    // Réduire le stock disponible
    await updateDoc(doc(db, 'books', bookId), {
      availableCopies: (book.availableCopies || 1) - 1,
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

// ============= NOTIFICATIONS DE RETARD =============

/**
 * Créer une notification de retard pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} totalCharges - Total des frais en retard
 * @param {number} overdueCount - Nombre de livres en retard
 * @returns {Promise<string>} ID de la notification créée
 */
export const createOverdueNotification = async (userId, totalCharges, overdueCount) => {
  try {
    const message = `Vous avez ${overdueCount} livre${overdueCount > 1 ? 's' : ''} en retard. Frais à payer: $${totalCharges.toFixed(2)}`;
    
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      userId,
      type: 'overdue',
      message,
      title: 'Livres en retard',
      read: false,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // Expire dans 30 jours
    });
    
    return notificationRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la notification de retard:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Vérifier et créer les notifications de retard pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<void>}
 */
export const checkAndCreateOverdueNotifications = async (userId) => {
  try {
    // Récupérer les frais en retard
    const charges = await checkUserOutstandingCharges(userId);
    
    if (charges.totalCharges > 0 && charges.overdueBooks.length > 0) {
      // Vérifier si une notification récente existe déjà pour cet utilisateur
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('type', '==', 'overdue')
      );
      const snapshot = await getDocs(q);
      
      // Créer une notification seulement s'il n'en existe pas de récente (moins de 6 heures)
      const now = new Date();
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      
      const hasRecentNotification = snapshot.docs.some(doc => {
        const createdAt = doc.data().createdAt?.toDate?.();
        return createdAt && createdAt > sixHoursAgo;
      });
      
      if (!hasRecentNotification) {
        await createOverdueNotification(userId, charges.totalCharges, charges.overdueBooks.length);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des notifications de retard:', error.message);
  }
};

