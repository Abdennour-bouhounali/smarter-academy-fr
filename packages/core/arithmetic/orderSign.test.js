import { describe, it, expect } from 'vitest';
import { rat, parseRat, ratText } from './powers.js';
import * as O from './orderSign.js';

const v = (t) => parseRat(t);

describe('orderSign — difference, order, verdict', () => {
  it('the lab tasks: differences and orders (exact)', () => {
    const cases = [
      ['5/4', '3/4', '1/2', '>'], ['-3/2', '-1/2', '-1', '<'], ['9/11', '13/16', '1/176', '>'],
      ['17/12', '10/7', '-1/84', '<'], ['-7/6', '-9/8', '-1/24', '<'],
      ['7/4', '5/3', '1/12', '>'], ['-11/8', '-4/3', '-1/24', '<'], ['11/8', '15/11', '1/88', '>'], ['-5/9', '4/-7', '1/63', '>'],
      ['25/31', '29/36', '1/1116', '>'], ['5/6', '7/9', '1/18', '>'], ['-3/4', '-5/7', '-1/28', '<'],
    ];
    for (const [a, b, d, o] of cases) {
      const A = O.parseNumber(a); const B = O.parseNumber(b);
      expect(ratText(O.difference(A, B)), `${a}-${b}`).toBe(d);
      expect(O.orderOf(A, B)).toBe(o);
      expect(O.orderOf(B, A)).toBe(o === '>' ? '<' : o === '<' ? '>' : '=');
    }
    expect(O.orderOf(v('3/4'), v('0,75'))).toBe('=');
  });

  it('verdictJudge judges the order, not the needle: swapping probes flips the reading only', () => {
    const a = v('-3/2'); const b = v('-1/2');
    const red = O.verdictJudge(a, b, 'a', 'lt');
    expect(red).toMatchObject({ ok: true, right: 'lt' });
    expect(ratText(red.reading)).toBe('-1');
    const swapped = O.verdictJudge(a, b, 'b', 'lt');
    expect(swapped.ok).toBe(true);
    expect(ratText(swapped.reading)).toBe('1');
    expect(O.verdictJudge(a, b, 'a', 'gt').ok).toBe(false);
    expect(O.verdictJudge(a, a, 'a', 'eq').ok).toBe(true);
  });

  it('pixelGap: 9/11 and 13/16 are under one pixel apart on a 150 px-per-unit rail', () => {
    expect(O.pixelGap(v('9/11'), v('13/16'), 150)).toBeCloseTo(0.852, 2);
    expect(O.pixelGap(v('5/4'), v('3/4'), 150)).toBe(75);
  });

  it('fromDifference: the curtain reads the order from the difference alone', () => {
    expect(O.fromDifference({ left: 'a', value: v('-0,3') })).toBe('<');
    expect(O.fromDifference({ left: 'b', value: v('7') })).toBe('<');
    expect(O.fromDifference({ left: 'a', value: v('2/5') })).toBe('>');
    expect(O.fromDifference({ left: 'b', value: v('-1/100') })).toBe('>');
    expect(O.fromDifference({ left: 'a', value: rat(0) })).toBe('=');
    expect(O.fromDifference({ left: 'b', bound: rat(1), dir: '>=' })).toBe('<');
    expect(O.fromDifference({ left: 'a', bound: rat(-2), dir: '>=' })).toBeNull();
    expect(O.fromDifference({ left: 'a', bound: rat(2), dir: '<=' })).toBeNull();
    expect(O.fromDifference({ left: 'a', bound: rat(-2), dir: '<=' })).toBe('<');
  });

  it('parseNumber / validateNumber: comma decimals, fractions, Arabic-Indic digits, real minus', () => {
    expect(ratText(O.parseNumber('−٠٫٣'))).toBe('-3/10');
    expect(ratText(O.parseNumber('9/11'))).toBe('9/11');
    expect(ratText(O.parseNumber('-4/-8'))).toBe('1/2');
    expect(O.validateNumber('7/2').ok).toBe(true);
    expect(O.validateNumber('10').why).toBe('big');
    expect(O.validateNumber('1/100').why).toBe('den');
    expect(O.validateNumber('1/0').why).toBe('zero');
    expect(O.validateNumber('abc').why).toBe('syntax');
    expect(O.validateNumber('').why).toBe('empty');
  });

  it('writtenJudge accepts an unreduced value, refuses the terms-subtracted one', () => {
    const reading = O.difference(v('17/12'), v('10/7'));
    expect(O.writtenJudge({ sign: -1, num: 1, den: 84 }, reading).ok).toBe(true);
    expect(O.writtenJudge({ sign: -1, num: 2, den: 168 }, reading).ok).toBe(true);
    expect(O.writtenJudge({ sign: -1, num: 7, den: 5 }, reading).ok).toBe(false);
    expect(O.writtenJudge({ sign: 1, num: 1, den: 0 }, reading).ok).toBe(false);
  });
});

