/**
 * THE FELUCCA'S LEGS of lesson `triangles-semblables` — the content of the kit's rail (`kit/GateRun.js`) between two docks
 * of « Les pyramides », in the river's skin with its crocodiles (`nilePyramids/riverMeshes.js`). PURE.
 *
 * The world reads `story.legs[i]` by the dock's PLACE in the world (0–4, `nilePyramids/Game.js › board`): this story
 * sails docks 1 → 3 → 4 (« Le chantier des bâtisseurs », « Le pyramidion », « Le palmier du plateau »), so it has two
 * legs, keyed 1 and 3:
 *   leg 1 (workshop → summit), after K1 — the computations of the sides' exercises: « Complète » a proportion of two
 *         quotients (`\dfrac{6}{9} = \dfrac{10}{\square}`), « Calcule » a coefficient (`9 \div 6`);
 *   leg 3 (summit → plateau), after K2 — the computation of the angles' exercises: the third angle of a triangle,
 *         « Calcule » `180 - 65 - 48` or « Complète » `65 + 48 + \square = 180`.
 * The practice ladder's second level of K1 adds « Calcule » a side times its coefficient (`6 \times 1{,}5`).
 *
 * EVERY BUOY IS ONE BARE CALCULATION (owner, 2026-11-27: « the questions must be speed calculation questions like:
 * complete: 4/12 = 5/… »): no letter of a point, no figure, no sentence to interpret — `say` the order alone
 * (« Complète », « Calcule »), `tex` the calculation, the box `\square`. Mental numbers: a side under ten, a coefficient a
 * short decimal. Four right buoys reach the next dock (`total: 4`). The SAME generators are the practice ladder's
 * (`practice.js`): a leg is the first level of the node of the key just sealed.
 *
 * A wave is DATA (the kit's ladder): { type, key, say, tex, gates: [3], good, why: { right, wrong: { [gate]: fact } },
 * data, pairs, seconds } — a gate a whole number or a short decimal (« 1,5 »), at most 6 characters; `why` ONE fact per
 * gate (never « faux »: the two products, the product, the sum of the three angles); `data` the numbers asked; `pairs`
 * every pair of numbers of ten and more the calculation shows. `run.test.js` checks every wave.
 */
import { pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { WORLD_TEXT } from '../../../../../../common/gameworld/nilePyramids/strings';
import { K, compare, equal, frAll, isInteger, minus, over, plus, times, tx, write } from './math';

/** A gate: a whole number, or its decimal writing (« 1,5 »). */
const gate = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? Number(t) : t;
};
/** « $a \\times b = c$ » — a formula (the rail draws `why` with MathText; true: `run.test.js` checks every one). */
const prod = (a, b) => `$${tx(a)} \\times ${tx(b)} = ${tx(times(a, b))}$`;

/**
 * The right value of a wave, from its data alone — ONE definition, used to build the wave, to judge him and by the
 * tests (which compute it again from the calculation the order writes).
 */
function truthOf(w) {
  const d = w.data;
  switch (w.type) {
    case 'quatrieme':
      return write(over(times(d.b, d.c), d.a));
    case 'coefficient':
      return write(over(d.b, d.a));
    case 'cote':
      return write(times(d.a, d.k));
    case 'troisieme':
    case 'complement':
      return write(minus(minus('180', d.a), d.b));
    default:
      return null;
  }
}
/** Is gate value n right for this wave? */
export function isRight(w, n) {
  try {
    return equal(String(n), truthOf(w));
  } catch {
    return false;
  }
}

/**
 * How long each kind of buoy takes a 3e student, in seconds, computing in his head while he steers: reading the
 * calculation, its steps, the choice of a buoy. `SPARE` is the owner's five seconds (2026-11-25); the rail places the
 * buoy row `seconds` of travel ahead (`kit/GateRun.js › next`).
 */
export const THINK = {
  quatrieme: 12, // the quotient read across, the box's number times it
  coefficient: 10, // a quotient of two small numbers, a short decimal
  cote: 8, // a small number times a short decimal
  troisieme: 10, // 180 minus two angles
  complement: 10, // the same, read as a missing term
};
export const SPARE = 5;

