/**
 * THE FELUCCA'S LEGS of lesson `thales-configuration-papillon` — the content of the kit's rail (`kit/GateRun.js`) between
 * two docks of « Les pyramides », in the river's skin with its crocodiles (`nilePyramids/riverMeshes.js`). PURE.
 *
 * The world reads `story.legs[i]` by the dock's PLACE in the world (0–4, `nilePyramids/Game.js › board`): this story
 * sails docks 2 → 3 → 4 (« La largeur du Nil », « Le pyramidion », « L’ombre de la grande pyramide »), so it has two
 * legs, keyed 2 and 3:
 *   leg 2 (river → summit), after K1 `papillon` — the computations of its exercises: complete an equality of two
 *         fractions (`egalite`: the box in any of the four places), and the cross product itself (`croix`:
 *         « 12 × 5 ÷ 4 »);
 *   leg 3 (summit → plateau), after K2 `calcul-depuis-le-sommet` — a length from the vertex written as the sum of its two
 *         pieces (`somme`: « 4 / (4 + 8) = 5 / □ »), and an equality whose answer is a short decimal (`decimal`: 7,5).
 * Four right buoys reach the next dock (`total: 4`).
 *
 * THE RIVER ASKS SPEED CALCULATIONS ONLY (owner, 2026-11-27: « the river game must never contain complicated questions:
 * the questions must be speed calculation questions like: complete: 4/12 = 5/… »; it replaces his rule of 2026-11-25,
 * so a buoy carries NO figure and names no point). Every wave is ONE bare calculation: `say` a short order
 * (« Complète », « Calcule »), `tex` the calculation, the box to fill `\square`; MENTAL numbers (k = p/q < 1, q ≤ 9, a
 * number p × m or q × m). The SAME generators are the practice ladder's (`practice.js`): a leg is the first level of
 * the node of the key just sealed; the second level draws bigger multipliers (`{ big: true }`).
 *
 * A wave is DATA (the kit's ladder): { type, key, say, tex, gates: [3], good, why: { right, wrong: { [gate]: fact } },
 * data, pairs } — `data.eq` the four numbers a / b = c / d (null in the box; `croix` is b × c ÷ a, its d the box), a
 * gate a whole number or a short decimal writing (« 7,5 »), `why` ONE fact per gate (never « faux »: the two cross
 * products, equal or different), `pairs` every pair of numbers the order shows. `run.test.js` recomputes the right
 * gate from the `tex` itself, refuses every k the bank writes, every pair standing on one line of the bank or of
 * another lesson's story, and checks every equality a fact writes.
 */
import { pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { WORLD_TEXT } from '../../../../../../common/gameworld/nilePyramids/strings';
import { compare, equal, frAll, K, minus, over, plus, times, tx, write } from './math';

/** k < 1, q ≤ 9 — none written by the bank (run.test.js reads it: 2/3, 3/4, 2/5, 3/5, 4/5, 5/7, 5/8 are). */
export const REDUCE = ['5/6', '2/7', '3/7', '4/7', '6/7', '3/8', '7/8', '2/9', '4/9', '5/9', '7/9', '8/9'];
/** The multipliers m of a number p × m or q × m: small on a leg and a first level, bigger on a second level. */
const M = { small: [1, 2, 3, 4, 5], big: [3, 4, 5, 6, 7, 8, 9] };
/** The largest number an order shows: a mental calculation. */
const MAX = 72;
/**
 * The pairs of numbers of ten and more that stand on one line of the bank (computed from
 * `content/practice/3e/thales-configuration-papillon` with `bank.js › linesWithBoth`), then on one line of another
 * French lesson's story (`bank.js › storiesOf`, `pairLines`: the lessons of « Multiples et diviseurs ») — re-checked by
 * run.test.js on every wave it draws: a wave that would show one is drawn again.
 */
const TAKEN = new Set(
  (
    '10;13 10;15 10;24 11;14 11;21 11;30 14;21 14;25 14;36 15;16 15;26 15;28 15;32 20;61 21;36 24;84 25;26 25;35 ' +
    '25;39 25;75 26;39 26;46 26;65 26;66 26;91 28;45 31;40 32;35 32;38 32;48 32;57 33;36 33;49 33;54 33;83 35;36 ' +
    '35;48 35;65 36;42 36;45 36;54 38;48 38;57 39;46 39;66 40;44 42;54 42;63 44;55 45;54 48;57 49;83 53;55 59;80 ' +
    '65;91 69;75 75;91 ' +
    '11;13 11;23 11;89 11;91 12;15 12;27 12;42 12;57 13;27 13;90 13;91 15;18 15;45 15;54 15;57 15;60 15;90 16;72 ' +
    '16;91 16;97 17;85 18;30 18;54 18;90 30;42 30;90 31;52 45;60 51;57 51;59 53;59 54;90 55;86 57;59 60;72 60;91 ' +
    '60;97 72;91 72;97 84;90 90;91 91;97 96;97 ' +
    // the two lessons added to the unit on 2026-11-26 (`fraction-irreductible`, `multiples-et-diviseurs-communs`)
    '16;20 ' +
    // the unit's lesson `triangles-semblables` (2026-11-27: its comments' dates)
    '11;27'
  ).split(' '),
);
const pairKey = (a, b) => [Number(a), Number(b)].sort((x, y) => x - y).join(';');
/** Every pair of the numbers an order shows. */
const pairsOf = (xs) => xs.flatMap((x, i) => xs.slice(i + 1).map((y) => [x, y])).filter(([x, y]) => x !== y);
/** No pair of the wave stands on a line of the bank or of another story. */
const clear = (pairs) => pairs.every(([a, b]) => !TAKEN.has(pairKey(a, b)));

const kOf = (k) => k.split('/').map(Number);
/** A gate: a whole number, or its writing (« 7,5 »). */
const gate = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? Number(t) : t;
};
/** A gate's writing is a whole number or a short decimal (« 17,5 », « 2,25 »). */
const SHORT = /^\d+(,\d{1,2})?$/;

