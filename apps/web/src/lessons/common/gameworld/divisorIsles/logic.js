/**
 * « L’archipel des diviseurs » — PURE logic of the game world (no three.js, no React). It names no lesson: the content comes from the pack.
 * The world is a chain of floating islands; a bridge of length `a` holds only when planks of ONE length `b` fill it exactly:
 * a = b × q + r, and the bridge holds ⇔ r = 0 ⇔ b is a divisor of a. Everything the scene shows is computed here.
 */

/** Euclidean division of a by b (b ≥ 1): the planks laid (q) and the cells left empty (r). */
export function divide(a, b) {
  const q = Math.floor(a / b);
  return { q, r: a - b * q };
}

export const isDivisor = (a, b) => b >= 1 && a % b === 0;

/**
 * The remainders offered before a forge (« Combien de cases resteront vides ? »). A remainder is always smaller than b, so for a small
 * mould every possible remainder is offered (0 … b − 1); for a long one, five plausible values that contain the true one.
 */
export function predictOptions(a, b) {
  if (b > a) return [0, a].concat(a > 2 ? [a - 1] : []).sort((x, y) => x - y);
  if (b <= 9) return Array.from({ length: b }, (_, i) => i);
  const { r } = divide(a, b);
  const set = new Set([0, r, (r + Math.floor(b / 2)) % b, b - 1, (r + 3) % b, 1]);
  return [...set]
    .sort((x, y) => x - y)
    .slice(0, 6)
    .includes(r)
    ? [...set].sort((x, y) => x - y).slice(0, 6)
    : [...new Set([0, r, b - 1, 1, 2])].sort((x, y) => x - y);
}

/** Stars of a bridge: 1 for crossing, +1 for a right first prediction, +1 for never falling there. */
export function bridgeStars({ firstPrediction, falls }) {
  return 1 + (firstPrediction !== false ? 1 : 0) + (falls === 0 ? 1 : 0);
}

/** The islands (name, radius, palette) and the segments between them. `turn` = heading change (radians) when leaving the island. */
export const ISLANDS = [
  { id: 'A', name: 'Le port du départ', R: 8, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'L’île des vents', R: 8, theme: 'meadow', turn: 0.38, keepMould: true },
  { id: 'C', name: 'L’île du choix', R: 9, theme: 'pine', turn: -0.55 },
  { id: 'D', name: 'L’île des miroirs', R: 9, theme: 'crystal', turn: 0.42 },
  { id: 'E', name: 'L’île du produit', R: 9, theme: 'crystal', turn: -0.3 },
  { id: 'F', name: 'L’île des gardiens', R: 10.5, theme: 'stone', turn: 0.2, feature: 'guardians' },
  { id: 'G', name: 'L’île têtue', R: 9, theme: 'autumn', turn: -0.42, feature: 'anvil' },
  { id: 'H', name: 'Le dernier port', R: 8.5, theme: 'autumn', turn: 0.3, feature: 'stone' },
  { id: 'I', name: 'Le phare de la bibliothèque', R: 12, theme: 'snow', turn: 0 },
];

/**
 * The eight segments. `a` = length of the gap in cells, `len` = its length in world units, `moulds` = plank lengths on the
 * island's pedestals, `predict` = the student announces the remainder before the forge, `holdsWith` = the plank a
 * restored bridge is rebuilt with. A segment may be the `boss` (the store of the last bridge), have a `workshop` (any
 * length can be made) or a `storm` (after it holds with `after`, the wind takes it and leaves other `moulds`).
 * An island may `keepMould` on arrival and hold a `feature`: 'guardians', 'anvil' or 'stone'.
 */
