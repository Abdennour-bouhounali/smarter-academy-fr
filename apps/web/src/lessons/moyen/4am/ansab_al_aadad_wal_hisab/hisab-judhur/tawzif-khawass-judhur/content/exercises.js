/**
 * Les exercices du MANUEL rattachés au درس 5 (couverture : extraction.json →
 * destinations). Chaque énoncé est celui du livre, au mot près ; un exercice
 * à plusieurs nombres est découpé en une entrée par nombre (la première porte
 * l'énoncé), comme l'exercice 28 de la leçon « اختزال كسر ».
 *
 * Les réponses sont des RADICAUX : chaque question est un choix (`choice`),
 * dont les distracteurs sont FAUX et viennent d'erreurs réelles —
 * √(a + b) = √a + √b, b qui n'est pas le plus petit, √(a²) oublié, (a + b)²
 * = a² + b², un signe perdu. Un distracteur « b n'est pas le plus petit »
 * (6√8 pour √288) a la même valeur mais n'est PAS la forme demandée : c'est
 * l'erreur que la طريقة du manuel corrige.
 */
import { src } from '../../_unit/unitMeta.js';
import { withContext } from '../../../../../../common/textbook/exerciseParts.js';

export const LP = {
  P1: '4am_tawzif-khawass-judhur_P1',
  P2: '4am_tawzif-khawass-judhur_P2',
  P3: '4am_tawzif-khawass-judhur_P3',
};

const E = (n, page, section, part) => ({ ...src(`ex-${n}`, page, section, n), ...(part ? { part } : {}) });
const C = (prompt, options, correct, explain, cols = 3) => ({ prompt, options, correct, cols, explain });

/** Module 2 — دوري الآن 1 (p. 25). */
export const EXERCISES_1 = [
  {
    id: 'now-25-1', source: src('now-25-1', 25, 'دوري الآن', 1), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نضع: $B = \\sqrt{250} - \\sqrt{490} + 2\\sqrt{81}$ . اكتب B على الشكل $a + b\\sqrt{c}$ حيث $a$ و $b$ عددان صحيحان و $c$ عدد طبيعي أصغر ما يمكن.',
    interaction: 'choice',
    question: C('$B = $', ['$18 + 12\\sqrt{10}$', '$18 - 2\\sqrt{10}$', '$2\\sqrt{10} - 18$', '$9 - 2\\sqrt{10}$'], 1,
      '$\\sqrt{250} = \\sqrt{5^2 \\times 10} = 5\\sqrt{10}$ ، $\\sqrt{490} = \\sqrt{7^2 \\times 10} = 7\\sqrt{10}$ و $2\\sqrt{81} = 2 \\times 9 = 18$ ، إذن $B = 5\\sqrt{10} - 7\\sqrt{10} + 18 = 18 - 2\\sqrt{10}$.', 2),
    method: 'نكتب كل جذر على الشكل $a\\sqrt{b}$ ثم نجمع الحدود التي لها نفس الجذر بالخاصية التوزيعية.',
    commonError: 'نسيان أن $2\\sqrt{81} = 2 \\times 9 = 18$ عدد طبيعي، أو جمع $5\\sqrt{10}$ و $7\\sqrt{10}$ بدل طرحهما.',
  },
];

/** Module 3 — دوري الآن 2 (p. 25) : trois nombres. */
export const EXERCISES_2 = [
  {
    id: 'now-25-2-1', source: { ...src('now-25-2', 25, 'دوري الآن', 2), part: '(1)' }, learningPointId: LP.P3, difficulty: 'facile',
    statement: 'أكتب كل عدد مما يلي على شكل نسبة مقامها عدد ناطق. $\\dfrac{4}{\\sqrt{7}}$ ، $\\dfrac{\\sqrt{3}}{2\\sqrt{2}}$ و $\\dfrac{8}{5\\sqrt{2}} - \\dfrac{5}{\\sqrt{8}}$ .',
    interaction: 'choice',
    question: C('$\\dfrac{4}{\\sqrt{7}} = $', ['$\\dfrac{4}{7}$', '$\\dfrac{4\\sqrt{7}}{49}$', '$\\dfrac{4\\sqrt{7}}{7}$', '$4\\sqrt{7}$'], 2,
      '$\\dfrac{4}{\\sqrt{7}} = \\dfrac{4 \\times \\sqrt{7}}{\\sqrt{7} \\times \\sqrt{7}} = \\dfrac{4\\sqrt{7}}{7}$', 2),
    method: 'نضرب البسط والمقام في $\\sqrt{7}$.',
    commonError: 'كتابة $\\sqrt{7} \\times \\sqrt{7} = 49$ بدل 7.',
  },
  {
    id: 'now-25-2-2', source: { ...src('now-25-2', 25, 'دوري الآن', 2), part: '(2)' }, learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: C('$\\dfrac{\\sqrt{3}}{2\\sqrt{2}} = $', ['$\\dfrac{\\sqrt{6}}{4}$', '$\\dfrac{\\sqrt{6}}{2}$', '$\\dfrac{\\sqrt{6}}{8}$', '$\\dfrac{\\sqrt{3}}{4}$'], 0,
      '$\\dfrac{\\sqrt{3}}{2\\sqrt{2}} = \\dfrac{\\sqrt{3} \\times \\sqrt{2}}{2\\sqrt{2} \\times \\sqrt{2}} = \\dfrac{\\sqrt{6}}{2 \\times 2} = \\dfrac{\\sqrt{6}}{4}$', 2),
    commonError: 'نسيان المعامل 2 في المقام: $2\\sqrt{2} \\times \\sqrt{2} = 2 \\times 2 = 4$.',
  },
  {
    id: 'now-25-2-3', source: { ...src('now-25-2', 25, 'دوري الآن', 2), part: '(3)' }, learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$\\dfrac{8}{5\\sqrt{2}} - \\dfrac{5}{\\sqrt{8}} = $', ['$\\dfrac{9\\sqrt{2}}{20}$', '$\\dfrac{41\\sqrt{2}}{20}$', '$-\\dfrac{9}{20}$', '$-\\dfrac{9\\sqrt{2}}{20}$'], 3,
      '$\\dfrac{8}{5\\sqrt{2}} = \\dfrac{8\\sqrt{2}}{10} = \\dfrac{4\\sqrt{2}}{5}$ و $\\dfrac{5}{\\sqrt{8}} = \\dfrac{5}{2\\sqrt{2}} = \\dfrac{5\\sqrt{2}}{4}$ ، إذن الفرق $\\dfrac{16\\sqrt{2} - 25\\sqrt{2}}{20} = -\\dfrac{9\\sqrt{2}}{20}$.', 2),
    method: 'نجعل مقام كل نسبة عددًا ناطقًا، ثم نوحّد المقامين ونطبق الخاصية التوزيعية.',
    commonError: 'جمع $16\\sqrt{2}$ و $25\\sqrt{2}$ بدل طرحهما.',
  },
];

