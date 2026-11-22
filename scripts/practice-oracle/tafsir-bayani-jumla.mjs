// Oracle du banc « tafsir-bayani-jumla » au format BEM (unité 7 « الدالة التآلفية », leçon 4, banque réécrite le
// 2026-10-07) — chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé (équations, situation, ou deux nœuds
// du quadrillage par lesquels passe chaque droite dessinée en `statement.figure`), en rationnels exacts (helpers.mjs),
// sans lire le contenu ni le code testé. Fusionné dans scripts/practice-answer-oracle.test.mjs.
// Les étapes « مثّل بيانيا » / « تحقّق » / « ماذا يمثّل » (selfCheck) n'ont pas de clé ; les questions fermées (choice)
// en ont une, rejouée par une aide qui lève une erreur si la situation ne départage pas.
//
// Outils :
//   iso([a, b, c])          l'équation a·x + b·y = c écrite y = m·x + p : { m, p }
//   lin(m, p)               la droite y = m·x + p : { m, p }
//   thru(x1, y1, x2, y2)    la droite dessinée par deux nœuds : { m, p }
//   same(L1, L2)            vérifie que la figure dessine bien la droite de l'énoncé (sinon erreur)
//   meet(L1, L2)            le point d'intersection { x, y } (droites sécantes, sinon erreur)
//   node(pt)                une LECTURE graphique : les deux coordonnées doivent être entières (un nœud), sinon erreur
//   at(L, x)                l'ordonnée du point d'abscisse x
//   holds([a, b, c], x, y)  a·x + b·y = c ?
//   caseOf(L1, L2)          0 sécantes (حل وحيد) · 1 parallèles (لا حل) · 2 confondues (عدد غير منته) → lettre A / B / C
//   yesNo(b)                « هل … ؟ » : A = نعم, B = لا
//   smallest([...])         la lettre du plus petit montant (égalité → erreur)
import { R, C, P, q } from './helpers.mjs';

const eq = (u, v) => q(u).sub(q(v)).isZero();
const lin = (m, p) => ({ m: q(m), p: q(p) });
const iso = ([a, b, c]) => lin(q(0).sub(q(a)).div(q(b)), q(c).div(q(b)));
const thru = (x1, y1, x2, y2) => { const m = q(y2).sub(q(y1)).div(q(x2).sub(q(x1))); return lin(m, q(y1).sub(m.mul(q(x1)))); };
const same = (L1, L2) => { if (!eq(L1.m, L2.m) || !eq(L1.p, L2.p)) throw new Error('oracle tafsir-bayani-jumla : la figure ne dessine pas la droite de l\'énoncé'); return L1; };
const at = (L, x) => L.m.mul(q(x)).add(L.p);
const meet = (L1, L2) => {
  if (eq(L1.m, L2.m)) throw new Error('oracle tafsir-bayani-jumla : droites parallèles ou confondues');
  const x = L2.p.sub(L1.p).div(L1.m.sub(L2.m));
  return { x, y: at(L1, x) };
};
const node = (pt) => { if (pt.x.d !== 1n || pt.y.d !== 1n) throw new Error('oracle tafsir-bayani-jumla : lecture hors nœud'); return pt; };
const Pt = (pt) => P(pt.x.toString(), pt.y.toString());
const holds = ([a, b, c], x, y) => eq(q(a).mul(q(x)).add(q(b).mul(q(y))), c);
const caseOf = (L1, L2) => C(!eq(L1.m, L2.m) ? 'A' : (eq(L1.p, L2.p) ? 'C' : 'B'));
const yesNo = (b) => C(b ? 'A' : 'B');
const LETTERS = 'ABCD';
const smallest = (amounts) => {
  const v = amounts.map((a) => q(a));
  let best = 0;
  v.forEach((a, i) => { if (a.sub(v[best]).n < 0n) best = i; });
  if (v.some((a, i) => i !== best && eq(a, v[best]))) throw new Error('oracle tafsir-bayani-jumla : égalité');
  return C(LETTERS[best]);
};
/** x tel que L1(x) = L2(x) */
const xMeet = (L1, L2) => meet(L1, L2).x;
/** « le plus grand nombre de … pour un budget » : la lettre (A, B) de l'offre qui en donne le plus. */
const mostFor = (budget, offers) => {
  const counts = offers.map((L) => q(budget).sub(L.p).div(L.m));
  if (eq(counts[0], counts[1])) throw new Error('mostFor : égalité');
  return C(counts[0].sub(counts[1]).n > 0n ? 'A' : 'B');
};
const cheaperAt = (x, offers) => smallest(offers.map((L) => at(L, x)));
/** Le côté où L1 passe au-dessus de L2 : B = « x > k » (L1 plus pentue), A = « x < k ». */
const aboveSide = (L1, L2) => C(L1.m.sub(L2.m).n > 0n ? 'B' : 'A');

