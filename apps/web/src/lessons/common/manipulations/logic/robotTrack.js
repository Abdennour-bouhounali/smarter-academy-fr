/**
 * robot-track — LA LOGIQUE PURE du « مسار الروبوت » (3AM, unité 1 « الأعداد النسبية », درس « جداء عدة أعداد نسبية », 2026-10-26).
 * Exacte : tout vient de `packages/core/arithmetic/relativeOps.js` (importé PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Un petit robot roule sur un tapis gradué (une droite graduée, le poteau 0 au milieu). Il part de la position 1 ; chaque CARTE de son
 * programme multiplie sa position par le nombre écrit dessus : une carte positive l'ÉLOIGNE du poteau (|k| fois plus loin, du MÊME côté) ; une
 * carte négative le fait en plus SAUTER par-dessus le poteau (le symétrique) : × (−1) est le demi-tour. La position d'arrivée est donc le
 * produit des cartes ; son côté ne dépend que du NOMBRE de demi-tours (cartes négatives), jamais de leur ordre.
 *
 * LA MAIN tient les SIGNES (toucher le badge d'une carte) et l'ORDRE / la PRÉSENCE des cartes (porter d'un plateau vers une case, d'une
 * case vers une autre ou vers le plateau). Chaque changement du programme est un ESSAI (le robot rejoue depuis 1).
 *
 * MONDES / MISSIONS (`tasks`)
 *   goal     { id, flag, placed[], tray[], need, flip, lock?, minNeg?, at? } : amener le robot à la RAYE `flag` avec `need` cartes.
 *   predict  { id, cards[] } : le programme est FIXE ; prédire le côté et la distance AVANT de lancer (rien n'est montré avant).
 *   repeat   { id, card, unit, goals[], predictN } : la carte `card` puis `unit` répété n fois (n à la main, 1…20) ; prédire d'abord n = predictN.
 *   sqNeg    monde `square` : une carte `a` posée DEUX FOIS ; aucun a ne mène du côté négatif ; le bouton « لا يمكن » s'ouvre après un essai de chaque signe.
 *   sqVal    monde `square` : atteindre `target` (2,25) ; terminé quand a = 1,5 ET a = −1,5 ont été essayés.
 */
import * as R from '@smarter-academy/core/arithmetic/relativeOps.js';
import * as P from '@smarter-academy/core/arithmetic/powers.js';

export const SLOTS = 6;
const FREE_RANGE = Object.freeze([-10, 10]);
export const A_RANGE = Object.freeze([-6, 6]);
export const N_RANGE = Object.freeze([1, 20]);
const MAT_STEPS = Object.freeze([10, 20, 30, 40]);
const MISC_SIDE = Object.freeze({ anyNeg: 'MISC-IDA-ANYNEG', moreNeg: 'MISC-IDA-MORENEG', order: 'MISC-IDA-ORDER', squareNeg: 'MISC-IDA-SQUARENEG', minusOne: 'MISC-IDA-MINUSONE', zero: 'MISC-IDA-ZERO' });

/** Les missions par défaut de chaque niveau (la leçon peut passer les siennes). */
export const PRESETS = Object.freeze({
  beginner: {
    world: 'track',
    tasks: [
      { id: 'm1', flag: '-5', placed: ['5'], tray: ['-1'], need: 2, lock: true },
      { id: 'm2', flag: '5', placed: ['5', '-1'], tray: ['-1', '2', '-5'], need: 3, lock: true },
      { id: 'm3', flag: '-24', placed: ['2', '3', '4'], tray: [], need: 3, flip: true },
      { id: 'm4', flag: '24', placed: ['2', '3', '4'], tray: [], need: 3, flip: true, minNeg: 2 },
    ],
  },
  advanced: {
    world: 'track',
    tasks: [
      { id: 'a1', kind: 'predict', cards: ['-2', '3', '-1', '-4', '0,5'] },
      { id: 'a2', flag: '-2', placed: [], tray: ['-5', '4', '-0,5', '2'], need: 4, at: 2 },
      { id: 'a3', kind: 'repeat', card: '3', unit: '-1', goals: ['-3', '3'], predictN: 15 },
    ],
  },
});

