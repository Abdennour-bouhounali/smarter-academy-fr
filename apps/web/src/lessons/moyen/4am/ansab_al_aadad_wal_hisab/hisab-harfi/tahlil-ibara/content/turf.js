/**
 * LE GAZON DU TERRAIN de la leçon : le labo `turf-factoring` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-11, unité 3
 * leçon 3 ; conseil du 2026-11-11 — 5 conseillers, 5 revues, président ; verdict « L3 », arithmétique revérifiée par la logique du labo).
 * Un ESSAI est un r NOUVEAU validé (rangées) ou une répartition NOUVELLE fermée (carré) ; le même deux fois ne compte pas ; r = 1 n'est pas un
 * essai ; le premier refus de la manche est gratuit (refuser fait partie de la découverte).
 *
 * MODULE 1 (`M1_ROUNDS`, labId `lab-turf-m1`) — trois manches REQUISES (verdict L3.1, la reprise du Contradicteur) :
 *   r1  8x + 6 à la main (L3.2) : r = 1 et 2 justes, 3…8 refusés. La suite « build » au plus grand r : « في كل صفّ: ▢ » (4 ; leurres 8, 3) puis
 *       BÂTIR « 8x + 6 = ▢(▢ + ▢) » (2, 4x, 3 ; leurre 6 = le dernier terme non divisé). Pas de prédiction.
 *   r2  6x² + 2x (m = 1) — le 6x² + 4x du labo est l'exemple 1 du manuel (verdict L3 : remplacé par un ensemble PROPRE, ni 2 : 3, ni du manuel) :
 *       r = 1 et 2 justes. Prédictions : la hauteur d'une rangée (1, 2, x → x) puis le plus grand r (6, 2, 1 → 2). La suite « rule » :
 *       « ارتفاع الملعب كاملًا = ▢ » (2, x, 2x → 2x), BÂTIR « 6x² + 2x = ▢(▢ + ▢) » (2x, 3x, 1 ; leurre 2), puis LA RÈGLE (après deux
 *       ensembles différents, m = 0 puis m = 1 : L3.7) dont la bonne option donne la raison du pavage.
 *   r3  le carré x² + 6x + 9 : seul 3 | 3 ferme. Prédiction « كم شريطًا في كل جهة؟ » (3, 6, 9 → 3). La suite « rule » : le coin de SA
 *       répartition refusée, BÂTIR « x² + 6x + 9 = (▢ + ▢)² » (x, 3 ; leurre 9, L3.3), la règle des متطابقات.
 *   ⭐  x² + 8x + 16 : le carré en deux essais au plus.
 *   libre : 6x + 3, 2x² + 6x, 9x² − 6x (rangées ; les plaques rouges sont soustraites — la logique le prouve, verdict L3.9), x² + 4x + 4, x² + 9.
 *   Entraînement (« لا بأس — جرّب أصغر », après 3 refus ou 2 réponses ratées) : r1 → 4x + 2 ; r2 → 2x² + 4x ; r3 → x² + 2x + 1.
 * MODULE 2 (`M2_ROUNDS`, labId `lab-turf-m2`)
 *   r1  x² + 25, sans bande : la seule répartition (0 | 0) ne ferme jamais. Prédiction « هل يُغلق هذا الملعب؟ » (→ لا). La suite « rule » :
 *       les carreaux dehors, pourquoi, la règle. Puis la manche libre.
 *
 * La signature de la مسألة (10x² + 15x, 5x(2x + 3), PGCD(10 ; 15), « 3 rangées, un grand carré dehors »…) n'est montrée par AUCUN écran dans son
 * rôle : content/forbidden.js (la règle) et content/mission.test.js (le balayage de `logic › shownValues` de chaque manche, entraînement et choix
 * libres compris).
 */
const props = (extra) => ({ type: 'turf-factoring', levels: false, ...extra });

export const R1 = { mode: 'rows', expr: '8x+6' };
export const R1_EASY = { mode: 'rows', expr: '4x+2' };
export const R2 = { mode: 'rows', expr: '6x^2+2x' };
export const R2_EASY = { mode: 'rows', expr: '2x^2+4x' };
export const R3 = { mode: 'square', b: 6, c: 9 };
export const R3_EASY = { mode: 'square', b: 2, c: 1 };
export const CHALLENGE = { mode: 'square', b: 8, c: 16 };
export const M2 = { mode: 'square', b: 0, c: 25 };
export const FREE = [
  { mode: 'rows', expr: '6x+3' }, { mode: 'rows', expr: '2x^2+6x' }, { mode: 'rows', expr: '9x^2-6x' },
  { mode: 'square', b: 4, c: 4 }, { mode: 'square', b: 0, c: 9 },
];

