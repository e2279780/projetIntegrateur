import express from 'express';
import cors from 'cors';
import { booksDatabase } from './src/booksData.js';

const SEED_API_KEY = process.env.SEED_API_KEY || 'change-me-to-a-secure-key';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Biblioconnect API' });
});

// Retourne tous les livres (données statiques de l'application)
app.get('/api/books', (req, res) => {
  // Query params: q (search), category, language, page, limit
  let results = booksDatabase.slice();

  const q = (req.query.q || '').toString().toLowerCase().trim();
  const category = (req.query.category || '').toString().toLowerCase().trim();
  const language = (req.query.language || '').toString().toLowerCase().trim();

  if (q) {
    results = results.filter(b => {
      return (
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q))
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

  res.json({
    total: results.length,
    page,
    limit,
    data: paged,
  });
});

// Rechercher par ISBN
app.get('/api/books/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = booksDatabase.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Livre non trouvé' });
  res.json(book);
});

// Recherche texte (titre, auteur, isbn)
app.get('/api/books/search', (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase().trim();
  if (!q) return res.json([]);
  const results = booksDatabase.filter(b => {
    return (
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q))
    );
  });
  res.json(results);
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
    const { seedBooksToFirebase, initializeBooksIfEmpty } = await import('./src/seedBooks.js');
    const mode = req.query.mode === 'forced' ? 'forced' : 'if-empty';

    if (mode === 'forced') {
      const result = await seedBooksToFirebase('Bibliothécaire');
      return res.json(result);
    }

    const result = await initializeBooksIfEmpty('Bibliothécaire');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Biblioconnect API running on http://localhost:${PORT}`);
});
