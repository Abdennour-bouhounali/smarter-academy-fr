import { matchPath } from 'react-router-dom';

/**
 * « جولة تعريفية » — la logique PURE des visites guidées : quelle visite
 * appartient à quelle page, quand elle s'ouvre d'elle-même, quelles étapes
 * restent quand une cible manque, où poser la carte. Aucun DOM ici (testé par
 * tourModel.test.js) ; le rendu vit dans TourOverlay.jsx.
 */

export const TOUR_STATUS = { completed: 'completed', skipped: 'skipped' };

/** La visite de CETTE page pour CE rôle, ou null. Le chemin entier doit correspondre. */
export function findPageTour(tours, role, pathname) {
  if (!role || !pathname) return null;
  return tours.find((tour) => tour.role === role && tour.path && matchPath({ path: tour.path, end: true }, pathname)) ?? null;
}

/**
 * Une visite DÉCLARÉE par la page elle-même (`useDeclarePageTour(page)`),
 * pour les pages dont l'URL ne suffit pas à les reconnaître — le premier
 * module d'une leçon, quelle que soit la leçon. `page` est le nom commun aux
 * rôles ; la clé reste préfixée par le rôle.
 */
export function findDeclaredTour(tours, role, page) {
  if (!role || !page) return null;
  return tours.find((tour) => tour.role === role && tour.page === page) ?? null;
}

/** Une visite close (terminée ou passée) ne s'ouvre plus d'elle-même — jamais. */
export function isTourClosed(closed, key) {
  return Boolean(closed && Object.prototype.hasOwnProperty.call(closed, key));
}

/**
 * S'ouvre d'elle-même : une visite existe pour la page, le compte y a droit
 * (`eligible`, config serveur `tours.eligible_since`), elle n'est pas close.
 * Tant que la réponse du serveur n'est pas arrivée (`closed === null`), rien :
 * on n'ouvre pas une visite peut-être déjà vue. `autoStart: false` : la page
 * déclare sa visite pour le bouton « جولة في الصفحة » seulement (un module de
 * leçon autre que le premier).
 */
export function shouldAutoStart({ tour, closed, eligible, autoStart = true }) {
  if (!tour || !autoStart || closed == null || eligible === false) return false;
  return !isTourClosed(closed, tour.key);
}

/**
 * Les étapes jouables : une étape SANS cible (carte centrale) reste toujours ;
 * une étape dont la cible n'est pas à l'écran (état vide, élément propre au
 * grand écran…) disparaît. Une visite qui ne garde aucune étape CIBLÉE ne se
 * joue pas — une carte d'accueil seule ne présente rien de la page.
 */
export function playableSteps(steps, hasTarget) {
  const kept = steps.filter((step) => !step.target || hasTarget(step.target));
  return kept.some((step) => step.target) ? kept : [];
}

/**
 * L'étape suivante jouable dans la direction `dir` (+1 / −1) à partir de
 * `from`, ou −1. Sert quand une cible disparaît entre deux étapes.
 */
export function nextPlayableIndex(steps, from, dir, hasTarget) {
  for (let i = from + dir; i >= 0 && i < steps.length; i += dir) {
    const step = steps[i];
    if (!step.target || hasTarget(step.target)) return i;
  }
  return -1;
}

/**
 * Où poser la carte (coordonnées physiques, `position: fixed`) : sous la
 * cible si la place suffit, sinon au-dessus, sinon contre le bas de l'écran ;
 * centrée horizontalement sur la cible puis gardée dans l'écran. Sans cible :
 * au centre. Les rectangles sont PHYSIQUES (getBoundingClientRect) : le sens
 * RTL ne change rien au calcul.
 */
export function placeCard({ target, card, viewport, gap = 14, margin = 12 }) {
  const clamp = (v, min, max) => Math.max(min, Math.min(v, Math.max(min, max)));
  if (!target) {
    return {
      side: 'center',
      top: clamp((viewport.height - card.height) / 2, margin, viewport.height - card.height - margin),
      left: clamp((viewport.width - card.width) / 2, margin, viewport.width - card.width - margin),
    };
  }
  const left = clamp(target.left + target.width / 2 - card.width / 2, margin, viewport.width - card.width - margin);
  const below = target.bottom + gap;
  if (below + card.height <= viewport.height - margin) return { side: 'bottom', top: below, left };
  const above = target.top - gap - card.height;
  if (above >= margin) return { side: 'top', top: above, left };
  // Cible plus haute que l'écran (une grande carte) : la carte se pose en bas,
  // par-dessus la cible, plutôt que hors de l'écran.
  return { side: 'overlay', top: Math.max(margin, viewport.height - card.height - margin), left };
}
