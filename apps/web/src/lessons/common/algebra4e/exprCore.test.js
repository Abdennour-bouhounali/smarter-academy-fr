import { describe, it, expect } from 'vitest';
import {
  rat, ratAdd, ratSub, ratMul, ratDiv, ratEq, ratToNumber, ratIsDecimal, ratIsInt,
  expr, exprAdd, exprSub, exprScale, exprEval, exprEq,
  term, reduceTerms, likeTermIndices, collectLikeTerms, isReduced,
  expandSimple, expandDouble, reduceDouble, commonFactor, factorise,
  equation, eqAddBoth, eqSubBoth, eqScaleBoth, isSolution, solve, isSolvedForm,
} from './exprCore';

describe('rationnels', () => {
  it('réduit à la construction et porte le signe au numérateur', () => {
    expect(rat(6, 8)).toEqual({ n: 3, d: 4 });
    expect(rat(2, -4)).toEqual({ n: -1, d: 2 });
    expect(rat(-2, -4)).toEqual({ n: 1, d: 2 });
    expect(rat(0, 5)).toEqual({ n: 0, d: 1 });
  });

  it('refuse un dénominateur nul et les non-entiers', () => {
    expect(() => rat(1, 0)).toThrow();
    expect(() => rat(1.5, 2)).toThrow();
  });

  it('calcule exactement, là où les flottants dérivent', () => {
    // 1/3 + 1/3 + 1/3 vaut 1 exactement — en flottant, 0.9999999999999999.
    const tiers = rat(1, 3);
    expect(ratAdd(ratAdd(tiers, tiers), tiers)).toEqual({ n: 1, d: 1 });
    // 0,1 + 0,2 = 0,3 exactement.
    expect(ratAdd(rat(1, 10), rat(2, 10))).toEqual({ n: 3, d: 10 });
    expect(ratSub(rat(1, 3), rat(1, 6))).toEqual({ n: 1, d: 6 });
    expect(ratMul(rat(2, 3), rat(3, 4))).toEqual({ n: 1, d: 2 });
    expect(ratDiv(rat(2, 3), rat(4, 9))).toEqual({ n: 3, d: 2 });
  });

  it('refuse la division par zéro', () => {
    expect(() => ratDiv(rat(1), rat(0))).toThrow();
  });

  it('reconnaît les décimaux finis', () => {
    expect(ratIsDecimal(rat(1, 4))).toBe(true);   // 0,25
    expect(ratIsDecimal(rat(3, 5))).toBe(true);   // 0,6
    expect(ratIsDecimal(rat(1, 3))).toBe(false);
    expect(ratIsDecimal(rat(1, 6))).toBe(false);
    expect(ratIsInt(rat(4, 2))).toBe(true);
  });

  it('compare par produits croisés, pas par valeur flottante', () => {
    expect(ratEq(rat(2, 4), rat(1, 2))).toBe(true);
    expect(ratEq(rat(1, 3), rat(33, 100))).toBe(false);
    expect(ratToNumber(rat(3, 4))).toBe(0.75);
  });
});

describe('expressions du premier degré', () => {
  it('additionne et soustrait terme à terme', () => {
    expect(exprEq(exprAdd(expr(3, -2), expr(-5, 7)), expr(-2, 5))).toBe(true);
    expect(exprEq(exprSub(expr(3, -2), expr(3, 1)), expr(0, -3))).toBe(true);
  });

  it('multiplie les deux termes par un facteur', () => {
    expect(exprEq(exprScale(expr(2, -3), 4), expr(8, -12))).toBe(true);
    expect(exprEq(exprScale(expr(2, -3), rat(1, 2)), expr(1, rat(-3, 2)))).toBe(true);
  });

  it('évalue pour une valeur de l’inconnue', () => {
    expect(ratEq(exprEval(expr(3, -2), 4), rat(10))).toBe(true);
    expect(ratEq(exprEval(expr(3, 1), rat(1, 3)), rat(2))).toBe(true);
    expect(ratEq(exprEval(expr(-2, 5), -3), rat(11))).toBe(true);
  });
});

