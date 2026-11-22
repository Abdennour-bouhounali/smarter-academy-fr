/**
 * Les exercices du درس « سلسلة عمليات تتضمّن أقواسا » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source` l'élément
 * du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève. Chaque valeur est CALCULÉE ici avec
 * `packages/core/arithmetic/chainOps.js` (étage L2, importé PAR CHEMIN) et RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que chaque distracteur
 * est FAUX et reproduit son erreur nommée (MISC-AQWAS-*).
 * Destinations (docs/sources/2am/unit1/extraction.json) : act-3 (q1–q3), act-4, ex-8, ex-10, ex-13 … ex-17, now-11 → module 4 ; act-3 q4 → مسألة 1 ; ict → مسألة 3 ; prep 8, 10 → « أستعدّ ».
 * Le signe × est toujours écrit ; aucun résultat intermédiaire négatif.
 */
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_silsila-bi-aqwas_P1',
  P2: '2am_silsila-bi-aqwas_P2',
  P3: '2am_silsila-bi-aqwas_P3',
  P4: '2am_silsila-bi-aqwas_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
/** « 4,5 + (2 × 8) » → LaTeX d'affichage (virgule décimale, × ÷ −). */
export const tex = (chain) => String(chain).replace(/(\d),(\d)/g, '$1{,}$2').replace(/×/g, '\\times').replace(/÷/g, '\\div').replace(/−/g, '-');
const T = (chain) => `$${tex(chain)}$`;
export const val = (chain) => C.numText(C.evaluateB(chain));
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });

/* ── act-3 (q1–q3) : avec et sans parenthèses, la paire inutile ─────────────────────────────────────────────── */
export const COMPARE = [
  { chain: '9 + 2 × 5', wrongs: ['55', '70'] },
  { chain: '(9 + 2) × 5', wrongs: ['19', '70'] },
  { chain: '9 + (2 × 5)', wrongs: ['55', '70'] },
  { chain: '60 − 24 ÷ 4', wrongs: ['9', '15'] },
  { chain: '(60 − 24) ÷ 4', wrongs: ['54', '15'] },
];
export const USELESS = { rightText: '$9 + (2 \\times 5)$', wrongs: ['$(9 + 2) \\times 5$', '$(60 - 24) \\div 4$'] };

/* ── ex-8 : calculer ───────────────────────────────────────────────────────────────────────────────────────── */
export const COMPUTE = [
  { chain: '50 − (17 + 9)', bad: '50 − 17 + 9' },
  { chain: '4 × (13 + 7)', bad: '4 × 13 + 7' },
  { chain: '70 − (6 + 4) × 3', bad: '(70 − 6 + 4) × 3' },
  { chain: '10 × (8,2 − 3,7)', bad: '10 × 8,2 − 3,7' },
  { chain: '24 ÷ (2 × 1,5 + 3 ÷ 3)', bad: '24 ÷ 2 × 1,5 + 3 ÷ 3' },
];

/* ── ex-10 : placer des parenthèses pour que l'égalité soit vraie ────────────────────────────────────────── */
export const PLACE = [
  { label: '$6 + 4 \\times 3 = 30$', target: '30', right: '(6 + 4) × 3', wrongs: ['6 + (4 × 3)'] },
  { label: '$20 - 8 + 2 = 10$', target: '10', right: '20 − (8 + 2)', wrongs: ['(20 − 8) + 2'] },
  { label: '$5 \\times 9 - 3 = 30$', target: '30', right: '5 × (9 − 3)', wrongs: ['(5 × 9) − 3'] },
  { label: '$2 \\times 3 + 4 \\times 5 = 70$', target: '70', right: '2 × (3 + 4) × 5', wrongs: ['2 × 3 + (4 × 5)', '(2 × 3 + 4) × 5'] },
];

/* ── ex-14, now-11 ② : des parenthèses imbriquées ─────────────────────────────────────────────────────────── */
export const NESTED = [
  { chain: '[25 − (14 − 6)] × 2', bad: '25 − (14 − 6) × 2' },
  { chain: '3 × [4 + (10 + 6) ÷ 8]', bad: '3 × 4 + (10 + 6) ÷ 8' },
  { chain: '60 − [20 − (2 + 3) × 2]', bad: '60 − 20 − (2 + 3) × 2' },
];

