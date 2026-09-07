import { describe, it, expect } from 'vitest';
import {
  makeTower, exponent, factorCount, addFactor, removeFactor, removeMany,
  mergeInto, duplicate, expandedText, groupedText, simplifyPairs, packetCount,
} from './factorTowerUtils';
import { pow } from './powerUtils';

/**
 * Ce que ces tests protègent, ce n'est pas du code : c'est la PROMESSE
 * faite à l'élève. « L'exposant compte les facteurs » doit rester vrai
 * pour tout état atteignable par un geste, sinon le dessin et l'écriture
 * peuvent se contredire — et c'est exactement le bug qu'on répare.
 */

describe('l’exposant se COMPTE, il ne se stocke pas', () => {
  it('vaut le nombre de blocs, pour toute tour construite', () => {
    for (let n = 0; n <= 8; n += 1) {
      const t = makeTower(3, n);
      expect(factorCount(t)).toBe(n);
      expect(exponent(t)).toBe(n);
    }
  });

  it('n’expose AUCUN champ « exposant » : il n’y a rien à désynchroniser', () => {
    const t = makeTower(3, 4);
    expect(t.n).toBeUndefined();
    expect(t.exponent).toBeUndefined();
    expect(Object.keys(t).sort()).toEqual(['base', 'below', 'factors']);
  });

  it('donne toujours un exposant cohérent avec la valeur de powerUtils', () => {
    for (const base of [2, 3, 5, 10]) {
      for (let n = 0; n <= 6; n += 1) {
        expect(pow(base, exponent(makeTower(base, n)))).toBe(pow(base, n));
      }
    }
  });
});

