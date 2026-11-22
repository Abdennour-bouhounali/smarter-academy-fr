/**
 * Le contenu du درس 4 « ترييض وقراءة وضعيات إحصائية وتفسير المؤشرات » (unité 8 « الإحصاء », manuel
 * pp. 91–101) — données pures (aucun JSX). Chaque bloc porte sa `source` :
 *
 *   challenge        تحدّ p. 91 (doublon déclaré de la page d'unité) : deux classes, garçons / filles — même
 *                    total 384 sur 33 élèves, même moyenne 384/33 ≈ 11,64. Au mot près.
 *   intro-pollution  l'encart « تلوث البيئة » p. 91 (doublon déclaré) : le contexte RÉEL de lecture de données.
 *
 * La leçon n'a AUCUNE activité du manuel : son savoir formel est une formulation de la PLATEFORME
 * (`addition('knowledge_formalization')`), dans le vocabulaire du manuel (extraction › terminology).
 * Les exercices ex-14, ex-19, ex-22 sont dans content/exercises.js. Aucune phrase de la plateforme ne
 * porte `src()`. Toutes les réponses : docs/sources/4am/unit8/extraction.json (calculées).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** تحدّ (p. 91) — au mot près (extraction › challenge). */
export const CHALLENGE = {
  source: src('challenge', 91, 'تحدّ'),
  text: 'يقدّم الجدول نتائج تلاميذ قسمين في امتحان حسب عدد الذكور والإناث والمعدّل. أي القسمين نتائجه أفضل؟',
  head: ['', 'ذكور — العدد', 'ذكور — المعدل', 'إناث — العدد', 'إناث — المعدل'],
  rows: [
    ['القسم (أ)', '15', '10', '18', '13'],
    ['القسم (ب)', '14', '12,5', '19', '11'],
  ],
  // extraction › challenge › answer : 15 × 10 + 18 × 13 = 384 ; 14 × 12,5 + 19 × 11 = 384 ; N = 33
  numbers: { sumA: 384, sumB: 384, N: 33, approx: '11,64', mmA: '11,5', mmB: '11,75', boysA: 150, girlsA: 234, boysB: 175, girlsB: 209 },
};

/** Ce que la مذكرة du professeur lit comme « وضعية الانطلاق ». */
export const ACTIVITY = {
  source: CHALLENGE.source,
  title: 'تحدّ — قسمان: أيهما نتائجه أفضل؟',
  text: CHALLENGE.text,
  questions: [
    'كم مجموع نقاط تلاميذ القسم (أ)؟ وكم عددهم؟',
    'ما معدّل كل قسم؟',
    'هل تكفي مقارنة الذكور بالذكور والإناث بالإناث؟',
  ],
  closing: 'في القسمين مجموع النقاط 384 والعدد 33: للقسمين المعدّل نفسه $\\dfrac{384}{33} \\approx 11{,}64$ . الذكور (ب) أفضل من الذكور (أ)، والإناث (أ) أفضل من الإناث (ب)، لكن المقارنة مجموعة بمجموعة لا تحسم: نحسب المتوسط المتوازن لكل قسم كاملًا.',
  numbers: CHALLENGE.numbers,
};

/** L'encart « تلوث البيئة » (p. 91) — au mot près (extraction › intro-pollution). */
export const POLLUTION = {
  source: src('intro-pollution', 91, 'مدخل الباب'),
  title: 'تلوث البيئة',
  text: 'تلوث البيئة: من بين أسوأ عشرة أسباب لتلوث الهواء انبعاث غازات السيارات التي هي المصدر رقم واحد لأول أكسيد الكربون والرصاص وأكاسيد النيتروجين، والمركّبات العضوية المتطايرة في الجو. وبالنظر إلى وجود ملايين السيارات في المناطق الحضرية بالمدن الكبرى، يمكن أن يؤدي ذلك إلى خروج كمية هائلة جدا من الانبعاثات الضارة بكوكب الأرض. ما الذي يمكن فعله حيال هذا الأمر؟ لا شك أنّ استخدام وسائل النقل العام كلما أمكن، والفحص الدوري للسيارة للحفاظ على مستوى الانبعاثات التي تخرج منها، وتجنب القيادة إذا لم تكن هناك حاجة إليها، كلها تدابير تساهم في تخفيف تلوث البيئة.',
};

