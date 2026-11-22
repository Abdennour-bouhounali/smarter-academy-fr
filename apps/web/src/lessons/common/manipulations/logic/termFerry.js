/**
 * term-ferry — LA LOGIQUE PURE de la « عبّارة الحدود » (3AM, unité 5, درس « المعادلات من الدرجة الأولى بمجهول واحد », 2026-10-21). Exacte :
 * toute la mathématique vient de `packages/core/arithmetic/equalities.js` (sur `linear.js`, importé PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Une équation ax + b = cx + d dont la solution x* est CACHÉE (le calcul la connaît, pas l'élève). Chaque membre est une rive du
 * fleuve ; ses termes sont des CAISSES (le terme en x, le terme constant). La MAIN porte une caisse d'une rive à l'autre et CHOISIT son signe
 * à l'arrivée : « كما هو » ou « بعكس إشارته ». Traverser en changeant de signe = ajouter l'opposé aux deux membres : l'équation garde la même
 * solution (la valeur des deux membres en x* reste égale) ; garder le signe la casse — le refus est le CALCUL du x caché, écrit avec ses valeurs.
 * Quand x reste seul d'un côté (a·x = n), la main choisit le diviseur c de la deuxième étape (÷ 0 refusé) ; a ÷ a donne « x = … ».
 * Puis « عوّض » écrit la vérification (les deux membres au x trouvé). « جرّب أعدادك » (`free`) : l'élève écrit SON équation.
 */
import * as Q from '@smarter-academy/core/arithmetic/equalities.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

export const DIVISOR_RANGE = Object.freeze([-12, 12]);

/** Les tâches par défaut de chaque niveau (la leçon peut passer les siennes). */
const PRESETS = Object.freeze({
  beginner: { tasks: [{ left: '3x+2', right: 'x+8' }, { left: '4x-3', right: '2x+7' }] },
  advanced: { tasks: [{ left: '9x+1', right: '5x-7' }, { left: '-2x+5', right: '3x-10' }, { left: '7x-190', right: '6x+110' }] },
});

export function init(numbers = {}) {
  const list = numbers.tasks ?? PRESETS.beginner.tasks;
  const tasks = list.map((t, i) => {
    const eq = Q.equation(t.left, t.right);
    if (!eq) throw new Error(`équation sans solution unique : ${t.left} = ${t.right}`);
    if (Lin.isZero(eq.x)) throw new Error('solution nulle : traverser sans changer de signe ne casserait rien');
    return Object.freeze({ id: `t${i}`, eq });
  });
  return { tasks, ti: 0, cur: tasks[0].eq, hist: [], c: 1, done: {}, trials: [], last: null, free: null, keepTried: false, checked: false, lines: null };
}

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const shape = (s) => Q.shapeOf(s.cur);
export const solved = (s) => Q.isSolved(s.cur);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]) && s.keepTried;
export const canDivide = (s) => !!shape(s) && !solved(s);
export const crates = (s) => Q.crates(s.cur);

const val = (x) => Lin.fracText(x);
const at = (e) => { const v = Q.checkAt(e, e.x); return { left: val(v.left), right: val(v.right) }; };

/** Une caisse traverse (`flip` : signe changé) — un ESSAI. Refusé si l'équation n'a plus la même solution. */
export function move(s, crateId, flip) {
  const [side, kind] = crateId.split(':');
  const r = Q.moveTerm(s.cur, side, kind, flip);
  if (r.refused) return s;
  const crate = Q.crates(s.cur).find((c) => c.id === crateId);
  const v = crate.value;
  const t = flip ? Lin.neg(v) : v;
  const base = { kind: 'move', task: s.ti, crate: kind, from: side, flip, free: !!s.free, value: val(v), landed: val(t) };
  if (!r.ok) {
    const trial = Object.freeze({ ...base, ok: false, kind: 'refused', reason: 'sign', values: at(r.eq), eq: Q.eqTex(r.eq) });
    return { ...s, trials: [...s.trials, trial], last: trial, keepTried: s.keepTried || (!s.free && !flip) };
  }
  // Le terme ajouté aux DEUX membres est l'opposé de la caisse qui traverse (−v) : à gauche et à droite.
  const opposite = Lin.neg(v);
  const opLine = `${Q.withTermTex(s.cur.L, kind === 'x' ? 'x' : 'n', opposite)} = ${Q.withTermTex(s.cur.R, kind === 'x' ? 'x' : 'n', opposite)}`;
  const isDone = Q.isSolved(r.eq);
  const sh2 = Q.shapeOf(r.eq);
  const trial = Object.freeze({ ...base, ok: true, op: val(opposite), eq: Q.eqTex(r.eq), solved: isDone, solution: isDone ? val(Lin.div(sh2.n, sh2.a)) : null });
  const next = { ...s, cur: r.eq, hist: [...s.hist, s.cur], trials: [...s.trials, trial], last: trial, lines: { op: opLine, result: Q.eqTex(r.eq) } };
  if (isDone && !s.free) next.done = { ...s.done, [s.ti]: true };
  return next;
}

export const setC = (s, c) => ({ ...s, c: Math.max(DIVISOR_RANGE[0], Math.min(DIVISOR_RANGE[1], Math.round(c))) });

