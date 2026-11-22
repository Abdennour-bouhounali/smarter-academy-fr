/**
 * code-lockers — la GÉOMÉTRIE PURE du hall (testée) : où se rangent les petits casiers du mur et la place de l'élève au comptoir.
 * Tout en pixels du viewBox.
 */
export const LOCKER_W = 30;
export const LOCKER_H = 40;
const GAP = 6;

/** Les positions x des `n` petits casiers, rangés dans [x0, x1] (jamais plus de 8, centrés, pas qui rétrécit si trop étroit). */
export function lockerSlots(n, x0, x1) {
  const count = Math.max(0, Math.min(8, n));
  if (count === 0) return [];
  const room = x1 - x0;
  const step = Math.min(LOCKER_W + GAP, (room - LOCKER_W) / Math.max(1, count - 1));
  const total = LOCKER_W + step * (count - 1);
  const start = x0 + (room - total) / 2;
  return Array.from({ length: count }, (_, i) => start + i * step);
}

/** Une main de livres sur une étagère : { x, w, h, c } déterministes (pas de hasard : le rendu est stable). */
export function booksOf(width, seed = 0) {
  const out = [];
  let x = 4;
  let i = seed;
  while (x < width - 10) {
    const w = 7 + ((i * 5) % 6);
    const h = 18 + ((i * 7) % 12);
    out.push({ x, w, h, c: (i * 3) % 6 });
    x += w + 1;
    i += 1;
  }
  return out;
}
