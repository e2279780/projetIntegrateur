import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faLock, faCheckCircle, faArrowLeft, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

export default function Checkout({ cartItems }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  // On utilise le prix fixe de 15.99 $ défini dans ton Cart.jsx
  const unitPrice = 15.99;
  const total = cartItems.reduce((acc, item) => acc + (unitPrice * item.quantity), 0);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulation du délai de transaction
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
    }, 2500);
  };

  if (isPaid) {
    return (
      <div className="max-w-md mx-auto mt-20 p-12 bg-white rounded-[3.5rem] text-center shadow-2xl border border-gray-100 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
          <FontAwesomeIcon icon={faCheckCircle} size="2x" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-4 leading-none">Achat Terminé</h2>
        <p className="text-slate-500 font-medium mb-8">Vos livres sont maintenant disponibles dans votre Dashboard.</p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all"
        >
          Voir mes livres
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 font-sans">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-12 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Retour au panier
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* RÉCAPITULATIF DE LA COMMANDE CORRIGÉ */}
        <div className="space-y-10">
          <h1 className="text-6xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
            Finaliser <br/><span className="text-blue-600">l'achat</span>
          </h1>
          
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 italic">Articles dans la commande</h3>
            
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-6">
                  {/* Accès correct à volumeInfo pour l'image */}
                  <div className="w-16 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-50">
                    <img 
                      src={item.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/150'} 
                      className="w-full h-full object-cover"
                      alt={item.volumeInfo?.title}
                    />
                  </div>
                  <div className="flex-1">
                    {/* Accès correct à volumeInfo pour le titre */}
                    <h4 className="font-black text-slate-800 text-sm leading-tight line-clamp-2">{item.volumeInfo?.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Quantité: {item.quantity}</p>
                  </div>
                  <p className="font-black text-slate-900 text-sm whitespace-nowrap">
                    {(unitPrice * item.quantity).toFixed(2)} $
                  </p>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100 my-8"></div>
            
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total</span>
                <p className="text-4xl font-black text-slate-900 leading-none mt-1">{total.toFixed(2)} $</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                <FontAwesomeIcon icon={faShieldAlt} /> Sécurisé
              </div>
            </div>
          </div>
        </div>

        {/* FORMULAIRE DE PAIEMENT */}
        <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <form onSubmit={handlePayment} className="relative z-10 space-y-8">
            <div className="flex justify-between items-center mb-4">
              <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-2xl" />
              <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest italic flex items-center gap-2">
                <FontAwesomeIcon icon={faLock} /> BiblioConnect Pay
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-3">Détenteur</label>
                <input type="text" placeholder="NOM COMPLET" className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition uppercase text-white" required />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-3">Numéro de carte</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <input type="text" placeholder="MM/YY" className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition text-white" required />
                <input type="text" placeholder="CVC" className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition text-white" required />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing} 
              className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4 ${
                isProcessing ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-95'
              }`}
            >
              {isProcessing ? "Validation..." : `Confirmer l'achat - ${total.toFixed(2)} $`}
            </button>
          </form>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
}