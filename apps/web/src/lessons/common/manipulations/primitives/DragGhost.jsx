import { createPortal } from 'react-dom';
import { useClassroomPortalTarget } from '../../classroom/ClassroomContext';

/**
 * L'objet porté, dessiné SOUS LE DOIGT pendant le glisser. Un portail vers
 * <body> : la copie ne dépend d'aucun `overflow` ni `transform` du module.
 * `pointer-events: none` pour ne jamais masquer la zone visée. Rendu en
 * `transform` (pas left/top animés) : une seule propriété composée, fluide
 * sur un téléphone d'entrée de gamme.
 *
 * En MODE CLASSE plein écran, <body> n'est plus visible (le navigateur ne
 * montre que l'élément plein écran) : le portail va alors vers la racine de
 * la présentation, que le contexte publie. Hors mode classe : <body>.
 */
export default function DragGhost({ ghost, children }) {
  const target = useClassroomPortalTarget();
  if (!ghost || !target) return null;
  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[80] will-change-transform"
      style={{ transform: `translate3d(${ghost.x}px, ${ghost.y}px, 0) translate(-50%, -50%) scale(1.08)` }}
    >
      <div className="rounded-xl shadow-2xl">{children}</div>
    </div>,
    target,
  );
}
