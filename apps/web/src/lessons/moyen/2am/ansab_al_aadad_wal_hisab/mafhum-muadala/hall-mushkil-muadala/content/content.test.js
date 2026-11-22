import { describe, it, expect } from 'vitest';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, LAB, METHOD, KNOWLEDGE, ROBOT, FENCE, OIL } from './textbook';
import { EX } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/** Arithmétique INDÉPENDANTE du cœur : des entiers et des flottants contrôlés, aucune analyse de texte ni rationnels du cœur. */

describe('« حلّ مشكل باستعمال معادلة » — les mathématiques du contenu', () => {
  it('le labo : les trois tâches de مبتدئ et les trois de متقدم, recalculées en centilitres entiers', () => {
    const T = LEVELS['juice-line'].beginner.numbers.tasks;
    expect(T.map((t) => (t.total * 100) / t.bottles)).toEqual([150, 75, 25]);
    for (const t of T) { expect(t.total * 100 % t.bottles).toBe(0); expect(((t.total * 100) / t.bottles) % 5).toBe(0); expect(t.tests).toBe(2); }
    const A = LEVELS['juice-line'].advanced.numbers.tasks;
    expect(A.map((t) => t.bottles * Math.round(t.size * 100) - Math.round((t.carry ?? 0) * 100))).toEqual([600, 2250, 600]);
    expect(LAB.tasks.a1.total).toBe('6'); expect(24 * 0.25).toBe(6);
    expect(15 * 1.5).toBe(22.5);
    expect(40 * 0.25 - 4).toBe(6); expect(40 * 0.25).toBe(10);
    // le plan : 18 L avec 1,4 L → 12 bouteilles et 1,2 L qui restent ; avec 1,6 L → 11 bouteilles et une 12e à 0,4 L
    expect(Math.floor(1800 / 140)).toBe(12); expect(1800 - 12 * 140).toBe(120);
    expect(Math.floor(1800 / 160)).toBe(11); expect(1800 - 11 * 160).toBe(40);
  });
  it('la طريقة : 63 ÷ 4,5 = 14 ; 2,5 × 6 = 15 ; 9 ÷ 1,2 = 7,5 ; 2x + 240 = 300 → 30', () => {
    expect(6300 / 4.5 / 100).toBe(METHOD.numbers.divisor.x);
    expect(4.5 * 14).toBe(63);
    expect(2.5 * 6).toBe(METHOD.numbers.dividend.x);
    expect(1.2 * 7.5).toBe(9);
    expect(2 * 30 + 240).toBe(300); expect((300 - 240) / 2).toBe(METHOD.numbers.two.x);
    // le test de vérification du module 3 : 36 ÷ 4,5 = 8 ; 30 ÷ 2,5 = 12 ; 3x + 15 = 60 → 15
    expect(4.5 * 8).toBe(36); expect(30 / 2.5).toBe(12); expect((60 - 15) / 3).toBe(15); expect(3 * 15 + 15).toBe(60);
    // les exemples de معارف
    expect(10 / 2.5).toBe(4); expect(0.4 * 15).toBe(6); expect(56 / 7).toBe(8); expect(12 / 3).toBe(4);
    expect(40 * 0.25).toBe(10); expect(10 - 4).toBe(6);
    expect(KNOWLEDGE.definition.example).toContain('12\\div3=4');
  });
  it('« أستعدّ » : chaque affirmation recalculée', () => {
    const P = PREP_PLATFORM_ITEMS;
    expect(P[0].answer).toBe(Math.round((12.5 - 7) * 10) === 55);
    expect(P[1].answer).toBe(6 * 9 === 15);                    // 6 × … = 15 → 2,5, pas 9
    expect(15 / 6).toBe(2.5);
    expect(P[2].answer).toBe(Math.round((4.5 / 0.9) * 1000) === 5000);
    expect(P[3].answer).toBe(8 * 7 === 56 && 56 / 7 === 8);
    expect(P[4].answer).toBe(4 * 1.5 === 5.5);                // 4x en 1,5 = 6, pas 5,5
    expect(PREP_ITEMS[0].answer).toBe(12 - 5 === 12 - 5);     // MB = 12 − x
    expect(new Set([...PREP_ITEMS, ...P].map((p) => p.answer)).size).toBe(2);
  });
  it('les exercices : chaque clé recalculée, chaque distracteur numérique faux', () => {
    const rows = (id) => EX[id].question.rows;
    const keyOf = (id, i) => rows(id)[i].options[rows(id)[i].correct];
    const num = (s) => { const t = String(s).replace(/\\,\\mathrm\{[a-z]+\}(\^2)?/g, '').replace(/[$ ]/g, ''); const f = /^\\frac\{(\d+)\}\{(\d+)\}$/.exec(t); return f ? Number(f[1]) / Number(f[2]) : Number(t.replace('{,}', '.')); };
    // ex-1 : 1350 kg en 450 boîtes → 3 kg ; les équations vraies
    expect(1350 / 450).toBe(3); expect(150 * 3).toBe(450); expect(num(keyOf('ex-1', 4))).toBe(3);
    expect(450 * 3).toBe(1350); expect(1350 / 3).toBe(450);
    expect(150 * 3).not.toBe(1350);
    expect(450 / 1350).not.toBe(3); expect(1350 - 450).not.toBe(3);
    // ex-2 : x/4 = 2,5 → 10 ; x/4 × … ; ¼ x = 3,5 → 14 ; x/200 = 1/5 → 40 ; 392/x = 98 → 4 ; 75,6/x = 12,6 → 6
    const sol = [[10, (x) => x / 4, 2.5], [14, (x) => x / 4, 3.5], [40, (x) => x / 200, 0.2], [4, (x) => 392 / x, 98], [6, (x) => 75.6 / x, 12.6]];
    sol.forEach(([x, f, b], i) => {
      expect(num(keyOf('ex-2', i)), `ex-2 ${i}`).toBe(x); expect(f(x)).toBeCloseTo(b, 9);
      for (const o of rows('ex-2')[i].options.filter((_, k) => k !== rows('ex-2')[i].correct)) expect(f(num(o)), `ex-2 ${i} ${o}`).not.toBeCloseTo(b, 6);
    });
    // ex-3 : 30/x = 12 → 2,5
    expect(30 / 2.5).toBe(12); expect(EX['ex-3'].question.expected).toBe(2.5);
    // ex-4 : 0,1 × □ = 0,53 → 5,3 ; 144/□ = 12 → 12 ; 0,36/□ = 0,1 → 3,6
    const miss = [[(x) => 0.1 * x, 0.53, 5.3], [(x) => 144 / x, 12, 12], [(x) => 0.36 / x, 0.1, 3.6]];
    miss.forEach(([f, b, x], i) => {
      expect(num(keyOf('ex-4', i))).toBeCloseTo(x, 9); expect(f(x)).toBeCloseTo(b, 9);
      for (const o of rows('ex-4')[i].options.filter((_, k) => k !== rows('ex-4')[i].correct)) expect(f(num(o)), `ex-4 ${i} ${o}`).not.toBeCloseTo(b, 6);
    });
    // ex-5 : vrai / faux recalculés par l'opération unique
    const claims = [[3, (x) => 4.8 / x, 1.6, true], [5, (x) => 2.5 * x, 10, false], [8, (x) => 56 / x, 7, true], [0.3, (x) => 12 / x, 4, false]];
    claims.forEach(([x, f, b, ans], i) => { expect(Math.abs(f(x) - b) < 1e-9, `ex-5 ${i}`).toBe(ans); expect(EX['ex-5'].question.rows[i].answer).toBe(ans); });
    // ex-6 : aire 7,5 = 5 × x → 1,5 ; 37,5 est 7,5 × 5
    expect(7.5 / 5).toBe(1.5); expect(num(keyOf('ex-6', 1))).toBe(1.5); expect(7.5 * 5).toBe(37.5); expect(5 + 1.5).not.toBe(7.5);
  });
  it('les مسائل : les nombres de contexte', () => {
    expect(3 * 0.6).toBeCloseTo(1.8, 9); expect(1.8 - 0.6).toBeCloseTo(1.2, 9); expect(18 / 1.2).toBeCloseTo(ROBOT.steps, 9);
    expect(Math.round(1.8 * 15 * 10) / 10).toBe(27); expect(Math.round(0.6 * 15 * 10) / 10).toBe(9); expect(27 - 9).toBe(ROBOT.distance);
    expect(2 * (FENCE.length + FENCE.width)).toBe(FENCE.perimeter); expect(2 * FENCE.length).toBe(170); expect((FENCE.perimeter - 170) / 2).toBe(FENCE.width);
    expect(FENCE.perimeter * FENCE.price).toBe(FENCE.cost);
    expect(1575 / 210 / 10).toBe(0.75); expect(Math.round(157.5 * 100) * 1 / 150).toBe(105); expect(15750 / 25).toBe(630);
    expect(210 * 0.75).toBe(157.5); expect(OIL.at15).toBe(105); expect(OIL.at025).toBe(630);
  });
  it('l’épreuve : 8 · 4 · 6 · 3 · 24 × x = 18, et chaque distracteur numérique est faux', () => {
    // E1 56/x = 7 : 8 ; 392 = 56 × 7 ; 49 = 56 − 7 ; 0,125 = 7/56
    expect(56 / 8).toBe(7); expect([392, 49, 0.125].map((x) => 56 / x)).not.toContain(7);
    expect(56 * 7).toBe(392); expect(56 - 7).toBe(49); expect(7 / 56).toBe(0.125);
    // E2 2,5 x = 10 : 4 ; 25 ; 7,5 ; 0,25
    expect(2.5 * 4).toBe(10); expect([25, 7.5, 0.25].map((x) => 2.5 * x)).not.toContain(10);
    expect(2.5 * 10).toBe(25); expect(10 - 2.5).toBe(7.5);
    // E3 x/0,4 = 15 : 6 ; 37,5 = 15/0,4 ; 15,4 ; 0,6
    expect(6 / 0.4).toBeCloseTo(15, 9); expect([37.5, 15.4, 0.6].map((x) => x / 0.4)).not.toContain(15); expect(15 / 0.4).toBe(37.5);
    // E4 4,8/x = 1,6 : 3 ; 7,68 = 4,8 × 1,6 ; 0,3 ; 3,2
    expect(4.8 / 3).toBeCloseTo(1.6, 9); for (const x of [7.68, 0.3, 3.2]) expect(Math.abs(4.8 / x - 1.6)).toBeGreaterThan(1e-6);
    expect(Math.round(4.8 * 1.6 * 100) / 100).toBe(7.68); expect(Math.round((4.8 - 1.6) * 10) / 10).toBe(3.2);
    // E5 24 boîtes de masse x, total 18 : 24 × x = 18 ; 18 × x = 24 est faux pour x = 0,75 ; x/24 = 18 → 432
    expect(24 * 0.75).toBe(18); expect(18 * 0.75).not.toBe(24); expect(0.75 / 24).not.toBe(18); expect(24 + 0.75).not.toBe(18);
  });
});
