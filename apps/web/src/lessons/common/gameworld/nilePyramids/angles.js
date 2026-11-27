/**
 * THE EXPERIMENT `angles`, the masons' protractor (K2 `angles-egaux` of the similar-triangles lesson —
 * docs/reports/UNIT_3E_THALES_DESIGN.md, Lesson 1 › K2, and gate A's fourth notes 2–5) — PURE reducer and the pure
 * arithmetic of the world; the screen is `InquiryAngles.jsx`, its words `anglesText.js`.
 *
 * Two triangles lie APART on the masons' table (turned, flipped). ONE round per screen:
 *   1. `measure` — he puts the protractor on a vertex, turns its needle (whole degrees) onto the other side and reads
 *      it. After TWO angles of a triangle the world writes the third, always with its three terms:
 *      « Ĉ = 180° − 27° − 41° = 112° » — never a partial sum (gate A 4th, note 2).
 *   2. `predict` — « même forme » or « pas la même forme ».
 *   3. `slid` — the world slides the first triangle onto the second, every side × the quotient of the ONE pair of
 *      sides it writes (written « 8 ÷ 6 », never evaluated), and says what the slide did: it covers, or it does not.
 *      A triangle whose angles do not close (sum ≠ 180°) is never slid: the world says it cannot close it.
 *
 *   spec = { kind: 'angles',
 *            rounds: [ { a: tri, b: tri, measure: true | false, drawn?: true } ],
 *            text? }                                         the lesson's words over `ANGLES_TEXT`
 *   tri  = { names: 'ABC', angles: ['27', '41'], side?: '6', opp?: 2, turn?: 0, flip?: false }
 *            two angles, at names[0] and names[1] (whole degrees); the third is the world's (180° − x − y);
 *            `side`: the ONE length the world writes, opposite the vertex `opp` (0, 1 or 2 — default 2)
 *        | { names, angles: [x, y, z] }                      three angles the WORLD draws (`drawn: true`; may not close)
 *        | { names, times: '1,25' }                          the angles of `a` × that number, drawn by the world
 *        | { names, between: { sides: ['4', '6'], angle: '27' } }
 *            two sides from names[0] (to names[1], to names[2]) and the angle between them — no protractor
 *            (`measure: false`): the world writes that angle only, and never the third side (gate A 4th, note 4)
 *   `turn` (degrees) and `flip` only change how a triangle LIES on the table, never its numbers.
 *
 * A `drawn` round: he measures `a` (when `measure`), the world draws `b`. A `measure: false` round opens on the
 * prediction. Everything that decides is exact (`../kit/exact`); `approx` only draws.
 */
import { read, write, minus, plus, times, compare, equal, approx } from '../kit/exact';

export const SAYS = Object.freeze(['same', 'other']);
export const TRIS = Object.freeze(['a', 'b']);
/** The needle's magnet: a needle let go this close to the side lies on it (whole degrees). */
export const MAGNET = 2;

const deg = (x) => write(read(x));
const sumOf = (xs) => write(xs.reduce((acc, x) => plus(acc, x), read('0')));

/** The three angles of a triangle of a round (exact text, in the order of its names), and whether they close. */
export function triOf(round, which) {
  const t = round[which];
  if (!t) throw new Error(`angles: no triangle « ${which} »`);
  const names = [...t.names];
  if (names.length !== 3) throw new Error(`angles: « ${t.names} » is not three names`);
  if (t.between) {
    const [p, q] = t.between.sides.map(deg);
    return { names, between: { sides: [p, q], angle: deg(t.between.angle) }, angles: null, closes: true };
  }
  let angles;
  if (t.times != null) {
    if (which !== 'b') throw new Error('angles: only b can be a × of a');
    angles = triOf(round, 'a').angles.map((x) => write(times(x, t.times)));
  } else if (t.angles?.length === 3) angles = t.angles.map(deg);
  else if (t.angles?.length === 2) {
    const [x, y] = t.angles.map(deg);
    angles = [x, y, write(minus(minus('180', x), y))];
  } else throw new Error(`angles: « ${t.names} » needs two or three angles`);
  const sum = sumOf(angles);
  return { names, angles, sum, closes: equal(sum, '180'), side: t.side == null ? null : deg(t.side), opp: t.opp ?? 2 };
}

/** The triangles of a round he measures: none without `measure`, `a` alone in a `drawn` round, else both. */
export const toMeasure = (round) => (!round.measure ? [] : round.drawn ? ['a'] : ['a', 'b']);

/** Is the protractor's reading the angle at vertex v (an exact comparison: the reading is whole degrees)? */
const onSide = (round, which, v, reading) => equal(String(reading), triOf(round, which).angles[v]);

