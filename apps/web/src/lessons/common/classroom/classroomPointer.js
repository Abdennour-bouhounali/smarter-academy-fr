/**
 * LE POINTEUR DE CLASSE — la logique pure (testée : classroomPointer.test.js).
 *
 * Au tableau, la flèche de la souris est invisible du fond de la salle. Le
 * pointeur est un grand disque rouge à halo qui SUIT la vraie souris — il ne
 * la remplace pas : le curseur du navigateur reste là, dessous, et les clics
 * passent (`pointer-events: none`, ClassroomPointer.jsx).
 */

/** Les tailles proposées. La grande est le défaut : l'outil existe pour les grandes salles. */
export const POINTER_SIZES = Object.freeze(['s', 'm', 'l']);
export const DEFAULT_POINTER_SIZE = 'l';

/** Le rouge est la seule couleur offerte ; la table permet d'en ajouter une sans toucher au composant. */
export const POINTER_COLORS = Object.freeze({ red: { core: '#EF4444', ring: 'rgba(239, 68, 68, 0.78)', halo: 'rgba(239, 68, 68, 0.2)', glow: 'rgba(239, 68, 68, 0.55)' } });
export const DEFAULT_POINTER_COLOR = 'red';

/** Préférence d'APPAREIL, comme l'échelle : la taille choisie pour CETTE salle. */
export const POINTER_SIZE_KEY = 'smarter_classroom_pointer_size';

/**
 * Le diamètre, en px, pour un viewport donné — proportionnel au petit côté
 * de l'écran (`vmin`), borné : lisible sur un portable, pas démesuré en 4K.
 * ClassroomPointer le recalcule à chaque redimensionnement.
 */
const DIAMETER_RULES = Object.freeze({
  s: { min: 40, vmin: 0.05, max: 120 },
  m: { min: 56, vmin: 0.075, max: 170 },
  l: { min: 72, vmin: 0.1, max: 240 },
});

export function pointerDiameter(size, viewportWidth, viewportHeight) {
  const rule = DIAMETER_RULES[size] ?? DIAMETER_RULES[DEFAULT_POINTER_SIZE];
  const vmin = Math.max(0, Math.min(viewportWidth || 0, viewportHeight || 0));
  return Math.round(Math.min(rule.max, Math.max(rule.min, vmin * rule.vmin)));
}

/** Le rayon de la zone éclairée en mode « تسليط الضوء » : un peu plus de deux pointeurs. */
export function spotlightRadius(diameter) {
  return Math.round(diameter * 2.2);
}

export function normalizePointerSize(value) {
  return POINTER_SIZES.includes(value) ? value : DEFAULT_POINTER_SIZE;
}

/**
 * Le raccourci clavier : **P** bascule le pointeur, **Maj+P** l'éclairage.
 *
 * Lu sur `event.code` (la POSITION de la touche) et non `event.key` : sur un
 * clavier arabe la même touche produit « ح », sur AZERTY « p » — la main de
 * l'enseignant trouve la même touche partout.
 *
 * Jamais pendant une saisie (champ, zone de texte, éditeur, math-field) ni
 * dans un instrument du مختبر ouvert par-dessus la séance (Excalidraw fait de
 * « P » son crayon), ni avec Ctrl / Cmd / Alt, ni en répétition.
 *
 * @returns {'pointer'|'spotlight'|null}
 */
export function pointerShortcut(event) {
  if (!event || event.defaultPrevented || event.repeat) return null;
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  if (event.code !== 'KeyP') return null;
  if (isEditableTarget(event.target)) return null;
  return event.shiftKey ? 'spotlight' : 'pointer';
}

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"], math-field, [data-ml-overlay], .excalidraw';

export function isEditableTarget(target) {
  if (!target || typeof target !== 'object') return false;
  if (target.isContentEditable) return true;
  return typeof target.closest === 'function' && !!target.closest(EDITABLE_SELECTOR);
}
