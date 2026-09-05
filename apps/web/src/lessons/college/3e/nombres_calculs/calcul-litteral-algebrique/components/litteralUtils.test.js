import { describe, it, expect } from 'vitest';
import {
  term, reduce, evaluate, areLike, isReduced, mergeTerms, termsEqual, sameExpression,
  expandProduct, areaPieces, commonFactor, factorOut, matchSquare, matchDiffSquares,
  testTable, evaluateBorder, formatMonomials, formatTerms, formatProduct, parseTerms,
  buildRectLayout, buildSquareLayout, sumStrip, likePairs, tilesOf, atomicFactors,
} from './litteralUtils';

const X = (c = 1) => term(c, 1);
const X2 = (c = 1) => term(c, 2);
const K = (c) => term(c, 0);
const XS = [-3, -2, -1, 0, 1, 2, 3, 4, 5];

/* ── 1. Réduire : l'invariant « même machine, autre écriture » ────── */
describe('reduce / evaluate / isReduced', () => {
  it('reduce([5x, −8, −2x, +3]) donne 3x − 5', () => {
    expect(reduce([X(5), K(-8), X(-2), K(3)])).toEqual([{ coef: 3, deg: 1 }, { coef: -5, deg: 0 }]);
  });

  it('reduce est idempotent et conserve la valeur pour tout x', () => {
    const t = [X(5), K(-8), X(-2), K(3), X2(4), X2(-4)];
    const r = reduce(t);
    expect(reduce(r)).toEqual(r);
    for (const x of XS) expect(evaluate(r, x)).toBe(evaluate(t, x));
  });

  it('les coefficients nuls disparaissent, degré décroissant', () => {
    expect(reduce([X2(4), X(-1), X2(-4)])).toEqual([{ coef: -1, deg: 1 }]);
    expect(reduce([K(2), X2(1), X(3)]).map((t) => t.deg)).toEqual([2, 1, 0]);
    expect(reduce([X(2), X(-2)])).toEqual([]);
  });

  it('isReduced : un seul terme par degré, aucun coefficient nul', () => {
    expect(isReduced([X(3), K(-5)])).toBe(true);
    expect(isReduced([X(5), K(-8), X(-2), K(3)])).toBe(false);
    expect(isReduced([X(0), K(1)])).toBe(false);
    expect(isReduced([])).toBe(true);
  });
});

/* ── 2. Termes semblables : la fusion refusée ────────────────────── */
describe('areLike / mergeTerms', () => {
  it('3x et 2 ne sont pas semblables : mergeTerms retourne null (le REFUS)', () => {
    expect(areLike(X(3), K(2))).toBe(false);
    expect(mergeTerms([X(3), K(2)], 0, 1)).toBeNull();
  });

  it('3x et 2x fusionnent en 5x — des x additionnés restent des x', () => {
    expect(areLike(X(3), X(2))).toBe(true);
    expect(mergeTerms([X(3), X(2)], 0, 1)).toEqual([{ coef: 5, deg: 1 }]);
  });

  it('la fusion raccourcit d’exactement 1 et garde la place du premier', () => {
    const t = [X(5), K(-8), X(-2), K(3)];
    const m = mergeTerms(t, 0, 2);
    expect(m).toHaveLength(t.length - 1);
    expect(m).toEqual([{ coef: 3, deg: 1 }, { coef: -8, deg: 0 }, { coef: 3, deg: 0 }]);
    for (const x of XS) expect(evaluate(m, x)).toBe(evaluate(t, x));
  });

  it('x² et x ne fusionnent pas (3x + 2x ≠ 5x²)', () => {
    expect(mergeTerms([X2(1), X(6)], 0, 1)).toBeNull();
    expect(mergeTerms([X(3), X(2)], 0, 1)).not.toEqual([{ coef: 5, deg: 2 }]);
  });

  it('termsEqual / sameExpression : 3x + 2 n’est pas 5x, mais 2 + 3x l’est', () => {
    expect(termsEqual([X(3), K(2)], [K(2), X(3)])).toBe(false);
    expect(sameExpression([X(3), K(2)], [K(2), X(3)])).toBe(true);
    expect(sameExpression([X(3), K(2)], [X(5)])).toBe(false);
  });
});

