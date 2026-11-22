import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL, CONTENT } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, LAB } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les clés du درس « حساب الرابع المتناسب » recalculées avec un code INDÉPENDANT de `fourthProportional.js` : des fractions BigInt
 * (texte → { n, d }). Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX, chaque affirmation de « أستعدّ » a la vérité
 * qu'elle annonce.
 */
const gcd = (a, b) => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));
const fr = (n, d = 1n) => { const g = gcd(n, d) || 1n; const s = d < 0n ? -1n : 1n; return { n: (s * n) / g, d: (s * d) / g }; };
const mul = (p, q) => fr(p.n * q.n, p.d * q.d);
const div = (p, q) => fr(p.n * q.d, p.d * q.n);
const eq = (p, q) => p.n === q.n && p.d === q.d;
const num = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/\\,/g, '').replace(/\s/g, '').replace(/[^\d.]/g, '');
  const [i, f = ''] = t.split('.');
  return fr(BigInt(i + f), 10n ** BigInt(f.length));
};
/** Le quatrième proportionnel de [[a, c], [b, d]] selon le trou. */
const solve = (hole, { a, b, c, d }) => {
  const [A, B, C, D] = [a, b, c, d].map((x) => (x == null ? null : num(x)));
  if (hole === 'd') return div(mul(B, C), A);
  if (hole === 'c') return div(mul(A, D), B);
  if (hole === 'b') return div(mul(A, D), C);
  return div(mul(B, C), D);
};
const isTerminating = (p) => { let d = p.d; for (const k of [2n, 5n]) while (d % k === 0n) d /= k; return d === 1n; };

