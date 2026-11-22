import { describe, it, expect } from 'vitest';
import { PREP_PLATFORM_ITEMS, LAB, METHOD, POOL, ROPE, MAGIC } from './textbook';
import { EX } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/** Arithmétique INDÉPENDANTE du cœur : des entiers et des fermetures, aucune analyse de texte ni rationnels du cœur. */
// le DESSIN du rang : on compte les sommets-arêtes d'hexagones sur le treillis (pas la formule) — la logique du labo est testée à part
const rods = (n, strip = false) => {
  const keys = new Set();
  const cell = (cx, cy) => { const v = [[cx, cy - 2], [cx + 1, cy - 1], [cx + 1, cy + 1], [cx, cy + 2], [cx - 1, cy + 1], [cx - 1, cy - 1]]; v.forEach((a, i) => { const b = v[(i + 1) % 6]; keys.add([a.join(','), b.join(',')].sort().join('|')); }); };
  for (let i = 0; i < n; i += 1) { cell(2 * i, 0); if (strip) cell(2 * i + 1, 3); }
  return keys.size;
};

describe('« إنتاج عبارة حرفية » — les mathématiques du contenu', () => {
  it('le labo : 6, 11, 16 ; 5n + 1 pour n ≤ 8 ; 201 pour 40 ; la bande 8n + 3 ; 66', () => {
    expect([1, 2, 3].map((n) => rods(n))).toEqual([6, 11, 16]);
    for (let n = 1; n <= 8; n += 1) { expect(rods(n)).toBe(5 * n + 1); expect(rods(n, true)).toBe(8 * n + 3); }
    expect(5 * LAB.far.n + 1).toBe(LAB.far.rods); expect(LAB.far.rods).toBe(201); expect(LAB.far.rods).toBeGreaterThan(50);
    expect(5 * LAB.maarif.n + 1).toBe(LAB.maarif.rods); expect(rods(LAB.maarif.n)).toBe(31);
    expect(LAB.strip.counts).toEqual([1, 2, 3].map((n) => rods(n, true)));
    expect(5 * LAB.two.n + 1 + 8 * LAB.two.m + 3).toBe(LAB.two.rods); expect(rods(6) + rods(4, true)).toBe(66);
    // les deux écritures du même décompte donnent le même tableau
    for (let n = 1; n <= 8; n += 1) expect(6 + 5 * (n - 1)).toBe(5 * n + 1);
    // les règles fausses se séparent du dessin dès n = 2 (6n) ou n = 1 (5n)
    expect(6 * 2).not.toBe(rods(2)); expect(5 * 1).not.toBe(rods(1));
  });
  it('les tâches des deux niveaux : cadre de 8, bande de 6, valeur lointaine hors du cadre', () => {
    for (const lv of ['beginner', 'advanced']) for (const t of LEVELS['wax-cells'][lv].numbers.tasks) {
      const max = t.strip ? 6 : 8;
      for (const n of t.targets) expect(n >= 1 && n <= max, t.id).toBe(true);
    }
    expect(LEVELS['wax-cells'].beginner.numbers.tasks.find((t) => t.far).far).toBe(40);
    expect(LEVELS['wax-cells'].advanced.numbers.tasks.find((t) => t.kind === 'two').pair).toEqual([6, 4]);
  });
  it('la طريقة : 35 + x ; 6x ; 2x + 7 ; le contour 4n + 4 = 4(n + 1) ; 3x + 5 en 4 → 17', () => {
    for (let n = 1; n <= 12; n += 1) expect(4 * n + 4).toBe(4 * (n + 1));
    expect(4 * 5 + 4).toBe(24); expect(4 * 6).toBe(24);
    expect(3 * 4 + METHOD.numbers.programAt4 - 17).toBe(12);
    expect(3 * 4 + 5).toBe(METHOD.numbers.programAt4);
    expect(2 * 5 + 7).toBe(17);
    expect(2 * 3 + 5 * 3 - 3 * 3).toBe(4 * 3);                // 2a + 5a − 3a = 4a
    expect(10 * 10).toBe(100); expect(10 * 10 * 10).toBe(1000);
  });
  it('« أستعدّ » : chaque affirmation recalculée', () => {
    const P = PREP_PLATFORM_ITEMS;
    expect(P[0].answer).toBe(40 - 12 - 8 === 20);
    expect(P[1].answer).toBe(40 - (12 - 8) === 20);
    expect(P[2].answer).toBe(15 + 3 * 4 === 72);
    expect(P[3].answer).toBe(true);                           // 5 × (8 + 2) : dernière opération = ×
    expect([0, 1, 2, 5, 9].every((x) => 4 * (x + 3) === 4 * x + 12)).toBe(P[4].answer);
    expect(P[5].answer).toBe(false);                          // a + b, pas a × b
    expect(new Set(P.map((p) => p.answer)).size).toBe(2);
  });
  it('les exercices : chaque clé recalculée, chaque distracteur numérique faux', () => {
    const row = (ex, i) => EX[ex].question.rows[i];
    const key = (ex, i) => row(ex, i).options[row(ex, i).correct];
    const num = (s) => Number(String(s).replace(/[^0-9,]/g, '').replace(',', '.'));
    // ex-1 : les chaises 6n + 2
    const chairs = (n) => 6 * n + 2;
    expect([1, 2, 10, 51].map((n, i) => num(key('ex-1', i)))).toEqual([chairs(1), chairs(2), chairs(10), chairs(51)]);
    expect([chairs(1), chairs(2), chairs(10), chairs(51)]).toEqual([8, 14, 62, 308]);
    expect(key('ex-1', 4)).toBe('$6n+2$');
    for (const [i, n] of [[0, 1], [1, 2], [2, 10], [3, 51]]) for (const o of row('ex-1', i).options.filter((x, k) => k !== row('ex-1', i).correct)) expect(num(o), `ex-1 ${n}`).not.toBe(chairs(n));
    // 8n n'est pas la bonne règle : à n = 2 il donne 16
    expect(8 * 2).not.toBe(chairs(2));
    // ex-4 : 2x + 7 en 6,5 = 20 ; 13,7 = x + 7 ; 26,5 = (x²)…  (6,5 + 7 = 13,5, pas 13,7)
    expect(2 * 6.5 + 7).toBe(20); expect(num(key('ex-4', 1))).toBe(20);
    expect(6.5 + 7).not.toBe(13.7);
    // ex-5 : A = 4x + 3 ; B = 3x + 2y
    const A = (x) => 4 * x + 3;
    expect([0, 2, 2.5].map(A)).toEqual([3, 11, 13]);
    expect([0, 1, 2].map((i) => num(key('ex-5', i)))).toEqual([3, 11, 13]);
    expect(3 * 4 + 2 * 5).toBe(22); expect(num(key('ex-5', 3))).toBe(22);
    for (const [i, x] of [[0, 0], [1, 2], [2, 2.5]]) for (const o of row('ex-5', i).options.filter((_, k) => k !== row('ex-5', i).correct)) expect(num(o), `ex-5 ${x}`).not.toBe(A(x));
    // ex-3 : (4x + 6) / 2 prise au sérieux : pour x = 5 → 13 ; 4x + 6/2 → 23 ; 4x/2 + 6 → 16
    expect((4 * 5 + 6) / 2).toBe(13); expect(4 * 5 + 6 / 2).toBe(23); expect((4 * 5) / 2 + 6).toBe(16);
    // ex-6 : simplifications, recomptées
    for (const x of [0, 1, 2, 5]) { expect(1 * x + 0 * 7).toBe(x); expect(2 * x + 3 * x + x).toBe(6 * x); expect(x * x * 5).toBe(5 * x ** 2); }
    expect(3 * 2 * 5).toBe(30);                                   // 3 × a × b en (a, b) = (2, 5) = 3ab
    for (const x of [2, 3]) { expect(2 * x + 3 * x + x).not.toBe(5 * x ** 2); expect(x * x * 5).not.toBe(5 * x); }
  });
  it('les مسائل : les nombres de contexte', () => {
    expect(POOL.fee + POOL.session * 10).toBe(POOL.values[10]); expect(POOL.fee + POOL.session * 25).toBe(POOL.values[25]); expect(POOL.fee + POOL.session * 50).toBe(POOL.values[50]);
    for (const x of [0, 1, 2]) expect(POOL.fee + POOL.session * x).toBe(POOL.table[x]);
    expect(ROPE.length / 2).toBe(ROPE.half); expect(5 * (12 - 5)).toBe(ROPE.at[5]); expect(6 * (12 - 6)).toBe(ROPE.at[6]);
    for (const x of [3, 10, 0]) expect(2 * (x + 4) - 2 * x).toBe(MAGIC.at[x]);
    expect(MAGIC.simplified).toBe(8);
  });
  it('l’épreuve : 4x · 19 · 7a · 61 · 2x, et chaque distracteur numérique est faux', () => {
    // 2x² + 1 en 3 : 19 ; (2x)² + 1 = 37 ; x² lu 2x : 2 × (2x) + 1 = 13 ; 2x + 1 = 7
    expect(2 * 3 ** 2 + 1).toBe(19); expect((2 * 3) ** 2 + 1).toBe(37); expect(2 * (2 * 3) + 1).toBe(13); expect(2 * 3 + 1).toBe(7);
    // 5n + 1 en 12 : 61 ; 6n = 72 ; 5n = 60 ; « 5n » lu 5 et 12 : 512 + 1 = 513
    expect(5 * 12 + 1).toBe(61); expect(6 * 12).toBe(72); expect(5 * 12).toBe(60); expect(Number(`5${12}`) + 1).toBe(513);
    expect([72, 60, 513]).not.toContain(61);
    // 3a + 4a = 7a ; 7a² ≠ 7a ; 12a ≠ 7a pour a = 2, 3
    for (const a of [2, 3]) { expect(3 * a + 4 * a).toBe(7 * a); expect(7 * a * a).not.toBe(7 * a); expect(12 * a).not.toBe(7 * a); expect(7 + a).not.toBe(7 * a); }
    // 5 × x × 0 + 2 × x = 2x ; 7x et 0 et 2 sont faux pour x = 4
    expect(5 * 4 * 0 + 2 * 4).toBe(8); expect([7 * 4, 0, 2]).not.toContain(8);
    // le périmètre d'un carré : 4x ; x⁴, x + 4 et 4 + 4x sont faux pour x = 3
    expect(4 * 3).toBe(12); expect([3 ** 4, 3 + 4, 4 + 4 * 3]).not.toContain(12);
  });
});
