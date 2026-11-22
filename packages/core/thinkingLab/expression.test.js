/**
 * La fixture partagée content/thinking-lab/_fixtures/expressions.json est la SEULE
 * source de vérité de l'équivalence entre cet évaluateur et son portage PHP
 * (apps/api/app/Domain/ThinkingLab/ExpressionEvaluator.php, verrouillé par
 * tests/Unit/ThinkingLab/ExpressionEvaluatorFixtureTest.php). Les verdicts y
 * sont ÉCRITS à la main, les valeurs viennent de formules indépendantes.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  parseExpression, evaluateAst, equivalentExpressions, normalizeInput, createSampler, samplePoints, evaluateExpression,
} from './expression.js';

const fixture = JSON.parse(readFileSync(new URL('../../../content/thinking-lab/_fixtures/expressions.json', import.meta.url), 'utf8'));

describe('fixture partagée JS ↔ PHP', () => {
  it('contient au moins 200 cas, sans doublon de nom', () => {
    expect(fixture.parse.length + fixture.equivalence.length).toBeGreaterThanOrEqual(200);
    expect(new Set(fixture.parse.map((c) => c.name)).size).toBe(fixture.parse.length);
    expect(new Set(fixture.equivalence.map((c) => c.name)).size).toBe(fixture.equivalence.length);
    expect(fixture.equivalence.filter((c) => c.equivalent).length).toBeGreaterThanOrEqual(40);
    expect(fixture.equivalence.filter((c) => !c.equivalent).length).toBeGreaterThanOrEqual(40);
  });

  describe('lecture', () => {
    for (const c of fixture.parse) {
      it(c.name, () => {
        const r = parseExpression(c.input, c.vars);
        if (!c.ok) {
          expect(r).toEqual({ ok: false, error: c.error });
          return;
        }
        expect(r.ok).toBe(true);
        expect(r.normalized).toBe(c.normalized);
        const v = evaluateAst(r.ast, c.at);
        if (c.value === null) expect(Number.isNaN(v)).toBe(true);
        else expect(Math.abs(v - c.value)).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(c.value)));
      });
    }
  });

  describe('équivalence', () => {
    for (const { name, given, expected, vars, equivalent, reason, ...opts } of fixture.equivalence) {
      it(name, () => {
        const r = equivalentExpressions(given, expected, { vars, ...opts });
        expect({ equivalent: r.equivalent, reason: r.reason }).toEqual({ equivalent, reason });
      });
    }
  });
});

describe('expression — garde-fous', () => {
  it('ne connaît ni eval ni Function', () => {
    const source = readFileSync(new URL('./expression.js', import.meta.url), 'utf8');
    expect(source).not.toMatch(/\beval\s*\(|new Function\s*\(/);
  });

  it('une expression attendue illisible LÈVE (erreur de contenu, jamais un refus muet)', () => {
    expect(() => equivalentExpressions('x', 'x+', { vars: ['x'] })).toThrow(/illisible/);
  });

  it('normalise le clavier arabe et MathLive', () => {
    expect(normalizeInput('٢ × π − √٣')).toBe('2*pi-sqrt3');
    expect(normalizeInput('x²')).toBe('x^2');
    expect(normalizeInput('1,5')).toBe('1.5');
  });

  it('« e » n\'est jamais une variable', () => {
    expect(parseExpression('e', ['e']).normalized).toBe('e');
  });

  it('le générateur est déterministe et reste dans ]0, 1[', () => {
    const a = createSampler(42);
    const b = createSampler(42);
    for (let i = 0; i < 50; i++) {
      const u = a();
      expect(u).toBe(b());
      expect(u).toBeGreaterThan(0);
      expect(u).toBeLessThan(1);
    }
  });

  it('écarte les points voisins d\'une valeur exclue', () => {
    const pts = samplePoints(['x'], { samples: 50, domain: { x: { min: 1.999, max: 2.001, exclude: [2] } } });
    expect(pts).toEqual([]);
  });

  it('evaluateExpression rend null pour une valeur indéfinie', () => {
    expect(evaluateExpression('1/x', { x: 0 })).toBeNull();
    expect(evaluateExpression('1/x', { x: 4 })).toBe(0.25);
  });
});
