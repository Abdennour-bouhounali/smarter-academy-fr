import { describe, it, expect } from 'vitest';
import * as R from './rational.js';
import { simplifyExpression, rationalRoots, astToPoly, parsePolynomialSource } from './simplify.js';
import { astToLatex } from './astLatex.js';
import {
  makePoly, polyLatex, mulPoly, powPoly, variablePoly, constantPoly, addPoly, polyEquals, simplifySqrt,
  divideCoefficients, gcdCoefficients, contentOf, latexToText,
} from './polynomial.js';

const r = (n, d = 1) => R.makeRational(n, d);
const kinds = (result) => result.steps.map((step) => step.kind);
const last = (result) => result.steps[result.steps.length - 1];

/** Évalue un AST de l'analyseur en flottant (x, y, a, b… donnés) — l'arbitre indépendant des tests. */
function evalAst(node, scope) {
  switch (node.type) {
    case 'num': return node.value;
    case 'var': return scope[node.name];
    case 'neg': return -evalAst(node.arg, scope);
    case 'bin': {
      const a = evalAst(node.left, scope);
      const b = evalAst(node.right, scope);
      return { '+': a + b, '-': a - b, '*': a * b, '/': a / b, '^': a ** b }[node.op];
    }
    default: throw new Error(node.type);
  }
}

function evalPoly(poly, scope) {
  return poly.reduce((sum, term) => sum + R.toNumber(term.coef) * Object.entries(term.mono).reduce((p, [v, e]) => p * scope[v] ** e, 1), 0);
}

describe('polynomial — le moteur exact', () => {
  it('réduit, trie comme le manuel et écrit sans 1x ni + −', () => {
    const p = makePoly([
      { coef: r(-1), mono: {} }, { coef: r(1), mono: { y: 2 } }, { coef: r(2), mono: { x: 1, y: 1 } }, { coef: r(1), mono: { x: 2 } },
    ]);
    expect(polyLatex(p)).toBe('x^{2} + 2xy + y^{2} - 1');
    expect(polyLatex(makePoly([{ coef: r(1, 2), mono: { x: 1 } }, { coef: r(-1), mono: { x: 1 } }]))).toBe('-\\frac{1}{2}x');
    expect(polyLatex([])).toBe('0');
  });

  it('multiplie, élève à une puissance, divise', () => {
    const x = variablePoly('x');
    const xp1 = addPoly(x, constantPoly(r(1)));
    expect(polyLatex(powPoly(xp1, 3))).toBe('x^{3} + 3x^{2} + 3x + 1');
    expect(polyLatex(mulPoly(xp1, addPoly(x, constantPoly(r(-1)))))).toBe('x^{2} - 1');
    const { quotient, remainder } = divideCoefficients([r(-1), r(0), r(1)], [r(-1), r(1)]);
    expect(quotient).toEqual([r(1), r(1)]);
    expect(remainder.every((c) => c.n === 0)).toBe(true);
    expect(gcdCoefficients([r(-1), r(0), r(1)], [r(1), r(2), r(1)])).toEqual([r(1), r(1)]);
  });

  it('contenu, racines carrées simplifiées, écriture en texte', () => {
    expect(contentOf([r(0), r(9), r(6)])).toEqual(r(3));
    expect(contentOf([r(4), r(0), r(-1)])).toEqual(r(-1));
    expect(contentOf([r(1), r(1, 2)])).toEqual(r(1, 2));
    expect(simplifySqrt(r(12))).toEqual({ k: r(2), m: 3 });
    expect(simplifySqrt(r(1, 2))).toEqual({ k: r(1, 2), m: 2 });
    expect(latexToText('x^{2} - \\frac{1}{2}x')).toBe('x² − 1/2x');
  });

  it('refuse un degré trop grand plutôt que de calculer faux', () => {
    expect(simplifyExpression('x^7').error.code).toBe('degreeTooHigh');
    expect(simplifyExpression('x^4 \\cdot x^3').error.code).toBe('degreeTooHigh');
    expect(['degreeTooHigh', 'tooManyTerms']).toContain(simplifyExpression('(x+1)^4 (x+1)^3').error.code);
  });
});

