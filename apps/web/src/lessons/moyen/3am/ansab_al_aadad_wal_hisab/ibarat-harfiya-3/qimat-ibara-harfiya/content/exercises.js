/**
 * Les exercices du درس « حساب قيمة عبارة حرفية » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, autres contextes, la même
 * compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace
 * (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` muet, `src()` sans `number`).
 * Les lignes « valeur d'une expression » sont des DONNÉES : `data: { expr, env, key }` (l'expression écrite, les valeurs des lettres, la valeur
 * exacte « p/q ») ; les options sont des littéraux, et ./content.test.js RECALCULE chaque clé avec un évaluateur de rationnels BigInt écrit
 * à part (jamais le cœur) et vérifie que chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit4/extraction.json) : act-4, ex-1/ex-2, ex-3, ex-4, now-61 ①, self-3, deep-39, deep-37, ict → module 4 ;
 * `prep` 1–4 → module 0 ; know-4 → module 2 ; method-4 → module 3 ; les épreuves du إختبار أولي citent `self-3`.
 */
import { parseDec } from '@smarter-academy/core';
import * as S from '@smarter-academy/core/arithmetic/substitution.js';
import { src } from '../../_unit/unitMeta.js';

/** Une saisie signée : la virgule décimale, le vrai moins et les chiffres arabes-indiens sont acceptés. */
export const parseNum = (str) => parseDec(String(str).replace(/[−–]/g, '-'));

export const LP = {
  P1: '3am_qimat-ibara-harfiya_P1',
  P2: '3am_qimat-ibara-harfiya_P2',
  P3: '3am_qimat-ibara-harfiya_P3',
};

/* ── Outils de rédaction ───────────────────────────────────────────────────────────────────────── */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction, data) => ({ label, ...place(right, wrongs, at), correction, data });
/** La valeur d'une lettre en LaTeX : « x=-2 », « x=-\frac13 » (écrite à la main dans `env`). */
const envTex = (env) => Object.entries(env).map(([l, v]) => `$${l}=${v.includes('/') ? `${v.startsWith('-') ? '-' : ''}\\frac{${v.replace('-', '').split('/')[0]}}{${v.split('/')[1]}}` : v.replace(',', '{,}')}$`).join(' و');
const tex = (expr) => S.treeTex(S.parseExpression(expr));
/** « قيمة A من أجل x = … » : `key` est la valeur exacte ; `right` et `wrongs` des options LaTeX. */
const valueRow = ({ name, expr, env, key, right, wrongs, at, why }) => row(
  `قيمة ${name ? `$${name}=${tex(expr)}$` : `$${tex(expr)}$`} من أجل ${envTex(env)}`, right, wrongs, at, why, { kind: 'value', expr, env, key },
);

/* ── act-4 → E1 : (2x + 3)(x − 4) et le développement d'un camarade ─────────────────────────────── */
const A1 = '(2x+3)(x-4)';
export const ROWS_E1 = [
  valueRow({ name: 'A', expr: A1, env: { x: '1' }, key: '-15', right: '$-15$', wrongs: ['$15$', '$-1$'], at: 0, why: '$(2\\times1+3)(1-4)=5\\times(-3)=-15$.' }),
  valueRow({ name: 'A', expr: A1, env: { x: '-1' }, key: '-5', right: '$-5$', wrongs: ['$5$', '$-15$'], at: 1, why: '$(2\\times(-1)+3)(-1-4)=1\\times(-5)=-5$.' }),
  valueRow({ name: 'A', expr: A1, env: { x: '4' }, key: '0', right: '$0$', wrongs: ['$44$', '$11$'], at: 2, why: '$4-4=0$ ، فالجداء كله يساوي $0$.' }),
  row('كتب زميلك: $A=2x^2-11x-6$. قيمة ما كتبه من أجل $x=-1$ هي', '$7$', ['$-5$', '$-15$'], 0,
    '$2\\times(-1)^2-11\\times(-1)-6=2+11-6=7$ ، أمّا قيمة $A$ من أجل $x=-1$ فهي $-5$.', { kind: 'value', expr: '2x²-11x-6', env: { x: '-1' }, key: '7' }),
  row('ماذا نستنتج عن نشر زميلك؟', 'خاطئ: من أجل $x=-1$ تختلف القيمتان ($7$ و $-5$)، وقيمته من أجل $x=1$ تطابق $-15$ صدفة',
    ['صحيح لأنّ قيمته تطابق قيمة $A$ من أجل $x=1$', 'لا يمكن الحكم أبدًا بالقيم'], 1,
    'قيمة واحدة تختلف عندها العبارتان تكفي لإبطال التساوي، أمّا اتفاقهما عند $x=1$ فلا يثبت شيئًا. النشر الصحيح $2x^2-5x-12$.', { kind: 'text' }),
];

