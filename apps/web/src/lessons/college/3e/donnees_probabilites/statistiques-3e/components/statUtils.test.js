import { describe, it, expect } from 'vitest';
import { makeRng } from '@smarter-academy/core';
import {
  sortSeries, total, effectifs, frequencies, sum, mean, weightedMean,
  median, range, balanceGap, influenceOf, missingForMean, compareSeries, layoutFor,
} from './statUtils';

const TRAJETS = [5, 8, 10, 10, 12, 15, 15, 15, 20, 25, 30, 35];

describe('organiser la série', () => {
  it('trie sans modifier l’original', () => {
    const src = [30, 5, 12];
    expect(sortSeries(src)).toEqual([5, 12, 30]);
    expect(src).toEqual([30, 5, 12]);
  });

  it('les effectifs se déduisent de la série, ils ne se saisissent pas', () => {
    const e = effectifs([10, 15, 10, 15, 15]);
    expect(e).toEqual([{ value: 10, count: 2 }, { value: 15, count: 3 }]);
    expect(e.reduce((a, x) => a + x.count, 0)).toBe(5);
  });

  it('les fréquences somment à 1', () => {
    const f = frequencies(TRAJETS);
    expect(f.reduce((a, x) => a + x.freq, 0)).toBeCloseTo(1, 9);
  });
});

describe('moyenne', () => {
  it('vaut la somme divisée par l’effectif', () => {
    expect(mean([2, 4, 9])).toBe(5);
    expect(mean(TRAJETS)).toBe(sum(TRAJETS) / 12);
  });

  it('est nulle pour une série vide, pas NaN', () => {
    expect(mean([])).toBeNull();
  });

  it('la moyenne pondérée est celle de la série développée', () => {
    const pairs = [{ value: 10, count: 2 }, { value: 20, count: 3 }];
    expect(weightedMean(pairs)).toBe(mean([10, 10, 20, 20, 20]));
  });
});

describe('médiane', () => {
  it('est la valeur centrale pour un effectif impair', () => {
    expect(median([3, 7, 9])).toBe(7);
  });

  it('est le milieu des deux valeurs centrales pour un effectif pair', () => {
    // Elle n'appartient alors pas forcément à la série.
    expect(median([4, 6])).toBe(5);
    expect(median(TRAJETS)).toBe(15);
  });

  it('ne dépend pas de l’ordre de saisie', () => {
    expect(median([30, 5, 12, 8])).toBe(median([5, 8, 12, 30]));
  });
});

describe('étendue', () => {
  it('est l’écart entre les extrêmes, jamais négative', () => {
    expect(range(TRAJETS)).toBe(30);
    expect(range([7, 7, 7])).toBe(0);
  });
});

describe('balanceGap — la moyenne est un point d’équilibre', () => {
  it('s’annule EXACTEMENT à la moyenne', () => {
    expect(balanceGap(TRAJETS, mean(TRAJETS))).toBe(0);
    expect(balanceGap([2, 4, 9], 5)).toBe(0);
  });

  it('son signe dit de quel côté pencher', () => {
    const m = mean(TRAJETS);
    expect(balanceGap(TRAJETS, m - 2)).toBeGreaterThan(0);
    expect(balanceGap(TRAJETS, m + 2)).toBeLessThan(0);
  });
});

describe('influenceOf — le cœur de la leçon', () => {
  it('déplacer une valeur décale la moyenne de Δ ÷ n', () => {
    const inf = influenceOf(TRAJETS, 0, 35);   // 5 → 35, soit Δ = 30
    expect(inf.dMean).toBeCloseTo(30 / 12, 9);
  });

  it('mais peut laisser la médiane parfaitement immobile', () => {
    // On tire la plus grande valeur encore plus loin : la médiane ne bouge pas.
    const inf = influenceOf(TRAJETS, 11, 90);
    expect(inf.dMedian).toBe(0);
    expect(inf.dMean).toBeGreaterThan(0);
    expect(inf.dRange).toBe(55);
  });

  it('refuse un indice hors de la série', () => {
    expect(influenceOf(TRAJETS, 99, 10)).toBeNull();
  });
});

describe('missingForMean', () => {
  it('donne la valeur à ajouter pour atteindre la moyenne visée', () => {
    const target = 16;
    const v = missingForMean(TRAJETS, target);
    expect(mean([...TRAJETS, v])).toBeCloseTo(target, 9);
  });
});

describe('compareSeries', () => {
  it('deux séries de même moyenne peuvent avoir des étendues très différentes', () => {
    const serree = [14, 15, 15, 16];
    const dispersee = [2, 8, 22, 28];
    expect(mean(serree)).toBe(mean(dispersee));
    const c = compareSeries(serree, dispersee);
    expect(c.sameMean).toBe(true);
    expect(c.widerRange).toBe('b');
  });
});

describe('layoutFor — la mise en page est calculée, pas espérée', () => {
  it('ne dessine jamais plus de pastilles que la pile autorisée', () => {
    const twelve = Array.from({ length: 12 }, () => 10);
    const l = layoutFor(twelve);
    expect(l.stacks[0].drawn).toBeLessThanOrEqual(6);
    expect(l.stacks[0].badge).toBe(12);
  });

  it('n’affiche aucun badge quand la pile tient', () => {
    const l = layoutFor([5, 10, 15]);
    expect(l.stacks.every((s) => s.badge === null)).toBe(true);
  });

  it('la pile dessinée tient toujours dans la hauteur allouée', () => {
    for (const n of [1, 3, 6, 9, 12]) {
      const xs = Array.from({ length: n }, () => 20);
      const l = layoutFor(xs, { plotHeight: 96 });
      expect(2 * l.radius * Math.min(n, 6)).toBeLessThanOrEqual(96);
    }
  });
});

describe('propriétés (graines fixes)', () => {
  it('déplacer une valeur de Δ décale la moyenne de Δ/n, pour toute série', () => {
    const rng = makeRng(7);
    for (let k = 0; k < 200; k += 1) {
      const n = 3 + rng.int(10);
      const xs = Array.from({ length: n }, () => rng.int(60));
      const i = rng.int(n);
      const delta = rng.int(41) - 20;
      const inf = influenceOf(xs, i, xs[i] + delta);
      expect(inf.dMean).toBeCloseTo(delta / n, 6);
    }
  });

  it('pousser le maximum plus loin laisse la médiane immobile et ouvre l’étendue', () => {
    const rng = makeRng(21);
    for (let k = 0; k < 200; k += 1) {
      const n = 4 + rng.int(9);
      const xs = Array.from({ length: n }, () => rng.int(50));
      const s = sortSeries(xs);
      const iMax = xs.indexOf(s[n - 1]);
      const delta = 1 + rng.int(40);
      const inf = influenceOf(xs, iMax, xs[iMax] + delta);
      expect(inf.dMedian).toBe(0);
      expect(inf.dRange).toBeCloseTo(delta, 6);
    }
  });

  it('la moyenne ne dépend pas de l’ordre des données', () => {
    const rng = makeRng(99);
    for (let k = 0; k < 100; k += 1) {
      const xs = Array.from({ length: 3 + rng.int(8) }, () => rng.int(100));
      expect(mean(rng.shuffle(xs))).toBeCloseTo(mean(xs), 9);
      expect(median(rng.shuffle(xs))).toBeCloseTo(median(xs), 9);
    }
  });
});
