/**
 * Les exercices du درس « العمليات على الأعداد الناطقة » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source` l'élément du manuel dont il
 * est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève. Chaque ligne porte une expression `calc` (syntaxe
 * simple : nombres, `/` fraction, `+ - * ÷`, parenthèses) et sa valeur attendue `target` ; chaque option porte aussi son `calc` : ./content.test.js recalcule tout avec un évaluateur BigInt PROPRE
 * (jamais celui de packages/core) et vérifie qu'un seul choix est juste et que chaque distracteur est FAUX. Chaque distracteur est une erreur nommée (MISC-AMAL-* : signe de la somme, distances
 * additionnées, BASE/ACROSS, signe du produit, division sans retournement, dividende retourné, مقلوب sans signe, priorité, numérateur décimal). Destinations (docs/sources/3am/unit2/extraction.json) :
 * act-6, ex-34, ex-35, ex-36, ex-37, ex-42, ex-43, ex-44, ex-48, ex-50, deep-64, ex-53, now-3, deep-60, deep-63, ex-54, ex-40 → module 4 ; know-6 → module 2 ; method-7, 8, 9 → module 3 ; prep 9–11 →
 * module 0 ; deep-79 → module 5 ; deep-58, deep-76 → module 6 ; deep-73, deep-77, ict → module 7 ; le reste (ex-3, ex-38…, self-5, self-6, deep-57, deep-66, deep-68…) → la banque d'exercices.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_amaliyat-natiqa_P1',
  P2: '3am_amaliyat-natiqa_P2',
  P3: '3am_amaliyat-natiqa_P3',
  P4: '3am_amaliyat-natiqa_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
/** Un rationnel écrit « -14/11 » ou « 6 » → LaTeX. */
export const rtex = (w) => {
  const neg = String(w).startsWith('-');
  const [a, b] = String(w).replace('-', '').split('/');
  return b === undefined ? `${neg ? '-' : ''}${a}` : `${neg ? '-' : ''}\\frac{${a}}{${b}}`;
};
const T = (w) => `$${rtex(w)}$`;

/** Une ligne à choix : l'énoncé LaTeX, son calcul, sa valeur, trois options (la clé et deux erreurs nommées). */
const row = (label, calc, key, wrongs, at, correction) => {
  const opts = [...wrongs];
  opts.splice(at, 0, key);
  return { label: `$${label}$`, calc, target: key, options: opts.map((o) => ({ t: T(o), calc: o })), correct: at, correction };
};
const rows = (list) => list.map(({ label, options, correct, correction }) => ({ label, options: options.map((o) => o.t), correct, correction }));

