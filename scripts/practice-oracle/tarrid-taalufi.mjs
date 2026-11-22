// Oracle du banc « tarrid-taalufi » au format BEM (unité 7 « الدالة التآلفية », leçon 5, banque réécrite le
// 2026-10-07) — chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé (tarifs, abonnements, quantités,
// ou deux nœuds du quadrillage par lesquels passe chaque droite dessinée en `statement.figure`), en rationnels
// exacts (helpers.mjs), sans lire le contenu ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs.
// Les étapes « مثّل بيانيا » / « ماذا يمثّل » (selfCheck) n'ont pas de clé ; les questions fermées (choice) en ont une,
// rejouée par une aide qui lève une erreur si la situation ne départage pas.
//
// Outils :
//   lin(m, p)              un tarif y = m·x + p (m : ce qui est payé par unité, p : ce qui est payé une fois) : { m, p }
//   K(v)                   un tarif forfaitaire constant (دالة ثابتة)
//   thru(x1, y1, x2, y2)   la droite dessinée par deux nœuds (unités de la figure) : { m, p }
//   scale(L, ux, uy)       la même droite dans les unités réelles (1 graduation = ux en abscisse, uy en ordonnée)
//   at(L, x)               le montant pour x unités
//   inv(L, y)              le nombre d'unités pour un montant y (L non constante)
//   eqx(L1, L2)            l'abscisse où deux tarifs se valent (droites sécantes, sinon erreur)
//   gtSide(L1, L2)         le sens de « L1(x) > L2(x) » : B = « x > k » (L1 plus pentue), A = « x < k »
//   cheapest(x, offers)    la lettre de l'offre la moins chère pour x (égalité → erreur)
//   richest(x, offers)     la lettre de l'offre qui rapporte le plus pour x (égalité → erreur)
//   firstInt(k)            le plus petit entier strictement supérieur à k
//   maxInt(L, budget)      le plus grand entier x avec L(x) ≤ budget (L croissante)
import { R, C, q } from './helpers.mjs';

const eq = (u, v) => q(u).sub(q(v)).isZero();
const lt = (u, v) => q(u).sub(q(v)).n < 0n;
const lin = (m, p = 0) => ({ m: q(m), p: q(p) });
const K = (v) => lin(0, v);
const thru = (x1, y1, x2, y2) => { const m = q(y2).sub(q(y1)).div(q(x2).sub(q(x1))); return lin(m, q(y1).sub(m.mul(q(x1)))); };
const scale = (L, ux, uy) => lin(L.m.mul(q(uy)).div(q(ux)), L.p.mul(q(uy)));
const same = (L1, L2) => { if (!eq(L1.m, L2.m) || !eq(L1.p, L2.p)) throw new Error('oracle tarrid-taalufi : la figure ne dessine pas le tarif de l\'énoncé'); return L1; };
const at = (L, x) => L.m.mul(q(x)).add(L.p);
const inv = (L, y) => { if (L.m.isZero()) throw new Error('oracle tarrid-taalufi : tarif constant'); return q(y).sub(L.p).div(L.m); };
const eqx = (L1, L2) => {
  if (eq(L1.m, L2.m)) throw new Error('oracle tarrid-taalufi : droites parallèles ou confondues');
  return L2.p.sub(L1.p).div(L1.m.sub(L2.m));
};
const gtSide = (L1, L2) => C(L1.m.sub(L2.m).n > 0n ? 'B' : 'A');
const LETTERS = 'ABCD';
const extreme = (vals, better) => {
  let best = 0;
  vals.forEach((v, i) => { if (better(v, vals[best])) best = i; });
  if (vals.some((v, i) => i !== best && eq(v, vals[best]))) throw new Error('oracle tarrid-taalufi : égalité');
  return C(LETTERS[best]);
};
const cheapest = (x, offers) => extreme(offers.map((L) => at(L, x)), lt);
const richest = (x, offers) => extreme(offers.map((L) => at(L, x)), (a, b) => lt(b, a));
const firstInt = (k) => { const v = q(k); const f = v.n >= 0n ? v.n / v.d : -((-v.n + v.d - 1n) / v.d); return q(f + 1n); };
const maxInt = (L, budget) => { const v = inv(L, budget); return q(v.n >= 0n ? v.n / v.d : -((-v.n + v.d - 1n) / v.d)); };
const r = (v) => R(q(v).toString());