/**
 * Le prolongement de l'encart (PLATEFORME, déclaré) : le club vert du collège compte les voitures qui
 * passent devant l'école pendant une matinée. Un مخطط بالأعمدة gradué de 50 en 50 (components/BarChart).
 *   450 + 600 + 250 + 200 + 300 = 1800 ; 8h–9h : 600 = 1/3 ; 7h–8h : 450/1800 = 1/4 = 25 %
 *   les deux heures de pointe (7h–9h) : 1050 > la moitié (900)
 */
export const CARS = {
  source: addition('interactive_example'),
  text: 'تأثّر نادي البيئة في متوسطتنا بنصّ «تلوث البيئة»، فعدّ تلاميذه السيارات التي مرّت أمام المدرسة كل ساعة خلال صبيحة. يمثّل المخطط بالأعمدة التالي نتائجهم.',
  axis: 'عدد السيارات',
  bars: [
    { label: '7h–8h', value: 450 },
    { label: '8h–9h', value: 600 },
    { label: '9h–10h', value: 250 },
    { label: '10h–11h', value: 200 },
    { label: '11h–12h', value: 300 },
  ],
  yMax: 650, step: 50,
  numbers: { total: 1800, peak: 600, first: 450, firstPercent: 25, morning: 1050 },
};

/* ── La connaissance (écrite par la plateforme dans le vocabulaire du manuel) ─────────────────── */

/** P3 — la moyenne de groupes réunis (le تحدّ). */
export const GROUPS_RULE = {
  source: addition('knowledge_formalization'),
  text: 'متوسط سلسلة مكوّنة من مجموعات هو المتوسط المتوازن: نضرب متوسط كل مجموعة في تكرارها (عدد أفرادها)، نجمع النتائج، ثم نقسم على التكرار الكلي. للقسم (أ): $\\dfrac{15 \\times 10 + 18 \\times 13}{15 + 18} = \\dfrac{384}{33} \\approx 11{,}64$ . ولا يساوي متوسط المتوسطين إلا إذا تساوت التكرارات.',
};

/** P2 — décider sur la série entière, pas groupe par groupe (le تحدّ). */
export const WHOLE_RULE = {
  source: addition('knowledge_formalization'),
  text: 'لمقارنة قسمين نقارن مؤشرات السلسلة كاملة لكل قسم. في التحدّي ذكور القسم (ب) أفضل وإناث القسم (أ) أفضل، لكن للقسمين المعدّل نفسه $\\dfrac{384}{33} \\approx 11{,}64$ : المقارنة مجموعة بمجموعة لا تحسم.',
};

/** P1 — lire un مخطط بالأعمدة. */
export const READ_RULE = {
  source: addition('knowledge_formalization'),
  text: 'لقراءة مخطط بالأعمدة: نقرأ عنوان المحور العمودي (ماذا نعدّ؟)، ثم خطوة التدريج (10 أو 50 …)، ثم ارتفاع كل عمود على التدريج، وننقل القيم إلى جدول. نتحقّق أن مجموع التكرارات هو التكرار الكلي.',
};

/** P1 — traduire en tableau : تكرار، تواتر، تواتر مجمع (ex-19). */
export const TABLE_RULE = {
  source: addition('knowledge_formalization'),
  text: 'نترجم المخطط إلى جدول: التكرار من ارتفاع العمود، والتواتر هو التكرار مقسوما على التكرار الكلي $N$ ، والتواتر المجمع الصاعد يجمع التواترات من البداية حتى القيمة (آخره 1). وإذا جمع عمود فئتين (القناتان B و D) نستخرج كل فئة بطرح ما نعرفه: $B = 1250 - 700 = 550$ .',
};

/** P2 — comparer deux séries : un indicateur de position ET un indicateur de dispersion (ex-14). */
export const COMPARE_RULE = {
  source: addition('knowledge_formalization'),
  text: 'لمقارنة سلسلتين نستعمل مؤشر موقع (المتوسط أو الوسيط) يقول أين تتمركز القيم، ومؤشر تشتت (المدى) يقول كم تتباعد القيم. في التمرين 14: المدينة «ب» أدفأ (المتوسط $13{,}25$ والوسيط 14 مقابل $9{,}5$ و 10)، ودرجات حرارة المدينة «أ» أكثر تشتتا (المدى 35 مقابل 17).',
};

