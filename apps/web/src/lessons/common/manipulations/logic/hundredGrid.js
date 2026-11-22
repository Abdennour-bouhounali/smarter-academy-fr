/**
 * hundred-grid — LA LOGIQUE PURE de « الصينية المئة » (3AM, unité 6, درس « النسبة المئوية », 2026-10-21). Exacte : toute la mathématique vient de
 * `packages/core/arithmetic/percent3.js` (sur `linear.js`, importé PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Un stock de x sacs est coupé en 100 PAQUETS égaux sur un plateau de 10 × 10 cases : une case vaut x/100 (le « 1 % »). La MAIN peint t
 * cases (de 0 à 100) ; le panier reçoit t cases, soit x × t/100 sacs. Quatre sortes de TÂCHES :
 *   of      t est donné (« 15 % de 240 ») : l'élève PEINT t cases, ÉCRIT combien de sacs le panier contiendra AVANT l'ouverture, puis « انقل » ;
 *   rate    le panier doit contenir exactement `part` sacs : l'élève cherche le nombre de cases (le panier est visible en direct) ;
 *   change  augmentation / diminution de t % : t cases s'AJOUTENT aux 100 (up) ou s'en RETIRENT (down) ; l'élève écrit le NOUVEAU stock avant l'ouverture ;
 *   whole   `part` sacs sont t % du stock (le panier montre `part`, t cases sont peintes) : l'élève écrit le stock entier.
 * Une tâche `change` peut REPRENDRE le stock obtenu par la précédente (`carry`) : la chaîne +20 % puis −20 % ne ramène pas au départ.
 * Chaque « انقل » est un ESSAI jugé exactement ; « جرّب أعدادك » (`free`) : l'élève écrit son stock x, peint librement, le panier se lit en direct.
 */
import * as P from '@smarter-academy/core/arithmetic/percent3.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

const KINDS = Object.freeze(['of', 'rate', 'change', 'whole']);
export const MAX_T = 100;

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { kind: 'of', x: '240', t: 15 },
    { kind: 'rate', x: '150', part: '60' },
    { kind: 'change', x: '200', dir: 'up', t: 15 },
    { kind: 'change', x: '250', dir: 'down', t: 20 },
  ] },
  advanced: { tasks: [
    { kind: 'rate', x: '75', part: '52.5' },
    { kind: 'rate', x: '32', part: '8' },
    { kind: 'whole', part: '84', t: 60 },
    { kind: 'change', x: '200', dir: 'up', t: 20 },
    { kind: 'change', carry: true, dir: 'down', t: 20 },
  ] },
});

const num = (v) => (typeof v === 'object' ? v : Lin.parseNumber(v));

/** La tâche complétée : ses nombres sont des fractions exactes ; la réponse attendue est CALCULÉE ici, jamais saisie. */
function build(raw, i, prev) {
  if (!KINDS.includes(raw.kind)) throw new Error(`tâche inconnue : ${raw.kind}`);
  const task = { id: `t${i}`, kind: raw.kind };
  if (raw.kind === 'of') {
    task.x = num(raw.x); task.t = raw.t; task.answer = P.partOf(task.x, task.t);
  } else if (raw.kind === 'rate') {
    task.x = num(raw.x); task.part = num(raw.part);
    const t = P.rateOf(task.part, task.x);
    if (!Lin.isInteger(t) || Lin.toNumber(t) < 1 || Lin.toNumber(t) > MAX_T) throw new Error('taux non entier');
    task.t = Lin.toNumber(t); task.answer = task.part;
  } else if (raw.kind === 'whole') {
    task.part = num(raw.part); task.t = raw.t; task.x = P.wholeOf(task.part, task.t); task.answer = task.x;
  } else {
    task.dir = raw.dir; task.t = raw.t; task.carry = !!raw.carry;
    task.x = raw.carry ? prev.after : num(raw.x);
    task.after = P.changed(task.x, task.dir, task.t); task.answer = task.after;
  }
  task.after ??= null;
  return Object.freeze(task);
}

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const tasks = [];
  raws.forEach((r, i) => tasks.push(build(r, i, tasks[i - 1])));
  const s0 = { tasks, ti: 0, t: 0, guess: '', done: {}, opened: {}, trials: [], last: null, free: null };
  return { ...s0, t: startT(tasks[0]) };
}
const startT = (task) => (task.kind === 'whole' ? task.t : 0);

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
/** Le stock sur le plateau : celui de la tâche, ou celui que l'élève a écrit en libre. */
export const stockOf = (s) => (s.free ? s.free.x : taskOf(s).x);
/** Ce que le panier contiendrait avec les t cases peintes (x × t/100). */
export const basketNow = (s) => P.partOf(stockOf(s), s.t);
/** `of`, `change`, `whole` demandent une réponse écrite AVANT l'ouverture ; `rate` se lit en direct. */
export const needsGuess = (s) => !s.free && taskOf(s).kind !== 'rate';
/** Le panier est-il visible ? en direct pour `rate`, `whole` (le panier montre `part`) et en libre ; sinon après l'essai. */
export const revealed = (s) => s.free || taskOf(s).kind === 'rate' || taskOf(s).kind === 'whole' || !!s.opened[s.ti];

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

