/**
 * Provider utilisateur pour BiblioConnect
 * Gère l'authentification et l'état de l'utilisateur global
 */

import { useEffect, useState } from 'react';
import { authService, databaseService } from '../services';
import { UserContext } from './userContextConfig';

/**
 * Provider pour envelopper votre application
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (authUser) => {
      setLoading(true); // Re-passer en loading à chaque changement
      if (authUser) {
        try {
          const profile = await authService.getCurrentUserProfile(authUser.uid);
          if (profile) {
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              ...profile,
            });
            setRole(profile.role);
            
            // Créer une notification de retard si nécessaire
            try {
              await databaseService.checkAndCreateOverdueNotifications(authUser.uid);
            } catch (err) {
              console.error('Erreur lors de la création de la notification de retard:', err);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          setUser(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false); // Fin de la vérification
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, role }}>
      {/* Ne pas afficher l'app tant que Firebase n'a pas répondu */}
      {!loading ? children : <div className="flex items-center justify-center h-screen">Chargement...</div>}
    </UserContext.Provider>
  );
};