/* ── ex-1, ex-2 → E2 : trois valeurs de −3x + 4, trois de x² − 5x + 6 ───────────────────────────── */
export const ROWS_E2 = [
  valueRow({ expr: '-3x+4', env: { x: '5' }, key: '-11', right: '$-11$', wrongs: ['$19$', '$-19$'], at: 0, why: '$-3\\times5+4=-15+4=-11$.' }),
  valueRow({ expr: '-3x+4', env: { x: '-2' }, key: '10', right: '$10$', wrongs: ['$-2$', '$2$'], at: 1, why: '$-3\\times(-2)+4=6+4=10$.' }),
  valueRow({ expr: '-3x+4', env: { x: '-1/3' }, key: '5', right: '$5$', wrongs: ['$3$', '$-5$'], at: 2, why: '$-3\\times\\left(-\\frac13\\right)+4=1+4=5$.' }),
  valueRow({ expr: 'x²-5x+6', env: { x: '0' }, key: '6', right: '$6$', wrongs: ['$0$', '$-6$'], at: 0, why: '$0^2-5\\times0+6=6$.' }),
  valueRow({ expr: 'x²-5x+6', env: { x: '3' }, key: '0', right: '$0$', wrongs: ['$18$', '$-6$'], at: 1, why: '$3^2-5\\times3+6=9-15+6=0$.' }),
  valueRow({ expr: 'x²-5x+6', env: { x: '-1' }, key: '12', right: '$12$', wrongs: ['$10$', '$2$'], at: 2, why: '$(-1)^2-5\\times(-1)+6=1+5+6=12$ ؛ $-1^2$ تعطي خطأً $10$.' }),
];

/* ── ex-3 → E3 : tester deux égalités par une valeur ─────────────────────────────────────────────── */
export const ROWS_E3 = [
  valueRow({ expr: '(2x-1)(3-x)', env: { x: '2' }, key: '3', right: '$3$', wrongs: ['$-3$', '$7$'], at: 0, why: '$(2\\times2-1)(3-2)=3\\times1=3$.' }),
  valueRow({ expr: '-2x²+7x-3', env: { x: '2' }, key: '3', right: '$3$', wrongs: ['$27$', '$-3$'], at: 1, why: '$-2\\times2^2+7\\times2-3=-8+14-3=3$.' }),
  row('القيمتان متساويتان عند $x=2$. هل يكفي ذلك لنقول إنّ $(2x-1)(3-x)=-2x^2+7x-3$ من أجل كل $x$ ؟',
    'لا: نتأكد بنشر الجداء ($6x-2x^2-3+x=-2x^2+7x-3$) فنجدها صحيحة', ['نعم: تكفي قيمة واحدة', 'لا، لأنّ $2$ عدد زوجي'], 0,
    'تساوي القيمتين من أجل قيمة واحدة لا يثبت المساواة؛ النشر هو الذي يثبتها هنا.', { kind: 'text' }),
  valueRow({ expr: '6x-2x²', env: { x: '1' }, key: '4', right: '$4$', wrongs: ['$8$', '$-4$'], at: 1, why: '$6\\times1-2\\times1^2=6-2=4$.' }),
  valueRow({ expr: '-2x(x+3)', env: { x: '1' }, key: '-8', right: '$-8$', wrongs: ['$8$', '$-4$'], at: 2, why: '$-2\\times1\\times(1+3)=-2\\times4=-8$.' }),
  row('ما حكمك على المساواة $6x-2x^2=-2x(x+3)$ ؟', 'خاطئة: القيمتان $4$ و $-8$ مختلفتان عند $x=1$ فهو مثال مضاد', ['صحيحة لأنّ فيها $x$ في الطرفين', 'لا نستطيع الحكم'], 0,
    'قيمة واحدة تختلف عندها العبارتان تكفي لإثبات أنهما غير متساويتين.', { kind: 'text' }),
];

