// Oracle du banc « muadalat-x-murabba » au format BEM (déploiement unité 2, 2026-10-06) — chaque réponse RECALCULÉE ici
// à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`. Les questions « بيّن أن » (selfCheck)
// n'ont pas de clé. Fusionné dans scripts/practice-answer-oracle.test.mjs APRÈS les anciennes entrées en ligne
// de l'unité 2 (même identifiants) : une clé définie ici remplace l'ancienne.
//
// Outils : la racine carrée EXACTE d'un rationnel (racines entières du numérateur et du dénominateur,
// vérifiées — jamais Math.sqrt arrondi), les solutions de x² = a selon le signe de a, et
// (p + √c)(p − √c) = p² − c pour les étapes « على منوال BEM 2021 ».
import { R, C, q } from './helpers.mjs';

const ID = (lv, n) => `ex-4am-muadalat-x-murabba-l${lv}-${String(n).padStart(3, '0')}`;
const sign = (v) => { const x = q(v); return x.n > 0n ? 1 : x.n < 0n ? -1 : 0; };
const isqrt = (n) => {
  if (n < 0n) throw new Error('isqrt: négatif');
  if (n < 2n) return n;
  let x = n, y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x;
};
/** √a exacte (a rationnel ≥ 0, carré parfait) ; lève une erreur sinon. */
const root = (a) => {
  const x = q(a);
  if (x.n < 0n) throw new Error(`root: ${x} < 0`);
  const rn = isqrt(x.n), rd = isqrt(x.d);
  if (rn * rn !== x.n || rd * rd !== x.d) throw new Error(`root: ${x} n'est pas un carré parfait`);
  return q(`${rn}/${rd}`);
};
/** Solutions de x² = a, triées : [] si a < 0, [0] si a = 0, [−√a, √a] sinon. */
const sols = (a) => (sign(a) < 0 ? [] : sign(a) === 0 ? [q(0)] : [root(a).neg(), root(a)]);
const nSols = (a) => R(sols(a).length);
const NEG = (a) => R(sols(a)[0]);
const POS = (a) => R(sols(a)[1]);
/** « هل تقبل المعادلة … حلولا ؟ » : A = نعم, B = لا. */
const hasSols = (a) => C(sols(a).length > 0 ? 'A' : 'B');
/** k·x² + m = c ⇒ x² = (c − m) / k */
const iso = (k, m, c) => q(c).sub(m).div(k);
/** (p + √c)(p − √c) = p² − c */
const conj = (p, c) => q(p).mul(p).sub(c);
const sq = (v) => q(v).mul(q(v));
/** parties entières (rationnels positifs) */
const floorQ = (v) => { const x = q(v); return q(x.n / x.d); };
const ceilQ = (v) => { const x = q(v); return x.d === 1n ? x : q(x.n / x.d + 1n); };

// Rectangle d'aire S dont le petit côté vaut r × le grand : r·L² = S.
const rectL = (S, r) => root(q(S).div(r));

