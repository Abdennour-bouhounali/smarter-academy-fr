import { describe, it, expect } from 'vitest';
import {
  reviewCards,
  classLog,
  readyToConclude,
  missingEvidence,
  FORMS,
  fills,
  askRight,
  classExplain,
  classRuleText,
  equalityOf,
  leftCells,
  proofOf,
  blanks,
  railOf,
  groupsOf,
  LOG_MAX,
  cellsOf,
  denseTablet,
  DENSE_WORDS,
  ladderStart,
  ladderLay,
  ladderUndo,
  ladderDone,
  ladderRow,
  ladderRack,
  ladderSheet,
  ladderNoZero,
  ladderTex,
  rungTex,
  fellTex,
  rowGroups,
  groupText,
  productTex,
  ladderCells,
  ladderBreaks,
} from './lessonScripts';
import { QUANTITIES, CONDITIONS } from '../../lessons/common/gameworld/divisorIsles/ruleForge';

// The tiles' words belong to the world (`ruleForge.js`, the Engine's file): the board's sentence is built around them.
const tile = (list, id) => list.find((x) => x.id === id);

describe('séance en classe — the rules revised before the lesson', () => {
  // A neutral fixture in the shape of the net's tools and of the launch kit's families (both empty until Stage 2).
  const tools = [
    { id: '6e.t1.r01', grade: '6e', weight: 'core', lesson: { title: 'Leçon A' } },
    { id: '6e.t1.r02', grade: '6e', weight: 'support', lesson: { title: 'Leçon B' } },
    { id: '6e.t1.r03', grade: '6e', weight: 'core', lesson: { title: 'Leçon C' } },
  ];
  const families = {
    '6e.t1.r01': {
      name: 'Famille A',
      icon: '➗',
      rules: [
        { id: 'a1', title: 'Règle A1' },
        { id: 'a2', title: 'Règle A2' },
      ],
    },
    '6e.t1.r02': { name: 'Famille B', icon: '✖️', rules: [{ id: 'b1', title: 'Règle B1' }] },
  };

  it('gives one card per rule of the tools that have a family, the core savoir-faire first', () => {
    const cards = reviewCards(tools, families);
    expect(cards.map((c) => c.id)).toEqual(['a1', 'a2', 'b1']);
    expect(cards[0]).toMatchObject({
      item: '6e.t1.r01',
      family: 'Famille A',
      weight: 'core',
      score: null,
      lesson: 'Leçon A',
      grade: '6e',
    });
  });

  it('puts first the savoir-faire the class missed most in the start test, with its count', () => {
    const cards = reviewCards(tools, families, [
      { item: '6e.t1.r01', right: 3, total: 4 },
      { item: '6e.t1.r02', right: 1, total: 4 },
    ]);
    expect(cards[0].item).toBe('6e.t1.r02');
    expect(cards[0].score).toEqual({ right: 1, total: 4 });
    expect(cards.at(-1).item).toBe('6e.t1.r01');
    expect(reviewCards(tools, {}, null)).toEqual([]); // a lesson whose prerequisites have no rule cards: nothing to revise
  });
});

