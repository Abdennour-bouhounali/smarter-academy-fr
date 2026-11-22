/**
 * Les exercices du درس « حصر عدد عشري موجب » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte
 * en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans
 * numéro n'est jamais montré à l'élève. Les nombres sont des DONNÉES (chaînes décimales exactes) ; ./content.test.js lit chaque option ÉCRITE (LaTeX) et la
 * recalcule avec un autre code (rationnels BigInt, arrondi demi vers le haut écrit à la main) : une clé « de l'arrondi » est équivalente à l'arrondi sur une
 * grille fine, chaque distracteur est faux pour au moins un nombre qui a ce mot, et un encadrement d'un nombre donné est vrai pour lui et serré.
 * Destinations (docs/sources/3am/unit5/extraction.json) : act-3 (1, 2), now-77-1, know-3, prep 14, ex-21, ex-28, ex-20/22/25 → module 4 ; self-5 → le إختبار
 * أولي (module 8) ; prep 13 et 15 → module 0 ; ex-62 est cité par la banque.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_hasr-adad-ushri_P1',
  P2: '3am_hasr-adad-ushri_P2',
  P3: '3am_hasr-adad-ushri_P3',
  P4: '3am_hasr-adad-ushri_P4',
};

const S = (id, page, n) => src(id, page, 'أوظّف تعلّماتي', n);
const T = (s) => `$${s}$`;
/** Un décimal ou une écriture déjà en LaTeX : « 7,48 » → « 7{,}48 ». */
export const dec = (s) => String(s).replace(/(\d),(\d)/g, '$1{,}$2');
const RELS = { '<': '<', '<=': '\\leq ' };
/** « lo REL x REL hi » écrit en LaTeX ; `x` est déjà du LaTeX. */
export const br = (lo, r1, x, r2, hi) => T(`${dec(lo)}${RELS[r1]}${x}${RELS[r2]}${dec(hi)}`);
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });
const YN = ['نعم', 'لا'];
const canRow = (v, val, key, correction) => ({ label: T(`${v}=${dec(val)}`), options: YN, correct: key ? 0 : 1, correction });

