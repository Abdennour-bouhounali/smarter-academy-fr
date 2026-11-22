// Oracle du banc « wadiya-idmajiya-taalufiya » au format BEM (unité 7 « الدالة التآلفية », أدمج تعلّماتي ; banque réécrite
// le 2026-10-07 : BEM 2017 الجزء الثاني + 9 وضعيات « على منوال » au niveau 5, feuilles « على منوال » et adapted aux niveaux
// 1–4). Chaque réponse est RECALCULÉE ici à partir des nombres de l'énoncé (tarifs, deux devis, deux nœuds du quadrillage
// d'une figure, côtés du carré de BEM 2017…), en rationnels exacts (helpers.mjs), sans lire le contenu ni le code testé.
// Fusionné dans scripts/practice-answer-oracle.test.mjs. Les étapes « مثّل بيانيا » / « بيّن أن » (selfCheck) n'ont pas de clé.
//
// Outils :
//   lin(m, p)              y = m·x + p (m : ce qui est payé / gagné par unité, p : ce qui est payé une fois) : { m, p }
//   K(v)                   une fonction constante (forfait)
//   thru(x1, y1, x2, y2)   la droite par deux points (تناسب التغيّرات) : { m, p }
//   scale(L, ux, uy)       la droite d'une figure dans les unités réelles (1 graduation = ux en abscisse, uy en ordonnée)
//   at(L, x), inv(L, y)    image, et nombre dont l'image est y
//   eqx(L1, L2)            l'abscisse où deux droites se coupent (erreur si parallèles)
//   meet(L1, L2)           le point d'intersection, en clé `point`
//   dirOf(L1, op, L2)      le sens de « L1(x) op L2(x) » une fois résolue : 'A' = « x < k », 'B' = « x > k »
//   cheapest(x, offers)    la lettre de l'offre la moins chère en x (égalité → erreur)
//   maxInt / maxIntDown    le plus grand entier n avec L(n) ≤ m (L croissante) / L(n) ≥ m (L décroissante), cherché PAS À PAS
//   firstInt(pred)         le plus petit entier qui vérifie pred, cherché pas à pas
//   isqrt(n)               la racine carrée entière exacte (erreur si n n'est pas un carré)
import { R, C, P, q, solve2 } from './helpers.mjs';

const sgn = (v) => { const n = q(v).n; return n > 0n ? 1 : n < 0n ? -1 : 0; };
const eq = (u, v) => sgn(q(u).sub(q(v))) === 0;
const lt = (u, v) => sgn(q(u).sub(q(v))) < 0;
const le = (u, v) => sgn(q(u).sub(q(v))) <= 0;
const lin = (m, p = 0) => ({ m: q(m), p: q(p) });
const K = (v) => lin(0, v);
const thru = (x1, y1, x2, y2) => { const m = q(y2).sub(q(y1)).div(q(x2).sub(q(x1))); return lin(m, q(y1).sub(m.mul(q(x1)))); };
const scale = (L, ux, uy) => lin(L.m.mul(q(uy)).div(q(ux)), L.p.mul(q(uy)));
const at = (L, x) => L.m.mul(q(x)).add(L.p);
const inv = (L, y) => { if (L.m.isZero()) throw new Error('oracle wadiya-taalufiya : fonction constante'); return q(y).sub(L.p).div(L.m); };
const eqx = (L1, L2) => {
  if (eq(L1.m, L2.m)) throw new Error('oracle wadiya-taalufiya : droites parallèles');
  return L2.p.sub(L1.p).div(L1.m.sub(L2.m));
};
const meet = (L1, L2) => { const x = eqx(L1, L2); return P(x.toString(), at(L1, x).toString()); };
/** « L1(x) op L2(x) » (op = '<' ou '>') ⇔ (m1 − m2)·x op (p2 − p1) : le sens s'inverse si m1 − m2 < 0. */
const dirOf = (L1, op, L2) => {
  const d = sgn(L1.m.sub(L2.m));
  if (d === 0) throw new Error('oracle wadiya-taalufiya : inéquation sans x');
  const gt = (op === '>') === (d > 0);
  return C(gt ? 'B' : 'A');
};
const LETTERS = 'ABCD';
const cheapest = (x, offers) => {
  const v = offers.map((L) => at(L, x));
  let best = 0;
  v.forEach((c, i) => { if (lt(c, v[best])) best = i; });
  if (v.some((c, i) => i !== best && eq(c, v[best]))) throw new Error('oracle wadiya-taalufiya : égalité de tarifs');
  return C(LETTERS[best]);
};
function maxInt(L, m) {
  if (sgn(L.m) <= 0) throw new Error('oracle wadiya-taalufiya : maxInt veut une fonction croissante');
  let n = 0; while (le(at(L, n + 1), m)) { n += 1; if (n > 1e6) throw new Error('oracle : boucle'); }
  return n;
}
function maxIntDown(L, m) {
  if (sgn(L.m) >= 0) throw new Error('oracle wadiya-taalufiya : maxIntDown veut une fonction décroissante');
  let n = 0; while (!lt(at(L, n + 1), m)) { n += 1; if (n > 1e6) throw new Error('oracle : boucle'); }
  return n;
}
function firstInt(pred) {
  for (let n = 0; n < 1e6; n += 1) if (pred(n)) return n;
  throw new Error('oracle wadiya-taalufiya : aucun entier');
}
function isqrt(v) {
  const n = Number(q(v).toString());
  const r = firstInt((k) => k * k >= n);
  if (r * r !== n) throw new Error('oracle wadiya-taalufiya : pas un carré');
  return r;
}
const r = (v) => R(q(v).toString());
const yes = (b) => C(b ? 'A' : 'B'); // questions « نعم / لا » : A = نعم , B = لا