describe('termes et réduction — le modèle des tuiles', () => {
  const T = [term(3, true), term(2), term(-5, true), term(1)];

  it('somme les termes semblables', () => {
    expect(exprEq(reduceTerms(T), expr(-2, 3))).toBe(true);
    expect(exprEq(reduceTerms([]), expr(0, 0))).toBe(true);
  });

  it('trouve les termes semblables d’un terme donné', () => {
    expect(likeTermIndices(T, 0)).toEqual([0, 2]);
    expect(likeTermIndices(T, 1)).toEqual([1, 3]);
    expect(likeTermIndices(T, 9)).toEqual([]);
  });

  it('fusionne une pile en un seul terme, à la place du premier', () => {
    const merged = collectLikeTerms(T, 0);
    expect(merged).toHaveLength(3);
    expect(merged[0].isX).toBe(true);
    expect(ratEq(merged[0].coef, rat(-2))).toBe(true);
    // Les constantes n'ont pas bougé, ni de valeur ni d'ordre.
    expect(merged.slice(1).map((t) => ratToNumber(t.coef))).toEqual([2, 1]);
    // La valeur mathématique de l'expression est INCHANGÉE par la fusion.
    expect(exprEq(reduceTerms(merged), reduceTerms(T))).toBe(true);
  });

  it('ne mute jamais la liste d’origine', () => {
    const before = JSON.stringify(T);
    collectLikeTerms(T, 0);
    expect(JSON.stringify(T)).toBe(before);
  });

  it('laisse la liste intacte quand il n’y a rien à regrouper', () => {
    const solo = [term(3, true), term(2)];
    expect(collectLikeTerms(solo, 0)).toEqual(solo);
    expect(isReduced(solo)).toBe(true);
    expect(isReduced(T)).toBe(false);
  });
});

describe('distributivité', () => {
  it('développe c(ax + b) en gardant les deux termes distincts', () => {
    const out = expandSimple(3, expr(2, -5));
    expect(out).toHaveLength(2);
    expect(ratEq(out[0].coef, rat(6))).toBe(true);
    expect(out[0].isX).toBe(true);
    expect(ratEq(out[1].coef, rat(-15))).toBe(true);
    // Le développement conserve la valeur : 3(2·4 − 5) = 6·4 − 15.
    expect(ratEq(exprEval(reduceTerms(out), 4), rat(9))).toBe(true);
  });

  it('développe un facteur négatif en changeant les deux signes', () => {
    const out = expandSimple(-2, expr(3, -4));
    expect(ratEq(out[0].coef, rat(-6))).toBe(true);
    expect(ratEq(out[1].coef, rat(8))).toBe(true);
  });

  it('développe (ax + b)(cx + d) en quatre produits', () => {
    const out = expandDouble(expr(2, 1), expr(1, -3));
    expect(out.map((p) => p.deg)).toEqual([2, 1, 1, 0]);
    expect(out.map((p) => ratToNumber(p.coef))).toEqual([2, -6, 1, -3]);
    const r = reduceDouble(out);
    expect(ratEq(r.x2, rat(2))).toBe(true);
    expect(ratEq(r.x, rat(-5))).toBe(true);
    expect(ratEq(r.k, rat(-3))).toBe(true);
  });

  it('le développement double conserve la valeur pour toute valeur testée', () => {
    const L = expr(3, -2);
    const R = expr(2, 5);
    const r = reduceDouble(expandDouble(L, R));
    for (const v of [-4, -1, 0, 1, 7]) {
      const direct = ratMul(exprEval(L, v), exprEval(R, v));
      const viaDev = ratAdd(ratMul(r.x2, rat(v * v)), ratAdd(ratMul(r.x, rat(v)), r.k));
      expect(ratEq(direct, viaDev), `v=${v}`).toBe(true);
    }
  });
});

