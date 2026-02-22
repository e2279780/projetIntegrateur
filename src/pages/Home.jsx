import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faStar, faFire, faBook, faTimes, 
  faArrowRight, faGraduationCap, faCompass, faQuoteLeft
} from '@fortawesome/free-solid-svg-icons';

export default function Home({ isLoggedIn, addToCart }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  // Charger les livres depuis l'API locale (Firebase)
  const fetchBooks = async (searchQuery = '', categoryFilter = '') => {
    setLoading(true);
    try {
      let url = '/api/books?limit=8';
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setBooks(data.data || []);
    } catch (err) {
      console.error("Erreur API:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchBooks(search, category), 400);
    return () => clearTimeout(delay);
  }, [search, category]);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setSearch('');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* --- SIDEBAR GAUCHE --- */}
        <aside className="w-full lg:w-72 shrink-0 space-y-8 sticky top-28 h-fit">
          
          {/* Menu de Navigation Interne */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Découvrir</h3>
            <nav className="space-y-2">
              <button onClick={() => handleCategoryClick('')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${!category ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-gray-50'}`}>
                <FontAwesomeIcon icon={faCompass} /> Tous les livres
              </button>
              <button onClick={() => handleCategoryClick('Développement')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${category === 'Développement' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-gray-50'}`}>
                <FontAwesomeIcon icon={faFire} /> Développement
              </button>
              <button onClick={() => handleCategoryClick('Fantasy')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${category === 'Fantasy' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-gray-50'}`}>
                <FontAwesomeIcon icon={faStar} /> Fantasy
              </button>
              <button onClick={() => handleCategoryClick('Classique')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${category === 'Classique' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-gray-50'}`}>
                <FontAwesomeIcon icon={faBook} /> Classiques
              </button>
            </nav>
          </div>

          {/* Widget Promo Maisonneuve */}
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
            <div className="relative z-10">
              <FontAwesomeIcon icon={faGraduationCap} className="text-3xl mb-4 opacity-50" />
              <h4 className="font-black text-lg leading-tight mb-2 uppercase italic">Accès <br/> Étudiant</h4>
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-4">Maisonneuve</p>
              <p className="text-xs text-blue-50 font-medium leading-relaxed">
                Connecte-toi pour sauvegarder tes favoris.
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          </div>

          {/* Citation du jour */}
          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
            <FontAwesomeIcon icon={faQuoteLeft} className="text-blue-500 mb-4" />
            <p className="text-sm font-medium leading-relaxed italic text-slate-300">
              "La lecture est une amitié."
            </p>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500">— Marcel Proust</p>
          </div>
        </aside>

        {/* --- CONTENU PRINCIPAL --- */}
        <div className="flex-1 space-y-12">
          
          {/* Hero Section Adaptée */}
          <section className="relative bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-sm overflow-hidden min-h-[400px] flex items-center">
            <div className="relative z-10 max-w-2xl">
              <div className="bg-blue-600/10 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Bibliothèque Virtuelle 2026
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter italic">
                Trouvez votre <br/> prochain <span className="text-blue-600">coup de cœur.</span>
              </h1>
              
              {/* Barre de recherche style Inventory */}
              <div className="flex bg-gray-50 rounded-2xl p-1.5 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-500 transition-all max-w-lg shadow-inner">
                <div className="pl-4 flex items-center text-slate-400">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
                <input 
                  type="text" 
                  className="flex-1 px-4 py-4 bg-transparent outline-none font-bold text-slate-800" 
                  placeholder="Rechercher par titre ou auteur..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)} 
                />
                {search && (
                  <button onClick={() => setSearch('')} className="pr-4 text-slate-300 hover:text-slate-500">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Décoration abstraite */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 -skew-x-12 translate-x-12"></div>
          </section>

          {/* Grille de livres */}
          <section>
            <div className="flex justify-between items-center mb-10 px-2">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
                  {search ? `Résultats : ${search}` : category ? category : "Sélection du moment"}
                </h2>
                <div className="h-1.5 w-12 bg-blue-600 rounded-full mt-2"></div>
              </div>
              <a href="/inventory" className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all group">
                Tout explorer <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1" />
              </a>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center py-32 text-blue-600">
                <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                {books.length > 0 ? (
                  books.map(b => (
                    <BookCard key={b.id} book={b} isLoggedIn={isLoggedIn} onAdd={() => addToCart(b)} />
                  ))
                ) : (
                  <div className="col-span-full py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center text-gray-400">
                    <FontAwesomeIcon icon={faBook} size="3x" className="mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Aucun ouvrage trouvé</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}