import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faMinus, faInfoCircle, faLock, faSignInAlt, faTimes, 
  faCheckCircle, faShoppingBag, faStar
} from '@fortawesome/free-solid-svg-icons';

/**
 * BookCard - Composant pour afficher un livre
 * Supporte les données provenant de Firebase (format local)
 */
export default function BookCard({ book, isLoggedIn, onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Extraction des données du livre (format Firebase)
  const title = book.title || 'Titre inconnu';
  const author = book.author || 'Auteur inconnu';
  const description = book.description || 'Pas de description disponible.';
  const coverUrl = book.coverImageUrl || book.coverUrl || 'https://via.placeholder.com/300x450?text=Livre';
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

  const handleAdd = () => {
    onAdd(book, quantity);
    setShowNotification(true);
    setShowModal(false);
    setQuantity(1);
  };

  return (
    <>
      {/* NOTIFICATION D'AJOUT */}
      {showNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-400">
            <FontAwesomeIcon icon={faCheckCircle} />
            <p className="font-black text-xs uppercase tracking-widest">
              {quantity > 1 ? `${quantity} exemplaires ajoutés` : "Ajouté au panier !"}
            </p>
          </div>
        </div>
      )}

      {/* CARTE DE LIVRE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group h-full relative">
        {!isLoggedIn && (
          <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <p className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Connectez-vous pour acheter</p>
            <Link to="/login" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
              <FontAwesomeIcon icon={faSignInAlt} /> Connexion
            </Link>
          </div>
        )}

        <div className="h-64 bg-slate-100 relative overflow-hidden">
          <img 
            src={coverUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=Livre'; }}
          />
          {/* Badge disponibilité */}
          {availableCopies > 0 && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
              {availableCopies} dispo
            </div>
          )}
          {availableCopies <= 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
              Épuisé
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-black text-slate-800 text-lg line-clamp-1 mb-1">{title}</h3>
          <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">{author}</p>
          
          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1 mb-3">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm" />
              <span className="text-sm font-bold text-slate-600">{rating}/5</span>
            </div>
          )}
          
          <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">{description}</p>
          
          <div className="flex gap-2 relative z-10">
            <button 
              onClick={() => setShowModal(true)} 
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition"
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" /> Détails
            </button>
            {isLoggedIn && availableCopies > 0 && (
              <button 
                onClick={() => setShowModal(true)}
                className="bg-emerald-500 text-white w-12 h-12 rounded-2xl hover:bg-emerald-600 transition shadow-lg"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            )}
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

              {/* SÉLECTEUR DE QUANTITÉ */}
              {isLoggedIn && availableCopies > 0 && (
                <div className="bg-gray-50 p-6 rounded-[2.5rem] mb-8 border border-gray-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Quantité souhaitée</p>
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 text-slate-400 hover:text-red-500 transition"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="text-3xl font-black text-slate-900 w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(availableCopies, quantity + 1))}
                      className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 text-slate-400 hover:text-blue-600 transition"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {isLoggedIn && availableCopies > 0 && (
                  <button 
                    onClick={handleAdd} 
                    className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition flex items-center justify-center gap-3 shadow-xl shadow-emerald-100"
                  >
                    <FontAwesomeIcon icon={faShoppingBag} /> Ajouter au panier
                  </button>
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