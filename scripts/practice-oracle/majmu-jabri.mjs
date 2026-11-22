// Oracle du banc « majmu-jabri » (حساب مجموع جبري, 2AM, unité 3, 2026-10-29) — feuilles d'examen de فصل
// (« على منوال اختبار الفصل … »). Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Chaque clé est RECALCULÉE ICI, jamais lue dans `expectedAnswer`, avec une arithmétique et un ANALYSEUR propres à ce fichier
// (aucun import de packages/core/arithmetic/relative.js) :
//  - un nombre « -4.6 » devient un BigInt en CENTIÈMES (l'unité est 1/100 : aucun flottant, au plus 2 décimales) ;
//  - l'énoncé retapé de chaque chaîne (« (+15)-[(-4)-(-6)+(+9)] ») est lu par un analyseur à pile qui comprend les parenthèses ( )
//    et les crochets [ ] (parenthèses emboîtées, signe initial de la forme simplifiée « -9+4-… ») ; une valeur d'un groupe est
//    calculée AVANT d'être ajoutée ou retranchée (jamais en changeant les signes de l'intérieur : règle de 3AM) ;
//  - chaque chaîne est recalculée de deux façons indépendantes qui doivent s'accorder : l'évaluation de l'arbre, et la règle de
//    la leçon (chaque retrait devient l'ajout de l'opposé, on groupe les positifs et les négatifs, on additionne les deux totaux) ;
//  - chaque QCM n'a qu'une option juste : chaque option est retapée en valeur et jugée par le calcul ; chaque distracteur nommé
//    MISC-JABRI-* (NOTURN, TURNALL, SIMPLIFYSIGN, FIRSTSIGN, BRACKETDROP, ALLNEG) ou réutilisé de jam-tarh-nisbiya
//    (MISC-JAMNISB-ADDDIST, MISC-JAMNISB-FLIPBOTH) est RECALCULÉ à partir de son erreur (voir FORMULA) et est FAUX ; chaque
//    signature d'une réponse construite est de même recalculée ; l'ensemble des signatures d'une question est exactement celui retapé ;
//  - écritures « sous forme de somme » et « forme simplifiée » : chaque option est analysée en liste de termes et comparée à la
//    liste attendue de son erreur ; « le terme qui remplace −(+6) », « quel signe dans la case », « quelle écriture donne la cible »,
//    carré magique (case fausse = croisement de la seule ligne et de la seule colonne de somme différente), chemins, couples ;
//  - les étapes des leçons antérieures (deux termes, côté du zéro, distance, nombre de graduations, comparaison, rang) sont
//    `counted: false` ; la الكفاءة de chaque étape comptée est recalculée (forme simplifiée → P3, sinon P2) ;
//  - l'audit relit aussi le TEXTE : l'énoncé retapé figure dans la question, le corrigé calcule l'intérieur des groupes d'abord et
//    contient chaque étape (écriture en somme, total des négatifs, total des positifs, total final, égalité finale) mais JAMAIS
//    « نغيّر إشارات », chaque chiffre est dans un îlot $…$, aucune fraction, aucun terme interdit ; provenance : les
//    term_exam lus (voir TERM_EXAMS : chaque partie de feuille n'est citée que par cette leçon) et les 8 feuilles adaptées.
// Les questions selfCheck (« برّر ») n'ont pas de clé et ne figurent pas ici.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { R, C } from './helpers.mjs';

