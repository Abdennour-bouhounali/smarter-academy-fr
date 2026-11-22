import { describe, it, expect } from 'vitest';
import { evaluateStepByStep, parseExpression, randomExpression, ORDER_EXAMPLES } from './orderOfOperations.js';

const plain = (latex) => latex.replace(/\\textcolor\{#F36D21\}\{((?:[^{}]|\{[^{}]*\})*)\}/g, '$1');
const trace = (source) => {
  const run = evaluateStepByStep(source);

  return { run, lines: run.steps.map((s) => plain(s.latex)), rules: run.steps.map((s) => (s.inGroup ? `(${s.rule})` : s.rule)) };
};

describe('أولويات العمليات — les déroulés exacts', () => {
  it('3 + 4 × 5 = 23', () => {
    const { run, lines, rules } = trace('3 + 4 × 5');
    expect(lines).toEqual(['3 + 20', '23']);
    expect(rules).toEqual(['multiplyDivide', 'addSubtract']);
    expect(run.result.latex).toBe('23');
  });

  it('(3 + 4) × 5 = 35 — les parenthèses d’abord', () => {
    const { lines, rules } = trace('(3 + 4) × 5');
    expect(lines).toEqual(['7 \\times 5', '35']);
    expect(rules).toEqual(['(addSubtract)', 'multiplyDivide']);
  });

  it('20 − 12 ÷ 4 × 2 = 14 — de GAUCHE à droite', () => {
    const { run, lines } = trace('20 - 12 ÷ 4 × 2');
    expect(lines).toEqual(['20 - 3 \\times 2', '20 - 6', '14']);
    expect(run.result.latex).toBe('14');
  });

  it('2 × (3 + 4)^2 − 10 = 88', () => {
    const { lines, rules } = trace('2 × (3 + 4)^2 − 10');
    expect(lines).toEqual(['2 \\times 7^{2} - 10', '2 \\times 49 - 10', '98 - 10', '88']);
    expect(rules).toEqual(['(addSubtract)', 'power', 'multiplyDivide', 'addSubtract']);
  });

  it('3/4 + 1/2 × 3 = 9/4 — fractions exactes, et sa valeur décimale', () => {
    const { run, lines } = trace('3/4 + 1/2 × 3');
    expect(lines).toEqual(['\\frac{3}{4} + \\frac{3}{2}', '\\frac{9}{4}']);
    expect(run.result).toMatchObject({ fraction: '9/4', decimal: { text: '2,25', exact: true }, isInteger: false });
  });

  it('crochets et parenthèses emboîtés : l’intérieur d’abord', () => {
    const { run, lines } = trace('[12 − (2 + 4) × 1,5] ÷ 3');
    expect(lines).toEqual([
      '\\left[12 - 6 \\times 1{,}5\\right] \\div 3',
      '\\left[12 - 9\\right] \\div 3',
      '3 \\div 3',
      '1',
    ]);
    expect(run.result.latex).toBe('1');
  });

  it('moins unaire : −3² = −9 mais (−3)² = 9', () => {
    expect(evaluateStepByStep('-3^2').result.latex).toBe('-9');
    expect(evaluateStepByStep('(-3)^2').result.latex).toBe('9');
    expect(evaluateStepByStep('5 − 3^2 + (−2)^2').result.latex).toBe('0');
    expect(evaluateStepByStep('2 × -3').result.latex).toBe('-6');
  });

  it('un négatif au milieu est écrit entre parenthèses', () => {
    const { lines } = trace('1 + (2 − 5) × 2');
    expect(lines[0]).toBe('1 + \\left(-3\\right) \\times 2');
  });

  it('², ³, *, /, :, multiplication implicite, chiffres arabes', () => {
    expect(evaluateStepByStep('3² + 2³').result.latex).toBe('17');
    expect(evaluateStepByStep('6 * 7 : 2').result.latex).toBe('21');
    expect(evaluateStepByStep('2(3 + 4)').result.latex).toBe('14');
    expect(evaluateStepByStep('٣ + ٤').result.latex).toBe('7');
    expect(evaluateStepByStep('2^3^2').result.latex).toBe('512');
    expect(evaluateStepByStep('2^3/4').result.latex).toBe('2');
  });

  it('EXACT : 0,1 + 0,2 = 0,3 et 1/3 + 1/3 + 1/3 = 1', () => {
    expect(evaluateStepByStep('0,1 + 0,2').result.decimal).toEqual({ text: '0,3', exact: true });
    expect(evaluateStepByStep('1/3 + 1/3 + 1/3').result.latex).toBe('1');
    expect(evaluateStepByStep('1 ÷ 3').result).toMatchObject({ fraction: '1/3', decimal: { exact: false } });
    expect(evaluateStepByStep('2^-2').result.latex).toBe('\\frac{1}{4}');
  });

  it('le nombre qui vient d’être calculé est surligné en orange', () => {
    expect(evaluateStepByStep('3 + 4 × 5').steps[0].latex).toBe('3 + \\textcolor{#F36D21}{20}');
    expect(evaluateStepByStep('3 + 4 × 5').steps[0].operationLatex).toBe('4 \\times 5 = 20');
  });
});

describe('les erreurs disent OÙ', () => {
  it('division par zéro : les pas faits restent', () => {
    const run = evaluateStepByStep('5 ÷ (2 − 2)');
    expect(run.ok).toBe(false);
    expect(run.error).toEqual({ code: 'divisionByZero', pos: 2 });
    expect(run.steps).toHaveLength(1);
    expect(evaluateStepByStep('3/0').error).toEqual({ code: 'zeroDenominator', pos: 2 });
  });

  it.each([
    ['', 'empty', 0],
    ['3 + ', 'unexpectedEnd', 4],
    ['(3 + 4', 'missingClose', 0],
    ['3 + 4)', 'unexpectedClose', 5],
    ['[3 + 4)', 'mismatchedBracket', 6],
    ['3 + () ', 'emptyGroup', 5],
    ['3 # 4', 'unexpectedChar', 2],
    ['3 × × 4', 'unexpectedToken', 4],
    ['0^0', 'zeroPowerZero', 1],
    ['2^(1/2)', 'nonIntegerExponent', 1],
    ['2^99', 'exponentTooLarge', 1],
  ])('%s → %s @ %i', (source, code, pos) => {
    const run = evaluateStepByStep(source);
    expect(run.ok).toBe(false);
    expect(run.error).toMatchObject({ code, pos });
  });

  it('trop long, trop d’opérations', () => {
    expect(parseExpression('1+'.repeat(70)).error.code).toBe('tooLong');
    expect(parseExpression(Array.from({ length: 45 }, () => '1').join('+')).error.code).toBe('tooManyOperations');
  });

  it('jamais Infinity, NaN ni e+ dans un résultat', () => {
    const run = evaluateStepByStep('10^20 × 10^20');
    expect(JSON.stringify(run, (k, v) => (typeof v === 'bigint' ? v.toString() : v))).not.toMatch(/Infinity|NaN|e\+/);
    expect(run.result.fraction).toBe(`1${'0'.repeat(40)}`);
  });
});

describe('les exemples', () => {
  it('chaque exemple et chaque tirage se calcule sans erreur', () => {
    for (const e of ORDER_EXAMPLES) expect(evaluateStepByStep(e.expression).ok, e.expression).toBe(true);
    for (let i = 0; i < 60; i += 1) {
      const source = randomExpression();
      expect(evaluateStepByStep(source).ok, source).toBe(true);
    }
  });
});
