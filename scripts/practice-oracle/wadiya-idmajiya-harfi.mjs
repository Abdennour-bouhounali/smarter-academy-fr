// Oracle du banc « wadiya-idmajiya-harfi » (unité 3 « الحساب الحرفي », synthèse) — feuilles BEM
// (2026-10-07) : chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé.
// Fusionné dans scripts/practice-answer-oracle.test.mjs.
//
// Méthode (coefficients rationnels exacts, `poly` de helpers.mjs) :
//   • une forme développée ax² + bx + c : on construit l'expression de l'énoncé, on lit ses coefficients ;
//   • une forme « (facteur donné)(mx + n) » : division exacte de l'expression par le facteur donné ;
//   • une forme « (kx + m)(k'x + n) » : racines rationnelles cherchées par balayage p/q, puis m = −k·r ;
//   • une équation produit nul : racine de chaque facteur affine, rangées (plus petite / plus grande) ;
//   • une valeur : évaluation exacte de l'expression de l'énoncé ; une tâche ☜ : le calcul de la situation.
// Aucune clé n'est recopiée du contenu : seuls les nombres de l'énoncé servent.
import { R, C, poly } from './helpers.mjs';

const x = poly.x;
const lin = (a, b) => x.mul(a).add(b);            // a·x + b
const sq = (p) => p.pow(2);
const K = (n) => poly.of(n);
const coef = (p, k) => p.coef(k);
const at = (p, v) => p.at(v);
const Q = poly.Q;
const lt = (a, b) => Q(a).sub(b).n < 0n;

/** Racine d'un facteur affine a·x + b. */
const rootOf = (p) => { if (p.degree() !== 1) throw new Error('rootOf: non affine'); return Q(p.coef(0)).neg().div(p.coef(1)).toString(); };
/** [plus petite, plus grande] racine de f1·f2 = 0. */
const roots2 = (f1, f2) => { const a = rootOf(f1); const b = rootOf(f2); return lt(a, b) ? [a, b] : [b, a]; };
/** Quotient exact de p par d (reste nul exigé). */
function div(p, d) {
  let r = p; let out = K(0);
  while (r.degree() >= d.degree()) {
    const k = r.degree() - d.degree();
    const c = Q(r.coef(r.degree())).div(d.coef(d.degree())).toString();
    const t = x.pow(k).mul(c);
    out = out.add(t); r = r.sub(d.mul(t));
  }
  if (r.degree() >= 0) throw new Error('div: reste non nul');
  return out;
}
/** Racines rationnelles d'un polynôme de degré 2 (balayage p/q, |p| ≤ 400, q ≤ 12), rangées. */
function ratRoots(p) {
  const found = new Set();
  for (let d = 1; d <= 12; d += 1) for (let n = -400; n <= 400; n += 1) {
    const r = Q(`${n}/${d}`).toString();
    if (Q(p.at(r)).isZero()) found.add(r);
  }
  const out = [...found].sort((a, b) => (lt(a, b) ? -1 : 1));
  if (out.length !== 2) throw new Error(`ratRoots: ${out.length} racines`);
  return out;
}
/** (k1·x + m)(k2·x + n) = p : m et n à partir des racines (affectation choisie par `pick`). */
function linFactors(p, k1, k2, pick) {
  const [r1, r2] = ratRoots(p);
  const cands = [[r1, r2], [r2, r1]].map(([a, b]) => ({ m: Q(a).mul(-k1).toString(), n: Q(b).mul(-k2).toString() }))
    .filter(({ m, n }) => lin(k1, m).mul(lin(k2, n)).equals(p));
  const ok = cands.filter(pick);
  if (ok.length !== 1) throw new Error(`linFactors: ${ok.length} écritures`);
  return ok[0];
}
const isInt = (v) => Q(v).d === 1n;
const intPair = ({ m, n }) => isInt(m) && isInt(n);
const mLtN = ({ m, n }) => lt(m, n);
/** Frontière k d'une inéquation (L ≤ R) devenue affine après simplification. */
const boundary = (L, Rt) => rootOf(L.sub(Rt));
const ab = (p) => ({ a: R(coef(p, 2)), b: R(coef(p, 1)), c: R(coef(p, 0)) });

