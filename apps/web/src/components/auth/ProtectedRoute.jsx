import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { hasRequiredRole } from '@smarter-academy/core';
import { needsEmailVerification } from '../../utils/emailVerification';

export default function ProtectedRoute({ allowedRoles = ['admin'] }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nav-accent"></div>
      </div>
    );
  }

  // Si pas connecté ou rôle insuffisant, on renvoie vers le login
  if (!hasRequiredRole(user, allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  // Adresse non vérifiée : l'espace (élève comme enseignant) reste fermé.
  // Le serveur refuserait chaque appel (`email.verified`) — on n'ouvre donc
  // pas un espace vide, on renvoie vers l'écran qui explique et propose le
  // renvoi du courriel.
  if (needsEmailVerification(user)) {
    return <Navigate to="/verification-email" replace />;
  }

  // Sinon on affiche le contenu (le Outlet pour les routes imbriquées, ou les children)
  return <Outlet />;
}
