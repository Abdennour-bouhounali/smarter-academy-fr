/**
 * La géométrie PURE d'un panneau déplaçable (MovablePanel) — sans React, testée.
 *
 * Un panneau vit dans un conteneur (la scène du lab). Sa position est un décalage { x, y } en
 * pixels depuis sa place d'origine ; elle est toujours BORNÉE pour que le panneau reste entier
 * dans le conteneur (on ne perd jamais un panneau hors champ, MANIPULATION_CONTRACT §8bis).
 */

/** Borne un décalage pour que le rectangle `panel` (place d'origine) reste dans `box`. */
export function clampOffset(offset, panel, box) {
  const minX = box.left - panel.left;
  const maxX = box.right - panel.right;
  const minY = box.top - panel.top;
  const maxY = box.bottom - panel.bottom;
  const clamp = (v, lo, hi) => (hi < lo ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));
  return { x: Math.round(clamp(offset.x, minX, maxX)), y: Math.round(clamp(offset.y, minY, maxY)) };
}

/** Le pas clavier : flèches = 16 px, Maj + flèche = 64 px. En RTL, ← et → gardent leur sens visuel. */
export function keyStep(key, shift = false) {
  const d = shift ? 64 : 16;
  return ({ ArrowLeft: { x: -d, y: 0 }, ArrowRight: { x: d, y: 0 }, ArrowUp: { x: 0, y: -d }, ArrowDown: { x: 0, y: d } })[key] ?? null;
}

/** Lire / écrire une valeur mémorisée par navigateur ; jamais d'exception (stockage bloqué, aperçu…). */
export function readStored(key, fallback) {
  if (!key) return fallback;
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
export function writeStored(key, value) {
  if (!key) return;
  try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ }
}
