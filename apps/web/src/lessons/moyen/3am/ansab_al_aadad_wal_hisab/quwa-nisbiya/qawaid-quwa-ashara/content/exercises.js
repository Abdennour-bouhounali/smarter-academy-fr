/**
 * Les exercices du درس « قواعد الحساب على قوى العدد 10 » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en
 * `source` l'élément du manuel dont il est tiré et, dans `cites`, ceux qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève.
 * Chaque ligne porte ses `data` (ce que la ligne affirme, en LaTeX évaluable) : ./content.test.js les RECALCULE avec un code INDÉPENDANT de `tenPowers.js` (BigInt)
 * et contrôle que la bonne option est vraie et chaque distracteur FAUX.
 * Destinations (docs/sources/3am/unit3/extraction.json) : ex-14, ex-17, ex-20, ex-50, ex-56, now-43 → module 4 ; self-4, self-5, self-6 → le إختبار أولي (module 8) ; ex-13, 15, 16, 18, 19, self-7 … 10 → la banque.
 * La frontière de la leçon : des puissances de 10 seulement ; aucun résultat n'est normalisé (21 × 10¹² reste tel quel).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_qawaid-quwa-ashara_P1',
  P2: '3am_qawaid-quwa-ashara_P2',
  P3: '3am_qawaid-quwa-ashara_P3',
  P4: '3am_qawaid-quwa-ashara_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction, data) => ({ label, ...place(right, wrongs, at), correction, data });
const pw = (n) => T(`10^{${n}}`);

/* ── 1. قوة واحدة (ex-14) ─────────────────────────────────────────────────────────────────────────────────────────── */
const SINGLE = [
  { expr: '10^{6} \\times 10^{5}', n: 11, wrongs: [30, 1], why: 'جداء: نجمع الأسّين $6 + 5 = 11$ .' },
  { expr: '\\frac{10^{8}}{10^{3}}', n: 5, wrongs: [11, 24], why: 'قسمة: ننقص $8 - 3 = 5$ .' },
  { expr: '\\frac{10^{3}}{10^{-6}}', n: 9, wrongs: [-3, -18], why: '$3 - (-6) = 9$ : طرح عدد سالب جمعٌ.' },
  { expr: '(10^{4})^{3}', n: 12, wrongs: [7, 64], why: 'قوة قوة: نضرب $4 \\times 3 = 12$ .' },
  { expr: '(10^{-2})^{5}', n: -10, wrongs: [3, -7], why: '$(-2) \\times 5 = -10$ .' },
  { expr: '(10^{3})^{-4}', n: -12, wrongs: [-1, 12], why: '$3 \\times (-4) = -12$ .' },
  { expr: '10^{-7} \\times 10^{-2}', n: -9, wrongs: [14, 5], why: '$-7 + (-2) = -9$ .' },
  { expr: '\\frac{10^{5} \\times 10^{3}}{10^{6}}', n: 2, wrongs: [14, 4], why: 'في البسط $10^{8}$ ، ثم $8 - 6 = 2$ .' },
  { expr: '10^{4} \\times (10^{2})^{3}', n: 10, wrongs: [24, 9], why: '$(10^{2})^{3} = 10^{6}$ ، ثم $4 + 6 = 10$ .' },
];

/* ── 2. أيّها يساوي 10⁻⁴ ؟ (ex-17) ───────────────────────────────────────────────────────────────────────────────── */
const EQ = [
  { expr: '\\frac{10^{3}}{10^{7}}', truth: true, why: '$3 - 7 = -4$ .' },
  { expr: '10^{-1} \\times 10^{-3}', truth: true, why: '$-1 + (-3) = -4$ .' },
  { expr: '0{,}01 \\times 10^{-2}', truth: true, why: '$0{,}01 = 10^{-2}$ ، ثم $-2 + (-2) = -4$ .' },
  { expr: '\\frac{10^{-6}}{100}', truth: false, why: '$100 = 10^{2}$ ، فالناتج $10^{-6-2} = 10^{-8}$ .' },
  { expr: '\\frac{0{,}001}{10}', truth: true, why: '$0{,}001 = 10^{-3}$ ، ثم $-3 - 1 = -4$ .' },
  { expr: '10^{-5} + 10^{-5}', truth: false, why: 'جمع لا جداء: $2 \\times 10^{-5}$ ، وهو ليس $10^{-4}$ .' },
];

