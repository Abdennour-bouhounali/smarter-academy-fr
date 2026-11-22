/**
 * LE RAYON DES SOLUTIONS de la leçon : le labo `solution-ray` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-11,
 * unité 4 leçon 3 ; conseil du 2026-11-11 — verdict « L3 », arithmétique revérifiée par la logique du labo, `rays.test.js`).
 * Un ESSAI : manches sans crochet — une graduation NOUVELLE relâchée (le verdict est CACHÉ pendant le glisser : la libération est la
 * pression, L3.2) ; manches avec crochet — « ثبّت » sur un brouillon NOUVEAU, ou une ligne NOUVELLE choisie ; le même deux fois ne compte
 * pas ; le PREMIER refus de la manche est gratuit. Les sondes des manches à crochet sont libres (ce sont ses preuves).
 *
 * MODULE 1 (`M1_ROUNDS`, labId `lab-ray-m1`) — deux manches REQUISES + le défi ⭐ (verdict L3.9 b) :
 *   r1  `6x + 20 ≤ 80`, des stylos entiers (L3.1 b′ : AUCUN téléphone avant la مسألة, le décor par défaut — le juge de touche), droite 0…18, départ 16.
 *       La suite « cost » : « الكلفة عند آخر نقطة حمراء: ▢ » (80 ; 86, 60, 30) puis BÂTIR « ▢x + ▢ ▢ ▢ » (6, 20, ≤, 80 ; leurre < : le
 *       refus cite SA trace rouge à 10).
 *   r2  `15x + 25 > 100`, des jours entiers, droite 0…14, départ 1. Prédictions : 3 → non (70), 9 → oui (160). La suite « rule » :
 *       « أوّل نقطة حمراء: ▢ » (6 ; 5, 7, 4), BÂTIR (15, 25, >, 100 ; leurre ≥), LA RÈGLE de la frontière.
 *   ⭐  `4x − 5 < 11` en nombres relatifs −3…9, départ 8, sans histoire ni suite (cinq essais au plus). L'ancien défi aux demi-graduations est supprimé.
 *   libre : 2x − 1 < 9, x + 9 ≥ 1, 8x + 4 ≤ 52, 4x > 6.
 * MODULE 2 (`M2_ROUNDS`, labId `lab-ray-m2`) — trois manches REQUISES + ⭐ :
 *   r1  deux cas de la MÊME borne : `x < 4` puis `x ≤ 4`, droite −2…10, départ 8. La suite « bracket » : « العدد 4 : في الأولى ▢ · في الثانية ▢ »
 *       (حلّ / ليس حلًّا) puis LA RÈGLE du crochet.
 *   r2  `2x + 7 ≤ 9` (diviseur POSITIF), droite −6…6, départ 5 : le crochet, la carte « − 7 » et sa ligne, puis la division BÂTIE
 *       « نقسم الطرفين على 2 : x ▢ ▢ » (≤, 1 ; leurre ≥). Prédictions : 4 → non (15), la partie rouge → les petites.
 *   r3  `−2x + 7 ≤ 5` (diviseur NÉGATIF), la MÊME droite, départ −5 : « (−2) ÷ (−2) = ▢ » (1), BÂTIR « x ▢ ▢ » (≥, 1 ; leurre ≤ : le sens gardé),
 *       LA RÈGLE du sens. Les jumelles ne sont pas des miroirs : même borne 1, fermée des deux côtés ; seul le côté change. Prédictions :
 *       la partie rouge → les grandes, 2 → oui (3).
 *   ⭐  `4x − 3 > 6x + 2`, demi-graduations −8…3, départ 2 : les cartes − 6x, + 3, ÷ (−2) (ici ÷ 2 et ÷ (−2) sont toutes deux offertes).
 *   libre : 5x − 4 > 31, −x + 2 ≥ 9, −5x + 10 < 0, 2x + 9 ≤ 6, −4x + 1 > 3.
 * Chaque manche fixe SON départ (jamais `defaultK` : celui de la page dessinerait la borne ou son voisin).
 *
 * La signature de la مسألة (600, 120, 3 par message, 200, la division par −3, 93 messages…) n'est montrée par AUCUN écran dans son rôle :
 * content/forbidden.js (la règle) et content/mission.test.js (le balayage de `logic › shownValues` de chaque manche, entraînement et choix
 * libres compris).
 */
