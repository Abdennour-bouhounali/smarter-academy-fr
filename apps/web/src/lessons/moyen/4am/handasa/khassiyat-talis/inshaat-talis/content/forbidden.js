/**
 * LA SIGNATURE DE LA مسألة (module 4, « لافتة الدربي ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE du conseil du
 * 2026-11-10 (verdict « Cross-lesson » : un seul balayage par leçon, jetons PAR RÔLE, aucune liste d'exceptions, la مسألة n'est pas retouchée ;
 * LESSON_DEVELOPMENT_GUIDE, rule « forbidden values by role »). Lue par content/banner.test.js et content/mission.test.js.
 *
 *   La مسألة : la banderole [AB] de 10 cm ; MA/MB = NA/NB = 4/3 (le leurre inversé 3/4) ; AF = 4 et BE = 3 graduations ; AM/AB = 4/7 (leurres
 *   3/7, 4/3) ; AM = 40/7 ≈ 5,7 cm, MB = 30/7, le leurre 10/7 et 40/3 ; AN = 40, NB = 30, AN/AB = 4 ; « une part = 10 cm » ; la banderole réelle
 *   de 35 m → 20 m et 15 m ; les prix 650 / 600 / 13000 / 9000 / 22000 دج ; 3000 supporters.
 *   - `length` (une longueur en cm)                 : jamais 10, 40, 30, 35, 20, 15, ni 40/7, 30/7, 10/7, 40/3, 5,7 ;
 *   - `ratio` / `decoy-ratio` (un rapport MA/MB montré)   : jamais 4/3 ni 3/4 ;
 *   - `t` / `decoy-t` (une part du tout : AM/AB, AN/AB)   : jamais 4/7, 3/7, ni 4 ;
 *   - `rank` (un rang de graduation sur (d₁) / (d₂))  : jamais 4 (AF = 4) — et la paire de rangs 4 : 3 jamais ;
 *   - dans AUCUN rôle : 650, 600, 13000, 9000, 22000, 3000, 40/7, 30/7.
 *   Restent permis dans un AUTRE rôle : 4 comme NOMBRE de marques sur le rayon du partage en parts égales (`count` : la 4e marque de trop) ;
 *   30, 35, 40 comme ANGLE du rayon en degrés (`angle`) ; 3 et 4 comme longueurs d'une part (12 cm en 4 ou en 3).
 */
export const NEVER = ['650', '600', '13000', '9000', '22000', '3000', '40/7', '30/7'];
export const BAD_LENGTH = ['10', '40', '30', '35', '20', '15', '10/7', '40/3', '5,7', '5.7', '5,71', '4,29'];
export const BAD_RATIO = ['4/3', '3/4'];
export const BAD_T = ['4/7', '3/7', '4'];
export const BAD_RANK = ['4'];
export const BAD_PAIR = ['4:3'];

/** Les violations pour ce qu'un écran montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = String(x.v).replace('−', '-').replace(/^-/, '');
    if (NEVER.includes(v)) bad.push(at(x));
    if (x.role === 'length' && BAD_LENGTH.includes(v)) bad.push(at(x));
    if ((x.role === 'ratio' || x.role === 'decoy-ratio') && BAD_RATIO.includes(v)) bad.push(at(x));
    if ((x.role === 't' || x.role === 'decoy-t') && BAD_T.includes(v)) bad.push(at(x));
    if (x.role === 'rank' && BAD_RANK.includes(v)) bad.push(at(x));
    if (x.role === 'pair' && BAD_PAIR.includes(v)) bad.push(at(x));
  });
  return bad;
}
