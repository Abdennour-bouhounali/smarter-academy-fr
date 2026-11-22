import { describe, it, expect } from 'vitest';
import { LAB, METHOD, PREP_ITEMS, PREP_PLATFORM_ITEMS, OIL, CLUB, TANK } from './textbook';
import { EX } from './exercises';

/** Arithmétique INDÉPENDANTE du cœur : un décimal « 15,96 » → { n: BigInt, k } ; la division est faite chiffre par chiffre (BigInt). */
const dec = (s) => { const [i, f = ''] = String(s).split(','); return { n: BigInt(i + f), k: f.length }; };
const P = (k) => 10n ** BigInt(k);
/** floor(a / b × 10^r) : a, b décimaux. */
const floorQ = (a, b, r) => { const A = dec(a); const B = dec(b); return (A.n * P(B.k + r)) / (B.n * P(A.k)); };
const exactQ = (a, b, r) => { const A = dec(a); const B = dec(b); return (A.n * P(B.k + r)) % (B.n * P(A.k)) === 0n; };
const show = (n, r) => { const s = n.toString().padStart(r + 1, '0'); return r === 0 ? s : `${s.slice(0, -r)},${s.slice(-r)}`; };
/** « a ÷ b » encadré à 10^-r : [lo, hi] (hi = lo si exact). */
const bracket = (a, b, r) => { const lo = floorQ(a, b, r); return [show(lo, r), show(exactQ(a, b, r) ? lo : lo + 1n, r)]; };
/** b × q < a ? = ? > ? */
const cmp = (a, b, q) => { const A = dec(a); const B = dec(b); const Q = dec(q); const k = B.k + Q.k; const m = Math.max(k, A.k); const lhs = B.n * Q.n * P(m - k); const rhs = A.n * P(m - A.k); return lhs < rhs ? -1 : lhs === rhs ? 0 : 1; };
const val = (s) => Number(s.replace(',', '.'));

