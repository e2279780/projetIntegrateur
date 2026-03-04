import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faCheckCircle, faLock, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { databaseService } from '../services';
import Loading from '../components/Loading';

export default function Frais({ isLoggedIn, userId }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overdueCharges, setOverdueCharges] = useState([]);
  const [adminFees, setAdminFees] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState('');
  const [cardInfo, setCardInfo] = useState(null);
  const [cardLoading, setCardLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!isLoggedIn || !userId) {
          navigate('/login');
          return;
        }

        // Obtenir les frais en retard et administratifs
        const charges = await databaseService.checkUserOutstandingCharges(userId);
        setTotalAmount(charges.totalCharges);
        
        // Charger les détails des livres pour les retards
        const chargesWithBooks = await Promise.all(
          (charges.overdueBooks || []).map(async (charge) => {
            try {
              const book = await databaseService.getBookById(charge.bookId);
              return {
                ...charge,
                bookTitle: book.title,
                bookAuthor: book.author,
                bookCover: book.coverImageUrl
              };
            } catch {
              return charge;
            }
          })
        );
        
        setOverdueCharges(chargesWithBooks);
        setAdminFees(charges.adminFees || []);

        // Charger les informations de carte
        const card = await databaseService.getCardInfo(userId);
        setCardInfo(card);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setCardLoading(false);
      }
    };

    loadData();
  }, [isLoggedIn, userId, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      // Payer tous les types de frais
      await databaseService.payOverdueCharges(userId);
      await databaseService.payAdminFees(userId);
      setIsPaid(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors du paiement');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl text-center max-w-md">
          <p>Veuillez vous connecter pour voir vos frais</p>
          <button onClick={() => navigate('/login')} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl font-bold">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (totalAmount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Aucun frais en retard</h2>
          <p className="text-slate-600 font-bold mb-6">Votre compte est à jour</p>
          <button onClick={() => navigate('/dashboard')} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Paiement Réussi</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">Vos frais ont été payés. Vous pouvez maintenant emprunter d'autres livres.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Retour au Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 font-sans">
      <button onClick={() => navigate(-1)} className="mb-12 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition">
        <FontAwesomeIcon icon={faArrowLeft} /> Annuler
      </button>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-10">
          <div>
            <h1 className="text-6xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
              Frais de <br/><span className="text-red-500 underline decoration-8 decoration-red-100">retard</span>
            </h1>
            <p className="text-slate-500 mt-4 text-sm">
            Vous avez {overdueCharges.length} livre(s) en retard
            {adminFees.length > 0 && ` et ${adminFees.length} frais administratifs`}.
          </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {overdueCharges.map((charge, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition">
                <div className="flex gap-4">
                  {charge.bookCover && (
                    <img src={charge.bookCover} alt={charge.bookTitle} className="w-16 h-24 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{charge.bookTitle || 'Livre'}</h3>
                    <p className="text-xs text-slate-500 mb-3">{charge.bookAuthor || 'Auteur'}</p>
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] text-red-600 font-bold">
                        <span>{charge.daysOverdue} jour{charge.daysOverdue > 1 ? 's' : ''} de retard</span>
                      </div>
                      <span className="font-black text-red-600 text-lg">{charge.lateFees.toFixed(2)}$</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total à payer</span>
              <span className="text-4xl font-black text-red-600 leading-none">{totalAmount.toFixed(2)}$</span>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              {adminFees.length > 0 ?
                'Comprend des frais administratifs en plus des frais de retard.' :
                'À raison de 1,50$ par jour de retard'
              }
            </p>
          </div>
        </div>

        {/* Section de paiement */}
        {cardLoading ? (
          <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl flex items-center justify-center min-h-96">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : cardInfo && cardInfo.isConfigured ? (
          <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <form onSubmit={handlePayment} className="relative z-10 space-y-8">
              <div className="flex justify-between items-center">
                <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-2xl" />
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600 tracking-widest italic">
                  <FontAwesomeIcon icon={faLock} /> Secure Checkout
                </div>
              </div>
              
              <div className="bg-slate-800 p-6 rounded-2xl">
                <p className="text-xs text-slate-400 mb-2">Carte enregistrée</p>
                <p className="text-sm font-bold">{cardInfo.cardNumber}</p>
              </div>

              <button type="submit" disabled={isProcessing} className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4 ${isProcessing ? 'bg-slate-700 opacity-50' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-95'}`}>
                {isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Payer ${totalAmount.toFixed(2)}$`
                )}
              </button>
            </form>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-12 rounded-[4rem] shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <FontAwesomeIcon icon={faCreditCard} className="text-4xl text-amber-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Carte bancaire requise</h3>
                <p className="text-slate-600 text-sm mb-6">Vous devez configurer une carte bancaire sur votre profil pour pouvoir régler vos frais de retard.</p>
              </div>

              <button 
                onClick={() => navigate('/profile')} 
                className="w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg active:scale-95"
              >
                Configurer une carte
              </button>

              <button 
                onClick={() => navigate(-1)} 
                className="w-full py-4 rounded-3xl font-black text-xs uppercase tracking-[0.3em] bg-slate-200 hover:bg-slate-300 text-slate-900 transition-all"
              >
                Annuler
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl"></div>
          </div>
        )}
      </div>
    </div>
  );
}