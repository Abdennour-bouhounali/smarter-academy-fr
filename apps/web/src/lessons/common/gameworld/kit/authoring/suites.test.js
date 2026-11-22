/**
 * The helpers of the shared suites (`test/suites.js`) and of the Node reader (`test/bank.js`) catch what they claim to:
 * a false equality, a number glued to the wrong form of its noun, a list with a plain space before its comma, a pair a
 * line of the bank chains. A suite whose helper said « fine » to everything would prove nothing.
 */
import { describe, it, expect } from 'vitest';
import {
  NOUNS,
  PROVEN_LIMITS,
  agreementErrors,
  answersOf,
  answersOnLine,
  buildersOf,
  convoyBuilders,
  convoysOf,
  equalitiesHold,
  fractionOf,
  holdsOn,
  looseComma,
  plain,
  said,
  storeHolders,
  stringsIn,
  trueEqualities,
  valueOf,
} from './test/suites.js';
import { alone, bankPairs, collisions, gradeOf, islandNamesIn, pairLines, readBank } from './test/bank.js';
import { range } from './numbers';

describe('the shared suites’ helpers', () => {
  it('a convoy: which planks build every gap with the purse', () => {
    expect(buildersOf([259, 185], 12)).toEqual([37]);
    expect(buildersOf([152, 95, 57])).toEqual([1, 19]);
    expect(buildersOf([152, 95, 57], Infinity, [8, 19, 5, 3])).toEqual([19]);
    expect(buildersOf([27, 0], 1)).toEqual([27]);
  });
  it('a MARKED bridge: a plank holds when it fills the gap AND puts a joint on the post (mark.js)', () => {
    expect(holdsOn({ a: 78, mark: 66 }, 6)).toBe(true);
    expect(holdsOn({ a: 48, mark: 35 }, 3)).toBe(false); // fills 48, the post falls inside a plank
    expect(holdsOn({ a: 48 }, 3)).toBe(true); // the same gap unmarked
    expect(buildersOf([99], 3, range(1, 99), [66])).toEqual([33]);
    expect(buildersOf([99], 3, range(1, 99))).toEqual([33, 99]); // without the post, 99 would build it too
    expect(buildersOf([39], 3, range(1, 39), [13])).toEqual([13]);
  });

  it('catches a marked road that cannot be built, and a store with two options that hold within the purse', () => {
    const island = (n) => ({ name: `جزيرة ${'ابتث'[n]}` });
    const road = (segments, convoys) => ({ segments, convoys, islands: [0, 1, 2].map(island) });
    // a workshop bridge of 99 cells, 65 marked, a purse of 3: 33 fills it but misses the post — nothing builds it
    const broken = road(
      [{ id: 'x', kind: 'bridge', a: 99, mark: 65, holdsWith: 33, convoy: 'c', workshop: { max: 99 } }],
      {
        c: { purse: 3 },
      },
    );
    const [c] = convoysOf(broken.segments);
    expect(convoyBuilders(broken, c).builders).toEqual([]);
    const fine = road(
      [{ id: 'x', kind: 'bridge', a: 99, mark: 66, holdsWith: 33, convoy: 'c', workshop: { max: 99 } }],
      {
        c: { purse: 3 },
      },
    );
    expect(convoyBuilders(fine, convoysOf(fine.segments)[0]).builders).toEqual([33]);
    // the store: 273 cells, 195 marked; 3 and 39 both hold the post — a purse of 7 pays only 39
    const store = (purse) =>
      road(
        [
          {
            id: 's',
            kind: 'bridge',
            a: 273,
            mark: 195,
            holdsWith: 39,
            convoy: 'm',
            boss: { options: [3, 39], price: 1 },
          },
        ],
        {
          m: { purse },
        },
      );
    expect(storeHolders(store(7))).toEqual([39]);
    expect(storeHolders(store(91))).toEqual([3, 39]); // a purse that pays both: two right answers — caught
    // an unmarked store with no convoy: the options that fill the gap, as before
    expect(storeHolders(road([{ id: 's', a: 84, holdsWith: 12, boss: { options: [5, 12], price: 1 } }]))).toEqual([12]);
  });

  it('an equality of FRACTIONS is read by cross-multiplication; a sum of fractions too', () => {
    expect(fractionOf('\\frac{66}{78}')).toEqual([11, 13]);
    expect(fractionOf('\\dfrac{5}{39} + \\dfrac{8}{39}')).toEqual([1, 3]);
    expect(fractionOf('\\frac{2}{3} \\times \\frac{9}{4}')).toEqual([3, 2]);
    expect(fractionOf('\\frac{a}{b}')).toBe(null);
    expect(fractionOf('\\frac{3}{0}')).toBe(null);
    expect(fractionOf('\\frac{66 \\div 6}{78 \\div 6}')).toBe(null); // a ÷ is not read: the side is skipped
    expect(equalitiesHold('\\frac{66}{78} = \\frac{11}{13}')).toBe(1);
    expect(equalitiesHold('\\frac{66}{78} = \\frac{33}{39} = \\frac{11}{13}')).toBe(1);
    expect(equalitiesHold('\\frac{5}{39} + \\frac{8}{39} = \\frac{13}{39} = \\frac{1}{3}')).toBe(1);
    expect(equalitiesHold('\\frac{12}{4} = 3')).toBe(1);
    expect(() => equalitiesHold('\\frac{66}{78} = \\frac{11}{12}')).toThrow();
    expect(() => equalitiesHold('\\frac{5}{39} + \\frac{8}{39} = \\frac{13}{78}')).toThrow();
    expect(() => trueEqualities('مثل $\\frac{35}{48} = \\frac{7}{8}$')).toThrow();
  });

  it('a line of a trainer sheet: a typed fraction is ONE answer, a printed one none', () => {
    const box = (num) => ({ num, label: num });
    const typed = { frac: { n: box('p'), d: box('q') } };
    const given = { frac: { n: 66, d: 78 } };
    expect(answersOnLine({ tokens: [given, '=', typed] })).toBe(1);
    expect(answersOnLine({ tokens: ['PGCD(66 ; 78)', '=', box('g')] })).toBe(1);
    expect(answersOnLine({ tokens: [box('a'), box('b'), typed, { choice: 'v', options: [] }] })).toBe(4);
  });

  it('reads an arithmetic side, a PGCD of numbers — and nothing with a letter or a box', () => {
    expect(valueOf('19 \\times 4 + 3')).toBe(79);
    expect(valueOf('152 - 95')).toBe(57);
    expect(valueOf('152 − 95 - 50')).toBe(7);
    expect(valueOf('\\mathrm{PGCD}(32 ; 44)')).toBe(4);
    expect(valueOf('PGCD(1833 ; 546)')).toBe(39);
    expect(valueOf('a - b')).toBe(null);
    expect(valueOf('\\square')).toBe(null);
  });

  it('an equality must be TRUE; a sentence’s formulas and isolated equalities are read', () => {
    expect(equalitiesHold('962 = 296 \\times 3 + 74 \\qquad 296 = 74 \\times 4 + 0')).toBe(2);
    expect(equalitiesHold('\\mathrm{PGCD}(152 ; 95) = \\mathrm{PGCD}(95 ; 57)')).toBe(1);
    expect(equalitiesHold('a = b \\times q + r')).toBe(0);
    expect(() => equalitiesHold('\\mathrm{PGCD}(152 ; 95) = 57')).toThrow();
    expect(trueEqualities('لدينا $259 - 185 = 74$ و ⁦7 + 5 = 12⁩')).toBe(2);
    expect(() => trueEqualities('لدينا ⁦7 + 5 = 13⁩')).toThrow();
  });

  it('finds a number glued to the wrong form of its noun — and accepts the right ones', () => {
    expect(agreementErrors('في الكيس 12 قطعة، و 5 قطع، وهوّة 152 خانة، و 7 خانات، و 0 خانة')).toEqual([]);
    expect(agreementErrors('بقيت 6 خانة')).toEqual(['6 خانة']);
    expect(agreementErrors('في الكيس 12 قطع')).toEqual(['12 قطع']);
    expect(agreementErrors('2 قسمات')).toEqual(['2 قسمات']);
    expect(agreementErrors('31 عملية طرح مقابل 3 عمليات طرح')).toEqual([]);
    expect(agreementErrors('هوّة 1003 خانة')).toEqual(['1003 خانة']);
    expect(agreementErrors('هوّة 1003 خانة', NOUNS, { past100: false })).toEqual([]);
  });

  it('a list with a plain space before its comma; strings found anywhere in a value', () => {
    expect(looseComma('1 ، 2')).toBe(true);
    expect(looseComma('1 ، 2')).toBe(false);
    expect(stringsIn({ a: 'x', b: ['y', { c: 'z' }], f: () => 'no', n: 3 })).toEqual(['x', 'y', 'z']);
    said('جملة كاملة');
    plain('جملة بلا معادلة');
    expect(() => said('اللوح undefined')).toThrow();
    expect(() => plain('$1 + 1$')).toThrow();
  });

  it('the answers a student can write: the right one, every box wrong, swapped, empty, then the lesson’s own', () => {
    const out = answersOf({ kind: 'k' }, { e: 57, g: 19 }, ['e', 'g'], (q, r) => [{ ...r, g: 57 }]);
    expect(out[0]).toEqual({ e: 57, g: 19 });
    expect(out).toContainEqual({ e: 19, g: 57 });
    expect(out).toContainEqual({ e: 57, g: '' });
    expect(out).toContainEqual({ e: 57, g: 57 });
    expect(out.at(-1)).toBe(null);
  });

  it('the proven limits are the walks’ numbers (trusted.md: 2 to 4 columns of tiles)', () => {
    expect(PROVEN_LIMITS.slots).toEqual([2, 4]);
    expect(PROVEN_LIMITS.useBoxes).toBe(4);
  });
});

