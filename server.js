import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import process from 'process';

const SEED_API_KEY = process.env.SEED_API_KEY || 'change-me-to-a-secure-key';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Biblioconnect API' });
});

// Fonction utilitaire pour corriger les URLs des images
const fixImageUrl = (url) => {
  if (!url) return 'https://placehold.co/300x450?text=Livre&bg=e5e7eb&textColor=666';
  if (url.includes('via.placeholder.com')) {
    return url.replace('https://via.placeholder.com', 'https://placehold.co');
  }
  return url;
};

// Retourne tous les livres (données statiques de l'application)
app.get('/api/books', async (req, res) => {
  try {
    // Charger dynamiquement le service pour éviter d'importer firebase au démarrage
    let dbSvc;
    let seedModule;
    
    try {
      dbSvc = await import('./src/services/databaseService.js');
      seedModule = await import('./src/seedBooks.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import des modules:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services: ' + importErr.message });
    }

    let results = await dbSvc.getAllBooks();
    if (!results || results.length === 0) {
      await seedModule.initializeBooksIfEmpty('Bibliothécaire');
      results = await dbSvc.getAllBooks();
    }

    // Corriger les URLs des images invalides
    results = results.map(book => ({
      ...book,
      coverImageUrl: fixImageUrl(book.coverImageUrl),
      coverUrl: fixImageUrl(book.coverUrl)
    }));

    // Query params: q (search), category, language, page, limit
    const q = (req.query.q || '').toString().toLowerCase().trim();
    const category = (req.query.category || '').toString().toLowerCase().trim();
    const language = (req.query.language || '').toString().toLowerCase().trim();

    if (q) {
      results = results.filter(b => {
        return (
          (b.title && b.title.toString().toLowerCase().includes(q)) ||
          (b.author && b.author.toString().toLowerCase().includes(q)) ||
          (b.isbn && b.isbn.toString().toLowerCase().includes(q))
        );
      });
    }

    if (category) {
      results = results.filter(b => (b.category || '').toString().toLowerCase() === category);
    }

    if (language) {
      results = results.filter(b => (b.language || '').toString().toLowerCase() === language);
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const start = (page - 1) * limit;
    const paged = results.slice(start, start + limit);

    res.json({ total: results.length, page, limit, data: paged });
  } catch (err) {
    console.error('Erreur lors de la récupération des livres:', err);
    res.status(500).json({ error: err.message || 'Erreur serveur inconnue' });
  }
});

// Rechercher par ISBN
app.get('/api/books/isbn/:isbn', async (req, res) => {
  try {
    let dbSvc;
    let seedModule;
    
    try {
      dbSvc = await import('./src/services/databaseService.js');
      seedModule = await import('./src/seedBooks.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import des modules:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services: ' + importErr.message });
    }

    let results = await dbSvc.getAllBooks();
    if (!results || results.length === 0) {
      await seedModule.initializeBooksIfEmpty('Bibliothécaire');
      results = await dbSvc.getAllBooks();
    }

    const isbn = req.params.isbn;
    const book = results.find(b => (b.isbn || '').toString() === isbn);
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });
    res.json(book);
  } catch (err) {
    console.error('Erreur lors de la récupération du livre par ISBN:', err);
    res.status(500).json({ error: err.message || 'Erreur serveur inconnue' });
  }
});

// Recherche texte (titre, auteur, isbn)
app.get('/api/books/search', async (req, res) => {
  try {
    let dbSvc;
    let seedModule;
    
    try {
      dbSvc = await import('./src/services/databaseService.js');
      seedModule = await import('./src/seedBooks.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import des modules:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services: ' + importErr.message });
    }

    let results = await dbSvc.getAllBooks();
    if (!results || results.length === 0) {
      await seedModule.initializeBooksIfEmpty('Bibliothécaire');
      results = await dbSvc.getAllBooks();
    }

    const q = (req.query.q || '').toString().toLowerCase().trim();
    if (!q) return res.json([]);

    const filtered = results.filter(b => {
      return (
        (b.title && b.title.toString().toLowerCase().includes(q)) ||
        (b.author && b.author.toString().toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toString().toLowerCase().includes(q))
      );
    });

    res.json(filtered);
  } catch (err) {
    console.error('Erreur lors de la recherche:', err);
    res.status(500).json({ error: err.message || 'Erreur serveur inconnue' });
  }
});