/**
 * The right value of a wave, from its data alone — ONE definition, used to build the wave and to judge him (the tests
 * compute it again from the order's `tex`): a / b = c / d, so a × d = b × c, the box from the three others.
 */
function truthOf(w) {
  const e = w.data?.eq;
  if (!e) return null;
  const [a, b, c, d] = e;
  if (d == null) return write(over(times(b, c), a));
  if (c == null) return write(over(times(a, d), b));
  if (b == null) return write(over(times(a, d), c));
  if (a == null) return write(over(times(b, c), d));
  return null;
}
/** Is gate value n right for this wave? */
export function isRight(w, n) {
  try {
    return equal(String(n).replace('{,}', ','), truthOf(w));
  } catch {
    return false;
  }
}

/**
 * How long each kind of buoy takes a 3e student, in seconds, computing in his head while he steers (owner, 2026-11-25:
 * « estimate the time of each question and then five seconds »): reading the calculation, its one or two steps, the
 * choice of a buoy. `SPARE` is the owner's five seconds; the rail places the buoy row `seconds` of travel ahead
 * (`kit/GateRun.js › next`).
 */
export const THINK = {
  croix: 8, // one product, one division
  egalite: 10, // which two numbers cross, then the same
  somme: 11, // the sum first, then the same
  decimal: 12, // the same, the division ends on a comma
};
export const SPARE = 5;

/** « $a \\times b = c$ » — a formula (the rail draws `why` with MathText; true: `run.test.js` checks every one). */
const prod = (a, b) => `$${tx(a)} \\times ${tx(b)} = ${tx(times(a, b))}$`;
/** The two cross products of a / b = c / d with the box holding x: « a × d » and « b × c ». */
const cross = (eq, x) => {
  const [a, b, c, d] = eq.map((v) => (v == null ? x : v));
  return [prod(a, d), prod(b, c)];
};
/** The fact of a gate x: its two cross products, equal or different. */
const crossFact = (eq, x, right) => {
  const [p, q] = cross(eq, x);
  return right
    ? `Avec $${tx(x)}$ dans la case : ${p} et ${q}, les deux produits sont égaux.`
    : `Avec $${tx(x)}$ dans la case : ${p} et ${q}, les deux produits sont différents.`;
};

/**
 * A wave: the right gate, two others drawn from `pool` (never one the wave would count right, never twice the same,
 * whole beside a whole answer — a short decimal allowed only beside a decimal one —, at most 6 characters, positive),
 * each with its fact (no number of four digits in it). null (« ask again ») when the
 * pool has fewer than two.
 */