export const SQUARE_TASKS = Object.freeze([
  { id: 'q1', kind: 'sqNeg' },
  { id: 'q2', kind: 'sqVal', target: '2,25' },
]);

/* ── Lectures de base ───────────────────────────────────────────────────────────────────────── */

const rat = (x) => (x && typeof x === 'object' ? x : R.parseRel(String(x)));
const canon = (x) => R.relText(rat(x));
export const num = (x) => { const q = rat(x); return Number(q.n) / Number(q.d); };
export const text = (x) => R.relText(typeof x === 'object' ? x : rat(x));
const sgn = (r) => P.sign(r);
const same = (a, b) => a.n === b.n && a.d === b.d;

/** Les positions successives du robot : { value, jumped } pour chaque carte (le départ 1 n'est pas dedans). */
export function run(values, start = '1') {
  let at = rat(start);
  return values.map((v) => {
    const k = rat(v);
    const next = P.mul(at, k);
    const jumped = sgn(k) < 0 && sgn(at) !== 0;
    at = next;
    return { value: next, jumped, factor: k };
  });
}
export const finalOf = (values) => (values.length ? run(values).at(-1).value : rat(1));
export const negativesOf = (values) => values.filter((v) => sgn(rat(v)) < 0).length;

/** Les arcs du saut : une trace numérotée par saut. */
export function jumpsOf(values) {
  const out = [];
  let from = rat(1);
  for (const st of run(values)) {
    if (st.jumped) out.push({ from: num(text(from)), to: num(text(st.value)), n: out.length + 1 });
    from = st.value;
  }
  return out;
}

/** Le produit LaTeX de la ligne « 1 × 2 × (−3) × 4 = −24 » (facteurs négatifs entre parenthèses). */
export function lineTex(values, unitRepeat = null) {
  const f = (v) => (sgn(rat(v)) < 0 ? `(${R.relTex(rat(v))})` : R.relTex(rat(v)));
  const all = unitRepeat ? [...values, ...Array(unitRepeat.n).fill(unitRepeat.unit)] : values;
  const shown = all.length > 7 ? [...all.slice(0, 3).map(f), '\\ldots', f(all.at(-1))] : all.map(f);
  return `1 \\times ${shown.join(' \\times ')} = ${R.relTex(finalOf(all))}`;
}
export function lineText(values) {
  const f = (v) => (sgn(rat(v)) < 0 ? `(${text(v)})` : text(v));
  return `1 × ${values.map(f).join(' × ')} = ${text(finalOf(values))}`;
}

/** L'échelle du tapis : le plus petit palier ≥ la plus grande position atteignable. */
function reachableMax(task) {
  if (task.kind === 'predict') return Math.max(...run(task.cards).map((s) => Math.abs(num(text(s.value)))), 1);
  if (task.kind === 'repeat') return Math.abs(num(task.card)) * 1;
  if (task.kind === 'sqNeg' || task.kind === 'sqVal') return 36;
  const pool = [...task.placed, ...task.tray].map((v) => Math.abs(num(v)));
  // la plus grande position partielle : le produit des k plus grands facteurs au-dessus de 1 (et 1 tel quel)
  let best = 1;
  const sorted = [...pool].sort((a, b) => b - a);
  let acc = 1;
  for (const v of sorted.slice(0, task.need)) { acc *= v; best = Math.max(best, acc); }
  return Math.max(best, Math.abs(num(task.flag ?? '1')));
}
export function scaleFor(task) {
  const m = reachableMax(task);
  const M = MAT_STEPS.find((s) => s >= m) ?? MAT_STEPS.at(-1);
  return { max: M, tick: M <= 10 ? 1 : M <= 20 ? 2 : 5, label: M <= 10 ? 5 : 10 };
}

