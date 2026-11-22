import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Duo from './tools/Duo';

const noop = () => {};
const draw = (a, b, start) =>
  renderToString(
    <Duo a={a} b={b} start={start} play={noop} report={noop} range={{ a: [1, 999], b: [1, 999] }} />,
  ).replaceAll('<!-- -->', '');
const svgOf = (html) => html.slice(html.indexOf('<svg'), html.indexOf('</svg>'));
const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

describe('Mon labo — « Le microscope à deux nombres » draws what it reads', () => {
  it('opens on the face of the lists: three tabs, the two lists, what is in both — numbers only in the drawing', () => {
    const html = draw(84, 126);
    expect(html).toContain('data-face="lists"');
    for (const f of ['lists', 'divisions', 'probe']) expect(html).toContain(`data-ll-face-tab="${f}"`);
    expect(html).toContain(`data-ll-duo-list="A" data-all="${divisors(84).join(',')}"`);
    expect(html).toContain(`data-ll-duo-list="B" data-all="${divisors(126).join(',')}"`);
    const both = divisors(84).filter((d) => 126 % d === 0);
    expect(html).toContain(`data-ll-common="${both.join(',')}"`);
    expect(html).toContain(`Dans les deux listes\u00a0: ${both.slice(0, -1).join(', ')} et ${both.at(-1)}`);
    expect(svgOf(html)).not.toMatch(/\\|\$/); // no raw formula in the drawing
  });

  it('two numbers that share only 1: the drawing and the reading say the fact, never a name for it', () => {
    const html = draw(64, 35);
    expect(html).toContain('data-ll-common="1"');
    expect(html).toContain('Dans les deux listes\u00a0: 1<');
    expect(html).not.toMatch(/premier|entre eux|\bseul\b|[\u0600-\u06FF]/i);
  });

  it('840 and its 32 divisors: two lines of chips, every chip inside the drawing', () => {
    const html = draw(840, 840);
    const xs = [...svgOf(html).matchAll(/<rect x="([-\d.]+)" y="([-\d.]+)" width="46" height="32"/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
    ]);
    expect(xs.length).toBe(32 * 3);
    for (const [x, y] of xs) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + 46).toBeLessThanOrEqual(940);
      expect(y).toBeGreaterThanOrEqual(46); // under the tabs
      expect(y + 32).toBeLessThanOrEqual(370);
    }
  });

  it('the divisions: nothing written on opening and the button calls the hand; written row by row down to the remainder 0', () => {
    const empty = draw(546, 385, { face: 'divisions' });
    expect(empty).toContain('data-written="0"');
    expect(empty).toContain('ll-btn--call');
    expect(empty).not.toContain('data-ll-div=');
    expect(empty).not.toContain('PGCD');
    const two = draw(546, 385, { face: 'divisions', written: 2 });
    expect(two).toContain('546 = 385 × 1 + <tspan');
    expect(two).toContain('385 = 161 × 2 + <tspan');
    expect(two).not.toContain('data-ll-div="2"');
    const all = draw(546, 385, { face: 'divisions', written: 99 });
    // 546 = 385 × 1 + 161, 385 = 161 × 2 + 63, 161 = 63 × 2 + 35, 63 = 35 × 1 + 28, 35 = 28 × 1 + 7, 28 = 7 × 4 + 0
    expect(all).toContain('data-lines="6" data-done="true"');
    expect(all).toContain('data-ll-div="5" data-r="0"');
    expect(all).toContain('data-ll-divisions-done="6"');
    expect(all).toContain('Reste 0');
    expect(all).not.toContain('data-ll-open');
  });

  it('the longest chain up to 999 (987 and 610): 14 lines in two columns, none outside the drawing', () => {
    const html = draw(987, 610, { face: 'divisions', written: 14 });
    const rows = [...html.matchAll(/<text x="(\d+)" y="(\d+)"[^>]*data-ll-div="(\d+)"/g)].map((m) =>
      m.slice(1).map(Number),
    );
    expect(rows).toHaveLength(14);
    for (const [x, y] of rows) {
      expect(x - 130).toBeGreaterThanOrEqual(0);
      expect(x + 130).toBeLessThanOrEqual(940);
      expect(y).toBeLessThanOrEqual(370 - 8);
    }
  });

  it('one number tried on both: the two divisions drawn and read, the verdict computed', () => {
    const both = draw(84, 126, { face: 'probe', d: 14 });
    expect(both).toContain('data-ll-duo-probe="true" data-d="14" data-verdict="both"');
    expect(both).toContain('data-ll-duo-bar="a" data-n="84" data-q="6" data-r="0"');
    expect(both).toContain('data-ll-duo-bar="b" data-n="126" data-q="9" data-r="0"');
    expect(both).toContain('14 divise les deux nombres');
    expect(both).toContain('ll-pulse'); // the handle was never moved
    const one = draw(84, 126, { face: 'probe', d: 4 });
    expect(one).toContain('data-verdict="a"');
    expect(one).toContain('4 divise seulement 84');
    expect(one).toContain('126 = 4 × 31 + 2');
    const none = draw(85, 119, { face: 'probe', d: 5 });
    expect(none).toContain('data-verdict="a"');
    const zero = draw(64, 35, { face: 'probe', d: 3 });
    expect(zero).toContain('3 ne divise aucun des deux');
    // a number of 3 digits tried with 2: hundreds of pieces drawn as ONE bar
    const many = draw(998, 996, { face: 'probe', d: 2 });
    expect(many.match(/height="20" rx="3"/g)).toHaveLength(2);
  });
});
