import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBookReader, 
  faClock, 
  faExclamationTriangle, 
  faCheckCircle, 
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

export default function Dashboard({ user, role, refreshTrigger }) {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Construire le nom d'affichage à partir des données Firebase
  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || "Utilisateur";
  
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchBorrows = async () => {
      // Sécurité : empêche le fetch si user est null
      if (!user?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const userId = user.email;
        const response = await fetch(`/api/borrows/${userId}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des emprunts');
        }
        
        const data = await response.json();
        setBorrows(data || []);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrows();
  }, [user?.email, refreshTrigger]);

  const handleReturnBook = async (borrowId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retourner ce livre ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/borrows/${borrowId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du retour');
      }

      // Rafraîchir la liste
      setBorrows(borrows.filter(b => b.id !== borrowId));
    } catch (err) {
      setError(err.message);
    }
  };

  const getDaysRemaining = (dateObj) => {
    let date;
    if (dateObj instanceof Date) {
      date = dateObj;
    } else if (dateObj?.toDate && typeof dateObj.toDate === 'function') {
      date = dateObj.toDate();
    } else if (typeof dateObj === 'string') {
      date = new Date(dateObj);
    } else {
      return 0;
    }
    
    const diff = date - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      {!user ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse font-black text-slate-300 uppercase tracking-widest">
            Chargement du dashboard...
          </div>
        </div>
      ) : (
    <div className="max-w-[1600px] mx-auto px-6 py-10 font-sans animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR GAUCHE */}
        <aside className="w-full lg:w-80 shrink-0 space-y-8">
          <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl">
                {initial}
              </div>
              <h2 className="text-2xl font-black mb-1 italic uppercase tracking-tighter leading-none">
                {displayName}
              </h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                {user?.email || "email@example.com"}
              </p>
              {role && (
                <span className="inline-block bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6">
                  {role}
                </span>
              )}
              
              <div className="border-t border-slate-800 pt-8">
                <p className="text-xl font-black leading-none">{borrows.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-widest">Emprunts en cours</p>
              </div>
            </div>
          </div>

          <Link 
            to="/inventory"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest text-center transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="-scale-x-100" /> Emprunter un livre
          </Link>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1">
          <section>
            <div className="mb-10">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">Mes emprunts</h1>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">
                {borrows.length} livre{borrows.length > 1 ? 's' : ''} emprunté{borrows.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-slate-400 font-black uppercase animate-pulse">Chargement...</div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
                  <p className="font-bold">{error}</p>
                </div>
              ) : borrows.length === 0 ? (
                <div className="text-center py-24">
                  <FontAwesomeIcon icon={faBookReader} size="4x" className="text-slate-100 mb-4" />
                  <p className="text-slate-400 font-black uppercase tracking-widest mb-6">Aucun emprunt en cours</p>
                  <Link 
                    to="/inventory"
                    className="inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                  >
                    Commencer à emprunter
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {borrows.map(borrow => {
                    const days = getDaysRemaining(borrow.returnDueDate?.toDate?.() || borrow.returnDueDate);
                    const isLate = days < 0;
                    const bookTitle = borrow.book?.title || 'Livre inconnu';
                    const bookAuthor = borrow.book?.author || 'Auteur inconnu';
                    const bookCover = borrow.book?.coverImageUrl || 'https://placehold.co/300x450?text=Livre&bg=e5e7eb&textColor=666';

                    return (
                      <div key={borrow.id} className={`p-6 rounded-[2.5rem] border flex gap-8 group transition-all hover:shadow-xl ${isLate ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-white shadow-sm'}`}>
                        <div className="relative shrink-0 w-20 h-32 bg-gray-100 rounded-2xl overflow-hidden shadow-lg border border-gray-50">
                          <img 
                            src={bookCover} 
                            className="w-full h-full object-cover block" 
                            alt={bookTitle} 
                            onError={(e) => { e.target.src = "https://placehold.co/300x450?text=Livre&bg=e5e7eb&textColor=666"; }}
                          />
                          {isLate && (
                            <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded-lg text-[8px] font-black shadow-lg">
                              EN RETARD
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-black text-slate-800 text-lg leading-tight mb-1 line-clamp-2">{bookTitle}</h3>
                            <p className="text-blue-600 font-bold text-xs uppercase mb-4 tracking-widest">{bookAuthor}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className={`flex-1 p-3 rounded-2xl flex items-center gap-3 ${isLate ? 'bg-red-100 text-red-600' : 'bg-gray-50 text-slate-400'}`}>
                              <FontAwesomeIcon icon={isLate ? faExclamationTriangle : faClock} />
                              <div>
                                <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                                  {isLate ? "Retard de" : "Retour dans"}
                                </p>
                                <p className="font-black text-sm uppercase">
                                  {Math.abs(days)} jour{Math.abs(days) > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleReturnBook(borrow.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} /> Retourner
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
      )}
    </>
  );
}