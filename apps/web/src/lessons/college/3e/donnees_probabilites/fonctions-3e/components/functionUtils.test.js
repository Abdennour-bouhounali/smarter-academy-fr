import { describe, it, expect } from 'vitest';
import {
  affine, square, custom, imageOf, antecedentsOf, tableOf,
  isLinear, isAffine, classify, pointsAreAligned, passesThroughOrigin,
  ruleFromTable, formatRule, formatImage, describeImage, planeFor, niceStep,
} from './functionUtils';

describe('imageOf — un nombre a UNE image', () => {
  it('applique la règle affine', () => {
    expect(imageOf(affine(2, 1), 3)).toBe(7);
    expect(imageOf(affine(-1.5, 4), 2)).toBe(1);
    expect(imageOf(affine(2, 1), 0)).toBe(1);
  });

  it('applique la règle carrée aux deux signes', () => {
    expect(imageOf(square(), 3)).toBe(9);
    expect(imageOf(square(), -3)).toBe(9);
  });

  it('applique une règle sur mesure', () => {
    const taxi = custom((d) => 2 + 1.5 * d, '2 + 1,5d');
    expect(imageOf(taxi, 10)).toBe(17);
    expect(imageOf(taxi, 0)).toBe(2);
  });

  it('renvoie null plutôt que NaN sur une entrée invalide', () => {
    expect(imageOf(affine(2, 1), NaN)).toBeNull();
    expect(imageOf(null, 3)).toBeNull();
  });
});

describe('antecedentsOf — une image peut en avoir PLUSIEURS', () => {
  it('une droite en donne exactement un', () => {
    expect(antecedentsOf(affine(2, 1), 7)).toEqual([3]);
  });

  it('le carré en donne DEUX — c’est tout le propos du module 2', () => {
    expect(antecedentsOf(square(), 4)).toEqual([-2, 2]);
    expect(antecedentsOf(square(), 9)).toEqual([-3, 3]);
  });

  it('le carré n’en donne qu’un en 0, et aucun pour un négatif', () => {
    expect(antecedentsOf(square(), 0)).toEqual([0]);
    expect(antecedentsOf(square(), -4)).toEqual([]);
  });

  it('une fonction constante : aucun, ou une infinité', () => {
    expect(antecedentsOf(affine(0, 5), 3)).toEqual([]);
    expect(antecedentsOf(affine(0, 5), 5)).toEqual([Infinity]);
  });

  it('cherche parmi les candidats pour une règle sur mesure', () => {
    const taxi = custom((d) => 2 + 1.5 * d, '2 + 1,5d');
    expect(antecedentsOf(taxi, 17, [8, 9, 10, 11])).toEqual([10]);
    expect(antecedentsOf(taxi, 17)).toEqual([]);
  });

  it('un antécédent trouvé a bien l’image annoncée (aller-retour)', () => {
    for (const y of [-4, 0, 3, 7.5]) {
      for (const x of antecedentsOf(affine(2.5, -1), y)) {
        expect(imageOf(affine(2.5, -1), x)).toBeCloseTo(y, 6);
      }
    }
  });
});

describe('tableOf', () => {
  it('range la machine en lignes x / f(x)', () => {
    expect(tableOf(affine(2, 1), [-1, 0, 1, 2])).toEqual([
      { x: -1, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 },
    ]);
  });
});

describe('classify — linéaire, affine, ou ni l’un ni l’autre', () => {
  it('linéaire veut dire ax, donc par l’origine', () => {
    expect(isLinear(affine(3, 0))).toBe(true);
    expect(isLinear(affine(3, 2))).toBe(false);
    expect(passesThroughOrigin(affine(3, 0))).toBe(true);
    expect(passesThroughOrigin(affine(3, 2))).toBe(false);
  });

  it('toute linéaire est affine, mais classify donne le nom le plus précis', () => {
    expect(isAffine(affine(3, 0))).toBe(true);
    expect(classify(affine(3, 0))).toBe('lineaire');
    expect(classify(affine(3, 2))).toBe('affine');
    expect(classify(affine(0, 4))).toBe('constante');
    expect(classify(square())).toBe('ni-lun-ni-lautre');
  });
});

describe('pointsAreAligned', () => {
  it('les points d’une droite sont alignés', () => {
    expect(pointsAreAligned(tableOf(affine(2, 1), [-2, 0, 1, 4]))).toBe(true);
  });

  it('ceux d’une parabole ne le sont pas', () => {
    expect(pointsAreAligned(tableOf(square(), [-2, 0, 1, 3]))).toBe(false);
  });
});

