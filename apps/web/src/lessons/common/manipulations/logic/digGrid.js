/**
 * dig-grid — LA LOGIQUE PURE de « شبكة الحفرية » (2AM, unité 3 « الأعداد النسبية », درس « تعليم نقطة في المستوي », 2026-10-29).
 * Exacte : positions et coordonnées sont des points { x, y } en CENTIÈMES de mètre ; les maths viennent de `packages/core/arithmetic/relative.js`
 * (E4 : `point`, `coordsOf`, `originFor`, `consistent`, `symX`, `quadrantOf`, `parsePoint`, importé PAR CHEMIN).
 *
 * LE MODÈLE. Une fouille carrée (9 × 7 mètres) est quadrillée de ficelles ; des trouvailles gisent à des croisements (positions MONDE cachées).
 * Le piquet d'origine (deux cordes : l'axe des abscisses, bleu, et l'axe des ordonnées, vert) est posé à un croisement. Les coordonnées d'une
 * trouvaille sont une SORTIE : (sa position) − (celle du piquet), l'abscisse d'abord. La MAIN tient
 *   مبتدئ — le PIQUET (un glissement 2D : les deux coordonnées de chaque trouvaille changent) ; le carnet du chef de chantier donne les relevés à obtenir ;
 *   متقدم — un POINT touché ou ÉCRIT : le piquet est fixe, l'élève prédit les coordonnées (étiquettes voilées), pose une bague entre deux ficelles,
 *           marque la place miroir d'une pièce par rapport à la corde bleue.
 * Tâches : `stake` (amener le piquet pour que les relevés du carnet soient vrais ; `none` : aucun piquet ne convient), `typed` (écrire les
 * coordonnées de trouvailles), `tap` (toucher des points de coordonnées données, demi-mètres compris), `mirror` (le symétrique d'une trouvaille).
 *
 * ÉVÉNEMENTS (`state.trials`) :
 *   { kind:'stake', task, at, ok, model }   { kind:'none', task, ok }   { kind:'typed', task, find, value, ok, model }
 *   { kind:'tap', task, target, at, ok }     { kind:'solved', task }     { kind:'custom', free:true }
 */
import * as R from '@smarter-academy/core/arithmetic/relative.js';

export const COLS = 9; // mètres est-ouest
export const ROWS = 7; // mètres sud-nord
/** Les trouvailles : position monde (colonne, rangée) en mètres, cachée de l'élève. */
export const FINDS = Object.freeze({ jar: [5, 4], lamp: [2, 5], plate: [2, 1], coin: [6, 2], tile: [4, 6], bead: [3, 1] });
const P = (x, y) => R.point(x, y);
const worldOf = (id) => P(FINDS[id][0], FINDS[id][1]);
const tx = (p) => R.pointText(p);

const PRESETS = Object.freeze({
  beginner: { tasks: [
    { id: 'd1', kind: 'stake', start: [1, 1], notes: [{ find: 'jar', want: '2;1' }] },
    { id: 'd2', kind: 'stake', start: [6, 1], notes: [{ find: 'lamp', want: '-3;2' }] },
    { id: 'd3', kind: 'stake', start: [1, 1], notes: [{ find: 'jar', want: '2;1' }, { find: 'plate', want: '-1;-2' }] },
    { id: 'd4', kind: 'stake', start: [1, 1], none: true, notes: [{ find: 'jar', want: '2;1' }, { find: 'plate', want: '1;2' }] },
  ] },
  advanced: { tasks: [
    { id: 'p1', kind: 'typed', stake: '3;3', finds: ['coin', 'tile', 'bead'] },
    { id: 'p2', kind: 'tap', stake: '3;3', targets: [{ name: 'ring', at: '2.5;-1.5' }, { name: 'arrow', at: '-1.5;0' }] },
    { id: 'p3', kind: 'mirror', stake: '3;3', find: 'coin' },
  ] },
});

const pt = (s) => { const [x, y] = String(s).split(';'); return P(x, y); };

/** Les tâches normalisées en centièmes. Lève si mal formées. */
function normalizeTasks(list) {
  return list.map((t, i) => {
    const id = t.id ?? `t${i}`;
    if (t.kind === 'stake') {
      const notes = t.notes.map((n) => { if (!(n.find in FINDS)) throw new Error(`digGrid: trouvaille inconnue « ${n.find} »`); return { find: n.find, want: pt(n.want), world: worldOf(n.find) }; });
      const answer = R.consistent(notes.map((n) => ({ world: n.world, wanted: n.want })));
      if (!!t.none !== (answer === null)) throw new Error(`digGrid: ${id} — « none » ne correspond pas aux relevés`);
      if (answer && (answer.x < 0n || answer.y < 0n || answer.x > BigInt(COLS) * 100n || answer.y > BigInt(ROWS) * 100n)) throw new Error(`digGrid: ${id} — piquet hors de la fouille`);
      return Object.freeze({ id, kind: 'stake', start: t.start ?? [1, 1], notes, answer, none: !!t.none });
    }
    for (const f of t.finds ?? (t.find ? [t.find] : [])) if (!(f in FINDS)) throw new Error(`digGrid: trouvaille inconnue « ${f} »`);
    const stake = pt(t.stake ?? '3;3');
    if (t.kind === 'typed') return Object.freeze({ id, kind: 'typed', stake, finds: t.finds });
    if (t.kind === 'tap') return Object.freeze({ id, kind: 'tap', stake, targets: t.targets.map((g) => ({ name: g.name, at: pt(g.at) })) });
    if (t.kind === 'mirror') return Object.freeze({ id, kind: 'mirror', stake, find: t.find });
    throw new Error(`digGrid: genre inconnu « ${t.kind} »`);
  });
}

