/**
 * La LOGIQUE du labo `frost-gauge` (« ميزان الصقيع », 1AM unité 5, درس « الأعداد النسبية وسياقات استعمالها », 2026-10-30) — pure, sans React.
 * L'arithmétique est entière et exacte (`packages/core/arithmetic/signedGauge.js`, importé PAR CHEMIN).
 *
 * Une TÂCHE : `{ id, scene: 'frost' | 'altitude' | 'floors', kind: 'set' | 'mirror' | 'pair', step, min, max, reads }`. La main tient le NIVEAU de la jauge
 * (une graduation = `step`) ; chaque LECTURE de la tâche est demandée en MOTS (le décor la dit : « 3 درجات تحت الصفر ») et se joue ainsi :
 *   `set`    reads = [5, -2, 0] : le niveau doit être posé sur cette valeur, puis ENREGISTRÉ ;
 *   `mirror` reads = [{ self: -4 }, { mirror: 3 }] : `self` pose le niveau, `mirror` demande que l'OMBRE du niveau (son opposé, de l'autre côté du 0)
 *            lise cette valeur ; l'ombre suit la main ;
 *   `pair`   reads = [{ dist: 6 }, { dist: 6 }] : deux niveaux DIFFÉRENTS à cette distance du zéro (le second doit être de l'autre côté).
 * Un niveau enregistré faux n'est jamais corrigé par le labo : il est jugé (`judgeRead`) et le modèle d'erreur (`swap`, `self`, `zero`, `off`, `dist`,
 * `same`, `other`) dit CE qui a été fait, avec les nombres de l'élève — jamais la bonne graduation.
 */
import * as G from '@smarter-academy/core/arithmetic/signedGauge.js';

const SCENES = Object.freeze(['frost', 'altitude', 'floors']);
const KINDS = Object.freeze(['set', 'mirror', 'pair']);

const FREE_GAUGE = G.gauge({ step: 1, min: -10, max: 10 });
const FREE_LIMIT = 10;

const bad = (m) => { throw new Error(`frost-gauge : ${m}`); };

/** Une lecture normalisée : `{ want: 'value' | 'mirror' | 'distance', v }` (v : valeur relative visée, ou distance pour `distance`). */
function normRead(r, g, kind) {
  let out;
  if (typeof r === 'number') out = { want: 'value', v: r };
  else if (r && typeof r.self === 'number') out = { want: 'value', v: r.self };
  else if (r && typeof r.mirror === 'number') out = { want: 'mirror', v: r.mirror };
  else if (r && typeof r.dist === 'number') out = { want: 'distance', v: r.dist };
  else bad(`lecture illisible ${JSON.stringify(r)}`);
  if (out.v % g.step !== 0) bad(`${out.v} n'est pas sur une graduation de pas ${g.step}`);
  if (out.want === 'distance') {
    if (out.v <= 0 || out.v > Math.min(g.max, -g.min)) bad('distance hors de la jauge');
    if (kind !== 'pair') bad('une lecture `dist` n\'existe que dans une tâche pair');
  } else {
    const level = out.want === 'mirror' ? -out.v : out.v;
    if (level < g.min || level > g.max || (out.want === 'mirror' && out.v < g.min)) bad(`${out.v} sort de la jauge`);
    if (kind === 'pair') bad('une tâche pair ne demande que des distances');
  }
  if (kind === 'mirror' && out.want === 'value' && typeof r === 'number') bad('une tâche mirror écrit { self } ou { mirror }');
  return out;
}

export function normalizeTasks(list) {
  return (list ?? []).map((t) => {
    if (!t || typeof t.id !== 'string') bad('tâche sans id');
    if (!SCENES.includes(t.scene)) bad(`décor inconnu : ${t.scene}`);
    if (!KINDS.includes(t.kind)) bad(`genre inconnu : ${t.kind}`);
    const g = G.gauge({ step: t.step, min: t.min, max: t.max });
    const reads = (t.reads ?? []).map((r) => normRead(r, g, t.kind));
    if (!reads.length) bad(`tâche ${t.id} sans lecture`);
    return Object.freeze({ id: t.id, scene: t.scene, kind: t.kind, step: g.step, min: g.min, max: g.max, g, reads: Object.freeze(reads), advanced: /^a\d/.test(t.id) });
  });
}

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'b1', scene: 'frost', kind: 'set', step: 1, min: -6, max: 6, reads: [5, -2, -3, 0, 2] },
    { id: 'b2', scene: 'altitude', kind: 'set', step: 10, min: -50, max: 50, reads: [-40, 30, 0] },
    { id: 'b3', scene: 'frost', kind: 'mirror', step: 1, min: -6, max: 6, reads: [{ self: -4 }, { mirror: 3 }, { self: 0 }] },
  ] },
  advanced: { tasks: [
    { id: 'a1', scene: 'frost', kind: 'pair', step: 2, min: -10, max: 10, reads: [{ dist: 6 }, { dist: 6 }] },
    { id: 'a2', scene: 'floors', kind: 'set', step: 1, min: -3, max: 6, reads: [-2, 5, 0] },
    { id: 'a3', scene: 'altitude', kind: 'set', step: 10, min: -50, max: 50, reads: [-30, 20] },
  ] },
});

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) bad('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null });
}

