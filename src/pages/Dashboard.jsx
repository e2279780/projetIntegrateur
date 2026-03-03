import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBookReader, 
  faClock, 
  faExclamationTriangle, 
  faCheckCircle, 
  faBook,
  faShoppingCart,
  faShoppingBag,
  faCalendar,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { getDaysRemaining } from '../utils/dateUtils';
import { databaseService } from '../services';

export default function Dashboard({ user, role, refreshTrigger }) {
  const [borrows, setBorrows] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('borrows');

  const userId = user?.uid;

  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || "Utilisateur";
  
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        // Récupérer les emprunts
        const borrowResponse = await fetch(`/api/borrows/${userId}`);
        if (!borrowResponse.ok) {
          throw new Error('Erreur lors de la récupération des emprunts');
        }
        const borrowData = await borrowResponse.json();
        const activeBorrows = (borrowData || []).filter(b => !b.returnDate);
        setBorrows(activeBorrows);

        // Récupérer les achats
        try {
          const purchasesData = await databaseService.getUserPurchases(userId);
          setPurchases(purchasesData || []);
        } catch (purchaseErr) {
          console.error('Erreur lors de la récupération des achats:', purchaseErr);
          setPurchases([]);
        }
      } catch (err) {
        console.error('Erreur Dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const overdueCount = borrows.filter(b => getDaysRemaining(b.returnDueDate) < 0).length;
  const dueCount = borrows.filter(b => getDaysRemaining(b.returnDueDate) >= 0 && getDaysRemaining(b.returnDueDate) <= 3).length;

  return (
    <>
      {!user ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 border-3 border-transparent border-t-blue-600 border-r-cyan-500 rounded-full animate-spin"></div>
            </div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Chargement du dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="max-w-[1600px] mx-auto px-6 py-10 animate-slide-up">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* --- SIDEBAR --- */}
              <aside className="w-full lg:w-96 shrink-0 space-y-6">
                
                {/* Profil Card */}
                <div className="relative overflow-hidden rounded-3xl shadow-xl border border-white/50 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 opacity-95"></div>
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10 p-8 text-white text-center space-y-6">
                    {/* Avatar */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-75"></div>
                        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl w-24 h-24 flex items-center justify-center text-5xl font-black shadow-xl">
                          {initial}
                        </div>
                      </div>
                    </div>

                    {/* Infos */}
                    <div>
                      <h2 className="text-3xl font-black italic tracking-tighter leading-tight">
                        {displayName}
                      </h2>
                      <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-2 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Role Badge */}
                    {role && (
                      <div className="inline-block bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/30">
                        📚 {role}
                      </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <p className="text-3xl font-black">{borrows.length}</p>
                        <p className="text-[8px] font-bold text-blue-100 uppercase tracking-widest mt-2">Emprunts</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <p className="text-3xl font-black">{purchases.length}</p>
                        <p className="text-[8px] font-bold text-blue-100 uppercase tracking-widest mt-2">Achats</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link 
                  to="/inventory"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBook} /> Découvrir plus
                </Link>

                {/* Quick Stats */}
                {(borrows.length > 0 || purchases.length > 0) && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Statistiques</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg group hover:bg-blue-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faBook} className="text-blue-600 text-lg" />
                          <span className="font-bold text-sm text-slate-700">Emprunts</span>
                        </div>
                        <span className="font-black text-blue-600">{borrows.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg group hover:bg-purple-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faShoppingCart} className="text-purple-600 text-lg" />
                          <span className="font-bold text-sm text-slate-700">Achats</span>
                        </div>
                        <span className="font-black text-purple-600">{purchases.length}</span>
                      </div>
                      {dueCount > 0 && (
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg group hover:bg-orange-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-orange-600 text-lg" />
                            <span className="font-bold text-sm text-slate-700">À rendre bientôt</span>
                          </div>
                          <span className="font-black text-orange-600">{dueCount}</span>
                        </div>
                      )}
                      {overdueCount > 0 && (
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg group hover:bg-red-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-lg" />
                            <span className="font-bold text-sm text-slate-700">En retard</span>
                          </div>
                          <span className="font-black text-red-600">{overdueCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </aside>

              {/* --- CONTENU PRINCIPAL --- */}
              <div className="flex-1 space-y-8">
                {/* Onglets */}
                <div className="flex gap-4 border-b-2 border-gray-200">
                  <button
                    onClick={() => setActiveTab('borrows')}
                    className={`px-6 py-4 font-black text-sm uppercase tracking-widest transition-all ${
                      activeTab === 'borrows'
                        ? 'text-blue-600 border-b-4 border-blue-600 -mb-[2px]'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={faBookReader} className="mr-2" />
                    Emprunts ({borrows.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className={`px-6 py-4 font-black text-sm uppercase tracking-widest transition-all ${
                      activeTab === 'purchases'
                        ? 'text-purple-600 border-b-4 border-purple-600 -mb-[2px]'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                    Achats ({purchases.length})
                  </button>
                </div>

                {/* Header - Emprunts */}
                {activeTab === 'borrows' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faBookReader} className="text-white" />
                      </div>
                      <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mes emprunts</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                      {borrows.length} livre{borrows.length > 1 ? 's' : ''} en cours de lecture
                    </p>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
                  </div>
                )}

                {/* Header - Achats */}
                {activeTab === 'purchases' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-white" />
                      </div>
                      <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mes achats</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                      {purchases.length} livre{purchases.length > 1 ? 's' : ''} acheté{purchases.length > 1 ? 's' : ''}
                    </p>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></div>
                  </div>
                )}

                {/* Emprunts Section */}
                {activeTab === 'borrows' && loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 border-3 border-transparent border-t-blue-600 border-r-cyan-500 rounded-full animate-spin"></div>
                      </div>
                      <p className="font-black text-slate-400 uppercase tracking-widest">Mise à jour...</p>
                    </div>
                  </div>
                ) : activeTab === 'borrows' && error ? (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 text-red-700 font-bold text-center shadow-sm">
                    {error}
                  </div>
                ) : activeTab === 'borrows' && borrows.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center space-y-6 hover-lift">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faBook} size="2x" className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-sm mb-2">Votre bibliothèque est vide</p>
                      <p className="text-slate-500 text-sm">Commencez par emprunter un livre dans notre catalogue</p>
                    </div>
                    <Link 
                      to="/inventory"
                      className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg shadow-blue-500/30"
                    >
                      <FontAwesomeIcon icon={faBook} className="mr-2" /> Découvrir le catalogue
                    </Link>
                  </div>
                ) : activeTab === 'borrows' ? (
                  <div className="space-y-4">
                    {borrows.map(borrow => {
                      const days = getDaysRemaining(borrow.returnDueDate);
                      const isLate = days < 0;
                      const displayDays = isNaN(days) ? 0 : Math.abs(days);
                      const isUrgent = days >= 0 && days <= 3;

                      return (
                        <div 
                          key={borrow.id} 
                          className={`relative overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300 hover-lift ${
                            isLate 
                              ? 'border-red-200 bg-gradient-to-r from-red-50/80 to-rose-50/80' 
                              : isUrgent
                              ? 'border-orange-200 bg-gradient-to-r from-orange-50/80 to-yellow-50/80'
                              : 'border-blue-200 bg-gradient-to-r from-white to-blue-50/50'
                          }`}
                        >
                          {/* Accent bar gauche */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            isLate ? 'bg-gradient-to-b from-red-500 to-rose-500' : 
                            isUrgent ? 'bg-gradient-to-b from-orange-500 to-yellow-500' :
                            'bg-gradient-to-b from-blue-500 to-cyan-500'
                          }`}></div>

                          <div className="p-6 flex flex-col sm:flex-row gap-6">
                            {/* Couverture */}
                            <div className="relative shrink-0 w-full sm:w-28 h-40 sm:h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl overflow-hidden shadow-md border border-white/50 hover-lift">
                              <img 
                                src={borrow.book?.coverImageUrl || 'https://placehold.co/300x450?text=Livre'} 
                                className="w-full h-full object-cover" 
                                alt={borrow.book?.title}
                                onError={(e) => { e.target.src = "https://placehold.co/300x450?text=Livre"; }}
                              />
                            </div>
                            
                            {/* Contenu */}
                            <div className="flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <h3 className="font-black text-slate-900 text-xl leading-tight line-clamp-2">{borrow.book?.title || 'Titre inconnu'}</h3>
                                <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">{borrow.book?.author || 'Auteur inconnu'}</p>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Status Card */}
                                <div className={`flex-1 p-4 rounded-2xl flex items-center gap-3 transition-all ${
                                  isLate 
                                    ? 'bg-red-500/20 border border-red-300/50' 
                                    : isUrgent
                                    ? 'bg-orange-500/20 border border-orange-300/50'
                                    : 'bg-blue-500/10 border border-blue-300/30'
                                }`}>
                                  <div className={`p-2 rounded-full ${
                                    isLate ? 'bg-red-500/30' : isUrgent ? 'bg-orange-500/30' : 'bg-blue-500/30'
                                  }`}>
                                    <FontAwesomeIcon 
                                      icon={isLate ? faExclamationTriangle : faClock}
                                      className={isLate ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-blue-600'}
                                    />
                                  </div>
                                  <div>
                                    <p className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1 ${
                                      isLate ? 'text-red-700' : isUrgent ? 'text-orange-700' : 'text-slate-600'
                                    }`}>
                                      {isLate ? "En retard de" : "À rendre dans"}
                                    </p>
                                    <p className={`font-black text-lg ${
                                      isLate ? 'text-red-700' : isUrgent ? 'text-orange-700' : 'text-slate-900'
                                    }`}>
                                      {displayDays} jour{displayDays > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>

                                {/* Return Button */}
                                <button
                                  onClick={() => handleReturnBook(borrow.id)}
                                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2"
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} /> Retourner
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Achats Section */}
                {activeTab === 'purchases' && purchases.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center space-y-6 hover-lift">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-sm mb-2">Aucun achat effectué</p>
                      <p className="text-slate-500 text-sm">Commencez par acheter un livre dans notre catalogue</p>
                    </div>
                    <Link 
                      to="/inventory"
                      className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg shadow-purple-500/30"
                    >
                      <FontAwesomeIcon icon={faShoppingBag} className="mr-2" /> Découvrir le catalogue
                    </Link>
                  </div>
                ) : activeTab === 'purchases' ? (
                  <div className="space-y-4">
                    {purchases.map(purchase => (
                      <div 
                        key={purchase.id} 
                        className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-r from-white to-purple-50/50 backdrop-blur-sm transition-all duration-300 hover-lift"
                      >
                        {/* Accent bar gauche */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500"></div>

                        <div className="p-6 flex flex-col sm:flex-row gap-6">
                          {/* Couverture */}
                          <div className="relative shrink-0 w-full sm:w-28 h-40 sm:h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl overflow-hidden shadow-md border border-white/50 hover-lift">
                            <img 
                              src={purchase.bookCoverUrl || 'https://placehold.co/300x450?text=Livre'} 
                              className="w-full h-full object-cover" 
                              alt={purchase.bookTitle}
                              onError={(e) => { e.target.src = "https://placehold.co/300x450?text=Livre"; }}
                            />
                          </div>
                          
                          {/* Contenu */}
                          <div className="flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <h3 className="font-black text-slate-900 text-xl leading-tight line-clamp-2">{purchase.bookTitle}</h3>
                              <p className="text-purple-600 font-bold text-xs uppercase tracking-widest">{purchase.bookAuthor}</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              {/* Info Card */}
                              <div className="flex-1 p-4 rounded-2xl flex items-center gap-3 bg-purple-500/10 border border-purple-300/30">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faDollarSign} className="text-purple-600 text-sm" />
                                    <p className="font-black text-slate-900">${purchase.bookPrice}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <FontAwesomeIcon icon={faCalendar} className="text-purple-600" />
                                    <p className="text-slate-600">{new Date(purchase.purchaseDate).toLocaleDateString('fr-FR')}</p>
                                  </div>
                                </div>
                                <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xs rounded-full">
                                  Acheté
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