/** The numbers of ten and more a calculation writes (« 1{,}5 » is read 1,5), as the pairs it shows. */
export const pairsOf = (texText) => {
  const big = [...String(texText).matchAll(/\d+(?:\{,\}\d+)?/g)]
    .map((m) => Number(m[0].replace('{,}', '.')))
    .filter((x) => x >= 10);
  return big.flatMap((x, i) => big.slice(i + 1).map((y) => [x, y])).filter(([x, y]) => x !== y);
};

/** Does a sentence write `value` alone as a side of one of its formulas (« $4 \\times 6{,}5 = 26$ » writes 26)? */
const reveals = (sentence, value) =>
  [...String(sentence).matchAll(/\$([^$]+)\$/g)].some((m) => m[1].split('=').some((side) => side.trim() === tx(value)));

/**
 * A wave: the right gate, two others drawn from `pool` — [value, fact] — (never one the wave would count right, never
 * twice the same, a whole number or a decimal of at most 6 characters, positive). null (« ask again ») when the pool
 * has fewer than two.
 */
function waveOf(rand, base, pool, rightFact) {
  const right = truthOf(base);
  if (!right || right.includes('/') || right.length > 6) return null;
  const seen = new Set([right]);
  const wrong = [];
  for (const [g, fact] of shuffle(rand, pool)) {
    if (g == null) continue;
    let k;
    try {
      if (compare(g, '0') <= 0) continue;
      k = write(g);
    } catch {
      continue;
    }
    if (k.includes('/') || seen.has(k) || isRight(base, k) || k.length > 6) continue;
    // a wrong buoy's fact is the trainer's hint, shown before the answer: it never writes the right number alone
    if (reveals(fact(k), right)) continue;
    seen.add(k);
    wrong.push([k, fact]);
  }
  if (wrong.length < 2) return null;
  const others = wrong.slice(0, 2);
  const gates = shuffle(rand, [gate(right), ...others.map(([k]) => gate(k))]);
  return {
    ...base,
    pairs: pairsOf(base.tex),
    seconds: THINK[base.type] + SPARE,
    // the ladder never draws the same numbers twice in a row: its `a` / `b` are the order's calculation
    a: base.tex,
    b: base.say,
    gates,
    good: gates.indexOf(gate(right)),
    why: {
      right: frAll(rightFact),
      wrong: Object.fromEntries(others.map(([k, fact]) => [gate(k), frAll(fact(k))])),
    },
  };
}

const DIGITS = ['2', '3', '4', '5', '6', '7', '8', '9'];
/** The coefficients of « Calcule a × k »: short decimals (the easy ones end in 5 tenths). */
const COEFS = { easy: ['1,5', '2,5', '0,5', '3,5'], hard: ['1,25', '0,75', '2,25', '1,2', '0,8', '1,4'] };
/**
 * The angles of the third-angle buoys: two angles of a triangle [a, b] and its third. Each angle and each pair stands on
 * no line of a bank or of another lesson's story beside the other or beside 180 (`run.test.js` re-reads every bank).
 * Easy: a + b ends in 0. Hard: it does not.
 */
const ANGLES = {
  easy: [
    ['25', '45'],
    ['39', '51'],
    ['43', '87'],
    ['47', '93'],
    ['61', '69'],
    ['34', '86'],
    ['29', '91'],
    ['55', '85'],
  ],
  hard: [
    ['27', '48'],
    ['28', '69'],
    ['31', '78'],
    ['34', '79'],
    ['37', '57'],
    ['41', '77'],
    ['43', '56'],
    ['45', '48'],
    ['49', '59'],
    ['54', '67'],
  ],
};

/** The facts of the two products of a proportion « a / b = c / x »: a × x and b × c. */
const crossOf = (a, b, c) => (x) => `${prod(a, x)} et ${prod(b, c)}`;

