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
  typographyErrors,
  plain,
  pointErrors,
  said,
  storeHolders,
  stringsIn,
  thousandsErrors,
  variableErrors,
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
    const island = (n) => ({ name: `Île ${'ABCD'[n]}` });
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
    expect(() => trueEqualities('comme $\\frac{35}{48} = \\frac{7}{8}$')).toThrow();
  });

  it('a line of a trainer sheet: a typed fraction is ONE answer, a printed one none', () => {
    const box = (num) => ({ num, label: num });
    const typed = { frac: { n: box('p'), d: box('q') } };
    const given = { frac: { n: 66, d: 78 } };
    expect(answersOnLine({ tokens: [given, '=', typed] })).toBe(1);
    expect(answersOnLine({ tokens: ['PGCD(66 ; 78)', '=', box('g')] })).toBe(1);
    expect(answersOnLine({ tokens: [box('a'), box('b'), typed, { choice: 'v', options: [] }] })).toBe(4);
  });

  it('a line of a trainer sheet: a typed power is ONE answer, a printed one none', () => {
    const box = (num) => ({ num, label: num });
    const exp = (p) => ({ pow: { base: String(p), exp: box(`e${p}`) } });
    expect(answersOnLine({ tokens: ['72', '=', exp(2), '×', exp(3)] })).toBe(2);
    expect(answersOnLine({ tokens: ['72', '=', { pow: { base: '2', exp: '3' } }, '×', exp(3)] })).toBe(1);
    expect(answersOnLine({ tokens: [{ pow: { base: box('p'), exp: box('e') } }] })).toBe(1);
  });

  it('reads a POWER of numbers: LaTeX `^`, superscript digits, a line’s printed `{ pow }` token', () => {
    expect(valueOf('2^{3} \\times 3^{2}')).toBe(72);
    expect(valueOf('2^3 \\times 3^2 \\times 7')).toBe(504);
    expect(valueOf('{2}^{3} \\times 5^{2} \\times 7')).toBe(1400);
    expect(valueOf('2³ × 3²')).toBe(72);
    expect(valueOf('2³ × 5² × 7')).toBe(1400);
    expect(valueOf('10² + 1')).toBe(101);
    expect(valueOf('2^{10}')).toBe(1024);
    // LaTeX raises ONE character without braces: 2^10 is 2¹ then a 0 — not a side of numbers
    expect(valueOf('2^10')).toBe(null);
    // the kit's tokens: printed powers are read, a box is not a number
    expect(valueOf(['2', '×', { pow: { base: '3', exp: '2' } }])).toBe(18);
    expect(valueOf([{ pow: { base: '2', exp: { num: 'e', label: 'exposant' } } }])).toBe(null);
    expect(valueOf('2^{n}')).toBe(null);
    // a tablet's line carries its powers now: « 72 = 2³ × 3² » is read, and a false one fails
    expect(equalitiesHold('72 = 2^{3} \\times 3^{2}')).toBe(1);
    expect(equalitiesHold('1\\,400 = 2^3 \\times 5^2 \\times 7')).toBe(1);
    expect(trueEqualities('donc $72 = 2^3 \\times 3^2$')).toBe(1);
    expect(() => equalitiesHold('72 = 2^{2} \\times 3^{3}')).toThrow();
    expect(() => equalitiesHold('504 = 2³ × 3 × 7')).toThrow();
    // a side WITHOUT a power reads as before
    expect(valueOf('19 \\times 4 + 3')).toBe(79);
  });

  it('the points the keys prove: one per key by default; a DECLARED many-to-one mapping when keys outnumber points', () => {
    const id = 'toy-lesson';
    const P = (n) => `3e_${id}_P${n}`;
    const config = { modules: [{ teachesLearningPointIds: [P(1)] }, { teachesLearningPointIds: [P(2), P(3)] }] };
    const evidenceOf = (table) => ({ learningPointOf: (_, key) => (table[key] ? P(table[key]) : null) });
    // one point per key: fine; two keys on one point without a declaration: refused
    expect(pointErrors({ id, keys: ['a', 'b', 'c'], evidence: evidenceOf({ a: 1, b: 2, c: 3 }), config })).toEqual([]);
    const four = ['a', 'b', 'c', 'd'];
    const shared = evidenceOf({ a: 1, b: 2, c: 1, d: 3 });
    expect(pointErrors({ id, keys: four, evidence: shared, config })).toHaveLength(1);
    // declared: accepted
    const pointOf = { a: 'P1', b: 'P2', c: 'P1', d: 'P3' };
    expect(pointErrors({ id, keys: four, evidence: shared, config, pointOf })).toEqual([]);
    // a key with no point (undeclared, or proving none) is refused
    expect(pointErrors({ id, keys: four, evidence: shared, config, pointOf: { a: 'P1', b: 'P2', d: 'P3' } })).toEqual([
      'c: no point declared in pointOf',
    ]);
    expect(
      pointErrors({ id, keys: four, evidence: evidenceOf({ a: 1, b: 2, d: 3 }), config, pointOf }).length,
    ).toBeGreaterThan(0);
    // a point no key proves is refused (P3 taught, nobody proves it)
    const noP3 = evidenceOf({ a: 1, b: 2, c: 1, d: 2 });
    expect(
      pointErrors({ id, keys: four, evidence: noP3, config, pointOf: { a: 'P1', b: 'P2', c: 'P1', d: 'P2' } }),
    ).toEqual([`${P(3)}: no key proves it`]);
    // the declaration must be what the evidence says, and name only keys
    expect(pointErrors({ id, keys: four, evidence: shared, config, pointOf: { ...pointOf, c: 'P2' } })).toEqual([
      `c: proves ${P(1)}, pointOf declares P2`,
    ]);
    expect(pointErrors({ id, keys: four, evidence: shared, config, pointOf: { ...pointOf, e: 'P1' } })).toEqual([
      'e: declared in pointOf, but not a key',
    ]);
    // a point of another lesson, or one no module teaches, is refused in both modes
    const stray = { learningPointOf: (_, key) => (key === 'a' ? '3e_other_P1' : P(9)) };
    expect(pointErrors({ id, keys: ['a', 'b'], evidence: stray, config })).toHaveLength(2);
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

  it('an equality must be TRUE; a sentence’s formulas are read', () => {
    expect(equalitiesHold('962 = 296 \\times 3 + 74 \\qquad 296 = 74 \\times 4 + 0')).toBe(2);
    expect(equalitiesHold('\\mathrm{PGCD}(152 ; 95) = \\mathrm{PGCD}(95 ; 57)')).toBe(1);
    expect(equalitiesHold('a = b \\times q + r')).toBe(0);
    expect(() => equalitiesHold('\\mathrm{PGCD}(152 ; 95) = 57')).toThrow();
    expect(trueEqualities('On a $259 - 185 = 74$ et $7 + 5 = 12$')).toBe(2);
    expect(() => trueEqualities('On a $7 + 5 = 13$')).toThrow();
    // an equality in plain words is not read (French needs no bidi isolation: it is written in `$…$`)
    expect(trueEqualities('On a 7 + 5 = 13')).toBe(0);
  });

  it('finds a number of four digits or more whose thousands are not grouped — in words and in a formula', () => {
    const T = '\u202f';
    expect(thousandsErrors(`56 divise-t-il 1${T}400 ? $1\\,400 = 2^{3} \\times 5^{2} \\times 7$`)).toEqual([]);
    expect(thousandsErrors('56 divise-t-il 1400 ?')).toEqual(['1400']);
    expect(thousandsErrors('Quand N devient 1547, le programme')).toEqual(['1547']);
    expect(thousandsErrors('$1400 = 2^{3} \\times 5^{2} \\times 7$')).toEqual(['1400']);
    // grouped by hand with a plain or a no-break space: the line may break inside it
    expect(thousandsErrors('l’échelle de 1 400 : regarde')).toEqual(['1 400']);
    expect(thousandsErrors('l’échelle de 1\u00a0400')).toEqual(['1\u00a0400']);
    expect(thousandsErrors(`2${T}387${T}000 et 12${T}345`)).toEqual([]);
    // a decimal's digits, a small number, a year after its word: not a thousand
    expect(thousandsErrors('π vaut environ 3,1416 ; 999 cases')).toEqual([]);
    expect(thousandsErrors('Sur le modèle du brevet 2024, en 2026, le 12 juin 2027')).toEqual([]);
    expect(thousandsErrors('il en reste 2024')).toEqual(['2024']);
    // what is typed into a machine (a spreadsheet's cell) takes no space
    expect(thousandsErrors('La cellule $\\texttt{=MOD(2431;11)}$ affiche :')).toEqual([]);
    expect(() => said('56 divise-t-il 1400 ?')).toThrow();
    expect(typographyErrors('il reste 2431 cases')).toEqual([{ kind: 'milliers', at: '2431' }]);
  });

  it('finds a variable written two ways in one sentence — italic in its formula, plain in its words', () => {
    expect(
      variableErrors('Un programme essaie $d = 2, 3$ sur $N = 91$ : si d divise N, N devient $N \\div d$.'),
    ).toEqual(['d', 'N']);
    expect(
      variableErrors('Un programme essaie $d = 2, 3$ sur $N = 91$ : si $d$ divise $N$, $N$ devient $N \\div d$.'),
    ).toEqual([]);
    // « a », « y », an elided letter, a command's letters, a sentence with no formula: never a variable
    expect(variableErrors('Il y a $a = 3$ ; l’élève d’abord : $x \\times 2$ et $\\text{reste}$')).toEqual([]);
    expect(variableErrors('si d divise N, N devient N ÷ d')).toEqual([]);
    expect(() => said('si d divise $N$')).not.toThrow();
    expect(() => said('si $d$ divise N, $N \\div d$')).toThrow();
    expect(typographyErrors('Sans calculer A, écris $A \\div d$.')).toEqual([{ kind: 'variable', at: 'A' }]);
  });

  it('finds a number glued to the wrong number of its noun — and accepts the right ones', () => {
    expect(
      agreementErrors('Dans la bourse, 12 pièces, 1 pièce, 0 pièce ; un fossé de 152 cases, 1 case et 2 planches'),
    ).toEqual([]);
    expect(agreementErrors('il reste 1 cases')).toEqual(['1 cases']);
    expect(agreementErrors('il reste 0 planches')).toEqual(['0 planches']);
    expect(agreementErrors('une salle de 3 dalle')).toEqual(['3 dalle']);
    expect(agreementErrors('1 dalles')).toEqual(['1 dalles']);
    expect(agreementErrors('un fossé de 1003 case')).toEqual(['1003 case']);
    // a decimal, a word that only starts with the noun, a noun with no plural form: never read as wrong
    expect(agreementErrors('0,25 dalle et 2,5 dalles, 3 dallages, 3 fois', [...NOUNS, ['fois', 'fois']])).toEqual([]);
    // a lesson's own table
    expect(agreementErrors('4 toise', [['toise', 'toises']])).toEqual(['4 toise']);
  });

  it('the French typography mistakes an author can make; strings found anywhere in a value', () => {
    const kinds = (t) => typographyErrors(t).map((e) => e.kind);
    // clean: no-break spaces before the high signs and inside the quotes, a typographic apostrophe, « 3e »
    expect(typographyErrors('L’île est loin : tu y vas ? Oui ! « 3e » et 1, 2 et 4 ;')).toEqual([]);
    expect(kinds('Le reste: 0')).toEqual(['space']);
    expect(kinds('Le reste : 0')).toEqual(['space']);
    expect(kinds('Tu y vas ?')).toEqual(['space']);
    expect(kinds('Bravo!')).toEqual(['space']);
    expect(kinds('«Le pont»')).toEqual(['quote', 'quote']);
    expect(kinds("l'île")).toEqual(['apos']);
    expect(kinds('en 3ème')).toEqual(['ordinal']);
    expect(kinds('la 1ère fois')).toEqual(['ordinal']);
    expect(kinds('1 \u060c 2')).toEqual(['arabic']);
    expect(kinds('\u20667 + 5 = 12\u2069')).toEqual(['bidi']);
    // a formula writes its own punctuation; an address keeps its colon
    expect(typographyErrors('$f\\colon x \\mapsto 2x$ et $(2;3)$, https://exemple.fr')).toEqual([]);
    expect(looseComma('Le reste: 0')).toBe(true);
    expect(looseComma('Le reste : 0')).toBe(false);
    expect(stringsIn({ a: 'x', b: ['y', { c: 'z' }], f: () => 'no', n: 3 })).toEqual(['x', 'y', 'z']);
    said('Une phrase complète');
    plain('Une phrase sans égalité');
    expect(() => said('La planche undefined')).toThrow();
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
      { file: 'level-1/a.json', text: '"$\\\\text{PGCD}(21 ; 14)$"\n"des nombres 30 et 45"\n"$161 - 115 = 46$"' },
      { file: 'level-2/b.json', text: '"Les diviseurs de 360 sont : 1, 2, 3, 4, 5, 6, 36 et 90"' },
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
    expect(islandNamesIn("{ id: 'A', name: 'Le port des charpentiers', R: 9 }")).toEqual(['Le port des charpentiers']);
  });
});