const ID = 'ex-4am-tarrid-taalufi';
const O = {};
const put = (id, keys) => { for (const [k, v] of Object.entries(keys)) O[`${ID}-${id}:${k}`] = v; };

/* ═════════════ Niveau 1 ═════════════ */
{ const f = lin(200, 2000); // نشاط 4 : 2000DA une fois, 200DA par match
  put('l1-001', { q1: r(f.m), q2: r(f.p), q3: r(at(f, 7)) }); }
{ const f = lin(150, 500);
  put('l1-002', { q1: r(f.m), q2: r(f.p), q3: r(at(f, 4)) }); }
{ const f = lin(40, 100);
  put('l1-003', { q1: r(f.m), q2: r(f.p), q3: r(at(f, 9)) }); }
{ const f = lin(100, 1500);
  put('l1-004', { q1: r(at(f, 0)), q2: r(at(f, 8)) }); }
{ const sans = lin(20), carte = lin(5, 300);
  put('l1-005', { q1: r(at(sans, 15)), q2: r(at(carte, 15)), q3: cheapest(15, [sans, carte]) }); }
{ const f = lin(150, 300);
  put('l1-006', { q1: r(f.m), q2: r(f.p), q3: r(at(f, 3)) }); }
{ const f = lin(50, 600);
  put('l1-007', { q1: r(at(f, 6)), q2: r(inv(f, 1000)) }); }
{ const f = lin(200, 2000), g = lin(400);
  put('l1-008', { q1: r(at(f, 2)), q2: r(at(g, 2)), q3: cheapest(2, [f, g]) }); }
{ const g = lin(100), f = lin(40, 600); const x = eqx(f, g);
  put('l1-009', { q1: r(x), q2: r(at(g, x)) }); }
{ const sans = lin(250), carte = lin(150, 1000);
  put('l1-010', { q1: r(at(sans, 4)), q2: r(at(carte, 4)), q3: cheapest(4, [sans, carte]) }); }

/* ═════════════ Niveau 2 ═════════════ */
{ const f = lin(200, 2000);
  put('l2-001', { q1: r(inv(f, 2000)), q2: r(inv(f, 4800)) }); }
{ const f = lin(120, 800);
  put('l2-002', { q1: r(at(f, 5)), q2: r(inv(f, 2240)) }); }
{ const t1 = lin(70), t2 = lin(45, 2000); // 70x > 45x + 2000
  put('l2-003', { q1: r(at(t1, 150)), q2: r(at(t2, 150)), q3: r(eqx(t1, t2)), q4: gtSide(t1, t2) }); }
{ const f = lin(150, 300);
  put('l2-004', { q1: r(at(f, 4)), q2: r(inv(f, 1200)) }); }
{ const f = lin(80, 1000);
  put('l2-005', { q1: r(at(f, 1).sub(at(f, 0))), q2: r(at(f, 5)) }); }
{ const f = lin(150, 1200), g = lin(350); const x = eqx(f, g);
  put('l2-006', { q1: r(x), q2: r(at(g, x)) }); }
{ const f = lin(30), g = lin(20, 250);
  put('l2-007', { q1: r(f.m), q2: r(g.m), q3: r(g.p), q4: r(eqx(f, g)) }); }
{ const s1 = lin(100, 1500), s2 = lin(250);
  put('l2-008', { q1: r(at(s1, 12)), q2: r(at(s2, 12)), q3: cheapest(12, [s1, s2]) }); }
{ const o1 = lin(4), o2 = lin('2.5', 60);
  put('l2-009', { q1: r(at(o1, 30)), q2: r(at(o2, 30)), q3: r(eqx(o1, o2)) }); }
{ const o1 = lin(300, 18000), o2 = lin(600);
  put('l2-010', { q1: r(at(o1, 50)), q2: r(at(o2, 50)), q3: r(eqx(o1, o2)) }); }

