/**
 * SEED - Initialiser la base de données avec les livres de BiblioConnect
 * Version finale corrigée avec 30 classiques et exports fonctionnels.
 */

import * as databaseService from './services/databaseService.js';

/**
 * ========================================
 * BASE DE DONNÉES DES 30 CLASSIQUES
 * ========================================
 */
export const booksDatabase = [
  // LITTÉRATURE CLASSIQUE
  {
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    isbn: "978-2070612758",
    category: "Classique",
    description: "Un conte philosophique sur la solitude et l'amitié.",
    pages: 96,
    rating: 4.9,
    totalCopies: 12,
    publisher: "Gallimard",
    yearPublished: 1943,
    language: "Fr",
    coverImageUrl: "https://upload.wikimedia.org/wikipedia/en/0/05/Littleprince.JPG",
    keywords: ["philosophie", "jeunesse", "poésie"]
  },
  {
    title: "L'Étranger",
    author: "Albert Camus",
    isbn: "978-2070360024",
    category: "Classique",
    description: "Le récit de l'absurdité de l'existence à travers Meursault.",
    pages: 184,
    rating: 4.8,
    totalCopies: 8,
    publisher: "Gallimard",
    yearPublished: 1942,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1386913918i/11994.jpg",
    keywords: ["absurde", "philosophie"]
  },
  {
    title: "Les Misérables",
    author: "Victor Hugo",
    isbn: "978-2253096337",
    category: "Classique",
    description: "Le destin épique de Jean Valjean.",
    pages: 1462,
    rating: 4.9,
    totalCopies: 6,
    publisher: "Le Livre de Poche",
    yearPublished: 1862,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/71mPzsZvh6L._AC_UF1000,1000_QL80_.jpg",
    keywords: ["justice", "rédemption"]
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524934",
    category: "Philosophie",
    description: "Un monde sous la surveillance de Big Brother.",
    pages: 328,
    rating: 4.8,
    totalCopies: 15,
    publisher: "Penguin",
    yearPublished: 1949,
    language: "En",
    coverImageUrl: "https://m.media-amazon.com/images/I/71kxa1-0mfL._SL1500_.jpg",
    keywords: ["surveillance", "totalitarisme"]
  },
  {
    title: "Le Comte de Monte-Cristo",
    author: "Alexandre Dumas",
    isbn: "978-2253008897",
    category: "Classique",
    description: "Une histoire de trahison et de vengeance implacable.",
    pages: 1600,
    rating: 4.9,
    totalCopies: 7,
    publisher: "Le Livre de Poche",
    yearPublished: 1844,
    language: "Fr",
    coverImageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwfuG2atV-bT_qWdRVQ-VVmaFUpgFsyAormHzAX1xev3u6jC6Pn2FolzJN_SnZzSpjzXtK1AotwicypP5D3RsDyIPn6Ywk_pQmpylWVX_Z&s=10",
    keywords: ["vengeance", "aventure"]
  },
  {
    title: "Orgueil et Préjugés",
    author: "Jane Austen",
    isbn: "978-2253004356",
    category: "Classique",
    description: "Elizabeth Bennet et Mr. Darcy.",
    pages: 384,
    rating: 4.8,
    totalCopies: 9,
    publisher: "Le Livre de Poche",
    yearPublished: 1813,
    language: "Fr",
    coverImageUrl: "https://janeausten.co.uk/cdn/shop/files/Jane-Austens-Pride-and-Prejudice-Illustrated-Hardback-Edition-Jane-Austen-Ecomm-00.webp?v=1729599854&width=700",
    keywords: ["romance", "société"]
  },
  {
    title: "Le Meilleur des Mondes",
    author: "Aldous Huxley",
    isbn: "978-2266283038",
    category: "Histoire",
    description: "Une société future conditionnée pour le bonheur.",
    pages: 288,
    rating: 4.7,
    totalCopies: 10,
    publisher: "Pocket",
    yearPublished: 1932,
    language: "Fr",
    coverImageUrl: "https://static.fnac-static.com/multimedia/PE/Images/FR/NR/d0/1d/15/1383888/1540-1/tsp20251104073514/Le-meilleur-des-mondes.jpg",
    keywords: ["science-fiction", "contrôle"]
  },
  {
    title: "L'Art de la Guerre",
    author: "Sun Tzu",
    isbn: "978-2253031086",
    category: "Philosophie",
    description: "Traité de stratégie antique.",
    pages: 160,
    rating: 4.7,
    totalCopies: 12,
    publisher: "Le Livre de Poche",
    yearPublished: -500,
    language: "Fr",
    coverImageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIADgALQMBEQACEQEDEQH/xAAaAAABBQEAAAAAAAAAAAAAAAACAwQFBgcA/8QAMxAAAgEDAgMFBwIHAAAAAAAAAQIDAAQRITEFEkETIlGRsQY1YXFzgfAjMhQlM1KhweH/xAAbAQACAwEBAQAAAAAAAAAAAAAABAECBgMFB//EADMRAAIBAgMBDQkBAAAAAAAAAAABAgMRBBIhMRUyNFJhcXKRobHB0fAGEyJBUVPC4fEF/9oADAMBAAIRAxEAPwDDiTmgCUsrS0nghaQyqzmVWPargFUDA45djkj7VzlJplkkHxHh1vb2wkt3kkckDWQEDRTnbxJGN/I0Rm29QaSFBwuzRZGknZwqAqEcAswWTmXUf3Jp8D1JFRnl9PWhOVEdxGKKCZI4RJ/TRmLOG1ZQSNANs4+1Xi21qVY3Q71YgE70ASPBbKS7ldkthOsYHMpcLjPz+RFc6k1HaxvC4Ktir+6V7ctiat7O+ge5C8OXsJDlEEqjl0I9D5gVxdSDtqO7jY3idq8w47O7WIqbJmdoTEzF01/dhjrv3v8AFDqRvtDcbG8TtXmVOWNopXjcYZGKkfEUyndXPJnBwk4y2o6PrUlQTvQBavYNQ0tyHxyloubJxpls0pitiNL7PycYVmtun5FsniCRocIDkjGg64we8f8AlKJmipVHKT9dWi/Y5e2iWKYqiFl7oOdNsnc/mnzqt2LRrzc43bs9e3mMn4j7wuvrP6mvWhvUYrGcJqdJ94lH1qwsCd6ALX7Bh2kvBGSG7moGSP3UpivkaT/AcVGrm2fD4lodXSFf1AVc8xUMDqCRnelPmaaMoym9NVyczFeadkZ+3YDOR3Tq3gPP5VGhytSUlHL/AD0ucy7iPvC6+s/qa9WG9Rg8Zwmp0n3iUfWrCwJ3oAtXsI/ZvePjJATHwOGwaUxWtjS+z8M8aq6PiWua4EicoEoCgBS0mfP1pRKxoqdBwld25dADN+iiK0nMGZmJbxxt5UWOipfG5NK2nj5ma8R94XX1n9TXqQ3qPnuM4TU6T7xGPrVhYE70APrCSWBWMN8tvzgFgCcnGfz71SST2oYoYmtQv7qTVx0Ly8Of5xserHWq5IcU77pYz7r6zv4u9zrxgYwNec70ZIcUN0sZ919ZGXS4mJ7ZZi3eLL410WwSlJyk5N3bAj61JUE70AL2Vy1pN2qoGPKRhttahq5KdhzPxWWWKSMIFDuXzk5UlubTw1/11GaqoJBmFH4zI4kzFjtHLnvnTvBh5ED7Z8c0ZETmIqrlQ4+tAH//2Q==",
    keywords: ["stratégie", "leadership"]
  },
  {
    title: "Méditations",
    author: "Marc Aurèle",
    isbn: "978-2081395566",
    category: "Philosophie",
    description: "Réflexions stoïciennes d'un empereur.",
    pages: 224,
    rating: 4.8,
    totalCopies: 6,
    publisher: "Flammarion",
    yearPublished: 180,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/410FuF1hptL._SY445_SX342_ML2_.jpg",
    keywords: ["stoïcisme", "sagesse"]
  },
  {
    title: "Comment se faire des amis",
    author: "Dale Carnegie",
    isbn: "978-2253051411",
    category: "Classique",
    description: "Le guide référence pour les relations sociales.",
    pages: 320,
    rating: 4.8,
    totalCopies: 18,
    publisher: "Le Livre de Poche",
    yearPublished: 1936,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/41ru8lTgcIL._SY445_SX342_ML2_.jpg",
    keywords: ["communication", "relations"]
  },
  {
    title: "Astérix le Gaulois",
    author: "René Goscinny & Albert Uderzo",
    isbn: "978-2012101333",
    category: "BD",
    description: "La toute première aventure d'Astérix et Obélix contre l'envahisseur romain. Un monument de l'humour et de la culture franco-belge.",
    pages: 48,
    rating: 4.8,
    totalCopies: 12,
    publisher: "Hachette",
    yearPublished: 1961,
    language: "Fr",
    coverImageUrl: "https://images.renaud-bray.com/images/PG/553/553329-gf.jpg?404=404RB.gif",
    keywords: ["humour", "histoire", "gaulois", "aventure"],
  },
  {
    title: "One Piece - Tome 1",
    author: "Eiichiro Oda",
    isbn: "978-2723488525",
    category: "BD",
    description: "Luffy, un jeune garçon dont le corps est devenu élastique, se lance à la recherche du trésor légendaire pour devenir le roi des pirates.",
    pages: 208,
    rating: 4.9,
    totalCopies: 25,
    publisher: "Glénat",
    yearPublished: 1997,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/518KKkmd1fL._SY445_SX342_ML2_.jpg",
    keywords: ["pirates", "aventure", "shonen", "pouvoirs"],
  },
  {
    title: "Maus",
    author: "Art Spiegelman",
    isbn: "978-2081229068",
    category: "BD",
    description: "Le premier roman graphique à avoir reçu le prix Pulitzer. Une œuvre poignante sur la Shoah où les Juifs sont représentés par des souris et les Nazis par des chats.",
    pages: 296,
    rating: 4.9,
    totalCopies: 5,
    publisher: "Flammarion",
    yearPublished: 1980,
    language: "Fr",
    coverImageUrl: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRcfZ4RkiztfabnEngmtuLEqAumWoSIjYvQ3CHpVmGeXGA9yqfQ",
    keywords: ["histoire", "guerre", "biographie", "mémoire"],
  },
  {
    title: "Batman: The Killing Joke",
    author: "Alan Moore & Brian Bolland",
    isbn: "978-2365773477",
    category: "BD",
    description: "L'une des histoires les plus célèbres de Batman, explorant les origines du Joker et sa relation obsessionnelle avec le Chevalier Noir.",
    pages: 64,
    rating: 4.7,
    totalCopies: 8,
    publisher: "Urban Comics",
    yearPublished: 1988,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/91OjBx3hSNL._SY466_.jpg",
    keywords: ["super-héros", "joker", "noir", "psychologique"],
  },
  {
    title: "Le Seigneur des Anneaux - L'Intégrale",
    author: "J.R.R. Tolkien",
    isbn: "978-2266283038",
    category: "Fantaisie",
    description: "Le chef-d'œuvre absolu de la Fantaisie. Suivez la quête de Frodon pour détruire l'Anneau Unique dans les flammes de la Montagne du Destin.",
    pages: 1178,
    rating: 5.0,
    totalCopies: 10,
    publisher: "Pocket",
    yearPublished: 1954,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/51F65nJNyPL._SY445_SX342_ML2_.jpg",
    keywords: ["épopée", "anneau", "magie", "aventure"],
  },
  {
    title: "Fourth Wing (The Empyrean, Book 1)",
    author: "Rebecca Yarros",
    isbn: "978-2266341234",
    category: "Fantaisie",
    description: "Bienvenue au collège de guerre de Basgiath, où les dragons ne se lient qu'aux plus forts. Pour Violet Sorrengail, l'obtention d'un diplôme signifie la survie... ou la mort.",
    pages: 600,
    rating: 4.9,
    totalCopies: 15,
    publisher: "Hugo Roman",
    yearPublished: 2023,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/914HWd0RxsL._UF1000,1000_QL80_.jpg",
    keywords: ["dragons", "romance", "action", "académie"],
  },
  {
    title: "American Gods",
    author: "Neil Gaiman",
    isbn: "978-2290038451",
    category: "Fantaisie",
    description: "Une guerre se prépare entre les anciens dieux des mythologies et les nouveaux dieux de la technologie et des médias. Un voyage onirique à travers l'Amérique.",
    pages: 608,
    rating: 4.6,
    totalCopies: 5,
    publisher: "J'ai Lu",
    yearPublished: 2001,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/91MFgXaItzL._SY522_.jpg",
    keywords: ["mythologie", "moderne", "voyage", "dieux"],
  },
  {
    title: "Le Trône de Fer - L'Intégrale 1",
    author: "George R.R. Martin",
    isbn: "978-2290019436",
    category: "Fantaisie",
    description: "Dans un pays où les étés durent des décennies et les hivers une vie entière, des familles nobles luttent pour le contrôle du Trône de Fer.",
    pages: 800,
    rating: 4.8,
    totalCopies: 8,
    publisher: "Pygmalion",
    yearPublished: 1996,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/4102gMwjYGL._SY445_SX342_QL70_ML2_.jpg",
    keywords: ["politique", "guerre", "royaumes", "dragons"],
  },
  {
    title: "Vercingétorix",
    author: "Jean-Louis Brunaux",
    isbn: "978-2070123574",
    category: "Histoire",
    description: "Une biographie rigoureuse qui dépoussière le mythe du chef gaulois. Découvrez l'homme derrière la légende, de sa montée en puissance à la tragédie d'Alésia.",
    pages: 400,
    rating: 4.7,
    totalCopies: 5,
    publisher: "Gallimard",
    yearPublished: 2018,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/91StkTh4ncL._SY425_.jpg",
    keywords: ["gaulois", "antiquité", "guerre", "biographie"],
  },
  {
    title: "Sapiens : Une brève histoire de l'humanité",
    author: "Yuval Noah Harari",
    isbn: "978-2226257017",
    category: "Histoire",
    description: "Comment notre espèce a-t-elle réussi à dominer la Terre ? Harari retrace l'évolution de l'Homo Sapiens, de l'âge de pierre à l'ère de l'intelligence artificielle.",
    pages: 512,
    rating: 4.9,
    totalCopies: 12,
    publisher: "Albin Michel",
    yearPublished: 2014,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/41r9p0w-a2L._SY445_SX342_ML2_.jpg",
    keywords: ["évolution", "société", "humanité", "révolution"],
  },
  {
    title: "Napoléon",
    author: "Max Gallo",
    isbn: "978-2221090459",
    category: "Histoire",
    description: "Le premier tome de la fresque monumentale de Max Gallo. Suivez l'ascension fulgurante du petit caporal corse devenu empereur de l'Europe.",
    pages: 600,
    rating: 4.8,
    totalCopies: 8,
    publisher: "Robert Laffont",
    yearPublished: 1997,
    language: "Fr",
    coverImageUrl: "https://m.media-amazon.com/images/I/91+oXg8O01L._AC_UF1000,1000_QL80_.jpg",
    keywords: ["empire", "napoléon", "france", "batailles"],
  },
  {
    title: "Test",
    author: "Test",
    isbn: "978-2070123578",
    category: "",
    description: "Test",
    pages: 1,
    rating: 1,
    totalCopies: 1,
    publisher: "Test",
    yearPublished: 2018,
    language: "Fr",
    coverImageUrl: "https://d8iqbmvu05s9c.cloudfront.net/aiqpo1f3jbzpd0silc6b0qqot9ao",
    keywords: [""],
  }
];

