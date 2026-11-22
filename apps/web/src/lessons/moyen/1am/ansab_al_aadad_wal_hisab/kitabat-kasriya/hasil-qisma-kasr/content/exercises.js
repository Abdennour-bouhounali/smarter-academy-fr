/**
 * Les exercices du MANUEL rattachés au درس « حاصل القسمة والكسر » (couverture : extraction.json → destinations : act-1 (en
 * application), ex-1 … ex-5 p. 57, أقوّم 1 et 9 p. 59 en أتمرّن ; أقوّم 2 et 3 au إختبار أولي ; deep-2 est la مسألة 2). Chaque exercice
 * garde son énoncé et déclare l'interaction qui le rend ; toutes les clés sont recalculées en fractions EXACTES dans ./content.test.js.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '1am_hasil-qisma-kasr_P1',
  P2: '1am_hasil-qisma-kasr_P2',
  P3: '1am_hasil-qisma-kasr_P3',
};

const T = (s) => `$${s}$`;
const fr = (n, d) => T(`\\frac{${n}}{${d}}`);
/** Place la bonne réponse à une position différente d'une ligne à l'autre (rotation déterministe ; le kit ne mélange pas). */
const vary = (rows) => rows.map((r, i) => {
  const n = r.options.length; const k = i % n;
  return { ...r, options: [...r.options.slice(n - k), ...r.options.slice(0, n - k)], correct: (r.correct + k) % n };
});

