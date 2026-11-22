/**
 * tram-route — LA LOGIQUE PURE de « خطّ الترامواي » (2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية », درس « سلسلة عمليات دون أقواس
 * وأولوية العمليات », 2026-10-28). Exacte : tout vient de `packages/core/arithmetic/chainOps.js` (importé PAR CHEMIN, jamais par le barrel du cœur) et de
 * `powers.js`. Aucun flottant, aucun négatif (les relatifs sont l'unité 3 de 2AM : `isNonNegativeChain` garde toute tâche).
 *
 * LE MODÈLE. Une TÂCHE est une chaîne SANS parenthèses (« 26 − 9 + 4 ») ET l'histoire qui la fait écrire : les arrêts du tram arrivent dans l'ordre où la chaîne
 * est écrite (un terme = un arrêt ; le premier terme est le départ). La VÉRITÉ est le compteur du tram, qui compte arrêt après arrêt (la valeur conventionnelle).
 * La MAIN choisit l'ORDRE des opérations : des tickets ① ② ③ composés sur les opérateurs (`stamps` : les indices d'opérateurs dans l'ordre où l'élève les fait).
 * « انطلق » REJOUE ce plan : le plan calcule la chaîne dans SON ordre (`valueInOrder`), le tram roule dans l'ordre du temps, et si les deux ne s'accordent pas
 * la première étape du plan qui quitte l'arbre conventionnel (`offTreeStep`) est montrée ABSURDE dans le monde (`absurdOf`). Un plan différent qui donne la
 * même valeur (une chaîne de + seulement) est ACCEPTÉ : « هنا كلّ ترتيب يعطي العدد نفسه » — c'est le contraste qui ouvre la découverte.
 *
 * Une tâche : `{ id, chain, kind: 'stops' | 'kiosk', unit: 'pupils' | 'km', stops?: ['market', …], build?: true, predict?: true }`.
 *  - `build` (متقدم) : l'élève ÉCRIT d'abord la chaîne de l'histoire (plaques et puces) — jugée par la VALEUR contre l'histoire, jamais bloquant la suite d'un autre ;
 *  - `predict` (متقدم) : il écrit le résultat attendu AVANT « انطلق » (diagnostic, jamais bloquant).
 *
 * ÉVÉNEMENTS (`state.trials`, rejoués vers `onTrial`) :
 *   { tk: 'plan', id, order, value, truth, ok: true, conventional, free }               // le plan accepté
 *   { tk: 'refused', id, reason: 'mismatch', order, value, truth, station, absurd, free } // le plan refusé (+ le genre d'absurdité)
 *   { tk: 'build', id, chain, ok } · { tk: 'predict', id, predicted, truth, ok }
 *   { tk: 'custom', free: true, id: 'free', chain, order, value, truth, ok }              // un voyage de « جرّب أعدادك » (jamais compté)
 *   { tk: 'solved', id, value }
 */
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import { eq, sign } from '@smarter-academy/core/arithmetic/powers.js';
import { parseRel } from '@smarter-academy/core/arithmetic/relativeOps.js';

export const FREE_LIMITS = Object.freeze({ maxStops: 4, maxNumber: 40, maxStart: 40 });
const STOP_KEYS = Object.freeze(['market', 'university', 'stadium', 'library', 'garden', 'station']);
export const FREE_TYPES = Object.freeze(['on', 'off', 'groupsOn', 'groupsOff']);

export const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 't1', chain: '26 − 9 + 4', stops: ['market', 'university'] },
    { id: 't2', chain: '40 − 12 − 6 + 9', stops: ['market', 'university', 'stadium'] },
    { id: 't3', chain: '150 ÷ 6 × 4', kind: 'kiosk' },
    { id: 't4', chain: '15 + 3 × 4', stops: ['stadium'] },
  ] },
  advanced: { tasks: [
    { id: 'a1', chain: '32 − 4 × 5 + 6', stops: ['market', 'university'], build: true, predict: true },
    { id: 'a2', chain: '1,5 + 4 × 0,8', unit: 'km', stops: ['garden'], build: true, predict: true },
    { id: 'a3', chain: '60 ÷ 4 + 3 × 6', stops: ['stadium'], build: true, predict: true },
  ] },
  alone: { world: 'mixed', tasks: [
    { id: 'm1', chain: '50 − 4 × 6 + 30 ÷ 5', stops: ['market', 'stadium'] },
  ] },
});

