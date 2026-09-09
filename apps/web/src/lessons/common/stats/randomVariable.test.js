/**
 * Le noyau « variables aléatoires », vérifié sur les propriétés qu'il PROMET.
 *
 * Ce que ces tests protègent, dans l'ordre d'importance :
 *   · une loi fausse (Σp ≠ 1) ne doit jamais passer pour une loi ;
 *   · l'espérance est bien Σ xᵢ pᵢ, y compris quand aucune valeur n'en approche ;
 *   · l'espérance peut ne correspondre à AUCUNE valeur possible — c'est le sel
 *     de la leçon, et une régression qui l'annulerait la viderait de son sens ;
 *   · la moyenne observée s'APPROCHE de l'espérance sans jamais l'égaler, dans
 *     une marge DÉCLARÉE en σ/√n.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from './randomUtils';
import {
  makeLaw, lawFromCounts, probabilitySum, expectation, expectationIsAttainable,
  expectedProfit, isFairGame, empiricalMean, lawStandardDeviation, sampleFromLaw, tally,
} from './randomVariable';

describe('makeLaw — une loi fausse n’est pas une loi', () => {
  it('rejette une somme de probabilités différente de 1', () => {
    expect(() => makeLaw([{ x: 0, p: 0.5 }, { x: 1, p: 0.4 }])).toThrow(/somment à/);
    expect(() => makeLaw([{ x: 0, p: 0.5 }, { x: 1, p: 0.6 }])).toThrow(/somment à/);
  });

  it('rejette une probabilité hors de [0 ; 1], une valeur répétée, une loi vide', () => {
    expect(() => makeLaw([{ x: 0, p: -0.2 }, { x: 1, p: 1.2 }])).toThrow(/hors de/);
    expect(() => makeLaw([{ x: 1, p: 0.5 }, { x: 1, p: 0.5 }])).toThrow(/qu’une fois/);
    expect(() => makeLaw([])).toThrow(/au moins une valeur/);
  });

  it('probabilitySum retombe sur la somme des flottants pour une loi sans effectifs', () => {
    const loi = makeLaw([{ x: 0, p: 0.5 }, { x: 1, p: 0.5 }]);
    expect(probabilitySum(loi)).toBe(1);
  });

  it('accepte une somme exacte et trie par valeur croissante', () => {
    const loi = makeLaw([[5, 0.2], [0, 0.4], [1, 0.4]]);
    expect(loi.map((r) => r.x)).toEqual([0, 1, 5]);
    expect(loi.map((r) => r.p)).toEqual([0.4, 0.4, 0.2]);
  });

  it('accepte la forme objet comme la forme paire — même résultat', () => {
    expect(makeLaw([[0, 0.5], [1, 0.5]])).toEqual(makeLaw([{ x: 0, p: 0.5 }, { x: 1, p: 0.5 }]));
  });
});

describe('lawFromCounts — les fractions de dénominateur commun somment exactement', () => {
  it('six dixièmes, trois dixièmes, un dixième : somme EXACTEMENT 1', () => {
    const loi = lawFromCounts([{ x: 0, n: 6 }, { x: 1, n: 3 }, { x: 5, n: 1 }]);
    // Le point du contrat : la somme est EXACTE, pas « proche de 1 ». Elle se
    // fait sur les effectifs entiers, que la loi conserve.
    expect(probabilitySum(loi)).toBe(1);
    expect(loi.map((r) => r.n)).toEqual([6, 3, 1]);
    expect(loi.map((r) => r.p)).toEqual([0.6, 0.3, 0.1]);
    // Et la somme naïve des flottants, elle, ne fait PAS 1 : c'est le défaut
    // qu'un test a attrapé, et la raison pour laquelle la fraction est gardée.
    expect(loi.reduce((a, r) => a + r.p, 0)).not.toBe(1);
  });

  it('la saisie décimale équivalente, elle, N’EST PAS exacte — d’où lawFromCounts', () => {
    // Sept dixièmes + deux dixièmes + un dixième en flottants : le résidu est réel.
    expect(0.7 + 0.2 + 0.1).not.toBe(1);
    // La même loi passée par les effectifs somme exactement à 1.
    expect(probabilitySum(lawFromCounts([{ x: 0, n: 7 }, { x: 1, n: 2 }, { x: 5, n: 1 }]))).toBe(1);
  });

  it('rejette un effectif non entier ou négatif, et un total nul', () => {
    expect(() => lawFromCounts([{ x: 0, n: 1.5 }, { x: 1, n: 8.5 }])).toThrow(/entier positif/);
    expect(() => lawFromCounts([{ x: 0, n: 0 }])).toThrow(/strictement positif/);
  });

  it('accepte un effectif nul tant qu’il reste des tirages possibles ailleurs', () => {
    const loi = lawFromCounts([{ x: 0, n: 0 }, { x: 1, n: 4 }]);
    expect(loi.find((r) => r.x === 0).p).toBe(0);
    expect(expectation(loi)).toBe(1);
  });
});

describe('expectation — Σ xᵢ pᵢ', () => {
  it('un dé équilibré a pour espérance 3,5', () => {
    const de = lawFromCounts([1, 2, 3, 4, 5, 6].map((x) => ({ x, n: 1 })));
    expect(expectation(de)).toBeCloseTo(3.5, 12);
  });

  it('3,5 n’est AUCUNE face du dé : l’espérance n’est pas une valeur possible', () => {
    const de = lawFromCounts([1, 2, 3, 4, 5, 6].map((x) => ({ x, n: 1 })));
    expect(expectationIsAttainable(de)).toBe(false);
    expect(de.map((r) => r.x)).not.toContain(3.5);
  });

  it('l’espérance PEUT tomber sur une valeur possible — la fonction le dit', () => {
    // 0 et 2 équiprobables : E = 1, qui n'est pas dans la loi.
    expect(expectationIsAttainable(lawFromCounts([{ x: 0, n: 1 }, { x: 2, n: 1 }]))).toBe(false);
    // 0, 1 et 2 équiprobables : E = 1, qui EST une valeur de la loi.
    const loi = lawFromCounts([{ x: 0, n: 1 }, { x: 1, n: 1 }, { x: 2, n: 1 }]);
    expect(expectation(loi)).toBeCloseTo(1, 12);
    expect(expectationIsAttainable(loi)).toBe(true);
  });

  it('une loi certaine a pour espérance sa seule valeur', () => {
    expect(expectation(makeLaw([{ x: 7, p: 1 }]))).toBe(7);
  });

  it('une valeur négative compte négativement — pas de valeur absolue cachée', () => {
    const loi = lawFromCounts([{ x: -3, n: 1 }, { x: 5, n: 1 }]);
    expect(expectation(loi)).toBe(1);
  });
});

describe('isFairGame — équitable, favorable, défavorable', () => {
  // Roue à dix secteurs : 4 fois 0 €, 4 fois 1 €, 2 fois 5 €. E = 1,4 €.
  const roue = lawFromCounts([{ x: 0, n: 4 }, { x: 1, n: 4 }, { x: 5, n: 2 }]);

  it('un jeu de mise 1,40 € est équitable', () => {
    expect(expectation(roue)).toBeCloseTo(1.4, 12);
    expect(isFairGame(roue, 1.4)).toBe(true);
    expect(expectedProfit(roue, 1.4)).toBeCloseTo(0, 12);
  });

  it('un jeu de mise 2 € est défavorable au joueur', () => {
    expect(isFairGame(roue, 2)).toBe(false);
    expect(expectedProfit(roue, 2)).toBeCloseTo(-0.6, 12);
    expect(expectedProfit(roue, 2)).toBeLessThan(0);
  });

  it('un jeu de mise 1 € est favorable au joueur', () => {
    expect(isFairGame(roue, 1)).toBe(false);
    expect(expectedProfit(roue, 1)).toBeCloseTo(0.4, 12);
    expect(expectedProfit(roue, 1)).toBeGreaterThan(0);
  });

  it('la mise par défaut est nulle : le bénéfice espéré est alors l’espérance', () => {
    expect(expectedProfit(roue)).toBe(expectation(roue));
  });
});

describe('sampleFromLaw — l’aléa est injecté, jamais tiré ici', () => {
  const roue = lawFromCounts([{ x: 0, n: 4 }, { x: 1, n: 4 }, { x: 5, n: 2 }]);

  it('refuse d’être appelée sans générateur', () => {
    expect(() => sampleFromLaw(roue, 10)).toThrow(/injecté/);
  });

  it('à graine égale, série égale — la simulation est rejouable', () => {
    const a = sampleFromLaw(roue, 200, makeRng(2026));
    const b = sampleFromLaw(roue, 200, makeRng(2026));
    expect(a).toEqual(b);
  });

  it('à graine différente, série différente — ce n’est pas une animation', () => {
    const a = sampleFromLaw(roue, 200, makeRng(1));
    const b = sampleFromLaw(roue, 200, makeRng(2));
    expect(a).not.toEqual(b);
  });

  it('ne produit que des valeurs de la loi, et jamais undefined', () => {
    const s = sampleFromLaw(roue, 500, makeRng(7));
    expect(s).toHaveLength(500);
    for (const v of s) expect([0, 1, 5]).toContain(v);
  });

  it('une valeur de probabilité nulle ne sort jamais', () => {
    const loi = lawFromCounts([{ x: 0, n: 0 }, { x: 9, n: 3 }]);
    expect(new Set(sampleFromLaw(loi, 300, makeRng(11)))).toEqual(new Set([9]));
  });
});

describe('empiricalMean — elle S’APPROCHE de l’espérance, elle ne l’atteint pas', () => {
  const roue = lawFromCounts([{ x: 0, n: 4 }, { x: 1, n: 4 }, { x: 5, n: 2 }]);

  it('null sur un échantillon vide, jamais NaN', () => {
    expect(empiricalMean([])).toBeNull();
    expect(empiricalMean(null)).toBeNull();
  });

  it('sur 500 tirages, l’écart reste sous 5 σ/√n — SEUIL DÉCLARÉ, balayé sur 300 graines', () => {
    // Le seuil se déclare en σ/√n et non en euros : sur la même roue, un gros
    // lot dix fois plus élevé élargit l'écart d'autant sans que rien ne soit
    // cassé. 5 σ/√n est la borne mesurée (pire cas observé : 4,80 sur
    // 3 000 graines × 9 valeurs de gros lot).
    const n = 500;
    const marge = 5 * (lawStandardDeviation(roue) / Math.sqrt(n));
    for (let seed = 1; seed <= 300; seed += 1) {
      const m = empiricalMean(sampleFromLaw(roue, n, makeRng(seed * 104729)));
      expect(Math.abs(m - expectation(roue))).toBeLessThan(marge);
    }
  });

  it('et pourtant elle vaut RAREMENT l’espérance exactement — on n’affirme pas l’égalité', () => {
    let exactes = 0;
    for (let seed = 1; seed <= 100; seed += 1) {
      const m = empiricalMean(sampleFromLaw(roue, 500, makeRng(seed * 7919)));
      if (m === expectation(roue)) exactes += 1;
    }
    expect(exactes).toBeLessThan(10);
  });

  it('l’écart RÉTRÉCIT quand la série s’allonge — moyenne sur 40 graines', () => {
    const ecartMoyen = (n) => {
      let total = 0;
      for (let seed = 1; seed <= 40; seed += 1) {
        total += Math.abs(empiricalMean(sampleFromLaw(roue, n, makeRng(seed * 31337 + n))) - expectation(roue));
      }
      return total / 40;
    };
    expect(ecartMoyen(2000)).toBeLessThan(ecartMoyen(50));
  });
});

describe('tally — le grand livre montre AUSSI ce qui n’est pas sorti', () => {
  const roue = lawFromCounts([{ x: 0, n: 4 }, { x: 1, n: 4 }, { x: 5, n: 2 }]);

  it('les effectifs somment à la taille de la série et les fréquences à 1', () => {
    const livre = tally(roue, sampleFromLaw(roue, 500, makeRng(2026)));
    expect(livre.reduce((a, r) => a + r.count, 0)).toBe(500);
    expect(livre.reduce((a, r) => a + r.frequency, 0)).toBeCloseTo(1, 12);
  });

  it('une valeur jamais sortie apparaît quand même, avec un effectif nul', () => {
    const livre = tally(roue, [1, 1, 1, 1]);
    expect(livre.map((r) => r.x)).toEqual([0, 1, 5]);
    expect(livre.find((r) => r.x === 5).count).toBe(0);
    expect(livre.find((r) => r.x === 5).frequency).toBe(0);
  });

  it('la moyenne du grand livre est celle de la série — deux chemins, un nombre', () => {
    const s = sampleFromLaw(roue, 500, makeRng(4242));
    const livre = tally(roue, s);
    const parLeLivre = livre.reduce((a, r) => a + r.x * r.count, 0) / 500;
    expect(parLeLivre).toBeCloseTo(empiricalMean(s), 12);
  });

  it('les fréquences observées s’approchent des probabilités sur une longue série', () => {
    const livre = tally(roue, sampleFromLaw(roue, 20000, makeRng(99)));
    for (const r of livre) expect(Math.abs(r.frequency - r.p)).toBeLessThan(0.02);
  });
});
