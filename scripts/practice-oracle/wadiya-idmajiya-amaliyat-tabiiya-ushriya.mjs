// Oracle du banc « wadiya-idmajiya-amaliyat-tabiiya-ushriya » (« أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية »,
// synthèse de l'unité 1 de 2AM, 2026-10-29) — feuilles d'examen de فصل (« على منوال اختبار الفصل الأول / الثاني »).
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`. Le parseur et l'évaluateur exact (rationnels BigInt, ( ) [ ] et barre
// de fraction, mode strict qui refuse tout intermédiaire négatif) sont ceux de silsila-bi-aqwas.mjs (importés : aucun nouveau parseur) ;
// ce fichier y ajoute :
//  - des évaluateurs de LECTURES FAUTIVES nommées (NOPRIORITY : tout de gauche à droite ; ADDFIRST : les + avant les − ; IGNORED :
//    les parenthèses lues comme décor ; BARSPLIT : la barre ne divise que le dernier terme ; ROUNDUP / MAX pour les nombres d'objets) ;
//  - le NOM d'une chaîne (dernière opération effectuée), la première opération effectuée et le premier signe écrit ;
//  - SPEC : pour chaque question, la formule RETAPÉE en ASCII (« * » = ×, « / » = ÷, « {N|D} » = barre de fraction) et le genre de
//    jugement ; audit(bank) RELIT ensuite le LaTeX des feuilles (\dfrac, \times, \div, {,}) et exige la même expression ;
//  - chaque QCM est jugé option par option : UNE seule option est vraie (celle qui est marquée), chaque distracteur est la lecture
//    que sa misconception nomme ;
//  - la provenance (4 term_exam lus, 6 adaptées, le reste « modelled »), aucune mention du manuel, les mots interdits, aucun
//    intermédiaire négatif, chaque chaîne d'égalités « a = b = c » exacte.
//
// Le bloc `SPEC` est produit par le générateur de banque (scratch, non versionné) ; ne le modifier qu'avec lui.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';
import { E, parse } from './silsila-bi-aqwas.mjs';

/* ── nombres exacts (le Q de silsila-bi-aqwas est celui rendu par E) ──────────────── */
const q0 = (s) => E(String(s), false);
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
const isDec = (x) => { try { D(x); return true; } catch { return false; } };
const floorQ = (x) => x.n / x.d; // x >= 0
const ceilQ = (x) => (x.n % x.d === 0n ? x.n / x.d : x.n / x.d + 1n);

/* ── arbres ───────────────────────────────────────────────────────────────────────── */
const show = (n) => {
  switch (n.t) {
    case 'num': return D(n.v);
    case 'grp': return n.k + show(n.e) + (n.k === '(' ? ')' : ']');
    case 'bar': return `{${show(n.n)}|${show(n.d)}}`;
    default: return n.o.map(show).reduce((a, s, i) => (i ? `${a} ${n.p[i - 1]} ${s}` : s), '');
  }
};
export const norm = (s) => show(parse(s));
const apply = (a, o, b) => (o === '+' ? a.add(b) : o === '-' ? a.sub(b) : o === '*' ? a.mul(b) : a.div(b));
/** Évalue avec des niveaux de priorité donnés (chaque niveau de gauche à droite). */
function evL(n, levels) {
  switch (n.t) {
    case 'num': return n.v;
    case 'grp': return evL(n.e, levels);
    case 'bar': return evL(n.n, levels).div(evL(n.d, levels));
    default: {
      const v = n.o.map((m) => evL(m, levels)); const p = [...n.p];
      for (const lv of levels) for (let i = 0; i < p.length;) { if (lv.includes(p[i])) { v.splice(i, 2, apply(v[i], p[i], v[i + 1])); p.splice(i, 1); } else i++; }
      return v[0];
    }
  }
}
const STD = [['*', '/'], ['+', '-']];
const joinC = (n, f) => n.o.map(f).reduce((a, s, i) => (i ? `${a} ${n.p[i - 1]} ${s}` : s), '');
const stripS = (n) => (n.t === 'num' ? D(n.v) : n.t === 'grp' ? stripS(n.e) : n.t === 'bar' ? `{${stripS(n.n)}|${stripS(n.d)}}` : joinC(n, stripS));
const barSplitS = (n) => (n.t === 'num' ? D(n.v) : n.t === 'grp' ? n.k + barSplitS(n.e) + (n.k === '(' ? ')' : ']') : n.t === 'bar' ? `${barSplitS(n.n)} / ${barSplitS(n.d)}` : joinC(n, barSplitS));
const flatTokens = (s) => (s.match(/\d+(?:\.\d+)?|[+\-*/]/g) ?? []).join(' ');
const hasNeg = (x) => x.n < 0n;

/** Valeur d'une lecture fautive nommée (ou d'une expression `w` retapée), null si ce n'est pas un décimal positif. */
export function reading(how, e, w) {
  try {
    let v;
    if (w) v = evL(parse(w), STD);
    else {
      const a = parse(e);
      if (how === 'NOPRIORITY') v = evL(a, [['*', '/', '+', '-']]);
      else if (how === 'ADDFIRST') v = evL(a, [['*', '/'], ['+'], ['-']]);
      else if (how === 'MULFIRST') v = evL(a, [['*'], ['/'], ['+', '-']]);
      else if (how === 'IGNORED') v = evL(parse(stripS(a)), STD);
      else if (how === 'BARSPLIT') v = evL(parse(barSplitS(a)), STD);
      else throw new Error(`lecture inconnue ${how}`);
    }
    return hasNeg(v) || !isDec(v) ? null : v;
  } catch { return null; }
}
/** Nom de la dernière opération effectuée / de la première effectuée / du premier signe écrit. */
const NAME = { '+': 'sum', '-': 'diff', '*': 'prod', '/': 'quot' };
export function lastOp(n) {
  if (n.t === 'bar') return 'quot';
  if (n.t === 'grp') return lastOp(n.e);
  if (n.t !== 'chain') return null;
  let i = -1; for (let k = 0; k < n.p.length; k++) if (n.p[k] === '+' || n.p[k] === '-') i = k;
  if (i < 0) for (let k = 0; k < n.p.length; k++) i = k;
  return NAME[n.p[i]];
}
export function firstOp(n) {
  if (n.t === 'bar') { const a = firstOp(n.n) ?? firstOp(n.d); return a ?? 'quot'; }
  if (n.t === 'grp') return firstOp(n.e);
  if (n.t !== 'chain') return null;
  for (const m of n.o) { const f = m.t === 'num' ? null : firstOp(m); if (f) return f; }
  let i = n.p.findIndex((c) => c === '*' || c === '/'); if (i < 0) i = 0;
  return NAME[n.p[i]];
}
export const firstWritten = (s) => { const m = /[+\-*/]/.exec(s.replace(/\|/g, ' ')); return m ? NAME[m[0]] : null; };
const NAMES_AR = { sum: 'مجموع', diff: 'فرق', prod: 'جداء', quot: 'حاصل قسمة' };

/* ── SPEC ──────────────────────────────────────────────────────────────────────────── */
// <SPEC>
const SPEC = {
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-001:q1": {"k":"val","e":"48 - 6 * 5 + 9","sigs":[["219","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-001:q2": {"k":"val","e":"75 - [(8 + 4) * 5 - 20]","sigs":[["67","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-001:q3": {"k":"nm","e":"(17 - 5) * 3 + 4","opts":["diff","sum"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-001:q4": {"k":"vp","e":"12 * (100 - 1)","opts":[["1199","FIRSTONLY","12 * 100 - 1"],["1188",null,null],["111","ADDK","12 + 100 - 1"]],"show":"12 * (100 - 1)"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-002:q1": {"k":"val","e":"120 / 8 * 5","sigs":[["3","MISC-SILSILA-MULFIRST","MULFIRST"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-002:q2": {"k":"val","e":"{18 + 12 | 6 - 2}","sigs":[["18","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-002:q3": {"k":"nm","e":"6 * (14 - 9)","opts":["prod","diff"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-002:q4": {"k":"yn","claim":["eq","9 * (20 + 3)","9 * 20 + 3"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-003:q1": {"k":"val","e":"7 + 24 / 4 * 3","sigs":[["23.25","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-003:q2": {"k":"val","e":"[60 - (7 + 3) * 4] / 5","sigs":[["55.4","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-003:q3": {"k":"nm","e":"{9 * 4 - 6 | 5}","opts":["prod","quot"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-003:q4": {"k":"pc","truth":"8 * (13 - 7)","opts":[["8 * (13 - 7)",null,null],["8 * (13 - 8)","FACTORWRONG","MISC-TAWZI-FACTORWRONG"],["8 * 13 * 7","FACTORMULT","MISC-TAWZI-FACTORMULT"]],"show":"8 * 13 - 8 * 7"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-004:q1": {"k":"val","e":"100 - 4 * 15 - 25","sigs":[["1415","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-004:q2": {"k":"val","e":"{1.5 * 6 + 11 | 4}","sigs":[["11.75","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-004:q3": {"k":"nm","e":"(12 + 8) / 5 - 1","opts":["diff","sum"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-004:q4": {"k":"vp","e":"15 * (100 + 2)","opts":[["1502","FIRSTONLY","15 * 100 + 2"],["1530",null,null],["117","ADDK","15 + 100 + 2"]],"show":"15 * (100 + 2)"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-005:q1": {"k":"val","e":"4 * 12 / 6 + 7 * 3 - 9","sigs":[["36","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-005:q2": {"k":"val","e":"90 - {18 + 27 | 5}","sigs":[["77.4","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-005:q3": {"k":"nm","e":"3 * 4 + 5 * 6","opts":["prod","sum"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-005:q4": {"k":"self","facts":[["7 * 98","686"],["7 * 100 - 7 * 2","686"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-006:q1": {"k":"val","e":"36 - 18 + 7","sigs":[["11","MISC-SILSILA-ADDFIRST","ADDFIRST"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-006:q2": {"k":"val","e":"3 * [(15 - 6) * 2 + 4]","sigs":[["37","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-006:q3": {"k":"nm","e":"(35 - 14) * (2 + 3)","opts":["prod","diff"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-006:q4": {"k":"pc","truth":"6 * 9 - 6 * 4","opts":[["6 * 9 - 6 * 4",null,null],["6 * 9 + 6 * 4","SIGNCHANGE","MISC-TAWZI-SIGNCHANGE"],["6 * 9 - 4","FIRSTONLY","MISC-TAWZI-FIRSTONLY"]],"show":"6 * (9 - 4)"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-007:q1": {"k":"val","e":"150 / 6 * 4","sigs":[["6.25","MISC-SILSILA-MULFIRST","MULFIRST"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-007:q2": {"k":"val","e":"{45 - 9 | 2 * 3 + 3}","sigs":[["34.5","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-007:q3": {"k":"nm","e":"7 * 12 - 3 * 8","opts":["prod","diff"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-007:q4": {"k":"vp","e":"6 * (100 + 5)","opts":[["605","FIRSTONLY","6 * 100 + 5"],["630",null,null],["111","ADDK","6 + 100 + 5"]],"show":"6 * (100 + 5)"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-008:q1": {"k":"val","e":"8 + 6 * 7 - 12 / 4","sigs":[["21.5","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-008:q2": {"k":"val","e":"(24 - 4) * 3 + {12 + 18 | 5}","sigs":[["18","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-008:q3": {"k":"nm","e":"{16 + 4 | 5} * 7","opts":["prod","sum"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-008:q4": {"k":"yn","claim":["eq","5 * (12 - 3)","5 * 12 + 5 * 3"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-009:q1": {"k":"val","e":"64 / 8 * 3 + 4 * 5","sigs":[["140","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-009:q2": {"k":"val","e":"[12 - (2 + 3)] * 4 + 5","sigs":[["27","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-009:q3": {"k":"nm","e":"9 + 7 * 6","opts":["prod","sum"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-009:q4": {"k":"self","facts":[["17 * 12","204"],["17 * 10 + 17 * 2","204"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-010:q1": {"k":"val","e":"200 - 45 - 30 + 25","sigs":[["100","MISC-SILSILA-ADDFIRST","ADDFIRST"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-010:q2": {"k":"val","e":"{35 + 7 | 2 * 3}","sigs":[["45.5","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-010:q3": {"k":"nm","e":"[(8 + 2) * 5 - 6] / 4","opts":["sum","quot"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l1-010:q4": {"k":"pc","truth":"7 * (15 + 5)","opts":[["7 * 15 * 5","FACTORMULT","MISC-TAWZI-FACTORMULT"],["7 * (15 + 5)",null,null],["7 * (15 + 7)","FACTORWRONG","MISC-TAWZI-FACTORWRONG"]],"show":"7 * 15 + 7 * 5"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-001:q1": {"k":"pc","truth":"2000 - (4 * 120 + 3 * 95 + 350)","opts":[["2000 - 4 * 120 + 3 * 95 + 350","IGNORED","MISC-AQWAS-IGNORED"],["2000 - (4 * 120 + 3 * 95 + 350)",null,null],["(2000 - 4) * 120 + 3 * 95 + 350","MISPLACED","MISC-AQWAS-MISPLACED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-001:q2": {"k":"story","e":"2000 - (4 * 120 + 3 * 95 + 350)","sigs":[["2155","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-001:q3": {"k":"nm","e":"2000 - (4 * 120 + 3 * 95 + 350)","opts":["diff","prod"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-001:q4": {"k":"yn","claim":["cmp","2000 - (4 * 120 + 3 * 95 + 350)",">=","800"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-002:q1": {"k":"pc","truth":"(9 * 4 + 6) / 2","opts":[["9 * 4 + 6 / 2","IGNORED","MISC-AQWAS-IGNORED"],["9 * (4 + 6) / 2","MISPLACED","MISC-AQWAS-MISPLACED"],["(9 * 4 + 6) / 2",null,null]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-002:q2": {"k":"story","e":"(9 * 4 + 6) / 2","sigs":[["39","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-002:q3": {"k":"nm","e":"(9 * 4 + 6) / 2","opts":["prod","quot"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-002:q4": {"k":"yn","claim":["eq","(11 * 4 + 6) / 2","47"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-003:q1": {"k":"pc","truth":"{9 + 14.5 + 12 + 16.5 | 4}","opts":[["{9 + 14.5 + 12 + 16.5 | 4}",null,null],["9 + 14.5 + 12 + 16.5 / 4","BARSPLIT","MISC-AQWAS-BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-003:q2": {"k":"story","e":"{9 + 14.5 + 12 + 16.5 | 4}","sigs":[["39.625","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-003:q3": {"k":"yn","claim":["cmp","{9 + 14.5 + 12 + 16.5 | 4}",">","12.5"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-003:q4": {"k":"self","facts":[["9 + 14.5 + 12 + 16.5 / 4","39.625"],["(9 + 14.5 + 12 + 16.5) / 4","13"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-004:q1": {"k":"story","e":"5 * 38 + 4 * 22.5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-004:q2": {"k":"story","e":"400 - (5 * 38 + 4 * 22.5)","sigs":[["300","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-004:q3": {"k":"pc","truth":"400 - 5 * 38 - 4 * 22.5","opts":[["400 - 5 * 38 - 4 * 22.5",null,null],["400 - 5 * 38 + 4 * 22.5","STORYSIGN","MISC-SILSILA-STORYSIGN"],["(400 - 5) * 38 - 4 * 22.5","STORYORDER","MISC-SILSILA-STORYORDER"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-004:q4": {"k":"yn","claim":["cmp","400 - (5 * 38 + 4 * 22.5)",">=","115"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-005:q1": {"k":"pc","truth":"(25 + 15) * 6 - 20","opts":[["(25 + 15) * 6 - 20",null,null],["25 + 15 * 6 - 20","IGNORED","MISC-AQWAS-IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-005:q2": {"k":"story","e":"(25 + 15) * 6 - 20","sigs":[["95","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-005:q3": {"k":"nm","e":"(25 + 15) * 6 - 20","opts":["diff","sum"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-005:q4": {"k":"self","facts":[["(25 + 15) * 6 - 20","220"],["25 + 15 * 6 - 20","95"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-006:q1": {"k":"pc","truth":"(36 + 28) * 45","opts":[["(36 + 28) * 45",null,null],["36 + 28 * 45","IGNORED","MISC-WASF-NOBRACKET"],["36 * 45 + 28","STORYORDER","MISC-SILSILA-STORYORDER"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-006:q2": {"k":"story","e":"(36 + 28) * 45","sigs":[["1296","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-006:q3": {"k":"story","e":"36 * 45 + 28 * 45","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-006:q4": {"k":"yn","claim":["cmp","(36 + 28) * 45",">=","3000"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-007:q1": {"k":"story","e":"{420 + 450 + 480 | 3}","sigs":[["1030","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-007:q2": {"k":"pc","truth":"(420 + 450 + 480) / 3","opts":[["420 + 450 + 480 / 3","IGNORED","MISC-AQWAS-CALCNOBRACKET"],["420 + (450 + 480) / 3","MISPLACED","MISC-AQWAS-MISPLACED"],["(420 + 450 + 480) / 3",null,null]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-007:q3": {"k":"nm","e":"12 * {420 + 450 + 480 | 3}","opts":["prod","sum"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-007:q4": {"k":"yn","claim":["cmp","12 * {420 + 450 + 480 | 3}",">","5000"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-008:q1": {"k":"pc","truth":"(120 - 24) / 8","opts":[["120 - 24 / 8","IGNORED","MISC-WASF-NOBRACKET"],["(120 - 24) / 8",null,null]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-008:q2": {"k":"story","e":"(120 - 24) / 8","sigs":[["117","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-008:q3": {"k":"floor","e":"12 / 5","sigs":[["3","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-008:q4": {"k":"self","facts":[["120 - 24 / 8","117"],["(120 - 24) / 8","12"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-009:q1": {"k":"story","e":"3 + 3 * 4","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-009:q2": {"k":"story","e":"5 + 3 * 7","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-009:q3": {"k":"story","e":"5 + 3 * 7 + (3 + 3 * 4) * 7","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-009:q4": {"k":"self","facts":[["5 + 3 * 7","26"],["5 + 3 * 7 + (3 + 3 * 4) * 7","131"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-010:q1": {"k":"story","e":"11 * 4","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-010:q2": {"k":"story","e":"(52 - 11 * 4) / (5 - 4)","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-010:q3": {"k":"story","e":"11 - (52 - 11 * 4) / (5 - 4)","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l2-010:q4": {"k":"self","facts":[["8 * 5 + 3 * 4","52"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-001:q1": {"k":"story","e":"9 * 6","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-001:q2": {"k":"story","e":"2 * (9 + 6)","sigs":[["24","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-001:q3": {"k":"story","e":"9 * 6 * 650","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-001:q4": {"k":"yn","claim":["cmp","9 * 6 * 650","<=","40000"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-002:q1": {"k":"story","e":"2 * (24 + 13.5)","sigs":[["61.5","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-002:q2": {"k":"story","e":"2 * 24 + 2 * 13.5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-002:q3": {"k":"yn","claim":["eq","2 * (24 + 13.5)","2 * 24 + 13.5"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-002:q4": {"k":"story","e":"2 * (24 + 13.5) * 85","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-003:q1": {"k":"story","e":"20 * 12 - 8 * 5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-003:q2": {"k":"story","e":"12 * 12 + 8 * (12 - 5)","sigs":[["235","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-003:q3": {"k":"pc","truth":"12 * 12 + 8 * (12 - 5)","opts":[["12 * 12 + 8 * 12 - 5","IGNORED","MISC-AQWAS-IGNORED"],["12 * 12 + 8 * (12 - 5)",null,null]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-003:q4": {"k":"story","e":"(20 * 12 - 8 * 5) * 300","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-004:q1": {"k":"story","e":"60 + 2 * 5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-004:q2": {"k":"story","e":"(60 + 2 * 5) * (40 + 2 * 5) - 60 * 40","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-004:q3": {"k":"nm","e":"(60 + 2 * 5) * (40 + 2 * 5) - 60 * 40","opts":["sum","diff","prod"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-004:q4": {"k":"yn","claim":["cmp","(60 + 2 * 5) * (40 + 2 * 5) - 60 * 40",">","1000"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-005:q1": {"k":"story","e":"105 * 68","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-005:q2": {"k":"vp","e":"(100 + 5) * 68","opts":[["6805","FIRSTONLY","100 * 68 + 5"],["7140",null,null],["173","ADDK","100 + 5 + 68"]],"show":"(100 + 5) * 68"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-005:q3": {"k":"story","e":"105 * 68 * 45","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-005:q4": {"k":"yn","claim":["cmp","105 * 68 * 45","<=","300000"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-006:q1": {"k":"story","e":"18 * 12.5 - 6 * 4","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-006:q2": {"k":"story","e":"(18 * 12.5 - 6 * 4) * 30","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-006:q3": {"k":"nm","e":"18 * 12.5 - 6 * 4","opts":["diff","prod"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-006:q4": {"k":"self","facts":[["18 * 12.5 - 6 * 4","201"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-007:q1": {"k":"story","e":"16 + (10 - 4) + 6 + 4 + (16 - 6) + 10","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-007:q2": {"k":"story","e":"2 * (16 + 10)","sigs":[["42","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-007:q3": {"k":"self","facts":[["16 + (10 - 4) + 6 + 4 + (16 - 6) + 10","52"],["2 * (16 + 10)","52"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-007:q4": {"k":"story","e":"52 * 120","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-008:q1": {"k":"story","e":"3.14 * 3 / 2","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-008:q2": {"k":"story","e":"7 + 7 + 3 + 3.14 * 3 / 2","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-008:q3": {"k":"nm","e":"7 + 7 + 3 + 3.14 * 3 / 2","opts":["sum","prod"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-008:q4": {"k":"self","facts":[["7 + 7 + 3 + 3.14 * 3 / 2","21.71"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-009:q1": {"k":"story","e":"10.5 * 10.5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-009:q2": {"k":"story","e":"10.5 * 2 / 2","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-009:q3": {"k":"story","e":"10.5 * 10.5 - 10.5 * 2 / 2","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-009:q4": {"k":"nm","e":"10.5 * 10.5 - 10.5 * 2 / 2","opts":["diff","prod"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-010:q1": {"k":"story","e":"6 * 2.5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-010:q2": {"k":"story","e":"3 * 2.5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-010:q3": {"k":"story","e":"2 * (6 * 2.5 + 3 * 2.5)","sigs":[["37.5","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l3-010:q4": {"k":"self","facts":[["2 * (6 * 2.5 + 3 * 2.5)","45"],["(6 + 6 + 3 + 3) * 2.5","45"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-001:q1": {"k":"story","e":"{48 + 27 | 12 - 7}","sigs":[["43.25","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-001:q2": {"k":"pc","truth":"(48 + 27) / (12 - 7)","opts":[["48 + 27 / 12 - 7","IGNORED","MISC-AQWAS-CALCNOBRACKET"],["(48 + 27) / (12 - 7)",null,null],["48 + 27 / (12 - 7)","MISPLACED","MISC-AQWAS-MISPLACED"]],"show":"{48 + 27 | 12 - 7}"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-001:q3": {"k":"nm","e":"{48 + 27 | 12 - 7}","opts":["quot","sum"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-001:q4": {"k":"self","facts":[["48 + 27 / 12 - 7","43.25"],["(48 + 27) / (12 - 7)","15"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-002:q1": {"k":"story","e":"[(7 + 5) * 3 + 4] / 5","sigs":[["22.8","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-002:q2": {"k":"pc","truth":"((7 + 5) * 3 + 4) / 5","opts":[["(7 + 5) * 3 + 4 / 5","MISPLACED","MISC-AQWAS-DROPOUTER"],["7 + 5 * 3 + 4 / 5","IGNORED","MISC-AQWAS-IGNORED"],["((7 + 5) * 3 + 4) / 5",null,null]],"show":"[(7 + 5) * 3 + 4] / 5"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-002:q3": {"k":"nm","e":"[(7 + 5) * 3 + 4] / 5","opts":["sum","quot"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-002:q4": {"k":"self","facts":[["7 + 5 * 3 + 4 / 5","22.8"],["((7 + 5) * 3 + 4) / 5","8"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-003:q1": {"k":"story","e":"{35.5 + 42.25 + 18.75 + 23.5 | 4}","sigs":[["102.375","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-003:q2": {"k":"pc","truth":"(35.5 + 42.25 + 18.75 + 23.5) / 4","opts":[["(35.5 + 42.25 + 18.75 + 23.5) / 4",null,null],["35.5 + 42.25 + 18.75 + 23.5 / 4","IGNORED","MISC-AQWAS-CALCNOBRACKET"],["(35.5 + 42.25) + (18.75 + 23.5) / 4","MISPLACED","MISC-AQWAS-MISPLACED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-003:q3": {"k":"yn","claim":["cmp","{35.5 + 42.25 + 18.75 + 23.5 | 4}",">","28"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-003:q4": {"k":"story","e":"{35.5 + 42.25 + 18.75 + 23.5 | 4} * 8","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-004:q1": {"k":"val","e":"(4 + 4) / (4 + 4)","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-004:q2": {"k":"val","e":"(4 + 4 + 4) / 4","sigs":[["9","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-004:q3": {"k":"val","e":"4 + 4 + 4 * 4","sigs":[["48","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-004:q4": {"k":"self","facts":[["(4 + 4) / 4 + 4","6"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-005:q1": {"k":"val","e":"5 + 5 + 5 * 5","sigs":[["75","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-005:q2": {"k":"pc","truth":"(5 * 5 + 5) / 5","opts":[["5 * 5 + 5 / 5","IGNORED","MISC-AQWAS-IGNORED"],["5 * (5 + 5) / 5","MISPLACED","MISC-AQWAS-MISPLACED"],["(5 * 5 + 5) / 5",null,null]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-005:q3": {"k":"yn","claim":["cmp","5 * 5 - 5 / 5",">","23"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-005:q4": {"k":"self","facts":[["5 * 5 + 5 + 5 - 5","30"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-006:q1": {"k":"pc","truth":"(5 + 3 - 2) * 4","opts":[["5 + 3 - 2 * 4","IGNORED","MISC-AQWAS-IGNORED"],["5 + (3 - 2) * 4","MISPLACED","MISC-AQWAS-MISPLACED"],["(5 + 3 - 2) * 4",null,null]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-006:q2": {"k":"val","e":"2 * (3 + 4 + 5)","sigs":[["15","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-006:q3": {"k":"yn","claim":["cmp","3 * 4 * (5 - 2)",">","24"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-006:q4": {"k":"self","facts":[["1 * 2 * 3 * 4","24"],["(1 + 2 + 3) * 4","24"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-007:q1": {"k":"story","e":"7.5 * 480 + 4.25 * 320","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-007:q2": {"k":"story","e":"5000 - (7.5 * 480 + 4.25 * 320)","sigs":[["2760","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-007:q3": {"k":"pc","truth":"5000 - (7.5 * 480 + 4.25 * 320)","opts":[["5000 - 7.5 * 480 + 4.25 * 320","IGNORED","MISC-AQWAS-IGNORED"],["(5000 - 7.5) * 480 + 4.25 * 320","MISPLACED","MISC-AQWAS-MISPLACED"],["5000 - (7.5 * 480 + 4.25 * 320)",null,null]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-007:q4": {"k":"nm","e":"5000 - (7.5 * 480 + 4.25 * 320)","opts":["prod","diff"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-008:q1": {"k":"story","e":"1500 + 60 * 28","sigs":[["43680","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-008:q2": {"k":"story","e":"900 + 85 * 28","sigs":[["27580","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-008:q3": {"k":"dec","rule":"min","opts":["1500 + 60 * 28","900 + 85 * 28"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-008:q4": {"k":"yn","claim":["cmp","(900 + 85 * 28) - (1500 + 60 * 28)","<","150"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-009:q1": {"k":"val","e":"(50 - 1) * 15","sigs":[["35","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-009:q2": {"k":"story","e":"15 * 50 - 15 * 1","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-009:q3": {"k":"pc","truth":"(12 + 8) * 25","opts":[["12 * 8 * 25","FACTORMULT","MISC-TAWZI-FACTORMULT"],["(12 + 8) * 25",null,null],["(12 + 8) * 25 * 8","FACTORWRONG","MISC-TAWZI-FACTORWRONG"]],"show":"12 * 25 + 8 * 25"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-009:q4": {"k":"self","facts":[["(12 + 8) * 25","500"],["12 * 25 + 8 * 25","500"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-010:q1": {"k":"story","e":"3 * 40 + 5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-010:q2": {"k":"story","e":"1000 - 4 * 13","sigs":[["12948","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-010:q3": {"k":"story","e":"13 * 13","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-010:q4": {"k":"story","e":"2 * 17 * 17","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l4-010:q5": {"k":"self","facts":[["3 * 40 + 5","125"],["1000 - 4 * 13","948"],["13 * 13","169"],["2 * 17 * 17","578"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-001:q1": {"k":"story","e":"2 * (215 + 120)","sigs":[["550","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-001:q2": {"k":"pc","truth":"134 * 450 + 2 * (215 + 120) * 180","opts":[["134 * 450 + 2 * 215 + 120 * 180","IGNORED","MISC-AQWAS-IGNORED"],["134 * 450 + 2 * (215 + 120) + 180","STORYORDER","MISC-SILSILA-STORYORDER"],["134 * 450 + 2 * (215 + 120) * 180",null,null]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-001:q3": {"k":"story","e":"134 * 450 + 2 * (215 + 120) * 180","sigs":[["82330","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-001:q4": {"k":"yn","claim":["cmp","134 * 450 + 2 * (215 + 120) * 180","<=","200000"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-001:q5": {"k":"story","e":"200000 - (134 * 450 + 2 * (215 + 120) * 180)","sigs":[["161730","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-001:q6": {"k":"self","facts":[["134 * 450 + 2 * (215 + 120) * 180","180900"],["200000 - (134 * 450 + 2 * (215 + 120) * 180)","19100"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-002:q1": {"k":"story","e":"7.5 * 4","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-002:q2": {"k":"story","e":"7.5 * 4 * 780","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-002:q3": {"k":"pc","truth":"7.5 * 4 * 780 - (2 * 2200 + 1650 + 4900)","opts":[["7.5 * 4 * 780 - (2 * 2200 + 1650 + 4900)",null,null],["7.5 * 4 * 780 - 2 * 2200 + 1650 + 4900","IGNORED","MISC-AQWAS-IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-002:q4": {"k":"story","e":"7.5 * 4 * 780 - (2 * 2200 + 1650 + 4900)","sigs":[["25550","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-002:q5": {"k":"nm","e":"7.5 * 4 * 780 - (2 * 2200 + 1650 + 4900)","opts":["diff","prod"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-002:q6": {"k":"yn","claim":["cmp","7.5 * 4 * 780 - (2 * 2200 + 1650 + 4900)",">=","13000"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-003:q1": {"k":"floor","e":"56 / 3","sigs":[["19","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-003:q2": {"k":"floor","e":"31 / 2","sigs":[["16","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-003:q3": {"k":"minf","pairs":[[56,3],[31,2],[82,5]],"sigs":[["18","MISC-SYN-AMALIYAT-MAXNOTMIN","MAX"],["16","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-003:q4": {"k":"story","e":"56 - 15 * 3","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-003:q5": {"k":"story","e":"15 * 1900 - 15 * 1515","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-003:q6": {"k":"pc","truth":"15 * (1900 - 1515)","opts":[["15 * (1900 - 15) * 1515","FACTORMULT","MISC-TAWZI-FACTORMULT"],["15 * 1900 - 1515","FIRSTONLY","MISC-TAWZI-FIRSTONLY"],["15 * (1900 - 1515)",null,null]],"show":"15 * 1900 - 15 * 1515"},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-004:q1": {"k":"story","e":"5 * 3.6","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-004:q2": {"k":"story","e":"5 * 3.6 / (0.25 * 0.25)","sigs":[["18","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-004:q3": {"k":"story","e":"5 * 3.6 / (0.3 * 0.3)","sigs":[["18","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-004:q4": {"k":"story","e":"5 * 3.6 / (0.25 * 0.25) * 35","sigs":[["630","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-004:q5": {"k":"dec","rule":"min","opts":["5 * 3.6 / (0.25 * 0.25) * 35","5 * 3.6 / (0.3 * 0.3) * 50"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-004:q6": {"k":"self","facts":[["5 * 3.6 / (0.25 * 0.25) * 35","10080"],["5 * 3.6 / (0.3 * 0.3) * 50","10000"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-005:q1": {"k":"story","e":"2 * (36 + 24) - 3.5","sigs":[["92.5","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-005:q2": {"k":"story","e":"4 * (2 * (36 + 24) - 3.5)","sigs":[["308.5","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-005:q3": {"k":"floor","e":"400 / (2 * (36 + 24) - 3.5)","sigs":[["4","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-005:q4": {"k":"yn","claim":["cmp","4 * (2 * (36 + 24) - 3.5)","<=","400"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-005:q5": {"k":"story","e":"4 * (2 * (36 + 24) - 3.5) - 400","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-005:q6": {"k":"story","e":"(4 * (2 * (36 + 24) - 3.5) - 400) * 95","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-006:q1": {"k":"floor","e":"22 / 0.4","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-006:q2": {"k":"floor","e":"7.6 / 0.15","sigs":[["51","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-006:q3": {"k":"minf","pairs":[[22,0.4],[7.6,0.15],[160,3]],"sigs":[["55","MISC-SYN-AMALIYAT-MAXNOTMIN","MAX"],["51","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-006:q4": {"k":"story","e":"0.4 * 120 + 0.15 * 110 + 3 * 25","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-006:q5": {"k":"story","e":"50 * (200 - (0.4 * 120 + 0.15 * 110 + 3 * 25))","sigs":[["10043.5","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-006:q6": {"k":"yn","claim":["cmp","50 * (200 - (0.4 * 120 + 0.15 * 110 + 3 * 25))",">","3000"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-007:q1": {"k":"floor","e":"52 / 2.5","sigs":[["21","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-007:q2": {"k":"floor","e":"90 / 4","sigs":[["23","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-007:q3": {"k":"minf","pairs":[[38,1.6],[90,4],[52,2.5]],"sigs":[["23","MISC-SYN-AMALIYAT-MAXNOTMIN","MAX"],["21","MISC-SYN-AMALIYAT-ROUNDUP","ROUNDUP"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-007:q4": {"k":"story","e":"38 - 20 * 1.6","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-007:q5": {"k":"story","e":"20 * (900 - (1.6 * 280 + 4 * 6 + 2.5 * 40))","sigs":[["17676","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-007:q6": {"k":"nm","e":"900 - (1.6 * 280 + 4 * 6 + 2.5 * 40)","opts":["diff","prod"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-008:q1": {"k":"story","e":"12 * 3.5 - 2 * 1.5 * 2","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-008:q2": {"k":"story","e":"1500 + 55 * (12 * 3.5 - 2 * 1.5 * 2)","sigs":[["186600","MISC-SILSILA-NOPRIORITY","NOPRIORITY"],["3804","MISC-AQWAS-IGNORED","IGNORED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-008:q3": {"k":"story","e":"800 + 75 * (12 * 3.5 - 2 * 1.5 * 2)","sigs":[["105000","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-008:q4": {"k":"dec","rule":"min","opts":["1500 + 55 * (12 * 3.5 - 2 * 1.5 * 2)","800 + 75 * (12 * 3.5 - 2 * 1.5 * 2)"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-008:q5": {"k":"yn","claim":["cmp","(800 + 75 * (12 * 3.5 - 2 * 1.5 * 2)) - (1500 + 55 * (12 * 3.5 - 2 * 1.5 * 2))","<","50"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-008:q6": {"k":"self","facts":[["1500 + 55 * 36","3480"],["800 + 75 * 36","3500"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-009:q1": {"k":"pc","truth":"{6400 + 32 * (45 + 120) | 32}","opts":[["{6400 + 32 * (45 + 120) | 32}",null,null],["6400 + 32 * (45 + 120) / 32","BARSPLIT","MISC-AQWAS-BARSPLIT"],["{6400 + 32 * 45 + 120 | 32}","MISPLACED","MISC-AQWAS-MISPLACED"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-009:q2": {"k":"story","e":"{6400 + 32 * (45 + 120) | 32}","sigs":[["6565","MISC-AQWAS-BARSPLIT","BARSPLIT"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-009:q3": {"k":"story","e":"6400 / 32 + 45 + 120","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-009:q4": {"k":"yn","claim":["cmp","{6400 + 32 * (45 + 120) | 32}","<=","400"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-009:q5": {"k":"nm","e":"{6400 + 32 * (45 + 120) | 32}","opts":["sum","quot"]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-009:q6": {"k":"self","facts":[["{6400 + 32 * (45 + 120) | 32}","365"],["6400 / 32 + 45 + 120","365"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-010:q1": {"k":"floor","e":"12000 / 37.5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-010:q2": {"k":"minf","pairs":[[12000,37.5],[280,1]],"sigs":[["320","MISC-SYN-AMALIYAT-MAXNOTMIN","MAX"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-010:q3": {"k":"story","e":"12000 - 280 * 37.5","sigs":[["439500","MISC-SILSILA-NOPRIORITY","NOPRIORITY"]]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-010:q4": {"k":"floor","e":"(12000 - 280 * 37.5) / 12.5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-010:q5": {"k":"story","e":"280 * 37.5 + 120 * 12.5","sigs":[]},
  "ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-l5-010:q6": {"k":"yn","claim":["cmp","280 * 37.5 + 120 * 12.5",">=","12000"]},
};
// </SPEC>

/* ── jugement ─────────────────────────────────────────────────────────────────────── */
const LET = 'ABCD';
function minPairs(pairs, how) {
  const fl = pairs.map(([s, d]) => floorQ(q0(s).div(q0(d))));
  const ce = pairs.map(([s, d]) => ceilQ(q0(s).div(q0(d))));
  const min = (a) => a.reduce((x, y) => (x < y ? x : y));
  const max = (a) => a.reduce((x, y) => (x > y ? x : y));
  if (how === 'MAX') return max(fl);
  if (how === 'ROUNDUP') return min(ce);
  if (how === 'MINROUND') return min(fl);
  return min(fl);
}
const valueOf = (sp) => {
  if (sp.k === 'floor') return String(floorQ(E(sp.e)));
  if (sp.k === 'minf') return String(minPairs(sp.pairs));
  return D(E(sp.e));
};
/** Les réponses justes d'une question (indépendantes du contenu). */
function judge(sp) {
  switch (sp.k) {
    case 'val': case 'story': case 'floor': case 'minf': return { answer: R(valueOf(sp)) };
    case 'pc': {
      const t = E(sp.truth);
      const flags = sp.opts.map(([c]) => E(c, false).eq(t));
      return { flags, answer: C(LET[flags.findIndex(Boolean)]) };
    }
    case 'vp': {
      const t = D(E(sp.e));
      const flags = sp.opts.map(([v]) => v === t);
      return { flags, answer: C(LET[flags.findIndex(Boolean)]) };
    }
    case 'yn': {
      const c = sp.claim;
      let truth;
      if (c[0] === 'eq') truth = E(c[1], false).eq(E(c[2], false));
      else {
        const a = E(c[1], false), b = E(c[3], false);
        truth = c[2] === '<' ? a.lt(b) : c[2] === '>' ? b.lt(a) : c[2] === '<=' ? !b.lt(a) : c[2] === '>=' ? !a.lt(b) : a.eq(b);
      }
      return { flags: [truth, !truth], answer: C(truth ? 'A' : 'B') };
    }
    case 'nm': {
      const name = lastOp(parse(sp.e));
      const flags = sp.opts.map((o) => o === name);
      return { flags, answer: C(LET[flags.findIndex(Boolean)]) };
    }
    case 'dec': { // « laquelle de deux offres / lequel de deux nombres est le plus petit (min) ou grand (max) » : options = deux chaînes
      const vs = sp.opts.map((o) => E(o));
      const best = sp.rule === 'min' ? vs.reduce((a, b) => (b.lt(a) ? b : a)) : vs.reduce((a, b) => (a.lt(b) ? b : a));
      const flags = vs.map((v) => v.eq(best));
      return { flags, answer: C(LET[flags.findIndex(Boolean)]) };
    }
    default: return { flags: null, answer: null };
  }
}

/** Les réponses justes, clé `<feuille>:<question>` ; les selfCheck n'ont pas de clé. */
export const ORACLE = {};
for (const [k, sp] of Object.entries(SPEC)) { const j = judge(sp); if (j.answer) ORACLE[k] = j.answer; }

/* ── Audit : relecture du contenu ─────────────────────────────────────────────────── */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/2am/wadiya-idmajiya-amaliyat-tabiiya-ushriya');
const FORBIDDEN = /الكتاب|ص\.\s*\d|خنزير|قمار|نرد|ورق اللعب|خمر|ربا |فائدة|يانصيب|ساحر|سحر|Fahrenheit|فهرنهايت|رعد|برق|بيوت العصافير|بيت العصافير/;
const TERM_SOURCES = new Set(['2am-s1-75:5', '2am-s1-84:5', '2am-s2-62:5', '2am-s2-71:5']);
const ADAPTED = new Set(['deep-37', 'deep-44', 'deep-45', 'deep-46', 'deep-51', 'deep-52']);
const PROVENANCE = { 1: [0, 10, 0], 2: [1, 7, 2], 3: [1, 6, 3], 4: [0, 9, 1], 5: [2, 8, 0] }; // term_exam / modelled / adapted
const LP = '2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1';
const KNOWN = new Set(['MISC-SILSILA-ADDFIRST', 'MISC-SILSILA-MULFIRST', 'MISC-SILSILA-NOPRIORITY', 'MISC-SILSILA-RIGHTLEFT', 'MISC-SILSILA-PARTIAL', 'MISC-SILSILA-STORYSIGN', 'MISC-SILSILA-STORYORDER',
  'MISC-AQWAS-IGNORED', 'MISC-AQWAS-DROPOUTER', 'MISC-AQWAS-BARSPLIT', 'MISC-AQWAS-CALCNOBRACKET', 'MISC-AQWAS-ALLUSELESS', 'MISC-AQWAS-ALLNEEDED', 'MISC-AQWAS-MISPLACED', 'MISC-AQWAS-IMPLICITX',
  'MISC-WASF-FIRSTOP', 'MISC-WASF-FIRSTWRITTEN', 'MISC-WASF-PIECES', 'MISC-WASF-ORDERDIFF', 'MISC-WASF-NOBRACKET',
  'MISC-TAWZI-FIRSTONLY', 'MISC-TAWZI-SIGNCHANGE', 'MISC-TAWZI-ADDK', 'MISC-TAWZI-FACTORMULT', 'MISC-TAWZI-FACTORWRONG', 'MISC-TAWZI-NOTATION',
  'MISC-SYN-AMALIYAT-ROUNDUP', 'MISC-SYN-AMALIYAT-MAXNOTMIN']);
const MISC = { NOPRIORITY: 'MISC-SILSILA-NOPRIORITY', ADDFIRST: 'MISC-SILSILA-ADDFIRST', MULFIRST: 'MISC-SILSILA-MULFIRST', IGNORED: 'MISC-AQWAS-IGNORED', BARSPLIT: 'MISC-AQWAS-BARSPLIT', ROUNDUP: 'MISC-SYN-AMALIYAT-ROUNDUP', MAX: 'MISC-SYN-AMALIYAT-MAXNOTMIN' };

/** Les îlots $...$ d'un texte, et leur lecture ASCII. */
const islands = (t) => [...String(t ?? '').matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
function braced(s, i) { // contenu du groupe { } commençant à s[i] === '{' ; renvoie [contenu, indice après]
  let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (d === 0) return [s.slice(i + 1, j), j + 1]; } }
  throw new Error('accolade non fermée');
}
export function lx2a(isl) {
  let s = String(isl).replace(/\{,\}/g, '.').replace(/\\mathrm\{DA\}/g, '').replace(/\\text\{[^}]*\}/g, '').replace(/\\[ ,;!]/g, ' ').replace(/\\times/g, '*').replace(/\\div/g, '/');
  for (let g = 0; g < 12; g++) {
    const i = s.indexOf('\\dfrac'); if (i < 0) break;
    const [a, j] = braced(s, i + 6); const [b, k] = braced(s, j);
    s = `${s.slice(0, i)}{${a}|${b}}${s.slice(k)}`;
  }
  return s.replace(/\s+/g, ' ').trim();
}
/** Un îlot qui est une chaîne d'égalités de pures chaînes d'opérations : ses morceaux, sinon null. */
function segments(isl) {
  if (/\\(neq|approx|leq|geq|ne|le|ge|ldots|cdots|ldots|dots|rightarrow|Rightarrow|text|quad|qquad)|[<>≠≈≤≥]|[A-Za-z]|\?/.test(isl.replace(/\\times|\\div|\\dfrac|\\mathrm\{DA\}/g, ''))) return null;
  const a = lx2a(isl);
  if (!/^[\d.+\-*/()[\]{}| =]+$/.test(a)) return null;
  const parts = a.split('=').map((x) => x.trim());
  if (parts.some((p) => !p)) return null;
  try { parts.forEach(parse); } catch { return null; }
  return parts;
}
const NUMS = (t) => (String(t).replace(/\{,\}/g, '.').replace(/(\d),(\d)/g, '$1.$2').match(/\d+(?:\.\d+)?/g) ?? []).map((x) => D(q0(x)));
const textOf = (sh) => [sh.statement.content, ...(sh.statement.formulas ?? []), ...sh.questions.flatMap((x) => [x.lead, x.statement, ...(x.choices ?? []).map((c) => c.content)])].join(' ');

export function audit(bank) {
  const problems = [];
  const sheets = {};
  try { for (const lv of readdirSync(ROOT)) for (const f of readdirSync(join(ROOT, lv))) { const d = JSON.parse(readFileSync(join(ROOT, lv, f), 'utf8')); sheets[d.id] = d; } } catch { /* banque absente */ }

  for (const { key, q } of bank) {
    const sp = SPEC[key];
    if (!sp) { problems.push(`${key} : aucune spec d'oracle`); continue; }
    const [sid] = key.split(':'); const sh = sheets[sid];
    const all = textOf(sh);
    const texts = [q.statement, q.lead, q.answerFormat, ...(q.hints ?? []).map((h) => h.content), q.feedback?.correct, q.feedback?.incorrect, ...(q.solution?.lines ?? []), q.solution?.result, ...(q.choices ?? []).map((c) => c.content)];
    for (const t of texts) {
      if (!t) continue;
      if (FORBIDDEN.test(t)) problems.push(`${key} : texte interdit dans « ${t} »`);
      for (const isl of islands(t)) {
        const seg = segments(isl); if (!seg) continue;
        if (sp.k === 'yn' && sp.claim[0] === 'eq' && t === q.statement) continue; // l'énoncé d'un oui / non peut affirmer une égalité fausse
        try {
          const vals = seg.map((x) => E(x, true));
          if (vals.some((v) => !v.eq(vals[0]))) problems.push(`${key} : égalités fausses dans « ${isl} »`);
        } catch (err) { problems.push(`${key} : ${err.message} dans « ${isl} »`); }
      }
    }
    if (q.learningPoints?.length !== 1 || q.learningPoints[0].code !== LP || q.learningPoints[0].role !== 'primary') problems.push(`${key} : la compétence primaire doit être ${LP}`);
    // les nombres d'une spec viennent de la feuille, ou sont la constante 2 (double / moitié), ou une réponse d'une autre question de la même feuille
    const have = new Set([...NUMS(all + ' ' + q.statement), '2', ...Object.entries(ORACLE).filter(([k2]) => k2.startsWith(`${sid}:`)).map(([, a]) => a.value).filter((x) => x !== undefined).map((x) => D(q0(x)))]);
    if (sp.k === 'minf') have.add('1');
    const sigsBank = (q.misconceptionSignatures ?? []).map((s) => `${D(q0(s.value))}|${s.id}`).sort();

    // ── réponses rationnelles
    if (['val', 'story', 'floor', 'minf'].includes(sp.k)) {
      if (q.answerType !== 'rational') problems.push(`${key} : genre ${sp.k} mais type ${q.answerType}`);
      const want = (sp.sigs ?? []).map(([v, id]) => `${v}|${id}`).sort();
      if (JSON.stringify(sigsBank) !== JSON.stringify(want)) problems.push(`${key} : signatures ${sigsBank.join(' ; ')} ≠ attendues ${want.join(' ; ')}`);
      const truth = valueOf(sp);
      for (const [v, id, how, w] of sp.sigs ?? []) {
        if (!KNOWN.has(id)) problems.push(`${key} : signature ${id} inconnue`);
        let r;
        if (sp.k === 'minf') r = String(minPairs(sp.pairs, how));
        else if (sp.k === 'floor' && how === 'ROUNDUP') r = String(ceilQ(E(sp.e)));
        else { const x = reading(how, sp.e, w); r = x ? D(x) : null; }
        if (r !== v) problems.push(`${key} : la lecture ${how} ne vaut pas ${v} (${r})`);
        if (MISC[how] && id !== MISC[how]) problems.push(`${key} : ${how} devrait porter ${MISC[how]}`);
        if (v === truth) problems.push(`${key} : la signature ${id} est la bonne réponse`);
      }
      if (sp.k === 'val') {
        const ok = islands(q.statement).some((i) => { const s = segments(i); return s && s.length === 1 && norm(s[0]) === norm(sp.e); });
        if (!ok) problems.push(`${key} : l'énoncé ne contient pas l'expression « ${sp.e} »`);
      } else {
        const nb = sp.k === 'minf' ? sp.pairs.flat() : NUMS(sp.e);
        for (const n of nb) if (!have.has(D(q0(n)))) problems.push(`${key} : le nombre ${n} de la spec n'est pas dans la feuille`);
      }
      if (q.expectedAnswer !== undefined && !/^\d+(\.\d+)?$/.test(String(q.expectedAnswer))) problems.push(`${key} : clé « ${q.expectedAnswer} » (décimal positif, point décimal)`);
      if (q.expectedAnswer !== undefined && String(q.expectedAnswer) !== truth) problems.push(`${key} : l'oracle calcule ${truth}, la feuille ${q.expectedAnswer}`);
      for (const [v] of sp.sigs ?? []) if (!isDec(q0(v))) problems.push(`${key} : signature non décimale`);
    } else if (q.misconceptionSignatures?.length) problems.push(`${key} : signatures sur une question de genre ${sp.k}`);

    // ── QCM
    if (q.answerType === 'choice') {
      const j = judge(sp);
      if (!j.answer) { problems.push(`${key} : genre ${sp.k} n'est pas un QCM`); continue; }
      if (q.choices.filter((c) => c.isCorrect).length !== 1) problems.push(`${key} : plusieurs options marquées justes`);
      if (j.flags.filter(Boolean).length !== 1) problems.push(`${key} : l'oracle trouve ${j.flags.filter(Boolean).length} options vraies`);
      const markedIdx = q.choices.findIndex((c) => c.isCorrect);
      if (j.flags.length !== q.choices.length) problems.push(`${key} : ${q.choices.length} options contre ${j.flags.length} dans la spec`);
      if (j.flags[markedIdx] !== true) problems.push(`${key} : l'oracle juge ${j.answer.choiceId}, la feuille marque ${q.choices[markedIdx]?.id}`);
      const isl0 = (c) => lx2a(islands(c.content)[0] ?? '');
      const exempt = sp.k === 'dec' || (sp.k === 'yn' && sp.claim[0] === 'cmp');
      q.choices.forEach((c) => {
        if (c.isCorrect) { if (c.misconceptionId) problems.push(`${key} : l'option juste ${c.id} porte une misconception`); return; }
        if (c.misconceptionId && !KNOWN.has(c.misconceptionId)) problems.push(`${key} : ${c.misconceptionId} inconnue`);
        if (!exempt && !c.misconceptionId && !(sp.k === 'yn')) problems.push(`${key} : le distracteur ${c.id} ne porte pas de misconception nommée`);
      });
      if (sp.k === 'pc') {
        const truth = norm(sp.truth);
        sp.opts.forEach(([a, how, m], k) => {
          const raw = isl0(q.choices[k]).replace(/\s*=\s*$/, '');
          let okRead = false; try { okRead = norm(raw) === norm(a); } catch { okRead = false; }
          if (!okRead) problems.push(`${key} : l'option ${q.choices[k].id} relue « ${raw} » ≠ « ${a} »`);
          if (j.flags[k]) return;
          if (q.choices[k].misconceptionId !== m) problems.push(`${key} : ${q.choices[k].id} devrait porter ${m}`);
          if (how === 'IGNORED' && norm(stripS(parse(sp.truth))) !== norm(a)) problems.push(`${key} : « ${a} » n'est pas la lecture IGNORED de « ${sp.truth} »`);
          if (how === 'MISPLACED' && (flatTokens(a) !== flatTokens(sp.truth) || norm(a) === truth)) problems.push(`${key} : « ${a} » n'a pas les mêmes nombres et opérations que « ${sp.truth} » avec d'autres parenthèses`);
        });
        const stmtOk = (sp.show ?? null) === null || islands(q.statement).some((i) => { const s = segments(i); return s && norm(s[0]) === norm(sp.show); });
        if (!stmtOk) problems.push(`${key} : l'énoncé ne montre pas « ${sp.show} »`);
      }
      if (sp.k === 'vp') {
        const t = E(sp.e);
        sp.opts.forEach(([v, how, w], k) => {
          const lit = NUMS(q.choices[k].content)[0];
          if (lit !== v) problems.push(`${key} : l'option ${q.choices[k].id} relue « ${lit} » ≠ « ${v} »`);
          if (j.flags[k]) return;
          const r = reading(how, sp.e, w);
          if (!r || D(r) !== v) problems.push(`${key} : la lecture ${how} de « ${sp.e} » ne vaut pas ${v}`);
          if (MISC[how] ? q.choices[k].misconceptionId !== MISC[how] : !q.choices[k].misconceptionId) problems.push(`${key} : ${q.choices[k].id} : misconception attendue ${MISC[how] ?? '(nommée)'}`);
          if (q0(v).eq(t)) problems.push(`${key} : l'option ${q.choices[k].id} vaut la bonne valeur`);
        });
        const ok = sp.show === undefined || islands(`${sh.statement.content} ${q.statement}`).some((i) => { const s = segments(i); return s && norm(s[0]) === norm(sp.show ?? sp.e); });
        if (!ok) problems.push(`${key} : l'énoncé ne montre pas « ${sp.show ?? sp.e} »`);
      }
      if (sp.k === 'yn') {
        const c = sp.claim;
        if (c[0] === 'eq') {
          const ok = islands(q.statement).some((i) => { const a = lx2a(i); const parts = a.split('=').map((x) => x.trim()); return parts.length === 2 && norm(parts[0]) === norm(c[1]) && norm(parts[1]) === norm(c[2]); });
          if (!ok) problems.push(`${key} : l'énoncé ne contient pas « ${c[1]} = ${c[2]} »`);
        } else {
          for (const nb of [...NUMS(c[1]), ...NUMS(c[3])]) if (!have.has(nb)) problems.push(`${key} : le nombre ${nb} de la comparaison n'est pas dans la feuille`);
        }
        if (q.choices.length !== 2 || !/^نعم/.test(q.choices[0].content) || !/^لا/.test(q.choices[1].content)) problems.push(`${key} : un oui / non attend « نعم » puis « لا »`);
      }
      if (sp.k === 'yn' && sp.claim[0] === 'cmp') { // un distracteur nommé doit être la lecture fautive qui renverse la décision
        const wrong = q.choices.find((c) => !c.isCorrect);
        if (wrong?.misconceptionId) {
          const rhs = E(sp.claim[3], false); const truth = j.flags[0];
          const okRead = ['IGNORED', 'NOPRIORITY', 'BARSPLIT'].some((how) => {
            if (MISC[how] !== wrong.misconceptionId) return false;
            const r = reading(how, sp.claim[1]); if (!r) return false;
            const c2 = sp.claim[2]; const t2 = c2 === '<' ? r.lt(rhs) : c2 === '>' ? rhs.lt(r) : c2 === '<=' ? !rhs.lt(r) : !r.lt(rhs);
            return t2 !== truth;
          });
          if (!okRead) problems.push(`${key} : ${wrong.misconceptionId} ne renverse pas la décision`);
        }
      }
      if (sp.k === 'dec') {
        q.choices.forEach((c, k) => {
          if (c.isCorrect || !c.misconceptionId) return;
          const how = Object.keys(MISC).find((h) => MISC[h] === c.misconceptionId);
          const rs = sp.opts.map((o) => reading(how, o));
          const best = rs.every(Boolean) ? (sp.rule === 'min' ? rs.reduce((a, b) => (b.lt(a) ? b : a)) : rs.reduce((a, b) => (a.lt(b) ? b : a))) : null;
          if (!best || !rs[k].eq(best)) problems.push(`${key} : ${c.misconceptionId} ne désigne pas l'option ${c.id} comme la meilleure`);
        });
      }
      if (sp.k === 'nm') {
        const ok = islands(q.statement).some((i) => { const s = segments(i); return s && norm(s[0]) === norm(sp.e); });
        if (!ok) problems.push(`${key} : l'énoncé ne contient pas l'expression « ${sp.e} »`);
        const ast = parse(sp.e); const fo = firstOp(ast); const fw = firstWritten(show(ast)); const name = lastOp(ast);
        sp.opts.forEach((o, k) => {
          if (q.choices[k].content.trim() !== NAMES_AR[o]) problems.push(`${key} : l'option ${q.choices[k].id} « ${q.choices[k].content} » ≠ « ${NAMES_AR[o]} »`);
          if (o === name) return;
          const want = o === fo ? 'MISC-WASF-FIRSTOP' : o === fw ? 'MISC-WASF-FIRSTWRITTEN' : null;
          if (!want) problems.push(`${key} : l'option « ${NAMES_AR[o]} » n'est ni la première opération effectuée ni le premier signe écrit`);
          else if (q.choices[k].misconceptionId !== want && !(o === fo && o === fw && q.choices[k].misconceptionId === 'MISC-WASF-FIRSTWRITTEN')) problems.push(`${key} : l'option « ${NAMES_AR[o]} » devrait porter ${want}`);
        });
      }
      if (sp.k === 'dec') {
        sp.opts.forEach((o, k) => { const lit = lx2a(islands(q.choices[k].content)[0] ?? ''); if (lit && lit !== '' && !/[؀-ۿ]/.test(q.choices[k].content) && norm(lit) !== norm(o)) problems.push(`${key} : l'option ${q.choices[k].id} relue ≠ « ${o} »`); });
      }
    }
    if (sp.k === 'self') {
      const lines = (q.solution?.lines ?? []).join(' ').replace(/\{,\}/g, '.');
      for (const [a, v] of sp.facts) {
        if (!E(a, false).eq(q0(v))) problems.push(`${key} : « ${a} » ne vaut pas ${v}`);
        if (!NUMS(lines).includes(D(q0(v)))) problems.push(`${key} : le corrigé ne cite pas ${v}`);
      }
      if (q.counted !== undefined) problems.push(`${key} : selfCheck marquée counted`);
    }
    if (sp.k === 'self' && q.answerType !== 'selfCheck') problems.push(`${key} : genre self mais type ${q.answerType}`);
  }

  /* niveau fichier : 50 feuilles, provenance, textes */
  const files = Object.values(sheets);
  if (files.length !== 50) problems.push(`la banque compte ${files.length} feuilles au lieu de 50`);
  const seenTE = new Set();
  for (let lv = 1; lv <= 5; lv++) {
    const L = files.filter((x) => x.level === lv);
    if (L.length !== 10) problems.push(`niveau ${lv} : ${L.length} feuilles au lieu de 10`);
    const got = [L.filter((x) => x.metadata.source.type === 'term_exam').length, L.filter((x) => x.metadata.source.type === 'platform_addition').length, L.filter((x) => x.metadata.source.type === 'textbook').length];
    if (JSON.stringify(got) !== JSON.stringify(PROVENANCE[lv])) problems.push(`niveau ${lv} : provenance ${got.join('/')} au lieu de ${PROVENANCE[lv].join('/')}`);
  }
  for (const ex of files) {
    const s = ex.metadata.source;
    const all = [ex.metadata.title, ...(ex.metadata.tags ?? []), ex.statement.content, ...(ex.statement.formulas ?? [])];
    for (const t of all) if (t && FORBIDDEN.test(t)) problems.push(`${ex.id} : texte interdit dans « ${String(t).slice(0, 60)} »`);
    for (const t of all) for (const isl of islands(t)) { const seg = segments(isl); if (seg) try { const v = seg.map((x) => E(x, true)); if (v.some((x) => !x.eq(v[0]))) problems.push(`${ex.id} : égalités fausses dans « ${isl} »`); } catch (err) { problems.push(`${ex.id} : ${err.message} dans « ${isl} »`); } }
    if (s.type === 'term_exam') {
      const k = `${s.file}:${s.exercise}`;
      if (!TERM_SOURCES.has(k)) problems.push(`${ex.id} : sujet ${s.file} ex ${s.exercise} non lu pour cette banque`);
      if (seenTE.has(k)) problems.push(`${ex.id} : le sujet ${k} est cité deux fois`);
      seenTE.add(k);
    }
    if (s.type === 'textbook') { if (!ADAPTED.has(s.elementId)) problems.push(`${ex.id} : élément ${s.elementId} non prévu`); if (ex.metadata.exam.kind !== 'adapted') problems.push(`${ex.id} : une feuille du manuel doit être « adapted »`); }
    if (ex.metadata.exam.kind === 'official' || ex.metadata.exam.kind === 'excerpt') problems.push(`${ex.id} : jamais officiel en 2AM`);
    if (s.type === 'platform_addition' && (s.reason !== 'term_exam_modelled' || !/^2am-s[12]$/.test(s.modelledOn ?? ''))) problems.push(`${ex.id} : provenance modelled incorrecte`);
  }
  const adaptedSeen = new Set(files.filter((x) => x.metadata.source.type === 'textbook').map((x) => x.metadata.source.elementId));
  for (const a of ADAPTED) if (!adaptedSeen.has(a)) problems.push(`l'élément ${a} n'est cité par aucune feuille`);
  return problems;
}
