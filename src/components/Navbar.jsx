import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook, 
  faShoppingCart, 
  faUserCircle, 
  faSignOutAlt, 
  faChalkboardTeacher,
  faBars,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ isLoggedIn, cartCount, user, onLogout }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[100] backdrop-blur-xl border-b border-white/10">
      {/* Effet de gradient en arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900/50 to-slate-900 opacity-95"></div>
      
      <div className="relative container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo avec Animation */}
        <Link 
          to="/" 
          className="text-2xl font-black tracking-tighter flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-slate-900 rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300">
              <FontAwesomeIcon icon={faBook} className="text-white" size="lg" />
            </div>
          </div>
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-gradient-shift inline-block">
            BIBLIOCONNECT
          </span>
        </Link>

        {/* Liens Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          <Link 
            to="/" 
            className="text-white/80 hover:text-white font-semibold text-sm transition duration-300 hover:scale-110 inline-block"
          >
            📚 Catalogue
          </Link>
          
          {isLoggedIn ? (
            <>
              {/* Notification Center */}
              <div className="relative">
                <NotificationCenter userId={user?.uid} />
              </div>

              {/* Panier avec Badge Animé */}
              <Link 
                to="/cart" 
                className="relative group"
              >
                <div className="p-2.5 rounded-2xl hover:bg-white/10 transition duration-300 relative">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-white text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black rounded-full h-6 w-6 flex items-center justify-center border-2 border-slate-900 shadow-lg shadow-red-500/50 animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Menu Profil Moderne */}
              <div className="group relative">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-400/30 group-hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                  <FontAwesomeIcon icon={faUserCircle} className="text-lg" /> 
                  <span className="truncate max-w-[110px] text-xs sm:text-sm">
                    {user?.firstName || user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                  </span>
                </button>

                {/* Dropdown Menu Elegant */}
                <div className="absolute right-0 mt-2 pt-2 w-56 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-[110]">
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl py-3 border border-white/30 overflow-hidden">
                    
                    {/* Admin Link */}
                    {user?.role === 'Bibliothécaire' && (
                      <Link 
                        to="/admin" 
                        className="block px-5 py-3 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 hover:from-purple-100 hover:to-blue-100 font-black text-xs uppercase tracking-widest transition-all duration-200 border-b border-purple-100 hover:border-purple-200 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faChalkboardTeacher} /> 
                        Espace Admin
                      </Link>
                    )}

                    <Link 
                      to="/profile" 
                      className="block px-5 py-3 text-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 font-bold text-sm transition-all duration-200 flex items-center gap-2 group/item"
                    >
                      <span className="text-blue-500">👤</span> Mon Profil
                    </Link>
                    
                    <Link 
                      to="/dashboard" 
                      className="block px-5 py-3 text-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 font-bold text-sm transition-all duration-200 flex items-center gap-2 group/item"
                    >
                      <span className="text-blue-500">📊</span> Tableau de bord
                    </Link>

                    <button 
                      onClick={() => { onLogout(); navigate('/'); setMobileMenuOpen(false); }} 
                      className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50/80 font-bold text-sm border-t border-white/50 flex items-center gap-2 transition-all duration-200 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} /> Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Link 
                to="/login" 
                className="px-5 py-2.5 rounded-xl text-white/90 hover:text-white font-bold transition duration-300 hover:bg-white/10"
              >
                Connexion
              </Link>
              <Link 
                to="/signup" 
                className="px-5 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* Bouton Mobile Menu */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white text-2xl hover:bg-white/10 p-2 rounded-lg transition duration-300"
        >
          <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden relative bg-slate-800/95 backdrop-blur-xl border-t border-white/10 p-4 space-y-4 animate-slide-down">
          <Link 
            to="/" 
            className="block text-white font-semibold text-sm hover:text-blue-400 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            📚 Catalogue
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link 
                to="/profile" 
                className="block text-white font-semibold text-sm hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 Mon Profil
              </Link>
              <Link 
                to="/dashboard" 
                className="block text-white font-semibold text-sm hover:text-blue-400 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                📊 Tableau de bord
              </Link>
              {user?.role === 'Bibliothécaire' && (
                <Link 
                  to="/admin" 
                  className="block text-purple-400 font-semibold text-sm hover:text-purple-300 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⚙️ Espace Admin
                </Link>
              )}
              <button 
                onClick={() => { onLogout(); navigate('/'); setMobileMenuOpen(false); }} 
                className="w-full text-left text-red-400 font-semibold text-sm hover:text-red-300 transition"
              >
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link 
                to="/login" 
                className="flex-1 px-4 py-2 rounded-lg text-white/90 font-bold text-center border border-white/20 hover:bg-white/10 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link 
                to="/signup" 
                className="flex-1 px-4 py-2 rounded-lg font-black text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
