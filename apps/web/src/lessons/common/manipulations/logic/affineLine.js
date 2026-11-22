import * as AF from '@smarter-academy/core/arithmetic/affine.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { parseValue, niceStep, subdivide, indexOf, valueAt, indexRange, isMultiple } from './originLine';

/**
 * affine-line — LA DROITE QUI A QUITTÉ L'ORIGINE (unité 7 « الدالة التآلفية », leçon 2
 * « التمثيل البياني لدالة تآلفية وقراءته بيانيًا »).
 *
 * Toute la vérité vient de packages/core/arithmetic/affine.js (fractions EXACTES de linear.js) :
 * une image est `affine.imageOf`, un antécédent `affine.antecedentOf`, un point est sur la droite
 * ⇔ `affine.onLine`, (0 ; b) est `affine.yIntercept`. Les flottants ne servent qu'aux pixels ; une
 * position de la main est toujours ramenée à un nœud d'une grille exacte (helpers d'origin-line,
 * réutilisés tels quels : `parseValue`, `niceStep`, `subdivide`, `indexOf`, `valueAt`, `indexRange`).
 *
 * Quatre laboratoires, enchaînés par « | » dans `mode` (le niveau متقدم du نشاط 3 est « shift|identify ») —
 * l'élève passe de l'un à l'autre par un BOUTON, avec un retour (MANIPULATION_CONTRACT §7quater) :
 *   shift     la droite fantôme (d) de x ⟼ ax passe par O ; la droite de l'élève part de (d) (b′ = 0) ; il
 *             tire le point (0 ; b′) sur l'axe des ordonnées (ou saisit la droite) : TOUTE la droite monte,
 *             chaque point de b′. Validée à b′ ≠ b : refusée avec f(0) = b. Une sonde x lit, à la même
 *             abscisse, l'ordonnée sur (d) et sur (d′) : l'écart est b, partout.
 *   identify  une droite (D) est donnée, sa formule cachée ; l'élève règle SA droite par deux poignées : le
 *             point (0 ; b′) et la marche « 1 à droite, a′ en haut ». Chaque essai dit la relation des deux
 *             droites (parallèles : même a ; sécantes sur l'axe des ordonnées : même b ; confondues).
 *   draw      f est donnée ; l'élève pose des points (épingle) — hors de la droite : refusé avec l'écart ;
 *             O est refusé quand b ≠ 0 (f(0) = b). Deux points acceptés tracent la droite.
 *   read      la droite est donnée ; une sonde sur l'axe des abscisses (image) ou des ordonnées (antécédent),
 *             cibles `reads` (« x:4|y:7 »).
 *
 * Un ESSAI est un geste VALIDÉ (relâchement, Entrée, bouton, pause du clavier).
 */

const { frac, mul, div, add, sub, eq, isZero, cmp, toNumber, fracDecimal } = Lin;
const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseValue(v));

const MODES = Object.freeze(['shift', 'identify', 'draw', 'read']);
export const THEMES = Object.freeze(['ramp']);

/* ── lecture des props ─────────────────────────────────────────────────── */

/** « shift|identify » → ['shift', 'identify'] (modes inconnus refusés). */
export function parseModes(raw) {
  const list = String(raw ?? 'shift').split('|').map((m) => m.trim()).filter(Boolean);
  for (const m of list) if (!MODES.includes(m)) throw new Error(`affine-line : mode inconnu « ${m} »`);
  if (list.length === 0) throw new Error('affine-line : aucun mode');
  return list;
}

/** « -1/2:3 » → { a, b }. */
export function parseLine(raw) {
  if (raw == null || raw === '') return null;
  const [a, b] = String(raw).split(':');
  if (b == null) throw new Error(`affine-line : droite illisible « ${raw} » (attendu « a:b »)`);
  return { a: parseValue(a), b: parseValue(b) };
}

/** « x:4|y:7 » → [{ axis, v }]. */
export function parseReads(raw) {
  if (!raw) return [];
  return String(raw).split('|').filter(Boolean).map((s) => {
    const [axis, v] = s.split(':');
    if (axis !== 'x' && axis !== 'y') throw new Error(`affine-line : lecture illisible « ${s} »`);
    return { axis, v: parseValue(v) };
  });
}

