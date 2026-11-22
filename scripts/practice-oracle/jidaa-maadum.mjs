// Oracle du banc « jidaa-maadum » (unité 4 « معادلات ومتراجحات ») — feuilles d'examen BEM (2026-10-07).
// Chaque réponse est RECALCULÉE ici à partir des nombres de l'énoncé, sans lire le contenu ni le code testé.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Un petit analyseur d'expressions POLYNOMIALES (nombres à virgule ou point, x, + − × / ^, parenthèses,
// produit implicite « 3x », « 7(x + 2) », « (x − 4)(9 − x) ») vers les polynômes exacts de helpers.mjs :
//   coef(src, k)        le coefficient de x^k de l'expression développée (étapes « انشر وبسّط »)
//   lo(eq) / hi(eq)     la plus petite / la plus grande racine de l'équation (« L = R », ou « src = 0 »)
//   one(eq)             l'unique racine (équation à une seule solution, p. ex. 7(x + 2) = 0, (x + 7)^2 = 0)
//   set(eq)             l'ensemble des racines, toutes entières naturelles (answerType integerSet)
//   pos(eq), above(eq, s)  l'unique racine > 0 (ou > s) : la grandeur de la وضعية, l'autre racine rejetée
//   fit(E, tpl, opts)   l'unique entier m tel que tpl(m) soit POLYNOMIALEMENT égal à E (étapes « حلّل » :
//                        « يُكتب E على الشكل (x − 2)(x − m) ») ; balayage −1000 … 1000 (ou 0 … 1000 si natural)
// Racines : degré 1 ou 2 (un facteur constant est permis), discriminant carré parfait rationnel exigé ;
// sinon l'oracle lève une erreur et le test échoue. Les questions selfCheck (« بيّن أن »، « تحقّق ») n'ont pas de clé.
// Aucun sujet officiel n'appartient à cette leçon : feuilles « على منوال » et adaptées seulement.
import { R, q, poly } from './helpers.mjs';

function tokenize(src) {
  const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*').replace(/,/g, '.');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (/[\d.]/.test(s[i])) { let j = i; while (j < s.length && /[\d.]/.test(s[j])) j++; out.push({ t: 'n', v: s.slice(i, j) }); i = j; }
    else { out.push({ t: s[i] }); i++; }
  }
  return out;
}
/** Polynôme exact d'une expression en x. */
function P(src) {
  const toks = tokenize(src); let i = 0;
  const peek = () => toks[i]?.t;
  const atom = () => {
    const k = peek();
    if (k === 'n') return poly.of(poly.Q(toks[i++].v));
    if (k === 'x') { i++; return poly.x; }
    if (k === '(') { i++; const v = expr(); if (toks[i++]?.t !== ')') throw new Error(`parenthèse : ${src}`); return v; }
    throw new Error(`illisible : ${src}`);
  };
  const power = () => {
    let v = atom();
    while (peek() === '^') { i++; const e = toks[i++]; if (e?.t !== 'n') throw new Error(`exposant : ${src}`); v = v.pow(Number(e.v)); }
    return v;
  };
  const unary = () => {
    if (peek() === '-') { i++; return unary().mul(-1); }
    if (peek() === '+') { i++; return unary(); }
    return power();
  };
  const term = () => {
    let v = unary();
    for (;;) {
      const k = peek();
      if (k === '*') { i++; v = v.mul(unary()); }
      else if (k === '/') { i++; const d = unary(); if (d.degree() > 0) throw new Error(`division : ${src}`); v = v.mul(poly.Q(1).div(poly.Q(d.coef(0)))); }
      else if (k === 'n' || k === 'x' || k === '(') v = v.mul(power());
      else return v;
    }
  };
  const expr = () => {
    let v = term();
    while (peek() === '+' || peek() === '-') { const op = toks[i++].t; const w = term(); v = op === '+' ? v.add(w) : v.sub(w); }
    return v;
  };
  const v = expr();
  if (i !== toks.length) throw new Error(`reste : ${src}`);
  return v;
}
const eqPoly = (eq) => { const [L, Rr = '0'] = String(eq).split('='); return P(L).sub(P(Rr)); };
const cmp = (u, v) => { const d = q(u).sub(q(v)); return d.isZero() ? 0 : d.n < 0n ? -1 : 1; };

