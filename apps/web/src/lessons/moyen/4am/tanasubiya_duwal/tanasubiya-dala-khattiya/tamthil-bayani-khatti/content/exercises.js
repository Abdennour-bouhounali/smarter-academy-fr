/**
 * Les exercices du MANUEL rattachés au درس 3 « التمثيل البياني لدالة خطية وقراءته بيانيًا »
 * (extraction.json → destinations : ex-2, ex-10 → ex-15 (p. 72–73), ex-30, ex-33 (أتعمّق, p. 75)).
 * Chaque énoncé est celui du livre, au mot près (ex-13 : la notation corrigée par le propriétaire) ;
 * un exercice à plusieurs parties est découpé en une entrée par partie (la première porte l'énoncé).
 *
 * « مثّل بيانيا » est posé comme le CHOIX de la seconde point (le geste de طرائق ص 69 : O et une
 * autre point) — le tracé lui-même se fait dans le lab des modules 1 et 2. Les figures (ex-11, ex-12,
 * ex-33) sont dessinées en SVG par le module (components/GraphFigure.jsx), jamais en image.
 * Tous les distracteurs sont faux (vérifiés par le calcul dans le commentaire de chaque ligne).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_tamthil-bayani-khatti_P1',
  P2: '4am_tamthil-bayani-khatti_P2',
  P3: '4am_tamthil-bayani-khatti_P3',
};

const E = (n, page, section, part) => ({ ...src(`ex-${n}`, page, section, n), ...(part ? { part } : {}) });
const AW = 'أوظّف تعلّماتي';
const AT = 'أتعمّق';

export const EXERCISES = [
  // تمرين 2 — (D) par A(1 ; √3 − √2) : a = √3 − √2 ; A′ n'appartient pas à (D)
  {
    id: 'ex-2-a', source: E(2, 72, AW, 'أ'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'عيّن الدّالة الخطية التي تمثيلها البياني هو المستقيم (D) الذي يشمل النقطة $A(1 ; \\sqrt{3} - \\sqrt{2})$ . هل النقطة $A\'(\\sqrt{3} - \\sqrt{2} ; \\sqrt{3} + \\sqrt{2})$ تنتمي إلى المستقيم (D)؟',
    interaction: 'choice',
    question: {
      prompt: 'الدالة الخطية التي تمثيلها (D):',
      // 1/(√3 − √2) = √3 + √2 ≠ √3 − √2 ; x + √3 − √2 n'est pas linéaire (son graphe ne passe pas par O)
      options: ['$f : x \\longmapsto (\\sqrt{3} - \\sqrt{2})x$', '$f : x \\longmapsto x + \\sqrt{3} - \\sqrt{2}$', '$f : x \\longmapsto \\dfrac{1}{\\sqrt{3} - \\sqrt{2}}x$'],
      correct: 0,
      cols: 1,
      explain: '(D) يشمل O و $A(1 ; \\sqrt{3} - \\sqrt{2})$ : صورة 1 هي $\\sqrt{3} - \\sqrt{2}$ ، و $f(1) = a \\times 1 = a$ ، إذن $a = \\sqrt{3} - \\sqrt{2}$.',
    },
    method: 'النقطة ذات الفاصلة 1 من التمثيل ترتيبها هو المعامل $a$ نفسه، لأنّ $f(1) = a$.',
  },
  {
    id: 'ex-2-b', source: E(2, 72, AW, 'ب'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: 'هل النقطة $A\'(\\sqrt{3} - \\sqrt{2} ; \\sqrt{3} + \\sqrt{2})$ تنتمي إلى (D)؟',
      options: ['لا تنتمي إلى (D)', 'تنتمي إلى (D)'],
      correct: 0,
      cols: 2,
      explain: '$f(\\sqrt{3} - \\sqrt{2}) = (\\sqrt{3} - \\sqrt{2})^2 = 3 - 2\\sqrt{6} + 2 = 5 - 2\\sqrt{6}$ ، وهذا العدد لا يساوي $\\sqrt{3} + \\sqrt{2}$ (الأول أصغر من 1 والثاني أكبر من 3): ترتيب $A\'$ ليس صورة فاصلتها.',
    },
    commonError: 'الظنّ أنّ كل نقطة إحداثياها من « عائلة » المعامل تنتمي إلى (D): نحسب صورة الفاصلة ونقارنها بالترتيب.',
  },

  // تمرين 10 — M(2/7 ; −1/3) : a = −7/6 ; le tableau
  {
    id: 'ex-10-a', source: E(10, 72, AW, 'a'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'النقطة $M\\left(\\dfrac{2}{7} ; -\\dfrac{1}{3}\\right)$ تنتمي إلى المستقيم الذي يمثل الدّالة الخطية $f$ . انقل ثم أتمم الجدول التالي',
    items: ['الجدول: $x$ : $2$ ، … ، $0$ ، $10$ ؛ $f(x)$ : … ، $-3$ ، … ، …'],
    interaction: 'fraction',
    question: {
      prompt: 'أولا، معامل $f$ (كسر غير قابل للاختزال):',
      expected: '-7/6',
      explain: '$a = -\\dfrac{1}{3} \\div \\dfrac{2}{7} = -\\dfrac{1}{3} \\times \\dfrac{7}{2} = -\\dfrac{7}{6}$.',
    },
    commonError: 'قسمة الفاصلة على الترتيب: $\\dfrac{2}{7} \\div \\left(-\\dfrac{1}{3}\\right) = -\\dfrac{6}{7}$ هو مقلوب المعامل.',
  },
  {
    id: 'ex-10-b', source: E(10, 72, AW, 'f(2)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'fraction',
    question: { prompt: '$f(2) =$', expected: '-7/3', explain: '$f(2) = -\\dfrac{7}{6} \\times 2 = -\\dfrac{7}{3}$.' },
  },
  {
    id: 'ex-10-c', source: E(10, 72, AW, 'f(x) = -3'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'fraction',
    question: { prompt: 'العدد الذي صورته $-3$ :', expected: '18/7', explain: '$-\\dfrac{7}{6}x = -3$ ، ومنه $x = -3 \\div \\left(-\\dfrac{7}{6}\\right) = \\dfrac{18}{7}$.' },
  },
  {
    id: 'ex-10-d', source: E(10, 72, AW, 'f(0), f(10)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'fraction',
    question: { prompt: '$f(10) =$ (و $f(0) = 0$ كما في كل دالة خطية)', expected: '-35/3', explain: '$f(10) = -\\dfrac{7}{6} \\times 10 = -\\dfrac{70}{6} = -\\dfrac{35}{3}$ ، و $f(0) = 0$.' },
  },

  // تمرين 11 — (D) par O et (400 ; 80) : a = 0,2
  {
    id: 'ex-11-a', source: E(11, 72, AW, '1)'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'في المعلم أدناه المستقيم (D) هو التمثيل البياني للدالة $f$ . 1) احسب $f(1954)$ و $f(2018)$ . 2) عيّن العدد الذي صورته 10 085.',
    interaction: 'numeric',
    question: { prompt: '$f(1954) =$', expected: 390.8, display: '390,8', explain: 'نقرأ على الشكل النقطة $(400 ; 80)$ : $a = \\dfrac{80}{400} = 0{,}2$ ، ومنه $f(1954) = 0{,}2 \\times 1954 = 390{,}8$.' },
    method: 'نقرأ على الشكل نقطة واضحة من (D) غير O، ونستنتج المعامل، ثم نحسب: الأعداد هنا أكبر من أن تُقرأ على الشكل.',
  },
  {
    id: 'ex-11-b', source: E(11, 72, AW, '1)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'numeric',
    question: { prompt: '$f(2018) =$', expected: 403.6, display: '403,6', explain: '$f(2018) = 0{,}2 \\times 2018 = 403{,}6$.' },
  },
  {
    id: 'ex-11-c', source: E(11, 72, AW, '2)'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'numeric',
    question: { prompt: 'العدد الذي صورته 10 085:', expected: 50425, display: '50425', explain: '$0{,}2x = 10085$ ، ومنه $x = 10085 \\div 0{,}2 = 50425$.' },
    commonError: 'ضرب 10085 في 0,2 بدل القسمة: هذا يعطي صورة 10085، لا العدد الذي صورته 10085.',
  },

  // تمرين 12 — le prix des fruits : 2,5 kg → 200 DA ; 120 DA → 1,5 kg (lecture : extraction › reading)
  {
    id: 'ex-12-a', source: E(12, 72, AW, '1'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'يبيّن الشكل أدناه تمثيلا بيانيا لسعر نوع من الفواكه (بالدينار) حسب كتلتها (بالكيلوغرام). ماهو سعر 2,5kg من هذه الفواكه؟ دفع زبون 120DA ليهدي جاره المريض فاكهة. ما هي الكمية التي اشتراها؟',
    interaction: 'numeric',
    question: { prompt: 'سعر 2,5kg (DA):', expected: 200, display: '200', explain: 'من 2,5 على محور الكتل نصعد إلى المستقيم ثم نقرأ على محور الأسعار: 200DA (وللتحقّق: الكيلوغرام بـ 80DA، و $80 \\times 2{,}5 = 200$).' },
  },
  {
    id: 'ex-12-b', source: E(12, 72, AW, '2'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'numeric',
    question: { prompt: 'الكمية التي اشتراها بـ 120DA (kg):', expected: 1.5, display: '1,5', explain: 'من 120 على محور الأسعار نذهب أفقيا إلى المستقيم ثم ننزل إلى محور الكتل: 1,5kg (و $120 \\div 80 = 1{,}5$).' },
    commonError: 'قراءة الكتلة على محور الأسعار (الخلط بين الفاصلة والترتيب).',
  },

  // تمرين 13 — trois fonctions à représenter (notation de h corrigée)
  {
    id: 'ex-13', source: E(13, 73, AW), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'مثّل بيانيا الدّوال التالية: $f : x \\longmapsto \\dfrac{-3}{2}x$ ، $g : x \\longmapsto \\dfrac{3}{2}x$ ، $h : x \\longmapsto \\dfrac{2}{3}x$ .',
    correctionNote: 'صحّحت المنصّة خطأً مطبعيًا: في الكتاب « h :⟼ 2/3 x » (سقط x قبل السهم).',
    interaction: 'batch',
    question: {
      prompt: 'كل تمثيل يشمل المبدأ O. ما النقطة الثانية التي ترسمه بها؟ (اختر نقطة إحداثياها أعداد صحيحة)',
      rows: [
        // f(2) = −3 ; f(2) ≠ 3 ; f(−3) = 4,5 ≠ 2
        { label: '$f : x \\longmapsto \\dfrac{-3}{2}x$', options: ['$(2 ; -3)$', '$(2 ; 3)$', '$(-3 ; 2)$'], correct: 0, correction: '$f(2) = \\dfrac{-3}{2} \\times 2 = -3$ ؛ والمستقيم ينزل لأنّ المعامل سالب.' },
        // g(2) = 3 ; g(3) = 4,5 ≠ 2 ; g(2) ≠ −3
        { label: '$g : x \\longmapsto \\dfrac{3}{2}x$', options: ['$(3 ; 2)$', '$(2 ; 3)$', '$(2 ; -3)$'], correct: 1, correction: '$g(2) = \\dfrac{3}{2} \\times 2 = 3$ ؛ أمّا $(3 ; 2)$ فهي نقطة من تمثيل $h$.' },
        // h(3) = 2 ; h(2) = 4/3 ≠ 3 ; h(3) ≠ −2
        { label: '$h : x \\longmapsto \\dfrac{2}{3}x$', options: ['$(2 ; 3)$', '$(3 ; -2)$', '$(3 ; 2)$'], correct: 2, correction: '$h(3) = \\dfrac{2}{3} \\times 3 = 2$.' },
      ],
      explain: 'نختار فاصلة تساوي مقام المعامل، فتكون الصورة عددًا صحيحًا.',
    },
    method: 'التمثيل البياني لدالة خطية مستقيم يشمل O: تكفي نقطة ثانية، نحسب صورة فاصلة نختارها.',
    commonError: 'قلب الإحداثيين: $(3 ; 2)$ نقطة من تمثيل $\\dfrac{2}{3}x$ لا من تمثيل $\\dfrac{3}{2}x$.',
  },

  // تمرين 14 — −3,2x : aucune des trois points ; B et C sont sur 3,2x (le piège du signe)
  {
    id: 'ex-14-a', source: E(14, 73, AW), learningPointId: LP.P1, difficulty: 'moyen',
    statement: '(D) هو المستقيم الذي يمثل بيان الدّالة $f : x \\longmapsto -3{,}2x$ . هل النقط $A(2{,}5 ; 8{,}5)$ ، $B(5 ; 16)$ ، $C(10 ; 32)$ تنتمي إلى (D)؟ اشرح.',
    interaction: 'batch',
    question: {
      prompt: 'نحسب صورة فاصلة كل نقطة ونقارنها بترتيبها:',
      rows: [
        { label: '$A(2{,}5 ; 8{,}5)$', options: ['تنتمي إلى (D)', 'لا تنتمي إلى (D)'], correct: 1, correction: '$f(2{,}5) = -3{,}2 \\times 2{,}5 = -8 \\neq 8{,}5$' },
        { label: '$B(5 ; 16)$', options: ['تنتمي إلى (D)', 'لا تنتمي إلى (D)'], correct: 1, correction: '$f(5) = -3{,}2 \\times 5 = -16 \\neq 16$' },
        { label: '$C(10 ; 32)$', options: ['تنتمي إلى (D)', 'لا تنتمي إلى (D)'], correct: 1, correction: '$f(10) = -3{,}2 \\times 10 = -32 \\neq 32$' },
      ],
      explain: 'لا تنتمي أي نقطة إلى (D): المعامل سالب، فكل نقطة من (D) فاصلتها موجبة ترتيبها سالب.',
    },
    method: 'نقطة تنتمي إلى تمثيل $f$ إذا وفقط إذا كان ترتيبها صورة فاصلتها.',
    commonError: 'نسيان إشارة المعامل: $3{,}2 \\times 5 = 16$ ، لكن $-3{,}2 \\times 5 = -16$ . النقطتان B و C على تمثيل $x \\longmapsto 3{,}2x$ لا على (D).',
  },
  {
    id: 'ex-14-b', source: E(14, 73, AW, 'فخّ الإشارة'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: 'النقطتان $B(5 ; 16)$ و $C(10 ; 32)$ تنتميان معًا إلى التمثيل البياني للدالة:',
      // 3,2 × 5 = 16 et 3,2 × 10 = 32 ; −3,2 × 5 = −16 ; 0,32 × 5 = 1,6
      options: ['$x \\longmapsto 3{,}2x$', '$x \\longmapsto -3{,}2x$', '$x \\longmapsto 0{,}32x$'],
      correct: 0,
      cols: 1,
      explain: '$3{,}2 \\times 5 = 16$ و $3{,}2 \\times 10 = 32$ : مستقيم $3{,}2x$ يصعد، ومستقيم $-3{,}2x$ ينزل — هما مستقيمان مختلفان يشملان O.',
    },
  },

  // تمرين 15 — h(−2,5) = 4 : a = −1,6 ; l'antécédent de 2,5 est −1,5625
  {
    id: 'ex-15-a', source: E(15, 73, AW, '1)'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'نعتبر الدّالة الخطية $h$ حيث $h(-2{,}5) = 4$ . 1) مثّل بيانيا الدّالة $h$ . 2) ماهو معامل الدّالة $h$ ؟ 3) عيّن العدد الذي صورته 2,5.',
    interaction: 'choice',
    question: {
      prompt: '1) لرسم تمثيل $h$ يكفي المبدأ O والنقطة:',
      // h(−2,5) = 4 ; (4 ; −2,5) : h(4) = −6,4 ≠ −2,5 ; (2,5 ; 4) : h(2,5) = −4 ≠ 4
      options: ['$(-2{,}5 ; 4)$', '$(4 ; -2{,}5)$', '$(2{,}5 ; 4)$'],
      correct: 0,
      cols: 3,
      explain: '$h(-2{,}5) = 4$ تعني أنّ النقطة $(-2{,}5 ; 4)$ من التمثيل: لا حاجة إلى حساب آخر.',
    },
  },
  {
    id: 'ex-15-b', source: E(15, 73, AW, '2)'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'numeric',
    question: { prompt: '2) معامل $h$ :', expected: -1.6, display: '-1,6', explain: '$a = \\dfrac{4}{-2{,}5} = -1{,}6$ : سالب، فالمستقيم ينزل من اليسار إلى اليمين.' },
  },
  {
    id: 'ex-15-c', source: E(15, 73, AW, '3)'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'numeric',
    question: { prompt: '3) العدد الذي صورته 2,5:', expected: -1.5625, display: '-1,5625', explain: '$-1{,}6x = 2{,}5$ ، ومنه $x = 2{,}5 \\div (-1{,}6) = -1{,}5625$.' },
    commonError: 'حساب صورة 2,5 ($-4$) بدل العدد الذي صورته 2,5.',
  },

  // تمرين 30 (أتعمّق) — f(x + √2) − f(x − √2) = 4 : 2√2·a = 4, a = √2
  {
    id: 'ex-30', source: E(30, 75, AT), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'عيّن ثم مثّل بيانيا الدّالة الخطية $f$ التي تحقّق: $f(x + \\sqrt{2}) - f(x - \\sqrt{2}) = 4$',
    interaction: 'choice',
    question: {
      prompt: 'معامل $f$ هو:',
      // 2√2 × 2 = 4√2 ≠ 4 ; 2√2 × 2√2 = 8 ≠ 4 ; 2√2 × √2/2 = 2 ≠ 4
      options: ['$\\sqrt{2}$', '$2$', '$2\\sqrt{2}$', '$\\dfrac{\\sqrt{2}}{2}$'],
      correct: 0,
      cols: 4,
      explain: '$a(x + \\sqrt{2}) - a(x - \\sqrt{2}) = 2\\sqrt{2}a = 4$ ، ومنه $a = \\dfrac{4}{2\\sqrt{2}} = \\sqrt{2}$ : $f(x) = \\sqrt{2}x$ ، وتمثيلها المستقيم الذي يشمل O و $(1 ; \\sqrt{2})$ ، أو O و $(\\sqrt{2} ; 2)$.',
    },
  },

  // تمرين 33 (أتعمّق) — −5/2 x = 4 et −5/2 x ≤ 3, graphiquement puis algébriquement
  {
    id: 'ex-33-a', source: E(33, 75, AT, '1)'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '1) حل بيانيا ثم جبريا المعادلة $-\\dfrac{5}{2}x = 4$ . 2) حل بيانيا ثم جبريا المتراجحة $-\\dfrac{5}{2}x \\leqslant 3$ .',
    interaction: 'numeric',
    question: { prompt: '1) حل المعادلة:', expected: -1.6, display: '-1,6', explain: 'بيانيا: فاصلة نقطة المستقيم $y = -\\dfrac{5}{2}x$ التي ترتيبها 4. جبريا: $x = 4 \\div \\left(-\\dfrac{5}{2}\\right) = -\\dfrac{8}{5} = -1{,}6$.' },
  },
  {
    id: 'ex-33-b', source: E(33, 75, AT, '2)'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: {
      prompt: '2) حلول المتراجحة $-\\dfrac{5}{2}x \\leqslant 3$ هي الأعداد $x$ حيث:',
      options: ['$x \\geqslant -1{,}2$', '$x \\leqslant -1{,}2$', '$x \\geqslant 1{,}2$', '$x \\leqslant 1{,}2$'],
      correct: 0,
      cols: 2,
      explain: 'بيانيا: المستقيم ينزل، فهو تحت الخط $y = 3$ (أو عليه) ابتداءً من الفاصلة $-1{,}2$ نحو اليمين. جبريا: نقسم على $-\\dfrac{5}{2}$ السالب فينعكس الاتجاه: $x \\geqslant 3 \\div \\left(-\\dfrac{5}{2}\\right) = -1{,}2$.',
    },
    commonError: 'نسيان قلب اتجاه المتراجحة عند القسمة على عدد سالب ($x \\leqslant -1{,}2$).',
  },
];

/** Les parties d'un exercice. */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));

/** Accès par id. */
export const EX = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));
