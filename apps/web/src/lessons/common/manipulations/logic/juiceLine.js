/**
 * juice-line — LA LOGIQUE PURE de « خطّ العصير » (2AM, unité 4 « مفهوم معادلة », درس « حلّ مشكل باستعمال معادلة », 2026-10-29).
 *
 * LE MODÈLE. Une coopérative d'oranges remplit des bouteilles depuis un RÉSERVOIR. Tout est en CENTILITRES ENTIERS (jamais de flottant) :
 * `fill(content, size, order)` remplit les bouteilles une à une jusqu'à la commande `order` ; si le réservoir se vide avant, la dernière
 * bouteille est PARTIELLE ; s'il en reste après la commande, le jus RESTE dans le réservoir. C'est cette réponse du dessin qui dit ce que
 * l'équation dit : `order` bouteilles de `x` litres font `total` litres, donc `order × x = total` (ou `total ÷ x = order`).
 * Les maths de l'inconnue viennent de `packages/core/arithmetic/equation2.js` (E2, importé PAR CHEMIN).
 *
 * TÂCHE : { id, kind: 'mould' | 'tank', total?, bottles, size?, carry?, tests }.
 *   'mould' (مبتدئ) : la main tient la CAPACITÉ x du moule (0,05 … 2 L, pas 0,05) ; le réservoir `total` L et la commande `bottles`.
 *       phases : 'test' (deux essais) → 'slate' (écrire l'opération) → 'cards' (choisir TOUTES les bonnes équations) → 'done'.
 *   'tank' (متقدم) : la main tient le contenu du RÉSERVOIR (0 … 30 L, pas 0,5) ; la bouteille `size` L, la commande `bottles`, `carry` L déjà dans le
 *       réservoir (la main tient alors ce qu'on y presse en plus). phases : 'slate' (prédire d'abord) → 'set' (régler le réservoir et remplir) → 'done'.
 *
 * ÉVÉNEMENTS (`state.trials`) : { kind:'fill', task, x, full, left, partial, test, free } · { kind:'operation', task, text, ok, model, stage, free } ·
 * { kind:'cards', task, picked, ok } · { kind:'solved', task, free } · { kind:'custom', free:true }.
 */
import { parseRat, rat, mul, div, add, sub, eq, sign } from '@smarter-academy/core/arithmetic/powers.js';
import { solveForm } from '@smarter-academy/core/arithmetic/equation2.js';

export const MOULD_MIN = 5;      // cl
export const MOULD_MAX = 200;    // cl
const MOULD_STEP = 5;     // 0,05 L
export const TANK_MAX = 3000;    // cl = 30 L
const TANK_STEP = 50;     // 0,5 L
export const SHOWN_BOTTLES = 12;

const toRat = (v) => (typeof v === 'number' ? rat(Math.round(v * 100), 100) : parseRat(v));
const cl = (litres) => { const r = mul(toRat(litres), rat(100)); if (r.d !== 1n) throw new Error('juiceLine: pas un nombre entier de centilitres'); return Number(r.n); };
/** Centilitres → texte « 1,5 » (virgule algérienne), sans zéros inutiles. */
export function lText(c) {
  const neg = c < 0; const a = Math.abs(c);
  const i = Math.floor(a / 100); const f = String(a % 100).padStart(2, '0').replace(/0+$/, '');
  return `${neg ? '−' : ''}${i}${f ? `,${f}` : ''}`;
}

/* ── Le remplissage, exact ───────────────────────────────────────────────────────────────────── */

/** → { full, partial, left, short } ; `partial` = centilitres dans la bouteille suivante (0 si aucune), `left` = jus resté dans le réservoir. */
export function fill(content, size, order) {
  if (size <= 0) return { full: 0, partial: 0, left: content, short: order };
  const f = Math.floor(content / size);
  if (f >= order) return { full: order, partial: 0, left: content - order * size, short: 0 };
  return { full: f, partial: content - f * size, left: 0, short: order - f - (content - f * size > 0 ? 1 : 0) };
}
/** 'exact' (la commande, pas une goutte de reste) | 'leftover' (la commande est servie mais il reste du jus) | 'short' (il manque des bouteilles). */
export const verdictOf = (f) => (f.full > 0 && f.short === 0 && f.partial === 0 && f.left === 0 ? 'exact' : f.left > 0 ? 'leftover' : 'short');

