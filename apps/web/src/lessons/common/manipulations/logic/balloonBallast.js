/**
 * balloon-ballast — LA LOGIQUE PURE de « أكياس المنطاد » (2AM, unité 3 « الأعداد النسبية », درس « جمع وطرح عددين نسبيين », 2026-10-29).
 * Exacte : les maths viennent de `packages/core/arithmetic/relative.js` (E2 : `add`, `sub`, `ruleCase`, `ballastOf`, importé PAR CHEMIN).
 *
 * LE MODÈLE. L'altitude d'un montgolfière est sa CHARGE : t nacelles de flamme (+1 m chacune) et s sacs de sable (−1 m chacun), altitude = t − s.
 * Une flamme et un sac ensemble ne changent rien : une paire neutre (elles se nouent et se verrouillent). La MAIN tient la charge par quatre gestes :
 * attacher une flamme / un sac, jeter une flamme / un sac (et à متقدم une paire neutre = une flamme + un sac).
 * La tâche est une CARTE a ± b : le second nombre dit le geste (« + (−4) » attacher 4 sacs ; « − (−3) » jeter 3 sacs ; « + (+5) » attacher 5 flammes ;
 * « − (+5) » jeter 5 flammes). Le juge regarde (1) le JOURNAL des gestes contre la carte et (2) l'altitude écrite contre a ± b.
 * مبتدئ : exécuter la carte puis ÉCRIRE l'altitude ; متقدم (`predict`) : ÉCRIRE l'altitude AVANT, puis exécuter (la charge à jeter peut manquer → paires neutres).
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'gesture', task, g, object, altitude, ok }   { kind:'answer', task, value, ok, model }   { kind:'predict', task, value, ok, model }
 *   { kind:'solved', task }   { kind:'custom', free:true }
 */
import * as R from '@smarter-academy/core/arithmetic/relative.js';

const MAX_LOAD = 24;
const H = (x) => R.parse(x);
const int = (h) => Number(h / 100n);

const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 't1', a: '6', op: '+', b: '-4' },
    { id: 't2', a: '-3', op: '+', b: '-5' },
    { id: 't3', a: '-9', op: '+', b: '5' },
    { id: 't4', a: '-6', op: '+', b: '6' },
  ] },
  advanced: { tasks: [
    { id: 'a1', a: '-7', op: '-', b: '-3', predict: true },
    { id: 'a2', a: '5', op: '-', b: '-7', predict: true },
    { id: 'a3', a: '-2', op: '-', b: '5', predict: true },
    { id: 'a4', a: '6', op: '-', b: '7', predict: true },
  ] },
});

/** Le geste que la carte demande : { g: 'tie'|'throw', object: 'token'|'bag', n }. */
function needOf(task) {
  const b = task.b;
  const n = Math.abs(int(b));
  const object = b < 0n ? 'bag' : 'token';
  return { g: task.op === '+' ? 'tie' : 'throw', object, n };
}

