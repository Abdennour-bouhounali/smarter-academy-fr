/**
 * LE CARRÉ DALLÉ de la leçon : le labo `square-tiling` (mode product) joué en MANCHES avec étoiles dans le lecteur de mission (rollout
 * 2026-11-10, unité 2 leçon 4 ; conseil du 2026-11-10 — 5 conseillers, 5 revues, président ; arithmétique revérifiée par le coordinateur).
 *
 *   r1  27 à la main : k = 3 juste (3√3), k = 2, 4, 5 refusés. Prédictions « هل يعطي k = … بلاطًا مساحته عدد طبيعي؟ » sur k = 2 (non) et
 *       k = 3 (oui). La suite COMPLÈTE : l'aire de la dalle, le côté parmi trois, BÂTIR « √27 = 3 × √3 » (tuile de trop 9), la règle
 *       « √(k²×b) = k×√b ». But : { exact: 3 } et la règle.
 *   r2  32 : k = 2 (2√8) et k = 4 (4√2) justes — le même côté, deux noms. Prédictions k = 2 (oui), k = 3 (non). Une question à la découverte, le
 *       PONT « √(4 × 8) = √4 × … » → √8. But : { discovered: true }.
 *   r3  98 (REQUISE) : k = 7 seul juste (7√2). Prédictions k = 4 (non), k = 7 (oui). Une question : le QUOTIENT « √2 = √(98 ÷ …) » → 49.
 *       But : { exact: 7 }.
 *   ⭐  96 : k = 2 (2√24) et k = 4 (4√6). Prédictions k = 4 (oui), k = 3 (non). Une question : l'aire de la dalle. But : { discovered: true }.
 *   libre : 27, 32, 50, 75, 96, 98 (les aires SONT le choix).
 *   Entraînement (« لا بأس — جرّب أصغر », après TROIS refus dans une manche : `helpAfterRefusals`) : 8 = 2² × 2 (k = 2, 2√2) ; gagnée, elle
 *   ramène à la manche quittée.
 *
 * But : la question de la manche fait partie du but (`{ checkpoint: 'tile' }` — l'id de la suite d'une question dans le lecteur) : la manche
 * n'est jamais gagnée PENDANT que sa question est ouverte (revue ECC 2026-11-10 : le pont pouvait être sauté).
 * Essais (`maxTrials`) : chaque pavage NOUVEAU ; le PREMIER refus de la manche est gratuit (il fait partie de la découverte). Jamais un nombre de
 * dalles (k² dalles, « 16 بلاطة ») : seulement k, l'aire de la dalle et le côté. Aucune valeur que le labo AFFICHE n'est un nombre de la مسألة
 * (180, √180, 6√5, 5 comme aire, 12, √12, 2√3, 192, 8√3, 108, 45, 3√5, 18, 90, 150) ni de celle de la leçon 5 (200, 10√2) : content/tilings.test.js
 * balaie `shownValues` (logic/squareTiling.js), les MÊMES fonctions que les questions du labo. Abandonnés pour cela : 72 (→ 18), 36, 48 (→ 12),
 * 288 (→ 12, leçon 5).
 */
/** Lecteur : une mission COURTE (budget de mots du conseil) — le but et l'état final, en une phrase. */
export const MISSION = 'كم بلاطة على كل ضلع تعطي بلاطات مساحتها عدد طبيعي؟';
const props = (n, extra) => ({ type: 'square-tiling', n, mode: 'product', mission: MISSION, ...extra });
const quiet = { chains: 'none', predict: false };

export const R1 = 27;
export const R2 = 32;
export const R3 = 98;
export const CHALLENGE = 96;
export const FREE = [27, 32, 50, 75, 96, 98];
export const PRACTICE = 8;

const practice = {
  goal: [{ exact: 2 }], helpLine: 'جرّب أوّلًا مربّعًا أصغر، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props(PRACTICE, { ...quiet, handDone: true, lead: 'جولة تدريب: مربّع صغير مساحته 8.' }),
};

export const M1_ROUNDS = [
  { id: 'r1', title: 'المربّع الذي مساحته 27', goal: [{ exact: 3 }, { checkpoint: 'rule' }], stars: { maxTrials: 4 }, easier: practice, helpAfterRefusals: 3,
    props: props(R1, { chains: 'full', predict: true, predictKs: [2, 3], lead: 'مربّع مساحته 27. غيّر عدد البلاطات على الضلع.' }) },
  { id: 'r2', title: 'المربّع الذي مساحته 32', goal: [{ discovered: true }, { checkpoint: 'tile' }], stars: { maxTrials: 4 }, easier: practice, helpAfterRefusals: 3,
    props: props(R2, { chains: 'bridge', predict: true, predictKs: [2, 3], handDone: true, lead: 'مربّع مساحته 32. جد تبليطين صالحين وتبليطًا مرفوضًا.' }) },
  { id: 'r3', title: 'المربّع الذي مساحته 98', goal: [{ exact: 7 }, { checkpoint: 'tile' }], stars: { maxTrials: 5 }, easier: practice, helpAfterRefusals: 3,
    props: props(R3, { chains: 'quotient', predict: true, predictKs: [4, 7], handDone: true, lead: 'مربّع مساحته 98. هل يوجد تبليط صالح؟' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: المربّع الذي مساحته 96', goal: [{ discovered: true }, { checkpoint: 'tile' }], stars: { maxTrials: 3 },
    props: props(CHALLENGE, { chains: 'area', predict: true, predictKs: [4, 3], handDone: true, lead: 'تحدٍّ: تبليطان صالحان وتبليط مرفوض، بأقلّ عدد من المحاولات.' }) },
  { id: 'free', free: true, title: 'الورشة الحرّة',
    props: props(FREE[0], { ...quiet, checkpoints: false, handDone: true, choices: FREE, lead: 'الورشة الحرّة: اختر مساحة وبلّطها.' }) },
];