describe('factorisation', () => {
  it('trouve le facteur commun évident', () => {
    expect(commonFactor(expr(6, 9))).toEqual({ n: 3, d: 1 });
    expect(commonFactor(expr(4, 10))).toEqual({ n: 2, d: 1 });
    // Le signe suit le premier terme : −6x − 9 se factorise par −3.
    expect(commonFactor(expr(-6, -9))).toEqual({ n: -3, d: 1 });
  });

  it('renvoie 1 quand il n’y a pas de facteur commun évident', () => {
    expect(commonFactor(expr(3, 5))).toEqual({ n: 1, d: 1 });
    expect(commonFactor(expr(6, 0))).toEqual({ n: 1, d: 1 });   // un terme nul : rien à mettre en facteur
    expect(commonFactor(expr(rat(1, 2), 3))).toEqual({ n: 1, d: 1 });
  });

  it('factorise en conservant la valeur', () => {
    const e = expr(6, 9);
    const { factor, inner } = factorise(e);
    expect(ratEq(factor, rat(3))).toBe(true);
    expect(exprEq(inner, expr(2, 3))).toBe(true);
    for (const v of [-3, 0, 5]) {
      expect(ratEq(exprEval(e, v), ratMul(factor, exprEval(inner, v))), `v=${v}`).toBe(true);
    }
  });

  it('développer puis factoriser ramène au point de départ', () => {
    const { factor, inner } = factorise(expr(12, -18));
    const back = reduceTerms(expandSimple(factor, inner));
    expect(exprEq(back, expr(12, -18))).toBe(true);
  });
});

describe('équations', () => {
  const eq = equation(expr(3, 1), expr(0, 7));   // 3x + 1 = 7

  it('agit sur les deux membres à la fois', () => {
    const after = eqSubBoth(eq, expr(0, 1));      // −1 des deux côtés
    expect(exprEq(after.left, expr(3, 0))).toBe(true);
    expect(exprEq(after.right, expr(0, 6))).toBe(true);
    // Une transformation légale ne change pas la solution.
    expect(ratEq(solve(after).value, solve(eq).value)).toBe(true);
  });

  it('conserve la solution par ajout, retrait et multiplication', () => {
    const s = solve(eq).value;
    const ops = [
      eqAddBoth(eq, expr(2, 0)),
      eqSubBoth(eq, expr(0, 5)),
      eqScaleBoth(eq, 4),
      eqScaleBoth(eq, rat(1, 3)),
      eqAddBoth(eq, expr(-3, 2)),
    ];
    for (const o of ops) expect(ratEq(solve(o).value, s)).toBe(true);
  });

  it('interdit la multiplication par zéro, qui détruirait l’équation', () => {
    expect(() => eqScaleBoth(eq, 0)).toThrow();
  });

  it('teste une valeur', () => {
    expect(isSolution(eq, 2)).toBe(true);
    expect(isSolution(eq, 3)).toBe(false);
    expect(isSolution(equation(expr(3, 1), expr(0, 2)), rat(1, 3))).toBe(true);
  });

  it('résout, y compris quand la solution n’est pas décimale', () => {
    expect(ratEq(solve(eq).value, rat(2))).toBe(true);
    expect(ratEq(solve(equation(expr(3, 1), expr(0, 2))).value, rat(1, 3))).toBe(true);
    // Inconnue des deux côtés : 5x − 4 = 2x + 8  →  x = 4.
    expect(ratEq(solve(equation(expr(5, -4), expr(2, 8))).value, rat(4))).toBe(true);
  });

  it('nomme les deux cas dégénérés au lieu de renvoyer un nombre faux', () => {
    expect(solve(equation(expr(2, 3), expr(2, 5)))).toEqual({ kind: 'none' });
    expect(solve(equation(expr(2, 3), expr(2, 3)))).toEqual({ kind: 'all' });
  });

  it('reconnaît la forme résolue « x = valeur »', () => {
    expect(isSolvedForm(equation(expr(1, 0), expr(0, 5)))).toBe(true);
    expect(isSolvedForm(equation(expr(3, 0), expr(0, 5)))).toBe(false);
    expect(isSolvedForm(equation(expr(1, 2), expr(0, 5)))).toBe(false);
    expect(isSolvedForm(equation(expr(1, 0), expr(1, 5)))).toBe(false);
  });

  it('une suite de gestes légaux mène de l’équation à sa forme résolue', () => {
    // 5x − 4 = 2x + 8, résolu comme à la balance.
    let e = equation(expr(5, -4), expr(2, 8));
    e = eqSubBoth(e, expr(2, 0));      // retirer 2x des deux côtés
    e = eqAddBoth(e, expr(0, 4));      // ajouter 4 des deux côtés
    e = eqScaleBoth(e, rat(1, 3));     // diviser par 3
    expect(isSolvedForm(e)).toBe(true);
    expect(ratEq(e.right.k, rat(4))).toBe(true);
  });
});
