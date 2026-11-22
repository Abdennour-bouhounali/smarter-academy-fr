/**
 * equality-lanes — LA LOGIQUE PURE du « مضمار المساواة » (3AM, unité 5, درس « المساويات والعمليات », 2026-10-21). Exacte : toute la
 * mathématique vient de `packages/core/arithmetic/equalities.js` (sur `linear.js`, importé PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Une égalité L = R où x est un nombre CACHÉ : deux coureurs se tiennent sur un mur de graduations, chacun à la VALEUR de son
 * membre (Salma = membre gauche, Amine = membre droit). L'égalité est vraie ⇔ ils se tiennent sur la même graduation. La MAIN tient le
 * nombre c d'une opération (+, −, ×, ÷ ; c de −9 à 9) et choisit QUI la reçoit : les deux (l'égalité reste vraie), ou un seul (ils se séparent
 * du poids de c). « نفّذ » applique ; chaque pression est un ESSAI. Diviser par 0 est refusé ; multiplier par 0 envoie les deux à 0 (l'égalité reste
 * vraie, mais « 0 = 0 » ne dit plus rien). Une TÂCHE = une égalité cible (celle qu'on obtient par 1 ou 2 opérations sur les deux membres) ;
 * elle est réussie quand les deux membres sont EXACTEMENT ceux de la cible.
 * « جرّب أعدادك » (`free`) : l'élève écrit un nombre n — les deux coureurs partent de n (n = n) ; aucune tâche n'est cochée.
 */
import * as Q from '@smarter-academy/core/arithmetic/equalities.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

export const OPS = Q.OPS;
export const WHO = Q.WHO;
export const C_RANGE = Q.C_RANGE;

/** Les égalités de départ et les tâches par défaut de chaque niveau (la leçon peut passer les siennes). */
const PRESETS = Object.freeze({
  beginner: { left: '10', right: '4x-2', x: '3', tasks: [[['add', -2]], [['add', 2]], [['mul', 3]], [['div', 2]]] },
  advanced: { left: '5', right: '-3x+1', x: '-4/3', tasks: [[['mul', -2]], [['mul', 2], ['add', -3]], [['add', -1], ['div', -3]]] },
});

/** L'état de départ. `numbers` = { left, right, x, tasks: [ops, …] } (ops = [[op, c], …]). */
export function init(numbers = {}) {
  const p = PRESETS.beginner;
  const start = Q.eqn(numbers.left ?? p.left, numbers.right ?? p.right, numbers.x ?? p.x);
  if (!Q.holds(start)) throw new Error('égalité de départ fausse');
  const tasks = (numbers.tasks ?? p.tasks).map((ops, i) => {
    const target = Q.chain(start, ops);
    if (!Q.holds(target)) throw new Error('cible fausse');
    return Object.freeze({ id: `t${i}`, ops, target });
  });
  return { start, tasks, ti: 0, cur: start, hist: [], op: 'add', c: 0, who: 'both', done: {}, trials: [], last: null, free: null, oneSide: false };
}

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]) && s.oneSide;
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const values = (s) => Q.values(s.cur);
export const equal = (s) => Q.holds(s.cur);
const reached = (s) => !s.free && Q.sameEq(s.cur, taskOf(s).target);

/** Les deux valeurs et les graduations du mur : contient 0, le départ, la cible et l'état courant (le dessin seul). */
export function trackOf(s) {
  const v = Q.values(s.cur);
  const st = Q.values(s.start);
  const vals = [v.left, v.right, st.left, st.right];
  if (!s.free) { const t = Q.values(taskOf(s).target); vals.push(t.left, t.right); }
  return Q.trackFor(vals);
}

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

const clampC = (c) => Math.max(C_RANGE[0], Math.min(C_RANGE[1], Math.round(c)));
export const setC = (s, c) => { const v = clampC(c); return v === s.c ? s : { ...s, c: v }; };
export const setOp = (s, op) => (OPS.includes(op) ? { ...s, op } : s);
export const setWho = (s, who) => (WHO.includes(who) ? { ...s, who } : s);
/** Les nombres permis par l'opération : ÷ ne reçoit pas 0 (le curseur peut y passer, « نفّذ » refuse). */
export const canApply = (s) => !(s.op === 'div' && s.c === 0);