describe('the Node reader of a bank and of the stories', () => {
  const fake = {
    id: 'x',
    sheets: [
      { file: 'level-1/a.json', text: '"$\\\\text{PGCD}(21 ; 14)$"\n"للعددين 30 و 45"\n"$161 - 115 = 46$"' },
      { file: 'level-2/b.json', text: '"قواسم العدد 360 هي: 1 ، 2 ، 3 ، 4 ، 5 ، 6 ، 36 ، 90"' },
    ],
  };
  it('the pairs a bank names, however « PGCD » is written', () => {
    expect([...bankPairs(fake)].sort()).toEqual(['14;21', '30;45']);
  });
  it('a pair a line chains collides; a list of divisors is not a pair', () => {
    expect(pairLines(fake.sheets[0].text, 161, 115)).toHaveLength(1);
    expect(pairLines(fake.sheets[1].text, 36, 90)).toEqual([]);
    expect(alone(16).test('161')).toBe(false);
    const r = collisions(fake, [115, 161], { stories: [], pairs: bankPairs(fake) });
    expect(r.clear).toBe(false);
    expect(r.bankLines).toHaveLength(1);
    expect(collisions(fake, [37, 74], { stories: [], pairs: bankPairs(fake) }).clear).toBe(true);
  });
  it('finds a real bank and its grade; an island’s name in a story', () => {
    expect(gradeOf('no-such-lesson')).toBe(null);
    expect(() => readBank('no-such-lesson')).toThrow(/no exercise bank/);
    expect(islandNamesIn("{ id: 'A', name: 'مرسى الخشّابين', R: 9 }")).toEqual(['مرسى الخشّابين']);
  });
});