function waveOf(rand, wave, pool, fact) {
  // a whole answer has whole buoys beside it: a decimal one would be dropped at a glance
  const shape = wave.type === 'decimal' ? SHORT : /^\d+$/;
  const base = { ...wave, say: frAll(wave.say) };
  const right = truthOf(base);
  if (!right || !SHORT.test(right) || right.length > 6) return null;
  const seen = new Set([right]);
  const wrong = [];
  for (const g of shuffle(rand, pool)) {
    if (g == null) continue;
    let k;
    try {
      if (compare(g, '0') <= 0) continue;
      k = write(g);
    } catch {
      continue;
    }
    if (seen.has(k) || isRight(base, k) || !shape.test(k) || k.length > 6) continue;
    seen.add(k);
    wrong.push(k);
  }
  if (wrong.length < 2) return null;
  const others = wrong.slice(0, 2);
  const facts = [right, ...others].map((g, i) => frAll(fact(g, i === 0)));
  // a fact stays mental too: no number of four digits in it
  if (facts.some((f) => /\d{4}|\d\\,\d/.test(f))) return null;
  const gates = shuffle(rand, [gate(right), ...others.map(gate)]);
  return {
    ...base,
    seconds: THINK[base.type] + SPARE,
    // the ladder never draws the same numbers twice in a row: its `a` / `b` are the order's formula
    a: base.tex,
    b: base.say,
    gates,
    good: gates.indexOf(gate(right)),
    why: { right: facts[0], wrong: Object.fromEntries(others.map((g, i) => [gate(g), facts[i + 1]])) },
  };
}

/** Two different multipliers of the level's set. */
const twoM = (rand, big) => {
  const set = big ? M.big : M.small;
  const a = pick(rand, set);
  const b = pick(
    rand,
    set.filter((x) => x !== a),
  );
  return [a, b];
};
/** The four numbers a / b = c / d at a k of `REDUCE`: a = p × m, b = q × m, c = p × n, d = q × n. */
function fourOf(rand, big, ks = REDUCE) {
  const [p, q] = kOf(pick(rand, ks));
  const [m, n] = twoM(rand, big);
  return [p * m, q * m, p * n, q * n];
}
/** « \\dfrac{a}{b} = \\dfrac{c}{d} », the box written `\\square`; `show` writes a number its own way (a sum). */
const fracs = (eq, show = (v) => tx(v)) => {
  const t = eq.map((v, i) => (v == null ? '\\square' : show(v, i)));
  return `\\dfrac{${t[0]}}{${t[1]}} = \\dfrac{${t[2]}}{${t[3]}}`;
};
/** The numbers of the order, shown, and a check that none is too big for the head. */
const mental = (xs) => xs.every((x) => x > 0 && x <= MAX);
/**
 * The mistakes a real student makes on a / b = c / d with one box (`hole`): adding the gap instead of multiplying (the
 * box's fraction-mate plus the other fraction's difference), forgetting the division, the wrong diagonal.
 */
function slips(full, hole) {
  const v = (i) => String(full[i]);
  const mate = hole ^ 1;
  const added = minus(plus(v(mate), v(hole ^ 2)), v(mate ^ 2));
  const opposite = v(3 - hole);
  const [p, q] = [v(hole ^ 1), v(hole ^ 2)];
  return [added, times(p, q), over(times(p, opposite), q), over(times(q, opposite), p)].map(write);
}