/* ── Module 4 — أوظّف تعلّماتي (p. 27) ─────────────────────────────────── */
const S18 = 'اكتب كل عدد مما يلي على الشكل $a\\sqrt{b}$ حيث $a$ و $b$ عددان طبيعيان و $b$ أصغر ما يمكن.';
const ERR18 = 'التوقّف عند مربع ليس الأكبر: $\\sqrt{288} = \\sqrt{36 \\times 8} = 6\\sqrt{8}$ صحيحة لكن 8 ليس أصغر ما يمكن لأن $8 = 2^2 \\times 2$، فـ $\\sqrt{288} = 12\\sqrt{2}$.';
const EX18 = [
  ['\\sqrt{8}', ['$4\\sqrt{2}$', '$2\\sqrt{2}$', '$2\\sqrt{4}$'], 1, '$\\sqrt{8} = \\sqrt{2^2 \\times 2} = 2\\sqrt{2}$'],
  ['\\sqrt{32}', ['$4\\sqrt{2}$', '$2\\sqrt{8}$', '$16\\sqrt{2}$'], 0, '$32 = 16 \\times 2 = 4^2 \\times 2$ ، إذن $\\sqrt{32} = 4\\sqrt{2}$ (و $2\\sqrt{8}$ ليست أبسط كتابة لأن $8 = 2^2 \\times 2$).'],
  ['\\sqrt{75}', ['$25\\sqrt{3}$', '$3\\sqrt{5}$', '$5\\sqrt{3}$'], 2, '$75 = 25 \\times 3 = 5^2 \\times 3$ ، إذن $\\sqrt{75} = 5\\sqrt{3}$'],
  ['\\sqrt{288}', ['$6\\sqrt{8}$', '$12\\sqrt{2}$', '$144\\sqrt{2}$'], 1, '$288 = 144 \\times 2 = 12^2 \\times 2$ ، إذن $\\sqrt{288} = 12\\sqrt{2}$'],
  ['\\sqrt{300}', ['$10\\sqrt{3}$', '$5\\sqrt{12}$', '$100\\sqrt{3}$'], 0, '$300 = 100 \\times 3 = 10^2 \\times 3$ ، إذن $\\sqrt{300} = 10\\sqrt{3}$'],
  ['\\sqrt{363}', ['$3\\sqrt{11}$', '$121\\sqrt{3}$', '$11\\sqrt{3}$'], 2, '$363 = 121 \\times 3 = 11^2 \\times 3$ ، إذن $\\sqrt{363} = 11\\sqrt{3}$'],
  ['\\sqrt{6250}', ['$5\\sqrt{250}$', '$25\\sqrt{10}$', '$625\\sqrt{10}$'], 1, '$6250 = 625 \\times 10 = 25^2 \\times 10$ ، إذن $\\sqrt{6250} = 25\\sqrt{10}$'],
];

const S19 = 'اكتب كل عدد مما يلي على الشكل $\\sqrt{n}$ حيث $n$ عدد طبيعي.';
const EX19 = [
  ['4\\sqrt{3}', ['$\\sqrt{12}$', '$\\sqrt{48}$', '$\\sqrt{19}$'], 1, '$4\\sqrt{3} = \\sqrt{4^2 \\times 3} = \\sqrt{48}$'],
  ['2\\sqrt{5}', ['$\\sqrt{20}$', '$\\sqrt{10}$', '$\\sqrt{100}$'], 0, '$2\\sqrt{5} = \\sqrt{2^2 \\times 5} = \\sqrt{20}$'],
  ['7\\sqrt{2}', ['$\\sqrt{14}$', '$\\sqrt{196}$', '$\\sqrt{98}$'], 2, '$7\\sqrt{2} = \\sqrt{7^2 \\times 2} = \\sqrt{98}$'],
  ['5\\sqrt{5}', ['$\\sqrt{25}$', '$\\sqrt{125}$', '$\\sqrt{50}$'], 1, '$5\\sqrt{5} = \\sqrt{5^2 \\times 5} = \\sqrt{125}$'],
  ['2\\sqrt{7}', ['$\\sqrt{28}$', '$\\sqrt{14}$', '$\\sqrt{49}$'], 0, '$2\\sqrt{7} = \\sqrt{2^2 \\times 7} = \\sqrt{28}$'],
  ['3\\sqrt{27}', ['$\\sqrt{81}$', '$\\sqrt{729}$', '$\\sqrt{243}$'], 2, '$3\\sqrt{27} = \\sqrt{3^2 \\times 27} = \\sqrt{243}$'],
  ['4\\sqrt{0{,}25}', ['$\\sqrt{1}$', '$\\sqrt{4}$', '$\\sqrt{16}$'], 1, '$4\\sqrt{0{,}25} = \\sqrt{4^2 \\times 0{,}25} = \\sqrt{4}$'],
  ['0{,}9\\sqrt{100}', ['$\\sqrt{81}$', '$\\sqrt{90}$', '$\\sqrt{9}$'], 0, '$0{,}9\\sqrt{100} = \\sqrt{0{,}9^2 \\times 100} = \\sqrt{0{,}81 \\times 100} = \\sqrt{81}$'],
];

