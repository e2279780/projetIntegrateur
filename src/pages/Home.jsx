import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faStar, faFire, faBook, faTimes, 
  faArrowRight, faCompass, faQuoteLeft
} from '@fortawesome/free-solid-svg-icons';

export default function Home({ isLoggedIn, userId, onBorrow }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Récupérer toutes les catégories uniques au démarrage
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const res = await fetch('/api/books?limit=1000');
        if (!res.ok) throw new Error('Erreur lors de la récupération des livres');
        
        const data = await res.json();
        const books = data.data || [];
        
        // Extraire les catégories uniques
        const uniqueCats = [...new Set(books
          .map(b => b.category)
          .filter(c => c && c.trim() !== '')
        )].sort();
        
        // Ajouter "Tous les livres" au début
        setCategories([
          { name: 'Tous les livres', id: '' },
          ...uniqueCats.map(cat => ({ name: cat, id: cat }))
        ]);
      } catch (err) {
        console.error('Erreur lors de la récupération des catégories:', err);
        setCategories([{ name: 'Tous les livres', id: '' }]);
      }
    };

    fetchAllCategories();
  }, []);

  const fetchBooks = async (searchQuery = '', categoryFilter = '') => {
    setLoading(true);
    try {
      let url = '/api/books?limit=8';
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Erreur HTTP ${res.status}:`, errorText);
        throw new Error(`Erreur serveur: ${res.status}`);
      }
      
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

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Tous les livres': faCompass,
      'Développement': faFire,
      'Fantasy': faStar,
      'Classique': faBook,
      'Classiques': faBook,
      'Histoire': faBook,
      'Philosophie': faBook,
      'Science-fiction': faFire,
    };
    return iconMap[categoryName] || faBook;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR GAUCHE --- */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Menu Catégories Moderne */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 backdrop-blur-sm sticky top-28">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faCompass} /> Découvrir
              </h3>
              <nav className="space-y-2">
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                      category === cat.id 
                        ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30' 
                        : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={getCategoryIcon(cat.name)} className="text-lg" />
                    {cat.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Promo Widget */}
            <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-xl group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 opacity-90"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10 space-y-3">
                <FontAwesomeIcon icon={faStar} className="text-3xl opacity-80 animate-float" />
                <h4 className="font-black text-xl leading-tight">Accès Étudiant</h4>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Maisonneuve</p>
                <p className="text-xs text-white/90 font-medium leading-relaxed">
                  Connecte-toi pour sauvegarder tes favoris et accéder à des contenus exclusifs.
                </p>
              </div>
            </div>

            {/* Citation du jour */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-8 text-white shadow-lg border border-white/10">
              <FontAwesomeIcon icon={faQuoteLeft} className="text-cyan-400 text-2xl mb-3 opacity-80" />
              <p className="text-sm font-semibold leading-relaxed italic text-slate-100">
                "La lecture est une amitié."
              </p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">— Marcel Proust</p>
            </div>
          </aside>

          {/* --- CONTENU PRINCIPAL --- */}
          <div className="flex-1 space-y-12 animate-slide-up">
            
            {/* Hero Section Moderne */}
            <section className="relative overflow-hidden rounded-3xl border border-white/50 backdrop-blur-sm shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/80 to-slate-900/90"></div>
              
              {/* Effets d'arrière-plan */}
              <div className="absolute top-0 -right-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 px-8 sm:px-12 py-16 sm:py-20 max-w-3xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/20">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
                  </span>
                  Nouveautés 2026
                </div>

                {/* Titre */}
                <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                  Trouvez votre <br/>
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent animate-gradient-shift">
                    prochain coup de cœur
                  </span>
                </h1>

                {/* Description */}
                <p className="text-white/90 text-lg font-semibold mb-8 leading-relaxed max-w-xl">
                  Explorez notre collection de milliers de livres et trouvez l'histoire parfaite pour votre prochaine lecture.
                </p>
              </div>
            </section>

            {/* Barre de recherche */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center px-6 h-16">
                  <FontAwesomeIcon icon={faSearch} className="text-blue-600 text-xl" />
                  <input 
                    type="text" 
                    className="flex-1 px-6 py-4 bg-transparent outline-none font-semibold text-slate-800 placeholder-slate-400" 
                    placeholder="Rechercher par titre, auteur ou catégorie..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} 
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section de livres */}
            <section className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-2">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon 
                      icon={search ? faSearch : category === 'Développement' ? faFire : faFire} 
                      className="text-blue-600 text-2xl"
                    />
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                      {search ? `Résultats` : category ? category : "À la une"}
                    </h2>
                  </div>
                  <div className="h-1.5 w-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
                </div>
                <a 
                  href="/inventory" 
                  className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all duration-300 group hover:text-blue-700"
                >
                  Voir tout <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Grille de livres */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute inset-2 border-3 border-transparent border-t-blue-600 border-r-cyan-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-6 text-slate-500 font-semibold">Chargement des livres...</p>
                </div>
              ) : (
                <>
                  {books.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in-scale">
                      {books.map(b => (
                        <BookCard key={b.id} book={b} isLoggedIn={isLoggedIn} userId={userId} onBorrow={onBorrow} />
                      ))}
                    </div>
                  ) : (
                    <div className="col-span-full py-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-dashed border-blue-200 flex flex-col items-center text-slate-400">
                      <FontAwesomeIcon icon={faBook} size="3x" className="mb-4 text-blue-300" />
                      <p className="font-black uppercase tracking-widest text-sm">Aucun ouvrage trouvé</p>
                      <p className="text-xs mt-2 text-slate-400">Essayez une autre recherche</p>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}