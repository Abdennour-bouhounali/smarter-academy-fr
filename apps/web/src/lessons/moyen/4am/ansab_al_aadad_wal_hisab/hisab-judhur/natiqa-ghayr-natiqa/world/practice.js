/**
 * « حلبة التدريب » of lesson `natiqa-ghayr-natiqa` — the CONTENT of its practice ladder (PURE). The ladder is the kit's
 * (`gameworld/kit/ladder.js`); a level is a run of the kit's rail of light (`kit/GateRun.js`), played in « قصر الساحات »
 * by `rootCourts/Game.js › startPractice`, which reads from each wave:
 *   say   the order on the white card — a PLAIN Arabic string (no `$`, no backslash);
 *   tex   optional, a LaTeX formula shown after it (« \\sqrt{1{,}96} », « \\sqrt{\\dfrac{18}{98}} »);
 *   gates three numbers or short plain strings over the arches (a decimal « 1,4 », a fraction « 3/7 » drawn with a bar);
 *   good  the index of the right gate;
 *   why   { right, wrong: { [gate]: fact } } — ONE plain fact per gate, in the world's words (a platform rides, leaves a
 *         band, jams), its equality isolated left to right (`ltr`). Never « wrong ».
 * The waves are built HERE (`gatesOf`): a gate of this lesson may be a decimal or a fraction (the kit's `buildWave` keeps
 * whole numbers). MENTAL ARITHMETIC: a gate comes in about three seconds — squares of tenths and of small fractions,
 * a calculator's display read, a middle mark compared.
 * Each key practises ITS rule only: 🧩 the side of a court whose area is the square of a decimal or of a fraction, and
 * which area has such a side; ♾️ which area has NO such side, and the square of what a calculator shows; 🎯 the values
 * by default and by excess, and the ROUNDED value, from a calculator's display.
 */
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createLadder, SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import {
  above,
  calculator,
  compare,
  cut,
  equal,
  K1,
  K2,
  K3,
  ltr,
  middle,
  read,
  rodFact,
  said,
  rootOf,
  rounded,
  sq,
  square,
  tex,
  valueOf,
  wholeBelow,
  write,
} from './math';

/** A gate as the rail shows it: a whole number, or its writing (« 1,4 », « 3/7 »). */
const gate = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? Number(t) : t;
};
/** The mark of a dial of k decimals: « 0,1 », « 0,01 ». */
const stepOf = (k) => write(`1/${10n ** BigInt(k)}`);

/** Is gate value n right for this wave? ONE definition, used to build the wave, to judge the student and by the tests. */
export function isRight(w, n) {
  const x = valueOf(n);
  if (!x) return false;
  switch (w.type) {
    case 'sqrtDec':
    case 'sqrtFrac':
      return compare(x, '0') >= 0 && equal(square(x), w.a);
    case 'writable':
      return compare(x, '0') >= 0 && rootOf(x) !== null;
    case 'notWritable':
      return compare(x, '0') >= 0 && rootOf(x) === null;
    case 'calcSquare':
      return equal(x, square(w.x));
    case 'byDefault':
      return equal(x, cut(w.a, w.k));
    case 'byExcess':
      return equal(x, above(w.a, w.k));
    case 'round':
      return equal(x, rounded(w.a, w.k));
    default:
      return false;
  }
}

/**
 * A wave: the right gate, two others drawn from `pool` (never one the wave would also count right, never twice the same
 * number), and the fact of each. null (« ask again ») when the pool has fewer than two.
 */
