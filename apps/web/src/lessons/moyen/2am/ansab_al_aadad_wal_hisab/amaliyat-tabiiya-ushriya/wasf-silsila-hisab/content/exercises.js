/**
 * Les exercices du درس « وصف سلسلة حسابات » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source` l'élément du manuel dont il
 * est tiré et, dans `cites`, ceux qu'il remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève. Les valeurs ET les PHRASES sont CALCULÉES ici avec
 * `packages/core/arithmetic/chainOps.js` (étage L3 : `describe`, `chainName`, `staplesOf`… importé PAR CHEMIN) et RE-vérifiées par ./content.test.js avec un autre code (BigInt, un
 * analyseur de racine indépendant), qui contrôle aussi que chaque distracteur est FAUX et reproduit son erreur nommée (MISC-WASF-*).
 * Destinations (docs/sources/2am/unit1/extraction.json) : act-5, ex-9, ex-18, ex-19, ex-20, self-5 → module 4 ; deep-47, deep-49 → مسألة 1 et 3 ; prep 1, 2 → « أستعدّ ».
 * Le signe × est toujours écrit ; toute chaîne montrée vaut un nombre ≥ 0 (le « 2,5 − 2 × 7 » de self-5 n'est pas utilisé).
 */
import * as C from '@smarter-academy/core/arithmetic/chainOps.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_wasf-silsila-hisab_P1',
  P2: '2am_wasf-silsila-hisab_P2',
  P3: '2am_wasf-silsila-hisab_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
/** « 4,5 + (2 × 8) » → LaTeX d'affichage (virgule décimale, × ÷ −). */
export const tex = (chain) => String(chain).replace(/(\d),(\d)/g, '$1{,}$2').replace(/×/g, '\\times').replace(/÷/g, '\\div').replace(/−/g, '-');
const T = (chain) => `$${tex(chain)}$`;
export const val = (chain) => C.numText(C.evaluateB(chain));
/** La phrase qui décrit une chaîne (chainOps.describe) et son nom. */
export const desc = (chain) => C.describe(chain);
export const nameOf = (chain) => C.chainName(chain);
/** La valeur écrite dans une formule (virgule décimale protégée). */
const vt = (chain) => tex(val(chain));
const eq = (chain) => `$${tex(chain)} = ${vt(chain)}$`;
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });

/* ── act-5 : le nom et la valeur de quatre chaînes. `bad` : la chaîne lue sans ses parenthèses (ou de gauche à droite) ; le mauvais nom est celui de la PREMIÈRE opération faite. ── */
export const NAME_ROWS = [
  { chain: '(36 + 4) ÷ 8', bad: '36 + 4 ÷ 8' },
  { chain: '30 − (9 + 6)', bad: '30 − 9 + 6' },
  { chain: '14 + 3 × 6', bad: '(14 + 3) × 6' },
  { chain: '5 × (16 − 7)', bad: '5 × 16 − 7' },
];
/** Le nom de la première opération FAITE : la première agrafe du niveau le plus bas (ses deux blocs sont des nombres), la plus à gauche. */
export const firstDoneName = (chain) => C.CHAIN_NAMES[C.staplesOf(chain).filter((s) => s.level === 1).sort((a, b) => a.tok - b.tok)[0].o];

/* ── ex-18 : écrire à partir d'une phrase, puis calculer. `wrongs` : les chaînes d'un autre découpage / d'une écriture sans parenthèses. ── */
export const WRITE_ROWS = [
  { chain: '9 + 4 × 7', wrongs: ['(9 + 4) × 7', '9 × 4 + 7'] },
  { chain: '(30 − 6) ÷ 4', wrongs: ['30 − 6 ÷ 4', '30 ÷ (6 − 4)'] },
  { chain: '12 × (15 − 9)', wrongs: ['12 × 15 − 9', '12 × 9 − 15'] },
  { chain: '40 − (26 − 11)', wrongs: ['40 − 26 − 11', '(40 − 26) × 11'] },
];

