// Oracle du banc « jam-tarh-nisbiya » (جمع وطرح عددين نسبيين, 2AM, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, en arithmétique indépendante (aucun import de packages/core) :
//  - un nombre relatif écrit « -4.6 » devient un BigInt en CENTIÈMES (l'unité est 1/100 : aucun flottant, au plus 2 décimales) ;
//  - une somme ou une différence de DEUX relatifs est recalculée par la règle de la leçon, pas par l'addition machine seule :
//    même signe → on additionne les distances au zéro et on garde le signe commun ; signes différents → on soustrait la petite
//    distance de la grande et on prend le signe du nombre le plus éloigné du zéro ; opposés → 0 ; a − b = a + (−b) (P3) ;
//    chaque résultat est ENSUITE recoupé avec l'addition BigInt directe (deux calculs indépendants qui doivent s'accorder) ;
//  - « par combien a changé » = finale − initiale ; « Aucun terme manquant » : x est recalculé par l'opération inverse puis
//    VÉRIFIÉ par substitution dans l'égalité retapée ; une pyramide est recalculée étage par étage ;
//  - pour un couple (somme S, différence D) : exactement un couple proposé vérifie les deux conditions ;
//  - chaque QCM n'a qu'une option juste : chaque option est retapée en valeur (ordre = ordre des choix du fichier) et jugée par
//    le calcul ; chaque distracteur nommé MISC-JAMNISB-* est RECALCULÉ à partir de son erreur (SIGNLOST, SUBDIST, ADDDIST,
//    SIGNFIRST, SUBNOFLIP, FLIPBOTH, ADDINSTEAD, REVERSED : voir FORMULA) et est FAUX ; chaque signature d'une réponse
//    construite est de même recalculée ; l'ensemble des signatures d'une question est exactement celui retapé ;
//  - les étapes des leçons antérieures (comparaison, ordre, opposé, distance au zéro, graduation, côté) sont `counted: false` ;
//  - l'audit relit aussi le TEXTE : le calcul retapé figure dans le corrigé, chaque chiffre est dans un îlot $…$, aucune fraction,
//    aucun terme interdit (alcool, porc, jeu de hasard, intérêt, cochon) ; provenance : 7 term_exam lus, jamais une partie de
//    feuille réservée à une autre leçon.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

