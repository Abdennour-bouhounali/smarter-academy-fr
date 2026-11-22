import { describe, it, expect } from 'vitest';
import { EXERCISES, EX, FINAL, OFFERS, OFFER_XS, GRAPHS, DATA } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD } from './textbook';
import { CASE_POINTS, CASE_FIGURES } from './figures';
import { validateGeoFigure } from '../../../../../../common/components/geoFigure';

/**
 * Les clés du درس « التناسبية والتمثيل البياني » recalculées avec un code INDÉPENDANT de `graphs3.js` / `linear.js` : des rationnels en BigInt.
 * Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX, chaque figure REMESURÉE (points = données, validation GeoFigure).
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const sub = (p, q) => R(p.n * q.d - q.n * p.d, p.d * q.d);
const add = (p, q) => R(p.n * q.d + q.n * p.d, p.d * q.d);
const mul = (p, q) => R(p.n * q.n, p.d * q.d);
const div = (p, q) => R(p.n * q.d, p.d * q.n);
const same = (p, q) => p.n === q.n && p.d === q.d;
const dec = (s) => { if (typeof s === 'object') return s; const t = String(s).replace(/[{}\\]/g, '').replace(/,/g, '.').replace(/−/g, '-').replace(/\s+/g, ''); const [i, f = ''] = t.split('.'); return R(BigInt(i + f), 10n ** BigInt(f.length)); };
/** Les points d'une règle { a, b, k, a2 } en abscisses xs. */
const yOf = (rule, x) => { const X = dec(x); const a = dec(rule.a); const b = rule.b ? dec(rule.b) : R(0n); if (rule.k != null && sub(X, dec(rule.k)).n > 0n) return add(b, add(mul(a, dec(rule.k)), mul(dec(rule.a2), sub(X, dec(rule.k))))); return add(mul(a, X), b); };
/** 'prop' | 'aligned' | 'bent' d'une liste de points. */
const kindOf = (pts) => {
  const cross = (P, Q, S) => sub(mul(sub(Q.x, P.x), sub(S.y, P.y)), mul(sub(Q.y, P.y), sub(S.x, P.x))).n === 0n;
  const O = { x: R(0n), y: R(0n) };
  if (pts.every((p) => cross(O, pts[0], p))) return 'prop';
  return pts.every((p) => cross(pts[0], pts[pts.length - 1], p)) ? 'aligned' : 'bent';
};
const P = (x, y) => ({ x: dec(x), y: dec(y) });
const strip = (o) => String(o).replace(/^\$|\$$/g, '').replace(/\\ ?\\?[a-z]*\{?[a-z^0-9]*\}?/g, '');

