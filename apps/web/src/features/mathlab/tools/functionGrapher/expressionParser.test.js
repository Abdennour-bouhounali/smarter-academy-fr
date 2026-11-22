import { describe, it, expect } from 'vitest';
import { parseExpression } from './expressionParser.js';
import { compileExpression, compileSource } from './expressionEvaluator.js';

const fn = (source) => {
  const parsed = parseExpression(source);
  if (!parsed.ok) throw new Error(`${source} → ${parsed.error.code}`);

  return compileExpression(parsed.ast);
};

describe('analyse et évaluation — le sous-ensemble documenté', () => {
  it.each([
    ['x', 3, 3],
    ['2x + 3', 2, 7],
    ['2x+3', -1, 1],
    ['x^2', 3, 9],
    ['x^{2}', 3, 9],
    ['x²', 4, 16],
    ['x^2 - 4x + 3', 1, 0],
    ['x^2-4x+3', 3, 0],
    ['-x^2', 2, -4],
    ['x^-1', 2, 0.5],
    ['2^x', 3, 8],
    ['x^2x', 2, 8],
    ['1/x', 4, 0.25],
    ['\\frac{1}{x}', 4, 0.25],
    ['\\frac{x^2}{2}', 4, 8],
    ['1/2x', 4, 2],
    ['sqrt(x)', 9, 3],
    ['\\sqrt{x}', 16, 4],
    ['√x', 25, 5],
    ['\\sqrt[3]{x}', -8, -2],
    ['|x|', -3, 3],
    ['\\left|x\\right|', -3, 3],
    ['\\lvert x\\rvert', -2, 2],
    ['abs(x)', -7, 7],
    ['sin(x)', 0, 0],
    ['\\sin\\left(x\\right)', Math.PI / 2, 1],
    ['\\sin x', Math.PI / 2, 1],
    ['\\sin 2x', Math.PI / 4, 1],
    ['\\cos x', 0, 1],
    ['cos(x)', Math.PI, -1],
    ['tan(x)', 0, 0],
    ['exp(x)', 0, 1],
    ['e^x', 1, Math.E],
    ['\\exponentialE^{x}', 0, 1],
    ['ln(x)', Math.E, 1],
    ['\\ln x', 1, 0],
    ['log(x)', 100, 2],
    ['\\pi x', 1, Math.PI],
    ['2\\pi', 0, 2 * Math.PI],
    ['πx', 2, 2 * Math.PI],
    ['3(x+1)', 1, 6],
    ['(x+1)(x-2)', 3, 4],
    ['x\\cdot x', 3, 9],
    ['x\\times 2', 3, 6],
    ['x \\div 2', 3, 1.5],
    ['2,5x', 2, 5],
    ['2.5x', 2, 5],
    ['x\\,+\\,1', 1, 2],
    ['\\mleft(x+1\\mright)^2', 1, 4],
    ['xsin(x)', Math.PI / 2, Math.PI / 2],
    ['\\sin x\\cos x', 0, 0],
    ['\\mathrm{e}^x', 0, 1],
    ['\\operatorname{abs}(x)', -1, 1],
    ['+x', 2, 2],
    ['--x', 2, 2],
    ['{x}+1', 1, 2],
    ['x^{-1}', 4, 0.25],
    ['-2^2', 0, -4],
    ['(-2)^2', 0, 4],
  ])('%s en x = %s vaut %s', (source, x, expected) => {
    expect(fn(source)(x)).toBeCloseTo(expected, 10);
  });

  it('rend des valeurs non finies hors du domaine, jamais une exception', () => {
    expect(fn('1/x')(0)).toBeNaN();
    expect(fn('sqrt(x)')(-1)).toBeNaN();
    expect(Number.isFinite(fn('ln(x)')(0))).toBe(false);
    expect(fn('ln(x)')(-1)).toBeNaN();
    expect(fn('\\sqrt[2]{x}')(-4)).toBeNaN();
    expect(fn('x^{0.5}')(-4)).toBeNaN();
  });

  it('lit un paramètre déclaré dans la portée, sans recompiler', () => {
    const parsed = parseExpression('ax+b', { variables: ['x', 'a', 'b'] });
    expect(parsed.ok).toBe(true);
    const compiled = compileExpression(parsed.ast);
    expect(compiled(2, { a: 3, b: 1 })).toBe(7);
    expect(compiled(2, { a: -1, b: 0 })).toBe(-2);
    expect(compiled(2, {})).toBeNaN();
  });
});

describe('erreurs — jamais un plantage, toujours un code', () => {
  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['x^', 'syntax'],
    ['x+', 'syntax'],
    ['(x+1', 'syntax'],
    ['x+1)', 'syntax'],
    ['2 3', 'syntax'],
    ['\\frac{1}', 'syntax'],
    ['|x', 'syntax'],
    ['unknown', 'unknownSymbol'],
    ['y', 'unknownSymbol'],
    ['x + a', 'unknownSymbol'],
    ['\\foo{x}', 'unknownSymbol'],
    ['x $', 'unknownSymbol'],
    ['\\placeholder{}', 'incomplete'],
    ['\\frac{\\placeholder{}}{x}', 'incomplete'],
  ])('« %s » → %s', (source, code) => {
    const parsed = parseExpression(source);
    expect(parsed.ok).toBe(false);
    expect(parsed.error.code).toBe(code);
    expect(typeof parsed.error.position).toBe('number');
  });

  it('nomme le symbole inconnu', () => {
    expect(parseExpression('2y').error.symbol).toBe('y');
    expect(parseExpression('\\alpha').error.symbol).toBe('\\alpha');
  });

  it('compileSource rend la fonction ou l’erreur', () => {
    expect(compileSource('x^2').fn(3)).toBe(9);
    expect(compileSource('x^').ok).toBe(false);
  });
});

/**
 * MathLive n'écrit pas toujours les accolades : dès qu'un argument tient en
 * UN caractère, il produit la forme courte de LaTeX. `\frac12` est une demie,
 * et un élève qui tape ½ au clavier virtuel envoie exactement cela. La QA
 * navigateur du مختبر التحليل l'a trouvé : la bonne réponse était rejetée.
 */
describe('la forme courte de \\frac (sans accolades)', () => {
  const value = (source, x = 2) => {
    const compiled = compileSource(source);
    expect(compiled.ok, source).toBe(true);

    return compiled.fn(x);
  };

  it('lit \\frac12 comme une demie', () => {
    expect(value('\\frac12')).toBeCloseTo(0.5, 12);
    expect(value('\\frac34')).toBeCloseTo(0.75, 12);
    expect(value('\\frac11')).toBeCloseTo(1, 12);
  });

  it('lit \\frac1x et \\frac x2', () => {
    expect(value('\\frac1x', 4)).toBeCloseTo(0.25, 12);
    expect(value('\\frac x2', 6)).toBeCloseTo(3, 12);
  });

  /** Les accolades gardent EXACTEMENT leur sens : rien n'a changé pour elles. */
  it('ne touche pas à la forme avec accolades', () => {
    expect(value('\\frac{12}{5}')).toBeCloseTo(2.4, 12);
    expect(value('\\frac{1}{2}')).toBeCloseTo(0.5, 12);
    expect(value('\\frac{x^2-1}{x-1}', 2)).toBeCloseTo(3, 12);
    expect(value('\\frac{10}{4}')).toBeCloseTo(2.5, 12);
  });
});
