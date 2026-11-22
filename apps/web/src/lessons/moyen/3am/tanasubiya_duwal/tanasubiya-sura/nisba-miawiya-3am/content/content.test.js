import { describe, it, expect } from 'vitest';
import { EXERCISES, FINAL, RATES } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from './textbook';

/**
 * Les clés du درس « النسبة المئوية » recalculées avec un code INDÉPENDANT de `percent3.js` / `linear.js` : des rationnels en BigInt.
 * Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const same = (p, q) => p.n === q.n && p.d === q.d;
const dec = (s) => { if (typeof s === 'object') return s; const t = String(s).replace(/[{}\\]/g, '').replace(/,/g, '.').replace(/−/g, '-').replace(/\s+/g, ''); const [i, f = ''] = t.split('.'); return R(BigInt(i + f), 10n ** BigInt(f.length)); };
const pct = (t) => { const v = dec(t); return R(v.n, v.d * 100n); }; // t/100
const strip = (o) => String(o).replace(/^\$|\$$/g, '').replace(/\\%/g, '').replace(/\\ ?\\?[a-z]*\{?[a-z^0-9]*\}?/g, '');
const of = (x, t) => mul(dec(x), pct(t));
const up = (x, t) => mul(dec(x), R(pct(t).d + pct(t).n, pct(t).d));
const down = (x, t) => mul(dec(x), R(pct(t).d - pct(t).n, pct(t).d));

describe('le درس « النسبة المئوية » — clés recalculées', () => {
  it('ex-6 : un nombre sur un autre en pourcentage ; chaque distracteur faux', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-6');
    RATES.forEach((d, i) => {
      const t = mul(div(R(BigInt(d.a)), R(BigInt(d.b))), R(100n));
      ex.question.rows[i].options.forEach((o, k) => expect(same(dec(strip(o)), t), `${d.a}/${d.b} ${o}`).toBe(k === ex.question.rows[i].correct));
    });
  });

  it('les exercices numériques : la valeur attendue est celle du calcul exact', () => {
    const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e.question.expected]));
    expect(byId['act-2']).toBe(180000); // 250000 × 72 %
    expect(same(of(250000, 72), R(180000n))).toBe(true);
    expect(byId['ex-7']).toBe(276); expect(same(up(240, 15), R(276n))).toBe(true);
    expect(byId['ex-8']).toBe(3); expect(same(mul(div(R(120n), R(4000n)), R(100n)), R(3n))).toBe(true);
    expect(byId['ex-9']).toBe(81); // (12 × 75 % + 8 × 90 %) / 20 = 16,2 / 20
    expect(same(mul(div(R(162n, 10n), R(20n)), R(100n)), R(81n))).toBe(true);
    expect(byId['ex-13']).toBe(4000); expect(same(div(mul(R(1200n), R(100n)), R(30n)), R(4000n))).toBe(true);
    expect(byId['deep-39']).toBe(3600); expect(same(div(R(4500n), R(5n, 4n)), R(3600n))).toBe(true);
    expect(byId['deep-40']).toBe(28);
    expect(same(down(down(20000, 20), 10), R(14400n))).toBe(true);
  });

  it('إختبار أولي : chaque clé recalculée, chaque distracteur faux', () => {
    const val = (t) => {
      if (t.kind === 'of') return of(t.x, t.t);
      if (t.kind === 'change') return t.dir === 'up' ? up(t.x, t.t) : down(t.x, t.t);
      if (t.kind === 'chain') return t.steps.reduce((acc, [dir, s]) => (dir === 'up' ? up : down)(acc, s), dec(t.x));
      if (t.kind === 'whole') return div(mul(dec(t.part), R(100n)), dec(t.t));
      if (t.kind === 'combined') {
        const total = t.parts.reduce((s, [n]) => s + BigInt(n), 0n);
        const girls = t.parts.map(([n, p]) => of(n, p)).reduce((a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d), R(0n));
        return mul(div(girls, R(total)), R(100n));
      }
      throw new Error(t.kind);
    };
    for (const f of FINAL) {
      const truth = val(f.truth);
      f.options.forEach((o, k) => expect(same(dec(strip(o)), truth), `${f.id} ${o}`).toBe(k === f.correct));
    }
  });

  it('« أستعدّ » : les affirmations sont vraies ou fausses comme annoncé', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    // 12 sur 30 = 40 % ; 25 % de 60 = 15 ≠ 25 ; 3 sur 4 = 75 % ≠ 34 % ; 7/10 = 70 %
    expect(same(mul(div(R(12n), R(30n)), R(100n)), R(40n))).toBe(true);
    expect(same(of(60, 25), R(25n))).toBe(false);
    expect(same(mul(div(R(3n), R(4n)), R(100n)), R(34n))).toBe(false);
    expect(same(mul(R(7n, 10n), R(100n)), R(70n))).toBe(true);
  });
});
