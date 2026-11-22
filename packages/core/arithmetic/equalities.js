/**
 * Les ÉGALITÉS et les OPÉRATIONS sur leurs deux membres — le calcul exact de l'unité 5 du manuel de 3AM « المساويات – المتباينات –
 * المعادلات » (leçons « المساويات والعمليات » et « المعادلات من الدرجة الأولى بمجهول واحد »), construit SUR `linear.js` : un membre est une
 * expression du premier degré `{ a, b }` (a·x + b), x est un nombre caché (fraction exacte). Rien n'arrondit.
 *
 *   const e = eqn('3', '2x-4', '7/2');             // 3 = 2x − 4, vraie pour x = 7/2
 *   applyOp(e, 'add', -1)                          // { L: 2, R: 2x − 5, … }        — « 2 = 2x − 5 » (même opération des DEUX côtés)
 *   applyOp(e, 'add', -1, 'left')                  // { …, broke: true }           — un seul membre : l'égalité est cassée
 *   applyOp(e, 'div', 0)                           // { refused: 'zero' }
 *   findOps(e, target, 2)                          // [['add', -1]]                — la plus courte suite d'opérations
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/equalities.js`), jamais depuis le barrel du cœur.
 */
import * as Lin from './linear.js';

export const OPS = Object.freeze(['add', 'sub', 'mul', 'div']);
export const WHO = Object.freeze(['both', 'left', 'right']);
export const C_RANGE = Object.freeze([-9, 9]);

const num = (v) => (typeof v === 'object' ? v : Lin.parseNumber(v));

/** Une égalité { L, R, x } : les deux membres (textes « 2x-4 ») et la valeur CACHÉE de x. */
export function eqn(left, right, x) {
  return Object.freeze({ L: Lin.linear(left), R: Lin.linear(right), x: num(x) });
}

/** Les deux valeurs que prennent les membres pour le x caché. */
export const values = (e) => ({ left: Lin.linAt(e.L, e.x), right: Lin.linAt(e.R, e.x) });
/** L'égalité est-elle vraie pour le x caché ? */
export const holds = (e) => Lin.eq(Lin.linAt(e.L, e.x), Lin.linAt(e.R, e.x));
const sameLin = (P, Q) => Lin.eq(P.a, Q.a) && Lin.eq(P.b, Q.b);
export const sameEq = (e, f) => sameLin(e.L, f.L) && sameLin(e.R, f.R);

const onSide = (P, op, k) => {
  if (op === 'add') return Lin.linAdd(P, Lin.lin(0, k));
  if (op === 'sub') return Lin.linSub(P, Lin.lin(0, k));
  if (op === 'mul') return Lin.linScale(P, k);
  return Lin.linScale(P, Lin.div(1, k));
};

/**
 * Applique l'opération `op` avec le nombre `c` au membre (ou aux membres) désigné(s) par `who`.
 *   refused 'zero'  : diviser par 0.
 *   broke           : après l'opération les deux membres n'ont plus la même valeur (l'élève n'a touché qu'un côté).
 *   lost            : multiplier par 0 — les deux membres valent 0, l'égalité reste vraie mais ne dit plus rien.
 */
export function applyOp(e, op, c, who = 'both') {
  const k = num(c);
  if (!OPS.includes(op)) throw new Error(`opération inconnue : ${op}`);
  if (op === 'div' && Lin.isZero(k)) return { refused: 'zero' };
  const L = who === 'right' ? e.L : onSide(e.L, op, k);
  const R = who === 'left' ? e.R : onSide(e.R, op, k);
  const next = Object.freeze({ L, R, x: e.x });
  return { eq: next, broke: !holds(next), lost: op === 'mul' && Lin.isZero(k) && who === 'both' };
}

/** La plus courte suite d'opérations (même nombre des deux côtés, c de −9 à 9) qui mène de `from` à `to`, ou null. */
export function findOps(from, to, depth = 2) {
  const seen = new Set();
  const key = (e) => `${Lin.fracText(e.L.a)}|${Lin.fracText(e.L.b)}|${Lin.fracText(e.R.a)}|${Lin.fracText(e.R.b)}`;
  let layer = [{ e: from, path: [] }];
  seen.add(key(from));
  if (sameEq(from, to)) return [];
  for (let d = 0; d < depth; d += 1) {
    const nextLayer = [];
    for (const { e, path } of layer) {
      for (const op of ['add', 'mul', 'div']) {
        for (let c = C_RANGE[0]; c <= C_RANGE[1]; c += 1) {
          const r = applyOp(e, op, c);
          if (r.refused || r.lost) continue;
          const k = key(r.eq);
          if (seen.has(k)) continue;
          seen.add(k);
          const p = [...path, [op, c]];
          if (sameEq(r.eq, to)) return p;
          nextLayer.push({ e: r.eq, path: p });
        }
      }
    }
    layer = nextLayer;
  }
  return null;
}

/** Une suite d'opérations appliquée aux deux membres : l'égalité obtenue (pour fabriquer une cible). */
export function chain(e, ops) {
  return ops.reduce((cur, [op, c]) => applyOp(cur, op, c).eq, e);
}

/** LaTeX d'un membre « 2x - 4 » et d'une égalité « 3 = 2x - 4 ». */
export const sideTex = (P) => Lin.linLatex(P);
export const eqTex = (e) => `${Lin.linLatex(e.L)} = ${Lin.linLatex(e.R)}`;

/** Le texte d'un nombre exact « -4/3 », et sa valeur flottante pour le dessin seul. */
export const numText = (v) => Lin.fracText(v);
export const numFloat = (v) => Lin.toNumber(v);

