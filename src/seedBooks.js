/**
 * SEED - Initialiser la base de données avec les livres de BiblioConnect
 * Ce fichier contient tous les livres du projet et une fonction pour les ajouter à Firestore
 */

import { databaseService } from './services';

/**
 * ========================================
 * BASE DE DONNÉES COMPLÈTE DES LIVRES
 * ========================================
 */

export const booksDatabase = [
  // =================== DÉVELOPPEMENT (Informatique) ===================
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Développement",
    description: "Un guide complet sur comment écrire du code propre et maintenable.",
    pages: 464,
    rating: 4.9,
    totalCopies: 5,
    publisher: "Prentice Hall",
    yearPublished: 2008,
    language: "En",
    coverImageUrl: "https://books.google.com/books/content?id=hjI6XwAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    keywords: ["code", "programmation", "qualité", "best practices"],
  },
  {
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    isbn: "978-1593279508",
    category: "Développement",
    description: "Un livre complet pour apprendre JavaScript des bases aux concepts avancés.",
    pages: 472,
    rating: 4.8,
    totalCopies: 8,
    publisher: "No Starch Press",
    yearPublished: 2018,
    language: "En",
    coverImageUrl: "https://books.google.com/books/content?id=8i9bDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    keywords: ["javascript", "programmation", "web", "tutoriel"],
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    isbn: "978-0135957059",
    category: "Développement",
    description: "Pratiques et conseils pour devenir un meilleur programmeur.",
    pages: 352,
    rating: 4.7,
    totalCopies: 4,
    publisher: "Addison-Wesley",
    yearPublished: 2019,
    language: "En",
    coverImageUrl: "https://books.google.com/books/content?id=gJ_2DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    keywords: ["programmation", "carrière", "pratiques", "développeur"],
  },
  {
    title: "Design Patterns",
    author: "Gang of Four",
    isbn: "978-0201633610",
    category: "Développement",
    description: "Les patterns essentiels pour la conception de logiciels robustes.",
    pages: 395,
    rating: 4.6,
    totalCopies: 3,
    publisher: "Addison-Wesley",
    yearPublished: 1994,
    language: "En",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Design+Patterns",
    keywords: ["patterns", "conception", "architéture", "réutilisable"],
  },
  {
    title: "Code Complete",
    author: "Steve McConnell",
    isbn: "978-0735619678",
    category: "Développement",
    description: "Guide pratique complet pour la construction de logiciels de haute qualité.",
    pages: 960,
    rating: 4.8,
    totalCopies: 2,
    publisher: "Microsoft Press",
    yearPublished: 2004,
    language: "En",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Code+Complete",
    keywords: ["développement", "qualité", "construction", "logiciel"],
  },

  // =================== FICTION ===================
  {
    title: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    isbn: "978-2-07-036694-1",
    category: "Fantasy",
    description: "Une épopée fantastique incontournable avec la quête de détruire l'anneau unique.",
    pages: 1200,
    rating: 4.9,
    totalCopies: 7,
    publisher: "Le Livre de Poche",
    yearPublished: 1954,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Seigneur+des+Anneaux",
    keywords: ["fantasy", "épopée", "quête", "magie"],
  },
  {
    title: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    isbn: "978-2-253-06532-8",
    category: "Fantasy",
    description: "Le début de la saga Harry Potter où il découvre qu'il est un sorcier.",
    pages: 309,
    rating: 4.8,
    totalCopies: 10,
    publisher: "Le Livre de Poche",
    yearPublished: 1998,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Harry+Potter",
    keywords: ["harry potter", "fantasy", "jeunesse", "magie", "sorcellerie"],
  },
  {
    title: "Les Misérables",
    author: "Victor Hugo",
    isbn: "978-2-07-063146-2",
    category: "Classique",
    description: "Chef-d'œuvre de la littérature française. Histoire de Jean Valjean et de sa rédemption.",
    pages: 1462,
    rating: 4.7,
    totalCopies: 5,
    publisher: "Le Livre de Poche",
    yearPublished: 1862,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Les+Miserables",
    keywords: ["classique", "drame", "justice", "rédemption"],
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524934",
    category: "Dystopie",
    description: "Un roman dystopique sur un régime totalitaire et la surveillance de masse.",
    pages: 328,
    rating: 4.8,
    totalCopies: 6,
    publisher: "Penguin Books",
    yearPublished: 1949,
    language: "En",
    coverImageUrl: "https://via.placeholder.com/300x400?text=1984",
    keywords: ["dystopie", "totalitarisme", "société", "futur"],
  },
  {
    title: "Le Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-2-253-04910-5",
    category: "Fantasy",
    description: "L'histoire de Bilbo Sacquet et de son aventure pour trouver le trésor du dragon.",
    pages: 300,
    rating: 4.7,
    totalCopies: 4,
    publisher: "Le Livre de Poche",
    yearPublished: 1937,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Le+Hobbit",
    keywords: ["fantasy", "aventure", "quête", "dragon"],
  },

  // =================== HISTOIRE ===================
  {
    title: "Une brève histoire du temps",
    author: "Stephen Hawking",
    isbn: "978-2-7540-2721-5",
    category: "Sciences",
    description: "Exploration fascinante de l'univers, du Big Bang à nos jours.",
    pages: 236,
    rating: 4.6,
    totalCopies: 3,
    publisher: "Odile Jacob",
    yearPublished: 1988,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Histoire+du+temps",
    keywords: ["science", "univers", "physique", "cosmologie"],
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    isbn: "978-2-07-065186-7",
    category: "Histoire",
    description: "Histoire captivante de l'humanité depuis l'âge de pierre jusqu'à nos jours.",
    pages: 541,
    rating: 4.8,
    totalCopies: 8,
    publisher: "Albin Michel",
    yearPublished: 2011,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Sapiens",
    keywords: ["histoire", "humanité", "évolution", "société"],
  },
  {
    title: "La Révolution Française",
    author: "Simon Schama",
    isbn: "978-2-226-06209-8",
    category: "Histoire",
    description: "Récit détaillé et captivant de la plus grande révolution politique de l'histoire.",
    pages: 944,
    rating: 4.5,
    totalCopies: 2,
    publisher: "Le Seuil",
    yearPublished: 1989,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Revolution+Francaise",
    keywords: ["histoire", "france", "révolution", "politique"],
  },

  // =================== AFFAIRES & DÉVELOPPEMENT PERSONNEL ===================
  {
    title: "Pensées pour moi-même",
    author: "Marc Aurèle",
    isbn: "978-2-253-04883-2",
    category: "Philosophie",
    description: "Réflexions philosophiques du plus grand empereur romain sur la vie et la vertu.",
    pages: 256,
    rating: 4.7,
    totalCopies: 4,
    publisher: "Le Livre de Poche",
    yearPublished: 170,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Pensees+pour+moi",
    keywords: ["philosophie", "stoïcisme", "sagesse", "réflexion"],
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "978-2100818310",
    category: "Développement Personnel",
    description: "Guide pratique pour construire de bonnes habitudes et en éliminer les mauvaises.",
    pages: 408,
    rating: 4.8,
    totalCopies: 9,
    publisher: "Nathan",
    yearPublished: 2018,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Atomic+Habits",
    keywords: ["habitudes", "développement", "productivité", "transformation"],
  },
  {
    title: "La loi de l'attraction",
    author: "Jerry Hicks et Esther Hicks",
    isbn: "978-2844502079",
    category: "Développement Personnel",
    description: "Guide pour utiliser le pouvoir de pensée pour attirer ce que vous désirez.",
    pages: 380,
    rating: 4.3,
    totalCopies: 3,
    publisher: "Ada",
    yearPublished: 2006,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Loi+Attraction",
    keywords: ["développement", "mentalité", "attraction", "réussite"],
  },

  // =================== SCIENCES & NATURE ===================
  {
    title: "Le monde de Sophie",
    author: "Jostein Gaarder",
    isbn: "978-2253050834",
    category: "Philosophie",
    description: "Roman philosophique qui explore les grandes questions de l'existence.",
    pages: 646,
    rating: 4.6,
    totalCopies: 5,
    publisher: "Seuil",
    yearPublished: 1991,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Monde+Sophie",
    keywords: ["philosophie", "roman", "éducation", "questionnement"],
  },
  {
    title: "Le Silence des agneaux",
    author: "Thomas Harris",
    isbn: "978-2253055761",
    category: "Thriller",
    description: "Thriller psychologique intense avec l'agent FBI Clarice Starling et Hannibal Lecter.",
    pages: 454,
    rating: 4.7,
    totalCopies: 4,
    publisher: "Le Livre de Poche",
    yearPublished: 1988,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Silence+Agneaux",
    keywords: ["thriller", "crime", "psychologie", "suspense"],
  },

  // =================== JEUNESSE ===================
  {
    title: "Le Monde de Narnia",
    author: "C.S. Lewis",
    isbn: "978-2253032977",
    category: "Fantasy",
    description: "Série de contes de fées fantastiques dans un monde magique parallèle.",
    pages: 272,
    rating: 4.6,
    totalCopies: 6,
    publisher: "Le Livre de Poche",
    yearPublished: 1950,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Narnia",
    keywords: ["fantasy", "jeunesse", "aventure", "magie", "monde"],
  },
  {
    title: "Percy Jackson",
    author: "Rick Riordan",
    isbn: "978-2015048634",
    category: "Jeunesse",
    description: "Aventures d'un jeune demi-dieu découvrant ses pouvoirs grecs.",
    pages: 375,
    rating: 4.5,
    totalCopies: 5,
    publisher: "Albin Michel Jeunesse",
    yearPublished: 2005,
    language: "Fr",
    coverImageUrl: "https://via.placeholder.com/300x400?text=Percy+Jackson",
    keywords: ["jeunesse", "mythology", "aventure", "fantasy"],
  },
];

