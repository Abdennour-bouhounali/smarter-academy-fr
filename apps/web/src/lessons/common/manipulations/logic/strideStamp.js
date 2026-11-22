/**
 * La LOGIQUE du labo `stride-stamp` (« خطوة الطابع », 1AM unité 5, درس « التعليم على مستقيم مدرّج », 2026-10-30) — pure, sans React.
 * L'arithmétique est entière et exacte, en DIXIÈMES d'unité (`packages/core/arithmetic/graduatedLine.js`, importé PAR CHEMIN).
 *
 * Une TÂCHE : `{ id, kind: 'stamp' | 'twin' | 'place' | 'origin' | 'bound', … }`. La main tient UN objet sur une route de village (la station de bus est l'origine O) :
 *   `stamp`  { stride, reads: [{ at }] } le bâton-foulée est PORTÉ à partir de O dans les deux sens (`at` en unités) ; chaque tick déjà tamponné reste ; changer de foulée EFFACE les ticks ;
 *            la route est finie : une foulée trop longue ne rejoint pas la lecture demandée (« edge »). Lectures dites en MOTS (« 3 خطوات شرق المحطّة »).
 *   `twin`   { reads: [{ of }] } un premier bâtiment est posé à `of` (dixièmes) ; la main pose le JUMEAU là où la même foulée porte de l'autre côté de O.
 *   `place`  { reads: [{ x }] } la main pose un bâtiment à l'abscisse `x` (dixièmes) ; la pastille lit l'abscisse en direct (le signe n'apparaît qu'à l'OUEST de O).
 *   `origin` { n, u, marks: [{ i, v }, …] } deux graduations écrites ; la main pose le drapeau de l'origine sur le tick qui rend ces deux nombres vrais.
 *   `bound`  { reads: [{ x }] } un bâtiment est posé à `x` ; la main glisse un cadre d'UNE foulée entre deux ticks consécutifs pour l'encadrer.
 * Un enregistrement faux n'est jamais corrigé : il est jugé (`judge`) et le modèle d'erreur dit CE qui a été fait avec les nombres de l'élève, jamais la bonne position.
 */
import * as G from '@smarter-academy/core/arithmetic/graduatedLine.js';

const KINDS = Object.freeze(['stamp', 'twin', 'place', 'origin', 'bound']);
/** Les trois foulées (en unités d'écran) : courte, moyenne, longue. La route : 250 vers l'ouest, 450 vers l'est (mêmes constantes que l'art). */
export const STRIDES = Object.freeze([40, 60, 90]);
const ROAD = Object.freeze({ west: 250, east: 450 });
/** Le tracé figé des tâches qui ne choisissent pas la foulée : la moyenne. */
const FIXED_STRIDE = 1;
const PLACE_RANGE = 40;     // ±4 unités : la droite stampée d'avance
const FREE_LIMIT = 50;      // « جرّب أعدادك » : |x| ≤ 5

const bad = (m) => { throw new Error(`stride-stamp : ${m}`); };

/** Combien de foulées tiennent de chaque côté de O pour la foulée d'indice `si`. */
export const reach = (si) => ({ west: Math.floor(ROAD.west / STRIDES[si]), east: Math.floor(ROAD.east / STRIDES[si]) });

function normRead(task, r) {
  const k = task.kind;
  if (k === 'stamp') {
    if (!r || !Number.isInteger(r.at) || r.at === 0) bad(`lecture stamp illisible ${JSON.stringify(r)}`);
    const best = reach(0);
    if (r.at < -best.west || r.at > best.east) bad(`${r.at} sort de la route même avec la foulée courte`);
    return { at: r.at * G.TENTH };
  }
  if (k === 'twin') {
    if (!r || !Number.isInteger(r.of) || r.of === 0 || Math.abs(r.of) > PLACE_RANGE - G.TENTH + 10 || r.of % G.TENTH !== 0) bad(`lecture twin illisible ${JSON.stringify(r)}`);
    return { of: r.of };
  }
  if (k === 'place' || k === 'bound') {
    // `place` va de −4,0 à 4,0 (bornes comprises) ; `bound` reste strictement dans la droite (−4 < x < 4) et jamais sur un tick
    if (!r || !Number.isInteger(r.x) || Math.abs(r.x) > (k === 'place' ? PLACE_RANGE : PLACE_RANGE - 1)) bad(`lecture ${k} illisible ${JSON.stringify(r)}`);
    if (k === 'bound' && r.x % G.TENTH === 0) bad('un bâtiment à encadrer ne peut pas être sur un tick');
    return { x: r.x };
  }
  return r;
}

