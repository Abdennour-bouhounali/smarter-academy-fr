import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — le « أستعدّ » du manuel (p. 55, items 1–10) est réparti
 * entre les leçons 1 et 2 (extraction › destinations › prep) : la synthèse n'en
 * reçoit aucun. Ses affirmations sont donc des AFFIRMATIONS DE LA PLATEFORME
 * (SourceTag « عبارة إضافية من المنصّة »), dans la forme du manuel, sur ce que la
 * situation mobilise : une équation à deux inconnues et la
 * solution d'une جملة (درس 1), la substitution et l'addition (درس 2), la
 * traduction d'un texte et la vérification dans le texte (درس 3), et le
 * pourcentage (années précédentes). Jamais les nombres du حفل.
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'mafhum', text: '$x - 4y = 3$ معادلة من الدرجة الأولى بمجهولين $x$ و $y$.', answer: true,
    why: 'فيها مجهولان $x$ و $y$ ، كلّ منهما من الدرجة الأولى (لا مربّع ولا جداء بينهما).', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'hall', text: 'الثنائية $(4 ; 1)$ حل للجملة $\\begin{cases} x + y = 5 \\\\ x - y = 2 \\end{cases}$', answer: false,
    why: '$4 + 1 = 5$ صحيحة، لكن $4 - 1 = 3$ وليس 2: الثنائية تحقق المعادلة الأولى فقط، وحل الجملة يحقق المعادلتين في آن واحد.', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'tawid', text: 'من المعادلة $2x + y = 9$ ينتج $y = 9 + 2x$.', answer: false,
    why: 'ننقل $2x$ إلى الطرف الآخر بتغيير إشارته: $y = 9 - 2x$.', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'jam', text: 'بجمع المعادلتين $3x + 2y = 12$ و $5x - 2y = 4$ طرفا بطرف نحصل على $8x = 16$.', answer: true,
    why: 'المعاملان $2$ و $-2$ متعاكسان فيختفي $y$ : $3x + 5x = 8x$ و $12 + 4 = 16$.', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'tarjama', text: 'ثمن 3 أقلام و 2 كراريس هو 190 دج. إذا كان $x$ ثمن القلم و $y$ ثمن الكراس فإنّ $2x + 3y = 190$.', answer: false,
    why: 'كل عدد يُضرب في ثمن الشيء الذي يعدّه: 3 أقلام ثمنها $3x$ و 2 كراريس ثمنها $2y$ ، أي $3x + 2y = 190$.', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'tahaqquq', text: 'نبحث عن عدد البنات وعدد الأولاد في قسم: يمكن أن يكون الجواب الثنائية $(12{,}5 ; 17{,}5)$.', answer: false,
    why: 'عدد التلاميذ عدد طبيعي: إذا وجدنا $12{,}5$ فهناك خطأ في الترييض أو في الحساب، فنعود إلى النص ونتحقق.', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'nisba', text: 'تخفيض بـ 10% على ثمن قدره 500 دج يجعله 450 دج.', answer: true,
    why: 'بعد تخفيض 10% ندفع 90% من الثمن: $500 \\times 0{,}9 = 450$.', source: addition('prerequisite_diagnostic') },
];

/**
 * « أدمج تعلّماتي » (p. 62) — la وضعية du حفل البلدية, au mot près, et son
 * « تحليل الوضعية » en trois étapes NOMMÉES par le manuel (gardées telles
 * quelles, chacune avec ses questions du livre). La photographie n'existe pas
 * dans le manuel : la vignette (components/JumalFigures.jsx › PartyScene) est
 * un dessin décoratif de la plateforme.
 */
