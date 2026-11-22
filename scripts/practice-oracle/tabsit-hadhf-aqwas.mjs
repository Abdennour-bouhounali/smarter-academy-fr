// Oracle du banc « tabsit-hadhf-aqwas » (3AM, unité 4 « الحساب الحرفي » — تبسيط عبارة جبرية وحذف الأقواس), 2026-10-20.
// Chaque réponse est RECALCULÉE ici à partir des expressions de l'énoncé (fusionné dans
// scripts/practice-answer-oracle.test.mjs), avec son propre analyseur et les polynômes exacts de helpers.mjs —
// jamais packages/core (brackets.js / polynomials.js), jamais la clé du contenu.
//
// E('…')        : lit une expression à une lettre x (+ − × /, ^, parenthèses, produit implicite « 3x », « 2(x + 1) »)
//                 et la calcule en polynôme exact (coef(k), at(x)).
// pick(t, opts) : l'UNIQUE option égale au polynôme t (égalité exacte des polynômes, puis contre-vérification
//                 par évaluation en plusieurs valeurs de x) ; lève une erreur s'il y en a zéro ou plusieurs —
//                 c'est ce qui prouve que chaque distracteur est FAUX.
// kind(src)     : « مجموع » ou « جداء » selon la DERNIÈRE opération de l'arbre syntaxique.
// truth(a, b)   : la réponse « نعم / لا » à « a = b pour tout x ? ».
// root(src)     : la racine (exacte) d'une expression du premier degré (étapes « حلّ المعادلة », counted:false).
import { R, C, poly, q } from './helpers.mjs';

