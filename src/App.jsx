import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Import des composants
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';

// Import des pages
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Frais from './pages/Frais';
import Checkout from './pages/Checkout'; // Import de la page de paiement du panier

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  
  // Code promo pour le Collège de Maisonneuve
  const [promoCode, setPromoCode] = useState({ 
    code: "MAISONNEUVE20", 
    discount: 0.20, 
    active: false 
  });

  // Simulation du chargement initial (2 secondes)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Gestion de l'affichage du toast de déconnexion
  useEffect(() => {
    if (showLogoutToast) {
      const timer = setTimeout(() => setShowLogoutToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showLogoutToast]);

  // Logique de connexion (simulée)
  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setUser({ 
      email, 
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) 
    });
    setShowLogoutToast(false);
  };

  // Logique de déconnexion avec animation
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setUser(null);
      setCart([]);
      setIsLoggingOut(false);
      setShowLogoutToast(true);
    }, 1500);
  };

  // Gestion du panier
  const addToCart = (book, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === book.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...book, quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const applyPromo = (inputCode) => {
    if (inputCode.toUpperCase() === promoCode.code) {
      setPromoCode({ ...promoCode, active: true });
      return true;
    }
    return false;
  };

  if (loading || isLoggingOut) {
    return <Loading message={isLoggingOut ? "Déconnexion sécurisée..." : "BiblioConnect charge..."} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
        
        {/* Toast de succès de déconnexion */}
        {showLogoutToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border border-slate-700/50">
              <div className="bg-emerald-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
              </div>
              <div>
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400">Succès</p>
                <p className="font-bold text-sm tracking-tight">Vous avez été déconnecté avec succès.</p>
              </div>
            </div>
          </div>
        )}

        <Navbar 
          isLoggedIn={isLoggedIn} 
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
          user={user} 
          onLogout={handleLogout} 
        />

        <main className="flex-1 flex flex-col">
          <Routes>
            {/* ROUTES PUBLIQUES */}
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} addToCart={addToCart} />} />
            <Route path="/inventory" element={<Inventory isLoggedIn={isLoggedIn} addToCart={addToCart} />} />
            <Route path="/login" element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!isLoggedIn ? <Signup onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            
            {/* Page des frais en public pour test visuel */}
            <Route path="/frais" element={<Frais />} />

            {/* ROUTES PROTÉGÉES */}
            <Route path="/dashboard" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Profile user={user} />
              </ProtectedRoute>
            } />

            {/* Page de paiement du panier liée à l'US05 */}
            <Route path="/checkout" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Checkout cartItems={cart} />
              </ProtectedRoute>
            } />

            <Route path="/cart" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Cart 
                  cartItems={cart} 
                  onRemove={removeFromCart} 
                  onUpdateQuantity={updateQuantity}
                  promo={promoCode}
                  onApplyPromo={applyPromo}
                />
              </ProtectedRoute>
            } />

            {/* Redirection automatique */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="bg-white border-t py-10 text-center text-slate-400 text-xs font-medium tracking-widest uppercase">
          <p>&copy; 2026 BiblioConnect - Projet Intégrateur Maisonneuve</p>
        </footer>
      </div>
    </Router>
  );
}