import { describe, it, expect } from 'vitest';
import * as R from './letterRule.js';

const val = (src, env) => R.text(R.evaluate(R.parse(src), env));
const line = (toks) => toks.map((t) => t.v).join(' ');

describe('letterRule — règles littérales exactes', () => {
  it('lit la multiplication implicite comme un produit, jamais comme un nombre collé', () => {
    expect(R.tokenize('2x').map((t) => t.v)).toEqual(['2', '×', 'x']);
    expect(R.tokenize('ab').map((t) => t.v)).toEqual(['a', '×', 'b']);
    expect(R.tokenize('3(x+2)').map((t) => t.v)).toEqual(['3', '×', '(', 'x', '+', '2', ')']);
    expect(R.tokenize('5n+20').map((t) => t.v)).toEqual(['5', '×', 'n', '+', '20']);
    // 2x pour x = 3 : « 2 × 3 » = 6, jamais 23
    expect(line(R.substitute(R.parse('2x'), { x: '3' }))).toBe('2 × 3');
    expect(val('2x', { x: '3' })).toBe('6');
    expect(val('23', {})).toBe('23');
  });

  it('évalue la règle du prix, la règle avec n deux fois, le clôture et les deux membres de la fausse règle', () => {
    expect(val('5*n+20', { n: '12' })).toBe('80');
    expect(val('5*n+20', { n: '0' })).toBe('20');
    expect(val('5*n+20-n', { n: '10' })).toBe('60');
    expect(val('2*(a+b)', { a: '15', b: '8' })).toBe('46');
    expect(val('2*(a+b)', { a: '8', b: '15' })).toBe('46');
    const c = (a, b) => R.compare(R.parse('a+b'), R.parse('a*b'), { a, b });
    expect(c('2', '2').eq).toBe(true);
    expect(c('3', '4').eq).toBe(false);
    expect(R.text(c('3', '4').l)).toBe('7');
    expect(R.text(c('3', '4').r)).toBe('12');
    expect(c('0', '0').eq).toBe(true);
    expect(c('1', '5').eq).toBe(false);
  });

  it('la valeur tombe dans TOUTES les fentes d\'une lettre', () => {
    const t = R.parse('5*n+20-n');
    expect(R.slotCount(t, 'n')).toBe(2);
    expect(line(R.substitute(t, { n: '10' }))).toBe('5 × 10 + 20 − 10');
    expect(R.lettersOf(R.parse('2*(a+b)'))).toEqual(['a', 'b']);
  });

  it('les étapes : parenthèses, puis produits, puis sommes', () => {
    expect(R.steps(R.parse('5*n+20'), { n: '12' }).map(line)).toEqual(['5 × 12 + 20', '60 + 20', '80']);
    expect(R.steps(R.parse('2*(a+b)'), { a: '15', b: '8' }).map(line)).toEqual(['2 × ( 15 + 8 )', '2 × 23', '46']);
    expect(R.steps(R.parse('5*n+20-n'), { n: '10' }).map(line)).toEqual(['5 × 10 + 20 − 10', '50 + 20 − 10', '70 − 10', '60']);
    // une différence peut être négative : 2 − n pour n = 5
    expect(val('2-n', { n: '5' })).toBe('−3');
  });

  it('refuse ce qui n\'est pas une règle', () => {
    expect(() => R.parse('')).toThrow();
    expect(() => R.parse('2+')).toThrow();
    expect(() => R.parse('(2+3')).toThrow();
    expect(() => R.parse('3÷n')).toThrow();
    expect(() => R.evaluate(R.parse('n+1'), {})).toThrow();
  });

  it('les décimaux restent exacts', () => {
    expect(val('2*(a+b)', { a: '2,5', b: '1,3' })).toBe('7,6');
    expect(val('1,5*n', { n: '4' })).toBe('6');
  });
});
