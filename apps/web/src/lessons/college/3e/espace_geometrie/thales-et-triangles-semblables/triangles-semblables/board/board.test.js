import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { SCRIPT, BOARD, KEYS, FIGURES, FACTS, ASKED, common } from './script';
import { MEMO, MEMO_FACTS } from './memo';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askWords, askHeld, askProof, groupsOf } from '../../../../../../../features/classSession/lessonScripts';
import { boardFigure, BOARD_LABEL_PX } from '../../../../../../../features/classSession/boardFigure';
import { layoutGeoFigure, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { compare, equal, minus, over, plus, read, times, write } from '../../../../../../common/gameworld/kit/exact';
import {
  typographyErrors,
  agreementErrors,
  stringsIn,
} from '../../../../../../common/gameworld/kit/authoring/test/suites';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank';
import { getItem } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';

/** « La leçon au tableau » of `triangles-semblables`: every number the board, the memo and the class test say is computed here. */
const KINDS = ['ask', 'name', 'trace'];
const steps = SCRIPT.steps;
const asks = steps.filter((s) => s.kind === 'ask');
const names = steps.filter((s) => s.kind === 'name');
const step = (id) => steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const n = (x) => Number(write(x));
const num = (x) => Number(read(x).n) / Number(read(x).d);

// ── an EXACT evaluator of the board's formulas: numbers « 7{,}5 », \dfrac{…}{…}, \times, +, −, ( ); a side with a letter
// (a segment « AM ») or a degree sign is skipped; relations =, \neq, <, > between the numeric sides ──
/** Reads one side; null when it holds a letter (a segment's name) or anything the board does not write. */
function sideValue(src) {
  const s = src
    .replace(/\{,\}/g, ',')
    .replace(/\\times/g, '*')
    .replace(/\\dfrac/g, '§');
  if (/[A-Za-z\\°→]/.test(s)) return null;
  const t = s.match(/\d+(?:,\d+)?|§|[{}()*+-]|\S/g) ?? [];
  if (t.some((x) => !/^(\d+(?:,\d+)?|§|[{}()*+-])$/.test(x))) return null;
  let i = 0;
  const need = (x) => {
    expect(t[i], src).toBe(x);
    i += 1;
  };
  const braced = () => {
    need('{');
    const v = sum(); // eslint-disable-line no-use-before-define
    need('}');
    return v;
  };
  const atom = () => {
    const x = t[i];
    if (x === '(') {
      i += 1;
      const v = sum(); // eslint-disable-line no-use-before-define
      need(')');
      return v;
    }
    if (x === '§') {
      i += 1;
      const [a, b] = [braced(), braced()];
      return over(a, b);
    }
    i += 1;
    return read(x);
  };
  const product = () => {
    let v = atom();
    while (t[i] === '*') {
      i += 1;
      v = times(v, atom());
    }
    return v;
  };
  function sum() {
    let v = product();
    while (t[i] === '+' || t[i] === '-') {
      const op = t[i];
      i += 1;
      const u = product();
      v = op === '+' ? plus(v, u) : minus(v, u);
    }
    return v;
  }
  const v = sum();
  expect(i, `${src}: read whole`).toBe(t.length);
  return v;
}
/** Is every relation between the numeric sides of a formula true? null when fewer than two sides are numbers. */
function holds(f) {
  const parts = f.split(/\s*(=|\\neq|<|>)\s*/);
  const sides = parts.filter((_, k) => k % 2 === 0).map(sideValue);
  const rels = parts.filter((_, k) => k % 2 === 1);
  let last = null;
  let between = [];
  let checked = 0;
  for (let k = 0; k < sides.length; k += 1) {
    if (k > 0) between.push(rels[k - 1]);
    if (sides[k] == null) continue;
    if (last != null) {
      const c = compare(sides[last], sides[k]);
      const ok = between.every((r) => r === '=')
        ? c === 0
        : between.length === 1 && between[0] === '\\neq'
          ? c !== 0
          : between.length === 1 && between[0] === '<'
            ? c < 0
            : between.length === 1 && between[0] === '>'
              ? c > 0
              : null;
      if (ok === null) return null;
      if (!ok) return false;
      checked += 1;
    }
    last = k;
    between = [];
  }
  return checked ? true : null;
}
/** Every relation written in these texts is true; how many formulas were checked. */
function allTrue(texts) {
  let count = 0;
  for (const t of texts)
    for (const f of formulas(t)) {
      const h = holds(f);
      if (h === null) continue;
      expect(h, `« ${f} » in « ${t} »`).toBe(true);
      count += 1;
    }
  return count;
}

/**
 * The words of each key's NAME (its tablet's sentence): none may stand on the board before its naming station. The
 * degrees' sum (180) is 5e's and is no word of the key: only the two equal angles are.
 */
const FORBIDDEN = {
  'cotes-proportionnels': [
    'semblable',
    'homologue',
    'proportionnel',
    'quotient',
    'plus petit au plus grand',
    'réduction',
  ],
  'angles-egaux': ['deux angles', 'troisième angle', 'angles égaux'],
};
/**
 * The numbers of the student's world (UNIT_3E_THALES_DESIGN.md « Lesson 1 », § 3): the template, the tracés, the angles,
 * the mission, the docks, the sun. The board's own numbers are none of them.
 */
const WORLD_NUMBERS = [
  '2',
  '3',
  '3,8',
  '4,5',
  '5,7',
  '1,5',
  '1,9',
  '5,1',
  '4',
  '4,8',
  '12',
  '8',
  '15,2',
  '27',
  '41',
  '112',
  '55',
  '98',
  '1,6',
  '21',
  '16,8',
  '10',
  '20',
  '90',
  '99',
  '2,75',
  '140',
  '225',
  '1,25',
  '33,75',
  '51,25',
  '10,5',
  '26,25',
  '104',
  '52',
  '115',
  '146',
  '72',
];
/** The coefficients the world sails with: 3/2, 1/2, 4, 4/3 and the mission's 10,5. The board's are others. */
const WORLD_K = ['3/2', '1/2', '4', '4/3', '21/2'];
const tracked = (x) => read(x).d !== 1n || compare(x, '10') >= 0;

/** Each station re-computed from BOARD alone — the right number and the error each other card makes. */
const { gabarit: G, contour: C, retour: R, angles1: N1, angles2: N2, appariement: A, rampes: P } = BOARD;
const FIG = (() => {
  const gaK = over(G.DF, G.AC);
  const perimeter = plus(plus(C.AB, C.AC), C.BC);
  const coK = over(C.NP, C.BC);
  const reK = read(R.k);
  const apK = over(A.DE, A.BC);
  return {
    gabarit: {
      right: times(G.AB, gaK),
      wrong: { mix: over(times(G.AB, G.EF), G.AC), avg: over(plus(G.DF, G.EF), '2') },
      data: [G.AC, G.AB, G.BC, G.DF, G.EF],
      k: gaK,
    },
    contour: {
      right: times(perimeter, coK),
      wrong: { each: plus(perimeter, times('3', minus(C.NP, C.BC))), one: plus(minus(perimeter, C.BC), C.NP) },
      data: [C.AB, C.AC, C.BC, C.NP, perimeter, times(C.AB, coK), times(C.AC, coK)],
      k: coK,
    },
    retour: {
      right: times(R.NP, over(reK.d, reK.n)),
      wrong: { not: times(R.NP, R.k), top: times(R.NP, String(reK.n)) },
      data: [R.NP],
      k: R.k,
    },
    'angles-1': {
      right: String(common([N1.A, N1.B, '78'], [N1.A, '56', N1.F])),
      wrong: { one: '1', two: '2' },
      data: [],
    },
    'angles-2': {
      right: String(common([N2.A, N2.B, '78'], [N2.A, N2.E, '73'])),
      wrong: { two: '2', three: '3' },
      data: [],
    },
    appariement: {
      right: times(A.AB, apK),
      wrong: { byLetters: A.DE, longest: times(A.AC, apK) },
      data: [A.BC, A.AB, A.AC],
      k: apK,
    },
    rampes: {
      right: over(times(P.BC, P.DE), P.AB),
      wrong: { turned: over(times(P.BC, P.AB), P.DE), add: plus(P.BC, minus(P.DE, P.AB)) },
      data: [P.AB, P.BC, P.DE],
      k: over(P.DE, P.AB),
    },
  };
})();
/** The lengths each figure writes: the station's data, as written (the one asked is « ? »). */
const GIVEN = {
  gabarit: [G.AC, G.AB, G.BC, G.DF, G.EF],
  contour: [C.AB, C.AC, C.BC, C.NP],
  retour: [R.NP],
  appariement: [A.BC, A.AB, A.AC, A.DE, A.EF, A.DF],
  rampes: [P.AB, P.BC, P.DE],
};
/** The labels of a figure (point names, lengths) whose boxes meet, as GeoFigure lays them out (geoFigure.js). */
function overlaps(fig) {
  const L = layoutGeoFigure(fig);
  const boxes = Object.entries(L.pointLabels).map(([k, q]) => [k, q[0], q[1] - 5, 10, 14]);
  for (const x0 of fig.segments) {
    const x = Array.isArray(x0) ? { from: x0[0], to: x0[1] } : x0;
    if (x.label == null) continue;
    const q = L.segmentLabel(x.from, x.to, x.labelSide, x.label);
    boxes.push([`${x.from}${x.to}`, q[0], q[1] - 4.5, String(x.label).length * 7.4 + 2, 14]);
  }
  const out = [];
  boxes.forEach((a, i) =>
    boxes.slice(i + 1).forEach((b) => {
      if (Math.abs(a[1] - b[1]) < (a[3] + b[3]) / 2 && Math.abs(a[2] - b[2]) < (a[4] + b[4]) / 2)
        out.push(`${a[0]}×${b[0]}`);
    }),
  );
  return out;
}
const seg = (fig) => fig.segments.map((x) => (Array.isArray(x) ? { from: x[0], to: x[1] } : x));
const dist = (fig, a, b) => Math.hypot(...[0, 1].map((k) => fig.points[a][k] - fig.points[b][k]));
/** The angle (degrees) at `at` between the rays to `from` and `to`. */
const angleAt = (fig, at, from, to) => {
  const [u, v] = [from, to].map((k) => [0, 1].map((i) => fig.points[k][i] - fig.points[at][i]));
  return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))) * 180) / Math.PI;
};
/** The triangle ABC and DEF of a figure are similar: the sorted sides of one are the other's × one number. */
const sortedSides = (fig, [a, b, c]) => [dist(fig, a, b), dist(fig, b, c), dist(fig, a, c)].sort((x, y) => x - y);