/* ── 3. Développer : les morceaux du rectangle ───────────────────── */
describe('expandProduct / areaPieces', () => {
  it('(x + 3)(x + 2) donne les quatre morceaux x², 2x, 3x, 6 puis x² + 5x + 6', () => {
    const p = { a: [X(1), K(3)], b: [X(1), K(2)] };
    expect(expandProduct(p)).toEqual([
      { coef: 1, deg: 2 }, { coef: 2, deg: 1 }, { coef: 3, deg: 1 }, { coef: 6, deg: 0 },
    ]);
    expect(reduce(expandProduct(p))).toEqual([
      { coef: 1, deg: 2 }, { coef: 5, deg: 1 }, { coef: 6, deg: 0 },
    ]);
  });

  it('PROPRIÉTÉ : évaluer le développement = évaluer le produit, pour x ∈ −3…5', () => {
    const products = [
      { a: [X(1), K(3)], b: [X(1), K(2)] },
      { a: [K(4)], b: [X(2), K(-3)] },
      { a: [K(3)], b: [X(1), K(2)] },
      { a: [X(1), K(5)], b: [X(1), K(1)] },
      { a: [X(1), K(-4)], b: [X(1), K(4)] },
      { a: [X(2), K(-1)], b: [X(3), K(-5)] },
    ];
    const z = (n) => n + 0; // normalise le −0 arithmétique
    for (const p of products) {
      for (const x of XS) {
        const expected = z(evaluate(p.a, x) * evaluate(p.b, x));
        expect(z(evaluate(expandProduct(p), x))).toBe(expected);
        expect(z(evaluate(reduce(expandProduct(p)), x))).toBe(expected);
      }
    }
  });

  it('4(2x − 3) donne 8x − 12 : le signe est porté par CHAQUE morceau', () => {
    const p = { a: [K(4)], b: [X(2), K(-3)] };
    expect(expandProduct(p)).toEqual([{ coef: 8, deg: 1 }, { coef: -12, deg: 0 }]);
    // Le piège 8x − 3 ne vaut pas la même chose dès x = 0.
    expect(evaluate([X(8), K(-3)], 0)).not.toBe(evaluate(expandProduct(p), 0));
  });

  it('areaPieces porte position et étiquette, mêmes termes que expandProduct', () => {
    const p = { a: [X(1), K(3)], b: [X(1), K(2)] };
    const pieces = areaPieces(p);
    expect(pieces).toHaveLength(4);
    expect(pieces.map((q) => q.id)).toEqual(['r0c0', 'r0c1', 'r1c0', 'r1c1']);
    expect(pieces.map((q) => q.labelPlain)).toEqual(['x²', '2x', '3x', '6']);
    expect(pieces.map((q) => q.term)).toEqual(expandProduct(p));
    expect(pieces[0].labelLatex).toBe('x^{2}');
  });
});

/* ── 4. Factoriser : le chemin inverse ──────────────────────────── */
describe('commonFactor / factorOut', () => {
  it('6x + 9 se factorise en 3(2x + 3) — chaque terme divisé', () => {
    expect(commonFactor([X(6), K(9)])).toEqual({ coef: 3, deg: 0 });
    expect(factorOut([X(6), K(9)])).toEqual({
      factor: { coef: 3, deg: 0 },
      rest: [{ coef: 2, deg: 1 }, { coef: 3, deg: 0 }],
    });
  });

  it('x² + 6x se factorise en x(x + 6)', () => {
    expect(factorOut([X2(1), X(6)])).toEqual({
      factor: { coef: 1, deg: 1 },
      rest: [{ coef: 1, deg: 1 }, { coef: 6, deg: 0 }],
    });
  });

  it('INVARIANT de retour : développer la factorisation redonne l’expression', () => {
    const cases = [[X(6), K(9)], [X2(1), X(6)], [X(12), K(-18)], [X2(4), X(8)], [X(-6), K(-9)]];
    for (const t of cases) {
      const { factor, rest } = factorOut(t);
      expect(reduce(expandProduct({ a: [factor], b: rest }))).toEqual(reduce(t));
      // Le piège 3(2x + 9) : on n’a divisé qu’un terme.
      for (const x of XS) {
        expect(evaluate(expandProduct({ a: [factor], b: rest }), x)).toBe(evaluate(t, x));
      }
    }
  });

  it('le signe est choisi pour que le reste commence par un positif', () => {
    expect(commonFactor([X(-6), K(-9)])).toEqual({ coef: -3, deg: 0 });
    expect(factorOut([X(-6), K(-9)]).rest).toEqual([{ coef: 2, deg: 1 }, { coef: 3, deg: 0 }]);
  });
});