export function normalizeTasks(list) {
  return list.map((t, i) => {
    const a = H(t.a); const b = H(t.b);
    if (a % 100n !== 0n || b % 100n !== 0n) throw new Error('balloonBallast: entiers seulement');
    if (t.op !== '+' && t.op !== '-') throw new Error('balloonBallast: opération inconnue');
    const exp = t.op === '+' ? R.add(a, b) : R.sub(a, b);
    return Object.freeze({ id: t.id ?? `t${i}`, a, b, op: t.op, predict: !!t.predict, expected: exp, need: needOf({ b, op: t.op }), rule: R.ruleCase(a, t.op === '+' ? b : R.opposite(b)) });
  });
}

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) throw new Error('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null, refused: 0 });
}
function loadFor(a) {
  const { tokens, bags } = R.ballastOf(a);
  return { t: tokens, s: bags };
}
function fresh(s) {
  const tk = s.tasks[s.ti];
  const l = loadFor(tk.a);
  return { ...s, t: l.t, s: l.s, log: [], phase: tk.predict ? 'predict' : 'act', predicted: null, last: null, ghost: null, refused: 0, pairsSeen: 0 };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
/** L'altitude (entier) de la charge courante. */
export const altitude = (s) => s.t - s.s;
/** Les paires verrouillées : une flamme et un sac sur la même rangée de cordes. */
export const lockedPairs = (s) => Math.min(s.t, s.s);
export const gesturesOpen = (s) => (s.free ? true : s.phase === 'act' && !taskDone(s));

/** Le journal contre la carte : { ok, over, wrong, count }. */
export function gestureJudge(task, log) {
  const n = task.need;
  const count = log.filter((e) => e.g === n.g && e.object === n.object).length;
  const wrong = log.filter((e) => e.g !== 'pair' && !(e.g === n.g && e.object === n.object)).length;
  return { ok: count === n.n && wrong === 0, count, wrong, over: count > n.n };
}
export const gestureOk = (s) => !s.free && gestureJudge(taskOf(s), s.log).ok;

/* ── Gestes ── */
const OPP = { tie: 'throw', throw: 'tie' };
/** Un geste : tie / throw sur 'token' | 'bag', ou 'pair' (attache une flamme et un sac). Les gestes inverses s'annulent dans le journal. */
export function apply(s, g, object) {
  if (!gesturesOpen(s)) return s;
  let { t, s: sacks } = s;
  const key = object === 'token' ? 't' : 's';
  const load = { t, s: sacks };
  if (g === 'pair') {
    if (t + 1 > MAX_LOAD || sacks + 1 > MAX_LOAD) return { ...s, refused: s.refused + 1 };
    load.t += 1; load.s += 1;
  } else if (g === 'tie') {
    if (load[key] + 1 > MAX_LOAD) return { ...s, refused: s.refused + 1 };
    load[key] += 1;
  } else {
    if (load[key] <= 0) {
      const trial = Object.freeze({ kind: 'gesture', task: s.free ? -1 : s.ti, g, object, altitude: altitude(s), ok: false, refused: true, free: !!s.free });
      return { ...s, refused: s.refused + 1, trials: [...s.trials, trial], last: trial };
    }
    load[key] -= 1;
  }
  let log = s.log;
  const cancel = g !== 'pair' ? log.findLastIndex((e) => e.g === OPP[g] && e.object === object) : -1;
  log = cancel >= 0 ? log.filter((_, i) => i !== cancel) : [...log, { g, object }];
  const alt = load.t - load.s;
  const trial = Object.freeze({ kind: 'gesture', task: s.free ? -1 : s.ti, g, object, altitude: alt, ok: true, free: !!s.free });
  let next = { ...s, t: load.t, s: load.s, log, trials: [...s.trials, trial], last: trial, ghost: null, refused: 0 };
  if (!s.free && taskOf(s).predict && gestureJudge(taskOf(s), log).ok && alt === int(taskOf(s).expected)) {
    const tk = taskOf(s);
    const done = Object.freeze({ kind: 'solved', task: s.ti });
    next = { ...next, done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: done }, trials: [...next.trials, done] };
    void tk;
  }
  return next;
}
export const tie = (s, o) => apply(s, 'tie', o);
export const throwOut = (s, o) => apply(s, 'throw', o);
export const tiePair = (s) => apply(s, 'pair', 'pair');

/* ── Lectures typées ── */
function parseTyped(raw) {
  try {
    const h = R.parse(String(raw ?? '').replace(/[⁦⁩]/g, ''));
    return h % 100n === 0n ? h : null;
  } catch { return null; }
}
/**
 * Le jugement d'une altitude écrite : { ok, model, want, value } — `model` ∈ right | signLost | subDist | addDist | signFirst | subNoFlip | flipBoth | other | format.
 */
export function judgeValue(task, raw) {
  const want = task.expected;
  const got = parseTyped(raw);
  if (got == null) return { ok: false, model: 'format', want };
  if (got === want) return { ok: true, model: 'right', want, value: got };
  const a = task.a; const b = task.b;
  const da = a < 0n ? -a : a; const db = b < 0n ? -b : b;
  const sum = da + db;
  const diff = da > db ? da - db : db - da;
  let model = 'other';
  if (task.op === '-' && got === R.add(a, b)) model = 'subNoFlip';
  else if (task.op === '-' && got === -want) model = 'flipBoth';
  else if (task.op === '+' && task.rule === 'same' && got === -want) model = 'signLost';
  else if (task.op === '+' && task.rule === 'same' && got === (a < 0n ? -diff : diff)) model = 'subDist';
  else if (task.op === '+' && task.rule === 'different' && (got === sum || got === -sum)) model = 'addDist';
  else if (task.op === '+' && task.rule === 'different' && got === (b < 0n ? -diff : diff)) model = 'signFirst';
  else if (task.op === '-' && (got === sum || got === -sum)) model = 'addDist';
  return { ok: false, model, want, value: got };
}
/** Le fantôme (altitude écrite) qui MONTRE l'erreur. */
const ghostOf = (model, value) => (model === 'format' || value == null ? null : { kind: model, at: int(value) });

