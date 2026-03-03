import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBook, faCheckCircle, faSignInAlt, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import ElegantCarousel from '../components/ElegantCarousel';
import { databaseService } from '../services';
import { useCart } from '../context/useCart';
import Loading from '../components/Loading';

/**
 * BookDetail - Page de détail d'un livre avec carousel elegant
 * Permet à l'utilisateur d'emprunter le livre et voir les livres similaires
 */
export default function BookDetail({ isLoggedIn, userId, onBorrow }) {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [hasOutstandingCharges, setHasOutstandingCharges] = useState(false);

  useEffect(() => {
    const loadBookData = async () => {
      setLoading(true);
      try {
        if (bookId) {
          // 1. Charger le livre principal
          const bookData = await databaseService.getBookById(bookId);
          setBook(bookData);

          // 2. Charger les livres de la même catégorie
          if (bookData && bookData.category) {
            const allBooks = await databaseService.getAllBooks();
            // On filtre : même catégorie, on exclut le livre actuel, limite à 5
            const filtered = allBooks
              .filter(b => b.category === bookData.category && b.id !== bookId)
              .slice(0, 5);
            setSimilarBooks(filtered);
          }

          // 3. Vérifier les frais de retard si l'utilisateur est connecté
          if (isLoggedIn && userId) {
            try {
              const chargesData = await databaseService.checkUserOutstandingCharges(userId);
              setHasOutstandingCharges(chargesData.hasOutstandingCharges);
            } catch (chargesErr) {
              console.error('Erreur lors de la vérification des frais:', chargesErr);
            }
          }
        }
      } catch (err) {
        setError('Impossible de charger les données: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookData();
  }, [bookId, isLoggedIn, userId]);

  const handleBorrow = async () => {
    if (!userId || !bookId || !isLoggedIn) return;
    
    // Vérifier s'il y a des frais en attente
    if (hasOutstandingCharges) {
      setError('Vous avez des frais de retard à régler. Vous ne pouvez pas emprunter d\'autres livres tant que vous ne les aurez pas payés.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/borrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookId, daysToKeep: 14 })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'emprunt');
      }

      setBorrowSuccess(true);
      
      if (onBorrow) {
        onBorrow(book);
      }

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = async () => {
    addToCart(book);
    setError(`${book.title} a été ajouté au panier!`);
  };

  const availableCopies = book?.availableCopies ?? book?.totalCopies ?? 0;

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

  const carouselData = [
    {
      isbn: book.isbn || 'N/A',
      title: book.title,
      author: book.author,
      imageUrl: book.coverImageUrl || 'https://placehold.co/400x600?text=Pas+d%27image',
      description: book.description,
      pages: book.pages,
      rating: book.rating,
    },
    ...(book.author ? [{
      isbn: book.isbn || 'N/A',
      title: `À propos de l'auteur`,
      author: book.author,
      imageUrl: book.coverImageUrl || 'https://placehold.co/400x600?text=Auteur',
      description: `${book.author} est l'auteur de "${book.title}". Catégorie: ${book.category || 'Non spécifiée'}`,
      pages: book.pages,
      rating: book.rating,
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ElegantCarousel data={carouselData} />
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 line-clamp-2">{book.title}</h2>
                <p className="text-lg font-bold text-blue-600">{book.author}</p>
              </div>

              <div className="h-px bg-gray-200"></div>

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
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Prix</span>
                  <span className="text-lg font-black text-purple-600">${(book.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Disponibilité</span>
                  <span className={`text-sm font-black ${availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {availableCopies > 0 ? `${availableCopies} disponible(s)` : 'Indisponible'}
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              {book.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-6">{book.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {borrowSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />
                  <span className="font-bold">Achat effectué ! Redirection...</span>
                </div>
              )}

              {!isLoggedIn && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-lg transition flex items-center justify-center gap-3 hover:bg-slate-700"
                >
                  <FontAwesomeIcon icon={faSignInAlt} />
                  Se connecter
                </button>
              )}

              {isLoggedIn && !borrowSuccess && (
                <>
                  {availableCopies > 0 ? (
                    <button
                      onClick={handleBorrow}
                      disabled={isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg transition transform active:scale-95 shadow-xl shadow-emerald-200 flex items-center justify-center gap-3"
                    >
                      <FontAwesomeIcon icon={faBook} />
                      {isLoading ? 'Emprunt en cours...' : 'Emprunter (14 jours)'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-500 text-white py-4 rounded-2xl font-black text-lg cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      Non disponible à l'emprunt
                    </button>
                  )}

                  <button
                    onClick={handlePurchaseClick}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg transition transform active:scale-95 shadow-xl shadow-purple-200 flex items-center justify-center gap-3"
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    {isLoading ? 'Ajout...' : `Acheter ($${(book.price || 0).toFixed(2)})`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION DYNAMIQUE : AUTRES LIVRES DE LA MÊME CATÉGORIE */}
        {book.category && (
          <div className="mt-16 pt-16 border-t-2 border-gray-200">
            <h3 className="text-2xl font-black text-slate-800 mb-8">
              Autres livres de la catégorie "{book.category}"
            </h3>
            
            {similarBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {similarBooks.map((sBook) => (
                  <div 
                    key={sBook.id} 
                    onClick={() => {
                      navigate(`/book/${sBook.id}`);
                      window.scrollTo(0, 0); // Remonter en haut au clic
                    }}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <img 
                        src={sBook.coverImageUrl || 'https://placehold.co/300x450?text=Livre'} 
                        alt={sBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="mt-4 font-black text-slate-800 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {sBook.title}
                    </h4>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{sBook.author}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-gray-100 h-64 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}