describe('ruleFromTable', () => {
  it('retrouve l’expression cachée derrière un tableau', () => {
    expect(ruleFromTable(tableOf(affine(3, -2), [0, 1, 2, 5]))).toEqual({ kind: 'affine', a: 3, b: -2 });
    expect(ruleFromTable(tableOf(affine(0.5, 0), [2, 4, 6]))).toEqual({ kind: 'affine', a: 0.5, b: 0 });
  });

  it('renvoie null si les points ne sont pas alignés — dire « aucune » est la bonne réponse', () => {
    expect(ruleFromTable(tableOf(square(), [-2, 0, 1, 3]))).toBeNull();
    expect(ruleFromTable([{ x: 1, y: 2 }])).toBeNull();
  });
});

describe('formatRule et formatImage', () => {
  it('écrit la règle en LaTeX français', () => {
    expect(formatRule(affine(2, -3))).toBe('f(x) = 2x − 3');
    expect(formatRule(affine(1, 0))).toBe('f(x) = x');
    expect(formatRule(square())).toBe('f(x) = x^{2}');
    expect(formatRule(affine(3, 1), { name: 'g', variable: 'n' })).toBe('g(n) = 3n + 1');
  });

  it('n’écrit jamais le tiret ASCII', () => {
    expect(formatRule(affine(-2, -5))).not.toContain('-');
  });

  it('écrit f(3) = 7 et le lit en toutes lettres', () => {
    expect(formatImage(affine(2, 1), 3)).toBe('f(3) = 7');
    expect(describeImage(affine(2, 1), 3)).toBe("l'image de 3 par f est 7");
  });
});

describe('planeFor — un repère qui s’adapte aux couples, sans jamais déborder', () => {
  const ticks = (min, max, step) => Math.round((max - min) / step) + 1;

  it('contient toujours l’origine et laisse une marge autour des points', () => {
    const { range, xStep, yStep } = planeFor([{ x: 2, y: 5 }, { x: 4, y: 11 }]);
    expect(range.xMin).toBe(0);
    expect(range.yMin).toBe(0);
    expect(range.xMax).toBeGreaterThan(4);
    expect(range.yMax).toBeGreaterThan(11);
    expect(xStep).toBe(1);
    expect(yStep).toBe(2);
  });

  it('gère les négatifs des deux côtés', () => {
    const { range } = planeFor([{ x: -2, y: -7 }, { x: 4, y: 11 }]);
    expect(range.xMin).toBeLessThan(-2);
    expect(range.yMin).toBeLessThan(-7);
    expect(range.xMax).toBeGreaterThan(4);
    expect(range.yMax).toBeGreaterThan(11);
  });

  it('borne le nombre de graduations quelle que soit la grandeur des nombres', () => {
    for (const big of [7, 50, 100, 999, 1000, -1000, 12345]) {
      const { range, xStep, yStep } = planeFor([{ x: big, y: 3 * big - 1 }, { x: 1, y: 2 }]);
      expect(ticks(range.xMin, range.xMax, xStep)).toBeLessThanOrEqual(13);
      expect(ticks(range.yMin, range.yMax, yStep)).toBeLessThanOrEqual(13);
      expect(range.xMin).toBeLessThanOrEqual(Math.min(0, big));
      expect(range.xMax).toBeGreaterThanOrEqual(Math.max(0, big));
    }
  });

  it('ne dégénère pas sur un seul point, ni sur l’origine seule', () => {
    const one = planeFor([{ x: 0, y: 0 }]);
    expect(one.range.xMax).toBeGreaterThan(one.range.xMin);
    expect(one.range.yMax).toBeGreaterThan(one.range.yMin);
    const empty = planeFor([]);
    expect(empty.range.xMax).toBeGreaterThan(empty.range.xMin);
    expect(Number.isFinite(empty.unit)).toBe(true);
  });

  it('garde la même taille de cadre en pixels, petit ou grand', () => {
    const small = planeFor([{ x: 3, y: 8 }], { width: 300, height: 240 });
    const large = planeFor([{ x: 1000, y: 2999 }], { width: 300, height: 240 });
    const w = (p) => (p.range.xMax - p.range.xMin) * p.unit;
    const h = (p) => (p.range.yMax - p.range.yMin) * p.unitY;
    expect(w(small)).toBeCloseTo(300, 3);
    expect(w(large)).toBeCloseTo(300, 3);
    expect(h(small)).toBeCloseTo(240, 3);
    expect(h(large)).toBeCloseTo(240, 3);
  });
});
