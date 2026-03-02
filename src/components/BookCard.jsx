import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, faLock, faSignInAlt, faTimes, 
  faCheckCircle, faBook, faStar, faShoppingCart
} from '@fortawesome/free-solid-svg-icons';

/**
 * BookCard - Composant moderne pour afficher un livre
 */
export default function BookCard({ book, isLoggedIn, onBorrow, userId }) {
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const title = book.title || 'Titre inconnu';
  const author = book.author || 'Auteur inconnu';
  const description = book.description || 'Pas de description disponible.';
  const coverUrl = book.coverImageUrl || book.coverUrl || 'https://placehold.co/300x450?text=Livre&bg=e5e7eb&textColor=666';
  const category = book.category || 'Général';
  const rating = book.rating || null;
  const pages = book.pages || null;
  const isbn = book.isbn || null;
  const availableCopies = book.availableCopies ?? book.totalCopies ?? 0;
  const bookId = book.id;

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleBorrow = async () => {
    if (!userId || !bookId) return;
    
    setIsLoading(true);
    setError('');
    
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

      setShowNotification(true);
      setShowModal(false);
      
      if (onBorrow) {
        onBorrow(book);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Notification de succès */}
      {showNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] animate-slide-down">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center gap-4 border border-emerald-400/30 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
            </div>
            <p className="font-black text-sm uppercase tracking-widest">
              Livre emprunté ! 14 jours.
            </p>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-scale">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-600 w-10 h-10 rounded-full flex items-center justify-center transition duration-200 z-10"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8">
              {/* Image */}
              <div className="flex flex-col gap-4">
                <img 
                  src={coverUrl} 
                  alt={title} 
                  className="w-full rounded-2xl shadow-xl object-cover aspect-[3/4] hover-lift"
                  onError={(e) => { e.target.src = 'https://placehold.co/300x450?text=Livre&bg=e5e7eb&textColor=666'; }}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Disponibilité</p>
                    <div className={`px-4 py-3 rounded-xl text-center font-black text-white ${availableCopies > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}>
                      {availableCopies > 0 ? `${availableCopies} copie${availableCopies > 1 ? 's' : ''} libre${availableCopies > 1 ? 's' : ''}` : 'Épuisé'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider mb-3">
                      {category}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">{title}</h2>
                    <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      {author}
                    </p>
                  </div>

                  {rating && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FontAwesomeIcon 
                            key={i}
                            icon={faStar} 
                            className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-slate-600">{rating.toFixed(1)}/5</span>
                    </div>
                  )}

                  <div className="py-4 border-t border-b border-slate-200 space-y-2">
                    {pages && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-semibold">Pages :</span>
                        <span className="font-bold text-slate-900">{pages}</span>
                      </div>
                    )}
                    {isbn && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-semibold">ISBN :</span>
                        <span className="font-mono font-bold text-slate-900">{isbn}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                  {!isLoggedIn ? (
                    <Link 
                      to="/login" 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-2xl font-black text-center transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                      <FontAwesomeIcon icon={faSignInAlt} /> Se connecter
                    </Link>
                  ) : availableCopies > 0 ? (
                    <button 
                      onClick={handleBorrow}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-slate-400 disabled:to-slate-500 text-white py-3 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:shadow-none active:scale-95"
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      {isLoading ? 'Emprunt...' : 'Emprunter'}
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 rounded-2xl font-black cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faLock} /> Indisponible
                    </button>
                  )}
                </div>

                {error && (
                  <div className="text-red-600 text-sm font-bold text-center mt-3 p-3 bg-red-50 rounded-xl">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carte Livre */}
      <div className="h-full">
        <div className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden flex flex-col group relative h-full hover:border-blue-200 hover-lift">
          
          {/* Overlay pour utilisateurs non connectés */}
          {!isLoggedIn && (
            <div className="absolute inset-0 z-20 bg-slate-900/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center rounded-3xl">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/50">
                <FontAwesomeIcon icon={faLock} size="lg" />
              </div>
              <p className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Connectez-vous</p>
              <Link to="/login" className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shadow-lg">
                <FontAwesomeIcon icon={faSignInAlt} /> Login
              </Link>
            </div>
          )}

          {/* Image Container */}
          <div className="relative h-72 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            <img 
              src={coverUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => { e.target.src = 'https://placehold.co/300x450?text=Livre&bg=e5e7eb&textColor=666'; }}
            />
            
            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {availableCopies > 0 && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[8px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/50 backdrop-blur-sm">
                  {availableCopies} libre
                </div>
              )}
              {availableCopies <= 0 && (
                <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[8px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg shadow-red-500/50 backdrop-blur-sm">
                  Épuisé
                </div>
              )}
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Contenu */}
          <div className="p-5 flex flex-col flex-1">
            <div className="inline-block w-fit px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-wider mb-2">
              {category}
            </div>
            
            <h3 className="font-black text-slate-800 text-base line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-3 truncate">{author}</p>
            
            {rating && (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i}
                      icon={faStar} 
                      className={`text-xs ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-600">{rating.toFixed(1)}</span>
              </div>
            )}
            
            <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1">{description}</p>
            
            {/* Buttons */}
            <div className="flex gap-2 relative z-10">
              <button 
                onClick={() => setShowModal(true)} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1"
              >
                <FontAwesomeIcon icon={faInfoCircle} /> Détails
              </button>
              {isLoggedIn && availableCopies > 0 && (
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white w-11 h-11 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center active:scale-95"
                  title="Emprunter"
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DÉTAIL DU LIVRE */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 hover:text-red-600 z-20 transition">
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <div className="md:w-5/12 bg-slate-100 p-12 flex items-center justify-center">
              <img 
                src={coverUrl} 
                className="w-full max-w-[250px] rounded-2xl shadow-2xl" 
                alt={title}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=Livre'; }}
              />
            </div>

            <div className="md:w-7/12 p-12 overflow-y-auto">
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">{category}</span>
              <h2 className="text-4xl font-black text-slate-900 leading-tight my-4 italic uppercase">{title}</h2>
              <p className="text-blue-600 font-black text-xl mb-4">{author}</p>

              {/* Métadonnées */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                {rating && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-xl">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span className="font-bold text-yellow-700">{rating}/5</span>
                  </div>
                )}
                {pages && (
                  <div className="bg-slate-100 px-3 py-1 rounded-xl font-bold text-slate-600">
                    {pages} pages
                  </div>
                )}
                {isbn && (
                  <div className="bg-slate-100 px-3 py-1 rounded-xl font-mono text-slate-600 text-xs">
                    ISBN: {isbn}
                  </div>
                )}
                <div className={`px-3 py-1 rounded-xl font-bold ${availableCopies > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {availableCopies > 0 ? `${availableCopies} disponible(s)` : 'Épuisé'}
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 leading-relaxed mb-8">{description}</p>

              {/* Message d'erreur s'il existe */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-700 font-bold text-sm">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {isLoggedIn && availableCopies > 0 && (
                  <button 
                    onClick={handleBorrow}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faBook} /> {isLoading ? 'Emprunt en cours...' : 'Emprunter (14 jours)'}
                  </button>
                )}
                {!isLoggedIn && (
                  <Link 
                    to="/login" 
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-xl shadow-blue-200"
                  >
                    <FontAwesomeIcon icon={faSignInAlt} /> Se connecter pour emprunter
                  </Link>
                )}
                {availableCopies <= 0 && (
                  <div className="w-full bg-red-50 text-red-700 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                    <FontAwesomeIcon icon={faTimes} /> Ce livre n'est pas disponible
                  </div>
                )}
                {bookId && (
                  <Link 
                    to={`/book/${bookId}`} 
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition"
                    onClick={() => setShowModal(false)}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} /> Voir la fiche complète
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}