// Endpoint pour appeler l'initialisation/seed (optionnel)
// Attention: cela tentera d'utiliser les services Firebase du projet.
app.post('/api/seed', async (req, res) => {
  try {
    const providedKey = req.header('x-api-key') || req.query.apiKey;
    if (!providedKey || providedKey !== SEED_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized. Missing or invalid API key.' });
    }

    // Importer la fonction au runtime pour éviter d'obliger l'API à charger firebase au démarrage
    let seedModule;
    try {
      seedModule = await import('./src/seedBooks.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import du module seed:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services: ' + importErr.message });
    }

    const { seedBooksToFirebase, initializeBooksIfEmpty } = seedModule;
    const mode = req.query.mode === 'forced' ? 'forced' : 'if-empty';

    if (mode === 'forced') {
      const result = await seedBooksToFirebase('Bibliothécaire');
      return res.json(result);
    }

    const result = await initializeBooksIfEmpty('Bibliothécaire');
    res.json(result);
  } catch (error) {
    console.error('Erreur lors du seed:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur inconnue' });
  }
});

// Mettre à jour un livre partiellement (stock, totalCopies, etc.)
app.patch('/api/books/:id', async (req, res) => {
  try {
    let dbSvc;
    try {
      dbSvc = await import('./src/services/databaseService.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import du module:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services: ' + importErr.message });
    }

    const bookId = req.params.id;
    const payload = req.body || {};

    // Récupérer le livre existant
    const existing = await dbSvc.getBookById(bookId);
    if (!existing) return res.status(404).json({ error: 'Livre non trouvé' });

    const updates = {};

    if (typeof payload.delta === 'number') {
      const current = existing.availableCopies ?? existing.totalCopies ?? 0;
      updates.availableCopies = current + payload.delta;
    }

    if (typeof payload.availableCopies === 'number') {
      updates.availableCopies = payload.availableCopies;
    }

    if (typeof payload.totalCopies === 'number') {
      updates.totalCopies = payload.totalCopies;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Aucune mise à jour fournie' });
    }

    // Appeler la mise à jour en tant que 'Bibliothécaire' côté serveur
    await dbSvc.updateBook('Bibliothécaire', bookId, updates);

    const updated = await dbSvc.getBookById(bookId);
    res.json(updated);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du livre:', err);
    res.status(500).json({ error: err.message || 'Erreur serveur inconnue' });
  }
});

// Remplacer complètement un livre (PUT)
app.put('/api/books/:id', async (req, res) => {
  try {
    let dbSvc;
    try {
      dbSvc = await import('./src/services/databaseService.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import du module:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services: ' + importErr.message });
    }

    const bookId = req.params.id;
    const payload = req.body || {};

    // Récupérer le livre existant
    const existing = await dbSvc.getBookById(bookId);
    if (!existing) return res.status(404).json({ error: 'Livre non trouvé' });

    // Validation des champs obligatoires
    const requiredFields = ['title', 'author', 'isbn'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        return res.status(400).json({ error: `Champ obligatoire manquant: ${field}` });
      }
    }

    const updates = {
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn,
      category: payload.category || existing.category,
      language: payload.language || existing.language,
      description: payload.description || existing.description,
      cover: payload.cover || existing.cover,
      totalCopies: typeof payload.totalCopies === 'number' ? payload.totalCopies : existing.totalCopies,
      availableCopies: typeof payload.availableCopies === 'number' ? payload.availableCopies : existing.availableCopies
    };

    // Appeler la mise à jour en tant que 'Bibliothécaire' côté serveur
    await dbSvc.updateBook('Bibliothécaire', bookId, updates);

    const updated = await dbSvc.getBookById(bookId);
    res.json(updated);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du livre:', err);
    res.status(500).json({ error: err.message || 'Erreur serveur inconnue' });
  }
});

