import { describe, it, expect } from 'vitest';
import {
  round2, fr, eur, proportional, withBase, flat, isProportional,
  doublingRatio, ratio, ratioColumn, pathsToCell,
  scale, cmToM, cmToKm, percentOf, discountFactor, applyDiscount, speed, distance,
} from './propUtils';

/** Les entrées que l'élève peut réellement atteindre dans les labos. */
const REACHABLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20];

describe('formatage', () => {
  it('écrit les décimaux à la française', () => {
    expect(fr(4.5)).toBe('4,5');
    expect(fr(1250)).toMatch(/1.250/);
  });

  it('donne toujours deux décimales à un prix qui en a', () => {
    expect(eur(4.5)).toBe('4,50 €');
    expect(eur(12)).toBe('12 €');
  });

  it('neutralise le bruit binaire', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(4.35 * 3)).toBe(13.05);
    expect(round2(0.7 * 40)).toBe(28);
  });
});

describe('les situations sont des règles, pas des tableaux', () => {
  const sirop = proportional({ k: 0.15 });
  const piscine = withBase({ base: 20, k: 2 });

  it('applique la règle à toute entrée atteignable', () => {
    expect(sirop.apply(4)).toBe(0.6);
    expect(piscine.apply(4)).toBe(28);
  });

  it('ne reconnaît comme proportionnelle que la règle qui l’est', () => {
    expect(isProportional(sirop)).toBe(true);
    expect(isProportional(piscine)).toBe(false);
    expect(isProportional(flat({ value: 30 }))).toBe(false);
  });

  /* L'INVARIANT CENTRAL DE LA LEÇON. Une situation à base ne doit JAMAIS se
     comporter comme une proportionnelle, à aucune entrée que l'élève peut
     atteindre — sinon la découverte du module 1 serait démentie par le labo
     lui-même sur une valeur particulière. */
  it('une situation à base ne double jamais quand l’entrée double', () => {
    for (const x of REACHABLE) {
      expect(doublingRatio(piscine, x)).not.toBe(2);
    }
  });

  it('une situation proportionnelle double toujours quand l’entrée double', () => {
    for (const x of REACHABLE) {
      expect(doublingRatio(sirop, x)).toBe(2);
    }
  });

  it('le rapport sortie ÷ entrée est constant si et seulement si c’est proportionnel', () => {
    expect(ratioColumn(sirop, REACHABLE).constant).toBe(true);
    expect(ratioColumn(sirop, REACHABLE).value).toBe(0.15);
    expect(ratioColumn(piscine, REACHABLE).constant).toBe(false);
    expect(ratioColumn(piscine, REACHABLE).value).toBe(null);
  });

  it('le rapport n’est pas défini en 0, et le dit', () => {
    expect(ratio(sirop, 0)).toBe(null);
    expect(doublingRatio(flat({ value: 0 }), 3)).toBe(null);
  });

  it('un forfait pur ne bouge pas du tout', () => {
    const f = flat({ value: 30 });
    expect(f.apply(1)).toBe(30);
    expect(f.apply(20)).toBe(30);
    expect(doublingRatio(f, 5)).toBe(1);
  });
});

describe('les chemins vers la case vide', () => {
  /* Le propos du module 3 : trois récits, une seule valeur. */
  it('les trois chemins donnent exactement la même valeur', () => {
    const p = pathsToCell({ x: 4, y: 6 }, 10);
    expect(p.value).toBe(15);
    expect(round2(p.unite.unit * 10)).toBe(p.value);
    expect(round2(6 * p.facteur.factor)).toBe(p.value);
    expect(round2(10 * p.coefficient.k)).toBe(p.value);
  });

  it('tient sur un facteur non entier — le cas qui casse la linéarité additive', () => {
    const p = pathsToCell({ x: 4, y: 6 }, 7);
    expect(p.value).toBe(10.5);
    expect(p.facteur.factor).toBe(1.75);
  });
});

describe('échelle', () => {
  const carte = scale(25000);

  it('1 cm sur la carte vaut n cm en vrai', () => {
    expect(carte.toReal(1)).toBe(25000);
    expect(cmToM(carte.toReal(1))).toBe(250);
    expect(cmToKm(carte.toReal(4))).toBe(1);
  });

  it('fait l’aller-retour sans perte', () => {
    expect(carte.toMap(carte.toReal(3.5))).toBe(3.5);
  });
});

describe('pourcentages', () => {
  it('calcule t % d’une quantité', () => {
    expect(percentOf(30, 40)).toBe(12);
    expect(percentOf(15, 60)).toBe(9);
  });

  /* Le piège du module 5, verrouillé : enlever 30 %, c'est ×0,7. */
  it('une remise de 30 % multiplie par 0,7 — pas par 0,3', () => {
    expect(discountFactor(30)).toBe(0.7);
    expect(applyDiscount(30, 40)).toBe(28);
    expect(applyDiscount(30, 40)).not.toBe(percentOf(30, 40));
  });

  it('le prix soldé vaut le prix moins la remise', () => {
    for (const t of [5, 10, 20, 25, 30, 40, 50, 70]) {
      expect(applyDiscount(t, 80)).toBe(round2(80 - percentOf(t, 80)));
    }
  });
});

describe('vitesse', () => {
  it('la vitesse moyenne est le coefficient du trajet', () => {
    expect(speed(180, 3)).toBe(60);
    expect(distance(60, 2.5)).toBe(150);
  });

  it('n’invente pas de vitesse pour une durée nulle', () => {
    expect(speed(180, 0)).toBe(null);
  });

  it('distance et vitesse sont réciproques', () => {
    expect(speed(distance(72, 4), 4)).toBe(72);
  });
});
