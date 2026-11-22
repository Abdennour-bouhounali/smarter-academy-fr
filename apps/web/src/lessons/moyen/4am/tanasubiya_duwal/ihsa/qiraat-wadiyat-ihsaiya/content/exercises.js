/**
 * Les exercices du manuel destinés au درس 4 « ترييض وقراءة وضعيات إحصائية وتفسير المؤشرات » —
 * extraction › destinations : ex-14 (p. 99, أوظّف تعلّماتي), ex-19 et ex-22 (p. 101, أتعمّق). Énoncés au mot
 * près ; une question longue du manuel est découpée en interactions vérifiables (chaque morceau cite le
 * même élément). Puis les exercices de transfert de la plateforme (module 4, `addition('interaction_generation')`),
 * en contextes de la vie d'un élève algérien. Chaque réponse est recalculée en commentaire.
 */
import { src, addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_qiraat-wadiyat-ihsaiya_P1',
  P2: '4am_qiraat-wadiyat-ihsaiya_P2',
  P3: '4am_qiraat-wadiyat-ihsaiya_P3',
};

const S14 = src('ex-14', 99, 'أوظّف تعلّماتي', 14);
const S19 = src('ex-19', 101, 'أتعمّق', 19);
const S22 = src('ex-22', 101, 'أتعمّق', 22);
const GEN = addition('interaction_generation');

/** ex-14 — le tableau des deux villes (au mot près), rendu par le module (components/DataTable). */
export const EX14_TABLE = {
  head: ['الشهر', 'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  rows: [
    ['المدينة «أ»', '-3', '-7', '-2', '10', '10', '20', '24', '28', '21', '11', '5', '-3'],
    ['المدينة «ب»', '6', '8', '10', '14', '16', '19', '20', '22', '17', '14', '8', '5'],
  ],
};
/** ex-19 — le مخطط بالأعمدة du manuel (au mot près), rendu par components/BarChart. */
export const EX19_CHART = {
  axis: 'عدد الأشخاص',
  bars: [
    { label: 'القناتان A و B', value: 950 },
    { label: 'القناتان B و D', value: 1250 },
    { label: 'القناة C', value: 350 },
    { label: 'القناة D', value: 700 },
    { label: 'القناة E', value: 450 },
  ],
  yMax: 1300, step: 50, labelEvery: 2,
};

