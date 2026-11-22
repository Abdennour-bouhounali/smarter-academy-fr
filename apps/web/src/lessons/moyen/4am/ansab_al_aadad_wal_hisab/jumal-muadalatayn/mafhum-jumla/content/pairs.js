/**
 * LE TABLEAU DES DEUX CONDITIONS de la leçon : le labo `pair-scoreboard` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-12,
 * unité 5 leçon 1 ; conseil du 2026-11-11, verdict « L1 » et §4 — SEULE source des nombres ; joués par la logique du labo,
 * `logic/pairScoreboardPlayer.js`). Module 1 seulement (X5 : pas de labo au module 2), labId `lab-pair-m1`.
 *
 *   r1  x + y = 7 ∣ 3x + y = 17 (le football), À LA MAIN, lectures en VALEURS : (5 ; 2). La première ثنائية qui n'allume qu'UNE jauge est
 *       gratuite. Suite « season » : quelle lampe a allumé ta ثنائية à une jauge, puis BÂTIR « 17 = 3 × 5 + 2 » (leurre 15 = 3 × 5, les victoires seules).
 *   r2  x + y = 9 ∣ 50x + 20y = 300 (la cagnotte), lectures en VALEURS : (4 ; 5). Gratuites : les trois premières ثنائيات de la jauge (1) et la
 *       renversée de la ثنائية acceptée. Prédictions « كم ثنائية تعطي 9 قطع ؟ » (avant le premier geste) et « لو قلبتها… » (à la réponse acceptée).
 *       Suite « coins » (après le renversement) : BÂTIR « 50x + 20y = 300 » (leurre 330 = le montant de la renversée), puis LA RÈGLE.
 *   r3  x + y = 13 ∣ 3x + y = 29 (le football, jauge (2) COUVERTE), lectures en lignes : (8 ; 5). Un essai = une réponse ; la première refusée est
 *       gratuite ; après 3 refus, l'entraînement. Suite « covered » : lire la jauge découverte (29 · 13 · 24), puis pourquoi un refus à saison pleine.
 *   ⭐  x − y = 4 ∣ x + 2y = 1 (abstrait, négatifs) : (3 ; −1).
 *   libre : x + y = 14 ∣ 3x + y = 36, x + y = 11 ∣ 50x + 20y = 400, x + y = 11 ∣ 3x + y = 25, x − y = 1 ∣ 2x + y = 5.
 *   Entraînement (« لا بأس — جرّب أصغر ») : r1 → x + y = 5 ∣ 3x + y = 11 ; r2 → x + y = 5 ∣ 50x + 20y = 160 ; r3 → x + y = 6 ∣ 3x + y = 16 (couverte).
 *
 * La signature de la مسألة (42 عاملًا, x − 6 = 3(y − 4), (30 ; 12)…) n'est montrée par AUCUN écran dans son rôle : content/forbidden.js et
 * content/pairs.test.js (le balayage de `logic › shownValues` de chaque manche, entraînement et choix libres compris).
 */
const props = (extra) => ({ type: 'pair-scoreboard', levels: false, ...extra });
const Z = { x: 0, y: 0 };
const R = (min, max) => ({ x: { min, max }, y: { min, max } });

export const SYS = {
  r1: 'x+y=7|3x+y=17', r1Easy: 'x+y=5|3x+y=11',
  r2: 'x+y=9|50x+20y=300', r2Easy: 'x+y=5|50x+20y=160',
  r3: 'x+y=13|3x+y=29', r3Easy: 'x+y=6|3x+y=16',
  star: 'x-y=4|x+2y=1',
};
export const FREE = ['x+y=14|3x+y=36', 'x+y=11|50x+20y=400', 'x+y=11|3x+y=25', 'x-y=1|2x+y=5'];
/** Le monde et les bornes de chaque jumla du choix libre (la première a 14 matchs : ses poignées s'arrêtent à 14). */
export const FREE_SPEC = {
  'x+y=14|3x+y=36': { theme: 'football', ranges: R(0, 14) },
  'x+y=11|50x+20y=400': { theme: 'coins' },
  'x+y=11|3x+y=25': { theme: 'football' },
  'x-y=1|2x+y=5': {},
};

