/**
 * Les exercices du درس « المساويات والعمليات » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque
 * exercice porte en `source` l'élément du manuel dont il est tiré ; `src()` sans numéro, jamais montré à l'élève. Chaque valeur est CALCULÉE
 * ici avec `packages/core/arithmetic/linear.js` et RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que chaque
 * distracteur est FAUX.
 * Destinations (docs/sources/3am/unit5/extraction.json) : act-1 (application), ex-1 … ex-5 → module 4 ; self-1, self-2 → le إختبار أولي (module 8).
 */
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_musawiyat-amaliyat_P1',
  P2: '3am_musawiyat-amaliyat_P2',
  P3: '3am_musawiyat-amaliyat_P3',
};

const S = (id, page) => src(id, page, 'أوظّف تعلّماتي');
const T = (s) => `$${s}$`;
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });
/** Un nombre exact en LaTeX (« 25 », « \dfrac{3}{2} »). */
const num = (p) => T(Lin.fracLatex(p));
const val = (expr, x) => Lin.linAt(Lin.linear(expr), Lin.parseNumber(x));
const wrongsOf = (list) => list.map((w) => T(Lin.fracLatex(Lin.parseNumber(w))));

/* ── 1. نشاط 1 du manuel (application) : deux mêmes avoirs, la même opération des deux côtés ─────────────────────────── */
const SAVINGS = { gift: 150, price: 280 };

/* ── 2. ex-1 : x connu, on évalue ─────────────────────────────────────────────────────────────────────────────────── */
const EVAL = [
  { x: '18', expr: 'x+7', tex: 'x = 18 \\Longrightarrow x + 7 = \\ldots', wrongs: ['11', '126'], why: 'نعوّض: $18 + 7 = 25$ .' },
  { x: '-5', expr: 'x-3', tex: 'x = -5 \\Longrightarrow x - 3 = \\ldots', wrongs: ['-2', '2'], why: '$-5 - 3 = -8$ .' },
  { x: '0', expr: '3x+9', tex: 'x = 0 \\Longrightarrow 3x + 9 = \\ldots', wrongs: ['0', '12'], why: '$3 \\times 0 + 9 = 9$ .' },
  { x: '1/4', expr: '8x-1/2', tex: 'x = \\frac{1}{4} \\Longrightarrow 8x - \\frac{1}{2} = \\ldots', wrongs: ['2', '-1/2'], why: '$8 \\times \\frac{1}{4} - \\frac{1}{2} = 2 - \\frac{1}{2} = \\frac{3}{2}$ .' },
];
const evalLabel = (e) => T(e.tex);

/* ── 3. ex-2 : on déduit a d'une égalité par les opérations (une inconnue) ────────────────────────────────────────── */
const DEDUCE = [
  { left: '4a-8', right: '0', ans: '2', wrongs: ['-2', '8'], tex: '4a - 8 = 0', why: 'نضيف $8$ ثم نقسم على $4$ : $4a = 8$ ، $a = 2$ .' },
  { left: '-3a+2', right: '-7', ans: '3', wrongs: ['-3', '-9'], tex: '-3a + 2 = -7', why: 'نطرح $2$ : $-3a = -9$ ثم نقسم على $-3$ : $a = 3$ .' },
  { left: '6a', right: '-a+14', ans: '2', wrongs: ['14', '7'], tex: '6a = -a + 14', why: 'نضيف $a$ إلى الطرفين: $7a = 14$ ، $a = 2$ .' },
  { left: '5a-4', right: '6-5a', ans: '1', wrongs: ['10', '2'], tex: '5a - 4 = 6 - 5a', why: 'نضيف $5a$ و $4$ إلى الطرفين: $10a = 10$ ، $a = 1$ .' },
];

/* ── 4. ex-4 : multiplier les deux côtés (tous les termes) ─────────────────────────────────────────────────────────── */
const SCALE = [
  { label: '$3x - 4 = 5$ مضروبة في $-2$', right: '-6x + 8 = -10', wrongs: ['-6x - 4 = -10', '-6x + 8 = 10'], why: '$-2 \\times (3x - 4) = -6x + 8$ و $-2 \\times 5 = -10$ .' },
  { label: '$6 = 2x + 8$ مضروبة في $-1$', right: '-6 = -2x - 8', wrongs: ['-6 = 2x + 8', '-6 = -2x + 8'], why: 'نغيّر إشارة كل حدّ في الطرفين: $-6 = -2x - 8$ .' },
];

