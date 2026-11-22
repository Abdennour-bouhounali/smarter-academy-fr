// Oracle du banc « wadiya-idmajiya-judhur » au format BEM (déploiement unité 2, 2026-10-06) — chaque réponse RECALCULÉE ici
// à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`. Les questions « بيّن أن » (selfCheck)
// n'ont pas de clé. Fusionné dans scripts/practice-answer-oracle.test.mjs APRÈS les anciennes entrées en ligne
// de l'unité 2 (même identifiants) : une clé définie ici remplace l'ancienne.
//
// Outil : un petit calcul EXACT sur les nombres r0 + r1·√k1 + r2·√k2 + … (ri rationnels, ki sans facteur
// carré), écrit ici, indépendant du code testé. Jamais de Math.sqrt : les arrondis (« المدوّر إلى 0,01 »,
// « بالزيادة إلى 1cm ») sont obtenus par racine carrée entière (BigInt) du carré exact.
import { R, C, q } from './helpers.mjs';

const ID = (lv, n) => `ex-4am-wadiya-idmajiya-judhur-l${lv}-${String(n).padStart(3, '0')}`;

/** m = a²·k avec k sans facteur carré */
function extract(m) {
  let a = 1n; let k = m;
  for (let p = 2n; p * p <= k; p += 1n) {
    while (k % (p * p) === 0n) { k /= p * p; a *= p; }
  }
  return [a, k];
}
const isqrt = (n) => {
  if (n < 0n) throw new Error('isqrt: négatif');
  if (n < 2n) return n;
  let x = n, y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x;
};