/** The third angle: from two angles [a, b] (in a random order), the wave of `type`, its pool and its facts. */
function angleWave(rand, type, say, texOf, { hard = false } = {}) {
  const [a, b] = shuffle(rand, pick(rand, ANGLES[hard ? 'hard' : 'easy']));
  const s = write(plus(a, b));
  const c = write(minus('180', s));
  const base = { type, key: K.angles, say, tex: texOf(a, b), data: { a, b } };
  const sumWith = (g) =>
    `Avec $${tx(g)}$ : $${a} + ${b} + ${tx(g)} = ${tx(plus(s, g))}$, et non $180$ : les trois angles ne ferment pas le triangle.`;
  return waveOf(
    rand,
    base,
    [
      [s, sumWith], // stopped at the sum of the two
      [write(minus('180', a)), sumWith], // one angle forgotten
      [write(minus('180', b)), sumWith],
      [write(plus(c, '10')), sumWith], // a ten slipped in the subtraction
      [write(minus(c, '10')), sumWith],
    ],
    `$${a} + ${b} = ${s}$ et $180 - ${s} = ${c}$ : les trois angles font $180$.`,
  );
}

// ───────────────────────────── the kinds of buoy ─────────────────────────────
export const GENERATORS = {
  /**
   * K1 — « Complète » a proportion: \dfrac{a}{b} = \dfrac{c}{□}, x = b × c ÷ a (the side of the second triangle from the
   * equal quotients). Easy: c a multiple of a; hard: it is not (6 / 4 = 9 / □).
   */
  quatrieme(rand, { hard = false } = {}) {
    const a = pick(rand, DIGITS);
    const b = pick(
      rand,
      DIGITS.filter((x) => x !== a),
    );
    const cs = Array.from({ length: 19 }, (_, i) => String(i + 2)).filter(
      (c) =>
        c !== a &&
        c !== b &&
        isInteger(over(times(b, c), a)) &&
        Number(write(over(times(b, c), a))) <= 40 &&
        isInteger(over(c, a)) !== hard,
    );
    if (!cs.length) return null;
    const c = pick(rand, cs);
    const base = {
      type: 'quatrieme',
      key: K.cotes,
      say: 'Complète',
      tex: `\\dfrac{${a}}{${b}} = \\dfrac{${c}}{\\square}`,
      data: { a, b, c },
    };
    const cross = crossOf(a, b, c);
    const differ = (g) => `Avec $${tx(g)}$ : ${cross(g)}, les deux produits sont différents.`;
    const x = truthOf(base);
    return waveOf(
      rand,
      base,
      [
        write(minus(plus(c, b), a)), // the difference added instead of the quotient multiplied
        write(over(times(a, c), b)), // the quotient upside down
        write(plus(b, c)),
        write(times(b, c)), // the division by a forgotten
      ].map((g) => [g, differ]),
      `Avec $${tx(x)}$ : ${cross(x)}, les deux produits sont égaux.`,
    );
  },

  /** K1 — « Calcule » a coefficient: b ÷ a, a short decimal (easy: whole or « ,5 »; hard: « 0,75 », « 1,25 »…). */
  coefficient(rand, { hard = false } = {}) {
    const pairs = DIGITS.flatMap((a) => DIGITS.filter((b) => b !== a).map((b) => [a, b])).filter(([a, b]) => {
      const k = write(over(b, a));
      if (k.includes('/')) return false;
      const easy = /^\d+(,5)?$/.test(k);
      return hard ? !easy : easy;
    });
    const [a, b] = pick(rand, pairs);
    const base = {
      type: 'coefficient',
      key: K.cotes,
      say: 'Calcule',
      tex: `${b} \\div ${a}`,
      data: { a, b },
    };
    const k = truthOf(base);
    const product = (g) => `${prod(a, g)}, et non $${b}$.`;
    return waveOf(
      rand,
      base,
      [
        [write(minus(b, a)), product], // the difference of the two sides
        [write(minus(a, b)), product],
        [write(over(a, b)), product], // the quotient upside down
        [write(times(a, b)), product], // a product instead of a quotient
      ],
      `${prod(a, k)} : $${b} \\div ${a} = ${tx(k)}$.`,
    );
  },

  /** K1 — « Calcule » a side times its coefficient: a × k (easy k: « 1,5 », « 2,5 »…; hard: « 1,25 », « 0,8 »…). */
  cote(rand, { hard = false } = {}) {
    const a = pick(rand, DIGITS);
    const k = pick(rand, COEFS[hard ? 'hard' : 'easy']);
    const base = {
      type: 'cote',
      key: K.cotes,
      say: 'Calcule',
      tex: `${a} \\times ${tx(k)}`,
      data: { a, k },
    };
    const whole = write(String(Math.floor(Number(k.replace(',', '.')))));
    return waveOf(
      rand,
      base,
      [
        [write(plus(a, k)), (g) => `$${a} + ${tx(k)} = ${tx(g)}$ : c’est une somme, pas un produit.`],
        [
          write(over(a, k)),
          (g) => `${prod(g, k)} : $${tx(g)}$ est le quotient de $${a}$ par $${tx(k)}$, pas le produit.`,
        ],
        [write(times(a, whole)), (g) => `$${a} \\times ${whole} = ${tx(g)}$ : la partie après la virgule est oubliée.`],
      ],
      `${prod(a, k)}.`,
    );
  },

  /** K2 — « Calcule » the third angle: 180 − a − b. */
  troisieme(rand, params) {
    return angleWave(rand, 'troisieme', 'Calcule', (a, b) => `180 - ${a} - ${b}`, params);
  },

  /** K2 — « Complète » the sum of the three angles: a + b + □ = 180. */
  complement(rand, params) {
    return angleWave(rand, 'complement', 'Complète', (a, b) => `${a} + ${b} + \\square = 180`, params);
  },
};

