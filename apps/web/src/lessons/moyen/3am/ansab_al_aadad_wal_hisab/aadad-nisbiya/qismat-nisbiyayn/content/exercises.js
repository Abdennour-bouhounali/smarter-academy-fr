/**
 * Les exercices du درس « حاصل قسمة عددين نسبيين » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres contextes, autres nombres, même
 * compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace
 * (traçabilité de `check:textbook`) ; `src()` sans numéro : jamais montré à l'élève. Chaque clé est CALCULÉE ici avec
 * `packages/core/arithmetic/relativeOps.js` et RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que
 * chaque distracteur est FAUX (et que ceux qui portent une erreur nommée valent bien la valeur de cette erreur).
 * Destinations (docs/sources/3am/unit1/extraction.json) : act-4 ①②, ex-15, 16, 27, 30 → E1 ; ex-22, 23 → E2 ; ex-24, 25, 26 → E3 ; now-13 ① → E4, ② → E5 ;
 * ex-33 → E6 ; deep-40 → E7 ; deep-41 → E8 ; deep-45 → E9 ; self-8 … 11 → le test final (module 8) ET la banque.
 */
import * as R from '@smarter-academy/core/arithmetic/relativeOps.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_qismat-nisbiyayn_P1',
  P2: '3am_qismat-nisbiyayn_P2',
  P3: '3am_qismat-nisbiyayn_P3',
  P4: '3am_qismat-nisbiyayn_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Un nombre en LaTeX avec la virgule décimale : « -2{,}5 ». */
const tex = (x) => R.relTex(R.parseRel(x));
const f = (x) => (R.parseRel(x).n < 0n ? `(${tex(x)})` : tex(x));
const num = (s) => T(tex(s));
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });
const quo = (a, b) => R.divide(a, b);
const val = (a, b) => T(R.relTex(quo(a, b)));
/** Le LaTeX d'un quotient « a ÷ b » avec ses parenthèses. */
const div = (a, b) => `${f(a)} \\div ${f(b)}`;

/* ── E1. Le facteur manquant (act-4 ①②, ex-15, 16, 27, 30, redessinés) : b × □ = a ou □ × b = a ─────────────────────────────────────────── */
const MISSING = [
  { b: '-5', a: '35', first: false, wrongs: ['7', '30', '-175'], why: 'القسمة تلغي الضرب: $35 \\div (-5) = -7$ ، ونتحقّق $(-5) \\times (-7) = 35$ . (الرمز $7$ يعطي $-35$ ، و $-175$ هو الجداء.)' },
  { b: '-8', a: '-2', first: true, wrongs: ['-0,25', '4', '-10'], why: '$(-2) \\div (-8) = 0{,}25$ ، ونتحقّق $0{,}25 \\times (-8) = -2$ . (العدد $4$ هو $(-8) \\div (-2)$ : قسمة بالعكس.)' },
  { b: '4', a: '-30', first: false, wrongs: ['7,5', '-120', '-26'], why: '$(-30) \\div 4 = -7{,}5$ ، ونتحقّق $4 \\times (-7{,}5) = -30$ .' },
  { b: '-1,5', a: '-6', first: false, wrongs: ['-4', '9', '0,25'], why: '$(-6) \\div (-1{,}5) = 4$ ، ونتحقّق $(-1{,}5) \\times 4 = -6$ . (الرمز $-4$ يعطي $6$ ، و $0{,}25$ هو $(-1{,}5) \\div (-6)$ .)' },
];
const missingLabel = (m) => T(m.first ? `\\square \\times ${f(m.b)} = ${tex(m.a)}` : `${f(m.b)} \\times \\square = ${tex(m.a)}`);

