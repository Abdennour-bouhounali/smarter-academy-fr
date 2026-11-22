/**
 * LE TERRAIN DÉCOUPÉ de la leçon : le labo `pitch-expansion` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-11, unité 3
 * leçon 1 ; conseil du 2026-11-11 — 5 conseillers, 5 revues, président ; verdict « L1 », arithmétique revérifiée). Un ESSAI est un appui sur
 * « تحقّق » ; les manches 1–2 montrent des AIRES (`labels: 'area'`), jamais les lettres : la construction écrit ensuite les termes.
 *
 *   r1  3(x + 5) à la main, en aires, x de 1 à 9 SANS 5 (15 = 15 : deux zones de natures différentes de même aire), départ 3 ; au 1er x juste
 *       l'aire du terrain puis BÂTIR 3(x + 5) = ▢ + ▢ (leurre 5, le terme non multiplié) ; au 2e x la règle (sa raison : les mêmes zones).
 *   r2  (3x − 1)(3 + x) en aires, x de 1 à 6 SANS 3 (27, 27, −3, −3), départ 2 ; prédictions « les deux zones non hachurées suffisent ? »
 *       (non) puis « vraie pour une autre valeur ? » (oui) ; BÂTIR les quatre zones (leurre x, la zone retranchée ajoutée), puis la règle.
 *   r3  REQUISE (x − 2)(2x − 1) en termes, réunion permise (« notLike » refuse x² + x) ; prédiction « combien de termes après la réunion ? »
 *       [2, 3, 4] (3) ; « corner » : pourquoi le coin hachuré deux fois compte + 2 ; à la découverte « result ».
 *   ⭐  (3x − 2)(2x − 1) : deux x en deux essais (termes croisés de MÊME signe — conseil L1.5 : réduire deux termes croisés opposés est la méthode
 *       de la مسألة ; le design proposait (3x − 2)(2x + 1), écarté pour cette raison).
 *   libre : (x + 1)(2x + 3), 2(3x + 4), (x − 2)(x − 5), (2x + 1)(x + 2) — même règle (le design avait (x − 2)(x + 3) et (2x − 1)(x + 2)) ; (x − 1)(x − 3) puis (x − 1)(x − 5)
 *       refusés par le balayage (x − 3 est un facteur de la مسألة ; −x − 5x = −6x un de ses termes).
 *   Entraînement (« لا بأس — جرّب أصغر ») : r1 → 2(x + 1) (x de 2 à 7) ; r2 → (x − 1)(x + 2) (x de 3 à 7) ; r3 → (x − 1)(x − 2). Chacun LIBÈRE sa
 *   manche une fois gagné (`releases`).
 *   Module 2 (M2_ROUNDS, conseil L1.5 « own numbers ») : (2x − 3)(x − 1) = 2x² − 5x + 3, deux zones hachurées, termes croisés de même signe ; à
 *   la découverte « result ».
 * Les nombres de la مسألة (1820, 1760, 1944, 124, 186000, 1500, 350 ; x = 30 ; côtés 70, 26, 72, 27, 60 ; 2x + 10, x − 4…) ne sont montrés
 * par AUCUN écran : content/forbidden.js (la règle, par rôle) et content/pitches.test.js (le balayage de `logic › shownValues`).
 */
const props = (extra) => ({ type: 'pitch-expansion', ...extra });

export const R1 = { expr: '3|x+5', span: 8, labels: 'area', start: 3 };
export const R1_EASY = { expr: '2|x+1', span: 6, labels: 'area' };
export const R2 = { expr: '3x-1|3+x', span: 5, labels: 'area', start: 2 };
export const R2_EASY = { expr: 'x-1|x+2', span: 5, labels: 'area' };
export const R3 = { expr: 'x-2|2x-1', span: 5, labels: 'terms', start: 5 };
export const R3_EASY = { expr: 'x-1|x-2', span: 5, labels: 'terms' };
export const CHALLENGE = { expr: '3x-2|2x-1', span: 5, labels: 'terms' };
export const M2 = { expr: '2x-3|x-1', span: 5, labels: 'terms' };
export const FREE = ['x+1|2x+3', '2|3x+4', 'x-2|x-5', '2x+1|x+2'];

/** Les prédictions : leur NATURE, jamais leur réponse (calculée par le labo). */
export const PREDICT = {
  r2: [{ key: 'r2-plain', kind: 'unhatched' }, { key: 'r2-other', kind: 'otherX' }],
  r3: [{ key: 'r3-terms', kind: 'termsLeft' }],
};