/* ── 5. Identités remarquables ──────────────────────────────────── */
describe('matchSquare / matchDiffSquares', () => {
  it('x² + 6x + 9 → (x + 3)², x² − 6x + 9 → (x − 3)²', () => {
    expect(matchSquare([X2(1), X(6), K(9)])).toEqual({ a: { coef: 1, deg: 1 }, b: { coef: 3, deg: 0 }, sign: 1 });
    expect(matchSquare([X2(1), X(-6), K(9)])).toEqual({ a: { coef: 1, deg: 1 }, b: { coef: 3, deg: 0 }, sign: -1 });
  });

  it('x² + 5x + 9 n’est PAS un carré (le double produit ne colle pas)', () => {
    expect(matchSquare([X2(1), X(5), K(9)])).toBeNull();
    expect(matchSquare([X2(1), X(6), K(8)])).toBeNull();
  });

  it('développer le carré reconnu redonne l’expression de départ', () => {
    for (const t of [[X2(1), X(6), K(9)], [X2(1), X(-6), K(9)], [X2(1), X(8), K(16)], [X2(4), X(12), K(9)]]) {
      const m = matchSquare(t);
      expect(m).not.toBeNull();
      const side = [m.a, { coef: m.sign * m.b.coef, deg: 0 }];
      expect(reduce(expandProduct({ a: side, b: side }))).toEqual(reduce(t));
    }
  });

  it('x² − 25 → (x + 5)(x − 5) ; x² + 25 n’est pas une différence de carrés', () => {
    expect(matchDiffSquares([X2(1), K(-25)])).toEqual({ a: { coef: 1, deg: 1 }, b: { coef: 5, deg: 0 } });
    expect(matchDiffSquares([X2(1), K(25)])).toBeNull();
    expect(matchDiffSquares([X2(1), K(-24)])).toBeNull();
    const m = matchDiffSquares([X2(1), K(-25)]);
    expect(reduce(expandProduct({ a: [m.a, m.b], b: [m.a, { coef: -m.b.coef, deg: 0 }] })))
      .toEqual(reduce([X2(1), K(-25)]));
  });
});

/* ── 6. Tableau de valeurs : une valeur ne suffit pas ────────────── */
describe('testTable', () => {
  it('3x + 2 et 5x coïncident en x = 1 mais divergent en x = 2', () => {
    const rows = testTable([[X(3), K(2)], [X(5)]], [1, 2]);
    expect(rows[0]).toEqual({ x: 1, values: [5, 5], allEqual: true });
    expect(rows[1]).toEqual({ x: 2, values: [8, 10], allEqual: false });
  });

  it('trois écritures de la bordure coïncident partout', () => {
    const rows = testTable(
      [[X(4), K(4)], [X(4), K(4)], [X(4), K(4)]],
      [0, 1, 2, 3, 5],
    );
    expect(rows.every((r) => r.allEqual)).toBe(true);
  });

  it('(a + b)² vs a² + b² : jamais égaux sauf cas dégénérés', () => {
    // colonne 1 : (x + 2)² ; colonne 2 : x² + 4
    const rows = testTable([[X2(1), X(4), K(4)], [X2(1), K(4)]], [1, 2, 3]);
    expect(rows.map((r) => r.allEqual)).toEqual([false, false, false]);
    expect(rows[0].values).toEqual([9, 5]);
  });
});

/* ── 7. Formats ─────────────────────────────────────────────────── */
describe('formatTerms / formatMonomials / formatProduct / parseTerms', () => {
  it('1x → x, −1x → −x, 0 retiré, x² en LaTeX, moins en tête', () => {
    expect(formatTerms([X(1)])).toBe('x');
    expect(formatTerms([X(-1)])).toBe('−x');
    expect(formatTerms([X(3), K(0), K(-5)])).toBe('3x − 5');
    expect(formatTerms([])).toBe('0');
    expect(formatTerms([K(0)])).toBe('0');
    expect(formatTerms([X2(1), X(5), K(6)], { latex: true })).toBe('x^{2}+5x+6');
    expect(formatTerms([X(-2), K(3)], { latex: true })).toBe('-2x+3');
  });

  it('formatMonomials gère les symboles libres (a², ab, b²)', () => {
    expect(formatMonomials(
      [{ coef: 1, symPlain: 'a²' }, { coef: 2, symPlain: 'ab' }, { coef: 1, symPlain: 'b²' }],
    )).toBe('a² + 2ab + b²');
    expect(formatMonomials(
      [{ coef: 1, symLatex: 'a^{2}' }, { coef: 2, symLatex: 'ab' }],
      { latex: true },
    )).toBe('a^{2}+2ab');
  });

  it('formatProduct met les parenthèses seulement où il le faut', () => {
    expect(formatProduct({ a: [K(3)], b: [X(1), K(2)] })).toBe('3(x + 2)');
    expect(formatProduct({ a: [X(1), K(3)], b: [X(1), K(2)] })).toBe('(x + 3)(x + 2)');
    expect(formatProduct({ a: [K(3)], b: [X(1)] })).toBe('3 × x');
  });

  it('parseTerms fait l’aller-retour avec formatTerms', () => {
    expect(parseTerms('3x² − 5x + 2')).toEqual([{ coef: 3, deg: 2 }, { coef: -5, deg: 1 }, { coef: 2, deg: 0 }]);
    expect(parseTerms('x^2+6x+9')).toEqual([{ coef: 1, deg: 2 }, { coef: 6, deg: 1 }, { coef: 9, deg: 0 }]);
    expect(parseTerms('-x-4')).toEqual([{ coef: -1, deg: 1 }, { coef: -4, deg: 0 }]);
    for (const s of ['3x − 5', 'x² + 5x + 6', '−x − 4', '8x − 12']) {
      expect(formatTerms(parseTerms(s))).toBe(s);
    }
  });
});

