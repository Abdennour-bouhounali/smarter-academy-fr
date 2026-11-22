import { describe, it, expect } from 'vitest';
import { EXERCISES, EX, STEPS_META } from './exercises';

/** Arithmétique INDÉPENDANTE du cœur : un nombre est { n, s, d } = (n / s) / d, n et s entiers (BigInt) ; s = 10^k pour un numérateur décimal. */
const num = (txt) => {
  const t = txt.replace(/\{,\}/g, '.');
  const [i, fr = ''] = t.split('.');
  return { n: BigInt(i + fr), s: 10n ** BigInt(fr.length) };
};
/** « \frac{3{,}4}{7} » ou « 3 » → { n, s, d } */
const TOKEN = /\\frac\{((?:[^{}]|\{[^{}]*\})+)\}\{(\d+)\}|(\d+(?:\{,\}\d+)?)/g;
const parse = (str) => [...str.matchAll(TOKEN)].map((m) => (m[1] ? { ...num(m[1]), d: BigInt(m[2]) } : { ...num(m[3]), d: 1n }));
/** compare a et b par produit en croix (BIGINT, côté test seulement) : -1, 0, 1 */
const cmp = (a, b) => { const l = a.n * b.s * b.d; const r = b.n * a.s * a.d; return l < r ? -1 : l > r ? 1 : 0; };
const SIGN = { '$<$': -1, '$>$': 1, '$=$': 0 };
/** le cas du périmètre 2AM auquel appartient une paire (jamais de produit en croix à l'élève) */
const caseOf = (a, b) => {
  if (a.d === b.d) return 'sameDen';
  if (a.n * b.s === b.n * a.s) return 'sameNum';
  if (a.s === 1n && b.s === 1n && (a.d % b.d === 0n || b.d % a.d === 0n)) return a.d === 1n || b.d === 1n ? 'vsInt' : 'multDen';
  return null;
};
const row = (id, i) => EX[id].question.rows[i];
const key = (id, i) => row(id, i).options[row(id, i).correct];
/** une ligne « a □ b » : signe attendu recalculé, paire dans le périmètre, autres options fausses */
const checkSignRow = (id, i, expected) => {
  const [a, b] = parse(row(id, i).label);
  const c = cmp(a, b);
  expect(c, `${id}/${i}`).toBe(expected);
  expect(SIGN[key(id, i)], `${id}/${i} clé`).toBe(c);
  for (const o of row(id, i).options) if (o !== key(id, i)) expect(SIGN[o], `${id}/${i} ${o}`).not.toBe(c);
  expect(caseOf(a, b), `${id}/${i} cas`).not.toBeNull();
};

