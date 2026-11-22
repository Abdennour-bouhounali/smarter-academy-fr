/**
 * LE NIVEAU À BULLE de la leçon : le labo `parallel-level` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-10, unité 9
 * leçon 2 ; conseil du 2026-11-10 — 5 conseillers, 5 revues, président ; verdict « L2 », arithmétique revérifiée par le coordinateur).
 * Un ESSAI est un appui sur « ضع الميزان » (L2.1) ; dès la manche 2 les deux pastilles AB′/AB et AC′/AC se choisissent AVANT la bulle.
 *
 *   r1  l'échelle 3 / 6 à la main (départ penché en 2 ; 5) : de niveau en (1 ; 2) → 1/3 et (2 ; 4) → 2/3. À la première planche de niveau, ses
 *       deux rapports d'un toucher (« lv ») ; aux deux planches, BÂTIR « AB′/AB = AC′/AC » (leurre CC′) puis la règle (« rule »). Pas de prédiction.
 *   r2  le tréteau 9 / 12 au rapport 1/3 du professeur (نشاط 2) : (3 ; 4) et (−3 ; −4). Prédictions (L2.4) : « même côté, mauvais rapport »
 *       (3 ; 6) → non, puis « les deux au-delà de A » (−3 ; −4) → oui. Question « side » : ce que partagent les figures 1 et 2.
 *   r3  REQUISE, le tréteau 8 / 12 LIBRE (aucun rapport imposé — L2.2) : (2 ; 3), (4 ; 6), (6 ; 9), (−2 ; −3), (−4 ; −6). La prédiction du piège
 *       « côtés opposés » (2 ; −3) → non (bonne réponse en 2e position). Questions : « beyond » (les rapports d'une planche au-delà de A sont
 *       positifs), puis « order » (quel point est entre les deux autres sur chaque droite) et la règle.
 *   ⭐  le tréteau 12 / 16 : deux planches de niveau, l'une au-delà de A et l'autre entre A et les pieds, en trois essais.
 *   libre : les paires (6 ; 9), (4 ; 8), (12 ; 18), (14 ; 21).
 *   Entraînement (« لا بأس — جرّب أصغر ») : r1 → l'échelle 2 / 4 (un seul niveau, (1 ; 2) ; but { exact: 1 } + « lv » — L2.6) ; r2 → 3 / 6 au
 *   rapport 1/3 ; r3 → 3 / 6 libre.
 * Les nombres de la مسألة (80, 100, 24, 30, 36, 44–46, 3/10, 9/20, 23/50…) ne sont montrés par AUCUN écran : content/forbidden.js (la règle, par
 * rôle) et content/planks.test.js (le balayage de `logic › shownValues` : chaque encoche, chaque rapport atteignable par le glisser, chaque pastille).
 */
const props = (extra) => ({ type: 'parallel-level', ...extra });

