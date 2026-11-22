/**
 * window-blinds — LA LOGIQUE PURE de « ستائر النافذة » (2AM, unité 2 « الكسور والعمليات عليها », درس « جداء كسرين », 2026-10-29).
 * Exacte : les nombres sont des entiers (crans du rail, crans du cordon) ; les maths viennent de `packages/core/arithmetic/fractions2.js` (E3, importé PAR CHEMIN).
 *
 * LE MODÈLE. Un mur de vitres W × H fenêtres (une fenêtre = 1). Le rideau latéral glisse sur un rail à b crans PAR fenêtre : tiré de `ca` crans, il couvre `ca/b` fenêtre de LARGEUR ;
 * le store à enrouleur descend d'un cordon à d crans PAR fenêtre : baissé de `cc` crans, il couvre `cc/d` fenêtre de HAUTEUR. Le verre couvert par les DEUX est le coin doublement ombré :
 * son aire est (ca/b) × (cc/d) fenêtre — le produit. Les deux ombres découpent le verre en (b·W) × (d·H) petits carrés ; le coin sombre en compte ca × cc.
 * La MAIN tient les deux facteurs (deux tirages perpendiculaires). « ماذا أُظلم؟ » vérifie les deux tirages ; l'élève ÉCRIT alors la fraction de fenêtre doublement ombrée : toute écriture ÉGALE
 * est acceptée ; les écritures fausses typiques sont refusées avec leur MODÈLE et DESSINÉES (un cadre en pointillé de cette AIRE à côté du coin sombre réel).
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'pull', task, which:'curtain'|'blind', value, ok, free }      { kind:'product', task, value, ok, model, free }      { kind:'predict', task, value, ok, model, free }
 *   { kind:'solved', task, free }                                         { kind:'custom', free:true, a, b, c, d }
 */
import * as F from '@smarter-academy/core/arithmetic/fractions2.js';

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'w1', curtain: '2/3', blind: '3/4', W: 1, H: 1 },
    { id: 'w2', curtain: '1/2', blind: '3/5', W: 1, H: 1 },
    { id: 'w3', curtain: '4/5', blind: '2/3', W: 1, H: 1 },
  ] },
  advanced: { tasks: [
    { id: 'a1', curtain: '3/2', blind: '2/3', W: 2, H: 1, predict: true },
    { id: 'a2', curtain: '5/4', blind: '3/5', W: 2, H: 1, predict: true },
    { id: 'a3', curtain: '7/4', blind: '4/3', W: 2, H: 2, predict: true },
    { id: 'a4', curtain: '2/1', blind: '3/5', W: 2, H: 1, predict: true },
  ] },
});

