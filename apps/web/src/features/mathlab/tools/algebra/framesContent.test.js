import { describe, it, expect } from 'vitest';
import { validateFrames, rowLatex } from '../../shared/mathBoard/frames.js';
import { simplifyExpression } from './simplify.js';
import { factorExpression } from './factor.js';
import { simplifyFrames } from './simplifyFrames.js';
import { factorFrames } from './factorFrames.js';
import { SIMPLIFY_EXAMPLES, FACTOR_EXAMPLES } from './examples.js';

describe('تبسيط — le tableau terme par terme', () => {
  it('3x + 2(x + 4) − x : [2] ⌒× (x + 4) → 2 × x, 2 × 4 → ↓2x ↓8 → termes semblables → ↓4x → 4x + 8 (dernier)', () => {
    const frames = simplifyFrames(simplifyExpression('3x + 2(x + 4) - x'));
    expect(validateFrames(frames)).toEqual([]);
    // 1. le produit désigné
    expect(frames[0].rows[0].map((t) => [t.latex, t.tone])).toEqual([['3x', 'neutral'], ['+ 2', 'selected'], ['\\left(x + 4\\right)', 'selected'], ['- x', 'neutral']]);
    // 2. l'arc × du 2 vers la parenthèse
    expect(frames[1].marks).toEqual([{ type: 'link', from: 'o1a', to: 'o1b', latex: '\\times' }]);
    expect(frames[1].operationKey).toBe('tools.algebra.board.chip.distribute');
    // 3. les produits posés, en orange
    expect(frames[2].rows[0].filter((t) => t.tone === 'operation').map((t) => t.latex)).toEqual(['+ 2 \\times x', '+ 2 \\times 4']);
    // 4. chaque produit calculé sous lui-même
    expect(frames[3].marks.map((m) => m.latex)).toEqual(['2x', '8']);
    expect(rowLatex(frames[4].rows[0])).toBe('3x + 2x + 8 - x');
    // 5. les termes semblables désignés, regroupés, réduits
    expect(frames[5].rows[0].filter((t) => t.tone === 'selected').map((t) => t.latex)).toEqual(['3x', '+ 2x', '- x']);
    expect(rowLatex(frames[6].rows[0])).toBe('\\left(3x + 2x - x\\right) + 8');
    expect(frames[7].marks).toEqual([{ type: 'under', target: 'f0', latex: '4x', tone: 'result' }]);
    // 6. le résultat, et lui seul, en dernier
    expect(frames).toHaveLength(9);
    expect(frames[8]).toMatchObject({ tone: 'result', settle: '4x + 8' });
    expect(frames.slice(0, 8).some((f) => f.settle === '4x + 8')).toBe(false);
  });

  it('une fraction algébrique : la condition arrive AVEC le résultat', () => {
    const frames = simplifyFrames(simplifyExpression('(x^2 - 1)/(x - 1)'));
    expect(validateFrames(frames)).toEqual([]);
    const last = frames.at(-1);
    expect(last.rows[0][0].latex).toBe('x + 1');
    expect(last.rows[1][0].latex).toContain('\\neq');
    expect(frames.slice(0, -1).some((f) => JSON.stringify(f).includes('neq'))).toBe(false);
  });

  it.each(SIMPLIFY_EXAMPLES.map((e) => e.source).concat(['3x', '(x + 1)^2', '2(x + 1)^2 - x', 'x - x', '(a + b)(a - b) + b^2']))('%s — un tableau sain', (source) => {
    const result = simplifyExpression(source);
    const frames = simplifyFrames(result);
    expect(validateFrames(frames)).toEqual([]);
    expect(frames.at(-1).settle).toBe(result.resultLatex);
  });
});

describe('تحليل — le tableau', () => {
  it('x² + 5x + 6 : chercher → candidats → [2] ⌒× [3] ↓6 → [2] ⌒+ [3] ↓5 → (x + 2) → (x + 2)(x + 3) → résultat', () => {
    const frames = factorFrames(factorExpression('x^2 + 5x + 6'));
    expect(validateFrames(frames)).toEqual([]);
    expect(frames[0].rows[0].map((t) => t.tone)).toEqual(['neutral', 'selected', 'selected']);
    expect(frames[1].rows.length).toBeGreaterThan(2);
    expect(frames[1].rows.flat().filter((t) => t.tone === 'result').map((t) => t.latex)).toEqual(['\\qquad 2 + 3 = 5']);
    const times = frames.find((f) => f.marks.some((m) => m.type === 'result' && m.latex === '6'));
    expect(times.marks[0]).toMatchObject({ type: 'link', from: 'P', to: 'Q', latex: '\\times' });
    expect(times.rows[0].find((t) => t.id === 'qc').tone).toBe('result');
    const plus = frames.find((f) => f.marks.some((m) => m.type === 'result' && m.latex === '5'));
    expect(plus.marks[0].latex).toBe('+');
    expect(plus.rows[0].find((t) => t.id === 'qb').tone).toBe('result');
    const build = frames.filter((f) => f.textKey === 'tools.algebra.board.factor.build');
    expect(build.map((f) => rowLatex(f.rows[0]).split('= ')[1])).toEqual(['(x + 2 )', '(x + 2 ) (x + 3 )']);
    expect(frames.at(-1)).toMatchObject({ tone: 'result', settle: 'x^{2} + 5x + 6 = \\left(x + 2\\right)\\left(x + 3\\right)' });
    expect(frames.slice(0, -1).some((f) => f.settle?.includes('\\left(x + 2\\right)\\left(x + 3\\right)'))).toBe(false);
  });

  it.each(FACTOR_EXAMPLES.map((e) => e.source).concat(['2x^2 + 10x + 12', 'x^2 - 2x - 15', '3x', 'x^3 - x']))('%s — un tableau sain', (source) => {
    expect(validateFrames(factorFrames(factorExpression(source)))).toEqual([]);
  });
});
