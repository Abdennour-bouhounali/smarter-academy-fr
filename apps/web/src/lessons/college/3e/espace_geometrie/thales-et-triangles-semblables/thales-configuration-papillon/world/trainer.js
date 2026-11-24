/**
 * « Entraîne-toi » of lesson `thales-configuration-papillon` — the CONTENT of its trainer (PURE). The frame — six
 * questions, two formats that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`, the screen
 * `kit/Trainer.jsx`). Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an
 * answer is judged: `check` gives first a HINT that says what the answer gives (never the answer), then the correction.
 *
 *   game formats: a buoy of the felucca (`practice.js › waveOf`, its facts as hints), a true / false in one tap;
 *   exam formats, the asks of the bank on the platform's OWN figures (`math.js › FIGURES`) and letters —
 *     K1 « Calcule le rapport » (a fraction over a bar; the two lengths of one line given, or the one ACROSS the vertex:
 *        P2), « Écris les trois rapports égaux » (segment names chosen inside fractions, a butterfly or a nested figure);
 *     K2 « Calcule la longueur » (a decimal box, its unit printed), the same when the length across the vertex is given
 *        (cut it first: P2), and a nested side given in two pieces (join it first: P2).
 *
 * EVERY QUESTION ABOUT A CONFIGURATION CARRIES ITS FIGURE (`q.figure`, drawn by the kit's trainer — `kit/trainerFigure.js`,
 * at its 12 px label floor): the world's Thalès figure (`nilePyramids/figure.js › figureSpec`, never a second drawing)
 * with the lengths the question gives and « ? » on what it asks, the chevrons of the parallel; turned by 15° steps when
 * it would stand too high for the trainer's room (asserted for every question of every kind in trainer.test.js).
 * A length is the kit's DECIMAL box `{ num, decimal: true }` (« 32,5 »), read exactly (`math.js › typedNumber`).
 */
import { pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { trainerFigure } from '../../../../../../common/gameworld/kit/trainerFigure';
import { figureSpec } from '../../../../../../common/gameworld/nilePyramids/figure';
import {
  FIGURES,
  K,
  equal,
  frAll,
  minus,
  over,
  plus,
  read,
  tex,
  times,
  typedFrac,
  typedNumber,
  typedWhole,
  write,
} from './math';
import { isRight } from './run';
import { waveOf } from './practice';

// ───────────────────────────── the letters and the figures ─────────────────────────────

/** The letters of a butterfly: the lines (MB) and (NC) cut at V, M and B on both sides of V. */
export const BUTTERFLY_NAMES = [
  { V: 'O', M: 'A', B: 'E', N: 'B', C: 'F' },
  { V: 'I', M: 'G', B: 'K', N: 'H', C: 'L' },
  { V: 'J', M: 'R', B: 'T', N: 'S', C: 'U' },
];
/** The letters of a nested figure: V the vertex, M on [VB], N on [VC]. */
export const NESTED_NAMES = [
  { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C' },
  { V: 'E', M: 'G', B: 'F', N: 'H', C: 'D' },
  { V: 'R', M: 'U', B: 'S', N: 'W', C: 'T' },
];
/** The three ratios of a figure, by their keys: [numerator, denominator]. */
const RATIOS = [
  ['VM', 'VB'],
  ['VN', 'VC'],
  ['MN', 'BC'],
];
/** A segment named with the figure's letters: « VM » → « OA »; the across « VMB » is the segment [MB]. */
const seg = (names, key) =>
  (key === 'VMB' ? 'MB' : key === 'VNC' ? 'NC' : key)
    .split('')
    .map((ch) => names[ch])
    .join('');
/**
 * The other lengths of a figure: a butterfly's lengths ACROSS the vertex (VMB = VM + VB, VNC = VN + VC — the keys of
 * `figure.js`), a nested figure's pieces (MB = VB − VM, NC = VC − VN).
 */
const withPieces = (f, butterfly) =>
  butterfly
    ? { ...f, VMB: write(plus(f.VM, f.VB)), VNC: write(plus(f.VN, f.VC)) }
    : { ...f, MB: write(minus(f.VB, f.VM)), NC: write(minus(f.VC, f.VN)) };
/** The configuration in words, now that the figure is drawn. */
function describe(names, butterfly) {
  const s = (k) => seg(names, k);
  return butterfly
    ? `Sur la figure, les droites $(${s('MB')})$ et $(${s('NC')})$ se coupent en $${names.V}$, et $(${s('MN')}) \\parallel (${s('BC')})$.`
    : `Sur la figure, $${names.M}$ est sur $[${s('VB')}]$, $${names.N}$ sur $[${s('VC')}]$, et $(${s('MN')}) \\parallel (${s('BC')})$.`;
}
/** The widest figure drawn as it is, unturned (trainerFigure's px): the question beside it keeps about 300 px. */
const UPRIGHT = 250;
/**
 * THE FIGURE of a question (`q.figure`): the world's Thalès figure with its letters, the lengths `show` written and those
 * `ask` written « ? ». Drawn as it is when it fits the trainer's room at its 12 px floor, else turned by 15° steps to the
 * NARROWEST turn that fits (DZ walk, 2026-11-24). `above`: a question of three fractions, its figure above it.
 */
function figureOf(f, names, butterfly, { show = [], ask = [], above = false } = {}) {
  const fig = { kind: butterfly ? 'butterfly' : 'nested', names, len: { ...f } };
  const at = (turn) => {
    const spec = figureSpec(fig, { show, ask, parallel: true, turn });
    return { spec, t: trainerFigure(spec) };
  };
  const flat = at(0);
  if (above) {
    const low = Array.from({ length: 24 }, (_, i) => at(i * 15)).filter((x) => x.t.fitsAbove);
    return (low.sort((a, b) => a.t.height - b.t.height)[0] ?? flat).spec;
  }
  if (flat.t.fits && flat.t.width <= UPRIGHT) return flat.spec;
  const turns = Array.from({ length: 24 }, (_, i) => at(i * 15)).filter((x) => x.t.fits);
  return (turns.sort((a, b) => a.t.width - b.t.width || a.t.height - b.t.height)[0] ?? flat).spec;
}
/** « $OA = 26$, $OE = 45{,}5$ et $OB = 32$ » — the lengths given, each a formula. */
const lengths = (names, f, keys) => {
  const each = keys.map((k) => `$${seg(names, k)} = ${tex(f[k])}$`);
  return each.length < 2 ? each.join('') : `${each.slice(0, -1).join(', ')} et ${each.at(-1)}`;
};
const UNIT = 'cm';
const UNIT_NOTE = 'Les longueurs sont en centimètres.';
/** A figure of the trainer, its letters and its other lengths. */
function drawFigure(rand, butterfly) {
  const f = pick(rand, butterfly ? FIGURES.butterfly : FIGURES.nested);
  return { f: withPieces(f, butterfly), names: pick(rand, butterfly ? BUTTERFLY_NAMES : NESTED_NAMES) };
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
  options: options.map((o) => ({ value: o, text: o })),
});
/** A ratio of segment names, each part a choice among `options`. */
const ratioChoice = (n, d, options) => ({
  frac: { n: choice(n, 'le numérateur', options), d: choice(d, 'le dénominateur', options) },
});
/** A fraction of two lengths, as a formula. */
const fr = (a, b) => `\\dfrac{${a}}{${b}}`;

// ───────────────────────────── true / false ─────────────────────────────

/** The statements of each key: [statement, truth, why, figure] — `why` opens on a formula (« car » + why). */
const TF = {
  [K.papillon]: (rand) => {
    const { f, names } = drawFigure(rand, true);
    const s = (k) => seg(names, k);
    const head = `${describe(names, true)} On donne ${lengths(names, f, ['VM', 'VB', 'VN', 'VC'])}.`;
    const figure = figureOf(f, names, true, { show: ['VM', 'VB', 'VN', 'VC'] });
    const num = (a, b) => fr(tex(f[a]), tex(f[b]));
    const val = (a, b) => tex(over(f[a], f[b]));
    return pick(rand, [
      [
        `${head} Alors $${fr(s('VM'), s('VB'))} = ${fr(s('VN'), s('VC'))}$.`,
        true,
        `$${num('VM', 'VB')} = ${num('VN', 'VC')}$`,
        figure,
      ],
      [
        `${head} Alors $${fr(s('VM'), s('VB'))} = ${fr(s('VC'), s('VN'))}$.`,
        false,
        `$${num('VM', 'VB')} = ${val('VM', 'VB')}$ et $${num('VC', 'VN')} = ${val('VC', 'VN')}$`,
        figure,
      ],
      [
        `${head} Alors $${fr(s('VM'), s('VMB'))} = ${fr(s('VN'), s('VC'))}$.`,
        false,
        `$${s('VMB')} = ${tex(f.VM)} + ${tex(f.VB)} = ${tex(f.VMB)}$, $${num('VM', 'VMB')} = ${val('VM', 'VMB')}$ et $${num('VN', 'VC')} = ${val('VN', 'VC')}$`,
        figure,
      ],
    ]);
  },
  [K.calcul]: (rand) => {
    const { f, names } = drawFigure(rand, true);
    const s = (k) => seg(names, k);
    const head = `${describe(names, true)} On donne ${lengths(names, f, ['VM', 'VB', 'VN'])}.`;
    const figure = figureOf(f, names, true, { show: ['VM', 'VB', 'VN', 'VC'], ask: ['VC'] });
    const right = `$\\dfrac{${tex(f.VB)} \\times ${tex(f.VN)}}{${tex(f.VM)}} = ${tex(f.VC)}$`;
    const added = write(minus(plus(f.VB, f.VN), f.VM));
    return pick(rand, [
      [`${head} Alors $${s('VC')} = ${tex(f.VC)}$.`, true, right, figure],
      [`${head} Alors $${s('VC')} = ${tex(f.VNC)}$.`, false, right, figure],
      [`${head} Alors $${s('VC')} = ${tex(added)}$.`, false, right, figure],
    ]);
  },
};
/** Two reasons that prove nothing, per key: each states a false fact. */
const FOILS = {
  [K.papillon]: [
    'car chaque longueur va avec celle qui lui fait face sur la figure',
    'car deux longueurs d’un même côté du point d’intersection font toujours le même rapport',
  ],
  [K.calcul]: [
    'car la longueur inconnue est la somme de deux longueurs données',
    'car on ajoute la même longueur des deux côtés du point d’intersection',
  ],
};
const TF_HINT = {
  [K.papillon]:
    'Vérifie : calcule chaque rapport, chaque longueur avec celle de la même droite, de l’autre côté du point d’intersection.',
  [K.calcul]: 'Vérifie avec les produits en croix des deux rapports qui contiennent la longueur inconnue.',
};

// ───────────────────────────── the right length of a ratio ─────────────────────────────

/**
 * The unknown U of ratio i from ratio j (both of `RATIOS`): U = P × Q / D, its three known lengths (pos 0: U is the
 * numerator of ratio i, pos 1: its denominator).
 */
function solve(i, pos, j) {
  const [ri, rj] = [RATIOS[i], RATIOS[j]];
  return pos === 0 ? { U: ri[0], P: ri[1], Q: rj[0], D: rj[1] } : { U: ri[1], P: ri[0], Q: rj[1], D: rj[0] };
}
/** The formula of a length computed: « \\dfrac{45{,}5 \\times 32}{26} = 56 ». */
const computed = (f, s) => `\\dfrac{${tex(f[s.P])} \\times ${tex(f[s.Q])}}{${tex(f[s.D])}} = ${tex(f[s.U])}`;

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

  /**
   * K1 exam — « Calcule le rapport »: a ratio of the chain from the two lengths of another line. `across`: the line is
   * given by its length from the vertex and its length ACROSS it (OA and AE: OE = AE − OA first) — P2.
   */
  rapport(rand, format, across = false) {
    const { f, names } = drawFigure(rand, true);
    const s = (k) => seg(names, k);
    const asked = pick(rand, [
      ['VN', 'VC'],
      ['MN', 'BC'],
    ]);
    const given = across ? ['VM', 'VMB'] : ['VM', 'VB'];
    return {
      format: 'exam',
      kind: across ? 'rapportTravers' : 'rapport',
      key: K.papillon,
      f,
      names,
      asked,
      across,
      k: write(over(f.VM, f.VB)),
      figure: figureOf(f, names, true, { show: given }),
      prompt: `${describe(names, true)} ${UNIT_NOTE} On donne ${lengths(names, f, given)}. Calcule le rapport $${fr(s(asked[0]), s(asked[1]))}$.`,
      form: {
        tip: 'tipCompute',
        lines: [{ ltr: true, tokens: [{ frac: { n: s(asked[0]), d: s(asked[1]) } }, '=', fracBox('n', 'd')] }],
      },
    };
  },
  /** K1 exam — the ratio from a line given across the vertex (P2). */
  rapportTravers(rand, format) {
    return Q.rapport(rand, format, true);
  },

  /** K1 exam — « Écris les trois rapports égaux »: segment names chosen inside three fractions (a butterfly or not). */
  rapports(rand) {
    const butterfly = rand() < 0.6;
    // a figure ABOVE its three fractions, low enough at its 12 px floor: a thin one (k = 2/5) stands too high
    const figures = shuffle(rand, butterfly ? FIGURES.butterfly : FIGURES.nested).map((x) => withPieces(x, butterfly));
    const names = pick(rand, butterfly ? BUTTERFLY_NAMES : NESTED_NAMES);
    const placed = figures
      .map((f) => ({ f, figure: figureOf(f, names, butterfly, { above: true }) }))
      .find((x) => trainerFigure(x.figure).fitsAbove);
    const { figure } = placed ?? { figure: figureOf(figures[0], names, butterfly, { above: true }) };
    const s = (k) => seg(names, k);
    const options = [
      [s('VM'), s('VB'), s('MB')],
      [s('VN'), s('VC'), s('NC')],
      [s('MN'), s('BC')],
    ];
    return {
      format: 'exam',
      kind: 'rapports',
      key: K.papillon,
      names,
      butterfly,
      figure,
      prompt: `${describe(names, butterfly)} Écris les trois rapports égaux.`,
      form: {
        tip: 'tipWrite',
        lines: [
          {
            ltr: true,
            tokens: [
              ratioChoice('r1n', 'r1d', options[0]),
              '=',
              ratioChoice('r2n', 'r2d', options[1]),
              '=',
              ratioChoice('r3n', 'r3d', options[2]),
            ],
          },
        ],
      },
    };
  },

  /** K2 exam — « Calcule la longueur »: the unknown of one ratio from a ratio wholly known, in a butterfly. */
  longueur(rand) {
    const { f, names } = drawFigure(rand, true);
    const i = pick(rand, [0, 1, 2]);
    const j = pick(
      rand,
      [0, 1, 2].filter((x) => x !== i),
    );
    const sol = solve(i, pick(rand, [0, 1]), j);
    return {
      format: 'exam',
      kind: 'longueur',
      key: K.calcul,
      f,
      names,
      sol,
      figure: figureOf(f, names, true, { show: [sol.P, sol.Q, sol.D, sol.U], ask: [sol.U] }),
      prompt: `${describe(names, true)} ${UNIT_NOTE} On donne ${lengths(names, f, [sol.P, sol.Q, sol.D])}. Calcule la longueur $${seg(names, sol.U)}$.`,
      form: {
        tip: 'tipCompute',
        lines: [{ ltr: true, tokens: [seg(names, sol.U), '=', lengthBox('x', seg(names, sol.U)), UNIT] }],
      },
    };
  },

  /**
   * K2 exam — the length ACROSS the vertex given (VMB): the length from the vertex first (VB = VMB − VM, P2), then the
   * unknown (P3) — VC from VN, or BC from MN.
   */
  travers(rand) {
    const { f, names } = drawFigure(rand, true);
    const v = pick(rand, ['VC', 'BC']);
    const spec = {
      VC: { other: 'VN', sol: solve(1, 1, 0) },
      BC: { other: 'MN', sol: solve(2, 1, 0) },
    }[v];
    return {
      format: 'exam',
      kind: 'travers',
      key: K.calcul,
      f,
      names,
      part: 'VM',
      whole: 'VMB',
      side: 'VB',
      ...spec,
      figure: figureOf(f, names, true, { show: ['VM', 'VMB', spec.other, spec.sol.U], ask: [spec.sol.U] }),
      prompt: `${describe(names, true)} ${UNIT_NOTE} On donne ${lengths(names, f, ['VM', 'VMB', spec.other])}. Calcule la longueur $${seg(names, 'VB')}$, puis la longueur $${seg(names, spec.sol.U)}$.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: [seg(names, 'VB'), '=', lengthBox('w', seg(names, 'VB')), UNIT] },
          { ltr: true, tokens: [seg(names, spec.sol.U), '=', lengthBox('x', seg(names, spec.sol.U)), UNIT] },
        ],
      },
    };
  },

  /** K2 exam — a nested side from the vertex given in two pieces: the whole side first (P2), then the unknown (P3). */
  emboite(rand) {
    const { f, names } = drawFigure(rand, false);
    const v = pick(rand, ['VC', 'MN', 'BC']);
    // VC from VM, MB and VN (VB = VM + MB); MN from VM, MB and BC; BC from VN, NC and MN (VC = VN + NC)
    const spec = {
      VC: { part: 'VM', piece: 'MB', side: 'VB', other: 'VN', sol: solve(1, 1, 0) },
      MN: { part: 'VM', piece: 'MB', side: 'VB', other: 'BC', sol: solve(2, 0, 0) },
      BC: { part: 'VN', piece: 'NC', side: 'VC', other: 'MN', sol: solve(2, 1, 1) },
    }[v];
    return {
      format: 'exam',
      kind: 'emboite',
      key: K.calcul,
      f,
      names,
      ...spec,
      figure: figureOf(f, names, false, { show: [spec.part, spec.piece, spec.other, spec.sol.U], ask: [spec.sol.U] }),
      prompt: `${describe(names, false)} ${UNIT_NOTE} On donne ${lengths(names, f, [spec.part, spec.piece, spec.other])}. Calcule la longueur $${seg(names, spec.side)}$, puis la longueur $${seg(names, spec.sol.U)}$.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: [seg(names, spec.side), '=', lengthBox('w', seg(names, spec.side)), UNIT] },
          { ltr: true, tokens: [seg(names, spec.sol.U), '=', lengthBox('x', seg(names, spec.sol.U)), UNIT] },
        ],
      },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  k1: [
    ['tap', 'longueur', {}],
    ['tf', K.papillon],
    ['rapport'],
    ['tap', 'rapport', {}],
    ['rapports'],
    ['rapportTravers'],
  ],
  k2: [['tap', 'travers', {}], ['tf', K.calcul], ['longueur'], ['tap', 'traversInconnu', {}], ['travers'], ['emboite']],
  mix: [
    ['tap', 'longueur', {}],
    ['tf', K.calcul],
    ['rapportTravers'],
    ['tap', 'emboite', {}],
    ['longueur'],
    ['travers'],
  ],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  papillon: 'k1',
  'demi-tour': 'k1',
  'trois-rapports': 'k1',
  'produit-en-croix': 'k1',
  partenaire: 'k1',
  redaction: 'k1',
  'exemple-papillon': 'k1',
  'depuis-le-sommet': 'k2',
  'a-travers': 'k2',
  emboites: 'k2',
  'exemple-calcul': 'mix',
};

