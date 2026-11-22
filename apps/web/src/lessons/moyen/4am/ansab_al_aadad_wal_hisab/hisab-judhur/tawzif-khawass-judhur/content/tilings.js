import { AVOID } from './forbidden.js';

/**
 * LE CARRÉ DALLÉ de la leçon : le labo `square-tiling` (mode SIMPLEST) joué en MANCHES avec étoiles dans le lecteur de mission (rollout
 * 2026-11-10, unité 2 leçon 5 ; conseil du 2026-11-10 — 5 conseillers, 5 revues, président, option C ; prédictions revérifiées par le coordinateur).
 * Le labo a reçu son traitement v2 pour ses DEUX modes à la leçon 4 : ici, du contenu (et `predictAlso`, `avoid`, les suites 'buildS' / 'bestS').
 *
 *   r1  75 à la main (5√3) : un seul pavage non trivial, k = 5 ; le contraste est un k REFUSÉ au-delà (6, 7 ou 8). Prédictions « أيّ k يعطي
 *       أصغر بلاطة تصلح؟ » parmi [7, 3, 5] (5 en dernier) puis « k = 3 ؟ » (non). La suite COMPLÈTE : l'aire de la dalle du plus grand k, BÂTIR
 *       « √75 = 5 × √3 », la règle « أكبر بلاط يصلح ← بلاطة لا تُقسَم من جديد ». But : la découverte et la règle.
 *   r2  32 (4√2) — le PONT depuis la leçon 4 : le même carré, deux noms (2√8 et 4√2) → lequel est le plus simple ? Prédictions [4, 2, 5] (4 en
 *       premier) puis « k = 2 ؟ » (oui). Une question : BÂTIR « √32 = 4 × √2 » (tuiles de trop 2 et √8). But : la découverte et la question.
 *   r3  80 (4√5, REQUISE) : contraste 2√20. Prédictions [2, 6, 4] (4 en dernier) puis « k = 3 ؟ » (non). Une question : l'aire de la dalle.
 *   ⭐  72 (6√2) : contrastes 3√8 et 2√18. Prédictions [6, 8, 3] (6 en premier) puis « k = 2 ؟ » (oui). Une question : BÂTIR « √72 = 6 × √2 ».
 *   libre : 27, 32, 54, 63, 75, 80, 96 (les aires SONT le choix ; ni 45, ni 98 ; 72 seulement en défi).
 *   Entraînement (« لا بأس — جرّب أصغر », après TROIS refus : `helpAfterRefusals`) : 27 (3√3, refus 4 / 5) ; gagnée, elle ramène à la manche quittée.
 *
 * But : la question de la manche fait partie du but (`{ checkpoint: 'rule' }` pour la suite qui finit sur la règle, sinon `'tile'`). Essais : chaque
 * pavage NOUVEAU de k > 1 ; le PREMIER refus est gratuit. Jamais un nombre de dalles (k² n'apparaît que dans « n ÷ k² »). Les nombres de la مسألة
 * (طاولة الفسيفساء : 200, 10√2, 100, 50, 2√50, 5√8, 120, 12…) ne sont montrés par AUCUN écran : content/forbidden.js (la règle, par rôle) et
 * content/tilings.test.js (le balayage de `simplestShown`, les MÊMES fonctions que les questions du labo). Abandonné pour cela : 128 (k = 10 → 100).
 */
/** Lecteur : une mission COURTE — le but et l'état final, en une phrase. */
export const MISSION = 'كم بلاطة على كل ضلع تعطي أصغر بلاطة تصلح؟';
const props = (n, extra) => ({ type: 'square-tiling', n, mode: 'simplest', mission: MISSION, avoid: AVOID, ...extra });
const quiet = { chains: 'none', predict: false };
const smallest = (predictKs, also) => ({ predict: true, predictKind: 'smallest', predictKs, predictAlso: [also] });

export const R1 = 75;
export const R2 = 32;
export const R3 = 80;
export const CHALLENGE = 72;
export const FREE = [27, 32, 54, 63, 75, 80, 96];
export const PRACTICE = 27;

const practice = {
  goal: [{ discovered: true }], helpLine: 'جرّب أوّلًا مربّعًا أصغر، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props(PRACTICE, { ...quiet, handDone: true, lead: 'جولة تدريب: مربّع صغير مساحته 27.' }),
};

export const M1_ROUNDS = [
  { id: 'r1', title: 'المربّع الذي مساحته 75', goal: [{ discovered: true }, { checkpoint: 'rule' }], stars: { maxTrials: 3 }, easier: practice, helpAfterRefusals: 3,
    props: props(R1, { chains: 'fullS', ...smallest([7, 3, 5], 3), lead: 'مربّع مساحته 75. غيّر عدد البلاطات على الضلع.' }) },
  { id: 'r2', title: 'المربّع الذي مساحته 32', goal: [{ discovered: true }, { checkpoint: 'tile' }], stars: { maxTrials: 3 }, easier: practice, helpAfterRefusals: 3,
    props: props(R2, { chains: 'buildS', ...smallest([4, 2, 5], 2), handDone: true, lead: 'مربّع مساحته 32: له اسمان. أيّهما أبسط؟' }) },
  { id: 'r3', title: 'المربّع الذي مساحته 80', goal: [{ discovered: true }, { checkpoint: 'tile' }], stars: { maxTrials: 4 }, easier: practice, helpAfterRefusals: 3,
    props: props(R3, { chains: 'bestS', ...smallest([2, 6, 4], 3), handDone: true, lead: 'مربّع مساحته 80. جد أصغر بلاطة تصلح.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: المربّع الذي مساحته 72', goal: [{ discovered: true }, { checkpoint: 'tile' }], stars: { maxTrials: 3 },
    props: props(CHALLENGE, { chains: 'buildS', ...smallest([6, 8, 3], 2), handDone: true, lead: 'تحدٍّ: ثلاثة تبليطات صالحة. أيّها يعطي أصغر بلاطة؟' }) },
  { id: 'free', free: true, title: 'الورشة الحرّة',
    props: props(FREE[0], { ...quiet, checkpoints: false, handDone: true, choices: FREE, lead: 'الورشة الحرّة: اختر مساحة وبلّطها.' }) },
];
