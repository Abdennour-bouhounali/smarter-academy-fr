// Oracle du banc « talim-mustaqim-mudarraj-2 » (التعليم على مستقيم مدرّج, 2AM, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, en arithmétique indépendante sur les DÉCIMAUX :
//  - un nombre relatif écrit « -0.75 » devient un BigInt à l'échelle 10^6 (aucun flottant, aucun import de packages/core) ;
//  - une abscisse se recalcule par « nombre de graduations × valeur d'une graduation », signé par le côté (gauche −, droite +) ;
//    le nombre de graduations d'une abscisse donnée est le QUOTIENT exact (refusé s'il n'est pas entier) ; un changement
//    d'origine est une SOUSTRACTION ; l'opposé est le changement de signe ; la distance au zéro est la valeur absolue ;
//  - « graduation convenable » : parmi les graduations proposées, celle pour laquelle TOUTES les abscisses tombent sur une
//    graduation (reste nul) ET à au plus `half` graduations de l'origine ; il doit y en avoir exactement une (la plus petite
//    de la liste proposée qui convienne) ; une graduation trop petite (TOOSMALL) laisse un point hors de la droite alors que
//    toutes les abscisses sont des multiples, une graduation trop grande (TOOBIG) laisse un point entre deux graduations ;
//  - chaque QCM n'a qu'une option juste : chaque option est retapée en valeur (ordre = ordre des choix du fichier) et jugée
//    par le calcul ; chaque distracteur nommé MISC-TALIM2-* est RECALCULÉ à partir de son erreur (voir FORMULA) et est faux ;
//  - audit(bank) relit les fichiers : clé rationnelle égale au calcul, option juste unique, valeur de chaque option égale à
//    celle retapée ici, signature / distracteur égaux à l'erreur nommée.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { R, C } from './helpers.mjs';

