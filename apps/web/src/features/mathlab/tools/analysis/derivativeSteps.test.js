import { describe, it, expect } from 'vitest';
import { buildDerivativeSteps, ruleOf, RULE_FORMULAS } from './derivativeSteps.js';
import { compileFunction } from './buildScene.js';
import { printLatex } from './expressionPrinter.js';
import { differentiate } from './symbolicDerivative.js';
import { parseExpression } from '../functionGrapher/expressionParser.js';

const kinds = (result) => result.steps.map((step) => step.kind);
const SOURCES = [
  'x^3-3x+2', 'x^2-4x+3', '-x^2+3', 'x\\sin(x)', '\\frac{1}{x}', '\\frac{x^2-1}{x-1}', '(2x+1)^3',
  'e^{2x}', 'e^x', '\\sin(x^2)', '\\sqrt{x}', '\\sqrt{x^2+1}', '3x^4', '5', 'x', '2^x', '\\ln(x)',
  '\\cos(3x)', 'ax^2+bx+c', '|x|', '\\sqrt[3]{x}', 'x^{-2}', '\\tan(2x)',
];

describe('la dérivation pas à pas', () => {
  it('x³ − 3x + 2 : la somme, un pas par terme (règle nommée), l’assemblage, puis le résultat', () => {
    const result = buildDerivativeSteps('x^3-3x+2');
    expect(result.ok).toBe(true);
    expect(kinds(result)).toEqual(['split', 'term', 'term', 'term', 'assemble', 'result']);
    expect(result.steps[0].latex).toBe("f'(x) = \\left(x^{3}\\right)' - \\left(3x\\right)' + \\left(2\\right)'");
    expect(result.steps.slice(1, 4).map((step) => step.ruleKey)).toEqual(['power', 'constantFactor', 'constant']);
    expect(result.steps[1].latex).toBe("\\left(x^{3}\\right)' = 3x^{2}");
    expect(result.steps[4].latex).toBe("f'(x) = 3x^{2} - 3 + 0");
    expect(result.steps.at(-1)).toMatchObject({ kind: 'result', tone: 'result', source: '3x^2 - 3' });
  });

  it('le DERNIER pas est exactement la dérivée que l’inspecteur montrait, et le premier ne l’est jamais', () => {
    for (const source of SOURCES) {
      const result = buildDerivativeSteps(source);
      expect(result.ok, source).toBe(true);
      const shown = compileFunction(source).derivativeSource;
      expect(result.derivativeSource, source).toBe(shown);
      const last = result.steps.at(-1);
      expect(last.kind, source).toBe('result');
      expect(last.source, source).toBe(shown);
      expect(result.steps.length, source).toBeGreaterThanOrEqual(2);
      expect(result.steps[0].latex, source).not.toBe(last.latex);
      // Un seul pas porte le ton « résultat », et c'est le dernier.
      expect(result.steps.filter((step) => step.tone === 'result'), source).toHaveLength(1);
    }
  });

  it('le résultat est imprimé depuis l’AST de la dérivée (LaTeX de printLatex)', () => {
    const ast = parseExpression('x^2-4x+3', { variables: ['x', 'a', 'b', 'c'] }).ast;
    expect(buildDerivativeSteps('x^2-4x+3').steps.at(-1).latex).toBe(`f'(x) = ${printLatex(differentiate(ast))}`);
    expect(buildDerivativeSteps('x^2-4x+3').derivativeSource).toBe('2x - 4');
  });

  it('produit, quotient, chaîne : on nomme u (et v), on les dérive, on remplit la règle, puis on simplifie', () => {
    expect(kinds(buildDerivativeSteps('x\\sin(x)'))).toEqual(['identify', 'parts', 'substitute', 'result']);
    const product = buildDerivativeSteps('x\\sin(x)');
    expect(product.steps[0]).toMatchObject({ ruleKey: 'product', formula: RULE_FORMULAS.product });
    expect(product.steps[2].latex).toBe("f'(x) = 1\\cdot \\sin\\left(x\\right) + x\\cdot \\cos\\left(x\\right)");

    const quotient = buildDerivativeSteps('\\frac{x^2-1}{x-1}');
    expect(quotient.steps[0].ruleKey).toBe('quotient');
    expect(quotient.steps[1].latex).toBe("u' = 2x,\\quad v' = 1");

    const chain = buildDerivativeSteps('(2x+1)^3');
    expect(chain.steps[0].ruleKey).toBe('chainPower');
    expect(chain.steps[2].latex).toBe("f'(x) = 3\\cdot \\left(2x + 1\\right)^{2}\\cdot 2");
    expect(chain.steps.at(-1).source).toBe('6(2x + 1)^2');
  });

  it('une fonction de référence en x : la règle appliquée, (xⁿ : l’exposant qui descend), le résultat', () => {
    expect(kinds(buildDerivativeSteps('x^5'))).toEqual(['apply', 'powerDown', 'result']);
    expect(kinds(buildDerivativeSteps('\\ln(x)'))).toEqual(['apply', 'result']);
    expect(kinds(buildDerivativeSteps('7'))).toEqual(['apply', 'result']);
    expect(buildDerivativeSteps('x^5').steps[1].latex).toBe("f'(x) = 5\\cdot x^{4}");
  });

  it('un état intermédiaire identique au résultat n’est pas montré deux fois', () => {
    const result = buildDerivativeSteps('\\sin(x^2)');
    const last = result.steps.at(-1).latex;
    expect(result.steps.slice(0, -1).some((step) => step.latex === last)).toBe(false);
  });

  it('refuse honnêtement ce que l’instrument ne sait pas écrire, ou ce qui ne se lit pas', () => {
    expect(buildDerivativeSteps('x^x')).toEqual({ ok: false, reason: 'unavailable' });
    expect(buildDerivativeSteps('')).toEqual({ ok: false, reason: 'empty' });
    expect(buildDerivativeSteps('x^^2').ok).toBe(false);
  });

  it('est déterministe : la même source rend les mêmes pas', () => {
    expect(buildDerivativeSteps('x^3-3x+2')).toEqual(buildDerivativeSteps('x^3-3x+2'));
  });

  it('chaque règle nommée a sa formule générale', () => {
    for (const source of SOURCES) {
      for (const step of buildDerivativeSteps(source).steps) {
        if (step.ruleKey) expect(RULE_FORMULAS[step.ruleKey], `${source} ${step.ruleKey}`).toBeTruthy();
      }
    }
    expect(ruleOf(parseExpression('x^x').ast)).toBeNull();
  });
});
