/**
 * LA SIGNATURE DE LA مسألة (module 5, « عرض في ساحة الحيّ: لوحة في الحزمة وشاشة أبعد ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle
 * MÉCANIQUE du conseil du 2026-11-10 (verdict « Cross-lesson » : un seul balayage par leçon, jetons PAR RÔLE, aucune liste d'exceptions, la مسألة
 * n'est pas retouchée ; LESSON_DEVELOPMENT_GUIDE, rule « forbidden values by role »). Lue par content/shadows.test.js, content/mission.test.js et
 * _unit/missionStrings.test.js.
 *
 *   La مسألة : le projecteur en A, l'écran [BC] — AB = 10 m, AC = 12 m, BC = 6 m ; la planche de 3 m à AB′ = 4 m → AC′ = 4,8 et B′C′ = 2,4
 *   (k = 2/5 = 0,4) ; puis AB′ = 4,5 et AC′ = 5,6 → 54 ≠ 56, pas parallèles ; la planche de 3 m remplie à AB′ = 5 (k = 1/2) ; la toile plus
 *   loin : AD = 15, k = 3/2, DE = 9 — l'écran de 8 m est trop petit ; 180 chaises. Ses leurres : AB′/B′B (la قطعة), AB/AB′ = 2,5 (inversé),
 *   6/3 = 2, 2/3, AD − AB = 5.
 *   Et le تحدّ de la synthèse, qui doit rester entier pour elle : la minaret de 7,25 m, son ombre 11,6 m, le bâton 1,6 m, à 15:00.
 *
 * Les nombres de la مسألة sont de PETITS nombres (3, 4, 5, 6, 8, 9, 10, 12) que les données du manuel de la leçon portent dans d'AUTRES rôles
 * (AC = 4,5 du نشاط, BE = 12, AP = 10…) : ils ne sont interdits que DANS LEUR RÔLE.
 *   - dans AUCUN rôle        : 180, 54, 56, 4,8, 2,4, 5,6 ; 7,25, 11,6, 1,6 ; les heures 15:00 et 12:30 ; 3,96 (le leurre supprimé par le conseil) ;
 *   - `length` / `height` / `decoy-height` (une longueur du labo, en mètres) : jamais 10, 12, 6, 4, 4,5, 5, 15, 9, 8, 3 ;
 *   - `ratio` (un rapport montré)  : jamais 2/5, 1/2, 3/2, 2/3, 5/2, ni 0,4, 0,5, 1,5, 2,5, 2 ;
 *   - `hour`                       : jamais 15:00 ni 12:30.
 *   Restent permis dans un AUTRE rôle : 1,5 comme HAUTEUR (le lampadaire d'entraînement) et 0,5 comme pastille de hauteur — dans la مسألة ce
 *   sont des rapports ; 2 et 2,5 comme longueurs d'un point d'étape.
 */
export const NEVER = ['180', '54', '56', '4,8', '2,4', '5,6', '7,25', '11,6', '1,6', '15:00', '12:30', '3,96'];
export const BAD_LENGTH = ['10', '12', '6', '4', '4,5', '5', '15', '9', '8', '3'];
export const BAD_RATIO = ['2/5', '1/2', '3/2', '2/3', '5/2', '0,4', '0,5', '1,5', '2,5', '2'];
export const BAD_HOUR = ['15:00', '12:30'];

/** Les violations pour ce qu'un écran montre (`logic/shadowMeet › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = String(x.v).replace('.', ',');
    if (NEVER.includes(v)) bad.push(at(x));
    if (['length', 'height', 'decoy-height'].includes(x.role) && BAD_LENGTH.includes(v)) bad.push(at(x));
    if (x.role === 'ratio' && BAD_RATIO.includes(v)) bad.push(at(x));
    if (x.role === 'hour' && BAD_HOUR.includes(v)) bad.push(at(x));
  });
  return bad;
}

/**
 * La même signature pour un TEXTE (un point d'étape, une carte de connaissance, une ligne de « أستعدّ », la ورقة زميل) : les nombres qui ne sont
 * jamais permis, et les couples « lettre = valeur » de la مسألة (son rôle écrit) — pas ses petits nombres nus.
 * Le تحدّ de la synthèse (7,25 · 11,6 · 1,6 · 15:00) n'est PAS dans ce balayage de texte : le نشاط du manuel écrit AB′ = 1,6 cm, un autre rôle ;
 * le balayage par rôle des écrans du labo (`violations`) l'interdit.
 */
const never = (list) => new RegExp(`(^|[^0-9,{}.])(${list.join('|')})(?![0-9]|\\{?,\\}?[0-9])`);
export const CLIMAX_TEXT = [
  never(['180', '54', '56']),
  /(^|[^0-9])(4\{?,\}?8|5\{?,\}?6|2\{?,\}?4|0\{?,\}?4)(?![0-9])/,
  /frac\{2\}\{5\}/,
  /AB\s*=\s*10(?![0-9]|\{?,)/, /AC\s*=\s*12(?![0-9]|\{?,)/, /BC\s*=\s*6(?![0-9]|\{?,)/,
  /AB['′]\s*=\s*(4\{?,\}?5|4|5)(?![0-9]|\{?,\}?[0-9])/, /AD\s*=\s*15(?![0-9]|\{?,)/, /DE\s*=\s*9(?![0-9]|\{?,)/,
];
/** Les violations d'un texte — vide s'il est propre. */
export const textViolations = (s, label = '') => CLIMAX_TEXT.filter((re) => re.test(String(s))).map((re) => `${label}: ${re}`);