export function init(numbers = {}) {
  const tasks = normalizeTasks(numbers.tasks ?? PRESETS.beginner.tasks);
  if (!tasks.length) throw new Error('aucune tâche');
  return fresh({ tasks, ti: 0, done: {}, solved: {}, trials: [], free: null });
}
function fresh(s) {
  const t = s.tasks[s.ti];
  const stake = t.kind === 'stake' ? P(t.start[0], t.start[1]) : t.stake;
  return { ...s, stake, ai: 0, moved: false, last: null, ghost: null, freshStart: true };
}

/* ── Lectures ── */
export const taskOf = (s) => s.tasks[s.ti];
export const isFree = (s) => !!s.free;
const isStakeTask = (s) => !s.free && taskOf(s).kind === 'stake';
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
/** Le piquet ne se déplace que dans les tâches `stake` (et jamais après la réussite). */
export const stakeLocked = (s) => s.free ? false : !(taskOf(s).kind === 'stake') || taskDone(s);
/** Les relevés d'une trouvaille avec le piquet courant. */
export const readingOf = (s, id) => R.coordsOf(worldOf(id), s.stake);
/** Les lignes du carnet : { find, want, reading, ok }. */
export function notebook(s) {
  const t = taskOf(s);
  if (t.kind !== 'stake') return [];
  return t.notes.map((n) => { const reading = readingOf(s, n.find); return { find: n.find, want: n.want, reading, ok: reading.x === n.want.x && reading.y === n.want.y }; });
}
export const stakeCells = (s) => ({ c: Number(s.stake.x / 100n), r: Number(s.stake.y / 100n) });
/** La trouvaille à écrire (typed / mirror). */
export const currentFind = (s) => { const t = taskOf(s); if (s.free || taskDone(s)) return null; return t.kind === 'typed' ? t.finds[s.ai] ?? null : t.kind === 'mirror' ? t.find : null; };
export const currentTarget = (s) => { const t = taskOf(s); if (s.free || taskDone(s) || t.kind !== 'tap') return null; return t.targets[s.ai] ?? null; };
/** Les trouvailles montrées dans la scène (les autres restent à leur place mais sans étiquette). */
export const regionKey = (p) => { const q = R.quadrantOf(p); return typeof q === 'number' ? `q${q}` : q; };

/* ── Gestes : le piquet ── */
export function setStake(s, c, r) {
  if (stakeLocked(s) && !s.free) return s;
  const cc = Math.max(0, Math.min(COLS, Math.round(c)));
  const rr = Math.max(0, Math.min(ROWS, Math.round(r)));
  const stake = P(cc, rr);
  if (stake.x === s.stake.x && stake.y === s.stake.y) return s;
  const next = { ...s, stake, moved: true, ghost: null };
  if (s.free) return next;
  const t = taskOf(s);
  const rows = notebook(next);
  const allOk = rows.every((x) => x.ok);
  const swapped = !allOk && rows.every((x) => x.reading.x === x.want.y && x.reading.y === x.want.x);
  const trial = Object.freeze({ kind: 'stake', task: s.ti, at: tx(R.coordsOf(stake, P(0, 0))), ok: allOk ? true : swapped ? false : undefined, model: allOk ? 'right' : swapped ? 'swap' : 'other' });
  next.trials = [...s.trials, trial]; next.last = trial;
  if (allOk && !t.none) { next.done = { ...s.done, [s.ti]: true }; next.solved = { ...s.solved, [s.ti]: trial }; }
  return next;
}
export const moveStake = (s, dc, dr) => { const { c, r } = stakeCells(s); return setStake(s, c + dc, r + dr); };

/** « لا يوجد موضع » : juste seulement si aucun piquet ne convient ; sinon refusé, et le bon piquet est montré. */
export function pressNone(s) {
  if (!isStakeTask(s) || taskDone(s)) return s;
  const t = taskOf(s);
  const ok = t.none;
  const trial = Object.freeze({ kind: 'none', task: s.ti, ok });
  const base = { ...s, trials: [...s.trials, trial], last: trial };
  if (ok) return { ...base, done: { ...s.done, [s.ti]: true }, solved: { ...s.solved, [s.ti]: trial } };
  return { ...base, ghost: { kind: 'stake', at: t.answer } };
}

/* ── Écrire un point ── */
const parseTyped = (raw) => R.parsePoint(raw);

