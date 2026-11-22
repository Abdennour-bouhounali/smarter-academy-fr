/**
 * jump-tape — LA LOGIQUE PURE de « شريط القفز » (1AM, unité 1, درس « الأعداد العشرية ونصف المستقيم المدرّج », 2026-10-30).
 * Exacte : les abscisses sont des ENTIERS en millièmes ; les maths viennent de `packages/core/arithmetic/halfLine.js` (importé PAR CHEMIN).
 *
 * LE MODÈLE. Un jour de sport, un ruban de mesure part de la planche d'appel (le métré O) le long d'une fosse de saut en longueur et ne montre RIEN d'autre que O.
 * La fenêtre du ruban fait `WIN = 600` unités de dessin ; une grande marque vaut `step` (1 ou 0,1), dix petites graduations la divisent (chacune à `step/10`).
 * Tâches :
 *   plant (مبتدئ) `unit: 'free'` : ÉTAPE 1 — la main ÉTIRE la marque « 1 » (`u` px par grande marque) ; la plage acceptée dépend du plus long saut
 *                  (`ceil(plus long) · u ≤ PIT_END` ET `u/10 ≥ MIN_TICK_PX`) ; relâcher hors plage est REFUSÉ PAR LE DESSIN (`long` : la marque au-dessus du plus long saut sort de la fosse ;
 *                  `short` : les dix petites graduations se tassent en une tache). ÉTAPE 2 — la main plante un drapeau par saut sur une petite graduation ; chaque plantage est jugé,
 *                  un drapeau mal planté reste en place et l'EMPREINTE du saut apparaît à sa vraie place.
 *   read  (متقدم) les drapeaux sont DÉJÀ plantés (valeurs exactes, parfois entre deux graduations) ; la main promène un CURSEUR de lecture de graduation en graduation ;
 *                  « على هذه التدريجة » (lecture exacte) ou « بين هذه والتي تليها » (encadrement). Une lecture refusée est montrée par l'écart dessiné entre le curseur et le drapeau.
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'unit', task, u, ok, model }                          model ∈ right | long | short
 *   { kind:'plant', task, jump, tick, value, ok, model, want }    model ∈ right | swap | fromO | wholeOnly | off1 | other
 *   { kind:'read', task, flag, tick, mode, value, ok, model }     model ∈ right | exactOnBetween | boundsOnTick | wrongTick | swap
 *   { kind:'custom', free:true }
 */
import * as H from '@smarter-academy/core/arithmetic/halfLine.js';

export const WIN = 600;
export const PIT_END = 580;
const MIN_TICK_PX = 10;
export const U_MIN = 40;
export const U_MAX = 230;
const U_START = 60;
export const READ_U = 200;
export const X0 = 20;
const FREE_U = 140;
const FREE_WINDOW = Object.freeze({ from: 0, step: 1000 });
const FREE_MAX = 4000;

const LETTERS = Object.freeze(['A', 'B', 'C', 'D']);
/** Les couleurs des drapeaux, dans l'ordre des sauts : le 1er est ROUGE, le 2e BLEU, le 3e VERT. */
const COLORS = Object.freeze(['red', 'blue', 'green', 'amber']);

const T = (v) => H.text(v);
const perTick = (w) => w.step / 10;

/** Le plus petit et le plus grand `u` acceptés pour un saut le plus long de `longest` (millièmes). */
function unitRange(w, longest) {
  const need = H.marksNeeded(w, longest);
  return { min: MIN_TICK_PX * 10, max: Math.floor(PIT_END / need), need };
}
/** Le nombre de petites graduations visibles dans la fenêtre pour `u` px par grande marque. */
export const maxTickAt = (u) => Math.floor(WIN / (u / 10));
export const xOfTick = (u, i) => X0 + (i * u) / 10;
export const xOfValue = (w, u, v) => X0 + ((v - w.from) / w.step) * u;
export const tickAtX = (u, x, max = maxTickAt(u)) => Math.max(0, Math.min(max, Math.round(((x - X0) * 10) / u)));

