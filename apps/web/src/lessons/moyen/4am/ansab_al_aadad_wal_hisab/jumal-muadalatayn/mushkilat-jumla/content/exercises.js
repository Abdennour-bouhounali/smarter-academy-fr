/**
 * Les exercices du درس 3 « حل مشكلات بتوظيف جمل معادلتين » — RÉÉCRITS par la plateforme (rollout 2026-11-12, unité 5 ; design L3 §7, verdict L3.9) :
 * mêmes idées, mêmes `id`, mêmes `learningPointId` (la preuve par كفاءة reste valide), mais contextes, mots et NOMBRES de la plateforme — plus aucun
 * énoncé du manuel. `source` garde l'élément du manuel avec `part: 'بأعداد المنصّة'` (le professeur voit que le texte est réécrit).
 *
 * Un exercice de modélisation se fait en ÉTAPES : la TRADUCTION (`batch`, une décision par ligne, chaque distracteur une jumla FAUSSE — non
 * équivalente — qui vient d'une erreur réelle : un prix compté comme un nombre, des parenthèses oubliées, un rapport retourné, une unité mêlée)
 * puis la RÉSOLUTION (`pair`, la ثنائية tapée). Toutes les solutions sont recalculées dans content/mission.test.js. Aucun ne montre la مسألة
 * (ni « x + y = 180 », ni (100 ; 80), ni « 150x », ni des personnes qui entrent à deux prix).
 */
import { src, addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_mushkilat-jumla_P1',
  P2: '4am_mushkilat-jumla_P2',
};

const OWN = 'بأعداد المنصّة';
const E = (n, page, section) => ({ ...src(`ex-${n}`, page, section, n), part: OWN });
const CASES = (a, b) => `$\\begin{cases} ${a} \\\\ ${b} \\end{cases}$`;

/**
 * Les jumal du module 2 (lues par la signature de la leçon, `_unit/signatures/mushkilat-jumla.js`) : la حصّالة grandie (verdict X2) et le problème
 * « على طريقة أبي كامل » (verdict X9).
 */
export const MODULE2_SYSTEMS = [
  { id: 'm2-coins', system: 'x+y=29|20x+5y=385' },
  { id: 'm2-abu-kamil', system: 'x+y=30|7x-3y=0' },
];

