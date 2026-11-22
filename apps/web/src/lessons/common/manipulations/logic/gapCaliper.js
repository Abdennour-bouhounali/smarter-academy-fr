/**
 * gap-caliper — LA LOGIQUE PURE de « مسماك الفرق » (2AM, unité 3 « الأعداد النسبية », درس « المسافة بين نقطتين على مستقيم مدرّج », 2026-10-29).
 * Exacte : les abscisses sont des BigInt en CENTIÈMES ; les maths viennent de `packages/core/arithmetic/relative.js` (E5 : `gap`, `pointsAt`, importé PAR CHEMIN).
 *
 * LE MODÈLE. Un grand thermomètre est gradué de −10 à +12. Un compas en laiton est SERRÉ sur une graine (l'ancre, d'abscisse `a`) ; la main tourne la vis pour OUVRIR le compas :
 * l'ouverture `d` ≥ 0 est la distance, la mâchoire libre se pose à `a + d` (vers le haut) ou `a − d` (vers le bas). Une ouverture ne peut jamais être négative.
 * Tâches :
 *   gap   (مبتدئ) la mâchoire doit TOUCHER la seconde graine (ouvrir, « ثبّت »), puis l'élève écrit la distance ;
 *   gap + predict (متقدم) l'ouverture est ÉCRITE d'abord (un négatif est refusé : mâchoires croisées), puis la vis se déverrouille pour la vérifier ;
 *   swing (متقدم) l'ouverture est FIXE : la main balance la mâchoire vers le haut puis vers le bas et écrit les DEUX abscisses.
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'fix', task, d, landed, ok, model }   { kind:'predict', task, value, ok, model }   { kind:'say', task, value, ok, model }
 *   { kind:'swing', task, dir }   { kind:'found', task, dir, value, ok, model }   { kind:'custom', free:true }
 */
import * as R from '@smarter-academy/core/arithmetic/relative.js';

const MIN = -1000n;
export const MAX = 1200n;
const abs = (x) => (x < 0n ? -x : x);
const T = (v) => R.text(v);

/** Les tâches normalisées en centièmes. Lève si mal formées. */
function normalizeTasks(list) {
  return list.map((t, i) => {
    const id = t.id ?? `t${i}`;
    const anchor = R.parse(t.anchor);
    if (anchor < MIN || anchor > MAX) throw new Error(`gapCaliper: ${id} — ancre hors du thermomètre`);
    if (t.kind === 'swing') {
      const d = R.parse(t.d);
      if (d <= 0n) throw new Error(`gapCaliper: ${id} — ouverture nulle`);
      const pts = R.pointsAt(anchor, d);
      if (pts.some((p) => p < MIN || p > MAX)) throw new Error(`gapCaliper: ${id} — un des deux points sort du thermomètre`);
      return Object.freeze({ id, kind: 'swing', anchor, d, points: pts });
    }
    const target = R.parse(t.target);
    if (target < MIN || target > MAX) throw new Error(`gapCaliper: ${id} — graine hors du thermomètre`);
    if (target === anchor) throw new Error(`gapCaliper: ${id} — deux graines confondues`);
    return Object.freeze({ id, kind: 'gap', anchor, target, gap: R.gap(anchor, target), dir: target > anchor ? 'up' : 'down', predict: !!t.predict });
  });
}

