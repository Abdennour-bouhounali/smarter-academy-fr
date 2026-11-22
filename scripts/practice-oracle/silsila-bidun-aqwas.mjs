// Oracle du banc « silsila-bidun-aqwas » (سلسلة عمليات دون أقواس وأولوية العمليات, 2AM unité 1, 2026-10-28) — feuilles d'examen de
// فصل (« على منوال اختبار الفصل الأول »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec un évaluateur écrit dans ce fichier — rationnels EXACTS en
// BigInt, priorités, décimaux — indépendant de packages/core (chainOps.js) ; les chaînes de l'énoncé y sont retapées en littéraux
// ASCII (« 26 - 9 + 4 », « * » = ×, « / » = ÷) :
//  - E(chaîne) : la valeur par la règle de l'école (d'abord le premier × ou ÷ en partant de la gauche, tant qu'il en reste ; puis
//    le premier + ou − de la gauche), et REFUSE tout intermédiaire négatif (la leçon n'en a pas : l'unité 3 les introduit) ;
//  - WRONG(how, chaîne) : la lecture fautive que nomme chaque distracteur — ADDFIRST (le + avant le −), MULFIRST (le × avant la ÷),
//    NOPRIORITY (tout de gauche à droite), RIGHTLEFT (tout de droite à gauche), PARTIAL (on s'arrête au premier produit) — par un
//    algorithme DIFFÉRENT (descente récursive à priorités) : le test vérifie que la valeur du distracteur est celle de sa lecture ;
//  - STORY(arbre, chaîne) : la situation est rejouée par un ARBRE de calcul (avec la structure de la situation) et doit valoir la
//    chaîne sans parenthèses du contenu ; PICKCHAIN juge chaque option-chaîne contre cet arbre (une seule vraie) ;
//  - PICKV / YN / MISS / FIRSTOP / MISSOP : un QCM est jugé option par option (valeur, oui/non, case □ résolue par linéarité puis
//    revérifiée, première opération, couple d'opérations) ; une seule option est vraie ;
//  - audit(bank) : RE-LIT l'énoncé LaTeX (« احسب $A = … $ » est évalué et doit valoir la clé), les options-chaînes, les signatures
//    de misconception (chaque valeur = sa lecture fautive, ensemble égal), interdit toute parenthèse, tout crochet, toute barre de
//    fraction et toute mention du manuel dans le texte, et relit la provenance de la banque (50 feuilles, 5 niveaux × 10, les
//    exercices `term_exam` se limitent aux sept sujets lus).
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) {
    if (d === 0n) throw new Error('division par zéro');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n; this.n = n / g; this.d = d / g;
  }
  add(o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Q(this.n * o.n, this.d * o.d); }
  div(o) { return new Q(this.n * o.d, this.d * o.n); }
  eq(o) { return this.n === o.n && this.d === o.d; }
  neg() { return this.n < 0n; }
}
/** « 12.5 », « 7 » → Q (littéral décimal exact, jamais de flottant). */
const dq = (s) => {
  const m = /^(\d+)(?:\.(\d+))?$/.exec(String(s).trim());
  if (!m) throw new Error(`nombre illisible : ${s}`);
  const f = m[2] ?? '';
  return new Q(BigInt(m[1] + f), 10n ** BigInt(f.length));
};
/** Écriture décimale d'un rationnel décimal (erreur sinon : les clés de la banque sont des décimaux exacts). */
const D = (x) => {
  for (let k = 0n; k <= 9n; k++) {
    const p = 10n ** k;
    if (p % x.d === 0n) {
      const N = x.n * (p / x.d);
      const s = (N < 0n ? -N : N).toString().padStart(Number(k) + 1, '0');
      const int = s.slice(0, s.length - Number(k));
      const frac = s.slice(s.length - Number(k)).replace(/0+$/, '');
      return `${N < 0n ? '-' : ''}${int}${frac ? `.${frac}` : ''}`;
    }
  }
  throw new Error(`${x.n}/${x.d} n'est pas un décimal`);
};
const A = (x) => R(D(x));