const ID = 'ex-4am-wadiya-idmajiya-taalufiya';
const O = {};
const put = (id, keys) => { for (const [k, v] of Object.entries(keys)) O[`${ID}-${id}:${k}`] = v; };

/* ═════════════ Niveau 1 ═════════════ */
{ const f = lin(35, 80); put('l1-001', { q1: r(f.m), q2: r(f.p), q3: r(at(f, 6)) }); }
{ const f = lin(100, 200); put('l1-002', { q1: r(at(f, 3)), q2: r(inv(f, 700)) }); }
{ const f = lin(12, 300); put('l1-003', { q1: r(f.m), q2: r(f.p), q3: yes(f.p.isZero()) }); } // proportionnel ⇔ b = 0
{ const f = lin(45, 250); put('l1-004', { q1: r(at(f, 0)), q2: r(f.m), q3: r(at(f, 20)) }); }
{ const f = thru(5, 4000, 9, 6400); put('l1-005', { q1: r(f.m), q2: r(f.p) }); }
put('l1-006', { q1: meet(lin(1, 2), lin(-1, 8)) });
{ const A = lin(50, 400); const B = lin(90); put('l1-007', { q1: r(at(A, 12)), q2: r(at(B, 12)), q3: cheapest(12, [A, B]) }); }
{ const f = lin(150, 200); put('l1-008', { q1: r(at(f, 4)), q2: r(maxInt(f, 1000)) }); }
{ const f = lin(30, 120); const g = lin(50); const x = eqx(f, g); put('l1-009', { q1: r(x), q2: r(at(g, x)) }); }
{ const f = lin(25, 100); const g = lin(25, 160); put('l1-010', { q1: r(at(g, 4).sub(at(f, 4))), q2: yes(!eq(f.m, g.m) || eq(f.p, g.p)) }); }

