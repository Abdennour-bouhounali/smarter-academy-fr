import { AVOID } from './forbidden.js';

/**
 * MODULE 7 « وضعية الوحدة » DANS LE LECTEUR DE MISSION (la synthèse de l'unité 2, 2026-11-12 — recette PROVISOIRE de la synthèse, point 5) :
 * UN `LabRounds` sur un nombre FRÈRE de la وضعية de la زربية (un rectangle dont la longueur est le double de la largeur, l'aire connue → la largeur
 * vérifie x² = a ; la garder positive ; l'écrire sous sa forme la plus simple), jamais ses nombres ni sa solution (content/forbidden.js, recalculé et
 * balayé par content/mission.test.js).
 *
 * Le frère : un bassin de fleurs de 80 m², long du double de sa largeur → 2x² = 80 → x² = 40 → x = √40 = 2√10 ≈ 6,32 m. Il garde le piège du 🏆
 * (l'arrondi trop tôt : 2 × 632 = 1264 cm, alors que 4√10 ≈ 1265 cm) — ce piège est posé aux étapes, jamais calculé ici.
 *
 *   r1 « حوض الأزهار » (`square-fold`, la carte x² = 40, à la main) : deux solutions opposées ; la graduation voisine 6,5 n'est jamais acceptée
 *      (« 6,5² = 42,25 ≠ 40 ») — la marque exacte √40 apparaît et l'élève l'épingle, puis −√40 ; prédiction « كم حلًّا ؟ » (2) ; la suite 'build'
 *      finit sur la construction NUMÉRIQUE « x² = 40 ⇔ x = √40 أو x = −√40 » (tuile de trop : 6,5). Entraînement : x² = 14, graduation 1.
 *   r2 « بلاط الحوض » (`square-tiling`, mode simplest, avec prédictions) : le carré d'aire 40 — 2 dalles sur le côté donnent des dalles d'aire 10,
 *      3, 4, 5, 6 sont refusés ; la suite 'fullS' finit sur la construction NUMÉRIQUE « √40 = 2 × √10 » puis la règle. Entraînement : 28 (2√7).
 *   free : l'atelier des dalles, libre (28, 40, 56, 60).
 * Les manches d'entraînement LIBÈRENT leur manche (`easier.releases`) : un élève bloqué ne l'est ni des étapes au crayon ni du défi 🏆.
 * Aucune n'est un nombre d'une manche des leçons de l'unité (règle des collisions, content/mission.test.js).
 */
/** Le frère de la وضعية : l'aire du bassin, la largeur x vérifie x² = BED.a (BED.area = 2 × BED.a). */
export const BED = { area: 80, a: 40 };
export const FOLD_EASY = [14];
export const TILE_EASY = 28;
export const FREE_TILES = [28, 40, 56, 60];

const FOLD_MISSION = 'ثبّت كل x يصل سهمه إلى 40.';
const TILE_MISSION = 'كم بلاطة على كل ضلع تعطي أصغر بلاطة تصلح؟';
const help = 'جرّب أوّلًا بعدد أصغر، ثم عُد.';
const tiles = (n, extra) => ({ type: 'square-tiling', n, mode: 'simplest', mission: TILE_MISSION, avoid: AVOID, levels: false, ...extra });

export const M7_ROUNDS = [
  {
    id: 'r1', title: 'حوض الأزهار', goal: [{ solvedAll: 1 }, { checkpoint: 'c0' }], stars: { maxTrials: 4 },
    easier: {
      goal: [{ solvedAll: 1 }], helpLine: help, releases: true, stars: { maxTrials: 4, predict: false },
      props: { type: 'square-fold', targets: FOLD_EASY, scale: 1, radius: 4, levels: false, chains: 'none', predict: false, handDone: true,
        mission: 'ثبّت كل x يصل سهمه إلى 14.', lead: 'جولة تدريب: بطاقة واحدة، على مستقيم بالوحدات.' },
    },
    props: {
      type: 'square-fold', targets: [BED.a], scale: 2, radius: 7, levels: false, chains: 'build', predict: true, predictCards: [0], predictKind: 'count',
      mission: FOLD_MISSION,
      lead: `حوض أزهار مستطيل طوله ضعف عرضه ومساحته ${BED.area} مترًا مربّعًا، فمربّع عرضه يساوي ${BED.a}. حرّك x وتابع السهم: أين يصل إلى ${BED.a}؟`,
    },
  },
  {
    id: 'r2', title: 'بلاط الحوض', goal: [{ discovered: true }, { checkpoint: 'rule' }], stars: { maxTrials: 3 }, helpAfterRefusals: 3,
    easier: {
      goal: [{ discovered: true }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: tiles(TILE_EASY, { chains: 'none', predict: false, handDone: true, lead: `جولة تدريب: مربّع صغير مساحته ${TILE_EASY}.` }),
    },
    props: tiles(BED.a, {
      chains: 'fullS', predict: true, predictKind: 'smallest', predictKs: [4, 2, 3], predictAlso: [3],
      lead: `عرض الحوض هو الجذر التربيعي للعدد ${BED.a}، أي ضلع مربّع مساحته ${BED.a}. بلّطه ببلاطات مربّعة متماثلة لتجد أبسط كتابة لضلعه.`,
    }),
  },
  {
    id: 'free', free: true, title: 'الورشة الحرّة',
    props: tiles(FREE_TILES[0], { chains: 'none', predict: false, checkpoints: false, handDone: true, choices: FREE_TILES, lead: 'الورشة الحرّة: اختر مساحة وبلّطها.' }),
  },
];