/** L'écriture du manuel : une fraction reste une fraction (« 3/2 »), un décimal reste décimal (« 0,5 »). */
export const styleOf = (...raws) => (raws.some((r) => r != null && String(r).includes('/')) ? 'frac' : 'dec');

/* ── la fonction ───────────────────────────────────────────────────────── */

const fn = (a, b) => AF.affine(F(a), F(b));
export const image = (a, b, x) => AF.imageOf(fn(a, b), F(x));
/** L'antécédent EXACT de y (a ≠ 0), sinon null. */
export function antecedent(a, b, y) {
  const r = AF.antecedentOf(fn(a, b), F(y));
  return r.kind === 'unique' ? r.x : null;
}
export const onLine = (a, b, x, y) => AF.onLine(fn(a, b), F(x), F(y));
export const dirOf = (a) => AF.direction(fn(a, 0));

/* ── la fenêtre ─────────────────────────────────────────────────────────── */

/**
 * La fenêtre par défaut : O, (0 ; b), chaque droite du laboratoire sur [xMin ; xMax], les cibles et les
 * points donnés. Deux unités à gauche de O (les lectures négatives du manuel), 4 à 6 à droite.
 */
function defaultWindow({ lines = [], reads = [], extraX = [], extraY = [] }) {
  const steep = lines.some((l) => Math.abs(toNumber(l.a)) > 1);
  const w = { xMin: -2, xMax: steep ? 4 : 6, yMin: 0, yMax: 0 };
  reads.forEach((r) => { if (r.axis === 'x') extraX.push(toNumber(r.v)); else extraY.push(toNumber(r.v)); });
  extraX.forEach((x) => { w.xMin = Math.min(w.xMin, Math.floor(x)); w.xMax = Math.max(w.xMax, Math.ceil(x)); });
  const ys = [0, ...extraY];
  for (const l of lines) {
    ys.push(toNumber(l.b));
    ys.push(toNumber(AF.imageOf(fn(l.a, l.b), w.xMin)), toNumber(AF.imageOf(fn(l.a, l.b), w.xMax)));
  }
  reads.forEach((r) => {
    for (const l of lines) {
      if (r.axis === 'x') ys.push(toNumber(image(l.a, l.b, r.v)));
    }
  });
  w.yMin = Math.min(-1, Math.floor(Math.min(...ys)));
  w.yMax = Math.max(1, Math.ceil(Math.max(...ys)));
  return w;
}

function readWindow(props, lines, reads, extraX, extraY) {
  const d = defaultWindow({ lines, reads, extraX: [...extraX], extraY: [...extraY] });
  const pick = (k) => (props[k] != null && props[k] !== '' ? toNumber(parseValue(props[k])) : d[k]);
  const w = { xMin: pick('xMin'), xMax: pick('xMax'), yMin: pick('yMin'), yMax: pick('yMax') };
  // O et le pas « 1 à droite » sont TOUJOURS dans la fenêtre : la droite se lit à partir de l'axe des ordonnées.
  w.xMin = Math.min(0, w.xMin); w.yMin = Math.min(0, w.yMin);
  w.xMax = Math.max(1, w.xMax); w.yMax = Math.max(0, w.yMax);
  if (w.yMax - w.yMin <= 0) w.yMax = w.yMin + 1;
  return w;
}

/* ── l'état ─────────────────────────────────────────────────────────────── */

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'N', 'P'];

/**
 * @param props { a, b, mode, find, reads, xMin, xMax, yMin, yMax } (chaînes du contrat)
 */
