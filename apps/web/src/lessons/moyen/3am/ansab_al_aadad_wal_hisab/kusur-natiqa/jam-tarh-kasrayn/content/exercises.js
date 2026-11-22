/**
 * Les exercices du درس « جمع وطرح كسرين » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source` l'élément du manuel
 * dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève. Les expressions, les
 * clés et les distracteurs sont écrits ICI en LITTÉRAUX (texte « a/b ») et RE-vérifiés par ./content.test.js avec un code en BigInt (parseur et ppcm propres), qui contrôle aussi que
 * chaque distracteur est FAUX. Destinations (docs/sources/3am/unit2/extraction.json) : act-4, now-2, ex-11, ex-18…21, deep-62, deep-65 → module 4 ; know-4 → module 2 ; method-5 → « تذكّر » ;
 * method-6 → module 3 ; prep 6–7 → module 0 ; deep-74 → module 6 ; ex-19, self-2, self-3, deep-80 → la banque d'exercices ; le إختبار أولي (module 8) est de la plateforme.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_jam-tarh-kasrayn_P1',
  P2: '3am_jam-tarh-kasrayn_P2',
  P3: '3am_jam-tarh-kasrayn_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (p) => { const [a, b] = String(p).split('/'); return b === undefined || b === '1' ? `${a}` : `\\frac{${a}}{${b}}`; };
const M = (p) => `$${T(p)}$`;
/** Les expressions sont des listes de termes « + a/b » / « − a/b » ou d'entiers : `['+', '7/8', '-', '1/6']`. */
const expr = (terms) => terms.map((t) => (t === '+' || t === '-' ? (t === '+' ? '+' : '-') : T(t))).join('');
/** Une ligne de calcul : l'expression, la clé et deux distracteurs ; la clé est placée à la position `at` (0, 1 ou 2) pour ne pas être toujours la première. */
const row = (terms, key, wrongs, at, correction) => {
  const options = [...wrongs];
  options.splice(at, 0, key);
  return { terms, expr: `$${expr(terms)}$`, key, wrongs, label: `$${expr(terms)}$`, options: options.map(M), correct: at, correction };
};

/* ── act-4 : sommes et différences de deux fractions de dénominateurs sans multiple l'un de l'autre ─────────────── */
export const CALC1 = [
  row(['7/8', '-', '1/6'], '17/24', ['6/2', '6/24'], 0, '$24$ est un multiple commun de $8$ et $6$ : $\\frac{21}{24}-\\frac{4}{24}=\\frac{17}{24}$ .'),
  row(['1/3', '+', '3/4'], '13/12', ['4/7', '4/12'], 1, '$12$ : $\\frac{4}{12}+\\frac{9}{12}=\\frac{13}{12}$ .'),
  row(['9/4', '-', '5/6'], '17/12', ['4/12', '19/12'], 2, '$12$ : $\\frac{27}{12}-\\frac{10}{12}=\\frac{17}{12}$ .'),
  row(['3/10', '+', '7/4'], '41/20', ['10/14', '10/20'], 1, '$20$ : $\\frac{6}{20}+\\frac{35}{20}=\\frac{41}{20}$ .'),
];

/* ── now-2, ex-21 : trois termes et un nombre naturel ──────────────────────────────────────────────────────── */
export const CALC2 = [
  row(['5/6', '-', '1/4', '+', '2/3'], '5/4', ['6/6', '7/4'], 2, '$12$ : $\\frac{10}{12}-\\frac{3}{12}+\\frac{8}{12}=\\frac{15}{12}=\\frac{5}{4}$ .'),
  row(['3', '+', '5/8', '-', '7/12'], '73/24', ['73/12', '79/24'], 1, '$3=\\frac{72}{24}$ ، و $\\frac{5}{8}=\\frac{15}{24}$ ، و $\\frac{7}{12}=\\frac{14}{24}$ : $72+15-14=73$ .'),
];

/* ── ex-11 (cite ex-19) : le plus petit multiple commun de deux dénominateurs ───────────────────────────────── */
const lcmRow = (a, b, key, wrongs, at) => ({ pair: [a, b], key, wrongs, label: `$${a}$ و $${b}$`, options: (() => { const o = [...wrongs]; o.splice(at, 0, key); return o.map((x) => `$${x}$`); })(), correct: at, correction: `مضاعفات $${Math.max(a, b)}$ : نصل إلى $${key}$ وهو يقبل القسمة على $${Math.min(a, b)}$ .` });
export const LCMS = [
  lcmRow(6, 9, 18, [54, 15], 0),
  lcmRow(8, 12, 24, [96, 20], 2),
  lcmRow(10, 15, 30, [150, 25], 1),
  lcmRow(14, 21, 42, [294, 35], 0),
  lcmRow(9, 12, 36, [108, 21], 2),
];

