import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/** Arithmétique décimale EXACTE (BigInt, centièmes) : « -0,3 » → -30n. */
const cent = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(',', '.').replace(/−/g, '-').replace(/\s*cm$/, '').trim();
  const m = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(t);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0') || '0');
  return m[1] === '-' ? -v : v;
};
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const batchOf = (id, part) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'batch');
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const keyOf = (r) => r.options[r.correct];

describe('les مسائل du درس « التعليم على مستقيم مدرّج »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — S 3 · M −3,5 · B −1,5 · C 2 ; distance du mosquée 3,5 ; M est plus loin que S bien que son abscisse soit plus petite ; B entre −2 et −1 ; symétrique 1,5', () => {
    const km = { S: 3, M: -3.5, B: -1.5, C: 2 };
    const rows = batchOf('masala-1', 0).rows;
    ['S', 'M', 'B', 'C'].forEach((k, i) => expect(cent(keyOf(rows[i])), k).toBe(BigInt(Math.round(km[k] * 100))));
    rows.forEach((r) => r.options.forEach((o, j) => { if (j !== r.correct) expect(cent(o)).not.toBe(cent(keyOf(r))); }));
    expect(expectedOf('masala-1', 0)).toEqual([Math.abs(km.M)]);
    expect(Math.abs(km.M) > Math.abs(km.S) && km.S > km.M).toBe(true); // M plus loin, mais S a la plus grande abscisse
    expect(choicesOf('masala-1', 1)[0].options[0]).toContain('المسجد');
    // B(−1,5) : entre −2 et −1
    expect(Math.floor(km.B)).toBe(-2);
    expect(choicesOf('masala-1', 2)[0].options[0]).toBe('$-2$ و $-1$');
    expect(expectedOf('masala-1', 2)).toEqual([-km.B]);
    expect(PROBLEM['masala-1'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['flour']);
  });

  it('مسألة 2 — unité 10 ans/cm : 8 + 12 = 20 ≤ 24 ; 5 ans/cm : 16 + 24 = 40 > 24 ; distances 8, 3, 5, 12 ; symétrique de 50 : −50 à 5 cm à gauche', () => {
    const years = [-80, -30, 50, 120];
    const fits = (per) => Math.abs(Math.min(...years)) / per + Math.max(...years) / per;
    expect(fits(10)).toBe(20);
    expect(fits(10) <= 24).toBe(true);
    expect(fits(5)).toBe(40);
    expect(fits(5) <= 24).toBe(false);
    expect(fits(20) <= 24).toBe(true); // tient aussi, mais le dessin est plus petit : 10 est la plus petite échelle qui tient
    expect(choicesOf('masala-2', 0)[0].options[0]).toBe('10 سنوات');
    expect(expectedOf('masala-2', 0)).toEqual([Math.abs(years[0]) / 10]);
    const rows = batchOf('masala-2', 1).rows;
    years.forEach((y, i) => expect(cent(keyOf(rows[i])), `année ${y}`).toBe(BigInt(Math.abs(y) / 10) * 100n));
    rows.forEach((r) => r.options.forEach((o, j) => { if (j !== r.correct) expect(cent(o)).not.toBe(cent(keyOf(r))); }));
    expect(expectedOf('masala-2', 2)).toEqual([-50]);
    expect(choicesOf('masala-2', 2)[0].options[0]).toContain('5 cm');
    expect(PROBLEM['masala-2'].source.elementId).toBe('deep-2');
  });

  it('مسألة 3 — pas 1 ; −2 à deux pas du zéro ; le zéro à 2 pas de −2 ; l\'épingle en 3 ; −6 est la plus éloignée ; symétrique de −6 : 6', () => {
    const marks = [-6, -2];
    const step = (marks[1] - marks[0]) / 4;
    expect(step).toBe(1);
    expect(expectedOf('masala-3', 0)).toEqual([step, Math.abs(marks[1]) / step]);
    expect(expectedOf('masala-3', 1)).toEqual([3 * step]);
    expect(3 > marks[1] && 3 > marks[0]).toBe(true);
    expect(choicesOf('masala-3', 1)[0].options[0]).toContain('يمين');
    expect(Math.abs(marks[0]) > Math.abs(marks[1])).toBe(true);
    expect(choicesOf('masala-3', 2)[0].options[0]).toBe('$-6$');
    expect(expectedOf('masala-3', 2)).toEqual([-marks[0]]);
    expect(PROBLEM['masala-3'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['thread']);
  });
});
