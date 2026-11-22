/**
 * Les trois « مسائل » du درس « سلسلة عمليات دون أقواس وأولوية العمليات » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem).
 * La مسألة 1 (`LESSON_CONFIG.lessonProblem`) : la درّاجة de l'oncle مراد, 18 500 DA moins 4 versements de 3 200 DA moins 1 500 DA (4 200 DA) ; la 2 la caisse de la bibliothèque
 * de la classe (2 400 − 6 × 250 + 800 = 1 700 DA, pas assez pour un dictionnaire à 1 850 DA) ; la 3 la sortie du club (2,5 + 3 × 4,2 + 12 ÷ 4 = 18,1 km). Chaque nombre est vérifié
 * dans ./problems.test.js en arithmétique EXACTE (BigInt). Aucune parenthèse dans une chaîne montrée ; aucun résultat négatif.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — درّاجة العمّ مراد',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🚲',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'ثمن الدرّاجة: 18500 DA', useful: true },
      { id: 'd2', text: '4 أقساط، في كلّ قسط 3200 DA', useful: true },
      { id: 'd3', text: 'دفعة الابن: 1500 DA', useful: true },
      { id: 'd4', text: 'العمّ مراد يحبّ ركوب الدرّاجة في المساء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'كتابة السلسلة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['السلسلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-silsila'],
            prompt: 'أيّ سلسلة تعطي ما بقي على العمّ مراد أن يدفعه؟',
            options: ['$18500 - 4 \\times 3200 - 1500$', '$18500 - 4 - 3200 - 1500$', '$18500 + 4 \\times 3200 - 1500$'], correct: 0, cols: 1,
            explain: 'ما دفعه الأب في الأقساط هو $4 \\times 3200$ ، وما دفعه الابن $1500$ ؛ كلّ ذلك يُطرح من ثمن الدرّاجة. (الثانية طرحت العدد 4 كأنّه دينار؛ والثالثة أضافت الأقساط.)' },
          { kind: 'solution', ask: 0, lines: [
            'الباقي هو الثمن مطروحًا منه ما دُفع: أقساط ثمّ دفعة الابن.',
            'نكتب السلسلة بترتيب الرواية: $18500 - 4 \\times 3200 - 1500$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'حساب السلسلة',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الباقي'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['awlawiya'], prompt: 'الباقي بالدينار:', expected: 4200, display: '4200',
            explain: 'الضرب أوّلًا: $4 \\times 3200 = 12800$ ، ثم من اليسار: $18500 - 12800 = 5700$ ثم $5700 - 1500 = 4200$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نحسب الضرب أوّلًا: $18500 - 4 \\times 3200 - 1500 = 18500 - 12800 - 1500$ .',
            'ثم الطرح من اليسار: $18500 - 12800 = 5700$ ، ثم $5700 - 1500 = 4200$ .',
            'بقي على العمّ مراد أن يدفع $4200$ DA .',
          ] },
        ],
      },
      {
        label: '3)', title: 'خطأ الزميل',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الخطأ'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['awlawiya'],
            prompt: 'زميلك طرح العدد 4 من 18500 أوّلًا. ما الخطأ؟',
            options: ['أنّ الضرب يُحسب قبل الطرح، فـ $4 \\times 3200$ هي التي تُطرح', 'أنّه لم يطرح من اليسار', 'أنّه نسي الدفعة الأخيرة'], correct: 0, cols: 1,
            explain: 'العدد 4 هو عدد الأقساط لا مبلغًا: يُضرب أوّلًا في $3200$ ، ثم يُطرح الناتج $12800$ ، وليس $18500 - 4$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الطرح $18500 - 4$ يعامل 4 كأنّها دنانير، وهي عدد الأقساط.',
            'الضرب $4 \\times 3200 = 12800$ يُحسب أوّلًا، ثم يُطرح من $18500$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — صندوق مكتبة القسم',
    context: 'مكتبة القسم',
    emoji: '📚',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'في الصندوق', lines: [{ label: 'DA', value: '2400' }] }, { title: 'القصص', lines: [{ label: 'عدد القصص', value: '6' }, { label: 'DA للقصّة', value: '250' }] }, { title: 'تبرّع وليّ', lines: [{ label: 'DA', value: '800' }] }], ariaLabel: 'ثلاث بطاقات: في الصندوق 2400 دينار، 6 قصص ثمن القصة 250 دينارًا، وتبرّع وليّ بـ 800 دينار' },
    statement: 'في صندوق القسم $2400$ DA . اشترى الأستاذ 6 قصص بـ $250$ DA للقصّة، ثم تبرّع وليّ تلميذ بـ $800$ DA .',
    data: [
      { id: 'a', text: 'في الصندوق: 2400 DA', useful: true },
      { id: 'b', text: '6 قصص، ثمن القصّة 250 DA', useful: true },
      { id: 'c', text: 'تبرّع وليّ: 800 DA', useful: true },
      { id: 'd', text: 'القصص جميلة ومصوّرة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'السلسلة',
        question: 'اكتب سلسلة تعطي المبلغ الموجود الآن في الصندوق.',
        asks: ['السلسلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-silsila'],
            prompt: 'أيّ سلسلة تعطي المبلغ الموجود الآن؟',
            options: ['$2400 - 6 \\times 250 + 800$', '$2400 - 6 \\times 250 - 800$', '$2400 + 6 \\times 250 + 800$'], correct: 0, cols: 1,
            explain: 'شراء القصص ينقص الصندوق، والتبرّع يزيده: $2400 - 6 \\times 250 + 800$ . (الثانية طرحت التبرّع؛ والثالثة أضافت ثمن القصص.)' },
          { kind: 'solution', ask: 0, lines: [
            'شراء 6 قصص ينقص الصندوق من المبلغ: $6 \\times 250$ .',
            'والتبرّع يزيده: $+ 800$ ، فالسلسلة $2400 - 6 \\times 250 + 800$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المبلغ الحالي',
        question: 'احسب هذا المبلغ.',
        asks: ['المبلغ'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['awlawiya'], prompt: 'المبلغ بالدينار:', expected: 1700, display: '1700',
            explain: '$6 \\times 250 = 1500$ ، ثم $2400 - 1500 = 900$ ، ثم $900 + 800 = 1700$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الضرب أوّلًا: $2400 - 6 \\times 250 + 800 = 2400 - 1500 + 800$ .',
            'من اليسار: $2400 - 1500 = 900$ ثم $900 + 800 = 1700$ ، فيبقى في الصندوق $1700$ DA .',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يكفي؟',
        question: 'هل يكفي هذا المبلغ لشراء قاموس ثمنه $1850$ DA ؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['awlawiya'],
            prompt: 'المبلغ في الصندوق $1700$ DA والقاموس بـ $1850$ DA :',
            options: ['لا يكفي، وينقص $150$ DA', 'يكفي، ويبقى $150$ DA', 'يكفي تمامًا'], correct: 0, cols: 1,
            explain: '$1850 - 1700 = 150$ : القاموس أغلى من المبلغ بـ $150$ DA .' },
          { kind: 'solution', ask: 0, lines: [
            'نقارن $1700$ بـ $1850$ : المبلغ أصغر.',
            '$1850 - 1700 = 150$ ، فينقص $150$ DA لشراء القاموس.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — خرجة نادي البيئة',
    context: 'خرجة النادي',
    emoji: '🌿',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'مشيًا', lines: [{ label: 'km', value: '2,5' }] }, { title: 'بالدرّاجات', lines: [{ label: 'عدد المراحل', value: '3' }, { label: 'km للمرحلة', value: '4,2' }] }, { title: 'المسار الجبلي', lines: [{ label: 'km', value: '12' }, { label: 'عدد الأفواج', value: '4' }] }], ariaLabel: 'ثلاث بطاقات: 2,5 km مشيًا، 3 مراحل بالدرّاجات طول كلّ منها 4,2 km، ومسار جبلي طوله 12 km تتقاسمه 4 أفواج' },
    statement: 'مشى أعضاء النادي $2{,}5\\ \\mathrm{km}$ ، ثم قطعوا بالدرّاجات 3 مراحل طول كلّ منها $4{,}2\\ \\mathrm{km}$ ، ثم تقاسمت 4 أفواج مسارًا جبليًا طوله $12\\ \\mathrm{km}$ بالتساوي.',
    data: [
      { id: 'a', text: 'مشيًا: 2,5 km', useful: true },
      { id: 'b', text: '3 مراحل، طول كلّ مرحلة 4,2 km', useful: true },
      { id: 'c', text: 'المسار الجبلي 12 km تتقاسمه 4 أفواج', useful: true },
      { id: 'd', text: 'الطقس جميل في الخريف', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'سلسلة الفوج',
        question: 'اكتب سلسلة تعطي المسافة التي قطعها فوج واحد.',
        asks: ['السلسلة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tarjama-silsila'],
            prompt: 'أيّ سلسلة تعطي مسافة فوج واحد؟',
            options: ['$2{,}5 + 3 \\times 4{,}2 + 12 \\div 4$', '$2{,}5 + 3 \\times 4{,}2 + 12 \\times 4$', '$2{,}5 \\times 3 + 4{,}2 + 12 \\div 4$'], correct: 0, cols: 1,
            explain: 'المشي والمراحل الثلاث مشتركة، وحصّة الفوج من المسار الجبلي هي $12 \\div 4$ . (الثانية ضربت في عدد الأفواج؛ والثالثة ضربت المشي لا المراحل.)' },
          { kind: 'solution', ask: 0, lines: [
            'المشي: $2{,}5$ . المراحل الثلاث: $3 \\times 4{,}2$ . حصّة الفوج من المسار الجبلي: $12 \\div 4$ .',
            'نجمعها بترتيب الرحلة: $2{,}5 + 3 \\times 4{,}2 + 12 \\div 4$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'المسافة',
        question: 'احسب هذه المسافة.',
        asks: ['المسافة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['awlawiya'], prompt: 'المسافة بالكيلومتر:', expected: 18.1, display: '18,1',
            explain: 'الضرب والقسمة أوّلًا: $3 \\times 4{,}2 = 12{,}6$ و $12 \\div 4 = 3$ ، ثم $2{,}5 + 12{,}6 + 3 = 18{,}1$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$2{,}5 + 3 \\times 4{,}2 + 12 \\div 4 = 2{,}5 + 12{,}6 + 3$ .',
            'من اليسار: $2{,}5 + 12{,}6 = 15{,}1$ ثم $15{,}1 + 3 = 18{,}1$ ، أي $18{,}1\\ \\mathrm{km}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'أكثر من 18 km ؟',
        question: 'هل قطع الفوج أكثر من $18\\ \\mathrm{km}$ ؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['awlawiya'],
            prompt: 'قطع الفوج $18{,}1\\ \\mathrm{km}$ :',
            options: ['نعم، $18{,}1$ أكبر من $18$', 'لا، $18{,}1$ أصغر من $18$', 'يساوي $18$ تمامًا'], correct: 0, cols: 1,
            explain: '$18{,}1 - 18 = 0{,}1$ : زاد على $18\\ \\mathrm{km}$ بمئة متر.' },
          { kind: 'solution', ask: 0, lines: [
            'نقارن $18{,}1$ بـ $18$ : الجزء الصحيح واحد، والجزء العشري $0{,}1$ أكبر من $0$ .',
            '$18{,}1 > 18$ ، فقطع الفوج أكثر من $18\\ \\mathrm{km}$ بـ $0{,}1\\ \\mathrm{km}$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
