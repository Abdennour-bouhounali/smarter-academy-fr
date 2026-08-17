import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { hasRequiredRole } from '@smarter-academy/core';

export default function ProtectedRoute({ allowedRoles = ['admin'] }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si pas connecté ou rôle insuffisant, on renvoie vers le login
  if (!hasRequiredRole(user, allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  // Sinon on affiche le contenu (le Outlet pour les routes imbriquées, ou les children)
  return <Outlet />;
}
