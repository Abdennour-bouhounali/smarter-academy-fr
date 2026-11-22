import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL } from './exercises';
import { PREP_PLATFORM_ITEMS, METHOD } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import * as L from '../../../../../../common/manipulations/logic/unitLadder';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';

/**
 * Les clés du درس « قواعد الحساب على قوى العدد 10 » recalculées avec un code INDÉPENDANT de `tenPowers.js` : un petit évaluateur LaTeX → rationnel en BigInt (puissances à exposant
 * relatif, fractions, × ÷ + −, décimaux « 0{,}001 », groupes « 10\\,000 »). Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX.
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


const OPT_EXP = (o) => { const m = /^10\^\{(-?\d+)\}$/.exec(strip(o)); expect(m, o).not.toBeNull(); return Number(m[1]); };

describe('le درس « قواعد الحساب على قوى العدد 10 » — clés recalculées', () => {
  it('l’évaluateur lui-même', () => {
    expect(same(evaluate('10^{-3}'), R(1n, 1000n))).toBe(true);
    expect(same(evaluate('\\frac{10^{5}}{10^{-3}}'), P10(8))).toBe(true);
    expect(same(evaluate('(10^{-2})^{4}'), P10(-8))).toBe(true);
    expect(same(evaluate('100^{-3}'), P10(-6))).toBe(true);
    expect(same(evaluate('30 \\times 10^{5} \\times 10^{-2} \\div 10^{4}'), R(3n))).toBe(true);
  });

  it('chaque ligne de chaque exercice : la bonne vraie, les distracteurs faux', () => {
    for (const ex of EXERCISES.filter((e) => e.interaction === 'batch')) {
      for (const r of ex.question.rows) {
        const d = r.data;
        r.options.forEach((o, k) => {
          const isKey = k === r.correct;
          if (d.kind === 'single') {
            expect(same(evaluate(d.expr), P10(d.n)), `${ex.id} clé ${d.expr}`).toBe(true);
            expect(same(evaluate(d.expr), P10(OPT_EXP(o))), `${ex.id} ${d.expr} ${o}`).toBe(isKey);
          } else if (d.kind === 'eq') {
            expect(same(evaluate(d.expr), P10(d.n)), `${ex.id} ${d.expr}`).toBe(d.truth);
            expect(k === 0 ? d.truth : !d.truth, `${ex.id} ${d.expr} ${o}`).toBe(isKey);
          } else if (d.kind === 'tf') {
            const truth = same(evaluate(d.lhs), evaluate(d.rhs));
            expect(truth, `${ex.id} ${d.lhs} = ${d.rhs}`).toBe(d.truth);
            expect(k === 0 ? truth : !truth, `${ex.id} ${o}`).toBe(isKey);
          } else if (d.kind === 'sciexp') {
            expect(same(mul(evaluate(d.k), P10(OPT_EXP(o))), evaluate(d.expr)), `${ex.id} ${d.expr} ${o}`).toBe(isKey);
          } else if (d.kind === 'val') {
            expect(same(evaluate(strip(o)), evaluate(d.expr)), `${ex.id} ${d.expr} ${o}`).toBe(isKey);
            expect(same(evaluate(d.value), evaluate(d.expr))).toBe(true);
          } else if (d.kind === 'prog') {
            const got = evaluate(`${d.start}\\times 10^{5} \\times 10^{-2} \\div 10^{4}`);
            expect(same(got, evaluate(d.result)), `${ex.id} ${d.start}`).toBe(true);
            expect(same(evaluate(strip(o)), got), `${ex.id} ${d.start} ${o}`).toBe(isKey);
          } else if (d.kind === 'layla') {
            expect(same(evaluate('10^{5} \\times 10^{-2} \\div 10^{4}'), P10(d.factor))).toBe(true);
            expect(same(P10(d.factor), R(1n, 10n))).toBe(true);
          } else throw new Error(`type ${d.kind}`);
        });
      }
    }
  });

  it('ex-50 : la valeur est exactement 10^16', () => {
    const ex = EXERCISES.find((e) => e.id === 'ex-50');
    expect(same(evaluate(ex.data.expr), P10(ex.question.expected))).toBe(true);
    expect(ex.question.expected).toBe(16);
  });

  it('le إختبار أولي : chaque clé vraie, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) {
      const t = evaluate(f.tex);
      f.options.forEach((o, k) => {
        expect(same(evaluate(o), t), `${f.id} ${o}`).toBe(k === f.correct);
        expect(src.includes(`'$${o.replace(/\\/g, '\\\\')}$'`), `${f.id} option ${o} absente du module`).toBe(true);
      });
      expect(src.includes(f.tex.replace(/\\/g, '\\\\')), `${f.id} énoncé absent`).toBe(true);
    }
  });

  it('la طريقة : chaque ligne calculée', () => {
    const c = METHOD.chain.numbers;
    expect(same(evaluate('\\frac{10^{5} \\times 10^{-2}}{10^{-4}}'), P10(c.A))).toBe(true);
    expect(same(evaluate('(10^{-2})^{3} \\times 10^{8}'), P10(c.B))).toBe(true);
    expect(same(evaluate('\\frac{(10^{3})^{2}}{10^{4} \\times 10^{-5}}'), P10(c.C))).toBe(true);
    const t = METHOD.times.numbers;
    expect(same(evaluate('6 \\times 10^{4} \\times 5 \\times 10^{-7}'), mul(evaluate(t.D.k), P10(t.D.p)))).toBe(true);
    expect(same(evaluate('6 \\times 10^{4} \\times 5 \\times 10^{-7}'), evaluate('0{,}03'))).toBe(true);
    expect(same(evaluate('\\frac{8 \\times 10^{5}}{2 \\times 10^{-3}}'), mul(evaluate(t.E.k), P10(t.E.p)))).toBe(true);
    // les mêmes calculs par le module de maths du cœur
    expect(T.chainExp([{ op: '×', n: 5 }, { op: '×', n: -2 }, { op: '÷', n: -4 }])).toBe(c.A);
    const prod = T.mulSci([{ k: 6, p: 4 }, { k: 5, p: -7 }]);
    expect(T.decText(prod.k)).toBe(t.D.k); expect(prod.p).toBe(t.D.p);
    const quo = T.divSci({ k: 8, p: 5 }, { k: 2, p: -3 });
    expect(T.decText(quo.k)).toBe(t.E.k); expect(quo.p).toBe(t.E.p);
  });

  it('les phrases d’erreur de la carte : chaque « right » est vraie et chaque « wrong » fausse', () => {
    expect(same(evaluate('10^{3} \\times 10^{3}'), P10(6))).toBe(true);
    expect(same(evaluate('10^{3} \\times 10^{3}'), P10(9))).toBe(false);
    expect(same(evaluate('\\frac{10^{5}}{10^{-2}}'), P10(7))).toBe(true);
    expect(same(evaluate('(10^{2})^{5}'), P10(10))).toBe(true);
    expect(same(evaluate('10^{2} + 10^{3}'), R(1100n))).toBe(true);
    expect(same(evaluate('\\frac{10^{10}}{2}'), mul(R(5n), P10(9)))).toBe(true);
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu’elle annonce', () => {
    const claims = [
      [PREP_PLATFORM_ITEMS[0], same(evaluate('10^{5}'), evaluate('100000'))],
      [PREP_PLATFORM_ITEMS[1], same(evaluate('10^{-3}'), evaluate('-1000'))],
      [PREP_PLATFORM_ITEMS[2], same(evaluate('10^{0}'), R(0n))],
      [PREP_PLATFORM_ITEMS[3], same(evaluate('0{,}0001'), P10(-4))],
      [PREP_PLATFORM_ITEMS[4], same(evaluate('1000 \\times 100'), evaluate('100000'))],
      [PREP_PLATFORM_ITEMS[5], same(R(1000n), R(100n))],
      [PREP_PLATFORM_ITEMS[6], same(evaluate('\\frac{1}{100}'), evaluate('0{,}01'))],
    ];
    for (const [item, truthy] of claims) expect(item.answer, item.text).toBe(truthy);
    expect(new Set(PREP_PLATFORM_ITEMS.map((i) => i.answer)).size).toBe(2);
  });

  it('les cartes du labo : chaque tâche demande le compte du cœur, dans le bon mode', () => {
    for (const lv of ['beginner', 'advanced']) {
      for (const raw of L.PRESETS[lv].tasks) {
        const t = L.buildTask(raw);
        expect(t.total).toBe(T.unitColumns(t.path[0], t.path.at(-1), t.mode));
        // le facteur de conversion est une vraie puissance de 10 : 1 km² = 1 000 000 m², 1 mm² = 0,000001 m² …
        const scale = (u) => P10(T.UNIT_SCALE[u] * t.mode);
        expect(same(div(scale(t.path[0]), scale(t.path.at(-1))), P10(t.total)), raw.id).toBe(true);
      }
    }
  });

  it('les الكفاءات déclarées par la leçon sont P1 … P4 dans l’ordre du catalogue', () => {
    const ids = LESSON_CONFIG.resources.flatMap((r) => r.learningPointIds ?? []);
    expect(new Set(ids)).toEqual(new Set(['P1', 'P2', 'P3', 'P4'].map((p) => `3am_qawaid-quwa-ashara_${p}`)));
    expect(LESSON_CONFIG.skills).toHaveLength(4);
  });
});