/* ═════════════ Niveau 3 ═════════════ */
{ const f = lin(40, 120), g = lin(60);
  put('l3-001', { q1: r(f.m), q2: r(f.p), q3: r(g.m), q4: r(eqx(f, g)), q5: cheapest(4, [f, g]) }); }
{ const f = lin(300, 1000), g = lin(500);
  put('l3-002', { q1: r(f.m), q2: r(f.p), q3: r(g.m), q4: r(eqx(f, g)), q5: cheapest(8, [f, g]) }); }
{ const sans = lin(20), carte = lin(5, 300); // 300 + 5x < 20x  ⇔  20x > 5x + 300
  put('l3-003', { q1: r(eqx(carte, sans)), q2: gtSide(sans, carte), q3: cheapest(50, [sans, carte]) }); }
{ const a = lin(400), b = lin(250, 1200), c = lin(100, 3000); // (ب) la moins chère entre b∩a et b∩c
  const m = eqx(a, b), M = eqx(b, c);
  const mid = m.add(M).div(2); if (!lt(at(b, mid), at(a, mid)) || !lt(at(b, mid), at(c, mid))) throw new Error('l3-004 : (ب) pas la moins chère au milieu');
  put('l3-004', { q1: r(at(a, 10)), q2: r(at(b, 10)), q3: r(at(c, 10)), q4: r(m), q5: r(M) }); }
{ const f = lin(80, 1000);
  put('l3-005', { q1: r(f.m), q2: r(f.p), q3: r(inv(f, 1640)), q4: r(maxInt(f, 2000)) }); }
{ const f = lin(3000), g = lin(1500, 6000);
  put('l3-006', { q1: r(f.m), q2: r(g.m), q3: r(g.p), q4: r(eqx(f, g)), q5: cheapest(3, [f, g]) }); }
{ const y1 = lin(30), y2 = lin(18, 1500); // 30x > 18x + 1500
  put('l3-007', { q1: r(y1.m), q2: r(y2.m), q3: r(y2.p), q4: r(eqx(y1, y2)), q5: gtSide(y1, y2), q6: cheapest(80, [y1, y2]) }); }
{ const A = lin(3000), B = lin(1500, 6000); // 1500x + 6000 < 3000x  ⇔  A > B
  const k = eqx(A, B);
  put('l3-008', { q1: r(k), q2: gtSide(A, B), q3: r(firstInt(k)) }); }
{ const f = lin(40, 600), g = lin(100);
  put('l3-009', { q1: r(at(f, 15)), q2: r(inv(f, 1000)), q3: cheapest(15, [f, g]) }); }
{ // figure : (D₁) par (0 ; 0) et (8 ; 8), (D₂) par (0 ; 3) et (8 ; 7) ; 1 graduation = 1 h en abscisse, 100DA en ordonnée
  const f = same(scale(thru(0, 0, 8, 8), 1, 100), lin(100)), g = same(scale(thru(0, 3, 8, 7), 1, 100), lin(50, 300));
  put('l3-010', { q1: r(g.m), q2: r(g.p), q3: r(eqx(f, g)), q4: cheapest(8, [f, g]), q5: cheapest(3, [f, g]) }); }

/* ═════════════ Niveau 4 ═════════════ */
{ const f = lin(40, 1200), g = lin(100); // 40x + 1200 < 100x  ⇔  g > f
  put('l4-001', { q1: r(at(f, 15)), q2: r(at(g, 15)), q3: r(eqx(f, g)), q4: gtSide(g, f), q5: cheapest(25, [f, g]) }); }
{ const f = lin(15, 50), g = lin(25);
  put('l4-002', { q1: r(f.m), q2: r(f.p), q3: r(g.m), q4: r(eqx(f, g)), q5: cheapest(12, [f, g]) }); }
{ const A = lin(100), B = lin(40, 600), Cc = K(1800);
  put('l4-003', { q1: r(eqx(A, B)), q2: r(eqx(B, Cc)), q3: cheapest(5, [A, B, Cc]), q4: cheapest(20, [A, B, Cc]), q5: cheapest(35, [A, B, Cc]) }); }
{ const f = lin(10000), g = lin(6000, 8000), h = K(50000);
  put('l4-004', { q1: r(f.m), q2: r(g.m), q3: r(g.p), q4: r(eqx(f, g)), q5: r(eqx(g, h)), q6: cheapest(6, [f, g, h]) }); }
{ const f = lin(60, 900), g = lin(150); // 60x + 900 < 150x  ⇔  g > f
  const k = eqx(f, g);
  put('l4-005', { q1: r(k), q2: gtSide(g, f), q3: r(firstInt(k)) }); }
{ const f = lin(100, 400);
  put('l4-006', { q1: r(f.m), q2: r(f.p), q3: r(at(f, 5)), q4: r(inv(f, 1600)) }); }
{ const f = lin(250, 1500);
  put('l4-007', { q1: r(f.m), q2: r(f.p), q3: r(inv(f, 5000)), q4: r(inv(f, 4500)) }); }
{ const A = lin(120, 500), B = lin(200); // 120x + 500 < 200x  ⇔  B > A
  const k = eqx(A, B);
  put('l4-008', { q1: r(k), q2: gtSide(B, A), q3: r(firstInt(k)) }); }
{ const f = lin(250), g = lin(150, 800);
  put('l4-009', { q1: r(at(f, 5)), q2: r(at(g, 5)), q3: r(inv(f, 3000)), q4: r(at(g, inv(f, 3000))), q5: r(eqx(f, g)), q6: cheapest(5, [f, g]), q7: cheapest(inv(f, 3000), [f, g]) }); }
{ const f = lin(200, 2000), g = lin(400);
  const save = at(g, 20).sub(at(f, 20)); if (save.n <= 0n) throw new Error('l4-010 : l\'abonnement n\'est pas le moins cher');
  put('l4-010', { q1: r(at(f, 20)), q2: r(at(g, 20)), q3: r(save), q4: r(eqx(f, g)) }); }

