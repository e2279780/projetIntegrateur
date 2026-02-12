import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

export default function Loading() {
  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
      {/* Icône principale avec animation de rebond */}
      <div className="animate-bounce mb-8">
        <div className="bg-blue-600 p-6 rounded-3xl shadow-2xl shadow-blue-500/20">
          <FontAwesomeIcon icon={faBookOpen} className="text-white text-6xl" />
        </div>
      </div>

      {/* Texte d'onboarding */}
      <h1 className="text-4xl font-black mb-3 tracking-tight">
        Biblio<span className="text-blue-500">Connect</span>
      </h1>
      <p className="text-slate-400 max-w-xs mx-auto mb-10 font-medium">
        Préparation de votre bibliothèque numérique personnalisée...
      </p>

      {/* Spinner de chargement */}
      <div className="flex items-center gap-3 bg-slate-800 px-6 py-3 rounded-full border border-slate-700">
        <FontAwesomeIcon icon={faCircleNotch} spin className="text-blue-500 text-xl" />
        <span className="text-sm font-bold tracking-widest text-slate-300">CHARGEMENT</span>
      </div>
    </div>
  );
}