const S22 = 'اكتب كل عدد مما يلي على شكل نسبة مقامها عدد ناطق.';
const EX22 = [
  ['\\dfrac{2}{\\sqrt{3}}', ['$\\dfrac{2}{3}$', '$\\dfrac{2\\sqrt{3}}{3}$', '$\\dfrac{2\\sqrt{3}}{9}$'], 1, '$\\dfrac{2}{\\sqrt{3}} = \\dfrac{2 \\times \\sqrt{3}}{\\sqrt{3} \\times \\sqrt{3}} = \\dfrac{2\\sqrt{3}}{3}$'],
  ['\\dfrac{1}{\\sqrt{5}}', ['$\\dfrac{\\sqrt{5}}{5}$', '$\\dfrac{1}{5}$', '$\\dfrac{\\sqrt{5}}{25}$'], 0, '$\\dfrac{1}{\\sqrt{5}} = \\dfrac{\\sqrt{5}}{\\sqrt{5} \\times \\sqrt{5}} = \\dfrac{\\sqrt{5}}{5}$'],
  ['\\dfrac{\\sqrt{3}}{\\sqrt{2}}', ['$\\dfrac{\\sqrt{6}}{4}$', '$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{\\sqrt{6}}{2}$'], 2, '$\\dfrac{\\sqrt{3}}{\\sqrt{2}} = \\dfrac{\\sqrt{3} \\times \\sqrt{2}}{\\sqrt{2} \\times \\sqrt{2}} = \\dfrac{\\sqrt{6}}{2}$'],
  ['\\dfrac{\\sqrt{6}}{\\sqrt{42}}', ['$\\sqrt{7}$', '$\\dfrac{\\sqrt{7}}{7}$', '$\\dfrac{1}{7}$'], 1, '$\\dfrac{\\sqrt{6}}{\\sqrt{42}} = \\sqrt{\\dfrac{6}{42}} = \\dfrac{1}{\\sqrt{7}} = \\dfrac{\\sqrt{7}}{7}$'],
];

const EX23 = [
  ['\\dfrac{2 + \\sqrt{3}}{\\sqrt{3}}', ['$\\dfrac{2\\sqrt{3} + 3}{3}$', '$\\dfrac{5}{3}$', '$2\\sqrt{3} + 1$'], 0, '$\\dfrac{(2 + \\sqrt{3}) \\times \\sqrt{3}}{\\sqrt{3} \\times \\sqrt{3}} = \\dfrac{2\\sqrt{3} + 3}{3}$'],
  ['\\dfrac{\\sqrt{5} - 3}{\\sqrt{5}}', ['$\\dfrac{2}{5}$', '$\\dfrac{5 - 3\\sqrt{5}}{5}$', '$-\\dfrac{2\\sqrt{5}}{5}$'], 1, '$\\dfrac{(\\sqrt{5} - 3) \\times \\sqrt{5}}{\\sqrt{5} \\times \\sqrt{5}} = \\dfrac{5 - 3\\sqrt{5}}{5}$'],
  ['\\dfrac{2\\sqrt{5} - 2}{3\\sqrt{7}}', ['$\\dfrac{2\\sqrt{35} - 2}{21}$', '$\\dfrac{2\\sqrt{35} - 2\\sqrt{7}}{7}$', '$\\dfrac{2\\sqrt{35} - 2\\sqrt{7}}{21}$'], 2, '$\\dfrac{(2\\sqrt{5} - 2) \\times \\sqrt{7}}{3\\sqrt{7} \\times \\sqrt{7}} = \\dfrac{2\\sqrt{35} - 2\\sqrt{7}}{21}$'],
  ['\\dfrac{2\\sqrt{3} - 6}{\\sqrt{6}}', ['$\\sqrt{2} - \\sqrt{6}$', '$2\\sqrt{2} - \\sqrt{6}$', '$\\sqrt{2} - 6$'], 0, '$\\dfrac{(2\\sqrt{3} - 6) \\times \\sqrt{6}}{6} = \\dfrac{2\\sqrt{18} - 6\\sqrt{6}}{6} = \\dfrac{6\\sqrt{2} - 6\\sqrt{6}}{6} = \\sqrt{2} - \\sqrt{6}$'],
];

