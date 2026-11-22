/**
 * scoop-scale — LA LOGIQUE PURE de « ميزان العطّار » (3AM, unité 5, درس « حصر عدد عشري موجب », 2026-10-26). Exacte : l'arrondi demi vers le haut,
 * les approximations et le quotient viennent de `packages/core/arithmetic/decimals.js` (importé PAR CHEMIN, jamais par le barrel du cœur).
 *
 * LE MODÈLE. Une balance de دكّان العطّار dont l'ÉCRAN arrondit la masse au rang `rank` (0 = le kilo, 1 = 0,1 kg, 2 = 0,01 kg), pendant qu'une
 * bande de précision écrit la masse exacte à la résolution `res` (= rank + 1 en général : 0,01 kg quand l'écran arrondit à 0,1). La MAIN tient la
 * MASSE : `m` est un entier d'unités de résolution (versée à la louche, une pincée = +1, reprise d'une pincée = −1).
 * Une tâche demande à la main de trouver où l'écran BASCULE :
 *   - `least` : la plus petite masse sur laquelle l'écran lit `reading` (l'extrémité gauche, incluse) ;
 *   - `most`  : la plus grande (l'extrémité droite est EXCLUE : une pincée de plus et l'écran lit autre chose) ;
 *   - `both`  : les deux, l'une après l'autre (échelle des gros sacs, rang 0) ;
 *   - `trap`  : la masse exacte est affichée ; un sachet modèle pèse a/b kg (2/7) et une lampe dit « plus léger / plus lourd / égal » : le sac le plus
 *               lourd qui reste plus léger, puis le plus léger qui devient plus lourd (la lampe ne dit jamais « égal » si a/b n'est pas décimal à ce rang).
 * « سلّم الكيس » (`deliver`) est l'ESSAI : la balance accepte ou refuse en disant pourquoi AVEC LES NOMBRES DE L'ÉLÈVE (le voisin « fantôme »).
 *
 * ÉVÉNEMENTS (`state.trials`) : { kind:'deliver', task, phase, mass, reading, ok, refused, neighbour:{ mass, reading, lamp? }, rank, res, free } ;
 * `state.touched` garde les masses visitées (masse → lecture) par tâche pour que les modules citent « à 1,35 l'écran a lu 1,4 ».
 */
import * as D from '@smarter-academy/core/arithmetic/decimals.js';

/** Les tâches par défaut de chaque niveau (la leçon peut passer les siennes). Les nombres sont du TEXTE exact. */
const PRESETS = Object.freeze({
  beginner: {
    tasks: [
      { id: 't1', kind: 'least', rank: 1, res: 2, reading: '1,3', start: '1,00' },
      { id: 't2', kind: 'most', rank: 1, res: 2, reading: '1,3', start: '1,25' },
      { id: 't3', kind: 'both', rank: 0, res: 2, reading: '2', start: '1,00', coarse: true },
    ],
  },
  advanced: {
    tasks: [
      { id: 'a1', kind: 'least', rank: 2, res: 3, reading: '5,68', start: '5,600' },
      { id: 'a2', kind: 'most', rank: 2, res: 3, reading: '5,68', start: '5,675' },
      { id: 'a3', kind: 'trap', rank: 3, res: 3, ref: { a: 2, b: 7 }, start: '0,250' },
    ],
  },
});

const parseMass = (text, res) => {
  const v = D.parse(String(text));
  if (!v) throw new Error(`scoopScale: mass illisible « ${text} »`);
  const w = v.k > res ? null : D.make(v.n * 10 ** (res - v.k), res);
  if (!w) throw new Error(`scoopScale: « ${text} » a plus de ${res} décimales`);
  return w.n;
};

const phasesOf = (kind) => (kind === 'both' ? ['least', 'most'] : kind === 'trap' ? ['heavyLight', 'lightHeavy'] : [kind]);

