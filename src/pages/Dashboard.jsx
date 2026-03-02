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
import { getDaysRemaining } from '../utils/dateUtils';

export default function Dashboard({ user, role, refreshTrigger }) {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Identifiant unique Firebase (UID) pour les requêtes API
  const userId = user?.uid;

  // Gestion du nom d'affichage
  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || "Utilisateur";
  
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchBorrows = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/borrows/${userId}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des emprunts');
        }
        
        const data = await response.json();
        // Filtrer pour ne garder que les emprunts actifs (sans date de retour)
        const activeBorrows = (data || []).filter(b => !b.returnDate);
        setBorrows(activeBorrows);
      } catch (err) {
        console.error('Erreur Dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrows();
  }, [userId, refreshTrigger]);

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

      setBorrows(borrows.filter(b => b.id !== borrowId));
    } catch (err) {
      setError(err.message);
    }
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
            
            {/* SIDEBAR */}
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
                    {user?.email}
                  </p>
                  {role && (
                    <span className="inline-block bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6">
                      {role}
                    </span>
                  )}
                  
                  <div className="border-t border-slate-800 pt-8">
                    <p className="text-xl font-black leading-none">{borrows.length}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-widest">Emprunts actifs</p>
                  </div>
                </div>
              </div>

              <Link 
                to="/inventory"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest text-center transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="-scale-x-100" /> Catalogue
              </Link>
            </aside>

            {/* CONTENU PRINCIPAL */}
            <div className="flex-1">
              <section>
                <div className="mb-10">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">Mes emprunts</h1>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">
                    {borrows.length} livre{borrows.length > 1 ? 's' : ''} en cours de lecture
                  </p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-slate-400 font-black uppercase animate-pulse tracking-widest">Mise à jour...</div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 font-bold text-center">
                      {error}
                    </div>
                  ) : borrows.length === 0 ? (
                    <div className="text-center py-24">
                      <FontAwesomeIcon icon={faBookReader} size="4x" className="text-slate-100 mb-4" />
                      <p className="text-slate-400 font-black uppercase tracking-widest mb-6">Votre bibliothèque est vide</p>
                      <Link 
                        to="/inventory"
                        className="inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                      >
                        Trouver un livre
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {borrows.map(borrow => {
                        const days = getDaysRemaining(borrow.returnDueDate);
                        const isLate = days < 0;
                        const displayDays = isNaN(days) ? 0 : Math.abs(days);

                        return (
                          <div key={borrow.id} className={`p-6 rounded-[2.5rem] border flex gap-8 transition-all hover:shadow-xl ${isLate ? 'border-red-100 bg-red-50' : 'border-gray-50 bg-white'}`}>
                            {/* Couverture */}
                            <div className="relative shrink-0 w-24 h-36 bg-gray-100 rounded-2xl overflow-hidden shadow-md border border-gray-200">
                              <img 
                                src={borrow.book?.coverImageUrl || 'https://placehold.co/300x450?text=Livre'} 
                                className="w-full h-full object-cover" 
                                alt={borrow.book?.title} 
                                onError={(e) => { e.target.src = "https://placehold.co/300x450?text=Livre"; }}
                              />
                            </div>
                            
                            {/* Détails */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-black text-slate-800 text-xl leading-tight mb-1 line-clamp-2">{borrow.book?.title || 'Titre inconnu'}</h3>
                                <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{borrow.book?.author || 'Auteur inconnu'}</p>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className={`flex-1 p-3 rounded-2xl flex items-center gap-3 ${isLate ? 'bg-red-500 text-white' : 'bg-gray-50 text-slate-500'}`}>
                                  <FontAwesomeIcon icon={isLate ? faExclamationTriangle : faClock} />
                                  <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                                      {isLate ? "Dépassement de" : "À rendre dans"}
                                    </p>
                                    <p className="font-black text-sm uppercase">
                                      {displayDays} jour{displayDays > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleReturnBook(borrow.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
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