/* ── Tâches ──────────────────────────────────────────────────────────────────────────────────── */

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 't1', kind: 'mould', total: 18, bottles: 12, tests: 2 },
    { id: 't2', kind: 'mould', total: 30, bottles: 40, tests: 2 },
    { id: 't3', kind: 'mould', total: 9, bottles: 36, tests: 2 },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'tank', bottles: 24, size: 0.25 },
    { id: 'a2', kind: 'tank', bottles: 15, size: 1.5 },
    { id: 'a3', kind: 'tank', bottles: 40, size: 0.25, carry: 4 },
  ] },
});

export function buildTask(raw, i = 0) {
  const kind = raw.kind ?? 'mould';
  const bottles = raw.bottles;
  if (!Number.isInteger(bottles) || bottles < 1 || bottles > 99) throw new Error('juiceLine: bottles');
  if (kind === 'mould') {
    const total = cl(raw.total);
    if (total % bottles !== 0 || (total / bottles) % MOULD_STEP !== 0) throw new Error('juiceLine: la capacité cherchée doit tomber sur la graduation 0,05 L');
    const x = total / bottles;
    if (x < MOULD_MIN || x > MOULD_MAX) throw new Error('juiceLine: capacité hors du moule');
    return Object.freeze({ id: raw.id ?? `t${i}`, kind, total, bottles, tests: raw.tests ?? 2, answer: x, size: null, carry: 0, content: total });
  }
  const size = cl(raw.size); const carry = cl(raw.carry ?? 0);
  const content = size * bottles;
  const press = content - carry;
  if (press < 0 || press > TANK_MAX || press % TANK_STEP !== 0) throw new Error('juiceLine: le réservoir doit se régler au pas de 0,5 L');
  return Object.freeze({ id: raw.id ?? `a${i}`, kind, total: null, bottles, tests: 0, answer: press, size, carry, content });
}

const initW = (task) => ({
  phase: task.kind === 'mould' ? 'test' : 'slate', stage: task.carry ? 'total' : 'final',
  x: task.kind === 'mould' ? 100 : 0,          // la capacité du moule (cl) ; en mode 'tank' : ce qu'on presse (cl)
  testsLeft: task.tests, fills: 0, lastFill: null, miss: null, picked: [], answered: null, totalOk: null, denied: false,
});
const fresh = (tasks, extra = {}) => ({ tasks, ti: 0, w: initW(tasks[0]), done: {}, trials: [], last: null, flag: null, free: null, ...extra });
export function init(numbers = {}) { return fresh((numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask)); }

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);

const rec = (s, ev) => ({ ...s, trials: [...s.trials, Object.freeze(ev)] });
const tid = (s) => (s.free ? -1 : s.ti);

/** Ce que le réservoir contient et la taille de la bouteille, pour l'état courant (tâche guidée). */
function setup(s) {
  const t = taskOf(s);
  return t.kind === 'mould' ? { content: t.total, size: s.w.x } : { content: t.carry + s.w.x, size: t.size };
}
export const currentFill = (s) => { const t = taskOf(s); const u = setup(s); return fill(u.content, u.size, t.bottles); };

/* ── Gestes : la main ────────────────────────────────────────────────────────────────────────── */

export function stretch(s, value) {
  const t = taskOf(s);
  if (s.free) return setFree(s, { x: value });
  const ok = (t.kind === 'mould' && s.w.phase === 'test') || (t.kind === 'tank' && s.w.phase === 'set');
  if (!ok) return s;
  const step = t.kind === 'mould' ? MOULD_STEP : TANK_STEP;
  const max = t.kind === 'mould' ? MOULD_MAX : TANK_MAX - t.carry;
  const min = t.kind === 'mould' ? MOULD_MIN : 0;
  const v = Math.max(min, Math.min(max, Math.round(value / step) * step));
  return v === s.w.x ? s : { ...s, w: { ...s.w, x: v, lastFill: null, miss: null, denied: false }, last: null, flag: null };
}
export const bump = (s, d) => { const t = taskOf(s); const step = t.kind === 'mould' && !s.free ? MOULD_STEP : s.free ? MOULD_STEP : TANK_STEP; return stretch(s, (s.free ? s.free.x : s.w.x) + d * step); };

