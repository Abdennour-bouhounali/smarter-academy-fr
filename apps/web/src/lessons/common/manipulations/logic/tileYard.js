/**
 * tile-yard — la logique PURE de « حوش البلاط » (1AM, unité 11, درس « مساحة سطح مستو ومحيطه »). Aucun React ici. Toute la vérité est
 * EXACTE : des entiers et des demis (`@smarter-academy/core/arithmetic/surfaces.js`, importé par chemin).
 *
 * L'idée. La main tient UN CARREAU (une unité d'aire) et le porte. Une cour est un ensemble de carreaux sur une grille ; son AIRE est le nombre
 * de carreaux, son PÉRIMÈTRE le nombre de côtés de carreau sur la clôture. Deux mesures qu'on LIT (jamais qu'on tape) et que le même geste
 * déplace indépendamment. La mathématique résiste : un carreau qui détacherait la cour (`detached`), la couperait en deux (`splits`),
 * refermerait un creux (`hole`) ou ferait éclater le rouleau de corde (`rope`) revient à sa place.
 *
 * Deux mondes :
 *   yard   mode `fence` : 12 carreaux seulement DÉPLACÉS (aire constante, clôture variable) ; mode `rope` : un rouleau de 12 bâtons (clôture
 *          fixe) et des carreaux libres (tas à côté de la grille) : même périmètre, aires différentes ;
 *   floor  poser des carreaux d'une unité sur un sol (entiers, puis demis le long d'un bord oblique, puis l'unité double) pour LIRE l'aire :
 *          le nombre dépend de l'unité (21 unités ① = 10,5 unités ②).
 *
 * Les événements (`events`, dans l'ordre) sont ceux que la leçon lit (`state.report`) — formes exactes dans le brief :
 *   yard   { kind: 'move'|'add'|'remove', world: 'yard', mode, tiles, fence, prevFence } · { kind: 'refused', reason }
 *          · { kind: 'walk', tiles, fence } · { kind: 'keep', mode, tiles, fence, shape } · { kind: 'task', task }
 *   floor  { kind: 'lay', scene, unit, area[, areaTwo] } · { kind: 'refused', scene, reason } · { kind: 'read', scene, unit, value }
 */
import * as S from '@smarter-academy/core/arithmetic/surfaces.js';

export const ROWS = 7;
export const COLS = 10;
export const TILES = 12; // les carreaux du mode `fence`
export const ROPE = 12; // les bâtons du rouleau (mode `rope`)
const HEAP = 12; // les carreaux du tas (mode `rope`)
const YARD_TASKS = Object.freeze({ fence: Object.freeze(['shortest', 'twenty']), rope: Object.freeze(['biggest', 'smallest']) });
/** La clôture à atteindre / le nombre de carreaux à atteindre, par tâche (la machine ne les dit jamais à l'élève). */
export const TASK_GOAL = Object.freeze({ shortest: { fence: 14 }, twenty: { fence: 20 }, biggest: { tiles: 9 }, smallest: { tiles: 5 } });
const FLOOR_SCENES = Object.freeze(['terrace-halves', 'terrace-double']);

const sameCell = (a, b) => a[0] === b[0] && a[1] === b[1];

/** Les scènes du sol : cellules entières, demi-cellules (`h` = le coin que garde le triangle : 'ul' haut-gauche, 'ur', 'dl', 'dr'). */
const rowsOf = (lengths) => lengths.flatMap((len, r) => Array.from({ length: len }, (_, c) => [r, c]));
export const SCENES = Object.freeze({
  // 14 cellules entières + 4 demi-cellules le long d'un bord oblique : 16 unités ①
  'terrace-halves': Object.freeze({
    rows: 4, cols: 6, whole: rowsOf([5, 4, 3, 2]),
    halves: [{ r: 0, c: 5, h: 'ul' }, { r: 1, c: 4, h: 'ul' }, { r: 2, c: 3, h: 'ul' }, { r: 3, c: 2, h: 'ul' }],
    units: ['one'],
  }),
  // 21 cellules entières en escalier (pas un rectangle) : 21 unités ①, 10,5 unités ②
  'terrace-double': Object.freeze({ rows: 5, cols: 6, whole: rowsOf([2, 3, 5, 5, 6]), halves: [], units: ['one', 'two'] }),
});

