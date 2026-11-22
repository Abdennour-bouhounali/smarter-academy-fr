/**
 * Les exercices du درس « الكتابة العلمية ورتبة القدر » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source` l'élément
 * du manuel dont il est tiré et, dans `cites`, ceux qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève.
 * Chaque ligne porte ses `data` : ./content.test.js les RECALCULE avec un code INDÉPENDANT de `tenPowers.js` (BigInt) — la bonne option est l'écriture scientifique ÉGALE à la valeur,
 * chaque distracteur n'est PAS cette écriture (valeur différente, ou valeur égale mais pas de la forme 1 ≤ a < 10).
 * Destinations (docs/sources/3am/unit3/extraction.json) : ex-21 … ex-31, 57 → module 4 ; self-12, 14, 19, 20, 21 → le إختبار أولي (module 8) ; le reste → la banque / les مسائل.
 * La frontière de la leçon : l'écriture scientifique, l'encadrement et le rang de grandeur ; les règles de calcul sur les puissances de 10 sont RAPPELÉES (leçon précédente).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_kitaba-ilmiya-rutba_P1',
  P2: '3am_kitaba-ilmiya-rutba_P2',
  P3: '3am_kitaba-ilmiya-rutba_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction, data) => ({ label, ...place(right, wrongs, at), correction, data });
const sc = (a, n) => T(`${a}\\times10^{${n}}`);

/* ── 1. compléter (ex-21) ─────────────────────────────────────────────────────────────────────────────────────────── */
const FILL = [
  { lhs: '8\\,451', rhs: '\\ldots\\times10^{3}', key: '8{,}451', wrongs: ['84{,}51', '845{,}1'], at: 0, f: { kind: 'fill-k', value: '8451', n: 3 }, why: '$8\\,451 = 8{,}451 \\times 1\\,000$ : la virgule recule de trois rangs.' },
  { lhs: '0{,}2463', rhs: '\\ldots\\times10^{-2}', key: '24{,}63', wrongs: ['2{,}463', '0{,}002463'], at: 1, f: { kind: 'fill-k', value: '0.2463', n: -2 }, why: '$0{,}2463 = 24{,}63 \\times 0{,}01$ : la virgule avance de deux rangs.' },
  { lhs: '5\\,380{,}4', rhs: '53{,}804\\times10^{?}', key: '2', wrongs: ['3', '-2'], at: 2, f: { kind: 'fill-n', value: '5380.4', k: '53.804' }, why: '$53{,}804 \\times 10^{2} = 5\\,380{,}4$ : la virgule avance de deux rangs.' },
  { lhs: '0{,}73', rhs: '0{,}00073\\times10^{?}', key: '3', wrongs: ['-3', '5'], at: 0, f: { kind: 'fill-n', value: '0.73', k: '0.00073' }, why: '$0{,}00073 \\times 10^{3} = 0{,}73$ : la virgule avance de trois rangs.' },
];

/* ── 2. l'écriture scientifique (ex-26) ───────────────────────────────────────────────────────────────────────────── */
const SCI = [
  { v: '608\\,000', a: '6{,}08', n: 5, wrongs: [['6{,}08', 6], ['60{,}8', 4]], at: 0, why: '$608\\,000 = 6{,}08 \\times 10^{5}$ : la virgule recule de cinq rangs.' },
  { v: '0{,}047', a: '4{,}7', n: -2, wrongs: [['4{,}7', 2], ['4{,}7', -3]], at: 1, why: '$0{,}047 = 4{,}7 \\times 10^{-2}$ : la virgule avance de deux rangs.' },
  { v: '795\\,312', a: '7{,}95312', n: 5, wrongs: [['7{,}95312', 6], ['79{,}5312', 4]], at: 2, why: '$795\\,312 = 7{,}95312 \\times 10^{5}$ .' },
  { v: '0{,}86', a: '8{,}6', n: -1, wrongs: [['8{,}6', -2], ['8{,}6', 1]], at: 0, why: '$0{,}86 = 8{,}6 \\times 10^{-1}$ : la virgule avance d\'un seul rang.' },
  { v: '302\\,500\\,000', a: '3{,}025', n: 8, wrongs: [['3{,}025', 9], ['30{,}25', 7]], at: 1, why: '$302\\,500\\,000 = 3{,}025 \\times 10^{8}$ : huit rangs.' },
  { v: '0{,}0000419', a: '4{,}19', n: -5, wrongs: [['4{,}19', -4], ['4{,}19', 5]], at: 2, why: '$0{,}0000419 = 4{,}19 \\times 10^{-5}$ : cinq rangs vers la droite.' },
];

