/**
 * pin-rails — LA LOGIQUE PURE de « سكك الدبابيس » (3AM, unité 6 « التناسبية », درس « التناسبية والتمثيل البياني », 2026-10-21). Exacte : toute la
 * mathématique vient de `packages/core/arithmetic/graphs3.js` (sur `linear.js`, importé PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Un tableau de prix (boîtes → dinars) devient des POINTS d'un repère : chaque colonne est une SAIGNÉE verticale (une « سكّة ») le long de
 * laquelle la main GLISSE un punaise ; une règle droite se pose sur DEUX nœuds (O ou un punaise), et touche exactement les nœuds qui sont sur sa droite.
 * Trois sortes de TÂCHES :
 *   plot   le tableau est donné ; l'élève LÈVE chaque punaise à son prix (arrondi à `unit`) ; la règle s'ouvre quand les punaise sont posés ;
 *   given  les punaise sont déjà posés (la « photo » d'un autre tableau) ; seule la règle travaille ;
 *   read   la droite par O et les punaise est posée ; UN punaise est à placer SUR la droite : à l'abscisse donnée (`ask.x`, il monte sur sa rainure) ou à
 *          l'ordonnée donnée (`ask.y`, il glisse le long de la rangée).
 * Une tâche plot / given est RÉUSSIE quand la situation est jugée : proportionnelle (une règle touche O et tous les punaise), alignée sans O
 * (une règle touche tous les punaise, O est en dehors), brisée (aucune règle ne les touche tous) — l'élève doit avoir ESSAYÉ ce qui le montre.
 * « جرّب أعدادك » (`free`) : l'élève écrit le prix a (et des frais b) d'une boutique de son choix ; les punaise sont posés, la règle essaie.
 */
import * as G from '@smarter-academy/core/arithmetic/graphs3.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

const KINDS = Object.freeze(['plot', 'given', 'read']);
const O_ID = 0;