/* ═════════════ Construction ═════════════ */

const rectangleYard = () => {
  const tiles = [];
  let id = 0;
  for (let r = 2; r <= 3; r += 1) for (let c = 2; c <= 7; c += 1) { tiles.push({ id, r, c }); id += 1; }
  return tiles;
};

/** Les tâches (ou scènes) demandées : celles de la leçon (filtrées) ou celles du monde. */
export function tasksFor(world, mode, tasks) {
  if (world === 'floor') {
    const asked = Array.isArray(tasks) ? tasks.filter((t) => FLOOR_SCENES.includes(t)) : [];
    return asked.length ? asked : [...FLOOR_SCENES];
  }
  return [...YARD_TASKS[mode === 'rope' ? 'rope' : 'fence']];
}

export function init({ world = 'yard', mode = 'fence', tasks } = {}) {
  const w = world === 'floor' ? 'floor' : 'yard';
  const m = mode === 'rope' ? 'rope' : 'fence';
  const list = tasksFor(w, m, tasks);
  const base = { world: w, mode: w === 'yard' ? m : 'floor', tasks: list, ti: 0, done: list.map(() => false), last: null, events: [] };
  if (w === 'floor') return { ...base, phase: 'one', pieces: [], nextId: 0, reads: {}, swept: false, laidAny: false };
  return {
    ...base, rows: ROWS, cols: COLS, rope: m === 'rope' ? ROPE : null,
    tiles: m === 'fence' ? rectangleYard() : [], nextId: m === 'fence' ? TILES : 0,
    kept: [], walks: 0, moves: 0, keptNow: false,
  };
}

const push = (s, ev, patch = {}) => ({ ...s, ...patch, events: [...s.events, ev] });
const cellsOf = (s) => s.tiles.map((t) => [t.r, t.c]);

/* ═════════════ Lecture : monde yard ═════════════ */

const isYard = (s) => s.world === 'yard';
export const isFloor = (s) => s.world === 'floor';
export const taskOf = (s) => s.tasks[s.ti];
export const taskDone = (s) => !!s.done[s.ti];
export const canNext = (s) => taskDone(s) && s.ti < s.tasks.length - 1;
export const allTasksDone = (s) => s.done.every(Boolean);

/** L'aire : le nombre de carreaux posés. */
export const tilesOf = (s) => s.tiles.length;
/** Le périmètre : le nombre de bâtons de clôture. */
export const fenceOf = (s) => S.perimeter(cellsOf(s));
export const heapOf = (s) => HEAP - s.tiles.length;
export const ropeLeft = (s) => (s.rope == null ? null : s.rope - fenceOf(s));
const shapeOf = (s) => S.canonical(cellsOf(s));
export const tileAt = (s, r, c) => s.tiles.find((t) => t.r === r && t.c === c) ?? null;
export const inGrid = (s, r, c) => r >= 0 && r < s.rows && c >= 0 && c < s.cols;

/** Le carreau `id` peut-il être soulevé ? { ok } ou { ok:false, reason: 'splits'|'hole' }. */
export function liftable(s, id) {
  const t = s.tiles.find((x) => x.id === id);
  if (!t) return { ok: false, reason: 'absent' };
  return S.liftCheck(cellsOf(s), [t.r, t.c]);
}

/** Pose possible de `id` (ou d'un carreau du tas si `id === null`) en `to` ? Raison ∈ occupied | outside | detached | hole | rope. */
export function dropVerdict(s, id, to) {
  if (!inGrid(s, to[0], to[1])) return { ok: false, reason: 'outside' };
  const rest = id === null ? cellsOf(s) : s.tiles.filter((t) => t.id !== id).map((t) => [t.r, t.c]);
  const chk = S.dropCheck(rest, to);
  if (!chk.ok) return chk;
  const fence = S.perimeter([...rest, to]);
  if (s.rope != null && fence > s.rope) return { ok: false, reason: 'rope', fence };
  return { ok: true, fence };
}

