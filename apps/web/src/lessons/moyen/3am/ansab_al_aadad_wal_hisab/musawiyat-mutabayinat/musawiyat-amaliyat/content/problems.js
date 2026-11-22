/**
 * Les trois « مسائل » du درس « المساويات والعمليات » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas
 * (GuidedProblem). La مسألة 1 (`LESSON_CONFIG.lessonProblem`) : 3x − 40 = 200 — le prix d'un cadeau pour la mère de سلمى ; la 2 un marchand
 * honnête qui pèse cinq sacs et un sac de sucre (5x + 2 = 27) ; la 3 un nombre mystère (4 − 3x = 7). Chaque مسألة n'utilise que les
 * PROPRIÉTÉS (ajouter, retrancher, multiplier, diviser les deux membres) pour passer d'une égalité à une autre ; la méthode de résolution
 * complète est celle de la leçon suivante. Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — هديّة لأمّ سلمى',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🎁',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'ثلاثة أمثال الثمن ناقصًا 40 دج تساوي 200 دج', useful: true },
      { id: 'd2', text: 'المساواة المعطاة: 3x − 40 = 200', useful: true },
      { id: 'd3', text: 'الهديّة لأمّ سلمى', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'إضافة 40',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المساواة الجديدة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-jam'],
            prompt: 'بإضافة $40$ إلى الطرفين نجد:',
            options: ['$3x = 240$', '$3x = 160$', '$3x - 40 = 240$', '$3x = 200$'], correct: 0, cols: 2,
            explain: '$3x - 40 + 40 = 200 + 40$ أي $3x = 240$ . ($3x = 160$ تطرح بدل أن تضيف، و $3x - 40 = 240$ تضيف إلى طرف واحد، و $3x = 200$ تنسى الطرف الأيمن.)' },
          { kind: 'solution', ask: 0, lines: [
            'نضيف $40$ إلى الطرفين: $3x - 40 + 40 = 200 + 40$ .',
            'إذن $3x = 240$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'قيمة 6x',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['قيمة 6x'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['musawat-darb'],
            prompt: 'لننتقل من $3x = 240$ إلى $6x$ :',
            options: ['نضرب الطرفين في $2$', 'نضيف $3$ إلى الطرفين', 'نقسم الطرفين على $2$'], correct: 0, cols: 1,
            explain: '$3x \\times 2 = 6x$ : نضرب الطرفين في $2$ ، فنجد $6x = 480$ .' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['musawat-darb'], prompt: '$6x =$', expected: 480,
            explain: '$3x \\times 2 = 240 \\times 2$ أي $6x = 480$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضرب طرفي $3x = 240$ في $2$ : $3x \\times 2 = 240 \\times 2$ .',
            'إذن $6x = 480$ ، دون البحث عن $x$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'قول أمين',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['هل أمين على صواب؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-darb'],
            prompt: 'هل أمين على صواب؟',
            options: ['لا: القسمة على $3$ تشمل كل حدود الطرف، ونجد $x - \\frac{40}{3} = \\frac{200}{3}$', 'نعم: القسمة على $3$ تُجرى على الطرفين', 'نعم: $3x \\div 3 = x$ و $200 \\div 3 = \\frac{200}{3}$'], correct: 0, cols: 1,
            explain: 'نقسم $3x - 40$ كله على $3$ : $\\frac{3x - 40}{3} = x - \\frac{40}{3}$ . أمين نسي أن يقسم $40$ أيضًا.' },
          { kind: 'solution', ask: 0, lines: [
            'نقسم الطرفين على $3$ : $\\frac{3x - 40}{3} = \\frac{200}{3}$ .',
            'الطرف الأيسر هو $x - \\frac{40}{3}$ : العدد $40$ يُقسم هو أيضًا.',
            'أمين ليس على صواب.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الأمانة في الميزان',
    context: 'خمسة أكياس وكيس سكر',
    emoji: '⚖️',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'أكياس الدقيق', lines: [{ label: 'عددها', value: '5' }] }, { title: 'كيس السكر', lines: [{ label: 'كتلته kg', value: '2' }] }, { title: 'قراءة الميزان', lines: [{ label: 'kg', value: '27' }] }], ariaLabel: 'ثلاث بطاقات: خمسة أكياس دقيق، كيس سكر كتلته 2 كيلوغرام، والميزان يشير إلى 27 كيلوغرامًا' },
    statement: 'يزن تاجر أمين خمسة أكياس متماثلة من الدقيق مع كيس سكر كتلته $2\\,\\mathrm{kg}$ ، فيشير الميزان إلى $27\\,\\mathrm{kg}$ . نسمّي $x$ كتلة كيس الدقيق بالكيلوغرام، فنكتب $5x + 2 = 27$ .',
    data: [
      { id: 'flour', text: 'خمسة أكياس دقيق متماثلة كتلة كل منها x', useful: true },
      { id: 'sugar', text: 'كيس السكر كتلته 2 kg', useful: true },
      { id: 'honest', text: 'التاجر أمين', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طرح 2',
        question: 'اكتب المساواة التي نحصل عليها بطرح $2$ من طرفي المساواة $5x + 2 = 27$ .',
        asks: ['المساواة الجديدة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-jam'],
            prompt: 'بطرح $2$ من الطرفين نجد:',
            options: ['$5x = 25$', '$5x = 29$', '$5x + 2 = 25$'], correct: 0, cols: 3,
            explain: '$5x + 2 - 2 = 27 - 2$ أي $5x = 25$ . ($5x = 29$ تضيف، و $5x + 2 = 25$ تطرح من طرف واحد.)' },
          { kind: 'solution', ask: 0, lines: [
            'نطرح $2$ من الطرفين: $5x + 2 - 2 = 27 - 2$ .',
            'إذن $5x = 25$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'كتلة الكيس',
        question: 'استنتج كتلة كيس الدقيق الواحد بالكيلوغرام.',
        asks: ['كتلة كيس الدقيق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['musawat-darb'], prompt: 'كتلة كيس الدقيق بالكيلوغرام:', expected: 5,
            explain: 'نقسم طرفي $5x = 25$ على $5$ : $x = 5$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نقسم طرفي $5x = 25$ على $5$ : $\\frac{5x}{5} = \\frac{25}{5}$ .',
            'إذن $x = 5$ : كتلة الكيس $5\\,\\mathrm{kg}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'تأكيد التاجر',
        question: 'يضرب التاجر طرفي المساواة $5x + 2 = 27$ في $10$ ليتأكّد. اكتب المساواة التي يحصل عليها.',
        asks: ['المساواة الجديدة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-darb'],
            prompt: 'بضرب الطرفين في $10$ نجد:',
            options: ['$50x + 20 = 270$', '$50x + 2 = 270$', '$50x + 20 = 27$'], correct: 0, cols: 3,
            explain: 'نضرب كل حدود الطرفين: $10 \\times (5x + 2) = 50x + 20$ و $10 \\times 27 = 270$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$10 \\times (5x + 2) = 10 \\times 27$ .',
            'أي $50x + 20 = 270$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — عدد غامض',
    context: 'عدد من مسابقة الحساب الذهني',
    emoji: '🧮',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'العدد الغامض', lines: [{ label: 'نرمز إليه', value: 'x' }] }, { title: 'ما نحسبه', lines: [{ label: '4 ناقص', value: '3x' }] }, { title: 'النتيجة', lines: [{ label: 'تساوي', value: '7' }] }], ariaLabel: 'ثلاث بطاقات: العدد الغامض x، و 4 ناقص 3x، والنتيجة 7' },
    statement: 'في مسابقة الحساب الذهني بالمدرسة يقول المنشّط: «فكّرتُ في عدد ناطق $x$ ، وحسبتُ $4 - 3x$ فوجدتُ $7$ »، أي $4 - 3x = 7$ . يعمل الفريق بإتقان ويتحقّق من كل خطوة.',
    data: [
      { id: 'eq', text: 'المساواة المعطاة: 4 − 3x = 7', useful: true },
      { id: 'x', text: 'x عدد ناطق', useful: true },
      { id: 'team', text: 'يعمل الفريق بإتقان', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'طرح 4',
        question: 'اكتب المساواة التي نحصل عليها بطرح $4$ من طرفي المساواة $4 - 3x = 7$ .',
        asks: ['المساواة الجديدة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-jam'],
            prompt: 'بطرح $4$ من الطرفين نجد:',
            options: ['$-3x = 3$', '$-3x = 11$', '$3x = 3$'], correct: 0, cols: 3,
            explain: '$4 - 3x - 4 = 7 - 4$ أي $-3x = 3$ . ($-3x = 11$ تضيف، و $3x = 3$ تنسى الإشارة.)' },
          { kind: 'solution', ask: 0, lines: [
            'نطرح $4$ من الطرفين: $4 - 3x - 4 = 7 - 4$ .',
            'إذن $-3x = 3$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'قيمة x',
        question: 'استنتج قيمة $x$ .',
        asks: ['قيمة x'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['musawat-darb'], prompt: '$x =$', expected: -1, display: '−1',
            explain: 'نقسم طرفي $-3x = 3$ على $-3$ : $x = -1$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نقسم طرفي $-3x = 3$ على $-3$ : $\\frac{-3x}{-3} = \\frac{3}{-3}$ .',
            'إذن $x = -1$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'التحقق',
        question: 'هل المساواة $12 - 9x = 21$ صحيحة؟',
        asks: ['هل المساواة صحيحة؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['musawat-darb', 'tahwil'],
            prompt: 'هل المساواة $12 - 9x = 21$ صحيحة؟',
            options: ['نعم، لأنّنا نضرب طرفي $4 - 3x = 7$ في $3$', 'لا، لأنّ $4 \\times 3 = 12$ فقط', 'نعم، لأنّ $12 - 9 = 3$'], correct: 0, cols: 1,
            explain: '$3 \\times (4 - 3x) = 12 - 9x$ و $3 \\times 7 = 21$ : المساواة صحيحة. وللتأكّد: من أجل $x = -1$ نجد $12 + 9 = 21$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نضرب طرفي $4 - 3x = 7$ في $3$ : $3(4 - 3x) = 3 \\times 7$ .',
            'أي $12 - 9x = 21$ : المساواة صحيحة.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
