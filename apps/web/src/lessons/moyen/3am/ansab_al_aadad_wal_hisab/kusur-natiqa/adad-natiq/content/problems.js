/**
 * Les trois « مسائل » du درس « العدد الناطق » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 (`LESSON_CONFIG.lessonProblem`) :
 * le refroidissement d'une nuit d'hiver à Sétif, Batna et Khenchela (trois taux de variation écrits −7/3, −9/4, −13/6 °C par heure, rangés, la ville qui refroidit le plus vite) ; la 2 la descente
 * d'un plongeur (−10/3 m par minute, entre −4 et −3, non décimal, ≈ −3,33) ; la 3 le niveau du barrage de Beni Haroun (−7/4 puis 5/6 cm par jour, le plus éloigné de zéro, le rangement).
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt). Aucune opération sur les nombres ناطقة (la leçon suivante) : seulement un quotient, sa forme modèle et l'ordre.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — أيّ مدينة بردت أسرع؟',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🌡️',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'سطيف: من 3° إلى −4° في 3 ساعات', useful: true },
      { id: 'd2', text: 'باتنة: من 1° إلى −8° في 4 ساعات', useful: true },
      { id: 'd3', text: 'خنشلة: من 0° إلى −13° في 6 ساعات', useful: true },
      { id: 'd4', text: 'كانت السماء صافية في تلك الليلة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تغيّر الحرارة في الساعة',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['تغيّر الحرارة في الساعة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['adad-natiq'],
            prompt: 'كيف نحسب تغيّر الحرارة في الساعة؟',
            options: ['نقسم تغيّر الحرارة على عدد الساعات', 'نضرب تغيّر الحرارة في عدد الساعات', 'نجمع الحرارتين'], correct: 0, cols: 1,
            explain: 'تغيّر الحرارة في الساعة الواحدة هو حاصل قسمة التغيّر الكلّي على المدّة، وإشارته سالبة لأنّ الحرارة تنزل.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maqam-mujab'],
            prompt: 'تغيّر الحرارة في الساعة في المدن الثلاث (سطيف ثمّ باتنة ثمّ خنشلة):',
            options: ['$-\\frac{7}{3}$ ، $-\\frac{9}{4}$ ، $-\\frac{13}{6}$', '$\\frac{7}{3}$ ، $\\frac{9}{4}$ ، $\\frac{13}{6}$', '$-\\frac{3}{7}$ ، $-\\frac{4}{9}$ ، $-\\frac{6}{13}$'], correct: 0, cols: 1,
            explain: 'سطيف نزلت $7$ درجات في $3$ ساعات: $\\frac{-7}{3}$ ؛ باتنة $9$ في $4$ ساعات: $\\frac{-9}{4}$ ؛ خنشلة $13$ في $6$ ساعات: $\\frac{-13}{6}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'التغيّر الكلّي في سطيف $-4-3=-7$ درجات في $3$ ساعات: $\\frac{-7}{3}=-\\frac{7}{3}$ درجة في الساعة.',
            'في باتنة $-8-1=-9$ درجات في $4$ ساعات: $-\\frac{9}{4}$ ؛ وفي خنشلة $-13$ درجة في $6$ ساعات: $-\\frac{13}{6}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'الترتيب',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الترتيب التصاعدي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-natiqa'],
            prompt: 'الترتيب التصاعدي:',
            options: ['$-\\frac{7}{3}<-\\frac{9}{4}<-\\frac{13}{6}$', '$-\\frac{13}{6}<-\\frac{9}{4}<-\\frac{7}{3}$', '$-\\frac{9}{4}<-\\frac{7}{3}<-\\frac{13}{6}$'], correct: 0, cols: 1,
            explain: 'بالمقام $12$ : $-\\frac{28}{12}$ ، $-\\frac{27}{12}$ ، $-\\frac{26}{12}$ ، و $-28<-27<-26$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$12$ مضاعف مشترك للمقامات $3$ و $4$ و $6$ : $-\\frac{7}{3}=-\\frac{28}{12}$ ، $-\\frac{9}{4}=-\\frac{27}{12}$ ، $-\\frac{13}{6}=-\\frac{26}{12}$ .',
            'على يسار الصفر الأبعد عن الصفر هو الأصغر: $-28<-27<-26$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'الأسرع',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['المدينة الأسرع تبريدًا'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-natiqa'],
            prompt: 'المدينة التي بردت أسرع:',
            options: ['سطيف', 'باتنة', 'خنشلة'], correct: 0, cols: 3,
            explain: 'الحرارة نزلت في سطيف $\\frac{28}{12}$ درجة في الساعة، وهذا أكبر من $\\frac{27}{12}$ و $\\frac{26}{12}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'أسرع تبريد هو أكبر نزول في الساعة، أي أصغر عدد من الأعداد الثلاثة: $-\\frac{7}{3}$ .',
            'المدينة هي سطيف.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — الغوّاص',
    context: 'غوّاص يتدرّب',
    emoji: '🤿',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'الغوّاص', lines: [{ label: 'نزل', value: '20 م' }, { label: 'في', value: '6 دقائق' }] }], ariaLabel: 'بطاقة: غوّاص نزل 20 مترًا في 6 دقائق بانتظام' },
    statement: 'نزل غوّاص $20$ m في $6$ دقائق بانتظام.',
    data: [
      { id: 'a', text: 'النزول: 20 م', useful: true },
      { id: 'b', text: 'المدّة: 6 دقائق', useful: true },
      { id: 'c', text: 'كان الماء صافيًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'تغيّر العمق في الدقيقة',
        question: 'اكتب تغيّر العمق في الدقيقة عددًا ناطقًا على أبسط شكل.',
        asks: ['تغيّر العمق في الدقيقة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maqam-mujab'],
            prompt: 'تغيّر العمق في الدقيقة:',
            options: ['$-\\frac{10}{3}$', '$\\frac{10}{3}$', '$-\\frac{3}{10}$'], correct: 0, cols: 3,
            explain: 'النزول تغيّر سالب: $\\frac{-20}{6}=-\\frac{20}{6}=-\\frac{10}{3}$ بعد الاختزال بالقسمة على $2$ .' },
          { kind: 'solution', ask: 0, lines: [
            'العمق ينقص $20$ m ، فتغيّره $-20$ m في $6$ دقائق: $\\frac{-20}{6}$ .',
            'نختزل بالقسمة على $2$ : $-\\frac{10}{3}$ متر في الدقيقة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'بين عددين صحيحين',
        question: 'بين أيّ عددين صحيحين يقع هذا العدد؟',
        asks: ['العددان الصحيحان'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-natiqa'],
            prompt: 'يقع $-\\frac{10}{3}$ بين',
            options: ['$-4$ و $-3$', '$-3$ و $-2$', '$3$ و $4$'], correct: 0, cols: 3,
            explain: '$-\\frac{10}{3}=-3-\\frac{1}{3}$ ، أي أبعد قليلًا من $-3$ نحو اليسار: بين $-4$ و $-3$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{10}{3}=3+\\frac{1}{3}$ ، فهو بين $3$ و $4$ .',
            'وعلى يسار الصفر: $-\\frac{10}{3}$ بين $-4$ و $-3$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل هو عدد عشري؟',
        question: 'هل هو عدد عشري؟ أعطِ قيمته المدوّرة إلى $0{,}01$ .',
        asks: ['الكتابة العشرية'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['adad-natiq-shamil'],
            prompt: 'العدد $-\\frac{10}{3}$ :',
            options: ['ليس عشريًّا، وقيمته المدوّرة $-3{,}33$', 'عشري: $-3{,}3$', 'ليس عشريًّا، وقيمته المدوّرة $-3{,}34$'], correct: 0, cols: 1,
            explain: '$10\\div3=3{,}333\\ldots$ لا تنتهي، فهو ناطق وليس عشريًّا؛ مدوّرًا إلى $0{,}01$ : $-3{,}33$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المقام $3$ فيه عامل أوّلي غير $2$ و $5$ ، فالعدد ليس عشريًّا.',
            '$10\\div3=3{,}333\\ldots$ ، فالقيمة المدوّرة إلى $0{,}01$ هي $-3{,}33$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — سدّ بني هارون',
    context: 'العناية بالماء',
    emoji: '💧',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'الفترة الأولى', lines: [{ label: 'انخفض', value: '7 سم' }, { label: 'في', value: '4 أيام' }] }, { title: 'الفترة الثانية', lines: [{ label: 'ارتفع', value: '5 سم' }, { label: 'في', value: '6 أيام' }] }], ariaLabel: 'بطاقتان: منسوب السدّ انخفض 7 سنتمترات في 4 أيام ثم ارتفع 5 سنتمترات في 6 أيام' },
    statement: 'انخفض منسوب السدّ $7$ cm في $4$ أيام، ثمّ ارتفع $5$ cm في $6$ أيام.',
    data: [
      { id: 'a', text: 'الانخفاض: 7 سم في 4 أيام', useful: true },
      { id: 'b', text: 'الارتفاع: 5 سم في 6 أيام', useful: true },
      { id: 'c', text: 'السدّ يزوّد المدن المجاورة بالماء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'التغيّر اليومي',
        question: 'اكتب التغيّر اليومي للمنسوب في كلّ فترة.',
        asks: ['التغيّر اليومي في كلّ فترة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['maqam-mujab'],
            prompt: 'التغيّر اليومي في الفترتين (الأولى ثمّ الثانية):',
            options: ['$-\\frac{7}{4}$ و $\\frac{5}{6}$', '$\\frac{7}{4}$ و $-\\frac{5}{6}$', '$-\\frac{4}{7}$ و $\\frac{6}{5}$'], correct: 0, cols: 1,
            explain: 'الانخفاض تغيّر سالب: $\\frac{-7}{4}$ ؛ والارتفاع موجب: $\\frac{5}{6}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'في الفترة الأولى: $\\frac{-7}{4}=-\\frac{7}{4}$ سم في اليوم (انخفاض).',
            'في الفترة الثانية: $\\frac{5}{6}$ سم في اليوم (ارتفاع).',
          ] },
        ],
      },
      {
        label: '2)', title: 'الأبعد عن الصفر',
        question: 'أيّ التغيّرين أبعد عن الصفر؟',
        asks: ['التغيّر الأبعد عن الصفر'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-natiqa'],
            prompt: 'التغيّر الأبعد عن الصفر:',
            options: ['$-\\frac{7}{4}$', '$\\frac{5}{6}$', 'هما على البعد نفسه'], correct: 0, cols: 3,
            explain: 'بالمقام $12$ : $\\frac{21}{12}$ و $\\frac{10}{12}$ ، و $21>10$ .' },
          { kind: 'solution', ask: 0, lines: [
            'المسافتان إلى الصفر: $\\frac{7}{4}=\\frac{21}{12}$ و $\\frac{5}{6}=\\frac{10}{12}$ .',
            '$21>10$ ، فالتغيّر $-\\frac{7}{4}$ هو الأبعد عن الصفر.',
          ] },
        ],
      },
      {
        label: '3)', title: 'الترتيب',
        question: 'رتّب تصاعديًّا: $-\\frac{7}{4}$ ، $\\frac{5}{6}$ ، $0$ ، $-\\frac{3}{2}$ .',
        asks: ['الترتيب التصاعدي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tartib-natiqa'],
            prompt: 'الترتيب التصاعدي:',
            options: ['$-\\frac{7}{4}<-\\frac{3}{2}<0<\\frac{5}{6}$', '$-\\frac{3}{2}<-\\frac{7}{4}<0<\\frac{5}{6}$', '$0<\\frac{5}{6}<-\\frac{3}{2}<-\\frac{7}{4}$'], correct: 0, cols: 1,
            explain: 'بالمقام $12$ : $-\\frac{21}{12}$ ، $-\\frac{18}{12}$ ، $0$ ، $\\frac{10}{12}$ ؛ السالبة أصغر من $0$ والأبعد عنه أصغرها.' },
          { kind: 'solution', ask: 0, lines: [
            'بالمقام $12$ : $-\\frac{7}{4}=-\\frac{21}{12}$ ، $-\\frac{3}{2}=-\\frac{18}{12}$ ، $\\frac{5}{6}=\\frac{10}{12}$ .',
            '$-21<-18<0<10$ ، فالترتيب $-\\frac{7}{4}<-\\frac{3}{2}<0<\\frac{5}{6}$ .',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
