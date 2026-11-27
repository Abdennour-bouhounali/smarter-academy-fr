/**
 * The forge's parts draw a case that brings ITS OWN drawing (`c.scene`, a GeoFigure spec — two triangles apart) as it
 * is: in the mirror (no gauge), in a line of evidence (its thumbnail `c.thumb`), and in the last step (at its 12 px label
 * floor, `sceneFigure`). A Thalès case is drawn as before.
 */
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Line, Mirror, UseFigure, sceneFigure, thumbSpec } from './forgeParts';
import { thalesCase } from './ruleForge';

globalThis.window = globalThis.window ?? {};

const scene = {
  points: { A: [0, 0], B: [4, 0], C: [1, 3], D: [6, 0], E: [12, 0], F: [7.5, 4.5] },
  segments: [
    { from: 'A', to: 'B', label: '4' },
    { from: 'B', to: 'C' },
    { from: 'C', to: 'A' },
    { from: 'D', to: 'E', label: '6' },
    { from: 'E', to: 'F' },
    { from: 'F', to: 'D' },
  ],
  ariaLabel: 'Deux triangles posés à part',
};
const thumb = { ...scene, segments: scene.segments.map(({ label, ...s }) => s) };
const c = { id: 'pair|ABC|DEF', held: true, head: '$ABC$ et $DEF$', tag: 'même forme', scene, thumb };

describe('forgeParts — a case with its own scene', () => {
  it('the mirror draws the scene, no gauge, its verdict once built', () => {
    const html = renderToString(createElement(Mirror, { c, stage: 'done' }));
    expect(html).toContain('data-np-scene');
    expect(html).toContain('data-rf-kind="held"');
    expect(html).not.toContain('data-rf-gauge');
    expect(html).toContain('>4<');
  });
  it('a line draws the thumbnail (no number), its head and its tag', () => {
    const html = renderToString(createElement(Line, { c: { ...c, mirror: true } }, 'x'));
    expect(html).toContain('data-np-line="held"');
    expect(html).not.toContain('>4<');
    expect(html).toContain('même forme');
    expect(html).toContain('🪞');
    // the mirror's verdict on his rule: on a line of its own, under the name and the tag (gate B, 2026-11-27)
    expect(html).toContain('data-np-line-verdict');
    expect(html.indexOf('data-np-line-verdict')).toBeGreaterThan(html.indexOf('np-line__tag'));
    expect(renderToString(createElement(Line, { c }))).not.toContain('data-np-line-verdict');
  });
  it("a line's thumbnail writes NO text at all (no vertex letter, no length, no angle): it would fall under 12 px", () => {
    const angled = { ...scene, angles: [{ at: 'A', from: 'B', to: 'C', label: '40°' }], labels: { A: 'sw' } };
    const html = renderToString(createElement(Line, { c: { ...c, scene: angled, thumb: angled } }));
    const svg = html.slice(html.indexOf('<svg'), html.indexOf('</svg>'));
    expect(svg).not.toContain('<text');
    expect(svg).toContain('<line');
    const t = thumbSpec(angled);
    expect(t.hidden).toEqual(Object.keys(angled.points));
    expect(t.angles[0].label).toBeUndefined();
    expect(angled.angles[0].label).toBe('40°');
  });
  it('the last step draws it at its 12 px floor, within the room', () => {
    const f = sceneFigure(c);
    expect(f.fits).toBe(true);
    expect(f.width).toBeGreaterThan(0);
    expect(renderToString(createElement(UseFigure, { c }))).toContain('data-np-use-figure="fits"');
    expect(sceneFigure({})).toBeNull();
  });
  it('a Thalès case is drawn as before: the gauge in the mirror', () => {
    const t = thalesCase({
      kind: 'nested',
      names: { V: 'A', M: 'M', B: 'B', N: 'N', C: 'C' },
      len: { VM: '2', VB: '6', VN: '3', VC: '9', MN: '4', BC: '12' },
    });
    const html = renderToString(createElement(Mirror, { c: t, stage: 'done' }));
    expect(html).not.toContain('data-np-scene');
    expect(html).toContain('data-rf-gauge');
  });
});
