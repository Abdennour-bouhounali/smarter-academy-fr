import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import Lists from './tools/Lists';

const noop = () => {};
const draw = (a, b, start) =>
  renderToString(
    <Lists a={a} b={b} start={start} play={noop} report={noop} range={{ a: [1, 120], b: [1, 120] }} />,
  ).replaceAll('<!-- -->', '');

describe('Mon labo — « L’établi des deux listes » draws what it reads', () => {
  it('opens on two empty lists, the first number to try calling the hand, and nothing read yet', () => {
    const html = draw(40, 56);
    expect(html).toContain('data-tried="0"');
    expect(html).toContain('data-ll-try="1"');
    expect(html).toContain('Essaie 1');
    expect(html).toContain('ll-btn--call');
    expect(html.match(/data-ll-open/g)).toHaveLength(2); // both lists still open
    expect(html).not.toContain('data-ll-d=');
    expect(html).not.toContain('data-ll-link');
    expect(html).not.toContain('PGCD');
    expect(html).not.toMatch(/\$/);
  });

  it('half-way: each list holds the numbers tried and their partners; one list closed, the other open', () => {
    const html = draw(40, 56, 6);
    expect(html).toContain('data-all="1,2,4,5,8,10,20,40"');
    expect(html).toContain('data-all="1,2,4,14,28,56"'); // 7 and its partner 8 not tried yet
    expect(html).toContain('data-ll-n="40" data-ll-done="true"');
    expect(html).toContain('data-ll-n="56" data-ll-done="false"');
    expect(html.match(/data-ll-open/g)).toHaveLength(1);
    expect(html).toContain('data-ll-try="7"');
    expect(html).not.toContain('data-ll-link');
  });

  it('both lists closed: a line for every number in both, the crown on the greatest, the PGCD read', () => {
    const html = draw(40, 56, 7);
    expect(html).toContain('data-done="true"');
    for (const v of [1, 2, 4, 8]) expect(html).toContain(`data-ll-link="${v}"`);
    expect(html).not.toContain('data-ll-link="5"');
    expect(html.match(/data-ll-crown/g)).toHaveLength(1);
    expect(html).toContain('data-ll-g="8"');
    expect(html).toContain('Dans les deux listes\u00a0: 1, 2, 4 et 8 — le plus grand est 8');
    expect(html).toContain('Les deux listes sont complètes');
    expect(html).not.toContain('data-ll-open');
    // the drawing holds numbers only: no raw formula, no LaTeX
    const svg = html.slice(html.indexOf('<svg'), html.indexOf('</svg>'));
    expect(svg).not.toMatch(/\\|\$/);
  });

  it('the smaller dividing the greater: its whole list is linked; a number and itself: one list twice', () => {
    const nest = draw(70, 14, 8);
    for (const v of [1, 2, 7, 14]) expect(nest).toContain(`data-ll-link="${v}"`);
    expect(nest).toContain('data-ll-g="14"');
    const twins = draw(36, 36, 6);
    expect(twins.match(/data-ll-link=/g)).toHaveLength(9);
    expect(twins).toContain('data-ll-g="36"');
  });

  it('120, the number with the most divisors it can show: 16 numbers, none outside the drawing', () => {
    const html = draw(120, 96, 10);
    expect(html).toContain('data-all="1,2,3,4,5,6,8,10,12,15,20,24,30,40,60,120"');
    const xs = [...html.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="46"/g)].map((m) => Number(m[1]));
    expect(xs.length).toBe(16 + 12);
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + 46).toBeLessThanOrEqual(940);
    }
  });
});
