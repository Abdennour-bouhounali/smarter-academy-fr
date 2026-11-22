import { describe, it, expect } from 'vitest';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, LAB, METHOD } from './textbook';
import { EX } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/** Arithmétique INDÉPENDANTE du cœur : fractions « a/b » en BigInt, réduction faite ici (gcd d'Euclide). */
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a < 0n ? -a : a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); const g = gcd(n, d) || 1n; return d < 0n ? [-n / g, -d / g] : [n / g, d / g]; };
const add = ([a, b], [c, d]) => F(a * d + c * b, b * d);
const sub = ([a, b], [c, d]) => F(a * d - c * b, b * d);
const eq = (x, y) => x[0] === y[0] && x[1] === y[1];
const f = (s) => { const [n, d = '1'] = String(s).split('/'); return F(n, d); };
/** « \\frac{a}{b} » → [a, b] ; « 3 » → [3, 1] */
const tex = (s) => { const m = /\\frac\{([\d{},]+)\}\{(\d+)\}/.exec(s); if (m) return f(`${m[1]}/${m[2]}`); return f(String(s).replace(/[^\d]/g, '')); };
/** Un cas de 2AM : l'un des deux dénominateurs divise l'autre. */
const is2am = (b, d) => (b >= d ? b % d === 0 : d % b === 0);

