import { describe, it, expect } from 'vitest';
import {
  read,
  write,
  tex,
  compare,
  square,
  rod,
  wall,
  outcome,
  rootOf,
  rodText,
  rodTex,
  lengthOf,
  dialRod,
  isDecimal,
} from './logic';

describe('the numbers of the world are exact and written as text', () => {
  it('reads what a screen writes and writes it back', () => {
    for (const t of ['30', '5,47', '0,25', '-9', '5,477225575', '0,000176']) expect(write(read(t))).toBe(t);
    expect(write('5.470')).toBe('5,47');
    expect(write(7)).toBe('7');
    expect(write('14/8')).toBe('1,75');
    expect(write('2/3')).toBe('2/3');
    expect(() => read('abc')).toThrow();
  });
  it('writes LaTeX without a space after the comma and with a real fraction bar', () => {
    expect(tex('5,47')).toBe('5{,}47');
    expect(tex('2/3')).toBe('\\dfrac{2}{3}');
    expect(isDecimal('49/64')).toBe(true);
    expect(isDecimal('1/3')).toBe(false);
  });
  it('squares a ten-digit decimal without losing a digit', () => {
    // the ten digits a calculator shows for the side of the court of 30: a hair under it, and the next digit is over
    expect(write(square('5,477225575'))).toBe('29,999999999434080625');
    expect(compare(square('5,477225575'), 30)).toBe(-1);
    expect(compare(square('5,477225576'), 30)).toBe(1);
  });
});

describe('what the world does with a rod over a court', () => {
  const rides = (r, area) => outcome(r, area).kind === 'ride';
  it('a rod whose square is the area rides; a shorter one leaves a band; a longer one jams', () => {
    expect(outcome(rod(6), 36)).toEqual({ kind: 'ride', covers: '36', diff: '0' });
    expect(outcome(rod(5), 30)).toEqual({ kind: 'band', covers: '25', diff: '5' });
    expect(outcome(rod(6), 30)).toEqual({ kind: 'jam', covers: '36', diff: '6' });
    expect(outcome(rod('5,47'), 30)).toEqual({ kind: 'band', covers: '29,9209', diff: '0,0791' });
    expect(outcome(rod('5,48'), 30)).toEqual({ kind: 'jam', covers: '30,0304', diff: '0,0304' });
  });
  it('no number of a dial rides the court of 30, down to the thousandth — and its wall does', () => {
    for (const step of ['1', '0,1', '0,01', '0,001'])
      for (let k = 0; k <= 7 / Number(step.replace(',', '.')); k += 1) expect(rides(dialRod(k, step), 30)).toBe(false);
    expect(outcome(wall(30), 30)).toEqual({ kind: 'ride', covers: '30', diff: '0' });
    expect(rodText(wall(30))).toBe('√30');
    expect(rodTex(wall('2/3'))).toBe('\\sqrt{\\dfrac{2}{3}}');
  });
  it('a court smaller than one tile is ridden by a rod longer than its area', () => {
    expect(rides(rod('0,5'), '0,25')).toBe(true);
    expect(rides(rod('7/8'), '49/64')).toBe(true);
    expect(rides(rod('0,125'), '0,25')).toBe(false);
  });
  it('a walk to the left builds the same court: the square of a negative number', () => {
    expect(outcome(rod('-9'), 81).kind).toBe('ride');
    expect(lengthOf(rod('-9'))).toBe(9);
  });
  it('knows which areas have their side among the numbers', () => {
    expect(rootOf(36)).toBe('6');
    expect(rootOf('49/64')).toBe('0,875');
    expect(rootOf('0,25')).toBe('0,5');
    expect(rootOf(30)).toBe(null);
    expect(rootOf('-4')).toBe(null);
    expect(rootOf(1225)).toBe('35');
  });
  it('a dial stopped at a mark gives its rod exactly, with no rounding error', () => {
    expect(dialRod(547, '0,01')).toEqual({ q: '5,47' });
    expect(dialRod(3, '0,1')).toEqual({ q: '0,3' });
    expect(lengthOf(wall(30))).toBeCloseTo(5.4772, 4);
  });
});
