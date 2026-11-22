/**
 * « حلبة التدريب » of lesson `jidhr-tarbii` — the CONTENT of its practice ladder (PURE). The ladder is the kit's
 * (`gameworld/kit/ladder.js`); a level is a run of the kit's rail of light (`kit/GateRun.js`), played in « قصر الساحات »
 * by `rootCourts/Game.js › startPractice`, which reads from each wave:
 *   say   the order on the white card — a PLAIN Arabic string (no `$`, no backslash);
 *   tex   optional, a LaTeX formula shown after it (« \\sqrt{58} »);
 *   gates three numbers or short plain strings over the arches (a decimal « 0,7 », a fraction « 3/5 », a sign « −9 »);
 *   good  the index of the right gate;
 *   why   { right, wrong: { [gate]: fact } } — ONE plain fact per gate, in the world's words (a platform rides, leaves a
 *         band, jams), its equality isolated left to right (`ltr`). Never « wrong ».
 * The waves are built HERE (`gatesOf`), not by the kit's `buildWave`: it keeps numbers ≥ 0 only, and a gate of this
 * lesson may be a decimal, a fraction or a negative number. MENTAL ARITHMETIC: a gate comes in about three seconds — the
 * squares stay those of the tables (up to 15 × 15), the courts of a bracket below 100.
 * Each key practises ITS rule only: 🔑 the side of a court (a root of a perfect square, the number whose root is
 * given); ✍️ between which two whole numbers a root lies, which court no decimal rides, which court a calculator's
 * display belongs to; 🔁 (√a)² and √(a²), with decimals, fractions and a walk to the left.
 */
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import {
  calculator,
  compare,
  equal,
  K1,
  K2,
  K3,
  ltr,
  read,
  rodFact,
  rootOf,
  sq,
  square,
  steps,
  tex,
  tiles,
  valueOf,
  wholeBelow,
  write,
} from './math';

/** A gate as the rail shows it: a whole number, or its writing (« 0,7 », « 3/5 », « −9 » with the true minus sign). */
const gate = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? Number(t) : t.replace('-', '−');
};
const isWhole = (x) => read(x).d === 1n;
/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  const x = valueOf(n);
  if (!x) return false;
  switch (w.type) {
    case 'side':
    case 'sqrt':
      return compare(x, '0') >= 0 && equal(square(x), w.a);
    case 'of':
      return equal(x, square(w.k));
    case 'before':
      return isWhole(x) && compare(x, '0') >= 0 && Number(x.n) === wholeBelow(w.a);
    case 'after':
      return isWhole(x) && Number(x.n) === wholeBelow(w.a) + 1;
    case 'noRide':
      return compare(x, '0') >= 0 && rootOf(x) === null;
    case 'ride':
      return compare(x, '0') >= 0 && rootOf(x) !== null;
    case 'display':
      return isWhole(x) && compare(x, '0') > 0 && calculator(write(x)) === w.shows;
    case 'sqSqrt':
      return equal(x, w.a);
    case 'sqrtSq':
      return compare(x, '0') >= 0 && equal(square(x), square(w.x));
    default:
      return false;
  }
}

/**
 * A wave: the right gate, two others drawn from `pool` (never one the wave would also count right, never twice the same
 * number), and the fact of each. null (« ask again ») when the pool has fewer than two.
 */
function gatesOf(rand, base, right, pool, fact, rightFact) {
  const seen = new Set([write(right)]);
  const wrong = [];
  for (const g of shuffle(rand, pool)) {
    if (g == null || !valueOf(g)) continue;
    const k = write(g);
    if (seen.has(k) || isRight(base, g)) continue;
    seen.add(k);
    wrong.push(g);
  }
  if (wrong.length < 2) return null;
  const others = wrong.slice(0, 2);
  const gates = shuffle(rand, [gate(right), ...others.map(gate)]);
  return {
    ...base,
    gates,
    good: gates.indexOf(gate(right)),
    why: { right: rightFact, wrong: Object.fromEntries(others.map((g) => [gate(g), fact(g)])) },
  };
}

/** A length of tenths, written: 7 → « 0,7 », 13 → « 1,3 ». */
const tenths = (t) => write(`${t}/10`);
/** A court whose area is not a square (whole, from lo to hi), drawn at random. */
const notSquare = (rand, lo, hi) => {
  const a = int(rand, lo, hi);
  return rootOf(String(a)) === null ? a : null;
};
const both = (n) => `${ltr(`${n} × ${n} = ${n * n}`)} و ${ltr(`${n + 1} × ${n + 1} = ${(n + 1) * (n + 1)}`)}`;