export function init(props = {}) {
  const modes = parseModes(props.mode);
  const a = parseValue(props.a);
  const b = parseValue(props.b);
  if (a == null || b == null) throw new Error('affine-line : « a » et « b » sont requis');
  const find = parseLine(props.find);
  // identify : la droite cachée est `find` dans un enchaînement, sinon la fonction elle-même
  const hidden = modes.includes('identify') ? (find ?? (modes[0] === 'identify' ? { a, b } : null)) : null;
  if (modes.includes('identify') && !hidden) throw new Error('affine-line : identify enchaîné demande « find » (a:b)');
  if (modes.includes('read') && isZero(a)) throw new Error('affine-line : a = 0 ne permet aucune lecture d\'antécédent');
  const reads = parseReads(props.reads);
  const lines = [{ a, b }, ...(modes.includes('shift') ? [{ a, b: frac(0) }] : []), ...(hidden ? [hidden] : [])];
  const win = readWindow(props, lines, reads, [], [toNumber(b)]);
  const xStep = niceStep(win.xMax - win.xMin);
  const yStep = niceStep(win.yMax - win.yMin);
  const style = styleOf(props.a, props.b, props.find);

  // les grilles de la MAIN — assez fines pour atteindre exactement chaque valeur utile
  const bs = [b, hidden?.b, div(yStep, 2)];
  const dB = subdivide(yStep, bs);                                   // le point (0 ; b′)
  const dA = subdivide(frac(1), [a, hidden?.a, frac(1, 2)]);         // la marche : a′ (pas horizontal 1)
  const dx = subdivide(xStep, [...reads.filter((r) => r.axis === 'x').map((r) => r.v), div(xStep, 2)]);
  const dyPin = subdivide(yStep, [b, mul(a, dx)]);                   // draw : chaque point (i·dx ; f(i·dx)) est un nœud
  const dyRead = subdivide(yStep, [...reads.filter((r) => r.axis === 'y').map((r) => r.v), div(yStep, 2)]);

  return Object.freeze({
    modes, stage: 0, a, b, hidden, reads, win, style,
    grid: { xStep, yStep }, snap: { dB, dA, dx, dyPin, dyRead },
    // shift / identify : la droite de l'élève
    bNow: frac(0),
    aNow: modes[0] === 'identify' ? startSlope(hidden) : a,
    shiftDone: false,
    probes: [],          // shift : lectures { x, yd, yl, b }
    tries: [],           // identify : { a, b, rel }
    matched: false,
    placed: [],          // draw
    readsDone: [],       // read
    trials: [],
    last: null,
  });
}

/** La pente de départ de la droite de l'élève en identify : jamais celle de la droite cachée. */
function startSlope(hidden) {
  return hidden && eq(hidden.a, 1) ? frac(-1) : frac(1);
}

export const mode = (s) => s.modes[s.stage];

/* ── shift : le point (0 ; b′) ──────────────────────────────────────────── */

/** Valider la droite de l'élève montée à b′ (shift) ou réglée (identify). */
export function setB(s, bNew) {
  bNew = F(bNew);
  if (mode(s) === 'shift') {
    const ok = eq(bNew, s.b);
    const trial = { kind: 'shift', b: bNew, ok };
    return {
      ...s,
      bNow: bNew,
      shiftDone: s.shiftDone || ok,
      trials: [...s.trials, trial],
      last: { ...trial, kind: ok ? 'shiftOk' : isZero(bNew) ? 'shiftZero' : 'shiftOff' },
    };
  }
  if (mode(s) === 'identify') return tryLine({ ...s, bNow: bNew });
  return s;
}

/** La marche « 1 à droite, a′ en haut » : seule l'identification la libère ; en shift, a est celle de f. */
export function setA(s, aNew) {
  if (mode(s) === 'shift') return { ...s, last: { kind: 'aFixed' } };
  if (mode(s) !== 'identify') return s;
  return tryLine({ ...s, aNow: F(aNew) });
}

/** Les deux droites (celle de l'élève, la cachée) : confondues, parallèles, sécantes sur l'axe des ordonnées, ou sécantes. */
export function relation(a1, b1, a2, b2) {
  const sameA = eq(a1, a2);
  const sameB = eq(b1, b2);
  if (sameA && sameB) return 'match';
  if (sameA) return 'parallel';
  if (sameB) return 'sameB';
  return 'cross';
}