/* ── ex-15, ex-16, now-11 ① : la barre de fraction dans les deux sens ───────────────────────────────────────── */
export const BAR = [
  { shown: '$\\frac{28}{11 - 4}$', right: '28 ÷ (11 − 4)', wrongs: ['28 ÷ 11 + 4', '28 ÷ (11 + 4)'] },
  { shown: '$\\frac{17 + 7}{15 - 9}$', right: '(17 + 7) ÷ (15 − 9)', wrongs: ['17 + 7 ÷ 15 − 9', '17 + 7 ÷ (15 − 9)'] },
  { shown: '$\\frac{45}{9} - 3$', right: '45 ÷ 9 − 3', wrongs: ['45 ÷ (9 − 3)', '(45 ÷ 9) ÷ 3'] },
];
export const BAR_BACK = { chain: '8 ÷ (5 + 3)', right: '$\\frac{8}{5 + 3}$', wrongs: ['$\\frac{8}{5} + 3$', '$\\frac{8 + 5}{3}$'] };

/* ── act-4, ex-17 : un affichage faux sur la calculatrice ────────────────────────────────────────────────── */
export const DISPLAY = { typed: '18 + 6 ÷ 4', shown: '19,5', right: '( 18 + 6 ) ÷ 4', rightValue: '6', target: '(18 + 6) ÷ 4' };

/* ── ex-13 : traduire un énoncé par une expression ───────────────────────────────────────────────────────── */
export const MATCH = [
  { story: '12 أفواج، في كلّ فوج 5 بنات و 3 أولاد: كم تلميذًا؟', chain: '12 × (5 + 3)' },
  { story: '12 علبة في كلّ منها 5 أقلام، وبقيت 3 أقلام منفردة: كم قلمًا؟', chain: '12 × 5 + 3' },
  { story: '12 تلميذًا و 5 أساتذة، لكلّ منهم 3 كتب: كم كتابًا؟', chain: '(12 + 5) × 3' },
];

