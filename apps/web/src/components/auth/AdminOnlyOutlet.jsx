import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

/**
 * Sous /admin, les pages de l'administrateur SEUL. Le gestionnaire de la
 * librairie (`book_manager`, BOOKS_STORE.md §6ter) partage le panneau mais n'y
 * ouvre que « الكتب » et son compte : toute autre adresse le ramène aux
 * commandes, au lieu de lui montrer une page que le serveur refuserait (403).
 *
 * Le chemin est écrit ici, sans importer data/adminNavigation.js : ce module
 * entre dans le bundle d'entrée (App.jsx), la navigation et ses icônes non.
 */
const BOOK_MANAGER_HOME = '/admin/livres/commandes';

export default function AdminOnlyOutlet() {
  const { user } = useContext(AuthContext);
  if (user?.role !== 'admin') return <Navigate to={BOOK_MANAGER_HOME} replace />;
  return <Outlet />;
}
