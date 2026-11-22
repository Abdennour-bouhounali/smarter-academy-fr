import { describe, it, expect } from 'vitest';
import {
  buildCanonicalFrames, canonicalLatex, inputToLatex, isExpandedInput, n,
} from './canonicalSteps.js';
import { parseConicEquation, formatCanonical } from './conicParser.js';
import { validateFrames, boardProgress, settledLines } from '../../shared/mathBoard/frames.js';

const build = (source) => buildCanonicalFrames(source, parseConicEquation(source));
const kinds = (frames) => frames.map((frame) => frame.textKey?.split('.').pop());
const asText = (latex) => latex.replace(/\^2/g, '²').replace(/-/g, '−').replace(/\{,\}/g, ',');

describe('buildCanonicalFrames — la complétion du carré, frame par frame', () => {
  it('cercle : grouper → compléter x → compléter y → substituer → constantes → résultat', () => {
    const result = build('x^2 + y^2 - 4x - 6y + 9 = 0');
    expect(result.ok).toBe(true);
    expect(validateFrames(result.frames)).toEqual([]);
    const steps = kinds(result.frames);
    expect(steps[0]).toBe('group');
    expect(steps).toContain('completeSelect');
    expect(steps).toContain('moveApply');
    expect(steps.at(-1)).toBe('resultCircle');
    // 6 étapes logiques : grouper, x, y, substituer, porter, résultat.
    expect(boardProgress(result.frames, result.frames.length)).toEqual({ current: 6, total: 6 });
    const last = result.frames.at(-1);
    expect(last.tone).toBe('result');
    expect(last.rows[0][0].latex).toBe('(x - 2)^2 + (y - 3)^2 = 4');
    expect(last.textParams.center).toBe('$(2\\,;\\,3)$');
    expect(last.textParams.r).toBe('$r = 2$');
    // Les complétions sont écrites comme au tableau.
    const settled = settledLines(result.frames, result.frames.length).map((line) => line.latex);
    expect(settled).toContain('x^2 - 4x = (x - 2)^2 - 4');
    expect(settled).toContain('y^2 - 6y = (y - 3)^2 - 9');
    expect(settled).toContain('(x - 2)^2 - 4 + (y - 3)^2 - 9 = -9');
  });

  it('le premier frame n’est jamais le résultat, aucun frame intermédiaire n’est marqué résultat', () => {
    const { frames } = build('x^2 + y^2 - 4x - 6y + 9 = 0');
    expect(frames[0].tone).toBeUndefined();
    expect(frames.slice(0, -1).every((frame) => frame.tone !== 'result')).toBe(true);
    expect(JSON.stringify(frames[0])).not.toContain('= 4');
  });

  it('le dernier frame EST la conique de l’analyseur (cercle et parabole : même écriture que le champ)', () => {
    for (const source of ['x^2 + y^2 - 4x - 6y + 9 = 0', 'x^2 + y^2 + 6x - 2y - 6 = 0', 'y = x^2 - 2x + 4', 'x = y^2 + 4y + 1']) {
      const parsed = parseConicEquation(source);
      const { frames } = buildCanonicalFrames(source, parsed);
      expect(asText(frames.at(-1).rows[0][0].latex)).toBe(formatCanonical(parsed.conic));
    }
  });

  it('cercle avec A ≠ 1 : facteur, puis division par A', () => {
    const result = build('2x^2 + 2y^2 - 8x = 0');
    expect(validateFrames(result.frames)).toEqual([]);
    const steps = kinds(result.frames);
    expect(steps).toContain('factor');
    expect(steps).toContain('divideApply');
    expect(result.frames.at(-1).rows[0][0].latex).toBe('(x - 2)^2 + y^2 = 4');
  });

  it('ellipse : 4(x − 1)² + 9(y + 2)² = 36, puis division par 36', () => {
    const result = build('4x^2 + 9y^2 - 8x + 36y + 4 = 0');
    expect(result.ok).toBe(true);
    expect(validateFrames(result.frames)).toEqual([]);
    const settled = settledLines(result.frames, result.frames.length).map((line) => line.latex);
    expect(settled).toContain('4(x - 1)^2 + 9(y + 2)^2 = 36');
    expect(settled).toContain('\\frac{(x - 1)^2}{9} + \\frac{(y + 2)^2}{4} = 1');
    expect(result.frames.at(-1).textKey).toMatch(/resultEllipse$/);
    expect(result.frames.at(-1).rows[0][0].latex).toBe('\\frac{(x - 1)^2}{9} + \\frac{(y + 2)^2}{4} = 1');
  });

  it('ellipse centrée : 4x² + 9y² = 36 → grouper, diviser, résultat', () => {
    const result = build('4x^2 + 9y^2 = 36');
    expect(result.ok).toBe(true);
    expect(kinds(result.frames)).toEqual(['group', 'divideToOne', 'divideWrite', 'divideSimplify', 'resultEllipse']);
  });

  it('hyperbole : (x − 1)² − 4y² = 4 → division par 4', () => {
    const result = build('x^2 - 4y^2 - 2x - 3 = 0');
    expect(result.ok).toBe(true);
    expect(validateFrames(result.frames)).toEqual([]);
    expect(result.frames.at(-1).textKey).toMatch(/resultHyperbola$/);
    expect(result.frames.at(-1).rows[0][0].latex).toBe('\\frac{(x - 1)^2}{4} - \\frac{y^2}{1} = 1');
  });

  it('hyperbole verticale : le résultat commence par y', () => {
    const parsed = parseConicEquation('-x^2 + y^2 - 4 = 0');
    expect(parsed.conic.orientation).toBe('vertical');
    const result = buildCanonicalFrames('-x^2 + y^2 - 4 = 0', parsed);
    expect(result.frames.at(-1).rows[0][0].latex).toBe('\\frac{y^2}{4} - \\frac{x^2}{4} = 1');
  });

  it('parabole : isoler, compléter, substituer, réunir, résultat (sommet)', () => {
    const result = build('y = x^2 - 2x + 4');
    expect(validateFrames(result.frames)).toEqual([]);
    const steps = kinds(result.frames);
    expect(steps[0]).toBe('isolate');
    expect(steps).toContain('completeResult');
    expect(steps).toContain('combineResult');
    expect(result.frames.at(-1).textParams.vertex).toBe('$(1\\,;\\,3)$');
  });

  it('parabole avec coefficient de y : division, puis facteur', () => {
    const result = build('2y = 4x^2 + 8x');
    expect(validateFrames(result.frames)).toEqual([]);
    const steps = kinds(result.frames);
    expect(steps).toContain('divideApply');
    expect(steps).toContain('factorOne');
    expect(result.frames.at(-1).rows[0][0].latex).toBe('y = 2(x + 1)^2 - 2');
  });

  it('refuse honnêtement : forme déjà canonique, saisie factorisée, équation illisible', () => {
    expect(build('(x-2)^2 + (y+3)^2 = 16')).toEqual({ ok: false, reason: 'notExpanded' });
    expect(build('x^2/9 + y^2/4 = 1')).toEqual({ ok: false, reason: 'notExpanded' });
    expect(build('x^2 + y^2 = 9')).toEqual({ ok: false, reason: 'alreadyCanonical' });
    expect(build('y = x^2')).toEqual({ ok: false, reason: 'alreadyCanonical' });
    expect(build('x^2 + y^2 = -4').ok).toBe(false);
  });

  it('déterministe : deux constructions identiques', () => {
    expect(build('x^2 + y^2 - 4x - 6y + 9 = 0')).toEqual(build('x^2 + y^2 - 4x - 6y + 9 = 0'));
  });

  it('inputToLatex : liste blanche, virgule décimale, ² et −', () => {
    expect(inputToLatex('x² + y² − 4x = 0')).toBe('x^2 + y^2 - 4x = 0');
    expect(inputToLatex('2,5x^2 + y^2 = 1')).toBe('2{,}5x^2 + y^2 = 1');
    expect(inputToLatex('x^2 + y^2 = 9; alert(1)')).toBeNull();
    expect(isExpandedInput('x^2 + y^2 - 4x = 0')).toBe(true);
    expect(isExpandedInput('(x-1)^2 + y^2 = 4')).toBe(false);
    expect(n(2.5)).toBe('2{,}5');
    expect(n(-3)).toBe('-3');
  });

  it('canonicalLatex couvre les quatre familles', () => {
    expect(canonicalLatex({ kind: 'circle', h: 0, k: -1, r: 3 })).toBe('x^2 + (y + 1)^2 = 9');
    expect(canonicalLatex({ kind: 'parabola', orientation: 'vertical', h: -3, k: 2, a: 1 })).toBe('x = (y - 2)^2 - 3');
  });
});