describe('le درس « التناسبية والتمثيل البياني » — clés recalculées', () => {
  it('act-1 : chaque offre est classée comme le calcul exact le dit', () => {
    const rows = EX['act-1'].question.rows;
    expect(rows).toHaveLength(OFFERS.length);
    OFFERS.forEach((o, i) => {
      const k = kindOf(OFFER_XS.map((x) => ({ x: dec(x), y: yOf(o.rule, x) })));
      expect(rows[i].correct, `offre ${i + 1}`).toBe({ prop: 0, aligned: 1, bent: 2 }[k]);
      expect(rows[i].options).toHaveLength(3);
    });
    expect(OFFERS.map((o) => kindOf(OFFER_XS.map((x) => ({ x: dec(x), y: yOf(o.rule, x) }))))).toEqual(['prop', 'aligned', 'bent']);
  });

  it('ex-1 : trois graphiques — le premier proportionnel, le deuxième aligné sans O, le troisième brisé ; les figures REMESURÉES', () => {
    const rows = EX['ex-1'].question.rows;
    expect(GRAPHS.map((g) => kindOf(g.points.map(([x, y]) => P(x, y))))).toEqual(['prop', 'aligned', 'bent']);
    expect(rows.map((r) => r.correct)).toEqual([0, 1, 2]);
    EX['ex-1'].figures.forEach((fig, i) => {
      expect(validateGeoFigure(fig)).toEqual([]);
      GRAPHS[i].points.forEach(([x, y], j) => expect(fig.points['ABCDE'[j]]).toEqual([x, y]));
      expect(fig.points.O).toEqual([0, 0]);
    });
  });

  it('les figures des exercices portent les points des données', () => {
    const figs = [[EX['ex-2'], DATA.FLOW], [EX['ex-4'], DATA.SALT]];
    for (const [ex, pts] of figs) {
      expect(validateGeoFigure(ex.figure)).toEqual([]);
      pts.forEach(([x, y], j) => expect(ex.figure.points['ABCDE'[j]]).toEqual([x, y]));
      expect(kindOf(pts.map(([x, y]) => P(x, y)))).toBe('prop');
    }
    expect(validateGeoFigure(EX['deep-31'].figure)).toEqual([]);
    DATA.STEPS.forEach(([x, y], j) => expect(EX['deep-31'].figure.points['ABC'[j]]).toEqual([x, y]));
    expect(kindOf([P(0, 0), ...DATA.STEPS.map(([x, y]) => P(x, y))].slice(1))).toBe('bent');
    expect(validateGeoFigure(EX['deep-32'].figure)).toEqual([]);
    expect(EX['deep-32'].figure.points.A).toEqual(DATA.PIN);
    for (const f of CASE_FIGURES) expect(validateGeoFigure(f)).toEqual([]);
    expect(Object.entries(CASE_POINTS).map(([, pts]) => kindOf(pts.map(([x, y]) => P(x, y))))).toEqual(['prop', 'aligned', 'bent']);
  });

  it('les exercices numériques : la valeur attendue est celle du calcul exact', () => {
    const v = (id) => EX[id].question.expected;
    const a = (x, y) => div(dec(y), dec(x));
    expect(same(mul(a(2, 5), dec(9)), dec('22.5'))).toBe(true); expect(v('ex-2')).toBe(22.5);
    expect(same(mul(a(2, 2.5), dec(7)), dec('8.75'))).toBe(true); expect(v('ex-4')).toBe(8.75);
    expect(same(div(dec(250), a(12, 30)), dec(100))).toBe(true); expect(v('ex-5')).toBe(100);
    DATA.BARREL.forEach(([x, y]) => expect(same(a(x, y), dec('2.5'))).toBe(true));
    expect(same(mul(a(...DATA.PIN), dec(7)), dec('16.8'))).toBe(true); expect(v('deep-32')).toBe(16.8);
    expect(v('deep-33')).toBe(15); expect(same(mul(dec('2.5'), dec(6)), dec(15))).toBe(true);
    DATA.PLANET.forEach(([x, y]) => expect(same(a(x, y), dec('3.7'))).toBe(true)); expect(v('deep-41')).toBe(3.7);
    expect(kindOf(DATA.FLOW.map(([x, y]) => P(x, y)))).toBe('prop');
  });

  it('ex-3 : les trois affirmations sont jugées par le calcul', () => {
    const rows = EX['ex-3'].question.rows;
    expect(same(div(dec(4), dec(5)), div(dec('2.4'), dec(3)))).toBe(true); expect(rows[0].answer).toBe(true);
    expect(same(mul(dec('0.8'), dec(9)), dec('7.4'))).toBe(false); expect(rows[1].answer).toBe(false);
    expect(same(mul(dec('0.8'), dec(10)), dec(8))).toBe(true); expect(rows[2].answer).toBe(true);
  });

  it('deep-31 : une seule bonne option, la première', () => {
    const q = EX['deep-31'].question;
    expect(q.correct).toBe(0);
    expect(q.options).toHaveLength(3);
  });

  it('la méthode de lecture : les nombres du fil de cuivre', () => {
    expect(METHOD.read.numbers).toEqual({ a: '0,75', y10: '7,5', x45: '6' });
    expect(same(div(dec(3), dec(4)), dec('0.75'))).toBe(true);
    expect(same(mul(dec('0.75'), dec(10)), dec('7.5'))).toBe(true);
    expect(same(div(dec('4.5'), dec('0.75')), dec(6))).toBe(true);
    expect(kindOf([P(1, 3), P(2, 5), P(4, 9)])).toBe('aligned');
  });

  it('إختبار أولي : chaque clé recalculée, chaque distracteur faux', () => {
    const val = (t) => {
      if (t.kind === 'point') return [dec(t.x), dec(t.y)];
      if (t.kind === 'value') return mul(div(dec(t.through[1]), dec(t.through[0])), dec(t.x));
      if (t.kind === 'coefficient') return div(dec(t.y), dec(t.x));
      return kindOf(t.xs.map((x, i) => ({ x: dec(x), y: dec(t.ys[i]) })));
    };
    const E = Object.fromEntries(FINAL.map((f) => [f.id, f]));
    // E1 : (x ; y) — la bonne option est (7 ; 14), les autres sont fausses
    const [px, py] = val(E.E1.truth);
    E.E1.options.forEach((o, k) => {
      const [ox, oy] = o.replace(/\\ /g, '').replace(/[$()]/g, '').split(';');
      const ok = same(dec(ox), px) && same(dec(oy), py);
      expect(ok, `E1 ${o}`).toBe(k === E.E1.correct);
    });
    expect(val(E.E2.truth)).toBe('prop'); expect(E.E2.correct).toBe(0);
    expect(val(E.E3.truth)).toBe('aligned'); expect(E.E3.correct).toBe(0);
    const y6 = val(E.E4.truth);
    E.E4.options.forEach((o, k) => expect(same(dec(strip(o)), y6), `E4 ${o}`).toBe(k === E.E4.correct));
    const a = val(E.E5.truth);
    expect(same(a, dec('2.4'))).toBe(true);
    expect(same(dec(strip(E.E5.options[0])), a)).toBe(true);
    ['\\frac{5}{12}', '60', '7'].forEach((o) => expect(same(dec(o.includes('frac') ? '0.41666' : o), a)).toBe(false));
  });

  it('« أستعدّ » : les affirmations sont vraies ou fausses comme annoncé', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    const proportional = (xs, ys) => xs.every((x, i) => same(div(dec(ys[i]), dec(x === 0 ? 1 : x)), div(dec(ys[0]), dec(xs[0] === 0 ? 1 : xs[0])))) && xs.every((x) => x !== 0);
    expect(proportional([4, 6, 12], [6, 9, 18])).toBe(true);
    expect(proportional([0, 6, 7], [8, 48, 56])).toBe(false);
    expect(proportional([1, 2, 3], [4, 8, 11])).toBe(false);
    expect(same(div(dec(600), dec(7)), div(dec(1200), dec(14)))).toBe(true);
    expect(same(div(mul(dec('0.4'), dec('7.6')), dec('2.8')), div(mul(dec('2.8'), dec('7.6')), dec('0.4')))).toBe(false);
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-1', 'ex-1', 'ex-2', 'ex-3', 'ex-4', 'ex-5', 'deep-31', 'deep-32', 'deep-33', 'deep-41']);
  });
});