const OPS = '+-*/';
const apply = (a, o, b) => (o === '+' ? a.add(b) : o === '-' ? a.sub(b) : o === '*' ? a.mul(b) : a.div(b));
function tokens(s) {
  const t = s.trim().split(/\s+/);
  if (t.length % 2 === 0) throw new Error(`chaîne illisible : ${s}`);
  const nums = [], ops = [];
  t.forEach((w, i) => {
    if (i % 2 === 0) nums.push(dq(w));
    else { if (!OPS.includes(w) || w.length !== 1) throw new Error(`opération illisible : ${w}`); ops.push(w); }
  });
  return { t, nums, ops };
}
/** Indice de la première opération à effectuer : le premier × ou ÷ de la gauche, sinon le premier + ou − de la gauche. */
const firstIndex = (ops) => { const i = ops.findIndex((o) => o === '*' || o === '/'); return i < 0 ? 0 : i; };
/** La valeur par la règle de l'école ; `strict` refuse tout intermédiaire négatif (aucune chaîne de la leçon n'en a). */
export function E(s, strict = true) {
  const { nums, ops } = tokens(s);
  while (ops.length) {
    const i = firstIndex(ops);
    const r = apply(nums[i], ops[i], nums[i + 1]);
    if (strict && r.neg()) throw new Error(`intermédiaire négatif dans « ${s} »`);
    nums.splice(i, 2, r); ops.splice(i, 1);
  }
  return nums[0];
}
const PREC = {
  ADDFIRST: [{ '+': 2, '-': 1, '*': 3, '/': 3 }, false],
  MULFIRST: [{ '*': 3, '/': 2, '+': 1, '-': 1 }, false],
  NOPRIORITY: [{ '+': 1, '-': 1, '*': 1, '/': 1 }, false],
  RIGHTLEFT: [{ '+': 1, '-': 1, '*': 1, '/': 1 }, true],
};
/** La valeur d'une lecture fautive nommée (descente récursive à priorités), ou null si la lecture n'existe pas / n'est pas décimale. */
export function WRONG(how, s) {
  const { nums, ops } = tokens(s);
  if (how === 'PARTIAL') {
    const i = ops.findIndex((o) => o === '*' || o === '/');
    return i < 0 ? null : apply(nums[i], ops[i], nums[i + 1]);
  }
  const [prec, right] = PREC[how];
  let n = 0, p = 0;
  const parse = (minP) => {
    let lhs = nums[n++];
    while (p < ops.length && prec[ops[p]] >= minP) {
      const op = ops[p++];
      const rhs = parse(right ? prec[op] : prec[op] + 1);
      lhs = apply(lhs, op, rhs);
    }
    return lhs;
  };
  return parse(0);
}
/** L'arbre de calcul d'une situation : ['-', 500, ['+', ['*', 5, 35], 60]]. */
const TREE = (t) => (Array.isArray(t) ? apply(TREE(t[1]), t[0], TREE(t[2])) : dq(t));
const letter = (flags, what) => {
  const hits = flags.map((f, k) => (f ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`${what} : ${hits.length} options justes`);
  return C('ABCDEF'[hits[0]]);
};
const STORY = (tree, chain) => {
  const vt = TREE(tree), ve = E(chain);
  if (!vt.eq(ve)) throw new Error(`« ${chain} » vaut ${D(ve)} mais la situation vaut ${D(vt)}`);
  return vt;
};
const PICKCHAIN = (tree, opts) => letter(opts.map((o) => E(o).eq(TREE(tree))), `QCM de chaînes ${opts.join(' | ')}`);
const PICKV = (chain, vals) => letter(vals.map((x) => dq(x).eq(E(chain))), `QCM de valeurs ${chain}`);
const YN = (b) => C(b ? 'A' : 'B');
const GE = (a, b) => !a.sub(b).neg();
const GT = (a, b) => b.sub(a).neg();
/** Un □ dans une chaîne : résolu par linéarité (f(0), f(1)), puis REVÉRIFIÉ par substitution. */
const MISS = (tmpl, target) => {
  const f = (x) => E(tmpl.replace('_', D(x)), false);
  const f0 = f(new Q(0n)), f1 = f(new Q(1n));
  const x = dq(target).sub(f0).div(f1.sub(f0));
  if (!f(x).eq(dq(target))) throw new Error(`□ : ${tmpl} = ${target} n'a pas de solution décimale`);
  if (x.neg()) throw new Error('□ négatif');
  return A(x);
};
const pairAt = (t, i) => `${t[2 * i]} ${t[2 * i + 1]} ${t[2 * i + 2]}`;
const FIRSTOP = (chain, opts) => {
  const { t, ops } = tokens(chain);
  return letter(opts.map((o) => o === pairAt(t, firstIndex(ops))), `première opération de ${chain}`);
};
const fillOps = (tmpl, ops) => { let c = tmpl; for (const o of ops) c = c.replace('?', o); return c; };
const MISSOP = (tmpl, target, optsOps) => letter(optsOps.map((ops) => E(fillOps(tmpl, ops), false).eq(dq(target))), `couple d'opérations ${tmpl}`);

/* ── Les clés ────────────────────────────────────────────────────────── */
// Chaque entrée : [type, réf., id MISC, lecture, expression] — relues par audit().
const SIGS = {
  'ex-2am-silsila-bidun-aqwas-l1-001:q2': [["sig", "61", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "18 + 6 * 3 - 11"]],
  'ex-2am-silsila-bidun-aqwas-l1-001:q3': [["sig", "28", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "80 - 36 / 4 * 5 + 7"], ["sig", "85.2", "MISC-SILSILA-MULFIRST", "MULFIRST", "80 - 36 / 4 * 5 + 7"], ["sig", "62", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "80 - 36 / 4 * 5 + 7"], ["sig", "79.25", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "80 - 36 / 4 * 5 + 7"]],
  'ex-2am-silsila-bidun-aqwas-l1-002:q1': [["sig", "4", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "3 * 8 + 54 / 6 - 9"]],
  'ex-2am-silsila-bidun-aqwas-l1-002:q2': [["sig", "6.2", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "2.4 * 5 + 6.6 / 3"], ["sig", "17.28", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "2.4 * 5 + 6.6 / 3"]],
  'ex-2am-silsila-bidun-aqwas-l1-002:q3': [["sig", "20", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "45 - 3 * 7 + 36 / 9"], ["sig", "12", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "45 - 3 * 7 + 36 / 9"]],
  'ex-2am-silsila-bidun-aqwas-l1-003:q1': [["sig", "5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "15 * 6 + 14 - 84 / 4"]],
  'ex-2am-silsila-bidun-aqwas-l1-003:q2': [["sig", "11", "MISC-SILSILA-MULFIRST", "MULFIRST", "56 / 7 * 4 + 9"]],
  'ex-2am-silsila-bidun-aqwas-l1-003:q3': [["sig", "732", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "100 - 7 * 8 - 12"], ["sig", "128", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "100 - 7 * 8 - 12"]],
  'ex-2am-silsila-bidun-aqwas-l1-004:q1': [["sig", "4", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "47 - 18 + 25"]],
  'ex-2am-silsila-bidun-aqwas-l1-004:q2': [["sig", "75", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "63 - 15 - 27"]],
  'ex-2am-silsila-bidun-aqwas-l1-004:q3': [["sig", "22", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "38 + 17 - 9 + 24"]],
  'ex-2am-silsila-bidun-aqwas-l1-005:q1': [["sig", "2.4", "MISC-SILSILA-MULFIRST", "MULFIRST", "96 / 8 * 5"]],
  'ex-2am-silsila-bidun-aqwas-l1-005:q3': [["sig", "125", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "150 / 6 / 5"]],
  'ex-2am-silsila-bidun-aqwas-l1-006:q1': [["sig", "100", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "18 + 7 * 4"], ["sig", "28", "MISC-SILSILA-PARTIAL", "PARTIAL", "18 + 7 * 4"]],
  'ex-2am-silsila-bidun-aqwas-l1-006:q2': [["sig", "220", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "50 - 6 * 5"], ["sig", "30", "MISC-SILSILA-PARTIAL", "PARTIAL", "50 - 6 * 5"]],
  'ex-2am-silsila-bidun-aqwas-l1-006:q3': [["sig", "3", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "45 / 9 + 6"], ["sig", "5", "MISC-SILSILA-PARTIAL", "PARTIAL", "45 / 9 + 6"]],
  'ex-2am-silsila-bidun-aqwas-l1-007:q1': [["sig", "1.625", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "4.5 + 3 * 2.5 - 9 / 6"], ["sig", "7.5", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "4.5 + 3 * 2.5 - 9 / 6"]],
  'ex-2am-silsila-bidun-aqwas-l1-007:q2': [["sig", "1", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "12.5 - 4 * 2 + 3.5"], ["sig", "20.5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "12.5 - 4 * 2 + 3.5"]],
  'ex-2am-silsila-bidun-aqwas-l1-007:q3': [["sig", "2.75", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "6 * 0.5 + 8 / 4"], ["sig", "15", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "6 * 0.5 + 8 / 4"]],
  'ex-2am-silsila-bidun-aqwas-l1-008:q2': [["sig", "10", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "20 - 6.5 + 3.5"]],
  'ex-2am-silsila-bidun-aqwas-l1-008:q3': [["sig", "12", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "9.8 - 2.3 - 4.5"]],
  'ex-2am-silsila-bidun-aqwas-l1-009:q2': [["sig", "48", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "84 / 7 / 4"]],
  'ex-2am-silsila-bidun-aqwas-l1-010:q1': [["sig", "1", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "42 - 5 * 6 + 11"], ["sig", "233", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "42 - 5 * 6 + 11"]],
  'ex-2am-silsila-bidun-aqwas-l1-010:q2': [["sig", "5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "8 * 7 - 36 / 4"]],
  'ex-2am-silsila-bidun-aqwas-l1-010:q3': [["sig", "22", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "30 / 5 + 4 * 3 - 8"]],
  'ex-2am-silsila-bidun-aqwas-l2-001:q1': [["opt", "B", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "5 + 4 * 7"]],
  'ex-2am-silsila-bidun-aqwas-l2-001:q3': [["sig", "10.5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "9 * 3 - 6 / 2"], ["sig", "0", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "9 * 3 - 6 / 2"]],
  'ex-2am-silsila-bidun-aqwas-l2-002:q1': [["sig", "2", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "6 * 7 + 9 / 3 - 15"], ["sig", "37.5", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "6 * 7 + 9 / 3 - 15"]],
  'ex-2am-silsila-bidun-aqwas-l2-002:q3': [["opt", "A", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "6 * 7 + 9 / 3 - 15"]],
  'ex-2am-silsila-bidun-aqwas-l2-003:q1': [["opt", "B", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "60 - 17 + 9"]],
  'ex-2am-silsila-bidun-aqwas-l2-003:q3': [["sig", "22", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "75 - 28 + 16 - 9"], ["sig", "40", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "75 - 28 + 16 - 9"]],
  'ex-2am-silsila-bidun-aqwas-l2-004:q1': [["firstop", "B", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "7 + 24 / 6 * 3|7 + 24"], ["firstop", "C", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "7 + 24 / 6 * 3|6 * 3"]],
  'ex-2am-silsila-bidun-aqwas-l2-004:q2': [["sig", "15.5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "7 + 24 / 6 * 3"]],
  'ex-2am-silsila-bidun-aqwas-l2-005:q1': [["opt", "B", "MISC-SILSILA-MULFIRST", "MULFIRST", "120 / 4 * 5"]],
  'ex-2am-silsila-bidun-aqwas-l2-005:q2': [["sig", "5", "MISC-SILSILA-MULFIRST", "MULFIRST", "90 / 6 * 3"]],
  'ex-2am-silsila-bidun-aqwas-l2-006:q1': [["sig", "8.1", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "2.4 + 3 * 1.5"]],
  'ex-2am-silsila-bidun-aqwas-l2-006:q2': [["opt", "A", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "5.4 - 1.2 * 3"]],
  'ex-2am-silsila-bidun-aqwas-l2-007:q1': [["opt", "B", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "100 - 30 - 20 + 10"], ["opt", "C", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "100 - 30 - 20 + 10"]],
  'ex-2am-silsila-bidun-aqwas-l2-008:q1': [["sig", "50", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "7 + 3 * 5"]],
  'ex-2am-silsila-bidun-aqwas-l2-008:q2': [["sig", "20", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "40 - 12 + 8"]],
  'ex-2am-silsila-bidun-aqwas-l2-008:q3': [["sig", "23", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "6 + 4 * 2 + 3"], ["sig", "26", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "6 + 4 * 2 + 3"]],
  'ex-2am-silsila-bidun-aqwas-l2-008:q4': [["opt", "A", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "40 - 12 + 8"]],
  'ex-2am-silsila-bidun-aqwas-l2-009:q1': [["sig", "29", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "56 - 19 + 8"]],
  'ex-2am-silsila-bidun-aqwas-l2-009:q2': [["sig", "4", "MISC-SILSILA-MULFIRST", "MULFIRST", "72 / 6 * 3"]],
  'ex-2am-silsila-bidun-aqwas-l2-009:q3': [["sig", "92", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "14 + 9 * 4"]],
  'ex-2am-silsila-bidun-aqwas-l2-009:q4': [["sig", "24", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "35 - 20 / 4 + 6"], ["sig", "9.75", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "35 - 20 / 4 + 6"], ["sig", "33", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "35 - 20 / 4 + 6"]],
  'ex-2am-silsila-bidun-aqwas-l2-009:q5': [["sig", "7", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "3 * 8 - 15 + 12 / 6"], ["sig", "3.5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "3 * 8 - 15 + 12 / 6"]],
  'ex-2am-silsila-bidun-aqwas-l2-009:q6': [["sig", "3.75", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "9 + 36 / 4 / 3"], ["sig", "36", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "9 + 36 / 4 / 3"]],
  'ex-2am-silsila-bidun-aqwas-l2-010:q1': [["opwrong", "A", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "8 ? 3 ? 4|-,*|20"]],
  'ex-2am-silsila-bidun-aqwas-l3-001:q1': [["sig", "138", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "8 * 12 + 9 - 36 / 0.5"]],
  'ex-2am-silsila-bidun-aqwas-l3-001:q2': [["sig", "77.5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "2.5 * 6 + 0.8 * 5 - 1.5"], ["sig", "22", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "2.5 * 6 + 0.8 * 5 - 1.5"]],
  'ex-2am-silsila-bidun-aqwas-l3-001:q3': [["sig", "6.75", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "12 - 0.6 * 5 + 9 / 4"], ["sig", "16.5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "12 - 0.6 * 5 + 9 / 4"], ["sig", "7.65", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "12 - 0.6 * 5 + 9 / 4"]],
  'ex-2am-silsila-bidun-aqwas-l3-002:q1': [["sig", "12", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "24 + 3 * 0.5 - 18 / 4"]],
  'ex-2am-silsila-bidun-aqwas-l3-002:q2': [["sig", "28.8", "MISC-SILSILA-MULFIRST", "MULFIRST", "7.5 * 4 - 12 / 5 * 2"], ["sig", "7.2", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "7.5 * 4 - 12 / 5 * 2"], ["sig", "21", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "7.5 * 4 - 12 / 5 * 2"]],
  'ex-2am-silsila-bidun-aqwas-l3-002:q3': [["sig", "8.5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "1.2 + 0.8 * 6 - 3.5"], ["sig", "3.2", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "1.2 + 0.8 * 6 - 3.5"]],
  'ex-2am-silsila-bidun-aqwas-l3-003:q1': [["sig", "1175.625", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "250 + 4 * 37.5 - 120 / 8"], ["sig", "340", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "250 + 4 * 37.5 - 120 / 8"]],
  'ex-2am-silsila-bidun-aqwas-l3-003:q2': [["sig", "4085", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "3 * 45 + 2 * 30 - 25"], ["sig", "165", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "3 * 45 + 2 * 30 - 25"]],
  'ex-2am-silsila-bidun-aqwas-l3-003:q3': [["sig", "470", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "500 - 2 * 120 - 3 * 35"]],
  'ex-2am-silsila-bidun-aqwas-l3-003:q4': [["sig", "24900", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "1000 - 4 * 125 / 5"]],
  'ex-2am-silsila-bidun-aqwas-l3-005:q1': [["opt", "B", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "7 * 6 - 4 * 5"]],
  'ex-2am-silsila-bidun-aqwas-l3-005:q2': [["opt", "A", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "60 / 5 + 3 * 4"]],
  'ex-2am-silsila-bidun-aqwas-l3-005:q3': [["opt", "A", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "18 - 12 / 4 * 2"], ["opt", "C", "MISC-SILSILA-MULFIRST", "MULFIRST", "18 - 12 / 4 * 2"]],
  'ex-2am-silsila-bidun-aqwas-l3-006:q1': [["sig", "3.2", "MISC-SILSILA-MULFIRST", "MULFIRST", "4.8 / 0.6 * 2.5"]],
  'ex-2am-silsila-bidun-aqwas-l3-006:q3': [["sig", "1.5", "MISC-SILSILA-MULFIRST", "MULFIRST", "0.75 * 16 / 4 * 2"]],
  'ex-2am-silsila-bidun-aqwas-l3-006:q4': [["sig", "2.4", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "9 / 1.5 / 0.4"]],
  'ex-2am-silsila-bidun-aqwas-l3-007:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "1000 - 2 * 420 + 95"], ["opt", "B", "MISC-SILSILA-STORYORDER", "STD", "1000 - 420 - 2 * 95"]],
  'ex-2am-silsila-bidun-aqwas-l3-008:q1': [["sig", "26", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "9 + 6 * 4 - 15 / 3 + 2"], ["sig", "17", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "9 + 6 * 4 - 15 / 3 + 2"], ["sig", "15", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "9 + 6 * 4 - 15 / 3 + 2"]],
  'ex-2am-silsila-bidun-aqwas-l3-008:q2': [["sig", "57", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "48 / 6 * 2 - 3 * 4 + 5"]],
  'ex-2am-silsila-bidun-aqwas-l3-008:q3': [["sig", "20", "MISC-SILSILA-ADDFIRST", "ADDFIRST", "100 - 8 * 7 + 36 / 9 - 20"]],
  'ex-2am-silsila-bidun-aqwas-l3-008:q4': [["sig", "61", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "2.5 * 4 + 1.5 * 6 - 8"], ["sig", "2.5", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "2.5 * 4 + 1.5 * 6 - 8"]],
  'ex-2am-silsila-bidun-aqwas-l3-010:q1': [["sig", "3", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "0.2 * 15 + 3 * 0.5"], ["sig", "3.3", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "0.2 * 15 + 3 * 0.5"]],
  'ex-2am-silsila-bidun-aqwas-l3-010:q2': [["sig", "45", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "8 - 0.5 * 6"]],
  'ex-2am-silsila-bidun-aqwas-l3-010:q4': [["sig", "1.7", "MISC-SILSILA-RIGHTLEFT", "RIGHTLEFT", "0.25 * 8 - 1.2"]],
  'ex-2am-silsila-bidun-aqwas-l4-001:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "240 - 85 + 64"], ["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "240 + 85 + 64"]],
  'ex-2am-silsila-bidun-aqwas-l4-001:q3': [["opt", "A", "MISC-SILSILA-STORYORDER", "STD", "3 * 240 - 85 - 64 - 25"], ["opt", "C", "MISC-SILSILA-STORYSIGN", "STD", "240 - 85 - 64 + 3 * 25"]],
  'ex-2am-silsila-bidun-aqwas-l4-002:q1': [["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "9000 - 3900 + 1250"], ["opt", "C", "MISC-SILSILA-STORYSIGN", "STD", "9000 + 3900 + 1250"]],
  'ex-2am-silsila-bidun-aqwas-l4-002:q3': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "9000 - 3900 - 1250 + 4 * 350"], ["opt", "B", "MISC-SILSILA-STORYORDER", "STD", "4 * 9000 - 3900 - 1250 - 350"]],
  'ex-2am-silsila-bidun-aqwas-l4-003:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "180 + 65 + 48"], ["opt", "C", "MISC-SILSILA-STORYSIGN", "STD", "180 - 65 + 48"]],
  'ex-2am-silsila-bidun-aqwas-l4-003:q3': [["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "180 - 65 - 48 + 4 * 7.5"], ["opt", "C", "MISC-SILSILA-STORYORDER", "STD", "4 * 180 - 65 - 48 - 7.5"]],
  'ex-2am-silsila-bidun-aqwas-l4-003:q4': [["sig", "472.5", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "180 - 65 - 48 - 4 * 7.5"]],
  'ex-2am-silsila-bidun-aqwas-l4-004:q1': [["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "1200 - 6 * 85"], ["opt", "C", "MISC-SILSILA-STORYORDER", "STD", "6 * 1200 + 85"]],
  'ex-2am-silsila-bidun-aqwas-l4-004:q3': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "1200 + 6 * 85 + 150"], ["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "1200 - 6 * 85 - 150"]],
  'ex-2am-silsila-bidun-aqwas-l4-005:q1': [["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "320 + 45 + 6 * 12 - 9"], ["opt", "C", "MISC-SILSILA-STORYSIGN", "STD", "320 - 45 - 6 * 12 - 9"], ["opt", "D", "MISC-SILSILA-STORYORDER", "STD", "320 - 45 + 12 * 9 - 6"]],
  'ex-2am-silsila-bidun-aqwas-l4-005:q2': [["sig", "3363", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "320 - 45 + 6 * 12 - 9"]],
  'ex-2am-silsila-bidun-aqwas-l4-006:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "850 + 3 * 120 + 400"], ["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "850 - 3 * 120 - 400"]],
  'ex-2am-silsila-bidun-aqwas-l4-007:q1': [["opt", "A", "MISC-SILSILA-STORYORDER", "STD", "2.5 * 2000 - 640 - 160"], ["opt", "C", "MISC-SILSILA-STORYSIGN", "STD", "2000 - 2.5 * 640 + 160"]],
  'ex-2am-silsila-bidun-aqwas-l4-008:q1': [["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "240 - 5 * 18 + 25"], ["opt", "C", "MISC-SILSILA-STORYORDER", "STD", "5 * 240 - 18 - 25"]],
  'ex-2am-silsila-bidun-aqwas-l4-008:q2': [["sig", "4205", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "240 - 5 * 18 - 25"]],
  'ex-2am-silsila-bidun-aqwas-l4-009:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "500 - 20 * 4.5 + 30"], ["opt", "B", "MISC-SILSILA-STORYORDER", "STD", "4.5 * 500 - 20 - 30"]],
  'ex-2am-silsila-bidun-aqwas-l4-009:q2': [["sig", "2130", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "500 - 20 * 4.5 - 30"]],
  'ex-2am-silsila-bidun-aqwas-l4-010:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "118 + 35 - 29"], ["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "118 - 35 + 29"]],
  'ex-2am-silsila-bidun-aqwas-l5-001:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "6500 + 38 * 150 - 4 * 200"], ["opt", "B", "MISC-SILSILA-STORYORDER", "STD", "6500 + 38 * 4 + 150 * 200"]],
  'ex-2am-silsila-bidun-aqwas-l5-002:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "140 - 3 * 24"], ["opt", "C", "MISC-SILSILA-STORYORDER", "STD", "3 * 140 + 24"]],
  'ex-2am-silsila-bidun-aqwas-l5-002:q2': [["sig", "3432", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "140 + 3 * 24"]],
  'ex-2am-silsila-bidun-aqwas-l5-003:q1': [["opt", "A", "MISC-SILSILA-STORYORDER", "STD", "3 * 85 + 18"], ["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "85 - 3 * 18"]],
  'ex-2am-silsila-bidun-aqwas-l5-003:q2': [["sig", "1584", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "85 + 3 * 18"]],
  'ex-2am-silsila-bidun-aqwas-l5-004:q1': [["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "12 * 650 - 12 * 350"], ["opt", "C", "MISC-SILSILA-STORYORDER", "STD", "12 * 12 + 650 * 350"]],
  'ex-2am-silsila-bidun-aqwas-l5-005:q1': [["opt", "A", "MISC-SILSILA-STORYORDER", "STD", "8 * 15 + 250 * 120 + 900"], ["opt", "C", "MISC-SILSILA-STORYSIGN", "STD", "8 * 250 + 15 * 120 - 900"]],
  'ex-2am-silsila-bidun-aqwas-l5-006:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "120 + 3 * 15"], ["opt", "B", "MISC-SILSILA-STORYORDER", "STD", "3 * 120 - 15"]],
  'ex-2am-silsila-bidun-aqwas-l5-006:q2': [["sig", "1755", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "120 - 3 * 15"]],
  'ex-2am-silsila-bidun-aqwas-l5-007:q1': [["opt", "B", "MISC-SILSILA-STORYSIGN", "STD", "40 - 3.5 + 4 * 6.25"], ["opt", "C", "MISC-SILSILA-STORYORDER", "STD", "4 * 40 - 3.5 - 6.25"]],
  'ex-2am-silsila-bidun-aqwas-l5-007:q2': [["sig", "203.125", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "40 - 3.5 - 4 * 6.25"]],
  'ex-2am-silsila-bidun-aqwas-l5-007:q3': [["sig", "49.375", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "3.5 + 4 * 6.25 + 2.5"]],
  'ex-2am-silsila-bidun-aqwas-l5-008:q1': [["opt", "A", "MISC-SILSILA-STORYORDER", "STD", "40 * 280 + 4.2"], ["opt", "C", "MISC-SILSILA-STORYSIGN", "STD", "280 - 40 * 4.2"]],
  'ex-2am-silsila-bidun-aqwas-l5-008:q2': [["sig", "1344", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "280 + 40 * 4.2"]],
  'ex-2am-silsila-bidun-aqwas-l5-008:q3': [["sig", "756", "MISC-SILSILA-NOPRIORITY", "NOPRIORITY", "500 - 280 - 40 * 4.2"]],
  'ex-2am-silsila-bidun-aqwas-l5-009:q1': [["opt", "A", "MISC-SILSILA-STORYSIGN", "STD", "2350 - 8 * 175"], ["opt", "B", "MISC-SILSILA-STORYORDER", "STD", "8 * 2350 + 175"]],
  'ex-2am-silsila-bidun-aqwas-l5-010:q1': [["opt", "A", "MISC-SILSILA-STORYORDER", "STD", "4800 + 5 * 2700"], ["opt", "C", "MISC-SILSILA-STORYSIGN", "STD", "5 * 4800 - 2700"]],
};

export const ORACLE = {
  // ex-2am-silsila-bidun-aqwas-l1-001
  'ex-2am-silsila-bidun-aqwas-l1-001:q1': A(E('24 * 5 / 8 - 9')),
  'ex-2am-silsila-bidun-aqwas-l1-001:q2': A(E('18 + 6 * 3 - 11')),
  'ex-2am-silsila-bidun-aqwas-l1-001:q3': A(E('80 - 36 / 4 * 5 + 7')),
  // ex-2am-silsila-bidun-aqwas-l1-002
  'ex-2am-silsila-bidun-aqwas-l1-002:q1': A(E('3 * 8 + 54 / 6 - 9')),
  'ex-2am-silsila-bidun-aqwas-l1-002:q2': A(E('2.4 * 5 + 6.6 / 3')),
  'ex-2am-silsila-bidun-aqwas-l1-002:q3': A(E('45 - 3 * 7 + 36 / 9')),
  // ex-2am-silsila-bidun-aqwas-l1-003
  'ex-2am-silsila-bidun-aqwas-l1-003:q1': A(E('15 * 6 + 14 - 84 / 4')),
  'ex-2am-silsila-bidun-aqwas-l1-003:q2': A(E('56 / 7 * 4 + 9')),
  'ex-2am-silsila-bidun-aqwas-l1-003:q3': A(E('100 - 7 * 8 - 12')),
  // ex-2am-silsila-bidun-aqwas-l1-004
  'ex-2am-silsila-bidun-aqwas-l1-004:q1': A(E('47 - 18 + 25')),
  'ex-2am-silsila-bidun-aqwas-l1-004:q2': A(E('63 - 15 - 27')),
  'ex-2am-silsila-bidun-aqwas-l1-004:q3': A(E('38 + 17 - 9 + 24')),
  // ex-2am-silsila-bidun-aqwas-l1-005
  'ex-2am-silsila-bidun-aqwas-l1-005:q1': A(E('96 / 8 * 5')),
  'ex-2am-silsila-bidun-aqwas-l1-005:q2': A(E('7 * 12 / 4')),
  'ex-2am-silsila-bidun-aqwas-l1-005:q3': A(E('150 / 6 / 5')),
  'ex-2am-silsila-bidun-aqwas-l1-005:q4': A(E('0.5 * 18 / 3')),
  // ex-2am-silsila-bidun-aqwas-l1-006
  'ex-2am-silsila-bidun-aqwas-l1-006:q1': A(E('18 + 7 * 4')),
  'ex-2am-silsila-bidun-aqwas-l1-006:q2': A(E('50 - 6 * 5')),
  'ex-2am-silsila-bidun-aqwas-l1-006:q3': A(E('45 / 9 + 6')),
  // ex-2am-silsila-bidun-aqwas-l1-007
  'ex-2am-silsila-bidun-aqwas-l1-007:q1': A(E('4.5 + 3 * 2.5 - 9 / 6')),
  'ex-2am-silsila-bidun-aqwas-l1-007:q2': A(E('12.5 - 4 * 2 + 3.5')),
  'ex-2am-silsila-bidun-aqwas-l1-007:q3': A(E('6 * 0.5 + 8 / 4')),
  // ex-2am-silsila-bidun-aqwas-l1-008
  'ex-2am-silsila-bidun-aqwas-l1-008:q1': A(E('12.5 + 7.5 - 4.2')),
  'ex-2am-silsila-bidun-aqwas-l1-008:q2': A(E('20 - 6.5 + 3.5')),
  'ex-2am-silsila-bidun-aqwas-l1-008:q3': A(E('9.8 - 2.3 - 4.5')),
  // ex-2am-silsila-bidun-aqwas-l1-009
  'ex-2am-silsila-bidun-aqwas-l1-009:q1': A(E('18 * 5 / 3')),
  'ex-2am-silsila-bidun-aqwas-l1-009:q2': A(E('84 / 7 / 4')),
  'ex-2am-silsila-bidun-aqwas-l1-009:q3': A(E('2.5 * 12 / 5')),
  // ex-2am-silsila-bidun-aqwas-l1-010
  'ex-2am-silsila-bidun-aqwas-l1-010:q1': A(E('42 - 5 * 6 + 11')),
  'ex-2am-silsila-bidun-aqwas-l1-010:q2': A(E('8 * 7 - 36 / 4')),
  'ex-2am-silsila-bidun-aqwas-l1-010:q3': A(E('30 / 5 + 4 * 3 - 8')),
  // ex-2am-silsila-bidun-aqwas-l2-001
  'ex-2am-silsila-bidun-aqwas-l2-001:q1': PICKV('5 + 4 * 7', ['33', '63']),
  'ex-2am-silsila-bidun-aqwas-l2-001:q3': A(E('9 * 3 - 6 / 2')),
  // ex-2am-silsila-bidun-aqwas-l2-002
  'ex-2am-silsila-bidun-aqwas-l2-002:q1': A(E('6 * 7 + 9 / 3 - 15')),
  'ex-2am-silsila-bidun-aqwas-l2-002:q3': PICKV('6 * 7 + 9 / 3 - 15', ['2', '30']),
  // ex-2am-silsila-bidun-aqwas-l2-003
  'ex-2am-silsila-bidun-aqwas-l2-003:q1': PICKV('60 - 17 + 9', ['52', '34']),
  'ex-2am-silsila-bidun-aqwas-l2-003:q3': A(E('75 - 28 + 16 - 9')),
  // ex-2am-silsila-bidun-aqwas-l2-004
  'ex-2am-silsila-bidun-aqwas-l2-004:q1': FIRSTOP('7 + 24 / 6 * 3', ['24 / 6', '7 + 24', '6 * 3']),
  'ex-2am-silsila-bidun-aqwas-l2-004:q2': A(E('7 + 24 / 6 * 3')),
  // ex-2am-silsila-bidun-aqwas-l2-005
  'ex-2am-silsila-bidun-aqwas-l2-005:q1': PICKV('120 / 4 * 5', ['150', '6']),
  'ex-2am-silsila-bidun-aqwas-l2-005:q2': A(E('90 / 6 * 3')),
  // ex-2am-silsila-bidun-aqwas-l2-006
  'ex-2am-silsila-bidun-aqwas-l2-006:q1': A(E('2.4 + 3 * 1.5')),
  'ex-2am-silsila-bidun-aqwas-l2-006:q2': PICKV('5.4 - 1.2 * 3', ['12.6', '1.8']),
  // ex-2am-silsila-bidun-aqwas-l2-007
  'ex-2am-silsila-bidun-aqwas-l2-007:q1': PICKV('100 - 30 - 20 + 10', ['60', '40', '100']),
  // ex-2am-silsila-bidun-aqwas-l2-008
  'ex-2am-silsila-bidun-aqwas-l2-008:q1': A(E('7 + 3 * 5')),
  'ex-2am-silsila-bidun-aqwas-l2-008:q2': A(E('40 - 12 + 8')),
  'ex-2am-silsila-bidun-aqwas-l2-008:q3': A(E('6 + 4 * 2 + 3')),
  'ex-2am-silsila-bidun-aqwas-l2-008:q4': PICKV('40 - 12 + 8', ['20', '36']),
  // ex-2am-silsila-bidun-aqwas-l2-009
  'ex-2am-silsila-bidun-aqwas-l2-009:q1': A(E('56 - 19 + 8')),
  'ex-2am-silsila-bidun-aqwas-l2-009:q2': A(E('72 / 6 * 3')),
  'ex-2am-silsila-bidun-aqwas-l2-009:q3': A(E('14 + 9 * 4')),
  'ex-2am-silsila-bidun-aqwas-l2-009:q4': A(E('35 - 20 / 4 + 6')),
  'ex-2am-silsila-bidun-aqwas-l2-009:q5': A(E('3 * 8 - 15 + 12 / 6')),
  'ex-2am-silsila-bidun-aqwas-l2-009:q6': A(E('9 + 36 / 4 / 3')),
  // ex-2am-silsila-bidun-aqwas-l2-010
  'ex-2am-silsila-bidun-aqwas-l2-010:q1': MISSOP('8 ? 3 ? 4', '20', [["-", "*"], ["+", "*"]]),
  'ex-2am-silsila-bidun-aqwas-l2-010:q2': MISS('9 + 4 * _', '37'),
  'ex-2am-silsila-bidun-aqwas-l2-010:q3': MISS('50 - 4 * _', '26'),
  // ex-2am-silsila-bidun-aqwas-l3-001
  'ex-2am-silsila-bidun-aqwas-l3-001:q1': A(E('8 * 12 + 9 - 36 / 0.5')),
  'ex-2am-silsila-bidun-aqwas-l3-001:q2': A(E('2.5 * 6 + 0.8 * 5 - 1.5')),
  'ex-2am-silsila-bidun-aqwas-l3-001:q3': A(E('12 - 0.6 * 5 + 9 / 4')),
  'ex-2am-silsila-bidun-aqwas-l3-001:q4': MISS('27 - 3 * _', '12'),
  // ex-2am-silsila-bidun-aqwas-l3-002
  'ex-2am-silsila-bidun-aqwas-l3-002:q1': A(E('24 + 3 * 0.5 - 18 / 4')),
  'ex-2am-silsila-bidun-aqwas-l3-002:q2': A(E('7.5 * 4 - 12 / 5 * 2')),
  'ex-2am-silsila-bidun-aqwas-l3-002:q3': A(E('1.2 + 0.8 * 6 - 3.5')),
  'ex-2am-silsila-bidun-aqwas-l3-002:q4': MISS('6 * _ + 12 / 4', '21'),
  // ex-2am-silsila-bidun-aqwas-l3-003
  'ex-2am-silsila-bidun-aqwas-l3-003:q1': A(E('250 + 4 * 37.5 - 120 / 8')),
  'ex-2am-silsila-bidun-aqwas-l3-003:q2': A(E('3 * 45 + 2 * 30 - 25')),
  'ex-2am-silsila-bidun-aqwas-l3-003:q3': A(E('500 - 2 * 120 - 3 * 35')),
  'ex-2am-silsila-bidun-aqwas-l3-003:q4': A(E('1000 - 4 * 125 / 5')),
  // ex-2am-silsila-bidun-aqwas-l3-004
  'ex-2am-silsila-bidun-aqwas-l3-004:q1': MISS('14 + _ * 6', '56'),
  'ex-2am-silsila-bidun-aqwas-l3-004:q2': MISS('80 - 9 * _', '26'),
  'ex-2am-silsila-bidun-aqwas-l3-004:q3': MISS('_ / 4 + 5', '17'),
  'ex-2am-silsila-bidun-aqwas-l3-004:q4': MISS('3 * _ - 4 * 2', '16'),
  // ex-2am-silsila-bidun-aqwas-l3-005
  'ex-2am-silsila-bidun-aqwas-l3-005:q1': PICKV('7 * 6 - 4 * 5', ['22', '190']),
  'ex-2am-silsila-bidun-aqwas-l3-005:q2': PICKV('60 / 5 + 3 * 4', ['60', '24']),
  'ex-2am-silsila-bidun-aqwas-l3-005:q3': PICKV('18 - 12 / 4 * 2', ['3', '12', '16.5']),
  // ex-2am-silsila-bidun-aqwas-l3-006
  'ex-2am-silsila-bidun-aqwas-l3-006:q1': A(E('4.8 / 0.6 * 2.5')),
  'ex-2am-silsila-bidun-aqwas-l3-006:q2': A(E('7.2 * 0.5 / 0.9')),
  'ex-2am-silsila-bidun-aqwas-l3-006:q3': A(E('0.75 * 16 / 4 * 2')),
  'ex-2am-silsila-bidun-aqwas-l3-006:q4': A(E('9 / 1.5 / 0.4')),
  // ex-2am-silsila-bidun-aqwas-l3-007
  'ex-2am-silsila-bidun-aqwas-l3-007:q1': PICKCHAIN(['-', ['-', '1000', ['*', '2', '420']], '95'], ['1000 - 2 * 420 + 95', '1000 - 420 - 2 * 95', '1000 - 2 * 420 - 95']),
  'ex-2am-silsila-bidun-aqwas-l3-007:q2': A(STORY(['-', ['-', '1000', ['*', '2', '420']], '95'], '1000 - 2 * 420 - 95')),
  'ex-2am-silsila-bidun-aqwas-l3-007:q3': YN(GE(TREE(['-', ['-', '1000', ['*', '2', '420']], '95']), dq('70'))),
  // ex-2am-silsila-bidun-aqwas-l3-008
  'ex-2am-silsila-bidun-aqwas-l3-008:q1': A(E('9 + 6 * 4 - 15 / 3 + 2')),
  'ex-2am-silsila-bidun-aqwas-l3-008:q2': A(E('48 / 6 * 2 - 3 * 4 + 5')),
  'ex-2am-silsila-bidun-aqwas-l3-008:q3': A(E('100 - 8 * 7 + 36 / 9 - 20')),
  'ex-2am-silsila-bidun-aqwas-l3-008:q4': A(E('2.5 * 4 + 1.5 * 6 - 8')),
  // ex-2am-silsila-bidun-aqwas-l3-009
  'ex-2am-silsila-bidun-aqwas-l3-009:q1': MISS('_ + 3 * 7', '40'),
  'ex-2am-silsila-bidun-aqwas-l3-009:q2': MISS('4 * _ - 6', '18'),
  'ex-2am-silsila-bidun-aqwas-l3-009:q3': MISS('45 - 2 * _ + 3', '40'),
  'ex-2am-silsila-bidun-aqwas-l3-009:q4': MISS('_ / 3 + 2 * 5', '17'),
  // ex-2am-silsila-bidun-aqwas-l3-010
  'ex-2am-silsila-bidun-aqwas-l3-010:q1': A(E('0.2 * 15 + 3 * 0.5')),
  'ex-2am-silsila-bidun-aqwas-l3-010:q2': A(E('8 - 0.5 * 6')),
  'ex-2am-silsila-bidun-aqwas-l3-010:q3': A(E('2.4 / 0.2 + 1.5')),
  'ex-2am-silsila-bidun-aqwas-l3-010:q4': A(E('0.25 * 8 - 1.2')),
  // ex-2am-silsila-bidun-aqwas-l4-001
  'ex-2am-silsila-bidun-aqwas-l4-001:q1': PICKCHAIN(['-', ['-', '240', '85'], '64'], ['240 - 85 + 64', '240 + 85 + 64', '240 - 85 - 64']),
  'ex-2am-silsila-bidun-aqwas-l4-001:q2': A(STORY(['-', ['-', '240', '85'], '64'], '240 - 85 - 64')),
  'ex-2am-silsila-bidun-aqwas-l4-001:q3': PICKCHAIN(['-', ['-', ['-', '240', '85'], '64'], ['*', '3', '25']], ['3 * 240 - 85 - 64 - 25', '240 - 85 - 64 - 3 * 25', '240 - 85 - 64 + 3 * 25']),
  'ex-2am-silsila-bidun-aqwas-l4-001:q4': A(STORY(['-', ['-', ['-', '240', '85'], '64'], ['*', '3', '25']], '240 - 85 - 64 - 3 * 25')),
  'ex-2am-silsila-bidun-aqwas-l4-001:q5': YN(GE(TREE(['-', ['-', ['-', '240', '85'], '64'], ['*', '3', '25']]), dq('25'))),
  // ex-2am-silsila-bidun-aqwas-l4-002
  'ex-2am-silsila-bidun-aqwas-l4-002:q1': PICKCHAIN(['-', ['-', '9000', '3900'], '1250'], ['9000 - 3900 - 1250', '9000 - 3900 + 1250', '9000 + 3900 + 1250']),
  'ex-2am-silsila-bidun-aqwas-l4-002:q2': A(STORY(['-', ['-', '9000', '3900'], '1250'], '9000 - 3900 - 1250')),
  'ex-2am-silsila-bidun-aqwas-l4-002:q3': PICKCHAIN(['-', ['-', ['-', '9000', '3900'], '1250'], ['*', '4', '350']], ['9000 - 3900 - 1250 + 4 * 350', '4 * 9000 - 3900 - 1250 - 350', '9000 - 3900 - 1250 - 4 * 350']),
  'ex-2am-silsila-bidun-aqwas-l4-002:q4': A(STORY(['-', ['-', ['-', '9000', '3900'], '1250'], ['*', '4', '350']], '9000 - 3900 - 1250 - 4 * 350')),
  'ex-2am-silsila-bidun-aqwas-l4-002:q5': YN(GE(TREE(['-', ['-', ['-', '9000', '3900'], '1250'], ['*', '4', '350']]), dq('2600'))),
  // ex-2am-silsila-bidun-aqwas-l4-003
  'ex-2am-silsila-bidun-aqwas-l4-003:q1': PICKCHAIN(['-', ['-', '180', '65'], '48'], ['180 + 65 + 48', '180 - 65 - 48', '180 - 65 + 48']),
  'ex-2am-silsila-bidun-aqwas-l4-003:q2': A(STORY(['-', ['-', '180', '65'], '48'], '180 - 65 - 48')),
  'ex-2am-silsila-bidun-aqwas-l4-003:q3': PICKCHAIN(['-', ['-', ['-', '180', '65'], '48'], ['*', '4', '7.5']], ['180 - 65 - 48 - 4 * 7.5', '180 - 65 - 48 + 4 * 7.5', '4 * 180 - 65 - 48 - 7.5']),
  'ex-2am-silsila-bidun-aqwas-l4-003:q4': A(STORY(['-', ['-', ['-', '180', '65'], '48'], ['*', '4', '7.5']], '180 - 65 - 48 - 4 * 7.5')),
  'ex-2am-silsila-bidun-aqwas-l4-003:q5': YN(GT(TREE(['-', ['-', ['-', '180', '65'], '48'], ['*', '4', '7.5']]), dq('40'))),
  // ex-2am-silsila-bidun-aqwas-l4-004
  'ex-2am-silsila-bidun-aqwas-l4-004:q1': PICKCHAIN(['+', '1200', ['*', '6', '85']], ['1200 + 6 * 85', '1200 - 6 * 85', '6 * 1200 + 85']),
  'ex-2am-silsila-bidun-aqwas-l4-004:q2': A(STORY(['+', '1200', ['*', '6', '85']], '1200 + 6 * 85')),
  'ex-2am-silsila-bidun-aqwas-l4-004:q3': PICKCHAIN(['-', ['+', '1200', ['*', '6', '85']], '150'], ['1200 + 6 * 85 + 150', '1200 - 6 * 85 - 150', '1200 + 6 * 85 - 150']),
  'ex-2am-silsila-bidun-aqwas-l4-004:q4': A(STORY(['-', ['+', '1200', ['*', '6', '85']], '150'], '1200 + 6 * 85 - 150')),
  'ex-2am-silsila-bidun-aqwas-l4-004:q5': YN(GE(TREE(['-', ['+', '1200', ['*', '6', '85']], '150']), dq('1600'))),
  // ex-2am-silsila-bidun-aqwas-l4-005
  'ex-2am-silsila-bidun-aqwas-l4-005:q1': PICKCHAIN(['-', ['+', ['-', '320', '45'], ['*', '6', '12']], '9'], ['320 - 45 + 6 * 12 - 9', '320 + 45 + 6 * 12 - 9', '320 - 45 - 6 * 12 - 9', '320 - 45 + 12 * 9 - 6']),
  'ex-2am-silsila-bidun-aqwas-l4-005:q2': A(STORY(['-', ['+', ['-', '320', '45'], ['*', '6', '12']], '9'], '320 - 45 + 6 * 12 - 9')),
  'ex-2am-silsila-bidun-aqwas-l4-005:q3': A(STORY(['*', '6', '12'], '6 * 12')),
  'ex-2am-silsila-bidun-aqwas-l4-005:q4': YN(GT(TREE(['-', ['+', ['-', '320', '45'], ['*', '6', '12']], '9']), dq('330'))),
  // ex-2am-silsila-bidun-aqwas-l4-006
  'ex-2am-silsila-bidun-aqwas-l4-006:q1': PICKCHAIN(['+', ['-', '850', ['*', '3', '120']], '400'], ['850 + 3 * 120 + 400', '850 - 3 * 120 - 400', '850 - 3 * 120 + 400']),
  'ex-2am-silsila-bidun-aqwas-l4-006:q2': A(STORY(['+', ['-', '850', ['*', '3', '120']], '400'], '850 - 3 * 120 + 400')),
  'ex-2am-silsila-bidun-aqwas-l4-006:q3': A(STORY(['*', '3', '120'], '3 * 120')),
  'ex-2am-silsila-bidun-aqwas-l4-006:q4': YN(GT(TREE(['+', ['-', '850', ['*', '3', '120']], '400']), dq('900'))),
  // ex-2am-silsila-bidun-aqwas-l4-007
  'ex-2am-silsila-bidun-aqwas-l4-007:q1': PICKCHAIN(['-', ['-', '2000', ['*', '2.5', '640']], '160'], ['2.5 * 2000 - 640 - 160', '2000 - 2.5 * 640 - 160', '2000 - 2.5 * 640 + 160']),
  'ex-2am-silsila-bidun-aqwas-l4-007:q2': A(STORY(['-', ['-', '2000', ['*', '2.5', '640']], '160'], '2000 - 2.5 * 640 - 160')),
  'ex-2am-silsila-bidun-aqwas-l4-007:q3': A(STORY(['*', '2.5', '640'], '2.5 * 640')),
  'ex-2am-silsila-bidun-aqwas-l4-007:q4': YN(GT(TREE(['-', ['-', '2000', ['*', '2.5', '640']], '160']), dq('250'))),
  // ex-2am-silsila-bidun-aqwas-l4-008
  'ex-2am-silsila-bidun-aqwas-l4-008:q1': PICKCHAIN(['-', ['-', '240', ['*', '5', '18']], '25'], ['240 - 5 * 18 - 25', '240 - 5 * 18 + 25', '5 * 240 - 18 - 25']),
  'ex-2am-silsila-bidun-aqwas-l4-008:q2': A(STORY(['-', ['-', '240', ['*', '5', '18']], '25'], '240 - 5 * 18 - 25')),
  'ex-2am-silsila-bidun-aqwas-l4-008:q3': A(STORY(['*', '5', '18'], '5 * 18')),
  'ex-2am-silsila-bidun-aqwas-l4-008:q4': YN(GT(dq('130'), TREE(['-', ['-', '240', ['*', '5', '18']], '25']))),
  // ex-2am-silsila-bidun-aqwas-l4-009
  'ex-2am-silsila-bidun-aqwas-l4-009:q1': PICKCHAIN(['-', ['-', '500', ['*', '20', '4.5']], '30'], ['500 - 20 * 4.5 + 30', '4.5 * 500 - 20 - 30', '500 - 20 * 4.5 - 30']),
  'ex-2am-silsila-bidun-aqwas-l4-009:q2': A(STORY(['-', ['-', '500', ['*', '20', '4.5']], '30'], '500 - 20 * 4.5 - 30')),
  'ex-2am-silsila-bidun-aqwas-l4-009:q3': A(STORY(['*', '20', '4.5'], '20 * 4.5')),
  'ex-2am-silsila-bidun-aqwas-l4-009:q4': YN(GT(TREE(['-', ['-', '500', ['*', '20', '4.5']], '30']), dq('400'))),
  // ex-2am-silsila-bidun-aqwas-l4-010
  'ex-2am-silsila-bidun-aqwas-l4-010:q1': PICKCHAIN(['-', ['-', '118', '35'], '29'], ['118 + 35 - 29', '118 - 35 + 29', '118 - 35 - 29']),
  'ex-2am-silsila-bidun-aqwas-l4-010:q2': A(STORY(['-', ['-', '118', '35'], '29'], '118 - 35 - 29')),
  'ex-2am-silsila-bidun-aqwas-l4-010:q3': YN(GT(TREE(['-', ['-', '118', '35'], '29']), dq('35'))),
  // ex-2am-silsila-bidun-aqwas-l5-001
  'ex-2am-silsila-bidun-aqwas-l5-001:q1': PICKCHAIN(['+', ['+', '6500', ['*', '38', '150']], ['*', '4', '200']], ['6500 + 38 * 150 - 4 * 200', '6500 + 38 * 4 + 150 * 200', '6500 + 38 * 150 + 4 * 200']),
  'ex-2am-silsila-bidun-aqwas-l5-001:q2': A(STORY(['+', ['+', '6500', ['*', '38', '150']], ['*', '4', '200']], '6500 + 38 * 150 + 4 * 200')),
  'ex-2am-silsila-bidun-aqwas-l5-001:q3': A(STORY(['-', ['-', ['-', '14000', '6500'], ['*', '38', '150']], ['*', '4', '200']], '14000 - 6500 - 38 * 150 - 4 * 200')),
  'ex-2am-silsila-bidun-aqwas-l5-001:q4': YN(GE(TREE(['-', ['-', ['-', '14000', '6500'], ['*', '38', '150']], ['*', '4', '200']]), dq('960'))),
  // ex-2am-silsila-bidun-aqwas-l5-002
  'ex-2am-silsila-bidun-aqwas-l5-002:q1': PICKCHAIN(['+', '140', ['*', '3', '24']], ['140 - 3 * 24', '140 + 3 * 24', '3 * 140 + 24']),
  'ex-2am-silsila-bidun-aqwas-l5-002:q2': A(STORY(['+', '140', ['*', '3', '24']], '140 + 3 * 24')),
  'ex-2am-silsila-bidun-aqwas-l5-002:q3': A(STORY(['-', ['+', '140', ['*', '3', '24']], ['*', '5', '36']], '140 + 3 * 24 - 5 * 36')),
  'ex-2am-silsila-bidun-aqwas-l5-002:q4': YN(GE(TREE(['-', ['+', '140', ['*', '3', '24']], ['*', '5', '36']]), dq('35'))),
  // ex-2am-silsila-bidun-aqwas-l5-003
  'ex-2am-silsila-bidun-aqwas-l5-003:q1': PICKCHAIN(['+', '85', ['*', '3', '18']], ['3 * 85 + 18', '85 - 3 * 18', '85 + 3 * 18']),
  'ex-2am-silsila-bidun-aqwas-l5-003:q2': A(STORY(['+', '85', ['*', '3', '18']], '85 + 3 * 18')),
  'ex-2am-silsila-bidun-aqwas-l5-003:q3': A(STORY(['-', ['-', ['+', '85', ['*', '3', '18']], ['*', '4', '15']], '12'], '85 + 3 * 18 - 4 * 15 - 12')),
  'ex-2am-silsila-bidun-aqwas-l5-003:q4': YN(GT(TREE(['-', ['-', ['+', '85', ['*', '3', '18']], ['*', '4', '15']], '12']), dq('70'))),
  // ex-2am-silsila-bidun-aqwas-l5-004
  'ex-2am-silsila-bidun-aqwas-l5-004:q1': PICKCHAIN(['+', ['*', '12', '650'], ['*', '12', '350']], ['12 * 650 + 12 * 350', '12 * 650 - 12 * 350', '12 * 12 + 650 * 350']),
  'ex-2am-silsila-bidun-aqwas-l5-004:q2': A(STORY(['+', ['*', '12', '650'], ['*', '12', '350']], '12 * 650 + 12 * 350')),
  'ex-2am-silsila-bidun-aqwas-l5-004:q3': A(STORY(['-', ['-', '15000', ['*', '12', '650']], ['*', '12', '350']], '15000 - 12 * 650 - 12 * 350')),
  'ex-2am-silsila-bidun-aqwas-l5-004:q4': YN(GE(TREE(['-', ['-', '15000', ['*', '12', '650']], ['*', '12', '350']]), dq('2900'))),
  // ex-2am-silsila-bidun-aqwas-l5-005
  'ex-2am-silsila-bidun-aqwas-l5-005:q1': PICKCHAIN(['+', ['+', ['*', '8', '250'], ['*', '15', '120']], '900'], ['8 * 15 + 250 * 120 + 900', '8 * 250 + 15 * 120 + 900', '8 * 250 + 15 * 120 - 900']),
  'ex-2am-silsila-bidun-aqwas-l5-005:q2': A(STORY(['+', ['+', ['*', '8', '250'], ['*', '15', '120']], '900'], '8 * 250 + 15 * 120 + 900')),
  'ex-2am-silsila-bidun-aqwas-l5-005:q3': A(STORY(['-', ['-', ['-', '5000', ['*', '8', '250']], ['*', '15', '120']], '900'], '5000 - 8 * 250 - 15 * 120 - 900')),
  'ex-2am-silsila-bidun-aqwas-l5-005:q4': YN(GE(TREE(['-', ['-', ['-', '5000', ['*', '8', '250']], ['*', '15', '120']], '900']), dq('450'))),
  // ex-2am-silsila-bidun-aqwas-l5-006
  'ex-2am-silsila-bidun-aqwas-l5-006:q1': PICKCHAIN(['-', '120', ['*', '3', '15']], ['120 + 3 * 15', '3 * 120 - 15', '120 - 3 * 15']),
  'ex-2am-silsila-bidun-aqwas-l5-006:q2': A(STORY(['-', '120', ['*', '3', '15']], '120 - 3 * 15')),
  'ex-2am-silsila-bidun-aqwas-l5-006:q3': A(STORY(['+', ['-', '120', ['*', '3', '15']], ['*', '4', '10']], '120 - 3 * 15 + 4 * 10')),
  'ex-2am-silsila-bidun-aqwas-l5-006:q4': YN(GE(TREE(['+', ['-', '120', ['*', '3', '15']], ['*', '4', '10']]), dq('112'))),
  // ex-2am-silsila-bidun-aqwas-l5-007
  'ex-2am-silsila-bidun-aqwas-l5-007:q1': PICKCHAIN(['-', ['-', '40', '3.5'], ['*', '4', '6.25']], ['40 - 3.5 - 4 * 6.25', '40 - 3.5 + 4 * 6.25', '4 * 40 - 3.5 - 6.25']),
  'ex-2am-silsila-bidun-aqwas-l5-007:q2': A(STORY(['-', ['-', '40', '3.5'], ['*', '4', '6.25']], '40 - 3.5 - 4 * 6.25')),
  'ex-2am-silsila-bidun-aqwas-l5-007:q3': A(STORY(['+', ['+', '3.5', ['*', '4', '6.25']], '2.5'], '3.5 + 4 * 6.25 + 2.5')),
  'ex-2am-silsila-bidun-aqwas-l5-007:q4': YN(GT(TREE(['+', ['+', '3.5', ['*', '4', '6.25']], '2.5']), dq('12'))),
  // ex-2am-silsila-bidun-aqwas-l5-008
  'ex-2am-silsila-bidun-aqwas-l5-008:q1': PICKCHAIN(['+', '280', ['*', '40', '4.2']], ['40 * 280 + 4.2', '280 + 40 * 4.2', '280 - 40 * 4.2']),
  'ex-2am-silsila-bidun-aqwas-l5-008:q2': A(STORY(['+', '280', ['*', '40', '4.2']], '280 + 40 * 4.2')),
  'ex-2am-silsila-bidun-aqwas-l5-008:q3': A(STORY(['-', ['-', '500', '280'], ['*', '40', '4.2']], '500 - 280 - 40 * 4.2')),
  'ex-2am-silsila-bidun-aqwas-l5-008:q4': YN(GT(TREE(['-', ['-', '500', '280'], ['*', '40', '4.2']]), dq('50'))),
  // ex-2am-silsila-bidun-aqwas-l5-009
  'ex-2am-silsila-bidun-aqwas-l5-009:q1': PICKCHAIN(['+', '2350', ['*', '8', '175']], ['2350 - 8 * 175', '8 * 2350 + 175', '2350 + 8 * 175']),
  'ex-2am-silsila-bidun-aqwas-l5-009:q2': A(STORY(['+', '2350', ['*', '8', '175']], '2350 + 8 * 175')),
  'ex-2am-silsila-bidun-aqwas-l5-009:q3': A(STORY(['-', ['+', '2350', ['*', '8', '175']], '3200'], '2350 + 8 * 175 - 3200')),
  'ex-2am-silsila-bidun-aqwas-l5-009:q4': YN(GE(TREE(['-', ['+', '2350', ['*', '8', '175']], '3200']), dq('400'))),
  // ex-2am-silsila-bidun-aqwas-l5-010
  'ex-2am-silsila-bidun-aqwas-l5-010:q1': PICKCHAIN(['+', ['*', '5', '4800'], '2700'], ['4800 + 5 * 2700', '5 * 4800 + 2700', '5 * 4800 - 2700']),
  'ex-2am-silsila-bidun-aqwas-l5-010:q2': A(STORY(['+', ['*', '5', '4800'], '2700'], '5 * 4800 + 2700')),
  'ex-2am-silsila-bidun-aqwas-l5-010:q3': A(STORY(['-', ['-', '31500', ['*', '5', '4800']], '2700'], '31500 - 5 * 4800 - 2700')),
  'ex-2am-silsila-bidun-aqwas-l5-010:q4': YN(GT(dq('5000'), TREE(['-', ['-', '31500', ['*', '5', '4800']], '2700']))),
};

/* ── Audit : relecture du contenu ───────────────────────────────────── */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/2am/silsila-bidun-aqwas');
const FORBIDDEN = /[()[\]]|\\left|\\right|\\frac|\\dfrac|\\over|الكتاب|خنزير|قمار|نرد|ورق اللعب|خمر/;
const islands = (s) => [...String(s).matchAll(/\$([^$]+)\$/g)].map((x) => x[1]);
/** « 24 \times 5 \div 8 - 9 » → « 24 * 5 / 8 - 9 » (virgule décimale { , } rendue point). */
const toChain = (latex) => latex.replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\,|\\ /g, ' ')
  .replace(/([*/+-])/g, ' $1 ').replace(/\s+/g, ' ').trim();
const asChain = (isl) => { try { const c = toChain(isl.replace(/^\s*[A-Za-z]\s*=\s*/, '')); tokens(c); return c; } catch { return null; } };
const pairLatex = (pair) => { const [a, o, b] = pair.split(' '); const sym = { '*': '\\times', '/': '\\div', '+': '+', '-': '-' }[o]; return `${a.replace('.', '{,}')} ${sym} ${b.replace('.', '{,}')}`; };
const TERM_SOURCES = new Set(['2am-s1-87:1', '2am-s1-91:1', '2am-s1-77:1', '2am-s1-81:1', '2am-s1-84:1', '2am-s1-88:1', '2am-s1-79:2']);

/** Audit de la banque (appelé par practice-answer-oracle.test.mjs) : liste des problèmes (vide = conforme). */
export function audit(bank) {
  const problems = [];
  const KNOWN = /^MISC-SILSILA-(ADDFIRST|MULFIRST|NOPRIORITY|RIGHTLEFT|PARTIAL|STORYSIGN|STORYORDER)$/;
  for (const { key, q } of bank) {
    const texts = [q.statement, q.lead, q.answerFormat, ...(q.hints ?? []).map((h) => h.content), q.feedback?.correct, q.feedback?.incorrect,
      ...(q.solution?.lines ?? []), q.solution?.result, ...(q.choices ?? []).map((c) => c.content)];
    for (const t of texts) if (t && FORBIDDEN.test(t)) problems.push(`${key} : texte interdit (parenthèse, crochet, barre de fraction, mention du manuel…) dans « ${t} »`);
    if (q.answerType === 'selfCheck') continue;
    const sigs = SIGS[key] ?? [];
    if (q.answerType === 'rational') {
      const e = String(q.expectedAnswer);
      if (!/^\d+(\.\d+)?$/.test(e)) problems.push(`${key} : clé « ${e} » (décimal positif exact attendu, point décimal)`);
      if (/^احسب/.test(q.statement)) {
        const isl = islands(q.statement)[0];
        const chain = isl && asChain(isl);
        if (!chain) problems.push(`${key} : « احسب » sans chaîne lisible`);
        else { try { if (D(E(chain)) !== e) problems.push(`${key} : « ${chain} » vaut ${D(E(chain))}, la clé dit ${e}`); } catch (err) { problems.push(`${key} : ${err.message}`); } }
      }
      const bankSigs = (q.misconceptionSignatures ?? []).map((s) => `${D(dq(s.value))}|${s.id}`).sort();
      const wantSigs = sigs.filter((s) => s[0] === 'sig').map((s) => `${s[1]}|${s[2]}`).sort();
      if (JSON.stringify(bankSigs) !== JSON.stringify(wantSigs)) problems.push(`${key} : signatures ${bankSigs.join(' ; ')} ≠ attendues ${wantSigs.join(' ; ')}`);
      for (const s of q.misconceptionSignatures ?? []) {
        if (!KNOWN.test(s.id)) problems.push(`${key} : signature ${s.id} hors MISC-SILSILA-*`);
        if (dq(s.value).eq(dq(e))) problems.push(`${key} : la signature ${s.id} est la bonne réponse`);
      }
      for (const [kind, ref, , how, expr] of sigs) {
        if (kind !== 'sig') continue;
        if (how === 'MISSING') continue;
        const w = WRONG(how, expr);
        if (!w || D(w) !== ref) problems.push(`${key} : la lecture ${how} de « ${expr} » ne vaut pas ${ref}`);
      }
    } else if (q.answerType === 'choice') {
      const good = q.choices.filter((c) => c.isCorrect);
      if (good.length !== 1) problems.push(`${key} : ${good.length} bonnes options`);
      for (const c of q.choices.filter((x) => !x.isCorrect && q.counted !== false)) {
        if (!c.misconceptionId || !KNOWN.test(c.misconceptionId)) problems.push(`${key} : le distracteur ${c.id} ne porte pas de MISC-SILSILA-*`);
      }
      const m = META[key];
      if (!m) { problems.push(`${key} : QCM sans méta`); continue; }
      const byId = Object.fromEntries(q.choices.map((c, k) => [c.id, { c, k }]));
      if (m.t === 'chain_choice') {
        q.choices.forEach((c, k) => { const ch = asChain(islands(c.content)[0] ?? ''); if (ch !== m.chains[k]) problems.push(`${key} : l'option ${c.id} relue « ${ch} » ≠ « ${m.chains[k]} »`); });
      }
      if (m.t === 'value_choice') {
        q.choices.forEach((c, k) => {
          const i0 = islands(c.content)[0];
          const lit = i0 && /^[\d{},]+$/.test(i0) ? D(dq(i0.replace('{,}', '.'))) : null;
          if (!m.person && lit !== m.vals[k]) problems.push(`${key} : l'option ${c.id} relue « ${lit} » ≠ « ${m.vals[k]} »`);
          if (m.person && lit !== null && lit !== m.vals[k]) problems.push(`${key} : l'option ${c.id} relue « ${lit} » ≠ « ${m.vals[k]} »`);
          if ((m.vals[k] === D(E(m.chain))) !== c.isCorrect) problems.push(`${key} : l'option ${c.id} est ${c.isCorrect ? 'marquée juste' : 'marquée fausse'} à tort`);
        });
      }
      for (const [kind, ref, id, how, expr] of sigs) {
        const o = byId[ref];
        if (!o) { problems.push(`${key} : option ${ref} absente`); continue; }
        if (o.c.misconceptionId !== id) problems.push(`${key} : l'option ${ref} porte ${o.c.misconceptionId}, attendu ${id}`);
        if (kind === 'opt' && m.t === 'value_choice') {
          const w = WRONG(how, expr);
          if (!w || D(w) !== m.vals[o.k]) problems.push(`${key} : la lecture ${how} de « ${expr} » ne vaut pas ${m.vals[o.k]}`);
        }
        if (kind === 'opt' && m.t === 'chain_choice') {
          // la lecture fautive d'une situation : même nombres, une opération + / − changée (STORYSIGN) ; mêmes nombres dans un autre ordre (STORYORDER)
          const R0 = tokens(m.right), X = tokens(expr);
          const nums = (z) => z.t.filter((_, i) => i % 2 === 0).join(',');
          const sortedNums = (z) => z.t.filter((_, i) => i % 2 === 0).sort().join(',');
          if (id === 'MISC-SILSILA-STORYSIGN') {
            const diff = R0.ops.map((o, i) => (X.ops[i] !== o ? i : -1)).filter((i) => i >= 0);
            if (nums(R0) !== nums(X) || R0.ops.length !== X.ops.length || diff.length === 0 || !diff.every((i) => '+-'.includes(R0.ops[i]) && '+-'.includes(X.ops[i]))) problems.push(`${key} : « ${expr} » n'est pas une erreur de signe de « ${m.right} »`);
          } else if (id === 'MISC-SILSILA-STORYORDER') {
            if (sortedNums(R0) !== sortedNums(X) || nums(R0) === nums(X)) problems.push(`${key} : « ${expr} » n'est pas « ${m.right} » avec les nombres dans un autre ordre`);
          } else problems.push(`${key} : une option-chaîne porte ${id} (STORYSIGN ou STORYORDER attendus)`);
        }
        if (kind === 'firstop') {
          const [chain, pair] = expr.split('|');
          const { t, ops } = tokens(chain);
          const idx = ops.findIndex((_, i) => pairAt(t, i) === pair);
          const first = firstIndex(ops);
          const rule = { NOPRIORITY: idx === 0, RIGHTLEFT: idx === ops.length - 1, ADDFIRST: ops[idx] === '+', MULFIRST: ops[idx] === '*' }[how];
          if (idx < 0 || idx === first || !rule) problems.push(`${key} : l'option « ${pair} » n'est pas la lecture ${how} de ${chain}`);
          if (o.c.content !== `$${pairLatex(pair)}$`) problems.push(`${key} : le contenu de l'option ${ref} ≠ « ${pair} »`);
        }
        if (kind === 'opwrong') {
          const [tmpl, ops, target] = expr.split('|');
          const filled = fillOps(tmpl, ops.split(','));
          const w = WRONG(how, filled);
          if (!w || D(w) !== target || D(E(filled, false)) === target) problems.push(`${key} : le couple ${ops} n'est pas la lecture ${how} de « ${tmpl} »`);
        }
      }
    }
  }
  /* niveau fichier : 50 feuilles, provenance, énoncés sans parenthèse */
  let files = [];
  try { for (const lv of readdirSync(ROOT)) for (const f of readdirSync(join(ROOT, lv))) files.push(JSON.parse(readFileSync(join(ROOT, lv, f), 'utf8'))); } catch { /* banque absente */ }
  if (files.length !== 50) problems.push(`la banque compte ${files.length} feuilles au lieu de 50`);
  for (let lv = 1; lv <= 5; lv++) if (files.filter((x) => x.level === lv).length !== 10) problems.push(`niveau ${lv} : pas 10 feuilles`);
  for (const ex of files) {
    const all = [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content, ...(ex.statement.formulas ?? []), ...(ex.statement.table ? [...ex.statement.table.head, ...ex.statement.table.rows.flat()] : []),
      ...(ex.statement.figure ? [ex.statement.figure.ariaLabel, ex.statement.figure.caption, ...ex.statement.figure.parts.map((p) => p.label), ex.statement.figure.whole.label] : [])];
    for (const t of all) if (t && FORBIDDEN.test(t)) problems.push(`${ex.id} : texte interdit dans « ${String(t).slice(0, 60)} »`);
    const s = ex.metadata.source;
    if (s.type === 'term_exam' && !TERM_SOURCES.has(`${s.file}:${s.exercise}`)) problems.push(`${ex.id} : sujet ${s.file} ex ${s.exercise} non lu pour cette banque`);
    if (ex.metadata.exam.kind === 'official' || ex.metadata.exam.kind === 'excerpt') problems.push(`${ex.id} : jamais officiel en 2AM`);
    for (const q of ex.questions) {
      if (q.answerType === 'selfCheck') { if (q.counted !== undefined) problems.push(`${ex.id}:${q.id} : selfCheck marquée counted`); continue; }
    }
  }
  return problems;
}
const META = {
  'ex-2am-silsila-bidun-aqwas-l1-001:q1': {"t": "calc", "chain": "24 * 5 / 8 - 9"},
  'ex-2am-silsila-bidun-aqwas-l1-001:q2': {"t": "calc", "chain": "18 + 6 * 3 - 11"},
  'ex-2am-silsila-bidun-aqwas-l1-001:q3': {"t": "calc", "chain": "80 - 36 / 4 * 5 + 7"},
  'ex-2am-silsila-bidun-aqwas-l1-002:q1': {"t": "calc", "chain": "3 * 8 + 54 / 6 - 9"},
  'ex-2am-silsila-bidun-aqwas-l1-002:q2': {"t": "calc", "chain": "2.4 * 5 + 6.6 / 3"},
  'ex-2am-silsila-bidun-aqwas-l1-002:q3': {"t": "calc", "chain": "45 - 3 * 7 + 36 / 9"},
  'ex-2am-silsila-bidun-aqwas-l1-003:q1': {"t": "calc", "chain": "15 * 6 + 14 - 84 / 4"},
  'ex-2am-silsila-bidun-aqwas-l1-003:q2': {"t": "calc", "chain": "56 / 7 * 4 + 9"},
  'ex-2am-silsila-bidun-aqwas-l1-003:q3': {"t": "calc", "chain": "100 - 7 * 8 - 12"},
  'ex-2am-silsila-bidun-aqwas-l1-004:q1': {"t": "calc", "chain": "47 - 18 + 25"},
  'ex-2am-silsila-bidun-aqwas-l1-004:q2': {"t": "calc", "chain": "63 - 15 - 27"},
  'ex-2am-silsila-bidun-aqwas-l1-004:q3': {"t": "calc", "chain": "38 + 17 - 9 + 24"},
  'ex-2am-silsila-bidun-aqwas-l1-005:q1': {"t": "calc", "chain": "96 / 8 * 5"},
  'ex-2am-silsila-bidun-aqwas-l1-005:q2': {"t": "calc", "chain": "7 * 12 / 4"},
  'ex-2am-silsila-bidun-aqwas-l1-005:q3': {"t": "calc", "chain": "150 / 6 / 5"},
  'ex-2am-silsila-bidun-aqwas-l1-005:q4': {"t": "calc", "chain": "0.5 * 18 / 3"},
  'ex-2am-silsila-bidun-aqwas-l1-006:q1': {"t": "calc", "chain": "18 + 7 * 4"},
  'ex-2am-silsila-bidun-aqwas-l1-006:q2': {"t": "calc", "chain": "50 - 6 * 5"},
  'ex-2am-silsila-bidun-aqwas-l1-006:q3': {"t": "calc", "chain": "45 / 9 + 6"},
  'ex-2am-silsila-bidun-aqwas-l1-007:q1': {"t": "calc", "chain": "4.5 + 3 * 2.5 - 9 / 6"},
  'ex-2am-silsila-bidun-aqwas-l1-007:q2': {"t": "calc", "chain": "12.5 - 4 * 2 + 3.5"},
  'ex-2am-silsila-bidun-aqwas-l1-007:q3': {"t": "calc", "chain": "6 * 0.5 + 8 / 4"},
  'ex-2am-silsila-bidun-aqwas-l1-008:q1': {"t": "calc", "chain": "12.5 + 7.5 - 4.2"},
  'ex-2am-silsila-bidun-aqwas-l1-008:q2': {"t": "calc", "chain": "20 - 6.5 + 3.5"},
  'ex-2am-silsila-bidun-aqwas-l1-008:q3': {"t": "calc", "chain": "9.8 - 2.3 - 4.5"},
  'ex-2am-silsila-bidun-aqwas-l1-009:q1': {"t": "calc", "chain": "18 * 5 / 3"},
  'ex-2am-silsila-bidun-aqwas-l1-009:q2': {"t": "calc", "chain": "84 / 7 / 4"},
  'ex-2am-silsila-bidun-aqwas-l1-009:q3': {"t": "calc", "chain": "2.5 * 12 / 5"},
  'ex-2am-silsila-bidun-aqwas-l1-010:q1': {"t": "calc", "chain": "42 - 5 * 6 + 11"},
  'ex-2am-silsila-bidun-aqwas-l1-010:q2': {"t": "calc", "chain": "8 * 7 - 36 / 4"},
  'ex-2am-silsila-bidun-aqwas-l1-010:q3': {"t": "calc", "chain": "30 / 5 + 4 * 3 - 8"},
  'ex-2am-silsila-bidun-aqwas-l2-001:q1': {"t": "value_choice", "chain": "5 + 4 * 7", "vals": ["33", "63"], "person": true},
  'ex-2am-silsila-bidun-aqwas-l2-001:q2': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l2-001:q3': {"t": "calc", "chain": "9 * 3 - 6 / 2"},
  'ex-2am-silsila-bidun-aqwas-l2-002:q1': {"t": "calc", "chain": "6 * 7 + 9 / 3 - 15"},
  'ex-2am-silsila-bidun-aqwas-l2-002:q2': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l2-002:q3': {"t": "value_choice", "chain": "6 * 7 + 9 / 3 - 15", "vals": ["2", "30"], "person": true},
  'ex-2am-silsila-bidun-aqwas-l2-003:q1': {"t": "value_choice", "chain": "60 - 17 + 9", "vals": ["52", "34"], "person": true},
  'ex-2am-silsila-bidun-aqwas-l2-003:q2': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l2-003:q3': {"t": "calc", "chain": "75 - 28 + 16 - 9"},
  'ex-2am-silsila-bidun-aqwas-l2-004:q1': {"t": "first_op", "chain": "7 + 24 / 6 * 3", "pairs": ["24 / 6", "7 + 24", "6 * 3"]},
  'ex-2am-silsila-bidun-aqwas-l2-004:q2': {"t": "calc", "chain": "7 + 24 / 6 * 3"},
  'ex-2am-silsila-bidun-aqwas-l2-004:q3': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l2-005:q1': {"t": "value_choice", "chain": "120 / 4 * 5", "vals": ["150", "6"], "person": true},
  'ex-2am-silsila-bidun-aqwas-l2-005:q2': {"t": "calc", "chain": "90 / 6 * 3"},
  'ex-2am-silsila-bidun-aqwas-l2-005:q3': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l2-006:q1': {"t": "calc", "chain": "2.4 + 3 * 1.5"},
  'ex-2am-silsila-bidun-aqwas-l2-006:q2': {"t": "value_choice", "chain": "5.4 - 1.2 * 3", "vals": ["12.6", "1.8"]},
  'ex-2am-silsila-bidun-aqwas-l2-006:q3': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l2-007:q1': {"t": "value_choice", "chain": "100 - 30 - 20 + 10", "vals": ["60", "40", "100"], "person": true},
  'ex-2am-silsila-bidun-aqwas-l2-007:q2': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l2-008:q1': {"t": "calc", "chain": "7 + 3 * 5"},
  'ex-2am-silsila-bidun-aqwas-l2-008:q2': {"t": "calc", "chain": "40 - 12 + 8"},
  'ex-2am-silsila-bidun-aqwas-l2-008:q3': {"t": "calc", "chain": "6 + 4 * 2 + 3"},
  'ex-2am-silsila-bidun-aqwas-l2-008:q4': {"t": "value_choice", "chain": "40 - 12 + 8", "vals": ["20", "36"], "person": true},
  'ex-2am-silsila-bidun-aqwas-l2-009:q1': {"t": "calc", "chain": "56 - 19 + 8"},
  'ex-2am-silsila-bidun-aqwas-l2-009:q2': {"t": "calc", "chain": "72 / 6 * 3"},
  'ex-2am-silsila-bidun-aqwas-l2-009:q3': {"t": "calc", "chain": "14 + 9 * 4"},
  'ex-2am-silsila-bidun-aqwas-l2-009:q4': {"t": "calc", "chain": "35 - 20 / 4 + 6"},
  'ex-2am-silsila-bidun-aqwas-l2-009:q5': {"t": "calc", "chain": "3 * 8 - 15 + 12 / 6"},
  'ex-2am-silsila-bidun-aqwas-l2-009:q6': {"t": "calc", "chain": "9 + 36 / 4 / 3"},
  'ex-2am-silsila-bidun-aqwas-l2-010:q1': {"t": "missing_op"},
  'ex-2am-silsila-bidun-aqwas-l2-010:q2': {"t": "missing", "tmpl": "9 + 4 * _", "target": "37"},
  'ex-2am-silsila-bidun-aqwas-l2-010:q3': {"t": "missing", "tmpl": "50 - 4 * _", "target": "26"},
  'ex-2am-silsila-bidun-aqwas-l3-001:q1': {"t": "calc", "chain": "8 * 12 + 9 - 36 / 0.5"},
  'ex-2am-silsila-bidun-aqwas-l3-001:q2': {"t": "calc", "chain": "2.5 * 6 + 0.8 * 5 - 1.5"},
  'ex-2am-silsila-bidun-aqwas-l3-001:q3': {"t": "calc", "chain": "12 - 0.6 * 5 + 9 / 4"},
  'ex-2am-silsila-bidun-aqwas-l3-001:q4': {"t": "missing", "tmpl": "27 - 3 * _", "target": "12"},
  'ex-2am-silsila-bidun-aqwas-l3-002:q1': {"t": "calc", "chain": "24 + 3 * 0.5 - 18 / 4"},
  'ex-2am-silsila-bidun-aqwas-l3-002:q2': {"t": "calc", "chain": "7.5 * 4 - 12 / 5 * 2"},
  'ex-2am-silsila-bidun-aqwas-l3-002:q3': {"t": "calc", "chain": "1.2 + 0.8 * 6 - 3.5"},
  'ex-2am-silsila-bidun-aqwas-l3-002:q4': {"t": "missing", "tmpl": "6 * _ + 12 / 4", "target": "21"},
  'ex-2am-silsila-bidun-aqwas-l3-003:q1': {"t": "calc", "chain": "250 + 4 * 37.5 - 120 / 8"},
  'ex-2am-silsila-bidun-aqwas-l3-003:q2': {"t": "calc", "chain": "3 * 45 + 2 * 30 - 25"},
  'ex-2am-silsila-bidun-aqwas-l3-003:q3': {"t": "calc", "chain": "500 - 2 * 120 - 3 * 35"},
  'ex-2am-silsila-bidun-aqwas-l3-003:q4': {"t": "calc", "chain": "1000 - 4 * 125 / 5"},
  'ex-2am-silsila-bidun-aqwas-l3-004:q1': {"t": "missing", "tmpl": "14 + _ * 6", "target": "56"},
  'ex-2am-silsila-bidun-aqwas-l3-004:q2': {"t": "missing", "tmpl": "80 - 9 * _", "target": "26"},
  'ex-2am-silsila-bidun-aqwas-l3-004:q3': {"t": "missing", "tmpl": "_ / 4 + 5", "target": "17"},
  'ex-2am-silsila-bidun-aqwas-l3-004:q4': {"t": "missing", "tmpl": "3 * _ - 4 * 2", "target": "16"},
  'ex-2am-silsila-bidun-aqwas-l3-005:q1': {"t": "value_choice", "chain": "7 * 6 - 4 * 5", "vals": ["22", "190"]},
  'ex-2am-silsila-bidun-aqwas-l3-005:q2': {"t": "value_choice", "chain": "60 / 5 + 3 * 4", "vals": ["60", "24"]},
  'ex-2am-silsila-bidun-aqwas-l3-005:q3': {"t": "value_choice", "chain": "18 - 12 / 4 * 2", "vals": ["3", "12", "16.5"]},
  'ex-2am-silsila-bidun-aqwas-l3-006:q1': {"t": "calc", "chain": "4.8 / 0.6 * 2.5"},
  'ex-2am-silsila-bidun-aqwas-l3-006:q2': {"t": "calc", "chain": "7.2 * 0.5 / 0.9"},
  'ex-2am-silsila-bidun-aqwas-l3-006:q3': {"t": "calc", "chain": "0.75 * 16 / 4 * 2"},
  'ex-2am-silsila-bidun-aqwas-l3-006:q4': {"t": "calc", "chain": "9 / 1.5 / 0.4"},
  'ex-2am-silsila-bidun-aqwas-l3-007:q1': {"t": "chain_choice", "chains": ["1000 - 2 * 420 + 95", "1000 - 420 - 2 * 95", "1000 - 2 * 420 - 95"], "right": "1000 - 2 * 420 - 95"},
  'ex-2am-silsila-bidun-aqwas-l3-007:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l3-007:q3': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l3-008:q1': {"t": "calc", "chain": "9 + 6 * 4 - 15 / 3 + 2"},
  'ex-2am-silsila-bidun-aqwas-l3-008:q2': {"t": "calc", "chain": "48 / 6 * 2 - 3 * 4 + 5"},
  'ex-2am-silsila-bidun-aqwas-l3-008:q3': {"t": "calc", "chain": "100 - 8 * 7 + 36 / 9 - 20"},
  'ex-2am-silsila-bidun-aqwas-l3-008:q4': {"t": "calc", "chain": "2.5 * 4 + 1.5 * 6 - 8"},
  'ex-2am-silsila-bidun-aqwas-l3-009:q1': {"t": "missing", "tmpl": "_ + 3 * 7", "target": "40"},
  'ex-2am-silsila-bidun-aqwas-l3-009:q2': {"t": "missing", "tmpl": "4 * _ - 6", "target": "18"},
  'ex-2am-silsila-bidun-aqwas-l3-009:q3': {"t": "missing", "tmpl": "45 - 2 * _ + 3", "target": "40"},
  'ex-2am-silsila-bidun-aqwas-l3-009:q4': {"t": "missing", "tmpl": "_ / 3 + 2 * 5", "target": "17"},
  'ex-2am-silsila-bidun-aqwas-l3-010:q1': {"t": "calc", "chain": "0.2 * 15 + 3 * 0.5"},
  'ex-2am-silsila-bidun-aqwas-l3-010:q2': {"t": "calc", "chain": "8 - 0.5 * 6"},
  'ex-2am-silsila-bidun-aqwas-l3-010:q3': {"t": "calc", "chain": "2.4 / 0.2 + 1.5"},
  'ex-2am-silsila-bidun-aqwas-l3-010:q4': {"t": "calc", "chain": "0.25 * 8 - 1.2"},
  'ex-2am-silsila-bidun-aqwas-l4-001:q1': {"t": "chain_choice", "chains": ["240 - 85 + 64", "240 + 85 + 64", "240 - 85 - 64"], "right": "240 - 85 - 64"},
  'ex-2am-silsila-bidun-aqwas-l4-001:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-001:q3': {"t": "chain_choice", "chains": ["3 * 240 - 85 - 64 - 25", "240 - 85 - 64 - 3 * 25", "240 - 85 - 64 + 3 * 25"], "right": "240 - 85 - 64 - 3 * 25"},
  'ex-2am-silsila-bidun-aqwas-l4-001:q4': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-001:q5': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-002:q1': {"t": "chain_choice", "chains": ["9000 - 3900 - 1250", "9000 - 3900 + 1250", "9000 + 3900 + 1250"], "right": "9000 - 3900 - 1250"},
  'ex-2am-silsila-bidun-aqwas-l4-002:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-002:q3': {"t": "chain_choice", "chains": ["9000 - 3900 - 1250 + 4 * 350", "4 * 9000 - 3900 - 1250 - 350", "9000 - 3900 - 1250 - 4 * 350"], "right": "9000 - 3900 - 1250 - 4 * 350"},
  'ex-2am-silsila-bidun-aqwas-l4-002:q4': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-002:q5': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-003:q1': {"t": "chain_choice", "chains": ["180 + 65 + 48", "180 - 65 - 48", "180 - 65 + 48"], "right": "180 - 65 - 48"},
  'ex-2am-silsila-bidun-aqwas-l4-003:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-003:q3': {"t": "chain_choice", "chains": ["180 - 65 - 48 - 4 * 7.5", "180 - 65 - 48 + 4 * 7.5", "4 * 180 - 65 - 48 - 7.5"], "right": "180 - 65 - 48 - 4 * 7.5"},
  'ex-2am-silsila-bidun-aqwas-l4-003:q4': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-003:q5': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-004:q1': {"t": "chain_choice", "chains": ["1200 + 6 * 85", "1200 - 6 * 85", "6 * 1200 + 85"], "right": "1200 + 6 * 85"},
  'ex-2am-silsila-bidun-aqwas-l4-004:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-004:q3': {"t": "chain_choice", "chains": ["1200 + 6 * 85 + 150", "1200 - 6 * 85 - 150", "1200 + 6 * 85 - 150"], "right": "1200 + 6 * 85 - 150"},
  'ex-2am-silsila-bidun-aqwas-l4-004:q4': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-004:q5': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-005:q1': {"t": "chain_choice", "chains": ["320 - 45 + 6 * 12 - 9", "320 + 45 + 6 * 12 - 9", "320 - 45 - 6 * 12 - 9", "320 - 45 + 12 * 9 - 6"], "right": "320 - 45 + 6 * 12 - 9"},
  'ex-2am-silsila-bidun-aqwas-l4-005:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-005:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-005:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-006:q1': {"t": "chain_choice", "chains": ["850 + 3 * 120 + 400", "850 - 3 * 120 - 400", "850 - 3 * 120 + 400"], "right": "850 - 3 * 120 + 400"},
  'ex-2am-silsila-bidun-aqwas-l4-006:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-006:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-006:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-007:q1': {"t": "chain_choice", "chains": ["2.5 * 2000 - 640 - 160", "2000 - 2.5 * 640 - 160", "2000 - 2.5 * 640 + 160"], "right": "2000 - 2.5 * 640 - 160"},
  'ex-2am-silsila-bidun-aqwas-l4-007:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-007:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-007:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-008:q1': {"t": "chain_choice", "chains": ["240 - 5 * 18 - 25", "240 - 5 * 18 + 25", "5 * 240 - 18 - 25"], "right": "240 - 5 * 18 - 25"},
  'ex-2am-silsila-bidun-aqwas-l4-008:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-008:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-008:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-009:q1': {"t": "chain_choice", "chains": ["500 - 20 * 4.5 + 30", "4.5 * 500 - 20 - 30", "500 - 20 * 4.5 - 30"], "right": "500 - 20 * 4.5 - 30"},
  'ex-2am-silsila-bidun-aqwas-l4-009:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-009:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-009:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l4-010:q1': {"t": "chain_choice", "chains": ["118 + 35 - 29", "118 - 35 + 29", "118 - 35 - 29"], "right": "118 - 35 - 29"},
  'ex-2am-silsila-bidun-aqwas-l4-010:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l4-010:q3': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-001:q1': {"t": "chain_choice", "chains": ["6500 + 38 * 150 - 4 * 200", "6500 + 38 * 4 + 150 * 200", "6500 + 38 * 150 + 4 * 200"], "right": "6500 + 38 * 150 + 4 * 200"},
  'ex-2am-silsila-bidun-aqwas-l5-001:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-001:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-001:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-001:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-002:q1': {"t": "chain_choice", "chains": ["140 - 3 * 24", "140 + 3 * 24", "3 * 140 + 24"], "right": "140 + 3 * 24"},
  'ex-2am-silsila-bidun-aqwas-l5-002:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-002:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-002:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-002:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-003:q1': {"t": "chain_choice", "chains": ["3 * 85 + 18", "85 - 3 * 18", "85 + 3 * 18"], "right": "85 + 3 * 18"},
  'ex-2am-silsila-bidun-aqwas-l5-003:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-003:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-003:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-003:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-004:q1': {"t": "chain_choice", "chains": ["12 * 650 + 12 * 350", "12 * 650 - 12 * 350", "12 * 12 + 650 * 350"], "right": "12 * 650 + 12 * 350"},
  'ex-2am-silsila-bidun-aqwas-l5-004:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-004:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-004:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-004:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-005:q1': {"t": "chain_choice", "chains": ["8 * 15 + 250 * 120 + 900", "8 * 250 + 15 * 120 + 900", "8 * 250 + 15 * 120 - 900"], "right": "8 * 250 + 15 * 120 + 900"},
  'ex-2am-silsila-bidun-aqwas-l5-005:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-005:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-005:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-005:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-006:q1': {"t": "chain_choice", "chains": ["120 + 3 * 15", "3 * 120 - 15", "120 - 3 * 15"], "right": "120 - 3 * 15"},
  'ex-2am-silsila-bidun-aqwas-l5-006:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-006:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-006:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-006:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-007:q1': {"t": "chain_choice", "chains": ["40 - 3.5 - 4 * 6.25", "40 - 3.5 + 4 * 6.25", "4 * 40 - 3.5 - 6.25"], "right": "40 - 3.5 - 4 * 6.25"},
  'ex-2am-silsila-bidun-aqwas-l5-007:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-007:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-007:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-007:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-008:q1': {"t": "chain_choice", "chains": ["40 * 280 + 4.2", "280 + 40 * 4.2", "280 - 40 * 4.2"], "right": "280 + 40 * 4.2"},
  'ex-2am-silsila-bidun-aqwas-l5-008:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-008:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-008:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-008:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-009:q1': {"t": "chain_choice", "chains": ["2350 - 8 * 175", "8 * 2350 + 175", "2350 + 8 * 175"], "right": "2350 + 8 * 175"},
  'ex-2am-silsila-bidun-aqwas-l5-009:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-009:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-009:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-009:q5': {"t": "self"},
  'ex-2am-silsila-bidun-aqwas-l5-010:q1': {"t": "chain_choice", "chains": ["4800 + 5 * 2700", "5 * 4800 + 2700", "5 * 4800 - 2700"], "right": "5 * 4800 + 2700"},
  'ex-2am-silsila-bidun-aqwas-l5-010:q2': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-010:q3': {"t": "story"},
  'ex-2am-silsila-bidun-aqwas-l5-010:q4': {"t": "yesno"},
  'ex-2am-silsila-bidun-aqwas-l5-010:q5': {"t": "self"},
};
