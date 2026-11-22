/**
 * Les exercices du درس « تساوي كسرين ومقارنتهما » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source` l'élément du manuel dont il est
 * tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève. Les relations, les regroupements, les ordres et les
 * termes manquants sont écrits ICI en LITTÉRAUX et RE-vérifiés par ./content.test.js avec un code en BigInt (produits en croix), qui contrôle aussi que chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit2/extraction.json) : act-3, now-1, ex-8, ex-12 … ex-16, deep-55 → module 4 ; ex-10, ex-17 → la banque d'exercices ; ex-9 (écritures décimales → fractions égales) est citée par ex-16 ; self-… → aucun ;
 * le إختبار أولي (module 8) est de la plateforme.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_tasawi-muqaranat-kasrayn_P1',
  P2: '3am_tasawi-muqaranat-kasrayn_P2',
  P3: '3am_tasawi-muqaranat-kasrayn_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const REL = ['$>$', '$=$', '$<$'];
const frac = (s) => { const [a, b] = s.split('/'); return `\\frac{${a}}{${b}}`; };
/** Une ligne « قارن » : p ? q, la bonne relation à `correct` (0 : >, 1 : =, 2 : <). */
const relRow = (p, q, correct, correction) => ({ pair: [p, q], label: `$${frac(p)}$  ؟  $${frac(q)}$`, options: REL, correct, correction });
const eqRow = (p, q, correct, correction) => ({ pair: [p, q], label: `$${frac(p)}$ و $${frac(q)}$`, options: ['متساويان', 'غير متساويين'], correct, correction });

/* ── act-3 : quatre paires, chacune appelle une AUTRE méthode ───────────────────────────────────────────────────── */
export const COMPARE = [
  relRow('413/398', '562/631', 0, 'الأول أكبر من $1$ ($413>398$) والثاني أصغر منه ($562<631$).'),
  relRow('47/23', '47/25', 0, 'البسطان متساويان: المقام الأصغر يعطي الكسر الأكبر.'),
  relRow('306/305', '305/304', 2, '$\\frac{306}{305}=1+\\frac{1}{305}$ و $\\frac{305}{304}=1+\\frac{1}{304}$ ، و $\\frac{1}{305}<\\frac{1}{304}$ .'),
  relRow('17/16', '29/24', 2, 'المقام المشترك $48$ : $\\frac{17}{16}=\\frac{51}{48}$ و $\\frac{29}{24}=\\frac{58}{48}$ ، و $51<58$ .'),
];

/* ── now-1 : consécutifs ne sont jamais égaux ──────────────────────────────────────────────────────────────────── */
export const EQUALS = [
  eqRow('2026/2025', '2025/2024', 1, '$2026\\times2024=4\\,100\\,624$ و $2025\\times2025=4\\,100\\,625$ : مختلفان.'),
  eqRow('336/609', '16/29', 0, '$336\\times29=9744$ و $609\\times16=9744$ : متساويان.'),
  eqRow('11/10', '9/8', 1, '$11\\times8=88$ و $10\\times9=90$ : مختلفان.'),
];

/* ── ex-8 : regrouper les fractions égales ─────────────────────────────────────────────────────────────────────── */
const GROUPS = ['المجموعة (أ): تساوي $\\frac{5}{6}$', 'المجموعة (ب): تساوي $\\frac{7}{2}$', 'لا تساوي أيًّا منهما'];
export const SORT = [
  ['15/18', 0], ['7/2', 1], ['5/6', 0], ['21/6', 1], ['20/24', 0], ['9/8', 2],
].map(([p, g]) => ({ frac: p, group: g, label: `$${frac(p)}$`, options: GROUPS, correct: g, correction: g === 2 ? 'جداءاه المتصالبان مع $\\frac{5}{6}$ و $\\frac{7}{2}$ مختلفان.' : `$${frac(p)}$ يساوي $${g === 0 ? '\\frac{5}{6}' : '\\frac{7}{2}'}$ .` }));

