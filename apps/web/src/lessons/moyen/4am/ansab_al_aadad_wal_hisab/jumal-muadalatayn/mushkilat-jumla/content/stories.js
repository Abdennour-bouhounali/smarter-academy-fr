/**
 * LES HISTOIRES de la leçon : le labo `story-modeller` joué en MANCHES avec étoiles dans le lecteur de mission (rollout 2026-11-12, unité 5
 * leçon 3 ; conseil du 2026-11-11, verdict L3.1–L3.16 et §4 « THE NUMBERS »). Les manches comptent des OBJETS (jamais des personnes qui
 * entrent à deux prix : c'est le monde de la مسألة) ; chaque nombre d'une histoire est un jeton (ou le jeton MUET « 8 أيام ») ; le départ de
 * chaque manche est écrit (`named`, `onesPlaced`) pour qu'aucun défaut de la page ne montre la مسألة. Prix en « دج ».
 *
 *   M1 r1  نادي الرسم : 12 crayons à 70 / 20 دج, 440 دج → (4 ; 8) ; à la main, les lettres à porter, la ligne 50x = 200 TAPÉE avant d'être vue.
 *   M1 r2  مكتبة الحيّ : 2 كرّاسان + قلم 230 دج, كرّاس + 2 قلمان 190 دج → (90 ; 50) ; argent + argent, le jeton muet « 8 أيام », 3x = 270 tapé.
 *   M1 ⭐   معرض الكتب : 26 livres à 130 / 90 دج, 2820 دج → (12 ; 14).
 *   M2 p1  دفتر التعاونية : 15 maillots à 1100 / 700 دج, 17700 دج → (18 ; −3) : les deux informations se vérifient, l'histoire REFUSE.
 *   Entraînements : r1 (1 ; 5) · r2 (45 ; 20) · p1 (7 ; −1). Libres : les ballons (9 ; 7), l'épicier (130 ; 85), la fraction (29/4 ; 11/4).
 * Aucun nombre de la مسألة (content/forbidden.js) n'est montré par un écran : content/stories.test.js (le balayage de `shownValues`).
 */
const base = (extra) => ({ type: 'story-modeller', theme: 'museum', levels: false, startWith: 'model', ...extra });

const pencils = {
  unknowns: [
    { id: 'x', noun: 'عدد أقلام التلوين', short: 'أقلام التلوين' },
    { id: 'y', noun: 'عدد أقلام الرصاص', short: 'أقلام الرصاص' },
  ],
  items: { x: { glyph: 'pencil', color: '#E11D48' }, y: { glyph: 'pencil', color: '#475569' } },
};

/** r1 — نادي الرسم, à la main (les lettres à porter, les deux « 1 » déjà posés dans le rang qui compte). */
export const R1 = base({
  ...pencils,
  system: 'x+y=12|70x+20y=440',
  named: false,
  onesPlaced: true,
  story: 'اشترى نادي الرسم 12 قلمًا: أقلام تلوين بـ 70 دج للقلم وأقلام رصاص بـ 20 دج للقلم، ودفع 440 دج. كم قلم تلوين وكم قلم رصاص اشترى النادي؟',
  facts: [{ quote: 'اشترى النادي 12 قلمًا', kind: 'count' }, { quote: 'دفع النادي 440 دج', kind: 'money' }],
  chips: [{ value: '12', label: 'قلمًا' }, { value: '70', label: 'دج لقلم التلوين' }, { value: '20', label: 'دج لقلم الرصاص' }, { value: '440', label: 'دج المجموع' }],
  answer: { options: ['اشترى النادي 4 أقلام تلوين و 8 أقلام رصاص.', 'اشترى النادي 4 أقلام تلوين.', 'اشترى النادي 8 أقلام تلوين و 4 أقلام رصاص.'], correct: 0 },
});