export function normalizeTasks(list) {
  return (list ?? []).map((t) => {
    if (!t || typeof t.id !== 'string') bad('tâche sans id');
    if (!KINDS.includes(t.kind)) bad(`genre inconnu : ${t.kind}`);
    let reads;
    let extra = {};
    if (t.kind === 'origin') {
      if (!Array.isArray(t.marks) || t.marks.length !== 2) bad('origin : deux graduations écrites');
      const u = t.u ?? 1;
      if (!Number.isInteger(u) || u <= 0) bad('origin : pas invalide');
      if (!G.marksAgree(t.marks, u)) bad('origin : les deux graduations ne donnent pas la même origine');
      const o = G.originIndex(t.marks[0], u);
      if (!(o > 0 && o < t.n) || t.marks.some((m) => m.i < 0 || m.i > t.n || m.i === o)) bad('origin : origine ou graduation hors de la droite');
      reads = [{ idx: o }];
      extra = { n: t.n, u, marks: t.marks.map((m) => ({ ...m })) };
    } else {
      reads = (t.reads ?? []).map((r) => normRead(t, r));
      if (!reads.length) bad(`tâche ${t.id} sans lecture`);
    }
    const stride = t.kind === 'stamp' ? (t.stride ?? 1) : FIXED_STRIDE;
    if (!STRIDES[stride]) bad(`foulée inconnue : ${t.stride}`);
    return Object.freeze({ id: t.id, kind: t.kind, stride, reads: Object.freeze(reads), advanced: /^a\d/.test(t.id), ...extra });
  });
}

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'b1', kind: 'stamp', stride: 2, reads: [{ at: 3 }, { at: -3 }] },
    { id: 'b2', kind: 'twin', reads: [{ of: -30 }, { of: 20 }] },
    { id: 'b3', kind: 'place', reads: [{ x: -30 }, { x: 27 }, { x: -15 }] },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'origin', n: 10, u: 1, marks: [{ i: 2, v: -3 }, { i: 8, v: 3 }] },
    { id: 'a2', kind: 'origin', n: 10, u: 2, marks: [{ i: 2, v: -8 }, { i: 5, v: -2 }] },
    { id: 'a3', kind: 'bound', reads: [{ x: -15 }, { x: 27 }, { x: -4 }] },
  ] },
});

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) bad('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null });
}

