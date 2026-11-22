// Oracle du banc « barahin-ashia » (unité 11 « الأشعة والانسحاب ») — chaque réponse construite RECALCULÉE ici à partir des
// nombres de l'énoncé (helpers.mjs : R, C, q), sans lire le contenu ni packages/core/arithmetic/vectors.js ni la logique du lab.
// Les longueurs viennent d'un raisonnement vectoriel refait ici sur des coordonnées entières choisies par l'oracle (une
// figure qui réalise l'énoncé) : une égalité de vecteurs donne une égalité de longueurs, un milieu une moitié, une boucle
// fermée le vecteur nul. Les QCM calculables sont aussi recalculés (`pick` : exactement une option vraie).
// Fusionné dans scripts/practice-answer-oracle.test.mjs. Généré avec le banc par le script de l'auteur (gen-barahin.mjs).
import { R, C, q } from './helpers.mjs';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (...vs) => vs.reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
const eqv = (u, v) => u[0] === v[0] && u[1] === v[1];
const n2 = (v) => v[0] * v[0] + v[1] * v[1];
const LETTERS = ['A', 'B', 'C', 'D'];
function pick(flags) {
  const ok = flags.map((f, i) => (f ? LETTERS[i] : null)).filter(Boolean);
  if (ok.length !== 1) throw new Error(`barahin-ashia oracle: ${ok.length} options vraies`);
  return C(ok[0]);
}
/** Une longueur L0 connue sur un vecteur u, la longueur cherchée sur v : u et v de même norme ⇒ la même longueur. */
const sameLength = (u, v, L0) => { if (n2(u) !== n2(v)) throw new Error('normes différentes'); return R(L0); };

// ex-17 : J centre de ABCD (A(0;0) B(6;0) C(8;4) D(2;4)), JO = JA + JB ; AD = 6 ⇒ JO = 6.
const A17 = [0, 0]; const B17 = [6, 0]; const D17 = [2, 4]; const J17 = [4, 2];
const JO = add(sub(A17, J17), sub(B17, J17));
// L4 : O milieu de [AB] et de [CD] ⇒ ACBD parallélogramme, BC = AD = 4.
const A9 = [0, 0]; const B9 = [6, 0]; const C9 = [2, 3]; const O9 = [3, 0]; const D9 = sub([2 * O9[0], 2 * O9[1]], C9);
// L5 : la tournée du livreur R → A → B → C → R.
const tour = [[0, 0], [3, 1], [4, 4], [1, 3], [0, 0]];
const disp = tour.slice(1).reduce((s, p, i) => add(s, sub(p, tour[i])), [0, 0]);
// L5 : ABCD avec AB = DC ⇒ parallélogramme : BC = AD = 80.
const A8 = [0, 0]; const B8 = [3, 0]; const D8 = [1, 2]; const C8 = add(D8, sub(B8, A8));

// QCM recalculés : la figure du manuel de l'ex-20 (A(0;6), B(0;0), C(2;−3), D(2;3), E(4;0), F(4;6)).
const P20 = { A: [0, 6], B: [0, 0], C: [2, -3], D: [2, 3], E: [4, 0], F: [4, 6] };
const v20 = (n) => sub(P20[n[1]], P20[n[0]]);
const ce_fe = add(v20('CE'), v20('FE'));
// ex-21 corrigé (A(0;0), B(6;0), K(2;4)) : le milieu de [ED].
const A21 = [0, 0]; const B21 = [6, 0]; const K21 = [2, 4]; const L21 = [3, 0];
const D21 = add(B21, sub(K21, L21)); const E21 = add(L21, sub(A21, L21), sub(K21, L21));
const M21 = [(E21[0] + D21[0]) / 2, (E21[1] + D21[1]) / 2];
// دوري الآن ص 138 (A(0;0), B(4;1), C(1;3), E(6;4)) : R(11;8), S(10;5), T(7;4).
const P138 = { A: [0, 0], B: [4, 1], C: [1, 3], E: [6, 4] };
const v138 = (n) => sub(P138[n[1]], P138[n[0]]);
const G1 = add(P138.E, v138('AB'), v138('AC')); const G2 = add(P138.E, v138('BE'), v138('CA'));

export const ORACLE = {
  'ex-4am-barahin-ashia-l1-008:q1': R(4),                                    // la translation conserve le rayon
  'ex-4am-barahin-ashia-l2-005:q1': R(q(10).div(2)),                          // AM = MB : M milieu
  'ex-4am-barahin-ashia-l3-004:q1': sameLength(JO, sub(A17, D17), 6),         // JO = DA
  'ex-4am-barahin-ashia-l3-008:q1': R(q(3).add(4)),                           // B ∈ [AC] : AC = AB + BC
  'ex-4am-barahin-ashia-l4-004:q3': R(2),                                    // (Γ₂) : rayon de (Γ)
  'ex-4am-barahin-ashia-l4-008:q1': sameLength(sub(D9, A9), sub(B9, C9), 4),   // AD = CB
  'ex-4am-barahin-ashia-l4-009:q1': R(q('3.5').mul(2)),                       // AB = BC : AC = 2 AB
  'ex-4am-barahin-ashia-l5-003:q2': R(Math.sqrt(n2(disp))),                   // boucle fermée : vecteur nul
  'ex-4am-barahin-ashia-l5-008:q1': sameLength(sub(C8, B8), sub(D8, A8), 80),  // BC = AD
  // QCM recalculés
  'ex-4am-barahin-ashia-l3-001:q1': pick([eqv(ce_fe, v20('AD')), eqv(ce_fe, v20('CF')), eqv(ce_fe, v20('DA'))]),
  'ex-4am-barahin-ashia-l4-002:q1': pick([eqv(M21, K21), eqv(M21, L21), eqv(M21, A21)]),
  'ex-4am-barahin-ashia-l4-004:q1': pick([eqv(G1, [11, 8]), eqv(G1, [10, 5]), eqv(G1, [7, 4])]),
  'ex-4am-barahin-ashia-l4-004:q2': pick([eqv(G2, [7, 4]), eqv(G2, [11, 8]), eqv(G2, P138.E)]),
};