class Surd {
  constructor(terms = new Map()) { this.t = new Map([...terms].filter(([, v]) => !v.isZero())); }
  static num(v) { return new Surd(new Map([[1n, q(v)]])); }
  /** √v (v rationnel ≥ 0) : √(n/d) = √(n·d) / d */
  static sqrt(v) {
    const r = q(v);
    if (r.n < 0n) throw new Error('racine d’un négatif');
    const [a, k] = extract(r.n * r.d);
    return new Surd(new Map([[k, q(`${a}/${r.d}`)]]));
  }
  add(o) {
    o = o instanceof Surd ? o : Surd.num(o);
    const t = new Map(this.t);
    for (const [k, v] of o.t) t.set(k, (t.get(k) ?? q(0)).add(v));
    return new Surd(t);
  }
  neg() { return new Surd(new Map([...this.t].map(([k, v]) => [k, v.neg()]))); }
  sub(o) { return this.add((o instanceof Surd ? o : Surd.num(o)).neg()); }
  mul(o) {
    o = o instanceof Surd ? o : Surd.num(o);
    let out = new Surd();
    for (const [k1, v1] of this.t) for (const [k2, v2] of o.t) {
      const [a, k] = extract(k1 * k2);
      out = out.add(new Surd(new Map([[k, v1.mul(v2).mul(q(String(a)))]])));
    }
    return out;
  }
  /** division par un diviseur à UN terme c·√k (c'est « rendre le dénominateur rationnel ») */
  div(o) {
    o = o instanceof Surd ? o : Surd.num(o);
    if (o.t.size !== 1) throw new Error('diviseur à un seul terme seulement');
    const [[k, c]] = [...o.t];
    return this.mul(new Surd(new Map([[k, q(1).div(c.mul(q(String(k))))]])));
  }
  pow2() { return this.mul(this); }
  coef(k) { return (this.t.get(BigInt(k)) ?? q(0)).toString(); }
  isRational() { return [...this.t.keys()].every((k) => k === 1n); }
  rat() {
    if (!this.isRational()) throw new Error('pas rationnel');
    return this.coef(1);
  }
  /** carré exact d'un nombre à UN terme c·√k (≥ 0), en rationnel */
  sqVal() {
    if (this.t.size > 1) throw new Error('sqVal : un seul terme');
    if (this.t.size === 0) return q(0);
    const [[k, c]] = [...this.t];
    if (c.n < 0n) throw new Error('sqVal : négatif');
    return c.mul(c).mul(q(String(k)));
  }
}
const sq = (v) => Surd.sqrt(String(v).replace(',', '.'));
const num = (v) => Surd.num(String(v).replace(',', '.'));
const V = (s) => R(s.rat());
const K = (s, k) => R(s.coef(k));
const yesNo = (b) => C(b ? 'A' : 'B');
const eqS = (a, b) => a.sub(b).t.size === 0;
const pow10 = (p) => 10n ** BigInt(p);
/** ⌊x⌋ et ⌈x⌉ d'un rationnel ≥ 0 */
const floorQ = (x) => x.n / x.d;
/** x ≥ 0 à un terme : arrondi au plus proche à 10^-p (pas d'égalité possible si x irrationnel) */
function roundS(x, p) {
  const T = x.sqVal().mul(q(String(4n * pow10(2 * p))));   // (2·x·10^p)²
  const s0 = isqrt(floorQ(T));                              // ⌊2·x·10^p⌋
  const N = (s0 + 1n) / 2n;                                 // ⌊x·10^p + 1/2⌋
  return q(`${N}/${pow10(p)}`);
}
/** x ≥ 0 à un terme : arrondi par excès à 10^-p */
function ceilS(x, p) {
  const T = x.sqVal().mul(q(String(pow10(2 * p))));
  const f = floorQ(T); const s0 = isqrt(f);
  const exact = T.d === 1n && s0 * s0 === f;
  return q(`${exact ? s0 : s0 + 1n}/${pow10(p)}`);
}
/** a > b pour deux nombres positifs à un terme : comparer les carrés */
const gtS = (a, b) => { const d = a.sqVal().sub(b.sqVal()); return d.n > 0n; };
/** solutions de x² = a (a rationnel) : [−√a, √a] */
const sols = (a) => { const r = sq(a); return [r.neg(), r]; };
/** écriture décimale exacte d'un rationnel décimal (« 7.1 », « 1.5 ») */
function dec(x) {
  x = q(x); let p = 0n;
  while ((x.n * 10n ** p) % x.d !== 0n) { p += 1n; if (p > 12n) throw new Error(`dec: ${x} non décimal`); }
  const N = (x.n * 10n ** p) / x.d; const neg = N < 0n; const a = (neg ? -N : N).toString().padStart(Number(p) + 1, '0');
  const out = p === 0n ? a : `${a.slice(0, a.length - Number(p))}.${a.slice(a.length - Number(p))}`;
  return R(neg ? `-${out}` : out);
}

/* ── Niveau 1 ─────────────────────────────────────────────────────────── */
const L1_1 = sols(49);
const L1_5 = sols(20);
const L1_10 = sols(q('0.49'));                   // x² − 0,49 = 0
const L1_7c = sq(8);

/* ── Niveau 2 ─────────────────────────────────────────────────────────── */
const L2_1 = sq(45);
const L2_5a = sols(q(27).div(3));
const L2_5b = q(30).div(2);                      // 2x² − 30 = 0 ⇒ x² = 15 (√c)
const L2_3A = num(5).mul(sq(2)).mul(sq(18));
const L2_3B = sq(75).sub(sq(27)).add(sq(12));
const L2_4A = sq(98).add(sq(50)).sub(sq(32));
const L2_6A = q('3/4').add(q('5/4').mul('2/5'));
const L2_6B = num(3).mul(sq(20)).sub(num(2).mul(sq(45))).sub(sq(5));
const L2_9A = sq(2).mul(sq(2).add(3)).sub(sq(8)).add(1);
const L2_10P = num(7).add(sq(13)).mul(num(7).sub(sq(13)));
const L2_10 = sols(L2_10P.rat());

