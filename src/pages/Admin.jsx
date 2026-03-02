import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruckLoading, 
  faExclamationTriangle, 
  faPlusCircle, 
  faChartLine,
  faBell,
  faUsers,
  faCheck,
  faClock,
  faTimesCircle,
  faBook,
  faUser,
  faBarcode,
  faTag,
  faBuilding,
  faCalendar,
  faFileLines,
  faGlobe,
  faStar,
  faNoteSticky,
  faImage,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { databaseService } from '../services';
import { getDaysRemaining, formatDueDate } from '../utils/dateUtils';

export default function Admin() {
  const [inventory, setInventory] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [borrows, setBorrows] = useState([]);
  const [borrowsLoading, setBorrowsLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, borrowId: null, userId: '', userName: '', bookTitle: '', email: '' });
  const [alertMessage, setAlertMessage] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [addBookData, setAddBookData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Fiction',
    description: '',
    publisher: '',
    yearPublished: new Date().getFullYear(),
    pages: 0,
    language: 'Fr',
    rating: 0,
    totalCopies: 1,
    coverImageUrl: '',
  });
  const [addBookLoading, setAddBookLoading] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/books?page=1&limit=1000');
      const json = await res.json();
      const books = json.data || [];

      const mapped = books.map(b => ({
        id: b.id,
        title: b.title || 'Untitled',
        stock: b.availableCopies ?? b.totalCopies ?? 0,
        minStock: Math.max(1, Math.floor((b.totalCopies || 1) * 0.15)),
        provider: b.publisher || 'Inconnu',
        format: b.format || 'Physique',
      }));

      setInventory(mapped);

      const provs = Array.from(new Set(mapped.map(m => m.provider))).filter(Boolean);
      setProviders(provs);
    } catch (err) {
      console.error('Erreur fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrows = async () => {
    try {
      setBorrowsLoading(true);
      const allBorrows = await databaseService.getAllBorrows('Bibliothécaire');
      
      // Enrichir les données avec les informations utilisateur et livre
      const enrichedBorrows = await Promise.all(allBorrows.map(async (borrow) => {
        try {
          const user = await databaseService.getUserById(borrow.userId);
          const book = await databaseService.getBookById(borrow.bookId);
          
          const daysLeft = getDaysRemaining(borrow.returnDueDate);
          
          // Déterminer l'état
          let status = 'ok';
          if (borrow.returnDate) {
            status = 'returned';
          } else if (daysLeft < 0) {
            status = 'overdue';
          } else if (daysLeft <= 3) {
            status = 'soon';
          }
          
          return {
            ...borrow,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            bookTitle: book.title,
            daysLeft,
            status,
          };
        } catch (err) {
          console.error('Erreur enrichissement emprunt:', err);
          return null;
        }
      }));
      
      // Filtrer les erreurs et trier par jours restants (les plus proches d'abord)
      const validBorrows = enrichedBorrows
        .filter(b => b !== null)
        .sort((a, b) => {
          // Emprunts retournés à la fin
          if (a.returnDate && !b.returnDate) return 1;
          if (!a.returnDate && b.returnDate) return -1;
          // Trier par jours restants (les plus proches en premier)
          return a.daysLeft - b.daysLeft;
        });
      
      setBorrows(validBorrows);
    } catch (err) {
      console.error('Erreur fetch borrows:', err);
    } finally {
      setBorrowsLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!alertModal.borrowId || !alertMessage.trim()) {
      alert('Veuillez remplir le message');
      return;
    }

    try {
      // Envoyer la notification à l'utilisateur
      await databaseService.sendNotification(alertModal.userId, {
        title: `Rappel: Retour de livre - ${alertModal.bookTitle}`,
        message: alertMessage,
        type: 'alert',
        borrowId: alertModal.borrowId,
      });
      
      alert('Alerte envoyée avec succès!');
      setAlertModal({ isOpen: false, borrowId: null, userId: '', userName: '', bookTitle: '', email: '' });
      setAlertMessage('');
      
      // Marquer comme alerte envoyée dans le DB
      await databaseService.updateBorrow(alertModal.borrowId, {
        alertSent: true,
        alertSentAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'envoi de l\'alerte: ' + err.message);
    }
  };

  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    
    if (!addBookData.title.trim() || !addBookData.author.trim()) {
      alert('Le titre et l\'auteur sont obligatoires');
      return;
    }

    try {
      setAddBookLoading(true);
      
      // Ajouter le livre via API
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addBookData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'ajout du livre');
      }

      alert('Livre ajouté avec succès!');
      setShowAddBookModal(false);
      setAddBookData({
        title: '',
        author: '',
        isbn: '',
        category: 'Fiction',
        description: '',
        publisher: '',
        yearPublished: new Date().getFullYear(),
        pages: 0,
        language: 'Fr',
        rating: 0,
        totalCopies: 1,
        coverImageUrl: '',
      });
      
      // Rafraîchir l'inventaire
      await fetchInventory();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur: ' + err.message);
    } finally {
      setAddBookLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (activeTab === 'borrows') {
      fetchBorrows();
    }
  }, [activeTab]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter mb-2">Dashboard Admin</h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">Gestion de l'inventaire, emprunts & Fournisseurs</p>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-2 mb-8 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-4 font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === 'inventory'
              ? 'text-blue-600 border-b-4 border-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          Inventaire
        </button>
        <button
          onClick={() => setActiveTab('borrows')}
          className={`px-6 py-4 font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === 'borrows'
              ? 'text-blue-600 border-b-4 border-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FontAwesomeIcon icon={faUsers} className="mr-2" />
          Emprunts ({borrows.filter(b => !b.returnDate).length})
        </button>
      </div>

      {/* CONTENU INVENTAIRE */}
      {activeTab === 'inventory' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Livres</p>
              <p className="text-3xl font-black text-slate-900 italic">{inventory.length}</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertes Stock Bas</p>
              <p className="text-3xl font-black text-red-500 italic">
                {inventory.filter(item => item.stock <= item.minStock).length}
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-white">
                <FontAwesomeIcon icon={faTruckLoading} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commandes en cours</p>
              <p className="text-3xl font-black italic text-white">4</p>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-10">
            
            <div className="flex-1 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-black text-xl uppercase italic">Inventaire des Stocks</h2>
                <div className="flex items-center gap-3">
                  <button onClick={fetchInventory} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-300 transition">Actualiser</button>
                  <button 
                    onClick={() => setShowAddBookModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition"
                  >
                    <FontAwesomeIcon icon={faPlusCircle} /> Ajouter un livre
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">Livre</th>
                      <th className="px-8 py-6">Format</th>
                      <th className="px-8 py-6">Stock</th>
                      <th className="px-8 py-6">Seuil Min</th>
                      <th className="px-8 py-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-6 text-center">Chargement...</td>
                      </tr>
                    ) : (
                      inventory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-black text-slate-800">{item.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.provider}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.format}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`font-black text-lg ${item.stock <= item.minStock ? 'text-red-500' : 'text-slate-800'}`}>{item.stock}</span>
                          </td>
                          <td className="px-8 py-6 font-bold text-slate-400">{item.minStock}</td>
                          <td className="px-8 py-6">
                            <button
                              onClick={async () => {
                                const qtyStr = window.prompt('Quantité à ajouter (nombre positif)');
                                if (!qtyStr) return;
                                const qty = parseInt(qtyStr, 10);
                                if (Number.isNaN(qty) || qty <= 0) return alert('Quantité invalide');

                                try {
                                  const res = await fetch(`/api/books/${item.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ delta: qty }),
                                  });
                                  const json = await res.json();
                                  if (!res.ok) throw new Error(json.error || 'Erreur');
                                  await fetchInventory();
                                  alert('Stock mis à jour');
                                } catch (err) {
                                  console.error(err);
                                  alert('Erreur lors de la mise à jour du stock: ' + err.message);
                                }
                              }}
                              className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                            >
                              Réapprovisionner
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="w-full xl:w-96 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Nouvelle Commande</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Fournisseur</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition">
                      {providers.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Livre</label>
                    <input type="text" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700" placeholder="Ex: Clean Code" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Quantité</label>
                    <input type="number" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700" defaultValue="10" />
                  </div>
                  <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition shadow-lg mt-4">
                    Envoyer la commande
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Note Administrateur</p>
                <p className="text-xs text-blue-800 font-medium leading-relaxed italic">
                  "L'inventaire est mis à jour automatiquement lors des ventes et des retours d'emprunts."
                </p>
              </div>
            </aside>

          </div>
        </>
      )}

      {/* CONTENU EMPRUNTS */}
      {activeTab === 'borrows' && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-black text-xl uppercase italic">Gestion des Emprunts</h2>
            <button onClick={fetchBorrows} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-300 transition">Actualiser</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-gray-50">
                  <th className="px-8 py-6">Emprunteur</th>
                  <th className="px-8 py-6">Livre</th>
                  <th className="px-8 py-6">Date d'emprunt</th>
                  <th className="px-8 py-6">Retour prévu</th>
                  <th className="px-8 py-6">État</th>
                  <th className="px-8 py-6">Jours</th>
                  <th className="px-8 py-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {borrowsLoading ? (
                  <tr>
                    <td colSpan="7" className="px-8 py-6 text-center">Chargement des emprunts...</td>
                  </tr>
                ) : borrows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-8 py-6 text-center text-slate-400">Aucun emprunt</td>
                  </tr>
                ) : (
                  borrows.map(borrow => (
                    <tr key={borrow.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800">{borrow.userName}</p>
                        <p className="text-[10px] font-bold text-slate-400">{borrow.userEmail}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800">{borrow.bookTitle}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-slate-700 font-bold text-sm">
                          {borrow.borrowDate?.toDate?.()?.toLocaleDateString?.('fr-FR') || new Date(borrow.borrowDate).toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-slate-700 font-bold text-sm">
                          {formatDueDate(borrow.returnDueDate)}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        {borrow.returnDate ? (
                          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                            <FontAwesomeIcon icon={faCheck} /> Retourné
                          </span>
                        ) : borrow.status === 'overdue' ? (
                          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                            <FontAwesomeIcon icon={faTimesCircle} /> En retard
                          </span>
                        ) : borrow.status === 'soon' ? (
                          <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                            <FontAwesomeIcon icon={faClock} /> À retourner
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                            <FontAwesomeIcon icon={faCheck} /> En cours
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`font-black text-lg ${
                          borrow.returnDate ? 'text-slate-400' :
                          borrow.daysLeft < 0 ? 'text-red-600' :
                          borrow.daysLeft <= 3 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {borrow.returnDate ? '-' : borrow.daysLeft > 0 ? `+${borrow.daysLeft}` : borrow.daysLeft}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          {!borrow.returnDate && (
                            <>
                              <button
                                onClick={() => {
                                  setAlertModal({
                                    isOpen: true,
                                    borrowId: borrow.id,
                                    userId: borrow.userId,
                                    userName: borrow.userName,
                                    bookTitle: borrow.bookTitle,
                                    email: borrow.userEmail,
                                  });
                                  setAlertMessage('');
                                }}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={faBell} /> Alerte
                              </button>
                              <button
                                onClick={() => alert('Marquer comme retourné - À implémenter')}
                                className="bg-green-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition"
                              >
                                Retour
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL D'ALERTE */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase italic">Envoyer une alerte</h3>
            <p className="text-slate-600 text-sm mb-6">à {alertModal.userName} pour "{alertModal.bookTitle}"</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Email</p>
              <p className="text-slate-800 font-bold">{alertModal.email}</p>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Message personnalisé</label>
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                rows="4"
                placeholder="Ex: Veuillez retourner le livre demain..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAlertModal({ isOpen: false, borrowId: null, userId: '', userName: '', bookTitle: '', email: '' });
                  setAlertMessage('');
                }}
                className="flex-1 bg-gray-200 text-slate-800 px-4 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSendAlert}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faBell} /> Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER LIVRE */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faBook} className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Ajouter un livre</h3>
                  <p className="text-blue-100 text-xs font-bold mt-1">Enrichissez votre catalogue</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto flex-1 px-8 py-8">
              <form onSubmit={handleAddBookSubmit} className="space-y-7">
                
                {/* Section 1: Informations principales */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-black text-blue-900 uppercase mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBook} /> Informations principales
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Titre */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faBook} className="w-3" /> Titre *
                      </label>
                      <input
                        type="text"
                        value={addBookData.title}
                        onChange={(e) => setAddBookData({...addBookData, title: e.target.value})}
                        className="w-full bg-white border-2 border-blue-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Clean Code"
                        required
                      />
                    </div>

                    {/* Auteur */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faUser} className="w-3" /> Auteur *
                      </label>
                      <input
                        type="text"
                        value={addBookData.author}
                        onChange={(e) => setAddBookData({...addBookData, author: e.target.value})}
                        className="w-full bg-white border-2 border-blue-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Robert C. Martin"
                        required
                      />
                    </div>

                    {/* ISBN */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faBarcode} className="w-3" /> ISBN
                      </label>
                      <input
                        type="text"
                        value={addBookData.isbn}
                        onChange={(e) => setAddBookData({...addBookData, isbn: e.target.value})}
                        className="w-full bg-white border-2 border-blue-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="978-0132350884"
                      />
                    </div>

                    {/* Catégorie */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faTag} className="w-3" /> Catégorie
                      </label>
                      <select
                        value={addBookData.category}
                        onChange={(e) => setAddBookData({...addBookData, category: e.target.value})}
                        className="w-full bg-white border-2 border-blue-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option>Fiction</option>
                        <option>Non-fiction</option>
                        <option>Science-fiction</option>
                        <option>Fantasy</option>
                        <option>Mystère</option>
                        <option>Biographie</option>
                        <option>Éducation</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Détails de publication */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-xl border border-purple-200">
                  <h4 className="text-sm font-black text-purple-900 uppercase mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} /> Détails de publication
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faBuilding} className="w-3" /> Éditeur
                      </label>
                      <input
                        type="text"
                        value={addBookData.publisher}
                        onChange={(e) => setAddBookData({...addBookData, publisher: e.target.value})}
                        className="w-full bg-white border-2 border-purple-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="Prentice Hall"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendar} className="w-3" /> Année
                      </label>
                      <input
                        type="number"
                        value={addBookData.yearPublished}
                        onChange={(e) => setAddBookData({...addBookData, yearPublished: parseInt(e.target.value) || new Date().getFullYear()})}
                        className="w-full bg-white border-2 border-purple-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faFileLines} className="w-3" /> Pages
                      </label>
                      <input
                        type="number"
                        value={addBookData.pages}
                        onChange={(e) => setAddBookData({...addBookData, pages: parseInt(e.target.value) || 0})}
                        className="w-full bg-white border-2 border-purple-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faGlobe} className="w-3" /> Langue
                      </label>
                      <select
                        value={addBookData.language}
                        onChange={(e) => setAddBookData({...addBookData, language: e.target.value})}
                        className="w-full bg-white border-2 border-purple-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      >
                        <option value="Fr">🇫🇷 Français</option>
                        <option value="En">🇬🇧 Anglais</option>
                        <option value="Es">🇪🇸 Espagnol</option>
                        <option value="De">🇩🇪 Allemand</option>
                        <option value="It">🇮🇹 Italien</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Évaluation et Stock */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-xl border border-amber-200">
                  <h4 className="text-sm font-black text-amber-900 uppercase mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faStar} /> Évaluation et stock
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faStar} className="w-3" /> Note (0-5)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={addBookData.rating}
                          onChange={(e) => setAddBookData({...addBookData, rating: Math.max(0, Math.min(5, parseFloat(e.target.value) || 0))})}
                          className="flex-1 bg-white border-2 border-amber-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                          min="0"
                          max="5"
                          step="0.1"
                        />
                        <div className="text-2xl">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon 
                              key={i} 
                              icon={faStar} 
                              className={i < Math.floor(addBookData.rating) ? 'text-amber-400' : 'text-amber-200'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Stock initial</label>
                      <input
                        type="number"
                        value={addBookData.totalCopies}
                        onChange={(e) => setAddBookData({...addBookData, totalCopies: Math.max(1, parseInt(e.target.value) || 1)})}
                        className="w-full bg-white border-2 border-amber-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Description et Image */}
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-xl border border-green-200">
                  <h4 className="text-sm font-black text-green-900 uppercase mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faImage} /> Contenu et couverture
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faNoteSticky} className="w-3" /> Description
                      </label>
                      <textarea
                        value={addBookData.description}
                        onChange={(e) => setAddBookData({...addBookData, description: e.target.value})}
                        className="w-full bg-white border-2 border-green-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                        rows="2"
                        placeholder="Décrivez le contenu du livre..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faImage} className="w-3" /> URL Couverture
                      </label>
                      <input
                        type="text"
                        value={addBookData.coverImageUrl}
                        onChange={(e) => setAddBookData({...addBookData, coverImageUrl: e.target.value})}
                        className="w-full bg-white border-2 border-green-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        placeholder="https://example.com/cover.jpg"
                      />
                    </div>

                    {/* Aperçu image */}
                    {addBookData.coverImageUrl && (
                      <div className="p-4 bg-white rounded-lg border-2 border-green-300 flex justify-center">
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-wider">Aperçu de la couverture</p>
                          <img 
                            src={addBookData.coverImageUrl} 
                            alt="Aperçu couverture"
                            className="w-32 h-48 object-cover rounded-xl shadow-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/300x450?text=Image+invalide&bg=e5e7eb&textColor=999";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="bg-gray-50 border-t-2 border-gray-200 px-8 py-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                disabled={addBookLoading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-slate-800 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleAddBookSubmit}
                disabled={addBookLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {addBookLoading ? (
                  <>Ajout en cours...</>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlusCircle} /> Ajouter le livre
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}