/**
 * ========================================
 * FONCTION POUR INITIALISER LES LIVRES
 * ========================================
 */

/**
 * Ajouter tous les livres à Firestore
 * À utiliser UNE SEULE FOIS pour initialiser la base de données
 * 
 * @param {string} userRole - Rôle de l'utilisateur (doit être 'Bibliothécaire')
 * @returns {Promise<Object>} Résumé de l'opération
 */
export const seedBooksToFirebase = async (userRole = 'Bibliothécaire') => {
  try {
    if (userRole !== 'Bibliothécaire') {
      throw new Error('Seul un bibliothécaire peut ajouter des livres à la base de données.');
    }

    const results = {
      success: [],
      errors: [],
      total: booksDatabase.length,
      addedCount: 0,
      errorCount: 0,
    };

    console.log(`📚 Début de l'ajout de ${booksDatabase.length} livres...`);

    // Ajouter chaque livre
    for (const book of booksDatabase) {
      try {
        const bookId = await databaseService.addBook(userRole, {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          category: book.category,
          description: book.description || '',
          pages: book.pages || 0,
          rating: book.rating || 0,
          coverImageUrl: book.coverImageUrl || '',
          totalCopies: book.totalCopies || 1,
          publisher: book.publisher || '',
          yearPublished: book.yearPublished || new Date().getFullYear(),
          language: book.language || 'Fr',
          keywords: book.keywords || [],
        });

        results.success.push({
          title: book.title,
          id: bookId,
          status: '✅ Ajouté',
        });
        results.addedCount++;

        console.log(`✅ ${book.title} (ID: ${bookId})`);
      } catch (error) {
        results.errors.push({
          title: book.title,
          status: '❌ Erreur',
          error: error.message,
        });
        results.errorCount++;

        console.error(`❌ Erreur pour ${book.title}: ${error.message}`);
      }
    }

    console.log('\n========================================');
    console.log('📊 RÉSUMÉ DE L\'INITIALISATION');
    console.log('========================================');
    console.log(`Total de livres: ${results.total}`);
    console.log(`✅ Ajoutés avec succès: ${results.addedCount}`);
    console.log(`❌ Erreurs: ${results.errorCount}`);
    console.log('========================================\n');

    return results;
  } catch (error) {
    console.error('Erreur lors du seed:', error.message);
    throw error;
  }
};