function gatesOf(rand, base, right, pool, fact, rightFact) {
  if (write(right).length > 6) return null;
  const seen = new Set([write(right)]);
  const wrong = [];
  for (const g of shuffle(rand, pool)) {
    if (g == null || !valueOf(g)) continue;
    const k = write(g);
    if (seen.has(k) || isRight(base, g) || k.length > 6) continue;
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

/** A length of tenths, written: 7 → « 0,7 », 14 → « 1,4 ». */
const tenths = (t) => write(`${t}/10`);
/**
 * The irreducible fractions p/q whose squares the waves show (none is an area of the bank's headlines nor the final
 * mission's: `practice.test.js` reads the bank).
 */
export const FRACTIONS = [
  [3, 7],
  [5, 9],
  [4, 7],
  [2, 7],
  [2, 9],
  [4, 11],
  [5, 7],
  [7, 12],
  [1, 6],
];
/** The roots, in tenths, whose squares the waves show (their squares are no radicand of the bank). */
const ROOT_TENTHS = [4, 8, 14, 16, 17, 19, 21, 23];
/** A whole area that is no square, drawn at random — or null (« ask again »). */
const notSquare = (rand, lo, hi) => {
  const a = int(rand, lo, hi);
  return rootOf(String(a)) === null ? String(a) : null;
};
/** Why no number writes the side of a court of area g (a number that is no square of a fraction): a plain fact. */
export function noSideFact(g) {
  const { n, d } = read(g);
  if (d === 1n) {
    const m = wholeBelow(g);
    return `ضلع الساحة ${write(g)} بين ${m} و ${m + 1} (${ltr(`${m} × ${m} = ${m * m}`)} و ${ltr(`${m + 1} × ${m + 1} = ${(m + 1) * (m + 1)}`)})، ولا كسر مربّعه ${write(g)}.`;
  }
  const odd = rootOf(String(n)) === null ? n : d;
  // a fraction over a real bar, never « n/d » as text (the fact is drawn by MathText)
  const written = write(g).includes('/') ? said(g) : `$${tex(g)} = \\dfrac{${n}}{${d}}$`;
  return `${written}، و ${odd} ليس مربّع عدد طبيعي: لا علامة ولا كسر تركب منصّته الساحة ${said(g)}.`;
}
/** The areas that are NOT the square of a fraction, for the sorting waves: one decimal, a whole number, a fraction. */
const noSquarePool = (rand) => [
  tenths(pick(rand, [6, 8, 14, 15, 18, 22, 26, 34, 35])), // a number of one decimal is never the square of a fraction
  notSquare(rand, 3, 30),
  pick(rand, ['8/9', '7/36', '3/49', '5/18', '10/81', '2/45']),
];
/** The areas that ARE the square of a decimal or of a fraction. */
const squarePool = (rand) => [
  sq(tenths(pick(rand, ROOT_TENTHS))),
  sq(write(`${pick(rand, FRACTIONS)[0]}/${pick(rand, FRACTIONS)[1]}`)),
  sq(write(`${pick(rand, FRACTIONS).join('/')}`)),
];

// ── the kinds of question ──
const G = {
  /** 🧩 « √1,96 »: the side of a court whose area is the square of a decimal (`hundredths`: of hundredths, « √0,0169 »). */
  sqrtDec(rand, { hundredths = false } = {}) {
    const t = pick(rand, hundredths ? [4, 6, 8, 12, 15] : ROOT_TENTHS);
    const r = hundredths ? write(`${t}/100`) : tenths(t);
    const a = sq(r);
    if (a.length > 7) return null;
    const base = { type: 'sqrtDec', key: K1, a, say: 'كم يساوي؟', tex: `\\sqrt{${a.replace(',', '{,}')}}` };
    // the slips: the comma moved, a neighbour, the half of the area
    const pool = [
      write(`${read(r).n}/${read(r).d * 10n}`),
      write(`${read(r).n + 1n}/${read(r).d}`),
      write(`${read(r).n - 1n}/${read(r).d}`),
      write(`${read(a).n}/${read(a).d * 2n}`),
    ];
    return gatesOf(
      rand,
      base,
      r,
      pool.filter((g) => compare(g, '0') > 0),
      (g) => rodFact(g, a),
      rodFact(r, a),
    );
  },
  /** 🧩 « √(9/49) »: a fraction's side — `reduce`: shown unreduced (« √(18/98) »), reduced first. */
  sqrtFrac(rand, { reduce = false } = {}) {
    const [p, q] = pick(rand, FRACTIONS);
    const k = reduce ? pick(rand, [2, 3]) : 1;
    const a = write(`${p * p}/${q * q}`);
    const r = write(`${p}/${q}`);
    const base = { type: 'sqrtFrac', key: K1, a, say: 'كم يساوي؟', tex: `\\sqrt{\\dfrac{${p * p * k}}{${q * q * k}}}` };
    const pool = [`${p}/${q * q}`, `${p * p}/${q}`, `${q}/${p}`, `${p + 1}/${q}`, `${p * k}/${q}`];
    return gatesOf(rand, base, r, pool, (g) => rodFact(g, a), rodFact(r, a));
  },
  /** 🧩 « ساحة يكتب ضلعَها عددٌ عشريّ أو كسر »: the one court of the three whose side is a number. */
  writable(rand) {
    const right = pick(rand, squarePool(rand));
    const base = { type: 'writable', key: K1, say: 'ساحة يكتب ضلعها عدد عشريّ أو كسر' };
    return gatesOf(rand, base, right, noSquarePool(rand), noSideFact, rodFact(rootOf(right), right));
  },
  /** ♾️ « ساحة لا يكتب ضلعَها أيّ كسر »: the one court of the three whose side no number writes. */
  notWritable(rand, { frac = false } = {}) {
    const pool = noSquarePool(rand);
    const right = frac ? pool[2] : pick(rand, pool.slice(0, 2));
    if (right == null) return null;
    const base = { type: 'notWritable', key: K2, say: 'ساحة لا يكتب ضلعها أيّ كسر' };
    return gatesOf(rand, base, right, squarePool(rand), (g) => rodFact(rootOf(g), g), noSideFact(right));
  },
  /** ♾️ « الحاسبة عرضت 4,358898944 لضلع الساحة 19 — كم يساوي 4,3² ؟ »: the square of what the display gives, never the area. */
  calcSquare(rand, { max = 30 } = {}) {
    const a = notSquare(rand, 3, max);
    if (a == null) return null;
    const x = cut(a, 1);
    const base = {
      type: 'calcSquare',
      key: K2,
      a,
      x,
      say: `الحاسبة عرضت ${ltr(calculator(a))} لضلع الساحة ${a}. كم يساوي؟`,
      tex: `${x.replace(',', '{,}')}^2`,
    };
    const hi = above(a, 1);
    const fact = (g) => {
      if (equal(g, a)) return `${ltr(`${x} × ${x} = ${sq(x)}`)}: ليس ${a}. ما تعرضه الحاسبة يقترب من الضلع ولا يبلغه.`;
      if (equal(g, square(hi))) return `${ltr(`${hi} × ${hi} = ${sq(hi)}`)}: هذا مربّع ${hi}، لا مربّع ${x}.`;
      return `${ltr(`2 × ${x} = ${write(g)}`)}: هذا ضعف ${x}، لا مربّعه.`;
    };
    const right = `${ltr(`${x} × ${x} = ${sq(x)}`)}، أصغر من ${a}: منصّة المقياس ${x} تترك شريطًا في الساحة ${a}.`;
    return gatesOf(rand, base, sq(x), [a, sq(hi), write(`${read(x).n * 2n}/${read(x).d}`)], fact, right);
  },
  /** 🎯 the value BY DEFAULT to 0,1 or 0,01, read from a calculator's display. */
  byDefault(rand, { k = 1 } = {}) {
    return bound(rand, k, 'byDefault');
  },
  /** 🎯 the value BY EXCESS to 0,1 or 0,01. */
  byExcess(rand, { k = 1 } = {}) {
    return bound(rand, k, 'byExcess');
  },
  /** 🎯 the ROUNDED value to 0,1 or 0,01: the middle mark decides. */
  round(rand, { k = 1 } = {}) {
    const a = notSquare(rand, 3, 99);
    if (a == null) return null;
    const [lo, hi, mid, r] = [cut(a, k), above(a, k), middle(a, k), rounded(a, k)];
    const base = {
      type: 'round',
      key: K3,
      a,
      k,
      say: `الحاسبة عرضت ${ltr(calculator(a))} لضلع الساحة ${a}. العلامة الأقرب من علامات ${ltr(stepOf(k))}:`,
    };
    const m = sq(mid);
    const midFact = `العلامة الوسطى ${mid}: ${ltr(`${mid} × ${mid} = ${m}`)}، ${compare(m, a) < 0 ? `أصغر من ${a} — تترك شريطًا، فالجدار ينتهي بعدها` : `أكبر من ${a} — تعلق، فالجدار ينتهي قبلها`}.`;
    const fact = (g) => (equal(g, mid) ? `${mid} علامة وسطى، ليست من علامات ${stepOf(k)}. ${midFact}` : midFact);
    return gatesOf(rand, base, r, [equal(r, lo) ? hi : lo, mid], fact, `${midFact} الأقرب: ${r}.`);
  },
};
/** A wave of a value by default or by excess, from a calculator's display. */
function bound(rand, k, type) {
  const a = notSquare(rand, 3, 99);
  if (a == null) return null;
  const [lo, hi] = [cut(a, k), above(a, k)];
  const step = stepOf(k);
  const what = type === 'byDefault' ? 'بالنقصان' : 'بالزيادة';
  const base = {
    type,
    key: K3,
    a,
    k,
    say: `الحاسبة عرضت ${ltr(calculator(a))} لضلع الساحة ${a}. القيمة المقرّبة إلى ${ltr(step)} ${what}:`,
  };
  const below = write(`${(read(lo).n * 10n ** BigInt(k)) / read(lo).d - 1n}/${10n ** BigInt(k)}`);
  const beyond = write(`${(read(hi).n * 10n ** BigInt(k)) / read(hi).d + 1n}/${10n ** BigInt(k)}`);
  const both = `${ltr(`${lo} × ${lo} = ${sq(lo)}`)} و ${ltr(`${hi} × ${hi} = ${sq(hi)}`)}`;
  const right = `منصّة المقياس ${lo} تترك شريطًا في الساحة ${a}، ومنصّة المقياس ${hi} تعلق: ${both}.`;
  const fact = (g) =>
    equal(g, lo) || equal(g, hi)
      ? `${rodFact(g, a)} ${type === 'byDefault' ? 'بالنقصان: المنصّة التي تترك شريطًا.' : 'بالزيادة: المنصّة التي تعلق.'}`
      : `${rodFact(g, a)} وبينه وبين الجدار علامة أقرب.`;
  return gatesOf(
    rand,
    base,
    type === 'byDefault' ? lo : hi,
    type === 'byDefault' ? [hi, below] : [lo, beyond],
    fact,
    right,
  );
}

/** The map: one node per key in the order of the lesson, then the summary node; levels from the easiest. */
export const PRACTICE_NODES = [
  {
    id: K1,
    levels: [
      {
        speed: 6.0,
        mix: [
          ['sqrtDec', {}],
          ['sqrtFrac', {}],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['writable', {}],
          ['sqrtFrac', { reduce: true }],
          ['sqrtDec', { hundredths: true }],
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
          ['notWritable', {}],
          ['calcSquare', {}],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['notWritable', { frac: true }],
          ['calcSquare', { max: 99 }],
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
          ['byDefault', { k: 1 }],
          ['byExcess', { k: 1 }],
        ],
      },
      {
        speed: 6.5,
        mix: [
          ['round', { k: 1 }],
          ['round', { k: 2 }],
          ['byDefault', { k: 2 }],
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
          ['sqrtDec', {}],
          ['notWritable', {}],
          ['byDefault', { k: 1 }],
          ['round', { k: 1 }],
        ],
      },
      {
        speed: 6.6,
        mix: [
          ['sqrtFrac', { reduce: true }],
          ['writable', {}],
          ['calcSquare', {}],
          ['round', { k: 2 }],
        ],
      },
    ],
  },
];
/** The ladder of this lesson: its levels, bound to its nodes and its generators. */
export const ladder = createLadder({ nodes: PRACTICE_NODES, generators: G, isRight });
export const { waveOf } = ladder;

/**
 * The practice hub draws the ladder as the lesson's mind map (percent of the map box). Laid out as lesson 1's (the map
 * of 1366×768 is about 590 × 408 px; a node is its disc over its name; `practice.test.js` measures it). The root says
 * the place, never a key's name (it shows before the first key).
 */
export const PRACTICE_MAP = {
  root: 'أضلاع الساحات الصغيرة',
  positions: {
    root: [50, 9],
    [K1]: [78, 32],
    [K2]: [32, 52],
    [K3]: [74, 72],
    [SUMMARY]: [30, 85],
  },
  edges: [
    ['root', K1, 'الأعشار'],
    [K1, K2, 'الجدار'],
    [K1, K3, 'العلامات'],
    [K2, SUMMARY, null],
    [K3, SUMMARY, 'مراجعة'],
  ],
};
