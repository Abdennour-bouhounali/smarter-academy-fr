import { describe, it, expect } from 'vitest';
import * as F from './fraction.js';

/**
 * §63 « Fractions » : simplifier, additionner, soustraire, multiplier,
 * diviser, comparer — et §61, l'arithmétique EXACTE.
 */

describe('la fraction brute', () => {
  it('garde sa forme NON réduite — c’est le sujet du chapitre (§9)', () => {
    expect(F.makeFrac(2, 4)).toEqual({ n: 2, d: 4 });
    expect(F.simplify({ n: 2, d: 4 })).toEqual({ n: 1, d: 2 });
  });

  it('porte le signe au numérateur, jamais au dénominateur', () => {
    expect(F.makeFrac(1, -2)).toEqual({ n: -1, d: 2 });
    expect(F.makeFrac(-3, -4)).toEqual({ n: 3, d: 4 });
  });

  it('refuse un dénominateur nul plutôt que de rendre l’infini', () => {
    expect(F.makeFrac(1, 0)).toBeNull();
    expect(F.makeFrac(1.5, 2)).toBeNull();
  });

  it('dit si elle est déjà irréductible, et par quoi simplifier (§50)', () => {
    expect(F.isSimplified({ n: 3, d: 4 })).toBe(true);
    expect(F.isSimplified({ n: 6, d: 8 })).toBe(false);
    expect(F.simplifyFactor({ n: 6, d: 8 })).toBe(2);
    expect(F.simplifyFactor({ n: 3, d: 4 })).toBe(1);
  });
});

describe('§9 — les fractions équivalentes se DÉCOUVRENT', () => {
  it('couper chaque part en deux donne la même valeur', () => {
    const half = F.makeFrac(1, 2);
    expect(F.expand(half, 2)).toEqual({ n: 2, d: 4 });
    expect(F.expand(half, 4)).toEqual({ n: 4, d: 8 });
    expect(F.fracToNumber(F.expand(half, 4))).toBe(0.5);
  });

  it('les premières équivalentes partent de la forme réduite', () => {
    const list = F.equivalents({ n: 2, d: 4 }, 4);
    expect(list).toEqual([{ n: 1, d: 2 }, { n: 2, d: 4 }, { n: 3, d: 6 }, { n: 4, d: 8 }]);
  });
});

describe('§12 — le dénominateur commun est le PPCM, pas le produit', () => {
  it('1/3 et 1/4 deviennent des douzièmes', () => {
    const common = F.commonDenominator(F.makeFrac(1, 3), F.makeFrac(1, 4));
    expect(common.denominator).toBe(12);
    expect(common.left).toEqual({ n: 4, d: 12 });
    expect(common.right).toEqual({ n: 3, d: 12 });
    expect(common.leftFactor).toBe(4);
  });

  it('1/4 et 1/6 deviennent des douzièmes, pas des vingt-quatrièmes', () => {
    expect(F.commonDenominator(F.makeFrac(1, 4), F.makeFrac(1, 6)).denominator).toBe(12);
  });
});

describe('§11 — les quatre opérations, exactes', () => {
  it('1/3 + 1/4 = 7/12, et le calcul GARDE ses douzièmes (§12)', () => {
    const sum = F.addFrac(F.makeFrac(1, 3), F.makeFrac(1, 4));
    expect(sum.raw).toEqual({ n: 7, d: 12 });
    expect(sum.common.left).toEqual({ n: 4, d: 12 });
  });

  it('§61 — 1/3 + 1/3 + 1/3 fait exactement 1, jamais 0,999…', () => {
    const third = F.makeFrac(1, 3);
    const two = F.addFrac(third, third);
    const three = F.addFrac(two.raw, third);
    expect(F.simplify(three.raw)).toEqual({ n: 1, d: 1 });
    expect(F.fracToNumber(F.simplify(three.raw))).toBe(1);
  });

  it('la soustraction peut passer sous zéro', () => {
    const diff = F.subtractFrac(F.makeFrac(1, 4), F.makeFrac(1, 2));
    expect(F.simplify(diff.raw)).toEqual({ n: -1, d: 4 });
  });

  it('le produit ne réduit pas tout seul : 2/3 × 3/4 = 6/12, puis 1/2', () => {
    const product = F.multiplyFrac(F.makeFrac(2, 3), F.makeFrac(3, 4));
    expect(product.raw).toEqual({ n: 6, d: 12 });
    expect(product.simplified).toEqual({ n: 1, d: 2 });
  });

  it('la division montre l’INVERSE qu’elle utilise', () => {
    const quotient = F.divideFrac(F.makeFrac(1, 2), F.makeFrac(3, 4));
    expect(quotient.reciprocal).toEqual({ n: 4, d: 3 });
    expect(quotient.simplified).toEqual({ n: 2, d: 3 });
  });

  it('diviser par zéro n’a pas de résultat, et ne jette pas', () => {
    expect(F.divideFrac(F.makeFrac(1, 2), F.makeFrac(0, 5))).toBeNull();
  });
});

