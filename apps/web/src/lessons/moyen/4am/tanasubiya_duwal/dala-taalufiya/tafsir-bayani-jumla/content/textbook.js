/**
 * Le contenu du درس 4 « التفسير البياني لحل جملة معادلتين من الدرجة الأولى بمجهولين » — données pures
 * (aucun JSX). Le manuel fourni (pp. 77–79) ne donne à cette leçon que le نشاط 5 (p. 79), cité au mot près
 * (extraction.json › destinations › act-5 → module 1). Tout le reste — la note sur les inconnues, les calculs
 * de l'activité, la formalisation (معارف), la méthode, les exemples, la « أستعدّ » — est écrit par la
 * plateforme et DÉCLARÉ (`addition(...)`), jamais présenté comme le texte du manuel.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 5 (p. 79) — « التفسير البياني لحل جملة معادلتين » : la caisse de la classe. */
export const ACTIVITY = {
  source: src('act-5', 79, 'أنشطة', 5),
  title: 'التفسير البياني لحل جملة معادلتين',
  situation: '1) لتزيين قسمهم بروح التعاون جمع التلاميذ مبلغ 5000DA من قطع 100DA و 200DA. عدد كلّ القطع النقدية هو 43. ما هو عدد قطع كلّ فئة؟',
  questions: [
    '2) نعتبر الجملة: $\\begin{cases} y = 43 - x & (1) \\\\ y = 25 - \\dfrac{1}{2}x & (2) \\end{cases}$ .',
    'أ) ما هي طبيعة كلّ من الدالتين $f : x \\longmapsto 43 - x$ و $g : x \\longmapsto 25 - \\dfrac{1}{2}x$ ؟',
    'ب) الشكل المقابل هو للتمثيلين البيانيين لهاتين الدالتين. أرفق كلّ مستقيم بالدالة الموافقة له.',
    'جـ) أعد الرّسم باستعمال ورق مليمتري. هل توجد نقاط إحداثياتها تحقّق معادلتي المستقيمين في آن واحد؟',
    'د) كيف تفسّر النتيجة في سياق الوضعية أعلاه؟',
  ],
  // les écritures de la جملة que le lab construit (linearSystem.eq2)
  system: 'x+y=43|100x+200y=5000',
  answer: { x: '36', y: '7' },
};

/**
 * La question 1 ne nomme pas les inconnues ; la question 2 les fixe (100x + 200y = 5000 ⇔ y = 25 − x/2) :
 * la plateforme le dit en une ligne (extraction › discrepancies › act-5).
 */
export const UNKNOWNS = {
  source: addition('interaction_generation'),
  text: 'لا يسمّي الكتاب المجهولين في السؤال 1؛ كما يفهم من السؤال 2، نسمّي $x$ عدد قطع 100DA و $y$ عدد قطع 200DA.',
};

/** Ce que la plateforme dit autour du نشاط 5 (l'accroche) — déclaré. */
export const HOOK = {
  source: addition('interaction_generation'),
  headline: 'صندوق القسم: 43 قطعة و 5000DA!',
  text: 'قطع من فئتين، وشرطان في آن واحد. في وحدة الجمل حللنا مثل هذه الجملة بالحساب؛ اليوم نراها على معلم: كل شرط يصير مستقيمًا.',
};

