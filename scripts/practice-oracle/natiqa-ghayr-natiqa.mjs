// Oracle du banc « natiqa-ghayr-natiqa » au format BEM (déploiement unité 2, 2026-10-06) — chaque réponse RECALCULÉE ici
// à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`. Les questions « بيّن أن » (selfCheck)
// n'ont pas de clé. Fusionné dans scripts/practice-answer-oracle.test.mjs APRÈS les anciennes entrées en ligne
// de l'unité 2 (même identifiants) : une clé définie ici remplace l'ancienne.
//
// Outils (exacts, sans Math.sqrt) :
//   rs(x)        racine EXACTE d'un rationnel ('0,49', '25/9', 169) en chaîne, ou null s'il n'est pas le carré d'un rationnel ;
//   yn(x)        « هل √x عدد ناطق ؟ » → C('A') (نعم) si x est le carré d'un rationnel, sinon C('B') (لا) ;
//   isq(n)       partie entière de √n (BigInt) — encadrement entre deux entiers consécutifs ;
//   S(x), down/up/rnd : valeur de √x en virgule fixe à 40 décimales (racine entière BigInt), puis valeur approchée
//                par défaut / par excès / arrondi à 10^-k. Chaque appel VÉRIFIE que la valeur est à plus de 10^-30
//                de la frontière qui décide (sinon il lève), donc la troncature à 40 décimales ne peut pas tromper ;
//   surd(a, b, n) le nombre a + b√n (a, b rationnels) : add / sub / mul / div par un rationnel, exacts.
import { R, C, q } from './helpers.mjs';

/* ── Rationnels et racines exactes ─────────────────────────────────────── */
const isqrtBig = (n) => {
  n = BigInt(n);
  if (n < 0n) throw new Error('isqrt négatif');
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2)); // 2^⌈bits/2⌉ ≥ √n : Newton décroît vers ⌊√n⌋
  for (;;) { const y = (x + n / x) / 2n; if (y >= x) break; x = y; }
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x;
};
const isq = (n) => isqrtBig(n).toString();
/** racine exacte d'un rationnel positif, ou null */
const rs = (x) => {
  const v = q(x);
  if (v.n < 0n) return null;
  const a = isqrtBig(v.n); const b = isqrtBig(v.d);
  return a * a === v.n && b * b === v.d ? q(`${a}/${b}`).toString() : null;
};
const yn = (x) => C(rs(x) !== null ? 'A' : 'B');
const isSq = (x) => rs(x) !== null;

/* ── Virgule fixe à 40 décimales ───────────────────────────────────────── */
const P = 40n;
const SCALE = 10n ** P;
const fx = (x) => { const v = q(x); return (v.n * SCALE) / v.d; };                // rationnel → virgule fixe (exact si décimal)
const S = (x) => { const v = q(x); return isqrtBig((v.n * SCALE * SCALE) / v.d); }; // √x, tronquée à 10^-40
const TOL = 10n ** (P - 30n);
const unitOf = (k) => 10n ** (P - BigInt(k));
const asDec = (N, k) => q(`${N}/${10n ** BigInt(k)}`).toString();
const down = (v, k) => {
  const u = unitOf(k); const r = v % u;
  if (r < TOL || u - r < TOL) throw new Error('valeur trop proche d’un point de la grille');
  return asDec(v / u, k);
};
const up = (v, k) => {
  const u = unitOf(k); const r = v % u;
  if (r < TOL || u - r < TOL) throw new Error('valeur trop proche d’un point de la grille');
  return asDec(v / u + 1n, k);
};
const rnd = (v, k) => {
  const u = unitOf(k); const r = v % u; const half = u / 2n;
  if (r - half < TOL && half - r < TOL) throw new Error('valeur trop proche du milieu');
  return asDec(r >= half ? v / u + 1n : v / u, k);
};

