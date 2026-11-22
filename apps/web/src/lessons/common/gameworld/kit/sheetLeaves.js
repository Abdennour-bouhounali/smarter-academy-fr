/**
 * The LEAVES of an answer sheet (logic of ExamSittingLeaves.jsx). A sheet whose answers do not fit their box even at the
 * smallest scale Fit allows (the 12 px floor kept) is never cut and never scrolls: its answers are shown on two leaves or
 * more, split at a boundary between two answers. Pure: the heights are measured by the component, in screen pixels, at the
 * scale where the sheet overflowed (Fit's `min`), so a leaf that holds here holds on screen and can only grow back.
 *   heights  the height of each answer, in order
 *   room     the height of the box
 *   fixed    what every leaf carries besides its answers (its heading, its paddings)
 *   gap      the space between two answers
 * Returns the leaves: arrays of answer indices, contiguous, in order, together covering every answer once. As few leaves as
 * the room allows, and among those splits the most even one (the tallest leaf as short as possible) — never seven answers
 * on the first leaf and one alone on the second. An answer taller than the room alone is a leaf of its own.
 */
const need = (heights, a, b, fixed, gap) => {
  let s = fixed;
  for (let i = a; i < b; i += 1) s += heights[i];
  return s + gap * Math.max(0, b - a - 1);
};

/** Greedy: the leaves when no leaf may be taller than `cap`. */
function greedy(heights, cap, fixed, gap) {
  const out = [];
  let a = 0;
  while (a < heights.length) {
    let b = a + 1;
    while (b < heights.length && need(heights, a, b + 1, fixed, gap) <= cap) b += 1;
    out.push(Array.from({ length: b - a }, (_, k) => a + k));
    a = b;
  }
  return out;
}

export function splitLeaves(heights, { room, fixed = 0, gap = 0 }) {
  const n = heights.length;
  if (n === 0) return [[]];
  const all = Array.from({ length: n }, (_, i) => i);
  if (!(room > 0) || need(heights, 0, n, fixed, gap) <= room) return [all];
  const k = greedy(heights, room, fixed, gap).length;
  // the most even split in k leaves: the smallest cap that still needs no more than k leaves
  let lo = Math.max(...heights.map((h) => fixed + h));
  let hi = Math.max(room, lo);
  if (greedy(heights, lo, fixed, gap).length <= k) return greedy(heights, lo, fixed, gap);
  for (let i = 0; i < 40 && hi - lo > 0.5; i += 1) {
    const mid = (lo + hi) / 2;
    if (greedy(heights, mid, fixed, gap).length <= k) hi = mid;
    else lo = mid;
  }
  return greedy(heights, hi, fixed, gap);
}

/** For each answer index, the leaf it is on. */
export const leafIndex = (leaves, n) => {
  const out = new Array(n).fill(0);
  leaves.forEach((leaf, l) => leaf.forEach((i) => (out[i] = l)));
  return out;
};

/**
 * The answers whose `quiet` key (e.g. the line a fraction box writes under itself) was already shown by an EARLIER answer of
 * the same leaf: they leave it out — it is said once per leaf, never lost (a leaf that has the kind always has it once).
 */
export function quietOnLeaves(keys, leaves) {
  const out = new Set();
  for (const leaf of leaves) {
    const seen = new Set();
    for (const i of leaf) {
      const k = keys[i];
      if (!k) continue;
      if (seen.has(k)) out.add(i);
      else seen.add(k);
    }
  }
  return out;
}

/** After a new split, the leaf to show: the one that now holds the first answer of the leaf that was on screen. */
export const keepLeaf = (oldLeaves, on, newLeaves) => {
  const first = oldLeaves?.[on]?.[0] ?? 0;
  const l = newLeaves.findIndex((leaf) => leaf.includes(first));
  return l < 0 ? 0 : l;
};
