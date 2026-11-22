/**
 * Les trois « مسائل » du درس « جداء كسرين » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل الأول, résolus pas à pas (GuidedProblem). AJOUTS DE LA PLATEFORME
 * (`addition('exam_style_problem')`), contextes de la plateforme (une coopérative d'oranges, une sortie en famille, les roses du jardin de l'école). Périmètre : un produit de deux fractions, un
 * entier × une fraction, « un kasr du reste », une aire de rectangle aux dimensions fractionnaires ; jamais de division par une fraction (3AM) ni de dénominateurs sans lien dans une somme.
 * La مسألة 1 est « مسألة الدرس » (`LESSON_CONFIG.lessonProblem`) ; chaque nombre est vérifié dans ./problems.test.js.
 */
import { addition, src } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — تعاونية البرتقال',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🍊',
    tone: 'amber',
    source: SOURCE,
    cites: [src('ex-28', 32, 'أوظّف تعلّماتي', 28)],
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'first', text: 'البيع الأوّل: 1/4 من الغلّة', useful: true },
      { id: 'second', text: 'البيع الثاني: 2/3 من الباقي', useful: true },
      { id: 'crop', text: 'الغلّة: 2400 kg', useful: true },
      { id: 'trucks', text: 'تُنقل الغلّة في شاحنات بيضاء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الباقي بعد البيع الأوّل',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['الباقي'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['kasr-min-baqi'],
            prompt: 'بعد بيع $\\frac{1}{4}$ من الغلّة يبقى:',
            options: ['$\\frac{3}{4}$', '$\\frac{1}{4}$', '$\\frac{4}{3}$'], correct: 0, cols: 1,
            explain: '$1-\\frac{1}{4}=\\frac{4}{4}-\\frac{1}{4}=\\frac{3}{4}$ من الغلّة.' },
          { kind: 'solution', ask: 0, lines: ['الباقي هو الكلّ ناقص ما بيع: $1-\\frac{1}{4}$ .', '$\\frac{4}{4}-\\frac{1}{4}=\\frac{3}{4}$ من الغلّة.'] },
        ],
      },
      {
        label: '2)', title: 'البيع الثاني كسرًا من الغلّة',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['الكسر'],
        steps: [
          { kind: 'numeric', role: 'compute', requires: ['juz-min-juz'], prompt: '$\\frac{2}{3}$ من $\\frac{3}{4}$ هو $\\frac{2\\times 3}{3\\times 4}=\\frac{\\ldots}{12}$ . البسط:', expected: 6,
            explain: 'نضرب البسطين: $2\\times 3=6$ ، والمقامين: $3\\times 4=12$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['juz-min-juz'],
            prompt: 'البيع الثاني يمثّل من الغلّة كلّها:',
            options: ['$\\frac{1}{2}$', '$\\frac{2}{3}$', '$\\frac{6}{7}$'], correct: 0, cols: 1,
            explain: '$\\frac{6}{12}=\\frac{1}{2}$ بقسمة الحدّين على $6$ . ($\\frac{2}{3}$ هو الكسر من الباقي لا من الغلّة.)' },
          { kind: 'solution', ask: 0, lines: ['«$\\frac{2}{3}$ من الباقي» ضرب: $\\frac{2}{3}\\times\\frac{3}{4}=\\frac{6}{12}$ .', 'نختزل: $\\frac{6}{12}=\\frac{1}{2}$ من الغلّة.'] },
        ],
      },
      {
        label: '3)', title: 'ما بيع في المرّتين',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['المجموع'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jida'],
            prompt: 'ما بيع كلّه من الغلّة:',
            options: ['$\\frac{3}{4}$', '$\\frac{2}{3}$', '$\\frac{1}{8}$'], correct: 0, cols: 1,
            explain: '$\\frac{1}{4}+\\frac{1}{2}=\\frac{1}{4}+\\frac{2}{4}=\\frac{3}{4}$ .' },
          { kind: 'solution', ask: 0, lines: ['$\\frac{1}{2}=\\frac{2}{4}$ لأنّ $4=2\\times 2$ .', '$\\frac{1}{4}+\\frac{2}{4}=\\frac{3}{4}$ من الغلّة.'] },
        ],
      },
      {
        label: '4)', title: 'ما بقي بالكيلوغرام',
        question: LESSON_CONFIG.lessonProblem.questions[3].text,
        asks: ['الكتلة'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kasr-min-adad'], prompt: 'الباقي $\\frac{1}{4}$ من $2400$ kg . عدد الكيلوغرامات:', expected: 600, suffix: 'kg',
            explain: '$1-\\frac{3}{4}=\\frac{1}{4}$ ، و $\\frac{1}{4}\\times 2400=\\frac{2400}{4}=600$ .' },
          { kind: 'solution', ask: 0, lines: ['الباقي: $1-\\frac{3}{4}=\\frac{1}{4}$ من الغلّة.', '$\\frac{1}{4}\\times 2400=600$ kg .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — رحلة العائلة',
    context: 'التخطيط للرحلة',
    emoji: '🚗',
    tone: 'sky',
    source: SOURCE,
    cites: [src('ex-34', 32, 'أوظّف تعلّماتي', 34)],
    illustration: { kind: 'tags', cards: [{ title: 'المرحلة الأولى', icon: 'car', lines: [{ label: 'استُهلك', value: '1/3', unit: 'الخزّان' }] }, { title: 'المرحلة الثانية', icon: 'car', lines: [{ label: 'استُهلك', value: '1/2', unit: 'الباقي' }] }], ariaLabel: 'بطاقتان: ثلث الخزّان في المرحلة الأولى ونصف الباقي في الثانية' },
    statement: 'تخطّط عائلة لرحلة إلى الجنوب فتحسب بنزينها بعناية. استهلكت السيارة $\\frac{1}{3}$ من بنزين الخزّان في المرحلة الأولى، ثم نصف ما بقي في المرحلة الثانية. سعة الخزّان $45$ L.',
    data: [
      { id: 'a', text: 'المرحلة الأولى: 1/3 من الخزّان', useful: true },
      { id: 'b', text: 'المرحلة الثانية: 1/2 من الباقي', useful: true },
      { id: 'c', text: 'سعة الخزّان: 45 L', useful: true },
      { id: 'd', text: 'تنطلق العائلة صباحًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'المرحلة الثانية كسرًا من الخزّان',
        question: 'ما الكسر الذي يمثّله استهلاك المرحلة الثانية من الخزّان كلّه؟',
        asks: ['الكسر'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['kasr-min-baqi'],
            prompt: 'بعد المرحلة الأولى يبقى في الخزّان:',
            options: ['$\\frac{2}{3}$', '$\\frac{1}{3}$', '$\\frac{3}{2}$'], correct: 0, cols: 1,
            explain: '$1-\\frac{1}{3}=\\frac{3}{3}-\\frac{1}{3}=\\frac{2}{3}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['juz-min-juz'],
            prompt: 'نصف الباقي يمثّل من الخزّان كلّه:',
            options: ['$\\frac{1}{3}$', '$\\frac{1}{2}$', '$\\frac{1}{6}$'], correct: 0, cols: 1,
            explain: '$\\frac{1}{2}\\times\\frac{2}{3}=\\frac{2}{6}=\\frac{1}{3}$ . ($\\frac{1}{2}$ هو الكسر من الباقي لا من الخزّان.)' },
          { kind: 'solution', ask: 0, lines: ['الباقي: $1-\\frac{1}{3}=\\frac{2}{3}$ .', 'نصف الباقي: $\\frac{1}{2}\\times\\frac{2}{3}=\\frac{2}{6}=\\frac{1}{3}$ من الخزّان.'] },
        ],
      },
      {
        label: '2)', title: 'ما استُهلك كلّه',
        question: 'ما الجزء من الخزّان الذي استُهلك في المرحلتين؟',
        asks: ['المجموع'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jida'],
            prompt: 'المستهلك في المرحلتين:',
            options: ['$\\frac{2}{3}$', '$\\frac{2}{6}$', '$\\frac{1}{9}$'], correct: 0, cols: 1,
            explain: '$\\frac{1}{3}+\\frac{1}{3}=\\frac{2}{3}$ : المقام نفسه، نجمع البسطين.' },
          { kind: 'solution', ask: 0, lines: ['المرحلتان من الخزّان نفسه والمقام نفسه: نجمع البسطين.', '$\\frac{1}{3}+\\frac{1}{3}=\\frac{2}{3}$ من الخزّان.'] },
        ],
      },
      {
        label: '3)', title: 'ما بقي باللتر',
        question: 'كم لترًا بقي في الخزّان؟',
        asks: ['الباقي'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kasr-min-adad'], prompt: 'الباقي $1-\\frac{2}{3}=\\frac{1}{3}$ من $45$ L . عدد اللترات:', expected: 15, suffix: 'L',
            explain: '$\\frac{1}{3}\\times 45=\\frac{45}{3}=15$ L .' },
          { kind: 'solution', ask: 0, lines: ['الباقي $\\frac{1}{3}$ من الخزّان.', '$\\frac{1}{3}\\times 45=15$ L .'] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — ورود الحديقة',
    context: 'جمال مدرستنا',
    emoji: '🌹',
    tone: 'violet',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'الحديقة', icon: 'plant', lines: [{ label: 'البعدان', value: '18 × 12', unit: 'm' }] }, { title: 'الورود', icon: 'leaf', lines: [{ label: 'الطول', value: '2/3', unit: 'طول الحديقة' }, { label: 'العرض', value: '3/4', unit: 'عرضها' }] }], ariaLabel: 'بطاقتان: حديقة ثمانية عشر في اثني عشر مترًا، وورود في مستطيل طوله ثلثا طولها وعرضه ثلاثة أرباع عرضها' },
    statement: 'تهتمّ مجموعة من التلاميذ بحديقة المدرسة لتزيدها جمالًا. الحديقة مستطيلة بُعداها $18$ m و $12$ m ، وقد زُرعت الورود في مستطيل طوله $\\frac{2}{3}$ من طول الحديقة وعرضه $\\frac{3}{4}$ من عرضها.',
    data: [
      { id: 'g', text: 'الحديقة: 18 m × 12 m', useful: true },
      { id: 'l', text: 'طول مستطيل الورود: 2/3 من الطول', useful: true },
      { id: 'w', text: 'عرضه: 3/4 من العرض', useful: true },
      { id: 'r', text: 'الورود حمراء وصفراء', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'الجزء الذي تمثّله الورود من الحديقة',
        question: 'ما الكسر الذي تمثّله مساحة الورود من مساحة الحديقة؟',
        asks: ['الكسر'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qaida-jida'],
            prompt: 'مساحة الورود من مساحة الحديقة:',
            options: ['$\\frac{1}{2}$', '$\\frac{17}{12}$', '$\\frac{5}{7}$'], correct: 0, cols: 1,
            explain: '$\\frac{2}{3}\\times\\frac{3}{4}=\\frac{6}{12}=\\frac{1}{2}$ . ($\\frac{17}{12}$ هو مجموع الكسرين لا جداؤهما.)' },
          { kind: 'solution', ask: 0, lines: ['الجزء من الجزء ضرب: $\\frac{2}{3}\\times\\frac{3}{4}=\\frac{2\\times 3}{3\\times 4}=\\frac{6}{12}$ .', 'نختزل: $\\frac{1}{2}$ من مساحة الحديقة.'] },
        ],
      },
      {
        label: '2)', title: 'مساحة الورود بطريقتين',
        question: 'احسب مساحة مستطيل الورود بطريقتين مختلفتين.',
        asks: ['الطريقة الأولى', 'الطريقة الثانية'],
        steps: [
          { kind: 'numeric', role: 'answer', ask: 0, requires: ['kasr-min-adad'], prompt: 'الطريقة الأولى: مساحة الحديقة $18\\times 12=216$ m² ، ونصفها:', expected: 108, suffix: 'm²',
            explain: '$\\frac{1}{2}\\times 216=108$ m² .' },
          { kind: 'numeric', role: 'compute', requires: ['kasr-min-adad'], prompt: 'الطريقة الثانية: طول الورود $\\frac{2}{3}\\times 18$ m :', expected: 12, suffix: 'm',
            explain: '$\\frac{2\\times 18}{3}=\\frac{36}{3}=12$ m .' },
          { kind: 'numeric', role: 'compute', requires: ['kasr-min-adad'], prompt: 'وعرضها $\\frac{3}{4}\\times 12$ m :', expected: 9, suffix: 'm',
            explain: '$\\frac{3\\times 12}{4}=\\frac{36}{4}=9$ m .' },
          { kind: 'numeric', role: 'answer', ask: 1, requires: ['kasr-min-adad'], prompt: 'مساحة الورود $12\\times 9=$', expected: 108, suffix: 'm²',
            explain: '$12\\times 9=108$ m² ، وهي النتيجة نفسها بالطريقتين.' },
          { kind: 'solution', ask: 0, lines: ['الطريقة الأولى: $\\frac{1}{2}\\times 216=108$ m² .', 'الطريقة الثانية: الطول $12$ m والعرض $9$ m ، فالمساحة $12\\times 9=108$ m² .'] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
