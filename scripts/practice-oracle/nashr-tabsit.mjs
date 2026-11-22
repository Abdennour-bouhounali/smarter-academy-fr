// Oracle du banc « nashr-tabsit » (unité 3 « الحساب الحرفي ») — feuilles d'examen BEM (2026-10-07).
// Chaque réponse est RECALCULÉE ici à partir des nombres de l'énoncé (fusionné dans
// scripts/practice-answer-oracle.test.mjs). Une clé par question non selfCheck.
//
// E('…') lit une expression à UNE lettre (x, y, a… : toutes lues comme la même variable)
// avec + − × /, ^, parenthèses et produit implicite (« 3x », « 2(x + 1) », « (x + 2)(3x − 1) »),
// et la CALCULE avec les polynômes exacts de helpers.mjs — sans rien lire du contenu ni du
// code testé. Une division ne se fait que par un nombre.
// root('…') : la racine de l'expression du premier degré (étapes « حل المعادلة / المتراجحة »,
// hors leçon, counted:false) — −(terme constant)/(coefficient de x), en rationnel exact.
import { R, C, poly, q } from './helpers.mjs';

function E(src) {
  const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*');
  let i = 0;
  const peek = () => s[i];
  const fail = (m) => { throw new Error(`oracle nashr-tabsit: ${m} dans « ${src} » (position ${i})`); };
  const startsFactor = (c) => c !== undefined && (/[0-9.(]/.test(c) || /[a-z]/.test(c));
  function primary() {
    const c = peek();
    if (c === '(') { i += 1; const v = sum(); if (peek() !== ')') fail('« ) » attendue'); i += 1; return v; }
    if (/[a-z]/.test(c)) { i += 1; return poly.x; }
    const m = s.slice(i).match(/^\d+(\.\d+)?/);
    if (!m) fail('terme illisible');
    i += m[0].length;
    return poly.of(m[0]);
  }
  function power() {
    let v = primary();
    if (peek() === '^') { i += 1; const m = s.slice(i).match(/^\d+/); if (!m) fail('exposant'); i += m[0].length; v = v.pow(Number(m[0])); }
    return v;
  }
  function factor() {
    if (peek() === '-') { i += 1; return factor().mul(-1); }
    if (peek() === '+') { i += 1; return factor(); }
    return power();
  }
  function product() {
    let v = factor();
    for (;;) {
      const c = peek();
      if (c === '*') { i += 1; v = v.mul(factor()); }
      else if (c === '/') {
        i += 1; const d = factor();
        if (d.degree() > 0) fail('division par une expression littérale');
        v = v.mul(poly.Q(1).div(poly.Q(d.coef(0))));
      } else if (startsFactor(c)) v = v.mul(power());
      else return v;
    }
  }
  function sum() {
    let v = product();
    for (;;) {
      const c = peek();
      if (c === '+') { i += 1; v = v.add(product()); }
      else if (c === '-') { i += 1; v = v.sub(product()); }
      else return v;
    }
  }
  const v = sum();
  if (i !== s.length) fail('caractère inattendu');
  return v;
}

/** Racine (exacte) d'une expression du premier degré. */
function root(src) {
  const p = E(src);
  if (p.degree() !== 1) throw new Error(`oracle nashr-tabsit: « ${src} » n'est pas du premier degré`);
  return q(p.coef(0)).neg().div(q(p.coef(1))).toString();
}

export const ORACLE = {
  'ex-4am-nashr-tabsit-l1-001:q1': R(E('2(5x-1)').coef(1)),
  'ex-4am-nashr-tabsit-l1-001:q2': R(E('2(5x-1)').coef(0)),
  'ex-4am-nashr-tabsit-l1-001:q3': R(E('-3(3-x)').coef(1)),
  'ex-4am-nashr-tabsit-l1-001:q4': R(E('-3(3-x)').coef(0)),
  'ex-4am-nashr-tabsit-l1-001:q5': R(E('(2/5)(-20x+(15/2))').coef(1)),
  'ex-4am-nashr-tabsit-l1-001:q6': R(E('(2/5)(-20x+(15/2))').coef(0)),
  'ex-4am-nashr-tabsit-l1-001:q7': R(E('-4(7-(3/2)x)').coef(1)),
  'ex-4am-nashr-tabsit-l1-001:q8': R(E('-4(7-(3/2)x)').coef(0)),
  'ex-4am-nashr-tabsit-l1-002:q1': R(q(3).mul(q(9).add(5))),
  'ex-4am-nashr-tabsit-l1-002:q2': R(q('4').sub('2.5').mul(q(3).add('1.2'))),
  'ex-4am-nashr-tabsit-l1-002:q3': C('A'),
  'ex-4am-nashr-tabsit-l1-002:q4': C('B'),
  'ex-4am-nashr-tabsit-l1-002:q5': C('A'),
  'ex-4am-nashr-tabsit-l1-003:q1': C('A'),
  'ex-4am-nashr-tabsit-l1-003:q2': R(E('2(x+7)').coef(1)),
  'ex-4am-nashr-tabsit-l1-003:q3': R(E('2(x+7)').coef(0)),
  'ex-4am-nashr-tabsit-l1-004:q1': C('A'),
  'ex-4am-nashr-tabsit-l1-004:q2': C('B'),
  'ex-4am-nashr-tabsit-l1-004:q3': R(E('(x+3)(x-2)').coef(2)),
  'ex-4am-nashr-tabsit-l1-004:q4': R(E('(x+3)(x-2)').coef(1)),
  'ex-4am-nashr-tabsit-l1-004:q5': R(E('(x+3)(x-2)').coef(0)),
  'ex-4am-nashr-tabsit-l1-005:q1': R(E('4(x+3)').coef(1)),
  'ex-4am-nashr-tabsit-l1-005:q2': R(E('4(x+3)').coef(0)),
  'ex-4am-nashr-tabsit-l1-005:q3': R(E('5(2x+9)').coef(1)),
  'ex-4am-nashr-tabsit-l1-005:q4': R(E('5(2x+9)').coef(0)),
  'ex-4am-nashr-tabsit-l1-006:q1': R(E('7(2-x)').coef(1)),
  'ex-4am-nashr-tabsit-l1-006:q2': R(E('7(2-x)').coef(0)),
  'ex-4am-nashr-tabsit-l1-006:q3': R(E('6(3-2x)').coef(1)),
  'ex-4am-nashr-tabsit-l1-006:q4': R(E('6(3-2x)').coef(0)),
  'ex-4am-nashr-tabsit-l1-007:q1': R(E('3x*2x').coef(2)),
  'ex-4am-nashr-tabsit-l1-007:q2': R(E('3x+2x').coef(1)),
  'ex-4am-nashr-tabsit-l1-007:q3': R(E('x*x+x+x').coef(2)),
  'ex-4am-nashr-tabsit-l1-007:q4': R(E('x*x+x+x').coef(1)),
  'ex-4am-nashr-tabsit-l1-008:q1': R(E('5x+3x-4x^2+4x').coef(2)),
  'ex-4am-nashr-tabsit-l1-008:q2': R(E('5x+3x-4x^2+4x').coef(1)),
  'ex-4am-nashr-tabsit-l1-008:q3': R(E('5x+3x-4x^2+4x').at('2')),
  'ex-4am-nashr-tabsit-l1-009:q1': R(E('(x+2)(x+5)').coef(2)),
  'ex-4am-nashr-tabsit-l1-009:q2': R(E('(x+2)(x+5)').coef(1)),
  'ex-4am-nashr-tabsit-l1-009:q3': R(E('(x+2)(x+5)').coef(0)),
  'ex-4am-nashr-tabsit-l1-009:q4': R(E('(x+2)(x+5)').at('10')),
  'ex-4am-nashr-tabsit-l1-010:q1': R(q(6).mul(102)),
  'ex-4am-nashr-tabsit-l1-010:q2': R(q(8).mul(99)),
  'ex-4am-nashr-tabsit-l2-001:q1': R(E('x(3x+1)').coef(2)),
  'ex-4am-nashr-tabsit-l2-001:q2': R(E('x(3x+1)').coef(1)),
  'ex-4am-nashr-tabsit-l2-001:q3': R(E('5x(1-x)').coef(2)),
  'ex-4am-nashr-tabsit-l2-001:q4': R(E('5x(1-x)').coef(1)),
  'ex-4am-nashr-tabsit-l2-001:q5': R(E('(3x-1)(3+x)').coef(2)),
  'ex-4am-nashr-tabsit-l2-001:q6': R(E('(3x-1)(3+x)').coef(1)),
  'ex-4am-nashr-tabsit-l2-001:q7': R(E('(3x-1)(3+x)').coef(0)),
  'ex-4am-nashr-tabsit-l2-002:q1': R(E('-3(x+4)').coef(1)),
  'ex-4am-nashr-tabsit-l2-002:q2': R(E('-3(x+4)').coef(0)),
  'ex-4am-nashr-tabsit-l2-002:q3': R(E('-2(5-3x)').coef(1)),
  'ex-4am-nashr-tabsit-l2-002:q4': R(E('-2(5-3x)').coef(0)),
  'ex-4am-nashr-tabsit-l2-003:q1': R(E('x(x+6)').coef(2)),
  'ex-4am-nashr-tabsit-l2-003:q2': R(E('x(x+6)').coef(1)),
  'ex-4am-nashr-tabsit-l2-003:q3': R(E('x(x+6)').at('4')),
  'ex-4am-nashr-tabsit-l2-004:q1': R(E('2x(3x-5)').coef(2)),
  'ex-4am-nashr-tabsit-l2-004:q2': R(E('2x(3x-5)').coef(1)),
  'ex-4am-nashr-tabsit-l2-004:q3': R(E('2x(3x-5)').at('2')),
  'ex-4am-nashr-tabsit-l2-005:q1': R(E('(1/2)(4x-6)').coef(1)),
  'ex-4am-nashr-tabsit-l2-005:q2': R(E('(1/2)(4x-6)').coef(0)),
  'ex-4am-nashr-tabsit-l2-005:q3': R(E('(2/3)(9+6x)').coef(1)),
  'ex-4am-nashr-tabsit-l2-005:q4': R(E('(2/3)(9+6x)').coef(0)),
  'ex-4am-nashr-tabsit-l2-006:q1': R(E('(x+3)(x+4)').coef(2)),
  'ex-4am-nashr-tabsit-l2-006:q2': R(E('(x+3)(x+4)').coef(1)),
  'ex-4am-nashr-tabsit-l2-006:q3': R(E('(x+3)(x+4)').coef(0)),
  'ex-4am-nashr-tabsit-l2-006:q4': R(E('(x+3)(x+4)').at('-3')),
  'ex-4am-nashr-tabsit-l2-007:q1': R(E('(x+5)(x-2)').coef(2)),
  'ex-4am-nashr-tabsit-l2-007:q2': R(E('(x+5)(x-2)').coef(1)),
  'ex-4am-nashr-tabsit-l2-007:q3': R(E('(x+5)(x-2)').coef(0)),
  'ex-4am-nashr-tabsit-l2-007:q4': R(E('(x+5)(x-2)').at('1')),
  'ex-4am-nashr-tabsit-l2-008:q1': R(E('3x+5-x+2').coef(1)),
  'ex-4am-nashr-tabsit-l2-008:q2': R(E('3x+5-x+2').coef(0)),
  'ex-4am-nashr-tabsit-l2-008:q3': R(E('2x^2+3x-x^2+x').coef(2)),
  'ex-4am-nashr-tabsit-l2-008:q4': R(E('2x^2+3x-x^2+x').coef(1)),
  'ex-4am-nashr-tabsit-l2-009:q1': R(E('(3x-2)(x-4)').coef(2)),
  'ex-4am-nashr-tabsit-l2-009:q2': R(E('(3x-2)(x-4)').coef(1)),
  'ex-4am-nashr-tabsit-l2-009:q3': R(E('(3x-2)(x-4)').coef(0)),
  'ex-4am-nashr-tabsit-l2-009:q4': R(root('3x - 2')),
  'ex-4am-nashr-tabsit-l2-009:q5': R(root('x - 4')),
  'ex-4am-nashr-tabsit-l2-010:q2': R(E('3x^2-x-2+(3x+2)(x+4)').coef(2)),
  'ex-4am-nashr-tabsit-l2-010:q3': R(E('3x^2-x-2+(3x+2)(x+4)').coef(1)),
  'ex-4am-nashr-tabsit-l2-010:q4': R(E('3x^2-x-2+(3x+2)(x+4)').coef(0)),
  'ex-4am-nashr-tabsit-l3-001:q1': R(E('(3x-2)(7x-4)').coef(2)),
  'ex-4am-nashr-tabsit-l3-001:q2': R(E('(3x-2)(7x-4)').coef(1)),
  'ex-4am-nashr-tabsit-l3-001:q3': R(E('(3x-2)(7x-4)').coef(0)),
  'ex-4am-nashr-tabsit-l3-001:q4': R(E('(8-3x)x+(8+3x)x').coef(1)),
  'ex-4am-nashr-tabsit-l3-001:q5': R(E('-((8-3x)-(8+3x))').coef(1)),
  'ex-4am-nashr-tabsit-l3-002:q1': R(E('(x+2)(3x-1)').coef(2)),
  'ex-4am-nashr-tabsit-l3-002:q2': R(E('(x+2)(3x-1)').coef(1)),
  'ex-4am-nashr-tabsit-l3-002:q3': R(E('(x+2)(3x-1)').coef(0)),
  'ex-4am-nashr-tabsit-l3-002:q4': R(E('(x+2)(3x-1)').at('0')),
  'ex-4am-nashr-tabsit-l3-003:q1': R(E('(2x+1)(x+2)').coef(2)),
  'ex-4am-nashr-tabsit-l3-003:q2': R(E('(2x+1)(x+2)').coef(1)),
  'ex-4am-nashr-tabsit-l3-003:q3': R(E('(2x+1)(x+2)').coef(0)),
  'ex-4am-nashr-tabsit-l3-003:q4': R(E('(3x+2)(4x-5)').coef(2)),
  'ex-4am-nashr-tabsit-l3-003:q5': R(E('(3x+2)(4x-5)').coef(1)),
  'ex-4am-nashr-tabsit-l3-003:q6': R(E('(3x+2)(4x-5)').coef(0)),
  'ex-4am-nashr-tabsit-l3-003:q7': R(E('(x-7)(1-x)').coef(2)),
  'ex-4am-nashr-tabsit-l3-003:q8': R(E('(x-7)(1-x)').coef(1)),
  'ex-4am-nashr-tabsit-l3-003:q9': R(E('(x-7)(1-x)').coef(0)),
  'ex-4am-nashr-tabsit-l3-003:q10': R(E('(-x-2)(5-x)').coef(2)),
  'ex-4am-nashr-tabsit-l3-003:q11': R(E('(-x-2)(5-x)').coef(1)),
  'ex-4am-nashr-tabsit-l3-003:q12': R(E('(-x-2)(5-x)').coef(0)),
  'ex-4am-nashr-tabsit-l3-004:q1': R(E('(1-3x)(3x+3)-2(3x+3)').coef(2)),
  'ex-4am-nashr-tabsit-l3-004:q2': R(E('(1-3x)(3x+3)-2(3x+3)').coef(1)),
  'ex-4am-nashr-tabsit-l3-004:q3': R(E('(1-3x)(3x+3)-2(3x+3)').coef(0)),
  'ex-4am-nashr-tabsit-l3-004:q5': R(root('3x + 3')),
  'ex-4am-nashr-tabsit-l3-004:q6': R(root('-1 - 3x')),
  'ex-4am-nashr-tabsit-l3-005:q3': R(root('5(x-2)+(x+2)+((x+2)-(x-2))-20')),
  'ex-4am-nashr-tabsit-l3-006:q1': R(E('(2-5x)(2x+1)-3(2x+1)').coef(2)),
  'ex-4am-nashr-tabsit-l3-006:q2': R(E('(2-5x)(2x+1)-3(2x+1)').coef(1)),
  'ex-4am-nashr-tabsit-l3-006:q3': R(E('(2-5x)(2x+1)-3(2x+1)').coef(0)),
  'ex-4am-nashr-tabsit-l3-006:q5': R(root('2x + 1')),
  'ex-4am-nashr-tabsit-l3-006:q6': R(root('-1 - 5x')),
  'ex-4am-nashr-tabsit-l3-007:q1': R(E('(x+2)(3x-1)-(x+2)(x+5)').coef(2)),
  'ex-4am-nashr-tabsit-l3-007:q2': R(E('(x+2)(3x-1)-(x+2)(x+5)').coef(1)),
  'ex-4am-nashr-tabsit-l3-007:q3': R(E('(x+2)(3x-1)-(x+2)(x+5)').coef(0)),
  'ex-4am-nashr-tabsit-l3-007:q5': R(root('2x+5-(5x-7)')),
  'ex-4am-nashr-tabsit-l3-008:q1': R(E('(x+3)(2x+1)').coef(2)),
  'ex-4am-nashr-tabsit-l3-008:q2': R(E('(x+3)(2x+1)').coef(1)),
  'ex-4am-nashr-tabsit-l3-008:q3': R(E('(x+3)(2x+1)').coef(0)),
  'ex-4am-nashr-tabsit-l3-008:q4': R(E('(x+3)(2x+1)').at('10')),
  'ex-4am-nashr-tabsit-l3-009:q1': R(E('(4x-1)(x+5)').coef(2)),
  'ex-4am-nashr-tabsit-l3-009:q2': R(E('(4x-1)(x+5)').coef(1)),
  'ex-4am-nashr-tabsit-l3-009:q3': R(E('(4x-1)(x+5)').coef(0)),
  'ex-4am-nashr-tabsit-l3-009:q4': R(E('(4x-1)(x+5)').at('1/4')),
  'ex-4am-nashr-tabsit-l3-010:q1': R(E('(x+1)(x+2)-x(x+3)').coef(0)),
  'ex-4am-nashr-tabsit-l3-010:q2': R(q(1001).mul(1002).sub(q(1000).mul(1003))),
  'ex-4am-nashr-tabsit-l4-001:q1': R(E('((2/3)x+5)(4-(1/3)x)').at('3')),
  'ex-4am-nashr-tabsit-l4-001:q2': R(E('((2/3)x+5)(4-(1/3)x)').coef(2)),
  'ex-4am-nashr-tabsit-l4-001:q3': R(E('((2/3)x+5)(4-(1/3)x)').coef(1)),
  'ex-4am-nashr-tabsit-l4-001:q4': R(E('((2/3)x+5)(4-(1/3)x)').coef(0)),
  'ex-4am-nashr-tabsit-l4-002:q1': R(E('(2x+(1/5))(x+(2/5))').coef(2)),
  'ex-4am-nashr-tabsit-l4-002:q2': R(E('(2x+(1/5))(x+(2/5))').coef(1)),
  'ex-4am-nashr-tabsit-l4-002:q3': R(E('(2x+(1/5))(x+(2/5))').coef(0)),
  'ex-4am-nashr-tabsit-l4-002:q4': R(E('((4/3)x-2)((3/2)x-(1/4))').coef(2)),
  'ex-4am-nashr-tabsit-l4-002:q5': R(E('((4/3)x-2)((3/2)x-(1/4))').coef(1)),
  'ex-4am-nashr-tabsit-l4-002:q6': R(E('((4/3)x-2)((3/2)x-(1/4))').coef(0)),
  'ex-4am-nashr-tabsit-l4-003:q1': R(E('3(x-1)-(x+1)(4x-3)').coef(2)),
  'ex-4am-nashr-tabsit-l4-003:q2': R(E('3(x-1)-(x+1)(4x-3)').coef(1)),
  'ex-4am-nashr-tabsit-l4-004:q1': R(E('(3x-2)(2x+4)-(x+1)(3x-2)').coef(2)),
  'ex-4am-nashr-tabsit-l4-004:q2': R(E('(3x-2)(2x+4)-(x+1)(3x-2)').coef(1)),
  'ex-4am-nashr-tabsit-l4-004:q3': R(E('(3x-2)(2x+4)-(x+1)(3x-2)').coef(0)),
  'ex-4am-nashr-tabsit-l4-004:q5': R(root('x + 3')),
  'ex-4am-nashr-tabsit-l4-004:q6': R(root('3x - 2')),
  'ex-4am-nashr-tabsit-l4-004:q7': R(root('(3x-2)(2x+4)-(x+1)(3x-2)-(3x^2+8)')),
  'ex-4am-nashr-tabsit-l4-005:q1': R(E('(x-4)(x-9)+2(x-4)').coef(2)),
  'ex-4am-nashr-tabsit-l4-005:q2': R(E('(x-4)(x-9)+2(x-4)').coef(1)),
  'ex-4am-nashr-tabsit-l4-005:q3': R(E('(x-4)(x-9)+2(x-4)').coef(0)),
  'ex-4am-nashr-tabsit-l4-005:q5': R([root('x - 4'), root('x - 7')].map(Number).sort((a, b) => a - b).join(', ')),
  'ex-4am-nashr-tabsit-l4-005:q6': R(E('(x-4)(x-9)+2(x-4)').at('50')),
  'ex-4am-nashr-tabsit-l4-006:q2': R(E('2x^2-5x-3+(2x+1)(3x+2)').coef(2)),
  'ex-4am-nashr-tabsit-l4-006:q3': R(E('2x^2-5x-3+(2x+1)(3x+2)').coef(1)),
  'ex-4am-nashr-tabsit-l4-006:q4': R(E('2x^2-5x-3+(2x+1)(3x+2)').coef(0)),
  'ex-4am-nashr-tabsit-l4-006:q6': R(root('(2x+1)(x-3)-(2x^2+7)')),
  'ex-4am-nashr-tabsit-l4-007:q1': R(E('25x^2-9+(x+2)(5x-3)').coef(2)),
  'ex-4am-nashr-tabsit-l4-007:q2': R(E('25x^2-9+(x+2)(5x-3)').coef(1)),
  'ex-4am-nashr-tabsit-l4-007:q3': R(E('25x^2-9+(x+2)(5x-3)').coef(0)),
  'ex-4am-nashr-tabsit-l4-007:q5': R(root('6x + 5')),
  'ex-4am-nashr-tabsit-l4-007:q6': R(root('5x - 3')),
  'ex-4am-nashr-tabsit-l4-008:q1': R(E('(2x-1)(x+3)-2x^2').coef(1)),
  'ex-4am-nashr-tabsit-l4-008:q2': R(E('(2x-1)(x+3)-2x^2').coef(0)),
  'ex-4am-nashr-tabsit-l4-008:q3': R(E('(2x-1)(x+3)-2x^2').at('4')),
  'ex-4am-nashr-tabsit-l4-009:q1': R(E('x(x-4)-(x-2)(x+2)').coef(1)),
  'ex-4am-nashr-tabsit-l4-009:q2': R(E('x(x-4)-(x-2)(x+2)').coef(0)),
  'ex-4am-nashr-tabsit-l4-009:q3': R(q(2024).mul(2020).sub(q(2022).mul(2026))),
  'ex-4am-nashr-tabsit-l4-010:q2': R(E('2x^2+3x-x^2+5').coef(2)),
  'ex-4am-nashr-tabsit-l4-010:q3': R(E('2x^2+3x-x^2+5').coef(1)),
  'ex-4am-nashr-tabsit-l4-010:q4': R(E('2x^2+3x-x^2+5').coef(0)),
  'ex-4am-nashr-tabsit-l4-010:q5': R(E('2x^2+3x-x^2+5').at('-1')),
  'ex-4am-nashr-tabsit-l5-001:q1': R(E('(2x+10)(x+6)').coef(2)),
  'ex-4am-nashr-tabsit-l5-001:q2': R(E('(2x+10)(x+6)').coef(1)),
  'ex-4am-nashr-tabsit-l5-001:q3': R(E('(2x+10)(x+6)').coef(0)),
  'ex-4am-nashr-tabsit-l5-001:q4': R(E('(2x+10)(x+6)-x^2').coef(2)),
  'ex-4am-nashr-tabsit-l5-001:q5': R(E('(2x+10)(x+6)-x^2').coef(1)),
  'ex-4am-nashr-tabsit-l5-001:q6': R(E('(2x+10)(x+6)-x^2').coef(0)),
  'ex-4am-nashr-tabsit-l5-001:q7': R(E('(2x+10)(x+6)-x^2').at('20')),
  'ex-4am-nashr-tabsit-l5-001:q8': R(q(E('(2x+10)(x+6)-x^2').at(20)).div(300).mul(4500)),
  'ex-4am-nashr-tabsit-l5-002:q1': R(E('(x+5)(x+2)').coef(2)),
  'ex-4am-nashr-tabsit-l5-002:q2': R(E('(x+5)(x+2)').coef(1)),
  'ex-4am-nashr-tabsit-l5-002:q3': R(E('(x+5)(x+2)').coef(0)),
  'ex-4am-nashr-tabsit-l5-002:q4': R(E('(x+5)(x+2)-x').coef(2)),
  'ex-4am-nashr-tabsit-l5-002:q5': R(E('(x+5)(x+2)-x').coef(1)),
  'ex-4am-nashr-tabsit-l5-002:q6': R(E('(x+5)(x+2)-x').coef(0)),
  'ex-4am-nashr-tabsit-l5-002:q7': R(E('(x+5)(x+2)-x').at('2')),
  'ex-4am-nashr-tabsit-l5-002:q8': R(q(E('(x+5)(x+2)-x').at(2)).mul(q(1500).add(400))),
  'ex-4am-nashr-tabsit-l5-003:q1': R(E('x(3x+4)').coef(2)),
  'ex-4am-nashr-tabsit-l5-003:q2': R(E('x(3x+4)').coef(1)),
  'ex-4am-nashr-tabsit-l5-003:q3': R(E('(2x+10)(x-2)').coef(2)),
  'ex-4am-nashr-tabsit-l5-003:q4': R(E('(2x+10)(x-2)').coef(1)),
  'ex-4am-nashr-tabsit-l5-003:q5': R(E('(2x+10)(x-2)').coef(0)),
  'ex-4am-nashr-tabsit-l5-003:q6': R(E('x(3x+4)+(2x+10)(x-2)').coef(2)),
  'ex-4am-nashr-tabsit-l5-003:q7': R(E('x(3x+4)+(2x+10)(x-2)').coef(1)),
  'ex-4am-nashr-tabsit-l5-003:q8': R(E('x(3x+4)+(2x+10)(x-2)').coef(0)),
  'ex-4am-nashr-tabsit-l5-003:q9': R(E('x(3x+4)+(2x+10)(x-2)').at('8')),
  'ex-4am-nashr-tabsit-l5-003:q10': R(q(E('x(3x+4)+(2x+10)(x-2)').at(8)).mul(12).mul(80)),
  'ex-4am-nashr-tabsit-l5-004:q1': R(E('6(x+6)+6x').coef(1)),
  'ex-4am-nashr-tabsit-l5-004:q2': R(E('6(x+6)+6x').coef(0)),
  'ex-4am-nashr-tabsit-l5-004:q3': R(E('6(x+6)+6x-10').coef(1)),
  'ex-4am-nashr-tabsit-l5-004:q4': R(E('6(x+6)+6x-10').coef(0)),
  'ex-4am-nashr-tabsit-l5-004:q5': R(E('6(x+6)+6x-10').at('7')),
  'ex-4am-nashr-tabsit-l5-004:q6': R(q(E('6(x+6)+6x-10').at(7)).div(22).mul(2400)),
  'ex-4am-nashr-tabsit-l5-005:q1': R(E('(40-2x)(30-2x)').coef(2)),
  'ex-4am-nashr-tabsit-l5-005:q2': R(E('(40-2x)(30-2x)').coef(1)),
  'ex-4am-nashr-tabsit-l5-005:q3': R(E('(40-2x)(30-2x)').coef(0)),
  'ex-4am-nashr-tabsit-l5-005:q4': R(E('1200-4x^2').coef(2)),
  'ex-4am-nashr-tabsit-l5-005:q5': R(E('1200-4x^2').coef(0)),
  'ex-4am-nashr-tabsit-l5-005:q6': R(E('(40-2x)(30-2x)').at('5')),
  'ex-4am-nashr-tabsit-l5-005:q7': R(q(E('1200-4x^2').at(5)).mul(500).div(10000).mul(300)),
  'ex-4am-nashr-tabsit-l5-006:q1': R(E('(x+20)(x+10)').coef(2)),
  'ex-4am-nashr-tabsit-l5-006:q2': R(E('(x+20)(x+10)').coef(1)),
  'ex-4am-nashr-tabsit-l5-006:q3': R(E('(x+20)(x+10)').coef(0)),
  'ex-4am-nashr-tabsit-l5-006:q4': R(E('(x+16)(x+6)').coef(2)),
  'ex-4am-nashr-tabsit-l5-006:q5': R(E('(x+16)(x+6)').coef(1)),
  'ex-4am-nashr-tabsit-l5-006:q6': R(E('(x+16)(x+6)').coef(0)),
  'ex-4am-nashr-tabsit-l5-006:q7': R(E('(x+20)(x+10)-(x+16)(x+6)').coef(1)),
  'ex-4am-nashr-tabsit-l5-006:q8': R(E('(x+20)(x+10)-(x+16)(x+6)').coef(0)),
  'ex-4am-nashr-tabsit-l5-006:q9': R(q(E('(x+16)(x+6)').at(30)).mul('0.5').mul(100)),
  'ex-4am-nashr-tabsit-l5-007:q1': R(E('(x+3)(2x+5)').coef(2)),
  'ex-4am-nashr-tabsit-l5-007:q2': R(E('(x+3)(2x+5)').coef(1)),
  'ex-4am-nashr-tabsit-l5-007:q3': R(E('(x+3)(2x+5)').coef(0)),
  'ex-4am-nashr-tabsit-l5-007:q4': R(E('(x+3)(2x+5)').at('4')),
  'ex-4am-nashr-tabsit-l5-007:q5': R(q(E('(x+3)(2x+5)').at(4)).mul(650).sub(25000)),
  'ex-4am-nashr-tabsit-l5-008:q1': R(E('x(2x+5)').coef(2)),
  'ex-4am-nashr-tabsit-l5-008:q2': R(E('x(2x+5)').coef(1)),
  'ex-4am-nashr-tabsit-l5-008:q3': R(E('(2x+9)(x+4)').coef(2)),
  'ex-4am-nashr-tabsit-l5-008:q4': R(E('(2x+9)(x+4)').coef(1)),
  'ex-4am-nashr-tabsit-l5-008:q5': R(E('(2x+9)(x+4)').coef(0)),
  'ex-4am-nashr-tabsit-l5-008:q6': R(E('(2x+9)(x+4)-x(2x+5)').coef(1)),
  'ex-4am-nashr-tabsit-l5-008:q7': R(E('(2x+9)(x+4)-x(2x+5)').coef(0)),
  'ex-4am-nashr-tabsit-l5-008:q8': R(q(E('(2x+9)(x+4)-x(2x+5)').at(10)).mul(1500)),
  'ex-4am-nashr-tabsit-l5-009:q1': R(E('(3x+2)(x+4)').coef(2)),
  'ex-4am-nashr-tabsit-l5-009:q2': R(E('(3x+2)(x+4)').coef(1)),
  'ex-4am-nashr-tabsit-l5-009:q3': R(E('(3x+2)(x+4)').coef(0)),
  'ex-4am-nashr-tabsit-l5-009:q4': R(E('2(3x+2)(x+4)').coef(2)),
  'ex-4am-nashr-tabsit-l5-009:q5': R(E('2(3x+2)(x+4)').coef(1)),
  'ex-4am-nashr-tabsit-l5-009:q6': R(E('2(3x+2)(x+4)').coef(0)),
  'ex-4am-nashr-tabsit-l5-009:q7': R(E('2(3x+2)(x+4)').at('6')),
  'ex-4am-nashr-tabsit-l5-009:q8': R(q(E('2(3x+2)(x+4)').at(6)).mul(1200)),
  'ex-4am-nashr-tabsit-l5-010:q1': R(E('(2x+1)(x+3)').coef(2)),
  'ex-4am-nashr-tabsit-l5-010:q2': R(E('(2x+1)(x+3)').coef(1)),
  'ex-4am-nashr-tabsit-l5-010:q3': R(E('(2x+1)(x+3)').coef(0)),
  'ex-4am-nashr-tabsit-l5-010:q4': R(E('900(2x+1)(x+3)+1500').coef(2)),
  'ex-4am-nashr-tabsit-l5-010:q5': R(E('900(2x+1)(x+3)+1500').coef(1)),
  'ex-4am-nashr-tabsit-l5-010:q6': R(E('900(2x+1)(x+3)+1500').coef(0)),
  'ex-4am-nashr-tabsit-l5-010:q7': R(q(E('900(2x+1)(x+3)+1500').at(1)).mul(4)),
};