export const ORACLE = {
  /* ── Niveau 1 ─────────────────────────────────────────────────────────── */
  [`${ID(1, 1)}:q1`]: R(sq('-3/2')),
  [`${ID(1, 2)}:q1`]: C(sols(36).filter((s) => sq(s).toString() === '36').length === 1 ? 'A' : 'B'), // 6 et −6 : pas le seul
  [`${ID(1, 2)}:q2`]: NEG(36),
  [`${ID(1, 2)}:q3`]: POS(36),
  [`${ID(1, 3)}:q1`]: NEG(49),
  [`${ID(1, 3)}:q2`]: POS(49),
  [`${ID(1, 3)}:q3`]: hasSols(-49),
  [`${ID(1, 4)}:q1`]: nSols(-7),
  [`${ID(1, 4)}:q2`]: nSols(0),
  [`${ID(1, 4)}:q3`]: R(sign(7) > 0 ? 2 : 0),          // √7 irrationnel : seul le signe compte
  [`${ID(1, 4)}:q4`]: R(sign('0.7') > 0 ? 2 : 0),
  [`${ID(1, 5)}:q1`]: R(sols(0)[0]),
  [`${ID(1, 5)}:q2`]: hasSols(-1),
  [`${ID(1, 6)}:q1`]: R(sq(-9)),
  [`${ID(1, 6)}:q2`]: NEG(64),
  [`${ID(1, 7)}:q2`]: hasSols(-25),
  [`${ID(1, 8)}:q1`]: R(iso(2, 0, 22)),
  [`${ID(1, 9)}:q1`]: POS(iso(1, -81, 0)),
  [`${ID(1, 9)}:q2`]: NEG(iso(1, -81, 0)),
  [`${ID(1, 9)}:q3`]: hasSols(iso(1, 4, 0)),
  [`${ID(1, 10)}:q1`]: R(iso(1, -6, 0)),

  /* ── Niveau 2 ─────────────────────────────────────────────────────────── */
  [`${ID(2, 1)}:q1`]: C(sq(-3).toString() === '9' ? 'A' : 'B'),   // (−3)² = 9 : عمر على حق
  [`${ID(2, 1)}:q2`]: NEG(9),
  [`${ID(2, 1)}:q3`]: POS(9),
  [`${ID(2, 2)}:q1`]: R(sq('-2/3')),
  [`${ID(2, 2)}:q2`]: NEG('4/9'),
  [`${ID(2, 2)}:q3`]: POS('4/9'),
  [`${ID(2, 3)}:q1`]: POS(576),
  [`${ID(2, 3)}:q2`]: R(root(576).mul(4)),
  [`${ID(2, 4)}:q1`]: NEG('49/64'),
  [`${ID(2, 4)}:q2`]: POS('49/64'),
  [`${ID(2, 4)}:q3`]: POS('1.21'),
  [`${ID(2, 4)}:q4`]: NEG('1.21'),
  [`${ID(2, 5)}:q1`]: nSols(0),
  [`${ID(2, 5)}:q2`]: NEG('0.25'),
  [`${ID(2, 5)}:q3`]: POS('0.25'),
  [`${ID(2, 6)}:q1`]: R(13),                                         // (−√13)² = (√13)² = 13
  [`${ID(2, 7)}:q1`]: R(conj(3, 5)),
  [`${ID(2, 7)}:q2`]: NEG(conj(3, 5)),
  [`${ID(2, 7)}:q3`]: POS(conj(3, 5)),
  [`${ID(2, 8)}:q1`]: POS(iso(1, -121, 0)),
  [`${ID(2, 8)}:q2`]: NEG(iso(1, -121, 0)),
  [`${ID(2, 8)}:q3`]: NEG(iso(1, 5, 30)),
  [`${ID(2, 8)}:q4`]: POS(iso(1, 5, 30)),
  [`${ID(2, 9)}:q1`]: POS(iso(4, 0, 36)),
  [`${ID(2, 9)}:q2`]: NEG(iso(4, 0, 36)),
  [`${ID(2, 9)}:q3`]: NEG(iso(5, 0, 80)),
  [`${ID(2, 9)}:q4`]: POS(iso(5, 0, 80)),
  [`${ID(2, 10)}:q1`]: R(rectL(1350, '2/3')),
  [`${ID(2, 10)}:q2`]: R(rectL(1350, '2/3').mul('2/3')),
  [`${ID(2, 10)}:q3`]: R(rectL(1350, '2/3').add(rectL(1350, '2/3').mul('2/3')).mul(2)),

  /* ── Niveau 3 ─────────────────────────────────────────────────────────── */
  [`${ID(3, 1)}:q1`]: POS('2.89'),
  [`${ID(3, 1)}:q2`]: NEG('2.89'),
  [`${ID(3, 1)}:q3`]: NEG(361),
  [`${ID(3, 1)}:q4`]: POS(361),
  [`${ID(3, 1)}:q5`]: hasSols(-16),
  [`${ID(3, 2)}:q1`]: NEG(1),
  [`${ID(3, 2)}:q2`]: POS(1),
  [`${ID(3, 2)}:q3`]: C(sq(-1).toString() === '1' ? 'A' : 'B'),
  [`${ID(3, 2)}:q4`]: POS('1/4'),
  [`${ID(3, 2)}:q5`]: NEG('1/4'),
  [`${ID(3, 3)}:q1`]: R(sq('5/3')),
  [`${ID(3, 3)}:q2`]: R(sq('-0.4')),
  [`${ID(3, 3)}:q3`]: POS(sq('-0.4')),
  [`${ID(3, 4)}:q1`]: R(conj(6, 11)),
  [`${ID(3, 4)}:q2`]: NEG(conj(6, 11)),
  [`${ID(3, 4)}:q3`]: POS(conj(6, 11)),
  [`${ID(3, 4)}:q4`]: hasSols(conj(6, 11).neg()),                   // x² = (6 + √11)(√11 − 6) = −25
  ...(() => {
    const eqs = [4, 0, -4, '0.4', '-0.04'];
    const n = eqs.map((a) => (sign(a) > 0 ? 2 : sign(a) === 0 ? 1 : 0));
    return {
      [`${ID(3, 5)}:q1`]: R(n.filter((k) => k === 2).length),
      [`${ID(3, 5)}:q2`]: R(n.filter((k) => k === 0).length),
      [`${ID(3, 5)}:q3`]: R(n.reduce((s, k) => s + k, 0)),
    };
  })(),
  [`${ID(3, 6)}:q1`]: R(q(0).add(3)),                                // a − 3 = 0
  [`${ID(3, 6)}:q2`]: NEG(q(7).sub(3)),
  [`${ID(3, 6)}:q3`]: POS(q(7).sub(3)),
  [`${ID(3, 6)}:q4`]: hasSols(q(5).sub(7)),
  [`${ID(3, 7)}:q2`]: R(rectL(1440, '2/5')),
  [`${ID(3, 7)}:q3`]: R(rectL(1440, '2/5').mul('2/5')),
  [`${ID(3, 8)}:q1`]: POS(q(8).mul(2)),
  [`${ID(3, 8)}:q2`]: NEG(q(8).mul(2)),
  [`${ID(3, 8)}:q3`]: R(sols(iso(2, 7, 7))[0]),                      // x² = 0 : solution unique
  [`${ID(3, 8)}:q4`]: NEG(iso(3, -12, 0)),
  [`${ID(3, 8)}:q5`]: POS(iso(3, -12, 0)),
  [`${ID(3, 9)}:q1`]: hasSols(iso(1, 9, 2)),
  [`${ID(3, 9)}:q2`]: NEG(iso(-2, 5, -13)),
  [`${ID(3, 9)}:q3`]: POS(iso(-2, 5, -13)),
  [`${ID(3, 9)}:q4`]: POS(iso(-1, 0, -16)),
  [`${ID(3, 9)}:q5`]: NEG(iso(-1, 0, -16)),
  [`${ID(3, 10)}:q1`]: POS(iso(4, 0, 36)),                           // (2x)² = 4x²
  [`${ID(3, 10)}:q2`]: NEG(iso(4, 0, 36)),
  [`${ID(3, 10)}:q3`]: NEG(iso('1/9', 0, 4)),                        // (x/3)² = x²/9
  [`${ID(3, 10)}:q4`]: POS(iso('1/9', 0, 4)),

  /* ── Niveau 4 ─────────────────────────────────────────────────────────── */
  [`${ID(4, 1)}:q1`]: hasSols(iso(-1, 0, 2)),
  [`${ID(4, 1)}:q2`]: R(iso(2, -6, 0)),
  [`${ID(4, 1)}:q4`]: NEG(iso(-1, 1, 0)),                            // x + 1 − x² = x ⇔ −x² + 1 = 0
  [`${ID(4, 1)}:q5`]: POS(iso(-1, 1, 0)),
  [`${ID(4, 2)}:q1`]: POS(iso(-9, 1, 0)),
  [`${ID(4, 2)}:q2`]: NEG(iso(-9, 1, 0)),
  [`${ID(4, 2)}:q3`]: hasSols(iso(1, 3, 0)),
  [`${ID(4, 3)}:q1`]: C(sols(64).length === 1 ? 'A' : 'B'),          // « x = 8 » seul : faux
  [`${ID(4, 3)}:q2`]: NEG(64),
  [`${ID(4, 3)}:q3`]: POS(64),
  [`${ID(4, 3)}:q4`]: R(root(64).add(1)),   // x − 1 = 8
  [`${ID(4, 3)}:q5`]: R(root(64).neg().add(1)),                      // x − 1 = −8
  [`${ID(4, 4)}:q1`]: R(sq(-6)),
  [`${ID(4, 4)}:q2`]: C(sq(-6).toString() === '-36' ? 'A' : 'B'),
  [`${ID(4, 4)}:q3`]: NEG(iso(1, -36, 0)),
  [`${ID(4, 4)}:q4`]: POS(iso(1, -36, 0)),
  [`${ID(4, 5)}:q3`]: NEG(iso(1, 1, 10)),
  [`${ID(4, 5)}:q4`]: POS(iso(1, 1, 10)),
  // x² = 20 : s = √20, t = −√20 (irrationnels) — calcul symbolique : s + t = 0, s·t = −(√20)², s² + t² = 2·20
  [`${ID(4, 6)}:q1`]: R(0),
  [`${ID(4, 6)}:q2`]: R(q(20).neg()),
  [`${ID(4, 6)}:q3`]: R(q(20).mul(2)),
  [`${ID(4, 7)}:q1`]: R(conj(7, 13)),
  [`${ID(4, 7)}:q2`]: NEG(conj(7, 13)),
  [`${ID(4, 7)}:q3`]: POS(conj(7, 13)),
  [`${ID(4, 7)}:q4`]: NEG(conj(7, 13).mul(4)),
  [`${ID(4, 7)}:q5`]: POS(conj(7, 13).mul(4)),
  // A = x(x − 5) + 5(x + 2) + 6 = x² + 16 ; B = (x − 7)(x + 4) + 3x + 19 = x² + (4 − 7 + 3)x + (−28 + 19)
  [`${ID(4, 8)}:q2`]: hasSols(q(-10).sub(6)),
  [`${ID(4, 8)}:q4`]: NEG(q(28).sub(19)),
  [`${ID(4, 8)}:q5`]: POS(q(28).sub(19)),
  [`${ID(4, 9)}:q2`]: POS(iso(3, 5, 32)),
  [`${ID(4, 9)}:q3`]: NEG(iso(3, 5, 32)),
  ...(() => {
    const L = rectL(1536, '2/3'); const W = L.mul('2/3');
    const x = q(64).mul(12).div(W);
    return {
      [`${ID(4, 10)}:q1`]: R(L),
      [`${ID(4, 10)}:q2`]: R(W),
      [`${ID(4, 10)}:q3`]: R(x),
      [`${ID(4, 10)}:q4`]: R(W.mul(L.sub(x)).div(32)),
    };
  })(),

  /* ── Niveau 5 — الوضعيات الإدماجية ───────────────────────────────────── */
  ...(() => {
    const L = rectL(1350, '2/3'); const W = L.mul('2/3');
    const x = q(900).div(W);
    return {
      [`${ID(5, 1)}:q1`]: R(L),
      [`${ID(5, 1)}:q2`]: R(W),
      [`${ID(5, 1)}:q4`]: R(x),
      [`${ID(5, 1)}:q5`]: R(W.mul(x).mul(6).mul(50)),
    };
  })(),
  ...(() => {
    const L = rectL(1960, '2/5'); const W = L.mul('2/5');
    const rest = L.mul(W).sub(196);
    return {
      [`${ID(5, 2)}:q1`]: R(L),
      [`${ID(5, 2)}:q2`]: R(W),
      [`${ID(5, 2)}:q3`]: POS(196),
      [`${ID(5, 2)}:q4`]: R(rest),
      [`${ID(5, 2)}:q5`]: R(rest.div(36)),
    };
  })(),
  ...(() => {
    const a = root(2025);
    // a·x = 2·a·(a − x) ⇔ 3a·x = 2a² ⇔ x = 2a/3
    return {
      [`${ID(5, 3)}:q1`]: R(a),
      [`${ID(5, 3)}:q3`]: R(a.mul(a).mul(2).div(a.mul(3))),
    };
  })(),
  ...(() => {
    const c = root('90.25').mul(100);                  // cm
    const tiles = c.div(50).mul(c.div(50));
    const boxes = ceilQ(tiles.div(10));                                // boîtes entières
    return { [`${ID(5, 4)}:q1`]: R(boxes.mul(1450).add(q('90.25').mul(300))) };
  })(),
  ...(() => {
    const r = root(q('50.24').div('3.14'));
    const per = q(2).mul('3.14').mul(r);
    return { [`${ID(5, 5)}:q1`]: R(q(40680).sub(3000).div(per)) };
  })(),
  [`${ID(5, 6)}:q1`]: R(q('3.84').div('1.5')),
  [`${ID(5, 6)}:q2`]: POS(q('3.84').div('1.5')),
  [`${ID(5, 6)}:q3`]: R(q('3.84').mul(1000).div(160)),
  ...(() => {
    const W = rectL(1200, 3);                                          // largeur W, longueur 3W : 3·W² = 1200
    const L = W.mul(3);
    const cost = L.mul(W).mul(1500);
    return {
      [`${ID(5, 7)}:q1`]: R(W),
      [`${ID(5, 7)}:q2`]: R(L),
      [`${ID(5, 7)}:q3`]: R(cost),
      [`${ID(5, 7)}:q4`]: R(cost.mul(q(100).sub(75)).div(100)),
    };
  })(),
  ...(() => {
    const c = root('2.56');
    const n = floorQ(q(8).div(c)).mul(floorQ(q('4.8').div(c)));      // panneaux par rangée × rangées
    return {
      [`${ID(5, 8)}:q1`]: R(c),
      [`${ID(5, 8)}:q2`]: R(n),
      [`${ID(5, 8)}:q3`]: R(n.mul('1.5').mul(30)),
    };
  })(),
  ...(() => {
    const c = root(q(864).div(6));
    return {
      [`${ID(5, 9)}:q1`]: R(c),
      [`${ID(5, 9)}:q2`]: R(c.mul(c).mul(c)),
      [`${ID(5, 9)}:q3`]: R(q(50).mul(864).mul('0.5')),
    };
  })(),
  ...(() => {
    const S = conj(9, 17);
    const side = root(S);
    // périmètre de l'ancienne : 2·[(9 + √17) + (9 − √17)] = 2·18 (les √17 s'annulent)
    return {
      [`${ID(5, 10)}:q1`]: R(S),
      [`${ID(5, 10)}:q2`]: R(side),
      [`${ID(5, 10)}:q3`]: R(q(2).mul(18).sub(side.mul(4))),
    };
  })(),
};
