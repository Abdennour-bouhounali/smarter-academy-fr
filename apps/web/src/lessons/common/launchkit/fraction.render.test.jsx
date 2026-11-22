import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Write } from './gestures';
import { slotsOf } from './families';

const noop = () => {};
const S = (slot, label, w) => ({ slot, label, w });
const draw = (tokens) =>
  renderToString(<Write q={{ gesture: 'write', tokens }} value={{}} onChange={noop} locked={false} play={noop} />);

describe('عُدّة الانطلاق — a fraction written in its own shape', () => {
  // Neutral questions written here in the token shape a family produces.
  it('draws the two fractions with a real bar and ONE box inside the second, in reading order', () => {
    for (const [tokens, second] of [
      [[{ frac: ['6', '8'] }, '=', { frac: ['3', S('v', 'المقام', 1)] }], '3/▢'],
      [[{ frac: ['2', '5'] }, '=', { frac: [S('v', 'البسط', 1), '15'] }], '▢/15'],
    ]) {
      const html = draw(tokens);
      expect(html).toContain(`data-lk-frac="${tokens[0].frac.join('/')}"`);
      expect(html).toContain(`data-lk-frac="${second}"`);
      expect(html.match(/class="lk-frac"/g)).toHaveLength(2);
      expect(html.match(/data-lk-slot="v"/g)).toHaveLength(1);
      expect(html).not.toMatch(/\\frac|\$/); // no raw formula: the bar is drawn
    }
  });

  it('draws a power with a REAL superscript: no « ^ », no raw formula, the boxes after it', () => {
    const whole = draw([{ pow: ['(−2)', '3'] }, '=', S('v', 'الناتج', 2)]);
    expect(whole.match(/class="lk-pow"/g)).toHaveLength(1);
    expect(whole).toContain('<sup>3</sup>');
    expect(whole).toContain('data-lk-pow="(−2)^3"');
    expect(whole.match(/data-lk-slot="v"/g)).toHaveLength(1);
    expect(whole.replace(/ data-lk-[a-z]+="[^"]*"/g, '')).not.toMatch(/\^|\\frac|\$/); // what is SEEN
    const fraction = draw([
      { pow: [{ frac: ['2', '3'] }, '2'] },
      '=',
      { frac: [S('n', 'البسط', 1), S('d', 'المقام', 1)] },
    ]);
    expect(fraction).toContain('data-lk-pow="2/3^2"');
    expect(fraction).toContain('data-lk-frac="2/3"'); // the base, with its bar, in brackets
    expect(fraction).toContain('data-lk-frac="▢/▢"'); // the answer: two boxes over a real bar
    expect(fraction.match(/lk-pow__paren/g)).toHaveLength(2);
    expect(fraction.indexOf('data-lk-slot="n"')).toBeLessThan(fraction.indexOf('data-lk-slot="d"'));
  });

  it('reads the boxes inside a fraction like any other box', () => {
    expect(slotsOf(['47', '=', { slot: 'q' }, '+', { slot: 'r' }]).map((s) => s.slot)).toEqual(['q', 'r']);
    expect(slotsOf([{ frac: ['6', '8'] }, '=', { frac: ['3', { slot: 'v' }] }]).map((s) => s.slot)).toEqual(['v']);
    // a power holds no box: its base and its exponent are drawn
    expect(
      slotsOf([{ pow: [{ frac: ['2', '3'] }, '2'] }, '=', { frac: [{ slot: 'n' }, { slot: 'd' }] }]).map((s) => s.slot),
    ).toEqual(['n', 'd']);
  });
});