/* ── Module 2 — la طريقة appliquée : la حصّالة du groupe (grandie), le refus de p1, un problème « على طريقة أبي كامل » ── */
export const EXERCISES_1 = [
  {
    // x + y = 29 ; 20x + 5y = 385 → 15x = 240 → (16 ; 13) ; échangé : 20 × 13 + 5 × 16 = 340
    id: 'challenge', source: { ...src('challenge', 55, 'تحدّ'), part: OWN }, learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'كبرت «حصّالة القسم»: فيها الآن 29 قطعة نقدية من فئتي 20 دج و 5 دج، ومبلغها 385 دج. التجريب لم يعد ينفع! كم قطعة من كل فئة في الحصّالة؟',
    interaction: 'batch',
    question: {
      prompt: 'المرحلتان 1) و 2): نختار المجهولين ثم نترجم المشكلة.',
      rows: [
        { label: '1) المجهولان', options: ['$x$ عدد قطع 20 دج و $y$ عدد قطع 5 دج', '$x$ المبلغ و $y$ عدد القطع', '$x$ عدد القطع و $y$ قيمة القطعة الواحدة'], correct: 0, correction: 'المجهولان ما يسأل عنه السؤال: عدد القطع من كل فئة. المبلغ (385 دج) وعدد القطع (29) معلومان.' },
        { label: '2) الجملة', options: [CASES('x + y = 29', '20x + 5y = 385'), CASES('x + y = 385', '20x + 5y = 29'), CASES('20x + 5y = 29', 'x + y = 385')], correct: 0, correction: '«29 قطعة» تعدّ القطع: $x + y = 29$ ؛ «385 دج» مبلغ: كل قطعة من فئة 20 دج تساوي 20 : $20x + 5y = 385$ .' },
      ],
    },
    method: 'نسمّي ما يسأل عنه السؤال، ثم نترجم كل معلومة (العدد، المبلغ) بمعادلة.',
    commonError: 'ترجمة «29 قطعة» بالمعادلة $20x + 5y = 29$ : مساواة مبلغ بعدد قطع.',
  },
  {
    id: 'challenge-2', source: { ...src('challenge', 55, 'تحدّ'), part: OWN }, learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '3) حل الجملة $\\begin{cases} x + y = 29 \\\\ 20x + 5y = 385 \\end{cases}$ :',
      expected: { x: '16', y: '13' },
      explain: 'من الأولى $y = 29 - x$ ، نعوّض: $20x + 5(29 - x) = 385$ أي $15x = 240$ ومنه $x = 16$ ثم $y = 13$ .',
    },
  },
  {
    // 16 + 13 = 29 ; 20 × 16 + 5 × 13 = 320 + 65 = 385
    id: 'challenge-3', source: { ...src('challenge', 55, 'تحدّ'), part: OWN }, learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'batch',
    question: {
      prompt: 'المرحلتان 4) و 5): نتحقق في النص، ثم نجيب.',
      rows: [
        { label: '4) التحقق', options: ['$16 + 13 = 29$ و $20 \\times 16 + 5 \\times 13 = 385$', '$16 + 13 = 29$ فقط', '$20 \\times 13 + 5 \\times 16 = 385$'], correct: 0, correction: 'نتحقق من المعلومتين معًا: 29 قطعة، و $320 + 65 = 385$ دج. (أمّا $20 \\times 13 + 5 \\times 16 = 340$ .)' },
        { label: '5) الإجابة', options: ['في الحصّالة 16 قطعة من فئة 20 دج و 13 قطعة من فئة 5 دج.', 'في الحصّالة 13 قطعة من فئة 20 دج و 16 قطعة من فئة 5 دج.', 'في الحصّالة 16 قطعة.'], correct: 0, correction: '$x$ عدد قطع 20 دج و $y$ عدد قطع 5 دج : الجملة تذكر العددين، كلّ بفئته.' },
      ],
    },
    commonError: 'التحقق في معلومة واحدة: $(13 ; 16)$ تحقّق «29 قطعة» أيضًا، لكنها تعطي 340 دج لا 385 دج.',
  },
  {
    // le rappel de la manche p1 (verdict L3.3) : la jumla est juste, sa solution aussi — l'histoire refuse −3 maillots
    id: 'not-natural', source: addition('interaction_generation'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'في «دفتر التعاونية» ترجمتَ التسجيل بالجملة $\\begin{cases} x + y = 15 \\\\ 1100x + 700y = 17700 \\end{cases}$ ، فوجدت حلّها $(18 ; -3)$ ، ثم رفضت القصة هذا الحلّ.',
    interaction: 'choice',
    question: {
      prompt: 'لماذا رفضت القصة $y = -3$ ؟',
      options: [
        'عدد القمصان عدد طبيعي: لا يُباع $-3$ قميص، فالتسجيل مستحيل ولا جواب للمشكلة.',
        'الثنائية $(18 ; -3)$ لا تحقّق الجملة.',
        'أخطأنا في الحل: نعيد حلّ الجملة.',
      ],
      correct: 0, cols: 1,
      explain: '$18 + (-3) = 15$ و $1100 \\times 18 + 700 \\times (-3) = 17700$ : الحلّ صحيح ويحقّق الجملة، لكنّ القصة تعدّ قمصانًا. ولو كانت القمصان الخمسة عشر كلّها بأكمام طويلة لكانت المداخيل $16500$ دج فقط، أقلّ من $17700$ دج: التسجيل مستحيل.',
    },
    commonError: 'كتابة جواب بعدد سالب من القمصان دون الرجوع إلى القصة.',
  },
  {
    // x + y = 30 ; 7x = 3y → 7x = 3(30 − x) → 10x = 90 → (9 ; 21)
    id: 'abu-kamil', source: addition('interaction_generation'), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'على طريقة أبي كامل: اتّفق صاحب ورشة مع عامل: يأخذ العامل 7 دراهم عن كل يوم عمل، ويدفع 3 دراهم عن كل يوم غياب. بعد 30 يومًا لم يأخذ العامل شيئًا ولم يدفع شيئًا. كم يومًا عمل؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ عدد أيام العمل و $y$ عدد أيام الغياب.',
      rows: [
        { label: 'الجملة', options: [CASES('x + y = 30', '7x = 3y'), CASES('x + y = 30', '3x = 7y'), CASES('x + y = 30', '7x + 3y = 0')], correct: 0, correction: 'لم يأخذ شيئًا ولم يدفع شيئًا: ما كسبه بأيام العمل يساوي ما دفعه بأيام الغياب، $7x = 3y$ .' },
      ],
    },
    commonError: 'قلب المبلغين: $3x = 7y$ تجعل يوم العمل بـ 3 دراهم ويوم الغياب بـ 7.',
  },
  {
    id: 'abu-kamil-2', source: addition('interaction_generation'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'pair',
    question: {
      prompt: 'حل الجملة $\\begin{cases} x + y = 30 \\\\ 7x = 3y \\end{cases}$ :',
      expected: { x: '9', y: '21' },
      explain: '$y = 30 - x$ ، نعوّض: $7x = 3(30 - x)$ أي $10x = 90$ ومنه $x = 9$ ثم $y = 21$ . تحقّق: $7 \\times 9 = 63 = 3 \\times 21$ . عمل العامل 9 أيام.',
    },
  },
];

