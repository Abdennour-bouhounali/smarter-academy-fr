/**
 * THE EXPERIMENT `pair`, the masons' table (France, K1 of the similar-triangles lesson — UNIT_3E_THALES_DESIGN.md, Lesson 1,
 * « K1 `cotes-proportionnels` ») — PURE logic and reducer; the screen is `InquiryPair.jsx`, its words `pairText.js`.
 * A TEMPLATE and a traced triangle (the « stone ») lie APART, the stone turned or flipped. One round, three stages:
 *   1. `predict` — he says whether the stone has the template's shape (`shape`) or not (`not`);
 *   2. `link`    — the sides are linked, template side ↔ stone side. In a `world-first` round the world lays the FIRST
 *                  link itself (between the two shortest sides, locked) and he makes the two others; in a `given`
 *                  round a mason's links stand as given (by default in the order of the names: side i ↔ side i) and he
 *                  may relink freely. Each link is a quotient « stone ÷ template », never evaluated on screen; the
 *                  world marks « = » or « ≠ » between neighbours, and in a `world-first` round writes the LENGTHS
 *                  « attendu » (template side × the first link's quotient) against « mesuré » (the linked stone side);
 *   3. `laid`    — the world's OWN verdict, independent of his links: it scales the stone, turns or flips it and lays
 *                  it onto the template; it covers it exactly when the ranked sides are proportional (exact).
 * He may still relink after the verdict (the TURN story: by the names, then by size); every complete set of links he
 * formed is kept in the round's row.
 *
 *   spec = { kind: 'pair',
 *            template: { names: 'ABC', sides: [AB, BC, CA] },                  lengths as exact text: '3,8'
 *            rounds: [ { stone: { names: 'DEF', sides: [DE, EF, FD], turn: 120, flip: false },
 *                        link: 'world-first' | 'given', given?: [s0, s1, s2] } ],   given[t] = the stone side of t
 *            text? }
 * Side i of a triangle joins its corners i and i + 1 (side 2 joins corners 2 and 0). Everything that decides is exact.
 */
import { read, write, times, over, compare, equal, plus, approx } from '../kit/exact';

export const SAYS = Object.freeze(['shape', 'not']);
const LINK_MODES = Object.freeze(['world-first', 'given']);
const NAMES_ORDER = Object.freeze([0, 1, 2]);

/** The names of the three sides: [AB], [BC], [AC]. */
export function sideNames(names) {
  const [a, b, c] = [...names];
  return [a + b, b + c, a + c];
}

/** The corners of side i. */
export const cornersOf = (i) => [i, (i + 1) % 3];

/** The side indices from the shortest to the longest (exact; a tie keeps the order of the names). */
export function ranks(sides) {
  return [0, 1, 2].sort((i, j) => compare(sides[i], sides[j]) || i - j);
}

/** A true triangle: three positive lengths, each shorter than the sum of the two others (exact). */
export function isTriangle(sides) {
  if (sides?.length !== 3) return false;
  return sides.every((x, i) => {
    const [y, z] = sides.filter((_, j) => j !== i);
    return compare(x, '0') > 0 && compare(x, plus(y, z)) < 0;
  });
}

/** THE WORLD'S VERDICT: the stone, scaled, lies exactly on the template — its ranked sides are proportional. */
export function sameShape(template, stone) {
  const rt = ranks(template);
  const rs = ranks(stone);
  const q = over(stone[rs[0]], template[rt[0]]);
  return [1, 2].every((n) => equal(over(stone[rs[n]], template[rt[n]]), q));
}

/** The factor the world applies to the stone to lay it: template's shortest ÷ stone's shortest (exact text). */
export const layFactor = (template, stone) => write(over(template[ranks(template)[0]], stone[ranks(stone)[0]]));

/** The links a round opens with, and the one the world locked (a template side index, or null). */
export function openLinks(spec, r) {
  if (r.link === 'given') return { links: [...(r.given ?? NAMES_ORDER)], locked: null };
  const t = ranks(spec.template.sides)[0];
  const links = [null, null, null];
  links[t] = ranks(r.stone.sides)[0];
  return { links, locked: t };
}

const complete = (links) => links.every((x) => x != null);