/** Racine carrée exacte d'un rationnel positif, ou null. */
function sqrtQ(v) {
  const isq = (n) => { if (n < 0n) return null; let r = BigInt(Math.floor(Math.sqrt(Number(n)))); while (r * r > n) r--; while ((r + 1n) * (r + 1n) <= n) r++; return r * r === n ? r : null; };
  const a = isq(v.n); const b = isq(v.d);
  return a === null || b === null ? null : q(`${a}/${b}`);
}
/** Les racines distinctes, triées, d'une équation de degré 1 ou 2 (exactes). */
function roots(eq) {
  const Pp = eqPoly(eq);
  const d = Pp.degree();
  if (d === 1) return [q(Pp.coef(0)).neg().div(q(Pp.coef(1))).toString()];
  if (d !== 2) throw new Error(`jidaa-maadum oracle: degré ${d} pour ${eq}`);
  const [c, b, a] = [0, 1, 2].map((k) => q(Pp.coef(k)));
  const disc = b.mul(b).sub(a.mul(c).mul(4));
  if (disc.n < 0n) throw new Error(`jidaa-maadum oracle: pas de racine pour ${eq}`);
  const s = sqrtQ(disc);
  if (!s) throw new Error(`jidaa-maadum oracle: racines irrationnelles pour ${eq}`);
  const r = [b.neg().sub(s).div(a.mul(2)), b.neg().add(s).div(a.mul(2))].map(String);
  for (const x of r) if (Pp.at(x) !== '0') throw new Error(`jidaa-maadum oracle: ${x} n'annule pas ${eq}`);
  return [...new Set(r)].sort(cmp);
}
const lo = (eq) => R(roots(eq)[0]);
const hi = (eq) => R(roots(eq).at(-1));
function one(eq) { const r = roots(eq); if (r.length !== 1) throw new Error(`jidaa-maadum oracle: ${r.length} racines pour ${eq}`); return R(r[0]); }
function set(eq) {
  const r = roots(eq);
  if (!r.every((v) => /^\d+$/.test(v))) throw new Error(`jidaa-maadum oracle: racines non naturelles pour ${eq}`);
  return { value: r.map(Number).sort((a, b) => a - b).join(', ') };
}
function above(eq, s = 0) {
  const r = roots(eq).filter((v) => cmp(v, s) > 0);
  if (r.length !== 1) throw new Error(`jidaa-maadum oracle: ${r.length} racines > ${s} pour ${eq}`);
  return r[0];
}
const pos = (eq) => above(eq, 0);
const coef = (src, k) => R(P(src).coef(k));
/** L'unique entier m (balayage) tel que tpl(m) ≡ E. tpl contient la lettre `letter`. */
function fit(E, tpl, { letter = 'm', natural = false } = {}) {
  const target = P(E);
  const ok = [];
  for (let m = natural ? 0 : -1000; m <= 1000; m++) {
    if (P(tpl.split(letter).join(`(${m})`)).equals(target)) ok.push(m);
  }
  if (ok.length !== 1) throw new Error(`jidaa-maadum oracle: ${ok.length} valeurs pour ${tpl} ≡ ${E}`);
  return R(ok[0]);
}
/** Valeur exacte a + b√2 d'un polynôme en x = u + v√2 (Horner dans Q(√2)) → [a, b]. */
function atSqrt2(src, u, v) {
  const Pp = P(src);
  let a = q(0); let b = q(0);
  for (let k = Pp.degree(); k >= 0; k--) {
    // (a + b√2)(u + v√2) = (au + 2bv) + (av + bu)√2
    [a, b] = [a.mul(u).add(b.mul(v).mul(2)), a.mul(v).add(b.mul(u))];
    a = a.add(q(Pp.coef(k)));
  }
  return [a.toString(), b.toString()];
}

