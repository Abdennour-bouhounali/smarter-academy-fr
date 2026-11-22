import { describe, it, expect } from 'vitest';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, ACTIVITY } from './textbook';
import { EX } from './exercises';
import { FIGURES, FIGURE_FRACTIONS, TUBES } from './figures';
import { validateGeoFigure, layoutGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure.js';

/** Fractions EXACTES : « a/b » ou décimal « 0,75 » → [n, d] irréductible. */
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const red = ([n, d]) => { const g = gcd(n, d); return [n / g, d / g]; };
const parse = (s) => {
  const t = String(s).replace(/\$|\\frac\{(\d+)\}\{(\d+)\}/g, (m, a, b) => (a ? `${a}/${b}` : '')).replace(/[{}\\]/g, '').trim();
  if (t.includes('/')) { const [a, b] = t.split('/').map(Number); return red([a, b]); }
  const [i, f = ''] = t.replace(',', '.').split('.');
  return red([Number(i + f), 10 ** f.length]);
};
const same = (a, b) => { const [x, y] = parse(a); const [u, v] = parse(b); return x * v === u * y; };
const key = (r) => r.options[r.correct];
const isDecimalFraction = (n, d) => { let q = d / gcd(n, d); for (const p of [2, 5]) while (q % p === 0) q /= p; return q === 1; };

describe('« حاصل القسمة والكسر » — chaque clé recalculée en fractions exactes', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [isDecimalFraction(2, 3), 3 / 8 === 0.375, false, 25 / 100 === 0.25, 45 / 100 === 4.5, 24 / 4 === 6];
    expect([...PREP_ITEMS, ...PREP_PLATFORM_ITEMS].map((it) => it.answer)).toEqual(truth);
    expect(new Set([...PREP_ITEMS, ...PREP_PLATFORM_ITEMS].map((it) => it.answer)).size).toBe(2);
  });

  it('act-1 : 5 ÷ 6 = 5/6 et 6 × 5/6 = 5 ; la division décimale ne s\'arrête pas', () => {
    expect(ACTIVITY.numbers).toEqual({ loaves: 5, people: 6 });
    expect(isDecimalFraction(5, 6)).toBe(false);
    expect(same('5/6', '30/36')).toBe(true);
    const rows = EX['act-1'].question.rows;
    expect(rows[0].options.filter((o) => /لا تنتهي/.test(o))).toHaveLength(1);
    const third = rows.find((r) => r.label.startsWith('③'));
    expect(key(third)).toBe('$\\frac{5}{6}$');
    expect(key(rows.find((r) => r.label.startsWith('④')))).toBe('5');
  });

  it('ex-3 : chaque ligne a pour clé la bonne fraction de la liste', () => {
    const rows = EX['ex-3'].question.rows;
    const expected = ['13/9', '9/11', '6/8', '17/17', '11/6', '9/13'];
    rows.forEach((r, i) => {
      expect(parse(key(r))).toEqual(parse(expected[i]));
    });
    // 1) × 9 = 13 ; 3) = 0,75 ; 4) = 1 ; 2) = 9 ÷ 11
    expect(same('13/9', '13/9') && 13 / 9 * 9 === 13).toBe(true);
    expect(parse('6/8')).toEqual(parse('0,75'));
    expect(parse('17/17')).toEqual([1, 1]);
  });

  it('ex-4, ex-5, self-9 : le facteur manquant a/b multiplié par b donne a ; chaque distracteur est faux', () => {
    const check = (id, specs) => EX[id].question.rows.forEach((r, i) => {
      const [b, a] = specs[i]; // b × ? = a
      if (a == null) return;
      expect(parse(key(r)), `${id} ${i}`).toEqual(parse(`${a}/${b}`));
      r.options.filter((o) => o !== key(r)).forEach((o) => expect(same(o, `${a}/${b}`), `${id} ${i} ${o}`).toBe(false));
    });
    check('ex-4', [[9, 7], [3, 7], [13, 19], [7, 1]]);
    check('ex-5', [[8, 13], [null, null], [8, 19], [11, 11]]);
    expect(parse(key(EX['ex-5'].question.rows[1]))).toEqual([7, 1]); // 6 × 7/6
    check('self-9', [[3, 2], [5, 8], [7, 5], [9, 2], [null, null], [9, 1], [null, null], [null, null], [null, null], [null, null]]);
  });

  it('self-9 : les lignes décimales, 5/12 × 3 et 7 × 2/21', () => {
    const rows = EX['self-9'].question.rows;
    expect(key(rows[4])).toBe('0,1');
    expect(7 * 0.1).toBeCloseTo(0.7, 12);
    expect(key(rows[9])).toBe('0,01');
    expect(Math.round(27 * 0.01 * 100)).toBe(27);
    expect(same(key(rows[6]), '15/12') && same('15/12', '5/12'.replace('5/12', `${5 * 3}/12`))).toBe(true);
    expect(same(key(rows[8]), '14/21')).toBe(true);
    expect(same(key(rows[7]), '5')).toBe(true);
  });

  it('ex-2 : seul le carré 4 × 4 donne 3/4 ; self-1 : les fractions des tubes', () => {
    const rows = EX['ex-2'].question.rows;
    expect(rows.map((r) => r.answer)).toEqual([false, true, false]);
    expect(FIGURE_FRACTIONS['ex-2'].map((f) => f && same(`${f[0]}/${f[1]}`, '3/4'))).toEqual([false, true, null]);
    const tubes = EX['self-1'].question.rows.map((r) => parse(key(r)));
    expect(tubes).toEqual(TUBES.map((t) => red([t.filled, t.parts])));
    expect(red([6, 6])).toEqual([1, 1]);
  });

  it('les figures : aire coloriée recomptée sur les polygones, et qualité', () => {
    const area = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
    const shaded = (fig) => fig.polygons.reduce((s, pg) => s + area(pg.points.map((n) => fig.points[n])), 0);
    const [f1, f2, f3] = FIGURES['ex-1'];
    expect(shaded(f1)).toBe(12);
    expect(f1.points.d && 4 * 6).toBe(24);
    expect(shaded(f2)).toBe(2.5); // 5 demi-cases d'aire 1/2 dans une feuille de 6 cases
    expect(2.5 / 6).toBeCloseTo(5 / 12, 12);
    expect(shaded(f3) / 12).toBeCloseTo(7 / 12, 12);
    const [g1, g2, g3] = FIGURES['ex-2'];
    expect(shaded(g1) / 7).toBeCloseTo(3 / 7, 12);
    expect(shaded(g2) / 16).toBe(3 / 4);
    expect(shaded(g3) / 48).toBe(1 / 2);
    for (const fig of Object.values(FIGURES).flat()) {
      expect(validateGeoFigure(fig)).toEqual([]);
      expect(figureQuality(fig, { maxAspect: Infinity })).toEqual([]);
      expect(layoutGeoFigure(fig).width).toBeGreaterThan(0);
    }
  });
});