describe('astLatex — la saisie telle qu’écrite', () => {
  it('rétablit les parenthèses exigées par la structure', () => {
    const latex = (s) => astToLatex(parsePolynomialSource(s).ast);
    expect(latex('2(x+3) - 4x')).toBe('2\\left(x + 3\\right) - 4x');
    expect(latex('(2a - b) - (a + 3b)')).toBe('2a - b - \\left(a + 3b\\right)');
    expect(latex('(x+1)^2')).toBe('\\left(x + 1\\right)^{2}');
    expect(latex('x/2 + x/3')).toBe('\\frac{x}{2} + \\frac{x}{3}');
    expect(latex('x \\cdot (-3)')).toBe('x \\times \\left(-3\\right)');
    expect(latex('2.5x')).toBe('2{,}5x');
  });
});

describe('simplifyExpression — le pas à pas', () => {
  it('3x + 2x − 5 : regroupe les termes semblables', () => {
    const result = simplifyExpression('3x + 2x - 5');
    expect(kinds(result)).toEqual(['original', 'group', 'result']);
    expect(result.resultLatex).toBe('5x - 5');
    expect(result.steps[1].rules).toEqual(['groupLikeTerms']);
  });

  it('2(x + 3) − 4x : distributivité posée, puis calculée', () => {
    const result = simplifyExpression('2(x+3) - 4x');
    expect(result.steps[1]).toMatchObject({ kind: 'expand', latex: '2 \\times x + 2 \\times 3 - 4x', rules: ['distributive'] });
    expect(result.steps[2]).toMatchObject({ kind: 'compute', latex: '2x + 6 - 4x' });
    expect(result.resultLatex).toBe('-2x + 6');
  });

  it('(x + 2)(x − 3) : double distributivité, produits non simplifiés, familles colorées', () => {
    const result = simplifyExpression('(x+2)(x-3)');
    expect(result.steps[1].latex).toBe('x \\times x + x \\times \\left(-3\\right) + 2 \\times x + 2 \\times \\left(-3\\right)');
    expect(result.steps[1].rules).toContain('doubleDistributive');
    expect(result.steps[2].latex).toBe('x^{2} - 3x + 2x - 6');
    expect(result.steps[3].kind).toBe('group');
    expect(result.steps[3].latex).toContain('\\left(-3x + 2x\\right)');
    expect(result.steps[3].latex).toContain('\\textcolor{');
    expect(result.resultLatex).toBe('x^{2} - x - 6');
  });

  it('(2a − b) − (a + 3b) : le signe − devant la parenthèse', () => {
    const result = simplifyExpression('(2a - b) - (a + 3b)');
    expect(result.steps[1]).toMatchObject({ latex: '2a - b - a - 3b', rules: ['minusBracket'] });
    expect(result.resultLatex).toBe('a - 4b');
  });

  it('reconnaît les identités remarquables', () => {
    expect(simplifyExpression('(x+1)^2').steps[1]).toMatchObject({ latex: 'x^{2} + 2 \\times x \\times 1 + 1^{2}', rules: ['squareSum'] });
    expect(simplifyExpression('(x-3)^2').steps[1]).toMatchObject({ latex: 'x^{2} - 2 \\times x \\times 3 + 3^{2}', rules: ['squareDiff'] });
    expect(simplifyExpression('(2x+1)(2x-1)').steps[1].rules).toContain('diffSquares');
    expect(simplifyExpression('(2x+1)(2x-1)').resultLatex).toBe('4x^{2} - 1');
    expect(simplifyExpression('(x+y)^2').resultLatex).toBe('x^{2} + 2xy + y^{2}');
  });

  it('développe par passes : l’identité AVANT la distribution par 2', () => {
    const result = simplifyExpression('2(x+1)^2');
    expect(result.steps[1].rules).toEqual(['squareSum']);
    expect(result.steps[3].rules).toEqual(['distributive']);
    expect(result.resultLatex).toBe('2x^{2} + 4x + 2');
  });

  it('3(x − 2) − 2(x + 1) + 5 et les fractions', () => {
    expect(simplifyExpression('3(x-2) - 2(x+1) + 5').resultLatex).toBe('x - 3');
    expect(simplifyExpression('x/2 + x/3').resultLatex).toBe('\\frac{5}{6}x');
    expect(simplifyExpression('(4x+6)/2').steps[1].rules).toEqual(['divideConstant']);
    expect(simplifyExpression('(4x+6)/2').resultLatex).toBe('2x + 3');
    expect(simplifyExpression('(x+1)^3').resultLatex).toBe('x^{3} + 3x^{2} + 3x + 1');
  });

  it('une expression déjà simple ne change que d’ordre', () => {
    expect(kinds(simplifyExpression('5 + 3x'))).toEqual(['original', 'result']);
    expect(last(simplifyExpression('5 + 3x')).rules).toEqual(['order']);
    expect(kinds(simplifyExpression('x^2 - x'))).toEqual(['original']);
  });

  it('refuse avec un code, jamais une exception', () => {
    expect(simplifyExpression('').error.code).toBe('empty');
    expect(simplifyExpression('sin(x)').error.code).toBe('function');
    expect(simplifyExpression('pi x').error.code).toBe('irrational');
    expect(simplifyExpression('x^{1/2}').error.code).toBe('badExponent');
    expect(simplifyExpression('x/(3-3)').error.code).toBe('divideByZero');
    expect(simplifyExpression('x/(x+1) + 1').error.code).toBe('fractionNested');
    expect(simplifyExpression('2x = 4').error.code).toBe('hasRelation');
    expect(simplifyExpression('2x +').ok).toBe(false);
    expect(simplifyExpression('x'.repeat(250)).error.code).toBe('tooLong');
    expect(simplifyExpression('999999999999x \\cdot 999999999999x').ok).toBe(false);
  });

  it('sur 300 expressions tirées au hasard, le résultat VAUT l’expression', () => {
    let seed = 7;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const pick = (list) => list[Math.floor(random() * list.length)];
    const int = () => Math.floor(random() * 11) - 5;
    const atom = () => pick([`${int()}x`, `${int()}`, `x`, `${int()}y`, `(x ${pick(['+', '-'])} ${Math.abs(int())})`]);
    for (let i = 0; i < 300; i += 1) {
      const source = `${int()}(${atom()} + ${atom()}) ${pick(['+', '-'])} (${atom()})(${atom()}) ${pick(['+', '-'])} ${atom()}^2`;
      const result = simplifyExpression(source);
      expect(result.ok, source).toBe(true);
      const ast = parsePolynomialSource(source).ast;
      for (const scope of [{ x: 1.5, y: -2 }, { x: -3, y: 0.5 }]) {
        expect(evalPoly(result.poly, scope)).toBeCloseTo(evalAst(ast, scope), 6);
      }
      expect(polyEquals(result.poly, astToPoly(ast))).toBe(true);
    }
  });
});

