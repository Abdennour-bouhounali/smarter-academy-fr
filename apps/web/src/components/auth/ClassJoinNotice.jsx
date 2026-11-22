import { Users } from 'lucide-react';

/**
 * « Après ta connexion, tu rejoins directement la classe … » — rappelé sur la connexion et
 * l'inscription quand l'élève arrive du lien d'une classe : il sait qu'il n'a
 * rien d'autre à faire (pas de code à taper) après s'être authentifié.
 */
export default function ClassJoinNotice({ text }) {
  return (
    <p role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm text-blue-900" data-class-join-notice>
      <Users size={18} className="mt-0.5 shrink-0 text-nav-accent" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