/* ── Données des énoncés ─────────────────────────────────────────────── */
// l1-001 / l3-001 (ex-34) : AB = x + 4, BC = 4x, rectangle en B
const AB34 = lin(1, 4); const BC34 = lin(4, 0);
const S34 = AB34.mul(BC34).mul('1/2');
const AC2_34 = sq(AB34).add(sq(BC34));
// l2-001 / l3-002 (ex-37) : carré 10, carré x en A, rectangle 4 × 10, rectangle x × 4
const EF37 = K(10).sub(x).sub(4);
const A37 = K(100).sub(sq(x)).sub(4 * 10).sub(x.mul(4));
// l3-003 (ex-39)
const D39 = sq(x).sub(4).add(lin(1, -2).mul(lin(3, 5)));
// l4-001 (ex-38) : BC = x + 2, AC = 2x + 5, rectangle en B
const AB2_38 = sq(lin(2, 5)).sub(sq(lin(1, 2)));
// l4-004 (ex-40)
const E40 = lin(0, -5).add(x.mul(-8)).add(sq(x).mul(4));
const F40 = sq(lin(2, -2)).sub(9);

const id = (l, n) => `ex-4am-wadiya-idmajiya-harfi-l${l}-${String(n).padStart(3, '0')}`;
const keys = {};
const put = (l, n, list) => list.forEach((v, i) => { if (v !== null) keys[`${id(l, n)}:q${i + 1}`] = v; });
const S = null; // selfCheck : pas de clé

/* ── Niveau 1 ── */
put(1, 1, [R(coef(S34, 2)), R(coef(S34, 1)), R(at(S34, 1))]);
{ const A = x.mul(2).mul(lin(1, 2)); put(1, 2, [R(coef(A, 2)), R(coef(A, 1)), R(at(A, -2))]); }
{ const E = sq(lin(1, 5)); const F = sq(x).add(25);
  // F = x² + 25 ≥ 25 > 0 : aucune racine réelle → pas de facteur affine → « لا » (B)
  const minF = Number(at(F, 0)); if (!(minF > 0) || coef(F, 1) !== '0') throw new Error('l1-003');
  put(1, 3, [R(coef(E, 1)), R(coef(E, 0)), C('B')]); }
put(1, 4, [R(lin(1, -1).mul(lin(1, 1)).at(20)), R(sq(lin(1, -1)).at(20))]);   // (20 − 1)(20 + 1) ، (20 − 1)²
{ const S5 = x.mul(lin(1, 3)); put(1, 5, [R(coef(S5, 1)), R(at(S5, 5))]); }
{ const P = lin(1, 2).mul(4); const A = sq(lin(1, 2)); put(1, 6, [R(coef(P, 1)), R(coef(P, 0)), R(coef(A, 1)), R(coef(A, 0))]); }
{ const A = lin(1, -3).mul(lin(1, 5)); put(1, 7, [R(coef(A, 1)), R(coef(A, 0)), R(at(A, 3))]); }
{ const B = sq(x).mul(2).add(x.mul(5)).sub(7); if (!lin(1, -1).mul(lin(2, 7)).equals(B)) throw new Error('l1-008'); put(1, 8, [S, R(at(B, 1)), R(at(B, 0))]); }
{ const side = x.add(3).add(3); const M = sq(side).sub(sq(x)); put(1, 9, [R(coef(side, 0)), R(coef(M, 1)), R(coef(M, 0))]); }
{ const E = sq(x).sub(25); const [r1, r2] = ratRoots(E); put(1, 10, [R(r2), R(at(E, 105))]); if (Q(r1).add(r2).n !== 0n) throw new Error('l1-010'); }

