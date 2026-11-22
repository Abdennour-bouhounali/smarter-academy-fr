// Oracle du banc « nashr-jabri-3am » (3AM, unité 4 « الحساب الحرفي » — نشر عبارات جبرية), 2026-10-21.
// Chaque réponse est RECALCULÉE ici à partir des expressions de l'énoncé (fusionné dans
// scripts/practice-answer-oracle.test.mjs), avec son propre analyseur et les polynômes exacts de helpers.mjs —
// jamais packages/core (brackets.js / polynomials.js), jamais la clé du contenu.
//
// E('…')        : lit une expression à une lettre x (+ − × /, ^, parenthèses, produit implicite « 3x », « 2(x + 1) », « (x + 2)(x − 3) »)
//                 et la calcule en polynôme exact (coef(k), at(x)). Un NOMBRE écrit « 90*60-35*20 » est un polynôme constant.
// pick(t, opts) : l'UNIQUE option égale au polynôme t (égalité exacte des polynômes, puis contre-vérification
//                 par évaluation en plusieurs valeurs de x) ; lève une erreur s'il y en a zéro ou plusieurs —
//                 c'est ce qui prouve que chaque distracteur est FAUX (et que la cible est atteinte une seule fois).
// truth(a, b)   : la réponse « نعم / لا » à « a = b pour tout x ? » (égalité de polynômes + vérification par valeurs).
// root(src)     : la racine (exacte) d'une expression du premier degré (étapes « حلّ المعادلة », counted:false).
// Les décisions « نعم / لا » de fin de situation (A = oui, B = non) sont tranchées par un calcul refait ici.
import { R, C, poly, q } from './helpers.mjs';

function parse(src) {
  const s = String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/×/g, '*');
  let i = 0;
  const fail = (m) => { throw new Error(`oracle nashr-jabri-3am: ${m} dans « ${src} » (position ${i})`); };
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
      if (d.degree() > 0) throw new Error('oracle nashr-jabri-3am: division par une expression littérale');
      return value(n.a).mul(poly.of(q(1).div(d.coef(0)).toString()));
    }
    default: throw new Error(`oracle nashr-jabri-3am: nœud ${n.op}`);
  }
}

const E = (src) => value(parse(src));
const PROBES = ['-3', '-1', '0', '1/2', '2', '5', '11'];
/** a et b sont le même polynôme (et, par prudence, la même valeur en plusieurs x). */
function equal(a, b) {
  const pa = E(a); const pb = E(b);
  const byPoly = pa.equals(pb);
  const byValue = PROBES.every((x) => pa.at(x) === pb.at(x));
  if (byPoly !== byValue) throw new Error(`oracle nashr-jabri-3am: désaccord polynôme / valeurs pour « ${a} » et « ${b} »`);
  return byPoly;
}
function pick(target, opts) {
  const hits = Object.entries(opts).filter(([, src]) => equal(src, target)).map(([id]) => id);
  if (hits.length !== 1) throw new Error(`oracle nashr-jabri-3am: ${hits.length} option(s) égale(s) à « ${target} »`);
  return hits[0];
}
const truth = (a, b, yes, no) => (equal(a, b) ? yes : no);
function root(src) {
  const p = E(src);
  if (p.degree() !== 1) throw new Error(`oracle nashr-jabri-3am: « ${src} » n'est pas du premier degré`);
  return q(p.coef(0)).neg().div(q(p.coef(1))).toString();
}

