import { describe, it, expect } from 'vitest';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import { blocksOf } from '../logic/decimalComma';
import { layoutBlocks, commonScale, BUNDLE_OFF } from './mosaicLayout';

const groupsOf = (digits, p) => blocksOf(D.fromSlip(digits, p)).groups;

describe('mosaicLayout — honest sizes, each piece once, inside its zone', () => {
  it('a strip is exactly a tenth of a panel wide and as tall; a tile is a tenth by a tenth', () => {
    const r = layoutBlocks(groupsOf('235', 2), { width: 300, height: 140, s: 60 });
    const strips = r.items.find((i) => i.kind === 'strips');
    const tiles = r.items.find((i) => i.kind === 'tiles');
    const panel = r.items.find((i) => i.kind === 'panel');
    expect(panel.w).toBe(60);
    expect(strips.h).toBe(60);
    expect(strips.c).toBe(6);
    expect(strips.icons).toBe(3);
    expect(tiles.c).toBe(6);
    expect(tiles.icons).toBe(5);
    expect(r.items.filter((i) => i.kind === 'panel')).toHaveLength(2);
  });

  it('every comma place of the preset digits fits a zone and counts exactly', () => {
    for (const digits of ['235', '37', '05', '3125', '605', '250']) {
      for (const [width, height] of [[260, 120], [330, 150], [420, 200], [180, 110]]) {
        for (let p = 0; p <= digits.length; p += 1) {
          const groups = groupsOf(digits, p);
          const r = layoutBlocks(groups, { width, height });
          expect(r.fits, `${digits}/${p} @${width}x${height}`).toBe(true);
          for (const it of r.items) {
            expect(it.x).toBeGreaterThanOrEqual(-0.01);
            expect(it.y).toBeGreaterThanOrEqual(-0.01);
            expect(it.x + it.w).toBeLessThanOrEqual(width + 0.01);
            expect(it.y + it.h).toBeLessThanOrEqual(height + 0.01);
          }
          const panels = r.items.filter((i) => i.kind === 'panel').length + r.items.filter((i) => i.kind === 'bundle').reduce((a, i) => a + i.mult, 0);
          const expected = groups.filter((g) => g.kind === 'panel').reduce((a, g) => a + g.count, 0);
          expect(panels, `${digits}/${p}`).toBe(expected);
          const strips = r.items.find((i) => i.kind === 'strips');
          expect(strips?.icons ?? 0).toBe(groups.find((g) => g.kind === 'strip')?.icons ?? 0);
          const tiles = r.items.find((i) => i.kind === 'tiles');
          expect(tiles?.icons ?? 0).toBe(groups.find((g) => g.kind === 'tile')?.icons ?? 0);
          const lens = r.items.find((i) => i.kind === 'lens');
          expect(lens?.icons ?? 0).toBe(groups.find((g) => g.kind === 'shard')?.icons ?? 0);
          // no two items overlap
          for (let a = 0; a < r.items.length; a += 1) for (let b = a + 1; b < r.items.length; b += 1) {
            const A = r.items[a]; const B = r.items[b];
            const apart = A.x + A.w <= B.x + 0.01 || B.x + B.w <= A.x + 0.01 || A.y + A.h <= B.y + 0.01 || B.y + B.h <= A.y + 0.01;
            expect(apart, `${A.id} / ${B.id}`).toBe(true);
          }
        }
      }
    }
  });

  it('every rank above the units collapses into ONE bundle with the exact count (3125 → ×3120 and 5 panels)', () => {
    const r = layoutBlocks(groupsOf('3125', 0), { width: 300, height: 140 });
    const bundles = r.items.filter((i) => i.kind === 'bundle');
    expect(bundles).toHaveLength(1);
    expect(bundles[0].mult).toBe(3120);
    expect(r.items.filter((i) => i.kind === 'panel')).toHaveLength(5);
    expect(BUNDLE_OFF).toBeGreaterThan(0);
  });

  it('commonScale gives both zones the same panel side', () => {
    const a = groupsOf('235', 2);
    const b = groupsOf('235', 0);
    const box = { width: 260, height: 130 };
    const s = commonScale([a, b], box);
    expect(s).toBeLessThanOrEqual(layoutBlocks(a, box).s);
    expect(layoutBlocks(a, { ...box, s }).items.find((i) => i.kind === 'panel').w).toBe(s);
    expect(layoutBlocks(b, { ...box, s }).items.find((i) => i.kind === 'bundle' || i.kind === 'panel').h).toBeGreaterThanOrEqual(s);
  });
});