/* ── E2. الإشارة دون حساب (ex-22, 23) ─────────────────────────────────────────────────────────────────────────────────────────────────── */
const SIGNS = [
  { a: '-17', b: '-3', why: 'العددان سالبان: لهما الإشارة نفسها، فحاصل القسمة موجب.' },
  { a: '-4,2', b: '6', why: 'إشارتان مختلفتان: حاصل القسمة سالب.' },
  { a: '9', b: '-0,2', why: 'إشارتان مختلفتان: حاصل القسمة سالب.' },
];

/* ── E3. أحسب (ex-24, 25, 26) ────────────────────────────────────────────────────────────────────────────────────────────────────────── */
const COMPUTE = [
  { a: '-96', b: '8', wrongs: ['12', '-88', '-768'], why: 'مختلفا الإشارة: سالب، و $96 \\div 8 = 12$ ، إذن $-12$ .' },
  { a: '-3,6', b: '-0,9', wrongs: ['-4', '0,4', '40'], why: 'سالبان: موجب، و $3{,}6 \\div 0{,}9 = 4$ (نضرب العددين في $10$ : $36 \\div 9$ ).' },
  { a: '45', b: '-0,5', wrongs: ['90', '-9', '-22,5'], why: 'مختلفا الإشارة: سالب، و $45 \\div 0{,}5 = 90$ ، إذن $-90$ . (القسمة على $0{,}5$ تضاعف العدد.)' },
  { a: '-7', b: '-20', wrongs: ['-0,35', '3,5', '0,035'], why: 'سالبان: موجب، و $7 \\div 20 = 0{,}35$ .' },
];

/* ── E4. now-13 ①, redessiné avec a = 7 et b = 4 : les quatre écritures ───────────────────────────────────────────────────────────────── */
const WRITINGS = [
  { tex: '\\frac{7}{4}', value: '1,75' },
  { tex: '\\frac{-7}{4}', value: '-1,75' },
  { tex: '\\frac{7}{-4}', value: '-1,75' },
  { tex: '\\frac{-7}{-4}', value: '1,75' },
];

/* ── E5. now-13 ②, redessiné : les décalages de la virgule ──────────────────────────────────────────────────────────────────────────── */
const SHIFTS = [
  { a: '-0,52', b: '100', wrongs: ['-0,052', '-52', '0,0052'], why: 'القسمة على $100$ تزيح الفاصلة منزلتين إلى اليسار، والإشارة سالبة: $-0{,}0052$ .' },
  { a: '0,52', b: '-0,001', wrongs: ['520', '-52', '-5200'], why: 'القسمة على $0{,}001$ تزيح الفاصلة ثلاث منازل إلى اليمين، والإشارة سالبة: $-520$ . (الرمز $-52$ ينقص منزلة.)' },
];

/* ── E7. deep-40, redessiné : placer des parenthèses (chaque option est une expression évaluée par le test) ─────────────────────────── */
export const BRACKETS = {
  target: '30',
  options: [
    { expr: '(20 - 5) \\times (4 - 2)', value: '30' },
    { expr: '20 - (5 \\times 4) - 2', value: '-2' },
    { expr: '20 - 5 \\times (4 - 2)', value: '10' },
    { expr: '(20 - 5 \\times 4) - 2', value: '-2' },
  ],
};