function buildTask(raw, i) {
  const rank = raw.rank;
  const res = raw.res ?? rank + 1;
  const t = {
    id: raw.id ?? `t${i}`, kind: raw.kind, rank, res, coarse: !!raw.coarse, phases: phasesOf(raw.kind),
    start: parseMass(raw.start ?? '0', res),
  };
  if (raw.kind === 'trap') {
    t.ref = { a: raw.ref.a, b: raw.ref.b };
    t.reading = null;
  } else {
    t.reading = raw.reading;
    const r = D.parse(raw.reading);
    if (!r || r.k !== rank) throw new Error(`scoopScale: la lecture « ${raw.reading} » doit avoir ${rank} décimale(s)`);
    t.target = r;
  }
  const whole = t.target ? Math.floor(t.target.n / D.pow10(t.target.k)) + 4 : 1;
  t.cap = raw.cap ? parseMass(raw.cap, res) : Math.max(t.start, 10 ** res * whole);
  return Object.freeze(t);
}

/** L'état de départ. `numbers` = { tasks }. */
export function init(numbers = {}) {
  const tasks = (numbers.tasks ?? PRESETS.beginner.tasks).map(buildTask);
  return fresh(tasks);
}
function fresh(tasks, extra = {}) {
  return {
    tasks, ti: 0, phase: 0, m: tasks[0].start, done: {}, trials: [], last: null, touched: {},
    free: null, poured: false, removed: false, lampLooked: false, refusedOnce: false, ...extra,
  };
}

export const taskOf = (s) => (s.free ? s.free.task : s.tasks[s.ti]);
export const phaseOf = (s) => taskOf(s).phases[s.phase] ?? taskOf(s).phases.at(-1);
export const isFree = (s) => !!s.free;
export const taskDone = (s, i = s.ti) => (s.free ? !!s.free.done : !!s.done[i]);
export const isTrap = (s) => taskOf(s).kind === 'trap';
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]) && s.refusedOnce;
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;

/* ── Lecture de l'état ───────────────────────────────────────────────────────────────────────── */

export const massAt = (s, m = s.m) => D.make(m, taskOf(s).res);
export const massText = (s, m = s.m) => D.format(massAt(s, m));
/** Ce que l'écran affiche pour m : l'arrondi au rang de la tâche (trap : la masse exacte à la résolution). */
const readingAt = (s, m = s.m) => {
  const t = taskOf(s);
  return D.format(D.roundAt(massAt(s, m), t.kind === 'trap' ? t.res : t.rank));
};
export const reading = (s) => readingAt(s);
/** Les deux repères d'écran autour de la masse : l'approximation par défaut et par excès au rang de l'écran. */
export function marksAround(s, m = s.m) {
  const t = taskOf(s);
  const v = massAt(s, m);
  const k = t.kind === 'trap' ? t.res : t.rank;
  return { lo: D.floorAt(v, k), hi: D.ceilAt(v, k), exact: D.eq(D.floorAt(v, k), D.ceilAt(v, k)) };
}

/** La lampe du sac contre le sachet modèle : '<' (plus léger), '>' (plus lourd) ou '=' (il balance). */
export function lamp(s, m = s.m) {
  const t = taskOf(s);
  if (t.kind !== 'trap') return null;
  const lhs = BigInt(m) * BigInt(t.ref.b);
  const rhs = BigInt(t.ref.a) * 10n ** BigInt(t.res);
  return lhs < rhs ? '<' : lhs > rhs ? '>' : '=';
}
/** Les deux repères de la bande autour du sachet modèle (pour dessiner où il se trouve entre deux graduations). */
export function refPosition(s) {
  const t = taskOf(s);
  if (t.kind !== 'trap') return null;
  const B = BigInt(t.ref.b);
  const num = BigInt(t.ref.a) * 10n ** BigInt(t.res);
  return { units: Number(num) / Number(B), exact: num % B === 0n };
}

/* ── Gestes ──────────────────────────────────────────────────────────────────────────────────── */

const clamp = (s, m) => Math.max(0, Math.min(taskOf(s).cap, Math.round(m)));
function touch(s, m) {
  const t = taskOf(s);
  const key = `${s.free ? 'f' : s.ti}:${m}`;
  if (s.touched[key]) return s.touched;
  return { ...s.touched, [key]: { task: s.free ? -1 : s.ti, m, mass: D.format(D.make(m, t.res)), reading: readingAt(s, m) } };
}
function setMass(s, m, flags = {}) {
  const next = clamp(s, m);
  if (next === s.m) return s;
  const t2 = { ...s, m: next, last: null, ...flags };
  return { ...t2, touched: touch(t2, next) };
}
/** Verse `units` unités (négatif : reprend). */
export const pour = (s, units) => setMass(s, s.m + units, units > 0 ? { poured: true } : { removed: true });
/** Une pincée de plus (+1) ou de moins (−1). */
export const pinch = (s, dir) => pour(s, dir >= 0 ? 1 : -1);
export const nudge = (s, units) => pour(s, units);
export const toStart = (s) => {
  const t = taskOf(s);
  return setMass(s, s.free ? s.free.startOf(s.phase) : t.start);
};
export const markLamp = (s) => (s.lampLooked ? s : { ...s, lampLooked: true });