describe('séance en classe — the helpers of a script', () => {
  it('lets the class conclude only on its own evidence: four bridges, one that held, one that crumbled', () => {
    let log = [];
    for (const c of [
      { a: 15, b: 3 },
      { a: 16, b: 4 },
      { a: 42, b: 6 },
    ])
      log = classLog(log, c);
    expect(readyToConclude(log)).toBe(false);
    expect(missingEvidence(log)).toBe('fell'); // three bridges, all held
    log = classLog(log, { a: 16, b: 3 });
    expect(readyToConclude(log)).toBe(true);
    expect(missingEvidence(log)).toBe(null);
    expect(log.at(-1)).toMatchObject({ a: 16, b: 3, r: 1, held: false });
    expect(classLog(log, { a: 15, b: 3 })).toHaveLength(4); // the same bridge built again is not a new line
    expect(missingEvidence([])).toBe('held');
    expect(classRuleText({ q: 'r', c: 'zero' })).toBe(
      `Le pont tient quand : ${tile(QUANTITIES, 'r').label} ${tile(CONDITIONS, 'zero').label}.`,
    );
    expect(missingEvidence(classLog(classLog([], { a: 15, b: 3 }), { a: 16, b: 3 }))).toBe('more');
  });
  it('speaks in the voice of the class and writes only true equalities', () => {
    const short = tile(QUANTITIES, 'r').short(18, 4);
    expect(classExplain({ q: 'r', c: 'zero' }, 18, 4)).toBe(
      `${short.charAt(0).toUpperCase()}${short.slice(1)} vaut 2, et 2 ${tile(CONDITIONS, 'zero').no} : notre règle dit que le pont s’effondre.`,
    );
    expect(classExplain({ q: 'b', c: 'even' }, 15, 4)).toContain('notre règle dit que le pont tient');
    expect(equalityOf({ a: 42, b: 4, q: 10, r: 2 })).toBe('42 = 4 \\times 10 + 2');
    expect(equalityOf({ a: 42, b: 6, q: 7, r: 0 })).toBe('42 = 6 \\times 7');
    // the count and its noun never split across two lines (U+00A0)
    expect([0, 1, 2, 8, 11, 143].map(cellsOf)).toEqual([
      '0 case',
      '1 case',
      '2 cases',
      '8 cases',
      '11 cases',
      '143 cases',
    ]);
    expect(proofOf('a_divides_b', 120, 6)).toBe('Une planche de 120 n’entre pas dans un fossé de 6 cases.');
    expect([1, 2, 3, 11].map(leftCells)).toEqual([
      'il reste 1 case',
      'il reste 2 cases',
      'il reste 3 cases',
      'il reste 11 cases',
    ]);
    for (const form of Object.keys(FORMS)) expect(proofOf(form, 120, 6), form).toMatch(/120/);
    expect(proofOf('b_divides_a', 120, 6)).toBe('$120 = 6 \\times 20$ : le reste est 0.');
    expect(proofOf('b_multiple_of_a', 120, 6)).toContain('240');
  });
  it('hides the words to recall, never a formula; the class log keeps the last LOG_MAX bridges', () => {
    expect(blanks('$b$ est un diviseur de $a$ signifie', ['diviseur'])).toEqual([
      { t: 'math', v: '$b$' },
      { t: 'text', v: ' est un ' },
      { t: 'blank', v: 'diviseur' },
      { t: 'text', v: ' de ' },
      { t: 'math', v: '$a$' },
      { t: 'text', v: ' signifie' },
    ]);
    expect(blanks('rien', [])).toEqual([{ t: 'text', v: 'rien' }]);
    let long = [];
    for (let b = 2; b <= 12; b += 1) long = classLog(long, { a: 60, b });
    expect(long).toHaveLength(LOG_MAX);
    expect(long.at(-1).b).toBe(12);
  });
});

describe('séance en classe — the rail of a script', () => {
  // A neutral script: two keys found then named, and a copybook of two pages.
  const script = {
    steps: [
      { id: 's1', kind: 'situation', chapter: 'Découvrir' },
      { id: 'k1', kind: 'ask', chapter: 'Découvrir', a: 12, options: [3, 5, 6], answer: [3, 6] },
      { id: 'n1', kind: 'name', chapter: 'Nommer', tablet: 'regle-1' },
      { id: 'k2', kind: 'forge', chapter: 'Découvrir' },
      { id: 'n2', kind: 'name', chapter: 'Nommer', tablet: 'regle-2' },
      { id: 't1', kind: 'trace', chapter: 'Écrire' },
      { id: 't2', kind: 'trace', chapter: 'Écrire' },
    ],
  };

  it('an ask step is right only with all of its answers and nothing else', () => {
    const ask = script.steps[1];
    expect(ask.options.filter((o) => fills(ask, o))).toEqual([3, 6]);
    expect(askRight(ask, [6, 3])).toBe(true);
    expect(askRight(ask, ask.options)).toBe(false);
    expect(askRight(ask, [3])).toBe(false);
  });

  it('one group per key, and ONE group for the copybook whatever its number of pages', () => {
    expect(groupsOf(script).map((g) => [g.kind, g.steps])).toEqual([
      ['name', [0, 1, 2]],
      ['name', [3, 4]],
      ['trace', [5, 6]],
    ]);
    expect(
      railOf(script)
        .filter((r) => r.first)
        .map((r) => r.chapter),
    ).toEqual(['Découvrir', 'Nommer', 'Découvrir', 'Nommer', 'Écrire']);
  });
});

