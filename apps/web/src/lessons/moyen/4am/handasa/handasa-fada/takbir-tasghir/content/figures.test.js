import { describe, it, expect } from 'vitest';
import * as Sp from '@smarter-academy/core/arithmetic/space.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import * as FIG from './figures';
import { ACT6, PREP_ITEMS, LAB } from './textbook';
import { EXERCISES } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/**
 * Les figures du درس « التكبير والتصغير وأثره على المقادير الفضائية » disent VRAI et se LISENT : chaque figure passe sa
 * validation et sa qualité (guide §5) ; chaque longueur qu'elle porte est re-mesurée SUR SES POINTS ; chaque réponse que la
 * leçon affirme (نشاط 5 et 6, أستعدّ, أوظّف, إختبار أولي) est recalculée par packages/core/arithmetic/space.js.
 */
const F = (v) => Lin.parseNumber(String(v));
const dist = (fig, a, b) => Math.hypot(...[0, 1, 2].map((i) => fig.points[a][i] - fig.points[b][i]));
const dec = (q) => Lin.fracDecimal(q, 4);

describe('figures — valides et lisibles', () => {
  for (const [name, fig] of Object.entries(FIG)) {
    it(`${name}`, () => {
      if (fig.kind === 'space') {
        expect(validateSpaceFigure(fig)).toEqual([]);
        expect(spaceFigureQuality(fig)).toEqual([]);
      } else {
        expect(validateGeoFigure(fig)).toEqual([]);
        expect(figureQuality(fig)).toEqual([]);
      }
      const named = Object.keys(fig.points).filter((n) => !(fig.hidden ?? []).includes(n)).length;
      if (named > 6 && !fig.inline) expect(fig.maxWidth, name).toBeGreaterThanOrEqual(480);
    });
  }
});

describe('les mesures portées par les figures', () => {
  it('أستعدّ 3 : AD = 3, AB = 5, BC = 6 et DE = 3,6 (Thalès : DE/6 = 3/5 — l’affirmation est VRAIE)', () => {
    const P = FIG.FIG_PREP3.points;
    const d = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
    expect([d('A', 'D'), d('A', 'B'), d('B', 'C')]).toEqual([3, 5, 6]);
    expect(d('D', 'E') / 6).toBeCloseTo(3 / 5, 12);
    expect(PREP_ITEMS[0].answer).toBe(true);
  });
  it('نشاط 6 : le pavé 5 × 4 × 3 et sa réduction 3 × 2,4 × 1,8 (rapport 3/5 sur CHAQUE arête)', () => {
    const f = FIG.FIG_ACT6_SOL;
    expect([dist(f, 'A', 'B'), dist(f, 'B', 'C'), dist(f, 'A', 'E')]).toEqual([5, 4, 3]);
    for (const [p, q] of [['A', 'B'], ['B', 'C'], ['A', 'E']]) expect(dist(f, `${p}′`, `${q}′`) / dist(f, p, q)).toBeCloseTo(0.6, 12);
  });
  it('نشاط 5 : E, F, G, H aux 3/4 de [SA], [SB], [SC], [SD] depuis S ; EF = 3, EG = 3√2', () => {
    const f = FIG.FIG_ACT5;
    for (const [p, q] of [['E', 'A'], ['F', 'B'], ['G', 'C'], ['H', 'D']]) expect(dist(f, 'S', p) / dist(f, 'S', q)).toBeCloseTo(0.75, 12);
    expect(dist(f, 'E', 'F')).toBeCloseTo(3, 12);
    expect(dist(f, 'E', 'G')).toBeCloseTo(3 * Math.SQRT2, 12);
  });
  it('le test : la pyramide de hauteur 9 coupée à 3 du sommet (k = 1/3), base 6 → section 2', () => {
    const f = FIG.FIG_TEST_PYRAMID;
    expect(dist(f, 'S', "O′") / dist(f, 'S', 'O')).toBeCloseTo(1 / 3, 12);
    expect(dist(f, 'E', 'F') / dist(f, 'A', 'B')).toBeCloseTo(1 / 3, 12);
  });
});