export const EXERCISES = [
  {
    id: 'act-3', source: S('act-3', 8, 'أنشطة'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'نقارن حسابات بأقواس وبدونها. احسب كلّ عبارة، ثم أجب عن السؤال الأخير.',
    interaction: 'batch',
    question: {
      rows: [
        ...COMPARE.map((c, i) => row(T(c.chain), T(val(c.chain)), c.wrongs.map(T), i, `${T(c.chain)} $= ${val(c.chain)}$ .`)),
        row('أيّ هذه العبارات قوساها غير ضروريين؟', USELESS.rightText, USELESS.wrongs, 2, 'في $9 + (2 \\times 5)$ الضرب يُحسب أوّلًا حتى دون القوسين، فلا يغيّران شيئًا؛ أمّا في الأخريين فتتغيّر النتيجة إذا حذفناهما.'),
      ],
      explain: 'القوسان يغيّران ترتيب الحساب أحيانًا، ولا يغيّرانه أحيانًا أخرى.',
    },
    commonError: 'القول إنّ كلّ قوسين يغيّران النتيجة (أو إنّهما لا يغيّرانها أبدًا).',
  },
  {
    id: 'ex-8', source: S('ex-8', 14), cites: [S('ex-12', 14)], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'احسب كلّ عبارة:',
    interaction: 'batch',
    question: {
      rows: COMPUTE.map((c, i) => row(T(c.chain), T(val(c.chain)), [T(val(c.bad))], i, `${T(c.chain)} $= ${val(c.chain)}$ ؛ نحسب ما بين القوسين أوّلًا.`)),
      explain: 'ما بين القوسين أوّلًا، ثم ما بقي بالأولوية.',
    },
    commonError: 'تجاهل القوسين وحساب السلسلة كأنّها بلا أقواس.',
  },
  {
    id: 'ex-10', source: S('ex-10', 14), cites: [S('ex-11', 14), S('deep-40', 18, 'أتعمّق'), S('deep-41', 18, 'أتعمّق'), S('deep-53', 19, 'أتعمّق')], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'ضع قوسين في الطرف الأيسر لتصحّ المساواة:',
    interaction: 'batch',
    question: {
      rows: PLACE.map((p, i) => row(p.label, T(p.right), p.wrongs.map(T), i, `${T(p.right)} $= ${p.target}$ ، أمّا الاختيارات الأخرى فلا تعطي $${p.target}$ .`)),
      explain: 'نجرّب موضع القوسين ونحسب بالقواعد.',
    },
    commonError: 'وضع القوسين حول ما يُحسب أوّلًا أصلًا فلا تتغيّر النتيجة.',
  },
  {
    id: 'ex-14', source: S('ex-14', 14), cites: [S('now-11', 11, 'دوري الآن'), S('self-3', 17, 'أؤكّد تعلّماتي')], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'احسب كلّ عبارة، بادئًا بأعمق الأقواس:',
    interaction: 'batch',
    question: {
      rows: NESTED.map((c, i) => row(T(c.chain), T(val(c.chain)), [T(val(c.bad))], i, `${T(c.chain)} $= ${val(c.chain)}$ .`)),
      explain: 'من الأقواس الداخلية نحو الخارجية.',
    },
    commonError: 'حساب القوس الخارجي أو ما بين المعقوفين قبل الداخلي.',
  },
  {
    id: 'ex-15', source: S('ex-15', 14), cites: [S('ex-16', 15), S('now-11', 11, 'دوري الآن'), S('deep-50', 19, 'أتعمّق')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اكتب كلّ كسر دون خطّ الكسر، ثم اكتب الكتابة الأخيرة بخطّ الكسر:',
    interaction: 'batch',
    question: {
      rows: [
        ...BAR.map((b, i) => row(b.shown, T(b.right), b.wrongs.map(T), i, `${T(b.right)} $= ${val(b.right)}$ .`)),
        row(`اكتب ${T(BAR_BACK.chain)} بخطّ الكسر`, BAR_BACK.right, BAR_BACK.wrongs, 1, `القوسان حول $5 + 3$ يصيران المقام: ${BAR_BACK.right} $= 1$ .`),
      ],
      explain: 'خطّ الكسر يجمع البسط ويجمع المقام: قوسان لكلّ منهما قبل أن نحذفه.',
    },
    commonError: 'نسيان القوسين حول بسط أو مقام فيه عمليتان.',
  },
  {
    id: 'ex-17', source: S('ex-17', 15), cites: [S('act-4', 9, 'أنشطة')], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'لحساب $\\frac{18 + 6}{4}$ ضغطت رانيا الأزرار $18 + 6 \\div 4 =$ فظهر $19{,}5$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('ما الخطأ؟', 'نسيت القوسين حول $18 + 6$ فقسمت $6$ وحده على $4$', ['ضغطت زرّ القسمة بدل الضرب', 'الآلة لا تحسب الكسور'], 0, 'الآلة قسمت $6 \\div 4 = 1{,}5$ ثم جمعت $18 + 1{,}5 = 19{,}5$ ؛ البسط كلّه يجب أن يُحسب قبل القسمة.'),
        row('ما الأزرار الصحيحة؟', '$( 18 + 6 ) \\div 4 =$', ['$18 + ( 6 \\div 4 ) =$', '$18 + 6 \\div 4 =$'], 1, 'نفتح قوسًا قبل $18$ ونغلقه بعد $6$ ثم نقسم على $4$ .'),
        row('ما القيمة الصحيحة؟', '$6$', ['$19{,}5$', '$4{,}5$'], 2, '$(18 + 6) \\div 4 = 24 \\div 4 = 6$ .'),
      ],
      explain: 'نكتب على الآلة كلّ قوس نحتاجه.',
    },
    commonError: 'الظنّ أنّ الآلة تفهم خطّ الكسر من تلقاء نفسها.',
  },
  {
    id: 'ex-13', source: S('ex-13', 14), cites: [S('ex-29', 16), S('ex-30', 16), S('deep-43', 18, 'أتعمّق')], learningPointId: LP.P1, difficulty: 'difficile',
    statement: 'اربط كلّ مسألة بالعبارة التي تعطي جوابها:',
    interaction: 'batch',
    question: {
      rows: MATCH.map((m, i) => row(m.story, T(m.chain), MATCH.filter((x) => x !== m).map((x) => T(x.chain)), i, `${T(m.chain)} $= ${val(m.chain)}$ ؛ ${i === 0 ? 'البنات والأولاد معًا في كلّ فوج' : i === 1 ? 'الأقلام المنفردة تُضاف بعد الضرب' : 'التلاميذ والأساتذة معًا ثم لكلّ منهم 3 كتب'}.`)),
      explain: 'القوسان يضمّان ما يُجمع قبل أن يدخل في الضرب.',
    },
    commonError: 'اختيار العبارة بحجم الأعداد لا بمعنى المسألة.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `exprs` : l'expression de chaque option (texte brut, plus facile
 * à relire que du LaTeX) ; `miscs` : l'erreur nommée de chaque distracteur (MISC-AQWAS-*) ; `lp` : l'الكفاءة principale.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P1, source: null, prompt: '$5 \\times (14 - 8)$ يساوي:', options: ['$30$', '$62$', '$6$', '$70$'], correct: 0, exprs: ['30', '5 × 14 − 8', '14 − 8', '5 × 14'], truth: '5 × (14 − 8)', miscs: { 1: 'MISC-AQWAS-IGNORED' } },
  { id: 'E2', lp: LP.P2, source: null, prompt: '$40 - [15 - (2 + 4)]$ يساوي:', options: ['$31$', '$19$', '$27$', '$23$'], correct: 0, exprs: ['31', '40 − 15 − (2 + 4)', '40 − 15 − 2 + 4', '40 − [15 − 2 + 4]'], truth: '40 − [15 − (2 + 4)]', miscs: { 1: 'MISC-AQWAS-DROPOUTER', 2: 'MISC-AQWAS-IGNORED', 3: 'MISC-AQWAS-DROPOUTER' } },
  { id: 'E3', lp: LP.P3, source: null, prompt: '$\\dfrac{25 + 11}{10 - 6}$ يساوي:', options: ['$9$', '$20{,}1$', '$3{,}6$', '$30$'], correct: 0, exprs: ['9', '25 + 11 ÷ 10 − 6', '(25 + 11) ÷ 10', '25 + 11 − 6'], truth: '(25 + 11) ÷ (10 − 6)', miscs: { 1: 'MISC-AQWAS-BARSPLIT', 2: 'MISC-AQWAS-BARSPLIT', 3: 'MISC-AQWAS-BARSPLIT' } },
  { id: 'E4', lp: LP.P4, source: null, prompt: 'لحساب $\\dfrac{60}{4 + 8}$ نضغط:', options: ['$60 \\div ( 4 + 8 ) =$', '$60 \\div 4 + 8 =$', '$( 60 \\div 4 ) + 8 =$', '$60 \\div 4 \\times 8 =$'], correct: 0, exprs: ['60 ÷ (4 + 8)', '60 ÷ 4 + 8', '(60 ÷ 4) + 8', '60 ÷ 4 × 8'], truth: '60 ÷ (4 + 8)', miscs: { 1: 'MISC-AQWAS-CALCNOBRACKET', 2: 'MISC-AQWAS-CALCNOBRACKET', 3: 'MISC-AQWAS-CALCNOBRACKET' } },
  { id: 'E5', lp: LP.P1, source: null, prompt: 'أيّ القوسين التاليين غير ضروريين؟', options: ['$7 + (3 \\times 5)$', '$(7 + 3) \\times 5$', '$7 \\times (3 + 5)$', '$(7 - 3) \\div 2$'], correct: 0, exprs: ['7 + (3 × 5)', '(7 + 3) × 5', '7 × (3 + 5)', '(7 − 3) ÷ 2'], truth: null, miscs: { 1: 'MISC-AQWAS-ALLNEEDED', 2: 'MISC-AQWAS-ALLNEEDED', 3: 'MISC-AQWAS-ALLNEEDED' } },
];