const props = (extra) => ({ type: 'solution-ray', levels: false, ...extra });

const COST = { left: 'الكلفة', right: 'الرصيد' };
const PAGES = { left: 'الصفحات المقروءة', right: 'الهدف' };

export const R1 = { ineq: '6x+20<=80', whole: true, min: 0, max: 18, start: 16 };
export const R1_EASY = { ineq: '10x+10<=40', whole: true, min: 0, max: 6, start: 6 };
export const R2 = { ineq: '15x+25>100', whole: true, min: 0, max: 14, start: 1 };
export const R2_EASY = { ineq: '10x>30', whole: true, min: 0, max: 8, start: 0 };
export const STAR1 = { ineq: '4x-5<11', min: -3, max: 9, start: 8 };
export const FREE1 = ['2x-1<9', 'x+9>=1', '8x+4<=52', '4x>6'];

export const B1 = { sequence: ['x<4', 'x<=4'], min: -2, max: 10, start: 8 };
export const B1_EASY = { ineq: 'x<=2', min: -4, max: 8, start: 6 };
export const F2 = { ineq: '2x+7<=9', min: -6, max: 6, start: 5 };
export const F2_EASY = { ineq: '2x<=14', min: 0, max: 12, start: 2 };
export const F3 = { ineq: '-2x+7<=5', min: -6, max: 6, start: -5 };
export const F3_EASY = { ineq: '-2x<=14', min: -12, max: 0, start: -2 };
export const STAR2 = { ineq: '4x-3>6x+2', min: -8, max: 3, start: 2 };
export const FREE2 = ['5x-4>31', '-x+2>=9', '-5x+10<0', '2x+9<=6', '-4x+1>3'];

/** Les prédictions de chaque manche : des clés ; les options et la vérité sont calculées par le labo (`logic › predictOptions`, `predictTruth`). */
export const PREDICT = {
  m1r2: ['isSol:3', 'isSol:9'],
  m2r2: ['isSol:4', 'redSide'],
  m2r3: ['redSide', 'isSol:2'],
};

const easy = (goal, helpLine, p, maxTrials = 5) => ({ goal, helpLine, releases: true, stars: { maxTrials, predict: false }, props: props({ chains: 'none', ...p }) });

export const M1_ROUNDS = [
  { id: 'r1', title: 'ميزانية الأقلام', goal: [{ discovered: true }, { checkpoint: 'build' }], stars: { maxTrials: 6, predict: false },
    easier: easy([{ discovered: true }], 'جرّب أوّلًا أعدادًا أقلّ، ثم عُد.', { ...R1_EASY, bracket: false, sides: COST, lead: 'جولة تدريب: علبة بـ 10 دج و 10 دج للقلم الواحد، والرصيد 40 دج.', mission: 'لوّن بالأحمر كل أعداد الأقلام الكاملة التي لا تتجاوز كلفتها 40 دج.' }),
    props: props({ ...R1, bracket: false, sides: COST, chains: 'cost', lead: 'تملك هدى 80 دج لشراء أقلام كاملة: 20 دج لعلبة، ثم 6 دج للقلم الواحد.', mission: 'لوّن بالأحمر كل أعداد الأقلام التي لا تتجاوز كلفتها 80 دج.' }) },
  { id: 'r2', title: 'تحدّي القراءة', goal: [{ discovered: true }, { checkpoint: 'rule' }], stars: { maxTrials: 6 },
    easier: easy([{ discovered: true }], 'جرّب أوّلًا أعدادًا أقلّ، ثم عُد.', { ...R2_EASY, bracket: false, sides: PAGES, lead: 'جولة تدريب: 10 صفحات كل يوم، والهدف أن يتجاوز 30 صفحة.', mission: 'لوّن بالأحمر كل أعداد الأيام الكاملة التي يتجاوز فيها الهدف.' }),
    props: props({ ...R2, bracket: false, sides: PAGES, chains: 'rule', predict: PREDICT.m1r2, lead: 'تحدّي القراءة: قرأ عماد 25 صفحة، ويقرأ 15 صفحة كل يوم. يريد أن يتجاوز 100 صفحة.', mission: 'لوّن بالأحمر كل أعداد الأيام الكاملة التي يتجاوز فيها الهدف.' }) },
  { id: 'star', optional: true, title: 'تحدٍّ: أعداد نسبية', goal: [{ discovered: true }], stars: { maxTrials: 5, predict: false },
    props: props({ ...STAR1, bracket: false, chains: 'none', lead: 'بلا حكاية هذه المرّة: متراجحة وأعداد نسبية.', mission: 'جد آخر نقطة حمراء وجرّب العدد الذي يليها، في خمس محاولات على الأكثر.' }) },
  { id: 'free', free: true, title: 'المستقيم الحرّ',
    props: props({ ineq: FREE1[0], choices: FREE1, bracket: false, chains: 'none', checkpoints: false, lead: 'المستقيم الحرّ: اختر متراجحة.', mission: 'لوّن حلولها بتجاربك.' }) },
];