/* ═════════════ Niveau 2 ═════════════ */
{ const f = thru(10, 180, 25, 330); put('l2-001', { q1: r(f.m), q2: r(f.p), q3: r(at(f, 40)) }); }
{ const f = lin(20, 150); put('l2-002', { q1: r(at(f, 7)), q2: r(inv(f, 450)) }); }
{ // x + y = 30 ; 100x + 200y = 4000 → y = (4000 − 100x)/200
  const d2 = lin(q(-100).div(200), q(4000).div(200));
  const [x, y] = solve2(1, 1, 30, 100, 200, 4000);
  if (!eq(at(d2, x), y)) throw new Error('oracle l2-003');
  put('l2-003', { q1: r(d2.m), q2: r(d2.p), q3: P(x, y) });
}
{ const A = lin(100, 500); const B = lin(200); put('l2-004', { q1: r(eqx(A, B)), q2: cheapest(8, [A, B]) }); }
{ // figure : A(0 ; 3) et B(2 ; 7), une graduation = 1
  const f = thru(0, 3, 2, 7); put('l2-005', { q1: r(f.p), q2: r(f.m), q3: r(at(f, 5)) });
}
{ const f = lin(-150, 2000); put('l2-006', { q1: r(at(f, 6)), q2: r(maxIntDown(f, 0)) }); }
{ const f = lin(5, -4); put('l2-007', { q1: r(inv(f, 6)), q2: r(at(f, -2)) }); }
{ const h = K(600); const g = lin(150); put('l2-008', { q1: C(h.m.isZero() ? 'A' : 'B'), q2: r(eqx(g, h)) }); }
{ const f = thru(-2, -11, 3, 9); if (!eq(f.m, 4) || !eq(f.p, -3)) throw new Error('oracle l2-009 : f(x) = 4x − 3 ?');
  put('l2-009', { q2: yes(eq(at(f, 4), 13)), q3: r(inv(f, 21)) }); }
{ const f = lin(120, 1500); put('l2-010', { q1: r(at(f, 20)), q2: r(maxInt(f, 5000)) }); }

/* ═════════════ Niveau 3 ═════════════ */
{ const f = lin(100, 4000); const g = thru(10, 3500, 30, 6500);
  put('l3-001', { q1: r(g.m), q2: r(g.p), q3: r(eqx(f, g)), q4: cheapest(28, [f, g]) }); }
{ const d2 = lin(q(-300).div(500), q(9100).div(500)); const [x, y] = solve2(1, 1, 25, 300, 500, 9100);
  put('l3-002', { q1: r(d2.m), q2: r(d2.p), q3: P(x, y), q4: r(q(y).mul(500)) }); }
{ const A = lin(300); const B = lin(100, 800); const Cc = K(2000);
  put('l3-003', { q1: r(eqx(A, B)), q2: cheapest(6, [A, B, Cc]), q3: r(firstInt((n) => lt(at(Cc, n), at(B, n)))) }); }
{ const f = lin(150, 2000); const g = lin(350);
  put('l3-004', { q1: r(eqx(f, g)), q2: dirOf(f, '<', g), q3: r(firstInt((n) => lt(at(f, n), at(g, n)))) }); }
{ const f = thru(1, 85, 4, 40); put('l3-005', { q1: r(f.m), q2: r(f.p), q3: r(inv(f, 0).mul(60)) }); }
{ // figure : A(0 ; 5), B(4 ; 9) ; graduation : 1 h en abscisse, 100DA en ordonnée
  const f = scale(thru(0, 5, 4, 9), 1, 100);
  put('l3-006', { q1: r(at(f, 0)), q2: r(at(f, 4)), q3: r(f.m), q4: r(at(f, 7)) });
}
{ const f = thru(-1, 7, 2, -2); const g = lin(2, -11);
  put('l3-007', { q1: r(f.m), q2: r(f.p), q3: r(at(g, -1)), q4: meet(f, g) }); }
{ const f = lin(45, 120); put('l3-008', { q1: r(f.m), q2: r(f.p), q3: r(at(f, 10)), q4: r(maxInt(f, 1000)) }); }
{ const f = thru(0, 8, 3, -1); const g = lin(2, -12); put('l3-009', { q1: r(f.m), q2: r(f.p), q4: meet(f, g) }); }
{ const f = lin(60); const g = lin(40, 500);
  put('l3-010', {
    q1: r(at(f, 10)), q2: r(at(f, 25)), q3: r(at(f, 40)), q4: r(at(g, 10)), q5: r(at(g, 25)), q6: r(at(g, 40)),
    q7: r(firstInt((n) => lt(at(g, n), at(f, n)))),
  }); }