function parse(src) {
  const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*');
  let i = 0;
  const fail = (m) => { throw new Error(`oracle tabsit-hadhf-aqwas: ${m} dans « ${src} » (position ${i})`); };
  const peek = () => s[i];
  const startsFactor = (c) => c !== undefined && /[0-9.(x]/.test(c);
  function primary() {
    const c = peek();
    if (c === '(') { i += 1; const n = sum(); if (peek() !== ')') fail('« ) » attendue'); i += 1; return n; }
    if (c === 'x') { i += 1; return { op: 'x' }; }
    const m = s.slice(i).match(/^\d+(\.\d+)?/);
    if (!m) fail('terme illisible');
    i += m[0].length;
    return { op: 'num', v: m[0] };
  }
  function power() {
    const b = primary();
    if (peek() !== '^') return b;
    i += 1; const m = s.slice(i).match(/^\d+/); if (!m) fail('exposant'); i += m[0].length;
    return { op: 'pow', a: b, k: Number(m[0]) };
  }
  function unary() {
    if (peek() === '-') { i += 1; return { op: 'neg', a: unary() }; }
    if (peek() === '+') { i += 1; return unary(); }
    return power();
  }
  function product() {
    let n = unary();
    for (;;) {
      const c = peek();
      if (c === '*') { i += 1; n = { op: 'mul', a: n, b: unary() }; }
      else if (c === '/') { i += 1; n = { op: 'div', a: n, b: unary() }; }
      else if (startsFactor(c)) n = { op: 'mul', a: n, b: power() };
      else return n;
    }
  }
  function sum() {
    let n = product();
    for (;;) {
      const c = peek();
      if (c === '+') { i += 1; n = { op: 'add', a: n, b: product() }; }
      else if (c === '-') { i += 1; n = { op: 'sub', a: n, b: product() }; }
      else return n;
    }
  }
  const n = sum();
  if (i !== s.length) fail('caractère inattendu');
  return n;
}

function value(n) {
  switch (n.op) {
    case 'num': return poly.of(n.v);
    case 'x': return poly.x;
    case 'add': return value(n.a).add(value(n.b));
    case 'sub': return value(n.a).sub(value(n.b));
    case 'neg': return value(n.a).mul(-1);
    case 'mul': return value(n.a).mul(value(n.b));
    case 'pow': return value(n.a).pow(n.k);
    case 'div': {
      const d = value(n.b);
      if (d.degree() > 0) throw new Error('oracle tabsit-hadhf-aqwas: division par une expression littérale');
      return value(n.a).mul(poly.of(q(1).div(d.coef(0)).toString()));
    }
    default: throw new Error(`oracle tabsit-hadhf-aqwas: nœud ${n.op}`);
  }
}

const E = (src) => value(parse(src));
const PROBES = ['-3', '-1', '0', '1/2', '2', '5', '11'];
/** a et b sont le même polynôme (et, par prudence, la même valeur en plusieurs x). */
function equal(a, b) {
  const pa = E(a); const pb = E(b);
  const byPoly = pa.equals(pb);
  const byValue = PROBES.every((x) => pa.at(x) === pb.at(x));
  if (byPoly !== byValue) throw new Error(`oracle tabsit-hadhf-aqwas: désaccord polynôme / valeurs pour « ${a} » et « ${b} »`);
  return byPoly;
}
function pick(target, opts) {
  const hits = Object.entries(opts).filter(([, src]) => equal(src, target)).map(([id]) => id);
  if (hits.length !== 1) throw new Error(`oracle tabsit-hadhf-aqwas: ${hits.length} option(s) égale(s) à « ${target} »`);
  return hits[0];
}
function kind(src, sumId, productId) {
  const op = parse(src).op;
  if (op === 'add' || op === 'sub') return sumId;
  if (op === 'mul' || op === 'div') return productId;
  throw new Error(`oracle tabsit-hadhf-aqwas: « ${src} » n'est ni une somme ni un produit (${op})`);
}
const truth = (a, b, yes, no) => (equal(a, b) ? yes : no);
function root(src) {
  const p = E(src);
  if (p.degree() !== 1) throw new Error(`oracle tabsit-hadhf-aqwas: « ${src} » n'est pas du premier degré`);
  return q(p.coef(0)).neg().div(q(p.coef(1))).toString();
}

export const ORACLE = {
  'ex-3am-tabsit-hadhf-aqwas-l1-001:q1': R(E('3x+5x-2x').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l1-001:q2': C(pick('4x^2+7-x^2-2', { A: '3x^2+5', B: '8x^2', C: '3x^2+9', D: '5x^2+5' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-001:q3': C(pick('6x-6x+9', { A: 'x+9', B: '9', C: '9x', D: '12x+9' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-002:q1': R(E('4*3x').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l1-002:q2': C(pick('3x*5x', { A: '8x^2', B: '15x', C: '15x^2', D: '8x' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-002:q3': R(E('(-2x)*4x').coef(2)),
  'ex-3am-tabsit-hadhf-aqwas-l1-003:q1': C(pick('8+(3x-5)', { A: '8-3x+5', B: '8+3x-5', C: '8+3x+5' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-003:q2': R(E('8+(3x-5)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l1-004:q1': C(pick('10-(4x-7)', { A: '10-4x-7', B: '10+4x-7', C: '10-4x+7' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-004:q2': C(pick('10-(4x-7)', { A: '-4x+17', B: '-4x+3', C: '4x+3', D: '13x' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-005:q1': C(kind('3(x+2)', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l1-005:q2': C(kind('3x+2', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l1-005:q3': C(kind('(x-1)(x+4)', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l1-005:q4': C(kind('5-2x*x', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l1-006:q1': R(E('2x^2+3x-x^2+5x-4').coef(2)),
  'ex-3am-tabsit-hadhf-aqwas-l1-006:q2': R(E('2x^2+3x-x^2+5x-4').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l1-006:q3': R(E('2x^2+3x-x^2+5x-4').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l1-007:q1': R(E('5x-(2x+3)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l1-007:q2': R(E('5x-(2x+3)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l1-007:q3': C(pick('4-(-3x+1)', { A: '-3x+5', B: '3x+5', C: '3x+3' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-008:q1': C(pick('5x-3', { A: '2x', B: '5x-3', C: '2' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-008:q2': C(pick('3x+7x', { A: '10x^2', B: '21x', C: '10x', D: '21x^2' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-008:q3': C(pick('2x*3x', { A: '6x^2', B: '6x', C: '5x^2', D: '5x' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-009:q1': C(pick('(3x^2-2x)+(x^2+5x-1)', { A: '3x^2-2x-x^2-5x+1', B: '3x^2-2x+x^2+5x-1', C: '3x^2+2x+x^2+5x-1' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-009:q2': R(E('(3x^2-2x)+(x^2+5x-1)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l1-010:q1': C(pick('(5x^2+2x)-(3x^2-x+4)', { A: '5x^2+2x-3x^2-x+4', B: '5x^2+2x-3x^2+x-4', C: '5x^2+2x+3x^2-x+4' })),
  'ex-3am-tabsit-hadhf-aqwas-l1-010:q2': C(pick('(5x^2+2x)-(3x^2-x+4)', { A: '2x^2+3x-4', B: '2x^2+x+4', C: '8x^2+x+4', D: '5x^2-4' })),
  'ex-3am-tabsit-hadhf-aqwas-l2-001:q1': C(pick('4x+3-(x+3)', { A: '3x+6', B: '3x', C: '5x+6' })),
  'ex-3am-tabsit-hadhf-aqwas-l2-001:q2': R(E('4x+3-(x+3)').at('2')),
  'ex-3am-tabsit-hadhf-aqwas-l2-002:q1': R(E('3x+3x^2').at('2')),
  'ex-3am-tabsit-hadhf-aqwas-l2-002:q2': R(E('6x^2').at('2')),
  'ex-3am-tabsit-hadhf-aqwas-l2-002:q3': C(truth('3x+3x^2', '6x^2', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l2-003:q1': C(kind('4(x-2)', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l2-003:q2': C(kind('4x-2', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l2-003:q3': R(E('4*(x-2)').at('0')),
  'ex-3am-tabsit-hadhf-aqwas-l2-004:q1': C(pick('2x*3x', { A: '6x', B: '6x^2', C: '5x^2' })),
  'ex-3am-tabsit-hadhf-aqwas-l2-004:q2': C(pick('2x+3x', { A: '5x', B: '5x^2', C: '6x' })),
  'ex-3am-tabsit-hadhf-aqwas-l2-005:q1': C(pick('12-(5-2x)-(x+4)', { A: '12-5-2x-x-4', B: '12-5+2x+x+4', C: '12-5+2x-x-4' })),
  'ex-3am-tabsit-hadhf-aqwas-l2-005:q3': C(truth('12-(5-2x)-(x+4)', 'x+3', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l2-006:q1': R(E('x+(2x+3)+(3x-1)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l2-006:q2': R(E('x+(2x+3)+(3x-1)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l2-006:q3': R(E('x+(2x+3)+(3x-1)').at('5')),
  'ex-3am-tabsit-hadhf-aqwas-l2-007:q2': C(pick('6x+(-2x+5)', { A: '4x+5', B: '8x-5', C: '9x' })),
  'ex-3am-tabsit-hadhf-aqwas-l2-008:q1': C(kind('3x+2*x', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l2-008:q2': C(pick('3x+2*x', { A: '3x^2+2x', B: '5x', C: '5x^2' })),
  'ex-3am-tabsit-hadhf-aqwas-l2-009:q1': R(E('3x^2-(x^2-4x+2)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l2-009:q2': R(E('3x^2-(x^2-4x+2)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l2-010:q1': R(E('2x^2+3x').at('2')),
  'ex-3am-tabsit-hadhf-aqwas-l2-010:q2': R(E('5x^3').at('2')),
  'ex-3am-tabsit-hadhf-aqwas-l2-010:q3': C(truth('2x^2+3x', '5x^3', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l3-001:q1': C(pick('12+(x-5)-(3x+4)', { A: '12+x-5-3x-4', B: '12+x-5-3x+4', C: '12-x+5-3x-4' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-001:q2': R(E('12+(x-5)-(3x+4)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l3-001:q3': R(E('12+(x-5)-(3x+4)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l3-001:q4': R(E('12+(x-5)-(3x+4)').at('-1')),
  'ex-3am-tabsit-hadhf-aqwas-l3-002:q2': C(pick('3x^2+5x-2-(2x^2+4x-5)', { A: 'x^2+9x-7', B: 'x^2+x+3', C: '5x^2+9x-7' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-002:q3': R(E('3x^2+5x-2-(2x^2+4x-5)').at('3')),
  'ex-3am-tabsit-hadhf-aqwas-l3-003:q1': R(E('3x^2-5x-(6x+1)+4').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l3-003:q2': R(E('3x^2-5x-(6x+1)+4').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l3-003:q3': R(E('3x^2-5x-(6x+1)+4').at('2')),
  'ex-3am-tabsit-hadhf-aqwas-l3-004:q1': C(pick('4x*x-3*4x', { A: '4x-12x', B: '5x^2-7x', C: '4x^2-12x' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-004:q2': C(pick('4x*x-3*4x-(x^2-2x-9)', { A: '3x^2-10x+9', B: '3x^2-14x-9', C: '5x^2-14x-9' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-004:q3': R(E('4x*x-3*4x-(x^2-2x-9)-(3x^2-10x+1)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l3-005:q1': C(pick('(3x+6)+(x^2+5x+4)', { A: '3x+6-x^2-5x-4', B: '3x+6+x^2+5x+4', C: '3x-6+x^2+5x-4' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-005:q2': R(E('(3x+6)+(x^2+5x+4)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l3-005:q3': R(E('(3x+6)+(x^2+5x+4)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l3-005:q4': R(E('(3x+6)+(x^2+5x+4)').at('1')),
  'ex-3am-tabsit-hadhf-aqwas-l3-006:q2': C(pick('x^2-4-(x^2+3x-1)', { A: '3x-5', B: '2x^2+3x-5', C: '-3x-3' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-006:q3': R(E('x^2-4-(x^2+3x-1)').at('2025')),
  'ex-3am-tabsit-hadhf-aqwas-l3-007:q1': C(kind('2x+3x', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l3-007:q2': C(kind('2x*3x', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l3-007:q3': C(kind('2(x+3x)', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l3-007:q4': C(pick('2x*3x', { A: '5x', B: '6x^2', C: '6x' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-007:q5': C(pick('2(x+3x)', { A: '8x', B: '2+4x', C: '5x' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-008:q1': C(pick('(2x^2-3x+1)+(x^2+3x)-(4x^2-5)', { A: '2x^2-3x+1+x^2+3x-4x^2+5', B: '2x^2-3x+1+x^2+3x-4x^2-5', C: '2x^2-3x+1-x^2-3x-4x^2+5' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-008:q2': R(E('(2x^2-3x+1)+(x^2+3x)-(4x^2-5)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l3-008:q3': R(E('(2x^2-3x+1)+(x^2+3x)-(4x^2-5)').coef(2)),
  'ex-3am-tabsit-hadhf-aqwas-l3-008:q4': R(E('(2x^2-3x+1)+(x^2+3x)-(4x^2-5)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l3-009:q1': C(pick('4x*2x', { A: '8x^2', B: '8x', C: '6x^2' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-009:q2': R(E('4x*2x+4x*3-(x+5)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l3-009:q3': R(E('4x*2x+4x*3-(x+5)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l3-009:q4': R(root('4x*2x+4x*3-(x+5)-8x^2-(9x+1)')),
  'ex-3am-tabsit-hadhf-aqwas-l3-010:q1': C(pick('7x^2+2x-3x^2+5-6x', { A: '4x^2-4x+5', B: '4x^2+8x+5', C: '5x^2' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-010:q2': C(pick('x^2+3x^2-4x-1+6', { A: '4x^4-4x+5', B: '4x^2-4x+5', C: '4x^2-4x+7' })),
  'ex-3am-tabsit-hadhf-aqwas-l3-010:q3': C(truth('7x^2+2x-3x^2+5-6x', 'x^2+3x^2-4x-1+6', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l4-001:q1': R(E('(x+3)+(2x+2)+(3x+1)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l4-001:q2': R(E('(x+3)+(2x+2)+(3x+1)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l4-001:q3': R(E('(x+3)+(2x+2)+(3x+1)').at('3')),
  'ex-3am-tabsit-hadhf-aqwas-l4-002:q1': R(E('(5x-3)+(x+1)+(5x-3)+(x+1)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l4-002:q2': R(E('(5x-3)+(x+1)+(5x-3)+(x+1)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l4-002:q3': R(root('(5x-3)+(x+1)+(5x-3)+(x+1)-68')),
  'ex-3am-tabsit-hadhf-aqwas-l4-002:q4': R(q(E('5x-3').at('6')).mul(E('x+1').at('6'))),
  'ex-3am-tabsit-hadhf-aqwas-l4-003:q1': R(E('(x+1)+3x+(x+1)+3x').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l4-003:q2': R(E('(x+1)+3x+(x+1)+3x').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l4-003:q3': R(E('(x+1)+3x+(x+1)+3x').at('4')),
  'ex-3am-tabsit-hadhf-aqwas-l4-003:q4': R(Math.sqrt(Number(E('(x+1)^2+(3x)^2').at('4')))),
  'ex-3am-tabsit-hadhf-aqwas-l4-004:q1': R(E('7x-(2x-3)+(x-8)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l4-004:q2': R(E('7x-(2x-3)+(x-8)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l4-004:q3': R(E('7x-(2x-3)+(x-8)').at('-2')),
  'ex-3am-tabsit-hadhf-aqwas-l4-004:q4': R(E('7x-(2x-3)+(x-8)').at('1.5')),
  'ex-3am-tabsit-hadhf-aqwas-l4-005:q1': R(E('5x-(2x-4)').at('2')),
  'ex-3am-tabsit-hadhf-aqwas-l4-005:q2': R(E('5x-(2x-4)').at('-1')),
  'ex-3am-tabsit-hadhf-aqwas-l4-005:q3': C(truth('5x-(2x-4)', '3x+4', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l4-006:q1': C(pick('180-x-(x-20)', { A: '160-2x', B: '200-2x', C: '160' })),
  'ex-3am-tabsit-hadhf-aqwas-l4-006:q2': R(E('180-x-(x-20)').at('55')),
  'ex-3am-tabsit-hadhf-aqwas-l4-007:q1': R(E('2(x+5)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l4-007:q2': R(E('(x+1)(x+2)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l4-007:q3': C(pick('(2x+10)+(x^2+3x+2)', { A: 'x^2+5x+12', B: '-x^2-x+8', C: '6x^2+12' })),
  'ex-3am-tabsit-hadhf-aqwas-l4-007:q4': R(E('(2x+10)+(x^2+3x+2)').at('-1')),
  'ex-3am-tabsit-hadhf-aqwas-l4-008:q1': R(E('(x+(1/2))-((1/4)-x)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l4-008:q2': R(E('(x+(1/2))-((1/4)-x)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l4-008:q3': R(E('(x+(1/2))-((1/4)-x)').at('3/8')),
  'ex-3am-tabsit-hadhf-aqwas-l4-009:q1': C(kind('3(x+2)', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l4-009:q2': C(kind('(x+2)+3+(x+2)+3', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l4-009:q3': R(E('(x+2)+3+(x+2)+3').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l4-009:q4': R(E('3*(x+2)').at('4')),
  'ex-3am-tabsit-hadhf-aqwas-l4-010:q1': C(pick('7x-(3x-2)', { A: '4x-2', B: '10x-2', C: '4x+2' })),
  'ex-3am-tabsit-hadhf-aqwas-l4-010:q2': C(pick('x+(2x+9)', { A: '3x+9', B: '-x-9', C: '12x' })),
  'ex-3am-tabsit-hadhf-aqwas-l4-010:q3': R(root('7x-(3x-2)-(x+(2x+9))')),
  'ex-3am-tabsit-hadhf-aqwas-l5-001:q1': C(pick('(2x+3)+(x-1)', { A: '3x+2', B: 'x+4', C: '5x' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-001:q2': R(E('(2x+3+x-1)+(x+4)+(2x+3+x-1)+(x+4)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l5-001:q3': R(E('(2x+3+x-1)+(x+4)+(2x+3+x-1)+(x+4)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l5-001:q4': R(E('(2x+3+x-1)+(x+4)+(2x+3+x-1)+(x+4)').at('20')),
  'ex-3am-tabsit-hadhf-aqwas-l5-001:q5': R(q(E('(2x+3+x-1)+(x+4)+(2x+3+x-1)+(x+4)').at('20')).div(4)),
  'ex-3am-tabsit-hadhf-aqwas-l5-002:q1': R(q(64).div(4)),
  'ex-3am-tabsit-hadhf-aqwas-l5-002:q2': R(E('10*x/2').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l5-002:q3': C(pick('10*x/2+(2x+6)', { A: '7x+6', B: '3x-6', C: '13x' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-002:q4': C(pick('256-(10*x/2+(2x+6))', { A: '262+7x', B: '262-7x', C: '250-7x' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-002:q5': R(E('10*x/2+(2x+6)').at('10')),
  'ex-3am-tabsit-hadhf-aqwas-l5-002:q6': R(E('256-(10*x/2+(2x+6))').at('10')),
  'ex-3am-tabsit-hadhf-aqwas-l5-003:q1': C(pick('x*x', { A: '2x', B: 'x^2', C: '2x^2' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-003:q2': C(pick('(2x+10)-x', { A: 'x+10', B: '3x+10', C: '11x' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-003:q3': R(E('((2x+10)-x)+x+((2x+10)-x)+x').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l5-003:q4': R(E('((2x+10)-x)+x+((2x+10)-x)+x').at('30')),
  'ex-3am-tabsit-hadhf-aqwas-l5-004:q1': R(E('(4x+2)+(x+6)+(4x+2)+(x+6)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l5-004:q2': R(E('(4x+2)+(x+6)+(4x+2)+(x+6)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l5-004:q3': R(E('(4x+2)+(x+6)+(4x+2)+(x+6)').at('20')),
  'ex-3am-tabsit-hadhf-aqwas-l5-004:q4': R(Math.sqrt(24 * 24 + 18 * 18)),
  'ex-3am-tabsit-hadhf-aqwas-l5-004:q5': R(q(Math.sqrt(24 * 24 + 18 * 18)).add(E('4x+2').at('20')).mul(750)),
  'ex-3am-tabsit-hadhf-aqwas-l5-005:q1': C(pick('(5x+4)+(x-2)+(5x+4)+(x-2)', { A: '12x+4', B: '12x+12', C: '16x' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-005:q2': R(E('(5x+4)+(x-2)+(5x+4)+(x-2)').at('25')),
  'ex-3am-tabsit-hadhf-aqwas-l5-005:q3': R(root('(5x+4)+(x-2)+(5x+4)+(x-2)-400')),
  'ex-3am-tabsit-hadhf-aqwas-l5-005:q4': R(q(E('(5x+4)+(x-2)+(5x+4)+(x-2)').at('25')).mul(1500)),
  'ex-3am-tabsit-hadhf-aqwas-l5-006:q1': R(E('x+(2x-50)+(x+120)').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l5-006:q2': R(E('x+(2x-50)+(x+120)').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l5-006:q3': C(pick('(x+(2x-50)+(x+120))-(x-30)', { A: '3x+40', B: '5x+40', C: '3x+100' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-006:q4': R(E('(x+(2x-50)+(x+120))-(x-30)').at('200')),
  'ex-3am-tabsit-hadhf-aqwas-l5-007:q1': C(pick('3x*2x', { A: '6x', B: '5x^2', C: '6x^2' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-007:q2': R(E('2x*2x').coef(2)),
  'ex-3am-tabsit-hadhf-aqwas-l5-007:q3': C(pick('3x*2x+2x*2x+5*x', { A: '10x^2+5x', B: '15x^2', C: '15x^3' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-007:q4': R(E('3x*2x+2x*2x+5*x').at('4')),
  'ex-3am-tabsit-hadhf-aqwas-l5-007:q5': R(q(E('3x*2x+2x*2x+5*x').at('4')).div(20)),
  'ex-3am-tabsit-hadhf-aqwas-l5-008:q1': C(pick('180-x-(2x-60)', { A: '120-3x', B: '240-3x', C: '120+x' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-008:q2': C(kind('180-x-(2x-60)', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l5-008:q3': C(kind('3(x-35)', 'A', 'B')),
  'ex-3am-tabsit-hadhf-aqwas-l5-008:q4': R(E('180-x-(2x-60)').at('60')),
  'ex-3am-tabsit-hadhf-aqwas-l5-008:q6': R(E('3*(x-35)').at('60')),
  'ex-3am-tabsit-hadhf-aqwas-l5-009:q1': R(E('(3x-2)+(x+5)+(3x-2)+(x+5)-2').coef(1)),
  'ex-3am-tabsit-hadhf-aqwas-l5-009:q2': R(E('(3x-2)+(x+5)+(3x-2)+(x+5)-2').coef(0)),
  'ex-3am-tabsit-hadhf-aqwas-l5-009:q3': R(E('(3x-2)+(x+5)+(3x-2)+(x+5)-2').at('6')),
  'ex-3am-tabsit-hadhf-aqwas-l5-009:q4': R(q(E('(3x-2)+(x+5)+(3x-2)+(x+5)-2').at('6')).mul(350)),
  'ex-3am-tabsit-hadhf-aqwas-l5-009:q6': R(q(20000).sub(q(E('(3x-2)+(x+5)+(3x-2)+(x+5)-2').at('6')).mul(350))),
  'ex-3am-tabsit-hadhf-aqwas-l5-010:q1': C(pick('(2x+300)+(x-100)', { A: '3x+200', B: '3x+400', C: 'x+400' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-010:q2': C(pick('(5x+400)-(x+300)', { A: '6x+700', B: '4x+100', C: '4x+700' })),
  'ex-3am-tabsit-hadhf-aqwas-l5-010:q3': R(E('(2x+300)+(x-100)').at('150')),
  'ex-3am-tabsit-hadhf-aqwas-l5-010:q4': R(E('(5x+400)-(x+300)').at('150')),
  'ex-3am-tabsit-hadhf-aqwas-l5-010:q6': R(root('(2x+300)+(x-100)-((5x+400)-(x+300))')),
};