/* ── ex-19 : décrire par une phrase. `alts` : deux autres chaînes dont la phrase est une mauvaise réponse (profondeur ≤ 2 sauf l'arbre de ex-9). ── */
export const DESCRIBE_ROWS = [
  { chain: '8 × (3 + 6)', alts: ['8 × 3 + 6', '8 + 3 × 6'] },
  { chain: '50 − (12 + 8)', alts: ['50 − 12 + 8', '50 ÷ (12 − 8)'] },
  { chain: '6 + 4 × 9', alts: ['(6 + 4) × 9', '6 × 4 + 9'] },
  { chain: '63 − 28 ÷ 7', alts: ['(63 − 28) ÷ 7', '63 − 28 + 7'] },
  { chain: '4 × (1,5 + 2,5)', alts: ['4 × 1,5 + 2,5', '(4 + 1,5) × 2,5'] },
  { chain: '7 × 2 + 3 × 5', alts: ['(7 + 2) × (3 + 5)', '(7 + 2) − (3 + 5)'] },
  { chain: '24 ÷ 4 × 3', alts: ['24 ÷ (4 × 3)', '24 ÷ 4 + 3'] },
];

/* ── ex-20 : a = 24, b = 6, c = 2. `read` : la lecture fautive de l'ordre (sans parenthèses / sans priorité) ; le mauvais nom est celui de la première opération faite. ── */
export const ABC = { a: '24', b: '6', c: '2' };
export const ABC_ROWS = [
  { shown: '$a + b \\div c$', chain: '24 + 6 ÷ 2', read: '(24 + 6) ÷ 2' },
  { shown: '$(a + b) \\div c$', chain: '(24 + 6) ÷ 2', read: '24 + 6 ÷ 2' },
  { shown: '$a \\div (b + c)$', chain: '24 ÷ (6 + 2)', read: '24 ÷ 6 + 2' },
];

/* ── ex-9 : l'arbre de (15 − 6) × 4 + 2 ; la dernière opération est la racine. ── */
export const TREE = { chain: '(15 − 6) × 4 + 2', bad: '(15 − 6) × (4 + 2)', badSentence: '(15 − 6) × 4 − 2', wrongNames: ['فرق', 'جداء'] };

/* ── self-5 : apparier quatre chaînes à leur nom ── */
export const MATCH_ROWS = ['9 + (15 − 4)', '(45 − 15) ÷ 3', '(14 + 6) × (12 − 2)', '26 − 2 × 7'];
const ALL_NAMES = [C.CHAIN_NAMES['+'], C.CHAIN_NAMES['−'], C.CHAIN_NAMES['×'], C.CHAIN_NAMES['÷']];

