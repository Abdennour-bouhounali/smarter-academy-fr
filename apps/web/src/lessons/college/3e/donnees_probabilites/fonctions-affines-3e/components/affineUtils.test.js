import { describe, it, expect } from 'vitest';
import { makeRng } from '@smarter-academy/core';
import {
  image, antecedent, tableOf, stepDelta, shiftB, classifyAffine,
  affineFromTwoPoints, slopeBetween, formatAffine, breakEven, cheapest, describePlan,
  receipt,
} from './affineUtils';

describe('image et antécédent', () => {
  it('calcule ax + b', () => {
    expect(image(2, 3, 4)).toBe(11);
    expect(image(-1.5, 4, 2)).toBe(1);
  });

  it('f(0) vaut toujours b — a ne déplace pas le point de départ', () => {
    for (const a of [-3, -0.5, 0, 1, 2.5]) expect(image(a, 7, 0)).toBe(7);
  });

  it('remonte à l’antécédent', () => {
    expect(antecedent(2, 3, 11)).toBe(4);
    expect(antecedent(-2, 7, 1)).toBe(3);
  });

  it('une fonction constante n’a pas d’antécédent unique', () => {
    expect(antecedent(0, 5, 5)).toBeNull();
  });
});

describe('stepDelta — le rôle de a, isolé', () => {
  it('ne dépend que de a, jamais de b', () => {
    // C'est la moitié de la leçon : b ne change pas l'inclinaison.
    for (const b of [-10, 0, 3.5, 42]) {
      expect(image(2, b, 5) - image(2, b, 4)).toBe(stepDelta(2));
    }
  });

  it('mesure la montée sur plusieurs pas', () => {
    expect(stepDelta(1.5, 2)).toBe(3);
    expect(stepDelta(-2, 3)).toBe(-6);
  });
});

describe('shiftB — le rôle de b, isolé', () => {
  it('glisser la droite laisse le coefficient intact', () => {
    const f = { a: 2.5, b: 1 };
    const g = shiftB(f, -4);
    expect(g.a).toBe(f.a);
    expect(g.b).toBe(-3);
    expect(slopeBetween({ x: 0, y: image(g.a, g.b, 0) }, { x: 4, y: image(g.a, g.b, 4) })).toBe(f.a);
  });
});

describe('classifyAffine — linéaire ⊂ affine', () => {
  it('nomme la famille la plus précise', () => {
    expect(classifyAffine(3, 0)).toBe('lineaire');
    expect(classifyAffine(3, 2)).toBe('affine');
    expect(classifyAffine(0, 4)).toBe('constante');
  });
});

describe('affineFromTwoPoints', () => {
  it('retrouve l’expression passant par deux points', () => {
    expect(affineFromTwoPoints({ x: 2, y: 1 }, { x: 4, y: 6 })).toEqual({ a: 2.5, b: -4 });
  });

  it('deux points de même abscisse ne définissent aucune fonction', () => {
    expect(affineFromTwoPoints({ x: 3, y: 1 }, { x: 3, y: 8 })).toBeNull();
  });
});

describe('cheapest — l’égalité doit être reconnue', () => {
  const PLANS = [{ id: 'A', a: 0.2, b: 0 }, { id: 'B', a: 0.1, b: 6 }];

  it('renvoie LES DEUX tarifs au point de croisement', () => {
    // 0,2 × 60 = 12 et 0,1 × 60 + 6 = 12 : refuser « B » serait un bug.
    expect(cheapest(PLANS, 60).sort()).toEqual(['A', 'B']);
  });

  it('renvoie un seul tarif de part et d’autre', () => {
    expect(cheapest(PLANS, 30)).toEqual(['A']);
    expect(cheapest(PLANS, 90)).toEqual(['B']);
  });

  it('le croisement calculé coïncide avec le basculement', () => {
    const x = breakEven(PLANS[0], PLANS[1]).x;
    expect(cheapest(PLANS, x)).toHaveLength(2);
    expect(cheapest(PLANS, x - 1)).toEqual(['A']);
    expect(cheapest(PLANS, x + 1)).toEqual(['B']);
  });

  it('deux tarifs parallèles ne se croisent jamais', () => {
    expect(breakEven({ a: 2, b: 1 }, { a: 2, b: 5 })).toEqual({ parallel: true });
  });
});

describe('propriétés (graines fixes)', () => {
  it('f(x + dx) − f(x) = a·dx, pour tout a, b, x, dx', () => {
    const rng = makeRng(31);
    for (let i = 0; i < 200; i += 1) {
      const a = rng.int(13) - 6 + 0.5 * rng.int(2);
      const b = rng.int(21) - 10;
      const x = rng.int(21) - 10;
      const dx = rng.int(5) + 1;
      expect(image(a, b, x + dx) - image(a, b, x)).toBeCloseTo(stepDelta(a, dx), 9);
    }
  });

  it('deux points quelconques d’une droite en redonnent l’expression', () => {
    const rng = makeRng(77);
    for (let i = 0; i < 200; i += 1) {
      const a = (rng.int(13) - 6) / 2;
      const b = rng.int(21) - 10;
      let x1 = rng.int(21) - 10;
      let x2 = rng.int(21) - 10;
      if (x1 === x2) x2 += 1;
      const f = affineFromTwoPoints(
        { x: x1, y: image(a, b, x1) },
        { x: x2, y: image(a, b, x2) },
      );
      expect(f.a).toBeCloseTo(a, 9);
      expect(f.b).toBeCloseTo(b, 9);
    }
  });
});

describe('formatAffine et describePlan', () => {
  it('écrit l’expression à la française', () => {
    expect(formatAffine(2, -5)).toBe('f(x) = 2x − 5');
    expect(formatAffine(1, 0)).toBe('f(x) = x');
    expect(formatAffine(0, 3)).toBe('f(x) = 3');
    expect(formatAffine(-2, -7)).not.toContain('-');
  });

  it('décrit un tarif en toutes lettres', () => {
    expect(describePlan(0.1, 6)).toBe("0,1 € par minute, plus 6 € d'avance");
    expect(describePlan(0.2, 0)).toBe("0,2 € par minute, sans rien à payer d'avance");
  });
});

describe('receipt — la facture en deux lignes', () => {
  it('sépare la part fixe de la part qui court, et somme juste', () => {
    const r = receipt(1.5, 2, 6);
    expect(r).toEqual({ fixed: 2, variable: 9, total: 11 });
    expect(r.total).toBe(image(1.5, 2, 6));
  });
  it('à 0 km, on paie exactement la prise en charge', () => {
    expect(receipt(1.5, 2, 0)).toEqual({ fixed: 2, variable: 0, total: 2 });
    expect(receipt(2, 0, 0).total).toBe(0);
  });
  it('doubler la distance ne double pas le total quand b ≠ 0', () => {
    expect(receipt(1.5, 2, 4).total).not.toBe(2 * receipt(1.5, 2, 2).total);
    expect(receipt(1.5, 0, 4).total).toBe(2 * receipt(1.5, 0, 2).total);
  });
});
