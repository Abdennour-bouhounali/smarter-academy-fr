import { describe, it, expect } from 'vitest';
import { PREP_PLATFORM_ITEMS, LAB, METHOD, GARDEN, COOP, TRIP } from './textbook';
import { EX } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/** Arithmétique INDÉPENDANTE du cœur : fractions « a/b » en BigInt, réduction faite ici (gcd d'Euclide). */
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a < 0n ? -a : a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); const g = gcd(n, d) || 1n; return d < 0n ? [-n / g, -d / g] : [n / g, d / g]; };
const add = ([a, b], [c, d]) => F(a * d + c * b, b * d);
const sub = ([a, b], [c, d]) => F(a * d - c * b, b * d);
const mul = ([a, b], [c, d]) => F(a * c, b * d);
const eq = (x, y) => x[0] === y[0] && x[1] === y[1];
const f = (s) => { const [n, d = '1'] = String(s).split('/'); return F(n, d); };
/** « \\frac{a}{b} » → [a, b] ; « 3 » → [3, 1] */
const tex = (s) => { const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(s); if (m) return f(`${m[1]}/${m[2]}`); return f(String(s).replace(/[^\d]/g, '')); };

describe('« جداء كسرين » — les mathématiques du contenu', () => {
  it('le labo de معارف : 3/4 × 2/5 = 6/20 = 3/10', () => {
    expect(eq(mul(f(LAB.maarif.curtain), f(LAB.maarif.blind)), f(LAB.maarif.reduced))).toBe(true);
    expect(eq(mul(f(LAB.maarif.curtain), f(LAB.maarif.blind)), f(LAB.maarif.product))).toBe(true);
  });
  it('les tâches des deux niveaux : chaque produit exact, le tirage tient dans le mur', () => {
    const expected = { w1: '1/2', w2: '3/10', w3: '8/15', a1: '1', a2: '3/4', a3: '7/3', a4: '6/5' };
    for (const lv of ['beginner', 'advanced']) {
      for (const t of LEVELS['window-blinds'][lv].numbers.tasks) {
        const [a, b] = t.curtain.split('/').map(Number); const [c, d] = t.blind.split('/').map(Number);
        expect(a <= b * t.W && c <= d * t.H, t.id).toBe(true);
        expect(eq(mul(f(t.curtain), f(t.blind)), f(expected[t.id])), t.id).toBe(true);
      }
    }
  });
  it('la طريقة : 3/8 de 48 = 18 ; 2/3 de 3/8 = 1/4 ; 5/7 × 2,8 = 2', () => {
    expect(eq(mul(f('3/8'), f('48')), f(String(METHOD.numbers.ofResult)))).toBe(true);
    expect(48 / 8 * 3).toBe(18);
    expect(eq(mul(f('2/3'), f('3/8')), f(METHOD.numbers.ofFractionResult))).toBe(true);
    expect(eq(mul(f('5/7'), f('28/10')), f('2'))).toBe(true);
  });
  it('« أستعدّ » : chaque affirmation recalculée', () => {
    const P = PREP_PLATFORM_ITEMS;
    expect(P[0].answer).toBe(eq(mul(f('3/10'), f('2/10')), f('6/100')));
    expect(P[1].answer).toBe(eq(mul(f('4'), f('25/100')), f('1/10')));
    expect(P[2].answer).toBe(eq(mul(f('7'), f('3/7')), f('3')));
    expect(P[3].answer).toBe(eq(mul(f('3'), f('25/10')), f('75/10')));
    expect(P[4].answer).toBe(eq(mul(f('3/4'), f('20')), f('15')));
    expect(P[5].answer).toBe(eq(sub(f('1'), f('3/8')), f('5/8')));
  });
  it('les exercices : chaque clé recalculée, chaque distracteur faux', () => {
    const row = (ex, i) => EX[ex].question.rows[i];
    const keyOf = (ex, i) => tex(row(ex, i).options[row(ex, i).correct]);
    const wrongs = (ex, i) => row(ex, i).options.filter((_, k) => k !== row(ex, i).correct).filter((o) => /\\frac/.test(o) && !/[×÷]|\\times|\\div/.test(o)).map(tex);
    // ex-1 : 11/5 × 4/3 = 44/15 ; 44 ÷ 15
    expect(eq(keyOf('ex-1', 0), f('11/5'))).toBe(true); expect(eq(keyOf('ex-1', 1), f('4/3'))).toBe(true);
    expect(eq(keyOf('ex-1', 2), mul(f('11/5'), f('4/3')))).toBe(true); expect(eq(keyOf('ex-1', 2), f('44/15'))).toBe(true);
    expect(eq(keyOf('ex-1', 3), f('44/15'))).toBe(true);
    // ex-2 : produits réduits
    expect(eq(keyOf('ex-2', 0), mul(f('3/7'), f('5/2')))).toBe(true);
    expect(eq(keyOf('ex-2', 1), mul(f('9/4'), f('2/3')))).toBe(true);
    expect(eq(keyOf('ex-2', 2), mul(f('1/6'), f('30/7')))).toBe(true);
    expect(eq(keyOf('ex-2', 3), mul(f('7/10'), f('15/14')))).toBe(true);
    // ex-3 : trois produits égaux à 2, l'intrus 3/2
    expect(eq(mul(mul(f('3/2'), f('4/9')), f('3')), f('2'))).toBe(true);
    expect(eq(mul(mul(f('1/4'), f('8/3')), f('3')), f('2'))).toBe(true);
    expect(eq(mul(f('5/6'), f('12/5')), f('2'))).toBe(true);
    expect(eq(mul(mul(f('2/5'), f('5/4')), f('3')), f('3/2'))).toBe(true);
    expect(row('ex-3', 4).correct).toBe(3);
    // ex-4 : 7/2 × 4/3 = 14/3 ; × 3/7 = 2
    expect(eq(keyOf('ex-4', 0), mul(f('7/2'), f('4/3')))).toBe(true);
    expect(eq(keyOf('ex-4', 1), mul(mul(f('7/2'), f('4/3')), f('3/7')))).toBe(true);
    // ex-5 : 4/9 × 90 = 40 ; périmètre 260 ; aire 3600
    expect(eq(mul(f('4/9'), f('90')), f('40'))).toBe(true);
    expect(keyOf('ex-5', 0)).toEqual(f('40')); expect(keyOf('ex-5', 1)).toEqual(f(String(2 * (90 + 40)))); expect(keyOf('ex-5', 2)).toEqual(f(String(90 * 40)));
    // ex-6 : moitié, double, tiers
    expect(eq(keyOf('ex-6', 0), mul(f('1/2'), f('10/11')))).toBe(true);
    expect(eq(keyOf('ex-6', 1), mul(f('2'), f('5/22')))).toBe(true);
    expect(eq(keyOf('ex-6', 2), mul(f('1/3'), f('9/14')))).toBe(true);
    // ex-7 : 4/9 de 450 = 200 ; reste 5/9 = 250 places
    expect(eq(mul(f('4/9'), f('450')), f('200'))).toBe(true);
    expect(eq(keyOf('ex-7', 1), sub(f('1'), f('4/9')))).toBe(true);
    expect(eq(mul(f('5/9'), f('450')), f('250'))).toBe(true); expect(450 - 200).toBe(250);
    // les distracteurs à valeur fractionnaire sont FAUX
    for (const [ex, i] of [['ex-1', 0], ['ex-1', 1], ['ex-1', 2], ['ex-2', 0], ['ex-2', 1], ['ex-2', 2], ['ex-2', 3], ['ex-3', 0], ['ex-3', 1], ['ex-3', 2], ['ex-3', 3], ['ex-4', 0], ['ex-4', 1], ['ex-5', 0], ['ex-6', 0], ['ex-6', 1], ['ex-6', 2], ['ex-7', 1]]) {
      for (const w of wrongs(ex, i)) expect(eq(w, keyOf(ex, i)), `${ex} ${i} ${w}`).toBe(false);
    }
  });
  it('les مسائل : les nombres de contexte', () => {
    expect(eq(mul(f(COOP.second), f(COOP.rest1)), f(COOP.secondOfAll))).toBe(true);
    expect(eq(add(f(COOP.sold1), f(COOP.secondOfAll)), f(COOP.soldAll))).toBe(true);
    expect(eq(mul(sub(f('1'), f(COOP.soldAll)), f(String(COOP.crop))), f(String(COOP.leftKg)))).toBe(true);
    expect(eq(mul(f('1/2'), sub(f('1'), f(TRIP.first))), f(TRIP.secondOfAll))).toBe(true);
    expect(eq(mul(sub(f('1'), f(TRIP.used)), f(String(TRIP.tank))), f(String(TRIP.leftL)))).toBe(true);
    expect(eq(mul(f(GARDEN.fl), f(GARDEN.fw)), f(GARDEN.fraction))).toBe(true);
    expect(GARDEN.length * GARDEN.width).toBe(GARDEN.area); expect(GARDEN.area / 2).toBe(GARDEN.roses);
    expect((2 * GARDEN.length) / 3 * ((3 * GARDEN.width) / 4)).toBe(GARDEN.roses);
  });
  it('l’épreuve : 2/5×3/7=6/35 · 4×2/9=8/9 · 3/4 de 60=45 · 2/3×9/10=3/5 · 1/2 de 2/3=1/3, et chaque distracteur est faux', () => {
    const cases = [
      [mul(f('2/5'), f('3/7')), ['5/12', '6/12', '14/15']],
      [mul(f('4'), f('2/9')), ['8/36', '6/9', '2/36']],
      [mul(f('3/4'), f('60')), ['80', '15', '57']],
      [mul(f('2/3'), f('9/10')), ['11/13', '20/27', '18/10']],
      [mul(f('1/2'), sub(f('1'), f('1/3'))), ['1/2', '1/6', '5/6']],
    ];
    for (const [ok, bad] of cases) for (const w of bad) expect(eq(f(w), ok), w).toBe(false);
    expect(eq(mul(f('2/5'), f('3/7')), f('6/35'))).toBe(true);
    expect(eq(mul(f('2/3'), f('9/10')), f('3/5'))).toBe(true);
    expect(eq(mul(f('1/2'), f('2/3')), f('1/3'))).toBe(true);
    expect(eq(mul(f('1/3'), f('1/2')), f('1/6'))).toBe(true);
  });
});
