/**
 * Les exercices du درس « مقلوب عدد وقسمة كسرين » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source`
 * l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais
 * montré à l'élève. Chaque valeur est CALCULÉE ici avec `packages/core/arithmetic/fractions3.js` / `powers.js` et RE-vérifiée par ./content.test.js avec un autre
 * code (BigInt), qui contrôle aussi que chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit2/extraction.json) : act-1, ex-1, ex-2, ex-4 … ex-7, deep-59 → module 4 ; self-1, self-7, self-11 (et prep 1) → le إختبار أولي
 * (module 8) ; deep-71 → la مسألة 3 (module 7, `sourceElementIds`).
 */
import * as Q from '@smarter-academy/core/arithmetic/powers.js';
import * as F3 from '@smarter-academy/core/arithmetic/fractions3.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_maqlub-qismat-kasrayn_P1',
  P2: '3am_maqlub-qismat-kasrayn_P2',
  P3: '3am_maqlub-qismat-kasrayn_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
/** Un nombre écrit en texte (« 3/8 », « 0,75 », « 9 ») → LaTeX d'affichage. */
export const tex = (s) => {
  const t = String(s);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(t);
  if (m) return `${m[1]}\\frac{${m[2]}}{${m[3]}}`;
  return t.replace(',', '{,}');
};
const T = (s) => `$${tex(s)}$`;
const val = (s) => F3.valueOf(String(s).includes('/') ? F3.raw(...String(s).split('/')) : s);
const text = (r) => Q.ratText(r);
const mulS = (a, b) => text(Q.mul(val(a), val(b)));
const divS = (a, b) => text(Q.div(val(a), val(b)));
const recipS = (a) => text(Q.inverse(val(a)));
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(T(right), wrongs.map(T), at), correction });

/** Une ligne de DIVISION p ÷ q : les distracteurs sont les trois erreurs de la leçon (pas de retournement, retourner le premier, retourner les deux). */
const divRow = (p, q, at, label) => {
  const right = divS(p, q);
  const bad = [mulS(p, q), mulS(recipS(p), q), mulS(recipS(p), recipS(q))].filter((v, i, a) => v !== right && a.indexOf(v) === i);
  return { p, q, right, wrongs: bad.slice(0, 2), ...row(label, right, bad.slice(0, 2), at,
    `$${tex(p)} \\div ${tex(q)} = ${tex(p)} \\times ${tex(recipS(q))} = ${tex(right)}$ .`) };
};
const recipRow = (x, at, label, shown) => {
  const right = recipS(x);
  const wrongs = [text(Q.neg(val(x))), String(x).includes('/') ? text(Q.inverse(val(String(x).split('/')[0]))) : null, String(x)]
    .filter((v) => v && v !== right);
  return { x, right, wrongs: wrongs.slice(0, 2), ...row(label ?? `مقلوب $${tex(x)}$`, right, wrongs.slice(0, 2), at, shown) };
};

/* ── act-1 : le partage d'une part par un naturel, puis les trois formes de division ───────────────────────────────── */
const DIV_ROWS = [
  { ...divRow('3/5', '2', 0, 'نصيب كلّ فوج من $\\frac{3}{5}$ يُقسَّم على فوجين: $\\frac{3}{5} \\div 2$') },
  { ...divRow('5/6', '5', 1, 'نصيب كلّ فوج من $\\frac{5}{6}$ يُقسَّم على $5$ أفواج: $\\frac{5}{6} \\div 5$') },
  { ...divRow('4', '2/3', 2, '$4 \\div \\frac{2}{3}$') },
  { ...divRow('5/6', '5/4', 0, '$\\frac{5}{6} \\div \\frac{5}{4}$') },
  { ...divRow('9/10', '3/5', 1, '$\\frac{9}{10} \\div \\frac{3}{5}$') },
];