export const ORACLE = {
  "ex-3am-nashr-jabri-3am-l1-001:q1": R(E("(3x-2)(3x+2)").coef(2)),
  "ex-3am-nashr-jabri-3am-l1-001:q2": R(E("(3x-2)(3x+2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l1-001:q3": R(E("(3x-2)(3x+2)").coef(0)),
  "ex-3am-nashr-jabri-3am-l1-002:q1": C(pick("15x^2+2x-8", {A: "15x^2+2x-8", B: "15x^2+2x+8", C: "15x^2+22x-8", D: "15x^2-8"})),
  "ex-3am-nashr-jabri-3am-l1-002:q2": R(E("(3x-2)(5x+4)").at("-2")),
  "ex-3am-nashr-jabri-3am-l1-002:q3": R(E("15x^2+2x-8").at("-2")),
  "ex-3am-nashr-jabri-3am-l1-003:q1": C(pick("-12x+8", {A: "-12x-2", B: "-12x+8", C: "-12x-8", D: "12x-8"})),
  "ex-3am-nashr-jabri-3am-l1-003:q2": C(pick("20-4x", {A: "-4(5+x)", B: "-4(-5+x)", C: "-4(-5-x)"})),
  "ex-3am-nashr-jabri-3am-l1-004:q1": R(E("x(2x-5)+6").coef(1)),
  "ex-3am-nashr-jabri-3am-l1-004:q2": R(E("-5x+2(x^2+3)").coef(2)),
  "ex-3am-nashr-jabri-3am-l1-004:q3": C(truth("x(2x-5)+6", "-5x+2(x^2+3)", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l1-005:q1": C(pick("8x-24", {A: "8(x-24)", B: "8(x-3)", C: "8(x+3)"})),
  "ex-3am-nashr-jabri-3am-l1-005:q2": C(truth("6x+12", "6(x+2)", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l1-005:q3": C(truth("3x+15", "3(x+15)", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l1-006:q1": C(pick("4x-20", {A: "4x-20", B: "4x-5", C: "4x+20", D: "-4x-20"})),
  "ex-3am-nashr-jabri-3am-l1-006:q2": C(pick("2x-6", {A: "-6-x", B: "-2x+6", C: "-6-2x", D: "2x-6"})),
  "ex-3am-nashr-jabri-3am-l1-007:q1": C(pick("x^2+5x", {A: "x^2+5", B: "2x+5x", C: "x^2+5x"})),
  "ex-3am-nashr-jabri-3am-l1-007:q2": C(pick("6x^2-3x", {A: "6x^2-1", B: "6x^2+3x", C: "6x^2-3x", D: "6x-3x"})),
  "ex-3am-nashr-jabri-3am-l1-007:q3": C(pick("x^2-4x", {A: "-4x-x^2", B: "4x-x^2", C: "-4+x^2", D: "x^2-4x"})),
  "ex-3am-nashr-jabri-3am-l1-008:q1": C(pick("5x-7", {A: "5x-7", B: "8(x-2)", C: "5x+1"})),
  "ex-3am-nashr-jabri-3am-l1-008:q2": C(pick("-2x+1", {A: "2x+13", B: "-2x+1", C: "-2x+10", D: "5(x+3)"})),
  "ex-3am-nashr-jabri-3am-l1-009:q1": R(E("(2x-3)(-5x-4)").coef(2)),
  "ex-3am-nashr-jabri-3am-l1-009:q2": R(E("(2x-3)(-5x-4)").coef(1)),
  "ex-3am-nashr-jabri-3am-l1-009:q3": R(E("(2x-3)(-5x-4)").coef(0)),
  "ex-3am-nashr-jabri-3am-l1-009:q4": R(E("(2x-3)(-5x-4)").at("0")),
  "ex-3am-nashr-jabri-3am-l1-010:q1": C(pick("x^2-5x+6", {A: "x^2-5x+6", B: "x^2-5x-6", C: "x^2-5x", D: "x^2+5x+6"})),
  "ex-3am-nashr-jabri-3am-l1-010:q2": C(pick("x^2+3x-4", {A: "x^2+3x-4", B: "x^2+3x+4", C: "x^2-4", D: "x^2+5x-4"})),
  "ex-3am-nashr-jabri-3am-l2-001:q1": R(E("3(x+2)").coef(0)),
  "ex-3am-nashr-jabri-3am-l2-001:q2": C(pick("x^2+5x+4", {A: "x^2+4", B: "x^2+5x+4", C: "6x^2+4"})),
  "ex-3am-nashr-jabri-3am-l2-001:q3": C(pick("3(x+2)+(x+4)(x+1)", {A: "x^2+8x+10", B: "x^2+8x+6", C: "9x^2+10"})),
  "ex-3am-nashr-jabri-3am-l2-001:q4": R(E("3(x+2)+(x+4)(x+1)").at("1")),
  "ex-3am-nashr-jabri-3am-l2-002:q1": R(E("5(x-1)").coef(0)),
  "ex-3am-nashr-jabri-3am-l2-002:q2": R(E("(3x+1)(x+2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l2-002:q3": C(pick("(3x+1)(x+2)+5(x-1)", {A: "3x^2+7x-4", B: "3x^2+12x-3", C: "8x^2-3", D: "3x^2+12x+7"})),
  "ex-3am-nashr-jabri-3am-l2-002:q4": R(E("(3x+1)(x+2)+5(x-1)").at("1")),
  "ex-3am-nashr-jabri-3am-l2-003:q1": R(E("(-3x+2)(2x-5)").coef(2)),
  "ex-3am-nashr-jabri-3am-l2-003:q2": R(E("(-3x+2)(2x-5)").coef(1)),
  "ex-3am-nashr-jabri-3am-l2-003:q3": R(E("(-3x+2)(2x-5)").coef(0)),
  "ex-3am-nashr-jabri-3am-l2-003:q4": C(pick("-8x^2+30x-18", {A: "-8x^2+30x-18", B: "-8x^2+30x+18", C: "-8x^2+18x-18", D: "-8x^2-18"})),
  "ex-3am-nashr-jabri-3am-l2-004:q1": R(E("(4x-6)(x+3)").coef(1)),
  "ex-3am-nashr-jabri-3am-l2-004:q2": R(E("(4x-6)(x+3)").coef(0)),
  "ex-3am-nashr-jabri-3am-l2-004:q3": R(E("(4x-6)(x+3)").at("1/2")),
  "ex-3am-nashr-jabri-3am-l2-004:q4": R(E("4x^2+6x-18").at("1/2")),
  "ex-3am-nashr-jabri-3am-l2-005:q1": C(pick("x^2-2x-8", {A: "(x-4)(x+2)", B: "(x-4)(x-2)", C: "(4-x)(x+2)", D: "(x+4)(x-2)"})),
  "ex-3am-nashr-jabri-3am-l2-005:q2": C(pick("x^2+x-6", {A: "(x+3)(x-2)", B: "(x-3)(x+2)", C: "(x+3)(x+2)"})),
  "ex-3am-nashr-jabri-3am-l2-006:q1": R(E("2x*2x").coef(2)),
  "ex-3am-nashr-jabri-3am-l2-006:q2": C(pick("x(x+6)", {A: "x^2+6", B: "2x+6", C: "x^2+6x"})),
  "ex-3am-nashr-jabri-3am-l2-006:q3": R(E("2x*2x").at("2")),
  "ex-3am-nashr-jabri-3am-l2-006:q4": R(E("x(x+6)").at("2")),
  "ex-3am-nashr-jabri-3am-l2-006:q5": C(truth("2x*2x", "x(x+6)", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l2-007:q1": R(q(1020).mul(63)),
  "ex-3am-nashr-jabri-3am-l2-007:q2": R(q(1020).mul(87)),
  "ex-3am-nashr-jabri-3am-l2-007:q3": R(q(2050).mul(34)),
  "ex-3am-nashr-jabri-3am-l2-008:q1": C(pick("x^2+8x+16", {A: "x^2+16", B: "x^2+4x+16", C: "x^2+8x+16"})),
  "ex-3am-nashr-jabri-3am-l2-008:q2": R(E("(3x-2)(3x-2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l2-008:q3": R(E("(3x-2)(3x-2)").coef(0)),
  "ex-3am-nashr-jabri-3am-l2-009:q1": C(truth("5(x-3)", "5x-3", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l2-009:q2": R(E("5(x-3)").at("2")),
  "ex-3am-nashr-jabri-3am-l2-009:q3": R(E("5x-3").at("2")),
  "ex-3am-nashr-jabri-3am-l2-009:q5": R(E("5(x-3)").coef(0)),
  "ex-3am-nashr-jabri-3am-l2-010:q1": C(pick("(x+5)(x+2)", {A: "x+5x+2x+10", B: "x*x+5x+2x+10", C: "x*x+5+2x+10"})),
  "ex-3am-nashr-jabri-3am-l2-010:q2": R(E("(x+5)(x+2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l2-010:q3": R(E("x*x+5x+2x+10").at(3)),
  "ex-3am-nashr-jabri-3am-l2-010:q4": R(E("(x+5)(x+2)").at(3)),
  "ex-3am-nashr-jabri-3am-l3-001:q1": C(pick("15+(x-4)-(3x+6)", {A: "-2x+5", B: "4x+17", C: "-2x+17"})),
  "ex-3am-nashr-jabri-3am-l3-001:q2": R(E("3x(x+2)+(2x+1)(x-3)").coef(2)),
  "ex-3am-nashr-jabri-3am-l3-001:q3": R(E("3x(x+2)+(2x+1)(x-3)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-001:q4": R(E("3x(x+2)+(2x+1)(x-3)").coef(0)),
  "ex-3am-nashr-jabri-3am-l3-001:q5": R(E("3x(x+2)+(2x+1)(x-3)").at("2")),
  "ex-3am-nashr-jabri-3am-l3-002:q1": R(E("4x(x-2)-(3x^2-16)").coef(2)),
  "ex-3am-nashr-jabri-3am-l3-002:q2": R(E("4x(x-2)-(3x^2-16)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-002:q3": C(pick("x^2-8x+16", {A: "x^2-8x+16", B: "x^2+16", C: "x^2-8x-16", D: "x^2-4x+16"})),
  "ex-3am-nashr-jabri-3am-l3-002:q4": R(E("(4x(x-2)-(3x^2-16))-((x-4)(x-4))").coef(0)),
  "ex-3am-nashr-jabri-3am-l3-002:q5": C(truth("4x(x-2)-(3x^2-16)", "(x-4)(x-4)", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l3-003:q1": R(E("(3x-2)(x+4)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-003:q2": C(truth("(3x-2)(x+4)", "3x^2+10x-8", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l3-003:q3": R(E("(3x-2)(x+4)-(2x^2+8x-5)").coef(0)),
  "ex-3am-nashr-jabri-3am-l3-003:q4": R(E("(3x-2)(x+4)-(2x^2+8x-5)").at("3")),
  "ex-3am-nashr-jabri-3am-l3-004:q1": C(pick("3x^2-5x-4(2x-3)+2", {A: "3x^2-13x+14", B: "3x^2-13x+2", C: "3x^2-13x-10", D: "3x^2+3x+14"})),
  "ex-3am-nashr-jabri-3am-l3-004:q2": R(E("3x^2-5x-4(2x-3)+2").at("1")),
  "ex-3am-nashr-jabri-3am-l3-004:q3": R(E("(2x+3)(x+5)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-005:q1": R(E("(3x-4)(x-2)-(2x^2-10x+5)").coef(2)),
  "ex-3am-nashr-jabri-3am-l3-005:q2": R(E("(3x-4)(x-2)-(2x^2-10x+5)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-005:q3": R(E("(3x-4)(x-2)-(2x^2-10x+5)").coef(0)),
  "ex-3am-nashr-jabri-3am-l3-005:q4": R(E("(3x-4)(x-2)-(2x^2-10x+5)").at("2")),
  "ex-3am-nashr-jabri-3am-l3-006:q1": R(E("(x+2)(2x-3)+3x^2-5x").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-006:q2": R(E("(x+2)(2x-3)+3x^2-5x").coef(0)),
  "ex-3am-nashr-jabri-3am-l3-006:q3": R(root("3(x-4)-(x+2)")),
  "ex-3am-nashr-jabri-3am-l3-006:q4": R(root("2(x-3)-(x+5)")),
  "ex-3am-nashr-jabri-3am-l3-007:q1": R(E("2(3x-4)").coef(0)),
  "ex-3am-nashr-jabri-3am-l3-007:q2": R(E("(x+3)(x-5)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-007:q3": C(pick("2(3x-4)+(x+3)(x-5)", {A: "x^2+4x-23", B: "x^2+4x-19", C: "5x^2-23"})),
  "ex-3am-nashr-jabri-3am-l3-008:q1": C(pick("3x^2-5x-12", {A: "3x^2-12", B: "3x^2-5x-12", C: "3x^2+13x-12"})),
  "ex-3am-nashr-jabri-3am-l3-008:q2": R(E("2(x-3)(3x+4)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-008:q3": C(pick("2(x-3)(3x+4)", {A: "(2x-6)(3x+4)", B: "(2x-3)(3x+4)", C: "(2x-6)(6x+8)"})),
  "ex-3am-nashr-jabri-3am-l3-008:q4": R(E("2(x-3)(3x+4)").coef(0)),
  "ex-3am-nashr-jabri-3am-l3-009:q1": R(E("(x+3)(x-4)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-009:q2": C(pick("x^3-x^2-12x", {A: "x^3-x^2-12x", B: "x^3+x^2-12x", C: "x^3-x-12"})),
  "ex-3am-nashr-jabri-3am-l3-009:q3": R(E("x(x+3)(x-4)").coef(2)),
  "ex-3am-nashr-jabri-3am-l3-010:q1": C(pick("x(x+1)(x+6)", {A: "x^3+7x^2+6x", B: "x^3+7x+6", C: "3x+7"})),
  "ex-3am-nashr-jabri-3am-l3-010:q2": R(E("2((x+6)+x)(x+1)").coef(1)),
  "ex-3am-nashr-jabri-3am-l3-010:q3": R(E("x(x+1)(x+6)").at("2")),
  "ex-3am-nashr-jabri-3am-l4-001:q1": R(E("4x(2x+3)-(x+5)").coef(1)),
  "ex-3am-nashr-jabri-3am-l4-001:q2": R(E("4x(2x+3)-(x+5)").coef(0)),
  "ex-3am-nashr-jabri-3am-l4-001:q3": R(root("(4x(2x+3)-(x+5))-8x^2-(5x+7)")),
  "ex-3am-nashr-jabri-3am-l4-002:q1": R(E("(x-2)(x+2)-(x^2+2x-3)").coef(1)),
  "ex-3am-nashr-jabri-3am-l4-002:q2": R(E("(x-2)(x+2)-(x^2+2x-3)").coef(0)),
  "ex-3am-nashr-jabri-3am-l4-002:q3": R(E("(x-2)(x+2)-(x^2+2x-3)").at("500")),
  "ex-3am-nashr-jabri-3am-l4-003:q1": R(E("(x-3)(x-3)-(x-1)(x-5)").coef(0)),
  "ex-3am-nashr-jabri-3am-l4-003:q2": R(E("(x-3)(x-3)-(x-1)(x-5)").at("10000")),
  "ex-3am-nashr-jabri-3am-l4-004:q1": R(E("(x+2)(x-2)").coef(0)),
  "ex-3am-nashr-jabri-3am-l4-004:q2": R(E("(x+2)(x-2)").at("1000")),
  "ex-3am-nashr-jabri-3am-l4-004:q3": R(E("(x+2)(x-2)").at("100")),
  "ex-3am-nashr-jabri-3am-l4-005:q1": R(E("(2x-3)(3x+1)").coef(1)),
  "ex-3am-nashr-jabri-3am-l4-005:q2": C(pick("(2x-3)(2x+1)+x(2x-3)", {A: "6x^2-x-3", B: "6x^2-4x-6", C: "6x^2-7x-3"})),
  "ex-3am-nashr-jabri-3am-l4-005:q3": C(truth("(2x-3)(3x+1)", "(2x-3)(2x+1)+x(2x-3)", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l4-006:q1": R(E("(x+4)(x-1)-x^2-3x").at("3")),
  "ex-3am-nashr-jabri-3am-l4-006:q2": R(E("(x+4)(x-1)-x^2-3x").at("-5")),
  "ex-3am-nashr-jabri-3am-l4-006:q3": C(pick("(x+4)(x-1)-x^2-3x", {A: "-4", B: "-3x-4", C: "6x-4"})),
  "ex-3am-nashr-jabri-3am-l4-006:q4": C(truth("(x+4)(x-1)-x^2-3x", "-4", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l4-007:q1": C(truth("(x+3)(x-7)", "x^2-4x-21", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l4-007:q2": C(truth("(2x-3)(x-4)", "2x^2-11x-12", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l4-007:q3": C(truth("(3x-2)(x+5)", "3x^2+13x-10", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l4-007:q4": C(truth("(x-5)(x-3)", "x^2-8x-15", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l4-007:q5": R(E("(2x-3)(x-4)").coef(0)),
  "ex-3am-nashr-jabri-3am-l4-008:q1": R(E("(x+3)(x-3)-x^2").at("50")),
  "ex-3am-nashr-jabri-3am-l4-008:q2": R(E("(x+3)(x-3)-x^2").coef(0)),
  "ex-3am-nashr-jabri-3am-l4-008:q3": R(E("(x+3)(x-3)-x^2").at("100")),
  "ex-3am-nashr-jabri-3am-l4-008:q4": C(truth("(x+3)(x-3)-x^2", "-9", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l4-009:q1": R(E("x^2-1").at("8")),
  "ex-3am-nashr-jabri-3am-l4-009:q2": C(pick("x^2-1", {A: "x^2-1", B: "x^2+1", C: "x^2+x-1"})),
  "ex-3am-nashr-jabri-3am-l4-009:q3": R(E("(x-1)(x+1)").at("5000")),
  "ex-3am-nashr-jabri-3am-l4-010:q1": R(E("(x+4)(x-2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l4-010:q2": R(E("x(x+1)+7").coef(1)),
  "ex-3am-nashr-jabri-3am-l4-010:q3": R(root("(x+4)(x-2)-(x(x+1)+7)")),
  "ex-3am-nashr-jabri-3am-l5-001:q1": R(E("(x+5)+3").coef(0)),
  "ex-3am-nashr-jabri-3am-l5-001:q2": C(pick("2(x+8)+2(x+2)", {A: "3x+18", B: "4x+20", C: "4x+10"})),
  "ex-3am-nashr-jabri-3am-l5-001:q3": R(E("(x+8)(x+2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-001:q4": C(pick("(x+8)(x+2)", {A: "(x+5)(x+2)+3x", B: "(x+5)(x+2)+3", C: "(x+5)(x+2)+3(x+2)"})),
  "ex-3am-nashr-jabri-3am-l5-001:q5": R(q(E("2(x+8)+2(x+2)").at(12)).div(4)),
  "ex-3am-nashr-jabri-3am-l5-001:q6": C(Number(E("2(x+8)+2(x+2)").at(12)) / 4 <= 20 ? "A" : "B"),
  "ex-3am-nashr-jabri-3am-l5-002:q1": C(pick("3x(x+2)", {A: "3x^2+6x", B: "3x+x+2", C: "3x^2+2"})),
  "ex-3am-nashr-jabri-3am-l5-002:q2": R(E("(2x+4)(x+2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-002:q3": C(truth("(5x+4)(x+2)", "3x(x+2)+(2x+4)(x+2)", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l5-002:q4": R(E("3x(x+2)+(2x+4)(x+2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-002:q5": R(E("2((2x+4)+(x+2))").at("50")),
  "ex-3am-nashr-jabri-3am-l5-002:q6": R(q(E("2((2x+4)+(x+2))").at(50)).mul(450)),
  "ex-3am-nashr-jabri-3am-l5-002:q7": C(Number(q(E("2((2x+4)+(x+2))").at(50)).mul(450).toString()) <= 150000 ? "A" : "B"),
  "ex-3am-nashr-jabri-3am-l5-003:q1": C(pick("2((4x+1)+(3x-2))", {A: "14x-2", B: "14x+2", C: "14x-1"})),
  "ex-3am-nashr-jabri-3am-l5-003:q2": R(E("(4x+1)(3x-2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-003:q3": R(E("2((4x+1)+(3x-2))").at("20")),
  "ex-3am-nashr-jabri-3am-l5-003:q4": R(E("(4x+1)(3x-2)").at("20")),
  "ex-3am-nashr-jabri-3am-l5-003:q5": C(pick("(4x+1)(3x-2)-x(3x-2)", {A: "9x^2-3x-2", B: "9x^2-5x-4", C: "9x^2-7x-2"})),
  "ex-3am-nashr-jabri-3am-l5-003:q6": C(truth("(3x+1)(3x-2)", "(4x+1)(3x-2)-x(3x-2)", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l5-003:q7": R(E("(3x+1)(3x-2)").at("20")),
  "ex-3am-nashr-jabri-3am-l5-003:q8": C(Number(E("(3x+1)(3x-2)").at(20)) * 250 <= 900000 ? "A" : "B"),
  "ex-3am-nashr-jabri-3am-l5-004:q1": C(pick("2((5x+3)+(2x-1))", {A: "14x+2", B: "14x+4", C: "7x+2"})),
  "ex-3am-nashr-jabri-3am-l5-004:q2": R(E("(5x+3)(2x-1)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-004:q3": R(root("14x+4-200")),
  "ex-3am-nashr-jabri-3am-l5-004:q4": R(E("90*60-35*20").at(0)),
  "ex-3am-nashr-jabri-3am-l5-004:q5": R(E("90*(60-20)+(90-35)*20").at(0)),
  "ex-3am-nashr-jabri-3am-l5-004:q6": C(truth("90*60-35*20", "90*(60-20)+(90-35)*20", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l5-004:q7": C(Number(E("90*60-35*20").at(0)) * 85 <= 400000 ? "A" : "B"),
  "ex-3am-nashr-jabri-3am-l5-005:q1": R(E("(x+5)(41-x)-x(36-x)").at("10")),
  "ex-3am-nashr-jabri-3am-l5-005:q2": R(E("(x+5)(41-x)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-005:q3": R(E("(x+5)(41-x)-x(36-x)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-005:q4": R(E("(x+5)(41-x)-x(36-x)").coef(0)),
  "ex-3am-nashr-jabri-3am-l5-005:q5": C(truth("(x+5)(41-x)-x(36-x)", "205", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l5-006:q1": R(E("x^2-(x-1)^2").at("9")),
  "ex-3am-nashr-jabri-3am-l5-006:q2": R(E("(x+1)(x+1)-x^2").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-006:q3": R(E("(x+1)(x+1)-x^2").coef(0)),
  "ex-3am-nashr-jabri-3am-l5-006:q4": R(E("(x+1)(x+1)-x^2").at("999")),
  "ex-3am-nashr-jabri-3am-l5-007:q1": R(E("(40-x)(25-x)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-007:q2": C(pick("(40-x)(25-x)", {A: "1000-(40x+25x-x^2)", B: "1000-65x", C: "1000-(40x+25x+x^2)"})),
  "ex-3am-nashr-jabri-3am-l5-007:q3": C(truth("(40-x)(25-x)", "1000-65x+x^2", 'A', 'B')),
  "ex-3am-nashr-jabri-3am-l5-007:q5": R(E("(40-x)(25-x)").at("5")),
  "ex-3am-nashr-jabri-3am-l5-007:q6": C(Number(E("(40-x)(25-x)").at(5)) >= 600 ? "A" : "B"),
  "ex-3am-nashr-jabri-3am-l5-008:q1": R(E("(x+8)(x-2)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-008:q2": C(pick("(x+8)(x-2)", {A: "(x-2)x+8", B: "(x-2)x+8(x-2)"})),
  "ex-3am-nashr-jabri-3am-l5-008:q3": C(pick("2((x+8)+(x-2))", {A: "4x+12", B: "3x+14", C: "4x+20"})),
  "ex-3am-nashr-jabri-3am-l5-008:q4": R(E("(x+8)(x-2)").at("12")),
  "ex-3am-nashr-jabri-3am-l5-008:q5": R(E("2((x+8)+(x-2))").at("12")),
  "ex-3am-nashr-jabri-3am-l5-008:q6": C(E("x+8").at(12) === "20" && E("x-2").at(12) === "10" && E("(x+8)(x-2)").at(12) === "200" ? "A" : "B"),
  "ex-3am-nashr-jabri-3am-l5-009:q1": R(E("(x+20)(x+30)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-009:q2": R(E("2(x+30)").coef(0)),
  "ex-3am-nashr-jabri-3am-l5-009:q3": C(pick("(x+20)(x+30)+2(x+30)", {A: "x^2+52x+660", B: "x^2+52x+630", C: "x^2+50x+660"})),
  "ex-3am-nashr-jabri-3am-l5-009:q4": R(E("(x+20)(x+30)+2(x+30)").at("10")),
  "ex-3am-nashr-jabri-3am-l5-009:q5": C(Number(E("(x+20)(x+30)+2(x+30)").at(10)) * 100 <= 130000 ? "A" : "B"),
  "ex-3am-nashr-jabri-3am-l5-010:q1": R(E("(x+12)(x+8)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-010:q2": R(E("(x+8)(x+4)").coef(1)),
  "ex-3am-nashr-jabri-3am-l5-010:q3": C(pick("(x+12)(x+8)-(x+8)(x+4)", {A: "32x+128", B: "2x^2+32x+128", C: "8x+64"})),
  "ex-3am-nashr-jabri-3am-l5-010:q4": C(pick("(x+12)(x+8)-(x+8)(x+4)", {A: "2*2(x+12)+2*2(x+4)", B: "2*2(x+12)+2*2(x+8)"})),
  "ex-3am-nashr-jabri-3am-l5-010:q5": R(E("8x+64").at("10")),
  "ex-3am-nashr-jabri-3am-l5-010:q6": C(Number(E("(x+12)(x+8)-(x+8)(x+4)").at(10)) * 1200 <= 180000 ? "A" : "B"),
};
