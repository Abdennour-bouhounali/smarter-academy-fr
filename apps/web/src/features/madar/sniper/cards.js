/**
 * « Chasseur de valeurs » — le paquet de cartes (pur : aucun DOM, aucune horloge).
 *
 * CINQUANTE niveaux, chacun en trois sous-niveaux (A, B, C) : tout le
 * programme du cycle moyen, des sommes de 1AM aux rapports trigonométriques
 * de 4AM (levels.js donne l'ordre, les familles et l'entrée par année).
 *
 * Une manche = UNE cible et huit cartes : des écritures ÉGALES à la cible et
 * des PIÈGES — les erreurs que fait vraiment un élève de 11–13 ans (priorité
 * des opérations, numérateurs additionnés, signe oublié, √ d'une somme,
 * distributivité oubliée, (a + b)² = a² + b²…).
 *
 * Trois façons de lire une carte (`mode` du niveau) :
 *   value     la carte VAUT la cible (nombre ou expression en x)
 *   solution  la carte est une équation dont la SOLUTION est la cible
 *   at        la carte est une expression dont la valeur en x = at est la cible
 *
 * La vérité vient de la VALEUR exacte de chaque carte (rationnel, (n/d)·√r,
 * polynôme), jamais de l'intention du modèle : une carte n'est « égale » que si
 * sa clé est celle de la cible ; un piège qui tomberait juste est jeté.
 * `cards.test.js` relit CHAQUE carte affichée avec un évaluateur indépendant.
 *
 * Écriture (tokens) : une liste de
 *   'texte'            chiffres (virgule décimale), x, × ÷ − + = ( ) °, %, √n,
 *                      sin / cos / tan, PGCD( ; ), PPCM( ; )
 *   { frac: [n, d] }   une fraction (n, d : texte, « √3 » permis)
 *   { sqrt: 'r' }      une racine carrée (r peut être « 8 + 18 »)
 *   { sup: 'k' }       un exposant (porté par ce qui précède)
 */
import { createRng } from '../engine/rng';
import { levelAt } from './levels';

// ── Valeurs exactes ─────────────────────────────────────────────────────────

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
};
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

/** Un rationnel n/d réduit. */
export function rat(n, d = 1) {
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return { kind: 'q', n: (s * n) / g, d: (s * d) / g };
}
const asRat = (c) => (typeof c === 'number' ? rat(c) : c);
const qAdd = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
const qMul = (a, b) => rat(a.n * b.n, a.d * b.d);
const qDiv = (a, b) => rat(a.n * b.d, a.d * b.n);

/** c·√N simplifié en (n/d)·√r (r sans facteur carré) ; r = 1 → un rationnel. */
export function surd(c, N) {
  const q = asRat(c);
  let out = 1;
  let r = N;
  for (let k = 2; k * k <= r; k += 1) {
    while (r % (k * k) === 0) {
      r /= k * k;
      out *= k;
    }
  }
  const coef = rat(q.n * out, q.d);
  return r === 1 ? coef : { kind: 's', n: coef.n, d: coef.d, r };
}
/** v ÷ k pour un rationnel ou un (n/d)·√r. */
const divBy = (v, k) => (v.kind === 'q' ? qDiv(v, rat(k)) : surd(rat(v.n, v.d * k), v.r));

/** Un polynôme c0 + c1·x + c2·x². */
const poly = (c0, c1 = 0, c2 = 0) => ({ kind: 'p', c: [c0, c1, c2] });

export function keyOf(v) {
  if (v.kind === 'q') return `q:${v.n}/${v.d}`;
  if (v.kind === 's') return `s:${v.n}/${v.d}:${v.r}`;
  return `p:${v.c.join(',')}`;
}

// ── Écritures ───────────────────────────────────────────────────────────────

const minus = (n) => (n < 0 ? `−${-n}` : String(n));
/** Un nombre relatif dans une opération : (−5) entre parenthèses. */
const rel = (n) => (n < 0 ? `(−${-n})` : String(n));
/** Le coefficient devant x : 1 → x, −1 → −x. */
const cx = (k) => (k === 1 ? 'x' : k === -1 ? '−x' : `${minus(k)}x`);
/** « + 3 » ou « − 3 » après un premier terme. */
const signed = (n) => (n < 0 ? ` − ${-n}` : ` + ${n}`);
const signedX = (k) => (k < 0 ? ` − ${cx(-k)}` : ` + ${cx(k)}`);

/** L'écriture décimale d'un rationnel (virgule), si elle est finie et courte. */
export function decimalOf(v) {
  if (v.kind !== 'q') return null;
  for (let k = 0; k <= 7; k += 1) {
    if ((v.n * 10 ** k) % v.d === 0) {
      const s = (Math.abs(v.n) / v.d).toFixed(k).replace('.', ',');
      return v.n < 0 ? `−${s}` : s;
    }
  }
  return null;
}

function polyTokens([c0, c1, c2]) {
  const out = [];
  const term = (coef, pow) => {
    if (coef === 0) return;
    const first = out.length === 0;
    const sign = coef < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + ');
    const a = Math.abs(coef);
    out.push(sign + (pow === 0 ? String(a) : a === 1 ? 'x' : `${a}x`));
    if (pow === 2) out.push({ sup: '2' });
  };
  term(c2, 2);
  term(c1, 1);
  term(c0, 0);
  return out.length ? out : ['0'];
}

/** L'écriture la plus simple d'une valeur : ce qu'une carte « vaut vraiment ». */
export function valueTokens(v) {
  if (v.kind === 'q') return v.d === 1 ? [minus(v.n)] : [{ frac: [minus(v.n), String(v.d)] }];
  if (v.kind === 's') {
    const coef = v.n === 1 ? '' : v.n === -1 ? '−' : minus(v.n);
    if (v.d === 1) return coef ? [coef, { sqrt: String(v.r) }] : [{ sqrt: String(v.r) }];
    return [{ frac: [`${coef}√${v.r}`, String(v.d)] }];
  }
  return polyTokens(v.c);
}

/** Une écriture en texte plat (clé de déduplication, lecteurs d'écran). */
export function plain(tokens) {
  return tokens.map((t) => {
    if (typeof t === 'string') return t;
    if (t.frac) return `${t.frac[0]}/${t.frac[1]}`;
    if (t.sqrt) return `√${t.sqrt}`;
    return `^${t.sup}`;
  }).join('');
}

const card = (tokens, value) => ({ tokens, value });
const fr = (v) => (v.d === 1 ? minus(v.n) : { frac: [minus(v.n), String(v.d)] });
const F = (n, d) => ({ frac: [minus(n), String(d)] });
const pw = (b, k) => [String(b), { sup: minus(k) }];
const powValue = (b, k) => (k >= 0 ? rat(b ** k) : rat(1, b ** -k));
const dec = (v) => decimalOf(v);
const by = (sub, a, b, c) => [a, b, c][sub - 1];

const divisorsOf = (n, min = 2) => {
  const out = [];
  for (let d = min; d <= Math.abs(n) / min; d += 1) if (n % d === 0) out.push(d);
  return out;
};
const finiteDecimal = (d) => { let x = d; while (x % 2 === 0) x /= 2; while (x % 5 === 0) x /= 5; return x === 1; };
const nonZero = (rng, lo, hi) => { let n = 0; while (n === 0) n = rng.int(lo, hi); return n; };

