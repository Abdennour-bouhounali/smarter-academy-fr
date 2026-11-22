// Oracle du banc « tayin-pgcd » (تعيين القاسم المشترك الأكبر لعددين طبيعيين), réécrit au format BEM le
// 2026-10-06 — chaque réponse RECALCULÉE ici à partir des nombres de l'énoncé, jamais lue dans `expectedAnswer`.
// À fusionner dans scripts/practice-answer-oracle.test.mjs (remplace les entrées en ligne de la leçon,
// bloc « // tayin-pgcd » : l1-001 q1/q2, l2-001 q1–q3, l3-001 q1–q3, l4-001 q1–q3, l5-001 q1, l5-002 q1 —
// les ids de questions de l5-001 et l5-002 ont changé : q1 n'y est plus « a »).
//
// Outils (indépendants du contenu) : reste par SOUSTRACTIONS successives, diviseurs par balayage complet,
// PGCD = plus grand diviseur commun de la liste (la méthode de la leçon), recoupé par Euclide (assertion) ;
// fractions exactes via q(...) ; racines a√m par recherche de k tel que r = k²·m ; prix maximaux par balayage entier.
// Les questions « بيّن أن / تحقّق / برّر » (selfCheck) n'ont pas de clé et ne figurent pas ici.
// Choix : نعم = A, لا = B ; l5-006 q6 : A = العرض 1, B = العرض 2, C = العرض 3.
import { R, C, q } from './helpers.mjs';

const ediv = (a, b) => { let qq = 0, r = a; while (r >= b) { r -= b; qq++; } return [qq, r]; };
const rem = (a, b) => ediv(a, b)[1];
const divides = (d, n) => rem(n, d) === 0;
/** n ÷ d exact — lève si d ne divise pas n */
const quo = (n, d) => { const [qq, r] = ediv(n, d); if (r !== 0) throw new Error(`${d} ne divise pas ${n}`); return qq; };
const divisors = (n) => { const out = []; for (let d = 1; d <= n; d++) if (divides(d, n)) out.push(d); return out; };
const common = (a, b) => divisors(Math.min(a, b)).filter((d) => divides(d, a) && divides(d, b));
const euclid = (a, b) => { while (b) [a, b] = [b, rem(a, b)]; return a; };
/** PGCD par حصر ; PGCD(a ; 0) = a (tout entier non nul divise 0) */
const pgcd = (a, b) => {
  if (a === 0 || b === 0) return Math.max(a, b);
  const g = Math.max(...common(a, b));
  if (g !== euclid(Math.max(a, b), Math.min(a, b))) throw new Error(`pgcd(${a}, ${b}) incohérent`);
  return g;
};
const S = (arr) => ({ value: [...arr].sort((x, y) => x - y).join(', ') });
const yn = (b) => C(b ? 'A' : 'B');
const frac = (a, b) => R(q(`${a}/${b}`).toString());
/** côté s possible pour un rectangle w × l découpé en carrés sans perte */
const side = (s, w, l) => yn(divides(s, w) && divides(s, l));
/** nombre de carrés de côté s */
const squaresOf = (w, l, s) => quo(w, s) * quo(l, s);
/** mètres (écriture décimale du sujet) → centimètres, entier exact */
const cm = (m) => Number(q(m).mul(100).toString());
/** k tel que r = k²·m — lève sinon */
const root = (r, m) => { const k2 = quo(r, m); let k = 0; while (k * k < k2) k++; if (k * k !== k2) throw new Error(`${r} ≠ k²·${m}`); return k; };
/** coefficient a de Σ c·√r = a√m */
const coef = (terms, m) => terms.reduce((s, [c, r]) => s + c * root(r, m), 0);
/** P = A ∓ (a/b)(c/d) */
const P = (A, op, a, b, c, d) => { const prod = q(`${a}/${b}`).mul(q(`${c}/${d}`)); return R((op === '-' ? q(A).sub(prod) : q(A).add(prod)).toString()); };
/** plus grand entier p de [lo ; hi] tel que ok(p) */
const maxPrice = (lo, hi, ok) => { let best = null; for (let p = lo; p <= hi; p++) if (ok(p)) best = p; if (best === null) throw new Error('aucun prix'); return best; };
/** a strictement entre lo et hi tel que PGCD(a ; n) = g — unique */
const unique = (lo, hi, n, g) => { const s = []; for (let a = lo + 1; a < hi; a++) if (pgcd(a, n) === g) s.push(a); if (s.length !== 1) throw new Error(`${s}`); return s[0]; };

