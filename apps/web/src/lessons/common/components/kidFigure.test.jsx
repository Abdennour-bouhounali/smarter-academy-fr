import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import KidFigure from './KidFigure';
import { kidGeometry, kidBox, kidLook, SKINS, HAIRS, OUTFITS, HAIR_STYLES, SCARVES } from './kidFigure.js';

/** The platform's ONE character (CLAUDE.md « People »): the drawing of a child never cheats on his height. */
const svg = (el) => renderToStaticMarkup(<svg>{el}</svg>);
const nums = (out, attr) => [...out.matchAll(new RegExp(`\\s${attr}="(-?[0-9.e-]+)"`, 'g'))].map((m) => Number(m[1]));
/** Le bas (y + height) de chaque <rect> de couleur `fill`. */
const rectBottoms = (out, fill) => [...out.matchAll(/<rect ([^>]*?)\/?>/g)].map((m) => m[1])
  .filter((a) => a.includes(`fill="${fill}"`))
  .map((a) => Number(/\sy="([^"]+)"/.exec(` ${a}`)[1]) + Number(/\sheight="([^"]+)"/.exec(` ${a}`)[1]));

describe('KidFigure — the drawing is the measure', () => {
  it('the crown is exactly `top` and the soles touch `foot`, at any scale', () => {
    for (const [top, foot] of [[40, 400], [100, 260], [12.5, 90]]) {
      const g = kidGeometry({ cx: 100, top, foot });
      expect(g.head.cy - g.head.ry).toBeCloseTo(top, 9);
      expect(g.u).toBeCloseTo((foot - top) / 100, 9);
      expect(g.shoulderY).toBeGreaterThan(g.head.cy + g.head.ry * 0.6);
      expect(g.hemY).toBeLessThan(g.kneeY);
      expect(g.kneeY).toBeLessThan(g.shoeTop);
      expect(g.shoeTop).toBeLessThan(foot);
      // les semelles (rect blanc) se terminent sur le sol
      const out = svg(<KidFigure cx={100} top={top} foot={foot} shadow={false} />);
      expect(Math.max(...rectBottoms(out, '#FFFFFF'))).toBeCloseTo(foot, 6);
    }
  });

  it('nothing is drawn above the crown, whatever the hair style (the hijab included)', () => {
    for (const hairStyle of HAIR_STYLES) {
      const out = svg(<KidFigure cx={100} top={50} foot={350} hairStyle={hairStyle} />);
      // le haut de chaque ellipse / cercle / rectangle reste sous le crâne (les chemins sont bornés par construction)
      const tops = [
        ...[...out.matchAll(/<ellipse ([^>]*?)\/?>/g)].map((m) => Number(/\scy="([^"]+)"/.exec(` ${m[1]}`)[1]) - Number(/\sry="([^"]+)"/.exec(` ${m[1]}`)[1])),
        ...[...out.matchAll(/<circle ([^>]*?)\/?>/g)].map((m) => Number(/\scy="([^"]+)"/.exec(` ${m[1]}`)[1]) - Number(/\sr="([^"]+)"/.exec(` ${m[1]}`)[1])),
        ...nums(out, 'y'),
      ];
      expect(Math.min(...tops)).toBeGreaterThanOrEqual(50 - 1e-6);
    }
  });

  it('kidBox spans the drawing; kidLook is deterministic and uses known palettes', () => {
    const b = kidBox({ cx: 80, top: 20, foot: 320 });
    expect(b.y0).toBe(20);
    expect(b.y1).toBe(320);
    expect(b.x0).toBeLessThan(80);
    expect(b.x1).toBeGreaterThan(80);
    expect(kidLook(3)).toEqual(kidLook(3));
    for (let i = 0; i < 12; i += 1) {
      const l = kidLook(i);
      expect(SKINS[l.skin]).toBeTruthy();
      expect(HAIRS[l.hair]).toBeTruthy();
      expect(OUTFITS[l.outfit]).toBeTruthy();
      expect(HAIR_STYLES).toContain(l.hairStyle);
    }
  });

  it('passes data-* attributes in order and draws the « ؟ » badge only when unknown', () => {
    const out = svg(<KidFigure cx={50} top={10} foot={210} data-sb-person="amine" data-height="130" />);
    expect(out).toContain('data-sb-person="amine" data-height="130"');
    expect(out).not.toContain('data-kid-unknown');
    expect(svg(<KidFigure cx={50} top={10} foot={210} unknown mark="؟" />)).toContain('data-kid-unknown');
  });
});

describe('KidFigure — girls wear the hijab and Islamic dress (owner, 2026-10-14)', () => {
  it('no uncovered-hair style exists for a girl; the hijab brings the scarf, the forehead band and the long tunic', () => {
    expect(HAIR_STYLES).toEqual(['short', 'curly', 'hijab']);
    for (const scarf of Object.keys(SCARVES)) {
      const out = svg(<KidFigure cx={100} top={40} foot={400} hairStyle="hijab" scarf={scarf} outfit="pink" />);
      expect(out).toContain('data-kid-hijab');
      expect(out).toContain('data-kid-tunic');
      expect(out).toContain(`fill="${SCARVES[scarf].main}"`);
      expect(out).toContain(`fill="${SCARVES[scarf].inner}"`);
    }
    // un garçon garde son sweat à capuche, sans tunique
    expect(svg(<KidFigure cx={100} top={40} foot={400} hairStyle="short" />)).not.toContain('data-kid-tunic');
  });
});
