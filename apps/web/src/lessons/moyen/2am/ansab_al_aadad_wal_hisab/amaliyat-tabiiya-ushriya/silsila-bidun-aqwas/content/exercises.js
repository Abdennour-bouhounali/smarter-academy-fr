/**
 * Les exercices du درس « سلسلة عمليات دون أقواس وأولوية العمليات » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en
 * `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à
 * l'élève. Chaque valeur est CALCULÉE ici avec `packages/core/arithmetic/chainOps.js` (importé PAR CHEMIN) et RE-vérifiée par ./content.test.js avec un autre code (BigInt),
 * qui contrôle aussi que chaque distracteur est FAUX et reproduit son erreur nommée (MISC-SILSILA-*).
 * Destinations (docs/sources/2am/unit1/extraction.json) : act-1, act-2 (q1), ex-1 … ex-7, deep-39, self-6 → module 4 ; self-1, prep 3–7 → le إختبار أولي / « أستعدّ ».
 * AUCUNE parenthèse dans une chaîne montrée ; chaque résultat intermédiaire est ≥ 0.
 */
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_silsila-bidun-aqwas_P1',
  P2: '2am_silsila-bidun-aqwas_P2',
  P3: '2am_silsila-bidun-aqwas_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
/** « 4,5 + 2 × 8 » → LaTeX d'affichage (virgule décimale, × ÷ −). */
export const tex = (chain) => String(chain).replace(/(\d),(\d)/g, '$1{,}$2').replace(/×/g, '\\times').replace(/÷/g, '\\div').replace(/−/g, '-');
const T = (chain) => `$${tex(chain)}$`;
const val = (chain) => C.numText(C.evaluateChain(chain));
const valIn = (chain, order) => C.numText(C.valueInOrder(chain, order).value);
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });

/**
 * Une ligne de CALCUL « احسب s » : la clé est la valeur conventionnelle ; `bad` = les ordres fautifs (indices d'opérateurs), dont chacun reproduit une erreur nommée
 * (`MISC-SILSILA-*`) : ADDFIRST / MULFIRST / NOPRIORITY. Les valeurs sont écrites par chainOps ; le test les refait avec son propre évaluateur.
 */
const calc = (chain, bad, at, why) => {
  const right = val(chain);
  const wrongs = bad.map((o) => valIn(chain, o)).filter((v, i, a) => v !== right && a.indexOf(v) === i);
  return { chain, ...row(T(chain), T(right), wrongs.map(T), at, why ?? `${T(chain)} = ${T(right)}` ), right, wrongs };
};

/* ── act-1 : 31 − 9 + 4, deux élèves, 18 ou 26 ───────────────────────────────────────────────────────────────── */
export const WHO = {
  chain: '31 − 9 + 4',
  rows: [
    row('من على صواب في حساب $31 - 9 + 4$ ؟', 'الثاني (26)', ['الأول (18)', 'كلاهما'], 0, 'نحسب من اليسار: $31 - 9 = 22$ ثم $22 + 4 = 26$ .'),
    row('كيف حصل الأول على 18 ؟', 'جمع $9 + 4$ أوّلًا ثم طرحه من 31', ['طرح 9 من 31 ثم أضاف 4', 'ضرب 9 في 4'], 0, '$9 + 4 = 13$ ثم $31 - 13 = 18$ : بدأ من اليمين فأخطأ.'),
  ],
};

/* ── act-2 q1 / act-1 : vérifier des égalités (en pensant à la calculatrice) ─────────────────────────────────── */
export const CHECKS = [
  { text: '$24 + 15 - 7 = 32$', chain: '24 + 15 − 7', claim: '32' },
  { text: '$60 - 25 - 15 = 20$', chain: '60 − 25 − 15', claim: '20' },
  { text: '$36 \\div 4 \\times 3 = 27$', chain: '36 ÷ 4 × 3', claim: '27' },
  { text: '$8 \\times 5 \\div 4 = 10$', chain: '8 × 5 ÷ 4', claim: '10' },
  { text: '$8 + 3 \\times 4 = 44$', chain: '8 + 3 × 4', claim: '44' },
].map((c) => ({ ...c, answer: val(c.chain) === c.claim }));

/* ── ex-1 … ex-3 : des chaînes + − seules ou × ÷ seules ─────────────────────────────────────────────────────── */
export const CHAINS_ADD = [
  calc('35 − 12 + 5', [[1, 0]], 0),
  calc('35 − 12 − 5', [[1, 0]], 1),
  calc('90 ÷ 3 × 2', [[1, 0]], 2),
  calc('12 × 5 ÷ 6 ÷ 2', [[1, 0, 2], [2, 0, 1]], 0),
];

