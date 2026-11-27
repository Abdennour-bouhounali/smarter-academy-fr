/**
 * THE FELUCCA'S LEGS of lesson `triangles-semblables` — the content of the kit's rail (`kit/GateRun.js`) between two docks
 * of « Les pyramides », in the river's skin with its crocodiles (`nilePyramids/riverMeshes.js`). PURE.
 *
 * The world reads `story.legs[i]` by the dock's PLACE in the world (0–4, `nilePyramids/Game.js › board`): this story
 * sails docks 1 → 3 → 4 (« Le chantier des bâtisseurs », « Le pyramidion », « Le palmier du plateau »), so it has two
 * legs, keyed 1 and 3:
 *   leg 1 (workshop → summit), after K1 — the sides: the coefficient k from two homologous sides (said by their RANK, never
 *         read from the letters), a side of the second triangle from the first one's three sides and its own shortest
 *         side (ported from DZ's `talis-hisab-atwal` « k » leg, rebuilt on TWO SEPARATE triangles: no shared vertex, no
 *         nested figure);
 *   leg 3 (summit → plateau), after K2 — the angles: the third angle of a triangle, a side of the second triangle
 *         from two equal angles (the homologous sides read from the letters).
 * Four right buoys reach the next dock (`total: 4`). Every buoy is NUMERIC, MENTAL numbers: a side under ten, k = p / q
 * with q ≤ 9, a whole answer. Every buoy names points and carries its FIGURE (owner, 2026-11-25): the two triangles
 * APART (`figures.js`), the lengths it gives written, « ? » on the one asked. The SAME generators are the practice
 * ladder's (`practice.js`): a leg is the first level of the node of the key just sealed.
 *
 * A wave is DATA (the kit's ladder): { type, key, say, tex, gates: [3], good, why: { right, wrong: { [gate]: fact } },
 * data, pairs } — `say` PLAIN, `tex` the formula after it, a gate a whole number or a fraction, `why` ONE fact per
 * gate (never « faux »: the two products the buoy gives), `data` the numbers asked, `pairs` every pair of numbers of
 * ten and more the order shows. `run.test.js` checks every wave.
 */
import { pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { runFigure } from '../../../../../../common/gameworld/kit/trainerFigure';
import { WORLD_TEXT } from '../../../../../../common/gameworld/nilePyramids/strings';
import { fromAngles, fromSides, flipped, sceneOf, turned } from './figures';
import { FIGURES, K, compare, equal, frAll, isInteger, over, read, times, tx, write } from './math';

/** The base triangles of the sides' buoys (ascending sides under ten, a real triangle each). */
const BASES = [
  ['3', '4', '6'],
  ['3', '5', '7'],
  ['4', '5', '7'],
  ['4', '6', '7'],
  ['4', '6', '8'],
  ['2', '3', '4'],
  ['5', '6', '8'],
  ['4', '7', '8'],
  ['3', '6', '7'],
];
const SMALL = ['2', '3', '4', '5', '6', '7', '8', '9'];

/** A gate: a whole number, or its writing (« 13,5 », « 3/2 »). */
const gate = (x) => {
  const t = /^\d+\/\d+$/.test(String(x)) ? String(x) : write(x);
  return /^\d+$/.test(t) ? Number(t) : t;
};
/** « $a \\times b = c$ » — a formula (the rail draws `why` with MathText; true: `run.test.js` checks every one). */
const prod = (a, b) => `$${tx(a)} \\times ${tx(b)} = ${tx(times(a, b))}$`;
/** The value of an exact quotient as text, or null when it is not a whole number (a buoy of mental numbers). */
const whole = (x) => (isInteger(x) ? write(x) : null);
/** An exact quotient as a fraction « 3/2 » (or a whole number): a coefficient is written over a bar, never as « 1,5 ». */
const asFrac = (x) => {
  const { n, d } = read(write(x));
  return d === 1n ? String(n) : `${n}/${d}`;
};
/** p and q of a gate « p/q » (a whole gate is p/1). */
const frac = (g) => {
  const [p, q = '1'] = String(g).split('/');
  return [p, q];
};
/** The two products differ: the sentence of a buoy that is not the one. */
const differ = (seg, x, products) => `Avec $${seg} = ${tx(x)}$ : ${products}, les deux produits sont différents.`;
/** The two products agree: the sentence of the right buoy. */
const agree = (seg, x, products) => `$${seg} = ${tx(x)}$ : ${products}, les deux produits sont égaux.`;

/**
 * The right value of a wave, from its data alone — ONE definition, used to build the wave, to judge him and by the
 * tests (which compute it again by the proportion itself).
 */
function truthOf(w) {
  const d = w.data;
  switch (w.type) {
    case 'rapport':
      return asFrac(over(d.to, d.from));
    case 'longueur':
    case 'cote':
      return write(over(times(d.side, d.to), d.from));
    case 'troisieme':
      return write(String(180 - Number(d.a) - Number(d.b)));
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
 * How long each kind of buoy takes a 3e student, in seconds, computing in his head while he steers: reading the order,
 * the steps of the computation, the choice of a buoy. `SPARE` is the owner's five seconds (2026-11-25); the rail places
 * the buoy row `seconds` of travel ahead (`kit/GateRun.js › next`).
 */
export const THINK = {
  rapport: 10, // a quotient of two small numbers
  longueur: 20, // the quotient, then the side times it
  troisieme: 12, // 180 minus two angles
  cote: 22, // the pairing read from the letters, the quotient, the side times it
};
export const SPARE = 5;

/**
 * The figure of a buoy: the two triangles apart in the rail's portrait room (`runFigure`, 290 × 344 px at the 12 px
 * floor). Tried stacked then side by side, the second turned by 30° steps, until one fits.
 */
function fitted(build) {
  let best = null;
  for (const layout of ['stack', 'side'])
    for (let deg = 0; deg < 360; deg += 30) {
      const spec = build(layout, deg);
      const t = runFigure(spec);
      if (t?.fits) return spec;
      if (!best || (t && t.label > best.label)) best = { spec, label: t?.label ?? 0 };
    }
  return best.spec;
}

/**
 * A wave: the right gate, two others drawn from `pool` (never one the wave would count right, never twice the same, at
 * most 6 characters, positive), each with its fact. null (« ask again ») when the pool has fewer than two.
 */
function waveOf(rand, { drawing, ...wave }, pool, sentence, rightSentence) {
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
    wrong.push(String(g));
  }
  if (wrong.length < 2) return null;
  const others = wrong.slice(0, 2);
  const gates = shuffle(rand, [gate(right), ...others.map(gate)]);
  return {
    ...base,
    seconds: THINK[base.type] + SPARE,
    ...(drawing ? { figure: drawing() } : {}),
    // the ladder never draws the same numbers twice in a row: its `a` / `b` are the order's formula
    a: base.tex,
    b: base.say,
    gates,
    good: gates.indexOf(gate(right)),
    why: { right: rightFact, wrong: Object.fromEntries(others.map((g) => [gate(g), fact(g)])) },
  };
}

/** The pairs of numbers of ten and more an order shows (none for the sides' buoys: every number is under ten). */
const pairsOf = (xs) =>
  xs
    .map(Number)
    .filter((x) => x >= 10)
    .flatMap((x, i, all) => all.slice(i + 1).map((y) => [x, y]))
    .filter(([x, y]) => x !== y);

/** The drawn triangle of a sides' buoy: its sides [PQ, QR, RP] → P, Q, R, with the lengths written on some. */
const sideTriangle = (names, [pq, qr, rp], labels) => ({ ...fromSides([pq, qr, rp], names), labels });

// ───────────────────────────── the kinds of buoy ─────────────────────────────
export const GENERATORS = {
  /**
   * K1 — the two shortest sides of two triangles of the same shape, AB and DE: the coefficient k. The order SAYS they are
   * the shortest (their rank pairs them, never their letters: the slip of the tile « dans l'ordre des noms »).
   */
  rapport(rand) {
    const from = pick(rand, SMALL);
    const to = pick(
      rand,
      SMALL.filter((x) => x !== from),
    );
    const t = pick(rand, BASES);
    const k = over(to, from);
    const base = {
      type: 'rapport',
      key: K.cotes,
      say: 'Même forme. Leurs plus petits côtés sont AB et DE',
      tex: `AB = ${from} \\quad DE = ${to} \\quad k = \\ ?`,
      data: { from, to },
      pairs: [],
      // ABC: the base triangle with AB = from; DEF: the same shape at k, so DE = to; only AB and DE are written
      drawing: () => {
        const f1 = evalOf(over(from, t[0]));
        const [x1, x2, x3] = t.map((x) => Number(x) * f1);
        const kk = evalOf(k);
        return fitted((layout, deg) =>
          sceneOf({
            one: sideTriangle(['A', 'B', 'C'], [x1, x3, x2], { AB: from }),
            two: turned(sideTriangle(['D', 'E', 'F'], [x1 * kk, x3 * kk, x2 * kk], { DE: to }), deg),
            layout,
            aria: 'Deux triangles séparés, ABC et DEF, de même forme',
          }),
        );
      },
    };
    const right = truthOf(base);
    // DE / AB = p / q ⟺ DE × q = AB × p
    const cross = (g) => {
      const [p, q] = frac(g);
      return `${prod(to, q)} et ${prod(from, p)}`;
    };
    const fact = (g) => differ('k', g, cross(g));
    const rightFact = agree('k', right, cross(right));
    return waveOf(
      rand,
      base,
      [
        asFrac(over(from, to)),
        String(Number(to) - Number(from)),
        asFrac(over(String(Number(to) - Number(from)), from)),
      ],
      fact,
      rightFact,
    );
  },

  /**
   * K1 — the three sides of ABC, the shortest side of DEF, SAID to be its shortest: its longest side. The pairing is by
   * rank (ABC's sides ranked from their lengths), never by the letters.
   */
  longueur(rand) {
    const pickable = BASES.flatMap((t) =>
      SMALL.filter(
        (x) =>
          x !== t[0] &&
          (Number(t[2]) * Number(x)) % Number(t[0]) === 0 &&
          (Number(t[2]) * Number(x)) / Number(t[0]) <= 36,
      ).map((x) => [t, x]),
    );
    const [t, to] = pick(rand, pickable);
    const [s1, s2, s3] = t;
    const k = over(to, s1);
    const base = {
      type: 'longueur',
      key: K.cotes,
      say: 'Même forme, DE plus petit côté de DEF : EF ?',
      tex: `AB = ${s1} \\quad CA = ${s2} \\quad BC = ${s3} \\quad DE = ${to}`,
      data: { from: s1, side: s3, to },
      pairs: pairsOf([s1, s2, s3, to]),
      drawing: () =>
        fitted((layout, deg) =>
          sceneOf({
            one: sideTriangle(['A', 'B', 'C'], [s1, s3, s2], { AB: s1, CA: s2, BC: s3 }),
            two: turned(
              sideTriangle(['D', 'E', 'F'], [evalOf(times(s1, k)), evalOf(times(s3, k)), evalOf(times(s2, k))], {
                DE: to,
              }),
              deg,
            ),
            layout,
            ask: ['EF'],
            aria: 'Deux triangles séparés : ABC et DEF, de même forme, le plus grand côté de DEF cherché',
          }),
        ),
    };
    const right = truthOf(base);
    // DE / AB = EF / BC ⟺ DE × BC = AB × EF
    const cross = (x) => `${prod(to, s3)} et ${prod(s1, x)}`;
    const fact = (x) => differ('EF', x, cross(x));
    const rightFact = agree('EF', right, cross(right));
    return waveOf(
      rand,
      base,
      [
        String(Number(s3) + (Number(to) - Number(s1))),
        whole(over(times(s3, s1), to)),
        whole(over(times(s2, to), s1)),
        String(Number(s3) + Number(to)),
      ],
      fact,
      rightFact,
    );
  },

  /** K2 — two angles of a triangle: the third. */
  troisieme(rand) {
    const [a, b, c] = pick(rand, FIGURES.angles.similar);
    // two of the three, in a random order; the third asked
    const [x, y, z] = shuffle(rand, [a, b, c]);
    const base = {
      type: 'troisieme',
      key: K.angles,
      say: `Angles de ABC : ${a}°, ${b}°, ${c}° ; de DEF : ${x}°, ${y}° et ?`,
      tex: `${x}^\\circ + ${y}^\\circ + \\ ? = 180^\\circ`,
      data: { a: x, b: y },
      pairs: pairsOf([a, b, c]),
      drawing: () => {
        const sin = (d) => Math.sin((d * Math.PI) / 180);
        return fitted((layout, deg) =>
          sceneOf({
            one: {
              ...fromAngles([Number(a), Number(b)], '5', ['A', 'B', 'C']),
              angles: { A: '', B: '', C: '' },
            },
            two: turned(
              {
                ...fromAngles(
                  [Number(x), Number(y)],
                  String((5 * 1.3 * sin(Number(c))) / sin(180 - Number(x) - Number(y))),
                  ['D', 'E', 'F'],
                ),
                angles: { D: '', E: '', F: { tone: 'rose' } },
              },
              deg,
            ),
            layout,
            aria: 'Deux triangles séparés : les trois angles de ABC écrits, deux angles de DEF écrits et le troisième cherché',
          }),
        );
      },
    };
    const right = truthOf(base);
    const sum = Number(x) + Number(y);
    const rightFact = `$${x} + ${y} = ${sum}$ et $180 - ${sum} = ${right}$ : le troisième angle mesure $${right}^\\circ$.`;
    const fact = (g) =>
      `Avec $${g}^\\circ$ : $${x} + ${y} + ${g} = ${sum + Number(g)}$, et la somme des trois angles ne fait pas $180$.`;
    return waveOf(
      rand,
      base,
      [
        String(sum),
        String(Math.abs(Number(y) - Number(x))),
        String(180 - Number(x)),
        String(180 - Number(y)),
        String(Number(z) + 10),
      ],
      fact,
      rightFact,
    );
  },

  /** K2 — A = E and B = D: AB, DE and AC given, the side EF — the pairing is read from the letters. */
  cote(rand) {
    const pickable = BASES.flatMap((t) =>
      SMALL.filter(
        (x) =>
          x !== t[0] &&
          (Number(t[2]) * Number(x)) % Number(t[0]) === 0 &&
          (Number(t[2]) * Number(x)) / Number(t[0]) <= 36,
      ).map((x) => [t, x]),
    );
    const [t, to] = pick(rand, pickable);
    const [s1, s2, s3] = t;
    // ABC: AB = s1, AC = s3 (the longest), BC = s2; DEF: DE = to, EF = s3 × k, FD = s2 × k (A↔E, B↔D, C↔F)
    const k = over(to, s1);
    const base = {
      type: 'cote',
      key: K.angles,
      say: 'Deux angles égaux : calcule EF',
      tex: `\\widehat{A} = \\widehat{E} \\quad \\widehat{B} = \\widehat{D} \\quad AB = ${s1} \\quad DE = ${to} \\quad AC = ${s3}`,
      data: { from: s1, side: s3, to },
      pairs: pairsOf([s1, s3, to]),
      drawing: () =>
        fitted((layout, deg) =>
          sceneOf({
            one: { ...sideTriangle(['A', 'B', 'C'], [s1, s2, s3], { AB: s1, AC: s3 }), angles: { A: '', B: '' } },
            two: turned(
              {
                ...flipped(
                  sideTriangle(['E', 'D', 'F'], [evalOf(times(s1, k)), evalOf(times(s2, k)), evalOf(times(s3, k))], {
                    ED: to,
                  }),
                ),
                angles: { E: '', D: '' },
              },
              deg,
            ),
            layout,
            ask: ['EF'],
            aria: 'Deux triangles séparés : ABC et DEF, deux angles marqués égaux, le côté EF cherché',
          }),
        ),
    };
    const right = truthOf(base);
    // AB ↔ ED and AC ↔ EF: DE / AB = EF / AC ⟺ DE × AC = AB × EF
    const cross = (x) => `${prod(to, s3)} et ${prod(s1, x)}`;
    const fact = (x) => differ('EF', x, cross(x));
    const rightFact = agree('EF', right, cross(right));
    return waveOf(
      rand,
      base,
      [
        String(Number(s3) + (Number(to) - Number(s1))),
        whole(over(times(s3, s1), to)),
        whole(over(times(s2, to), s1)),
        String(Number(s3) + Number(to)),
      ],
      fact,
      rightFact,
    );
  },
};

/** An exact length as a float (the drawing only). */
function evalOf(x) {
  const t = write(x);
  const m = /^(\d+)\/(\d+)$/.exec(t);
  return m ? Number(m[1]) / Number(m[2]) : Number(t.replace(',', '.'));
}
// ───────────────────────────── the legs ─────────────────────────────

/** What each leg asks, by the dock it leaves (its place in the world): the first level of the node of the key just sealed. */
export const LEG_MIX = {
  1: [
    ['rapport', {}],
    ['longueur', {}],
  ],
  3: [
    ['troisieme', {}],
    ['cote', {}],
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
/** A gate as the rail draws it: « 3/2 » over a real bar, anything else as text. */
export const gateOption = (g) => {
  const m = /^(\d+)\/(\d+)$/.exec(String(g));
  return m ? { tex: `\\dfrac{${m[1]}}{${m[2]}}` } : { t: String(g) };
};
/** A wave as the rail plays it: { ask, tex, options × 3, right, why × 3, seconds, figure }. */
export const roundOf = (w) => ({
  ask: w.say,
  tex: w.tex ?? null,
  options: w.gates.map(gateOption),
  right: w.good,
  why: w.gates.map((g, i) => (i === w.good ? w.why.right : (w.why.wrong?.[g] ?? w.why.right))),
  seconds: w.seconds,
  ...(w.figure ? { figure: w.figure } : {}),
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
    text: { ...TEXT, title: `${TEXT.title} : ${LEG_NAMES[i]}` },
  };
}
/** The two legs, keyed by the dock they leave (`story.legs`). */
export const LEGS = { 1: legOf(1), 3: legOf(3) };
