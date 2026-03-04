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
      } catch (parseErr) {
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
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter mb-2">Dashboard Admin</h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">Gestion de l'inventaire, emprunts & achats</p>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-2 mb-8 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-4 font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === 'inventory' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          Inventaire
        </button>
        <button
          onClick={() => setActiveTab('borrows')}
          className={`px-6 py-4 font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === 'borrows' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FontAwesomeIcon icon={faUsers} className="mr-2" />
          Emprunts ({borrows.filter(b => !b.returnDate).length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-6 py-4 font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === 'purchases' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
          Achats ({purchases.length})
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
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valorisation Totale</p>
              <p className="text-3xl font-black italic text-white">
                ${purchases.reduce((sum, p) => sum + (p.bookPrice || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
              <h2 className="font-black text-xl uppercase italic">Inventaire des Stocks</h2>
              
              <div className="relative w-full md:max-w-md">
                <input 
                  type="text" 
                  placeholder="Rechercher par titre ou auteur..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-2xl px-5 py-3 pl-12 font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <button onClick={fetchInventory} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-300 transition">Actualiser</button>
                <button 
                  onClick={() => setShowAddBookModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition"
                >
                  <FontAwesomeIcon icon={faPlusCircle} /> Ajouter un livre
                </button>
                <button 
                  onClick={() => setShowFeeModal(true)}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-yellow-700 transition"
                >
                  <FontAwesomeIcon icon={faDollarSign} /> Ajouter un frais
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-6">Livre</th>
                    <th className="px-8 py-6">Format</th>
                    <th className="px-8 py-6">Stock actuel</th>
                    <th className="px-8 py-6">Seuil Min</th>
                    <th className="px-8 py-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-6 text-center">Chargement...</td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold uppercase italic tracking-widest">
                        Aucun livre trouvé pour "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map(item => (
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
                                alert('Stock mis à jour');
                              } catch (err) {
                                console.error(err);
                                alert('Erreur lors de la mise à jour du stock: ' + err.message);
                              }
                            }}
                            className="text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                          >
                            Retirer
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
        </>
      )}

      {/* CONTENU EMPRUNTS (AVEC FILTRE) */}
      {activeTab === 'borrows' && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="font-black text-xl uppercase italic">Gestion des Emprunts</h2>
              
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {/* Recherche Textuelle */}
                <div className="relative flex-1 md:w-64">
                  <input 
                    type="text" 
                    placeholder="Nom, email, livre..." 
                    value={borrowSearch}
                    onChange={(e) => setBorrowSearch(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pl-10 font-bold text-sm focus:border-blue-500 outline-none transition-all"
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                </div>

                {/* Sélecteur de Statut */}
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">En cours</option>
                  <option value="soon">À retourner bientôt</option>
                  <option value="overdue">En retard</option>
                  <option value="unpaid-fees">Frais impayés</option>
                  <option value="returned">Retournés</option>
                </select>

                <button onClick={fetchBorrows} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-300 transition">
                  Actualiser
                </button>
              </div>
            </div>
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
                  <th className="px-8 py-6">Frais</th>
                  <th className="px-8 py-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {borrowsLoading ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-6 text-center text-slate-400 font-bold">Chargement des emprunts...</td>
                  </tr>
                ) : filteredBorrows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-12 text-center text-slate-400 font-bold uppercase italic tracking-widest">
                      Aucun emprunt trouvé
                    </td>
                  </tr>
                ) : (
                  filteredBorrows.map(borrow => (
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
                        {borrow.isOverdue && !borrow.feesSettled ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
                              <FontAwesomeIcon icon={faDollarSign} /> ${borrow.lateFees.toFixed(2)}
                            </span>
                            {!borrow.feesSettled && (
                              <span className="text-[8px] font-black text-red-600 uppercase">IMPAYÉ</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold text-sm">-</span>
                        )}
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
                                onClick={() => alert('Fonction retour à implémenter')}
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

      {/* CONTENU ACHATS */}
      {activeTab === 'purchases' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faShoppingCart} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Achats</p>
              <p className="text-3xl font-black text-slate-900 italic">{purchases.length}</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenu Total</p>
              <p className="text-3xl font-black text-slate-900 italic">
                ${purchases.reduce((sum, p) => sum + (p.bookPrice || 0), 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complétés</p>
              <p className="text-3xl font-black text-slate-900 italic">
                {purchases.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b-2 border-gray-100">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faShoppingCart} className="text-purple-600" />
                Tous les achats
              </h3>
            </div>

            {purchasesLoading ? (
              <div className="p-8 text-center">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin mb-4" />
                <p className="text-slate-600 font-bold">Chargement des achats...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-wider">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-wider">Livre</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-wider">Auteur</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-600 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-600 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-900">{purchase.userName}</p>
                            <p className="text-xs text-slate-400">{purchase.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{purchase.bookTitle}</td>
                        <td className="px-6 py-4 text-slate-600">{purchase.bookAuthor}</td>
                        <td className="px-6 py-4 text-right font-bold text-purple-600">${(purchase.bookPrice || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {purchase.purchaseDate?.toDate?.().toLocaleDateString('fr-FR') || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            purchase.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {purchase.status === 'completed' ? 'Complété' : 'En attente'}
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
  );
}