/** r1 entraînement — le même club, 6 crayons, 170 دج, les inconnues déjà nommées. */
export const R1_EASY = base({
  ...pencils,
  system: 'x+y=6|70x+20y=170',
  named: true,
  onesPlaced: true,
  story: 'اشترى نادي الرسم 6 أقلام: أقلام تلوين بـ 70 دج للقلم وأقلام رصاص بـ 20 دج للقلم، ودفع 170 دج. كم قلم تلوين وكم قلم رصاص؟',
  facts: [{ quote: 'اشترى النادي 6 أقلام', kind: 'count' }, { quote: 'دفع النادي 170 دج', kind: 'money' }],
  chips: [{ value: '6', label: 'أقلام' }, { value: '70', label: 'دج لقلم التلوين' }, { value: '20', label: 'دج لقلم الرصاص' }, { value: '170', label: 'دج المجموع' }],
  answer: { options: ['اشترى النادي قلم تلوين واحدًا و 5 أقلام رصاص.', 'اشترى النادي 5 أقلام تلوين وقلم رصاص واحدًا.', 'اشترى النادي قلم تلوين واحدًا.'], correct: 0 },
});

/** r2 — مكتبة الحيّ, argent + argent ; « 8 أيام » est un nombre de l'histoire qu'aucune information ne relie aux prix (le jeton MUET). */
export const R2 = base({
  system: '2x+y=230|x+2y=190',
  named: true,
  unknowns: [{ id: 'x', noun: 'ثمن الكرّاس', short: 'الكرّاس' }, { id: 'y', noun: 'ثمن القلم', short: 'القلم' }],
  items: { x: { glyph: 'notebook', color: '#2563EB' }, y: { glyph: 'pen', color: '#E11D48' } },
  story: 'قبل الدخول المدرسي بـ 8 أيام، في مكتبة الحيّ: كرّاسان وقلم بـ 230 دج، وكرّاس وقلمان بـ 190 دج. ما ثمن الكرّاس وما ثمن القلم؟',
  facts: [{ quote: 'كرّاسان وقلم بـ 230 دج', kind: 'money' }, { quote: 'كرّاس وقلمان بـ 190 دج', kind: 'money' }],
  chips: [{ value: '2', label: 'كرّاسان أو قلمان' }, { value: '230', label: 'دج في المعلومة 1' }, { value: '190', label: 'دج في المعلومة 2' }, { value: '8', label: 'أيام', useless: true }],
  answer: { options: ['ثمن الكرّاس 90 دج وثمن القلم 50 دج.', 'ثمن الكرّاس 50 دج وثمن القلم 90 دج.', 'ثمن الكرّاس 90 دج.'], correct: 0 },
});

/** r2 entraînement — des règles et des gommes. */
export const R2_EASY = base({
  system: '2x+y=110|x+2y=85',
  named: true,
  unknowns: [{ id: 'x', noun: 'ثمن المسطرة', short: 'المسطرة' }, { id: 'y', noun: 'ثمن الممحاة', short: 'الممحاة' }],
  items: { x: { glyph: 'ruler', color: '#0F766E' }, y: { glyph: 'eraser', color: '#DB2777' } },
  story: 'في مكتبة الحيّ: مسطرتان وممحاة بـ 110 دج، ومسطرة وممحاتان بـ 85 دج. ما ثمن المسطرة وما ثمن الممحاة؟',
  facts: [{ quote: 'مسطرتان وممحاة بـ 110 دج', kind: 'money' }, { quote: 'مسطرة وممحاتان بـ 85 دج', kind: 'money' }],
  chips: [{ value: '2', label: 'مسطرتان أو ممحاتان' }, { value: '110', label: 'دج في المعلومة 1' }, { value: '85', label: 'دج في المعلومة 2' }],
  answer: { options: ['ثمن المسطرة 45 دج وثمن الممحاة 20 دج.', 'ثمن المسطرة 20 دج وثمن الممحاة 45 دج.', 'ثمن المسطرة 45 دج.'], correct: 0 },
});