/* ── E1 : act-3 (1) — un périmètre / une longueur dont on connaît le MOUDAWWAR ───────────────────────────────── */
export const E1 = {
  v: 'L', r: '2,4', rank: 1,
  cans: [
    { val: '2,35', key: true, why: 'مدوّر $2{,}35$ إلى $0{,}1$ هو $2{,}4$ (الرقم الذي يلي هو $5$ فنرفع).' },
    { val: '2,449', key: true, why: 'الرقم الذي يلي الجزء من عشرة هو $4$ فلا نرفع: المدوّر $2{,}4$ .' },
    { val: '2,45', key: false, why: 'الرقم الذي يلي هو $5$ فنرفع: المدوّر $2{,}5$ وليس $2{,}4$ .' },
    { val: '2,3', key: false, why: '$2{,}3$ مدوّر نفسه، ومدوّره $2{,}3$ لا $2{,}4$ .' },
  ],
  key: { lo: '2,35', r1: '<=', hi: '2,45', r2: '<' },
  wrongs: [{ lo: '2,4', r1: '<=', hi: '2,5', r2: '<' }, { lo: '2,35', r1: '<', hi: '2,45', r2: '<=' }, { lo: '2,3', r1: '<=', hi: '2,4', r2: '<' }],
  why: 'نطرح نصف الرتبة $0{,}05$ من $2{,}4$ ونضيفه إليه: $2{,}35\\le L<2{,}45$ ، والطرف الأيمن غير مشمول.',
};
/* ── E2 : act-3 (2) — un quotient lu sur la calculatrice, quatre rangs ─────────────────────────────────────── */
export const E2 = {
  num: 389, den: 47, screen: '8.276595745',
  rows: [
    { rank: 0, key: ['8', '9'], wrongs: [['9', '10'], ['7', '8'], ['8', '8,2']] },
    { rank: 1, key: ['8,2', '8,3'], wrongs: [['8,3', '8,4'], ['8,1', '8,2'], ['8,2', '8,27']] },
    { rank: 2, key: ['8,27', '8,28'], wrongs: [['8,28', '8,29'], ['8,26', '8,27'], ['8,27', '8,276']] },
    { rank: 3, key: ['8,276', '8,277'], wrongs: [['8,277', '8,278'], ['8,275', '8,276'], ['8,276', '8,2765']] },
  ],
};
const RANK_NAME = { 0: 'إلى الوحدة', 1: 'إلى $0{,}1$', 2: 'إلى $0{,}01$', 3: 'إلى $0{,}001$' };
/* ── E3 : now-77-1, know-3 — 5,07 au centième ─────────────────────────────────────────────────────────────────── */
export const E3 = {
  v: 'b', r: '5,07', rank: 2,
  cans: [
    { val: '5,074', key: true, why: 'الرقم الذي يلي الجزء من مئة هو $4$ فلا نرفع: المدوّر $5{,}07$ .' },
    { val: '5,065', key: true, why: 'الرقم الذي يلي هو $5$ فنرفع: مدوّر $5{,}065$ هو $5{,}07$ ، فالطرف الأيسر مشمول.' },
    { val: '5,075', key: false, why: 'الرقم الذي يلي هو $5$ فنرفع: المدوّر $5{,}08$ ، فالطرف الأيمن غير مشمول.' },
    { val: '5,0649', key: false, why: 'الرقم الذي يلي الجزء من مئة هو $4$ فلا نرفع: المدوّر $5{,}06$ .' },
  ],
  key: { lo: '5,065', r1: '<=', hi: '5,075', r2: '<' },
  wrongs: [{ lo: '5,07', r1: '<=', hi: '5,08', r2: '<' }, { lo: '5,065', r1: '<', hi: '5,075', r2: '<=' }, { lo: '5,06', r1: '<=', hi: '5,07', r2: '<' }],
  why: 'نصف الرتبة $0{,}005$ : $5{,}065\\le b<5{,}075$ .',
};
/* ── E4 : self-5, prep 14 — un quotient entier / décimal ───────────────────────────────────────────────────── */
export const E4 = {
  num: 151, den: 12, screen: '12.58333333',
  unit: { key: '13', wrongs: ['12', '12,6', '14'] },
  tenth: { key: '12,6', wrongs: ['12,5', '12,58', '13'] },
  bracket: { key: ['12', '13'], wrongs: [['13', '14'], ['11', '12'], ['12', '12,5']] },
};
/* ── E5 : ex-21 — π et le périmètre d'un cercle ────────────────────────────────────────────────────────────── */
export const E5 = {
  radius: 4, key: ['25,12', '25,2'], wrongs: [['12,56', '12,6'], ['31,4', '31,5'], ['3,14', '3,15']],
};
/* ── E6 : ex-28 — h au centième, puis le volume d'une boîte 4 × 5 × h ─────────────────────────────────────────── */
export const E6 = {
  r: '6,32', rank: 2, base: 20,
  h: { key: { lo: '6,315', r1: '<=', hi: '6,325', r2: '<' }, wrongs: [{ lo: '6,32', r1: '<=', hi: '6,33', r2: '<' }, { lo: '6,315', r1: '<', hi: '6,325', r2: '<=' }, { lo: '6,31', r1: '<=', hi: '6,32', r2: '<' }] },
  v: { key: { lo: '126,3', r1: '<=', hi: '126,5', r2: '<' }, wrongs: [{ lo: '126,4', r1: '<=', hi: '126,6', r2: '<' }, { lo: '126,3', r1: '<', hi: '126,5', r2: '<=' }, { lo: '631,5', r1: '<=', hi: '632,5', r2: '<' }] },
};
/* ── E7 : ex-20, ex-22, ex-25 — des fractions rangées par leurs décimaux ───────────────────────────────────────── */
export const E7 = {
  dec: { frac: '3/8', key: '0,375', wrongs: ['0,38', '0,3', '0,385'] },
  bracket: { num: 5, den: 12, key: ['0,416', '0,417'], wrongs: [['0,417', '0,418'], ['0,415', '0,416'], ['0,4167', '0,4168']] },
  order: { key: '\\frac{3}{8}<0{,}4<\\frac{5}{12}', wrongs: ['0{,}4<\\frac{3}{8}<\\frac{5}{12}', '\\frac{3}{8}<\\frac{5}{12}<0{,}4', '\\frac{5}{12}<0{,}4<\\frac{3}{8}'] },
};

