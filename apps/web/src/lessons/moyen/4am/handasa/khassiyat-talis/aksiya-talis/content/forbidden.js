/**
 * LA SIGNATURE DE LA مسألة (module 5, « حامل الدهّانين على شكل X ») qu'aucun écran avant elle ne montre DANS SON RÔLE — règle MÉCANIQUE du
 * conseil du 2026-11-10 (verdict « Cross-lesson » : un seul balayage par leçon, jetons PAR RÔLE, aucune liste d'exceptions, la مسألة n'est pas
 * retouchée ; LESSON_DEVELOPMENT_GUIDE, rule « forbidden values by role »). Lue par content/planks.test.js et content/mission.test.js.
 *
 *   La مسألة : AB = 80, AC = 100 (les barres) ; M à 24, N à 30 ; P à 24 au-dessus de A ; E à 36, F à 46 ; les trous 44 / 45 / 46 au-dessus de
 *   A et 30 / 45 au-dessous ; les produits 2400, 3600, 3680 ; les rapports 3/10 = 0,3, 9/20 = 0,45, 23/50 = 0,46 ; la réponse AF = 45 au-dessus
 *   de A ; le bruit 25 m (le mur) et 9 kg (le poids).
 *   - `bar`      (la longueur d'une barre)        : jamais un multiple de 10, jamais 24 ; deux barres jamais dans le rapport 4 : 5 ;
 *   - `distance` (une encoche, une longueur depuis A) : jamais 24, 30, 36, 44, 45, 46, 80, 100 ;
 *   - `ratio` / `decoy` (un rapport montré)        : jamais 3/10, 9/20, 23/50, ni leurs inverses, ni 0,3 / 0,45 / 0,46 ;
 *   - dans AUCUN rôle : 2400, 3600, 3680, 80, 100, 25.
 *   9 reste permis comme LONGUEUR (la barre AB = 9 de l'activité) : dans la مسألة il est un POIDS (9 kg), un autre rôle.
 */
export const NEVER = ['2400', '3600', '3680', '80', '100', '25'];
export const BAD_DISTANCE = ['24', '30', '36', '44', '45', '46'];
export const BAD_RATIO = ['3/10', '9/20', '23/50', '10/3', '20/9', '50/23', '0,3', '0,45', '0,46', '0.3', '0.45', '0.46'];

/** Les violations pour ce qu'un écran montre (`logic › shownValues`, `{ role, v }`) — vide si l'écran est propre. */
export function violations(shown, label = '') {
  const bad = [];
  const at = (x) => `${label}: ${x.v} (${x.role})`;
  shown.forEach((x) => {
    const v = String(x.v).replace('−', '-').replace(/^-/, '');
    if (NEVER.includes(v)) bad.push(at(x));
    if (x.role === 'bar' && (Number(v) % 10 === 0 || v === '24')) bad.push(at(x));
    if (x.role === 'distance' && BAD_DISTANCE.includes(v)) bad.push(at(x));
    if ((x.role === 'ratio' || x.role === 'decoy') && BAD_RATIO.includes(v)) bad.push(at(x));
  });
  return bad;
}

/** Deux barres dans le rapport 4 : 5 (les barres 80 / 100 de la مسألة) ? */
export const fourToFive = (b, c) => b * 5 === c * 4 || c * 5 === b * 4;