/* ═════════════ Niveau 4 ═════════════ */
{ const [x, y] = solve2(1, 1, 30, 400, 800, 13600); const bus = lin(250, 3000); const paid = at(bus, x);
  put('l4-001', { q1: P(x, y), q2: r(paid), q3: r(q(13600).sub(paid)) }); }
{ const f = lin(180, 5000); const g = thru(20, 7000, 40, 10000);
  if (!lt(eqx(f, g), 0)) throw new Error('oracle l4-002 : les droites doivent se couper hors de la situation (x < 0)');
  put('l4-002', { q1: r(g.m), q2: r(g.p), q4: r(at(f, 30).sub(at(g, 30))) }); }
{ const A = lin(120); const B = lin(60, 240); const Cc = K(540);
  put('l4-003', { q1: cheapest(3, [A, B, Cc]), q2: r(eqx(B, Cc)), q3: cheapest(7, [A, B, Cc]) }); }
{ const A = lin(100, 600); const B = lin(250);
  put('l4-004', { q1: r(eqx(A, B)), q2: cheapest(6, [A, B]), q3: r(maxInt(A, 1500)) }); }
{ const f = lin(250); const g = lin(150, 1500);
  put('l4-005', {
    q1: r(maxInt(f, 4500)), q2: r(maxInt(g, 4500)), q3: r(f.m), q4: r(g.m), q5: r(g.p), q6: r(eqx(f, g)),
    q7: r(firstInt((n) => lt(at(g, n), at(f, n)))),
  }); }
{ const f = thru(20, 84, 45, 64);
  put('l4-006', { q1: r(f.m), q2: r(f.p), q3: r(inv(f, 0)), q4: r(firstInt((n) => lt(at(f, n), 20))) }); }
{ const y1 = lin(150, 600); const y2 = lin(250, 300);
  put('l4-007', {
    q1: r(at(y1, 2)), q2: r(at(y2, 2)), q3: r(y1.m), q4: r(y1.p), q5: r(y2.m), q6: r(y2.p),
    q8: meet(y1, y2), q9: r(eqx(y1, y2)), q10: dirOf(y2, '>', y1),
  }); }
{ const f = lin(500); const g = lin(300, 2000); const h = K(8000);
  put('l4-008', {
    q1: r(f.m), q2: r(g.m), q3: r(g.p), q4: r(h.p), q5: r(eqx(f, g)), q6: r(eqx(g, h)), q7: cheapest(18, [f, g, h]),
  }); }
{ const A = lin(30, 150); const B = lin(60); const Cc = K(400);
  put('l4-009', { q1: r(eqx(A, B)), q2: cheapest(4, [A, B, Cc]), q3: cheapest(7, [A, B, Cc]), q4: cheapest(10, [A, B, Cc]) }); }
{ const f = lin(2, 3); const g = thru(0, 9, 3, 3);
  put('l4-010', { q1: r(g.m), q2: r(g.p), q3: meet(f, g), q4: r(eqx(f, g)), q5: dirOf(f, '>', g) }); }

