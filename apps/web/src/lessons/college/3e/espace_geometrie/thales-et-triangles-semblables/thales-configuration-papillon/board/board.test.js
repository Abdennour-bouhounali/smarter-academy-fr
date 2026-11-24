import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SCRIPT, BOARD, KEYS, FIGURES, FACTS, ASKED } from './script';
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

/** « La leçon au tableau » of `thales-configuration-papillon`: every length the board and the memo say is computed here. */
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
// (a segment « AM ») is skipped; relations =, \neq, <, > between the numeric sides ──
/** Reads one side; null when it holds a letter (a segment's name) or anything the board does not write. */
function sideValue(src) {
  const s = src
    .replace(/\{,\}/g, ',')
    .replace(/\\times/g, '*')
    .replace(/\\dfrac/g, '§');
  if (/[A-Za-z\\]/.test(s)) return null;
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

/** The words of each key's NAME (its id, its tablet's title): none may stand on the board before its naming station. */
const FORBIDDEN = {
  papillon: ['papillon', 'autre côté du sommet'],
  'calcul-depuis-le-sommet': ['part du sommet', 'depuis le sommet', 'chaque longueur', 'recoll', 'celui d’en face'],
};
/**
 * The world's numbers, group by group (UNIT_3E_THALES_DESIGN.md § 3 — duplicated here until `world/math.js` exports
 * them): no pair of one group stands in one station. Integers under 10 are in every sheet and are not tracked.
 */
const WORLD_GROUPS = [
  ['72', '9', '52', '416', '81', '468', '6,5'],
  ['99', '2,75', '2,5'],
  ['4', '7', '6', '10,5', '8', '14', '6,5', '11,5'],
  ['5', '7,5', '8', '12', '9', '13,5', '4', '2,5', '4,5'],
  ['4,2', '7', '5,1', '9', '8,5', '5,4'],
  ['2', '4', '6', '4,5', '13,5', '9', '5,5', '16,5', '8,25', '49,5'],
  ['9', '11', '5', '22,5', '27,5', '12,5', '31,5', '38,5', '17,5'],
  ['4', '10', '5', '4,5', '6', '7,5', '3', '12,5', '1,8'],
  ['2', '3', '104', '115', '219', '230', '146', '177', '292', '0,5', '0,25', '73', '133', '584'],
];
/** The coefficients the world sails with (design § 3): the board's are others. */
const WORLD_K = ['4/7', '2/3', '3/5', '1/3', '2/5', '1/8', '1/584', '1/36'];
const tracked = (x) => read(x).d !== 1n || compare(x, '10') >= 0;
const worldPair = (g) =>
  WORLD_GROUPS.find((wg) => {
    const hit = [...new Set(g.map(write))].filter(tracked).filter((x) => wg.some((y) => equal(x, y)));
    return hit.length >= 2;
  }) ?? null;

/** Each station re-computed from BOARD alone — the right length and the error each other card makes. */
const { rues: R, ciseaux: X, ferme: T, jardin: J, sentiers: P } = BOARD;
const FIG = (() => {
  const ruAC = plus(R.OA, R.OC);
  const ciAC = plus(X.OA, X.OC);
  const feAB = plus(T.AE, T.EB);
  const jaOC = minus(J.AC, J.OA);
  const seOD = over(times(P.OB, P.OC), P.OA);
  return {
    rues: {
      right: over(times(R.OB, R.OC), R.OA),
      wrong: { crossed: over(times(R.OB, R.OA), R.OC), across: over(times(R.OB, ruAC), R.OA) },
      data: [R.OA, R.OC, R.OB, ruAC],
    },
    ciseaux: {
      right: over(times(X.CD, X.OA), X.OC),
      wrong: { across: over(times(X.CD, X.OA), ciAC), difference: minus(X.CD, minus(X.OC, X.OA)) },
      data: [X.OA, X.OC, X.CD, ciAC],
    },
    ferme: {
      right: over(times(T.EF, feAB), T.AE),
      wrong: { piece: over(times(T.EF, T.EB), T.AE), sum: plus(T.EF, T.EB) },
      data: [T.AE, T.EB, T.EF, feAB],
    },
    jardin: {
      right: over(times(J.AB, jaOC), J.OA),
      wrong: { across: over(times(J.AB, J.AC), J.OA), difference: plus(J.AB, minus(jaOC, J.OA)) },
      data: [J.OA, J.AC, J.AB, jaOC],
    },
    sentiers: {
      right: plus(P.OB, seOD),
      wrong: { stopped: seOD, otherPath: plus(P.OB, P.OC) },
      data: [P.OA, P.OC, P.OB],
    },
  };
})();
/** The lengths each figure writes: the station's data, as written (the one asked is « ? »). */
const GIVEN = {
  rues: [R.OA, R.OC, R.OB],
  ciseaux: [X.OA, X.OC, X.CD],
  ferme: [T.AE, T.EB, T.EF],
  jardin: [J.OA, J.AC, J.AB],
  sentiers: [P.OA, P.OC, P.OB],
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
/** Are A, B, C on one line? */
const aligned = (fig, a, b, c) => {
  const [p, q, r] = [a, b, c].map((k) => fig.points[k]);
  return Math.abs((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
};

describe('Thalès dans le papillon — the evaluator of the board’s formulas', () => {
  it('says the truth on hand-worked cases', () => {
    expect(holds('OD = \\dfrac{8 \\times 18{,}8}{4{,}7} = 32')).toBe(true);
    expect(holds('OD = \\dfrac{8 \\times 18{,}8}{4{,}7} = 30')).toBe(false);
    expect(holds('OC = 30{,}6 - 10{,}8 = 19{,}8')).toBe(true);
    expect(holds('\\dfrac{OD}{OB} = \\dfrac{OC}{OA}')).toBe(null);
    expect(holds('\\dfrac{2}{7} \\neq \\dfrac{1}{4}')).toBe(true);
  });
});

describe('Thalès dans le papillon — the script of the lesson on the board', () => {
  it('uses only the kinds it needs, unique ids, a chapter, a short cue, and ONE copybook page', () => {
    expect(steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(steps.length).toBeLessThanOrEqual(14);
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
    for (const s of steps) {
      expect(s.chapter, s.id).toBeTruthy();
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
      // the cue is plain text in the footer, the question and the title plain text above the cards
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
      for (const k of ['cue', 'question', 'title', 'text', 'after'])
        expect((s[k] ?? '').replace(/\$[^$]+\$/g, ''), `${s.id}.${k}`).not.toMatch(/\d\s*\/\s*\d/);
    }
    expect(steps[0].kind).toBe('ask');
    expect(steps.at(-1).kind).toBe('trace');
    expect(groupsOf(SCRIPT)).toHaveLength(KEYS.length + 1); // one group per key and ONE copybook group
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

  it('every ask’s answer is the right length, computed from the figure — the one card the board says agrees', () => {
    expect(asks.map((s) => s.id)).toEqual(['rues', 'ciseaux', 'ferme', 'jardin', 'sentiers']);
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
      // the other cards are the errors the lesson fights, each computed, each whole, each another length
      const wrong = Object.values(f.wrong).map(n);
      expect(
        [...s.options].sort((x, y) => x - y),
        s.id,
      ).toEqual([n(f.right), ...wrong].sort((x, y) => x - y));
      for (const v of [f.right, ...Object.values(f.wrong)]) expect(read(v).d, `${s.id}: a whole length`).toBe(1n);
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.options.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.options.length, s.id).toBeLessThanOrEqual(6);
      expect(s.after, s.id).toContain('$');
    }
    // the right card is not always in the same place
    expect(new Set(asks.map((s) => s.options.indexOf(s.answer[0]))).size).toBeGreaterThanOrEqual(2);
    // the values, by hand: 8 × 18,8 ÷ 4,7; 20,8 × 28 ÷ 44,8; 2 × 8,4 ÷ 2,4; 24 × 19,8 ÷ 10,8; 35 + 35 × 29 ÷ 20,3
    expect(asks.map((s) => s.answer[0])).toEqual([32, 13, 7, 44, 85]);
    expect(FACTS.rues).toMatchObject({ OD: '32', crossed: '2', across: '40', AC: '23,5' });
    expect(FACTS.ciseaux).toMatchObject({ AB: '13', across: '8', difference: '4', AC: '72,8' });
    expect(FACTS.ferme).toMatchObject({ AB: '8,4', BC: '7', piece: '5', sum: '8' });
    expect(FACTS.jardin).toMatchObject({ OC: '19,8', CD: '44', across: '68', difference: '33' });
    expect(FACTS.sentiers).toMatchObject({ OD: '50', BD: '85', other: '64' });
  });

  it('every ask CARRIES its figure: drawn to scale, its parallels parallel, its given lengths and « ? » on the one asked', () => {
    for (const s of asks) {
      const fig = s.figure;
      expect(fig, s.id).toBe(FIGURES[s.id]);
      expect(validateGeoFigure(fig), s.id).toEqual([]);
      const given = seg(fig).filter((x) => x.label != null && x.label !== ASKED);
      expect(given.map((x) => x.label).sort(), s.id).toEqual(GIVEN[s.id].map(String).sort());
      for (const x of given)
        expect(dist(fig, x.from, x.to) / num(x.label), `${s.id}: ${x.from}${x.to}`).toBeCloseTo(1, 9);
      const par = seg(fig).filter((x) => x.arrows);
      expect(par.length, s.id).toBe(2);
      const dir = (x) => [0, 1].map((k) => fig.points[x.to][k] - fig.points[x.from][k]);
      const [u, v] = par.map(dir);
      expect(u[0] * v[1] - u[1] * v[0], s.id).toBeCloseTo(0, 6);
      const asked = seg(fig).filter((x) => x.label === ASKED);
      expect(asked, s.id).toHaveLength(1);
      // measured on the drawing, the length asked IS the answer
      expect(dist(fig, asked[0].from, asked[0].to), s.id).toBeCloseTo(s.answer[0], 9);
      // its words say what the figure cannot: no length is written in its text
      expect(
        formulas(s.text).filter((f) => /\d/.test(f)),
        s.id,
      ).toEqual([]);
      expect(s.text.length, s.id).toBeLessThanOrEqual(140);
    }
    // the butterflies: each length's partner on the same line through O, beyond O
    for (const id of ['rues', 'ciseaux', 'jardin', 'sentiers']) {
      const fig = FIGURES[id];
      expect(aligned(fig, 'A', 'O', 'C'), id).toBeCloseTo(0, 6);
      expect(aligned(fig, 'B', 'O', 'D'), id).toBeCloseTo(0, 6);
      // O lies BETWEEN A and C, and between B and D
      expect(dist(fig, 'A', 'O') + dist(fig, 'O', 'C'), id).toBeCloseTo(dist(fig, 'A', 'C'), 9);
      expect(dist(fig, 'B', 'O') + dist(fig, 'O', 'D'), id).toBeCloseTo(dist(fig, 'B', 'D'), 9);
    }
    // the scissors are symmetric: OB = OA, OD = OC
    expect(dist(FIGURES.ciseaux, 'O', 'B')).toBeCloseTo(num(X.OA), 9);
    expect(dist(FIGURES.ciseaux, 'O', 'D')).toBeCloseTo(num(X.OC), 9);
  });

  it('draws each figure for the back of the class: labels of 18 px at 1366 × 768, beside the cards, none on another', () => {
    for (const s of asks) {
      const f = boardFigure(s.figure);
      expect(f.label, s.id).toBeGreaterThanOrEqual(BOARD_LABEL_PX);
      expect(f.width, s.id).toBeLessThanOrEqual(500);
      expect(f.height, s.id).toBeLessThanOrEqual(480);
      expect(overlaps(s.figure), s.id).toEqual([]);
    }
  });

  it('draws possible figures, the traps visibly far from the truth', () => {
    // the roof: a real triangle, E on [AB]; the rafters 8,4, the floor beam 7
    expect(compare(T.AE, plus(T.AE, T.EB))).toBe(-1);
    expect(compare(FIG.ferme.right, times('2', plus(T.AE, T.EB)))).toBe(-1);
    // the garden: AC is longer than OA (O between A and C)
    expect(compare(J.OA, J.AC)).toBe(-1);
    // the length across O, taken as a term, always gives too long a length; the crossed partner, here, too short
    expect(compare(FIG.rues.wrong.across, FIG.rues.right)).toBe(1);
    expect(compare(FIG.jardin.wrong.across, FIG.jardin.right)).toBe(1);
    expect(compare(FIG.rues.wrong.crossed, FIG.rues.right)).toBe(-1);
    // stopping at the crossing gives a part of the path, shorter than the whole
    expect(compare(FIG.sentiers.wrong.stopped, FIG.sentiers.right)).toBe(-1);
  });

  it('writes only true relations in what the class reads, every formula in LaTeX', () => {
    const count = allTrue(steps.flatMap((s) => [s.text, s.after].filter(Boolean)));
    expect(count).toBeGreaterThanOrEqual(14);
    for (const s of steps) for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*÷]/);
  });

  it('K1’s second station carries the brevet’s sentence: both alignments, the parallel, then the three ratios', () => {
    const t = step('ciseaux').after;
    expect(t).toContain('Les points $A$, $O$, $C$ sont alignés, ainsi que les points $B$, $O$, $D$');
    expect(t).toContain('les droites $(AB)$ et $(CD)$ sont parallèles');
    expect(t).toContain('D’après le théorème de Thalès');
    expect(t).toContain('$\\dfrac{OA}{OC} = \\dfrac{OB}{OD} = \\dfrac{AB}{CD}$');
    // the half-turn that brings the butterfly back to 4e's figure (the programme's proof) is said at the first station
    expect(step('rues').after).toMatch(/demi-tour autour de \$O\$/);
  });

  it('speaks of lengths — never a plank’s word, never « faux »', () => {
    expect(stringsIn(SCRIPT).join(' ')).not.toMatch(/planche|s’effondre|\bfaux\b|\berreur\b/i);
    expect(stringsIn(MEMO).join(' ')).not.toMatch(/planche|s’effondre|\bfaux\b/i);
    for (const s of asks)
      expect(askWords(s), s.id).toEqual({ card: 'Longueur', held: 'Elle convient', fell: 'Elle ne convient pas' });
  });

  it('writes French: typography and agreement of every sentence of the script', () => {
    for (const t of stringsIn(SCRIPT)) {
      expect(typographyErrors(t), t).toEqual([]);
      expect(agreementErrors(t), t).toEqual([]);
    }
  });

  it('holds ONE of its numbers a line of code, and uses its OWN numbers: none of the bank, the class test, a story, the world', () => {
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
    const bank = readBank('thales-configuration-papillon');
    const stories = storiesOf({ exceptId: 'thales-configuration-papillon' });
    const test = JSON.parse(
      readFileSync(
        new URL(
          '../../../../../../../../../../content/class-tests/3e/thales-configuration-papillon.json',
          import.meta.url,
        ),
        'utf8',
      ),
    );
    const items = [...(test.start ?? []), ...(test.end ?? []), ...(test.pool ?? [])].map((q) =>
      [
        ...JSON.stringify({ ...q, check: undefined })
          .replace(/\{,\}/g, ',')
          .matchAll(/\d+(?:,\d+)?/g),
      ].map((m) => m[0]),
    );
    const groups = {
      ...Object.fromEntries(
        Object.entries(FIG).map(([id, f]) => [id, [...f.data, f.right, ...Object.values(f.wrong)]]),
      ),
      tent: Object.values(MEMO_FACTS.tent),
      ladders: Object.values(MEMO_FACTS.ladders),
      exit: Object.values(MEMO_FACTS.exit),
      exitAcross: Object.values(MEMO_FACTS.exitAcross),
      farther: Object.values(MEMO.extendCheck.farther),
      wider: Object.values(MEMO.extendCheck.wider),
    };
    for (const [id, g0] of Object.entries(groups)) {
      const g = [...new Set(g0.map(write))].filter(tracked);
      for (let i = 0; i < g.length; i += 1) {
        for (let j = i + 1; j < g.length; j += 1) {
          const c = collisions(
            bank,
            [g[i], g[j]].map((x) => Number(x.replace(',', '.'))),
            { stories },
          );
          expect(c.clear, `${id}: ${g[i]} ; ${g[j]} (the bank or a story)`).toBe(true);
          for (const it of items)
            expect(it.includes(g[i]) && it.includes(g[j]), `${id}: ${g[i]} ; ${g[j]} in a class-test item`).toBe(false);
        }
        expect(collisions(bank, [Number(g[i].replace(',', '.'))], { stories }).clear, `${id}: ${g[i]}`).toBe(true);
      }
      expect(worldPair(g0), `${id}: a pair of the world`).toBe(null);
    }
    // the coefficients of the board are none the world sails with, and no two stations share one
    const ks = [
      over(R.OA, R.OC),
      over(X.OA, X.OC),
      over(T.AE, plus(T.AE, T.EB)),
      over(J.OA, minus(J.AC, J.OA)),
      over(P.OA, P.OC),
    ];
    for (const k of ks) for (const wk of WORLD_K) expect(equal(k, wk), `${write(k)} is a k of the world`).toBe(false);
    expect(new Set(ks.map(write)).size).toBe(ks.length);
  });

  it('names each key with the tablet of the STUDENT’S world: the two keys in order, then the copybook', () => {
    expect(names.map((s) => s.tablet)).toEqual(KEYS);
    expect(KEYS).toEqual(['papillon', 'calcul-depuis-le-sommet']);
    expect(steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets)).toEqual(KEYS);
    for (const s of names) expect(s.recall.length, s.id).toBeGreaterThanOrEqual(2);
  });
});

describe('Thalès dans le papillon — the tablets of the student’s world', () => {
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

describe('Thalès dans le papillon — the written memo', () => {
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
    // one observable criterion per savoir-faire of the lesson (P1, P2, P3); a written line per key at least
    expect(MEMO.criteria).toHaveLength(3);
    expect(MEMO.written.length).toBeGreaterThanOrEqual(KEYS.length);
  });

  it('proposes three openings, the board’s one first, every number of it the board’s', () => {
    expect(MEMO.openings.map((o) => o.id)).toEqual(['rues', 'tente', 'echelles']);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual([step('rues').id]);
    const [rues, tent, ladders] = MEMO.openings;
    for (const x of [R.OA, R.OC, R.OB]) expect(rues.story).toContain(x);
    for (const x of ['32', '2', '40', '23,5']) expect(rues.expect).toContain(`${x} m`);
    // the tent: a stick of 1,1 at 1,3 from the peg, the pole at 5,2 → 4,4 m; the ladders: 2, 5 and 1,6 → 4 m, the ladder 7 m
    expect(write(over(times('1,1', '5,2'), '1,3'))).toBe('4,4');
    expect(MEMO_FACTS.tent.BC).toBe('4,4');
    expect(tent.story).toMatch(/5,2.*1,3.*1,1/);
    expect(tent.expect).toContain('4,4 m');
    expect(write(over(times('1,6', '5'), '2'))).toBe('4');
    expect(MEMO_FACTS.ladders).toMatchObject({ CD: '4', AC: '7' });
    expect(ladders.story).toMatch(/2 m.*5 m.*1,6 m/);
    expect(ladders.expect).toContain('4 m');
  });

  it('draws each opening with its figure: the streets are the board’s, the tent and the ladders to scale, « ? » on the length asked', () => {
    const [rues, tent, ladders] = MEMO.openings;
    expect(rues.figure).toEqual(FIGURES.rues);
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
    expect(dist(tent.figure, 'B', 'C')).toBeCloseTo(4.4, 9);
    expect(dist(ladders.figure, 'D', 'C')).toBeCloseTo(4, 9);
    // the ladders: O on both ladders, the two walls upright (parallel)
    expect(aligned(ladders.figure, 'A', 'O', 'C')).toBeCloseTo(0, 6);
    expect(aligned(ladders.figure, 'B', 'O', 'D')).toBeCloseTo(0, 6);
    expect(ladders.figure.points.A[0]).toBe(ladders.figure.points.B[0]);
    expect(ladders.figure.points.C[0]).toBe(ladders.figure.points.D[0]);
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
    // the misses: their arithmetic is true, their length is not the one asked
    expect(allTrue(MEMO.anticipated.filter((a) => a.kind === 'miss').map((a) => a.says))).toBeGreaterThanOrEqual(3);
    expect(equal(FIG.rues.wrong.crossed, FIG.rues.right)).toBe(false);
    expect(equal(FIG.jardin.wrong.across, FIG.jardin.right)).toBe(false);
    expect(equal(FIG.sentiers.wrong.stopped, FIG.sentiers.right)).toBe(false);
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
    // exit 1: GH = 2,7 × 8 ÷ 3; exit 2: OC = 9 − 4, OD = 2,8 × 5 ÷ 4; exit 3: the sentence, its two alignments
    expect(write(over(times('2,7', '8'), '3'))).toBe('7,2');
    expect(MEMO_FACTS.exit.GH).toBe('7,2');
    expect(MEMO_FACTS.exitAcross).toMatchObject({ OC: '5', OD: '3,5' });
    expect(MEMO.exit[2].a).toMatch(/K\$, \$P\$, \$M\$ sont alignés, ainsi que les points \$L\$, \$P\$, \$N\$/);
    // the extension: the second avenue twice as far → OD twice as long; the scissors opened to 41,6 mm → 26 mm
    const { farther, wider } = MEMO.extendCheck;
    expect(farther.OC).toBe(write(times(R.OC, '2')));
    expect(farther.OD).toBe(write(times(FIG.rues.right, '2')));
    expect(write(over(times(wider.CD, wider.OA), wider.OC))).toBe('26');
    expect(wider.AB).toBe('26');
  });

  it('writes French to the teacher: typography and agreement of every sentence, « vous » in the phases', () => {
    for (const t of stringsIn(MEMO)) {
      expect(typographyErrors(t), t).toEqual([]);
      expect(agreementErrors(t), t).toEqual([]);
    }
    // the questions he asks a student say « tu »: those are the student's; the phases speak to the teacher
    for (const p of MEMO.phases) expect(`${p.teacher} ${p.watch}`, p.moment).not.toMatch(/\b(tu|ton|ta|tes)\b/);
    expect(MEMO.phases.find((p) => p.moment === 'start').teacher).toMatch(/^Vous /);
  });
});
