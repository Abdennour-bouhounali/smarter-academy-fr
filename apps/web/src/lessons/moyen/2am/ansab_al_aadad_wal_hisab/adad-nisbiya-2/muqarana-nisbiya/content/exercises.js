/**
 * Les exercices du درس « مقارنة وترتيب أعداد نسبية » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, mêmes compétences).
 * Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace
 * (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève. Chaque clé est CALCULÉE ici avec
 * `packages/core/arithmetic/relative.js` et RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi que
 * chaque distracteur est FAUX.
 * Destinations (docs/sources/2am/unit3/extraction.json) : act-2, ex-12 … ex-20 et opener → module 4 ; self-5, self-6 → le إختبار أولي.
 */
import * as R from '@smarter-academy/core/arithmetic/relative.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '2am_muqarana-nisbiya_P1',
  P2: '2am_muqarana-nisbiya_P2',
  P3: '2am_muqarana-nisbiya_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
const tex = (v) => R.tex(v);
const SYMS = ['<', '>', '='];
/** L'indice (0 : <, 1 : >, 2 : =) de la comparaison exacte de a et b. */
const symIndex = (a, b) => { const c = R.cmp(a, b); return c < 0 ? 0 : c > 0 ? 1 : 2; };
/** Une ligne « a … b » : les trois symboles dans un ordre fixe, la clé suit la comparaison exacte. */
const rel = (a, b, correction) => ({ label: T(`${tex(a)}\\ \\ldots\\ ${tex(b)}`), options: SYMS.map(T), correct: symIndex(a, b), correction });
/** Une chaîne « a < b < c » (ou « > ») : les valeurs sont données DANS l'ordre voulu. */
const chain = (vals, sym) => T(vals.map(tex).join(` ${sym} `));
const sorted = (vals, dir = 'asc') => [...vals].sort((a, b) => (dir === 'asc' ? R.cmp(a, b) : R.cmp(b, a)));
/** Place la bonne option à la position `at` parmi les autres (dans l'ordre). */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };

/* ── 1. act-2 (réécrit) : les températures de deux villes — comparer six paires ─────────────────────────────────────── */
const PAIRS_A = [['-1', '3'], ['-6', '-4'], ['0', '-2'], ['7,45', '7,5'], ['-3,2', '-3,02'], ['-0,5', '0,05']];
const why = (a, b) => {
  const c = R.cmp(a, b);
  if (c === 0) return 'العددان متساويان.';
  const [lo, hi] = c < 0 ? [a, b] : [b, a];
  const sa = R.sideOf(lo); const sb = R.sideOf(hi);
  if (sa === 'below' && sb === 'below') return `سالبان: ${R.text(lo).replace('-', '−')} أبعد عن الصفر، فهو الأصغر.`;
  if (sa === 'below' || sb === 'below') return `${R.text(lo).replace('-', '−')} هو السالب (أو الأدنى من الصفر)، فهو الأصغر.`;
  return 'موجبان: الأقرب إلى الصفر هو الأصغر.';
};

/* ── 2. ex-13 : les décimales négatives et les égalités déguisées ───────────────────────────────────────────────────── */
const PAIRS_B = [['-1,7', '-1,07'], ['-0,9', '-1'], ['3,5', '-5,3'], ['-12,4', '-12,40'], ['-0,25', '-0,5']];

/* ── 3. ex-14 : un élève a répondu, corrigez-le ─────────────────────────────────────────────────────────────────────── */
const CLAIMS = [['-4,5', '-4,05', '<'], ['-8', '-3', '>'], ['2,6', '2,59', '>'], ['-0,1', '0', '>']];
const claimTrue = (a, b, s) => (R.cmp(a, b) < 0) === (s === '<');

/* ── 4. ex-15 : trois questions sur une même liste ──────────────────────────────────────────────────────────────────── */
const LIST15 = ['3,4', '-5,6', '0', '-1,2', '5', '-5,59'];
const max15 = sorted(LIST15, 'desc')[0];
const min15 = sorted(LIST15, 'asc')[0];
const near15 = [...LIST15].sort((a, b) => (R.distance(a) < R.distance(b) ? -1 : R.distance(a) > R.distance(b) ? 1 : 0))[0];

/* ── 5/6. ex-17 / ex-18 : ranger ────────────────────────────────────────────────────────────────────────────────────── */
const LIST17 = ['-45', '0', '6', '-6,5', '-40'];
const L18 = ['-4,5', '-4,05', '0,4', '-0,45', '-4,15'];

/* ── 7. ex-20 : un nombre entre deux nombres ────────────────────────────────────────────────────────────────────────── */
const BETWEEN = [
  { lo: '-3,2', hi: '-3,1', good: '-3,15', wrongs: ['-3,25', '-3,05', '-3,1'] },
  { lo: '2,5', hi: '2,6', good: '2,55', wrongs: ['2,65', '2,45', '2,6'] },
];