export const M2_ROUNDS = [
  { id: 'r1', title: 'الحدّ والرمز', goal: [{ solvedAll: 2 }, { checkpoint: 'rule' }], stars: { maxTrials: 4, predict: false }, helpAfterRefusals: 3,
    easier: easy([{ solvedAll: 1 }], 'جرّب أوّلًا متراجحة واحدة، ثم عُد.', { ...B1_EASY, bracket: true, transform: false, lead: 'جولة تدريب: متراجحة واحدة.', mission: 'لوّن حلولها، وضع الرمز عند الحدّ.' }, 3),
    props: props({ ...B1, bracket: true, transform: false, chains: 'bracket', lead: 'متراجحتان تحدّهما العدد نفسه. اترك المسبار على أعداد، ثم ضع الرمز.', mission: 'لوّن حلول كل متراجحة، وضع الرمز عند الحدّ.' }) },
  { id: 'r2', title: 'قسمة على عدد موجب', goal: [{ solvedAll: 3 }, { checkpoint: 'build' }], stars: { maxTrials: 4 }, helpAfterRefusals: 3,
    easier: easy([{ solvedAll: 2 }], 'جرّب أوّلًا متراجحة بخطوة واحدة، ثم عُد.', { ...F2_EASY, bracket: true, transform: true, divide: 'coef', lead: 'جولة تدريب: خطوة واحدة.', mission: 'ضع الرمز عند الحدّ، ثم حوّل المتراجحة حتى يبقى $x$ وحده.' }, 3),
    props: props({ ...F2, bracket: true, transform: true, divide: 'coef', handDone: true, chains: 'pos', predict: PREDICT.m2r2, lead: 'المستقيم من $-6$ إلى 6. جرّب أعدادًا، ثم ضع الرمز.', mission: 'حوّل المتراجحة حتى يبقى $x$ وحده.' }) },
  { id: 'r3', title: 'المعامل صار سالبًا', goal: [{ solvedAll: 3 }, { checkpoint: 'rule' }], stars: { maxTrials: 4 }, helpAfterRefusals: 3,
    easier: easy([{ solvedAll: 2 }], 'جرّب أوّلًا متراجحة بخطوة واحدة، ثم عُد.', { ...F3_EASY, bracket: true, transform: true, divide: 'coef', lead: 'جولة تدريب: خطوة واحدة.', mission: 'ضع الرمز عند الحدّ، ثم حوّل المتراجحة حتى يبقى $x$ وحده.' }, 3),
    props: props({ ...F3, bracket: true, transform: true, divide: 'coef', handDone: true, chains: 'neg', predict: PREDICT.m2r3, lead: 'المستقيم نفسه من $-6$ إلى 6، والمعامل صار سالبًا.', mission: 'حوّل المتراجحة حتى يبقى $x$ وحده.' }) },
  { id: 'star', optional: true, title: 'تحدٍّ: المجهول في الطرفين', goal: [{ solvedAll: 4 }], stars: { maxTrials: 5, predict: false },
    props: props({ ...STAR2, bracket: true, transform: true, handDone: true, chains: 'none', lead: 'المجهول في الطرفين والتدريجات أنصاف: خمس محاولات على الأكثر.', mission: 'ضع الرمز عند الحدّ، ثم حوّل المتراجحة حتى يبقى $x$ وحده.' }) },
  { id: 'free', free: true, title: 'المستقيم الحرّ',
    props: props({ ineq: FREE2[0], choices: FREE2, bracket: true, transform: true, handDone: true, chains: 'none', checkpoints: false, lead: 'المستقيم الحرّ: اختر متراجحة.', mission: 'لوّن، ضع الرمز، ثم حوّل المتراجحة.' }) },
];