/** ⭐ — معرض الكتب (sans nombre en trop). */
export const STAR = base({
  system: 'x+y=26|130x+90y=2820',
  named: true,
  unknowns: [{ id: 'x', noun: 'عدد الكتب بـ 130 دج', short: 'كتب 130 دج' }, { id: 'y', noun: 'عدد الكتب بـ 90 دج', short: 'كتب 90 دج' }],
  items: { x: { glyph: 'book', color: '#7C3AED' }, y: { glyph: 'book', color: '#0891B2' } },
  story: 'في معرض الكتب باع جناح الكتب المستعملة 26 كتابًا: كتبًا بـ 130 دج للكتاب وكتبًا بـ 90 دج للكتاب، وجمع 2820 دج. كم كتابًا باع من كل ثمن؟',
  facts: [{ quote: 'باع الجناح 26 كتابًا', kind: 'count' }, { quote: 'جمع الجناح 2820 دج', kind: 'money' }],
  chips: [{ value: '26', label: 'كتابًا' }, { value: '130', label: 'دج للكتاب' }, { value: '90', label: 'دج للكتاب' }, { value: '2820', label: 'دج المجموع' }],
  answer: { options: ['باع الجناح 12 كتابًا بـ 130 دج و 14 كتابًا بـ 90 دج.', 'باع الجناح 14 كتابًا بـ 130 دج و 12 كتابًا بـ 90 دج.', 'باع الجناح 12 كتابًا.'], correct: 0 },
});

/** Libre — les ballons de l'association (9 ; 7). */
export const BALLS = base({
  system: 'x+y=16|900x+700y=13000',
  named: true,
  unknowns: [{ id: 'x', noun: 'عدد كرات القدم', short: 'كرات القدم' }, { id: 'y', noun: 'عدد الكرات الطائرة', short: 'الكرات الطائرة' }],
  items: { x: { glyph: 'ball', color: '#0F172A' }, y: { glyph: 'volley', color: '#CA8A04' } },
  story: 'اشترت الجمعية الرياضية للحيّ 16 كرة: كرات قدم بـ 900 دج للكرة وكرات طائرة بـ 700 دج للكرة، ودفعت 13000 دج. كم كرة من كل نوع؟',
  facts: [{ quote: 'اشترت الجمعية 16 كرة', kind: 'count' }, { quote: 'دفعت الجمعية 13000 دج', kind: 'money' }],
  chips: [{ value: '16', label: 'كرة' }, { value: '900', label: 'دج لكرة القدم' }, { value: '700', label: 'دج للكرة الطائرة' }, { value: '13000', label: 'دج المجموع' }],
  answer: { options: ['اشترت الجمعية 9 كرات قدم و 7 كرات طائرة.', 'اشترت الجمعية 7 كرات قدم و 9 كرات طائرة.', 'اشترت الجمعية 9 كرات قدم.'], correct: 0 },
});

/** Libre — l'épicier du quartier, argent + argent (130 ; 85). */
export const GROCER = base({
  system: '3x+2y=560|x+4y=470',
  named: true,
  unknowns: [{ id: 'x', noun: 'ثمن قارورة الحليب', short: 'قارورة الحليب' }, { id: 'y', noun: 'ثمن علبة الياغورت', short: 'علبة الياغورت' }],
  items: { x: { glyph: 'milk', color: '#2563EB' }, y: { glyph: 'yogurt', color: '#DB2777' } },
  story: 'عند بقّال الحيّ: 3 قارورات حليب وعلبتا ياغورت بـ 560 دج، وقارورة حليب و 4 علب ياغورت بـ 470 دج. ما ثمن كلٍّ منهما؟',
  facts: [{ quote: '3 قارورات وعلبتان بـ 560 دج', kind: 'money' }, { quote: 'قارورة و 4 علب بـ 470 دج', kind: 'money' }],
  chips: [{ value: '3', label: 'قارورات' }, { value: '2', label: 'علبتان' }, { value: '4', label: 'علب' }, { value: '560', label: 'دج في المعلومة 1' }, { value: '470', label: 'دج في المعلومة 2' }],
  answer: { options: ['ثمن قارورة الحليب 130 دج وثمن علبة الياغورت 85 دج.', 'ثمن قارورة الحليب 85 دج وثمن علبة الياغورت 130 دج.', 'ثمن قارورة الحليب 130 دج.'], correct: 0 },
});

const shirts = {
  named: true,
  unknowns: [
    { id: 'x', noun: 'عدد القمصان بأكمام طويلة', short: 'عدد الطويلة', few: 'قمصان بأكمام طويلة', many: 'قميصًا بأكمام طويلة' },
    { id: 'y', noun: 'عدد القمصان بأكمام قصيرة', short: 'عدد القصيرة', few: 'قمصان بأكمام قصيرة', many: 'قميصًا بأكمام قصيرة' },
  ],
  countNoun: 'عدد القمصان',
  items: { x: { glyph: 'shirtLong', color: '#1D4ED8' }, y: { glyph: 'shirtShort', color: '#15803D' } },
};

