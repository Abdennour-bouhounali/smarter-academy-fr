/**
 * Les trois « مسائل » du درس « جمع وطرح كسرين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل الأول, résolus pas à pas (GuidedProblem). AJOUTS DE LA PLATEFORME
 * (`addition('exam_style_problem')`), contextes de la plateforme (la bibliothèque de la classe et la lecture, la cueillette des olives en famille, le réservoir de l'école et le soin de l'eau).
 * Périmètre : sommes et différences de deux fractions de même dénominateur ou dont un dénominateur est multiple de l'autre, le reste après une ou deux parts, un entier + une fraction ;
 * jamais de produit ni de dénominateurs sans rapport (3AM). La مسألة 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) ; chaque nombre est vérifié dans ./problems.test.js.
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — مكتبة القسم',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '📚',
    tone: 'amber',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'stories', text: 'القصص: 2/5 من الكتب', useful: true },
      { id: 'science', text: 'الكتب العلمية: 3/10 من الكتب', useful: true },
      { id: 'history', text: 'الباقي كتب تاريخ', useful: true },
      { id: 'hour', text: 'المكتبة تفتح كلّ يوم على الساعة 9', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'القصص والكتب العلمية معًا',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['المجموع'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['tawhid-mudaaf'], prompt: 'نكتب $\\frac{2}{5}=\\frac{\\ldots}{10}$ . البسط:', expected: 4,
            explain: '$10=5\\times 2$ ، فنضرب حدّي $\\frac{2}{5}$ في $2$ : $\\frac{2}{5}=\\frac{4}{10}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'القصص والكتب العلمية معًا تمثّل:',
            options: ['$\\frac{7}{10}$', '$\\frac{5}{15}$', '$\\frac{7}{5}$'], correct: 0, cols: 1,
            explain: '$\\frac{4}{10}+\\frac{3}{10}=\\frac{7}{10}$ : نجمع البسطين ونحافظ على المقام.' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{2}{5}=\\frac{4}{10}$ لأنّ $10=5\\times 2$ .',
            '$\\frac{4}{10}+\\frac{3}{10}=\\frac{7}{10}$ من الكتب.',
          ] },
        ],
      },
      {
        label: '2)', title: 'كتب التاريخ',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['كسر كتب التاريخ'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['al-baqi'],
            prompt: 'كتب التاريخ هي ما يبقى من المكتبة كلّها:',
            options: ['$\\frac{3}{10}$', '$\\frac{7}{10}$', '$\\frac{3}{7}$'], correct: 0, cols: 1,
            explain: '$1-\\frac{7}{10}=\\frac{10}{10}-\\frac{7}{10}=\\frac{3}{10}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الباقي هو الكلّ ناقص القصص والعلمية: $1-\\frac{7}{10}$ .',
            '$\\frac{10}{10}-\\frac{7}{10}=\\frac{3}{10}$ من الكتب.',
          ] },
        ],
      },
      {
        label: '3)', title: 'كتابة الكسرين بالمقام $20$',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['بسط $\\frac{7}{10}$', 'بسط $\\frac{3}{10}$'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['tawhid-mudaaf'], prompt: '$\\frac{7}{10}=\\frac{\\ldots}{20}$ . البسط:', expected: 14,
            explain: '$20=10\\times 2$ : $7\\times 2=14$ .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['tawhid-mudaaf'], prompt: '$\\frac{3}{10}=\\frac{\\ldots}{20}$ . البسط:', expected: 6,
            explain: '$20=10\\times 2$ : $3\\times 2=6$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{7}{10}=\\frac{14}{20}$ و $\\frac{3}{10}=\\frac{6}{20}$ .',
            'ونتأكّد: $\\frac{14}{20}+\\frac{6}{20}=\\frac{20}{20}=1$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — جني الزيتون',
    context: 'العمل مع العائلة',
    emoji: '🫒',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'اليوم الأوّل', icon: 'olive', lines: [{ label: 'جُني', value: '1/4', unit: 'البستان' }] }, { title: 'اليوم الثاني', icon: 'olive', lines: [{ label: 'جُني', value: '3/8', unit: 'البستان' }] }], ariaLabel: 'بطاقتان: ربع البستان في اليوم الأوّل وثلاثة أثمان في اليوم الثاني' },
    statement: 'جنت العائلة $\\frac{1}{4}$ من زيتون البستان في اليوم الأوّل و $\\frac{3}{8}$ منه في اليوم الثاني، وتعاون الجميع في العمل. بدأ الجني كلّ يوم مع الفجر.',
    data: [
      { id: 'd1', text: 'اليوم الأوّل: 1/4 من الزيتون', useful: true },
      { id: 'd2', text: 'اليوم الثاني: 3/8 من الزيتون', useful: true },
      { id: 'dawn', text: 'يبدأ الجني مع الفجر', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'ما جُني في اليومين',
        question: 'ما الجزء من الزيتون الذي جُني في اليومين؟',
        asks: ['المجموع'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['tawhid-mudaaf'], prompt: '$\\frac{1}{4}=\\frac{\\ldots}{8}$ . البسط:', expected: 2,
            explain: '$8=4\\times 2$ : $\\frac{1}{4}=\\frac{2}{8}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'ما جُني في اليومين:',
            options: ['$\\frac{5}{8}$', '$\\frac{4}{12}$', '$\\frac{4}{8}$'], correct: 0, cols: 1,
            explain: '$\\frac{2}{8}+\\frac{3}{8}=\\frac{5}{8}$ .' },
          { kind: 'solution', ask: 0, lines: ['$8=4\\times 2$ ، فنكتب $\\frac{1}{4}=\\frac{2}{8}$ .', '$\\frac{2}{8}+\\frac{3}{8}=\\frac{5}{8}$ من الزيتون.'] },
        ],
      },
      {
        label: '2)', title: 'ما بقي على الأشجار',
        question: 'ما الجزء من الزيتون الذي بقي على الأشجار؟',
        asks: ['الباقي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['al-baqi'],
            prompt: 'الباقي:',
            options: ['$\\frac{3}{8}$', '$\\frac{5}{8}$', '$\\frac{3}{5}$'], correct: 0, cols: 1,
            explain: '$1-\\frac{5}{8}=\\frac{8}{8}-\\frac{5}{8}=\\frac{3}{8}$ .' },
          { kind: 'solution', ask: 0, lines: ['الباقي هو الكلّ ناقص ما جُني: $1-\\frac{5}{8}$ .', '$\\frac{8}{8}-\\frac{5}{8}=\\frac{3}{8}$ من الزيتون.'] },
        ],
      },
      {
        label: '3)', title: 'هل جنوا أكثر من النصف؟',
        question: 'هل جنوا أكثر من نصف الزيتون؟',
        asks: ['الجواب'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'النصف هو $\\frac{4}{8}$ ، وما جُني $\\frac{5}{8}$ . هل جنوا أكثر من النصف؟',
            options: ['نعم', 'لا'], correct: 0, cols: 2,
            explain: 'للكسرين المقام نفسه، الأكبر هو صاحب البسط الأكبر: $5>4$ ، فجنوا أكثر من النصف.' },
          { kind: 'solution', ask: 0, lines: ['النصف هو $\\frac{1}{2}=\\frac{4}{8}$ .', 'للكسرين المقام نفسه، $\\frac{5}{8}$ له البسط الأكبر: جنوا أكثر من النصف.'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — خزّان المدرسة',
    context: 'الماء نعمة',
    emoji: '💧',
    tone: 'violet',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'الصباح', icon: 'bottle', lines: [{ label: 'استُهلك', value: '5/12', unit: 'الخزّان' }] }, { title: 'المساء', icon: 'bottle', lines: [{ label: 'استُهلك', value: '1/3', unit: 'الخزّان' }] }], ariaLabel: 'بطاقتان: استهلاك الصباح خمسة أجزاء من اثني عشر واستهلاك المساء ثلث' },
    statement: 'استُهلك صباحًا $\\frac{5}{12}$ من ماء خزّان المدرسة، ومساءً $\\frac{1}{3}$ منه، فالماء نعمة لا نُسرف فيها. ثم أُضيف ليلًا $\\frac{1}{12}$ من سعة الخزّان.',
    data: [
      { id: 'm', text: 'الصباح: 5/12 من الماء', useful: true },
      { id: 'e', text: 'المساء: 1/3 من الماء', useful: true },
      { id: 'n', text: 'الليل: يُضاف 1/12', useful: true },
      { id: 'cap', text: 'الخزّان في سطح المبنى', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المستهلك في النهار',
        question: 'ما الجزء من الماء الذي استُهلك في الصباح والمساء؟',
        asks: ['المجموع'],
        steps: [
          { kind: 'sort' },
          { kind: 'numeric', role: 'compute', requires: ['tawhid-mudaaf'], prompt: '$\\frac{1}{3}=\\frac{\\ldots}{12}$ . البسط:', expected: 4,
            explain: '$12=3\\times 4$ : $\\frac{1}{3}=\\frac{4}{12}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'المستهلك صباحًا ومساءً:',
            options: ['$\\frac{9}{12}=\\frac{3}{4}$', '$\\frac{6}{15}$', '$\\frac{9}{24}$'], correct: 0, cols: 1,
            explain: '$\\frac{5}{12}+\\frac{4}{12}=\\frac{9}{12}$ ، ونقسم الحدّين على $3$ : $\\frac{3}{4}$ .' },
          { kind: 'solution', ask: 0, lines: ['$12=3\\times 4$ ، فنكتب $\\frac{1}{3}=\\frac{4}{12}$ .', '$\\frac{5}{12}+\\frac{4}{12}=\\frac{9}{12}=\\frac{3}{4}$ من الماء.'] },
        ],
      },
      {
        label: '2)', title: 'الباقي مساءً',
        question: 'ما الجزء من الماء الذي بقي مساءً قبل التعبئة؟',
        asks: ['الباقي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['al-baqi'],
            prompt: 'الباقي مساءً:',
            options: ['$\\frac{1}{4}$', '$\\frac{3}{4}$', '$\\frac{1}{12}$'], correct: 0, cols: 1,
            explain: '$1-\\frac{3}{4}=\\frac{4}{4}-\\frac{3}{4}=\\frac{1}{4}$ ؛ وهو $\\frac{3}{12}$ بالمقام $12$ ، أي $\\frac{1}{4}$ بعد الاختزال.' },
          { kind: 'solution', ask: 0, lines: ['الباقي هو الكلّ ناقص المستهلك: $1-\\frac{3}{4}=\\frac{4}{4}-\\frac{3}{4}$ .', 'يبقى $\\frac{1}{4}$ من الماء، أي $\\frac{3}{12}$ .'] },
        ],
      },
      {
        label: '3)', title: 'في الصباح الموالي',
        question: 'ما الجزء من سعة الخزّان في الصباح الموالي، بعد إضافة ماء الليل؟',
        asks: ['الجزء الجديد'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['tawhid-mudaaf'], prompt: '$\\frac{1}{4}=\\frac{\\ldots}{12}$ . البسط:', expected: 3,
            explain: '$12=4\\times 3$ : $\\frac{1}{4}=\\frac{3}{12}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'الجزء الموجود في الصباح الموالي:',
            options: ['$\\frac{4}{12}=\\frac{1}{3}$', '$\\frac{2}{24}$', '$\\frac{3}{12}$'], correct: 0, cols: 1,
            explain: '$\\frac{3}{12}+\\frac{1}{12}=\\frac{4}{12}=\\frac{1}{3}$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{1}{4}=\\frac{3}{12}$ لأنّ $12=4\\times 3$ .', '$\\frac{3}{12}+\\frac{1}{12}=\\frac{4}{12}=\\frac{1}{3}$ من سعة الخزّان.'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
