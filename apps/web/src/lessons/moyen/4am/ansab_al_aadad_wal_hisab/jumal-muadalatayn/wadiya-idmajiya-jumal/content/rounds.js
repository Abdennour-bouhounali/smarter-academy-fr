/**
 * LES MANCHES du module 7 « وضعية الوحدة » dans le lecteur de mission (la synthèse de l'unité 5, 2026-11-12 ; recette PROVISOIRE de la synthèse,
 * point 5) : les deux ressources `story-modeller` du module (« رحلة القسم » مبتدئ, « حفل » متقدم) jouées en MANCHES sur le lecteur de la leçon 3
 * (`systems/StoryModellerPlayer.jsx`), sur des nombres FRÈRES du حفل : deux informations d'ARGENT, la première aux deux quantités ÉGALES.
 * Jamais les nombres du حفل (le défi 🏆 les résout) ni la part de gâteau à 50 دج (le prix TROUVÉ par le défi) : content/forbidden.js.
 *
 *   r1  رحلة القسم (à la main) : 10 + 10 pour 550 دج, puis 5 علب et 3 قطع pour 235 دج → (35 ; 20). La ligne 2x = 70 est TAPÉE avant d'être
 *       vue ; l'échange (20 ; 35) PASSE l'information aux quantités égales et ne tombe qu'à la seconde (verifySwap) ; la phrase-réponse se BÂTIT.
 *   r2  حفل المدرسة (les inconnues à nommer) : 120 + 120 pour 8400 دج, puis 9 علب et 14 قطعة pour 780 دج → (40 ; 30) ; finit sur la
 *       construction NUMÉRIQUE « 120 × (40 + 30) = 8400 » (leurre 70 = 8400 ÷ 120 : le facteur oublié) — le phénomène du حفل sans ses nombres.
 *   Entraînements (ils LIBÈRENT leur manche) : r1 → 4 + 4 pour 240 دج, 3 علب et 2 قطع pour 160 دج → (40 ; 20) ; r2 → 20 + 20 pour 900 دج,
 *   3 علب et 5 قطع pour 165 دج → (30 ; 15). Le terrain libre rejoue r1 et r2.
 * Collisions (verdict X3–X4 de l'unité) : aucune jumla d'une leçon de l'unité, aucun couple HEADLINE — content/mission.test.js. Prix en « دج ».
 */
const base = (extra) => ({ type: 'story-modeller', theme: 'party', levels: false, startWith: 'model', ...extra });

const PRICES = {
  unknowns: [
    { id: 'x', noun: 'سعر علبة العصير', short: 'العلبة' },
    { id: 'y', noun: 'سعر قطعة الحلوى', short: 'القطعة' },
  ],
  items: { x: { glyph: 'juice', color: '#EA580C' }, y: { glyph: 'cake', color: '#DB2777' } },
};
const answer = (x, y, third) => ({
  options: [`سعر علبة العصير ${x} دج وسعر قطعة الحلوى ${y} دج.`, `سعر علبة العصير ${y} دج وسعر قطعة الحلوى ${x} دج.`, third],
  correct: 0,
});

/** r1 — رحلة القسم, à la main (les inconnues déjà nommées : le module 7 les fait choisir au crayon puis dans r2). */
export const TRIP = base({
  ...PRICES,
  system: '10x+10y=550|5x+3y=235',
  named: true,
  story: 'قبل رحلة القسم اشترى المندوب 10 علب عصير و 10 قطع حلوى ودفع 550 دج. في طريق العودة بقيت 5 علب عصير و 3 قطع حلوى ثمنها معًا 235 دج. ما سعر علبة العصير وما سعر قطعة الحلوى؟',
  facts: [{ quote: '10 علب عصير و 10 قطع حلوى بـ 550 دج', kind: 'money' }, { quote: 'بقيت 5 علب و 3 قطع ثمنها 235 دج', kind: 'money' }],
  chips: [
    { value: '10', label: 'علب عصير' }, { value: '10', label: 'قطع حلوى' }, { value: '550', label: 'دج المدفوعة' },
    { value: '5', label: 'علب بقيت' }, { value: '3', label: 'قطع بقيت' }, { value: '235', label: 'دج ثمن ما بقي' },
  ],
  answer: answer(35, 20, 'سعر علبة العصير 35 دج.'),
});

/** r1 entraînement — une sortie plus petite (les quantités égales d'abord, comme r1). */
export const TRIP_EASY = base({
  ...PRICES,
  system: '4x+4y=240|3x+2y=160',
  named: true,
  story: 'اشترى نادي القراءة 4 علب عصير و 4 قطع حلوى بـ 240 دج، ثم اشترى 3 علب عصير وقطعتي حلوى بـ 160 دج. ما سعر علبة العصير وما سعر قطعة الحلوى؟',
  facts: [{ quote: '4 علب و 4 قطع بـ 240 دج', kind: 'money' }, { quote: '3 علب وقطعتان بـ 160 دج', kind: 'money' }],
  chips: [
    { value: '4', label: 'علب عصير' }, { value: '4', label: 'قطع حلوى' }, { value: '240', label: 'دج المرّة الأولى' },
    { value: '3', label: 'علب عصير' }, { value: '2', label: 'قطعتا حلوى' }, { value: '160', label: 'دج المرّة الثانية' },
  ],
  answer: answer(40, 20, 'سعر علبة العصير 40 دج.'),
});