function tryLine(s) {
  const rel = relation(s.aNow, s.bNow, s.hidden.a, s.hidden.b);
  const prev = s.tries[s.tries.length - 1];
  const dup = prev && eq(prev.a, s.aNow) && eq(prev.b, s.bNow);
  const t = { kind: 'try', a: s.aNow, b: s.bNow, rel, ok: rel === 'match' };
  return {
    ...s,
    tries: dup ? s.tries : [...s.tries, t],
    trials: dup ? s.trials : [...s.trials, t],
    matched: s.matched || rel === 'match',
    last: { ...t, kind: `rel-${rel}` },
  };
}

/** Sonde x en shift : la même abscisse sur (d) et sur la droite de l'élève. */
export function probe(s, x) {
  x = F(x);
  if (mode(s) === 'shift') {
    const yd = image(s.a, 0, x);
    const yl = image(s.a, s.bNow, x);
    const p = { kind: 'probe', x, yd, yl, b: s.bNow };
    const dup = s.probes.some((q) => eq(q.x, x) && eq(q.b, s.bNow));
    return { ...s, probes: dup ? s.probes : [...s.probes, p], trials: dup ? s.trials : [...s.trials, p], last: p };
  }
  if (mode(s) === 'read' || (mode(s) === 'draw' && drawLine(s))) return recordRead(s, { axis: 'x', v: x, other: image(s.a, s.b, x) });
  return s;
}

/** Sonde y en read : le nombre dont l'image est y. */
export function readY(s, y) {
  if (mode(s) !== 'read') return s;
  y = F(y);
  const x = antecedent(s.a, s.b, y);
  if (x == null) return s;
  return recordRead(s, { axis: 'y', v: y, other: x });
}

function recordRead(s, r) {
  const target = s.reads.findIndex((t) => t.axis === r.axis && eq(t.v, r.v));
  const read = { ...r, target: target >= 0 ? target : null };
  const dup = s.readsDone.some((d) => d.axis === r.axis && eq(d.v, r.v));
  return {
    ...s,
    readsDone: dup ? s.readsDone : [...s.readsDone, read],
    trials: dup ? s.trials : [...s.trials, { kind: `read-${r.axis}`, ...read }],
    last: { kind: `read-${r.axis}`, ...read },
  };
}

export const targetsDone = (s) => s.reads.map((t) => s.readsDone.some((d) => d.axis === t.axis && eq(d.v, t.v)));

/* ── draw ───────────────────────────────────────────────────────────────── */

/** La droite est tracée dès deux points acceptés d'abscisses différentes. */
export const drawLine = (s) => new Set(s.placed.map((p) => Lin.fracText(p.x))).size >= 2;

export function place(s, x, y) {
  if (mode(s) !== 'draw') return s;
  x = F(x); y = F(y);
  if (s.placed.some((p) => eq(p.x, x) && eq(p.y, y))) return { ...s, last: { kind: 'same', x, y } };
  const fx = image(s.a, s.b, x);
  const ok = eq(fx, y);
  const origin = isZero(x) && isZero(y);
  const trial = { kind: 'point', x, y, ok, fx, gap: sub(y, fx), origin };
  if (!ok) return { ...s, trials: [...s.trials, trial], last: { ...trial, kind: origin ? 'originRefused' : 'refused' } };
  const label = LETTERS.find((l) => !s.placed.some((p) => p.label === l)) ?? `P${s.placed.length + 1}`;
  const placed = [...s.placed, { x, y, label }];
  const next = { ...s, placed, trials: [...s.trials, { ...trial, label }] };
  return { ...next, last: { ...trial, kind: 'accepted', label, line: drawLine(next) && !drawLine(s) } };
}

/** Un nœud de départ de l'épingle qui n'est PAS sur la droite (rien n'est offert). */
export function startPin(s) {
  const rx = indexRange(s.win.xMin, s.win.xMax, s.snap.dx);
  const ry = indexRange(s.win.yMin, s.win.yMax, s.snap.dyPin);
  const i = Math.max(rx.min, Math.min(rx.max, Math.round(rx.max / 2)));
  let j = Math.max(ry.min, Math.min(ry.max, Math.round(ry.max / 2)));
  const on = (jj) => eq(image(s.a, s.b, valueAt(i, s.snap.dx)), valueAt(jj, s.snap.dyPin));
  if (on(j)) j = j + 1 <= ry.max ? j + 1 : j - 1;
  return { i, j };
}

