/**
 * Les exercices du درس « توزيع الضرب على الجمع والطرح » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source` l'élément du manuel dont il
 * est tiré et, dans `cites`, ceux qu'il remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève. Les valeurs sont CALCULÉES ici avec `packages/core/arithmetic/chainOps.js` (étage L4 :
 * `expand`, `expandLetter`, importé PAR CHEMIN) et RE-vérifiées par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que chaque distracteur est FAUX et reproduit son erreur nommée
 * (MISC-TAWZI-*). Destinations (docs/sources/2am/unit1/extraction.json) : act-6, ex-21, ex-23, ex-24, ex-25, ex-26, ex-27, ex-32, now-13, ex-35 → module 4 ; ex-28, deep-42 → مسألة 3 ; prep 9, 11 → « أستعدّ ».
 * Le signe × est toujours écrit (la seule notation courte est « 4x », nommée au module 3) ; toute valeur montrée est ≥ 0.
 */
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_tawzi-darb-jam-tarh_P1',
  P2: '2am_tawzi-darb-jam-tarh_P2',
  P3: '2am_tawzi-darb-jam-tarh_P3',
  P4: '2am_tawzi-darb-jam-tarh_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
/** « 4,5 × (12 − 2) » → LaTeX d'affichage (virgule décimale, × ÷ −). */
export const tex = (chain) => String(chain).replace(/(\d),(\d)/g, '$1{,}$2').replace(/×/g, '\\times').replace(/÷/g, '\\div').replace(/−/g, '-');
const T = (chain) => `$${tex(chain)}$`;
export const val = (chain) => C.numText(C.evaluateB(chain));
const vt = (chain) => tex(val(chain));
/** « 4 × 5,5 + 4 × 1,5 = 28 » : une égalité calculée. */
const eq = (chain) => `$${tex(chain)} = ${vt(chain)}$`;
/** k × (a ± b) = k × a ± k × b = valeur : la chaîne d'égalités d'une bonne réponse (calculée par chainOps.expand). */
export const ways = (k, a, b, op = '+') => { const e = C.expand(k, a, b, op); return `$${tex(e.factored)} = ${tex(e.split)} = ${tex(e.products)} = ${tex(e.value)}$`; };
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });

/* ── act-6 : les deux rectangles de largeur 4 cm. wrongs : « k × a + b » (FIRSTONLY) et le changement de signe (SIGNCHANGE) ── */
export const RECT = { k: 4, a: '5,5', b: '1,5' };
/* ── ex-21 / ex-23 : compléter, puis la feuille d'un camarade ── */
export const FILL_ROWS = [
  { k: 15, a: 20, b: 4, op: '+' },
  { k: 6, a: 9, b: 4, op: '−' },
];
export const CLASSMATE = [
  { shown: '5 × (12 + 3) = 5 × 12 − 5 × 3', k: 5, a: 12, b: 3, op: '+', miscs: 'SIGNCHANGE' },
  { shown: '9 × (8 − 2) = 9 × 8 − 2', k: 9, a: 8, b: 2, op: '−', miscs: 'FIRSTONLY' },
];
/* ── ex-24 / ex-25 : nombres de la nouvelle expression (nombres tous ≥ 0) ── */
export const EXPAND_ROW = { k: 12, a: 5, b: 8 };
export const FACTOR_ROWS = [
  { k: 7, a: 13, b: 17, op: '+', wrongProduct: '7 × 13 × 17', wrongSum: '(7 + 7) × (13 + 17)' },
  { k: '2,5', a: 18, b: 8, op: '−', wrongProduct: '2,5 × 18 × 8', wrongSum: '(2,5 − 2,5) × (18 − 8)' },
];
/* ── ex-26 : deux calculs, deux façons chacun ── */
export const TWO_WAYS = [
  { k: 9, a: 6, b: 4, op: '+', first: '9 × 6 + 4', other: '9 + 6 + 4' },
  { k: '4,5', a: 12, b: 2, op: '−', first: '4,5 × 12 − 2', other: '4,5 × 12 + 4,5 × 2' },
];
/* ── ex-32 / now-13 ② : le calcul mental ── */
export const MENTAL_ROWS = [
  { chain: '45 × 11', good: '45 × 10 + 45', bad1: '45 × 10 + 1', bad2: '45 × 10 − 45' },
  { chain: '28 × 99', good: '28 × 100 − 28', bad1: '28 × 100 − 1', bad2: '28 × 100 + 28' },
  { chain: '3,2 × 101', good: '3,2 × 100 + 3,2', bad1: '3,2 × 100 + 1', bad2: '3,2 × 100 − 3,2' },
  { chain: '64 × 9', good: '64 × 10 − 64', bad1: '64 × 10 − 9', bad2: '64 × 10 + 64' },
];
/* ── ex-27 : 9 rangs de 15 plants, 4 rangs perdus ── */
export const PLANTS = { rows: 9, each: 15, lost: 4 };
/* ── now-13 ① / ex-35 : F = 4 × (2a + 3), a = 0,5 ; mise en facteur d'une lettre ── */
export const LETTER = { k: 4, m: 2, c: 3, at: '0,5' };

