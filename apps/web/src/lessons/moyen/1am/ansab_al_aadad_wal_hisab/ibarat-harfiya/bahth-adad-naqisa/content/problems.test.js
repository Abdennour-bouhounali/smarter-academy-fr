import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/** Arithmétique décimale EXACTE (BigInt, centièmes) : « 0,3 » → 30n. */
const cent = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\\,/g, '').replace(/\{,\}/g, '.').replace(',', '.').replace(/−/g, '-').trim();
  const m = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(t);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0') || '0');
  return m[1] === '-' ? -v : v;
};
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');

describe('les مسائل du درس « البحث عن أعداد ناقصة »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — 72 − 15 = 57 ; 59 + 8 = 67 (et 67 − 8 = 59) ; 156 ÷ 12 = 13 (et 12 × 13 = 156)', () => {
    expect(expectedOf('masala-1', 0)).toEqual([72 - 15]);
    expect(72 - 15).toBe(57);
    expect(57 + 15).toBe(72);
    expect(expectedOf('masala-1', 1)).toEqual([59 + 8]);
    expect(67 - 8).toBe(59);
    expect(expectedOf('masala-1', 2)).toEqual([156 / 12]);
    expect(12 * 13).toBe(156);
    expect(choicesOf('masala-1', 0)[0].options[0]).toBe('$\\square+15=72$');
    // le distracteur « □ − 15 = 72 » donne 87, « 15 × □ = 72 » donne 4,8 : aucun ne donne 57
    expect(72 + 15).not.toBe(57);
    expect(72 / 15).not.toBe(57);
    expect(choicesOf('masala-1', 1)[0].options[0]).toContain('67-8=59');
    expect(PROBLEM['masala-1'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['stores']);
  });

  it('مسألة 2 — 96 000 − 24 000 = 72 000 ; 72 000 ÷ 8 = 9 000 ; 24 000 + 8 × 9 000 = 96 000', () => {
    expect(expectedOf('masala-2', 0)).toEqual([96000 - 24000]);
    expect(expectedOf('masala-2', 1)).toEqual([72000 / 8]);
    expect(expectedOf('masala-2', 2)).toEqual([24000 + 8 * 9000]);
    expect(24000 + 8 * 9000).toBe(96000);
    expect(8 * 9000).toBe(72000);
    expect(choicesOf('masala-2', 1)[0].options[0]).toContain('8\\times\\square=72');
    expect(PROBLEM['masala-2'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['members']);
    expect(PROBLEM['masala-2'].source.elementId).toBe('deep-1');
    expect(cent('$24\\,000$')).toBe(2400000n);
  });

  it('مسألة 3 — 2 × 15 = 30, 63 − 30 = 33 ; 63 − 27 = 36, 36 ÷ 2 = 18 (ordre inverse des cartes) ; 2 × 18 + 27 = 63', () => {
    expect(expectedOf('masala-3', 0)).toEqual([2 * 15, 63 - 2 * 15]);
    expect(2 * 15 + 33).toBe(63);
    expect(expectedOf('masala-3', 1)).toEqual([63 - 27, (63 - 27) / 2]);
    expect(2 * 18 + 27).toBe(63);
    expect(expectedOf('masala-3', 2)).toEqual([2 * 18 + 27]);
    // le programme « × 2 puis + 27 » est remonté par « − 27 » PUIS « ÷ 2 » : l'ordre inverse
    expect((63 / 2) - 27).not.toBe(18);
    expect(PROBLEM['masala-3'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['n']);
    expect(PROBLEM['masala-3'].cites.map((c) => c.elementId)).toEqual(['ex-18']);
  });
});
