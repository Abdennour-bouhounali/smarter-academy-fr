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
} from './lessonScripts';

describe('حصّة القسم — the rules revised before the lesson', () => {
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

  it('gives one card per rule of the tools that have a family, the core الكفاءة first', () => {
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

  it('puts first the الكفاءة the class missed most in the start test, with its count', () => {
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

describe('حصّة القسم — the helpers of a script', () => {
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
    expect(classRuleText({ q: 'r', c: 'zero' })).toBe('يثبت الجسر عندما: باقي قسمة طول الهوّة على طول اللوح يساوي 0.');
    expect(missingEvidence(classLog(classLog([], { a: 15, b: 3 }), { a: 16, b: 3 }))).toBe('more');
  });
  it('speaks in the voice of the class and writes only true equalities', () => {
    expect(classExplain({ q: 'r', c: 'zero' }, 18, 4)).toBe(
      'باقي قسمة 18 على 4 هو 2، و 2 لا يساوي 0: قاعدتنا تقول إنّ الجسر ينهار.',
    );
    expect(classExplain({ q: 'b', c: 'even' }, 15, 4)).toContain('قاعدتنا تقول إنّ الجسر يثبت');
    expect(equalityOf({ a: 42, b: 4, q: 10, r: 2 })).toBe('42 = 4 \\times 10 + 2');
    expect(equalityOf({ a: 42, b: 6, q: 7, r: 0 })).toBe('42 = 6 \\times 7');
    expect([1, 2, 8, 10, 11, 143].map(cellsOf)).toEqual([
      'خانة واحدة',
      'خانتان',
      '8 خانات',
      '10 خانات',
      '11 خانة',
      '143 خانة',
    ]);
    expect(proofOf('a_divides_b', 120, 6)).toBe('لوح طوله 120 لا يدخل في هوّة من 6 خانات.');
    expect([1, 2, 3, 11].map(leftCells)).toEqual(['بقيت خانة واحدة', 'بقيت خانتان', 'بقيت 3 خانات', 'بقيت 11 خانة']);
    for (const form of Object.keys(FORMS)) expect(proofOf(form, 120, 6), form).toMatch(/120/);
    expect(proofOf('b_divides_a', 120, 6)).toBe('$120 = 6 \\times 20$: الباقي 0.');
    expect(proofOf('b_multiple_of_a', 120, 6)).toContain('240');
  });
  it('hides the words to recall, never a formula; the class log keeps the last LOG_MAX bridges', () => {
    expect(blanks('$b$ قاسم للعدد $a$ معناه', ['قاسم'])).toEqual([
      { t: 'math', v: '$b$' },
      { t: 'text', v: ' ' },
      { t: 'blank', v: 'قاسم' },
      { t: 'text', v: ' للعدد ' },
      { t: 'math', v: '$a$' },
      { t: 'text', v: ' معناه' },
    ]);
    expect(blanks('لا شيء', [])).toEqual([{ t: 'text', v: 'لا شيء' }]);
    let long = [];
    for (let b = 2; b <= 12; b += 1) long = classLog(long, { a: 60, b });
    expect(long).toHaveLength(LOG_MAX);
    expect(long.at(-1).b).toBe(12);
  });
});

describe('حصّة القسم — the rail of a script', () => {
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

describe('حصّة القسم — a long tablet is drawn dense on its naming card', () => {
  const t = (words, list = []) => ({ lines: [words], list, notes: [], math: [] });
  it('five list items, or more words than DENSE_WORDS (a formula counts four)', () => {
    expect(denseTablet(t('قصير'))).toBe(false);
    expect(denseTablet(t('ق', ['1', '2', '3', '4', '5']))).toBe(true);
    expect(denseTablet(t('ك'.repeat(DENSE_WORDS + 1)))).toBe(true);
    expect(denseTablet(t(`${'ك'.repeat(DENSE_WORDS - 10)} $\\sqrt{123456789}$`))).toBe(false);
    // a fraction of two storeys in its words is taller than a line (lesson 2 of « قصر الساحات », its first tablet)
    const tall = `${'ك'.repeat(DENSE_WORDS - 30)} $\\dfrac{144}{25}$ $\\dfrac{12}{5}$`;
    expect(denseTablet(t(tall))).toBe(true);
    expect(denseTablet(t(tall.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1')))).toBe(false);
  });
});