/** « املأ » : un essai (مبتدئ, deux seulement) ou le remplissage de contrôle (متقدم). */
export function pressFill(s) {
  if (s.free) return freeFill(s);
  const t = taskOf(s);
  const ph = s.w.phase;
  if (t.kind === 'mould') {
    if (ph !== 'test') return s;
    if (s.w.testsLeft <= 0) return { ...s, w: { ...s.w, denied: true }, last: Object.freeze({ kind: 'denied' }), flag: null };
    const f = currentFill(s);
    const left = s.w.testsLeft - 1;
    let next = rec({ ...s, last: Object.freeze({ kind: 'fill', ...f }), flag: null }, { kind: 'fill', task: s.ti, x: s.w.x, full: f.full, left: f.left, partial: f.partial, test: true, free: false });
    next = { ...next, w: { ...s.w, testsLeft: left, fills: s.w.fills + 1, lastFill: f, denied: false, phase: left <= 0 ? 'slate' : 'test' } };
    return next;
  }
  if (ph !== 'set') return s;
  const f = currentFill(s);
  let next = rec({ ...s, last: Object.freeze({ kind: 'fill', ...f }), flag: null }, { kind: 'fill', task: s.ti, x: s.w.x, full: f.full, left: f.left, partial: f.partial, test: false, free: false });
  next = { ...next, w: { ...s.w, fills: s.w.fills + 1, lastFill: f } };
  return verdictOf(f) === 'exact' ? solve(next) : { ...next, w: { ...next.w, miss: { fill: f } } };
}
/** Le bouton « اكتب العملية » : après un essai au moins. */
export function openSlate(s) {
  if (s.free || taskOf(s).kind !== 'mould' || s.w.phase !== 'test' || s.w.fills < 1) return s;
  return { ...s, w: { ...s.w, phase: 'slate' } };
}

/* ── L'ardoise : l'opération (ou le nombre) tapée, jugée sur le DESSIN ───────────────────────────── */

const ARABIC = '٠١٢٣٤٥٦٧٨٩';
const normalize = (txt) => String(txt).replace(/[٠-٩]/g, (d) => String(ARABIC.indexOf(d))).replace(/\s+/g, '').replace(/[,،]/g, '.').replace(/[×·*]/g, '*').replace(/[÷:]/g, '/').replace(/[−–]/g, '-');
/** Lit « 1,5 », « 18÷12 », « 12*x » refusé… : un nombre ou UNE opération entre deux nombres. → rationnel ou null. */
function readValue(text) {
  const t = normalize(text);
  if (!t) return null;
  try {
    let m = /^(\d+(?:\.\d+)?)([*/+-])(\d+(?:\.\d+)?)$/.exec(t);
    if (m) {
      const a = parseRat(m[1]); const b = parseRat(m[3]);
      if (m[2] === '*') return mul(a, b);
      if (m[2] === '/') return b.n === 0n ? null : div(a, b);
      if (m[2] === '+') return add(a, b);
      return sub(a, b);
    }
    m = /^\d+(?:\.\d+)?$/.exec(t);
    return m ? parseRat(t) : null;
  } catch { return null; }
}
const litres = (c) => rat(c, 100);
const clOf = (r) => { const v = mul(r, rat(100)); return Number(v.n) / Number(v.d); };

/** Les modèles faux, recalculés depuis les nombres de la tâche. */
function modelOf(task, stage, value) {
  const N = rat(task.bottles);
  if (task.kind === 'mould') {
    const T = litres(task.total);
    if (eq(value, solveForm({ form: 'under', a: T, b: N }).x)) return 'right';
    if (eq(value, mul(T, N))) return 'mult';
    if (eq(value, div(N, T))) return 'flip';
    if (eq(value, sub(T, N))) return 'sub';
    if (eq(value, add(T, N))) return 'add';
    return 'other';
  }
  const S = litres(task.size); const C = litres(task.carry);
  const total = solveForm({ form: 'over', a: N, b: S }).x;           // x ÷ 24 = 0,25 → x = 24 × 0,25
  if (stage === 'total' || !task.carry) {
    if (eq(value, total)) return 'right';
    if (eq(value, div(N, S))) return 'divide';
    if (eq(value, div(S, N))) return 'flip';
    if (eq(value, sub(N, S))) return 'sub';
    if (eq(value, add(N, S))) return 'add';
    return 'other';
  }
  const press = sub(total, C);
  if (eq(value, press)) return 'right';
  if (eq(value, mul(sub(N, C), S))) return 'undoFirst';
  if (eq(value, add(total, C))) return 'addCarry';
  return 'other';
}