/** Les calculs du نشاط 5 écrits par la plateforme (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: addition('interaction_generation'),
  model: 'عدد القطع: $x + y = 43$ ، والمبلغ: $100x + 200y = 5000$.',
  eq1: '$x + y = 43$ تعطي $y = 43 - x$ : ننقل $x$ إلى الطرف الثاني مع تغيير إشارته.',
  eq2: '$100x + 200y = 5000$ تعطي $200y = 5000 - 100x$ ، ثم بالقسمة على 200: $y = 25 - \\dfrac{1}{2}x$ . هذه هي المعادلة (2) من السؤال 2.',
  nature: '$f(x) = -x + 43$ و $g(x) = -\\dfrac{1}{2}x + 25$ : دالتان تآلفيتان ($a = -1$ ، $b = 43$ ثم $a = -\\dfrac{1}{2}$ ، $b = 25$)، وليست أيّ منهما خطية لأنّ $b \\neq 0$.',
  match: 'المستقيم الذي يقطع محور التراتيب في النقطة $(0 ; 43)$ يمثّل $f$ لأنّ $f(0) = 43$ ، والذي يقطعه في $(0 ; 25)$ يمثّل $g$ لأنّ $g(0) = 25$.',
  point: 'النقطة $(36 ; 7)$ على المستقيمين معًا: $f(36) = 43 - 36 = 7$ و $g(36) = 25 - 18 = 7$.',
  check: 'وفي الوضعية: $36 + 7 = 43$ قطعة، و $100 \\times 36 + 200 \\times 7 = 3600 + 1400 = 5000$ DA.',
  meaning: 'جمع التلاميذ 36 قطعة من 100DA و 7 قطع من 200DA.',
  // « نقول إنّ … » — la phrase qui NOMME ce que l'activité vient de faire (plateforme : le manuel n'en a pas).
  closing: 'نقول إنّ الثنائية $(36 ; 7)$ ، إحداثيتي نقطة تقاطع المستقيمين، هي حلّ الجملة: هذا هو التفسير البياني لحل جملة معادلتين.',
};

/**
 * س 2 ب) : la figure du manuel (deux droites descendantes, graduation de 10 en 10) — redessinée en SVG
 * (components/LinesFigure), SANS le point d'intersection marqué : c'est la question جـ.
 */
export const ACT_FIGURE = {
  win: { xMin: 0, xMax: 55, yMin: 0, yMax: 45 },
  lines: [{ a: -1, b: 43, label: '(d₁)' }, { a: -0.5, b: 25, label: '(d₂)' }],
  step: 5, every: 2,
  caption: 'الشكل: مستقيمان نازلان؛ (d₁) يقطع محور التراتيب في 43 و (d₂) يقطعه في 25. التدريج كل 10.',
};

/**
 * معارف — le manuel fourni n'en a pas pour cette leçon : la plateforme formalise (knowledge_formalization),
 * dans le vocabulaire du livre (« جملة معادلتين »، « التفسير البياني »، « معامل التوجيه »، « الترتيب عند المبدأ »).
 */
const KF = addition('knowledge_formalization');
export const KNOWLEDGE = {
  equationLine: {
    source: KF,
    title: 'المعادلة والمستقيم',
    text: 'في معادلة من الدرجة الأولى بمجهولين $x$ و $y$ معامل $y$ فيها غير معدوم، نعزل $y$ فنكتبها على الشكل $y = ax + b$ : النقط التي تحقّق إحداثياتها هذه المعادلة هي نقط مستقيم، هو التمثيل البياني للدالة التآلفية $x \\longmapsto ax + b$.',
    example: 'مثال: $100x + 200y = 5000$ تُكتب $y = -\\dfrac{1}{2}x + 25$ ؛ مستقيمها يقطع محور التراتيب في $(0 ; 25)$.',
  },
  solutionPoint: {
    source: KF,
    title: 'الحل ونقطة التقاطع',
    text: 'نمثّل معادلتي جملة بمستقيمين في معلم واحد. الثنائية $(x_0 ; y_0)$ حلّ للجملة عندما تقع النقطة $M(x_0 ; y_0)$ على المستقيمين معًا، وعندها فقط: حلّ الجملة هو إحداثيتا نقطة تقاطع المستقيمين — الفاصلة أولًا ثم الترتيب.',
  },
  method: {
    source: KF,
    title: 'حل جملة بيانيًا',
    steps: [
      '1) نكتب كل معادلة على الشكل $y = ax + b$.',
      '2) نرسم المستقيمين في معلم واحد: لكل مستقيم نقطتان، مثلًا $(0 ; b)$ ونقطة أخرى.',
      '3) نقرأ إحداثيتي نقطة التقاطع.',
      '4) نتحقّق بالتعويض في المعادلتين، أو نحلّ الجملة بالحساب.',
    ],
  },
  approx: {
    source: KF,
    title: 'القراءة البيانية تقريبية أحيانًا',
    text: 'لا تعطي القراءة البيانية الحل المضبوط إلا إذا وقعت نقطة التقاطع على عقدة من الشبكة. إذا لم تقع عليها فالقراءة تقريبية، ونجد الحل المضبوط بالحساب: بالتعويض أو بالجمع.',
  },
  cases: {
    source: KF,
    title: 'الحالات الثلاث',
    items: [
      'معاملا التوجيه مختلفان: المستقيمان متقاطعان في نقطة واحدة، وللجملة حلّ وحيد.',
      'معامل التوجيه نفسه وترتيبان مختلفان عند المبدأ: المستقيمان متوازيان لا نقطة مشتركة لهما، والجملة لا تقبل حلًّا.',
      'معامل التوجيه نفسه والترتيب نفسه عند المبدأ: المستقيمان منطبقان، كل نقطة منهما مشتركة، وللجملة عدد لا نهائي من الحلول.',
    ],
    link: 'هذا ما رأيناه بالحساب في الحالات الخاصة من وحدة الجمل: معادلتان تؤولان إلى معادلة واحدة (منطبقان)، أو إلى معادلتين متناقضتين (متوازيان).',
  },
};

