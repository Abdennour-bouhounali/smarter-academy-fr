import * as AF from '@smarter-academy/core/arithmetic/affine.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import {
  planeGeometry, ticks, indexRange, indexOf, valueAt, numText, numTex, subdivide, toNum,
} from './originLine';

/**
 * line-crossing — DEUX DROITES, UN POINT (unité 7 « الدالة التآلفية », leçon 4 « التفسير البياني لحل جملة
 * معادلتين من الدرجة الأولى بمجهولين »).
 *
 * Toute la vérité vient de packages/core/arithmetic/affine.js et linearSystem.js (fractions EXACTES) :
 * une équation a·x + b·y = c s'écrit y = mx + p par `AF.lineFromEquation` ; un point allume la lampe
 * d'une équation ⇔ `LS.holdsAt(e, x, y)` (avant les cas) ou `AF.onLine(g, x, y)` (la droite tenue) ;
 * la position relative de deux droites est `AF.intersect` (unique / parallel / same). Les flottants ne
 * servent qu'au DESSIN ; une position de la main est toujours ramenée à un nœud EXACT de la grille.
 *
 * Trois étapes (une seule manipulation ; la troisième s'ouvre par un geste de l'élève, §7quater) :
 *   build  pour chaque équation, l'élève choisit son écriture y = mx + p parmi des cartes ; une carte
 *          fausse est REFUSÉE avec un témoin (« pour x = 0 cette écriture donne y = −43, et
 *          0 + (−43) = −43 ≠ 43 ») ; la carte juste trace la droite ;
 *   probe  l'élève promène un point P (nœuds de la grille) : la lampe d'une équation s'allume quand P
 *          est sur sa droite ; les deux lampes ⇔ P est la ثنائية solution ;
 *   cases  (`cases`, niveau avancé) l'élève tient la seconde droite (son m et son p) : sécantes, parallèles
 *          (les lampes ne s'allument JAMAIS ensemble), confondues (tout point de la droite allume les deux).
 *
 * Un ESSAI est un geste VALIDÉ (relâchement, Entrée, bouton, pause du clavier).
 */

const { frac, parseNumber, eq, cmp, isZero, toNumber, mul, div, add } = Lin;
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(String(v)));

export const THEMES = Object.freeze(['coins', 'laser']);

/* ── lecture des props ──────────────────────────────────────────────────── */

/** « x+y=43|100x+200y=5000 » → { src: [s1, s2], eqs: [e1, e2] } (linearSystem.eq2). */
function parseSystem(raw) {
  const src = String(raw ?? '').split('|').map((s) => s.trim()).filter(Boolean);
  if (src.length !== 2) throw new Error(`line-crossing : il faut deux équations « e1|e2 » (reçu « ${raw} »)`);
  const eqs = src.map((s) => LS.eq2(s));
  return { src, eqs };
}

/** La droite y = mx + p d'une équation (b ≠ 0) ; une équation sans y est un contenu invalide ici. */
function lineOf(e) {
  const g = AF.lineFromEquation(e);
  if (!g) throw new Error('line-crossing : une équation sans y (droite verticale) n’est pas une fonction affine');
  return g;
}

/* ── les cartes « y = … » (étape build) ─────────────────────────────────── */

/**
 * Les écritures proposées pour une équation : la juste, et des écritures FAUSSES de vraies erreurs —
 * signe de x oublié en transposant (MISC-JUMLA-ISHARA-Y), signe du terme constant, division par b
 * oubliée (y = c − ax quand b ≠ ±1), les deux signes. Quatre cartes au plus, distinctes ; l'ordre est
 * fixé par l'équation (jamais la juste toujours en tête).
 */
