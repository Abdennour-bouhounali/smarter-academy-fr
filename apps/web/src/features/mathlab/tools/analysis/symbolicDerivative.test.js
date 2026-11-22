import { describe, it, expect } from 'vitest';
import { parseExpression } from '../functionGrapher/expressionParser.js';
import { compileExpression } from '../functionGrapher/expressionEvaluator.js';
import { derivativeAt } from '../functionGrapher/numericalDerivative.js';
import { differentiate, differentiateN, dependsOn } from './symbolicDerivative.js';
import { printExpression, printLatex } from './expressionPrinter.js';

const ast = (source) => {
  const parsed = parseExpression(source);
  if (!parsed.ok) throw new Error(`expression non analysable : ${source}`);

  return parsed.ast;
};
const derive = (source) => differentiate(ast(source));
const text = (source) => printExpression(derive(source));

describe('dérivée symbolique — les règles', () => {
  it.each([
    ['x^2', '2x'],
    ['x^3', '3x^2'],
    ['2x+1', '2'],
    ['5', '0'],
    ['x', '1'],
    ['x^2-4x+3', '2x - 4'],
    ['3x^4-2x^2+7', '12x^3 - 4x'],
    ['\\sin(x)', 'cos(x)'],
    ['\\cos(x)', '-sin(x)'],
    ['e^x', 'e^x'],
    ['\\ln(x)', '1 / x'],
    ['x^{10}', '10x^9'],
  ])('(%s)′ = %s', (source, expected) => {
    expect(text(source)).toBe(expected);
  });

  /**
   * LE contresens que la QA a attrapé : `3·(4·x³)` imprimé `34x^3`, que
   * l'élève lit « trente-quatre ». Les constantes se REPLIENT.
   */
  it('replie les constantes — jamais « 34x^3 » pour 12x³', () => {
    expect(text('3x^4')).toBe('12x^3');
    expect(text('5x^3')).toBe('15x^2');
    expect(printExpression(differentiateN(ast('x^3'), 2))).toBe('6x');
    expect(printExpression(differentiateN(ast('x^4'), 2))).toBe('12x^2');
  });

  /** Une puissance de puissance ne s'imprime jamais `x^2^2` : c'est ambigu. */
  it('n’imprime pas d’exposant ambigu', () => {
    for (const source of ['\\frac{1}{x^2}', '\\frac{1}{x^3}', '\\frac{1}{x^2+1}']) {
      expect(text(source)).not.toMatch(/\^\d+\^/);
    }
  });

  it('refuse honnêtement ce qu’elle ne sait pas écrire', () => {
    // Exposant variable des DEUX côtés : la dérivée logarithmique sort du
    // sous-ensemble. On rend null, l'instrument mesure numériquement.
    expect(differentiate(ast('x^x'))).toBeNull();
    // Une base négative constante : ln a n'existe pas.
    expect(differentiate(ast('(0-2)^x'))).toBeNull();
  });

  it('connaît les constantes et la variable', () => {
    expect(dependsOn(ast('2x+1'))).toBe(true);
    expect(dependsOn(ast('2\\pi'))).toBe(false);
    expect(text('\\pi')).toBe('0');
  });
});

/**
 * L'épreuve DÉCISIVE : la dérivée symbolique est confrontée à la dérivée
 * NUMÉRIQUE du grapheur, qui est écrite, testée et utilisée depuis
 * longtemps par le mode « المماس ». Deux implémentations indépendantes qui
 * s'accordent à 1e−6 près sur des dizaines de points : c'est ce qui permet
 * d'AFFICHER f′(x) à un élève.
 */
describe('la dérivée symbolique s’accorde avec la dérivée mesurée', () => {
  const SOURCES = [
    'x^2', 'x^3-3x', '2x+1', '\\sin(x)', '\\cos(x)', '\\frac{1}{x}', '\\sqrt{x}',
    'x^2-4x+3', '\\ln(x)', 'e^x', '\\tan(x)', 'x\\sin(x)', '\\frac{x}{x^2+1}',
    '\\sqrt{x^2+1}', '\\frac{1}{x^2}', '3x^4-2x^2+7', '\\sin(2x)', '\\cos(x^2)',
    '\\exp(2x)', '\\log(x)', 'x^{10}', '\\left|x\\right|',
  ];
  const XS = [-2.3, -1.1, -0.4, 0.35, 0.7, 1.4, 2.6, 3.3];

  it.each(SOURCES)('%s', (source) => {
    const tree = ast(source);
    const symbolic = differentiate(tree);
    expect(symbolic, `${source} devrait être dérivable symboliquement`).not.toBeNull();
    const f = compileExpression(tree);
    const df = compileExpression(symbolic);

    for (const x of XS) {
      const measured = derivativeAt(f, x);
      if (!measured.ok) continue;            // hors domaine, angle : la mesure refuse, on ne compare pas
      const value = df(x);
      if (!Number.isFinite(value)) continue; // idem côté symbolique
      const error = Math.abs(value - measured.value) / (1 + Math.abs(measured.value));
      expect(error, `${source} en x = ${x}`).toBeLessThan(1e-6);
    }
  });
});

describe('l’imprimeur', () => {
  it('écrit le LaTeX que MathLive et KaTeX attendent', () => {
    expect(printLatex(derive('\\frac{1}{x}'))).toBe('\\frac{-1}{x^{2}}');
    expect(printLatex(derive('\\sqrt{x}'))).toBe('\\frac{1}{2\\sqrt{x}}');
    expect(printLatex(derive('\\sin(x)'))).toBe('\\cos\\left(x\\right)');
  });

  it('ne parenthèse que ce qui en a besoin', () => {
    expect(printExpression(ast('2x+1'))).toBe('2x + 1');
    expect(printExpression(ast('(x+1)(x-2)'))).toBe('(x + 1)(x - 2)');
    // a − (b − c) garde ses parenthèses ; a − b + c n'en prend pas.
    expect(printExpression(ast('x-(x-1)'))).toBe('x - (x - 1)');
  });

  /**
   * Deux écritures ACCOLÉES dont la juxtaposition se relit comme un seul
   * nombre sont un contresens, pas une inélégance : `34x^3` se lit
   * trente-quatre. Le point de multiplication revient dans ce cas.
   */
  it('n’accole jamais deux nombres', () => {
    expect(text('3x^4')).toBe('12x^3');
    expect(text('\\cos(x^2)')).toBe('-sin(x^2)·2x');
    // Un chiffre immédiatement suivi d'un chiffre séparé par rien : interdit.
    for (const source of ['3x^4', '5x^3', 'x^4-2x^2', '\\cos(x^2)', '\\sin(3x)']) {
      expect(text(source), source).not.toMatch(/\d\s+\d/);
    }
  });
});
