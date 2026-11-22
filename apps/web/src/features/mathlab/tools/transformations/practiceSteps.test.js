import { describe, it, expect } from 'vitest';
import { buildRevealSteps, latexNumber, imageName } from './practiceSteps.js';
import { generateChallenge, CHALLENGE_KINDS } from './practice.js';
import mathlabAr from '../../../../i18n/locales/ar/mathlab.json';

function seeded(seed = 1) {
  let state = seed;

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;

    return state / 2147483648;
  };
}

describe('buildRevealSteps — « أرني » pas à pas', () => {
  it('trois pas par transformation, le dernier est la réponse du moteur', () => {
    const random = seeded(7);
    for (let i = 0; i < 300; i += 1) {
      const challenge = generateChallenge(random, { kind: CHALLENGE_KINDS[i % CHALLENGE_KINDS.length] });
      const { ok, steps } = buildRevealSteps(challenge);
      expect(ok).toBe(true);
      expect(steps).toHaveLength(3 * challenge.steps.length);
      const last = steps.at(-1);
      expect(last.kind).toBe('result');
      expect(last.point.x).toBeCloseTo(challenge.answer.x, 9);
      expect(last.point.y).toBeCloseTo(challenge.answer.y, 9);
      // Le résultat n'apparaît jamais avant le dernier pas.
      expect(steps.slice(0, -1).some((step) => step.kind === 'result')).toBe(false);
      expect(steps[0].kind).toBe('rule');
    }
  });

  it('ordre règle → substitution → image, et A → A₁ → A′ sur deux pas', () => {
    const challenge = {
      point: { x: 3, y: 2 },
      steps: [
        { kind: 'rotation', enabled: true, angle: 90, center: { type: 'origin' } },
        { kind: 'translation', enabled: true, vx: 1, vy: -4 },
      ],
      answer: { x: -1, y: -1 },
    };
    const { steps } = buildRevealSteps(challenge);
    expect(steps.map((step) => step.kind)).toEqual(['rule', 'substitute', 'image', 'rule', 'substitute', 'result']);
    expect(steps[0].latex).toBe('(x \\;;\\; y) \\longmapsto (-y \\;;\\; x)');
    expect(steps[1].latex).toBe('A(3 \\;;\\; 2) \\longmapsto (-(2) \\;;\\; 3)');
    expect(steps[2].latex).toBe('A_{1}(-2 \\;;\\; 3)');
    expect(steps[3].latex).toBe('(x \\;;\\; y) \\longmapsto (x + 1 \\;;\\; y - 4)');
    expect(steps[4].latex).toBe('A_{1}(-2 \\;;\\; 3) \\longmapsto ((-2) + 1 \\;;\\; 3 - 4)');
    expect(steps[5].latex).toBe("A'(-1 \\;;\\; -1)");
    expect(steps[5].params).toEqual({ from: 'A₁', to: 'A′' });
    expect(steps[0].describe?.key).toBe('rotationPositive');
  });

  it('le signe substitué se voit : −(−3)', () => {
    const { steps } = buildRevealSteps({
      point: { x: 2, y: -3 },
      steps: [{ kind: 'reflection', enabled: true, axis: { type: 'xAxis' } }],
      answer: { x: 2, y: 3 },
    });
    expect(steps).toHaveLength(3);
    expect(steps[1].latex).toContain('-(-3)');
    expect(steps[2].latex).toBe("A'(2 \\;;\\; 3)");
  });

  it('une rotation sans règle de manuel retombe sur la formule affine, toujours juste', () => {
    const { steps } = buildRevealSteps({
      point: { x: 1, y: 0 },
      steps: [{ kind: 'rotation', enabled: true, angle: 90, center: { type: 'point', point: { x: 1, y: 1 } } }],
      answer: { x: 2, y: 1 },
    });
    expect(steps.at(-1).point).toEqual({ x: 2, y: 1 });
  });

  it('déterministe, et vide sans question', () => {
    const challenge = generateChallenge(seeded(3), { kind: 'multiStep' });
    expect(buildRevealSteps(challenge)).toEqual(buildRevealSteps(challenge));
    expect(buildRevealSteps(null)).toEqual({ ok: false, steps: [] });
    expect(buildRevealSteps({ point: { x: 1, y: 1 }, steps: [] }).steps).toHaveLength(0);
  });

  it('les nombres et les noms', () => {
    expect(latexNumber(-2.5)).toBe('-2{,}5');
    expect(latexNumber(-0)).toBe('0');
    expect(imageName(0, 2)).toBe('A_{1}');
    expect(imageName(1, 2)).toBe("A'");
  });

  it('chaque clé de texte existe en arabe', () => {
    const solution = mathlabAr.tools.transformations.practice.solution;
    for (const key of ['rule', 'ruleOf', 'substitute', 'image', 'result', 'show', 'heading']) {
      expect(typeof solution?.[key]).toBe('string');
    }
  });
});
