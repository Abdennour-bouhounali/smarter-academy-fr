/**
 * Mon labo — the drawings read LEFT TO RIGHT (the French direction, FRENCH_LANGUAGE_CONTRACT.md §8). The Arabic lab laid
 * several drawings « from the right »; each one turned is pinned here by its geometry: the FIRST thing is on the LEFT.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import Rows from './tools/Rows';
import Duo from './tools/Duo';
import Strip from './tools/Strip';
import Lists from './tools/Lists';
import Bracket from './tools/Bracket';
import PaperDivision from './tools/PaperDivision';

const noop = () => {};
const html = (el) => renderToString(el).replaceAll('<!-- -->', '');
const VW = 940;

describe('Mon labo — the drawings read left to right', () => {
  it('« Les rangées de la division »: the counters fill each row from the LEFT, the wall and its labels after them', () => {
    const out = html(<Rows a={17} b={5} setB={noop} play={noop} range={{ a: [1, 144], b: [1, 24] }} />);
    const xs = [...out.matchAll(/translate\(([\d.]+)px, ([\d.]+)px\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(xs).toHaveLength(17);
    // the first counter of the first row is the leftmost; the second stands to its right
    expect(xs[0][0]).toBeLessThan(xs[1][0]);
    expect(xs[0][1]).toBe(xs[1][1]);
    expect(Math.min(...xs.map(([x]) => x))).toBe(xs[0][0]);
    // the wall stands right of every counter, and « 3 rangées » / « reste 2 » start right of the wall
    const wall = Number(out.match(/<rect x="([\d.]+)" y="[\d.]+" width="10"/)[1]) + 5;
    for (const [x] of xs) expect(x).toBeLessThan(wall);
    const labels = [...out.matchAll(/<text x="([\d.]+)"[^>]*text-anchor="start"[^>]*>([^<]*)</g)].map((m) => [
      Number(m[1]),
      m[2],
    ]);
    expect(labels.map(([, t]) => t)).toEqual(['3 rangées', 'reste 2', 'Fais glisser le mur ← →']);
    for (const [x] of labels) expect(x).toBeGreaterThan(wall);
    // the drag hint never leaves the drawing, even with the widest rows
    const wide = html(<Rows a={144} b={24} setB={noop} play={noop} range={{ a: [1, 144], b: [1, 24] }} />);
    const hint = Number(wide.match(/<text x="([\d.]+)"[^>]*>Fais glisser le mur/)[1]);
    expect(hint + 180).toBeLessThanOrEqual(VW);
  });

  it('« Le microscope à deux nombres »: the first tab on the LEFT, the first column of divisions on the LEFT', () => {
    const out = html(<Duo a={987} b={610} start={{ face: 'divisions', written: 14 }} play={noop} report={noop} />);
    const tab = (id) => {
      const g = out.slice(out.indexOf(`data-ll-face-tab="${id}"`));
      return Number(g.match(/<text x="([\d.]+)"/)[1]);
    };
    expect(tab('lists')).toBeLessThan(tab('divisions'));
    expect(tab('divisions')).toBeLessThan(tab('probe'));
    const rows = [...out.matchAll(/<text x="(\d+)" y="(\d+)"[^>]*data-ll-div="(\d+)"/g)].map((m) =>
      m.slice(1).map(Number),
    );
    const xOf = (i) => rows.find(([, , k]) => k === i)[0];
    expect(xOf(0)).toBeLessThan(xOf(7)); // the 1st division in the left column, the 8th in the right one
    expect(xOf(0)).toBe(xOf(6));
  });

  it('the lengths already tried stand in a row from the LEFT, the first tried first (« La bande de la fraction »)', () => {
    const out = html(<Strip a={12} b={18} start={{ k: 6, tried: [2, 3, 6] }} play={noop} report={noop} />);
    const at = (k) => Number(out.match(new RegExp(`<rect x="([-\\d.]+)"[^>]*data-ll-strip-tried-k="${k}"`))[1]);
    expect(at(2)).toBeLessThan(at(3));
    expect(at(3)).toBeLessThan(at(6));
    expect(at(2)).toBeLessThan(VW / 2);
    // « Le microscope à deux nombres » lays its tried numbers by the same rule (its chips need a gesture to appear)
    const duo = readFileSync(new URL('./tools/Duo.jsx', import.meta.url), 'utf8');
    expect(duo).toContain('x={X0 - 23 + i * 52}');
    expect(duo).not.toContain('X1 - 23 - i * 52');
  });

  it('« L’établi des deux listes »: the number first on the left, then its divisors growing to the right', () => {
    const out = html(<Lists a={40} b={56} start={7} play={noop} report={noop} range={{ a: [1, 120], b: [1, 120] }} />);
    const listA = out.slice(out.indexOf('data-ll-list="A"'), out.indexOf('data-ll-list="B"'));
    const badge = Number(listA.slice(listA.indexOf('data-ll-badge')).match(/<rect x="([\d.]+)"/)[1]);
    const chip = (v) => Number(listA.slice(listA.indexOf(`data-ll-d="${v}"`)).match(/<rect x="([\d.]+)"/)[1]);
    expect(badge).toBeLessThan(chip(1));
    for (const [u, v] of [
      [1, 2],
      [2, 4],
      [4, 5],
      [5, 8],
      [8, 10],
      [10, 20],
      [20, 40],
    ])
      expect(chip(u)).toBeLessThan(chip(v));
  });

  it('the buttons of a row read left to right: one plank less before one more, back before the next step', () => {
    const br = html(<Bracket a={100} b={7} play={noop} report={noop} range={{ a: [1, 9999], b: [2, 999] }} />);
    expect(br.indexOf('data-ll-less')).toBeGreaterThan(-1);
    expect(br.indexOf('data-ll-less')).toBeLessThan(br.indexOf('data-ll-more'));
    const paper = html(<PaperDivision a={756} b={4} play={noop} report={noop} />);
    expect(paper.indexOf('data-ll-back')).toBeGreaterThan(-1);
    expect(paper.indexOf('data-ll-back')).toBeLessThan(paper.indexOf('data-ll-step'));
    expect(paper).toContain('Étape suivante ▸');
  });

  it('no drawing of the lab sets a right-to-left direction, and no string of it is Arabic', () => {
    const files = [
      'LessonLab.jsx',
      'kit.jsx',
      'registry.js',
      'logic.js',
      'lessonLab.css',
      ...[
        'Rows',
        'Jumps',
        'Sentences',
        'Divisors',
        'Planks',
        'Common',
        'Lists',
        'Euclid',
        'Duo',
        'PaperDivision',
        'Bracket',
        'Rules',
        'Strip',
        'NumberCourt',
        'FractionPlatform',
        'FactorLadder',
      ].map((t) => `tools/${t}.jsx`),
    ];
    for (const f of files) {
      const src = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');
      expect(src, f).not.toMatch(/dir="rtl"|direction="rtl"|direction: rtl|row-reverse|Cairo|Tajawal|Amiri|Naskh/);
      expect(src, f).not.toMatch(/[\u0600-\u06FF]/);
    }
  });
});
