import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    // On simule la connexion
    onLogin(email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-gray-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
            <FontAwesomeIcon icon={faSignInAlt} size="xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Bon retour !</h2>
          <p className="text-slate-500 font-medium">Heureux de vous revoir sur BiblioConnect.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                placeholder="nom@exemple.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Mot de passe</label>
              <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Oublié ?</a>
            </div>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition transform active:scale-[0.98] shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
            SE CONNECTER <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-500 font-medium">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-blue-600 font-black hover:underline">
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}