/* ── ex-18 : le calcul mental ─────────────────────────────────────────────────────────────────────────────── */
export const MENTAL = [
  row(['1/2', '+', '1/4'], '3/4', ['2/6', '2/4'], 1, '$\\frac{2}{4}+\\frac{1}{4}=\\frac{3}{4}$ .'),
  row(['5/6', '-', '1/3'], '1/2', ['4/3', '4/6'], 0, '$\\frac{1}{3}=\\frac{2}{6}$ : $\\frac{5}{6}-\\frac{2}{6}=\\frac{3}{6}=\\frac{1}{2}$ .'),
  row(['1', '+', '2/5'], '7/5', ['3/5', '7/10'], 2, '$1=\\frac{5}{5}$ ، فـ $\\frac{5}{5}+\\frac{2}{5}=\\frac{7}{5}$ .'),
  row(['4', '-', '3/4'], '13/4', ['1/4', '3/4'], 1, '$4=\\frac{16}{4}$ ، فـ $\\frac{16}{4}-\\frac{3}{4}=\\frac{13}{4}$ .'),
];

/* ── ex-20 : sommes écrites sur leur plus simple forme ─────────────────────────────────────────────────────── */
export const SIMPLEST = [
  row(['5/6', '+', '4/9'], '23/18', ['9/15', '29/18'], 0, '$18$ : $\\frac{15}{18}+\\frac{8}{18}=\\frac{23}{18}$ ، وهو غير قابل للاختزال.'),
  row(['7/12', '+', '3/8'], '23/24', ['10/20', '46/48'], 2, '$24$ : $\\frac{14}{24}+\\frac{9}{24}=\\frac{23}{24}$ ؛ ($\\frac{46}{48}$ يساويه لكنّه قابل للاختزال).'),
  row(['11/15', '-', '3/10'], '13/30', ['8/5', '26/60'], 1, '$30$ : $\\frac{22}{30}-\\frac{9}{30}=\\frac{13}{30}$ .'),
  row(['1/2', '+', '1/3', '+', '1/5'], '31/30', ['3/10', '31/60'], 1, '$30$ : $\\frac{15}{30}+\\frac{10}{30}+\\frac{6}{30}=\\frac{31}{30}$ .'),
];

/* ── deep-62, deep-65 : un terme manquant ───────────────────────────────────────────────────────────────────── */
export const MISSING = { lhs: '19/20', parts: ['1/2', '1/3', '1/12'], x: 30 };                  // 19/20 = 1/2 + 1/3 + 1/12 + 1/x
export const MISSING2 = { lhs: '5/6', whole: 2, minus: ['3/4'], options: ['12/5', '5/12', '12'], correct: 0 };   // 5/6 = 2 − 3/4 − 1/x → x = 12/5

const rows = (list) => list.map(({ label, options, correct, correction }) => ({ label, options, correct, correction }));

