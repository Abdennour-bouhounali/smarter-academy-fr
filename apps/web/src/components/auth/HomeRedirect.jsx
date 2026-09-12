import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Home from '../../pages/Home';
import { AuthContext } from '../../context/AuthContext';

/**
 * « / » n'est pas la même page pour tout le monde.
 *
 * La page d'accueil est une page de VENTE : elle présente la méthode, les
 * tarifs, et invite à créer un compte. Servie à quelqu'un de déjà connecté,
 * elle lui propose de s'inscrire là où il est déjà entré — et l'oblige à
 * retrouver lui-même le chemin de son espace.
 *
 * Chaque rôle est donc renvoyé chez lui :
 *
 *   élève   → /espace   son tableau de bord (reprendre sa leçon)
 *   admin   → /admin    le panneau d'administration
 *   visiteur → la page d'accueil, inchangée
 *
 * ── Attendre `loading`, impérativement ───────────────────────────────────
 * La session est relue au démarrage (jeton en stockage, puis vérification).
 * Pendant ce temps `user` est nul SANS que cela signifie « pas connecté ».
 * Rediriger tout de suite afficherait donc la page de vente à un abonné le
 * temps d'un battement, puis le déplacerait sous ses yeux. On laisse la page
 * d'accueil se peindre pendant ce court instant — elle est le bon défaut —
 * et la redirection n'a lieu qu'une fois la réponse connue.
 *
 * `replace` : l'accueil ne doit pas rester dans l'historique, sinon le bouton
 * « retour » du navigateur rejoue la redirection et l'élève se retrouve
 * prisonnier de son propre espace.
 *
 * Une seule porte de sortie volontaire : la déconnexion, qui renvoie vers /
 * APRÈS avoir vidé la session — `user` est alors nul, et l'accueil s'affiche
 * normalement.
 */
export default function HomeRedirect() {
  const { user, loading } = useContext(AuthContext);

  if (!loading && user?.role === 'student') {
    return <Navigate to="/espace" replace />;
  }

  if (!loading && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Home />;
}
