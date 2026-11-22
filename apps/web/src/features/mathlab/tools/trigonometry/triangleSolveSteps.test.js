import { describe, it, expect } from 'vitest';
import { buildTriangleSolveSteps, solveKey, latexNumber, GIVEN_FIELDS } from './triangleSolveSteps.js';
import { solveRightTriangle } from './trigMath.js';
import { formatLength, formatDegrees } from './trigFormat.js';

const shown = (latex) => latex.replace(/\{,\}/g, ',').replace(/-/g, '−');

describe('buildTriangleSolveSteps — « حلّ المثلث خطوة بخطوة »', () => {
  const cases = [
    ['angle-hyp', { angle: 35, hypotenuse: 10 }, 11],
    ['angle-opp', { angle: 30, opposite: 5 }, 11],
    ['angle-adj', { angle: 45, adjacent: 7 }, 11],
    ['opp-adj', { opposite: 3, adjacent: 4 }, 9],
    ['opp-hyp', { opposite: 3, hypotenuse: 5 }, 9],
    ['adj-hyp', { adjacent: 4, hypotenuse: 5 }, 9],
  ];

  it.each(cases)('%s : le nombre de pas, l’ordre, et le résultat en DERNIER', (given, values, count) => {
    const result = buildTriangleSolveSteps(given, values);
    expect(result.ok).toBe(true);
    expect(result.steps).toHaveLength(count);
    expect(result.steps[0].kind).toBe('data');
    expect(result.steps[0].tone).toBeUndefined();
    expect(result.steps.at(-2).kind).toBe('otherAngle');
    const last = result.steps.at(-1);
    expect(last.kind).toBe('result');
    expect(last.tone).toBe('result');
    // Aucun pas avant le dernier n'est marqué résultat.
    expect(result.steps.slice(0, -1).every((step) => step.tone !== 'result')).toBe(true);
  });

  it.each(cases)('%s : le dernier pas porte EXACTEMENT les valeurs du dessin', (given, values) => {
    const solved = solveRightTriangle(given, values);
    const { steps } = buildTriangleSolveSteps(given, values);
    const last = shown(steps.at(-1).latex);
    expect(last).toContain(formatLength(solved.opposite));
    expect(last).toContain(formatLength(solved.adjacent));
    expect(last).toContain(formatLength(solved.hypotenuse));
    expect(last).toContain(formatDegrees(solved.angle, 1).replace('°', ''));
  });

  it('angle + وتر : sin puis cos, on multiplie, et 30° donne la valeur exacte', () => {
    const { steps } = buildTriangleSolveSteps('angle-hyp', { angle: 30, hypotenuse: 10 });
    expect(steps[1].latex).toBe('\\sin\\theta = \\dfrac{a}{c}');
    expect(steps[2].latex).toBe('\\sin 30^\\circ = \\dfrac{a}{10}');
    expect(steps[3].textKey).toMatch(/isolateMultiply$/);
    expect(steps[3].latex).toBe('a = 10 \\times \\sin 30^\\circ');
    expect(steps[4].textKey).toMatch(/computeExact$/);
    expect(steps[4].latex).toBe('a = 10 \\times \\frac{1}{2} = 5');
    expect(steps[5].latex).toBe('\\cos\\theta = \\dfrac{b}{c}');
    expect(steps[8].latex).toMatch(/\\approx 8\{,\}66$/);
  });

  it('angle + مقابل : l’inconnue au dénominateur, on divise', () => {
    const { steps } = buildTriangleSolveSteps('angle-opp', { angle: 35, opposite: 5 });
    const isolate = steps.find((step) => step.kind === 'isolate');
    expect(isolate.textKey).toMatch(/isolateDivide$/);
    expect(isolate.latex).toMatch(/^b = \\dfrac\{5\}\{\\tan 35\^\\circ\}$|^c = \\dfrac\{5\}\{\\sin 35\^\\circ\}$/);
    expect(steps.find((step) => step.kind === 'compute').textKey).toMatch(/computeCalculator$/);
  });

  it('deux côtés : tan⁻¹ puis Pythagore (3-4-5)', () => {
    const { steps } = buildTriangleSolveSteps('opp-adj', { opposite: 3, adjacent: 4 });
    expect(steps[1].latex).toBe('\\tan\\theta = \\dfrac{a}{b}');
    expect(steps[2].latex).toBe('\\tan\\theta = \\dfrac{3}{4} = 0{,}75');
    expect(steps[3].kind).toBe('inverse');
    expect(Math.abs(steps[3].check - 0.75)).toBeLessThan(1e-9);
    expect(steps[4].latex).toBe('c^2 = a^2 + b^2');
    expect(steps[5].latex).toBe('c^2 = 3^2 + 4^2 = 25');
    expect(steps[6].latex).toBe('c = \\sqrt{25} = 5');
  });

  it('un côté de l’angle droit par Pythagore : c² − l’autre', () => {
    const { steps } = buildTriangleSolveSteps('opp-hyp', { opposite: 3, hypotenuse: 5 });
    expect(steps[4].latex).toBe('b^2 = c^2 - a^2');
    expect(steps[5].latex).toBe('b^2 = 5^2 - 3^2 = 16');
    expect(steps[6].latex).toBe('b = \\sqrt{16} = 4');
  });

  it('le premier pas n’est jamais la réponse', () => {
    const { steps } = buildTriangleSolveSteps('angle-hyp', { angle: 35, hypotenuse: 10 });
    expect(steps[0].latex).toBe('\\theta = 35^\\circ \\qquad c = 10');
    expect(steps[0].latex).not.toContain('5{,}74');
  });

  it('un triangle impossible ne produit aucun pas', () => {
    expect(buildTriangleSolveSteps('opp-hyp', { opposite: 5, hypotenuse: 3 })).toEqual({ ok: false, reason: 'hypotenuse' });
    expect(buildTriangleSolveSteps('angle-hyp', { angle: 90, hypotenuse: 3 }).ok).toBe(false);
    expect(buildTriangleSolveSteps('nope', {}).ok).toBe(false);
  });

  it('déterministe, et la clé ne dépend que des DEUX données', () => {
    const a = buildTriangleSolveSteps('angle-hyp', { angle: 35, hypotenuse: 10, opposite: 99 });
    const b = buildTriangleSolveSteps('angle-hyp', { angle: 35, hypotenuse: 10, opposite: 1 });
    expect(a.steps).toEqual(b.steps);
    expect(solveKey('angle-hyp', { angle: 35, hypotenuse: 10, opposite: 99 })).toBe('angle-hyp|35|10');
    expect(solveKey('opp-adj', { opposite: 3, adjacent: 4 })).not.toBe(solveKey('opp-adj', { opposite: 3, adjacent: 5 }));
    expect(Object.keys(GIVEN_FIELDS)).toHaveLength(6);
  });

  it('latexNumber : virgule protégée, signe moins ASCII', () => {
    expect(latexNumber(5.736)).toBe('5{,}74');
    expect(latexNumber(-2.5)).toBe('-2{,}5');
    expect(latexNumber(36.87, 1)).toBe('36{,}9');
  });
});
