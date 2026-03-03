import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faArrowLeft, 
  faTrash, 
  faPlus, 
  faMinus,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/useCart';
import { databaseService } from '../services';

export default function Cart({ isLoggedIn, userId }) {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardInfo, setCardInfo] = useState(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Charger les informations de carte
  React.useEffect(() => {
    const loadCardInfo = async () => {
      try {
        if (!isLoggedIn || !userId) {
          setCardInfo(null);
          setCardLoading(false);
          return;
        }
        
        const info = await databaseService.getCardInfo(userId);
        setCardInfo(info);
      } catch (err) {
        console.error('Erreur lors du chargement de la carte:', err);
      } finally {
        setCardLoading(false);
      }
    };

    loadCardInfo();
  }, [isLoggedIn, userId]);

  const handleCheckout = async () => {
    setError('');
    setIsProcessing(true);

    try {
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }

      if (!cardInfo || !cardInfo.isConfigured) {
        setError('Veuillez configurer une carte bancaire dans votre profil');
        setIsProcessing(false);
        return;
      }

      if (cartItems.length === 0) {
        setError('Votre panier est vide');
        setIsProcessing(false);
        return;
      }

      // Acheter tous les livres du panier
      for (const item of cartItems) {
        await databaseService.purchaseBook(userId, item.id);
      }

      // Vider le panier
      clearCart();
      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Commande finalisée!</h2>
          <p className="text-slate-600 font-bold mb-6">Vos livres ont été ajoutés à votre bibliothèque</p>
          <p className="text-slate-500">Vous serez redirigé au tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Retour
        </button>
        <h1 className="text-4xl font-black text-slate-900 italic uppercase">Mon Panier</h1>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-black text-sm">
          {getTotalItems()} article{getTotalItems() > 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenu du panier */}
        <div className="lg:col-span-2">
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faShoppingCart} className="text-2xl text-slate-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Panier vide</h2>
              <p className="text-slate-500 mb-6">Ajoutez des livres pour commencer vos achats</p>
              <Link
                to="/inventory"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Découvrir les livres
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-6">
                  {/* Image */}
                  <img
                    src={item.coverImageUrl || 'https://placehold.co/150x200?text=Livre'}
                    alt={item.title}
                    className="w-24 h-32 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/150x200?text=Livre';
                    }}
                  />

                  {/* Infos */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-800">{item.title}</h3>
                        <p className="text-sm font-bold text-blue-600">{item.author}</p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Supprimer"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-lg" />
                      </button>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-lg flex items-center justify-center transition"
                          disabled={item.quantity <= 1}
                        >
                          <FontAwesomeIcon icon={faMinus} className="text-xs" />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-lg flex items-center justify-center transition"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-500 mb-1">${item.price.toFixed(2)} chacun</p>
                        <p className="text-lg font-black text-blue-600">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Résumé et paiement */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-20">
            <h3 className="text-lg font-black text-slate-800 mb-6">Résumé de commande</h3>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Sous-total</span>
                <span className="font-bold text-slate-900">${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Frais de port</span>
                <span className="font-bold text-slate-900">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Taxes</span>
                <span className="font-bold text-slate-900">$0.00</span>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <span className="text-lg font-black text-slate-900">Total</span>
              <span className="text-2xl font-black text-blue-600">${getTotalPrice().toFixed(2)}</span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 flex items-center gap-2 text-sm font-bold">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {error}
              </div>
            )}

            {!isLoggedIn ? (
              <Link
                to="/login"
                className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black text-center hover:bg-blue-700 transition block"
              >
                Se connecter pour acheter
              </Link>
            ) : cardLoading ? (
              <button disabled className="w-full bg-blue-400 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                Chargement...
              </button>
            ) : cardInfo && cardInfo.isConfigured ? (
              <>
                <div className="bg-slate-100 p-3 rounded-xl mb-4 text-sm">
                  <p className="text-slate-600 font-bold mb-1">Paiement</p>
                  <p className="font-mono text-slate-900">•••• {cardInfo.cardNumber}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-2xl font-black hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Paiement en cours...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Finaliser la commande
                    </>
                  )}
                </button>
              </>
            ) : (
              <Link
                to="/profile"
                className="w-full bg-orange-600 text-white py-3 rounded-2xl font-black text-center hover:bg-orange-700 transition block"
              >
                Configurer votre carte
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
