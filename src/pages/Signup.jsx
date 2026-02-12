import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function Signup({ onLogin }) {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    // On simule l'inscription et la connexion auto
    onLogin(email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200 border border-gray-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <FontAwesomeIcon icon={faUserPlus} size="xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Rejoignez-nous</h2>
          <p className="text-slate-500 font-medium">Commencez votre voyage littéraire dès aujourd'hui.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Nom complet</label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  name="email"
                  type="email" 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="john@doe.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <FontAwesomeIcon icon={faCheckCircle} />
              Accès immédiat au catalogue
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <FontAwesomeIcon icon={faCheckCircle} />
              Premier emprunt gratuit
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition transform active:scale-[0.98] shadow-xl shadow-blue-100 mt-4">
            CRÉER MON COMPTE
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-slate-900 font-black hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}