/* ── Niveau 3 ─────────────────────────────────────────────────────────── */
// BEM 2012 I-1 (officiel)
const M12 = sq(112).sub(num(3).mul(sq(28))).add(num(3).mul(sq(7))).sub(sq(25));
const N12 = sq(7).add(3).mul(num(4).sub(sq(7)));
const R12 = sq(7).sub(5).div(sq(7)).mul(7);     // (a + b√7)/7 ⇒ numérateur = 7 × valeur
// BEM 2022 I-1 (officiel)
const A22 = sq(80).add(num(2).mul(sq(125))).sub(num(3).mul(sq(20)));
const B22 = num(2).add(sq(2)).div(sq(2));
// على منوال 2012
const M3 = sq(108).sub(num(2).mul(sq(27))).add(num(3).mul(sq(3))).sub(sq(49));
const N3 = sq(3).add(2).mul(num(5).sub(sq(3)));
const R3 = M3.div(sq(3)).mul(3);
// على منوال 2022
const A4 = sq(72).add(num(3).mul(sq(50))).sub(num(2).mul(sq(98)));
const B4 = num(3).add(sq(3)).div(sq(3));
// على منوال 2017
const A5 = sq(300).sub(sq(75));
const B5 = num(5).div(num(2).mul(sq(3)));
const C5 = A5.add(2).mul(B5.mul(6).sub(2));
// على منوال 2009
const A6 = sq(63); const B6 = num(2).mul(sq(28)); const C6 = sq(7).add(2);
const R6 = C6.pow2().div(sq(7)).mul(7);          // (a√7 + b)/7
// على منوال 2019
const A7 = q('9/4').mul(q('11/3').sub(1));
const B7 = num(4).mul(sq(3)).add(num(2).mul(sq(27))).sub(sq(75));
const R7 = Surd.num(A7).div(B7);                  // = (a√3)/b irréductible
const R7c = q(R7.coef(3));
// adapted
const C1_8 = num(2).mul(sq(6));
const C2_8 = sq(q(C1_8.pow2().rat()).mul(2));   // aire double ⇒ c₂² = 2·c₁²
const A9 = sq(3).add(1).mul(sq(3).sub(1));
const B9 = num(2).mul(sq(2)).pow2().sub(sq(5).pow2());
const R9 = Surd.num(A9.rat()).div(sq(B9.rat())).mul(3);   // (a√3)/3
const P10 = sq(10).mul(4);

/* ── Niveau 4 ─────────────────────────────────────────────────────────── */
const A41 = sq(50).add(num(2).mul(sq(18))).sub(sq(72));
const B41 = q('5/3').sub(q('2/3').mul('5/4'));
const S42 = sq(72);
const C42 = sq(72).add(sq(8)).sub(num(3).mul(sq(2)));
const X43 = num(1).add(sq(2));
const AREA44 = sq(3).mul(sq(6)).div(2).mul(2);   // aire = a√2/2 ⇒ a√2 = 2 × aire
const R45 = num(3).div(sq(12));                   // = √3 / c
const A46 = q('2/3').add(q('1/3').mul('5/2'));
const B46 = q('2.4').mul('5').div('1.5');          // mantisse, puissance −3 − 4
const N46 = -3 - 4;
const C46 = sq(243).sub(sq(147)).add(num(4).mul(sq(3)));
const A47 = sq(75).sub(num(2).mul(sq(12))).add(sq(27));
const L47 = sols(A47.pow2().sub(12).rat());
const R48 = num(3).mul(sq(2)).mul(num(2).mul(sq(2)));
const S48 = sq(R48.rat());
const gcd = (a, b) => (b === 0n ? a : gcd(b, a % b));
const A49 = q('504/360');
const B49 = sq(75).add(num(2).mul(sq(48))).sub(sq(243));
const C49 = num(5).mul(sq(6)).div(sq(2));
const A410 = sq(468).add(num(2).mul(sq(325))).sub(num(3).mul(sq(117)));