/** Les tâches normalisées. Lève si mal formées. */
function normalizeTasks(list) {
  return list.map((t, i) => {
    const id = t.id ?? `t${i}`;
    const from = H.parse(t.from ?? '0');
    const step = H.parse(t.step ?? '1');
    if (from === null || step === null || step <= 0 || step % 10 !== 0) throw new Error(`jumpTape: ${id} — fenêtre mal formée`);
    const w = Object.freeze({ from, step });
    if (t.kind === 'read') {
      const flags = (t.flags ?? []).map((x, j) => {
        const v = H.parse(x);
        if (v === null || v < from || v > from + (WIN / READ_U) * step) throw new Error(`jumpTape: ${id} — drapeau hors de la fenêtre`);
        return Object.freeze({ id: LETTERS[j], idx: j, color: COLORS[j], text: H.text(v), v, exact: H.onTick(w, v), ...H.bracket(w, v) });
      });
      if (!flags.length || flags.length > 4) throw new Error(`jumpTape: ${id} — 1 à 4 drapeaux`);
      return Object.freeze({ id, kind: 'read', w, u: READ_U, flags, maxTick: WIN / (READ_U / 10) });
    }
    const jumps = (t.jumps ?? []).map((x, j) => {
      const v = H.parse(x);
      if (v === null || v < from) throw new Error(`jumpTape: ${id} — saut illisible`);
      if (!H.onTick(w, v)) throw new Error(`jumpTape: ${id} — un saut doit tomber sur une petite graduation`);
      return Object.freeze({ id: LETTERS[j], idx: j, color: COLORS[j], text: H.isSum(x) ? String(x).replace(/\s+/g, '') : H.text(v), written: String(x), sum: H.isSum(x), v, tick: (v - from) / perTick(w) });
    });
    if (!jumps.length || jumps.length > 4) throw new Error(`jumpTape: ${id} — 1 à 4 sauts`);
    const longest = Math.max(...jumps.map((j) => j.v));
    const range = unitRange(w, longest);
    const free = t.unit === 'free' || t.unit === undefined;
    if (free && range.min > range.max) throw new Error(`jumpTape: ${id} — aucune unité ne convient`);
    if (!free && (t.unit < range.min || t.unit > range.max)) throw new Error(`jumpTape: ${id} — l'unité donnée ne convient pas`);
    return Object.freeze({ id, kind: 'plant', w, jumps, free, unit: free ? null : t.unit, longest, range });
  });
}

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'b1', kind: 'plant', jumps: ['2,4', '3,1', '1,8'], from: '0', step: '1', unit: 'free' },
    { id: 'b2', kind: 'plant', jumps: ['0,7', '2,9', '3'], from: '0', step: '1', unit: 'free' },
    { id: 'b3', kind: 'plant', jumps: ['0,8', '2+6/10', '3,3'], from: '0', step: '1', unit: 140 },
  ] },
  advanced: { tasks: [
    { id: 'a1', kind: 'read', flags: ['0,6', '1,9', '2,35'], from: '0', step: '1' },
    { id: 'a2', kind: 'read', flags: ['9,4', '10,8', '11,25'], from: '9', step: '1' },
    { id: 'a3', kind: 'read', flags: ['4,04', '4,12', '4,235'], from: '4', step: '0,1' },
  ] },
});

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) throw new Error('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null });
}
function fresh(s) {
  const t = s.tasks[s.ti];
  const base = { ...s, last: null, ghost: null, refusal: null, moved: false, prints: {} };
  if (t.kind === 'read') return { ...base, phase: 'read', u: READ_U, cursor: 0, cursorMoved: false, sel: t.flags[0].id, answered: {}, planted: {} };
  return { ...base, phase: t.free ? 'unit' : 'plant', u: t.free ? U_START : t.unit, planted: {}, answered: {}, sel: null, cursor: 0, cursorMoved: false };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isAdvanced = (s) => s.tasks.some((t) => t.kind === 'read');
export const unitLocked = (s) => taskOf(s).kind === 'plant' && s.phase !== 'unit';
/** La fenêtre et le `u` courants (mode libre : la fenêtre fixe 0 … 4). */
export const windowOf = (s) => (s.free ? FREE_WINDOW : taskOf(s).w);
export const uOf = (s) => (s.free ? FREE_U : s.u);
export const flagsOf = (s) => (taskOf(s).kind === 'read' ? taskOf(s).flags : taskOf(s).jumps);
export const plantedCount = (s) => Object.keys(s.planted).length;
const nthFlag = (s, id) => flagsOf(s).find((f) => f.id === id);
/** La valeur d'une petite graduation de la fenêtre courante. */
export const valueAtTick = (s, i) => H.tickValue(windowOf(s), i);

/* ── Étape 1 : l'unité étirée ── */
export function fitsUnit(task, u) {
  if (u / 10 < MIN_TICK_PX) return { ok: false, model: 'short' };
  if (task.range.need * u > PIT_END) return { ok: false, model: 'long' };
  return { ok: true, model: 'right' };
}
export function setUnit(s, u) {
  if (s.free || s.phase !== 'unit') return s;
  const v = Math.max(U_MIN, Math.min(U_MAX, Math.round(u)));
  if (v === s.u && s.moved) return s;
  return { ...s, u: v, moved: true, refusal: null, ghost: null, last: s.last?.kind === 'unit' ? null : s.last };
}
export const unitBy = (s, n) => setUnit(s, s.u + n * 5);
/** Relâcher la marque : la plage convient → le ruban dessine ses dix graduations et l'unité se verrouille ; sinon un refus dessiné. */
export function releaseUnit(s) {
  if (s.free || s.phase !== 'unit' || !s.moved) return s;
  const t = taskOf(s);
  const j = fitsUnit(t, s.u);
  const trial = Object.freeze({ kind: 'unit', task: s.ti, u: s.u, ok: j.ok, model: j.model });
  const base = { ...s, trials: [...s.trials, trial], last: trial };
  if (!j.ok) return { ...base, refusal: j.model };
  return { ...base, phase: 'plant', refusal: null };
}

/* ── Étape 2 : planter les drapeaux ── */
function judgePlant(task, jump, tick) {
  const pv = H.tickValue(task.w, tick);
  const v = jump.v;
  if (pv === v) return { ok: true, model: 'right', value: pv };
  const sw = H.swapDigits(v);
  let model = 'other';
  if (sw !== null && pv === sw) model = 'swap';
  else if (v % 1000 !== 0 && v >= 1000 && pv === v % 1000) model = 'fromO';
  else if (v % 1000 !== 0 && pv === Math.floor(v / 1000) * 1000) model = 'wholeOnly';
  else if (Math.abs(tick - jump.tick) === 1) model = 'off1';
  return { ok: false, model, value: pv };
}
export function plant(s, id, tick) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'plant' || s.phase !== 'plant') return s;
  const jump = t.jumps.find((j) => j.id === id);
  if (!jump) return s;
  const i = Math.max(0, Math.min(maxTickAt(s.u), Math.round(tick)));
  if (s.planted[id] === i) return s;
  const j = judgePlant(t, jump, i);
  const trial = Object.freeze({ kind: 'plant', task: s.ti, jump: id, tick: i, value: T(j.value), ok: j.ok, model: j.model, want: T(jump.v) });
  const planted = { ...s.planted, [id]: i };
  const prints = { ...s.prints };
  if (j.ok) delete prints[id]; else prints[id] = jump.tick;
  const allRight = t.jumps.every((x) => planted[x.id] === x.tick);
  const base = { ...s, planted, prints, trials: [...s.trials, trial], last: trial, moved: true };
  return allRight ? { ...base, phase: 'done', done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } } : base;
}
/** Reprendre un drapeau planté (le remettre au bac) : aucun essai. */
export function lift(s, id) {
  if (s.free || s.phase !== 'plant' || s.planted[id] === undefined) return s;
  const planted = { ...s.planted }; delete planted[id];
  const prints = { ...s.prints }; delete prints[id];
  return { ...s, planted, prints };
}
export const isRight = (s, id) => { const j = nthFlag(s, id); return s.planted[id] !== undefined && j && s.planted[id] === j.tick; };