export const EXERCISES = [
  {
    // A : somme 114 → 114 ÷ 12 = 9,5 ; rangée −7, −3, −3, −2, 5, 10, 10, 11, 20, 21, 24, 28 → médiane 10 ; étendue 28 − (−7) = 35
    id: 'ex14-a', source: S14, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'يبيّن الجدول التالي متوسط درجات الحرارة الشهرية على مدار سنة في مدينتين «أ» و «ب» (الوحدة °C). عيّن لكل من المدينتين متوسطا، وسيطا ، مدى درجات الحرارة. فسّر هذه النتائج.',
    interaction: 'batch',
    question: {
      prompt: 'المدينة «أ»:',
      rows: [
        { label: 'المتوسط', options: ['$9{,}5$', '$11{,}75$', '$10$'], correct: 0, correction: 'مجموع القيم 114 (مع القيم السالبة): $\\dfrac{114}{12} = 9{,}5$ .' },
        { label: 'الوسيط', options: ['$10$', '$20$', '$9{,}5$'], correct: 0, correction: 'بعد الترتيب: −7 ، −3 ، −3 ، −2 ، 5 ، 10 ، 10 ، 11 … ؛ القيمتان ذواتا الرتبتين 6 و 7 هما 10 و 10: الوسيط 10.' },
        { label: 'المدى', options: ['$35$', '$28$', '$21$'], correct: 0, correction: '$28 - (-7) = 35$ .' },
      ],
    },
    commonError: 'نسيان إشارة القيم السالبة: المدى $28 - (-7) = 35$ وليس $28 - 7 = 21$ .',
  },
  {
    // B : somme 159 → 13,25 ; rangée 5, 6, 8, 8, 10, 14, 14, 16, 17, 19, 20, 22 → 14 ; 22 − 5 = 17
    id: 'ex14-b', source: S14, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'المدينة «ب»: احسب المتوسط (عدد عشري).',
    interaction: 'numeric',
    question: { expected: 13.25, display: '13,25', explain: '$\\dfrac{6 + 8 + 10 + 14 + 16 + 19 + 20 + 22 + 17 + 14 + 8 + 5}{12} = \\dfrac{159}{12} = 13{,}25$ ؛ والوسيط 14 والمدى $22 - 5 = 17$ .' },
  },
  {
    id: 'ex14-c', source: S14, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'فسّر هذه النتائج: المدينة «أ» (المتوسط $9{,}5$ ، الوسيط 10، المدى 35) والمدينة «ب» (المتوسط $13{,}25$ ، الوسيط 14، المدى 17).',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'المدينة «ب» أدفأ في المتوسط وفي الوسيط.', answer: true, why: '$13{,}25 > 9{,}5$ و $14 > 10$ .' },
        { text: 'درجات حرارة المدينة «ب» أكثر تشتتا.', answer: false, why: 'مدى «ب» 17 ومدى «أ» 35: حرارة «أ» هي الأكثر تباعدا بين الشتاء والصيف.' },
        { text: 'يكفي المتوسط وحده لوصف الفرق بين مناخي المدينتين.', answer: false, why: 'المتوسط يقول «أين» تتمركز الحرارة؛ المدى يقول إن «أ» أكثر تفاوتا (شتاء بارد جدا وصيف حار).' },
      ],
    },
    commonError: 'الحكم بالمتوسط وحده دون مؤشر التشتت (المدى).',
  },
  {
    // D = 700 ; B = 1250 − 700 = 550 ; A = 950 − 550 = 400
    id: 'ex19-a', source: S19, learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'يمثّل المخطط بالأعمدة التالي توزيع مجموعة أشخاص حسب القنوات التلفزيونية التي شاهدوها في نهاية الأسبوع. انقل ثم أتمم الجدول التالي: (السطر «عدد الأشخاص»)',
    interaction: 'batch',
    question: {
      prompt: 'عدد الأشخاص لكل قناة:',
      rows: [
        { label: 'القناة D', options: ['$700$', '$1250$', '$550$'], correct: 0, correction: 'عمود «القناة D» يصل إلى 700.' },
        { label: 'القناة B', options: ['$1250$', '$550$', '$950$'], correct: 1, correction: 'عمود «القناتان B و D» = 1250 يجمع القناتين: $B = 1250 - 700 = 550$ .' },
        { label: 'القناة A', options: ['$950$', '$400$', '$550$'], correct: 1, correction: 'عمود «القناتان A و B» = 950: $A = 950 - 550 = 400$ .' },
      ],
    },
    commonError: 'نقل ارتفاع عمود «القناتان B و D» (1250) إلى خانة القناة B وحدها.',
  },
  {
    // 400 + 550 + 350 + 700 + 450 = 2450
    id: 'ex19-b', source: S19, learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ما هو التكرار الكلي (عدد الأشخاص في القنوات الخمس)؟',
    interaction: 'numeric',
    question: { expected: 2450, display: '2450', explain: '$400 + 550 + 350 + 700 + 450 = 2450$ . لا نجمع أطوال الأعمدة كما هي ($950 + 1250 + 350 + 700 + 450 = 3700$) لأن القناة B محسوبة مرّتين.' },
    commonError: 'جمع ارتفاعات الأعمدة الخمسة (3700): العمودان الأوّلان يحسبان القناة B مرّتين.',
  },
  {
    // 400/2450 = 8/49 ; D 700/2450 = 2/7 ; cumul C : (400 + 550 + 350)/2450 = 1300/2450 = 26/49
    id: 'ex19-c', source: S19, learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'أتمم سطري التواتر والتواتر المجمع الصاعد:',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'تواتر القناة A', options: ['$\\dfrac{8}{49}$', '$\\dfrac{4}{37}$', '$\\dfrac{400}{100}$'], correct: 0, correction: '$\\dfrac{400}{2450} = \\dfrac{8}{49}$ .' },
        { label: 'تواتر القناة D', options: ['$\\dfrac{7}{37}$', '$\\dfrac{2}{7}$', '$\\dfrac{1}{2}$'], correct: 1, correction: '$\\dfrac{700}{2450} = \\dfrac{2}{7}$ .' },
        { label: 'التواتر المجمع الصاعد للقناة C', options: ['$\\dfrac{1}{7}$', '$\\dfrac{26}{49}$', '$\\dfrac{19}{49}$'], correct: 1, correction: '$\\dfrac{400 + 550 + 350}{2450} = \\dfrac{1300}{2450} = \\dfrac{26}{49}$ .' },
        { label: 'التواتر المجمع الصاعد للقناة E', options: ['$1$', '$\\dfrac{9}{49}$', '$\\dfrac{40}{49}$'], correct: 0, correction: 'آخر تواتر مجمع صاعد هو دائما 1.' },
      ],
    },
  },
  {
    // (11,5N − 4 − 19) ÷ (N − 2) = 11,5 car 4 + 19 = 23 = 2 × 11,5 ; la médiane ne bouge pas
    id: 'ex22-a', source: S22, learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'معدل سلسلة علامات قسم في اختبار هو 11,5 و وسيطها 11. أ) حذفت أصغر علامة وهي 4 التي تحصّل عليها تلميذ واحد وأكبر علامة وهي 19 التي تحصل عليها كذلك تلميذ واحد. ما هو معدل العلامات و وسيطها بعد هذا الحذف؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'المعدّل بعد الحذف', options: ['$11{,}5$', '$11$', '$11{,}25$'], correct: 0, correction: '$4 + 19 = 23 = 2 \\times 11{,}5$ : نحذف مجموع قيمتين متوسطهما 11,5، فيبقى المعدّل $\\dfrac{11{,}5N - 23}{N - 2} = 11{,}5$ .' },
        { label: 'الوسيط بعد الحذف', options: ['$11$', '$11{,}5$', 'لا يمكن معرفته'], correct: 0, correction: 'حذفنا قيمة من أسفل السلسلة المرتبة وقيمة من أعلاها: يبقى العدد نفسه من كل جهة، فالوسيط 11.' },
      ],
    },
    commonError: 'الظنّ أن حذف قيمة متطرفة يغيّر الوسيط: الوسيط يتعلّق بالرتب.',
  },
  {
    // 11,5N − 19 = 11,25(N − 1) ⇔ 0,25N = 7,75 ⇔ N = 31
    id: 'ex22-b', source: S22, learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'ب) حذفت فقط أكبر علامة وهي 19 التي تحصّل عليها تلميذ واحد وأصبح معدل العلامات 11,25. ما هو عدد تلاميذ هذا القسم؟',
    interaction: 'numeric',
    question: { expected: 31, display: '31', explain: 'مجموع العلامات $11{,}5N$ ، وبعد الحذف $11{,}5N - 19 = 11{,}25(N - 1)$ أي $11{,}5N - 11{,}25N = 19 - 11{,}25$ ، $0{,}25N = 7{,}75$ ومنه $N = 31$ تلميذا.' },
    commonError: 'نسيان أن التكرار الكلي ينقص أيضا: نقسم على $N - 1$ بعد الحذف.',
  },

  /* ── module 4 — transfert (plateforme) ─────────────────────────────── */
  {
    // 3 h 2 h 5 h 4 h 6 h → filles ; 1, 2, 2, 9, 1 → garçons. F : moyenne 4, étendue 4 ; G : moyenne 3, étendue 8, médiane 2
    id: 'ecran', source: GEN, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'سجّلت ريم ومراد، حرصًا على احترام وقتهما، مدّة استعمال الهاتف (بالساعات) خلال 5 أيام. ريم: 3 ، 2 ، 5 ، 4 ، 6. مراد: 1 ، 2 ، 2 ، 9 ، 1.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'متوسط ريم', options: ['$4$', '$5$', '$3{,}5$'], correct: 0, correction: '$\\dfrac{3 + 2 + 5 + 4 + 6}{5} = \\dfrac{20}{5} = 4$ .' },
        { label: 'متوسط مراد', options: ['$3$', '$2$', '$9$'], correct: 0, correction: '$\\dfrac{1 + 2 + 2 + 9 + 1}{5} = \\dfrac{15}{5} = 3$ .' },
        { label: 'وسيط مراد', options: ['$2$', '$3$', '$1$'], correct: 0, correction: 'بعد الترتيب 1 ، 1 ، 2 ، 2 ، 9: الوسيط 2. اليوم 9 ساعات يرفع المتوسط لا الوسيط.' },
        { label: 'الأكثر تشتتا', options: ['ريم (المدى 4)', 'مراد (المدى 8)'], correct: 1, correction: 'مدى مراد $9 - 1 = 8$ ومدى ريم $6 - 2 = 4$ .' },
      ],
    },
    commonError: 'الحكم على مراد بمتوسطه 3 وحده: يوم واحد بـ 9 ساعات يرفع المتوسط، والوسيط 2 يصف أيامه العادية.',
  },
  {
    // 120 × 400 + 80 × 650 = 48000 + 52000 = 100000 ; 100000 ÷ 200 = 500
    id: 'derby', source: GEN, learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'في دربي العاصمة باع نادٍ، في أجواء من الروح الرياضية، تذاكر في جناحين: 120 تذكرة بمتوسط 400DA و 80 تذكرة بمتوسط 650DA. ما متوسط ثمن التذكرة في الجناحين معا (بالدينار)؟',
    interaction: 'numeric',
    question: { expected: 500, display: '500', explain: '$\\dfrac{120 \\times 400 + 80 \\times 650}{120 + 80} = \\dfrac{48000 + 52000}{200} = \\dfrac{100000}{200} = 500$ DA ، وليس متوسط المتوسطين $525$ .' },
    commonError: 'حساب $\\dfrac{400 + 650}{2} = 525$ : عدد التذاكر في الجناحين مختلف.',
  },
  {
    // plage : 120, 150, 90, 600 (pont férié), 140 → moyenne 220, médiane 140
    id: 'shati', source: GEN, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'جمع متطوّعو حملة تنظيف الشاطئ عدد القارورات البلاستيكية في 5 أيام: 120 ، 150 ، 90 ، 600 ، 140 (اليوم الرابع بعد عطلة نهاية الأسبوع). أيّ مؤشر يصف أفضل يومًا عاديًا؟',
    interaction: 'choice',
    question: {
      options: ['الوسيط 140', 'المتوسط 220', 'المدى 510', 'أكبر قيمة 600'],
      correct: 0, cols: 2,
      explain: 'المتوسط $\\dfrac{1100}{5} = 220$ ترفعه القيمة المتطرفة 600؛ بعد الترتيب 90 ، 120 ، 140 ، 150 ، 600 الوسيط 140 لا يتأثر بها.',
    },
    commonError: 'اختيار المتوسط دائما: قيمة متطرفة واحدة تجذبه.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