/** r2 — حفل المدرسة : les inconnues À NOMMER (`named: false`), de grands nombres égaux qui appellent la division. */
export const PARTY = base({
  ...PRICES,
  system: '120x+120y=8400|9x+14y=780',
  named: false,
  story: 'لحفل نهاية السنة اشترت المدرسة 120 علبة عصير و 120 قطعة حلوى بـ 8400 دج. بعد الحفل بقيت 9 علب عصير و 14 قطعة حلوى ثمنها معًا 780 دج. ما سعر علبة العصير وما سعر قطعة الحلوى؟',
  facts: [{ quote: '120 علبة و 120 قطعة بـ 8400 دج', kind: 'money' }, { quote: 'بقيت 9 علب و 14 قطعة ثمنها 780 دج', kind: 'money' }],
  chips: [
    { value: '120', label: 'علبة عصير' }, { value: '120', label: 'قطعة حلوى' }, { value: '8400', label: 'دج المدفوعة' },
    { value: '9', label: 'علب بقيت' }, { value: '14', label: 'قطعة بقيت' }, { value: '780', label: 'دج ثمن ما بقي' },
  ],
  answer: answer(40, 30, 'مجموع السعرين 70 دج، ولا نعرف كل سعر وحده.'),
});

/** r2 entraînement — une fête plus petite, les inconnues déjà nommées. */
export const PARTY_EASY = base({
  ...PRICES,
  system: '20x+20y=900|3x+5y=165',
  named: true,
  story: 'لحفل القسم اشترى المندوب 20 علبة عصير و 20 قطعة حلوى بـ 900 دج. بعد الحفل بقيت 3 علب عصير و 5 قطع حلوى ثمنها معًا 165 دج. ما سعر علبة العصير وما سعر قطعة الحلوى؟',
  facts: [{ quote: '20 علبة و 20 قطعة بـ 900 دج', kind: 'money' }, { quote: 'بقيت 3 علب و 5 قطع ثمنها 165 دج', kind: 'money' }],
  chips: [
    { value: '20', label: 'علبة عصير' }, { value: '20', label: 'قطعة حلوى' }, { value: '900', label: 'دج المدفوعة' },
    { value: '3', label: 'علب بقيت' }, { value: '5', label: 'قطع بقيت' }, { value: '165', label: 'دج ثمن ما بقي' },
  ],
  answer: answer(30, 15, 'مجموع السعرين 45 دج، ولا نعرف كل سعر وحده.'),
});

const help = 'جرّب أوّلًا قصة أصغر، ثم عُد.';
const choice = (id, label, props) => ({ id, label, props });
export const FREE = [choice('r1', 'رحلة القسم', TRIP), choice('r2', 'حفل المدرسة', PARTY)];

export const M7_ROUNDS = [
  {
    id: 'r1', title: 'رحلة القسم', goal: [{ modelOk: true }, { checkpoint: 'solveTyped' }, { checkpoint: 'verifySwap' }, { checkpoint: 'buildAnswer' }],
    stars: { maxTrials: 3, predict: false }, helpAfterRefusals: 3,
    easier: { goal: [{ modelOk: true }, { checkpoint: 'answerWhy' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: { ...TRIP_EASY, chains: 'easyFirst', lead: 'قصة أصغر: نادي القراءة.', mission: 'ترجم المعلومتين، حلّ الجملة، ثم أعد القصة بالسعرين.' } },
    props: { ...TRIP, chains: 'synthTrip', freeFirstModel: true, lead: 'قصة رحلة القسم: مبلغان، لا عدّ.', mission: 'ما سعر علبة العصير وما سعر قطعة الحلوى؟ ترجم كل معلومة بمعادلة.' },
  },
  {
    id: 'r2', title: 'حفل المدرسة', goal: [{ modelOk: true }, { checkpoint: 'buildSum' }],
    stars: { maxTrials: 3, predict: false }, helpAfterRefusals: 3,
    easier: { goal: [{ modelOk: true }, { checkpoint: 'buildSum' }], helpLine: help, releases: true, stars: { maxTrials: 3, predict: false },
      props: { ...PARTY_EASY, chains: 'synthParty', lead: 'حفل أصغر: حفل القسم.', mission: 'ترجم، حلّ، أعد القصة، ثم ابنِ سطر المعلومة الأولى.' } },
    props: { ...PARTY, chains: 'synthParty', lead: 'حفل المدرسة: أعداد كبيرة.', mission: 'سمِّ المجهولين أوّلًا، ثم ترجم القصة وحلّها.' },
  },
  {
    id: 'free', free: true, title: 'قصص حرّة',
    props: { ...TRIP, chains: 'none', checkpoints: false, choices: FREE, lead: 'قصص حرّة: اختر قصة.', mission: 'ترجم القصة وحلّها وأعدها كما تشاء.' },
  },
];
