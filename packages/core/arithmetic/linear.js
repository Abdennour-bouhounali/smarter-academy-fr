/**
 * Le premier degré EXACT — le calcul commun de l'unité 4 « معادلات ومتراجحات من الدرجة
 * الأولى بمجهول واحد » (balance, terrain qui s'annule, rayon des solutions, course).
 *
 * Un nombre est une fraction { n, d } (d > 0, irréductible, entiers JS) ; une expression
 * du premier degré est { a, b } pour a·x + b. Rien n'arrondit : 4x − 3 = 2x + 6 donne
 * exactement 9/2, et −3x + 5 ≤ 20 donne x ≥ −5 avec le sens INVERSÉ parce que a < 0.
 * Les vues ne recalculent jamais une règle : elles appellent ce module.
 *
 *   const L = linear('4x-3'), R = linear('2x+6');
 *   solveEquation(L, R)            → { kind: 'unique', x: { n: 9, d: 2 } }
 *   solveInequality(linear('-3x+5'), '<=', linear('20'))
 *                                  → { rel: '>=', bound: { n: -5, d: 1 }, flipped: true }
 *   satisfies(linear('2,5x+100'), '<=', linear('150'), frac(20)) → true
 *   fracText(frac(9, 2))           → '9/2'      fracLatex(frac(-1, 7)) → '-\\dfrac{1}{7}'
 */

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

/** Une fraction irréductible, signe au numérateur. */
export function frac(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error(`frac: ${n}/${d}`);
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return Object.freeze({ n: (s * n) / g, d: (s * d) / g });
}

/** Lit un nombre écrit comme le manuel : « 2,5 », « -0.2 », « 7/2 », « 3 ». */
export function parseNumber(raw) {
  const s = String(raw).trim().replace(/[−–]/g, '-').replace(',', '.');
  if (/^[+-]?\d+\/\d+$/.test(s)) { const [a, b] = s.split('/'); return frac(Number(a), Number(b)); }
  const m = s.match(/^([+-]?)(\d*)(?:\.(\d+))?$/);
  if (!m || (m[2] === '' && !m[3])) throw new Error(`nombre illisible : « ${raw} »`);
  const f = m[3] ?? '';
  return frac(Number(`${m[1]}${m[2] || '0'}${f}`), 10 ** f.length);
}

const F = (v) => (typeof v === 'object' ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));
export const add = (p, q) => { p = F(p); q = F(q); return frac(p.n * q.d + q.n * p.d, p.d * q.d); };
export const sub = (p, q) => add(p, neg(q));
export const neg = (p) => { p = F(p); return frac(-p.n, p.d); };
export const mul = (p, q) => { p = F(p); q = F(q); return frac(p.n * q.n, p.d * q.d); };
export const div = (p, q) => { p = F(p); q = F(q); if (q.n === 0) throw new Error('division par 0'); return frac(p.n * q.d, p.d * q.n); };
export const cmp = (p, q) => { p = F(p); q = F(q); const l = p.n * q.d; const r = q.n * p.d; return l < r ? -1 : l > r ? 1 : 0; };
export const eq = (p, q) => cmp(p, q) === 0;
export const isZero = (p) => F(p).n === 0;
export const isInteger = (p) => F(p).d === 1;
export const toNumber = (p) => { p = F(p); return p.n / p.d; };

/** « 9/2 », « -3 » : pour les ARIA et les tests. */
export const fracText = (p) => { p = F(p); return p.d === 1 ? String(p.n) : `${p.n}/${p.d}`; };
/** LaTeX à la façon du manuel : « \dfrac{9}{2} », « -\dfrac{1}{7} », « -3 ». */
export function fracLatex(p) {
  p = F(p);
  if (p.d === 1) return String(p.n);
  return `${p.n < 0 ? '-' : ''}\\dfrac{${Math.abs(p.n)}}{${p.d}}`;
}
/** Écriture décimale à virgule quand elle est finie et courte (2,5) ; sinon la fraction. */
export function fracDecimal(p, maxDigits = 3) {
  p = F(p);
  let d = p.d; let k = 0;
  while (d % 2 === 0) { d /= 2; k += 1; }
  let j = 0;
  while (d % 5 === 0) { d /= 5; j += 1; }
  const digits = Math.max(k, j);
  if (d !== 1 || digits > maxDigits) return null;
  return (p.n / p.d).toFixed(digits).replace('.', ',');
}

// ── Expressions du premier degré { a, b } ─────────────────────────────────

