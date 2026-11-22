/**
 * Les trois « مسائل » du درس « جمع وطرح كسرين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1
 * (`LESSON_CONFIG.lessonProblem`) : le nettoyage de la cour (1/4 et 2/5 : le nettoyé, le reste, le troisième groupe peut-il finir ?) ; la 2 le vélo de Zakaria (3/8, 2/5, 1/10 payés,
 * le reste — la remise en pourcentage de l'original est retirée : les pourcentages sont de l'unité 6) ; la 3 le temps de révision d'Anas (3/4 h et 5/6 h : la somme, en minutes, la différence).
 * Chaque nombre est vérifié dans ./problems.test.js en arithmétique EXACTE (BigInt). Aucune « fraction du reste » qui demande un produit (la synthèse).
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — تنظيف الساحة',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧹',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'الفوج الأول: 1/4 من الساحة', useful: true },
      { id: 'd2', text: 'الفوج الثاني: 2/5 من الساحة', useful: true },
      { id: 'd3', text: 'الفوج الثالث: يستطيع تنظيف 1/3 من الساحة', useful: true },
      { id: 'd4', text: 'يعمل الأفواج في حصّة التربية البيئية', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الجزء المنظّف',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الجزء المنظّف'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['tawhid-qabl-jam'],
            prompt: 'كيف نجد الجزء الذي نظّفه الفوجان معًا؟',
            options: ['نجمع الكسرين بعد كتابتهما بمقام مشترك', 'نجمع البسطين ونجمع المقامين', 'نطرح أحد الكسرين من الآخر'], correct: 0, cols: 1,
            explain: 'الفوجان نظّفا جزءين من الساحة فنجمع الجزأين، ولا نجمع إلا أجزاءً من النوع نفسه.' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'الجزء المنظّف:',
            options: ['$\\frac{13}{20}$', '$\\frac{3}{9}$', '$\\frac{3}{20}$'], correct: 0, cols: 3,
            explain: '$\\frac{1}{4}=\\frac{5}{20}$ و $\\frac{2}{5}=\\frac{8}{20}$ ، و $\\frac{5}{20}+\\frac{8}{20}=\\frac{13}{20}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$20$ أصغر مضاعف مشترك للمقامين $4$ و $5$ : $\\frac{1}{4}=\\frac{5}{20}$ و $\\frac{2}{5}=\\frac{8}{20}$ .',
            'الجزء المنظّف: $\\frac{5}{20}+\\frac{8}{20}=\\frac{13}{20}$ من الساحة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'الجزء الباقي',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الجزء الباقي'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'الجزء الباقي من الساحة:',
            options: ['$\\frac{7}{20}$', '$\\frac{13}{20}$', '$\\frac{3}{4}$'], correct: 0, cols: 3,
            explain: 'الساحة كلّها $1=\\frac{20}{20}$ ، و $\\frac{20}{20}-\\frac{13}{20}=\\frac{7}{20}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الساحة كلّها تساوي $1=\\frac{20}{20}$ .',
            'الجزء الباقي: $\\frac{20}{20}-\\frac{13}{20}=\\frac{7}{20}$ من الساحة.',
          ] },
        ],
      },
      {
        label: '3)', title: 'هل يكفي الفوج الثالث؟',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['هل يكفي الفوج الثالث؟'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'الفوج الثالث:',
            options: ['لا يكفي: يبقى $\\frac{1}{60}$ من الساحة', 'يكفي تمامًا', 'يكفي ويزيد'], correct: 0, cols: 1,
            explain: '$\\frac{1}{3}=\\frac{20}{60}$ و $\\frac{7}{20}=\\frac{21}{60}$ ، و $20<21$ ، فينقص $\\frac{1}{60}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'نقارن $\\frac{1}{3}$ بالجزء الباقي $\\frac{7}{20}$ : مضاعفات $20$ تصل إلى $60$ وهو يقبل القسمة على $3$ .',
            '$\\frac{1}{3}=\\frac{20}{60}$ و $\\frac{7}{20}=\\frac{21}{60}$ ، و $20<21$ : لا يكفي الفوج الثالث.',
            'يبقى $\\frac{21}{60}-\\frac{20}{60}=\\frac{1}{60}$ من الساحة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — درّاجة زكرياء',
    context: 'التضامن في العائلة',
    emoji: '🚲',
    tone: 'sky',
    source: src('deep-74', 35, 'أتعمّق', 74),
    illustration: { kind: 'tags', cards: [{ title: 'الجدّ', lines: [{ label: 'دفع', value: '3/8' }] }, { title: 'الأب', lines: [{ label: 'دفع', value: '2/5' }] }, { title: 'الأمّ', lines: [{ label: 'دفعت', value: '1/10' }] }], ariaLabel: 'ثلاث بطاقات من ثمن الدرّاجة: الجدّ دفع 3 على 8، الأب 2 على 5، الأمّ 1 على 10' },
    statement: 'دفع الجدّ $\\frac{3}{8}$ من ثمن الدرّاجة، ودفع الأب $\\frac{2}{5}$ ، ودفعت الأمّ $\\frac{1}{10}$ ، وأكمل زكرياء الباقي من مدّخراته.',
    data: [
      { id: 'a', text: 'الجدّ: 3/8 من الثمن', useful: true },
      { id: 'b', text: 'الأب: 2/5 من الثمن', useful: true },
      { id: 'c', text: 'الأمّ: 1/10 من الثمن', useful: true },
      { id: 'd', text: 'اشترى زكرياء الدرّاجة في العطلة', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الجدّ والأب',
        question: 'ما الجزء الذي دفعه الجدّ والأب معًا؟',
        asks: ['الجزء الذي دفعه الجدّ والأب'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'ما دفعه الجدّ والأب معًا من ثمن الدرّاجة:',
            options: ['$\\frac{31}{40}$', '$\\frac{5}{13}$', '$\\frac{5}{40}$'], correct: 0, cols: 3,
            explain: '$\\frac{3}{8}=\\frac{15}{40}$ و $\\frac{2}{5}=\\frac{16}{40}$ ، و $15+16=31$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$40$ أصغر مضاعف مشترك للمقامين $8$ و $5$ : $\\frac{3}{8}=\\frac{15}{40}$ و $\\frac{2}{5}=\\frac{16}{40}$ .',
            'دفعا معًا $\\frac{15}{40}+\\frac{16}{40}=\\frac{31}{40}$ من الثمن.',
          ] },
        ],
      },
      {
        label: '2)', title: 'العائلة كلّها',
        question: 'وما دفعته العائلة كلّها؟',
        asks: ['ما دفعته العائلة'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'ما دفعته العائلة كلّها، مكتوبًا على أبسط شكل:',
            options: ['$\\frac{7}{8}$', '$\\frac{6}{23}$', '$\\frac{9}{10}$'], correct: 0, cols: 3,
            explain: '$\\frac{31}{40}+\\frac{1}{10}=\\frac{31}{40}+\\frac{4}{40}=\\frac{35}{40}=\\frac{7}{8}$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{1}{10}=\\frac{4}{40}$ ، فنضيفه إلى ما دفعه الجدّ والأب: $\\frac{31}{40}+\\frac{4}{40}=\\frac{35}{40}$ .',
            'نختزل بالقسمة على $5$ : $\\frac{35}{40}=\\frac{7}{8}$ من الثمن.',
          ] },
        ],
      },
      {
        label: '3)', title: 'ما بقي على زكرياء',
        question: 'ما الجزء الذي دفعه زكرياء؟',
        asks: ['الجزء الذي دفعه زكرياء'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'الجزء الذي دفعه زكرياء من مدّخراته:',
            options: ['$\\frac{1}{8}$', '$\\frac{7}{8}$', '$\\frac{1}{10}$'], correct: 0, cols: 3,
            explain: 'الثمن كلّه $1=\\frac{8}{8}$ ، و $\\frac{8}{8}-\\frac{7}{8}=\\frac{1}{8}$ .' },
          { kind: 'solution', ask: 0, lines: [
            'الثمن كلّه يساوي $1=\\frac{8}{8}$ .',
            'دفع زكرياء $\\frac{8}{8}-\\frac{7}{8}=\\frac{1}{8}$ من ثمن الدرّاجة.',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — وقت المراجعة',
    context: 'توازن بين المراجعة والمطالعة',
    emoji: '📚',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'المراجعة', lines: [{ label: 'ساعة', value: '3/4' }] }, { title: 'المطالعة', lines: [{ label: 'ساعة', value: '5/6' }] }], ariaLabel: 'بطاقتان: أنس قضى 3 على 4 ساعة في المراجعة و 5 على 6 ساعة في المطالعة' },
    statement: 'قضى أنس $\\frac{3}{4}$ ساعة في المراجعة و $\\frac{5}{6}$ ساعة في المطالعة.',
    data: [
      { id: 'a', text: 'المراجعة: 3/4 ساعة', useful: true },
      { id: 'b', text: 'المطالعة: 5/6 ساعة', useful: true },
      { id: 'c', text: 'يفعل ذلك كلّ مساء بعد العشاء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المجموع بالساعات',
        question: 'كم ساعة قضى أنس في المجموع؟',
        asks: ['المجموع بالساعات'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'المجموع بالساعات:',
            options: ['$\\frac{19}{12}$ ساعة', '$\\frac{8}{10}$ ساعة', '$\\frac{8}{12}$ ساعة'], correct: 0, cols: 3,
            explain: '$\\frac{3}{4}=\\frac{9}{12}$ و $\\frac{5}{6}=\\frac{10}{12}$ ، و $9+10=19$ .' },
          { kind: 'solution', ask: 0, lines: [
            '$12$ أصغر مضاعف مشترك للمقامين $4$ و $6$ : $\\frac{3}{4}=\\frac{9}{12}$ و $\\frac{5}{6}=\\frac{10}{12}$ .',
            'المجموع: $\\frac{9}{12}+\\frac{10}{12}=\\frac{19}{12}$ ساعة.',
          ] },
        ],
      },
      {
        label: '2)', title: 'المجموع بالدقائق',
        question: 'كم دقيقة قضى؟',
        asks: ['عدد الدقائق'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['qaida-jam-tarh'], prompt: 'عدد الدقائق:', expected: 95,
            explain: 'الساعة $60$ دقيقة، و $\\frac{19}{12}$ ساعة $=19\\times5=95$ دقيقة (لأنّ $\\frac{1}{12}$ ساعة خمس دقائق).' },
          { kind: 'solution', ask: 0, lines: [
            '$\\frac{1}{12}$ ساعة تساوي $60\\div12=5$ دقائق.',
            '$\\frac{19}{12}$ ساعة تساوي $19\\times5=95$ دقيقة. (ساعة و $35$ دقيقة.)',
          ] },
        ],
      },
      {
        label: '3)', title: 'ما يزيد',
        question: 'بكم يزيد وقت المطالعة على وقت المراجعة؟',
        asks: ['الفرق بين المدّتين'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jam-tarh'],
            prompt: 'يزيد وقت المطالعة بـ:',
            options: ['$\\frac{1}{12}$ ساعة، أي $5$ دقائق', '$\\frac{2}{2}$ ساعة', '$\\frac{2}{12}$ ساعة'], correct: 0, cols: 1,
            explain: '$\\frac{10}{12}-\\frac{9}{12}=\\frac{1}{12}$ ساعة، أي خمس دقائق.' },
          { kind: 'solution', ask: 0, lines: [
            'بالمقام $12$ : $\\frac{5}{6}=\\frac{10}{12}$ و $\\frac{3}{4}=\\frac{9}{12}$ .',
            'الفرق: $\\frac{10}{12}-\\frac{9}{12}=\\frac{1}{12}$ ساعة، أي $5$ دقائق.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