describe('« الكسر: نسبة وحاصل قسمة وقيم مقرّبة » — les mathématiques du contenu', () => {
  it('le labo : 8 ÷ 3 = 2,66… (jamais exact), 9 ÷ 4 = 2,25 (exact), 4,6 ÷ 0,7 = 46 ÷ 7', () => {
    expect(bracket('8', '3', 2)).toEqual([LAB.share.lo, LAB.share.hi]);
    expect(exactQ('8', '3', 2)).toBe(false);
    expect(bracket(LAB.share.exact.a, LAB.share.exact.b, 2)).toEqual([LAB.share.exact.q, LAB.share.exact.q]);
    expect(exactQ('9', '4', 2)).toBe(true);
    expect(bracket(LAB.count.a, LAB.count.b, 2)).toEqual([LAB.count.lo, LAB.count.hi]);
    expect(floorQ('4,6', '0,7', 0)).toBe(floorQ('46', '7', 0));
    expect(bracket('4,6', '0,7', 1)).toEqual(bracket('46', '7', 1));
  });
  it('معارف : 10 ÷ 7 : 1,4|1,5 puis 1,42|1,43 (7 × 1,42 = 9,94 ; 7 × 1,43 = 10,01)', () => {
    const m = LAB.maarif;
    expect(bracket(m.a, m.b, 1)).toEqual([m.lo1, m.hi1]);
    expect(bracket(m.a, m.b, 2)).toEqual([m.lo, m.hi]);
    expect(cmp('10', '7', m.lo)).toBe(-1);
    expect(cmp('10', '7', m.hi)).toBe(1);
    expect(show(dec('7').n * dec(m.lo).n, 2)).toBe(m.prodLo);
    expect(show(dec('7').n * dec(m.hi).n, 2)).toBe(m.prodHi);
  });
  it('la طريقة : 12,5 ÷ 0,35 = 1250 ÷ 35 ; 35,7|35,8 puis 35,71|35,72 ; 7/8 = 0,875 ; 5/6 : 0,83|0,84 ; 18/45 = 2/5 = 0,4', () => {
    const n = METHOD.numbers;
    expect(Number(dec(n.a).n) * 10 ** (2 - dec(n.a).k)).toBe(n.a10);
    expect(Number(dec(n.b).n) * 10 ** (2 - dec(n.b).k)).toBe(n.b10);
    expect(bracket(n.a, n.b, 1)).toEqual([n.lo1, n.hi1]);
    expect(bracket(n.a, n.b, 2)).toEqual([n.lo2, n.hi2]);
    expect(bracket(String(n.a10), String(n.b10), 2)).toEqual([n.lo2, n.hi2]);
    expect(exactQ('7', '8', 3)).toBe(true);
    expect(show(floorQ('7', '8', 3), 3)).toBe(METHOD.decimalOrNot.yes.value);
    expect(exactQ('5', '6', 12)).toBe(false);
    expect(bracket('5', '6', 2)).toEqual([METHOD.decimalOrNot.no.lo, METHOD.decimalOrNot.no.hi]);
    expect(exactQ('18', '45', 1)).toBe(true);
    expect(show(floorQ('18', '45', 1), 1)).toBe(METHOD.ratio.value);
  });
  it('« أستعدّ » : chaque affirmation recalculée', () => {
    const byText = (list, i) => list[i].answer;
    expect(byText(PREP_ITEMS, 1)).toBe(exactQ('27', '12', 2));          // 27/12 = 2,25
    expect(byText(PREP_ITEMS, 2)).toBe(false);                           // 9 × (9/4) ≠ 4 : c'est 4/9
    expect(byText(PREP_ITEMS, 3)).toBe(12 * 7 === 3 * 28);               // 12/28 = 3/7
    expect(byText(PREP_ITEMS, 4)).toBe(show(floorQ('5', '8', 3), 3) === '0,625');
    expect(byText(PREP_PLATFORM_ITEMS, 0)).toBe(floorQ('47', '5', 0) === 9n);
    expect(byText(PREP_PLATFORM_ITEMS, 1)).toBe(floorQ('7,2', '4', 0) === 2n);   // 1,8 : entre 1 et 2
    expect(new Set([...PREP_ITEMS, ...PREP_PLATFORM_ITEMS].map((i) => i.answer))).toEqual(new Set([true, false]));
  });
  it('les exercices : chaque clé recalculée, chaque distracteur faux', () => {
    // ex-2
    expect(exactQ('150', '7', 6)).toBe(false);
    expect(bracket('150', '7', 2)).toEqual(['21,42', '21,43']);
    expect(show(floorQ('3', '12', 2), 2)).toBe('0,25');
    expect(exactQ('3', '12', 2)).toBe(true);
    // ex-3
    expect(floorQ('63', '2,1', 0)).toBe(30n);
    expect(floorQ('8,4', '0,12', 0)).toBe(70n);
    // ex-4 : = ou ≠
    const eqRows = [['3', '8', '0,375'], ['2', '3', '0,66'], ['9', '4', '2,25'], ['5', '11', '0,45']];
    expect(EX['ex-4'].question.rows.map((r) => r.answer)).toEqual(eqRows.map(([a, b, q]) => cmp(a, b, q) === 0));
    // ex-5
    expect(floorQ('3,6', '0,9', 0)).toBe(4n);
    expect(show(floorQ('9,1', '3,5', 1), 1)).toBe('2,6'); expect(exactQ('9,1', '3,5', 1)).toBe(true);
    expect(floorQ('441,6', '2,3', 0)).toBe(192n);
    expect(floorQ('44,16', '0,23', 0)).toBe(192n);
    expect(floorQ('4416', '0,23', 0)).toBe(19200n);
    // ex-6
    const inside = (a, b) => cmp(String(a), String(b), '2,71') === 1 && cmp(String(a), String(b), '2,72') === -1;
    expect(EX['ex-6'].question.rows.slice(0, 5).map((r) => r.answer)).toEqual([[543, 200], [19, 7], [87, 32], [27, 10], [11, 4]].map(([a, b]) => floorQ(String(a), String(b), 2) === 271n));
    void inside;
    expect(EX['ex-6'].question.rows.map((r) => r.answer)).toEqual([true, true, true, false, false, floorQ('19', '7', 0) === 2n, floorQ('4', '3', 0) === 2n]);
    expect(floorQ('10', '7', 2)).toBe(142n); expect(exactQ('10', '7', 8)).toBe(false);
    expect(5n * 3n * 12n).toBe(15n * 12n);   // 5/12 = 15/36
    for (const e of Object.values(EX)) for (const a of [].concat(e.alsoSource ?? [])) expect(a.type).toBe('textbook');
  });
  it('مسألة 1 : 10/3 = 3,33…, 3,33|3,34, la fiole de 3,3 L ne suffit pas, celle de 3,5 L suffit', () => {
    expect(bracket(String(OIL.litres), String(OIL.families), 2)).toEqual([OIL.lo, OIL.hi]);
    expect(cmp('10', '3', OIL.bottleSmall)).toBe(-1);     // 3 × 3,3 < 10 : il reste de l'huile hors de la fiole
    expect(cmp('10', '3', OIL.bottleBig)).toBe(1);
    expect(exactQ('10', '3', 8)).toBe(false);
  });
  it('مسألة 2 : 25 ÷ 1,5 = 250/15 = 50/3 = 16,6…, 16,6|16,7, 17 km impossible', () => {
    expect(bracket(String(CLUB.km), CLUB.hours, 1)).toEqual([CLUB.lo, CLUB.hi]);
    expect(bracket('250', '15', 1)).toEqual([CLUB.lo, CLUB.hi]);
    expect(250n * 3n).toBe(50n * 15n);
    expect(cmp(String(CLUB.km), CLUB.hours, String(CLUB.target))).toBe(1);   // 1,5 × 17 > 25 : 17 km/h est plus que 25 km en 1,5 h
  });
  it('مسألة 3 : 1000 ÷ 1,5 = 666,6… : 666 pleines, 667 nécessaires', () => {
    expect(bracket(String(TANK.litres), TANK.bottle, 1)).toEqual([TANK.lo, TANK.hi]);
    expect(floorQ(String(TANK.litres), TANK.bottle, 0)).toBe(BigInt(TANK.full));
    expect(TANK.needed).toBe(TANK.full + 1);
    expect(15 * 666 < 10000 && 10000 < 15 * 667).toBe(true);
  });
  it('l’épreuve : 11/6 → 1,8 (1,9 / 1,5 / 1,83 ne sont pas la valeur par défaut à 0,1) ; 3,6 ÷ 0,08 = 45 ; 5/7 : 0,71|0,72 et les deux autres sont FAUX ; 9/8 décimal ; 9/36 = 0,25', () => {
    expect(bracket('11', '6', 1)).toEqual(['1,8', '1,9']);
    expect(floorQ('3,6', '0,08', 0)).toBe(45n);
    expect(['4,5', '0,45', '450'].every((v) => !(val(v) === 45))).toBe(true);
    expect(bracket('5', '7', 2)).toEqual(['0,71', '0,72']);
    expect(cmp('5', '7', '0,72')).toBe(1);                  // 7 × 0,72 = 5,04 > 5 : 0,72 < 5/7 est FAUX
    expect(cmp('5', '7', '0,71')).toBe(-1);                 // 7 × 0,71 = 4,97 < 5 : 5/7 < 0,71 est FAUX
    expect([['9', '8'], ['5', '6'], ['4', '3'], ['7', '9']].map(([a, b]) => exactQ(a, b, 12))).toEqual([true, false, false, false]);
    expect(show(floorQ('9', '36', 2), 2)).toBe('0,25'); expect(exactQ('9', '36', 2)).toBe(true);
    expect(cmp('9', '27', '0,25') !== 0).toBe(true);
  });
});