/**
 * ========================================
 * FONCTION D'INITIALISATION ALTERNATIVE
 * ========================================
 */

/**
 * Vérifier et initialiser les livres si la base est vide
 * Cette fonction vérifie d'abord si la base contient des livres
 * avant d'ajouter les données d'initialisation
 * 
 * @param {string} userRole - Rôle de l'utilisateur
 * @returns {Promise<Object>} Résumé de l'opération
 */
export const initializeBooksIfEmpty = async (userRole = 'Bibliothécaire') => {
  try {
    // Vérifier si des livres existent déjà
    const existingBooks = await databaseService.getAllBooks();

    if (existingBooks && existingBooks.length > 0) {
      console.log(`📚 Base de données déjà initialisée avec ${existingBooks.length} livres.`);
      return {
        status: 'already_initialized',
        booksCount: existingBooks.length,
        message: 'La base de données contient déjà des livres.',
      };
    }

    // Base vide, initialiser les données
    console.log('📚 Base de données vide. Initialisation en cours...');
    return await seedBooksToFirebase(userRole);
  } catch (error) {
    console.error('Erreur lors de la vérification/initialisation:', error.message);
    throw error;
  }
};

/**
 * ========================================
 * EXPORT DES STATISTIQUES
 * ========================================
 */

export const booksStats = {
  total: booksDatabase.length,
  categories: {
    Développement: booksDatabase.filter(b => b.category === 'Développement').length,
    Fantasy: booksDatabase.filter(b => b.category === 'Fantasy').length,
    Classique: booksDatabase.filter(b => b.category === 'Classique').length,
    Dystopie: booksDatabase.filter(b => b.category === 'Dystopie').length,
    Sciences: booksDatabase.filter(b => b.category === 'Sciences').length,
    Histoire: booksDatabase.filter(b => b.category === 'Histoire').length,
    Philosophie: booksDatabase.filter(b => b.category === 'Philosophie').length,
    'Développement Personnel': booksDatabase.filter(b => b.category === 'Développement Personnel').length,
    Thriller: booksDatabase.filter(b => b.category === 'Thriller').length,
    Jeunesse: booksDatabase.filter(b => b.category === 'Jeunesse').length,
  },
  totalCopies: booksDatabase.reduce((sum, book) => sum + (book.totalCopies || 1), 0),
  averageRating: (booksDatabase.reduce((sum, book) => sum + (book.rating || 0), 0) / booksDatabase.length).toFixed(2),
};

export default {
  seedBooksToFirebase,
  initializeBooksIfEmpty,
  booksDatabase,
  booksStats,
};