/** Per template side: the quotient of its link, « stone ÷ template », as texts (never evaluated on screen). */
export function quotients(spec, r, links) {
  return links.map((sIdx, t) =>
    sIdx == null
      ? { t: write(spec.template.sides[t]), s: null, q: null }
      : {
          t: write(spec.template.sides[t]),
          s: write(r.stone.sides[sIdx]),
          q: write(over(r.stone.sides[sIdx], spec.template.sides[t])),
        },
  );
}

/** The marks between neighbouring quotients: '=' , '≠' or null while one of the two is not linked. */
export function marks(qs) {
  return [0, 1].map((i) => (qs[i].q == null || qs[i + 1].q == null ? null : equal(qs[i].q, qs[i + 1].q) ? 'eq' : 'ne'));
}

export const allEqual = (qs) => qs.every((x) => x.q != null) && marks(qs).every((m) => m === 'eq');

/**
 * « Avec ces liens : attendu … — mesuré … » (world-first rounds only, all three linked): for each template side but
 * the locked one, in the order of the names, its length × the first link's quotient, and the stone side linked to it.
 * LENGTHS only.
 */
export function expectedMeasured(spec, r, links, locked) {
  if (r.link !== 'world-first' || locked == null || !complete(links)) return null;
  const T = spec.template.sides;
  const S = r.stone.sides;
  const q = over(S[links[locked]], T[locked]);
  const others = [0, 1, 2].filter((t) => t !== locked);
  return { expected: others.map((t) => write(times(T[t], q))), measured: others.map((t) => write(S[links[t]])) };
}

function check(spec) {
  const T = spec.template;
  if (!T || [...(T.names ?? '')].length !== 3 || !isTriangle(T.sides?.map(read)))
    throw new Error('pair: the template needs three names and three sides of a triangle');
  if (!spec.rounds?.length) throw new Error('pair: no round');
  spec.rounds.forEach((r, i) => {
    if (!r.stone || [...(r.stone.names ?? '')].length !== 3 || !isTriangle(r.stone.sides?.map(read)))
      throw new Error(`pair: round ${i + 1} needs a stone with three names and three sides of a triangle`);
    if (!LINK_MODES.includes(r.link)) throw new Error(`pair: round ${i + 1} has no link mode « ${r.link} »`);
    if (r.given && [...r.given].sort().join() !== '0,1,2')
      throw new Error(`pair: round ${i + 1}: « given » links each template side to a different stone side`);
  });
}

const fresh = (i) => ({
  i,
  stage: 'predict',
  said: null,
  links: [null, null, null],
  locked: null,
  pick: null,
  sets: [],
  laid: null,
});

export function initPair(spec) {
  check(spec);
  return { ...fresh(0), rows: [], done: false };
}

/** A complete set of links joins the round's sets (once in a row). */
function withSet(spec, s, links) {
  if (!complete(links)) return s.sets;
  const last = s.sets.at(-1);
  if (last && last.links.join() === links.join()) return s.sets;
  return [...s.sets, { links: [...links], equal: allEqual(quotients(spec, spec.rounds[s.i], links)) }];
}