/** « سلّم الكيس » : l'essai jugé. */
export function deliver(s) {
  const t = taskOf(s);
  const ph = phaseOf(s);
  const here = readingAt(s);
  const up = s.m + 1;
  const dn = s.m - 1;
  let ok = false;
  let refused = null;
  let ghost = null;
  const view = (m) => ({ m, mass: D.format(D.make(m, t.res)), reading: readingAt(s, m), ...(t.kind === 'trap' ? { lamp: lamp(s, m) } : {}) });
  if (t.kind === 'trap') {
    const l = lamp(s);
    if (ph === 'heavyLight') {
      if (l !== '<') refused = 'wrongSide';
      else if (lamp(s, up) === '<') { refused = 'notHeaviest'; ghost = view(up); } else ok = true;
    } else if (l !== '>') refused = 'wrongSide';
    else if (dn >= 0 && lamp(s, dn) === '>') { refused = 'notLightest'; ghost = view(dn); } else ok = true;
    ghost = ghost ?? view(ph === 'heavyLight' ? up : Math.max(0, dn));
  } else {
    const target = D.format(t.target);
    if (here !== target) { refused = 'wrongReading'; ghost = view(ph === 'least' ? Math.max(0, dn) : up); }
    else if (ph === 'least') {
      if (dn >= 0 && readingAt(s, dn) === target) { refused = 'notLeast'; ghost = view(dn); } else { ok = true; ghost = view(Math.max(0, dn)); }
    } else if (readingAt(s, up) === target) { refused = 'notMost'; ghost = view(up); } else { ok = true; ghost = view(up); }
  }
  const trial = Object.freeze({
    kind: 'deliver', task: s.free ? -1 : s.ti, taskKind: t.kind, phase: ph, mass: massText(s), m: s.m, reading: here, ok, refused,
    neighbour: ghost, rank: t.rank, res: t.res, free: !!s.free, ...(t.kind === 'trap' ? { lamp: lamp(s) } : {}),
  });
  let next = { ...s, last: trial, trials: [...s.trials, trial], refusedOnce: s.refusedOnce || !!refused };
  if (ok) {
    const last = s.phase >= t.phases.length - 1;
    if (last) {
      next = s.free ? { ...next, free: { ...s.free, done: true } } : { ...next, done: { ...s.done, [s.ti]: true } };
    } else next = { ...next, phase: s.phase + 1 };
  }
  return next;
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  const ti = s.ti + 1;
  return { ...s, ti, phase: 0, m: s.tasks[ti].start, last: null };
}
export const restartTask = (s) => ({ ...s, phase: 0, m: taskOf(s).start, last: null, ...(s.free ? { free: { ...s.free, done: false } } : { done: { ...s.done, [s.ti]: false } }) });

/* ── « جرّب أعدادك » : (a) une lecture d'écran, (b) un quotient a/b ──────────────────────────── */