/* ── énoncés retapés : paramètres de chaque question ── */
const SPECS = [
  {"key":"ex-2am-majmu-jabri-l1-001:q1","kind":"calc","expr":"(-6)+(+9)-(-5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-001:q2","kind":"calc","expr":"[(+11)+(-26)]+[(+7)-(-12)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-001:q3","kind":"simp","expr":"(-6)+(+9)-(-5)","lp":"P3","counted":true,"opts":[{"w":"-6+9-5","misc":"MISC-JABRI-SIMPLIFYSIGN"},{"w":"-6+9+5","misc":null},{"w":"6+9+5","misc":"MISC-JABRI-FIRSTSIGN"}]},
  {"key":"ex-2am-majmu-jabri-l1-002:q1","kind":"turn","expr":"(-8)-(+6)+(-3)-(-9)","lp":"P1","counted":true,"opts":[{"w":"(-8)+(+6)+(-3)+(-9)","misc":"MISC-JABRI-NOTURN"},{"w":"(+8)+(-6)+(+3)+(+9)","misc":"MISC-JABRI-TURNALL"},{"w":"(-8)+(-6)+(-3)+(+9)","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l1-002:q2","kind":"calc","expr":"(-8)-(+6)+(-3)-(-9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-002:q3","kind":"calc","expr":"(+7)-(+12)+(-4)-(-15)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JAMNISB-FLIPBOTH"]},
  {"key":"ex-2am-majmu-jabri-l1-003:q1","kind":"calc","expr":"(-5)+(-7)-(+8)-(-12)+(-4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-003:q2","kind":"calc","expr":"(+9)+(-4)-(+6)+(-3)-(-8)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l1-003:q3","kind":"simp","expr":"(-5)+(-7)-(+8)-(-12)+(-4)","lp":"P3","counted":true,"opts":[{"w":"-5-7+8-12-4","misc":"MISC-JABRI-SIMPLIFYSIGN"},{"w":"-5-7-8+12-4","misc":null},{"w":"5-7-8+12-4","misc":"MISC-JABRI-FIRSTSIGN"}]},
  {"key":"ex-2am-majmu-jabri-l1-004:q1","kind":"turn","expr":"(-9)-(+2)+(-5)-(-4)","lp":"P1","counted":true,"opts":[{"w":"(-9)+(+2)+(-5)+(-4)","misc":"MISC-JABRI-NOTURN"},{"w":"(+9)+(-2)+(+5)+(+4)","misc":"MISC-JABRI-TURNALL"},{"w":"(-9)+(-2)+(-5)+(+4)","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l1-004:q2","kind":"turn","expr":"(+13)-(-6)+(-8)-(+3)","lp":"P1","counted":true,"opts":[{"w":"(+13)+(-6)+(-8)+(+3)","misc":"MISC-JABRI-NOTURN"},{"w":"(+13)+(+6)+(-8)+(-3)","misc":null},{"w":"(-13)+(+6)+(+8)+(-3)","misc":"MISC-JABRI-TURNALL"}]},
  {"key":"ex-2am-majmu-jabri-l1-004:q3","kind":"turn","expr":"(-4)-(-11)-(+7)+(+5)","lp":"P1","counted":true,"opts":[{"w":"(-4)+(-11)+(+7)+(+5)","misc":"MISC-JABRI-NOTURN"},{"w":"(+4)+(+11)+(-7)+(-5)","misc":"MISC-JABRI-TURNALL"},{"w":"(-4)+(+11)+(-7)+(+5)","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l1-005:q1","kind":"simp","expr":"(-7)+(+5)-(+3)-(-8)","lp":"P3","counted":true,"opts":[{"w":"-7+5+3-8","misc":"MISC-JABRI-SIMPLIFYSIGN"},{"w":"-7+5-3+8","misc":null},{"w":"7+5-3+8","misc":"MISC-JABRI-FIRSTSIGN"}]},
  {"key":"ex-2am-majmu-jabri-l1-005:q2","kind":"simp","expr":"(-12)-(+4)+(+9)-(-6)","lp":"P3","counted":true,"opts":[{"w":"-12+4+9-6","misc":"MISC-JABRI-SIMPLIFYSIGN"},{"w":"12-4+9+6","misc":"MISC-JABRI-FIRSTSIGN"},{"w":"-12-4+9+6","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l1-005:q3","kind":"simp","expr":"(-3)-(-10)-(+2)+(+6)","lp":"P3","counted":true,"opts":[{"w":"-3-10+2+6","misc":"MISC-JABRI-SIMPLIFYSIGN"},{"w":"-3+10-2+6","misc":null},{"w":"3+10-2+6","misc":"MISC-JABRI-FIRSTSIGN"}]},
  {"key":"ex-2am-majmu-jabri-l1-006:q1","kind":"calc","expr":"(+14)-(+9)+(-6)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-006:q2","kind":"calc","expr":"(-3)+(-5)-(-12)+(+4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-006:q3","kind":"calc","expr":"(-10)-(-7)-(+8)+(+13)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-007:q1","kind":"calc","expr":"(+8)-(-3)+(-5)-(+2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-007:q2","kind":"side","of":"(+8)-(-3)+(-5)-(+2)","lp":"P2","counted":false,"opts":[{"v":"L"},{"v":"R"}]},
  {"key":"ex-2am-majmu-jabri-l1-007:q3","kind":"calc","expr":"(-6)+(+4)-(-7)-(+9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l1-008:q1","kind":"calc","expr":"(-5)+(+12)-(+4)-(-6)","mode":"c","lp":"P2","counted":true,"opts":[{"v":"5","misc":"MISC-JABRI-NOTURN"},{"v":"27","misc":"MISC-JAMNISB-ADDDIST"},{"v":"9","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l1-008:q2","kind":"calc","expr":"(+9)-(+15)+(-2)-(-10)","mode":"c","lp":"P2","counted":true,"opts":[{"v":"12","misc":"MISC-JABRI-NOTURN"},{"v":"2","misc":null},{"v":"36","misc":"MISC-JAMNISB-ADDDIST"}]},
  {"key":"ex-2am-majmu-jabri-l1-008:q3","kind":"calc","expr":"(-8)-(-3)+(-7)+(+1)","mode":"c","lp":"P2","counted":true,"opts":[{"v":"-17","misc":"MISC-JABRI-NOTURN"},{"v":"-19","misc":"MISC-JAMNISB-ADDDIST"},{"v":"-11","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l1-009:q1","kind":"calc","expr":"(-8)+(+12)+(-5)+(+6)+(-12)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-009:q2","kind":"calc","expr":"(+7)+(-10)+(+5)+(-6)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-009:q3","kind":"calc","expr":"(-4)+(+16)+(-6)+(+4)+(+3)+(-11)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l1-010:q1","kind":"simp","expr":"(-7)+(+12)+(-3)+(-5)","lp":"P3","counted":true,"opts":[{"w":"7+12-3-5","misc":"MISC-JABRI-FIRSTSIGN"},{"w":"-7+12-3-5","misc":null},{"w":"7-12+3+5","misc":"MISC-JABRI-TURNALL"}]},
  {"key":"ex-2am-majmu-jabri-l1-010:q2","kind":"calc","expr":"-7+12-3-5","mode":"r","lp":"P3","counted":true,"sigs":["MISC-JABRI-ALLNEG","MISC-JABRI-FIRSTSIGN"]},
  {"key":"ex-2am-majmu-jabri-l1-010:q3","kind":"simp","expr":"(+9)+(-4)-(+6)-(-10)","lp":"P3","counted":true,"opts":[{"w":"9-4+6-10","misc":"MISC-JABRI-SIMPLIFYSIGN"},{"w":"-9+4-6+10","misc":"MISC-JABRI-TURNALL"},{"w":"9-4-6+10","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l1-010:q4","kind":"calc","expr":"9-4-6+10","mode":"r","lp":"P3","counted":true,"sigs":["MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l2-001:q1","kind":"calc","expr":"(-5)-(-23)+(+41)-(+27)+(-12)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-001:q2","kind":"calc","expr":"[(-13)+(+25)]-[(-20)-(+35)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-002:q1","kind":"calc","expr":"(-16)+(+7)-(-13)-(+8)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-002:q2","kind":"calc","expr":"-24+5+8+9","mode":"r","lp":"P3","counted":true,"sigs":[]},
  {"key":"ex-2am-majmu-jabri-l2-003:q1","kind":"calc","expr":"-5-8+25-14","mode":"r","lp":"P3","counted":true,"sigs":[]},
  {"key":"ex-2am-majmu-jabri-l2-003:q2","kind":"calc","expr":"(+8)-(+12)+(-6)-(-21)+(-9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-003:q3","kind":"calc","expr":"(-9+4)-(15-11)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-004:q1","kind":"calc","expr":"(+3.5)-(+8)+(-2.5)-(-1)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-005:q1","kind":"calc","expr":"(+4)+(-7)+(-3)+(+5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-005:q2","kind":"calc","expr":"(+4)+(-7)-(-3)+(+5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-006:q1","kind":"calc","expr":"(-12)+(+5)-(+8)-(-3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-007:q1","kind":"calc","expr":"(+6)-(+10)+(-3)-(-9)","mode":"c","lp":"P2","counted":true,"opts":[{"v":"4","misc":"MISC-JABRI-NOTURN"},{"v":"2","misc":null},{"v":"28","misc":"MISC-JAMNISB-ADDDIST"}]},
  {"key":"ex-2am-majmu-jabri-l2-007:q2","kind":"calc","expr":"(-14)+(+6)-(-5)-(+7)","mode":"c","lp":"P2","counted":true,"opts":[{"v":"-6","misc":"MISC-JABRI-NOTURN"},{"v":"-32","misc":"MISC-JAMNISB-ADDDIST"},{"v":"-10","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l2-007:q3","kind":"calc","expr":"(-9)-(-4)+(+8)-(+11)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-008:q1","kind":"calc","expr":"(+10)+(-3)-(-3)+(+8)","mode":"r","lp":"P2","counted":true,"sigs":[]},
  {"key":"ex-2am-majmu-jabri-l2-009:q1","kind":"turnterm","term":"(+6)","lp":"P1","counted":true,"opts":[{"v":"6","misc":"MISC-JABRI-NOTURN"},{"v":"-6","misc":null},{"v":"0","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l2-009:q2","kind":"calc","expr":"(+8)-(+6)+(-6)+(-11)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l2-010:q1","kind":"blank","tpl":"(+5)?(-3)+(+4)","target":"12","lp":"P1","counted":true,"opts":[{"v":"+"},{"v":"-"}]},
  {"key":"ex-2am-majmu-jabri-l2-010:q2","kind":"blank","tpl":"(-7)?(+9)-(+3)","target":"-1","lp":"P1","counted":true,"opts":[{"v":"-"},{"v":"+"}]},
  {"key":"ex-2am-majmu-jabri-l2-010:q3","kind":"blank","tpl":"(-9)?(-5)+(-2)","target":"-6","lp":"P1","counted":true,"opts":[{"v":"+"},{"v":"-"}]},
  {"key":"ex-2am-majmu-jabri-l3-001:q1","kind":"calc","expr":"(-2.6)+(+5.4)-(-3)-(+2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-001:q2","kind":"calc","expr":"(+15)-[(-4)-(-6)+(+9)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-001:q3","kind":"calc","expr":"-8+5-(-1.5+4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l3-002:q1","kind":"calc","expr":"(+30)-[(-14)-(+16)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN"]},
  {"key":"ex-2am-majmu-jabri-l3-002:q2","kind":"calc","expr":"(-6)+(-4)-(+3)-(-2)-(-5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-002:q3","kind":"simp","expr":"(-6)+(-4)-(+3)-(-2)-(-5)","lp":"P3","counted":true,"opts":[{"w":"-6-4+3-2-5","misc":"MISC-JABRI-SIMPLIFYSIGN"},{"w":"6-4-3+2+5","misc":"MISC-JABRI-FIRSTSIGN"},{"w":"-6-4-3+2+5","misc":null}]},
  {"key":"ex-2am-majmu-jabri-l3-003:q1","kind":"calc","expr":"[(+150)+(-272)]+[(+38)-(-74)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-003:q2","kind":"calc","expr":"-7+12+(-6+4-9)-(+5+7)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l3-004:q1","kind":"calc","expr":"(+42)+(-18)-(-14)-(+25)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-004:q2","kind":"calc","expr":"(+55)-(+17)+(-31)+(-9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-FLIPBOTH","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l3-004:q3","kind":"calc","expr":"15-[(38-47+17)+(24-40)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-004:q4","kind":"calc","expr":"-18-(21-6)+[-9+(-4+23)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l3-005:q1","kind":"simp","expr":"(+48.35)+(-6)+(+12.6)-(-4.5)-(-9)","lp":"P3","counted":true,"opts":[{"w":"48.35-6+12.6-4.5-9","misc":"MISC-JABRI-SIMPLIFYSIGN"},{"w":"48.35-6+12.6+4.5+9","misc":null},{"w":"-48.35+6-12.6+4.5+9","misc":"MISC-JABRI-TURNALL"}]},
  {"key":"ex-2am-majmu-jabri-l3-005:q2","kind":"calc","expr":"(+48.35)+(-6)+(+12.6)-(-4.5)-(-9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-005:q3","kind":"calc","expr":"(-3.75)+(+10.2)-(+6.45)-(-2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-006:q1","kind":"calc","expr":"(-18)+[(-250)+(+75)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-006:q2","kind":"calc","expr":"(+22)+[(-60)-(-35)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-006:q3","kind":"calc","expr":"(-12)+[(+40)-(+55)+(-7)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-007:q1","kind":"calc","expr":"(+7.5)-[(-2.5)+(+4)]-(+3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-007:q2","kind":"calc","expr":"-6.4+(-3.1+5.5)-(+2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l3-007:q3","kind":"calc","expr":"(-9)-[(+4.5)-(-2.5)]+(+8)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l3-008:q1","kind":"calc","expr":"(-3.5)+(+6)-(+4.5)-(-1.5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-008:q2","kind":"calc","expr":"(+8)-[(-2.5)+(+6)]-(+9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l3-008:q3","kind":"side","of":"(+8)-[(-2.5)+(+6)]-(+9)","lp":"P2","counted":false,"opts":[{"v":"R"},{"v":"L"}]},
  {"key":"ex-2am-majmu-jabri-l3-009:q1","kind":"calc","expr":"(+7)-(-3)","mode":"r","lp":"P1","counted":false,"sigs":[]},
  {"key":"ex-2am-majmu-jabri-l3-009:q2","kind":"calc","expr":"[(+7)-(-3)]+(+2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-009:q3","kind":"calc","expr":"(-3)-(+2)","mode":"r","lp":"P1","counted":false,"sigs":[]},
  {"key":"ex-2am-majmu-jabri-l3-009:q4","kind":"calc","expr":"(+7)-[(-3)-(+2)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-009:q5","kind":"yesno","x":"[(+7)-(-3)]+(+2)","y":"(+7)-[(-3)-(+2)]","lp":"P2","counted":false,"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-majmu-jabri-l3-010:q1","kind":"calc","expr":"(+5)+(+1)+(-2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l3-010:q2","kind":"magicbad","grid":[["-2","3","2"],["5","1","-2"],["0","-1","4"]],"magic":"3","lp":"P2","counted":true,"opts":[{"v":[0,0]},{"v":[2,2]},{"v":[1,2]}]},
  {"key":"ex-2am-majmu-jabri-l3-010:q3","kind":"calc","expr":"(+3)-[(+5)+(+1)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-BRACKETDROP","MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l4-001:q1","kind":"calc","expr":"(-9)+[6-(-2+5)]","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-001:q2","kind":"calc","expr":"(-7)+(-3)-(+2)-(-1)+(+6)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-001:q3","kind":"decide","items":[{"label":"$C$","expr":"(-9)+[6-(-2+5)]"},{"label":"$D$","expr":"(-7)+(-3)-(+2)-(-1)+(+6)"}],"ask":"min","lp":"P2","counted":false,"opts":[{"v":"$D$"},{"v":"$C$"}]},
  {"key":"ex-2am-majmu-jabri-l4-001:q4","kind":"distz","of":"(-9)+[6-(-2+5)]","lp":"P2","counted":false},
  {"key":"ex-2am-majmu-jabri-l4-002:q1","kind":"calc","expr":"(-10)-(-25)+(+45)-(+30)+(-12)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-FLIPBOTH","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l4-002:q2","kind":"calc","expr":"(-10)-(-25)","mode":"r","lp":"P1","counted":false,"sigs":[]},
  {"key":"ex-2am-majmu-jabri-l4-002:q3","kind":"side","of":"(-10)-(-25)+(+45)-(+30)+(-12)","lp":"P2","counted":false,"opts":[{"v":"L"},{"v":"R"}]},
  {"key":"ex-2am-majmu-jabri-l4-002:q4","kind":"placecount","of":"(-10)-(-25)+(+45)-(+30)+(-12)","step":"3","lp":"P2","counted":false},
  {"key":"ex-2am-majmu-jabri-l4-003:q1","kind":"calc","expr":"(-9)-(-24)+(+53)-(+34)+(-12)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-FLIPBOTH","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l4-003:q2","kind":"calc","expr":"(+7)+(+15)-(+9)+(-14)+(-3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-003:q3","kind":"calc","expr":"(-9)-(+4)+(-24)-(-16)+(-27)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-FLIPBOTH","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l4-003:q4","kind":"order","items":[{"n":"A","expr":"(-9)-(-24)+(+53)-(+34)+(-12)"},{"n":"B","expr":"(+7)+(+15)-(+9)+(-14)+(-3)"},{"n":"C","expr":"(-9)-(+4)+(-24)-(-16)+(-27)"}],"lp":"P2","counted":false,"opts":[{"v":["22","-4","-48"]},{"v":["-4","22","-48"]},{"v":["-4","-48","22"]},{"v":["-48","-4","22"]}]},
  {"key":"ex-2am-majmu-jabri-l4-004:q1","kind":"calc","expr":"(+14)-(+21)-(-9)+(-6)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-FLIPBOTH","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l4-004:q2","kind":"calc","expr":"-23+18-11+14-3","mode":"r","lp":"P3","counted":true,"sigs":["MISC-JABRI-ALLNEG","MISC-JABRI-FIRSTSIGN"]},
  {"key":"ex-2am-majmu-jabri-l4-004:q3","kind":"decide","items":[{"label":"$L$","expr":"(+14)-(+21)-(-9)+(-6)"},{"label":"$D$","expr":"-23+18-11+14-3"}],"ask":"farthest","lp":"P2","counted":false,"opts":[{"v":"$L$"},{"v":"$D$"}]},
  {"key":"ex-2am-majmu-jabri-l4-004:q4","kind":"placecount","of":"(+14)-(+21)-(-9)+(-6)","step":"2","lp":"P2","counted":false},
  {"key":"ex-2am-majmu-jabri-l4-005:q1","kind":"calc","expr":"(-2)+(+5)-(+9)-(-3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-005:q2","kind":"calc","expr":"(-2)+(+5)","mode":"r","lp":"P1","counted":false,"sigs":[]},
  {"key":"ex-2am-majmu-jabri-l4-005:q3","kind":"calc","expr":"(+6)-(+10)-(-1)+(-5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-005:q4","kind":"placecount","of":"(+6)-(+10)-(-1)+(-5)","step":"2","lp":"P2","counted":false},
  {"key":"ex-2am-majmu-jabri-l4-006:q1","kind":"calc","expr":"(-15)+(+6)-(+9)+(-4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-006:q2","kind":"calc","expr":"(-8)-(-5)+(-17)-(+6)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-006:q3","kind":"decide","items":[{"label":"الغوّاص الأوّل","expr":"(-15)+(+6)-(+9)+(-4)"},{"label":"الغوّاص الثاني","expr":"(-8)-(-5)+(-17)-(+6)"}],"ask":"min","lp":"P2","counted":false,"opts":[{"v":"الغوّاص الأوّل"},{"v":"الغوّاص الثاني"}]},
  {"key":"ex-2am-majmu-jabri-l4-006:q4","kind":"distz","of":"(-8)-(-5)+(-17)-(+6)","lp":"P2","counted":false},
  {"key":"ex-2am-majmu-jabri-l4-007:q1","kind":"calc","expr":"(+6)-(+11)+(-2)-(-4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-007:q2","kind":"side","of":"(+6)-(+11)+(-2)-(-4)","lp":"P2","counted":false,"opts":[{"v":"R"},{"v":"L"}]},
  {"key":"ex-2am-majmu-jabri-l4-007:q3","kind":"calc","expr":"(-4)+(+9)-(+8)-(-2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-007:q4","kind":"decide","items":[{"label":"الطابق $E$","expr":"(+6)-(+11)+(-2)-(-4)"},{"label":"الطابق $F$","expr":"(-4)+(+9)-(+8)-(-2)"}],"ask":"max","lp":"P2","counted":false,"opts":[{"v":"الطابق $E$"},{"v":"الطابق $F$"}]},
  {"key":"ex-2am-majmu-jabri-l4-008:q1","kind":"calc","expr":"(+9)-(+14)+(-3)-(-6)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-008:q2","kind":"calc","expr":"(-5)+(-7)-(-12)+(+4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-008:q3","kind":"calc","expr":"(-11)-(-4)+(+2)-(+8)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-008:q4","kind":"calc","expr":"(+3)-(+10)-(-6)+(-4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-008:q5","kind":"order","items":[{"n":"A","expr":"(+9)-(+14)+(-3)-(-6)"},{"n":"B","expr":"(-5)+(-7)-(-12)+(+4)"},{"n":"C","expr":"(-11)-(-4)+(+2)-(+8)"},{"n":"D","expr":"(+3)-(+10)-(-6)+(-4)"}],"lp":"P2","counted":false,"opts":[{"v":["4","-2","-5","-13"]},{"v":["-13","-5","-2","4"]},{"v":["-2","4","-5","-13"]},{"v":["-5","-13","-2","4"]}]},
  {"key":"ex-2am-majmu-jabri-l4-009:q1","kind":"calc","expr":"(+6)+(-4)+(+3)+(-7)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-009:q2","kind":"calc","expr":"(+6)+(+2)-(-5)+(-9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-009:q3","kind":"calc","expr":"(+6)-(+3)+(-8)+(+1)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l4-009:q4","kind":"decide","items":[{"label":"المسار الأوّل","expr":"(+6)+(-4)+(+3)+(-7)"},{"label":"المسار الثاني","expr":"(+6)+(+2)-(-5)+(-9)"},{"label":"المسار الثالث","expr":"(+6)-(+3)+(-8)+(+1)"}],"ask":"max","lp":"P2","counted":false,"opts":[{"v":"المسار الأوّل"},{"v":"المسار الثاني"},{"v":"المسار الثالث"}]},
  {"key":"ex-2am-majmu-jabri-l4-010:q1","kind":"target","target":"10","lp":"P3","counted":true,"opts":[{"w":"1+2+3-4+5+6-7"},{"w":"1+2-3+4+5-6+7"},{"w":"1-2+3+4-5+6+7"}]},
  {"key":"ex-2am-majmu-jabri-l4-010:q2","kind":"target","target":"3","lp":"P3","counted":true,"opts":[{"w":"1+2-3+4-5+6"},{"w":"1-2-3+4+5-6"},{"w":"1+2+3-4-5+6"}]},
  {"key":"ex-2am-majmu-jabri-l4-010:q3","kind":"calc","expr":"1-2+3-4+5-6+7-8","mode":"r","lp":"P3","counted":true,"sigs":["MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l5-001:q1","kind":"calc","expr":"(-2)+(+5)+(-7)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-001:q2","kind":"calc","expr":"(-2)+(+5)+(-7)+(-3)+(+4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-001:q3","kind":"calc","expr":"(-2)+(+5)+(-7)-(-3)+(+4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l5-001:q4","kind":"decide","items":[{"label":"السبت","expr":"-2"},{"label":"الأربعاء بعد الإلغاء","expr":"(-2)+(+5)+(-7)-(-3)+(+4)"}],"ask":"max","lp":"P2","counted":false,"opts":[{"v":"السبت"},{"v":"الأربعاء بعد الإلغاء"}]},
  {"key":"ex-2am-majmu-jabri-l5-001:q5","kind":"side","of":"(-2)+(+5)+(-7)-(-3)+(+4)","lp":"P2","counted":false,"opts":[{"v":"L"},{"v":"R"}]},
  {"key":"ex-2am-majmu-jabri-l5-002:q1","kind":"calc","expr":"(-8)+(-5)+(+3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-002:q2","kind":"calc","expr":"(-8)+(-5)+(+3)+(-6)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-002:q3","kind":"calc","expr":"(-8)+(-5)+(+3)-(-6)+(+2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-002:q4","kind":"decide","items":[{"label":"بعد المرحلة الثالثة","expr":"(-8)+(-5)+(+3)"},{"label":"بعد المرحلة الرابعة","expr":"(-8)+(-5)+(+3)+(-6)"}],"ask":"nearest","lp":"P2","counted":false,"opts":[{"v":"بعد المرحلة الرابعة"},{"v":"بعد المرحلة الثالثة"}]},
  {"key":"ex-2am-majmu-jabri-l5-002:q5","kind":"distz","of":"(-8)+(-5)+(+3)+(-6)","lp":"P2","counted":false},
  {"key":"ex-2am-majmu-jabri-l5-003:q1","kind":"calc","expr":"(+2)+(+6)+(-9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-003:q2","kind":"calc","expr":"(+2)+(+6)+(-9)+(+4)+(-5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-003:q3","kind":"calc","expr":"(+2)+(+6)-(+9)+(+4)-(+5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST"]},
  {"key":"ex-2am-majmu-jabri-l5-003:q4","kind":"yesno","x":"(+2)+(+6)+(-9)+(+4)+(-5)","y":"(+2)+(+6)-(+9)+(+4)-(+5)","lp":"P2","counted":false,"opts":[{"v":"N"},{"v":"Y"}]},
  {"key":"ex-2am-majmu-jabri-l5-003:q5","kind":"side","of":"(+2)+(+6)+(-9)+(+4)+(-5)","lp":"P2","counted":false,"opts":[{"v":"R"},{"v":"L"}]},
  {"key":"ex-2am-majmu-jabri-l5-004:q1","kind":"calc","expr":"(+10)+(-3)+(+8)+(-4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-004:q2","kind":"calc","expr":"(+6)+(+7)+(-5)+(-2)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-004:q3","kind":"calc","expr":"(+10)+(-3)+(+8)-(-4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-004:q4","kind":"decide","items":[{"label":"الفريق (أ)","expr":"(+10)+(-3)+(+8)-(-4)"},{"label":"الفريق (ب)","expr":"(+6)+(+7)+(-5)+(-2)"}],"ask":"max","lp":"P2","counted":false,"opts":[{"v":"الفريق (ب)"},{"v":"الفريق (أ)"}]},
  {"key":"ex-2am-majmu-jabri-l5-005:q1","kind":"calc","expr":"(+9)+(-4)+(+7)+(-6)+(-3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-005:q2","kind":"side","of":"(+9)+(-4)+(+7)+(-6)+(-3)","lp":"P2","counted":false,"opts":[{"v":"L"},{"v":"R"}]},
  {"key":"ex-2am-majmu-jabri-l5-005:q3","kind":"calc","expr":"(+9)+(-4)-(+7)+(-6)-(-3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-005:q4","kind":"side","of":"(+9)+(-4)-(+7)+(-6)-(-3)","lp":"P2","counted":false,"opts":[{"v":"R"},{"v":"L"}]},
  {"key":"ex-2am-majmu-jabri-l5-005:q5","kind":"placecount","of":"(+9)+(-4)-(+7)+(-6)-(-3)","step":"1","lp":"P2","counted":false},
  {"key":"ex-2am-majmu-jabri-l5-006:q1","kind":"calc","expr":"(+120)+(-45)+(+80)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-006:q2","kind":"calc","expr":"(+120)+(-45)+(+80)+(-60)+(-30)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-006:q3","kind":"calc","expr":"(+120)+(-45)+(+80)-(-60)+(-30)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-006:q4","kind":"decide","items":[{"label":"قبل الإلغاء","expr":"(+120)+(-45)+(+80)+(-60)+(-30)"},{"label":"بعد الإلغاء","expr":"(+120)+(-45)+(+80)-(-60)+(-30)"}],"ask":"max","lp":"P2","counted":false,"opts":[{"v":"قبل الإلغاء"},{"v":"بعد الإلغاء"}]},
  {"key":"ex-2am-majmu-jabri-l5-007:q1","kind":"calc","expr":"(-3)+(+2)+(-5)+(+4)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-007:q2","kind":"calc","expr":"(+1)+(-3)+(-4)-(-5)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-007:q3","kind":"calc","expr":"(-2)+(-3)-(+1)+(+3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-007:q4","kind":"decide","items":[{"label":"الفريق الأوّل","expr":"(-3)+(+2)+(-5)+(+4)"},{"label":"الفريق الثاني","expr":"(+1)+(-3)+(-4)-(-5)"},{"label":"الفريق الثالث","expr":"(-2)+(-3)-(+1)+(+3)"}],"ask":"min","lp":"P2","counted":false,"opts":[{"v":"الفريق الأوّل"},{"v":"الفريق الثاني"},{"v":"الفريق الثالث"}]},
  {"key":"ex-2am-majmu-jabri-l5-008:q1","kind":"calc","expr":"(-30)+(+120)-(+45)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-008:q2","kind":"calc","expr":"(-30)+(+120)-(+45)+(+60)-(+80)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-008:q3","kind":"calc","expr":"(-30)+(+120)-(+45)+(+60)-(+80)+(+30)-(+70)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-008:q4","kind":"decide","items":[{"label":"مساء اليوم الأوّل","expr":"(-30)+(+120)-(+45)"},{"label":"مساء اليوم الثاني","expr":"(-30)+(+120)-(+45)+(+60)-(+80)"}],"ask":"nearest","lp":"P2","counted":false,"opts":[{"v":"مساء اليوم الأوّل"},{"v":"مساء اليوم الثاني"}]},
  {"key":"ex-2am-majmu-jabri-l5-008:q5","kind":"side","of":"(-30)+(+120)-(+45)+(+60)-(+80)+(+30)-(+70)","lp":"P2","counted":false,"opts":[{"v":"R"},{"v":"L"}]},
  {"key":"ex-2am-majmu-jabri-l5-009:q1","kind":"calc","expr":"(-0.5)+(+0.6)+(-0.4)+(+0.9)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-009:q2","kind":"calc","expr":"(-0.5)+(+0.6)+(-0.4)+(+0.9)+(-1.2)+(-0.3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-009:q3","kind":"calc","expr":"(-0.5)+(+0.6)-(-0.4)+(+0.9)-(+1.2)+(-0.3)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-009:q4","kind":"decide","items":[{"label":"نهاية اليوم الرابع","expr":"(-0.5)+(+0.6)+(-0.4)+(+0.9)"},{"label":"نهاية اليوم السادس","expr":"(-0.5)+(+0.6)+(-0.4)+(+0.9)+(-1.2)+(-0.3)"}],"ask":"max","lp":"P2","counted":false,"opts":[{"v":"نهاية اليوم السادس"},{"v":"نهاية اليوم الرابع"}]},
  {"key":"ex-2am-majmu-jabri-l5-009:q5","kind":"side","of":"(-0.5)+(+0.6)+(-0.4)+(+0.9)","lp":"P2","counted":false,"opts":[{"v":"L"},{"v":"R"}]},
  {"key":"ex-2am-majmu-jabri-l5-010:q1","kind":"calc","expr":"(-10)+(+25)+(-40)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-010:q2","kind":"calc","expr":"(-10)+(+25)+(-40)+(+15)+(-30)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-010:q3","kind":"calc","expr":"(-10)+(+25)-(-40)+(+15)-(+20)","mode":"r","lp":"P2","counted":true,"sigs":["MISC-JABRI-NOTURN","MISC-JAMNISB-ADDDIST","MISC-JABRI-TURNALL"]},
  {"key":"ex-2am-majmu-jabri-l5-010:q4","kind":"decide","items":[{"label":"الموقع $Y$","expr":"(-10)+(+25)+(-40)+(+15)+(-30)"},{"label":"الموقع $Z$","expr":"(-10)+(+25)-(-40)+(+15)-(+20)"}],"ask":"farthest","lp":"P2","counted":false,"opts":[{"v":"الموقع $Y$"},{"v":"الموقع $Z$"}]},
  {"key":"ex-2am-majmu-jabri-l5-010:q5","kind":"distz","of":"(-10)+(+25)+(-40)+(+15)+(-30)","lp":"P2","counted":false},
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
const add = (list) => list.reduce((p, q) => p + q, 0n);
const txt = (v) => {
  const neg = v < 0n; const a = abs(v); const i = a / SC; const f = a % SC;
  const fs = f === 0n ? '' : `.${String(f).padStart(2, '0').replace(/0$/, '')}`;
  return `${neg ? '-' : ''}${i}${fs}`;
};
const ltx = (v) => txt(v).replace('.', '{,}');
const brk = (v) => (v === 0n ? '0' : `(${v > 0n ? '+' : '-'}${ltx(abs(v))})`);
const texOf = (s) => s.replace(/(\d)\.(\d)/g, '$1{,}$2');
const asciiOf = (s) => s.replace(/\{,\}/g, '.').replace(/\$/g, '').replace(/\s+/g, '');

/* ── analyseur à pile : ( ) et [ ], signe initial, groupes emboîtés ── */
const parseChain = (src) => {
  const frame = (open, start, parentOp) => ({ open, start, parentOp, items: [], pending: '+', sawOp: false });
  const stack = [frame(null, 0, '+')];
  const bad = (m) => { throw new Error(`${m} dans « ${src} »`); };
  for (let i = 0; i < src.length;) {
    const ch = src[i]; const top = stack[stack.length - 1];
    if (ch === '+' || ch === '-') {
      if (top.sawOp) bad('deux signes de suite');
      top.pending = ch; top.sawOp = true; i++;
    } else if (ch === '(' || ch === '[') {
      if (top.items.length && !top.sawOp) bad('opérateur manquant');
      stack.push(frame(ch, i, top.pending)); top.pending = '+'; top.sawOp = false; i++;
    } else if (ch === ')' || ch === ']') {
      if (stack.length < 2) bad('fermeture sans ouverture');
      const f = stack.pop();
      if ((f.open === '(') !== (ch === ')')) bad('parenthèse et crochet croisés');
      if (!f.items.length || (f.sawOp)) bad('groupe vide ou signe pendant');
      stack[stack.length - 1].items.push({ op: f.parentOp, node: { k: 'grp', items: f.items, text: src.slice(f.start, i + 1) } });
      i++;
    } else {
      const m = /^\d+(?:\.\d{1,2})?/.exec(src.slice(i));
      if (!m) bad(`caractère « ${ch} »`);
      if (top.items.length && !top.sawOp) bad('opérateur manquant');
      top.items.push({ op: top.pending, node: { k: 'num', v: D(m[0]) } });
      top.pending = '+'; top.sawOp = false; i += m[0].length;
    }
  }
  if (stack.length !== 1) bad('groupe non fermé');
  const root = stack[0];
  if (!root.items.length || root.sawOp) bad('chaîne vide ou signe pendant');
  return root.items;
};
const nodeVal = (n) => (n.k === 'num' ? n.v : itemsVal(n.items));
const itemsVal = (items) => add(items.map((t) => (t.op === '-' ? -1n : 1n) * nodeVal(t.node)));
const isSingleSigned = (n) => n.k === 'grp' && n.items.length === 1 && n.items[0].node.k === 'num';
const topOf = (src) => parseChain(src).map((t) => ({ op: t.op, node: t.node, val: nodeVal(t.node) }));
const formOf = (top) => (top.every((t) => t.node.k === 'num') ? 'simp' : top.every((t) => isSingleSigned(t.node)) ? 'flat' : 'group');

/** la règle de la leçon, indépendante de l'évaluation d'arbre : chaque retrait devient l'ajout de l'opposé, on groupe, on additionne */
const ruleParts = (top) => {
  const terms = top.map((t) => (t.op === '-' ? -t.val : t.val));
  const neg = terms.filter((x) => x < 0n); const pos = terms.filter((x) => x > 0n);
  return { terms, neg, pos, N: add(neg), P: add(pos), total: add(neg) + add(pos) };
};
const valueOf = (src) => {
  const top = topOf(src); const r = ruleParts(top); const direct = itemsVal(parseChain(src));
  if (r.total !== direct) throw new Error(`règle ≠ évaluation directe : ${src}`);
  return direct;
};

/* ── l'erreur nommée, recalculée à partir des termes de premier niveau ── */
const FORMULA = {
  // le retrait est ignoré : chaque terme garde la valeur qu'il porte (le nombre soustrait n'est pas remplacé par son opposé)
  NOTURN: (top) => (formOf(top) === 'simp' ? null : add(top.map((t) => t.val))),
  // tous les termes changent de signe, pas seulement les termes soustraits
  TURNALL: (top) => (formOf(top) === 'simp' ? null : -add(top.map((t) => t.val))),
  // forme simplifiée qui débute par « − » : toute la chaîne est lue négative
  ALLNEG: (top) => (formOf(top) === 'simp' && top[0].op === '-' ? -add(top.map((t) => t.val)) : null),
  // forme simplifiée : le premier terme perd son « − »
  FIRSTSIGN: (top) => (formOf(top) === 'simp' && top[0].op === '-' ? top[0].val + add(ruleParts(top).terms.slice(1)) : null),
  // un groupe retranché est ignoré : le « − » ne porte que sur son PREMIER terme, les suivants gardent leur propre signe
  BRACKETDROP: (top) => {
    if (!top.some((t) => t.op === '-' && t.node.k === 'grp' && !isSingleSigned(t.node))) return null;
    let v = 0n;
    for (const t of top) {
      if (t.op === '-' && t.node.k === 'grp' && !isSingleSigned(t.node)) {
        const inner = t.node.items.map((x) => (x.op === '-' ? -1n : 1n) * nodeVal(x.node));
        v += -inner[0] + add(inner.slice(1));
      } else v += t.op === '-' ? -t.val : t.val;
    }
    return v;
  },
  // −9 + 4 = −13 : au lieu de soustraire les distances, on additionne celles des deux totaux (signe du total le plus éloigné)
  ADDDIST: (top) => {
    const { P, N } = ruleParts(top);
    if (!(P > 0n && N < 0n && P + N !== 0n)) return null;
    return sg(P + N) * (P + abs(N));
  },
  // a − b + … : la première soustraction change le signe des DEUX nombres (−(a − b)), le reste est juste
  FLIPBOTH: (top) => {
    if (formOf(top) === 'simp' || top.length < 3 || top[0].op !== '+' || top[1].op !== '-') return null;
    const t = ruleParts(top).terms;
    return -t[0] - t[1] + add(t.slice(2));
  },
};
const MISC_PREFIXES = ['MISC-JABRI-', 'MISC-JAMNISB-'];
const nameOf = (id) => {
  const p = MISC_PREFIXES.find((x) => id.startsWith(x));
  if (!p) throw new Error(`identifiant d'erreur inconnu « ${id} »`);
  return id.slice(p.length);
};
const errorOf = (src, id) => { const f = FORMULA[nameOf(id)]; if (!f) throw new Error(`formule absente pour ${id}`); return f(topOf(src)); };

/* ── relecture des options du fichier ── */
const numsOf = (c) => (c.replace(/\{,\}/g, '.').match(/-?\d+(?:\.\d+)?/g) ?? []);
const termsOfWriting = (content) => topOf(asciiOf(content)).map((t) => (t.op === '-' ? -t.val : t.val)); // « (-9)+(+2) » ou « -9+2 » → [-9, 2]
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

const COUNTED_FALSE = new Set(['side', 'placecount', 'distz', 'decide', 'order', 'yesno']);
const NUMERIC = new Set(['calc', 'placecount', 'distz']);

/* clé et vérité de chaque question */
const specValue = (s) => {
  switch (s.kind) {
    case 'calc': return valueOf(s.expr);
    case 'placecount': { const x = valueOf(s.of); const st = D(s.step); if (x % st !== 0n) throw new Error(`${s.key} : non divisible`); return (x / st) * SC; }
    case 'distz': return abs(valueOf(s.of));
    default: return null;
  }
};
const KEYS = new Map();
for (const s of SPECS) KEYS.set(s.key, specValue(s));

const optionTruth = (s, o) => {
  switch (s.kind) {
    case 'calc': return D(o.v) === KEYS.get(s.key);
    case 'turn': { const top = topOf(s.expr); return sameList(termsOfWriting(o.w), ruleParts(top).terms); }
    case 'simp': { const top = topOf(s.expr); return sameList(termsOfWriting(o.w), ruleParts(top).terms); }
    case 'turnterm': return D(o.v) === -valueOf(s.term);
    case 'blank': return valueOf(s.tpl.replace('?', o.v)) === D(s.target);
    case 'target': return valueOf(o.w) === D(s.target);
    case 'side': return o.v === (valueOf(s.of) > 0n ? 'R' : 'L');
    case 'yesno': return (o.v === 'Y') === (valueOf(s.x) === valueOf(s.y));
    case 'decide': {
      const vals = s.items.map((it) => valueOf(it.expr));
      const score = { min: (x) => x, max: (x) => -x, nearest: (x) => abs(x), farthest: (x) => -abs(x) }[s.ask];
      const sc = vals.map(score); const best = sc.reduce((p, q) => (p < q ? p : q));
      if (sc.filter((x) => x === best).length !== 1) throw new Error(`${s.key} : égalité`);
      return s.items[sc.indexOf(best)].label === o.v;
    }
    case 'order': {
      const want = s.items.map((it) => valueOf(it.expr)).sort((p, q) => (p < q ? -1 : p > q ? 1 : 0));
      return sameList(o.v.map(D), want);
    }
    case 'magicbad': {
      const g = s.grid.map((r) => r.map(D)); const m = D(s.magic);
      const rows = g.map((r) => add(r)); const cols = g[0].map((_, c) => add(g.map((r) => r[c])));
      const wr = rows.map((x, i) => (x !== m ? i : -1)).filter((i) => i >= 0); const wc = cols.map((x, i) => (x !== m ? i : -1)).filter((i) => i >= 0);
      if (wr.length !== 1 || wc.length !== 1) throw new Error(`${s.key} : plusieurs lignes ou colonnes fausses`);
      return o.v[0] === wr[0] && o.v[1] === wc[0];
    }
    default: throw new Error(s.kind);
  }
};
const choiceIndex = (s) => {
  const hits = s.opts.map((o, k) => (optionTruth(s, o) ? k : -1)).filter((k) => k >= 0);
  if (hits.length !== 1) throw new Error(`${s.key} : ${hits.length} options justes`);
  return hits[0];
};
const answerOf = (s) => {
  if (s.kind === 'calc' && s.mode === 'r') return R(txt(KEYS.get(s.key)));
  if (NUMERIC.has(s.kind) && s.kind !== 'calc') return R(txt(KEYS.get(s.key)));
  return C('ABCDEF'[choiceIndex(s)]);
};
export const ORACLE = Object.fromEntries(SPECS.map((s) => [s.key, answerOf(s)]));

/* ── contrôles de texte ── */
const FORBIDDEN = ['خمر', 'خنزير', 'قمار', 'نرد', 'يانصيب', 'ربا', 'ربوي', 'فائدة', 'كازينو', 'مراهنة', 'رهان', '🐷', 'الكتاب', 'رمضان', 'فوانيس'];
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
    if (/نغيّر إشارات|نغيّر إشارة/.test(t)) errs.push(`${label} : « نغيّر إشارات » est la règle de la 3AM, jamais dans cette leçon « ${t.slice(0, 40)} »`);
    if (/[0-9]\s*m\b/.test(outsideMath(t)) || /\$\d[^$]*\$\s*m\b/.test(t)) errs.push(`${label} : valeur + unité latine hors îlot « ${t.slice(0, 40)} »`);
    for (const f of FORBIDDEN) if (f === '🐷' ? t.includes(f) : hasWord(t, f)) errs.push(`${label} : terme interdit « ${f} »`);
  }
  return errs;
};

/* ── le corrigé d'une chaîne contient chacune de ses étapes ── */
const solutionErrors = (s, q) => {
  const errs = []; const sol = (q.solution?.lines ?? []).join('\n');
  const src = s.kind === 'calc' ? s.expr : s.of;
  const top = topOf(src); const r = ruleParts(top);
  const total = r.total;
  if (s.kind === 'calc') {
    const lines = q.solution?.lines ?? [];
    if (lines.at(-1) !== `$${texOf(src)}=${brk(total)}$`) errs.push(`${s.key} : le corrigé ne se termine pas par « ${texOf(src)}=${brk(total)} »`);
    // les groupes à plusieurs termes sont calculés d'abord : « [...]=(+5) » figure dans le corrigé
    for (const t of top) if (t.node.k === 'grp' && !isSingleSigned(t.node)) {
      const g = `$${texOf(t.node.text)}=${brk(t.val)}$`;
      if (!sol.includes(g)) errs.push(`${s.key} : le groupe « ${t.node.text} » n'est pas calculé d'abord dans le corrigé`);
      // le groupe interne est lui-même calculé par la règle de la leçon
      const inner = topOf(t.node.text.slice(1, -1)); const ri = ruleParts(inner);
      if (ri.total !== t.val) errs.push(`${s.key} : groupe ${t.node.text} ≠ règle`);
    }
    const anySub = top.some((t) => t.op === '-'); const plain = top.some((t) => t.node.k === 'num');
    if (anySub || plain) { const w = r.terms.map(brk).join('+'); if (!sol.includes(`=${w}$`)) errs.push(`${s.key} : le corrigé n'écrit pas la somme « ${w} »`); }
    if (r.neg.length >= 2 && !sol.includes(`$${r.neg.map(brk).join('+')}=${brk(r.N)}$`)) errs.push(`${s.key} : total des négatifs absent`);
    if (r.pos.length >= 2 && !sol.includes(`$${r.pos.map(brk).join('+')}=${brk(r.P)}$`)) errs.push(`${s.key} : total des positifs absent`);
    if (r.neg.length && r.pos.length && !sol.includes(`$${brk(r.N)}+${brk(r.P)}=${brk(total)}$`)) errs.push(`${s.key} : total final absent`);
    if (!q.statement.includes(texOf(src))) errs.push(`${s.key} : l'énoncé retapé « ${texOf(src)} » ne figure pas dans la question`);
  } else if (!sol.includes(texOf(src))) errs.push(`${s.key} : le corrigé ne reprend pas « ${texOf(src)} »`);
  return errs;
};

/* ── provenance : relue dans les fichiers du banc ── */
const BANK_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content/practice/2am/majmu-jabri');
const TERM_EXAMS = new Set(["2am-s2-72:1", "2am-s1-66:1", "2am-s2-75:1", "2am-s2-62:1", "2am-s2-73:1", "2am-s2-52:2", "2am-s2-63:1", "2am-s2-50:1", "1am-s2-79:2", "2am-s2-59:1", "2am-s3-44:1", "2am-s3-40:1", "2am-s2-70:1", "2am-s2-53:1", "2am-s2-71:2"]);
const ADAPTED = new Set(['ex-29', 'deep-39', 'ex-37', 'deep-43', 'deep-47', 'deep-49', 'deep-50', 'deep-59']);
const BADGES = { 'على منوال اختبار الفصل الأول': 1, 'على منوال اختبار الفصل الثاني': 2, 'على منوال اختبار الفصل الثالث': 3 };
const provenanceErrors = () => {
  const errs = []; let te = 0; let mod = 0; let ad = 0; const cited = new Set(); const adaptedSeen = new Set();
  for (let lv = 1; lv <= 5; lv++) {
    const dir = join(BANK_DIR, `level-${lv}`);
    const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    if (files.length !== 10) errs.push(`niveau ${lv} : ${files.length} feuilles au lieu de 10`);
    for (const f of files) {
      const ex = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      const m = ex.metadata; const src = m.source; const tag = ex.id;
      const sem = BADGES[m.exam.badge] ?? null;
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
        if (!ADAPTED.has(src.elementId) || adaptedSeen.has(src.elementId)) errs.push(`${tag} : élément adapté ${src.elementId} inattendu ou cité deux fois`);
        adaptedSeen.add(src.elementId);
        if (m.exam.kind !== 'adapted' || m.exam.badge !== null) errs.push(`${tag} : adapted incohérent`);
      } else errs.push(`${tag} : source inconnue`);
      errs.push(...textErrors(tag, allStrings({ s: ex.statement.content, t: m.title })));
      for (const q of ex.questions) {
        const cs = q.choices ?? [];
        if (cs.length && cs[0].isCorrect) errs.push(`${tag}:${q.id} : la bonne option ne doit jamais venir en premier`);
      }
    }
  }
  if (te !== TERM_EXAMS.size) errs.push(`${te} term_exam au lieu de ${TERM_EXAMS.size}`);
  if (te + mod + ad !== 50) errs.push('50 feuilles attendues');
  if (cited.size !== TERM_EXAMS.size) errs.push('un term_exam lu n\'est cité par aucune feuille');
  if (adaptedSeen.size !== ADAPTED.size) errs.push('un élément adapté n\'est cité par aucune feuille');
  return errs;
};

/** relit les fichiers du banc : clé, QCM, signatures et distracteurs nommés, texte, provenance */
export function audit(bank) {
  const errs = []; const byKey = new Map(bank.map((b) => [b.key, b.q]));
  for (const s of SPECS) {
    const q = byKey.get(s.key);
    if (!q) { errs.push(`${s.key} : question absente`); continue; }
    const lpCode = q.learningPoints?.find((l) => l.role === 'primary')?.code;
    if (lpCode !== `2am_majmu-jabri_${s.lp}`) errs.push(`${s.key} : LP ${lpCode} ≠ ${s.lp}`);
    // la bonne الكفاءة d'une chaîne comptée est recalculée : forme simplifiée → P3, sinon P2
    if (s.kind === 'calc' && s.counted) { const want = formOf(topOf(s.expr)) === 'simp' ? 'P3' : 'P2'; if (want !== s.lp) errs.push(`${s.key} : الكفاءة recalculée ${want} ≠ ${s.lp}`); }
    if (s.kind === 'turn' || s.kind === 'turnterm' || s.kind === 'blank') { if (s.lp !== 'P1') errs.push(`${s.key} : écriture en somme → P1`); }
    if (s.kind === 'simp' || s.kind === 'target') { if (s.lp !== 'P3') errs.push(`${s.key} : écriture simplifiée → P3`); }
    const shouldBeCounted = !(COUNTED_FALSE.has(s.kind) || (s.kind === 'calc' && s.counted === false));
    if (shouldBeCounted && q.counted === false) errs.push(`${s.key} : devrait être comptée`);
    if (!shouldBeCounted && q.counted !== false) errs.push(`${s.key} : étape d'une leçon antérieure → counted: false`);
    if (s.kind === 'calc' && (s.counted === false) !== (q.counted === false)) errs.push(`${s.key} : counted incohérent`);
    errs.push(...textErrors(s.key, allStrings({ st: q.statement, ch: q.choices, h: q.hints, f: q.feedback, sol: q.solution, fmt: q.answerFormat })));
    if (s.kind === 'calc' || s.kind === 'placecount' || s.kind === 'distz' || s.kind === 'side') errs.push(...solutionErrors(s, q));
    // ── réponse construite ──
    if (s.kind === 'calc' && s.mode === 'r' || s.kind === 'placecount' || s.kind === 'distz') {
      const key = KEYS.get(s.key);
      if (q.answerType !== 'rational') { errs.push(`${s.key} : devrait être rational`); continue; }
      if (D(String(q.expectedAnswer)) !== key) errs.push(`${s.key} : clé ${q.expectedAnswer} ≠ ${txt(key)}`);
      if (q.solution?.result !== undefined && !(numsOf(q.solution.result).length === 1 && D(numsOf(q.solution.result)[0]) === key)) errs.push(`${s.key} : solution.result ${q.solution.result} ≠ ${txt(key)}`);
      if (s.kind === 'calc') {
        const sigs = q.misconceptionSignatures ?? [];
        for (const sig of sigs) {
          const ev = errorOf(s.expr, sig.id);
          if (ev === null) errs.push(`${s.key} : signature ${sig.id} ne s'applique pas à ce calcul`);
          else if (D(String(sig.value)) !== ev) errs.push(`${s.key} : signature ${sig.id}=${sig.value} ≠ l'erreur recalculée ${txt(ev)}`);
          if (D(String(sig.value)) === key) errs.push(`${s.key} : signature ${sig.id} = la bonne réponse`);
        }
        const got = sigs.map((x) => x.id).sort().join(); const want = [...(s.sigs ?? [])].sort().join();
        if (got !== want) errs.push(`${s.key} : signatures ${got} ≠ attendues ${want}`);
        if (new Set(sigs.map((x) => x.value)).size !== sigs.length) errs.push(`${s.key} : deux signatures de même valeur`);
      }
      continue;
    }
    if (s.kind === 'calc' || ['turn', 'simp', 'turnterm', 'blank', 'target', 'side', 'yesno', 'decide', 'order', 'magicbad'].includes(s.kind)) {
      if (q.answerType !== 'choice') { errs.push(`${s.key} : devrait être choice`); continue; }
      if (q.choices.length !== s.opts.length) { errs.push(`${s.key} : ${q.choices.length} options, ${s.opts.length} retapées`); continue; }
      let good;
      try { good = choiceIndex(s); } catch (e) { errs.push(e.message); continue; }
      q.choices.forEach((c, k) => {
        const o = s.opts[k];
        // l'option du fichier est relue et comparée à la valeur retapée
        const content = c.content;
        let same = true;
        if (s.kind === 'calc') same = D(numsOf(content)[0]) === D(o.v);
        else if (s.kind === 'turn') same = sameList(termsOfWriting(content), termsOfWriting(o.w));
        else if (s.kind === 'simp') same = sameList(termsOfWriting(content), termsOfWriting(o.w));
        else if (s.kind === 'turnterm') same = D(numsOf(content)[0] ?? '0') === D(o.v);
        else if (s.kind === 'blank') same = asciiOf(content) === o.v;
        else if (s.kind === 'target') same = sameList(termsOfWriting(content), termsOfWriting(o.w));
        else if (s.kind === 'side') same = (content.includes('يمين') ? 'R' : content.includes('يسار') ? 'L' : '?') === o.v;
        else if (s.kind === 'yesno') same = (content.trim() === 'نعم' ? 'Y' : content.trim() === 'لا' ? 'N' : '?') === o.v;
        else if (s.kind === 'decide') same = content.replace(/\$/g, '').trim() === o.v.replace(/\$/g, '').trim();
        else if (s.kind === 'order') same = sameList(numsOf(content).map(D), o.v.map(D));
        else if (s.kind === 'magicbad') same = (() => { const n = numsOf(content).map(Number); return n[0] - 1 === o.v[0] && n[1] - 1 === o.v[1]; })();
        if (!same) errs.push(`${s.key} : option ${c.id} « ${content} » ≠ valeur retapée`);
        if (c.isCorrect !== (k === good)) errs.push(`${s.key} : option ${c.id} isCorrect=${c.isCorrect} mais le calcul dit ${k === good}`);
        // l'erreur nommée de l'option est recalculée et fausse
        if (c.misconceptionId) {
          if (k === good) errs.push(`${s.key} : la bonne option porte ${c.misconceptionId}`);
          else if (s.kind === 'calc') {
            const ev = errorOf(s.expr, c.misconceptionId);
            if (ev === null || ev !== D(numsOf(content)[0])) errs.push(`${s.key} : option ${c.id} ≠ erreur ${c.misconceptionId} recalculée`);
          } else if (s.kind === 'turn') {
            const top = topOf(s.expr); const want = { NOTURN: top.map((t) => t.val), TURNALL: top.map((t) => -t.val), FLIPBOTH: (() => { const t = ruleParts(top).terms; return [-t[0], -t[1], ...t.slice(2)]; })() }[nameOf(c.misconceptionId)];
            if (!want || !sameList(termsOfWriting(content), want)) errs.push(`${s.key} : option ${c.id} ≠ écriture de ${c.misconceptionId}`);
            if (add(termsOfWriting(content)) === KEYS_OF(s)) errs.push(`${s.key} : option ${c.id} a la valeur de la bonne réponse`);
          } else if (s.kind === 'simp') {
            const top = topOf(s.expr); const t = ruleParts(top).terms;
            const want = { SIMPLIFYSIGN: top.map((x) => x.val), FIRSTSIGN: [abs(t[0]), ...t.slice(1)], TURNALL: top.map((x) => -x.val) }[nameOf(c.misconceptionId)];
            if (!want || !sameList(termsOfWriting(content), want)) errs.push(`${s.key} : option ${c.id} ≠ écriture de ${c.misconceptionId}`);
            if (add(termsOfWriting(content)) === add(t)) errs.push(`${s.key} : option ${c.id} a la valeur de la bonne réponse`);
          } else if (s.kind === 'turnterm') {
            if (nameOf(c.misconceptionId) !== 'NOTURN' || D(numsOf(content)[0]) !== valueOf(s.term)) errs.push(`${s.key} : option ${c.id} ≠ erreur NOTURN`);
          }
        }
        if ((o.misc ?? null) !== (c.misconceptionId ?? null)) errs.push(`${s.key} : option ${c.id} misconceptionId ${c.misconceptionId} ≠ ${o.misc}`);
      });
      if (s.kind === 'decide' || s.kind === 'order') {
        // les valeurs comparées apparaissent dans le corrigé
        const sol = (q.solution?.lines ?? []).join('\n');
        for (const it of s.items) { const v = valueOf(it.expr); if (!sol.includes(`$${ltx(v)}$`)) errs.push(`${s.key} : le corrigé n'indique pas la valeur ${txt(v)} de « ${it.expr} »`); }
      }
    }
  }
  for (const b of bank) {
    if (b.q.answerType !== 'selfCheck' && !(b.key in ORACLE)) errs.push(`${b.key} : sans vérification`);
    if (b.q.answerType === 'selfCheck' && b.q.expectedAnswer !== undefined) errs.push(`${b.key} : selfCheck avec clé`);
    if (b.q.answerType === 'selfCheck') errs.push(...textErrors(b.key, allStrings({ st: b.q.statement, h: b.q.hints, f: b.q.feedback, sol: b.q.solution })));
  }
  errs.push(...provenanceErrors());
  return errs;
}
function KEYS_OF(s) { return valueOf(s.expr); }
