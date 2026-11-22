import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import FractionPlatform, { piecePoint } from './tools/FractionPlatform';

const VW = 560; // the drawing's viewBox (tools/FractionPlatform.jsx)
const VH = 370;
const noop = () => {};
const draw = (a, b, start) =>
  renderToString(
    <FractionPlatform a={a} b={b} start={start} play={noop} report={noop} range={{ a: [1, 50], b: [1, 12] }} />,
  ).replaceAll('<!-- -->', '');
const svgOf = (html) => html.slice(html.indexOf('<svg'), html.indexOf('</svg>'));
const factsOf = (html) => html.slice(html.indexOf('data-ll-piece-facts'));
/** Every number a drawn attribute takes (x, width…), to check that nothing leaves the drawing. */
const nums = (html, attr) =>
  [...svgOf(html).matchAll(new RegExp(` ${attr}="([-\\d.]+)"`, 'g'))].map((m) => Number(m[1]));

describe('Mon labo — « La plateforme de la fraction » draws what it counts', () => {
  it('opens on a rod of one tile (q/q), the handle calling the hand, nothing kept yet — no raw formula in the drawing', () => {
    const html = draw(2, 5);
    // a court of 2 tiles cut in 5 × 5: 50 pieces; the rod 5/5 holds 25 — a band of 25 pieces
    expect(html).toContain(
      'data-ll-piece="2" data-q="5" data-p="5" data-court="50" data-plat="25" data-verdict="band" data-far="25"',
    );
    expect(html).toContain('ll-pulse');
    expect(html).toContain('data-ll-piece-band="25"');
    expect(html).toContain('Il reste une bande\u00a0: 25\u00a0morceaux');
    expect(html).toContain('data-ll-piece-rod="5/5"'); // the fraction drawn with its bar, never « 5/5 » as text
    expect(svgOf(html)).not.toMatch(/\\|\$|>5\/5</);
    expect(factsOf(html)).toContain('ll-court__wait'); // no nearest rod before the hand moved
    expect(html).not.toContain('data-ll-piece-best');
  });

  it('a rod of 7/5 on 2: one piece short — and the nearest rod kept with its difference in tiles, a fraction with its bar', () => {
    const html = draw(2, 5, { p: 7, best: { p: 7, q: 5, far: 1 } });
    expect(html).toContain('data-court="50" data-plat="49" data-verdict="band" data-far="1"');
    expect(html).toContain('Il reste une bande\u00a0: 1\u00a0morceau<');
    expect(html).toContain('data-ll-piece-best="7:5:1"');
    expect(factsOf(html)).toContain('7 \\times 7 = 49');
    expect(factsOf(html)).toContain('2 \\times 25 = 50');
    // the difference: 1 piece of the 25 of a tile
    expect(factsOf(html)).toContain('\\dfrac{1}{25}');
    // the difference stands on its own line (on the rod's line it ran out of the card at 1366×768)
    expect(html).toMatch(/<p data-ll-piece-far="[^"]*">Écart\u00a0: /);
    expect(html).not.toContain('ll-pulse'); // the hand has moved
  });

  it('a rod that holds more: the overhang in violet, never the red of an error', () => {
    const html = draw(2, 5, { p: 8, best: { p: 7, q: 5, far: 1 } });
    expect(html).toContain('data-plat="64" data-verdict="jam" data-far="14"');
    expect(html).toContain('data-ll-piece-over="14"');
    expect(html).toContain('La plateforme dépasse de 14\u00a0morceaux');
    expect(html).toContain('ll-chip--jam');
    expect(html).not.toMatch(/\bfaux\b|fausse|erreur|#f87171|#ef4444/i);
    expect(html).toContain('data-ll-piece-best="7:5:1"'); // the record stays the nearest
  });

  it('a perfect square: 12/4 covers a court of 9 exactly; its pieces are drawn', () => {
    const html = draw(9, 4, { p: 12, best: { p: 12, q: 4, far: 0 } });
    expect(html).toContain('data-court="144" data-plat="144" data-verdict="fits" data-far="0"');
    expect(html).toContain('La plateforme couvre exactement la salle');
    expect(html).toContain('data-ll-piece-grid="4"');
    expect(html).toContain('data-ll-piece-best="12:4:0"');
    expect(html).toContain('Une salle de 9\u00a0dalles');
  });

  it('a denominator of 1 writes whole numbers; the largest court and denominator stay inside the drawing', () => {
    const one = draw(10, 1, { p: 3, best: { p: 3, q: 1, far: 1 } });
    expect(one).toContain('data-court="10" data-plat="9" data-verdict="band" data-far="1"');
    expect(one).not.toContain('data-ll-piece-rod='); // 3/1 is written 3
    expect(factsOf(one)).toContain('Écart\u00a0: 1\u00a0dalle');
    for (const [a, b, p] of [
      [50, 12, 97],
      [50, 12, 1],
      [1, 1, 3],
      [1, 12, 25],
    ]) {
      const html = draw(a, b, { p, best: null });
      for (const x of [...nums(html, 'x'), ...nums(html, 'x1'), ...nums(html, 'x2'), ...nums(html, 'cx')])
        expect(x, `${a}, ${b}, ${p}: x`).toBeGreaterThanOrEqual(0);
      for (const x of [...nums(html, 'x'), ...nums(html, 'x1'), ...nums(html, 'x2')])
        expect(x, `${a}, ${b}, ${p}: x`).toBeLessThanOrEqual(VW);
      for (const y of [...nums(html, 'y'), ...nums(html, 'y1'), ...nums(html, 'y2')]) {
        expect(y, `${a}, ${b}, ${p}: y`).toBeGreaterThanOrEqual(0);
        expect(y, `${a}, ${b}, ${p}: y`).toBeLessThanOrEqual(VH - 8);
      }
    }
    // the rod is clamped to the ruler: never beyond one tile past the court
    expect(draw(1, 1, { p: 40 })).toContain('data-p="3"');
  });

  it('maps the pointer in ITS viewBox (560 × 370), not the kit’s default 940 × 370 (ledger D38)', () => {
    const svg = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 560, height: 370 }) };
    expect(piecePoint(svg, { clientX: 280, clientY: 185 })).toEqual({ x: 280, y: 185 });
  });
});
