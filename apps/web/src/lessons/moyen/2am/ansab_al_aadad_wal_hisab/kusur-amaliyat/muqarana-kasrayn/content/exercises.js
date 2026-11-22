/**
 * Les exercices du درس « مقارنة كسرين » (module 4 أتمرّن) : six exercices de la plateforme, chacun reprend l'IDÉE d'un élément du manuel (`src`) avec d'AUTRES nombres et d'autres
 * contextes. Périmètre 2AM : même dénominateur (numérateurs décimaux inclus), même numérateur, un dénominateur multiple de l'autre, rangement, comparaison à 1 (ou à un entier) ;
 * jamais de produit en croix ni de multiple commun quelconque. Les erreurs sont corrigées, jamais comptées ; chaque clé est recalculée dans ./exercises.test.js (BigInt).
 * `requires` : les briques de ./knowledge.jsx que l'exercice mobilise (lues par le module 4 via STEPS_META).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_muqarana-kasrayn_P1',
  P2: '2am_muqarana-kasrayn_P2',
  P3: '2am_muqarana-kasrayn_P3',
  P4: '2am_muqarana-kasrayn_P4',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-6', 25, 'أنشطة', 6), learningPointId: LP.P2, difficulty: 'facile',
    requires: ['nafs-al-bast'],
    statement: 'صينيتان متماثلتان من البغرير: قُسّمت الأولى إلى $6$ قطع متساوية والثانية إلى $9$ قطع متساوية. أخذت سلمى قطعتين من الأولى، وأخذ ريان قطعتين من الثانية.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'الكسر الذي أخذته سلمى من صينيتها', options: ['$\\frac{2}{6}$', '$\\frac{6}{2}$', '$\\frac{2}{8}$'], correct: 0, correction: 'قُسّمت صينيتها إلى $6$ قطع وأخذت قطعتين: $\\frac{2}{6}$ .' },
        { label: 'الكسر الذي أخذه ريان من صينيته', options: ['$\\frac{2}{9}$', '$\\frac{9}{2}$', '$\\frac{2}{7}$'], correct: 0, correction: 'قُسّمت صينيته إلى $9$ قطع وأخذ قطعتين: $\\frac{2}{9}$ .' },
        { label: '$\\frac{2}{6}\\ \\square\\ \\frac{2}{9}$', options: ['$<$', '$>$', '$=$'], correct: 1, correction: 'البسط نفسه $2$ : كلّما كان المقام أصغر كانت القطعة أكبر. فـ $\\frac{2}{6}>\\frac{2}{9}$ .' },
        { label: 'من أخذ أكثر من صينيته؟', options: ['سلمى', 'ريان', 'أخذا القدر نفسه'], correct: 0, correction: 'قطع الصينية الأولى أكبر (ستّ قطع فقط)، فسلمى أخذت أكثر.' },
      ],
      explain: 'عند البسط نفسه، الكسر الأكبر هو الذي مقامه أصغر: قطعه أكبر.',
    },
    commonError: 'الظنّ أنّ $9$ أكبر من $6$ فالكسر ذو المقام $9$ أكبر.',
  },
  {
    id: 'ex-2', source: src('ex-20', 31, 'أوظّف تعلّماتي', 20), learningPointId: LP.P4, difficulty: 'moyen',
    requires: ['muqarana-bi-1'],
    statement: 'قارن كلّ كسر بالعدد $1$ ثم بالعدد $2$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\frac{7}{9}$', options: ['أصغر من $1$', 'أكبر من $1$', 'يساوي $1$'], correct: 0, correction: 'البسط $7$ أصغر من المقام $9$ : $\\frac{7}{9}<\\frac{9}{9}=1$ .' },
        { label: '$\\frac{15}{14}$', options: ['أصغر من $1$', 'أكبر من $1$', 'يساوي $1$'], correct: 1, correction: 'البسط $15$ أكبر من المقام $14$ : $\\frac{15}{14}>\\frac{14}{14}=1$ .' },
        { label: '$\\frac{99}{100}$', options: ['أصغر من $1$', 'أكبر من $1$', 'يساوي $1$'], correct: 0, correction: '$99<100$ : $\\frac{99}{100}<\\frac{100}{100}=1$ .' },
        { label: '$\\frac{40}{39}$', options: ['أصغر من $1$', 'أكبر من $1$', 'يساوي $1$'], correct: 1, correction: '$40>39$ : $\\frac{40}{39}>1$ .' },
        { label: '$\\frac{5}{3}$', options: ['أصغر من $1$', 'أكبر من $1$', 'يساوي $1$'], correct: 1, correction: '$5>3$ : $\\frac{5}{3}>1$ .' },
        { label: 'الكسور الخمسة السابقة كلّها', options: ['أصغر من $2$', 'أكبر من $2$', 'بعضها أصغر وبعضها أكبر من $2$'], correct: 0, correction: 'أكبرها $\\frac{5}{3}$ و $2=\\frac{6}{3}$ ، و $\\frac{5}{3}<\\frac{6}{3}$ ؛ والبقيّة أصغر من $2$ لأنّ بسط كلّ منها أصغر من ضعف مقامه.' },
      ],
      explain: 'الكسر أصغر من $1$ إن كان بسطه أصغر من مقامه، وأكبر من $1$ إن كان بسطه أكبر من مقامه.',
    },
    commonError: 'الحكم على الكسر بعظم عدديه دون مقارنة البسط بالمقام.',
  },
  {
    id: 'ex-3', source: src('ex-21', 31, 'أوظّف تعلّماتي', 21), alsoSource: [src('ex-22', 31, 'أوظّف تعلّماتي', 22)], learningPointId: LP.P1, difficulty: 'moyen',
    requires: ['nafs-al-maqam', 'nafs-al-bast'],
    statement: 'ضع الرمز المناسب $<$ أو $>$ أو $=$ مكان $\\square$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\frac{5}{13}\\ \\square\\ \\frac{8}{13}$', options: ['$<$', '$>$', '$=$'], correct: 0, correction: 'المقام نفسه $13$ : الأكبر هو الأكبر بسطًا. $5<8$ .' },
        { label: '$\\frac{9}{4}\\ \\square\\ \\frac{9}{5}$', options: ['$<$', '$>$', '$=$'], correct: 1, correction: 'البسط نفسه $9$ : الأكبر هو الأصغر مقامًا. $\\frac{9}{4}>\\frac{9}{5}$ .' },
        { label: '$\\frac{3{,}4}{7}\\ \\square\\ \\frac{3{,}1}{7}$', options: ['$<$', '$>$', '$=$'], correct: 1, correction: 'المقام نفسه $7$ : نقارن البسطين $3{,}4>3{,}1$ .' },
        { label: '$0\\ \\square\\ \\frac{1}{100}$', options: ['$<$', '$>$', '$=$'], correct: 0, correction: '$\\frac{1}{100}$ كسر موجب أي أكبر من $0$ ، فـ $0<\\frac{1}{100}$ .' },
      ],
      explain: 'نبدأ بتعيين الحالة: المقام نفسه نقارن البسطين، والبسط نفسه نقارن المقامين بالعكس.',
    },
    commonError: 'مقارنة المقامين عند المقام المشترك، أو مقارنتهما في اتّجاه واحد عند البسط المشترك.',
  },
  {
    id: 'ex-4', source: src('ex-23', 31, 'أوظّف تعلّماتي', 23), learningPointId: LP.P2, difficulty: 'difficile',
    requires: ['nafs-al-bast', 'muqarana-bi-1'],
    statement: 'كسور بسطها $5$ : قارنها دون أيّ حساب مطوّل.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'أيّ هذه الكسور محصور بين $\\frac{5}{11}$ و $\\frac{5}{9}$ ؟', options: ['$\\frac{5}{10}$', '$\\frac{5}{8}$', '$\\frac{5}{12}$'], correct: 0, correction: 'البسط نفسه $5$ والمقام $10$ بين $9$ و $11$ : فـ $\\frac{5}{11}<\\frac{5}{10}<\\frac{5}{9}$ . ($\\frac{5}{8}$ أكبر من $\\frac{5}{9}$ و $\\frac{5}{12}$ أصغر من $\\frac{5}{11}$ .)' },
        { label: '$\\frac{5}{4}\\ \\square\\ \\frac{5{,}3}{4}$', options: ['$<$', '$>$', '$=$'], correct: 0, correction: 'المقام نفسه $4$ : $5<5{,}3$ ، فـ $\\frac{5}{4}<\\frac{5{,}3}{4}$ .' },
        { label: '$\\frac{5}{4}\\ \\square\\ \\frac{5}{6}$', options: ['$<$', '$>$', '$=$'], correct: 1, correction: 'البسط نفسه $5$ : المقام الأصغر $4$ يعطي الكسر الأكبر، فـ $\\frac{5}{4}>\\frac{5}{6}$ .' },
      ],
      explain: 'عند البسط نفسه نرتّب الكسور بعكس مقاماتها، وعند المقام نفسه نرتّبها كبسوطها.',
    },
    commonError: 'ترتيب الكسور ذات البسط نفسه بترتيب مقاماتها.',
  },
  {
    id: 'ex-5', source: src('now-29', 29, 'دوري الآن', 29), learningPointId: LP.P3, difficulty: 'moyen',
    requires: ['tartib-kusur', 'muqarana-bi-1'],
    statement: 'الكسور الخمسة التالية: $\\frac{9}{13}$ ، $\\frac{15}{11}$ ، $\\frac{4}{13}$ ، $\\frac{11}{13}$ ، $\\frac{12}{11}$ . نريد ترتيبها تنازليًا (من الأكبر إلى الأصغر).',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'أيّ الكسور الخمسة أكبر من $1$ ؟', options: ['$\\frac{15}{11}$ و $\\frac{12}{11}$', '$\\frac{9}{13}$ و $\\frac{11}{13}$', '$\\frac{12}{11}$ فقط'], correct: 0, correction: 'بسطا $\\frac{15}{11}$ و $\\frac{12}{11}$ أكبر من مقامهما $11$ ؛ أمّا الباقي فبسطه أصغر من $13$ .' },
        { label: '$\\frac{15}{11}\\ \\square\\ \\frac{12}{11}$', options: ['$<$', '$>$', '$=$'], correct: 1, correction: 'المقام نفسه $11$ : $15>12$ .' },
        { label: 'رتّب تنازليًا الكسور الثلاثة التي مقامها $13$', options: ['$\\frac{11}{13}>\\frac{9}{13}>\\frac{4}{13}$', '$\\frac{4}{13}>\\frac{9}{13}>\\frac{11}{13}$', '$\\frac{9}{13}>\\frac{11}{13}>\\frac{4}{13}$'], correct: 0, correction: 'المقام نفسه: نرتّب البسوط $11>9>4$ .' },
        { label: 'الترتيب التنازلي للكسور الخمسة', options: ['$\\frac{15}{11}>\\frac{12}{11}>\\frac{11}{13}>\\frac{9}{13}>\\frac{4}{13}$', '$\\frac{11}{13}>\\frac{9}{13}>\\frac{4}{13}>\\frac{15}{11}>\\frac{12}{11}$', '$\\frac{15}{11}>\\frac{11}{13}>\\frac{12}{11}>\\frac{9}{13}>\\frac{4}{13}$'], correct: 0, correction: 'الكسران الأكبران من $1$ أوّلًا، ثم الثلاثة الأصغر من $1$ .' },
      ],
      explain: 'نفصل الكسور بالعدد $1$ إلى عائلتين، ثم نرتّب كلّ عائلة بمقامها المشترك.',
    },
    commonError: 'الحكم على الكسر بمقامه وحده: الظنّ أنّ المقام الأكبر $13$ يعطي كسورًا أكبر.',
  },
  {
    id: 'ex-6', source: src('ex-24', 31, 'أوظّف تعلّماتي', 24), learningPointId: LP.P3, difficulty: 'moyen',
    requires: ['tawhid-li-muqarana'],
    statement: 'أكمل بـ $<$ أو $>$ أو $=$ بعد توحيد المقامين عند الحاجة.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\frac{3}{5}\\ \\square\\ \\frac{24}{40}$', options: ['$<$', '$>$', '$=$'], correct: 2, correction: '$40=5\\times 8$ ، فـ $\\frac{3}{5}=\\frac{24}{40}$ .' },
        { label: '$\\frac{8}{5}\\ \\square\\ 2$', options: ['$<$', '$>$', '$=$'], correct: 0, correction: '$2=\\frac{10}{5}$ و $8<10$ ، فـ $\\frac{8}{5}<2$ .' },
        { label: '$\\frac{10}{6}\\ \\square\\ \\frac{5}{3}$', options: ['$<$', '$>$', '$=$'], correct: 2, correction: '$\\frac{5}{3}=\\frac{10}{6}$ لأنّ $6=3\\times 2$ .' },
        { label: '$\\frac{7}{10}\\ \\square\\ \\frac{4}{5}$', options: ['$<$', '$>$', '$=$'], correct: 0, correction: '$\\frac{4}{5}=\\frac{8}{10}$ و $7<8$ ، فـ $\\frac{7}{10}<\\frac{4}{5}$ .' },
      ],
      explain: 'إذا كان أحد المقامين مضاعفًا للآخر كتبنا الكسر الآخر بالمقام الأكبر ثم قارنّا البسطين.',
    },
    commonError: 'مقارنة البسطين وحدهما دون توحيد المقامين.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Ce que le module 4 lit : un titre court et les briques mobilisées par chaque exercice. */
export const STEPS_META = [
  { id: 'ex-1', title: 'صينيتا البغرير', requires: ['nafs-al-bast'] },
  { id: 'ex-2', title: 'أصغر من 1 أم أكبر', requires: ['muqarana-bi-1'] },
  { id: 'ex-3', title: 'أضع الرمز المناسب', requires: ['nafs-al-maqam', 'nafs-al-bast'] },
  { id: 'ex-4', title: 'كسور بسطها 5', requires: ['nafs-al-bast', 'muqarana-bi-1'] },
  { id: 'ex-5', title: 'أرتّب تنازليًا', requires: ['tartib-kusur', 'muqarana-bi-1'] },
  { id: 'ex-6', title: 'أوحّد ثم أقارن', requires: ['tawhid-li-muqarana'] },
];
