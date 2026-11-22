/**
 * Les exercices du درس « حلّ مشكل باستعمال معادلة » (module 4 أتمرّن) : six exercices de la plateforme, chacun reprend l'IDÉE d'un élément du manuel (`src`) avec d'AUTRES nombres et d'autres contextes
 * (des dattes en caisses, des équations à nombres décimaux, un rectangle d'aire donnée). Les erreurs sont corrigées, jamais comptées ; chaque clé est recalculée dans ./content.test.js (arithmétique indépendante).
 * Toutes les valeurs sont positives (ordre de génération de l'unité).
 */
import { src, addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_hall-mushkil-muadala_P1',
  P2: '2am_hall-mushkil-muadala_P2',
  P3: '2am_hall-mushkil-muadala_P3',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-4', 57, 'أنشطة', 4), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'جنى فلّاح $1350\\,\\mathrm{kg}$ من التمر في بسكرة ووضعها في علب متماثلة كتلة كلّ منها $x\\,\\mathrm{kg}$ ، ثمّ شحنها في $3$ شحنات، في كلّ شحنة $150$ علبة، أي $450$ علبة.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'المعادلة $450\\times x=1350$', options: ['خاطئة', 'صحيحة'], correct: 1, correction: '$450$ علبة كتلة كلّ منها $x$ تزن $450\\times x$ ، وهي $1350\\,\\mathrm{kg}$ .' },
        { label: 'المعادلة $\\frac{1350}{x}=450$', options: ['صحيحة', 'خاطئة'], correct: 0, correction: 'عدد العلب هو الكتلة الكلّية مقسومة على كتلة العلبة: $\\frac{1350}{x}=450$ . هي المعادلة السابقة بكتابة ثانية.' },
        { label: 'المعادلة $150\\times x=1350$', options: ['خاطئة', 'صحيحة'], correct: 0, correction: '$150$ هو عدد علب شحنة واحدة، والكتلة $1350\\,\\mathrm{kg}$ كلّها: الصحيح $450$ علبة.' },
        { label: 'المعادلة $\\frac{x}{450}=1350$', options: ['خاطئة', 'صحيحة'], correct: 0, correction: 'هذه المعادلة تجعل الكتلة الكلّية حاصل قسمة؛ والكتلة الكلّية هي المقسوم.' },
        { label: 'كتلة العلبة الواحدة', options: ['$900\\,\\mathrm{kg}$', '$3\\,\\mathrm{kg}$', '$\\frac{1}{3}\\,\\mathrm{kg}$'], correct: 1, correction: '$x=1350\\div450=3\\,\\mathrm{kg}$ . (و $\\frac{1}{3}$ هو $450\\div1350$ : انقلبت الأدوار.)' },
      ],
      explain: 'للوضعية نفسها عدّة معادلات صحيحة: الضرب $450\\times x=1350$ والقسمة $\\frac{1350}{x}=450$ تقولان الشيء نفسه.',
    },
    commonError: 'اختيار معادلة تضع الكمية الكلّية في غير مكانها.',
  },
  {
    id: 'ex-2', source: src('ex-38', 64, 'المعادلات', 38), alsoSource: [src('ex-39', 64, 'المعادلات', 39)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'حلّ كلّ معادلة من المعادلات الآتية.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\frac{x}{4}=2{,}5$', options: ['$0{,}625$', '$10$', '$6{,}5$'], correct: 1, correction: 'المقسوم الناقص: $x=4\\times2{,}5=10$ .' },
        { label: '$\\frac14\\times x=3{,}5$', options: ['$14$', '$0{,}875$', '$3{,}25$'], correct: 0, correction: 'العامل الناقص: $x=3{,}5\\div\\frac14=3{,}5\\times4=14$ .' },
        { label: '$\\frac{x}{200}=\\frac15$', options: ['$1000$', '$0{,}001$', '$40$'], correct: 2, correction: '$x=200\\times\\frac15=40$ .' },
        { label: '$\\frac{392}{x}=98$', options: ['$4$', '$38416$', '$0{,}25$'], correct: 0, correction: 'القاسم الناقص: $x=392\\div98=4$ .' },
        { label: '$\\frac{75{,}6}{x}=12{,}6$', options: ['$952{,}56$', '$\\frac16$', '$6$'], correct: 2, correction: '$x=75{,}6\\div12{,}6=6$ . (و $\\frac16$ هو $12{,}6\\div75{,}6$ .)' },
      ],
      explain: 'نسأل أوّلًا: ما الذي يجهله العدد $x$ ؟ عامل أم مقسوم أم قاسم؟ ثمّ نختار العملية العكسية.',
    },
    commonError: 'ضرب العددين المعلومين في معادلة قاسمها مجهول.',
  },
  {
    id: 'ex-3', source: src('now-61', 61, 'دوري الآن', 2), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'عيّن العدد $x$ بحيث $\\frac{30}{x}=12$ .',
    interaction: 'numeric',
    question: { prompt: '$x=$', expected: 2.5, display: '2,5', explain: '$x=30\\div12=2{,}5$ . نتحقّق: $30\\div2{,}5=12$ .' },
    commonError: 'قسمة $12$ على $30$ بدل $30$ على $12$ .',
  },
  {
    id: 'ex-4', source: src('ex-37', 64, 'المعادلات', 37), alsoSource: [src('ex-36', 64, 'المعادلات', 36)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'عيّن العدد الناقص في كلّ مساواة.',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$0{,}1\\times\\ldots=0{,}53$', options: ['$0{,}053$', '$5{,}3$', '$0{,}63$'], correct: 1, correction: '$0{,}53\\div0{,}1=5{,}3$ .' },
        { label: '$\\frac{144}{\\ldots}=12$', options: ['$12$', '$1728$', '$132$'], correct: 0, correction: '$144\\div12=12$ .' },
        { label: '$\\frac{0{,}36}{\\ldots}=0{,}1$', options: ['$0{,}036$', '$0{,}26$', '$3{,}6$'], correct: 2, correction: '$0{,}36\\div0{,}1=3{,}6$ .' },
      ],
      explain: 'نعامل الخانة الفارغة كالمجهول $x$ ونجدها بالعملية العكسية.',
    },
    commonError: 'ضرب $0{,}53$ في $0{,}1$ بدل قسمته.',
  },
  {
    id: 'ex-5', source: addition('interaction_generation'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نتحقّق من حلّ بإنجاز العملية: هل ما يلي صحيح أم خاطئ؟',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'القيمة $3$ حلّ للمعادلة $\\frac{4{,}8}{x}=1{,}6$ .', answer: true, why: '$4{,}8\\div3=1{,}6$ : المساواة صحيحة.' },
        { text: 'القيمة $5$ حلّ للمعادلة $2{,}5\\times x=10$ .', answer: false, why: '$2{,}5\\times5=12{,}5$ لا $10$ ؛ الحلّ هو $4$ .' },
        { text: 'القيمة $8$ حلّ للمعادلة $\\frac{56}{x}=7$ .', answer: true, why: '$56\\div8=7$ .' },
        { text: 'القيمة $0{,}3$ حلّ للمعادلة $\\frac{12}{x}=4$ .', answer: false, why: '$12\\div0{,}3=40$ لا $4$ ؛ الحلّ هو $3$ .' },
      ],
      explain: 'نعوّض القيمة ونُنجز العملية الواحدة: إن أعطت العدد المذكور فهي حلّ.',
    },
    commonError: 'الحكم على القيمة دون إنجاز العملية.',
  },
  {
    id: 'ex-6', source: src('deep-56', 67, 'أتعمّق', 56), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'مستطيل مساحته $7{,}5\\,\\mathrm{cm}^2$ وطوله $5\\,\\mathrm{cm}$ . نسمّي عرضه $x$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'المعادلة التي تترجم الوضعية', options: ['$5+x=7{,}5$', '$\\frac{x}{5}=7{,}5$', '$5\\times x=7{,}5$'], correct: 2, correction: 'المساحة هي الطول × العرض: $5\\times x=7{,}5$ . (الجمع محيط لا مساحة.)' },
        { label: 'عرض المستطيل', options: ['$1{,}5\\,\\mathrm{cm}$', '$37{,}5\\,\\mathrm{cm}$', '$2{,}5\\,\\mathrm{cm}$'], correct: 0, correction: '$x=7{,}5\\div5=1{,}5\\,\\mathrm{cm}$ . (و $37{,}5=7{,}5\\times5$ .)' },
      ],
      explain: 'نسمّي المجهول ثمّ نترجم القاعدة المعروفة (المساحة = الطول × العرض) بمعادلة ونحلّها.',
    },
    commonError: 'ضرب المساحة في الطول بدل قسمتها عليه.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