export const SITUATION = {
  source: src('situation', 62, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: 'بمناسبة الاحتفال بالمولد النبوي الشريف، نظمت بلدية حفل استقبال لفائدة التلاميذ النجباء للمؤسسات التعليمية التابعة لها، حضره ممثلون عن قطاع التربية وبعض الأولياء. بهذه المناسبة، اقتنت البلدية 150 علبة عصير برتقال و 150 قطعة حلوى متماثلة ودفعت 11250 دج لكل المصاريف. في نهاية الحفل، بقيت 24 علبة عصير و30 قطعة حلوى ثمنها معا 2100 دج. ما هو سعر علبة عصير وسعر قطعة حلوى؟',
  intro: 'بمناسبة الاحتفال بالمولد النبوي الشريف، نظمت بلدية حفل استقبال لفائدة التلاميذ النجباء للمؤسسات التعليمية التابعة لها، حضره ممثلون عن قطاع التربية وبعض الأولياء.',
  fact1: 'بهذه المناسبة، اقتنت البلدية 150 علبة عصير برتقال و 150 قطعة حلوى متماثلة ودفعت 11250 دج لكل المصاريف.',
  fact2: 'في نهاية الحفل، بقيت 24 علبة عصير و30 قطعة حلوى ثمنها معا 2100 دج.',
  question: 'ما هو سعر علبة عصير وسعر قطعة حلوى؟',
  caption: 'حفل البلدية',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'قراءة نص المشكل وتحديد المعطيات والمطلوب. كيف تجد روابط بين المعطيات والمفاهيم الرياضية المناسبة والمكتسبة.' },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', text: 'ماهي المهمة المطلوب إنجازها؟ كيف يتم ذلك؟ ماذا يلزمك لترييض الوضعية؟ ماهي الموارد الرياضية (معارف وإجراءات) التي تسمح بحل هذه الوضعية؟' },
    { label: 'تنفيذ استراتيجية الحل المختارة', text: 'ترييض الوضعية باختيار المجاهيل المناسبة وكتابة جملة المعادلتين التي تعبر عن هذه المعطيات. اختيار طريقة حل وتطبيقها. التحقق من صحة الحل وتحرير الإجابة المناسبة.' },
  ],
  // Les nombres de la situation : la plateforme ne les retape nulle part ailleurs.
  numbers: { bought: 150, paid: 11250, juiceLeft: 24, cakesLeft: 30, leftCost: 2100 },
};

/**
 * Le niveau مبتدئ du laboratoire (module 7) : une commande de la PLATEFORME
 * (déclarée, `platform_context`), MÊME structure que le حفل — deux informations
 * d'ARGENT avec des quantités différentes (autant de jus que de gâteaux, puis ce
 * qui reste) — avec de petits nombres et des prix entiers (30 et 50 دج). Elle
 * sert aussi les étapes « حل الجملة » et « التحقق » du module 7, pour que la
 * réponse du manuel (25 دج et 50 دج) reste celle de « أحلّ الوضعية ».
 */
export const WARMUP = {
  source: addition('interaction_generation'),
  text: 'قبل رحلة القسم إلى حديقة التجارب بالحامة، وقد تعاهد التلاميذ على المحافظة على نظافتها، طلب مندوب القسم 10 علب عصير و 10 قطع حلوى متماثلة ودفع 800 دج. في طريق العودة بقيت 2 علب عصير و 3 قطع حلوى ثمنها معا 210 دج. ما هو سعر علبة عصير وسعر قطعة حلوى؟',
  numbers: { bought: 10, paid: 800, juiceLeft: 2, cakesLeft: 3, leftCost: 210 },
  system: '$\\begin{cases} 10x + 10y = 800 \\\\ 2x + 3y = 210 \\end{cases}$',
};

const UNKNOWNS = [{ id: 'x', noun: 'سعر علبة العصير' }, { id: 'y', noun: 'سعر قطعة الحلوى' }];

/**
 * Les props du laboratoire story-modeller du module 7, à ses DEUX niveaux
 * (contrat des props : brief de l'unité 5 §5, manipulations/systems/StoryModeller.jsx).
 * Écrites ici une fois : le module les étale, le test de rendu (lab.render.test.jsx)
 * rend le laboratoire avec exactement ces props. Deux informations d'ARGENT
 * (`kind: 'money'`), chacune avec ses quantités : la première n'est pas un
 * « nombre de personnes ». La réponse de l'étape 5 : l'option 0.
 */
export const LAB = {
  beginner: {
    system: '10x+10y=800|2x+3y=210',
    theme: 'party',
    unknowns: UNKNOWNS,
    named: true,
    facts: [
      { quote: 'طلب مندوب القسم 10 علب عصير و 10 قطع حلوى متماثلة ودفع 800 دج', kind: 'money' },
      { quote: 'بقيت 2 علب عصير و 3 قطع حلوى ثمنها معا 210 دج', kind: 'money' },
    ],
    chips: [
      { value: '10', label: 'علب عصير' }, { value: '10', label: 'قطع حلوى' }, { value: '800', label: 'دج المبلغ المدفوع' },
      { value: '2', label: 'علب عصير بقيت' }, { value: '3', label: 'قطع حلوى بقيت' }, { value: '210', label: 'دج ثمن ما بقي' },
    ],
    story: WARMUP.text,
    answer: {
      options: ['سعر علبة العصير 30 دج وسعر قطعة الحلوى 50 دج.', 'سعر علبة العصير 50 دج وسعر قطعة الحلوى 30 دج.', 'سعر علبة العصير 40 دج وسعر قطعة الحلوى 40 دج.'],
      correct: 0,
    },
  },
  advanced: {
    system: '150x+150y=11250|24x+30y=2100',
    theme: 'party',
    unknowns: UNKNOWNS,
    named: false,
    facts: [
      { quote: 'اقتنت البلدية 150 علبة عصير برتقال و 150 قطعة حلوى متماثلة ودفعت 11250 دج لكل المصاريف', kind: 'money' },
      { quote: 'بقيت 24 علبة عصير و30 قطعة حلوى ثمنها معا 2100 دج', kind: 'money' },
    ],
    chips: [
      { value: '150', label: 'علبة عصير' }, { value: '150', label: 'قطعة حلوى' }, { value: '11250', label: 'دج لكل المصاريف' },
      { value: '24', label: 'علبة عصير بقيت' }, { value: '30', label: 'قطعة حلوى بقيت' }, { value: '2100', label: 'دج ثمن ما بقي' },
    ],
    story: SITUATION.text,
    answer: {
      options: ['سعر علبة العصير 25 دج وسعر قطعة الحلوى 50 دج.', 'سعر علبة العصير 50 دج وسعر قطعة الحلوى 25 دج.', 'سعر علبة العصير 37,5 دج وسعر قطعة الحلوى 37,5 دج.'],
      correct: 0,
    },
  },
};

