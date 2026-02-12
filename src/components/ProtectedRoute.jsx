import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    // Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
    return <Navigate to="/login" replace />;
  }

  return children;
}