function candidatesFor(e) {
  const g = lineOf(e);
  const neg = (v) => mul(v, -1);
  const pool = [
    { kind: 'right', m: g.a, p: g.b },
    { kind: 'signX', m: neg(g.a), p: g.b },
    { kind: 'signC', m: g.a, p: neg(g.b) },
    { kind: 'noDivide', m: neg(e.a), p: e.c },
    { kind: 'signBoth', m: neg(g.a), p: neg(g.b) },
    { kind: 'swap', m: g.b, p: g.a },
  ];
  const out = [];
  for (const c of pool) {
    if (out.length >= 4) break;
    if (out.some((o) => eq(o.m, c.m) && eq(o.p, c.p))) continue;
    out.push(c);
  }
  const shift = (Math.abs(e.c.n) + Math.abs(e.a.n) * 3 + Math.abs(e.b.n)) % out.length;
  const rotated = [...out.slice(shift), ...out.slice(0, shift)];
  return rotated.map((c) => Object.freeze({ ...c, ok: c.kind === 'right' }));
}

/** Le témoin qui réfute une carte fausse : le premier x (0, 1, 2, −1, …) où elle s'écarte de la droite. */
export function witnessFor(e, cand) {
  const g = lineOf(e);
  for (const x of [0, 1, 2, -1, 3, -2, 4]) {
    const yc = add(mul(cand.m, x), cand.p);
    const yg = AF.imageOf(g, x);
    if (!eq(yc, yg)) return Object.freeze({ x: F(x), y: yc, left: LS.leftAt(e, x, yc), c: e.c });
  }
  return null;
}

/* ── la fenêtre ─────────────────────────────────────────────────────────── */

/** Une fenêtre qui contient O, les deux points (0 ; p), les points (x ; 0) et le point d'intersection. */
function defaultWindow(lines) {
  const xs = [0]; const ys = [0];
  for (const g of lines) {
    ys.push(toNumber(g.b));
    const xi = AF.xIntercept(g);
    if (xi) xs.push(toNumber(xi.x));
  }
  const r = AF.intersect(lines[0], lines[1]);
  if (r.kind === 'unique') { xs.push(toNumber(r.x)); ys.push(toNumber(r.y)); }
  const span = Math.max(...xs, ...ys) - Math.min(...xs, ...ys);
  // petits nombres : une unité de marge ; grands nombres (les pièces) : des bornes multiples de 5, sans
  // marge négative inutile (le premier quadrant du manuel). On ne coupe jamais un point requis.
  if (span > 24) {
    const lo5 = (v) => Math.min(0, 5 * Math.floor(Math.min(...v) / 5));
    const hi5 = (v) => 5 * Math.ceil((Math.max(...v) + 0.5) / 5);
    return { xMin: lo5(xs), xMax: hi5(xs), yMin: lo5(ys), yMax: hi5(ys) };
  }
  const lo = (v) => Math.floor(Math.min(...v)); const hi = (v) => Math.ceil(Math.max(...v));
  return { xMin: lo(xs) - 1, xMax: hi(xs) + 1, yMin: lo(ys) - 1, yMax: hi(ys) + 1 };
}

/* ── l'état ─────────────────────────────────────────────────────────────── */

const SEEN0 = Object.freeze({ one: false, both: false, parallel: false, same: false, secant: false });

/**
 * L'état initial. props : { system, cases, startWith, xMin, xMax, yMin, yMax }.
 * startWith = 'cases' : les deux droites sont déjà tracées et l'élève tient la seconde (exemple de معارف).
 */
export function init(props = {}) {
  const { src, eqs } = parseSystem(props.system);
  const lines = eqs.map(lineOf);
  const cases = props.cases === true || props.cases === 'true';
  const startCases = props.startWith === 'cases';
  const d = defaultWindow(lines);
  const pick = (k) => (props[k] != null && props[k] !== '' ? toNumber(F(String(props[k]).replace(/[−–]/g, '-'))) : d[k]);
  const win = { xMin: Math.min(0, pick('xMin')), xMax: Math.max(0, pick('xMax')), yMin: Math.min(0, pick('yMin')), yMax: Math.max(0, pick('yMax')) };
  const span = Math.max(win.xMax - win.xMin, win.yMax - win.yMin);
  // les nœuds : des entiers (les solutions de la leçon sont des couples d'entiers) ; une graduation
  // lisible (1, 2, 5, 10) ; la grille dessinée tous les « minor ».
  const snap = { dx: frac(1), dy: frac(1) };
  const label = span <= 12 ? 1 : span <= 24 ? 2 : span <= 60 ? 10 : 20;
  const minor = span <= 24 ? 1 : 5;
  // la seconde droite tenue (cases) : m sur des demi-unités au moins, et toujours sur la pente de (1)
  const da = subdivide(frac(1), [lines[0].a, lines[1].a]);
  return {
    src, eqs, lines, cases: cases || startCases, startWith: startCases ? 'cases' : 'build',
    cands: eqs.map(candidatesFor),
    built: startCases ? [true, true] : [false, false],
    stage: startCases ? 'cases' : 'build',
    win, snap, grid: { label: frac(label), minor: frac(minor) }, da,
    held: lines[1],
    trials: [], last: null, seen: { ...SEEN0 },
  };
}