describe('orderSign — expressions', () => {
  const D = (a, b) => O.exprDifference(O.parseExpr(a), O.parseExpr(b));
  it('A − B of the lab tasks', () => {
    expect(O.linearTex(O.linearForm(D('3x+5', '2x+9')))).toBe('x-4');
    expect(O.linearTex(O.linearForm(D('2(x+3)', '2x+1')))).toBe('5');
    expect(O.linearTex(O.linearForm(D('x²+3', 'x²+x')))).toBe('-x+3');
    expect(O.linearTex(O.linearForm(D('6x-5', '5x+1')))).toBe('x-6');
    expect(O.linearTex(O.linearForm(D('1500+41x', '1200+42x')))).toBe('-x+300');
    expect(D('(x+5)(x+1)', 'x²+6x+9')).toEqual([{ p: 0, c: -4 }]);
    expect(O.linearForm(D('x²', 'x'))).toBeNull();
  });
  it('values at x (exact) agree with the regions', () => {
    const A = O.parseExpr('3x+5'); const B = O.parseExpr('2x+9');
    expect([0, 4, 6].map((x) => [ratText(O.valueOfExpr(A, rat(x))), ratText(O.valueOfExpr(B, rat(x)))])).toEqual([['5', '9'], ['17', '17'], ['23', '21']]);
    const x3 = O.parseExpr('x²+3'); const x4 = O.parseExpr('x²+x');
    expect([2, 4].map((x) => [ratText(O.valueOfExpr(x3, rat(x))), ratText(O.valueOfExpr(x4, rat(x)))])).toEqual([[ '7', '6'], ['19', '20']]);
    expect(ratText(O.valueOfExpr(O.parseExpr('1500+41x'), rat(220)))).toBe('10520');
  });
  it('signRegions + regionCardsJudge: every region is checked at sample points', () => {
    for (const [a, b] of [['3x+5', '2x+9'], ['2(x+3)', '2x+1'], ['x²+3', 'x²+x'], ['6x-5', '5x+1'], ['2x+7', 'x+10']]) {
      const A = O.parseExpr(a); const B = O.parseExpr(b);
      const terms = O.exprDifference(A, B);
      const regions = O.signRegions(terms);
      for (const r of regions) {
        const x = O.sampleIn(r);
        const diff = O.valueOfExpr(A, x);
        const d = O.valueOfExpr(B, x);
        const s = Math.sign(Number(diff.n * d.d - d.n * diff.d));
        expect(s, `${a} vs ${b} at ${ratText(x)}`).toBe(r.sign);
      }
      const j = O.regionCardsJudge(terms, regions.map((r) => (r.sign > 0 ? 'gt' : r.sign < 0 ? 'lt' : 'eq')));
      expect(j.ok).toBe(true);
      expect(O.regionCardsJudge(terms, regions.map(() => 'gt')).ok).toBe(regions.every((r) => r.sign > 0));
    }
    expect(O.signRegions(O.exprDifference(O.parseExpr('3x+5'), O.parseExpr('2x+9'))).map((r) => [r.kind, ratText(r.bound), r.sign])).toEqual([['lt', '4', -1], ['eq', '4', 0], ['gt', '4', 1]]);
    expect(O.signRegions(O.exprDifference(O.parseExpr('x²+3'), O.parseExpr('x²+x'))).map((r) => r.sign)).toEqual([1, 0, -1]);
    expect(O.signRegions([{ p: 2, c: 1 }])).toBeNull();
  });
  it('coefJudge and validateExpr', () => {
    const t = D('3x+5', '2x+9');
    expect(O.coefJudge(t, { p: 1, q: -4 }).ok).toBe(true);
    expect(O.coefJudge(t, { p: 5, q: 14 }).ok).toBe(false);          // B added: the bracket error
    expect(O.coefJudge(t, { p: 1, q: 4 }).ok).toBe(false);
    expect(O.validateExpr('2x+7').ok).toBe(true);
    expect(O.validateExpr('x^3').why).toBe('degree');
    expect(O.validateExpr('30x').why).toBe('big');
    expect(O.validateExpr('2z').why).toBe('syntax');
  });
});
