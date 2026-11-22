/**
 * Les exercices du درس « الكسور العشرية والكتابة العشرية » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres contextes, autres nombres,
 * la même compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il
 * remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` est muet). Toutes les clés sont recalculées en
 * fractions EXACTES dans ./content.test.js, et chaque distracteur y est vérifié FAUX.
 * Destinations (docs/sources/1am/unit1/extraction.json) : act-2, act-3, ex-4 … ex-14 (②–④ pour ex-12), ex-26, ex-27, ex-28 → module 5 ;
 * أقوّم تعلّماتي 2, 3, 4, 5, 6 et 13 → le إختبار أولي / les exercices (self-6).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '1am_kusur-ashriya-kitaba_P1',
  P2: '1am_kusur-ashriya-kitaba_P2',
  P3: '1am_kusur-ashriya-kitaba_P3',
  P4: '1am_kusur-ashriya-kitaba_P4',
};

const T = (s) => `$${s}$`;
const fr = (n, d) => T(`\\frac{${n}}{${d}}`);
/** Place la bonne réponse à une position différente d'une ligne à l'autre (rotation déterministe ; le kit ne mélange pas). */
/** Un nombre nu (« 3,8 », « 640 ») devient une île mathématique LTR avec la virgule décimale du manuel (`{,}`). */
const num = (o) => (typeof o === 'string' && /^[\d,{}\u00a0 ]+$/.test(o) ? `$${o.replace(/(\d),(\d)/g, '$1{,}$2')}$` : o);
const vary = (rows) => rows.map((r, i) => {
  const options = r.options.map(num);
  const n = options.length; const k = i % n;
  return { ...r, options: [...options.slice(n - k), ...options.slice(0, n - k)], correct: (r.correct + k) % n };
});

