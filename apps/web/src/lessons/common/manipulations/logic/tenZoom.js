/**
 * ten-zoom — LA LOGIQUE PURE de « عدسة القوى » (3AM, unité 3 « القوى ذات أسس نسبية صحيحة », درس « قوى العدد 10 », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/tenPowers.js` (importé PAR CHEMIN). Aucun flottant : l'exposant n est un entier.
 *
 * LE MODÈLE. Une lentille de laiton, une BAGUE de zoom crantée : chaque cran multiplie par 10 (cadre plus grand) ou divise par 10
 * (cadre plus petit) le côté d'un CADRE carré. La main tient n — le nombre de crans à partir du cadre de 1 m (le dessus d'une table) ;
 * la plaque lit le côté en DÉCIMAL (« 1 000 m », « 0,001 m »). La notation 10ⁿ n'apparaît qu'à la phase formelle de la découverte.
 *   - monde `zoom` : la carte donne un côté (en décimal, en nom ou dans une autre unité) ; la main tourne la bague et « ثبّت الإطار » ;
 *   - monde `prefixes` : la carte est une unité (كيلومتر, ميليمتر, ميكرومتر, نانومتر, ميغامتر) ; la plaque affiche le nom de l'unité.
 * Une tâche : { id, target (entier), card: { dec | name | unit | km … }, predict?: { q, options: [n…], correct }, startAt?: 'prev' }.
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués tels quels vers `onTrial`)
 *   { kind: 'notch', task, n, dir } · { kind: 'predict', task, choice, ok } · { kind: 'dock', task, n, ok }
 *   { kind: 'refused', task, n, target, reason: 'over' | 'under' | 'direction' } · { kind: 'solved', world, task, n } · { kind: 'custom', n }
 * Les essais libres portent `free: true` (jamais comptés).
 */
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';

export const N_MIN = -12;
export const N_MAX = 12;
export const SCENE_MIN = -7;
export const SCENE_MAX = 9;

/* ── Les niveaux et le monde `prefixes` (les mêmes valeurs que `levels.js`, comparées par un test) ───────────────────────────────── */
export const PRESETS = Object.freeze({
  beginner: { world: 'zoom', tally: true, discovery: 'count', tasks: [
    { id: 'z1', target: 3, card: { dec: 3 } },
    { id: 'z2', target: 6, card: { dec: 6 }, predict: { q: 'out', options: [6, 7, 1000000], correct: 0 } },
    { id: 'z3', target: -3, card: { dec: -3 } },
    { id: 'z4', target: 0, card: { dec: 0 }, startAt: 'prev' },
  ] },
  advanced: { world: 'zoom', tally: false, discovery: 'rank', tasks: [
    { id: 'z5', target: 9, card: { name: 9 } },
    { id: 'z6', target: -6, card: { unit: -6, def: true } },
    { id: 'z7', target: -7, card: { dec: -7 }, predict: { q: 'in', options: [6, 7, 8], correct: 1 } },
    { id: 'z8', target: 4, card: { km: 10 } },
  ] },
  prefixes: { world: 'prefixes', tally: false, discovery: null, tasks: [
    { id: 'p1', target: 3, card: { unit: 3 } },
    { id: 'p2', target: -3, card: { unit: -3 } },
    { id: 'p3', target: -6, card: { unit: -6 } },
    { id: 'p4', target: -9, card: { unit: -9 } },
    { id: 'p5', target: 6, card: { unit: 6, def: true } },
  ] },
});

/** Le nom de l'unité sur la plaque : le monde `zoom` n'en montre que quatre ; `prefixes` les six. */
const PILL_ZOOM = Object.freeze({ 3: 3, '-3': -3, '-6': -6, '-9': -9 });
export function unitPill(n, world) {
  if (world === 'prefixes') {
    const p = T.prefixOf(n);
    return p && p.name && [3, 6, 9, -3, -6, -9].includes(n) ? `${p.name}متر` : null;
  }
  if (PILL_ZOOM[n] === undefined) return null;
  const p = T.prefixOf(n);
  return `${p.name}متر`;
}

/** Le côté du cadre en décimal : « 1 000 » (sans l'unité). */
export const sideText = (n) => T.pow10Text(n);

/** La tally du مبتدئ : « 1 × 10 × 10 » ou « 1 ÷ 10 ÷ 10 » (rien à 0). */
export function tallyOf(n) {
  if (n === 0) return '1';
  const op = n > 0 ? '×' : '÷';
  return ['1', ...Array.from({ length: Math.abs(n) }, () => `${op} 10`)].join(' ');
}