export const EXERCISES = [
  {
    id: 'act-4', source: S('act-4', 24, 'أنشطة'), cites: [], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'احسب كلّ مجموع أو فرق ثمّ اختر النتيجة الصحيحة:',
    interaction: 'batch',
    question: { rows: rows(CALC1), explain: 'نكتب الكسرين بمقام مشترك ثمّ نجمع البسطين أو نطرحهما.' },
    commonError: 'جمع البسطين وجمع المقامين.',
  },
  {
    id: 'now-2', source: S('now-2', 27, 'دورك الآن'), cites: [S('ex-21', 31)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'احسب ثلاثة حدود مع عدد طبيعي:',
    interaction: 'batch',
    question: { rows: rows(CALC2), explain: 'نكتب العدد الطبيعي كسرًا بالمقام المشترك ثمّ نحسب بالترتيب.' },
    commonError: 'طرح البسط وحده من العدد الطبيعي.',
  },
  {
    id: 'ex-11', source: S('ex-11', 30), cites: [S('ex-19', 30)], learningPointId: LP.P3, difficulty: 'facile',
    statement: 'اختر أصغر مضاعف مشترك غير معدوم لكلّ زوج:',
    interaction: 'batch',
    question: { rows: rows(LCMS), explain: 'نكتب مضاعفات العدد الأكبر حتى نجد أوّل مضاعف يقبل القسمة على الآخر.' },
    commonError: 'الاكتفاء بالجداء أو بالمجموع.',
  },
  {
    id: 'ex-18', source: S('ex-18', 30), cites: [], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'احسب ذهنيًا ثمّ اختر النتيجة:',
    interaction: 'batch',
    question: { rows: rows(MENTAL), explain: 'اكتب أحد الحدّين بمقام الآخر، أو اكتب العدد الطبيعي كسرًا.' },
    commonError: 'طرح العدد الطبيعي من البسط فقط.',
  },
  {
    id: 'ex-20', source: S('ex-20', 30), cites: [], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'احسب واختر النتيجة مكتوبةً على أبسط شكل:',
    interaction: 'batch',
    question: { rows: rows(SIMPLEST), explain: 'بعد الحساب نتحقّق إن كان البسط والمقام يقبلان القسمة على عدد واحد.' },
    commonError: 'ترك النتيجة قابلة للاختزال.',
  },
  {
    id: 'deep-62', source: S('deep-62', 34, 'أتعمّق'), cites: [], learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'جد العدد الطبيعي $x$ الذي يجعل المساواة $\\frac{19}{20}=\\frac{1}{2}+\\frac{1}{3}+\\frac{1}{12}+\\frac{1}{x}$ صحيحة.',
    interaction: 'numeric',
    question: { prompt: 'العدد $x$ :', expected: MISSING.x, display: '30', explain: '$\\frac{1}{2}+\\frac{1}{3}+\\frac{1}{12}=\\frac{11}{12}$ و $\\frac{19}{20}-\\frac{11}{12}=\\frac{57}{60}-\\frac{55}{60}=\\frac{1}{30}$ ، فـ $x=30$ .' },
    commonError: 'الاكتفاء بطرح البسوط.',
  },
  {
    id: 'deep-65', source: S('deep-65', 34, 'أتعمّق'), cites: [], learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'أيّ قيمة لـ $x$ تحقّق $\\frac{5}{6}=2-\\frac{3}{4}-\\frac{1}{x}$ ؟',
    interaction: 'choice',
    question: { options: MISSING2.options.map((o) => `$x=${T(o)}$`), correct: MISSING2.correct, cols: 3, explain: '$\\frac{1}{x}=2-\\frac{3}{4}-\\frac{5}{6}=\\frac{24}{12}-\\frac{9}{12}-\\frac{10}{12}=\\frac{5}{12}$ ، فـ $x=\\frac{12}{5}$ .' },
    commonError: 'أخذ $\\frac{1}{x}$ على أنّه $x$ .',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `truth` : le calcul qui fait la clé.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P2, source: null, prompt: '$\\frac{2}{3}+\\frac{1}{4}$', options: ['$\\frac{11}{12}$', '$\\frac{3}{7}$', '$\\frac{3}{12}$', '$\\frac{11}{7}$'], correct: 0, truth: { kind: 'calc', terms: ['2/3', '+', '1/4'] } },
  { id: 'E2', lp: LP.P3, source: null, prompt: 'أصغر مقام مشترك لـ $\\frac{3}{10}$ و $\\frac{5}{8}$', options: ['$40$', '$80$', '$18$', '$10$'], correct: 0, truth: { kind: 'lcm', dens: [10, 8] } },
  { id: 'E3', lp: LP.P1, source: null, prompt: '$\\frac{5}{6}-\\frac{3}{4}$', options: ['$\\frac{1}{12}$', '$\\frac{2}{2}$', '$\\frac{2}{12}$', '$\\frac{1}{24}$'], correct: 0, truth: { kind: 'calc', terms: ['5/6', '-', '3/4'] } },
  { id: 'E4', lp: LP.P2, source: null, prompt: '$3-\\frac{5}{8}$', options: ['$\\frac{19}{8}$', '$-\\frac{2}{8}$', '$\\frac{2}{5}$', '$\\frac{19}{5}$'], correct: 0, truth: { kind: 'calc', terms: ['3', '-', '5/8'] } },
  { id: 'E5', lp: LP.P2, source: null, prompt: 'زُرع $\\frac{1}{3}$ حقل قمحًا و $\\frac{2}{9}$ منه شعيرًا. ما الجزء غير المزروع؟', options: ['$\\frac{4}{9}$', '$\\frac{3}{4}$', '$\\frac{5}{9}$', '$\\frac{1}{3}$'], correct: 0, truth: { kind: 'rest', parts: ['1/3', '2/9'] } },
];
