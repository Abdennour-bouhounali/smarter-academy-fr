import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL } from './exercises';
import { PREP_PLATFORM_ITEMS, METHOD, GUIDE } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import * as L from '../../../../../../common/manipulations/logic/sizeLadder';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';

/**
 * Les clés du درس « الكتابة العلمية ورتبة القدر » recalculées avec un code INDÉPENDANT de `tenPowers.js` : un petit évaluateur LaTeX → rationnel en BigInt (puissances à exposant relatif,
 * fractions, × ÷, décimaux « 0{,}001 », groupes « 10\\,000 »). La bonne option est l'écriture scientifique ÉGALE à la valeur ; chaque distracteur n'est PAS cette écriture
 * (valeur différente, ou valeur égale mais hors de la forme 1 ≤ a < 10). Encadrements et rangs de grandeur sont recalculés par comparaisons exactes, jamais par `tenPowers.js`.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const mul = (a, b) => R(a.n * b.n, a.d * b.d);
const div = (a, b) => R(a.n * b.d, a.d * b.n);
const pow = (a, e) => { let r = R(1n); const k = e < 0 ? -e : e; for (let i = 0; i < k; i += 1) r = mul(r, a); return e < 0 ? div(R(1n), r) : r; };
const cmp = (a, b) => { const x = a.n * b.d; const y = b.n * a.d; return x < y ? -1 : x > y ? 1 : 0; };
const same = (a, b) => cmp(a, b) === 0;
const P10 = (n) => pow(R(10n), n);

function evaluate(tex) {
  const s = tex.replace(/\\times/g, '*').replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2').replace(/\\,/g, '').replace(/\s+/g, '');
  let i = 0;
  const peek = () => s[i];
  function atom() {
    if (s.startsWith('\\frac', i)) { i += 5; const a = group(); const b = group(); return div(a, b); }
    if (peek() === '(') { i += 1; const v = term(); i += 1; return v; }
    if (peek() === '{') return group();
    const m = /^\d+(?:\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error(`illisible à ${i} : ${s}`);
    i += m[0].length;
    const [w, f = ''] = m[0].split('.');
    return R(BigInt(w + f), 10n ** BigInt(f.length));
  }
  function group() { if (peek() === '{') { i += 1; const v = term(); i += 1; return v; } return atom(); }
  function power() {
    let b = atom();
    while (peek() === '^') { i += 1; let sign = 1; if (peek() === '{') { i += 1; if (peek() === '-') { sign = -1; i += 1; } const m = /^\d+/.exec(s.slice(i)); i += m[0].length; i += 1; b = pow(b, sign * Number(m[0])); } else { const e = atom(); b = pow(b, Number(e.n / e.d)); } }
    return b;
  }
  function term() { let v = power(); while (peek() === '*' || peek() === '/') { const op = s[i]; i += 1; const w = power(); v = op === '*' ? mul(v, w) : div(v, w); } return v; }
  const v = term();
  if (i !== s.length) throw new Error(`reste « ${s.slice(i)} » dans ${s}`);
  return v;
}
const strip = (o) => String(o).replace(/^\$|\$$/g, '');
/** Le facteur a d'une écriture « a\\times10^{n} » : { a (texte), n } ou `null`. */
const parts = (tex) => { const m = /^(.*?)\\times10\^\{(-?\d+)\}$/.exec(strip(tex)); return m ? { a: m[1], n: Number(m[2]) } : null; };
/** « 1 ≤ a < 10 » en rationnels exacts. */
const isSciForm = (tex) => { const p = parts(tex); if (!p) return false; const a = evaluate(p.a); return cmp(a, R(1n)) >= 0 && cmp(a, R(10n)) < 0; };
const isSciOf = (tex, valueRat) => isSciForm(tex) && same(evaluate(strip(tex)), valueRat);
/** n tel que 10^n ≤ v < 10^(n+1) par balayage exact. */
const bracket = (v) => { for (let n = -30; n < 30; n += 1) if (cmp(P10(n), v) <= 0 && cmp(v, P10(n + 1)) < 0) return n; throw new Error('hors plage'); };
/** Rang de grandeur : a arrondi à l'unité, demi vers le haut, retenue 10 → 1 × 10^(n+1). */
const order = (v) => {
  const n = bracket(v);
  const a = div(v, P10(n));
  let a1 = a.n / a.d; // partie entière
  const frac = R(a.n - a1 * a.d, a.d);
  if (cmp(frac, R(1n, 2n)) >= 0) a1 += 1n;
  return a1 === 10n ? { a1: 1, n1: n + 1 } : { a1: Number(a1), n1: n };
};

