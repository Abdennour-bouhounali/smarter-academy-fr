import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import KidFigure from './KidFigure';
import { kidGeometry, kidLook, SKINS, HAIRS, OUTFITS, HAIR_STYLES, DEFAULT_HAIR_STYLES, SCARVES } from './kidFigure.js';

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

  it('kidLook is deterministic and uses known palettes', () => {
    expect(kidLook(3)).toEqual(kidLook(3));
    for (let i = 0; i < 12; i += 1) {
      const l = kidLook(i);
      expect(SKINS[l.skin]).toBeTruthy();
      expect(HAIRS[l.hair]).toBeTruthy();
      expect(OUTFITS[l.outfit]).toBeTruthy();
      expect(HAIR_STYLES).toContain(l.hairStyle);
    }
  });

  it('passes data-* attributes in order and draws the « ? » badge only when unknown', () => {
    const out = svg(<KidFigure cx={50} top={10} foot={210} data-sb-person="lea" data-height="130" />);
    expect(out).toContain('data-sb-person="lea" data-height="130"');
    expect(out).not.toContain('data-kid-unknown');
    const unknown = svg(<KidFigure cx={50} top={10} foot={210} unknown />);
    expect(unknown).toContain('data-kid-unknown');
    // the default mark is the French « ? », with no right-to-left styling
    expect(unknown).toMatch(/>\?<\/text>/);
    expect(unknown).not.toMatch(/direction:\s*rtl|[\u0600-\u06FF]/);
  });
});

describe('KidFigure — no hair style is imposed by default (the characters for France are the owner’s open decision, plan §7, 7)', () => {
  it('the drawn styles are short, curly and a scarf; the scarf brings its colour and forehead band, the tunic only on request', () => {
    // NOTE (honest): the drawing has no girl with uncovered hair — redrawing is the owner's decision, not this file's.
    expect(HAIR_STYLES).toEqual(['short', 'curly', 'hijab']);
    for (const scarf of Object.keys(SCARVES)) {
      const out = svg(<KidFigure cx={100} top={40} foot={400} hairStyle="hijab" scarf={scarf} outfit="pink" />);
      expect(out).toContain('data-kid-hijab');
      expect(out).toContain(`fill="${SCARVES[scarf].main}"`);
      expect(out).toContain(`fill="${SCARVES[scarf].inner}"`);
      // the long tunic is NOT deduced from the scarf: it is opt-in
      expect(out).not.toContain('data-kid-tunic');
      expect(svg(<KidFigure cx={100} top={40} foot={400} hairStyle="hijab" scarf={scarf} tunic />)).toContain('data-kid-tunic');
    }
    expect(svg(<KidFigure cx={100} top={40} foot={400} hairStyle="short" />)).not.toContain('data-kid-tunic');
    expect(svg(<KidFigure cx={100} top={40} foot={400} hairStyle="short" tunic />)).toContain('data-kid-tunic');
  });

  it('the defaults draw no scarf: neither the component nor kidLook puts one on anybody unasked', () => {
    expect(svg(<KidFigure cx={100} top={40} foot={400} />)).not.toContain('data-kid-hijab');
    expect(DEFAULT_HAIR_STYLES).not.toContain('hijab');
    for (let i = 0; i < 12; i += 1) {
      expect(DEFAULT_HAIR_STYLES).toContain(kidLook(i).hairStyle);
      expect(svg(<KidFigure cx={100} top={40} foot={400} {...kidLook(i)} />)).not.toContain('data-kid-hijab');
    }
  });
});
