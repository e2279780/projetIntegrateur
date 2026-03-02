import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { databaseService } from '../services';

/**
 * NotificationCenter - Affiche les alertes de l'admin pour l'utilisateur
 */
export default function NotificationCenter({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!userId) return;
    
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const userNotifications = await databaseService.getUserNotifications(userId);
        setNotifications(userNotifications);
      } catch (err) {
        console.error('Erreur lors de la récupération des notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    // Récupérer les notifications toutes les 10 secondes
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await databaseService.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await databaseService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bouton pour ouvrir/fermer */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-3 hover:bg-gray-100 rounded-lg transition"
      >
        <FontAwesomeIcon icon={faBell} className="text-xl text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des notifications */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-wider">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Corps */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">
                <FontAwesomeIcon icon={faBell} className="text-3xl mb-3 block opacity-30" />
                Aucune notification
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 transition-all ${
                      notif.read 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icône de type */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        notif.type === 'alert' 
                          ? 'bg-red-100 text-red-600'
                          : notif.type === 'success'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <FontAwesomeIcon icon={faBell} className="text-sm" />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm truncate">
                          {notif.title}
                        </p>
                        <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">
                          {new Date(notif.createdAt?.toDate?.() || notif.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Marquer comme lu"
                          >
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pied */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
              <button
                onClick={() => {
                  notifications.forEach(n => {
                    if (!n.read) handleMarkAsRead(n.id);
                  });
                }}
                className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