/** مبتدئ : exécuter puis écrire. Refuse si les gestes ne sont pas ceux de la carte. */
export function answer(s, raw) {
  if (s.free || taskDone(s) || taskOf(s).predict || s.phase !== 'act') return s;
  const tk = taskOf(s);
  const j = judgeValue(tk, raw);
  const gj = gestureJudge(tk, s.log);
  const gestureOkNow = gj.ok;
  const ok = j.ok && gestureOkNow;
  const model = j.ok && !gestureOkNow ? 'wrongGesture' : j.model;
  const trial = Object.freeze({ kind: 'answer', task: s.ti, value: j.value != null ? R.text(j.value) : String(raw), ok, model, gestureOk: gestureOkNow, count: gj.count, free: false });
  let { done, solved } = s;
  let trials = [...s.trials, trial];
  if (ok) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: trial }; trials = [...trials, Object.freeze({ kind: 'solved', task: s.ti })]; }
  return { ...s, done, solved, trials, last: trial, ghost: ok || model === 'wrongGesture' ? null : ghostOf(model, j.value) };
}
/** متقدم : écrire l'altitude AVANT d'exécuter. Une prédiction juste ouvre les gestes. */
export function predict(s, raw) {
  if (s.free || !taskOf(s).predict || s.phase !== 'predict') return s;
  const tk = taskOf(s);
  const j = judgeValue(tk, raw);
  const trial = Object.freeze({ kind: 'predict', task: s.ti, value: j.value != null ? R.text(j.value) : String(raw), ok: j.ok, model: j.model, free: false });
  return { ...s, phase: j.ok ? 'act' : 'predict', predicted: j.ok ? j.value : null, trials: [...s.trials, trial], last: trial, ghost: j.ok ? null : ghostOf(j.model, j.value) };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
/** « أعِد التجربة » : la MÊME tâche repart de zéro (les essais restent). */
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : une carte a ± b, |a|, |b| ≤ 12 entiers ── */
export function parseFree(a, op, b) {
  try {
    const x = parseTyped(a); const y = parseTyped(b);
    if (x == null || y == null || (op !== '+' && op !== '-')) return null;
    if ((x < 0n ? -x : x) > 1200n || (y < 0n ? -y : y) > 1200n) return null;
    return { a: x, op, b: y };
  } catch { return null; }
}
export function setFree(s, a, op, b) {
  const card = parseFree(a, op, b);
  if (!card) return s;
  const l = loadFor(card.a);
  return { ...s, free: card, t: l.t, s: l.s, log: [], phase: 'act', ghost: null, last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);
/** La charge demandée par la carte libre : le geste attendu. */
export const freeNeed = (s) => (s.free ? needOf(s.free) : null);

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-bb-next]', gesture: 'tap', prefer: 'below' } : null;
  const tk = taskOf(s);
  const mine = s.trials.filter((x) => x.task === s.ti);
  if (tk.predict && s.phase === 'predict') return { id: 'predict', target: '[data-bb-answer]', gesture: 'tap', prefer: 'below' };
  if (!s.log.length && !mine.some((x) => x.refused)) return { id: tk.need.g === 'tie' ? 'tie' : 'throw', target: tk.need.g === 'tie' ? `[data-bb-shelf="${tk.need.object}"]` : '[data-bb-basket]', gesture: tk.need.g === 'tie' ? 'drag' : 'tap', prefer: 'above' };
  if (tk.predict && s.refused >= 2 && !s.log.some((e) => e.g === 'pair')) return { id: 'neutral', target: '[data-bb-shelf="pair"]', gesture: 'tap', prefer: 'above' };
  if (!tk.predict && gestureJudge(tk, s.log).ok) return { id: 'type', target: '[data-bb-answer]', gesture: 'tap', prefer: 'below' };
  if (lockedPairs(s) > 0 && !s.trials.some((x) => x.kind === 'answer')) return null;
  return null;
}
