/**
 * Les exercices du درس « حساب الرابع المتناسب » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, mêmes compétences).
 * Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace
 * (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève. Chaque clé est CALCULÉE ici avec
 * `packages/core/arithmetic/fourthProportional.js` et RE-vérifiée par ./content.test.js avec un autre code (fractions BigInt), qui
 * contrôle aussi que chaque distracteur est FAUX.
 * Destinations (docs/sources/2am/unit5/extraction.json) : act-2, ex-12 … ex-18 et opener → module 4 ; self-2, self-3 → le إختبار أولي.
 */
import * as FP from '@smarter-academy/core/arithmetic/fourthProportional.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { src } from '../../_unit/unitMeta.js';
import { GUIDE } from './textbook.js';

export const LP = {
  P1: '2am_rabi-mutanasib_P1',
  P2: '2am_rabi-mutanasib_P2',
  P3: '2am_rabi-mutanasib_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Un nombre décimal d'une fraction exacte ; la virgule des formules est `{,}`. */
const dec = (p) => FP.decimalText(p, 4);
const tex = (s) => String(s).replace(',', '{,}');
const num = (s) => FP.parse(s);
const ans = (hole, nums) => dec(FP.solve(hole, nums));
/** Place la bonne option à la position `at` parmi les autres (dans l'ordre). */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };

/**
 * Une ligne « احسب الرابع المتناسب » (trou en d) : le résultat exact, et trois distracteurs FAUX issus des erreurs typiques (on ajoute la
 * même différence ; on multiplie sans diviser ; on divise dans le mauvais sens) — retirés s'ils tombent sur la bonne valeur.
 */
const quad = (label, a, b, c, unit, at, correction) => {
  const right = ans('d', { a, b, c });
  const R = FP.solve('d', { a, b, c });
  const wr = [
    Lin.sub(Lin.add(num(b), num(c)), num(a)), // b + (c − a) : la même différence
    Lin.mul(num(b), num(c)), // b × c : sans diviser
    Lin.div(Lin.mul(num(a), num(c)), num(b)), // a × c ÷ b : dans le mauvais sens
    Lin.add(R, Lin.frac(1)), Lin.add(R, Lin.frac(2)),
  ].map(dec).filter((v, i, arr) => v != null && v !== right && arr.indexOf(v) === i).slice(0, 3);
  return { label, ...place(`${T(tex(right))} ${unit}`, wr.map((v) => `${T(tex(v))} ${unit}`), at), correction };
};

