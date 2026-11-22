/**
 * MODULE 7 « وضعية الوحدة » DANS LE LECTEUR DE MISSION (la synthèse de l'unité 3, 2026-11-12 — recette PROVISOIRE de la synthèse, point 5) :
 * UN `LabRounds` sur le labo de l'unité `pitch-expansion` (le terrain découpé), sur un terrain FRÈRE de la وضعية du bassin et du ruban — jamais
 * ses nombres ni sa solution (content/forbidden.js, recalculé et balayé par content/mission.test.js).
 *
 * Le frère : une نافورة carrée de côté 7 entourée d'un ممرّ de largeur x — le terrain « x+7+x » au carré : la zone centrale 7 × 7 est la نافورة,
 * les huit autres le ممرّ (quatre شرائط 7 × x, quatre أركان x × x). C'est le phénomène du défi 🏆 (le ruban = le grand carré − le bassin =
 * 4 bandes + 4 coins ; le côté extérieur a + 2x), sur d'autres nombres : un côté IMPAIR ne vaut jamais 10 ni 12, une aire jamais 100 ni 144.
 *
 *   r1 « ممرّ النافورة » (en AIRES, à la main) : l'élève porte les neuf zones et vérifie pour deux x (la règle saute x = 7, où trois zones de
 *      natures différentes ont la même aire) ; la suite 'ring' finit sur la construction NUMÉRIQUE, à SON x : « 121 − 49 = 4 × 14 + 4 × 4 » (x = 2 ;
 *      leurre 7, le côté de la نافورة pris pour son aire). Entraînement : la نافورة de côté 3, la construction dès le premier x juste.
 *   r2 « الممرّ بالحرف x » (en TERMES, réunion permise) : les neuf zones, les termes semblables réunis (4x² + 28x + 49), deux x vérifiés ; la suite
 *      'ringTerms' finit sur la construction « (2x + 7)² − 7² = 4x² + 28x » (leurres +49 : la نافورة gardée ; +14x : le ممرّ d'un seul côté).
 *      Entraînement : la نافورة de côté 3.
 *   free : le terrain libre (x+7+x, x+3+x, x+9+x ; x+1+x écarté : (2x + 1)² est une manche de mutatabiqat-shahira).
 * Les manches d'entraînement LIBÈRENT leur manche (`easier.releases`) : un élève bloqué ne l'est ni des étapes au crayon ni du défi 🏆.
 * Aucun terrain n'est celui d'une manche des leçons de l'unité (règle des collisions, content/mission.test.js).
 */
export const FOUNTAIN = 7;
export const FOUNTAIN_EASY = 3;
export const R1 = { expr: `x+${FOUNTAIN}+x`, span: 3, labels: 'area', start: 2 };
export const R1_EASY = { expr: `x+${FOUNTAIN_EASY}+x`, span: 3, labels: 'area', start: 2 };
export const R2 = { expr: `x+${FOUNTAIN}+x`, span: 3, labels: 'terms', start: 2 };
export const R2_EASY = { expr: `x+${FOUNTAIN_EASY}+x`, span: 3, labels: 'terms', start: 2 };
export const FREE = [`x+${FOUNTAIN}+x`, `x+${FOUNTAIN_EASY}+x`, 'x+9+x'];

const props = (extra) => ({ type: 'pitch-expansion', levels: false, ...extra });
const help = 'جرّب أوّلًا نافورة أصغر، ثم عُد.';
const LEAD_AREA = 'ساحة مربّعة: المنطقة الوسطى نافورة مربّعة ضلعها $7$ ، والمناطق الثماني حولها ممرّ عرضه $x$ من كل الجهات.';
const LEAD_TERMS = 'الساحة نفسها: نافورة ضلعها $7$ وممرّ عرضه $x$ حولها. هذه المرّة تقرأ كل منطقة بالحرف $x$ .';

export const M7_ROUNDS = [
  {
    id: 'r1', title: 'ممرّ النافورة', goal: [{ discovered: true }, { checkpoint: 'ring' }], stars: { maxTrials: 3, predict: false },
    helpAfterRefusals: 3,
    easier: {
      goal: [{ checkpoint: 'ring' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: props({ ...R1_EASY, chains: 'ringEasy', lead: 'جولة تدريب: نافورة صغيرة ضلعها $3$ وممرّ حولها.', mission: 'احمل المناطق التسع إلى «المجموع» ثم تحقّق.' }),
    },
    props: props({ ...R1, chains: 'ring', lead: LEAD_AREA, mission: 'احمل المناطق التسع إلى «المجموع» ثم تحقّق من أجل قيمتين مختلفتين: كم مساحة الممرّ؟' }),
  },
  {
    id: 'r2', title: 'الممرّ بالحرف x', goal: [{ discovered: true }, { checkpoint: 'ringExpr' }], stars: { maxTrials: 3, predict: false },
    helpAfterRefusals: 3,
    easier: {
      goal: [{ checkpoint: 'ringExpr' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: props({ ...R2_EASY, chains: 'ringTermsEasy', lead: 'جولة تدريب: نافورة ضلعها $3$ وممرّ عرضه $x$ .', mission: 'احمل المناطق التسع ثم تحقّق.' }),
    },
    props: props({ ...R2, chains: 'ringTerms', lead: LEAD_TERMS, mission: 'احمل المناطق التسع، اجمع الحدود المتشابهة، ثم تحقّق من أجل قيمتين.' }),
  },
  {
    id: 'free', free: true, title: 'الساحة الحرّة',
    props: props({ expr: FREE[0], span: 3, labels: 'terms', chains: 'none', checkpoints: false, choices: FREE, lead: 'الساحة الحرّة: اختر نافورة.', mission: 'احمل المناطق وتحقّق كما تشاء.' }),
  },
];