/** P3 — une valeur extrême, et retirer des valeurs (ex-22). */
export const OUTLIER_RULE = {
  source: addition('knowledge_formalization'),
  text: 'حذف قيمة يغيّر مجموع القيم والتكرار الكلي معًا: إذا كان المتوسط $m$ لـ $N$ قيمة فمجموعها $m \\times N$ . حذف أصغر قيمة وأكبر قيمة لا يغيّر الوسيط، ولا يغيّر المتوسط إلا إذا اختلف مجموعهما عن $2m$ . في التمرين 22: $11{,}5N - 19 = 11{,}25(N - 1)$ ومنه $N = 31$ .',
};

/**
 * La méthode (module 3) : « أقرأ · أحسب المؤشرات · أقارن · أقرّر », sur un exemple de la plateforme —
 * deux équipes de l'établissement au tir aux buts (5 séances) :
 *   A : 2, 9, 4, 8, 7 → moyenne 6, médiane 7, étendue 7 ; B : 6, 5, 7, 6, 6 → moyenne 6, médiane 6, étendue 2
 *   même moyenne ; B plus régulière (étendue 2), A a la meilleure médiane mais varie beaucoup.
 */
export const METHOD = {
  source: addition('knowledge_formalization'),
  title: 'قراءة وضعية إحصائية والمقارنة واتخاذ القرار',
  exercise: 'سجّل فريقان لضربات الجزاء في متوسطتنا، في أجواء من الروح الرياضية، عدد الأهداف في 5 حصص تدريبية. الفريق A: 2 ، 9 ، 4 ، 8 ، 7. الفريق B: 6 ، 5 ، 7 ، 6 ، 6. يجب اختيار فريق يمثّل المتوسطة، ويريد المدرّب فريقا منتظما. أيّ فريق يختار؟',
  solution: [
    '1) أقرأ: السلسلتان من 5 قيم، والقيمة عدد الأهداف في الحصة.',
    '2) أحسب المؤشرات: للفريق A المتوسط $\\dfrac{2 + 9 + 4 + 8 + 7}{5} = 6$ ، الوسيط 7 (بعد الترتيب 2 ، 4 ، 7 ، 8 ، 9) والمدى $9 - 2 = 7$ . للفريق B المتوسط $\\dfrac{6 + 5 + 7 + 6 + 6}{5} = 6$ ، الوسيط 6 والمدى $7 - 5 = 2$ .',
    '3) أقارن: للفريقين المتوسط نفسه 6؛ مدى الفريق B (2) أصغر بكثير من مدى الفريق A (7).',
    '4) أقرّر وأبرّر بالمؤشرات: المدرّب يريد الانتظام، فيختار الفريق B: متوسطه 6 كالفريق A ونتائجه أقل تشتتا (المدى 2).',
  ],
  rule: [
    'لقراءة وضعية إحصائية واتخاذ قرار: أقرأ المعطيات (جدول أو مخطط) وأترجمها، أحسب المؤشرات (مؤشر موقع ومؤشر تشتت)، أقارن، ثم أقرّر وأبرّر قراري بالمؤشرات في سياق الوضعية.',
  ],
  numbers: { meanA: 6, medianA: 7, rangeA: 7, meanB: 6, medianB: 6, rangeB: 2 },
};
export const METHOD_RULE = { source: addition('knowledge_formalization'), text: METHOD.rule[0] };

/** L'erreur que l'eau refuse (MISC-IHSA-MUTAWASSIT-MUTAWASSITAYN) — reprise par la carte. */
export const MISTAKE_MM = {
  source: addition('knowledge_formalization'),
  wrong: 'حساب معدّل القسم (أ) كمتوسط معدّلَي ذكوره وإناثه: $\\dfrac{10 + 13}{2} = 11{,}5$ .',
  why: 'عدد الإناث (18) أكبر من عدد الذكور (15): مجموع النقاط $15 \\times 10 + 18 \\times 13 = 384$ يُقسم على 33 تلميذا.',
  right: 'المعدّل هو المتوسط المتوازن $\\dfrac{384}{33} \\approx 11{,}64$ .',
};

/** L'erreur « comparer par la moyenne seule » (MISC-IHSA-MUQARANA-MUTAWASSIT-FAQAT). */
export const MISTAKE_MEAN_ONLY = {
  source: addition('knowledge_formalization'),
  wrong: 'القول إن الفريقين A و B متماثلان لأن لهما المتوسط نفسه 6.',
  why: 'مدى الفريق A هو 7 ومدى الفريق B هو 2: نتائج A متباعدة ونتائج B منتظمة.',
  right: 'نقارن بمؤشر موقع ومؤشر تشتت معًا قبل أن نقرّر.',
};