/** Les prédictions de la manche 2 : des clés ; options et vérité calculées par la logique (`predictOptions`, `predictTruth`). */
export const PREDICT = { r2: ['manyFirst', 'swapSol'] };

const HELP = 'جرّب أوّلًا لوحة أصغر، ثم عُد.';
const easy = (extra) => ({
  goal: [{ discovered: true }], helpLine: HELP, releases: true, stars: { maxTrials: 4, predict: false },
  props: props({ chains: 'none', start: Z, ...extra }),
});

export const M1_ROUNDS = [
  { id: 'r1', title: 'بطاقة الموسم', goal: [{ discovered: true }, { checkpoint: 'season' }], stars: { maxTrials: 6, predict: false },
    easier: easy({ system: SYS.r1Easy, theme: 'football', ranges: R(0, 7), discover: 'contrast', readings: 'values', swap: false,
      lead: 'موسم أقصر: 5 مباريات دون أيّ هزيمة، و 11 نقطة — الانتصار بـ 3 نقاط والتعادل بنقطة.',
      mission: 'اختر عدد الانتصارات وعدد التعادلات حتى تقبل اللوحتان عدديك معًا.' }),
    props: props({ system: SYS.r1, theme: 'football', ranges: R(0, 9), start: Z, chains: 'season', discover: 'contrast', readings: 'values',
      free: 'firstHalf', swap: false,
      lead: 'بطاقة موسم فريق الحيّ: 7 مباريات دون أيّ هزيمة، و 17 نقطة — الانتصار بـ 3 نقاط والتعادل بنقطة.',
      mission: 'اختر عدد الانتصارات وعدد التعادلات حتى تقبل اللوحتان عدديك معًا.' }) },
  { id: 'r2', title: 'حصّالة القسم', goal: [{ discovered: true }, { checkpoint: 'coins' }], stars: { maxTrials: 3 },
    easier: easy({ system: SYS.r2Easy, theme: 'coins', ranges: R(0, 7), discover: 'contrast', readings: 'values',
      lead: 'حصّالة أصغر: 5 قطع من فئتي 50 دج و 20 دج، مبلغها 160 دج.',
      mission: 'اختر عدد القطع من كل فئة حتى تقبل اللوحتان عدديك معًا.' }),
    props: props({ system: SYS.r2, theme: 'coins', ranges: R(0, 11), start: Z, chains: 'coins', discover: 'many', readings: 'values',
      free: 'gauge1x3', counter: true, predict: PREDICT.r2,
      lead: 'حصّالة القسم لشراء أصيص نبتة: 9 قطع من فئتي 50 دج و 20 دج، مبلغها 300 دج.',
      mission: 'جد ثلاث ثنائيات تعطي 9 قطع، وبينها الثنائية التي تقبلها اللوحتان معًا، ثم اقلبها.' }) },
  { id: 'r3', title: 'اللوحة المغطّاة', goal: [{ discovered: true }, { checkpoint: 'covered' }], stars: { maxTrials: 4, predict: false },
    helpAfterRefusals: 3,
    easier: easy({ system: SYS.r3Easy, theme: 'football', ranges: R(0, 8), discover: 'covered', covered: true, readings: 'lines', swap: false,
      lead: 'موسم قصير: 6 مباريات دون أيّ هزيمة، و 16 نقطة. اللوحة (2) مغطّاة.',
      mission: 'املأ الموسم، ثم اضغط «تحقّق من ثنائيتي» لتكشف اللوحة (2).' }),
    props: props({ system: SYS.r3, theme: 'football', ranges: R(0, 13), start: Z, chains: 'covered', discover: 'covered', covered: true, readings: 'lines',
      free: 'firstRefusal', swap: false,
      lead: 'بطاقة موسم فريق المدرسة: 13 مباراة دون أيّ هزيمة، و 29 نقطة (3 للانتصار، 1 للتعادل). اللوحة (2) مغطّاة.',
      mission: 'املأ الموسم، ثم اضغط «تحقّق من ثنائيتي» لتكشف اللوحة (2): اعثر على الحلّ بأقلّ عدد من المحاولات.' }) },
  { id: 'challenge', optional: true, title: 'تحدٍّ: بلا قصّة', goal: [{ discovered: true }], stars: { maxTrials: 4, predict: false },
    props: props({ system: SYS.star, start: { x: 1, y: 1 }, chains: 'none', discover: 'contrast', readings: 'lines',
      lead: 'تحدٍّ بلا قصّة: معادلتان وأعداد قد تكون سالبة.',
      mission: 'اعثر على الثنائية التي تُضيء اللوحتين معًا.' }) },
  { id: 'free', free: true, title: 'اللوحة الحرّة',
    props: props({ system: FREE[0], ...FREE_SPEC[FREE[0]], choices: FREE, choiceSpec: FREE_SPEC, chains: 'none', discover: 'contrast',
      readings: 'values', checkpoints: false,
      lead: 'اللوحة الحرّة: اختر الجملة التي تريد.',
      mission: 'اعثر على الثنائية التي تُضيء اللوحتين معًا.' }) },
];

