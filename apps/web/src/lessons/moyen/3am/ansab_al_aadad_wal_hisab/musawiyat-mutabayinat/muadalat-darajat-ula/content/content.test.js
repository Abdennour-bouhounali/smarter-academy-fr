import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL, SOLVE, TESTS } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, LAB } from './textbook';

/**
 * Les clés du درس « المعادلات من الدرجة الأولى بمجهول واحد » recalculées avec un code INDÉPENDANT de `linear.js` : des rationnels en BigInt et un petit
 * évaluateur d'expressions du premier degré. Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (p, q) => R(p.n * q.d + q.n * p.d, p.d * q.d);
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const neg = (p) => R(-p.n, p.d);
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const same = (p, q) => p.n === q.n && p.d === q.d;
const num = (t) => { const s = t.trim().replace(/−/g, '-'); if (s.includes('/')) { const [a, b] = s.split('/'); return div(num(a), num(b)); } return R(BigInt(s)); };
function lin(src) {
  const s = src.replace(/\s+/g, '').replace(/−/g, '-');
  let a = R(0n); let b = R(0n);
  for (const t of s.match(/[+-]?[^+-]+/g)) {
    const sign = t.startsWith('-') ? R(-1n) : R(1n);
    const body = t.replace(/^[+-]/, '');
    if (body.includes('x')) { const c = body.replace('x', ''); a = add(a, mul(sign, c === '' ? R(1n) : num(c))); } else b = add(b, mul(sign, num(body)));
  }
  return { a, b };
}
const at = (P, x) => add(mul(P.a, x), P.b);
const solveEq = (l, r) => { const L = lin(l); const Rr = lin(r); return div(add(Rr.b, neg(L.b)), add(L.a, neg(Rr.a))); };
/** « $x = -2$ » ou « $x = \dfrac{1}{3}$ » → rationnel. */
const xValue = (o) => { const t = String(o).replace(/^\$x\s*=\s*|\$$/g, '').replace(/\\dfrac\{(-?\d+)\}\{(\d+)\}/g, '$1/$2').replace(/-\\dfrac\{(\d+)\}\{(\d+)\}/g, '-$1/$2').replace(/\s+/g, ''); return num(t); };

