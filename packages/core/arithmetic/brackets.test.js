import { describe, it, expect } from 'vitest';
import * as B from './brackets.js';

const t = (c, p = 0) => ({ c, p });
const g = B.group;

describe('brackets — supprimer les parenthèses et réduire (3AM unité 4)', () => {
  it('un groupe précédé de + rend ses termes tels quels, précédé de − les rend opposés', () => {
    expect(B.removeBrackets([t(7), g(1, [t(2, 1), t(-3)])])).toEqual([t(7), t(2, 1), t(-3)]);
    expect(B.removeBrackets([t(9), g(-1, [t(4, 1), t(-5)])])).toEqual([t(9), t(-4, 1), t(5)]);
    expect(B.isRightExit(1, false)).toBe(true);
    expect(B.isRightExit(1, true)).toBe(false);
    expect(B.isRightExit(-1, true)).toBe(true);
    expect(B.isRightExit(-1, false)).toBe(false);
  });

  it('les exemples du manuel (معارف 2 et la طريقة p. 59) se réduisent comme le manuel', () => {
    // a + (7 − b) = a + 7 − b, avec a = x et b = x² (deux lettres remplacées par deux puissances pour le calcul)
    // A = 5x² − 8 + (10x − 3x²) − (2 − 3x) = 2x² + 13x − 10
    const A = [t(5, 2), t(-8), g(1, [t(10, 1), t(-3, 2)]), g(-1, [t(2), t(-3, 1)])];
    expect(B.simplify(A)).toEqual([t(2, 2), t(13, 1), t(-10)]);
    expect(B.openedTex(A)).toBe('5x^2 - 8 + 10x - 3x^2 - 2 + 3x');
    expect(B.simplifiedTex(A)).toBe('2x^2 + 13x - 10');
    // دوري الآن 1 : −2x² + 7 − (−x + 5x²) + (−9x + 1) = −7x² − 8x + 8
    const N = [t(-2, 2), t(7), g(-1, [t(-1, 1), t(5, 2)]), g(1, [t(-9, 1), t(1)])];
    expect(B.simplify(N)).toEqual([t(-7, 2), t(-8, 1), t(8)]);
  });

  it('la valeur ne change pas : expression écrite = sans parenthèses = réduite, pour tout x de −20 à 20', () => {
    const exprs = [
      [t(5, 2), t(-8), g(1, [t(10, 1), t(-3, 2)]), g(-1, [t(2), t(-3, 1)])],
      [t(3, 1), g(1, [t(1, 1), t(-2)]), g(-1, [t(5), t(-2, 1)])],
      [g(-1, [t(-4, 1), t(6)]), t(2, 2)],
    ];
    for (const e of exprs) for (let x = -20; x <= 20; x++) {
      expect(B.valueAt(e, x)).toBe(B.valueAt(B.removeBrackets(e), x));
      expect(B.valueAt(e, x)).toBe(B.valueAt(B.simplify(e), x));
    }
  });

  it('une mauvaise sortie change la valeur, et le témoin la montre (la valeur réglée d’abord)', () => {
    const E = [t(9), g(-1, [t(4, 1), t(-5)])];        // 9 − (4x − 5) = −4x + 14
    const wrong = [t(9), t(4, 1), t(-5)];              // les signes gardés : 4x + 4
    expect(B.sameExpression(E, wrong)).toBe(false);
    expect(B.witness(E, wrong, { prefer: 3 })).toBe(3);
    expect(B.valueAt(E, 3)).toBe(2);
    expect(B.valueAt(wrong, 3)).toBe(16);
    // seul le premier signe changé : 9 − 4x − 5 = −4x + 4 ; diffère partout
    expect(B.witness(E, [t(9), t(-4, 1), t(-5)])).toBe(1);
    expect(B.witness(E, B.removeBrackets(E))).toBeNull();
  });

  it('le témoin évite la valeur réglée quand elle cache la différence (x = 1 pour x² et x)', () => {
    expect(B.kindWitness(t(3, 2), t(3, 1), { prefer: 1 })).toBe(2);
    expect(B.kindWitness(t(3, 2), t(3, 1), { prefer: 4 })).toBe(4);
    expect(B.kindWitness(t(3, 1), t(-2, 1))).toBeNull();
    expect(B.kindWitness(t(2, 1), t(5, 0), { prefer: 1 })).toBe(2);
  });

  it('écrit les expressions en LaTeX, parenthèses comprises', () => {
    expect(B.expressionTex([t(9), g(-1, [t(4, 1), t(-5)])])).toBe('9 - (4x - 5)');
    expect(B.expressionTex([t(3, 1), g(1, [t(1, 1), t(-2)]), g(-1, [t(5), t(-2, 1)])])).toBe('3x + (x - 2) - (5 - 2x)');
    expect(B.expressionTex([g(-1, [t(-4, 1), t(6)]), t(2, 2)])).toBe('-(-4x + 6) + 2x^2');
    expect(B.simplifiedTex([t(3, 2), t(-3, 2)])).toBe('0');
  });

  it('produit de monômes et nature de la dernière opération', () => {
    expect(B.multiplyMonomials(t(3, 1), t(5, 1))).toEqual(t(15, 2));
    expect(B.multiplyMonomials(t(4), t(3, 1))).toEqual(t(12, 1));
    expect(B.lastOperation({ op: '+', args: [] })).toBe('sum');
    expect(B.lastOperation({ op: '×', args: [] })).toBe('product');
    expect(B.lastOperation('3x')).toBe('term');
  });
});