/* ── État ───────────────────────────────────────────────────────────────────────────────────── */

let SEQ = 0;
const card = (task, kind, i, v) => ({ id: `${task.id}-${kind}${i}`, v: canon(v) });

function boardOf(task) {
  if (task.kind && task.kind !== 'goal') return { slots: Array(SLOTS).fill(null), tray: [] };
  const slots = Array(SLOTS).fill(null);
  task.placed.forEach((v, i) => { slots[i] = card(task, 'p', i, v); });
  return { slots, tray: task.tray.map((v, i) => card(task, 't', i, v)) };
}

function normalize(list) {
  return list.map((t, i) => {
    const kind = t.kind ?? 'goal';
    const base = { ...t, id: t.id ?? `t${i}`, kind };
    if (kind === 'goal') return Object.freeze({ ...base, need: t.need ?? (t.placed.length + t.tray.length), flip: !!t.flip, lock: !!t.lock });
    return Object.freeze(base);
  });
}

/** L'état de départ. `numbers` = { world, tasks } (cf. PRESETS, SQUARE_TASKS). Une mission impossible lève une erreur. */
export function init(numbers = {}) {
  const world = numbers.world ?? 'track';
  const tasks = normalize(numbers.tasks ?? (world === 'square' ? SQUARE_TASKS : PRESETS.beginner.tasks), world);
  for (const tk of tasks) {
    if (tk.kind === 'goal' && !canReach(tk)) throw new Error(`mission impossible : ${tk.id}`);
  }
  const first = tasks[0];
  return {
    world, tasks, ti: 0, board: boardOf(first), done: {}, solved: {}, trials: [], last: null, record: [],
    free: null, a: world === 'square' ? 2 : null, tried: { neg: false, pos: false, vals: [] },
    pred: { side: null, dist: null, ran: false }, n: 2, predicted: false, flipped: false, moved: false, claimed: false,
  };
}

export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
export const boardNow = (s) => (s.free ? s.free : s.board);
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const programmeOf = (b) => b.slots.filter(Boolean);
export const valuesOf = (b) => programmeOf(b).map((c) => c.v);
export const canFlip = (s) => !!s.free || (taskOf(s).kind === 'goal' && taskOf(s).flip);
export const canMove = (s, c) => !!s.free || (taskOf(s).kind === 'goal' && !(taskOf(s).lock && /-p\d+$/.test(c.id)));
export const isPredictStage = (s) => !s.free && (taskOf(s).kind === 'predict' || (taskOf(s).kind === 'repeat' && !s.predicted)) && !taskDone(s);

/** Les valeurs que le robot suit en ce moment (programme, prédiction, répétition, carré). */
export function programmeValues(s) {
  if (s.free) return valuesOf(s.free);
  const t = taskOf(s);
  if (t.kind === 'predict') return t.cards.map(canon);
  if (t.kind === 'repeat') return [canon(t.card), ...Array(s.predicted ? s.n : t.predictN).fill(canon(t.unit))];
  if (t.kind === 'sqNeg' || t.kind === 'sqVal') { const a = canon(String(s.a)); return [a, a]; }
  return valuesOf(s.board);
}

/** Les positions montrées : en prédiction rien tant que la course n'a pas eu lieu. */
export function stopsOf(s) {
  const t = taskOf(s);
  if (!s.free && (t.kind === 'predict' || (t.kind === 'repeat' && !s.predicted)) && !s.pred.ran) return [];
  return run(programmeValues(s));
}
export const finalValue = (s) => finalOf(programmeValues(s));

/* ── Jugement ───────────────────────────────────────────────────────────────────────────────── */

