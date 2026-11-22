/**
 * gear-crank — LA LOGIQUE PURE de « دوّاسة الدرّاجة » (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », درس « مقلوب عدد وقسمة كسرين », 2026-10-25).
 * Exacte : tout vient de `packages/core/arithmetic/fractions3.js` (`gearTurns`, `teethFor`, `valueOf`) et de `powers.js`, importés PAR CHEMIN, jamais par le
 * barrel du cœur. Aucun flottant.
 *
 * LE MODÈLE. Un plateau de F dents (avant) entraîne par la chaîne un pignon de R dents (arrière). La MAIN avance la chaîne de `teeth` dents (un entier) :
 * la pédale a tourné de teeth/F tour, la roue de teeth/R tour. Le DRAPEAU est à `target` tours de roue, soit target × R dents (un entier, sinon la tâche est
 * refusée) ; il faut donc teeth/F = target × R / F tours de pédale — c'est la division `target ÷ (F/R)` faite par le geste, et son diviseur F/R est un RAPPORT de
 * deux nombres de dents. Le miroir (مقلوب) est le rapport inversé : le pignon et le plateau échangés.
 *
 * Une TÂCHE : `{ id, F, R, target: 'p/q' | 'n', predict?: true }`. Avec `predict`, la manivelle est BLOQUÉE tant que l'élève n'a pas écrit les tours de pédale
 * (une fraction) ; les compteurs restent voilés jusqu'au lâcher ; une prédiction fausse est réfutée par SA propre course (« توقّعتَ 27/8 … »).
 * Chaque LÂCHER de la manivelle (ou la fin d'une série de pressions ±1 dent) est un ESSAI : `release`. Il pose le tampon quand la roue est sur le drapeau.
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués tels quels vers `onTrial`) — chaînes = fractions irréductibles exactes (« 3/2 », « 8 »), `gap` signé en tours de roue :
 *   { tk: 'release', id, F, R, target, teeth, pedal, wheel, atFlag, gap, free, ok }
 *   { tk: 'predict', id, F, R, target, value, expected, ok, free: false }
 *   { tk: 'custom', free: true, id: 'free', F, R, target, teeth, pedal, wheel, atFlag, gap, ok: false }   // un lâcher dans « جرّب أعدادك » (jamais compté)
 *   { tk: 'solved', id }
 */
import { rat, mul, eq, sub, ratText, parseRat } from '@smarter-academy/core/arithmetic/powers.js';
import { gearTurns, teethFor, valueOf, toRaw } from '@smarter-academy/core/arithmetic/fractions3.js';

const FREE_TEETH = Object.freeze({ min: 12, max: 52 });
const FREE_TARGET = Object.freeze({ maxNum: 40, maxDen: 12 });
export const PRED_DIGITS = 3;

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'm1', F: 48, R: 24, target: '3' },
    { id: 'm2', F: 24, R: 32, target: '6' },
    { id: 'm3', F: 24, R: 32, target: '1' },
  ] },
  advanced: { tasks: [
    { id: 'a1', F: 36, R: 48, target: '9/2', predict: true },
    { id: 'a2', F: 40, R: 24, target: '5/2', predict: true },
    { id: 'a3', F: 30, R: 42, target: '10/3', predict: true },
    { id: 'a4a', F: 42, R: 30, target: '1', predict: true },
    { id: 'a4b', F: 30, R: 42, target: '1', predict: true },
  ] },
  reverse: { world: 'reverse', tasks: [
    { id: 'r1', F: 40, R: 24, target: '1' },
    { id: 'r2', F: 24, R: 40, target: '1' },
  ] },
});

const toInt = (r) => Number(r.n);

/** Chiffres arabes ou latins → latins ; le séparateur de fraction « ÷ » ou « / ». */
export function latin(text) {
  return String(text ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[÷⁄∕]/g, '/');
}

