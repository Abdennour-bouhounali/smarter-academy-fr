import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de chainOps.js / powers.js) : un nombre est { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
const dec = (s) => { const [i, f = ''] = String(s).replace(',', '.').split('.'); return R(BigInt(i + f), 10n ** BigInt(f.length)); };
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const add = (p, q) => R(p.n * q.d + q.n * p.d, p.d * q.d);
const sub = (p, q) => R(p.n * q.d - q.n * p.d, p.d * q.d);
const same = (p, q) => p.n === q.n && p.d === q.d;
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;

describe('les مسائل du درس « توزيع الضرب على الجمع والطرح »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });
  it('مسألة 1 — 4 × 45 + 3 × 25 = 255 ; 35 × 255 = 35 × 180 + 35 × 75 = 8 925 ; 9 000 − 8 925 = 75', () => {
    const kit = add(mul(dec('4'), dec('45')), mul(dec('3'), dec('25')));
    expect(same(kit, dec('255'))).toBe(true); expect(answerOf('masala-1', 0, 0)).toBe(255);
    const way1 = mul(dec('35'), kit);
    const way2 = add(mul(dec('35'), mul(dec('4'), dec('45'))), mul(dec('35'), mul(dec('3'), dec('25'))));
    expect(same(way1, dec('8925'))).toBe(true); expect(same(way2, way1)).toBe(true);
    expect(answerOf('masala-1', 1, 0)).toBe(8925); expect(answerOf('masala-1', 1, 1)).toBe(8925);
    expect(same(sub(dec('9000'), way1), dec('75'))).toBe(true); expect(answerOf('masala-1', 2, 1)).toBe(75);
  });
  it('مسألة 2 — 12 × (2,35 + 0,65) = 12 × 3 = 36 ; 12 × 2,35 + 12 × 0,65 = 28,2 + 7,8 ; 40 − 36 = 4', () => {
    const all = mul(dec('12'), add(dec('2,35'), dec('0,65')));
    expect(same(all, dec('36'))).toBe(true); expect(answerOf('masala-2', 0, 0)).toBe(36);
    expect(same(mul(dec('12'), dec('2,35')), dec('28,2'))).toBe(true); expect(same(mul(dec('12'), dec('0,65')), dec('7,8'))).toBe(true);
    expect(same(sub(dec('40'), all), dec('4'))).toBe(true); expect(answerOf('masala-2', 1, 0)).toBe(4);
  });
  it('مسألة 3 — 12 345 678 × 99 = 1 234 567 800 − 12 345 678 = 1 222 222 122 (10 chiffres)', () => {
    const a = dec('12345678');
    const big = sub(mul(a, dec('100')), a);
    expect(same(big, dec('1222222122'))).toBe(true); expect(answerOf('masala-3', 2, 0)).toBe(1222222122);
    expect(same(mul(a, dec('99')), big)).toBe(true);
    expect(String(big.n).length).toBe(10);
    expect(String(a.n).length).toBe(8);
  });
});
