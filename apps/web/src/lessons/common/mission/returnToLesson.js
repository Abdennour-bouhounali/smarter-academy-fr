/**
 * « العودة إلى الدرس » — l'élève quitte une leçon pour RÉVISER un prérequis (propriétaire, 2026-11-07) : on retient d'où il
 * vient, et chaque page de la leçon révisée lui montre UN bouton pour revenir. Pur (le stockage est passé en argument), testé.
 * sessionStorage : un retour vit le temps de l'onglet, jamais d'un appareil à l'autre.
 */
export const RETURN_KEY = 'smarter_return_to';

/** Retenir la leçon de départ : { path, title } (le chemin de son accueil). */
export function setReturnTo(storage, target) {
  try { storage?.setItem(RETURN_KEY, JSON.stringify({ path: target.path, title: target.title })); } catch { /* stockage fermé : pas de retour */ }
}

export function readReturnTo(storage) {
  try {
    const v = JSON.parse(storage?.getItem(RETURN_KEY) ?? 'null');
    return v && typeof v.path === 'string' && v.path.startsWith('/') ? v : null;
  } catch { return null; }
}

export function clearReturnTo(storage) {
  try { storage?.removeItem(RETURN_KEY); } catch { /* rien */ }
}

/** Le bouton se montre HORS de la leçon de départ ; y revenir (par lui ou autrement) l'efface. */
export function isAwayFrom(target, pathname) {
  if (!target) return false;
  const base = target.path.replace(/\/+$/, '');
  return !(pathname === base || pathname.startsWith(`${base}/`));
}
