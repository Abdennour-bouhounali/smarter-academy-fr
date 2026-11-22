/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (modules 1 à 6) — des situations
 * COMPLÈTES de type امتحان qui mobilisent les quatre leçons de l'unité 4
 * (équation, produit nul, inéquation et sa représentation, traduction d'un
 * texte) et le développement / la factorisation de l'unité 3, résolues pas à
 * pas (common/problems/GuidedProblem.jsx), AVANT la situation évaluée du
 * module 8 (« وضعية الاختبار النهائي » : le مسبح البلدي, 75x contre 560 + 5x).
 *
 * Décision du propriétaire (2026-10-13) : étendre à toutes les synthèses le
 * schéma de l'unité 1 (`wadiya-idmajiya-aadad`). Ce sont des AJOUTS DE LA
 * PLATEFORME, déclarés comme tels (`addition('exam_style_problem')`), jamais
 * présentés comme des exercices du manuel. Aucune n'emploie les nombres du
 * مسبح (75, 560, 5, 8, 9, 600) : la situation évaluée reste inédite, et
 * « تحليل الوضعية » (module 7) ne la résout pas.
 *
 *   1  مكتبة          deux formules d'achat (450x contre 3000 + 300x) : essai, inéquation, 21 livres
 *   2  نادي الرياضيات  E = (3x − 1)² − (3x − 1)(x + 5) : développer, factoriser, produit nul, E < B
 *   3  الحصّالتان      deux épargnes qui se rejoignent (1200 + 150x = 800 + 250x), puis se dépassent
 *   4  الحديقة         périmètre 4x + 16 : équation (72 m) puis inéquation (≤ 100 m)
 *   5  الرحلة          deux conditions à la fois : 22,5 ≤ x ≤ 25, donc 23, 24 ou 25 élèves
 *   6  السجّادتان      A = (x + 2)², B = x(x + 6) : B − A = 2x − 4, B > A pour x > 2 (renuméroté le 2026-11-12 : x > 8
 *                      était la solution du défi 🏆 — content/forbidden.js)
 *
 * Chaque pas ne s'appuie que sur les savoirs des leçons 1 à 4 et de l'unité 3
 * (priorKnowledge) : jamais sur une brique que les modules 7 ou 9 enseignent.
 * Valeurs (LESSON_DEVELOPMENT_GUIDE § Values in story contexts) : une clause
 * par énoncé (القراءة، التعاون، التكافل، حبّ الوطن، الأمانة، إتقان العمل).
 * Chaque nombre est recalculé dans ./problems.test.js. Aucune sous-étape n'est
 * une `assessment` : la maîtrise vient du module 8 seulement.
 */