describe('le درس « المعادلات من الدرجة الأولى » — clés recalculées', () => {
  it('ex-34 : chaque équation a sa solution, chaque distracteur la rend fausse', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-34');
    SOLVE.forEach((d, i) => {
      const truth = solveEq(d.left, d.right);
      expect(same(at(lin(d.left), truth), at(lin(d.right), truth))).toBe(true);
      ex.question.rows[i].options.forEach((o, k) => expect(same(xValue(o), truth), `${d.left} = ${d.right} : ${o}`).toBe(k === ex.question.rows[i].correct));
    });
  });

  it('ex-33 : chaque candidat est une solution ou non (calcul des deux membres)', () => {
    const rows = EXERCISES.find((e) => e.id === 'ex-33').question.rows;
    TESTS.forEach((t, i) => {
      const x = num(t.x);
      expect(same(at(lin(t.left), x), at(lin(t.right), x)), `${t.left} ${t.x}`).toBe(t.answer);
      expect(rows[i].answer).toBe(t.answer);
    });
  });

  it('ex-30 : la première est de degré 1, les autres non', () => {
    const rows = EXERCISES.find((e) => e.id === 'ex-30').question.rows;
    expect(rows.map((r) => r.answer)).toEqual([true, false, false, false]);
  });

  it('ex-35, ex-40, ex-44, ex-49, act-4 : les mises en équation sont justes (solution exacte et vérification dans l’histoire)', () => {
    const ex = (id) => EXERCISES.find((e) => e.id === id).question;
    // ex-35 : 3x − 4 = 32 ⟹ x = 12 ; les autres équations ne sont pas vraies en 12
    const opt = ex('ex-35').options;
    const x35 = solveEq('3x-4', '32');
    expect(same(x35, R(12n))).toBe(true);
    expect(same(at(lin('3x-4'), x35), R(32n))).toBe(true);
    expect(same(at(lin('3x+4'), x35), R(32n))).toBe(false);
    expect(same(mul(R(3n), add(x35, R(-4n))), R(32n))).toBe(false);
    expect(same(mul(R(3n), x35), add(R(32n), R(-4n)))).toBe(false);
    expect(ex('ex-35').correct).toBe(0);
    expect(opt[0]).toBe('$3x - 4 = 32$');
    // ex-40 : 2x + 15 = 3x − 9 ⟹ 24
    expect(ex('ex-40').expected).toBe(Number(solveEq('2x+15', '3x-9').n));
    expect(same(at(lin('2x+15'), R(24n)), at(lin('3x-9'), R(24n)))).toBe(true);
    // ex-44 : 2(x + x + 6) = 84 ⟹ x = 18
    expect(ex('ex-44').expected).toBe(Number(solveEq('4x+12', '84').n));
    // ex-49 : 20x + 2x = 330 ⟹ 15
    expect(ex('ex-49').expected).toBe(Number(solveEq('22x', '330').n));
    // act-4 : 3(x + 4) = x + 20 ⟹ 4
    expect(ex('act-4').expected).toBe(Number(solveEq('3x+12', 'x+20').n));
    expect(same(at(lin('3x+4'), R(4n)), at(lin('x+20'), R(4n)))).toBe(false);
    expect(same(at(lin('3x+12'), R(4n)), at(lin('x+20'), R(4n)))).toBe(true);
  });

  it('le إختبار أولي : chaque clé vraie, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) f.options.forEach((o) => expect(src.includes(`'${o.replace(/\\/g, '\\\\')}'`), `${f.id} option ${o} absente du module`).toBe(true));
    const e2 = FINAL.find((f) => f.id === 'E2');
    const sides = e2.options.map((o) => o.replace(/\$/g, '').split('='));
    sides.forEach(([l, r], k) => expect(same(at(lin(l), R(4n)), at(lin(r), R(4n))), e2.options[k]).toBe(k === e2.correct));
    for (const id of ['E3', 'E4', 'E5']) {
      const f = FINAL.find((x) => x.id === id);
      const truth = solveEq(f.truth.left, f.truth.right);
      expect(same(truth, num(f.truth.value))).toBe(true);
      f.options.forEach((o, k) => {
        const v = num(o.replace(/\$/g, '').replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g, '$1/$2').replace(/-\\frac\{(\d+)\}\{(\d+)\}/g, '-$1/$2'));
        const holds = same(at(lin(f.truth.left), v), at(lin(f.truth.right), v));
        expect(holds, `${id} ${o}`).toBe(k === f.correct);
      });
    }
    expect(FINAL.find((f) => f.id === 'E1').correct).toBe(0);
  });

  it('la طريقة : 6x − 5 = 2x + 7 → 3 ; 3x + 40 = 5x − 20 → 30 (vérifié dans l’histoire)', () => {
    expect(same(solveEq('6x-5', '2x+7'), R(BigInt(METHOD.solve.numbers.x)))).toBe(true);
    expect(same(solveEq('3x+40', '5x-20'), R(BigInt(METHOD.model.numbers.x)))).toBe(true);
    expect(same(at(lin('3x+40'), R(30n)), R(130n))).toBe(true);
    expect(same(at(lin('5x-20'), R(30n)), R(130n))).toBe(true);
    expect(same(solveEq('50x+300', '700'), R(8n))).toBe(true);
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu’elle annonce', () => {
    const claims = [
      [PREP_PLATFORM_ITEMS[0], same(div(R(12n), R(3n)), R(4n))],
      [PREP_PLATFORM_ITEMS[1], same(div(R(15n), R(45n)), R(3n))],
      [PREP_ITEMS[0], same(R(1n, 10n), R(10n))],
      [PREP_ITEMS[1], same(at(lin('8x-8'), R(1n)), R(0n))],
      [PREP_PLATFORM_ITEMS[2], same(add(mul(R(3n), R(1n)), mul(R(2n), R(1n))), mul(R(5n), R(1n)))],
      [PREP_PLATFORM_ITEMS[3], same(at(lin('4x-x'), R(2n)), R(4n))],
      [PREP_PLATFORM_ITEMS[4], true],
      [PREP_PLATFORM_ITEMS[5], false],
    ];
    for (const [item, truth] of claims) expect(item.answer, item.text).toBe(truth);
  });

  it('les équations du labo ont une solution unique non nulle', () => {
    for (const lv of ['beginner', 'advanced']) for (const t of LAB[lv].tasks) { const x = solveEq(t.left, t.right); expect(x.n !== 0n).toBe(true); }
  });
});