/* ── Niveau 5 ─────────────────────────────────────────────────────────── */
// l5-001 : ℓ = 3/5 L, L·ℓ = 2160
const L51 = sq(q(2160).div('3/5')); const l51 = L51.mul('3/5');
const D51 = sq(L51.pow2().add(l51.pow2()).rat());
const cable51 = ceilS(D51.mul(2), 0).mul(450);
// l5-002 : carré 72, triangle rectangle isocèle d'hypoténuse BC
const BC52 = sq(72); const EB52 = sq(q(BC52.pow2().rat()).div(2));   // EB = EC ⇒ 2·EB² = BC²
const aire52 = q(72).add(EB52.pow2().div(2).rat());
// l5-003 : cerf-volant carré de diagonale 60
const S53 = q(60 * 60).div(2); const c53 = sq(S53);
const P53 = roundS(c53.mul(4), 0);                // périmètre arrondi au cm
const cost53 = S53.div(10000).mul(500).add(P53.div(100).mul(40)).add(q('1.2').mul(50));
const n53 = floorQ(q(7000).div(cost53));
// l5-004 : ℓ = 3/4 L, aire 24
const L54 = sq(q(24).div('3/4')); const l54 = L54.mul('3/4');
const P54 = L54.add(l54).mul(2); const m54 = ceilS(P54, 0);
const p54 = q(30000).sub(4500).div(m54);
// l5-005 : plancher carré 20, hauteur 3
const c55 = sq(20); const W55 = c55.mul(3).mul(4);
const litres55 = W55.div(4);
const seaux55 = ceilS(litres55.div(5), 0);
const p55 = q(16500).sub(9000).div(seaux55);
// l5-006 : carré 162
const c56 = sq(162); const AC56 = c56.mul(sq(2));
const cost56 = q(162).mul(2500).add(AC56.mul(2).mul(900).rat()).add(40000);
// l5-007 : photo 72, côté × √2, tarifs 10S et 6S + 500
const c57 = sq(72); const c57b = c57.mul(sq(2)); const S57 = c57b.pow2().rat();
const Seq57 = q(500).div(q(10).sub(6));
// l5-008 : parc carré 20000
const c58 = sq(20000); const AC58 = c58.mul(sq(2)); const path58 = c58.mul(2);
// l5-009 : diagonale 40 ⇒ 2c² = 1600
const c59 = sq(q(40 * 40).div(2));
const waste59 = q('3.14').mul(20 * 20).sub(c59.pow2().rat());
const d59 = sq(450).mul(sq(2));
// l5-010 : ℓ = 2/3 L ; aires 6 et 3
const L510a = sq(q(6).div('2/3')); const L510b = sq(q(3).div('2/3'));
const l510b = L510b.mul('2/3'); const P510 = L510b.add(l510b).mul(2);
const cost510 = ceilS(P510, 2).mul(40).mul(120);

