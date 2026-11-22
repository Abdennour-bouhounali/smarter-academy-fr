// Oracle du banc « tawzif-khawass-judhur » au format BEM (déploiement unité 2, 2026-10-06) — chaque réponse RECALCULÉE ici
// à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`. Les questions « بيّن أن » (selfCheck)
// n'ont pas de clé. Fusionné dans scripts/practice-answer-oracle.test.mjs APRÈS les anciennes entrées en ligne
// de l'unité 2 (même identifiants) : une clé définie ici remplace l'ancienne.
//
// Outil : un petit calcul EXACT sur les nombres r₀ + Σ cₖ√k (k sans facteur carré, cₖ rationnels), écrit ici,
// sans Math.sqrt : rt(98) = 7√2, rt(32, 3) = 3√32 = 12√2, produits √a·√b, division par c√k ou par a + b√k
// (conjugué). `.coef(k)` lit le coefficient de √k, `.rat()` exige un nombre sans radical.
import { R, C, q } from './helpers.mjs';

const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return Math.abs(a); };
/** n = r²·k avec k sans facteur carré → [r, k] */
const sqfree = (n) => {
  let r = 1; let k = n;
  for (let d = 2; d * d <= k; d++) while (k % (d * d) === 0) { k /= d * d; r *= d; }
  return [r, k];
};

class S {
  constructor(m = new Map()) { this.m = m; }
  static of(v) { return v instanceof S ? v : new S(new Map([[1, q(v)]])); }
  /** c·√n, simplifié */
  static rt(n, c = 1) { const [r, k] = sqfree(n); return new S(new Map([[k, q(c).mul(r)]])); }
  add(o) {
    o = S.of(o);
    const m = new Map(this.m);
    for (const [k, c] of o.m) m.set(k, (m.get(k) ?? q(0)).add(c));
    return new S(m);
  }
  neg() { return new S(new Map([...this.m].map(([k, c]) => [k, c.neg()]))); }
  sub(o) { return this.add(S.of(o).neg()); }
  mul(o) {
    o = S.of(o);
    let out = new S();
    for (const [k1, c1] of this.m) {
      for (const [k2, c2] of o.m) {
        const g = gcd(k1, k2); // √k1·√k2 = g·√((k1/g)(k2/g))
        out = out.add(new S(new Map([[(k1 / g) * (k2 / g), c1.mul(c2).mul(g)]])));
      }
    }
    return out;
  }
  terms() { return [...this.m].filter(([, c]) => !c.isZero()); }
  /** division par un nombre de la forme a + b√k (un seul radical) : on multiplie par le conjugué */
  div(o) {
    o = S.of(o);
    const t = o.terms();
    const ks = t.map(([k]) => k).filter((k) => k !== 1);
    if (ks.length === 0) return this.mul(S.of(q(1).div(o.coef(1))));
    if (ks.length > 1) throw new Error('div : diviseur à plusieurs radicaux');
    const k = ks[0];
    const a = q(o.coef(1)); const b = q(o.coef(k));
    const conj = new S(new Map([[1, a], [k, b.neg()]]));
    const norm = a.mul(a).sub(b.mul(b).mul(k)); // (a + b√k)(a − b√k)
    return this.mul(conj).mul(S.of(q(1).div(norm)));
  }
  coef(k) { return (this.m.get(k) ?? q(0)).toString(); }
  rat() {
    for (const [k] of this.terms()) if (k !== 1) throw new Error(`rat : reste un terme en √${k}`);
    return this.coef(1);
  }
}
const rt = (n, c = 1) => S.rt(n, c);
const sum = (...terms) => terms.reduce((acc, t) => acc.add(t), new S());
/** plus petit entier ≥ x (x rationnel positif) */
const ceil = (x) => { const v = q(x); return ((v.n + v.d - 1n) / v.d).toString(); };
/** rationnel du sujet (virgule décimale) */
const d = (s) => q(s);

// ── Niveau 1 ────────────────────────────────────────────────────────────
const L1_008_A = S.of(3).div(rt(2)); // 3/√2 = (3/2)√2 → a de a√2/2
const L1_009_A = S.of(7).div(rt(3));
const L1_010_B = S.of(5).div(rt(5, 2)); // = (1/2)√5 → c = 1 / coef

