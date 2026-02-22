/**
 * InitBooks - Outil d'administration pour initialiser la base de données
 * Cette page permet aux administrateurs d'ajouter tous les livres à Firestore
 */

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCheckCircle, faExclamationTriangle, faSpinner, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { useUser } from '../context/useUser';

export default function InitBooks() {
  const { user, role } = useUser();
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, totalCopies: 0, averageRating: '0.00', categories: {} });
  const [seedApiKey, setSeedApiKey] = useState('');

  useEffect(() => {
    // Récupérer les stats depuis l'API
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/books?page=1&limit=1000');
        const json = await res.json();
        const data = json.data || [];

        const total = json.total || data.length;
        const totalCopies = data.reduce((s, b) => s + (b.totalCopies || 0), 0);
        const averageRating = (data.reduce((s, b) => s + (b.rating || 0), 0) / (data.length || 1)).toFixed(2);
        const categories = data.reduce((acc, b) => {
          const c = b.category || 'Autre';
          acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {});

        setStats({ total, totalCopies, averageRating, categories });
      } catch (err) {
        console.error('Erreur fetch stats', err);
      }
    };

    fetchStats();
  }, []);

  const handleInitialize = async () => {
    if (role !== 'Bibliothécaire') {
      setError('❌ Seul un bibliothécaire peut initialiser la base de données.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const headers = {};
      if (seedApiKey) headers['x-api-key'] = seedApiKey;

      const res = await fetch('/api/seed', { method: 'POST', headers });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur lors du seed');

      setResults(result);

      if (result.status === 'already_initialized' || (result.addedCount && result.addedCount > 0)) {
        setInitialized(true);
      }

      // Refresh stats
      const statsRes = await fetch('/api/books?page=1&limit=1000');
      const statsJson = await statsRes.json();
      const data = statsJson.data || [];
      const totalCopies = data.reduce((s, b) => s + (b.totalCopies || 0), 0);
      const averageRating = (data.reduce((s, b) => s + (b.rating || 0), 0) / (data.length || 1)).toFixed(2);
      const categories = data.reduce((acc, b) => {
        const c = b.category || 'Autre';
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {});
      setStats({ total: statsJson.total || data.length, totalCopies, averageRating, categories });
    } catch (err) {
      setError(`❌ Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl mb-6">
            <FontAwesomeIcon icon={faDatabase} size="2x" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
            🗂️ Initialiser la Base de Données
          </h1>
          <p className="text-slate-600 font-medium">Ajouter tous les livres à Firestore</p>
        </div>

        {/* Permission Check */}
        {role !== 'Bibliothécaire' && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex gap-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 text-2xl flex-shrink-0" />
              <div>
                <h2 className="font-black text-yellow-800 text-lg mb-1">Accès refusé</h2>
                <p className="text-yellow-700">
                  Vous devez être connecté en tant que <strong>Bibliothécaire</strong> pour effectuer cette opération.
                </p>
                {user ? (
                  <p className="text-yellow-600 text-sm mt-2">
                    Votre rôle actuel: <strong>{role || 'Non défini'}</strong>
                  </p>
                ) : (
                  <p className="text-yellow-600 text-sm mt-2">
                    Vous devez vous <strong>connecter</strong> d'abord.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800">📊 Statistiques des Livres</h3>
              <div className="text-3xl text-blue-600 font-black">{stats.total}</div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                <strong>Total de copies:</strong> {stats.totalCopies} exemplaires
              </p>
              <p className="text-sm text-slate-600">
                <strong>Note moyenne:</strong> ⭐ {stats.averageRating}/5
              </p>
              <p className="text-sm text-slate-600">
                <strong>Catégories:</strong> {Object.keys(stats.categories).length} catégories
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="font-black text-slate-800 mb-4">📚 Répartition par Catégorie</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(stats.categories).map(([category, count]) => (
                count > 0 && (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-slate-600">{category}</span>
                    <span className="font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                      {count}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Initiative Button */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center mb-12">
          {!initialized ? (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Prêt à initialiser ?</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Cette action importera <strong>{stats.total} livres</strong> dans Firestore. 
                Vous ne pouvez effectuer cette opération qu'une seule fois.
              </p>
              {role === 'Bibliothécaire' && (
                <div className="mb-6 max-w-md mx-auto">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Clé API pour le seed (x-api-key)</label>
                  <input
                    type="text"
                    value={seedApiKey}
                    onChange={e => setSeedApiKey(e.target.value)}
                    placeholder="Entrez la clé API pour /api/seed"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2"
                  />
                </div>
              )}
              
              <button
                onClick={handleInitialize}
                disabled={loading || role !== 'Bibliothécaire'}
                className={`px-8 py-4 rounded-2xl font-black text-lg transition-all transform ${
                  role === 'Bibliothécaire'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } inline-flex items-center gap-3`}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Initialisation en cours...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faDatabase} />
                    Initialiser {stats.total} Livres
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={faCheckCircle} size="2x" />
              </div>
              <h2 className="text-2xl font-black text-green-600 mb-2">✅ Initialisation Réussie!</h2>
              <p className="text-slate-600">
                {results?.status === 'already_initialized'
                  ? `La base contient déjà ${results.booksCount} livres.`
                  : `${results?.addedCount} livres ont été ajoutés avec succès!`}
              </p>
            </>
          )}
        </div>

        {/* Results Summary */}
        {results && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faBook} className="text-blue-600" />
              Résumé de l'Initialisation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-black text-blue-600 mb-2">{results.total}</div>
                <p className="text-sm text-slate-600 font-medium">Total de livres</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-black text-green-600 mb-2">
                  {results.addedCount || results.booksCount || 0}
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  {results.status === 'already_initialized' ? 'Livres en base' : 'Livres ajoutés'}
                </p>
              </div>
              <div className={`rounded-xl p-6 text-center ${
                results.errorCount > 0 ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <div className={`text-3xl font-black mb-2 ${
                  results.errorCount > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {results.errorCount || 0}
                </div>
                <p className="text-sm text-slate-600 font-medium">Erreurs</p>
              </div>
            </div>

            {/* Success List */}
            {results.success && results.success.length > 0 && (
              <div className="mb-8">
                <h4 className="font-black text-slate-800 mb-4 text-green-600">✅ Livres Ajoutés ({results.success.length})</h4>
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.success.map((item, idx) => (
                      <div key={idx} className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">ID: {item.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error List */}
            {results.errors && results.errors.length > 0 && (
              <div>
                <h4 className="font-black text-slate-800 mb-4 text-red-600">❌ Erreurs ({results.errors.length})</h4>
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.errors.map((item, idx) => (
                      <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                        <p className="text-xs text-red-600 mt-1">{item.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
            <div className="flex gap-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl flex-shrink-0" />
              <div>
                <h2 className="font-black text-red-800 text-lg mb-1">Erreur</h2>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <h3 className="font-black text-blue-900 mb-4">ℹ️ Informations Importantes</h3>
          <ul className="space-y-3 text-sm text-blue-800">
            <li className="flex gap-3">
              <span className="font-black text-blue-600">1.</span>
              <span>Cette opération ne s'effectue qu'une seule fois</span>
            </li>
            <li className="flex gap-3">
              <span className="font-black text-blue-600">2.</span>
              <span>Vous devez avoir le rôle <strong>Bibliothécaire</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="font-black text-blue-600">3.</span>
              <span><strong>{stats.total}</strong> livres seront importés</span>
            </li>
            <li className="flex gap-3">
              <span className="font-black text-blue-600">4.</span>
              <span>Les doublons sont automatiquement détectés</span>
            </li>
            <li className="flex gap-3">
              <span className="font-black text-blue-600">5.</span>
              <span>Vérifiez les résultats après l'initialisation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