// ── the kinds of question ──
const G = {
  /** 🔑 « ضلع ساحة مساحتها 64 بلاطة »: the number whose square is the area (a tile count, read without a formula). */
  side(rand, { kMin, kMax }) {
    const k = int(rand, kMin, kMax);
    const a = String(k * k);
    const base = { type: 'side', key: K1, a, say: `ضلع ساحة مساحتها ${tiles(a)}` };
    const pool = [k - 1, k + 1, (k * k) % 2 === 0 ? (k * k) / 2 : null, (k * k) % 4 === 0 ? (k * k) / 4 : null];
    return gatesOf(
      rand,
      base,
      k,
      pool.filter((g) => g != null && g > 0),
      (g) => rodFact(g, a),
      rodFact(k, a),
    );
  },
  /** 🔑 « كم يساوي؟ √64 » — a whole number, or (`dec`) a decimal: √0,49 = 0,7, √1,21 = 1,1. */
  sqrt(rand, { kMin = 2, kMax = 10, dec = false }) {
    // t: the root's whole number of tenths (dec) or the root itself
    const t = dec ? pick(rand, [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14]) : int(rand, kMin, kMax);
    const r = dec ? tenths(t) : String(t);
    const a = sq(r);
    const base = { type: 'sqrt', key: K1, a, say: 'كم يساوي؟', tex: `\\sqrt{${tex(a)}}` };
    const pool = dec
      ? [write(`${t}/100`), tenths(t + 1), tenths(t - 1), write(`${t * t}/200`)] // the comma moved, a neighbour, the half
      : [t - 1, t + 1, (t * t) % 2 === 0 ? (t * t) / 2 : null];
    return gatesOf(
      rand,
      base,
      r,
      pool.filter((g) => g != null && compare(g, '0') > 0),
      (g) => rodFact(g, a),
      rodFact(r, a),
    );
  },
  /** 🔑 « √□ = 7 »: the area whose side is given. Each fact: what the rod 7 does on the court of that gate. */
  of(rand, { kMin, kMax }) {
    const k = int(rand, kMin, kMax);
    const base = { type: 'of', key: K1, k: String(k), say: 'العدد المخفيّ', tex: `\\sqrt{\\square} = ${k}` };
    return gatesOf(
      rand,
      base,
      k * k,
      [2 * k, (k + 1) * (k + 1), (k - 1) * (k - 1)],
      (g) => rodFact(k, g),
      rodFact(k, k * k),
    );
  },
  /** ✍️ « أكبر عدد طبيعي أصغر من √58 »: the whole number before the root. */
  before(rand, { min = 3, max = 99 }) {
    const a = notSquare(rand, min, max);
    if (a == null) return null;
    const n = wholeBelow(String(a));
    const base = { type: 'before', key: K2, a: String(a), say: 'أكبر عدد طبيعي أصغر من', tex: `\\sqrt{${a}}` };
    const right = `منصّة المقياس ${n} تترك شريطًا في الساحة ${a}، ومنصّة المقياس ${n + 1} تعلق: ${both(n)}.`;
    const fact = (g) =>
      g < n
        ? `منصّة المقياس ${n} أطول منه، وما زالت تترك شريطًا في الساحة ${a}: ${ltr(`${n} × ${n} = ${n * n}`)}.`
        : rodFact(g, a);
    return gatesOf(
      rand,
      base,
      n,
      [n - 1, n + 1, n + 2].filter((g) => g >= 1),
      fact,
      right,
    );
  },
  /** ✍️ « أصغر عدد طبيعي أكبر من √58 »: the whole number after the root. */
  after(rand, { min = 3, max = 99 }) {
    const a = notSquare(rand, min, max);
    if (a == null) return null;
    const n = wholeBelow(String(a));
    const base = { type: 'after', key: K2, a: String(a), say: 'أصغر عدد طبيعي أكبر من', tex: `\\sqrt{${a}}` };
    const right = `منصّة المقياس ${n + 1} تعلق في الساحة ${a}، ومنصّة المقياس ${n} تترك شريطًا: ${both(n)}.`;
    const fact = (g) =>
      g > n + 1
        ? `منصّة المقياس ${n + 1} أقصر منه، وتعلق أيضًا في الساحة ${a}: ${ltr(`${n + 1} × ${n + 1} = ${(n + 1) * (n + 1)}`)}.`
        : rodFact(g, a);
    return gatesOf(
      rand,
      base,
      n + 1,
      [n, n + 2, n - 1].filter((g) => g >= 1),
      fact,
      right,
    );
  },
  /** ✍️ « ساحة لا تركبها منصّة أيّ عدد عشريّ »: the one court of the three whose area is no square. */
  noRide(rand) {
    const a = notSquare(rand, 3, 99);
    if (a == null) return null;
    const n = wholeBelow(String(a));
    const base = { type: 'noRide', key: K2, say: 'ساحة لا تركبها منصّة أيّ عدد عشريّ' };
    const squares = [
      int(rand, 2, 9) ** 2,
      int(rand, 2, 9) ** 2,
      sq(tenths(int(rand, 2, 9))),
      sq(tenths(int(rand, 11, 15))),
    ];
    const right = `ضلع الساحة ${a} بين ${n} و ${n + 1} (${both(n)})، ولا عدد عشريّ مربّعه ${a}.`;
    return gatesOf(rand, base, a, squares, (g) => rodFact(rootOf(g), g), right);
  },
  /** ✍️ « ساحة تركبها منصّة عدد عشريّ »: the one court of the three whose area is a square (a whole or a decimal one). */
  ride(rand) {
    const r = pick(rand, [String(int(rand, 2, 9)), tenths(int(rand, 2, 9)), tenths(int(rand, 11, 15))]);
    const a = sq(r);
    const base = { type: 'ride', key: K2, say: 'ساحة تركبها منصّة عدد عشريّ' };
    const others = [notSquare(rand, 3, 99), notSquare(rand, 3, 99), tenths(int(rand, 2, 9) ** 2 + 1)];
    const fact = (g) => {
      const n = wholeBelow(write(g));
      return isWhole(g)
        ? `ضلع الساحة ${g} بين ${n} و ${n + 1} (${both(n)})، ولا عدد عشريّ مربّعه ${g}.`
        : `لا عدد عشريّ مربّعه ${write(g)}: لا منصّة تركب هذه الساحة.`;
    };
    return gatesOf(rand, base, a, others, fact, rodFact(r, a));
  },
  /** ✍️ « الحاسبة عرضت 7,071067812 لضلع ساحة. ما مساحتها؟ »: three courts whose sides lie between different whole numbers. */
  display(rand) {
    const a = notSquare(rand, 5, 99);
    if (a == null) return null;
    const n = wholeBelow(String(a));
    const shows = calculator(String(a));
    const base = {
      type: 'display',
      key: K2,
      a: String(a),
      shows,
      say: `الحاسبة عرضت ${ltr(shows)} لضلع ساحة. ما مساحتها؟`,
    };
    // two courts whose sides lie between other whole numbers: the display tells them apart by its whole part
    const pool = [n - 2, n - 1, n + 1, n + 2]
      .filter((m) => m >= 2)
      .map((m) => m * m + int(rand, 1, 2 * m))
      .filter((b) => b <= 99);
    const fact = (g) => {
      const m = wholeBelow(String(g));
      return `ضلع الساحة ${g} بين ${m} و ${m + 1}: ${both(m)}.`;
    };
    const right = `${ltr(shows)} بين ${n} و ${n + 1}، وضلع الساحة ${a} كذلك: ${both(n)}.`;
    return gatesOf(rand, base, a, pool, fact, right);
  },
  /** 🔁 « (√a)² »: the court built on the side of the court a — a whole number, or (`dec`) a decimal or a fraction. */
  sqSqrt(rand, { dec = false }) {
    const a = dec
      ? pick(rand, [tenths(pick(rand, [3, 5, 6, 7, 8, 13, 15, 17])), pick(rand, ['2/3', '3/5', '5/7', '4/9'])])
      : String(notSquare(rand, 3, 30) ?? 7);
    const base = { type: 'sqSqrt', key: K3, a, say: 'كم يساوي؟', tex: `(\\sqrt{${tex(a)}})^2` };
    const double = write(`${read(a).n * 2n}/${read(a).d}`);
    const fact = (g) =>
      equal(g, square(a))
        ? `${ltr(`${write(a)} × ${write(a)} = ${sq(a)}`)}: مساحة ساحة ضلعها ${write(a)}، لا ضلعها ضلع الساحة ${write(a)}.`
        : `${ltr(`2 × ${write(a)} = ${write(g)}`)}: ضعف ${write(a)}. والساحة المبنيّة على ضلع الساحة ${write(a)} مساحتها ${write(a)}.`;
    const right = `الساحة المبنيّة على ضلع الساحة ${write(a)} مساحتها ${write(a)}.`;
    return gatesOf(rand, base, a, [double, sq(a)], fact, right);
  },
  /** 🔁 « √(a²) »: the side of the court built on a rod — whole, (`neg`) a walk to the left, (`dec`) a decimal or a fraction. */
  sqrtSq(rand, { neg = false, dec = false }) {
    const k = dec
      ? pick(rand, [tenths(int(rand, 2, 9)), pick(rand, ['2/3', '3/4', '2/5', '5/6'])])
      : String(int(rand, 2, 12));
    const x = neg ? `-${k}` : k;
    const inner = neg ? `(-${tex(k)})` : dec ? (k.includes('/') ? `\\left(${tex(k)}\\right)` : `(${tex(k)})`) : tex(k);
    const base = { type: 'sqrtSq', key: K3, x, say: 'كم يساوي؟', tex: `\\sqrt{${inner}^2}` };
    const area = sq(k);
    const right = neg
      ? `مشيُ ${steps(Number(k))} إلى اليسار يبني ساحة مساحتها ${area}، وضلعها ${k}: الطول لا إشارة له.`
      : `ساحة بُنيت على مقياس طوله ${write(k)} مساحتها ${area}، وضلعها ${write(k)}.`;
    const fact = (g) => {
      if (compare(g, '0') < 0) return `الضلع طول، والطول لا إشارة له: ضلع الساحة ${area} هو ${write(k)}.`;
      if (equal(g, area)) return `${ltr(`${write(k)} × ${write(k)} = ${area}`)}: هذه مساحة الساحة، وضلعها ${write(k)}.`;
      return rodFact(g, area);
    };
    const twice = write(`${read(k).n * 2n}/${read(k).d}`);
    return gatesOf(rand, base, k, neg ? [x, area, twice] : [area, twice], fact, right);
  },
};

