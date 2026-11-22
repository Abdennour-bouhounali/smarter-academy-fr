/**
 * Les trois « مسائل » du درس « وصف سلسلة حسابات » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). Registres : un programme de calcul
 * (مسألة 1, `deep-47` refait : « اختر عددًا … »), un message codé dicté en phrases (مسألة 2, la dictée au téléphone rejetée comme entrée au profit de la découpe) et un programme à remonter
 * (مسألة 3, `deep-49` refait en « لغز الأعداد » : un jeu de l'esprit, sans magie). Les phrases viennent de `chainOps.describe` (via ./exercises) ; chaque nombre est vérifié dans
 * ./problems.test.js en arithmétique EXACTE (BigInt). Aucun résultat négatif.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';
import { desc } from './exercises.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — برنامج حساب',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🔢',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'نختار عددًا ثم نضيف إليه 4', useful: true },
      { id: 'd2', text: 'نضرب الناتج في 3', useful: true },
      { id: 'd3', text: 'نطبّق البرنامج على 5 ثم على 2,5', useful: true },
      { id: 'd4', text: 'يُقترح البرنامج في نادي الرياضيات', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تطبيق البرنامج',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['النتيجة للعدد 5', 'النتيجة للعدد 2,5'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['akhir-amaliya'], prompt: 'نتيجة البرنامج للعدد $5$ :', expected: 27, display: '27',
            explain: 'نضيف 4 أوّلًا: $5 + 4 = 9$ ثم نضرب في 3: $9 \\times 3 = 27$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['akhir-amaliya'], prompt: 'نتيجة البرنامج للعدد $2{,}5$ :', expected: 19.5, display: '19,5',
            explain: '$2{,}5 + 4 = 6{,}5$ ثم $6{,}5 \\times 3 = 19{,}5$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نتّبع البرنامج خطوة خطوة: الجمع ثم الضرب.',
            'للعدد $5$ : $5 + 4 = 9$ ثم $9 \\times 3 = 27$ ؛ وللعدد $2{,}5$ : $2{,}5 + 4 = 6{,}5$ ثم $6{,}5 \\times 3 = 19{,}5$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'ترجمة البرنامج إلى سلسلة',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['السلسلة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqa-kitaba'],
            prompt: 'أيّ سلسلة تترجم البرنامج للعدد $5$ ؟',
            options: ['$(5 + 4) \\times 3$', '$3 \\times 5 + 4$', '$5 + 4 \\times 3$'], correct: 0, cols: 1,
            explain: 'الجمع يُنجز قبل الضرب، فنضع $5 + 4$ بين قوسين. (الثانية ضربت 5 في 3 أوّلًا؛ والثالثة تضرب 4 وحدها في 3.)' },
          { kind: 'solution', ask: 0, lines: [
            'آخر خطوة في البرنامج هي الضرب في $3$ ، فالسلسلة جداء.',
            'عاملاها: ناتج الجمع $5 + 4$ والعدد $3$ ، والجمع يسبق الضرب فيوضع بين قوسين: $(5 + 4) \\times 3$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'وصف السلسلة',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الوصف'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['wasf-jumla'],
            prompt: 'أيّ جملة تصف $(5 + 4) \\times 3$ ؟',
            options: [desc('(5 + 4) × 3'), desc('3 × 5 + 4'), desc('5 + 4 × 3')], correct: 0, cols: 1,
            explain: 'آخر عملية هي الضرب، فالسلسلة جداء؛ وأحد عامليها مجموع العددين 5 و 4. (الثانية والثالثة تصفان مجموعين.)' },
          { kind: 'solution', ask: 0, lines: [
            'آخر عملية تُنجز هي الضرب، فالسلسلة جداء.',
            `${desc('(5 + 4) × 3')} : عاملها الأول مجموع العددين $5$ و $4$ ، والثاني العدد $3$ .`,
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الرسالة المشفّرة',
    context: 'رمز القفل',
    emoji: '💌',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'الجملة 1', lines: [{ label: 'العدد', value: '50' }, { label: 'العددان', value: '6 و 7' }] }, { title: 'الجملة 2', lines: [{ label: 'العددان', value: '27 و 9' }, { label: 'القاسم', value: '6' }] }, { title: 'الجملة 3', lines: [{ label: 'العدد', value: '3' }, { label: 'العددان', value: '2 و 1' }] }], ariaLabel: 'ثلاث بطاقات: الجملة 1 بالعدد 50 والعددين 6 و 7؛ الجملة 2 بالعددين 27 و 9 والقاسم 6؛ الجملة 3 بالعدد 3 والعددين 2 و 1' },
    statement: `أرسل يوسف إلى ابن عمّه رمز قفل حقيبته في ثلاث جمل، وكلّ جملة تعطي رقمًا: (1) ${desc('50 − 6 × 7')} ؛ (2) ${desc('(27 + 9) ÷ 6')} ؛ (3) ${desc('3 × (2 + 1)')} .`,
    data: [
      { id: 'a', text: 'الجملة 1: فرق العدد 50 وجداء العددين 6 و 7', useful: true },
      { id: 'b', text: 'الجملة 2: حاصل قسمة مجموع العددين 27 و 9 على 6', useful: true },
      { id: 'c', text: 'الجملة 3: جداء العدد 3 ومجموع العددين 2 و 1', useful: true },
      { id: 'd', text: 'الحقيبة زرقاء اللون', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كتابة السلاسل الثلاث',
        question: 'اكتب السلاسل الثلاث.',
        asks: ['السلاسل'],
        steps: [
          { kind: 'sort' },
          { kind: 'batch', role: 'answer', ask: 0, requires: ['tariqa-kitaba'], prompt: 'اختر السلسلة التي تكتبها كلّ جملة:',
            rows: [
              { label: 'الجملة (1)', options: ['$50 - 6 \\times 7$', '$(50 - 6) \\times 7$', '$50 \\times 6 - 7$'], correct: 0, correction: 'آخر عملية هي الطرح، وحدّها الثاني جداء 6 و 7 يُنجز أوّلًا بالأولوية فلا قوسين.' },
              { label: 'الجملة (2)', options: ['$27 + 9 \\div 6$', '$6 \\div (27 + 9)$', '$(27 + 9) \\div 6$'], correct: 2, correction: 'آخر عملية هي القسمة، ومقسومها مجموع العددين 27 و 9 فهو بين قوسين.' },
              { label: 'الجملة (3)', options: ['$3 \\times 2 + 1$', '$3 \\times (2 + 1)$', '$3 + 2 \\times 1$'], correct: 1, correction: 'آخر عملية هي الضرب، وعاملها الثاني مجموع العددين 2 و 1 فهو بين قوسين.' },
            ] },
          { kind: 'solution', ask: 0, lines: [
            'الجملة (1): $50 - 6 \\times 7$ ، والجملة (2): $(27 + 9) \\div 6$ ، والجملة (3): $3 \\times (2 + 1)$ .',
            'نبدأ في كلّ جملة بآخر عملية، ثم نضع بين قوسين ما يجب أن يُحسب قبلها.',
          ] },
        ],
      },
      {
        label: '2)', title: 'رمز القفل',
        question: 'عيّن رمز القفل.',
        asks: ['الرمز'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqa-kitaba'], prompt: 'اكتب الأرقام الثلاثة متتالية (دون فراغ):', expected: 869, display: '869',
            explain: '$50 - 42 = 8$ و $36 \\div 6 = 6$ و $3 \\times 3 = 9$ ، فالرمز $869$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الرقم الأول: $50 - 6 \\times 7 = 50 - 42 = 8$ ؛ الثاني: $(27 + 9) \\div 6 = 36 \\div 6 = 6$ ؛ الثالث: $3 \\times (2 + 1) = 3 \\times 3 = 9$ .',
            'رمز القفل هو $8\\ 6\\ 9$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'خطأ ابن العمّ',
        question: 'كتب ابن عمّه للجملة (2) السلسلة $27 + 9 \\div 6$ ، فما الرقم الذي وجده؟ ولماذا لا يُفتح القفل؟',
        asks: ['الرقم الذي وجده', 'سبب عدم الفتح'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqa-kitaba'], prompt: 'قيمة $27 + 9 \\div 6$ :', expected: 28.5, display: '28,5',
            explain: 'القسمة أوّلًا: $9 \\div 6 = 1{,}5$ ثم $27 + 1{,}5 = 28{,}5$ .' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tariqa-kitaba'],
            prompt: 'لماذا لا يُفتح القفل؟',
            options: ['نسي القوسين حول $27 + 9$ فصارت السلسلة مجموعًا', 'أخطأ في ضرب 27', 'الرمز يتكوّن من رقمين فقط'], correct: 0, cols: 1,
            explain: 'دون القوسين تقسم $9$ وحدها على $6$ وتضيف الناتج إلى $27$ ؛ وناتج $28{,}5$ ليس رقمًا.' },
          { kind: 'solution', ask: 0, lines: [
            'دون قوسين تُنجز القسمة قبل الجمع: $9 \\div 6 = 1{,}5$ ثم $27 + 1{,}5 = 28{,}5$ ، وليس هذا رقمًا.',
            'آخر عملية صارت الجمع بدل القسمة: لا بدّ من $(27 + 9) \\div 6$ لتصير القسمة الأخيرة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — لغز سالم',
    context: 'ركن الألغاز',
    emoji: '🧩',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'برنامج سالم', lines: [{ label: 'أضف', value: '6' }, { label: 'اضرب في', value: '2' }, { label: 'اقسم على', value: '4' }] }, { title: 'يجرّب', lines: [{ label: 'عددان مختاران', value: '4 و 10' }] }], ariaLabel: 'بطاقتان: برنامج سالم يضيف 6 ثم يضرب في 2 ثم يقسم على 4؛ وعددان مختاران هما 4 و 10' },
    statement: 'في ركن الألغاز بمعرض المدرسة يقول سالم: «اختر عددًا، أضف إليه $6$ ، اضرب الناتج في $2$ ، ثم اقسم على $4$ . أعطني النتيجة أعطك عددك!»',
    data: [
      { id: 'a', text: 'نضيف 6 إلى العدد المختار', useful: true },
      { id: 'b', text: 'نضرب الناتج في 2 ثم نقسم على 4', useful: true },
      { id: 'c', text: 'نجرّب العددين 4 و 10', useful: true },
      { id: 'd', text: 'المعرض يدوم يومين', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تجربة البرنامج',
        question: 'عيّن النتيجة إذا اخترنا $4$ ثم إذا اخترنا $10$ .',
        asks: ['النتيجة للعدد 4', 'النتيجة للعدد 10'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqa-kitaba'], prompt: 'النتيجة للعدد $4$ :', expected: 5, display: '5',
            explain: '$4 + 6 = 10$ ثم $10 \\times 2 = 20$ ثم $20 \\div 4 = 5$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqa-kitaba'], prompt: 'النتيجة للعدد $10$ :', expected: 8, display: '8',
            explain: '$10 + 6 = 16$ ثم $16 \\times 2 = 32$ ثم $32 \\div 4 = 8$ .' },
          { kind: 'solution', ask: 0, lines: [
            'للعدد $4$ : $4 + 6 = 10$ ثم $10 \\times 2 = 20$ ثم $20 \\div 4 = 5$ .',
            'للعدد $10$ : $10 + 6 = 16$ ثم $16 \\times 2 = 32$ ثم $32 \\div 4 = 8$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'السلسلة ووصفها',
        question: 'اكتب سلسلة العدد $4$ ثم صِفها بجملة.',
        asks: ['السلسلة', 'الوصف'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tariqa-kitaba'],
            prompt: 'أيّ سلسلة تترجم البرنامج للعدد $4$ ؟',
            options: ['$(4 + 6) \\times 2 \\div 4$', '$4 + 6 \\times 2 \\div 4$', '$(4 + 6) \\times 2 + 4$'], correct: 0, cols: 1,
            explain: 'الجمع يسبق الضرب في البرنامج فنضعه بين قوسين، ثم الضرب ثم القسمة من اليسار نحو اليمين. (الثانية تضرب 6 وحدها؛ والثالثة تجمع 4 في آخر السلسلة.)' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['wasf-jumla'],
            prompt: 'أيّ جملة تصف $(4 + 6) \\times 2 \\div 4$ ؟',
            options: [desc('(4 + 6) × 2 ÷ 4'), desc('(4 + 6) × (2 ÷ 4)'), desc('4 + 6 × 2 ÷ 4')], correct: 0, cols: 1,
            explain: 'من اليسار نحو اليمين: الضرب ثم القسمة، فآخر عملية هي القسمة. (الثانية جعلت الجداء آخر عملية؛ والثالثة وصفت مجموعًا.)' },
          { kind: 'solution', ask: 0, lines: [
            'السلسلة $(4 + 6) \\times 2 \\div 4$ : القوسان لأنّ الجمع يسبق الضرب.',
            `آخر عملية تُنجز هي القسمة على $4$ ، فهي حاصل قسمة: ${desc('(4 + 6) × 2 ÷ 4')} .`,
          ] },
        ],
      },
      {
        label: '3)', title: 'كيف يعرف سالم العدد؟',
        question: 'يضاعف سالم النتيجة ثم يطرح $6$ . جرّب ذلك على النتيجتين $5$ و $8$ ، ماذا تجد؟',
        asks: ['الناتج للنتيجة 5', 'الناتج للنتيجة 8'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tariqa-kitaba'], prompt: 'يضاعف $5$ ثم يطرح $6$ :', expected: 4, display: '4',
            explain: '$2 \\times 5 = 10$ ثم $10 - 6 = 4$ ، وهو العدد المختار أوّلًا.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tariqa-kitaba'], prompt: 'يضاعف $8$ ثم يطرح $6$ :', expected: 10, display: '10',
            explain: '$2 \\times 8 = 16$ ثم $16 - 6 = 10$ ، وهو العدد المختار الثاني.' },
          { kind: 'solution', ask: 0, lines: [
            'نتيجة $5$ : $2 \\times 5 - 6 = 10 - 6 = 4$ ؛ ونتيجة $8$ : $2 \\times 8 - 6 = 16 - 6 = 10$ .',
            'نجد العددين المختارين $4$ و $10$ : سالم يعكس البرنامج.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