/** Juge `text` pour l'état courant. → { ok, model, value, unreadable }. */
function judgeX(s, text) {
  const t = taskOf(s);
  const value = readValue(text);
  if (value == null || sign(value) <= 0) return { ok: false, model: 'other', value: null, unreadable: true };
  const model = modelOf(t, s.w.stage, value);
  return { ok: model === 'right', model, value };
}

/** Écrit l'opération. مبتدئ : juste → le moule se règle, le remplissage de contrôle s'affiche, puis les cartes. متقدم : juste → on règle le réservoir. */
export function writeOperation(s, text) {
  const t = taskOf(s);
  if (s.free || s.w.phase !== 'slate') return s;
  const j = judgeX(s, text);
  const ev = { kind: 'operation', task: s.ti, text: String(text).trim(), ok: j.ok, model: j.model, stage: s.w.stage, free: false };
  const next = rec({ ...s, last: Object.freeze(ev), flag: j }, ev);
  if (!j.ok) {
    // le DESSIN de la valeur refusée : remplie à la graduation la plus proche (مبتدئ) ou réglée dans le réservoir (متقدم)
    if (j.unreadable) return { ...next, w: { ...s.w, miss: j } };
    if (t.kind === 'mould') {
      const x = Math.max(MOULD_MIN, Math.min(MOULD_MAX, Math.round(clOf(j.value) / MOULD_STEP) * MOULD_STEP));
      const f = fill(t.total, x, t.bottles);
      return { ...next, w: { ...s.w, x, lastFill: f, miss: { ...j, x, fill: f } } };
    }
    const v = clOf(j.value);
    const extra = s.w.stage === 'final' && t.carry ? t.carry : 0;
    const content = Math.min(TANK_MAX, Math.round(v / TANK_STEP) * TANK_STEP + extra);
    const f = fill(content, t.size, t.bottles);
    return { ...next, w: { ...s.w, miss: { ...j, content, fill: f, over: v > TANK_MAX } } };
  }
  if (t.kind === 'mould') {
    const f = fill(t.total, t.answer, t.bottles);
    const ev2 = { kind: 'fill', task: s.ti, x: t.answer, full: f.full, left: f.left, partial: f.partial, test: false, free: false };
    const filled = rec({ ...next, last: Object.freeze({ kind: 'fill', ...f }), flag: j }, ev2);
    return { ...filled, w: { ...s.w, x: t.answer, lastFill: f, phase: 'cards', miss: null } };
  }
  if (s.w.stage === 'total') return { ...next, w: { ...s.w, stage: 'final', totalOk: true, miss: null } };
  return { ...next, w: { ...s.w, phase: 'set', miss: null, answered: true } };
}

/* ── Les cartes : TOUTES les bonnes équations ────────────────────────────────────────────────── */

/** Les quatre cartes de la tâche `mould` (deux justes, deux fausses) : { id, tex, right }. */
export function cardsOf(task) {
  if (task.kind !== 'mould') return [];
  const T = lText(task.total); const N = String(task.bottles);
  return [
    { id: 'times', tex: `${N}\\times x=${T}`, right: true },
    { id: 'under', tex: `\\dfrac{${T}}{x}=${N}`, right: true },
    { id: 'swap', tex: `${T}\\times x=${N}`, right: false, model: 'SWAP' },
    { id: 'role', tex: `\\dfrac{x}{${N}}=${T}`, right: false, model: 'ROLE' },
  ];
}
export function toggleCard(s, id) {
  if (s.w.phase !== 'cards') return s;
  const has = s.w.picked.includes(id);
  return { ...s, w: { ...s.w, picked: has ? s.w.picked.filter((c) => c !== id) : [...s.w.picked, id], miss: null }, last: null, flag: null };
}
export function judgeCards(task, picked) {
  const cards = cardsOf(task);
  const right = cards.filter((c) => c.right).map((c) => c.id);
  const ok = right.every((id) => picked.includes(id)) && picked.every((id) => right.includes(id));
  const wrong = cards.find((c) => !c.right && picked.includes(c.id));
  return { ok, wrong: wrong ? wrong.id : null, missing: right.filter((id) => !picked.includes(id)) };
}
export function checkCards(s) {
  const t = taskOf(s);
  if (s.w.phase !== 'cards') return s;
  const j = judgeCards(t, s.w.picked);
  const ev = { kind: 'cards', task: s.ti, picked: [...s.w.picked].sort(), ok: j.ok, free: false };
  const next = rec({ ...s, last: Object.freeze(ev), flag: { cards: j } }, ev);
  return j.ok ? solve(next) : { ...next, w: { ...s.w, miss: { cards: j } } };
}