/* ── la chaîne, ses termes, ses arrêts ───────────────────────────────────────────────────────────────────────── */

/** Les termes d'une chaîne : séparés par + et − ; `{ sign, from, to, value, text }` (from/to : positions des nombres). */
export function termsOf(chain) {
  const tokens = C.tokenize(chain);
  const nums = C.numbersOf(tokens);
  const ops = C.operatorsOf(tokens);
  const cuts = ops.filter((p) => p.o === '+' || p.o === '−');
  const bounds = [0, ...cuts.map((p) => p.right)];
  return bounds.map((from, i) => {
    const to = i + 1 < bounds.length ? bounds[i + 1] - 1 : nums.length - 1;
    const text = tokens.slice(from * 2, to * 2 + 1).map((tk) => (tk.t === 'num' ? tk.text : tk.o)).join(' ');
    return { sign: i === 0 ? '+' : cuts[i - 1].o, from, to, text, value: C.evaluateChain(text), single: from === to, grouped: from !== to };
  });
}

/** Le compteur du tram après chaque terme (la valeur conventionnelle, arrêt après arrêt). */
function trailOf(chain) {
  const ts = termsOf(chain);
  const out = [];
  let acc = null;
  ts.forEach((tm, i) => {
    acc = i === 0 ? tm.value : C.evaluateChain(`${C.numText(acc)} ${tm.sign} ${C.numText(tm.value)}`);
    out.push(acc);
  });
  return out;
}

export function buildTask(raw, i = 0) {
  const chain = String(raw.chain).replace(/\s+/g, ' ').trim();
  const tokens = C.tokenize(chain);
  if (!C.isNonNegativeChain(tokens)) throw new Error(`résultat intermédiaire négatif : ${chain}`);
  const ops = C.operatorsOf(tokens);
  const numbers = C.numbersOf(tokens);
  const truth = C.evaluateChain(C.parseChain(tokens));
  const terms = termsOf(chain);
  const kind = raw.kind ?? 'stops';
  return Object.freeze({
    id: raw.id ?? `t${i}`, chain, kind, unit: raw.unit ?? 'pupils', ops, nOps: ops.length,
    numbers: numbers.map((n) => n.text), numberValues: numbers.map((n) => n.v), terms, trail: trailOf(chain),
    truth, truthText: C.numText(truth), stops: raw.stops ?? STOP_KEYS.slice(0, Math.max(0, terms.length - 1)),
    build: !!raw.build, predict: !!raw.predict, order: C.conventionalOrder(tokens),
  });
}

export function init(numbers = {}) {
  const raws = numbers.tasks ?? PRESETS.beginner.tasks;
  const tasks = raws.map(buildTask);
  return { world: numbers.world ?? 'tram', tasks, ti: 0, ...fresh(tasks[0]), done: {}, trials: [], free: null };
}

/** Les champs remis à zéro à chaque tâche. */
function fresh(task) {
  return { stamps: [], replay: null, builtText: task?.build ? null : task?.chain ?? null, slots: task ? emptySlots(task) : [], pred: '', predSent: false, sol: null };
}

export const isFree = (s) => !!s.free;
export const taskOf = (s) => (s.free ? s.free : s.tasks[s.ti]);
export const taskDone = (s) => !s.free && !!s.done[s.ti];
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const allDone = (s) => s.tasks.every((_, i) => !!s.done[i]);
/** La chaîne EFFECTIVE de la tâche : celle de l'histoire, ou — en متقدم — celle que l'élève a écrite (jugée équivalente). */
export const chainNow = (s) => (s.builtText ?? taskOf(s).chain);
export const built = (s) => s.builtText != null;
const frozen = (s) => taskDone(s);
export const canStamp = (s) => built(s) && !s.replay && !frozen(s);
export const allStamped = (s) => built(s) && s.stamps.length === taskOf(s).nOps;
export const canGo = (s) => canStamp(s) && allStamped(s);
export const ticketOf = (s, idx) => { const k = s.stamps.indexOf(idx); return k < 0 ? 0 : k + 1; };

/* ── les tickets (le geste) ──────────────────────────────────────────────────────────────────────────────────── */

