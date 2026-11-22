import { describe, it, expect } from 'vitest';
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de chainOps.js) : un nombre est { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
const dec = (s) => { const [i, f = ''] = String(s).replace(',', '.').split('.'); return R(BigInt(i + f), 10n ** BigInt(f.length)); };
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const add = (p, q) => R(p.n * q.d + q.n * p.d, p.d * q.d);
const sub = (p, q) => R(p.n * q.d - q.n * p.d, p.d * q.d);
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const same = (p, q) => p.n === q.n && p.d === q.d;
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const choiceOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'choice' && s.ask === ask);

describe('les مسائل du درس « وصف سلسلة حسابات »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — (5 + 4) × 3 = 27 et (2,5 + 4) × 3 = 19,5 ; la bonne chaîne est la seule des trois qui vaut 27 ; la phrase est celle du jeu', () => {
    const prog = (x) => mul(add(dec(x), dec('4')), dec('3'));
    expect(same(prog('5'), dec('27'))).toBe(true); expect(answerOf('masala-1', 0, 0)).toBe(27);
    expect(same(prog('2,5'), dec('19,5'))).toBe(true); expect(answerOf('masala-1', 0, 1)).toBe(19.5);
    const c = choiceOf('masala-1', 1, 0);
    const vals = [mul(add(dec('5'), dec('4')), dec('3')), add(mul(dec('3'), dec('5')), dec('4')), add(dec('5'), mul(dec('4'), dec('3')))];
    vals.forEach((v, k) => expect(same(v, dec('27')), `option ${k}`).toBe(k === c.correct));
    const s = choiceOf('masala-1', 2, 0);
    expect(s.options[s.correct]).toBe('جداء مجموع العددين 5 و 4 والعدد 3');
    expect(s.options[s.correct]).toBe(C.describe('(5 + 4) × 3'));
    s.options.forEach((o, k) => { if (k !== s.correct) expect(['مجموع']).toContain(o.split(' ')[0]); });
  });

  it('مسألة 2 — فرق 50 وجداء 6 و 7 = 8 ; (27 + 9) ÷ 6 = 6 ; 3 × (2 + 1) = 9 ; le code est 869 ; 27 + 9 ÷ 6 = 28,5 (pas un chiffre)', () => {
    const d1 = sub(dec('50'), mul(dec('6'), dec('7'))); const d2 = div(add(dec('27'), dec('9')), dec('6')); const d3 = mul(dec('3'), add(dec('2'), dec('1')));
    expect([d1, d2, d3].map((v) => v.d === 1n && v.n >= 0n && v.n <= 9n)).toEqual([true, true, true]);
    expect(Number(`${d1.n}${d2.n}${d3.n}`)).toBe(869); expect(answerOf('masala-2', 1, 0)).toBe(869);
    const wrong = add(dec('27'), div(dec('9'), dec('6')));
    expect(same(wrong, dec('28,5'))).toBe(true); expect(answerOf('masala-2', 2, 0)).toBe(28.5); expect(wrong.n > 9n * wrong.d).toBe(true);
    expect(PROBLEM['masala-2'].statement).toContain('فرق العدد 50 وجداء العددين 6 و 7');
    expect(PROBLEM['masala-2'].statement).toContain('حاصل قسمة مجموع العددين 27 و 9 على 6');
    expect(PROBLEM['masala-2'].statement).toContain('جداء العدد 3 ومجموع العددين 2 و 1');
    // les trois lignes du lot : une seule option vaut le chiffre
    const batch = PROBLEM['masala-2'].parts[0].steps.find((s) => s.kind === 'batch');
    expect(batch.rows.map((r) => r.options[r.correct])).toEqual(['$50 - 6 \\times 7$', '$(27 + 9) \\div 6$', '$3 \\times (2 + 1)$']);
    expect([d1, d2, d3].map((v) => Number(v.n))).toEqual([8, 6, 9]);
  });

  it('مسألة 3 — (4 + 6) × 2 ÷ 4 = 5, (10 + 6) × 2 ÷ 4 = 8 ; 2 × 5 − 6 = 4 et 2 × 8 − 6 = 10 (le programme se remonte) ; la phrase est celle de la chaîne', () => {
    const prog = (x) => div(mul(add(dec(x), dec('6')), dec('2')), dec('4'));
    expect(same(prog('4'), dec('5'))).toBe(true); expect(answerOf('masala-3', 0, 0)).toBe(5);
    expect(same(prog('10'), dec('8'))).toBe(true); expect(answerOf('masala-3', 0, 1)).toBe(8);
    expect(same(sub(mul(dec('2'), dec('5')), dec('6')), dec('4'))).toBe(true); expect(answerOf('masala-3', 2, 0)).toBe(4);
    expect(same(sub(mul(dec('2'), dec('8')), dec('6')), dec('10'))).toBe(true); expect(answerOf('masala-3', 2, 1)).toBe(10);
    const chain = choiceOf('masala-3', 1, 0); const sentence = choiceOf('masala-3', 1, 1);
    const alt = [div(mul(add(dec('4'), dec('6')), dec('2')), dec('4')), add(dec('4'), div(mul(dec('6'), dec('2')), dec('4'))), add(mul(add(dec('4'), dec('6')), dec('2')), dec('4'))];
    alt.forEach((v, k) => expect(same(v, dec('5')), `chaîne ${k}`).toBe(k === chain.correct));
    expect(sentence.options[sentence.correct]).toBe('حاصل قسمة جداء مجموع العددين 4 و 6 والعدد 2 على 4');
    expect(sentence.options[sentence.correct]).toBe(C.describe('(4 + 6) × 2 ÷ 4'));
    expect(new Set(sentence.options).size).toBe(3);
  });

  it('chaque مسألة écrit son signe × (jamais 3(4 + 5)) et ne contient aucun résultat négatif attendu', () => {
    const islands = JSON.stringify(PROBLEMS).replace(/\\\\/g, '\\').match(/\$[^$]*\$/g) ?? [];
    expect(islands.length).toBeGreaterThan(30);
    islands.forEach((m) => expect(/\d\s*\(|\)\s*\(/.test(m), m).toBe(false));
    PROBLEMS.forEach((p) => p.parts.forEach((pt) => pt.steps.filter((s) => s.kind === 'numeric').forEach((s) => expect(s.expected).toBeGreaterThanOrEqual(0))));
  });
});
