/**
 * Les exercices du درس « البحث عن أعداد ناقصة » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres contextes, autres nombres, la même compétence). Chaque exercice porte en `source`
 * l'élément du manuel dont il est tiré ; jamais montré à l'élève (`SourceTag` est muet). Toutes les clés sont recalculées en arithmétique rationnelle EXACTE dans ./content.test.js
 * (BigInt, centièmes), et chaque distracteur y est vérifié FAUX.
 * Destinations (docs/sources/1am/unit6/extraction.json) : act-1 → ex-1 ; ex-15 → ex-2 ; ex-16 → ex-3 ; now-82 → ex-4 ; ex-17 → ex-5 ; deep-7 → ex-7 ; la vérification (method-1) → ex-6 ; self-5 → le إختبار أولي (E5).
 La مسألة 2 reprend deep-1 (mensualités), la مسألة 3 deep-6 et ex-18 (le programme à deux cartes remonté).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '1am_bahth-adad-naqisa_P1',
  P2: '1am_bahth-adad-naqisa_P2',
  P3: '1am_bahth-adad-naqisa_P3',
};

const T = (s) => `$${s}$`;
/** Une ligne : `right` est la bonne option (placée en tête, `correct: 0`) ; les autres sont des erreurs réelles. */
const row = (label, right, wrong, correction) => ({ label, options: [right, ...wrong], correct: 0, correction });