/* ── ex-12, ex-13, ex-14 : un dénominateur commun, puis l'ordre ──────────────────────────────────────────────── */
export const ORDER = {
  list: ['5/3', '7/6', '3/4', '11/12', '3/2'], common: 12, ascending: ['3/4', '11/12', '7/6', '3/2', '5/3'],
  options: [
    '$\\frac{3}{4}<\\frac{11}{12}<\\frac{7}{6}<\\frac{3}{2}<\\frac{5}{3}$',
    '$\\frac{11}{12}<\\frac{3}{4}<\\frac{7}{6}<\\frac{3}{2}<\\frac{5}{3}$',
    '$\\frac{3}{2}<\\frac{3}{4}<\\frac{11}{12}<\\frac{7}{6}<\\frac{5}{3}$',
    '$\\frac{5}{3}<\\frac{3}{2}<\\frac{7}{6}<\\frac{11}{12}<\\frac{3}{4}$',
  ],
  correct: 0,
};

/* ── ex-15, ex-16 : l'égalité des produits en croix, un terme manquant ──────────────────────────────────────────── */
export const CROSS = {
  products: [18, 35, 21, 30], // 18 × 35 = 21 × 30
  options: ['$\\frac{18}{21}=\\frac{30}{35}$', '$\\frac{18}{35}=\\frac{21}{30}$', '$\\frac{18}{30}=\\frac{35}{21}$'], correct: 0,
};
export const MISSING = { terms: [null, 16, 5, 8], answer: 10 }; // x/16 = 5/8

/* ── deep-55, ex-17 : la calculatrice ne prouve rien ───────────────────────────────────────────────────────────── */
export const CALC = {
  p: '355/113', q: '35500000001/11300000000',
  options: [
    'غير متساويين: رقما آحاد الجداءين المتصالبين $0$ و $3$ مختلفان',
    'متساويان لأنّ الحاسبة تعرض الرقم نفسه',
    'متساويان لأنّ البسطين متقاربان',
  ],
  correct: 0,
};

