import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, GUIDE } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import * as L from '../../../../../../common/manipulations/logic/tenZoom';

/**
 * Les clés du درس « قوى العدد 10 » recalculées avec un code INDÉPENDANT de `tenPowers.js` : un petit évaluateur LaTeX → rationnel en BigInt
 * (puissances à exposant relatif, fractions, × ÷ + −, décimaux « 0{,}001 », groupes « 10\,000 »). Chaque bonne réponse est vérifiée vraie,
 * chaque distracteur FAUX.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d);
const mul = (a, b) => R(a.n * b.n, a.d * b.d);
const div = (a, b) => R(a.n * b.d, a.d * b.n);
const neg = (a) => R(-a.n, a.d);
const pow = (a, e) => { let r = R(1n); const k = e < 0 ? -e : e; for (let i = 0; i < k; i += 1) r = mul(r, a); return e < 0 ? div(R(1n), r) : r; };
const same = (a, b) => a.n === b.n && a.d === b.d;
const P10 = (n) => pow(R(10n), n);

function evaluate(tex) {
  const s = tex.replace(/\\left|\\right/g, '').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\{,\}/g, '.').replace(/\\,/g, '').replace(/\s+/g, '');
  let i = 0;
  const peek = () => s[i];
  function atom() {
    if (s.startsWith('\\frac', i)) { i += 5; const a = group(); const b = group(); return div(a, b); }
    if (peek() === '(') { i += 1; const v = expr(); i += 1; return v; }
    if (peek() === '{') return group();
    const m = /^\d+(?:\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error(`illisible à ${i} : ${s}`);
    i += m[0].length;
    const [w, f = ''] = m[0].split('.');
    return R(BigInt(w + f), 10n ** BigInt(f.length));
  }
  function group() { if (peek() === '{') { i += 1; const v = expr(); i += 1; return v; } return atom(); }
  function power() {
    let b = atom();
    while (peek() === '^') { i += 1; const e = peek() === '{' ? group() : atom(); b = pow(b, Number(e.n / e.d)); }
    return b;
  }
  function unary() { if (peek() === '-') { i += 1; return neg(unary()); } if (peek() === '+') { i += 1; return unary(); } return power(); }
  function term() { let v = unary(); while (peek() === '*' || peek() === '/') { const op = s[i]; i += 1; const w = unary(); v = op === '*' ? mul(v, w) : div(v, w); } return v; }
  function expr() { let v = term(); while (peek() === '+' || peek() === '-') { const op = s[i]; i += 1; const w = term(); v = op === '+' ? add(v, w) : add(v, neg(w)); } return v; }
  const v = expr();
  if (i !== s.length) throw new Error(`reste « ${s.slice(i)} » dans ${s}`);
  return v;
}
const strip = (o) => String(o).replace(/^\$|\$$/g, '');
/** « 0.001 » ou « 1000 » en rationnel. */
const plain = (t) => evaluate(t.replace(/\./g, '{,}'));
/** L'exposant d'une option « 10^{k} ». */
const expOf = (o) => { const m = /^10\^\{(-?\d+)\}$/.exec(strip(o)); expect(m, o).not.toBeNull(); return Number(m[1]); };

const NAMES = { 'مئة ألف': '100000', 'مئة مليار': '100000000000', 'جزء من مليون': '0.000001', 'ألف مليار': '1000000000000' };

