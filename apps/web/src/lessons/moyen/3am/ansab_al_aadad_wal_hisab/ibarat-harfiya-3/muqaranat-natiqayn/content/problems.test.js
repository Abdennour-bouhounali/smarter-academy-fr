import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle écrit autrement que la leçon : chaque nombre recalculé ici avec de l'arithmétique entière (produits en croix, centimes). */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceKey = (step) => step.options[step.correct];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
/** a/b − c/d en fraction réduite [n, d]. */
const sub = (a, b, c, d) => { const n = a * d - c * b; const m = b * d; const g = gcd(n, m); return [n / g, m / g]; };

describe('les مسائل du درس « مقارنة عددين ناطقين »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].illustration).toBe(LESSON_CONFIG.lessonProblem.illustration);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — المسابقة : 25/31 − 29/36 = 1/1116 > 0 ; 25 × 36 = 900 et 29 × 31 = 899 ; le القسم الأول est le meilleur', () => {
    expect(sub(25, 31, 29, 36)).toEqual([1, 1116]);
    expect(numericOf('masala-1', 1)).toEqual([25 * 36, 29 * 31]);
    expect(numericOf('masala-1', 1)).toEqual([900, 899]);
    expect(31 * 36).toBe(1116);
    // la différence faite terme à terme : (25 − 29)/(31 − 36) = 4/5 — fausse
    expect([25 - 29, 31 - 36]).toEqual([-4, -5]);
    expect(choiceKey(PROBLEM['masala-1'].parts[1].steps[2])).toBe('$\\frac1{1116}$');
    expect(choiceKey(PROBLEM['masala-1'].parts[2].steps[0])).toContain('القسم الأول');
    // les deux quotients décimaux (centièmes de millième) : 0,8064… et 0,8055…
    expect([Math.floor((25 / 31) * 1000), Math.floor((29 / 36) * 1000)]).toEqual([806, 805]);
    expect(25 / 31 > 29 / 36).toBe(true);
    // les nombres de l'illustration sont ceux de l'énoncé
    for (const v of ['25', '31', '29', '36']) expect(PROBLEM['masala-1'].statement).toContain(v);
  });

  it('مسألة 2 — الحافلتان : A = 1500 + 41x, B = 1200 + 42x ; A − B = 300 − x ; 220 km : 10 520 et 10 440, écart 80 ; égalité à 300 km (13 800)', () => {
    const A = (x) => 1500 + 41 * x; const B = (x) => 1200 + 42 * x;
    for (const x of [0, 1, 7, 100, 220, 300, 301, 450]) expect(A(x) - B(x)).toBe(300 - x);
    expect([A(220), B(220)]).toEqual([10520, 10440]);
    expect(numericOf('masala-2', 2)).toEqual([10520, 10440, 80]);
    expect(A(220) - B(220)).toBe(80);
    expect([A(300), B(300)]).toEqual([13800, 13800]);
    expect(A(301) < B(301) && A(299) > B(299)).toBe(true);
    // la mauvaise somme : (1500 + 41x) + (1200 + 42x) = 2700 + 83x
    expect([2700, 83]).toEqual([1500 + 1200, 41 + 42]);
    expect(choiceKey(PROBLEM['masala-2'].parts[1].steps[0])).toBe('$300-x$');
    expect(choiceKey(PROBLEM['masala-2'].parts[3].steps[0])).toContain('x>300');
  });

  it('مسألة 3 — العصير : 97,50 / 1,5 = 65 ; 146,40 / 2,25 = 976/15 ; 65 − 976/15 = −1/15 ; 9 × 1/15 = 0,6', () => {
    // en centimes : 9750 / 1,5 = 6500 ; 14640 / 2,25 = 14640 × 4 / 9 = 58560 / 9 = 6506,66…
    expect(9750 * 10 / 15).toBe(6500);
    expect(sub(65, 1, 976, 15)).toEqual([-1, 15]);
    expect(14640 * 100 / 225 / 100).toBeCloseTo(976 / 15, 9);
    expect(976 / 15).toBeCloseTo(65.0666667, 6);
    expect(numericOf('masala-3', 0)).toEqual([65]);
    expect(numericOf('masala-3', 3)).toEqual([0.6]);
    expect(9 * 1 / 15).toBeCloseTo(0.6, 12);
    expect(choiceKey(PROBLEM['masala-3'].parts[1].steps[0])).toBe('$-\\frac1{15}$');
    expect(choiceKey(PROBLEM['masala-3'].parts[2].steps[0])).toContain('الصغرى');
    // les trois nombres de l'illustration sont dans l'énoncé
    for (const v of ['1,5', '97,50', '2,25', '146,40']) expect(PROBLEM['masala-3'].statement).toContain(v);
  });

  it('aucune ligne ne renvoie au livre ni n\'écrit A(−3)', () => {
    const all = JSON.stringify(PROBLEMS);
    expect(all).not.toMatch(/الكتاب|الصفحة|ص\s?\d/);
    expect(all).not.toMatch(/[AB]\(\s*-?\d/);
  });
});
