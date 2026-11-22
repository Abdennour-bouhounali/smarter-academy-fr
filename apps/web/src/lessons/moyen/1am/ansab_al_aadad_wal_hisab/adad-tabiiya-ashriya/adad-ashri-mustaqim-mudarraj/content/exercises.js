/**
 * Les exercices du درس « الأعداد العشرية ونصف المستقيم المدرّج » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres contextes, autres
 * nombres, la même compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres
 * éléments qu'il remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` est muet). Toutes les clés sont
 * recalculées en arithmétique EXACTE dans ./content.test.js, et chaque distracteur y est vérifié FAUX.
 * Destinations (docs/sources/1am/unit1/extraction.json) : act-4 (application), ex-15, ex-16 → module 4 ; أقوّم تعلّماتي 7 → le إختبار أولي
 * (module 8). Les flèches d'ex-16 sont des FIGURES de données (`halfLine`) : le module les dessine avec `NumberLine` (mode statique).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '1am_adad-ashri-mustaqim-mudarraj_P1',
  P2: '1am_adad-ashri-mustaqim-mudarraj_P2',
  P3: '1am_adad-ashri-mustaqim-mudarraj_P3',
};

/* ── Outils de rédaction (les clés sont re-vérifiées par le test, indépendamment) ──────────────────────────────────────────────────── */
const T = (s) => `$${s}$`;
const tex = (s) => String(s).replace(',', '{,}');
const nums = (a, b) => T(`${tex(a)}\\ ;\\ ${tex(b)}`);
/** Une ligne de lecture : les options sont des nombres décimaux en TeX, la clé est le premier. */
const read = (label, value, wrong, correction) => ({ label, options: [value, ...wrong].map((v) => T(tex(v))), correct: 0, correction });