// ───────────────────────────── the right answers ─────────────────────────────

/** The ratios a student must choose: [[num, den] × 3] with the letters of the question. */
const chainOf = (q) => RATIOS.map(([a, b]) => [seg(q.names, a), seg(q.names, b)]);

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'rapport':
    case 'rapportTravers': {
      const k = read(q.k);
      return { n: Number(k.n), d: Number(k.d) };
    }
    case 'rapports': {
      const [[a, b], [c, d], [e, g]] = chainOf(q);
      return { r1n: a, r1d: b, r2n: c, r2d: d, r3n: e, r3d: g };
    }
    case 'longueur':
      return { x: write(q.f[q.sol.U]) };
    case 'travers':
    case 'emboite':
      return { w: write(q.f[q.side]), x: write(q.f[q.sol.U]) };
    default:
      return null;
  }
}

// ───────────────────────────── judging ─────────────────────────────

/** Is the typed length v the right one? */
const sameLength = (v, x) => v != null && equal(v, x);
/** A hint for a length typed: the inverted ratio, the length across, the sum, or what to write. */
function lengthHint(q, s, typed) {
  if (typed == null)
    return `Écris la longueur $${seg(q.names, s.U)}$ en nombre, avec une virgule s’il le faut : par exemple $32{,}5$.`;
  const f = q.f;
  if (equal(typed, over(times(f[s.P], f[s.D]), f[s.Q])))
    return `Le rapport est renversé : écris les deux rapports dans le même ordre, $${seg(q.names, 'VM')}$ sur $${seg(q.names, 'VB')}$ par exemple, puis fais les produits en croix.`;
  if (f.VMB && (equal(typed, f.VMB) || equal(typed, f.VNC)))
    return `Cette longueur traverse le point $${q.names.V}$ : dans le papillon, chaque longueur part de $${q.names.V}$.`;
  if (equal(typed, plus(f[s.P], f[s.Q])) || equal(typed, minus(f[s.P], f[s.Q])) || equal(typed, minus(f[s.Q], f[s.P])))
    return 'Les longueurs ne s’ajoutent pas et ne se retranchent pas ici : les rapports sont égaux, fais les produits en croix.';
  return `Écris les deux rapports qui contiennent $${seg(q.names, s.U)}$ et trois longueurs connues, puis fais les produits en croix.`;
}
/** The ratios chosen are the chain (or the chain upside down, every ratio)? */
function chainHint(q, v) {
  const chain = chainOf(q);
  const picked = [
    [v.r1n, v.r1d],
    [v.r2n, v.r2d],
    [v.r3n, v.r3d],
  ];
  if (picked.some(([a, b]) => a == null || b == null))
    return { ok: false, hint: 'Choisis le numérateur et le dénominateur des trois rapports.' };
  const same = picked.every(([a, b], i) => a === chain[i][0] && b === chain[i][1]);
  const flipped = picked.every(([a, b], i) => a === chain[i][1] && b === chain[i][0]);
  if (same || flipped) return { ok: true };
  const pieces = [seg(q.names, 'MB'), seg(q.names, 'NC')];
  if (picked.some(([a, b]) => pieces.includes(a) || pieces.includes(b)))
    return {
      ok: false,
      hint: `$${pieces[0]}$ et $${pieces[1]}$ ${q.butterfly ? 'traversent le point d’intersection, ils ne partent pas de lui' : 'sont des morceaux qui ne partent pas du sommet'} : dans les rapports, chaque longueur part de $${q.names.V}$.`,
    };
  return {
    ok: false,
    hint: 'Écris les trois rapports dans le même ordre : une longueur du petit triangle sur celle du grand qui est sur la même droite.',
  };
}

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
    case 'rapport':
    case 'rapportTravers': {
      const { f, names, asked } = q;
      const s = (k) => seg(names, k);
      const cut = q.across
        ? `$${s('VB')} = ${s('VMB')} - ${s('VM')} = ${tex(f.VMB)} - ${tex(f.VM)} = ${tex(f.VB)}$, et `
        : '';
      const fix = `${cut}$(${s('MN')}) \\parallel (${s('BC')})$, donc $${fr(s(asked[0]), s(asked[1]))} = ${fr(s('VM'), s('VB'))} = ${fr(tex(f.VM), tex(f.VB))} = ${tex(q.k)}$.`;
      const typed = typedFrac(val.n, val.d);
      if (typed == null) return { ok: false, hint: 'Remplis le numérateur et le dénominateur.', fix };
      if (equal(typed, q.k)) return { ok: true, fix };
      return {
        ok: false,
        hint: equal(typed, over(f.VM, f.VMB))
          ? `$${s('VMB')}$ traverse le point $${names.V}$ : dans un rapport, chaque longueur part de $${names.V}$.`
          : equal(typed, over(f.VB, f.VM))
            ? `Le rapport est renversé : la longueur du petit triangle au numérateur, celle du grand au dénominateur, comme $${fr(s('VM'), s('VB'))}$.`
            : `Le rapport $${fr(s(asked[0]), s(asked[1]))}$ est égal à un autre rapport de la figure, dont tu connais les longueurs.`,
        fix,
      };
    }
    case 'rapports': {
      const [[a, b], [c, d], [e, g]] = chainOf(q);
      const fix = `$(${seg(q.names, 'MN')}) \\parallel (${seg(q.names, 'BC')})$, donc $${fr(a, b)} = ${fr(c, d)} = ${fr(e, g)}$.`;
      const r = chainHint(q, val);
      return r.ok ? { ok: true, fix } : { ok: false, hint: r.hint, fix };
    }
    case 'longueur': {
      const { f, names, sol } = q;
      const [r0, r1, r2] = RATIOS.map(([a, b]) => fr(seg(names, a), seg(names, b)));
      const fix = `$${r0} = ${r1} = ${r2}$, donc $${computed(f, sol)}$ ${UNIT}.`;
      const typed = typedNumber(val.x);
      if (sameLength(typed, f[sol.U])) return { ok: true, fix };
      return { ok: false, hint: lengthHint(q, sol, typed), fix };
    }
    case 'travers':
    case 'emboite': {
      const { f, names, sol } = q;
      const s = (k) => seg(names, k);
      const first =
        q.kind === 'travers'
          ? `$${s(q.side)} = ${tex(f[q.whole])} - ${tex(f[q.part])} = ${tex(f[q.side])}$`
          : `$${s(q.side)} = ${tex(f[q.part])} + ${tex(f[q.piece])} = ${tex(f[q.side])}$`;
      const fix = `${first} ${UNIT}, puis $${computed(f, sol)}$ ${UNIT}.`;
      const w = typedNumber(val.w);
      if (!sameLength(w, f[q.side]))
        return {
          ok: false,
          hint:
            w == null
              ? `Écris d’abord la longueur $${s(q.side)}$.`
              : q.kind === 'travers'
                ? `$${s(q.whole)}$ traverse le point $${names.V}$ : $${s(q.side)}$ part de $${names.V}$, c’est le morceau de l’autre côté.`
                : `$${s(q.side)}$ est un côté qui part du sommet : ses deux morceaux sont $${s(q.part)}$ et $${s(q.piece)}$.`,
          fix,
        };
      const x = typedNumber(val.x);
      if (sameLength(x, f[sol.U])) return { ok: true, fix };
      return { ok: false, hint: lengthHint(q, sol, x), fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** A typed number as a formula, or « … » when the box is empty or not a number. */
const shown = (x) => (x == null ? '\\ldots' : tex(x));
const fracShown = (n, d) => (typedFrac(n, d) == null ? '\\ldots' : `\\dfrac{${typedWhole(n)}}{${typedWhole(d)}}`);

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const val = v ?? {};
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${val.truth ? 'Vrai' : 'Faux'}${q.reasons && q.reasons[val.reason] ? ` — ${q.reasons[val.reason].t}` : ''}`;
    case 'rapport':
    case 'rapportTravers':
      return `$${fr(seg(q.names, q.asked[0]), seg(q.names, q.asked[1]))} = ${fracShown(val.n, val.d)}$`;
    case 'rapports': {
      const r = (n, d) => fr(val[n] ?? '\\ldots', val[d] ?? '\\ldots');
      return `$${r('r1n', 'r1d')} = ${r('r2n', 'r2d')} = ${r('r3n', 'r3d')}$`;
    }
    case 'longueur':
      return `$${seg(q.names, q.sol.U)} = ${shown(typedNumber(val.x))}$ ${UNIT}`;
    case 'travers':
    case 'emboite':
      return `$${seg(q.names, q.side)} = ${shown(typedNumber(val.w))}$, $${seg(q.names, q.sol.U)} = ${shown(typedNumber(val.x))}$`;
    default:
      return '';
  }
}

/** The trainer of this lesson: its questions and how they are judged, bound to the kit's frame. */
export const trainer = createTrainer({
  kinds: Q,
  plans: PLANS,
  planOf: PLAN_OF,
  fallback: 'mix',
  check,
  solution,
  answerLabel,
});
