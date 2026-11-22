/**
 * Les trois « مسائل » du درس « النسبة المئوية » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1
 * (`LESSON_CONFIG.lessonProblem`) : une حقيبة à 2400 دج, −15 % (360 DA, 2040 DA) puis +15 % (2346 DA, qui ne revient pas à 2400) ; la 2 deux فوج de متطوّعين
 * (40 dont 35 % de filles, 60 dont 55 % : 14 + 33 = 47 sur 100) ; la 3 un هاتف payé 23 000 DA après +15 % (20 000 DA avant, hausse de 3000 DA) puis deux
 * remises 10 % et 5 % (19 665 DA, remise totale 14,5 %). Chaque مسألة suit la méthode de la leçon. Chaque nombre est vérifié dans ./problems.test.js en
 * arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — حقائب موسم الدخول المدرسي',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🎒',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'ثمن الحقيبة: 2400 دج', useful: true },
      { id: 'd2', text: 'في الموسم: تخفيض 15%', useful: true },
      { id: 'd3', text: 'بعد الموسم: زيادة 15% على الثمن الجديد', useful: true },
      { id: 'd4', text: 'المكتبة في الحيّ', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مبلغ التخفيض',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['مبلغ التخفيض'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['hissa-t'],
            prompt: 'كيف نحسب $15\\%$ من $2400$ دج؟',
            options: ['$2400 \\times \\frac{15}{100}$', '$2400 - 15$', '$2400 \\times 15$', '$2400 \\div 15$'], correct: 0, cols: 2,
            explain: '$15\\%$ من عدد هي ذلك العدد مضروبًا في $\\frac{15}{100}$ . ($2400 - 15$ يطرح $15$ دج لا $15\\%$ .)' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hissa-t'], prompt: 'مبلغ التخفيض بالدينار:', expected: 360,
            explain: '$2400 \\times \\frac{15}{100} = 360$ دج.' },
          { kind: 'solution', ask: 0, lines: [
            'مبلغ التخفيض هو $15\\%$ من الثمن الأول $2400$ .',
            '$2400 \\times \\frac{15}{100} = 360$ ، فمبلغ التخفيض $360$ دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الثمن في الموسم',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الثمن في الموسم'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ziyada-nuqsan'], prompt: 'ثمن الحقيبة في الموسم بالدينار:', expected: 2040,
            explain: '$2400 - 360 = 2040$ ؛ أو $2400 \\times 0{,}85 = 2040$ .' },
          { kind: 'solution', ask: 0, lines: [
            'التخفيض بـ $15\\%$ هو الضرب في $1 - \\frac{15}{100} = 0{,}85$ .',
            '$2400 \\times 0{,}85 = 2040$ ، فالثمن في الموسم $2040$ دج.',
          ] },
        ],
      },
      {
        label: '3)', title: 'بعد نهاية الموسم',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الثمن بعد نهاية الموسم', 'هل عاد إلى 2400 دج'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tatabu'], prompt: 'الثمن بعد نهاية الموسم بالدينار:', expected: 2346,
            explain: 'الزيادة بـ $15\\%$ تُحسب من الثمن الجديد $2040$ : $2040 \\times 1{,}15 = 2346$ دج.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tatabu'],
            prompt: 'هل عاد الثمن إلى $2400$ دج؟',
            options: ['لا: $15\\%$ الثانية حُسبت من ثمن أصغر فصار الثمن $2346$ دج', 'نعم: تخفيض ثم زيادة بالنسبة نفسها يتعادلان', 'نعم لأنّ $15 - 15 = 0$'], correct: 0, cols: 1,
            explain: '$0{,}85 \\times 1{,}15 = 0{,}9775$ : أقلّ من $1$ ، فلا يعود الثمن إلى $2400$ .' },
          { kind: 'solution', ask: 1, lines: [
            'بعد الموسم: $2040 \\times 1{,}15 = 2346$ دج.',
            '$2346 \\neq 2400$ : الزيادة حُسبت من ثمن أصغر من الثمن الأول، فلم تعوّض التخفيض كلّه.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — فوجا المتطوّعين',
    context: 'التعاون على خدمة الحيّ',
    emoji: '🧹',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'الفوج الأول', lines: [{ label: 'متطوّعًا', value: '40' }, { label: 'فتيات', value: '35%' }] }, { title: 'الفوج الثاني', lines: [{ label: 'متطوّعًا', value: '60' }, { label: 'فتيات', value: '55%' }] }, { title: 'المطلوب', lines: [{ label: 'نسبة الفتيات', value: '؟' }] }], ariaLabel: 'ثلاث بطاقات: فوج أول من 40 متطوّعًا فيه 35 بالمئة فتيات، فوج ثان من 60 متطوّعًا فيه 55 بالمئة فتيات، والمطلوب نسبة الفتيات في الفوجين معًا' },
    statement: 'يتعاون متطوّعو الحيّ على تنظيف الساحة العامة في فوجين: الفوج الأول فيه $40$ متطوّعًا، $35\\%$ منهم فتيات؛ والفوج الثاني فيه $60$ متطوّعًا، $55\\%$ منهم فتيات.',
    data: [
      { id: 'a', text: 'الفوج الأول: 40 متطوّعًا، 35% فتيات', useful: true },
      { id: 'b', text: 'الفوج الثاني: 60 متطوّعًا، 55% فتيات', useful: true },
      { id: 'c', text: 'تنظيف الساحة العامة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الفتيات في كلّ فوج',
        question: 'كم فتاة في الفوج الأول؟ وكم في الفوج الثاني؟',
        asks: ['الفتيات في الفوج الأول', 'الفتيات في الفوج الثاني'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hissa-t'], prompt: 'الفتيات في الفوج الأول:', expected: 14,
            explain: '$40 \\times \\frac{35}{100} = 14$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['hissa-t'], prompt: 'الفتيات في الفوج الثاني:', expected: 33,
            explain: '$60 \\times \\frac{55}{100} = 33$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الفوج الأول: $40 \\times \\frac{35}{100} = 14$ فتاة.',
            'الفوج الثاني: $60 \\times \\frac{55}{100} = 33$ فتاة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'النسبة في الفوجين معًا',
        question: 'ما النسبة المئوية للفتيات في الفوجين معًا؟',
        asks: ['النسبة المئوية للفتيات'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['nisba-jadwal'], prompt: 'النسبة المئوية للفتيات (اكتب العدد فقط):', expected: 47,
            explain: 'الفتيات $14 + 33 = 47$ من $40 + 60 = 100$ متطوّع: $\\frac{47}{100}$ ، أي $47\\%$ .' },
          { kind: 'solution', ask: 0, lines: [
            'عدد الفتيات في الفوجين $14 + 33 = 47$ ، وعدد المتطوّعين $40 + 60 = 100$ .',
            '$\\frac{47}{100} = 47\\%$ ، فالنسبة المئوية للفتيات $47\\%$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل هي المتوسط؟',
        question: 'هل النسبة المئوية للفتيات في الفوجين معًا هي $45\\%$ ، أي متوسط $35\\%$ و $55\\%$ ؟',
        asks: ['هل هي 45%'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nisba-jadwal'],
            prompt: 'هل النسبة هي $45\\%$ ؟',
            options: ['لا: الفوجان مختلفا العدد فتأخذ النسبتان وزنين مختلفين، والنسبة $47\\%$', 'نعم: متوسط نسبتين هو نسبة المجموع دائمًا', 'نعم لأنّ $35 + 55 = 90$ و $90 \\div 2 = 45$'], correct: 0, cols: 1,
            explain: 'الفوج الثاني أكبر، فنسبته $55\\%$ تؤثّر أكثر: النسبة $47\\%$ لا $45\\%$ .' },
          { kind: 'solution', ask: 0, lines: [
            'متوسط النسبتين $\\frac{35 + 55}{2} = 45$ ، لكنّ الفوجين غير متساويين في العدد.',
            'النسبة الحقيقية $\\frac{47}{100} = 47\\%$ ، وهي تختلف عن $45\\%$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ثمن الهاتف قبل الزيادة',
    context: 'القناعة وحسن الشراء',
    emoji: '📱',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'ثمن الشراء', lines: [{ label: 'دج', value: '23000' }] }, { title: 'الارتفاع', lines: [{ label: 'نسبة', value: '15%' }] }, { title: 'المطلوب', lines: [{ label: 'الثمن قبل', value: '؟' }] }], ariaLabel: 'ثلاث بطاقات: ثمن الشراء 23000 دج، بعد ارتفاع 15 بالمئة، والمطلوب الثمن قبل الارتفاع' },
    statement: 'اشترى سامي هاتفًا بـ $23000$ دج بعد أن ارتفعت أسعار الهواتف بـ $15\\%$ . ثم عرض عليه بائع آخر الهاتف نفسه بتخفيضين متتاليين: $10\\%$ ثم $5\\%$ .',
    data: [
      { id: 'a', text: 'ثمن الشراء: 23000 دج بعد ارتفاع 15%', useful: true },
      { id: 'b', text: 'عرض آخر: تخفيض 10% ثم 5%', useful: true },
      { id: 'c', text: 'البائع الثاني في السوق', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الثمن قبل الارتفاع',
        question: 'ما ثمن الهاتف قبل الارتفاع؟',
        asks: ['الثمن قبل الارتفاع'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ziyada-nuqsan'], prompt: 'الثمن قبل الارتفاع بالدينار:', expected: 20000,
            explain: '$23000$ دج هي $115\\%$ من الثمن الأول: $23000 \\div 1{,}15 = 20000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الارتفاع بـ $15\\%$ هو الضرب في $1{,}15$ : الثمن الأول $\\times 1{,}15 = 23000$ .',
            'الثمن الأول $= 23000 \\div 1{,}15 = 20000$ دج.',
          ] },
        ],
      },
      {
        label: '2)', title: 'مبلغ الارتفاع',
        question: 'ما مبلغ الارتفاع؟',
        asks: ['مبلغ الارتفاع'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hissa-t'], prompt: 'مبلغ الارتفاع بالدينار:', expected: 3000,
            explain: '$23000 - 20000 = 3000$ ؛ وهو $15\\%$ من $20000$ لا من $23000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'مبلغ الارتفاع هو $15\\%$ من الثمن الأول $20000$ : $20000 \\times \\frac{15}{100} = 3000$ .',
            'نتحقق: $20000 + 3000 = 23000$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'التخفيضان المتتاليان',
        question: 'ما ثمن الهاتف بعد التخفيضين؟ وما النسبة المئوية الكلّية للتخفيض؟',
        asks: ['الثمن بعد التخفيضين', 'النسبة المئوية الكلّية للتخفيض'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tatabu'], prompt: 'الثمن بعد التخفيضين بالدينار:', expected: 19665,
            explain: '$23000 \\times 0{,}9 = 20700$ ثم $20700 \\times 0{,}95 = 19665$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tatabu'], prompt: 'النسبة المئوية الكلّية للتخفيض (اكتب العدد فقط):', expected: 14.5,
            explain: '$0{,}9 \\times 0{,}95 = 0{,}855$ ، أي أنّ الثمن صار $85{,}5\\%$ من الأول: التخفيض $14{,}5\\%$ لا $15\\%$ .' },
          { kind: 'solution', ask: 1, lines: [
            'المعاملان $0{,}9$ و $0{,}95$ يتضاعفان: $0{,}9 \\times 0{,}95 = 0{,}855$ .',
            'الثمن الجديد $85{,}5\\%$ من الأول، فالتخفيض الكلّي $100\\% - 85{,}5\\% = 14{,}5\\%$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