/** « 7 » et « 7,0 » sont deux lectures : le NOMBRE de chiffres tapés fixe le rang. 0 < R < 100, 0 à 2 décimales. */
export function parseReading(text) {
  const raw = String(text ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', ',').trim();
  if (!/^\d{1,2}([,.]\d{1,2})?$/.test(raw)) return null;
  const v = D.parse(raw);
  if (!v || v.n === 0 || v.n >= 100 * 10 ** v.k) return null;
  return v;
}
export function parseQuotient(aText, bText) {
  const a = Number(String(aText).trim());
  const b = Number(String(bText).trim());
  if (!/^\d{1,3}$/.test(String(aText).trim()) || !/^\d{1,2}$/.test(String(bText).trim())) return null;
  if (a < 1 || a > 999 || b < 2 || b > 99) return null;
  return { a, b };
}

export function freeReading(s, text) {
  const v = parseReading(text);
  if (!v) return s;
  const rank = v.k;
  const task = buildTask({ id: 'free', kind: 'both', rank, res: rank + 1, reading: D.format(v), start: D.format(D.make(Math.max(0, v.n - 1) * 10, rank + 1)), coarse: rank === 0 }, 0);
  return {
    ...s, free: { kind: 'reading', task, done: false, startOf: (ph) => (ph === 0 ? task.start : v.n * 10) }, phase: 0, m: task.start, last: null,
  };
}
export function freeQuotient(s, aText, bText, rank) {
  const q = parseQuotient(aText, bText);
  if (!q || ![1, 2, 3].includes(rank)) return s;
  const br = D.quotientBracket(q.a, q.b, rank);
  const start = Math.max(0, br.lo.n - 12);
  const task = buildTask({ id: 'freeq', kind: 'trap', rank, res: rank, ref: q, start: D.format(D.make(start, rank)), cap: D.format(D.make(br.hi.n + 40, rank)) }, 0);
  return { ...s, free: { kind: 'quotient', task, done: false, q, startOf: () => start }, phase: 0, m: task.start, last: null };
}
export const toGuided = (s) => (s.free ? { ...s, free: null, phase: 0, m: s.tasks[s.ti].start, last: null } : s);

/* ── Lecture ─────────────────────────────────────────────────────────────────────────────────── */

export const trialEvidence = (tr) => ({ ...tr });
const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/**
 * Le prochain geste utile — jamais la réponse : `pour` (verser), `remove` (reprendre une pincée), `deliver`, `tryEnd` (une fois : le contraste, une
 * pincée de plus puis « سلّم »), `lamp` (trap : regarder la lampe), `next`. `null` en libre et quand la découverte est gagnée.
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) {
    if (canNext(s)) return { id: 'next', target: '[data-ss-next]', gesture: 'tap' };
    if (!s.refusedOnce) return { id: 'tryEnd', target: '[data-ss-scoop]', gesture: 'tap' };
    return null;
  }
  const t = taskOf(s);
  const mine = guidedTrials(s);
  if (t.kind === 'trap' && !s.lampLooked) return { id: 'lamp', target: '[data-ss-lamp]', gesture: 'tap' };
  if (!s.poured && mine.length === 0) return { id: 'pour', target: '[data-ss-scoop]', gesture: 'hold' };
  if (!s.removed && mine.length === 0) return { id: 'remove', target: '[data-ss-pan]', gesture: 'tap' };
  if (mine.length === 0 || s.last == null || s.last.ok) return { id: 'deliver', target: '[data-ss-deliver]', gesture: 'tap' };
  return null;
}

/* ── Découverte : les réfutations avec SES essais ────────────────────────────────────────────── */

/**
 * Les deux extrémités qu'il a TROUVÉES (la plus petite et la plus grande masse acceptées pour une même lecture, rang par rang) et les masses
 * qui réfutent chaque fausse conjecture. `null` tant qu'il manque un essai accepté.
 */
export function witnesses(s) {
  const good = s.trials.filter((t) => !t.free && t.ok && t.taskKind !== 'trap');
  const pairFor = (rank) => {
    const lo = good.findLast((t) => t.phase === 'least' && t.rank === rank);
    const hi = good.findLast((t) => t.phase === 'most' && t.rank === rank && lo && t.reading === lo.reading);
    return lo && hi ? { lo, hi } : null;
  };
  const trap = s.trials.findLast((t) => !t.free && t.ok && t.taskKind === 'trap' && t.phase === 'heavyLight');
  const trap2 = s.trials.findLast((t) => !t.free && t.ok && t.taskKind === 'trap' && t.phase === 'lightHeavy');
  const out = { pairs: {}, trap: trap && trap2 ? { below: trap, above: trap2 } : null };
  for (const rank of [0, 1, 2]) { const p = pairFor(rank); if (p) out.pairs[rank] = p; }
  const first = out.pairs[1] ?? out.pairs[2] ?? out.pairs[0] ?? null;
  out.main = first ? {
    reading: first.lo.reading, rank: first.lo.rank, res: first.lo.res, least: first.lo.mass, most: first.hi.mass,
    excluded: first.hi.neighbour.mass, excludedReading: first.hi.neighbour.reading, below: first.lo.neighbour.mass, belowReading: first.lo.neighbour.reading,
  } : null;
  return out;
}