/** Whole degrees from 0 to 180; with the magnet (a drag let go), a reading close to the side lies on it. */
export function snapReading(round, which, v, raw, magnet = false) {
  const r = Math.max(0, Math.min(180, Math.round(Number(raw) || 0)));
  if (!magnet) return r;
  const true_ = approx(triOf(round, which).angles[v]);
  return Number.isInteger(true_) && Math.abs(r - true_) <= MAGNET ? true_ : r;
}

// ─────────────────────────────── what the world writes (LaTeX) ───────────────────────────────

const texDeg = (x) => `${write(read(x)).replace(',', '{,}')}^\\circ`;
const hat = (n) => `\\widehat{${n}}`;

/** One measured or given angle: « Â = 27° ». */
export const angleTex = (name, x) => `${hat(name)} = ${texDeg(x)}`;

/**
 * The third angle, written by the world from the two he read, in the order he read them — ALWAYS its three terms:
 * « Ĉ = 180° − 27° − 41° = 112° ». `read` = the two vertex indices.
 */
export function thirdTex(tri, readIdx) {
  const [i, j] = readIdx;
  const k = [0, 1, 2].find((x) => x !== i && x !== j);
  return `${hat(tri.names[k])} = 180^\\circ - ${texDeg(tri.angles[i])} - ${texDeg(tri.angles[j])} = ${texDeg(tri.angles[k])}`;
}
export const thirdOf = (readIdx) => [0, 1, 2].find((x) => !readIdx.includes(x));

/** A triangle the world draws itself: its three angles, then their sum with its three terms (« … = 225° »). */
export function drawnTex(tri) {
  const lhs = tri.names.map(hat).join(' + ');
  return `${lhs} = ${tri.angles.map(texDeg).join(' + ')} = ${texDeg(tri.sum)}`;
}

// ─────────────────────────────── the slide: exact verdict ───────────────────────────────

/**
 * What the slide does, exactly: `open` (a triangle does not close: no slide), `covers` or `apart`, with the quotient
 * as the TWO lengths it is made of (`top ÷ bottom`, b's over a's: never evaluated on screen) and the vertices the slide
 * lays on each other (`map`: [a's index, b's index] for the ends of the written side — the rest is drawing).
 */
export function slideOf(round) {
  const A = triOf(round, 'a');
  const B = triOf(round, 'b');
  if (!A.closes || !B.closes) return { fact: 'open', top: null, bottom: null, map: null };
  if (A.between && B.between) {
    const [p, q] = A.between.sides;
    const [p2, q2] = B.between.sides;
    // b's sides from the vertex of the angle are a's × p2/p: q × p2 = q2 × p, and the same angle
    const prop = equal(times(q, p2), times(q2, p));
    const covers = prop && equal(A.between.angle, B.between.angle);
    return {
      fact: covers ? 'covers' : 'apart',
      top: p2,
      bottom: p,
      map: [
        [0, 0],
        [1, 1],
      ],
    };
  }
  if (A.between || B.between) throw new Error('angles: a round mixes a triangle of sides and a triangle of angles');
  const same = sortedEq(A.angles, B.angles);
  const ends = (T) => [0, 1, 2].filter((x) => x !== T.opp);
  const [a0, a1] = ends(A);
  let [b0, b1] = ends(B);
  // the ends of the written sides laid on each other: an equal angle on an equal angle, else the smaller on the smaller
  const at = (T, x) => T.angles[x];
  const straight = equal(at(A, a0), at(B, b0)) || equal(at(A, a1), at(B, b1));
  const crossed = equal(at(A, a0), at(B, b1)) || equal(at(A, a1), at(B, b0));
  if (crossed && !straight) [b0, b1] = [b1, b0];
  else if (!straight && !crossed) {
    const ra = compare(at(A, a0), at(A, a1));
    const rb = compare(at(B, b0), at(B, b1));
    if (ra * rb < 0) [b0, b1] = [b1, b0];
  }
  const hasSides = A.side != null && B.side != null;
  // one shape AND the written sides face the same angle: the copy × B.side/A.side is B itself
  const covers = same && hasSides && equal(A.angles[A.opp], B.angles[B.opp]);
  return {
    fact: covers ? 'covers' : 'apart',
    top: hasSides ? B.side : null,
    bottom: hasSides ? A.side : null,
    map: [
      [a0, b0],
      [a1, b1],
    ],
  };
}
const sortedEq = (xs, ys) => {
  const s = (l) => [...l].sort(compare);
  const [p, q] = [s(xs), s(ys)];
  return p.every((x, i) => equal(x, q[i]));
};