function solve(s) {
  const sv = Object.freeze({ kind: 'solved', task: tid(s), free: false });
  return { ...s, w: { ...s.w, phase: 'done', miss: null }, trials: [...s.trials, sv], done: { ...s.done, [s.ti]: true } };
}
export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, w: initW(s.tasks[ti]), last: null, flag: null };
}
export const restartTask = (s) => ({ ...s, w: initW(taskOf(s)), last: null, flag: null, done: { ...s.done, [s.ti]: false } });

/* ── « جرّب أعدادك » : toujours ouvert, jamais compté ─────────────────────────────────────────── */

const FREE_TOTAL = { min: 50, max: 3000, step: 50 };
const FREE_ORDER = { min: 2, max: 60 };
export function freeTask(s) {
  const free = { total: 1800, bottles: 12, x: 150, lastFill: null };
  return { ...s, free, last: null, flag: null, trials: [...s.trials, Object.freeze({ kind: 'custom', free: true })] };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, last: null, flag: null } : s);
export function setFree(s, patch) {
  if (!s.free) return s;
  const c = (v, lo, hi, st) => Math.max(lo, Math.min(hi, Math.round(v / st) * st));
  const f = { ...s.free };
  if ('total' in patch) f.total = c(patch.total, FREE_TOTAL.min, FREE_TOTAL.max, FREE_TOTAL.step);
  if ('bottles' in patch) f.bottles = Math.max(FREE_ORDER.min, Math.min(FREE_ORDER.max, Math.round(patch.bottles)));
  if ('x' in patch) f.x = c(patch.x, MOULD_MIN, MOULD_MAX, MOULD_STEP);
  f.lastFill = null;
  return { ...s, free: f, last: null };
}
function freeFill(s) {
  const f = fill(s.free.total, s.free.x, s.free.bottles);
  return rec({ ...s, free: { ...s.free, lastFill: f }, last: Object.freeze({ kind: 'fill', ...f }) }, { kind: 'fill', task: -1, x: s.free.x, full: f.full, left: f.left, partial: f.partial, test: false, free: true });
}

export const trialEvidence = (tr) => ({ ...tr });
export const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/** Le prochain geste utile — jamais la réponse. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-jl-next]', gesture: 'tap' } : null;
  const t = taskOf(s); const ph = s.w.phase;
  if (t.kind === 'mould') {
    if (ph === 'test') {
      if (s.w.fills === 0 && s.ti === 0) return s.w.x === 100 ? { id: 'mould', target: '[data-jl-mould]', gesture: 'drag' } : { id: 'fill', target: '[data-jl-fill]', gesture: 'tap' };
      if (s.w.fills === 1 && s.ti === 0) return { id: 'leftover', target: '[data-jl-left]', gesture: 'tap' };
      return null;
    }
    if (ph === 'slate') return { id: 'slate', target: '[data-jl-slate]', gesture: 'tap' };
    if (ph === 'cards') return { id: 'cards', target: '[data-jl-cards]', gesture: 'tap' };
    return null;
  }
  if (ph === 'slate') return { id: 'slate', target: '[data-jl-slate]', gesture: 'tap' };
  if (ph === 'set') return s.w.fills === 0 ? { id: 'tank', target: '[data-jl-tank]', gesture: 'drag' } : null;
  return null;
}
