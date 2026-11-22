// Oracle du banc « hisab-murakkibatay » (unité 12 « الأشعة في معلم ») — chaque réponse construite RECALCULÉE ici à partir des
// nombres de l'énoncé avec la calculette exacte de helpers.mjs (q), sans lire le contenu ni packages/core/arithmetic/vectors.js
// ni la logique du lab. La seule mathématique en jeu est celle du درس :
//   comp(A, B)       les composantes de AB : (x_B − x_A ; y_B − y_A)
//   end(A, u)        B tel que AB = u : (x_A + a ; y_A + b)
//   start(B, u)      A tel que AB = u : (x_B − a ; y_B − b)
//   fourth(A, B, C)  D tel que ABCD soit un متوازي أضلاع (AB = DC) : (x_A + x_C − x_B ; y_A + y_C − y_B)
//   sumEnd(A, B, C)  D tel que AD = AB + AC
//   negOf(u)         le couple opposé (AB = PO ⇒ P = −AB)
// Fusionné dans scripts/practice-answer-oracle.test.mjs. Les QCM sont vérifiés par l'aller-retour du validateur.
// Généré avec le banc par le script de l'auteur ; ne pas éditer une entrée sans recalculer l'autre côté.
import { P, q } from './helpers.mjs';

const s = (v) => v.toString();
const comp = (A, B) => [s(q(B[0]).sub(A[0])), s(q(B[1]).sub(A[1]))];
const end = (A, u) => [s(q(A[0]).add(u[0])), s(q(A[1]).add(u[1]))];
const start = (B, u) => [s(q(B[0]).sub(u[0])), s(q(B[1]).sub(u[1]))];
const fourth = (A, B, C) => [s(q(A[0]).add(C[0]).sub(B[0])), s(q(A[1]).add(C[1]).sub(B[1]))];
const sumEnd = (A, B, C) => end(A, [s(q(B[0]).sub(A[0]).add(q(C[0]).sub(A[0]))), s(q(B[1]).sub(A[1]).add(q(C[1]).sub(A[1])))]);
const negOf = (u) => [s(q(0).sub(u[0])), s(q(0).sub(u[1]))];