/* ── 5. ex-5 : 4x = −2 donne x = −1/2 ; on évalue d'autres expressions (par les opérations, sans chercher x) ────────── */
const FROM = [
  { expr: '-8x', label: '-8x', ans: '4', wrongs: ['-4', '-16'], why: 'نضرب طرفي $4x = -2$ في $-2$ : $-8x = 4$ .' },
  { expr: 'x-5', label: 'x - 5', ans: '-11/2', wrongs: ['-3', '-5/2'], why: 'نقسم على $4$ : $x = -\\frac{1}{2}$ ، ثم نطرح $5$ : $x - 5 = -\\frac{11}{2}$ .' },
  { expr: '4x+6', label: '4x + 6', ans: '4', wrongs: ['8', '-8'], why: 'نضيف $6$ إلى طرفي $4x = -2$ : $4x + 6 = 4$ .' },
  { expr: 'x+3/2', label: 'x + \\frac{3}{2}', ans: '1', wrongs: ['2', '-2'], why: '$x = -\\frac{1}{2}$ ، و $-\\frac{1}{2} + \\frac{3}{2} = 1$ .' },
];

export const EXERCISES = [
  {
    id: 'act-1', source: src('act-1', 72, 'أنشطة'), learningPointId: LP.P1, difficulty: 'facile',
    statement: `عند ياسمين وعمر المبلغ نفسه في حصّالتيهما. تصدّقت جدّتهما على كل منهما بـ ${SAVINGS.gift} دج، ثم اشترى كلّ منهما قصّة بسعر ${SAVINGS.price} دج.`,
    interaction: 'choice',
    question: {
      prompt: 'ما المبلغان اللذان يبقيان عند الطفلين؟',
      options: ['متساويان، لأنّنا أضفنا العدد نفسه إلى مبلغين متساويين ثم طرحنا العدد نفسه من النتيجتين', 'متساويان فقط إذا لم يشتريا شيئًا', 'مختلفان، لأنّ القصتين مختلفتان', 'لا نعرف دون معرفة المبلغ الأول'],
      correct: 0, cols: 1,
      explain: 'إذا كان $a = b$ فإنّ $a + 150 = b + 150$ ثم $a + 150 - 280 = b + 150 - 280$ : المساواة تبقى.',
    },
    commonError: 'الظنّ أنّ المبلغين يختلفان لأنّنا لا نعرف قيمتهما.',
  },
  {
    id: 'ex-1', source: S('ex-1', 78), learningPointId: LP.P1, difficulty: 'facile',
    statement: '$x$ عدد ناطق. أكمل كل جملة:',
    interaction: 'batch',
    question: { rows: EVAL.map((e, i) => row(evalLabel(e), num(val(e.expr, e.x)), wrongsOf(e.wrongs), i + 1, e.why)), explain: 'نعوّض قيمة $x$ ثم نحسب: المساواة تبقى صحيحة عندما نجري العملية نفسها على طرفيها.' },
    commonError: 'إجراء العملية على طرف واحد.',
  },
  {
    id: 'ex-2', source: S('ex-2', 78), learningPointId: LP.P3, difficulty: 'moyen',
    statement: '$a$ عدد ناطق. استعمل خواص المساويات لإكمال كل جملة:',
    interaction: 'batch',
    question: { rows: DEDUCE.map((d, i) => row(T(`${d.tex}\\ \\Longrightarrow\\ a = \\ldots`), T(d.ans), d.wrongs.map((w) => T(w)), i, d.why)), explain: 'نضيف أو نطرح العدد نفسه من الطرفين، ثم نقسم الطرفين على المعامل.' },
    commonError: 'نسيان تغيير إشارة العدد عند نقله إلى الطرف الآخر.',
  },
  {
    id: 'ex-3', source: S('ex-3', 78), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'صحيح أو خاطئ؟',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'إذا كان $5x = 3$ فإنّ $x = 5$', answer: false, why: 'نقسم الطرفين على $5$ : $x = \\frac{3}{5}$ .' },
        { text: 'إذا كان $20 - x = 0$ فإنّ $x = 20$', answer: true, why: 'نضيف $x$ إلى الطرفين: $20 = x$ .' },
        { text: 'إذا كان $9x = 9$ فإنّ $x = 0$', answer: false, why: 'نقسم الطرفين على $9$ : $x = 1$ ؛ و $9 \\times 0 = 0 \\neq 9$ .' },
        { text: 'إذا كان $3 - 4x = 0$ فإنّ $x = \\frac{3}{4}$', answer: true, why: 'نضيف $4x$ إلى الطرفين: $3 = 4x$ ثم نقسم على $4$ .' },
      ],
      explain: 'نطبّق العملية نفسها على الطرفين ثم نقارن بما قيل.',
    },
    commonError: 'قسمة العدد الخطأ أو قسمة طرف واحد.',
  },
  {
    id: 'ex-4', source: S('ex-4', 78), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'اكتب المساواة التي نحصل عليها عندما نضرب طرفي كل مساواة في العدد المعطى:',
    interaction: 'batch',
    question: { rows: SCALE.map((s, i) => row(s.label, T(s.right), s.wrongs.map((w) => T(w)), i, s.why)), explain: 'نضرب كل حدود الطرف الأيسر وكل حدود الطرف الأيمن في العدد نفسه.' },
    commonError: 'نسيان ضرب أحد الحدود، أو إبقاء الإشارات دون تغيير عند الضرب في عدد سالب.',
  },
  {
    id: 'ex-5', source: S('ex-5', 78), learningPointId: LP.P3, difficulty: 'moyen',
    statement: '$x$ عدد ناطق حيث $4x = -2$ . أكمل كل مساواة:',
    interaction: 'batch',
    question: { rows: FROM.map((f, i) => row(T(`${f.label} = \\ldots`), T(Lin.fracLatex(Lin.parseNumber(f.ans))), f.wrongs.map((w) => T(Lin.fracLatex(Lin.parseNumber(w)))), i, f.why)), explain: 'ننتقل من $4x = -2$ إلى المساواة المطلوبة بعمليات على الطرفين.' },
    commonError: 'تطبيق العملية على الطرف الأيسر فقط.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export { EVAL, DEDUCE, SCALE, FROM, SAVINGS };

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: src('self-1', 81, 'أؤكّد تعلّماتي'), prompt: 'إذا كان $a = -7$ فإنّ $a + 7$ يساوي:', options: ['$0$', '$-14$', '$14$', '$-49$'], correct: 0, truth: { expr: 'a+7', at: '-7', value: '0' } },
  { id: 'E2', source: src('self-2', 81, 'أؤكّد تعلّماتي'), prompt: 'إذا كان $3b - 5 = 0$ فإنّ $b$ يساوي:', options: ['$\\frac{5}{3}$', '$\\frac{3}{5}$', '$-\\frac{5}{3}$', '$2$'], correct: 0, truth: { left: '3b-5', right: '0', value: '5/3' } },
  { id: 'E3', source: null, prompt: 'إذا كان $a = b$ فإنّ $a \\times (-3)$ يساوي:', options: ['$b \\times (-3)$', '$b \\div (-3)$', '$b + (-3)$', '$-3 \\times b + 3$'], correct: 0 },
  { id: 'E4', source: null, prompt: 'إذا كان $a = b$ و $c \\neq 0$ فأيّ الجمل الآتية صحيحة دائمًا؟', options: ['$\\frac{a}{c} = \\frac{b}{c}$', '$\\frac{a}{0} = \\frac{b}{0}$', '$a \\times 0 = b$', '$\\frac{a}{c} = b$'], correct: 0 },
  { id: 'E5', source: null, prompt: 'إذا كان $5 = 3x - 1$ فإنّ المساواة $3x + 2 = 5$ :', options: ['خاطئة، لأنّ بإضافة $3$ إلى الطرفين نجد $8 = 3x + 2$', 'صحيحة، لأنّ إضافة $3$ إلى الطرف الأيمن تعطي $3x + 2$', 'صحيحة، لأنّ $5 = 5$', 'لا يمكن الحكم عليها'], correct: 0, truth: { left: '5', right: '3x-1', claim: '3x+2=5', holds: false } },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
