/**
 * EXEMPLE PRATIQUE D'INTÉGRATION - ElegantCarousel
 * Montre comment utiliser le composant ElegantCarousel dans différents contextes
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ElegantCarousel from '../components/ElegantCarousel';

/**
 * EXEMPLE 1 - Affichage statique avec un seul livre
 */
export function CarouselSingleBook() {
  const sampleBook = {
    isbn: "978-2-07-036694-1",
    title: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    imageUrl: "https://via.placeholder.com/400x600?text=Seigneur+des+Anneaux",
    description: "Une épopée fantastique incontournable.",
    pages: 1200,
    rating: 4.9,
    category: "Fantasy",
    availableCopies: 5,
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-black mb-8">Exemple 1 : Livre Simple</h2>
      <ElegantCarousel data={[sampleBook]} />
    </div>
  );
}

/**
 * EXEMPLE 2 - Carousel avec plusieurs livres
 */
export function CarouselMultipleBooks() {
  const books = [
    {
      isbn: "978-2-07-036694-1",
      title: "Le Seigneur des Anneaux",
      author: "J.R.R. Tolkien",
      imageUrl: "https://via.placeholder.com/400x600?text=Seigneur+des+Anneaux",
      description: "Une épopée fantastique incontournable.",
      pages: 1200,
      rating: 4.9,
      category: "Fantasy",
      availableCopies: 5,
    },
    {
      isbn: "978-2-253-06532-8",
      title: "Harry Potter à l'école des sorciers",
      author: "J.K. Rowling",
      imageUrl: "https://via.placeholder.com/400x600?text=Harry+Potter",
      description: "Le début de la saga Harry Potter.",
      pages: 223,
      rating: 4.8,
      category: "Fantasy",
      availableCopies: 3,
    },
    {
      isbn: "978-2-07-063146-2",
      title: "Les Misérables",
      author: "Victor Hugo",
      imageUrl: "https://via.placeholder.com/400x600?text=Les+Miserables",
      description: "Chef-d'œuvre de la littérature française.",
      pages: 1462,
      rating: 4.7,
      category: "Classic",
      availableCopies: 2,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-black mb-8">Exemple 2 : Plusieurs Livres</h2>
      <ElegantCarousel 
        data={books}
        onSlideChange={(index) => console.log(`Slide switched to: ${index}`)}
      />
    </div>
  );
}

/**
 * EXEMPLE 3 - Intégration avec dynamique et callback
 */
export function CarouselWithDynamicData() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const books = [
    {
      isbn: "978-2-07-036694-1",
      title: "Le Seigneur des Anneaux",
      author: "J.R.R. Tolkien",
      imageUrl: "https://via.placeholder.com/400x600?text=Seigneur+des+Anneaux",
      description: "Une épopée fantastique incontournable.",
      pages: 1200,
      rating: 4.9,
    },
    {
      isbn: "978-2-253-06532-8",
      title: "Harry Potter",
      author: "J.K. Rowling",
      imageUrl: "https://via.placeholder.com/400x600?text=Harry+Potter",
      description: "La saga magique complète.",
      pages: 223,
      rating: 4.8,
    },
  ];

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    setSelectedBook(books[index]);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <h2 className="text-3xl font-black">Exemple 3 : Avec Callback</h2>
      
      <div className="grid grid-cols-3 gap-8">
        {/* Carousel à gauche */}
        <div className="col-span-2">
          <ElegantCarousel 
            data={books}
            onSlideChange={handleSlideChange}
          />
        </div>

        {/* Infos du livre sélectionné à droite */}
        <div className="bg-white rounded-3xl p-6 shadow-xl h-fit sticky top-4">
          <h3 className="text-xl font-black mb-4">Slide actuelle: {currentSlide + 1}</h3>
          {selectedBook && (
            <div className="space-y-3">
              <p><strong>Titre:</strong> {selectedBook.title}</p>
              <p><strong>Auteur:</strong> {selectedBook.author}</p>
              <p><strong>Pages:</strong> {selectedBook.pages}</p>
              <p><strong>Note:</strong> ⭐ {selectedBook.rating}/5</p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                Plus d'infos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * EXEMPLE 4 - Grille de livres avec liens vers BookDetail
 */
export function BookGridWithCarousel() {
  const navigate = useNavigate();

  const books = [
    {
      id: "book1",
      isbn: "978-2-07-036694-1",
      title: "Le Seigneur des Anneaux",
      author: "J.R.R. Tolkien",
      coverUrl: "https://via.placeholder.com/400x600?text=Seigneur+des+Anneaux",
      description: "Une épopée fantastique",
      pages: 1200,
      rating: 4.9,
      availableCopies: 5,
    },
    {
      id: "book2",
      isbn: "978-2-253-06532-8",
      title: "Harry Potter",
      author: "J.K. Rowling",
      coverUrl: "https://via.placeholder.com/400x600?text=Harry+Potter",
      description: "La saga magique",
      pages: 223,
      rating: 4.8,
      availableCopies: 3,
    },
  ];

  const handleBookClick = (bookId) => {
    // Naviguer vers la page BookDetail
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-3xl font-black mb-8">Exemple 4 : Grille avec Navigation</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => handleBookClick(book.id)}
            className="group cursor-pointer"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                <div className="bg-gradient-to-t from-black to-transparent w-full p-4 text-white">
                  <p className="font-black text-sm line-clamp-1">{book.title}</p>
                  <p className="font-bold text-xs text-gray-300">{book.author}</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * EXEMPLE 5 - Utilisation complète dans BookDetail
 */
export function BookDetailExample() {
  const [book] = useState({
    id: "book1",
    isbn: "978-2-07-036694-1",
    title: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    coverUrl: "https://via.placeholder.com/400x600?text=Seigneur+des+Anneaux",
    description: "Une épopée fantastique incontournable de la littérature mondiale.",
    pages: 1200,
    rating: 4.9,
    category: "Fantasy",
    availableCopies: 5,
  });

  // Préparer les données pour le carousel
  const carouselData = book ? [
    {
      isbn: book.isbn || 'N/A',
      title: book.title,
      author: book.author,
      imageUrl: book.coverUrl || 'https://via.placeholder.com/400x600',
      description: book.description,
      pages: book.pages,
      rating: book.rating,
      availableCopies: book.availableCopies,
    },
    // Slide supplémentaire pour l'auteur
    {
      isbn: book.isbn || 'N/A',
      title: `À propos de l'auteur`,
      author: book.author,
      imageUrl: book.coverUrl || 'https://via.placeholder.com/400x600',
      description: `${book.author} est l'auteur de "${book.title}". Catégorie: ${book.category}`,
      pages: book.pages,
      rating: book.rating,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carousel - 2 colonnes */}
          <div className="lg:col-span-2">
            <ElegantCarousel data={carouselData} />
          </div>

          {/* Infos du livre - colonne droite */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">
                  {book.title}
                </h2>
                <p className="text-lg font-bold text-blue-600">{book.author}</p>
              </div>

              <div className="h-px bg-gray-200"></div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">ISBN</span>
                  <span className="font-mono">{book.isbn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">Catégorie</span>
                  <span className="font-bold">{book.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">Pages</span>
                  <span className="font-black">{book.pages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">Note</span>
                  <span className="font-black text-yellow-500">⭐ {book.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">Disponibilité</span>
                  <span className="font-black text-green-600">{book.availableCopies} copies</span>
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700">
                📕 Emprunter ce livre
              </button>
              <button className="w-full bg-white border-2 border-gray-300 text-slate-800 py-4 rounded-2xl font-bold hover:border-blue-400">
                ⭐ Ajouter aux favoris
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant de démonstration avec tous les exemples
 */
export default function ElegantCarouselExamples() {
  const [activeExample, setActiveExample] = useState(1);

  const examples = [
    { id: 1, name: "Livre Simple", component: CarouselSingleBook },
    { id: 2, name: "Plusieurs Livres", component: CarouselMultipleBooks },
    { id: 3, name: "Avec Callback", component: CarouselWithDynamicData },
    { id: 4, name: "Grille", component: BookGridWithCarousel },
    { id: 5, name: "BookDetail", component: BookDetailExample },
  ];

  const ActiveComponent = examples.find(ex => ex.id === activeExample)?.component || CarouselSingleBook;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation des exemples */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={`px-6 py-2 rounded-full font-bold transition whitespace-nowrap ${
                  activeExample === example.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu actif */}
      <div className="py-12">
        <ActiveComponent />
      </div>
    </div>
  );
}