// ───────────────────────────── the legs ─────────────────────────────

/** What each leg asks, by the dock it leaves (its place in the world): the first level of the node of the key just sealed. */
export const LEG_MIX = {
  1: [
    ['quatrieme', {}],
    ['coefficient', {}],
  ],
  3: [
    ['troisieme', {}],
    ['complement', {}],
  ],
};
const TRIES = 400;
/** One fair wave of a kind: exactly one right gate. */
export function fairWave(rand, kind, params) {
  for (let i = 0; i < TRIES; i += 1) {
    const w = GENERATORS[kind](rand, params);
    if (w && w.gates.filter((g) => isRight(w, g)).length === 1) return w;
  }
  throw new Error(`run: no wave of kind ${kind}`);
}
/** A gate as the rail draws it: its writing, as text (« 1,5 », « 15 »). */
export const gateOption = (g) => ({ t: String(g) });
/** A wave as the rail plays it: { ask, tex, options × 3, right, why × 3, seconds } — no figure. */
export const roundOf = (w) => ({
  ask: w.say,
  tex: w.tex ?? null,
  options: w.gates.map(gateOption),
  right: w.good,
  why: w.gates.map((g, i) => (i === w.good ? w.why.right : (w.why.wrong?.[g] ?? w.why.right))),
  seconds: w.seconds,
});

/** The words of the rail's cards (`kit/GateRunHud.jsx › content.text`): the world's, a leg's own where it differs. */
const TEXT = frAll({
  ...WORLD_TEXT.practice,
  title: 'La felouque vers l’embarcadère suivant',
  say: 'Quatre bonnes bouées te mènent à l’embarcadère. Chaque bouée porte un nombre.',
  leave: 'Retour à l’embarcadère',
  won: { title: 'Embarcadère atteint', text: 'L’étape suivante t’attend sur la rive.' },
  lost: { title: 'Plus de cœurs', text: 'La felouque revient à son embarcadère : refais la traversée.' },
});
/** The names of the legs, on the rail's card (a place of the river, never a rule). */
const LEG_NAMES = { 1: 'Du chantier au pyramidion', 3: 'Du pyramidion au palmier' };

/** The leg from dock i (its place in the world): the content `story.legs[i]` hands the world. */
function legOf(i) {
  const mix = LEG_MIX[i];
  return {
    total: 4,
    gates: 4,
    levels: [{ name: LEG_NAMES[i], from: '' }],
    round: (_level, random, n) => {
      const [kind, params] = mix[n % mix.length];
      return roundOf(fairWave(random, kind, params));
    },
    text: { ...TEXT, title: frAll(`${TEXT.title} : ${LEG_NAMES[i]}`) },
  };
}
/** The two legs, keyed by the dock they leave (`story.legs`). */
export const LEGS = { 1: legOf(1), 3: legOf(3) };