describe('le درس « الكتابة العلمية ورتبة القدر » — clés recalculées', () => {
  it('l’évaluateur et les petites fonctions de contrôle', () => {
    expect(same(evaluate('6{,}04\\times10^{6}'), R(6040000n))).toBe(true);
    expect(same(evaluate('\\frac{9\\times10^{3}}{4{,}5\\times10^{-3}}'), R(2000000n))).toBe(true);
    expect(bracket(R(265n))).toBe(2);
    expect(bracket(R(1n, 10000n))).toBe(-4);
    expect(order(R(265n))).toEqual({ a1: 3, n1: 2 });
    expect(order(R(9700n))).toEqual({ a1: 1, n1: 4 });
    expect(order(R(25n, 100000n))).toEqual({ a1: 3, n1: -4 });
    expect(isSciForm('$26{,}5\\times10^{1}$')).toBe(false);
    expect(isSciForm('$9{,}99\\times10^{8}$')).toBe(true);
  });

  it('chaque ligne de chaque exercice : la bonne vraie, les distracteurs faux', () => {
    for (const ex of EXERCISES.filter((e) => e.interaction === 'batch')) {
      for (const r of ex.question.rows) {
        const d = r.data;
        r.options.forEach((o, k) => {
          const isKey = k === r.correct;
          if (d.kind === 'fill-k') {
            // « lhs = k × 10^n » : l'option est k
            expect(same(mul(evaluate(strip(o)), P10(d.n)), evaluate(d.value)), `${ex.id} ${d.value} ${o}`).toBe(isKey);
          } else if (d.kind === 'fill-n') {
            expect(same(mul(evaluate(d.k), P10(Number(strip(o)))), evaluate(d.value)), `${ex.id} ${d.value} ${o}`).toBe(isKey);
          } else if (d.kind === 'sci') {
            const v = evaluate(d.value);
            expect(isSciOf(o, v), `${ex.id} ${d.value} ${o}`).toBe(isKey);
            expect(same(evaluate(`${d.a}\\times10^{${d.n}}`), v) && isSciForm(`${d.a}\\times10^{${d.n}}`)).toBe(true);
          } else if (d.kind === 'cmp') {
            const truth = cmp(evaluate(d.l), evaluate(d.r)) > 0;
            expect(truth, `${ex.id} ${d.l} > ${d.r}`).toBe(d.truth);
            expect(k === 0 ? truth : !truth, `${ex.id} ${o}`).toBe(isKey);
          } else if (d.kind === 'calc') {
            const v = evaluate(d.expr);
            expect(same(evaluate(`${d.a}\\times10^{${d.n}}`), v) && isSciForm(`${d.a}\\times10^{${d.n}}`)).toBe(true);
            expect(isSciOf(o, v), `${ex.id} ${d.expr} ${o}`).toBe(isKey);
          } else if (d.kind === 'real-sci') {
            const v = evaluate(d.expr);
            expect(same(v, R(7884000n))).toBe(true);
            expect(isSciOf(o, v), `${ex.id} ${o}`).toBe(isKey);
          } else if (d.kind === 'real-order') {
            const v = evaluate(d.expr);
            const ord = order(v);
            expect(ord).toEqual({ a1: d.a1, n1: d.n1 });
            const p = parts(o);
            expect(evaluate(p.a).n === BigInt(ord.a1) && p.n === ord.n1, `${ex.id} ${o}`).toBe(isKey);
          } else throw new Error(`type ${d.kind}`);
        });
      }
    }
  });

  it('ex-29 : l’ordre croissant est exactement F < D < B < E < A < C et les trois autres sont faux', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-29');
    const val = Object.fromEntries(Object.entries(ex.data.items).map(([k, v]) => [k, evaluate(v)]));
    const sorted = Object.keys(val).sort((x, y) => cmp(val[x], val[y])).join(',');
    expect(sorted).toBe(ex.data.key);
    for (const w of ex.data.wrongs) expect(w).not.toBe(sorted);
    // les clés numériques : 8 888 < 9 263 < 10 000 < 11 248,6 < 13 005 < 67 800
    expect(val.F).toEqual(R(8888n)); expect(val.E).toEqual(R(112486n, 10n)); expect(val.A).toEqual(R(13005n));
    const opts = ex.question.options.map((o) => strip(o).split('<').map((x) => x.trim()));
    expect(opts[ex.question.correct].join(',')).toBe(sorted);
    opts.forEach((o, i) => { if (i !== ex.question.correct) expect(o.join(','), `option ${i}`).not.toBe(sorted); });
  });

  it('le إختبار أولي : chaque clé vraie, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) {
      f.options.forEach((o, k) => {
        expect(src.includes(`'$${o.replace(/\\/g, '\\\\')}$'`), `${f.id} option ${o} absente du module`).toBe(true);
        if (f.kind === 'sci') expect(isSciOf(o, evaluate(f.tex)), `${f.id} ${o}`).toBe(k === f.correct);
        else if (f.kind === 'bracket') {
          const v = evaluate(o);
          expect(cmp(P10(f.lo), v) <= 0 && cmp(v, P10(f.lo + 1)) < 0, `${f.id} ${o}`).toBe(k === f.correct);
        } else if (f.kind === 'order') {
          const ord = order(evaluate(f.tex));
          const p = parts(`$${o}$`);
          expect(evaluate(p.a) .n === BigInt(ord.a1) && p.n === ord.n1, `${f.id} ${o}`).toBe(k === f.correct);
        } else if (f.kind === 'rank') {
          const vals = Object.fromEntries(Object.entries(f.items).map(([n, t]) => [n, evaluate(t)]));
          const sorted = Object.keys(vals).sort((x, y) => cmp(vals[x], vals[y])).join('<');
          expect(o === sorted, `${f.id} ${o}`).toBe(k === f.correct);
          for (const t of Object.values(f.items)) expect(src.includes(t.replace(/\\/g, '\\\\')), `${f.id} ${t} absent`).toBe(true);
        }
      });
      if (f.tex) expect(src.includes(f.tex.replace(/\\/g, '\\\\')), `${f.id} énoncé absent`).toBe(true);
    }
  });

  it('la طريقة : chaque ligne calculée, avec un code indépendant puis par le module de maths du cœur', () => {
    const d = METHOD.decimal.numbers;
    expect(same(evaluate('47\\,300\\,000'), evaluate(`${d.A.a}\\times10^{${d.A.n}}`))).toBe(true);
    expect(same(evaluate('0{,}000608'), evaluate(`${d.B.a}\\times10^{${d.B.n}}`))).toBe(true);
    const t = METHOD.times.numbers;
    expect(same(evaluate('528\\times10^{-6}'), evaluate(`${t.C.a}\\times10^{${t.C.n}}`))).toBe(true);
    expect(same(evaluate('0{,}039\\times10^{9}'), evaluate(`${t.D.a}\\times10^{${t.D.n}}`))).toBe(true);
    const b = METHOD.bracket.numbers;
    expect(bracket(evaluate('4{,}73\\times10^{7}'))).toBe(b.A.n);
    expect(order(evaluate('4{,}73\\times10^{7}'))).toEqual({ a1: b.A.a1, n1: b.A.n1 });
    expect(bracket(evaluate('6{,}08\\times10^{-4}'))).toBe(b.B.n);
    expect(order(evaluate('6{,}08\\times10^{-4}'))).toEqual({ a1: b.B.a1, n1: b.B.n1 });
    const e = METHOD.compute.numbers.E;
    expect(same(evaluate('\\frac{6\\times10^{5}\\times1{,}5\\times10^{-2}}{4{,}5\\times10^{-3}}'), evaluate(`${e.a}\\times10^{${e.n}}`))).toBe(true);
    // le module de maths du cœur donne les mêmes écritures
    expect(T.scientific('47 300 000')).toMatchObject({ a: d.A.a, n: d.A.n });
    expect(T.scientific('0,000608')).toMatchObject({ a: d.B.a, n: d.B.n });
    expect(T.scientific('528 × 10^-6')).toMatchObject({ a: t.C.a, n: t.C.n });
    expect(T.orderOfMagnitude('4,73 × 10^7')).toEqual({ a1: b.A.a1, n1: b.A.n1 });
  });

  it('les phrases d’erreur de la carte : chaque « right » est vraie et chaque « wrong » fausse', () => {
    expect(same(evaluate('265'), evaluate('2{,}65\\times10^{2}'))).toBe(true);
    expect(same(evaluate('265'), evaluate('2{,}65\\times10^{3}'))).toBe(false);
    expect(order(R(265n))).toEqual({ a1: 3, n1: 2 });
    expect(cmp(evaluate('9{,}8\\times10^{-5}'), evaluate('1{,}2\\times10^{-4}'))).toBe(-1);
    expect(same(evaluate('35{,}2\\times10^{4}'), evaluate('3{,}52\\times10^{5}'))).toBe(true);
    expect(same(evaluate('35{,}2\\times10^{4}'), R(352000n))).toBe(true);
    expect(GUIDE.digits.right).toContain('2{,}65 \\times 10^{2}');
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu’elle annonce', () => {
    const claims = [
      [PREP_PLATFORM_ITEMS[0], 4987 + 3012 > 7900 && 5000 + 3000 === 8000],
      [PREP_PLATFORM_ITEMS[1], Math.round(6.48) === 6],
      [PREP_PLATFORM_ITEMS[2], Math.floor(3.5 + 0.5) === 3],
      [PREP_PLATFORM_ITEMS[3], same(evaluate('52\\times10^{3}'), R(52000n))],
      [PREP_PLATFORM_ITEMS[4], same(evaluate('7\\times10^{-2}'), evaluate('0{,}007'))],
      [PREP_PLATFORM_ITEMS[5], cmp(P10(-4), P10(-3)) < 0],
      [PREP_PLATFORM_ITEMS[6], same(mulPow(2, -6), P10(-4))],
    ];
    for (const [item, truthy] of claims) expect(item.answer, item.text).toBe(truthy);
    expect(new Set(PREP_PLATFORM_ITEMS.map((i) => i.answer)).size).toBe(2);
  });

  it('les cartes du labo : chaque tâche a le barreau, la case, l’écriture et la rang de grandeur du cœur ET du code indépendant', () => {
    for (const lv of ['beginner', 'advanced']) {
      for (const raw of L.PRESETS[lv].tasks) {
        const t = L.buildTask(raw);
        for (const c of t.cards) {
          const v = evaluate(c.given.replace(/ ?× ?10\^(-?\d+)/, (_, e) => `\\times10^{${e}}`).replace(/ /g, '').replace(/,/g, '{,}')) ;
          const metres = c.unit === 'km' ? mul(v, R(1000n)) : v;
          expect(c.n, c.id).toBe(bracket(metres));
          expect(c.order, c.id).toEqual(order(metres));
          const a = div(metres, P10(c.n));
          expect(c.cell, c.id).toBe(Number(a.n / a.d));
        }
      }
    }
  });

  it('les مسألة et les الكفاءات déclarées par la leçon sont P1 … P3', () => {
    const ids = LESSON_CONFIG.resources.flatMap((r) => r.learningPointIds ?? []);
    expect(new Set(ids)).toEqual(new Set(['P1', 'P2', 'P3'].map((p) => `3am_kitaba-ilmiya-rutba_${p}`)));
    expect(LESSON_CONFIG.skills).toHaveLength(3);
  });
});
function mulPow(a, b) { return pow(R(10n), a + b); }
