import { describe, it, expect } from 'vitest';
import { PREP_PLATFORM_ITEMS, LAB, METHOD } from './textbook';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/** Arithmétique INDÉPENDANTE du cœur : fractions « a/b » (a décimal permis) en BigInt, comparaison par produit en croix (côté test uniquement). */
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a < 0n ? -a : a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); const g = gcd(n, d) || 1n; return [n / g, d / g]; };
/** « 4,2/5 » → [42, 50] réduit */
const f = (s) => { const [nn, d = '1'] = String(s).split('/'); const [i, fr = ''] = nn.replace(',', '.').split('.'); return F(BigInt(i + fr), BigInt(d) * 10n ** BigInt(fr.length)); };
const cmp = ([a, b], [c, d]) => { const l = a * d; const r = c * b; return l < r ? -1 : l > r ? 1 : 0; };
const add = ([a, b], [c, d]) => F(a * d + c * b, b * d);
const eq = (x, y) => cmp(x, y) === 0;

describe('« مقارنة كسرين » — les mathématiques du contenu', () => {
  it('le labo de معارف : 2/3 = 4/6 < 5/6', () => {
    expect(eq(f(LAB.maarif.left), f(LAB.maarif.rewritten))).toBe(true);
    expect(cmp(f(LAB.maarif.left), f(LAB.maarif.right))).toBe(-1);
  });
  it('les tâches des deux niveaux : chaque verdict, chaque écriture, jamais le cas de 3AM', () => {
    const expected = { l1: -1, l2: 1, l3: 1, l4: 1, a1: 1, a3: -1, a4: 1 };
    for (const lv of ['beginner', 'advanced']) {
      for (const t of LEVELS['level-laser'][lv].numbers.tasks) {
        const [x, y] = t.tanks.map(f);
        if (t.tanks.length === 2) expect(cmp(x, y), t.id).toBe(expected[t.id]);
        const dens = t.tanks.map((s) => Number(s.split('/')[1]));
        const D = Math.max(...dens);
        for (const d of dens) expect(D % d === 0 || t.id === 'l3' || t.id === 'l4', `${t.id} ${d}|${D}`).toBe(true);
      }
    }
    // a2 : 5/9 < 2/3 < 7/9 ; 2/3 = 6/9
    const [p, q, r] = LEVELS['level-laser'].advanced.numbers.tasks[1].tanks.map(f);
    expect(cmp(q, p)).toBe(-1); expect(cmp(p, r)).toBe(-1); expect(eq(p, f('6/9'))).toBe(true);
    // a3 : 2,5/4 = 5/8 < 5,5/8 ; a1 : 5/6 = 15/18 ; l2 : 3/4 = 9/12 ; a4 : 7/5 = 14/10
    expect(eq(f('2,5/4'), f('5/8'))).toBe(true); expect(eq(f('5/6'), f('15/18'))).toBe(true); expect(eq(f('3/4'), f('9/12'))).toBe(true); expect(eq(f('7/5'), f('14/10'))).toBe(true);
    // l4 : 5/6 < 1 < 9/8
    expect(cmp(f('5/6'), f('1'))).toBe(-1); expect(cmp(f('9/8'), f('1'))).toBe(1);
  });
  it('la طريقة : les quatre pas', () => {
    expect(eq(f('7/8'), f('14/16'))).toBe(true); expect(cmp(f('14/16'), f('13/16'))).toBe(1);
    expect(eq(f('5/6'), f('10/12'))).toBe(true); expect(eq(f('2/3'), f('8/12'))).toBe(true); expect(eq(f('3/4'), f('9/12'))).toBe(true);
    const order = METHOD.numbers.order.map(f);
    expect(order.every((x, i) => i === 0 || cmp(order[i - 1], x) < 0)).toBe(true);
    expect(cmp(f('9/7'), f('1'))).toBe(1); expect(cmp(f('8/9'), f('1'))).toBe(-1);
    expect(eq(f('4,2/5'), f('8,4/10'))).toBe(true); expect(cmp(f('8,4/10'), f('8,1/10'))).toBe(1);
  });
  it('les règles de معارف', () => {
    expect(cmp(f('4/11'), f('9/11'))).toBe(-1); expect(cmp(f('7,1/6'), f('7/6'))).toBe(1);
    expect(cmp(f('7/9'), f('7/12'))).toBe(1);
    expect(eq(f('3/5'), f('12/20'))).toBe(true); expect(cmp(f('12/20'), f('11/20'))).toBe(1);
    expect(cmp(f('11/13'), f('1'))).toBe(-1); expect(cmp(f('13/12'), f('1'))).toBe(1);
  });
  it('« أستعدّ » : chaque affirmation recalculée', () => {
    const P = PREP_PLATFORM_ITEMS;
    expect(P[0].answer).toBe(eq(f('6/8'), F(6n, 8n)));
    expect(P[1].answer).toBe(eq(f('3/4'), f('75/100')));
    expect(P[2].answer).toBe(eq(f('18/24'), f('3/4')));
    expect(P[3].answer).toBe(eq(f('12/16'), f('4/5')));
    expect(P[4].answer).toBe(eq(add(f('5/12'), f('1/4')), f('2/3')));
    expect(P[5].answer).toBe(eq(add(f('1'), f('4/6')), f('10/6')));
  });
  it('l’épreuve : chaque clé et chaque distracteur', () => {
    expect(cmp(f('7/12'), f('2/3'))).toBe(-1);                            // 1 : <   (NUMONLY dirait >)
    expect(cmp(f('4/7'), f('4/9'))).toBe(1); expect(cmp(f('4/7'), f('4/11'))).toBe(1);   // 2 : 4/7 le plus grand
    expect(cmp(f('7,1/6'), f('7/6'))).toBe(1);                            // 3 : > (même dénominateur, numérateur décimal)
    const asc = [f('1/2'), f('5/8'), f('3/4')]; expect(asc[0] && cmp(asc[0], asc[1]) < 0 && cmp(asc[1], asc[2]) < 0).toBe(true);
    expect(cmp(f('3/4'), f('5/8'))).toBe(1);                              // 4 : « 3/4 < 5/8 < 1/2 » (décroissant) et « 1/2 < 3/4 < 5/8 » sont faux
    expect(cmp(f('3/4'), f('5/8')) < 0).toBe(false);
    expect(cmp(f('9/7'), f('8/9'))).toBe(1);                              // 5 : >
  });
});
