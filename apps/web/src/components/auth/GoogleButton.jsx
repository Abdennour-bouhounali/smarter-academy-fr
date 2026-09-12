import { googleRedirectUrl } from '../../services/authService';

/**
 * « Continuer avec Google ».
 *
 * Un <a> déguisé en bouton, et non un <button> : c'est une NAVIGATION vers
 * un autre domaine. Google refuse d'être chargé en arrière-plan, et un
 * `fetch` vers son écran d'authentification ne mènerait nulle part.
 *
 * Le frontend ne détient aucun secret. Il connaît une seule chose : l'adresse
 * de la route de départ, servie par notre propre API. L'identifiant client et
 * le secret restent sur le serveur — il n'existe volontairement aucune
 * variable VITE_GOOGLE_*, et il ne faut pas en créer.
 *
 * Le logo est dessiné en SVG plutôt que chargé depuis un domaine Google :
 * une page de connexion ne doit pas dépendre d'un tiers pour s'afficher, et
 * charger une image chez Google signalerait la visite avant tout clic.
 */
export default function GoogleButton({ label = 'Continuer avec Google', disabled = false }) {
  return (
    <a
      href={disabled ? undefined : googleRedirectUrl()}
      aria-disabled={disabled || undefined}
      className={`flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.35Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.35-2.59Z" />
        <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.99 14.7 2 12 2a10 10 0 0 0-8.94 5.49l3.35 2.59C7.2 7.72 9.4 5.98 12 5.98Z" />
      </svg>
      {label}
    </a>
  );
}