/** « 9/2 », « 3 », « 4,5 » → rationnel strictement positif, ou null. */
function parseTarget(text) {
  try {
    const s = latin(text).replace(/\s+/g, '').replace('٫', ',');
    if (!/^\d+(?:[.,]\d{1,2})?(?:\/\d+)?$/.test(s)) return null;
    const r = parseRat(s);
    return r.n > 0n ? r : null;
  } catch { return null; }
}

/** La tâche complétée. Le drapeau doit tomber sur une dent : target × R entier (sinon exception). */
function buildTask(raw, i = 0) {
  const F = Math.trunc(Number(raw.F));
  const R = Math.trunc(Number(raw.R));
  if (!(F > 0) || !(R > 0)) throw new Error('un plateau sans dents n\'entraîne rien');
  const target = parseTarget(raw.target);
  if (!target) throw new Error(`drapeau illisible : ${raw.target}`);
  const goal = teethFor(R, target);
  if (goal.d !== 1n) throw new Error(`le drapeau tombe entre deux dents : ${ratText(target)} × ${R}`);
  const goalTeeth = toInt(goal);
  return Object.freeze({
    id: raw.id ?? `t${i}`, F, R, target, targetText: ratText(target), predict: !!raw.predict,
    goalTeeth, goalPedal: rat(goalTeeth, F), maxTeeth: goalTeeth + R,
  });
}

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const world = numbers.world === 'reverse' ? 'reverse' : 'ride';
  return {
    world, tasks: raws.map(buildTask), ti: 0, teeth: 0, relTeeth: 0, pred: null, predNum: '', predDen: '',
    settled: null, last: null, done: {}, trials: [], free: null,
  };
}

/* ── Lecture ────────────────────────────────────────────────────────────────────────────────── */

export const isFree = (s) => !!s.free;
/** La tâche courante, ou la configuration libre (même forme). */
export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const taskDone = (s, i = s.ti) => !s.free && !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
/** La découverte de مبتدئ s'ouvre quand m2 ET m3 sont faites (les tâches sont dans l'ordre : toutes faites). Ni en avancé (prédiction) ni en `reverse`. */
export const discoveryReady = (s) => !s.free && s.world === 'ride' && !s.tasks.some((t) => t.predict) && allDone(s);
/** La manivelle est bloquée tant qu'une prédiction demandée n'est pas écrite. */
export const locked = (s) => !s.free && !!taskOf(s).predict && !s.pred;
/** Figée au drapeau (le tampon) : jamais en libre. */
const frozen = (s) => taskDone(s);
export const canTurn = (s) => !locked(s) && !frozen(s);
/** Les compteurs sont-ils lisibles ? Toujours, sauf quand une prédiction est demandée : voilés jusqu'au lâcher. */
export const veiled = (s) => !s.free && !!taskOf(s).predict && !s.settled && !taskDone(s);

/** Tours de pédale et de roue (rationnels réduits) pour `teeth` dents. */
export const turnsAt = (task, teeth = 0) => gearTurns(task.F, task.R, teeth);
export const turnsNow = (s) => turnsAt(taskOf(s), s.teeth);

/** Le jugement du drapeau : sur le drapeau, ou l'écart signé en tours de roue (> 0 : dépassé). */
export function judge(s) {
  const t = taskOf(s);
  const gap = sub(turnsAt(t, s.teeth).wheel, t.target);
  return { atFlag: s.teeth === t.goalTeeth, gap, over: s.teeth > t.goalTeeth, short: s.teeth < t.goalTeeth };
}

/* ── Gestes ─────────────────────────────────────────────────────────────────────────────────── */

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
/** L'aperçu : la chaîne avance de `n` dents (borné). Ne juge rien. */
export function turnTo(s, n) {
  if (!canTurn(s)) return s;
  const v = clamp(Math.round(n), 0, taskOf(s).maxTeeth);
  return v === s.teeth ? s : { ...s, teeth: v, settled: null, last: null };
}
export const stepTeeth = (s, d) => turnTo(s, s.teeth + d);
export const toStart = (s) => turnTo(s, 0);

