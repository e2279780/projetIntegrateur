import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruckLoading, faAlertTriangle, faPlusCircle, 
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

import { useUser } from '../context/useUser';

export default function Admin() {
  useUser();

  const [inventory, setInventory] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/books?page=1&limit=1000');
      const json = await res.json();
      const books = json.data || [];

      const mapped = books.map(b => ({
        id: b.id,
        title: b.title || 'Untitled',
        stock: b.availableCopies ?? b.totalCopies ?? 0,
        minStock: Math.max(1, Math.floor((b.totalCopies || 1) * 0.15)),
        provider: b.publisher || 'Inconnu',
        format: b.format || 'Physique',
      }));

      setInventory(mapped);

      const provs = Array.from(new Set(mapped.map(m => m.provider))).filter(Boolean);
      setProviders(provs);
    } catch (err) {
      console.error('Erreur fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10">
      
      {/* HEADER ADMIN */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 italic uppercase tracking-tighter mb-2">Dashboard Admin</h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em]">Gestion de l'inventaire & Fournisseurs</p>
      </div>

      {/* STATS RAPIDES (Critère US02) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Livres</p>
          <p className="text-3xl font-black text-slate-900 italic">{inventory.length}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faAlertTriangle} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertes Stock Bas</p>
          <p className="text-3xl font-black text-red-500 italic">
            {inventory.filter(item => item.stock <= item.minStock).length}
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-white">
            <FontAwesomeIcon icon={faTruckLoading} />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commandes en cours</p>
          <p className="text-3xl font-black italic text-white">4</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        
        {/* TABLEAU D'INVENTAIRE (Critère US02) */}
        <div className="flex-1 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-black text-xl uppercase italic">Inventaire des Stocks</h2>
            <div className="flex items-center gap-3">
              <button onClick={fetchInventory} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-300 transition">Actualiser</button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition">
                <FontAwesomeIcon icon={faPlusCircle} /> Ajouter un livre
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Livre</th>
                  <th className="px-8 py-6">Format</th>
                  <th className="px-8 py-6">Stock</th>
                  <th className="px-8 py-6">Seuil Min</th>
                  <th className="px-8 py-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-6 text-center">Chargement...</td>
                  </tr>
                ) : (
                  inventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800">{item.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.provider}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.format}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`font-black text-lg ${item.stock <= item.minStock ? 'text-red-500' : 'text-slate-800'}`}>{item.stock}</span>
                      </td>
                      <td className="px-8 py-6 font-bold text-slate-400">{item.minStock}</td>
                      <td className="px-8 py-6">
                        <button
                          onClick={async () => {
                            const qtyStr = window.prompt('Quantité à ajouter (nombre positif)');
                            if (!qtyStr) return;
                            const qty = parseInt(qtyStr, 10);
                            if (Number.isNaN(qty) || qty <= 0) return alert('Quantité invalide');

                            try {
                              const res = await fetch(`/api/books/${item.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ delta: qty }),
                              });
                              const json = await res.json();
                              if (!res.ok) throw new Error(json.error || 'Erreur');
                              await fetchInventory();
                              alert('Stock mis à jour');
                            } catch (err) {
                              console.error(err);
                              alert('Erreur lors de la mise à jour du stock: ' + err.message);
                            }
                          }}
                          className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                        >
                          Réapprovisionner
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMMANDE FOURNISSEUR (Critère US03) */}
        <aside className="w-full xl:w-96 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Nouvelle Commande</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Fournisseur</label>
                <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition">
                  {providers.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Livre</label>
                <input type="text" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700" placeholder="Ex: Clean Code" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Quantité</label>
                <input type="number" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700" defaultValue="10" />
              </div>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition shadow-lg mt-4">
                Envoyer la commande
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Note Administrateur</p>
            <p className="text-xs text-blue-800 font-medium leading-relaxed italic">
              "L'inventaire est mis à jour automatiquement lors des ventes et des retours d'emprunts."
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}