// Supprimer un livre (DELETE)
app.delete('/api/books/:id', async (req, res) => {
  try {
    let dbSvc;
    try {
      dbSvc = await import('./src/services/databaseService.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import du module:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services: ' + importErr.message });
    }

    const bookId = req.params.id;

    // Récupérer le livre existant
    const existing = await dbSvc.getBookById(bookId);
    if (!existing) return res.status(404).json({ error: 'Livre non trouvé' });

    // Supprimer le livre via la fonction dédiée
    await dbSvc.deleteBook('Bibliothécaire', bookId);

    res.json({ message: 'Livre supprimé avec succès', id: bookId });
  } catch (err) {
    console.error('Erreur lors de la suppression du livre:', err);
    res.status(500).json({ error: err.message || 'Erreur serveur inconnue' });
  }
});

// ============= ROUTES EMPRUNT =============

// POST /api/borrows - Créer un emprunt
app.post('/api/borrows', async (req, res) => {
  try {
    let dbSvc;
    try {
      dbSvc = await import('./src/services/databaseService.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import du module:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services' });
    }

    const { userId, bookId, daysToKeep } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ error: 'userId et bookId sont requis' });
    }

    const borrowId = await dbSvc.createBorrow(userId, bookId, daysToKeep || 14);
    res.status(201).json({ success: true, borrowId });
  } catch (err) {
    console.error('Erreur lors de la création de l\'emprunt:', err);
    res.status(400).json({ error: err.message || 'Erreur lors de la création de l\'emprunt' });
  }
});

// GET /api/borrows/:userId - Récupérer les emprunts actifs d'un utilisateur
app.get('/api/borrows/:userId', async (req, res) => {
  try {
    let dbSvc;
    try {
      dbSvc = await import('./src/services/databaseService.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import du module:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services' });
    }

    const { userId } = req.params;
    const borrows = await dbSvc.getActiveUserBorrows(userId);
    
    // Récupérer les détails des livres pour chaque emprunt
    const borrowsWithBooks = await Promise.all(
      borrows.map(async (borrow) => {
        const book = await dbSvc.getBookById(borrow.bookId);
        return { ...borrow, book };
      })
    );

    res.json(borrowsWithBooks);
  } catch (err) {
    console.error('Erreur lors de la récupération des emprunts:', err);
    res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
});

// DELETE /api/borrows/:borrowId - Retourner un livre emprunté
app.delete('/api/borrows/:borrowId', async (req, res) => {
  try {
    let dbSvc;
    try {
      dbSvc = await import('./src/services/databaseService.js');
    } catch (importErr) {
      console.error('Erreur lors de l\'import du module:', importErr);
      return res.status(500).json({ error: 'Erreur lors du chargement des services' });
    }

    const { borrowId } = req.params;
    await dbSvc.returnBorrow(borrowId);
    
    res.json({ success: true, message: 'Livre retourné avec succès' });
  } catch (err) {
    console.error('Erreur lors du retour du livre:', err);
    res.status(400).json({ error: err.message || 'Erreur lors du retour du livre' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Biblioconnect API running on http://localhost:${PORT}`);
  
  // Initialisation automatique des livres au démarrage
  try {
    console.log('📚 Vérification de la base de données...');
    let dbSvc;
    let seedModule;
    
    try {
      dbSvc = await import('./src/services/databaseService.js');
      seedModule = await import('./src/seedBooks.js');
    } catch (importErr) {
      console.error('⚠️ Erreur lors de l\'import des modules au démarrage:', importErr);
      console.log('⚠️ Les services Firebase seront initialisés lors du premier appel API');
      return;
    }
    
    const existingBooks = await dbSvc.getAllBooks();
    if (!existingBooks || existingBooks.length === 0) {
      console.log('📚 Base vide détectée. Initialisation automatique des livres...');
      const result = await seedModule.initializeBooksIfEmpty('Bibliothécaire');
      console.log(`✅ ${result.addedCount || result.booksCount || 0} livres initialisés avec succès!`);
    } else {
      console.log(`✅ Base de données OK: ${existingBooks.length} livres trouvés.`);
    }
  } catch (err) {
    console.log('⚠️ Initialisation auto ignorée (Firebase non configuré ou erreur):', err.message);
    console.log('💡 Les livres seront chargés à la première requête ou via /init-books');
  }
});
