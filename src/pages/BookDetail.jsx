import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingCart, faBookmark } from '@fortawesome/free-solid-svg-icons';
import ElegantCarousel from '../components/ElegantCarousel';
import { databaseService } from '../services';
import Loading from '../components/Loading';

/**
 * BookDetail - Page de détail d'un livre avec carousel elegant
 * Affiche les informations complètes du livre et permet de l'emprunter
 */
export default function BookDetail() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      try {
        if (bookId) {
          const bookData = await databaseService.getBookById(bookId);
          setBook(bookData);
        }
      } catch (err) {
        setError('Impossible de charger le livre: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  const handleBorrow = async () => {
    try {
      setBorrowing(true);
      // Logique d'emprunt sera implémentée ici
      setBorrowing(false);
      // Afficher un message de succès
    } catch (err) {
      setError('Erreur lors de l\'emprunt: ' + err.message);
      setBorrowing(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-800 text-center p-6 rounded-2xl max-w-md">
          <h2 className="text-xl font-black mb-2">Erreur</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 text-lg font-medium">Livre non trouvé</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Préparer les données pour le carousel
  // Utiliser l'image du livre + des slides optionnels pour auteur, détails, etc.
  const carouselData = [
    {
      isbn: book.isbn || 'N/A',
      title: book.title,
      author: book.author,
      imageUrl: book.coverUrl || 'https://via.placeholder.com/400x600?text=Pas+d%27image',
      description: book.description,
      pages: book.pages,
      rating: book.rating,
    },
    // Optionnel: Ajouter un slide pour l'auteur
    ...(book.author ? [{
      isbn: book.isbn || 'N/A',
      title: `À propos de l'auteur`,
      author: book.author,
      imageUrl: book.coverUrl || 'https://via.placeholder.com/400x600',
      description: `${book.author} est l'auteur de "${book.title}". Catégorie: ${book.category || 'Non spécifiée'}`,
      pages: book.pages,
      rating: book.rating,
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header avec bouton retour */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold transition group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition" />
            Retour
          </button>
          <h1 className="text-xl font-black text-slate-800 truncate">Détail du Livre</h1>
          <div className="w-12"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carousel Section - Prend 2 colonnes sur desktop */}
          <div className="lg:col-span-2">
            <ElegantCarousel data={carouselData} />
          </div>

          {/* Informations et Actions - Colonne de droite */}
          <div className="space-y-6">
            {/* Informations principales */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 space-y-5">
              {/* Titre et Auteur */}
              <div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 line-clamp-2">
                  {book.title}
                </h2>
                <p className="text-lg font-bold text-blue-600">
                  {book.author}
                </p>
              </div>

              {/* Séparateur */}
              <div className="h-px bg-gray-200"></div>

              {/* Métadonnées */}
              <div className="space-y-3">
                {book.isbn && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">ISBN</span>
                    <span className="text-sm font-mono text-slate-800">{book.isbn}</span>
                  </div>
                )}
                {book.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Catégorie</span>
                    <span className="text-sm font-bold text-slate-800">{book.category}</span>
                  </div>
                )}
                {book.pages && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Pages</span>
                    <span className="text-sm font-black text-slate-800">{book.pages}</span>
                  </div>
                )}
                {book.rating && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Notation</span>
                    <span className="text-sm font-black text-yellow-500">⭐ {book.rating}/5</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Disponibilité</span>
                  <span className={`text-sm font-black ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} disponible(s)` : 'Indisponible'}
                  </span>
                </div>
              </div>

              {/* Séparateur */}
              <div className="h-px bg-gray-200"></div>

              {/* Description courte */}
              {book.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBorrow}
                disabled={borrowing || book.availableCopies === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg transition transform active:scale-95 shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
              >
                <FontAwesomeIcon icon={faShoppingCart} />
                {borrowing ? 'Emprunt en cours...' : 'Emprunter ce livre'}
              </button>

              <button
                className="w-full bg-white border-2 border-gray-300 hover:border-blue-400 text-slate-800 py-4 rounded-2xl font-bold transition shadow-lg flex items-center justify-center gap-3"
              >
                <FontAwesomeIcon icon={faBookmark} />
                Ajouter à mes favoris
              </button>
            </div>

            {/* Info Message */}
            {book.availableCopies === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <p className="text-sm font-bold text-yellow-800">
                  📦 Ce livre est actuellement indisponible. Vous pouvez l'ajouter à votre liste d'attente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section complémentaire - Livres similaires (optionnel) */}
        {book.category && (
          <div className="mt-16 pt-16 border-t-2 border-gray-200">
            <h3 className="text-2xl font-black text-slate-800 mb-8">Autres livres de la catégorie "{book.category}"</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Placeholder pour livres similaires */}
              <div className="bg-gray-100 h-64 rounded-2xl animate-pulse"></div>
              <div className="bg-gray-100 h-64 rounded-2xl animate-pulse"></div>
              <div className="bg-gray-100 h-64 rounded-2xl animate-pulse"></div>
              <div className="bg-gray-100 h-64 rounded-2xl animate-pulse"></div>
              <div className="bg-gray-100 h-64 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
