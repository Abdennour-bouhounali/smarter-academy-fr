/**
 * unit-ladder — LA LOGIQUE PURE de « مسطرة التحويل » (3AM, unité 3, درس « قواعد الحساب على قوى العدد 10 », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/tenPowers.js` (importé PAR CHEMIN) ; la main tient un nombre ENTIER de colonnes.
 *
 * LE MODÈLE. Une règle de laiton gravée de COLONNES égales ; entre deux colonnes voisines on multiplie par 10. Les plaques d'unités pendent
 * au-dessus de leurs colonnes : les grandes unités à GAUCHE. Le mode (1 longueur · 2 aire · 3 volume) fixe le nombre de colonnes par unité :
 * la règle se RE-PAVE. La plaque de l'unité u commence à la frontière `plaquePos(u, mode)`. Un ruban rouge a deux poignées : la 1re est posée
 * par la tâche sur la plaque de départ, la 2e est libre ; le nombre de colonnes k entre elles est l'exposant du facteur de conversion.
 * Vers une unité PLUS PETITE : k > 0 (ruban rouge) ; vers une plus grande : k < 0 (ruban bleu).
 *
 * Une tâche : { id, path: [unité, unité, …] (2 = un ruban, 3 = deux rubans enchaînés), mode, chooseMode?, predict?: { options: [k…], correct }, startAt? }.
 *
 * ÉVÉNEMENTS (`state.trials`) : { kind:'stretch', task, from, to, k } · { kind:'hop', task, i, k } · { kind:'predict', task, choice, ok } ·
 * { kind:'mode', mode } · { kind:'refused', task, reason: 'mid-plaque'|'mode'|'wrong-unit', k } · { kind:'solved', task, k, mode } · { kind:'custom', from, to, mode }.
 * Les essais libres portent `free: true`.
 */
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';

export const MODES = Object.freeze([1, 2, 3]);
export const K_MAX = 12;
/** Les unités disponibles par mode : longueur km … nm ; aire km² … mm² ; volume m³ … mm³. */
export const UNITS = Object.freeze({
  1: Object.freeze(['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm', 'um', 'nm']),
  2: Object.freeze(['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']),
  3: Object.freeze(['m', 'dm', 'cm', 'mm']),
});
const FIRST = { 1: 'km', 2: 'km', 3: 'm' };

/** La frontière gauche (en colonnes) de la plaque de l'unité u, dans le mode donné ; `null` si l'unité n'existe pas dans ce mode. */
export function plaquePos(u, mode) {
  if (!UNITS[mode].includes(u)) return null;
  return (T.UNIT_SCALE[FIRST[mode]] - T.UNIT_SCALE[u]) * mode;
}
/** Le nombre total de colonnes de la règle dans un mode. */
export function totalColumns(mode) {
  const last = UNITS[mode].at(-1);
  return plaquePos(last, mode) + mode;
}
/** L'unité dont la plaque commence à la frontière `pos` (ou `null` : au milieu d'une plaque, ou sur une colonne vide). */
export function unitAt(pos, mode) {
  return UNITS[mode].find((u) => plaquePos(u, mode) === pos) ?? null;
}
/** Le ruban entre deux unités : nombre signé de colonnes (positif vers la plus petite). */
export const bandOf = (from, to, mode) => plaquePos(to, mode) - plaquePos(from, mode);
/** Accroche une abscisse (en colonnes, décimale) à la frontière entière la plus proche, dans la règle. */
export function snap(x, mode) {
  return Math.max(0, Math.min(totalColumns(mode), Math.round(x)));
}
/** Le facteur de conversion en décimal : « 100 000 » ou « 0,000001 ». */
export const factorText = (k) => T.pow10Text(k);

/* ── Presets (les mêmes valeurs que `levels.js`, comparées par un test) ────────────────────────────────────────────────────────── */
export const PRESETS = Object.freeze({
  beginner: { mode: 1, fixedMode: true, showFactor: true, discovery: 'gap', tasks: [
    { id: 'u1', path: ['km', 'm', 'mm'], mode: 1, predict: { q: 'total', options: [6, 9, 3], correct: 0 } },
    { id: 'u2', path: ['km', 'cm'], mode: 1, predict: { q: 'across', options: [5, 1, 6], correct: 0 } },
    { id: 'u3', path: ['mm', 'um'], mode: 1 },
  ] },
  advanced: { mode: 1, fixedMode: false, showFactor: false, discovery: 'tables', tasks: [
    { id: 'u4', path: ['km', 'm'], mode: 2 },
    { id: 'u5', path: ['m', 'cm'], mode: 3 },
    { id: 'u6', path: ['mm', 'm'], mode: 2 },
    { id: 'u7', path: ['m', 'dm'], mode: 3 },
  ] },
});