const K = 'ex-4am-tafsir-bayani-jumla';
const O = {};
const put = (id, keys) => { for (const [k, v] of Object.entries(keys)) O[`${K}-${id}:${k}`] = v; };

/* ── Niveau 1 ─────────────────────────────────────────────────────────── */
{ const L = iso([1, 1, 43]); put('l1-001', { q1: R(L.m), q2: R(L.p) }); }
{ const L = iso([1, 1, 5]); put('l1-002', { q1: yesNo(holds([1, 1, 5], 2, 3)), q2: R(at(L, -1)) }); }
{ const L = iso([-2, 1, 3]); put('l1-003', { q1: R(L.m), q2: R(L.p) }); }
{
  const d1 = same(thru(-2, 1, 3, 6), lin(1, 3)); const d2 = same(thru(-1, 6, 5, 0), lin(-1, 5));
  put('l1-004', { q1: Pt(node(meet(d1, d2))) });
}
{
  const d1 = same(thru(-2, 0, 3, 5), iso([1, -1, -2])); const d2 = same(thru(-1, 5, 4, 0), iso([1, 1, 4]));
  const target = iso([1, 1, 4]);
  put('l1-005', { q1: C(eq(target.m, d1.m) && eq(target.p, d1.p) ? 'A' : 'B'), q2: Pt(node(meet(d1, d2))) });
}
{ const a = lin(2, 1); const b = lin(2, 4); put('l1-006', { q1: caseOf(a, b), q2: caseOf(a, b) }); }
put('l1-007', { q1: Pt(meet(lin(-1, 6), lin(1, 2))) });
{
  const d1 = same(thru(1, -2, 6, 3), lin(1, -3)); const d2 = same(thru(0, 3, 6, 0), lin('-1/2', 3));
  put('l1-008', { q1: Pt(node(meet(d1, d2))) });
}
{ const L = iso([3, 1, 8]); put('l1-009', { q1: R(L.m), q2: R(L.p) }); }
{
  const d = iso([2, 1, 6]); const d2 = lin(-2, 1);
  put('l1-010', { q1: yesNo(eq(d.m, d2.m) && !eq(d.p, d2.p)), q2: yesNo(!eq(d.m, d2.m) || eq(d.p, d2.p)) });
}

/* ── Niveau 2 ─────────────────────────────────────────────────────────── */
{ const L = iso([100, 200, 5000]); put('l2-001', { q1: R(L.m), q2: R(L.p), q3: yesNo(holds([100, 200, 5000], 36, 7)) }); }
{ const L = iso([3, 1, 10]); put('l2-002', { q1: R(L.m), q2: R(L.p), q3: Pt(meet(L, lin(2, 0))) }); }
{ const L = iso([1, 2, 8]); put('l2-003', { q1: R(L.m), q2: R(L.p), q3: R(q(0).sub(L.p).div(L.m)) }); }
{ const a = lin(2, -3); const b = lin(-1, 6); put('l2-004', { q1: R(xMeet(a, b)), q2: Pt(meet(a, b)) }); }
{ const f = thru(0, 5, 5, 0); put('l2-005', { q1: R(f.m), q2: R(f.p), q3: Pt(meet(f, lin('1/2', 2))) }); }
{ const L2 = iso([2, 2, 8]); put('l2-006', { q1: R(L2.m), q2: R(L2.p), q3: caseOf(iso([1, 1, 4]), L2) }); }
{ const L2 = iso([1, 1, 5]); put('l2-007', { q1: R(L2.m), q2: R(L2.p), q3: caseOf(lin(-1, 1), L2) }); }
{
  const e1 = [1, -1, 3]; const e2 = [2, 1, 3];
  put('l2-008', { q1: yesNo(holds(e1, 2, -1) && holds(e2, 2, -1)), q2: Pt(meet(iso(e1), iso(e2))) });
}
{ const f = lin(3, -4); const g = lin(-1, 8); put('l2-009', { q1: R(at(g, 1)), q2: Pt(meet(f, g)) }); }
{ const A = lin(100, 200); const B = lin(150, 0); put('l2-010', { q1: R(xMeet(A, B)), q2: Pt(meet(A, B)) }); }

