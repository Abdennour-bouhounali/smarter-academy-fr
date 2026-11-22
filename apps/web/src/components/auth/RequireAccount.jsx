import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { needsEmailVerification } from '../../utils/emailVerification';

/**
 * La porte du CATALOGUE et des LEÇONS : aucun visiteur n'y entre sans
 * compte, quel que soit son rôle une fois inscrit (élève, enseignant,
 * administrateur…). Posée dans App.jsx autour de /courses, des pages
 * d'unité et de toutes les routes de leçon — une URL tapée directement
 * passe par elle comme la navigation normale.
 *
 * Visiteur → /register (décision du propriétaire, 2026-10-07 : il faut
 * créer un compte avant toute navigation dans les leçons). Adresse non
 * vérifiée → /verification-email, comme ProtectedRoute.
 */
export default function RequireAccount() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nav-accent"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/register" replace />;
  if (needsEmailVerification(user)) return <Navigate to="/verification-email" replace />;

  return <Outlet />;
}