const ex = (id, source, learningPointId, difficulty, extra) => ({ id, source, learningPointId, difficulty, ...extra });

export const EXERCISES = [
  ex('act-2', S('act-2', 40, 'أنشطة'), LP.P2, 'facile', {
    cites: [S('ex-12', 46)],
    statement: 'سجّل مرصد الأرصاد درجتين في كل مدينة في يوم بارد من الشتاء. أتمّ كل مقارنة بالرمز المناسب: $<$ أو $>$ أو $=$ .',
    interaction: 'batch',
    question: { rows: PAIRS_A.map(([a, b]) => rel(a, b, why(a, b))), explain: 'نقرأ الأعداد على مقياس الحرارة: الأخفض هو الأصغر.' },
    commonError: 'مقارنة الأرقام دون النظر إلى الإشارتين.',
  }),
  ex('ex-13', S('ex-13', 46), LP.P1, 'moyen', {
    statement: 'أتمّ المقارنة، وانتبه إلى الأرقام بعد الفاصلة وإلى الإشارة.',
    interaction: 'batch',
    question: { rows: PAIRS_B.map(([a, b]) => rel(a, b, why(a, b))), explain: 'بين عددين سالبين نقارن مسافتيهما إلى الصفر بالقطع نفسها، ثم نعكس: الأبعد هو الأصغر.' },
    commonError: 'اعتبار $-1{,}07$ أبعد عن الصفر لأنّ فيه رقمين بعد الفاصلة.',
  }),
  ex('ex-14', S('ex-14', 46), LP.P1, 'moyen', {
    statement: 'كتب تلميذ المقارنات الآتية. صحّح الخاطئ منها وبرّر.',
    interaction: 'trueFalse',
    question: {
      rows: CLAIMS.map(([a, b, s]) => ({
        text: T(`${tex(a)} ${s} ${tex(b)}`), answer: claimTrue(a, b, s),
        why: claimTrue(a, b, s) ? 'مقارنة صحيحة.' : `خاطئة: الصحيح $${tex(a)} ${R.cmp(a, b) < 0 ? '<' : '>'} ${tex(b)}$ .`,
      })),
      explain: 'نبدأ بالإشارتين، ثم بالمسافتين إلى الصفر.',
    },
    commonError: 'قراءة $-8>-3$ لأنّ $8>3$ .',
  }),
  ex('ex-15', S('ex-15', 46), LP.P2, 'moyen', {
    cites: [S('ex-16', 47)],
    statement: `قائمة أعداد نسبية: ${LIST15.map((v) => T(tex(v))).join(' ؛ ')} .`,
    interaction: 'batch',
    question: {
      rows: [
        { label: 'أكبر عدد في القائمة:', ...place(T(tex(max15)), [T(tex('-5,6')), T(tex('0'))], 1), correction: 'الموجب أكبر من الصفر ومن كل سالب: أكبر الموجبين هو $5$ .' },
        { label: 'أصغر عدد في القائمة:', ...place(T(tex(min15)), [T(tex('-5,59')), T(tex('5'))], 0), correction: 'بين السالبين $-5{,}6$ و $-5{,}59$ و $-1{,}2$ : الأبعد عن الصفر هو الأصغر.' },
        { label: 'العدد الأقرب إلى الصفر:', ...place(T(tex(near15)), [T(tex('-1,2')), T(tex('3,4'))], 2), correction: 'الأقرب إلى الصفر هو الصفر نفسه: مسافته 0 .' },
      ],
      explain: 'الأصغر والأقرب إلى الصفر شيئان مختلفان.',
    },
    commonError: 'الخلط بين « الأصغر » و « الأقرب إلى الصفر ».',
  }),
  ex('ex-17', S('ex-17', 47), LP.P3, 'moyen', {
    statement: `رتّب تصاعديًا الأعداد: ${LIST17.map((v) => T(tex(v))).join(' ؛ ')} .`,
    interaction: 'choice',
    question: {
      options: place(chain(sorted(LIST17), '<'), [chain(sorted(LIST17, 'desc'), '<'), chain(['0', '6', '-6,5', '-40', '-45'], '<'), chain(['-6,5', '-40', '-45', '0', '6'], '<')], 1).options,
      correct: 1, cols: 1, explain: 'السالبة أوّلًا مرتّبة بالأبعد فالأقرب إلى الصفر: $-45 < -40 < -6{,}5$ ، ثم الصفر، ثم الموجب $6$ .',
    },
    commonError: 'ترتيب السالبة كأنّها موجبة ($-6{,}5 < -40$).',
  }),
  ex('ex-18', S('ex-18', 47), LP.P3, 'moyen', {
    statement: `رتّب تنازليًا الأعداد: ${L18.map((v) => T(tex(v))).join(' ؛ ')} .`,
    interaction: 'choice',
    question: {
      ...place(chain(sorted(L18, 'desc'), '>'), [chain(sorted(L18), '>'), chain(['0,4', '-4,5', '-4,15', '-4,05', '-0,45'], '>'), chain(['0,4', '-0,45', '-4,5', '-4,15', '-4,05'], '>')], 2),
      cols: 1, explain: 'الموجب أوّلًا $0{,}4$ ، ثم السالبة من الأقرب إلى الصفر إلى الأبعد: $-0{,}45 > -4{,}05 > -4{,}15 > -4{,}5$ .',
    },
    commonError: 'الخلط بين الترتيب التصاعدي والتنازلي أو بين الرمزين $<$ و $>$ .',
  }),
  ex('ex-20', S('ex-20', 47), LP.P3, 'difficile', {
    cites: [S('ex-19', 47)],
    statement: 'أوجد في كل حالة عددًا نسبيًا مناسبًا (المتباينة صارمة).',
    interaction: 'batch',
    question: {
      rows: BETWEEN.map((b, i) => ({ label: T(`${tex(b.lo)} < \\ldots < ${tex(b.hi)}`), ...place(T(tex(b.good)), b.wrongs.map((w) => T(tex(w))), i + 1), correction: `$${tex(b.lo)} < ${tex(b.good)} < ${tex(b.hi)}$ : ما يصلح هو الذي يقع بين الحدّين، والحدّان أنفسهما لا يصلحان.` })),
      explain: 'نكتب العددين بالعدد نفسه من الأرقام بعد الفاصلة ثم نبحث بينهما.',
    },
    commonError: 'اختيار أحد الحدّين نفسه.',
  }),
  ex('opener', src('opener', 38, 'تمهيد'), LP.P2, 'facile', {
    statement: `أبرد الأماكن المأهولة على الأرض مدينة فيرخويانسك في سيبيريا، وقد سُجّلت فيها درجة ${T(tex('-67,8'))}°C ، وأسخنها منطقة وادي الموت بأمريكا إذ بلغت الحرارة ${T(tex('56,7'))}°C ، وتتجاوز في عين صالح بالجزائر ${T(tex('50'))}°C ، بينما سجّل مرصد في الهقّار ${T(tex('-2'))}°C في ليلة باردة.`,
    interaction: 'batch',
    question: {
      rows: [
        { label: 'أخفض هذه الدرجات:', ...place(T(tex('-67,8')), [T(tex('-2')), T(tex('50'))], 0), correction: '$-67{,}8 < -2 < 50 < 56{,}7$ : أبعد سالب عن الصفر هو الأصغر.' },
        { label: 'أعلاها:', ...place(T(tex('56,7')), [T(tex('50')), T(tex('-67,8'))], 1), correction: '$56{,}7 > 50$ : موجبان، الأبعد عن الصفر هو الأكبر.' },
      ],
      explain: 'الأخفض هو الأصغر، والأعلى هو الأكبر.',
    },
  }),
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
export const FINAL = [
  { id: 'E1', source: null, prompt: 'أصغر العددين $-2{,}6$ و $-2{,}06$ هو:', truth: ['-2,6', '-2,06'], options: ['-2,6', '-2,06', '2,06', '2,6'], correct: 0, kind: 'smaller' },
  { id: 'E2', source: src('self-5', 49, 'أؤكّد تعلّماتي'), prompt: 'أكبر الأعداد في القائمة $-0{,}5$ ؛ $0$ ؛ $-3{,}2$ ؛ $0{,}25$ ؛ $-15$ هو:', truth: ['-0,5', '0', '-3,2', '0,25', '-15'], options: ['0,25', '0', '-15', '-0,5'], correct: 0, kind: 'greatest' },
  { id: 'E3', source: null, prompt: 'الترتيب التصاعدي للأعداد $-1{,}5$ ؛ $0$ ؛ $-3{,}2$ ؛ $0{,}5$ ؛ $-15$ هو:', truth: ['-1,5', '0', '-3,2', '0,5', '-15'], options: [['-15', '-3,2', '-1,5', '0', '0,5'], ['0,5', '0', '-1,5', '-3,2', '-15'], ['-1,5', '-3,2', '-15', '0', '0,5'], ['0', '0,5', '-1,5', '-3,2', '-15']], correct: 0, kind: 'ascending' },
  { id: 'E4', source: src('self-6', 49, 'أؤكّد تعلّماتي'), prompt: 'العدد $x$ محصور بين $-6$ و $-2$ (متباينة صارمة) إذا كان:', truth: ['-6', '-2'], options: ['-4', '-7', '0', '-2'], correct: 0, kind: 'between' },
  { id: 'E5', source: null, prompt: 'عدد محصور بين $-3{,}5$ و $-3{,}4$ (متباينة صارمة) هو:', truth: ['-3,5', '-3,4'], options: ['-3,45', '-3,6', '-3,3', '-3,5'], correct: 0, kind: 'between' },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