/** « اقسم الطرفين » : un ESSAI ; réussi quand x reste seul (a ÷ a = 1). */
export function divide(s) {
  if (!canDivide(s)) return s;
  const r = Q.divideBoth(s.cur, s.c);
  if (r.refused) {
    const trial = Object.freeze({ kind: 'refused', reason: 'zero', task: s.ti, c: s.c, free: !!s.free });
    return { ...s, last: trial, trials: [...s.trials, trial] };
  }
  const sh = Q.shapeOf(s.cur);
  const done = Q.isSolved(r.eq);
  const opLine = `\\dfrac{${Q.sideTex(s.cur.L)}}{${s.c}} = \\dfrac{${Q.sideTex(s.cur.R)}}{${s.c}}`;
  const trial = Object.freeze({ kind: 'divide', task: s.ti, c: s.c, free: !!s.free, ok: true, solved: done, a: val(sh.a), n: val(sh.n), eq: Q.eqTex(r.eq), solution: done ? val(Lin.div(sh.n, sh.a)) : null });
  const next = { ...s, cur: r.eq, hist: [...s.hist, s.cur], trials: [...s.trials, trial], last: trial, lines: { op: opLine, result: Q.eqTex(r.eq) } };
  if (done && !s.free) next.done = { ...s.done, [s.ti]: true };
  return next;
}

/** « عوّض » : les deux membres au x trouvé (l'élève vérifie). */
export function check(s) {
  if (!solved(s)) return s;
  const sh = Q.shapeOf(s.cur);
  const x = Lin.div(sh.n, sh.a);
  const start = s.free ? s.free.eq : taskOf(s).eq;
  const v = Q.checkAt(start, x);
  const trial = Object.freeze({ kind: 'check', task: s.ti, free: !!s.free, x: val(x), left: val(v.left), right: val(v.right), ok: Lin.eq(v.left, v.right) });
  return { ...s, trials: [...s.trials, trial], last: trial, checked: true };
}

export function undo(s) {
  if (!s.hist.length) return s;
  const cur = s.hist[s.hist.length - 1];
  const done = { ...s.done };
  if (!s.free && done[s.ti] && !Q.isSolved(cur)) delete done[s.ti];
  return { ...s, cur, hist: s.hist.slice(0, -1), last: null, lines: null, done };
}
export function nextTask(s) {
  if (!canNext(s)) return s;
  const t = s.tasks[s.ti + 1];
  return { ...s, ti: s.ti + 1, cur: t.eq, hist: [], last: null, lines: null, c: 1, checked: false };
}
export const restartTask = (s) => ({ ...s, cur: s.free ? s.free.eq : taskOf(s).eq, hist: [], last: null, lines: null, c: 1 });

/** « جرّب أعدادك » : l'élève écrit son équation (une seule inconnue x, solution non nulle). */
export function parseFree(raw) {
  const eq = Q.parseEquation(raw);
  if (!eq) return { error: 'bad' };
  if (Lin.isZero(eq.x)) return { error: 'zero' };
  if (Math.abs(Lin.toNumber(eq.x)) > 999) return { error: 'big' };
  return { eq };
}
export function setFree(s, raw) {
  const r = parseFree(raw);
  if (!r.eq) return s;
  return { ...s, free: { eq: r.eq, text: raw }, cur: r.eq, hist: [], last: null, lines: null, c: 1, checked: false };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, cur: taskOf(s).eq, hist: [], last: null, lines: null, c: 1 } : s);

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/* ── Onboarding (LabCoach) ───────────────────────────────────────────────────────────────────── */

/**
 * Le prochain geste utile — jamais la réponse : `carry` (prendre une caisse), `tryKeep` (une fois : faire traverser une caisse « كما هو »
 * pour voir le refus — le contraste, jamais le bon quai), `divide` (régler le diviseur), `go` (« اقسم »), `check` (« عوّض »), `next`.
 * `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) {
    if (!s.checked) return { id: 'check', target: '[data-tf-check]', gesture: 'tap' };
    if (canNext(s)) return { id: 'next', target: '[data-tf-next]', gesture: 'tap' };
    if (!s.keepTried) return { id: 'tryKeep', target: '[data-tf-dock="keep"]', gesture: 'drag' };
    return null;
  }
  if (canDivide(s)) return s.c === 1 ? { id: 'divide', target: '[data-tf-stepper]', gesture: 'tap' } : { id: 'go', target: '[data-tf-divide-go]', gesture: 'tap' };
  if (!s.keepTried && s.ti >= 1 && guidedTrials(s).length === 0) return { id: 'tryKeep', target: '[data-tf-dock="keep"]', gesture: 'drag' };
  return { id: 'carry', target: '[data-tf-crate]', gesture: 'drag' };
}

/* ── Découverte : les réfutations avec SES essais ────────────────────────────────────────────── */

/** Son essai refusé (garder le signe), sa traversée réussie ; sinon des valeurs de la première tâche. */
export function witnesses(s) {
  const refused = s.trials.findLast((t) => t.kind === 'refused' && t.reason === 'sign' && !t.free)
    ?? s.trials.findLast((t) => t.kind === 'refused' && t.reason === 'sign') ?? null;
  const flipped = s.trials.findLast((t) => t.kind === 'move' && t.ok && t.flip && !t.free && t.landed.startsWith('-')) ?? null;
  const div = s.trials.findLast((t) => t.kind === 'divide' && !t.free) ?? null;
  return { refused, flipped, div };
}