export function stampOp(s, idx) {
  if (!canStamp(s) || s.stamps.includes(idx) || idx < 0 || idx >= taskOf(s).nOps) return s;
  return { ...s, stamps: [...s.stamps, idx] };
}
function unstampOp(s, idx) {
  if (!canStamp(s) || !s.stamps.includes(idx)) return s;
  return { ...s, stamps: s.stamps.filter((x) => x !== idx) };
}
/** Un tap sur une puce : poser le prochain ticket, ou reprendre le sien. */
export const toggleOp = (s, idx) => (s.stamps.includes(idx) ? unstampOp(s, idx) : stampOp(s, idx));
/** « مسح » : on reprend tout — aussi après un plan refusé. */
export function clearStamps(s) {
  if (frozen(s)) return s;
  return { ...s, stamps: [], replay: null };
}

/* ── la rejouée ──────────────────────────────────────────────────────────────────────────────────────────────── */

/** Le genre d'absurdité que le MONDE dessine pour la première étape hors arbre. */
export function absurdOf(task, chain, order) {
  const step = C.offTreeStep(chain, order);
  if (!step) return null;
  const nums = C.numbersOf(chain);
  const txt = (v) => C.numText(v);
  const backwards = order.length > 2 && order.every((x, k) => k === 0 || x < order[k - 1]);
  if (backwards) return { kind: 'backwards', k: step.k, index: step.index, value: txt(step.value) };
  if (task.kind === 'kiosk') {
    return { kind: 'price', k: step.k, index: step.index, tickets: nums.at(-1).text, price: txt(C.valueInOrder(chain, order).value), a: txt(step.leftValue), b: txt(step.rightValue), value: txt(step.value) };
  }
  const ops = C.operatorsOf(chain);
  if (step.o === '+' || step.o === '−') {
    const nextOp = ops[step.rightSpan[1]];   // l'opérateur juste à droite du bloc de droite
    if (nextOp && (nextOp.o === '×' || nextOp.o === '÷') && step.rightSpan[0] === step.rightSpan[1]) {
      return { kind: 'groups', k: step.k, index: step.index, value: txt(step.value), a: txt(step.leftValue), m: nums[nextOp.right].text };
    }
    // un terme qui DESCEND (précédé de −) englobé : « نزل 13 ؟ لم ينزل إلا 9 »
    const lo = step.leftSpan[0]; const hi = step.rightSpan[1];
    for (let j = lo; j <= hi; j += 1) {
      const before = j > 0 ? ops[j - 1] : null;
      const after = ops[j];
      if (before && before.o === '−' && !(after && (after.o === '×' || after.o === '÷'))) {
        const t = nums[j].v;
        if (sign(step.value) > 0 && C.evaluateChain(`${txt(step.value)} − ${txt(t)}`).n > 0n) return { kind: 'overflow', k: step.k, index: step.index, value: txt(step.value), t: txt(t), numIndex: j };
      }
    }
  }
  return { kind: 'merged', k: step.k, index: step.index, a: txt(step.leftValue), b: txt(step.rightValue), value: txt(step.value) };
}

/** La station (0 = le départ) où le tram s'arrête sur le plan refusé : celle du terme où l'étape fautive a fait son dégât. */
function stationOfStep(chain, step, absurd = null) {
  const ts = termsOf(chain);
  // « نزل 13 ؟ لم ينزل إلا 9 » : le dégât se lit à l'arrêt où le terme englobé (le 9) descend, pas à celui du nombre fusionné
  const pos = absurd?.numIndex ?? step.rightSpan[0];
  const i = ts.findIndex((tm) => pos >= tm.from && pos <= tm.to);
  return Math.max(0, i);
}

function replay(task, chain, order) {
  const r = C.valueInOrder(chain, order);
  const ok = eq(r.value, task.truth);
  const absurd = ok ? null : absurdOf(task, chain, order);
  const off = ok ? null : C.offTreeStep(chain, order);
  return {
    ok, conventional: r.conventional, planValue: r.value, planText: C.numText(r.value), truth: task.truth, truthText: task.truthText, lines: r.lines,
    absurd, station: off ? stationOfStep(chain, off, absurd) : 0, order: [...order],
  };
}

