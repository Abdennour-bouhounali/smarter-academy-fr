import { describe, it, expect } from 'vitest';
import * as R from './rational.js';
import { parseEquation, applyOperation, classify, equationToText } from './equation.js';
import { operationLatex, solutionSet, equationExpansion, ACCENT } from './equationDisplay.js';
import { generateEquation, generateInequality, LEVELS } from './generator.js';

const parse = (s) => parseEquation(s).equation;
const op = (kind, n, d = 1) => ({ kind, value: R.makeRational(n, d) });
const c = (latex) => `\\textcolor{${ACCENT}}{${latex}}`;

describe('operationLatex — l’opération posée aux deux membres', () => {
  it('+ et − : en orange, à la suite de chaque membre', () => {
    expect(operationLatex(parse('2x + 4 = 16'), op('subtract', 4))).toBe(`2x + 4 ${c('{} - 4')} = 16 ${c('{} - 4')}`);
    expect(operationLatex(parse('x - 3 = 2'), op('add', -1))).toBe(`x - 3 ${c('{} + \\left(-1\\right)')} = 2 ${c('{} + \\left(-1\\right)')}`);
  });

  it('× : parenthèses autour d’une somme ; ÷ : en fraction', () => {
    expect(operationLatex(parse('2x + 4 = 16'), op('multiply', 3))).toBe(`${c('3')} \\times \\left(2x + 4\\right) = ${c('3')} \\times 16`);
    expect(operationLatex(parse('2x + 4 = 16'), op('divide', 2))).toBe(`\\frac{2x + 4}{${c('2')}} = \\frac{16}{${c('2')}}`);
    expect(operationLatex(parse('2x = 8'), op('multiply', -1, 2))).toBe(`${c('\\left(-\\frac{1}{2}\\right)')} \\times 2x = ${c('\\left(-\\frac{1}{2}\\right)')} \\times 8`);
  });

  it('le sens retourné est DÉJÀ écrit sur la ligne intermédiaire', () => {
    const start = parse('-2x > 6');
    const result = applyOperation(start, op('divide', -2));
    expect(result.flipped).toBe(true);
    expect(operationLatex(start, op('divide', -2), true)).toBe(`\\frac{-2x}{${c('-2')}} ${c('<')} \\frac{6}{${c('-2')}}`);
  });
});

describe('solutionSet — l’ensemble des solutions en intervalle', () => {
  it('les quatre sens, à la convention des crochets du manuel', () => {
    const set = (s) => solutionSet(classify(parse(s)));
    expect(set('x < -3')).toMatchObject({ latex: '\\left]-\\infty\\,;\\,-3\\right[', words: 'less', value: '-3' });
    expect(set('x <= 2')).toMatchObject({ latex: '\\left]-\\infty\\,;\\,2\\right]', words: 'lessEq' });
    expect(set('x > 1/2')).toMatchObject({ latex: '\\left]\\frac{1}{2}\\,;\\,+\\infty\\right[', words: 'greater' });
    expect(set('x >= 0')).toMatchObject({ latex: '\\left[0\\,;\\,+\\infty\\right[', words: 'greaterEq' });
    expect(set('-2x > 6')).toMatchObject({ words: 'less', value: '-3' });
    expect(set('2x < 2x + 1')).toMatchObject({ latex: '\\mathbb{R}', words: 'all' });
    expect(set('2x > 2x + 1')).toMatchObject({ latex: '\\emptyset', words: 'none' });
  });
});

describe('equationExpansion — « نشر وتبسيط كل طرف »', () => {
  it('montre le développement quand la saisie en a besoin', () => {
    const exp = equationExpansion('3(x + 2) = 2x - 1');
    expect(exp.left.resultLatex).toBe('3x + 6');
    expect(exp.right).toBeNull();
    expect(equationExpansion('x/2 + x/3 = 5').left.resultLatex).toBe('\\frac{5}{6}x');
    expect(equationExpansion('2(x-1) - (x+3) = 4').left.resultLatex).toBe('x - 5');
  });

  it('se tait quand il n’y a rien à montrer', () => {
    expect(equationExpansion('2x + 3 = 11')).toBeNull();
    expect(equationExpansion('x/3 = 5')).toBeNull();
    expect(equationExpansion('pas une équation')).toBeNull();
  });
});

describe('generator — les nouveaux niveaux', () => {
  it('niveaux 5 et 6 : une SAISIE à parenthèses ou fractions, solution entière exacte', () => {
    expect(LEVELS).toEqual([1, 2, 3, 4, 5, 6]);
    for (const level of [5, 6]) {
      for (let i = 0; i < 300; i += 1) {
        const out = generateEquation({ level });
        expect(out.source).toMatch(level === 5 ? /\(x [+-] \d+\)/ : /x\/\d/);
        expect(parse(out.source)).toEqual(out.equation);
        const verdict = classify(out.equation);
        expect(verdict.solution).toEqual(R.makeRational(out.solution));
        expect(Math.abs(out.solution)).toBeLessThanOrEqual(10);
        expect(equationExpansion(out.source), out.source).not.toBeNull();
      }
    }
  });

  it('generateInequality : un vrai sens d’inégalité, et un sens qui se retourne parfois', () => {
    let flips = 0;
    for (let i = 0; i < 200; i += 1) {
      const out = generateInequality({ level: 2 });
      expect(['<', '>', '<=', '>=']).toContain(out.equation.relation);
      if (R.isNegative(out.equation.left.a)) flips += 1;
      expect(equationToText(out.equation)).toBeTruthy();
    }
    expect(flips).toBeGreaterThan(20);
  });
});