/* ── 3. صحيح أم خاطئ؟ (ex-20) ─────────────────────────────────────────────────────────────────────────────────────── */
const TF = [
  { lhs: '\\frac{10^{10}}{2}', rhs: '10^{5}', truth: false, label: 'نصف $10^{10}$ هو $10^{5}$', why: 'نصف $10^{10}$ هو $5 \\times 10^{9}$ ؛ لا نقسم الأسّ على 2 .' },
  { lhs: '10^{3} + 10^{2}', rhs: '10^{5}', truth: false, why: '$1\\,000 + 100 = 1\\,100$ ، لا قاعدة للجمع.' },
  { lhs: '100 \\times 10^{-4}', rhs: '10^{-2}', truth: true, why: '$100 = 10^{2}$ ، ثم $2 + (-4) = -2$ .' },
  { lhs: '10^{4} \\times 10^{-4}', rhs: '1', truth: true, why: '$4 + (-4) = 0$ ، و $10^{0} = 1$ .' },
  { lhs: '10^{2} + 10^{-2}', rhs: '100{,}01', truth: true, why: '$100 + 0{,}01 = 100{,}01$ : نحسب كل قوة ثم نجمع.' },
];

/* ── 5. k × 10ᵖ (now-43) ──────────────────────────────────────────────────────────────────────────────────────────── */
const SCI = [
  { expr: '7 \\times 10^{2} \\times 5 \\times 10^{4}', k: '35', n: 6, wrongs: [8, 9], why: '$7 \\times 5 = 35$ و $2 + 4 = 6$ : $35 \\times 10^{6}$ .' },
  { expr: '0{,}4 \\times 10^{-3} \\times 50 \\times 10^{6}', k: '20', n: 3, wrongs: [-18, 9], why: '$0{,}4 \\times 50 = 20$ و $-3 + 6 = 3$ : $20 \\times 10^{3}$ .' },
];
const SCI_VALUE = { expr: '\\frac{12 \\times 10^{-2} \\times 5 \\times 10^{7}}{3 \\times 10^{4}}', value: '200', options: ['200', '20', '2\\,000'], why: '$\\frac{12 \\times 5}{3} = 20$ و $-2 + 7 - 4 = 1$ : $20 \\times 10^{1} = 200$ .' };

/* ── 6. برنامج (ex-56) ────────────────────────────────────────────────────────────────────────────────────────────── */
const PROG = '\\times 10^{5} \\times 10^{-2} \\div 10^{4}';