/* ── l'enchaînement des laboratoires ────────────────────────────────────── */

/** Le laboratoire `m` a-t-il produit son évidence ? */
export function stageDone(s, m = mode(s)) {
  if (m === 'shift') {
    // la droite montée à b ET deux lectures à des abscisses différentes (l'écart ne dépend pas de x)
    const xs = new Set(s.probes.filter((p) => eq(p.b, s.b)).map((p) => Lin.fracText(p.x)));
    return s.shiftDone && xs.size >= 2;
  }
  if (m === 'identify') return s.matched;
  if (m === 'draw') return drawLine(s);
  if (s.reads.length > 0) return targetsDone(s).every(Boolean);
  return s.readsDone.some((r) => r.axis === 'x') && s.readsDone.some((r) => r.axis === 'y');
}

/** « أعِد التجربة » (LabCheckpoint) : le laboratoire COURANT repart de zéro (les autres gardent leur état). */
export function restartStage(s) {
  const m = mode(s);
  const own = { shift: ['shift', 'probe'], identify: ['try'], draw: ['point'], read: ['read-x', 'read-y'] }[m];
  const trials = s.trials.filter((tr) => !own.includes(tr.kind));
  if (m === 'shift') return { ...s, bNow: frac(0), shiftDone: false, probes: [], trials, last: null };
  if (m === 'identify') return { ...s, bNow: frac(0), aNow: startSlope(s.hidden), tries: [], matched: false, trials, last: null };
  if (m === 'draw') return { ...s, placed: [], trials, last: null };
  return { ...s, readsDone: [], trials, last: null };
}

export const hasNext = (s) => s.stage < s.modes.length - 1;
/** Passer au laboratoire suivant — seulement quand celui-ci est accompli (le geste de l'élève). */
export function next(s) {
  if (!hasNext(s) || !stageDone(s)) return s;
  const stage = s.stage + 1;
  const m = s.modes[stage];
  const lastTry = m === 'identify' ? s.tries[s.tries.length - 1] : null;
  if (lastTry) return { ...s, stage, bNow: lastTry.b, aNow: lastTry.a, last: null };
  return { ...s, stage, bNow: frac(0), aNow: m === 'identify' ? startSlope(s.hidden) : s.a, last: null };
}
/** Revenir au laboratoire précédent : son état survit (seule la droite de l'élève est remise à son dernier état). */
export function back(s) {
  if (s.stage === 0) return s;
  const stage = s.stage - 1;
  const m = s.modes[stage];
  return { ...s, stage, bNow: m === 'shift' ? (s.shiftDone ? s.b : frac(0)) : s.bNow, aNow: m === 'shift' ? s.a : s.aNow, last: null };
}

/** La découverte : tous les laboratoires du niveau ont produit leur évidence. */
export const discoveryReady = (s) => s.modes.every((m) => stageDone(s, m));

/** Le laboratoire qui porte la conjecture : identify > shift > draw > read. */
export function primaryMode(s) {
  for (const m of ['identify', 'shift', 'draw', 'read']) if (s.modes.includes(m)) return m;
  return s.modes[0];
}

/* ── la main sur la grille ──────────────────────────────────────────────── */

export { indexOf, valueAt, indexRange };
/** Bornes du nœud du point (0 ; b′). */
export const bRange = (s) => indexRange(s.win.yMin, s.win.yMax, s.snap.dB);
/** Bornes du nœud de la marche : le sommet (1 ; b′ + a′) reste dans la fenêtre. */
export function aRange(s, bNow = s.bNow) {
  const B = toNumber(bNow);
  return indexRange(s.win.yMin - B, s.win.yMax - B, s.snap.dA);
}
/** Le b′ qui fait passer la droite (pente a′) sous le doigt (x ; y). */
export const bIndexUnder = (s, aNow, x, y) => indexOf(y - toNumber(aNow) * x, s.snap.dB);
/** Le a′ qui fait passer la droite (par (0 ; b′)) sous le doigt (x ≠ 0). */
export function aIndexUnder(s, bNow, x, y) {
  if (Math.abs(x) < 0.35) return null;
  return indexOf((y - toNumber(bNow)) / x, s.snap.dA);
}