/**
 * Les corrections et les méthodes du module 7 — importées aussi par la carte (knowledgeGraph.js) et les cartes de mémoire (knowledge.jsx), qui
 * sont OUVERTES dès le premier écran dans le lecteur (`knowledgeMapOpen`). Réécrites le 2026-11-12 (le balayage par rôle de la synthèse,
 * content/forbidden.js — elles montraient la رحلة القسم : la part de gâteau à 50, le prix TROUVÉ par le défi) : la MÉTHODE en lettres ($n$, $S$,
 * $x_0$…) et un seul petit exemple propre à la carte (3 علب و 4 قطع : $3x + 4y$), jamais un nombre du حفل ni d'une manche du module 7.
 */
export const REMARKS = {
  majahil: 'نسمّي $x$ و $y$ الكميتين المطلوبتين في السؤال: $x$ سعر علبة العصير و $y$ سعر قطعة الحلوى (بالدينار)، لا الأعداد المعلومة في النص.',
  tarjamaWrong: 'نترجم «بقيت 3 علب عصير و 4 قطع حلوى ثمنها معًا $S$ دج» بـ $4x + 3y = S$.',
  tarjamaWhy: 'كل عدد يُضرب في سعر الشيء الذي يعدّه: العلب الثلاث ثمنها $3x$ ، والقطع الأربع ثمنها $4y$.',
  tarjamaRight: 'المعلومة تُترجم بـ $3x + 4y = S$ : عدد العلب في سعر العلبة، زائد عدد القطع في سعر القطعة، يساوي المبلغ المذكور.',
  tabsit: 'قبل الحل نبسّط ما أمكن: إذا تساوى العددان في معلومة، $nx + ny = S$ ، نقسم الطرفين على $n$ فنجد $x + y = S \\div n$ : مجموع السعرين.',
  tariqa: 'إذا كان معامل أحد المجهولين 1 نعبّر عنه بدلالة الآخر ونعوّض في المعادلة الأخرى (التعويض)؛ وإذا كان المعاملان متعاكسين، أو يصيران كذلك بالضرب في معامل مناسب، نجمع طرفا بطرف (الجمع).',
  nisfWrong: 'وجدنا قيمة $x$ : سعر علبة العصير معروف، وانتهى الحل.',
  nisfWhy: 'السؤال يطلب السعرين معا: حل الجملة ثنائية $(x ; y)$ ، لا عدد واحد.',
  nisfRight: 'نعوّض قيمة $x$ في إحدى المعادلتين فنجد $y$ : الحل ثنائية $(x_0 ; y_0)$.',
  tahaqquq: 'نتحقق في نص الوضعية نفسه: نعوّض الثنائية في المعلومتين معًا، ثم نحرّر الجواب بوحدته: سعر علبة العصير … دج وسعر قطعة الحلوى … دج.',
  notSolvedHere: 'حلّ وضعية الحفل كاملًا في «التحدّي 🏆»: هنا قرأنا الوضعية، ترجمنا المعلومتين واخترنا طريقة الحل.',
};

/** La وضعية EN LETTRES (la carte des معارف, ouverte dès le premier écran) : la structure du حفل sans un seul de ses nombres. */
export const SITUATION_LETTERS = 'اشترت جهةٌ $n$ علبة عصير و $n$ قطعة حلوى متماثلة بمبلغ $S$ دج، ثم بقيت $a$ علبة عصير و $b$ قطعة حلوى ثمنها معًا $T$ دج. ما سعر علبة العصير وما سعر قطعة الحلوى؟';
/** La jumla de la وضعية en lettres. */
export const SYSTEM_LETTERS = '$\\begin{cases} nx + ny = S \\\\ ax + by = T \\end{cases}$';