/* ── ex-4 → E4 : la hauteur d'un ballon h = 20t − 5t² ───────────────────────────────────────────── */
const ballRow = (t, key, right, wrongs, at, why, label) => ({ ...valueRow({ name: 'h', expr: '20x-5x²', env: { x: t }, key, right, wrongs, at, why }), label });
export const ROWS_E4 = [
  ballRow('1', '15', '$15$', ['$25$', '$-15$'], 0, '$20\\times1-5\\times1^2=20-5=15$ م.', 'ارتفاع الكرة بالمتر بعد ثانية ($t=1$) :'),
  ballRow('2', '20', '$20$', ['$60$', '$0$'], 1, '$20\\times2-5\\times2^2=40-20=20$ م.', 'بعد ثانيتين ($t=2$) :'),
  ballRow('4', '0', '$0$', ['$60$', '$-80$'], 2, '$20\\times4-5\\times4^2=80-80=0$ : عادت الكرة إلى الأرض.', 'بعد أربع ثوان ($t=4$) :'),
  ballRow('1,5', '75/4', '$18{,}75$', ['$33{,}75$', '$26{,}25$'], 0, '$20\\times1{,}5-5\\times1{,}5^2=30-11{,}25=18{,}75$ م.', 'بعد ثانية ونصف ($t=1{,}5$) :'),
];

/* ── now-61 ① → E5 : deux expressions en x = −5 ──────────────────────────────────────────────────── */
export const ROWS_E5 = [
  valueRow({ expr: '(x+5)(x-2)', env: { x: '-5' }, key: '0', right: '$0$', wrongs: ['$10$', '$-10$'], at: 0, why: '$(-5+5)(-5-2)=0\\times(-7)=0$.' }),
  valueRow({ expr: 'x²-10', env: { x: '-5' }, key: '15', right: '$15$', wrongs: ['$-35$', '$-15$'], at: 1, why: '$(-5)^2-10=25-10=15$ ؛ $-5^2$ تعطي خطأً $-35$.' }),
  row('هل العبارتان $(x+5)(x-2)$ و $x^2-10$ متساويتان ؟', 'غير متساويتين: القيمتان $0$ و $15$ مختلفتان عند $x=-5$', ['متساويتان لأنّ فيهما $x^2$', 'لا نستطيع الحكم'], 0,
    'مثال مضاد واحد يكفي.', { kind: 'text' }),
];

/* ── deep-39 → E7 : le camarade qui généralise ───────────────────────────────────────────────────── */
export const ROWS_E7 = [
  row('عند $a=0$ تعطي $(1+a)(4+a)$ و $6a+4$ القيمتين', '$4$ و $4$', ['$4$ و $0$', '$5$ و $4$'], 0, '$(1+0)(4+0)=4$ و $6\\times0+4=4$.', { kind: 'pair', a: '(1+a)(4+a)', b: '6a+4', at: '0', key: ['4', '4'] }),
  row('وعند $a=1$ تعطيان', '$10$ و $10$', ['$10$ و $9$', '$5$ و $10$'], 1, '$(1+1)(4+1)=2\\times5=10$ و $6+4=10$.', { kind: 'pair', a: '(1+a)(4+a)', b: '6a+4', at: '1', key: ['10', '10'] }),
  row('وعند $a=2$ تعطيان', '$18$ و $16$', ['$18$ و $18$', '$16$ و $16$'], 2, '$(1+2)(4+2)=3\\times6=18$ و $6\\times2+4=16$.', { kind: 'pair', a: '(1+a)(4+a)', b: '6a+4', at: '2', key: ['18', '16'] }),
  row('قال ياسين إنّ المساواة $(1+a)(4+a)=6a+4$ صحيحة من أجل كل $a$ لأنّ القيمتين تساوتا مرّتين. ما رأيك؟',
    'خاطئة: $a=2$ مثال مضاد، وتساوي القيمتين مرّتين لا يثبت المساواة', ['صحيحة لأنّ القيمتين تساوتا مرّتين', 'لا يمكن الحكم على مساواة بالقيم أبدًا'], 0,
    'مثال مضاد واحد يكفي لإبطالها، وتساوي القيم من أجل قيمتين لا يكفي لإثباتها.', { kind: 'text' }),
];

