// Oracle du banc « muadala-ula » (unité 4 « معادلات ومتراجحات ») — feuilles d'examen BEM (2026-10-07).
// Chaque réponse est RECALCULÉE ici à partir des nombres de l'énoncé, sans lire le contenu ni le code testé.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Un petit analyseur d'expressions du PREMIER DEGRÉ (nombres à virgule ou point, x, + − × /, parenthèses,
// produit implicite « 3x », « 3(x − 2) ») et des rationnels exacts (helpers.mjs › q, poly) :
//   solveR(L, R)            la solution unique de L = R, en réponse construite
//   solution(L, R)          la même, en chaîne (pour la réinjecter dans valueR)
//   valueR(expr, x)         la valeur d'une expression du premier degré pour x
//   linA(expr) / linB(expr) les nombres a et b de l'écriture développée a·x + b
//   eqA(L, R) / eqB(L, R)   les nombres a et b de la forme ax = b obtenue en transposant L = R
//   zeroK(L, R)             k quand les termes en x s'annulent (0 × x = k) — l'égalité impossible
//   hasSolution(L, R)       « نعم » (A) si un nombre vérifie L = R, sinon « لا » (B)
//   isSolution(L, R, x)     « نعم » (A) si x vérifie l'égalité, sinon « لا » (B)
//   isNatural(L, R)         « نعم » (A) si la solution est un entier naturel, sinon « لا » (B)
//   cheapest(exprs, x)      la lettre (A, B, C…) de la formule la moins chère pour x
//   sqrtR(n)                la racine entière exacte de n (carré parfait vérifié)
//   polyCoef(P, k), polyRoot(P)  coefficient / racine d'un polynôme de degré 1 (helpers.mjs › poly)
// BEM 2010 I-1 (official) : 14 = (2a + 3 × 12)/5 → a = 17, comme le corrigé officiel.
import { R, C, q, poly } from './helpers.mjs';

const ZERO = q(0);
function tokenize(src) {
  const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/,/g, '.');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (/[\d.]/.test(s[i])) { let j = i; while (j < s.length && /[\d.]/.test(s[j])) j++; out.push({ t: 'n', v: q(s.slice(i, j)) }); i = j; }
    else { out.push({ t: s[i] }); i++; }
  }
  return out;
}
function parse(src) {
  const toks = tokenize(src); let i = 0;
  const peek = () => toks[i]?.t;
  const mul = ([a, b], [c, d]) => {
    if (!a.isZero() && !c.isZero()) throw new Error(`non linéaire : ${src}`);
    return [a.mul(d).add(c.mul(b)), b.mul(d)];
  };
  const factor = () => {
    const k = peek();
    if (k === '-') { i++; const [a, b] = factor(); return [a.neg(), b.neg()]; }
    if (k === '+') { i++; return factor(); }
    if (k === 'n') return [ZERO, toks[i++].v];
    if (k === 'x') { i++; return [q(1), ZERO]; }
    if (k === '(') { i++; const v = expr(); if (toks[i++]?.t !== ')') throw new Error(`parenthèse : ${src}`); return v; }
    throw new Error(`illisible : ${src}`);
  };
  const term = () => {
    let v = factor();
    for (;;) {
      const k = peek();
      if (k === '*') { i++; v = mul(v, factor()); }
      else if (k === '/') { i++; const [c, d] = factor(); if (!c.isZero() || d.isZero()) throw new Error(`division : ${src}`); v = [v[0].div(d), v[1].div(d)]; }
      else if (k === 'n' || k === 'x' || k === '(') v = mul(v, factor());
      else return v;
    }
  };
  const expr = () => {
    let [a, b] = term();
    while (peek() === '+' || peek() === '-') {
      const op = toks[i++].t; const [c, d] = term();
      [a, b] = op === '+' ? [a.add(c), b.add(d)] : [a.sub(c), b.sub(d)];
    }
    return [a, b];
  };
  const v = expr();
  if (i !== toks.length) throw new Error(`reste : ${src}`);
  return v;
}
function solutionOf(L, Rr) {
  const [a, b] = parse(L); const [c, d] = parse(Rr);
  const A = a.sub(c); const B = d.sub(b);
  if (A.isZero()) return B.isZero() ? 'all' : 'none';
  return B.div(A).toString();
}
const solveR = (L, Rr) => R(solution(L, Rr));
const valueR = (expr, x) => { const [a, b] = parse(expr); return R(a.mul(q(x)).add(b).toString()); };
const isSolution = (L, Rr, x) => { const [a, b] = parse(L); const [c, d] = parse(Rr); return C(a.mul(q(x)).add(b).sub(c.mul(q(x)).add(d)).isZero() ? 'A' : 'B'); };