/* ── act-6 ① : produits ──────────────────────────────────────────────────────────────────────────────────── */
export const PRODUCTS = [
  row('\\frac{3}{4}\\times\\frac{5}{9}', '3/4*5/9', '5/12', ['-5/12', '20/27'], 0, '$\\frac{3\\times5}{4\\times9}=\\frac{15}{36}=\\frac{5}{12}$ .'),
  row('\\left(-\\frac{3}{4}\\right)\\times\\left(-\\frac{5}{9}\\right)', '(-3/4)*(-5/9)', '5/12', ['-5/12', '27/20'], 1, 'عاملان سالبان: الجداء موجب، $\\frac{15}{36}=\\frac{5}{12}$ .'),
  row('\\frac{4}{11}\\times\\left(-\\frac{7}{2}\\right)', '4/11*(-7/2)', '-14/11', ['14/11', '-11/14'], 2, 'مختلفا الإشارة: سالب، $\\frac{28}{22}=\\frac{14}{11}$ .'),
  row('\\frac{-9}{10}\\times\\frac{25}{-6}', '-9/10*25/-6', '15/4', ['-15/4', '4/15'], 0, 'في كل كسر إشارة سالبة واحدة، فالجداء موجب: $\\frac{225}{60}=\\frac{15}{4}$ .'),
  row('-15\\times\\left(-\\frac{2}{5}\\right)', '-15*(-2/5)', '6', ['-6', '75/2'], 1, 'عاملان سالبان: $\\frac{30}{5}=6$ .'),
];
/* ── act-6 ② : sommes ───────────────────────────────────────────────────────────────────────────────────── */
export const SUMS = [
  row('\\frac{7}{6}+\\left(-\\frac{13}{8}\\right)', '7/6+(-13/8)', '-11/24', ['11/24', '-3/7'], 0, 'بالمقام $24$ : $\\frac{28}{24}-\\frac{39}{24}=-\\frac{11}{24}$ . ($-\\frac{3}{7}$ جمع البسطين والمقامين.)'),
  row('-\\frac{5}{12}+\\frac{3}{4}', '-5/12+3/4', '1/3', ['-1/3', '-7/6'], 1, 'بالمقام $12$ : $-\\frac{5}{12}+\\frac{9}{12}=\\frac{4}{12}=\\frac{1}{3}$ .'),
  row('\\frac{5}{6}+\\left(-\\frac{7}{10}\\right)', '5/6+(-7/10)', '2/15', ['-2/15', '23/15'], 2, 'بالمقام $30$ : $\\frac{25}{30}-\\frac{21}{30}=\\frac{4}{30}=\\frac{2}{15}$ .'),
];
/* ── act-6 ③ : quotients ────────────────────────────────────────────────────────────────────────────────── */
export const QUOTIENTS = [
  row('\\frac{3}{8}\\div\\frac{9}{4}', '3/8÷9/4', '1/6', ['27/32', '6'], 0, '$\\frac{3}{8}\\times\\frac{4}{9}=\\frac{12}{72}=\\frac{1}{6}$ .'),
  row('-5\\div\\frac{10}{3}', '-5÷10/3', '-3/2', ['3/2', '-50/3'], 1, '$-5\\times\\frac{3}{10}=-\\frac{3}{2}$ .'),
  row('-\\frac{4}{7}\\div8', '-4/7÷8', '-1/14', ['1/14', '-32/7'], 2, '$-\\frac{4}{7}\\times\\frac{1}{8}=-\\frac{4}{56}=-\\frac{1}{14}$ .'),
  row('-\\frac{3}{10}\\div\\left(-\\frac{9}{5}\\right)', '-3/10÷(-9/5)', '1/6', ['-1/6', '6'], 0, 'عددان سالبان: $\\frac{3}{10}\\times\\frac{5}{9}=\\frac{15}{90}=\\frac{1}{6}$ .'),
];
/* ── ex-34, ex-35, ex-36 ────────────────────────────────────────────────────────────────────────────────── */
export const SUMS2 = [
  row('-\\frac{3}{4}-\\frac{5}{6}', '-3/4-5/6', '-19/12', ['19/12', '1/12'], 0, 'بالمقام $12$ : $-\\frac{9}{12}-\\frac{10}{12}=-\\frac{19}{12}$ .'),
  row('\\frac{2}{9}+\\left(-\\frac{7}{9}\\right)', '2/9+(-7/9)', '-5/9', ['5/9', '-1'], 1, 'المقام نفسه: $\\frac{2-7}{9}=-\\frac{5}{9}$ .'),
  row('\\frac{-11}{6}+\\frac{4}{-9}', '-11/6+4/-9', '-41/18', ['41/18', '-1'], 2, 'بالمقام $18$ : $-\\frac{33}{18}-\\frac{8}{18}=-\\frac{41}{18}$ .'),
  row('1-\\frac{7}{4}', '1-7/4', '-3/4', ['3/4', '11/4'], 0, '$\\frac{4}{4}-\\frac{7}{4}=-\\frac{3}{4}$ .'),
];
/* ── ex-42, ex-43, ex-44 ────────────────────────────────────────────────────────────────────────────────── */
export const MIXED = [
  row('\\frac{-6}{7}\\times\\frac{14}{-9}', '-6/7*14/-9', '4/3', ['-4/3', '3/4'], 0, 'الإشارتان تلغي إحداهما الأخرى: $\\frac{84}{63}=\\frac{4}{3}$ .'),
  row('\\frac{0{,}6}{-4}\\times\\frac{10}{9}', '0.6/-4*10/9', '-1/6', ['1/6', '-5/3'], 1, '$\\frac{0{,}6}{-4}=-0{,}15$ ؛ $-0{,}15\\times\\frac{10}{9}=-\\frac{1{,}5}{9}=-\\frac{1}{6}$ . ($-\\frac{5}{3}$ أهمل الفاصلة.)'),
  row('-\\frac{8}{15}\\div\\left(-\\frac{4}{5}\\right)', '-8/15÷(-4/5)', '2/3', ['-2/3', '32/75'], 2, 'سالبان: $\\frac{8}{15}\\times\\frac{5}{4}=\\frac{40}{60}=\\frac{2}{3}$ .'),
  row('\\frac{2{,}4}{5}\\div(-0{,}8)', '2.4/5÷(-0.8)', '-3/5', ['3/5', '-48/125'], 0, '$\\frac{2{,}4}{5}=0{,}48$ ؛ $0{,}48\\div(-0{,}8)=-0{,}6=-\\frac{3}{5}$ .'),
];
/* ── ex-48, ex-50, deep-64 : fractions composées ────────────────────────────────────────────────────────── */
export const COMPOUND = [
  row('\\dfrac{\\frac{2}{3}-\\frac{1}{2}}{\\frac{1}{4}+\\frac{1}{6}}', '(2/3-1/2)/(1/4+1/6)', '2/5', ['5/2', '1/5'], 1, 'البسط $\\frac{1}{6}$ والمقام $\\frac{5}{12}$ : $\\frac{1}{6}\\times\\frac{12}{5}=\\frac{2}{5}$ .'),
  row('1+\\dfrac{1}{1+\\frac{1}{2}}', '1+1/(1+1/2)', '5/3', ['4/3', '3/2'], 0, 'المقام $1+\\frac{1}{2}=\\frac{3}{2}$ ، فالكسر $\\frac{2}{3}$ ، والمجموع $\\frac{5}{3}$ .'),
];
/* ── ex-53, now-3 : a et b ──────────────────────────────────────────────────────────────────────────────── */
export const AB = [
  row('a-b', '-3/10-4/-15', '-1/30', ['-17/30', '17/30'], 0, '$b=-\\frac{4}{15}$ : $-\\frac{9}{30}+\\frac{8}{30}=-\\frac{1}{30}$ .'),
  row('a+b', '-3/10+4/-15', '-17/30', ['17/30', '-1/30'], 1, '$-\\frac{9}{30}-\\frac{8}{30}=-\\frac{17}{30}$ .'),
  row('a\\times b', '-3/10*4/-15', '2/25', ['-2/25', '25/2'], 2, 'سالبان: $\\frac{12}{150}=\\frac{2}{25}$ .'),
  row('a\\div b', '-3/10÷(4/-15)', '9/8', ['-9/8', '8/9'], 0, 'سالبان: $\\frac{3}{10}\\times\\frac{15}{4}=\\frac{45}{40}=\\frac{9}{8}$ .'),
  row('b\\div a', '(4/-15)÷(-3/10)', '8/9', ['-8/9', '9/8'], 1, 'مقلوب $a\\div b$ : $\\frac{4}{15}\\times\\frac{10}{3}=\\frac{40}{45}=\\frac{8}{9}$ .'),
];
/* ── deep-60 : deux nombres d'une liste ─────────────────────────────────────────────────────────────────── */
const pair = (t, calc) => ({ t: `$${t}$`, calc });
export const PAIRS = [
  { label: 'جداؤهما $-\\frac{1}{2}$', target: '-1/2', options: [pair('-\\frac{2}{3}\\times\\frac{3}{4}', '-2/3*3/4'), pair('\\frac{3}{4}\\times\\frac{1}{2}', '3/4*1/2'), pair('-\\frac{5}{6}\\times\\frac{1}{2}', '-5/6*1/2')], correct: 0, correction: '$-\\frac{2}{3}\\times\\frac{3}{4}=-\\frac{6}{12}=-\\frac{1}{2}$ .' },
  { label: 'الفرق بينهما (الأوّل ناقص الثاني) $\\frac{19}{12}$', target: '19/12', options: [pair('\\frac{4}{3}-\\frac{1}{2}', '4/3-1/2'), pair('\\frac{3}{4}-\\left(-\\frac{5}{6}\\right)', '3/4-(-5/6)'), pair('\\frac{1}{2}-\\left(-\\frac{2}{3}\\right)', '1/2-(-2/3)')], correct: 1, correction: '$\\frac{3}{4}-\\left(-\\frac{5}{6}\\right)=\\frac{9}{12}+\\frac{10}{12}=\\frac{19}{12}$ .' },
  { label: 'مجموعهما $-\\frac{1}{3}$', target: '-1/3', options: [pair('-\\frac{2}{3}+\\frac{3}{4}', '-2/3+3/4'), pair('\\frac{4}{3}+\\left(-\\frac{5}{6}\\right)', '4/3+(-5/6)'), pair('-\\frac{5}{6}+\\frac{1}{2}', '-5/6+1/2')], correct: 2, correction: '$-\\frac{5}{6}+\\frac{1}{2}=-\\frac{5}{6}+\\frac{3}{6}=-\\frac{2}{6}=-\\frac{1}{3}$ .' },
  { label: 'حاصل قسمة الأوّل على الثاني $-2$', target: '-2', options: [pair('\\frac{3}{4}\\div\\frac{1}{2}', '3/4÷1/2'), pair('-\\frac{5}{6}\\div\\frac{1}{2}', '-5/6÷1/2'), pair('\\frac{4}{3}\\div\\left(-\\frac{2}{3}\\right)', '4/3÷(-2/3)')], correct: 2, correction: '$\\frac{4}{3}\\times\\left(-\\frac{3}{2}\\right)=-\\frac{12}{6}=-2$ .' },
];
/* ── deep-63 : ranger les nombres, puis leurs مقلوبات ───────────────────────────────────────────────────── */
export const ORDERS = [
  { id: 'orig', prompt: 'رتّب تصاعديًّا الأعداد $\\frac{5}{2}$ ، $-\\frac{4}{3}$ ، $-1$ ، $\\frac{3}{5}$ ، $-\\frac{2}{7}$ :',
    key: ['-4/3', '-1', '-2/7', '3/5', '5/2'], wrongs: [['-2/7', '-1', '-4/3', '3/5', '5/2'], ['-4/3', '-1', '3/5', '-2/7', '5/2']], at: 0,
    explain: 'السالبة أصغر من الموجبة، وعلى يسار الصفر الأبعد عن الصفر أصغر: $-\\frac{4}{3}<-1<-\\frac{2}{7}$ .' },
  { id: 'recip', prompt: 'رتّب تصاعديًّا مقلوبات الأعداد نفسها: $\\frac{2}{5}$ ، $-\\frac{3}{4}$ ، $-1$ ، $\\frac{5}{3}$ ، $-\\frac{7}{2}$ :',
    key: ['-7/2', '-1', '-3/4', '2/5', '5/3'], wrongs: [['5/3', '2/5', '-3/4', '-1', '-7/2'], ['-3/4', '-1', '-7/2', '2/5', '5/3']], at: 1,
    explain: 'للمقلوب إشارة العدد نفسه، لكن ترتيب المسافات ينعكس: $-\\frac{7}{2}<-1<-\\frac{3}{4}<\\frac{2}{5}<\\frac{5}{3}$ .' },
];
const chain = (ws) => `$${ws.map(rtex).join('<')}$`;
/* ── ex-54, ex-40 : un terme manquant, UNE opération inverse ────────────────────────────────────────────── */
export const MISSING = [
  row('-\\frac{2}{3}\\times x=-\\frac{8}{9}', '(-8/9)÷(-2/3)', '4/3', ['-4/3', '3/4'], 0, '$x=-\\frac{8}{9}\\div\\left(-\\frac{2}{3}\\right)=\\frac{8}{9}\\times\\frac{3}{2}=\\frac{4}{3}$ .'),
  row('x\\div\\frac{3}{4}=-\\frac{2}{5}', '(-2/5)*(3/4)', '-3/10', ['3/10', '-8/15'], 1, '$x=-\\frac{2}{5}\\times\\frac{3}{4}=-\\frac{6}{20}=-\\frac{3}{10}$ .'),
  row('-\\frac{5}{2}=\\frac{10}{7}\\div x', '(10/7)÷(-5/2)', '-4/7', ['4/7', '-7/4'], 2, '$x=\\frac{10}{7}\\div\\left(-\\frac{5}{2}\\right)=\\frac{10}{7}\\times\\left(-\\frac{2}{5}\\right)=-\\frac{4}{7}$ .'),
];

