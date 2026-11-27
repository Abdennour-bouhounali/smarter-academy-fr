/**
 * « Entraîne-toi » of lesson `triangles-semblables` — the CONTENT of its trainer (PURE). The frame — six questions, two
 * formats that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`, the screen `kit/Trainer.jsx`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged: `check`
 * gives first a HINT that says what the answer gives (never the answer), then the correction.
 *
 *   game formats: a buoy of the felucca (`practice.js › waveOf`, its facts as hints), a true / false in one tap;
 *   exam formats, the asks of the bank on the platform's OWN figures (`math.js › FIGURES`) and letters —
 *     K1 `coef`      « Calcule le coefficient k » of two triangles apart, their sides given in any order (P1: the sides are
 *                    ranked, the quotients taken); `longueur` « Calcule le côté » of the second triangle from the first
 *                    one's three sides and ONE side of the second, given with its rank (P4, after the pairing: P3);
 *     K2 `troisieme` « Calcule le troisième angle » of the second triangle (P2: 180° − …);
 *                    `homologue` « Calcule k » when the triangles have two equal angles and the sides come with their
 *                    letters only (P3: the side OPPOSITE the equal angle), `apparier` the homologous side, chosen.
 *
 * EVERY QUESTION ABOUT TWO TRIANGLES CARRIES ITS FIGURE (`q.figure`, drawn by the kit's trainer — `kit/trainerFigure.js`,
 * at its 12 px label floor): the two triangles APART (`figures.js › sceneOf`, never a shared vertex), the lengths the
 * question gives written, « ? » on what it asks. A figure that writes an ANGLE cannot stand in the trainer's room at its
 * floor (an angle is written at 12, a length at 13: the longer side of a figure is 368 units, the room 350 px): the
 * angles of a question are in its sentence, its arcs only on the figure (reported).
 */
import { pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { trainerFigure } from '../../../../../../common/gameworld/kit/trainerFigure';
import { fromAngles, fromSides, sceneOf, sidesOf, turned } from './figures';
import {
  FIGURES,
  K,
  equal,
  frAll,
  minus,
  over,
  plus,
  read,
  times,
  tx,
  typedFrac,
  typedNumber,
  typedWhole,
  write,
} from './math';
import { isRight } from './run';
import { waveOf } from './practice';

// ───────────────────────────── the letters, the figures ─────────────────────────────

/** The letters of the two triangles of a question: the first, the second. */
const NAMES = [
  [
    ['A', 'B', 'C'],
    ['D', 'E', 'F'],
  ],
  [
    ['R', 'S', 'T'],
    ['U', 'V', 'W'],
  ],
  [
    ['G', 'H', 'I'],
    ['J', 'K', 'L'],
  ],
];
const RANK = ['plus petit', 'moyen', 'plus grand'];
/** Two sides of the same rank, paired: « les plus petits côtés ». */
const PAIRED = ['les plus petits côtés', 'les côtés moyens', 'les plus grands côtés'];
const UNIT = 'cm';
const num = (t) => Number(String(t).replace(',', '.'));
/** « ABC » */
const word = (names) => names.join('');

/** The three sides of a triangle (PQ, QR, RP) get the three lengths in a random order: { PQ: '6', QR: '4', RP: '5' }. */
function assign(rand, names, lengths) {
  const perm = shuffle(rand, [0, 1, 2]);
  return Object.fromEntries(sidesOf(names).map((side, i) => [side, lengths[perm[i]]]));
}
/** The lengths of a triangle by size: the side that has rank r (0 = the shortest). */
const sideOfRank = (sides, r) => Object.entries(sides).sort((p, q) => num(p[1]) - num(q[1]))[r][0];
/** « $AB = 6$, $BC = 4$ et $CA = 5$ » — the lengths given, each a formula. */
const lengths = (sides, keys = Object.keys(sides)) => {
  const each = keys.map((k) => `$${k} = ${tx(sides[k])}$`);
  return each.length < 2 ? each.join('') : `${each.slice(0, -1).join(', ')} et ${each.at(-1)}`;
};
/** The three sides of a triangle in the order of its lengths. */
const ascending = (sides) => Object.values(sides).sort((p, q) => num(p) - num(q));
/** The sides of a drawn triangle [PQ, QR, RP] from `sides` and the triangle itself, its lengths written. */
const sideTriangle = (names, sides, labels) => ({
  ...fromSides(
    sidesOf(names).map((s) => num(sides[s])),
    names,
  ),
  labels,
});

/**
 * THE FIGURE of a question: `build(layout, deg)` draws it stacked or side by side with the second triangle turned by 30°
 * steps; the first that fits the trainer's room (at its 12 px floor, at most LOW px tall) is kept, else the narrowest that
 * fits, else the best label. `above`: a question of a form that keeps the whole width.
 */
const LOW = 290;
function figureOf(build) {
  const tries = [];
  for (const layout of ['stack', 'side'])
    for (let deg = 0; deg < 360; deg += 30) {
      const spec = build(layout, deg);
      tries.push({ spec, t: trainerFigure(spec) });
    }
  const fits = tries.filter((x) => x.t.fits);
  const low = fits.filter((x) => x.t.height <= LOW);
  const pool = low.length ? low : fits;
  return (pool.sort((a, b) => a.t.width - b.t.width || a.t.height - b.t.height)[0] ?? tries[0]).spec;
}

// ───────────────────────────── the tokens of a form ─────────────────────────────
const fracBox = (n, d) => ({
  frac: { n: { num: n, label: 'le numérateur' }, d: { num: d, label: 'le dénominateur' } },
});
const lengthBox = (name, label) => ({ num: name, label, decimal: true, w: 5 });
const choice = (name, label, options) => ({
  choice: name,
  label,
  buttons: true,
  options: options.map((o) => ({ value: o, text: `[${o}]` })),
});
/** A fraction of two lengths, as a formula. */
const fr = (a, b) => `\\dfrac{${a}}{${b}}`;

// ───────────────────────────── the pairs of triangles ─────────────────────────────

/** Two similar triangles with lengths on their sides: `a` the first, `b` the second, their sides in random positions. */
function similarPair(rand) {
  const f = pick(rand, FIGURES.sides);
  const [n1, n2] = pick(rand, NAMES);
  return { f, n1, n2, one: assign(rand, n1, f.a), two: assign(rand, n2, f.b) };
}
/** The scene of two triangles with their sides written (`showOne`, `showTwo`: the keys written, `ask`: the key asked). */
function sidesScene(p, { showOne = Object.keys(p.one), showTwo = Object.keys(p.two), ask = [] } = {}) {
  const lab = (sides, keys) => Object.fromEntries(keys.map((k) => [k, sides[k]]));
  return (layout, deg) =>
    sceneOf({
      one: sideTriangle(p.n1, p.one, lab(p.one, showOne)),
      two: turned(sideTriangle(p.n2, p.two, lab(p.two, showTwo)), deg),
      layout,
      ask,
      aria: `Deux triangles séparés, ${word(p.n1)} et ${word(p.n2)}, avec les longueurs de leurs côtés`,
    });
}

/**
 * Two triangles with two equal angles, the vertices matched by `sigma` (vertex i of the first goes with vertex sigma[i] of
 * the second): the second triangle's lengths are the first's × k, side by side of the matched vertices (the side
 * OPPOSITE a vertex goes with the side opposite its partner).
 */
function anglesPair(rand) {
  const f = pick(rand, FIGURES.sides);
  const [n1, n2] = pick(rand, NAMES);
  const sigma = shuffle(rand, [0, 1, 2]);
  const one = assign(rand, n1, f.a);
  const opposite = (names, j) => sidesOf(names)[(j + 1) % 3];
  const two = {};
  // the side opposite vertex i of the first goes with the side opposite vertex sigma[i] of the second, × k
  for (let i = 0; i < 3; i += 1) two[opposite(n2, sigma[i])] = write(times(one[opposite(n1, i)], f.k));
  return { f, n1, n2, sigma, one, two, opposite };
}
/** « $\widehat{A} = \widehat{E}$ » for the vertices 0 and 1 of the first triangle. */
const equalAngles = (p) => [0, 1].map((i) => `$\\widehat{${p.n1[i]}} = \\widehat{${p.n2[p.sigma[i]]}}$`).join(' et ');
/** The scene of an angles pair: the arcs of the two equal angles marked on both triangles, the lengths in `show`. */
function arcsScene(p, { showOne = [], showTwo = [], ask = [] } = {}) {
  const lab = (sides, keys) => Object.fromEntries(keys.map((k) => [k, sides[k]]));
  const marks1 = Object.fromEntries([0, 1].map((i) => [p.n1[i], '']));
  const marks2 = Object.fromEntries([0, 1].map((i) => [p.n2[p.sigma[i]], '']));
  return (layout, deg) =>
    sceneOf({
      one: { ...sideTriangle(p.n1, p.one, lab(p.one, showOne)), angles: marks1 },
      two: turned({ ...sideTriangle(p.n2, p.two, lab(p.two, showTwo)), angles: marks2 }, deg),
      layout,
      ask,
      aria: `Deux triangles séparés, ${word(p.n1)} et ${word(p.n2)}, avec deux angles égaux marqués`,
    });
}

// ───────────────────────────── true / false ─────────────────────────────

/** The statements of each key: [statement, truth, why, figure] — `why` opens on a formula (« car » + why). */
const TF = {
  [K.cotes]: (rand) => {
    const kind = pick(rand, ['same', 'plus', 'deux']);
    const [n1, n2] = pick(rand, NAMES);
    const f = kind === 'same' ? pick(rand, FIGURES.sides) : pick(rand, FIGURES.unlike);
    const p = { n1, n2, one: assign(rand, n1, f.a), two: assign(rand, n2, f.b) };
    const head = `Dans $${word(n1)}$ : ${lengths(p.one)}. Dans $${word(n2)}$ : ${lengths(p.two)}.`;
    const figure = figureOf(sidesScene(p));
    const [a, b] = [ascending(p.one), ascending(p.two)];
    const q = (i) => fr(tx(b[i]), tx(a[i]));
    const val = (i) => tx(over(b[i], a[i]));
    if (kind === 'same')
      return [`${head} Les deux triangles sont semblables.`, true, `$${q(0)} = ${q(1)} = ${q(2)} = ${val(0)}$`, figure];
    const odd = 2;
    return [
      `${head} Les deux triangles sont semblables.`,
      false,
      `$${q(0)} = ${val(0)}$ mais $${q(odd)}$ ne vaut pas $${val(0)}$`,
      figure,
    ];
  },
  [K.angles]: (rand) => {
    const [n1, n2] = pick(rand, NAMES);
    const similar = rand() < 0.5;
    const [t1, t2] = similar
      ? (() => {
          const t = pick(rand, FIGURES.angles.similar);
          return [t, t];
        })()
      : pick(rand, FIGURES.angles.other);
    const [x1, y1] = shuffle(rand, t1).slice(0, 2);
    const [x2, y2] = shuffle(rand, t2).slice(0, 2);
    const third = (x, y) => 180 - Number(x) - Number(y);
    const head = `Dans $${word(n1)}$ : $${deg(x1)}$ et $${deg(y1)}$. Dans $${word(n2)}$ : $${deg(x2)}$ et $${deg(y2)}$.`;
    const figure = figureOf((layout, d) =>
      sceneOf({
        one: { ...fromAngles([num(x1), num(y1)], '5', n1), angles: { [n1[0]]: '', [n1[1]]: '', [n1[2]]: '' } },
        two: turned(
          { ...fromAngles([num(x2), num(y2)], '5', n2), angles: { [n2[0]]: '', [n2[1]]: '', [n2[2]]: '' } },
          d,
        ),
        layout,
        aria: `Deux triangles séparés, ${word(n1)} et ${word(n2)}, leurs angles marqués`,
      }),
    );
    const sorted = (...xs) => xs.map(Number).sort((p, q) => p - q);
    const same = sorted(x1, y1, third(x1, y1)).join() === sorted(x2, y2, third(x2, y2)).join();
    const proof = `$180 - ${x1} - ${y1} = ${third(x1, y1)}$ et $180 - ${x2} - ${y2} = ${third(x2, y2)}$`;
    return [
      `${head} Les deux triangles sont semblables.`,
      same,
      `${proof} : les angles ${same ? 'sont' : 'ne sont pas'} les mêmes`,
      figure,
    ];
  },
};
/** An angle in a formula: « 40^\circ ». */
const deg = (x) => `${x}^\\circ`;
/** Two reasons that prove nothing, per key: each states a false fact. */
const FOILS = {
  [K.cotes]: [
    'car les deux triangles ont le même nombre de côtés',
    'car il suffit que deux quotients de côtés soient égaux',
  ],
  [K.angles]: [
    'car les deux triangles ont un angle égal',
    'car la somme des angles est la même dans tous les triangles',
  ],
};
const TF_HINT = {
  [K.cotes]:
    'Vérifie : range les côtés de chaque triangle du plus petit au plus grand, puis calcule les trois quotients.',
  [K.angles]:
    'Vérifie : calcule le troisième angle de chaque triangle avec la somme des angles, puis compare les trois angles.',
};

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three buoys (the felucca, standing still). */
  tap(rand, format, kind, params) {
    const wave = waveOf(rand, kind, params);
    return {
      format: 'game',
      kind: 'tap',
      key: wave.key,
      wave,
      options: wave.gates,
      prompt: `${wave.say} $${wave.tex}$`,
    };
  },

  /** true / false. game: one tap. exam: « Vrai ou faux ? Justifie » — the truth AND its reason. */
  tf(rand, format, key) {
    const [statement, truth, why, figure] = TF[key](rand);
    return {
      format,
      kind: 'tf',
      key,
      statement,
      truth,
      why,
      figure,
      reasons:
        format === 'exam'
          ? shuffle(rand, [{ t: `car ${why}`, ok: true }, ...FOILS[key].map((t) => ({ t, ok: false }))])
          : null,
      prompt: statement,
    };
  },

  /** K1 exam — « Calcule k »: two similar triangles apart, their sides given in any order. */
  coef(rand) {
    const p = similarPair(rand);
    // the pairing by the ORDER OF THE NAMES — the slip of the tile « dans l'ordre des noms »
    const byNames = over(p.two[sidesOf(p.n2)[0]], p.one[sidesOf(p.n1)[0]]);
    return {
      format: 'exam',
      kind: 'coef',
      key: K.cotes,
      ...p,
      k: write(p.f.k),
      byNames: write(byNames),
      figure: figureOf(sidesScene(p)),
      prompt: `Les triangles $${word(p.n1)}$ et $${word(p.n2)}$ sont semblables. Côtés de $${word(p.n1)}$, en centimètres : ${lengths(p.one)}. Côtés de $${word(p.n2)}$ : ${lengths(p.two)}. Calcule $k$, de $${word(p.n1)}$ à $${word(p.n2)}$.`,
      form: {
        tip: 'tipCompute',
        lines: [{ ltr: true, tokens: ['$k$', '=', fracBox('n', 'd')] }],
      },
    };
  },

  /**
   * K1 exam — « Calcule le côté »: the three sides of the first triangle, ONE side of the second given with its rank
   * (« le plus petit côté »), the side asked named with its rank too.
   */
  longueur(rand) {
    const p = similarPair(rand);
    const [rg, ra] = pick(rand, [
      [0, 2],
      [0, 1],
      [1, 2],
      [1, 0],
      [2, 1],
      [2, 0],
    ]);
    const [gs, as] = [sideOfRank(p.two, rg), sideOfRank(p.two, ra)];
    const a = ascending(p.one);
    return {
      format: 'exam',
      kind: 'longueur',
      key: K.cotes,
      ...p,
      rg,
      ra,
      given: gs,
      asked: as,
      // x = P × Q ÷ D: the matched side of the first triangle for the one asked, the side given, its partner
      P: a[ra],
      Q: p.two[gs],
      D: a[rg],
      figure: figureOf(sidesScene(p, { showTwo: [gs], ask: [as] })),
      // short: the exam's sheet writes it at the 12 px floor beside the figure (the walk saw it squeezed to 11,5 px)
      // (2026-11-27: ≈ 130 seen with a fix of two lines, the whole fix sheet at 11,6 px — trainer.test.js bounds both)
      prompt: `$${word(p.n1)}$ et $${word(p.n2)}$ sont semblables. En cm : ${Object.keys(p.one)
        .map((k) => `$${k} = ${tx(p.one[k])}$`)
        .join(
          ', ',
        )}, $${gs} = ${tx(p.two[gs])}$, le ${RANK[rg]} côté de $${word(p.n2)}$. Calcule $${as}$, le ${RANK[ra]}.`,
      form: {
        tip: 'tipCompute',
        lines: [{ ltr: true, tokens: [`$${as}$`, '=', lengthBox('x', as), UNIT] }],
      },
    };
  },

  /** K2 exam — « Calcule le troisième angle » of the second triangle, two angles of each given in the sentence. */
  troisieme(rand) {
    const [n1, n2] = pick(rand, NAMES);
    const similar = rand() < 0.6;
    let t1;
    let t2;
    if (similar) {
      t1 = pick(rand, FIGURES.angles.similar);
      t2 = t1;
    } else [t1, t2] = pick(rand, FIGURES.angles.other);
    const [x1, y1] = shuffle(rand, t1).slice(0, 2);
    const [x2, y2] = shuffle(rand, t2).slice(0, 2);
    const third = write(String(180 - Number(x2) - Number(y2)));
    const sum = write(String(Number(x2) + Number(y2)));
    const angle = (names, i, v) => `$\\widehat{${names[i]}} = ${deg(v)}$`;
    const figure = figureOf((layout, d) =>
      sceneOf({
        one: { ...fromAngles([num(x1), num(y1)], '5', n1), angles: { [n1[0]]: '', [n1[1]]: '', [n1[2]]: '' } },
        two: turned(
          {
            ...fromAngles([num(x2), num(y2)], '5', n2),
            angles: { [n2[0]]: '', [n2[1]]: '', [n2[2]]: { tone: 'rose' } },
          },
          d,
        ),
        layout,
        aria: `Deux triangles séparés, ${word(n1)} et ${word(n2)}, le troisième angle de ${word(n2)} cherché`,
      }),
    );
    return {
      format: 'exam',
      kind: 'troisieme',
      key: K.angles,
      names: [n1, n2],
      angles: [x1, y1, x2, y2],
      third,
      sum,
      similar,
      figure,
      prompt: `Dans $${word(n1)}$ : ${angle(n1, 0, x1)} et ${angle(n1, 1, y1)}. Dans $${word(n2)}$ : ${angle(n2, 0, x2)} et ${angle(n2, 1, y2)}. Calcule $\\widehat{${n2[2]}}$.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: [`$\\widehat{${n2[2]}}$`, '=', { num: 'x', label: `l’angle ${n2[2]}`, w: 3 }, '°'] },
        ],
      },
    };
  },

  /**
   * K2 exam — « Calcule k »: two equal angles by their letters, ONE side of the first triangle and TWO of the second given;
   * k pairs the sides opposite the equal angles.
   */
  homologue(rand) {
    const p = anglesPair(rand);
    const i = pick(rand, [0, 1, 2]);
    const [mine, theirs] = [p.opposite(p.n1, i), p.opposite(p.n2, p.sigma[i])];
    // the other side of the second triangle given: a distractor that does not go with `mine`
    const other = p.opposite(p.n2, p.sigma[(i + 1) % 3]);
    const k = write(p.f.k);
    return {
      format: 'exam',
      kind: 'homologue',
      key: K.angles,
      ...p,
      mine,
      theirs,
      other,
      k,
      wrong: write(over(p.two[other], p.one[mine])),
      figure: figureOf(arcsScene(p, { showOne: [mine], showTwo: [theirs, other] })),
      prompt: `Les triangles $${word(p.n1)}$ et $${word(p.n2)}$ ont deux angles égaux : ${equalAngles(p)}. On donne, en centimètres, $${mine} = ${tx(p.one[mine])}$, $${theirs} = ${tx(p.two[theirs])}$ et $${other} = ${tx(p.two[other])}$. Calcule $k$, de $${word(p.n1)}$ à $${word(p.n2)}$.`,
      form: {
        tip: 'tipCompute',
        lines: [{ ltr: true, tokens: ['$k$', '=', fracBox('n', 'd')] }],
      },
    };
  },

  /** K2 exam — « Quel est le côté homologue ? »: the side of the second triangle opposite the angle equal to the first's. */
  apparier(rand) {
    const p = anglesPair(rand);
    const i = pick(rand, [0, 1, 2]);
    const mine = p.opposite(p.n1, i);
    const right = p.opposite(p.n2, p.sigma[i]);
    return {
      format: 'exam',
      kind: 'apparier',
      key: K.angles,
      ...p,
      mine,
      right,
      figure: figureOf(arcsScene(p)),
      prompt: `Les triangles $${word(p.n1)}$ et $${word(p.n2)}$ ont deux angles égaux : ${equalAngles(p)}. Quel côté de $${word(p.n2)}$ est l’homologue de $${mine}$ ?`,
      form: {
        tip: 'tipWrite',
        lines: [{ ltr: true, tokens: [`$${mine}$ et`, choice('h', 'le côté homologue', sidesOf(p.n2))] }],
      },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  k1: [['tap', 'rapport', {}], ['tf', K.cotes], ['coef'], ['tap', 'longueur', {}], ['longueur'], ['coef']],
  k2: [['tap', 'troisieme', {}], ['tf', K.angles], ['troisieme'], ['tap', 'cote', {}], ['homologue'], ['apparier']],
  mix: [['tap', 'longueur', {}], ['tf', K.angles], ['coef'], ['tap', 'cote', {}], ['longueur'], ['troisieme']],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  forme: 'k1',
  cotes: 'k1',
  rang: 'k1',
  coefficient: 'k1',
  'ordre-des-noms': 'k1',
  'exemple-cote': 'mix',
  agrandir: 'mix',
  angles: 'k2',
  homologues: 'k2',
  troisieme: 'k2',
  'un-angle': 'k2',
};

// ───────────────────────────── the right answers ─────────────────────────────

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'coef':
    case 'homologue': {
      const k = read(q.k);
      return { n: Number(k.n), d: Number(k.d) };
    }
    case 'longueur':
      return { x: write(q.two[q.asked]) };
    case 'troisieme':
      return { x: q.third };
    case 'apparier':
      return { h: q.right };
    default:
      return null;
  }
}

// ───────────────────────────── judging ─────────────────────────────

/** The two lists of lengths, ascending, as « 4 ; 5 ; 6 » and « 6 ; 7,5 ; 9 ». */
const rows = (q) => [ascending(q.one), ascending(q.two)].map((l) => l.map((x) => tx(x)).join(' ; '));

/**
 * Judges an answer. Returns { ok, hint, fix }:
 *   hint — after a first wrong answer: what the answer gives, or what is still missing (never the answer);
 *   fix  — the written correction, shown after a right answer or a second wrong one.
 */
export function check(q, v) {
  return frAll(judge(q, v));
}
function judge(q, v) {
  const val = v ?? {};
  switch (q.kind) {
    case 'tap': {
      const right = isRight(q.wave, v);
      const fact = right ? q.wave.why.right : (q.wave.why.wrong?.[v] ?? q.wave.why.right);
      return { ok: right, hint: fact, fix: q.wave.why.right };
    }
    case 'tf': {
      const truthOk = val.truth === q.truth;
      const reasonOk = !q.reasons || q.reasons[val.reason]?.ok === true;
      return {
        ok: truthOk && reasonOk,
        hint: !truthOk
          ? TF_HINT[q.key]
          : 'Ta réponse est la bonne, mais cette raison ne la prouve pas : cherche l’égalité qui la démontre.',
        fix: `L’affirmation est ${q.truth ? 'vraie' : 'fausse'} : ${q.why}.`,
      };
    }
    case 'coef': {
      const [r1, r2] = rows(q);
      const fix = `Rangés du plus petit au plus grand : $${r1}$ et $${r2}$, donc $k = ${fr(tx(ascending(q.two)[0]), tx(ascending(q.one)[0]))} = ${tx(q.k)}$.`;
      const typed = typedFrac(val.n, val.d);
      if (typed == null) return { ok: false, hint: 'Remplis le numérateur et le dénominateur.', fix };
      if (equal(typed, q.k)) return { ok: true, fix };
      return {
        ok: false,
        hint: equal(typed, over('1', q.k))
          ? 'Le quotient est renversé : le côté du second triangle au numérateur, celui du premier au dénominateur.'
          : equal(typed, q.byNames)
            ? 'Les noms ne rangent pas les côtés par taille : compare le plus petit côté avec le plus petit, le plus grand avec le plus grand.'
            : 'Le coefficient est le quotient de deux côtés homologues : range les côtés de chaque triangle du plus petit au plus grand.',
        fix,
      };
    }
    case 'homologue': {
      const fix = `$${q.mine}$ est en face de l’angle égal à celui qui est en face de $${q.theirs}$ : $k = ${fr(tx(q.two[q.theirs]), tx(q.one[q.mine]))} = ${tx(q.k)}$.`;
      const typed = typedFrac(val.n, val.d);
      if (typed == null) return { ok: false, hint: 'Remplis le numérateur et le dénominateur.', fix };
      if (equal(typed, q.k)) return { ok: true, fix };
      return {
        ok: false,
        hint: equal(typed, q.wrong)
          ? `$${q.other}$ n’est pas en face de l’angle égal à celui que $${q.mine}$ regarde : cherche le côté de $${word(q.n2)}$ en face de l’angle égal.`
          : 'Le coefficient est le quotient de deux côtés homologues : chacun est en face de l’un des deux angles égaux.',
        fix,
      };
    }
    case 'longueur': {
      // ONE line under the sheet (the walk, 2026-11-27: its two lines of fractions shrank the whole fix sheet to 11,6 px)
      const fix = `$${q.given}$ et $${sideOfRank(q.one, q.rg)}$ sont ${PAIRED[q.rg]} : $${q.asked} = ${tx(q.P)} \\times ${fr(tx(q.Q), tx(q.D))} = ${tx(q.two[q.asked])}$ ${UNIT}.`;
      const typed = typedNumber(val.x);
      if (typed != null && equal(typed, q.two[q.asked])) return { ok: true, fix };
      let hint = `Écris $${q.asked}$ en nombre, avec une virgule s’il le faut.`;
      if (typed != null) {
        hint = equal(typed, plus(q.P, minus(q.Q, q.D)))
          ? 'Les côtés ne s’ajoutent pas ici : le second triangle est le premier multiplié par un même nombre.'
          : equal(typed, over(times(q.P, q.D), q.Q))
            ? 'Le quotient est renversé : le côté du second triangle au numérateur, celui du premier au dénominateur.'
            : 'Associe d’abord le côté donné à son homologue dans le premier triangle, du plus petit au plus grand, puis multiplie par le même nombre.';
      }
      return { ok: false, hint, fix };
    }
    case 'troisieme': {
      const [, , x2, y2] = q.angles;
      const fix = `$180 - ${x2} - ${y2} = ${q.third}$ : $\\widehat{${q.names[1][2]}} = ${q.third}^\\circ$.`;
      const typed = typedNumber(val.x);
      if (typed != null && equal(typed, q.third)) return { ok: true, fix };
      const sum = q.sum;
      return {
        ok: false,
        hint:
          typed == null
            ? `Écris l’angle $\\widehat{${q.names[1][2]}}$ en degrés, un nombre.`
            : equal(typed, sum)
              ? 'Tu as additionné les deux angles : le troisième complète la somme des trois angles du triangle.'
              : equal(typed, write(String(180 - Number(x2))))
                ? `Il reste à retirer le second angle de $${word(q.names[1])}$.`
                : `La somme des trois angles de $${word(q.names[1])}$ vaut $180^\\circ$.`,
        fix,
      };
    }
    case 'apparier': {
      const fix = `$${q.mine}$ est en face de l’angle égal à celui de $${word(q.n1)}$ ; son homologue est le côté en face de l’angle égal dans $${word(q.n2)}$ : $${q.right}$.`;
      if (val.h === q.right) return { ok: true, fix };
      return {
        ok: false,
        hint: val.h
          ? `Regarde l’angle en face de $${q.mine}$ : le côté homologue est en face de l’angle égal dans $${word(q.n2)}$.`
          : 'Choisis un côté de la liste.',
        fix,
      };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}
/** A typed number as a formula, or « … » when the box is empty or not a number. */
const shown = (x) => (x == null ? '\\ldots' : tx(x));
const fracShown = (n, d) => (typedFrac(n, d) == null ? '\\ldots' : `\\dfrac{${typedWhole(n)}}{${typedWhole(d)}}`);

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const val = v ?? {};
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${val.truth ? 'Vrai' : 'Faux'}${q.reasons && q.reasons[val.reason] ? ` — ${q.reasons[val.reason].t}` : ''}`;
    case 'coef':
    case 'homologue':
      return `$k = ${fracShown(val.n, val.d)}$`;
    case 'longueur':
      return `$${q.asked} = ${shown(typedNumber(val.x))}$ ${UNIT}`;
    case 'troisieme':
      return `$\\widehat{${q.names[1][2]}} = ${shown(typedNumber(val.x))}^\\circ$`;
    case 'apparier':
      return val.h ? `$${val.h}$` : '…';
    default:
      return '';
  }
}

/** The trainer of this lesson: its questions and how they are judged, bound to the kit's frame. */
export const trainer = createTrainer({
  kinds: Object.fromEntries(Object.entries(Q).map(([kind, make]) => [kind, (...args) => frAll(make(...args))])),
  plans: PLANS,
  planOf: PLAN_OF,
  fallback: 'mix',
  check,
  solution,
  answerLabel,
});