const solution = (L, Rr) => { const s = solutionOf(L, Rr); if (s === 'none' || s === 'all') throw new Error(`muadala-ula oracle: pas de solution unique ${L}=${Rr}`); return s; };
const linA = (e) => R(parse(e)[0].toString());
const linB = (e) => R(parse(e)[1].toString());
const eqA = (L, Rr) => R(parse(L)[0].sub(parse(Rr)[0]).toString());
const eqB = (L, Rr) => R(parse(Rr)[1].sub(parse(L)[1]).toString());
const zeroK = (L, Rr) => {
  const [a, b] = parse(L); const [c, d] = parse(Rr);
  if (!a.sub(c).isZero()) throw new Error(`muadala-ula oracle: ${L}=${Rr} n'est pas de la forme 0 × x = k`);
  return R(d.sub(b).toString());
};
const hasSolution = (L, Rr) => C(solutionOf(L, Rr) === 'none' ? 'B' : 'A');
const isNatural = (L, Rr) => { const s = q(solution(L, Rr)); return C(s.d === 1n && s.n >= 0n ? 'A' : 'B'); };
const cheapest = (exprs, x) => {
  const costs = exprs.map((e) => { const [a, b] = parse(e); return a.mul(q(x)).add(b); });
  const min = costs.reduce((m, v) => (v.sub(m).n < 0n ? v : m));
  const hits = costs.map((v, i) => (v.sub(min).isZero() ? i : -1)).filter((i) => i >= 0);
  if (hits.length !== 1) throw new Error('muadala-ula oracle: égalité de coûts');
  return C('ABCD'[hits[0]]);
};
const sqrtR = (n) => { const r = BigInt(Math.round(Math.sqrt(Number(n)))); if (r * r !== BigInt(n)) throw new Error(`${n} n'est pas un carré`); return R(r.toString()); };
const polyCoef = (P, k) => R(P.coef(k));
const polyRoot = (P) => { if (P.degree() !== 1) throw new Error('polyRoot: degré ≠ 1'); return R(q(P.coef(0)).neg().div(q(P.coef(1))).toString()); };
// l4-004 : E = 4x² − 2(x + 5) − 3 − 2x(2x − 3)
const E4 = poly.x.pow(2).mul(4).sub(poly.x.add(5).mul(2)).sub(3).sub(poly.x.mul(2).mul(poly.x.mul(2).sub(3)));