export const ORACLE = {
  'ex-4am-hisab-murakkibatay-l1-001:q1': P(...comp(["2","3"], ["-4","5"])),
  'ex-4am-hisab-murakkibatay-l1-001:q2': P(...comp(["-4","5"], ["1","0"])),
  'ex-4am-hisab-murakkibatay-l1-001:q3': P(...comp(["-1","1"], ["2","3"])),
  'ex-4am-hisab-murakkibatay-l1-002:q1': P(...comp(["1","6"], ["-2","-6"])),
  'ex-4am-hisab-murakkibatay-l1-002:q2': P(...comp(["-2","-6"], ["-2","4"])),
  'ex-4am-hisab-murakkibatay-l1-002:q3': P(...comp(["1","6"], ["-2","4"])),
  'ex-4am-hisab-murakkibatay-l1-004:q1': P(...comp(["2","1"], ["6","4"])),
  'ex-4am-hisab-murakkibatay-l1-004:q2': P(...comp(["6","4"], ["2","1"])),
  'ex-4am-hisab-murakkibatay-l1-005:q1': P(...comp(["0","0"], ["-3","5"])),
  'ex-4am-hisab-murakkibatay-l1-007:q1': P(...end(["1","1"], ["4","-1"])),
  'ex-4am-hisab-murakkibatay-l1-008:q1': P(...comp(["-4","2"], ["3","-1"])),
  'ex-4am-hisab-murakkibatay-l2-001:q1': P(...comp(["3","1"], ["2","-5"])),
  'ex-4am-hisab-murakkibatay-l2-001:q2': P(...end(["2","-5"], ["3","4"])),
  'ex-4am-hisab-murakkibatay-l2-001:q3': P(...comp(["3","1"], ["6","5"])),
  'ex-4am-hisab-murakkibatay-l2-002:q1': P(...comp(["-2.5","4"], ["1","-1"])),
  'ex-4am-hisab-murakkibatay-l2-003:q1': P(...comp(["1.5","-6"], ["-3.5","-2.5"])),
  'ex-4am-hisab-murakkibatay-l2-003:q2': P(...comp(["-3.5","-2.5"], ["1.5","-6"])),
  'ex-4am-hisab-murakkibatay-l2-003:q3': P(...comp(["0","0"], ["-3.5","-2.5"])),
  'ex-4am-hisab-murakkibatay-l2-004:q1': P(...comp(["-1.2","0.5"], ["2.3","-1.5"])),
  'ex-4am-hisab-murakkibatay-l2-007:q1': P(...end(["-2","3"], ["-5","-4"])),
  'ex-4am-hisab-murakkibatay-l2-008:q1': P(...start(["4","-1"], ["6","-3"])),
  'ex-4am-hisab-murakkibatay-l2-010:q1': P(...comp(["-3","1"], ["2","3"])),
  'ex-4am-hisab-murakkibatay-l3-001:q1': P(...start(["-10","10"], ["3","2"])),
  'ex-4am-hisab-murakkibatay-l3-001:q2': P(...end(["-4","1.5"], ["2","-5"])),
  'ex-4am-hisab-murakkibatay-l3-002:q1': P(...comp(["2","2"], ["-3","2.5"])),
  'ex-4am-hisab-murakkibatay-l3-002:q2': P(...negOf(comp(["2","2"], ["-3","2.5"]))),
  'ex-4am-hisab-murakkibatay-l3-003:q1': P(...comp(["1","0"], ["0","3"])),
  'ex-4am-hisab-murakkibatay-l3-003:q2': P(...comp(["-2","-3"], ["-3","0"])),
  'ex-4am-hisab-murakkibatay-l3-004:q1': P(...comp(["-4","-1"], ["3","-1"])),
  'ex-4am-hisab-murakkibatay-l3-005:q1': P(...start(["-1","4"], comp(["2","-1"], ["5","3"]))),
  'ex-4am-hisab-murakkibatay-l3-006:q1': P(...end(["-2","-1"], comp(["1","4"], ["3","1"]))),
  'ex-4am-hisab-murakkibatay-l3-008:q1': P(...end(["0","5"], comp(["-3","2"], ["1","-2"]))),
  'ex-4am-hisab-murakkibatay-l3-010:q1': P(...comp(["1/2","2/3"], ["3/4","-1/3"])),
  'ex-4am-hisab-murakkibatay-l4-001:q1': P(...fourth(["1","1"], ["-1","4"], ["3","3"])),
  'ex-4am-hisab-murakkibatay-l4-002:q1': P(...sumEnd(["1","-1"], ["0","3"], ["-2","0"])),
  'ex-4am-hisab-murakkibatay-l4-003:q1': P(...fourth(["-3","-2"], ["2","-4"], ["4","1"])),
  'ex-4am-hisab-murakkibatay-l4-005:q1': P(...end(["0","4"], comp(["2","0"], ["5","2"]))),
  'ex-4am-hisab-murakkibatay-l4-006:q1': P(...fourth(["-4","1"], ["1","3"], ["3","-2"])),
  'ex-4am-hisab-murakkibatay-l4-008:q1': P(...end(["-2","-3"], comp(["1","2"], ["4","-1"]))),
  'ex-4am-hisab-murakkibatay-l4-010:q1': P(...end(["0","2"], comp(["-1","-2"], ["3","-1"]))),
  'ex-4am-hisab-murakkibatay-l5-001:q1': P(...comp(["-1","1/2"], ["1/2","13/3"])),
  'ex-4am-hisab-murakkibatay-l5-001:q2': P(...comp(["1/2","13/3"], ["0","4"])),
  'ex-4am-hisab-murakkibatay-l5-001:q3': P(...comp(["-1","1/2"], ["0","4"])),
  'ex-4am-hisab-murakkibatay-l5-002:q1': P(...comp(["3/2","1/2"], ["1/4","5/6"])),
  'ex-4am-hisab-murakkibatay-l5-002:q2': P(...comp(["1/4","5/6"], ["-4","7"])),
  'ex-4am-hisab-murakkibatay-l5-002:q3': P(...comp(["3/2","1/2"], ["-4","7"])),
  'ex-4am-hisab-murakkibatay-l5-004:q1': P(...end(["1","-4"], comp(["-2","3"], ["4","1"]))),
  'ex-4am-hisab-murakkibatay-l5-004:q2': P(...end(end(["1","-4"], comp(["-2","3"], ["4","1"])), comp(["-2","3"], ["1","-4"]))),
  'ex-4am-hisab-murakkibatay-l5-006:q1': P(...end(["-3","2"], ["4","3"])),
  'ex-4am-hisab-murakkibatay-l5-006:q2': P(...end(["1","-2"], ["4","3"])),
  'ex-4am-hisab-murakkibatay-l5-007:q1': P(...end(["-1","2/3"], comp(["1/2","-1"], ["5/2","1/3"]))),
  'ex-4am-hisab-murakkibatay-l5-008:q1': P(...fourth(["-1.5","2.5"], ["3.5","4"], ["2","-0.5"])),
  'ex-4am-hisab-murakkibatay-l5-010:q1': P("2", "-2"),
};