/* ── Niveau 3 ─────────────────────────────────────────────────────────── */
{
  const f = lin(-1, 43); const g = lin('-1/2', 25);
  put('l3-001', { q1: R(at(f, 36)), q2: R(at(g, 36)), q3: Pt(meet(f, g)), q4: yesNo(eq(f.m, g.m)) });
}
{
  const a = iso([2, 1, 7]); const b = iso([1, -1, 2]);
  put('l3-002', { q1: R(a.m), q2: R(a.p), q3: R(b.m), q4: R(b.p), q6: Pt(node(meet(a, b))) });
}
{ const a = iso([1, 3, 9]); const b = lin(1, -1); put('l3-003', { q1: R(a.m), q2: R(a.p), q3: R(xMeet(a, b)), q4: Pt(meet(a, b)) }); }
{
  const d1 = same(thru(-1, -2, 3, 6), lin(2, 0)); const d2 = same(thru(-1, 6, 5, 0), lin(-1, 5));
  const I = meet(d1, d2);
  put('l3-004', { q1: yesNo(I.x.d === 1n && I.y.d === 1n), q2: R(I.x), q3: Pt(I) });
}
{
  const a = iso([3, -1, 2]); const b = iso([6, -2, 1]);
  put('l3-005', { q1: R(a.m), q2: R(a.p), q3: R(b.m), q4: R(b.p), q5: caseOf(a, b), q6: caseOf(a, b) });
}
{
  const e1 = ['1/2', 1, 3]; const e2 = [1, 2, 6]; const a = iso(e1);
  put('l3-006', { q1: R(a.m), q2: R(a.p), q3: yesNo(holds(e1, 2, 2) && holds(e2, 2, 2)), q4: caseOf(a, iso(e2)) });
}
{ const f = thru(-1, -3, 1, 1); put('l3-007', { q1: R(f.m), q2: R(f.p), q4: Pt(meet(f, lin(-1, 5))) }); }
{ const f = thru(-1, -4, 2, 5); const g = lin(-2, 9); put('l3-008', { q1: R(f.m), q2: R(f.p), q3: R(at(g, 1)), q4: Pt(meet(f, g)) }); }
{
  const f = lin(120, 0); const g = lin(90, 600);
  put('l3-009', { q1: R(at(f, 15)), q2: R(at(g, 15)), q3: R(xMeet(f, g)), q4: Pt(meet(f, g)) });
}
{
  const b = lin(3, -2);
  put('l3-010', { q1: R(b.m), q2: caseOf(lin(b.m, 1), b), q3: Pt(meet(lin(1, 1), b)) });
}

