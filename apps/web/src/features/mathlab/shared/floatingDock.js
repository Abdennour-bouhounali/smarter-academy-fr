/**
 * LE DOCK FLOTTANT des lecteurs de solution — un petit magasin partagé, sans React.
 *
 * Demande de la propriétaire (2026-09-30) : la barre « الحل خطوة بخطوة » doit
 * être PETITE et DÉPLAÇABLE pour ne jamais cacher le contenu. Elle flotte donc
 * au-dessus de l'écran (position fixe), et l'élève la glisse où il veut.
 *
 * Une page peut porter plusieurs déroulés (les plis de la statistique, la
 * PPCM sous le PGCD…) : un seul lecteur flotte à la fois — celui de la
 * solution sur laquelle l'élève travaille (le dernier démarré ou touché) ;
 * les autres restent à leur place, en pastille compacte.
 *
 * La position (px depuis le coin haut-gauche de la fenêtre) et l'état
 * « réduit » sont une commodité par navigateur (localStorage, gardé).
 */

const STORAGE_KEY = 'sa-ml-step-dock';
const listeners = new Set();
let active = null;
let order = [];
let prefs = readPrefs();

function readPrefs() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    const position = raw?.position && Number.isFinite(raw.position.x) && Number.isFinite(raw.position.y) ? raw.position : null;

    return { position, minimized: raw?.minimized === true };
  } catch {
    return { position: null, minimized: false };
  }
}

function writePrefs() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* aperçu, navigation privée : ce n'est qu'une commodité */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeDock(listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

/** Un lecteur flottant apparaît : il flotte si personne d'autre ne flotte. */
export function registerFloating(id) {
  order = [...order.filter((item) => item !== id), id];
  if (active === null) { active = id; emit(); }
}

/** Il disparaît : le précédent reprend la main. */
export function unregisterFloating(id) {
  order = order.filter((item) => item !== id);
  if (active === id) { active = order[order.length - 1] ?? null; emit(); }
}

/** L'élève touche ce déroulé (démarre, avance…) : c'est lui qui flotte désormais. */
export function activateFloating(id) {
  if (active !== id && order.includes(id)) { active = id; emit(); }
}

export function getActiveFloating() {
  return active;
}

export function getDockPrefs() {
  return prefs;
}

export function setDockPosition(position) {
  prefs = { ...prefs, position };
  writePrefs();
  emit();
}

export function setDockMinimized(minimized) {
  prefs = { ...prefs, minimized };
  writePrefs();
  emit();
}

/**
 * Ramène un point dans la fenêtre (la barre doit rester attrapable après un
 * redimensionnement ou une rotation du téléphone).
 */
export function clampToViewport(position, size, viewport, margin = 8) {
  const maxX = Math.max(margin, viewport.width - size.width - margin);
  const maxY = Math.max(margin, viewport.height - size.height - margin);

  return {
    x: Math.min(maxX, Math.max(margin, position.x)),
    y: Math.min(maxY, Math.max(margin, position.y)),
  };
}
