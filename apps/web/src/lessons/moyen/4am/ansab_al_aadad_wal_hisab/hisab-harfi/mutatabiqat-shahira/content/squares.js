/**
 * LES TERRAINS CARRÉS de la leçon : le labo `pitch-expansion` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-11, unité 3
 * leçon 2 ; conseil du 2026-11-11 — verdict « L2 », L2.1–L2.7 et les « added rulings », arithmétique revérifiée par content/squares.test.js). Un
 * ESSAI est un appui sur « تحقّق » ; le premier refus d'une manche est gratuit (les deux bandes qui s'allument font partie de la découverte).
 *
 *   Module 1 — LES CARRÉS (L2.5) :
 *   r1  (x + 4)² EN AIRES, réunion coupée (`labels: 'area'` : les deux bandes montrent DEUX NOMBRES JUMEAUX — « 2ab » se voit avant de s'écrire),
 *       x de 1 à 6 SANS 4 (x² = 4x = 16 : zones de natures différentes de même aire), départ 3 ; la mission invite à porter les deux carrés seuls
 *       (refus gratuit, les bandes s'allument) ; au 1er x juste « stripFill », au 2e x l'identité BÂTIE en lettres (leurre ab, les côtés deviennent
 *       a / b à l'écran) puis la règle (sa raison : les mêmes zones).
 *   r2  (x − 5)² en termes, réunion permise, x de 6 à 11, départ 9 (côté 4 — jamais le côté 3 au départ, L2.7) ; prédictions « مساحة الملعب
 *       x² − 25 ؟ » (non) puis « ce coin : coupé deux fois ? » (oui) ; au 1er x juste « cornerFill » sur ses nombres (2 fois ; +25), puis
 *       l'identité (leurre −b², L2.3) et la règle.
 *   r3  REQUISE (2x − 1)², le carré à coefficient, en NOMBRES (L2.6) : à la découverte BÂTIR 4x² − 4x + 1 (leurre 2x²).
 *   ⭐  (2x + 5)² : deux x en deux essais.   libre : six carrés.
 *   Entraînement (« لا بأس — جرّب أصغر ») : r1 → (x + 2)² en aires SANS 2 ; r2 → (x − 2)² (départ 6, côté 4) ; r3 → (2x + 1)². Chacun LIBÈRE sa manche (`releases`).
 *   Module 2 — SOMME × DIFFÉRENCE :
 *   m2  (x + 4)(x − 4), x de 5 à 10, départ 7 ; prédiction « يبقى حدّ فيه x ؟ » (non) ; la réunion de +4x et −4x laisse « 0 » (L2.4, la coupe) ;
 *       au 1er x juste « cancelFill », puis l'identité (leurre +b²) et la règle. Entraînement (x + 2)(x − 2). ⭐ (3x + 4)(3x − 4). libre.
 * Les nombres de la مسألة (27, 729, 720, 711, 171, 900, 180 ; x = 30 ; x − 3 ; ±6x ; la constante ±9…) ne sont montrés par AUCUN écran dans leur
 * rôle : content/forbidden.js (la règle, par rôle) et content/squares.test.js (le balayage de `logic › shownValues`).
 */
const props = (extra) => ({ type: 'pitch-expansion', ...extra });

export const R1 = { expr: 'x+4', span: 5, labels: 'area', start: 3 };
export const R1_EASY = { expr: 'x+2', span: 5, labels: 'area' };
export const R2 = { expr: 'x-5', span: 5, labels: 'terms', start: 9 };
export const R2_EASY = { expr: 'x-2', span: 5, labels: 'terms', start: 6 };
export const R3 = { expr: '2x-1', span: 5, labels: 'terms', start: 3 };
export const R3_EASY = { expr: '2x+1', span: 5, labels: 'terms' };
export const CHALLENGE = { expr: '2x+5', span: 5, labels: 'terms' };
export const FREE = ['x+4', 'x-5', '2x-1', '2x+5', 'x+7', 'x-2'];
export const M2 = { expr: 'x+4|x-4', span: 5, labels: 'terms', start: 7 };
export const M2_EASY = { expr: 'x+2|x-2', span: 5, labels: 'terms' };
export const M2_CHALLENGE = { expr: '3x+4|3x-4', span: 5, labels: 'terms' };
export const FREE_M2 = ['x+4|x-4', '2x+1|2x-1', 'x+7|x-7', '3x+4|3x-4'];

/** Les prédictions : leur NATURE (et l'affirmation à juger), jamais leur réponse (calculée par le labo). */
export const PREDICT = {
  r2: [{ key: 'r2-claim', kind: 'claim', claim: 'x^2-25' }, { key: 'r2-twice', kind: 'twice' }],
  m2: [{ key: 'm2-nox', kind: 'noX' }],
};