describe('« جمع وطرح كسرين » — les mathématiques du contenu', () => {
  it('le labo de معارف : 3/8 + 1/4 = 5/8 (8 est multiple de 4)', () => {
    expect(is2am(8, 4)).toBe(true);
    expect(eq(add(f('3/8'), f('1/4')), f(LAB.maarif.sum))).toBe(true);
  });
  it('les tâches des deux niveaux : chaque paire est un cas de 2AM, les cibles et le reste sont exacts', () => {
    const expected = { g1: ['9/12', '3/12'], g2: ['8/12', '4/12'], g3: ['4/12', '8/12'], a1: ['11/16', '5/16'], a2: ['5/20', '15/20'], a3: ['9/12', '3/12'], a4: ['11/6', null] };
    for (const lv of ['beginner', 'advanced']) {
      for (const t of LEVELS['trail-odometer'][lv].numbers.tasks) {
        let acc = t.start ? f(t.start) : f('0');
        const dens = [t.n];
        for (const leg of t.legs) {
          const neg = leg.startsWith('-');
          const p = f(leg.replace('-', ''));
          dens.push(Number(p[1]));
          acc = neg ? sub(acc, p) : add(acc, p);
        }
        for (const d of dens) expect(is2am(t.n, d), `${t.id} ${d}`).toBe(true);
        const [arrive, rest] = expected[t.id];
        expect(eq(acc, f(arrive)), `${t.id} arrivée`).toBe(true);
        if (rest) expect(eq(sub(f('1'), acc), f(rest)), `${t.id} reste`).toBe(true);
      }
    }
  });
  it('la طريقة : 7/15 + 2/5 = 13/15 ; 11/6 − 2/3 = 7/6 ; 2 + 3/8 = 19/8 ; 4/9 + 5/18 + 1/6 = 8/9', () => {
    expect(eq(add(f('7/15'), f('2/5')), f(METHOD.numbers.sum))).toBe(true);
    expect(eq(sub(f('11/6'), f('2/3')), f('7/6'))).toBe(true);
    expect(eq(add(f('2'), f('3/8')), f('19/8'))).toBe(true);
    expect(eq(add(add(f('4/9'), f('5/18')), f('1/6')), f('8/9'))).toBe(true);
    expect(is2am(18, 9) && is2am(18, 6)).toBe(true);
  });
  it('« أستعدّ » : chaque affirmation recalculée', () => {
    expect(PREP_ITEMS[0].answer).toBe(eq(add(f('3'), f('4/7')), f('25/7')));
    const P = PREP_PLATFORM_ITEMS;
    expect(P[0].answer).toBe(eq(add(f('3/10'), f('45/100')), f('75/100')));
    expect(P[1].answer).toBe(eq(sub(f('7/10'), f('25/100')), f('45/100')));
    expect(P[2].answer).toBe(eq(f('3/4'), f('9/12')));
    expect(P[3].answer).toBe(5 < 7);
    expect(P[4].answer).toBe(11 > 13);
  });
  it('les exercices : chaque clé recalculée, chaque distracteur faux', () => {
    const val = (s) => tex(s);
    const row = (ex, i) => EX[ex].question.rows[i];
    const keyOf = (ex, i) => val(row(ex, i).options[row(ex, i).correct]);
    const wrongs = (ex, i) => row(ex, i).options.filter((_, k) => k !== row(ex, i).correct).map(val);
    // ex-1 : 7/20 + 6/20 = 13/20 ; reste 7/20
    expect(keyOf('ex-1', 0)).toEqual(f('7/20'));
    expect(eq(keyOf('ex-1', 1), add(f('7/20'), f('6/20')))).toBe(true);
    expect(eq(keyOf('ex-1', 2), sub(f('1'), f('13/20')))).toBe(true);
    // ex-2 : 5/16 + 3/8 = 11/16 ; reste 5/16 ; 16 = 8 × 2
    expect(is2am(16, 8)).toBe(true);
    expect(eq(keyOf('ex-2', 1), add(f('5/16'), f('3/8')))).toBe(true);
    expect(eq(keyOf('ex-2', 2), sub(f('1'), f('11/16')))).toBe(true);
    // ex-3 : 2/7+9/14 · 5/6−7/12 · 3/4−5/8 · décimaux sur 5
    expect(eq(keyOf('ex-3', 0), add(f('2/7'), f('9/14')))).toBe(true);
    expect(eq(keyOf('ex-3', 1), sub(f('5/6'), f('7/12')))).toBe(true);
    expect(eq(keyOf('ex-3', 2), sub(f('3/4'), f('5/8')))).toBe(true);
    expect(eq(keyOf('ex-3', 3), f('(23+17)/50'.replace('(23+17)/50', '40/50')))).toBe(true);   // (2,3 + 1,7)/5 = 4/5
    // ex-4 : 1−5/8 · 7/3−2 · 3+5/12 · 2−1/6
    expect(eq(keyOf('ex-4', 0), sub(f('1'), f('5/8')))).toBe(true);
    expect(eq(keyOf('ex-4', 1), sub(f('7/3'), f('2')))).toBe(true);
    expect(eq(keyOf('ex-4', 2), add(f('3'), f('5/12')))).toBe(true);
    expect(eq(keyOf('ex-4', 3), sub(f('2'), f('1/6')))).toBe(true);
    // ex-5 : 1/2 + 3/4 = 5/4 = 1 + 1/4
    expect(eq(keyOf('ex-5', 0), add(f('1/2'), f('3/4')))).toBe(true);
    expect(eq(add(f('1'), f('1/4')), f('5/4'))).toBe(true);
    // ex-6 : 3/7 → 10/7, +1 ; 5/9 → 14/9
    expect(eq(keyOf('ex-6', 0), add(f('3/7'), f('1')))).toBe(true);
    expect(eq(sub(f('14/9'), f('5/9')), f('1'))).toBe(true);
    // les distracteurs à valeur fractionnaire sont FAUX
    for (const [ex, i, target] of [['ex-1', 0, '7/20'], ['ex-1', 1, '13/20'], ['ex-1', 2, '7/20'], ['ex-2', 1, '11/16'], ['ex-2', 2, '5/16'], ['ex-3', 0, '13/14'], ['ex-3', 1, '1/4'], ['ex-3', 2, '1/8'], ['ex-4', 0, '3/8'], ['ex-4', 1, '1/3'], ['ex-4', 2, '41/12'], ['ex-4', 3, '11/6'], ['ex-5', 0, '5/4'], ['ex-6', 0, '10/7']]) {
      for (const w of wrongs(ex, i)) expect(eq(w, f(target)), `${ex} ${i} ${w}`).toBe(false);
    }
  });
  it('l’épreuve : 3/8+1/4=5/8 · 7/10−2/5=3/10 · 1−5/9=4/9 · 13/15+4/15=17/15 · 4/15+2/5=2/3, et chaque distracteur est faux', () => {
    const cases = [
      [add(f('3/8'), f('1/4')), ['4/12', '4/8', '5/12']],
      [sub(f('7/10'), f('2/5')), ['5/5', '5/10', '3/5']],
      [sub(f('1'), f('5/9')), ['5/9', '4/8', '4/10']],
      [add(f('13/15'), f('4/15')), ['17/30', '17/225', '9/15']],
      [add(f('4/15'), f('2/5')), ['6/20', '6/15', '1/3']],
    ];
    for (const [ok, bad] of cases) for (const w of bad) expect(eq(f(w), ok), w).toBe(false);
    expect(eq(add(f('4/15'), f('2/5')), f('10/15'))).toBe(true);
    expect(eq(sub(f('1'), f('2/3')), f('1/3'))).toBe(true);
    for (const [a, b] of [[8, 4], [10, 5], [9, 1], [15, 15], [15, 5]]) expect(is2am(a, b)).toBe(true);
  });
});
