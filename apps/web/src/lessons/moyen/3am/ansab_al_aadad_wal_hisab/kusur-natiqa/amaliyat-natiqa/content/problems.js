/**
 * Les trois « مسائل » du درس « العمليات على الأعداد الناطقة » (modules 5, 6, 7) — exercices COMPLETS de type اختبار الفصل, résolus pas à pas (GuidedProblem). La مسألة 1 (`LESSON_CONFIG.lessonProblem`) :
 * un programme de calcul de la compétition de classe (× −2/3 puis + 5/6 ; avec 3/4 on obtient 1/3, avec −5/4 on obtient 5/3, le nombre qui donne 0 est 5/4 — un terme manquant trouvé par UNE
 * opération inverse), redessin de deep-79 ; la 2 les valeurs de trois expressions à x = −2/3, y = 3/4, z = −1/6 (1, −1/2, −1/3), un CALCUL (la logique de la substitution est de `qimat-ibara-harfiya`),
 * redessin de deep-76 ; la 3 « montrer qu'un nombre est un entier » (D = −2 relatif, E = 4 naturel, D × E = −8), modelée sur le corpus `3am-s1-109` ex 2, avec en plus une VÉRIFICATION À LA
 * CALCULATRICE (le plan : la page 37 du livre, « أوظّف تكنولوجيات الإعلام والاتصال », manque au scan ; la leçon génère sa propre activité, déclarée AJOUT de la plateforme). Chaque nombre est vérifié
 * dans ./problems.test.js en arithmétique EXACTE (BigInt).
 */
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [
  {
    id: 'masala-1',
    title: 'مسألة 1 — برنامج حساب',
    context: LESSON_CONFIG.lessonProblem.title,
    headline: 'مسألة الدرس',
    emoji: '🧮',
    tone: 'indigo',
    source: SOURCE,
    illustration: LESSON_CONFIG.lessonProblem.illustration,
    statement: LESSON_CONFIG.lessonProblem.statement,
    data: [
      { id: 'd1', text: 'نضرب العدد المختار في −2/3', useful: true },
      { id: 'd2', text: 'ثمّ نضيف 5/6 إلى النتيجة', useful: true },
      { id: 'd3', text: 'العدد الأوّل المختار 3/4، والثاني −5/4', useful: true },
      { id: 'd4', text: 'يشارك في المسابقة فريقان', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'النتيجة عند 3/4',
        question: LESSON_CONFIG.lessonProblem.questions[0].text,
        asks: ['نتيجة البرنامج عند $\\frac{3}{4}$'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'translate', requires: ['jida-natiqa'],
            prompt: 'كيف نكتب البرنامج بعبارة حسابية عند اختيار العدد $n$ ؟',
            options: ['$n\\times\\left(-\\frac{2}{3}\\right)+\\frac{5}{6}$', '$n\\times\\left(-\\frac{2}{3}+\\frac{5}{6}\\right)$', '$\\left(n+\\frac{5}{6}\\right)\\times\\left(-\\frac{2}{3}\\right)$'], correct: 0, cols: 1,
            explain: 'نضرب أوّلًا ثمّ نضيف: الجداء $n\\times\\left(-\\frac{2}{3}\\right)$ ثمّ المجموع مع $\\frac{5}{6}$ .' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-natiqa'],
            prompt: 'النتيجة عند اختيار $\\frac{3}{4}$ :',
            options: ['$\\frac{1}{3}$', '$\\frac{4}{3}$', '$-\\frac{1}{3}$'], correct: 0, cols: 3,
            explain: '$\\frac{3}{4}\\times\\left(-\\frac{2}{3}\\right)=-\\frac{1}{2}$ ثمّ $-\\frac{1}{2}+\\frac{5}{6}=-\\frac{3}{6}+\\frac{5}{6}=\\frac{1}{3}$ . ($\\frac{4}{3}$ أسقط إشارة الجداء.)' },
          { kind: 'solution', ask: 0, lines: [
            'الجداء: عدد موجب في عدد سالب فالناتج سالب: $\\frac{3}{4}\\times\\left(-\\frac{2}{3}\\right)=-\\frac{6}{12}=-\\frac{1}{2}$ .',
            'المجموع: $-\\frac{1}{2}+\\frac{5}{6}=-\\frac{3}{6}+\\frac{5}{6}=\\frac{2}{6}=\\frac{1}{3}$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'النتيجة عند −5/4',
        question: LESSON_CONFIG.lessonProblem.questions[1].text,
        asks: ['نتيجة البرنامج عند $-\\frac{5}{4}$'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jida-natiqa'],
            prompt: 'النتيجة عند اختيار $-\\frac{5}{4}$ :',
            options: ['$\\frac{5}{3}$', '$0$', '$\\frac{5}{6}$'], correct: 0, cols: 3,
            explain: 'عاملان سالبان: $-\\frac{5}{4}\\times\\left(-\\frac{2}{3}\\right)=\\frac{10}{12}=\\frac{5}{6}$ ثمّ $\\frac{5}{6}+\\frac{5}{6}=\\frac{10}{6}=\\frac{5}{3}$ . ($0$ أخطأ في إشارة الجداء.)' },
          { kind: 'solution', ask: 0, lines: [
            'الجداء: عددان سالبان فالناتج موجب: $-\\frac{5}{4}\\times\\left(-\\frac{2}{3}\\right)=\\frac{10}{12}=\\frac{5}{6}$ .',
            'المجموع: $\\frac{5}{6}+\\frac{5}{6}=\\frac{10}{6}=\\frac{5}{3}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'العدد الذي يعطي 0',
        question: LESSON_CONFIG.lessonProblem.questions[2].text,
        asks: ['العدد المختار'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qisma-natiqa'],
            prompt: 'العدد الذي يجعل النتيجة $0$ :',
            options: ['$\\frac{5}{4}$', '$-\\frac{5}{4}$', '$\\frac{4}{5}$'], correct: 0, cols: 3,
            explain: 'يجب أن يكون $n\\times\\left(-\\frac{2}{3}\\right)=-\\frac{5}{6}$ ، فـ $n=-\\frac{5}{6}\\div\\left(-\\frac{2}{3}\\right)=\\frac{5}{4}$ . ($-\\frac{5}{4}$ أعطى $\\frac{5}{3}$ في السؤال السابق.)' },
          { kind: 'solution', ask: 0, lines: [
            'النتيجة $0$ تعني $n\\times\\left(-\\frac{2}{3}\\right)+\\frac{5}{6}=0$ ، أي $n\\times\\left(-\\frac{2}{3}\\right)=-\\frac{5}{6}$ .',
            'عملية عكسية واحدة: $n=-\\frac{5}{6}\\div\\left(-\\frac{2}{3}\\right)=\\frac{5}{6}\\times\\frac{3}{2}=\\frac{15}{12}=\\frac{5}{4}$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-2',
    title: 'مسألة 2 — قيم العبارات',
    context: 'مسابقة الرياضيات',
    emoji: '🏆',
    tone: 'sky',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'القيم', lines: [{ label: 'x', value: '-2/3' }, { label: 'y', value: '3/4' }, { label: 'z', value: '-1/6' }] }], ariaLabel: 'بطاقة القيم: x يساوي سالب ثلثين، y يساوي ثلاثة أرباع، z يساوي سالب سدس' },
    statement: 'في مسابقة الرياضيات أُعطيت الأعداد $x=-\\frac{2}{3}$ و $y=\\frac{3}{4}$ و $z=-\\frac{1}{6}$ ، وطُلب حساب $A=x+2y-z$ و $B=(x+y)\\div z$ و $C=x\\times y-z$ .',
    data: [
      { id: 'a', text: 'x = −2/3', useful: true },
      { id: 'b', text: 'y = 3/4', useful: true },
      { id: 'c', text: 'z = −1/6', useful: true },
      { id: 'd', text: 'عدد المشاركين 24 تلميذًا', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'حساب A',
        question: 'احسب $A=x+2y-z$ واكتب الناتج على أبسط شكل.',
        asks: ['A'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jam-natiqa'],
            prompt: 'قيمة $A$ :',
            options: ['$1$', '$\\frac{2}{3}$', '$\\frac{1}{4}$'], correct: 0, cols: 3,
            explain: '$A=-\\frac{2}{3}+\\frac{3}{2}-\\left(-\\frac{1}{6}\\right)=-\\frac{4}{6}+\\frac{9}{6}+\\frac{1}{6}=1$ . ($\\frac{1}{4}$ نسي أنّ $2y=\\frac{3}{2}$ .)' },
          { kind: 'solution', ask: 0, lines: [
            '$2y=2\\times\\frac{3}{4}=\\frac{3}{2}$ ، وطرح $z=-\\frac{1}{6}$ هو إضافة $\\frac{1}{6}$ .',
            '$A=-\\frac{4}{6}+\\frac{9}{6}+\\frac{1}{6}=\\frac{6}{6}=1$ .',
          ] },
        ],
      },
      {
        label: '2)', title: 'حساب B',
        question: 'احسب $B=(x+y)\\div z$ واكتب الناتج على أبسط شكل.',
        asks: ['B'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qisma-natiqa'],
            prompt: 'قيمة $B$ :',
            options: ['$-\\frac{1}{2}$', '$\\frac{1}{2}$', '$-\\frac{1}{72}$'], correct: 0, cols: 3,
            explain: '$x+y=\\frac{1}{12}$ ثمّ $\\frac{1}{12}\\div\\left(-\\frac{1}{6}\\right)=\\frac{1}{12}\\times(-6)=-\\frac{1}{2}$ . ($-\\frac{1}{72}$ ضرب دون قلب القاسم.)' },
          { kind: 'solution', ask: 0, lines: [
            'ما بين القوسين أوّلًا: $x+y=-\\frac{8}{12}+\\frac{9}{12}=\\frac{1}{12}$ .',
            'نقسم على $z=-\\frac{1}{6}$ بالضرب في مقلوبه $-6$ : $\\frac{1}{12}\\times(-6)=-\\frac{6}{12}=-\\frac{1}{2}$ .',
          ] },
        ],
      },
      {
        label: '3)', title: 'حساب C',
        question: 'احسب $C=x\\times y-z$ واكتب الناتج على أبسط شكل.',
        asks: ['C'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['awlawiya'],
            prompt: 'قيمة $C$ :',
            options: ['$-\\frac{1}{3}$', '$-\\frac{2}{3}$', '$\\frac{1}{3}$'], correct: 0, cols: 3,
            explain: 'الجداء أوّلًا: $x\\times y=-\\frac{1}{2}$ ثمّ $-\\frac{1}{2}-\\left(-\\frac{1}{6}\\right)=-\\frac{3}{6}+\\frac{1}{6}=-\\frac{1}{3}$ . ($-\\frac{2}{3}$ جمع المسافتين.)' },
          { kind: 'solution', ask: 0, lines: [
            '$x\\times y=-\\frac{2}{3}\\times\\frac{3}{4}=-\\frac{6}{12}=-\\frac{1}{2}$ (الضرب قبل الطرح).',
            '$C=-\\frac{1}{2}-\\left(-\\frac{1}{6}\\right)=-\\frac{3}{6}+\\frac{1}{6}=-\\frac{2}{6}=-\\frac{1}{3}$ .',
          ] },
        ],
      },
    ],
  },
  {
    id: 'masala-3',
    title: 'مسألة 3 — عدد صحيح؟',
    context: 'أبيّن بالحساب',
    emoji: '🧾',
    tone: 'emerald',
    source: SOURCE,
    illustration: { kind: 'tags', cards: [{ title: 'العدد D', lines: [{ label: 'D', value: '(5/6 - 3/4) ÷ (-1/24)' }] }, { title: 'العدد E', lines: [{ label: 'E', value: '(-7/10 + 1/5) × (-8)' }] }], ariaLabel: 'بطاقتان: العدد D يساوي (خمسة أسداس ناقص ثلاثة أرباع) مقسومًا على سالب جزء من أربعة وعشرين، والعدد E يساوي (سالب سبعة أعشار زائد خمس) مضروبًا في سالب ثمانية' },
    statement: 'نعتبر العددين $D=\\left(\\frac{5}{6}-\\frac{3}{4}\\right)\\div\\left(-\\frac{1}{24}\\right)$ و $E=\\left(-\\frac{7}{10}+\\frac{1}{5}\\right)\\times(-8)$ .',
    data: [
      { id: 'a', text: 'D = (5/6 − 3/4) ÷ (−1/24)', useful: true },
      { id: 'b', text: 'E = (−7/10 + 1/5) × (−8)', useful: true },
      { id: 'c', text: 'العددان على بطاقتين صفراوين', useful: false },
    ],
    parts: [
      {
        label: '1)', title: 'D عدد صحيح نسبي',
        question: 'بيّن أنّ $D$ عدد صحيح نسبي.',
        asks: ['D'],
        steps: [
          { kind: 'sort' },
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['qisma-natiqa'],
            prompt: 'قيمة $D$ :',
            options: ['$-2$', '$2$', '$-\\frac{1}{2}$'], correct: 0, cols: 3,
            explain: 'ما بين القوسين: $\\frac{10}{12}-\\frac{9}{12}=\\frac{1}{12}$ ثمّ $\\frac{1}{12}\\times(-24)=-2$ . ($-\\frac{1}{2}$ قلب المقسوم لا القاسم.)' },
          { kind: 'solution', ask: 0, lines: [
            'ما بين القوسين أوّلًا: $\\frac{5}{6}-\\frac{3}{4}=\\frac{10}{12}-\\frac{9}{12}=\\frac{1}{12}$ .',
            'نقسم على $-\\frac{1}{24}$ بالضرب في مقلوبه $-24$ : $D=\\frac{1}{12}\\times(-24)=-2$ ، وهو عدد صحيح نسبي (وليس طبيعيًّا).',
          ] },
        ],
      },
      {
        label: '2)', title: 'E عدد طبيعي',
        question: 'بيّن أنّ $E$ عدد طبيعي.',
        asks: ['E'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jida-natiqa'],
            prompt: 'قيمة $E$ :',
            options: ['$4$', '$-4$', '$\\frac{36}{5}$'], correct: 0, cols: 3,
            explain: '$-\\frac{7}{10}+\\frac{2}{10}=-\\frac{5}{10}=-\\frac{1}{2}$ ثمّ $-\\frac{1}{2}\\times(-8)=4$ . ($\\frac{36}{5}$ جمع المسافتين في القوس.)' },
          { kind: 'solution', ask: 0, lines: [
            'ما بين القوسين: $-\\frac{7}{10}+\\frac{1}{5}=-\\frac{7}{10}+\\frac{2}{10}=-\\frac{5}{10}=-\\frac{1}{2}$ .',
            '$E=-\\frac{1}{2}\\times(-8)=4$ ، وهو عدد طبيعي.',
          ] },
        ],
      },
      {
        label: '3)', title: 'الجداء D × E',
        question: 'احسب $D\\times E$ .',
        asks: ['الجداء'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['jida-natiqa'],
            prompt: 'قيمة $D\\times E$ :',
            options: ['$-8$', '$8$', '$2$'], correct: 0, cols: 3,
            explain: '$(-2)\\times4=-8$ : عاملان مختلفا الإشارة. ($2$ جمع العددين بدل ضربهما.)' },
          { kind: 'solution', ask: 0, lines: [
            '$D\\times E=(-2)\\times4$ : الإشارتان مختلفتان فالناتج سالب.',
            '$D\\times E=-8$ .',
          ] },
        ],
      },
      {
        label: '4)', title: 'التحقّق بالحاسبة',
        question: 'نتحقّق من $D$ بالحاسبة: أيّ ترتيب للمفاتيح يعطي $D$ ؟ وماذا نفهم من النتيجة العشرية لـ $\\frac{5}{6}-\\frac{3}{4}$ ؟',
        asks: ['ترتيب المفاتيح', 'معنى النتيجة العشرية'],
        steps: [
          { kind: 'choice', role: 'conclude', ask: 0, requires: ['awlawiya'],
            prompt: 'أيّ ترتيب لمفاتيح الحاسبة يعطي $D$ ؟',
            options: ['$(5\\div6-3\\div4)\\div(-1\\div24)$', '$5\\div6-3\\div4\\div(-1)\\div24$', '$(5\\div6-3\\div4)\\div-1\\div24$'], correct: 0, cols: 1,
            explain: 'الأقواس تجعل الحاسبة تحسب الفرق قبل القسمة. بدونها تُنجز القسمة قبل الطرح، فتحسب عبارة أخرى.' },
          { kind: 'choice', role: 'conclude', ask: 1, requires: ['tariqa-amaliyat'],
            prompt: 'أظهرت الحاسبة $0{,}0833333333$ للفرق $\\frac{5}{6}-\\frac{3}{4}$ . ماذا يعني ذلك؟',
            options: ['قيمة مقرّبة للعدد الناطق $\\frac{1}{12}$ ، ونكتب نتيجتنا الدقيقة بالكسر', 'أنّ الفرق يساوي $0{,}0833333333$ تمامًا', 'أنّ العدد ليس ناطقًا'], correct: 0, cols: 1,
            explain: '$\\frac{1}{12}$ ليس عشريًّا فتعطي الحاسبة قيمة مقرّبة فقط؛ الحساب بالكسور يعطي النتيجة الدقيقة $\\frac{1}{12}$ .' },
          { kind: 'solution', ask: 1, lines: [
            'الفرق $\\frac{10}{12}-\\frac{9}{12}=\\frac{1}{12}$ عدد ناطق غير عشري: الحاسبة تعرض قيمته المقرّبة $0{,}0833\\ldots$ .',
            'لذلك نعتمد في الجواب الكسر $\\frac{1}{12}$ ، ونستعمل الحاسبة للتحقّق فقط.',
          ] },
        ],
      },
    ],
  },
];

export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
