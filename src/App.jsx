import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import Navbar from './components/Navbar';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Frais from './pages/Frais';
import Admin from './pages/Admin';
import BookDetail from './pages/BookDetail'; // Page de détail d'un livre avec ElegantCarousel
import InitBooks from './pages/InitBooks'; // Page d'initialisation de la base de données

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showLogoutToast) {
      const timer = setTimeout(() => setShowLogoutToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showLogoutToast]);

  const handleLogin = (email, role = 'Membre') => {
    // 1. Sécurité : si l'email n'existe pas, on arrête tout
    if (!email || typeof email !== 'string') return;

    setIsLoggedIn(true);
    
    // 2. Sécurité : on vérifie la présence du @ avant de découper
    const emailPrefix = email.includes('@') ? email.split('@')[0] : "Utilisateur";
    const formattedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    setUser({ 
      email: email, 
      role: role,
      name: formattedName 
    });
    setShowLogoutToast(false);
  };

  // --- NOUVEAU : Fonction pour mettre à jour l'user dans le state global ---
  const handleUpdateUser = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setUser(null);
      setIsLoggingOut(false);
      setShowLogoutToast(true);
    }, 1500);
  };

  const handleBorrowSuccess = () => {
    // Rafraîchir les emprunts du Dashboard
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading || isLoggingOut) {
    return <Loading message={isLoggingOut ? "Déconnexion sécurisée..." : "BiblioConnect charge..."} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
        
        {showLogoutToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border border-slate-700/50">
              <div className="bg-emerald-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
              </div>
              <div>
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400">Succès</p>
                <p className="font-bold text-sm tracking-tight">Vous avez été déconnecté.</p>
              </div>
            </div>
          </div>
        )}

        <Navbar 
          isLoggedIn={isLoggedIn} 
          user={user} 
          onLogout={handleLogout} 
        />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} userId={user?.email} onBorrow={handleBorrowSuccess} />} />
            <Route path="/inventory" element={<Inventory isLoggedIn={isLoggedIn} userId={user?.email} onBorrow={handleBorrowSuccess} />} />
            <Route path="/book/:bookId" element={<BookDetail />} />
            
            <Route path="/login" element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to={user?.role === 'Bibliothécaire' ? "/admin" : "/dashboard"} />} />
            <Route path="/signup" element={!isLoggedIn ? <Signup onLogin={handleLogin} /> : <Navigate to={user?.role === 'Bibliothécaire' ? "/admin" : "/dashboard"} />} />
            
            <Route path="/frais" element={<Frais />} />

            <Route path="/dashboard" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard user={user} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                {user?.role === 'Bibliothécaire' ? <Admin /> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                {/* Passage de handleUpdateUser pour que le profil puisse mettre à jour App.jsx */}
                <Profile user={user} onUpdateUser={handleUpdateUser} />
              </ProtectedRoute>
            } />

            <Route path="/init-books" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <InitBooks />
              </ProtectedRoute>
            } />

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