/* ── 8. La bordure du jardin : trois écritures, une quantité ────── */
describe('evaluateBorder', () => {
  it('4n + 4 = 4(n + 1) = (n + 2)² − n² pour n de 1 à 10', () => {
    for (let n = 1; n <= 10; n += 1) {
      expect(evaluateBorder(n)).toBe(4 * (n + 1));
      expect(evaluateBorder(n)).toBe((n + 2) ** 2 - n ** 2);
    }
    expect(evaluateBorder(2)).toBe(12);
  });
});

/* ── 9. Géométrie du rectangle d'aire (le composant signature) ──── */
describe('buildRectLayout / buildSquareLayout / sumStrip / likePairs', () => {
  it('3 × (x + 2) : deux morceaux, x dessiné à 3 unités', () => {
    const L = buildRectLayout({ a: [K(3)], b: [X(1), K(2)] });
    expect(L.pieces).toHaveLength(2);
    expect(L.pieces.map((p) => p.plain)).toEqual(['3x', '6']);
    expect(L.sideB.map((s) => s.len)).toEqual([3, 2]);   // x → 3 unités, 2 → 2
    expect(L.height).toBe(3);
    expect(L.width).toBe(5);
  });

  it('4 × (2x − 3) : le morceau négatif garde sa longueur et porte le drapeau neg', () => {
    const L = buildRectLayout({ a: [K(4)], b: [X(2), K(-3)] });
    expect(L.pieces.map((p) => p.plain)).toEqual(['8x', '−12']);
    expect(L.pieces.map((p) => p.neg)).toEqual([false, true]);
    expect(L.sideB[1].len).toBe(3);
  });

  it('(x + 3)(x + 2) : quatre morceaux, deux d’entre eux semblables', () => {
    const L = buildRectLayout({ a: [X(1), K(3)], b: [X(1), K(2)] });
    expect(L.pieces).toHaveLength(4);
    const all = L.pieces.map((p) => p.id);
    expect(likePairs(L.pieces, all)).toEqual([['r0c1', 'r1c0']]);
    expect(sumStrip(L.pieces, all, false)).toBe('x^{2}+2x+3x+6');
    expect(sumStrip(L.pieces, all, true)).toBe('x^{2}+5x+6');
    expect(sumStrip(L.pieces, ['r0c0'], false)).toBe('x^{2}');
    expect(sumStrip(L.pieces, [], false)).toBe('0');
  });

  it('le carré (a + b)² a quatre morceaux dont deux ab semblables', () => {
    const S = buildSquareLayout();
    expect(S.pieces.map((p) => p.plain)).toEqual(['a²', 'ab', 'ab', 'b²']);
    expect(likePairs(S.pieces, S.pieces.map((p) => p.id))).toEqual([['r0c1', 'r1c0']]);
    expect(sumStrip(S.pieces, S.pieces.map((p) => p.id), true)).toBe('a^{2}+2ab+b^{2}');
    // Le piège a² + b² : deux morceaux sur quatre.
    expect(sumStrip(S.pieces, ['r0c0', 'r1c1'], true)).toBe('a^{2}+b^{2}');
  });
});

/* ── 10. Tuiles et facteurs atomiques ───────────────────────────── */
describe('tilesOf / atomicFactors', () => {
  it('tilesOf décompose par forme de tuile', () => {
    expect(tilesOf([X2(2), X(3), K(-5)])).toEqual([
      { kind: 'x2', neg: false, count: 2 },
      { kind: 'x', neg: false, count: 3 },
      { kind: 'unit', neg: true, count: 5 },
    ]);
  });

  it('atomicFactors : 6x → 2 · 3 · x, 9 → 3 · 3, x² → x · x, −6x porte le −1', () => {
    expect(atomicFactors(X(6))).toEqual(['2', '3', 'x']);
    expect(atomicFactors(K(9))).toEqual(['3', '3']);
    expect(atomicFactors(X2(1))).toEqual(['x', 'x']);
    expect(atomicFactors(X(-6))).toEqual(['−1', '2', '3', 'x']);
    expect(atomicFactors(K(1))).toEqual(['1']);
  });
});