export const ORACLE = {
  /* ── Niveau 1 ─────────────────────────────────────────────────────────── */
  [`${ID(1, 1)}:q1`]: V(L1_1[0]),
  [`${ID(1, 1)}:q2`]: V(L1_1[1]),
  [`${ID(1, 1)}:q3`]: V(L1_1[1]),
  [`${ID(1, 2)}:q1`]: dec(sq('0.36').rat()),
  [`${ID(1, 2)}:q2`]: yesNo(sq('0.36').isRational()),
  [`${ID(1, 3)}:q1`]: K(sq(5 * 5 * 2), 2),
  [`${ID(1, 3)}:q2`]: V(sq((-6) * (-6))),
  [`${ID(1, 4)}:q1`]: R(q(3).mul(2).mul(3)),
  [`${ID(1, 4)}:q2`]: K(sq(18), 2),
  [`${ID(1, 5)}:q1`]: K(L1_5[1], 5),
  [`${ID(1, 5)}:q2`]: K(L1_5[0], 5),
  [`${ID(1, 6)}:q1`]: yesNo(q('1.414213562').mul('1.414213562').toString() === '2'),
  [`${ID(1, 6)}:q2`]: dec(roundS(num(5).mul(sq(2)), 1)),
  [`${ID(1, 7)}:q1`]: V(L1_7c.pow2()),
  [`${ID(1, 7)}:q2`]: K(L1_7c.mul(4), 2),
  [`${ID(1, 8)}:q1`]: K(num(6).div(sq(3)), 3),
  [`${ID(1, 9)}:q1`]: R(q(1).add(9)),
  [`${ID(1, 9)}:q2`]: yesNo(sq(10).isRational()),
  [`${ID(1, 10)}:q1`]: dec(L1_10[0].rat()),
  [`${ID(1, 10)}:q2`]: dec(L1_10[1].rat()),

  /* ── Niveau 2 ─────────────────────────────────────────────────────────── */
  [`${ID(2, 1)}:q1`]: K(L2_1, 5),
  [`${ID(2, 1)}:q2`]: dec(roundS(L2_1, 2)),
  [`${ID(2, 2)}:q1`]: V(sq(q(18).div(2))),
  [`${ID(2, 2)}:q2`]: K(sq(q(24).div(2)), 3),
  [`${ID(2, 3)}:q1`]: V(L2_3A),
  [`${ID(2, 3)}:q2`]: K(L2_3B, 3),
  [`${ID(2, 4)}:q1`]: K(L2_4A, 2),
  [`${ID(2, 4)}:q2`]: V(L2_4A.mul(sq(2)).div(4)),
  [`${ID(2, 5)}:q1`]: V(L2_5a[0]),
  [`${ID(2, 5)}:q2`]: V(L2_5a[1]),
  [`${ID(2, 5)}:q3`]: R(L2_5b),
  [`${ID(2, 6)}:q1`]: R(L2_6A),
  [`${ID(2, 6)}:q2`]: K(L2_6B, 5),
  [`${ID(2, 7)}:q1`]: V(sq(16)),
  [`${ID(2, 7)}:q2`]: K(sq(12), 3),
  [`${ID(2, 8)}:q1`]: K(sq(5 * 5 + 5 * 5), 2),
  [`${ID(2, 8)}:q2`]: dec(roundS(sq(50), 1)),
  [`${ID(2, 9)}:q2`]: V(L2_9A.mul(num(3).sub(sq(2)))),
  [`${ID(2, 10)}:q1`]: V(L2_10P),
  [`${ID(2, 10)}:q2`]: V(L2_10[0]),
  [`${ID(2, 10)}:q3`]: V(L2_10[1]),

  /* ── Niveau 3 ─────────────────────────────────────────────────────────── */
  [`${ID(3, 1)}:q1`]: K(M12, 7),
  [`${ID(3, 1)}:q2`]: K(M12, 1),
  [`${ID(3, 1)}:q3`]: K(N12, 7),
  [`${ID(3, 1)}:q4`]: K(N12, 1),
  [`${ID(3, 1)}:q5`]: V(M12.mul(N12)),
  [`${ID(3, 1)}:q6`]: K(R12, 1),
  [`${ID(3, 1)}:q7`]: K(R12, 7),
  [`${ID(3, 2)}:q1`]: K(A22, 5),
  [`${ID(3, 2)}:q2`]: K(B22, 2),
  [`${ID(3, 2)}:q3`]: K(B22, 1),
  [`${ID(3, 2)}:q4`]: V(B22.mul(sq(2).sub(1))),
  [`${ID(3, 3)}:q1`]: K(M3, 3),
  [`${ID(3, 3)}:q2`]: K(M3, 1),
  [`${ID(3, 3)}:q3`]: K(N3, 3),
  [`${ID(3, 3)}:q4`]: K(N3, 1),
  [`${ID(3, 3)}:q5`]: V(M3.mul(N3)),
  [`${ID(3, 3)}:q6`]: K(R3, 1),
  [`${ID(3, 3)}:q7`]: K(R3, 3),
  [`${ID(3, 4)}:q1`]: K(A4, 2),
  [`${ID(3, 4)}:q2`]: K(B4, 3),
  [`${ID(3, 4)}:q3`]: K(B4, 1),
  [`${ID(3, 4)}:q4`]: V(B4.mul(sq(3).sub(1))),
  [`${ID(3, 5)}:q1`]: K(A5, 3),
  [`${ID(3, 5)}:q2`]: K(B5.mul(6), 3),          // B = a√3 / 6
  [`${ID(3, 5)}:q3`]: V(C5),
  [`${ID(3, 6)}:q1`]: K(A6.add(B6), 7),
  [`${ID(3, 6)}:q2`]: V(A6.mul(B6)),
  [`${ID(3, 6)}:q3`]: K(R6, 7),
  [`${ID(3, 6)}:q4`]: K(R6, 1),
  [`${ID(3, 7)}:q1`]: R(A7),
  [`${ID(3, 7)}:q2`]: K(B7, 3),
  [`${ID(3, 7)}:q3`]: R(R7c.n),                   // a√3/b irréductible : a = numérateur, b = dénominateur
  [`${ID(3, 7)}:q4`]: R(R7c.d),
  [`${ID(3, 8)}:q1`]: V(C1_8.pow2()),
  [`${ID(3, 8)}:q2`]: K(C2_8, 3),
  [`${ID(3, 9)}:q1`]: V(A9),
  [`${ID(3, 9)}:q2`]: V(B9),
  [`${ID(3, 9)}:q3`]: K(R9, 3),
  [`${ID(3, 10)}:q1`]: K(P10, 10),
  [`${ID(3, 10)}:q2`]: dec(roundS(P10, 2)),

  /* ── Niveau 4 ─────────────────────────────────────────────────────────── */
  [`${ID(4, 1)}:q1`]: K(A41, 2),
  [`${ID(4, 1)}:q2`]: R(B41),
  [`${ID(4, 2)}:q1`]: yesNo(extract(18n)[0] === 1n),   // 2√18 « أبسط كتابة » ⇔ 18 sans facteur carré
  [`${ID(4, 2)}:q2`]: K(S42, 2),
  [`${ID(4, 2)}:q3`]: K(C42, 2),
  [`${ID(4, 3)}:q1`]: K(X43.pow2(), 1),
  [`${ID(4, 3)}:q2`]: K(X43.pow2(), 2),
  [`${ID(4, 3)}:q4`]: V(X43.mul(num(1).sub(sq(2)))),
  [`${ID(4, 4)}:q2`]: K(AREA44, 2),
  [`${ID(4, 5)}:q1`]: yesNo(eqS(num(2).div(sq(5)), num(2).mul(sq(5)).div(5))),
  [`${ID(4, 5)}:q2`]: R(q(1).div(q(R45.coef(3)))),     // √3 / c ⇒ c = 1 / coefficient
  [`${ID(4, 6)}:q1`]: dec(A46),
  [`${ID(4, 6)}:q2`]: R(B46),
  [`${ID(4, 6)}:q3`]: R(N46),
  [`${ID(4, 6)}:q4`]: K(C46, 3),
  [`${ID(4, 7)}:q1`]: K(A47, 3),
  [`${ID(4, 7)}:q2`]: V(A47.pow2()),
  [`${ID(4, 7)}:q3`]: V(L47[0]),
  [`${ID(4, 7)}:q4`]: V(L47[1]),
  [`${ID(4, 8)}:q1`]: V(R48),
  [`${ID(4, 8)}:q2`]: K(S48, 3),
  [`${ID(4, 8)}:q3`]: C(gtS(num(3).mul(sq(2)).add(num(2).mul(sq(2))).mul(2), S48.mul(4)) ? 'A'
    : eqS(num(3).mul(sq(2)).add(num(2).mul(sq(2))).mul(2), S48.mul(4)) ? 'C' : 'B'),
  [`${ID(4, 9)}:q1`]: R(A49),
  [`${ID(4, 9)}:q2`]: K(B49, 3),
  [`${ID(4, 9)}:q3`]: V(B49.mul(C49)),
  [`${ID(4, 10)}:q1`]: R(gcd(468n, 325n)),
  [`${ID(4, 10)}:q2`]: R(q('468/325')),
  [`${ID(4, 10)}:q3`]: K(A410, 13),
  [`${ID(4, 10)}:q4`]: V(sq(q('468/325'))),

  /* ── Niveau 5 ─────────────────────────────────────────────────────────── */
  [`${ID(5, 1)}:q2`]: V(L51),
  [`${ID(5, 1)}:q3`]: V(l51),
  [`${ID(5, 1)}:q4`]: K(D51, 34),
  [`${ID(5, 1)}:q5`]: R(cable51),
  [`${ID(5, 2)}:q1`]: K(BC52, 2),
  [`${ID(5, 2)}:q3`]: V(EB52),
  [`${ID(5, 2)}:q4`]: V(EB52.pow2().div(2)),
  [`${ID(5, 2)}:q5`]: R(aire52.mul(1350)),
  [`${ID(5, 3)}:q1`]: R(S53),
  [`${ID(5, 3)}:q2`]: K(c53, 2),
  [`${ID(5, 3)}:q3`]: R(P53),
  [`${ID(5, 3)}:q4`]: R(n53),
  [`${ID(5, 4)}:q2`]: K(L54, 2),
  [`${ID(5, 4)}:q3`]: K(l54, 2),
  [`${ID(5, 4)}:q4`]: K(P54, 2),
  [`${ID(5, 4)}:q5`]: R(m54),
  [`${ID(5, 4)}:q6`]: R(p54),
  [`${ID(5, 5)}:q1`]: K(c55, 5),
  [`${ID(5, 5)}:q2`]: K(W55, 5),
  [`${ID(5, 5)}:q3`]: dec(roundS(W55, 2)),
  [`${ID(5, 5)}:q4`]: R(p55),
  [`${ID(5, 6)}:q1`]: K(c56, 2),
  [`${ID(5, 6)}:q2`]: V(AC56),
  [`${ID(5, 6)}:q3`]: yesNo(q(500000).sub(cost56).n > 0n),     // A = يربح
  [`${ID(5, 6)}:q4`]: R(q(500000).sub(cost56)),
  [`${ID(5, 7)}:q1`]: K(c57, 2),
  [`${ID(5, 7)}:q2`]: V(c57b),
  [`${ID(5, 7)}:q3`]: R(S57),
  [`${ID(5, 7)}:q4`]: R(q(S57).mul(10)),
  [`${ID(5, 7)}:q5`]: R(q(S57).mul(6).add(500)),
  [`${ID(5, 7)}:q6`]: R(Seq57),
  [`${ID(5, 7)}:q7`]: K(sq(Seq57), 5),
  [`${ID(5, 8)}:q1`]: K(c58, 2),
  [`${ID(5, 8)}:q2`]: V(AC58),
  [`${ID(5, 8)}:q3`]: K(path58, 2),
  [`${ID(5, 8)}:q4`]: C(gtS(AC58.mul(2), path58) ? 'B' : 'A'),
  [`${ID(5, 8)}:q5`]: dec(roundS(path58.div(5), 1)),
  [`${ID(5, 9)}:q2`]: K(c59, 2),
  [`${ID(5, 9)}:q3`]: dec(roundS(c59, 1)),
  [`${ID(5, 9)}:q4`]: R(waste59),
  [`${ID(5, 9)}:q5`]: V(d59),
  [`${ID(5, 10)}:q1`]: V(L510a),
  [`${ID(5, 10)}:q2`]: V(L510a.mul('2/3')),
  [`${ID(5, 10)}:q4`]: K(L510b.mul(2), 2),       // L = a√2 / 2
  [`${ID(5, 10)}:q5`]: K(l510b, 2),
  [`${ID(5, 10)}:q6`]: K(P510, 2),
  [`${ID(5, 10)}:q7`]: R(cost510),
};