/* ── متقدم : le curseur de lecture ── */
export function moveCursor(s, tick) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'read' || taskDone(s)) return s;
  const i = Math.max(0, Math.min(t.maxTick, Math.round(tick)));
  if (i === s.cursor && s.cursorMoved) return s;
  return { ...s, cursor: i, cursorMoved: true, ghost: null, last: s.last?.kind === 'read' && !s.last.ok ? null : s.last };
}
export const cursorBy = (s, n) => moveCursor(s, s.cursor + n);
export function selectFlag(s, id) {
  const t = taskOf(s);
  if (t.kind !== 'read' || s.answered[id] || !t.flags.some((f) => f.id === id)) return s;
  return { ...s, sel: id, ghost: null };
}
export function judgeRead(task, flag, tick, mode) {
  const cv = H.tickValue(task.w, tick);
  const v = flag.v;
  if (mode === 'exact') {
    if (!flag.exact) return { ok: false, model: 'exactOnBetween', value: cv };
    if (cv === v) return { ok: true, model: 'right', value: cv };
    return { ok: false, model: H.swapDigits(v) === cv ? 'swap' : 'wrongTick', value: cv };
  }
  if (flag.exact) return { ok: false, model: 'boundsOnTick', value: cv };
  if (tick === flag.i) return { ok: true, model: 'right', value: cv };
  return { ok: false, model: 'wrongTick', value: cv };
}
export function answerRead(s, mode) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'read' || taskDone(s) || !s.sel || (mode !== 'exact' && mode !== 'bounds')) return s;
  const flag = t.flags.find((f) => f.id === s.sel);
  const j = judgeRead(t, flag, s.cursor, mode);
  const trial = Object.freeze({ kind: 'read', task: s.ti, flag: flag.id, tick: s.cursor, mode, value: T(j.value), ok: j.ok, model: j.model });
  const base = { ...s, trials: [...s.trials, trial], last: trial };
  if (!j.ok) return { ...base, ghost: { flag: flag.id, tick: s.cursor, model: j.model } };
  const answered = { ...s.answered, [flag.id]: Object.freeze(mode === 'exact' ? { mode, lo: flag.v, hi: null } : { mode, lo: flag.lo, hi: flag.hi }) };
  const rest = t.flags.find((f) => !answered[f.id]);
  const all = !rest;
  return { ...base, answered, ghost: null, sel: rest ? rest.id : null, ...(all ? { phase: 'done', done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } } : {}) };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : une abscisse dans la fenêtre fixe 0 … 4 ── */