/* ═════════════ Niveau 5 ═════════════ */
// BEM 2007 II (officiel) : 15DA/km ; 12DA/km + 900DA. Tableau : 60km ; 2e tarif 3060DA ; 1er tarif 5100DA.
{ const y1 = lin(15), y2 = lin(12, 900);
  const d2 = inv(y2, 3060), d3 = inv(y1, 5100), k = eqx(y1, y2);
  put('l5-001', {
    q1: r(at(y1, 60)), q2: r(at(y2, 60)), q3: r(d2), q4: r(at(y1, d2)), q5: r(d3), q6: r(at(y2, d3)),
    q7: r(y1.m), q8: r(y2.m), q9: r(y2.p), q10: r(k), q11: gtSide(y1, y2),
    q13: cheapest(k.sub(1), [y1, y2]), q14: cheapest(k.add(1), [y1, y2]),
  }); }
// BEM 2011 II (officiel) : (أ) 11x ; (ب) 5x + 600 ; (ج) 3x + 1200 ; 100 min ; fenêtre où (ب) est la moins chère.
{ const a = lin(11), b = lin(5, 600), c = lin(3, 1200);
  const m = eqx(a, b), M = eqx(b, c);
  const mid = m.add(M).div(2); if (!lt(at(b, mid), at(a, mid)) || !lt(at(b, mid), at(c, mid))) throw new Error('2011 : (ب) pas la moins chère');
  put('l5-002', { q1: r(at(a, 100)), q2: r(at(b, 100)), q3: r(at(c, 100)), q4: r(a.m), q5: r(b.m), q6: r(b.p), q7: r(c.m), q8: r(c.p), q10: r(m), q11: r(M) }); }
// BEM 2013 II (officiel) : 4000x ; 3000x + 1000 ; 16000 (≤ 7 jours). Tableau lu sur le graphique : jours 1, 4, 5.
{ const f = lin(4000), g = lin(3000, 1000), h = K(16000);
  const h3 = [1, 4, 5].map((x) => at(h, x)); if (!h3.every((v) => eq(v, h3[0]))) throw new Error('2013 : h non constante');
  put('l5-003', {
    q1: cheapest(7, [f, g, h]), q2: r(f.m), q3: r(g.m), q4: r(g.p), q5: r(h.p),
    q7: r(at(f, 1)), q8: r(at(f, 4)), q9: r(at(f, 5)), q10: r(at(g, 1)), q11: r(at(g, 4)), q12: r(at(g, 5)), q13: r(h3[0]),
    q14: r(eqx(f, g)), q15: r(eqx(f, h)), q16: r(eqx(g, h)),
  }); }
// BEM 2024 المسألة (officiel) : 45x ; 15x + 600 ; 1350. Tableau : 20 livres ; offre 1 = 1260DA ; offre 2 = 1350DA.
{ const f = lin(45), g = lin(15, 600), h = K(1350);
  const n2 = inv(f, 1260), n3 = inv(g, 1350);
  if (!eq(at(h, n2), at(h, n3))) throw new Error('2024 : h non constante');
  const m = eqx(f, g), M = eqx(g, h);
  const mid = m.add(M).div(2); if (!lt(at(g, mid), at(f, mid)) || !lt(at(g, mid), at(h, mid))) throw new Error('2024 : offre 2 pas la moins chère');
  put('l5-004', {
    q1: r(at(f, 20)), q2: r(at(g, 20)), q3: r(n2), q4: r(at(g, n2)), q5: r(n3), q6: r(at(f, n3)), q7: r(at(h, n2)),
    q8: r(f.m), q9: r(g.m), q10: r(g.p), q11: r(h.p), q13: r(m), q14: r(M),
  }); }