/* ── ex-1, ex-2 : des مقلوبات ─────────────────────────────────────────────────────────────────────────────────────── */
export const RECIPS = [
  recipRow('9', 0, 'مقلوب $9$', '$\\frac{1}{9}$ : جداؤه مع $9$ يساوي $1$ .'),
  recipRow('0,5', 1, 'مقلوب $0{,}5$', '$0{,}5 = \\frac{1}{2}$ ، فمقلوبه $2$ .'),
  recipRow('0,04', 2, 'مقلوب $0{,}04$', '$0{,}04 = \\frac{4}{100} = \\frac{1}{25}$ ، فمقلوبه $25$ .'),
  recipRow('3/8', 0, 'مقلوب $\\frac{3}{8}$', '$\\frac{3}{8} \\times \\frac{8}{3} = 1$ .'),
  recipRow('6/5', 1, 'مقلوب $\\frac{6}{5}$', '$\\frac{6}{5} \\times \\frac{5}{6} = 1$ .'),
  recipRow('5/2', 2, '$\\left(\\frac{5}{2}\\right)^{-1}$', '$\\left(\\frac{5}{2}\\right)^{-1} = \\frac{2}{5}$ .'),
];

/* ── ex-4 : des جداءات mentaux ────────────────────────────────────────────────────────────────────────────────────── */
export const MENTAL = [
  { p: '8/3', q: '3/8', wrongs: ['64/9', '8/3'] },
  { p: '5/7', q: '14/15', wrongs: ['70/15', '19/22'] },
  { p: '9/4', q: '4/9', wrongs: ['81/16', '9/4'] },
].map((m, i) => row(`$${tex(m.p)} \\times ${tex(m.q)}$`, mulS(m.p, m.q), m.wrongs.filter((w) => w !== mulS(m.p, m.q)).slice(0, 2), i,
  `$${tex(m.p)} \\times ${tex(m.q)} = ${tex(mulS(m.p, m.q))}$ .`));

/* ── ex-5, ex-6, ex-7 ─────────────────────────────────────────────────────────────────────────────────────────────── */
export const SIMPLIFY = [['21/10', '15/14'], ['16/27', '9/8']];
export const SIMPLE = [['15/8', '3'], ['10', '5/2'], ['7', '21/4']];
export const COMPUTE = [['18/25', '27/10'], ['14/9', '35/27']];
const simpRows = SIMPLIFY.map(([p, q], i) => row(`$${tex(p)} \\times ${tex(q)}$`, mulS(p, q),
  [text(Q.add(val(p), val(q))), mulS(p, recipS(q))].filter((w) => w !== mulS(p, q)).slice(0, 2), i, `نختزل قبل الضرب: $${tex(p)} \\times ${tex(q)} = ${tex(mulS(p, q))}$ .`));
const simpleRows = SIMPLE.map(([p, q], i) => {
  const r = divRow(p, q, i, `$${tex(p)} \\div ${tex(q)}$`);
  return r;
});
const computeRows = COMPUTE.map(([p, q], i) => divRow(p, q, i + 1, `$${tex(p)} \\div ${tex(q)}$`));

