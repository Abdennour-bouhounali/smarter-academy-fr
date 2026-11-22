/**
 * robot-track — la GÉOMÉTRIE PURE du tapis (testée) : la droite graduée [−M, M] tracée sur la largeur du viewBox, le poteau 0 au milieu, les arcs de saut.
 * Tout en pixels du viewBox. Une position hors du tapis est clampée au bord (le robot s'arrête au bord, une flèche et le nombre disent la suite).
 */
export const PAD = 56; // la place des deux enfants de chaque côté du tapis

export function matGeometry({ width, max }) {
  const half = width / 2 - PAD;
  const x0 = width / 2;
  const clampV = (v) => Math.max(-max * 1.04, Math.min(max * 1.04, v));
  const x = (v) => x0 + (clampV(v) / max) * half;
  return { width, max, half, x0, x, off: (v) => Math.abs(v) > max * 1.04 };
}

/** Les graduations : { v, major } de −M à M, une tous les `tick`, étiquetée tous les `label`. */
export function ticksOf({ max, tick, label }) {
  const out = [];
  for (let v = -max; v <= max; v += tick) out.push({ v, labelled: v % label === 0 });
  return out;
}

/** La hauteur de l'arc entre deux positions (px) : proportionnelle à la distance, bornée. */
export const arcHeight = (dx) => Math.max(26, Math.min(88, 20 + Math.abs(dx) * 0.34));