export const lin = (a, b = 0) => Object.freeze({ a: F(a), b: F(b) });
export const linAdd = (P, Q) => lin(add(P.a, Q.a), add(P.b, Q.b));
export const linSub = (P, Q) => lin(sub(P.a, Q.a), sub(P.b, Q.b));
export const linScale = (P, k) => lin(mul(P.a, k), mul(P.b, k));
export const linAt = (P, x) => add(mul(P.a, x), P.b);

/**
 * Lit une expression du premier degré : termes signés en x et constantes, coefficients
 * entiers, décimaux (virgule) ou fractions, « x/2 » et « -x » compris. Pas de parenthèses :
 * une leçon qui veut 3(x − 5) écrit un PRODUIT de deux facteurs (voir `factors`).
 *   linear('4x-3') · linear('2,5x+100') · linear('-x/2+2') · linear('20') · linear('3/2x-1')
 */
export function linear(src) {
  const s = String(src).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/×/g, '');
  if (s === '') throw new Error('expression vide');
  const terms = s.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join('') !== s) throw new Error(`expression illisible : « ${src} »`);
  let a = frac(0); let b = frac(0);
  for (const raw of terms) {
    const sign = raw.startsWith('-') ? -1 : 1;
    const t = raw.replace(/^[+-]/, '');
    if (t.includes('x')) {
      const m = t.match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?)?x(?:\/(\d+))?$/);
      if (!m) throw new Error(`terme illisible : « ${raw} » dans « ${src} »`);
      let c = m[1] ? parseNumber(m[1]) : frac(1);
      if (m[2]) c = div(c, Number(m[2]));
      a = add(a, mul(c, sign));
    } else {
      b = add(b, mul(parseNumber(t), sign));
    }
  }
  return lin(a, b);
}

/** Écrit a·x + b comme le manuel : « 4x - 3 », « -x + 5 », « \dfrac{5}{2}x », « 0 ». */
export function linLatex(P) {
  const parts = [];
  if (!isZero(P.a)) {
    const c = P.a;
    const coef = eq(c, 1) ? '' : eq(c, -1) ? '-' : fracLatex(c);
    parts.push(`${coef}x`);
  }
  if (!isZero(P.b) || parts.length === 0) {
    const t = fracLatex(P.b);
    parts.push(parts.length === 0 ? t : (P.b.n < 0 ? `- ${t.replace(/^-/, '')}` : `+ ${t}`));
  }
  return parts.join(' ');
}

// ── Équations ─────────────────────────────────────────────────────────────

/**
 * Résout L = R. `unique` (a ≠ 0 après transposition : x = b/a, le cas du manuel),
 * `none` (0 = c, c ≠ 0 : aucun nombre ne convient — ex-9 du manuel), `all` (0 = 0).
 */
export function solveEquation(L, R) {
  const D = linSub(L, R); // (aL − aR)x + (bL − bR) = 0
  if (isZero(D.a)) return isZero(D.b) ? { kind: 'all' } : { kind: 'none' };
  return { kind: 'unique', x: div(neg(D.b), D.a) };
}

/** L’égalité est-elle vraie pour x ? */
export const holds = (L, R, x) => eq(linAt(L, x), linAt(R, x));

// ── Inéquations ───────────────────────────────────────────────────────────

export const RELATIONS = Object.freeze(['<', '<=', '>', '>=']);
const FLIP = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
export const flipRelation = (rel) => FLIP[rel];
export const relationLatex = (rel) => ({ '<': '<', '<=': '\\leq', '>': '>', '>=': '\\geq' })[rel];
export const isStrict = (rel) => rel === '<' || rel === '>';

/** La relation p REL q entre deux nombres exacts. */
export function compareWith(p, rel, q) {
  const c = cmp(p, q);
  return { '<': c < 0, '<=': c <= 0, '>': c > 0, '>=': c >= 0 }[rel];
}

/** L REL R est-elle vraie pour x ? */
export const satisfies = (L, rel, R, x) => compareWith(linAt(L, x), rel, linAt(R, x));

/**
 * Résout L REL R : on ramène à a·x REL' c puis on DIVISE par a — sens gardé si a > 0,
 * INVERSÉ si a < 0 (`flipped`). a = 0 : `all` ou `none` selon la constante.
 * Résultat { kind: 'ray', rel, bound, flipped } : les solutions sont les x tels que x rel bound.
 */
