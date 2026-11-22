/**
 * Les exercices du درس « جداء عددين نسبيين » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres contextes, autres nombres, même
 * compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il
 * remplace (traçabilité de `check:textbook`) ; `src()` sans numéro : jamais montré à l'élève. Chaque clé est CALCULÉE ici avec
 * `packages/core/arithmetic/relativeOps.js` et RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que
 * chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit1/extraction.json) : act-1, act-2 (applications), ex-6, ex-17, ex-29, deep-37, deep-43 → module 4 ;
 * ex-1…4, 7, 8, 19, 34 → la banque ; self-1 … self-5 → le إختبار أولي (module 8).
 */
import * as R from '@smarter-academy/core/arithmetic/relativeOps.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_jidaa-adadayn-nisbiyayn_P1',
  P2: '3am_jidaa-adadayn-nisbiyayn_P2',
  P3: '3am_jidaa-adadayn-nisbiyayn_P3',
  P4: '3am_jidaa-adadayn-nisbiyayn_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Un nombre en LaTeX avec la virgule décimale : « -2{,}5 ». */
const tex = (x) => R.relTex(R.parseRel(x));
/** Un facteur entre parenthèses s'il est négatif. */
const f = (x) => (R.parseRel(x).n < 0n ? `(${tex(x)})` : tex(x));
const prod = (a, b) => `${f(a)} \\times ${f(b)}`;
const valTex = (a, b) => T(R.relTex(R.times(R.parseRel(a), R.parseRel(b))));
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });
const num = (s) => T(tex(s));

/* ── 1. احسب (ex-1 … ex-4), réécrit : six produits, l'erreur de chaque distracteur est une conviction ───────────────────────────── */
const COMPUTE = [
  { a: '-8', b: '5', wrongs: ['40', '-3', '-13'], why: 'إشارتان مختلفتان: الجداء سالب، و $8 \\times 5 = 40$ ، إذن $-40$ . ($-3$ هو المجموع.)' },
  { a: '-7', b: '-6', wrongs: ['-42', '-13', '13'], why: 'للعددين الإشارة نفسها: الجداء موجب، $7 \\times 6 = 42$ . ($-13$ هو المجموع.)' },
  { a: '9', b: '-0,5', wrongs: ['4,5', '-45', '8,5'], why: 'إشارتان مختلفتان: سالب، و $9 \\times 0{,}5 = 4{,}5$ ، إذن $-4{,}5$ .' },
  { a: '-2,5', b: '-4', wrongs: ['-10', '-6,5', '1'], why: 'سالبان: الجداء موجب، $2{,}5 \\times 4 = 10$ .' },
  { a: '-0,3', b: '0,2', wrongs: ['-0,6', '0,06', '-0,1'], why: 'سالب (إشارتان مختلفتان)، و $0{,}3 \\times 0{,}2 = 0{,}06$ ، إذن $-0{,}06$ .' },
  { a: '-1,2', b: '-1,5', wrongs: ['18', '-1,8', '-2,7'], why: 'موجب، و $1{,}2 \\times 1{,}5 = 1{,}8$ .' },
];

/* ── 2. اربط بين النتائج المتساوية (ex-6), réécrit : une ligne, quatre produits, un seul égal ─────────────────────────────────────── */
const MATCH = [
  { left: ['15', '-2'], right: ['-6', '5'], wrongs: [['-6', '-5'], ['15', '2'], ['-3', '5']], why: '$15 \\times (-2) = -30$ و $(-6) \\times 5 = -30$ . (الباقي: $30$ ، $30$ ، $-15$ .)' },
  { left: ['-0,5', '-8'], right: ['2', '2'], wrongs: [['-2', '2'], ['-4', '-2'], ['0,5', '-8']], why: '$(-0{,}5) \\times (-8) = 4$ و $2 \\times 2 = 4$ . (الباقي: $-4$ ، $8$ ، $-4$ .)' },
  { left: ['-3', '-4'], right: ['0,5', '24'], wrongs: [['-0,5', '24'], ['-6', '-3'], ['3', '-4']], why: '$(-3) \\times (-4) = 12$ و $0{,}5 \\times 24 = 12$ . (الباقي: $-12$ ، $18$ ، $-12$ .)' },
  { left: ['-1,5', '4'], right: ['3', '-2'], wrongs: [['-3', '-2'], ['1,5', '4'], ['-1,5', '-4']], why: '$(-1{,}5) \\times 4 = -6$ و $3 \\times (-2) = -6$ . (الباقي: $6$ ، $6$ ، $6$ .)' },
];