/* — Niveau 3 · l3-008 : x + y = 6 ; 250x + 1000y = 3000 (balayage) — */
const box308 = []; for (let x = 0; x <= 6; x++) { const y = 6 - x; if (250 * x + 1000 * y === 3000) box308.push([x, y]); }
if (box308.length !== 1) throw new Error('l3-008 : solution unique attendue');

/* — Niveau 5 : situations recalculées — */
// l5-001 نادي الشطرنج : 15 et a (40 < a < 55), PGCD = 5 ; 5 × (1800 + 2500) ≤ 25000
const a501 = unique(40, 55, 15, 5);
// l5-002 تين وعنب : 15 et a (25 < a < 40), PGCD = 5 ; ventes − transport
const a502 = unique(25, 40, 15, 5);
const m502 = []; for (let x = 26; x < 40; x++) if (divides(5, x)) m502.push(x);
// l5-003 بطانيات 156، وسائد 104 ; 20 حزمة par voyage, 4500DA
const g503 = pgcd(156, 104);
let trips503 = 0; for (let left = g503; left > 0; left -= 20) trips503++;
// l5-004 ملعب 105m × 63m ; n·(p + 20% p) + 24000 ≤ 600000, 15000 ≤ p ≤ 60000
const g504 = pgcd(105, 63);
const n504 = quo(2 * (105 + 63), g504);
const p504 = maxPrice(15000, 60000, (p) => q(p).mul(q('12/10')).mul(n504).add(24000).sub(600000).n <= 0n);
// l5-005 كمامات 252، معقّم 84
const g505 = pgcd(252, 84);
// l5-006 تلاميذ 84 و 112 ; trois offres
const g506 = pgcd(84, 112);
const offers506 = [['A', g506 * 900], ['B', 12000 + g506 * 450], ['C', 25000]].sort((u, v) => u[1] - v[1]);
if (offers506[0][1] === offers506[1][1]) throw new Error('l5-006 : égalité');
// l5-007 مستودع 96m × 32m ; n·1,25p + 6000 ≤ 156000, 8000 ≤ p ≤ 30000
const g507 = pgcd(96, 32);
const n507 = quo(2 * (96 + 32), g507);
const p507 = maxPrice(8000, 30000, (p) => q(p).mul(q('125/100')).mul(n507).add(6000).sub(156000).n <= 0n);
// l5-008 كتب تلوين 135، علب أقلام 105
const g508 = pgcd(135, 105);
// l5-009 كرات 180، مضارب 75 ; 180·150 + 75p + 3500 ≤ 98000
const g509 = pgcd(180, 75);
const p509 = maxPrice(1, 98000, (p) => 180 * 150 + 75 * p + 3500 <= 98000);
// l5-010 120 ضمادة، 72 قارورة، 48 مقصًا : d = PGCD(120 ; 72), puis PGCD(d ; 48)
const d510 = pgcd(120, 72);
const g510 = pgcd(d510, 48);
if (!divides(d510, 48)) throw new Error('l5-010 : d doit diviser 48');