/** Les cellules où le carreau tenu peut atterrir (elles brillent). */
export function legalDrops(s, id) {
  const out = [];
  for (let r = 0; r < s.rows; r += 1) for (let c = 0; c < s.cols; c += 1) {
    if (id !== null && s.tiles.some((t) => t.id === id && t.r === r && t.c === c)) continue;
    if (dropVerdict(s, id, [r, c]).ok) out.push([r, c]);
  }
  return out;
}

/** La cour telle qu'elle serait si `id` (ou un carreau du tas) était posé en `to` : cellules + clôture (le fantôme). */
export function preview(s, id, to) {
  const rest = id === null ? cellsOf(s) : s.tiles.filter((t) => t.id !== id).map((t) => [t.r, t.c]);
  const cells = [...rest, to];
  return { cells, fence: S.perimeter(cells), tiles: cells.length };
}

/* ═════════════ Gestes : monde yard ═════════════ */

const refuse = (s, reason, extra = {}) => push(s, { kind: 'refused', reason }, { last: { event: 'refused', reason, ...extra }, keptNow: false });

const placed = (s, kind, tiles, prevFence) => {
  const cells = tiles.map((t) => [t.r, t.c]);
  const fence = S.perimeter(cells);
  return push({ ...s, tiles }, { kind, world: 'yard', mode: s.mode, tiles: tiles.length, fence, prevFence }, {
    tiles, moves: s.moves + 1, last: { event: kind, tiles: tiles.length, fence, prevFence }, keptNow: false,
  });
};

/** Déplacer le carreau `id` vers `to`. Refusé : revient (état = même cour + événement `refused`). Poser sur place = rien. */
export function moveTile(s, id, to) {
  const t = s.tiles.find((x) => x.id === id);
  if (!t || sameCell([t.r, t.c], to)) return s;
  const lift = liftable(s, id);
  if (!lift.ok) return refuse(s, lift.reason);
  const v = dropVerdict(s, id, to);
  if (!v.ok) {
    if (v.reason === 'occupied' || v.reason === 'outside') return s;
    return refuse(s, v.reason, { fence: v.fence });
  }
  const tiles = s.tiles.map((x) => (x.id === id ? { ...x, r: to[0], c: to[1] } : x));
  return placed(s, 'move', tiles, fenceOf(s));
}

/** L'élève essaie de soulever `id` : si la cour se briserait, le geste ne commence pas et le refus est noté (`splits` | `hole`). */
export function tryLift(s, id) {
  const l = liftable(s, id);
  return l.ok || l.reason === 'absent' ? s : refuse(s, l.reason);
}

/** Mode `rope` : un carreau du tas posé en `to`. */
export function addTile(s, to) {
  if (s.mode !== 'rope' || heapOf(s) <= 0) return s;
  const v = dropVerdict(s, null, to);
  if (!v.ok) {
    if (v.reason === 'occupied' || v.reason === 'outside') return s;
    return refuse(s, v.reason, { fence: v.fence });
  }
  const tiles = [...s.tiles, { id: s.nextId, r: to[0], c: to[1] }];
  return { ...placed(s, 'add', tiles, fenceOf(s)), nextId: s.nextId + 1 };
}

/** Mode `rope` : un carreau rendu au tas. */
export function removeTile(s, id) {
  if (s.mode !== 'rope') return s;
  const lift = liftable(s, id);
  if (!lift.ok) return lift.reason === 'absent' ? s : refuse(s, lift.reason);
  return placed(s, 'remove', s.tiles.filter((t) => t.id !== id), fenceOf(s));
}

/** « أمشِ حول السياج » terminé : la clôture a été parcourue, un bâton après l'autre. */
export function walked(s) {
  if (s.tiles.length === 0) return s;
  return push(s, { kind: 'walk', tiles: s.tiles.length, fence: fenceOf(s) }, { walks: s.walks + 1, last: { event: 'walk', fence: fenceOf(s), tiles: s.tiles.length } });
}