/* ── deep-37 → E8 : valeur exacte et valeur approchée ────────────────────────────────────────────── */
export const FIGURE_E8 = {
  points: { A: [0, 0], B: [6, 0], C: [6, 6], D: [0, 6] },
  segments: [{ from: 'A', to: 'B', label: '6' }, ['B', 'C'], ['C', 'D'], ['D', 'A']],
  polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'emerald' }],
  arcs: [{ from: 'D', to: 'C', sweep: 'cw', tone: 'sky' }],
  labels: { A: 'sw', B: 'se', C: 'ne', D: 'nw' },
  ariaLabel: 'مربع طول ضلعه 6 سم يعلوه نصف قرص قطره ضلع المربع العلوي',
};
export const ROWS_E8 = [
  row('المساحة المضبوطة للشكل (مربع طول ضلعه $6$ سم ونصف قرص قطره $6$ سم) بالسنتيمتر المربع هي', '$36+\\frac92\\pi$', ['$36+9\\pi$', '$36+\\frac32\\pi$'], 0,
    'مساحة المربع $36$ ، ونصف القرص نصف قطره $3$ سم: $\\frac12\\times\\pi\\times3^2=\\frac92\\pi$.', { kind: 'exact' }),
  row('القيمة المقرّبة بالنقصان إلى $0{,}01$ لهذه المساحة هي', '$50{,}13$', ['$50{,}14$', '$50{,}1$'], 1,
    '$\\frac92\\pi\\approx14{,}1371$ فالمساحة $50{,}1371\\ldots$ ، وبالنقصان إلى $0{,}01$ نجد $50{,}13$.', { kind: 'approx' }),
  row('أيّ العبارتين صحيحة ؟', '$36+\\frac92\\pi$ قيمة مضبوطة و $50{,}13$ قيمة مقرّبة', ['كلتاهما قيمة مضبوطة', '$50{,}13$ قيمة مضبوطة و $36+\\frac92\\pi$ مقرّبة'], 0,
    'العدد $\\pi$ غير منته فكل كتابة عشرية له مقرّبة؛ أمّا الكتابة بالرمز $\\pi$ فمضبوطة.', { kind: 'text' }),
];

/* ── ict → E9 : un tableau de valeurs fait le test en masse ──────────────────────────────────────── */
export const ROWS_E9 = [
  valueRow({ expr: '(4x-3)(2x+5)', env: { x: '-2' }, key: '-11', right: '$-11$', wrongs: ['$11$', '$-35$'], at: 0, why: '$(4\\times(-2)-3)(2\\times(-2)+5)=(-11)\\times1=-11$.' }),
  valueRow({ expr: '(4x-3)(2x+5)', env: { x: '2' }, key: '45', right: '$45$', wrongs: ['$69$', '$-45$'], at: 1, why: '$(4\\times2-3)(2\\times2+5)=5\\times9=45$.' }),
  valueRow({ expr: '8x²+26x-15', env: { x: '-2' }, key: '-35', right: '$-35$', wrongs: ['$-11$', '$-31$'], at: 2, why: '$8\\times(-2)^2+26\\times(-2)-15=32-52-15=-35$.' }),
  row('نشر الزميل الأول $8x^2+26x-15$ يحكم عليه الجدول بأنّه', 'خاطئ: قيمته عند $x=-2$ هي $-35$ لا $-11$', ['صحيح لأنّه يوافق قيمة الجداء عند $x=0$', 'صحيح لأنّ فيه $8x^2$'], 0,
    'عند $x=0$ تساوي كل الأعمدة $-15$ ، لكنّ قيمة أخرى تفرّق بينهما.', { kind: 'text' }),
  row('نشر الزميل الثاني $8x^2+14x-15$ طابقت قيمته الجداء في كل أعمدة الجدول. كيف نتأكد أنّه صحيح ؟', 'ننشر الجداء ونقارن الصورتين: $8x^2+20x-6x-15=8x^2+14x-15$', ['يكفي الجدول لأنّ فيه خمس قيم', 'نجرّب قيمة سادسة فقط'], 0,
    'الجدول يبطل ولا يثبت؛ الإثبات بالنشر.', { kind: 'text' }),
];