/** The map: one node per key in the order of the lesson, then the summary node; levels from the easiest. */
export const PRACTICE_NODES = [
  {
    id: K1,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['side', { kMin: 2, kMax: 9 }],
          ['sqrt', { kMin: 2, kMax: 10 }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['sqrt', { kMin: 11, kMax: 15 }],
          ['of', { kMin: 4, kMax: 12 }],
          ['sqrt', { dec: true }],
        ],
      },
    ],
  },
  {
    id: K2,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['before', { max: 99 }],
          ['after', { max: 99 }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['noRide', {}],
          ['ride', {}],
          ['display', {}],
        ],
      },
    ],
  },
  {
    id: K3,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['sqSqrt', {}],
          ['sqrtSq', {}],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['sqSqrt', { dec: true }],
          ['sqrtSq', { neg: true }],
          ['sqrtSq', { dec: true }],
        ],
      },
    ],
  },
  // the summary node: two mixed runs, the second faster
  {
    id: SUMMARY,
    levels: [
      {
        speed: 6.2,
        mix: [
          ['sqrt', { kMin: 2, kMax: 12 }],
          ['before', { max: 99 }],
          ['sqSqrt', {}],
          ['sqrtSq', {}],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['of', { kMin: 4, kMax: 12 }],
          ['display', {}],
          ['noRide', {}],
          ['sqrtSq', { neg: true }],
          ['sqSqrt', { dec: true }],
        ],
      },
    ],
  },
];
/** The ladder of this lesson: its levels, bound to its nodes and its generators. */
export const ladder = createLadder({ nodes: PRACTICE_NODES, generators: G, isRight });
export const { waveOf } = ladder;

/**
 * The practice hub draws the ladder as the lesson's mind map (percent of the map box, drawn left to right). Laid out for
 * the map of 1366×768 (about 590 × 408 px: the card of 68rem, its map 1.35 of 2.35): a node is its disc (66 px) over
 * its name (nowrap) — about 107 px high, ±13 % — and the longest name, ✍️'s tablet title, about 230 px wide (±20 %),
 * so it stands between 21 % and 79 %. Every label sits where no node is (`practice.test.js` measures it). The root says
 * the place, never a key's name (it shows before the first key).
 */
export const PRACTICE_MAP = {
  root: 'ضلع الساحة ومساحتها',
  positions: {
    root: [50, 9],
    [K1]: [78, 32],
    [K2]: [36, 52],
    [K3]: [74, 72],
    [SUMMARY]: [30, 85],
  },
  edges: [
    ['root', K1, 'الضلع'],
    [K1, K2, 'الحاسبة'],
    [K1, K3, 'نبني ونأخذ'],
    [K2, SUMMARY, null],
    [K3, SUMMARY, 'مراجعة'],
  ],
};
