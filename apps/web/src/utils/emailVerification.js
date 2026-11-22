/**
 * L'adresse de ce compte attend-elle encore sa vérification ?
 *
 * Vrai pour un élève ou un enseignant dont le serveur dit `emailVerified:
 * false`. Un administrateur n'est jamais concerné (créé par `make:admin`,
 * exempté par le middleware `email.verified`), et l'absence du champ ne vaut
 * pas « non vérifié » : seul un `false` explicite ferme la porte.
 *
 * Utilisé par ProtectedRoute (/espace, /enseignant → /verification-email) et
 * par la barre de navigation (le bouton « فضائي » mène à la vérification).
 * Le serveur reste la vraie porte ; ceci évite d'ouvrir un espace dont
 * chaque appel serait refusé.
 */
export function needsEmailVerification(user) {
  return Boolean(user) && user.role !== 'admin' && user.emailVerified === false;
}