export const EXERCISES = [
  {
    id: 'act-4', source: S('act-4', 9, 'أنشطة'), cites: [S('ex-15', 15, 'ضرب الأعداد النسبية'), S('ex-16', 15, 'ضرب الأعداد النسبية'), S('ex-27', 16, 'ضرب الأعداد النسبية'), S('ex-30', 16, 'ضرب الأعداد النسبية')],
    learningPointId: LP.P1, difficulty: 'facile',
    statement: 'أكمل كل عملية بالعدد الذي يجعلها صحيحة (العدد المطلوب هو حاصل قسمة عدد على آخر).',
    interaction: 'batch',
    question: { rows: MISSING.map((m, i) => row(missingLabel(m), val(m.a, m.b), m.wrongs.map(num), i + 1, m.why)), explain: 'العدد المجهول عامل في جداء: نجده بقسمة الجداء على العامل المعلوم.' },
    commonError: 'قسمة العددين بالعكس، أو كتابة إشارة خاطئة للعدد المجهول.',
  },
  {
    id: 'ex-22', source: S('ex-22', 15, 'ضرب الأعداد النسبية'), cites: [S('ex-23', 15, 'ضرب الأعداد النسبية')], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'ما إشارة كل حاصل قسمة؟ لا تحسب القيمة.',
    interaction: 'batch',
    question: { rows: SIGNS.map((s, i) => row(T(div(s.a, s.b)), R.quotientSign(s.a, s.b) > 0 ? 'موجب' : 'سالب', [R.quotientSign(s.a, s.b) > 0 ? 'سالب' : 'موجب'], i, s.why)), explain: 'نقارن إشارتي العددين: متشابهتان تعطيان حاصلًا موجبًا ومختلفتان تعطيان حاصلًا سالبًا.' },
    commonError: 'الحكم على الإشارة بإشارة المقسوم وحدها.',
  },
  {
    id: 'ex-24', source: S('ex-24', 15, 'ضرب الأعداد النسبية'), cites: [S('ex-25', 15, 'ضرب الأعداد النسبية'), S('ex-26', 15, 'ضرب الأعداد النسبية')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب كل حاصل قسمة: الإشارة أوّلًا ثم قسمة المسافتين إلى الصفر.',
    interaction: 'batch',
    question: { rows: COMPUTE.map((c, i) => row(T(div(c.a, c.b)), val(c.a, c.b), c.wrongs.map(num), i + 2, c.why)), explain: 'إشارة حاصل القسمة بقاعدة الإشارات، وقيمته بقسمة المسافتين إلى الصفر.' },
    commonError: 'نسيان الإشارة السالبة عند قسمة عددين سالبين، أو إزاحة الفاصلة خطأً.',
  },
  {
    id: 'now-13a', source: S('now-13', 13, 'دوري الآن'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'من أجل $a = 7$ و $b = 4$ ما قيمة كل كتابة؟',
    interaction: 'batch',
    question: { rows: WRITINGS.map((w, i) => row(T(w.tex), num(w.value), [num(R.relText(R.opposite(w.value)))], i, w.value.startsWith('-') ? 'إشارة سالب واحدة، في البسط أو في المقام: الكسر سالب.' : 'إمّا لا إشارة سالبة، وإمّا واحدة في البسط وواحدة في المقام: الكسر موجب.')), explain: '$\\frac{-a}{b} = \\frac{a}{-b} = -\\frac{a}{b}$ و $\\frac{-a}{-b} = \\frac{a}{b}$ .' },
    commonError: 'الظنّ أنّ $\\frac{-7}{-4}$ سالب.',
  },
  {
    id: 'now-13b', source: S('now-13', 13, 'دوري الآن'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب كل حاصل قسمة (الفاصلة تنتقل بحسب القاسم).',
    interaction: 'batch',
    question: { rows: SHIFTS.map((c, i) => row(T(div(c.a, c.b)), val(c.a, c.b), c.wrongs.map(num), i + 1, c.why)), explain: 'نعيّن الإشارة ثم نزيح الفاصلة بعدد أصفار القاسم.' },
    commonError: 'إزاحة الفاصلة بعدد خاطئ من المنازل.',
  },
  {
    id: 'ex-33', source: S('ex-33', 16, 'أوظّف تعلّماتي'), learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'احسب $C = (6 - 14) \\div (10 - (2 + 3 \\times 4))$ .',
    interaction: 'choice',
    question: { options: ['$2$', '$-2$', '$0{,}8$', '$-0{,}8$'], correct: 0, cols: 2, explain: 'داخل القوس الداخلي الضرب أوّلًا: $2 + 3 \\times 4 = 14$ ، ثم $10 - 14 = -4$ ، والبسط $6 - 14 = -8$ ؛ و $(-8) \\div (-4) = 2$ . (النتيجة $0{,}8$ تأتي من $(2 + 3) \\times 4$ .)' },
    commonError: 'جمع $2 + 3$ قبل الضرب في $4$ .',
  },
  {
    id: 'deep-40', source: S('deep-40', 18, 'أتعمّق'), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'أيّ وضع للأقواس يجعل المساواة $20 - 5 \\times 4 - 2 = 30$ صحيحة؟',
    interaction: 'choice',
    question: { options: BRACKETS.options.map((o) => `$${o.expr}$`), correct: 0, cols: 1, explain: '$(20 - 5) \\times (4 - 2) = 15 \\times 2 = 30$ . أمّا $20 - 5 \\times (4 - 2) = 10$ ، و $20 - (5 \\times 4) - 2 = -2$ .' },
    commonError: 'وضع قوس واحد فقط، والاحتفاظ بالضرب قبل الطرح.',
  },
  {
    id: 'deep-41', source: S('deep-41', 18, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'عدد $a$ جداء $9$ أعداد غير معدومة منها $7$ سالبة، وعدد $b$ جداء $6$ أعداد غير معدومة منها $5$ سالبة. ما إشارة كلٍّ من الكتابات الآتية؟',
    interaction: 'batch',
    question: {
      rows: [
        row('$a \\times b$', 'موجب', ['سالب'], 0, 'سبعة عوامل سالبة (فردي) فـ $a$ سالب، وخمسة (فردي) فـ $b$ سالب: جداء سالبين موجب.'),
        row('$\\frac{a}{b}$', 'موجب', ['سالب'], 1, '$a$ و $b$ سالبان: لهما الإشارة نفسها، فحاصل القسمة موجب.'),
        row('$a + b$', 'سالب', ['موجب'], 0, 'مجموع عددين سالبين سالب.'),
      ],
      explain: 'نعيّن أوّلًا إشارة $a$ و $b$ بعدّ عواملهما السالبة.',
    },
    commonError: 'الحكم على إشارة $a$ من عدد عوامله كلّها لا من عدد عوامله السالبة.',
  },
  {
    id: 'deep-45', source: S('deep-45', 19, 'أتعمّق'), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'كل حدّ في هذه المتتالية ناتج عن قسمة الحدّ الذي قبله على عدد نسبي: $360$ ; $-72$ ; ؟ ; $-6$ ; $3$ ; $-3$ . ما الحدّ الناقص؟',
    interaction: 'numeric',
    question: { expected: 18, display: '18', explain: '$360 \\div (-5) = -72$ ثم $-72 \\div (-4) = 18$ ثم $18 \\div (-3) = -6$ ، وهكذا $-6 \\div (-2) = 3$ و $3 \\div (-1) = -3$ .' },
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
/** Les données brutes d'E1 … E5, relues par content.test.js. */
export const DATA = { MISSING, SIGNS, COMPUTE, WRITINGS, SHIFTS };

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', tex: '(-42) \\div (-6)', options: ['7', '-7', '-36', '-48'], correct: 0, kind: 'quot' },
  { id: 'E2', tex: '\\square \\times (-4) = 10', options: ['-2{,}5', '2{,}5', '-40', '-0{,}4'], correct: 0, kind: 'missing' },
  { id: 'E3', tex: '\\frac{-5}{8}', options: ['\\frac{5}{-8}', '\\frac{-5}{-8}', '\\frac{8}{-5}', '\\frac{5}{8}'], correct: 0, kind: 'writing' },
  { id: 'E4', tex: '7 - 3 \\times (-2)', options: ['13', '-8', '1', '-13'], correct: 0, kind: 'expr' },
  { id: 'E5', tex: '(-12) \\div (1 - 4) + 2', options: ['6', '-2', '-14', '4'], correct: 0, kind: 'expr' },
];