export const EXERCISES = [
  {
    id: 'act-4', source: src('act-4', 57, 'أنشطة', 4), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'لتكن $A=(2x+3)(x-4)$ ؛ أراد زميلك نشرها فكتب $A=2x^2-11x-6$. احسب قيمًا لـ $A$ ثم احكم على عمله.',
    interaction: 'batch',
    question: { rows: ROWS_E1, explain: 'قيمة واحدة تختلف عندها العبارتان تثبت أنهما غير متساويتين.' },
    commonError: 'الاكتفاء بقيمة واحدة تتّفق عندها العبارتان.',
  },
  {
    id: 'ex-1', source: src('ex-1', 62, 'قيمة عبارة حرفية'), cites: [src('ex-2', 62, 'قيمة عبارة حرفية')], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'احسب قيمة كل عبارة من أجل القيمة المعطاة، ثم اختر الناتج الصحيح.',
    interaction: 'batch',
    question: { rows: ROWS_E2, explain: 'نعوّض بالعدد نفسه في كل مكان للحرف، ونضع السالب بين قوسين، ونحترم أولوية العمليات.' },
    commonError: 'نسيان إشارة القيمة السالبة، أو كتابة $-1^2$ بدل $(-1)^2$.',
  },
  {
    id: 'ex-3', source: src('ex-3', 62, 'قيمة عبارة حرفية'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اختبر كلًّا من المساواتين من أجل القيمة المعطاة، ثم احكم.',
    interaction: 'batch',
    question: { rows: ROWS_E3, explain: 'اتفاق القيمتين لا يثبت المساواة؛ واختلافهما يبطلها.' },
    commonError: 'الاستنتاج من قيمة واحدة تتّفق عندها العبارتان أنّ المساواة صحيحة.',
  },
  {
    id: 'ex-4', source: src('ex-4', 62, 'قيمة عبارة حرفية'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ترمي ليلى كرة إلى الأعلى فيكون ارتفاعها بالمتر بعد $t$ ثانية هو $h=20t-5t^2$. احسب ارتفاعها في كل لحظة.',
    interaction: 'batch',
    question: { rows: ROWS_E4, explain: 'نحسب القوة أولًا، ثم الضرب، ثم الطرح.' },
    commonError: 'نسيان تربيع $t$ ، أو الطرح قبل الضرب.',
  },
  {
    id: 'now-61', source: src('now-61', 61, 'دوري الآن', 1), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب قيمة كل عبارة من أجل $x=-5$ ثم قارن.',
    interaction: 'batch',
    question: { rows: ROWS_E5, explain: 'عدد يعدم قوسًا يعدم الجداء كله؛ ومثال مضاد واحد يبطل المساواة.' },
    commonError: 'كتابة $-5^2$ بدل $(-5)^2$.',
  },
  {
    id: 'self-3', source: src('self-3', 65, 'أؤكّد تعلّماتي', 3), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'احسب قيمة العبارة $(x+6)(x-3)$ من أجل $x=-2$.',
    interaction: 'numeric',
    question: { prompt: 'قيمة $(x+6)(x-3)$ من أجل $x=-2$ :', expected: -20, display: '-20', explain: '$(-2+6)(-2-3)=4\\times(-5)=-20$.' },
    commonError: 'نسيان القوسين حول القيمة السالبة.',
  },
  {
    id: 'deep-39', source: src('deep-39', 66, 'أتعمّق', 39), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'يقول ياسين إنّ $(1+a)(4+a)=6a+4$ من أجل كل $a$. جرّب قيمًا لـ $a$ ثم احكم.',
    interaction: 'batch',
    question: { rows: ROWS_E7, explain: 'قيمتان متساويتان لا تثبتان المساواة، وقيمة مختلفة تنقضها.' },
    commonError: 'الاكتفاء بقيمتين متساويتين للحكم بالتساوي.',
  },
  {
    id: 'deep-37', source: src('deep-37', 66, 'أتعمّق', 37), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'شكل مؤلّف من مربع طول ضلعه $6$ سم ونصف قرص قطره ضلع علوي للمربع. نريد مساحته.',
    interaction: 'batch',
    question: { rows: ROWS_E8, explain: 'نترك $\\pi$ كما هو لنحصل على قيمة مضبوطة، ونقرّب عند الحاجة.' },
    commonError: 'الخلط بين القيمة المضبوطة والقيمة المقرّبة.',
    figure: FIGURE_E8,
  },
  {
    id: 'ict', source: src('ict', 69, 'البرمجيات'), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'جدول قيم يملؤه المجدول لجداء $(4x-3)(2x+5)$ ونشرين اقترحهما زميلاك من أجل $x=-2,\\ldots,2$. اقرأ بعض أعمدته.',
    interaction: 'batch',
    question: { rows: ROWS_E9, explain: 'الجدول يُبطل النشر الخاطئ ولا يثبت النشر الصحيح؛ للإثبات ننشر.' },
    commonError: 'الظن بأنّ عدد القيم المتفقة يثبت التساوي.',
  },
];

/** « أؤكّد تعلّماتي » 3 (p. 65) — la source de l'épreuve du إختبار أولي (module 8), réécrite avec d'autres nombres. */
export const SELF = { 3: { source: src('self-3', 65, 'أؤكّد تعلّماتي', 3) } };

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé (`expr`, `env`, évaluées par un
 * évaluateur BigInt à part) et vérifie chaque distracteur FAUX. `kind: 'value'` : l'option est la valeur ; `kind: 'verdict'` : un jugement.
 */
export const FINAL = [
  { id: 'E1', skill: 'priority', lp: LP.P1, source: SELF[3].source, kind: 'value', expr: '5-2x', env: { x: '-3' },
    stem: 'قيمة العبارة $5-2x$ من أجل $x=-3$ هي', options: ['$11$', '$-1$', '$-9$', '$0$'], correct: 0, cols: 4, values: ['11', '-1', '-9', '0'],
    explain: '$5-2\\times(-3)=5+6=11$ ؛ نضرب قبل أن نطرح، وجداء عددين سالبين موجب.' },
  { id: 'E2', skill: 'brackets', lp: LP.P2, source: null, kind: 'value', expr: 'x²-4', env: { x: '-3' },
    stem: 'قيمة العبارة $x^2-4$ من أجل $x=-3$ هي', options: ['$5$', '$-13$', '$-10$', '$13$'], correct: 0, cols: 4, values: ['5', '-13', '-10', '13'],
    explain: '$(-3)^2-4=9-4=5$ ؛ أمّا $-3^2-4$ فتعطي خطأً $-13$.' },
  { id: 'E3', skill: 'power', lp: LP.P2, source: null, kind: 'value', expr: '3x²', env: { x: '-2' },
    stem: 'قيمة العبارة $3x^2$ من أجل $x=-2$ هي', options: ['$12$', '$36$', '$-12$', '$-36$'], correct: 0, cols: 4, values: ['12', '36', '-12', '-36'],
    explain: '$3\\times(-2)^2=3\\times4=12$ ؛ التربيع يخصّ $x$ وحده لا العامل $3$.' },
  { id: 'E4', skill: 'letters', lp: LP.P1, source: null, kind: 'value', expr: '2x-3y', env: { x: '1/2', y: '-1' },
    stem: 'قيمة العبارة $2x-3y$ من أجل $x=\\frac12$ و $y=-1$ هي', options: ['$4$', '$-2$', '$-\\frac{7}{2}$', '$1$'], correct: 0, cols: 4, values: ['4', '-2', '-7/2', '1'],
    explain: '$2\\times\\frac12-3\\times(-1)=1+3=4$.' },
  { id: 'E5', skill: 'counter', lp: LP.P3, source: null, kind: 'verdict', a: '(x+1)²', b: 'x²+1', at: '1',
    stem: 'هل العبارتان $(x+1)^2$ و $x^2+1$ متساويتان ؟',
    options: ['غير متساويتين لأنّ من أجل $x=1$ نجد $4$ و $2$', 'متساويتان لأنّ لهما القيمة $1$ من أجل $x=0$', 'متساويتان لأنّ $(x+1)^2=x^2+1^2$', 'لا يمكن أبدًا الحكم على مساواة بالقيم'], correct: 0, cols: 1,
    explain: 'قيمة واحدة تختلف عندها العبارتان تكفي: $(1+1)^2=4$ و $1^2+1=2$.' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