/* ── Niveau 4 ─────────────────────────────────────────────────────────── */
{
  const e1 = [1, 1, 43]; const e2 = [100, 200, 5000]; const n2 = iso([100, 200, 5600]);
  put('l4-001', {
    q1: yesNo(holds(e1, 40, 3) && holds(e2, 40, 3)), q2: R(n2.p), q3: Pt(meet(iso(e1), n2)), q4: caseOf(iso(e1), iso([100, 100, 5000])),
  });
}
{
  const a = iso([3, 2, 12]); const b = iso([1, -2, -4]);
  put('l4-002', { q1: R(a.m), q2: R(a.p), q3: R(b.m), q4: R(b.p), q6: Pt(node(meet(a, b))) });
}
{ const a = iso([5, -2, 1]); const b = iso([3, 4, 11]); put('l4-003', { q1: R(a.m), q2: R(b.m), q3: caseOf(a, b), q4: Pt(meet(a, b)) }); }
{
  const e1 = [1, 1, 3]; const e2 = [2, -1, 1];
  const d1 = same(thru(-1, 4, 4, -1), iso(e1)); const d2 = same(thru(-1, -3, 3, 5), iso(e2));
  put('l4-004', { q1: yesNo(holds(e1, 1, 2) && holds(e2, 1, 2)), q2: Pt(meet(d1, d2)), q3: R(d2.p) });
}
{
  const e1 = [2, -3, 6]; const e2 = [-4, 6, -12]; const a = iso(e1);
  put('l4-005', { q1: R(a.m), q2: R(a.p), q3: caseOf(a, iso(e2)), q4: yesNo(holds(e1, 3, 0) && holds(e2, 3, 0)) });
}
{
  const a = iso(['1/2', 1, 2]); const b = iso([1, 2, 3]);
  // c : la seconde équation est la première multipliée par 1 / (1/2) = 2
  put('l4-006', { q1: R(a.m), q2: R(a.p), q3: R(b.p), q4: caseOf(a, b), q5: R(q(2).mul(q(2))) });
}
{
  const d = iso([4, -2, 6]);
  // k : 4x + k·y = 14 est 2 × (2x + 3y = 7) ⇔ 4/2 = k/3 = 14/7
  put('l4-007', { q1: R(d.p), q2: caseOf(lin(2, 1), d), q3: R(q(4).div(q(2)).mul(q(3))) });
}
{
  const f = lin(2, 1); const g = lin(-1, 7); const h = lin('1/2', 5);
  put('l4-008', { q1: R(xMeet(f, g)), q2: R(xMeet(f, h)), q3: R(xMeet(g, h)), q4: Pt(meet(f, g)) });
}
{
  // ABCD : AB = 20, BC = 12, BE = 16, BM = x ; S1 = BE·x/2 ; S2 = AB·BC − S1 ; f = 2·S1, g = S2 (unités : 2m, 40m²)
  const S1 = lin(q(16).div(q(2)), 0); const S2 = lin(q(0).sub(S1.m), 20 * 12);
  const f = lin(S1.m.mul(q(2)), 0); const I = meet(f, S2);
  node({ x: I.x.div(q(2)), y: I.y.div(q(40)) });
  put('l4-009', { q1: R(S1.m), q2: R(S2.p), q3: R(I.x), q5: Pt(I) });
}
{
  const y1 = lin(90, 0); const y2 = lin(60, 150);
  put('l4-010', { q1: R(at(y1, 3)), q2: R(at(y2, 3)), q3: R(xMeet(y1, y2)), q4: aboveSide(y1, y2), q5: Pt(meet(y1, y2)) });
}

