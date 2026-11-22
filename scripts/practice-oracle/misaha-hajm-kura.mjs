// Oracle du banc « misaha-hajm-kura » (unité 14 « الهندسة في الفضاء », درس « مساحة الكرة وحجم الجلة ») — chaque réponse
// construite RECALCULÉE ici à partir des nombres de l'énoncé, sans lire le contenu, ni packages/core/arithmetic/space.js, ni la
// logique du lab : les coefficients k de kπ en rationnels EXACTS (`q`, scripts/practice-oracle/helpers.mjs) par les formules
// écrites ici (aire 4R², volume 4R³/3, cylindre R²h) ; les valeurs arrondies avec Math.PI et un arrondi au plus proche écrit
// ici (`round`, demi vers le haut). Fusionné dans scripts/practice-answer-oracle.test.mjs. Les QCM sont vérifiés par
// l'aller-retour du validateur.
import { R, q } from './helpers.mjs';

const ID = (l, n, k = 1) => `ex-4am-misaha-hajm-kura-l${l}-${String(n).padStart(3, '0')}:q${k}`;

/** Le coefficient k de l'aire 4πR² (exact). */
const areaK = (r) => q(r).mul(r).mul(4);
/** Le coefficient k du volume 4/3·πR³ (exact). */
const volK = (r) => q(r).mul(r).mul(r).mul(4).div(3);
/** Le coefficient k du volume d'un cylindre πr²h (exact). */
const cylK = (r, h) => q(r).mul(r).mul(h);
/** Un rationnel exact « a/b » → nombre (pour multiplier par π). */
const num = (x) => { const [a, b = '1'] = String(x).split('/'); return Number(a) / Number(b); };
/** Arrondi au plus proche à d décimales (demi vers le haut), écrit en chaîne avec le point. */
function round(x, d) {
  const k = 10 ** d;
  const y = Math.floor(x * k + 0.5 + 1e-9) / k;
  return y.toFixed(d);
}

export const ORACLE = {
  // ── niveau 1 : reconnaître
  [ID(1, 1)]: R(q(2).mul(2).mul(2)), // cube d'arête 2 : 2³
  [ID(1, 2)]: R(q(2).mul(3).mul(4)), // pavé 2 × 3 × 4
  [ID(1, 3)]: R(cylK(2, 2)), // cylindre r = 2, h = 2 : π·2²·2
  // ── niveau 2 : calculer
  [ID(2, 1)]: R(areaK('1.4')), // معارف 2 : 7,84
  [ID(2, 2)]: R(round(num(areaK('1.4')) * Math.PI, 2)), // 24,63 au mm²
  [ID(2, 5)]: R(areaK(5)),
  [ID(2, 6)]: R(volK(6)),
  [ID(2, 7)]: R(areaK(q(14).div(2))), // diamètre 14
  [ID(2, 8)]: R(volK(q(6).div(2))), // diamètre 6
  [ID(2, 9)]: R(round(num(volK(3)) * Math.PI, 1)),
  // ── niveau 3 : arrondir, unités, Archimède
  [ID(3, 1)]: R(round(num(volK('1.4')) * Math.PI, 3)), // معارف 2 : 11,494 au mm³
  [ID(3, 2)]: R(round(num(areaK('2.5')) * Math.PI, 2)),
  [ID(3, 3)]: R(volK('0.5')), // 1/6
  [ID(3, 4)]: R(volK(9).div(2)), // demi-boule
  [ID(3, 5)]: R(cylK(1, 1).mul(2).mul(4).mul(8)), // aire latérale du cylindre r = 4, h = 8 : 2·4·8 = 4·4²
  [ID(3, 6)]: R(q(54).mul(2).div(3)), // 2/3 du cylindre
  [ID(3, 7)]: R(round(num(volK('0.3')) * Math.PI * 1000, 0)), // m³ → L
  [ID(3, 10)]: R(volK('1.5')),
  // ── niveau 4 : inverser, comparer
  [ID(4, 1)]: R(Math.sqrt(144 / 4)),
  [ID(4, 2)]: R(Math.round(Math.cbrt((36 * 3) / 4))),
  [ID(4, 3)]: R(round(num(areaK(10).div(2)) * Math.PI, 1)), // demi-sphère
  [ID(4, 4)]: R(areaK(q('0.8').div(2))),
  [ID(4, 5)]: R(Math.floor(1000 / (num(volK(3)) * Math.PI))), // kurayat entières
  [ID(4, 6)]: R(Math.sqrt(100 / 4)),
  [ID(4, 8)]: R(round(num(volK(4)) * Math.PI, 0)),
  [ID(4, 9)]: R(round(num(areaK(11)) * Math.PI, 0)),
  // ── niveau 5 : situations
  [ID(5, 1)]: R(round(num(volK(5)) * Math.PI, 0)), // milliers de litres = m³
  [ID(5, 2)]: R(round(num(areaK(q(12).div(2))) * Math.PI, 0)),
  [ID(5, 3)]: R(round((num(cylK(2, 12)) - 3 * num(volK(2))) * Math.PI, 1)),
  [ID(5, 4)]: R(round((num(volK(15)) * Math.PI) / 1000, 1)), // cm³ → L
  [ID(5, 5)]: R(round(num(areaK(10)) * Math.PI, 0)),
  [ID(5, 6)]: R(round((num(volK(8)) / 2) * Math.PI, 0)),
  [ID(5, 7)]: R(volK(3).div(volK(1))), // 27 petites boules
  [ID(5, 8)]: R(2 * Math.round(Math.cbrt((288 * 3) / 4))), // le diamètre
  [ID(5, 9)]: R(areaK(12).sub(areaK(11))),
  [ID(5, 10)]: R(q(18).mul(3).mul(2).div(3)), // le vide = 1/3 du cylindre ; la boule = 2/3
};