/** L'équation que l'élève construit maintenant (0 ou 1), ou null quand les deux sont tracées. */
export const buildingIndex = (s) => (s.built[0] ? (s.built[1] ? null : 1) : 0);

/** Choisir la carte k pour l'équation i. */
export function choose(s, i, k) {
  if (s.built[i]) return s;
  const cand = s.cands[i][k];
  if (!cand) return s;
  if (!cand.ok) {
    const w = witnessFor(s.eqs[i], cand);
    return { ...s, last: { kind: 'wrongForm', i, k, cand, witness: w }, trials: [...s.trials, { kind: 'form', i, ok: false, cand }] };
  }
  const built = s.built.map((b, j) => (j === i ? true : b));
  const both = built[0] && built[1];
  return { ...s, built, stage: both ? 'probe' : 'build', last: { kind: 'built', i, both }, trials: [...s.trials, { kind: 'form', i, ok: true, cand }] };
}

/** La seconde droite en vigueur : celle de l'équation (2), ou la droite tenue à l'étape des cas. */
const secondLine = (s) => (s.stage === 'cases' ? s.held : s.lines[1]);

/** Les deux lampes en (x ; y). */
export function lampsAt(s, x, y) {
  const one = s.built[0] && LS.holdsAt(s.eqs[0], x, y);
  const two = s.stage === 'cases' ? AF.onLine(s.held, x, y) : s.built[1] && LS.holdsAt(s.eqs[1], x, y);
  return [!!one, !!two];
}

/** Poser P en (x ; y) : un essai, ses deux lampes. */
export function place(s, x, y) {
  if (s.stage === 'build') return s;
  const X = F(x); const Y = F(y);
  const [ok1, ok2] = lampsAt(s, X, Y);
  const n = (ok1 ? 1 : 0) + (ok2 ? 1 : 0);
  const kind = n === 2 ? 'both' : n === 1 ? 'one' : 'none';
  const seen = { ...s.seen, ...(n === 2 ? { both: true } : {}), ...(n === 1 ? { one: true } : {}) };
  const tr = { kind: 'point', x: X, y: Y, ok1, ok2, stage: s.stage, rel: s.stage === 'cases' ? relationNow(s).kind : null };
  return { ...s, seen, last: { kind, x: X, y: Y, ok1, ok2 }, trials: [...s.trials, tr] };
}

/** La position relative des deux droites en vigueur. */
export const relationNow = (s) => AF.intersect(s.lines[0], secondLine(s));

/** Le point d'intersection est-il un nœud de la grille (lecture graphique exacte) ? */
export function onGrid(s, r) {
  if (!r || r.kind !== 'unique') return false;
  return F(div(r.x, s.snap.dx)).d === 1 && F(div(r.y, s.snap.dy)).d === 1
    && toNumber(r.x) >= s.win.xMin && toNumber(r.x) <= s.win.xMax && toNumber(r.y) >= s.win.yMin && toNumber(r.y) <= s.win.yMax;
}

/** Ouvrir l'étape des cas (seulement quand elle existe et que le point commun a été trouvé). */
export const canOpenCases = (s) => s.cases && s.stage === 'probe' && s.seen.both;
export function openCases(s) {
  if (!canOpenCases(s)) return s;
  return { ...s, stage: 'cases', last: { kind: 'openCases' } };
}
/** Revenir aux deux droites de la جملة (la droite tenue est gardée). */
export function backToProbe(s) {
  if (s.stage !== 'cases' || s.startWith === 'cases') return s;
  return { ...s, stage: 'probe', last: null };
}