/** L'exposant que désigne une carte (utilisé pour VÉRIFIER que `target` est cohérent avec le texte de la carte). */
export function cardExponent(card) {
  if ('dec' in card) return card.dec;
  if ('name' in card) return card.name;
  if ('unit' in card) return card.unit;
  if ('km' in card) return T.exponentOfPow10(String(card.km)) + 3;
  return null;
}

/** Le jugement d'un côté n contre la cible t : exact. */
export function verdict(n, target) {
  if (n === target) return { ok: true };
  if ((target < 0 && n > 0) || (target > 0 && n < 0)) return { ok: false, reason: 'direction', k: Math.abs(n - target) };
  return n > target ? { ok: false, reason: 'over', k: n - target } : { ok: false, reason: 'under', k: target - n };
}

/* ── Les tâches et l'état ──────────────────────────────────────────────────────────────────────────────────────────── */

export function buildTask(raw, i = 0) {
  if (!Number.isInteger(raw.target) || raw.target < N_MIN || raw.target > N_MAX) throw new RangeError(`cible hors de ${N_MIN} … ${N_MAX}`);
  const expo = cardExponent(raw.card);
  if (expo !== raw.target) throw new Error(`la carte ${JSON.stringify(raw.card)} ne désigne pas ${raw.target}`);
  return Object.freeze({ id: raw.id ?? `t${i}`, target: raw.target, card: raw.card, predict: raw.predict ?? null, startAt: raw.startAt ?? null, free: !!raw.free });
}

export function init(numbers) {
  const tasks = (numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask);
  return {
    world: numbers.world ?? 'zoom', tally: !!numbers.tally, discovery: numbers.discovery ?? null,
    tasks, ti: 0, n: 0, done: tasks.map(() => false), trials: [], last: null, flash: 0, epoch: 0, pick: null, wobble: null,
    notches: 0, free: null, dir: 0, prevN: 0,
  };
}

export const isFree = (s) => !!s.free;
export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const taskDone = (s) => (s.free ? s.free.done : !!s.done[s.ti]);
export const allDone = (s) => s.done.every(Boolean);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const predictionPending = (s) => {
  const t = taskOf(s);
  return !!t.predict && s.pick === null && !taskDone(s);
};
const taskId = (s) => taskOf(s).id;
const log = (s, ev) => ({ ...s, trials: [...s.trials, { ...ev, task: taskId(s), ...(s.free ? { free: true } : {}) }] });

/** Un cran : dir = +1 (cadre ×10) ou −1 (cadre ÷10). Refusé pendant une prédiction en attente, après la réussite, ou au bout de la bague. */
export function notch(s, dir) {
  if (taskDone(s) || predictionPending(s)) return s;
  const n = s.n + dir;
  if (n < N_MIN || n > N_MAX) return { ...s, last: { kind: 'limit', n: s.n }, flash: s.flash + 1 };
  return { ...log({ ...s, n, prevN: s.n, dir, epoch: s.epoch + 1, notches: s.notches + 1, last: { kind: 'notch', n, dir }, wobble: null }, { kind: 'notch', n, dir }) };
}
/** Plusieurs crans d'un geste (pincement). */
export function stepTo(s, n) {
  let cur = s;
  const dir = n > s.n ? 1 : -1;
  for (let guard = 0; cur.n !== n && guard < 40; guard += 1) {
    const next = notch(cur, dir);
    if (next === cur) break;
    cur = next;
  }
  return cur;
}

/** Le choix d'une carte de prédiction (une seule fois par tâche). */
export function choosePrediction(s, i) {
  const t = taskOf(s);
  if (!t.predict || s.pick !== null || taskDone(s)) return s;
  return { ...s, pick: i, last: { kind: 'picked', i } };
}