const fmt = (r) => ratText(r);
function evidence(s, tk) {
  const t = taskOf(s);
  const j = judge(s);
  const { pedal, wheel } = turnsNow(s);
  const base = { id: s.free ? 'free' : t.id, F: t.F, R: t.R, target: t.targetText, teeth: s.teeth, pedal: fmt(pedal), wheel: fmt(wheel), atFlag: j.atFlag, gap: fmt(j.gap), free: !!s.free };
  if (tk === 'custom') return Object.freeze({ tk: 'custom', ...base, id: 'free', free: true, ok: false });
  return Object.freeze({ tk: 'release', ...base, ok: !s.free && j.atFlag });
}

/** Le LÂCHER : l'essai jugé. Sans effet si rien n'a bougé depuis le dernier lâcher. */
export function release(s) {
  if (!canTurn(s) || s.teeth === s.relTeeth) return s;
  const ev = evidence(s, s.free ? 'custom' : 'release');
  const add = [ev];
  const next = { ...s, relTeeth: s.teeth, settled: ev, last: ev };
  if (!s.free && ev.atFlag) {
    add.push(Object.freeze({ tk: 'solved', id: taskOf(s).id }));
    next.done = { ...s.done, [s.ti]: true };
  }
  next.trials = [...s.trials, ...add];
  return next;
}

/* ── La prédiction (متقدم) ──────────────────────────────────────────────────────────────────── */

const digits = (raw) => latin(raw).replace(/[^0-9]/g, '').slice(0, PRED_DIGITS);
export const setPredNum = (s, raw) => (locked(s) ? { ...s, predNum: digits(raw) } : s);
export const setPredDen = (s, raw) => (locked(s) ? { ...s, predDen: digits(raw) } : s);
function predictionValue(s) {
  if (!s.predNum || !s.predDen) return null;
  const n = Number(s.predNum); const d = Number(s.predDen);
  return n > 0 && d > 0 ? rat(n, d) : null;
}
export const canPredict = (s) => locked(s) && !!predictionValue(s);

/** « انطلق » : la prédiction écrite est enregistrée (juste ou fausse) ; la manivelle se débloque. Une prédiction fausse est réfutée PAR LA COURSE, pas avant. */
export function submitPrediction(s) {
  if (!canPredict(s)) return s;
  const t = taskOf(s);
  const value = predictionValue(s);
  const ok = eq(value, t.goalPedal);
  const ev = Object.freeze({ tk: 'predict', id: t.id, F: t.F, R: t.R, target: t.targetText, value: fmt(value), expected: fmt(t.goalPedal), ok, free: false });
  return { ...s, pred: { value: fmt(value), ok }, trials: [...s.trials, ev], last: ev };
}

/* ── Les tâches ─────────────────────────────────────────────────────────────────────────────── */

const fresh = { teeth: 0, relTeeth: 0, pred: null, predNum: '', predDen: '', settled: null, last: null };
export function nextTask(s) {
  if (!canNext(s)) return s;
  return { ...s, ti: s.ti + 1, ...fresh };
}
/** « إعادة » : la même tâche, la chaîne au départ ; les essais restent. */
export const restartTask = (s) => (s.free ? { ...s, ...fresh } : { ...s, ...fresh, done: { ...s.done, [s.ti]: false } });

/** La tâche d'avant, si le plateau et le pignon ont été échangés (« نقلت لينا السلسلة »). */
export function swappedFrom(s) {
  if (s.free || s.ti === 0) return null;
  const p = s.tasks[s.ti - 1]; const t = s.tasks[s.ti];
  return p.F === t.R && p.R === t.F && eq(p.target, t.target) ? p : null;
}

/* ── « جرّب أعدادك » : toujours ouvert ─────────────────────────────────────────────────────── */