export const EXERCISES = [
  {
    id: 'act-1', source: src('act-1', 53, 'اكتشف', 1), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'أرادت فاطمة وزميلتها مريم تقسيم خمسة أرغفة متماثلة على ستة أشخاص بالتساوي. قسمت مريم 5 على 6 بالقسمة العشرية، وقسّمت فاطمة كلّ رغيف إلى ستّ حصص متساوية.',
    interaction: 'batch',
    question: {
      prompt: 'أجب عن أسئلة النشاط:',
      rows: vary([
        { label: '① حاصل القسمة العشرية $5\\div 6$', options: ['$0{,}8333\\ldots$ لا تنتهي، فلا تعطي حصّة مضبوطة', '$0{,}83$ بالضبط', '$5{,}6$'], correct: 0, correction: '$6\\times 0{,}83=4{,}98$ وليس 5: القسمة العشرية لا تنتهي.' },
        { label: '② بعد قطع كل رغيف إلى 6 قطع', options: ['يأخذ كل شخص قطعة من كل رغيف: 5 قطع', 'يأخذ كل شخص رغيفا كاملا', 'يأخذ كل شخص 6 قطع'], correct: 0, correction: 'خمسة أرغفة، ومن كل رغيف قطعة لكل شخص: 5 قطع لكل واحد، وكل قطعة سدس رغيف.' },
        { label: '③ الكسر الذي يمثّل نصيب كل شخص', options: [fr(5, 6), fr(6, 5), '$5{,}6$'], correct: 0, correction: '5 قطع من 6 في الرغيف: $\\frac{5}{6}$.' },
        { label: '④ ست حصص من $\\frac{5}{6}$: $6\\times\\frac{5}{6}=\\ldots$', options: ['5', '30', fr(5, 36)], correct: 0, correction: 'ستة أشخاص يأخذون الأرغفة الخمسة كلها: $6\\times\\frac{5}{6}=5$.' },
      ]),
      explain: 'لأنّ $6\\times\\frac{5}{6}=5$ ، فالكسر $\\frac{5}{6}$ هو العدد الذي إذا ضُرب في 6 أعطى 5، أي $5\\div 6=\\frac{5}{6}$.',
    },
    commonError: 'قراءة حاصل القسمة العشرية 0,83 على أنّه قيمة مضبوطة.',
  },
  {
    id: 'ex-1', source: src('ex-1', 57, 'أتمرّن', 1), learningPointId: LP.P1, difficulty: 'facile', figures: 'ex-1',
    statement: 'في كل حالة، عبّر بكسر عن السطح الملوّن بالأزرق.',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: 'الشكل ①', options: [fr(1, 2), fr(1, 4), fr(3, 8)], correct: 0, correction: 'الشكل أربعة وعشرون جزءا في المساحة: $6+3+3=12$ منها ملوّنة، أي $\\frac{12}{24}=\\frac{1}{2}$.' },
        { label: 'الشكل ②', options: [fr(5, 12), fr(5, 6), fr(5, 7)], correct: 0, correction: 'خمسة أنصاف خانات من اثني عشر نصفا: $\\frac{5}{12}$.' },
        { label: 'الشكل ③', options: [fr(7, 12), fr(7, 5), fr(5, 12)], correct: 0, correction: 'سبع خانات من اثنتي عشرة: $\\frac{7}{12}$.' },
      ]),
      explain: 'البسط عدد الأجزاء الملوّنة، والمقام عدد الأجزاء المتقايسة كلها.',
    },
    commonError: 'عدّ الأجزاء الملوّنة وغير الملوّنة وكتابة الكسر بينهما ($\\frac{7}{5}$).',
  },
  {
    id: 'ex-2', source: src('ex-2', 57, 'أتمرّن', 2), learningPointId: LP.P1, difficulty: 'moyen', figures: 'ex-2',
    statement: 'في كل حالة من الحالات الآتية، هل الجزء الملوّن يمثّل $\\frac{3}{4}$ من سطح الشكل؟',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'الشكل ①: 3 خانات ملوّنة من شريط', answer: false, why: 'الشريط من 7 خانات متقايسة: الجزء الملوّن $\\frac{3}{7}$.' },
        { text: 'الشكل ②: 12 خانة ملوّنة من مربع', answer: true, why: 'الخانات الست عشرة متقايسة: $\\frac{12}{16}=\\frac{3}{4}$.' },
        { text: 'الشكل ③: ثلاثة أجزاء ملوّنة من أربعة أجزاء', answer: false, why: 'الأجزاء الأربعة ليست متقايسة: لا نكتب $\\frac{3}{4}$ (مساحة الجزء الملوّن نصف الشكل).' },
      ],
      explain: 'لا نعبّر بكسر إلّا عن أجزاء متقايسة.',
    },
    commonError: 'عدّ الأجزاء دون التحقّق من أنّها متقايسة.',
  },
  {
    id: 'ex-3', source: src('ex-3', 57, 'أتمرّن', 3), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'اذكر من بين الكسور: $\\frac{9}{13}$ ، $\\frac{17}{17}$ ، $\\frac{11}{6}$ ، $\\frac{9}{11}$ ، $\\frac{6}{8}$ ، $\\frac{13}{9}$ :',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: '1) الكسر الذي نضربه في 9 يعطينا 13', options: [fr(13, 9), fr(9, 13), fr(9, 11)], correct: 0, correction: '$\\frac{13}{9}\\times 9=13$.' },
        { label: '2) الكسر الذي يساوي $9\\div 11$', options: [fr(9, 11), fr(11, 6), fr(11, 9)], correct: 0, correction: '$9\\div 11=\\frac{9}{11}$: البسط هو المقسوم.' },
        { label: '3) الكسر الذي يساوي 0,75', options: [fr(6, 8), fr(17, 17), fr(9, 13)], correct: 0, correction: '$\\frac{6}{8}=0{,}75$.' },
        { label: '4) الكسر الذي يساوي 1', options: [fr(17, 17), fr(13, 9), fr(9, 11)], correct: 0, correction: '$17\\div 17=1$.' },
        { label: '5) الكسر الذي بسطه 11', options: [fr(11, 6), fr(9, 11), fr(13, 9)], correct: 0, correction: 'البسط هو العدد الأعلى.' },
        { label: '6) الكسر الذي مقامه 13', options: [fr(9, 13), fr(13, 9), fr(17, 17)], correct: 0, correction: 'المقام هو العدد الأسفل.' },
      ]),
      explain: 'a ÷ b = a/b : البسط هو المقسوم والمقام هو المقسوم عليه.',
    },
    commonError: 'قلب الكسر: قراءة $9\\div 11$ على أنّها $\\frac{11}{9}$.',
  },
  {
    id: 'ex-4', source: src('ex-4', 57, 'أتمرّن', 4), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'في كل حالة، اكتب العدد الذي ينقص على شكل كسر: $9\\times\\ldots=7$ ؛ $3\\times\\ldots=7$ ؛ $13\\times\\ldots=19$ ؛ $7\\times\\ldots=1$',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('9\\times\\ldots=7'), options: [fr(7, 9), fr(9, 7), '2'], correct: 0, correction: '$9\\times\\frac{7}{9}=7$.' },
        { label: T('3\\times\\ldots=7'), options: [fr(7, 3), fr(3, 7), '4'], correct: 0, correction: '$3\\times\\frac{7}{3}=7$.' },
        { label: T('13\\times\\ldots=19'), options: [fr(19, 13), fr(13, 19), '6'], correct: 0, correction: '$13\\times\\frac{19}{13}=19$.' },
        { label: T('7\\times\\ldots=1'), options: [fr(1, 7), '7', fr(7, 1)], correct: 0, correction: '$7\\times\\frac{1}{7}=1$.' },
      ]),
      explain: 'العدد الناقص هو حاصل قسمة الناتج على العدد المضروب.',
    },
    commonError: 'الطرح: $3\\times\\ldots=7$ بكتابة 4.',
  },
  {
    id: 'ex-5', source: src('ex-5', 57, 'أتمرّن', 5), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'انقل وأتمم: $\\ldots\\times 8=13$ ؛ $6\\times\\frac{7}{6}=\\ldots$ ؛ $8\\times\\ldots=19$ ؛ $\\ldots\\times 11=11$',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('\\ldots\\times 8=13'), options: [fr(13, 8), fr(8, 13), '5'], correct: 0, correction: '$\\frac{13}{8}\\times 8=13$.' },
        { label: T('6\\times\\frac{7}{6}=\\ldots'), options: ['7', '42', fr(7, 36)], correct: 0, correction: '$\\frac{7}{6}\\times 6=7$.' },
        { label: T('8\\times\\ldots=19'), options: [fr(19, 8), fr(8, 19), '11'], correct: 0, correction: '$8\\times\\frac{19}{8}=19$.' },
        { label: T('\\ldots\\times 11=11'), options: ['1', '11', '0'], correct: 0, correction: '$\\frac{11}{11}=1$ : $1\\times 11=11$.' },
      ]),
      explain: '$\\frac{a}{b}\\times b=a$.',
    },
    commonError: 'ضرب الكسر في العدد المضروب مرتين ($6\\times\\frac{7}{6}=42$).',
  },
  {
    id: 'self-1', source: src('self-1', 59, 'أقوّم تعلّماتي', 1), learningPointId: LP.P1, difficulty: 'facile', figures: 'self-1',
    statement: 'إليك أربعة أنابيب اختبار، يحتوي كل منها على كمية من الماء. عبّر بكسر عن كمية الماء في كل أنبوب (الأنبوب ممتلئ كله يساوي 1).',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: 'الأنبوب A', options: [fr(3, 4), fr(3, 1), fr(4, 3)], correct: 0, correction: '3 أجزاء من 4 أجزاء متقايسة.' },
        { label: 'الأنبوب B', options: [fr(2, 5), fr(5, 2), fr(2, 3)], correct: 0, correction: '2 أجزاء من 5.' },
        { label: 'الأنبوب C', options: ['1', fr(6, 7), fr(1, 6)], correct: 0, correction: 'امتلأت 6 أجزاء من 6: $\\frac{6}{6}=1$.' },
        { label: 'الأنبوب D', options: [fr(5, 8), fr(8, 5), fr(5, 3)], correct: 0, correction: '5 أجزاء من 8.' },
      ]),
      explain: 'عدد الأجزاء المملوءة على عدد الأجزاء المتقايسة كلها.',
    },
    commonError: 'عدّ الأجزاء الفارغة بدل الأجزاء كلها.',
  },
  {
    id: 'self-9', source: src('self-9', 59, 'أقوّم تعلّماتي', 9), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'في كل حالة أكتب العدد الناقص: $\\ldots\\times 3=2$ ؛ $8=5\\times\\ldots$ ؛ $7\\times\\ldots=5$ ؛ $9\\times\\ldots=2$ ؛ $7\\times\\ldots=0{,}7$ ؛ $9\\times\\ldots=1$ ؛ $\\frac{5}{12}\\times 3=\\ldots$ ؛ $\\frac{14}{5}\\times\\ldots=14$ ؛ $7\\times\\frac{2}{21}=\\ldots$ ؛ $27\\times\\ldots=0{,}27$',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('\\ldots\\times 3=2'), options: [fr(2, 3), fr(3, 2), '1'], correct: 0, correction: '$\\frac{2}{3}\\times 3=2$.' },
        { label: T('8=5\\times\\ldots'), options: [fr(8, 5), fr(5, 8), '3'], correct: 0, correction: '$5\\times\\frac{8}{5}=8$.' },
        { label: T('7\\times\\ldots=5'), options: [fr(5, 7), fr(7, 5), '2'], correct: 0, correction: '$7\\times\\frac{5}{7}=5$.' },
        { label: T('9\\times\\ldots=2'), options: [fr(2, 9), fr(9, 2), '7'], correct: 0, correction: '$9\\times\\frac{2}{9}=2$.' },
        { label: T('7\\times\\ldots=0{,}7'), options: ['0,1', '1', '0,7'], correct: 0, correction: '$7\\times 0{,}1=0{,}7$ : عدد عشري، لا كسر $\\frac{a}{b}$ فقط.' },
        { label: T('9\\times\\ldots=1'), options: [fr(1, 9), '9', fr(9, 1)], correct: 0, correction: '$9\\times\\frac{1}{9}=1$.' },
        { label: T('\\frac{5}{12}\\times 3=\\ldots'), options: [fr(15, 12), fr(5, 36), '15'], correct: 0, correction: '$\\frac{5\\times 3}{12}=\\frac{15}{12}$ (ويُختزل لاحقا: درس الاختزال).' },
        { label: T('\\frac{14}{5}\\times\\ldots=14'), options: ['5', fr(5, 14), '14'], correct: 0, correction: '$\\frac{14}{5}\\times 5=14$.' },
        { label: T('7\\times\\frac{2}{21}=\\ldots'), options: [fr(14, 21), fr(2, 3), fr(9, 21)], correct: 0, correction: '$\\frac{7\\times 2}{21}=\\frac{14}{21}$.' },
        { label: T('27\\times\\ldots=0{,}27'), options: ['0,01', '0,1', '1'], correct: 0, correction: '$27\\times 0{,}01=0{,}27$.' },
      ]),
      explain: 'العدد الناقص هو حاصل القسمة، كسرا أو عددا عشريا.',
    },
    commonError: 'قراءة $9\\times\\ldots=2$ على أنّها $\\frac{9}{2}$.',
  },
];

/** « أقوّم تعلّماتي » 2 et 3 (p. 59) — repris dans le إختبار أولي (module 8). */
export const SELF = {
  2: { source: src('self-2', 59, 'أقوّم تعلّماتي', 2) },
  3: { source: src('self-3', 59, 'أقوّم تعلّماتي', 3), fraction: [11, 7] },
};

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
