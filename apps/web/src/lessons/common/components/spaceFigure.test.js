import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import SpaceFigure from './SpaceFigure';
import {
  validateSpaceFigure, layoutSpaceFigure, spaceFigureQuality, camera, cuboidPoints, cuboidFaces, circle3,
} from './spaceFigure';

const SPHERE = {
  kind: 'space',
  points: { O: [0, 0, 0], A: [0, 0, 1.5], M: [2, 0, 1.5], N: [0, 0, 2.5], S: [0, 0, -2.5] },
  solids: [{ type: 'sphere', center: 'O', radius: 2.5 }],
  circles: [{ center: 'A', radius: 2, on: 0 }],
  segments: [{ from: 'O', to: 'M', label: '2,5', dashed: true }, { from: 'N', to: 'S', dashed: true }],
  rightAngles: [['O', 'A', 'M']],
  ariaLabel: 'كرة مركزها O يقطعها مستو',
};
const BOX = {
  kind: 'space',
  points: cuboidPoints('ABCDEFGH', { length: 5, width: 4, height: 3 }),
  solids: [{ type: 'polyhedron', faces: cuboidFaces('ABCDEFGH') }],
  ariaLabel: 'متوازي مستطيلات ABCDEFGH',
};

describe('spaceFigure — validation', () => {
  it('accepte une figure correcte et nomme les fautes', () => {
    expect(validateSpaceFigure(SPHERE)).toEqual([]);
    expect(validateSpaceFigure(BOX)).toEqual([]);
    const errs = validateSpaceFigure({ ...SPHERE, kind: 'geo', colour: 'red', segments: [{ from: 'O', to: 'Z' }], ariaLabel: 'sphere' });
    expect(errs.join('|')).toMatch(/kind/);
    expect(errs.join('|')).toMatch(/clé inconnue « colour »/);
    expect(errs.join('|')).toMatch(/point inconnu « Z »/);
    expect(errs.join('|')).toMatch(/ariaLabel/);
    expect(validateSpaceFigure({ ...BOX, points: { ...BOX.points, A: [0, 0] } }).join('|')).toMatch(/\[x, y, z\]/);
    expect(validateSpaceFigure({
      kind: 'space', points: { O: [0, 0, 0], T: [1, 0, 3] }, solids: [{ type: 'cylinder', base: 'O', top: 'T', radius: 1 }], ariaLabel: 'أسطوانة',
    }).join('|')).toMatch(/axe vertical/);
  });
});

describe('spaceFigure — ce qui est vu, ce qui est caché', () => {
  it('la caméra est orthonormée', () => {
    const c = camera({ azimuth: -50, elevation: 25 });
    const d = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    expect(Math.abs(d(c.d, c.u))).toBeLessThan(1e-12);
    expect(Math.abs(d(c.d, c.v))).toBeLessThan(1e-12);
    expect(Math.abs(d(c.u, c.v))).toBeLessThan(1e-12);
    expect(c.v[2]).toBeGreaterThan(0); // le haut de l'écran est vers le haut
  });
  it('pavé : exactement trois arêtes cachées (celles du sommet caché)', () => {
    const L = layoutSpaceFigure(BOX);
    const hiddenEdges = L.lines.filter((l) => l.hidden);
    expect(hiddenEdges).toHaveLength(3);
    const shared = hiddenEdges.map((l) => l.edge).flat().reduce((m, n) => ({ ...m, [n]: (m[n] ?? 0) + 1 }), {});
    expect(Object.values(shared)).toContain(3);
  });
  it('sphère : équateur à moitié pointillé, le cercle de section aussi', () => {
    const L = layoutSpaceFigure(SPHERE);
    const eq = L.lines.filter((l) => l.kind === 's0-equator');
    expect(eq.some((l) => l.hidden) && eq.some((l) => !l.hidden)).toBe(true);
    expect(L.outlines).toHaveLength(1);
  });
  it('cylindre : deux génératrices de contour, le bas à moitié caché', () => {
    const L = layoutSpaceFigure({
      kind: 'space', points: { O2: [0, 0, 0], O1: [0, 0, 6] }, solids: [{ type: 'cylinder', base: 'O2', top: 'O1', radius: 1.7 }], ariaLabel: 'أسطوانة',
    });
    expect(L.lines.filter((l) => l.kind === 's0-side')).toHaveLength(2);
    const bottom = L.lines.filter((l) => l.kind === 's0-bottom');
    expect(bottom.some((l) => l.hidden) && bottom.some((l) => !l.hidden)).toBe(true);
  });
  it('cône et tronc : deux génératrices de contour', () => {
    for (const s of [{ type: 'cone', base: 'O', apex: 'S', radius: 3 }, { type: 'frustum', base: 'O', top: 'S', radius: 15, topRadius: 20 }]) {
      const L = layoutSpaceFigure({ kind: 'space', points: { O: [0, 0, 0], S: [0, 0, s.type === 'cone' ? 5 : 28] }, solids: [s], ariaLabel: 'مخروط' });
      expect(L.lines.filter((l) => l.kind === 's0-side')).toHaveLength(2);
    }
  });
  it('un cercle 3D a le bon rayon', () => {
    for (const p of circle3([1, 2, 3], 2, [1, 1, 0], 12)) expect(Math.hypot(p[0] - 1, p[1] - 2, p[2] - 3)).toBeCloseTo(2, 10);
  });
});

describe('spaceFigure — la cote éloignée de son trait (labelOffset)', () => {
  const fig = (extra) => ({
    kind: 'space', view: { azimuth: -90, elevation: 14 },
    points: { O: [0, 0, 0], T: [0, 0, 1], V0: [-3, 0, 1], V1: [-3, 0, 0] },
    solids: [{ type: 'cylinder', base: 'O', top: 'T', radius: 1 }],
    segments: [{ from: 'V0', to: 'V1', label: '28 cm', ...extra }], hidden: ['O', 'T', 'V0', 'V1'], ariaLabel: 'أسطوانة',
  });
  it('sans la clé, la cote est à 12 px du milieu (comportement inchangé) ; avec, à la distance demandée, du côté extérieur', () => {
    const base = layoutSpaceFigure(fig({}));
    const far = layoutSpaceFigure(fig({ labelOffset: 30 }));
    const s = fig({}).segments[0];
    const mid = (L) => [(L.P.V0[0] + L.P.V1[0]) / 2, (L.P.V0[1] + L.P.V1[1]) / 2];
    expect(mid(base)[0] - base.segmentLabel(s)[0]).toBeCloseTo(12, 6);
    expect(mid(far)[0] - far.segmentLabel({ ...s, labelOffset: 30 })[0]).toBeCloseTo(30, 6);
  });
});

describe('spaceFigure — qualité et rendu', () => {
  it('les figures exemples sont lisibles', () => {
    expect(spaceFigureQuality(SPHERE)).toEqual([]);
    expect(spaceFigureQuality(BOX)).toEqual([]);
  });
  it('rend un SVG avec des traits vus et cachés et des noms LTR', () => {
    const html = renderToStaticMarkup(createElement(SpaceFigure, SPHERE));
    expect(html).toContain('data-space-figure');
    expect(html).toContain('data-space-line="hidden"');
    expect(html).toContain('data-space-line="seen"');
    expect(html).toContain('aria-label="كرة مركزها O يقطعها مستو"');
    expect(html).toContain('direction:ltr');
  });
});