/** « نفّذ » : l'opération de la main, reçue par ceux que l'élève a choisis — un ESSAI jugé. */
export function apply(s) {
  const before = Q.values(s.cur);
  const r = Q.applyOp(s.cur, s.op, s.c, s.who);
  if (r.refused) {
    const trial = Object.freeze({ kind: 'refused', reason: r.refused, task: s.ti, op: s.op, c: s.c, who: s.who, free: !!s.free });
    return { ...s, last: trial };
  }
  const next = { ...s, cur: r.eq, hist: [...s.hist, s.cur] };
  const after = Q.values(r.eq);
  const ok = Q.holds(r.eq);
  const hit = !s.free && Q.sameEq(r.eq, taskOf(s).target);
  const trial = Object.freeze({
    kind: 'apply', task: s.ti, op: s.op, c: s.c, who: s.who, ok, broke: r.broke, lost: r.lost, reached: hit, free: !!s.free,
    before: { left: Q.numText(before.left), right: Q.numText(before.right) }, after: { left: Q.numText(after.left), right: Q.numText(after.right) },
    eq: Q.eqTex(r.eq),
  });
  const done = hit ? { ...s.done, [s.ti]: true } : s.done;
  return { ...next, done, trials: [...s.trials, trial], last: trial, oneSide: s.oneSide || (!s.free && s.who !== 'both') };
}

/** « تراجع » : revient à l'égalité d'avant (l'essai reste dans le carnet). */
export function undo(s) {
  if (!s.hist.length) return s;
  return { ...s, cur: s.hist[s.hist.length - 1], hist: s.hist.slice(0, -1), last: null };
}

/** La tâche suivante repart de l'égalité de départ. */
export function nextTask(s) {
  if (!canNext(s)) return s;
  return { ...s, ti: s.ti + 1, cur: s.start, hist: [], last: null, c: 0, op: 'add', who: 'both' };
}
/** « إعادة » : même tâche, on repart de l'égalité de départ ; les essais restent. */
export const restartTask = (s) => ({ ...s, cur: s.free ? s.cur : s.start, hist: [], last: null });

/** « جرّب أعدادك » : un nombre n ; les deux coureurs partent de n. */
export function setFree(s, raw) {
  const n = Q.parseFreeNumber(raw);
  if (!n) return s;
  const eq = Q.eqn(Lin.fracText(n), Lin.fracText(n), '0');
  return { ...s, free: { n: Lin.fracText(n) }, cur: eq, hist: [], last: null, c: 0, who: 'both' };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, cur: s.start, hist: [], last: null } : s);

/* ── Lecture ─────────────────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => t.kind === 'apply' && !t.free && t.task === i);

/**
 * Le prochain geste utile — jamais la réponse : `grab` (le premier geste : la poignée de c), `apply` (« نفّذ »), `op` (ce qu'on a fait ne
 * suffit pas : on regarde les opérations), `undo` (l'égalité est cassée : « تراجع »), `who` (une fois la première tâche réussie : essayer un seul
 * côté, une fois), `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) {
    if (canNext(s)) return { id: 'next', target: '[data-el-next]', gesture: 'tap' };
    if (!s.oneSide) return { id: 'who', target: '[data-el-whos]', gesture: 'tap' };
    return null;
  }
  if (!s.oneSide && s.ti >= 1 && !s.free && s.ti === s.tasks.length - 1 && guidedTrials(s).length === 0) return { id: 'who', target: '[data-el-whos]', gesture: 'tap' };
  const last = s.last;
  if (last?.kind === 'apply' && !last.ok) return { id: 'undo', target: '[data-el-undo]', gesture: 'tap' };
  const mine = guidedTrials(s);
  if (mine.length === 0 && s.c === 0) return { id: 'grab', target: '[data-el-knob]', gesture: 'drag' };
  if (s.c !== 0 || s.op === 'div') {
    if (!(last?.kind === 'apply')) return { id: 'apply', target: '[data-el-apply]', gesture: 'tap' };
  }
  if (mine.length >= 1 && !reached(s) && mine.filter((t) => t.ok).length >= 1) return { id: 'op', target: '[data-el-ops]', gesture: 'tap' };
  return { id: 'grab', target: '[data-el-knob]', gesture: 'drag' };
}

/* ── Découverte : les réfutations avec SES essais ────────────────────────────────────────────── */

/** Ses essais : un essai qui a mû les DEUX coureurs (égalité gardée) et un essai qui n'a mû qu'un seul. */
export function witnesses(s) {
  const mine = s.trials.filter((t) => t.kind === 'apply' && !t.free && t.c !== 0 && !t.lost);
  const both = mine.findLast((t) => t.who === 'both') ?? null;
  const one = mine.findLast((t) => t.who !== 'both' && t.broke) ?? null;
  return { both, one };
}