const S24 = 'عيّن العدد $a$ في كل حالة مما يلي:';
const EX24 = [
  ['\\sqrt{3}\\,a = \\dfrac{\\sqrt{2}}{2}', ['$a = \\dfrac{\\sqrt{6}}{2}$', '$a = \\dfrac{\\sqrt{6}}{6}$', '$a = \\dfrac{\\sqrt{6}}{3}$'], 1, '$a = \\dfrac{\\sqrt{2}}{2\\sqrt{3}} = \\dfrac{\\sqrt{2} \\times \\sqrt{3}}{2\\sqrt{3} \\times \\sqrt{3}} = \\dfrac{\\sqrt{6}}{6}$'],
  ['\\dfrac{1}{\\sqrt{5}} = \\dfrac{\\sqrt{2}}{a}', ['$a = \\sqrt{10}$', '$a = \\sqrt{7}$', '$a = 5\\sqrt{2}$'], 0, 'الجداءان المتصالبان متساويان: $a \\times 1 = \\sqrt{2} \\times \\sqrt{5}$ ، إذن $a = \\sqrt{10}$'],
  ['\\dfrac{a}{\\sqrt{11}} = 2 - \\sqrt{11}', ['$a = -9$', '$a = \\sqrt{11}$', '$a = 2\\sqrt{11} - 11$'], 2, '$a = (2 - \\sqrt{11}) \\times \\sqrt{11} = 2\\sqrt{11} - 11$'],
  ['\\dfrac{\\sqrt{8}}{a} = \\dfrac{-3\\sqrt{15}}{\\sqrt{3}}', ['$a = \\dfrac{2\\sqrt{10}}{15}$', '$a = -\\dfrac{2\\sqrt{10}}{15}$', '$a = -\\dfrac{3\\sqrt{10}}{4}$'], 1, '$\\dfrac{-3\\sqrt{15}}{\\sqrt{3}} = -3\\sqrt{5}$ ، إذن $a = \\dfrac{\\sqrt{8}}{-3\\sqrt{5}} = -\\dfrac{2\\sqrt{2} \\times \\sqrt{5}}{3 \\times 5} = -\\dfrac{2\\sqrt{10}}{15}$'],
];

const split = (list, n, page, section, statement, lp, difficulty, extra = {}) => list.map(([tex, options, correct, explain], i) => ({
  id: `ex-${n}-${i + 1}`, source: E(n, page, section, `(${i + 1})`), learningPointId: lp, difficulty,
  ...(i === 0 ? { statement } : {}), interaction: 'choice',
  question: C(`$${tex}$`, options, correct, explain),
  ...(i === 0 ? extra : {}),
}));

