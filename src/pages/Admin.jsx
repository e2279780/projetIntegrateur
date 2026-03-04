import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
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
  faStar,
  faImage,
  faTimes,
  faDollarSign,
  faShoppingCart,
  faSpinner,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { databaseService } from '../services';
import { getDaysRemaining, formatDueDate } from '../utils/dateUtils';

export default function Admin() {
  // --- ÉTATS ---
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  
  const [borrows, setBorrows] = useState([]);
  const [borrowsLoading, setBorrowsLoading] = useState(false);
  
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  
  const [alertModal, setAlertModal] = useState({ isOpen: false, borrowId: null, userId: '', userName: '', bookTitle: '', email: '' });
  const [alertMessage, setAlertMessage] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeData, setFeeData] = useState({ userId: '', email: '', amount: 0, message: '' });
  const [feeLoading, setFeeLoading] = useState(false);
  
  // États pour la recherche et filtres
  const [searchTerm, setSearchTerm] = useState(''); // Pour Inventaire
  const [borrowSearch, setBorrowSearch] = useState(''); // Pour Emprunts (texte)
  const [statusFilter, setStatusFilter] = useState('all'); // Pour Emprunts (dropdown)

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
    price: 0,
    totalCopies: 1,
    coverImageUrl: '',
  });
  const [addBookLoading, setAddBookLoading] = useState(false);

  // --- LOGIQUE DE FILTRAGE ---

  // Filtre Inventaire
  const filteredInventory = inventory.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtre Emprunts (Multi-critères)
  const filteredBorrows = borrows.filter(borrow => {
    const matchesSearch = 
      borrow.userName.toLowerCase().includes(borrowSearch.toLowerCase()) ||
      borrow.bookTitle.toLowerCase().includes(borrowSearch.toLowerCase()) ||
      borrow.userEmail.toLowerCase().includes(borrowSearch.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'returned' && borrow.returnDate) ||
      (statusFilter === 'overdue' && !borrow.returnDate && borrow.status === 'overdue') ||
      (statusFilter === 'soon' && !borrow.returnDate && borrow.status === 'soon') ||
      (statusFilter === 'active' && !borrow.returnDate && borrow.status === 'ok') ||
      (statusFilter === 'unpaid-fees' && borrow.isOverdue && !borrow.feesSettled);

    return matchesSearch && matchesStatus;
  });

  // --- FONCTIONS FETCH ---

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
        provider: b.author || b.publisher || 'Inconnu',
        format: b.format || 'Physique',
      }));

      setInventory(mapped);
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
      const enrichedBorrows = await Promise.all(allBorrows.map(async (borrow) => {
        try {
          const user = await databaseService.getUserById(borrow.userId);
          const book = await databaseService.getBookById(borrow.bookId);
          const daysLeft = getDaysRemaining(borrow.returnDueDate);
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
            userName: user ? `${user.firstName} ${user.lastName}` : 'Inconnu',
            userEmail: user?.email || 'N/A',
            bookTitle: book?.title || 'Livre inconnu',
            daysLeft,
            status,
            // Ajouter les infos de frais de retard
            isOverdue: borrow.isOverdue || false,
            lateFees: borrow.lateFees || 0,
            feesSettled: borrow.feesSettled || false,
          };
        } catch (err) {
          console.error('Erreur enrichissement emprunt:', err);
          return null;
        }
      }));
      const validBorrows = enrichedBorrows
        .filter(b => b !== null)
        .sort((a, b) => {
          if (a.returnDate && !b.returnDate) return 1;
          if (!a.returnDate && b.returnDate) return -1;
          return a.daysLeft - b.daysLeft;
        });
      setBorrows(validBorrows);
    } catch (err) {
      console.error('Erreur fetch borrows:', err);
    } finally {
      setBorrowsLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      setPurchasesLoading(true);
      const purchasesData = await databaseService.getAllPurchases();
      const enrichedPurchases = await Promise.all(
        purchasesData.map(async (purchase) => {
          try {
            const user = await databaseService.getUserById(purchase.userId);
            return {
              ...purchase,
              userName: user?.name || 'Inconnu',
              userEmail: user?.email || 'Inconnu',
            };
          } catch {
            return { ...purchase, userName: 'Inconnu', userEmail: 'Inconnu' };
          }
        })
      );
      setPurchases(enrichedPurchases || []);
    } catch (err) {
      console.error('Erreur lors du chargement des achats:', err);
      setPurchases([]);
    } finally {
      setPurchasesLoading(false);
    }
  };

  // --- HANDLERS ---

  const handleAddFee = async () => {
    // basic validation: require either userId or email
    if ((!feeData.userId || !feeData.userId.trim()) && (!feeData.email || !feeData.email.trim())) {
      alert('Veuillez fournir un userId ou une adresse email valide');
      return;
    }
    if (feeData.amount <= 0) {
      alert('Veuillez fournir un montant positif');
      return;
    }
    setFeeLoading(true);
    try {
      const resp = await fetch('/api/admin/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeData),
      });
      // Parse response safely: accept JSON or plain text (some servers return HTML on errors)
      let parsed = null;
      try {
        const ct = resp.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          parsed = await resp.json();
        } else {
          parsed = await resp.text();
        }
      } catch {
        try { parsed = await resp.text(); } catch { parsed = null; }
      }

      if (!resp.ok) {
        const serverMsg = parsed && typeof parsed === 'object' ? (parsed.error || parsed.message) : (typeof parsed === 'string' ? parsed : null);
        throw new Error(serverMsg || `Erreur serveur (${resp.status})`);
      }

      alert('Frais ajouté avec succès');
      setShowFeeModal(false);
      setFeeData({ userId: '', email: '', amount: 0, message: '' });
    } catch (err) {
      console.error('Erreur lors de l\'ajout du frais', err);
      alert('Échec de l\'ajout du frais : ' + (err.message || 'Erreur inconnue'));
    } finally {
      setFeeLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!alertModal.borrowId || !alertMessage.trim()) {
      alert('Veuillez remplir le message');
      return;
    }
    try {
      await databaseService.sendNotification(alertModal.userId, {
        title: `Rappel: Retour de livre - ${alertModal.bookTitle}`,
        message: alertMessage,
        type: 'alert',
        borrowId: alertModal.borrowId,
      });
      alert('Alerte envoyée avec succès!');
      setAlertModal({ isOpen: false, borrowId: null, userId: '', userName: '', bookTitle: '', email: '' });
      setAlertMessage('');
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
        title: '', author: '', isbn: '', category: 'Fiction', description: '',
        publisher: '', yearPublished: new Date().getFullYear(), pages: 0,
        language: 'Fr', rating: 0, price: 0, totalCopies: 1, coverImageUrl: '',
      });
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
    } else if (activeTab === 'purchases') {
      fetchPurchases();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100">
      <div className="max-w-[1800px] mx-auto px-6 py-12">
        
        {/* HEADER MAGNIFIQUE */}
        <div className="mb-16">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter leading-tight">
                Dashboard <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 bg-clip-text text-transparent">Admin</span>
              </h1>
              <p className="text-slate-600 font-bold text-lg flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Gestion complète de la bibliothèque
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-600 text-sm font-bold">📅 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* ONGLETS ÉLÉGANTS */}
        <div className="flex gap-3 mb-12 flex-wrap">
          {[
            { id: 'inventory', label: 'Inventaire', icon: faChartLine, color: 'from-blue-600 to-blue-700' },
            { id: 'borrows', label: `Emprunts (${borrows.filter(b => !b.returnDate).length})`, icon: faUsers, color: 'from-purple-600 to-purple-700' },
            { id: 'purchases', label: `Achats (${purchases.length})`, icon: faShoppingCart, color: 'from-emerald-600 to-emerald-700' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative group px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${
                activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-lg" />
              {tab.label}
              {activeTab === tab.id && <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-50 animate-pulse"></div>}
            </button>
          ))}
        </div>

      {/* CONTENU INVENTAIRE */}
      {activeTab === 'inventory' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* CARTES DE STATISTIQUES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Carte 1 : Total Livres */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-white border border-blue-200 rounded-[2rem] p-8 shadow-md overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 border border-blue-200">
                    <FontAwesomeIcon icon={faBook} className="text-2xl" />
                  </div>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Total Livres</p>
                  <p className="text-4xl font-black text-slate-900 mb-3">{inventory.length}</p>
                  <p className="text-xs text-slate-500 font-bold">📊 +12% ce mois</p>
                </div>
              </div>
            </div>

            {/* Carte 2 : Alertes Stock Bas */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-400 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-white border border-red-200 rounded-[2rem] p-8 shadow-md overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-5 border border-red-200">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl" />
                  </div>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Alertes Stock</p>
                  <p className="text-4xl font-black text-red-600 mb-3">{inventory.filter(item => item.stock <= item.minStock).length}</p>
                  <p className="text-xs text-slate-500 font-bold">⚠️ Action requise</p>
                </div>
              </div>
            </div>

            {/* Carte 3 : Revenu Total */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-white border border-emerald-200 rounded-[2rem] p-8 shadow-md overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 border border-emerald-200">
                    <FontAwesomeIcon icon={faDollarSign} className="text-2xl" />
                  </div>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Revenu Total</p>
                  <p className="text-4xl font-black text-emerald-600 mb-3">${purchases.reduce((sum, p) => sum + (p.bookPrice || 0), 0).toFixed(0)}</p>
                  <p className="text-xs text-slate-500 font-bold">💰 Tous les achats</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABLEAU INVENTAIRE */}
          {/* TABLEAU INVENTAIRE */}
          <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-100 to-slate-50 px-8 py-8 border-b border-gray-300">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="font-black text-2xl text-slate-900 mb-1">📚 Inventaire des Stocks</h2>
                  <p className="text-sm text-slate-600 font-bold">Gestion du catalogue et disponibilités</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                  <div className="relative flex-1 md:flex-none min-w-80">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input 
                      type="text" 
                      placeholder="Rechercher par titre ou auteur..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl px-5 pl-14 py-3.5 font-bold text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={fetchInventory} 
                    className="px-5 py-3.5 rounded-2xl font-black text-sm bg-gray-100 hover:bg-gray-200 text-slate-800 transition-all border border-gray-200 flex items-center gap-2"
                  >
                    🔄 Actualiser
                  </button>
                  <button 
                    onClick={() => setShowAddBookModal(true)}
                    className="px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPlusCircle} /> Ajouter
                  </button>
                  <button 
                    onClick={() => setShowFeeModal(true)}
                    className="px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faDollarSign} /> Frais
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-black text-slate-600 uppercase tracking-widest bg-gray-50 border-b border-gray-200">
                    <th className="px-8 py-5">Livre</th>
                    <th className="px-8 py-5">Format</th>
                    <th className="px-8 py-5">Stock</th>
                    <th className="px-8 py-5">Seuil Min</th>
                    <th className="px-8 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 text-2xl" />
                        <p className="text-slate-600 font-bold mt-3">Chargement des données...</p>
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold uppercase italic tracking-widest">
                        aucun livre trouvé pour "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-0">
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-900">{item.title}</p>
                          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mt-1">{item.provider}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-blue-200">{item.format}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`font-black text-lg ${item.stock <= item.minStock ? 'text-red-600' : 'text-emerald-600'}`}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-bold text-slate-600">{item.minStock}</td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col sm:flex-row gap-2">
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
                                  alert('✅ Stock mis à jour');
                                } catch (err) {
                                  console.error(err);
                                  alert('❌ Erreur: ' + err.message);
                                }
                              }}
                              className="text-blue-600 font-black text-[11px] uppercase tracking-widest hover:text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all"
                            >
                              ➕ Ajouter
                            </button>
                            <button
                              onClick={async () => {
                                const qtyStr = window.prompt('Quantité à retirer (nombre positif)');
                                if (!qtyStr) return;
                                const qty = parseInt(qtyStr, 10);
                                if (Number.isNaN(qty) || qty <= 0) return alert('Quantité invalide');
                                if (qty > item.stock) return alert('Impossible de retirer plus que le stock actuel');

                                try {
                                  const res = await fetch(`/api/books/${item.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ delta: -qty }),
                                  });
                                  const json = await res.json();
                                  if (!res.ok) throw new Error(json.error || 'Erreur');
                                  await fetchInventory();
                                  alert('✅ Stock mis à jour');
                                } catch (err) {
                                  console.error(err);
                                  alert('❌ Erreur: ' + err.message);
                                }
                              }}
                              className="text-red-700 font-black text-[11px] uppercase tracking-widest hover:text-red-800 hover:bg-red-200 px-3 py-2 rounded-lg transition-all border border-red-300"
                            >
                              ➖ Retirer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU EMPRUNTS (AVEC FILTRE) */}
      {activeTab === 'borrows' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-100 to-slate-50 px-8 py-8 border-b border-gray-300">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="font-black text-2xl text-slate-900 mb-1">👥 Gestion des Emprunts</h2>
                  <p className="text-sm text-slate-600 font-bold">Suivi des emprunts et retours de livres</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                  {/* Recherche Textuelle */}
                  <div className="relative flex-1 md:w-64">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input 
                      type="text" 
                      placeholder="Nom, email, livre..." 
                      value={borrowSearch}
                      onChange={(e) => setBorrowSearch(e.target.value)}
                      className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl px-4 pl-12 py-3 font-bold text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>

                  {/* Sélecteur de Statut */}
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl px-4 py-3 font-black text-[11px] uppercase tracking-widest text-slate-800 outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 cursor-pointer transition-all"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">En cours</option>
                    <option value="soon">À retourner bientôt</option>
                    <option value="overdue">En retard</option>
                    <option value="unpaid-fees">Frais impayés</option>
                    <option value="returned">Retournés</option>
                  </select>

                  <button 
                    onClick={fetchBorrows} 
                    className="px-5 py-3 rounded-2xl font-black text-sm bg-gray-100 hover:bg-gray-200 text-slate-800 transition-all border border-gray-200"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-black text-slate-600 uppercase tracking-widest bg-gray-50 border-b border-gray-200">
                    <th className="px-8 py-5">Emprunteur</th>
                    <th className="px-8 py-5">Livre</th>
                    <th className="px-8 py-5">Date d'emprunt</th>
                    <th className="px-8 py-5">Retour prévu</th>
                    <th className="px-8 py-5">État</th>
                    <th className="px-8 py-5">Jours</th>
                    <th className="px-8 py-5">Frais</th>
                    <th className="px-8 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {borrowsLoading ? (
                    <tr>
                      <td colSpan="8" className="px-8 py-12 text-center">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-purple-600 text-2xl" />
                        <p className="text-slate-600 font-bold mt-3">Chargement des emprunts...</p>
                      </td>
                    </tr>
                  ) : filteredBorrows.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-8 py-12 text-center text-slate-600 font-bold uppercase italic tracking-widest">
                        Aucun emprunt trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredBorrows.map(borrow => (
                      <tr key={borrow.id} className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-0">
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-900">{borrow.userName}</p>
                          <p className="text-[11px] font-bold text-slate-600">{borrow.userEmail}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-900">{borrow.bookTitle}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-slate-700 font-bold text-sm">
                            {borrow.borrowDate?.toDate?.()?.toLocaleDateString?.('fr-FR') || new Date(borrow.borrowDate).toLocaleDateString('fr-FR')}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-slate-700 font-bold text-sm">
                            {formatDueDate(borrow.returnDueDate)}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          {borrow.returnDate ? (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border border-emerald-200">
                              <FontAwesomeIcon icon={faCheck} /> Retourné
                            </span>
                          ) : borrow.status === 'overdue' ? (
                            <span className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border border-red-200">
                              <FontAwesomeIcon icon={faTimesCircle} /> En retard
                            </span>
                          ) : borrow.status === 'soon' ? (
                            <span className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border border-amber-200">
                              <FontAwesomeIcon icon={faClock} /> À retourner
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border border-blue-200">
                              <FontAwesomeIcon icon={faCheck} /> En cours
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`font-black text-lg ${
                            borrow.returnDate ? 'text-slate-600' :
                            borrow.daysLeft < 0 ? 'text-red-600' :
                            borrow.daysLeft <= 3 ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {borrow.returnDate ? '-' : borrow.daysLeft > 0 ? `+${borrow.daysLeft}j` : `${borrow.daysLeft}j`}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {borrow.isOverdue && !borrow.feesSettled ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-1 w-fit border border-red-500/30">
                                <FontAwesomeIcon icon={faDollarSign} /> ${borrow.lateFees.toFixed(2)}
                              </span>
                              {!borrow.feesSettled && (
                                <span className="text-[9px] font-black text-red-400 uppercase bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/30">IMPAYÉ</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 font-bold text-sm">-</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
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
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest transition border border-blue-700 flex items-center gap-1 shadow-md"
                                >
                                  <FontAwesomeIcon icon={faBell} /> Alerte
                                </button>
                                <button
                                  onClick={() => alert('Fonction retour à implémenter')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest transition border border-emerald-700 shadow-md"
                                >
                                  ✅ Retour
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
        </div>
      )}

      {/* CONTENU ACHATS */}
      {activeTab === 'purchases' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          {/* CARTES DE STATISTIQUES DES ACHATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Carte 1 : Total Achats */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-white border border-purple-200 rounded-[2rem] p-8 shadow-md overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-5 border border-purple-200">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-2xl" />
                  </div>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Total Achats</p>
                  <p className="text-4xl font-black text-slate-900 mb-3">{purchases.length}</p>
                  <p className="text-xs text-slate-500 font-bold">🛍️ Transactions</p>
                </div>
              </div>
            </div>

            {/* Carte 2 : Revenu Total */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-white border border-emerald-200 rounded-[2rem] p-8 shadow-md overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 border border-emerald-200">
                    <FontAwesomeIcon icon={faDollarSign} className="text-2xl" />
                  </div>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Revenu Total</p>
                  <p className="text-4xl font-black text-slate-900 mb-3">${purchases.reduce((sum, p) => sum + (p.bookPrice || 0), 0).toFixed(0)}</p>
                  <p className="text-xs text-slate-500 font-bold">💰 Jusqu'à maintenant</p>
                </div>
              </div>
            </div>

            {/* Carte 3 : Complétés */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-400 rounded-[2rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-white border border-cyan-200 rounded-[2rem] p-8 shadow-md overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-5 border border-cyan-200">
                    <FontAwesomeIcon icon={faCheck} className="text-2xl" />
                  </div>
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Complétés</p>
                  <p className="text-4xl font-black text-slate-900 mb-3">{purchases.filter(p => p.status === 'completed').length}</p>
                  <p className="text-xs text-slate-500 font-bold">✅ Transactions finalisées</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABLEAU ACHATS */}
          <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-100 to-slate-50 px-8 py-8 border-b border-gray-300">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-1">
                <FontAwesomeIcon icon={faShoppingCart} className="text-purple-600" />
                Tous les achats
              </h3>
              <p className="text-sm text-slate-400 font-bold">Historique complet des transactions</p>
            </div>

            {purchasesLoading ? (
              <div className="p-12 text-center">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-purple-600 animate-spin mb-4" />
                <p className="text-slate-600 font-bold">Chargement des achats...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                      <th className="px-8 py-5 text-left">Utilisateur</th>
                      <th className="px-8 py-5 text-left">Livre</th>
                      <th className="px-8 py-5 text-left">Auteur</th>
                      <th className="px-8 py-5 text-right">Prix</th>
                      <th className="px-8 py-5 text-left">Date</th>
                      <th className="px-8 py-5 text-left">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-0">
                        <td className="px-8 py-5">
                          <div>
                            <p className="font-bold text-slate-900">{purchase.userName}</p>
                            <p className="text-xs text-slate-600">{purchase.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-bold text-slate-900">{purchase.bookTitle}</td>
                        <td className="px-8 py-5 text-slate-700">{purchase.bookAuthor}</td>
                        <td className="px-8 py-5 text-right font-bold text-purple-600">${(purchase.bookPrice || 0).toFixed(2)}</td>
                        <td className="px-8 py-5 text-slate-700">
                          {purchase.purchaseDate?.toDate?.().toLocaleDateString('fr-FR') || 'N/A'}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest border ${
                            purchase.status === 'completed' 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {purchase.status === 'completed' ? '✅ Complété' : '⏳ En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL D'ALERTE EMPRUNT */}
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
              <button onClick={() => setShowAddBookModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-8 py-8">
              <form onSubmit={handleAddBookSubmit} className="space-y-7">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-black text-blue-900 uppercase mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBook} /> Informations principales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faBook} className="w-3" /> Titre *
                      </label>
                      <input type="text" value={addBookData.title} onChange={(e) => setAddBookData({...addBookData, title: e.target.value})} className="w-full bg-white border-2 border-blue-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Clean Code" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faUser} className="w-3" /> Auteur *
                      </label>
                      <input type="text" value={addBookData.author} onChange={(e) => setAddBookData({...addBookData, author: e.target.value})} className="w-full bg-white border-2 border-blue-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Robert C. Martin" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faBarcode} className="w-3" /> ISBN
                      </label>
                      <input type="text" value={addBookData.isbn} onChange={(e) => setAddBookData({...addBookData, isbn: e.target.value})} className="w-full bg-white border-2 border-blue-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="978-0132350884" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider flex items-center gap-1">
                        <FontAwesomeIcon icon={faTag} className="w-3" /> Catégorie
                      </label>
                      <select value={addBookData.category} onChange={(e) => setAddBookData({...addBookData, category: e.target.value})} className="w-full bg-white border-2 border-blue-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option>Fiction</option><option>Non-fiction</option><option>Science-fiction</option><option>Fantasy</option><option>Mystère</option><option>Biographie</option><option>Éducation</option><option>Autre</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-xl border border-purple-200">
                  <h4 className="text-sm font-black text-purple-900 uppercase mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} /> Détails de publication
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Éditeur</label>
                      <input type="text" value={addBookData.publisher} onChange={(e) => setAddBookData({...addBookData, publisher: e.target.value})} className="w-full bg-white border-2 border-purple-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Année</label>
                      <input type="number" value={addBookData.yearPublished} onChange={(e) => setAddBookData({...addBookData, yearPublished: parseInt(e.target.value)})} className="w-full bg-white border-2 border-purple-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-xl border border-amber-200">
                  <h4 className="text-sm font-black text-amber-900 uppercase mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faStar} /> Évaluation et stock
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Note (0-5)</label>
                      <input type="number" step="0.1" value={addBookData.rating} onChange={(e) => setAddBookData({...addBookData, rating: parseFloat(e.target.value)})} className="w-full bg-white border-2 border-amber-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Prix ($)</label>
                      <input type="number" step="0.01" value={addBookData.price} onChange={(e) => setAddBookData({...addBookData, price: parseFloat(e.target.value)})} className="w-full bg-white border-2 border-amber-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Stock initial</label>
                      <input type="number" value={addBookData.totalCopies} onChange={(e) => setAddBookData({...addBookData, totalCopies: parseInt(e.target.value)})} className="w-full bg-white border-2 border-amber-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-xl border border-green-200">
                  <h4 className="text-sm font-black text-green-900 uppercase mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faImage} /> Couverture
                  </h4>
                  <input type="text" value={addBookData.coverImageUrl} onChange={(e) => setAddBookData({...addBookData, coverImageUrl: e.target.value})} className="w-full bg-white border-2 border-green-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition" placeholder="URL de l'image" />
                  
                  {addBookData.coverImageUrl && (
                    <div className="mt-4 flex justify-center">
                      <div className="bg-white border-2 border-green-300 rounded-lg p-3 max-w-xs">
                        <img 
                          src={addBookData.coverImageUrl} 
                          alt="Aperçu de la couverture" 
                          className="w-full h-auto rounded-lg object-cover max-h-64"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect fill="%23e2e8f0" width="100" height="150"/%3E%3Ctext x="50" y="75" font-size="14" fill="%23888" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-gray-50 border-t-2 border-gray-200 px-8 py-4 flex gap-3">
              <button onClick={() => setShowAddBookModal(false)} disabled={addBookLoading} className="flex-1 bg-gray-300 hover:bg-gray-400 text-slate-800 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition">Annuler</button>
              <button onClick={handleAddBookSubmit} disabled={addBookLoading} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                {addBookLoading ? 'Ajout...' : <><FontAwesomeIcon icon={faPlusCircle} /> Ajouter le livre</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER FRAIS */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-8 py-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faDollarSign} className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Ajouter un frais</h3>
                  <p className="text-yellow-100 text-xs font-bold mt-1">Appliquer un montant à un utilisateur</p>
                </div>
              </div>
              <button onClick={() => setShowFeeModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-8 py-8">
              <form onSubmit={(e) => { e.preventDefault(); handleAddFee(); }} className="space-y-7">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">User ID (ou Email)</label>
                    <input
                      type="text"
                      value={feeData.userId}
                      onChange={(e) => setFeeData({ ...feeData, userId: e.target.value })}
                      className="w-full bg-white border-2 border-yellow-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                      placeholder="user123"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Email (optionnel, utilisé si fourni)</label>
                    <input
                      type="email"
                      value={feeData.email}
                      onChange={(e) => setFeeData({ ...feeData, email: e.target.value })}
                      className="w-full bg-white border-2 border-yellow-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                      placeholder="utilisateur@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Montant ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={feeData.amount}
                      onChange={(e) => setFeeData({ ...feeData, amount: parseFloat(e.target.value) })}
                      className="w-full bg-white border-2 border-yellow-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 mb-2 block tracking-wider">Message (optionnel)</label>
                    <input
                      type="text"
                      value={feeData.message}
                      onChange={(e) => setFeeData({ ...feeData, message: e.target.value })}
                      className="w-full bg-white border-2 border-yellow-200 rounded-lg px-4 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-gray-50 border-t-2 border-gray-200 px-8 py-4 flex gap-3">
              <button onClick={() => setShowFeeModal(false)} disabled={feeLoading} className="flex-1 bg-gray-300 hover:bg-gray-400 text-slate-800 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition">Annuler</button>
              <button onClick={handleAddFee} disabled={feeLoading} className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                {feeLoading ? 'Ajout...' : <><FontAwesomeIcon icon={faDollarSign} /> Ajouter le frais</>}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}