import { addition } from '../../_unit/unitMeta.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  /* ───────────────────────── 1 — بطاقة المكتبة ───────────────────────── */
  {
    id: 'wadiya-1',
    title: 'الوضعية التدريبية 1 — بطاقة المكتبة',
    context: 'مفاضلة بين صيغتين لاقتناء الكتب',
    emoji: '📚',
    source: SOURCE,
    tone: 'sky',
    illustration: {
      kind: 'tags',
      cards: [
        { title: 'الصيغة (أ)', icon: 'book', lines: [{ label: 'ثمن كل كتاب', value: 450, unit: 'دج' }] },
        { title: 'الصيغة (ب)', icon: 'book', lines: [{ label: 'بطاقة العضوية', value: 3000, unit: 'دج' }, { label: 'ثمن كل كتاب', value: 300, unit: 'دج' }] },
      ],
      ariaLabel: 'بطاقتان لصيغتي شراء الكتب في المكتبة: في الأولى يُدفع 450 دج ثمنًا للكتاب، وفي الثانية بطاقة عضوية 3000 دج ثم 300 دج ثمنًا للكتاب',
    },
    statement: 'حرصًا على نشر العلم وحبّ القراءة بين التلاميذ، تقترح مكتبة المدينة صيغتين لشراء الكتب. الصيغة (أ): ثمن كل كتاب 450 دج دون أي اشتراك. الصيغة (ب): بطاقة عضوية تُدفع مرّة واحدة قدرها 3000 دج، ثم يُباع كل كتاب بـ 300 دج. تريد سلمى اقتناء عدد من الكتب بأقلّ تكلفة ممكنة.',
    parts: [
      {
        label: '1)', title: 'تكلفة 12 كتابًا',
        question: 'ما تكلفة اقتناء 12 كتابًا بالصيغة (أ)؟ وبالصيغة (ب)؟',
        asks: ['تكلفة 12 كتابًا بالصيغة (أ)', 'تكلفة 12 كتابًا بالصيغة (ب)'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama'],
            prompt: 'نسمّي $x$ عدد الكتب. تكلفة $x$ كتابًا بالصيغة (ب) هي:',
            options: ['$3000 + 300x$', '$(3000 + 300)x$', '$3000x + 300$', '$3000 + 300 + x$'],
            correct: 0, cols: 2,
            explain: 'بطاقة العضوية تُدفع مرّة واحدة فتُضاف كما هي، أمّا ثمن كل كتاب 300 دج فيتكرّر مع كل كتاب فيُضرب في $x$. (وتكلفة الصيغة (أ) هي $450x$.)' },
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'تكلفة 12 كتابًا بالصيغة (أ):', expected: 5400, shape: 'quantity', unit: 'دج',
            explain: '$450 \\times 12 = 5400$ دج.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tarrid-tarjama'],
            prompt: 'تكلفة 12 كتابًا بالصيغة (ب):', expected: 6600, shape: 'quantity', unit: 'دج',
            explain: '$3000 + 300 \\times 12 = 3000 + 3600 = 6600$ دج.' },
          { kind: 'choice', role: 'conclude',
            prompt: 'من أجل 12 كتابًا، أيّ الصيغتين أقل تكلفة؟',
            options: ['الصيغة (أ)، لأنّ $5400 < 6600$', 'الصيغة (ب)، لأنّ بطاقة العضوية تخفّض ثمن كل كتاب', 'الصيغتان متساويتان'],
            correct: 0,
            explain: 'نقارن التكلفتين: $5400 < 6600$. بطاقة العضوية لا تُسترجع، ولا يعوّضها انخفاض ثمن كل كتاب إلا إذا اقتنت سلمى عددًا كافيًا من الكتب.' },
          { kind: 'solution', ask: 0, lines: [
            'تكلفة الصيغة (أ): $450 \\times 12 = 5400$ دج.',
            'تكلفة الصيغة (ب): $3000 + 300 \\times 12 = 3000 + 3600 = 6600$ دج.',
            'من أجل 12 كتابًا، الصيغة (أ) أقل تكلفة لأنّ $5400 < 6600$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'متى تصبح الصيغة (ب) أفضل؟',
        question: 'اكتب المتراجحة التي تترجم «الصيغة (ب) أفضل» ثم حلّها. ابتداءً من أي عدد من الكتب تكون الصيغة (ب) أفضل؟',
        asks: ['حلول المتراجحة', 'أصغر عدد من الكتب'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama', 'hall-mutarajiha'],
            prompt: '«الصيغة (ب) أفضل من الصيغة (أ)» تُترجم بالمتراجحة:',
            options: ['$3000 + 300x < 450x$', '$3000 + 300x > 450x$', '$3000 + 300x = 450x$', '$3000x + 300 < 450x$'],
            correct: 0, cols: 2,
            explain: '«أفضل» تعني «أقل تكلفة»: تكلفة الصيغة (ب) أقل من تكلفة الصيغة (أ). المساواة تصف لحظة تساوي التكلفتين فقط.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mutarajiha'],
            prompt: 'حلول المتراجحة هي الأعداد $x$ حيث:', expected: 20, shape: 'gap', subject: 'x > \\ldots',
            explain: '$3000 < 450x - 300x$ أي $3000 < 150x$ ، والقسمة على 150 (عدد موجب) تحافظ على الاتجاه: $20 < x$ أي $x > 20$.' },
          { kind: 'choice', role: 'conclude',
            prompt: 'ماذا يحدث من أجل 20 كتابًا بالضبط؟',
            options: [
              'تتساوى التكلفتان: $450 \\times 20 = 3000 + 300 \\times 20 = 9000$ دج، فلا تكون الصيغة (ب) أفضل',
              'تكون الصيغة (ب) أفضل، لأنّ 20 هو الحدّ في $x > 20$',
              'تكون الصيغة (أ) أفضل بـ 3000 دج',
            ],
            correct: 0,
            explain: '$450 \\times 20 = 9000$ و $3000 + 300 \\times 20 = 3000 + 6000 = 9000$ : التكلفتان متساويتان. والعدد 20 لا يحقّق $x > 20$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-mutarajiha'],
            prompt: 'ابتداءً من أي عدد من الكتب تكون الصيغة (ب) أفضل؟', expected: 21, suffix: 'كتابًا',
            explain: 'عدد الكتب عدد طبيعي، وأصغر عدد طبيعي يحقّق $x > 20$ هو 21. ونتحقّق: $450 \\times 21 = 9450$ و $3000 + 300 \\times 21 = 9300$ ، و $9300 < 9450$.' },
          { kind: 'solution', ask: 0, lines: [
            '«الصيغة (ب) أفضل» تعني أنّ تكلفتها أقل: $3000 + 300x < 450x$.',
            '$3000 < 450x - 300x$ أي $3000 < 150x$ ومنه $x > 20$.',
            'من أجل 20 كتابًا تتساوى التكلفتان ($9000$ دج)، وعدد الكتب عدد طبيعي: الصيغة (ب) أفضل ابتداءً من 21 كتابًا.',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────── 2 — ورقة نادي الرياضيات ───────────────────── */
  {
    id: 'wadiya-2',
    title: 'الوضعية التدريبية 2 — ورقة نادي الرياضيات',
    context: 'نشر وتحليل ومعادلة ومتراجحة',
    emoji: '🧮',
    source: SOURCE,
    tone: 'indigo',
    illustration: {
      kind: 'scene', icon: 'pen', bg: 'violet',
      chips: [
        { label: 'تلاميذ يتعاونون', value: 3, tone: 'violet' },
        { label: 'ورقة تمارين واحدة', value: 1, tone: 'amber' },
      ],
      ariaLabel: 'ثلاثة تلاميذ من نادي الرياضيات يتعاونون على حلّ ورقة تمارين واحدة',
    },
    statement: 'في نادي الرياضيات بالمتوسّطة، تعاون ثلاثة تلاميذ على حلّ ورقة تمارين واحدة بدل أن يعمل كل منهم وحده، فاقتسموا الأسئلة. كان نصيب أولهم دراسة العبارة $E = (3x - 1)^2 - (3x - 1)(x + 5)$ حيث $x$ عدد. وكان نصيب ثانيهم العبارة $B = 6x^2 + 4x - 6$ لمقارنتها بالعبارة $E$.',
    parts: [
      {
        label: '1)', title: 'الشكل المنشور',
        question: 'انشر العبارة E وبسّطها.',
        asks: ['الشكل المنشور والمبسّط للعبارة E'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['nashr-tahlil'],
            prompt: 'أكمل نشر $(3x - 1)(x + 5)$ :', expected: 14, shape: 'gap', subject: '(3x - 1)(x + 5) = 3x^2 + \\ldots x - 5',
            explain: '$(3x - 1)(x + 5) = 3x^2 + 15x - x - 5 = 3x^2 + 14x - 5$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nashr-tahlil'],
            prompt: 'الشكل المنشور والمبسّط للعبارة $E$ هو:',
            options: ['$6x^2 - 20x + 6$', '$6x^2 + 8x - 4$', '$6x^2 - 20x - 4$', '$6x^2 - 14x + 6$'],
            correct: 0, cols: 2,
            explain: '$(3x - 1)^2 = 9x^2 - 6x + 1$ ، ثم نطرح $3x^2 + 14x - 5$ بتغيير إشارة كل حدّ داخل القوسين: $9x^2 - 6x + 1 - 3x^2 - 14x + 5 = 6x^2 - 20x + 6$.' },
          { kind: 'solution', ask: 0, lines: [
            '$(3x - 1)^2 = 9x^2 - 6x + 1$ و $(3x - 1)(x + 5) = 3x^2 + 15x - x - 5 = 3x^2 + 14x - 5$.',
            '$E = 9x^2 - 6x + 1 - (3x^2 + 14x - 5) = 9x^2 - 6x + 1 - 3x^2 - 14x + 5 = 6x^2 - 20x + 6$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'التحليل والجداء المعدوم',
        question: 'حلّل العبارة E إلى جداء عاملين، ثم حل المعادلة $E = 0$ .',
        asks: ['تحليل العبارة E', 'حلّا المعادلة E = 0'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nashr-tahlil'],
            prompt: 'تحليل العبارة $E$ إلى جداء عاملين:',
            options: ['$(3x - 1)(2x - 6)$', '$(3x - 1)(4x + 4)$', '$(3x - 1)(2x + 4)$', '$(3x - 1)(-2x + 6)$'],
            correct: 0, cols: 2,
            explain: 'العامل المشترك $3x - 1$ : $E = (3x - 1)[(3x - 1) - (x + 5)] = (3x - 1)(3x - 1 - x - 5) = (3x - 1)(2x - 6)$. (الإشارة «−» تشمل العدد 5 أيضًا.)' },
          { kind: 'numeric', role: 'compute', requires: ['nashr-tahlil'],
            prompt: 'تحقّق من الشكلين: قيمة $E$ من أجل $x = 0$ بالشكل المحلّل $(3x - 1)(2x - 6)$ :', expected: 6, shape: 'gap', subject: 'E = \\ldots',
            explain: '$(3 \\times 0 - 1)(2 \\times 0 - 6) = (-1) \\times (-6) = 6$ ، وهي قيمة الشكل المنشور $6x^2 - 20x + 6$ من أجل $x = 0$.' },
          { kind: 'choice', role: 'translate', requires: ['jidaa-maadum-khassiya'],
            prompt: 'المعادلة $(3x - 1)(2x - 6) = 0$ تعني:',
            options: ['$3x - 1 = 0$ أو $2x - 6 = 0$', '$3x - 1 = 0$ و $2x - 6 = 0$ معًا', '$(3x - 1) + (2x - 6) = 0$'],
            correct: 0,
            explain: 'جداء معدوم ⇔ أحد عامليه على الأقل معدوم: نحلّ معادلتين، لكل عامل حلّه.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['hall-muadala', 'jidaa-maadum-khassiya'],
            prompt: 'حلّا المعادلة $E = 0$ :',
            options: ['$x = \\dfrac{1}{3}$ أو $x = 3$', '$x = -\\dfrac{1}{3}$ أو $x = -3$', '$x = 3$ فقط', '$x = \\dfrac{1}{3}$ أو $x = -3$'],
            correct: 0, cols: 2,
            explain: '$3x - 1 = 0$ يعطي $x = \\dfrac{1}{3}$ ، و $2x - 6 = 0$ يعطي $x = 3$.' },
          { kind: 'solution', ask: 0, lines: [
            '$E = (3x - 1)[(3x - 1) - (x + 5)] = (3x - 1)(2x - 6)$.',
            '$E = 0$ يعني $3x - 1 = 0$ أو $2x - 6 = 0$ (خاصية الجداء المعدوم).',
            'أي $x = \\dfrac{1}{3}$ أو $x = 3$ : للمعادلة حلّان.',
          ] },
        ],
      },
      {
        label: '3)', title: 'المقارنة بين E و B',
        question: 'حل المتراجحة $E < B$ ثم مثّل حلولها على مستقيم مدرّج. هل العدد $\\dfrac{1}{2}$ حلّ لها؟',
        asks: ['حلول المتراجحة E < B', 'تمثيل الحلول على المستقيم المدرّج', 'هل العدد 1/2 حلّ؟'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['nashr-tahlil', 'hall-mutarajiha'],
            prompt: 'المتراجحة $6x^2 - 20x + 6 < 6x^2 + 4x - 6$ تختصر إلى $-20x + 6 < 4x - 6$ ، أي:', expected: -12, shape: 'gap', subject: '-24x < \\ldots',
            explain: 'نقل $4x$ إلى الطرف الأول و 6 إلى الطرف الثاني: $-20x - 4x < -6 - 6$ أي $-24x < -12$.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['hall-mutarajiha'],
            prompt: 'قسمة الطرفين على $-24$ تعطي حلول المتراجحة:',
            options: ['$x > \\dfrac{1}{2}$', '$x < \\dfrac{1}{2}$', '$x > -\\dfrac{1}{2}$', '$x > 2$'],
            correct: 0, cols: 2,
            explain: 'نقسم على عدد سالب فيتغيّر اتجاه المتراجحة: $-24x < -12$ يعطي $x > \\dfrac{-12}{-24} = \\dfrac{1}{2}$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tamthil-hulul'],
            prompt: 'تمثيل حلول $x > \\dfrac{1}{2}$ على مستقيم مدرّج:',
            options: [
              'الجزء الملوّن على يمين $\\dfrac{1}{2}$ ، والمعقوف عند $\\dfrac{1}{2}$ متّجه نحو الخارج (العدد ليس منه)',
              'الجزء الملوّن على يسار $\\dfrac{1}{2}$ ، والمعقوف متّجه نحو الجزء الملوّن (العدد منه)',
              'الجزء الملوّن على يمين $\\dfrac{1}{2}$ ، والمعقوف متّجه نحو الجزء الملوّن (العدد منه)',
            ],
            correct: 0,
            explain: 'الحلول هي الأعداد الأكبر قطعًا من $\\dfrac{1}{2}$ : على يمينه، والعدد $\\dfrac{1}{2}$ نفسه ليس حلًّا لأنّ المتراجحة قطعية، فالمعقوف يتّجه عكس الجزء الملوّن.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['hall-mutarajiha'],
            prompt: 'هل العدد $\\dfrac{1}{2}$ حلّ للمتراجحة $E < B$ ؟',
            options: ['لا: من أجل $x = \\dfrac{1}{2}$ تتساوى العبارتان $E = B = -2.5$', 'نعم: لأنّه الحدّ في $x > \\dfrac{1}{2}$', 'نعم: لأنّ $E$ أصغر من $B$'],
            correct: 0,
            explain: '$E\\left(\\dfrac{1}{2}\\right) = 6 \\times \\dfrac{1}{4} - 20 \\times \\dfrac{1}{2} + 6 = 1.5 - 10 + 6 = -2.5$ و $B\\left(\\dfrac{1}{2}\\right) = 1.5 + 2 - 6 = -2.5$ : المساواة لا تحقّق المتراجحة القطعية.' },
          { kind: 'solution', ask: 0, lines: [
            '$E < B$ تعني $6x^2 - 20x + 6 < 6x^2 + 4x - 6$ ، فيختفي الحدّ $6x^2$ من الطرفين: $-20x + 6 < 4x - 6$.',
            '$-24x < -12$ ، وبالقسمة على $-24$ (عدد سالب) يتغيّر الاتجاه: $x > \\dfrac{1}{2}$.',
            'التمثيل: الجزء الملوّن على يمين $\\dfrac{1}{2}$ والعدد $\\dfrac{1}{2}$ ليس حلًّا (متراجحة قطعية).',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────── 3 — حصّالتا سمير وياسين ───────────────────── */
  {
    id: 'wadiya-3',
    title: 'الوضعية التدريبية 3 — حصّالتا سمير وياسين',
    context: 'ادّخار يلتقي ثم يتجاوز',
    emoji: '🏺',
    source: SOURCE,
    tone: 'amber',
    illustration: {
      kind: 'scene', icon: 'jar', bg: 'amber',
      chips: [
        { label: 'في حصّالة سمير', value: 1200, unit: 'دج', tone: 'blue' },
        { label: 'يضيف سمير كل أسبوع', value: 150, unit: 'دج', tone: 'blue' },
        { label: 'في حصّالة ياسين', value: 800, unit: 'دج', tone: 'amber' },
        { label: 'يضيف ياسين كل أسبوع', value: 250, unit: 'دج', tone: 'amber' },
      ],
      ariaLabel: 'حصّالتان: في حصّالة سمير 1200 دج ويضيف إليها 150 دج كل أسبوع، وفي حصّالة ياسين 800 دج ويضيف إليها 250 دج كل أسبوع',
    },
    statement: 'يدّخر سمير وياسين، تلميذان في السنة الرابعة متوسّط، لشراء كسوة الشتاء لأسرة محتاجة في حيّهما، فقد اتفقا على التكافل. في حصّالة سمير 1200 دج ويضيف إليها 150 دج كل أسبوع، وفي حصّالة ياسين 800 دج ويضيف إليها 250 دج كل أسبوع. ثمن الكسوة 4500 دج.',
    parts: [
      {
        label: '1)', title: 'متى يتساوى المبلغان؟',
        question: 'بعد كم أسبوعًا يصبح في الحصّالتين المبلغ نفسه؟ وكم يكون هذا المبلغ؟',
        asks: ['عدد الأسابيع', 'المبلغ في كل حصّالة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama'],
            prompt: 'نسمّي $x$ عدد الأسابيع. المعادلة التي تترجم «المبلغ نفسه في الحصّالتين» هي:',
            options: ['$1200 + 150x = 800 + 250x$', '$1200 + 150x = 250x$', '$1200x + 150 = 800x + 250$', '$1200 + 150 = 800 + 250$'],
            correct: 0, cols: 1,
            explain: 'بعد $x$ أسبوعًا يصبح عند سمير $1200 + 150x$ وعند ياسين $800 + 250x$ : المبلغ الابتدائي يُضاف مرّة واحدة، والمبلغ الأسبوعي يُضرب في $x$.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-muadala'],
            prompt: 'بجمع الحدود المتشابهة: $1200 - 800 = 250x - 150x$ أي:', expected: 100, shape: 'gap', subject: '400 = \\ldots x',
            explain: 'ننقل $150x$ إلى الطرف الثاني و 800 إلى الطرف الأول بتغيير الإشارة: $400 = 100x$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-muadala'],
            prompt: 'عدد الأسابيع:', expected: 4, suffix: 'أسابيع',
            explain: '$100x = 400$ ومنه $x = 4$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'المبلغ في كل حصّالة بعد هذه المدّة:', expected: 1800, shape: 'quantity', unit: 'دج',
            explain: 'عند سمير: $1200 + 150 \\times 4 = 1800$ ، وعند ياسين: $800 + 250 \\times 4 = 1800$.' },
          { kind: 'solution', ask: 0, lines: [
            'بعد $x$ أسبوعًا: $1200 + 150x = 800 + 250x$.',
            '$1200 - 800 = 250x - 150x$ أي $400 = 100x$ ومنه $x = 4$.',
            'بعد 4 أسابيع يكون في كل حصّالة $1200 + 150 \\times 4 = 1800$ دج ($800 + 250 \\times 4 = 1800$ أيضًا).',
          ] },
        ],
      },
      {
        label: '2)', title: 'متى يتفوّق ياسين؟',
        question: 'ابتداءً من أي أسبوع يصبح مبلغ ياسين أكبر من مبلغ سمير؟',
        asks: ['حلول المتراجحة', 'أوّل أسبوع يتفوّق فيه ياسين'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama', 'hall-mutarajiha'],
            prompt: '«مبلغ ياسين أكبر من مبلغ سمير» يُترجم بالمتراجحة:',
            options: ['$800 + 250x > 1200 + 150x$', '$800 + 250x < 1200 + 150x$', '$800 + 250x = 1200 + 150x$', '$250x > 150x$'],
            correct: 0, cols: 2,
            explain: 'مبلغ ياسين بعد $x$ أسبوعًا هو $800 + 250x$ ، ومبلغ سمير $1200 + 150x$ : «أكبر من» تعني الرمز $>$ بين المبلغين.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mutarajiha'],
            prompt: 'حلول المتراجحة هي الأعداد $x$ حيث:', expected: 4, shape: 'gap', subject: 'x > \\ldots',
            explain: '$250x - 150x > 1200 - 800$ أي $100x > 400$ ، والقسمة على 100 (موجب) تحافظ على الاتجاه: $x > 4$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-mutarajiha'],
            prompt: 'أوّل أسبوع يصبح فيه مبلغ ياسين أكبر من مبلغ سمير:', expected: 5, suffix: 'الأسبوع',
            explain: 'عند الأسبوع 4 يتساوى المبلغان (1800 دج)، فلا تفوّق. وأصغر عدد طبيعي يحقّق $x > 4$ هو 5: $800 + 250 \\times 5 = 2050$ و $1200 + 150 \\times 5 = 1950$.' },
          { kind: 'solution', ask: 0, lines: [
            '$800 + 250x > 1200 + 150x$ ومنه $100x > 400$ أي $x > 4$.',
            'عند الأسبوع 4 يتساوى المبلغان، والأسبوع عدد طبيعي: يتفوّق ياسين ابتداءً من الأسبوع الخامس.',
            'تحقّق: بعد 5 أسابيع عند ياسين $2050$ دج وعند سمير $1950$ دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'شراء الكسوة',
        question: 'يجمع التلميذان مبلغيهما معًا لشراء الكسوة. بعد كم أسبوعًا على الأقل يكفي ما اجتمع لشرائها؟',
        asks: ['حلول المتراجحة', 'أصغر عدد من الأسابيع'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama', 'hall-mutarajiha'],
            prompt: '«المجموع يكفي لشراء الكسوة» يُترجم بالمتراجحة:',
            options: ['$2000 + 400x \\geq 4500$', '$2000 + 400x \\leq 4500$', '$2000x + 400 \\geq 4500$', '$2000 + 400x = 4500$'],
            correct: 0, cols: 2,
            explain: 'مجموع المبلغين: $(1200 + 150x) + (800 + 250x) = 2000 + 400x$. يكفي إذا لم يقلّ عن ثمن الكسوة: $2000 + 400x \\geq 4500$.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-mutarajiha'],
            prompt: '$400x \\geq 4500 - 2000$ أي:', expected: 2500, shape: 'gap', subject: '400x \\geq \\ldots',
            explain: '$4500 - 2000 = 2500$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mutarajiha'],
            prompt: 'حلول المتراجحة هي الأعداد $x$ حيث:', expected: 6.25, shape: 'gap', subject: 'x \\geq \\ldots',
            explain: '$x \\geq \\dfrac{2500}{400} = 6.25$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'أصغر عدد من الأسابيع يكفي فيه المبلغ:', expected: 7, suffix: 'أسابيع',
            explain: 'عدد الأسابيع عدد طبيعي، وأصغر عدد طبيعي يحقّق $x \\geq 6.25$ هو 7: بعد 6 أسابيع نجد $2000 + 400 \\times 6 = 4400 < 4500$ ، وبعد 7 أسابيع $2000 + 400 \\times 7 = 4800 \\geq 4500$.' },
          { kind: 'solution', ask: 0, lines: [
            '$(1200 + 150x) + (800 + 250x) \\geq 4500$ أي $2000 + 400x \\geq 4500$.',
            '$400x \\geq 2500$ ومنه $x \\geq 6.25$.',
            'عدد الأسابيع عدد طبيعي: يكفي المبلغ بعد 7 أسابيع على الأقل ($4800$ دج)، ولا يكفي بعد 6 أسابيع ($4400$ دج).',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────── 4 — حديقة يوم الشجرة ───────────────────── */
  {
    id: 'wadiya-4',
    title: 'الوضعية التدريبية 4 — حديقة يوم الشجرة',
    context: 'محيط مستطيل: معادلة ثم متراجحة',
    emoji: '🌳',
    source: SOURCE,
    tone: 'emerald',
    illustration: { kind: 'plan', shape: 'rect', fill: 'garden', w: 'x + 8', h: 'x', unit: 'م', ariaLabel: 'حديقة مستطيلة عرضها x وطولها x + 8 بالمتر' },
    statement: 'بمناسبة يوم الشجرة، يريد تلاميذ المتوسّطة، حبًّا لوطنهم، تهيئة حديقة مستطيلة الشكل أمام مدرستهم عرضها $x$ متر وطولها يزيد عن عرضها بـ 8 أمتار، ثم إحاطتها بسياج من الشبك.',
    parts: [
      {
        label: '1)', title: 'محيط الحديقة',
        question: 'اكتب بدلالة $x$ عبارة المحيط $P$ للحديقة ثم بسّطها.',
        asks: ['عبارة المحيط المبسّطة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama'],
            prompt: 'محيط الحديقة بدلالة $x$ (قبل التبسيط):',
            options: ['$2[x + (x + 8)]$', '$x + (x + 8)$', '$x(x + 8)$', '$2x + x + 8$'],
            correct: 0, cols: 2,
            explain: 'محيط المستطيل ضعف مجموع بعديه: العرض $x$ والطول $x + 8$. أمّا $x(x + 8)$ فهي المساحة.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nashr-tahlil'],
            prompt: 'أكمل:', expected: 16, shape: 'gap', subject: 'P = 4x + \\ldots',
            explain: '$P = 2(2x + 8) = 4x + 16$.' },
          { kind: 'solution', ask: 0, lines: [
            'العرض $x$ والطول $x + 8$ ، إذن $P = 2[x + (x + 8)] = 2(2x + 8)$.',
            'بالنشر: $P = 4x + 16$.',
          ] },
        ],
      },
      {
        label: '2)', title: '72 مترًا من الشبك',
        question: 'يملك التلاميذ 72 مترًا من الشبك تكفي لإحاطة الحديقة بالضبط. ما عرضها؟ وما طولها؟ وما مساحتها؟',
        asks: ['عرض الحديقة', 'طول الحديقة', 'مساحة الحديقة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama'],
            prompt: 'المعادلة التي تترجم «72 مترًا تكفي بالضبط» هي:',
            options: ['$4x + 16 = 72$', '$4x + 16 < 72$', '$4x = 72 + 16$', '$4x + 16 = 8 \\times 72$'],
            correct: 0, cols: 2,
            explain: 'الشبك يكفي بالضبط لإحاطة الحديقة: المحيط يساوي 72 متر: $4x + 16 = 72$.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-muadala'],
            prompt: '$4x = 72 - 16$ أي:', expected: 56, shape: 'gap', subject: '4x = \\ldots',
            explain: '$72 - 16 = 56$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-muadala'],
            prompt: 'عرض الحديقة:', expected: 14, shape: 'quantity', unit: 'm',
            explain: '$4x = 56$ ومنه $x = 14$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'طول الحديقة:', expected: 22, shape: 'quantity', unit: 'm',
            explain: 'الطول $x + 8 = 14 + 8 = 22$.' },
          { kind: 'numeric', role: 'answer', ask: 2,
            prompt: 'مساحة الحديقة:', expected: 308, shape: 'quantity', unit: 'm²',
            explain: '$14 \\times 22 = 308$. ونتحقّق من المحيط: $2 \\times (14 + 22) = 72$.' },
          { kind: 'solution', ask: 0, lines: [
            '$P = 72$ يعني $4x + 16 = 72$ أي $4x = 56$ ومنه $x = 14$.',
            'عرض الحديقة 14 م وطولها $14 + 8 = 22$ م، ومساحتها $14 \\times 22 = 308$ م².',
            'تحقّق: $2 \\times (14 + 22) = 72$ م.',
          ] },
        ],
      },
      {
        label: '3)', title: 'شبك لا يزيد على 100 م',
        question: 'تبرّعت البلدية بشبك طوله 100 مترًا على الأكثر. ما قيم $x$ الممكنة؟',
        asks: ['حلول المتراجحة', 'قيم العرض الممكنة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama', 'hall-mutarajiha'],
            prompt: '«الشبك لا يزيد على 100 م» يُترجم بالمتراجحة:',
            options: ['$4x + 16 \\leq 100$', '$4x + 16 \\geq 100$', '$4x + 16 < 100$', '$4x + 16 = 100$'],
            correct: 0, cols: 2,
            explain: 'المحيط $4x + 16$ لا يتجاوز 100: قد يساوي 100 تمامًا، فنستعمل الرمز $\\leq$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mutarajiha'],
            prompt: 'حلول المتراجحة هي الأعداد $x$ حيث:', expected: 21, shape: 'gap', subject: 'x \\leq \\ldots',
            explain: '$4x \\leq 100 - 16$ أي $4x \\leq 84$ ، والقسمة على 4 (موجب) تحافظ على الاتجاه: $x \\leq 21$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['hall-mutarajiha'],
            prompt: 'العرض $x$ عدد موجب قطعًا. قيم $x$ الممكنة هي:',
            options: ['$0 < x \\leq 21$', '$x \\leq 21$ فقط', '$0 < x < 21$', '$x \\geq 21$'],
            correct: 0, cols: 2,
            explain: 'يجب أن يكون العرض موجبًا ($x > 0$) ولا يتجاوز 21 ($x \\leq 21$) ؛ والعدد 21 ممكن لأنّ المتراجحة غير قطعية: المحيط حينئذ $4 \\times 21 + 16 = 100$.' },
          { kind: 'solution', ask: 0, lines: [
            '$4x + 16 \\leq 100$ أي $4x \\leq 84$ ومنه $x \\leq 21$.',
            'العرض موجب، إذن $0 < x \\leq 21$.',
            'أكبر عرض ممكن هو 21 م: يكون المحيط حينئذ $4 \\times 21 + 16 = 100$ م.',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────── 5 — رحلة النادي ───────────────────── */
  {
    id: 'wadiya-5',
    title: 'الوضعية التدريبية 5 — رحلة النادي',
    context: 'شرطان معًا على عدد المشاركين',
    emoji: '🚌',
    source: SOURCE,
    tone: 'teal',
    illustration: {
      kind: 'tags',
      cards: [
        { title: 'تكاليف الرحلة', icon: 'bus', lines: [{ label: 'إيجار الحافلة', value: 4500, unit: 'دج' }, { label: 'غداء كل تلميذ', value: 100, unit: 'دج' }] },
        { title: 'مالية النادي', icon: 'coin', lines: [{ label: 'يدفع كل تلميذ', value: 300, unit: 'دج' }, { label: 'الميزانية القصوى', value: 7000, unit: 'دج' }] },
      ],
      ariaLabel: 'بطاقتان: تكاليف الرحلة (إيجار الحافلة 4500 دج وغداء كل تلميذ 100 دج) ومالية النادي (يدفع كل تلميذ 300 دج والميزانية القصوى 7000 دج)',
    },
    statement: 'ينظّم النادي الثقافي للمتوسّطة رحلة إلى متحف المجاهد ليتعرّف التلاميذ على تاريخ وطنهم. تكلفة إيجار الحافلة 4500 دج تُدفع مرّة واحدة، ويُضاف 100 دج لكل تلميذ ثمنًا للغداء. يدفع كل تلميذ مشارك 300 دج، ويحرص أمين صندوق النادي بأمانة على ألّا يخسر النادي وألّا تتجاوز التكلفة الإجمالية للرحلة الميزانية المرصودة وقدرها 7000 دج. نسمّي $x$ عدد التلاميذ المشاركين.',
    parts: [
      {
        label: '1)', title: 'التكلفة والمبلغ المحصَّل',
        question: 'عبّر بدلالة $x$ عن تكلفة الرحلة $C$ وعن المبلغ $R$ الذي يحصّله النادي من التلاميذ.',
        asks: ['تكلفة الرحلة C', 'المبلغ المحصَّل R'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarrid-tarjama'],
            prompt: 'تكلفة الرحلة بدلالة $x$:',
            options: ['$C = 4500 + 100x$', '$C = 4500x + 100$', '$C = (4500 + 100)x$', '$C = 4500 + 300x$'],
            correct: 0, cols: 2,
            explain: 'إيجار الحافلة يُدفع مرّة واحدة فيُضاف كما هو، وغداء كل تلميذ يتكرّر مع كل مشارك فيُضرب في $x$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tarrid-tarjama'],
            prompt: 'المبلغ الذي يحصّله النادي:',
            options: ['$R = 300x$', '$R = 300 + x$', '$R = 300x - 4500$', '$R = 4500 + 300x$'],
            correct: 0, cols: 2,
            explain: 'كل تلميذ يدفع 300 دج: $x$ تلميذ يدفعون $300 \\times x = 300x$. أمّا $300x - 4500$ فهي الربح، لا المبلغ المحصَّل.' },
          { kind: 'numeric', role: 'compute', requires: ['tarrid-tarjama'],
            prompt: 'من أجل 20 تلميذًا، كم يكلّف النادي أن ينظّم الرحلة؟', expected: 6500, shape: 'quantity', unit: 'دج',
            explain: '$C = 4500 + 100 \\times 20 = 4500 + 2000 = 6500$ دج، بينما لا يحصّل إلا $300 \\times 20 = 6000$ دج : النادي يخسر.' },
          { kind: 'solution', ask: 0, lines: [
            'إيجار الحافلة يُدفع مرّة واحدة وغداء كل تلميذ يتكرّر: $C = 4500 + 100x$.',
            'يدفع كل تلميذ 300 دج: $R = 300x$.',
            'مثال: من أجل 20 تلميذًا $C = 6500$ دج و $R = 6000$ دج، فيخسر النادي.',
          ] },
        ],
      },
      {
        label: '2)', title: 'ألّا يخسر النادي',
        question: 'لا يخسر النادي إذا كان المبلغ المحصَّل لا يقل عن التكلفة. ما أصغر عدد من التلاميذ المشاركين؟',
        asks: ['حلول المتراجحة', 'أصغر عدد من المشاركين'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama', 'hall-mutarajiha'],
            prompt: '«المبلغ المحصَّل لا يقل عن التكلفة» يُترجم بالمتراجحة:',
            options: ['$300x \\geq 4500 + 100x$', '$300x \\leq 4500 + 100x$', '$300x > 4500 + 100x$', '$300x = 4500 + 100x$'],
            correct: 0, cols: 2,
            explain: '«لا يقل عن» تعني «أكبر أو يساوي»: $R \\geq C$ ، أي $300x \\geq 4500 + 100x$.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-mutarajiha'],
            prompt: '$300x - 100x \\geq 4500$ أي:', expected: 4500, shape: 'gap', subject: '200x \\geq \\ldots',
            explain: 'ننقل $100x$ إلى الطرف الأول: $300x - 100x = 200x$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mutarajiha'],
            prompt: 'حلول المتراجحة هي الأعداد $x$ حيث:', expected: 22.5, shape: 'gap', subject: 'x \\geq \\ldots',
            explain: '$x \\geq \\dfrac{4500}{200} = 22.5$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'أصغر عدد من التلاميذ المشاركين:', expected: 23, suffix: 'تلميذًا',
            explain: 'عدد التلاميذ عدد طبيعي، وأصغر عدد طبيعي يحقّق $x \\geq 22.5$ هو 23 (ومن أجل 22 تلميذًا: $R = 6600$ أقل من $C = 6700$).' },
          { kind: 'solution', ask: 0, lines: [
            '$R \\geq C$ تعني $300x \\geq 4500 + 100x$ أي $200x \\geq 4500$ ومنه $x \\geq 22.5$.',
            'عدد التلاميذ عدد طبيعي: يلزم 23 تلميذًا على الأقل حتى لا يخسر النادي.',
          ] },
        ],
      },
      {
        label: '3)', title: 'احترام الميزانية',
        question: 'يجب ألّا تتجاوز التكلفة $C$ الميزانية 7000 دج. أوجد حلول المتراجحة المناسبة، ثم عيّن أعداد التلاميذ المشاركين التي تحقّق الشرطين معًا.',
        asks: ['حلول المتراجحة', 'أعداد المشاركين الممكنة'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['tarrid-tarjama', 'hall-mutarajiha'],
            prompt: '«التكلفة لا تتجاوز الميزانية» تُترجم بالمتراجحة:',
            options: ['$4500 + 100x \\leq 7000$', '$4500 + 100x \\geq 7000$', '$4500 + 300x \\leq 7000$', '$100x \\leq 7000$'],
            correct: 0, cols: 2,
            explain: '«لا تتجاوز» تعني «أصغر أو تساوي»، والتكلفة هي $C = 4500 + 100x$.' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hall-mutarajiha'],
            prompt: 'حلول المتراجحة هي الأعداد $x$ حيث:', expected: 25, shape: 'gap', subject: 'x \\leq \\ldots',
            explain: '$100x \\leq 7000 - 4500 = 2500$ ومنه $x \\leq 25$.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['hall-mutarajiha'],
            prompt: 'نبحث عن الأعداد الطبيعية التي تحقّق $x \\geq 22.5$ و $x \\leq 25$ معًا. أعداد التلاميذ الممكنة:',
            options: ['23 و 24 و 25', '22 و 23 و 24 و 25', '23 و 24', 'من 25 إلى 40'],
            correct: 0, cols: 2,
            explain: 'الأعداد المشتركة بين الحلّين: $22.5 \\leq x \\leq 25$ ، وهي من الأعداد الطبيعية 23 و 24 و 25. أمّا 22 فلا يحقّق $x \\geq 22.5$ : النادي يخسر.' },
          { kind: 'solution', ask: 0, lines: [
            '$C \\leq 7000$ تعني $4500 + 100x \\leq 7000$ أي $100x \\leq 2500$ ومنه $x \\leq 25$.',
            'الشرطان معًا: $22.5 \\leq x \\leq 25$ ، والعدد طبيعي.',
            'يمكن أن يشارك 23 أو 24 أو 25 تلميذًا.',
          ] },
        ],
      },
    ],
  },

  /* ───────────────────── 6 — سجّادتا المصلّى ───────────────────── */
  {
    id: 'wadiya-6',
    title: 'الوضعية التدريبية 6 — سجّادتا المصلّى',
    context: 'مساحتان، ونشر، وفرق، ومتراجحة',
    emoji: '🧶',
    source: SOURCE,
    tone: 'rose',
    illustration: {
      kind: 'tags',
      cards: [
        { title: 'سجّادة مربّعة', icon: 'tile', lines: [{ label: 'طول الضلع', value: 'x + 2', unit: 'م' }] },
        { title: 'سجّادة مستطيلة', icon: 'tile', lines: [{ label: 'البعد الأول', value: 'x', unit: 'م' }, { label: 'البعد الثاني', value: 'x + 6', unit: 'م' }] },
      ],
      ariaLabel: 'بطاقتان: سجّادة مربّعة طول ضلعها x + 2 بالمتر، وسجّادة مستطيلة بُعداها x و x + 6 بالمتر',
    },
    statement: 'يتقن نجّار ماهر عمله، فيفصّل بعناية سجّادتين لمصلّى المدرسة: الأولى مربّعة طول ضلعها $(x + 2)$ متر، والثانية مستطيلة بُعداها $x$ متر و $(x + 6)$ متر، حيث $x$ عدد موجب. نرمز بـ $A$ إلى مساحة السجّادة المربّعة وبـ $B$ إلى مساحة السجّادة المستطيلة.',
    parts: [
      {
        label: '1)', title: 'مساحتا السجّادتين',
        question: 'انشر كلًّا من $A$ و $B$ .',
        asks: ['الشكل المنشور للعبارة A', 'الشكل المنشور للعبارة B'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nashr-tahlil'],
            prompt: 'الشكل المنشور للعبارة $A = (x + 2)^2$ :',
            options: ['$x^2 + 4x + 4$', '$x^2 + 4$', '$x^2 + 2x + 4$', '$x^2 + 4x + 2$'],
            correct: 0, cols: 2,
            explain: '$(x + 2)^2 = x^2 + 2 \\times x \\times 2 + 2^2 = x^2 + 4x + 4$. الجداء المضاعف $4x$ لا يُنسى.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['nashr-tahlil'],
            prompt: 'أكمل:', expected: 6, shape: 'gap', subject: 'B = x(x + 6) = x^2 + \\ldots x',
            explain: '$x(x + 6) = x \\times x + x \\times 6 = x^2 + 6x$.' },
          { kind: 'solution', ask: 0, lines: [
            '$A = (x + 2)^2 = x^2 + 4x + 4$.',
            '$B = x(x + 6) = x^2 + 6x$.',
          ] },
        ],
      },
      {
        label: '2)', title: 'متى تكون المستطيلة أكبر مساحة؟',
        question: 'احسب $B - A$ ثم حل المتراجحة $B > A$ . ابتداءً من أي قيمة لـ $x$ تكون مساحة السجّادة المستطيلة أكبر؟',
        asks: ['الفرق B − A', 'حلول المتراجحة B > A', 'القيم التي تكون فيها المستطيلة أكبر مساحة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nashr-tahlil'],
            prompt: 'أكمل:', expected: 4, shape: 'gap', subject: 'B - A = 2x - \\ldots',
            explain: '$B - A = (x^2 + 6x) - (x^2 + 4x + 4) = x^2 + 6x - x^2 - 4x - 4 = 2x - 4$. يختفي الحدّ $x^2$.' },
          { kind: 'numeric', role: 'compute', requires: ['hall-mutarajiha'],
            prompt: '$B > A$ تعني $2x - 4 > 0$ أي:', expected: 4, shape: 'gap', subject: '2x > \\ldots',
            explain: 'نضيف 4 إلى الطرفين: $2x > 4$.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hall-mutarajiha'],
            prompt: 'حلول المتراجحة هي الأعداد $x$ حيث:', expected: 2, shape: 'gap', subject: 'x > \\ldots',
            explain: 'قسمة الطرفين على 2 (موجب) تحافظ على الاتجاه: $x > 2$.' },
          { kind: 'choice', role: 'conclude',
            prompt: 'ماذا يحدث من أجل $x = 2$ ؟',
            options: ['تتساوى المساحتان: $A = 4^2 = 16$ و $B = 2 \\times 8 = 16$', 'تكون المستطيلة أكبر مساحة لأنّ 2 هو الحدّ', 'تكون المربّعة أكبر بـ 4 م²'],
            correct: 0,
            explain: '$A = (2 + 2)^2 = 16$ و $B = 2 \\times (2 + 6) = 16$ ، والعدد 2 لا يحقّق $x > 2$ : فلا تكون المستطيلة أكبر.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['hall-mutarajiha'],
            prompt: 'تكون مساحة السجّادة المستطيلة أكبر من مساحة المربّعة:',
            options: ['إذا كان $x > 2$', 'إذا كان $x < 2$', 'إذا كان $x \\geq 2$', 'مهما كانت قيمة $x$'],
            correct: 0, cols: 2,
            explain: 'من أجل $x > 2$ نجد $B - A > 0$ أي $B > A$. ومن أجل $x = 2$ تتساوى المساحتان.' },
          { kind: 'solution', ask: 0, lines: [
            '$B - A = (x^2 + 6x) - (x^2 + 4x + 4) = 2x - 4$.',
            '$B > A$ تعني $2x - 4 > 0$ أي $2x > 4$ ومنه $x > 2$.',
            'تكون مساحة السجّادة المستطيلة أكبر من مساحة المربّعة من أجل $x > 2$ ؛ ومن أجل $x = 2$ تتساويان ($16$ م²).',
          ] },
        ],
      },
      {
        label: '3)', title: 'تحقّق من أجل x = 10',
        question: 'من أجل $x = 10$ ، احسب $A$ و $B$ . أيّ السجّادتين أكبر مساحة؟',
        asks: ['مساحة A', 'مساحة B', 'السجّادة الأكبر مساحة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0,
            prompt: 'مساحة السجّادة المربّعة:', expected: 144, shape: 'quantity', unit: 'm²',
            explain: 'الضلع $10 + 2 = 12$ ، فالمساحة $12^2 = 144$.' },
          { kind: 'numeric', role: 'answer', ask: 1,
            prompt: 'مساحة السجّادة المستطيلة:', expected: 160, shape: 'quantity', unit: 'm²',
            explain: 'البعدان 10 و $10 + 6 = 16$ ، فالمساحة $10 \\times 16 = 160$.' },
          { kind: 'choice', role: 'conclude', ask: 2, requires: ['hall-mutarajiha'],
            prompt: 'أيّ السجّادتين أكبر مساحة، وهل يتّفق هذا مع الحلّ $x > 2$ ؟',
            options: [
              'المستطيلة بفارق 16 م²، ويتّفق ذلك مع $x > 2$ لأنّ $10 > 2$',
              'المربّعة بفارق 16 م²، ولا يتّفق ذلك مع $x > 2$',
              'تتساويان، لأنّ للسجّادتين المحيط نفسه',
            ],
            correct: 0,
            explain: '$B - A = 160 - 144 = 16$ ، وهو أيضًا $2 \\times 10 - 4 = 16$ : النتيجة تؤكّد الحلّ.' },
          { kind: 'solution', ask: 0, lines: [
            'من أجل $x = 10$ : $A = (10 + 2)^2 = 144$ م² و $B = 10 \\times 16 = 160$ م².',
            'المستطيلة أكبر مساحة بفارق $160 - 144 = 16$ م²، وهذا يتّفق مع $x > 2$ ومع $B - A = 2 \\times 10 - 4 = 16$.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
