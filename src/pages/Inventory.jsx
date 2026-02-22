import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faThLarge, 
  faBookOpen, faTimes, faFilter, 
  faFire, faHistory, faGraduationCap, faGem, faBook, faStar
} from '@fortawesome/free-solid-svg-icons';

export default function Inventory({ isLoggedIn, addToCart }) {
  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: '', label: 'Tous les livres', icon: faThLarge },
    { id: 'Développement', label: 'Informatique', icon: faThLarge },
    { id: 'Fantasy', label: 'Fantasy', icon: faBookOpen },
    { id: 'Histoire', label: 'Histoire', icon: faHistory },
    { id: 'Sciences', label: 'Sciences', icon: faFire },
    { id: 'Classique', label: 'Classiques', icon: faStar },
    { id: 'Philosophie', label: 'Philosophie', icon: faGem }
  ];

  const fetchBooks = async (searchQuery = '', category = '') => {
    setLoading(true);
    try {
      let url = '/api/books?limit=20';
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setBooks(data.data || []);
      setTotalBooks(data.total || 0);
    } catch (error) {
      console.error("Erreur API:", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchBooks(query, selectedCategory), 400);
    return () => clearTimeout(delay);
  }, [query, selectedCategory]);

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setQuery('');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* --- SIDEBAR GAUCHE (Remplissage du vide) --- */}
        <aside className="w-full lg:w-72 shrink-0 space-y-8">
          
          {/* Section Profil Rapide (Seulement si connecté) */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Filtres Rapides</h3>
              <nav className="space-y-2">
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                      selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-gray-50'
                    }`}
                  >
                    <FontAwesomeIcon icon={cat.icon} className={selectedCategory === cat.id ? 'text-white' : 'text-blue-600'} />
                    {cat.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Section "Promotion Maisonneuve" */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <p className="font-black text-lg leading-tight mb-2 uppercase tracking-tighter italic">Spécial <br/> Étudiant</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Collège de Maisonneuve</p>
              <div className="h-1 w-12 bg-blue-600 rounded-full mb-4"></div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Utilisez votre adresse @cmaisonneuve.qc.ca pour débloquer 20% de rabais.
              </p>
            </div>
            {/* Décoration de fond */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all"></div>
          </div>

          {/* Tips / Aide */}
          <div className="px-8 py-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Conseil de lecture</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
              "Un livre est un jardin que l'on porte dans sa poche."
            </p>
          </div>
        </aside>

        {/* --- CONTENU PRINCIPAL (À DROITE) --- */}
        <div className="flex-1">
          {/* Header & Recherche */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">Inventaire</h1>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">
                {totalBooks} titre{totalBooks > 1 ? 's' : ''} disponible{totalBooks > 1 ? 's' : ''}
                {selectedCategory && ` dans ${selectedCategory}`}
              </p>
            </div>
            
            <div className="flex bg-white rounded-2xl p-2 shadow-sm border border-gray-100 items-center w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <div className="pl-4 text-slate-300">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <input 
                type="text" 
                className="flex-1 px-4 py-2 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300" 
                placeholder="Titre, auteur, ISBN..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} className="pr-4 text-slate-300 hover:text-slate-500">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>

          {/* Grille de livres */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {books.length > 0 ? (
                books.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    isLoggedIn={isLoggedIn} 
                    onAdd={() => addToCart(book)} 
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                   <FontAwesomeIcon icon={faFilter} size="3x" className="text-slate-100 mb-4" />
                   <p className="text-slate-400 font-black uppercase tracking-widest">Aucun résultat</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}