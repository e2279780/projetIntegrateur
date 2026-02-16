import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faLock, faMapMarkerAlt, faCreditCard, 
  faCamera, faCheckCircle, faEnvelope, faPlus 
} from '@fortawesome/free-solid-svg-icons';

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
      <FontAwesomeIcon icon={icon} />
    </div>
    <h2 className="text-xl font-black text-slate-800">{title}</h2>
  </div>
);

export default function Profile({ user }) {
  const [activeTab, setActiveTab] = useState('infos');

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Barre latérale du Profil */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden">
          {/* Header de fond décoratif */}
          <div className="absolute top-0 left-0 w-full h-24 bg-slate-900 z-0"></div>
          
          <div className="relative z-10">
            <div className="relative inline-block group">
              <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] border-4 border-white flex items-center justify-center text-white text-5xl font-black shadow-lg mx-auto mb-4">
                {user?.name?.[0].toUpperCase() || "J"}
              </div>
              {/* Bouton pour modifier la photo */}
              <button className="absolute bottom-4 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 transition border border-gray-100">
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
            
            <h1 className="text-2xl font-black text-slate-800 capitalize">{user?.name || "Utilisateur"}</h1>
            <p className="text-blue-600 font-bold text-sm mb-6 flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} /> Membre Premium
            </p>

            <div className="space-y-2">
              {['infos', 'securite', 'adresse', 'paiement'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-6 py-3 rounded-2xl font-bold text-sm transition ${
                    activeTab === tab ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'infos' && "Informations personnelles"}
                  {tab === 'securite' && "Sécurité & mot de passe"}
                  {tab === 'adresse' && "Adresses de livraison"}
                  {tab === 'paiement' && "Modes de paiement"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zone de contenu dynamique */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 min-h-[600px]">
        
        {/* ONGLET : INFOS */}
        {activeTab === 'infos' && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <SectionTitle icon={faUser} title="Modifier le profil" />
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Nom complet</label>
                  <input type="text" defaultValue={user?.name} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Email</label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="email" defaultValue={user?.email} className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                  </div>
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition">Enregistrer les changements</button>
            </form>
          </div>
        )}

        {/* ONGLET : SÉCURITÉ (Mot de passe) */}
        {activeTab === 'securite' && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <SectionTitle icon={faLock} title="Changer le mot de passe" />
            <form className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Mot de passe actuel</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition">Mettre à jour le mot de passe</button>
            </form>
          </div>
        )}

        {/* ONGLET : ADRESSE */}
        {activeTab === 'adresse' && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <SectionTitle icon={faMapMarkerAlt} title="Mes Adresses" />
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><FontAwesomeIcon icon={faMapMarkerAlt} /></div>
                <div>
                  <p className="font-black text-slate-800">Maison (Principale)</p>
                  <p className="text-slate-500 text-sm">3800 Sherbrooke St E, Montreal, Quebec H1X 2A2</p>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 font-black hover:underline px-2">
              <FontAwesomeIcon icon={faPlus} /> Ajouter une nouvelle adresse
            </button>
          </div>
        )}

        {/* ONGLET : PAIEMENT (Lien / Carte) */}
        {activeTab === 'paiement' && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <SectionTitle icon={faCreditCard} title="Modes de paiement" />
            <div className="space-y-6">
              <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                   <FontAwesomeIcon icon={faCreditCard} size="5x" />
                </div>
                <div className="relative z-10">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-8">Carte enregistrée</p>
                  <p className="text-2xl font-mono mb-8 tracking-widest">•••• •••• •••• 4242</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Expire le</p>
                      <p className="font-bold">12 / 28</p>
                    </div>
                    <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition backdrop-blur-md">Modifier</button>
                  </div>
                </div>
              </div>

              {/* Bouton pour Stripe / Link / Carte */}
              <button className="w-full border-2 border-dashed border-gray-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all group">
                <FontAwesomeIcon icon={faPlus} className="text-2xl mb-2 group-hover:scale-125 transition-transform" />
                <span className="font-black text-sm uppercase tracking-widest">Lier une nouvelle carte</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}