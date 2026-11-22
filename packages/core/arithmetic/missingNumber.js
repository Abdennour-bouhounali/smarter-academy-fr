/**
 * Le NOMBRE MANQUANT D'UNE ÉGALITÉ sous le « الحزام المعاكس » (1AM, unité 6 « الحساب الحرفي », درس « البحث عن أعداد ناقصة », 2026-10-30) — arithmétique RATIONNELLE
 * exacte (entiers), sans virgule flottante ; les décimaux sont lus et écrits à la virgule, un quotient qui ne s'arrête pas reste une fraction.
 *
 * Une CARTE de machine est `{ kind, a }` : la machine prend un nombre `x` et rend `run(card, x)` :
 *   add  x + a        sub  x − a        rsub  a − x        mul  x × a        div  x ÷ a
 * L'égalité à trou est « □ ⊕ a = b » : le nombre manquant □ est celui que la machine a reçu ; on le retrouve en FAISANT TOURNER LA MACHINE À REBOURS avec la carte INVERSE
 * (`inverseKind` : add ↔ sub, mul ↔ div ; `rsub` est son propre inverse : □ = a − b). On le VÉRIFIE en le remettant dans la machine (`run(card, □) = b`).
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/missingNumber.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

/** Un rationnel irréductible `{ n, d }` (d > 0). */
export function Q(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error('rationnel invalide');
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return Object.freeze({ n: (s * n) / g, d: (s * d) / g });
}
export const add = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const mul = (x, y) => Q(x.n * y.n, x.d * y.d);
export const div = (x, y) => { if (y.n === 0) throw new Error('division par zéro'); return Q(x.n * y.d, x.d * y.n); };
export const eq = (x, y) => x.n === y.n && x.d === y.d;
export const isNeg = (x) => x.n < 0;
export const isInt = (x) => x.d === 1;

/** « 25,3 », « 25.3 », « 20/7 », « -3 » → rationnel ; `null` si illisible. */
export function parse(raw) {
  const t = String(raw ?? '').replace(/[⁦⁩\s]/g, '').replace(/[−–]/g, '-').replace(/\{,\}/g, ',').replace(/٫/g, ',').replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
  let m = /^(-?)(\d{1,7})\/(\d{1,7})$/.exec(t);
  if (m) { const d = Number(m[3]); if (d === 0) return null; return Q((m[1] ? -1 : 1) * Number(m[2]), d); }
  m = /^(-?)(\d{1,7})(?:[.,](\d{1,4}))?$/.exec(t);
  if (!m) return null;
  const frac = m[3] ?? '';
  return Q((m[1] ? -1 : 1) * Number(m[2] + frac), 10 ** frac.length);
}

/** Un quotient d'entiers est un décimal exact quand son dénominateur n'a que les facteurs 2 et 5. */
export function isTerminating(x) {
  let d = x.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}
/** Le décimal exact écrit à la virgule (« 35,9 », « 24 », « -0,45 ») ; `null` si le quotient ne s'arrête pas. */
export function decimalText(x) {
  if (!isTerminating(x)) return null;
  let k = 0;
  while ((10 ** k) % x.d !== 0) k += 1;
  const neg = x.n < 0;
  const N = Math.abs(x.n) * ((10 ** k) / x.d);
  if (k === 0) return `${neg ? '-' : ''}${N}`;
  const s = String(N).padStart(k + 1, '0');
  return `${neg ? '-' : ''}${s.slice(0, -k)},${s.slice(-k)}`;
}
/** Le texte d'un nombre : décimal à la virgule, sinon « p/q » (ASCII, lu en îlot LTR). */
export const text = (x) => decimalText(x) ?? `${x.n}/${x.d}`;
/** Le même nombre pour KaTeX : « 35{,}9 » ou « \frac{20}{7} » (jamais de signe + ; les négatifs ne sont pas produits par le labo). */
export function latex(x) {
  const dt = decimalText(x);
  if (dt !== null) return dt.replace(',', '{,}');
  return `${x.n < 0 ? '-' : ''}\\frac{${Math.abs(x.n)}}{${x.d}}`;
}