const gcd = (a, b) => { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
const arabicToLatin = (v) => String(v ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[⁦⁩\s]/g, '').replace(/[−–]/g, '-').replace('⁄', '/');
/** « 6/12 », « ٦/١٢ », « 1 » → { num, den } ou null (jamais un signe, jamais un décimal). */
function parseWriting(txt) {
  const m = /^(\d{1,4})(?:\/(\d{1,4}))?$/.exec(arabicToLatin(txt));
  if (!m) return null;
  const den = m[2] ? Number(m[2]) : 1;
  return den === 0 ? null : { num: Number(m[1]), den };
}
const sameValue = (a, b) => a.num * b.den === b.num * a.den;
const reduce = (f) => { const g = gcd(f.num, f.den); return { num: f.num / g, den: f.den / g }; };

/* ── Tâches ──────────────────────────────────────────────────────────────────────────────────── */

const frac = (txt) => { const m = /^(\d+)\/(\d+)$/.exec(String(txt)); if (!m) throw new Error(`windowBlinds: fraction illisible « ${txt} »`); return { num: Number(m[1]), den: Number(m[2]) }; };

export function buildTask(rawTask, i = 0) {
  const { num: a, den: b } = frac(rawTask.curtain);
  const { num: c, den: d } = frac(rawTask.blind);
  const W = Number(rawTask.W ?? 1); const H = Number(rawTask.H ?? 1);
  if (b < 1 || b > 8 || d < 2 || d > 8) throw new Error(`windowBlinds: crans hors 1…8 ${JSON.stringify(rawTask)}`);
  if (W < 1 || W > 2 || H < 1 || H > 2) throw new Error('windowBlinds: mur de 1 à 2 fenêtres par côté');
  if (a < 1 || c < 1 || a > b * W || c > d * H) throw new Error(`windowBlinds: tirage hors du mur ${JSON.stringify(rawTask)}`);
  const grid = F.productGrid(`${a}/${b}`, `${c}/${d}`);
  return Object.freeze({
    id: rawTask.id ?? `t${i}`, a, b, c, d, W, H, cols: b * W, rows: d * H, predict: !!rawTask.predict,
    num: a * c, den: b * d, reduced: reduce({ num: a * c, den: b * d }), dark: a * c, total: b * d,
    natural: b === 1, grid,
  });
}
function initW(task) { return { ca: 0, cc: 0, phase: task.predict ? 'predict' : 'pull', touched: { c: false, b: false }, miss: null, checked: false, predicted: false }; }
function fresh(tasks, extra = {}) { return { tasks, ti: 0, w: initW(tasks[0]), done: {}, trials: [], last: null, free: null, flag: null, ...extra }; }
export function init(numbers = {}) { return fresh((numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask)); }

export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => (s.free ? !!s.free.done : !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
/** Les deux tirages sont verrouillés tant que le produit n'est pas écrit (متقدم), puis une fois la tâche faite. */
export const pullLocked = (s) => s.w.phase === 'predict' || s.w.phase === 'write' || s.w.phase === 'done';
/** Les guides (b verticales et d horizontales) n'apparaissent QU'après la vérification des deux tirages. */
export const linesShown = (s) => !!s.w.checked;
const writing = (s) => s.w.phase === 'predict' || s.w.phase === 'write';


/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

export function setCurtain(s, v) {
  if (pullLocked(s)) return s;
  const t = taskOf(s); const ca = Math.max(0, Math.min(t.cols, Math.round(v)));
  return ca === s.w.ca ? s : { ...s, w: { ...s.w, ca, touched: { ...s.w.touched, c: true }, miss: null }, last: null };
}
export function setBlind(s, v) {
  if (pullLocked(s)) return s;
  const t = taskOf(s); const cc = Math.max(0, Math.min(t.rows, Math.round(v)));
  return cc === s.w.cc ? s : { ...s, w: { ...s.w, cc, touched: { ...s.w.touched, b: true }, miss: null }, last: null };
}
export const nudgeCurtain = (s, d) => setCurtain(s, s.w.ca + d);
export const nudgeBlind = (s, d) => setBlind(s, s.w.cc + d);

function solve(s) {
  const sv = Object.freeze({ kind: 'solved', task: s.free ? -1 : s.ti, free: !!s.free });
  return { ...s, trials: [...s.trials, sv], ...(s.free ? { free: { ...s.free, done: true } } : { done: { ...s.done, [s.ti]: true } }) };
}

/** « ماذا أُظلم؟ » : les deux tirages sont vérifiés contre la tâche. */
export function ask(s) {
  if (s.w.phase !== 'pull') return s;
  const t = taskOf(s);
  const okC = s.w.ca === t.a; const okB = s.w.cc === t.c;
  const id = s.free ? -1 : s.ti;
  const evs = [
    Object.freeze({ kind: 'pull', task: id, which: 'curtain', value: s.w.ca, ok: okC, free: !!s.free }),
    Object.freeze({ kind: 'pull', task: id, which: 'blind', value: s.w.cc, ok: okB, free: !!s.free }),
  ];
  const next = { ...s, last: evs[1], trials: [...s.trials, ...evs] };
  if (!(okC && okB)) return { ...next, w: { ...s.w, miss: { curtain: okC ? null : s.w.ca < t.a ? 'short' : 'long', blind: okB ? null : s.w.cc < t.c ? 'short' : 'long' } } };
  const w = { ...s.w, miss: null, checked: true };
  if (t.predict) return solve({ ...next, w: { ...w, phase: 'done' } });
  return { ...next, w: { ...w, phase: 'write' } };
}

/** Juge une écriture : { ok, model, value, bigger }. `value` : l'AIRE écrite, en fenêtres (pour dessiner le cadre). */
export function judgeProduct(task, text) {
  const w = parseWriting(text);
  if (!w) return { ok: false, model: 'other', unreadable: true, value: null };
  const val = w.num / w.den;
  if (sameValue(w, { num: task.num, den: task.den })) return { ok: true, model: 'right', value: val };
  const { a, b, c, d } = task;
  const wrongs = [
    ['sum', { num: a * d + c * b, den: b * d }],
    ['sameDen', { num: a * c, den: b + d }],
    ['cross', { num: a * d, den: b * c }],
    ['oneFactor', { num: a, den: b }],
    ['count', { num: a * c, den: 1 }],
  ];
  const hit = wrongs.find(([, f]) => sameValue(w, f));
  return { ok: false, model: hit ? hit[0] : 'other', value: val, bigger: val > task.num / task.den };
}

export function write(s, text) {
  const t = taskOf(s);
  if (!writing(s)) return s;
  const j = judgeProduct(t, text);
  const predicting = s.w.phase === 'predict';
  const trial = Object.freeze({ kind: predicting ? 'predict' : 'product', task: s.free ? -1 : s.ti, value: String(text).trim(), ok: j.ok, model: j.model, bigger: j.bigger ?? null, free: !!s.free });
  const next = { ...s, last: trial, trials: [...s.trials, trial], flag: j.ok || j.value == null ? null : { value: j.value, model: j.model, text: String(text).trim() } };
  if (!j.ok) return next;
  if (predicting) return { ...next, w: { ...s.w, phase: 'pull', predicted: true }, flag: null };
  return solve({ ...next, w: { ...s.w, phase: 'done' }, flag: null });
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, w: initW(s.tasks[ti]), last: null, flag: null };
}
export const restartTask = (s) => ({ ...s, w: initW(taskOf(s)), last: null, flag: null, ...(s.free ? { free: { ...s.free, done: false } } : { done: { ...s.done, [s.ti]: false } }) });

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

/** a/b × c/d, b et d de 2 à 8, a ≤ 2b, c ≤ 2d. */
export function freeCheck(aT, bT, cT, dT) {
  const nat = (v) => { const r = arabicToLatin(v); return /^\d{1,2}$/.test(r) ? Number(r) : null; };
  const a = nat(aT); const b = nat(bT); const c = nat(cT); const d = nat(dT);
  if ([a, b, c, d].some((v) => v == null)) return { ok: false, why: 'incomplete' };
  if (b < 2 || b > 8 || d < 2 || d > 8 || a < 1 || c < 1) return { ok: false, why: 'range' };
  if (a > 2 * b || c > 2 * d) return { ok: false, why: 'tooBig' };
  return { ok: true, a, b, c, d, W: a > b ? 2 : 1, H: c > d ? 2 : 1 };
}
export function freeTask(s, aT, bT, cT, dT) {
  const r = freeCheck(aT, bT, cT, dT);
  if (!r.ok) return s;
  const task = buildTask({ id: 'free', curtain: `${r.a}/${r.b}`, blind: `${r.c}/${r.d}`, W: r.W, H: r.H }, 0);
  const custom = Object.freeze({ kind: 'custom', free: true, a: r.a, b: r.b, c: r.c, d: r.d });
  return { ...s, free: { task, done: false }, w: initW(task), last: null, flag: null, trials: [...s.trials, custom] };
}
/** Une prédiction libre : dessine seulement le cadre (jamais un verdict). */
export function freeFlag(s, text) {
  const w = parseWriting(text);
  if (!w) return { ...s, flag: null };
  return { ...s, flag: { value: w.num / w.den, model: 'free', text: String(text).trim() } };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, w: initW(s.tasks[s.ti]), last: null, flag: null } : s);

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/** Le prochain geste utile — jamais la réponse. */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-wb-next]', gesture: 'tap' } : null;
  const t = taskOf(s);
  if (s.w.phase === 'predict') return { id: 'predict', target: '[data-wb-write]', gesture: 'tap' };
  if (s.w.phase === 'write') return { id: s.w.checked && guidedTrials(s).filter((x) => x.kind === 'product').length === 0 ? 'lines' : 'write', target: '[data-wb-write]', gesture: 'tap' };
  if (!s.w.touched.c && s.ti === 0 && guidedTrials(s).length === 0) return { id: 'curtain', target: '[data-wb-curtain]', gesture: 'drag' };
  if (s.w.ca === t.a && !s.w.touched.b) return { id: 'blind', target: '[data-wb-blind]', gesture: 'drag' };
  if (s.w.ca === t.a && s.w.cc === t.c) return { id: 'ask', target: '[data-wb-ask]', gesture: 'tap' };
  return null;
}