// ───────────────────────────── the kinds of buoy ─────────────────────────────
export const GENERATORS = {
  /** K1 — complete an equality of two fractions, the box in any of the four places: « 4/12 = 5/□ ». */
  egalite(rand, { big = false } = {}) {
    const full = fourOf(rand, big);
    const hole = pick(rand, [0, 1, 2, 3]);
    const eq = full.map((v, i) => (i === hole ? null : v));
    const shown = eq.filter((v) => v != null);
    const pairs = pairsOf(shown);
    if (!mental(full) || !clear(pairs)) return null;
    const base = {
      type: 'egalite',
      key: K.papillon,
      say: 'Complète',
      tex: fracs(eq),
      data: { eq: eq.map((v) => (v == null ? null : String(v))) },
      pairs,
    };
    return waveOf(rand, base, slips(full, hole), (x, right) => crossFact(base.data.eq, x, right));
  },

  /** K1 — the cross product itself: « 12 × 5 ÷ 4 » (a / b = c / d, d = b × c ÷ a). */
  croix(rand, { big = false } = {}) {
    const [a, b, c] = fourOf(rand, big);
    const [x, y] = pick(rand, [
      [b, c],
      [c, b],
    ]);
    const pairs = pairsOf([a, b, c]);
    if (!mental([a, b, c]) || b * c > 999 || !clear(pairs)) return null;
    const base = {
      type: 'croix',
      key: K.papillon,
      say: 'Calcule',
      tex: `${tx(x)} \\times ${tx(y)} \\div ${tx(a)}`,
      data: { eq: [String(a), String(b), String(c), null] },
      pairs,
    };
    const fact = (g, right) =>
      right
        ? `${prod(x, y)}, et ${prod(g, a)} : le quotient de $${tx(b * c)}$ par $${tx(a)}$ est $${tx(g)}$.`
        : `${prod(x, y)}, et ${prod(g, a)}, pas $${tx(b * c)}$.`;
    return waveOf(rand, base, [String(b * c), String(b + c - a), write(over(a * c, b)), write(over(a * b, c))], fact);
  },

  /**
   * K2 — a length from the vertex written as the sum of its two pieces: « 4 / (4 + 8) = 5 / □ » (the sum first). The
   * box is in the other fraction, above or below; the fraction of the sum on the left or on the right.
   */
  somme(rand, { big = false } = {}) {
    const [a, b, c, d] = fourOf(rand, big);
    const piece = b - a;
    if (piece === a) return null;
    const hole = pick(rand, [2, 3]);
    const left = pick(rand, [true, false]);
    // the four numbers in the order written, the sum's fraction first or second
    const full = left ? [a, b, c, d] : [c, d, a, b];
    const at = left ? hole : hole - 2;
    const sumAt = left ? 1 : 3;
    const eq = full.map((v, i) => (i === at ? null : v));
    const shown = [a, piece, ...[c, d].filter((_, i) => i + 2 !== hole)];
    const pairs = pairsOf(shown);
    if (!mental(full) || !clear(pairs)) return null;
    const base = {
      type: 'somme',
      key: K.calcul,
      say: 'Complète',
      tex: fracs(eq, (v, i) => (i === sumAt ? `${tx(a)} + ${tx(piece)}` : tx(v))),
      data: { eq: eq.map((v) => (v == null ? null : String(v))) },
      pairs,
    };
    const sum = `$${tx(a)} + ${tx(piece)} = ${tx(b)}$`;
    const fact = (x, right) => `${sum}. ${crossFact(base.data.eq, x, right)}`;
    // the piece alone (the sum forgotten), the piece added, the division forgotten
    const alone = [...full];
    alone[sumAt] = piece;
    return waveOf(
      rand,
      base,
      [truthOf({ data: { eq: alone.map((v, i) => (i === at ? null : String(v))) } }), ...slips(full, at)],
      fact,
    );
  },

  /** K2 — an equality whose box is a short decimal: « 4/6 = 5/□ » gives 7,5. */
  decimal(rand, { big = false } = {}) {
    const [p, q] = kOf(pick(rand, ['5/6', '2/7', '4/7', '2/9', '4/9', '5/9']));
    const m = pick(rand, big ? [2, 3] : [1, 2]);
    const [a, b] = [p * m, q * m];
    const c = pick(
      rand,
      Array.from({ length: big ? 14 : 9 }, (_, i) => i + 3).filter((x) => x !== a && x !== b),
    );
    const d = write(over(b * c, a));
    if (/^\d+$/.test(d)) return null;
    const eq = [String(a), String(b), String(c), null];
    const pairs = pairsOf([a, b, c]);
    if (!mental([a, b, c]) || !clear(pairs)) return null;
    const base = {
      type: 'decimal',
      key: K.calcul,
      say: 'Complète',
      tex: fracs(eq),
      data: { eq },
      pairs,
    };
    const pool = slips([a, b, c, d], 3);
    return waveOf(rand, base, pool, (x, right) => crossFact(eq, x, right));
  },
};

// ───────────────────────────── the legs ─────────────────────────────

/** What each leg asks, by the dock it leaves (its place in the world): the first level of the node of the key just sealed. */
export const LEG_MIX = {
  2: [
    ['egalite', {}],
    ['croix', {}],
  ],
  3: [
    ['somme', {}],
    ['decimal', {}],
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
/** A gate as the rail draws it: « 4/7 » over a real bar, anything else as text. */
export const gateOption = (g) => {
  const m = /^(\d+)\/(\d+)$/.exec(String(g));
  return m ? { tex: `\\dfrac{${m[1]}}{${m[2]}}` } : { t: String(g) };
};
/** A wave as the rail plays it: { ask, tex, options × 3, right, why × 3, seconds } — no figure (owner, 2026-11-27). */
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
const LEG_NAMES = { 2: 'De la largeur du Nil au pyramidion', 3: 'Du pyramidion à la grande pyramide' };

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
    text: { ...TEXT, title: `${TEXT.title}\u00a0: ${LEG_NAMES[i]}` },
  };
}
/** The two legs, keyed by the dock they leave (`story.legs`). */
export const LEGS = { 2: legOf(2), 3: legOf(3) };