// ── Niveau 2 ────────────────────────────────────────────────────────────
const L2_002_A = sum(rt(125), rt(45), rt(20, -1));
const L2_005_C = sum(rt(98), rt(8, -1));
const L2_009_A = rt(20); const L2_009_B = rt(45, 3);
const L2_010_E = rt(3).mul(rt(3).add(2));

// ── Niveau 3 ────────────────────────────────────────────────────────────
const L3_001_B = sum(rt(250), rt(490, -1), rt(81, 2));
const L3_002_A = rt(80); const L3_002_B = rt(45, 2); const L3_002_C = rt(5).add(1);
const L3_002_Q = L3_002_C.mul(L3_002_C).div(rt(5)); // C²/√5 = (a√5 + b)/5
const L3_003_A = sum(rt(108), rt(12, -1)); const L3_003_B = S.of(3).div(rt(3, 2));
const L3_004_A = q(9).div(7).mul(q(10).div(3).sub(1)); const L3_004_B = sum(rt(3, 5), rt(12, 3), rt(48, -1));
const L3_004_AB = S.of(L3_004_A).div(L3_004_B); // = √3 / c
const L3_005_A = rt(18, 2).mul(rt(2)); const L3_005_B = sum(rt(20, 3), rt(45, -1), rt(5));
const L3_006_A = sum(rt(45), rt(20, 2), rt(5, -3)); const L3_006_B = rt(3).add(6).div(rt(3));
const L3_007_A = sum(rt(12, 2), rt(3, -4), rt(75), rt(147, -1));
const L3_008_SQX = rt(2, 8).sub(rt(50)); // √x
const L3_009_D = rt(5).add(1).mul(rt(5).add(1));
const L3_010_SIDE = rt(48); const L3_010_DIAG = rt(48 + 48);

// ── Niveau 4 ────────────────────────────────────────────────────────────
const L4_001_A = sum(rt(98), rt(32, 3), rt(128, -1)); const L4_001_B = q(3).div(2).add(q(5).div(4).mul(q(2).div(3)));
const L4_002_A = q(3).div(5).add(q(2).div(5).mul(q(7).div(4)));
const L4_002_B = d('1,2').mul(d('0,01')).mul(7).div(d('12,5').mul(1000)); // 1,2×10⁻²×7 / (12,5×10³)
const sci = (x) => { let n = 0; let a = q(x); while (a.n >= 10n * a.d) { a = a.div(10); n++; } while (a.n < a.d) { a = a.mul(10); n--; } return [a.toString(), n]; };
const L4_002_C = sum(rt(175), rt(112, -1), rt(7, 6));
const L4_003_B = sum(rt(108), rt(27, 2), rt(75, -1)); const L4_003_C = rt(3, 4).div(rt(2));
const L4_004_A = sum(rt(75), rt(27, 2), rt(108, -1)); const L4_004_B = q(5).div(6).add(q(1).div(2).mul(q(4).div(3)));
const L4_005_A = rt(32).add(7); const L4_005_B = rt(2, -4).add(7); const L4_005_Q = L4_005_A.div(L4_005_B); // (a + b√2)/17
const L4_006_E = sum(rt(72), rt(18, -2), rt(50));
const L4_007_D = sum(rt(8, 3), rt(18, -1));
const L4_008_E = S.of(4).div(rt(6)); // (a√6)/3 → a = 3·coef
const L4_009_A = sum(rt(28, 3), rt(63, -2), rt(700));
const L4_010_A = S.of(1).div(rt(2)).add(S.of(1).div(rt(8)));

