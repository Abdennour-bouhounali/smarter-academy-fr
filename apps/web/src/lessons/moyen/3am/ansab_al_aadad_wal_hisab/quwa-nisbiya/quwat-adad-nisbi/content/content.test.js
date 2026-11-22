import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, FINAL } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, METHOD, LAB } from './textbook';

/**
 * Les clés du درس « قوة عدد نسبي » recalculées avec un code INDÉPENDANT de `powers.js` : un petit évaluateur LaTeX → rationnel
 * en BigInt (puissances à exposant relatif, fractions, × ÷ + −, parenthèses, décimaux « 2{,}5 »). Chaque bonne réponse est
 * vérifiée vraie, chaque distracteur FAUX.
 */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const R = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d);
const mul = (a, b) => R(a.n * b.n, a.d * b.d);
const div = (a, b) => R(a.n * b.d, a.d * b.n);
const neg = (a) => R(-a.n, a.d);
const pow = (a, e) => { let r = R(1n); const k = e < 0 ? -e : e; for (let i = 0; i < k; i += 1) r = mul(r, a); return e < 0 ? div(R(1n), r) : r; };
const same = (a, b) => a.n === b.n && a.d === b.d;

/** Évalue une expression LaTeX simple. */
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
const strip = (o) => String(o).replace(/^\$|\$$/g, '').split(':')[0].split('=').pop().trim();

describe('le درس « قوة عدد نسبي » — clés recalculées', () => {
  it('l’évaluateur lui-même : −2⁴ = −16, (−2)⁴ = 16, 3⁻² = 1/9', () => {
    expect(same(evaluate('-2^4'), R(-16n))).toBe(true);
    expect(same(evaluate('(-2)^4'), R(16n))).toBe(true);
    expect(same(evaluate('3^{-2}'), R(1n, 9n))).toBe(true);
    expect(same(evaluate('\\frac{(4^2 - 2 \\times 5)^2}{11 - 3^2}'), R(18n))).toBe(true);
  });

  it('chaque ligne de chaque exercice à choix : la bonne vraie, les distracteurs faux', () => {
    for (const ex of EXERCISES.filter((e) => e.interaction === 'batch')) {
      for (const r of ex.question.rows) {
        const truth = evaluate(r.label.replace(/\$/g, ''));
        r.options.forEach((o, k) => {
          const v = evaluate(strip(o));
          expect(same(v, truth), `${ex.id} ${r.label} ${o}`).toBe(k === r.correct);
        });
      }
    }
  });

  it('les exercices à une réponse', () => {
    expect(evaluate('6^2 + 8^2').n).toBe(BigInt(10 ** 2));
    expect(EXERCISES.find((e) => e.id === 'ex-39').question.expected).toBe(10);
    expect(EXERCISES.find((e) => e.id === 'ex-40').question.expected).toBe(Number(evaluate('\\frac{1}{(-\\frac{1}{2})^3}').n));
    // la حديقة : (7^5)^2 = 7^10, et aucun autre côté proposé
    const g = EXERCISES.find((e) => e.id === 'ex-47').question;
    g.options.forEach((o, k) => expect(same(pow(evaluate(strip(o)), 2), evaluate('7^{10}')), o).toBe(k === g.correct));
    const s = EXERCISES.find((e) => e.id === 'ex-51').question;
    s.options.forEach((o, k) => expect(same(evaluate(strip(o)), evaluate('3^{20}+3^{20}+3^{20}')), o).toBe(k === s.correct));
  });

  it('le إختبار أولي : chaque clé vraie, chaque distracteur faux, et le module contient chaque option', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    const truth = { E1: '(-2)^5', E2: '(5^3)^4', E3: '4^{-2}', E4: '\\frac{2^{10}}{2}', E5: '-3 \\times 4^2' };
    for (const f of FINAL) {
      const t = evaluate(truth[f.id]);
      f.options.forEach((o, k) => {
        const tex = /^-?\d+\/\d+$/.test(o) ? `\\frac{${o.split('/')[0]}}{${o.split('/')[1]}}` : o;
        expect(same(evaluate(tex), t), `${f.id} ${o}`).toBe(k === f.correct);
        expect(src.includes(`'$${tex.replace(/\\/g, '\\\\')}$'`), `${f.id} option ${o} absente du module`).toBe(true);
      });
    }
  });

  it('la طريقة et la chaîne de دوري الآن', () => {
    expect(same(evaluate('\\frac{3^7 \\times 2^4}{2^2 \\times 3^5}'), R(BigInt(METHOD.simplify.numbers.value)))).toBe(true);
    expect(same(evaluate(METHOD.chain.tex), R(BigInt(METHOD.chain.value)))).toBe(true);
    expect(same(evaluate('5 - 2 \\times (-3)^2'), R(-13n))).toBe(true);
    expect(same(evaluate('-3^2 + (-3)^2'), R(0n))).toBe(true);
  });

  it('« أستعدّ » : chaque affirmation a la vérité qu’elle annonce', () => {
    const claims = [
      [PREP_ITEMS[0], same(evaluate('3*3*3*3*3'), R(15n))],
      [PREP_ITEMS[1], same(evaluate('(-5) \\times (-5) \\times (-5)'), R(-125n))],
      [PREP_PLATFORM_ITEMS[0], same(evaluate('(-4) \\times (-6)'), R(-24n))],
      [PREP_PLATFORM_ITEMS[1], same(evaluate('2 + 3 \\times 4'), R(20n))],
      [PREP_PLATFORM_ITEMS[2], same(evaluate('18 - 6 \\div 2'), R(15n))],
      [PREP_PLATFORM_ITEMS[3], same(evaluate('10^3 \\times 10^4'), evaluate('10^7'))],
      [PREP_PLATFORM_ITEMS[4], same(evaluate('\\frac{10^6}{10^2}'), evaluate('10^3'))],
    ];
    for (const [item, truth] of claims) expect(item.answer, item.text).toBe(truth);
  });

  it('le labo de l’entrée : chaque charge cible est une puissance de la base sur le rail (−5 … 6)', () => {
    for (const lv of ['beginner', 'advanced']) {
      const base = evaluate(LAB[lv].base);
      for (const t of LAB[lv].targets) {
        const target = evaluate(t.includes('/') ? `\\frac{${t.split('/')[0].replace('-', '')}}{${t.split('/')[1]}}` : t.replace('-', '0-'));
        const want = t.startsWith('-') && t.includes('/') ? neg(target) : target;
        const hits = [];
        for (let e = -5; e <= 6; e += 1) if (same(pow(base, e), want)) hits.push(e);
        expect(hits.length, `${lv} ${t}`).toBe(1);
      }
    }
  });
});