/** La mission `goal` est-elle réussie par ce programme ? { ok, stop, negatives, reason: 'side' | 'distance' | 'constraint' | 'incomplete' | null }. */
export function judge(task, values) {
  const negatives = negativesOf(values);
  if (values.length < task.need) return { ok: false, stop: values.length ? finalOf(values) : rat(1), negatives, reason: 'incomplete' };
  const stops = run(values);
  const stop = stops.at(-1).value;
  const probe = task.at ? stops[task.at - 1].value : stop;
  const flag = rat(task.flag);
  if (!same(probe, flag)) {
    const opp = probe.d === flag.d && probe.n === -flag.n;
    return { ok: false, stop, probe, negatives, reason: opp ? 'side' : 'distance' };
  }
  if (task.minNeg && negatives < task.minNeg) return { ok: false, stop, probe, negatives, reason: 'constraint' };
  return { ok: true, stop, probe, negatives, reason: null };
}

/** Une mission est-elle atteignable ? (permutations des cartes, signes libres si `flip`). */
export function canReach(task) {
  if (task.kind && task.kind !== 'goal') return task.kind !== 'sqNeg';
  const pool = [...task.placed, ...task.tray];
  const choose = (arr, k) => {
    if (k === 0) return [[]];
    const out = [];
    arr.forEach((v, i) => {
      const rest = arr.filter((_, j) => j !== i);
      choose(rest, k - 1).forEach((tail) => out.push([v, ...tail]));
    });
    return out;
  };
  for (const perm of choose(pool, task.need)) {
    if (task.lock) {
      const lockedAt = task.placed.map((v, i) => perm[i] === v);
      if (!lockedAt.every(Boolean)) continue;
    }
    const signVariants = task.flip ? Array.from({ length: 2 ** perm.length }, (_, m) => perm.map((v, i) => (m & (1 << i) ? canon(R.opposite(v)) : v))) : [perm];
    for (const vals of signVariants) if (judge(task, vals).ok) return true;
  }
  return false;
}

/* ── Gestes ─────────────────────────────────────────────────────────────────────────────────── */

function withBoard(s, board) { return s.free ? { ...s, free: { ...s.free, ...board } } : { ...s, board }; }

function trialOf(s, extra) {
  const t = taskOf(s);
  return Object.freeze({ kind: 'run', task: s.ti, taskId: s.free ? null : t.id, free: !!s.free, ...extra });
}

function afterChange(s, moved) {
  const t = taskOf(s);
  const b = boardNow(s);
  const vals = valuesOf(b);
  if (s.free) {
    const tr = trialOf(s, { count: vals.length, negatives: negativesOf(vals), stop: text(finalOf(vals)), ok: false, reason: null, moved });
    return { ...s, trials: [...s.trials, tr], last: tr };
  }
  const j = judge(t, vals);
  const tr = trialOf(s, { count: vals.length, negatives: j.negatives, stop: text(j.stop), probe: j.probe ? text(j.probe) : null, ok: j.ok, reason: j.reason, moved, order: vals.join('|') });
  let { done, solved, record } = s;
  if (j.ok) {
    if (!done[s.ti]) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: { stop: text(j.stop), negatives: j.negatives, values: vals } }; }
    const sig = `${t.id}:${vals.join('|')}`;
    if (!record.some((r) => r.sig === sig)) record = [...record, { sig, task: s.ti, taskId: t.id, values: vals, stop: text(j.stop), negatives: j.negatives }];
  }
  return { ...s, trials: [...s.trials, tr], last: tr, done, solved, record };
}