/**
 * The homologous vertices and sides of two triangles of the same angles (for a forge's last step, P3): `vertex[X]` is
 * the vertex of b with the angle of X; `side['AB']` is the side of b between the homologues of A and B — the side
 * opposite the same angle. Null when the angles are not the same three (or two of them are equal: no unique pairing).
 */
export function homologues(round) {
  const A = triOf(round, 'a');
  const B = triOf(round, 'b');
  if (!A.angles || !B.angles || !A.closes || !B.closes || !sortedEq(A.angles, B.angles)) return null;
  if (new Set(A.angles.map((x) => write(x))).size < 3) return null;
  const vertex = {};
  A.names.forEach((n, i) => {
    vertex[n] = B.names[B.angles.findIndex((y) => equal(y, A.angles[i]))];
  });
  const side = {};
  for (const [i, j] of [
    [0, 1],
    [1, 2],
    [0, 2],
  ]) {
    const [p, q] = [A.names[i], A.names[j]];
    side[`${p}${q}`] = `${vertex[p]}${vertex[q]}`;
  }
  return { vertex, side };
}

// ─────────────────────────────── the reducer ───────────────────────────────

const freshRound = (spec, i) => {
  const r = spec.rounds[i];
  return {
    i,
    stage: toMeasure(r).length ? 'measure' : 'predict',
    at: null,
    needle: 0,
    off: false,
    misreads: 0,
    read: { a: [], b: [] },
    said: null,
    slid: null,
  };
};

export function initAngles(spec) {
  if (!spec.rounds?.length) throw new Error('angles: no round');
  spec.rounds.forEach((r) => {
    triOf(r, 'a');
    triOf(r, 'b');
  });
  return { ...freshRound(spec, 0), rows: [], done: false };
}

/** Every triangle of the round that he measures has its two angles read. */
const allRead = (r, read) => toMeasure(r).every((t) => read[t].length >= 2);

export function anglesReducer(spec, s, a) {
  const r = spec.rounds[s.i];
  switch (a.type) {
    case 'place': {
      // the protractor on vertex v of triangle t: a triangle he measures, not yet read twice, a vertex not read
      if (s.stage !== 'measure' || !toMeasure(r).includes(a.t)) return s;
      if (s.read[a.t].length >= 2 || s.read[a.t].includes(a.v) || ![0, 1, 2].includes(a.v)) return s;
      return { ...s, at: { t: a.t, v: a.v }, needle: 0, off: false };
    }
    case 'needle':
      if (s.stage !== 'measure' || !s.at) return s;
      return { ...s, needle: snapReading(r, s.at.t, s.at.v, a.deg, a.magnet === true), off: false };
    case 'turn':
      if (s.stage !== 'measure' || !s.at) return s;
      return { ...s, needle: snapReading(r, s.at.t, s.at.v, s.needle + Number(a.d)), off: false };
    case 'read': {
      if (s.stage !== 'measure' || !s.at) return s;
      const { t, v } = s.at;
      if (!onSide(r, t, v, s.needle)) return { ...s, off: true, misreads: s.misreads + 1 };
      const read = { ...s.read, [t]: [...s.read[t], v] };
      return { ...s, read, at: null, needle: 0, off: false, stage: allRead(r, read) ? 'predict' : 'measure' };
    }
    case 'say':
      return s.stage === 'predict' && SAYS.includes(a.v) ? { ...s, said: a.v } : s;
    case 'slide': {
      if (s.stage !== 'predict' || !s.said) return s;
      const slid = slideOf(r);
      const row = {
        round: s.i,
        said: s.said,
        fact: slid.fact,
        right: (s.said === 'same') === (slid.fact === 'covers'),
        // the degrees he READ, triangle by triangle, in his order; the third the world wrote from them
        read: Object.fromEntries(TRIS.map((t) => [t, s.read[t].map((v) => triOf(r, t).angles[v])])),
        third: Object.fromEntries(
          TRIS.map((t) => [t, s.read[t].length === 2 ? triOf(r, t).angles[thirdOf(s.read[t])] : null]),
        ),
        misreads: s.misreads,
        quotient: slid.top == null ? null : [slid.top, slid.bottom],
      };
      return { ...s, stage: 'slid', slid, rows: [...s.rows, row] };
    }
    case 'next': {
      if (s.stage !== 'slid') return s;
      if (s.i + 1 >= spec.rounds.length) return { ...s, done: true };
      return { ...s, ...freshRound(spec, s.i + 1) };
    }
    default:
      return s;
  }
}

/** What the forge reads (as `scaleResult`): one row per round, what HE said against what the slide did. */
export const anglesResult = (s) => ({ rows: s.rows });