/** « أحتفظ بهذا الحوش » est possible : en `rope` seulement quand le rouleau est utilisé en entier. */
export function canKeep(s) {
  if (!isYard(s) || s.tiles.length === 0) return false;
  if (s.rope != null) return fenceOf(s) === s.rope;
  return true;
}
export const isKept = (s) => s.kept.some((k) => k.shape === shapeOf(s));

/** Tamponner la cour dans le carnet ; jamais deux cours superposables. Vérifie la tâche en cours. */
export function keep(s) {
  if (!canKeep(s)) return s;
  const shape = shapeOf(s);
  if (s.kept.some((k) => k.shape === shape)) return { ...s, last: { event: 'duplicate' }, keptNow: false };
  const fence = fenceOf(s);
  const entry = { id: s.kept.length, shape, tiles: s.tiles.length, fence, cells: cellsOf(s) };
  let next = push(s, { kind: 'keep', mode: s.mode, tiles: entry.tiles, fence, shape }, { kept: [...s.kept, entry], last: { event: 'keep', tiles: entry.tiles, fence }, keptNow: true });
  const goal = TASK_GOAL[taskOf(next)];
  if (!next.done[next.ti] && goal && (goal.fence == null || goal.fence === fence) && (goal.tiles == null || goal.tiles === entry.tiles)) {
    const done = next.done.map((d, i) => d || i === next.ti);
    next = push(next, { kind: 'task', task: taskOf(next) }, { done, last: { event: 'task', task: taskOf(next), tiles: entry.tiles, fence } });
  }
  return next;
}

/**
 * « أعِد التجربة » (questions du labo) : LA MÊME tâche repart — la cour de départ, la tâche rouverte, et la cour du carnet qui l'avait
 * remplie retirée (sinon la refaire serait refusée comme doublon). Sol : la scène repart vide.
 */
export function retryTask(s) {
  const done = s.done.map((d, i) => (i === s.ti ? false : d));
  if (isFloor(s)) {
    const reads = { ...s.reads };
    delete reads[s.tasks[s.ti]];
    return { ...s, done, reads, phase: 'one', pieces: [], swept: false, laidAny: false, last: null };
  }
  const goal = TASK_GOAL[taskOf(s)] ?? {};
  const fits = (k) => (goal.fence == null || goal.fence === k.fence) && (goal.tiles == null || goal.tiles === k.tiles);
  const tiles = s.mode === 'fence' ? rectangleYard() : [];
  return { ...s, done, kept: s.kept.filter((k) => !fits(k)), tiles, nextId: tiles.length, last: null, keptNow: false };
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  return { ...s, ti: s.ti + 1, last: null, keptNow: false };
}

/* ═════════════ Découverte (yard) ═════════════ */

const distinct = (list, f) => new Set(list.map(f)).size;

/**
 * La relation est visible quand l'élève a gardé assez de cours : fence ≥ 3 cours à ≥ 3 clôtures différentes dont la plus courte (14) ;
 * rope ≥ 3 cours à ≥ 3 nombres de carreaux différents dont 9 et 5. Sol : les deux scènes lues.
 */
export function discoveryReady(s) {
  if (isFloor(s)) return finished(s);
  const k = s.kept;
  if (k.length < 3) return false;
  if (s.mode === 'fence') return distinct(k, (x) => x.fence) >= 3 && k.some((x) => x.fence === TASK_GOAL.shortest.fence);
  return distinct(k, (x) => x.tiles) >= 3 && k.some((x) => x.tiles === TASK_GOAL.biggest.tiles) && k.some((x) => x.tiles === TASK_GOAL.smallest.tiles);
}

/** L'étendue d'un cour (le plus grand côté de son rectangle englobant) : « le plus long à voir ». */
function reach(cells) {
  let r0 = Infinity; let r1 = -Infinity; let c0 = Infinity; let c1 = -Infinity;
  for (const [r, c] of cells) { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); }
  return Math.max(r1 - r0 + 1, c1 - c0 + 1);
}