/** Porte la carte `id` (du plateau ou d'une case) vers la case `slot` (échange si elle est occupée) ou vers le plateau (`slot = 'tray'`). */
export function place(s, id, slot) {
  const b = boardNow(s);
  if (s.tasks[s.ti].kind !== 'goal' && !s.free) return s;
  const inTray = b.tray.findIndex((c) => c.id === id);
  const inSlot = b.slots.findIndex((c) => c && c.id === id);
  if (inTray < 0 && inSlot < 0) return s;
  const c = inTray >= 0 ? b.tray[inTray] : b.slots[inSlot];
  if (!canMove(s, c)) return s;
  const slots = [...b.slots];
  let tray = [...b.tray];
  if (slot === 'tray') {
    if (inTray >= 0) return s;
    slots[inSlot] = null;
    tray = [...tray, c];
  } else {
    if (slot < 0 || slot >= SLOTS || inSlot === slot) return s;
    const occ = slots[slot];
    if (occ && !canMove(s, occ)) return s;
    if (inTray >= 0) { tray.splice(inTray, 1); if (occ) tray.push(occ); slots[slot] = c; } else { slots[inSlot] = occ ?? null; slots[slot] = c; }
  }
  // en mode guidé le programme ne peut pas dépasser `need` cartes
  if (!s.free && slots.filter(Boolean).length > s.tasks[s.ti].need) return s;
  return afterChange(withBoard({ ...s, moved: true }, { slots, tray }), true);
}

/** Le badge d'une carte : + ↔ −. */
export function flip(s, id) {
  if (!canFlip(s)) return s;
  const b = boardNow(s);
  const turn = (c) => (c && c.id === id ? { ...c, v: canon(R.opposite(c.v)) } : c);
  const nb = { slots: b.slots.map(turn), tray: b.tray.map(turn) };
  if (JSON.stringify(nb) === JSON.stringify({ slots: b.slots, tray: b.tray })) return s;
  return afterChange(withBoard({ ...s, flipped: true }, nb), false);
}

/* ── Prédiction (متقدم a1, a3) ──────────────────────────────────────────────────────────────── */

export const chooseSide = (s, side) => (isPredictStage(s) && !s.pred.ran ? { ...s, pred: { ...s.pred, side } } : s);
export function setDist(s, v) {
  if (!isPredictStage(s) || s.pred.ran) return s;
  const d = Math.max(0, Math.min(40, Math.round(v * 2) / 2));
  return { ...s, pred: { ...s.pred, dist: d } };
}
export const canRun = (s) => isPredictStage(s) && !s.pred.ran && s.pred.side != null && s.pred.dist != null;

/** « شغّل » : la course est montrée et jugée contre la prédiction. */
export function runPredict(s) {
  if (!canRun(s)) return s;
  const t = taskOf(s);
  const vals = programmeValues(s);
  const stop = finalOf(vals);
  const side = sgn(stop) < 0 ? 'left' : 'right';
  const dist = Math.abs(num(text(stop)));
  const sideOk = side === s.pred.side;
  const distOk = dist === s.pred.dist;
  const ok = sideOk && distOk;
  const tr = Object.freeze({ kind: 'predict', task: s.ti, taskId: t.id, free: false, side: s.pred.side, dist: s.pred.dist, ok, sideOk, distOk, stop: text(stop), negatives: negativesOf(vals), count: vals.length,
    misc: ok ? null : (!sideOk ? MISC_SIDE.anyNeg : null) });
  const pred = { ...s.pred, ran: true };
  let next = { ...s, pred, trials: [...s.trials, tr], last: tr };
  if (ok && t.kind === 'predict') {
    next = { ...next, done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: { stop: text(stop), negatives: tr.negatives, values: vals } },
      record: [...s.record, { sig: `${t.id}:p`, task: s.ti, taskId: t.id, values: vals, stop: text(stop), negatives: tr.negatives }] };
  }
  if (t.kind === 'repeat') next = { ...next, predicted: ok, pred: ok ? { side: null, dist: null, ran: false } : pred };
  return next;
}

/** Après une prédiction fausse, l'élève peut en refaire une : la course reste montrée, il corrige. */
export const retryPredict = (s) => (s.pred.ran && !taskDone(s) ? { ...s, pred: { side: null, dist: null, ran: false } } : s);

/* ── Répétition (a3) ────────────────────────────────────────────────────────────────────────── */