/* ── écritures (affichage) ──────────────────────────────────────────────── */

/** « 1,5 » / « 3/2 » en texte simple (ARIA, data-*). */
export function numText(p, style = 'dec') {
  p = F(p);
  if (style === 'frac' && p.d !== 1) return Lin.fracText(p);
  return fracDecimal(p, 4) ?? Lin.fracText(p);
}
/** LaTeX : « 1{,}5 » / « \dfrac{3}{2} » / « -\dfrac{1}{2} ». */
export function numTex(p, style = 'dec') {
  p = F(p);
  if (style === 'frac' && p.d !== 1) return Lin.fracLatex(p);
  const d = fracDecimal(p, 4);
  return d != null ? d.replace(',', '{,}') : Lin.fracLatex(p);
}
/** Valeur sans écriture décimale finie : exacte, puis approchée. */
export function approxTex(p, style = 'dec') {
  p = F(p);
  if (fracDecimal(p, 4) != null || style === 'frac') return numTex(p, style);
  return `${Lin.fracLatex(p)} \\approx ${toNumber(p).toFixed(2).replace('.', '{,}')}`;
}
export const pointTex = (x, y, style) => `(${numTex(x, style)} ; ${numTex(y, style)})`;
export const pointText = (x, y, style) => `(${numText(x, style)} ; ${numText(y, style)})`;

/** Le terme « ax » : « x », « -x », « \dfrac{3}{2}x », « 0 » (a = 0). */
function axTex(a, style) {
  if (isZero(a)) return '';
  if (eq(a, 1)) return 'x';
  if (eq(a, -1)) return '-x';
  return `${numTex(a, style)}x`;
}
/** « \dfrac{3}{2}x + 1 », « -\dfrac{1}{2}x + 3 », « 2x - 3 », « 4 », « x ». */
export function affineTex(a, b, style = 'dec') {
  a = F(a); b = F(b);
  const ax = axTex(a, style);
  if (!ax) return numTex(b, style);
  if (isZero(b)) return ax;
  return cmp(b, 0) < 0 ? `${ax} - ${numTex(sub(0, b), style)}` : `${ax} + ${numTex(b, style)}`;
}
export const lineTex = (a, b, style) => `y = ${affineTex(a, b, style)}`;
export function affineText(a, b, style = 'dec') {
  a = F(a); b = F(b);
  const ax = isZero(a) ? '' : eq(a, 1) ? 'x' : eq(a, -1) ? '-x' : `${numText(a, style)}x`;
  if (!ax) return numText(b, style);
  if (isZero(b)) return ax;
  return cmp(b, 0) < 0 ? `${ax} - ${numText(sub(0, b), style)}` : `${ax} + ${numText(b, style)}`;
}
/** « \dfrac{3}{2} \times 2 + 1 = 4 » (le calcul d'une image). */
export function imageCalcTex(a, b, x, style = 'dec') {
  a = F(a); b = F(b); x = F(x);
  const xt = cmp(x, 0) < 0 ? `(${numTex(x, style)})` : numTex(x, style);
  const at = numTex(a, style);
  const bt = cmp(b, 0) < 0 ? ` - ${numTex(sub(0, b), style)}` : isZero(b) ? '' : ` + ${numTex(b, style)}`;
  return `${at} \\times ${xt}${bt} = ${numTex(image(a, b, x), style)}`;
}
/** Valeur signée pour l'écart (« +1 », « -2 »). */
export const signedTex = (p, style) => (cmp(F(p), 0) < 0 ? numTex(p, style) : `+${numTex(p, style)}`);
export const absTex = (p, style) => numTex(cmp(F(p), 0) < 0 ? sub(0, F(p)) : F(p), style);

/* ── géométrie du dessin (pixels — ne décide RIEN) ──────────────────────── */

