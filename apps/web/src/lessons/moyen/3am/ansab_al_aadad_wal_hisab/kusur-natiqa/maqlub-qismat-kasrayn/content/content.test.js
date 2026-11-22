import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL, RECIPS, MENTAL, SIMPLIFY, SIMPLE, COMPUTE } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD } from './textbook';

/**
 * Les clés du درس « مقلوب عدد وقسمة كسرين » recalculées avec un code INDÉPENDANT de `powers.js` / `fractions3.js` : des rationnels en BigInt. Chaque bonne réponse est
 * vérifiée vraie, chaque distracteur FAUX ; chaque option d'une épreuve du إختبار أولي est présente LITTÉRALEMENT dans Module08Itqan.jsx.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const div = (p, q) => { if (q.n === 0n) throw new Error('÷ 0'); return R(p.n * q.d, p.d * q.n); };
const same = (p, q) => p.n === q.n && p.d === q.d;
/** « 3/8 », « 0,04 », « 9 » → rationnel. */
const num = (s) => {
  const t = String(s).replace(/−/g, '-').replace(',', '.').trim();
  const f = /^(-?\d+)\/(\d+)$/.exec(t);
  if (f) return R(BigInt(f[1]), BigInt(f[2]));
  const [i, fr = ''] = t.split('.');
  return R(BigInt(i + fr), 10n ** BigInt(fr.length));
};
/** Une option LaTeX → rationnel : « $\frac{3}{8}$ », « $-\frac{3}{8}$ », « $0{,}38$ », « $15$ ». */
const opt = (o) => {
  const t = String(o).replace(/^\$|\$$/g, '').replace(/\{,\}/g, ',').trim();
  const m = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(t);
  if (m) return R(BigInt(`${m[1]}${m[2]}`), BigInt(m[3]));
  return num(t);
};
const inv = (p) => div(R(1n), p);
const rows = (id) => EXERCISES.find((e) => e.id === id).question.rows;

describe('le درس « مقلوب عدد وقسمة كسرين » — clés recalculées', () => {
  it('ex-1 : les مقلوبات — x · y = 1, chaque distracteur faux', () => {
    RECIPS.forEach((r, i) => {
      const x = num(r.x);
      const row = rows('ex-1')[i];
      row.options.forEach((o, k) => {
        const y = opt(o);
        expect(same(mul(x, y), R(1n)), `${r.x} ${o}`).toBe(k === row.correct);
      });
    });
  });

  it('act-1 : les divisions de la bande et de la fresque', () => {
    const data = [['3/5', '2'], ['5/6', '5'], ['4', '2/3'], ['5/6', '5/4'], ['9/10', '3/5']];
    data.forEach(([p, q], i) => {
      const row = rows('act-1')[i];
      const truth = div(num(p), num(q));
      row.options.forEach((o, k) => expect(same(opt(o), truth), `${p} ÷ ${q} ${o}`).toBe(k === row.correct));
    });
  });

  it('ex-4 : produits mentaux ; ex-5 : produits à simplifier ; ex-6 et ex-7 : divisions', () => {
    MENTAL.forEach((row, i) => {
      const [p, q] = [['8/3', '3/8'], ['5/7', '14/15'], ['9/4', '4/9']][i];
      const t = mul(num(p), num(q));
      row.options.forEach((o, k) => expect(same(opt(o), t), `${p}×${q} ${o}`).toBe(k === row.correct));
    });
    SIMPLIFY.forEach(([p, q], i) => {
      const t = mul(num(p), num(q));
      rows('ex-5')[i].options.forEach((o, k) => expect(same(opt(o), t), `${p}×${q} ${o}`).toBe(k === rows('ex-5')[i].correct));
    });
    [['ex-6', SIMPLE], ['ex-7', COMPUTE]].forEach(([id, list]) => list.forEach(([p, q], i) => {
      const t = div(num(p), num(q));
      rows(id)[i].options.forEach((o, k) => expect(same(opt(o), t), `${id} ${p}÷${q} ${o}`).toBe(k === rows(id)[i].correct));
    }));
  });

  it('deep-59 : la largeur 21/8 ÷ 7/2 est 3/4 (irréductible)', () => {
    const t = div(num('21/8'), num('7/2'));
    expect(t).toEqual({ n: 3n, d: 4n });
    const ex = EXERCISES.find((e) => e.id === 'deep-59');
    expect(same(num(ex.question.expected), t)).toBe(true);
    // le rectangle : longueur × largeur = aire
    expect(same(mul(num('7/2'), t), num('21/8'))).toBe(true);
  });

  it('chaque exercice a UNE bonne option et des distracteurs distincts', () => {
    for (const ex of EXERCISES.filter((e) => e.question.rows)) {
      for (const r of ex.question.rows) {
        expect(new Set(r.options).size).toBe(r.options.length);
        expect(r.options.length).toBeGreaterThanOrEqual(2);
        expect(r.correct).toBeLessThan(r.options.length);
      }
    }
  });

  it('إختبار أولي : chaque clé recalculée, chaque distracteur faux, chaque option littérale dans le module', () => {
    const source = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) {
      const t = f.truth.kind === 'recip' ? inv(num(f.truth.x)) : div(num(f.truth.p), num(f.truth.q));
      f.options.forEach((o, k) => {
        expect(same(opt(o), t), `${f.id} ${o}`).toBe(k === f.correct);
        expect(source, `${f.id} option ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      });
    }
    expect(FINAL).toHaveLength(5);
  });

  it('طريقة : les trois enchaînements sont justes', () => {
    expect(div(num('14/15'), num('21/10'))).toEqual({ n: 4n, d: 9n });
    expect(div(num('3/4'), num('9/8'))).toEqual({ n: 2n, d: 3n });
    expect(div(num('5/6'), num('10'))).toEqual({ n: 1n, d: 12n });
    expect(div(num('12'), num('3/4'))).toEqual({ n: 16n, d: 1n });
    expect(METHOD.simplify.solution).toHaveLength(3);
    // pièges : retourner le premier et « 0,33 est le مقلوب de 3 »
    expect(same(mul(inv(num('2/9')), num('3/4')), div(num('2/9'), num('3/4')))).toBe(false);
    expect(same(mul(num('3'), num('0,33')), R(1n))).toBe(false);
  });

  it('« أستعدّ » : les affirmations sont vraies ou fausses comme annoncé', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items).toHaveLength(6);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    expect(same(mul(num('3/5'), num('10/9')), num('2/3'))).toBe(true); // 1 vrai
    expect(same(mul(num('4/7'), num('3')), num('12/21'))).toBe(false); // 2 faux (12/7)
    expect(same(mul(num('5/6'), num('9/10')), num('3/4'))).toBe(true); // 3 vrai
    expect(num('35').n === 7n * 5n).toBe(true); // 4
    expect(-24n / 6n).toBe(-4n); // 5 vrai
    expect(-18n / -3n).toBe(6n); // 6 faux : le quotient est 6
  });
});