export const ORACLE = {
  /* ── Niveau 1 ── */
  // adapted — نشاط 5 : 42 و 60
  'ex-4am-tayin-pgcd-l1-001:q1': S(common(42, 60)),
  'ex-4am-tayin-pgcd-l1-001:q2': R(pgcd(42, 60)),
  // على منوال BEM 2025 — PGCD(75 ; 90)
  'ex-4am-tayin-pgcd-l1-002:q1': R(pgcd(75, 90)),
  // على منوال BEM 2009 — 720 و 180 (180 | 720)
  'ex-4am-tayin-pgcd-l1-003:q1': R(pgcd(720, 180)),
  // على منوال BEM 2008 — 36 و 54
  'ex-4am-tayin-pgcd-l1-004:q1': R(pgcd(36, 54)),
  'ex-4am-tayin-pgcd-l1-004:q2': frac(36, 54),
  // على منوال BEM 2021 — 63 و 49
  'ex-4am-tayin-pgcd-l1-005:q1': R(pgcd(63, 49)),
  // على منوال BEM 2025 — PGCD(91 ; 91), PGCD(91 ; 0)
  'ex-4am-tayin-pgcd-l1-006:q1': R(pgcd(91, 91)),
  'ex-4am-tayin-pgcd-l1-006:q2': R(pgcd(91, 0)),
  // على منوال BEM 2015 — 98 و 42
  'ex-4am-tayin-pgcd-l1-007:q1': R(pgcd(98, 42)),
  // على منوال BEM 2016 — 54 و 81
  'ex-4am-tayin-pgcd-l1-008:q1': R(pgcd(54, 81)),
  'ex-4am-tayin-pgcd-l1-008:q2': frac(81, 54),
  // على منوال BEM 2023 — A = 168/42
  'ex-4am-tayin-pgcd-l1-009:q1': R(pgcd(168, 42)),
  'ex-4am-tayin-pgcd-l1-009:q2': frac(168, 42),
  // على منوال BEM 2010 — 77 و 121
  'ex-4am-tayin-pgcd-l1-010:q1': R(pgcd(77, 121)),

  /* ── Niveau 2 ── */
  // adapted — معارف 4 : PGCD(28 ; 28), PGCD(7 ; 0), PGCD(8 ; 40)
  'ex-4am-tayin-pgcd-l2-001:q1': R(pgcd(28, 28)),
  'ex-4am-tayin-pgcd-l2-001:q2': R(pgcd(7, 0)),
  'ex-4am-tayin-pgcd-l2-001:q3': R(pgcd(8, 40)),
  // على منوال BEM 2009 — 600 = 150 × k ; PGCD(600 ; 150)
  'ex-4am-tayin-pgcd-l2-002:q1': R(quo(600, 150)),
  'ex-4am-tayin-pgcd-l2-002:q2': R(pgcd(600, 150)),
  // على منوال BEM 2010 — 60 و 36 ; كرتون 60cm × 36cm
  'ex-4am-tayin-pgcd-l2-003:q1': R(pgcd(60, 36)),
  'ex-4am-tayin-pgcd-l2-003:q2': R(pgcd(60, 36)),
  'ex-4am-tayin-pgcd-l2-003:q3': R(squaresOf(60, 36, pgcd(60, 36))),
  // على منوال BEM 2024 — ورقة 48cm × 72cm, 8cm ؟ 16cm ؟
  'ex-4am-tayin-pgcd-l2-004:q1': side(8, 48, 72),
  'ex-4am-tayin-pgcd-l2-004:q2': side(16, 48, 72),
  'ex-4am-tayin-pgcd-l2-004:q3': R(pgcd(48, 72)),
  'ex-4am-tayin-pgcd-l2-004:q4': R(squaresOf(48, 72, pgcd(48, 72))),
  // على منوال BEM 2008 — 39 و 65
  'ex-4am-tayin-pgcd-l2-005:q1': R(pgcd(39, 65)),
  'ex-4am-tayin-pgcd-l2-005:q2': frac(39, 65),
  // على منوال BEM 2016 — 85 و 51
  'ex-4am-tayin-pgcd-l2-006:q1': R(pgcd(85, 51)),
  'ex-4am-tayin-pgcd-l2-006:q2': frac(85, 51),
  // على منوال BEM 2025 — PGCD(143 ; 13) puis PGCD(13 ; 143)
  'ex-4am-tayin-pgcd-l2-007:q1': R(pgcd(143, 13)),
  'ex-4am-tayin-pgcd-l2-007:q2': R(pgcd(13, 143)),
  // على منوال BEM 2015 — 91 و 52
  'ex-4am-tayin-pgcd-l2-008:q1': R(pgcd(91, 52)),
  'ex-4am-tayin-pgcd-l2-008:q2': frac(91, 52),
  // على منوال BEM 2023 — A = 144/48
  'ex-4am-tayin-pgcd-l2-009:q1': R(pgcd(144, 48)),
  'ex-4am-tayin-pgcd-l2-009:q2': frac(144, 48),
  // على منوال BEM 2021 — قواسم 68 و 119 ثم PGCD
  'ex-4am-tayin-pgcd-l2-010:q1': S(divisors(68)),
  'ex-4am-tayin-pgcd-l2-010:q2': S(divisors(119)),
  'ex-4am-tayin-pgcd-l2-010:q3': R(pgcd(119, 68)),

  /* ── Niveau 3 ── */
  // adapted — تمرين 17
  'ex-4am-tayin-pgcd-l3-001:q1': R(pgcd(18, 36)),
  'ex-4am-tayin-pgcd-l3-001:q2': R(pgcd(27, 30)),
  'ex-4am-tayin-pgcd-l3-001:q3': R(pgcd(57, 95)),
  // على منوال BEM 2008 — 120 و 168
  'ex-4am-tayin-pgcd-l3-002:q1': R(pgcd(120, 168)),
  'ex-4am-tayin-pgcd-l3-002:q2': frac(168, 120),
  // على منوال BEM 2015 — 156 و 108 ; P = 156/108 − 2/3 × 5/6
  'ex-4am-tayin-pgcd-l3-003:q1': R(pgcd(156, 108)),
  'ex-4am-tayin-pgcd-l3-003:q2': frac(156, 108),
  'ex-4am-tayin-pgcd-l3-003:q3': P('156/108', '-', 2, 3, 5, 6),
  // على منوال BEM 2010 — 150 و 90 ; لوح 1,5m × 0,9m
  'ex-4am-tayin-pgcd-l3-004:q1': R(pgcd(150, 90)),
  'ex-4am-tayin-pgcd-l3-004:q2': R(pgcd(cm('1,5'), cm('0,9'))),
  'ex-4am-tayin-pgcd-l3-004:q3': R(squaresOf(cm('1,5'), cm('0,9'), pgcd(cm('1,5'), cm('0,9')))),
  // على منوال BEM 2016 — 176 و 99 ; A = √176 + √99 − 2√44
  'ex-4am-tayin-pgcd-l3-005:q1': R(pgcd(176, 99)),
  'ex-4am-tayin-pgcd-l3-005:q2': frac(176, 99),
  'ex-4am-tayin-pgcd-l3-005:q3': R(coef([[1, 176], [1, 99], [-2, 44]], 11)),
  // على منوال BEM 2021 — 171 و 133 ; A = √171 + √76
  'ex-4am-tayin-pgcd-l3-006:q1': R(pgcd(171, 133)),
  'ex-4am-tayin-pgcd-l3-006:q2': R(coef([[1, 171], [1, 76]], 19)),
  // على منوال BEM 2024 — زجاج 120cm × 200cm, 8cm ؟ 15cm ؟
  'ex-4am-tayin-pgcd-l3-007:q1': side(8, 120, 200),
  'ex-4am-tayin-pgcd-l3-007:q2': side(15, 120, 200),
  'ex-4am-tayin-pgcd-l3-007:q3': R(pgcd(120, 200)),
  'ex-4am-tayin-pgcd-l3-007:q4': R(squaresOf(120, 200, pgcd(120, 200))),
  // على منوال BEM 2009 — PGCD(1000 ; 250) ; علب القهوة
  'ex-4am-tayin-pgcd-l3-008:q1': R(pgcd(1000, 250)),
  'ex-4am-tayin-pgcd-l3-008:q2': R(box308[0][0]),
  'ex-4am-tayin-pgcd-l3-008:q3': R(box308[0][1]),
  // على منوال BEM 2023 — A = 270/45 ; B = √45 + √20
  'ex-4am-tayin-pgcd-l3-009:q1': R(pgcd(270, 45)),
  'ex-4am-tayin-pgcd-l3-009:q2': frac(270, 45),
  'ex-4am-tayin-pgcd-l3-009:q3': R(coef([[1, 45], [1, 20]], 5)),
  // على منوال BEM 2025 — PGCD(204 ; 85) ; منتصف [AC], A(2 ; 5), C(204 ; 85)
  'ex-4am-tayin-pgcd-l3-010:q1': R(pgcd(204, 85)),
  'ex-4am-tayin-pgcd-l3-010:q2': R(q(2 + 204).div(2).toString()),
  'ex-4am-tayin-pgcd-l3-010:q3': R(q(5 + 85).div(2).toString()),

  /* ── Niveau 4 ── */
  // adapted — تمرين 18 : 112 ، 120 ، 88
  'ex-4am-tayin-pgcd-l4-001:q1': R(pgcd(112, 120)),
  'ex-4am-tayin-pgcd-l4-001:q2': R(pgcd(120, 88)),
  'ex-4am-tayin-pgcd-l4-001:q3': R(pgcd(pgcd(112, 120), 88)),
  // على منوال BEM 2010 — 210 و 140 ; صفيحة 2,10m × 1,40m ; أطوال > 10cm
  'ex-4am-tayin-pgcd-l4-002:q1': R(pgcd(210, 140)),
  'ex-4am-tayin-pgcd-l4-002:q2': R(pgcd(cm('2,10'), cm('1,40'))),
  'ex-4am-tayin-pgcd-l4-002:q3': R(squaresOf(cm('2,10'), cm('1,40'), pgcd(cm('2,10'), cm('1,40')))),
  'ex-4am-tayin-pgcd-l4-002:q4': S(common(210, 140).filter((d) => d > 10)),
  // على منوال BEM 2015 — 234 و 156 ; P = 234/156 − 5/6 × 3/5
  'ex-4am-tayin-pgcd-l4-003:q1': R(pgcd(234, 156)),
  'ex-4am-tayin-pgcd-l4-003:q2': frac(234, 156),
  'ex-4am-tayin-pgcd-l4-003:q3': P('234/156', '-', 5, 6, 3, 5),
  // على منوال BEM 2008 — d = PGCD(96 ; 144), PGCD(d ; 240), 144/96
  'ex-4am-tayin-pgcd-l4-004:q1': R(pgcd(96, 144)),
  'ex-4am-tayin-pgcd-l4-004:q2': R(pgcd(pgcd(96, 144), 240)),
  'ex-4am-tayin-pgcd-l4-004:q3': frac(144, 96),
  // على منوال BEM 2024 — ألمنيوم 168cm × 252cm, 12cm ؟ 24cm ؟ ; carrés de 21cm
  'ex-4am-tayin-pgcd-l4-005:q1': side(12, 168, 252),
  'ex-4am-tayin-pgcd-l4-005:q2': side(24, 168, 252),
  'ex-4am-tayin-pgcd-l4-005:q3': R(pgcd(168, 252)),
  'ex-4am-tayin-pgcd-l4-005:q4': R(squaresOf(168, 252, pgcd(168, 252))),
  'ex-4am-tayin-pgcd-l4-005:q5': R(squaresOf(168, 252, 21)),
  // على منوال BEM 2016 — 117 و 52 ; A = 2√117 + √52 − √208
  'ex-4am-tayin-pgcd-l4-006:q1': R(pgcd(117, 52)),
  'ex-4am-tayin-pgcd-l4-006:q2': frac(117, 52),
  'ex-4am-tayin-pgcd-l4-006:q3': R(coef([[2, 117], [1, 52], [-1, 208]], 13)),
  // على منوال BEM 2021 — PGCD(84 ; 21) ; 30 < a < 45, PGCD(a ; 21) = 7
  'ex-4am-tayin-pgcd-l4-007:q1': R(pgcd(84, 21)),
  'ex-4am-tayin-pgcd-l4-007:q2': R(unique(30, 45, 21, 7)),
  // على منوال BEM 2023 — A = 324/108 (q3 selfCheck)
  'ex-4am-tayin-pgcd-l4-008:q1': R(pgcd(324, 108)),
  'ex-4am-tayin-pgcd-l4-008:q2': frac(324, 108),
  // على منوال BEM 2025 — PGCD(275 ; 165) ; منتصف [AC], A(5 ; 3), C(275 ; 165) (q4 selfCheck)
  'ex-4am-tayin-pgcd-l4-009:q1': R(pgcd(275, 165)),
  'ex-4am-tayin-pgcd-l4-009:q2': R(q(5 + 275).div(2).toString()),
  'ex-4am-tayin-pgcd-l4-009:q3': R(q(3 + 165).div(2).toString()),
  // على منوال BEM 2009 — d = PGCD(360 ; 135) ; PGCD(d ; 45), PGCD(d ; 180), PGCD(d ; 0)
  'ex-4am-tayin-pgcd-l4-010:q1': R(pgcd(360, 135)),
  'ex-4am-tayin-pgcd-l4-010:q2': R(pgcd(pgcd(360, 135), 45)),
  'ex-4am-tayin-pgcd-l4-010:q3': R(pgcd(pgcd(360, 135), 180)),
  'ex-4am-tayin-pgcd-l4-010:q4': R(pgcd(pgcd(360, 135), 0)),

  /* ── Niveau 5 — الوضعيات الإدماجية ── */
  // adapted — تمرين 22 : نادي الشطرنج (q2 selfCheck)
  'ex-4am-tayin-pgcd-l5-001:q1': S(divisors(15)),
  'ex-4am-tayin-pgcd-l5-001:q3': R(a501),
  'ex-4am-tayin-pgcd-l5-001:q4': R(quo(15, 5)),
  'ex-4am-tayin-pgcd-l5-001:q5': R(quo(a501, 5)),
  'ex-4am-tayin-pgcd-l5-001:q6': R(25000 - 5 * (1800 + 2500)),
  // adapted — سلسلة التفوق 5 : التين والعنب (q1 selfCheck)
  'ex-4am-tayin-pgcd-l5-002:q2': S(m502),
  'ex-4am-tayin-pgcd-l5-002:q3': R(pgcd(30, 15)),
  'ex-4am-tayin-pgcd-l5-002:q4': R(a502),
  'ex-4am-tayin-pgcd-l5-002:q5': R(quo(15, 5)),
  'ex-4am-tayin-pgcd-l5-002:q6': R(quo(a502, 5)),
  'ex-4am-tayin-pgcd-l5-002:q7': R(15 * 2400 + a502 * 1500 - 5 * 3000),
  // على منوال BEM 2022 II — قافلة أدرار
  'ex-4am-tayin-pgcd-l5-003:q1': R(g503),
  'ex-4am-tayin-pgcd-l5-003:q2': R(quo(156, g503)),
  'ex-4am-tayin-pgcd-l5-003:q3': R(quo(104, g503)),
  'ex-4am-tayin-pgcd-l5-003:q4': R(trips503 * 4500),
  // على منوال BEM 2020 II — ملعب البيض
  'ex-4am-tayin-pgcd-l5-004:q1': R(g504),
  'ex-4am-tayin-pgcd-l5-004:q2': R(n504),
  'ex-4am-tayin-pgcd-l5-004:q3': R(p504),
  // على منوال BEM 2022 II — كمامات تيارت
  'ex-4am-tayin-pgcd-l5-005:q1': R(g505),
  'ex-4am-tayin-pgcd-l5-005:q2': R(quo(252, g505)),
  'ex-4am-tayin-pgcd-l5-005:q3': R(quo(84, g505)),
  'ex-4am-tayin-pgcd-l5-005:q4': R(150000 - (252 * 450 + 84 * 380)),
  // على منوال BEM 2024 II — تخييم جرجرة
  'ex-4am-tayin-pgcd-l5-006:q1': R(g506),
  'ex-4am-tayin-pgcd-l5-006:q2': R(quo(84, g506)),
  'ex-4am-tayin-pgcd-l5-006:q3': R(quo(112, g506)),
  'ex-4am-tayin-pgcd-l5-006:q4': R(g506 * 900),
  'ex-4am-tayin-pgcd-l5-006:q5': R(12000 + g506 * 450),
  'ex-4am-tayin-pgcd-l5-006:q6': C(offers506[0][0]),
  // على منوال BEM 2020 II — كاميرات وهران
  'ex-4am-tayin-pgcd-l5-007:q1': R(g507),
  'ex-4am-tayin-pgcd-l5-007:q2': R(n507),
  'ex-4am-tayin-pgcd-l5-007:q3': R(p507),
  // على منوال BEM 2022 II — هدايا قسنطينة
  'ex-4am-tayin-pgcd-l5-008:q1': R(g508),
  'ex-4am-tayin-pgcd-l5-008:q2': R(quo(135, g508)),
  'ex-4am-tayin-pgcd-l5-008:q3': R(quo(105, g508)),
  'ex-4am-tayin-pgcd-l5-008:q4': R(60000 - (135 * 180 + 105 * 250 + g508 * 300)),
  // على منوال BEM 2021 II — تنس بجاية
  'ex-4am-tayin-pgcd-l5-009:q1': R(g509),
  'ex-4am-tayin-pgcd-l5-009:q2': R(quo(180, g509)),
  'ex-4am-tayin-pgcd-l5-009:q3': R(quo(75, g509)),
  'ex-4am-tayin-pgcd-l5-009:q4': R(p509),
  // على منوال BEM 2022 II — حقائب الإسعاف بالشلف
  'ex-4am-tayin-pgcd-l5-010:q1': R(d510),
  'ex-4am-tayin-pgcd-l5-010:q2': R(g510),
  'ex-4am-tayin-pgcd-l5-010:q3': R(quo(120, g510)),
  'ex-4am-tayin-pgcd-l5-010:q4': R(quo(72, g510)),
  'ex-4am-tayin-pgcd-l5-010:q5': R(quo(48, g510)),
  'ex-4am-tayin-pgcd-l5-010:q6': R(20000 - g510 * 650),
};
