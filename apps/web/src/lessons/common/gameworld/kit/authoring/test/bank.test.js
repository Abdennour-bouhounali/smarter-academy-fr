import { describe, it, expect } from 'vitest';
import { alone, bankNumbers, collisions, shown, valueOf, withoutMetadata } from './bank.js';

const SHEET = `{
  "id": "ex-4am-x-l1-001",
  "level": 1,
  "metadata": {
    "title": "Activité — 57,5 et 69",
    "estimatedMinutes": 10,
    "source": {
      "type": "textbook",
      "page": 104,
      "number": 1
    },
    "exam": {
      "points": "03"
    }
  },
  "statement": {
    "content": "$AB = 69$, $AM = 57{,}5$ et $k = \\\\dfrac{5}{6}$ ; $BC = 7,5$",
    "figure": {
      "points": {
        "A": [
          0.0,
          77.5
        ]
      }
    }
  },
  "correct": "$x = 157{,}5 - 1/38$"
}`;
const bank = { id: 'x', grade: '4am', sheets: [{ file: 'level-1/a.json', text: SHEET, body: withoutMetadata(SHEET) }] };

describe('the bank check reads decimals and fractions as a bank writes them', () => {
  it('finds a decimal in « 57,5 » and « 57{,}5 », never in a longer number nor in a coordinate', () => {
    expect(alone('57,5').test('AM = 57{,}5')).toBe(true);
    expect(alone(57.5).test('AM = 57,5 cm')).toBe(true);
    expect(alone('57,5').test('157,5')).toBe(false);
    expect(alone('57,5').test('57,55')).toBe(false);
    expect(alone('57,5').test('3,57,5')).toBe(false);
    expect(alone('77,5').test('          77.5')).toBe(false);
  });
  it('finds a fraction as « 5/6 » or \\dfrac{5}{6}, not 15/6 nor 5/61', () => {
    expect(alone('5/6').test('k = \\dfrac{5}{6}')).toBe(true);
    expect(alone('5/6').test('k = \\frac{ 5 }{ 6 }')).toBe(true);
    expect(alone('5/6').test('k = 5/6.')).toBe(true);
    expect(alone('5/6').test('15/6')).toBe(false);
    expect(alone('5/6').test('\\dfrac{5}{61}')).toBe(false);
  });
  it('keeps the whole numbers as they were read (a number standing in 0,49 still stands)', () => {
    expect(alone(49).test('0,49')).toBe(true);
    expect(alone(49).test('149')).toBe(false);
  });
  it('values, shows and sorts the three kinds', () => {
    expect(valueOf('57,5')).toBe(57.5);
    expect(valueOf('57{,}5')).toBe(57.5);
    expect(valueOf('1/38')).toBeCloseTo(0.0263);
    expect(shown(57.5)).toBe('57,5');
    expect(shown('57.5')).toBe('57,5');
    expect(shown(119)).toBe('119');
  });
});

describe('the metadata of a sheet is not a number of the exercise', () => {
  it('drops the textbook source and the bare numbers of the metadata, keeps its title', () => {
    const body = withoutMetadata(SHEET);
    expect(body).not.toMatch(/104/);
    expect(body).not.toMatch(/estimatedMinutes|"03"/);
    expect(body).toMatch(/"title": "Activité — 57,5 et 69"/);
    expect(body).toMatch(/"statement"/);
    expect(withoutMetadata('{\n  "id": "a"\n}')).toBe('{\n  "id": "a"\n}');
  });
  it('a page number is clear, a decimal of the statement collides, a pair on one line collides', () => {
    expect(collisions(bank, [104], { stories: [], pairs: new Set() }).clear).toBe(true);
    const big = collisions(bank, ['157.5'], { stories: [], pairs: new Set() });
    expect(big.numbers[0].sheets).toEqual(['level-1/a.json']);
    const pair = collisions(bank, [69, '57.5'], { stories: [], pairs: new Set() });
    expect(pair.clear).toBe(false);
    // the title; the statement holds 7 digit runs (a decimal counts two), over the 6 of a pair line — kept as it was
    expect(pair.bankLines).toEqual(['level-1/a.json: "title": "Activité — 57,5 et 69",']);
  });
  it('lists the numbers the sheet writes: decimals, fractions, whole numbers — not the coordinates nor the page', () => {
    const nums = [...bankNumbers(bank).keys()];
    expect(nums).toEqual(['1/38', '5/6', '7,5', '57,5', '69', '157,5']);
  });
});
