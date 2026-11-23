/**
 * « L’échelle des facteurs » (`factor`, the instrument of « Décomposer un nombre en facteurs premiers »): what it draws for a
 * number of the student's own at each moment — the whole gap, a plank that filled, one that did not, the gap down to 1
 * case — computed by the world's own law (`divisorIsles/factorLadder.js`), left to right, facts only.
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import FactorLadder, { RACK, chipAt } from './tools/FactorLadder';
import { layPlank } from '../gameworld/divisorIsles/factorLadder';
import { TOOLS, clampFor } from './registry';
import { QUESTS, luckyPair } from './logic';

const noop = () => {};
const html = (a, start) =>
  renderToString(<FactorLadder a={a} b={1} play={noop} report={noop} start={start} />).replaceAll('<!-- -->', '');
const VW = 940;
const VH = 370;

describe('Mon labo — « L’échelle des facteurs »', () => {
  it('opens on the whole gap: one rung, the rack of planks 2 to 13 and the whole gap, nothing laid', () => {
    const out = html(72);
    expect(out).toContain('data-left="72"');
    expect(out).toContain('data-ll-factor-gap="72"');
    expect(out).toContain('Fossé : 72 cases');
    expect([...out.matchAll(/data-ll-factor-rung="(\d+)"/g)].map((m) => m[1])).toEqual(['72']);
    for (const d of RACK) expect(out).toContain(`data-ll-factor-plank="${d}"`);
    expect(out).toContain('data-ll-factor-whole');
    expect(out).toContain('Rangée : aucune planche');
    expect(out).toContain('class="ll-pulse"'); // a hand that never moved: the first plank pulses
    expect(out).not.toContain('data-ll-factor-product');
  });

  it('a plank that filled writes its rung and shortens the gap; one that did not leaves its rest in amber', () => {
    const held = html(72, { planks: [2], last: layPlank(72, 2) });
    expect([...held.matchAll(/data-ll-factor-rung="(\d+)"/g)].map((m) => m[1])).toEqual(['72', '36']);
    expect(held).toContain('data-ll-factor-lay-drawn="2:held"');
    expect(held).toContain('Le fossé fait maintenant 36 cases');
    expect(held).toContain('36 planches de 2 sur 72 cases');
    const fell = html(72, { planks: [2], last: layPlank(36, 5) });
    expect(fell).toContain('data-ll-factor-lay-drawn="5:fell"');
    expect(fell).toContain('7 planches de 5 sur 36 cases, reste 1');
    expect(fell).toContain('fill="#fbbf24"'); // what is left, in amber
    expect(fell).toContain('data-ll-factor-last="fell"');
    // a plank longer than the gap is out of reach
    const small = html(72, { planks: [2, 2, 2, 3], last: layPlank(9, 3) });
    expect(small).toMatch(/opacity="0.35" data-ll-factor-plank="4"/);
    expect(small).toMatch(/opacity="1" data-ll-factor-plank="3"/);
  });

  it('down to 1 case: the ladder whole, the row as one product of the number, the rack closed', () => {
    const out = html(2387, { planks: [7, 11, 31], last: layPlank(31, 31) });
    expect([...out.matchAll(/data-ll-factor-rung="(\d+)"/g)].map((m) => m[1])).toEqual(['2387', '341', '31', '1']);
    expect(out).toContain('data-left="1"');
    expect(out).toContain('2 387 = 7 × 11 × 31');
    expect(out).toContain('data-ll-factor-done');
    expect(out).toContain('Le fossé est franchi avec 3 planches');
    expect(out).toMatch(/opacity="0.35" data-ll-factor-whole/);
    // 13 rungs + the last (8 192 = 2¹³): the ladder stays inside the drawing
    const tall = html(8192, { planks: Array(13).fill(2), last: layPlank(2, 2) });
    const ys = [...tall.matchAll(/<text x="170" y="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(ys).toHaveLength(14);
    expect(Math.max(...ys)).toBeLessThanOrEqual(VH - 10);
  });

  it('reads left to right: the shortest plank on the left, the whole gap last, every chip inside the drawing', () => {
    for (let k = 1; k < RACK.length; k += 1) {
      const [p, q] = [chipAt(k - 1), chipAt(k)];
      expect(q.y > p.y || q.x > p.x, `${RACK[k]} after ${RACK[k - 1]}`).toBe(true);
    }
    const w = chipAt(RACK.length);
    expect(w.x + 74 + 86).toBeLessThanOrEqual(VW);
    for (let k = 0; k <= RACK.length; k += 1) expect(chipAt(k).x).toBeGreaterThanOrEqual(0);
  });

  it('is tagged to its lesson, with its quests, numbers it can draw, and no word of the lesson’s rules', () => {
    const t = TOOLS.find((x) => x.id === 'factor');
    expect(t).toMatchObject({ lesson: 'decomposer-en-facteurs-premiers', needs: 'a' });
    expect(t.range.a).toEqual([2, 9999]);
    expect(QUESTS.factor.map((q) => q.id)).toEqual(['end', 'long', 'big']);
    let s = 11;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    for (let i = 0; i < 200; i += 1) {
      const p = luckyPair(t, rand);
      expect(clampFor(t, p.a, p.b)).toEqual(p);
      expect(p.a).toBeGreaterThanOrEqual(60);
    }
    const src = readFileSync(new URL('./tools/FactorLadder.jsx', import.meta.url), 'utf8');
    const words = [src, t.name, t.hint, ...QUESTS.factor.map((q) => q.text)].join(' ').toLowerCase();
    // the instrument's NAME carries « facteurs » (the owner's brief); its drawing, hint and quests name no rule
    const said = [
      t.hint,
      ...QUESTS.factor.map((q) => q.text),
      html(72),
      html(2387, { planks: [7, 11, 31], last: null }),
    ]
      .join(' ')
      .toLowerCase();
    for (const w of ['premier', 'facteur', 'puissance', 'exposant', 'carré', 'tableur', 'décompos'])
      expect(said, w).not.toContain(w);
    expect(words).not.toMatch(/\bfaux\b|\bbravo\b|\bgagné\b/);
  });
});