export const SEGMENTS = [
  { id: 's15', kind: 'bridge', a: 15, len: 10.5, moulds: [3], predict: false, holdsWith: 3 },
  { id: 's16', kind: 'bridge', a: 16, len: 11.2, moulds: [2, 4, 5], predict: true, holdsWith: 4 },
  { id: 's42', kind: 'bridge', a: 42, len: 16.8, moulds: [4, 5, 6, 7], predict: true, holdsWith: 6 },
  {
    id: 's48',
    kind: 'bridge',
    a: 48,
    len: 18.2,
    moulds: [6],
    predict: true,
    holdsWith: 8,
    storm: { after: 6, moulds: [5, 7, 8, 9], pinned: '48 = 6 \\times 8' },
  },
  { id: 's120', kind: 'bridge', a: 120, len: 24, moulds: [6, 9, 20], predict: true, holdsWith: 6 },
  { id: 'dash', kind: 'rail', len: 300 },
  {
    id: 's7',
    kind: 'bridge',
    a: 7,
    len: 8.4,
    moulds: [2, 3, 4, 5, 6],
    predict: true,
    holdsWith: 7,
    workshop: { min: 1, max: 9 },
  },
  { id: 's756', kind: 'bridge', a: 756, len: 30, moulds: [], holdsWith: 36, boss: { options: [32, 36], price: 1850 } },
];

/** The gate dash: one sentence, three gates, exactly one right. `kind` names which of the four phrasings is used. */
export const DASH_WAVES = [
  { say: 'Un diviseur de 20', gates: [3, 4, 6], test: (n) => 20 % n === 0 },
  { say: 'Un diviseur de 36', gates: [8, 9, 10], test: (n) => 36 % n === 0 },
  { say: 'Un nombre qui divise 60', gates: [7, 8, 12], test: (n) => 60 % n === 0 },
  { say: 'Un multiple de 7', gates: [40, 42, 45], test: (n) => n % 7 === 0 },
  { say: 'Un nombre divisible par 9', gates: [54, 56, 58], test: (n) => n % 9 === 0 },
  { say: 'Un multiple de 8', gates: [2, 4, 24], test: (n) => n % 8 === 0 },
  { say: 'Un diviseur de 30', gates: [15, 60, 90], test: (n) => 30 % n === 0 },
  { say: 'Un nombre qui divise 56', gates: [6, 8, 9], test: (n) => 56 % n === 0 },
];
export const DASH = { first: 44, gap: 34, lanes: [-2.5, 0, 2.5], hearts: 3 };

/** World geometry of the chain: island centres and each segment's start, end, unit direction and right vector. */
export function buildLayout(islands = ISLANDS, segments = SEGMENTS) {
  const out = { islands: [], segs: [] };
  let h = 0;
  let cx = 0;
  let cz = 0;
  islands.forEach((isl, i) => {
    out.islands.push({ ...isl, x: cx, z: cz, index: i });
    const seg = segments[i];
    if (!seg) return;
    h += isl.turn;
    const dx = Math.sin(h);
    const dz = -Math.cos(h);
    const sx = cx + dx * (isl.R - 0.5);
    const sz = cz + dz * (isl.R - 0.5);
    const ex = sx + dx * seg.len;
    const ez = sz + dz * seg.len;
    out.segs.push({ ...seg, index: i, sx, sz, ex, ez, dx, dz, rx: -dz, rz: dx, cell: seg.a ? seg.len / seg.a : 0 });
    const next = islands[i + 1];
    cx = ex + dx * (next.R - 0.5);
    cz = ez + dz * (next.R - 0.5);
  });
  return out;
}

/** The statues of island F: four sentences about ONE fact (120 = 6 × 20). `smallFirst` = the divisor is written first. */
export const STATUES = {
  small: 6,
  big: 120,
  q: 20,
  sentences: [
    { id: 'qasim', before: '', mid: 'est un diviseur de', smallFirst: true },
    { id: 'yaqsim', before: '', mid: 'divise', smallFirst: true },
    { id: 'yaqbal', before: '', mid: 'est divisible par', smallFirst: false },
    { id: 'mudaaf', before: '', mid: 'est un multiple de', smallFirst: false },
  ],
};

/** The final bridge: checks one Euclidean division typed by the student. Returns 'ok' or the reason it is refused ('long' = the planks overshoot the gap). */
export function checkDivision(a, b, q, r) {
  if (!Number.isInteger(q) || !Number.isInteger(r) || q < 0 || r < 0) return 'nan';
  if (b * q > a) return 'long';
  if (b * q + r !== a) return 'sum';
  if (r >= b) return 'big';
  return 'ok';
}