// ── Niveau 5 ────────────────────────────────────────────────────────────
const L5_001_SIDE = rt(288); const L5_001_P = L5_001_SIDE.mul(4);
const L5_001_ROLLS = ceil(q(L5_001_P.coef(2)).mul(d('1,41')).div(10));
const L5_002_L = rt(600 * 3); const L5_002_W = L5_002_L.mul(S.of(q(1).div(3)));
const L5_002_D = rt(Number(L5_002_L.mul(L5_002_L).add(L5_002_W.mul(L5_002_W)).rat()));
const L5_003_SIDE = rt(162); const L5_003_DIAG = Number(L5_003_SIDE.mul(rt(2)).rat());
const L5_003_TREES = 2 * (L5_003_DIAG / 3 + 1) - 1;
const L5_003_PMAX = q(9200 - 1400).div(q(L5_003_TREES).mul(d('1,2')));
const L5_004_L = rt(400 * 2); const L5_004_W = L5_004_L.mul(S.of(q(1).div(2)));
const L5_004_D = rt(Number(L5_004_L.mul(L5_004_L).add(L5_004_W.mul(L5_004_W)).rat()));
const L5_005_SIDE = rt(50); const L5_005_RECT = L5_005_SIDE.mul(rt(98));
const L5_006_SIDE = rt(48); const L5_006_WALLS = L5_006_SIDE.mul(3).mul(4);
const L5_006_CANS = ceil(q(L5_006_WALLS.coef(3)).mul(d('1,73')).div(6).div(2));
const L5_007_AREA = rt(180).mul(rt(80));
const L5_008_AB = rt(48); const L5_008_AC = rt(27); const L5_008_BC = rt(48 + 27);
const L5_008_AREA = L5_008_AB.mul(L5_008_AC).mul(S.of(q(1).div(2)));
const L5_009_L = rt(60); const L5_009_W = S.of(45).div(L5_009_L); // (a√15)/2
const L5_010_L = rt(5).add(1); const L5_010_W = rt(5).sub(1); const L5_010_AREA = L5_010_L.mul(L5_010_W);
const L5_010_RATIO = L5_010_L.div(L5_010_W); // (a + √5)/2