const strict = (lo, x, hi) => br(lo, '<', x, '<', hi);
const rowsOfBracket = (x, E, label) => E.rows.map((r, i) => row(`${label} ${RANK_NAME[r.rank]}`, strict(r.key[0], x, r.key[1]), r.wrongs.map(([a, b]) => strict(a, x, b)), i + 1,
  `نقطع الحاصل عند الرتبة فنجد $${dec(r.key[0])}$ ثم نضيف وحدة من الرتبة فنجد $${dec(r.key[1])}$ .`));
const fromBr = (E) => (o) => br(o.lo, o.r1, E.v, o.r2, o.hi);

export const EXERCISES = [
  {
    id: 'act-3-1', source: src('act-3', 73, 'أنشطة', 3), cites: [], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'طول قطعة قماش $L$ بالمتر، ومدوّره إلى $0{,}1$ هو $2{,}4$ . هل يمكن أن يساوي $L$ كلًّا من الأعداد الآتية؟ ثم احصر $L$ :',
    interaction: 'batch',
    question: {
      rows: [
        ...E1.cans.map((c) => canRow('L', c.val, c.key, c.why)),
        row('احصر $L$', fromBr(E1)(E1.key), E1.wrongs.map(fromBr(E1)), 2, E1.why),
      ],
      explain: 'عدد مدوّره إلى $0{,}1$ هو $2{,}4$ يبدأ من نصف جزء من عشرة تحت $2{,}4$ ويبلغ دون نصف جزء من عشرة فوقه.',
    },
    commonError: 'ظنّ أنّ الطرف الأيمن مشمول، أو أنّ العدد يبدأ من $2{,}4$ .',
  },
  {
    id: 'act-3-2', source: src('act-3', 73, 'أنشطة', 3), cites: [], learningPointId: LP.P4, difficulty: 'moyen',
    statement: `تُظهر الآلة الحاسبة $389\\div47=${E2.screen}$ . نضع $A=\\frac{389}{47}$ . احصر $A$ :`,
    interaction: 'batch',
    question: { rows: rowsOfBracket('A', E2, 'الحصر'), explain: 'نقرأ الأرقام حتى الرتبة المطلوبة فنجد العلامة السفلى، ونضيف وحدة من الرتبة للعليا؛ لا نستعمل المدوّر طرفًا للحصر.' },
    commonError: 'اتخاذ المدوّر طرفًا أدنى للحصر، أو الوقوف عند رتبة غير المطلوبة.',
  },
  {
    id: 'now-77-1', source: src('now-77-1', 77, 'دوري الآن', 1), cites: [src('know-3', 76, 'معارف')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'مدوّر عدد $b$ إلى $0{,}01$ هو $5{,}07$ . هل يمكن أن يساوي $b$ كلًّا من الأعداد الآتية؟ ثم احصر $b$ :',
    interaction: 'batch',
    question: {
      rows: [
        ...E3.cans.map((c) => canRow('b', c.val, c.key, c.why)),
        row('احصر $b$', fromBr(E3)(E3.key), E3.wrongs.map(fromBr(E3)), 1, E3.why),
      ],
      explain: 'نطرح نصف الرتبة ونضيفه: الطرف الأيسر مشمول والأيمن غير مشمول.',
    },
    commonError: 'إدراج $5{,}075$ ضمن الأعداد التي مدوّرها $5{,}07$ ، أو حذف $5{,}065$ منها.',
  },
  {
    id: 'self-5', source: src('self-5', 81, 'أؤكّد تعلّماتي', 5), cites: [src('prep', 71, 'أستعدّ', 14)], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'تُظهر الآلة الحاسبة $151\\div12=12.58333333$ . أجب:',
    interaction: 'batch',
    question: {
      rows: [
        row('مدوّر $\\frac{151}{12}$ إلى الوحدة', T(dec(E4.unit.key)), E4.unit.wrongs.map((s) => T(dec(s))), 1, 'الرقم الذي يلي الوحدة هو $5$ فنرفع: المدوّر $13$ .'),
        row('مدوّره إلى $0{,}1$', T(dec(E4.tenth.key)), E4.tenth.wrongs.map((s) => T(dec(s))), 0, 'الرقم الذي يلي الجزء من عشرة هو $8$ فنرفع: المدوّر $12{,}6$ .'),
        row('حصره بين عددين طبيعيين متتاليين', strict(E4.bracket.key[0], '\\frac{151}{12}', E4.bracket.key[1]), E4.bracket.wrongs.map(([a, b]) => strict(a, '\\frac{151}{12}', b)), 2, 'الحاصل بين $12$ و $13$ .'),
      ],
      explain: 'المدوّر هو أقرب علامة، أمّا الحصر فبين علامتين متتاليتين.',
    },
    commonError: 'الخلط بين المدوّر وطرف الحصر.',
  },
  {
    id: 'ex-21', source: S('ex-21', 79, 21), cites: [S('ex-62', 83, 62)], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'نقبل أنّ $3{,}14<\\pi<3{,}15$ . دائرة نصف قطرها $4$ cm ومحيطها $P=8\\pi$ . احصر $P$ :',
    interaction: 'batch',
    question: {
      rows: [row('حصر $P$', strict(E5.key[0], 'P', E5.key[1]), E5.wrongs.map(([a, b]) => strict(a, 'P', b)), 2, 'نضرب الأطراف الثلاثة في $8$ وهو موجب: $25{,}12<8\\pi<25{,}2$ .')],
      explain: 'نحصر $\\pi$ ثم نضرب في عدد موجب، فيبقى الاتجاه نفسه.',
    },
    commonError: 'ضرب طرف واحد، أو نسيان أنّ المحيط $2\\pi r$ يساوي $8\\pi$ .',
  },
  {
    id: 'ex-28', source: S('ex-28', 79, 28), cites: [], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'علبة قاعدتها مستطيل $4$ cm × $5$ cm ، وارتفاعها $h$ بالسنتيمتر مدوّره إلى $0{,}01$ هو $6{,}32$ . احصر :',
    interaction: 'batch',
    question: {
      rows: [
        row('الارتفاع $h$', br(E6.h.key.lo, E6.h.key.r1, 'h', E6.h.key.r2, E6.h.key.hi), E6.h.wrongs.map((o) => br(o.lo, o.r1, 'h', o.r2, o.hi)), 1, 'نصف الرتبة $0{,}005$ : $6{,}315\\le h<6{,}325$ .'),
        row('الحجم $V=20h$', br(E6.v.key.lo, E6.v.key.r1, 'V', E6.v.key.r2, E6.v.key.hi), E6.v.wrongs.map((o) => br(o.lo, o.r1, 'V', o.r2, o.hi)), 2, 'نضرب في $20$ وهو موجب: $126{,}3\\le V<126{,}5$ ، والطرف الأيمن يبقى غير مشمول.'),
      ],
      explain: 'نحصر العدد من مدوّره أوّلًا، ثم نضرب الأطراف في عدد موجب.',
    },
    commonError: 'نسيان أنّ الطرف الأيمن غير مشمول، أو ضرب الارتفاع في $100$ بدل $20$ .',
  },
  {
    id: 'ex-20', source: S('ex-20', 79, 20), cites: [S('ex-22', 79, 22), S('ex-25', 79, 25)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نريد أن نثبت أنّ $\\frac{3}{8}<0{,}4<\\frac{5}{12}$ بكتابة كل عدد بالشكل العشري أو بحصره إلى $0{,}001$ .',
    interaction: 'batch',
    question: {
      rows: [
        row('الكتابة العشرية للعدد $\\frac{3}{8}$', T(dec(E7.dec.key)), E7.dec.wrongs.map((s) => T(dec(s))), 0, '$3\\div8=0{,}375$ بالضبط.'),
        row('حصر $\\frac{5}{12}$ إلى $0{,}001$', strict(E7.bracket.key[0], '\\frac{5}{12}', E7.bracket.key[1]), E7.bracket.wrongs.map(([a, b]) => strict(a, '\\frac{5}{12}', b)), 1, '$5\\div12=0{,}41666\\ldots$ فهو بين $0{,}416$ و $0{,}417$ .'),
        row('الترتيب الصحيح', T(E7.order.key), E7.order.wrongs.map(T), 3, '$0{,}375<0{,}4<0{,}416<\\frac{5}{12}$ : نرتّب بعد الكتابة العشرية.'),
      ],
      explain: 'نكتب الأعداد بالنظام العشري نفسه أو نحصرها إلى الرتبة نفسها ثم نقارن.',
    },
    commonError: 'مقارنة بسطين أو مقامين مباشرة دون توحيد الكتابة.',
  },
];
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: src('self-5', 81, 'أؤكّد تعلّماتي', 5), lp: LP.P1, kind: 'between', x: '17,08', prompt: 'حصر $17{,}08$ بين عددين طبيعيين متتاليين هو:', key: ['17', '18'], wrongs: [['16', '17'], ['17,1', '18'], ['18', '19']],
    options: ['$17<17{,}08<18$', '$16<17{,}08<17$', '$17{,}1<17{,}08<18$', '$18<17{,}08<19$'], correct: 0 },
  { id: 'E2', source: null, lp: LP.P2, kind: 'excess', x: '4,2531', rank: 2, prompt: 'القيمة المقرّبة بالزيادة إلى $0{,}01$ للعدد $4{,}2531$ هي:', key: '4,26', wrongs: ['4,25', '4,3', '4,253'],
    options: ['$4{,}26$', '$4{,}25$', '$4{,}3$', '$4{,}253$'], correct: 0 },
  { id: 'E3', source: null, lp: LP.P3, kind: 'round', x: '9,8462', rank: 1, prompt: 'مدوّر $9{,}8462$ إلى $0{,}1$ هو:', key: '9,8', wrongs: ['9,9', '9,84', '10'],
    options: ['$9{,}8$', '$9{,}9$', '$9{,}84$', '$10$'], correct: 0 },
  { id: 'E4', source: null, lp: LP.P3, kind: 'from', v: 'x', r: '3,6', rank: 1, prompt: 'مدوّر $x$ إلى $0{,}1$ هو $3{,}6$ . الحصر الصحيح هو:',
    key: { lo: '3,55', r1: '<=', hi: '3,65', r2: '<' }, wrongs: [{ lo: '3,6', r1: '<=', hi: '3,7', r2: '<' }, { lo: '3,55', r1: '<=', hi: '3,65', r2: '<=' }, { lo: '3,5', r1: '<', hi: '3,7', r2: '<' }],
    options: ['$3{,}55\\leq x<3{,}65$', '$3{,}6\\leq x<3{,}7$', '$3{,}55\\leq x\\leq 3{,}65$', '$3{,}5<x<3{,}7$'], correct: 0 },
  { id: 'E5', source: null, lp: LP.P4, kind: 'quotient', num: 250, den: 7, screen: '35.71428571', rank: 2, prompt: 'تُظهر الآلة $250\\div7=35.71428571$ . حصر الحاصل إلى $0{,}01$ هو:', key: ['35,71', '35,72'], wrongs: [['35,72', '35,73'], ['35,7', '35,71'], ['35,6', '35,7']],
    options: ['$35{,}71<\\frac{250}{7}<35{,}72$', '$35{,}72<\\frac{250}{7}<35{,}73$', '$35{,}7<\\frac{250}{7}<35{,}71$', '$35{,}6<\\frac{250}{7}<35{,}7$'], correct: 0 },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