/* ── 2. ex-12 / ex-13 : calcul mental, trois lignes ────────────────────────────────────────────────────────────────── */
const MENTAL = [
  quad('كتلة $25$ علبة تونة، علمًا أنّ $15$ علبة تزن $6$ kg :', '15', '6', '25', 'kg', 1, 'كتلة العلبة $6 \\div 15 = 0{,}4$ kg ، و $25 \\times 0{,}4 = 10$ kg .'),
  quad('كتلة الدسم في $100$ g من الجبن، علمًا أنّ $80$ g منه تحتوي على $12$ g دسم:', '80', '12', '100', 'g', 0, '$100 = 80 \\times 1{,}25$ : نضرب $12$ في $1{,}25$ فنجد $15$ g .'),
  quad('كتلة الدسم في $20$ g من الجبن نفسه:', '80', '12', '20', 'g', 2, '$20 = 80 \\div 4$ : نقسم $12$ على $4$ فنجد $3$ g .'),
];
/* ── 3. ex-14 : la peinture ────────────────────────────────────────────────────────────────────────────────────────── */
const PAINT = [
  quad('دهان لـ $10$ m² ، علمًا أنّ $6$ L تغطي $24$ m² : كم لترًا يلزم؟', '24', '6', '10', 'L', 0, 'لتر واحد يغطي $4$ m² ، إذن $10 \\div 4 = 2{,}5$ ؛ أو $24 \\times x = 6 \\times 10$ .'),
  quad('الدهان اللازم لـ $36$ m² :', '24', '6', '36', 'L', 2, '$36 = 24 + 12$ : $6 + 3 = 9$ L .'),
];
/* ── 4. ex-15 : le trou n'est pas toujours en bas à droite ─────────────────────────────────────────────────────────── */
const TABLES = [
  { hole: 'd', a: '8', b: '14', c: '36', right: '63', label: '$\\begin{array}{|c|c|}\\hline 8 & 36 \\\\\\hline 14 & x \\\\\\hline\\end{array}$ ؛ $x$ هو:', wrongs: ['42', '16,2', '50'] },
  { hole: 'c', a: '5', b: '9', d: '31,5', right: '17,5', label: '$\\begin{array}{|c|c|}\\hline 5 & x \\\\\\hline 9 & 31{,}5 \\\\\\hline\\end{array}$ ؛ $x$ هو:', wrongs: ['17,6', '56,7', '27,5'] },
  { hole: 'c', a: '12', b: '5', d: '8', right: '19,2', label: '$\\begin{array}{|c|c|}\\hline 12 & x \\\\\\hline 5 & 8 \\\\\\hline\\end{array}$ ؛ $x$ هو:', wrongs: ['7,5', '15', '0,8'] },
  { hole: 'b', a: '3', c: '7,5', d: '12', right: '4,8', label: '$\\begin{array}{|c|c|}\\hline 3 & 7{,}5 \\\\\\hline x & 12 \\\\\\hline\\end{array}$ ؛ $x$ هو:', wrongs: ['7,5', '30', '7,6'] },
];
/* ── 5. un élève a répondu, corrigez-le ────────────────────────────────────────────────────────────────────────────── */
const CLAIMS = [
  { text: '$5$ kg بـ $625$ DA ، إذن $7$ kg بـ $627$ DA .', a: '5', b: '625', c: '7', d: '627' },
  { text: '$6$ kg بـ $750$ DA ، إذن $8$ kg بـ $1000$ DA .', a: '6', b: '750', c: '8', d: '1000' },
  { text: '$3$ kg بـ $90$ DA ، إذن $9$ kg بـ $270$ DA .', a: '3', b: '90', c: '9', d: '270' },
  { text: '$4$ kg بـ $120$ DA ، إذن $10$ kg بـ $126$ DA .', a: '4', b: '120', c: '10', d: '126' },
];
const claimTrue = (k) => Lin.eq(Lin.mul(num(k.a), num(k.d)), Lin.mul(num(k.b), num(k.c)));
/* ── 6. ex-18 (réécrit) : un tuyau qui fuit — le tableau en minutes ─────────────────────────────────────────────────── */
const LEAK = [
  quad('كمية الماء المتسرّبة خلال $50$ min (تسرّب $270$ L خلال $180$ min) :', '180', '270', '50', 'L', 1, 'في كل دقيقة $270 \\div 180 = 1{,}5$ L ، و $50 \\times 1{,}5 = 75$ L .'),
  quad('كمية الماء المتسرّبة خلال $80$ min :', '180', '270', '80', 'L', 0, '$80 \\times 1{,}5 = 120$ L .'),
  { label: 'المدّة اللازمة لتتسرّب $45$ L :', ...place(`${T('30')} min`, [`${T('45')} min`, `${T('67{,}5')} min`, `${T('120')} min`], 2), correction: '$45 \\div 1{,}5 = 30$ min ؛ أو $270 \\times x = 180 \\times 45$ .' },
];
/* ── 7. l'ouverture (opener) réécrite : une longueur de méridien ────────────────────────────────────────────────────── */
const MERIDIAN = { a: '1', b: '50', c: '700' };

const ex = (id, source, learningPointId, difficulty, extra) => ({ id, source, learningPointId, difficulty, ...extra });