/** « 3 », « −2,5 », « 1/2 » écrits par l'élève → fraction, ou null. */
export function parseFreeNumber(raw) {
  try {
    const s = String(raw).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', ',');
    const v = Lin.parseNumber(s);
    return Math.abs(Lin.toNumber(v)) <= 99 ? v : null;
  } catch { return null; }
}

/**
 * L'échelle d'un tracé qui doit contenir 0 et toutes les `vals` : bornes sur la graduation « ronde » (1, 2, 5, 10 …) et le pas.
 * Pure géométrie du dessin : jamais lue pour juger.
 */
export function trackFor(vals) {
  const f = vals.map(numFloat).concat([0]);
  const lo = Math.min(...f); const hi = Math.max(...f);
  const span = Math.max(4, hi - lo);
  const raw = span / 6;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const a = Math.floor(lo / step) * step - (lo === Math.floor(lo / step) * step ? step : 0);
  const b = Math.ceil(hi / step) * step + (hi === Math.ceil(hi / step) * step ? step : 0);
  return { lo: a, hi: b, step };
}

/* ══════════════ Équations ax + b = cx + d : traverser avec le signe, puis diviser ══════════════ */

/** Une ÉQUATION L = R dont la solution unique est CALCULÉE (le x caché de la leçon), ou null (aucune ou une infinité de solutions). */
export function equation(left, right) {
  const L = Lin.linear(left); const R = Lin.linear(right);
  const s = Lin.solveEquation(L, R);
  if (s.kind !== 'unique') return null;
  return Object.freeze({ L, R, x: s.x });
}
/** « 3x+2 = x+8 » (le signe = unique) → équation, ou null si le texte est illisible ou sans solution unique. */
export function parseEquation(text) {
  const parts = String(text).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[−–]/g, '-').replace(/٫/g, ',').split('=');
  if (parts.length !== 2) return null;
  try { return equation(parts[0], parts[1]); } catch { return null; }
}

/** Les caisses d'une équation : le terme en x et le terme constant de chaque membre (un terme nul n'est pas une caisse). */
export function crates(e) {
  const out = [];
  for (const side of ['L', 'R']) {
    const P = side === 'L' ? e.L : e.R;
    if (!Lin.isZero(P.a)) out.push({ id: `${side}:x`, side, kind: 'x', value: P.a });
    if (!Lin.isZero(P.b)) out.push({ id: `${side}:n`, side, kind: 'n', value: P.b });
  }
  return out;
}

/**
 * Fait traverser la caisse (side, kind) vers l'autre membre ; `flip` : elle y arrive avec son signe CHANGÉ (on ajoute son opposé aux deux
 * membres) ou tel quel. `ok` : l'égalité reste vraie pour le x caché — une caisse qui garde son signe la casse (sauf si sa valeur en x est 0).
 */
export function moveTerm(e, side, kind, flip) {
  const S = side === 'L' ? e.L : e.R;
  const T = side === 'L' ? e.R : e.L;
  const v = kind === 'x' ? S.a : S.b;
  if (Lin.isZero(v)) return { refused: 'empty' };
  const t = flip ? Lin.neg(v) : v;
  const S2 = kind === 'x' ? Lin.lin(0, S.b) : Lin.lin(S.a, 0);
  const T2 = kind === 'x' ? Lin.lin(Lin.add(T.a, t), T.b) : Lin.lin(T.a, Lin.add(T.b, t));
  const next = Object.freeze(side === 'L' ? { L: S2, R: T2, x: e.x } : { L: T2, R: S2, x: e.x });
  return { eq: next, ok: holds(next), flip };
}

/** Divise les deux membres par c (≠ 0). */
export function divideBoth(e, c) {
  const k = num(c);
  if (Lin.isZero(k)) return { refused: 'zero' };
  const f = (P) => Lin.linScale(P, Lin.div(1, k));
  return { eq: Object.freeze({ L: f(e.L), R: f(e.R), x: e.x }) };
}

/** La forme « a·x = n » (ou « n = a·x ») : x seul d'un côté (terme constant nul), un nombre de l'autre ; sinon null. */
export function shapeOf(e) {
  const xL = !Lin.isZero(e.L.a);
  const xR = !Lin.isZero(e.R.a);
  if (xL && !xR && Lin.isZero(e.L.b)) return { side: 'L', a: e.L.a, n: e.R.b };
  if (xR && !xL && Lin.isZero(e.R.b)) return { side: 'R', a: e.R.a, n: e.L.b };
  return null;
}
/** « x = n » (ou « n = x ») : le coefficient vaut exactement 1. */
export const isSolved = (e) => { const s = shapeOf(e); return !!s && Lin.eq(s.a, 1); };
/** Le texte LaTeX d'un terme seul (« -3x », « 5 ») et d'un membre ajouté d'un terme (« 3x + 2 - x »). */
const termTex = (kind, v) => (kind === 'x' ? Lin.linLatex(Lin.lin(v, 0)) : Lin.linLatex(Lin.lin(0, v)));
export function withTermTex(P, kind, v) {
  const neg = Lin.cmp(v, 0) < 0;
  const abs = neg ? Lin.neg(v) : v;
  return `${Lin.linLatex(P)} ${neg ? '-' : '+'} ${termTex(kind, abs)}`;
}
/** x = a, la valeur de remplacement pour la vérification : les deux membres au nombre `x`. */
export const checkAt = (e, x) => ({ left: Lin.linAt(e.L, num(x)), right: Lin.linAt(e.R, num(x)) });
