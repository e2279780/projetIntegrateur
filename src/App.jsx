import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import Navbar from './components/Navbar';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';

// Services et Contexte
import { authService } from './services'; 
import { useUser } from './context/useUser';

// Pages
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Frais from './pages/Frais';
import Admin from './pages/Admin';
import BookDetail from './pages/BookDetail'; 
import InitBooks from './pages/InitBooks'; 

export default function App() {
  // Utilisation exclusive du contexte pour la source de vérité
  const { user, loading: authLoading, role } = useUser();
  const isLoggedIn = !!user;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Gestion du Toast de déconnexion
  useEffect(() => {
    if (showLogoutToast) {
      const timer = setTimeout(() => setShowLogoutToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showLogoutToast]);

  /**
   * handleLogout - Déconnexion réelle via Firebase
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Appel au service Firebase pour détruire la session
      await authService.logout(); 
      
      // Le UserProvider détectera automatiquement le changement via onAuthChange
      setTimeout(() => {
        setIsLoggingOut(false);
        setShowLogoutToast(true);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setIsLoggingOut(false);
    }
  };

  const handleBorrowSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Bloquer le rendu tant que Firebase n'a pas confirmé l'état de l'utilisateur
  if (authLoading || isLoggingOut) {
    return <Loading message={isLoggingOut ? "Déconnexion sécurisée..." : "BiblioConnect charge..."} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col font-sans relative">
        
        {/* Toast de confirmation de déconnexion */}
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
            {/* Routes Publiques */}
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} userId={user?.uid} onBorrow={handleBorrowSuccess} />} />
            <Route path="/inventory" element={<Inventory isLoggedIn={isLoggedIn} userId={user?.uid} onBorrow={handleBorrowSuccess} />} />
            <Route path="/book/:bookId" element={<BookDetail isLoggedIn={isLoggedIn} userId={user?.uid} />} />
            <Route path="/frais" element={<Frais />} />
            
            {/* Authentification : Redirection si déjà connecté */}
            <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to={role === 'Bibliothécaire' ? "/admin" : "/dashboard"} />} />
            <Route path="/signup" element={!isLoggedIn ? <Signup /> : <Navigate to={role === 'Bibliothécaire' ? "/admin" : "/dashboard"} />} />
            
            {/* Routes Protégées (Utilisateur standard) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard user={user} userId = {user?.uid} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile user={user} />
              </ProtectedRoute>
            } />

            {/* Routes Protégées (Administrateur uniquement) */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            } />

            <Route path="/init-books" element={
              <ProtectedRoute adminOnly={true}>
                <InitBooks />
              </ProtectedRoute>
            } />

            {/* Redirection par défaut */}
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