describe('poser et retirer un facteur — un geste, un cran', () => {
  it('poser un facteur augmente le compte de 1, toujours', () => {
    let t = makeTower(3, 0);
    for (let n = 1; n <= 10; n += 1) {
      t = addFactor(t);
      expect(factorCount(t)).toBe(n);
    }
  });

  it('retirer puis poser rend la tour identique en compte', () => {
    for (let n = 1; n <= 8; n += 1) {
      const t = makeTower(3, n);
      expect(exponent(addFactor(removeFactor(t)))).toBe(exponent(t));
    }
  });

  it('les gestes sont PURS : la tour de départ n’est jamais mutée', () => {
    const t = makeTower(3, 3);
    const before = factorCount(t);
    addFactor(t);
    removeFactor(t);
    mergeInto(t, makeTower(3, 2));
    expect(factorCount(t)).toBe(before);
  });

  it('chaque bloc garde un id unique — React ne recycle pas les facteurs', () => {
    const t = makeTower(3, 6);
    const ids = t.factors.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('la descente sous le sol prolonge le même geste (module 2)', () => {
  it('vider la tour donne l’exposant 0, et la valeur 1', () => {
    const t = removeMany(makeTower(10, 3), 3);
    expect(exponent(t)).toBe(0);
    expect(pow(10, exponent(t))).toBe(1);
  });

  it('un cran de plus passe sous le sol, sans jamais rendre la valeur négative', () => {
    let t = removeMany(makeTower(10, 3), 3);
    for (let k = 1; k <= 3; k += 1) {
      t = removeFactor(t);
      expect(exponent(t)).toBe(-k);
      expect(pow(10, exponent(t))).toBeGreaterThan(0);
    }
    expect(pow(10, exponent(t))).toBeCloseTo(0.001, 12);
  });

  it('poser un facteur sous le sol REMONTE d’un cran (on annule une division)', () => {
    const deep = removeMany(makeTower(3, 0), 2);
    expect(exponent(deep)).toBe(-2);
    expect(exponent(addFactor(deep))).toBe(-1);
    expect(exponent(addFactor(addFactor(deep)))).toBe(0);
  });
});

describe('la fusion CONCATÈNE — l’addition des exposants en est la conséquence', () => {
  it('verser B dans A préserve chaque facteur, aucun n’est fondu', () => {
    const a = makeTower(3, 2, 'a');
    const b = makeTower(3, 3, 'b');
    const m = mergeInto(a, b);
    expect(factorCount(m)).toBe(factorCount(a) + factorCount(b));
    expect(m.factors.filter((f) => f.from === 'a')).toHaveLength(2);
    expect(m.factors.filter((f) => f.from === 'b')).toHaveLength(3);
  });

  it('a^m × a^n = a^(m+n) pour tout couple balayé — la règle, pas un exemple', () => {
    for (let m = 0; m <= 6; m += 1) {
      for (let n = 0; n <= 6; n += 1) {
        const merged = mergeInto(makeTower(3, m, 'a'), makeTower(3, n, 'b'));
        expect(exponent(merged)).toBe(m + n);
        expect(pow(3, exponent(merged))).toBe(pow(3, m) * pow(3, n));
      }
    }
  });

  it('la BASE ne bouge jamais — le piège 3² × 3³ = 9⁵ est structurellement impossible', () => {
    const merged = mergeInto(makeTower(3, 2, 'a'), makeTower(3, 3, 'b'));
    expect(merged.base).toBe(3);
  });

  it('refuse deux bases différentes : la règle ne s’applique pas', () => {
    expect(mergeInto(makeTower(3, 2), makeTower(5, 2))).toBeNull();
  });
});

describe('l’écriture intermédiaire — celle que l’ancienne version sautait', () => {
  it('garde les deux groupes visibles après la fusion', () => {
    const merged = mergeInto(makeTower(3, 2, 'a'), makeTower(3, 3, 'b'));
    expect(groupedText(merged))
      .toBe('\\left(3 \\times 3\\right) \\times \\left(3 \\times 3 \\times 3\\right)');
  });

  it('puis le produit à plat, qui a exactement autant de facteurs que de blocs', () => {
    const merged = mergeInto(makeTower(3, 2, 'a'), makeTower(3, 3, 'b'));
    const flat = expandedText(merged);
    expect(flat).toBe('3 \\times 3 \\times 3 \\times 3 \\times 3');
    expect(flat.split('\\times')).toHaveLength(factorCount(merged));
  });

  it('ne regroupe pas ce qui n’a qu’une origine — rien à montrer, rien à parenthéser', () => {
    expect(groupedText(makeTower(3, 4, 'a'))).toBe(expandedText(makeTower(3, 4, 'a')));
  });

  it('une tour vide s’écrit 1, jamais « rien » — c’est a⁰', () => {
    expect(expandedText(makeTower(3, 0))).toBe('1');
    expect(groupedText(makeTower(3, 0))).toBe('1');
  });
});

describe('le quotient : diviser, c’est retirer des facteurs', () => {
  it('a^m ÷ a^n = a^(m−n) sur tout le balayage, sous le sol compris', () => {
    for (let m = 0; m <= 6; m += 1) {
      for (let n = 0; n <= 6; n += 1) {
        expect(exponent(removeMany(makeTower(3, m), n))).toBe(m - n);
      }
    }
  });

  it('compte les paires qui se simplifient avant d’annoncer le résultat', () => {
    expect(simplifyPairs(5, 2)).toEqual({ cancelled: 2, remaining: 3, leftover: 0 });
    expect(simplifyPairs(6, 4)).toEqual({ cancelled: 4, remaining: 2, leftover: 0 });
  });

  it('quand on enlève plus qu’il n’y a, le reste part au dénominateur', () => {
    expect(simplifyPairs(2, 5)).toEqual({ cancelled: 2, remaining: 0, leftover: 3 });
  });

  it('les paires simplifiées valent 1 : le compte restant EST l’exposant', () => {
    for (let m = 0; m <= 6; m += 1) {
      for (let n = 0; n <= m; n += 1) {
        const { remaining } = simplifyPairs(m, n);
        expect(remaining).toBe(exponent(removeMany(makeTower(3, m), n)));
      }
    }
  });
});

describe('la puissance de puissance garde ses PAQUETS', () => {
  it('rend k paquets de m facteurs, et non une pile de m×k', () => {
    const packets = duplicate(makeTower(3, 2), 3);
    expect(packets).toHaveLength(3);
    packets.forEach((p) => expect(factorCount(p)).toBe(2));
  });

  it('(a^m)^k = a^(m×k) — le total se lit sur les colonnes', () => {
    for (let m = 1; m <= 4; m += 1) {
      for (let k = 1; k <= 4; k += 1) {
        const { packets, perPacket, total } = packetCount(duplicate(makeTower(3, m), k));
        expect(packets).toBe(k);
        expect(perPacket).toBe(m);
        expect(total).toBe(m * k);
      }
    }
  });

  it('DISTINGUE la répétition du produit — c’est le piège 3²×3³ = 3⁶', () => {
    // Produit : 2 + 3 = 5 facteurs.
    const produit = mergeInto(makeTower(3, 2, 'a'), makeTower(3, 3, 'b'));
    // Répétition : 2 × 3 = 6 facteurs, en trois paquets distincts.
    const repetition = packetCount(duplicate(makeTower(3, 2), 3));
    expect(exponent(produit)).toBe(5);
    expect(repetition.total).toBe(6);
    expect(exponent(produit)).not.toBe(repetition.total);
  });

  it('chaque paquet porte sa propre marque : les colonnes restent séparables', () => {
    const packets = duplicate(makeTower(3, 2), 3);
    const marks = packets.map((p) => p.factors[0].from);
    expect(new Set(marks).size).toBe(3);
  });
});