/** Les témoins des fausses conjectures, pris dans SES cours gardés. */
export function witnesses(s) {
  const k = s.kept;
  const byFence = [...k].sort((a, b) => a.fence - b.fence);
  const byTiles = [...k].sort((a, b) => a.tiles - b.tiles);
  const lo = byFence[0] ?? { fence: 14, tiles: 12 };
  const hi = byFence[byFence.length - 1] ?? { fence: 16, tiles: 12 };
  const few = byTiles[0] ?? { fence: 12, tiles: 5, cells: [[0, 0]] };
  const many = byTiles[byTiles.length - 1] ?? { fence: 12, tiles: 9, cells: [[0, 0]] };
  return { lo, hi, few, many, tiles: lo.tiles, rope: s.rope ?? ROPE, longest: few.cells ? reach(few.cells) : 5, widest: many.cells ? reach(many.cells) : 3 };
}

/** Pour la règle : deux cours gardés qui illustrent chaque phrase (quand ils existent). */
export function formalPairs(s) {
  const k = s.kept;
  const find = (pred) => {
    for (let i = 0; i < k.length; i += 1) for (let j = i + 1; j < k.length; j += 1) if (pred(k[i], k[j])) return [k[i], k[j]];
    return null;
  };
  return {
    sameAreaOnly: find((a, b) => a.tiles === b.tiles && a.fence !== b.fence),
    samePerimeterOnly: find((a, b) => a.fence === b.fence && a.tiles !== b.tiles),
    sameBoth: find((a, b) => a.fence === b.fence && a.tiles === b.tiles),
  };
}

/* ═════════════ Le sol (floor) ═════════════ */

export const sceneOf = (s) => SCENES[s.tasks[s.ti]];
const wholeKeys = (sc) => new Set(sc.whole.map(([r, c]) => S.key(r, c)));
const halfKeys = (sc) => new Set(sc.halves.map(({ r, c }) => S.key(r, c)));

/** Les unités offertes dans la phase courante, et les pièces de la boîte. */
export function boxOf(s) {
  if (s.phase === 'two') return ['two', 'halfTwo'];
  return sceneOf(s).halves.length ? ['one', 'half'] : ['one'];
}
const unitOf = (kind) => (kind === 'one' ? 'one' : kind === 'half' || kind === 'halfTwo' ? 'half' : 'two');

const pieceCells = (kind, at, orient = 'h') => (kind === 'two' ? [at, orient === 'v' ? [at[0] + 1, at[1]] : [at[0], at[1] + 1]] : [at]);

/** Les cellules occupées (clé → pièce). */
export function occupied(s) {
  const map = new Map();
  for (const p of s.pieces) for (const [r, c] of p.cells) map.set(S.key(r, c), p);
  return map;
}

/** Les demis de l'unité de la phase courante, la lecture « 16 » / « 10,5 », et le nombre de cellules couvertes. */
export function reading(s) {
  const unit = s.phase === 'two' ? 'two' : 'one';
  const count = (k) => s.pieces.filter((p) => p.kind === k).length;
  const halves = unit === 'two' ? S.floorHalves(count('two'), count('halfTwo')) : S.floorHalves(count('one'), count('half'));
  const cells = s.pieces.reduce((n, p) => n + p.cells.length, 0);
  return { unit, halves, value: S.formatHalves(halves), cells };
}
/** Le sol entier en cellules : toutes les entières + les demies. */
const floorCells = (sc) => [...sc.whole, ...sc.halves.map(({ r, c }) => [r, c])];
export const covered = (s) => isFloor(s) && occupied(s).size === floorCells(sceneOf(s)).length;
export const sceneDone = (s) => !!s.done[s.ti];
export const finished = (s) => isFloor(s) && s.done.every(Boolean);
export const canConfirm = (s) => covered(s) && !sceneDone(s);

/** Une cellule libre est-elle encore couvrable par une tuile double (une voisine libre à côté) ? */
export function freePairs(s) {
  const sc = sceneOf(s);
  const occ = occupied(s);
  const free = new Set(sc.whole.map(([r, c]) => S.key(r, c)).filter((k) => !occ.has(k)));
  const out = [];
  for (const k of free) {
    const [r, c] = k.split(',').map(Number);
    if (free.has(S.key(r, c + 1))) out.push([[r, c], 'h']);
    if (free.has(S.key(r + 1, c))) out.push([[r, c], 'v']);
  }
  return out;
}