export function solveInequality(L, rel, R) {
  if (!RELATIONS.includes(rel)) throw new Error(`relation inconnue : ${rel}`);
  const D = linSub(L, R); // D.a·x + D.b REL 0
  if (isZero(D.a)) return compareWith(D.b, rel, 0) ? { kind: 'all' } : { kind: 'none' };
  const bound = div(neg(D.b), D.a);
  const flipped = D.a.n < 0;
  return { kind: 'ray', rel: flipped ? FLIP[rel] : rel, bound, flipped };
}

/** x appartient-il à l’ensemble des solutions décrit par { rel, bound } ? */
export const inRay = (ray, x) => compareWith(x, ray.rel, ray.bound);

/**
 * Applique une MÊME opération aux deux membres et dit si le sens change :
 * op ∈ { add, sub, mul, div } et k un nombre. Multiplier ou diviser par 0 est refusé
 * (`zero`) — la balance comme l’inéquation n’en disent plus rien.
 */
export function applyBoth(L, R, op, k, rel = '=') {
  k = F(k);
  if ((op === 'mul' || op === 'div') && isZero(k)) return { refused: 'zero' };
  const f = {
    add: (P) => linAdd(P, lin(0, k)), sub: (P) => linSub(P, lin(0, k)),
    addX: (P) => linAdd(P, lin(k, 0)), subX: (P) => linSub(P, lin(k, 0)),
    mul: (P) => linScale(P, k), div: (P) => linScale(P, div(1, k)),
  }[op];
  if (!f) throw new Error(`opération inconnue : ${op}`);
  const negative = (op === 'mul' || op === 'div') && k.n < 0;
  const nextRel = rel === '=' ? '=' : negative ? FLIP[rel] : rel;
  return { left: f(L), right: f(R), rel: nextRel, flipped: rel !== '=' && negative };
}

/**
 * L'IMAGE d'une demi-droite { rel, bound } par une suite d'étapes [{ op: 'add' | 'mul', k }] (3AM, `loom-threads`, 2026-10-26) : ajouter k déplace
 * la borne ; multiplier par k > 0 la dilate ; par k < 0 la dilate ET renverse le sens ; × 0 écrase tout sur 0 → { collapsed: true }.
 */
export function imageRay(ray, stages = []) {
  let rel = ray.rel;
  let bound = F(ray.bound);
  for (const st of stages) {
    const k = F(st.k);
    if (st.op === 'add') bound = add(bound, k);
    else if (st.op === 'mul') {
      if (isZero(k)) return { collapsed: true };
      bound = mul(bound, k);
      if (k.n < 0) rel = FLIP[rel];
    } else throw new Error(`étape inconnue : ${st.op}`);
  }
  return { rel, bound };
}

/**
 * Le ENCADREMENT de p·x + q quand x est encadré : interval = { lo, loRel, hi, hiRel } (loRel, hiRel ∈ { '<', '<=' }), P = lin(p, q).
 * Les bornes sortent TOUJOURS dans l'ordre croissant, la rigueur de chaque borne est héritée ; p < 0 échange les deux bouts ; p = 0 donne la constante q.
 */
export function boundAffine(interval, P) {
  const p = P.a;
  const q = P.b;
  const at = (x) => add(mul(p, x), q);
  if (isZero(p)) return { lo: q, loRel: '<=', hi: q, hiRel: '<=' };
  if (p.n > 0) return { lo: at(interval.lo), loRel: interval.loRel, hi: at(interval.hi), hiRel: interval.hiRel };
  return { lo: at(interval.hi), loRel: interval.hiRel, hi: at(interval.lo), hiRel: interval.loRel };
}

// ── Produits nuls ─────────────────────────────────────────────────────────

/**
 * Les FACTEURS d'un produit écrit « f1|f2 » (« 3|x-5 », « 3x-4|-2x+1 ») et leurs zéros.
 * Un facteur constant non nul n'a pas de zéro (3 ≠ 0) ; un facteur constant nul rend
 * tout x solution. `roots` est trié, sans doublon : (2x + 1)² = « 2x+1|2x+1 » a UN zéro.
 */
export function factors(src) {
  const fs = String(src).split('|').map(linear);
  if (fs.length === 1) fs.push(fs[0]);
  const zeros = fs.map((P) => (isZero(P.a) ? (isZero(P.b) ? 'all' : null) : div(neg(P.b), P.a)));
  const finite = zeros.filter((z) => z && z !== 'all');
  const roots = finite.filter((z, i) => finite.findIndex((w) => eq(w, z)) === i).sort(cmp);
  return { factors: fs, zeros, roots, everyX: zeros.includes('all') };
}

/** La valeur du produit pour x (exacte). */
export const productAt = (fs, x) => fs.reduce((acc, P) => mul(acc, linAt(P, x)), frac(1));
