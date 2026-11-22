import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import { blocksOf } from '../logic/decimalComma';
import { layoutBlocks } from './mosaicLayout';
import { MosaicBlocks, MosaicDefs, TenMachine, Craftswoman, CraftswomanAvatar, rankHue, PIECE } from './MosaicFigure';
import CommaSlip from './CommaSlip';
import { slipLayout, ranksOf } from '../logic/decimalComma';

const count = (out, k) => (out.match(new RegExp(`data-dc-block="${k}"`, 'g')) ?? []).length;

describe('MosaicBlocks — the DOM counts are the digits, at every comma place', () => {
  it('panels, strips, tiles and shards drawn = the digits of their ranks (shards in the lens)', () => {
    for (const digits of ['235', '37', '05', '3125', '250', '909']) {
      for (let p = 0; p <= digits.length; p += 1) {
        const v = D.fromSlip(digits, p);
        const { groups, pieces } = blocksOf(v);
        const layout = layoutBlocks(groups, { width: 300, height: 130 });
        const out = renderToString(<svg><MosaicDefs uid="t" c={layout.s / 10} /><MosaicBlocks layout={layout} uid="t" /></svg>);
        // single panels (the bundle also carries data-dc-block="panel" + data-count)
        const bundles = (out.match(/data-dc-block="panel" data-count="\d+"/g) ?? []).length;
        expect(count(out, 'panel') - bundles, `${digits}/${p}`).toBe(pieces.units);
        expect(count(out, 'strip')).toBe(pieces.tenths);
        expect(count(out, 'tile')).toBe(pieces.hundredths);
        expect(count(out, 'shard')).toBe(pieces.thousandths);
        const above = pieces.panels - pieces.units;
        if (above > 0) expect(out).toContain(`data-count="${above}"`);
        else expect(bundles).toBe(0);
      }
    }
  });

  it('every kind has its own colour, the rank hues follow the rank', () => {
    expect(new Set(['panel', 'strip', 'tile', 'shard'].map((k) => PIECE[k].a)).size).toBe(4);
    expect(rankHue(0)).toBe(PIECE.panel);
    expect(rankHue(-1)).toBe(PIECE.strip);
    expect(rankHue(-2)).toBe(PIECE.tile);
    expect(rankHue(-3)).toBe(PIECE.shard);
    expect(rankHue(2).a).not.toBe(rankHue(-2).a);
  });
});

describe('the workshop figures', () => {
  it('the craftswoman is a KidFigure in a hijab and reacts; the avatar too', () => {
    for (const mood of ['neutral', 'happy', 'proud', 'wonder']) {
      expect(renderToString(<Craftswoman mood={mood} />)).toContain(`data-dc-kid="${mood}"`);
      expect(renderToString(<CraftswomanAvatar mood={mood} />)).toContain(`data-dc-kid="${mood}"`);
    }
  });
  it('the machine shows its operator and one link per digit', () => {
    const out = renderToString(<TenMachine width={400} op="÷100" links={[{ x1: 100, x2: 100, delta: -2 }, { x1: 150, x2: 150, delta: -2 }]} />);
    expect(out).toContain('data-dc-op="÷100"');
    expect((out.match(/data-dc-link=/g) ?? []).length).toBe(2);
    expect(out).not.toContain('NaN');
  });
});

describe('CommaSlip — the comma handle and its three ways', () => {
  const lay = slipLayout({ width: 400, len: 3 });
  const props = (extra = {}) => ({ role: 'output', str: '235', pos: 1, layout: lay, ranks: ranksOf('235', 2).map((r) => ({ ...r, hue: rankHue(r.exp) })), editable: true, written: '2,35', labels: { comma: 'c', gap: 'g', removeZero: 'r' }, ...extra });
  it('is a slider (keyboard), a handle of at least 44 px, and four tappable gaps for three digits', () => {
    const out = renderToString(<CommaSlip {...props()} />);
    expect(out).toContain('role="slider"');
    expect(out).toContain('aria-valuenow="2"');
    expect(out).toContain('aria-valuemax="3"');
    expect(out).toMatch(/data-dc-comma/);
    const size = Number(out.match(/data-dc-comma[^>]*style="[^"]*width:(\d+)px/)?.[1] ?? 0);
    expect(size).toBeGreaterThanOrEqual(44);
    expect((out.match(/data-dc-gap="/g) ?? []).length).toBe(4);
    expect((out.match(/data-dc-digit="/g) ?? []).length).toBe(3);
    expect((out.match(/data-dc-rank="/g) ?? []).length).toBe(3);
    expect(out).toContain('data-dc-written-comma'); // the comma written between digits
  });
  it('an integer (comma at the far right) has no written comma; the comma before the first digit prints a ghost 0', () => {
    expect(renderToString(<CommaSlip {...props({ pos: 3 })} />)).not.toContain('data-dc-written-comma');
    expect(renderToString(<CommaSlip {...props({ pos: 0 })} />)).toContain('data-dc-ghost');
  });
  it('the input slip has no handle and no tappable gap', () => {
    const out = renderToString(<CommaSlip {...props({ role: 'input', editable: false })} />);
    expect(out).not.toContain('data-dc-comma');
    expect(out).not.toContain('data-dc-gap');
    expect(out).toContain('data-dc-slip="input"');
  });
  it('added zeros are dashed tiles, the outermost removable', () => {
    const out = renderToString(<CommaSlip {...props({ str: '0350', zl: 1, zr: 1, pos: 2, layout: slipLayout({ width: 400, len: 4 }), ranks: ranksOf('0350', 2).map((r) => ({ ...r, hue: rankHue(r.exp) })) })} />);
    expect(out).toContain('data-added="left"');
    expect(out).toContain('data-added="right"');
  });
});