export function pairReducer(spec, s, a) {
  if (s.done) return s;
  const r = spec.rounds[s.i];
  switch (a.type) {
    case 'say': {
      if (s.stage !== 'predict' || !SAYS.includes(a.v)) return s;
      const { links, locked } = openLinks(spec, r);
      const next = { ...s, said: a.v, stage: 'link', links, locked, pick: null };
      return { ...next, sets: withSet(spec, next, links) };
    }
    case 'pick': {
      if (s.stage === 'predict' || !['t', 's'].includes(a.side) || ![0, 1, 2].includes(a.i)) return s;
      // the world's first link stays where it laid it
      if (a.side === 't' && a.i === s.locked) return s;
      if (a.side === 's' && s.locked != null && a.i === s.links[s.locked]) return s;
      const pick = { t: null, s: null, ...s.pick };
      pick[a.side] = pick[a.side] === a.i ? null : a.i;
      if (pick.t == null || pick.s == null) return { ...s, pick: pick.t == null && pick.s == null ? null : pick };
      const links = s.links.map((x) => (x === pick.s ? null : x));
      links[pick.t] = pick.s;
      const sets = withSet(spec, s, links);
      const rows =
        s.stage === 'laid'
          ? s.rows.map((row, n) =>
              n === s.rows.length - 1
                ? { ...row, sets, final: [...links], finalEqual: allEqual(quotients(spec, r, links)) }
                : row,
            )
          : s.rows;
      return { ...s, links, pick: null, sets, rows };
    }
    case 'lay': {
      if (s.stage !== 'link' || !complete(s.links)) return s;
      const shape = sameShape(spec.template.sides, r.stone.sides);
      const equalNow = allEqual(quotients(spec, r, s.links));
      const opened = openLinks(spec, r).links;
      const em = expectedMeasured(spec, r, s.links, s.locked);
      const row = {
        round: s.i,
        link: r.link,
        said: s.said,
        shape,
        right: (s.said === 'shape') === shape,
        k: layFactor(spec.template.sides, r.stone.sides),
        links: [...s.links],
        equal: equalNow,
        asOpened: s.links.join() === opened.join(),
        expected: em?.expected ?? null,
        measured: em?.measured ?? null,
        sets: s.sets,
        final: [...s.links],
        finalEqual: equalNow,
      };
      return { ...s, stage: 'laid', pick: null, laid: { shape, k: row.k }, rows: [...s.rows, row] };
    }
    case 'next': {
      if (s.stage !== 'laid') return s;
      if (s.i + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...fresh(s.i + 1) };
    }
    default:
      return s;
  }
}

/** What the forge reads as his evidence: one row per round (his prediction, the world's verdict, his links). */
export const pairResult = (s) => ({ rows: s.rows });

// ───────────────────────────── drawing (approx: never decides) ─────────────────────────────

/** The corners of a triangle from its sides [c0c1, c1c2, c2c0], corner 0 at the origin, side 0 along +x, y up. */
export function cornersFrom(sides) {
  const [a, b, c] = sides.map(approx);
  const x = (a * a + c * c - b * b) / (2 * a);
  return [
    [0, 0],
    [a, 0],
    [x, Math.sqrt(Math.max(0, c * c - x * x))],
  ];
}

/** The stone as it lies on the table: flipped (mirror), then turned by `turn` degrees. */
export function placed(points, { turn = 0, flip = false } = {}) {
  const t = (turn * Math.PI) / 180;
  const [cos, sin] = [Math.cos(t), Math.sin(t)];
  return points.map(([x0, y]) => {
    const x = flip ? -x0 : x0;
    return [x * cos - y * sin, x * sin + y * cos];
  });
}

/** The point at dA from A and dB from B, on the side of AB where X stands. */
function apex(A, B, dA, dB, X) {
  const d = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const u = [(B[0] - A[0]) / d, (B[1] - A[1]) / d];
  const x = (dA * dA - dB * dB + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, dA * dA - x * x));
  const side = Math.sign(u[0] * (X[1] - A[1]) - u[1] * (X[0] - A[0])) || 1;
  return [A[0] + x * u[0] - side * h * u[1], A[1] + x * u[1] + side * h * u[0]];
}

/**
 * The stone LAID on the template (in the template's frame, `cornersFrom(template)`): scaled by `layFactor`, its
 * shortest side on the template's shortest side, the corner between its shortest and middle sides on the template's
 * corner between those, its third corner on the template's side. Returned per STONE corner.
 */
export function layImage(template, stone) {
  const T = cornersFrom(template);
  const rt = ranks(template);
  const rs = ranks(stone);
  const k = approx(layFactor(template, stone));
  const shared = (i, j) => cornersOf(i).find((c) => cornersOf(j).includes(c));
  const other = (i, c) => cornersOf(i).find((x) => x !== c);
  const tV = shared(rt[0], rt[1]);
  const tW = other(rt[0], tV);
  const tX = 3 - tV - tW;
  const sV = shared(rs[0], rs[1]);
  const sW = other(rs[0], sV);
  const sY = 3 - sV - sW;
  const image = [];
  image[sV] = T[tV];
  image[sW] = T[tW];
  image[sY] = apex(T[tV], T[tW], k * approx(stone[rs[1]]), k * approx(stone[rs[2]]), T[tX]);
  return image;
}
