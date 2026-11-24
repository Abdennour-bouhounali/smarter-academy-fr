/**
 * THE FELUCCA'S LEGS of lesson `thales-configuration-papillon` — the content of the kit's rail (`kit/GateRun.js`) between
 * two docks of « Les pyramides », in the river's skin with its crocodiles (`nilePyramids/riverMeshes.js`). PURE.
 *
 * The world reads `story.legs[i]` by the dock's PLACE in the world (0–4, `nilePyramids/Game.js › board`): this story
 * sails docks 2 → 3 → 4 (« La largeur du Nil », « Le pyramidion », « L’ombre de la grande pyramide »), so it has two
 * legs, keyed 2 and 3 (design § 1, « run.js »; DZ's two nested legs are not used):
 *   leg 2 (river → summit), after K1 — the DZ butterfly leg, ported: the ratio of one line given, the partner on the
 *         other line; three lengths from the vertex, the fourth;
 *   leg 3 (summit → plateau), after K2 — NEW, across the vertex: the length across given (the one from the vertex is
 *         cut first), or the length across asked (the two from the vertex are joined).
 * Four right buoys reach the next dock (`total: 4`). Every buoy is NUMERIC (the rail draws no figure: the order names the
 * segments, « (AB) ∥ (EF) »), MENTAL numbers: k = p/q with q ≤ 9, a length p × m or q × m with m ≤ 9.
 * The SAME generators are the practice ladder's (`practice.js`): a leg is the first level of the node of the key just
 * sealed.
 *
 * A wave is DATA (the kit's ladder): { type, key, say, tex, gates: [3], good, why: { right, wrong: { [gate]: fact } },
 * data, pairs } — `say` PLAIN, `tex` the formula after it, a gate a whole number, `why` ONE fact per gate (never
 * « faux »: the two products the buoy gives), `data` the numbers asked, `pairs` every pair of numbers the order shows.
 * `run.test.js` refuses every k the bank writes, every pair standing on one line of the bank or of another lesson's
 * story, and any wave whose wrong buoy equals the right one.
 */
import { pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { WORLD_TEXT } from '../../../../../../common/gameworld/nilePyramids/strings';
import { compare, equal, frAll, isInteger, K, over, times, tx, write } from './math';

/** k < 1, q ≤ 9 — none written by the bank (run.test.js reads it: 2/3, 3/4, 2/5, 3/5, 4/5, 5/7, 5/8 are). */
export const REDUCE = ['5/6', '2/7', '3/7', '4/7', '6/7', '3/8', '7/8', '2/9', '4/9', '5/9', '7/9', '8/9'];
/** The multipliers m of a length q × m. */
const M = [2, 3, 4, 5, 6, 7, 8, 9];
/**
 * The pairs of numbers of ten and more that stand on one line of the bank (computed from
 * `content/practice/3e/thales-configuration-papillon` with `bank.js › linesWithBoth`), then on one line of another
 * French lesson's story (`bank.js › storiesOf`, `pairLines`: the two lessons of « Multiples et diviseurs ») — re-checked by
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
    '60;97 72;91 72;97 84;90 90;91 91;97 96;97'
  ).split(' '),
);
const pairKey = (a, b) => [Number(a), Number(b)].sort((x, y) => x - y).join(';');
/** Every pair of the numbers an order shows. */
const pairsOf = (xs) => xs.flatMap((x, i) => xs.slice(i + 1).map((y) => [x, y])).filter(([x, y]) => x !== y);
/** No pair of the wave stands on a line of the bank or of another story. */
const clear = (pairs) => pairs.every(([a, b]) => !TAKEN.has(pairKey(a, b)));

const kOf = (k) => k.split('/').map(Number);
/** A gate: a whole number, or its writing (« 13,5 »). */
const gate = (x) => {
  const t = write(x);
  return /^\d+$/.test(t) ? Number(t) : t;
};
/** « $a \\times b = c$ » — a formula (the rail draws `why` with MathText; true: `run.test.js` checks every one). */
const prod = (a, b) => `$${tx(a)} \\times ${tx(b)} = ${tx(times(a, b))}$`;
/** A length of the figure as a formula: « $OB = 12$ ». */
const is = (seg, x) => `$${seg} = ${tx(x)}$`;
/** The two products « a × d » and « b × c » of a / b = c / d, as two facts. */
const cross = (a, b, c, d) => `${prod(a, d)} et ${prod(b, c)}`;
/** The value of an exact quotient as text, or null when it is not a whole number (a buoy of mental numbers). */
const whole = (x) => (isInteger(x) ? write(x) : null);
/** The two products differ: the sentence of a buoy that is not the one. */
const differ = (seg, x, products) => `Avec ${is(seg, x)} : ${products}, les deux produits sont différents.`;
/** The two products agree: the sentence of the right buoy. */
const agree = (seg, x, products) => `${is(seg, x)} : ${products}, les deux produits sont égaux.`;

/**
 * The right value of a wave, from its data alone — ONE definition, used to build the wave, to judge him and by the
 * tests (which compute it again by the proportion itself).
 */
export function truthOf(w) {
  const d = w.data;
  switch (w.type) {
    case 'rapport':
      return write(times(d.side, d.k));
    case 'longueur':
    case 'emboite':
      return write(over(times(d.big, d.other), d.small));
    case 'travers':
      return write(over(times(d.OB, d.OE), d.OA));
    case 'traversInconnu':
      return write(times(d.OB, over(String(Number(d.OA) + Number(d.OE)), d.OA)));
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
 * A wave: the right gate, two others drawn from `pool` (never one the wave would count right, never twice the same, at
 * most 6 characters, positive), each with its fact. null (« ask again ») when the pool has fewer than two.
 */
function waveOf(rand, wave, pool, sentence, rightSentence) {
  // French typography on every sentence of the buoy (a no-break space before « : »…)
  const base = { ...wave, say: frAll(wave.say) };
  const fact = (g) => frAll(sentence(g));
  const rightFact = frAll(rightSentence);
  const right = truthOf(base);
  if (!right || right.length > 6) return null;
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
    if (seen.has(k) || isRight(base, k) || k.length > 6) continue;
    seen.add(k);
    wrong.push(k);
  }
  if (wrong.length < 2) return null;
  const others = wrong.slice(0, 2);
  const gates = shuffle(rand, [gate(right), ...others.map(gate)]);
  return {
    ...base,
    // the ladder never draws the same numbers twice in a row: its `a` / `b` are the order's formula
    a: base.tex,
    b: base.say,
    gates,
    good: gates.indexOf(gate(right)),
    why: { right: rightFact, wrong: Object.fromEntries(others.map((g) => [gate(g), fact(g)])) },
  };
}
/** Two different multipliers. */
const twoM = (rand) => {
  const a = pick(rand, M);
  const b = pick(
    rand,
    M.filter((x) => x !== a),
  );
  return [a, b];
};

// ───────────────────────────── the kinds of buoy ─────────────────────────────
export const GENERATORS = {
  /** K1 — the ratio of one line given: OA / OE = p / q and OF = q × m — OB, its partner on the other line. */
  rapport(rand) {
    const k = pick(rand, REDUCE);
    const [p, q] = kOf(k);
    const m = pick(rand, M);
    const OF = q * m;
    const base = {
      type: 'rapport',
      key: K.papillon,
      say: '(AB) ∥ (EF) : calcule OB',
      tex: `\\dfrac{OA}{OE} = \\dfrac{${p}}{${q}} \\quad OF = ${OF}`,
      data: { k, side: String(OF) },
      pairs: [],
    };
    const right = truthOf(base);
    // OA / OE = OB / OF ⟺ OB × q = OF × p
    const fact = (x) => differ('OB', x, cross(x, OF, p, q));
    const rightFact = agree('OB', right, cross(right, OF, p, q));
    return waveOf(rand, base, [String(OF - (q - p)), whole(over(OF * q, p)), String(OF * p)], fact, rightFact);
  },

  /** K1 — three lengths from the vertex O: OA, OE and OB — OF. */
  longueur(rand) {
    const [p, q] = kOf(pick(rand, REDUCE));
    const [m, n] = twoM(rand);
    const [OA, OE, OB] = [p * m, q * m, p * n];
    const pairs = pairsOf([OA, OE, OB]);
    if (!clear(pairs)) return null;
    const base = {
      type: 'longueur',
      key: K.papillon,
      say: '(AB) ∥ (EF) : calcule OF',
      tex: `OA = ${OA} \\quad OE = ${OE} \\quad OB = ${OB}`,
      data: { small: String(OA), big: String(OE), other: String(OB) },
      pairs,
    };
    const right = truthOf(base);
    // OA / OE = OB / OF ⟺ OA × OF = OE × OB
    const fact = (x) =>
      equal(x, OA + OE)
        ? `$${OA} + ${OE} = ${OA + OE}$ : c’est la longueur $AE$, d’un bout à l’autre de la figure, pas un côté d’un des deux triangles.`
        : differ('OF', x, cross(OA, OE, OB, x));
    const rightFact = agree('OF', right, cross(OA, OE, OB, right));
    return waveOf(rand, base, [whole(over(OB * OA, OE)), String(OA + OE), String(OB + (OE - OA))], fact, rightFact);
  },

  /** K2 — the length ACROSS the vertex given: OA, AE and OB — OF (OE = AE − OA first). */
  travers(rand) {
    const [p, q] = kOf(pick(rand, REDUCE));
    const [m, n] = twoM(rand);
    const [OA, OE, OB] = [p * m, q * m, p * n];
    const AE = OA + OE;
    const pairs = pairsOf([OA, AE, OB, OE]);
    if (!clear(pairs)) return null;
    const base = {
      type: 'travers',
      key: K.calcul,
      say: '(AB) ∥ (EF), O est sur [AE] : calcule OF',
      tex: `OA = ${OA} \\quad AE = ${AE} \\quad OB = ${OB}`,
      data: { OA: String(OA), OE: String(OE), OB: String(OB) },
      pairs,
    };
    const right = truthOf(base);
    const cut = `$OE = ${AE} - ${OA} = ${OE}$`;
    const fact = (x) =>
      equal(x, over(AE * OB, OA))
        ? `$AE = ${AE}$ va de $A$ à $E$ en passant par $O$. Depuis $O$ : ${cut}, et ${cross(OA, OE, OB, x)}, les deux produits sont différents.`
        : `${cut}. Avec ${is('OF', x)} : ${cross(OA, OE, OB, x)}, les deux produits sont différents.`;
    const rightFact = `${cut}, et ${cross(OA, OE, OB, right)} : les deux produits sont égaux.`;
    return waveOf(rand, base, [whole(over(AE * OB, OA)), whole(over(OB * OA, OE)), String(AE - OB)], fact, rightFact);
  },

  /** K2 — the length ACROSS the vertex asked: OA, OE and OB — BF (OF from the vertex, then OB + OF). */
  traversInconnu(rand) {
    const [p, q] = kOf(pick(rand, REDUCE));
    const [m, n] = twoM(rand);
    const [OA, OE, OB] = [p * m, q * m, p * n];
    const OF = q * n;
    const pairs = pairsOf([OA, OE, OB]);
    if (!clear(pairs)) return null;
    const base = {
      type: 'traversInconnu',
      key: K.calcul,
      say: '(AB) ∥ (EF), O est sur [BF] : calcule BF',
      tex: `OA = ${OA} \\quad OE = ${OE} \\quad OB = ${OB}`,
      data: { OA: String(OA), OE: String(OE), OB: String(OB) },
      pairs,
    };
    const from = `${prod(OA, OF)} et ${prod(OE, OB)}, donc ${is('OF', OF)}`;
    const sum = `$BF = ${OB} + ${OF} = ${OB + OF}$`;
    const fact = (x) =>
      equal(x, OF)
        ? `${is('OF', OF)} va de $O$ à $F$. $BF$ va de $B$ à $F$ en passant par $O$ : ${sum}.`
        : `${from}, et ${sum}, pas $${tx(x)}$.`;
    const rightFact = `${from}, et ${sum}.`;
    return waveOf(rand, base, [String(OF), String((q - p) * n), String(OE + OB)], fact, rightFact);
  },

  /** K2 — the nested figure, a side from the vertex in two pieces: AM, MB and AN — AC (AB = AM + MB first). */
  emboite(rand) {
    const [p, q] = kOf(pick(rand, REDUCE));
    const [m, n] = twoM(rand);
    const [AM, MB, AN] = [p * m, (q - p) * m, p * n];
    const AB = AM + MB;
    const pairs = pairsOf([AM, MB, AN]);
    if (AM === MB || !clear(pairs)) return null;
    const base = {
      type: 'emboite',
      key: K.calcul,
      say: 'M sur [AB], N sur [AC], (MN) ∥ (BC) : calcule AC',
      tex: `AM = ${AM} \\quad MB = ${MB} \\quad AN = ${AN}`,
      data: { small: String(AM), big: String(AB), other: String(AN) },
      pairs,
    };
    const right = truthOf(base);
    const join = `$AB = ${AM} + ${MB} = ${AB}$`;
    const piece = (q - p) * n; // AN × MB / AM: NC, a piece
    const fact = (x) =>
      equal(x, piece)
        ? `${is('NC', piece)} : un morceau de $[AC]$, pas tout le côté. ${join}, et ${cross(AM, AB, AN, right)}.`
        : `${join}. Avec ${is('AC', x)} : ${cross(AM, AB, AN, x)}, les deux produits sont différents.`;
    const rightFact = `${join}, et ${cross(AM, AB, AN, right)} : les deux produits sont égaux.`;
    return waveOf(rand, base, [String(piece), String(AN + MB), String(AN + AB)], fact, rightFact);
  },
};

// ───────────────────────────── the legs ─────────────────────────────

/** What each leg asks, by the dock it leaves (its place in the world): the first level of the node of the key just sealed. */
export const LEG_MIX = {
  2: [
    ['rapport', {}],
    ['longueur', {}],
  ],
  3: [
    ['travers', {}],
    ['traversInconnu', {}],
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
/** A wave as the rail plays it: { ask, tex, options × 3, right, why × 3 }. */
export const roundOf = (w) => ({
  ask: w.say,
  tex: w.tex ?? null,
  options: w.gates.map(gateOption),
  right: w.good,
  why: w.gates.map((g, i) => (i === w.good ? w.why.right : (w.why.wrong?.[g] ?? w.why.right))),
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
export const LEG_NAMES = { 2: 'De la largeur du Nil au pyramidion', 3: 'Du pyramidion à la grande pyramide' };

/** The leg from dock i (its place in the world): the content `story.legs[i]` hands the world. */
export function legOf(i) {
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
