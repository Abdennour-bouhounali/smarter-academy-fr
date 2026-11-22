import { describe, it, expect } from 'vitest';
import { validateStatChart, layoutAxisChart, layoutPie, pieText, fmtNum } from './statChart';
import { validateStatementFigure } from './statementFigure';

const BAR = {
  kind: 'chart', type: 'bar', ariaLabel: 'مخطط بالأعمدة لأعمار التلاميذ', xTitle: 'العمر', yTitle: 'عدد التلاميذ',
  y: { max: 12, step: 2, minor: 2 }, bars: [{ label: '13', value: 5 }, { label: '14', value: 9 }, { label: '15', value: 4 }],
};
const HISTO = { kind: 'chart', type: 'histogram', ariaLabel: 'مدرج تكراري', edges: [20, 30, 40, 50], values: [4, 10, 6], y: { max: 10, step: 2 } };
const PIE = { kind: 'chart', type: 'pie', ariaLabel: 'مخطط دائري', show: 'angle', parts: [{ label: 'كرة القدم', value: 12 }, { label: 'السباحة', value: 6 }, { label: 'الجري', value: 12 }] };

describe('statChart — un diagramme d’énoncé qui se LIT', () => {
  it('des diagrammes corrects ne produisent aucune erreur', () => {
    expect(validateStatChart(BAR)).toEqual([]);
    expect(validateStatChart(HISTO)).toEqual([]);
    expect(validateStatChart({ ...HISTO, polygon: true })).toEqual([]);
    expect(validateStatChart(PIE)).toEqual([]);
    expect(validateStatChart({ kind: 'chart', type: 'line', ariaLabel: 'مضلع التكرارات المجمعة', x: { min: 20, max: 50, step: 10 }, points: [[20, 0], [30, 4], [40, 14], [50, 20]], y: { max: 20, step: 4, minor: 2 } })).toEqual([]);
  });
  it('refuse une hauteur qui ne tombe sur aucune ligne du quadrillage (illisible)', () => {
    const errs = validateStatChart({ ...BAR, bars: [{ label: '13', value: 5 }, { label: '14', value: 9.5 }] });
    expect(errs.join('|')).toMatch(/9.5 ne tombe sur aucune ligne/);
    // …sauf si la valeur est écrite sur la barre.
    expect(validateStatChart({ ...BAR, values: true, bars: [{ label: '13', value: 5 }, { label: '14', value: 9.5 }] })).toEqual([]);
  });
  it('refuse un plafond trop bas, une clé inconnue, un type inconnu, un ariaLabel non arabe', () => {
    expect(validateStatChart({ ...BAR, y: { max: 8, step: 2, minor: 2 } }).join('|')).toMatch(/dépasse y.max/);
    expect(validateStatChart({ ...BAR, colour: 'red' }).join('|')).toMatch(/clé inconnue « colour »/);
    expect(validateStatChart({ ...BAR, type: 'radar' }).join('|')).toMatch(/type inconnu/);
    expect(validateStatChart({ ...BAR, ariaLabel: 'bars' }).join('|')).toMatch(/ariaLabel arabe/);
    expect(validateStatChart({ ...BAR, y: { max: 11, step: 2 } }).join('|')).toMatch(/multiple de y.step/);
  });
  it('une barre « missing » n’a pas de valeur ; un مضلّع ne peut pas dévoiler une classe manquante', () => {
    expect(validateStatChart({ ...BAR, bars: [...BAR.bars, { label: '16', missing: true }] })).toEqual([]);
    expect(validateStatChart({ ...BAR, bars: [...BAR.bars, { label: '16', missing: true, value: 3 }] }).join('|')).toMatch(/missing sans value/);
    expect(validateStatChart({ ...HISTO, values: [4, null, 6], missing: [1] })).toEqual([]);
    expect(validateStatChart({ ...HISTO, values: [4, null, 6], missing: [1], polygon: true }).join('|')).toMatch(/dévoilerait/);
  });
  it('les abscisses d’un مضلّع sont croissantes et sur l’axe', () => {
    const errs = validateStatChart({ kind: 'chart', type: 'line', ariaLabel: 'مضلع', x: { min: 0, max: 40, step: 10 }, points: [[0, 0], [50, 2], [30, 4]], y: { max: 10, step: 2 } });
    expect(errs.join('|')).toMatch(/hors de l'axe/);
    expect(errs.join('|')).toMatch(/strictement croissantes/);
  });
  it('les barres : une par catégorie, la hauteur proportionnelle, l’étiquette sous l’axe', () => {
    const L = layoutAxisChart(BAR);
    expect(L.rects).toHaveLength(3);
    const [a, b] = L.rects;
    expect(b.h / a.h).toBeCloseTo(9 / 5, 6);
    expect(L.xLabels.map((t) => t.text)).toEqual(['13', '14', '15']);
    expect(L.grid.filter((g) => g.major).map((g) => g.text)).toEqual(['0', '2', '4', '6', '8', '10', '12']);
    expect(L.grid).toHaveLength(13); // lignes fines tous les 1
  });
  it('des noms de barres longs : police réduite, puis deux rangées décalées', () => {
    const wide = layoutAxisChart({ ...BAR, y: { max: 6, step: 1 }, bars: [30000, 35000, 40000, 45000, 50000, 60000, 75000].map((v, i) => ({ label: String(v), value: (i % 6) + 1 })) });
    expect(wide.stagger).toBe(true);
    expect(wide.labelFont).toBeGreaterThanOrEqual(10);
    expect(wide.xLabels.map((t) => t.row)).toEqual([0, 1, 0, 1, 0, 1, 0]);
    expect(layoutAxisChart(BAR).stagger).toBe(false);
  });
  it('le مدرّج : rectangles CONTIGUS, bornes sous l’axe, مضلّع par les milieux et fermé sur l’axe', () => {
    const L = layoutAxisChart({ ...HISTO, polygon: true });
    expect(L.rects[0].x + L.rects[0].w).toBeCloseTo(L.rects[1].x, 6);
    expect(L.xLabels.map((t) => t.text)).toEqual(['20', '30', '40', '50']);
    expect(L.points).toHaveLength(5);
    expect(L.points[0][1]).toBe(L.yb);
    expect(L.points[2][0]).toBeCloseTo(L.rects[1].x + L.rects[1].w / 2, 6);
  });
  it('le مخطط دائري : angles proportionnels, nombres écrits selon show, petits secteurs hors du disque', () => {
    expect(pieText({ value: 6 }, 30, { show: 'angle' })).toBe('72°');
    expect(pieText({ value: 6 }, 30, { show: 'percent' })).toBe('20%');
    expect(pieText({ value: 6 }, 30, { show: 'angle', half: true })).toBe('36°');
    expect(pieText({ value: 6, missing: true }, 30, { show: 'angle' })).toBe('؟');
    const L = layoutPie(PIE);
    expect(L.sectors.map((s) => s.text)).toEqual(['144°', '72°', '144°']);
    const tiny = layoutPie({ ...PIE, parts: [{ label: 'أ', value: 1 }, { label: 'ب', value: 29 }] });
    expect(tiny.sectors[0].outside).toBe(true);
    // Noms dans les secteurs : tous ou aucun (le plus petit secteur ne peut pas tenir le sien → la légende seule).
    expect(tiny.sectors.every((sec) => !sec.nameInside)).toBe(true);
    expect(layoutPie({ ...PIE, show: 'value', parts: [{ label: 'أ', value: 1 }, { label: 'ب', value: 1 }] }).sectors.every((sec) => sec.nameInside)).toBe(true);
  });
  it('virgule décimale de la maison', () => {
    expect(fmtNum(2.5)).toBe('2,5');
    expect(fmtNum(0.1 + 0.2)).toBe('0,3');
  });
  it('l’aiguillage des figures d’énoncé : chart, space, plane', () => {
    expect(validateStatementFigure(BAR)).toEqual([]);
    expect(validateStatementFigure({ ...BAR, type: 'radar' }).join('|')).toMatch(/type inconnu/);
    expect(validateStatementFigure({ points: { A: [0, 0], B: [1, 0] }, ariaLabel: 'قطعة' })).toEqual([]);
  });
});