/* ── ex-4, ex-6 : la priorité ───────────────────────────────────────────────────────────────────────────────── */
export const CHAINS_PRIORITY = [
  calc('9 + 4 × 7', [[0, 1]], 1),
  calc('50 − 6 × 8', [[0, 1]], 2),
  calc('45 ÷ 9 + 6', [[1, 0]], 0),
  calc('0,5 × 12 − 4 × 0,25', [[0, 1, 2], [1, 2, 0]], 1),
];

/* ── ex-5 : la feuille d'un camarade, trois erreurs ──────────────────────────────────────────────────────────── */
export const SHEET = [
  { shown: '6 + 2 × 9 = 8 × 9 = 72', chain: '6 + 2 × 9', wrong: '72' },
  { shown: '20 − 5 + 3 = 20 − 8 = 12', chain: '20 − 5 + 3', wrong: '12' },
  { shown: '4 + 3 × 2 + 5 = 7 × 7 = 49', chain: '4 + 3 × 2 + 5', wrong: '49' },
].map((r, i) => {
  const right = val(r.chain);
  const decoys = [['24', '27', '18'], ['18', '28', '20'], ['15', '36', '19']][i].filter((v) => v !== right);
  return { ...r, right, ...row(`$${tex(r.shown)}$`, `خاطئة، والصحيح $${right}$`, decoys.slice(0, 2).map((d) => `خاطئة، والصحيح $${d}$`), i, `نبدأ بما يسبق: $${tex(r.chain)}$ يساوي $${right}$ لا $${r.wrong}$ .`) };
});

/* ── ex-7, deep-39 : compléter ───────────────────────────────────────────────────────────────────────────────── */
export const MISSING = [
  { label: '$6 \\ldots 12 \\ldots 3 = 10$', right: '$6 + 12 \\div 3$', wrongs: ['$6 \\times 12 \\div 3$', '$6 + 12 \\times 3$'], test: ['6 + 12 ÷ 3', '6 × 12 ÷ 3', '6 + 12 × 3'], target: '10' },
  { label: '$5 + 3 \\times \\ldots = 26$', right: '$7$', wrongs: ['$8$', '$9$'], test: ['5 + 3 × 7', '5 + 3 × 8', '5 + 3 × 9'], target: '26' },
  { label: '$40 - 4 \\times \\ldots = 12$', right: '$7$', wrongs: ['$6$', '$8$'], test: ['40 − 4 × 7', '40 − 4 × 6', '40 − 4 × 8'], target: '12' },
].map((m, i) => ({ ...m, ...row(m.label, m.right, m.wrongs, i, `نجرّب: $${tex(m.test[0])} = ${m.target}$ .`) }));

/* ── self-6 : les angles ─────────────────────────────────────────────────────────────────────────────────────── */
export const ANGLES = {
  chain: '95 − 38 − 21',
  rows: [
    row('أيّ سلسلة تعطي قيس $\\widehat{yOt}$ ؟', '$95 - 38 - 21$', ['$95 - 38 + 21$', '$95 + 38 - 21$'], 0, 'الزاوية الكبرى $95°$ تشمل الزوايا الثلاث، فنطرح منها الزاويتين الأخريين.'),
    row('قيس $\\widehat{yOt}$ بالدرجات:', '$36°$', ['$78°$', '$112°$'], 2, '$95 - 38 = 57$ ثم $57 - 21 = 36$ ، أي $36°$ .'),
  ],
};