/** M2 p1 — دفتر التعاونية : la jumla a une solution, l'histoire la REFUSE (−3 maillots). */
export const P1 = base({
  ...shirts,
  system: 'x+y=15|1100x+700y=17700',
  story: 'سجّلت تعاونية المتوسطة في دفترها: بِيع 15 قميصًا رياضيًا، القميص بأكمام طويلة بـ 1100 دج والقميص بأكمام قصيرة بـ 700 دج، والمداخيل 17700 دج. كم قميصًا من كل نوع بِيع؟',
  facts: [{ quote: 'بِيع 15 قميصًا', kind: 'count' }, { quote: 'المداخيل 17700 دج', kind: 'money' }],
  chips: [{ value: '15', label: 'قميصًا' }, { value: '1100', label: 'دج للطويل' }, { value: '700', label: 'دج للقصير' }, { value: '17700', label: 'دج المداخيل' }],
  answer: { options: ['بِيع 18 قميصًا بأكمام طويلة.', 'بِيع 15 قميصًا بأكمام طويلة.', 'بِيع 3 قمصان بأكمام قصيرة.'], correct: 0 },
});

/** M2 p1 entraînement — 6 maillots (7 ; −1). */
export const P1_EASY = base({
  ...shirts,
  system: 'x+y=6|1000x+600y=6400',
  story: 'سجّل نادي الحيّ في دفتره: بِيعت 6 قمصان، القميص بأكمام طويلة بـ 1000 دج والقميص بأكمام قصيرة بـ 600 دج، والمداخيل 6400 دج. كم قميصًا من كل نوع؟',
  facts: [{ quote: 'بِيعت 6 قمصان', kind: 'count' }, { quote: 'المداخيل 6400 دج', kind: 'money' }],
  chips: [{ value: '6', label: 'قمصان' }, { value: '1000', label: 'دج للطويل' }, { value: '600', label: 'دج للقصير' }, { value: '6400', label: 'دج المداخيل' }],
  answer: { options: ['بِيعت 7 قمصان بأكمام طويلة.', 'بِيعت 6 قمصان بأكمام طويلة.', 'بِيع قميص قصير واحد.'], correct: 0 },
});

/** Libre M2 — la FRACTION (29/4 ; 11/4) : l'autre façon dont une histoire refuse, rencontrée librement (verdict L3.3). */
export const FRACTION = base({
  ...shirts,
  system: 'x+y=10|1100x+700y=9900',
  story: 'سُجّل في دفتر آخر: بِيعت 10 قمصان، القميص بأكمام طويلة بـ 1100 دج والقميص بأكمام قصيرة بـ 700 دج، والمداخيل 9900 دج. كم قميصًا من كل نوع؟',
  facts: [{ quote: 'بِيعت 10 قمصان', kind: 'count' }, { quote: 'المداخيل 9900 دج', kind: 'money' }],
  chips: [{ value: '10', label: 'قمصان' }, { value: '1100', label: 'دج للطويل' }, { value: '700', label: 'دج للقصير' }, { value: '9900', label: 'دج المداخيل' }],
  answer: { options: ['بِيع 7 قمصان بأكمام طويلة.', 'بِيعت 10 قمصان بأكمام طويلة.', 'بِيعت 3 قمصان بأكمام قصيرة.'], correct: 0 },
});

/** Les prédictions : leur CLÉ et la place de la bonne option (elle varie d'une manche à l'autre) ; la vérité est calculée par le labo. */
export const PREDICT = { r2: [{ key: 'dearer', pos: 0 }], p1: [{ key: 'which', pos: 0 }] };

const help = 'جرّب أوّلًا قصة أصغر، ثم عُد.';
const choice = (id, label, props) => ({ id, label, props });

