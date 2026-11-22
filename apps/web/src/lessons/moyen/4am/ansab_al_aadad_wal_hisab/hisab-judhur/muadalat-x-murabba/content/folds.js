/**
 * LES DROITES QUI SE PLIENT de la leçon : le labo `square-fold` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-10,
 * unité 2 leçon 3 ; conseil du 2026-11-10 — 5 conseillers, 5 revues, président).
 *
 *   r1  x² = 4, 0, −4 à la main, graduation 1/2, le tableau des carrés dans le journal : la suite COMPLÈTE (le carré d'un toucher, la relation,
 *       le nombre de solutions), puis à la 3e signe BÂTIR « x² = a ⇔ x = √a أو x = −√a » et la règle. Prédictions « كم حلًّا ؟ » sur les
 *       cartes 1 et 2 : 2 puis 1. La flèche refusée pour −4 rebondit sur la moitié hachurée.
 *   r2  x² = −9, 0,04, 1,44, 0 (graduation 1/10) : prédictions sur les cartes 1 et 2 — 0 puis 2 —, une question d'un toucher sur elles seules.
 *   r3  x² = 3 et 2,25 (REQUISE, sans 0) : « هل تقع تدريجة على حلّ ؟ » — non puis oui ; la graduation voisine 1,7 n'est jamais acceptée, la
 *       marque exacte √3 apparaît et l'élève l'épingle ; une tuile à BÂTIR après √3.
 *   ⭐  x² = 1,21, 7, −0,5, 0 : en peu d'essais, sans tableau.
 *   libre : 9, 2, −1, 6,25, 0, −16 (les cartes SONT le choix).
 *   Les manches d'entraînement (« لا بأس — جرّب أصغر ») : graduation 1, x² = 1, 0, −1 ; pour r3 : x² = 2 et 1.
 *
 * But : `{ solvedAll: n }` (les n cartes résolues) ; r1 ajoute `{ checkpoint: 'rule' }` ; chaque question posée dans une manche est AUSSI dans
 * son but (`c<carte>` : r2 c0 et c1, r3 c0, module 2 c1) — résoudre les cartes dans un autre ordre ne gagne jamais la manche pendant que la
 * question est ouverte (revue ECC 2026-11-10). Essais (`maxTrials`) : chaque réponse (ثبّت, لا حل, la
 * marque exacte) — la PREMIÈRE graduation voisine de √a n'en est pas un ; la même réponse refusée deux fois non plus.
 * Aucun nombre de la مسألة (64 et 8, 0,09 et 0,3, 11, √11 et 3,3, 36 et 6, les points 10 / 15 / 5, les 42 élèves) ; ni 5 ni 25 dans le module 1.
 * `radius` : une droite assez courte pour que la graduation 1/10 se vise au doigt, jamais trop courte pour une carte.
 */
/** Le tableau des carrés de l'activité (x = −3/2, −1, 0, 1, 3/2, 2 — content/textbook.js › ACTIVITY.numbers.table), rempli par les positions essayées. */
export const TABLE = [-1.5, -1, 0, 1, 1.5, 2];
/** Lecteur : une mission COURTE (budget de mots du conseil) — le but et l'état final, en une phrase. */
export const MISSION = 'ثبّت كل x يصل سهمه إلى a — أو صرّح: لا حلّ.';
const props = (targets, scale, extra) => ({ type: 'square-fold', targets, scale, mission: MISSION, ...extra });
const quiet = { chains: 'none', predict: false };

export const R1 = [4, 0, -4];
export const R2 = [-9, 0.04, 1.44, 0];
export const R3 = [3, 2.25];
export const CHALLENGE = [1.21, 7, -0.5, 0];
export const FREE = [9, 2, -1, 6.25, 0, -16];
export const PRACTICE = { r1: [1, 0, -1], r2: [1, 0, -1], r3: [2, 1] };
/** Module 2 : les trois exemples de la خاصية 2 (x² = 9, 5, −1 — l'étape 2 du module parle de x² = 5). */
export const M2_EXAMPLE = [9, 5, -1];
export const M2_FREE = [1.69, 0.49, 2, -4, 0];

