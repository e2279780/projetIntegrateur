import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/useUser'; // Importez votre hook personnalisé
import Loading from './Loading'; // Un composant de spinner

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, role } = useUser();

  // 1. IMPORTANT : Attendre que Firebase vérifie la session
  if (loading) {
    return <Loading />; 
  }

  // 2. Si après le chargement, aucun utilisateur n'est trouvé, rediriger
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Sécurité supplémentaire pour /init-books ou /admin
  if (adminOnly && role !== 'Bibliothécaire') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}