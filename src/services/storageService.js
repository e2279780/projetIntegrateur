import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploader une image de couverture de livre
 * @param {string} bookId - ID du livre
 * @param {File} file - Fichier image
 * @returns {Promise<string>} URL de l'image
 */
export const uploadBookCover = async (bookId, file) => {
  try {
    // Vérifier que le fichier est une image
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('L\'image ne doit pas dépasser 5MB');
    }

    // Créer la référence du fichier
    const fileExtension = file.name.split('.').pop();
    const fileName = `${bookId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `book-covers/${fileName}`);

    // Uploader le fichier
    await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    // Obtenir l'URL de téléchargement
    const downloadUrl = await getDownloadURL(storageRef);
    
    return downloadUrl;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Supprimer une image de couverture
 * @param {string} imageUrl - URL de l'image
 */
export const deleteBookCover = async (imageUrl) => {
  try {
    if (!imageUrl) {
      throw new Error('URL de l\'image requise');
    }

    // Extraire le chemin du fichier depuis l'URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const filePath = decodedUrl.split('/o/')[1].split('?')[0];
    
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Remplacer une image de couverture
 * @param {string} bookId - ID du livre
 * @param {string} oldImageUrl - Ancienne URL d'image
 * @param {File} newFile - Nouveau fichier image
 * @returns {Promise<string>} Nouvelle URL d'image
 */
export const replaceBookCover = async (bookId, oldImageUrl, newFile) => {
  try {
    // Télécharger la nouvelle image
    const newUrl = await uploadBookCover(bookId, newFile);

    // Supprimer l'ancienne si elle existe
    if (oldImageUrl) {
      try {
        await deleteBookCover(oldImageUrl);
      } catch (error) {
        console.warn('Erreur lors de la suppression de l\'ancienne image:', error);
      }
    }

    return newUrl;
  } catch (error) {
    console.error('Erreur lors du remplacement de l\'image:', error.message);
    throw new Error(error.message);
  }
};