/** Le piège de lecture d'ex-19 : une barre qui réunit deux chaînes (warning de la carte). */
export const COMBINED_BAR = {
  source: addition('knowledge_formalization'),
  text: 'عمود «القناتان B و D» يجمع قناتين: لا ننقل ارتفاعه إلى خانة واحدة، بل نطرح منه ما نعرفه.',
};

/**
 * « أستعدّ » — le manuel n'a aucun item pour cette leçon (ses quatre items vont aux leçons 1–3) : six
 * affirmations de la PLATEFORME dans la forme du manuel, une compétence chacune parmi les acquis des
 * leçons 1 et 2 (متوسط، متوسط متوازن، وسيط، مدى، تواتر، قراءة مخطط), les deux réponses présentes.
 * Aucune n'utilise les nombres du تحدّ.
 *   1 (4 + 6 + 8 + 10 + 7) ÷ 5 = 35 ÷ 5 = 7                         → vrai
 *   2 valeurs 1, 2, 3 d'effectifs 6, 2, 2 : (6 + 4 + 6) ÷ 10 = 1,6 ≠ 2  → faux (moyenne non pondérée)
 *   3 3, 8, 5, 12, 9 → rangée 3, 5, 8, 9, 12 : médiane 8 (et non 5)     → faux
 *   4 étendue de 7, 15, 4, 11 : 15 − 4 = 11 (et non 15)                 → faux
 *   5 6 sur 24 : 6 ÷ 24 = 0,25                                          → vrai
 *   6 graduation de 20 en 20, la barre au 4e trait au-dessus de 0 : 80  → vrai
 */
export const PREP_ITEMS = [
  { skill: 'mutawassit', text: 'متوسط السلسلة: 4 ، 6 ، 8 ، 10 ، 7 هو 7.', answer: true, why: '$\\dfrac{4 + 6 + 8 + 10 + 7}{5} = \\dfrac{35}{5} = 7$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'mutawazin', text: 'في سلسلة قيمها 1 ، 2 ، 3 وتكراراتها على الترتيب 6 ، 2 ، 2، المتوسط هو 2.', answer: false, why: '$\\dfrac{1 \\times 6 + 2 \\times 2 + 3 \\times 2}{10} = \\dfrac{16}{10} = 1{,}6$ ؛ العدد 2 هو متوسط القيم الثلاث دون اعتبار تكراراتها.', source: addition('prerequisite_diagnostic') },
  { skill: 'wasit', text: 'وسيط السلسلة: 3 ، 8 ، 5 ، 12 ، 9 هو 5.', answer: false, why: 'نرتّب أولا: 3 ، 5 ، 8 ، 9 ، 12 ؛ القيمة ذات الرتبة 3 هي 8 : الوسيط 8.', source: addition('prerequisite_diagnostic') },
  { skill: 'mada', text: 'مدى السلسلة: 7 ، 15 ، 4 ، 11 هو 15.', answer: false, why: 'المدى هو أكبر قيمة ناقص أصغر قيمة: $15 - 4 = 11$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'tawatur', text: 'في قسم من 24 تلميذا، 6 تلاميذ يمارسون السباحة: تواتر هذه القيمة هو 0,25.', answer: true, why: '$\\dfrac{6}{24} = 0{,}25$ ، أي $25\\%$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'qiraa', text: 'في مخطط بالأعمدة محوره العمودي مدرّج من 20 إلى 20 (0 ، 20 ، 40 …)، عمود يصل إلى التدريجة الرابعة فوق 0 يمثّل التكرار 80.', answer: true, why: 'كل تدريجة تساوي 20: $4 \\times 20 = 80$ .', source: addition('prerequisite_diagnostic') },
];

/**
 * LES LABORATOIRES (group-tanks) — le module 1 étale EXACTEMENT ces objets ; lab.render.test.jsx les monte.
 *   مبتدئ  — مسابقة القسم : 4 amis de moyenne 12, 6 amis de moyenne 7 → 9 (pas 9,5) — plateforme
 *   متقدم  — le تحدّ : (أ) 15 garçons à 10 + 18 filles à 13 ; (ب) 14 à 12,5 + 19 à 11 → 384/33 les deux
 */
export const LAB = {
  m1: {
    beginner: { groups: '4:12|6:7', theme: 'quiz', title: 'مسابقة القسم: فريقان من الأصدقاء' },
    advanced: { groups: '15:10|18:13|14:12,5|19:11', classes: '2|2', theme: 'school', title: 'تحدّ: القسمان (أ) و (ب)' },
  },
};
