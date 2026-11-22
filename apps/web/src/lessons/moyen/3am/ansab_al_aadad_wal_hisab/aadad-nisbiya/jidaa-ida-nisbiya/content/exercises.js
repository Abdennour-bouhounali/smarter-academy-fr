/**
 * Les exercices du درس « جداء عدة أعداد نسبية » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres contextes, autres nombres, même
 * compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il
 * remplace (traçabilité de `check:textbook`) ; `src()` sans numéro : jamais montré à l'élève. Chaque clé est CALCULÉE ici avec
 * `packages/core/arithmetic/relativeOps.js` et RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que
 * chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit1/extraction.json) : now-11, deep-39, 42, 44, 49, 51, ex-13 → module 4 ; ex-5, 9–12, 14, 18, 20,
 * self-6, 7, 12, deep-35, 46 → la banque ; self-1 … self-5 (réécrits) restent à la leçon précédente, le test final de celle-ci porte ses propres épreuves.
 */
import * as R from '@smarter-academy/core/arithmetic/relativeOps.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_jidaa-ida-nisbiya_P1',
  P2: '3am_jidaa-ida-nisbiya_P2',
  P3: '3am_jidaa-ida-nisbiya_P3',
  P4: '3am_jidaa-ida-nisbiya_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Un nombre en LaTeX avec la virgule décimale : « -2{,}5 ». */
const tex = (x) => R.relTex(R.parseRel(x));
const f = (x) => (R.parseRel(x).n < 0n ? `(${tex(x)})` : tex(x));
const num = (s) => T(tex(s));
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });
const valTex = (list) => T(R.relTex(R.product(list)));
const prodTex = (list) => list.map(f).join(' \\times ');

/* ── 1. (−1) × a (deep-51, redessiné) : cinq nombres et leurs images ─────────────────────────────────────────────────────────── */
const MINUS_ONE = [
  { a: '-4', wrongs: ['-4', '-5', '-1'], why: 'جداء عدد في $-1$ هو معاكسه: معاكس $-4$ هو $4$ . ($-5$ هو $a - 1$ .)' },
  { a: '-1,5', wrongs: ['-1,5', '-2,5', '-1'], why: 'معاكس $-1{,}5$ هو $1{,}5$ .' },
  { a: '0', wrongs: ['-1', '1', '-0,5'], why: 'معاكس $0$ هو $0$ : $(-1) \\times 0 = 0$ .' },
  { a: '2,5', wrongs: ['2,5', '1,5', '-1'], why: 'معاكس $2{,}5$ هو $-2{,}5$ .' },
  { a: '6', wrongs: ['6', '5', '-1'], why: 'معاكس $6$ هو $-6$ .' },
];

/* ── 2. أحسب (ex-5, ex-14 style) ───────────────────────────────────────────────────────────────────────────────────────────── */
const COMPUTE = [
  { list: ['-2', '-5', '3'], wrongs: ['-30', '-4', '10'], why: 'عاملان سالبان (عدد زوجي): الجداء موجب، $2 \\times 5 \\times 3 = 30$ .' },
  { list: ['4', '-0,5', '-3', '-1'], wrongs: ['6', '-2', '-60'], why: 'ثلاثة عوامل سالبة (عدد فردي): الجداء سالب، $4 \\times 0{,}5 \\times 3 \\times 1 = 6$ ، إذن $-6$ .' },
  { list: ['-1,5', '2', '-2', '-10'], wrongs: ['60', '-6', '-600'], why: 'ثلاثة عوامل سالبة: سالب، $1{,}5 \\times 2 \\times 2 \\times 10 = 60$ ، إذن $-60$ .' },
];

/* ── 3. إشارة جداءات طويلة (now-11, redessiné) ──────────────────────────────────────────────────────────────────────────────── */
const SIGNS = [
  { label: 'جداء $40$ عاملًا كلّها تساوي $-3$ :', right: 'موجب', wrong: 'سالب', why: 'أربعون عاملًا سالبًا، وهو عدد زوجي: الجداء موجب.' },
  { label: 'جداء $7$ عوامل كلّها تساوي $-3$ :', right: 'سالب', wrong: 'موجب', why: 'سبعة عوامل سالبة، وهو عدد فردي: الجداء سالب.' },
  { label: '$2 \\times (-1) \\times 7 \\times (-4) \\times (-3) \\times 5 \\times (-6)$ :', right: 'موجب', wrong: 'سالب', why: 'أربعة عوامل سالبة (عدد زوجي): الجداء موجب.' },
];