/* ── a + b√n exacts ────────────────────────────────────────────────────── */
const surd = (a, b, n) => ({
  a: q(a), b: q(b), n,
  add(o) { return surd(this.a.add(o.a), this.b.add(o.b), n); },
  sub(o) { return surd(this.a.sub(o.a), this.b.sub(o.b), n); },
  mul(o) { return surd(this.a.mul(o.a).add(this.b.mul(o.b).mul(n)), this.a.mul(o.b).add(this.b.mul(o.a)), n); },
  div(k) { return surd(this.a.div(k), this.b.div(k), n); },
  rat() { if (!this.b.isZero()) throw new Error(`${this.a} + ${this.b}√${n} n'est pas rationnel`); return this.a.toString(); },
  eq(o) { return this.a.sub(o.a).isZero() && this.b.sub(o.b).isZero(); },
});
/** √n = k√m, m sans facteur carré */
const simp = (n) => { let k = 1; let m = n; for (let p = 2; p * p <= m; p++) while (m % (p * p) === 0) { m /= p * p; k *= p; } return [k, m]; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const prod = (...xs) => xs.reduce((acc, x) => acc.mul(x), q(1)).toString();

/* ── Valeurs partagées ─────────────────────────────────────────────────── */
// l3-004 : A = (√5 − 1)(√5 + 1)
const A_l3_004 = surd(-1, 1, 5).mul(surd(1, 1, 5)).rat();
// l3-008 : A = √2(√2 + 3) − 3√2
const A_l3_008 = surd(0, 1, 2).mul(surd(3, 1, 2)).sub(surd(0, 3, 2)).rat();
// l4-005 : m = √63 − 2√7 + 3 ; n = 3 − √7
const [k63, m63] = simp(63);
if (m63 !== 7) throw new Error('√63 = k√7 attendu');
const m_l4_005 = surd(3, k63 - 2, 7);
// l4-008 : B = (4 + √2)/√2 = (4 + √2)·√2 / 2
const B_l4_008 = surd(4, 1, 2).mul(surd(0, 1, 2)).div(2);
// l4-009 : A = √2(√2 + 1) + √8 − 1 doit valoir 1 + 3√2 (le « بيّن أن »)
const [k8, m8] = simp(8);
const A_l4_009 = surd(0, 1, 2).mul(surd(1, 1, 2)).add(surd(-1, k8, m8));
if (!A_l4_009.eq(surd(1, 3, 2))) throw new Error('l4-009 : A ≠ 1 + 3√2');
// l5-002 : clôture au périmètre arrondi par excès, entrée de 1,5 m déduite
const side_l5_002 = up(S(200), 1);
// l5-006 : diagonale arrondie à 10^-1
const d_l5_006 = rnd(S(800), 1);
// l5-008 : côté du second napperon, par excès à 10^-1
const side_l5_008 = up(S('3,38'), 1);
// l5-007 : nombre de carrés de côté c = √(aire) tenant sur une longueur L : plus grand k avec k²·aire ≤ L²
const fit = (L, area) => { let k = 0; while (q(k + 1).mul(k + 1).mul(area).sub(q(L).mul(L)).n <= 0n) k++; return k; };

export const ORACLE = {
  /* ── Niveau 1 ── */
  'ex-4am-natiqa-ghayr-natiqa-l1-001:q1': R(rs(169)),
  'ex-4am-natiqa-ghayr-natiqa-l1-001:q2': C(isSq(169) ? 'A' : 'B'), // A = الصنف الأول (جذور ناطقة)
  'ex-4am-natiqa-ghayr-natiqa-l1-002:q1': R(rs('25/9')),
  'ex-4am-natiqa-ghayr-natiqa-l1-003:q1': R([12, 20, 36, 50].filter(isSq).join(', ')),
  'ex-4am-natiqa-ghayr-natiqa-l1-003:q2': R(rs([12, 20, 36, 50].find(isSq))),
  'ex-4am-natiqa-ghayr-natiqa-l1-004:q1': C(['A', 'B', 'C', 'D'][['1,44', '0,36', '4/25', 11].findIndex((x) => !isSq(x))]),
  'ex-4am-natiqa-ghayr-natiqa-l1-004:q2': R(rs('4/25')),
  'ex-4am-natiqa-ghayr-natiqa-l1-005:q1': R(rs('0,49')),
  'ex-4am-natiqa-ghayr-natiqa-l1-005:q2': yn('0,49'),
  'ex-4am-natiqa-ghayr-natiqa-l1-006:q1': R(rs('49/64')),
  'ex-4am-natiqa-ghayr-natiqa-l1-006:q2': R(rs('0,81')),
  'ex-4am-natiqa-ghayr-natiqa-l1-007:q1': R(q('1.732').mul('1.732')),
  // « 1,732050808 هي القيمة المضبوطة للعدد √3 ؟ » : نعم seulement si son carré vaut 3
  'ex-4am-natiqa-ghayr-natiqa-l1-007:q2': C(q('1.732050808').mul('1.732050808').sub(3).isZero() ? 'A' : 'B'),
  'ex-4am-natiqa-ghayr-natiqa-l1-008:q1': R(rs(25)),
  'ex-4am-natiqa-ghayr-natiqa-l1-008:q2': yn(26),
  'ex-4am-natiqa-ghayr-natiqa-l1-009:q1': R(isq(30)),
  'ex-4am-natiqa-ghayr-natiqa-l1-010:q1': R([4, 8, 16, 32, 64, 128].filter(isSq).join(', ')),

  /* ── Niveau 2 ── */
  'ex-4am-natiqa-ghayr-natiqa-l2-001:q1': R(rs('16/9')),
  'ex-4am-natiqa-ghayr-natiqa-l2-001:q2': C(['A', 'B', 'C', 'D'][[13, 100, '0,25', 9].findIndex((x) => !isSq(x))]),
  'ex-4am-natiqa-ghayr-natiqa-l2-002:q1': R(isq(41)),
  'ex-4am-natiqa-ghayr-natiqa-l2-002:q2': R(isq(113)),
  'ex-4am-natiqa-ghayr-natiqa-l2-003:q1': R(rs('1,21')),
  'ex-4am-natiqa-ghayr-natiqa-l2-003:q2': R(rs('2,25')),
  'ex-4am-natiqa-ghayr-natiqa-l2-003:q3': R(prod(rs('1,21'), rs('2,25'))),
  'ex-4am-natiqa-ghayr-natiqa-l2-004:q1': R(rs('49/9')),
  'ex-4am-natiqa-ghayr-natiqa-l2-004:q2': R(rs('0,36')),
  'ex-4am-natiqa-ghayr-natiqa-l2-004:q3': R(prod(rs('49/9'), rs('0,36'))),
  'ex-4am-natiqa-ghayr-natiqa-l2-005:q1': R(down(S(5), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l2-005:q2': R(up(S(5), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l2-006:q1': R(rs('16/9')),
  'ex-4am-natiqa-ghayr-natiqa-l2-006:q2': R(rs('81/4')),
  'ex-4am-natiqa-ghayr-natiqa-l2-006:q3': R(prod(rs('16/9'), rs('81/4'))),
  'ex-4am-natiqa-ghayr-natiqa-l2-007:q1': R(q(rs('0,25')).add(1)),
  'ex-4am-natiqa-ghayr-natiqa-l2-007:q2': R(q(2).sub(rs('2,25'))),
  'ex-4am-natiqa-ghayr-natiqa-l2-007:q3': R(q(rs('0,25')).add(1).mul(q(2).sub(rs('2,25')))),
  'ex-4am-natiqa-ghayr-natiqa-l2-008:q1': R(q('1/3').add(rs('4/9'))),
  'ex-4am-natiqa-ghayr-natiqa-l2-008:q2': R(q(rs('9/25')).mul(q('1/3').add(rs('4/9')).add(4))),
  'ex-4am-natiqa-ghayr-natiqa-l2-009:q1': R(prod(rs('0,09'), rs('100/49'))),
  'ex-4am-natiqa-ghayr-natiqa-l2-009:q2': yn('0,9'),
  'ex-4am-natiqa-ghayr-natiqa-l2-010:q1': R(q(rs('6,25')).sub(rs('0,25'))),
  'ex-4am-natiqa-ghayr-natiqa-l2-010:q2': R(q(rs('6,25')).sub(rs('0,25')).mul(rs('36/49'))),

  /* ── Niveau 3 ── */
  'ex-4am-natiqa-ghayr-natiqa-l3-001:q1': R(down(S(43), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-001:q2': R(up(S(43), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-001:q3': R(down(S(8), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-001:q4': R(up(S(8), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-001:q5': R(down(fx(13) - S(7), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-001:q6': R(up(fx(13) - S(7), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-002:q1': yn(12),
  'ex-4am-natiqa-ghayr-natiqa-l3-002:q2': R(rnd(S(12), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-002:q3': R(rnd(4n * S(12), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-003:q1': R(prod('3/7', '3/7')),
  'ex-4am-natiqa-ghayr-natiqa-l3-003:q2': R(prod('1.2', '1.2')),
  'ex-4am-natiqa-ghayr-natiqa-l3-003:q3': yn(prod(2, '3/7', '3/7')),
  'ex-4am-natiqa-ghayr-natiqa-l3-004:q1': R(A_l3_004),
  'ex-4am-natiqa-ghayr-natiqa-l3-004:q2': R(rs(A_l3_004)),
  'ex-4am-natiqa-ghayr-natiqa-l3-004:q3': yn(q(A_l3_004).add(1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-005:q1': R(rs('64/9')),
  'ex-4am-natiqa-ghayr-natiqa-l3-005:q2': R(prod(rs('64/9'), rs('2,25'))),
  'ex-4am-natiqa-ghayr-natiqa-l3-005:q3': R(down(S('2,5'), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l3-006:q1': R(q(rs('1,69')).sub(rs('0,49'))),
  'ex-4am-natiqa-ghayr-natiqa-l3-006:q2': R(q(rs('9/4')).add(rs('1/4'))),
  'ex-4am-natiqa-ghayr-natiqa-l3-006:q3': R(q(rs('1,69')).sub(rs('0,49')).mul(q(rs('9/4')).add(rs('1/4')))),
  'ex-4am-natiqa-ghayr-natiqa-l3-006:q4': yn(q(rs('1,69')).sub(rs('0,49')).mul(q(rs('9/4')).add(rs('1/4')))),
  'ex-4am-natiqa-ghayr-natiqa-l3-007:q1': R(surd(1, 1, 3).mul(surd(-1, 1, 3)).rat()),
  'ex-4am-natiqa-ghayr-natiqa-l3-007:q2': yn(surd(1, 1, 3).mul(surd(-1, 1, 3)).rat()),
  'ex-4am-natiqa-ghayr-natiqa-l3-007:q3': R(up(S(surd(1, 1, 3).mul(surd(-1, 1, 3)).rat()), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l3-008:q1': R(A_l3_008),
  'ex-4am-natiqa-ghayr-natiqa-l3-008:q2': R(rs(q(A_l3_008).add('1/4'))),
  'ex-4am-natiqa-ghayr-natiqa-l3-008:q3': yn(A_l3_008),
  'ex-4am-natiqa-ghayr-natiqa-l3-009:q1': yn(40),
  'ex-4am-natiqa-ghayr-natiqa-l3-009:q2': R(up(S(40), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-009:q3': R(down(S(40), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l3-010:q1': yn('0,5'),
  'ex-4am-natiqa-ghayr-natiqa-l3-010:q2': R(rnd(S('0,5'), 2)),

  /* ── Niveau 4 ── */
  // triangle équilatéral de côté 2 : AH² = 2² − 1² ; aire = 2·AH/2 = √3
  'ex-4am-natiqa-ghayr-natiqa-l4-001:q1': R(4 - 1),
  'ex-4am-natiqa-ghayr-natiqa-l4-001:q2': yn(4 - 1),
  'ex-4am-natiqa-ghayr-natiqa-l4-001:q3': R(up(S(4 - 1), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l4-002:q1': R(rnd(S(7) + fx(3), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l4-002:q2': R(rnd(S(54), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l4-002:q3': R(rnd(S(7) + S(11), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l4-003:q1': R(rs('1/9')),
  'ex-4am-natiqa-ghayr-natiqa-l4-003:q2': C(isSq('1/9') ? 'B' : 'A'), // أمين يقول « ليس ناطقًا » : il a tort si 1/9 est un carré
  'ex-4am-natiqa-ghayr-natiqa-l4-003:q3': yn('1/7'),
  'ex-4am-natiqa-ghayr-natiqa-l4-004:q1': R((() => { const [a, m] = simp(12); const [b, n] = simp(27); if (m !== 3 || n !== 3) throw new Error('a√3'); return a + b; })()),
  'ex-4am-natiqa-ghayr-natiqa-l4-004:q2': R(rs(12 * 27)),
  'ex-4am-natiqa-ghayr-natiqa-l4-004:q3': yn(12),
  'ex-4am-natiqa-ghayr-natiqa-l4-004:q4': R(rnd(S(12), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l4-005:q1': R(m_l4_005.b),
  'ex-4am-natiqa-ghayr-natiqa-l4-005:q2': R(m_l4_005.a),
  'ex-4am-natiqa-ghayr-natiqa-l4-005:q3': R(m_l4_005.mul(surd(3, -1, 7)).rat()),
  'ex-4am-natiqa-ghayr-natiqa-l4-005:q4': R(down(S(7) + fx(3), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l4-006:q1': R(3 * 3 + 1 * 1),
  'ex-4am-natiqa-ghayr-natiqa-l4-006:q2': yn(3 * 3 + 1 * 1),
  'ex-4am-natiqa-ghayr-natiqa-l4-006:q3': R(down(S(3 * 3 + 1 * 1), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l4-007:q1': R(range(1, 20).filter((n) => isSq(2 * n)).join(', ')),
  'ex-4am-natiqa-ghayr-natiqa-l4-007:q2': R(rs(2 * 18)),
  'ex-4am-natiqa-ghayr-natiqa-l4-007:q3': R(isq(2 * 10)),
  'ex-4am-natiqa-ghayr-natiqa-l4-008:q1': R(B_l4_008.b),
  'ex-4am-natiqa-ghayr-natiqa-l4-008:q2': R(B_l4_008.a),
  'ex-4am-natiqa-ghayr-natiqa-l4-008:q3': R(B_l4_008.mul(surd(-1, 2, 2)).rat()),
  'ex-4am-natiqa-ghayr-natiqa-l4-008:q4': yn(B_l4_008.mul(surd(-1, 2, 2)).rat()),
  'ex-4am-natiqa-ghayr-natiqa-l4-008:q5': R(rnd(S(B_l4_008.mul(surd(-1, 2, 2)).rat()), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l4-009:q2': R(A_l4_009.mul(surd(-1, 3, 2)).rat()),
  'ex-4am-natiqa-ghayr-natiqa-l4-009:q3': yn(A_l4_009.mul(surd(-1, 3, 2)).rat()),
  'ex-4am-natiqa-ghayr-natiqa-l4-009:q4': R(isq(A_l4_009.mul(surd(-1, 3, 2)).rat())),
  'ex-4am-natiqa-ghayr-natiqa-l4-010:q1': R(rs('50/8')),
  'ex-4am-natiqa-ghayr-natiqa-l4-010:q2': R(rs('8/18')),
  'ex-4am-natiqa-ghayr-natiqa-l4-010:q3': R(prod(rs('50/8'), rs('8/18'))),
  'ex-4am-natiqa-ghayr-natiqa-l4-010:q4': yn('0,4'),

  /* ── Niveau 5 (الوضعيات الإدماجية) ── */
  'ex-4am-natiqa-ghayr-natiqa-l5-001:q1': R(rs('51,84')),
  'ex-4am-natiqa-ghayr-natiqa-l5-001:q2': R(q(rs('51,84')).div('0.4')),
  'ex-4am-natiqa-ghayr-natiqa-l5-001:q3': R(prod(q(rs('51,84')).div('0.4'), q(rs('51,84')).div('0.4'))),
  'ex-4am-natiqa-ghayr-natiqa-l5-001:q4': R(prod(q(rs('51,84')).div('0.4'), q(rs('51,84')).div('0.4'), 120)),
  'ex-4am-natiqa-ghayr-natiqa-l5-001:q5': yn(45),
  'ex-4am-natiqa-ghayr-natiqa-l5-002:q1': yn(200),
  'ex-4am-natiqa-ghayr-natiqa-l5-002:q2': R(side_l5_002),
  'ex-4am-natiqa-ghayr-natiqa-l5-002:q3': R(q(side_l5_002).mul(4).sub('1.5').mul(850)),
  'ex-4am-natiqa-ghayr-natiqa-l5-003:q1': R(rs('6,25')),
  'ex-4am-natiqa-ghayr-natiqa-l5-003:q2': R(q(rs('6,25')).mul(4).mul(450).add(q('6.25').div('1.25').mul(900))),
  'ex-4am-natiqa-ghayr-natiqa-l5-003:q3': yn(8),
  'ex-4am-natiqa-ghayr-natiqa-l5-003:q4': R(rnd(S(8), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l5-004:q1': R(q('3.375').div('1.5')),
  'ex-4am-natiqa-ghayr-natiqa-l5-004:q2': R(rs(q('3.375').div('1.5'))),
  'ex-4am-natiqa-ghayr-natiqa-l5-004:q3': yn(3),
  'ex-4am-natiqa-ghayr-natiqa-l5-004:q4': R(down(S(3), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l5-004:q5': R(up(S(3), 2)),
  // le côté √3 passe par une porte de 1,75 m ⇔ 3 < 1,75²
  'ex-4am-natiqa-ghayr-natiqa-l5-004:q6': C(q('1.75').mul('1.75').sub(3).n > 0n ? 'A' : 'B'),
  'ex-4am-natiqa-ghayr-natiqa-l5-005:q1': R(rs(1764)),
  'ex-4am-natiqa-ghayr-natiqa-l5-005:q2': R(prod(3, 4, rs(1764))),
  'ex-4am-natiqa-ghayr-natiqa-l5-005:q3': R(Math.ceil(Number(prod(3, 4, rs(1764))) / 100) * 2800),
  'ex-4am-natiqa-ghayr-natiqa-l5-005:q4': R(up(S(1800), 1)),
  'ex-4am-natiqa-ghayr-natiqa-l5-006:q1': R(rs(400)),
  'ex-4am-natiqa-ghayr-natiqa-l5-006:q2': R(400 + 400),
  'ex-4am-natiqa-ghayr-natiqa-l5-006:q3': yn(400 + 400),
  'ex-4am-natiqa-ghayr-natiqa-l5-006:q4': R(d_l5_006),
  'ex-4am-natiqa-ghayr-natiqa-l5-006:q5': R(prod(d_l5_006, 1, 1200)),
  'ex-4am-natiqa-ghayr-natiqa-l5-007:q1': R(rs('1,44')),
  'ex-4am-natiqa-ghayr-natiqa-l5-007:q2': R(fit(5, '1.44') * fit('3.7', '1.44')),
  'ex-4am-natiqa-ghayr-natiqa-l5-007:q3': R(up(S(2), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l5-007:q4': R(fit(5, 2) * fit('3.7', 2)),
  'ex-4am-natiqa-ghayr-natiqa-l5-008:q1': R(rs('1,69')),
  'ex-4am-natiqa-ghayr-natiqa-l5-008:q2': R(prod(4, rs('1,69'), 150)),
  'ex-4am-natiqa-ghayr-natiqa-l5-008:q3': yn('3,38'),
  'ex-4am-natiqa-ghayr-natiqa-l5-008:q4': R(side_l5_008),
  'ex-4am-natiqa-ghayr-natiqa-l5-008:q5': R(prod(4, side_l5_008, 150)),
  'ex-4am-natiqa-ghayr-natiqa-l5-009:q1': R(rs('12,25')),
  'ex-4am-natiqa-ghayr-natiqa-l5-009:q2': R(prod('12.25', '1.2', 1000)),
  'ex-4am-natiqa-ghayr-natiqa-l5-009:q3': R(q(prod('12.25', '1.2', 1000)).div(35).div(60)),
  'ex-4am-natiqa-ghayr-natiqa-l5-009:q4': R(down(S(10), 2)),
  'ex-4am-natiqa-ghayr-natiqa-l5-010:q1': R(rs(12 * 27)),
  'ex-4am-natiqa-ghayr-natiqa-l5-010:q2': R(q(2 * (12 + 27)).sub(q(4).mul(rs(12 * 27))).mul(1200)),
  'ex-4am-natiqa-ghayr-natiqa-l5-010:q3': yn(8 * 15),
  'ex-4am-natiqa-ghayr-natiqa-l5-010:q4': R(rnd(S(8 * 15), 2)),
};