/* ── 3. comparer (ex-27, ex-28) ───────────────────────────────────────────────────────────────────────────────────── */
const CMP = [
  { l: '17\\times10^{3}', r: '15\\times10^{4}', truth: false, why: '$17\\,000 < 150\\,000$ .' },
  { l: '4{,}2\\times10^{5}', r: '6{,}1\\times10^{4}', truth: true, why: 'L\'exposant 5 est plus grand que 4 : $420\\,000 > 61\\,000$ .' },
  { l: '23\\times10^{8}', r: '1{,}9\\times10^{9}', truth: true, why: '$23 \\times 10^{8} = 2{,}3 \\times 10^{9}$ et $2{,}3 > 1{,}9$ .' },
  { l: '3{,}4\\times10^{5}', r: '0{,}62\\times10^{7}', truth: false, why: '$0{,}62 \\times 10^{7} = 6{,}2 \\times 10^{6}$ , bien plus grand que $3{,}4 \\times 10^{5}$ .' },
  { l: '7\\times10^{-3}', r: '6\\times10^{-4}', truth: true, why: '$-3 > -4$ : $0{,}007 > 0{,}0006$ .' },
  { l: '8{,}9\\times10^{-5}', r: '4{,}6\\times10^{-4}', truth: false, why: '$-5 < -4$ : $0{,}000089 < 0{,}00046$ .' },
];

/* ── 4. ranger (ex-29) ────────────────────────────────────────────────────────────────────────────────────────────── */
const ORDER_ITEMS = { A: '130{,}05\\times10^{2}', B: '1\\times10^{4}', C: '67{,}8\\times10^{3}', D: '9\\,263', E: '112\\,486\\times10^{-1}', F: '0{,}08888\\times10^{5}' };
const ORDER_KEY = 'F,D,B,E,A,C';
const ORDER_WRONGS = ['D,F,B,E,A,C', 'F,D,B,A,E,C', 'B,F,D,E,A,C'];
const seq = (s) => T(s.split(',').join(' < '));

/* ── 5. calculer puis écrire (ex-30, ex-31) ───────────────────────────────────────────────────────────────────────── */
const CALC = [
  { expr: '2\\,500\\times6\\,000', a: '1{,}5', n: 7, wrongs: [['15', 6], ['1{,}5', 6]], at: 0, why: '$2\\,500 \\times 6\\,000 = 15\\,000\\,000 = 1{,}5 \\times 10^{7}$ .' },
  { expr: '0{,}0004\\times0{,}002', a: '8', n: -7, wrongs: [['8', -6], ['8', -8]], at: 1, why: '$0{,}0004 \\times 0{,}002 = 0{,}0000008 = 8 \\times 10^{-7}$ .' },
  { expr: '\\frac{48\\,000\\,000}{0{,}0006}', a: '8', n: 10, wrongs: [['8', 9], ['8', 11]], at: 2, why: '$\\frac{4{,}8 \\times 10^{7}}{6 \\times 10^{-4}} = 0{,}8 \\times 10^{11} = 8 \\times 10^{10}$ .' },
];

/* ── 6. une quantité réelle (ex-57) ───────────────────────────────────────────────────────────────────────────────── */
const REAL = { expr: '15\\times60\\times24\\times365', value: '7884000', sci: ['7{,}884', 6], sciWrongs: [['7{,}884', 5], ['7{,}884', 7]], order: [8, 6], orderWrongs: [[7, 6], [1, 7]] };

