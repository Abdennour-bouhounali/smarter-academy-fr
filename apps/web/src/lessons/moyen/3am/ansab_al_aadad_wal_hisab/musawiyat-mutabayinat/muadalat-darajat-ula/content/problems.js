/**
 * Les trois « مسائل » du درس « المعادلات من الدرجة الأولى بمجهول واحد » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 (`LESSON_CONFIG.lessonProblem`) : 8 livres → il manque 160 DA, 6 livres → il reste 120 DA (8x − 160 = 6x + 120, x = 140) ; la 2 la
 * sortie scolaire (150n + 1200 = 200n − 800, n = 40) ; la 3 trois numéros de maillot consécutifs de somme 63 (x = 20). Chaque مسألة suit la méthode de la
 * leçon : choisir l'inconnue, écrire l’équation, résoudre, déclarer, VÉRIFIER dans l'histoire. Chaque nombre est vérifié dans ./problems.test.js en
 * arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — كتب للمكتبة المدرسية',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '📚',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'ثمانية كتب: ينقصهما 160 دج', useful: true },
      { id: 'd2', text: 'ستة كتب: يبقى معهما 120 دج', useful: true },
      { id: 'd3', text: 'الكتب للمكتبة المدرسية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المعادلة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المعادلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarhiq-mushkila'],
            prompt: 'المبلغ الذي معهما بدلالة $x$ : ثمن 8 كتب ناقصًا 160 يساوي ثمن 6 كتب زائدًا 120. المعادلة:',
            options: ['$8x - 160 = 6x + 120$', '$8x + 160 = 6x - 120$', '$8x - 160 = 6x - 120$', '$8x + 160 = 6x + 120$'], correct: 0, cols: 2,
            explain: 'ينقصهما $160$ لشراء 8 كتب: المبلغ $8x - 160$ ؛ ويبقى $120$ بعد 6 كتب: المبلغ $6x + 120$ . (القراءة العكسية لـ « ينقصهما » و « يبقى » تعطي المعادلات الأخرى.)' },
          { kind: 'solution', ask: 0, lines: [
            'نختار المجهول: ثمن الكتاب $x$ دينارًا.',
            'المبلغ الذي معهما: $8x - 160$ في الحالة الأولى و $6x + 120$ في الثانية.',
            'المعادلة: $8x - 160 = 6x + 120$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ثمن الكتاب',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['ثمن الكتاب الواحد'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-hall'], prompt: 'ثمن الكتاب الواحد بالدينار:', expected: 140,
            explain: 'نضيف $-6x$ و $160$ إلى الطرفين: $2x = 280$ ، ثم نقسم على $2$ : $x = 140$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$8x - 160 - 6x = 6x + 120 - 6x$ أي $2x - 160 = 120$ .',
            '$2x - 160 + 160 = 120 + 160$ أي $2x = 280$ ، فـ $x = 140$ .',
            'ثمن الكتاب الواحد $140$ دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'التحقق',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['المبلغ الذي معهما'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tahqqaq-taawid'], prompt: 'المبلغ الذي معهما بالدينار:', expected: 960,
            explain: '$8 \\times 140 - 160 = 960$ و $6 \\times 140 + 120 = 960$ : المبلغان متساويان، فالحلّ مقبول في القصة.' },
          { kind: 'solution', ask: 0, lines: [
            'نعوّض $x = 140$ : $8 \\times 140 - 160 = 1120 - 160 = 960$ .',
            'و $6 \\times 140 + 120 = 840 + 120 = 960$ .',
            'المبلغان متساويان: معهما $960$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الرحلة المدرسية',
    context: 'مساهمتان مختلفتان للتلميذ',
    emoji: '🚌',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'مساهمة 150 دج', lines: [{ label: 'ينقص دج', value: '1200' }] }, { title: 'مساهمة 200 دج', lines: [{ label: 'يزيد دج', value: '800' }] }, { title: 'المطلوب', lines: [{ label: 'عدد التلاميذ', value: 'n' }] }], ariaLabel: 'ثلاث بطاقات: مساهمة 150 دينارًا ينقص 1200 دينار، ومساهمة 200 دينار يزيد 800 دينار، والمطلوب عدد التلاميذ n' },
    statement: 'تنظّم إكمالية رحلة لتلاميذ قسم إلى حديقة التسلية، ويتعاون التلاميذ في تسديد كلفتها. إذا ساهم كل تلميذ بـ $150$ دج فينقص $1200$ دج لتسديد الكلفة، وإذا ساهم كل تلميذ بـ $200$ دج فيزيد $800$ دج على الكلفة. نسمّي $n$ عدد التلاميذ.',
    data: [
      { id: 'a', text: 'مساهمة 150 دج للتلميذ: ينقص 1200 دج', useful: true },
      { id: 'b', text: 'مساهمة 200 دج للتلميذ: يزيد 800 دج', useful: true },
      { id: 'c', text: 'الرحلة إلى حديقة التسلية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المعادلة',
        question: 'اكتب المعادلة التي تعبّر عن أنّ كلفة الرحلة هي نفسها في الحالتين.',
        asks: ['المعادلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarhiq-mushkila'],
            prompt: 'كلفة الرحلة بدلالة $n$ : المساهمات زائد ما ينقص تساوي المساهمات ناقص ما يزيد. المعادلة:',
            options: ['$150n + 1200 = 200n - 800$', '$150n - 1200 = 200n + 800$', '$150n + 1200 = 200n + 800$', '$150n - 1200 = 200n - 800$'], correct: 0, cols: 2,
            explain: 'إذا كان ينقص $1200$ فالكلفة $150n + 1200$ ؛ وإذا زاد $800$ فالكلفة $200n - 800$ .' },
          { kind: 'solution', ask: 0, lines: [
            'كلفة الرحلة: $150n + 1200$ في الحالة الأولى و $200n - 800$ في الثانية.',
            'المعادلة: $150n + 1200 = 200n - 800$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'عدد التلاميذ',
        question: 'حلّ المعادلة. كم تلميذًا يشارك؟',
        asks: ['عدد التلاميذ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-hall'], prompt: 'عدد التلاميذ:', expected: 40,
            explain: 'نضيف $-200n$ و $-1200$ إلى الطرفين: $-50n = -2000$ ؛ نقسم على $-50$ : $n = 40$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$150n + 1200 - 200n = 200n - 800 - 200n$ أي $-50n + 1200 = -800$ .',
            '$-50n = -2000$ ؛ نقسم الطرفين على $-50$ : $n = 40$ .',
            'يشارك $40$ تلميذًا.',
          ] },
        ],
      },
      {
        label: '3)', title: 'كلفة الرحلة',
        question: 'تحقّق من النتيجة: كم دينارًا كلفة الرحلة؟',
        asks: ['كلفة الرحلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tahqqaq-taawid'], prompt: 'كلفة الرحلة بالدينار:', expected: 7200,
            explain: '$150 \\times 40 + 1200 = 7200$ و $200 \\times 40 - 800 = 7200$ : الكلفتان متساويتان.' },
          { kind: 'solution', ask: 0, lines: [
            'نعوّض $n = 40$ : $150 \\times 40 + 1200 = 6000 + 1200 = 7200$ .',
            'و $200 \\times 40 - 800 = 8000 - 800 = 7200$ .',
            'كلفة الرحلة $7200$ دج.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — أرقام القمصان',
    context: 'ثلاثة أعداد متتابعة',
    emoji: '👕',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'اللاعبون', lines: [{ label: 'عددهم', value: '3' }] }, { title: 'أرقام قمصانهم', lines: [{ label: 'أصغرها', value: 'x' }] }, { title: 'مجموعها', lines: [{ label: 'يساوي', value: '63' }] }], ariaLabel: 'ثلاث بطاقات: ثلاثة لاعبين، وأصغر أرقام قمصانهم x، ومجموعها 63' },
    statement: 'يرتدي ثلاثة لاعبين في فريق الحيّ قمصانًا تحمل ثلاثة أعداد صحيحة متتابعة، أصغرها $x$ ومجموعها $63$ . يتدرّب الفريق بإتقان ويحترم الجميع الأدوار.',
    data: [
      { id: 'n', text: 'ثلاثة أعداد صحيحة متتابعة', useful: true },
      { id: 's', text: 'مجموعها 63', useful: true },
      { id: 'f', text: 'فريق الحيّ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المعادلة',
        question: 'اكتب معادلة تعبّر عن المشكلة.',
        asks: ['المعادلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarhiq-mushkila'],
            prompt: 'العددان الآخران بدلالة $x$ هما $x + 1$ و $x + 2$ . المعادلة:',
            options: ['$x + (x + 1) + (x + 2) = 63$', '$x + 1 + 2 = 63$', '$3x = 63$', '$x + 2x + 3x = 63$'], correct: 0, cols: 1,
            explain: 'نجمع الأعداد الثلاثة: $x + (x + 1) + (x + 2) = 63$ . ($3x = 63$ تنسى $1$ و $2$ ؛ والأخريان تضربان بدل أن تضيفا.)' },
          { kind: 'solution', ask: 0, lines: [
            'الأعداد: $x$ و $x + 1$ و $x + 2$ .',
            'المعادلة: $x + (x + 1) + (x + 2) = 63$ أي $3x + 3 = 63$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'أصغر رقم',
        question: 'حلّ المعادلة. ما أصغر رقم؟',
        asks: ['أصغر رقم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqat-hall'], prompt: 'أصغر رقم:', expected: 20,
            explain: 'نضيف $-3$ إلى الطرفين: $3x = 60$ ؛ نقسم على $3$ : $x = 20$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$3x + 3 - 3 = 63 - 3$ أي $3x = 60$ .',
            'نقسم الطرفين على $3$ : $x = 20$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'أكبر رقم',
        question: 'استنتج أكبر رقم، ثم تحقّق أنّ المجموع $63$ .',
        asks: ['أكبر رقم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tahqqaq-taawid'], prompt: 'أكبر رقم:', expected: 22,
            explain: 'الأرقام $20$ و $21$ و $22$ : مجموعها $63$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الأرقام الثلاثة: $20$ و $21$ و $22$ .',
            'نتحقق: $20 + 21 + 22 = 63$ . أكبر رقم $22$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