/** Tenir la seconde droite : y = m·x + p. Un essai (la configuration validée). */
export function hold(s, m, p) {
  if (s.stage !== 'cases') return s;
  const held = AF.affine(F(m), F(p));
  if (eq(held.a, s.held.a) && eq(held.b, s.held.b) && s.last?.kind === 'config') return s;
  const r = AF.intersect(s.lines[0], held);
  const key = r.kind === 'unique' ? 'secant' : r.kind;
  const grid = r.kind === 'unique' ? onGrid(s, r) : null;
  return {
    ...s, held, seen: { ...s.seen, [key]: true },
    last: { kind: 'config', rel: r.kind, x: r.x ?? null, y: r.y ?? null, grid },
    trials: [...s.trials, { kind: 'config', rel: r.kind, m: held.a, p: held.b, x: r.x ?? null, y: r.y ?? null, grid }],
  };
}

/**
 * La découverte s'ouvre : sans les cas, sur un essai à UNE lampe ET le point aux deux lampes (contraste) ;
 * avec les cas, en plus, des droites parallèles ET des droites confondues produites par l'élève.
 */
/** Les étapes que la leçon pose (le `LabStepper`) : tracer, promener P, les trois cas ; `startWith="cases"` n'a que la dernière. */
export const stepsOf = (s) => (s.startWith === 'cases' ? ['cases'] : s.cases ? ['build', 'probe', 'cases'] : ['build', 'probe']);
/** L'objectif de chaque étape est atteint (avant ses questions). */
export function stepReached(s, step) {
  if (step === 'build') return s.built[0] && s.built[1];
  if (step === 'probe') return s.cases ? s.seen.both : s.seen.both && s.seen.one;
  return discoveryReady(s);
}
/** « أعِد التجربة » (LabCheckpoint) : l'étape courante repart de zéro (les autres gardent leurs écritures). */
export function restartStep(s, step) {
  const forms = s.trials.filter((tr) => tr.kind === 'form');
  if (step === 'build') return { ...s, built: [false, false], stage: 'build', held: s.lines[1], trials: [], seen: { ...SEEN0 }, last: null };
  if (step === 'probe') return { ...s, trials: forms, seen: { ...SEEN0 }, last: null };
  return { ...s, held: s.lines[1], trials: forms, seen: { ...SEEN0 }, last: null, stage: s.startWith === 'cases' ? 'cases' : s.stage };
}

export function discoveryReady(s) {
  if (!s.cases) return s.seen.both && s.seen.one;
  return (s.seen.both || s.seen.secant) && s.seen.parallel && s.seen.same;
}

/* ── la seconde droite tenue : indices de grille ───────────────────────── */

export const mAt = (s, j) => valueAt(j, s.da);
export const mIndex = (s, m) => indexOf(toNumber(F(m)), s.da);
/** m de −4 à 4 (en pas de `da`), toujours de quoi atteindre la pente de (1). */
export function mRange(s) {
  const r = indexRange(-4, 4, s.da);
  const j1 = mIndex(s, s.lines[0].a);
  return { min: Math.min(r.min, j1), max: Math.max(r.max, j1) };
}
export const pAt = (s, j) => valueAt(j, s.snap.dy);
export const pIndex = (s, p) => indexOf(toNumber(F(p)), s.snap.dy);
export const pRange = (s) => indexRange(s.win.yMin, s.win.yMax, s.snap.dy);

/**
 * « جرّب كل الإمكانيات » (étape des cas) : les pentes m de la graduation que l'élève n'a pas encore
 * validées pour le p tenu. Rien ailleurs : poser P est un geste 2D, choisir une carte est un choix.
 */
export function untriedSlopes(s) {
  if (s.stage !== 'cases') return [];
  const r = mRange(s);
  const out = [];
  for (let j = r.min; j <= r.max; j += 1) {
    const m = mAt(s, j);
    if (!s.trials.some((t) => t.kind === 'config' && eq(t.m, m) && eq(t.p, s.held.b))) out.push(j);
  }
  return out;
}