function primeFactors(n) {
  const out = [];
  let m = n;
  for (let p = 2; p * p <= m; p += 1) {
    let e = 0;
    while (m % p === 0) { m /= p; e += 1; }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
}
function factorTokens(list, op = ' × ') {
  const out = [];
  list.forEach(([p, e], i) => {
    out.push(`${i ? op : ''}${p}`);
    if (e > 1) out.push({ sup: String(e) });
  });
  return out;
}
const productOf = (list) => list.reduce((acc, [p, e]) => acc * p ** e, 1);

// ── Les 50 niveaux ──────────────────────────────────────────────────────────
//
// `B[build](rng, sub)` → { target: {tokens, value}, mode?, at?,
// equal: [() => card|null], traps: [() => card|null], near?: (d) => card|null }.

const B = {};

// 1 · Addition
B.add = (rng, sub) => {
  const t = rng.int(...by(sub, [10, 20], [21, 60], [61, 150]));
  return {
    target: card([String(t)], rat(t)),
    equal: [
      () => { const a = rng.int(1, t - 1); return card([`${a} + ${t - a}`], rat(t)); },
      () => { const a = rng.int(1, t - 2); const b = rng.int(1, t - a - 1); return card([`${a} + ${b} + ${t - a - b}`], rat(t)); },
      () => { const k = rng.int(1, 9); return card([`${t + k} − ${k}`], rat(t)); },
    ],
    traps: [
      () => { const m = t + rng.pick(sub > 1 ? [-10, -1, 1, 10] : [-2, -1, 1, 2]); const a = rng.int(1, m - 1); return card([`${a} + ${m - a}`], rat(m)); },
      () => { const m = t + rng.pick([-1, 1]); const a = rng.int(1, m - 2); const b = rng.int(1, m - a - 1); return card([`${a} + ${b} + ${m - a - b}`], rat(m)); },
    ],
  };
};

// 2 · Soustraction
B.sub = (rng, sub) => {
  const t = rng.int(...by(sub, [5, 15], [16, 50], [51, 120]));
  const big = by(sub, 9, 30, 80);
  return {
    target: card([String(t)], rat(t)),
    equal: [
      () => { const b = rng.int(1, big); return card([`${t + b} − ${b}`], rat(t)); },
      () => { const b = rng.int(1, 9); const c = rng.int(1, 9); return card([`${t + b + c} − ${b} − ${c}`], rat(t)); },
      () => { const a = rng.int(1, t - 1); return card([`${a} + ${t - a}`], rat(t)); },
    ],
    traps: [
      () => { const m = t + rng.pick([-2, -1, 1, 2, 10, -10]); const b = rng.int(1, big); return m > 0 ? card([`${m + b} − ${b}`], rat(m)) : null; },
      // a − b − c lu a − (b − c).
      () => { const b = rng.int(3, 9); const c = rng.int(1, b - 1); const a = t + b - c; return card([`${a} − ${b} − ${c}`], rat(a - b - c)); },
    ],
  };
};

// 3 · Tables de multiplication
B.mul = (rng, sub) => {
  const [lo, hi] = by(sub, [2, 5], [2, 9], [6, 12]);
  const a = rng.int(lo, hi);
  const b = rng.int(lo, hi);
  const t = a * b;
  return {
    target: card([String(t)], rat(t)),
    equal: [
      () => card([`${a} × ${b}`], rat(t)),
      () => card([`${a} × ${b - 1} + ${a}`], rat(a * (b - 1) + a)),
      () => card([`${b} × ${a - 1} + ${b}`], rat(b * (a - 1) + b)),
      () => { const ds = divisorsOf(t).filter((d) => d !== a && d !== b); if (!ds.length) return null; const d = rng.pick(ds); return card([`${d} × ${t / d}`], rat(t)); },
      () => (b <= 5 ? card([Array(b).fill(a).join(' + ')], rat(t)) : null),
      () => card([`${t + a} − ${a}`], rat(t)),
    ],
    traps: [
      () => card([`${a + 1} × ${b}`], rat((a + 1) * b)),
      () => { const e = b + rng.pick([-1, 1]); return e > 0 ? card([`${a} × ${e}`], rat(a * e)) : null; },
      () => card([`${a} + ${b}`], rat(a + b)),
      () => card([`${a} × ${b} + ${a}`], rat(t + a)),
    ],
  };
};

// 4 · Division
B.div = (rng, sub) => {
  const q = rng.int(...by(sub, [2, 9], [5, 15], [10, 30]));
  const dr = by(sub, [2, 5], [2, 9], [3, 12]);
  return {
    target: card([String(q)], rat(q)),
    equal: [
      () => { const d = rng.int(...dr); return card([`${q * d} ÷ ${d}`], rat(q)); },
      () => { const d = rng.int(...dr); return card([`${q * d} ÷ ${d}`], rat(q)); },
      () => { const d = rng.int(...dr); return card([`${q * d * 2} ÷ ${2 * d}`], rat(q)); },
      () => { const d = rng.int(...dr); return card([`${q * d + d} ÷ ${d} − 1`], rat(q)); },
    ],
    traps: [
      () => { const d = rng.int(...dr); return card([`${(q + 1) * d} ÷ ${d}`], rat(q + 1)); },
      () => { const d = rng.int(...dr); return card([`${q * d} − ${d}`], rat(q * d - d)); },
      () => { const d = rng.int(...dr); return q > 1 ? card([`${(q - 1) * d} ÷ ${d}`], rat(q - 1)) : null; },
    ],
  };
};

// 5 · Additions et soustractions mêlées
B.addSub = (rng, sub) => {
  const t = rng.int(...by(sub, [10, 30], [20, 80], [50, 200]));
  return {
    target: card([String(t)], rat(t)),
    equal: [
      () => { const b = rng.int(1, 20); const c = rng.int(1, b); return card([`${t - b + c} + ${b} − ${c}`], rat(t)); },
      () => { const a = t + rng.int(5, 30); const b = rng.int(1, a - 1); const c = t - a + b; return c >= 1 ? card([`${a} − ${b} + ${c}`], rat(t)) : null; },
      () => { const k = rng.int(1, 9); return card([`${t + k} − ${k}`], rat(t)); },
    ],
    traps: [
      // a − b + c lu a − (b + c).
      () => { const b = rng.int(2, 15); const c = rng.int(1, 9); const a = t + b + c; return card([`${a} − ${b} + ${c}`], rat(a - b + c)); },
      () => { const m = t + rng.pick([-2, -1, 1, 2]); const b = rng.int(1, 20); const c = rng.int(1, b); return card([`${m - b + c} + ${b} − ${c}`], rat(m)); },
    ],
  };
};

// 6 · La multiplication avant l’addition
B.prio = (rng, sub) => {
  const n = rng.int(...by(sub, [10, 30], [20, 60], [40, 100]));
  const smallDiv = divisorsOf(n).filter((c) => n / c >= 2 && c <= 9);
  const ab = () => { const b = rng.int(2, 5); const c = rng.int(2, Math.max(2, Math.floor((n - 1) / b))); return [n - b * c, b, c]; };
  return {
    target: card([String(n)], rat(n)),
    equal: [
      () => { const [a, b, c] = ab(); return a >= 1 ? card([`${a} + ${b} × ${c}`], rat(a + b * c)) : null; },
      () => { const [a, b, c] = ab(); return a >= 1 ? card([`${b} × ${c} + ${a}`], rat(a + b * c)) : null; },
      () => { const a = rng.int(2, 6); const b = Math.ceil((n + 1) / a) + rng.int(0, 2); const c = a * b - n; return c >= 1 && c <= 30 ? card([`${a} × ${b} − ${c}`], rat(a * b - c)) : null; },
      () => { const b = rng.int(2, 5); return card([`${n * b} ÷ ${b}`], rat(n)); },
    ],
    traps: [
      // Lu de gauche à droite : (a + b) × c = n, mais a + b × c ≠ n.
      () => { if (!smallDiv.length) return null; const c = rng.pick(smallDiv); const s = n / c; const a = rng.int(1, s - 1); return card([`${a} + ${s - a} × ${c}`], rat(a + (s - a) * c)); },
      // a × b − c lu a × (b − c).
      () => { const ds = divisorsOf(n); if (!ds.length) return null; const a = rng.pick(ds); const c = rng.int(1, 4); const b = n / a + c; return card([`${a} × ${b} − ${c}`], rat(a * b - c)); },
    ],
  };
};

// 7 · Les parenthèses
B.parens = (rng, sub) => {
  const n = rng.int(...by(sub, [12, 30], [20, 72], [40, 120]));
  const ds = divisorsOf(n).filter((c) => n / c >= 2 && c <= 12);
  return {
    target: card([String(n)], rat(n)),
    equal: [
      () => { if (!ds.length) return null; const c = rng.pick(ds); const s = n / c; const a = rng.int(1, s - 1); return card([`(${a} + ${s - a}) × ${c}`], rat(n)); },
      () => { if (!ds.length) return null; const c = rng.pick(ds); const s = n / c; const b = rng.int(1, 9); return card([`${c} × (${s + b} − ${b})`], rat(n)); },
      () => { if (!ds.length) return null; const c = rng.pick(ds); const s = n / c; const a = rng.int(1, s - 1); return card([`${c} × (${a} + ${s - a})`], rat(n)); },
      () => { const k = rng.int(2, 6); const b = rng.int(1, 9); return card([`(${n + b} − ${b}) × ${k} ÷ ${k}`], rat(n)); },
    ],
    traps: [
      // Les parenthèses ignorées : a + b × c = n, mais (a + b) × c ≠ n.
      () => { const b = rng.int(2, 5); const c = rng.int(2, Math.max(2, Math.floor((n - 1) / b))); const a = n - b * c; return a >= 1 ? card([`(${a} + ${b}) × ${c}`], rat((a + b) * c)) : null; },
      () => { if (!ds.length) return null; const c = rng.pick(ds); const s = n / c; const a = rng.int(1, s - 1); return card([`${a} + ${s - a} × ${c}`], rat(a + (s - a) * c)); },
    ],
  };
};

// 8 · Priorités enchaînées
B.prio2 = (rng, sub) => {
  const n = rng.int(...by(sub, [10, 40], [30, 90], [50, 150]));
  return {
    target: card([String(n)], rat(n)),
    equal: [
      () => { const c = rng.int(2, 6); const d = rng.int(2, 6); const m = n + c * d; const ds = divisorsOf(m).filter((x) => x <= 12); if (!ds.length) return null; const a = rng.pick(ds); return card([`${a} × ${m / a} − ${c} × ${d}`], rat(n)); },
      () => { const c = rng.int(2, 5); const d = rng.int(2, 5); const m = n - c * d; if (m < 4) return null; const ds = divisorsOf(m).filter((x) => x <= 12); if (!ds.length) return null; const a = rng.pick(ds); return card([`${a} × ${m / a} + ${c} × ${d}`], rat(n)); },
      () => { const ds = divisorsOf(n).filter((x) => x <= 9); if (!ds.length) return null; const a = rng.pick(ds); const s = n / a; const d = rng.int(1, 5); return card([`${a} × (${s + d} − ${d})`], rat(n)); },
      () => { const k = rng.int(2, 4); const b = rng.int(1, 9); return card([`${n * k + b * k} ÷ ${k} − ${b}`], rat(n)); },
    ],
    traps: [
      // a × b − c × d lu ((a × b) − c) × d.
      () => { const ds = divisorsOf(n).filter((x) => x <= 6); if (!ds.length) return null; const d = rng.pick(ds); const m = n / d; const a = rng.int(2, 6); const b = Math.ceil((m + 1) / a) + 1; const c = a * b - m; return c >= 1 ? card([`${a} × ${b} − ${c} × ${d}`], rat(a * b - c * d)) : null; },
      () => { const m = n + rng.pick([-2, -1, 1, 2]); const c = rng.int(2, 5); const d = rng.int(2, 5); const s = m + c * d; const ds = divisorsOf(s).filter((x) => x <= 12); if (!ds.length) return null; const a = rng.pick(ds); return card([`${a} × ${s / a} − ${c} × ${d}`], rat(m)); },
    ],
  };
};

// 9 · Décomposition en facteurs premiers
B.factor = (rng, sub) => {
  const t = rng.pick(by(sub, [12, 18, 20, 24, 28, 36, 40, 45], [48, 60, 72, 84, 90, 100, 108], [120, 144, 180, 200, 240, 360]));
  const f = primeFactors(t);
  const flat = f.flatMap(([p, e]) => Array(e).fill(p));
  return {
    target: card([String(t)], rat(t)),
    equal: [
      () => card(factorTokens(f), rat(t)),
      () => (flat.length <= 6 ? card([flat.join(' × ')], rat(t)) : null),
      () => { const d = rng.pick(divisorsOf(t)); return card([`${d} × ${t / d}`], rat(t)); },
      () => { const [p, e] = f[0]; const rest = t / p ** e; return e > 1 && rest > 1 ? card([String(p), { sup: String(e) }, ` × ${rest}`], rat(t)) : null; },
    ],
    traps: [
      () => { const i = rng.int(0, f.length - 1); const g = f.map(([p, e], j) => [p, j === i ? Math.max(1, e + rng.pick([-1, 1])) : e]); return card(factorTokens(g), rat(productOf(g))); },
      // × remplacé par + : 2² + 3².
      () => (f.length >= 2 ? card(factorTokens(f, ' + '), rat(f.reduce((acc, [p, e]) => acc + p ** e, 0))) : null),
      // La base et l'exposant échangés.
      () => { const i = f.findIndex(([, e]) => e > 1); if (i < 0) return null; const g = f.map(([p, e], j) => (j === i ? [e, p] : [p, e])); return card(factorTokens(g), rat(productOf(g))); },
    ],
  };
};

// 10 · Le plus grand diviseur commun
B.pgcd = (rng, sub) => {
  const g = rng.int(...by(sub, [2, 6], [4, 12], [6, 25]));
  const coprime = () => { for (;;) { const a = rng.int(2, 9); const b = rng.int(2, 9); if (a !== b && gcd(a, b) === 1) return [a, b]; } };
  const P = (x, y) => card([`PGCD(${x} ; ${y})`], rat(gcd(x, y)));
  const good = () => { const [a, b] = coprime(); return P(g * a, g * b); };
  return {
    target: card([String(g)], rat(g)),
    equal: [good, good, good, good],
    traps: [
      () => { const k = rng.int(2, 3); const [a, b] = coprime(); return P(g * a * k, g * b * k); },
      () => { const [a, b] = coprime(); const h = g + rng.pick([-1, 1]); return h > 1 ? P(h * a, h * b) : null; },
      // Le produit pris pour le PGCD.
      () => { const [a] = coprime(); return card([`${g} × ${a}`], rat(g * a)); },
    ],
  };
};

// 11 · Le plus petit multiple commun
B.ppcm = (rng, sub) => {
  const l = rng.pick(by(sub, [12, 18, 20, 24, 30], [36, 40, 42, 48, 60], [72, 84, 90, 120]));
  const ds = [...divisorsOf(l), l];
  const pairs = [];
  for (const x of ds) for (const y of ds) if (x < y) pairs.push([x, y]);
  const good = pairs.filter(([x, y]) => lcm(x, y) === l);
  const bad = pairs.filter(([x, y]) => lcm(x, y) !== l);
  const P = (x, y) => card([`PPCM(${x} ; ${y})`], rat(lcm(x, y)));
  return {
    target: card([String(l)], rat(l)),
    equal: [() => P(...rng.pick(good)), () => P(...rng.pick(good)), () => P(...rng.pick(good)), () => { const d = rng.pick(divisorsOf(l)); return card([`${d} × ${l / d}`], rat(l)); }],
    traps: [
      () => (bad.length ? P(...rng.pick(bad)) : null),
      () => (bad.length ? P(...rng.pick(bad)) : null),
      // Le produit pris pour le PPCM.
      () => { const [x, y] = rng.pick(good); return card([`${x} × ${y}`], rat(x * y)); },
    ],
  };
};

const fracTarget = (rng, qs, improper = false) => {
  const q = rng.pick(qs);
  let p = rng.int(1, improper ? 2 * q - 1 : q - 1);
  while (p === q || gcd(p, q) !== 1) p = rng.int(1, improper ? 2 * q - 1 : q - 1);
  return [p, q];
};

// 12 · Fractions égales
B.fracEq = (rng, sub) => {
  const [p, q] = fracTarget(rng, by(sub, [2, 3, 4, 5], [3, 4, 5, 6, 7, 8], [6, 7, 8, 9, 10, 12]));
  const kmax = by(sub, 5, 8, 12);
  const eq = () => { const k = rng.int(2, kmax); return card([F(k * p, k * q)], rat(p, q)); };
  return {
    target: card([F(p, q)], rat(p, q)),
    equal: [eq, eq, eq, eq],
    traps: [
      () => { const k = rng.int(1, 3); return card([F(p + k, q + k)], rat(p + k, q + k)); },
      () => card([F(q, p)], rat(q, p)),
      () => { const k = rng.int(2, kmax); const m = k + rng.pick([-1, 1]); return card([F(k * p, m * q)], rat(k * p, m * q)); },
    ],
  };
};

// 13 · Simplifier une fraction
B.fracSimplify = (rng, sub) => {
  const [p, q] = fracTarget(rng, by(sub, [2, 3, 4, 5], [3, 4, 5, 6, 8], [4, 6, 8, 9, 12]));
  const k = rng.int(...by(sub, [2, 4], [3, 6], [4, 9]));
  const v = rat(p, q);
  return {
    target: card([F(k * p, k * q)], v),
    equal: [
      () => card([F(p, q)], v),
      () => { const m = rng.int(2, k + 3); return m === k ? null : card([F(m * p, m * q)], v); },
      () => (finiteDecimal(q) ? card([dec(v)], v) : null),
      () => { const m = rng.int(2, 5); return m === k ? null : card([F(m * p, m * q)], v); },
    ],
    traps: [
      // Seul le numérateur divisé.
      () => card([F(p, k * q)], rat(p, k * q)),
      () => card([F(k * p - 1, k * q)], rat(k * p - 1, k * q)),
      () => card([F(q, p)], rat(q, p)),
      () => card([F(p + 1, q)], rat(p + 1, q)),
    ],
  };
};

// 14 · Additionner des fractions de même dénominateur
B.fracSameDen = (rng, sub) => {
  const q = rng.pick(by(sub, [3, 4, 5], [5, 6, 7, 8], [7, 9, 10, 12]));
  const p = rng.int(2, 2 * q - 1);
  const v = rat(p, q);
  const sum = () => { const a = rng.int(1, p - 1); return card([F(a, q), ' + ', F(p - a, q)], v); };
  return {
    target: card([fr(v)], v),
    equal: [sum, sum, () => { const m = rng.int(1, 5); return card([F(p + m, q), ' − ', F(m, q)], v); }, () => card([F(2 * p, 2 * q)], v)],
    traps: [
      // Les dénominateurs additionnés aussi : a/q + b/q « = » (a + b)/(2q).
      () => { const a = rng.int(1, 2 * p - 1); return card([F(a, q), ' + ', F(2 * p - a, q)], rat(2 * p, q)); },
      () => { const m = p + rng.pick([-1, 1]); if (m < 2) return null; const a = rng.int(1, m - 1); return card([F(a, q), ' + ', F(m - a, q)], rat(m, q)); },
    ],
  };
};

// 15 · Additionner et soustraire des fractions de dénominateurs différents
B.fracAdd = (rng, sub) => {
  const [p, q] = fracTarget(rng, by(sub, [2, 4, 6], [3, 4, 6, 8, 10], [5, 6, 8, 9, 10, 12]), true);
  const v = rat(p, q);
  const split = (k) => { const n1 = rng.int(1, k * p - 1); const a = rat(n1, k * q); const b = rat(k * p - n1, k * q); return card([fr(a), ' + ', fr(b)], qAdd(a, b)); };
  return {
    target: card([F(p, q)], v),
    equal: [
      () => split(2),
      () => split(3),
      () => (p < q ? card(['1 − ', F(q - p, q)], v) : card(['1 + ', F(p - q, q)], v)),
      () => { const h = rat(p, 2 * q); return card(['2 × ', fr(h)], qMul(rat(2), h)); },
      () => card([fr(qAdd(v, rat(1, 2))), ' − ', F(1, 2)], v),
    ],
    traps: [
      // Numérateurs et dénominateurs additionnés.
      () => { const k = rng.int(2, 3); const a = rng.int(1, k * p - 1); const b = rng.int(2, Math.max(2, k * q - 2)); const c = k * p - a; const d = k * q - b; return d >= 2 ? card([F(a, b), ' + ', F(c, d)], rat(a * d + c * b, b * d)) : null; },
      () => { const k = rng.int(1, 3); return card([F(p + k, q + k)], rat(p + k, q + k)); },
      () => card([F(q, p)], rat(q, p)),
    ],
  };
};

// 16 · Multiplier des fractions
B.fracMul = (rng, sub) => {
  const [p, q] = fracTarget(rng, by(sub, [4, 6, 8, 9], [6, 8, 10, 12, 15], [10, 12, 14, 15, 18, 20]));
  const v = rat(p, q);
  const split = () => {
    const qs = divisorsOf(q, 1).filter((d) => d > 1 && d < q);
    const q1 = qs.length ? rng.pick(qs) : 1;
    const p1 = rng.pick(divisorsOf(p, 1));
    return [p1, q1, p / p1, q / q1];
  };
  return {
    target: card([F(p, q)], v),
    equal: [
      () => { const [a, b, c, d] = split(); return card([F(a, b), ' × ', F(c, d)], qMul(rat(a, b), rat(c, d))); },
      () => { const [a, b, c, d] = split(); return card([F(c, b), ' × ', F(a, d)], qMul(rat(c, b), rat(a, d))); },
      () => { const k = rng.int(2, 4); return card([F(p * k, q), ' × ', F(1, k)], v); },
      () => { const k = rng.int(2, 3); return card([`${k} × `, F(p, k * q)], v); },
    ],
    traps: [
      // La somme au lieu du produit.
      () => { const [a, b, c, d] = split(); return card([F(a, b), ' + ', F(c, d)], qAdd(rat(a, b), rat(c, d))); },
      // Un facteur renversé.
      () => { const [a, b, c, d] = split(); return c !== d ? card([F(a, b), ' × ', F(d, c)], qMul(rat(a, b), rat(d, c))) : null; },
      () => { const k = rng.int(2, 3); return card([`${k} × `, F(p, q)], qMul(rat(k), v)); },
    ],
  };
};

// 17 · Diviser des fractions
B.fracDiv = (rng, sub) => {
  const [p, q] = fracTarget(rng, by(sub, [2, 3, 4], [3, 4, 5, 6], [5, 6, 7, 8, 9]), true);
  const v = rat(p, q);
  const divisor = () => { const c = rng.int(1, 5); let d = rng.int(2, 7); while (d === c) d = rng.int(2, 7); return rat(c, d); };
  const eq = () => { const cd = divisor(); const ab = qMul(v, cd); return card([fr(ab), ' ÷ ', fr(cd)], qDiv(ab, cd)); };
  return {
    target: card([fr(v)], v),
    equal: [eq, eq, eq, () => { const k = rng.int(2, 4); return card([F(p * k, q), ` ÷ ${k}`], v); }],
    traps: [
      // Sans renverser : a/b ÷ c/d « = » (a·c)/(b·d).
      () => { const cd = divisor(); const ab = qDiv(v, cd); return card([fr(ab), ' ÷ ', fr(cd)], qDiv(ab, cd)); },
      () => { const cd = divisor(); const ab = qMul(v, cd); return card([fr(ab), ' × ', fr(cd)], qMul(ab, cd)); },
    ],
  };
};

// 18 · Fraction d’un nombre
B.fracOf = (rng, sub) => {
  const t = rng.int(...by(sub, [2, 12], [6, 30], [12, 60]));
  const make = () => {
    const a = rng.pick(divisorsOf(t, 1).filter((x) => x <= 9));
    let b = rng.int(a + 1, a + 6);
    while (gcd(a, b) !== 1) b += 1;
    return [a, b, (t / a) * b];
  };
  return {
    target: card([String(t)], rat(t)),
    equal: [
      () => { const [a, b, n] = make(); return card([F(a, b), ` × ${n}`], qMul(rat(a, b), rat(n))); },
      () => { const [a, b, n] = make(); return card([F(a, b), ` × ${n}`], qMul(rat(a, b), rat(n))); },
      () => { const [a, b, n] = make(); return card([`${n} ÷ ${b} × ${a}`], qMul(rat(n, b), rat(a))); },
      () => { const [a, b, n] = make(); return card([`${n} × `, F(a, b)], qMul(rat(a, b), rat(n))); },
    ],
    traps: [
      () => { const [a, b, n] = make(); return card([F(b, a), ` × ${n}`], qMul(rat(b, a), rat(n))); },
      () => { const [a, b, n] = make(); return card([`${n} ÷ ${a} × ${b}`], qMul(rat(n, a), rat(b))); },
      () => { const [a, b, n] = make(); return card([F(a, b), ` + ${n}`], qAdd(rat(a, b), rat(n))); },
    ],
  };
};

// 19 · Fraction et nombre décimal
B.decFrac = (rng, sub) => {
  const [p, q] = fracTarget(rng, by(sub, [2, 4, 5, 10], [4, 5, 8, 10, 20], [8, 16, 20, 25, 40]), sub > 1);
  const v = rat(p, q);
  return {
    target: card([dec(v)], v),
    equal: [
      () => card([F(p, q)], v),
      () => { const k = rng.int(2, 5); return card([F(k * p, k * q)], v); },
      () => card([`${p} ÷ ${q}`], v),
      () => { const c = qMul(v, rat(100)); return c.d === 1 ? card([`${c.n} %`], v) : null; },
      () => { const c = qMul(v, rat(1000)); return c.d === 1 ? card([F(c.n, 1000)], v) : null; },
    ],
    traps: [
      () => (p < 10 && q < 10 ? card([`0,${p}${q}`], rat(10 * p + q, 100)) : null),
      () => card([F(q, p)], rat(q, p)),
      () => card([F(1, q)], rat(1, q)),
      () => { const w = qMul(v, rat(10)); return card([dec(w)], w); },
      () => { const w = qDiv(v, rat(10)); return card([dec(w)], w); },
    ],
  };
};

// 20 · Calculs sur les nombres décimaux
B.decOps = (rng, sub) => {
  const unit = by(sub, 10, 100, 100);
  const T = rng.int(...by(sub, [11, 99], [101, 999], [1001, 4999]));
  const v = rat(T, unit);
  const D = (n) => dec(rat(n, unit));
  return {
    target: card([dec(v)], v),
    equal: [
      () => { const a = rng.int(1, T - 1); return card([`${D(a)} + ${D(T - a)}`], v); },
      () => { const a = rng.int(1, T); return card([`${D(T + a)} − ${D(a)}`], v); },
      () => { const h = qDiv(v, rat(2)); return card([`${dec(h)} × 2`], v); },
      () => card([`${dec(qMul(v, rat(10)))} ÷ 10`], v),
    ],
    traps: [
      // La virgule déplacée.
      () => { const a = rng.int(1, T - 1); return card([`${D(a * 10)} + ${D((T - a) * 10)}`], qMul(v, rat(10))); },
      () => card([`${dec(qMul(v, rat(10)))} × 10`], qMul(v, rat(100))),
      () => { const m = T + rng.pick([-10, -1, 1, 10]); if (m < 2) return null; const a = rng.int(1, m - 1); return card([`${D(a)} + ${D(m - a)}`], rat(m, unit)); },
    ],
  };
};

// 21 · Pourcentages
B.percent = (rng, sub) => {
  const [p, q] = rng.pick(by(sub, [[1, 2], [1, 4], [3, 4], [1, 10]], [[1, 5], [2, 5], [3, 10], [7, 10], [3, 5]], [[1, 20], [3, 20], [1, 8], [3, 8], [9, 25], [6, 25]]));
  const v = rat(p, q);
  const pct = qMul(v, rat(100));
  return {
    target: card([`${dec(pct)} %`], v),
    equal: [
      () => card([F(p, q)], v),
      () => card([dec(v)], v),
      () => { const k = rng.int(2, 4); return card([F(k * p, k * q)], v); },
      () => card([F(10 * p, 10 * q)], v),
    ],
    traps: [
      () => card([`${q} %`], rat(q, 100)),
      () => card([dec(pct)], pct),
      () => { const w = qDiv(pct, rat(10)); return card([dec(w)], w); },
      () => card([F(q, p)], rat(q, p)),
    ],
  };
};

// 22 · Pourcentage d’une quantité
B.percentOf = (rng, sub) => {
  const ps = by(sub, [10, 20, 25, 50], [5, 10, 15, 20, 25, 40, 75], [5, 12, 15, 35, 45, 60, 80]);
  const t = rng.int(...by(sub, [2, 20], [3, 40], [6, 90]));
  const make = () => {
    for (let i = 0; i < 20; i += 1) {
      const p = rng.pick(ps);
      if ((t * 100) % p === 0) return [p, (t * 100) / p];
    }
    return [10, t * 10];
  };
  return {
    target: card([String(t)], rat(t)),
    equal: [
      () => { const [p, n] = make(); return card([`${p} % × ${n}`], qMul(rat(p, 100), rat(n))); },
      () => { const [p, n] = make(); return card([`${p} % × ${n}`], qMul(rat(p, 100), rat(n))); },
      () => { const [p, n] = make(); return card([`${n} × `, F(p, 100)], qMul(rat(p, 100), rat(n))); },
      () => { const [p, n] = make(); return card([`${n} ÷ 100 × ${p}`], qMul(rat(n, 100), rat(p))); },
    ],
    traps: [
      () => { const [p, n] = make(); return card([`${p} % × ${n * 10}`], qMul(rat(p, 100), rat(n * 10))); },
      () => { const [p, n] = make(); return card([`${p} + ${n} ÷ 100`], qAdd(rat(p), rat(n, 100))); },
      () => { const [p, n] = make(); return card([`${p + 5} % × ${n}`], qMul(rat(p + 5, 100), rat(n))); },
    ],
  };
};

// 23 · Additionner des nombres relatifs
B.relAdd = (rng, sub) => {
  const R = by(sub, 10, 30, 80);
  const t = nonZero(rng, -R, R);
  const eq = () => { const a = nonZero(rng, -R, R); const b = t - a; return b === 0 ? null : card([`${minus(a)} + ${rel(b)}`], rat(t)); };
  return {
    target: card([minus(t)], rat(t)),
    equal: [eq, eq, eq, eq],
    traps: [
      // Le signe du résultat oublié : −t.
      () => { const a = nonZero(rng, -R, R); const b = -t - a; return b === 0 ? null : card([`${minus(a)} + ${rel(b)}`], rat(-t)); },
      // −a + b calculé −(a + b).
      () => {
        if (t < 0) { const a = rng.int(1, Math.max(1, -t - 1)); const b = -t - a; return b > 0 ? card([`−${a} + ${b}`], rat(b - a)) : null; }
        const a = rng.int(1, Math.max(1, t - 1)); const b = t - a; return b > 0 ? card([`${a} + (−${b})`], rat(a - b)) : null;
      },
      () => { const m = t + rng.pick([-2, -1, 1, 2]); const a = nonZero(rng, -R, R); return m - a === 0 ? null : card([`${minus(a)} + ${rel(m - a)}`], rat(m)); },
    ],
  };
};

// 24 · Soustraire des nombres relatifs
B.relSub = (rng, sub) => {
  const R = by(sub, 10, 30, 80);
  const t = nonZero(rng, -R, R);
  const eq = () => { const b = nonZero(rng, -R, R); return card([`${minus(t + b)} − ${rel(b)}`], rat(t)); };
  return {
    target: card([minus(t)], rat(t)),
    equal: [eq, eq, eq, eq],
    traps: [
      // a − (−b) lu a − b.
      () => { const b = rng.int(2, R); return card([`${minus(t + b)} − ${rel(-b)}`], rat(t + 2 * b)); },
      () => { const b = nonZero(rng, -R, R); return card([`${minus(b)} − ${rel(t + b)}`], rat(-t)); },
    ],
  };
};

// 25 · Multiplier et diviser des nombres relatifs
B.relMul = (rng, sub) => {
  const [lo, hi] = by(sub, [2, 5], [2, 9], [3, 12]);
  const a = rng.int(lo, hi) * rng.pick([-1, 1]);
  const b = rng.int(lo, hi) * rng.pick([-1, 1]);
  const t = a * b;
  return {
    target: card([minus(t)], rat(t)),
    equal: [
      () => card([`${minus(a)} × ${rel(b)}`], rat(t)),
      () => card([`${minus(-a)} × ${rel(-b)}`], rat(t)),
      () => { const d = nonZero(rng, -6, 6); return card([`${minus(t * d)} ÷ ${rel(d)}`], rat(t)); },
      () => card([`${minus(2 * a)} × ${rel(b)} ÷ 2`], rat(t)),
    ],
    traps: [
      () => card([`${minus(-a)} × ${rel(b)}`], rat(-t)),
      () => { const d = nonZero(rng, -6, 6); return card([`${minus(-t * d)} ÷ ${rel(d)}`], rat(-t)); },
      () => card([`${minus(a)} + ${rel(b)}`], rat(a + b)),
    ],
  };
};

// 26 · Calculs enchaînés sur les nombres relatifs
B.relMix = (rng, sub) => {
  const R = by(sub, 15, 40, 90);
  const t = nonZero(rng, -R, R);
  const plus = () => { const b = nonZero(rng, -6, 6); const c = nonZero(rng, -6, 6); return card([`${minus(t - b * c)} + ${rel(b)} × ${rel(c)}`], rat(t)); };
  return {
    target: card([minus(t)], rat(t)),
    equal: [plus, plus, plus, () => { const b = nonZero(rng, -6, 6); const c = nonZero(rng, -6, 6); return card([`${minus(t + b * c)} − ${rel(b)} × ${rel(c)}`], rat(t)); }],
    traps: [
      // De gauche à droite : (a + b) × c.
      () => { const c = rng.pick([-3, -2, 2, 3]); if (t % c) return null; const b = nonZero(rng, -6, 6); const a = t / c - b; return card([`${minus(a)} + ${rel(b)} × ${rel(c)}`], rat(a + b * c)); },
      // Le signe du produit.
      () => { const b = nonZero(rng, -6, 6); const c = nonZero(rng, -6, 6); const a = t + b * c; return card([`${minus(a)} + ${rel(b)} × ${rel(c)}`], rat(a + b * c)); },
    ],
  };
};

// 27 · Puissances d’un nombre entier
B.powNat = (rng, sub) => {
  const b = rng.int(...by(sub, [2, 5], [2, 10], [2, 12]));
  const k = rng.int(2, by(sub, 3, 4, b <= 3 ? 6 : 4));
  const v = powValue(b, k);
  return {
    target: card([String(b ** k)], v),
    equal: [
      () => card(pw(b, k), v),
      () => (k <= 4 ? card([Array(k).fill(String(b)).join(' × ')], v) : null),
      () => (k > 2 ? card([...pw(b, k - 1), ` × ${b}`], v) : null),
      () => (k % 2 ? null : card(pw(b * b, k / 2), v)),
      () => card([`${b ** k + b} − ${b}`], v),
    ],
    traps: [
      () => card([`${b} × ${k}`], rat(b * k)),
      () => (k !== b ? card(pw(k, b), powValue(k, b)) : null),
      () => card(pw(b, k + 1), powValue(b, k + 1)),
      () => card(pw(b + 1, k), powValue(b + 1, k)),
    ],
  };
};

const POWER_BASES = [
  { b: 2, ks: [3, 4, 5, 6, 7, 8] },
  { b: 3, ks: [2, 3, 4] },
  { b: 5, ks: [2, 3] },
];

// 28 · Produit et quotient de puissances
B.powRules = (rng, sub) => {
  const { b, ks } = rng.pick(POWER_BASES.slice(0, by(sub, 2, 3, 3)));
  const k = rng.pick(ks);
  const v = powValue(b, k);
  return {
    target: card(pw(b, k), v),
    equal: [
      () => { const m = rng.int(1, k - 1); return card([...pw(b, m), ' × ', ...pw(b, k - m)], v); },
      () => { const n = rng.int(1, 3); return card([...pw(b, k + n), ' ÷ ', ...pw(b, n)], v); },
      () => { const ds = divisorsOf(k); if (!ds.length) return null; const m = rng.pick(ds); return card(['(', ...pw(b, m), ')', { sup: String(k / m) }], v); },
      () => card([String(b ** k)], v),
    ],
    traps: [
      // Les exposants multipliés : bᵐ × bⁿ « = » b^(m·n).
      () => { const ds = divisorsOf(k); if (!ds.length) return null; const m = rng.pick(ds); return card([...pw(b, m), ' × ', ...pw(b, k / m)], powValue(b, m + k / m)); },
      // Les exposants divisés : b^(2k) ÷ b² « = » b^k.
      () => card([...pw(b, 2 * k), ' ÷ ', ...pw(b, 2)], powValue(b, 2 * k - 2)),
      () => card([`${b} × ${k}`], rat(b * k)),
      () => { const e = k + rng.pick([-1, 1]); return card(pw(b, e), powValue(b, e)); },
    ],
  };
};

// 29 · Puissances de 10
B.pow10 = (rng, sub) => {
  const k = rng.pick(by(sub, [-2, -1, 2, 3], [-3, -2, 2, 3, 4], [-6, -5, -4, -3, 4, 5, 6]));
  const v = powValue(10, k);
  return {
    target: card([dec(v)], v),
    equal: [
      () => card(pw(10, k), v),
      () => { const m = rng.int(1, 4); return k - m === 0 ? null : card([...pw(10, m), ' × ', ...pw(10, k - m)], v); },
      () => { const n = rng.int(1, 3); return card([...pw(10, k + n), ' ÷ ', ...pw(10, n)], v); },
      () => (k < 0 ? card([F(1, 10 ** -k)], v) : card([`${10 ** (k - 1)} × 10`], v)),
    ],
    traps: [
      // Le signe de l'exposant oublié.
      () => card(pw(10, -k), powValue(10, -k)),
      () => card([`10 × ${rel(k)}`], rat(10 * k)),
      () => { const e = k + rng.pick([-1, 1]); return e === 0 ? null : card(pw(10, e), powValue(10, e)); },
    ],
  };
};

// 30 · Écriture scientifique
B.sci = (rng, sub) => {
  const M = rng.int(11, 99);
  const e = rng.int(...by(sub, [1, 3], [-3, 4], [-6, 6]));
  const v = qMul(rat(M, 10), powValue(10, e));
  const m = (num, den, ex) => [`${dec(rat(num, den))} × 10`, { sup: minus(ex) }];
  const val = (num, den, ex) => qMul(rat(num, den), powValue(10, ex));
  return {
    target: card([dec(v)], v),
    equal: [() => card(m(M, 10, e), v), () => card(m(M, 1, e - 1), v), () => card(m(M, 100, e + 1), v)],
    traps: [
      () => card(m(M, 10, e + 1), val(M, 10, e + 1)),
      () => card(m(M, 10, e - 1), val(M, 10, e - 1)),
      () => (e !== 0 ? card(m(M, 10, -e), val(M, 10, -e)) : null),
      () => card(m(M, 1, e + 1), val(M, 1, e + 1)),
    ],
  };
};

// 31 · Puissance d’un produit
B.powProd = (rng, sub) => {
  const a = rng.int(2, by(sub, 3, 5, 6));
  let b = rng.int(2, by(sub, 3, 5, 7));
  if (b === a) b += 1;
  const k = rng.int(2, by(sub, 2, 3, 3));
  const v = rat((a * b) ** k);
  return {
    target: card([String((a * b) ** k)], v),
    equal: [
      () => card(['(', `${a} × ${b}`, ')', { sup: String(k) }], v),
      () => card([...pw(a, k), ' × ', ...pw(b, k)], v),
      () => card(pw(a * b, k), v),
    ],
    traps: [
      () => card([`${a} × `, ...pw(b, k)], rat(a * b ** k)),
      () => card([...pw(a, k), ` × ${b}`], rat(a ** k * b)),
      () => card(['(', `${a} + ${b}`, ')', { sup: String(k) }], rat((a + b) ** k)),
      () => card([...pw(a, k), ' + ', ...pw(b, k)], rat(a ** k + b ** k)),
    ],
  };
};

// 32 · Racine carrée d’un carré parfait
B.rootSq = (rng, sub) => {
  const n = rng.int(...by(sub, [2, 10], [6, 15], [11, 25]));
  return {
    target: card([String(n)], rat(n)),
    equal: [
      () => card([{ sqrt: String(n * n) }], rat(n)),
      () => { const ds = divisorsOf(n * n).filter((d) => d !== n); if (!ds.length) return null; const d = rng.pick(ds); return card([{ sqrt: String(d) }, ' × ', { sqrt: String((n * n) / d) }], rat(n)); },
      () => { const k = rng.int(2, 4); return card([{ sqrt: String(n * n * k * k) }, ` ÷ ${k}`], rat(n)); },
      () => { const k = rng.pick([2, 3]); return n % k === 0 && n / k >= 2 ? card([`${k} × `, { sqrt: String((n / k) ** 2) }], rat(n)) : null; },
    ],
    traps: [
      () => card([{ sqrt: String(2 * n) }], surd(1, 2 * n)),
      () => card([String(n), { sup: '2' }], rat(n * n)),
      () => { const N = n * n + rng.pick([-1, 1]); return card([{ sqrt: String(N) }], surd(1, N)); },
      () => card([{ sqrt: String(n) }], surd(1, n)),
    ],
  };
};

const RADICANDS = [2, 3, 5, 6, 7];

// 33 · Simplifier une racine carrée
B.rootSimplify = (rng, sub) => {
  const r = rng.pick(by(sub, [2, 3], [2, 3, 5], RADICANDS));
  const a = rng.int(2, by(sub, 4, 5, r <= 3 ? 7 : 5));
  const v = surd(a, r);
  return {
    target: card([String(a), { sqrt: String(r) }], v),
    equal: [
      () => card([{ sqrt: String(a * a * r) }], v),
      () => card([`${a} × `, { sqrt: String(r) }], v),
      () => { const ds = divisorsOf(a); if (!ds.length) return null; const d = rng.pick(ds); return card([String(a / d), { sqrt: String(d * d * r) }], v); },
      () => card([{ sqrt: String(r) }, ` × ${a}`], v),
      () => card([{ sqrt: String(4 * a * a * r) }, ' ÷ 2'], v),
      () => { const m = rng.pick([2, 3, 5].filter((x) => x !== r)); return card([{ sqrt: String(m * a * a * r) }, ' ÷ ', { sqrt: String(m) }], v); },
    ],
    traps: [
      // Le carré oublié : √(a·r) pour a√r.
      () => card([{ sqrt: String(a * r) }], surd(1, a * r)),
      () => (r !== a ? card([String(r), { sqrt: String(a) }], surd(r, a)) : null),
      () => card([String(a * a), { sqrt: String(r) }], surd(a * a, r)),
      () => card([String(a + 1), { sqrt: String(r) }], surd(a + 1, r)),
    ],
  };
};

// 34 · Produit et quotient de racines carrées
B.rootMul = (rng, sub) => {
  const r = rng.pick(by(sub, [2, 3], [2, 3, 5], RADICANDS));
  const a = rng.int(2, by(sub, 4, 5, 6));
  const N = a * a * r;
  const v = surd(1, N);
  const prod = () => { const ds = divisorsOf(N); const d = rng.pick(ds.length ? ds : [1]); return card([{ sqrt: String(d) }, ' × ', { sqrt: String(N / d) }], v); };
  return {
    target: card(valueTokens(v), v),
    equal: [prod, prod, () => { const k = rng.int(2, 5); return card([{ sqrt: String(N * k) }, ' ÷ ', { sqrt: String(k) }], v); }, () => card([{ sqrt: String(N) }], v)],
    traps: [
      // √k pris pour k : √(N·k) ÷ k.
      () => { const k = rng.int(2, 5); return card([{ sqrt: String(N * k) }, ` ÷ ${k}`], divBy(surd(1, N * k), k)); },
      // « √x × √y = √(x + y) ».
      () => { const ds = divisorsOf(N); if (!ds.length) return null; const d = rng.pick(ds); return card([{ sqrt: `${d} + ${N / d}` }], surd(1, d + N / d)); },
      () => card([{ sqrt: String(N + r) }], surd(1, N + r)),
    ],
  };
};

// 35 · Sommes de racines carrées
B.rootAdd = (rng, sub) => {
  const r = rng.pick(by(sub, [2, 3], [2, 3, 5], RADICANDS));
  const a = rng.int(by(sub, 2, 3, 4), by(sub, 5, 7, 9));
  const v = surd(a, r);
  const part = (k) => (k === 1 ? [{ sqrt: String(r) }] : [String(k), { sqrt: String(r) }]);
  return {
    target: card([String(a), { sqrt: String(r) }], v),
    equal: [
      () => { const b = rng.int(1, a - 1); return card([...part(b), ' + ', ...part(a - b)], v); },
      () => { const b = rng.int(1, a - 1); return card([{ sqrt: String(b * b * r) }, ' + ', { sqrt: String((a - b) ** 2 * r) }], v); },
      () => { const b = rng.int(1, 4); return card([...part(a + b), ' − ', ...part(b)], v); },
      () => card([{ sqrt: String(a * a * r) }], v),
    ],
    traps: [
      // « √x + √y = √(x + y) ».
      () => { const b = rng.int(1, a - 1); return card([{ sqrt: `${b * b * r} + ${(a - b) ** 2 * r}` }], surd(1, (b * b + (a - b) ** 2) * r)); },
      () => card([String(a), { sqrt: String(2 * r) }], surd(a, 2 * r)),
      () => card([String(a + 1), { sqrt: String(r) }], surd(a + 1, r)),
      () => card([String(a * a), { sqrt: String(r) }], surd(a * a, r)),
    ],
  };
};

// 36 · Rendre rationnel un dénominateur
B.rootRational = (rng, sub) => {
  const r = rng.pick(by(sub, [2, 3], [2, 3, 5], [2, 3, 5, 6, 7]));
  const k = rng.int(1, by(sub, 1, 3, 6));
  const v = surd(rat(k, r), r);
  const kr = `${k === 1 ? '' : k}√${r}`;
  return {
    target: card(valueTokens(v), v),
    equal: [
      () => card([{ frac: [String(k), `√${r}`] }], v),
      () => card([{ frac: [String(2 * k), `2√${r}`] }], v),
      () => card([{ frac: [kr, String(r)] }], v),
      () => card([{ frac: [`${2 * k}√${r}`, String(2 * r)] }], v),
    ],
    traps: [
      () => card([F(k, r)], rat(k, r)),
      () => card([kr], surd(k, r)),
      () => card([{ frac: [kr, String(r * r)] }], surd(rat(k, r * r), r)),
      () => card([{ frac: [String(r), `√${r}`] }], surd(1, r)),
    ],
  };
};

// 37 · Réduire une expression littérale
B.reduce = (rng, sub) => {
  const a = nonZero(rng, by(sub, 2, -6, -9), by(sub, 6, 6, 9));
  const b = nonZero(rng, by(sub, 1, -12, -20), by(sub, 12, 12, 20));
  const v = poly(b, a);
  return {
    target: card(polyTokens([b, a, 0]), v),
    equal: [
      () => { const k = nonZero(rng, -4, 4); return a - k === 0 ? null : card([`${cx(k)}${signedX(a - k)}${signed(b)}`], v); },
      () => { const k = rng.int(1, 9); return card([`${cx(a)}${signed(b + k)} − ${k}`], v); },
      () => { const k = rng.int(1, 3); return card([`${cx(a + k)}${signed(b)} − ${cx(k)}`], v); },
      () => card([`${minus(b)}${signedX(a)}`], v),
    ],
    traps: [
      // Les termes non semblables « additionnés ».
      () => (a + b !== 0 ? card([cx(a + b)], poly(0, a + b)) : null),
      () => { const k = rng.int(1, 3); return card([`${cx(a + k)}${signed(b)} + ${cx(k)}`], poly(b, a + 2 * k)); },
      () => (a !== b ? card([`${cx(b)}${signed(a)}`], poly(a, b)) : null),
    ],
  };
};

// 38 · Développer (simple distributivité)
B.expand = (rng, sub) => {
  const k = nonZero(rng, by(sub, 2, -5, -9), by(sub, 6, 6, 9));
  const a = nonZero(rng, by(sub, 1, -6, -9), by(sub, 6, 6, 9));
  const v = poly(k * a, k);
  const kk = k === 1 ? '' : k === -1 ? '−' : minus(k);
  return {
    target: card(polyTokens(v.c), v),
    equal: [
      () => card([`${kk}(x${signed(a)})`], v),
      () => (a !== 1 ? card([`${kk}(x${signed(a - 1)})${signed(k)}`], v) : null),
      () => card([`${minus(k * a)}${signedX(k)}`], v),
      () => { const m = rng.int(2, 3); return card([`(${cx(m * k)}${signed(m * k * a)}) ÷ ${m}`], v); },
    ],
    traps: [
      // La distributivité oubliée.
      () => card([`${cx(k)}${signed(a)}`], poly(a, k)),
      () => card([`${kk}(x${signed(k * a)})`], poly(k * k * a, k)),
      () => card([`${kk}(x${signed(-a)})`], poly(-k * a, k)),
    ],
  };
};

// 39 · Développer (double distributivité)
B.expand2 = (rng, sub) => {
  const a = nonZero(rng, by(sub, 1, -6, -9), by(sub, 6, 6, 9));
  const b = nonZero(rng, by(sub, 1, -6, -9), by(sub, 6, 6, 9));
  const v = poly(a * b, a + b, 1);
  return {
    target: card(polyTokens(v.c), v),
    equal: [
      () => card([`(x${signed(a)})(x${signed(b)})`], v),
      () => card(['x', { sup: '2' }, `${signedX(a)}${signedX(b)}${signed(a * b)}`], v),
      () => (a !== b ? card([`(x${signed(b)})(x${signed(a)})`], v) : null),
      () => card([`(${minus(a)} + x)(x${signed(b)})`], v),
    ],
    traps: [
      () => card(['x', { sup: '2' }, signed(a * b)], poly(a * b, 0, 1)),
      () => (a + b !== 0 ? card(['x', { sup: '2' }, `${signedX(a + b)}${signed(a + b)}`], poly(a + b, a + b, 1)) : null),
      () => card([`(x${signed(a)})(x${signed(-b)})`], poly(-a * b, a - b, 1)),
    ],
  };
};

/** (m·x ± k)² ou (m·x − k)(m·x + k), selon le type. */
function identity(rng, sub, type) {
  const k = rng.int(1, by(sub, 5, 7, 6));
  const m = sub === 3 ? rng.int(2, 3) : 1;
  const mx = cx(m);
  const s = type === 'plus' ? 1 : -1;
  const v = type === 'diff' ? poly(-k * k, 0, m * m) : poly(k * k, 2 * s * m * k, m * m);
  const sq = (inner) => [`(${inner})`, { sup: '2' }];
  const x2 = m === 1 ? ['x', { sup: '2' }] : [`${m * m}x`, { sup: '2' }];
  return {
    target: card(polyTokens(v.c), v),
    equal: type === 'diff' ? [
      () => card([`(${mx} − ${k})(${mx} + ${k})`], v),
      () => card([`(${mx} + ${k})(${mx} − ${k})`], v),
      () => card([...x2, ` + ${cx(m * k)} − ${cx(m * k)} − ${k * k}`], v),
      () => card([`(${k} + ${mx})(${mx} − ${k})`], v),
    ] : [
      () => card(sq(`${mx}${signed(s * k)}`), v),
      () => card([`(${mx}${signed(s * k)})(${mx}${signed(s * k)})`], v),
      () => card(s > 0 ? sq(`${k} + ${mx}`) : sq(`${k} − ${mx}`), v),
      () => card([...x2, `${signedX(s * m * k)}${signedX(s * m * k)}${signed(k * k)}`], v),
    ],
    traps: type === 'diff' ? [
      () => card(sq(`${mx} − ${k}`), poly(k * k, -2 * m * k, m * m)),
      () => card([...x2, ` + ${k * k}`], poly(k * k, 0, m * m)),
      () => card([...x2, ` − ${2 * k}`], poly(-2 * k, 0, m * m)),
    ] : [
      // (a + b)² « = » a² + b².
      () => card([...x2, ` + ${k * k}`], poly(k * k, 0, m * m)),
      // Le double produit oublié à moitié.
      () => card([...x2, `${signedX(s * m * k)}${signed(k * k)}`], poly(k * k, s * m * k, m * m)),
      () => card(sq(`${mx}${signed(-s * k)}`), poly(k * k, -2 * s * m * k, m * m)),
      // Le carré pris pour un double.
      () => card([`${cx(2 * m)}${signed(2 * s * k)}`], poly(2 * s * k, 2 * m)),
    ],
  };
}
// 40–42 · Les identités remarquables
B.idPlus = (rng, sub) => identity(rng, sub, 'plus');
B.idMinus = (rng, sub) => identity(rng, sub, 'minus');
B.idDiff = (rng, sub) => identity(rng, sub, 'diff');

// 43 · Factoriser
B.factorize = (rng, sub) => {
  if (sub === 3) {
    const k = rng.int(2, 7);
    const v = poly(-k * k, 0, 1);
    return {
      target: card([`(x − ${k})(x + ${k})`], v),
      equal: [
        () => card(['x', { sup: '2' }, ` − ${k * k}`], v),
        () => card([`(x + ${k})(x − ${k})`], v),
        () => card(['x', { sup: '2' }, ` − ${k * k + 1} + 1`], v),
      ],
      traps: [
        () => card([`(x − ${k})`, { sup: '2' }], poly(k * k, -2 * k, 1)),
        () => card(['x', { sup: '2' }, ` + ${k * k}`], poly(k * k, 0, 1)),
        () => card(['x', { sup: '2' }, ` − ${2 * k}`], poly(-2 * k, 0, 1)),
      ],
    };
  }
  const k = rng.int(2, by(sub, 5, 9, 9));
  const a = nonZero(rng, sub === 1 ? 1 : -9, 9);
  const v = poly(k * a, k);
  return {
    target: card([`${k}(x${signed(a)})`], v),
    equal: [
      () => card(polyTokens(v.c), v),
      () => card([`${minus(k * a)} + ${cx(k)}`], v),
      () => (a !== 1 ? card([`${k}(x${signed(a - 1)})${signed(k)}`], v) : null),
      () => (k <= 4 ? card([`${Array(k).fill('x').join(' + ')}${signed(k * a)}`], v) : null),
      () => card([`${k}(x${signed(a + 1)})${signed(-k)}`], v),
      () => card([`(${cx(2 * k)}${signed(2 * k * a)}) ÷ 2`], v),
      () => card([`${cx(k + 1)}${signed(k * a)} − x`], v),
    ],
    traps: [
      () => card([`${cx(k)}${signed(a)}`], poly(a, k)),
      () => (k + a !== 0 ? card([`${cx(k)}${signed(k + a)}`], poly(k + a, k)) : null),
      () => card([`x${signed(k * a)}`], poly(k * a, 1)),
    ],
  };
};

// 44 · Équations x + a = b
B.eqAdd = (rng, sub) => {
  const R = by(sub, 10, 20, 40);
  const s = rng.int(sub === 1 ? 1 : -R, R);
  const pos = () => rng.int(1, R);
  return {
    target: card([minus(s)], rat(s)),
    equal: [
      () => { const a = pos(); return card([`x + ${a} = ${minus(s + a)}`], rat(s)); },
      () => { const a = pos(); return card([`x − ${a} = ${minus(s - a)}`], rat(s)); },
      () => { const a = pos(); return card([`${a} + x = ${minus(a + s)}`], rat(s)); },
      () => { const a = pos(); return card([`${minus(s + a)} = x + ${a}`], rat(s)); },
    ],
    traps: [
      // Le signe : x + a = b donne x = b + a.
      () => { const a = pos(); return card([`x + ${a} = ${minus(s - a)}`], rat(s - 2 * a)); },
      () => { const a = pos(); return card([`x − ${a} = ${minus(s + a)}`], rat(s + 2 * a)); },
    ],
  };
};

// 45 · Équations ax + b = c
B.eqLin = (rng, sub) => {
  const s = rng.int(by(sub, 1, -6, -10), by(sub, 9, 9, 12));
  const A = () => rng.int(2, by(sub, 5, 7, 9));
  const Bc = () => nonZero(rng, sub === 1 ? 1 : -12, 12);
  const eq = () => { const a = A(); const b = Bc(); return card([`${a}x${signed(b)} = ${minus(a * s + b)}`], rat(s)); };
  return {
    target: card([minus(s)], rat(s)),
    equal: [eq, eq, () => { const a = A(); return card([`${a}x = ${minus(a * s)}`], rat(s)); }, () => { const a = A(); const b = Bc(); return card([`${minus(b)} + ${a}x = ${minus(a * s + b)}`], rat(s)); }],
    traps: [
      // b passé du mauvais côté sans changer de signe.
      () => { const a = A(); const b = Bc(); const c = a * s - b; return card([`${a}x${signed(b)} = ${minus(c)}`], rat(c - b, a)); },
      // Diviser avant de soustraire : x = c/a − b.
      () => { const a = A(); const b = Bc(); const c = a * (s + b); return card([`${a}x${signed(b)} = ${minus(c)}`], rat(c - b, a)); },
    ],
  };
};

// 46 · Équations avec parenthèses ou inconnue des deux côtés
B.eqBoth = (rng, sub) => {
  const s = rng.int(by(sub, 1, -6, -9), by(sub, 8, 8, 10));
  const A = () => rng.int(2, by(sub, 4, 6, 8));
  const both = () => { const c = A(); const a = c + rng.int(1, 4); const b = nonZero(rng, -9, 9); const d = b + (a - c) * s; return d === 0 ? null : card([`${a}x${signed(b)} = ${cx(c)}${signed(d)}`], rat(s)); };
  return {
    target: card([minus(s)], rat(s)),
    equal: [() => { const a = A(); const b = nonZero(rng, -6, 6); return card([`${a}(x${signed(b)}) = ${minus(a * (s + b))}`], rat(s)); }, both, both],
    traps: [
      // La distributivité oubliée : a(x + b) = c lu ax + b = c.
      () => { const a = A(); const b = nonZero(rng, -6, 6); const c = a * s + b; return card([`${a}(x${signed(b)}) = ${minus(c)}`], rat(c - a * b, a)); },
      // Le terme en x passé sans changer de signe.
      () => { const c = A(); const a = c + rng.int(1, 4); const b = nonZero(rng, -9, 9); const d = b + (a + c) * s; return d === 0 ? null : card([`${a}x${signed(b)} = ${cx(c)}${signed(d)}`], rat(d - b, a - c)); },
    ],
  };
};

// 47 · Calculer la valeur d’une expression
B.evalAt = (rng, sub) => {
  const x0 = nonZero(rng, by(sub, 1, -3, -5), by(sub, 4, 4, 5));
  const forms = [
    () => { const a = nonZero(rng, -5, 5); return { tokens: (b) => [`${cx(a)}${signed(b)}`], base: a * x0 }; },
    () => ({ tokens: (b) => ['x', { sup: '2' }, signed(b)], base: x0 * x0 }),
    () => { const a = rng.int(2, 3); return { tokens: (b) => [`${a}x`, { sup: '2' }, signed(b)], base: a * x0 * x0 }; },
    () => { const a = nonZero(rng, -4, 4); return { tokens: (b) => [`(x${signed(a)})`, { sup: '2' }, signed(b)], base: (x0 + a) ** 2 }; },
  ];
  const t = rng.int(-12, 20);
  const eq = () => { const f = rng.pick(forms)(); const b = t - f.base; return b === 0 ? null : card(f.tokens(b), rat(t)); };
  return {
    mode: 'at',
    at: x0,
    target: card([minus(t)], rat(t)),
    equal: [eq, eq, eq, eq],
    traps: [
      // 2x² calculé (2x)².
      () => { const b = t - 2 * x0 * x0; return b === 0 ? null : card(['(2x)', { sup: '2' }, signed(b)], rat(4 * x0 * x0 + b)); },
      () => { const f = rng.pick(forms)(); const b = t - f.base + rng.pick([-2, -1, 1, 2]); return b === 0 ? null : card(f.tokens(b), rat(f.base + b)); },
      // x² pris négatif pour x négatif : x² + b « = » t avec −x0² + b = t.
      () => { if (x0 > 0) return null; const b = t + x0 * x0; return b === 0 ? null : card(['x', { sup: '2' }, signed(b)], rat(x0 * x0 + b)); },
    ],
  };
};

// 48–50 · Trigonométrie : un catalogue d'écritures aux valeurs exactes.
const H = rat(1, 2);
const S3H = surd(H, 3);
const S2H = surd(H, 2);
const S3 = surd(1, 3);
const S3T = surd(rat(1, 3), 3);
const Q34 = rat(3, 4);
const sqT = (fn, deg) => [`(${fn} ${deg}°)`, { sup: '2' }];
const TRIG = {
  sincos: [
    [['cos 60°'], H], [['sin 30°'], H], [['cos 30°'], S3H], [['sin 60°'], S3H], [['cos 45°'], S2H], [['sin 45°'], S2H],
    [[{ frac: ['1', '2'] }], H], [[{ frac: ['√3', '2'] }], S3H], [[{ frac: ['√2', '2'] }], S2H], [[{ frac: ['1', '√2'] }], S2H],
    [['1 − sin 30°'], H], [['2 × sin 30° × cos 30°'], S3H], [['cos 60° × 2 ÷ 2'], H], [['cos 45° × cos 45°'], H],
  ],
  tan: [
    [['tan 45°'], rat(1)], [['tan 60°'], S3], [['tan 30°'], S3T], [['sin 45° ÷ cos 45°'], rat(1)], [['sin 60° ÷ cos 60°'], S3],
    [['sin 30° ÷ cos 30°'], S3T], [[{ frac: ['1', '√3'] }], S3T], [[{ frac: ['√3', '3'] }], S3T], [[{ sqrt: '3' }], S3], [['1'], rat(1)],
    [['2 × sin 30°'], rat(1)], [['cos 30° ÷ sin 30°'], S3], [['cos 60° ÷ sin 60°'], S3T], [['tan 30° × 3'], S3],
  ],
  relations: [
    [[...sqT('sin', 30), ' + ', ...sqT('cos', 30)], rat(1)], [[...sqT('sin', 60), ' + ', ...sqT('cos', 60)], rat(1)], [[...sqT('cos', 45), ' + ', ...sqT('sin', 45)], rat(1)],
    [sqT('sin', 60), Q34], [sqT('cos', 30), Q34], [['1 − ', ...sqT('cos', 60)], Q34], [['1 − ', ...sqT('sin', 30)], Q34], [[{ frac: ['3', '4'] }], Q34],
    [sqT('cos', 45), H], [sqT('sin', 45), H], [['1 − ', ...sqT('sin', 45)], H], [[{ frac: ['1', '2'] }], H],
    [['tan 45° × tan 45°'], rat(1)], [sqT('tan', 30), rat(1, 3)], [['1 − ', ...sqT('cos', 30)], rat(1, 4)], [sqT('sin', 30), rat(1, 4)],
  ],
};
const trigLevel = (name) => (rng) => {
  const entries = TRIG[name];
  const counts = new Map();
  for (const [, v] of entries) counts.set(keyOf(v), (counts.get(keyOf(v)) ?? 0) + 1);
  const [, tValue] = rng.pick(entries.filter(([, v]) => counts.get(keyOf(v)) >= 4));
  return {
    target: card(valueTokens(tValue), tValue),
    equal: entries.filter(([, v]) => keyOf(v) === keyOf(tValue)).map(([tok, v]) => () => card(tok, v)),
    traps: entries.filter(([, v]) => keyOf(v) !== keyOf(tValue)).map(([tok, v]) => () => card(tok, v)),
    near: () => null,
  };
};
B.trigSinCos = trigLevel('sincos');
B.trigTan = trigLevel('tan');
B.trigRel = trigLevel('relations');

// ── Une manche ──────────────────────────────────────────────────────────────

function shuffle(rng, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng.next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function draw(rng, makers, target, wantKeyEqual, n, seen) {
  const out = [];
  const tKey = keyOf(target.value);
  for (let attempt = 0; attempt < 80 && out.length < n; attempt += 1) {
    const c = makers[rng.int(0, makers.length - 1)]();
    if (!c || !c.value) continue;
    const isEqual = keyOf(c.value) === tKey;
    const text = plain(c.tokens);
    if (isEqual !== wantKeyEqual || seen.has(text)) continue;
    seen.add(text);
    // « 12 + 7 » et « 7 + 12 » dans la même manche : un doublon, pas une observation.
    const sum = /^(\S+) ([+×]) (\S+)$/.exec(text);
    if (sum) seen.add(`${sum[3]} ${sum[2]} ${sum[1]}`);
    out.push({ ...c, equal: isEqual, text });
  }
  return out;
}

/** Une valeur voisine (toujours fausse) écrite simplement, selon le mode. */
function nearCard(spec, mode, d) {
  const v = spec.target.value;
  if (v.kind === 'q') {
    const w = rat(v.n + d * v.d, v.d);
    if (mode === 'solution') return w.d === 1 ? card([`x = ${minus(w.n)}`], w) : null;
    if (mode === 'at') { const c = w.n - spec.at; return w.d === 1 ? card([c === 0 ? 'x' : `x${signed(c)}`], w) : null; }
    return card(valueTokens(w), w);
  }
  if (v.kind === 's') { const w = surd(rat(v.n + d * v.d, v.d), v.r); return card(valueTokens(w), w); }
  const w = poly(v.c[0] + d, v.c[1], v.c[2]);
  return card(valueTokens(w), w);
}

/**
 * La manche k d'une graine, au niveau `level` (1…50) et au sous-niveau `sub`
 * (1…3) : la cible et ses huit cartes (dans l'ordre de chute), dont 3 ou 4
 * égales. Toujours la même pour la même graine, la même manche, le même niveau.
 */
export function makeRound(seed, k, { level = 1, sub = 1, cardsPerRound = 8 } = {}) {
  const meta = levelAt(level);
  const rng = createRng((seed ^ Math.imul(k + 1, 0x9e3779b1) ^ Math.imul(meta.n * 3 + sub, 0x85ebca6b)) >>> 0);
  const spec = B[meta.build](rng, sub);
  const mode = spec.mode ?? meta.mode;
  const target = spec.target;
  const seen = new Set([plain(target.tokens)]);
  const equal = draw(rng, spec.equal, target, true, rng.int(3, 4), seen);
  let traps = draw(rng, spec.traps, target, false, cardsPerRound - equal.length, seen);
  // Pas assez de pièges propres à ce niveau : des valeurs voisines, toujours fausses.
  for (let i = 1; traps.length + equal.length < cardsPerRound && i < 40; i += 1) {
    const d = i % 2 ? (i + 1) / 2 : -i / 2;
    const c = spec.near ? spec.near(d) : nearCard(spec, mode, d);
    if (!c) continue;
    const text = plain(c.tokens);
    if (!seen.has(text) && keyOf(c.value) !== keyOf(target.value)) {
      seen.add(text);
      traps = [...traps, { ...c, equal: false, text }];
    }
  }
  const cards = shuffle(rng, [...equal, ...traps]).slice(0, cardsPerRound);
  return {
    k,
    level: meta.n,
    sub,
    levelId: meta.id,
    domain: meta.domain,
    mode,
    at: spec.at ?? null,
    target: { tokens: target.tokens, value: target.value, key: keyOf(target.value) },
    cards: cards.map((c, j) => ({ id: `${k}:${j}`, tokens: c.tokens, value: c.value, equal: c.equal, text: c.text })),
  };
}