function fresh(s) {
  const t = s.tasks[s.ti];
  // la main part toujours de O (tick 0) — pour `origin`, du bout gauche de la droite : jamais la bonne réponse ni une graduation écrite
  return { ...s, ri: 0, pos: 0, stride: t.stride, stamped: { west: 0, east: 0 }, strideChanges: 0, moved: false, log: [], last: null };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isAdvanced = (s) => s.tasks.some((t) => t.advanced);
export const strideOf = (s) => STRIDES[s.stride];
export const reachOf = (s) => reach(s.stride);
/** L'unité de déplacement de la main : un tick pour stamp / twin / origin / bound, un dixième pour place. */
export const grainOf = (s) => (s.free || taskOf(s).kind === 'place' ? 1 : G.TENTH);

/** Les bornes de la main dans la tâche courante (dixièmes). */
export function limitsOf(s) {
  const t = taskOf(s);
  if (t.kind === 'stamp') { const r = reachOf(s); return { min: -r.west * G.TENTH, max: r.east * G.TENTH }; }
  if (t.kind === 'origin') return { min: 0, max: t.n * G.TENTH };
  if (t.kind === 'bound') return { min: -(PLACE_RANGE / G.TENTH) * G.TENTH, max: (PLACE_RANGE / G.TENTH - 1) * G.TENTH };
  return { min: -PLACE_RANGE, max: PLACE_RANGE };
}

/* ── Le geste : la main porte l'objet ── */
function stampedWith(s, pos) {
  const t = taskOf(s);
  if (t.kind !== 'stamp') return s.stamped;
  return { west: Math.max(s.stamped.west, Math.max(0, -pos / G.TENTH)), east: Math.max(s.stamped.east, Math.max(0, pos / G.TENTH)) };
}
export function setPos(s, pos) {
  if (s.free || taskDone(s)) return s;
  const { min, max } = limitsOf(s);
  const g = grainOf(s);
  const next = Math.max(min, Math.min(max, Math.round(pos / g) * g));
  if (next === s.pos) return s;
  return { ...s, pos: next, stamped: stampedWith(s, next), moved: true, last: s.last?.ok ? null : s.last };
}
export const moveBy = (s, n) => setPos(s, s.pos + n);

/** Change la foulée (`stamp` seulement) : TOUS les ticks déjà tamponnés sont effacés et le bâton revient en O. */
export function setStride(s, si) {
  if (s.free || taskDone(s) || taskOf(s).kind !== 'stamp' || !STRIDES[si] || si === s.stride) return s;
  return { ...s, stride: si, pos: 0, stamped: { west: 0, east: 0 }, strideChanges: s.strideChanges + 1, moved: true, last: null };
}

/* ── Le jugement d'un enregistrement ── */
/** `judge(task, read, pos, stride)` → `{ ok, model }`. Les modèles disent ce que l'élève a fait. */
export function judge(task, read, pos, stride = task.stride) {
  const T = G.TENTH;
  if (task.kind === 'stamp') {
    const target = read.at;
    const r = reach(stride);
    if (target < -r.west * T || target > r.east * T) return { ok: false, model: 'edge' };
    if (pos === target) return { ok: true, model: 'right' };
    if (pos === 0) return { ok: false, model: 'zero' };
    if (target !== 0 && pos === -target) return { ok: false, model: 'side' };
    if (Math.abs(pos - target) === T) return { ok: false, model: 'off' };
    return { ok: false, model: 'other' };
  }
  if (task.kind === 'twin') {
    const target = G.symmetric(read.of);
    if (pos === target) return { ok: true, model: 'right' };
    if (pos === read.of) return { ok: false, model: 'same' };
    if (pos === 0) return { ok: false, model: 'zero' };
    if (Math.abs(pos - target) === T) return { ok: false, model: 'off' };
    return { ok: false, model: 'other' };
  }
  if (task.kind === 'place') {
    const target = read.x;
    if (pos === target) return { ok: true, model: 'right' };
    if (pos === -target) return { ok: false, model: 'side' };
    if ((pos - target) % T === 0) return { ok: false, model: 'unit' };
    if (Math.abs(pos - target) < T) return { ok: false, model: 'tenth' };
    return { ok: false, model: 'other' };
  }
  if (task.kind === 'origin') {
    const idx = pos / T;
    if (idx === read.idx) return { ok: true, model: 'right' };
    if (task.marks.some((m) => m.i === idx)) return { ok: false, model: 'label' };
    if (Math.abs(idx - read.idx) === 1) return { ok: false, model: 'off' };
    return { ok: false, model: 'other' };
  }
  // bound : `pos` est le tick de gauche du cadre (dixièmes)
  const k = pos / T;
  const right = G.floorUnit(read.x);
  if (k === right) return { ok: true, model: 'right' };
  if (read.x < 0 && k === G.truncUnit(read.x)) return { ok: false, model: 'trunc' };
  if (Math.abs(k - right) === 1) return { ok: false, model: 'near' };
  return { ok: false, model: 'other' };
}

export function record(s) {
  if (s.free || taskDone(s)) return s;
  const task = taskOf(s);
  const read = task.reads[s.ri];
  const verdict = judge(task, read, s.pos, s.stride);
  const trial = Object.freeze({ kind: 'record', ok: verdict.ok, model: verdict.model, id: task.id, ri: s.ri, pos: s.pos, stride: s.stride, bad: verdict.ok ? 0 : 1 });
  const trials = [...s.trials, trial];
  if (!verdict.ok) return { ...s, trials, last: trial };
  const log = [...s.log, { ri: s.ri, pos: s.pos }];
  const finished = s.ri === task.reads.length - 1;
  return { ...s, trials, log, last: trial, ri: finished ? s.ri : s.ri + 1, ...(finished ? { done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } } : {}) };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : une abscisse entre −5 et 5 (un chiffre après la virgule) sur la droite libre ── */
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export function parseFree(raw) {
  const t = String(raw ?? '').replace(/[⁦⁩\s]/g, '').replace(/[−–]/g, '-').replace(/[٫،,]/g, '.').replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/^\+/, '');
  const m = /^(-?)(\d{1,2})(?:\.(\d))?$/.exec(t);
  if (!m) return null;
  const v = Number(m[2]) * G.TENTH + Number(m[3] ?? 0);
  return v > FREE_LIMIT ? null : (m[1] ? -v : v) || 0;
}
export function setFree(s, raw) {
  const t = parseFree(raw);
  if (t === null) return s;
  return { ...s, free: { t }, last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);
/** Ce que la droite libre dit de l'abscisse : son côté, sa distance à O, son symétrique, son encadrement. */
export function freeInfo(s) {
  if (!s.free) return null;
  const { t } = s.free;
  return { t, side: G.sideOf(t), distance: G.distance(t), symmetric: G.symmetric(t), bounds: G.boundsOf(t) };
}

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) : la pastille suit le geste utile MAINTENANT, jamais la réponse ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-ss-next]', gesture: 'tap', prefer: 'below' } : null;
  if (s.last && s.last.ok === false) return { id: 'again', target: '[data-ss-knob]', gesture: 'drag', prefer: 'above' };
  if (!s.moved && s.log.length === 0) return { id: t.kind === 'stamp' ? 'stick' : t.kind === 'origin' ? 'flag' : t.kind === 'bound' ? 'frame' : 'pin', target: '[data-ss-knob]', gesture: 'drag', prefer: 'above' };
  return { id: 'record', target: '[data-ss-record]', gesture: 'tap', prefer: 'below' };
}