/**
 * MODULE 2 — LES CAS PARTICULIERS, joués (décision du propriétaire OQ1, 2026-11-12 : « اللوحة العنيدة », proposition E du conseil ; labId
 * `lab-pair-m2`, lecteur seulement). Un sac de 6 pièces, TOUTES de 50 دج (anciennes x, nouvelles y) : la jauge (2) lit 300 دج sur CHAQUE ثنائية
 * de la jauge (1).
 *   m2a  x + y = 6 ∣ 50x + 50y = 280 : les deux jauges ne s'allument JAMAIS ensemble (aucune solution). Suite « never ».
 *   m2b  x + y = 6 ∣ 50x + 50y = 300 : elles s'allument TOUJOURS ensemble (une infinité de solutions). Suite « always ».
 * Trois ثنائيات de la jauge (1) gratuites (`gauge1x3`), puis UNE question d'un toucher. L'étape de classification du module 2 relit les deux sacs.
 */
export const SYS_M2 = { none: 'x+y=6|50x+50y=280', infinite: 'x+y=6|50x+50y=300' };
const BAG = {
  theme: 'coins', ranges: R(0, 8), start: Z, discover: 'gauge1x3', readings: 'values', free: 'gauge1x3',
  nouns: { x: 'عدد القطع القديمة', y: 'عدد القطع الجديدة' },
};
export const M2_ROUNDS = [
  { id: 'm2a', title: 'اللوحة العنيدة', goal: [{ discovered: true }, { checkpoint: 'never' }], stars: { maxTrials: 3, predict: false },
    props: props({ ...BAG, system: SYS_M2.none, chains: 'never',
      lead: 'كيس فيه 6 قطع نقدية، كلّها من فئة 50 دج: بعضها قديم وبعضها جديد. يقول صاحبه إنّ المبلغ 280 دج.',
      mission: 'جد ثلاث ثنائيات تعطي 6 قطع، واقرأ اللوحة (2) في كل مرّة: هل تُضيء اللوحتان معًا؟' }) },
  { id: 'm2b', title: 'لوحتان لا تختلفان', goal: [{ discovered: true }, { checkpoint: 'always' }], stars: { maxTrials: 3, predict: false },
    props: props({ ...BAG, system: SYS_M2.infinite, chains: 'always',
      lead: 'كيس آخر فيه 6 قطع من فئة 50 دج، قديمة وجديدة، ومبلغه 300 دج.',
      mission: 'جد ثلاث ثنائيات تعطي 6 قطع، واقرأ اللوحة (2) في كل مرّة: هل تُضيء اللوحتان معًا؟' }) },
];
