import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrashAlt, faShoppingBag, faPlus, faMinus, 
  faCreditCard, faTicketAlt, faCheckCircle, faExclamationCircle 
} from '@fortawesome/free-solid-svg-icons';

export default function Cart({ cartItems, onUpdateQuantity, promo, onApplyPromo }) {
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState(false);
  
  const unitPrice = 15.99; 
  const subtotal = cartItems.reduce((acc, item) => acc + (unitPrice * item.quantity), 0);
  const discountAmount = promo.active ? subtotal * promo.discount : 0;
  const total = subtotal - discountAmount;

  const handleApplyPromo = () => {
    const success = onApplyPromo(promoInput);
    if (!success) {
      setPromoError(true);
      setTimeout(() => setPromoError(false), 3000);
    }
    setPromoInput("");
  };

  // Extraction des données du livre (supporte les formats Firebase)
  const getBookData = (item) => ({
    title: item.title || 'Titre inconnu',
    author: item.author || 'Auteur inconnu',
    coverUrl: item.coverImageUrl || item.coverUrl || 'https://via.placeholder.com/150?text=Livre'
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-200">
          <FontAwesomeIcon icon={faShoppingBag} size="lg" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Mon Panier</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            {cartItems.reduce((acc, item) => acc + item.quantity, 0)} article(s) au total
          </p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white p-24 rounded-[3.5rem] text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
           <FontAwesomeIcon icon={faShoppingBag} size="4x" className="text-slate-100 mb-6" />
           <p className="text-slate-400 font-black text-xl mb-8 uppercase italic">Votre panier est vide.</p>
           <Link to="/inventory" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition">
             Retour au catalogue
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* LISTE DES ARTICLES */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const bookData = getBookData(item);
              return (
                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-xl transition-all duration-300">
                  <img 
                    src={bookData.coverUrl} 
                    className="w-28 h-40 object-cover rounded-2xl shadow-lg" 
                    alt={bookData.title}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Livre'; }}
                  />
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-black text-slate-800 text-xl leading-tight mb-1">{bookData.title}</h3>
                    <p className="text-blue-600 font-bold text-sm mb-4 uppercase tracking-wider">{bookData.author}</p>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Prix unitaire: {unitPrice} $</p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition text-slate-400 hover:text-red-500"
                      >
                        <FontAwesomeIcon icon={item.quantity > 1 ? faMinus : faTrashAlt} />
                      </button>
                      <span className="w-12 text-center font-black text-slate-800">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition text-slate-400 hover:text-blue-600"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    <p className="font-black text-slate-900 italic">{(unitPrice * item.quantity).toFixed(2)} $</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RÉCAPITULATIF ET PAIEMENT */}
          <div className="space-y-6 sticky top-28">
            <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <h2 className="text-2xl font-black mb-8 tracking-tight relative z-10 uppercase italic">Récapitulatif</h2>
              
              <div className="mb-8 relative z-10">
                <div className="flex bg-slate-800 rounded-2xl p-1.5 border border-slate-700 items-center overflow-hidden">
                  <input 
                    type="text" 
                    placeholder="CODE PROMO" 
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="bg-transparent flex-1 px-4 py-2 text-[10px] font-black outline-none uppercase text-white min-w-0"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg active:scale-95 whitespace-nowrap"
                  >
                    Appliquer
                  </button>
                </div>
                
                <div className="mt-2 min-h-[20px]">
                  {promo.active && (
                    <p className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} /> Code "{promo.code}" appliqué (-20%)
                    </p>
                  )}
                  {promoError && (
                    <p className="text-red-400 text-[10px] font-black uppercase flex items-center gap-2">
                      <FontAwesomeIcon icon={faExclamationCircle} /> Code invalide
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} $</span>
                </div>
                {promo.active && (
                  <div className="flex justify-between text-emerald-400 font-bold text-xs uppercase tracking-widest italic">
                    <span>Réduction</span>
                    <span>-{discountAmount.toFixed(2)} $</span>
                  </div>
                )}
                <div className="h-px bg-slate-800 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Total Final</span>
                  <span className="text-4xl font-black text-white italic tracking-tighter">{total.toFixed(2)} $</span>
                </div>
              </div>

              {/* BOUTON MODIFIÉ POUR LA REDIRECTION */}
              <Link 
                to="/checkout" 
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10"
              >
                <FontAwesomeIcon icon={faCreditCard} /> Payer {total.toFixed(2)} $
              </Link>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 text-center">
              <FontAwesomeIcon icon={faTicketAlt} className="text-blue-600 mb-2 opacity-50" />
              <p className="text-blue-900 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Astuce : Utilisez MAISONNEUVE20 <br/> pour obtenir 20% de rabais !
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}