const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'g1', anchor: '-4', target: '9' }, { id: 'g2', anchor: '-7', target: '-2' }, { id: 'g3', anchor: '3', target: '11' }, { id: 'g4', anchor: '-6', target: '0' },
  ] },
  advanced: { tasks: [
    { id: 'a1', anchor: '-2.5', target: '6', predict: true }, { id: 'a2', kind: 'swing', anchor: '1.5', d: '4' }, { id: 'a3', anchor: '3', target: '-6.5', predict: true },
  ] },
});

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) throw new Error('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null });
}
function fresh(s) {
  const t = s.tasks[s.ti];
  const phase = t.kind === 'swing' ? 'swing' : t.predict ? 'predict' : 'open';
  return { ...s, phase, d: t.kind === 'swing' ? t.d : 0n, dir: t.kind === 'swing' ? 'up' : t.dir, found: { up: false, down: false }, moved: false, last: null, ghost: null };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isAdvanced = (s) => s.tasks.some((t) => t.predict || t.kind === 'swing');
const stepOf = (s) => (isAdvanced(s) ? 50n : 100n);
/** L'ancre et la graine visée du moment (mode libre : les deux lectures de l'élève). */
export const anchorOf = (s) => (s.free ? s.free.a : taskOf(s).anchor);
export const targetOf = (s) => (s.free ? s.free.b : taskOf(s).kind === 'swing' ? null : taskOf(s).target);
export const dirOf = (s) => (s.free ? (s.free.b >= s.free.a ? 'up' : 'down') : s.dir);
/** L'ouverture maximale : la mâchoire reste sur le thermomètre. */
export const maxD = (s) => (dirOf(s) === 'up' ? MAX - anchorOf(s) : anchorOf(s) - MIN);
export const dOf = (s) => (s.free ? R.gap(s.free.a, s.free.b) : s.d);
export const jawAt = (s) => (dirOf(s) === 'up' ? anchorOf(s) + dOf(s) : anchorOf(s) - dOf(s));
/** La vis tourne seulement quand la phase est « open » ; la tâche swing l'ouverture est fixe. */
export const screwOpen = (s) => !s.free && s.phase === 'open' && !taskDone(s);

/* ── La vis ── */
export function setOpen(s, d) {
  if (!screwOpen(s)) return s;
  const step = stepOf(s);
  let v = (d / step) * step;
  if (d - v >= step / 2n) v += step;
  v = v < 0n ? 0n : v > maxD(s) ? maxD(s) : v;
  if (v === s.d) return s;
  return { ...s, d: v, moved: true, ghost: null, last: s.last?.kind === 'fix' ? null : s.last };
}
export const openBy = (s, n) => setOpen(s, s.d + BigInt(n) * stepOf(s));
/** Un glissement : la mâchoire libre suit le doigt à l'abscisse `x` (centièmes). */
export const dragTo = (s, x) => setOpen(s, dirOf(s) === 'up' ? x - anchorOf(s) : anchorOf(s) - x);

/* ── Les erreurs nommées ── */
/** L'erreur d'une valeur écrite pour la distance de la tâche : right | neg | subDist | addSame | other. */
function modelOf(t, v) {
  const a = t.anchor; const b = t.target;
  if (v === t.gap) return 'right';
  if (v < 0n && -v === t.gap) return 'neg';
  const da = abs(a); const db = abs(b);
  if (v === abs(da - db) && (a < 0n) !== (b < 0n) && a !== 0n && b !== 0n) return 'subDist';
  if (v === da + db && (a < 0n) === (b < 0n) && a !== 0n && b !== 0n) return 'addSame';
  return 'other';
}
const read = (raw) => { try { return R.parse(String(raw ?? '').replace(/[⁦⁩]/g, '')); } catch { return null; } };

/** Le jugement d'une distance écrite : { ok, model, value } — `model` ∈ right | neg | subDist | addSame | other | format. */
function judgeGap(task, raw) {
  const v = read(raw);
  if (v === null) return { ok: false, model: 'format', value: null };
  const model = modelOf(task, v);
  return { ok: model === 'right', model, value: v };
}

/* ── Fixer la mâchoire ── */
export function fix(s) {
  if (!screwOpen(s)) return s;
  const t = taskOf(s);
  const landed = jawAt(s);
  const ok = landed === t.target;
  let model = 'right';
  if (!ok) {
    model = s.d < t.gap ? 'short' : 'over';
    const m = modelOf(t, s.d);
    if (m === 'subDist' || m === 'addSame') model = m;
  }
  const trial = Object.freeze({ kind: 'fix', task: s.ti, d: T(s.d), landed: T(landed), ok, model });
  const base = { ...s, trials: [...s.trials, trial], last: trial };
  if (!ok) return { ...base, ghost: { kind: 'miss', landed, model } };
  if (t.predict) return { ...base, phase: 'done', done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } };
  return { ...base, phase: 'say', ghost: null };
}