const clampT = (t) => Math.max(0, Math.min(MAX_T, Math.round(t)));
export const setT = (s, t) => { const v = clampT(t); return v === s.t ? s : { ...s, t: v, last: null }; };
export const stepT = (s, d) => setT(s, s.t + d);
export const clearT = (s) => setT(s, 0);
/** La réponse écrite : chiffres arabes ou latins, virgule ou point. */
export const setGuess = (s, raw) => ({ ...s, guess: String(raw).replace(/[^0-9٠-٩.,٫/]/g, '').slice(0, 8), last: null });
function parseGuess(raw) {
  try {
    const q = String(raw).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', ',').trim();
    if (!/^\d+([.,]\d{1,3})?$/.test(q)) return null;
    return Lin.parseNumber(q);
  } catch { return null; }
}
const guessValue = (s) => parseGuess(s.guess);
export const canGo = (s) => {
  if (s.free) return false;
  if (taskDone(s)) return false;
  if (needsGuess(s) && !guessValue(s)) return false;
  return true;
};

/** « انقل » : l'essai jugé. `why` : 'paint' (autre nombre de cases que demandé), 'guess' (réponse fausse), 'short' / 'over' (panier trop vide / trop plein). */
export function go(s) {
  if (!canGo(s)) return s;
  const task = taskOf(s);
  const basket = basketNow(s);
  let why = null;
  let guess = null;
  if (task.kind === 'rate') {
    const c = Lin.cmp(basket, task.part);
    if (c < 0) why = 'short'; else if (c > 0) why = 'over';
  } else {
    if (s.t !== task.t) why = 'paint';
    guess = guessValue(s);
    if (!why && !Lin.eq(guess, task.answer)) why = 'guess';
  }
  const ok = why === null;
  const trial = Object.freeze({
    kind: 'go', task: s.ti, tk: task.kind, dir: task.dir ?? null, ok, why, painted: s.t, t: task.t, free: false,
    x: P.text(task.kind === 'whole' ? task.x : task.x), part: P.text(task.kind === 'rate' || task.kind === 'whole' ? task.part ?? basket : basket),
    basket: P.text(basket), guess: guess ? P.text(guess) : null, expected: P.text(task.answer),
    packet: P.text(P.packet(task.x)),
  });
  return { ...s, trials: [...s.trials, trial], last: trial, opened: { ...s.opened, [s.ti]: true }, done: ok ? { ...s.done, [s.ti]: true } : s.done };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const task = s.tasks[s.ti + 1];
  return { ...s, ti: s.ti + 1, t: startT(task), guess: '', last: null };
}
/** « إعادة » : la même tâche, plateau propre ; les essais restent. */
const restartTask = (s) => (s.free ? { ...s, t: 0, last: null } : { ...s, t: startT(taskOf(s)), guess: '', last: null, opened: { ...s.opened, [s.ti]: false } });

/** « أعِد التجربة » (carte de questions) : la même tâche repart — plateau propre, panier refermé, et la tâche n'est plus « faite » (la carte se rouvrira à la prochaine réussite). */
export const retryTask = (s) => (s.free ? restartTask(s) : { ...restartTask(s), done: { ...s.done, [s.ti]: false } });

export function setFree(s, raw) {
  const x = P.parseStock(raw);
  if (!x) return s;
  return { ...s, free: { x }, t: 0, guess: '', last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, t: startT(taskOf(s)), guess: '', last: null } : s);

/* ── Lecture ─────────────────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => t.kind === 'go' && !t.free && t.task === i);

/**
 * Le prochain geste utile — jamais la réponse : `paint` (le premier geste : peindre), `guess` (écrire la réponse avant d'ouvrir), `go` (« انقل »),
 * `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const task = taskOf(s);
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-hg-next]', gesture: 'tap' } : null;
  if (task.kind === 'rate') {
    if (guidedTrials(s).length === 0 && s.t === 0) return { id: 'paint', target: '[data-hg-grid]', gesture: 'drag' };
    return s.last?.why ? { id: 'paint', target: '[data-hg-grid]', gesture: 'drag' } : { id: 'go', target: '[data-hg-go]', gesture: 'tap' };
  }
  if (task.kind === 'whole') return guessValue(s) ? { id: 'go', target: '[data-hg-go]', gesture: 'tap' } : { id: 'guess', target: '[data-hg-guess]', gesture: 'type' };
  if (s.t !== task.t) return { id: 'paint', target: '[data-hg-grid]', gesture: 'drag' };
  if (!guessValue(s)) return { id: 'guess', target: '[data-hg-guess]', gesture: 'type' };
  return { id: 'go', target: '[data-hg-go]', gesture: 'tap' };
}

/** Ses essais réussis (pour réfuter les fausses conjectures avec ses propres nombres). */
export function witnesses(s) {
  const mine = s.trials.filter((t) => t.kind === 'go' && t.ok);
  return { of: mine.findLast((t) => t.tk === 'of') ?? mine.findLast((t) => t.tk === 'rate') ?? null, change: mine.findLast((t) => t.tk === 'change') ?? null };
}