/* ── Niveau 2 ── */
put(2, 1, [R(coef(EF37, 1)), R(coef(EF37, 0)), R(rootOf(EF37))]);        // EF > 0 ⇔ x < 6
{ const lhs = lin(2, 3).mul(lin(1, -5)); if (!lhs.equals(sq(x).mul(2).add(x.mul(-7)).sub(15))) throw new Error('l2-002 تحقق');
  const A = lhs.add(lin(2, 3).mul(lin(1, 2))); const Qt = div(A, lin(2, 3)); const [r1, r2] = roots2(lin(2, 3), Qt);
  put(2, 2, [S, R(coef(Qt, 1)), R(coef(Qt, 0)), R(r1), R(r2)]); }
{ const E = lin(1, 4).mul(lin(-1, 1)); put(2, 3, [...Object.values(ab(E)), R(at(E, 1))]); }
{ const E = sq(x).add(x.mul(10)).add(25); const [r] = [...new Set(ratRoots2(E))]; put(2, 4, [R(Q(r).neg().toString()), R(at(E, 95))]); }
{ const E = lin(3, -2).mul(lin(1, 4)); const F = E.sub(lin(3, -2).mul(lin(2, 1))); const Qt = div(F, lin(3, -2)); const [r1, r2] = roots2(lin(3, -2), lin(-1, 3));
  if (!Qt.equals(lin(-1, 3))) throw new Error('l2-005');
  put(2, 5, [...Object.values(ab(E)), R(coef(Qt, 1)), R(coef(Qt, 0)), R(r1), R(r2)]); }
{ const S6 = lin(1, 20).mul(lin(1, 10)); put(2, 6, [R(coef(S6, 1)), R(coef(S6, 0)), R(at(S6, 40))]); }
{ const E = lin(1, -4).mul(lin(2, 1)); put(2, 7, [...Object.values(ab(E)), R(at(E, 4)), R(at(E, 0))]); }
{ const S8 = x.mul(lin(1, 2)).mul('1/2'); put(2, 8, [R(coef(S8, 2)), R(coef(S8, 1)), R(at(S8, 4))]); }
{ const F = sq(lin(1, 1)).sub(1); const Qt = div(F, x); put(2, 9, [R(coef(Qt, 0)), R(at(F, 99))]); }
{ const G = sq(x).sub(x.mul(6)).add(9); const [r] = ratRoots2(G); put(2, 10, [R(r), R(at(G, 53))]); }

/* ── Niveau 3 ── */
put(3, 1, [...Object.values(ab(AC2_34)), R(sqrtExact(at(AC2_34, 2)))]);
put(3, 2, [S, ...Object.values(ab(A37)), R(at(A37, 4))]);
{ const Qt = div(D39, lin(1, -2)); put(3, 3, [...Object.values(ab(D39)), R(coef(Qt, 1)), R(coef(Qt, 0)), R(at(D39, 2)), R(at(D39, 0)), R(at(D39, '-1.75'))]); }
{ // E = (p − √k·x)² avec p = 1, k = 2 : x² → k ; √k·x → −2p ; constante → p² ; E(√k) = (p − k)²
  const p = 1; const k = 2;
  put(3, 4, [R(k), R(-2 * p), R(p * p), R(sq(K(p).sub(k)).at(0))]); }
{ const side = lin(2, 6); const Sm = sq(side).sub(36); const Qt = div(Sm, x); // S = x·(4x + 24) = 4x(x + 6)
  const m = coef(Qt, 1); const n = Q(coef(Qt, 0)).div(m).toString();
  put(3, 5, [R(coef(side, 1)), R(coef(side, 0)), R(coef(Sm, 2)), R(coef(Sm, 1)), R(m), R(n), R(at(Sm, '1.5'))]); }
{ const side = x.add(1).add(1); const P = sq(side).sub(sq(x)); put(3, 6, [R(coef(side, 0)), R(coef(P, 1)), R(coef(P, 0)), R(at(P, 9))]); }
{ const St = lin(2, 20).mul(lin(2, 30)); const M = St.sub(600); put(3, 7, [...Object.values(ab(St)), R(coef(M, 2)), R(coef(M, 1)), R(at(M, 2))]); }
{ const E = sq(lin(3, -1)).sub(49); if (!E.equals(sq(x).mul(9).sub(x.mul(6)).sub(48))) throw new Error('l3-008 تحقق');
  const { m, n } = linFactors(E, 3, 3, mLtN); const [r1, r2] = roots2(lin(3, m), lin(3, n)); put(3, 8, [S, R(m), R(n), R(r1), R(r2)]); }
{ const E = sq(lin(3, 2)).sub(sq(lin(1, 4))); const { m, n } = linFactors(E, 2, 4, (f) => lt(f.m, 0) && intPair(f)); const [r1, r2] = roots2(lin(2, m), lin(4, n));
  put(3, 9, [...Object.values(ab(E)), R(m), R(n), R(r1), R(r2)]); }
{ const E = lin(1, -4).mul(lin(1, -9)).add(lin(1, -4).mul(2)); const Qt = div(E, lin(1, -4)); const [r1, r2] = roots2(lin(1, -4), Qt);
  put(3, 10, [R(coef(E, 1)), R(coef(E, 0)), R(coef(Qt, 0)), R(r1), R(r2), R(at(E, 204))]); }