/** Le jugement d'un relevé écrit : { ok, model, want, value } — `model` ∈ right | swap | onAxis | signAxis | signLeft | same | symMix | other | format. */
export function judgeTyped(s, raw) {
  const t = taskOf(s);
  const got = parseTyped(raw);
  const id = currentFind(s);
  const base = coordsOnly(s, id);
  const want = t.kind === 'mirror' ? R.symX(base) : base;
  if (!got) return { ok: false, model: 'format', want };
  if (got.x === want.x && got.y === want.y) return { ok: true, model: 'right', want, value: got };
  let model = 'other';
  if (t.kind === 'mirror') {
    if (got.x === base.x && got.y === base.y) model = 'same';
    else if (got.x === -want.x && got.y === -want.y) model = 'symMix';
    else if (got.x === -base.x && got.y === -base.y) model = 'bothSigns';
  } else {
    const isSwap = got.x === want.y && got.y === want.x;
    if (isSwap && (want.x === 0n || want.y === 0n)) model = 'onAxis';
    else if (isSwap) model = 'swap';
    else if (got.x === want.x && got.y === -want.y) model = 'signAxis';
    else if (got.x === -want.x && got.y === want.y) model = 'signLeft';
  }
  return { ok: false, model, want, value: got };
}
function coordsOnly(s, id) { return R.coordsOf(worldOf(id), taskOf(s).stake); }

export function answerTyped(s, raw) {
  const t = taskOf(s);
  if (taskDone(s) || (t.kind !== 'typed' && t.kind !== 'mirror')) return s;
  const find = currentFind(s);
  const j = judgeTyped(s, raw);
  const trial = Object.freeze({ kind: 'typed', task: s.ti, find, value: j.value ? tx(j.value) : String(raw), ok: j.ok, model: j.model, want: tx(j.want), free: false });
  let { done, solved, ai } = s;
  if (j.ok && t.kind === 'typed') {
    ai += 1;
    if (ai >= t.finds.length) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: trial }; }
  } else if (j.ok) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: trial }; }
  return { ...s, ai, done, solved, trials: [...s.trials, trial], last: trial, ghost: j.ok || !j.value ? null : { kind: 'typed', model: j.model, at: j.value, find } };
}

/* ── Toucher un point (tap) : demi-mètres ── */
export function tapAt(s, wx, wy) {
  const tg = currentTarget(s);
  if (!tg) return s;
  const t = taskOf(s);
  const half = (v) => BigInt(Math.round(v * 2)) * 50n;
  const world = { x: half(wx), y: half(wy) };
  const at = R.coordsOf(world, t.stake);
  const ok = at.x === tg.at.x && at.y === tg.at.y;
  const trial = Object.freeze({ kind: 'tap', task: s.ti, target: tg.name, at: tx(at), ok, free: false });
  let { ai, done, solved } = s;
  if (ok) { ai += 1; if (ai >= t.targets.length) { done = { ...done, [s.ti]: true }; solved = { ...solved, [s.ti]: trial }; } }
  return { ...s, ai, done, solved, trials: [...s.trials, trial], last: trial, ghost: ok ? null : { kind: 'tap', at, world } };
}

export function nextTask(s) { return canNext(s) ? fresh({ ...s, ti: s.ti + 1 }) : s; }
export function retryTask(s) {
  const strip = (o) => { const c = { ...o }; delete c[s.ti]; return c; };
  return fresh({ ...s, done: strip(s.done), solved: strip(s.solved) });
}

/* ── « جرّب أعدادك » : un point (x ; y), |x|, |y| ≤ 6 ── */
export function parseFree(raw) {
  const p = R.parsePoint(raw);
  if (!p) return null;
  const lim = 600n;
  if (p.x > lim || p.x < -lim || p.y > lim || p.y < -lim) return null;
  return p;
}
export function setFree(s, raw) {
  const p = parseFree(raw);
  if (!p) return s;
  return { ...s, free: { p }, last: Object.freeze({ kind: 'custom', free: true }) };
}
export const toGuided = (s) => (s.free ? fresh({ ...s, free: null }) : s);

export const trialEvidence = (tr) => tr;

/* ── Onboarding (LabCoach) ── */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-dg-next]', gesture: 'tap', prefer: 'below' } : null;
  const t = taskOf(s);
  const mine = s.trials.filter((x) => x.task === s.ti);
  if (t.kind === 'stake') {
    if (t.none && mine.filter((x) => x.kind === 'stake').length >= 3) return { id: 'none', target: '[data-dg-none]', gesture: 'tap', prefer: 'above' };
    return s.moved ? { id: 'read', target: '[data-dg-note]', gesture: 'tap', prefer: 'below' } : { id: 'stake', target: '[data-dg-stake]', gesture: 'drag', prefer: 'above' };
  }
  if (t.kind === 'tap') return { id: 'tap', target: '[data-dg-svg]', gesture: 'tap', prefer: 'above' };
  return { id: t.kind === 'mirror' ? 'mirror' : 'type', target: '[data-dg-answer]', gesture: 'tap', prefer: 'below' };
}
