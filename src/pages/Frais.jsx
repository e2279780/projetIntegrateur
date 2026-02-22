import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faCheckCircle, faLock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Frais() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
    }, 2000);
  };

  if (isPaid) {
    return (
      <div className="max-w-md mx-auto mt-20 p-12 bg-white rounded-[3.5rem] text-center shadow-2xl border border-gray-100 animate-in zoom-in">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100">
          <FontAwesomeIcon icon={faCheckCircle} size="2x" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-4 leading-none">Paiement Réussi</h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">Votre solde a été mis à jour. Votre compte est de nouveau actif.</p>
        <button onClick={() => navigate('/dashboard')} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Retour au Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 font-sans">
      <button onClick={() => navigate(-1)} className="mb-12 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition">
        <FontAwesomeIcon icon={faArrowLeft} /> Annuler le paiement
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-10">
          <h1 className="text-6xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Régler mes <br/><span className="text-red-500 underline decoration-8 decoration-red-100">frais</span></h1>
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
               <span className="font-bold text-slate-800 uppercase text-xs tracking-widest italic leading-none">Retard The Pragmatic Programmer</span>
               <span className="font-black text-red-500 text-2xl">2.50 $</span>
             </div>
             <div className="h-px bg-gray-100 mb-8"></div>
             <div className="flex justify-between items-end">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total à payer</span>
               <span className="text-4xl font-black text-slate-900 leading-none">2.50 $</span>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <form onSubmit={handlePayment} className="relative z-10 space-y-8">
            <div className="flex justify-between items-center">
              <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-2xl" />
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600 tracking-widest italic">
                <FontAwesomeIcon icon={faLock} /> Secure Checkout
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-3">Numéro de carte</label>
                <input type="text" placeholder="**** **** **** ****" className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-3">Expiration</label>
                  <input type="text" placeholder="MM/YY" className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-3">CVC</label>
                  <input type="text" placeholder="***" className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isProcessing} className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4 ${isProcessing ? 'bg-slate-700 opacity-50' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-95'}`}>
              {isProcessing ? "Traitement..." : "Confirmer le paiement"}
            </button>
          </form>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}