/* ── Niveau 4 ── */
{ const { m, n } = linFactors(AB2_38, 1, 3, intPair);
  const AB = Math.sqrt(Number(at(AB2_38, 0))); const rounded = (Math.round(AB * 100) / 100).toFixed(2);
  put(4, 1, [...Object.values(ab(AB2_38)), R(m), R(n), R(at(AB2_38, 0)), R(rounded)]); }
{ const E = sq(lin(2, -5)).sub(lin(1, 1).mul(lin(2, -5))); const Qt = div(E, lin(2, -5)); const [r1, r2] = roots2(lin(2, -5), Qt);
  const k = boundary(E, sq(x).mul(2).add(13));   // −17x + 17 ≤ 0 ⇔ x ≥ 1
  put(4, 2, [...Object.values(ab(E)), R(coef(Qt, 0)), R(r1), R(r2), R(k)]); }
{ const P = lin(2, -3).mul(lin(1, 4)); if (!P.equals(sq(x).mul(2).add(x.mul(5)).sub(12))) throw new Error('l4-003 تحقق');
  const E = P.add(sq(lin(2, -3))); const Qt = div(E, lin(2, -3)); const k = boundary(P, sq(x).mul(2).add(9));
  put(4, 3, [S, R(coef(Qt, 1)), R(coef(Qt, 0)), R(k)]); }
{ const { m, n } = linFactors(F40, 2, 2, mLtN); if (!F40.equals(E40)) throw new Error('ex-40');
  put(4, 4, [R(at(E40, '0.5')), ...Object.values(ab(F40)), R(m), R(n), R(at(F40, '0.5'))]); }
{ const D = sq(lin(1, 3)).sub(sq(lin(1, 1)));
  // BC² = AB² + AC² ⇔ D = (x + 2)² ⇔ x² = 4 (x > 0)
  const eq = sq(lin(1, 2)).sub(D); const [, xr] = ratRoots(eq);
  const per = lin(1, 1).add(lin(1, 2)).add(lin(1, 3));
  put(4, 5, [R(coef(D, 1)), R(coef(D, 0)), S, R(xr), R(at(per, xr))]); }
{ const A = x.mul(lin(1, 5)); const [, w] = ratRoots(A.sub(50)); put(4, 6, [R(coef(A, 1)), S, R(w), R(Q(w).add(5).add(w).mul(2).toString())]); }
{ const D = sq(lin(1, 3)).sub(sq(x)); put(4, 7, [R(coef(D, 1)), R(coef(D, 0)), R(rootOf(D.sub(27))), R(at(D, 100))]); }
{ const D = sq(lin(1, 8)).sub(sq(lin(1, 7))); const eq = sq(x).sub(D);      // x² − 2x − 15
  const [r1, r2] = ratRoots(eq); const { m, n } = linFactors(eq, 1, 1, mLtN);
  const xv = lt(0, r1) ? r1 : r2; const area = x.mul(lin(1, 7)).mul('1/2');
  put(4, 8, [R(coef(D, 1)), R(coef(D, 0)), S, R(m), R(n), R(xv), R(at(area, xv))]); }
{ const Kx = sq(x).sub(9).add(lin(1, 3).mul(lin(2, -1))); const Qt = div(Kx, lin(1, 3));
  put(4, 9, [R(coef(Qt, 1)), R(coef(Qt, 0)), ...Object.values(ab(Kx)), R(at(Kx, -3)), R(at(Kx, 0)), R(at(Kx, '4/3'))]); }
{ const L = sq(lin(2, 3)).sub(sq(lin(1, -1))); const { m, n } = linFactors(L, 1, 3, intPair); const [r1, r2] = roots2(lin(1, m), lin(3, n));
  put(4, 10, [R(m), R(n), ...Object.values(ab(L)), R(r1), R(r2)]); }