/* ── énoncés retapés : paramètres de chaque question et options (dans l'ordre des choix) ── */
const SPECS = [
  {"kind":"read","n":6,"side":-1,"step":"1","mode":"r","sigs":["MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-001:q1"},
  {"kind":"read","n":4,"side":1,"step":"1","mode":"r","sigs":["MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-001:q2"},
  {"kind":"oppPoint","g":"-6","mode":"r","sigs":["MISC-TALIM2-OPPSAME"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-001:q3"},
  {"kind":"read","n":3,"side":-1,"step":"5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-002:q1"},
  {"kind":"read","n":2,"side":1,"step":"5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-002:q2"},
  {"kind":"read","n":5,"side":-1,"step":"5","mode":"c","opts":[{"v":"-10","misc":"MISC-TALIM2-ADDSTEP"},{"v":"-25"},{"v":"25","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"-5","misc":"MISC-TALIM2-UNITIGNORED"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-002:q3"},
  {"kind":"opp","a":"-5","mode":"c","opts":[{"v":"5"},{"v":"-5","misc":"MISC-TALIM2-OPPSAME"},{"v":"-0.2","misc":"MISC-TALIM2-RECIP"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-003:q1"},
  {"kind":"opp","a":"-8","mode":"c","opts":[{"v":"-8","misc":"MISC-TALIM2-OPPSAME"},{"v":"8"},{"v":"-0.125","misc":"MISC-TALIM2-RECIP"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-003:q2"},
  {"kind":"opp","a":"7.5","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-DIGITSWAP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-003:q3"},
  {"kind":"read","n":4,"side":-1,"step":"10","mode":"c","opts":[{"v":"40","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"-40"},{"v":"-4","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"-14","misc":"MISC-TALIM2-ADDSTEP"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-004:q1"},
  {"kind":"read","n":7,"side":1,"step":"10","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-004:q2"},
  {"kind":"read","n":1,"side":-1,"step":"10","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-004:q3"},
  {"kind":"read","n":3,"side":-1,"step":"0.1","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-005:q1"},
  {"kind":"read","n":8,"side":1,"step":"0.1","mode":"c","opts":[{"v":"8.1","misc":"MISC-TALIM2-ADDSTEP"},{"v":"-0.8","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"8","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"0.8"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-005:q2"},
  {"kind":"read","n":5,"side":-1,"step":"0.1","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-005:q3"},
  {"kind":"read","n":3,"side":-1,"step":"0.25","mode":"c","opts":[{"v":"0.75","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"-3.25","misc":"MISC-TALIM2-ADDSTEP"},{"v":"-3","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"-0.75"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-006:q1"},
  {"kind":"read","n":5,"side":1,"step":"0.25","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-006:q2"},
  {"kind":"read","n":2,"side":-1,"step":"0.25","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-006:q3"},
  {"kind":"opp","a":"-2.5","mode":"c","opts":[{"v":"2.5"},{"v":"5.2","misc":"MISC-TALIM2-DIGITSWAP"},{"v":"-0.4","misc":"MISC-TALIM2-RECIP"},{"v":"-2.5","misc":"MISC-TALIM2-OPPSAME"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-007:q1"},
  {"kind":"opp","a":"4.5","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-DIGITSWAP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-007:q2"},
  {"kind":"opp","a":"-0.4","mode":"c","opts":[{"v":"-2.5","misc":"MISC-TALIM2-RECIP"},{"v":"0.4"},{"v":"-0.4","misc":"MISC-TALIM2-OPPSAME"},{"v":"4","misc":"MISC-TALIM2-DIGITSWAP"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-007:q3"},
  {"kind":"read","n":3,"side":-1,"step":"5","mode":"c","opts":[{"v":"-15"},{"v":"-3","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"15","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"-8","misc":"MISC-TALIM2-ADDSTEP"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-008:q1"},
  {"kind":"read","n":6,"side":1,"step":"2","mode":"c","opts":[{"v":"6","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"8","misc":"MISC-TALIM2-ADDSTEP"},{"v":"12"},{"v":"-12","misc":"MISC-TALIM2-SIGNSIDE"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-008:q2"},
  {"kind":"oppPoint","g":"-15","mode":"r","sigs":["MISC-TALIM2-OPPSAME"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-008:q3"},
  {"kind":"distzero","a":"-7.5","mode":"r","sigs":["MISC-TALIM2-NEGDIST"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-009:q1"},
  {"kind":"distzero","a":"12","mode":"c","opts":[{"v":"13"},{"v":"12"},{"v":"24"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-009:q2"},
  {"kind":"pts","step":"5","pts":[[3,-1],[2,-1],[3,1],[4,1]],"ask":"opppair","mode":"c","opts":[{"v":["A","D"]},{"v":["A","C"]},{"v":["A","B"]},{"v":["B","C"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-009:q3"},
  {"kind":"read","n":4,"side":-1,"step":"10","mode":"c","opts":[{"v":"-40"},{"v":"40","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"-4","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"-14","misc":"MISC-TALIM2-ADDSTEP"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-010:q1"},
  {"kind":"opp","a":"-40","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-010:q2"},
  {"kind":"distzero","a":"-40","mode":"r","sigs":["MISC-TALIM2-NEGDIST"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l1-010:q3"},
  {"kind":"placecount","x":"-4","step":"1","mode":"r","sigs":["MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-001:q1"},
  {"kind":"betw","x":"3.5","step":"1","mode":"c","opts":[{"v":["4","5"]},{"v":["-4","-3"],"misc":"MISC-TALIM2-SIGNSIDE"},{"v":["2","3"]},{"v":["3","4"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-001:q2"},
  {"kind":"betw","x":"-1.5","step":"1","mode":"c","opts":[{"v":["-3","-2"]},{"v":["1","2"],"misc":"MISC-TALIM2-SIGNSIDE"},{"v":["-2","-1"]},{"v":["-1","0"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-001:q3"},
  {"kind":"placecount","x":"-1.5","step":"0.5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-002:q1"},
  {"kind":"placecount","x":"2","step":"0.5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-002:q2"},
  {"kind":"placecount","x":"0.5","step":"0.5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-002:q3"},
  {"kind":"placecount","x":"-1.75","step":"0.25","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-003:q1"},
  {"kind":"placecount","x":"2.5","step":"0.25","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-003:q2"},
  {"kind":"placecount","x":"0.75","step":"0.25","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-003:q3"},
  {"kind":"fit","values":["-30","45","60","-15"],"half":6,"opts":[{"v":"5","misc":"MISC-TALIM2-TOOSMALL"},{"v":"10","misc":"MISC-TALIM2-TOOBIG"},{"v":"15"},{"v":"20","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l2-004:q1"},
  {"kind":"placecount","x":"45","step":"15","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-004:q2"},
  {"kind":"fit","values":["-200","400","600"],"half":6,"opts":[{"v":"75","misc":"MISC-TALIM2-TOOBIG"},{"v":"100"},{"v":"50","misc":"MISC-TALIM2-TOOSMALL"},{"v":"150","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l2-005:q1"},
  {"kind":"placecount","x":"-200","step":"100","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-005:q2"},
  {"kind":"placecount","x":"600","step":"100","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-005:q3"},
  {"kind":"fit","values":["0.3","-0.5","-0.1","0.6"],"half":6,"opts":[{"v":"0.2","misc":"MISC-TALIM2-TOOBIG"},{"v":"0.05","misc":"MISC-TALIM2-TOOSMALL"},{"v":"0.25","misc":"MISC-TALIM2-TOOBIG"},{"v":"0.1"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l2-006:q1"},
  {"kind":"placecount","x":"-0.5","step":"0.1","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-006:q2"},
  {"kind":"fit","values":["0","100","-20","40"],"half":6,"opts":[{"v":"25","misc":"MISC-TALIM2-TOOBIG"},{"v":"20"},{"v":"10","misc":"MISC-TALIM2-TOOSMALL"},{"v":"5","misc":"MISC-TALIM2-TOOSMALL"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l2-007:q1"},
  {"kind":"placecount","x":"40","step":"20","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-007:q2"},
  {"kind":"half","n":3,"side":-1,"step":"10","mode":"r","sigs":["MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-008:q1"},
  {"kind":"betw","x":"45","step":"10","mode":"c","opts":[{"v":["-50","-40"],"misc":"MISC-TALIM2-SIGNSIDE"},{"v":["40","50"]},{"v":["50","60"]},{"v":["30","40"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-008:q2"},
  {"kind":"read","n":2,"side":1,"step":"10","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE","MISC-TALIM2-ADDSTEP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-008:q3"},
  {"kind":"placecount","x":"-35","step":"5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-009:q1"},
  {"kind":"placecount","x":"20","step":"5","mode":"c","opts":[{"v":"20","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"4"},{"v":"-4","misc":"MISC-TALIM2-SIGNSIDE"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-009:q2"},
  {"kind":"side","x":"-5.5","mode":"c","opts":[{"v":"R","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"L"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-009:q3"},
  {"kind":"fit","values":["-12","18","24"],"half":6,"opts":[{"v":"3","misc":"MISC-TALIM2-TOOSMALL"},{"v":"2","misc":"MISC-TALIM2-TOOSMALL"},{"v":"6"},{"v":"4","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l2-010:q1"},
  {"kind":"placecount","x":"18","step":"6","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l2-010:q2"},
  {"kind":"placecount","x":"6","step":"2","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-001:q1"},
  {"kind":"placecount","x":"-2","step":"2","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-001:q2"},
  {"kind":"oppPoint","g":"2","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-001:q3"},
  {"kind":"stepof","n":4,"x":"2","mode":"r","sigs":[],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-002:q1"},
  {"kind":"placecount","x":"1.5","step":"0.5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-002:q2"},
  {"kind":"placecount","x":"-1","step":"0.5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-002:q3"},
  {"kind":"neworigin","X":"1970","Xo":"1990","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-003:q1"},
  {"kind":"placecount","x":"-20","step":"5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-003:q2"},
  {"kind":"placecount","x":"30","step":"5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-003:q3"},
  {"kind":"neworigin","X":"30","Xo":"-20","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-004:q1"},
  {"kind":"neworigin","X":"0","Xo":"-20","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-004:q2"},
  {"kind":"oppPoint","g":"-20","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-004:q3"},
  {"kind":"read","n":4,"side":-1,"step":"5","mode":"c","opts":[{"v":"-4","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"-20"},{"v":"-9","misc":"MISC-TALIM2-ADDSTEP"},{"v":"20","misc":"MISC-TALIM2-SIGNSIDE"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-005:q1"},
  {"kind":"opp","a":"-20","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-005:q2"},
  {"kind":"neworigin","X":"-20","Xo":"10","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-005:q3"},
  {"kind":"read","n":3,"side":-1,"step":"0.5","mode":"c","opts":[{"v":"-3","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"-1.5"},{"v":"-3.5","misc":"MISC-TALIM2-ADDSTEP"},{"v":"1.5","misc":"MISC-TALIM2-SIGNSIDE"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-006:q1"},
  {"kind":"opp","a":"-1.5","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-DIGITSWAP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-006:q2"},
  {"kind":"neworigin","X":"-1.5","Xo":"0.5","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-006:q3"},
  {"kind":"distzero","a":"-3","mode":"r","sigs":["MISC-TALIM2-NEGDIST"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-007:q1"},
  {"kind":"opp","a":"4","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-007:q2"},
  {"kind":"neworigin","X":"-3","Xo":"2","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-007:q3"},
  {"kind":"read","n":7,"side":-1,"step":"0.5","mode":"c","opts":[{"v":"-3.5"},{"v":"-7.5","misc":"MISC-TALIM2-ADDSTEP"},{"v":"-7","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"3.5","misc":"MISC-TALIM2-SIGNSIDE"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-008:q1"},
  {"kind":"opp","a":"-3.5","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-DIGITSWAP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-008:q2"},
  {"kind":"distzero","a":"-3.5","mode":"r","sigs":["MISC-TALIM2-NEGDIST"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-008:q3"},
  {"kind":"fit","values":["-24","36","60"],"half":6,"opts":[{"v":"4","misc":"MISC-TALIM2-TOOSMALL"},{"v":"6","misc":"MISC-TALIM2-TOOSMALL"},{"v":"3","misc":"MISC-TALIM2-TOOSMALL"},{"v":"12"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l3-009:q1"},
  {"kind":"placecount","x":"36","step":"12","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-009:q2"},
  {"kind":"opp","a":"-24","mode":"r","sigs":["MISC-TALIM2-OPPSAME"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-009:q3"},
  {"kind":"stepof","n":6,"x":"-30","mode":"r","sigs":[],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-010:q1"},
  {"kind":"half","n":2,"side":1,"step":"5","mode":"r","sigs":["MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-010:q2"},
  {"kind":"neworigin","X":"-30","Xo":"-10","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l3-010:q3"},
  {"kind":"ptsread","step":"5","pts":[[2,-1],[4,1],[3,-1],[0,1]],"idx":2,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-001:q1"},
  {"kind":"pts","step":"5","pts":[[2,-1],[4,1],[3,-1],[0,1]],"ask":"min","mode":"c","opts":[{"v":"B"},{"v":"A"},{"v":"C"},{"v":"D"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-001:q2"},
  {"kind":"pts","step":"5","pts":[[2,-1],[4,1],[3,-1],[0,1]],"ask":"order","mode":"c","opts":[{"v":["-15","-10","0","20"]},{"v":["0","-10","-15","20"]},{"v":["20","-15","-10","0"]},{"v":["20","0","-10","-15"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-001:q3"},
  {"kind":"ptsread","step":"10","pts":[[5,-1],[2,1],[2,-1],[6,1]],"idx":0,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-002:q1"},
  {"kind":"pts","step":"10","pts":[[5,-1],[2,1],[2,-1],[6,1]],"ask":"max","mode":"c","opts":[{"v":"B"},{"v":"A"},{"v":"D"},{"v":"C"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-002:q2"},
  {"kind":"pts","step":"10","pts":[[5,-1],[2,1],[2,-1],[6,1]],"ask":"opppair","mode":"c","opts":[{"v":["B","C"]},{"v":["A","C"]},{"v":["A","B"]},{"v":["A","D"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-002:q3"},
  {"kind":"ptsread","step":"0.5","pts":[[3,-1],[1,1],[4,1],[2,-1]],"idx":3,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-003:q1"},
  {"kind":"pts","step":"0.5","pts":[[3,-1],[1,1],[4,1],[2,-1]],"ask":"count","mode":"r","sigs":[],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-003:q2"},
  {"kind":"pts","step":"0.5","pts":[[3,-1],[1,1],[4,1],[2,-1]],"ask":"order","mode":"c","opts":[{"v":["-1.5","-1","0.5","2"]},{"v":["2","-1.5","-1","0.5"]},{"v":["2","0.5","-1","-1.5"]},{"v":["0.5","-1","-1.5","2"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-003:q3"},
  {"kind":"ptsread","step":"100","pts":[[2,1],[3,-1],[0,1],[1,-1],[5,1]],"idx":1,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-004:q1"},
  {"kind":"pts","step":"100","pts":[[2,1],[3,-1],[0,1],[1,-1],[5,1]],"ask":"min","mode":"c","opts":[{"v":"C"},{"v":"D"},{"v":"A"},{"v":"B"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-004:q2"},
  {"kind":"pts","step":"100","pts":[[2,1],[3,-1],[0,1],[1,-1],[5,1]],"ask":"order","mode":"c","opts":[{"v":["0","-100","200","-300","500"]},{"v":["500","-300","200","-100","0"]},{"v":["500","200","0","-100","-300"]},{"v":["-300","-100","0","200","500"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-004:q3"},
  {"kind":"ptsread","step":"0.25","pts":[[3,-1],[2,1],[5,-1],[1,1]],"idx":2,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-005:q1"},
  {"kind":"pts","step":"0.25","pts":[[3,-1],[2,1],[5,-1],[1,1]],"ask":"min","mode":"c","opts":[{"v":"B"},{"v":"A"},{"v":"D"},{"v":"C"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-005:q2"},
  {"kind":"pts","step":"0.25","pts":[[3,-1],[2,1],[5,-1],[1,1]],"ask":"order","mode":"c","opts":[{"v":["0.25","0.5","-0.75","-1.25"]},{"v":["-1.25","-0.75","0.5","0.25"]},{"v":["0.5","0.25","-0.75","-1.25"]},{"v":["-1.25","-0.75","0.25","0.5"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-005:q3"},
  {"kind":"ptsread","step":"2","pts":[[4,-1],[1,1],[3,1],[4,1]],"idx":0,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-006:q1"},
  {"kind":"pts","step":"2","pts":[[4,-1],[1,1],[3,1],[4,1]],"ask":"max","mode":"c","opts":[{"v":"D"},{"v":"B"},{"v":"A"},{"v":"C"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-006:q2"},
  {"kind":"pts","step":"2","pts":[[4,-1],[1,1],[3,1],[4,1]],"ask":"opppair","mode":"c","opts":[{"v":["A","B"]},{"v":["A","D"]},{"v":["B","C"]},{"v":["A","C"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-006:q3"},
  {"kind":"ptsread","step":"20","pts":[[3,-1],[1,-1],[2,1],[5,1]],"idx":2,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-007:q1"},
  {"kind":"pts","step":"20","pts":[[3,-1],[1,-1],[2,1],[5,1]],"ask":"count","mode":"r","sigs":[],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-007:q2"},
  {"kind":"pts","step":"20","pts":[[3,-1],[1,-1],[2,1],[5,1]],"ask":"order","mode":"c","opts":[{"v":["100","-60","40","-20"]},{"v":["100","40","-20","-60"]},{"v":["-20","40","-60","100"]},{"v":["-60","-20","40","100"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-007:q3"},
  {"kind":"ptsread","step":"0.1","pts":[[4,-1],[7,1],[1,-1],[2,1]],"idx":1,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-008:q1"},
  {"kind":"pts","step":"0.1","pts":[[4,-1],[7,1],[1,-1],[2,1]],"ask":"min","mode":"c","opts":[{"v":"C"},{"v":"A"},{"v":"B"},{"v":"D"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-008:q2"},
  {"kind":"pts","step":"0.1","pts":[[4,-1],[7,1],[1,-1],[2,1]],"ask":"order","mode":"c","opts":[{"v":["0.7","-0.4","0.2","-0.1"]},{"v":["0.7","0.2","-0.1","-0.4"]},{"v":["-0.1","0.2","-0.4","0.7"]},{"v":["-0.4","-0.1","0.2","0.7"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-008:q3"},
  {"kind":"ptsread","step":"25","pts":[[4,-1],[3,1],[1,-1],[2,1],[0,1]],"idx":2,"mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-009:q1"},
  {"kind":"pts","step":"25","pts":[[4,-1],[3,1],[1,-1],[2,1],[0,1]],"ask":"max","mode":"c","opts":[{"v":"C"},{"v":"A"},{"v":"B"},{"v":"D"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-009:q2"},
  {"kind":"pts","step":"25","pts":[[4,-1],[3,1],[1,-1],[2,1],[0,1]],"ask":"order","mode":"c","opts":[{"v":["75","50","0","-25","-100"]},{"v":["-100","75","50","-25","0"]},{"v":["0","-25","50","75","-100"]},{"v":["-100","-25","0","50","75"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-009:q3"},
  {"kind":"ptsread","step":"1","pts":[[3,-1],[3,1],[5,-1],[1,1]],"idx":2,"mode":"r","sigs":["MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-010:q1"},
  {"kind":"pts","step":"1","pts":[[3,-1],[3,1],[5,-1],[1,1]],"ask":"opppair","mode":"c","opts":[{"v":["A","B"]},{"v":["B","C"]},{"v":["A","D"]},{"v":["A","C"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-010:q2"},
  {"kind":"pts","step":"1","pts":[[3,-1],[3,1],[5,-1],[1,1]],"ask":"order","mode":"c","opts":[{"v":["-5","3","-3","1"]},{"v":["1","-3","3","-5"]},{"v":["3","1","-3","-5"]},{"v":["-5","-3","1","3"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l4-010:q3"},
  {"kind":"neworigin","X":"1985","Xo":"2000","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-001:q1"},
  {"kind":"neworigin","X":"2025","Xo":"2000","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-001:q2"},
  {"kind":"pts","step":"5","pts":[[3,-1],[2,-1],[2,1],[5,1]],"ask":"opppair","mode":"c","opts":[{"v":["B","C"]},{"v":["A","B"]},{"v":["A","D"]},{"v":["A","C"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-001:q3"},
  {"kind":"fit","values":["-15","-10","10","25"],"half":6,"opts":[{"v":"5"},{"v":"10","misc":"MISC-TALIM2-TOOBIG"},{"v":"2","misc":"MISC-TALIM2-TOOBIG"},{"v":"1","misc":"MISC-TALIM2-TOOSMALL"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l5-001:q4"},
  {"kind":"neworigin","X":"2025","Xo":"1990","mode":"c","opts":[{"v":"35"},{"v":"2025","misc":"MISC-TALIM2-ORIGINFIXED"},{"v":"-35","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"4015","misc":"MISC-TALIM2-ADDORIGIN"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-001:q5"},
  {"kind":"fit","values":["1.5","0.75","-0.75","-2.25"],"half":6,"opts":[{"v":"1","misc":"MISC-TALIM2-TOOBIG"},{"v":"0.25","misc":"MISC-TALIM2-TOOSMALL"},{"v":"0.75"},{"v":"0.5","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l5-002:q1"},
  {"kind":"placecount","x":"-2.25","step":"0.75","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-002:q2"},
  {"kind":"pts","step":"0.75","pts":[[2,1],[1,1],[1,-1],[3,-1]],"ask":"opppair","mode":"c","opts":[{"v":["A","C"]},{"v":["B","C"]},{"v":["A","D"]},{"v":["A","B"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-002:q4"},
  {"kind":"distzero","a":"-2.25","mode":"r","sigs":["MISC-TALIM2-NEGDIST"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-002:q5"},
  {"kind":"neworigin","X":"-2.25","Xo":"0.75","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-002:q6"},
  {"kind":"distzero","a":"-3","mode":"r","sigs":["MISC-TALIM2-NEGDIST"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-003:q1"},
  {"kind":"opp","a":"4","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-003:q2"},
  {"kind":"neworigin","X":"-3","Xo":"2","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-003:q4"},
  {"kind":"neworigin","X":"9","Xo":"2","mode":"c","opts":[{"v":"11","misc":"MISC-TALIM2-ADDORIGIN"},{"v":"-7","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"7"},{"v":"9","misc":"MISC-TALIM2-ORIGINFIXED"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-003:q5"},
  {"kind":"neworigin","X":"4","Xo":"4","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-003:q6"},
  {"kind":"fit","values":["-50","75","150"],"half":6,"opts":[{"v":"25"},{"v":"10","misc":"MISC-TALIM2-TOOBIG"},{"v":"20","misc":"MISC-TALIM2-TOOBIG"},{"v":"50","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l5-004:q1"},
  {"kind":"placecount","x":"75","step":"25","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-004:q2"},
  {"kind":"read","n":6,"side":1,"step":"25","mode":"c","opts":[{"v":"-150","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"31","misc":"MISC-TALIM2-ADDSTEP"},{"v":"150"},{"v":"6","misc":"MISC-TALIM2-UNITIGNORED"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-004:q4"},
  {"kind":"neworigin","X":"-50","Xo":"75","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-004:q5"},
  {"kind":"oppPoint","g":"-50","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-004:q6"},
  {"kind":"fit","values":["-1.5","2","3.5"],"half":8,"opts":[{"v":"0.5"},{"v":"1.5","misc":"MISC-TALIM2-TOOBIG"},{"v":"2","misc":"MISC-TALIM2-TOOBIG"},{"v":"1","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l5-005:q1"},
  {"kind":"placecount","x":"-1.5","step":"0.5","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-005:q2"},
  {"kind":"read","n":5,"side":1,"step":"0.5","mode":"c","opts":[{"v":"2.5"},{"v":"5","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"5.5","misc":"MISC-TALIM2-ADDSTEP"},{"v":"-2.5","misc":"MISC-TALIM2-SIGNSIDE"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-005:q4"},
  {"kind":"opp","a":"3.5","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-DIGITSWAP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-005:q5"},
  {"kind":"neworigin","X":"3.5","Xo":"2","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-005:q6"},
  {"kind":"placecount","x":"30","step":"10","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-006:q1"},
  {"kind":"placecount","x":"-20","step":"10","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-006:q2"},
  {"kind":"betw","x":"35","step":"10","mode":"c","opts":[{"v":["30","40"]},{"v":["20","30"]},{"v":["-40","-30"],"misc":"MISC-TALIM2-SIGNSIDE"},{"v":["40","50"]}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-006:q3"},
  {"kind":"neworigin","X":"30","Xo":"-20","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-006:q4"},
  {"kind":"neworigin","X":"50","Xo":"-20","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-006:q5"},
  {"kind":"fit","values":["-0.3","0.5","-0.1","0.6"],"half":6,"opts":[{"v":"0.05","misc":"MISC-TALIM2-TOOSMALL"},{"v":"0.1"},{"v":"0.2","misc":"MISC-TALIM2-TOOBIG"},{"v":"0.25","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l5-007:q1"},
  {"kind":"placecount","x":"-0.3","step":"0.1","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-007:q2"},
  {"kind":"placecount","x":"0.6","step":"0.1","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-007:q4"},
  {"kind":"opp","a":"-0.1","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP","MISC-TALIM2-DIGITSWAP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-007:q5"},
  {"kind":"distzero","a":"-0.3","mode":"r","sigs":["MISC-TALIM2-NEGDIST"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-007:q6"},
  {"kind":"fit","values":["-12","18","24"],"half":6,"opts":[{"v":"3","misc":"MISC-TALIM2-TOOSMALL"},{"v":"6"},{"v":"2","misc":"MISC-TALIM2-TOOSMALL"},{"v":"4","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l5-008:q1"},
  {"kind":"placecount","x":"24","step":"6","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-008:q2"},
  {"kind":"read","n":3,"side":-1,"step":"6","mode":"c","opts":[{"v":"-9","misc":"MISC-TALIM2-ADDSTEP"},{"v":"-3","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"18","misc":"MISC-TALIM2-SIGNSIDE"},{"v":"-18"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-008:q4"},
  {"kind":"oppPoint","g":"-12","mode":"r","sigs":["MISC-TALIM2-OPPSAME"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-008:q5"},
  {"kind":"neworigin","X":"18","Xo":"-12","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-008:q6"},
  {"kind":"fit","values":["-60","45","90","-15"],"half":6,"opts":[{"v":"5","misc":"MISC-TALIM2-TOOSMALL"},{"v":"10","misc":"MISC-TALIM2-TOOBIG"},{"v":"15"},{"v":"30","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l5-009:q1"},
  {"kind":"placecount","x":"-60","step":"15","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-009:q2"},
  {"kind":"read","n":4,"side":1,"step":"15","mode":"c","opts":[{"v":"60"},{"v":"19","misc":"MISC-TALIM2-ADDSTEP"},{"v":"4","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"-60","misc":"MISC-TALIM2-SIGNSIDE"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-009:q4"},
  {"kind":"opp","a":"-15","mode":"r","sigs":["MISC-TALIM2-OPPSAME"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-009:q5"},
  {"kind":"distzero","a":"-60","mode":"r","sigs":["MISC-TALIM2-NEGDIST"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-009:q6"},
  {"kind":"fit","values":["-40","30","60"],"half":6,"opts":[{"v":"10"},{"v":"30","misc":"MISC-TALIM2-TOOBIG"},{"v":"5","misc":"MISC-TALIM2-TOOSMALL"},{"v":"20","misc":"MISC-TALIM2-TOOBIG"}],"mode":"c","key":"ex-2am-talim-mustaqim-mudarraj-2-l5-010:q1"},
  {"kind":"placecount","x":"60","step":"10","mode":"r","sigs":["MISC-TALIM2-UNITIGNORED","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-010:q2"},
  {"kind":"read","n":3,"side":-1,"step":"10","mode":"c","opts":[{"v":"-3","misc":"MISC-TALIM2-UNITIGNORED"},{"v":"-30"},{"v":"-13","misc":"MISC-TALIM2-ADDSTEP"},{"v":"30","misc":"MISC-TALIM2-SIGNSIDE"}],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-010:q4"},
  {"kind":"opp","a":"-40","mode":"r","sigs":["MISC-TALIM2-OPPSAME","MISC-TALIM2-RECIP"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-010:q5"},
  {"kind":"neworigin","X":"60","Xo":"30","mode":"r","sigs":["MISC-TALIM2-ORIGINFIXED","MISC-TALIM2-ADDORIGIN","MISC-TALIM2-SIGNSIDE"],"key":"ex-2am-talim-mustaqim-mudarraj-2-l5-010:q6"},
];

const SC = 10n ** 6n;
const D = (s) => {
  const m = /^(-)?(\d+)(?:\.(\d{1,6}))?$/.exec(String(s).trim());
  if (!m) throw new Error(`nombre illisible « ${s} »`);
  const v = BigInt(m[2]) * SC + BigInt((m[3] ?? '').padEnd(6, '0') || '0');
  return m[1] ? -v : v;
};
const txt = (v) => {
  const neg = v < 0n; const a = neg ? -v : v;
  const i = a / SC; const f = String(a % SC).padStart(6, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${i}${f ? `.${f}` : ''}`;
};
const abs = (v) => (v < 0n ? -v : v);
const B = (n) => BigInt(n);
/** quotient exact a / b (valeurs à l'échelle SC) -> entier à l'échelle SC ; refusé s'il n'est pas entier */
const quo = (a, b) => { if (a % b !== 0n) throw new Error(`${a} non divisible par ${b}`); return (a / b) * SC; };
const floorDiv = (a, b) => { const q = a / b; return (a % b !== 0n && (a < 0n) !== (b < 0n)) ? q - 1n : q; };

/** état d'une graduation `s` pour des abscisses `vals` (BigInt SC) et au plus `half` graduations de chaque côté */
const fitState = (vals, s, half) => {
  if (vals.some((v) => v % s !== 0n)) return 'between';
  if (vals.some((v) => abs(v / s) > B(half))) return 'off';
  return 'fits';
};
const pointX = (spec, i) => { const [n, side] = spec.pts[i]; return B(side) * B(n) * D(spec.step); };
const NAMES = 'ABCDEFG';

/** réponse juste : valeur BigInt (SC) pour une réponse numérique, ou prédicat d'option pour un QCM */
const keyValue = (s) => {
  switch (s.kind) {
    case 'read': case 'ptsread': return s.kind === 'read' ? B(s.side) * B(s.n) * D(s.step) : pointX(s, s.idx);
    case 'opp': return -D(s.a);
    case 'oppPoint': return -D(s.g);
    case 'distzero': return abs(D(s.a));
    case 'placecount': return quo(D(s.x), D(s.step));
    case 'neworigin': return D(s.X) - D(s.Xo);
    case 'half': return (B(s.side) * B(2 * s.n + 1) * D(s.step)) / 2n;
    case 'stepof': { if (abs(D(s.x)) % B(s.n) !== 0n) throw new Error('quotient non exact'); return abs(D(s.x)) / B(s.n); }
    case 'pts': if (s.ask === 'count') return B(s.pts.map((_, i) => pointX(s, i)).filter((x) => x < 0n).length) * SC; throw new Error('pts : QCM');
    default: throw new Error(`pas de valeur numérique pour ${s.kind}`);
  }
};

const isTrue = (s, o) => {
  switch (s.kind) {
    case 'fit': return fitState(s.values.map(D), D(o.v), s.half) === 'fits';
    case 'betw': { const st = D(s.step); const lo = floorDiv(D(s.x), st) * st; return D(o.v[0]) === lo && D(o.v[1]) === lo + st; }
    case 'side': return o.v === (D(s.x) < 0n ? 'L' : 'R');
    case 'pts': {
      const xs = s.pts.map((_, i) => pointX(s, i)); const at = (nm) => xs[NAMES.indexOf(nm)];
      if (s.ask === 'min') return at(o.v) === xs.reduce((a, b) => (a < b ? a : b));
      if (s.ask === 'max') return at(o.v) === xs.reduce((a, b) => (a > b ? a : b));
      if (s.ask === 'order') { const want = [...xs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)); return o.v.length === want.length && o.v.every((v, i) => D(v) === want[i]); }
      if (s.ask === 'opppair') { const [a, b] = o.v.map(at); return a + b === 0n && a !== 0n; }
      throw new Error(s.ask);
    }
    default: return D(o.v) === keyValue(s);
  }
};

/** l'erreur nommée, recalculée : valeur (BigInt SC) que donnerait l'élève, ou prédicat pour fit / betw / side */
const digitSwap = (a) => { const t = txt(abs(D(a))); const r = t.split('').reverse().join(''); const v = D(r); return D(a) > 0n ? -v : v; };
const FORMULA = {
  'MISC-TALIM2-UNITIGNORED': (s) => (s.kind === 'read' ? B(s.side) * B(s.n) * SC : s.kind === 'ptsread' ? B(s.pts[s.idx][1]) * B(s.pts[s.idx][0]) * SC : D(s.x)),
  'MISC-TALIM2-SIGNSIDE': (s) => -keyValue(s),
  'MISC-TALIM2-ADDSTEP': (s) => B(s.side) * (B(s.n) * SC + D(s.step)),
  'MISC-TALIM2-OPPSAME': (s) => D(s.a ?? s.g),
  'MISC-TALIM2-RECIP': (s) => { const a = D(s.a ?? s.g); if ((SC * SC) % a !== 0n) throw new Error('inverse non décimal'); return (SC * SC) / a; },
  'MISC-TALIM2-DIGITSWAP': (s) => digitSwap(s.a),
  'MISC-TALIM2-NEGDIST': (s) => D(s.a),
  'MISC-TALIM2-ORIGINFIXED': (s) => D(s.X),
  'MISC-TALIM2-ADDORIGIN': (s) => D(s.X) + D(s.Xo),
};
const errorMatches = (s, misc, o) => {
  if (s.kind === 'fit') {
    const st = fitState(s.values.map(D), D(o.v), s.half);
    if (misc === 'MISC-TALIM2-TOOSMALL') return st === 'off';
    if (misc === 'MISC-TALIM2-TOOBIG') return st === 'between';
    return false;
  }
  if (s.kind === 'side') return misc === 'MISC-TALIM2-SIGNSIDE' && o.v !== (D(s.x) < 0n ? 'L' : 'R');
  if (s.kind === 'betw') {
    if (misc !== 'MISC-TALIM2-SIGNSIDE') return false;
    const st = D(s.step); const lo = floorDiv(D(s.x), st) * st;
    return D(o.v[0]) === -(lo + st) && D(o.v[1]) === -lo;
  }
  const f = FORMULA[misc]; if (!f) return false;
  return D(o.v) === f(s);
};

/* ── relecture des valeurs d'une option du fichier (contenu LaTeX) ── */
const numsOf = (c) => (c.replace(/\{,\}/g, '.').match(/-?\d+(?:\.\d+)?/g) ?? []);
const namesOf = (c) => [...c.matchAll(/\$([A-Z])\$/g)].map((m) => m[1]);
const optionValue = (s, content) => {
  if (s.kind === 'betw') return numsOf(content);
  if (s.kind === 'side') return content.includes('يمين') ? 'R' : 'L';
  if (s.kind === 'pts') return s.ask === 'order' ? numsOf(content) : (s.ask === 'opppair' ? namesOf(content) : namesOf(content)[0]);
  return numsOf(content)[0];
};
const sameValue = (a, b) => (Array.isArray(a) || Array.isArray(b)
  ? Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => sameValue(x, b[i]))
  : (/^-?\d/.test(String(a)) ? D(a) === D(b) : a === b));

const choiceIndex = (s) => {
  const hits = s.opts.map((o, k) => (isTrue(s, o) ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`${s.key} : ${hits.length} options justes`);
  return hits[0];
};
const answerOf = (s) => (s.mode === 'c' ? C('ABCDEF'[choiceIndex(s)]) : R(txt(keyValue(s))));

export const ORACLE = Object.fromEntries(SPECS.map((s) => [s.key, answerOf(s)]));

/** relit les fichiers du banc : clé, QCM, signatures et distracteurs nommés */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  for (const s of SPECS) {
    const q = byKey.get(s.key);
    if (!q) { errs.push(`${s.key} : question absente`); continue; }
    const key = s.mode === 'c' ? null : keyValue(s);
    if (s.mode === 'r') {
      if (q.answerType !== 'rational') errs.push(`${s.key} : devrait être rational`);
      else if (D(String(q.expectedAnswer)) !== key) errs.push(`${s.key} : clé ${q.expectedAnswer} ≠ ${txt(key)}`);
      for (const sg of q.misconceptionSignatures ?? []) {
        if (!sg.id.startsWith('MISC-TALIM2-')) continue;
        if (D(String(sg.value)) === key) errs.push(`${s.key} : signature ${sg.id} = la bonne réponse`);
        if (!errorMatches(s, sg.id, { v: String(sg.value) })) errs.push(`${s.key} : signature ${sg.id}=${sg.value} ≠ l'erreur nommée`);
      }
      if (!(q.misconceptionSignatures ?? []).every((sg) => (s.sigs ?? []).includes(sg.id))) errs.push(`${s.key} : signatures inattendues`);
    } else {
      if (q.answerType !== 'choice') { errs.push(`${s.key} : devrait être choice`); continue; }
      if (q.choices.length !== s.opts.length) errs.push(`${s.key} : ${q.choices.length} options, ${s.opts.length} retapées`);
      const good = choiceIndex(s);
      q.choices.forEach((c, k) => {
        const o = s.opts[k]; if (!o) return;
        const read = optionValue(s, c.content);
        if (!sameValue(read, o.v)) errs.push(`${s.key} : option ${c.id} « ${c.content} » ≠ ${JSON.stringify(o.v)}`);
        if (c.isCorrect !== (k === good)) errs.push(`${s.key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${k === good}`);
        if (c.misconceptionId) {
          if (k === good) errs.push(`${s.key} : la bonne option porte ${c.misconceptionId}`);
          else if (c.misconceptionId.startsWith('MISC-TALIM2-') && !errorMatches(s, c.misconceptionId, o)) errs.push(`${s.key} : option ${c.id} ≠ erreur ${c.misconceptionId}`);
        }
        if ((o.misc ?? null) !== (c.misconceptionId ?? null)) errs.push(`${s.key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${o.misc}`);
      });
    }
  }
  for (const b of bank) {
    if (b.q.answerType !== 'selfCheck' && !(b.key in ORACLE)) errs.push(`${b.key} : sans vérification`);
  }
  return errs;
}
