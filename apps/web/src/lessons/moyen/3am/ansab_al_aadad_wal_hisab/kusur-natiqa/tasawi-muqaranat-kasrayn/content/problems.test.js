import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de fractions3.js / powers.js) : produits en croix. */
const fr = (s) => { const [a, b] = String(s).split('/'); return { n: BigInt(a), d: BigInt(b ?? 1) }; };
const cmp = (p, q) => { const l = fr(p).n * fr(q).d; const r = fr(q).n * fr(p).d; return l > r ? 1 : l === r ? 0 : -1; };
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;

describe('les مسائل du درس « تساوي كسرين ومقارنتهما »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — رياض 11/14 الأدقّ ؛ 10/13 < 7/9 < 11/14 (90 < 91 ؛ 98 < 99)', () => {
    expect(cmp('11/14', '7/9')).toBe(1);
    expect(cmp('11/14', '10/13')).toBe(1);
    expect(cmp('7/9', '10/13')).toBe(1);
    expect(7n * 13n).toBe(91n); expect(9n * 10n).toBe(90n);
    expect(7n * 14n).toBe(98n); expect(11n * 9n).toBe(99n);
    const step = PROBLEM['masala-1'].parts[0].steps.find((s) => s.kind === 'choice' && s.role === 'conclude');
    expect(step.options[step.correct]).toBe('رياض');
    const order = PROBLEM['masala-1'].parts[1].steps.find((s) => s.kind === 'choice' && s.role === 'conclude');
    expect(order.options[order.correct]).toBe('ياسمين ثمّ أمين ثمّ رياض');
  });

  it('مسألة 2 — 5/8 ≠ 8/13 (65 ≠ 64), سلمى أغمق ؛ 65/8 ليس عددًا صحيحًا ؛ مع 16 : 10', () => {
    expect(5n * 13n).toBe(65n); expect(8n * 8n).toBe(64n);
    expect(cmp('5/8', '8/13')).toBe(1);
    expect(65n % 8n).not.toBe(0n);
    // 8 طلقات أفتح، 9 أغمق
    expect(cmp('8/13', '5/8')).toBe(-1);
    expect(cmp('9/13', '5/8')).toBe(1);
    const imp = PROBLEM['masala-2'].parts[1].steps.find((s) => s.kind === 'choice' && s.role === 'conclude');
    expect(imp.options[imp.correct]).toBe('لا يوجد عدد صحيح من الطلقات');
    expect((5n * 16n) % 8n).toBe(0n);
    expect((5n * 16n) / 8n).toBe(10n);
    expect(cmp('10/16', '5/8')).toBe(0);
    expect(answerOf('masala-2', 2, 0)).toBe(10);
  });

  it('مسألة 3 — 2/5 = 16/40 ، 3/8 = 15/40 ، 9/40 ؛ الأكبر اليوم الأول ؛ الترتيب 3 ، 2 ، 1', () => {
    expect(cmp('2/5', '16/40')).toBe(0);
    expect(cmp('3/8', '15/40')).toBe(0);
    expect(cmp('2/5', '3/8')).toBe(1);
    expect(cmp('3/8', '9/40')).toBe(1);
    const rows = PROBLEM['masala-3'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    const wants = ['16/40', '15/40', '9/40'];
    rows.forEach((r, i) => expect(r.options[r.correct]).toBe(`$\\frac{${wants[i].split('/')[0]}}{${wants[i].split('/')[1]}}$`));
    const best = PROBLEM['masala-3'].parts[1].steps.find((s) => s.kind === 'choice' && s.role === 'conclude');
    expect(best.options[best.correct]).toBe('اليوم الأول');
    const ord = PROBLEM['masala-3'].parts[2].steps.find((s) => s.kind === 'choice' && s.role === 'conclude');
    expect(ord.options[ord.correct]).toBe('اليوم الثالث ثمّ الثاني ثمّ الأول');
  });
});
