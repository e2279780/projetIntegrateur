/**
 * EXEMPLES D'UTILISATION - BiblioConnect Firebase Backend
 * 
 * Ce fichier contient des exemples pour utiliser tous les services Firebase
 */

import {
  authService,
  databaseService,
  storageService,
} from './services/index';

// ============= AUTHENTIFICATION =============

/**
 * EXEMPLE 1: Inscription d'un nouvel utilisateur
 */
const handleSignup = async () => {
  try {
    const user = await authService.signup(
      'user@example.com',
      'password123',
      'Jean',
      'Dupont',
      'Membre' // ou 'Bibliothécaire'
    );
    console.log('Utilisateur créé:', user);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 2: Connexion d'un utilisateur
 */
const handleLogin = async () => {
  try {
    const user = await authService.login('user@example.com', 'password123');
    console.log('Utilisateur connecté:', user);
    // Sauvegarder l'uid dans le contexte/state
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 3: Récupérer le profil de l'utilisateur actuel
 */
const handleGetProfile = async (userId) => {
  try {
    const profile = await authService.getCurrentUserProfile(userId);
    console.log('Profil:', profile);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 4: Actualiser l'état lors d'un changement d'authentification
 */
const setupAuthListener = () => {
  return authService.onAuthChange((user) => {
    if (user) {
      // Utilisateur connecté
      console.log('Utilisateur connecté:', user.uid);
      // Récupérer et mettre à jour le profil
    } else {
      // Utilisateur déconnecté
      console.log('Utilisateur déconnecté');
    }
  });
};

// ============= GESTION DES LIVRES =============

/**
 * EXEMPLE 5: Ajouter un livre (Bibliothécaire uniquement)
 */
const handleAddBook = async (userRole) => {
  try {
    const bookId = await databaseService.addBook(userRole, {
      title: 'Le Seigneur des Anneaux',
      author: 'J.R.R. Tolkien',
      isbn: '978-2-266-11916-9',
      category: 'Fantasy',
      description: 'Une épopée fantasy légendaire',
      totalCopies: 5,
      coverImageUrl: '', // Sera mis à jour avec l'upload
    });
    console.log('Livre créé avec ID:', bookId);
    return bookId;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 6: Récupérer tous les livres
 */
const handleGetAllBooks = async () => {
  try {
    const books = await databaseService.getAllBooks();
    console.log('Livres:', books);
    return books;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 7: Récupérer un livre par ID
 */
const handleGetBook = async (bookId) => {
  try {
    const book = await databaseService.getBookById(bookId);
    console.log('Livre:', book);
    return book;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 8: Rechercher des livres par catégorie
 */
const handleGetBooksByCategory = async (category) => {
  try {
    const books = await databaseService.getBooksByCategory(category);
    console.log('Livres de la catégorie:', books);
    return books;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 9: Mettre à jour un livre (Bibliothécaire uniquement)
 */
const handleUpdateBook = async (userRole, bookId) => {
  try {
    await databaseService.updateBook(userRole, bookId, {
      availableCopies: 3,
      title: 'Le Seigneur des Anneaux - Édition spéciale',
    });
    console.log('Livre mis à jour');
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 10: Supprimer un livre (Bibliothécaire uniquement)
 */
const handleDeleteBook = async (userRole, bookId) => {
  try {
    await databaseService.deleteBook(userRole, bookId);
    console.log('Livre supprimé');
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

// ============= GESTION DES EMPRUNTS =============

/**
 * EXEMPLE 11: Emprunter un livre
 */
const handleBorrowBook = async (userId, bookId) => {
  try {
    const borrowId = await databaseService.createBorrow(
      userId,
      bookId,
      14 // Durée d'emprunt en jours
    );
    console.log('Emprunt créé avec ID:', borrowId);
    return borrowId;
  } catch (error) {
    console.error('Erreur:', error.message);
    // Gestion des erreurs:
    // "Aucune copie disponible pour ce livre"
    // "Vous avez déjà emprunté ce livre"
  }
};

/**
 * EXEMPLE 12: Retourner un livre emprunté
 */
const handleReturnBook = async (borrowId) => {
  try {
    await databaseService.returnBorrow(borrowId);
    console.log('Livre retourné avec succès');
  } catch (error) {
    console.error('Erreur:', error.message);
    // "Ce livre a déjà été retourné"
  }
};

/**
 * EXEMPLE 13: Récupérer les emprunts actifs d'un utilisateur
 */
const handleGetActiveUserBorrows = async (userId) => {
  try {
    const borrows = await databaseService.getActiveUserBorrows(userId);
    console.log('Emprunts actifs:', borrows);
    return borrows;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 14: Récupérer l'historique des emprunts
 */
const handleGetUserBorrowHistory = async (userId) => {
  try {
    const history = await databaseService.getUserBorrowHistory(userId);
    console.log('Historique des emprunts:', history);
    return history;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 15: Récupérer tous les emprunts (Bibliothécaire uniquement)
 */
const handleGetAllBorrows = async (userRole) => {
  try {
    const borrows = await databaseService.getAllBorrows(userRole);
    console.log('Tous les emprunts:', borrows);
    return borrows;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 16: Récupérer les livres en retard
 */
const handleGetOverdueBooks = async () => {
  try {
    const overdueBooks = await databaseService.getOverdueBooks();
    console.log('Livres en retard:', overdueBooks);
    return overdueBooks;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

// ============= GESTION DES IMAGES DE COUVERTURE =============

/**
 * EXEMPLE 17: Uploader une image de couverture
 */
const handleUploadCover = async (bookId, fileInput) => {
  try {
    const file = fileInput.files[0]; // Obtenir le fichier du formulaire
    const imageUrl = await storageService.uploadBookCover(bookId, file);
    console.log('Image uploadée:', imageUrl);
    
    // Mettre à jour le livre avec l'URL de l'image
    // await databaseService.updateBook(userRole, bookId, { coverImageUrl: imageUrl });
    
    return imageUrl;
  } catch (error) {
    console.error('Erreur:', error.message);
    // "Le fichier doit être une image"
    // "L'image ne doit pas dépasser 5MB"
  }
};

/**
 * EXEMPLE 18: Remplacer une image de couverture
 */
const handleReplaceCover = async (bookId, oldImageUrl, newFileInput) => {
  try {
    const file = newFileInput.files[0];
    const newImageUrl = await storageService.replaceBookCover(
      bookId,
      oldImageUrl,
      file
    );
    console.log('Image remplacée:', newImageUrl);
    return newImageUrl;
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

/**
 * EXEMPLE 19: Supprimer une image de couverture
 */
const handleDeleteCover = async (imageUrl) => {
  try {
    await storageService.deleteBookCover(imageUrl);
    console.log('Image supprimée');
  } catch (error) {
    console.error('Erreur:', error.message);
  }
};

// ============= FLUX COMPLET D'EXEMPLE =============

/**
 * Flux complet: Créer un livre avec couverture
 */
const handleCreateBookWithCover = async (userRole, bookData, coverFile) => {
  try {
    // 1. Créer le livre
    const bookId = await databaseService.addBook(userRole, {
      ...bookData,
      coverImageUrl: '', // Vide pour l'instant
    });

    // 2. Uploader la couverture
    const imageUrl = await storageService.uploadBookCover(bookId, coverFile);

    // 3. Mettre à jour le livre avec l'URL de l'image
    await databaseService.updateBook(userRole, bookId, {
      coverImageUrl: imageUrl,
    });

    console.log('Livre créé avec succès, ID:', bookId);
    return bookId;
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error.message);
  }
};

export {
  handleSignup,
  handleLogin,
  handleGetProfile,
  setupAuthListener,
  handleAddBook,
  handleGetAllBooks,
  handleGetBook,
  handleGetBooksByCategory,
  handleUpdateBook,
  handleDeleteBook,
  handleBorrowBook,
  handleReturnBook,
  handleGetActiveUserBorrows,
  handleGetUserBorrowHistory,
  handleGetAllBorrows,
  handleGetOverdueBooks,
  handleUploadCover,
  handleReplaceCover,
  handleDeleteCover,
  handleCreateBookWithCover,
};