/* ── Écrire une distance : après l'ouverture (مبتدئ) ou avant la vis (متقدم) ── */
export function answerGap(s, raw) {
  const t = taskOf(s);
  if (t.kind !== 'gap' || taskDone(s) || s.free) return s;
  const kind = s.phase === 'predict' ? 'predict' : s.phase === 'say' ? 'say' : null;
  if (!kind) return s;
  const j = judgeGap(t, raw);
  const trial = Object.freeze({ kind, task: s.ti, value: j.value === null ? String(raw) : T(j.value), ok: j.ok, model: j.model, want: T(t.gap) });
  const base = { ...s, trials: [...s.trials, trial], last: trial };
  if (j.ok) {
    if (kind === 'predict') return { ...base, phase: 'open', ghost: null };
    return { ...base, phase: 'done', done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial }, ghost: null };
  }
  if (j.value === null) return { ...base, ghost: null };
  if (j.model === 'neg') return { ...base, ghost: { kind: 'crossed' } };
  const landed = t.dir === 'up' ? t.anchor + abs(j.value) : t.anchor - abs(j.value);
  return { ...base, ghost: { kind: 'jaw', landed, model: j.model } };
}

/* ── Le balancement (tâche swing) ── */
export function setDir(s, dir) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'swing' || taskDone(s) || (dir !== 'up' && dir !== 'down') || dir === s.dir) return s;
  const trial = Object.freeze({ kind: 'swing', task: s.ti, dir });
  return { ...s, dir, moved: true, trials: [...s.trials, trial], last: trial, ghost: null };
}

function judgeFound(task, dir, raw) {
  const v = read(raw);
  const want = dir === 'up' ? task.anchor + task.d : task.anchor - task.d;
  const other = dir === 'up' ? task.anchor - task.d : task.anchor + task.d;
  if (v === null) return { ok: false, model: 'format', value: null, want };
  if (v === want) return { ok: true, model: 'right', value: v, want };
  let model = 'other';
  if (v === other) model = 'otherSide';
  else if (v === -want) model = 'signSwap';
  else if (v === task.d || v === -task.d) model = 'onlyD';
  return { ok: false, model, value: v, want };
}
export function answerFound(s, raw) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'swing' || taskDone(s) || s.found[s.dir]) return s;
  const j = judgeFound(t, s.dir, raw);
  const trial = Object.freeze({ kind: 'found', task: s.ti, dir: s.dir, value: j.value === null ? String(raw) : T(j.value), ok: j.ok, model: j.model, want: T(j.want) });
  const base = { ...s, trials: [...s.trials, trial], last: trial };
  if (!j.ok) return { ...base, ghost: j.value === null ? null : { kind: 'jaw', landed: j.value, model: j.model } };
  const found = { ...s.found, [s.dir]: true };
  const all = found.up && found.down;
  return { ...base, found, ghost: null, ...(all ? { phase: 'done', done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } } : {}) };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : deux lectures a ; b, |x| ≤ 10 ── */
export function parseFree(raw) {
  const p = R.parsePoint(raw);
  if (!p) return null;
  const lim = 1000n;
  if (abs(p.x) > lim || abs(p.y) > lim) return null;
  return { a: p.x, b: p.y };
}
export function setFree(s, raw) {
  const p = parseFree(raw);
  if (!p) return s;
  return { ...s, free: p, ghost: null, last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);
/** La distance de la paire libre, et les deux parties quand elle traverse le zéro. */
export function freeInfo(s) {
  if (!s.free) return null;
  const { a, b } = s.free;
  const lo = a < b ? a : b; const hi = a < b ? b : a;
  return { gap: R.gap(a, b), crosses: lo < 0n && hi > 0n, below: lo < 0n ? abs(lo) : 0n, above: hi > 0n ? hi : 0n };
}

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-gc-next]', gesture: 'tap', prefer: 'below' } : null;
  if (s.phase === 'predict') return { id: 'predict', target: '[data-gc-answer]', gesture: 'tap', prefer: 'below' };
  if (s.phase === 'say') return { id: 'type', target: '[data-gc-answer]', gesture: 'tap', prefer: 'below' };
  if (s.phase === 'swing') return s.found.up || s.found.down ? { id: 'swing', target: '[data-gc-swing]', gesture: 'tap', prefer: 'above' } : { id: 'type', target: '[data-gc-answer]', gesture: 'tap', prefer: 'below' };
  return s.moved ? { id: 'fix', target: '[data-gc-fix]', gesture: 'tap', prefer: 'above' } : { id: 'screw', target: '[data-gc-screw]', gesture: 'drag', prefer: 'right' };
}