describe('fractions algébriques (à la racine, une lettre)', () => {
  it('(x² − 1)/(x − 1) = x + 1 avec x ≠ 1', () => {
    const result = simplifyExpression('(x^2-1)/(x-1)');
    expect(result).toMatchObject({ ok: true, kind: 'fraction', irreducible: false, resultLatex: 'x + 1' });
    expect(result.restriction).toMatchObject({ latex: 'x \\neq 1', complete: true });
    expect(result.steps.map((s) => s.rules[0])).toEqual([undefined, 'commonFactorFraction', 'cancel']);
  });

  it('un kasr sans facteur commun est dit irréductible', () => {
    const result = simplifyExpression('(x^2+1)/(x-1)');
    expect(result.irreducible).toBe(true);
    expect(result.restriction.latex).toBe('x \\neq 1');
  });

  it('(x² − 4)/(2x + 4) = ½x − 1, x ≠ −2 ; plusieurs lettres refusées', () => {
    expect(simplifyExpression('\\frac{x^2-4}{2x+4}').resultLatex).toBe('\\frac{1}{2}x - 1');
    expect(simplifyExpression('\\frac{x^2-4}{2x+4}').restriction.latex).toBe('x \\neq -2');
    expect(simplifyExpression('(x+y)/(x-1)').error.code).toBe('fractionMultivariate');
  });

  it('les racines rationnelles d’un polynôme', () => {
    expect(rationalRoots([r(6), r(-5), r(1)])).toEqual([r(2), r(3)]);
    expect(rationalRoots([r(-1), r(0), r(4)])).toEqual([r(-1, 2), r(1, 2)]);
    expect(rationalRoots([r(0), r(-2), r(1)])).toEqual([r(0), r(2)]);
    expect(rationalRoots([r(-2), r(0), r(1)])).toEqual([]);
  });
});