/* ── 4. برنامجا حساب (deep-42, redessiné) ───────────────────────────────────────────────────────────────────────────────────── */
const PROGRAMS = [
  { label: 'البرنامج أ: نختار عددًا ونأخذ معاكسه ثم نطرح $5$ . النتيجة من أجل العدد $6{,}4$ :', right: '-11,4', wrongs: ['1,4', '-1,4', '11,4'], why: 'معاكس $6{,}4$ هو $-6{,}4$ ، ثم $-6{,}4 - 5 = -11{,}4$ .' },
  { label: 'البرنامج ب: نختار عددًا ونضربه في $(-1)$ ثم نضيف $(-5)$ . النتيجة من أجل العدد $-2{,}5$ :', right: '-2,5', wrongs: ['2,5', '-7,5', '7,5'], why: '$(-2{,}5) \\times (-1) = 2{,}5$ ثم $2{,}5 + (-5) = -2{,}5$ .' },
];

/* ── 5. deep-49, redessiné : les deux directions de la توزيع ────────────────────────────────────────────────────────────────── */
const TWO_WAYS = [
  { label: '$(-4) \\times (6 - 9)$', right: '12', wrongs: ['-12', '-60', '30'], why: 'بطريقتين: $(-4) \\times (-3) = 12$ ، أو $(-4) \\times 6 - (-4) \\times 9 = -24 + 36 = 12$ .' },
  { label: '$(-7 - 3) \\times (-0{,}5)$', right: '5', wrongs: ['-5', '2', '-2'], why: 'بطريقتين: $(-10) \\times (-0{,}5) = 5$ ، أو $(-7) \\times (-0{,}5) - 3 \\times (-0{,}5) = 3{,}5 + 1{,}5 = 5$ .' },
];