export const EXERCISES = [
  {
    id: 'act-1', source: S('act-1', 8, 'أنشطة'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'حسب تلميذان $31 - 9 + 4$ ، فوجد الأول $18$ ووجد الثاني $26$ .',
    interaction: 'batch',
    question: { rows: WHO.rows.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'نحسب الجمع والطرح من اليسار نحو اليمين.' },
    commonError: 'جمع العددين الأخيرين أوّلًا.',
  },
  {
    id: 'act-2', source: S('act-2', 8, 'أنشطة'), cites: [S('act-1', 8, 'أنشطة')], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'تحقّق بالحساب من كلّ مساواة، كما لو أنّك تتأكّد بآلة حاسبة علمية:',
    interaction: 'trueFalse',
    question: {
      rows: CHECKS.map((c) => ({ text: c.text, answer: c.answer, why: `${T(c.chain)} $= ${val(c.chain)}$ .` })),
      explain: 'الآلة الحاسبة العلمية تحسب الضرب والقسمة قبل الجمع والطرح، ومن اليسار.',
    },
    commonError: 'حساب $8 + 3 \\times 4$ من اليسار فقط.',
  },
  {
    id: 'ex-1', source: S('ex-1', 14), cites: [S('ex-2', 14), S('ex-3', 14)], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'احسب كلّ سلسلة:',
    interaction: 'batch',
    question: { rows: CHAINS_ADD.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'من اليسار نحو اليمين، عملية بعد عملية.' },
    commonError: 'البدء بالجمع في سلسلة فيها طرح، أو بالضرب في سلسلة فيها قسمة.',
  },
  {
    id: 'ex-4', source: S('ex-4', 14), cites: [S('ex-6', 14)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'احسب، وابدأ بالعملية التي تسبق غيرها:',
    interaction: 'batch',
    question: { rows: CHAINS_PRIORITY.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'الضرب والقسمة قبل الجمع والطرح.' },
    commonError: 'الحساب من اليسار فقط عبر الضرب والجمع.',
  },
  {
    id: 'ex-5', source: S('ex-5', 14), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'كتب زميلك الحسابات التالية. ماذا تقول في كلّ منها؟',
    interaction: 'batch',
    question: { rows: SHEET.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'نصحّح بالقواعد: الضرب أوّلًا ثم من اليسار.' },
    commonError: 'قراءة الحساب من اليسار دون إعطاء الأسبقية للضرب.',
  },
  {
    id: 'ex-7', source: S('ex-7', 14), cites: [S('deep-39', 18, 'أتعمّق')], learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'أتمم كلّ مساواة:',
    interaction: 'batch',
    question: { rows: MISSING.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'نجرّب كلّ اختيار ونحسب بالقواعد.' },
    commonError: 'اختيار العدد المفقود دون تجربة الحساب كاملًا.',
  },
  {
    id: 'self-6', source: S('self-6', 17, 'أؤكّد تعلّماتي'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'زاوية $\\widehat{xOz}$ قيسها $95°$ ؛ داخلها الشعاعان $Oy$ و $Ot$ بحيث $\\widehat{xOy} = 38°$ و $\\widehat{tOz} = 21°$ ، وبين الشعاعين الزاوية $\\widehat{yOt}$ .',
    interaction: 'batch',
    question: { rows: ANGLES.rows.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'نترجم الوضعية بسلسلة طرح ثم نحسبها من اليسار.' },
    commonError: 'إضافة الزاوية الصغرى بدل طرحها.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `truth` : la chaîne qui fait la clé ; `bad` : l'ordre fautif
 * (indices d'opérateurs) qui reproduit l'option nommée (MISC-SILSILA-*) ; `cites` : les autres éléments que l'épreuve remplace.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P1, source: S('self-1', 17, 'أؤكّد تعلّماتي'), prompt: '$28 - 10 + 6$ يساوي:', options: ['$24$', '$12$', '$44$', '$22$'], correct: 0, truth: { chain: '28 − 10 + 6', bad: { 1: [1, 0] } }, miscs: { 1: 'MISC-SILSILA-ADDFIRST' } },
  { id: 'E2', lp: LP.P2, source: S('ex-4', 14), prompt: '$7 + 5 \\times 4$ يساوي:', options: ['$27$', '$48$', '$35$', '$20$'], correct: 0, truth: { chain: '7 + 5 × 4', bad: { 1: [0, 1] } }, miscs: { 1: 'MISC-SILSILA-NOPRIORITY' } },
  { id: 'E3', lp: LP.P1, source: S('self-1', 17, 'أؤكّد تعلّماتي'), prompt: '$72 \\div 6 \\times 2$ يساوي:', options: ['$24$', '$6$', '$144$', '$12$'], correct: 0, truth: { chain: '72 ÷ 6 × 2', bad: { 1: [1, 0] } }, miscs: { 1: 'MISC-SILSILA-MULFIRST' } },
  { id: 'E4', lp: LP.P2, source: null, prompt: '$3{,}5 + 2 \\times 1{,}5 - 6 \\div 3$ يساوي:', options: ['$4{,}5$', '$6{,}25$', '$6{,}5$', '$2{,}5$'], correct: 0, truth: { chain: '3,5 + 2 × 1,5 − 6 ÷ 3', bad: { 1: [0, 1, 3, 2] } }, miscs: { 1: 'MISC-SILSILA-NOPRIORITY' } },
  { id: 'E5', lp: LP.P3, source: null, prompt: 'اشترت ليلى 5 أقلام بـ $35$ DA للقلم وكرّاسًا بـ $60$ DA ، ودفعت $500$ DA . أيّ سلسلة تعطي الباقي؟', options: ['$500 - 5 \\times 35 - 60$', '$500 - 5 \\times 35 + 60$', '$500 - 5 + 35 - 60$', '$5 \\times 35 + 60 - 500$'], correct: 0, truth: { chain: '500 − 5 × 35 − 60', story: 265 }, miscs: { 1: 'MISC-SILSILA-STORYSIGN', 3: 'MISC-SILSILA-STORYORDER' } },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
