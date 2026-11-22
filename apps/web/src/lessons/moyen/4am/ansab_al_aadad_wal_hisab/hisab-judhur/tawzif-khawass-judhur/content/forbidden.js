/**
 * LES NOMBRES DE LA مسألة (طاولة الفسيفساء, module 6) qu'aucun écran du labo ne montre — règle MÉCANIQUE du conseil du 2026-11-10 (unité 2,
 * leçon 5 ; LESSON_DEVELOPMENT_GUIDE, rule « forbidden values by role »). Lue par content/tilings.test.js et content/mission.test.js.
 *
 *   - jamais montrés, dans AUCUN rôle : 200, √200, 10√2, 2√50, 5√8, 100√2, 120, 12 000, 12, 10, 100, 50 (aucun contraste ne finit sur une dalle de 50) ;
 *   - 25 seulement comme k² (« n ÷ 25 »), jamais comme une aire, un leurre ni un nombre de pièces ;
 *   - 2 et √2 seulement sur 32 et 72, comme RÉSULTAT d'un pavage de l'élève (aire, côté, forme, la bonne aire de « مساحة البلاطة ») — jamais
 *     un leurre ; 2 comme nombre de dalles sur le côté (k = 2) reste permis : c'est la règle graduée, pas la pièce de la مسألة ;
 *   - la méthode « nombre de pièces = k × k, puis le prix » n'est jamais montrée (aucun nombre de pièces : k² n'apparaît que dans « n ÷ k² ») ;
 *   - le mode libre : les aires PROPOSÉES (puces) suivent la règle ; aucune n'est 200 ni 50.
 */
export const NEVER = ['200', '√200', '10√2', '2√50', '5√8', '100√2', '120', '12000', '12', '10', '100', '50'];
/** Les carrés où 2 / √2 peuvent être le résultat d'un pavage de l'élève. */
export const TWO_OK = [32, 72];
/** Ce qu'aucun leurre (« مساحة البلاطة ») ne doit proposer : passé au labo par `avoid`. */
export const AVOID = [...NEVER, '25', '2'];

/** Les violations de la règle pour ce qu'un carré n montre (`simplestShown`) — vide si l'écran est propre. */
export function violations(n, shown) {
  const bad = [];
  shown.forEach(({ role, v }) => {
    if (NEVER.includes(v)) bad.push(`${n}: ${v} (${role})`);
    if (v === '25' && role !== 'kk') bad.push(`${n}: 25 as ${role}`);
    const isTwo = v === '2' || v === '√2' || /^\d+√2$/.test(v);
    if (isTwo && role !== 'k' && role !== 'kk') {
      if (!TWO_OK.includes(n) || role === 'decoy') bad.push(`${n}: ${v} (${role})`);
    }
  });
  return bad;
}
