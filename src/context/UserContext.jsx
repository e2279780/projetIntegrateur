/**
 * Provider utilisateur pour BiblioConnect
 * Gère l'authentification et l'état de l'utilisateur global
 */

import { useEffect, useState } from 'react';
import { authService } from '../services';
import { UserContext } from './userContextConfig';

/**
 * Provider pour envelopper votre application
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Écouter les changements d'authentification
    const unsubscribe = authService.onAuthChange(async (authUser) => {
      if (authUser) {
        // Récupérer le profil complet
        try {
          const profile = await authService.getCurrentUserProfile(authUser.uid);
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            ...profile,
          });
          setRole(profile.role);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, role }}>
      {children}
    </UserContext.Provider>
  );
};