describe('séance en classe — a long tablet is drawn dense on its naming card', () => {
  const t = (words, list = []) => ({ lines: [words], list, notes: [], math: [] });
  it('five list items, or more words than DENSE_WORDS (a formula counts four)', () => {
    expect(denseTablet(t('court'))).toBe(false);
    expect(denseTablet(t('c', ['1', '2', '3', '4', '5']))).toBe(true);
    expect(denseTablet(t('k'.repeat(DENSE_WORDS + 1)))).toBe(true);
    expect(denseTablet(t(`${'k'.repeat(DENSE_WORDS - 10)} $\\sqrt{123456789}$`))).toBe(false);
    // a fraction of two storeys in its words is taller than a line (lesson 2 of the `rootCourts` world, its first tablet)
    const tall = `${'k'.repeat(DENSE_WORDS - 30)} $\\dfrac{144}{25}$ $\\dfrac{12}{5}$`;
    expect(denseTablet(t(tall))).toBe(true);
    expect(denseTablet(t(tall.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1')))).toBe(false);
  });
});

describe('séance en classe — a factor ladder on the board (`ladder`)', () => {
  // a neutral gap of 60 cases (no lesson's): the world's own law, `divisorIsles/factorLadder.js`
  const step = { id: 'l', kind: 'ladder', n: 60, rack: [5, 2, 3, 4, 2], whole: true };

  it('lays a plank: it holds (a rung, the gap becomes the number of planks) or it falls (the gap stays, what it left)', () => {
    let st = ladderStart(60);
    expect(ladderDone(st)).toBe(false);
    st = ladderLay(st, 4);
    expect(st).toMatchObject({ gap: 15, rungs: [{ plank: 4, before: 60, after: 15 }], fell: [] });
    expect(rungTex(st.last)).toBe('60 = 4 \\times 15');
    st = ladderLay(st, 2);
    expect(st).toMatchObject({ gap: 15, fell: [{ plank: 2, q: 7, r: 1 }], last: { held: false, before: 15 } });
    expect(fellTex(15, st.fell[0])).toBe('15 = 2 \\times 7 + 1');
    expect(ladderLay(st, 2).fell).toHaveLength(1); // the same plank tried again on the same gap: one line
    for (const bad of [1, 0, 16, 2.5, NaN]) expect(ladderLay(st, bad), String(bad)).toBe(st); // nothing changes
    st = ladderLay(ladderLay(st, 3), 5);
    expect(ladderDone(st)).toBe(true);
    expect(ladderRow(st)).toEqual([4, 3, 5]);
    expect(ladderTex(st)).toBe('60 = 4 \\times 3 \\times 5');
    expect(ladderLay(st, 2)).toBe(st); // a gap of 1 case takes no plank
    // a plank taken back: the gap is what it was before it
    const back = ladderUndo(st);
    expect(back).toMatchObject({ gap: 5, rungs: [{ plank: 4 }, { plank: 3 }], fell: [], last: null });
    expect(ladderUndo(ladderStart(60))).toEqual(ladderStart(60));
  });

  it('offers its rack once each, the shortest first, and — `whole` — the whole gap', () => {
    expect(ladderRack(step, ladderStart(60))).toEqual([
      { d: 2, whole: false },
      { d: 3, whole: false },
      { d: 4, whole: false },
      { d: 5, whole: false },
      { d: 60, whole: true },
    ]);
    const at5 = ladderLay(ladderLay(ladderStart(60), 4), 3);
    expect(ladderRack(step, at5).at(-1)).toEqual({ d: 5, whole: false }); // the gap IS a plank of the rack: not twice
    expect(ladderRack({ ...step, whole: false }, ladderStart(60)).some((x) => x.whole)).toBe(false);
  });

  it('in sheet mode: the remainders of the gap by the primes up to the stop; « no remainder is 0 » is judged', () => {
    const sheet = { id: 's', kind: 'ladder', n: 1001, sheet: {} };
    let st = ladderStart(1001);
    const lines = ladderSheet(sheet, st);
    expect(lines.map((l) => l.p)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]); // 31² ⩽ 1001 < 37²
    for (const l of lines) expect(l.r).toBe(1001 % l.p);
    expect(ladderNoZero(sheet, st)).toMatchObject({ gap: 1001, rungs: [], zeros: [7, 11, 13] });
    st = ladderLay(ladderLay(st, 7), 11);
    expect(ladderSheet(sheet, st)).toEqual([
      { p: 2, r: 1 },
      { p: 3, r: 1 },
    ]);
    st = ladderNoZero(sheet, st);
    expect(ladderDone(st)).toBe(true);
    expect(ladderRow(st)).toEqual([7, 11, 13]);
    expect(ladderSheet(sheet, st)).toEqual([]);
    expect(ladderSheet({ ...sheet, sheet: { stop: 10 } }, ladderStart(1001)).map((l) => l.p)).toEqual([2, 3, 5, 7]);
  });

  it('under a finished ladder: the planks of its row still laid in shorter planks, never its last rung', () => {
    expect(ladderBreaks([7, 6, 4])).toEqual([
      { p: 4, tex: '4 = 2 \\times 2' },
      { p: 6, tex: '6 = 2 \\times 3' },
    ]);
    expect(ladderBreaks([2, 2, 2, 3, 7])).toEqual([]);
    expect(ladderBreaks([9, 2, 2])).toEqual([{ p: 9, tex: '9 = 3 \\times 3' }]);
    expect(ladderBreaks([1001])).toEqual([{ p: 1001, tex: '1\\,001 = 7 \\times 11 \\times 13' }]);
  });

  it('writes a row counted and a thousand grouped, every count agreed', () => {
    expect(rowGroups([3, 2, 2, 5, 2, 3, 2])).toEqual([
      { p: 2, k: 4 },
      { p: 3, k: 2 },
      { p: 5, k: 1 },
    ]);
    expect(rowGroups([3, 2, 2, 5, 2, 3, 2]).map(groupText)).toEqual([
      '4 planches de 2',
      '2 planches de 3',
      '1 planche de 5',
    ]);
    expect(productTex([7, 11, 2387])).toBe('7 \\times 11 \\times 2\\,387');
    expect([1, 2, 2387].map(ladderCells)).toEqual(['1 case', '2 cases', '2 387 cases']);
  });
});
