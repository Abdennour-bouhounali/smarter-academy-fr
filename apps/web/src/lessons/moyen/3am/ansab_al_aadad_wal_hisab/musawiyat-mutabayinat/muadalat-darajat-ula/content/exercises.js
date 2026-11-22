/**
 * Les exercices du درس « المعادلات من الدرجة الأولى بمجهول واحد » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence).
 * Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de
 * `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève. Chaque valeur est CALCULÉE ici avec `packages/core/arithmetic/linear.js` et
 * RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit5/extraction.json) : act-4, ex-29 … ex-65 → module 4 (les 8 exercices ci-dessous les citent) ; self-6 … self-13 → le
 * إختبار أولي (module 8) ; ict → cité par act-4 (enrichissement GeoGebra, non reproduit).
 */
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_muadalat-darajat-ula_P1',
  P2: '3am_muadalat-darajat-ula_P2',
  P3: '3am_muadalat-darajat-ula_P3',
  P4: '3am_muadalat-darajat-ula_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });
const solve = (left, right) => Lin.solveEquation(Lin.linear(left), Lin.linear(right)).x;
const xEq = (v) => T(`x = ${Lin.fracLatex(typeof v === 'object' ? v : Lin.parseNumber(String(v)))}`);

/* ── ex-34 : résoudre ───────────────────────────────────────────────────────────────────────────────────────────────── */
export const SOLVE = [
  { left: '3x', right: 'x+8', wrongs: ['8', '2'], why: 'نضيف $-x$ إلى الطرفين: $2x = 8$ ثم نقسم على $2$ : $x = 4$ .' },
  { left: '7x-2', right: '5x+10', wrongs: ['4', '-6'], why: 'نضيف $-5x$ ثم $2$ إلى الطرفين: $2x = 12$ ، فـ $x = 6$ .' },
  { left: '-4x+3', right: '2x+15', wrongs: ['2', '-6'], why: 'نضيف $-2x$ ثم $-3$ : $-6x = 12$ ؛ نقسم على $-6$ : $x = -2$ .' },
  { left: '5x+4', right: '8x-5', wrongs: ['-3', '1'], why: 'نضيف $-8x$ ثم $-4$ : $-3x = -9$ ؛ نقسم على $-3$ : $x = 3$ .' },
];
const lhsTex = (l) => Lin.linLatex(Lin.linear(l));

/* ── ex-33 : tester des nombres ────────────────────────────────────────────────────────────────────────────────────── */
export const TESTS = [
  { left: '5x-3', right: '3x+1', x: '2', answer: true, why: 'من أجل $x = 2$ : $5 \\times 2 - 3 = 7$ و $3 \\times 2 + 1 = 7$ .' },
  { left: '4x+6', right: '3x+5', x: '0', answer: false, why: 'من أجل $x = 0$ : الطرف الأيسر $6$ والأيمن $5$ .' },
  { left: '2x+5', right: '5x+8', x: '-1', answer: true, why: 'من أجل $x = -1$ : $2 \\times (-1) + 5 = 3$ و $5 \\times (-1) + 8 = 3$ .' },
  { left: 'x-7', right: '2x-3', x: '3', answer: false, why: 'من أجل $x = 3$ : الطرف الأيسر $-4$ والأيمن $3$ .' },
];

