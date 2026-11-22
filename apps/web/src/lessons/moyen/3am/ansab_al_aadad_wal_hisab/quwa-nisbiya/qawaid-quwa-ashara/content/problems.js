/**
 * Les trois « مسائل » du درس « قواعد الحساب على قوى العدد 10 » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem).
 * La مسألة 1 « ذاكرة الهاتف » est la مسألة du درس (`LESSON_CONFIG.lessonProblem`) : Ko, Mo, Go, To (chaque unité = 10³ de la précédente) ; la 2 le réservoir de
 * toit et la ferme (m³ → dm³ → cm³, km² → ha) ; la 3 le programme de calcul du club de maths (une chaîne = UNE multiplication). Chaque nombre est vérifié dans
 * ./problems.test.js en arithmétique EXACTE (BigInt). Contextes algériens ; aucun résultat n'est normalisé (la leçon suivante l'écrira en notation scientifique).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — ذاكرة الهاتف',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '📱',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: '1 كيلو أكتي = 10³ أكتي', useful: true },
      { id: 'd2', text: 'كل وحدة تساوي 10³ من الوحدة التي قبلها', useful: true },
      { id: 'd3', text: 'سعة الهاتف 128 جيغا أكتي', useful: true },
      { id: 'd4', text: 'حجم الصورة الواحدة حوالي 4 ميغا أكتي', useful: true },
      { id: 'd5', text: 'الهاتف لرانيا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الجيغا أكتي',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الأس'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-quwa-ashara'], prompt: '$1\\ \\mathrm{Go} = 10^{3} \\times 10^{3} \\times 10^{3}\\ \\text{أكتي} = 10^{n}$ : $n =$', expected: 9,
            explain: 'ثلاث وحدات متتالية، كل منها $10^3$ : نجمع الأسّين $3 + 3 + 3 = 9$ ، أو $(10^3)^3 = 10^9$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$1\\ \\mathrm{Go} = 10^3\\ \\mathrm{Mo}$ و $1\\ \\mathrm{Mo} = 10^3\\ \\mathrm{Ko}$ و $1\\ \\mathrm{Ko} = 10^3$ أكتي.',
            'إذن $1\\ \\mathrm{Go} = 10^{3} \\times 10^{3} \\times 10^{3} = 10^{3+3+3} = 10^{9}$ أكتي.',
          ] },
        ],
      },
      {
        label: '2)', title: 'التيرا أكتي',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الأس'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['jidaa-quwa-ashara'], prompt: '$1\\ \\mathrm{To} = 10^{n}$ أكتي : $n =$', expected: 12,
            explain: 'أربع وحدات متتالية كل منها $10^3$ : $3 + 3 + 3 + 3 = 12$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$1\\ \\mathrm{To} = 10^3\\ \\mathrm{Go} = 10^{3} \\times 10^{9}$ أكتي.',
            'إذن $1\\ \\mathrm{To} = 10^{3+9} = 10^{12}$ أكتي.',
          ] },
        ],
      },
      {
        label: '3)', title: 'عدد الصور',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['عدد الصور'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwa-ashara'], prompt: '$\\frac{128 \\times 10^{9}}{4 \\times 10^{6}} =$', expected: 32000, display: '32 000',
            explain: '$\\frac{128}{4} = 32$ و $\\frac{10^9}{10^6} = 10^{3}$ ، إذن $32 \\times 10^{3} = 32\\,000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'السعة $128 \\times 10^{9}$ أكتي وحجم الصورة $4 \\times 10^{6}$ أكتي.',
            '$\\frac{128 \\times 10^{9}}{4 \\times 10^{6}} = 32 \\times 10^{9-6} = 32 \\times 10^{3} = 32\\,000$ صورة.',
          ] },
        ],
      },
      {
        label: '4)', title: 'جيغا في تيرا',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['عدد الجيغا'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwa-ashara'], prompt: '$\\frac{10^{12}}{10^{9}} = 10^{n}$ : $n =$', expected: 3,
            explain: 'ننقص الأسّين: $12 - 9 = 3$ ، فالتيرا الواحد ألف جيغا.' },
          { kind: 'solution', ask: 0, lines: [
            '$1\\ \\mathrm{To} = 10^{12}$ أكتي و $1\\ \\mathrm{Go} = 10^{9}$ أكتي.',
            'عدد الجيغا في التيرا $= \\frac{10^{12}}{10^{9}} = 10^{3}$ ، أي 1 000 جيغا أكتي.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الخزّان والمزرعة',
    context: 'المتر المكعّب واللتر',
    emoji: '💧',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'خزّان السطح', lines: [{ label: 'حرفه', value: '1 م' }] }, { title: 'قطرة الماء', lines: [{ label: 'حجمها', value: '5 × 10⁻² سم³' }] }, { title: 'مزرعة متيجة', lines: [{ label: 'مساحتها', value: '1 كم²' }] }], ariaLabel: 'ثلاث بطاقات: خزّان مكعّب حرفه 1 م، وقطرة ماء حجمها 5 × 10⁻² سم³، ومزرعة مساحتها 1 كم²' },
    statement: 'فوق سطح بيت أمين خزّان ماء مكعّب طول حرفه $1\\ \\mathrm{m}$ ، وفي سهل متيجة مزرعة مساحتها $1\\ \\mathrm{km^2}$ . نعلم أنّ $1\\ \\mathrm{m} = 10^{1}\\ \\mathrm{dm} = 10^{2}\\ \\mathrm{cm}$ و $1\\ \\mathrm{km} = 10^{3}\\ \\mathrm{m}$ و $1\\ \\mathrm{ha} = 10^{4}\\ \\mathrm{m^2}$ ، وأنّ $1\\ \\mathrm{dm^3} = 1$ لتر.',
    data: [
      { id: 'tank', text: 'الخزّان مكعّب حرفه 1 م', useful: true },
      { id: 'dm', text: '1 م = 10¹ دسم = 10² سم', useful: true },
      { id: 'drop', text: 'القطرة الواحدة حوالي 5 × 10⁻² سم³', useful: true },
      { id: 'farm', text: 'المزرعة 1 كم² و 1 هكتار = 10⁴ م²', useful: true },
      { id: 'roof', text: 'الخزّان فوق سطح البيت', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'باللترات',
        question: 'عبّر عن حجم الخزّان باللترات على شكل قوة للعدد 10 .',
        asks: ['الأس'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwat-quwa-ashara'], prompt: '$1\\ \\mathrm{m^3} = (10^{1})^{3}\\ \\mathrm{dm^3} = 10^{n}$ لتر : $n =$', expected: 3,
            explain: 'قوة قوة: $(10^{1})^{3} = 10^{1 \\times 3} = 10^{3}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الخزّان مكعّب حرفه $10^{1}\\ \\mathrm{dm}$ ، فحجمه $(10^{1})^{3}\\ \\mathrm{dm^3}$ .',
            '$(10^{1})^{3} = 10^{3}$ ، أي $1\\ \\mathrm{m^3} = 10^{3}$ لتر.',
          ] },
        ],
      },
      {
        label: '2)', title: 'بالسنتيمترات المكعّبة',
        question: 'عبّر عن حجم الخزّان بـ $\\mathrm{cm^3}$ على شكل قوة للعدد 10 .',
        asks: ['الأس'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwat-quwa-ashara'], prompt: '$1\\ \\mathrm{m^3} = (10^{2})^{3}\\ \\mathrm{cm^3} = 10^{n}\\ \\mathrm{cm^3}$ : $n =$', expected: 6,
            explain: '$(10^{2})^{3} = 10^{2 \\times 3} = 10^{6}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'حرف الخزّان $10^{2}\\ \\mathrm{cm}$ ، فحجمه $(10^{2})^{3}\\ \\mathrm{cm^3}$ .',
            '$(10^{2})^{3} = 10^{6}$ ، أي $1\\ \\mathrm{m^3} = 10^{6}\\ \\mathrm{cm^3}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'قطرات الماء',
        question: 'كم قطرة تملأ الخزّان، علمًا أنّ حجم القطرة الواحدة حوالي $5 \\times 10^{-2}\\ \\mathrm{cm^3}$ ؟',
        asks: ['عدد القطرات'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['hasil-quwa-ashara'], prompt: '$\\frac{10^{6}}{5 \\times 10^{-2}} =$', expected: 20000000, display: '20 000 000',
            explain: '$\\frac{10^{6}}{10^{-2}} = 10^{8}$ ، إذن $\\frac{10^{8}}{5} = 2 \\times 10^{7} = 20\\,000\\,000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'عدد القطرات $= \\frac{10^{6}}{5 \\times 10^{-2}} = \\frac{1}{5} \\times 10^{6-(-2)} = \\frac{1}{5} \\times 10^{8}$ .',
            '$\\frac{1}{5} \\times 10^{8} = 2 \\times 10^{7} = 20\\,000\\,000$ قطرة.',
          ] },
        ],
      },
      {
        label: '4)', title: 'المزرعة بالهكتار',
        question: 'كم هكتارًا تساوي مساحة المزرعة؟',
        asks: ['المساحة بالهكتار'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['quwat-quwa-ashara'], prompt: '$1\\ \\mathrm{km^2} = (10^{3})^{2}\\ \\mathrm{m^2} = 10^{6}\\ \\mathrm{m^2}$ ، ثم $\\frac{10^{6}}{10^{4}} =$', expected: 100,
            explain: '$(10^{3})^{2} = 10^{6}$ ، ثم $\\frac{10^{6}}{10^{4}} = 10^{2} = 100$ هكتار.' },
          { kind: 'solution', ask: 0, lines: [
            '$1\\ \\mathrm{km^2} = (10^{3}\\ \\mathrm{m})^{2} = 10^{6}\\ \\mathrm{m^2}$ .',
            '$\\frac{10^{6}}{10^{4}} = 10^{2} = 100$ ، أي مساحة المزرعة 100 هكتار.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — برنامج الحساب',
    context: 'نادي الرياضيات',
    emoji: '🧮',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'البرنامج', lines: [{ label: 'أوّلًا', value: '× 10⁶' }, { label: 'ثم', value: '÷ 10⁻³' }, { label: 'ثم', value: '× (10⁻²)⁴' }] }], ariaLabel: 'برنامج حساب: اضرب في 10 أس 6، ثم اقسم على 10 أس سالب 3، ثم اضرب في (10 أس سالب 2) أس 4' },
    statement: 'علّق نادي الرياضيات برنامج حساب: «اختر عددًا، اضربه في $10^{6}$ ، اقسم الناتج على $10^{-3}$ ، ثم اضربه في $(10^{-2})^{4}$ ».',
    data: [
      { id: 'p1', text: 'الخطوة الأولى: ضرب في 10⁶', useful: true },
      { id: 'p2', text: 'الخطوة الثانية: قسمة على 10⁻³', useful: true },
      { id: 'p3', text: 'الخطوة الثالثة: ضرب في (10⁻²)⁴', useful: true },
      { id: 'p4', text: 'البرنامج علّقه النادي', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'نبدأ بـ 2',
        question: 'ما النتيجة إذا اخترنا 2 ؟',
        asks: ['النتيجة'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tabsit-ashara'], prompt: 'النتيجة:', expected: 20,
            explain: '$2 \\times 10^{6} \\div 10^{-3} \\times 10^{-8} = 2 \\times 10^{6+3-8} = 2 \\times 10^{1} = 20$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$(10^{-2})^{4} = 10^{-8}$ .',
            '$2 \\times 10^{6} \\div 10^{-3} \\times 10^{-8} = 2 \\times 10^{6-(-3)+(-8)} = 2 \\times 10^{1} = 20$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'نبدأ بـ 0,35',
        question: 'ما النتيجة إذا اخترنا $0{,}35$ ؟',
        asks: ['النتيجة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tabsit-ashara'], prompt: 'النتيجة:', expected: 3.5, display: '3,5',
            explain: '$0{,}35 \\times 10^{1} = 3{,}5$ .' },
          { kind: 'solution', ask: 0, lines: [
            'السلسلة كلّها ضرب في $10^{6-(-3)+(-8)} = 10^{1}$ .',
            '$0{,}35 \\times 10 = 3{,}5$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'ضرب واحد',
        question: 'اكتب البرنامج كضرب واحد في $10^{n}$ ، وعيّن $n$ .',
        asks: ['الأس'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tabsit-ashara'], prompt: 'البرنامج هو الضرب في $10^{n}$ : $n =$', expected: 1,
            explain: '$6 - (-3) + (-8) = 6 + 3 - 8 = 1$ .' },
          { kind: 'solution', ask: 0, lines: [
            'القسمة على $10^{-3}$ تنقص $-3$ من الأسّ، أي تضيف 3 .',
            '$n = 6 + 3 + (-8) = 1$ ، فالبرنامج ضرب في $10^{1}$ .',
          ] },
        ],
      },
      {
        label: '4)', title: 'حكم أنيس',
        question: 'قال أنيس: «النتيجة دائمًا عشرة أضعاف العدد المختار». هل هو على صواب؟',
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tabsit-ashara'],
            prompt: 'قال أنيس إنّ النتيجة دائمًا عشرة أضعاف العدد المختار :',
            options: ['صحيح: البرنامج ضرب في $10^{1}$ مهما كان العدد المختار', 'خطأ: النتيجة تتغيّر من عدد إلى آخر فلا ضرب ثابت', 'خطأ: النتيجة هي عُشر العدد المختار'], correct: 0, cols: 1,
            explain: 'الضرب في $10^{1}$ ثابت: إذا اخترنا $10^{-1}$ نجد $10^{-1} \\times 10 = 1$ .' },
          { kind: 'solution', ask: 0, lines: [
            'كل الخطوات ضرب أو قسمة على قوى العدد 10 ، فهي معًا ضرب واحد في $10^{1}$ .',
            'مثلًا بالعدد $10^{-1}$ نجد $10^{-1} \\times 10 = 1$ : أنيس على صواب.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