describe('les réponses de la leçon, recalculées (space.js)', () => {
  it('نشاط 6 : 𝒱 = 60, 𝒜 = 94 ; 3 ; 2,4 ; 1,8 ; 𝒱′ = 12,96 ; 𝒜′ = 33,84', () => {
    const c = Sp.cuboid(5, 4, 3);
    expect(dec(c.volume)).toBe(String(ACT6.numbers.V));
    expect(dec(c.area)).toBe(String(ACT6.numbers.A));
    expect(Sp.scaleAll([5, 4, 3], '3/5').map(dec)).toEqual(['3', '2,4', '1,8']);
    expect(dec(Sp.scaled(c.volume, '3/5', 3))).toBe(ACT6.numbers.V2);
    expect(dec(Sp.scaled(c.area, '3/5', 2))).toBe(ACT6.numbers.A2);
    // k = 2 (étape 4 du module 1) : 480 et 376 ; les distracteurs 120, 240, 188, 752 sont faux
    expect(dec(Sp.scaled(c.volume, 2, 3))).toBe('480');
    expect(dec(Sp.scaled(c.area, 2, 2))).toBe('376');
    expect(dec(Sp.cuboid(...Sp.scaleAll([5, 4, 3], '3/5')).volume)).toBe('12,96');
  });
  it('نشاط 5 : EFGH réduction de rapport 3/4 de ABCD : côté 3, aire 9', () => {
    const s = Sp.apexSection({ base: [4, 4], ratio: '3/4' });
    expect(s.kind).toBe('square');
    expect(s.sides.map(dec)).toEqual(['3', '3']);
    expect(dec(Sp.scaled(16, '3/4', 2))).toBe('9');
  });
  it('أستعدّ : cône 8π/3 (pas 4π), pyramide 9, pavé 2 × 3 × 6 d’aire 72 (pas 36)', () => {
    expect(Lin.fracText(Sp.cone(2, 2).volume.k)).toBe('8/3');
    expect(dec(Sp.pyramid(9, 3).volume)).toBe('9');
    expect(dec(Sp.cuboid(2, 3, 6).area)).toBe('72');
    expect(PREP_ITEMS.map((p) => p.answer)).toEqual([true, false, true, false, true, false]);
  });
  it('معارف / طرائق : boule R = 9 → 18 ; 64 → 8 ; 54/150 → 3/5 ; 16/250 → 2/5 ; 12 m³ × 27/8 = 40,5 ; 32 × 9/4 = 72 ; 4/9 → 2/3 ; 40 L → 135 L', () => {
    expect(Sp.scaled(Sp.ballVolume(9), 2, 3).latex).toBe(Sp.ballVolume(18).latex);
    expect(Sp.scaled(Sp.sphereArea(9), 2, 2).latex).toBe(Sp.sphereArea(18).latex);
    expect(dec(Sp.scaled(64, '1/2', 3))).toBe('8');
    expect(dec(Sp.ratioFrom(150, 54, 2))).toBe('0,6');
    expect(dec(Sp.ratioFrom(250, 16, 3))).toBe('0,4');
    expect(dec(Sp.scaled(12, '3/2', 3))).toBe('40,5');
    expect(dec(Sp.scaled(32, '3/2', 2))).toBe('72');
    expect(Lin.fracText(Sp.ratioFrom(1, '4/9', 2))).toBe('2/3');
    expect(dec(Sp.scaled(40, '3/2', 3))).toBe('135');
    expect(Lin.fracText(Sp.ratioFrom(9200, 46, 1))).toBe('1/200');
    expect(Lin.fracText(Sp.ratioFrom(4, 10, 1))).toBe('5/2');
  });
  it('أوظّف : 11 → 5,5 (k = 1/2) ; 270/27 = 10 ; 12 cm² × 100² = 12 m² ; 12 cm³ × 50³ = 1500 L', () => {
    const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
    expect(Lin.fracText(Sp.ratioFrom(11, '5,5', 1))).toBe('1/2');
    expect(byId['aw-1'].question.correct).toBe(0);
    expect(dec(Sp.scaled(270, '1/3', 3))).toBe(String(byId['aw-3'].question.expected));
    expect(dec(Lin.div(Sp.scaled(12, 100, 2), F(10000)))).toBe('12');
    expect(dec(Sp.cm3ToLitres(Sp.scaled(12, 50, 3)))).toBe('1500');
  });
  it('إختبار أولي : 27 ; 4/3 ; 6 ; 4 ; 2 L', () => {
    expect(dec(Sp.scaleEffect(3).volume)).toBe('27');
    expect(Lin.fracText(Sp.ratioFrom(1, '16/9', 2))).toBe('4/3');
    expect(dec(Sp.scaled(Sp.cuboid(6, 4, 2).volume, '1/2', 3))).toBe('6');
    expect(dec(Sp.scaled(Sp.pyramid(36, 9).volume, '1/3', 3))).toBe('4');
    expect(dec(Sp.scaled(2000, '1/10', 3))).toBe('2');
  });
  it('le lab de la leçon est celui de levels.js (mêmes nombres aux deux niveaux)', () => {
    expect(LAB.beginner.numbers).toEqual(LEVELS['scale-blocks'].beginner.numbers);
    expect(LAB.advanced.numbers).toEqual(LEVELS['scale-blocks'].advanced.numbers);
  });
});