/** « انطلق » : le plan est rejoué. Un plan juste (ou équivalent) fait la tâche ; sinon il est refusé et son absurdité est dessinée. */
export function go(s) {
  if (!canGo(s)) return s;
  const task = taskOf(s);
  const chain = chainNow(s);
  const rp = replay(task, chain, s.stamps);
  const base = { id: s.free ? 'free' : task.id, order: [...s.stamps], value: rp.planText, truth: task.truthText, free: !!s.free };
  const add = [];
  if (s.pred !== '' && !s.predSent && !s.free) {
    let ok = false;
    try { ok = eq(parseRel(s.pred.replace(/\s+/g, '')), task.truth); } catch { ok = false; }
    add.push(Object.freeze({ tk: 'predict', id: task.id, predicted: s.pred, truth: task.truthText, ok, free: false }));
  }
  if (s.free) add.push(Object.freeze({ tk: 'custom', ...base, id: 'free', chain, ok: rp.ok }));
  else if (rp.ok) add.push(Object.freeze({ tk: 'plan', ...base, ok: true, conventional: rp.conventional }), Object.freeze({ tk: 'solved', id: task.id, value: task.truthText }));
  else add.push(Object.freeze({ tk: 'refused', ...base, reason: 'mismatch', station: rp.station, absurd: rp.absurd?.kind ?? null }));
  return {
    ...s, replay: rp, predSent: s.predSent || s.pred !== '', trials: [...s.trials, ...add],
    done: !s.free && rp.ok ? { ...s.done, [s.ti]: true } : s.done,
  };
}

/* ── la prédiction (متقدم) ───────────────────────────────────────────────────────────────────────────────────── */

const PRED_MAX = 7;
export function setPred(s, raw) {
  if (!taskOf(s).predict || s.free || !built(s) || s.replay) return s;
  const clean = String(raw ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[.٫]/g, ',').replace(/[^0-9,]/g, '').slice(0, PRED_MAX);
  return { ...s, pred: clean };
}

/* ── l'écriture de la chaîne (متقدم) : des plaques et des puces dans le ruban ───────────────────────────────── */

const seedOf = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
/** Les jetons de la chaîne d'une tâche à construire, mélangés (déterministe) : `{ id, kind: 'num' | 'op', text }`. */
export function bankOf(task) {
  const tokens = C.tokenize(task.chain);
  const items = tokens.map((tk, i) => ({ id: `${tk.t === 'num' ? 'n' : 'o'}${i}`, kind: tk.t === 'num' ? 'num' : 'op', text: tk.t === 'num' ? tk.text : tk.o }));
  let seed = seedOf(task.id);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const emptySlots = (task) => (task.build ? Array(task.nOps * 2 + 1).fill(null) : []);
export const slotKind = (pos) => (pos % 2 === 0 ? 'num' : 'op');

/** Poser un jeton de la réserve dans la première case libre de son genre (plaque : positions paires ; puce : impaires). */
export function placeToken(s, item) {
  const task = taskOf(s);
  if (!task.build || built(s) || s.slots.includes(item.id)) return s;
  const pos = s.slots.findIndex((x, p) => x == null && slotKind(p) === item.kind);
  if (pos < 0) return s;
  const slots = [...s.slots]; slots[pos] = item.id;
  return { ...s, slots };
}
export function takeToken(s, pos) {
  if (!taskOf(s).build || built(s) || s.slots[pos] == null) return s;
  const slots = [...s.slots]; slots[pos] = null;
  return { ...s, slots };
}
export const slotsFull = (s) => s.slots.length > 0 && s.slots.every((x) => x != null);
/** Le texte écrit dans le ruban (jetons mis dans les cases). */
function writtenText(s) {
  const bank = bankOf(taskOf(s));
  return s.slots.map((id) => bank.find((b) => b.id === id)?.text ?? '?').join(' ');
}
/** « تحقّق » : la chaîne écrite est jugée par sa VALEUR contre l'histoire. */
export function checkBuild(s) {
  const task = taskOf(s);
  if (!task.build || built(s) || !slotsFull(s)) return s;
  const text = writtenText(s);
  let ok = false;
  try { ok = eq(C.evaluateChain(C.parseChain(text)), task.truth) && C.isNonNegativeChain(text); } catch { ok = false; }
  const ev = Object.freeze({ tk: 'build', id: task.id, chain: text, ok });
  if (!ok) return { ...s, trials: [...s.trials, ev], lastBuild: { ok: false, text } };
  return { ...s, builtText: text, trials: [...s.trials, ev], lastBuild: { ok: true, text } };
}
export const clearSlots = (s) => (built(s) || !taskOf(s).build ? s : { ...s, slots: emptySlots(taskOf(s)), lastBuild: null });

/* ── les tâches ──────────────────────────────────────────────────────────────────────────────────────────────── */

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, ...fresh(s.tasks[ti]) };
}
/** « إعادة » de la même tâche (après les questions) : tickets et rejouée effacés, la tâche redevient à faire. */
export function restartTask(s) {
  const task = taskOf(s);
  return { ...s, ...fresh(task), done: s.free ? s.done : { ...s.done, [s.ti]: false } };
}