export const EXERCISES = [
  {
    id: 'act-4', source: src('act-4', 10, 'اكتشف', 4), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'على نصف مستقيم مدرّج مبدؤه $O$ ، وحدته مقسّمة إلى عشرة أجزاء متساوية، أجب في كلّ حالة:',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'التباعد بين تدريجتين صغيرتين متتاليتين', options: [T('\\frac{1}{10}'), T('\\frac{1}{100}'), T('1')], correct: 0, correction: 'الوحدة مقسّمة إلى عشرة أجزاء متساوية: كلّ جزء $\\frac{1}{10}$ من الوحدة.' },
        { label: 'فاصلة نقطة تبعد عن $O$ بثلاث وحدات وخمس تدريجات صغيرة', options: [T('3{,}5'), T('5{,}3'), T('3{,}05')], correct: 0, correction: '$3+\\frac{5}{10}=3{,}5$ : الوحدات الكاملة قبل الفاصلة، والتدريجات الصغيرة بعدها.' },
        { label: 'لتعليم $F(2{,}5)$ نعدّ وحدتين من $O$ ثم نتقدّم', options: ['خمس تدريجات صغيرة', 'تدريجتين صغيرتين', 'خمس وحدات'], correct: 0, correction: 'رقم الأعشار 5 يعني خمس تدريجات صغيرة بعد العلامة 2 .' },
        { label: 'لتعليم $G(0{,}8)$ نبدأ من $O$ ونتقدّم', options: ['ثماني تدريجات صغيرة', 'وحدة واحدة ثم ثماني تدريجات', 'ثماني وحدات'], correct: 0, correction: 'الجزء الصحيح 0: لا وحدة كاملة، ثماني تدريجات صغيرة فقط.' },
        { label: 'فاصلة النقطة $L$ التي تبعد عن $O$ بـ $3+\\frac{2}{10}$ وحدة', options: [T('3{,}2'), T('3{,}02'), T('5')], correct: 0, correction: '$3+\\frac{2}{10}=3{,}2$ : اثنان من عشرة يكتبان رقمًا واحدًا بعد الفاصلة.' },
      ],
      explain: 'الوحدات الكاملة أوّلًا، ثم التدريجات الصغيرة، كلّ واحدة $0{,}1$ .',
    },
    commonError: 'قراءة تدريجات الأعشار كأنّها وحدات كاملة أو عكس الرقمين.',
  },
  {
    id: 'ex-15', source: src('ex-15', 18, 'أتمرّن', 15), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'لاحظ كلّ متتالية أعداد (من اليسار إلى اليمين) واختر العددين اللذين يكمّلانها بالخطوة نفسها:',
    interaction: 'batch',
    question: {
      rows: [
        { label: T('10\\ ;\\ 12\\ ;\\ 14\\ ;\\ \\ldots\\ ;\\ \\ldots'), options: [nums('16', '18'), nums('15', '16'), nums('16', '20')], correct: 0, correction: 'الخطوة 2 : $14+2=16$ ثم $16+2=18$ .' },
        { label: T('0\\ ;\\ 0{,}5\\ ;\\ 1\\ ;\\ \\ldots\\ ;\\ \\ldots'), options: [nums('1,5', '2'), nums('1,1', '1,2'), nums('2', '3')], correct: 0, correction: 'الخطوة $0{,}5$ : $1+0{,}5=1{,}5$ ثم $1{,}5+0{,}5=2$ .' },
        { label: T('1{,}05\\ ;\\ 1{,}08\\ ;\\ 1{,}11\\ ;\\ \\ldots\\ ;\\ \\ldots'), options: [nums('1,14', '1,17'), nums('1,12', '1,13'), nums('1,2', '1,3')], correct: 0, correction: 'الخطوة $0{,}03$ : $1{,}11+0{,}03=1{,}14$ ثم $1{,}17$ .' },
        { label: T('5{,}2\\ ;\\ 5{,}1\\ ;\\ 5\\ ;\\ \\ldots\\ ;\\ \\ldots'), options: [nums('4,9', '4,8'), nums('4,99', '4,98'), nums('5,1', '5,2')], correct: 0, correction: 'الأعداد تنقص بـ $0{,}1$ في كلّ مرّة: $5-0{,}1=4{,}9$ ثم $4{,}8$ .' },
        { label: T('2{,}96\\ ;\\ 2{,}98\\ ;\\ 3\\ ;\\ \\ldots\\ ;\\ \\ldots'), options: [nums('3,02', '3,04'), nums('3,2', '3,4'), nums('3,01', '3,02')], correct: 0, correction: 'الخطوة $0{,}02$ : بعد العلامة 3 : $3{,}02$ ثم $3{,}04$ .' },
        { label: T('0{,}7\\ ;\\ 0{,}9\\ ;\\ 1{,}1\\ ;\\ \\ldots\\ ;\\ \\ldots'), options: [nums('1,3', '1,5'), nums('1,2', '1,3'), nums('1,11', '1,13')], correct: 0, correction: 'الخطوة $0{,}2$ : $1{,}1+0{,}2=1{,}3$ ثم $1{,}5$ .' },
      ],
      explain: 'نجد الخطوة بالفرق بين عددين متتاليين، ثم نضيفها (أو نطرحها) من آخر عدد معلوم.',
    },
    commonError: 'الاعتقاد أنّ الخطوة تتغيّر عند المرور بعلامة طبيعية، أو أنّ $5{,}1$ بعد $5{,}2$ يعني الصعود.',
  },
  {
    id: 'ex-16a', source: src('ex-16', 18, 'أتمرّن', 16), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'هذا نصف مستقيم مدرّج من $0$ إلى $4$ ، بين كلّ علامتين كاملتين عشر تدريجات صغيرة. اكتب الأعداد التي تشير إليها الأسهم:',
    halfLine: { min: 0, max: 4, step: 0.1, labelEvery: 10, arrows: [{ label: 'A', value: '0,8' }, { label: 'B', value: '1,5' }, { label: 'C', value: '3,2' }] },
    interaction: 'batch',
    question: {
      rows: [
        read('فاصلة النقطة $A$', '0,8', ['8', '0,08'], 'ثماني تدريجات صغيرة بعد $O$ ولا وحدة كاملة: $0{,}8$ .'),
        read('فاصلة النقطة $B$', '1,5', ['5,1', '1,05'], 'وحدة واحدة ثم خمس تدريجات صغيرة: $1+\\frac{5}{10}=1{,}5$ .'),
        read('فاصلة النقطة $C$', '3,2', ['2,3', '3,02'], 'ثلاث وحدات ثم تدريجتان صغيرتان: $3{,}2$ ، لا $2{,}3$ .'),
      ],
      explain: 'الوحدات الكاملة قبل الفاصلة، والتدريجات الصغيرة بعدها.',
    },
    commonError: 'عكس الرقمين: قراءة $3{,}2$ على أنّها $2{,}3$ .',
  },
  {
    id: 'ex-16b', source: src('ex-16', 18, 'أتمرّن', 16), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'هذا جزء من نصف مستقيم مدرّج لا يظهر مبدؤه، بين كلّ علامتين كاملتين عشر تدريجات صغيرة. اكتب الأعداد التي تشير إليها الأسهم:',
    halfLine: { min: 9, max: 12, step: 0.1, labelEvery: 10, arrows: [{ label: 'A', value: '9,6' }, { label: 'B', value: '10,3' }, { label: 'C', value: '11,9' }] },
    interaction: 'batch',
    question: {
      rows: [
        read('فاصلة النقطة $A$', '9,6', ['0,6', '9,06'], 'العلامة المكتوبة 9 ثم ست تدريجات صغيرة: $9+\\frac{6}{10}=9{,}6$ ، لا $0{,}6$ .'),
        read('فاصلة النقطة $B$', '10,3', ['9,3', '10,03'], 'بعد العلامة 10 بثلاث تدريجات صغيرة: $10{,}3$ .'),
        read('فاصلة النقطة $C$', '11,9', ['9,11', '11,09'], 'بعد العلامة 11 بتسع تدريجات صغيرة، أي قبل العلامة 12 بتدريجة واحدة: $11{,}9$ .'),
      ],
      explain: 'نقرأ العدد المكتوب على آخر علامة كاملة قبل السهم، ثم نعدّ التدريجات الصغيرة.',
    },
    commonError: 'البدء من 0 حين لا يظهر المبدأ.',
  },
  {
    id: 'ex-16c', source: src('ex-16', 18, 'أتمرّن', 16), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'هذا جزء من نصف مستقيم مدرّج من $0$ إلى $0{,}4$ ، بين كلّ علامتين مكتوبتين عشر تدريجات صغيرة. اكتب الأعداد التي تشير إليها الأسهم:',
    halfLine: { min: 0, max: 0.4, step: 0.01, labelEvery: 10, arrows: [{ label: 'A', value: '0,07' }, { label: 'B', value: '0,15' }, { label: 'C', value: '0,32' }] },
    interaction: 'batch',
    question: {
      rows: [
        read('فاصلة النقطة $A$', '0,07', ['0,7', '0,007'], 'سبع تدريجات صغيرة، كلّ واحدة $0{,}01$ : $0{,}07$ .'),
        read('فاصلة النقطة $B$', '0,15', ['1,5', '0,015'], 'العلامة $0{,}1$ ثم خمس تدريجات صغيرة: $0{,}1+0{,}05=0{,}15$ .'),
        read('فاصلة النقطة $C$', '0,32', ['0,23', '3,2'], 'العلامة $0{,}3$ ثم تدريجتان صغيرتان: $0{,}3+0{,}02=0{,}32$ .'),
      ],
      explain: 'هنا التدريجة الصغيرة هي $0{,}01$ ، وليست $0{,}1$ .',
    },
    commonError: 'اعتبار التدريجة الصغيرة $0{,}1$ في كلّ المقاييس.',
  },
  {
    id: 'ex-16d', source: src('ex-16', 18, 'أتمرّن', 16), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'هذا جزء من نصف مستقيم مدرّج من $9{,}1$ إلى $9{,}2$ ، قُسّم الفاصل بينهما إلى عشرة أجزاء متساوية. اكتب الأعداد التي تشير إليها الأسهم:',
    halfLine: { min: 9.1, max: 9.2, step: 0.01, labelEvery: 10, arrows: [{ label: 'A', value: '9,13' }, { label: 'B', value: '9,16' }, { label: 'C', value: '9,19' }] },
    interaction: 'batch',
    question: {
      rows: [
        read('فاصلة النقطة $A$', '9,13', ['9,3', '9,103'], 'ثلاث تدريجات صغيرة بعد $9{,}1$ ، كلّ واحدة $0{,}01$ : $9{,}13$ .'),
        read('فاصلة النقطة $B$', '9,16', ['9,6', '9,106'], 'ست تدريجات صغيرة بعد $9{,}1$ : $9{,}1+0{,}06=9{,}16$ .'),
        read('فاصلة النقطة $C$', '9,19', ['9,9', '9,109'], 'تسع تدريجات بعد $9{,}1$ ، أي قبل $9{,}2$ بتدريجة واحدة: $9{,}19$ .'),
      ],
      explain: 'التدريجة الصغيرة هنا $0{,}01$ ، ونضيف عددها إلى $9{,}1$ .',
    },
    commonError: 'كتابة $9{,}13$ على أنّها $9{,}3$ لنسيان أنّ التدريجة جزء من مائة.',
  },
];

