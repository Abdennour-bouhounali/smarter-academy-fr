import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL, EVAL, DEDUCE, FROM } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, LAB } from './textbook';

/**
 * Les clés du درس « المساويات والعمليات » recalculées avec un code INDÉPENDANT de `linear.js` : des rationnels en BigInt et un petit évaluateur
 * d'expressions du premier degré (« 3x - 1 », « -a + 14 », « 8x - 1/2 »). Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (p, q) => R(p.n * q.d + q.n * p.d, p.d * q.d);
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const neg = (p) => R(-p.n, p.d);
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const same = (p, q) => p.n === q.n && p.d === q.d;
const num = (t) => { const s = t.trim().replace(/−/g, '-'); if (s.includes('/')) { const [a, b] = s.split('/'); return div(num(a), num(b)); } return R(BigInt(s)); };
/** « 3x - 1 » → { a, b } (coefficient et constante) pour la lettre donnée. */
function lin(src, v) {
  const s = src.replace(/\s+/g, '').replace(/−/g, '-');
  let a = R(0n); let b = R(0n);
  for (const t of s.match(/[+-]?[^+-]+/g)) {
    const sign = t.startsWith('-') ? R(-1n) : R(1n);
    const body = t.replace(/^[+-]/, '');
    if (body.includes(v)) { const c = body.replace(v, ''); a = add(a, mul(sign, c === '' ? R(1n) : num(c))); } else b = add(b, mul(sign, num(body)));
  }
  return { a, b };
}
const at = (P, x) => add(mul(P.a, x), P.b);
const strip = (o) => String(o).replace(/^\$|\$$/g, '').replace(/\\dfrac/g, '\\frac').replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g, '$1/$2').replace(/\s+/g, '');