export function setN(s, v) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'repeat' || !s.predicted) return s;
  const n = Math.max(N_RANGE[0], Math.min(N_RANGE[1], Math.round(v)));
  if (n === s.n) return s;
  const next = { ...s, n };
  const vals = programmeValues(next);
  const stop = finalOf(vals);
  const reached = t.goals.filter((g) => same(rat(g), stop));
  const got = { ...(s.solved[s.ti]?.reached ?? {}) };
  reached.forEach((g) => { got[g] = n; });
  const all = t.goals.every((g) => got[g] != null);
  const tr = Object.freeze({ kind: 'run', task: s.ti, taskId: t.id, free: false, count: vals.length, n, negatives: negativesOf(vals), stop: text(stop), ok: reached.length > 0, reason: null });
  const solved = { ...s.solved, [s.ti]: { reached: got, stop: text(stop), negatives: negativesOf(vals), values: vals } };
  const record = reached.length ? [...s.record.filter((r) => r.sig !== `${t.id}:${n}`), { sig: `${t.id}:${n}`, task: s.ti, taskId: t.id, values: vals, stop: text(stop), negatives: negativesOf(vals), n }] : s.record;
  return { ...next, trials: [...s.trials, tr], last: tr, solved, record, done: all ? { ...s.done, [s.ti]: true } : s.done };
}

/* ── Monde « square » ───────────────────────────────────────────────────────────────────────── */

export function setA(s, v) {
  const t = taskOf(s);
  if (s.world !== 'square' || s.free) return s;
  const a = Math.max(A_RANGE[0], Math.min(A_RANGE[1], Math.round(v * 2) / 2));
  if (a === s.a && s.trials.length > 0) return s;
  const stop = a * a;
  const tried = { neg: s.tried.neg || a < 0, pos: s.tried.pos || a > 0, vals: s.tried.vals.includes(a) ? s.tried.vals : [...s.tried.vals, a] };
  const ok = t.kind === 'sqVal' ? tried.vals.includes(1.5) && tried.vals.includes(-1.5) : false;
  const tr = Object.freeze({ kind: 'square', task: s.ti, taskId: t.id, free: false, a, stop: String(stop).replace('.', ','), negative: a < 0, ok: false });
  let done = s.done;
  let solved = s.solved;
  if (t.kind === 'sqVal' && ok && !done[s.ti]) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: { a: [1.5, -1.5] } }; }
  return { ...s, a, tried, trials: [...s.trials, tr], last: tr, done, solved };
}
export const stepA = (s, d) => setA(s, s.a + d * 0.5);

/** « لا يمكن » : ouvert après un essai de chaque signe ; la bonne réponse de sqNeg. */
export const canClaim = (s) => !s.free && taskOf(s).kind === 'sqNeg' && s.tried.neg && s.tried.pos;
export function claimImpossible(s) {
  const t = taskOf(s);
  if (s.free || t.kind !== 'sqNeg' || s.done[s.ti]) return s;
  if (!canClaim(s)) {
    const tr = Object.freeze({ kind: 'claim', task: s.ti, taskId: t.id, free: false, ok: false, early: true });
    return { ...s, trials: [...s.trials, tr], last: tr };
  }
  const tr = Object.freeze({ kind: 'claim', task: s.ti, taskId: t.id, free: false, ok: true, early: false });
  return { ...s, trials: [...s.trials, tr], last: tr, done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: { claimed: true } } };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const task = s.tasks[s.ti + 1];
  return { ...s, ti: s.ti + 1, board: boardOf(task), last: null, pred: { side: null, dist: null, ran: false }, n: 2, predicted: false, flipped: false, moved: false,
    a: s.world === 'square' ? s.a : null, claimed: false };
}

/** « إعادة » : la mission repart (programme de départ), les essais restent. */
function restartTask(s) {
  const task = taskOf(s);
  return { ...s, board: boardOf(task), last: null, pred: { side: null, dist: null, ran: false }, n: 2, predicted: false, flipped: false, moved: false, a: s.world === 'square' ? 2 : null };
}