export function parseFree(raw) {
  const v = H.parse(String(raw ?? '').replace(/[⁦⁩]/g, ''));
  return v === null || v > FREE_MAX ? null : v;
}
export function setFree(s, raw) {
  const v = parseFree(raw);
  if (v === null) return s;
  return { ...s, free: { v }, ghost: null, last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);
/** Ce que le ruban dit de l'abscisse libre : la graduation exacte (grande marque + petites graduations) ou l'encadrement. */
export function freeInfo(s) {
  if (!s.free) return null;
  const { v } = s.free;
  const b = H.bracket(FREE_WINDOW, v);
  return { v, text: T(v), ...b, whole: Math.floor(v / 1000), smalls: b.exact ? (v % 1000) / 100 : null, loText: T(b.lo), hiText: T(b.hi) };
}

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) : la pastille suit le geste utile MAINTENANT, jamais la réponse ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-jt-next]', gesture: 'tap', prefer: 'below' } : null;
  const t = taskOf(s);
  if (t.kind === 'read') {
    if (!s.cursorMoved) return { id: 'cursor', target: '[data-jt-cursor]', gesture: 'drag', prefer: 'above' };
    return { id: 'answer', target: '[data-jt-answers]', gesture: 'tap', prefer: 'below' };
  }
  if (s.phase === 'unit') return s.refusal ? { id: 'knobAgain', target: '[data-jt-knob]', gesture: 'drag', prefer: 'above' } : { id: 'knob', target: '[data-jt-knob]', gesture: 'drag', prefer: 'above' };
  const wrong = t.jumps.find((j) => s.planted[j.id] !== undefined && s.planted[j.id] !== j.tick);
  if (wrong) return { id: 'again', target: `[data-jt-flag="${wrong.id}"]`, gesture: 'drag', prefer: 'above' };
  const next = t.jumps.find((j) => s.planted[j.id] === undefined);
  return next ? { id: plantedCount(s) === 0 ? 'tray' : 'trayMore', target: `[data-jt-card="${next.id}"]`, gesture: 'drag', prefer: 'above' } : null;
}