export const EXERCISES = [
  {
    id: 'ex-21', source: S('ex-21', 47), cites: [S('ex-22', 47), S('ex-23', 47), S('ex-24', 47), S('ex-25', 47), S('self-18', 49, 'أؤكّد تعلّماتي')],
    learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'أتمّ كل مساواة: اختر الجواب الذي يجعلها صحيحة.',
    interaction: 'batch',
    question: { rows: FILL.map((f) => row(T(`${f.lhs} = ${f.rhs}`), T(f.key), f.wrongs.map(T), f.at, f.why, f.f)), explain: 'نُزيح الفاصلة في أحد الاتجاهين، ونعدّل الأسّ بعدد الرتب نفسه.' },
    commonError: 'عكس اتجاه الفاصلة: $0{,}73 = 0{,}00073 \\times 10^{-3}$ .',
  },
  {
    id: 'ex-26', source: S('ex-26', 47), cites: [S('self-12', 49, 'أؤكّد تعلّماتي')],
    learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'اختر لكل عدد كتابته العلمية.',
    interaction: 'batch',
    question: { rows: SCI.map((s, i) => row(T(s.v), sc(s.a, s.n), s.wrongs.map(([a, n]) => sc(a, n)), s.at + i, s.why, { kind: 'sci', value: s.v, a: s.a, n: s.n })), explain: 'نزيح الفاصلة حتى يبقى رقم واحد غير معدوم قبلها، والأسّ هو عدد الرتب بإشارته.' },
    commonError: 'أسّ يساوي عدد أرقام العدد ($608\\,000 = 6{,}08 \\times 10^{6}$) أو عدد غير $1 \\le a < 10$ .',
  },
  {
    id: 'ex-27', source: S('ex-27', 47), cites: [S('ex-28', 47)],
    learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'أصحيحة كل مقارنة أم خاطئة؟',
    interaction: 'batch',
    question: { rows: CMP.map((c) => ({ label: T(`${c.l} > ${c.r}`), options: ['صحيحة', 'خاطئة'], correct: c.truth ? 0 : 1, correction: c.why, data: { kind: 'cmp', l: c.l, r: c.r, truth: c.truth } })), explain: 'نكتب كل عدد كتابة علمية ثم نقارن الأسّين أوّلًا، فإن تساويا قارنّا العددين $a$ .' },
    commonError: 'مقارنة العددين $a$ دون الأسّين ($8{,}9 \\times 10^{-5} > 4{,}6 \\times 10^{-4}$) .',
  },
  {
    id: 'ex-29', source: S('ex-29', 47), cites: [S('ex-33', 48)],
    learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'رتّب الأعداد التالية ترتيبًا تصاعديًا بعد كتابتها كتابة علمية: ' + Object.entries(ORDER_ITEMS).map(([k, v]) => `$${k} = ${v}$`).join(' ؛ ') + ' .',
    interaction: 'choice',
    question: { prompt: 'الترتيب التصاعدي هو:', ...place(seq(ORDER_KEY), ORDER_WRONGS.map(seq), 2), explain: 'كتابتها العلمية: $F = 8{,}888 \\times 10^{3}$ ، $D = 9{,}263 \\times 10^{3}$ ، $B = 1 \\times 10^{4}$ ، $E = 1{,}12486 \\times 10^{4}$ ، $A = 1{,}3005 \\times 10^{4}$ ، $C = 6{,}78 \\times 10^{4}$ .' },
    commonError: 'ترتيب العددين $a$ دون الأسّين.',
    data: { kind: 'order', items: ORDER_ITEMS, key: ORDER_KEY, wrongs: ORDER_WRONGS },
  },
  {
    id: 'ex-30', source: S('ex-30', 47), cites: [S('ex-31', 47), S('ex-52', 50), S('self-15', 49, 'أؤكّد تعلّماتي'), S('self-16', 49, 'أؤكّد تعلّماتي')],
    learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'احسب كل عبارة ثم اختر كتابة النتيجة العلمية.',
    interaction: 'batch',
    question: { rows: CALC.map((c, i) => row(T(`${c.expr} = ?`), sc(c.a, c.n), c.wrongs.map(([a, n]) => sc(a, n)), c.at + i, c.why, { kind: 'calc', expr: c.expr, a: c.a, n: c.n })), explain: 'نحسب أوّلًا ثم نكتب النتيجة كتابة علمية.' },
    commonError: 'إهمال أحد الأصفار، أو ترك النتيجة غير مكتوبة كتابة علمية.',
  },
  {
    id: 'ex-57', source: S('ex-57', 50), cites: [S('ex-58', 50), S('ex-59', 50), S('ex-54', 50), S('ex-60', 50), S('ex-65', 51), S('ex-67', 51), S('ex-70', 51)],
    learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'يتنفّس الإنسان حوالي 15 مرّة في الدقيقة. نحسب عدد أنفاسه في سنة من 365 يومًا: $15 \\times 60 \\times 24 \\times 365$ .',
    interaction: 'batch',
    question: { rows: [
      { label: 'كتابة هذا العدد العلمية:', ...place(sc(REAL.sci[0], REAL.sci[1]), REAL.sciWrongs.map(([a, n]) => sc(a, n)), 1), correction: '$15 \\times 60 \\times 24 \\times 365 = 7\\,884\\,000 = 7{,}884 \\times 10^{6}$ .', data: { kind: 'real-sci', expr: REAL.expr, a: REAL.sci[0], n: REAL.sci[1] } },
      { label: 'رتبة قدره:', ...place(sc(REAL.order[0], REAL.order[1]), REAL.orderWrongs.map(([a, n]) => sc(a, n)), 0), correction: 'مدوّر $7{,}884$ إلى الوحدة هو 8 ، فرتبة القدر $8 \\times 10^{6}$ .', data: { kind: 'real-order', expr: REAL.expr, a1: REAL.order[0], n1: REAL.order[1] } },
    ], explain: 'نحسب ثم نكتب كتابة علمية، ثم ندوّر العدد $a$ إلى الوحدة.' },
    commonError: 'حذف ما بعد الفاصلة بدل التدوير: رتبة القدر $7 \\times 10^{6}$ .',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `kind` dit ce qu'on cherche. */
export const FINAL = [
  { id: 'E1', source: src('self-12', 49, 'أؤكّد تعلّماتي'), kind: 'sci', tex: '6\\,040\\,000', options: ['6{,}04\\times10^{6}', '604\\times10^{4}', '6{,}04\\times10^{5}', '6{,}04\\times10^{7}'], correct: 0 },
  { id: 'E2', source: src('self-14', 49, 'أؤكّد تعلّماتي'), kind: 'sci', tex: '0{,}035\\times10^{-2}', options: ['3{,}5\\times10^{-4}', '3{,}5\\times10^{0}', '35\\times10^{-5}', '3{,}5\\times10^{-3}'], correct: 0 },
  { id: 'E3', source: src('self-20', 49, 'أؤكّد تعلّماتي'), kind: 'bracket', lo: -3, options: ['0{,}0042', '0{,}042', '4{,}2\\times10^{-4}', '42\\times10^{-2}'], correct: 0 },
  { id: 'E4', source: src('self-19', 49, 'أؤكّد تعلّماتي'), kind: 'order', tex: '0{,}000786', options: ['8\\times10^{-4}', '7\\times10^{-4}', '8\\times10^{-3}', '1\\times10^{-3}'], correct: 0 },
  { id: 'E5', source: src('self-21', 49, 'أؤكّد تعلّماتي'), kind: 'rank', items: { A: '5{,}1\\times10^{-6}', B: '48\\times10^{-7}', C: '0{,}6\\times10^{-5}' }, options: ['B<A<C', 'A<B<C', 'C<A<B', 'B<C<A'], correct: 0 },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