const practice = (targets, scale, lead, helpLine = 'جرّب أوّلًا بطاقات أصغر، ثم عُد.') => ({
  goal: [{ solvedAll: targets.length }], helpLine,
  props: props(targets, scale, { ...quiet, handDone: true, radius: 2, lead }),
});

export const M1_ROUNDS = [
  { id: 'r1', title: 'البطاقات 4 و 0 و −4', goal: [{ solvedAll: R1.length }, { checkpoint: 'rule' }], stars: { maxTrials: 6 },
    easier: practice(PRACTICE.r1, 1, 'جولة تدريب: ثلاث بطاقات أصغر، على مستقيم بالوحدات.'),
    props: props(R1, 2, { chains: 'full', predict: true, predictCards: [0, 1], predictKind: 'count', table: TABLE, radius: 3,
      lead: 'ثلاث بطاقات. حرّك x وتابع السهم: متى يصل إلى a؟' }) },
  { id: 'r2', title: 'البطاقات −9 و 0,04 و 1,44 و 0', goal: [{ solvedAll: R2.length }, { checkpoint: 'c0' }, { checkpoint: 'c1' }], stars: { maxTrials: 8 },
    easier: practice(PRACTICE.r2, 1, 'جولة تدريب: ثلاث بطاقات أصغر، على مستقيم بالوحدات.'),
    props: props(R2, 10, { chains: 'predicted', predict: true, predictCards: [0, 1], predictKind: 'count', handDone: true, radius: 3,
      lead: 'أربع بطاقات، ومستقيم مدرّج بالأعشار. توقّع، ثم جد كل الحلول.' }) },
  { id: 'r3', title: 'البطاقتان 3 و 2,25', goal: [{ solvedAll: R3.length }, { checkpoint: 'c0' }], stars: { maxTrials: 6 },
    easier: practice(PRACTICE.r3, 1, 'جولة تدريب: بطاقتان، على مستقيم بالوحدات.', 'جرّب أوّلًا مستقيمًا بالوحدات، ثم عُد.'),
    props: props(R3, 10, { chains: 'build', predict: true, predictCards: [0, 1], predictKind: 'tick', handDone: true, radius: 2,
      lead: 'بطاقتان. هل يقع كل حلّ على تدريجة؟' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: 1,21 و 7 و −0,5 و 0', goal: [{ solvedAll: CHALLENGE.length }], stars: { maxTrials: 7, predict: false },
    props: props(CHALLENGE, 10, { ...quiet, handDone: true, radius: 3, lead: 'تحدٍّ: أربع بطاقات، بأقلّ عدد من المحاولات.' }) },
  { id: 'free', free: true, title: 'المستقيم الحرّ',
    props: props(FREE, 10, { ...quiet, checkpoints: false, handDone: true, lead: 'المستقيم الحرّ: ست بطاقات. اختر بطاقة وجد حلولها.' }) },
];

export const M2_ROUNDS = [
  { id: 'r1', title: 'البطاقات 9 و 5 و −1', goal: [{ solvedAll: M2_EXAMPLE.length }, { checkpoint: 'c1' }], stars: { maxTrials: 7, predict: false },
    easier: practice(PRACTICE.r3, 1, 'جولة تدريب: بطاقتان، على مستقيم بالوحدات.', 'جرّب أوّلًا مستقيمًا بالوحدات، ثم عُد.'),
    props: props(M2_EXAMPLE, 10, { chains: 'build', predict: false, radius: 3,
      lead: 'ثلاث بطاقات جديدة. بعض الحلول لا يقع على أيّ تدريجة.' }) },
  { id: 'free', free: true, title: 'المستقيم الحرّ',
    props: props(M2_FREE, 10, { ...quiet, checkpoints: false, handDone: true, lead: 'المستقيم الحرّ: اختر بطاقة وجد حلولها.' }) },
];
