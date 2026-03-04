import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faEnvelope, faLock, faUserPlus, 
  faArrowRight, faExclamationCircle 
} from '@fortawesome/free-solid-svg-icons';
import { authService } from '../services';

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [role] = useState('Membre');

  const validate = (values) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.firstName.trim()) errors.firstName = "Requis";
    else if (values.firstName.length < 2) errors.firstName = "Trop court";

    if (!values.lastName.trim()) errors.lastName = "Requis";

    if (!values.email) errors.email = "Requis";
    else if (!emailRegex.test(values.email)) errors.email = "Format invalide";

    if (!values.password) errors.password = "Requis";
    else if (values.password.length < 6) errors.password = "6 caractères min.";

    return errors;
  };

  const handleNavigation = (selectedRole) => {
    if (selectedRole === 'Bibliothécaire') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = {
      firstName: e.target.firstName.value,
      lastName: e.target.lastName.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    setFieldErrors({});

    try {
      await authService.signup(
        formData.email, 
        formData.password, 
        formData.firstName, 
        formData.lastName, 
        role
      );
      
      // On passe l'email ET le rôle au state global de App.js
      onLogin(formData.email, role);
      handleNavigation(role);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription.");
      setLoading(false);
    }
  };

  const handleSignupGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.signupWithGoogle(role);
      // On passe l'email de Google et le rôle choisi
      onLogin(user.email, role);
      handleNavigation(role);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 relative overflow-hidden">
      {/* Effets d'arrière-plan */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-20"></div>

      <div className="relative max-w-lg w-full">
        {/* Carte d'inscription moderne */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 animate-fade-in-scale">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-xl opacity-75"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl">
                <FontAwesomeIcon icon={faUserPlus} className="text-white" size="2x" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 leading-tight">Rejoignez-nous !</h1>
              <p className="text-slate-500 font-medium mt-2">Créez votre compte en quelques secondes</p>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider ml-1 flex justify-between items-center">
                  Prénom 
                  {fieldErrors.firstName && <span className="text-[9px] text-red-500 font-bold">⚠ {fieldErrors.firstName}</span>}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                  <div className="relative bg-slate-50 border-2 border-slate-200 group-focus-within:border-blue-400 rounded-2xl transition duration-300 flex items-center px-4">
                    <FontAwesomeIcon icon={faUser} className="text-slate-400 group-focus-within:text-blue-600 transition duration-300" />
                    <input 
                      name="firstName"
                      type="text" 
                      className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 transition duration-300 disabled:opacity-50"
                      placeholder="Jean"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider ml-1 flex justify-between items-center">
                  Nom
                  {fieldErrors.lastName && <span className="text-[9px] text-red-500 font-bold">⚠ {fieldErrors.lastName}</span>}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                  <div className="relative bg-slate-50 border-2 border-slate-200 group-focus-within:border-blue-400 rounded-2xl transition duration-300 flex items-center px-4">
                    <FontAwesomeIcon icon={faUser} className="text-slate-400 group-focus-within:text-blue-600 transition duration-300" />
                    <input 
                      name="lastName"
                      type="text" 
                      className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 transition duration-300 disabled:opacity-50"
                      placeholder="Dupont"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider ml-1 flex justify-between items-center">
                Email
                {fieldErrors.email && <span className="text-[9px] text-red-500 font-bold">⚠ {fieldErrors.email}</span>}
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                <div className="relative bg-slate-50 border-2 border-slate-200 group-focus-within:border-blue-400 rounded-2xl transition duration-300 flex items-center px-4">
                  <FontAwesomeIcon icon={faEnvelope} className="text-slate-400 group-focus-within:text-blue-600 transition duration-300" />
                  <input 
                    name="email"
                    type="email" 
                    className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 transition duration-300 disabled:opacity-50"
                    placeholder="jean@exemple.com"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider ml-1 flex justify-between items-center">
                Mot de passe
                {fieldErrors.password && <span className="text-[9px] text-red-500 font-bold">⚠ {fieldErrors.password}</span>}
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                <div className="relative bg-slate-50 border-2 border-slate-200 group-focus-within:border-blue-400 rounded-2xl transition duration-300 flex items-center px-4">
                  <FontAwesomeIcon icon={faLock} className="text-slate-400 group-focus-within:text-blue-600 transition duration-300" />
                  <input 
                    name="password"
                    type="password"
                    className="w-full pl-3 pr-3 py-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 transition duration-300 disabled:opacity-50"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50/80 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-2xl flex items-center gap-3 animate-slide-down">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-lg" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton Inscription */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 rounded-2xl font-black text-lg transition-all duration-300 transform active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-3 disabled:shadow-none disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Inscription en cours...
                </>
              ) : (
                <>
                  CRÉER MON COMPTE
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          </div>

          {/* Google Auth */}
          <button
            onClick={handleSignupGoogle}
            disabled={loading}
            className="w-full border-2 border-slate-200 hover:border-blue-400 text-slate-800 py-4 rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed bg-white/50 hover:bg-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Google...' : 'GOOGLE'}
          </button>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-slate-600 font-medium">
              Déjà inscrit ?
              <Link to="/login" className="ml-2 font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent hover:opacity-80 transition">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}