// على منوال 2007 : piscine 200DA ; 120DA + 2400DA. 120x + 2400 < 200x  ⇔  y1 > y2.
{ const y1 = lin(200), y2 = lin(120, 2400); const n = inv(y1, 5000);
  put('l5-005', { q1: r(at(y1, 10)), q2: r(at(y2, 10)), q3: r(n), q4: r(at(y2, n)), q5: r(y1.m), q6: r(y2.m), q7: r(y2.p),
    q8: r(eqx(y1, y2)), q9: gtSide(y1, y2), q10: cheapest(36, [y1, y2]) }); }
// على منوال 2011 : radio (أ) 900x ; (ب) 500x + 6000 ; (ج) 200x + 15000.
{ const a = lin(900), b = lin(500, 6000), c = lin(200, 15000);
  const m = eqx(a, b), M = eqx(b, c);
  const mid = m.add(M).div(2); if (!lt(at(b, mid), at(a, mid)) || !lt(at(b, mid), at(c, mid))) throw new Error('l5-006 : (ب) pas la moins chère');
  put('l5-006', { q1: r(at(a, 20)), q2: r(at(b, 20)), q3: r(at(c, 20)), q4: r(a.m), q5: r(b.m), q6: r(b.p), q7: r(c.m), q8: r(c.p),
    q9: r(m), q10: r(M), q11: cheapest(40, [a, b, c]) }); }
// على منوال 2013 : moissonneuse 18000x ; 12000x + 18000 ; 90000 (≤ 7 jours).
{ const f = lin(18000), g = lin(12000, 18000), h = K(90000);
  put('l5-007', { q1: cheapest(2, [f, g, h]), q2: r(f.m), q3: r(g.m), q4: r(g.p), q5: r(h.p),
    q6: r(eqx(f, g)), q7: r(eqx(f, h)), q8: r(eqx(g, h)), q9: cheapest(7, [f, g, h]) }); }
// على منوال 2024 : téléphérique 50x ; 25x + 400 ; 1400.
{ const f = lin(50), g = lin(25, 400), h = K(1400); const n = inv(f, 1200);
  const m = eqx(f, g), M = eqx(g, h);
  const mid = m.add(M).div(2); if (!lt(at(g, mid), at(f, mid)) || !lt(at(g, mid), at(h, mid))) throw new Error('l5-008 : offre 2 pas la moins chère');
  put('l5-008', { q1: r(at(f, 10)), q2: r(at(g, 10)), q3: r(n), q4: r(at(g, n)), q5: r(f.m), q6: r(g.m), q7: r(g.p), q8: r(h.p), q10: r(m), q11: r(M) }); }
// على منوال 2018 : salaires 200x + 24000 ; 500x. Le meilleur = le plus grand salaire.
{ const y1 = lin(200, 24000), y2 = lin(500);
  put('l5-009', { q1: r(at(y1, 100)), q2: r(at(y2, 100)), q3: r(y1.m), q4: r(y1.p), q5: r(y2.m),
    q6: r(eqx(y2, y1)), q7: gtSide(y2, y1), q8: richest(70, [y1, y2]) }); }
// على منوال 2014 : taxi 40x ; 20x + 800. Figure : (D₁) par (0 ; 0) et (8 ; 8), (D₂) par (0 ; 2) et (8 ; 6) ;
// 1 graduation = 10km en abscisse, 400DA en ordonnée.
{ const f = lin(40), g = lin(20, 800);
  const D1 = scale(thru(0, 0, 8, 8), 10, 400), D2 = scale(thru(0, 2, 8, 6), 10, 400);
  same(D1, f); same(D2, g);
  // q4 : la droite de g est celle qui ne passe pas par l'origine → (D₂) = B
  const q4 = C(D2.p.isZero() ? 'A' : 'B');
  // q7 : budget 1200DA → distance la plus longue
  const dist = [inv(f, 1200), inv(g, 1200)];
  put('l5-010', { q1: r(f.m), q2: r(g.m), q3: r(g.p), q4, q5: r(eqx(D1, D2)), q6: cheapest(80, [f, g]),
    q7: extreme(dist, (a, b) => lt(b, a)) }); }

export const ORACLE = O;