/* ── énoncés retapés : paramètres de chaque question (calculs, options dans l'ordre des choix) ── */
const SPECS = [
  {"key":"ex-2am-jam-tarh-nisbiya-l1-001:q1","kind":"calc","a":"-7","op":"+","b":"-15","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-001:q2","kind":"calc","a":"13","op":"-","b":"28","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-001:q3","kind":"calc","a":"-10","op":"-","b":"-4","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-002:q1","kind":"calc","a":"9","op":"+","b":"6","mode":"r","lp":"P1","counted":true,"sigs":["SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-002:q2","kind":"calc","a":"14","op":"-","b":"-7","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-002:q3","kind":"calc","a":"-3","op":"+","b":"-12","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-003:q1","kind":"calc","a":"-8","op":"+","b":"-5","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-003:q2","kind":"calc","a":"-3.5","op":"+","b":"-4.5","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-003:q3","kind":"calc","a":"-12","op":"+","b":"-19","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-004:q1","kind":"calc","a":"-9","op":"+","b":"-4","mode":"c","lp":"P1","counted":true,"opts":[{"v":"13","misc":"SIGNLOST"},{"v":"-5","misc":"SUBDIST"},{"v":"-13","misc":null}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-004:q2","kind":"calc","a":"-6","op":"+","b":"-17","mode":"c","lp":"P1","counted":true,"opts":[{"v":"-23","misc":null},{"v":"23","misc":"SIGNLOST"},{"v":"-11","misc":"SUBDIST"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-004:q3","kind":"calc","a":"2.5","op":"+","b":"3.75","mode":"r","lp":"P1","counted":true,"sigs":["SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-005:q1","kind":"calc","a":"9","op":"+","b":"-4","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-005:q2","kind":"calc","a":"-12","op":"+","b":"7","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-005:q3","kind":"calc","a":"-3","op":"+","b":"10","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-006:q1","kind":"calc","a":"-6","op":"+","b":"6","mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-006:q2","kind":"calc","a":"4.5","op":"+","b":"-4.5","mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-006:q3","kind":"missing","form":"a+x","known":"-8","c":"0","mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-007:q1","kind":"calc","a":"9","op":"-","b":"4","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-007:q2","kind":"calc","a":"4","op":"-","b":"9","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-007:q3","kind":"calc","a":"-6","op":"-","b":"-2","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-008:q1","kind":"calc","a":"6","op":"-","b":"-4","mode":"c","lp":"P3","counted":true,"opts":[{"v":"10","misc":null},{"v":"2","misc":"SUBNOFLIP"},{"v":"-10","misc":"FLIPBOTH"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-008:q2","kind":"calc","a":"-3","op":"-","b":"8","mode":"c","lp":"P3","counted":true,"opts":[{"v":"5","misc":"SUBNOFLIP"},{"v":"-11","misc":null},{"v":"11","misc":"FLIPBOTH"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-008:q3","kind":"calc","a":"-5","op":"-","b":"-9","mode":"c","lp":"P3","counted":true,"opts":[{"v":"-14","misc":"SUBNOFLIP"},{"v":"-4","misc":"FLIPBOTH"},{"v":"4","misc":null}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-009:q1","kind":"calc","a":"-4.6","op":"+","b":"3.7","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-009:q2","kind":"calc","a":"3.25","op":"+","b":"-5.6","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-009:q3","kind":"calc","a":"-7.3","op":"+","b":"-2.8","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-010:q1","kind":"calc","a":"-15","op":"-","b":"-23","mode":"c","lp":"P3","counted":true,"opts":[{"v":"-38","misc":"SUBNOFLIP"},{"v":"-8","misc":"FLIPBOTH"},{"v":"8","misc":null}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-010:q2","kind":"calc","a":"9","op":"-","b":"-6","mode":"c","lp":"P3","counted":true,"opts":[{"v":"15","misc":null},{"v":"3","misc":"SUBNOFLIP"},{"v":"-15","misc":"FLIPBOTH"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l1-010:q3","kind":"calc","a":"-4","op":"-","b":"7","mode":"c","lp":"P3","counted":true,"opts":[{"v":"3","misc":"SUBNOFLIP"},{"v":"-11","misc":null},{"v":"11","misc":"FLIPBOTH"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-001:q1","kind":"calc","a":"17.5","op":"+","b":"-8.3","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-001:q2","kind":"calc","a":"12","op":"-","b":"31","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-002:q1","kind":"calc","a":"-6.5","op":"+","b":"-3.5","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-002:q3","kind":"calc","a":"-2.25","op":"+","b":"-4","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-003:q1","kind":"calc","a":"-14","op":"+","b":"9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-003:q3","kind":"calc","a":"8.5","op":"+","b":"-12","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-004:q1","kind":"calc","a":"-3","op":"+","b":"-6","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-004:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l2-004:q1","a":"-9","op":"+","b":"10","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-004:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l2-004:q2","a":"1","op":"+","b":"-4","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-005:q1","kind":"calc","a":"-2","op":"+","b":"7","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-005:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l2-005:q1","a":"5","op":"+","b":"-9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-005:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l2-005:q2","a":"-4","op":"+","b":"6","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-006:q1","kind":"change","i":"-4","f":"3","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-006:q2","kind":"change","i":"2","f":"-5","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-006:q3","kind":"change","i":"-6","f":"-1","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-007:q1","kind":"change","i":"-6","f":"5","mode":"c","lp":"P3","counted":true,"opts":[{"v":"11","misc":null},{"v":"-1","misc":"ADDINSTEAD"},{"v":"-11","misc":"REVERSED"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-007:q2","kind":"change","i":"3","f":"-8","mode":"c","lp":"P3","counted":true,"opts":[{"v":"-5","misc":"ADDINSTEAD"},{"v":"-11","misc":null},{"v":"11","misc":"REVERSED"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-007:q3","kind":"change","i":"-9","f":"-2","mode":"c","lp":"P3","counted":true,"opts":[{"v":"-11","misc":"ADDINSTEAD"},{"v":"-7","misc":"REVERSED"},{"v":"7","misc":null}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-008:q1","kind":"calc","a":"3","op":"+","b":"-5","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-008:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l2-008:q1","a":"-2","op":"+","b":"-4","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-008:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l2-008:q2","a":"-6","op":"+","b":"8","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-009:q1","kind":"calc","a":"273.15","op":"+","b":"-30","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-009:q2","kind":"calc","a":"273.15","op":"+","b":"18","mode":"r","lp":"P1","counted":true,"sigs":["SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-009:q3","kind":"calc","a":"273.15","op":"+","b":"-273.15","mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-010:q1","kind":"calc","a":"-1","op":"+","b":"-6","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-010:q2","kind":"calc","a":"-8","op":"-","b":"3","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l2-010:q3","kind":"calc","a":"4","op":"-","b":"-9","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-001:q1","kind":"calc","a":"-5","op":"+","b":"-3.6","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-001:q2","kind":"calc","a":"2.4","op":"-","b":"-1.6","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-001:q3","kind":"calc","a":"-1.6","op":"+","b":"2.4","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-002:q1","kind":"calc","a":"18","op":"+","b":"-25","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-002:q2","kind":"calc","a":"-4.5","op":"-","b":"3","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-002:q3","kind":"calc","a":"-2.5","op":"-","b":"-2.5","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-003:q1","kind":"calc","a":"-5","op":"+","b":"8","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-003:q2","kind":"calc","a":"-2","op":"-","b":"-6","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-003:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l3-003:q1","a":"3","op":"+","b":"-9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-004:q1","kind":"calc","a":"-18","op":"+","b":"-7","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-004:q2","kind":"calc","a":"16","op":"+","b":"-23","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-004:q3","kind":"calc","a":"-9","op":"-","b":"-15","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-004:q4","kind":"calc","a":"5.5","op":"-","b":"12","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-005:q1","kind":"missing","form":"x+b","known":"5","c":"-12","mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-005:q2","kind":"missing","form":"a+x","known":"-7","c":"3","mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-005:q3","kind":"missing","form":"a-x","known":"4","c":"11","mode":"r","lp":"P3","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-006:q1","kind":"missing","form":"a-x","known":"-3","c":"-8","mode":"r","lp":"P3","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-006:q2","kind":"missing","form":"x-b","known":"6","c":"-2","mode":"r","lp":"P3","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-006:q3","kind":"calc","a":"-6.5","op":"+","b":"9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-007:q1","kind":"calc","a":"7.2","op":"+","b":"-9.5","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-007:q2","kind":"calc","a":"-4.75","op":"+","b":"-1.25","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-007:q3","kind":"calc","a":"3.6","op":"-","b":"8.1","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-007:q4","kind":"calc","a":"-2.4","op":"-","b":"-5.9","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-008:q1","kind":"calc","a":"-7","op":"+","b":"3","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-008:q2","kind":"calc","a":"-7","op":"-","b":"3","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-008:q3","kind":"calc","a":"3","op":"-","b":"-7","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-009:q1","kind":"pyr","base":["-6","9","-3","-7"],"lvl":2,"pos":0,"mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-009:q2","kind":"pyr","base":["-6","9","-3","-7"],"lvl":2,"pos":2,"mode":"r","lp":"P1","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-009:q3","kind":"pyr","base":["-6","9","-3","-7"],"lvl":3,"pos":0,"mode":"r","lp":"P1","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-009:q4","kind":"pyr","base":["-6","9","-3","-7"],"lvl":4,"pos":0,"mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-010:q1","kind":"pair","S":"-14","D":"4","opts":[{"v":["-9","-5"]},{"v":["-5","-9"]},{"v":["-6","-8"]},{"v":["-2","-12"]}],"mode":"c","lp":"P3","counted":true},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-010:q2","kind":"pair","S":"-10","D":"2","opts":[{"v":["-6","-4"]},{"v":["-4","-6"]},{"v":["-3","-7"]},{"v":["-5","-5"]}],"mode":"c","lp":"P3","counted":true},
  {"key":"ex-2am-jam-tarh-nisbiya-l3-010:q3","kind":"pair","S":"-3","D":"7","opts":[{"v":["-5","2"]},{"v":["2","-5"]},{"v":["4","-7"]},{"v":["-2","-1"]}],"mode":"c","lp":"P3","counted":true},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-001:q1","kind":"calc","a":"6","op":"-","b":"-3","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-001:q2","kind":"calc","a":"-11","op":"+","b":"4","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-001:q3","kind":"decide","items":[{"n":"A","a":"6","op":"-","b":"-3"},{"n":"B","a":"-11","op":"+","b":"4"}],"ask":"min","mode":"c","lp":"P2","counted":false,"opts":[{"v":"A"},{"v":"B"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-001:q4","kind":"opp","of":{"a":"-11","op":"+","b":"4"},"mode":"r","lp":"P2","counted":false,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-002:q1","kind":"calc","a":"-8","op":"+","b":"-6","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-002:q2","kind":"calc","a":"5","op":"+","b":"-9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-002:q3","kind":"calc","a":"3","op":"-","b":"-7","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-002:q4","kind":"order","items":[{"n":"A","a":"-8","op":"+","b":"-6"},{"n":"B","a":"5","op":"+","b":"-9"},{"n":"C","a":"3","op":"-","b":"-7"}],"mode":"c","lp":"P2","counted":false,"opts":[{"v":["-14","-4","10"]},{"v":["10","-4","-14"]},{"v":["-4","10","-14"]},{"v":["-4","-14","10"]}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-003:q1","kind":"calc","a":"-12","op":"+","b":"5","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-003:q2","kind":"distz","of":{"a":"-12","op":"+","b":"5"},"mode":"r","lp":"P2","counted":false,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-003:q3","kind":"calc","a":"4","op":"-","b":"13","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-003:q4","kind":"decide","items":[{"n":"A","a":"-12","op":"+","b":"5"},{"n":"B","a":"4","op":"-","b":"13"}],"ask":"farthest","mode":"c","lp":"P2","counted":false,"opts":[{"v":"A"},{"v":"B"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-004:q1","kind":"calc","a":"-9","op":"+","b":"4","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-004:q2","kind":"calc","a":"2","op":"-","b":"-3","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-004:q3","kind":"yesno","x":{"a":"-9","op":"+","b":"4"},"y":{"a":"2","op":"-","b":"-3"},"mode":"c","lp":"P2","counted":false,"opts":[{"v":"Y"},{"v":"N"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-004:q4","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l4-004:q1","bFrom":"ex-2am-jam-tarh-nisbiya-l4-004:q2","a":"-5","op":"+","b":"5","mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-005:q1","kind":"calc","a":"-2.5","op":"+","b":"-1","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-005:q2","kind":"placecount","of":{"a":"-2.5","op":"+","b":"-1"},"step":"0.5","mode":"r","lp":"P2","counted":false,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-005:q3","kind":"calc","a":"4","op":"-","b":"1.5","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-005:q4","kind":"placecount","of":{"a":"4","op":"-","b":"1.5"},"step":"0.5","mode":"r","lp":"P2","counted":false,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-006:q1","kind":"calc","a":"7.5","op":"+","b":"-10","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-006:q2","kind":"side","of":{"a":"7.5","op":"+","b":"-10"},"mode":"c","lp":"P2","counted":false,"opts":[{"v":"R"},{"v":"L"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-006:q3","kind":"calc","a":"-4","op":"-","b":"-9","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-006:q4","kind":"side","of":{"a":"-4","op":"-","b":"-9"},"mode":"c","lp":"P2","counted":false,"opts":[{"v":"R"},{"v":"L"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-007:q1","kind":"calc","a":"-3","op":"+","b":"-9","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-007:q2","kind":"calc","a":"6","op":"+","b":"-4","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-007:q3","kind":"calc","a":"-5","op":"-","b":"-1","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-007:q4","kind":"calc","a":"2","op":"-","b":"7","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-007:q5","kind":"order","items":[{"n":"A","a":"-3","op":"+","b":"-9"},{"n":"B","a":"6","op":"+","b":"-4"},{"n":"C","a":"-5","op":"-","b":"-1"},{"n":"D","a":"2","op":"-","b":"7"}],"mode":"c","lp":"P2","counted":false,"opts":[{"v":["-12","-5","-4","2"]},{"v":["2","-4","-5","-12"]},{"v":["2","-4","-5","-12"]},{"v":["-5","-12","-4","2"]}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-008:q1","kind":"calc","a":"-3","op":"+","b":"-4","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-008:q2","kind":"calc","a":"2","op":"+","b":"-6","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-008:q3","kind":"calc","a":"-1","op":"+","b":"-2","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-008:q4","kind":"decide","items":[{"n":"الجلفة","a":"-3","op":"+","b":"-4"},{"n":"باتنة","a":"2","op":"+","b":"-6"},{"n":"سطيف","a":"-1","op":"+","b":"-2"}],"ask":"min","mode":"c","lp":"P2","counted":false,"opts":[{"v":"الجلفة"},{"v":"باتنة"},{"v":"سطيف"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-009:q1","kind":"calc","a":"3.75","op":"+","b":"-5.25","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-009:q2","kind":"calc","a":"-2.4","op":"-","b":"1.6","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-009:q3","kind":"calc","a":"-0.5","op":"-","b":"-2.5","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-009:q4","kind":"order","items":[{"n":"A","a":"3.75","op":"+","b":"-5.25"},{"n":"B","a":"-2.4","op":"-","b":"1.6"},{"n":"C","a":"-0.5","op":"-","b":"-2.5"}],"mode":"c","lp":"P2","counted":false,"opts":[{"v":["2","-1.5","-4"]},{"v":["-4","-1.5","2"]},{"v":["-1.5","2","-4"]},{"v":["-1.5","-4","2"]}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-010:q1","kind":"calc","a":"-6","op":"+","b":"9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-010:q2","kind":"calc","a":"5","op":"-","b":"11","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-010:q3","kind":"calc","a":"-8","op":"+","b":"7","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l4-010:q4","kind":"decide","items":[{"n":"A","a":"-6","op":"+","b":"9"},{"n":"B","a":"5","op":"-","b":"11"},{"n":"C","a":"-8","op":"+","b":"7"}],"ask":"nearest","mode":"c","lp":"P2","counted":false,"opts":[{"v":"A"},{"v":"B"},{"v":"C"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-001:q1","kind":"calc","a":"-3","op":"+","b":"5","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-001:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-001:q1","a":"2","op":"+","b":"-6","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-001:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-001:q2","a":"-4","op":"+","b":"-2","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-001:q4","kind":"change","i":"-3","f":"-6","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-001:q5","kind":"decide","items":[{"n":"الاثنين","a":"2","op":"+","b":"-6"},{"n":"الثلاثاء","a":"-4","op":"+","b":"-2"}],"ask":"max","mode":"c","lp":"P2","counted":false,"opts":[{"v":"الاثنين"},{"v":"الثلاثاء"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-002:q1","kind":"calc","a":"-1","op":"+","b":"8","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-002:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-002:q1","a":"7","op":"+","b":"-11","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-002:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-002:q2","a":"-4","op":"+","b":"3","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-002:q4","kind":"change","i":"7","f":"-4","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-002:q5","kind":"decide","items":[{"n":"بعد النزول","v":"-4","fromQ":"ex-2am-jam-tarh-nisbiya-l5-002:q2"},{"n":"في النهاية","v":"-1","fromQ":"ex-2am-jam-tarh-nisbiya-l5-002:q3"}],"ask":"min","mode":"c","lp":"P2","counted":false,"opts":[{"v":"بعد النزول"},{"v":"في النهاية"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-003:q1","kind":"calc","a":"10","op":"+","b":"-6","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-003:q2","kind":"calc","a":"5","op":"+","b":"-9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-003:q3","kind":"yesno","x":{"a":"10","op":"+","b":"-6"},"y":{"a":"5","op":"+","b":"-9"},"mode":"c","lp":"P2","counted":false,"opts":[{"v":"Y"},{"v":"N"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-003:q4","kind":"change","i":"-4","f":"4","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-003:q5","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-003:q2","a":"-4","op":"+","b":"15","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-004:q1","kind":"calc","a":"-4","op":"+","b":"15","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-004:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-004:q1","a":"11","op":"+","b":"-9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-004:q3","kind":"calc","bFrom":"ex-2am-jam-tarh-nisbiya-l5-004:q2","a":"273.15","op":"+","b":"2","mode":"r","lp":"P1","counted":true,"sigs":["SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-004:q4","kind":"change","i":"-4","f":"2","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-004:q5","kind":"decide","items":[{"n":"الابتدائية","v":"-4"},{"n":"النهائية","v":"2","fromQ":"ex-2am-jam-tarh-nisbiya-l5-004:q2"}],"ask":"max","mode":"c","lp":"P2","counted":false,"opts":[{"v":"الابتدائية"},{"v":"النهائية"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-005:q1","kind":"calc","a":"-12","op":"+","b":"5","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-005:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-005:q1","a":"-7","op":"+","b":"-7","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-005:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-005:q2","a":"-14","op":"+","b":"9","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-005:q4","kind":"change","i":"-14","f":"-5","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-005:q5","kind":"distz","of":{"a":"-14","op":"+","b":"9"},"mode":"r","lp":"P2","counted":false,"sigs":[]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-006:q1","kind":"calc","a":"1.5","op":"+","b":"-2.25","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-006:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-006:q1","a":"-0.75","op":"+","b":"-1.75","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-006:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-006:q2","a":"-2.5","op":"+","b":"3.5","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-006:q4","kind":"change","i":"1.5","f":"-2.5","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED","SUBDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-006:q5","kind":"order","items":[{"n":"جانفي","v":"1.5"},{"n":"فيفري","v":"-0.75","fromQ":"ex-2am-jam-tarh-nisbiya-l5-006:q1"},{"n":"مارس","v":"-2.5","fromQ":"ex-2am-jam-tarh-nisbiya-l5-006:q2"}],"mode":"c","lp":"P2","counted":false,"opts":[{"v":["-2.5","-0.75","1.5"]},{"v":["1.5","-0.75","-2.5"]},{"v":["-0.75","1.5","-2.5"]},{"v":["-0.75","-2.5","1.5"]}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-007:q1","kind":"calc","a":"4","op":"+","b":"-7","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-007:q2","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-007:q1","a":"-3","op":"+","b":"5","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-007:q3","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-007:q2","a":"2","op":"+","b":"-4","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-007:q4","kind":"change","i":"4","f":"-2","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-007:q5","kind":"decide","items":[{"n":"بعد الصعود","a":"-3","op":"+","b":"5"},{"n":"في النهاية","a":"2","op":"+","b":"-4"}],"ask":"max","mode":"c","lp":"P2","counted":false,"opts":[{"v":"بعد الصعود"},{"v":"في النهاية"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-008:q1","kind":"calc","a":"15","op":"+","b":"-6","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-008:q2","kind":"calc","a":"10","op":"+","b":"-12","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-008:q3","kind":"calc","a":"-4","op":"+","b":"8","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-008:q4","kind":"decide","items":[{"n":"القسم أ","a":"15","op":"+","b":"-6"},{"n":"القسم ب","a":"10","op":"+","b":"-12"},{"n":"القسم ج","a":"-4","op":"+","b":"8"}],"ask":"max","mode":"c","lp":"P2","counted":false,"opts":[{"v":"القسم أ"},{"v":"القسم ب"},{"v":"القسم ج"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-008:q5","kind":"change","i":"-2","f":"9","mode":"r","lp":"P3","counted":true,"sigs":["ADDINSTEAD","REVERSED"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-009:q1","kind":"calc","a":"7","op":"-","b":"10","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-009:q2","kind":"calc","a":"12","op":"-","b":"5","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-009:q3","kind":"calc","a":"4","op":"-","b":"9","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-009:q4","kind":"decide","items":[{"n":"الفريق أ","a":"7","op":"-","b":"10"},{"n":"الفريق ب","a":"12","op":"-","b":"5"},{"n":"الفريق ج","a":"4","op":"-","b":"9"}],"ask":"min","mode":"c","lp":"P2","counted":false,"opts":[{"v":"الفريق أ"},{"v":"الفريق ب"},{"v":"الفريق ج"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-009:q5","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-009:q1","a":"-3","op":"+","b":"6","mode":"r","lp":"P2","counted":true,"sigs":["SIGNFIRST","ADDDIST"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-010:q1","kind":"calc","a":"17","op":"-","b":"-6","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-010:q2","kind":"calc","a":"9","op":"-","b":"-2","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-010:q3","kind":"decide","items":[{"n":"الاثنين","a":"17","op":"-","b":"-6"},{"n":"الثلاثاء","a":"9","op":"-","b":"-2"}],"ask":"max","mode":"c","lp":"P2","counted":false,"opts":[{"v":"الاثنين"},{"v":"الثلاثاء"}]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-010:q4","kind":"calc","aFrom":"ex-2am-jam-tarh-nisbiya-l5-010:q1","bFrom":"ex-2am-jam-tarh-nisbiya-l5-010:q2","a":"23","op":"-","b":"11","mode":"r","lp":"P3","counted":true,"sigs":["SUBNOFLIP","FLIPBOTH"]},
  {"key":"ex-2am-jam-tarh-nisbiya-l5-010:q5","kind":"calc","a":"-6","op":"+","b":"-3","mode":"r","lp":"P1","counted":true,"sigs":["SIGNLOST","SUBDIST"]},
];

/* ── arithmétique en centièmes ── */
const SC = 100n;
const B = (n) => BigInt(n);
const D = (s) => {
  const m = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(String(s).trim());
  if (!m) throw new Error(`nombre illisible « ${s} » (au plus 2 décimales)`);
  const v = B(m[2]) * SC + B((m[3] ?? '').padEnd(2, '0') || '0');
  return m[1] ? -v : v;
};
const abs = (v) => (v < 0n ? -v : v);
const sg = (v) => (v < 0n ? -1n : v > 0n ? 1n : 0n);
/** texte « plain » d'une valeur (clé de réponse) : -0.75, 3, 0 */
const txt = (v) => {
  const neg = v < 0n; const a = abs(v); const i = a / SC; const f = a % SC;
  const fs = f === 0n ? '' : `.${String(f).padStart(2, '0').replace(/0$/, '')}`;
  return `${neg ? '-' : ''}${i}${fs}`;
};
/** texte LaTeX avec virgule : 7{,}5 */
const ltx = (v) => txt(v).replace('.', '{,}');
/** (+7{,}5) / (-7) / 0 — la façon d'écrire un relatif entre parenthèses dans les corrigés */
const brk = (v) => (v === 0n ? '0' : `(${v > 0n ? '+' : '-'}${ltx(abs(v))})`);

/** la règle de la leçon pour a + b (P1 / P2), indépendante de l'addition directe */
const addByRule = (a, b) => {
  if (a === 0n) return b; if (b === 0n) return a;
  const A = abs(a); const Bb = abs(b);
  if (sg(a) === sg(b)) return sg(a) * (A + Bb);                         // P1 : somme des distances, signe commun
  if (A === Bb) return 0n;                                              // opposés
  const far = A > Bb ? a : b; const big = A > Bb ? A : Bb; const small = A > Bb ? Bb : A;
  return sg(far) * (big - small);                                       // P2 : différence des distances, signe du plus éloigné
};
const calcVal = (a, op, b) => {
  const r = op === '+' ? addByRule(a, b) : addByRule(a, -b);            // P3 : a − b = a + (−b)
  const direct = op === '+' ? a + b : a - b;
  if (r !== direct) throw new Error(`règle ≠ addition directe : ${a} ${op} ${b}`);
  return r;
};
const lpOf = (a, op, b) => (op === '-' ? 'P3' : sg(a) === sg(b) ? 'P1' : 'P2');

/* ── valeurs déjà calculées dans la feuille (chaînes aFrom / bFrom / fromQ) ── */
const VALUES = new Map();
const itemValue = (it) => {
  if ('v' in it) {
    const v = D(it.v);
    if (it.fromQ && VALUES.get(it.fromQ) !== v) throw new Error(`${it.n} : ${it.fromQ} vaut ${VALUES.get(it.fromQ)} ≠ ${v}`);
    return v;
  }
  return calcVal(D(it.a), it.op, D(it.b));
};
const ofValue = (o) => calcVal(D(o.a), o.op, D(o.b));
const pyrRows = (base) => { const rows = [base.map(D)]; while (rows.at(-1).length > 1) { const r = rows.at(-1); rows.push(r.slice(1).map((_, k) => addByRule(r[k], r[k + 1]))); } return rows; };

const specValue = (s) => {
  switch (s.kind) {
    case 'calc': {
      const a = D(s.a); const b = D(s.b);
      if (s.aFrom && VALUES.get(s.aFrom) !== a) throw new Error(`${s.key} : aFrom ${s.aFrom} ≠ ${s.a}`);
      if (s.bFrom && VALUES.get(s.bFrom) !== b) throw new Error(`${s.key} : bFrom ${s.bFrom} ≠ ${s.b}`);
      return calcVal(a, s.op, b);
    }
    case 'change': return calcVal(D(s.f), '-', D(s.i));
    case 'missing': {
      const k = D(s.known); const c = D(s.c);
      const x = { 'x+b': c - k, 'a+x': c - k, 'a-x': k - c, 'x-b': c + k }[s.form];
      const ok = { 'x+b': x + k === c, 'a+x': k + x === c, 'a-x': k - x === c, 'x-b': x - k === c }[s.form];
      if (!ok) throw new Error(`${s.key} : substitution fausse`);
      return x;
    }
    case 'pyr': return pyrRows(s.base)[s.lvl - 1][s.pos];
    case 'opp': return -ofValue(s.of);
    case 'distz': return abs(ofValue(s.of));
    case 'placecount': { const x = ofValue(s.of); const st = D(s.step); if (x % st !== 0n) throw new Error('non divisible'); return (x / st) * SC; }
    default: return null;
  }
};

/* l'erreur nommée, recalculée à partir des opérandes : valeur que donnerait l'élève, ou null si l'erreur ne s'applique pas ici */
const FORMULA = {
  // a + b, deux négatifs : on additionne les distances mais on perd le signe
  SIGNLOST: (s) => (s.kind === 'calc' && s.op === '+' && D(s.a) < 0n && D(s.b) < 0n ? abs(D(s.a)) + abs(D(s.b)) : null),
  // a + b de même signe : on soustrait les distances (signe du plus éloigné) ; pour un changement de signes différents : |dist − dist|
  SUBDIST: (s) => {
    if (s.kind === 'calc') {
      const a = D(s.a); const b = D(s.b);
      if (s.op !== '+' || sg(a) !== sg(b) || a === 0n || abs(a) === abs(b)) return null;
      const far = abs(a) > abs(b) ? a : b;
      return sg(far) * abs(abs(a) - abs(b));
    }
    if (s.kind === 'change') { const i = D(s.i); const f = D(s.f); return sg(i) !== sg(f) && i !== 0n && f !== 0n ? abs(abs(i) - abs(f)) : null; }
    return null;
  },
  // a + b de signes différents : on additionne les distances (signe du plus éloigné)
  ADDDIST: (s) => {
    if (s.kind !== 'calc' || s.op !== '+') return null;
    const a = D(s.a); const b = D(s.b);
    if (a === 0n || b === 0n || sg(a) === sg(b) || abs(a) === abs(b)) return null;
    const far = abs(a) > abs(b) ? a : b;
    return sg(far) * (abs(a) + abs(b));
  },
  // a + b de signes différents : bonne différence des distances, mais signe du nombre le plus PROCHE du zéro (ou du nombre ajouté)
  SIGNFIRST: (s) => {
    if (s.kind !== 'calc' || s.op !== '+') return null;
    const a = D(s.a); const b = D(s.b);
    if (a === 0n || b === 0n || sg(a) === sg(b) || abs(a) === abs(b)) return null;
    const near = abs(a) > abs(b) ? b : a;
    return sg(near) * abs(abs(a) - abs(b));
  },
  // a − b traité comme a + b (on n'a pas pris le MOINS-signe en compte : le nombre n'est pas remplacé par son opposé)
  SUBNOFLIP: (s) => (s.kind === 'calc' && s.op === '-' ? D(s.a) + D(s.b) : null),
  // a − b : on change le signe du nombre soustrait ET celui du résultat
  FLIPBOTH: (s) => (s.kind === 'calc' && s.op === '-' ? -(D(s.a) - D(s.b)) : null),
  // « par combien a changé » calculé comme la somme initiale + finale
  ADDINSTEAD: (s) => (s.kind === 'change' ? D(s.i) + D(s.f) : null),
  // initiale − finale
  REVERSED: (s) => (s.kind === 'change' ? D(s.i) - D(s.f) : null),
};
const errorValue = (s, name) => { const f = FORMULA[name]; return f ? f(s) : null; };

/* ── relecture des options du fichier ── */
const numsOf = (c) => (c.replace(/\{,\}/g, '.').match(/-?\d+(?:\.\d+)?/g) ?? []);
const NAMES_AR = (c) => c.replace(/\$/g, '').trim();
const optionValue = (s, content) => {
  switch (s.kind) {
    case 'pair': return numsOf(content).map(D);                       // x = ... et y = ...
    case 'order': return numsOf(content).map(D);
    case 'decide': return NAMES_AR(content);
    case 'side': return content.includes('يمين') ? 'R' : content.includes('يسار') ? 'L' : '?';
    case 'yesno': return content.trim() === 'نعم' ? 'Y' : content.trim() === 'لا' ? 'N' : '?';
    default: return D(numsOf(content)[0]);
  }
};
const sameValue = (a, b) => (Array.isArray(a) ? Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]) : a === b);
const specOptValue = (s, o) => {
  switch (s.kind) {
    case 'pair': case 'order': return o.v.map(D);
    case 'decide': case 'side': case 'yesno': return o.v;
    default: return D(o.v);
  }
};

/** l'option est-elle juste ? (calculé, jamais lu dans le fichier) */
const isTrue = (s, o, key) => {
  const v = specOptValue(s, o);
  switch (s.kind) {
    case 'calc': case 'change': return v === key;
    case 'pair': return v[0] + v[1] === D(s.S) && v[0] - v[1] === D(s.D);
    case 'order': { const want = s.items.map(itemValue).sort((p, q) => (p < q ? -1 : p > q ? 1 : 0)); return sameValue(v, want); }
    case 'decide': {
      const vals = s.items.map(itemValue);
      const score = { min: (x) => x, max: (x) => -x, nearest: (x) => abs(x), farthest: (x) => -abs(x) }[s.ask];
      const sc = vals.map(score); const best = sc.reduce((p, q) => (p < q ? p : q));
      if (sc.filter((x) => x === best).length !== 1) throw new Error(`${s.key} : égalité`);
      return s.items[sc.indexOf(best)].n === v;
    }
    case 'side': { const x = ofValue(s.of); return v === (x > 0n ? 'R' : 'L'); }
    case 'yesno': { const x = ofValue(s.x); const y = ofValue(s.y); return v === (x + y === 0n && x !== 0n ? 'Y' : 'N'); }
    default: throw new Error(s.kind);
  }
};
const NUMERIC = new Set(['calc', 'change', 'missing', 'pyr', 'opp', 'distz', 'placecount']);
const choiceIndex = (s, key) => {
  const hits = s.opts.map((o, k) => (isTrue(s, o, key) ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`${s.key} : ${hits.length} options justes`);
  return hits[0];
};

/* ── calcul des clés (dans l'ordre des questions : VALUES sert aux chaînes aFrom / bFrom / fromQ) ── */
const KEYS = new Map();
for (const s of SPECS) {
  const v = specValue(s);
  if (v !== null) VALUES.set(s.key, v);
  KEYS.set(s.key, v);
}
const answerOf = (s) => {
  const key = KEYS.get(s.key);
  return s.mode === 'c' ? C('ABCDEF'[choiceIndex(s, key)]) : R(txt(key));
};
export const ORACLE = Object.fromEntries(SPECS.map((s) => [s.key, answerOf(s)]));

/* ── contrôles de texte ── */
const FORBIDDEN = ['خمر', 'خنزير', 'قمار', 'نرد', 'يانصيب', 'ربا', 'ربوي', 'فائدة', 'كازينو', 'مراهنة', 'رهان', '🐷', 'الكتاب'];
const hasWord = (t, w) => new RegExp(`(^|[\\s،.:؛؟()$])${w}($|[\\s،.:؛؟()$])`).test(t);
const SKIP_KEYS = new Set(['id', 'type', 'result', 'role', 'misconceptionId']);
const allStrings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (Array.isArray(o)) o.forEach((x) => allStrings(x, out)); else if (o && typeof o === 'object') Object.entries(o).forEach(([k, x]) => { if (!SKIP_KEYS.has(k)) allStrings(x, out); }); return out; };
const outsideMath = (t) => t.replace(/\$[^$]*\$/g, ' ');
const textErrors = (label, strings) => {
  const errs = [];
  for (const t of strings) {
    if ((t.match(/\$/g) ?? []).length % 2) errs.push(`${label} : $ non appariés « ${t.slice(0, 40)} »`);
    if (/\d/.test(outsideMath(t))) errs.push(`${label} : chiffre hors îlot $…$ « ${t.slice(0, 50)} »`);
    if (/\\d?frac/.test(t)) errs.push(`${label} : fraction interdite (2AM : pas de fraction comme relatif)`);
    if (/\d\.\d/.test(t)) errs.push(`${label} : point décimal dans un texte « ${t.slice(0, 40)} »`);
    for (const f of FORBIDDEN) if (f === '🐷' ? t.includes(f) : hasWord(t, f)) errs.push(`${label} : terme interdit « ${f} »`);
  }
  return errs;
};

/* ── provenance : relue dans les fichiers du banc ── */
const BANK_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/2am/jam-tarh-nisbiya');
const TERM_EXAMS = new Set(['2am-s2-62:1', '2am-s2-50:1', '2am-s2-70:1', '2am-s2-69:1', '2am-s1-73:1', '2am-s2-71:1', '2am-s2-52:3']);
const provenanceErrors = () => {
  const errs = []; let te = 0; let mod = 0; let ad = 0;
  const cited = new Set();
  for (let lv = 1; lv <= 5; lv++) {
    const dir = join(BANK_DIR, `level-${lv}`);
    const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    if (files.length !== 10) errs.push(`niveau ${lv} : ${files.length} feuilles au lieu de 10`);
    for (const f of files) {
      const ex = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      const m = ex.metadata; const src = m.source; const tag = ex.id;
      const sem = { 'على منوال اختبار الفصل الأول': 1, 'على منوال اختبار الفصل الثاني': 2 }[m.exam.badge] ?? null;
      if (src.type === 'term_exam') {
        te++;
        const k = `${src.file}:${src.exercise}`;
        if (!TERM_EXAMS.has(k)) errs.push(`${tag} : term_exam ${k} non lu / réservé à une autre leçon`);
        if (cited.has(k)) errs.push(`${tag} : ${k} cité deux fois`);
        cited.add(k);
        if (m.exam.kind !== 'modelled' || sem !== src.semester || src.grade !== '2am') errs.push(`${tag} : term_exam incohérent (kind/badge/semestre)`);
      } else if (src.type === 'platform_addition') {
        mod++;
        if (src.reason !== 'term_exam_modelled' || m.exam.kind !== 'modelled' || sem === null || `2am-s${sem}` !== src.modelledOn) errs.push(`${tag} : platform_addition incohérent`);
      } else if (src.type === 'textbook') {
        ad++;
        if (m.exam.kind !== 'adapted' || m.exam.badge !== null) errs.push(`${tag} : adapted incohérent`);
      } else errs.push(`${tag} : source inconnue`);
      errs.push(...textErrors(tag, allStrings({ s: ex.statement, t: m.title })));
    }
  }
  if (te !== 7) errs.push(`${te} term_exam au lieu de 7`);
  if (te + mod + ad !== 50) errs.push('50 feuilles attendues');
  if (cited.size !== TERM_EXAMS.size) errs.push('un term_exam lu n\'est cité par aucune feuille');
  return errs;
};

/** relit les fichiers du banc : clé, QCM, signatures et distracteurs nommés, texte, provenance */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  for (const s of SPECS) {
    const q = byKey.get(s.key);
    if (!q) { errs.push(`${s.key} : question absente`); continue; }
    const key = KEYS.get(s.key);
    const lpCode = q.learningPoints?.find((l) => l.role === 'primary')?.code;
    if (lpCode !== `2am_jam-tarh-nisbiya_${s.lp}`) errs.push(`${s.key} : LP ${lpCode} ≠ ${s.lp}`);
    // la bonne الكفاءة d'une question comptée est recalculée
    let want = null;
    if (s.kind === 'calc') want = lpOf(D(s.a), s.op, D(s.b));
    if (s.kind === 'change' || s.kind === 'pair') want = 'P3';
    if (s.kind === 'missing') {
      const k = D(s.known); const x = key; want = (s.form === 'a-x' || s.form === 'x-b') ? 'P3' : (sg(x) === sg(k) ? 'P1' : 'P2');
    }
    if (s.kind === 'pyr') { const rows = pyrRows(s.base); const lo = rows[s.lvl - 2]; want = lpOf(lo[s.pos], '+', lo[s.pos + 1]); }
    if (want && want !== s.lp) errs.push(`${s.key} : الكفاءة recalculée ${want} ≠ ${s.lp}`);
    const counted = NUMERIC.has(s.kind) && !['opp', 'distz', 'placecount'].includes(s.kind) || s.kind === 'pair';
    if (counted && q.counted === false) errs.push(`${s.key} : devrait être comptée`);
    if (!counted && q.counted !== false) errs.push(`${s.key} : étape d'une leçon antérieure → counted: false`);
    // le calcul retapé figure dans le corrigé (jamais un calcul à trois termes)
    let ex = null;
    if (s.kind === 'calc') ex = `${brk(D(s.a))}${s.op}${brk(D(s.b))}`;
    if (s.kind === 'change') ex = `${brk(D(s.f))}-${brk(D(s.i))}`;
    if (s.kind === 'pyr') { const rows = pyrRows(s.base); const lo = rows[s.lvl - 2]; ex = `${brk(lo[s.pos])}+${brk(lo[s.pos + 1])}`; }
    const sol = (q.solution?.lines ?? []).join('\n');
    if (ex && !sol.includes(ex)) errs.push(`${s.key} : le corrigé ne contient pas « ${ex} »`);
    if (ex && s.kind === 'calc') { const last = `${ex}=${brk(key)}`; if (!sol.includes(last)) errs.push(`${s.key} : le corrigé ne se termine pas par « ${last} »`); }
    errs.push(...textErrors(s.key, allStrings({ st: q.statement, ch: q.choices, h: q.hints, f: q.feedback, sol: q.solution, fmt: q.answerFormat })));
    if (s.mode === 'r') {
      if (q.answerType !== 'rational') { errs.push(`${s.key} : devrait être rational`); continue; }
      if (D(String(q.expectedAnswer)) !== key) errs.push(`${s.key} : clé ${q.expectedAnswer} ≠ ${txt(key)}`);
      if (q.solution?.result !== undefined && !(numsOf(q.solution.result).length === 1 && D(numsOf(q.solution.result)[0]) === key)) errs.push(`${s.key} : solution.result ${q.solution.result} ≠ ${txt(key)}`);
      const sigs = q.misconceptionSignatures ?? [];
      for (const sg_ of sigs) {
        if (!sg_.id.startsWith('MISC-JAMNISB-')) continue;
        const name = sg_.id.replace('MISC-JAMNISB-', '');
        const ev = errorValue(s, name);
        if (ev === null) errs.push(`${s.key} : signature ${name} ne s'applique pas à ce calcul`);
        else if (D(String(sg_.value)) !== ev) errs.push(`${s.key} : signature ${name}=${sg_.value} ≠ l'erreur recalculée ${txt(ev)}`);
        if (D(String(sg_.value)) === key) errs.push(`${s.key} : signature ${name} = la bonne réponse`);
      }
      const names = sigs.map((x) => x.id.replace('MISC-JAMNISB-', '')).sort().join();
      if (names !== [...(s.sigs ?? [])].sort().join()) errs.push(`${s.key} : signatures ${names} ≠ attendues ${(s.sigs ?? []).join()}`);
    } else {
      if (q.answerType !== 'choice') { errs.push(`${s.key} : devrait être choice`); continue; }
      if (q.choices.length !== s.opts.length) errs.push(`${s.key} : ${q.choices.length} options, ${s.opts.length} retapées`);
      let good;
      try { good = choiceIndex(s, key); } catch (e) { errs.push(e.message); continue; }
      q.choices.forEach((c, k) => {
        const o = s.opts[k]; if (!o) return;
        const read = optionValue(s, c.content);
        if (!sameValue(read, specOptValue(s, o))) errs.push(`${s.key} : option ${c.id} « ${c.content} » ≠ valeur retapée`);
        if (c.isCorrect !== (k === good)) errs.push(`${s.key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${k === good}`);
        if (c.misconceptionId) {
          const name = c.misconceptionId.replace('MISC-JAMNISB-', '');
          if (k === good) errs.push(`${s.key} : la bonne option porte ${c.misconceptionId}`);
          else {
            const ev = errorValue(s, name);
            if (ev === null || ev !== D(numsOf(c.content)[0])) errs.push(`${s.key} : option ${c.id} ≠ erreur ${name} recalculée`);
          }
        }
        if ((o.misc ?? null) !== (c.misconceptionId ? c.misconceptionId.replace('MISC-JAMNISB-', '') : null)) errs.push(`${s.key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${o.misc}`);
      });
    }
  }
  for (const b of bank) {
    if (b.q.answerType !== 'selfCheck' && !(b.key in ORACLE)) errs.push(`${b.key} : sans vérification`);
    if (b.q.answerType === 'selfCheck' && b.q.expectedAnswer !== undefined) errs.push(`${b.key} : selfCheck avec clé`);
  }
  errs.push(...provenanceErrors());
  return errs;
}