/** « ثبّت الإطار » : le jugement exact du côté contre la carte. */
export function dock(s) {
  if (taskDone(s)) return s;
  if (predictionPending(s)) return s;
  const t = taskOf(s);
  const v = verdict(s.n, t.target);
  if (v.ok) {
    let r = log({ ...s, last: { kind: 'solved', n: s.n }, flash: s.flash + 1 }, { kind: 'dock', n: s.n, ok: true });
    let wob = null;
    if (t.predict) {
      const ok = s.pick === t.predict.correct;
      r = log(r, { kind: 'predict', choice: t.predict.options[s.pick], ok });
      if (!ok) wob = { count: Math.abs(s.n), choice: t.predict.options[s.pick] };
    }
    r = log(r, { kind: 'solved', world: s.world, n: s.n });
    if (s.free) return { ...r, free: { ...s.free, done: true }, wobble: wob };
    const done = s.done.slice(); done[s.ti] = true;
    return { ...r, done, wobble: wob };
  }
  let r = log({ ...s, last: { kind: 'refused', ...v, n: s.n, target: t.target }, flash: s.flash + 1 }, { kind: 'dock', n: s.n, ok: false });
  r = log(r, { kind: 'refused', n: s.n, target: t.target, reason: v.reason });
  return r;
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  const keep = s.tasks[ti].startAt === 'prev';
  return { ...s, ti, n: keep ? s.n : 0, prevN: s.n, pick: null, wobble: null, last: null, notches: 0, epoch: s.epoch + 1, dir: 0 };
}
/** Recommencer la tâche (cadre de 1 m). */
export function restartTask(s) {
  return { ...s, n: s.tasks[s.ti]?.startAt === 'prev' && !s.free ? s.n : 0, pick: null, wobble: null, last: null, notches: 0, epoch: s.epoch + 1, free: s.free ? { ...s.free, done: false } : null };
}

/* ── « جرّب أعدادك » ───────────────────────────────────────────────────────────────────────────────────────────────── */

/** Un texte libre : une puissance de 10 en décimal (de 0,000000000001 à 1 000 000 000 000) ou un nom de la liste. → { ok, n } ou { ok:false, why }. */
export function validateFree(text) {
  const raw = String(text ?? '').trim();
  if (!raw) return { ok: false, why: 'empty' };
  const byName = T.nameToExponent(raw.replace(/\s*(م|متر)$/u, ''));
  const byDec = T.exponentOfPow10(raw.replace(/\s*(م|متر)$/u, ''));
  const n = byDec ?? byName;
  if (n === null || n === undefined) return { ok: false, why: T.parseDec(raw) === null && byName === null ? 'format' : 'notpow' };
  if (n < N_MIN || n > N_MAX) return { ok: false, why: 'range' };
  return { ok: true, n };
}
export function setFree(s, text) {
  const v = validateFree(text);
  if (!v.ok) return s;
  const task = Object.freeze({ id: 'free', target: v.n, card: { dec: v.n }, predict: null, startAt: null, free: true, done: false });
  return log({ ...s, free: task, n: 0, prevN: s.n, pick: null, wobble: null, last: { kind: 'custom', n: v.n }, notches: 0, epoch: s.epoch + 1 }, { kind: 'custom', n: v.n });
}
export function toGuided(s) {
  return { ...s, free: null, n: s.tasks[s.ti]?.startAt === 'prev' ? s.n : 0, prevN: s.n, pick: null, wobble: null, last: null, notches: 0, epoch: s.epoch + 1 };
}

/* ── Découverte et onboarding ──────────────────────────────────────────────────────────────────────────────────────── */

export const discoveryKind = (s) => (!s.free && s.discovery && allDone(s) ? s.discovery : null);
export const discoveryReady = (s) => discoveryKind(s) !== null;

/** L'étape du guide : une fonction pure de l'état ; elle ne nomme jamais un nombre de crans ni une règle. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-tz-next]', gesture: 'tap' } : { id: 'free', target: '[data-tz-free]', gesture: 'type' };
  if (predictionPending(s)) return { id: 'predict', target: '[data-tz-predict-card]', gesture: 'tap', prefer: 'below' };
  if (s.notches === 0) return { id: 'ring', target: '[data-tz-ring]', gesture: 'drag', prefer: 'above' };
  if (s.notches === 1) return { id: 'plate', target: '[data-tz-plate]', gesture: 'look', prefer: 'below' };
  return { id: 'dock', target: '[data-tz-dock]', gesture: 'tap', prefer: 'above' };
}

/** « أعِد التجربة » (questions pendant le labo) : la MÊME tâche repart ET son drapeau « fait » tombe — sinon l'étape resterait verte et la carte de questions ne se rouvrirait pas.
 *  Une tâche qui part de la précédente (`startAt: 'prev'`) repart du cadre de la tâche d'avant, pas de celui qu'on vient d'atteindre. */
export function retryTask(s) {
  const n = restartTask(s);
  if (s.free) return n;
  const t = s.tasks[s.ti];
  const back = t.startAt === 'prev' && s.ti > 0 ? s.tasks[s.ti - 1].target : n.n;
  return { ...n, n: back, done: n.done.map((d, i) => (i === s.ti ? false : d)) };
}
