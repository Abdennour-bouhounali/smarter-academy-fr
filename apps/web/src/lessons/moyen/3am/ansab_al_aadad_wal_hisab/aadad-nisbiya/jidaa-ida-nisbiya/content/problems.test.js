import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const stepsOf = (id, part, kind) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === kind);
const answerOf = (id, part, ask) => stepsOf(id, part, 'numeric').find((s) => s.ask === ask).expected;
const choiceOf = (id, part) => stepsOf(id, part, 'choice')[0];

describe('les مسائل du درس « جداء عدة أعداد نسبية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 2025 nombres égaux de somme −2025 : chacun −1, 2025 impair, produit −1 ; avec 2026 le produit est 1', () => {
    expect(answerOf('masala-1', 0, 0)).toBe(-2025 / 2025);
    let p = 1n;
    for (let i = 0; i < 2025; i += 1) p *= -1n;
    expect(Number(p)).toBe(answerOf('masala-1', 2, 0));
    expect(2025 % 2).toBe(1);
    const c2 = choiceOf('masala-1', 1);
    expect(c2.options[c2.correct]).toContain('سالب');
    let q = 1n;
    for (let i = 0; i < 2026; i += 1) q *= -1n;
    expect(q).toBe(1n);
    const c4 = choiceOf('masala-1', 3);
    expect(c4.options[c4.correct]).toBe('$1$');
    // aucun autre choix n'est la valeur du produit (1)
    c4.options.forEach((o, i) => expect(o === '$1$', o).toBe(i === c4.correct));
  });

  it('مسألة 2 — le carré magique : neuf entrées négatives, chaque ligne, colonne et diagonale a le produit −27 ; opposés → 27 ; coins retournés → −27', () => {
    const g = [[-1, -18, -1.5], [-4.5, -3, -2], [-6, -0.5, -9]];
    const prod = (...v) => Math.round(v.reduce((a, b) => a * b, 1) * 1e6) / 1e6;
    const all = [...g, ...[0, 1, 2].map((c) => g.map((r) => r[c])), [g[0][0], g[1][1], g[2][2]], [g[0][2], g[1][1], g[2][0]]];
    expect(all.length).toBe(8);
    for (const l of all) expect(prod(...l)).toBe(-27);
    for (const l of all) expect(prod(...l.map((x) => -x))).toBe(27);
    // les quatre coins retournés
    const h = g.map((r) => [...r]);
    for (const [i, j] of [[0, 0], [0, 2], [2, 0], [2, 2]]) h[i][j] = -h[i][j];
    const all2 = [...h, ...[0, 1, 2].map((c) => h.map((r) => r[c])), [h[0][0], h[1][1], h[2][2]], [h[0][2], h[1][1], h[2][0]]];
    for (const l of all2) expect(prod(...l)).toBe(-27);
    // la solution écrite
    expect(answerOf('masala-2', 0, 0)).toBe(prod(...g[0]));
    expect(answerOf('masala-2', 0, 1)).toBe(prod(g[0][0], g[1][1], g[2][2]));
    expect(answerOf('masala-2', 2, 0)).toBe(prod(1, 18, 1.5));
    // chaque ligne a trois facteurs négatifs (impair)
    for (const l of all) expect(l.filter((x) => x < 0).length % 2).toBe(1);
  });

  it('مسألة 3 — (−4,5) × 99 = −445,5 ; (−12) × 37 + (−12) × 63 = −1200', () => {
    expect(Math.round(-4.5 * 99 * 10)).toBe(-4455);
    expect(answerOf('masala-3', 0, 0)).toBe(-445.5);
    expect(stepsOf('masala-3', 0, 'numeric')[0].expected).toBe(-4.5 * 100);
    expect(-12 * 37 + -12 * 63).toBe(answerOf('masala-3', 1, 0));
    expect(answerOf('masala-3', 1, 0)).toBe(-1200);
  });
});