export const KINDS = Object.freeze(['add', 'sub', 'rsub', 'mul', 'div']);
const INVERSE = Object.freeze({ add: 'sub', sub: 'add', rsub: 'rsub', mul: 'div', div: 'mul' });
export const inverseKind = (kind) => { if (!INVERSE[kind]) throw new Error(`carte inconnue : ${kind}`); return INVERSE[kind]; };
/** La famille d'une carte : additive (+ − et « a − ») ou multiplicative (× ÷). */
export const family = (kind) => (kind === 'mul' || kind === 'div' ? 'multiplicative' : 'additive');

/** Une carte de machine : `a` est un rationnel ou un texte lisible. */
export function card(kind, a) {
  if (!KINDS.includes(kind)) throw new Error(`carte inconnue : ${kind}`);
  const q = typeof a === 'object' && a !== null && 'n' in a ? a : parse(a);
  if (!q) throw new Error(`nombre illisible : ${a}`);
  if ((kind === 'mul' || kind === 'div') && q.n === 0) throw new Error('un facteur nul');
  return Object.freeze({ kind, a: q });
}
const inverse = (c) => card(inverseKind(c.kind), c.a);

/** Ce que rend la machine quand on lui donne `x`. */
export function run(c, x) {
  switch (c.kind) {
    case 'add': return add(x, c.a);
    case 'sub': return sub(x, c.a);
    case 'rsub': return sub(c.a, x);
    case 'mul': return mul(x, c.a);
    case 'div': return div(x, c.a);
    default: throw new Error(`carte inconnue : ${c.kind}`);
  }
}
/** Le nombre manquant d'une machine qui a rendu `out` : la machine tournée à rebours avec la carte inverse. */
export const missing = (c, out) => run(inverse(c), out);
/** Le trou est-il bien rempli ? On remet `x` dans la machine. */
export const holds = (c, x, out) => eq(run(c, x), out);

/** La forme de l'égalité à trou : somme, différence (trou en premier ou en second), produit, quotient. */
export const shapeOf = (kind) => ({ add: 'sum', sub: 'diffFirst', rsub: 'diffSecond', mul: 'product', div: 'quotient' })[kind];

/**
 * Le jugement d'une carte CHOISIE à rebours (`pick`) : le labo ne dit jamais la bonne carte, il rend le nombre que la carte choisie a trouvé, puis ce qui sort quand on
 * le remet dans la machine. `{ ok, model, found, fwd }` :
 *   right   la contre-épreuve donne `out`
 *   same    la carte choisie est la carte de la machine elle-même (la machine tourne en avant une fois de plus)
 *   family  une carte de l'autre famille (× ou ÷ pour une machine + ou −, et inversement)
 *   trap    une carte + ou − pour la machine « a − □ » (on a pris l'inverse du signe moins)
 *   neg     le nombre trouvé serait négatif : le nombre d'objets d'un atelier ne l'est pas (le tapis se bloque)
 *   other   une carte de la bonne famille mais pas la bonne direction
 */
export function judgePick(c, pickKind, out) {
  if (!KINDS.includes(pickKind)) throw new Error(`carte inconnue : ${pickKind}`);
  const pick = card(pickKind, c.a);
  let found;
  try { found = run(pick, out); } catch { return { ok: false, model: 'other', found: null, fwd: null }; }
  if (isNeg(found)) return { ok: false, model: 'neg', found, fwd: null };
  let fwd = null;
  try { fwd = run(c, found); } catch { fwd = null; }
  if (fwd && eq(fwd, out)) return { ok: true, model: 'right', found, fwd };
  let model = 'other';
  if (c.kind === 'rsub' && (pickKind === 'add' || pickKind === 'sub')) model = 'trap';
  else if (pickKind === c.kind) model = 'same';
  else if (family(pickKind) !== family(c.kind)) model = 'family';
  return { ok: false, model, found, fwd };
}

