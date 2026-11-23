// What the first French lesson's walk found on two experiment screens at 1366×768 (2026-11-23), held as data so the next
// lesson learns it without a browser:
//   pairs — on a long gap (221 cases) the planks stand a few units apart on the strip: the numbers written under it must
//           not touch (`spacedLabels`), and the table of 16 planks must share the frame's width (its columns shrink;
//           its headings on the LEFT, French reading order);
//   sheet — the kind's two blocks stand SIDE BY SIDE: its `.iq-sheet` is scoped, the proof's notebook (a column) has the
//           same class name.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spacedLabels, stripScale } from './Inquiry';

const css = (f) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
/** The block of the rule whose selector is exactly `sel` — alone, not the last of a list « a,\n b { ». */
const rule = (text, sel) => {
  const re = new RegExp(`^${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{`, 'gm');
  const m = [...text.matchAll(re)].find((x) => !/,\s*$/.test(text.slice(0, x.index)));
  return m ? text.slice(m.index, text.indexOf('}', m.index)) : null;
};

describe('pairs — the numbers under the strip never touch', () => {
  const x = (a) => (n) => 44 + (n / a) * 912;
  const lay = (a, held, fell) => {
    const X = x(a);
    return [
      ...held.map(([d]) => ({ key: `d${d}`, x: X(d), text: d, size: 19 })),
      ...held.filter(([d, q]) => q !== d).map(([d, q]) => ({ key: `q${d}`, x: X(q), text: q, size: 19 })),
      ...fell.map((d) => ({ key: `f${d}`, x: X(d), text: d, size: 16 })),
    ];
  };
  const apart = (items, kept) => {
    const on = items
      .filter((it) => kept.has(it.key))
      .map((it) => ({ ...it, w: String(it.text).length * 0.62 * it.size }));
    for (let i = 0; i < on.length; i += 1)
      for (let j = i + 1; j < on.length; j += 1)
        expect(Math.abs(on[i].x - on[j].x)).toBeGreaterThanOrEqual((on[i].w + on[j].w) / 2);
  };

  it('221 cases, planks 1 to 16 tried: the planks that hold first, no two labels touch', () => {
    const items = lay(
      221,
      [
        [1, 221],
        [13, 17],
      ],
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16],
    );
    const kept = spacedLabels(items);
    expect(kept.has('d1')).toBe(true);
    expect(kept.has('q1')).toBe(true);
    expect(kept.has('d13')).toBe(true);
    apart(items, kept);
  });

  it('91 cases: 1, 7 and 13 and their partners stay; the fallen planks between them only where there is room', () => {
    const items = lay(
      91,
      [
        [1, 91],
        [7, 13],
        [13, 7],
      ].slice(0, 2),
      [2, 3, 4, 5, 6, 8, 9, 10, 11],
    );
    const kept = spacedLabels(items);
    for (const k of ['d1', 'q1', 'd7', 'q7']) expect(kept.has(k)).toBe(true);
    apart(items, kept);
  });

  it('a short gap (36 cases) keeps every label', () => {
    const items = lay(
      36,
      [
        [1, 36],
        [2, 18],
        [3, 12],
        [4, 9],
      ],
      [5],
    );
    expect(spacedLabels(items).size).toBe(items.length);
  });
});

describe('pairs — a long gap is drawn in two parts, a short one at one scale', () => {
  const lastNeeded = (a) => Math.floor(Math.sqrt(a));
  it('221 cases (16 planks tried): the tried planks and the crossing at full size, a break, the rest squeezed', () => {
    const end = lastNeeded(221) + 2;
    const { x, zoom, breakAt } = stripScale(221, end);
    expect(zoom).toBeGreaterThan(end);
    expect(breakAt).toBeGreaterThan(x(zoom));
    expect(breakAt).toBeLessThan(x(zoom + 1));
    // in order, left to right, from the first plank to the far end
    for (let n = 1; n < 221; n += 1) expect(x(n + 1)).toBeGreaterThan(x(n));
    expect(x(221)).toBeCloseTo(956);
    // every tried plank has room for its number (16 px labels): no lone survivor, the planks all named
    const fell = Array.from({ length: end }, (_, i) => i + 1).filter((d) => 221 % d !== 0);
    const items = fell.map((d) => ({ key: `f${d}`, x: x(d), text: d, size: 16 }));
    expect(spacedLabels(items).size).toBe(items.length);
    // the place where plank and partner cross (√221 ≈ 14.9) stands in the full-size part
    expect(Math.sqrt(221)).toBeLessThan(zoom);
  });
  it('91 and 97 cases are long too (10 px a plank); 36 cases keep one scale (25 px a plank)', () => {
    for (const a of [91, 97]) expect(stripScale(a, lastNeeded(a) + 2).zoom).toBeGreaterThan(lastNeeded(a) + 2);
    expect(stripScale(36, lastNeeded(36) + 2).zoom).toBe(null);
  });
});

describe('pairs — the table of the planks shares the frame’s width', () => {
  const c = css('./inquiry.css');
  it('its columns shrink (no fixed minimum width) and its headings are not sent to the end', () => {
    const tr = rule(c, '.iq-try');
    expect(tr).toMatch(/flex: 0 1 4\.6rem/);
    expect(tr).toMatch(/min-width: 0/);
    const head = rule(c, '.iq-table__head');
    expect(head).not.toMatch(/order:/);
  });
});

describe('sheet — its two blocks side by side', () => {
  it('the kind’s sheet is scoped and laid in a row', () => {
    const s = rule(css('./inquirySheet.css'), '.iq--sheet .iq-sheet');
    expect(s).toMatch(/flex-direction: row/);
    expect(css('./inquirySheet.css')).not.toMatch(/^\.iq-sheet \{/m);
  });
});