export const EXERCISES = [
  {
    id: 'act-5', source: S('act-5', 9, 'أنشطة'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'لكلّ سلسلة اختر اسمها (آخر عملية تُنجز فيها) وقيمتها.',
    interaction: 'batch',
    question: {
      rows: NAME_ROWS.map((r, i) => row(T(r.chain), `اسمها ${nameOf(r.chain)} وقيمتها ${val(r.chain)}`,
        [`اسمها ${firstDoneName(r.chain)} وقيمتها ${val(r.chain)}`, `اسمها ${nameOf(r.chain)} وقيمتها ${val(r.bad)}`], i,
        `آخر عملية تُنجز في ${T(r.chain)} هي ${C.lastOperation(r.chain)} ، فهي ${nameOf(r.chain)} ، وقيمتها $${vt(r.chain)}$ .`)),
      explain: 'آخر عملية تُنجز تسمّي السلسلة، لا أوّل عملية نُجزها ولا أوّل ما نقرؤه.',
    },
    commonError: 'تسمية السلسلة بأوّل عملية تُنجز فيها.',
  },
  {
    id: 'ex-18', source: S('ex-18', 15), cites: [S('deep-48', 19, 'أتعمّق')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اختر لكلّ جملة السلسلة التي تكتبها وقيمتها:',
    interaction: 'batch',
    question: {
      rows: WRITE_ROWS.map((r, i) => row(desc(r.chain), eq(r.chain), r.wrongs.map(eq), i,
        `${eq(r.chain)} ؛ نبدأ بآخر عملية ونضع بين قوسين كلّ حدّ (عامل) يُحسب قبلها.`)),
      explain: 'من الجملة إلى السلسلة: آخر عملية أوّلًا، ثم القوسان اللازمان.',
    },
    commonError: 'كتابة السلسلة دون القوسين اللازمين فتتغيّر آخر عملية.',
  },
  {
    id: 'ex-19', source: S('ex-19', 15), cites: [S('ex-9', 14)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'عيّن آخر عملية في كلّ سلسلة ثم اختر الجملة التي تصفها:',
    interaction: 'batch',
    question: {
      rows: DESCRIBE_ROWS.map((r, i) => row(T(r.chain), desc(r.chain), r.alts.map(desc), i,
        `آخر عملية في ${T(r.chain)} هي ${C.lastOperation(r.chain)} ؛ ${desc(r.chain)} (قيمتها $${vt(r.chain)}$ ).`)),
      explain: 'الجملة تبدأ باسم السلسلة، ثم تذكر حدّيها أو عامليها وتصف كلاًّ منهما.',
    },
    commonError: 'وصف السلسلة بحدّين غير حدّيها الحقيقيين.',
  },
  {
    id: 'ex-20', source: S('ex-20', 15), learningPointId: LP.P1, difficulty: 'moyen',
    statement: `نعطي $a = ${ABC.a}$ و $b = ${ABC.b}$ و $c = ${ABC.c}$ . لكلّ عبارة اختر قيمتها واسمها:`,
    interaction: 'batch',
    question: {
      rows: ABC_ROWS.map((r, i) => row(r.shown, `قيمتها ${val(r.chain)} وهي ${nameOf(r.chain)}`,
        [`قيمتها ${val(r.chain)} وهي ${firstDoneName(r.chain)}`, `قيمتها ${val(r.read)} وهي ${nameOf(r.chain)}`], i,
        `${eq(r.chain)} ، وآخر عملية تُنجز فيها تجعلها ${nameOf(r.chain)} .`)),
      explain: 'شريط الكسر والأقواس وأولوية العمليات هي التي تقرّر آخر عملية.',
    },
    commonError: 'قراءة العبارة دون احترام الأقواس أو الأولوية.',
  },
  {
    id: 'ex-9', source: S('ex-9', 14), learningPointId: LP.P1, difficulty: 'moyen',
    statement: `نرسم شجرة حساب السلسلة ${T(TREE.chain)} : في أسفلها العملية التي تُنجز في الأخير.`,
    interaction: 'batch',
    question: {
      rows: [
        row('ما قيمة السلسلة؟', `$${vt(TREE.chain)}$`, [`$${vt(TREE.bad)}$`, `$${vt('(15 − 6) × 4')}$`], 0, `${eq(TREE.chain)} .`),
        row('ما اسمها؟', nameOf(TREE.chain), TREE.wrongNames, 1, 'العملية الأخيرة في أسفل الشجرة هي الجمع، فالسلسلة مجموع.'),
        row('أيّ جملة تصفها؟', desc(TREE.chain), [desc(TREE.bad), desc(TREE.badSentence)], 2, `${desc(TREE.chain)} : نبدأ بالجمع الأخير ثم نصف حدّه الأول.`),
      ],
      explain: 'الشجرة تنتهي بآخر عملية، وهي التي تسمّي السلسلة.',
    },
    commonError: 'تسمية السلسلة بعملية من أعلى الشجرة (أي أُنجزت أوّلًا).',
  },
  {
    id: 'self-5', source: S('self-5', 17, 'أؤكّد تعلّماتي'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'اربط كلّ سلسلة باسمها:',
    interaction: 'batch',
    question: {
      rows: MATCH_ROWS.map((c, i) => row(T(c), nameOf(c), ALL_NAMES.filter((n) => n !== nameOf(c)), i,
        `آخر عملية في ${T(c)} هي ${C.lastOperation(c)} ، فهي ${nameOf(c)} ، وقيمتها $${vt(c)}$ .`)),
      explain: 'ننظر إلى آخر عملية تُنجز، لا إلى ما نراه أوّلًا.',
    },
    commonError: 'الخلط بين أوّل عملية تُنجز وآخر عملية تُنجز.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `chain` : la chaîne de l'énoncé (E1–E3) ou `sentence` : la phrase (E4, E5) ; `chains` : la chaîne que
 * chaque option décrit, écrit ou calcule (E3–E5) ; `miscs` : l'erreur nommée de chaque distracteur (MISC-WASF-*) ; `lp` : l'الكفاءة principale.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P1, source: null, kind: 'name', chain: '12 + 6 × 3', prompt: '$12 + 6 \\times 3$ عبارة عن:', options: ['مجموع', 'جداء', 'فرق', 'حاصل قسمة'], correct: 0, miscs: { 1: 'MISC-WASF-FIRSTOP' } },
  { id: 'E2', lp: LP.P1, source: null, kind: 'name', chain: '(12 + 6) × 3', prompt: '$(12 + 6) \\times 3$ عبارة عن:', options: ['جداء', 'مجموع', 'فرق', 'حاصل قسمة'], correct: 0, miscs: { 1: 'MISC-WASF-FIRSTWRITTEN' } },
  {
    id: 'E3', lp: LP.P2, source: null, kind: 'describe', chain: '45 − (10 + 5)', prompt: 'تُوصف السلسلة $45 - (10 + 5)$ بالجملة:',
    options: ['فرق العدد 45 ومجموع العددين 10 و 5', 'مجموع العدد 45 ومجموع العددين 10 و 5', 'فرق فرق العددين 45 و 10 والعدد 5', 'مجموع فرق العددين 45 و 10 والعدد 5'], correct: 0,
    chains: ['45 − (10 + 5)', '45 + (10 + 5)', '45 − 10 − 5', '45 − 10 + 5'],
    miscs: { 1: 'MISC-WASF-FIRSTWRITTEN', 2: 'MISC-WASF-PIECES', 3: 'MISC-WASF-NOBRACKET' },
  },
  {
    id: 'E4', lp: LP.P3, source: null, kind: 'write', sentence: 'حاصل قسمة مجموع العددين 20 و 8 على 7', prompt: 'السلسلة «حاصل قسمة مجموع العددين 20 و 8 على 7» تُكتب:',
    options: ['$(20 + 8) \\div 7$', '$20 + 8 \\div 7$', '$7 \\div (20 + 8)$', '$20 \\div 7 + 8$'], correct: 0,
    chains: ['(20 + 8) ÷ 7', '20 + 8 ÷ 7', '7 ÷ (20 + 8)', '20 ÷ 7 + 8'],
    miscs: { 1: 'MISC-WASF-NOBRACKET', 2: 'MISC-WASF-ORDERDIFF', 3: 'MISC-WASF-PIECES' },
  },
  {
    id: 'E5', lp: LP.P3, source: null, kind: 'compute', sentence: 'جداء العدد 5 وفرق العددين 11 و 4', prompt: 'السلسلة «جداء العدد 5 وفرق العددين 11 و 4» تساوي:',
    options: ['$35$', '$51$', '$75$', '$7$'], correct: 0,
    chains: ['5 × (11 − 4)', '5 × 11 − 4', '5 × (11 + 4)', '11 − 4'],
    miscs: { 1: 'MISC-WASF-NOBRACKET', 2: 'MISC-WASF-PIECES', 3: 'MISC-WASF-FIRSTOP' },
  },
];