/* ── Niveau 5 ─────────────────────────────────────────────────────────── */
{
  // BEM 2009 : خزان أسطواني r = 5, h = 4 (π = 3,14) ; مسبح 20 × 6 × 2 ; تدفق 12 m³/h
  const V1 = q('3.14').mul(q(25)).mul(q(4)); const V2 = q(20 * 6 * 2);
  const g = lin(12, 0); const f = lin(-12, V1);
  put('l5-001', {
    q1: R(V1), q2: R(V2), q3: R(at(g, 3)), q4: R(at(f, 3)), q5: R(g.m), q6: R(f.m), q8: R(V2.div(g.m)), q9: R(xMeet(f, g)),
  });
}
{
  // BEM 2014 : y1 = 3x ; y2 = 1,5x + 30 ; tableau (10 ; …) (… ; 45) (… ; 90)
  const y1 = lin(3, 0); const y2 = lin('3/2', 30);
  const n2 = q(45).div(y1.m); const n3 = q(90).sub(y2.p).div(y2.m);
  put('l5-002', {
    q1: R(at(y1, 10)), q2: R(at(y2, 10)), q3: R(n2), q4: R(at(y2, n2)), q5: R(n3), q6: R(at(y1, n3)), q7: R(y1.m), q8: R(y2.m),
    q10: mostFor(120, [y1, y2]), q11: cheaperAt(15, [y1, y2]),
  });
}
{
  // BEM 2015 : (2/5)·L² = 1000 ; AB = 40, DC = 50, AD = 20 ; f = (50 − x)·20/2 ; g = (40 + x)·20/2
  const L = 50; if (!eq(q(2).div(q(5)).mul(q(L * L)), 1000)) throw new Error('2015 : bouts');
  const W = q(2).div(q(5)).mul(q(L));
  const f = lin(q(-20).div(q(2)), q(50 * 20).div(q(2))); const g = lin(q(20).div(q(2)), q(40 * 20).div(q(2)));
  put('l5-003', { q1: R(L), q2: R(W), q3: R(f.m), q4: R(f.p), q5: R(g.m), q6: R(g.p), q7: R(xMeet(f, g)), q9: Pt(meet(f, g)) });
}
{
  // BEM 2018 : y1 = 200x + 20000 ; y2 = 100x + 30000
  const y1 = lin(200, 20000); const y2 = lin(100, 30000);
  put('l5-004', {
    q1: R(at(y1, 120)), q2: R(at(y2, 120)), q3: R(y1.m), q4: R(y1.p), q5: R(y2.m), q6: R(y2.p),
    q8: Pt(meet(y1, y2)), q9: R(xMeet(y1, y2)), q10: aboveSide(y1, y2),
  });
}
{
  // حوضان : 10 × 6 × 1,2 et 6 × 6 × 1,5 ; تدفق 6 m³/h ; unités 1h, 12m³
  const V1 = q(10 * 6).mul(q('1.2')); const V2 = q(36).mul(q('1.5'));
  const g = lin(6, 0); const f = lin(-6, V1); const I = meet(f, g);
  node({ x: I.x, y: I.y.div(q(12)) });
  put('l5-005', { q1: R(V1), q2: R(V2), q3: R(at(f, 2)), q4: R(at(g, 2)), q5: R(g.m), q6: R(f.m), q8: R(V2.div(g.m)), q9: Pt(I) });
}
{
  // (3/5)·L² = 960 ; AB = 20, DC = 40, AD = 24 ; f = (40 − x)·24/2 ; g = (20 + x)·24/2 ; unités 2m, 60m²
  const L = 40; if (!eq(q(3).div(q(5)).mul(q(L * L)), 960)) throw new Error('l5-006 : bouts');
  const W = q(3).div(q(5)).mul(q(L));
  if (!eq(q(L).mul(W).sub(q(240)), q(20 + 40).mul(q(24)).div(q(2)))) throw new Error('l5-006 : aire du trapèze');
  const f = lin(-12, q(40 * 24).div(q(2))); const g = lin(12, q(20 * 24).div(q(2))); const I = meet(f, g);
  node({ x: I.x.div(q(2)), y: I.y.div(q(60)) });
  put('l5-006', { q1: R(L), q2: R(W), q3: R(f.m), q4: R(f.p), q5: R(g.m), q6: R(g.p), q7: R(I.x), q9: Pt(I) });
}
{
  const y1 = lin(150, 21000); const y2 = lin(75, 27000);
  put('l5-007', {
    q1: R(at(y1, 60)), q2: R(at(y2, 60)), q3: R(y1.m), q4: R(y1.p), q5: R(y2.m), q6: R(y2.p),
    q8: Pt(meet(y1, y2)), q9: R(xMeet(y1, y2)), q10: aboveSide(y1, y2),
  });
}
{
  const f = lin(2000, 0); const g = lin(1000, 6000); const h = lin(0, 16000);
  put('l5-008', {
    q1: smallest([at(f, 5), at(g, 5), at(h, 5)]), q2: R(f.m), q3: R(g.m), q4: R(g.p),
    q6: R(xMeet(f, g)), q7: R(xMeet(f, h)), q8: R(xMeet(g, h)),
  });
}
{
  // unités du graphique : 25 قارورة, 1000DA
  const y1 = lin(40, 0); const y2 = lin(30, 1500); const n = q(8000).div(y1.m); const I = meet(y1, y2);
  node({ x: I.x.div(q(25)), y: I.y.div(q(1000)) });
  put('l5-009', {
    q1: R(at(y1, 100)), q2: R(at(y2, 100)), q3: R(n), q4: R(at(y2, n)), q5: R(y2.m), q6: R(y2.p), q7: R(I.x), q8: aboveSide(y1, y2), q10: Pt(I),
  });
}
{
  // unités du graphique : 5 رحلات, 100DA
  const y1 = lin(25, 0); const y2 = lin(15, 200); const n = q(375).div(y1.m); const I = meet(y1, y2);
  node({ x: I.x.div(q(5)), y: I.y.div(q(100)) });
  put('l5-010', {
    q1: R(at(y1, 10)), q2: R(at(y2, 10)), q3: R(n), q4: R(at(y2, n)), q5: R(y2.m), q6: R(y2.p), q8: Pt(I),
    q9: mostFor(650, [y1, y2]), q10: cheaperAt(12, [y1, y2]),
  });
}

export const ORACLE = O;