export const EXERCISES = [
  {
    id: 'act-2', source: src('act-2', 9, 'اكتشف'), cites: [src('ex-4', 17, 'أتمرّن')], learningPointId: LP.P1, difficulty: 'facile', figures: 'act-2',
    statement: 'صفيحة الزليج مئة بلاطة، وهي وحدة المساحة. لوّنت منى أجزاءً من ثلاث صفائح كما ترى. عبّر عن الجزء الملوّن بكسر عشري مقامه 100.',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: 'الصفيحة A', options: [fr(40, 100), fr(4, 100), fr(40, 10)], correct: 0, correction: '4 أعمدة × 10 بلاطات = 40 بلاطة من 100: $\\frac{40}{100}=\\frac{4}{10}$ .' },
        { label: 'الصفيحة B', options: [fr(27, 100), fr(27, 10), fr(72, 100)], correct: 0, correction: 'عمودان (20 بلاطة) وسبع بلاطات: 27 بلاطة من 100.' },
        { label: 'الصفيحتان C معًا', options: [fr(163, 100), fr(63, 100), fr(163, 10)], correct: 0, correction: 'صفيحة كاملة (100 بلاطة) وستة أعمدة (60) وثلاث بلاطات: 163 بلاطة، أي $\\frac{163}{100}=1+\\frac{6}{10}+\\frac{3}{100}$ .' },
      ]),
      explain: 'عدد البلاطات الملوّنة في البسط، وعدد بلاطات الصفيحة الواحدة (100) في المقام.',
    },
    commonError: 'عدّ الأعمدة وحدها فكتابة $\\frac{4}{100}$ للعمود الأربعة.',
  },
  {
    id: 'act-3', source: src('act-3', 9, 'اكتشف'), cites: [src('ex-9', 17, 'أتمرّن')], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'اكتب الكتابة العشرية (بالفاصلة) لكل كسر عشري:',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: fr(472, 100), options: [T('4{,}72'), T('47{,}2'), T('0{,}472')], correct: 0, correction: 'المقام 100 (صفران): رقمان بعد الفاصلة، $\\frac{472}{100}=4{,}72$ .' },
        { label: fr(83, 10), options: [T('8{,}3'), T('0{,}83'), T('83{,}0')], correct: 0, correction: 'المقام 10: رقم واحد بعد الفاصلة، $\\frac{83}{10}=8{,}3$ .' },
        { label: fr(5, 100), options: [T('0{,}05'), T('0{,}5'), T('0{,}005')], correct: 0, correction: 'رقمان بعد الفاصلة، والبسط 5 رقم واحد: نضيف صفرًا، $\\frac{5}{100}=0{,}05$ .' },
        { label: fr(3908, 1000), options: [T('3{,}908'), T('39{,}08'), T('390{,}8')], correct: 0, correction: 'المقام 1000: ثلاثة أرقام بعد الفاصلة، $\\frac{3908}{1000}=3{,}908$ .' },
        { label: fr(7, 1000), options: [T('0{,}007'), T('0{,}07'), T('0{,}7')], correct: 0, correction: 'ثلاثة أرقام بعد الفاصلة، فنضيف صفرين: $\\frac{7}{1000}=0{,}007$ .' },
      ]),
      explain: 'نعدّ أصفار المقام، ثم نضع بقدرها أرقامًا بعد الفاصلة (ونضيف أصفارًا إن لزم).',
    },
    commonError: 'كتابة $\\frac{5}{100}$ على أنّه $0{,}5$.',
  },
  {
    id: 'ex-10', source: src('ex-10', 17, 'أتمرّن'), cites: [src('now-12', 12, 'دوري الآن')], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'اكتب كل عدد على شكل كسر عشري، ثم أتمّ المساويات بالعدد المناسب:',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('34{,}56'), options: [fr(3456, 100), fr(3456, 10), fr(3456, 1000)], correct: 0, correction: 'رقمان بعد الفاصلة: المقام 100، والبسط 3456.' },
        { label: T('6{,}2'), options: [fr(62, 10), fr(62, 100), fr(6, 2)], correct: 0, correction: 'رقم واحد بعد الفاصلة: المقام 10، $6{,}2=\\frac{62}{10}$ .' },
        { label: T('0{,}208'), options: [fr(208, 1000), fr(208, 100), fr(28, 1000)], correct: 0, correction: 'ثلاثة أرقام بعد الفاصلة: المقام 1000، والصفر الأوسط يبقى: $0{,}208=\\frac{208}{1000}$ .' },
        { label: T('15=\\frac{\\ldots}{10}'), options: ['150', '15', '1500'], correct: 0, correction: '$15=\\frac{150}{10}$ لأنّ $\\frac{150}{10}=15$ .' },
        { label: T('0{,}03=\\frac{\\ldots}{100}'), options: ['3', '30', '300'], correct: 0, correction: '$0{,}03=\\frac{3}{100}$ : ثلاث بلاطات من مائة.' },
        { label: T('43{,}5=\\frac{\\ldots}{1000}'), options: ['43500', '4350', '435'], correct: 0, correction: '$43{,}5=43{,}500=\\frac{43500}{1000}$ .' },
      ]),
      explain: 'عدد الأرقام بعد الفاصلة هو عدد أصفار المقام؛ والبسط هو العدد بلا فاصلة.',
    },
    commonError: 'مقام لا يوافق عدد الأرقام بعد الفاصلة: $34{,}56=\\frac{3456}{10}$ .',
  },
  {
    id: 'ex-6', source: src('ex-6', 17, 'أتمرّن'), cites: [src('ex-5', 17, 'أتمرّن'), src('ex-7', 17, 'أتمرّن')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'أتمّ كل مساواة، أو اكتب العدد على شكل كسر عشري، أو على شكل مجموع عدد طبيعي وكسر عشري:',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('\\frac{7}{10}=\\frac{\\ldots}{100}'), options: ['70', '7', '700'], correct: 0, correction: 'كل عُشر عشرة أجزاء من مائة: $\\frac{7}{10}=\\frac{70}{100}$ .' },
        { label: T('\\frac{58}{100}=\\frac{\\ldots}{10}+\\frac{\\ldots}{100}'), options: ['5 و 8', '58 و 0', '8 و 5'], correct: 0, correction: '58 جزءًا من مائة: 5 أعشار و8 أجزاء من مائة، $\\frac{58}{100}=\\frac{5}{10}+\\frac{8}{100}$ .' },
        { label: T('6+\\frac{3}{10}'), options: [fr(63, 10), fr(9, 10), fr(603, 10)], correct: 0, correction: '$6=\\frac{60}{10}$ ، إذن $6+\\frac{3}{10}=\\frac{63}{10}$ .' },
        { label: T('12+\\frac{5}{1000}'), options: [fr(12005, 1000), fr(1205, 1000), fr(125, 1000)], correct: 0, correction: '$12=\\frac{12000}{1000}$ ، إذن $12+\\frac{5}{1000}=\\frac{12005}{1000}$ .' },
        { label: fr(43, 10), options: [T('4+\\frac{3}{10}'), T('40+\\frac{3}{10}'), T('4+\\frac{3}{100}')], correct: 0, correction: '43 عُشرًا هي 4 وحدات و3 أعشار: $\\frac{43}{10}=4+\\frac{3}{10}$ .' },
        { label: fr(3406, 1000), options: [T('3+\\frac{406}{1000}'), T('34+\\frac{6}{1000}'), T('3+\\frac{46}{1000}')], correct: 0, correction: '1000 جزء من ألف تكوّن وحدة: $\\frac{3406}{1000}=3+\\frac{406}{1000}$ .' },
      ]),
      explain: 'الوحدة تساوي 10 أعشار أو 100 جزء من مائة أو 1000 جزء من ألف.',
    },
    commonError: 'جمع البسطين مباشرة: $6+\\frac{3}{10}=\\frac{9}{10}$ .',
  },
  {
    id: 'ex-8', source: src('ex-8', 17, 'أتمرّن'), cites: [src('self-6', 19, 'أقوّم تعلّماتي')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اكتب الكتابة العشرية لكل مجموع (قد تكون حدوده غير مرتّبة):',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('5+\\frac{3}{10}'), options: [T('5{,}3'), T('5{,}03'), T('53')], correct: 0, correction: 'الرقم 3 في مرتبة الأعشار: $5{,}3$ .' },
        { label: T('13+\\frac{9}{1000}'), options: [T('13{,}009'), T('13{,}9'), T('13{,}09')], correct: 0, correction: 'الرقم 9 في مرتبة الأجزاء من ألف (الثالثة بعد الفاصلة): $13{,}009$ .' },
        { label: T('25+\\frac{3}{100}'), options: [T('25{,}03'), T('25{,}3'), T('253')], correct: 0, correction: 'الرقم 3 في مرتبة الأجزاء من مائة: $25{,}03$ .' },
        { label: T('5\\times100+3\\times1000+\\frac{2}{10}+6'), options: [T('3506{,}2'), T('536{,}2'), T('3560{,}2')], correct: 0, correction: 'قيمة الحدّ تتبع مرتبته لا مكانه: $3000+500+6+0{,}2=3506{,}2$ .' },
        { label: T('2\\times10+8\\times1000+9\\times0{,}1+5\\times0{,}001'), options: [T('8020{,}905'), T('28{,}905'), T('8029{,}5')], correct: 0, correction: '$8000+20+0{,}9+0{,}005=8020{,}905$ ؛ ولا حدّ للمئات: رقم المئات 0.' },
      ]),
      explain: 'نضع كل حدّ في مرتبته، ونملأ المراتب التي لا حدّ فيها بأصفار.',
    },
    commonError: 'قراءة الحدود بالترتيب الذي كُتبت به.',
  },
  {
    id: 'ex-11', source: src('ex-11', 17, 'أتمرّن'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'أعد كتابة كل عدد بحذف الأصفار غير الضرورية:',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('3{,}60'), options: [T('3{,}6'), T('3{,}06'), T('36')], correct: 0, correction: 'الصفر الأخير بعد الفاصلة لا يغيّر العدد.' },
        { label: T('012{,}4'), options: [T('12{,}4'), T('1{,}24'), T('120{,}4')], correct: 0, correction: 'الصفر الأول قبل الجزء الصحيح لا يغيّر العدد.' },
        { label: T('0{,}500'), options: [T('0{,}5'), T('0{,}05'), T('5')], correct: 0, correction: 'نحذف الصفرين الأخيرين: $0{,}500=0{,}5$ .' },
        { label: T('80{,}0'), options: [T('80'), T('8'), T('800')], correct: 0, correction: 'الجزء العشري كله صفر: يبقى الجزء الصحيح 80.' },
        { label: T('40{,}050'), options: [T('40{,}05'), T('4{,}005'), T('40{,}5')], correct: 0, correction: 'نحذف الصفر الأخير فقط؛ الصفر الذي يليه الرقم 5 يبقى.' },
        { label: T('105{,}00'), options: [T('105'), T('15'), T('1{,}05')], correct: 0, correction: 'صفران بعد الفاصلة يُحذفان، وصفر 105 في الوسط يبقى.' },
      ]),
      explain: 'نحذف الأصفار على الطرف: بعد آخر رقم غير معدوم في الجزء العشري، وقبل أول رقم غير معدوم في الجزء الصحيح.',
    },
    commonError: 'حذف الصفر الأوسط: $40{,}050\\to40{,}5$ .',
  },
  {
    id: 'ex-12', source: src('ex-12', 17, 'أتمرّن'), cites: [src('ex-13', 17, 'أتمرّن'), src('ex-14', 17, 'أتمرّن')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'من المفكوك إلى العدد، ومن العدد إلى مفكوكه النموذجي:',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('4\\times100+7\\times10+3+\\frac{6}{10}+\\frac{2}{100}'), options: [T('473{,}62'), T('4073{,}62'), T('473{,}26')], correct: 0, correction: '$400+70+3+0{,}6+0{,}02=473{,}62$ .' },
        { label: T('9\\times10+5+\\frac{4}{10}+\\frac{2}{100}+\\frac{9}{1000}'), options: [T('95{,}429'), T('95{,}942'), T('9{,}5429')], correct: 0, correction: '$90+5+0{,}4+0{,}02+0{,}009=95{,}429$ .' },
        { label: T('6+7\\times0{,}1+1\\times0{,}01+4\\times0{,}001'), options: [T('6{,}714'), T('6{,}741'), T('67{,}14')], correct: 0, correction: '$6+0{,}7+0{,}01+0{,}004=6{,}714$ .' },
        { label: T('805{,}07'), options: [T('8\\times100+5+\\frac{7}{100}'), T('8\\times100+5+\\frac{7}{10}'), T('8\\times100+5\\times10+\\frac{7}{100}')], correct: 0, correction: 'لا حدّ للعشرات (رقمها 0)، والرقم 7 في مرتبة الأجزاء من مائة.' },
        { label: T('49{,}302'), options: [T('4\\times10+9+\\frac{3}{10}+\\frac{2}{1000}'), T('4\\times10+9+\\frac{3}{10}+\\frac{2}{100}'), T('4\\times10+9+\\frac{3}{100}+\\frac{2}{1000}')], correct: 0, correction: 'الرقم 3 للأعشار، ولا حدّ للأجزاء من مائة (رقمها 0)، والرقم 2 للأجزاء من ألف.' },
      ]),
      explain: 'لكل رقم غير معدوم حدّ في المجموع، وقيمته تعيّنها مرتبته.',
    },
    commonError: 'وضع حدّ للصفر أو وضع الرقم في المرتبة المجاورة.',
  },
  {
    id: 'ex-26', source: src('ex-26', 18, 'أتمرّن'), cites: [src('now-14', 14, 'دوري الآن')], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'احسب ذهنيًا:',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('6{,}4\\times100'), options: ['640', '64', '6400'], correct: 0, correction: 'الفاصلة مرتبتين نحو اليمين مع صفر: $640$ .' },
        { label: T('0{,}38\\times1000'), options: ['380', '3{,}8', '38'], correct: 0, correction: 'ثلاث مراتب نحو اليمين مع صفر: $380$ .' },
        { label: T('5{,}9\\times10'), options: ['59', '5{,}90', '590'], correct: 0, correction: 'مرتبة نحو اليمين: $59$ ؛ و $5{,}90$ هو $5{,}9$ نفسه.' },
        { label: T('72\\div10'), options: ['7{,}2', '720', '0{,}72'], correct: 0, correction: 'مرتبة نحو اليسار: $7{,}2$ .' },
        { label: T('4{,}6\\div100'), options: ['0{,}046', '0{,}46', '0{,}0046'], correct: 0, correction: 'مرتبتان نحو اليسار مع صفر: $0{,}046$ .' },
        { label: T('805\\div1000'), options: ['0{,}805', '8{,}05', '0{,}0805'], correct: 0, correction: 'ثلاث مراتب نحو اليسار: $0{,}805$ .' },
        { label: T('0{,}047\\times100'), options: ['4{,}7', '0{,}47', '47'], correct: 0, correction: 'مرتبتان نحو اليمين: $4{,}7$ .' },
        { label: T('15\\div10\\,000'), options: ['0{,}0015', '0{,}015', '0{,}00015'], correct: 0, correction: 'أربع مراتب نحو اليسار مع أصفار: $0{,}0015$ .' },
      ]),
      explain: 'الضرب إلى اليمين والقسمة إلى اليسار، بقدر أصفار 10 أو 100 أو 1000 أو 10 000.',
    },
    commonError: 'إضافة صفر أو حذفه بدل إزاحة الفاصلة.',
  },
  {
    id: 'ex-27', source: src('ex-27', 18, 'أتمرّن'), cites: [src('ex-28', 18, 'أتمرّن')], learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'مفتاح الفاصلة في آلة زميلك معطّل. كيف يعرض كل عدد على الشاشة؟ وكيف نعبّر بالوحدة المطلوبة؟',
    interaction: 'batch',
    question: {
      rows: vary([
        { label: T('0{,}45'), options: ['يكتب 45 ثم يقسم على 100', 'يكتب 45 ثم يضرب في 100', 'يكتب 45 ثم يقسم على 10'], correct: 0, correction: '$45\\div100=0{,}45$ .' },
        { label: T('12{,}305'), options: ['يكتب 12305 ثم يقسم على 1000', 'يكتب 12305 ثم يقسم على 100', 'يكتب 12305 ثم يضرب في 1000'], correct: 0, correction: 'ثلاثة أرقام بعد الفاصلة: $12305\\div1000=12{,}305$ .' },
        { label: T('2450\\,\\mathrm{g}\\to\\mathrm{kg}'), options: ['2,45', '24,5', '0,245'], correct: 0, correction: '1 كغ = 1000 غ: $2450\\div1000=2{,}45$ .' },
        { label: T('340\\,\\mathrm{cm}\\to\\mathrm{m}'), options: ['3,4', '34', '0,34'], correct: 0, correction: '1 م = 100 سم: $340\\div100=3{,}4$ .' },
        { label: T('7\\,\\mathrm{kg}\\ 30\\,\\mathrm{g}\\to\\mathrm{kg}'), options: ['7,03', '7,3', '7,003'], correct: 0, correction: '$30\\,\\mathrm{g}=0{,}03\\,\\mathrm{kg}$ ، إذن $7{,}03$ .' },
      ]),
      explain: 'القسمة على 10 أو 100 أو 1000 تضع الفاصلة بعد الأرقام المناسبة، وهي أيضًا تحويل الوحدات الصغيرة إلى كبيرة.',
    },
    commonError: 'الخلط بين القسمة على 10 والقسمة على 100 عند تحويل الوحدات.',
  },
];