const PRESETS = Object.freeze({
  beginner: { tasks: [
    { mode: 'plot', shop: 'one', xs: [2, 6, 12, 14], rule: { a: '5' }, frame: { xMax: 16, yMax: 80, xStep: 2, yStep: 10, unit: 5 } },
    { mode: 'given', shop: 'two', xs: [2, 6, 12, 14], rule: { a: '2.5', b: '10' }, frame: { xMax: 16, yMax: 80, xStep: 2, yStep: 10, unit: 5 } },
    { mode: 'given', shop: 'three', xs: [2, 6, 12, 14], rule: { a: '5', k: 8, a2: '2' }, frame: { xMax: 16, yMax: 80, xStep: 2, yStep: 10, unit: 5 } },
  ] },
  advanced: { tasks: [
    { mode: 'given', shop: 'bags', xs: [2, 4, 6, 8], rule: { a: '1.5' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
    { mode: 'given', shop: 'crate', xs: [2, 4, 6, 8], rule: { a: '0.5', b: '4' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
    { mode: 'read', shop: 'unit', xs: [2, 4, 6, 8], rule: { a: '1.5' }, ask: { x: '1' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
    { mode: 'read', shop: 'seven', xs: [2, 4, 6, 8], rule: { a: '1.5' }, ask: { x: '7' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
    { mode: 'read', shop: 'mass', xs: [2, 4, 6, 8], rule: { a: '1.5' }, ask: { y: '15' }, frame: { xMax: 12, yMax: 18, xStep: 2, yStep: 2, unit: 0.5 } },
  ] },
});

const num = (v) => (typeof v === 'object' ? v : Lin.parseNumber(v));

/** La tâche complétée : points, verdict de la situation, cadre, réponse d'une lecture — tout CALCULÉ, jamais saisi. */
function build(raw, i) {
  if (!KINDS.includes(raw.mode)) throw new Error(`tâche inconnue : ${raw.mode}`);
  const points = G.pointsOf(raw.rule, raw.xs);
  const frame = raw.frame ?? { ...G.frameFor(points), unit: 1 };
  const task = { id: `t${i}`, mode: raw.mode, shop: raw.shop, xs: raw.xs.map(num), points, rule: raw.rule, frame: { ...frame, unit: frame.unit ?? 1 } };
  task.kind = G.classify(points);
  if (raw.mode === 'read') {
    if (task.kind !== 'prop') throw new Error('une lecture se fait sur une situation proportionnelle');
    const a = G.coefficient(points);
    task.a = a;
    if (raw.ask.x != null) { task.ask = { axis: 'x', value: num(raw.ask.x) }; task.answer = G.valueAt(a, raw.ask.x); }
    else { task.ask = { axis: 'y', value: num(raw.ask.y) }; task.answer = G.abscissaAt(a, raw.ask.y); }
  }
  return Object.freeze(task);
}

export const unitOf = (task) => num(task.frame.unit);

/** L'état de départ d'une tâche (punaise, règle, essais de règle). */
function fresh(task) {
  const pins = task.mode === 'plot' ? task.points.map(() => null) : task.points.map((p) => p.y);
  return { pins, rod: task.mode === 'read' ? [O_ID, 1] : [null, null], rods: [] };
}

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const tasks = raws.map(build);
  return { tasks, ti: 0, ...fresh(tasks[0]), done: {}, trials: [], last: null, free: null, readPos: null };
}

export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);

/** Les punaise posés : { col, x, y }. */
const placedPins = (s) => taskOf(s).points.map((p, col) => ({ col, x: p.x, y: s.pins[col] })).filter((q) => q.y != null);
export const allPlaced = (s) => s.pins.every((y) => y != null);
/** Les nœuds où la règle peut s'accrocher : 0 = O, puis les punaise posés (1 + col). */
export function nodes(s) {
  const out = [{ id: O_ID, x: Lin.frac(0), y: Lin.frac(0), label: 'O' }];
  placedPins(s).forEach((q) => out.push({ id: 1 + q.col, x: q.x, y: q.y, label: `P${q.col + 1}` }));
  return out;
}
const nodeById = (s, id) => nodes(s).find((n) => n.id === id) ?? null;
export const rodOpen = (s) => taskOf(s).mode !== 'plot' || allPlaced(s);

/* ── Gestes : un punaise sur sa rainure ───────────────────────────────────────────────────────── */

/** Arrondit une ordonnée à l'unité de la rainure et la borne au cadre. */
function snapY(task, raw) {
  const u = unitOf(task);
  const v = Math.max(0, Math.min(task.frame.yMax, Lin.toNumber(num(raw))));
  const k = Math.round(v / Lin.toNumber(u));
  return Lin.mul(u, Lin.frac(k));
}
function snapX(task, raw) {
  const u = unitOf(task);
  const v = Math.max(0, Math.min(task.frame.xMax, Lin.toNumber(num(raw))));
  const k = Math.round(v / Lin.toNumber(u));
  return Lin.mul(u, Lin.frac(k));
}

/** Lâche le punaise de la colonne `col` à l'ordonnée `yRaw` : un ESSAI jugé (le tableau fait foi). */
export function placePin(s, col, yRaw) {
  const task = taskOf(s);
  if (task.mode !== 'plot' || s.free || s.pins[col] != null) return s;
  const y = snapY(task, yRaw);
  const want = task.points[col].y;
  const ok = Lin.eq(y, want);
  const trial = Object.freeze({
    kind: 'pin', task: s.ti, ok, col, x: G.text(task.points[col].x), y: G.text(y), want: G.text(want),
    why: ok ? null : Lin.cmp(y, want) < 0 ? 'low' : 'high', free: false,
  });
  const pins = ok ? s.pins.map((v, i) => (i === col ? y : v)) : s.pins;
  return { ...s, pins, trials: [...s.trials, trial], last: trial };
}

/* ── Gestes : la règle ───────────────────────────────────────────────────────────────────────── */

const rodKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
/** La droite de la règle posée sur les nœuds a et b (null si l'un manque ou si elle serait verticale). */
function rodLine(s, a = s.rod[0], b = s.rod[1]) {
  const A = a != null ? nodeById(s, a) : null;
  const B = b != null ? nodeById(s, b) : null;
  if (!A || !B) return null;
  return G.lineThrough(A, B);
}

/** Pose l'extrémité `end` (0 ou 1) de la règle sur le nœud `nodeId` ; si l'autre extrémité y est déjà, elles ÉCHANGENT leurs nœuds. */
export function setRodEnd(s, end, nodeId) {
  if (!rodOpen(s) || taskOf(s).mode === 'read') return s;
  if (!nodeById(s, nodeId)) return s;
  const rod = [...s.rod];
  if (rod[end] === nodeId) return s;
  if (rod[1 - end] === nodeId) { rod[1 - end] = rod[end]; rod[end] = nodeId; }
  else rod[end] = nodeId;
  if (rod[0] == null || rod[1] == null) return { ...s, rod, last: null };
  return judgeRod({ ...s, rod });
}

/** Les nœuds touchés par la règle courante, la droite et le verdict de l'essai. */
export function rodReading(s) {
  const line = rodLine(s);
  if (!line) return null;
  const all = nodes(s);
  const touched = all.map((n) => G.onLine(line, n));
  const pins = all.filter((n) => n.id !== O_ID);
  const pinsHit = pins.every((n) => G.onLine(line, n));
  const throughO = G.onLine(line, { x: Lin.frac(0), y: Lin.frac(0) });
  const gaps = all.map((n) => Lin.sub(n.y, Lin.add(Lin.mul(line.a, n.x), line.b)));
  return { line, all, touched, throughO, pinsHit, full: throughO && pinsHit, count: touched.filter(Boolean).length, total: all.length, gaps };
}

function judgeRod(s) {
  const r = rodReading(s);
  if (!r) return s;
  const key = rodKey(s.rod[0], s.rod[1]);
  const rods = s.rods.some((q) => q.key === key) ? s.rods : [...s.rods, { key, throughO: r.throughO, pinsHit: r.pinsHit, full: r.full }];
  const worst = r.all.map((n, i) => ({ n, g: Lin.cmp(r.gaps[i], 0) < 0 ? Lin.neg(r.gaps[i]) : r.gaps[i] })).filter((e) => !Lin.isZero(e.g))
    .sort((p, q) => Lin.cmp(q.g, p.g))[0] ?? null;
  const trial = Object.freeze({
    kind: 'rod', task: s.ti, ends: [...s.rod], full: r.full, throughO: r.throughO, pinsHit: r.pinsHit, count: r.count, total: r.total, free: !!s.free,
    cuts: G.text(r.line.b), slope: G.text(r.line.a), gapNode: worst ? worst.n.label : null, gap: worst ? G.text(worst.g) : null, shape: taskOf(s).kind,
  });
  const next = { ...s, rods, trials: [...s.trials, trial], last: trial };
  return !s.free && decided(next) ? { ...next, done: { ...next.done, [s.ti]: true } } : next;
}

/** La situation est-elle JUGÉE par ce que l'élève a essayé ? */
function decided(s) {
  const task = taskOf(s);
  if (task.mode === 'read') return false;
  const rods = s.rods;
  if (task.kind === 'prop') return rods.some((q) => q.full);
  const hasO = rods.some((q) => q.throughO);
  if (task.kind === 'aligned') return hasO && rods.some((q) => q.pinsHit);
  return rods.length >= 3 && hasO && rods.some((q) => !q.throughO);
}

/* ── Gestes : une lecture ────────────────────────────────────────────────────────────────────── */

/** Lâche le punaise de lecture : `raw` est l'ordonnée (ask.x) ou l'abscisse (ask.y) choisie ; un ESSAI jugé. */
export function placeRead(s, raw) {
  const task = taskOf(s);
  if (task.mode !== 'read' || s.free || s.done[s.ti]) return s;
  const axis = task.ask.axis;
  const v = axis === 'x' ? snapY(task, raw) : snapX(task, raw);
  const ok = Lin.eq(v, task.answer);
  const c = Lin.cmp(v, task.answer);
  const at = axis === 'x' ? { x: G.text(task.ask.value), y: G.text(v) } : { x: G.text(v), y: G.text(task.ask.value) };
  const trial = Object.freeze({
    kind: 'read', task: s.ti, axis, ok, x: at.x, y: at.y, answer: G.text(task.answer), a: G.text(task.a),
    why: ok ? null : axis === 'x' ? (c < 0 ? 'below' : 'above') : (c < 0 ? 'left' : 'right'), free: false,
  });
  return { ...s, trials: [...s.trials, trial], last: trial, done: ok ? { ...s.done, [s.ti]: true } : s.done, readPos: ok ? v : null };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const task = s.tasks[s.ti + 1];
  return { ...s, ti: s.ti + 1, ...fresh(task), last: null, readPos: null };
}
/** « إعادة » : la même tâche, planche propre ; les essais restent. */
export const restartTask = (s) => (s.free ? { ...s, rod: [null, null], rods: [], last: null } : { ...s, ...fresh(taskOf(s)), last: null, readPos: null, done: { ...s.done, [s.ti]: s.done[s.ti] } });

/** « أعِد التجربة » (carte de questions) : la même tâche repart — planche propre, règle et lecture effacées, et la tâche n'est plus « faite » (la carte se rouvrira au prochain jugement). */
export const retryTask = (s) => (s.free ? restartTask(s) : { ...s, ...fresh(taskOf(s)), last: null, readPos: null, done: { ...s.done, [s.ti]: false } });

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

export function setFree(s, aRaw, bRaw = '0') {
  const a = G.parsePrice(aRaw, { min: 0.5, max: 20 });
  const b = G.parsePrice(bRaw === '' ? '0' : bRaw, { min: 0, max: 30 });
  if (!a || !b) return s;
  const rule = { a: Lin.fracText(a), b: Lin.fracText(b) };
  const xs = [2, 4, 6, 8];
  const points = G.pointsOf(rule, xs);
  const f = G.frameFor(points);
  const task = Object.freeze({
    id: 'free', mode: 'given', shop: 'free', xs: xs.map(num), points, rule, frame: { ...f, xMax: Math.max(f.xMax, 10), unit: 1 }, kind: G.classify(points),
  });
  return { ...s, free: { task, a: Lin.fracText(a), b: Lin.fracText(b) }, pins: points.map((p) => p.y), rod: [null, null], rods: [], last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, ...fresh(s.tasks[s.ti]), last: null, readPos: null } : s);

/* ── Lecture ─────────────────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i && t.kind !== 'refused');

/**
 * Le prochain geste utile — jamais la réponse : `pin` (lever le premier punaise), `rod` (poser la règle : une extrémité), `again` (essayer une autre
 * pose), `read` (lâcher le punaise de lecture), `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const task = taskOf(s);
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-pr-next]', gesture: 'tap', prefer: 'above' } : null;
  if (task.mode === 'plot' && !allPlaced(s)) {
    const col = s.pins.findIndex((y) => y == null);
    return { id: 'pin', target: `[data-pr-pin="${col}"]`, gesture: 'drag', prefer: 'below', noFlip: true };
  }
  if (task.mode === 'read') return { id: 'read', target: '[data-pr-read]', gesture: 'drag', prefer: 'below', noFlip: true };
  const mine = guidedTrials(s).filter((t) => t.kind === 'rod');
  if (mine.length === 0) return { id: 'rod', target: '[data-pr-end="0"]', gesture: 'drag', prefer: 'below', noFlip: true };
  return { id: 'again', target: '[data-pr-end="1"]', gesture: 'drag', prefer: 'below', noFlip: true };
}

/** Ses essais : une règle qui a tout touché et une qui a manqué (pour réfuter « la règle touche toujours tout » avec SES nombres). */
export function witnesses(s) {
  const rods = s.trials.filter((t) => t.kind === 'rod' && !t.free);
  return {
    full: rods.findLast((t) => t.full) ?? null,
    miss: rods.findLast((t) => !t.full) ?? null,
    aligned: rods.findLast((t) => t.pinsHit && !t.throughO) ?? null,
  };
}