export const EXERCISES = [
  {
    id: 'act-1', source: S('act-1', 24, 'أنشطة'), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'جدارية مدرسية تغطي $\\frac{3}{5}$ من جدار، ثم $\\frac{5}{6}$ منه في موضع آخر، وتتقاسم الأفواج رسمها بالتساوي. اختر الناتج الصحيح في كلّ سطر:',
    interaction: 'batch',
    question: { rows: DIV_ROWS.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'القسمة على عدد هي الضرب في مقلوبه، حتى حين يكون الناتج أكبر من المقسوم.' },
    commonError: 'ضرب الكسرين كما هما، أو قلب المقسوم بدل المقسوم عليه.',
  },
  {
    id: 'ex-1', source: S('ex-1', 30), cites: [S('ex-2', 30)], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'اختر مقلوب كلّ عدد:',
    interaction: 'batch',
    question: { rows: RECIPS.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'مقلوب $x$ هو العدد الذي جداؤه مع $x$ يساوي $1$ .' },
    commonError: 'اعتبار المقلوب هو المعاكس، أو قلب البسط فقط.',
  },
  {
    id: 'ex-4', source: S('ex-4', 30), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'احسب ذهنيًا (جداءان منها يساوي أحدهما مقلوب الآخر):',
    interaction: 'batch',
    question: { rows: MENTAL.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'إذا كان أحد العددين مقلوب الآخر فجداؤهما $1$ .' },
    commonError: 'ضرب البسطين وحدهما أو المقامين وحدهما.',
  },
  {
    id: 'ex-5', source: S('ex-5', 30), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'بسّط ثم احسب:',
    interaction: 'batch',
    question: { rows: simpRows.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'نحذف العوامل المشتركة بين بسط وأحد المقامين قبل أن نضرب.' },
    commonError: 'الضرب أولًا ثم الاختزال في أعداد كبيرة.',
  },
  {
    id: 'ex-6', source: S('ex-6', 30), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'اكتب على شكل كسر مبسّط:',
    interaction: 'batch',
    question: { rows: simpleRows.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'القسمة على عدد غير معدوم هي الضرب في مقلوبه، سواء كان طبيعيًا أو كسرًا.' },
    commonError: 'قسمة البسط والمقام كلّ على حدة.',
  },
  {
    id: 'ex-7', source: S('ex-7', 30), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب ثم بسّط النتيجة:',
    interaction: 'batch',
    question: { rows: computeRows.map(({ label, options, correct, correction }) => ({ label, options, correct, correction })), explain: 'نضرب في المقلوب، ثم نكتب الناتج على أبسط شكل.' },
    commonError: 'ترك الناتج غير مبسّط.',
  },
  {
    id: 'deep-59', source: S('deep-59', 34, 'أتعمّق'), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'قطعة مستطيلة من الخشب مساحتها $\\frac{21}{8}\\ \\mathrm{m^2}$ وطولها $\\frac{7}{2}\\ \\mathrm{m}$ .',
    interaction: 'fraction',
    question: { prompt: 'عرضها بالمتر (كسر غير قابل للاختزال):', expected: divS('21/8', '7/2'), explain: 'المساحة $=$ الطول $\\times$ العرض، فالعرض $= \\frac{21}{8} \\div \\frac{7}{2} = \\frac{21}{8} \\times \\frac{2}{7} = \\frac{3}{4}\\ \\mathrm{m}$ .' },
    commonError: 'ضرب المساحة في الطول بدل القسمة.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `truth` : le calcul qui fait la clé.
 * `cites` : les autres éléments que l'épreuve remplace.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P1, source: S('prep', 23, 'أستعدّ'), prompt: 'مقلوب $\\frac{3}{8}$ هو:', options: ['$\\frac{8}{3}$', '$-\\frac{3}{8}$', '$\\frac{1}{8}$', '$0{,}38$'], correct: 0, truth: { kind: 'recip', x: '3/8' } },
  { id: 'E2', lp: LP.P3, source: S('self-1', 33, 'أؤكّد تعلّماتي'), prompt: '$\\frac{5}{6} \\div \\frac{10}{9}$ يساوي:', options: ['$\\frac{3}{4}$', '$\\frac{25}{27}$', '$\\frac{4}{3}$', '$\\frac{27}{25}$'], correct: 0, truth: { kind: 'div', p: '5/6', q: '10/9' } },
  { id: 'E3', lp: LP.P2, source: null, prompt: '$12 \\div \\frac{4}{5}$ يساوي:', options: ['$15$', '$\\frac{48}{5}$', '$\\frac{1}{15}$', '$\\frac{3}{5}$'], correct: 0, truth: { kind: 'div', p: '12', q: '4/5' } },
  { id: 'E4', lp: LP.P2, source: S('self-7', 33, 'أؤكّد تعلّماتي'), cites: [S('self-11', 33, 'أؤكّد تعلّماتي')], prompt: '$\\frac{7}{9} \\div 14$ يساوي:', options: ['$\\frac{1}{18}$', '$\\frac{98}{9}$', '$18$', '$\\frac{1}{2}$'], correct: 0, truth: { kind: 'div', p: '7/9', q: '14' } },
  { id: 'E5', lp: LP.P3, source: null, prompt: 'كم قارورة سعتها $\\frac{3}{4}\\ \\mathrm{L}$ نملأ من $6\\ \\mathrm{L}$ من العصير؟', options: ['$8$', '$\\frac{9}{2}$', '$\\frac{1}{8}$', '$\\frac{15}{2}$'], correct: 0, truth: { kind: 'div', p: '6', q: '3/4' } },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