export const EXERCISES = [
  ex('act-2', S('act-2', 72, 'أنشطة'), LP.P2, 'facile', {
    statement: 'على جدار خزّان ماء مدرَّج، يقابل الارتفاع $8$ cm حجمًا قدره $30$ L ، والحجم يتناسب مع الارتفاع. كم لترًا في الخزّان حين يبلغ الماء ارتفاع $20$ cm ؟',
    interaction: 'numeric',
    question: { prompt: 'اكتب الجداءين المتصالبين $8 \\times x$ و $30 \\times 20$ ثم احسب $x$ (باللتر):', expected: Number(ans('d', { a: '8', b: '30', c: '20' })), display: ans('d', { a: '8', b: '30', c: '20' }),
      explain: '$8 \\times x = 30 \\times 20 = 600$ ، إذن $x = 600 \\div 8 = 75$ L .' },
    commonError: 'ضرب العددين $8 \\times 30$ ، أو إضافة $12$ إلى $30$ لأنّ الارتفاع زاد $12$ .',
  }),
  ex('ex-12', S('ex-12', 79), LP.P1, 'facile', {
    cites: [S('ex-13', 79)],
    statement: 'احسب ذهنيًا، وفكّر في أسهل طريق لكل سؤال.',
    interaction: 'batch',
    question: { rows: MENTAL, explain: 'نبحث أوّلًا إن كان عدد مضاعفًا أو جزءًا بسيطًا للآخر.' },
    commonError: GUIDE.addDiff.wrong,
  }),
  ex('ex-14', S('ex-14', 79), LP.P3, 'moyen', {
    statement: 'يغطّي $6$ L من الدهان مساحة $24$ m² . أجب عن السؤالين.',
    interaction: 'batch',
    question: { rows: PAINT, explain: 'الدهان يتناسب مع المساحة: نقارن الخاصيتين الضربية والجمعية.' },
    commonError: 'قسمة العدد الأكبر على الأصغر دون النظر إلى الجدول.',
  }),
  ex('ex-15', S('ex-15', 79), LP.P2, 'moyen', {
    statement: 'كل جدول يمثّل تناسبية. أوجد العدد $x$ في كل جدول (قد يكون في أيّ خانة).',
    interaction: 'batch',
    question: {
      rows: TABLES.map((t, i) => ({ label: t.label, ...place(T(tex(t.right)), t.wrongs.map((w) => T(tex(w))), i + 1), correction: `جداءا القطرين متساويان، ومنه $x = ${tex(t.right)}$ .` })),
      explain: 'نكتب مساواة الجداءين المتصالبين ثم نقسم على العدد المقابل للمجهول.',
    },
    commonError: 'ضرب عددين من العمود نفسه.',
  }),
  ex('ex-16', S('ex-16', 79), LP.P1, 'moyen', {
    statement: 'كتب تلميذ حسابات لتعيين الرابع المتناسب. صحّح الخاطئ منها وبرّر.',
    interaction: 'trueFalse',
    question: {
      rows: CLAIMS.map((k) => ({
        text: k.text, answer: claimTrue(k),
        why: claimTrue(k) ? 'صحيح: ثمن الكيلوغرام الواحد لم يتغيّر.' : `خاطئ: الثمن الصحيح $${tex(ans('d', { a: k.a, b: k.b, c: k.c }))}$ DA ، لأنّ الفرق بين الكتلتين لا يُضاف إلى الثمن.`,
      })),
      explain: 'نتحقّق من ثمن الكيلوغرام الواحد في العمودين.',
    },
    commonError: GUIDE.addDiff.wrong,
  }),
  ex('ex-18', S('ex-18', 79), LP.P2, 'difficile', {
    statement: 'تتسرّب $270$ L من الماء من أنبوب خلال $180$ min بصفة منتظمة. أجب بتشكيل جدول تناسبية.',
    interaction: 'batch',
    question: { rows: LEAK, explain: 'الكمية المتسرّبة تتناسب مع المدّة.' },
    commonError: 'قسمة المدّة على الكمية بدل العكس.',
  }),
  ex('opener', src('opener', 70, 'سأتعلّم في هذا الباب'), LP.P1, 'facile', {
    statement: 'قاس عالِم قديم المسافة بين مدينتين فوجدها $700$ km ، وقدّر أنّها تساوي جزءًا من $50$ جزءًا من محيط الأرض. نكتب الجدول: $1$ ← $50$ و $700$ ← $x$ .',
    interaction: 'choice',
    question: { prompt: 'كم يساوي محيط الأرض بحسب هذا القياس (بالكيلومتر)؟',
      ...place('$35000$', ['$14$', '$750$', '$3500$'], 1), cols: 2,
      explain: 'القطعة الواحدة $700$ km ، فالمحيط $50 \\times 700 = 35000$ km .' },
  }),
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const CONTENT = { MENTAL, PAINT, TABLES, CLAIMS, LEAK, MERIDIAN };

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: null, prompt: 'ثمن $6$ kg من التمر هو $900$ DA . ثمن $10$ kg هو:', kind: 'fourth', nums: { hole: 'd', a: '6', b: '900', c: '10' }, options: ['1500', '904', '540', '5400'], correct: 0 },
  { id: 'E2', source: src('self-2', 81, 'أؤكّد تعلّماتي'), prompt: 'في جدول التناسبية $\\begin{array}{|c|c|}\\hline 3 & 9 \\\\\\hline 8 & x \\\\\\hline\\end{array}$ ، مساواة الجداءين المتصالبين هي:', kind: 'cross', nums: { a: '3', b: '8', c: '9' }, options: ['3 × x = 8 × 9', '3 × 9 = 8 × x', '3 × 8 = 9 × x', '3 + x = 8 + 9'], correct: 0 },
  { id: 'E3', source: null, prompt: 'ثمن $3$ kg هو $50$ DA . لحساب ثمن $12$ kg دون التعامل مع عدد غير منتهٍ نستعمل:', kind: 'route', nums: { a: '3', b: '50', c: '12' }, options: ['المرور بالوحدة: $50 \\div 3$', 'الخاصية الضربية: $12 = 3 \\times 4$', 'معامل التناسبية $50 \\div 3$'], correct: 1 },
  { id: 'E4', source: src('self-3', 81, 'أؤكّد تعلّماتي'), prompt: 'ثمن $2$ kg هو $280$ DA وثمن $5$ kg هو $700$ DA . ثمن $7$ kg هو:', kind: 'additive', nums: { a: '2', b: '280', c: '5', d: '700', e: '7' }, options: ['980', '702', '1400', '840'], correct: 0 },
  { id: 'E5', source: null, prompt: 'ثمن $4$ kg هو $600$ DA . عدد الكيلوغرامات التي ثمنها $1800$ DA هو:', kind: 'fourth', nums: { hole: 'c', a: '4', b: '600', d: '1800' }, options: ['12', '450', '2400', '1204'], correct: 0 },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