/** Les cellules où la pièce `kind` peut se poser (elles brillent). */
export function legalCells(s, kind, orient = 'h') {
  const sc = sceneOf(s);
  const out = [];
  for (const cell of floorCells(sc)) if (verdictLay(s, kind, cell, orient).ok) out.push(cell);
  return out;
}

/** Poser `kind` en `at` : { ok, cells } ou { ok:false, reason: 'outside'|'unit'|'overlap' }. */
export function verdictLay(s, kind, at, orient = 'h') {
  const sc = sceneOf(s);
  const W = wholeKeys(sc);
  const H = halfKeys(sc);
  const cells = pieceCells(kind, at, orient);
  const inFloor = (c) => W.has(S.key(...c)) || H.has(S.key(...c));
  if (!cells.every(inFloor)) return { ok: false, reason: 'outside' };
  const isHalfKind = kind === 'half';
  if (cells.some((c) => (isHalfKind ? W.has(S.key(...c)) : H.has(S.key(...c))))) return { ok: false, reason: 'unit' };
  const occ = occupied(s);
  if (cells.some((c) => occ.has(S.key(...c)))) return { ok: false, reason: 'overlap' };
  return { ok: true, cells };
}

const layEvent = (s, kind, next) => {
  const r = reading(next);
  const scene = next.tasks[next.ti];
  const twoScene = SCENES[scene].units.includes('two');
  const oneHalves = next.phase === 'two' ? 2 * r.cells : r.halves;
  const ev = { kind: 'lay', scene, unit: unitOf(kind), area: S.formatHalves(oneHalves) };
  if (twoScene) ev.areaTwo = S.formatHalves(next.phase === 'two' ? r.halves : oneHalves / 2);
  return ev;
};

/** Poser une pièce. Refusée : l'événement `refused` porte la raison, la pièce revient dans la boîte. */
export function layPiece(s, kind, at, orient = 'h', opts = {}) {
  if (!isFloor(s) || sceneDone(s) || !boxOf(s).includes(kind)) return s;
  const v = verdictLay(s, kind, at, orient);
  if (!v.ok) return opts.quiet ? s : push(s, { kind: 'refused', scene: s.tasks[s.ti], reason: v.reason }, { last: { event: 'refused', reason: v.reason } });
  const piece = { id: s.nextId, kind, cells: v.cells, orient };
  const next = { ...s, pieces: [...s.pieces, piece], nextId: s.nextId + 1, laidAny: true };
  return push(next, layEvent(s, kind, next), { last: { event: 'lay', kind } });
}

/** Un trait de doigt sur plusieurs cellules libres : une pièce de la même sorte sur chacune (celles qui ne vont pas sont ignorées sans bruit). */
export function sweepLay(s, kind, cells, orient = 'h') {
  let next = s;
  let n = 0;
  for (const c of cells) {
    const after = layPiece(next, kind, c, orient, { quiet: true });
    if (after !== next) n += 1;
    next = after;
  }
  return n >= 1 && cells.length >= 2 ? { ...next, swept: true } : next;
}

/** Reprendre une pièce posée (un appui dessus). */
export function unlay(s, id) {
  if (!isFloor(s) || sceneDone(s) || !s.pieces.some((p) => p.id === id)) return s;
  return { ...s, pieces: s.pieces.filter((p) => p.id !== id), last: { event: 'unlay' } };
}

/** Le sol est couvert et l'élève confirme sa lecture : « مساحة الأرضية = … ». Dans la scène à deux unités, la 1re lecture ouvre la tuile double. */
export function confirm(s) {
  if (!canConfirm(s)) return s;
  const scene = s.tasks[s.ti];
  const r = reading(s);
  const reads = { ...s.reads, [scene]: { ...(s.reads[scene] ?? {}), [r.unit]: r.value } };
  const withRead = push(s, { kind: 'read', scene, unit: r.unit, value: r.value }, { reads, last: { event: 'read', unit: r.unit, value: r.value } });
  if (SCENES[scene].units.includes('two') && r.unit === 'one') return { ...withRead, phase: 'two', pieces: [], swept: false };
  return { ...withRead, done: withRead.done.map((d, i) => d || i === s.ti) };
}