const K = 'ex-4am-tawzif-khawass-judhur-';
export const ORACLE = {
  // ── niveau 1
  [`${K}l1-001:q1`]: R(rt(8).coef(2)),
  [`${K}l1-001:q2`]: R(rt(75).coef(3)),
  [`${K}l1-002:q1`]: R(4 * 4 * 3), // 4√3 = √(4²·3)
  [`${K}l1-002:q2`]: R(2 * 2 * 7),
  [`${K}l1-003:q1`]: R(sqfree(45)[0]),
  [`${K}l1-003:q2`]: R(sqfree(45)[1]),
  [`${K}l1-004:q1`]: R(sqfree(72)[0] ** 2),
  [`${K}l1-004:q2`]: R(rt(72).coef(2)),
  [`${K}l1-005:q1`]: R(sum(rt(50), rt(18), rt(8, -1)).coef(2)),
  [`${K}l1-006:q1`]: R(sum(rt(3, 5), rt(3, 2)).coef(3)),
  [`${K}l1-006:q2`]: R(sum(rt(5, 4), rt(5, -9)).coef(5)),
  [`${K}l1-007:q1`]: R(sum(rt(2, 3), rt(2, 5), rt(2, -1)).coef(2)),
  [`${K}l1-007:q2`]: R(sum(rt(7, 2), rt(7, -6), rt(7)).coef(7)),
  [`${K}l1-008:q1`]: R(q(L1_008_A.coef(2)).mul(2)),
  [`${K}l1-008:q2`]: R(S.of(5).div(rt(5)).coef(5)),
  [`${K}l1-009:q1`]: R(rt(3).mul(rt(3)).rat()),
  [`${K}l1-009:q2`]: R(q(L1_009_A.coef(3)).mul(3)),
  [`${K}l1-010:q1`]: R(q(1).div(L1_010_B.coef(5))),
  // ── niveau 2
  [`${K}l2-001:q1`]: R(rt(18).coef(2)),
  [`${K}l2-001:q2`]: R(sum(rt(8), rt(18, -3), rt(50, 2), rt(2, -7)).coef(2)),
  [`${K}l2-002:q1`]: R(L2_002_A.coef(5)),
  [`${K}l2-002:q2`]: R(L2_002_A.mul(rt(5)).mul(S.of(q(1).div(30))).rat()),
  [`${K}l2-003:q1`]: R(q(2).div(3).add(q(7).div(3).mul(q(5).div(14)))),
  [`${K}l2-003:q2`]: R(sum(rt(112, 2), rt(28, -3), rt(7)).coef(7)), // le sujet imprime « + √7 » (le corrigé recopie « + 3√7 »)
  [`${K}l2-004:q1`]: R(q(3).div(4).add(q(5).div(4).mul(q(6).div(15)))),
  [`${K}l2-004:q2`]: R(sum(rt(48, 2), rt(75, -3), rt(3)).coef(3)),
  [`${K}l2-005:q1`]: R(sqfree(98)[0]),
  [`${K}l2-005:q2`]: R(sqfree(98)[1]),
  [`${K}l2-005:q3`]: R(L2_005_C.coef(2)),
  [`${K}l2-006:q1`]: R(sum(rt(12), rt(27)).coef(3)),
  [`${K}l2-006:q2`]: R(sum(rt(50), rt(8, -1)).coef(2)),
  [`${K}l2-007:q1`]: R(rt(20).coef(5)),
  [`${K}l2-007:q2`]: R(rt(45).coef(5)),
  [`${K}l2-008:q1`]: R(S.of(12).div(rt(3)).coef(3)),
  [`${K}l2-008:q2`]: R(S.of(10).div(rt(5)).coef(5)),
  [`${K}l2-009:q1`]: R(L2_009_A.add(L2_009_B).coef(5)),
  [`${K}l2-009:q2`]: R(L2_009_A.mul(L2_009_B).rat()),
  [`${K}l2-010:q1`]: R(L2_010_E.coef(1)),
  [`${K}l2-010:q2`]: R(L2_010_E.coef(3)),
  [`${K}l2-010:q3`]: R(L2_010_E.sub(rt(12)).rat()),
  // ── niveau 3
  [`${K}l3-001:q1`]: R(rt(250).coef(10)),
  [`${K}l3-001:q2`]: R(rt(490).coef(10)),
  [`${K}l3-001:q3`]: R(L3_001_B.coef(1)),
  [`${K}l3-001:q4`]: R(L3_001_B.coef(10)),
  [`${K}l3-002:q1`]: R(L3_002_A.add(L3_002_B).coef(5)),
  [`${K}l3-002:q2`]: R(L3_002_A.mul(L3_002_B).rat()),
  [`${K}l3-002:q3`]: R(q(L3_002_Q.coef(5)).mul(5)),
  [`${K}l3-002:q4`]: R(q(L3_002_Q.coef(1)).mul(5)),
  [`${K}l3-003:q1`]: R(L3_003_A.coef(3)),
  [`${K}l3-003:q2`]: R(q(1).div(L3_003_B.coef(3))),
  [`${K}l3-003:q3`]: R(L3_003_A.add(1).mul(L3_003_B.mul(8).sub(1)).rat()),
  [`${K}l3-004:q1`]: R(L3_004_A),
  [`${K}l3-004:q2`]: R(L3_004_B.coef(3)),
  [`${K}l3-004:q3`]: R(q(1).div(L3_004_AB.coef(3))),
  [`${K}l3-005:q1`]: R(L3_005_A.rat()),
  [`${K}l3-005:q2`]: R(L3_005_B.coef(5)),
  [`${K}l3-006:q1`]: R(L3_006_A.coef(5)),
  [`${K}l3-006:q2`]: R(L3_006_B.coef(3)),
  [`${K}l3-006:q3`]: R(L3_006_B.coef(1)),
  [`${K}l3-006:q4`]: R(L3_006_B.mul(rt(3, 2).sub(1)).rat()),
  [`${K}l3-007:q1`]: R(L3_007_A.coef(3)),
  [`${K}l3-007:q2`]: R(S.of(6).div(L3_007_A).coef(3)),
  [`${K}l3-008:q1`]: R(rt(50).coef(2)),
  [`${K}l3-008:q2`]: R(L3_008_SQX.mul(L3_008_SQX).rat()),
  [`${K}l3-009:q1`]: R(L3_009_D.coef(1)),
  [`${K}l3-009:q2`]: R(L3_009_D.coef(5)),
  [`${K}l3-009:q3`]: R(L3_009_D.sub(rt(20)).rat()),
  [`${K}l3-010:q1`]: R(L3_010_SIDE.coef(3)),
  [`${K}l3-010:q2`]: R(L3_010_DIAG.coef(6)),
  // ── niveau 4
  [`${K}l4-001:q1`]: R(L4_001_A.coef(2)),
  [`${K}l4-001:q2`]: R(L4_001_B),
  [`${K}l4-002:q1`]: R(L4_002_A),
  [`${K}l4-002:q2`]: R(sci(L4_002_B)[0]),
  [`${K}l4-002:q3`]: R(sci(L4_002_B)[1]),
  [`${K}l4-002:q4`]: R(L4_002_C.coef(7)),
  [`${K}l4-003:q1`]: R(q(840).div(360)),
  [`${K}l4-003:q2`]: R(L4_003_B.coef(3)),
  [`${K}l4-004:q1`]: R(L4_004_A.coef(3)),
  [`${K}l4-004:q2`]: R(L4_004_B),
  [`${K}l4-005:q1`]: R(L4_005_A.coef(2)),
  [`${K}l4-005:q2`]: R(L4_005_A.add(L4_005_B).rat()),
  [`${K}l4-005:q3`]: R(L4_005_A.mul(L4_005_B).rat()),
  [`${K}l4-005:q4`]: R(q(L4_005_Q.coef(1)).mul(17)),
  [`${K}l4-005:q5`]: R(q(L4_005_Q.coef(2)).mul(17)),
  [`${K}l4-006:q1`]: C(sqfree(18)[1] === 18 ? 'A' : 'B'), // « b = 18 أصغر ما يمكن » est-il vrai ? (A = نعم)
  [`${K}l4-006:q2`]: R(sqfree(72)[0]),
  [`${K}l4-006:q3`]: R(sqfree(72)[1]),
  [`${K}l4-006:q4`]: R(L4_006_E.coef(2)),
  [`${K}l4-007:q1`]: R(rt(8, 3).coef(2)),
  [`${K}l4-007:q2`]: R(L4_007_D.coef(2)),
  [`${K}l4-008:q1`]: R(q(L4_008_E.coef(6)).mul(3)),
  [`${K}l4-008:q2`]: R(L4_008_E.mul(L4_008_E).rat()),
  [`${K}l4-009:q1`]: R(rt(28).coef(7)),
  [`${K}l4-009:q2`]: R(rt(63).coef(7)),
  [`${K}l4-009:q3`]: R(rt(700).coef(7)),
  [`${K}l4-009:q4`]: R(L4_009_A.coef(7)),
  [`${K}l4-009:q5`]: R(L4_009_A.div(rt(14)).coef(2)),
  [`${K}l4-010:q1`]: R(q(1).div(S.of(1).div(rt(2)).coef(2))),
  [`${K}l4-010:q2`]: R(q(1).div(S.of(1).div(rt(8)).coef(2))),
  [`${K}l4-010:q3`]: R(q(L4_010_A.coef(2)).mul(4)),
  // ── niveau 5
  [`${K}l5-001:q1`]: R(L5_001_SIDE.coef(2)),
  [`${K}l5-001:q2`]: R(L5_001_P.coef(2)),
  [`${K}l5-001:q3`]: R(L5_001_ROLLS),
  [`${K}l5-001:q4`]: R(q(L5_001_ROLLS).mul(3500)),
  [`${K}l5-002:q2`]: R(L5_002_L.coef(2)),
  [`${K}l5-002:q3`]: R(L5_002_W.coef(2)),
  [`${K}l5-002:q4`]: R(L5_002_L.add(L5_002_W).mul(2).coef(2)),
  [`${K}l5-002:q5`]: R(L5_002_D.coef(5)),
  [`${K}l5-003:q1`]: R(L5_003_SIDE.coef(2)),
  [`${K}l5-003:q3`]: R(L5_003_PMAX),
  [`${K}l5-004:q2`]: R(L5_004_L.coef(2)),
  [`${K}l5-004:q3`]: R(L5_004_W.coef(2)),
  [`${K}l5-004:q4`]: R(L5_004_L.add(L5_004_W).mul(2).coef(2)),
  [`${K}l5-004:q5`]: R(L5_004_D.coef(10)),
  [`${K}l5-005:q1`]: R(L5_005_SIDE.coef(2)),
  [`${K}l5-005:q2`]: R(L5_005_SIDE.add(rt(98)).coef(2)),
  [`${K}l5-005:q3`]: R(L5_005_RECT.rat()),
  [`${K}l5-005:q4`]: R(q(50).add(L5_005_RECT.rat()).mul(900)),
  [`${K}l5-006:q1`]: R(L5_006_SIDE.coef(3)),
  [`${K}l5-006:q2`]: R(L5_006_WALLS.coef(3)),
  [`${K}l5-006:q3`]: R(L5_006_CANS),
  [`${K}l5-006:q4`]: R(q(L5_006_CANS).mul(1350)),
  [`${K}l5-007:q1`]: R(rt(180).coef(5)),
  [`${K}l5-007:q2`]: R(rt(80).coef(5)),
  [`${K}l5-007:q3`]: R(rt(180).add(rt(80)).mul(2).coef(5)),
  [`${K}l5-007:q4`]: R(L5_007_AREA.rat()),
  [`${K}l5-007:q5`]: R(q(L5_007_AREA.rat()).mul(d('2,5')).mul(80)),
  [`${K}l5-008:q1`]: R(L5_008_AB.coef(3)),
  [`${K}l5-008:q2`]: R(L5_008_AC.coef(3)),
  [`${K}l5-008:q3`]: R(L5_008_BC.coef(3)),
  [`${K}l5-008:q4`]: R(sum(L5_008_AB, L5_008_AC, L5_008_BC).coef(3)),
  [`${K}l5-008:q5`]: R(L5_008_AREA.rat()),
  [`${K}l5-008:q6`]: R(ceil(q(L5_008_AREA.rat()).div(4))),
  [`${K}l5-009:q1`]: R(L5_009_L.coef(15)),
  [`${K}l5-009:q2`]: R(q(L5_009_W.coef(15)).mul(2)),
  [`${K}l5-009:q3`]: R(L5_009_L.add(L5_009_W).mul(2).coef(15)),
  [`${K}l5-009:q4`]: R(q(45).mul(d('1,2')).div(12)),
  [`${K}l5-010:q1`]: R(L5_010_AREA.rat()),
  [`${K}l5-010:q2`]: R(L5_010_L.add(L5_010_W).mul(2).coef(5)),
  [`${K}l5-010:q3`]: R(q(L5_010_RATIO.coef(1)).mul(2)), // (a + √5)/2 : le coefficient de √5 doit valoir 1/2
  [`${K}l5-010:q4`]: R(q(L5_010_AREA.rat()).mul(150).div(100).mul(1800)),
};