export const EXERCISES = [
  {
    id: 'ex-14', source: S('ex-14', 46), cites: [S('ex-15', 46), S('self-9', 49, 'أؤكّد تعلّماتي'), S('self-10', 49, 'أؤكّد تعلّماتي')],
    learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'اكتب كل عبارة على شكل قوة واحدة للعدد 10 ، أي اختر الأس.',
    interaction: 'batch',
    question: { rows: SINGLE.map((s, i) => row(T(s.expr), pw(s.n), s.wrongs.map(pw), i, s.why, { kind: 'single', expr: s.expr, n: s.n })), explain: 'جداء: نجمع الأسّين ؛ قسمة: ننقص ؛ قوة قوة: نضرب.' },
    commonError: 'ضرب الأسّين في الجداء ($10^{6} \\times 10^{5} = 10^{30}$).',
  },
  {
    id: 'ex-17', source: S('ex-17', 46),
    learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'أيّ هذه العبارات يساوي $10^{-4}$ ؟',
    interaction: 'batch',
    question: { rows: EQ.map((e) => ({ label: T(e.expr), options: ['يساوي', 'لا يساوي'], correct: e.truth ? 0 : 1, correction: e.why, data: { kind: 'eq', expr: e.expr, n: -4, truth: e.truth } })), explain: 'نكتب كل عبارة على شكل قوة واحدة للعدد 10 ثم نقارن الأسّين.' },
    commonError: 'جمع قوتين كأنها جداء ($10^{-5} + 10^{-5} = 10^{-10}$ أو $10^{-4}$).',
  },
  {
    id: 'ex-20', source: S('ex-20', 47), cites: [S('ex-19', 47), S('ex-16', 46), S('self-7', 49, 'أؤكّد تعلّماتي'), S('self-8', 49, 'أؤكّد تعلّماتي')],
    learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'أصحيحة كل مساواة أم خاطئة؟',
    interaction: 'batch',
    question: { rows: TF.map((t) => ({ label: t.label ?? T(`${t.lhs} = ${t.rhs}`), options: ['صحيحة', 'خاطئة'], correct: t.truth ? 0 : 1, correction: t.why, data: { kind: 'tf', lhs: t.lhs, rhs: t.rhs, truth: t.truth } })), explain: 'للجداء والقسمة وقوة القوة قواعد ؛ أمّا الجمع فنحسب فيه كل قوة ثم نجمع.' },
    commonError: 'جمع الأسّين في مجموع قوتين ($10^{3} + 10^{2} = 10^{5}$).',
  },
  {
    id: 'ex-50', source: S('ex-50', 50),
    learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'اكتب أولًا كل عدد على شكل قوة للعدد 10 ، ثم عيّن $n$ في المساواة: $\\frac{1000^{2} \\times 100^{3}}{0{,}01^{2}} = 10^{n}$ .',
    interaction: 'numeric',
    question: { prompt: 'الأس $n$ :', expected: 16, explain: '$1000^{2} = 10^{6}$ و $100^{3} = 10^{6}$ و $0{,}01^{2} = (10^{-2})^{2} = 10^{-4}$ ، إذن $\\frac{10^{12}}{10^{-4}} = 10^{12-(-4)} = 10^{16}$ .' },
    commonError: 'نسيان أنّ $0{,}01$ هو $10^{-2}$ ، أو طرح $12 - 4$ .',
    data: { kind: 'numeric', expr: '\\frac{1000^{2} \\times 100^{3}}{0{,}01^{2}}', n: 16 },
  },
  {
    id: 'now-43', source: S('now-43', 43, 'دوري الآن'),
    learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'احسب كل عبارة ولا تغيّر شكل النتيجة: نجمع الأعداد معًا وقوى العدد 10 معًا.',
    interaction: 'batch',
    question: { rows: [
      ...SCI.map((s, i) => row(T(`${s.expr} = ${s.k} \\times 10^{?}`), pw(s.n), s.wrongs.map(pw), i, s.why, { kind: 'sciexp', expr: s.expr, k: s.k, n: s.n })),
      { label: T(`${SCI_VALUE.expr} = ?`), ...place(T(SCI_VALUE.options[0]), SCI_VALUE.options.slice(1).map(T), 2), correction: SCI_VALUE.why, data: { kind: 'val', expr: SCI_VALUE.expr, value: SCI_VALUE.value, options: SCI_VALUE.options } },
    ], explain: 'نضرب الأعداد بعضها في بعض، ونطبّق قواعد القوى على قوى العدد 10 .' },
    commonError: 'جمع $7 + 5$ بدل ضرب $7 \\times 5$ ، أو ضرب الأسّين بدل جمعهما.',
  },
  {
    id: 'ex-56', source: S('ex-56', 50), cites: [S('ex-55', 50)],
    learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'برنامج حساب: «اختر عددًا، اضربه في $10^{5}$ ، ثم في $10^{-2}$ ، ثم اقسمه على $10^{4}$».',
    interaction: 'batch',
    question: { rows: [
      { label: 'إذا اخترنا 30 فالنتيجة:', ...place('$3$', ['$30$', '$0{,}3$'], 0), correction: '$30 \\times 10^{5-2-4} = 30 \\times 10^{-1} = 3$ .', data: { kind: 'prog', start: '30', result: '3', options: ['3', '30', '0{,}3'] } },
      { label: 'وإذا اخترنا $-4$ فالنتيجة:', ...place('$-0{,}4$', ['$-40$', '$0{,}4$'], 1), correction: '$-4 \\times 10^{-1} = -0{,}4$ .', data: { kind: 'prog', start: '-4', result: '-0{,}4', options: ['-0{,}4', '-40', '0{,}4'] } },
      { label: 'قالت ليلى: «البرنامج يقسم العدد على 10 أيًّا كان»', options: ['صحيحة', 'خاطئة'], correct: 0, correction: 'السلسلة كلّها ضرب في $10^{5-2-4} = 10^{-1}$ ، أي قسمة على 10 .', data: { kind: 'layla', factor: -1 } },
    ], explain: 'سلسلة من الضرب والقسمة على قوى العدد 10 تساوي ضربًا واحدًا في قوة واحدة.' },
    commonError: 'قراءة البرنامج كضرب في $10^{5+2+4}$ .',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const PROGRAMME = PROG;

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: src('self-5', 49, 'أؤكّد تعلّماتي'), cites: [src('self-4', 49, 'أؤكّد تعلّماتي')], tex: '10^{4} \\times 10^{-7}', options: ['10^{-3}', '10^{-28}', '10^{11}', '100^{-3}'], correct: 0 },
  { id: 'E2', source: null, tex: '\\frac{10^{5}}{10^{-3}}', options: ['10^{8}', '10^{2}', '10^{-15}', '1^{8}'], correct: 0 },
  { id: 'E3', source: src('self-6', 49, 'أؤكّد تعلّماتي'), tex: '(10^{-2})^{4}', options: ['10^{-8}', '10^{2}', '10^{-6}', '10^{16}'], correct: 0 },
  { id: 'E4', source: null, tex: '\\frac{(10^{3})^{2} \\times 10^{-1}}{10^{4}}', options: ['10^{1}', '10^{0}', '10^{9}', '10^{-1}'], correct: 0 },
  { id: 'E5', source: null, tex: '4 \\times 10^{3} \\times 2 \\times 10^{-5}', options: ['8 \\times 10^{-2}', '8 \\times 10^{-15}', '6 \\times 10^{-2}', '8 \\times 10^{8}'], correct: 0 },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
