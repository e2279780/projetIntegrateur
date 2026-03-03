import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faLock, faMapMarkerAlt, faCreditCard, 
  faCamera, faCheckCircle, faEnvelope, faPlus, faSpinner, faExclamationTriangle, faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { authService, databaseService } from '../services';

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
      <FontAwesomeIcon icon={icon} />
    </div>
    <h2 className="text-xl font-black text-slate-800">{title}</h2>
  </div>
);

export default function Profile({ user, role }) {
  const [activeTab, setActiveTab] = useState('infos');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [cardInfo, setCardInfo] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardLoading, setCardLoading] = useState(true);
  const [cardForm, setCardForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Charger les informations de carte au montage
  useEffect(() => {
    const loadCardInfo = async () => {
      try {
        if (user?.id || user?.uid) {
          const info = await databaseService.getCardInfo(user.id || user.uid);
          setCardInfo(info);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la carte:', err);
      } finally {
        setCardLoading(false);
      }
    };

    loadCardInfo();
  }, [user]);
  
  // Construire le nom d'affichage à partir des données Firebase
  const displayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || "Utilisateur";
  
  const initial = displayName.charAt(0).toUpperCase();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const updatedData = {
      name: e.target.name.value,
      email: e.target.email.value
    };

    try {
      await authService.updateUser(user.id || user.uid, updatedData);
      
      setStatus({ 
        type: 'success', 
        message: 'Vos informations ont été mises à jour avec succès dans la base de données.' 
      });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.message || 'Une erreur est survenue lors de la mise à jour.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    setCardLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Validation simple
      if (!cardForm.cardholderName || !cardForm.cardNumber || !cardForm.expiryDate) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Garder seulement les 4 derniers chiffres pour la sécurité
      const lastDigits = cardForm.cardNumber.slice(-4);

      const cardData = {
        cardNumber: lastDigits,
        expiryDate: cardForm.expiryDate,
        cardholderName: cardForm.cardholderName,
        isConfigured: true
      };

      await databaseService.saveCardInfo(user.id || user.uid, cardData);
      
      setCardInfo(cardData);
      setShowAddCard(false);
      setCardForm({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
      
      setStatus({ 
        type: 'success', 
        message: 'Carte bancaire enregistrée avec succès!' 
      });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.message || 'Erreur lors de l\'enregistrement de la carte' 
      });
    } finally {
      setCardLoading(false);
    }
  };

  const handleCardFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formater le numéro de carte
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    // Formater la date d'expiration
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }
    // Limiter le CVV à 3-4 chiffres
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardForm(prev => ({ ...prev, [name]: formattedValue }));
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 px-4 py-10">
      
      {/* Barre latérale du Profil */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-slate-900 z-0"></div>
          
          <div className="relative z-10">
            <div className="relative inline-block group">
              <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] border-4 border-white flex items-center justify-center text-white text-5xl font-black shadow-lg mx-auto mb-4">
                {initial}
              </div>
              <button className="absolute bottom-4 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 transition border border-gray-100">
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
            
            <h1 className="text-2xl font-black text-slate-800 capitalize">{displayName}</h1>
            <p className="text-blue-600 font-bold text-sm mb-6 flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} /> {role || 'Membre'}
            </p>

            <div className="space-y-2">
              {['infos', 'securite', 'adresse', 'paiement'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-6 py-3 rounded-2xl font-bold text-sm transition ${
                    activeTab === tab ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'infos' && "Informations personnelles"}
                  {tab === 'securite' && "Sécurité & mot de passe"}
                  {tab === 'adresse' && "Adresses de livraison"}
                  {tab === 'paiement' && "Modes de paiement"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zone de contenu dynamique */}
      <div className="flex-1 bg-white rounded-[3rem] shadow-xl border border-gray-100 p-10 min-h-[600px]">
        
        {/* ONGLET : INFOS */}
        {activeTab === 'infos' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <SectionTitle icon={faUser} title="Modifier le profil" />
            
            {status.message && (
              <div className={`mb-6 p-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                <FontAwesomeIcon icon={status.type === 'success' ? faCheckCircle : faExclamationTriangle} />
                {status.message}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Nom complet</label>
                  <input 
                    name="name"
                    type="text" 
                    defaultValue={user?.name} 
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Email</label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      name="email"
                      type="email" 
                      defaultValue={user?.email} 
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-700" 
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-70 flex items-center gap-3 shadow-xl shadow-blue-100"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : null}
                  {loading ? 'Mise à jour en cours...' : 'Enregistrer les changements'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ONGLET : SÉCURITÉ */}
        {activeTab === 'securite' && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <SectionTitle icon={faLock} title="Changer le mot de passe" />
            <form className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Mot de passe actuel</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition shadow-lg shadow-slate-200">
                Mettre à jour le mot de passe
              </button>
            </form>
          </div>
        )}

        {/* ONGLET : ADRESSE */}
        {activeTab === 'adresse' && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <SectionTitle icon={faMapMarkerAlt} title="Mes Adresses" />
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div>
                  <p className="font-black text-slate-800">Maison (Principale)</p>
                  <p className="text-slate-500 text-sm font-medium">3800 Sherbrooke St E, Montreal, Quebec H1X 2A2</p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 font-black hover:underline px-2 transition">
              <FontAwesomeIcon icon={faPlus} /> Ajouter une nouvelle adresse
            </button>
          </div>
        )}

        {/* ONGLET : PAIEMENT */}
        {activeTab === 'paiement' && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <SectionTitle icon={faCreditCard} title="Modes de paiement" />
            
            {status.message && (
              <div className={`mb-6 p-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                <FontAwesomeIcon icon={status.type === 'success' ? faCheckCircle : faExclamationTriangle} />
                {status.message}
              </div>
            )}

            {cardLoading ? (
              <div className="flex items-center justify-center py-12">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600" size="2x" />
              </div>
            ) : cardInfo && cardInfo.isConfigured ? (
              <div className="space-y-6">
                <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={faCreditCard} size="5x" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-8">Carte enregistrée</p>
                    <p className="text-2xl font-mono mb-8 tracking-widest">•••• •••• •••• {cardInfo.cardNumber}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-tighter">Expire le</p>
                        <p className="font-bold tracking-widest text-lg">{cardInfo.expiryDate}</p>
                      </div>
                      <p className="text-slate-300 text-sm font-bold">{cardInfo.cardholderName}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAddCard(true)}
                  className="w-full border-2 border-dashed border-gray-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-2xl mb-2 group-hover:scale-125 transition-transform" />
                  <span className="font-black text-sm uppercase tracking-widest">Mettre à jour la carte</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-8 bg-yellow-50 border-2 border-yellow-200 rounded-[2.5rem] flex flex-col items-center justify-center text-yellow-700">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl mb-3" />
                  <p className="font-black text-center">Aucune carte configurée</p>
                  <p className="text-sm text-yellow-600 mt-2 text-center">
                    Vous devez configurer une carte bancaire pour pouvoir acheter des livres
                  </p>
                </div>

                <button 
                  onClick={() => setShowAddCard(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center font-black transition-all shadow-lg shadow-blue-200"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-2xl mb-2" />
                  <span className="text-sm uppercase tracking-widest">Ajouter une carte bancaire</span>
                </button>
              </div>
            )}

            {/* Modal Ajouter Carte */}
            {showAddCard && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-slate-800">Ajouter une carte</h3>
                    <button 
                      onClick={() => setShowAddCard(false)}
                      className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-100 transition"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-slate-700 hover:text-red-600" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCard} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">
                        Titulaire de la carte
                      </label>
                      <input 
                        type="text"
                        name="cardholderName"
                        value={cardForm.cardholderName}
                        onChange={handleCardFormChange}
                        placeholder="Jean Dupont"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition font-bold text-slate-700"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">
                        Numéro de carte
                      </label>
                      <input 
                        type="text"
                        name="cardNumber"
                        value={cardForm.cardNumber}
                        onChange={handleCardFormChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition font-mono text-slate-700"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">
                          Date d'expiration
                        </label>
                        <input 
                          type="text"
                          name="expiryDate"
                          value={cardForm.expiryDate}
                          onChange={handleCardFormChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition font-mono text-slate-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">
                          CVV
                        </label>
                        <input 
                          type="text"
                          name="cvv"
                          value={cardForm.cvv}
                          onChange={handleCardFormChange}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:border-blue-500 focus:bg-white transition font-mono text-slate-700"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setShowAddCard(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-700 px-6 py-3 rounded-xl font-black transition"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        disabled={cardLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-3 rounded-xl font-black transition flex items-center justify-center gap-2"
                      >
                        {cardLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : null}
                        {cardLoading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}