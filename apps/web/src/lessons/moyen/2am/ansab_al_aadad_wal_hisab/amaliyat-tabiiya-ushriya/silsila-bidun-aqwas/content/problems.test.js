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
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const same = (p, q) => p.n === q.n && p.d === q.d;
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;

describe('les مسائل du درس « سلسلة عمليات دون أقواس وأولوية العمليات »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 18500 − 4 × 3200 − 1500 = 4200 (le piège 18500 − 4 donne 18496 × 3200 − 1500)', () => {
    const rest = sub(sub(dec('18500'), mul(dec('4'), dec('3200'))), dec('1500'));
    expect(same(rest, dec('4200'))).toBe(true); expect(answerOf('masala-1', 1, 0)).toBe(4200);
    expect(mul(dec('4'), dec('3200'))).toEqual(R(12800n));
    const trap = sub(mul(sub(dec('18500'), dec('4')), dec('3200')), dec('1500'));
    expect(same(trap, rest)).toBe(false);
  });

  it('مسألة 2 — 2400 − 6 × 250 + 800 = 1700 ; 1850 − 1700 = 150 (le dictionnaire n\'est pas payé)', () => {
    const fund = add(sub(dec('2400'), mul(dec('6'), dec('250'))), dec('800'));
    expect(same(fund, dec('1700'))).toBe(true); expect(answerOf('masala-2', 1, 0)).toBe(1700);
    expect(same(sub(dec('1850'), fund), dec('150'))).toBe(true);
    const step = PROBLEM['masala-2'].parts[2].steps.find((s) => s.kind === 'choice');
    expect(step.options[step.correct]).toContain('150');
  });

  it('مسألة 3 — 2,5 + 3 × 4,2 + 12 ÷ 4 = 18,1 > 18', () => {
    const km = add(add(dec('2,5'), mul(dec('3'), dec('4,2'))), div(dec('12'), dec('4')));
    expect(same(km, dec('18,1'))).toBe(true); expect(answerOf('masala-3', 1, 0)).toBe(18.1);
    expect(km.n * 1n > dec('18').n * km.d).toBe(true);
    expect(same(mul(dec('3'), dec('4,2')), dec('12,6'))).toBe(true);
  });

  it('aucune parenthèse ne figure dans une chaîne montrée (périmètre : sans parenthèses)', () => {
    const islands = JSON.stringify(PROBLEMS).replace(/\\\\/g, '\\').match(/\$[^$]*\$/g) ?? [];
    expect(islands.length).toBeGreaterThan(30);
    islands.forEach((m) => expect(/[()[\]]|\\frac/.test(m), m).toBe(false));
  });
});