const help = 'جرّب أوّلًا ملعبًا أصغر، ثم عُد.';
const free = (choices) => ({
  id: 'free', free: true, title: 'الورشة الحرّة',
  props: props({ expr: choices[0], span: 5, labels: 'terms', chains: 'none', checkpoints: false, choices, lead: 'الورشة الحرّة: اختر ملعبًا.', mission: 'احمل المناطق، اجمع المتشابه، وتحقّق كما تشاء.' }),
});

export const M1_ROUNDS = [
  { id: 'r1', title: 'ملعب مربّع يكبر', goal: [{ discovered: true }, { checkpoint: 'strips' }, { checkpoint: 'rule' }], stars: { maxTrials: 4, predict: false },
    helpAfterRefusals: 3,
    easier: { goal: [{ checkpoint: 'strips' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: props({ ...R1_EASY, chains: 'squareEasy', lead: 'جولة تدريب: ملعب مربّع ضلعه $x + 2$ .', mission: 'احمل المناطق إلى «المجموع» ثم تحقّق.' }) },
    props: props({ ...R1, chains: 'square', lead: 'ملعب مربّع ضلعه $x + 4$ : كلّما كبر $x$ كبر الملعب.', mission: 'احمل المربّعين وحدهما وتحقّق: هل يكفيان؟ ثم أكمل، وتحقّق من أجل قيمتين مختلفتين.' }) },
  { id: 'r2', title: 'ملعب مربّع يُقتطع منه شريطان', goal: [{ discovered: true }, { checkpoint: 'cornerFill' }, { checkpoint: 'rule' }], stars: { maxTrials: 4 },
    helpAfterRefusals: 3,
    easier: { goal: [{ checkpoint: 'cornerFill' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: props({ ...R2_EASY, chains: 'squareDiffEasy', lead: 'جولة تدريب: ملعب مربّع ضلعه $x - 2$ .', mission: 'احمل المناطق كلّها، اجمع المتشابه، ثم تحقّق.' }) },
    props: props({ ...R2, chains: 'squareDiff', predict: PREDICT.r2, lead: 'ملعب مربّع ضلعه $x - 5$ : شريطان مقتطعان يلتقيان في ركن.', mission: 'احمل المناطق كلّها، المقتطعة أيضًا، اجمع المتشابه، ثم تحقّق من أجل قيمتين.' }) },
  { id: 'r3', title: 'ضلع فيه معامل', goal: [{ discovered: true }, { checkpoint: 'coef' }], stars: { maxTrials: 3, predict: false },
    helpAfterRefusals: 3,
    easier: { goal: [{ checkpoint: 'coef' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: props({ ...R3_EASY, chains: 'coefEasy', lead: 'جولة تدريب: ملعب مربّع ضلعه $2x + 1$ .', mission: 'احمل المناطق كلّها، اجمع المتشابه، ثم تحقّق.' }) },
    props: props({ ...R3, chains: 'coef', lead: 'ملعب مربّع ضلعه $2x - 1$ : الحدّ الأول فيه معامل.', mission: 'احمل المناطق كلّها، اجمع المتشابه، ثم تحقّق من أجل قيمتين.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: ملعب كبير', goal: [{ discovered: true }], stars: { maxTrials: 2, predict: false },
    props: props({ ...CHALLENGE, chains: 'none', lead: 'تحدٍّ: ملعب مربّع ضلعه $2x + 5$ .', mission: 'احمل المناطق، اجمع المتشابه، وتحقّق من أجل قيمتين في محاولتين على الأكثر.' }) },
  free(FREE),
];

/** Module 2 : la somme par la différence, puis le défi et la ورشة libre. */
export const M2_ROUNDS = [
  { id: 'm2', title: 'ملعب يطول بقدر ما يضيق', goal: [{ discovered: true }, { checkpoint: 'cancel' }, { checkpoint: 'rule' }], stars: { maxTrials: 4 },
    helpAfterRefusals: 3,
    easier: { goal: [{ checkpoint: 'cancel' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: props({ ...M2_EASY, chains: 'sumDiffEasy', lead: 'جولة تدريب: ملعب بعداه $x + 2$ و $x - 2$ .', mission: 'احمل المناطق كلّها، اجمع المتشابه، ثم تحقّق.' }) },
    props: props({ ...M2, chains: 'sumDiff', predict: PREDICT.m2, lead: 'ملعب بعداه $x + 4$ و $x - 4$ : يطول بقدر ما يضيق.', mission: 'احمل المناطق كلّها، اجمع المتشابه، ثم تحقّق من أجل قيمتين.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: معامل في الحدّين', goal: [{ discovered: true }], stars: { maxTrials: 2, predict: false },
    props: props({ ...M2_CHALLENGE, chains: 'none', lead: 'تحدٍّ: ملعب بعداه $3x + 4$ و $3x - 4$ .', mission: 'احمل المناطق، اجمع المتشابه، وتحقّق من أجل قيمتين في محاولتين على الأكثر.' }) },
  free(FREE_M2),
];