// l5-010 : t tel que 36 + t = 3(6 + t), avec les âges recalculés.
const yusuf = pos('x^2 = x + 30');
const father = q(yusuf).mul(q(yusuf)).toString();
const F09 = atSqrt2('(2x - 5)^2 - 9', q(1), q(1));

export const ORACLE = {
  // ── Niveau 1 ──
  'ex-4am-jidaa-maadum-l1-001:q1': one('7(x + 2) = 0'),
  'ex-4am-jidaa-maadum-l1-001:q2': lo('(x + 5)(2 - x) = 0'),
  'ex-4am-jidaa-maadum-l1-001:q3': hi('(x + 5)(2 - x) = 0'),
  // a × b = 0 avec a = −3/7 ≠ 0 : b = 0 / a
  'ex-4am-jidaa-maadum-l1-002:q1': R(q(0).div(q('-3/7'))),
  'ex-4am-jidaa-maadum-l1-002:q2': one('4(2x - 9) = 0'),
  'ex-4am-jidaa-maadum-l1-003:q1': set('(x - 4)(9 - x) = 0'),
  'ex-4am-jidaa-maadum-l1-004:q1': lo('(5x - 1)(x - 2) = 0'),
  'ex-4am-jidaa-maadum-l1-004:q2': hi('(5x - 1)(x - 2) = 0'),
  'ex-4am-jidaa-maadum-l1-005:q1': lo('(x - 3)(x + 8) = 0'),
  'ex-4am-jidaa-maadum-l1-005:q2': hi('(x - 3)(x + 8) = 0'),
  'ex-4am-jidaa-maadum-l1-006:q1': one('4(x - 6) = 0'),
  'ex-4am-jidaa-maadum-l1-006:q2': one('-2x = 0'),
  'ex-4am-jidaa-maadum-l1-007:q1': set('x(x - 1) = 0'),
  'ex-4am-jidaa-maadum-l1-007:q2': one('(x + 7)^2 = 0'),
  'ex-4am-jidaa-maadum-l1-008:q2': one('3(x - 5) = 0'),
  // (ax + b)(cx + d) : a = coefficient de x du 1er facteur, d = constante du 2e
  'ex-4am-jidaa-maadum-l1-009:q1': coef('5x - 2', 1),
  'ex-4am-jidaa-maadum-l1-009:q2': coef('-x + 4', 0),
  'ex-4am-jidaa-maadum-l1-009:q3': lo('(5x - 2)(-x + 4) = 0'),
  'ex-4am-jidaa-maadum-l1-009:q4': hi('(5x - 2)(-x + 4) = 0'),
  'ex-4am-jidaa-maadum-l1-010:q1': lo('(2x + 4)(-3 - 2x) = 0'),
  'ex-4am-jidaa-maadum-l1-010:q2': hi('(2x + 4)(-3 - 2x) = 0'),
  // ── Niveau 2 ──
  'ex-4am-jidaa-maadum-l2-001:q1': set('2/3 x(x - 4) = 0'),
  'ex-4am-jidaa-maadum-l2-001:q2': lo('(5 - 3x)(2x - 4) = 0'),
  'ex-4am-jidaa-maadum-l2-001:q3': hi('(5 - 3x)(2x - 4) = 0'),
  'ex-4am-jidaa-maadum-l2-002:q1': lo('(3x - 4)(-2x + 1) = 0'),
  'ex-4am-jidaa-maadum-l2-002:q2': hi('(3x - 4)(-2x + 1) = 0'),
  'ex-4am-jidaa-maadum-l2-003:q1': coef('-1,2(3x + 2,7)', 1),
  'ex-4am-jidaa-maadum-l2-003:q2': coef('-1,2(3x + 2,7)', 0),
  'ex-4am-jidaa-maadum-l2-003:q3': one('-1,2(3x + 2,7) = 0'),
  'ex-4am-jidaa-maadum-l2-004:q2': lo('x^2 + 3x - 10 = 0'),
  'ex-4am-jidaa-maadum-l2-004:q3': hi('x^2 + 3x - 10 = 0'),
  'ex-4am-jidaa-maadum-l2-005:q1': lo('(2x - 5)(3x + 1) = 0'),
  'ex-4am-jidaa-maadum-l2-005:q2': hi('(2x - 5)(3x + 1) = 0'),
  'ex-4am-jidaa-maadum-l2-006:q1': fit('(x - 2)(x - 11) + 3(x - 2)', '(x - 2)(x - m)'),
  'ex-4am-jidaa-maadum-l2-006:q2': set('(x - 2)(x - 11) + 3(x - 2) = 0'),
  'ex-4am-jidaa-maadum-l2-007:q1': lo('(x - 1,5)(2x + 0,6) = 0'),
  'ex-4am-jidaa-maadum-l2-007:q2': hi('(x - 1,5)(2x + 0,6) = 0'),
  'ex-4am-jidaa-maadum-l2-008:q1': coef('-3x + 2', 1),
  'ex-4am-jidaa-maadum-l2-008:q2': coef('-3x + 2', 0),
  'ex-4am-jidaa-maadum-l2-008:q3': lo('(-3x + 2)(x - 7) = 0'),
  'ex-4am-jidaa-maadum-l2-008:q4': hi('(-3x + 2)(x - 7) = 0'),
  'ex-4am-jidaa-maadum-l2-009:q1': fit('(2x + 3)^2 - 49', '(2x - 4)(2x + m)'),
  'ex-4am-jidaa-maadum-l2-009:q2': lo('(2x + 3)^2 - 49 = 0'),
  'ex-4am-jidaa-maadum-l2-009:q3': hi('(2x + 3)^2 - 49 = 0'),
  'ex-4am-jidaa-maadum-l2-010:q1': lo('(x + 6)(5x - 1) = 0'),
  'ex-4am-jidaa-maadum-l2-010:q2': hi('(x + 6)(5x - 1) = 0'),
  // ── Niveau 3 ──
  'ex-4am-jidaa-maadum-l3-001:q1': fit('6x^2 - 3x', '3x(2x - m)'),
  'ex-4am-jidaa-maadum-l3-001:q2': lo('6x^2 - 3x = 0'),
  'ex-4am-jidaa-maadum-l3-001:q3': hi('6x^2 - 3x = 0'),
  'ex-4am-jidaa-maadum-l3-002:q1': fit('5(x + 3) + (x - 1)(x + 3)', '(x + 3)(x + m)'),
  'ex-4am-jidaa-maadum-l3-002:q2': lo('5(x + 3) + (x - 1)(x + 3) = 0'),
  'ex-4am-jidaa-maadum-l3-002:q3': hi('5(x + 3) + (x - 1)(x + 3) = 0'),
  'ex-4am-jidaa-maadum-l3-003:q1': fit('(1 - 4x)(x + 3) + 7(x + 3)', '(x + 3)(m - 4x)'),
  'ex-4am-jidaa-maadum-l3-003:q2': lo('(1 - 4x)(x + 3) + 7(x + 3) = 0'),
  'ex-4am-jidaa-maadum-l3-003:q3': hi('(1 - 4x)(x + 3) + 7(x + 3) = 0'),
  'ex-4am-jidaa-maadum-l3-004:q1': set('4x(-x + 1) = 0'),
  'ex-4am-jidaa-maadum-l3-004:q2': lo('9x^2 = 4x'),
  'ex-4am-jidaa-maadum-l3-004:q3': hi('9x^2 = 4x'),
  'ex-4am-jidaa-maadum-l3-005:q1': coef('6^2 - (x - 3)^2 - (x + 3)', 2),
  'ex-4am-jidaa-maadum-l3-005:q2': coef('6^2 - (x - 3)^2 - (x + 3)', 1),
  'ex-4am-jidaa-maadum-l3-005:q3': coef('6^2 - (x - 3)^2 - (x + 3)', 0),
  'ex-4am-jidaa-maadum-l3-005:q4': fit('6^2 - (x - 3)^2', '(x + 3)(n - x)', { letter: 'n' }),
  'ex-4am-jidaa-maadum-l3-005:q5': fit('6^2 - (x - 3)^2 - (x + 3)', '(x + 3)(p - x)', { letter: 'p' }),
  'ex-4am-jidaa-maadum-l3-005:q6': lo('6^2 - (x - 3)^2 - (x + 3) = 0'),
  'ex-4am-jidaa-maadum-l3-005:q7': hi('6^2 - (x - 3)^2 - (x + 3) = 0'),
  'ex-4am-jidaa-maadum-l3-006:q1': coef('3x - 12 - (x - 4)^2', 2),
  'ex-4am-jidaa-maadum-l3-006:q2': coef('3x - 12 - (x - 4)^2', 1),
  'ex-4am-jidaa-maadum-l3-006:q3': coef('3x - 12 - (x - 4)^2', 0),
  'ex-4am-jidaa-maadum-l3-006:q4': fit('3x - 12 - (x - 4)^2', '(x - 4)(m - x)'),
  'ex-4am-jidaa-maadum-l3-006:q5': set('3x - 12 - (x - 4)^2 = 0'),
  'ex-4am-jidaa-maadum-l3-007:q1': coef('(2x - 5)^2 - (x + 1)(2x - 5)', 2),
  'ex-4am-jidaa-maadum-l3-007:q2': coef('(2x - 5)^2 - (x + 1)(2x - 5)', 1),
  'ex-4am-jidaa-maadum-l3-007:q3': coef('(2x - 5)^2 - (x + 1)(2x - 5)', 0),
  'ex-4am-jidaa-maadum-l3-007:q4': fit('(2x - 5)^2 - (x + 1)(2x - 5)', '(2x - 5)(x - m)'),
  'ex-4am-jidaa-maadum-l3-007:q5': lo('(2x - 5)^2 - (x + 1)(2x - 5) = 0'),
  'ex-4am-jidaa-maadum-l3-007:q6': hi('(2x - 5)^2 - (x + 1)(2x - 5) = 0'),
  'ex-4am-jidaa-maadum-l3-008:q1': fit('(1 - 2x)(4x - 3) - 3(4x - 3)', '(4x - 3)(m - 2x)'),
  'ex-4am-jidaa-maadum-l3-008:q2': lo('(1 - 2x)(4x - 3) - 3(4x - 3) = 0'),
  'ex-4am-jidaa-maadum-l3-008:q3': hi('(1 - 2x)(4x - 3) - 3(4x - 3) = 0'),
  'ex-4am-jidaa-maadum-l3-009:q1': coef('(2x + 3)^2 - (x - 1)^2', 2),
  'ex-4am-jidaa-maadum-l3-009:q2': coef('(2x + 3)^2 - (x - 1)^2', 1),
  'ex-4am-jidaa-maadum-l3-009:q3': coef('(2x + 3)^2 - (x - 1)^2', 0),
  'ex-4am-jidaa-maadum-l3-009:q4': fit('(2x + 3)^2 - (x - 1)^2', '(x + 4)(3x + m)'),
  'ex-4am-jidaa-maadum-l3-009:q5': lo('(2x + 3)^2 - (x - 1)^2 = 0'),
  'ex-4am-jidaa-maadum-l3-009:q6': hi('(2x + 3)^2 - (x - 1)^2 = 0'),
  'ex-4am-jidaa-maadum-l3-010:q1': coef('(3x - 1)(x - 4)', 2),
  'ex-4am-jidaa-maadum-l3-010:q2': coef('(3x - 1)(x - 4)', 1),
  'ex-4am-jidaa-maadum-l3-010:q3': coef('(3x - 1)(x - 4)', 0),
  'ex-4am-jidaa-maadum-l3-010:q4': fit('3x^2 - 13x + 4 - (3x - 1)(2x + 3)', '(3x - 1)(-x - m)'),
  'ex-4am-jidaa-maadum-l3-010:q5': lo('3x^2 - 13x + 4 - (3x - 1)(2x + 3) = 0'),
  'ex-4am-jidaa-maadum-l3-010:q6': hi('3x^2 - 13x + 4 - (3x - 1)(2x + 3) = 0'),
  // ── Niveau 4 ──
  'ex-4am-jidaa-maadum-l4-001:q1': fit('x^2 - 25', '(x - 5)(x + m)'),
  'ex-4am-jidaa-maadum-l4-001:q2': lo('x^2 - 25 = 0'),
  'ex-4am-jidaa-maadum-l4-001:q3': hi('x^2 - 25 = 0'),
  'ex-4am-jidaa-maadum-l4-002:q1': fit('9x^2 - 1', '(3x - 1)(3x + m)'),
  'ex-4am-jidaa-maadum-l4-002:q2': fit('(9x^2 - 1) + 6x^2 + 7x - 3', '(3x - 1)(5x + m)'),
  'ex-4am-jidaa-maadum-l4-002:q3': lo('(9x^2 - 1) + 6x^2 + 7x - 3 = 0'),
  'ex-4am-jidaa-maadum-l4-002:q4': hi('(9x^2 - 1) + 6x^2 + 7x - 3 = 0'),
  'ex-4am-jidaa-maadum-l4-003:q1': fit('x^2 + 10x + 25', '(x + m)^2'),
  'ex-4am-jidaa-maadum-l4-003:q2': fit('(x^2 + 10x + 25) - (x^2 - 25)', 'k(x + 5)', { letter: 'k' }),
  'ex-4am-jidaa-maadum-l4-003:q3': one('(x^2 + 10x + 25) - (x^2 - 25) = 0'),
  'ex-4am-jidaa-maadum-l4-004:q2': fit('4x^2 - 4x - 80', '(2x - 10)(2x + m)'),
  'ex-4am-jidaa-maadum-l4-004:q3': lo('4x^2 - 4x - 80 = 0'),
  'ex-4am-jidaa-maadum-l4-004:q4': hi('4x^2 - 4x - 80 = 0'),
  'ex-4am-jidaa-maadum-l4-005:q1': one('(2x + 1)^2 = 0'),
  'ex-4am-jidaa-maadum-l4-005:q2': lo('4x^2 - 1 = 0'),
  'ex-4am-jidaa-maadum-l4-005:q3': hi('4x^2 - 1 = 0'),
  'ex-4am-jidaa-maadum-l4-006:q2': fit('3x^2 - 5x + 2 + (3x - 2)(2x + 5)', '(3x - 2)(3x + m)'),
  'ex-4am-jidaa-maadum-l4-006:q3': lo('3x^2 - 5x + 2 + (3x - 2)(2x + 5) = 0'),
  'ex-4am-jidaa-maadum-l4-006:q4': hi('3x^2 - 5x + 2 + (3x - 2)(2x + 5) = 0'),
  'ex-4am-jidaa-maadum-l4-007:q2': fit('(x + 6)^2 - 121', '(x - 5)(x + m)'),
  'ex-4am-jidaa-maadum-l4-007:q3': lo('x^2 + 12x = 85'),
  'ex-4am-jidaa-maadum-l4-007:q4': hi('x^2 + 12x = 85'),
  // x est un côté : la racine positive
  'ex-4am-jidaa-maadum-l4-007:q5': R(pos('x^2 + 12x = 85')),
  'ex-4am-jidaa-maadum-l4-008:q2': fit('x^2 - 10x + 21', '(x - 3)(x - m)'),
  'ex-4am-jidaa-maadum-l4-008:q3': set('x^2 + 21 = 10x'),
  'ex-4am-jidaa-maadum-l4-009:q2': fit('(2x - 5)^2 - 9', '(2x - 8)(2x - m)'),
  'ex-4am-jidaa-maadum-l4-009:q3': set('(2x - 5)^2 - 9 = 0'),
  // F(1 + √2) = a + b√2, calculé dans Q(√2)
  'ex-4am-jidaa-maadum-l4-009:q4': R(F09[0]),
  'ex-4am-jidaa-maadum-l4-009:q5': R(F09[1]),
  'ex-4am-jidaa-maadum-l4-010:q2': fit('25x^2 - 9 + (x + 2)(5x - 3)', '(5x - 3)(6x + m)'),
  'ex-4am-jidaa-maadum-l4-010:q3': lo('25x^2 - 9 + (x + 2)(5x - 3) = 0'),
  'ex-4am-jidaa-maadum-l4-010:q4': hi('25x^2 - 9 + (x + 2)(5x - 3) = 0'),
  // ── Niveau 5 : les équations sont REMISES EN ÉQUATION depuis la situation ──
  // 180 sièges, x rangées de x + 8 sièges
  'ex-4am-jidaa-maadum-l5-001:q1': coef('x(x + 8)', 1),
  'ex-4am-jidaa-maadum-l5-001:q3': lo('x(x + 8) = 180'),
  'ex-4am-jidaa-maadum-l5-001:q4': hi('x(x + 8) = 180'),
  'ex-4am-jidaa-maadum-l5-001:q5': R(pos('x(x + 8) = 180')),
  'ex-4am-jidaa-maadum-l5-001:q6': R(q(pos('x(x + 8) = 180')).add(8)),
  // échelle 13 m, pied à x, sommet à x + 7 (Pythagore)
  'ex-4am-jidaa-maadum-l5-002:q2': fit('x^2 + 7x - 60', '(x - 5)(x + m)'),
  'ex-4am-jidaa-maadum-l5-002:q3': lo('x^2 + (x + 7)^2 = 13^2'),
  'ex-4am-jidaa-maadum-l5-002:q4': hi('x^2 + (x + 7)^2 = 13^2'),
  'ex-4am-jidaa-maadum-l5-002:q5': R(pos('x^2 + (x + 7)^2 = 13^2')),
  'ex-4am-jidaa-maadum-l5-002:q6': R(q(pos('x^2 + (x + 7)^2 = 13^2')).add(7)),
  // deux pages consécutives, produit 420
  'ex-4am-jidaa-maadum-l5-003:q2': fit('x^2 + x - 420', '(x - 20)(x + m)'),
  'ex-4am-jidaa-maadum-l5-003:q3': lo('x(x + 1) = 420'),
  'ex-4am-jidaa-maadum-l5-003:q4': hi('x(x + 1) = 420'),
  'ex-4am-jidaa-maadum-l5-003:q5': { value: [Number(pos('x(x + 1) = 420')), Number(pos('x(x + 1) = 420')) + 1].join(', ') },
  // affiche : largeur x, longueur 2x + 3, aire 54
  'ex-4am-jidaa-maadum-l5-004:q1': coef('x(2x + 3)', 1),
  'ex-4am-jidaa-maadum-l5-004:q3': lo('x(2x + 3) = 54'),
  'ex-4am-jidaa-maadum-l5-004:q4': hi('x(2x + 3) = 54'),
  'ex-4am-jidaa-maadum-l5-004:q5': R(pos('x(2x + 3) = 54')),
  'ex-4am-jidaa-maadum-l5-004:q6': R(q(pos('x(2x + 3) = 54')).mul(2).add(3)),
  // boîte : côté x, carrés de 4 cm, volume 576 ; condition x > 8
  'ex-4am-jidaa-maadum-l5-005:q2': fit('(x - 8)^2 - 144', '(x - 20)(x + m)'),
  'ex-4am-jidaa-maadum-l5-005:q3': lo('4(x - 8)^2 = 576'),
  'ex-4am-jidaa-maadum-l5-005:q4': hi('4(x - 8)^2 = 576'),
  'ex-4am-jidaa-maadum-l5-005:q5': R(above('4(x - 8)^2 = 576', 8)),
  'ex-4am-jidaa-maadum-l5-005:q6': R(P('x^2 - 4 * 4^2').at(above('4(x - 8)^2 = 576', 8))),
  // champs : carré x², rectangle 20x, total 2400
  'ex-4am-jidaa-maadum-l5-006:q1': coef('x * x + 20x', 1),
  'ex-4am-jidaa-maadum-l5-006:q2': fit('x^2 + 20x - 2400', '(x - 40)(x + m)'),
  'ex-4am-jidaa-maadum-l5-006:q3': lo('x * x + 20x = 2400'),
  'ex-4am-jidaa-maadum-l5-006:q4': hi('x * x + 20x = 2400'),
  'ex-4am-jidaa-maadum-l5-006:q5': R(pos('x * x + 20x = 2400')),
  'ex-4am-jidaa-maadum-l5-006:q6': R(P('x^2').at(pos('x * x + 20x = 2400'))),
  // salles : 2x(x − 3) = x², condition x > 3
  'ex-4am-jidaa-maadum-l5-007:q2': fit('x^2 - 6x', 'x(x - m)'),
  'ex-4am-jidaa-maadum-l5-007:q3': set('2x(x - 3) = x^2'),
  'ex-4am-jidaa-maadum-l5-007:q4': R(above('2x(x - 3) = x^2', 3)),
  'ex-4am-jidaa-maadum-l5-007:q5': R(P('2x').at(above('2x(x - 3) = x^2', 3))),
  // puits : x² − 6² = 220 ; clôture 4x × 450 DA
  'ex-4am-jidaa-maadum-l5-008:q2': fit('x^2 - 256', '(x - m)(x + m)', { natural: true }),
  'ex-4am-jidaa-maadum-l5-008:q3': lo('x^2 - 6^2 = 220'),
  'ex-4am-jidaa-maadum-l5-008:q4': hi('x^2 - 6^2 = 220'),
  'ex-4am-jidaa-maadum-l5-008:q5': R(pos('x^2 - 6^2 = 220')),
  'ex-4am-jidaa-maadum-l5-008:q6': R(P('4x * 450').at(pos('x^2 - 6^2 = 220'))),
  // parking 40 × 25 agrandi de x : 1750 m² ; partie ajoutée × 1200 DA
  'ex-4am-jidaa-maadum-l5-009:q2': fit('x^2 + 65x - 750', '(x - 10)(x + m)'),
  'ex-4am-jidaa-maadum-l5-009:q3': lo('(40 + x)(25 + x) = 1750'),
  'ex-4am-jidaa-maadum-l5-009:q4': hi('(40 + x)(25 + x) = 1750'),
  'ex-4am-jidaa-maadum-l5-009:q5': R(pos('(40 + x)(25 + x) = 1750')),
  'ex-4am-jidaa-maadum-l5-009:q6': R(q(1750).sub(q(40).mul(25)).mul(1200)),
  // âges : x² = x + 30 ; puis 36 + t = 3(6 + t)
  'ex-4am-jidaa-maadum-l5-010:q2': fit('x^2 - x - 30', '(x - 6)(x + m)'),
  'ex-4am-jidaa-maadum-l5-010:q3': lo('x^2 = x + 30'),
  'ex-4am-jidaa-maadum-l5-010:q4': hi('x^2 = x + 30'),
  'ex-4am-jidaa-maadum-l5-010:q5': R(yusuf),
  'ex-4am-jidaa-maadum-l5-010:q6': R(father),
  'ex-4am-jidaa-maadum-l5-010:q7': one(`${father} + x = 3(${yusuf} + x)`),
};