/** « أقوّم تعلّماتي » 7 (p. 19) — repris dans le إختبار أولي (module 8, E3). */
export const SELF = {
  7: { source: src('self-7', 19, 'أقوّم تعلّماتي', 7) },
};

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque distracteur
 * FAUX. `kind` dit ce que le test recalcule : `build` (une seule description est complète : origine + unité + dix parties), `tenth` (le
 * pas d'une graduation en dixièmes), `ticksFrom` (a + n × 0,1), `plant` (unités + graduations d'une abscisse), `bounds` (le seul encadrement
 * de `lo` à `hi`).
 */
export const FINAL = [
  { id: 'E1', skill: 'build', lp: LP.P1, source: null, kind: 'build', stem: 'أيّ جملة تصف تدريج نصف مستقيم تدريجًا صحيحًا؟',
    options: [
      'نختار المبدأ $O$ ووحدة طول، وننقل الوحدة ابتداءً من $O$ ، ثم نقسّم كلّ وحدة إلى عشرة أجزاء متساوية',
      'نختار المبدأ $O$ ونقسّم نصف المستقيم كلّه إلى عشرة أجزاء متساوية دون اختيار وحدة',
      'ننقل الوحدة ابتداءً من $O$ ونضع عشر تدريجات على نصف المستقيم كلّه',
      'نختار وحدة طول ونقسّمها إلى عشرة أجزاء دون أن نختار مبدأً',
    ], correct: 0, cols: 1,
    explain: 'التدريج يحتاج إلى مبدأ ووحدة تُنقل من المبدأ، وكلّ وحدة تُقسَّم إلى عشرة أجزاء متساوية.' },
  { id: 'E2', skill: 'tenth', lp: LP.P1, source: null, kind: 'tenth', stem: 'وحدة نصف مستقيم مدرّج مقسّمة إلى عشرة أجزاء متساوية. التباعد بين تدريجتين صغيرتين متتاليتين هو:',
    options: ['$0{,}1$', '$0{,}01$', '$1$', '$10$'], correct: 0, cols: 2,
    explain: 'عشرة أجزاء متساوية في الوحدة: كلّ جزء $\\frac{1}{10}=0{,}1$ .' },
  { id: 'E3', skill: 'read', lp: LP.P2, source: SELF[7].source, kind: 'ticksFrom', a: '2,4', n: 2, stem: 'على نصف مستقيم مدرّج وحدته مقسّمة إلى عشرة أجزاء متساوية، فاصلة النقطة $A$ هي $2{,}4$ ، وتقع النقطة $B$ على بعد تدريجتين صغيرتين على يمين $A$ . فاصلة $B$ هي:',
    options: ['$2{,}6$', '$2{,}2$', '$2{,}42$', '$4{,}4$'], correct: 0, cols: 2,
    explain: 'تدريجتان صغيرتان تزيدان $0{,}2$ : $2{,}4+0{,}2=2{,}6$ .' },
  { id: 'E4', skill: 'plant', lp: LP.P3, source: null, kind: 'plant', value: '5,2', stem: 'لتعليم النقطة التي فاصلتها $5{,}2$ على نصف مستقيم مدرّج وحدته مقسّمة إلى عشرة أجزاء، نبدأ من $O$ ونعدّ:',
    options: ['5 وحدات ثم تدريجتين صغيرتين', 'وحدتين ثم 5 تدريجات صغيرة', '52 وحدة', '5 وحدات ثم 20 تدريجة صغيرة'], parts: [[5, 2], [2, 5], [52, 0], [5, 20]], correct: 0, cols: 1,
    explain: '$5{,}2=5+\\frac{2}{10}$ : خمس وحدات كاملة ثم تدريجتان صغيرتان.' },
  { id: 'E5', skill: 'read', lp: LP.P2, source: null, kind: 'bounds', lo: '6,4', hi: '6,5', stem: 'يقع علم بين التدريجتين $6{,}4$ و $6{,}5$ المتتاليتين. أيّ كتابة تحصر فاصلته $x$ حصرًا صحيحًا؟',
    options: ['$6{,}4<x<6{,}5$', '$x=6{,}4$', '$6{,}5<x<6{,}6$', '$4<x<5$'], correct: 0, cols: 2,
    explain: 'بين تدريجتين لا نقرأ فاصلة مضبوطة بل نحصرها بين العددين: $6{,}4<x<6{,}5$ .' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
