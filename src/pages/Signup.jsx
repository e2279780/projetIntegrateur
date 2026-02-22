import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faUserPlus, faCheckCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { authService } from '../services';

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('Membre'); // ← Ajout du state pour le rôle

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const firstName = e.target.firstName.value;
      const lastName = e.target.lastName.value;
      const email = e.target.email.value;
      const password = e.target.password.value;
      await authService.signup(email, password, firstName, lastName, role); // ← Utiliser le rôle sélectionné
      onLogin(email);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSignupGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.signupWithGoogle(role);
      onLogin(user.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Prénom</label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  name="firstName"
                  type="text" 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Nom</label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  name="lastName"
                  type="text" 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Doe"
                  disabled={loading}
                />
              </div>
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
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="john@doe.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Mot de passe</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                name="password"
                type="password" 
                required 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          {/* Role selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Rôle</label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="Membre"
                  checked={role === 'Membre'}
                  onChange={() => setRole('Membre')}
                  disabled={loading}
                  className="form-radio text-blue-600 h-4 w-4"
                />
                <span className="text-sm font-medium text-slate-700">Membre</span>
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="Bibliothécaire"
                  checked={role === 'Bibliothécaire'}
                  onChange={() => setRole('Bibliothécaire')}
                  disabled={loading}
                  className="form-radio text-blue-600 h-4 w-4"
                />
                <span className="text-sm font-medium text-slate-700">Bibliothécaire</span>
              </label>
            </div>
            <p className="text-xs text-slate-400">Choisissez votre rôle. Les bibliothécaires peuvent gérer l'inventaire.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-bold px-4 py-3 rounded-2xl flex items-center gap-2">
              ❌ {error}
            </div>
          )}

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

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition transform active:scale-[0.98] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Création en cours...' : <>CRÉER MON COMPTE <FontAwesomeIcon icon={faArrowRight} /></>}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm font-bold text-slate-400 uppercase">ou</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleSignupGoogle}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 text-slate-800 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 hover:border-blue-400 transition transform active:scale-[0.98] shadow-lg shadow-slate-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? 'Google en cours...' : 'S\'INSCRIRE AVEC GOOGLE'}
        </button>

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