export const EXERCISES = [
  {
    id: 'ex-1', source: src('act-1', 79, 'اكتشف', 1), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'في مخبزة الحيّ ثلاث وضعيات. نرمز بـ □ إلى العدد المجهول في كلّ منها. اختر المساواة التي تترجم كلّ وضعية:',
    interaction: 'batch',
    question: {
      rows: [
        row('وُزّعت 48 قطعة حلوى على 6 علب فيها العدد نفسه من القطع', T('6\\times\\square=48'), [T('48-\\square=6'), T('\\square+6=48')], 'العلب الست متساوية: عدد القطع في كلّ علبة □ ، فجداء 6 في □ يساوي 48.'),
        row('في سلّة 48 قطعة حلوى، أخذنا منها عددًا فبقيت 6 قطع', T('48-\\square=6'), [T('6\\times\\square=48'), T('\\square-6=48')], 'المأخوذ □ يُنقص من 48 فيبقى 6.'),
        row('في علبة عدد من القطع، وبعد أن أضفنا إليها 6 قطع صارت فيها 48 قطعة', T('\\square+6=48'), [T('6\\times\\square=48'), T('\\square-6=48')], 'العدد الأوّل □ زاد عليه 6 فصار 48.'),
        row('أيّ الوضعيتين لهما العدد الناقص نفسه؟', 'الثانية والثالثة', ['الأولى والثانية', 'الأولى والثالثة'], 'الثانية: $48-6=42$ والثالثة: $48-6=42$ ؛ أمّا الأولى فـ $48\\div 6=8$ .'),
      ],
      explain: 'نقرأ الوضعية ثمّ نكتب المساواة التي فيها □ ؛ مساواتان مختلفتان قد يكون لهما العدد الناقص نفسه.',
    },
    commonError: 'اختيار مساواة من الأعداد نفسها دون قراءة معنى الوضعية.',
  },
  {
    id: 'ex-2', source: src('ex-15', 84, 'البحث عن أعداد ناقصة', 15), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'عيّن العدد الناقص في كلّ مساواة (استعمل العملية العكسية):',
    interaction: 'batch',
    question: {
      rows: [
        row(T('47+\\square=215'), T('168'), [T('262'), T('178')], '$215-47=168$ ، ونتحقّق: $47+168=215$ .'),
        row(T('\\square-9=62'), T('71'), [T('53'), T('70')], 'في $\\square-9=62$ نجمع: $62+9=71$ ، ونتحقّق: $71-9=62$ .'),
        row(T('13{,}4=8+\\square'), T('5{,}4'), [T('21{,}4'), T('5{,}04')], '$13{,}4-8=5{,}4$ ، ونتحقّق: $8+5{,}4=13{,}4$ .'),
        row(T('\\square-(2+5{,}35)=4'), T('11{,}35'), [T('9{,}35'), T('3{,}35')], '$2+5{,}35=7{,}35$ ثمّ $\\square=4+7{,}35=11{,}35$ ، ونتحقّق: $11{,}35-7{,}35=4$ .'),
      ],
      explain: 'في المجموع نطرح المعلوم من الناتج، وفي $\\square-a=b$ نجمع، ونتحقّق بالتعويض.',
    },
    commonError: 'جمع الناتج مع المعلوم في مجموع، أو طرحه في □ − a = b.',
  },
  {
    id: 'ex-3', source: src('ex-16', 84, 'البحث عن أعداد ناقصة', 16), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'عيّن العدد الناقص في كلّ جداء (قد لا يكون الناتج عددًا طبيعيًّا):',
    interaction: 'batch',
    question: {
      rows: [
        row(T('10\\times\\square=47'), T('4{,}7'), [T('470'), T('37')], '$47\\div 10=4{,}7$ ، ونتحقّق: $10\\times 4{,}7=47$ .'),
        row(T('\\square\\times 4=30'), T('7{,}5'), [T('120'), T('26')], '$30\\div 4=7{,}5$ ، ونتحقّق: $7{,}5\\times 4=30$ .'),
        row(T('96=3\\times\\square'), T('32'), [T('288'), T('93')], '$96\\div 3=32$ ، ونتحقّق: $3\\times 32=96$ .'),
        row(T('210=4\\times\\square'), T('52{,}5'), [T('840'), T('206')], '$210\\div 4=52{,}5$ ، ونتحقّق: $4\\times 52{,}5=210$ .'),
      ],
      explain: 'في الجداء نقسم الناتج على العدد المعلوم ؛ والقسمة قد تعطي عددًا عشريًّا.',
    },
    commonError: 'ضرب الناتج في العدد المعلوم، أو طرح أحدهما من الآخر.',
  },
  {
    id: 'ex-4', source: src('now-82', 82, 'دوري الآن'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'عيّن العدد الناقص في كلّ حالة، ثمّ تحقّق من النتيجة الأخيرة:',
    interaction: 'batch',
    question: {
      rows: [
        row(T('\\square-24{,}7=51{,}36'), T('76{,}06'), [T('26{,}66'), T('76{,}16')], 'في $\\square-a=b$ نجمع: $51{,}36+24{,}7=76{,}06$ .'),
        row(T('\\square\\times 9=40'), T('\\frac{40}{9}'), [T('4{,}4'), T('360')], '$40\\div 9$ لا تتوقّف : الناتج كسر $\\frac{40}{9}$ ؛ و $4{,}4\\times 9=39{,}6$ لا $40$ .'),
        row('نعوّض $\\frac{40}{9}$ في المساواة السابقة: ' + T('\\frac{40}{9}\\times 9') + ' يساوي', T('40'), [T('360'), T('49')], '$\\frac{40}{9}\\times 9=40$ بالضبط ، فالعدد صحيح.'),
      ],
      explain: 'نجمع في □ − a = b ، ونقسم في الجداء، وإن لم تتوقّف القسمة كتبنا كسرًا ونتحقّق به.',
    },
    commonError: 'تقريب ناتج قسمة لا تتوقّف بعدد عشري واعتباره العدد الناقص.',
  },
  {
    id: 'ex-5', source: src('ex-17', 84, 'البحث عن أعداد ناقصة', 17), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'مستطيل مساحته 91 سم² وطوله 6,5 سم. نحسب مساحة المستطيل بجداء طوله في عرضه:',
    interaction: 'batch',
    question: {
      rows: [
        row('المساواة التي تترجم الوضعية (□ هو عرض المستطيل)', T('6{,}5\\times\\square=91'), [T('6{,}5+\\square=91'), T('91-\\square=6{,}5')], 'المساحة جداء الطول في العرض: $6{,}5\\times\\square=91$ .'),
        row('عرض المستطيل بالسنتيمتر', T('14'), [T('84{,}5'), T('591{,}5')], '$91\\div 6{,}5=14$ .'),
        row('نتحقّق: ' + T('6{,}5\\times 14') + ' يساوي', T('91'), [T('20{,}5'), T('84{,}5')], '$6{,}5\\times 14=91$ : المساحة المعلومة.'),
      ],
      explain: 'عرض المستطيل هو العدد الناقص في جداء: نقسم المساحة على الطول ونتحقّق بالضرب.',
    },
    commonError: 'طرح الطول من المساحة بدل قسمتها عليه.',
  },
  {
    id: 'ex-6', source: src('method-1', 82, 'أكتسب طرائق'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'تحقّق بالتعويض: اختر العدد الذي يجعل المساواة صحيحة في كلّ حالة:',
    interaction: 'batch',
    question: {
      rows: [
        row(T('\\square-7=25'), T('32'), [T('18'), T('31')], '$32-7=25$ ، أمّا $18-7=11$ و $31-7=24$ .'),
        row(T('4{,}5\\times\\square=18'), T('4'), [T('13{,}5'), T('81')], '$4{,}5\\times 4=18$ ، أمّا $4{,}5\\times 13{,}5=60{,}75$ و $4{,}5\\times 81=364{,}5$ .'),
        row(T('120-\\square=45'), T('75'), [T('165'), T('45')], '$120-75=45$ ، أمّا $120-45=75$ فهو ما يخرج حين نضع $45$ .'),
      ],
      explain: 'نضع العدد مكان □ ونحسب ؛ إن وجدنا الناتج المعلوم فالعدد صحيح.',
    },
    commonError: 'قبول عدد دون تعويضه في المساواة.',
  },
  {
    id: 'ex-7', source: src('deep-7', 86, 'البحث عن أعداد ناقصة', 7), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'حائط بلاطات من ثلاثة صفوف: في الأسفل ثلاث بلاطات، وفوقها بلاطتان، وفوقهما بلاطة واحدة. العدد المكتوب على كلّ بلاطة هو مجموع العددين المكتوبين على البلاطتين اللتين تحتها. على القمّة 46، وعلى البلاطة اليسرى من الصفّ الثاني 24، وعلى البلاطة اليمنى من الصفّ الأسفل 9.',
    interaction: 'batch',
    question: {
      rows: [
        row('العدد على البلاطة اليمنى من الصفّ الثاني', T('22'), [T('70'), T('15')], 'القمّة $46$ هي مجموع بلاطتي الصفّ الثاني: $24+\\square=46$ ، فـ $\\square=46-24=22$ .'),
        row('العدد على البلاطة الوسطى من الصفّ الأسفل', T('13'), [T('31'), T('15')], 'البلاطة اليمنى من الصفّ الثاني $22$ هي مجموع الوسطى و $9$ : $\\square+9=22$ ، فـ $\\square=13$ .'),
        row('العدد على البلاطة اليسرى من الصفّ الأسفل', T('11'), [T('13'), T('37')], 'البلاطة اليسرى من الصفّ الثاني $24$ هي مجموع اليسرى والوسطى: $\\square+13=24$ ، فـ $\\square=11$ .'),
      ],
      explain: 'كلّ بلاطة مجموع بلاطتين: نطرح المعلوم من مجموعها لنجد الناقصة، خطوة بعد خطوة.',
    },
    commonError: 'جمع العددين المعلومين بدل طرح أحدهما من المجموع.',
  },
];

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque distracteur FAUX.
 * `kind` dit ce que le test recalcule : `translate` (la bonne égalité a la même solution que la situation), `solve` (le nombre manquant de `a ⊕ □ = b`), `chain` (le nombre qui a produit 102 : n + 2n + 3n).
 */
export const FINAL = [
  { id: 'E1', skill: 'translate', lp: LP.P1, source: null, kind: 'translate', answer: 27, stem: 'اشترى سمير أقلامًا ثمّ أضاف إليها 8 أقلام فصار عنده 35 قلمًا. المساواة التي تترجم الوضعية (□ هو عدد الأقلام الأولى) هي:',
    options: ['$\\square+8=35$', '$\\square-8=35$', '$8\\times\\square=35$', '$8+35=\\square$'], correct: 0, cols: 2,
    explain: 'العدد الأوّل □ زاد عليه 8 فصار 35 : $\\square+8=35$ .' },
  { id: 'E2', skill: 'sum', lp: LP.P2, source: null, kind: 'solve', form: { op: 'add', a: '67', b: '150' }, stem: 'العدد الناقص في $67+\\square=150$ هو:',
    options: ['$83$', '$217$', '$73$', '$150$'], correct: 0, cols: 2,
    explain: 'في مجموع نطرح المعلوم من الناتج: $150-67=83$ ، ونتحقّق: $67+83=150$ .' },
  { id: 'E3', skill: 'diff', lp: LP.P2, source: null, kind: 'solve', form: { op: 'rsub', a: '120', b: '45' }, stem: 'العدد الناقص □ في $120-\\square=45$ هو:',
    options: ['$75$', '$165$', '$45$', '$85$'], correct: 0, cols: 2,
    explain: 'المطروح هو المجهول: $\\square=120-45=75$ ، ونتحقّق: $120-75=45$ .' },
  { id: 'E4', skill: 'prod', lp: LP.P3, source: null, kind: 'solve', form: { op: 'mul', a: '8', b: '30' }, stem: 'العدد الناقص في $8\\times\\square=30$ هو:',
    options: ['$3{,}75$', '$240$', '$22$', '$\\frac{8}{30}$'], correct: 0, cols: 2,
    explain: 'في جداء نقسم الناتج على المعلوم: $30\\div 8=3{,}75$ ، ونتحقّق: $8\\times 3{,}75=30$ .' },
  { id: 'E5', skill: 'check', lp: LP.P3, source: src('self-5', 85, 'أقوّم تعلّماتي', 5), kind: 'chain', total: 102, stem: 'جمعتُ عددًا وضعفه وثلاثة أمثاله فوجدتُ $102$ . العدد الذي بدأتُ به هو:',
    options: ['$17$', '$34$', '$71$', '$7$'], correct: 0, cols: 2,
    explain: 'العدد وضعفه وثلاثة أمثاله هي ستة أمثال العدد: $6\\times\\square=102$ فـ $\\square=17$ ؛ نتحقّق: $17+34+51=102$ .' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
