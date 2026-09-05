import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * intervalUtils — le modèle mathématique de la leçon « Ensembles et
 * intervalles » (2nde). Tout ce qui est affiché (bandes, crochets, verdicts
 * d'appartenance, écritures, inégalités, intersections, réunions) DÉRIVE
 * de ces fonctions pures.
 *
 * État canonique d'un intervalle : { from, to, openFrom, openTo } avec
 * from ≤ to, from/to pouvant valoir −Infinity / +Infinity (borne infinie,
 * toujours ouverte).
 */
export { formatDec, parseDec, roundTo };

export const INF = Infinity;

/** Construit un intervalle normalisé (une borne infinie est toujours ouverte). */
export function interval(from, to, openFrom = false, openTo = false) {
  const f = from === null || from === undefined ? -INF : from;
  const t = to === null || to === undefined ? INF : to;
  return {
    from: f,
    to: t,
    openFrom: Number.isFinite(f) ? !!openFrom : true,
    openTo: Number.isFinite(t) ? !!openTo : true,
  };
}

/** Vide quand from > to, ou from = to avec une borne ouverte. */
export function isEmpty(I) {
  if (I.from > I.to) return true;
  if (I.from === I.to) return I.openFrom || I.openTo;
  return false;
}

/** x ∈ I ? — le cœur de la leçon : la borne appartient si le crochet est fermé. */
export function contains(I, x) {
  if (!Number.isFinite(x)) return false;
  if (x < I.from || x > I.to) return false;
  if (x === I.from && I.openFrom) return false;
  if (x === I.to && I.openTo) return false;
  return true;
}

/** « [−2 ; 3[ » — crochet tourné VERS le nombre quand il appartient. */
export function notation(I, format = formatDec) {
  if (isEmpty(I)) return '∅';
  const l = Number.isFinite(I.from) ? (I.openFrom ? ']' : '[') : ']';
  const r = Number.isFinite(I.to) ? (I.openTo ? '[' : ']') : '[';
  const a = Number.isFinite(I.from) ? format(I.from) : '−∞';
  const b = Number.isFinite(I.to) ? format(I.to) : '+∞';
  return `${l}${a} ; ${b}${r}`;
}

/** Version KaTeX de la notation (pour MathText). */
export function texNotation(I, format = formatDec) {
  if (isEmpty(I)) return '\\varnothing';
  const l = Number.isFinite(I.from) ? (I.openFrom ? ']' : '[') : ']';
  const r = Number.isFinite(I.to) ? (I.openTo ? '[' : ']') : '[';
  const tex = (n) => format(n).replace(',', '{,}').replace('−', '-').replace(/ /g, '\\,');
  const a = Number.isFinite(I.from) ? tex(I.from) : '-\\infty';
  const b = Number.isFinite(I.to) ? tex(I.to) : '+\\infty';
  return `${l}${a}\\,;\\,${b}${r}`;
}

/** « −2 ≤ x < 3 », « x ≥ 3 », « x < 5 » — la même chose dite avec des inégalités. */
export function inequality(I, variable = 'x', format = formatDec) {
  if (isEmpty(I)) return 'aucun nombre';
  const fin = Number.isFinite(I.from);
  const tin = Number.isFinite(I.to);
  if (fin && tin) return `${format(I.from)} ${I.openFrom ? '<' : '≤'} ${variable} ${I.openTo ? '<' : '≤'} ${format(I.to)}`;
  if (fin) return `${variable} ${I.openFrom ? '>' : '≥'} ${format(I.from)}`;
  if (tin) return `${variable} ${I.openTo ? '<' : '≤'} ${format(I.to)}`;
  return `${variable} quelconque`;
}

/** Le type, tel qu'on le nomme : fermé, ouvert, semi-ouvert, ou demi-droite. */
export function typeOf(I) {
  const fin = Number.isFinite(I.from);
  const tin = Number.isFinite(I.to);
  if (!fin && !tin) return 'toute la droite';
  if (!fin || !tin) return 'demi-droite';
  if (!I.openFrom && !I.openTo) return 'fermé';
  if (I.openFrom && I.openTo) return 'ouvert';
  return 'semi-ouvert';
}

/** Deux intervalles décrivent le même ensemble ? */
export function sameInterval(I, J) {
  if (isEmpty(I) && isEmpty(J)) return true;
  if (isEmpty(I) || isEmpty(J)) return false;
  return I.from === J.from && I.to === J.to && I.openFrom === J.openFrom && I.openTo === J.openTo;
}

/** I ∩ J — un intervalle (éventuellement vide). */
export function intersect(I, J) {
  let from; let openFrom;
  if (I.from > J.from) { from = I.from; openFrom = I.openFrom; }
  else if (J.from > I.from) { from = J.from; openFrom = J.openFrom; }
  else { from = I.from; openFrom = I.openFrom || J.openFrom; }
  let to; let openTo;
  if (I.to < J.to) { to = I.to; openTo = I.openTo; }
  else if (J.to < I.to) { to = J.to; openTo = J.openTo; }
  else { to = I.to; openTo = I.openTo || J.openTo; }
  return interval(from, to, openFrom, openTo);
}

/**
 * I ∪ J — un intervalle si les deux se touchent ou se chevauchent, sinon
 * `null` (la réunion est « en deux morceaux », pas un intervalle).
 */
export function union(I, J) {
  if (isEmpty(I)) return { ...J };
  if (isEmpty(J)) return { ...I };
  const [A, B] = I.from <= J.from ? [I, J] : [J, I];
  const touch = B.from < A.to || (B.from === A.to && !(A.openTo && B.openFrom));
  if (!touch) return null;
  let to; let openTo;
  if (A.to > B.to) { to = A.to; openTo = A.openTo; }
  else if (B.to > A.to) { to = B.to; openTo = B.openTo; }
  else { to = A.to; openTo = A.openTo && B.openTo; }
  const openFrom = A.from === B.from ? A.openFrom && B.openFrom : A.openFrom;
  return interval(A.from, to, openFrom, openTo);
}

/** Les entiers relatifs appartenant à un intervalle BORNÉ, croissants. */
export function integersIn(I) {
  if (!Number.isFinite(I.from) || !Number.isFinite(I.to) || isEmpty(I)) return [];
  const out = [];
  for (let n = Math.ceil(I.from); n <= Math.floor(I.to); n += 1) if (contains(I, n)) out.push(n);
  return out;
}

/** Sous-ensembles de nombres de la leçon : ℕ, ℤ, ℝ (𝔻/ℚ sont l'affaire de « Nombres réels »). */
export const SETS = {
  N: { id: 'N', symbol: 'ℕ', name: 'entiers naturels', test: (x) => Number.isInteger(x) && x >= 0 },
  Z: { id: 'Z', symbol: 'ℤ', name: 'entiers relatifs', test: (x) => Number.isInteger(x) },
  R: { id: 'R', symbol: 'ℝ', name: 'nombres réels', test: (x) => Number.isFinite(x) },
};

/** La plus petite des trois boîtes emboîtées qui contient x. */
export function smallestSet(x) {
  if (SETS.N.test(x)) return 'N';
  if (SETS.Z.test(x)) return 'Z';
  return 'R';
}

/** Diviseurs positifs de n (pour le tri de Venn). */
export function divisorsOf(n) {
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
}

/** La région d'un diagramme de Venn à deux ensembles où tombe x. */
export function vennRegion(x, A, B) {
  const a = A.includes(x);
  const b = B.includes(x);
  if (a && b) return 'both';
  if (a) return 'A';
  if (b) return 'B';
  return 'none';
}