/** « أعِد التجربة » (questions du labo) : LA MÊME mission repart, non résolue (ses lignes du سجلّ retirées). */
export function retryTask(s) {
  const { [s.ti]: _d, ...done } = s.done;
  const { [s.ti]: _s, ...solved } = s.solved;
  return { ...restartTask(s), done, solved, record: s.record.filter((r) => r.task !== s.ti), tried: { neg: false, pos: false, vals: [] }, claimed: false };
}

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

/** Un facteur de −10 à 10 avec au plus une décimale ; null si illisible. */
export function parseFactor(raw) {
  try {
    const str = String(raw).trim();
    if (str === '') return null;
    const r = rat(str);
    const v = Number(r.n) / Number(r.d);
    if (v < FREE_RANGE[0] || v > FREE_RANGE[1]) return null;
    if (Math.abs(v * 10 - Math.round(v * 10)) > 1e-9) return null;
    return canon(str);
  } catch { return null; }
}
export function addFree(s, raw) {
  const v = parseFactor(raw);
  if (v == null) return s;
  const base = s.free ?? { slots: Array(SLOTS).fill(null), tray: [] };
  const total = base.slots.filter(Boolean).length + base.tray.length;
  if (total >= SLOTS) return s;
  SEQ += 1;
  const tray = [...base.tray, { id: `f${SEQ}`, v }];
  return { ...s, free: { ...base, tray }, last: null };
}
export const clearFree = (s) => (s.free ? { ...s, free: { slots: Array(SLOTS).fill(null), tray: [] }, last: null } : s);
export const toGuided = (s) => (s.free ? { ...s, free: null, last: null } : s);

/* ── Preuves, registre, onboarding ──────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((x) => !x.free && x.task === i);

/** Les lignes du « سجلّ التجارب » : chaque arrêt validé, avec le nombre de cartes négatives (écrit par le labo, pas par l'élève). */
export function recordRows(s) {
  return s.record.map((r) => ({ ...r, programme: r.values.map(text), negText: String(r.negatives) }));
}

/**
 * Le prochain geste utile — jamais la réponse : `tray` (porter une carte), `sign` (le badge d'une carte), `swap` (tout programme dont l'ordre
 * compte), `side` (la prédiction), `run`, `impossible`, `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  const t = taskOf(s);
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-rt-next]', gesture: 'tap' } : null;
  const mine = guidedTrials(s);
  if (t.kind === 'predict' || (t.kind === 'repeat' && !s.predicted)) {
    if (s.pred.ran) return null;
    if (!s.pred.side) return { id: 'side', target: '[data-rt-sides]', gesture: 'tap' };
    if (canRun(s)) return { id: 'run', target: '[data-rt-run]', gesture: 'tap' };
    return null;
  }
  if (t.kind === 'repeat') return mine.length === 0 ? { id: 'repeat', target: '[data-rt-repeat]', gesture: 'tap' } : null;
  if (t.kind === 'sqNeg') return canClaim(s) ? { id: 'impossible', target: '[data-rt-impossible]', gesture: 'tap' } : { id: 'square', target: '[data-rt-a]', gesture: 'tap' };
  if (t.kind === 'sqVal') return mine.length === 0 ? { id: 'square', target: '[data-rt-a]', gesture: 'tap' } : null;
  if (t.tray.length && !s.moved) return { id: 'tray', target: '[data-rt-tray]', gesture: 'drag' };
  if (t.flip && !s.flipped) return { id: 'sign', target: '[data-rt-sign]', gesture: 'tap' };
  if (t.at && mine.length >= 2) return { id: 'swap', target: '[data-rt-slot]', gesture: 'drag' };
  if (t.flip && mine.length >= 2) return { id: 'swap', target: '[data-rt-slot]', gesture: 'drag' };
  return null;
}
