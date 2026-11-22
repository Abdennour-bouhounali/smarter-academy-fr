/**
 * L'ÉVENTAIL DES PARALLÈLES de la leçon : le labo `segment-divider` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-10,
 * unité 9 leçon 3 ; conseil du 2026-11-10 — 5 conseillers, 5 revues, président ; verdict « L3 », arithmétique revérifiée par le coordinateur).
 * Un ESSAI est une construction FINIE (parts égales) ou une règle posée (rapport) ; la même deux fois ne compte pas ; le premier refus est gratuit.
 *
 * MODULE 1 (`M1_ROUNDS`, labId `m1-divider`)
 *   r1  la banderole de 8 cm en 3 parts, à la main. Prédiction « quelle marque relier à B ? » (2, 3, 4 → 3). À la 1re construction juste, la suite
 *       « rule » : « AP₃ = ▢ × AP₁ » d'un toucher, BÂTIR « AM₁/AB = AP₁/AP₃ » (leurre P₁P₃), la règle. Pas de contraste ici (L3.4).
 *   r2  11 cm en 5 parts (L3.3). Prédictions : la marque (5, 6, 4 → 5) puis le nombre de parallèles (5, 6, 4 → 4). La suite « build » :
 *       « AM₂/AB = AP₂/AP₅ » (leurre P₂P₅) ; ET le contraste (`discovered` : une construction juste + une ratée, ou deux justes de réglages différents).
 *   r3  REQUISE : le point de rapport 2/3 (L3.2), 3 graduations par rail, même unité (L3.1). Prédictions : côtés opposés → entre A et B ; même
 *       côté → AVANT A (2 < 3). Suites « ranks » (les rangs AF et BE, puis BÂTIR « AF/BE = MA/MB », leurre AB) et « rule » (AM/AB, la règle).
 *   ⭐  le rapport 1/3 : les deux points en trois essais.
 *   libre : 3 ou 5 parts (12 cm) ; les rapports 3/2, 2/1, 1/2 (L3.7 : p > q permis).
 *   Entraînement (« لا بأس — جرّب أصغر », après 3 refus ou 2 réponses ratées) : r1 → 6 cm en 2 ; r2 → 6 cm en 3 ; r3 → le rapport 1/2, 2 graduations.
 * MODULE 2 (`M2_ROUNDS`, labId `m2-divider`)
 *   r1  le rapport 3/2 (L3.2), 3 graduations. Prédiction « même côté » → APRÈS B (3 > 2, L3.7). La suite « build ». Puis la manche libre.
 *
 * Les nombres de la مسألة (10 cm, 4/3, 3/4, 4/7, 3/7, 40/7, 30/7, 40, 30, 35 m, 650 / 600 دج…) ne sont montrés par AUCUN écran dans leur rôle :
 * content/forbidden.js (la règle, par rôle) et content/mission.test.js (le balayage de `logic › shownValues` : chaque longueur, chaque paire de
 * rangs atteignable avec son rapport et son t, chaque pastille, chaque leurre).
 */
const props = (extra) => ({ type: 'segment-divider', theme: 'tifo', ...extra });
const RATIO = { mode: 'ratio', marks: 3, sameUnitOnly: true };

export const R1 = { mode: 'equal', parts: 3, length: 8 };
export const R1_EASY = { mode: 'equal', parts: 2, length: 6 };
export const R2 = { mode: 'equal', parts: 5, length: 11 };
export const R2_EASY = { mode: 'equal', parts: 3, length: 6 };
export const R3 = { ...RATIO, p: 2, q: 3 };
export const R3_EASY = { ...RATIO, p: 1, q: 2, marks: 2 };
export const CHALLENGE = { ...RATIO, p: 1, q: 3 };
export const M2 = { ...RATIO, p: 3, q: 2 };
export const FREE = [
  { mode: 'equal', parts: 3, length: 12 }, { mode: 'equal', parts: 5, length: 12 },
  { mode: 'ratio', p: 3, q: 2, marks: 3 }, { mode: 'ratio', p: 2, q: 1, marks: 3 }, { mode: 'ratio', p: 1, q: 2, marks: 3 },
];

/** Les prédictions de chaque manche : des clés ; les options et la vérité sont calculées par le labo (`logic › predictOptions`, `predictTruth`). */
export const PREDICT = {
  r1: ['joinWhich'],
  r2: ['joinWhich', 'parallels'],
  r3: ['opposite', 'same'],
  m2: ['same'],
};