/**
 * ========================================
 * LOGIQUE D'INITIALISATION
 * ========================================
 */

/**
 * seedBooksToFirebase - Force l'ajout des livres
 */
export const seedBooksToFirebase = async (userRole = 'Bibliothécaire') => {
  try {
    if (userRole !== 'Bibliothécaire') {
      throw new Error('Seul un bibliothécaire peut ajouter des livres.');
    }

    const results = {
      success: [],
      errors: [],
      total: booksDatabase.length,
      addedCount: 0,
      errorCount: 0,
    };

    console.log(`📚 Début de l'ajout de ${booksDatabase.length} livres...`);

    for (const book of booksDatabase) {
      try {
        const bookId = await databaseService.addBook(userRole, {
          ...book,
          keywords: book.keywords || [],
          yearPublished: book.yearPublished || new Date().getFullYear(),
        });

        results.success.push({ title: book.title, id: bookId });
        results.addedCount++;
        console.log(`✅ ${book.title}`);
      } catch (error) {
        results.errors.push({ title: book.title, error: error.message });
        results.errorCount++;
      }
    }

    return results;
  } catch (error) {
    console.error('Erreur lors du seed:', error.message);
    throw error;
  }
};

/**
 * initializeBooksIfEmpty - Vérifie et initialise si vide (Appelé par le serveur)
 */
export const initializeBooksIfEmpty = async (userRole = 'Bibliothécaire') => {
  try {
    const existingBooks = await databaseService.getAllBooks();

    if (existingBooks && existingBooks.length > 0) {
      console.log(`📚 Base déjà initialisée (${existingBooks.length} livres).`);
      return {
        status: 'already_initialized',
        booksCount: existingBooks.length,
        message: 'La base contient déjà des livres.',
      };
    }

    console.log('📚 Base de données vide. Initialisation auto...');
    return await seedBooksToFirebase(userRole);
  } catch (error) {
    console.error('Erreur lors de la vérification:', error.message);
    throw error;
  }
};

/**
 * Export par défaut pour assurer la compatibilité avec seedModule
 */
export default {
  seedBooksToFirebase,
  initializeBooksIfEmpty,
  booksDatabase
};