export const EXERCISES = [
  {
    id: 'act-6', source: S('act-6', 9, 'أنشطة'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'مستطيلان عرضهما $4$ cm . طول الأول $5{,}5 + 1{,}5$ وطول الثاني $5{,}5 - 1{,}5$ . اختر لكلّ مستطيل كتابة مساحته بطريقتين وقيمتها:',
    interaction: 'batch',
    question: {
      rows: [
        row('مساحة الأول (cm²)', ways(RECT.k, RECT.a, RECT.b, '+'),
          [eq(`${RECT.k} × ${RECT.a} + ${RECT.b}`), eq(`${RECT.k} + ${RECT.a} × ${RECT.b}`)], 0,
          `الطول $5{,}5 + 1{,}5 = 7$ فالمساحة $4 \\times 7 = 28$ ؛ ونجدها أيضًا بجمع مساحتي القطعتين $4 \\times 5{,}5$ و $4 \\times 1{,}5$ .`),
        row('مساحة الثاني (cm²)', ways(RECT.k, RECT.a, RECT.b, '−'),
          [eq(`${RECT.k} × ${RECT.a} + ${RECT.k} × ${RECT.b}`), eq(`${RECT.k} × ${RECT.a} − ${RECT.b}`)], 1,
          `الطول $5{,}5 - 1{,}5 = 4$ فالمساحة $4 \\times 4 = 16$ ؛ وهي مساحة المستطيل الكبير ناقص مساحة القطعة المحذوفة.`),
      ],
      explain: 'المساحة جداء العرض في الطول، والطول مجموع أو فرق: نضرب العرض في كلّ قطعة.',
    },
    commonError: 'ضرب العرض في الحدّ الأول فقط ثم ضمّ الحدّ الثاني كما هو.',
  },
  {
    id: 'ex-21', source: S('ex-21', 15), cites: [S('ex-23', 15)], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'أتمم ثم احكم على كتابتي زميل:',
    interaction: 'batch',
    question: {
      rows: [
        row(`$${tex('15 × (20 + 4)')} = 15 \\times 20 + 15 \\times \\ldots$`, '$4$', ['$24$', '$15$'], 0, '$15 \\times (20 + 4) = 15 \\times 20 + 15 \\times 4 = 300 + 60 = 360$ .'),
        row(`$${tex('6 × 9 − 6 × 4')} = 6 \\times (\\ldots)$`, '$9 - 4$', ['$9 + 4$', '$9 \\times 4$'], 1, '$6 \\times 9 - 6 \\times 4 = 6 \\times (9 - 4) = 6 \\times 5 = 30$ .'),
        row(`كتب زميل: «$${tex(CLASSMATE[0].shown)}$»`, 'خاطئة: يجب أن يبقى الجمع', ['صحيحة', 'خاطئة: يجب ضرب العدد 3 فقط'], 2, '$5 \\times (12 + 3) = 5 \\times 12 + 5 \\times 3 = 60 + 15 = 75$ : الجمع يبقى جمعًا.'),
        row(`كتب زميل: «$${tex(CLASSMATE[1].shown)}$»`, 'خاطئة: يجب ضرب 2 في العدد 9 أيضًا', ['صحيحة', 'خاطئة: يجب أن يصير الطرح جمعًا'], 0, '$9 \\times (8 - 2) = 9 \\times 8 - 9 \\times 2 = 72 - 18 = 54$ : العدد 9 يضرب الحدّين.'),
      ],
      explain: 'العدد المضروب يضرب الحدّين معًا، والإشارة بينهما لا تتغيّر.',
    },
    commonError: 'ترك الحدّ الثاني دون ضرب، أو تغيير الإشارة بين الجداءين.',
  },
  {
    id: 'ex-24', source: S('ex-24', 15), cites: [S('ex-25', 15)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'انشر ثم احسب، وحلّل ثم احسب:',
    interaction: 'batch',
    question: {
      rows: [
        row(`انشر ثم احسب: ${T('12 × (5 + 8)')}`, ways(12, 5, 8, '+'),
          [eq('12 × 5 + 8'), eq('12 + 5 × 8')], 0, '$12 \\times (5 + 8) = 12 \\times 5 + 12 \\times 8 = 60 + 96 = 156$ ، وهو أيضًا $12 \\times 13 = 156$ .'),
        row(`حلّل ثم احسب: ${T('7 × 13 + 7 × 17')}`, `$7 \\times (13 + 17) = 7 \\times 30 = 210$`,
          [eq(FACTOR_ROWS[0].wrongProduct), eq(FACTOR_ROWS[0].wrongSum)], 1, 'العامل المشترك 7 يخرج، ونجمع $13 + 17 = 30$ ثم $7 \\times 30 = 210$ .'),
        row(`حلّل ثم احسب: ${T('2,5 × 18 − 2,5 × 8')}`, `$2{,}5 \\times (18 - 8) = 2{,}5 \\times 10 = 25$`,
          [eq(FACTOR_ROWS[1].wrongProduct), eq(FACTOR_ROWS[1].wrongSum)], 2, 'العامل المشترك $2{,}5$ يخرج، ونطرح $18 - 8 = 10$ ثم $2{,}5 \\times 10 = 25$ .'),
      ],
      explain: 'النشر: العدد يضرب كلّ حدّ. التحليل: العامل المشترك يخرج وتبقى الحدود داخل قوسين.',
    },
    commonError: 'ضرب العاملين معًا بدل إخراج العامل المشترك (FACTORMULT).',
  },
  {
    id: 'ex-26', source: S('ex-26', 15), cites: [S('self-7', 17, 'أؤكّد تعلّماتي')], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'احسب بطريقتين مختلفتين كلاًّ من العبارتين:',
    interaction: 'batch',
    question: {
      rows: [
        row(T('9 × (6 + 4)'), '$9 \\times 10 = 90$ و $9 \\times 6 + 9 \\times 4 = 54 + 36 = 90$', [eq('9 × 6 + 4'), eq('9 + 6 + 4')], 1,
          'بين القوسين $6 + 4 = 10$ فالجداء $90$ ؛ ونحصل على القيمة نفسها بنشر الجداء.'),
        row(T('4,5 × (12 − 2)'), '$4{,}5 \\times 10 = 45$ و $4{,}5 \\times 12 - 4{,}5 \\times 2 = 54 - 9 = 45$', [eq('4,5 × 12 − 2'), eq('4,5 × 12 + 4,5 × 2')], 2,
          'بين القوسين $12 - 2 = 10$ فالجداء $45$ ؛ والنشر يعطي $54 - 9 = 45$ .'),
      ],
      explain: 'لحساب جداء عدد في مجموع أو فرق: إمّا نحسب بين القوسين أوّلًا وإمّا ننشر.',
    },
    commonError: 'نشر الجداء بضرب الحدّ الأول فقط.',
  },
  {
    id: 'ex-32', source: S('ex-32', 16), cites: [S('now-13', 13, 'أُنجِز الآن'), S('ex-31', 16)], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'احسب ذهنيًا بتقريب أحد العددين من عدد مدوّر. اختر الكتابة الصحيحة وقيمتها:',
    interaction: 'batch',
    question: {
      rows: MENTAL_ROWS.map((r, i) => row(T(r.chain), eq(r.good), [eq(r.bad1), eq(r.bad2)], i, `${eq(r.good)} : نضرب في العدد المدوّر ثم نضيف أو ننقص جداءً واحدًا سهلًا.`)),
      explain: '$k \\times 11 = k \\times 10 + k$ و $k \\times 99 = k \\times 100 - k$ : العدد كلّه يضرب، لا الواحد وحده.',
    },
    commonError: 'ضرب العدد المدوّر ثم إضافة العدد 1 أو 9 دون ضربه.',
  },
  {
    id: 'ex-27', source: S('ex-27', 15), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'غرس فلّاح 9 صفوف في كلّ صفّ 15 شتلة، ثم أتلف البَرَد 4 صفوف.',
    interaction: 'batch',
    question: {
      rows: [
        row('اكتب بطريقتين عدد الشتلات الباقية', `$9 \\times 15 - 4 \\times 15 = (9 - 4) \\times 15 = 75$`, [eq('9 × 15 − 4'), eq('9 × 15 + 4 × 15')], 0,
          'نطرح من الشتلات كلّها شتلات الصفوف الأربعة التالفة، أو نعدّ الصفوف الباقية الخمسة: $5 \\times 15 = 75$ .'),
        row('كم شتلة أتلف البَرَد؟', '$60$', ['$4$', '$135$'], 1, '$4 \\times 15 = 60$ شتلة.'),
      ],
      explain: 'الصفوف التالفة تحمل 15 شتلة لكلّ صفّ: الجداء $4 \\times 15$ لا العدد 4.',
    },
    commonError: 'طرح عدد الصفوف التالفة من عدد الشتلات.',
  },
  {
    id: 'ex-35', source: S('ex-35', 16), cites: [S('now-13', 13, 'أُنجِز الآن'), S('self-10', 17, 'أؤكّد تعلّماتي'), S('self-9', 17, 'أؤكّد تعلّماتي'), S('ex-36', 16)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: `انشر $F = 4 \\times (2a + 3)$ ثم احسب قيمة $F$ من أجل $a = 0{,}5$ ، وحلّل:`,
    interaction: 'batch',
    question: {
      rows: [
        row('انشر $F$ (علمًا أنّ $4 \\times 2a = 8a$)', '$8a + 12$', ['$8a + 3$', '$2a + 12$'], 0, '$4 \\times (2a + 3) = 4 \\times 2a + 4 \\times 3 = 8a + 12$ .'),
        row('قيمة $F$ من أجل $a = 0{,}5$', '$16$', ['$7$', '$13$'], 1, '$4 \\times (2 \\times 0{,}5 + 3) = 4 \\times 4 = 16$ ؛ و $8 \\times 0{,}5 + 12 = 16$ .'),
        row('حلّل $6x + 4x$', '$(6 + 4)x = 10x$', ['$(6 \\times 4)x = 24x$', '$10$'], 2, 'العامل المشترك $x$ : $6x + 4x = (6 + 4)x = 10x$ .'),
        row('حلّل $9x - 2x$', '$(9 - 2)x = 7x$', ['$(9 + 2)x = 11x$', '$(9 \\times 2)x = 18x$'], 0, '$9x - 2x = (9 - 2)x = 7x$ .'),
      ],
      explain: 'الحرف يُعامل كعدد: الجداء $4 \\times 2a$ يُكتب $8a$ والتحليل يُخرج العامل المشترك.',
    },
    commonError: 'ترك الحدّ الثاني دون ضرب، أو ضرب المعاملين بدل جمعهما.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `chains` : la chaîne (ou l'expression) que chaque option écrit ou calcule ; `miscs` : l'erreur
 * nommée de chaque distracteur (MISC-TAWZI-*) ; `lp` : l'الكفاءة principale.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P1, kind: 'expand', prompt: 'نشر $7 \\times (10 + 3)$ هو:', options: ['$7 \\times 10 + 7 \\times 3$', '$7 \\times 10 + 3$', '$7 + 10 \\times 3$', '$7 \\times 10 \\times 3$'], correct: 0,
    chains: ['7 × 10 + 7 × 3', '7 × 10 + 3', '7 + 10 × 3', '7 × 10 × 3'], whole: '7 × (10 + 3)', miscs: { 1: 'MISC-TAWZI-FIRSTONLY', 2: 'MISC-TAWZI-ADDK', 3: 'MISC-TAWZI-FACTORMULT' } },
  { id: 'E2', lp: LP.P2, kind: 'expand', prompt: 'نشر $6 \\times (9 - 4)$ هو:', options: ['$6 \\times 9 - 6 \\times 4$', '$6 \\times 9 + 6 \\times 4$', '$6 \\times 9 - 4$', '$9 \\times 6 - 4 \\times 4$'], correct: 0,
    chains: ['6 × 9 − 6 × 4', '6 × 9 + 6 × 4', '6 × 9 − 4', '9 × 6 − 4 × 4'], whole: '6 × (9 − 4)', miscs: { 1: 'MISC-TAWZI-SIGNCHANGE', 2: 'MISC-TAWZI-FIRSTONLY', 3: null } },
  { id: 'E3', lp: LP.P3, kind: 'factor', prompt: 'قيمة $13 \\times 8 + 13 \\times 2$ هي:', options: ['$130$', '$208$', '$260$', '$106$'], correct: 0,
    chains: ['13 × (8 + 2)', '13 × 8 × 2', '(13 + 13) × (8 + 2)', '13 × 8 + 2'], whole: '13 × 8 + 13 × 2', miscs: { 1: 'MISC-TAWZI-FACTORMULT', 2: null, 3: 'MISC-TAWZI-FIRSTONLY' } },
  { id: 'E4', lp: LP.P4, kind: 'mental', prompt: 'قيمة $99 \\times 7$ ذهنيًا هي:', options: ['$693$', '$699$', '$707$', '$630$'], correct: 0,
    chains: ['100 × 7 − 1 × 7', '100 × 7 − 1', '100 × 7 + 1 × 7', '90 × 7'], whole: '99 × 7', miscs: { 1: 'MISC-TAWZI-FIRSTONLY', 2: 'MISC-TAWZI-SIGNCHANGE', 3: null } },
  { id: 'E5', lp: LP.P3, kind: 'letter', prompt: 'نشر $5 \\times (x - 4)$ هو:', options: ['$5x - 20$', '$5x - 4$', '$5x + 20$', '$x - 20$'], correct: 0,
    letterForms: [[5, -20], [5, -4], [5, 20], [1, -20]], miscs: { 1: 'MISC-TAWZI-NOTATION', 2: 'MISC-TAWZI-SIGNCHANGE', 3: null } },
];