/* ── dessin (pixels — ne décide RIEN) ──────────────────────────────────── */

export { planeGeometry, ticks, indexRange, indexOf, valueAt, numText, numTex, toNum };

/** Le tronçon visible de y = m·x + p dans la fenêtre : [[x1, y1], [x2, y2]] (flottants) ou null. */
export function segmentOf(g, win) {
  const m = toNumber(g.a); const p = toNumber(g.b);
  let lo = win.xMin; let hi = win.xMax;
  if (m !== 0) {
    const b1 = (win.yMin - p) / m; const b2 = (win.yMax - p) / m;
    lo = Math.max(lo, Math.min(b1, b2)); hi = Math.min(hi, Math.max(b1, b2));
  } else if (p < win.yMin || p > win.yMax) return null;
  if (hi - lo < 1e-9) return null;
  return [[lo, m * lo + p], [hi, m * hi + p]];
}

/* ── écritures ─────────────────────────────────────────────────────────── */

/** « y = -\dfrac{1}{2}x + 25 ». */
export const lineTex = (g) => `y = ${AF.affineLatex(g)}`;
/** Une carte : « y = -x + 43 ». */
export const candTex = (c) => `y = ${AF.affineLatex(AF.affine(c.m, c.p))}`;
/** L'équation telle que la jumla l'écrit (« 100x + 200y = 5000 »). */
export const eqTex = (e) => LS.eqLatex(e);
/** Un point « (36 ; 7) », un couple exact « \left(\dfrac{3}{2} ; …\right) ». */
export const pairTex = (x, y) => LS.pairLatex(x, y);
export const pairText = (x, y) => `(${numText(x)} ; ${numText(y)})`;

const coefTimes = (c, v) => {
  const vt = cmp(v, 0) < 0 ? `(${numTex(v)})` : numTex(v);
  if (eq(c, 1)) return vt;
  if (eq(c, -1)) return `-${vt}`;
  return `${numTex(c)} \\times ${vt}`;
};
/**
 * La substitution écrite comme le manuel : « 36 + 7 = 43 », « 100 \times 36 + 200 \times 7 = 5000 »,
 * « 2 \times 4 - 3 = 5 \neq 1 » — le premier membre calculé, comparé au second.
 */
export function substTex(e, x, y) {
  const X = F(x); const Y = F(y);
  const parts = [];
  if (!isZero(e.a)) parts.push(coefTimes(e.a, X));
  if (!isZero(e.b)) {
    const t = coefTimes(e.b, Y);
    if (parts.length === 0) parts.push(t);
    else parts.push(t.startsWith('-') ? `- ${t.slice(1)}` : `+ ${t}`);
  }
  const left = LS.leftAt(e, X, Y);
  const ok = eq(left, e.c);
  return `${parts.join(' ')} = ${numTex(left)}${ok ? '' : ` \\neq ${numTex(e.c)}`}`;
}
/** La même chose pour la droite tenue y = m·x + p : « m \times x + p = … ». */
export function substLineTex(g, x, y) {
  const X = F(x); const Y = F(y);
  const val = AF.imageOf(g, X);
  const mx = isZero(g.a) ? '' : coefTimes(g.a, X);
  const pt = isZero(g.b) ? '' : (mx ? (cmp(g.b, 0) < 0 ? ` - ${numTex(mul(g.b, -1))}` : ` + ${numTex(g.b)}`) : numTex(g.b));
  const body = `${mx}${pt}` || '0';
  return `${body} = ${numTex(val)}${eq(val, Y) ? '' : ` \\neq ${numTex(Y)}`}`;
}

/** Un nombre en écriture approchée (lecture graphique d'un point qui n'est pas un nœud). */
export const approxNum = (p) => toNumber(F(p)).toFixed(1).replace('.', ',').replace(/,0$/, '');

/* accès exacts pour la vue */
export const same = (p, q) => eq(F(p), F(q));
export const fracOf = F;
export const lineAt = (g, x) => AF.imageOf(g, F(x));
export const intersectOf = (f, g) => AF.intersect(f, g);