/** La tâche brute → tâche gelée et vérifiée : les unités existent dans le mode, |k| ≤ 12, deux unités consécutives sont distinctes. */
export function buildTask(raw, i = 0) {
  const { path, mode } = raw;
  if (!MODES.includes(mode)) throw new RangeError('mode 1 | 2 | 3');
  if (!Array.isArray(path) || path.length < 2 || path.length > 3) throw new RangeError('chemin de 2 ou 3 unités');
  for (const u of path) if (plaquePos(u, mode) === null) throw new RangeError(`unité ${u} absente du mode ${mode}`);
  for (let j = 0; j < path.length - 1; j += 1) if (path[j] === path[j + 1]) throw new RangeError('unités identiques');
  const total = bandOf(path[0], path.at(-1), mode);
  if (Math.abs(total) > K_MAX) throw new RangeError(`|k| > ${K_MAX}`);
  if (raw.predict && raw.predict.options[raw.predict.correct] !== total) throw new Error('la prédiction juste doit être le total');
  return Object.freeze({ id: raw.id ?? `t${i}`, path: Object.freeze([...path]), mode, total, predict: raw.predict ?? null, free: !!raw.free });
}

export function init(numbers) {
  const tasks = (numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask);
  const fixedMode = !!numbers.fixedMode;
  const mode = fixedMode ? tasks[0].mode : (numbers.mode ?? 1);
  const s = {
    mode, fixedMode, showFactor: !!numbers.showFactor, discovery: numbers.discovery ?? null,
    tasks, ti: 0, hop: 0, bands: [], handle: 0, done: tasks.map(() => false), trials: [], last: null, flash: 0, epoch: 0,
    pick: null, wobble: null, moves: 0, modeTouched: false, free: null,
  };
  return { ...s, handle: startOf(s) };
}

export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const taskDone = (s) => (s.free ? s.free.done : !!s.done[s.ti]);
export const allDone = (s) => s.done.every(Boolean);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isFree = (s) => !!s.free;
/** L'unité de départ du ruban en cours. */
export const fromUnit = (s) => taskOf(s).path[s.hop];
export const toUnit = (s) => taskOf(s).path[s.hop + 1];
/** La position de départ (poignée 1) : la plaque de départ dans le mode COURANT (0 si elle n'y est pas). */
export function startOf(s) {
  return plaquePos(fromUnit(s), s.mode) ?? 0;
}
export const predictionPending = (s) => {
  const t = taskOf(s);
  return !!t.predict && s.pick === null && !taskDone(s);
};
const log = (s, ev) => ({ ...s, trials: [...s.trials, { ...ev, task: taskOf(s).id, ...(s.free ? { free: true } : {}) }] });
/** Le ruban en cours : signé, de la poignée 1 à la poignée 2. */
export const currentK = (s) => s.handle - startOf(s);
/** Le mode de la tâche est-il celui de la règle ? */
export const modeOk = (s) => s.mode === taskOf(s).mode;
export const blocked = (s) => taskDone(s) || predictionPending(s);

/** Déplace la poignée libre à la frontière `pos` (tirage, plaque touchée, clavier). */
export function moveTo(s, pos) {
  if (blocked(s)) return s;
  const p = snap(pos, s.mode);
  if (p === s.handle) return s;
  return { ...s, handle: p, moves: s.moves + 1, last: { kind: 'move', pos: p } };
}
export const step = (s, dir) => moveTo(s, s.handle + dir);

/** Choisit le mode (متقدم seulement). La règle se re-pave ; les rubans déjà tendus sont posés de côté. */
export function setMode(s, mode) {
  if (s.fixedMode || s.free || !MODES.includes(mode) || mode === s.mode || taskDone(s)) return s;
  const n = { ...s, mode, modeTouched: true, bands: [], hop: 0, last: { kind: 'mode', mode }, epoch: s.epoch + 1 };
  return log({ ...n, handle: startOf(n) }, { kind: 'mode', mode });
}

export function choosePrediction(s, i) {
  const t = taskOf(s);
  if (!t.predict || s.pick !== null || taskDone(s)) return s;
  return { ...s, pick: i, last: { kind: 'picked', i } };
}

/** Le jugement exact du ruban tendu (« ثبّت الشريط »). */
function verdict(s) {
  const t = taskOf(s);
  if (!modeOk(s)) return { ok: false, reason: 'mode', k: currentK(s) };
  const to = unitAt(s.handle, s.mode);
  const k = currentK(s);
  if (to === null) return { ok: false, reason: 'mid-plaque', k };
  if (to !== toUnit(s)) return { ok: false, reason: 'wrong-unit', k, to };
  return { ok: true, k, to, t };
}