describe('Triangles semblables — the evaluator of the board’s formulas', () => {
  it('says the truth on hand-worked cases', () => {
    expect(holds('\\dfrac{7{,}2}{3{,}2} = \\dfrac{9}{4}')).toBe(true);
    expect(holds('\\dfrac{7{,}2}{3{,}2} = \\dfrac{5}{4}')).toBe(false);
    expect(holds('180 - 43 - 63 = 74')).toBe(true);
    expect(holds('\\dfrac{AB}{DE} = \\dfrac{9}{4}')).toBe(null);
    expect(holds('\\dfrac{2}{7} \\neq \\dfrac{1}{4}')).toBe(true);
  });
});

describe('Triangles semblables — the script of the lesson on the board', () => {
  it('uses only the kinds it needs, unique ids, a chapter, a short cue, and ONE copybook page', () => {
    expect(steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(steps.length).toBeLessThanOrEqual(14);
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
    for (const s of steps) {
      expect(s.chapter, s.id).toBeTruthy();
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
      for (const k of ['cue', 'question', 'title', 'text', 'after'])
        expect((s[k] ?? '').replace(/\$[^$]+\$/g, ''), `${s.id}.${k}`).not.toMatch(/\d\s*\/\s*\d/);
    }
    expect(steps[0].kind).toBe('ask');
    expect(steps.at(-1).kind).toBe('trace');
    expect(steps.filter((s) => s.kind === 'trace')).toHaveLength(1);
    // one group per key — what the class does, then the name it earns — and the last group, the copybook
    expect(groupsOf(SCRIPT)).toHaveLength(KEYS.length + 1);
    expect(asks.map((s) => s.id)).toEqual([
      'gabarit',
      'contour',
      'retour',
      'angles-1',
      'angles-2',
      'appariement',
      'rampes',
    ]);
  });

  it('names a key only after the class has acted, and nothing before says its name', () => {
    steps.forEach((s, i) => {
      if (s.kind === 'name') expect(steps[i - 1].kind, s.id).toBe('ask');
    });
    for (const nm of names) {
      const before = stringsIn(steps.slice(0, steps.indexOf(nm)))
        .join(' ')
        .toLowerCase();
      for (const k of KEYS.slice(KEYS.indexOf(nm.tablet)))
        for (const word of FORBIDDEN[k]) expect(before, `${nm.id}: « ${word} »`).not.toContain(word);
    }
    // the cards' own words name no key either
    const cards = stringsIn(asks.map(askWords)).join(' ').toLowerCase();
    for (const word of Object.values(FORBIDDEN).flat()) expect(cards, word).not.toContain(word);
  });

  it('every ask’s answer is the right number, computed from the figure — the one card the board says agrees', () => {
    for (const s of asks) {
      const f = FIG[s.id];
      expect(s.answer, s.id).toEqual([n(f.right)]);
      // a station with its figure draws no bridge: a card agrees when it is the answer (lessonScripts.js › askHeld)
      expect(askProof(s), s.id).toBe('none');
      expect(s.a, `${s.id}: no gap of a bridge`).toBeUndefined();
      expect(
        s.options.filter((o) => askHeld(s, o)),
        s.id,
      ).toEqual(s.answer);
      // the other cards are the errors the lesson fights, each computed, each whole, each another number
      const wrong = Object.values(f.wrong).map(n);
      expect(
        [...s.options].sort((x, y) => x - y),
        s.id,
      ).toEqual([n(f.right), ...wrong].sort((x, y) => x - y));
      for (const v of [f.right, ...Object.values(f.wrong)]) expect(read(v).d, `${s.id}: a whole number`).toBe(1n);
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.options.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.options.length, s.id).toBeLessThanOrEqual(6);
      expect(s.after, s.id).toContain('$');
    }
    // the right card is not always in the same place
    expect(new Set(asks.map((s) => s.options.indexOf(s.answer[0]))).size).toBeGreaterThanOrEqual(2);
    // the values, by hand: 7,5 × 2,4 ÷ 2 = 9; 16,5 × 4,2 ÷ 7,7; 56 × 8 ÷ 7; 3 angles; 1 angle; 2,8 × 5 ÷ 2; 4 × 6 ÷ 3
    expect(asks.map((s) => s.answer[0])).toEqual([9, 9, 64, 3, 1, 7, 8]);
    expect(FACTS.gabarit).toMatchObject({ DE: '9', mix: '36', avg: '6', k: '\\dfrac{6}{5}' });
    expect(FACTS.contour).toMatchObject({ P: '16,5', NP: '9', MN: '1,8', MP: '3', each: '6', one: '13' });
    expect(FACTS.retour).toMatchObject({ BC: '64', not: '49', top: '392' });
    expect(FACTS['angles-1']).toMatchObject({ C: '78', E: '56', common: '3' });
    expect(FACTS['angles-2']).toMatchObject({ C: '78', F: '73', common: '1' });
    expect(FACTS.appariement).toMatchObject({ DF: '7', EF: '11' });
    expect(FACTS.rampes).toMatchObject({ EF: '8', turned: '2', add: '7' });
  });

  it('every ask CARRIES its figure: drawn to scale, its given lengths and « ? » on the one asked', () => {
    for (const s of asks) {
      const fig = s.figure;
      expect(fig, s.id).toBe(FIGURES[s.id]);
      expect(validateGeoFigure(fig), s.id).toEqual([]);
      expect(s.text.length, s.id).toBeLessThanOrEqual(140);
      // a long question or feedback beside the figure shrinks the answer cards out of their buttons (the walk, 2026-11-27)
      expect(s.question.length, s.id).toBeLessThanOrEqual(90);
      expect(s.after.length, s.id).toBeLessThanOrEqual(s.id === 'retour' || s.id === 'gabarit' ? 240 : 200);
      expect(
        formulas(s.text).filter((f) => /\d/.test(f)),
        `${s.id}: its words say what the figure cannot — only the number k of « retour » is in a text`,
      ).toEqual(s.id === 'retour' ? ['\\dfrac{7}{8}'] : []);
    }
    for (const id of Object.keys(GIVEN)) {
      const fig = FIGURES[id];
      const given = seg(fig).filter((x) => x.label != null && x.label !== ASKED);
      expect(given.map((x) => x.label).sort(), id).toEqual(GIVEN[id].map(String).sort());
      for (const x of given)
        expect(dist(fig, x.from, x.to) / num(x.label), `${id}: ${x.from}${x.to}`).toBeCloseTo(1, 9);
    }
    // measured on the drawing, the length asked IS the answer
    for (const id of ['gabarit', 'retour', 'rampes']) {
      const asked = seg(FIGURES[id]).filter((x) => x.label === ASKED);
      expect(asked, id).toHaveLength(1);
      expect(dist(FIGURES[id], asked[0].from, asked[0].to), id).toBeCloseTo(step(id).answer[0], 9);
    }
    // the angles written are the angles drawn; the ramp's right angles are right and its two feet make the same angle
    for (const id of ['angles-1', 'angles-2'])
      for (const a of FIGURES[id].angles)
        expect(angleAt(FIGURES[id], a.at, a.from, a.to), `${id}: ${a.at}`).toBeCloseTo(Number.parseInt(a.label, 10), 6);
    const ra = FIGURES.rampes;
    expect(angleAt(ra, 'B', 'A', 'C')).toBeCloseTo(90, 6);
    expect(angleAt(ra, 'E', 'D', 'F')).toBeCloseTo(90, 6);
    expect(angleAt(ra, 'A', 'B', 'C')).toBeCloseTo(angleAt(ra, 'D', 'E', 'F'), 9);
  });

  it('draws two SEPARATE triangles of the same shape — never a shared vertex, never nested', () => {
    // the template and the tracé (or the two cardboard triangles) are the same shape; no point of one is a point of the other
    const shapes = {
      gabarit: [['A', 'B', 'C'], ['D', 'E', 'F'], num(FIG.gabarit.k)],
      contour: [['A', 'B', 'C'], ['M', 'N', 'P'], num(FIG.contour.k)],
      retour: [['A', 'B', 'C'], ['M', 'N', 'P'], num(FIG.retour.k)],
      appariement: [['A', 'B', 'C'], ['D', 'E', 'F'], num(FIG.appariement.k)],
    };
    for (const [id, [first, second, k]] of Object.entries(shapes)) {
      const fig = FIGURES[id];
      const [s1, s2] = [sortedSides(fig, first), sortedSides(fig, second)];
      s1.forEach((x, i) => expect(s2[i] / x, `${id}: side ${i}`).toBeCloseTo(k, 9));
      expect(
        first.some((p) => second.includes(p)),
        id,
      ).toBe(false);
    }
    // the two cardboard triangles: the angles of the first are found again, as many as the station counts
    const a1 = FIGURES['angles-1'];
    expect(sortedSides(a1, ['D', 'E', 'F'])[0] / sortedSides(a1, ['A', 'B', 'C'])[0]).toBeCloseTo(
      sortedSides(a1, ['D', 'E', 'F'])[2] / sortedSides(a1, ['A', 'B', 'C'])[2],
      9,
    );
    // the pairing is a trap of the letters: [DE] is the shortest side of DEF, and [AB] is not the shortest of ABC
    const ap = FIGURES.appariement;
    expect(compare(A.DE, A.DF)).toBe(-1);
    expect(compare(A.BC, A.AB)).toBe(-1);
    expect(dist(ap, 'D', 'E')).toBeLessThan(dist(ap, 'D', 'F'));
    expect(seg(ap).find((x) => x.from === 'A' && x.to === 'B').tone).toBe('indigo');
    // the roofs: a right angle each, the same angle at the foot, the sides paired by rank
    expect(compare(FIG.rampes.wrong.turned, FIG.rampes.right)).toBe(-1);
  });

  it('draws each figure for the back of the class: labels of 18 px at 1366 × 768, beside the cards, none on another', () => {
    for (const s of asks) {
      const f = boardFigure(s.figure);
      expect(f.label, s.id).toBeGreaterThanOrEqual(BOARD_LABEL_PX);
      expect(f.width, s.id).toBeLessThanOrEqual(520); // 518 with an angle label: its floor is 12 px in the viewBox, a length's 13
      expect(f.height, s.id).toBeLessThanOrEqual(480);
      expect(overlaps(s.figure), s.id).toEqual([]);
    }
  });

  it('draws the traps visibly far from the truth: the mixed-up ranks give a side far too long, the number not turned is not the template', () => {
    expect(compare(FIG.gabarit.wrong.avg, FIG.gabarit.right)).toBe(-1);
    expect(compare(FIG.gabarit.wrong.mix, FIG.gabarit.right)).toBe(1);
    expect(compare(FIG.contour.wrong.each, FIG.contour.right)).toBe(-1);
    expect(compare(FIG.retour.wrong.not, FIG.retour.right)).toBe(-1);
    expect(compare(FIG.retour.wrong.top, FIG.retour.right)).toBe(1);
    // « from the tracé back to the template »: the number is turned upside down, the template is the longer one (k < 1)
    expect(compare(FIG.retour.k, '1')).toBe(-1);
    expect(compare(FIG.contour.k, '1')).toBe(-1);
    expect(compare(FIG.gabarit.k, '1')).toBe(1);
  });

  it('writes only true relations in what the class reads, every formula in LaTeX', () => {
    const count = allTrue(steps.flatMap((s) => [s.text, s.after].filter(Boolean)));
    expect(count).toBeGreaterThanOrEqual(12);
    for (const s of steps) for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*÷]/);
  });

  it('P1: the tracé’s sides are ranked and the three quotients are equal; P2: the third angle of each is 180 minus the two; P3: the pairing is by rank', () => {
    const t = step('gabarit').after;
    expect(t).toContain('$\\dfrac{2{,}4}{2} = \\dfrac{6}{5}$');
    expect(t).toContain('$\\dfrac{9{,}6}{8} = \\dfrac{6}{5}$');
    // the angles: 180 − 46 − 56 = 78 and 180 − 46 − 78 = 56 (the same three angles); 180 − 46 − 61 = 73 (one in common)
    expect(step('angles-1').after).toContain('$180 - 46 - 56 = 78$');
    expect(step('angles-1').after).toContain('$180 - 46 - 78 = 56$');
    expect(step('angles-2').after).toContain('$180 - 46 - 56 = 78$');
    expect(step('angles-2').after).toContain('$180 - 46 - 61 = 73$');
    expect(common(['46', '56', '78'], ['46', '56', '78'])).toBe(3);
    expect(common(['46', '56', '78'], ['46', '61', '73'])).toBe(1);
    // the pairing: [AB] is the middle side of ABC; its homologue is the middle side of DEF, [DF]
    expect(step('appariement').after).toContain('$[DF]$');
    expect(step('appariement').question).toMatch(/homologue du côté AB/);
    // the roofs: the two feet make the same angle and each has a right angle — the pairing is by the angles
    expect(step('rampes').after).toMatch(/angle droit et le même angle au pied/);
  });

  it('speaks of lengths, angles and numbers — never a plank’s word, never « faux »', () => {
    expect(stringsIn(SCRIPT).join(' ')).not.toMatch(/planche|s’effondre|\bfaux\b|\berreur\b/i);
    expect(stringsIn(MEMO).join(' ')).not.toMatch(/planche|s’effondre|\bfaux\b/i);
    for (const s of asks) expect(askWords(s).card, s.id).toMatch(/^(Longueur|Nombre)$/);
    for (const s of asks) expect(askWords(s).held, s.id).toMatch(/^(Elle|Il) convient$/);
  });

  it('writes French: typography and agreement of every sentence of the script', () => {
    for (const t of stringsIn(SCRIPT)) {
      expect(typographyErrors(t), t).toEqual([]);
      expect(agreementErrors(t), t).toEqual([]);
    }
  });

  it('holds ONE of its numbers a line of code', () => {
    const headline = Object.values(BOARD)
      .flatMap((g) => Object.values(g))
      .filter((x) => String(x).length >= 2);
    for (const file of ['./script.js', './memo.js']) {
      const lines = readFileSync(new URL(file, import.meta.url), 'utf8').split('\n');
      for (const l of lines) {
        const found = headline.filter((x) => new RegExp(`(?<![0-9,/])${x}(?![0-9,/])`).test(l));
        expect(new Set(found).size, `${file}: « ${l.trim()} »`).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('Triangles semblables — the board’s own numbers', () => {
  // the groups of numbers one screen shows together: the station's data, its right number and its errors, its k
  const groups = {
    gabarit: [...FIG.gabarit.data, FIG.gabarit.right, ...Object.values(FIG.gabarit.wrong)],
    contour: [...FIG.contour.data, FIG.contour.right, ...Object.values(FIG.contour.wrong)],
    retour: [R.NP, FIG.retour.right, ...Object.values(FIG.retour.wrong)],
    'angles-1': [N1.A, N1.B, N1.F, FACTS['angles-1'].C, FACTS['angles-1'].E, '134', '124'],
    'angles-2': [N2.A, N2.B, N2.E, FACTS['angles-2'].C, FACTS['angles-2'].F],
    appariement: [...FIG.appariement.data, A.DE, A.EF, A.DF],
    rampes: [...FIG.rampes.data, FIG.rampes.right, ...Object.values(FIG.rampes.wrong)],
    pennant: Object.values(MEMO_FACTS.pennant),
    shadow: Object.values(MEMO_FACTS.shadow),
    exit: Object.values(MEMO_FACTS.exit),
    exitAngles: Object.values(MEMO_FACTS.exitAngles),
    extend: [...Object.values(MEMO.extendCheck.gabarit)],
  };
  const test = JSON.parse(
    readFileSync(
      new URL('../../../../../../../../../../content/class-tests/3e/triangles-semblables.json', import.meta.url),
      'utf8',
    ),
  );
  const items = [...test.start, ...test.end, ...(test.pool ?? [])].map((q) =>
    [
      ...JSON.stringify({ text: q.text, options: q.options })
        .replace(/\{,\}/g, ',')
        .matchAll(/\d+(?:,\d+)?/g),
    ].map((m) => m[0]),
  );
  // every other French lesson's bank and story: a pair of numbers they write together is never ours
  const PRACTICE = new URL('../../../../../../../../../../content/practice/3e/', import.meta.url);
  const banks = readdirSync(PRACTICE)
    .filter((id) => id !== 'triangles-semblables')
    .map((id) => readBank(id));
  const own = existsSync(new URL('triangles-semblables/', PRACTICE)) ? readBank('triangles-semblables') : null;
  const stories = storiesOf({ exceptId: 'triangles-semblables' });
  const clearOf = (nums) => banks.concat(own ? [own] : []).every((b) => collisions(b, nums, { stories }).clear);

  it('uses none of the world’s numbers, and no coefficient the world sails with', () => {
    for (const [id, g0] of Object.entries(groups)) {
      const g = [...new Set(g0.map(write))].filter(tracked);
      for (const x of g) expect(WORLD_NUMBERS, `${id}: ${x} is a number of the world`).not.toContain(x);
    }
    // the coefficients: the template to the tracé, the contour, the way back, the pairing, the roofs, the pennants
    const ks = [
      FIG.gabarit.k,
      FIG.contour.k,
      FIG.retour.k,
      FIG.appariement.k,
      FIG.rampes.k,
      over(MEMO_FACTS.pennant.DE, MEMO_FACTS.pennant.AB),
    ];
    for (const k of ks) for (const wk of WORLD_K) expect(equal(k, wk), `${write(k)} is a k of the world`).toBe(false);
    expect(new Set(ks.map(write)).size).toBe(ks.length);
  });

  it('holds no pair of numbers that another French lesson’s bank, its stories or its class tests write together', () => {
    expect(banks.length).toBeGreaterThanOrEqual(5);
    for (const [id, g0] of Object.entries(groups)) {
      const g = [...new Set(g0.map(write))].filter(tracked);
      for (let i = 0; i < g.length; i += 1) {
        for (let j = i + 1; j < g.length; j += 1) {
          expect(clearOf([g[i], g[j]].map((x) => Number(x.replace(',', '.')))), `${id}: ${g[i]} ; ${g[j]}`).toBe(true);
          for (const it of items)
            expect(it.includes(g[i]) && it.includes(g[j]), `${id}: ${g[i]} ; ${g[j]} in a class-test item`).toBe(false);
        }
        expect(clearOf([Number(g[i].replace(',', '.'))]), `${id}: ${g[i]}`).toBe(true);
      }
    }
  });

  it('names each key with the tablet of the STUDENT’S world: the two keys in order, then the copybook', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    expect(KEYS).toEqual(['cotes-proportionnels', 'angles-egaux']);
    expect(steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets)).toEqual(KEYS);
    for (const s of names) expect(s.recall.length, s.id).toBeGreaterThanOrEqual(2);
  });
});

describe('Triangles semblables — the tablets of the student’s world', () => {
  // the world is written by another agent at the same time: when its tablets exist, the board reads THEM (one wording);
  // until then the scaffold's stub throws on every read, and this check waits (as lesson 2 of the PGCD unit does)
  const mod = Object.values(import.meta.glob('../world/tablets.js', { eager: true }))[0];
  const tablets = (() => {
    try {
      return KEYS.every((k) => mod?.TABLETS?.[k]) ? mod.TABLETS : null;
    } catch {
      return null;
    }
  })();
  const journey = Object.values(import.meta.glob('../world/journey.js', { eager: true }))[0];
  const worldKeys = (() => {
    try {
      return Array.isArray(journey?.KEYS) ? [...journey.KEYS] : null;
    } catch {
      return null;
    }
  })();
  it.skipIf(!worldKeys)('the world’s journey sails the keys in the board’s order', () => {
    expect(worldKeys).toEqual(KEYS);
  });
  it.skipIf(!tablets)('each recall word stands in its tablet’s lines (never inside a formula)', () => {
    for (const s of names) {
      const t = tablets[s.tablet];
      expect(t, s.tablet).toBeTruthy();
      // « Qui s’en souvient ? » blanks the tablet's LINES and list only (LessonBoard.jsx › Name), never its title
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const word of s.recall) expect(text, `${s.tablet}: « ${word} »`).toContain(word);
    }
  });
});

describe('Triangles semblables — the written memo', () => {
  it('has every part of a good lesson plan and runs the four moments in a 45-minute hour', () => {
    expect(partKeys()).toHaveLength(9);
    for (const k of [
      'glance',
      'criteria',
      'openings',
      'phases',
      'anticipated',
      'sequence',
      'written',
      'exit',
      'support',
      'extend',
      'next',
      'connect',
      'stands',
    ])
      expect(MEMO[k], k).toBeTruthy();
    expect(MEMO.title).toBe(SCRIPT.title);
    expect(MEMO.phases.map((p) => p.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.map((m) => m.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.reduce((s, m) => s + m.min, 0)).toBe(45);
    expect(MEMO.phases.map((p) => p.min)).toEqual(MEMO.glance.minutes.map((m) => m.min));
    // one observable criterion per savoir-faire of the lesson (P1, P2, P3, P4); a written line per key at least
    expect(MEMO.criteria).toHaveLength(4);
    expect(MEMO.written.length).toBeGreaterThanOrEqual(KEYS.length);
  });

  it('proposes three openings, the board’s one first, every number of it the board’s', () => {
    expect(MEMO.openings.map((o) => o.id)).toEqual(['gabarit', 'fanions', 'ombres']);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual([step('gabarit').id]);
    const [gabarit, fanions, ombres] = MEMO.openings;
    for (const x of [G.AC, G.AB, G.BC, G.DF, G.EF]) expect(gabarit.story).toContain(x);
    for (const x of ['9', '7,9', '36']) expect(gabarit.expect).toContain(`${x} m`);
    // the pennants: 1,2 ; 1,8 ; 2,1 and a copy whose shortest side is 4 and middle side 6 → the longest side is 2,1 × 4 ÷ 1,2 = 7
    expect(write(over(times('2,1', '4'), '1,2'))).toBe('7');
    expect(write(over(times('1,8', '4'), '1,2'))).toBe('6');
    expect(MEMO_FACTS.pennant.EF).toBe('7');
    expect(fanions.story).toMatch(/1,2.*1,8.*2,1/);
    expect(fanions.story).toMatch(/4 m.*6 m/);
    // the shadows: a stick of 1 m casts 1,2 m; the lamp-post's shadow 7,2 m → 1 × 7,2 ÷ 1,2 = 6 m
    expect(write(over(times('7,2', '1'), '1,2'))).toBe('6');
    expect(MEMO_FACTS.shadow.height).toBe('6');
    expect(ombres.story).toMatch(/1 m.*1,2 m.*7,2 m/);
    expect(ombres.expect).toContain('6 m');
  });

  it('draws each opening with its figure: the template is the board’s, the pennants and the shadows to scale, « ? » on the length asked', () => {
    const [gabarit, fanions, ombres] = MEMO.openings;
    expect(gabarit.figure).toEqual(FIGURES.gabarit);
    for (const o of MEMO.openings) {
      expect(validateGeoFigure(o.figure), o.id).toEqual([]);
      expect(
        seg(o.figure).filter((x) => x.label === ASKED),
        o.id,
      ).toHaveLength(1);
      expect(overlaps(o.figure), o.id).toEqual([]);
      for (const x of seg(o.figure).filter((y) => y.label != null && y.label !== ASKED))
        expect(dist(o.figure, x.from, x.to) / num(x.label), `${o.id}: ${x.from}${x.to}`).toBeCloseTo(1, 9);
    }
    expect(dist(fanions.figure, 'E', 'F')).toBeCloseTo(7, 9);
    expect(dist(ombres.figure, 'D', 'F')).toBeCloseTo(6, 9);
    // the shadows: the two sticks stand upright (a right angle each)
    expect(angleAt(ombres.figure, 'A', 'B', 'C')).toBeCloseTo(90, 6);
    expect(angleAt(ombres.figure, 'D', 'E', 'F')).toBeCloseTo(90, 6);
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward — the wrong ones ARE wrong', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    expect(allTrue(MEMO.anticipated.filter((a) => a.kind === 'right').map((a) => a.says))).toBeGreaterThanOrEqual(2);
    // the misses: their arithmetic is true, their number is not the one asked
    expect(allTrue(MEMO.anticipated.filter((a) => a.kind === 'miss').map((a) => a.says))).toBeGreaterThanOrEqual(2);
    expect(equal(FIG.gabarit.wrong.mix, FIG.gabarit.right)).toBe(false);
    expect(equal(FIG.retour.wrong.not, FIG.retour.right)).toBe(false);
  });

  it('writes only true relations: the glance, the criteria, the written trace, the exit ticket, the extension', () => {
    const texts = [
      ...MEMO.glance.three,
      ...MEMO.criteria.map((c) => c.see),
      MEMO.connect,
      ...MEMO.written,
      ...MEMO.exit.flatMap((e) => [e.q, e.a]),
      ...MEMO.support,
      ...MEMO.extend,
    ];
    expect(allTrue(texts)).toBeGreaterThanOrEqual(10);
    expect(MEMO.exit).toHaveLength(3);
    // exit 1: 3 ; 5,4 ; 8,1 and 5 ; 9 → k = 5/3 and the longest side 8,1 × 5 ÷ 3 = 13,5; exit 2: 180 − 30 − 57 = 93
    expect(write(over(times('8,1', '5'), '3'))).toBe('13,5');
    expect(write(over('9', '5,4'))).toBe('5/3');
    expect(MEMO_FACTS.exit.B3).toBe('13,5');
    expect(MEMO_FACTS.exitAngles.z).toBe('93');
    expect(MEMO.exit[0].a).toContain('13{,}5');
    expect(MEMO.exit[1].a).toContain('93');
    // exit 3: K↔Q, L↔R, so M↔P: the side homologous to [KM] is [QP]
    expect(MEMO.exit[2].a).toContain('[QP]');
    // the extension: the shortest side 6 → 6 × 8 ÷ 2 = 24
    const { gabarit, angles } = MEMO.extendCheck;
    expect(write(over(times(gabarit.shortest, gabarit.BC), gabarit.AC))).toBe('24');
    expect(gabarit.longest).toBe('24');
    expect(angles.z).toBe('93');
  });

  it('writes French to the teacher: typography and agreement of every sentence, « vous » in the phases', () => {
    for (const t of stringsIn(MEMO)) {
      expect(typographyErrors(t), t).toEqual([]);
      expect(agreementErrors(t), t).toEqual([]);
    }
    for (const p of MEMO.phases) expect(`${p.teacher} ${p.watch}`, p.moment).not.toMatch(/\b(tu|ton|ta|tes)\b/);
    expect(MEMO.phases.find((p) => p.moment === 'start').teacher).toMatch(/^Vous /);
  });
});

describe('Triangles semblables — the class test', () => {
  const test = JSON.parse(
    readFileSync(
      new URL('../../../../../../../../../../content/class-tests/3e/triangles-semblables.json', import.meta.url),
      'utf8',
    ),
  );
  const all = [...test.start, ...test.end, ...test.pool];
  const q = (id) => all.find((x) => x.id === id);
  const nu = (s) => read(String(s));
  const angles3 = (two) => {
    const xs = two.map((x) => (x === 'R' ? 90 : Number(x)));
    return [...xs, 180 - xs.reduce((a, b) => a + b, 0)].sort((a, b) => a - b).join(',');
  };
  const rankedOf = (xs) => xs.map(nu).sort((a, b) => compare(a, b));
  const sameSides = (a, b) => {
    const [x, y] = [rankedOf(a), rankedOf(b)];
    return y.every((v, i) => equal(over(v, x[i]), over(y[0], x[0])));
  };
  /** The answer a `check` gives, recomputed apart from the text: a number, a boolean, or the index of the right option. */
  function answerOf(item) {
    const c = item.check;
    if (c.type === 'fourth') {
      const [a, b, x] = [nu(c.a), nu(c.b), nu(c.c)];
      const v = c.at === 'num' ? over(times(a, x), b) : over(times(b, x), a);
      return c.claim != null
        ? equal(v, c.claim)
        : item.kind === 'choice'
          ? item.options.findIndex((o) => equal(o.replace(/[$]/g, '').replace('{,}', ','), v))
          : n(v);
    }
    if (c.type === 'scale') {
      if (c.ask === 'k') {
        const k = over(c.to[0], c.from[0]);
        return item.options.findIndex((o) => equal(o.replace('$\\dfrac{', '').replace('}$', '').replace('}{', '/'), k));
      }
      if (c.ask === 'kind') {
        const k = c.k ? nu(c.k) : over(c.to[0], c.from[0]);
        return compare(k, '1') > 0 ? 0 : 1;
      }
      if (c.ask === 'back') return equal(over('1', c.k), c.claim);
      if (c.ask === 'perimeter')
        return n(
          times(
            c.from.map(nu).reduce((s, v) => plus(s, v)),
            c.k,
          ),
        );
      if (c.ask === 'length') return n(times(c.from[1], over(c.to[0], c.from[0])));
    }
    if (c.type === 'similarSides') {
      if (c.ask === 'same') return sameSides(c.a, c.b);
      if (c.ask === 'longest') {
        const a = rankedOf(c.a);
        return n(over(times(a[2], c.b[0]), a[0]));
      }
      return c.options.findIndex((o) => sameSides(c.a, o));
    }
    if (c.type === 'similarAngles') {
      if (c.ask === 'same') return angles3(c.a) === angles3(c.b);
      if (c.ask === 'third') return 180 - c.b.reduce((s, x) => s + Number(x), 0);
      return c.cases.findIndex(([x, y]) => x.length === 2 && angles3(x) === angles3(y));
    }
    if (c.type === 'homologous') {
      if (c.ask === 'side') {
        const wanted = [...c.side]
          .map((v) => c.map[v])
          .sort()
          .join('');
        return item.options.findIndex((o) => [...o.replace(/[$[\]]/g, '')].sort().join('') === wanted);
      }
      const rest = [...'ABC'].find((v) => !c.map[v]);
      const free = [...'DEF'].find((v) => !Object.values(c.map).includes(v));
      const full = { ...c.map, [rest]: free };
      return item.options.findIndex((o) => o.replace(/[$]/g, '') === full[c.vertex]);
    }
    throw new Error(`unknown check « ${c.type} »`);
  }

  it('has the shape of a default test: start, end and pool, unique ids, teasers paired with their end question', () => {
    expect(test).toMatchObject({ lesson: 'triangles-semblables', grade: '3e', version: 1 });
    expect(test.start).toHaveLength(10);
    expect(test.end).toHaveLength(8);
    expect(test.pool).toHaveLength(8);
    expect(new Set(all.map((x) => x.id)).size).toBe(all.length);
    for (const it of all) {
      expect(getItem(it.item), `${it.id}: ${it.item} is an item of the net`).toBeTruthy();
      expect(['truefalse', 'choice', 'number']).toContain(it.kind);
      expect(it.text, it.id).toBeTruthy();
      expect(it.check, it.id).toBeTruthy();
      if (it.kind === 'number') expect(Number.isInteger(it.answer), it.id).toBe(true);
      if (it.kind === 'truefalse') expect(typeof it.answer, it.id).toBe('boolean');
      if (it.kind === 'choice') {
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
        expect(it.options.length, it.id).toBeLessThanOrEqual(4);
        expect(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < it.options.length, it.id).toBe(true);
        expect(new Set(it.options).size, it.id).toBe(it.options.length);
      }
    }
    // the two teasers come back at the end with other numbers and the same answer
    const teasers = test.start.filter((x) => x.teaser);
    expect(teasers.map((x) => x.id)).toEqual(['s9', 's10']);
    for (const t of teasers) {
      const back = test.end.find((x) => x.pairOf === t.id);
      expect(back, t.id).toBeTruthy();
      expect(back.kind).toBe(t.kind);
      expect(back.check.type).toBe(t.check.type);
      if (t.kind === 'truefalse') expect(back.answer).toBe(t.answer);
      expect(back.text).not.toBe(t.text);
    }
    // the five items of the Algerian test, on two separate triangles: e6, e7, e8 at the end, p2, p5 in the pool
    expect(['e6', 'e7', 'e8', 'p2', 'p5'].map((id) => q(id).check.type)).toEqual(Array(5).fill('scale'));
    expect(['e6', 'e7', 'e8', 'p5'].map((id) => q(id).check.ask)).toEqual(['k', 'kind', 'back', 'kind']);
    expect(q('p2').check.ask).toBe('perimeter');
  });

  it('every answer is recomputed from its check, apart from the text: the stored answer is the computed one', () => {
    for (const it of all) {
      const v = answerOf(it);
      if (it.kind === 'number') expect(v, `${it.id} (${it.item})`).toBe(it.answer);
      else if (it.kind === 'truefalse') expect(v, `${it.id} (${it.item})`).toBe(it.answer);
      else expect(v, `${it.id} (${it.item})`).toBe(it.answer);
    }
    // by hand: 3 × 35 ÷ 7; 56 = 7 × 16 ÷ 2; 6 × 9 ÷ 4; 21 ÷ 3 × 7 … and the six new ones
    expect(q('s1').answer).toBe(15);
    expect(q('s9').answer).toBe(24); // 8 × 15 ÷ 5
    expect(q('e1').answer).toBe(21); // 7 × 9 ÷ 3
    expect(q('p2').answer).toBe(93); // (7 + 9 + 15) × 3
    expect(q('p3').answer).toBe(30); // 180 − 62 − 88
    expect(q('p4').answer).toBe(21); // 9 × 14 ÷ 6
    expect(q('e6').options[q('e6').answer]).toBe('$\\dfrac{3}{7}$'); // 9 ÷ 21
  });

  it('covers the four points of the lesson at the end, and writes French to the student (« tu », never « faux »)', () => {
    const byPoint = {
      P1: ['e1', 'e3'],
      P2: ['e2', 'e4'],
      P3: ['e5'],
      P4: ['e1', 'e6', 'e7', 'e8'],
    };
    for (const ids of Object.values(byPoint))
      for (const id of ids) expect(test.end.some((x) => x.id === id)).toBe(true);
    for (const it of all) {
      for (const t of [it.text, ...(it.options ?? [])]) {
        expect(typographyErrors(t.replace(/\$[^$]*\$/g, ' ')), t).toEqual([]);
        expect(t, t).not.toMatch(/\bfaux\b/i);
      }
    }
  });
});
