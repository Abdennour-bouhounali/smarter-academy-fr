/**
 * Les exercices du MANUEL rattachés au درس 1 « التناسبية ومعامل التناسبية » (extraction.json →
 * destinations : ex-16, ex-17, ex-18, p. 73, « التعرف على وضعية تناسبية »), plus un exercice de la
 * plateforme (déclaré). Énoncés au mot près ; un exercice à plusieurs parties est découpé en une entrée
 * par partie (la première porte l'énoncé). ex-17 : question 2 CORRIGÉE (« A و P » → « P و r »,
 * correction du propriétaire). Tous les distracteurs sont faux (vérifiés par le calcul).
 */
import { src, addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_tanasub-muamil_P1',
  P2: '4am_tanasub-muamil_P2',
  P3: '4am_tanasub-muamil_P3',
};

const E = (n, part) => ({ ...src(`ex-${n}`, 73, 'أوظّف تعلّماتي', n), ...(part ? { part } : {}) });
const PLATFORM = addition('interaction_generation');

/** La ligne de correction de ex-17 (affichée une fois, discrète). */
export const EX17_CORRECTION = 'صحّحت المنصّة خطأً مطبعيًا: في الكتاب «2) هل A و P متناسبان؟»، والسؤال يخصّ المحيط P ونصف القطر r (السؤال 3 يخصّ A و r).';

