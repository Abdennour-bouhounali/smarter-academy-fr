import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import SimilarTriangles, { simLayout } from './tools/SimilarTriangles';
import { similarOf, SIM_K, cRange, sRange } from './similar';

const VW = 940; // the kit's viewBox
const VH = 370;
const noop = () => {};
const draw = (a, b, start) =>
  renderToString(
    <SimilarTriangles a={a} b={b} start={start} play={noop} report={noop} range={{ a: [2, 12], b: [2, 12] }} />,
  ).replaceAll('<!-- -->', '');
const svgOf = (html) => html.slice(html.indexOf('<svg'), html.indexOf('</svg>'));
const nums = (html, attr) =>
  [...svgOf(html).matchAll(new RegExp(` ${attr}="([-\\d.]+)"`, 'g'))].map((m) => Number(m[1]));
const marks = (html, row) =>
  [0, 1].map((i) => html.match(new RegExp(`data-ll-sim-mark="${row}-${i}" data-eq="(yes|no)"`))[1]);

describe('Mon labo — « Les deux triangles » draws what it measures', () => {
  it('opens on ABC × 1,5, turned: it covers, every quotient equal — C calls the hand', () => {
    const html = draw(12, 5);
    expect(html).toContain('data-ll-similar="12:5" data-c="13" data-k="1,5" data-s="5" data-rot="60"');
    expect(html).toContain('data-same="yes"');
    expect(html).toContain('ll-pulse');
    expect(html).toContain('data-ll-sim-verdict="covers"');
    expect(html).toContain('data-ll-sim-laid="covers"');
    expect(marks(html, 'ranked')).toEqual(['yes', 'yes']);
    expect(marks(html, 'named')).toEqual(['yes', 'yes']);
    // the quotients written, never evaluated
    expect(html).toContain('7,5 ÷ 5');
    expect(html).toContain('18 ÷ 12');
    expect(html).toContain('19,5 ÷ 13');
    // the three angles of DEF wear the colours of ABC's
    expect((svgOf(html).match(/data-ink="match"/g) ?? []).length).toBe(6);
  });

  it('a slide breaks the shape: ≠, one angle only in colour, DEF laid on ABC misses', () => {
    const html = draw(12, 5, { s: 7, moved: true });
    expect(html).toContain('data-same="no"');
    expect(html).toContain('data-ll-sim-verdict="misses"');
    expect(html).toContain('data-ll-sim-laid="misses"');
    expect(marks(html, 'ranked')).toEqual(['no', 'no']);
    expect((svgOf(html).match(/data-ink="match"/g) ?? []).length).toBe(4); // A, B, C — and D only
    expect(html).toContain('≈ 20,84');
    expect(html).not.toContain('ll-pulse');
  });

  it('its names moved round: by size « = = », by the names « ≠ »', () => {
    const html = draw(12, 5, { names: 1, moved: true });
    expect(html).toContain('data-names="EFD"');
    expect(marks(html, 'ranked')).toEqual(['yes', 'yes']);
    expect(marks(html, 'named')).not.toEqual(['yes', 'yes']);
  });

  it('when DEF covers ABC, it is laid exactly on ABC’s vertices', () => {
    for (const [a, b, c, ki, s, rot, flip, names] of [
      [12, 5, 13, 5, 5, 2, false, 0],
      [6, 4, 8, 3, 9, 7, true, 2],
      [7, 3, 5, 0, 3, 11, true, 1],
    ]) {
      const S = similarOf(a, b, c, ki, s, names);
      expect(S.same).toBe(true);
      const G = simLayout(a, b, c, ki, s, rot, flip, S);
      const laid = Object.values(G.ghost)
        .map((q) => `${q.x.toFixed(6)},${q.y.toFixed(6)}`)
        .sort();
      const abc = Object.values(G.t1)
        .map((q) => `${q.x.toFixed(6)},${q.y.toFixed(6)}`)
        .sort();
      expect(laid).toEqual(abc);
    }
  });

  it('keeps every mark inside the drawing, whatever the triangles', () => {
    for (const [a, b] of [
      [2, 2],
      [12, 12],
      [2, 12],
      [12, 2],
      [7, 4],
    ]) {
      const [clo, chi] = cRange(a, b);
      const [slo, shi] = sRange(a, b);
      for (const c of [clo, chi])
        for (const ki of [0, SIM_K.length - 1])
          for (const s of [slo, shi])
            for (const rot of [0, 4, 9])
              for (const flip of [false, true]) {
                const html = draw(a, b, { c, ki, s, rot, flip, moved: true });
                const xs = [...nums(html, 'x'), ...nums(html, 'cx')];
                const ys = [...nums(html, 'y'), ...nums(html, 'cy')];
                for (const x of xs) expect(x, `${a} ${b} ${c} ${ki} ${s} ${rot}`).toBeGreaterThanOrEqual(0);
                for (const x of xs) expect(x).toBeLessThanOrEqual(VW);
                for (const y of ys) expect(y).toBeGreaterThanOrEqual(0);
                for (const y of ys) expect(y).toBeLessThanOrEqual(VH);
                // the triangles stay above the rows of quotients
                const tri = svgOf(html)
                  .match(/<polygon points="([^"]+)"/g)
                  .flatMap((p) =>
                    p
                      .slice(17, -1)
                      .split(' ')
                      .map((q) => Number(q.split(',')[1])),
                  );
                for (const y of tri) expect(y).toBeLessThan(240);
              }
    }
  });

  it('never writes an error, a rule, or a word of the lesson’s tablets', () => {
    for (const start of [null, { s: 7, moved: true }, { ki: 0, names: 2, moved: true }]) {
      const html = draw(12, 5, start);
      expect(html).not.toMatch(/\bfau(?:x|sses?)\b|erreur|#f87171|#ef4444/i);
      expect(html).not.toMatch(/semblable|homologue|proportion|coefficient|agrandissement|réduction|rapport|180/i);
    }
  });
});