/* ── 3. أكمل بالإشارة المناسبة (ex-29), réécrit ────────────────────────────────────────────────────────────────────────────── */
const SIGNS = [
  { label: '(-5) \\times (\\square\\,9) = 45', sign: '-', why: 'الجداء $45$ موجب والعامل الأول سالب، فيجب أن يكون الثاني سالبًا: $(-5) \\times (-9) = 45$ .' },
  { label: '(\\square\\,4) \\times 7 = -28', sign: '-', why: 'الجداء سالب والعامل $7$ موجب، فالعامل الأول سالب: $(-4) \\times 7 = -28$ .' },
  { label: '(-2{,}5) \\times (\\square\\,2) = -5', sign: '+', why: 'الجداء سالب والعامل الأول سالب، فالثاني موجب: $(-2{,}5) \\times 2 = -5$ .' },
];

export const EXERCISES = [
  {
    id: 'ex-1', source: S('ex-1', 14), cites: [S('ex-2', 14), S('ex-3', 14), S('ex-4', 14), S('ex-7', 14), S('ex-8', 14)],
    learningPointId: LP.P4, difficulty: 'facile',
    statement: 'احسب كل جداء.',
    interaction: 'batch',
    question: { rows: COMPUTE.map((c, i) => row(T(prod(c.a, c.b)), valTex(c.a, c.b), c.wrongs.map(num), i + 1, c.why)), explain: 'الإشارة أوّلًا، ثم جداء المسافتين إلى الصفر.' },
    commonError: 'جمع العددين بدل ضربهما، أو نسيان الإشارة.',
  },
  {
    id: 'ex-6', source: S('ex-6', 14), cites: [S('ex-19', 15)],
    learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'في كل سطر، أيّ جداء يساوي الجداء المكتوب في أوّله؟',
    interaction: 'batch',
    question: {
      rows: MATCH.map((m, i) => row(T(prod(...m.left)), T(prod(...m.right)), m.wrongs.map((w) => T(prod(...w))), i + 2, m.why)),
      explain: 'نقارن إشارتَي الجداءين ثم مسافتَيهما إلى الصفر.',
    },
  },
  {
    id: 'ex-29', source: S('ex-29', 16),
    learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'أكمل بالإشارة المناسبة: اختر $+$ أو $-$ مكان $\\square$ .',
    interaction: 'batch',
    question: { rows: SIGNS.map((s, i) => row(T(s.label), T(s.sign === '+' ? '+' : '-'), [T(s.sign === '+' ? '-' : '+')], i, s.why)), explain: 'نبحث عن الإشارة التي يتحقق بها حكم قاعدة الإشارات.' },
  },
  {
    id: 'act-2', source: S('act-2', 8, 'أنشطة'),
    learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'درج نفق الراجلين في ساحة الشهداء فيه 48 درجة، وكل درجة تنزل بـ $17\\,\\mathrm{cm}$ . نعبّر عن النزول بعدد سالب. ما موقع آخر درجة بالنسبة إلى مدخل النفق، بالمتر؟',
    interaction: 'numeric',
    question: { prompt: 'الموقع بالمتر:', expected: -8.16, display: '−8,16', explain: '$(-17) \\times 48 = -816\\,\\mathrm{cm}$ ، أي $-8{,}16\\,\\mathrm{m}$ . (جمع 48 حدًّا كلّ منها $-17$ .)' },
    commonError: 'نسيان الإشارة السالبة للنزول.',
  },
  {
    id: 'act-1', source: S('act-1', 8, 'أنشطة'),
    learningPointId: LP.P1, difficulty: 'facile',
    statement: 'حفر عمّال حفرة بلغت عمق $8\\,\\mathrm{m}$ ، ثم طُلب منهم بلوغ عمق يساوي 3 أضعافه. نعبّر عن العمق بعدد سالب. ما العمق المطلوب بالمتر؟',
    interaction: 'numeric',
    question: { prompt: 'العمق المطلوب بالمتر:', expected: -24, display: '−24', explain: '$(-8) + (-8) + (-8) = (-8) \\times 3 = -24\\,\\mathrm{m}$ .' },
  },
  {
    id: 'deep-43', source: S('deep-43', 18, 'أتعمّق'),
    learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'أصحيحة أم خاطئة كل عبارة؟',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'ضعف عدد سالب هو عدد سالب.', answer: true, why: '$2 \\times (-3) = -6$ : إشارتان مختلفتان، الجداء سالب.' },
        { text: 'جداء عددين نسبيين أكبر دائمًا من كلّ منهما.', answer: false, why: 'مثال مضاد: $(-3) \\times 2 = -6$ أصغر من $-3$ ومن $2$ .' },
        { text: '$(-4) \\times (-4)$ عدد موجب.', answer: true, why: 'للعددين الإشارة نفسها: $(-4) \\times (-4) = 16$ .' },
      ],
    },
  },
  {
    id: 'ex-17', source: S('ex-17', 15),
    learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'عددان سالبان جداؤهما $24$ ، وأحدهما $-3$ . ما العدد الآخر؟',
    interaction: 'numeric',
    question: { prompt: 'العدد الآخر:', expected: -8, display: '−8', explain: '$(-3) \\times (-8) = 24$ : للعددين الإشارة نفسها، و $3 \\times 8 = 24$ .' },
  },
  {
    id: 'ex-17b', source: S('ex-17', 15),
    learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'عددان جداؤهما $-36$ ومجموعهما $0$ . ما هما؟',
    interaction: 'choice',
    question: { options: ['$6$ و $-6$', '$-4$ و $9$', '$-6$ و $-6$', '$4$ و $9$'], correct: 0, cols: 2, explain: '$6 \\times (-6) = -36$ و $6 + (-6) = 0$ . أمّا $-4$ و $9$ فجداؤهما $-36$ ومجموعهما $5$ .' },
  },
  {
    id: 'deep-37', source: S('deep-37', 18, 'أتعمّق'),
    learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'أيّ زوج من العددين جداؤه سالب ومجموعه موجب؟',
    interaction: 'choice',
    question: { options: ['$5$ و $-2$', '$-5$ و $2$', '$-5$ و $-2$', '$5$ و $2$'], correct: 0, cols: 2, explain: '$5 \\times (-2) = -10$ سالب و $5 + (-2) = 3$ موجب.' },
    commonError: 'الخلط بين إشارة الجداء وإشارة المجموع.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: src('self-1', 17, 'أؤكّد تعلّماتي'), prompt: 'ينزل مصعد 4 طوابق في كل دقيقة، ويمرّ الآن بالطابق الأرضي. في أيّ طابق يكون بعد 5 دقائق؟', options: ['الطابق −20', 'الطابق 20', 'الطابق 1', 'الطابق −9'], correct: 0 },
  { id: 'E2', source: src('self-4', 17, 'أؤكّد تعلّماتي'), tex: '7 \\times (-0{,}6)', options: ['-4{,}2', '4{,}2', '-42', '6{,}4'], correct: 0 },
  { id: 'E3', source: src('self-2', 17, 'أؤكّد تعلّماتي'), prompt: 'جداء عددين نسبيين موجب، إذن:', options: ['للعددين الإشارة نفسها', 'كلاهما موجب', 'أحدهما سالب', 'أحدهما أبعد عن الصفر'], correct: 0 },
  { id: 'E4', source: src('self-3', 17, 'أؤكّد تعلّماتي'), tex: '(-5) \\times 3 + (-5) \\times (-3)', options: ['0', '-30', '30', '-15'], correct: 0 },
  { id: 'E5', source: src('self-5', 17, 'أؤكّد تعلّماتي'), prompt: 'ينزل مصعد 4 طوابق في الدقيقة ويمرّ الآن بالطابق الأرضي. في أيّ طابق كان قبل دقيقتين؟', options: ['الطابق 8', 'الطابق −8', 'الطابق −2', 'الطابق 2'], correct: 0 },
];
export const SELF = Object.fromEntries(FINAL.filter((x) => x.source).map((x) => [x.id, x]));
