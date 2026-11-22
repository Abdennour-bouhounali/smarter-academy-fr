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

describe('les مسائل du درس « سلسلة عمليات تتضمّن أقواسا »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — (18 + 129) ÷ 7 = 21 ; sans parenthèses 18 + 129 ÷ 7 = 36,428… (pas un nombre de rayons)', () => {
    const shelves = div(add(dec('18'), dec('129')), dec('7'));
    expect(same(shelves, dec('21'))).toBe(true); expect(answerOf('masala-1', 1, 0)).toBe(21);
    const trap = add(dec('18'), div(dec('129'), dec('7')));
    expect(trap.d).not.toBe(1n);
    expect(trap.n * 1000n / trap.d).toBe(36428n);
  });

  it('مسألة 2 — (15 + 12,5 + 2 × 14) ÷ 4 = 13,875 et (9 + 11 + 2 × 8,5) ÷ 4 = 9,25 ; seule Sara dépasse 10', () => {
    const sara = div(add(add(dec('15'), dec('12,5')), mul(dec('2'), dec('14'))), dec('4'));
    const amine = div(add(add(dec('9'), dec('11')), mul(dec('2'), dec('8,5'))), dec('4'));
    expect(same(sara, dec('13,875'))).toBe(true); expect(answerOf('masala-2', 0, 0)).toBe(13.875);
    expect(same(amine, dec('9,25'))).toBe(true); expect(answerOf('masala-2', 1, 0)).toBe(9.25);
    expect(sara.n > 10n * sara.d).toBe(true); expect(amine.n < 10n * amine.d).toBe(true);
    // les distracteurs de la chaîne : le coefficient oublié (14,5…) et la division de l'épreuve seule
    const forgot = div(add(add(dec('15'), dec('12,5')), dec('14')), dec('4'));
    expect(same(forgot, sara)).toBe(false);
    const lastOnly = add(add(dec('15'), dec('12,5')), div(mul(dec('2'), dec('14')), dec('4')));
    expect(same(lastOnly, sara)).toBe(false);
  });

  it('مسألة 3 — (147 − 39) ÷ (2 + 5 × 2) = 9 ; 600 ÷ 2,5 + 7,5 = 247,5 et 600 ÷ (2,5 + 7,5) = 60', () => {
    const a = div(sub(dec('147'), dec('39')), add(dec('2'), mul(dec('5'), dec('2'))));
    expect(same(a, dec('9'))).toBe(true); expect(answerOf('masala-3', 0, 1)).toBe(9);
    expect(same(add(div(dec('600'), dec('2,5')), dec('7,5')), dec('247,5'))).toBe(true);
    expect(same(div(dec('600'), add(dec('2,5'), dec('7,5'))), dec('60'))).toBe(true); expect(answerOf('masala-3', 1, 1)).toBe(60);
    // sans parenthèses A donne autre chose
    expect(same(add(sub(dec('147'), div(dec('39'), dec('2'))), mul(dec('5'), dec('2'))), a)).toBe(false);
  });

  it('chaque مسألة écrit son signe × (jamais 3(4 + 5)) et ne contient aucun résultat négatif attendu', () => {
    const islands = JSON.stringify(PROBLEMS).replace(/\\\\/g, '\\').match(/\$[^$]*\$/g) ?? [];
    expect(islands.length).toBeGreaterThan(30);
    islands.forEach((m) => expect(/\d\s*\(|\)\s*\(/.test(m), m).toBe(false));
  });
});