/** Le tronçon de y = a·x + b visible dans la fenêtre (flottants), ou null. */
export function segment(a, b, win) {
  const A = toNumber(a); const B = toNumber(b);
  let lo = win.xMin; let hi = win.xMax;
  if (A !== 0) {
    const x1 = (win.yMin - B) / A; const x2 = (win.yMax - B) / A;
    lo = Math.max(lo, Math.min(x1, x2)); hi = Math.min(hi, Math.max(x1, x2));
  } else if (B < win.yMin || B > win.yMax) return null;
  if (hi - lo < 1e-9) return null;
  return [[lo, A * lo + B], [hi, A * hi + B]];
}

/**
 * Les abscisses entières où l'on dessine la flèche « (d) → (d′) » en shift : les points des deux droites
 * dans la fenêtre, au plus `max`, en évitant 0 (où l'on voit déjà (0 ; b′)).
 */
export function liftColumns(s, bNow = s.bNow, max = 4) {
  const out = [];
  for (let x = Math.ceil(s.win.xMin); x <= Math.floor(s.win.xMax) && out.length < max; x++) {
    if (x === 0) continue;
    const yd = toNumber(image(s.a, 0, x));
    const yl = yd + toNumber(bNow);
    if (yd >= s.win.yMin && yd <= s.win.yMax && yl >= s.win.yMin && yl <= s.win.yMax) out.push(x);
  }
  return out;
}

/* ── accès exacts pour la vue ───────────────────────────────────────────── */
export const toNum = (p) => toNumber(F(p));
export const same = (p, q) => eq(F(p), F(q));
export const isMul = (p, d) => isMultiple(F(p), F(d));
export { F as toFrac, add as addFrac };

/* ── valeurs par défaut des sondes (jamais un essai, jamais une cible) ──────── */

/**
 * L'indice de départ d'une sonde ('x' ou 'y') : un nœud de la grille qui n'est PAS une cible de `reads`
 * (la lecture demandée ne doit jamais être donnée d'avance) ; on préfère x = 1 pour la sonde x.
 * Ce n'est pas un essai : rien n'entre dans `trials` / `readsDone` / `probes`.
 */
export function defaultProbeIndex(s, axis) {
  const d = axis === 'x' ? s.snap.dx : s.snap.dyRead;
  const r = axis === 'x' ? indexRange(s.win.xMin, s.win.xMax, d) : indexRange(s.win.yMin, s.win.yMax, d);
  const isTarget = (i) => s.reads.some((t) => t.axis === axis && eq(t.v, valueAt(i, d)));
  const order = [];
  if (axis === 'x') { const one = indexOf(1, d); if (one >= r.min && one <= r.max) order.push(one); }
  for (let i = r.min; i <= r.max; i++) order.push(i);
  const ok = order.find((i) => !isTarget(i) && (axis !== 'y' || antecedent(s.a, s.b, valueAt(i, d)) != null));
  return ok ?? r.min;
}

/** Les indices de sonde pas encore essayés (balayage « جرّب كل الإمكانيات »), dans l'ordre croissant. */
export function untriedProbes(s, axis, bNow = s.bNow) {
  const d = axis === 'x' ? s.snap.dx : s.snap.dyRead;
  const r = axis === 'x' ? indexRange(s.win.xMin, s.win.xMax, d) : indexRange(s.win.yMin, s.win.yMax, d);
  const out = [];
  for (let i = r.min; i <= r.max; i++) {
    const v = valueAt(i, d);
    const done = mode(s) === 'shift'
      ? s.probes.some((q) => eq(q.x, v) && eq(q.b, bNow))
      : s.readsDone.some((q) => q.axis === axis && eq(q.v, v));
    if (!done) out.push(i);
  }
  return out;
}

/** Les indices b′ pas encore essayés (shift). */
export function untriedShifts(s) {
  const r = bRange(s);
  const out = [];
  for (let i = r.min; i <= r.max; i++) if (!s.trials.some((t) => t.kind === 'shift' && eq(t.b, valueAt(i, s.snap.dB)))) out.push(i);
  return out;
}