/** Le niveau de départ : au zéro, sauf si la première lecture le demande (on part alors d'une graduation voisine). */
function startGrad(task) {
  const first = task.reads[0];
  const target = first.want === 'value' ? first.v / task.step : first.want === 'mirror' ? -first.v / task.step : null;
  return target === 0 ? 1 : 0;
}
function fresh(s) {
  const t = s.tasks[s.ti];
  return { ...s, ri: 0, grad: startGrad(t), moved: false, log: [], last: null, refusal: null };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isAdvanced = (s) => s.tasks.some((t) => t.advanced);
export const gaugeOf = (s) => (s.free ? FREE_GAUGE : taskOf(s).g);
export const readOf = (s) => (s.free || taskDone(s) ? null : taskOf(s).reads[s.ri]);
/** Le nombre relatif que la main lit AU NIVEAU courant (le niveau vaut `grad × step`). */
export const levelValue = (s) => (s.free ? s.free.v : G.valueOf(gaugeOf(s), s.grad));
/** L'ombre du niveau (tâches `mirror`) : son opposé. */
export const shadowValue = (s) => G.opposite(levelValue(s));
export const showsShadow = (s) => !s.free && taskOf(s).kind === 'mirror';
export const showsDistance = (s) => !s.free && taskOf(s).kind !== 'set';

/* ── Le geste : la main tient le niveau ── */
export function setGrad(s, grad) {
  if (s.free || taskDone(s)) return s;
  const g = taskOf(s).g;
  const next = G.clampGrad(g, grad);
  return next === s.grad ? s : { ...s, grad: next, moved: true, last: s.last?.ok ? null : s.last };
}
export const gradBy = (s, n) => setGrad(s, s.grad + n);

/* ── Le jugement d'une lecture enregistrée ── */
/** `judgeRead(task, read, grad, prev)` → `{ ok, model }` ; `prev` : le niveau déjà enregistré pour la lecture précédente d'une tâche `pair`. */
export function judgeRead(task, read, grad, prev = null) {
  const { step } = task;
  if (read.want === 'distance') {
    if (Math.abs(grad) * step !== read.v) return { ok: false, model: 'dist' };
    if (prev !== null && grad === prev) return { ok: false, model: 'same' };
    return { ok: true, model: 'right' };
  }
  const target = (read.want === 'mirror' ? -read.v : read.v) / step;
  if (grad === target) return { ok: true, model: 'right' };
  if (read.want === 'mirror' && grad === read.v / step) return { ok: false, model: 'self' };
  if (target !== 0 && grad === -target) return { ok: false, model: 'swap' };
  if (grad === 0 && target !== 0) return { ok: false, model: 'zero' };
  if (Math.abs(grad - target) === 1) return { ok: false, model: 'off' };
  return { ok: false, model: 'other' };
}

export function record(s) {
  if (s.free || taskDone(s)) return s;
  const task = taskOf(s);
  const read = task.reads[s.ri];
  const prev = s.log.length ? s.log[s.log.length - 1].grad : null;
  const verdict = judgeRead(task, read, s.grad, task.kind === 'pair' ? prev : null);
  const value = G.valueOf(task.g, s.grad);
  const trial = Object.freeze({ kind: 'record', ok: verdict.ok, model: verdict.model, id: task.id, ri: s.ri, want: read.want, grad: s.grad, value });
  const trials = [...s.trials, trial];
  if (!verdict.ok) return { ...s, trials, last: trial };
  const log = [...s.log, { ri: s.ri, grad: s.grad, value }];
  const finished = s.ri === task.reads.length - 1;
  return { ...s, trials, log, last: trial, ri: finished ? s.ri : s.ri + 1, ...(finished ? { done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } } : {}) };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : un entier entre −10 et 10 sur la jauge libre ── */
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export function parseFree(raw) {
  const t = String(raw ?? '').replace(/[⁦⁩\s]/g, '').replace(/[−–]/g, '-').replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/^\+/, '');
  if (!/^-?\d{1,2}$/.test(t)) return null;
  const v = Number(t);
  return Math.abs(v) <= FREE_LIMIT ? v : null;
}
export function setFree(s, raw) {
  const v = parseFree(raw);
  if (v === null) return s;
  return { ...s, free: { v }, last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);
/** Ce que la jauge dit du nombre libre : de quel côté du zéro, à quelle distance, quel est son opposé. */
export function freeInfo(s) {
  if (!s.free) return null;
  const { v } = s.free;
  return { v, side: G.sideOf(v), distance: G.distance(v), opposite: G.opposite(v) };
}

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) : la pastille suit le geste utile MAINTENANT, jamais la réponse ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-fg-next]', gesture: 'tap', prefer: 'below' } : null;
  if (s.last && s.last.ok === false) return { id: 'again', target: '[data-fg-knob]', gesture: 'drag', prefer: 'above' };
  if (!s.moved && s.log.length === 0) return { id: 'knob', target: '[data-fg-knob]', gesture: 'drag', prefer: 'above' };
  return { id: 'record', target: '[data-fg-record]', gesture: 'tap', prefer: 'below' };
}