/* ── Module 3 — أوظّف تعلّماتي et أتعمّق, réécrits par la plateforme ──────────────────────────────────── */
export const EXERCISES = [
  {
    // a + b = 96 ; 5(a + 4) = 3(b + 4) ⇔ 5a − 3b = −8 → 8a = 280 → (35 ; 61) ; 39/65 = 3/5
    id: 'ex-14', source: E(14, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'مجموع عددين $a$ و $b$ هو 96. إذا أضفنا 4 إلى كل منهما صارت نسبتهما $\\dfrac{3}{5}$ . ما هما العددان؟',
    interaction: 'batch',
    question: {
      prompt: 'نسبتهما: $\\dfrac{a + 4}{b + 4} = \\dfrac{3}{5}$ .',
      rows: [
        { label: 'الجملة', options: [CASES('a + b = 96', '5(a + 4) = 3(b + 4)'), CASES('a + b = 96', '3(a + 4) = 5(b + 4)'), CASES('a + b = 96', '5a + 4 = 3b + 4')], correct: 0, correction: 'الجداءان المتصالبان: $\\dfrac{a + 4}{b + 4} = \\dfrac{3}{5}$ تعني $5(a + 4) = 3(b + 4)$ ، والقوسان يبقيان.' },
      ],
    },
    method: 'نكتب النسبة كسرًا، ثم نستعمل تساوي الجداءين المتصالبين.',
    commonError: 'نسيان القوسين: $5a + 4$ بدل $5(a + 4)$ .',
  },
  {
    id: 'ex-14-2', source: E(14, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: 'العددان $(a ; b)$ :',
      expected: { x: '35', y: '61' }, names: ['a', 'b'],
      explain: '$5a - 3b = -8$ و $b = 96 - a$ : $5a - 3(96 - a) = -8$ أي $8a = 280$ ومنه $a = 35$ و $b = 61$ . تحقّق: $\\dfrac{39}{65} = \\dfrac{3}{5}$ .',
    },
  },
  {
    // a + 4 = 3b ; a − 4 = 5b → 8 = −2b → b = −4, a = −16 ; a/b = 4
    id: 'ex-15', source: E(15, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'نعتبر النسبة $\\dfrac{a}{b}$ حيث $b \\neq 0$ . إذا أضفنا 4 إلى البسط $a$ صارت النسبة تساوي 3، وإذا أنقصنا 4 من البسط $a$ صارت النسبة تساوي 5. ما هي هذه النسبة؟',
    interaction: 'batch',
    question: {
      prompt: '$\\dfrac{a + 4}{b} = 3$ و $\\dfrac{a - 4}{b} = 5$ .',
      rows: [
        { label: 'الجملة', options: [CASES('a + 4 = 3b', 'a - 4 = 5b'), CASES('a + 4 = 3', 'a - 4 = 5'), CASES('a + 4b = 3', 'a - 4b = 5')], correct: 0, correction: 'نضرب طرفي كل مساواة في $b$ ($b \\neq 0$): $a + 4 = 3b$ و $a - 4 = 5b$ .' },
        { label: 'النسبة $\\dfrac{a}{b}$', options: ['$4$', '$-4$', '$\\dfrac{1}{4}$'], correct: 0, correction: 'بالطرح: $8 = -2b$ أي $b = -4$ ، ثم $a = 3 \\times (-4) - 4 = -16$ : $\\dfrac{-16}{-4} = 4$ .' },
      ],
    },
    commonError: 'رفض الحل لأنّ $a$ و $b$ سالبان: النص لا يشترط عددين موجبين، والنسبة $4$ .',
  },
  {
    id: 'ex-15-2', source: E(15, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'pair',
    question: {
      prompt: 'الثنائية $(a ; b)$ :',
      expected: { x: '-16', y: '-4' }, names: ['a', 'b'],
      explain: 'تحقّق: $\\dfrac{-16 + 4}{-4} = 3$ و $\\dfrac{-16 - 4}{-4} = 5$ . العددان سالبان، والنسبة $4$ .',
    },
  },
  {
    // x + y = 177 ; x = 5y + 3 → 6y = 174 → (148 ; 29), باقي 3 < 29
    id: 'ex-16', source: E(16, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'عددان طبيعيان مجموعهما 177. عند قسمة أكبرهما على أصغرهما يكون حاصل القسمة 5 والباقي 3. ما هما العددان؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ الأكبر و $y$ الأصغر.',
      rows: [
        { label: 'الجملة', options: [CASES('x + y = 177', 'x = 5y + 3'), CASES('x + y = 177', 'y = 5x + 3'), CASES('x + y = 177', 'x = 5y')], correct: 0, correction: 'القسمة الإقليدية للأكبر على الأصغر: $x = 5y + 3$ (المقسوم = القاسم × حاصل القسمة + الباقي).' },
      ],
    },
    commonError: 'نسيان الباقي: $x = 5y$ .',
  },
  {
    id: 'ex-16-2', source: E(16, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'pair',
    question: {
      prompt: 'العددان $(x ; y)$ :',
      expected: { x: '148', y: '29' },
      explain: 'نعوّض $x = 5y + 3$ : $6y + 3 = 177$ أي $y = 29$ و $x = 148$ . تحقّق: $148 = 5 \\times 29 + 3$ و $3 < 29$ .',
    },
  },
  {
    // x − y = 30 ; x + 6 = 4(y + 6) → y + 36 = 4y + 24 → (34 ; 4)
    id: 'ex-17', source: E(17, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'الفرق بين عددين هو 30. إذا أضفنا 6 إلى كل منهما، صار أكبرهما أربع مرات أصغرهما. ما هما العددان؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ الأكبر و $y$ الأصغر.',
      rows: [
        { label: 'الجملة', options: [CASES('x - y = 30', 'x + 6 = 4(y + 6)'), CASES('x - y = 30', 'x + 6 = 4y + 6'), CASES('x - y = 30', '4(x + 6) = y + 6')], correct: 0, correction: 'بعد الإضافة: الأكبر $x + 6$ أربع مرات الأصغر $y + 6$ كلّه: $x + 6 = 4(y + 6)$ .' },
      ],
    },
    commonError: 'ضرب $y$ وحده في 4: $4y + 6$ بدل $4(y + 6)$ .',
  },
  {
    id: 'ex-17-2', source: E(17, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: 'العددان $(x ; y)$ :',
      expected: { x: '34', y: '4' },
      explain: '$x = y + 30$ : $y + 36 = 4y + 24$ أي $3y = 12$ ومنه $y = 4$ و $x = 34$ . تحقّق: $40 = 4 \\times 10$ .',
    },
  },
  {
    // 2(x + y) = 140 ; (x − 3)(y + 3) = xy + 21 ⇔ 3x − 3y = 30 → x − y = 10 → (40 ; 30)
    id: 'ex-18', source: E(18, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'حقل مستطيل الشكل محيطه 140 m. عند إنقاص 3 m من طوله وزيادة 3 m إلى عرضه، تزداد مساحته بـ $21 m^2$ . ما بعدا الحقل في البداية؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ الطول و $y$ العرض (بالمتر).',
      rows: [
        { label: 'المحيط', options: ['$x + y = 140$', '$2(x + y) = 140$', '$xy = 140$'], correct: 1, correction: 'محيط المستطيل $2(x + y)$ ، أي $x + y = 70$ .' },
        { label: 'المساحة', options: ['$(x - 3)(y + 3) = 21$', '$(x + 3)(y - 3) = xy + 21$', '$(x - 3)(y + 3) = xy + 21$'], correct: 2, correction: 'المساحة الجديدة تزيد على القديمة $xy$ بـ 21.' },
        { label: 'تؤول معادلة المساحة إلى', options: ['$3x - 3y = 30$', '$3x - 3y = 21$', '$3x + 3y = 30$'], correct: 0, correction: '$xy + 3x - 3y - 9 = xy + 21$ : الحدّ $xy$ يختفي، و $3x - 3y = 30$ .' },
      ],
    },
    commonError: 'كتابة المحيط $x + y$ (نصف المحيط) بدل $2(x + y)$ .',
  },
  {
    id: 'ex-18-2', source: E(18, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'pair',
    question: {
      prompt: 'البعدان $(x ; y)$ بالمتر:',
      expected: { x: '40', y: '30' },
      explain: '$x + y = 70$ و $x - y = 10$ : بالجمع $2x = 80$ ، ومنه $x = 40$ و $y = 30$ . تحقّق: $37 \\times 33 = 1221 = 1200 + 21$ .',
    },
  },
  {
    // Ĉ = B̂ = y ; ACD = Â = x et (d) bissectrice : Ĉ = 2x ; x + 2y = 180 et y = 2x → 5x = 180 → (36 ; 72)
    id: 'ex-19', source: E(19, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'في الشكل، المثلث ABC متقايس الساقين رأسه A. المستقيم (d) منصّف الزاوية $\\widehat{C}$ ، يقطع [AB] في D ، و AD = DC. عيّن $x$ و $y$ قيسي الزاويتين $\\widehat{A}$ و $\\widehat{B}$ .',
    interaction: 'batch',
    question: {
      prompt: 'في المثلث ABC : $\\widehat{A} = x$ و $\\widehat{B} = y$ (بالدرجات).',
      rows: [
        { label: 'ABC متقايس الساقين رأسه A', options: ['$\\widehat{C} = x$', '$\\widehat{C} = y$', '$\\widehat{C} = 2y$'], correct: 1, correction: 'زاويتا القاعدة متقايستان: $\\widehat{C} = \\widehat{B} = y$ .' },
        { label: 'AD = DC و (d) منصّف $\\widehat{C}$', options: ['$\\widehat{C} = 2x$', '$\\widehat{C} = x$', '$\\widehat{C} = \\dfrac{x}{2}$'], correct: 0, correction: 'ADC متقايس الساقين: $\\widehat{ACD} = \\widehat{A} = x$ ، و (d) منصّف فـ $\\widehat{C} = 2x$ .' },
        { label: 'الجملة', options: [CASES('2x + y = 180', 'y = 2x'), CASES('x + 2y = 180', 'y = 2x'), CASES('x + 2y = 180', 'x = 2y')], correct: 1, correction: 'مجموع زوايا المثلث: $x + y + y = 180$ ، و $\\widehat{C} = y = 2x$ .' },
      ],
    },
    commonError: 'عدّ زاوية الرأس مرّتين بدل زاويتي القاعدة: $2x + y$ بدل $x + 2y$ .',
  },
  {
    id: 'ex-19-2', source: E(19, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'pair',
    question: {
      prompt: 'القيسان $(x ; y)$ بالدرجات:',
      expected: { x: '36', y: '72' },
      explain: 'نعوّض $y = 2x$ : $x + 4x = 180$ أي $x = 36$ و $y = 72$ . تحقّق: $36 + 72 + 72 = 180$ .',
    },
  },
  {
    // x + y = 40 ; 4x + 2y = 124 → 2x = 44 → (22 ; 18)
    id: 'ex-20', source: E(20, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'في مزرعة أرانب ودجاج، عدّ الفلّاح الرؤوس فوجد 40 رأسًا، ثم عدّ السيقان فوجد 124 ساقًا. كم أرنبًا وكم دجاجة في المزرعة؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ عدد الأرانب و $y$ عدد الدجاج.',
      rows: [
        { label: '«40 رأسًا»', options: ['$4x + 2y = 40$', '$x + y = 40$', '$2x + 4y = 40$'], correct: 1, correction: 'لكل حيوان رأس واحد: $x + y = 40$ .' },
        { label: '«124 ساقًا»', options: ['$4x + 2y = 124$', '$2x + 4y = 124$', '$x + y = 124$'], correct: 0, correction: 'للأرنب 4 سيقان وللدجاجة ساقان: $4x + 2y = 124$ .' },
      ],
    },
    commonError: 'قلب المعاملين: $2x + 4y$ يعطي الأرانب ساقين.',
  },
  {
    id: 'ex-20-2', source: E(20, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'pair',
    question: {
      prompt: '(عدد الأرانب ; عدد الدجاج) :',
      expected: { x: '22', y: '18' },
      explain: 'نطرح ضعف الأولى من الثانية: $2x = 44$ أي $x = 22$ و $y = 18$ . تحقّق: $88 + 36 = 124$ ساقًا.',
    },
  },
  {
    // EA = 6, AB = 4, DC = 5, périmètre de ABCD 25 → x + y = 16 ; AD/BC = EA/EB = 6/10 → 10y = 6x → (10 ; 6)
    id: 'ex-21', source: E(21, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'وحدة الطول هي السنتيمتر، والأطوال على الشكل ليست حقيقية. ABCD شبه منحرف محيطه 25. احسب $x$ و $y$ .',
    interaction: 'batch',
    question: {
      prompt: 'في المثلث EBC: A من [EB] و D من [EC] و (AD) يوازي (BC) ؛ EA = 6 ، AB = 4 ، DC = 5 ، AD = $y$ ، BC = $x$ .',
      rows: [
        { label: 'المحيط', options: ['$x + y = 25$', '$x + y + 9 = 25$', '$2(x + y) = 25$'], correct: 1, correction: 'محيط ABCD هو $AB + BC + CD + DA = 4 + x + 5 + y$ .' },
        { label: 'خاصية طالس', options: ['$\\dfrac{y}{x} = \\dfrac{6}{4}$', '$\\dfrac{x}{y} = \\dfrac{6}{10}$', '$\\dfrac{y}{x} = \\dfrac{6}{10}$'], correct: 2, correction: '$\\dfrac{AD}{BC} = \\dfrac{EA}{EB}$ و $EB = 6 + 4 = 10$ : $\\dfrac{y}{x} = \\dfrac{6}{10}$ أي $10y = 6x$ .' },
      ],
    },
    commonError: 'أخذ $\\dfrac{EA}{AB} = \\dfrac{6}{4}$ بدل $\\dfrac{EA}{EB} = \\dfrac{6}{10}$ .',
  },
  {
    id: 'ex-21-2', source: E(21, 61, 'أوظّف تعلّماتي'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'pair',
    question: {
      prompt: 'الطولان $(x ; y)$ بالسنتيمتر:',
      expected: { x: '10', y: '6' },
      explain: '$y = \\dfrac{3}{5}x$ : $x + \\dfrac{3}{5}x = 16$ أي $\\dfrac{8}{5}x = 16$ ومنه $x = 10$ و $y = 6$ . تحقّق: $4 + 10 + 5 + 6 = 25$ .',
    },
  },
  {
    // x + y = 1500 ; x − y = 64 → 2x = 1564 → (782 ; 718)
    id: 'ex-24', source: E(24, 63, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'عددان طبيعيان مجموعهما 1500 والفرق بينهما 64. عيّن هذين العددين.',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ الأكبر و $y$ الأصغر.',
      rows: [
        { label: 'الجملة', options: [CASES('x + y = 64', 'x - y = 1500'), CASES('x + y = 1500', 'x - y = 64'), CASES('x + y = 1500', 'y - x = 64')], correct: 1, correction: 'المجموع 1500 والفرق (الأكبر ناقص الأصغر) 64.' },
      ],
    },
    commonError: 'كتابة الفرق $y - x$ والأصغر أوّلًا: يعطي عددًا سالبًا.',
  },
  {
    id: 'ex-24-2', source: E(24, 63, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'facile',
    interaction: 'pair',
    question: {
      prompt: 'العددان $(x ; y)$ :',
      expected: { x: '782', y: '718' },
      explain: 'بالجمع طرفًا لطرف: $2x = 1564$ أي $x = 782$ ، ثم $y = 718$ . عددان طبيعيان: $782 + 718 = 1500$ و $782 - 718 = 64$ .',
    },
  },
  {
    // x + y = 26 ; (x + 4)(y − 2) = xy ⇔ −2x + 4y = 8 → x = 2y − 4 → 3y = 30 → (16 ; 10)
    id: 'ex-25', source: E(25, 63, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'مستطيل محيطه 52 سم. إذا زدنا طوله بـ 4 سم وأنقصنا عرضه بـ 2 سم، بقيت مساحته نفسها. عيّن بُعدَي هذا المستطيل.',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ الطول و $y$ العرض (بالسنتيمتر).',
      rows: [
        { label: 'المحيط', options: ['$x + y = 52$', '$x + y = 26$', '$xy = 52$'], correct: 1, correction: '$2(x + y) = 52$ أي $x + y = 26$ .' },
        { label: 'المساحة', options: ['$(x + 4)(y - 2) = xy$', '$(x - 4)(y + 2) = xy$', '$(x + 4)(y - 2) = 0$'], correct: 0, correction: 'المساحة الجديدة تساوي المساحة القديمة $xy$ .' },
        { label: 'تؤول إلى', options: ['$4x - 2y = 8$', '$-2x + 4y = 0$', '$-2x + 4y = 8$'], correct: 2, correction: '$xy - 2x + 4y - 8 = xy$ أي $-2x + 4y = 8$ .' },
      ],
    },
    commonError: 'معادلة المساحة $(x + 4)(y - 2) = 0$ : «بقيت مساحته نفسها» لا تعني أنها معدومة.',
  },
  {
    id: 'ex-25-2', source: E(25, 63, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'pair',
    question: {
      prompt: 'البعدان $(x ; y)$ بالسنتيمتر:',
      expected: { x: '16', y: '10' },
      explain: '$x = 2y - 4$ : $2y - 4 + y = 26$ أي $3y = 30$ ومنه $y = 10$ و $x = 16$ . تحقّق: $20 \\times 8 = 160 = 16 \\times 10$ .',
    },
  },
  {
    // x + y = 31 ; x + 4 = 2(y + 4) → x = 2y + 4 → 3y = 27 → (22 ; 9)
    id: 'ex-26', source: E(26, 63, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'أخ وأخته يتعاونان في مراجعة دروسهما. مجموع عمريهما اليوم 31 سنة. بعد 4 سنوات يصير عمر الأخ ضعف عمر أخته. عيّن عمر كلّ منهما.',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ عمر الأخ و $y$ عمر الأخت اليوم.',
      rows: [
        { label: '«بعد 4 سنوات»', options: ['$x + 4 = 2y + 4$', '$x + 4 = 2(y + 4)$', '$2(x + 4) = y + 4$'], correct: 1, correction: 'بعد 4 سنوات يكبر كل واحد بـ 4، وعمر الأخ ضعف عمر أخته كلّه: $x + 4 = 2(y + 4)$ .' },
      ],
    },
    commonError: 'مضاعفة $y$ وحده: $2y + 4$ بدل $2(y + 4)$ .',
  },
  {
    id: 'ex-26-2', source: E(26, 63, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '(عمر الأخ ; عمر الأخت) :',
      expected: { x: '22', y: '9' },
      explain: '$x = 2y + 4$ : $3y + 4 = 31$ أي $y = 9$ و $x = 22$ . تحقّق: بعد 4 سنوات $26 = 2 \\times 13$ .',
    },
  },
  {
    // 1 kg 80 g = 1080 g ; 7x + 6y = 1080 ; y = x/3 → 9x = 1080 → (120 ; 40)
    id: 'ex-27', source: E(27, 63, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'أهدت أسرة فاكهة لجيرانها: تزن 7 برتقالات و 6 حبّات مشمش معًا 1 kg 80 g، ووزن حبّة المشمش $\\dfrac{1}{3}$ وزن البرتقالة. عيّن وزن كلّ ثمرة (الثمرات المتشابهة متساوية الوزن).',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ وزن البرتقالة و $y$ وزن حبّة المشمش (بالغرام).',
      rows: [
        { label: '«1 kg 80 g»', options: ['$7x + 6y = 1{,}80$', '$7x + 6y = 108$', '$7x + 6y = 1080$'], correct: 2, correction: 'وحدة واحدة في المعادلة: 1 kg 80 g = 1080 g .' },
        { label: '«$\\dfrac{1}{3}$ وزن البرتقالة»', options: ['$y = \\dfrac{1}{3}x$', '$x = \\dfrac{1}{3}y$', '$y = x - \\dfrac{1}{3}$'], correct: 0, correction: 'وزن حبّة المشمش $y$ هو ثلث وزن البرتقالة $x$ .' },
      ],
    },
    commonError: 'خلط الوحدتين: كتابة 1 kg 80 g على شكل 1,80 أو 108.',
  },
  {
    id: 'ex-27-2', source: E(27, 63, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: 'الوزنان $(x ; y)$ بالغرام:',
      expected: { x: '120', y: '40' },
      explain: '$7x + 6 \\times \\dfrac{1}{3}x = 1080$ أي $9x = 1080$ ومنه $x = 120$ و $y = 40$ . تحقّق: $840 + 240 = 1080$ .',
    },
  },
  {
    // (2x + y)/3 = 12 ; (x + 2y)/3 = 14 → 2x + y = 36 ; x + 2y = 42 → x + y = 26, x − y = −6 → (10 ; 16)
    id: 'ex-28', source: E(28, 63, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'تُنقّط الأعمال على 20. تحصّل تلميذ على علامة فرض بمعامل 2 وعلامة واجب منزلي بمعامل 1، فكان معدّله 12. لو تبادل المعاملان لكان معدّله 14. ما علامة الفرض وما علامة الواجب؟',
    interaction: 'batch',
    question: {
      prompt: 'نسمّي $x$ علامة الفرض و $y$ علامة الواجب.',
      rows: [
        { label: 'الجملة', options: [CASES('2x + y = 12', 'x + 2y = 14'), CASES('\\dfrac{2x + y}{3} = 12', '\\dfrac{x + 2y}{3} = 14'), CASES('\\dfrac{2x + y}{2} = 12', '\\dfrac{x + 2y}{2} = 14')], correct: 1, correction: 'المعدّل = مجموع (العلامة × المعامل) ÷ مجموع المعاملات $2 + 1 = 3$ .' },
      ],
    },
    commonError: 'نسيان القسمة على مجموع المعاملات: $2x + y = 12$ .',
  },
  {
    id: 'ex-28-2', source: E(28, 63, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'pair',
    question: {
      prompt: '(علامة الفرض ; علامة الواجب) :',
      expected: { x: '10', y: '16' },
      explain: '$2x + y = 36$ و $x + 2y = 42$ : بالجمع $3x + 3y = 78$ أي $x + y = 26$ ، وبالطرح $x - y = -6$ ، ومنه $x = 10$ و $y = 16$ .',
    },
  },
];

/** Les entrées d'un exercice (module 3), par numéro : « 14 », « 21 »… */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));

/** Accès par id. */
export const EX = Object.fromEntries([...EXERCISES_1, ...EXERCISES].map((ex) => [ex.id, ex]));