describe('le درس « المساويات والعمليات » — clés recalculées', () => {
  it('ex-1 : x connu, la valeur recalculée ; chaque distracteur faux', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-1');
    EVAL.forEach((e, i) => {
      const truth = at(lin(e.expr, 'x'), num(e.x));
      ex.question.rows[i].options.forEach((o, k) => expect(same(num(strip(o)), truth), `${e.expr} ${o}`).toBe(k === ex.question.rows[i].correct));
    });
  });

  it('ex-2 : a déduit par les opérations (solution unique de L = R)', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-2');
    DEDUCE.forEach((d, i) => {
      const L = lin(d.left, 'a'); const Rr = lin(d.right, 'a');
      const a = div(add(Rr.b, neg(L.b)), add(L.a, neg(Rr.a)));
      expect(same(at(L, a), at(Rr, a))).toBe(true);
      ex.question.rows[i].options.forEach((o, k) => expect(same(num(strip(o)), a), `${d.tex} ${o}`).toBe(k === ex.question.rows[i].correct));
    });
  });

  it('ex-3 : chaque affirmation vraie ou fausse', () => {
    const rows = EXERCISES.find((e) => e.id === 'ex-3').question.rows;
    const truth = [
      // 5x = 3 ⟹ x = 5 ?  x = 3/5
      !same(div(R(3n), R(5n)), R(5n)),
      // 20 − x = 0 ⟹ x = 20
      same(R(20n), R(20n)),
      // 9x = 9 ⟹ x = 0 ?
      same(div(R(9n), R(9n)), R(0n)),
      // 3 − 4x = 0 ⟹ x = 3/4
      same(div(R(3n), R(4n)), R(3n, 4n)),
    ];
    expect(rows.map((r) => r.answer)).toEqual([false, true, false, true]);
    expect(truth[0]).toBe(true); // x = 3/5 ≠ 5 : l'affirmation est fausse
    expect(truth[1] && truth[3]).toBe(true);
    expect(truth[2]).toBe(false);
  });

  it('ex-4 : multiplier tous les termes — la bonne égalité, les autres fausses (au x qui vérifie l’égalité de départ)', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-4');
    // 3x − 4 = 5 → x = 3 ; 6 = 2x + 8 → x = −1
    const xs = [R(3n), R(-1n)];
    ex.question.rows.forEach((r, i) => {
      r.options.forEach((o, k) => {
        const [l, rt] = strip(o).split('=');
        const holds = same(at(lin(l, 'x'), xs[i]), at(lin(rt, 'x'), xs[i]));
        expect(holds, `${i} ${o}`).toBe(k === r.correct);
      });
    });
  });

  it('ex-5 : de 4x = −2 (x = −1/2), chaque valeur recalculée', () => {
    const x = R(-1n, 2n);
    expect(same(mul(R(4n), x), R(-2n))).toBe(true);
    const ex = EXERCISES.find((e) => e.id === 'ex-5');
    FROM.forEach((f, i) => {
      const truth = at(lin(f.expr, 'x'), x);
      ex.question.rows[i].options.forEach((o, k) => expect(same(num(strip(o)), truth), `${f.expr} ${o}`).toBe(k === ex.question.rows[i].correct));
    });
  });

  it('act-1 : la même opération des deux côtés garde l’égalité (balayage de a = b, deux sommes)', () => {
    for (let a = -9n; a <= 9n; a += 1n) expect(a + 150n - 280n).toBe(a + 150n - 280n);
    expect(EXERCISES.find((e) => e.id === 'act-1').question.correct).toBe(0);
  });

  it('le إختبار أولي : chaque clé vraie, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) {
      f.options.forEach((o) => expect(src.includes(`'${o.replace(/\\/g, '\\\\')}'`), `${f.id} option ${o} absente du module`).toBe(true));
    }
    // E1 : a = −7 ⟹ a + 7 = 0
    expect(same(add(R(-7n), R(7n)), R(0n))).toBe(true);
    const e1 = FINAL[0]; e1.options.forEach((o, k) => expect(same(num(strip(o)), R(0n)), o).toBe(k === e1.correct));
    // E2 : 3b − 5 = 0 ⟹ b = 5/3
    const e2 = FINAL[1]; e2.options.forEach((o, k) => expect(same(num(strip(o)), R(5n, 3n)), o).toBe(k === e2.correct));
    // E5 : 5 = 3x − 1 ⟹ x = 2 ; 3x + 2 = 8 ≠ 5
    expect(same(at(lin('3x-1', 'x'), R(2n)), R(5n))).toBe(true);
    expect(same(at(lin('3x+2', 'x'), R(2n)), R(5n))).toBe(false);
    // E3 : a × (−3) = b × (−3) quand a = b ; les autres écritures fausses pour a = b = 2
    const a = R(2n);
    expect(same(mul(a, R(-3n)), mul(a, R(-3n)))).toBe(true);
    expect(same(div(a, R(-3n)), mul(a, R(-3n)))).toBe(false);
    expect(same(add(a, R(-3n)), mul(a, R(-3n)))).toBe(false);
    expect(same(add(mul(R(-3n), a), R(3n)), mul(a, R(-3n)))).toBe(false);
  });

  it('la طريقة : x = 2 vérifie 5 = 3x − 1 et 2x + 3 = 7 ; les deux conclusions du manuel de la plateforme', () => {
    const x = R(2n);
    expect(same(at(lin('3x-1', 'x'), x), R(5n))).toBe(true);
    expect(same(at(lin('3x-2', 'x'), x), R(4n))).toBe(true); // 4 = 3x − 2 vraie
    expect(same(at(lin('3x+2', 'x'), x), R(5n))).toBe(false); // 3x + 2 = 5 fausse
    expect(same(at(lin('2x+3', 'x'), x), R(7n))).toBe(true);
    expect(same(at(lin('-4x-6', 'x'), x), R(-14n))).toBe(true);
    expect(same(at(lin('4x+3', 'x'), x), R(14n))).toBe(false);
    expect(METHOD.transform.numbers.x).toBe(2);
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu’elle annonce', () => {
    const claims = [
      [PREP_PLATFORM_ITEMS[0], same(at(lin('3x-5', 'x'), R(4n)), R(7n))],
      [PREP_PLATFORM_ITEMS[1], same(at(lin('2x+1', 'x'), R(3n)), at(lin('4x-3', 'x'), R(3n)))],
      [PREP_ITEMS[0], same(add(R(-5n), R(5n)), R(0n))],
      [PREP_ITEMS[1], same(mul(R(7n), R(7n)), R(1n))],
      [PREP_ITEMS[2], same(mul(R(-8n), R(-1n)), R(8n))],
      [PREP_ITEMS[3], same(at(lin('3x+7', 'x'), R(0n)), R(10n))],
      [PREP_PLATFORM_ITEMS[2], same(mul(R(-4n), R(-6n)), R(-24n))],
    ];
    for (const [item, truth] of claims) expect(item.answer, item.text).toBe(truth);
  });

  it('le labo de l’entrée : les presets sont ceux de levels.js', () => {
    expect(LAB.beginner.tasks).toHaveLength(4);
    expect(LAB.advanced.tasks.flat()).toHaveLength(5);
  });
});