/** Les prédictions de chaque manche : des clés ; les options et la vérité sont calculées par le labo (`logic › predictOptions`, `predictTruth`). */
export const PREDICT = {
  r2: ['rowHeight', 'maxRows'],
  r3: ['sideStrips'],
  m2: ['closes'],
};

const easyRows1 = {
  goal: [{ exact: 2 }, { above: 2 }], helpLine: 'جرّب أوّلًا قطعًا أقلّ، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ ...R1_EASY, chains: 'none', lead: 'جولة تدريب: قطع أقلّ.', mission: 'افرش كل القطع صفوفًا متماثلة. ما أكبر عدد من الصفوف؟' }),
};
const easyRows2 = {
  goal: [{ exact: 2 }, { above: 2 }], helpLine: 'جرّب أوّلًا مربّعين كبيرين فقط، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ ...R2_EASY, chains: 'none', lead: 'جولة تدريب: مربّعان كبيران وأربعة شرائط.', mission: 'افرشها صفوفًا متماثلة. ما أكبر عدد من الصفوف؟' }),
};
const easySquare = {
  goal: [{ exact: 1 }, { inexact: true }], helpLine: 'جرّب أوّلًا شريطين فقط، ثم عُد.', stars: { maxTrials: 3, predict: false },
  props: props({ ...R3_EASY, chains: 'none', lead: 'جولة تدريب: مربّع كبير وشريطان ومربّع صغير.', mission: 'وزّع الشريطين ثم أغلق الملعب مربّعًا.' }),
};

export const M1_ROUNDS = [
  { id: 'r1', title: 'صفّان أم ثلاثة؟', goal: [{ exact: 2 }, { above: 2 }, { checkpoint: 'build' }], stars: { maxTrials: 4, predict: false },
    easier: easyRows1, helpAfterRefusals: 3,
    props: props({ ...R1, chains: 'build', lead: 'وصلت إلى الملعب الجواري قطع عشب: شرائط ومربّعات صغيرة.', mission: 'افرشها كلّها صفوفًا متماثلة دون قطع أيّ قطعة. ما أكبر عدد من الصفوف؟' }) },
  { id: 'r2', title: 'مربّعات كبيرة وشرائط', goal: [{ exact: 2 }, { above: 2 }, { checkpoint: 'rule' }], stars: { maxTrials: 3 },
    easier: easyRows2, helpAfterRefusals: 3,
    props: props({ ...R2, chains: 'full', predict: PREDICT.r2, lead: 'قطع أخرى: مربّعات كبيرة ضلعها $x$ وشرائط، والصفّ هنا ارتفاعه $x$ .', mission: 'افرشها صفوفًا متماثلة، ثم اقرأ ارتفاع الملعب كاملًا.' }) },
  { id: 'r3', title: 'ملعب مربّع', goal: [{ exact: 3 }, { inexact: true }, { checkpoint: 'rule' }], stars: { maxTrials: 3 },
    easier: easySquare, helpAfterRefusals: 3,
    props: props({ ...R3, chains: 'full', predict: PREDICT.r3, lead: 'مربّع كبير وستّة شرائط وتسعة مربّعات صغيرة.', mission: 'وزّع الشرائط يمين المربّع وتحته، ثم أغلق الملعب.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: مربّع أكبر', goal: [{ exact: 4 }], stars: { maxTrials: 2, predict: false },
    props: props({ ...CHALLENGE, chains: 'none', lead: 'تحدٍّ: ثمانية شرائط و 16 مربّعًا صغيرًا، في محاولتين على الأكثر.', mission: 'أغلق الملعب مربّعًا.' }) },
  { id: 'free', free: true, title: 'الورشة الحرّة',
    props: props({ ...FREE[0], chains: 'none', checkpoints: false, choices: FREE, lead: 'الورشة الحرّة: اختر القطع التي تريد.', mission: 'افرش كما تشاء: صفوفًا متماثلة أو ملعبًا مربّعًا.' }) },
];

export const M2_ROUNDS = [
  { id: 'r1', title: 'بلا شرائط', goal: [{ inexact: true }, { checkpoint: 'rule' }], stars: { maxTrials: 2 },
    props: props({ ...M2, chains: 'full', predict: PREDICT.m2, lead: 'في النشاط السابق أغلقتَ ملعبًا مربّعًا بشرائطه. هنا مربّع كبير و 25 مربّعًا صغيرًا، ولا شريط.', mission: 'حاول أن تُغلق الملعب.' }) },
  { id: 'free', free: true, title: 'الورشة الحرّة',
    props: props({ ...FREE[3], chains: 'none', checkpoints: false, choices: FREE, lead: 'الورشة الحرّة: اختر القطع التي تريد.', mission: 'افرش كما تشاء: صفوفًا متماثلة أو ملعبًا مربّعًا.' }) },
];