describe('§10 — la comparaison est exacte, et EXPLIQUÉE', () => {
  it('3/5 < 4/7 se tranche par produit croisé', () => {
    const a = F.makeFrac(3, 5);
    const b = F.makeFrac(4, 7);
    expect(F.compareFrac(a, b)).toBe(1);   // 21 > 20
    const cross = F.crossProducts(a, b);
    expect(cross.left).toBe(21);
    expect(cross.right).toBe(20);
  });

  it('deux écritures de la même valeur sont ÉGALES', () => {
    expect(F.compareFrac(F.makeFrac(1, 2), F.makeFrac(2, 4))).toBe(0);
    expect(F.comparisonSign(0)).toBe('=');
  });

  it('§53 — 1/3 n’est pas plus grand que 1/2', () => {
    expect(F.compareFrac(F.makeFrac(1, 3), F.makeFrac(1, 2))).toBe(-1);
    expect(F.comparisonSign(-1)).toBe('<');
  });

  it('compare correctement des négatifs', () => {
    expect(F.compareFrac(F.makeFrac(-1, 2), F.makeFrac(1, 3))).toBe(-1);
    expect(F.compareFrac(F.makeFrac(-1, 2), F.makeFrac(-3, 4))).toBe(1);
  });
});

describe('§13 — décimal ↔ fraction', () => {
  it('3/4 tombe juste : 0,75', () => {
    const d = F.fracToDecimal(F.makeFrac(3, 4));
    expect(d.exact).toBe(true);
    expect(d.integer).toBe('0');
    expect(d.digits).toBe('75');
    expect(d.period).toBeNull();
  });

  it('1/3 ne tombe PAS juste, et rend sa période — jamais 0,3333', () => {
    const d = F.fracToDecimal(F.makeFrac(1, 3));
    expect(d.exact).toBe(false);
    expect(d.period).toBe('3');
  });

  it('1/7 rend sa période de six chiffres', () => {
    expect(F.fracToDecimal(F.makeFrac(1, 7)).period).toBe('142857');
  });

  it('1/6 a une partie fixe PUIS une période : 0,1(6)', () => {
    const d = F.fracToDecimal(F.makeFrac(1, 6));
    expect(d.digits).toBe('1');
    expect(d.period).toBe('6');
  });

  it('0,75 donne 75/100 PUIS 3/4 — §13 montre la simplification', () => {
    const parsed = F.decimalToFrac(0.75);
    expect(parsed.literal).toEqual({ n: 75, d: 100 });
    expect(parsed.simplified).toEqual({ n: 3, d: 4 });
    expect(parsed.factor).toBe(25);
  });
});

describe('le nombre mixte', () => {
  it('7/3 s’écrit 2 et 1/3', () => {
    expect(F.toMixed(F.makeFrac(7, 3))).toEqual({ whole: 2, n: 1, d: 3, negative: false });
  });

  it('et se relit', () => {
    expect(F.fromMixed(2, 1, 3)).toEqual({ n: 7, d: 3 });
    expect(F.fromMixed(2, 1, 3, true)).toEqual({ n: -7, d: 3 });
  });
});

describe('§46 — lire toutes les écritures d’une même valeur', () => {
  it.each([
    ['3/4', { n: 3, d: 4 }, 'fraction'],
    ['0,75', { n: 75, d: 100 }, 'decimal'],
    ['0.75', { n: 75, d: 100 }, 'decimal'],
    ['75%', { n: 75, d: 100 }, 'percent'],
    ['5', { n: 5, d: 1 }, 'integer'],
    ['-5', { n: -5, d: 1 }, 'integer'],
    ['2 1/3', { n: 7, d: 3 }, 'mixed'],
    ['-2 1/3', { n: -7, d: 3 }, 'mixed'],
  ])('« %s » se lit', (input, frac, source) => {
    const parsed = F.parseNumberInput(input);
    expect(parsed.frac).toEqual(frac);
    expect(parsed.source).toBe(source);
  });

  it('accepte la virgule arabe ٫ et l’espace autour de la barre', () => {
    expect(F.parseNumberInput('0٫5').frac).toEqual({ n: 5, d: 10 });
    expect(F.parseNumberInput('3 / 4').frac).toEqual({ n: 3, d: 4 });
  });

  it('refuse ce qui n’est pas un nombre, sans jeter', () => {
    for (const bad of ['', 'x', '1/0', 'abc', '--3', null, undefined, 5]) {
      expect(F.parseNumberInput(bad)).toBeNull();
    }
  });
});

describe('l’écriture', () => {
  it('le LaTeX porte le moins DEVANT la barre', () => {
    expect(F.fracToLatex(F.makeFrac(-1, 3))).toBe('-\\frac{1}{3}');
    expect(F.fracToLatex(F.makeFrac(5, 1))).toBe('5');
  });

  it('le texte nu utilise le VRAI signe moins (§58)', () => {
    expect(F.fracToText(F.makeFrac(-1, 3))).toBe('−1/3');
  });
});
