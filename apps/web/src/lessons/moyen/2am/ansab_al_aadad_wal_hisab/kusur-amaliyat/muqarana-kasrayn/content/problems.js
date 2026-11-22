/**
 * Les trois « مسائل » du درس « مقارنة كسرين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل الأول, résolus pas à pas (GuidedProblem). AJOUTS DE LA PLATEFORME
 * (`addition('exam_style_problem')`), contextes de la plateforme (les dons des classes à la bibliothèque, trois lecteurs d'un même roman, la terre d'une famille). Périmètre : même
 * dénominateur, même numérateur, un dénominateur multiple de l'autre, comparaison à 1 et à un demi, rangement ; jamais de produit en croix ni de multiple commun quelconque.
 * La مسألة 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) ; chaque nombre est vérifié dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — تبرّعات الأقسام',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '📚',
    tone: 'amber',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'first', text: 'القسم الأوّل: 5/12 من المبلغ', useful: true },
      { id: 'second', text: 'القسم الثاني: 1/3 من المبلغ', useful: true },
      { id: 'third', text: 'القسم الثالث: الباقي', useful: true },
      { id: 'shelf', text: 'تُوضع الكتب في رفوف خشبية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حصّة القسم الثالث',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الحصّة'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tawhid-li-muqarana'],
            prompt: 'نكتب حصّة القسم الثاني بمقام القسم الأوّل: $\\frac{1}{3}=$',
            options: ['$\\frac{4}{12}$', '$\\frac{1}{12}$', '$\\frac{3}{12}$'], correct: 0, cols: 1,
            explain: '$12=3\\times 4$ ، فنضرب حدّي $\\frac{1}{3}$ في $4$ : $\\frac{4}{12}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nafs-al-maqam'],
            prompt: 'حصّة القسم الثالث من المبلغ:',
            options: ['$\\frac{1}{4}$', '$\\frac{3}{4}$', '$\\frac{9}{12}$'], correct: 0, cols: 1,
            explain: '$1-\\frac{5}{12}-\\frac{4}{12}=\\frac{12-5-4}{12}=\\frac{3}{12}=\\frac{1}{4}$ . ($\\frac{9}{12}$ هو ما جمعه القسمان الأوّلان.)' },
          { kind: 'solution', ask: 0, lines: ['حصّة الثاني: $\\frac{1}{3}=\\frac{4}{12}$ لأنّ $12=3\\times 4$ .', 'الباقي: $\\frac{12}{12}-\\frac{5}{12}-\\frac{4}{12}=\\frac{3}{12}=\\frac{1}{4}$ من المبلغ.'] },
        ],
      },
      {
        label: '2)', title: 'ترتيب الحصص',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الترتيب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nafs-al-maqam', 'tartib-kusur'],
            prompt: 'الحصص $\\frac{5}{12}$ و $\\frac{4}{12}$ و $\\frac{3}{12}$ مرتّبة تنازليًا:',
            options: ['$\\frac{5}{12}>\\frac{4}{12}>\\frac{3}{12}$', '$\\frac{3}{12}>\\frac{4}{12}>\\frac{5}{12}$', '$\\frac{4}{12}>\\frac{5}{12}>\\frac{3}{12}$'], correct: 0, cols: 1,
            explain: 'المقام نفسه $12$ : نرتّب الحصص كبسوطها $5>4>3$ .' },
          { kind: 'solution', ask: 0, lines: ['الحصص بالمقام نفسه $12$ : $\\frac{5}{12}$ ، $\\frac{4}{12}$ ، $\\frac{3}{12}$ .', 'الأكبر هو الأكبر بسطًا: $\\frac{5}{12}>\\frac{4}{12}>\\frac{3}{12}$ .'] },
        ],
      },
      {
        label: '3)', title: 'هل تجاوز القسم الأوّل النصف؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['الجواب'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tawhid-li-muqarana'], prompt: 'النصف بالمقام $12$ : $\\frac{1}{2}=\\frac{\\ldots}{12}$ . البسط:', expected: 6,
            explain: '$12=2\\times 6$ ، فنضرب حدّي $\\frac{1}{2}$ في $6$ : $\\frac{6}{12}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nafs-al-maqam', 'muqarana-bi-1'],
            prompt: 'مقارنة $\\frac{5}{12}$ بالنصف:',
            options: ['لا: $\\frac{5}{12}<\\frac{6}{12}$', 'نعم: $\\frac{5}{12}>\\frac{6}{12}$', 'يساوي النصف تمامًا'], correct: 0, cols: 1,
            explain: 'المقام نفسه $12$ و $5<6$ ، فالقسم الأوّل ساهم بأقلّ من النصف.' },
          { kind: 'solution', ask: 0, lines: ['النصف: $\\frac{1}{2}=\\frac{6}{12}$ .', 'المقام نفسه و $5<6$ : $\\frac{5}{12}<\\frac{6}{12}$ ، فالقسم الأوّل لم يساهم بأكثر من النصف.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — من قرأ أكثر؟',
    context: 'نادي القراءة',
    emoji: '📖',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'أمينة', icon: 'book', lines: [{ label: 'قرأت', value: '3/8', unit: 'الرواية' }] }, { title: 'ياسر', icon: 'book', lines: [{ label: 'قرأ', value: '3/5', unit: 'الرواية' }] }, { title: 'هدى', icon: 'book', lines: [{ label: 'قرأت', value: '7/10', unit: 'الرواية' }] }], ariaLabel: 'ثلاث بطاقات: أمينة قرأت ثلاثة أثمان الرواية وياسر ثلاثة أخماسها وهدى سبعة أعشارها' },
    statement: 'اقترح نادي القراءة في المتوسطة رواية واحدة على أعضائه. قرأت أمينة $\\frac{3}{8}$ من الرواية، وقرأ ياسر $\\frac{3}{5}$ منها، وقرأت هدى $\\frac{7}{10}$ منها.',
    data: [
      { id: 'a', text: 'أمينة: 3/8 من الرواية', useful: true },
      { id: 'y', text: 'ياسر: 3/5 من الرواية', useful: true },
      { id: 'h', text: 'هدى: 7/10 من الرواية', useful: true },
      { id: 'cover', text: 'غلاف الرواية أزرق', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'أمينة أم ياسر',
        question: 'من قرأ أكثر: أمينة أم ياسر؟',
        asks: ['القارئ'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['nafs-al-bast'],
            prompt: 'الكسران $\\frac{3}{8}$ و $\\frac{3}{5}$ لهما البسط نفسه $3$ . أيّ قاعدة نستعمل؟',
            options: ['الأكبر هو الأصغر مقامًا', 'الأكبر هو الأكبر مقامًا', 'نجمع المقامين'], correct: 0, cols: 1,
            explain: 'عند البسط نفسه تكون القطع أكبر كلّما كان عدد الأجزاء أقلّ، أي المقام أصغر.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nafs-al-bast'],
            prompt: 'من قرأ أكثر؟',
            options: ['ياسر', 'أمينة', 'قرآ القدر نفسه'], correct: 0, cols: 1,
            explain: 'البسط نفسه $3$ والمقام $5<8$ ، فـ $\\frac{3}{5}>\\frac{3}{8}$ : ياسر قرأ أكثر.' },
          { kind: 'solution', ask: 0, lines: ['للكسرين البسط نفسه $3$ فنقارن مقاميهما: $5<8$ .', 'الأصغر مقامًا هو الأكبر: $\\frac{3}{5}>\\frac{3}{8}$ ، فياسر قرأ أكثر من أمينة.'] },
        ],
      },
      {
        label: '2)', title: 'ياسر أم هدى',
        question: 'من قرأ أكثر: ياسر أم هدى؟',
        asks: ['القارئ'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tawhid-li-muqarana'], prompt: 'نكتب $\\frac{3}{5}$ بالمقام $10$ : $\\frac{3}{5}=\\frac{\\ldots}{10}$ . البسط:', expected: 6,
            explain: '$10=5\\times 2$ ، فنضرب حدّي $\\frac{3}{5}$ في $2$ : $\\frac{6}{10}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nafs-al-maqam'],
            prompt: 'من قرأ أكثر؟',
            options: ['هدى', 'ياسر', 'قرآ القدر نفسه'], correct: 0, cols: 1,
            explain: 'المقام نفسه $10$ و $6<7$ ، فـ $\\frac{6}{10}<\\frac{7}{10}$ : هدى قرأت أكثر.' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{3}{5}=\\frac{6}{10}$ لأنّ $10=5\\times 2$ .', 'المقام نفسه $10$ و $6<7$ : $\\frac{6}{10}<\\frac{7}{10}$ ، فهدى قرأت أكثر من ياسر.'] },
        ],
      },
      {
        label: '3)', title: 'من تجاوز النصف',
        question: 'من قرأ أكثر من نصف الرواية؟',
        asks: ['القرّاء'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['nafs-al-maqam', 'muqarana-bi-1'],
            prompt: 'أمينة قرأت $\\frac{3}{8}$ والنصف $\\frac{4}{8}$ . هل قرأت أكثر من النصف؟',
            options: ['لا', 'نعم'], correct: 0, cols: 2,
            explain: 'المقام نفسه $8$ و $3<4$ ، فـ $\\frac{3}{8}<\\frac{1}{2}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['tawhid-li-muqarana'],
            prompt: 'بمقارنة $\\frac{3}{5}=\\frac{6}{10}$ و $\\frac{7}{10}$ بالنصف $\\frac{5}{10}$ ، من قرأ أكثر من النصف؟',
            options: ['ياسر وهدى', 'أمينة وياسر', 'هدى فقط', 'الثلاثة جميعًا'], correct: 0, cols: 1,
            explain: '$\\frac{6}{10}>\\frac{5}{10}$ و $\\frac{7}{10}>\\frac{5}{10}$ ، أمّا أمينة فأقلّ من النصف.' },
          { kind: 'solution', ask: 0, lines: ['أمينة: $\\frac{3}{8}<\\frac{4}{8}=\\frac{1}{2}$ .', 'ياسر: $\\frac{6}{10}>\\frac{5}{10}$ ، وهدى: $\\frac{7}{10}>\\frac{5}{10}$ ، فهما اللذان قرآ أكثر من النصف.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — أرض العائلة',
    context: 'أرض الفلّاح',
    emoji: '🌾',
    tone: 'violet',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'القمح', icon: 'sack', lines: [{ label: 'زُرع', value: '3/8', unit: 'الأرض' }] }, { title: 'الشعير', icon: 'sack', lines: [{ label: 'زُرع', value: '1/4', unit: 'الأرض' }] }, { title: 'العدس', icon: 'sack', lines: [{ label: 'زُرع', value: '5/16', unit: 'الأرض' }] }], ariaLabel: 'ثلاث بطاقات: ثلاثة أثمان الأرض قمحًا وربعها شعيرًا وخمسة أجزاء من ستّة عشر عدسًا' },
    statement: 'زرع فلّاح $\\frac{3}{8}$ من أرضه قمحًا، و $\\frac{1}{4}$ منها شعيرًا، و $\\frac{5}{16}$ منها عدسًا، وترك الباقي دون زرع.',
    data: [
      { id: 'w', text: 'القمح: 3/8 من الأرض', useful: true },
      { id: 'b', text: 'الشعير: 1/4 من الأرض', useful: true },
      { id: 'l', text: 'العدس: 5/16 من الأرض', useful: true },
      { id: 'v', text: 'الأرض قريبة من الوادي', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ترتيب الأجزاء المزروعة',
        question: 'رتّب الأجزاء الثلاثة المزروعة تصاعديًا (من الأصغر إلى الأكبر).',
        asks: ['الترتيب'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['tawhid-li-muqarana'], prompt: 'نكتب $\\frac{3}{8}$ بالمقام $16$ : $\\frac{3}{8}=\\frac{\\ldots}{16}$ . البسط:', expected: 6,
            explain: '$16=8\\times 2$ ، فنضرب حدّي $\\frac{3}{8}$ في $2$ : $\\frac{6}{16}$ . وكذلك $\\frac{1}{4}=\\frac{4}{16}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nafs-al-maqam', 'tartib-kusur'],
            prompt: 'بالمقام $16$ : $\\frac{6}{16}$ و $\\frac{4}{16}$ و $\\frac{5}{16}$ . الترتيب التصاعدي للأجزاء:',
            options: ['$\\frac{1}{4}<\\frac{5}{16}<\\frac{3}{8}$', '$\\frac{3}{8}<\\frac{5}{16}<\\frac{1}{4}$', '$\\frac{5}{16}<\\frac{1}{4}<\\frac{3}{8}$'], correct: 0, cols: 1,
            explain: 'المقام نفسه $16$ والبسوط $4<5<6$ ، أي $\\frac{4}{16}<\\frac{5}{16}<\\frac{6}{16}$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{3}{8}=\\frac{6}{16}$ و $\\frac{1}{4}=\\frac{4}{16}$ و $\\frac{5}{16}$ كما هو.', 'نرتّب البسوط $4<5<6$ : $\\frac{1}{4}<\\frac{5}{16}<\\frac{3}{8}$ .'] },
        ],
      },
      {
        label: '2)', title: 'الجزء غير المزروع',
        question: 'ما الجزء غير المزروع من الأرض؟',
        asks: ['الجزء'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['nafs-al-maqam'], prompt: 'المزروع كلّه بالمقام $16$ : $\\frac{6+4+5}{16}$ . البسط:', expected: 15,
            explain: '$6+4+5=15$ ، فالمزروع $\\frac{15}{16}$ من الأرض.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['nafs-al-maqam'],
            prompt: 'الجزء غير المزروع من الأرض:',
            options: ['$\\frac{1}{16}$', '$\\frac{15}{16}$', '$\\frac{1}{15}$'], correct: 0, cols: 1,
            explain: '$1-\\frac{15}{16}=\\frac{16}{16}-\\frac{15}{16}=\\frac{1}{16}$ .' },
          { kind: 'solution', ask: 0, lines: ['المزروع: $\\frac{6}{16}+\\frac{4}{16}+\\frac{5}{16}=\\frac{15}{16}$ .', 'غير المزروع: $\\frac{16}{16}-\\frac{15}{16}=\\frac{1}{16}$ من الأرض.'] },
        ],
      },
      {
        label: '3)', title: 'المزروع والأرض كلّها',
        question: 'هل الجزء المزروع كلّه أصغر من $1$ ؟',
        asks: ['الجواب'],
        steps: [
          { kind: 'choice', role: 'translate', requires: ['muqarana-bi-1'],
            prompt: 'في الكسر $\\frac{15}{16}$ ، البسط $15$ والمقام $16$ :',
            options: ['البسط أصغر من المقام', 'البسط أكبر من المقام', 'البسط يساوي المقام'], correct: 0, cols: 1,
            explain: '$15<16$ ، أي أنّ عدد الأجزاء المأخوذة أقلّ من عدد أجزاء الكلّ.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['muqarana-bi-1'],
            prompt: 'هل الجزء المزروع كلّه أصغر من $1$ ؟',
            options: ['نعم: $\\frac{15}{16}<1$', 'لا: $\\frac{15}{16}>1$', 'يساوي $1$'], correct: 0, cols: 1,
            explain: '$\\frac{15}{16}<\\frac{16}{16}=1$ ؛ ولهذا بقي جزء $\\frac{1}{16}$ دون زرع.' },
          { kind: 'solution', ask: 0, lines: ['البسط $15$ أصغر من المقام $16$ .', '$\\frac{15}{16}<\\frac{16}{16}=1$ : نعم، المزروع أصغر من الأرض كلّها.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