describe('« مقارنة كسرين » — exercices recalculés', () => {
  it('six exercices ex-1…ex-6, une clé valide par ligne', () => {
    expect(EXERCISES.map((e) => e.id)).toEqual(['ex-1', 'ex-2', 'ex-3', 'ex-4', 'ex-5', 'ex-6']);
    for (const e of EXERCISES) for (const r of e.question.rows) {
      expect(r.options.length).toBeGreaterThanOrEqual(2); expect(r.options.length).toBeLessThanOrEqual(4);
      expect(r.correct).toBeGreaterThanOrEqual(0); expect(r.correct).toBeLessThan(r.options.length);
      expect(new Set(r.options).size).toBe(r.options.length);
    }
  });
  it('STEPS_META suit les exercices et leurs briques', () => {
    expect(STEPS_META.map((s) => s.id)).toEqual(EXERCISES.map((e) => e.id));
    STEPS_META.forEach((s) => expect(s.requires).toEqual(EX[s.id].requires));
  });
  it('ex-1 : 2/6 et 2/9 (même numérateur) ; 2/6 > 2/9 ; la première part est plus grande', () => {
    expect(cmp(parse(key('ex-1', 0))[0], { n: 2n, s: 1n, d: 6n })).toBe(0);
    expect(cmp(parse(key('ex-1', 1))[0], { n: 2n, s: 1n, d: 9n })).toBe(0);
    checkSignRow('ex-1', 2, 1);
    expect(caseOf({ n: 2n, s: 1n, d: 6n }, { n: 2n, s: 1n, d: 9n })).toBe('sameNum');
    expect(key('ex-1', 3)).toBe('سلمى');   // 2/6 > 2/9
    for (const o of row('ex-1', 0).options.filter((x) => x !== key('ex-1', 0))) expect(cmp(parse(o)[0], { n: 2n, s: 1n, d: 6n })).not.toBe(0);
    for (const o of row('ex-1', 1).options.filter((x) => x !== key('ex-1', 1))) expect(cmp(parse(o)[0], { n: 2n, s: 1n, d: 9n })).not.toBe(0);
  });
  it('ex-2 : < 1 ou > 1 par comparaison du numérateur au dénominateur ; tous < 2', () => {
    const labels = ['7/9', '15/14', '99/100', '40/39', '5/3'];
    labels.forEach((l, i) => {
      const [n, d] = l.split('/').map(BigInt);
      const x = parse(row('ex-2', i).label)[0];
      expect([x.n, x.d]).toEqual([n, d]);
      const expected = n < d ? 'أصغر من $1$' : n > d ? 'أكبر من $1$' : 'يساوي $1$';
      expect(key('ex-2', i)).toBe(expected);
      expect(caseOf(x, { n: 1n, s: 1n, d: 1n })).not.toBeNull();   // vs 1 : paire du périmètre
      expect(n < 2n * d).toBe(true);                                // < 2
    });
    expect(key('ex-2', 5)).toBe('أصغر من $2$');
  });
  it('ex-3 : < ; > ; > (numérateur décimal) ; < (0 et 1/100)', () => {
    checkSignRow('ex-3', 0, -1); checkSignRow('ex-3', 1, 1); checkSignRow('ex-3', 2, 1); checkSignRow('ex-3', 3, -1);
    expect(caseOf(...parse(row('ex-3', 0).label))).toBe('sameDen');
    expect(caseOf(...parse(row('ex-3', 1).label))).toBe('sameNum');
    const [a, b] = parse(row('ex-3', 2).label); expect(a.s).toBe(10n); expect(caseOf(a, b)).toBe('sameDen');
    expect(caseOf(...parse(row('ex-3', 3).label))).toBe('vsInt');   // 0 est un entier
  });
  it('ex-4 : 5/10 est entre 5/11 et 5/9 ; 5/4 < 5,3/4 ; 5/4 > 5/6', () => {
    const f = (d) => ({ n: 5n, s: 1n, d });
    const between = (x) => cmp(f(11n), x) < 0 && cmp(x, f(9n)) < 0;
    const [lo, hi] = parse(row('ex-4', 0).label); expect([lo.n, lo.d, hi.n, hi.d]).toEqual([5n, 11n, 5n, 9n]);
    row('ex-4', 0).options.forEach((o, k) => { const x = parse(o)[0]; expect(between(x), o).toBe(k === row('ex-4', 0).correct); expect(caseOf(x, hi)).toBe('sameNum'); });
    checkSignRow('ex-4', 1, -1); checkSignRow('ex-4', 2, 1);
    expect(caseOf(...parse(row('ex-4', 1).label))).toBe('sameDen'); expect(caseOf(...parse(row('ex-4', 2).label))).toBe('sameNum');
  });
  it('ex-5 : 15/11 > 12/11 > 11/13 > 9/13 > 4/13', () => {
    const one = { n: 1n, s: 1n, d: 1n };
    const gt1 = (x) => cmp(x, one) > 0;
    const set = (k) => parse(row('ex-5', 0).options[k]);
    set(row('ex-5', 0).correct).forEach((x) => expect(gt1(x)).toBe(true));
    const all = parse(EX['ex-5'].statement.replace(/نريد.*$/, ''));
    expect(all).toHaveLength(5);
    const bigs = all.filter(gt1);
    expect(set(0).map((x) => `${x.n}/${x.d}`).sort()).toEqual(bigs.map((x) => `${x.n}/${x.d}`).sort());
    row('ex-5', 0).options.forEach((o, k) => { if (k !== 0) expect(parse(o).length === bigs.length && parse(o).every(gt1)).toBe(false); });
    checkSignRow('ex-5', 1, 1);
    // pour les deux dernières lignes : l'option clé est strictement décroissante, les autres non
    const desc = (xs) => xs.every((x, k) => k === 0 || cmp(xs[k - 1], x) > 0);
    for (const i of [2, 3]) row('ex-5', i).options.forEach((o, k) => {
      expect(desc(parse(o)), `${i}/${k}`).toBe(k === row('ex-5', i).correct);
      expect(parse(o).length).toBe(i === 2 ? 3 : 5);
    });
    // chaque paire consécutive de la clé est dans le périmètre (même dénominateur) ou séparée par 1
    const seq = parse(key('ex-5', 3));
    seq.slice(1).forEach((x, k) => { const p = seq[k]; expect(caseOf(p, x) !== null || (gt1(p) && !gt1(x))).toBe(true); });
    expect([...seq].sort((p, q) => cmp(q, p))).toEqual(seq);
  });
  it('ex-6 : = ; < ; = ; <', () => {
    [0, -1, 0, -1].forEach((e, i) => checkSignRow('ex-6', i, e));
    const cases = [0, 1, 2, 3].map((i) => caseOf(...parse(row('ex-6', i).label)));
    expect(cases).toEqual(['multDen', 'vsInt', 'multDen', 'multDen']);
  });
  it('aucun exercice ne contient de mot interdit (jeu, intérêt…)', () => {
    const all = JSON.stringify(EXERCISES);
    expect(/خنزير|خمر|قمار|نرد|فوائد|ربا|يانصيب/.test(all)).toBe(false);
  });
});
