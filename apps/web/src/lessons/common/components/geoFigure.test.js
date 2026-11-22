import { describe, it, expect } from 'vitest';
import { validateGeoFigure, layoutGeoFigure, rightAngleSquare, vectorArrow, figureQuality } from './geoFigure';

const TRIANGLE = {
  points: { A: [0, 4], B: [-2, 0], C: [3, 0], M: [-1, 2], N: [1.5, 2] },
  segments: [['A', 'B'], ['A', 'C'], { from: 'B', to: 'C', label: '10' }, { from: 'M', to: 'N', label: 'x', arrows: 1 }],
  ariaLabel: 'مثلث ABC و (MN) يوازي (BC)',
};

describe('geoFigure — la figure déclarative', () => {
  it('une figure correcte ne produit aucune erreur', () => {
    expect(validateGeoFigure(TRIANGLE)).toEqual([]);
  });
  it('refuse une clé inconnue, un point inconnu, un ton inconnu et un ariaLabel non arabe', () => {
    const errs = validateGeoFigure({ ...TRIANGLE, colour: 'red', segments: [['A', 'Z']], polygons: [{ points: ['A', 'B', 'C'], tone: 'pink' }], ariaLabel: 'triangle' });
    expect(errs.join('|')).toMatch(/clé inconnue « colour »/);
    expect(errs.join('|')).toMatch(/point inconnu « Z »/);
    expect(errs.join('|')).toMatch(/ton inconnu « pink »/);
    expect(errs.join('|')).toMatch(/ariaLabel arabe/);
  });
  it('met la figure à l’échelle, y vers le bas, et sort les étiquettes du triangle', () => {
    const L = layoutGeoFigure(TRIANGLE, { size: 300, pad: 30 });
    expect(L.P.A[1]).toBeLessThan(L.P.B[1]);                 // A est en haut
    expect(L.pointLabels.A[1]).toBeLessThan(L.P.A[1]);       // l'étiquette de A au-dessus
    expect(L.width).toBeCloseTo(300 + 60, 5);
  });
  it('les droites prolongées entrent dans le cadre', () => {
    const L = layoutGeoFigure({ points: { A: [0, 0], B: [1, 0] }, lines: [{ through: ['A', 'B'], extend: 1 }], ariaLabel: 'مستقيم' }, { size: 300, pad: 0 });
    expect(L.width).toBeCloseTo(300, 5);
    expect(L.lineEnds({ through: ['A', 'B'], extend: 1 })[0][0]).toBeCloseTo(0, 5);
  });
  it('le carré d’angle droit est collé au sommet', () => {
    const sq = rightAngleSquare([10, 0], [0, 0], [0, 10], 4);
    expect(sq).toEqual([[4, 0], [4, 4], [0, 4]]);
  });
  it('vecteurs et quadrillage (unités 11–12)', () => {
    const fig = { points: { A: [0, 0], B: [3, 1] }, vectors: [{ from: 'A', to: 'B', label: 'u' }], grid: true, ariaLabel: 'شعاع' };
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(validateGeoFigure({ ...fig, vectors: [{ from: 'A', to: 'Z' }] }).join('|')).toMatch(/point inconnu « Z »/);
    expect(validateGeoFigure({ ...fig, grid: { step: 0 } }).join('|')).toMatch(/grid/);
    const L = layoutGeoFigure(fig, { size: 300, pad: 0 });
    // Cadre élargi d'une demi-maille puis aligné : x ∈ [-1 ; 4], y ∈ [-1 ; 2] → 6 + 4 lignes.
    expect(L.gridLines).toHaveLength(10);
    const ar = vectorArrow(L.P.A, L.P.B, 10);
    expect(ar.head[0]).toEqual(L.P.B);
    expect(Math.hypot(ar.shaft[1][0] - L.P.B[0], ar.shaft[1][1] - L.P.B[1])).toBeCloseTo(10, 5);
  });
  it('figureQuality : bande étroite et étiquettes qui se chevauchent (règle du 2026-10-04)', () => {
    const strip = { points: { A: [0, 0], B: [0, 1], C: [0, 2], D: [0, 9], E: [0.2, 9.1] }, segments: [['A', 'D']], ariaLabel: 'شريط' };
    const issues = figureQuality(strip);
    expect(issues.some((i) => i.startsWith('aspect'))).toBe(true);
    expect(issues.some((i) => i.includes('D / E'))).toBe(true);
    const ok = { points: { A: [0, 0], B: [4, 0], C: [4, 3], D: [0, 3] }, polygons: [{ points: ['A', 'B', 'C', 'D'] }], grid: true, ariaLabel: 'مستطيل' };
    expect(figureQuality(ok)).toEqual([]);
  });
  it('demi-cercles et cercles (unité 12, أدمج تعلّماتي) : le sens, le cadre, la validation', async () => {
    const { semicirclePoints, semicirclePath } = await import('./geoFigure');
    const fig = { points: { A: [-2, 0], O: [0, 0], E: [2, 0], I: [-1, 0] }, arcs: [{ from: 'A', to: 'O', sweep: 'cw' }, { from: 'O', to: 'E', sweep: 'ccw', dashed: true }], circles: [{ center: 'I', through: 'A', dashed: true }], grid: true, axes: true, ariaLabel: 'نصفا دائرتين' };
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(validateGeoFigure({ ...fig, arcs: [{ from: 'A', to: 'Z' }] }).join('|')).toMatch(/point inconnu « Z »/);
    expect(validateGeoFigure({ ...fig, arcs: [{ from: 'A', to: 'O', sweep: 'up' }] }).join('|')).toMatch(/sweep/);
    expect(validateGeoFigure({ ...fig, circles: [{ center: 'I', through: 'I' }] }).join('|')).toMatch(/center = through/);
    // cw de (−2 ; 0) à (0 ; 0) passe par le HAUT (−1 ; 1) ; ccw de (0 ; 0) à (2 ; 0) par le BAS (1 ; −1)
    const up = semicirclePoints([-2, 0], [0, 0], 'cw', 2); expect(up[1][0]).toBeCloseTo(-1); expect(up[1][1]).toBeCloseTo(1);
    const down = semicirclePoints([0, 0], [2, 0], 'ccw', 2); expect(down[1][0]).toBeCloseTo(1); expect(down[1][1]).toBeCloseTo(-1);
    expect(semicirclePath([0, 0], [4, 0], 'cw')).toBe('M 0 0 A 2 2 0 0 1 4 0');
    // le cadre contient le sommet des arcs (y = ±1) même si aucun point n'y est
    const L = layoutGeoFigure(fig, { size: 300, pad: 0 });
    expect(L.height).toBeGreaterThan(L.scale * 2);
    expect(figureQuality(fig)).toEqual([]);
  });
  it('axes (unité 12) : le cadre contient l’origine, graduations entières sauf 0, aucune sous un nom de point', () => {
    const fig = { points: { A: [2, 3], B: [5, 1], I: [1, 0] }, grid: true, axes: true, vectors: [{ from: 'A', to: 'B' }], ariaLabel: 'معلم' };
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(validateGeoFigure({ ...fig, axes: { every: 0 } }).join('|')).toMatch(/axes/);
    const L = layoutGeoFigure(fig);
    // l'origine est dans le cadre même si aucun point n'est à gauche de x = 1
    expect(L.axes.y[0][0]).toBeGreaterThan(0);
    expect(L.axes.y[0][0]).toBeLessThan(L.width);
    const texts = L.axes.ticks.filter((t) => t.label).map((t) => `${t.axis}${t.text}`);
    expect(texts).not.toContain('x0');
    expect(texts).toContain('x2');
    expect(texts).toContain('y−1');
    // « 1 » sur l'axe des abscisses est sous le point I : la graduation s'efface
    expect(texts).not.toContain('x1');
    expect(layoutGeoFigure({ ...fig, axes: { every: 2 } }).axes.ticks.filter((t) => t.label && t.axis === 'x').map((t) => t.text)).toEqual(['2', '4']);
    expect(figureQuality(fig)).toEqual([]);
  });
  it('arcs centrés, flèche d’angle, cercle de rayon donné (unité 13 « الدوران »)', async () => {
    const { centeredArcPoints, centeredArc, angleArc, circleRadius } = await import('./geoFigure');
    const fig = {
      points: { O: [0, 0], M: [3, 0], N: [0, 3] },
      arcs: [{ center: 'O', from: 'M', to: 'N', sweep: 'ccw', arrow: true, label: '90°' }],
      angles: [{ at: 'O', from: 'M', to: 'N', arrow: true }],
      circles: [{ center: 'O', radius: 3, dashed: true }],
      ariaLabel: 'دوران النقطة M حول O',
    };
    expect(validateGeoFigure(fig)).toEqual([]);
    expect(validateGeoFigure({ ...fig, arcs: [{ center: 'Z', from: 'M', to: 'N' }] }).join('|')).toMatch(/point inconnu « Z »/);
    expect(validateGeoFigure({ ...fig, circles: [{ center: 'O', radius: 0 }] }).join('|')).toMatch(/radius > 0/);
    expect(circleRadius({ center: 'O', through: 'M' }, fig.points)).toBe(3);
    // ccw (sens direct) de M(3 ; 0) vers la direction de N passe par (3cos45° ; 3sin45°) — le quart de cercle du HAUT
    const q = centeredArcPoints([0, 0], [3, 0], [0, 3], 'ccw', 2);
    expect(q[1][0]).toBeCloseTo(3 * Math.SQRT1_2); expect(q[1][1]).toBeCloseTo(3 * Math.SQRT1_2); expect(q[2][1]).toBeCloseTo(3);
    // cw (indirect) : les trois quarts de tour, par le bas
    const w = centeredArcPoints([0, 0], [3, 0], [0, 3], 'cw', 2);
    expect(w[1][0]).toBeCloseTo(-3 * Math.SQRT1_2); expect(w[1][1]).toBeCloseTo(-3 * Math.SQRT1_2);
    // en SVG (y vers le bas) : ccw à l'écran = sweep-flag 0, grand arc quand le parcours dépasse 180°
    expect(centeredArc([0, 0], [3, 0], [0, -3], 'ccw').path).toMatch(/A 3 3 0 0 0 /);
    expect(centeredArc([0, 0], [3, 0], [0, -3], 'cw').path).toMatch(/A 3 3 0 1 1 /);
    expect(centeredArc([0, 0], [3, 0], [0, -3], 'ccw').arrow[0][1]).toBeCloseTo(-3);
    expect(angleArc([20, 0], [0, 0], [0, 20]).arrow).toHaveLength(3);
    const L = layoutGeoFigure(fig, { size: 300, pad: 0 });
    expect(L.width).toBeCloseTo(L.height); // le cercle entier entre dans le cadre
    expect(figureQuality(fig)).toEqual([]);
  });
  it('une étiquette de longueur large s’écarte d’un segment vertical de sa demi-largeur (jamais sur le trait)', () => {
    const fig = { points: { H: [0, 0], A: [0, 3], B: [-5, 0] }, segments: [{ from: 'H', to: 'A', label: '3,06 m' }, { from: 'B', to: 'H', label: '5' }], ariaLabel: 'مثلث قائم' };
    const L = layoutGeoFigure(fig);
    const [x] = L.segmentLabel('H', 'A', null, '3,06 m');
    const halfW = (6 * 7.4) / 2;
    expect(Math.abs(x - L.P.H[0]) - halfW).toBeGreaterThanOrEqual(6.9); // le bord du texte reste à ≥ 7 px du trait
    expect(Math.abs(L.segmentLabel('H', 'A', null, 'x')[0] - L.P.H[0])).toBeCloseTo(13, 6); // une étiquette courte ne bouge pas
  });
  it('le cadre (viewBox) couvre chaque étiquette de longueur, même écartée au-delà du bord', () => {
    const fig = { points: { H: [0, 0], A: [0, 3], B: [-5, 0] }, segments: [{ from: 'H', to: 'A', label: '3,06 m' }], ariaLabel: 'مثلث قائم' };
    const L = layoutGeoFigure(fig);
    const [x] = L.segmentLabel('H', 'A', null, '3,06 m');
    const [vx, , vw] = L.viewBox;
    expect(vx + vw).toBeGreaterThanOrEqual(x + (6 * 7.4) / 2);
    expect(vx).toBeLessThanOrEqual(0);
  });
});
