// Oracle du banc « kura-julla » (unité 14 « الهندسة في الفضاء ») — chaque réponse construite RECALCULÉE ici à partir des nombres de
// l'énoncé, sans lire le contenu ni packages/core/arithmetic/space.js ni la logique du lab : la distance OM² = x² + y² + z² (Pythagore
// deux fois) écrite ici, le قطر = 2R, l'aire du disque d'une دائرة كبرى (coefficient de π : R²), son périmètre (2R), l'angle d'un
// triangle équilatéral par la loi des cosinus (Math.acos), la distance du centre à une corde par Pythagore, la racine d'une équation
// x² = c (entière, vérifiée). Fusionné dans scripts/practice-answer-oracle.test.mjs ; les QCM sont vérifiés par l'aller-retour du validateur.
import { R } from './helpers.mjs';

const ID = (l, n, k = 1) => `ex-4am-kura-julla-l${l}-${String(n).padStart(3, '0')}:q${k}`;

/** OM² dans un repère orthonormé d'origine O. */
const om2 = ([x, y, z]) => x * x + y * y + z * z;
/** La racine positive ENTIÈRE de c (sinon l'oracle refuse : l'énoncé promet un nombre exact). */
function isqrt(c) {
  const r = Math.round(Math.sqrt(c));
  if (r * r !== c) throw new Error(`oracle : ${c} n'est pas un carré parfait`);
  return r;
}
/** L'angle au centre (degrés) sous lequel on voit une corde de longueur c dans une sphère de rayon r (loi des cosinus). */
const centralAngle = (r, c) => Math.round((Math.acos((2 * r * r - c * c) / (2 * r * r)) * 180) / Math.PI * 1e6) / 1e6;
/** La distance du centre au milieu d'une corde de longueur c (Pythagore dans le triangle rectangle OIA). */
const toChord = (r, c) => isqrt(r * r - (c / 2) * (c / 2));

export const ORACLE = {
  // ── niveau 1
  [ID(1, 4)]: R(2 * 12), // قطر = 2R
  [ID(1, 5)]: R(22 / 2), // R = قطر ÷ 2
  [ID(1, 7)]: R(3 * 3), // aire du disque d'une دائرة كبرى : π·R², coefficient R²
  // ── niveau 2
  [ID(2, 3)]: R(om2([2, 3, 6])),
  [ID(2, 7)]: R(2 * 2.5), // la كرة engendrée a le rayon du cercle : قطر = 2 × 2,5
  // ── niveau 3
  [ID(3, 1)]: R(centralAngle(2, 2)), // OA = OB = AB = 2 : 60°
  [ID(3, 2)]: R(om2([-3, 4, 12])),
  [ID(3, 6)]: R(2 * 0 - 5), // O milieu de [MM′] : z = 2·0 − 5
  [ID(3, 7)]: R(18 / 2),
  // ── niveau 4
  [ID(4, 1)]: R(om2([1, 4, 8])),
  [ID(4, 2)]: R(isqrt(7 * 7 - om2([0, 0, 0]))), // x² = R² et x > 0
  [ID(4, 3)]: R(isqrt(13 * 13 - om2([3, 4, 0]))), // 9 + 16 + z² = 169
  [ID(4, 4)]: R(30 / 2), // rayon de la دائرة كبرى = rayon de la sphère
  [ID(4, 6)]: R(centralAngle(10, 10)),
  // ── niveau 5
  [ID(5, 2)]: R(isqrt(om2([6, 0, 8]))),
  [ID(5, 3)]: R(2 * (32 / 2)), // périmètre 2πR : coefficient 2R
  [ID(5, 4)]: R(toChord(13, 10)),
  [ID(5, 7)]: R(isqrt((9 * 9) / om2([2, 1, 2]))), // (2a)² + a² + (2a)² = 9a² = 81
};