export const EXERCISES = [
  // تمرين 16 — la lettre b dans un tableau de proportionnalité
  {
    id: 'ex-16', source: E(16), learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'عيّن العدد $b$ إذا علمت أن الجدول الآتي جدول تناسبية.',
    items: ['$\\begin{array}{|c|c|} \\hline b - 1 & 4 \\\\ \\hline -16 & 1 - b \\\\ \\hline \\end{array}$'],
    interaction: 'choice',
    question: {
      prompt: 'قيمة (أو قيم) العدد $b$ :',
      options: ['$b = 9$ فقط', '$b = -7$ أو $b = 9$', '$b = 7$ أو $b = -9$', '$b = -7$ فقط'],
      correct: 1,
      cols: 2,
      explain: 'الجداءان المتصالبان متساويان: $(b - 1)(1 - b) = 4 \\times (-16)$ ، أي $-(b - 1)^2 = -64$ ، ومنه $(b - 1)^2 = 64$ : $b - 1 = 8$ أو $b - 1 = -8$ ، أي $b = 9$ أو $b = -7$ . تحقّق: من أجل $b = 9$ السطران $8 , 4$ و $-16 , -8$ والمعامل $-2$ ؛ ومن أجل $b = -7$ السطران $-8 , 4$ و $-16 , 8$ والمعامل $2$ .',
    },
    method: 'نكتب تساوي الجداءين المتصالبين، ثم نحلّ المعادلة الناتجة.',
    commonError: 'نسيان الحل الثاني: $(b - 1)^2 = 64$ تعطي $b - 1 = 8$ أو $b - 1 = -8$ .',
  },
  // تمرين 17 — le disque : 1) compléter le tableau
  {
    id: 'ex-17-1', source: E(17, '1)'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'نعتبر قرصا نصف قطره r . محيطه P ومساحته A . 1) انقل الجدول السابق وأتممه. 2) هل P و r متناسبان؟ في حالة الإيجاب عيّن معامل التناسبية. 3) هل A و r متناسبان؟ في حالة الإيجاب عيّن معامل التناسبية.',
    items: [
      '$\\begin{array}{|c|c|c|c|c|} \\hline r & 2{,}5 & 3 & 8 & 9{,}5 \\\\ \\hline P & 5\\pi & \\ldots & \\ldots & \\ldots \\\\ \\hline A & \\ldots & \\ldots & \\ldots & 90{,}25\\pi \\\\ \\hline \\end{array}$',
      'r و P بالمتر، A بالمتر المربع. تذكّر: $P = 2\\pi r$ و $A = \\pi r^2$ .',
    ],
    interaction: 'batch',
    question: {
      prompt: '1) أتمم الجدول:',
      rows: [
        { label: '$P$ من أجل $r = 3$', options: ['$6\\pi$', '$9\\pi$', '$3\\pi$'], correct: 0, correction: '$P = 2\\pi \\times 3 = 6\\pi$' },
        { label: '$P$ من أجل $r = 8$', options: ['$64\\pi$', '$16\\pi$', '$10\\pi$'], correct: 1, correction: '$P = 2\\pi \\times 8 = 16\\pi$' },
        { label: '$P$ من أجل $r = 9{,}5$', options: ['$19\\pi$', '$90{,}25\\pi$', '$9{,}5\\pi$'], correct: 0, correction: '$P = 2\\pi \\times 9{,}5 = 19\\pi$' },
        { label: '$A$ من أجل $r = 2{,}5$', options: ['$5\\pi$', '$6{,}25\\pi$', '$2{,}5\\pi$'], correct: 1, correction: '$A = \\pi \\times 2{,}5^2 = 6{,}25\\pi$' },
        { label: '$A$ من أجل $r = 3$', options: ['$6\\pi$', '$3\\pi$', '$9\\pi$'], correct: 2, correction: '$A = \\pi \\times 3^2 = 9\\pi$' },
        { label: '$A$ من أجل $r = 8$', options: ['$64\\pi$', '$16\\pi$', '$32\\pi$'], correct: 0, correction: '$A = \\pi \\times 8^2 = 64\\pi$' },
      ],
      explain: '$P = 2\\pi r$ : $5\\pi , 6\\pi , 16\\pi , 19\\pi$ ؛ $A = \\pi r^2$ : $6{,}25\\pi , 9\\pi , 64\\pi , 90{,}25\\pi$ .',
    },
    commonError: 'الخلط بين $2\\pi r$ و $\\pi r^2$ : من أجل $r = 8$ المحيط $16\\pi$ والمساحة $64\\pi$ .',
  },
  {
    id: 'ex-17-2', source: E(17, '2)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '2) هل P و r متناسبان؟',
      options: ['نعم، ومعامل التناسبية $2\\pi$', 'نعم، ومعامل التناسبية $\\pi$', 'لا، ليسا متناسبين'],
      correct: 0,
      cols: 1,
      explain: '$\\dfrac{5\\pi}{2{,}5} = \\dfrac{6\\pi}{3} = \\dfrac{16\\pi}{8} = \\dfrac{19\\pi}{9{,}5} = 2\\pi$ : حاصل القسمة ثابت، فـ P و r متناسبان ومعامل التناسبية $2\\pi$ ( $P = 2\\pi \\times r$ ).',
    },
  },
  {
    id: 'ex-17-3', source: E(17, '3)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: {
      prompt: '3) هل A و r متناسبان؟',
      options: ['نعم، ومعامل التناسبية $\\pi$', 'لا: $\\dfrac{6{,}25\\pi}{2{,}5} = 2{,}5\\pi$ لكن $\\dfrac{9\\pi}{3} = 3\\pi$', 'نعم، ومعامل التناسبية $2{,}5\\pi$'],
      correct: 1,
      cols: 1,
      explain: 'حواصل القسمة $\\dfrac{A}{r}$ هي $2{,}5\\pi , 3\\pi , 8\\pi , 9{,}5\\pi$ : تتغيّر (هي $\\pi r$)، فـ A و r غير متناسبين.',
    },
    commonError: 'الظنّ أنّ A و r متناسبان لأنّ A يزداد كلما ازداد r : الزيادة لا تكفي، يجب أن يكون حاصل القسمة ثابتا.',
  },
  // تمرين 18 — deux représentations graphiques (figure : components/Ex18Graphs.jsx)
  {
    id: 'ex-18-1', source: E(18, '1'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'إليك التمثيلين البيانيين التاليين. أي بيان منهما يمثل وضعية تناسبية؟ما هو عندئذ معامل التناسبية؟',
    interaction: 'choice',
    question: {
      prompt: 'البيان الذي يمثّل وضعية تناسبية:',
      options: ['البيان (1)', 'البيان (2)', 'البيانان كلاهما'],
      correct: 0,
      cols: 3,
      explain: 'على البيان (1) نقرأ $(0 ; 0)$ ، $(0{,}5 ; 0{,}75)$ ، $(1 ; 1{,}5)$ : $\\dfrac{0{,}75}{0{,}5} = \\dfrac{1{,}5}{1} = 1{,}5$ . أمّا البيان (2) فيمرّ بالنقطة $(0 ; 0{,}3)$ تقريبا: من أجل $x = 0$ لدينا $y \\neq 0$ ، فليس وضعية تناسبية.',
    },
    commonError: 'اختيار البيان (2) لأنه يصعد أيضًا: الصعود لا يكفي، يجب أن يكون حاصل القسمة $\\dfrac{y}{x}$ ثابتا.',
  },
  {
    id: 'ex-18-2', source: E(18, '2'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'numeric',
    question: {
      prompt: 'معامل التناسبية:',
      expected: 1.5,
      display: '1,5',
      explain: 'النقطة $(1 ; 1{,}5)$ على البيان (1): $\\dfrac{1{,}5}{1} = 1{,}5$ ، وكذلك $\\dfrac{0{,}75}{0{,}5} = 1{,}5$ .',
    },
  },
  // Exercice de la plateforme (P3) — la boutique de chawarma du quartier
  {
    id: 'ex-p1-1', source: PLATFORM, learningPointId: LP.P3, difficulty: 'facile',
    statement: 'في محلّ «ستريت فود» قرب المتوسطة، يحافظ صاحبه على نظافته، ثمن الشاورما 250DA للواحدة. نسمّي $x$ عدد الشاورمات و $y$ الثمن بالدينار.',
    items: ['$\\begin{array}{|c|c|c|c|} \\hline x & 1 & 2 & 4 \\\\ \\hline y & 250 & 500 & 1000 \\\\ \\hline \\end{array}$'],
    interaction: 'choice',
    question: {
      prompt: 'العلاقة بين $y$ و $x$ :',
      options: ['$y = 250 \\times x$', '$x = 250 \\times y$', '$y = x + 250$', '$y = 250 \\div x$'],
      correct: 0,
      cols: 2,
      explain: 'حاصل القسمة $\\dfrac{250}{1} = \\dfrac{500}{2} = \\dfrac{1000}{4} = 250$ ثابت: $y = 250 \\times x$ . أمّا $y = x + 250$ فتعطي $252$ من أجل $x = 2$ ، وليس $500$ .',
    },
  },
  {
    id: 'ex-p1-2', source: PLATFORM, learningPointId: LP.P3, difficulty: 'facile',
    interaction: 'numeric',
    question: {
      prompt: 'ثمن 7 شاورمات بالدينار:',
      expected: 1750,
      display: '1750',
      explain: '$y = 250 \\times 7 = 1750$ DA.',
    },
  },
];

/** Les parties d'un exercice. */
export const partsOf = (n) => EXERCISES.filter((ex) => ex.id === `ex-${n}` || ex.id.startsWith(`ex-${n}-`));

/** Accès par id. */
export const EX = Object.fromEntries(EXERCISES.map((ex) => [ex.id, ex]));
