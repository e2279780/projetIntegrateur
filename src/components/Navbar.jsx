import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faShoppingCart, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function Navbar({ isLoggedIn, cartCount, user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-[100] shadow-xl">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <FontAwesomeIcon icon={faBook} className="text-blue-500" /> BIBLIOCONNECT
        </Link>

        {/* Liens et Actions */}
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-blue-400 transition font-medium">Catalogue</Link>
          
          {isLoggedIn ? (
            <>
              {/* Panier */}
              <Link to="/cart" className="relative p-2 hover:bg-slate-800 rounded-full transition">
                <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-slate-900">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Menu Profil - CORRIGÉ */}
              <div className="group relative">
                {/* Bouton Profil */}
                <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700 transition border border-slate-700">
                  <FontAwesomeIcon icon={faUserCircle} className="text-lg text-blue-400" /> 
                  <span className="capitalize font-bold text-sm">{user?.name}</span>
                </button>

                {/* Le menu déroulant avec le pont invisible (pt-2) */}
                <div className="absolute right-0 mt-0 pt-2 w-48 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-[110]">
                  <div className="bg-white text-slate-900 rounded-2xl shadow-2xl py-2 border border-gray-100 overflow-hidden">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition"
                    >
                      Mon Profil
                    </Link>
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-600 font-bold text-sm transition"
                    >
                      Tableau de bord
                    </Link>
                    <button 
                      onClick={() => { onLogout(); navigate('/'); }} 
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-bold text-sm border-t border-gray-50 flex items-center gap-2 transition"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} /> Quitter
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-4 py-2 rounded-xl hover:bg-slate-800 transition font-bold">Connexion</Link>
              <Link to="/signup" className="bg-blue-600 px-5 py-2 rounded-xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">S'inscrire</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}