// Oracle du banc « mafhum-dawaran » (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة ») — chaque réponse construite RECALCULÉE ici à partir
// des nombres de l'énoncé, sans lire le contenu ni packages/core/arithmetic/rotation.js ni la logique du lab. Les images sur
// quadrillage sont recalculées par la rotation entière d'un quart / d'un demi-tour (formule écrite ici, `quarter`), et
// vérifiées par la distance au centre et le produit scalaire ; les angles par les opérations que l'énoncé décrit
// (fraction de tour, somme / différence de deux rotations de même centre, minutes de la grande aiguille) ; les longueurs par
// la définition (OM′ = OM) ou par le triangle équilatéral. Fusionné dans scripts/practice-answer-oracle.test.mjs.
// Les QCM sont vérifiés par l'aller-retour du validateur.
import { R, P, q } from './helpers.mjs';

const ID = (l, n, k = 1) => `ex-4am-mafhum-dawaran-l${l}-${String(n).padStart(3, '0')}:q${k}`;

/**
 * L'image de M par le دوران de centre C, d'angle `turns` quarts de tour (signé : + direct, − indirect), en entiers.
 * Écrite pour l'oracle : (a ; b) ↦ (−b ; a) pour un quart de tour direct, répétée.
 */
function quarter(M, C, turns) {
  let [a, b] = [M[0] - C[0], M[1] - C[1]];
  const n = ((turns % 4) + 4) % 4;
  for (let i = 0; i < n; i += 1) [a, b] = [-b, a];
  const img = [C[0] + a, C[1] + b];
  // contrôles : même distance au centre, et pour ±90° les deux rayons orthogonaux
  const d = (p) => (p[0] - C[0]) ** 2 + (p[1] - C[1]) ** 2;
  if (d(img) !== d(M)) throw new Error('oracle : distance au centre changée');
  if (n % 2 === 1 && (M[0] - C[0]) * (img[0] - C[0]) + (M[1] - C[1]) * (img[1] - C[1]) !== 0) throw new Error('oracle : pas un quart de tour');
  return img;
}
const PT = (M, C, turns) => { const [x, y] = quarter(M, C, turns); return P(x, y); };
/** La fraction de tour entre deux objets consécutifs régulièrement répartis (360 ÷ n), exacte. */
const share = (n) => q(360).div(n);
/** Deux rotations de même centre appliquées à un même point : l'angle entre les deux images. */
const between = (a, sa, b, sb) => (sa === sb ? Math.abs(a - b) : a + b);

export const ORACLE = {
  // ── niveau 1
  [ID(1, 7)]: PT([3, 1], [0, 0], 1),
  [ID(1, 8)]: PT([2, -3], [0, 0], 2),
  [ID(1, 9)]: R(5), // OM′ = OM
  [ID(1, 10)]: R(share(8)),
  // ── niveau 2
  [ID(2, 3)]: R(4), // OA′ = OA
  [ID(2, 5)]: PT([4, 2], [0, 0], -1),
  [ID(2, 6)]: PT([4, 2], [1, 1], 1),
  [ID(2, 7)]: R(share(60).mul(15)), // 15 minutes de la grande aiguille
  // ── niveau 3
  [ID(3, 1)]: R(between(50, 'indirect', 139, 'indirect')),
  [ID(3, 2, 2)]: R(4), // A′B′ = AB
  [ID(3, 6, 1)]: PT([2, 1], [0, 0], 1),
  [ID(3, 6, 2)]: PT([4, 1], [0, 0], 1),
  [ID(3, 6, 3)]: R((() => { const a = quarter([2, 1], [0, 0], 1); const b = quarter([4, 1], [0, 0], 1); return Math.hypot(b[0] - a[0], b[1] - a[1]); })()),
  [ID(3, 7, 1)]: PT([3, 0], [0, 0], 2),
  [ID(3, 7, 2)]: R(2), // même rayon
  [ID(3, 8)]: R(between(35, 'direct', 50, 'indirect')),
  [ID(3, 9)]: R(between(110, 'direct', 40, 'direct')),
  // ── niveau 4
  [ID(4, 3, 1)]: PT([1, 2], [0, 0], -1),
  [ID(4, 3, 2)]: PT([4, 1], [0, 0], -1),
  [ID(4, 3, 3)]: PT([2, 4], [0, 0], -1),
  [ID(4, 5)]: R(q(70).add(50)), // deux rotations successives, même centre, même sens
  [ID(4, 8)]: PT([-2, 5], [0, 0], -1), // l'antécédent : on revient d'un quart de tour indirect
  [ID(4, 9)]: PT([5, 3], [2, 1], 2),
  [ID(4, 10)]: R(6), // A′B′ = AB
  // ── niveau 5
  [ID(5, 1, 1)]: R(share(24)),
  [ID(5, 1, 2)]: R(q(75).div(share(24))),
  [ID(5, 2)]: R(share(60).mul(35)),
  [ID(5, 3)]: R(share(3)),
  [ID(5, 4, 1)]: R(12), // OB = OA
  [ID(5, 4, 2)]: R(12), // OA = OB et 60° : le triangle OAB est équilatéral
  [ID(5, 5)]: R(share(3)),
  [ID(5, 6, 1)]: R(share(5)),
  [ID(5, 6, 2)]: R(q(144).div(share(5))),
  [ID(5, 7)]: R(q(33).mul(2)), // demi-tour : VV′ = 2 × OV
  [ID(5, 8, 1)]: PT([2, 0], [1, -1], -1),
  [ID(5, 8, 2)]: PT([3, 2], [1, -1], -1),
  [ID(5, 10, 2)]: R(3), // OI′ = OI
};