/** « أقوّم تعلّماتي » 2 – 5 et 13 (p. 19) — repris dans le إختبار أولي (module 9) ; self-6 est cité par ex-8. */
export const SELF = {
  2: { source: src('self-2', 19, 'أقوّم تعلّماتي', 2) },
  3: { source: src('self-3', 19, 'أقوّم تعلّماتي', 3) },
  4: { source: src('self-4', 19, 'أقوّم تعلّماتي', 4) },
  5: { source: src('self-5', 19, 'أقوّم تعلّماتي', 5) },
  13: { source: src('self-13', 19, 'أقوّم تعلّماتي', 13) },
};

/**
 * Les cinq épreuves du إختبار أولي (module 9), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque
 * distracteur FAUX. `kind` dit ce que le test recalcule ; `lp` est la الكفاءة principale de l'épreuve.
 */
export const FINAL = [
  { id: 'E1', skill: 'kasr', lp: LP.P1, source: null, kind: 'equal', ref: '\\frac{3}{10}', stem: 'أيّ هذه الكسور يساوي $\\frac{3}{10}$ ؟',
    options: ['$\\frac{30}{100}$', '$\\frac{3}{100}$', '$\\frac{30}{10}$', '$\\frac{300}{10}$'], correct: 0, cols: 2,
    explain: 'كل عُشر عشرة أجزاء من مائة: $\\frac{3}{10}=\\frac{30}{100}$ . أمّا $\\frac{3}{100}$ فأصغر بعشر مرّات، و $\\frac{30}{10}=3$ .' },
  { id: 'E2', skill: 'kitaba', lp: LP.P2, source: SELF[3].source, kind: 'equal', ref: '\\frac{6407}{1000}', stem: 'الكتابة العشرية للكسر $\\frac{6407}{1000}$ هي:',
    options: ['$6{,}407$', '$64{,}07$', '$640{,}7$', '$6{,}47$'], correct: 0, cols: 2,
    explain: 'المقام 1000 فيه ثلاثة أصفار، فثلاثة أرقام بعد الفاصلة: $\\frac{6407}{1000}=6{,}407$ .' },
  { id: 'E3', skill: 'mafkuk', lp: LP.P3, source: SELF[5].source, kind: 'equal', ref: '306{,}208', stem: 'المفكوك النموذجي للعدد $306{,}208$ هو:',
    options: ['$3\\times100+6+\\frac{2}{10}+\\frac{8}{1000}$', '$3\\times100+6+\\frac{2}{10}+\\frac{8}{100}$', '$3\\times100+6\\times10+\\frac{2}{10}+\\frac{8}{1000}$', '$3\\times100+6+\\frac{2}{100}+\\frac{8}{1000}$'], correct: 0, cols: 1,
    explain: 'رقم العشرات 0 فلا حدّ لها، والرقم 6 للآحاد، و 2 للأعشار، و 0 للأجزاء من مائة، و 8 للأجزاء من ألف.' },
  { id: 'E4', skill: 'azaha', lp: LP.P4, source: SELF[13].source, kind: 'equal', ref: '34{,}2\\div100', stem: 'احسب ذهنيًا: $34{,}2\\div100$',
    options: ['$0{,}342$', '$3{,}42$', '$0{,}0342$', '$342$'], correct: 0, cols: 2,
    explain: 'القسمة على 100 تزيح الفاصلة مرتبتين نحو اليسار: $34{,}2\\div100=0{,}342$ .' },
  { id: 'E5', skill: 'kitaba', lp: LP.P2, source: SELF[4].source, kind: 'notEqual', ref: '8{,}5', stem: 'أيّ هذه الكتابات لا تمثّل العدد $8{,}5$ ؟',
    options: ['$8{,}05$', '$8{,}50$', '$08{,}5$', '$8{,}500$'], correct: 0, cols: 2,
    explain: '$8{,}50$ و $08{,}5$ و $8{,}500$ هي $8{,}5$ نفسه (أصفار على الطرفين). أمّا $8{,}05$ ففيه صفر يحفظ مكان الأعشار: عدد آخر.' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
