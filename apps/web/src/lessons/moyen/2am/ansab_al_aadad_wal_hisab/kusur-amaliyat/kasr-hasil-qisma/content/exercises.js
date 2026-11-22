/**
 * Les exercices du درس « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » (module 4 أتمرّن) : six exercices de la plateforme, chacun reprend l'IDÉE d'un élément du manuel (`src`) avec d'AUTRES
 * nombres et d'autres contextes. Les erreurs sont corrigées, jamais comptées ; chaque clé est recalculée dans ./content.test.js.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_kasr-hasil-qisma_P1',
  P2: '2am_kasr-hasil-qisma_P2',
  P3: '2am_kasr-hasil-qisma_P3',
  P4: '2am_kasr-hasil-qisma_P4',
};

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-2', 24, 'أنشطة', 2), alsoSource: [src('ex-5', 30, 'أوظّف تعلّماتي', 5), src('ex-6', 30, 'أوظّف تعلّماتي', 6), src('self-1', 33, 'أؤكّد تعلّماتي', 1), src('self-4', 33, 'أؤكّد تعلّماتي', 4), src('self-9', 33, 'أؤكّد تعلّماتي', 9)], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'قُسّمت صينية مقروط إلى $12$ قطعة متساوية، فأخذت سلمى منها $5$ قطع. ثم لو قُسّمت الصينية نفسها إلى $24$ قطعة وبقي نصيب سلمى كما هو، فكم قطعة تأخذ؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'الكسر الذي يمثّل نصيب سلمى', options: ['$\\frac{5}{12}$', '$\\frac{12}{5}$', '$\\frac{5}{7}$'], correct: 0, correction: 'نصيبها $5$ قطع من $12$ : نسبتها إلى الصينية $\\frac{5}{12}$ .' },
        { label: 'نصيبها بعد القسمة إلى $24$ قطعة', options: ['$\\frac{10}{24}$', '$\\frac{5}{24}$', '$\\frac{24}{10}$'], correct: 0, correction: 'كلّ قطعة قُسّمت إلى قطعتين: $\\frac{5 \\times 2}{12 \\times 2} = \\frac{10}{24}$ .' },
        { label: 'في الكسر $\\frac{5}{12}$ البسط هو', options: ['$5$', '$12$', '$5 \\div 12$'], correct: 0, correction: 'البسط هو العدد الأعلى: عدد القطع المأخوذة.' },
        { label: 'أيّ كتابة تساوي $\\frac{5}{12}$ ؟', options: ['$\\frac{15}{36}$', '$\\frac{15}{12}$', '$\\frac{5}{36}$'], correct: 0, correction: 'نضرب البسط والمقام في $3$ : $\\frac{5 \\times 3}{12 \\times 3} = \\frac{15}{36}$ .' },
      ],
      explain: 'ضربنا العدد الذي يعدّ القطع المأخوذة والعدد الذي يعدّ كلّ القطع في العدد نفسه، فبقي النصيب نفسه.',
    },
    commonError: 'ترك البسط $5$ كما هو مع تغيير المقام فقط.',
  },
  {
    id: 'ex-2', source: src('act-3', 24, 'أنشطة', 3), alsoSource: [src('ex-1', 30, 'أوظّف تعلّماتي', 1), src('self-2', 33, 'أؤكّد تعلّماتي', 2), src('ict-2', 37, 'تكنولوجيات', 2)], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'اشترت سلمى $7$ كرّاريس بـ $150$ دج، وتزن $12$ علبة أقلام معًا $3$ kg. ورسمت سباعيًّا منتظمًا محيطه $10$ cm.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'هل ثمن الكرّاس الواحد $\\frac{150}{7}$ دج عدد عشري؟', options: ['نعم', 'لا'], correct: 1, correction: '$150 \\div 7 = 21{,}428\\ldots$ لا تنتهي القسمة: ليس عشريًا.' },
        { label: 'حصر هذا الثمن إلى $0{,}01$', options: ['$21{,}42 < \\frac{150}{7} < 21{,}43$', '$21{,}4 < \\frac{150}{7} < 21{,}5$', '$21{,}43 < \\frac{150}{7} < 21{,}44$'], correct: 0, correction: '$7 \\times 21{,}42 = 149{,}94 < 150 < 150{,}01 = 7 \\times 21{,}43$ .' },
        { label: 'العدد الذي إذا ضربناه في $7$ وجدنا $150$ هو', options: ['$\\frac{150}{7}$', '$\\frac{7}{150}$', '$150 - 7$'], correct: 0, correction: 'العدد الذي نضربه في $7$ ليعطي $150$ هو حاصل قسمة $150$ على $7$ .' },
        { label: 'طول ضلع السباعي المنتظم بوحدة cm (محيطه $10$ cm)', options: ['$\\frac{10}{7}$', '$\\frac{7}{10}$', '$10 \\times 7$'], correct: 0, correction: 'الأضلاع السبعة متساوية: طول الضلع هو حاصل قسمة $10$ على $7$ ، أي $1{,}42\\ldots$ ولا تنتهي القسمة.' },
        { label: 'كتلة العلبة الواحدة بالكيلوغرام، كسرًا ثم عشريًا', options: ['$\\frac{3}{12} = \\frac{1}{4} = 0{,}25$', '$\\frac{12}{3} = 4$', '$\\frac{3}{12} = 0{,}3$'], correct: 0, correction: '$3 \\div 12 = 0{,}25$ لأنّ $12 \\times 0{,}25 = 3$ .' },
      ],
      explain: 'قسمة العدد $3$ على $12$ تنتهي فهي عشرية؛ أمّا قسمة $150$ على $7$ فلا تنتهي، فنكتفي بحصرها.',
    },
    commonError: 'اعتبار $21{,}43$ هي القيمة المضبوطة للثمن.',
  },
  {
    id: 'ex-3', source: src('now-27', 27, 'دوري الآن', 1), alsoSource: src('method-1', 27, 'طرائق', 1), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'أكمل: $63 \\div 2{,}1 = \\frac{63 \\times 10}{2{,}1 \\times 10} = \\frac{630}{21}$ ؛ ثم $\\frac{8{,}4}{0{,}12} = \\frac{\\ldots}{12}$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$\\frac{630}{21} =$', options: ['$30$', '$3$', '$300$'], correct: 0, correction: '$21 \\times 30 = 630$ .' },
        { label: 'الحدّان بعد الضرب في العدد المناسب: $\\frac{\\ldots}{12}$', options: ['$\\frac{84}{12}$', '$\\frac{840}{12}$', '$\\frac{8{,}4}{12}$'], correct: 1, correction: 'في $0{,}12$ رقمان بعد الفاصلة: نضرب في $100$ فنجد $\\frac{840}{12}$ .' },
        { label: '$\\frac{840}{12} =$', options: ['$7$', '$70$', '$700$'], correct: 1, correction: '$12 \\times 70 = 840$ .' },
      ],
      explain: 'عدد الأرقام بعد الفاصلة في القاسم يحدّد القوّة: رقم واحد $\\to 10$ ، رقمان $\\to 100$ .',
    },
    commonError: 'الضرب في $10$ بدل $100$ حين يكون في القاسم رقمان بعد الفاصلة.',
  },
  {
    id: 'ex-4', source: src('ex-2', 30, 'أوظّف تعلّماتي', 2), alsoSource: src('ex-1', 30, 'أوظّف تعلّماتي', 1), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'أجب بصحيح أو خاطئ.',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: '$\\frac{3}{8} = 0{,}375$ .', answer: true, why: '$8 \\times 0{,}375 = 3$ .' },
        { text: '$\\frac{2}{3} = 0{,}66$ .', answer: false, why: '$3 \\times 0{,}66 = 1{,}98$ وليس $2$ : $0{,}66$ قيمة مقرّبة فقط.' },
        { text: '$\\frac{9}{4} = 2{,}25$ .', answer: true, why: '$4 \\times 2{,}25 = 9$ .' },
        { text: '$\\frac{5}{11} = 0{,}45$ .', answer: false, why: '$11 \\times 0{,}45 = 4{,}95$ وليس $5$ : $\\frac{5}{11} = 0{,}4545\\ldots$ لا تنتهي.' },
      ],
    },
    commonError: 'كتابة قيمة مقرّبة والمساواة معها كأنّها القيمة المضبوطة.',
  },
  {
    id: 'ex-5', source: src('now-29', 29, 'دوري الآن', 1), alsoSource: src('deep-35', 34, 'أتعمّق', 35), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب $3{,}6 \\div 0{,}9$ و $9{,}1 \\div 3{,}5$ . ونعلم أنّ $4416 \\div 23 = 192$ : استنتج $441{,}6 \\div 2{,}3$ و $44{,}16 \\div 0{,}23$ و $4416 \\div 0{,}23$ .',
    interaction: 'batch',
    question: {
      rows: [
        { label: '$3{,}6 \\div 0{,}9$', options: ['$4$', '$0{,}4$', '$40$'], correct: 0, correction: '$\\frac{36}{9} = 4$ .' },
        { label: '$9{,}1 \\div 3{,}5$', options: ['$2{,}6$', '$26$', '$0{,}26$'], correct: 0, correction: '$\\frac{91}{35} = 2{,}6$ لأنّ $35 \\times 2{,}6 = 91$ .' },
        { label: '$441{,}6 \\div 2{,}3$', options: ['$192$', '$19{,}2$', '$1920$'], correct: 0, correction: 'ضربنا الحدّين في $10$ : $\\frac{4416}{23} = 192$ .' },
        { label: '$44{,}16 \\div 0{,}23$', options: ['$192$', '$19{,}2$', '$19200$'], correct: 0, correction: 'ضربنا الحدّين في $100$ : $\\frac{4416}{23} = 192$ .' },
        { label: '$4416 \\div 0{,}23$', options: ['$19200$', '$192$', '$1920$'], correct: 0, correction: 'ضربنا الحدّين في $100$ : $\\frac{441600}{23} = 19200$ .' },
      ],
      explain: 'ضرب الحدّين في العدد نفسه لا يغيّر حاصل القسمة؛ أمّا ضرب حدّ واحد فيغيّره.',
    },
    commonError: 'ضرب القاسم وحده في $10$ أو $100$ ثم قسمة المقسوم كما هو.',
  },
  {
    id: 'ex-6', source: src('deep-38', 34, 'أتعمّق', 38), alsoSource: [src('ex-3', 30, 'أوظّف تعلّماتي', 3), src('ex-4', 30, 'أوظّف تعلّماتي', 4)], learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'أجب بصحيح أو خاطئ، بحساب كلّ حاصل قسمة.',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: '$\\frac{543}{200}$ محصور بين $2{,}71$ و $2{,}72$ .', answer: true, why: '$543 \\div 200 = 2{,}715$ .' },
        { text: '$\\frac{19}{7}$ محصور بين $2{,}71$ و $2{,}72$ .', answer: true, why: '$19 \\div 7 = 2{,}714\\ldots$ ، وهو بين $2{,}71$ و $2{,}72$ .' },
        { text: '$\\frac{87}{32}$ محصور بين $2{,}71$ و $2{,}72$ .', answer: true, why: '$87 \\div 32 = 2{,}71875$ .' },
        { text: '$\\frac{27}{10}$ محصور بين $2{,}71$ و $2{,}72$ .', answer: false, why: '$27 \\div 10 = 2{,}7$ وهو أصغر من $2{,}71$ .' },
        { text: '$\\frac{11}{4}$ محصور بين $2{,}71$ و $2{,}72$ .', answer: false, why: '$11 \\div 4 = 2{,}75$ وهو أكبر من $2{,}72$ .' },
        { text: 'على نصف مستقيم مدرّج يقع $\\frac{19}{7}$ بين التدريجتين $2$ و $3$ .', answer: true, why: '$19 \\div 7 = 2{,}714\\ldots$ وهو بين $2$ و $3$ .' },
        { text: 'على نصف المستقيم نفسه يقع $\\frac{4}{3}$ بين التدريجتين $2$ و $3$ .', answer: false, why: '$4 \\div 3 = 1{,}333\\ldots$ وهو بين $1$ و $2$ .' },
      ],
    },
    commonError: 'الحكم بالشكل لا بحساب حاصل القسمة.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
