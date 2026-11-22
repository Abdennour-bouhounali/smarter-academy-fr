import { describe, it, expect } from 'vitest';
import { buildIntersectionSteps, intersectionKey, lineLatex } from './intersectionSteps.js';
import { lineConicIntersection } from './intersections.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';

const circle = { kind: 'circle', h: 0, k: 0, r: 5 };
const line = (slope, intercept) => ({ vertical: false, slope, intercept });
const vertical = (x) => ({ vertical: true, x });
const kinds = (steps) => steps.map((step) => step.kind);

describe('buildIntersectionSteps — droite ∩ conique, pas à pas', () => {
  it('sécante : système → substitution → trinôme → Δ → racines → y → points (DERNIER)', () => {
    const result = buildIntersectionSteps(circle, line(1, 1));
    expect(result.ok).toBe(true);
    expect(kinds(result.steps)).toEqual(['system', 'substitute', 'quadratic', 'discriminant', 'roots', 'otherCoordinate', 'result']);
    expect(result.steps[0].latex).toBe('\\begin{cases} x^2 + y^2 = 25 \\\\ y = x + 1 \\end{cases}');
    expect(result.steps[1].latex).toBe('x^2 + (x + 1)^2 = 25');
    expect(result.steps[2].latex).toBe('2x^2 + 2x - 24 = 0');
    expect(result.steps[3].latex).toBe('\\Delta = b^2 - 4ac = 2^2 - 4 \\times 2 \\times (-24) = 196');
    expect(result.steps[4].latex).toBe('x_1 = \\dfrac{-b - \\sqrt{\\Delta}}{2a} = -4 \\qquad x_2 = \\dfrac{-b + \\sqrt{\\Delta}}{2a} = 3');
    expect(result.steps[5].latex).toBe('y_1 = (-4) + 1 = -3 \\qquad y_2 = 3 + 1 = 4');
    const last = result.steps.at(-1);
    expect(last.tone).toBe('result');
    expect(last.textKey).toBe('tools.conics.lineParameters.intersections.secant');
    expect(last.latex).toBe('(-4\\,;\\,-3) \\qquad (3\\,;\\,4)');
  });

  it('le dernier pas porte EXACTEMENT les points du moteur (arrondis comme le plan)', () => {
    const conic = { kind: 'ellipse', h: 1, k: -2, a: 3, b: 2 };
    const l = line(0.5, -1);
    const engine = lineConicIntersection(conic, l);
    const { steps } = buildIntersectionSteps(conic, l);
    expect(engine.count).toBe(2);
    for (const p of engine.points) {
      const shown = (v) => formatValue(v, 2).replace('−', '-').replace(',', '{,}');
      expect(steps.at(-1).latex).toContain(`(${shown(p.x)}\\,;\\,${shown(p.y)})`);
    }
    expect(steps[2].textKey).toMatch(/expandClear$/);
  });

  it('tangente : Δ = 0, une racine double', () => {
    const { steps } = buildIntersectionSteps(circle, line(0, 5));
    expect(kinds(steps)).toContain('roots');
    expect(steps.find((step) => step.kind === 'roots').textKey).toMatch(/doubleRoot$/);
    expect(steps.at(-1).textKey).toMatch(/tangent$/);
    expect(steps.at(-1).latex).toBe('(0\\,;\\,5)');
  });

  it('extérieure : Δ < 0, aucun point, pas de pas « autre coordonnée »', () => {
    const { steps } = buildIntersectionSteps(circle, line(0, 9));
    expect(kinds(steps)).toEqual(['system', 'substitute', 'quadratic', 'discriminant', 'roots', 'result']);
    expect(steps.at(-1).textKey).toMatch(/none$/);
    expect(steps.at(-1).latex).toBe('\\varnothing');
  });

  it('droite verticale sur une parabole y = … : équation du premier degré', () => {
    const parabola = { kind: 'parabola', orientation: 'horizontal', h: 1, k: 3, a: 1 };
    const { steps } = buildIntersectionSteps(parabola, vertical(2));
    expect(kinds(steps)).toEqual(['system', 'substitute', 'linear', 'roots', 'otherCoordinate', 'result']);
    expect(steps[1].latex).toBe('y = (2 - 1)^2 + 3');
    expect(steps.at(-1).latex).toBe('(2\\,;\\,4)');
  });

  it('le premier pas n’est jamais la réponse ; déterministe ; la clé suit conique ET droite', () => {
    const a = buildIntersectionSteps(circle, line(1, 1));
    expect(a.steps[0].tone).toBeUndefined();
    expect(a).toEqual(buildIntersectionSteps(circle, line(1, 1)));
    expect(intersectionKey(circle, line(1, 1))).not.toBe(intersectionKey(circle, line(1, 2)));
    expect(intersectionKey(circle, line(1, 1))).not.toBe(intersectionKey({ ...circle, r: 4 }, line(1, 1)));
  });

  it('refuse une entrée invalide', () => {
    expect(buildIntersectionSteps(null, line(1, 1)).ok).toBe(false);
    expect(buildIntersectionSteps(circle, null).ok).toBe(false);
  });

  it('lineLatex', () => {
    expect(lineLatex(line(2, -1))).toBe('y = 2x - 1');
    expect(lineLatex(line(-1, 0))).toBe('y = -x');
    expect(lineLatex(vertical(-2.5))).toBe('x = -2{,}5');
  });
});