// Garde-fous : les formes imposées par l'énoncé tiennent bien (sinon la question serait mal posée).
const must = (cond, what) => { if (!cond) throw new Error(`oracle tawzif-khawass-judhur : ${what}`); };
must(L1_010_B.coef(5) === '1/2', 'l1-010 B = √5/c');
must(L3_003_B.coef(3) === '1/2' && L3_004_AB.coef(3) === '1/7', 'l3-003 / l3-004 forme √3/c');
must(L3_002_Q.coef(5) === '6/5' && L3_002_Q.coef(1) === '2', 'l3-002 C²/√5');
must(L3_006_B.coef(1) === '1' && L3_006_B.coef(3) === '2', 'l3-006 B = a√3 + b');
must(L4_003_B.mul(L4_003_C).coef(2) === '42' && L4_003_B.mul(L4_003_C).coef(1) === '0', 'l4-003 B × C = 42√2');
must(q(L4_004_A.mul(L4_004_A).rat()).div(15).sub(q(L4_004_B).mul(2)).toString() === '2', 'l4-004 A²/15 − 2B = 2');
must(q(L4_001_A.mul(L4_001_A).rat()).div(33).sub(q(L4_001_B).mul(3)).toString() === '1/3', 'l4-001 A²/33 − 3B = 1/3 (BEM 2007)');
must(L4_007_D.div(rt(6)).coef(3) === '1', 'l4-007 D/√6 = √3');
must(L4_008_E.mul(3).sub(rt(24)).terms().length === 0, 'l4-008 3E − √24 = 0');
must(L4_010_A.mul(L4_010_A).rat() === '9/8', 'l4-010 A² = 9/8');
must(L3_005_A.div(L3_005_B).coef(5) === '3/5', 'l3-005 A/B = 3√5/5');
must(L2_010_E.sub(rt(12)).rat() === '3' && sum(rt(20, 2), rt(45, -1)).coef(5) === '1', 'l2-007 / l2-010');
must(L5_003_DIAG === 18 && L5_002_L.mul(L5_002_L).rat() === '1800' && L5_004_L.mul(L5_004_L).rat() === '800', 'l5 : L² et diagonale');
must(L5_010_RATIO.coef(5) === '1/2' && L4_005_Q.coef(1) === '81/17', 'l5-010 / l4-005 formes');
must(sum(rt(117), rt(52, 3), rt(637, -1)).coef(13) === '2' && sum(rt(117), rt(52, 3), rt(637, -1)).coef(3) === '0',
  'BEM 2023 I-1 : B = 2√13 (et non a√3) — exercice non publié en official');