export const EXERCISES = [
  {
    id: 'act-3', source: S('act-3', 24, 'أنشطة'), cites: [S('ex-17', 30), S('method-3', 27, 'طرائق')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'في مسابقة للرسم الجداري اختلف التلاميذ في ترتيب أربعة أزواج من الكسور. اختر العلاقة الصحيحة في كلّ سطر بالطريقة المناسبة:',
    interaction: 'batch',
    question: { rows: COMPARE.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'لكلّ زوج طريقته: العدد $1$ ، أو نفس البسط، أو كسر قريب من $1$ ، أو مقام مشترك.' },
    commonError: 'توحيد المقامين دائمًا حتى حين تكفي مقارنة بسيطة بالعدد $1$ .',
  },
  {
    id: 'now-1', source: S('now-1', 27, 'دورك الآن'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ادرس في كلّ حالة إن كان الكسران متساويين (استعمل الجداءين المتصالبين):',
    interaction: 'batch',
    question: { rows: EQUALS.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'كسران عدداهما متتاليان لا يتساويان أبدًا.' },
    commonError: 'الظنّ أنّ كسرين متقاربين متساويان.',
  },
  {
    id: 'ex-8', source: S('ex-8', 30), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'صنّف كلّ كسر في المجموعة التي يناسبها:',
    interaction: 'batch',
    question: { rows: SORT.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'نقارن الجداءين المتصالبين لكلّ كسر مع $\\frac{5}{6}$ ثمّ مع $\\frac{7}{2}$ .' },
    commonError: 'الاكتفاء بمقارنة البسطين أو المقامين.',
  },
  {
    id: 'ex-12', source: S('ex-12', 30), cites: [S('ex-13', 30), S('ex-14', 30)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'اكتب الكسور $\\frac{5}{3}$ و $\\frac{7}{6}$ و $\\frac{3}{4}$ و $\\frac{11}{12}$ و $\\frac{3}{2}$ بالمقام $12$ ثمّ رتّبها تصاعديًا:',
    interaction: 'choice',
    question: { options: ORDER.options, correct: ORDER.correct, cols: 1, explain: '$\\frac{5}{3}=\\frac{20}{12}$ ، $\\frac{7}{6}=\\frac{14}{12}$ ، $\\frac{3}{4}=\\frac{9}{12}$ ، $\\frac{11}{12}$ ، $\\frac{3}{2}=\\frac{18}{12}$ ؛ والترتيب بحسب البسط: $9<11<14<18<20$ .' },
    commonError: 'ترتيب الكسور بحسب مقاماتها.',
  },
  {
    id: 'ex-15', source: S('ex-15', 30), cites: [S('ex-16', 30)], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'تحقّق أنّ $18\\times35=21\\times30$ ، ثمّ اختر المساواة الصحيحة بين كسرين التي تنتج عنه:',
    interaction: 'choice',
    question: { options: CROSS.options, correct: CROSS.correct, cols: 1, explain: 'الجداءان $18\\times35$ و $21\\times30$ يساويان $630$ ، فـ $\\frac{18}{21}=\\frac{30}{35}$ (البسطان في الجهة العليا والمقامان في الجهة السفلى).' },
    commonError: 'وضع العددين في مواضع غير متقابلة.',
  },
  {
    id: 'ex-16', source: S('ex-16', 30), cites: [S('ex-9', 30)], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'جد العدد $x$ الذي يجعل المساواة $\\frac{x}{16}=\\frac{5}{8}$ صحيحة.',
    interaction: 'numeric',
    question: { prompt: 'العدد $x$ :', expected: MISSING.answer, display: '10', explain: 'الجداءان المتصالبان: $x\\times8=16\\times5=80$ ، فـ $x=10$ .' },
    commonError: 'قسمة العددين المتقابلين بدل ضرب القطرين.',
  },
  {
    id: 'deep-55', source: S('deep-55', 34, 'أتعمّق'), cites: [S('ex-17', 30)], learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'تعرض حاسبة جيب الرقم نفسه للكسرين $\\frac{355}{113}$ و $\\frac{35500000001}{11300000000}$ ، فتقول سلمى إنّهما متساويان. ما رأيك؟',
    interaction: 'choice',
    question: { options: CALC.options, correct: CALC.correct, cols: 1, explain: '$355\\times11300000000$ يُختم بالرقم $0$ ، و $113\\times35500000001$ يُختم بالرقم $3$ ، فالجداءان مختلفان. الحاسبة تعرض عددًا محدودًا من الأرقام فتُخفي الفرق.' },
    commonError: 'الثقة بشاشة الحاسبة دون برهان.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `truth` : le calcul qui fait la clé.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P1, source: null, prompt: 'أيّ كسر يساوي $\\frac{12}{18}$ ؟', options: ['$\\frac{2}{3}$', '$\\frac{14}{20}$', '$\\frac{6}{12}$', '$\\frac{3}{2}$'], correct: 0, truth: { kind: 'equal', p: '12/18' } },
  { id: 'E2', lp: LP.P3, source: null, prompt: '$\\frac{5}{7}\\;\\square\\;\\frac{7}{10}$', options: ['$>$', '$<$', '$=$'], correct: 0, truth: { kind: 'relation', p: '5/7', q: '7/10' } },
  { id: 'E3', lp: LP.P1, source: null, prompt: 'هل $\\frac{21}{35}=\\frac{33}{55}$ ؟', options: ['نعم لأنّ $21\\times55=35\\times33=1155$', 'لا لأنّ $21\\neq33$', 'لا لأنّ $55-35\\neq33-21$', 'نعم لأنّ $35-21=14$'], correct: 0, truth: { kind: 'sameYes', p: '21/35', q: '33/55' } },
  { id: 'E4', lp: LP.P2, source: null, prompt: 'الترتيب التصاعدي للكسور $\\frac{2}{3}$ و $\\frac{5}{8}$ و $\\frac{7}{12}$ هو:', options: ['$\\frac{7}{12}<\\frac{5}{8}<\\frac{2}{3}$', '$\\frac{2}{3}<\\frac{5}{8}<\\frac{7}{12}$', '$\\frac{5}{8}<\\frac{2}{3}<\\frac{7}{12}$'], correct: 0, truth: { kind: 'order', list: ['2/3', '5/8', '7/12'] } },
  { id: 'E5', lp: LP.P1, source: null, prompt: '$\\frac{x}{15}=\\frac{4}{6}$ ، إذن $x=$', options: ['$10$', '$13$', '$22{,}5$', '$\\frac{8}{3}$'], correct: 0, truth: { kind: 'missing', terms: [null, 15, 4, 6] } },
];