/* ── « جرّب أعدادك » : toujours ouvert ───────────────────────────────────────────────────────────────────────── */

const latin = (x) => String(x ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
const natural = (x) => { const v = latin(x).trim(); return /^\d{1,2}$/.test(v) ? Number(v) : null; };

/**
 * Valide le panneau libre : `start` (les élèves dans la rame) et jusqu'à quatre arrêts `{ type, n?, k?, m? }`. `{ ok, chain }` ou `{ ok: false, why }` :
 * `empty` (aucun arrêt), `range` (un nombre hors 1 … 40), `below` (le compteur passerait sous 0 : « لا يمكن أن ينزل أكثر ممّا في العربة »).
 */
export function validateFree(start, events) {
  const st = natural(start);
  if (!events.length) return { ok: false, why: 'empty' };
  if (st == null || st < 1 || st > FREE_LIMITS.maxStart || events.length > FREE_LIMITS.maxStops) return { ok: false, why: 'range' };
  let count = st;
  const parts = [String(st)];
  for (const ev of events) {
    const group = ev.type === 'groupsOn' || ev.type === 'groupsOff';
    const n = group ? natural(ev.k) : natural(ev.n);
    const m = group ? natural(ev.m) : 1;
    if (n == null || m == null || n < 1 || m < 1 || n > FREE_LIMITS.maxNumber || m > FREE_LIMITS.maxNumber) return { ok: false, why: 'range' };
    const amount = n * m;
    const on = ev.type === 'on' || ev.type === 'groupsOn';
    count += on ? amount : -amount;
    if (count < 0) return { ok: false, why: 'below', count: count + (on ? -amount : amount), amount };
    parts.push(on ? '+' : '−', group ? `${n} × ${m}` : String(n));
  }
  return { ok: true, chain: parts.join(' ') };
}

export function setFree(s, chain) {
  const t = buildTask({ id: 'free', chain, stops: STOP_KEYS.slice(0, FREE_LIMITS.maxStops) });
  const stops = t.terms.length > 1 ? STOP_KEYS.slice(0, t.terms.length - 1) : [];
  const task = Object.freeze({ ...t, stops, build: false, predict: false });
  return { ...s, free: task, ...fresh(task) };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, ...fresh(s.tasks[s.ti]) } : s);

/* ── onboarding ──────────────────────────────────────────────────────────────────────────────────────────────── */

/** Le prochain geste utile — jamais un ordre ni un nombre. `null` en libre et quand la tâche est faite (un gros bouton « التالي » suffit). */
export function coachOf(s) {
  if (s.free) return null;
  const task = taskOf(s);
  if (taskDone(s)) return canNext(s) ? null : { id: 'free', target: '[data-tr-free]', gesture: 'type' };
  if (task.build && !built(s)) return { id: 'build', target: '[data-tr-bank]', gesture: 'tap' };
  if (s.replay && !s.replay.ok) return { id: 'retry', target: '[data-tr-clear]', gesture: 'tap' };
  if (task.predict && s.pred === '' && s.stamps.length === 0) return { id: 'predict', target: '[data-tr-predict]', gesture: 'type' };
  if (s.stamps.length === 0) return { id: 'stamp', target: '[data-tr-op="0"]', gesture: 'tap' };
  if (s.stamps.length < task.nOps) {
    const next = Array.from({ length: task.nOps }, (_, i) => i).find((i) => !s.stamps.includes(i));
    return { id: 'stampMore', target: `[data-tr-op="${next}"]`, gesture: 'tap' };
  }
  return { id: 'go', target: '[data-tr-go]', gesture: 'tap' };
}