export const R1 = { AB: 3, AC: 6, mode: 'ladder' };
export const R1_EASY = { AB: 2, AC: 4, mode: 'ladder' };
export const R2 = { AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' };
export const R2_EASY = { AB: 3, AC: 6, ratio: '1/3', mode: 'crossing' };
export const R3 = { AB: 8, AC: 12, mode: 'crossing' };
export const R3_EASY = { AB: 3, AC: 6, mode: 'crossing' };
export const CHALLENGE = { AB: 12, AC: 16, mode: 'crossing' };
export const FREE = [[6, 9], [4, 8], [12, 18], [14, 21]];

/** Les prédictions « هل تتوسّط الفقاعة؟ » : leur position, jamais leur réponse (calculée par le labo). */
export const PREDICT = {
  r2: [{ key: 'r2-same-side', at: [3, 6] }, { key: 'r2-beyond', at: [-3, -4] }],
  r3: [{ key: 'r3-opposite', at: [2, -3] }],
};

const easyLadder = {
  goal: [{ exact: 1 }, { checkpoint: 'lv' }], helpLine: 'جرّب أوّلًا سلّمًا أقصر، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ ...R1_EASY, ratios: 'hide', chains: 'ladderEasy', lead: 'جولة تدريب: سلّم قصير، ساقاه 2 و 4.', mission: 'أين تضع طرفي اللوح ليصير أفقيًا؟' }),
};
const easyTeacher = {
  goal: [{ exact: 2 }, { exact: 1 }], helpLine: 'جرّب أوّلًا حاملًا أصغر، ثم عُد.', stars: { maxTrials: 4, predict: false },
  props: props({ ...R2_EASY, ratios: 'pick', chains: 'none', lead: 'جولة تدريب: حامل صغير، عارضتاه 3 و 6، وشرط الأستاذ: كل نسبة ثلث.', mission: 'ضع اللوح أفقيًا بين A والأرض، ثم فوق A.' }),
};
const easyFree = {
  goal: [{ exact: 2 }, { exact: 1 }, { inexact: true }], helpLine: 'جرّب أوّلًا حاملًا أصغر، ثم عُد.', stars: { maxTrials: 5, predict: false },
  props: props({ ...R3_EASY, ratios: 'pick', chains: 'none', lead: 'جولة تدريب: حامل صغير، عارضتاه 3 و 6.', mission: 'لوح أفقي بين A والأرض، ولوح أفقي فوق A، ولوح طرفاه في جهتين مختلفتين من A.' }),
};

export const M1_ROUNDS = [
  { id: 'r1', title: 'السلّم المزدوج', goal: [{ discovered: true }, { checkpoint: 'lv' }, { checkpoint: 'rule' }], stars: { maxTrials: 6, predict: false },
    easier: easyLadder, helpAfterRefusals: 3,
    props: props({ ...R1, ratios: 'hide', chains: 'ladder', lead: 'سلّم مزدوج على جدار الملعب: ساقه AB طولها 3 وساقه AC طولها 6.', mission: 'أين تضع طرفي اللوح ليصير أفقيًا؟ جد وضعين أفقيين مختلفين.' }) },
  { id: 'r2', title: 'حامل على شكل X: شرط الأستاذ', goal: [{ exact: 2 }, { exact: 1 }, { checkpoint: 'side' }], stars: { maxTrials: 5 },
    easier: easyTeacher, helpAfterRefusals: 3,
    props: props({ ...R2, ratios: 'pick', chains: 'side', predict: PREDICT.r2, lead: 'حامل على شكل X: العارضتان تستمرّان بعد A. شرط الأستاذ: كل نسبة تساوي الثلث.', mission: 'ضع اللوح أفقيًا بشرط الأستاذ مرّتين: بين A والأرض، ثم فوق A.' }) },
  { id: 'r3', title: 'الحامل الحرّ', goal: [{ exact: 2 }, { exact: 1 }, { inexact: true }, { checkpoint: 'beyond' }, { checkpoint: 'order' }], stars: { maxTrials: 6 },
    easier: easyFree, helpAfterRefusals: 3,
    props: props({ ...R3, ratios: 'pick', chains: 'cross', predict: PREDICT.r3, lead: 'حامل آخر على شكل X، بلا شرط: عارضتاه 8 و 12.', mission: 'جد لوحًا أفقيًا بين A والأرض ولوحًا أفقيًا فوق A، ثم جرّب لوحًا طرفاه في جهتين مختلفتين من A.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: الحامل الكبير', goal: [{ allExact: [1, 2] }], stars: { maxTrials: 3, predict: false },
    props: props({ ...CHALLENGE, ratios: 'pick', chains: 'none', lead: 'تحدٍّ: حامل كبير عارضتاه 12 و 16.', mission: 'لوحان أفقيان: أحدهما بين A والأرض والآخر فوق A، في ثلاث محاولات على الأكثر.' }) },
  { id: 'free', free: true, title: 'الورشة الحرّة',
    props: props({ AB: FREE[0][0], AC: FREE[0][1], mode: 'crossing', ratios: 'show', chains: 'none', checkpoints: false, choices: FREE, lead: 'الورشة الحرّة: اختر طولي العارضتين.', mission: 'ضع اللوح حيث تشاء، ثم ضع الميزان.' }) },
];
