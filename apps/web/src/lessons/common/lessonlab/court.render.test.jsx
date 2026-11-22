import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import NumberCourt, { courtPoint } from './tools/NumberCourt';

const COURT_VW = 560; // the drawing's viewBox width (tools/NumberCourt.jsx)

const noop = () => {};
const draw = (a, start) =>
  renderToString(
    <NumberCourt a={a} b={1} start={start} play={noop} report={noop} range={{ a: [1, 400], b: [1, 400] }} />,
  ).replaceAll('<!-- -->', '');
const svgOf = (html) => html.slice(html.indexOf('<svg'), html.indexOf('</svg>'));
const factsOf = (html) => html.slice(html.indexOf('data-ll-court-facts'));
const count = (html, hook) => (svgOf(html).match(new RegExp(`${hook}(?:="[^"]*")?[ >/]`, 'g')) ?? []).length;
/** Every number a drawn attribute takes (x, width…), to check that nothing leaves the drawing. */
const nums = (html, attr) =>
  [...svgOf(html).matchAll(new RegExp(` ${attr}="([-\\d.]+)"`, 'g'))].map((m) => Number(m[1]));

describe('Mon labo — « La salle du nombre » draws what it reads', () => {
  it('opens on a square of side 2, the handle calling the hand, nothing said about the court yet — no raw formula', () => {
    const html = draw(30);
    expect(html).toContain(
      'data-ll-court="30" data-s="2" data-verdict="out" data-inside="4" data-out="26" data-holes="0"',
    );
    expect(html).toContain('ll-pulse'); // the side was never moved
    expect(html).toContain('data-ll-court-facts="open"');
    expect(factsOf(html)).not.toContain('√');
    expect(html).not.toContain('data-ll-court-bracket');
    expect(html).toContain('Une salle de 30\u00a0dalles');
    expect(svgOf(html)).not.toMatch(/\\|\$/);
    // 26 tiles do not fit: the border of a square of 2 holds 5 of them, the 21 others are counted
    expect(html).toContain('data-out-drawn="5"');
    expect(html).toContain('data-ll-court-more="21"');
    expect(html).toContain('Hors du carré\u00a0: 26\u00a0dalles');
  });

  it('a square too big: its empty places are drawn, and the tiles fill it row by row', () => {
    const html = draw(30, { s: 6, tried: [6] });
    expect(html).toContain('data-verdict="holes" data-inside="30" data-out="0" data-holes="6"');
    expect(count(html, 'data-ll-court-hole')).toBe(6);
    expect(count(html, 'data-ll-court-out')).toBe(0);
    expect(html).toContain('Cases vides dans le carré\u00a0: 6');
    expect(html).toContain('data-ll-court-facts="open"'); // 6 tried, but not 5: the court is not settled
  });

  it('once 5 and 6 were tried on 30: the greatest whole square, what is left, the side between 5 and 6 and to 0,01', () => {
    const html = draw(30, { s: 5, tried: [6, 5] });
    expect(html).toContain('data-verdict="out" data-inside="25" data-out="5"');
    expect(count(html, 'data-ll-court-out')).toBe(5);
    expect(html).toContain('data-ll-court-facts="settled"');
    expect(html).toContain('data-ll-court-whole="5:5"');
    expect(html).toContain('Il en reste\u00a0: 5\u00a0dalles');
    expect(html).toContain('data-ll-court-bracket="5:6"');
    expect(html).toContain('data-ll-court-near="5,47:5,48"');
    // 5,47 × 5,47 = 29,9209 < 30 < 30,0304 = 5,48 × 5,48
    expect(html).toContain('5{,}47^{2} = 29{,}9209');
    expect(html).toContain('5{,}48^{2} = 30{,}0304');
  });

  it('a perfect square: the square fills it, √a = k, nothing between two numbers', () => {
    const html = draw(144, { s: 12, tried: [12] });
    expect(html).toContain('data-verdict="fits" data-inside="144" data-out="0" data-holes="0"');
    expect(html).toContain('Le carré est plein, aucune dalle dehors');
    expect(html).toContain('data-ll-court-root="12"');
    expect(html).toContain('\\sqrt{144} = 12');
    expect(html).toContain('Il n’en reste rien.');
    expect(html).not.toContain('data-ll-court-bracket');
    expect(html).not.toContain('data-ll-court-near');
  });

  it('the agreement of « dalle » with 1 (singular) and 2 and more (plural), the number always written', () => {
    expect(draw(1)).toContain('Une salle de 1\u00a0dalle<');
    expect(draw(2)).toContain('Une salle de 2\u00a0dalles');
    expect(draw(6, { s: 2, tried: [2] })).toContain('Hors du carré\u00a0: 2\u00a0dalles');
    expect(draw(5, { s: 2, tried: [2, 3] })).toContain('Il en reste\u00a0: 1\u00a0dalle<');
    expect(draw(7, { s: 2, tried: [2, 3] })).toContain('Il en reste\u00a0: 3\u00a0dalles');
    expect(draw(140, { s: 11, tried: [11, 12] })).toContain('Il en reste\u00a0: 19\u00a0dalles');
    expect(draw(140, { s: 11, tried: [11, 12] })).not.toMatch(/[\u0600-\u06FF]/);
  });

  it('the biggest court (400) and the longest side (21) stay inside the drawing', () => {
    for (const [a, s] of [
      [400, 21],
      [400, 1],
      [399, 20],
      [1, 21],
      [200, 14],
    ]) {
      const html = draw(a, { s, tried: [s] });
      for (const x of [...nums(html, 'x'), ...nums(html, 'x1'), ...nums(html, 'x2'), ...nums(html, 'cx')]) {
        expect(x, `${a} ${s}`).toBeGreaterThanOrEqual(0);
        expect(x, `${a} ${s}`).toBeLessThanOrEqual(COURT_VW);
      }
      for (const y of [...nums(html, 'y'), ...nums(html, 'y1'), ...nums(html, 'y2')]) {
        expect(y, `${a} ${s}`).toBeGreaterThanOrEqual(0);
        expect(y, `${a} ${s}`).toBeLessThanOrEqual(370);
      }
    }
    // 400 tiles in a square of 21: 400 drawn, 41 places empty
    const full = draw(400, { s: 21, tried: [21] });
    expect(full).toContain('data-inside="400" data-out="0" data-holes="41"');
  });
});

describe('Mon labo — « La salle du nombre » reads the hand in ITS drawing', () => {
  it('a pointer on the ruler mark 12 is read at that mark (viewBox 560 × 370, not the kit default 940)', () => {
    // a drawing laid at 640 × 370 px from (100, 50): k = min(640/560, 370/370) = 1, centred 40 px from the left
    const svg = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 640, height: 370 }) };
    const mark12 = 50 + 11 * (470 / 20); // the ruler: 1 at 50, 21 at 520
    const p = courtPoint(svg, { clientX: 100 + 40 + mark12, clientY: 50 + 40 });
    expect(p.x).toBeCloseTo(mark12, 6);
    expect(p.y).toBeCloseTo(40, 6);
  });
});