export const M1_FREE = [choice('r1', 'نادي الرسم', R1), choice('r2', 'مكتبة الحيّ', R2), choice('star', 'معرض الكتب', STAR), choice('balls', 'كرات الجمعية', BALLS), choice('grocer', 'بقّال الحيّ', GROCER)];
export const M2_FREE = [choice('p1', 'دفتر التعاونية', P1), choice('fraction', 'دفتر آخر', FRACTION), choice('r2', 'مكتبة الحيّ', R2)];

export const M1_ROUNDS = [
  {
    id: 'r1', title: 'نادي الرسم', goal: [{ modelOk: true }, { checkpoint: 'solveTyped' }, { checkpoint: 'buildCheck' }, { checkpoint: 'answerWhy' }],
    stars: { maxTrials: 3, predict: false }, helpAfterRefusals: 3,
    easier: { goal: [{ modelOk: true }, { checkpoint: 'answerWhy' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: { ...R1_EASY, chains: 'easyFirst', lead: 'نادي الرسم مرّة أخرى، بأعداد أصغر.', mission: 'ترجم القصة، حلّ الجملة، ثم أعد القصة بالعددين.' } },
    props: { ...R1, chains: 'first', freeFirstModel: true, lead: 'قصة نادي الرسم.', mission: 'كم قلم تلوين وكم قلم رصاص؟ اختر المجهولين أوّلًا، ثم ترجم القصة بجملة.' },
  },
  {
    id: 'r2', title: 'مكتبة الحيّ', goal: [{ modelOk: true }, { checkpoint: 'solveTyped' }, { checkpoint: 'verifySwap' }, { checkpoint: 'buildAnswer' }, { checkpoint: 'rule' }],
    stars: { maxTrials: 3 }, helpAfterRefusals: 3,
    easier: { goal: [{ modelOk: true }, { checkpoint: 'rule' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: { ...R2_EASY, chains: 'easySecond', lead: 'مكتبة الحيّ مرّة أخرى، بأعداد أصغر.', mission: 'ترجم المعلومتين، حلّ الجملة، ثم أعد القصة بالثمنين.' } },
    props: { ...R2, chains: 'second', predict: PREDICT.r2, lead: 'قصة مكتبة الحيّ: لا عدّ هنا، المعلومتان مبلغان.', mission: 'ما ثمن الكرّاس وما ثمن القلم؟ ترجم كل معلومة بمعادلة.' },
  },
  {
    id: 'star', optional: true, title: 'تحدٍّ: معرض الكتب', goal: [{ modelOk: true }, { discovered: true }], stars: { maxTrials: 2, predict: false },
    props: { ...STAR, chains: 'none', lead: 'تحدٍّ: معرض الكتب.', mission: 'كم كتابًا باع الجناح من كل ثمن؟ في محاولتين على الأكثر.' },
  },
  {
    id: 'free', free: true, title: 'قصص حرّة',
    props: { ...R1, chains: 'none', checkpoints: false, choices: M1_FREE, lead: 'قصص حرّة: اختر قصة.', mission: 'ترجم القصة وحلّها وأعدها كما تشاء.' },
  },
];

export const M2_ROUNDS = [
  {
    id: 'p1', title: 'دفتر التعاونية', goal: [{ modelOk: true }, { checkpoint: 'naturalTap' }, { checkpoint: 'refuseTap' }, { checkpoint: 'ruleNatural' }],
    stars: { maxTrials: 3 }, helpAfterRefusals: 3,
    easier: { goal: [{ modelOk: true }, { checkpoint: 'ruleNatural' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: { ...P1_EASY, chains: 'impossibleEasy', lead: 'دفتر نادي الحيّ، بأعداد أصغر.', mission: 'ترجم الدفتر، حلّ الجملة، ثم أعد القصة بالعددين.' } },
    props: { ...P1, chains: 'impossible', predict: PREDICT.p1, lead: 'دفتر تعاونية المتوسطة.', mission: 'كم قميصًا من كل نوع؟ ترجم ما سجّله الدفتر، حلّ، ثم أعد القصة.' },
  },
  {
    id: 'free', free: true, title: 'دفاتر حرّة',
    props: { ...P1, chains: 'none', checkpoints: false, choices: M2_FREE, lead: 'دفاتر وقصص حرّة: اختر واحدة.', mission: 'ترجم، حلّ، ثم أعد القصة: هل تقبل القصة العددين؟' },
  },
];