/* ── Niveau 5 (وضعيات) ── */
{ // l5-001 : AB = x + 12, AD = x, MC = 8 ; BCM = 8x/2 ; S = x(x + 12) − 4x ; S = 105 ; سياج 1200DA/m
  const tri = x.mul(8).mul('1/2'); const Sx = x.mul(lin(1, 12)).sub(tri);
  if (!Sx.sub(105).equals(sq(lin(1, 4)).sub(121))) throw new Error('l5-001 تحقق');
  const { m, n } = linFactors(Sx.sub(105), 1, 1, mLtN); const xv = ratRoots(Sx.sub(105)).find((r) => lt(0, r));
  const per = Q(xv).add(12).add(xv).mul(2);
  put(5, 1, [R(coef(tri, 1)), R(coef(Sx, 1)), S, R(m), R(n), R(xv), R(per.mul(1200).toString())]); }
{ // l5-002 : AB = x + 10, AD = x + 2, DM = x → MC = 10 ; g = 10(x + 2)/2 ; f = ABCD − g ; f = 3g ; عشب 950DA/m²
  const MC = lin(1, 10).sub(x); const g = MC.mul(lin(1, 2)).mul('1/2'); const f = lin(1, 10).mul(lin(1, 2)).sub(g);
  const Qt = div(f, lin(1, 2)); const xv = ratRoots(f.sub(g.mul(3))).find((r) => lt(0, r));
  put(5, 2, [R(coef(g, 1)), R(coef(g, 0)), S, R(coef(Qt, 0)), R(coef(f, 1)), R(coef(f, 0)), R(xv), R(Q(at(f, xv)).mul(950).toString())]); }
{ // l5-003 : حديقة 24 ، ممرّان عرضهما x ؛ P = 24x + 24x − x² ؛ S = 576 − P = 400 ؛ بلاط 1800DA/m²
  const P = x.mul(24).mul(2).sub(sq(x)); const sq24 = sq(K(24).sub(x)); const Sx = K(576).sub(P);
  if (!Sx.equals(sq24)) throw new Error('l5-003');
  const xv = ratRoots(Sx.sub(400)).find((r) => lt(0, r) && lt(r, 24));
  put(5, 3, [R(coef(P, 2)), R(coef(P, 1)), R(coef(sq24, 1)), R(coef(sq24, 0)), S, R(xv), R(Q(at(P, xv)).mul(1800).toString())]); }
{ // l5-004 : حقل (x + 10)² ، حظيرة x² ؛ S2 = 3 S1 ؛ سياج 650DA/m
  const S1 = sq(x); const S2 = sq(lin(1, 10)).sub(S1); const g = coef(S2, 1); const n = Q(coef(S2, 0)).div(g).toString();
  const xv = ratRoots(S2.sub(S1.mul(3))).find((r) => lt(0, r));
  put(5, 4, [R(coef(S2, 1)), R(coef(S2, 0)), R(g), R(n), R(xv), R(at(S2, xv)), R(Q(xv).add(10).mul(4).mul(650).toString())]); }
{ // l5-005 : E = (x + 3)², F = (x + 3)(x − 1) ; أرضية (x + 3) × (2x + 2) ؛ x = 5 ؛ موكيت 1200DA/m² ، شريط 150DA/m
  const E = sq(lin(1, 3)); const F = lin(1, 3).mul(lin(1, -1)); const T = E.add(F); const Qt = div(T, lin(1, 3));
  const area = at(T, 5); const per = Q(at(lin(1, 3), 5)).add(at(lin(2, 2), 5)).mul(2);
  put(5, 5, [R(coef(E, 1)), R(coef(E, 0)), R(coef(F, 1)), R(coef(F, 0)), R(coef(Qt, 1)), R(coef(Qt, 0)), R(area), R(Q(area).mul(1200).add(per.mul(150)).toString())]); }
{ // l5-006 : R = (2x + 5)² − (x + 1)² ; x = 6 ; رخام 40DA/dm² ، زخرفة 15DA/dm²
  const Rx = sq(lin(2, 5)).sub(sq(lin(1, 1))); const Qt = div(Rx, lin(1, 4)); const v = at(Rx, 6);
  put(5, 6, [...Object.values(ab(Rx)), R(coef(Qt, 1)), R(coef(Qt, 0)), R(v), R(Q(v).mul(40).add(Q(at(sq(lin(1, 1)), 6)).mul(15)).toString())]); }
{ // l5-007 : AB = x + 30, AD = x ; MBCN = 30x ; S = 1000 ; خيمة 16 m² ، 1200DA
  const MBCN = lin(1, 30).sub(x).mul(x); const Sx = x.mul(lin(1, 30)); if (!Sx.sub(1000).equals(sq(lin(1, 15)).sub(1225))) throw new Error('l5-007 تحقق');
  const { m, n } = linFactors(Sx.sub(1000), 1, 1, mLtN); const xv = ratRoots(Sx.sub(1000)).find((r) => lt(0, r));
  const tents = Q(at(sq(x), xv)).div(16); if (!isInt(tents.toString())) throw new Error('l5-007 خيام');
  put(5, 7, [R(coef(MBCN, 1)), S, S, R(m), R(n), R(xv), R(tents.toString()), R(tents.mul(1200).toString())]); }
{ // l5-008 : AB = x + 20, AD = x + 4, AM = x ; S1 + S2 = 336 ; طاولات 6 و 8 m² ، 300 و 400DA
  const S1 = x.mul(lin(1, 4)); const S2 = lin(1, 20).sub(x).mul(lin(1, 4)); const T = S1.add(S2);
  if (!T.equals(sq(lin(1, 12)).sub(64))) throw new Error('l5-008 تحقق');
  const { m, n } = linFactors(T.sub(336), 1, 1, mLtN); const xv = ratRoots(T.sub(336)).find((r) => lt(0, r));
  const v = Q(at(S1, xv)).div(6); const fr = Q(at(S2, xv)).div(8);
  put(5, 8, [R(coef(S1, 1)), R(coef(S2, 1)), R(coef(S2, 0)), S, R(m), R(n), R(xv), R(v.toString()), R(fr.toString()), R(v.mul(300).add(fr.mul(400)).toString())]); }
{ // l5-009 : x(x + 6) = 432 ; مجريان على الطول، 1300DA/m
  const A = x.mul(lin(1, 6)); if (!A.sub(432).equals(sq(lin(1, 3)).sub(441))) throw new Error('l5-009 تحقق');
  const { m, n } = linFactors(A.sub(432), 1, 1, mLtN); const w = ratRoots(A.sub(432)).find((r) => lt(0, r)); const L = Q(w).add(6);
  put(5, 9, [R(coef(A, 1)), S, R(m), R(n), R(w), R(L.toString()), R(L.mul(2).mul(1300).toString())]); }
{ // l5-010 : x(x + 10) = 600 ; DM = y ; BCM = 20(30 − y)/2 ; ABMD = 2·BCM
  const A = x.mul(lin(1, 10)); if (!A.sub(600).equals(sq(lin(1, 5)).sub(625))) throw new Error('l5-010 تحقق');
  const { m, n } = linFactors(A.sub(600), 1, 1, mLtN); const w = ratRoots(A.sub(600)).find((r) => lt(0, r)); const Lg = Q(w).add(10).toString();
  const y = x; // la variable y joue le rôle de x dans le calcul polynomial
  const tri = K(Lg).sub(y).mul(w).mul('1/2'); const trap = K(Q(w).mul(Lg).toString()).sub(tri);
  put(5, 10, [R(coef(A, 1)), S, R(m), R(n), R(w), R(coef(tri, 1)), R(coef(tri, 0)), R(rootOf(trap.sub(tri.mul(2))))]); }

/* ── Petits outils propres à cette feuille ── */
function ratRoots2(p) { // racine double d'un carré parfait (x − r)² : renvoie [r, r]
  for (let d = 1; d <= 12; d += 1) for (let n = -400; n <= 400; n += 1) {
    const r = Q(`${n}/${d}`).toString();
    if (Q(p.at(r)).isZero()) { if (!sq(x.sub(r)).mul(p.coef(2)).equals(p)) throw new Error('ratRoots2'); return [r, r]; }
  }
  throw new Error('ratRoots2: aucune racine');
}
function sqrtExact(v) { const n = Number(v); const r = Math.round(Math.sqrt(n)); if (r * r !== n) throw new Error('sqrtExact'); return r; }

export const ORACLE = keys;