describe('le درس « قوى العدد 10 » — clés recalculées', () => {
  it('l’évaluateur lui-même', () => {
    expect(same(evaluate('10^{-3}'), R(1n, 1000n))).toBe(true);
    expect(same(evaluate('\\frac{1}{10^{-3}}'), R(1000n))).toBe(true);
    expect(same(evaluate('10\\,000'), R(10000n))).toBe(true);
    expect(same(evaluate('0{,}0001'), R(1n, 10000n))).toBe(true);
  });

  it('chaque ligne de chaque exercice à choix : la bonne vraie, les distracteurs faux', () => {
    for (const ex of EXERCISES.filter((e) => e.interaction === 'batch')) {
      for (const r of ex.question.rows) {
        const d = r.data;
        r.options.forEach((o, k) => {
          const isKey = k === r.correct;
          if (d.kind === 'dec') {
            expect(r.label, ex.id).toBe(`$10^{${d.n}}$`);
            expect(same(evaluate(strip(o)), P10(d.n)), `${ex.id} ${r.label} ${o}`).toBe(isKey);
          } else if (d.kind === 'form') {
            expect(same(evaluate(strip(r.label)), P10(d.n)), `${ex.id} clé ${r.label}`).toBe(true);
            expect(same(evaluate(strip(r.label)), P10(expOf(o))), `${ex.id} ${r.label} ${o}`).toBe(isKey);
          } else if (d.kind === 'name') {
            expect(same(plain(NAMES[d.name]), P10(d.n)), `${ex.id} clé ${d.name}`).toBe(true);
            expect(r.label).toBe(d.name);
            expect(same(plain(NAMES[d.name]), P10(expOf(o))), `${ex.id} ${d.name} ${o}`).toBe(isKey);
          } else if (d.kind === 'unit') {
            expect(same(plain(d.factor), P10(d.n)), `${ex.id} clé ${r.label}`).toBe(true);
            // le facteur écrit dans le libellé est celui de la donnée
            const shown = d.factor.length > 4 ? d.factor.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : null;
            if (shown && !/^0\./.test(d.factor) && shown.length > 6) expect(r.label.includes(shown)).toBe(true);
            expect(same(plain(d.factor), P10(expOf(o))), `${ex.id} ${r.label} ${o}`).toBe(isKey);
          } else if (d.kind === 'tf') {
            const [lhs, rhs] = d.claim.split('=');
            const truth = same(evaluate(lhs), plain(rhs.replace(/\*/g, '\\times ').replace(/^-/, '-')));
            expect(truth, `${ex.id} ${d.claim}`).toBe(d.truth);
            expect(k === 0 ? truth : !truth, `${ex.id} ${d.claim} ${o}`).toBe(isKey);
          } else if (d.kind === 'kn') {
            const lhs = mul(plain(d.k), P10(expOf(o)));
            expect(same(lhs, plain(d.value)), `${ex.id} ${r.label} ${o}`).toBe(isKey);
          } else throw new Error(`type ${d.kind}`);
        });
      }
    }
  });

  it('les exercices à une réponse : le nombre de zéros et la rang du 1 se lisent sur l’écriture décimale', () => {
    const zeros = EXERCISES.find((e) => e.id === 'act-3').question.expected;
    expect(String(10n ** BigInt(15)).length - 1).toBe(zeros);
    const rank = EXERCISES.find((e) => e.id === 'act-3-rank').question.expected;
    const s = `0.${'0'.repeat(rank - 1)}1`;
    expect(s.indexOf('1') - 1).toBe(rank);
    expect(same(plain(s), P10(-14))).toBe(true);
  });

  it('le إختبار أولي : chaque clé vraie, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    const truth = { E1: '10^{4}', E2: '10^{-2}', E3: '10^{0}', E4: '0{,}000001', E5: '3\\,000\\,400' };
    for (const f of FINAL) {
      const t = evaluate(truth[f.id]);
      f.options.forEach((o, k) => {
        expect(same(evaluate(o), t), `${f.id} ${o}`).toBe(k === f.correct);
        expect(src.includes(`'$${o.replace(/\\/g, '\\\\')}$'`), `${f.id} option ${o} absente du module`).toBe(true);
      });
      expect(src.includes(`${truth[f.id].replace(/\\/g, '\\\\')}`), `${f.id} énoncé absent`).toBe(true);
    }
  });

  it('la طريقة : chaque ligne calculée', () => {
    const c = METHOD.count.numbers;
    expect(same(plain('100000'), P10(c.a))).toBe(true);
    expect(same(plain('0.0001'), P10(c.b))).toBe(true);
    expect(same(plain('100000000'), P10(c.c))).toBe(true);
    expect(same(plain('0.000001'), P10(c.d))).toBe(true);
    const sum = (terms) => terms.reduce((acc, [dg, e]) => add(acc, mul(R(BigInt(dg)), P10(e))), R(0n));
    expect(same(sum(METHOD.expand.numbers.e), plain('7040300'))).toBe(true);
    expect(same(sum(METHOD.expand.numbers.f), plain('0.0509'))).toBe(true);
    expect(same(sum([[5, 3], [3, 1], [7, -2]]), plain('5030.07'))).toBe(true);
    expect(same(mul(R(36n), P10(METHOD.times.numbers.million36[1])), plain('36000000'))).toBe(true);
    expect(same(mul(R(25n), P10(METHOD.times.numbers.micro25[1])), plain('0.000025'))).toBe(true);
    expect(same(evaluate('45\\times10^{3}'), plain('45000'))).toBe(true);
    expect(GUIDE.mafkuk.right).toContain('10^{-2}');
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu’elle annonce', () => {
    const claims = [
      [PREP_ITEMS[0], same(evaluate('4{,}37 \\times 100'), plain('437'))],
      [PREP_ITEMS[1], same(evaluate('3 \\div 0{,}1'), plain('30'))],
      [PREP_ITEMS[2], same(evaluate('0{,}6 \\times 0{,}01'), plain('0.06'))],
      [PREP_ITEMS[3], same(evaluate('100 \\times 0{,}01'), R(1n))],
      [PREP_ITEMS[4], same(evaluate('2 \\times 5 \\times 2 \\times 5 \\times 2 \\times 5'), plain('1000'))],
      [PREP_ITEMS[5], same(evaluate('3{,}2 \\times 1000'), plain('320'))],
      [PREP_PLATFORM_ITEMS[0], same(evaluate('26{,}8 \\div 1000'), plain('0.268'))],
    ];
    for (const [item, truthy] of claims) expect(item.answer, item.text).toBe(truthy);
    expect(new Set([...PREP_ITEMS, ...PREP_PLATFORM_ITEMS].map((i) => i.answer)).size).toBe(2);
  });

  it('les cartes du labo : chaque cible est une puissance de 10 et la carte la désigne (noms, décimal, unités, 10 km)', () => {
    for (const lv of ['beginner', 'advanced', 'prefixes']) {
      for (const raw of L.PRESETS[lv].tasks) {
        const c = raw.card;
        const t = raw.target;
        if ('dec' in c) expect(same(P10(c.dec), P10(t))).toBe(true);
        if ('km' in c) expect(same(mul(R(BigInt(c.km)), R(1000n)), P10(t))).toBe(true);
        if ('name' in c) expect(c.name).toBe(t);
      }
    }
  });

  it('les الكفاءات déclarées par la leçon sont P1 … P4 dans l’ordre du catalogue', () => {
    const ids = LESSON_CONFIG.resources.flatMap((r) => r.learningPointIds ?? []);
    expect(new Set(ids)).toEqual(new Set(['P1', 'P2', 'P3', 'P4'].map((p) => `3am_quwa-adad-ashara_${p}`)));
    expect(LESSON_CONFIG.skills).toHaveLength(4);
  });
});