const easyTwo = {
  goal: [{ exact: 2 }], helpLine: 'جرّب أوّلًا لافتة أقصر بقطعتين، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ ...R1_EASY, chains: 'none', lead: 'جولة تدريب: لافتة قصيرة طولها 6 cm.', mission: 'قسّم اللافتة [AB] إلى قطعتين متقايستين، بالمدور والكوس فقط.' }),
};
const easyThree = {
  goal: [{ exact: 3 }], helpLine: 'جرّب أوّلًا ثلاث قطع فقط، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ ...R2_EASY, chains: 'none', lead: 'جولة تدريب: لافتة طولها 6 cm.', mission: 'قسّم اللافتة [AB] إلى ثلاث قطع متقايسة.' }),
};
const easyRatio = {
  goal: [{ allExact: [1, 2] }], helpLine: 'جرّب أوّلًا نسبة أبسط، ثم عُد.', stars: { maxTrials: 4, predict: false },
  props: props({ ...R3_EASY, chains: 'none', lead: 'جولة تدريب: مستقيمان متوازيان يشملان A و B، ودرجتان على الأكثر في كل جهة.', mission: 'جد النقطتين من المستقيم (AB) اللتين تحقّقان $\\dfrac{MA}{MB} = \\dfrac{1}{2}$ .' }),
};

export const M1_ROUNDS = [
  { id: 'r1', title: 'ثلاثة أشرطة', goal: [{ exact: 3 }, { checkpoint: 'rule' }], stars: { maxTrials: 3 },
    easier: easyTwo, helpAfterRefusals: 3,
    props: props({ ...R1, chains: 'full', predict: PREDICT.r1, lead: 'أنصار فريق الحيّ يحضّرون لافتة «تيفو» بثلاثة أشرطة متساوية. على ورقة التصميم اللافتة [AB] طولها 8 cm، ولا مسطرة مدرّجة عندهم.', mission: 'قسّم اللافتة [AB] إلى 3 قطع متقايسة، بالمدور والكوس فقط.' }) },
  { id: 'r2', title: 'خمسة أشرطة', goal: [{ exact: 5 }, { discovered: true }, { checkpoint: 'build' }], stars: { maxTrials: 3 },
    easier: easyThree, helpAfterRefusals: 3,
    props: props({ ...R2, chains: 'build', predict: PREDICT.r2, contrast: true, lead: 'لافتة أخرى طولها 11 cm، بخمسة أشرطة متساوية.', mission: 'قسّم [AB] إلى 5 قطع متقايسة. ثم أعد الإنشاء بفتحة أخرى للمدور أو بميل آخر: هل تتحرّك نقط التقسيم؟' }) },
  { id: 'r3', title: 'شريطان بنسبة', goal: [{ allExact: [1, 2] }, { checkpoint: 'ranks' }, { checkpoint: 'rule' }], stars: { maxTrials: 4 },
    easier: easyRatio, helpAfterRefusals: 3,
    props: props({ ...R3, chains: 'full', predict: PREDICT.r3, lead: 'لافتة بشريطين غير متساويين. المستقيمان (d₁) و (d₂) متوازيان ويشملان A و B: درّجهما بالمدور، ثم ضع طرفي المسطرة على علامتين.', mission: 'جد النقطة M من المستقيم (AB) حيث $\\dfrac{MA}{MB} = \\dfrac{2}{3}$ ، ثم ابحث عن نقطة ثانية تحقّق النسبة نفسها.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: الثلث', goal: [{ allExact: [1, 2] }], stars: { maxTrials: 3, predict: false },
    props: props({ ...CHALLENGE, chains: 'none', lead: 'تحدٍّ: النقطتان معًا، في ثلاث محاولات على الأكثر.', mission: 'جد النقطتين من المستقيم (AB) اللتين تحقّقان $\\dfrac{MA}{MB} = \\dfrac{1}{3}$ .' }) },
  { id: 'free', free: true, title: 'الورشة الحرّة',
    props: props({ ...FREE[0], chains: 'none', checkpoints: false, choices: FREE, lead: 'الورشة الحرّة: اختر الإنشاء الذي تريد.', mission: 'أنشئ كما تشاء: قطع متقايسة، أو نقطة بنسبة.' }) },
];

export const M2_ROUNDS = [
  { id: 'r1', title: 'نقطتان بالنسبة نفسها', goal: [{ allExact: [1, 2] }, { checkpoint: 'build' }], stars: { maxTrials: 4 },
    easier: easyRatio, helpAfterRefusals: 3,
    props: props({ ...M2, chains: 'build', predict: PREDICT.m2, lead: '(xy) مستقيم، A و B نقطتان منه. لا تتوفّر إلا مسطرة غير مدرّجة ومدور.', mission: 'جد النقطتين من المستقيم (AB) اللتين تحقّقان $\\dfrac{MA}{MB} = \\dfrac{3}{2}$ : واحدة بين A و B وأخرى خارج [AB].' }) },
  { id: 'free', free: true, title: 'الورشة الحرّة',
    props: props({ ...FREE[2], chains: 'none', checkpoints: false, choices: FREE, lead: 'الورشة الحرّة: اختر الإنشاء الذي تريد.', mission: 'أنشئ كما تشاء: قطع متقايسة، أو نقطة بنسبة.' }) },
];