export const ORACLE = {
  'ex-4am-muadala-ula-l1-001:q1': solveR('2x', '11'),
  'ex-4am-muadala-ula-l1-001:q2': solveR('-3x', '5'),
  'ex-4am-muadala-ula-l1-002:q1': solveR('2.8x', '5.6'),
  'ex-4am-muadala-ula-l1-002:q2': solveR('x/4', '7'),
  'ex-4am-muadala-ula-l1-003:q1': solveR('10x', '100'),
  'ex-4am-muadala-ula-l1-003:q2': solveR('100000x', '1000'),
  'ex-4am-muadala-ula-l1-004:q1': solveR('x+11', '2'),
  'ex-4am-muadala-ula-l1-004:q2': solveR('3.2+x', '5'),
  'ex-4am-muadala-ula-l1-005:q1': solveR('200x', '4400'),
  'ex-4am-muadala-ula-l1-005:q2': solveR('120x+800', '4400'),
  'ex-4am-muadala-ula-l1-006:q1': solveR('-5x', '20'),
  'ex-4am-muadala-ula-l1-006:q2': solveR('-7x', '-2'),
  'ex-4am-muadala-ula-l1-007:q1': solveR('x-9', '-4'),
  'ex-4am-muadala-ula-l1-007:q2': solveR('x+7', '-3'),
  'ex-4am-muadala-ula-l1-008:q1': isSolution('3x', '-12', '-4'),
  'ex-4am-muadala-ula-l1-008:q2': isSolution('x+5', '2', '7'),
  'ex-4am-muadala-ula-l1-008:q3': solveR('x+5', '2'),
  'ex-4am-muadala-ula-l1-009:q1': solveR('9x', '6'),
  'ex-4am-muadala-ula-l1-009:q2': solveR('8x', '-3'),
  'ex-4am-muadala-ula-l1-010:q1': solveR('40x', '1200'),
  'ex-4am-muadala-ula-l1-010:q2': solveR('25x+300', '1200'),
  'ex-4am-muadala-ula-l2-001:q1': valueR('8+5', '0'),
  'ex-4am-muadala-ula-l2-001:q2': solveR('2x', '13'),
  'ex-4am-muadala-ula-l2-002:q1': valueR('(3x+2)*3-5', '2'),
  'ex-4am-muadala-ula-l2-002:q3': solveR('9x+1', '-26'),
  'ex-4am-muadala-ula-l2-003:q1': valueR('11-6', '0'),
  'ex-4am-muadala-ula-l2-003:q2': solveR('5x', '5'),
  'ex-4am-muadala-ula-l2-004:q1': solveR('7-2x', '0'),
  'ex-4am-muadala-ula-l2-005:q1': valueR('(15+2x)/3', '12'),
  'ex-4am-muadala-ula-l2-005:q2': solveR('(11+2x)/3', '14'),
  'ex-4am-muadala-ula-l2-006:q1': solveR('6x+5', '-13'),
  'ex-4am-muadala-ula-l2-006:q2': solveR('2x+9', '4'),
  'ex-4am-muadala-ula-l2-007:q1': solveR('-4x+1', '13'),
  'ex-4am-muadala-ula-l2-007:q2': solveR('10-3x', '-5'),
  'ex-4am-muadala-ula-l2-008:q1': solveR('x+x+3', '35'),
  'ex-4am-muadala-ula-l2-008:q2': valueR('x+3', '16'),
  'ex-4am-muadala-ula-l2-009:q1': solveR('17', '5x+2'),
  'ex-4am-muadala-ula-l2-009:q2': solveR('-8', '3x+4'),
  'ex-4am-muadala-ula-l2-010:q1': solveR('5x-4', '-19'),
  'ex-4am-muadala-ula-l2-010:q2': isSolution('5x-4', '-19', '3'),
  'ex-4am-muadala-ula-l3-001:q1': eqA('4x-3', '2x+6'),
  'ex-4am-muadala-ula-l3-001:q2': eqB('4x-3', '2x+6'),
  'ex-4am-muadala-ula-l3-001:q3': solveR('4x-3', '2x+6'),
  'ex-4am-muadala-ula-l3-002:q2': solveR('9x+1', '2x'),
  'ex-4am-muadala-ula-l3-002:q3': isNatural('9x+1', '2x'),
  'ex-4am-muadala-ula-l3-003:q1': solveR('2x-3', '3x+1'),
  'ex-4am-muadala-ula-l3-003:q2': solveR('4x-3', '-2x+5'),
  'ex-4am-muadala-ula-l3-004:q1': solveR('5x+11', '11x+5'),
  'ex-4am-muadala-ula-l3-004:q2': valueR('5x+11', solution('5x+11', '11x+5')),
  'ex-4am-muadala-ula-l3-005:q1': solveR('7x+2', '3x+14'),
  'ex-4am-muadala-ula-l3-005:q2': solveR('5x-6', '2x+9'),
  'ex-4am-muadala-ula-l3-006:q1': valueR('(14+3x)/4', '10'),
  'ex-4am-muadala-ula-l3-006:q2': solveR('(16+3x)/4', '13'),
  'ex-4am-muadala-ula-l3-006:q3': solveR('(12+3x)/4', '15'),
  'ex-4am-muadala-ula-l3-007:q1': solveR('8x-1', '2x+3'),
  'ex-4am-muadala-ula-l3-007:q2': solveR('x+5', '6x-2'),
  'ex-4am-muadala-ula-l3-008:q1': solveR('(2x+3*12)/5', '14'),
  'ex-4am-muadala-ula-l3-009:q1': solveR('3x+8', '8-5x'),
  'ex-4am-muadala-ula-l3-009:q2': isSolution('7x', '2x', '0'),
  'ex-4am-muadala-ula-l3-010:q1': solveR('150x', '3600'),
  'ex-4am-muadala-ula-l3-010:q2': solveR('100x+600', '3600'),
  'ex-4am-muadala-ula-l3-010:q3': solveR('150x', '100x+600'),
  'ex-4am-muadala-ula-l4-001:q1': eqA('2.5x+4.6', '1.3x-0.2'),
  'ex-4am-muadala-ula-l4-001:q2': eqB('2.5x+4.6', '1.3x-0.2'),
  'ex-4am-muadala-ula-l4-001:q3': solveR('2.5x+4.6', '1.3x-0.2'),
  'ex-4am-muadala-ula-l4-002:q1': linA('2x+24-7(x-2)'),
  'ex-4am-muadala-ula-l4-002:q2': linB('2x+24-7(x-2)'),
  'ex-4am-muadala-ula-l4-002:q3': solveR('2x+24-7(x-2)', '138'),
  'ex-4am-muadala-ula-l4-003:q1': linA('2(2x-1)+3'),
  'ex-4am-muadala-ula-l4-003:q2': linB('2(2x-1)+3'),
  'ex-4am-muadala-ula-l4-003:q3': linA('5(x+3)-3x'),
  'ex-4am-muadala-ula-l4-003:q4': linB('5(x+3)-3x'),
  'ex-4am-muadala-ula-l4-003:q5': solveR('2(2x-1)+3', '5(x+3)-3x'),
  'ex-4am-muadala-ula-l4-004:q1': solveR('1/2(2x-1)-3(2/3x-1/2)', '0'),
  'ex-4am-muadala-ula-l4-004:q2': polyCoef(E4, 1),
  'ex-4am-muadala-ula-l4-004:q3': polyCoef(E4, 0),
  'ex-4am-muadala-ula-l4-004:q4': polyRoot(E4),
  'ex-4am-muadala-ula-l4-005:q1': solveR('(x-1)/9', '(x+1)/3'),
  'ex-4am-muadala-ula-l4-005:q2': solveR('x', '(x+3)/5+1'),
  'ex-4am-muadala-ula-l4-006:q1': solveR('(x+4)/10', '3/10-2x/5'),
  'ex-4am-muadala-ula-l4-006:q2': zeroK('(2+x)/2*4', '(2x+1)/4*4'),
  'ex-4am-muadala-ula-l4-006:q3': hasSolution('(2+x)/2', '(2x+1)/4'),
  'ex-4am-muadala-ula-l4-007:q1': solveR('0.5x+1.2', '3.7'),
  'ex-4am-muadala-ula-l4-007:q2': solveR('1.4x-2', '0.4x+3'),
  'ex-4am-muadala-ula-l4-008:q1': solveR('2(x+4)', '3(x-1)'),
  'ex-4am-muadala-ula-l4-008:q2': solveR('4(x-1)+x', '2(x+5)'),
  'ex-4am-muadala-ula-l4-009:q1': solveR('(-x+3)/2', '(2x+1)/3'),
  'ex-4am-muadala-ula-l4-009:q2': solveR('2x-1/3', 'x/5+2'),
  'ex-4am-muadala-ula-l4-010:q1': linA('(46-x)*16/2'),
  'ex-4am-muadala-ula-l4-010:q2': linB('(46-x)*16/2'),
  'ex-4am-muadala-ula-l4-010:q3': linA('(30+x)*16/2'),
  'ex-4am-muadala-ula-l4-010:q4': linB('(30+x)*16/2'),
  'ex-4am-muadala-ula-l4-010:q5': solveR('(46-x)*16/2', '(30+x)*16/2'),
  'ex-4am-muadala-ula-l4-010:q6': valueR('(30+x)*16/2', solution('(46-x)*16/2', '(30+x)*16/2')),
  'ex-4am-muadala-ula-l5-001:q1': solveR('300x', '7500'),
  'ex-4am-muadala-ula-l5-001:q2': solveR('200x+1500', '7500'),
  'ex-4am-muadala-ula-l5-001:q3': solveR('300x', '200x+1500'),
  'ex-4am-muadala-ula-l5-001:q4': valueR('300x', solution('300x', '200x+1500')),
  'ex-4am-muadala-ula-l5-001:q5': cheapest(['300x', '200x+1500'], '18'),
  'ex-4am-muadala-ula-l5-002:q1': solveR('2(x+x+14)', '172'),
  'ex-4am-muadala-ula-l5-002:q2': valueR('x+14', solution('2(x+x+14)', '172')),
  'ex-4am-muadala-ula-l5-002:q3': R(q(36).mul(50).mul(1200)),
  'ex-4am-muadala-ula-l5-003:q1': linA('30x/2'),
  'ex-4am-muadala-ula-l5-003:q2': linB('80*30-30x/2'),
  'ex-4am-muadala-ula-l5-003:q3': solveR('80*30-30x/2', '3*(30x/2)'),
  'ex-4am-muadala-ula-l5-003:q4': valueR('80*30-30x/2', solution('80*30-30x/2', '3*(30x/2)')),
  'ex-4am-muadala-ula-l5-004:q1': sqrtR('576'),
  'ex-4am-muadala-ula-l5-004:q2': linA('16x/2'),
  'ex-4am-muadala-ula-l5-004:q3': linA('576-16x/2'),
  'ex-4am-muadala-ula-l5-004:q4': solveR('576-16x/2', '5*(16x/2)'),
  'ex-4am-muadala-ula-l5-005:q1': valueR('120x', '20'),
  'ex-4am-muadala-ula-l5-005:q2': valueR('90x+900', '20'),
  'ex-4am-muadala-ula-l5-005:q3': solveR('120x', '90x+900'),
  'ex-4am-muadala-ula-l5-005:q4': solveR('90x+900', '4590'),
  'ex-4am-muadala-ula-l5-006:q1': valueR('150x+18000', '80'),
  'ex-4am-muadala-ula-l5-006:q2': valueR('90x+24000', '80'),
  'ex-4am-muadala-ula-l5-006:q3': solveR('150x+18000', '90x+24000'),
  'ex-4am-muadala-ula-l5-006:q4': solveR('150x+18000', '36000'),
  'ex-4am-muadala-ula-l5-007:q1': valueR('450-15x', '4'),
  'ex-4am-muadala-ula-l5-007:q2': valueR('15x', '4'),
  'ex-4am-muadala-ula-l5-007:q3': solveR('450-15x', '15x'),
  'ex-4am-muadala-ula-l5-007:q4': solveR('15x', '2(450-15x)'),
  'ex-4am-muadala-ula-l5-008:q1': valueR('30x', '150'),
  'ex-4am-muadala-ula-l5-008:q2': valueR('20x+2000', '150'),
  'ex-4am-muadala-ula-l5-008:q3': solveR('30x', '20x+2000'),
  'ex-4am-muadala-ula-l5-008:q4': solveR('20x+2000', '7000'),
  'ex-4am-muadala-ula-l5-008:q5': cheapest(['30x', '20x+2000', '7000'], '280'),
  'ex-4am-muadala-ula-l5-009:q1': solveR('4x', '2.5x+60'),
  'ex-4am-muadala-ula-l5-009:q2': solveR('2.5x+60', '285'),
  'ex-4am-muadala-ula-l5-009:q3': valueR('4x', solution('2.5x+60', '285')),
  'ex-4am-muadala-ula-l5-010:q1': valueR('60x', '50'),
  'ex-4am-muadala-ula-l5-010:q2': valueR('40x+1500', '50'),
  'ex-4am-muadala-ula-l5-010:q3': valueR('25x+2700', '50'),
  'ex-4am-muadala-ula-l5-010:q4': solveR('60x', '40x+1500'),
  'ex-4am-muadala-ula-l5-010:q5': solveR('40x+1500', '25x+2700'),
  'ex-4am-muadala-ula-l5-010:q6': solveR('40x+1500', '5100'),
};