export function dock(s) {
  if (blocked(s)) return s;
  const v = verdict(s);
  const t = taskOf(s);
  if (!v.ok) {
    const r = log({ ...s, last: { kind: 'refused', ...v }, flash: s.flash + 1 }, { kind: 'stretch', from: fromUnit(s), to: unitAt(s.handle, s.mode), k: currentK(s), ok: false });
    return log(r, { kind: 'refused', reason: v.reason, k: v.k });
  }
  const bands = [...s.bands, { from: fromUnit(s), to: v.to, k: v.k }];
  let r = log({ ...s, bands }, { kind: 'stretch', from: fromUnit(s), to: v.to, k: v.k, ok: true });
  r = log(r, { kind: 'hop', i: s.hop, k: v.k });
  if (s.hop < t.path.length - 2) {
    const n = { ...r, hop: s.hop + 1, last: { kind: 'hop', k: v.k }, flash: s.flash + 1 };
    return { ...n, handle: startOf(n), moves: s.moves };
  }
  r = { ...r, last: { kind: 'solved', k: t.total }, flash: s.flash + 1 };
  let wob = null;
  if (t.predict) {
    const ok = s.pick === t.predict.correct;
    r = log(r, { kind: 'predict', choice: t.predict.options[s.pick], ok });
    if (!ok) wob = { count: t.total, choice: t.predict.options[s.pick] };
  }
  r = log(r, { kind: 'solved', k: t.total, mode: s.mode });
  if (s.free) return { ...r, free: { ...s.free, done: true }, wobble: wob };
  const done = s.done.slice(); done[s.ti] = true;
  return { ...r, done, wobble: wob };
}

function reset(s, extra = {}) {
  const n = { ...s, hop: 0, bands: [], pick: null, wobble: null, last: null, moves: 0, epoch: s.epoch + 1, ...extra };
  return { ...n, handle: startOf(n) };
}
export function nextTask(s) {
  if (!canNext(s)) return s;
  const mode = s.fixedMode ? s.tasks[s.ti + 1].mode : 1;
  return reset({ ...s, ti: s.ti + 1, mode, modeTouched: false });
}
/** Recommencer la tâche (poignée sur la plaque de départ). */
export function restartTask(s) {
  const mode = s.free ? s.free.mode : s.fixedMode ? taskOf(s).mode : s.mode;
  return reset({ ...s, mode, free: s.free ? { ...s.free, done: false } : null });
}

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────────────────────────────────────── */
export function validateFree({ from, to, mode }) {
  if (!MODES.includes(mode)) return { ok: false, why: 'mode' };
  if (!UNITS[mode].includes(from) || !UNITS[mode].includes(to)) return { ok: false, why: 'unit' };
  if (from === to) return { ok: false, why: 'same' };
  if (Math.abs(bandOf(from, to, mode)) > K_MAX) return { ok: false, why: 'range' };
  return { ok: true };
}
export function setFree(s, spec) {
  const v = validateFree(spec);
  if (!v.ok) return s;
  const task = Object.freeze({ id: 'free', path: Object.freeze([spec.from, spec.to]), mode: spec.mode, total: bandOf(spec.from, spec.to, spec.mode), predict: null, free: true, done: false });
  return log(reset({ ...s, free: task, mode: spec.mode }), { kind: 'custom', from: spec.from, to: spec.to, mode: spec.mode });
}
export function toGuided(s) {
  return reset({ ...s, free: null, mode: s.fixedMode ? s.tasks[s.ti].mode : 1 });
}

/* ── Découverte et onboarding ────────────────────────────────────────────────────────────────────────────────────────────────── */
export const discoveryKind = (s) => (!s.free && s.discovery && allDone(s) ? s.discovery : null);
export const discoveryReady = (s) => discoveryKind(s) !== null;

/** L'étape du guide : fonction pure de l'état ; elle ne nomme jamais un nombre de colonnes ni une règle. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-ul-next]', gesture: 'tap' } : { id: 'free', target: '[data-ul-free]', gesture: 'type' };
  if (predictionPending(s)) return { id: 'predict', target: '[data-ul-predict-card]', gesture: 'tap', prefer: 'below' };
  if (!s.fixedMode && !s.modeTouched && !modeOk(s)) return { id: 'mode', target: '[data-ul-dial]', gesture: 'tap', prefer: 'below' };
  if (s.moves === 0) return { id: 'handle', target: '[data-ul-handle]', gesture: 'drag', prefer: 'below' };
  if (s.moves === 1) return { id: 'readout', target: '[data-ul-readout]', gesture: 'look', prefer: 'below' };
  return { id: 'dock', target: '[data-ul-dock]', gesture: 'tap', prefer: 'above' };
}

/** « أعِد التجربة » (questions pendant le labo) : la MÊME tâche repart ET son drapeau « fait » tombe — sinon l'étape resterait verte et la carte de questions ne se rouvrirait pas. */
export function retryTask(s) {
  const n = restartTask(s);
  return s.free ? n : { ...n, done: n.done.map((d, i) => (i === s.ti ? false : d)) };
}