describe('le درس « حساب الرابع المتناسب » — clés recalculées', () => {
  it('le lecteur lui-même', () => {
    expect(eq(solve('d', { a: '5', b: '625', c: '6' }), fr(750n))).toBe(true);
    expect(eq(solve('b', { a: '3', c: '7,5', d: '12' }), num('4,8'))).toBe(true);
  });

  it('les lignes à trois options : la bonne vraie, les autres fausses (ex-12, ex-14, ex-18)', () => {
    const rows = [
      [CONTENT.MENTAL[0], '15', '6', '25'], [CONTENT.MENTAL[1], '80', '12', '100'], [CONTENT.MENTAL[2], '80', '12', '20'],
      [CONTENT.PAINT[0], '24', '6', '10'], [CONTENT.PAINT[1], '24', '6', '36'],
      [CONTENT.LEAK[0], '180', '270', '50'], [CONTENT.LEAK[1], '180', '270', '80'],
    ];
    for (const [row, a, b, c] of rows) {
      const truth = solve('d', { a, b, c });
      row.options.forEach((o, k) => expect(eq(num(o), truth), `${row.label} ${o}`).toBe(k === row.correct));
    }
    const dur = CONTENT.LEAK[2];
    const truth = div(mul(num('45'), num('180')), num('270'));
    dur.options.forEach((o, k) => expect(eq(num(o), truth), o).toBe(k === dur.correct));
  });

  it('ex-15 : chaque tableau a son trou résolu, les autres options fausses', () => {
    for (const t of CONTENT.TABLES) {
      const truth = solve(t.hole, t);
      expect(eq(truth, num(t.right)), t.label).toBe(true);
      for (const w of t.wrongs) expect(eq(num(w), truth), `${t.label} ${w}`).toBe(false);
    }
  });

  it('ex-16 : la vérité annoncée de chaque affirmation', () => {
    const rows = EXERCISES.find((e) => e.id === 'ex-16').question.rows;
    CONTENT.CLAIMS.forEach((k, i) => expect(rows[i].answer).toBe(eq(mul(num(k.a), num(k.d)), mul(num(k.b), num(k.c)))));
    expect(new Set(rows.map((r) => r.answer)).size).toBe(2);
  });

  it('act-2 et l’ouverture', () => {
    const a = EXERCISES.find((e) => e.id === 'act-2').question;
    expect(a.expected).toBe(75);
    const o = EXERCISES.find((e) => e.id === 'opener').question;
    expect(o.options[o.correct]).toBe('$35000$');
    o.options.forEach((x, k) => expect(num(x).n === 35000n, x).toBe(k === o.correct));
  });

  it('طريقة : les numéros de la solution', () => {
    const { wage3, wage9, wage7, hours } = METHOD.choose.numbers;
    expect(wage3).toBe(String(solve('d', { a: '6', b: '1260', c: '3' }).n));
    expect(wage9).toBe(String(solve('d', { a: '6', b: '1260', c: '9' }).n));
    expect(wage7).toBe(String(solve('d', { a: '6', b: '1260', c: '7' }).n));
    expect(hours).toBe(String(solve('c', { a: '6', b: '1260', d: '6300' }).n));
  });

  it('معارف : les tâches du labo posé seul', () => {
    const [t0, t1] = LAB.insert.tasks;
    expect(solve(t0.hole, t0).n).toBe(910n);
    expect(solve(t1.hole, t1).n).toBe(12n);
  });

  it('« أستعدّ » : la vérité annoncée, les deux réponses présentes', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items.map((i) => i.answer)).toEqual([true, false, true, false, true, true, false]);
    expect(items.length).toBe(7);
    // vérifications numériques
    expect(eq(div(num('4'), num('5')), num('0,8'))).toBe(true);
    expect(eq(mul(num('3'), num('1,66')), num('5'))).toBe(false);
    expect(eq(div(num('12'), num('4')), fr(3n))).toBe(true);
    const ratios = [['2', '3'], ['4', '6'], ['6', '10']].map(([x, y]) => div(num(y), num(x)));
    expect(new Set(ratios.map((r) => `${r.n}/${r.d}`)).size).toBeGreaterThan(1);
    expect(eq(solve('d', { a: '3', b: '360', c: '6' }), fr(720n))).toBe(true);
    expect(eq(solve('d', { a: '4', b: '100', c: '6' }), fr(104n))).toBe(false);
  });

  it('إختبار أولي : FINAL recalculé et littéral dans le module', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) {
      expect(f.options.length).toBeGreaterThanOrEqual(3);
      f.options.forEach((o, k) => {
        const lit = o.replace(/\\/g, '\\\\').replace(/^(?!\$)(.+)$/, '$1');
        if (f.kind === 'fourth' || f.kind === 'additive') {
          const truth = f.kind === 'additive' ? solve('d', { a: f.nums.a, b: f.nums.b, c: f.nums.e }) : solve(f.nums.hole, f.nums);
          const v = f.kind === 'additive' ? fr(num(f.nums.b).n * 0n + 980n) : truth;
          expect(eq(num(o), f.kind === 'additive' ? v : truth), `${f.id} ${o}`).toBe(k === f.correct);
          expect(src.includes(`'$${lit}$'`) || src.includes(`'$${o}$'`), `${f.id} literal ${o}`).toBe(true);
        } else if (f.kind === 'cross') {
          // x = 24 : seule la bonne égalité tient
          const [l, r] = o.split('=').map((s) => s.trim());
          const ev = (s) => { const parts = s.split(/([×+])/).map((x) => x.trim()); const val = (p) => (p === 'x' ? 24n : BigInt(p)); const vs = parts.filter((p, i) => i % 2 === 0).map(val); return parts[1] === '+' ? vs[0] + vs[1] : vs[0] * vs[1]; };
          expect(ev(l) === ev(r), `${f.id} ${o}`).toBe(k === f.correct);
        } else if (f.kind === 'route') {
          const nonTerm = o.includes('\\div 3');
          expect(!nonTerm, `${f.id} ${o}`).toBe(k === f.correct);
        }
      });
      if (f.kind === 'route') expect(isTerminating(div(num(f.nums.b), num(f.nums.a)))).toBe(false);
    }
  });

  it('la leçon : modules, الكفاءات et module d’évaluation', () => {
    expect(LESSON_CONFIG.modules.length).toBe(9);
    expect(LESSON_CONFIG.skills.length).toBe(3);
  });
});