/** Les exemples de معارف (plateforme) : x + y = 3 et 2x − y = 0 — le lab en mode « cases ». */
export const EXAMPLE = {
  source: addition('interactive_example'),
  system: 'x+y=3|2x-y=0',
  lines: [
    '$x + y = 3$ تعطي $y = -x + 3$ ، و $2x - y = 0$ تعطي $y = 2x$.',
    'المستقيمان يتقاطعان في $(1 ; 2)$ ، ونتحقّق: $1 + 2 = 3$ و $2 \\times 1 - 2 = 0$.',
  ],
};

/**
 * « أستعدّ » — le manuel n'a pas d'item pour cette leçon (prep 1–7 → leçons 1 et 2) : huit affirmations de
 * la plateforme, dans la forme du livre. Aucune n'utilise les nombres du نشاط 5 (43, 5000, 36, 7) ni ceux du
 * niveau مبتدئ (2x − y = 1, x + y = 5, (2 ; 3)). Les deux réponses existent.
 */
const PREP = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { skill: 'thunaiya', text: 'الثنائية $(3 ; 1)$ حلّ للجملة $\\begin{cases} x + y = 4 \\\\ x - y = 2 \\end{cases}$ .', answer: true, why: '$3 + 1 = 4$ و $3 - 1 = 2$ : المعادلتان محقّقتان معًا.', source: PREP },
  { skill: 'tarjama', text: 'المبلغ المشكّل من $x$ قطعة من فئة 20DA و $y$ قطعة من فئة 50DA هو $20x + 50y$ DA.', answer: true, why: 'كل قطعة من 20DA تزيد المبلغ 20DA: $20x$ ، وكل قطعة من 50DA: $50y$.', source: PREP },
  { skill: 'azl', text: 'المعادلة $3x + y = 7$ تُكتب $y = 3x + 7$ .', answer: false, why: 'ننقل $3x$ مع تغيير إشارته: $y = -3x + 7$.', source: PREP },
  { skill: 'azl', text: 'المعادلة $2y = 4x - 6$ تُكتب $y = 2x - 3$ .', answer: true, why: 'نقسم كل الحدود على 2: $y = 2x - 3$.', source: PREP },
  { skill: 'taalufiya', text: 'إذا كانت $f(x) = -2x + 5$ فإنّ $f(3) = -1$ .', answer: true, why: '$f(3) = -2 \\times 3 + 5 = -6 + 5 = -1$', source: PREP },
  { skill: 'tamthil', text: 'التمثيل البياني للدالة $x \\longmapsto 3x - 2$ مستقيم يشمل المبدأ O.', answer: false, why: 'صورة 0 هي $-2$ : المستقيم يقطع محور التراتيب في $(0 ; -2)$ ، ولا يشمل O.', source: PREP },
  { skill: 'qiraa', text: 'النقطة $(0 ; 5)$ تقع على محور الفواصل.', answer: false, why: 'فاصلتها 0: تقع على محور التراتيب.', source: PREP },
  { skill: 'jabri', text: 'بجمع معادلتي الجملة $\\begin{cases} 2x + y = 9 \\\\ x - y = 3 \\end{cases}$ طرفًا لطرف نجد $3x = 12$ ، ومنه حلّ الجملة $(4 ; 1)$ .', answer: true, why: '$3x = 12$ ومنه $x = 4$ ، ثم $y = 4 - 3 = 1$ ؛ ونتحقّق: $2 \\times 4 + 1 = 9$.', source: PREP },
];