/**
 * Valide les trois champs du panneau libre. `{ ok: true, cfg }` ou `{ ok: false, why }` :
 *  noTeeth (0 dent), range (hors 12 … 52), target (illisible ou hors p ≤ 40, q ≤ 12), between (target × R n'est pas entier : `product` « 7/5 × 32 »).
 */
export function validateFree(Ftext, Rtext, targetText) {
  const num = (x) => { const v = latin(x).trim(); return /^\d+$/.test(v) ? Number(v) : null; };
  const F = num(Ftext); const R = num(Rtext);
  if (F === 0 || R === 0) return { ok: false, why: 'noTeeth', which: F === 0 ? 'front' : 'rear' };
  if (F == null || R == null || F < FREE_TEETH.min || F > FREE_TEETH.max || R < FREE_TEETH.min || R > FREE_TEETH.max) return { ok: false, why: 'range' };
  const target = parseTarget(targetText);
  if (!target || target.n > BigInt(FREE_TARGET.maxNum) || target.d > BigInt(FREE_TARGET.maxDen)) return { ok: false, why: 'target' };
  const goal = teethFor(R, target);
  if (goal.d !== 1n) return { ok: false, why: 'between', product: `${ratText(target)} × ${R}` };
  return { ok: true, cfg: { F, R, target: ratText(target) } };
}

export function setFree(s, cfg) {
  const t = buildTask({ id: 'free', ...cfg });
  return { ...s, free: t, ...fresh };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, ...fresh } : s);

/* ── Onboarding ─────────────────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais la réponse : `predict` (écrire avant de partir), `crank` (tourner la manivelle), `flag` (s'arrêter quand la roue touche le
 * drapeau), `teeth` (le pas fin, une fois tout près), puis `free` quand TOUT est fait (invite à « جرّب أعدادك », qui ne bloque rien). `null` en libre ET dans
 * la découverte de مبتدئ (une carte de réponse que rien ne cache : hors du guide).
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? null : { id: 'free', target: '[data-gc-free]', gesture: 'type' };   // « المهمة التالية » est un gros bouton vert : pas de guide dessus
  if (locked(s)) return { id: 'predict', target: '[data-gc-predict]', gesture: 'type' };
  if (s.settled && !s.settled.atFlag && Math.abs(s.teeth - t.goalTeeth) <= t.R) return { id: 'teeth', target: s.teeth < t.goalTeeth ? '[data-gc-teeth-more]' : '[data-gc-teeth-less]', gesture: 'tap', prefer: 'below' };
  if (s.teeth === 0 && !s.settled) return { id: 'crank', target: '[data-gc-crank]', gesture: 'drag' };
  if (s.teeth * 10 >= t.goalTeeth * 6 && !s.settled) return { id: 'flag', target: '[data-gc-flag]', gesture: 'look' };
  return { id: 'crank', target: '[data-gc-crank]', gesture: 'drag' };
}

/* ── Découverte (m2 et m3) ──────────────────────────────────────────────────────────────────── */

/** Ses essais réussis : la tâche m2 (plus de tours de pédale que de roue) et la plus petite cible. */
export function witnesses(s) {
  const ok = s.tasks.filter((_, i) => s.done[i]);
  const num = (r) => Number(r.n) / Number(r.d);
  const bigger = ok.find((t) => num(t.goalPedal) > num(t.target)) ?? ok[0] ?? null;
  const first = ok[0] ?? null;
  return { bigger, first };
}

/** Pour m2 : le rapport F/R réduit (3/4), son miroir (4/3), la cible (6), la réponse (8) et la fausse ×(3/4) (9/2) — des textes de rationnels exacts. */
export function formalOf(task) {
  const ratio = valueOf(toRaw({ n: task.F, d: task.R }));
  const mirror = rat(ratio.d, ratio.n);
  const wrong = mul(task.target, ratio);
  return { ratio: fmt(ratio), mirror: fmt(mirror), target: task.targetText, answer: fmt(task.goalPedal), wrong: fmt(wrong) };
}