/* ═════════════ Niveau 5 ═════════════ */
{ // BEM 2017 الجزء الثاني : carré de 324m² ; EB = 12m ; BM = x
  const area = 324; const EB = 12;
  const a = isqrt(area);
  const S1 = lin(q(EB).div(2)); // (EB × BM)/2
  const S2 = lin(S1.m.neg(), area); // S_ABCD − S1
  const x = eqx(S2, lin(S1.m.mul(2))); // S2 = 2·S1
  if (lt(a, x)) throw new Error('oracle l5-001 : M hors de [BC]');
  const f = lin(12); const g = lin(-6, 324);
  if (!eq(f.m, S1.m.mul(2)) || !eq(g.m, S2.m) || !eq(g.p, S2.p)) throw new Error('oracle l5-001 : f = 2·S1 et g = S2 ?');
  const X = eqx(f, g);
  put('l5-001', {
    q1: r(a), q2: r(S1.m), q3: r(S2.m), q4: r(S2.p), q5: r(x),
    q7: meet(f, g), q8: r(at(S2, X)), q9: r(at(S1, X)),
  });
}
{ const m1 = lin('1,5', 32); const m2 = lin('2,5', 26);
  put('l5-002', {
    q1: r(at(m1, 4)), q2: r(at(m2, 4)), q3: r(m1.m), q4: r(m1.p), q5: r(m2.m), q6: r(m2.p),
    q8: meet(m1, m2), q9: r(eqx(m1, m2)), q10: dirOf(m2, '>', m1),
  }); }
{ const f = lin(1); const g = lin(q(100 - 20).div(100), 1000);
  // la figure : (D1) par (0 ; 0) et (10 ; 10), (D2) par (0 ; 1) et (10 ; 9), une graduation = 1000DA sur les deux axes
  const D1 = scale(thru(0, 0, 10, 10), 1000, 1000); const D2 = scale(thru(0, 1, 10, 9), 1000, 1000);
  if (!eq(D1.m, f.m) || !eq(D1.p, f.p) || !eq(D2.m, g.m) || !eq(D2.p, g.p)) throw new Error('oracle l5-003 : figure ≠ énoncé');
  put('l5-003', {
    q1: r(at(g, 2500)), q2: r(at(g, 5000)), q3: r(at(g, 7500)), q4: r(f.m), q5: r(g.m), q6: r(g.p),
    q7: r(eqx(D1, D2)), q8: yes(lt(at(g, 3000), at(f, 3000))),
  }); }
{ const L = 210; const d1 = lin(60); const d2 = lin(-80, L);
  put('l5-004', {
    q1: r(at(d1, 1)), q2: r(at(d2, 1)), q3: r(d1.m), q4: r(d2.m), q5: r(d2.p), q7: meet(d1, d2),
    q8: r(at(d1, 2).sub(at(d2, 2))),
  }); }
{ const Cst = lin(20, 1200); const Rv = lin(35); const B = lin(Rv.m.sub(Cst.m), Cst.p.neg());
  put('l5-005', {
    q1: r(at(Cst, 100)), q2: r(at(B, 100)), q3: r(Cst.m), q4: r(Cst.p), q5: r(Rv.m), q6: r(eqx(Rv, Cst)),
    q7: r(firstInt((n) => !lt(at(B, n), 1500))),
  }); }
{ const f = lin(5000); const g = lin(3500, 9000); const h = K(51000);
  put('l5-006', {
    q1: r(at(f, 5)), q2: r(at(f, 10)), q3: r(at(g, 5)), q4: r(at(g, 10)), q5: r(f.m), q6: r(g.m), q7: r(g.p),
    q8: r(eqx(f, g)), q9: r(eqx(g, h)), q10: cheapest(14, [f, g, h]),
  }); }
{ const T1 = lin('-0,6', 34); const T2 = lin('-0,9', 40); const t1 = inv(T1, 4); const t2 = inv(T2, 4);
  if (eq(t1, t2)) throw new Error('oracle l5-007 : égalité');
  put('l5-007', {
    q1: r(at(T1, 10)), q2: r(at(T2, 10)), q4: r(T2.m), q5: r(T2.p), q6: meet(T1, T2),
    q7: C(lt(t1, t2) ? 'A' : 'B'), q8: r(lt(t1, t2) ? t1 : t2),
  }); }
{ const C1 = lin(20000, 180000); const C2 = lin(50000, 60000);
  const best = cheapest(10, [C1, C2]); if (best.choiceId !== 'A') throw new Error('oracle l5-008 : le goutte-à-goutte doit gagner sur 10 saisons');
  put('l5-008', {
    q1: r(at(C1, 3)), q2: r(at(C2, 3)), q3: r(C1.m), q4: r(C1.p), q5: r(C2.m), q6: r(C2.p),
    q7: r(eqx(C1, C2)), q8: dirOf(C1, '<', C2), q9: r(at(C2, 10).sub(at(C1, 10))),
  }); }
{ const E = lin('3,5'); const G = lin(1, 50000);
  put('l5-009', {
    q1: r(at(E, 10000)), q2: r(at(E, 30000)), q3: r(at(G, 10000)), q4: r(at(G, 30000)), q5: r(E.m), q6: r(G.m), q7: r(G.p),
    q8: r(eqx(E, G)), q9: r(at(E, 45000).sub(at(G, 45000))),
  }); }
{ const f = lin(3, 120); const h = lin('1,5', 420); const g = lin('0,5', 720);
  put('l5-010', {
    q1: r(g.m), q2: r(g.p), q3: r(at(f, 100)), q4: r(at(h, 100)), q5: r(at(g, 100)), q6: r(eqx(f, h)), q7: r(eqx(h, g)),
    q9: cheapest(365, [f, h, g]),
  }); }

export const ORACLE = O;