export const EXERCISES = [
  {
    id: 'act-4', source: S('act-4', 73, 'أنشطة'), cites: [S('ict', 85, 'تكنولوجيات')], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'اختار هشام وسلمى العدد نفسه. أضاف هشام إليه $4$ ثم ضرب النتيجة في $3$ ، وأضافت سلمى إليه $20$ . وجدا النتيجتين متساويتين.',
    interaction: 'numeric',
    question: { prompt: 'العدد الذي اختاراه:', expected: 4, explain: '$3(x + 4) = x + 20$ أي $3x + 12 = x + 20$ ثم $2x = 8$ ، $x = 4$ . نتحقق: $3 \\times 8 = 24$ و $4 + 20 = 24$ .' },
    commonError: 'ضرب $x$ في $3$ دون ضرب $4$ ($3x + 4 = x + 20$).',
  },
  {
    id: 'ex-30', source: S('ex-30', 79), cites: [S('ex-31', 79)], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'أيّ العبارات الآتية صحيحة؟ (معادلة من الدرجة الأولى بمجهول واحد: $ax + b = cx + d$)',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: '$3x + \\frac{1}{2} = 7 - 2x$ معادلة من الدرجة الأولى بمجهول واحد', answer: true, why: 'الشكل $ax + b = cx + d$ بمجهول واحد $x$ .' },
        { text: '$x^2 + 1 = 5$ معادلة من الدرجة الأولى بمجهول واحد', answer: false, why: 'فيها $x^2$ : ليست من الدرجة الأولى.' },
        { text: '$2x + y = 7$ معادلة من الدرجة الأولى بمجهول واحد', answer: false, why: 'فيها مجهولان $x$ و $y$ .' },
        { text: '$4 + 3 = 7$ معادلة', answer: false, why: 'لا مجهول فيها: مساواة بين عددين.' },
      ],
      explain: 'المعادلة مساواة فيها مجهول؛ ومن الدرجة الأولى عندما يظهر المجهول مرفوعًا إلى الأس 1 فقط.',
    },
    commonError: 'اعتبار كل مساواة معادلة.',
  },
  {
    id: 'ex-33', source: S('ex-33', 79), cites: [S('ex-32', 79)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نعوّض العدد في الطرفين: هل هو حلّ؟',
    interaction: 'trueFalse',
    question: {
      rows: TESTS.map((t) => ({ text: `$${Lin.fracText(Lin.parseNumber(t.x)).replace('-', '-')}$ حلّ للمعادلة $${lhsTex(t.left)} = ${lhsTex(t.right)}$`, answer: t.answer, why: t.why })),
      explain: 'نحسب الطرف الأيسر والطرف الأيمن للعدد المعطى: إن تساويا فهو حلّ.',
    },
    commonError: 'تعويض العدد في طرف واحد.',
  },
  {
    id: 'ex-34', source: S('ex-34', 79), cites: [S('ex-29', 79)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'حلّ كل معادلة:',
    interaction: 'batch',
    question: { rows: SOLVE.map((d, i) => row(T(`${lhsTex(d.left)} = ${lhsTex(d.right)}`), xEq(solve(d.left, d.right)), d.wrongs.map(xEq), i + 1, d.why)), explain: 'نجمع حدود $x$ في طرف والأعداد في الطرف الآخر، ثم نقسم على معامل $x$ .' },
    commonError: 'نقل حدّ دون تغيير إشارته.',
  },
  {
    id: 'ex-35', source: S('ex-35', 79), cites: [S('ex-36', 80, 'ترييض مشكلات'), S('ex-38', 80, 'ترييض مشكلات'), S('ex-39', 80, 'ترييض مشكلات')], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'جمعت أمل $32$ كتابًا للمكتبة المدرسية، وهو أقلّ بـ $4$ من ثلاثة أمثال ما جمعته أختها. نسمّي $x$ عدد كتب أختها.',
    interaction: 'choice',
    question: { prompt: 'أيّ معادلة تترجم المشكلة؟', options: ['$3x - 4 = 32$', '$3x + 4 = 32$', '$3(x - 4) = 32$', '$3x = 32 - 4$'], correct: 0, cols: 2, explain: 'ثلاثة أمثال العدد: $3x$ ؛ أقلّ بـ $4$ : $3x - 4$ ؛ وهو يساوي $32$ . ($x = 12$ يحقّق المعادلة الأولى فقط.)' },
    commonError: 'قراءة « أقلّ بـ » على أنّها إضافة.',
  },
  {
    id: 'ex-40', source: S('ex-40', 80, 'ترييض مشكلات'), cites: [S('ex-41', 80, 'ترييض مشكلات'), S('ex-42', 80, 'ترييض مشكلات'), S('ex-43', 80, 'ترييض مشكلات'), S('now-77-2', 77, 'دوري الآن')], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'أفكّر في عدد: أضيف $15$ إلى ضعفه فأجد النتيجة نفسها لو طرحتُ $9$ من ثلاثة أضعافه.',
    interaction: 'numeric',
    question: { prompt: 'العدد الذي فكّرت فيه:', expected: 24, explain: '$2x + 15 = 3x - 9$ ثم $24 = x$ . نتحقق: $2 \\times 24 + 15 = 63$ و $3 \\times 24 - 9 = 63$ .' },
    commonError: 'ترجمة « ثلاثة أضعافه » بـ $3 + x$ .',
  },
  {
    id: 'ex-44', source: S('ex-44', 80, 'ترييض مشكلات'), cites: [S('ex-45', 80, 'ترييض مشكلات'), S('ex-46', 80, 'ترييض مشكلات'), S('ex-47', 80, 'ترييض مشكلات'), S('ex-48', 80, 'ترييض مشكلات'), S('ex-37', 80)], learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'طول مستطيل يزيد على عرضه بـ $6\\,\\mathrm{m}$ ، ومحيطه $84\\,\\mathrm{m}$ . نسمّي $x$ عرضه بالمتر.',
    interaction: 'numeric',
    question: { prompt: 'عرض المستطيل بالمتر:', expected: 18, explain: 'الطول $x + 6$ ؛ المحيط $2(x + x + 6) = 84$ أي $4x + 12 = 84$ ، $x = 18$ . الطول $24\\,\\mathrm{m}$ : $2(18 + 24) = 84$ .' },
    commonError: 'كتابة المحيط $x + x + 6$ دون ضرب المجموع في $2$ .',
  },
  {
    id: 'ex-49', source: S('ex-49', 80, 'ترييض مشكلات'),
    cites: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65].map((n) => S(`ex-${n}`, n >= 59 ? 83 : 82, 'أتعمّق')),
    learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'اشترى سمير $4$ دفاتر وقلمين بمبلغ $330$ دج، وثمن الدفتر خمسة أمثال ثمن القلم. نسمّي $x$ ثمن القلم بالدينار.',
    interaction: 'numeric',
    question: { prompt: 'ثمن القلم بالدينار:', expected: 15, explain: 'ثمن الدفتر $5x$ ؛ $4 \\times 5x + 2x = 330$ أي $22x = 330$ ، $x = 15$ . الدفتر $75$ دج : $4 \\times 75 + 2 \\times 15 = 330$ .' },
    commonError: 'ترجمة « خمسة أمثال » بإضافة $5$ .',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: null, prompt: 'المعادلة $2x + 3 = 5x - 1$ :', options: ['معادلة من الدرجة الأولى بمجهول واحد', 'معادلة بمجهولين', 'مساواة لا مجهول فيها', 'مساواة صحيحة دائمًا'], correct: 0 },
  { id: 'E2', source: src('self-8', 81, 'أؤكّد تعلّماتي'), cites: [src('self-7', 81, 'أؤكّد تعلّماتي'), src('self-9', 81, 'أؤكّد تعلّماتي')], prompt: 'العدد $4$ حلّ للمعادلة:', options: ['$3x - 5 = x + 3$', '$2x + 1 = 3x$', '$x - 4 = 2x$', '$5x = 4x + 5$'], correct: 0, truth: { x: '4', right: '3x-5=x+3' } },
  { id: 'E3', source: src('self-10', 81, 'أؤكّد تعلّماتي'), cites: [src('self-11', 81, 'أؤكّد تعلّماتي'), src('self-12', 81, 'أؤكّد تعلّماتي'), src('self-13', 81, 'أؤكّد تعلّماتي')], prompt: 'حلّ المعادلة $5x - 4 = 2x + 8$ هو:', options: ['$4$', '$\\frac{4}{7}$', '$-4$', '$\\frac{12}{7}$'], correct: 0, truth: { left: '5x-4', right: '2x+8', value: '4' } },
  { id: 'E4', source: null, prompt: 'حلّ المعادلة $-3x + 7 = x - 5$ هو:', options: ['$3$', '$-3$', '$\\frac{1}{2}$', '$12$'], correct: 0, truth: { left: '-3x+7', right: 'x-5', value: '3' } },
  { id: 'E5', source: src('self-6', 81, 'أؤكّد تعلّماتي'), prompt: 'مع أمين مبلغ: إذا اشترى $3$ كتب بقي معه $25$ دج، وإذا اشترى $5$ كتب نقصه $35$ دج. ثمن الكتاب بالدينار هو:', options: ['$30$', '$10$', '$60$', '$20$'], correct: 0, truth: { left: '3x+25', right: '5x-35', value: '30' } },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