export const EXERCISES = [
  {
    id: 'deep-51', source: S('deep-51', 19, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'نضرب فاصلة كل نقطة من هذه النقاط في $(-1)$ فنحصل على فاصلة صورتها. اختر القيمة الصحيحة.',
    interaction: 'batch',
    question: { rows: MINUS_ONE.map((m, i) => row(T(`(-1) \\times ${f(m.a)}`), num(R.relText(R.opposite(m.a))), m.wrongs.map(num), i + 1, m.why)), explain: 'الضرب في $-1$ يعطي معاكس العدد.' },
    commonError: 'الخلط بين المعاكس وطرح 1، أو إبقاء العدد على حاله.',
  },
  {
    id: 'deep-51b', source: S('deep-51', 19, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'علّمنا على مستقيم مدرّج عددًا ثم معاكسه. موضع الواحد منهما بالنسبة إلى الآخر:',
    interaction: 'choice',
    question: { options: ['متناظران بالنسبة إلى الصفر', 'متطابقان', 'متناظران بالنسبة إلى العدد $1$', 'الثاني أكبر من الأول بواحد'], correct: 0, cols: 1, explain: 'العدد ومعاكسه على بُعد واحد من الصفر وعلى جهتين متقابلتين: $4$ و $-4$ ، $-1{,}5$ و $1{,}5$ .' },
  },
  {
    id: 'ex-5', source: S('ex-5', 14, 'ضرب الأعداد النسبية'), cites: [S('ex-14', 15, 'ضرب الأعداد النسبية')], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'احسب كل جداء: نعدّ العوامل السالبة ثم نضرب المسافات إلى الصفر.',
    interaction: 'batch',
    question: { rows: COMPUTE.map((c, i) => row(T(prodTex(c.list)), valTex(c.list), c.wrongs.map(num), i + 1, c.why)), explain: 'عدد العوامل السالبة يحدّد الإشارة، وجداء المسافات يحدّد القيمة.' },
    commonError: 'الاكتفاء بوجود عامل سالب للحكم بأنّ الجداء سالب.',
  },
  {
    id: 'now-11', source: S('now-11', 11, 'دوري الآن'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'ما إشارة كل جداء؟ لا تحسب القيمة.',
    interaction: 'batch',
    question: { rows: SIGNS.map((s, i) => row(s.label, s.right, [s.wrong], i, s.why)), explain: 'نعدّ العوامل السالبة: عدد زوجي يعطي جداءً موجبًا، وعدد فردي يعطي جداءً سالبًا.' },
    commonError: 'الحكم على الإشارة بأنّ العوامل السالبة أكثر من الموجبة.',
  },
  {
    id: 'ex-13', source: S('ex-13', 15, 'ضرب الأعداد النسبية'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'ما إشارة الجداء $(-1) \\times (-2) \\times (-3) \\times \\ldots \\times (-13)$ ؟ (الأعداد من $1$ إلى $13$ كلّها سالبة)',
    interaction: 'choice',
    question: { options: ['سالب، لأنّ عدد عوامله السالبة $13$ وهو فردي', 'موجب، لأنّ عدد عوامله السالبة $13$', 'سالب، لأنّ آخر عامل سالب', 'موجب، لأنّ العوامل الأولى سالبة'], correct: 0, cols: 1, explain: 'ثلاثة عشر عاملًا سالبًا (عدد فردي): الجداء سالب.' },
  },
  {
    id: 'deep-44', source: S('deep-44', 18, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'نعوّض كل عامل في جداء بمعاكسه. أيّ نتيجة تنتج؟',
    interaction: 'batch',
    question: {
      rows: [
        row('جداؤه $12$ وله ثلاثة عوامل: بعد التعويض يصبح', T('-12'), ['12', '0', '-3'].map(num), 0, 'ثلاث إشارات تنقلب: $(-1)^3 = -1$ ، فالجداء يصبح معاكسه $-12$ .'),
        row('جداؤه $30$ وله أربعة عوامل: بعد التعويض يصبح', T('30'), ['-30', '0', '3'].map(num), 1, 'أربع إشارات تنقلب: $(-1)^4 = 1$ ، فيبقى الجداء كما هو: $30$ .'),
      ],
      explain: 'قلب إشارة كل عامل يغيّر عدد العوامل السالبة، فننظر إلى زوجية عدد العوامل.',
    },
  },
  {
    id: 'deep-42', source: S('deep-42', 18, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'برنامجا حساب: انظر إلى كل برنامج وإلى النتيجة.',
    interaction: 'batch',
    question: { rows: PROGRAMS.map((p, i) => row(p.label, num(p.right), p.wrongs.map(num), i + 2, p.why)), explain: 'الضرب في $(-1)$ هو أخذ المعاكس، فالبرنامجان يعطيان النتيجة نفسها.' },
  },
  {
    id: 'deep-42b', source: S('deep-42', 18, 'أتعمّق'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'يعطي البرنامجان النتيجة نفسها من أجل أيّ عدد نختاره، لأنّ:',
    interaction: 'choice',
    question: { options: ['الضرب في $(-1)$ يعطي معاكس العدد، وهو ما يفعله البرنامج أ', 'الضرب في $(-1)$ يغيّر الإشارة السالبة فقط', 'الطرح $-5$ هو نفسه الإضافة $+5$', 'العدد المختار يكون دائمًا موجبًا'], correct: 0, cols: 1, explain: '$(-1) \\times a = -a$ لكلّ عدد $a$ ، سالبًا كان أو موجبًا.' },
  },
  {
    id: 'deep-39', source: S('deep-39', 18, 'أتعمّق'), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'عدد العوامل السالبة في جداء ضعف عدد العوامل الموجبة، ولا عامل معدوم. إشارة الجداء:',
    interaction: 'choice',
    question: { options: ['موجب', 'سالب', 'تتوقّف على عدد العوامل الموجبة', 'لا يمكن معرفتها'], correct: 0, cols: 2, explain: 'ضعف عدد هو عدد زوجي، وعدد العوامل السالبة الزوجي يعطي جداءً موجبًا.' },
    commonError: 'ظنّ أنّ العوامل السالبة الأكثر عددًا تعطي جداءً سالبًا.',
  },
  {
    id: 'deep-49', source: S('deep-49', 19, 'أتعمّق'), cites: [S('self-12', 17, 'أؤكّد تعلّماتي')], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'احسب كل عبارة بطريقتين: بحساب القوس أوّلًا أو بتوزيع الضرب.',
    interaction: 'batch',
    question: { rows: TWO_WAYS.map((t, i) => row(t.label, num(t.right), t.wrongs.map(num), i + 1, t.why)), explain: 'نتيجة الطريقتين واحدة.' },
    commonError: 'نسيان تغيير الإشارة عند توزيع الضرب على الطرح.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', tex: '(-2) \\times 5 \\times (-3) \\times (-1) \\times 4', options: ['سالب', 'موجب', 'لا يمكن معرفته', 'معدوم'], correct: 0, kind: 'sign' },
  { id: 'E2', tex: '(-1) \\times (-7{,}5)', options: ['7{,}5', '-7{,}5', '-8{,}5', '6{,}5'], correct: 0 },
  { id: 'E3', tex: '(-0{,}3)^2', options: ['0{,}09', '-0{,}09', '0{,}9', '-0{,}6'], correct: 0 },
  { id: 'E4', tex: '(-5) \\times 0{,}2 \\times (-4) \\times (-10)', options: ['-40', '40', '-4', '-400'], correct: 0 },
  { id: 'E5', tex: '(-6) \\times 17 + (-6) \\times 3', options: ['-120', '120', '-99', '-20'], correct: 0 },
];