/** Floor : passer à la scène suivante. */
export function nextScene(s) {
  if (!isFloor(s) || !canNext(s)) return s;
  return { ...s, ti: s.ti + 1, phase: 'one', pieces: [], swept: false, laidAny: false, last: null };
}

/* ═════════════ Onboarding (LabCoach) ═════════════ */

const firstLiftable = (s) => {
  const order = [...s.tiles].sort((a, b) => a.r - b.r || a.c - b.c);
  return order.find((t) => liftable(s, t.id).ok) ?? order[0];
};

/**
 * LE PROCHAIN GESTE (LabCoach) — pur et testé : on le suit jusqu'au bout de chaque tâche. Il montre l'élément ou le geste (jamais la règle,
 * jamais OÙ poser). `null` : tout est fait (la découverte s'ouvre).
 * @returns {{ id: string, target: string, gesture: 'drag' | 'tap' } | null}
 */
export function coachOf(s) {
  if (discoveryReady(s)) return null;
  if (isFloor(s)) return coachFloor(s);
  if (taskDone(s) && canNext(s)) return { id: 'next', target: '[data-ty-next]', gesture: 'tap' };
  if (s.mode === 'rope') {
    if (s.tiles.length === 0) return { id: 'add', target: '[data-ty-heap]', gesture: 'drag' };
    if (s.walks === 0) return { id: 'walk', target: '[data-ty-walk]', gesture: 'tap' };
    if (!canKeep(s)) return { id: 'more', target: '[data-ty-heap]', gesture: 'drag' };
    if (!isKept(s)) return { id: 'keep', target: '[data-ty-keep]', gesture: 'tap' };
    const t = firstLiftable(s);
    return { id: 'again', target: `[data-ty-tile="${t.r}-${t.c}"]`, gesture: 'drag' };
  }
  if (s.moves === 0) { const t = firstLiftable(s); return { id: 'pick', target: `[data-ty-tile="${t.r}-${t.c}"]`, gesture: 'drag' }; }
  if (s.walks === 0) return { id: 'walk', target: '[data-ty-walk]', gesture: 'tap' };
  if (!isKept(s)) return { id: 'keep', target: '[data-ty-keep]', gesture: 'tap' };
  const t = firstLiftable(s);
  return { id: 'again', target: `[data-ty-tile="${t.r}-${t.c}"]`, gesture: 'drag' };
}

function coachFloor(s) {
  if (sceneDone(s)) return canNext(s) ? { id: 'next', target: '[data-ty-next]', gesture: 'tap' } : null;
  if (covered(s)) return { id: 'confirm', target: '[data-ty-confirm]', gesture: 'tap' };
  const sc = sceneOf(s);
  const occ = occupied(s);
  const wholeLeft = sc.whole.filter(([r, c]) => !occ.has(S.key(r, c))).length;
  if (s.phase === 'two') {
    if (!s.pieces.some((p) => p.kind === 'two')) return { id: 'double', target: '[data-ty-box="two"]', gesture: 'drag' };
    if (freePairs(s).length === 0) return { id: 'halfTwo', target: '[data-ty-box="halfTwo"]', gesture: 'drag' };
    return { id: 'cover', target: '[data-ty-floor]', gesture: 'drag' };
  }
  if (!s.laidAny) return { id: 'pick', target: '[data-ty-box="one"]', gesture: 'drag' };
  if (!s.swept && wholeLeft >= 3) return { id: 'sweep', target: '[data-ty-floor]', gesture: 'drag' };
  if (wholeLeft === 0 && sc.halves.length) return { id: 'half', target: '[data-ty-box="half"]', gesture: 'drag' };
  return { id: 'cover', target: '[data-ty-floor]', gesture: 'drag' };
}