export const EXERCISES_3 = [
  ...split(EX18, 18, 27, 'أوظّف تعلّماتي', S18, LP.P1, 'facile', {
    method: 'نبحث عن أكبر مربع $a^2$ يقسم $n$، فيكون $n = a^2 \\times b$ و $\\sqrt{n} = a\\sqrt{b}$.', commonError: ERR18,
  }),
  ...split(EX19, 19, 27, 'أوظّف تعلّماتي', S19, LP.P1, 'facile', {
    method: 'ندخل المعامل تحت الجذر بتربيعه: $a\\sqrt{b} = \\sqrt{a^2 \\times b}$.', commonError: 'ضرب المعامل في العدد تحت الجذر دون تربيعه: $4\\sqrt{3} = \\sqrt{12}$ خطأ.',
  }),
  ...split(EX22, 22, 27, 'أوظّف تعلّماتي', S22, LP.P3, 'facile', {
    method: 'نضرب البسط والمقام في الجذر الذي في المقام.', commonError: 'كتابة $\\sqrt{3} \\times \\sqrt{3} = 9$ بدل 3.',
  }),
  ...split(EX23, 23, 27, 'أوظّف تعلّماتي', S22, LP.P3, 'moyen', {
    method: 'نضرب البسط كله والمقام في نفس الجذر، ثم ننشر البسط بالخاصية التوزيعية.', commonError: 'ضرب حدّ واحد من البسط في الجذر ونسيان الآخر: $\\dfrac{2 + \\sqrt{3}}{\\sqrt{3}} = \\dfrac{2 + 3}{3}$ خطأ.',
  }),
  ...split(EX24, 24, 27, 'أوظّف تعلّماتي', S24, LP.P3, 'difficile', {
    method: 'نعزل $a$، ثم نكتب النتيجة على شكل نسبة مقامها عدد ناطق.', commonError: 'فقدان إشارة الناقص في الحالة الأخيرة.',
  }),
  {
    id: 'ex-26-1', source: E(26, 27, 'أوظّف تعلّماتي', '1)'), learningPointId: LP.P1, difficulty: 'facile',
    statement: '1) اكتب كل عدد مما يلي على الشكل $a\\sqrt{3}$ حيث $a$ عدد طبيعي: $\\sqrt{12}$ ، $\\sqrt{75}$ ، $\\sqrt{147}$ .',
    interaction: 'choice',
    question: C('', ['$4\\sqrt{3}$ ، $25\\sqrt{3}$ و $49\\sqrt{3}$', '$2\\sqrt{3}$ ، $5\\sqrt{3}$ و $7\\sqrt{3}$', '$3\\sqrt{2}$ ، $3\\sqrt{5}$ و $3\\sqrt{7}$'], 1,
      '$12 = 2^2 \\times 3$ ، $75 = 5^2 \\times 3$ و $147 = 7^2 \\times 3$.', 1),
    method: 'نكتب كل عدد على الشكل $a^2 \\times 3$.',
    commonError: 'نسيان أخذ جذر المربع: $\\sqrt{12} = 4\\sqrt{3}$ خطأ.',
  },
  {
    id: 'ex-26-2', source: E(26, 27, 'أوظّف تعلّماتي', '2)'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: '2) استنتج كتابة مبسطة للعدد A حيث $A = 2\\sqrt{12} - 4\\sqrt{3} + \\sqrt{75} - \\sqrt{147}$ .',
    interaction: 'choice',
    question: C('$A = $', ['$2\\sqrt{3}$', '$-4\\sqrt{3}$', '$-2\\sqrt{3}$', '$-6\\sqrt{3}$'], 2,
      '$A = 2(2\\sqrt{3}) - 4\\sqrt{3} + 5\\sqrt{3} - 7\\sqrt{3} = (4 - 4 + 5 - 7)\\sqrt{3} = -2\\sqrt{3}$', 2),
    method: 'نستعمل كتابات 1) ثم نطبق الخاصية التوزيعية.',
    commonError: 'نسيان ضرب $2\\sqrt{3}$ في المعامل 2: $2\\sqrt{12} = 4\\sqrt{3}$.',
  },
  {
    id: 'ex-27-A', source: E(27, 27, 'أوظّف تعلّماتي', 'A'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'اكتب كلا من العددين A و B على الشكل $a\\sqrt{b}$ حيث $a$ عدد صحيح و $b$ عدد طبيعي أصغر ما يمكن.',
    items: ['$A = \\sqrt{20} - 3\\sqrt{125} + 4\\sqrt{45}$', '$B = 5\\sqrt{24} + \\sqrt{54} - 3\\sqrt{216} + 2\\sqrt{6}$'],
    interaction: 'choice',
    question: C('$A = $', ['$\\sqrt{5}$', '$-\\sqrt{5}$', '$-25\\sqrt{5}$'], 1,
      '$A = 2\\sqrt{5} - 3(5\\sqrt{5}) + 4(3\\sqrt{5}) = (2 - 15 + 12)\\sqrt{5} = -\\sqrt{5}$'),
    method: 'نكتب كل جذر على الشكل $a\\sqrt{b}$ ثم نطبق الخاصية التوزيعية.',
    commonError: 'خطأ في الإشارة: جمع $15\\sqrt{5}$ بدل طرحه، أو طرح $12\\sqrt{5}$ بدل جمعه.',
  },
  {
    id: 'ex-27-B', source: E(27, 27, 'أوظّف تعلّماتي', 'B'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: C('$B = $', ['$33\\sqrt{6}$', '$3\\sqrt{6}$', '$-5\\sqrt{6}$', '$-3\\sqrt{6}$'], 3,
      '$B = 10\\sqrt{6} + 3\\sqrt{6} - 18\\sqrt{6} + 2\\sqrt{6} = (10 + 3 - 18 + 2)\\sqrt{6} = -3\\sqrt{6}$', 2),
    commonError: 'جمع كل المعاملات دون مراعاة الإشارات.',
  },
  {
    id: 'ex-31-2', source: { ...src('ex-31', 29, 'أتعمّق', 31), part: '2)' }, learningPointId: LP.P3, difficulty: 'difficile',
    statement: '2) يعطى $a = 1 \\div (\\sqrt{3} + \\sqrt{2})$ و $b = \\sqrt{3} - \\sqrt{2}$ . استعمل حاسبة لتحسب $a$ و $b$. هل $a = b$؟ علّل.',
    interaction: 'choice',
    question: C('', [
      'لا: الحاسبة تعطي قيمتين مقرّبتين فقط، والعددان مختلفان',
      'نعم: $(\\sqrt{3} + \\sqrt{2})(\\sqrt{3} - \\sqrt{2}) = 3 - 2 = 1$ ، إذن $\\dfrac{1}{\\sqrt{3} + \\sqrt{2}} = \\sqrt{3} - \\sqrt{2}$',
      'نعم: لأن $\\dfrac{1}{\\sqrt{3} + \\sqrt{2}} = \\dfrac{1}{\\sqrt{3}} + \\dfrac{1}{\\sqrt{2}}$',
    ], 1,
      'بالمتطابقة $(a + b)(a - b) = a^2 - b^2$ : $(\\sqrt{3} + \\sqrt{2})(\\sqrt{3} - \\sqrt{2}) = 1$ ، فالعدد $\\sqrt{3} - \\sqrt{2}$ هو مقلوب $\\sqrt{3} + \\sqrt{2}$. الحاسبة تقترح المساواة، والحساب يثبتها.', 1),
    method: 'نبحث عن جداء يساوي 1 بالمتطابقة $(a + b)(a - b) = a^2 - b^2$.',
    commonError: 'الظن أن $\\dfrac{1}{\\sqrt{3} + \\sqrt{2}} = \\dfrac{1}{\\sqrt{3}} + \\dfrac{1}{\\sqrt{2}}$.',
  },
];

/* ── Module 5 — أتعمّق ──────────────────────────────────────────────────── */
export const EXERCISES_4 = [
  ...split([
    ['\\sqrt{3}(\\sqrt{3} + 2)', ['$3\\sqrt{3}$', '$3 + 2\\sqrt{3}$', '$9 + 2\\sqrt{3}$'], 1, '$\\sqrt{3} \\times \\sqrt{3} + 2\\sqrt{3} = 3 + 2\\sqrt{3}$'],
    ['(5 + \\sqrt{7})(\\sqrt{7} - 4)', ['$\\sqrt{7} - 13$', '$9\\sqrt{7} - 13$', '$\\sqrt{7} - 27$'], 0, '$5\\sqrt{7} - 20 + 7 - 4\\sqrt{7} = \\sqrt{7} - 13$'],
    ['(2\\sqrt{3} - \\sqrt{5})(\\sqrt{5} + \\sqrt{3})', ['$11 + \\sqrt{15}$', '$1 - \\sqrt{15}$', '$1 + \\sqrt{15}$'], 2, '$2\\sqrt{15} + 6 - 5 - \\sqrt{15} = 1 + \\sqrt{15}$'],
  ], 28, 27, 'أوظّف تعلّماتي', 'انشر وبسّط كلا مما يأتي:', LP.P2, 'moyen', {
    method: 'ننشر بالخاصية التوزيعية، ثم نستعمل $\\sqrt{a} \\times \\sqrt{a} = a$ ونجمع الحدود المتشابهة.',
    commonError: 'نسيان أن $\\sqrt{7} \\times \\sqrt{7} = 7$ عدد ناطق، أو خطأ في إشارة جداء حدّين سالبين.',
  }),
  ...split([
    ['(\\sqrt{5} + \\sqrt{3})^2', ['$8$', '$8 + 2\\sqrt{15}$', '$8 + \\sqrt{15}$'], 1, '$(\\sqrt{5})^2 + 2\\sqrt{5}\\sqrt{3} + (\\sqrt{3})^2 = 8 + 2\\sqrt{15}$'],
    ['(\\sqrt{7} + \\sqrt{3})^2', ['$10 + 2\\sqrt{21}$', '$10$', '$10 + 2\\sqrt{10}$'], 0, '$7 + 2\\sqrt{21} + 3 = 10 + 2\\sqrt{21}$'],
    ['(\\sqrt{25} - 4)(\\sqrt{25} + 4)', ['$21$', '$1$', '$9$'], 2, '$(\\sqrt{25})^2 - 4^2 = 25 - 16 = 9$'],
    ['(2\\sqrt{3} + 3\\sqrt{2})^2 - 5(6 + \\sqrt{6})', ['$30 + 7\\sqrt{6}$', '$7\\sqrt{6}$', '$17\\sqrt{6}$'], 1, '$(2\\sqrt{3} + 3\\sqrt{2})^2 = 12 + 12\\sqrt{6} + 18 = 30 + 12\\sqrt{6}$ ، إذن العبارة $30 + 12\\sqrt{6} - 30 - 5\\sqrt{6} = 7\\sqrt{6}$'],
  ], 29, 27, 'أوظّف تعلّماتي', 'انشر كلا مما يأتي وبسّطه:', LP.P2, 'moyen', {
    method: 'نستعمل المتطابقات الشهيرة $(a + b)^2 = a^2 + 2ab + b^2$ و $(a - b)(a + b) = a^2 - b^2$.',
    commonError: 'كتابة $(\\sqrt{5} + \\sqrt{3})^2 = 5 + 3$: نسيان الحدّ $2ab$.',
  }),
  {
    id: 'ex-30-1', source: E(30, 27, 'أوظّف تعلّماتي', '1)'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نعتبر العددين A و B حيث $A = 7 + \\sqrt{32}$ و $B = 7 - 4\\sqrt{2}$ .',
    items: ['1) احسب ما يلي: $A + B$ ، $A - B$ ، $A \\times B$ .', '2) اكتب $\\dfrac{A}{B}$ على شكل نسبة مقامها عدد ناطق.'],
    interaction: 'choice',
    question: C('1) $A + B$ ، $A - B$ ، $A \\times B$ :', [
      '$A + B = 14$ ، $A - B = 8\\sqrt{2}$ ، $A \\times B = 17$',
      '$A + B = 14$ ، $A - B = 0$ ، $A \\times B = 33$',
      '$A + B = 14 + 8\\sqrt{2}$ ، $A - B = 8\\sqrt{2}$ ، $A \\times B = 81$',
    ], 0, '$\\sqrt{32} = 4\\sqrt{2}$ ، إذن $A = 7 + 4\\sqrt{2}$ ؛ $A + B = 14$ ، $A - B = 8\\sqrt{2}$ و $A \\times B = 7^2 - (4\\sqrt{2})^2 = 49 - 32 = 17$.', 1),
    method: 'نكتب $\\sqrt{32} = 4\\sqrt{2}$، ثم نستعمل $(a + b)(a - b) = a^2 - b^2$.',
    commonError: 'حساب $(4\\sqrt{2})^2 = 16$ بدل 32.',
  },
  {
    id: 'ex-30-2', source: E(30, 27, 'أوظّف تعلّماتي', '2)'), learningPointId: LP.P3, difficulty: 'difficile',
    interaction: 'choice',
    question: C('2) $\\dfrac{A}{B} = $', ['$\\dfrac{81 + 56\\sqrt{2}}{81}$', '$\\dfrac{81}{17}$', '$\\dfrac{81 + 56\\sqrt{2}}{17}$', '$\\dfrac{7 + 4\\sqrt{2}}{17}$'], 2,
      'نضرب البسط والمقام في $A$: $\\dfrac{A}{B} = \\dfrac{A \\times A}{B \\times A} = \\dfrac{(7 + 4\\sqrt{2})^2}{17} = \\dfrac{49 + 56\\sqrt{2} + 32}{17} = \\dfrac{81 + 56\\sqrt{2}}{17}$', 2),
    commonError: 'نسيان تربيع البسط، أو نسيان الحدّ $2ab = 56\\sqrt{2}$.',
  },
  {
    id: 'ex-32-1', source: E(32, 29, 'أتعمّق', '1)'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ABCDEFGH مكعّب طول حرفه 5cm.',
    items: ['1) ما طبيعة كل من المثلثين BCF و EFC؟', '2) احسب القيمة المضبوطة لكل من الطولين CF و CE. (أعط الناتج على الشكل $a\\sqrt{b}$ حيث $b$ أصغر ما يمكن).'],
    interaction: 'choice',
    question: C('1) المثلثان BCF و EFC:', ['متقايسا الأضلاع', 'قائمان: BCF قائم في B و EFC قائم في F', 'قائمان: BCF قائم في C و EFC قائم في E'], 1,
      'الحرف BF عمودي على الحرف BC، والحرف EF عمودي على الوجه BCGF فهو عمودي على [FC].', 1),
    commonError: 'الخلط بين رأس الزاوية القائمة والرأس المقابل للوتر.',
  },
  {
    id: 'ex-32-2', source: E(32, 29, 'أتعمّق', '2)'), learningPointId: LP.P1, difficulty: 'difficile',
    interaction: 'choice',
    question: C('2) CF و CE:', ['$CF = 5\\sqrt{2}$ و $CE = 5\\sqrt{3}$', '$CF = 10$ و $CE = 15$', '$CF = 25\\sqrt{2}$ و $CE = 75$', '$CF = 5\\sqrt{2}$ و $CE = 10$'], 0,
      'حسب خاصية فيثاغورس: $CF^2 = 5^2 + 5^2 = 50$ ، إذن $CF = \\sqrt{25 \\times 2} = 5\\sqrt{2}$ ؛ $CE^2 = EF^2 + CF^2 = 25 + 50 = 75$ ، إذن $CE = \\sqrt{25 \\times 3} = 5\\sqrt{3}$.', 1),
    method: 'خاصية فيثاغورس في المثلثين القائمين، ثم أكبر مربع يقسم $CF^2$ و $CE^2$.',
    commonError: 'جمع الأطوال بدل مربّعاتها: $CF = 5 + 5 = 10$.',
  },
  {
    id: 'ex-34-1', source: E(34, 29, 'أتعمّق', '1)'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'نعتبر المثلث ABC القائم في A والمتساوي الساقين حيث $AC = x$.',
    items: ['1) احسب الطول BC بدلالة $x$. (تعطى النتيجة على الشكل $a\\sqrt{b}$)', '2) عبّر عن P محيط المثلث ABC بدلالة $x$.', '3) احسب المدوّر إلى جزء من مئة لـ P في كل من الحالتين: الحالة 1: $x = 3$cm الحالة 2: $x = 5$cm'],
    interaction: 'choice',
    question: C('1) $BC = $', ['$2x$', '$x\\sqrt{2}$', '$\\sqrt{2x}$'], 1,
      '$BC^2 = x^2 + x^2 = 2x^2$ ، إذن $BC = \\sqrt{x^2 \\times 2} = x\\sqrt{2}$'),
    commonError: 'كتابة $BC = x + x = 2x$: جمع الضلعين بدل تطبيق خاصية فيثاغورس.',
  },
  {
    id: 'ex-34-2', source: E(34, 29, 'أتعمّق', '2)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('2) $P = $', ['$3x$', '$(2 + \\sqrt{2})x^2$', '$(2 + \\sqrt{2})x$'], 2,
      '$P = x + x + x\\sqrt{2} = (1 + 1 + \\sqrt{2})x = (2 + \\sqrt{2})x$'),
  },
  {
    id: 'ex-34-3', source: E(34, 29, 'أتعمّق', '3) الحالة 1'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'numeric',
    question: { prompt: '3) الحالة 1 ($x = 3$) : المدوّر إلى جزء من مئة لـ P (بـ cm)', expected: 10.24, display: '10,24',
      explain: '$P = (2 + \\sqrt{2}) \\times 3 \\approx 10{,}2426$ ، والمدوّر إلى جزء من مئة هو $10{,}24$.' },
  },
  {
    id: 'ex-34-4', source: E(34, 29, 'أتعمّق', '3) الحالة 2'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'numeric',
    question: { prompt: '3) الحالة 2 ($x = 5$) : المدوّر إلى جزء من مئة لـ P (بـ cm)', expected: 17.07, display: '17,07',
      explain: '$P = (2 + \\sqrt{2}) \\times 5 \\approx 17{,}0711$ ، والمدوّر إلى جزء من مئة هو $17{,}07$.' },
    commonError: 'البتر بدل التدوير، أو تدوير $\\sqrt{2}$ مبكّرًا جدًّا.',
  },
  {
    id: 'ex-36-1', source: E(36, 29, 'أتعمّق', '1) أ'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: '$x$ ، $y$ ، $z$ أطوال أضلاع مثلث حيث $x = \\sqrt{3 + \\sqrt{27}}$ ، $y = \\sqrt{-3 + \\sqrt{12}}$ و $z = \\sqrt{\\sqrt{75}}$',
    items: ['1) أ) اكتب كلا من العددين $x^2$ و $y^2$ على الشكل $a + b\\sqrt{3}$ حيث $a$ و $b$ عددان صحيحان نسبيان. ب) اكتب العدد $z^2$ على الشكل $a\\sqrt{3}$ حيث $a$ عدد طبيعي.', '2) بيّن أنّ هذا المثلث قائم.'],
    interaction: 'choice',
    question: C('1) أ)', ['$x^2 = 3 + 3\\sqrt{3}$ و $y^2 = -3 + 2\\sqrt{3}$', '$x^2 = 3 + 9\\sqrt{3}$ و $y^2 = -3 + 4\\sqrt{3}$', '$x^2 = 6\\sqrt{3}$ و $y^2 = -\\sqrt{3}$'], 0,
      '$x^2 = 3 + \\sqrt{27} = 3 + \\sqrt{3^2 \\times 3} = 3 + 3\\sqrt{3}$ و $y^2 = -3 + \\sqrt{2^2 \\times 3} = -3 + 2\\sqrt{3}$.', 1),
    commonError: 'جمع 3 و $3\\sqrt{3}$ كأنهما حدّان متشابهان: $3 + 3\\sqrt{3} \\neq 6\\sqrt{3}$.',
  },
  {
    id: 'ex-36-2', source: E(36, 29, 'أتعمّق', '1) ب'), learningPointId: LP.P1, difficulty: 'moyen',
    interaction: 'choice',
    question: C('1) ب) $z^2 = $', ['$25\\sqrt{3}$', '$5\\sqrt{3}$', '$75$'], 1, '$z^2 = \\sqrt{75} = \\sqrt{5^2 \\times 3} = 5\\sqrt{3}$'),
  },
  {
    id: 'ex-36-3', source: E(36, 29, 'أتعمّق', '2)'), learningPointId: LP.P2, difficulty: 'difficile',
    interaction: 'choice',
    question: C('2) لماذا المثلث قائم؟', [
      'لأن $x + y = z$',
      'لأن $x^2 + y^2 = 5\\sqrt{3} = z^2$ ، فالمثلث قائم حسب الخاصية العكسية لفيثاغورس',
      'لأن $x^2 = y^2 + z^2$',
    ], 1, '$x^2 + y^2 = (3 - 3) + (3 + 2)\\sqrt{3} = 5\\sqrt{3} = z^2$ : المثلث قائم، والزاوية القائمة مقابلة للضلع الذي طوله $z$.', 1),
    method: 'نحسب $x^2 + y^2$ بالخاصية التوزيعية ونقارنه بـ $z^2$.',
  },
  {
    id: 'ex-37-1', source: E(37, 29, 'أتعمّق', '1)'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'من امتحان شهادة التعليم المتوسط. A و B عددان حيث: $A = 3\\sqrt{8} \\times \\sqrt{2}$ ؛ $B = 2\\sqrt{27} - 2\\sqrt{3} + \\sqrt{12}$',
    items: ['1) بيّن أنّ A عدد طبيعي.', '2) اكتب العدد B على الشكل $a\\sqrt{3}$، حيث $a$ عدد طبيعي.', '3) بيّن أنّ $\\dfrac{A}{B} = \\dfrac{2\\sqrt{3}}{3}$ .'],
    interaction: 'choice',
    question: C('1) $A = $', ['$3\\sqrt{10}$', '$24$', '$12$'], 2, '$A = 3\\sqrt{8 \\times 2} = 3\\sqrt{16} = 3 \\times 4 = 12$'),
  },
  {
    id: 'ex-37-2', source: E(37, 29, 'أتعمّق', '2)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('2) $B = $', ['$6\\sqrt{3}$', '$4\\sqrt{3}$', '$10\\sqrt{3}$'], 0,
      '$B = 2(3\\sqrt{3}) - 2\\sqrt{3} + 2\\sqrt{3} = (6 - 2 + 2)\\sqrt{3} = 6\\sqrt{3}$'),
    commonError: 'نسيان المعامل 2 أمام $\\sqrt{27}$.',
  },
  {
    id: 'ex-37-3', source: E(37, 29, 'أتعمّق', '3)'), learningPointId: LP.P3, difficulty: 'moyen',
    interaction: 'choice',
    question: C('3) أي كتابة تبيّن المطلوب؟', [
      '$\\dfrac{A}{B} = \\dfrac{12}{6\\sqrt{3}} = 2\\sqrt{3}$',
      '$\\dfrac{A}{B} = \\dfrac{12}{6\\sqrt{3}} = \\dfrac{2}{\\sqrt{3}} = \\dfrac{2\\sqrt{3}}{3}$',
      '$\\dfrac{A}{B} = \\dfrac{12}{6\\sqrt{3}} = \\dfrac{2}{3}$',
    ], 1, 'نختزل على 6 ثم نضرب البسط والمقام في $\\sqrt{3}$.', 1),
  },
  {
    id: 'ex-38-A', source: E(38, 29, 'أتعمّق', '1)'), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'من امتحان شهادة التعليم المتوسط. إليك الأعداد A، B، C حيث: $A = \\dfrac{3}{5} + \\dfrac{2}{5} \\times \\dfrac{7}{4}$ ، $B = \\dfrac{1{,}2 \\times 10^{-2} \\times 7}{12{,}5 \\times 10^{3}}$ ، $C = \\sqrt{175} - \\sqrt{112} + 6\\sqrt{7}$ .',
    items: ['1) احسب A واكتبه على الشكل العشري.', '2) أعط الكتابة العلمية للعدد B', '3) اكتب C على أبسط شكل ممكن.'],
    interaction: 'numeric',
    question: { prompt: '1) A على الشكل العشري:', expected: 1.3, display: '1,3',
      explain: '$A = \\dfrac{3}{5} + \\dfrac{14}{20} = \\dfrac{12}{20} + \\dfrac{14}{20} = \\dfrac{26}{20} = 1{,}3$ (الضرب قبل الجمع).' },
    commonError: 'إجراء الجمع قبل الضرب.',
  },
  {
    id: 'ex-38-B', source: E(38, 29, 'أتعمّق', '2)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('2) الكتابة العلمية للعدد B:', ['$6{,}72 \\times 10^{-5}$', '$67{,}2 \\times 10^{-7}$', '$6{,}72 \\times 10^{-6}$'], 2,
      '$B = \\dfrac{8{,}4 \\times 10^{-2}}{12{,}5 \\times 10^{3}} = 0{,}672 \\times 10^{-5} = 6{,}72 \\times 10^{-6}$', 1),
  },
  {
    id: 'ex-38-C', source: E(38, 29, 'أتعمّق', '3)'), learningPointId: LP.P2, difficulty: 'moyen',
    interaction: 'choice',
    question: C('3) $C = $', ['$\\sqrt{63} + 6\\sqrt{7}$', '$7\\sqrt{7}$', '$15\\sqrt{7}$'], 1,
      '$\\sqrt{175} = 5\\sqrt{7}$ و $\\sqrt{112} = 4\\sqrt{7}$ ، إذن $C = (5 - 4 + 6)\\sqrt{7} = 7\\sqrt{7}$'),
    commonError: 'كتابة $\\sqrt{175} - \\sqrt{112} = \\sqrt{63}$: جذر الفرق لا يساوي فرق الجذرين.',
  },
];

export const EXERCISES = [...EXERCISES_1, ...EXERCISES_2, ...EXERCISES_3, ...EXERCISES_4];
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
/** Les entrées d'un exercice du manuel, dans l'ordre (ex-18 → ex-18-1 … ex-18-7). */
// lecteur : les parties sans énoncé portent celui de la partie 1 (« pas d'aller-retour », common/textbook/exerciseParts.js)
export const partsOf = (n) => withContext(EXERCISES.filter((e) => e.id === `ex-${n}` || e.id.startsWith(`ex-${n}-`)));