const help = 'جرّب أوّلًا ملعبًا أصغر، ثم عُد.';
const free = {
  id: 'free', free: true, title: 'الورشة الحرّة',
  props: props({ expr: FREE[0], span: 5, labels: 'terms', chains: 'none', checkpoints: false, choices: FREE, lead: 'الورشة الحرّة: اختر ملعبًا.', mission: 'احمل المناطق وتحقّق كما تشاء.' }),
};

export const M1_ROUNDS = [
  { id: 'r1', title: 'ملعب يطول', goal: [{ discovered: true }, { checkpoint: 'build' }, { checkpoint: 'rule' }], stars: { maxTrials: 3, predict: false },
    helpAfterRefusals: 3,
    easier: { goal: [{ checkpoint: 'build' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: props({ ...R1_EASY, chains: 'distEasy', lead: 'جولة تدريب: ملعب صغير عرضه $2$ وطوله $x + 1$ .', mission: 'احمل المنطقتين إلى «المجموع» ثم تحقّق.' }) },
    props: props({ ...R1, chains: 'dist', lead: 'ملعب عرضه $3$ وطوله $x + 5$ : كلّما كبر $x$ طال الملعب. جرّب $x = 9$ بين قيمك.', mission: 'احمل كل منطقة إلى «المجموع» ثم تحقّق: هل يساوي المجموع مساحة الملعب؟ تحقّق من أجل قيمتين مختلفتين.' }) },
  { id: 'r2', title: 'ملعب بممرّ مقتطع', goal: [{ discovered: true }, { checkpoint: 'build4' }, { checkpoint: 'rule' }], stars: { maxTrials: 3 },
    helpAfterRefusals: 3,
    easier: { goal: [{ checkpoint: 'build4' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: props({ ...R2_EASY, chains: 'doubleEasy', lead: 'جولة تدريب: ملعب بعداه $x - 1$ و $x + 2$ .', mission: 'احمل المناطق الأربع إلى «المجموع» ثم تحقّق.' }) },
    props: props({ ...R2, chains: 'double', predict: PREDICT.r2, lead: 'ملعب بعداه $3x - 1$ و $3 + x$ : المنطقتان المخطّطتان مقتطعتان من طوله.', mission: 'احمل المناطق إلى «المجموع» ثم تحقّق من أجل قيمتين مختلفتين.' }) },
  { id: 'r3', title: 'ممرّان: ركن مقتطع مرّتين', goal: [{ discovered: true }, { checkpoint: 'corner' }, { checkpoint: 'result' }], stars: { maxTrials: 3 },
    helpAfterRefusals: 3,
    easier: { goal: [{ discovered: true }, { checkpoint: 'corner' }], helpLine: help, releases: true, stars: { maxTrials: 4, predict: false },
      props: props({ ...R3_EASY, chains: 'restoredEasy', lead: 'جولة تدريب: ملعب بعداه $x - 1$ و $x - 2$ .', mission: 'احمل المناطق كلّها، اجمع الحدّين المتشابهين، ثم تحقّق من أجل قيمتين.' }) },
    props: props({ ...R3, chains: 'restored', predict: PREDICT.r3, lead: 'ملعب بعداه $x - 2$ و $2x - 1$ : شريطان مقتطعان يلتقيان في ركن.', mission: 'احمل المناطق كلّها، اجمع الحدود المتشابهة، ثم تحقّق من أجل قيمتين.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: ملعب كبير', goal: [{ discovered: true }], stars: { maxTrials: 2, predict: false },
    props: props({ ...CHALLENGE, chains: 'none', lead: 'تحدٍّ: ملعب بعداه $3x - 2$ و $2x - 1$ .', mission: 'احمل المناطق، اجمع المتشابه، وتحقّق من أجل قيمتين في محاولتين على الأكثر.' }) },
  free,
];

/** Module 2 : le terrain de la plateforme (conseil L1.5), puis la ورشة libre. */
export const M2_ROUNDS = [
  { id: 'm2', title: 'ملعب الحيّ الجديد', goal: [{ discovered: true }, { checkpoint: 'result' }], stars: { maxTrials: 3, predict: false },
    props: props({ ...M2, chains: 'result', lead: 'ملعب بعداه $2x - 3$ و $x - 1$ : شريطان مقتطعان.', mission: 'احمل المناطق كلّها، اجمع الحدود المتشابهة، ثم تحقّق من أجل قيمتين.' }) },
  free,
];