export const EXERCISES = [
  { id: 'act-6-prod', source: S('act-6', 25, 'أنشطة'), cites: [], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'احسب كلّ جداء واكتب الناتج على أبسط شكل:', interaction: 'batch',
    question: { rows: rows(PRODUCTS), explain: 'نعيّن الإشارة أوّلًا ثمّ نضرب البسطين ونضرب المقامين ونختزل.' },
    commonError: 'ضرب عددين سالبين وإعطاء ناتج سالب، أو قلب كسر في جداء.' },
  { id: 'act-6-sum', source: S('act-6', 25, 'أنشطة'), cites: [], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'احسب كلّ مجموع واكتب الناتج على أبسط شكل:', interaction: 'batch',
    question: { rows: rows(SUMS), explain: 'نحدّد إشارة الناتج بالعدد الأبعد عن الصفر، ثمّ نوحّد المقامين ونجمع البسطين.' },
    commonError: 'جمع البسطين والمقامين، أو أخذ إشارة الحدّ الأوّل.' },
  { id: 'act-6-quot', source: S('act-6', 25, 'أنشطة'), cites: [], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب كلّ حاصل قسمة واكتب الناتج على أبسط شكل:', interaction: 'batch',
    question: { rows: rows(QUOTIENTS), explain: 'نضرب في مقلوب القاسم (وللمقلوب إشارة العدد نفسه) ثمّ نختزل.' },
    commonError: 'القسمة دون قلب القاسم، أو قلب المقسوم.' },
  { id: 'ex-34', source: S('ex-34', 31), cites: [S('ex-35', 31), S('ex-36', 31)], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'احسب واكتب الناتج على أبسط شكل:', interaction: 'batch',
    question: { rows: rows(SUMS2), explain: 'إشارة الناتج أوّلًا، ثمّ المقام المشترك.' },
    commonError: 'إسقاط الإشارة السالبة عند الطرح.' },
  { id: 'ex-37', source: S('ex-37', 31), cites: [S('ex-38', 31)], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'احسب بتجميع الحدود ذات المقام نفسه: $x=\\frac{3}{4}-\\frac{2}{5}+\\frac{1}{4}-\\frac{3}{5}+\\frac{5}{7}-\\frac{2}{7}$ .', interaction: 'fraction',
    question: { expected: '3/7', explain: '$\\left(\\frac{3}{4}+\\frac{1}{4}\\right)-\\left(\\frac{2}{5}+\\frac{3}{5}\\right)+\\left(\\frac{5}{7}-\\frac{2}{7}\\right)=1-1+\\frac{3}{7}=\\frac{3}{7}$ .' },
    commonError: 'حساب الحدود من اليسار إلى اليمين بمقامات متغيّرة.' },
  { id: 'ex-42', source: S('ex-42', 32), cites: [S('ex-43', 32), S('ex-44', 32)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'احسب واكتب الناتج على شكل عدد ناطق مبسّط:', interaction: 'batch',
    question: { rows: rows(MIXED), explain: 'الإشارة أوّلًا، وبسط عشري يبقى في مكانه حتى نحذف الفاصلة.' },
    commonError: 'إهمال الفاصلة أو القسمة دون قلب.' },
  { id: 'ex-48', source: S('ex-48', 32), cites: [S('ex-49', 32), S('ex-50', 32), S('ex-51', 32), S('ex-52', 32), S('deep-64', 34, 'أتعمّق')], learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'احسب بتمعّن واكتب الناتج على أبسط شكل:', interaction: 'batch',
    question: { rows: rows(COMPOUND), explain: 'الكسر المركّب قسمة: نحسب البسط وحده والمقام وحده ثمّ نقسم.' },
    commonError: 'تجاهل الأقواس أو حساب الكسر المركّب من اليسار.' },
  { id: 'ex-53', source: S('ex-53', 32), cites: [S('now-3', 29, 'دورك الآن')], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نعتبر العددين $a=-\\frac{3}{10}$ و $b=\\frac{4}{-15}$ . احسب ما يلي واكتب الناتج على أبسط شكل:', interaction: 'batch',
    question: { rows: rows(AB), explain: 'نكتب $b=-\\frac{4}{15}$ ثمّ نعيّن الإشارة قبل أن نحسب.' },
    commonError: 'قلب الكسر الخطأ في القسمة.' },
  { id: 'deep-60', source: S('deep-60', 34, 'أتعمّق'), cites: [], learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'من بين الأعداد $-\\frac{2}{3}$ ، $\\frac{3}{4}$ ، $-\\frac{5}{6}$ ، $\\frac{1}{2}$ ، $\\frac{4}{3}$ اختر في كلّ حالة العددين المناسبين:', interaction: 'batch',
    question: { rows: PAIRS.map((p) => ({ label: p.label, options: p.options.map((o) => o.t), correct: p.correct, correction: p.correction })), explain: 'نحسب كلّ اقتراح ونقارن بالناتج المطلوب.' },
    commonError: 'الاكتفاء بالإشارة دون حساب الكسر.' },
  ...ORDERS.map((o) => ({
    id: `deep-63-${o.id}`, source: S('deep-63', 34, 'أتعمّق'), cites: o.id === 'orig' ? [S('deep-68', 34, 'أتعمّق')] : [], learningPointId: o.id === 'orig' ? LP.P1 : LP.P3, difficulty: 'difficile',
    statement: o.prompt, interaction: 'choice',
    question: { options: (() => { const x = o.wrongs.map(chain); x.splice(o.at, 0, chain(o.key)); return x; })(), correct: o.at, cols: 1, explain: o.explain },
    commonError: 'اعتبار الأبعد عن الصفر أكبر، أو ظنّ أنّ المقلوب يعكس الإشارة.',
  })),
  { id: 'ex-54', source: S('ex-54', 32), cites: [S('ex-40', 32), S('ex-41', 32), S('ex-46', 32)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'جد قيمة $x$ في كلّ حالة بعملية عكسية واحدة:', interaction: 'batch',
    question: { rows: rows(MISSING), explain: 'نبحث عن العدد المجهول بالعملية العكسية: قسمة أو ضرب.' },
    commonError: 'استعمال عملية خاطئة أو قلب الكسر الخطأ.' },
];
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `calc` / `target` : ce que le test recalcule.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P1, prompt: '$-\\frac{2}{3}+\\frac{1}{4}=$', calc: '-2/3+1/4', target: '-5/12',
    options: [{ t: '$-\\frac{5}{12}$', calc: '-5/12' }, { t: '$\\frac{5}{12}$', calc: '5/12' }, { t: '$-\\frac{1}{7}$', calc: '-1/7' }, { t: '$-\\frac{11}{12}$', calc: '-11/12' }], correct: 0 },
  { id: 'E2', lp: LP.P2, prompt: '$\\left(-\\frac{3}{5}\\right)\\times\\left(-\\frac{10}{9}\\right)=$', calc: '(-3/5)*(-10/9)', target: '2/3',
    options: [{ t: '$\\frac{2}{3}$', calc: '2/3' }, { t: '$-\\frac{2}{3}$', calc: '-2/3' }, { t: '$\\frac{3}{2}$', calc: '3/2' }, { t: '$-\\frac{15}{7}$', calc: '-15/7' }], correct: 0 },
  { id: 'E3', lp: LP.P3, prompt: '$\\frac{4}{7}\\div\\left(-\\frac{2}{21}\\right)=$', calc: '4/7÷(-2/21)', target: '-6',
    options: [{ t: '$-6$', calc: '-6' }, { t: '$6$', calc: '6' }, { t: '$-\\frac{8}{147}$', calc: '-8/147' }, { t: '$-\\frac{1}{6}$', calc: '-1/6' }], correct: 0 },
  { id: 'E4', lp: LP.P4, prompt: '$\\frac{1}{2}-\\frac{3}{4}\\times\\frac{2}{3}=$', calc: '1/2-3/4*2/3', target: '0',
    options: [{ t: '$0$', calc: '0' }, { t: '$-\\frac{1}{6}$', calc: '-1/6' }, { t: '$1$', calc: '1' }, { t: '$-\\frac{1}{2}$', calc: '-1/2' }], correct: 0 },
  { id: 'E5', lp: LP.P4, prompt: '$\\dfrac{\\frac{2}{3}-1}{\\frac{1}{3}}=$', calc: '(2/3-1)/(1/3)', target: '-1',
    options: [{ t: '$-1$', calc: '-1' }, { t: '$-\\frac{1}{9}$', calc: '-1/9' }, { t: '$1$', calc: '1' }, { t: '$\\frac{1}{3}$', calc: '1/3' }], correct: 0 },
];
