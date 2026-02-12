/**
 * Hook personnalisé useUser pour accéder au contexte utilisateur
 * Séparé du provider pour compatibilité avec Fast Refresh
 */

import { useContext } from 'react';
import { UserContext } from './userContextConfig';

/**
 * Hook pour accéder aux données utilisateur du contexte
 * @returns {Object} { user, loading, role }
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé dans UserProvider');
  }
  return context;
};
