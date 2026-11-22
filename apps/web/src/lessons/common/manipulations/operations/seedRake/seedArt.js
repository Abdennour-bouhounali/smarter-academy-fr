/**
 * La géométrie PURE de « مشط الشتلات » (`seed-rake`, thème `seedbed`). Rien ici ne juge : le verdict est dans `logic/seedRake.js`.
 * Repère de conception : 470 × 170 (+ 80 quand le second حوض est ouvert, + 28 pour la prédiction libre). Le حوض fait 1 m = `BED_W` unités ; au-delà de 1 m un second حوض apparaît DESSOUS (rangée 1).
 */
export const W = 470;
export const H = 170;
export const BED_X = 14;
export const BED_W = 400;
export const ROWS = Object.freeze([{ y: 60, h: 48 }, { y: 162, h: 32 }]);
/** Les lignes de l'accolade : la longueur réelle, la seconde rangée, la prédiction (selon que le second حوض est ouvert). */
export const BRACKET_Y = Object.freeze({ real: 140, real2: 202, pred: 168, pred2: 228 });
/** La hauteur de la scène : 170 de base, 250 quand le second حوض est ouvert, + 28 pour la prédiction libre. */
export const sceneH = (over, pred) => (over ? 232 : 168) + (pred ? (over ? 20 : 22) : 0);
export const RAKE = Object.freeze({ y: 4, h: 18, toothTop: 22, toothBottom: 54 });
export const ZONE_COLORS = Object.freeze([
  { fill: '#EF4444', dark: '#B91C1C', soft: '#FEE2E2' },
  { fill: '#22C55E', dark: '#15803D', soft: '#DCFCE7' },
  { fill: '#A855F7', dark: '#7E22CE', soft: '#F3E8FF' },
]);
export const HARVEST = Object.freeze({ fill: '#F59E0B', dark: '#B45309', soft: '#FEF3C7' });

const big = (x) => BigInt(x);
/** Un rationnel `{ n, d }` (BigInt) → un flottant POUR LE DESSIN seulement. */
export const toNum = (r) => Number(r.n) / Number(r.d);

/** Les segments (rangée, x0, x1) d'un intervalle [from, to] (nombres, en mètres) coupé à 1 m. */
export function segments(from, to) {
  const out = [];
  if (from < 1) out.push({ row: 0, x0: BED_X + Math.min(from, 1) * BED_W, x1: BED_X + Math.min(to, 1) * BED_W });
  if (to > 1) out.push({ row: 1, x0: BED_X + Math.max(from, 1) * BED_W - BED_W, x1: BED_X + (to - 1) * BED_W });
  return out.filter((sg) => sg.x1 - sg.x0 > 0.01);
}

/** La case i (0 …) de largeur 1/N : sa rangée, son x et sa largeur. */
export function cellBox(i, N) {
  const w = BED_W / N;
  const row = i < N ? 0 : 1;
  return { row, x: BED_X + (i - row * N) * w, w };
}

/** Les cases ENTIÈREMENT dans [from, to] (rationnels BigInt) à l'espacement 1/N : de ⌈from·N⌉ à ⌊to·N⌋ − 1. */
export function wholeCells(from, to, N) {
  const n = big(N);
  const lo = (from.n * n + from.d - 1n) / from.d;
  const hi = (to.n * n) / to.d;
  const out = [];
  for (let i = lo; i < hi; i += 1n) out.push(Number(i));
  return out;
}

/** Les cases à cheval sur une frontière : pour chaque frontière non alignée, la case ⌊pos·N⌋. */
export function straddled(positions, N) {
  const n = big(N);
  const out = new Set();
  for (const p of positions) {
    if ((p.n * n) % p.d !== 0n) out.add(Number((p.n * n) / p.d));
  }
  return [...out];
}

/** Le 1er dénominateur fautif : la frontière qui fait échouer la zone `borderAt` — { pos (rationnel), kind: 'between' | 'end' | 'harvest', left, right }. */
export function borderOf(task, borderAt) {
  const z = task.zones[borderAt];
  const last = borderAt === task.zones.length - 1;
  if (z.sub) return { pos: z.from, kind: 'harvest', left: borderAt - 1, right: borderAt };
  return { pos: z.to, kind: last ? 'end' : 'between', left: borderAt, right: last ? null : borderAt + 1 };
}

/** L'espacement lu sur la poignée : x (unités) → N ∈ [2, 60]. */
export function nFromX(x) {
  const s = (x - BED_X) / BED_W;
  if (!(s > 0)) return 60;
  return Math.max(2, Math.min(60, Math.round(1 / s)));
}
/** La position x de la première dent pour N. */
export const toothX = (N) => BED_X + BED_W / N;
