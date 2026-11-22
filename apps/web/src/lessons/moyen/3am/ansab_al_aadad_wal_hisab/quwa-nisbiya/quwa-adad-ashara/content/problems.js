/**
 * Les trois « مسائل » du درس « قوى العدد 10 » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem).
 * La مسألة 1 « تحت المجهر » est la مسألة du درس (`LESSON_CONFIG.lessonProblem`) : des tailles minuscules écrites en décimal et à lire comme
 * des puissances de 10 ; la 2 des distances en kilomètres qu'on passe en mètres ; la 3 le compteur d'eau (مفكوك, litres). Aucune ne demande un
 * produit ni un quotient de puissances (frontière de l'unité) : les conversions sont posées en DÉCIMAL. Chaque nombre est vérifié dans
 * ./problems.test.js en arithmétique EXACTE (BigInt). Contextes algériens (حصّة العلوم الطبيعية، حافلة، عدّاد الماء).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — تحت المجهر',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🔬',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'سُمك الشعرة حوالي 0,0001 م', useful: true },
      { id: 'd2', text: 'قطر الكرية الحمراء حوالي 0,00001 م', useful: true },
      { id: 'd3', text: 'قطر الفيروس حوالي 0,0000001 م', useful: true },
      { id: 'd4', text: 'الحصّة في مادة العلوم الطبيعية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الشعرة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الأس'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ashara-salib'], prompt: '$0{,}0001 = 10^{n}$ : الأس $n$ هو', expected: -4, display: '−4',
            explain: 'الرقم 1 في الرتبة الرابعة بعد الفاصلة، إذن $0{,}0001 = 10^{-4}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$0{,}0001$ : الرقم 1 في الرتبة الرابعة بعد الفاصلة.',
            'إذن سُمك الشعرة $10^{-4}$ م.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الكرية والفيروس',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['قطر الكرية', 'قطر الفيروس'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ashara-salib'], prompt: '$0{,}00001 = 10^{n}$ : $n =$', expected: -5, display: '−5',
            explain: 'الرقم 1 في الرتبة الخامسة بعد الفاصلة.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ashara-salib'], prompt: '$0{,}0000001 = 10^{n}$ : $n =$', expected: -7, display: '−7',
            explain: 'الرقم 1 في الرتبة السابعة بعد الفاصلة.' },
          { kind: 'solution', ask: 0, lines: [
            'الكرية الحمراء : الرقم 1 في الرتبة 5 بعد الفاصلة، إذن قطرها $10^{-5}$ م.',
            'الفيروس : الرقم 1 في الرتبة 7 بعد الفاصلة، إذن قطره $10^{-7}$ م.',
          ] },
        ],
      },
      {
        label: '3)', title: 'أصفار الفيروس',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['عدد الأصفار'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ashara-salib'], prompt: 'عدد الأصفار قبل الرقم 1 في $0{,}0000001$ :', expected: 7,
            explain: 'صفر الوحدات وستة أصفار بعد الفاصلة : سبعة أصفار قبل الرقم 1 ، والرقم 1 في الرتبة السابعة.' },
          { kind: 'solution', ask: 0, lines: [
            '$0{,}0000001$ : صفر الوحدات ثم الفاصلة ثم ستة أصفار ثم الرقم 1 .',
            'عدد الأصفار قبل الرقم 1 هو 7 ، وهو رتبة الرقم 1 بعد الفاصلة.',
          ] },
        ],
      },
      {
        label: '4)', title: 'حكم سارة',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['الحكم'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ashara-salib'],
            prompt: 'قالت سارة إنّ الفيروس أصغر الأجسام الثلاثة :',
            options: ['صحيح : $10^{-7}$ أصغر من $10^{-5}$ ومن $10^{-4}$ ، لأنّ أسّه الأصغر', 'خطأ : $-7$ فيه رقم أكبر من $-4$', 'خطأ : $10^{-7}$ أكبر لأنّ 7 أكبر من 4'], correct: 0, cols: 1,
            explain: 'كلما كبر عدد النقرات نحو التصغير كان الضلع أصغر : $0{,}0000001 < 0{,}00001 < 0{,}0001$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$10^{-4} = 0{,}0001$ ، $10^{-5} = 0{,}00001$ ، $10^{-7} = 0{,}0000001$ .',
            'الأصغر من بين الثلاثة هو $0{,}0000001$ ، أي الفيروس : سارة على صواب.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — مسافات كبيرة',
    context: 'من الكيلومتر إلى المتر',
    emoji: '🚌',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'route', from: 'العاصمة', to: 'أقصى الجنوب', distance: '2 000', unit: 'km', vehicles: [{ icon: 'car' }], ariaLabel: 'طريق من العاصمة إلى أقصى الجنوب طوله حوالي 2 000 كيلومتر' },
    statement: 'تقطع حافلة حوالي $2\\,000\\ \\mathrm{km}$ من الجزائر العاصمة إلى أقصى الجنوب، ومحيط الأرض عند خط الاستواء حوالي $40\\,075\\ \\mathrm{km}$ . نعلم أنّ $1\\ \\mathrm{km} = 1\\,000\\ \\mathrm{m} = 10^{3}\\ \\mathrm{m}$ .',
    data: [
      { id: 'bus', text: 'الحافلة تقطع 2 000 كم', useful: true },
      { id: 'earth', text: 'محيط الأرض 40 075 كم', useful: true },
      { id: 'km', text: 'الكيلومتر الواحد 1 000 متر', useful: true },
      { id: 'city', text: 'الحافلة تنطلق من العاصمة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'بالأمتار',
        question: 'حوّل المسافة $2\\,000\\ \\mathrm{km}$ إلى أمتار.',
        asks: ['المسافة بالأمتار'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ashara-taarif'], prompt: 'المسافة بالأمتار:', expected: 2000000, display: '2 000 000',
            explain: '$2\\,000 \\times 1\\,000 = 2\\,000\\,000$ م.' },
          { kind: 'solution', ask: 0, lines: [
            'كل كيلومتر يساوي 1 000 م.',
            '$2\\,000 \\times 1\\,000 = 2\\,000\\,000$ ، أي $2\\,000\\,000$ م.',
          ] },
        ],
      },
      {
        label: '2)', title: 'على شكل جداء',
        question: 'اكتب $2\\,000\\,000 = 2 \\times 10^{n}$ ، وعيّن $n$ .',
        asks: ['الأس'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ashara-kn'], prompt: '$2\\,000\\,000 = 2 \\times 10^{n}$ : $n =$', expected: 6,
            explain: '$2\\,000\\,000 = 2 \\times 1\\,000\\,000$ ، والعدد $1\\,000\\,000$ فيه ستة أصفار بعد الرقم 1 .' },
          { kind: 'solution', ask: 0, lines: [
            '$2\\,000\\,000 = 2 \\times 1\\,000\\,000$ .',
            '$1\\,000\\,000 = 10^6$ ، إذن $2\\,000\\,000 = 2 \\times 10^6$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'محيط الأرض تقريبًا',
        question: 'عبّر عن $40\\,000\\ \\mathrm{km}$ بالأمتار ثم اكتب النتيجة على شكل $4 \\times 10^{n}$ .',
        asks: ['المسافة بالأمتار', 'الأس'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ashara-taarif'], prompt: '$40\\,000\\ \\mathrm{km}$ بالأمتار:', expected: 40000000, display: '40 000 000',
            explain: '$40\\,000 \\times 1\\,000 = 40\\,000\\,000$ م.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ashara-kn'], prompt: '$40\\,000\\,000 = 4 \\times 10^{n}$ : $n =$', expected: 7,
            explain: '$40\\,000\\,000 = 4 \\times 10\\,000\\,000$ ، والعدد $10\\,000\\,000$ فيه سبعة أصفار.' },
          { kind: 'solution', ask: 0, lines: [
            '$40\\,000 \\times 1\\,000 = 40\\,000\\,000$ م.',
            '$40\\,000\\,000 = 4 \\times 10\\,000\\,000 = 4 \\times 10^7$ .',
          ] },
        ],
      },
      {
        label: '4)', title: 'مفكوك الدقيق',
        question: 'اكتب مفكوك العدد $40\\,075$ (محيط الأرض بالكيلومتر).',
        asks: ['المفكوك'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ashara-mafkuk'],
            prompt: 'مفكوك $40\\,075$ هو:',
            options: ['$4 \\times 10^4 + 7 \\times 10^1 + 5 \\times 10^0$', '$4 \\times 10^4 + 7 \\times 10^2 + 5 \\times 10^1$', '$4 \\times 10^3 + 7 \\times 10^1 + 5 \\times 10^0$'], correct: 0, cols: 1,
            explain: 'الرقم 4 في رتبة عشرات الآلاف، و 0 في الآلاف والمئات (لا تظهر)، و 7 في العشرات، و 5 في الوحدات.' },
          { kind: 'solution', ask: 0, lines: [
            '$40\\,075$ : 4 عشرات الآلاف $(10^4)$ ، 7 عشرات $(10^1)$ ، 5 وحدات $(10^0)$ ؛ والرتبتان الفارغتان لا تظهران.',
            '$40\\,075 = 4 \\times 10^4 + 7 \\times 10^1 + 5 \\times 10^0$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — عدّاد الماء',
    context: 'المكعّبات واللترات',
    emoji: '💧',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'عدّاد الماء', lines: [{ label: 'الأسود', value: '1 207' }, { label: 'الأحمر', value: '035' }] }, { title: 'استهلاك الشهر', lines: [{ label: 'بالمتر المكعّب', value: '18' }] }], ariaLabel: 'بطاقتان: عدّاد الماء يقرأ 1 207 بالأسود و 035 بالأحمر، واستهلاك الشهر 18 متر مكعّب' },
    statement: 'يقرأ عدّاد الماء في بيت ياسين $1\\,207{,}035\\ \\mathrm{m^3}$ (الأرقام السوداء بالمتر المكعّب والحمراء أجزاؤه). استهلكت العائلة في الشهر الماضي $18\\ \\mathrm{m^3}$ . نعلم أنّ $1\\ \\mathrm{L} = 10^{-3}\\ \\mathrm{m^3} = 0{,}001\\ \\mathrm{m^3}$ .',
    data: [
      { id: 'read', text: 'قراءة العدّاد 1 207,035 متر مكعّب', useful: true },
      { id: 'month', text: 'استهلاك الشهر 18 متر مكعّب', useful: true },
      { id: 'litre', text: 'اللتر الواحد 0,001 متر مكعّب', useful: true },
      { id: 'house', text: 'العدّاد في بيت ياسين', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'مفكوك القراءة',
        question: 'اكتب مفكوك العدد $1\\,207{,}035$ .',
        asks: ['المفكوك'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['ashara-mafkuk'],
            prompt: 'مفكوك $1\\,207{,}035$ هو:',
            options: ['$1 \\times 10^3 + 2 \\times 10^2 + 7 \\times 10^0 + 3 \\times 10^{-2} + 5 \\times 10^{-3}$', '$1 \\times 10^3 + 2 \\times 10^2 + 7 \\times 10^1 + 3 \\times 10^{-2} + 5 \\times 10^{-3}$', '$1 \\times 10^3 + 2 \\times 10^2 + 7 \\times 10^0 + 3 \\times 10^{-1} + 5 \\times 10^{-2}$'], correct: 0, cols: 1,
            explain: 'بعد الفاصلة: 0 في العُشر (لا يظهر)، و 3 في الجزء من مئة، و 5 في الجزء من ألف. وقبلها: 0 في العشرات (لا يظهر) و 7 في الوحدات.' },
          { kind: 'solution', ask: 0, lines: [
            'الأرقام وأرتبها : 1 (آلاف) ، 2 (مئات) ، 0 (عشرات) ، 7 (وحدات) ، 0 (عُشر) ، 3 (جزء من مئة) ، 5 (جزء من ألف).',
            '$1\\,207{,}035 = 1 \\times 10^3 + 2 \\times 10^2 + 7 \\times 10^0 + 3 \\times 10^{-2} + 5 \\times 10^{-3}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الجزء الأحمر',
        question: 'الجزء الأحمر من القراءة هو $0{,}035\\ \\mathrm{m^3}$ . كم لترًا هو؟',
        asks: ['عدد اللترات'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ashara-salib'], prompt: '$0{,}035\\ \\mathrm{m^3}$ بالليترات:', expected: 35,
            explain: 'كل لتر هو $0{,}001\\ \\mathrm{m^3}$ ، والمتر المكعّب 1 000 لتر : $0{,}035 \\times 1\\,000 = 35$ لترًا.' },
          { kind: 'solution', ask: 0, lines: [
            '$1\\ \\mathrm{m^3} = 1\\,000\\ \\mathrm{L}$ لأنّ $1\\ \\mathrm{L} = 0{,}001\\ \\mathrm{m^3}$ .',
            '$0{,}035 \\times 1\\,000 = 35$ ، أي $35\\ \\mathrm{L}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'استهلاك الشهر',
        question: 'عبّر عن استهلاك الشهر $18\\ \\mathrm{m^3}$ باللترات على الشكل $18 \\times 10^{n}$ ثم اكتبه كتابة عشرية.',
        asks: ['الأس', 'الاستهلاك باللترات'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['ashara-kn'], prompt: 'كل متر مكعّب $= 10^{n}$ لتر : $n =$', expected: 3,
            explain: '$1\\ \\mathrm{m^3} = 1\\,000\\ \\mathrm{L}$ والعدد 1 000 فيه ثلاثة أصفار.' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['ashara-kn'], prompt: '$18 \\times 10^{3} =$', expected: 18000, display: '18 000',
            explain: 'الضرب في $10^3$ يزيح الفاصلة ثلاث رتب إلى اليمين : $18 \\times 1\\,000 = 18\\,000$ .' },
          { kind: 'solution', ask: 0, lines: [
            'كل $\\mathrm{m^3}$ يساوي $10^3$ لتر، إذن $18\\ \\mathrm{m^3} = 18 \\times 10^3\\ \\mathrm{L}$ .',
            '$18 \\times 10^3 = 18\\,000$ ، أي استهلكت العائلة $18\\,000$ لتر.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
