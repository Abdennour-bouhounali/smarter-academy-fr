import { describe, it, expect } from 'vitest';
import { PREP_PLATFORM_ITEMS, LAB, METHOD, KNOWLEDGE, LIFT, FLAGS, CLAIMS } from './textbook';
import { EX } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/** Arithmétique INDÉPENDANTE du cœur : des entiers et des flottants contrôlés, aucune analyse de texte ni rationnels du cœur. */

const mass = (e, a, s, x, y = 0) => e + a * x + s * y;

describe('« اختبار صحة مساواة أو متباينة » — les mathématiques du contenu', () => {
  it('le labo : les trois tâches de مبتدئ, recalculées', () => {
    const T = LEVELS['bridge-load'].beginner.numbers.tasks;
    expect(T.map((t) => t.id)).toEqual(['b1', 'b2', 'b3']);
    // b1 : 4000 + 50x < 5000 — 15 et 22, puis 18 19 20 21 : 20 donne 5000 pile
    expect(mass(4000, 50, 0, 15)).toBe(4750); expect(mass(4000, 50, 0, 22)).toBe(5100);
    expect([18, 19, 20, 21].map((x) => mass(4000, 50, 0, x) < 5000)).toEqual([true, true, false, false]);
    expect(mass(4000, 50, 0, 20)).toBe(5000);
    expect(LAB.maarif.mass).toBe(mass(4000, 50, 0, 12)); expect(LAB.maarif.mass).toBeLessThan(LAB.maarif.limit);
    // b2 : 4500 + 50x + 40y < 7000
    expect(LAB.tasks.b2.pairs.map(([x, y, m]) => [mass(4500, 50, 40, x, y), m])).toEqual([[6700, 6700], [7000, 7000], [7150, 7150]]);
    expect(LAB.tasks.b2.pairs.map(([x, y]) => mass(4500, 50, 40, x, y) < 7000)).toEqual([true, false, false]);
    // b3 : 3000 + 70x = 3600 + 50x seulement pour x = 30
    const eq = (x) => 3000 + 70 * x === 3600 + 50 * x;
    expect([20, 30, 40].map(eq)).toEqual([false, true, false]); expect(3000 + 70 * 30).toBe(LAB.tasks.b3.mass); expect(3600 + 50 * 30).toBe(LAB.tasks.b3.mass);
    expect(Array.from({ length: 61 }, (_, x) => x).filter(eq)).toEqual([30]);
    // a1 : A < B n'est pas vraie pour x = 31 (et tout x >= 30)
    expect(3000 + 70 * 31).toBe(LAB.tasks.a1.a); expect(3600 + 50 * 31).toBe(LAB.tasks.a1.b); expect(LAB.tasks.a1.a).toBeGreaterThan(LAB.tasks.a1.b);
    // a2 : égales pour x = 10 seulement ; x = 0 les sépare
    expect(2000 + 100 * 10).toBe(2400 + 60 * 10); expect([LAB.tasks.a2.a, LAB.tasks.a2.b]).toEqual([2000 + 100 * 0, 2400 + 60 * 0]);
    // a3 : ≤ 7000, cartes
    const A = LEVELS['bridge-load'].advanced.numbers.tasks;
    expect(A.map((t) => t.id)).toEqual(['a1', 'a2', 'a3']);
    expect(LAB.tasks.a3.cards.map(([x, y, m]) => [mass(4500, 50, 40, x, y), m])).toEqual(LAB.tasks.a3.cards.map(([, , m]) => [m, m]));
    expect(LAB.tasks.a3.cards.map(([x, y]) => mass(4500, 50, 40, x, y) <= 7000)).toEqual([true, true, false, true]);
    expect(LAB.tasks.a3.pass).toEqual([0, 1, 3]);
  });
  it('معارف : les exemples', () => {
    expect([7, 5].map((x) => [3 * x + 2, 2 * x + 9])).toEqual([[23, 23], [17, 19]]);
    expect([1, 4, 0].map((x) => [x * x + 4, 5 * x])).toEqual([[5, 5], [20, 20], [4, 0]]);
    for (const x of [0, 1, 7, 12.5]) expect(2 * (x + 3)).toBe(2 * x + 6);
    expect([3, 4].map((x) => 3 + 5 * x)).toEqual([18, 23]); expect(18 < 20).toBe(true); expect(23 < 20).toBe(false);
    expect(KNOWLEDGE.test.example).toContain('17\\neq19');
  });
  it('la طريقة : les quatre lignes', () => {
    const n = METHOD.numbers;
    expect([2 * 4 + 9, 5 * 4 - 3]).toEqual([n.s1.l, n.s1.r]); expect([2 * 2 + 9, 5 * 2 - 3]).toEqual([n.s1b.l, n.s1b.r]);
    expect(3 * 4 + 2 * 6).toBe(n.s2.v); expect(3 * 6 + 2 * 4).toBe(n.s2b.v);
    expect(n.s3.map(([x]) => [4 * x - 3, 2 * x + 7])).toEqual(n.s3.map(([, l, r]) => [l, r]));
    expect(n.s3.filter(([, l, r]) => l <= r).map(([x]) => x)).toEqual([3, 4, 5]);
    expect([3 * 1 + 1, 3 * 1 * 1]).toEqual([n.s4.l, n.s4.r]);
    // le test de vérification du module 3
    expect(5 * 4 - 3).toBe(17); expect(3 * 6 + 2 * 4).toBe(26); expect(3 * 1 ** 2).toBe(3);
  });
  it('« أستعدّ » : chaque affirmation recalculée', () => {
    const P = PREP_PLATFORM_ITEMS;
    expect(P[0].answer).toBe(3 * 4 + 5 === 17);
    expect(P[1].answer).toBe(2 * 3 + 1.5 === 9); expect(2 * 3 + 1.5).toBe(7.5);
    expect(P[2].answer).toBe(-7 + 4 + 8 === 5);
    expect(P[3].answer).toBe(5 - 9 === 4);
    expect(P[4].answer).toBe(12.05 > 12.5);
    expect(P[5].answer).toBe(-3 < -1);
    expect(new Set(P.map((p) => p.answer)).size).toBe(2);
  });
  it('les exercices : chaque clé recalculée', () => {
    const rows = (id) => EX[id].question.rows;
    const keyOf = (id, i) => rows(id)[i].options[rows(id)[i].correct];
    // ex-1 : 4c = 3b + 250
    const bal = (b, c) => 4 * c === 3 * b + 250;
    expect([bal(50, 100), bal(70, 110), bal(100, 110)]).toEqual([true, false, false]);
    expect(rows('ex-1').map((_, i) => keyOf('ex-1', i))).toEqual(['صحيحة', 'خاطئة', 'خاطئة']);
    // ex-2 : 15 + 3x = 7x − 1
    expect([4, 5].map((x) => [15 + 3 * x, 7 * x - 1])).toEqual([[27, 27], [30, 34]]);
    expect(keyOf('ex-2', 0)).toContain('27$ و $27'); expect(keyOf('ex-2', 1)).toContain('30$ و $34');
    // ex-3 : 1 + x = 2x − 0,5 ; 3 + 3x = 3(x + 1)
    const e3 = [1.5, 3, 0.5].map((x) => 1 + x === 2 * x - 0.5);
    expect(e3).toEqual([true, false, false]);
    for (const x of [1.5, 3, 0.5, 7, 100]) expect(3 + 3 * x).toBe(3 * (x + 1));
    // ex-4 : toujours ?
    const alw = [(x) => x + x === 2 * x, (x) => x + x === x * x, (x) => 2 + 3 * x === 5 * x, (x) => 4 * (x + 2) === 4 * x + 8];
    expect([0, 1, 2, 3].map((x) => alw.map((f) => f(x)))).toEqual([[true, true, false, true], [true, false, true, true], [true, true, false, true], [true, false, false, true]]);
    expect(3 + 3).toBe(6); expect(3 * 3).toBe(9); expect(2 + 0).toBe(2);
    expect([0, 2].map((n) => n + n === n * n)).toEqual([true, true]); expect(1 + 1 === 1 * 1).toBe(false);
    expect([keyOf('ex-4', 0), keyOf('ex-4', 1), keyOf('ex-4', 2), keyOf('ex-4', 3)]).toEqual(['صحيحة دائمًا', 'مثال مضادّ موجود', 'مثال مضادّ موجود', 'صحيحة دائمًا']);
    // ex-5 : 4x + 3 = 13 parmi 1,5 2 2,5 3
    expect([1.5, 2, 2.5, 3].filter((x) => 4 * x + 3 === 13)).toEqual([2.5]); expect(EX['ex-5'].question.expected).toBe(2.5);
    // ex-6 : 8x − 5 < 40 − x parmi 3 4 5 6
    expect([3, 4, 5, 6].filter((x) => 8 * x - 5 < 40 - x)).toEqual([3, 4]); expect([8 * 3 - 5, 40 - 3]).toEqual([19, 37]); expect([8 * 5 - 5, 40 - 5]).toEqual([35, 35]); expect([8 * 6 - 5, 40 - 6]).toEqual([43, 34]);
    expect(keyOf('ex-6', 3)).toBe('$3$ و $4$');
    // ex-7 : 3x + 2 et 5x − 6 pour x = 0 … 8
    expect(Array.from({ length: 9 }, (_, x) => x).filter((x) => 3 * x + 2 === 5 * x - 6)).toEqual([4]);
    expect([2, 3, 5].map((x) => [3 * x + 2, 5 * x - 6])).toEqual([[8, 4], [11, 9], [17, 19]]); expect(EX['ex-7'].question.expected).toBe(4);
  });
  it('les مسائل : les nombres de contexte', () => {
    expect([70 * LIFT.ok.x + LIFT.box, 70 * LIFT.no.x + LIFT.box]).toEqual([LIFT.ok.mass, LIFT.no.mass]);
    expect(Array.from({ length: 12 }, (_, x) => x).filter((x) => 70 * x + 45 <= 630).pop()).toBe(8);
    for (const [x, assoc, school] of FLAGS.tests) { expect(6 * x + 900).toBe(assoc); expect(10 * x).toBe(school); }
    expect(FLAGS.tests.filter(([, a, s]) => a === s).map(([x]) => x)).toEqual([FLAGS.price]); expect(10 * FLAGS.price).toBe(FLAGS.paid);
    const [a, b, c] = CLAIMS.nums;
    expect(a + b + c).toBe(CLAIMS.sum); expect(3 * CLAIMS.middle).toBe(CLAIMS.sum); expect(a * b * c).toBe(CLAIMS.product); expect(CLAIMS.middle ** 3).toBe(CLAIMS.cube); expect(CLAIMS.product).not.toBe(CLAIMS.cube);
    for (const n of [1, 2, 7, 40]) expect((n - 1) + n + (n + 1)).toBe(3 * n);
  });
  it("l'épreuve : x = 3 ; vrai ; {2} ; faux ; un seul exemple, et chaque distracteur est faux", () => {
    // E1 5x − 4 = 3x + 2
    expect([3, 2, 1, 6].map((x) => 5 * x - 4 === 3 * x + 2)).toEqual([true, false, false, false]);
    // E2 2x + y = 13 à (4 ; 5), et la version échangée
    expect(2 * 4 + 5).toBe(13); expect(2 * 5 + 4).toBe(14);
    // E3 6x − 1 < 2x + 11 parmi 2 3 4
    expect([3, 4].filter((x) => 6 * x - 1 < 2 * x + 11)).toEqual([]);
    // E4 x² et 2x : égales en 2, pas en 3
    expect([2, 3].map((x) => [x * x, 2 * x])).toEqual([[4, 4], [9, 6]]);
  });
});
