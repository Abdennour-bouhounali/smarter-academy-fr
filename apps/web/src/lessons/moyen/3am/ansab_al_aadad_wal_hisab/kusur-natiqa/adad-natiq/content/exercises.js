/**
 * Les exercices du درس « العدد الناطق » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source` l'élément du manuel dont il
 * est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à l'élève. Les écritures sont des LITTÉRAUX « a/b »
 * (jamais réduits à la main) et chaque clé est RE-vérifiée par ./content.test.js avec un code en BigInt (parseur, pgcd, test 2^i·5^j et ordre propres), qui contrôle aussi que chaque
 * distracteur est FAUX. Destinations (docs/sources/3am/unit2/extraction.json) : act-5, ex-22, ex-23, ex-24, ex-26, deep-56, ex-27, ex-30 (cite ex-31, ex-33), ex-28 (cite self-9), self-10, ex-32,
 * deep-69 → module 4 ; know-5 → module 2 ; method-10 → module 3 ; prep 8 et 12 → module 0 ; ex-25, ex-29, self-4 → la banque d'exercices ; le إختبار أولي (module 8) est de la plateforme.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_adad-natiq_P1',
  P2: '3am_adad-natiq_P2',
  P3: '3am_adad-natiq_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const fix = (t) => String(t).replace(',', '{,}');
/** Une écriture « a/b » (a peut être décimal, signes libres) → LaTeX ; « 4 » → 4. */
export const wtex = (w) => {
  const i = String(w).indexOf('/');
  return i < 0 ? fix(w) : `\\frac{${fix(String(w).slice(0, i))}}{${fix(String(w).slice(i + 1))}}`;
};
const M = (w) => `$${wtex(w)}$`;

/* ── act-5 ① : décimal ou non (cite 1AM) ─────────────────────────────────────────────────────────────────── */
/** Une option : `claim` 'dec' (la kitaba décimale exacte `v`) ou 'non' (valeur approchée par défaut à 0,01 `v`, ou aucune) — le test recalcule. */
const dec = (v) => ({ t: `$${fix(v)}$`, claim: 'dec', v });
const notDec = (v) => ({ t: `غير عشري، قيمته المقرّبة $${fix(v)}$`, claim: 'non', v });
const notDecOnly = { t: 'غير عشري', claim: 'non', v: null };
const row = (w, options, correct, correction) => ({ w, options, correct, correction, label: M(w) });
export const DECIMALS = [
  row('4', [dec('4'), dec('0,4'), notDecOnly], 0, '$4=4{,}0$ : عدد عشري (وصحيح).'),
  row('-3', [notDecOnly, dec('-3'), dec('-0,3')], 1, '$-3$ عدد صحيح، وهو عشري.'),
  row('-7,4/5', [dec('-0,148'), notDecOnly, dec('-1,48')], 2, '$-7{,}4\\div5=-1{,}48$ : الكتابة العشرية تنتهي.'),
  row('5/6', [dec('0,8'), notDec('0,83'), notDec('0,84')], 1, '$5\\div6=0{,}8333\\ldots$ لا تنتهي، وقيمته المقرّبة بالنقصان إلى $0{,}01$ هي $0{,}83$ .'),
  row('13/4', [dec('3,25'), dec('0,325'), notDecOnly], 0, '$13\\div4=3{,}25$ .'),
  row('-5/8', [dec('-0,625'), dec('-0,58'), notDecOnly], 0, '$5\\div8=0{,}625$ ، فالعدد $-0{,}625$ .'),
  row('7/3', [notDec('2,33'), dec('2,3'), notDec('2,34')], 0, '$7\\div3=2{,}333\\ldots$ لا تنتهي: قيمته المقرّبة بالنقصان $2{,}33$ .'),
];

/* ── act-5 ①ب : le signe d'un quotient (RAPPELÉ, `qismat-nisbiyayn`) ─────────────────────────────────────── */
const sgn = (w, plus, correction) => ({ w, plus, label: M(w), options: ['$+$ موجب', '$-$ سالب'], correct: plus ? 0 : 1, correction });
export const SIGNS1 = [
  sgn('-21/-28', true, 'إشارتان سالبتان: الحاصل موجب، $\\frac{-21}{-28}=\\frac{3}{4}$ .'),
  sgn('-30/12', false, 'عددان مختلفا الإشارة: الحاصل سالب، $\\frac{-30}{12}=-\\frac{5}{2}$ .'),
  sgn('16/-20', false, 'عددان مختلفا الإشارة: الحاصل سالب، $\\frac{16}{-20}=-\\frac{4}{5}$ .'),
];
/* ── ex-24 : le signe (autres nombres) ──────────────────────────────────────────────────────────────────────── */
export const SIGNS2 = [
  sgn('-15/-35', true, '$\\frac{-15}{-35}=\\frac{3}{7}$ .'),
  sgn('-7,2/-4,8', true, '$\\frac{-7{,}2}{-4{,}8}=\\frac{3}{2}$ : موجب.'),
  sgn('9/-11', false, '$\\frac{9}{-11}=-\\frac{9}{11}$ .'),
  sgn('-1,4/5', false, '$\\frac{-1{,}4}{5}=-0{,}28$ .'),
];

/* ── ex-22 : classer (naturel / relatif entier négatif / décimal non entier / ناطق غير عشري) ──────────────────── */
export const CLASSES = ['عدد طبيعي', 'عدد صحيح نسبي سالب', 'عدد عشري غير صحيح', 'ناطق غير عشري'];
const cls = (w, kind, correction) => ({ w, kind, label: M(w), options: CLASSES, correct: ['nat', 'neg', 'dec', 'non'].indexOf(kind), correction });
export const CLASSIFY = [
  cls('12/-4', 'neg', '$\\frac{12}{-4}=-3$ : عدد صحيح نسبي سالب.'),
  cls('4,5/9', 'dec', '$4{,}5\\div9=0{,}5$ : عدد عشري غير صحيح.'),
  cls('11/7', 'non', '$11\\div7$ لا تنتهي كتابته العشرية: ناطق غير عشري.'),
  cls('0,6', 'dec', '$0{,}6$ عدد عشري غير صحيح.'),
  cls('-3,25', 'dec', '$-3{,}25$ عدد عشري نسبي غير صحيح.'),
  cls('18/6', 'nat', '$\\frac{18}{6}=3$ : عدد طبيعي.'),
];

/* ── ex-23 : écrire a/b ou −a/b (a, b naturels) ──────────────────────────────────────────────────────────── */
const wr = (w, key, wrongs, at, correction) => {
  const options = [...wrongs];
  options.splice(at, 0, key);
  return { w, key, wrongs, label: M(w), options: options.map((o) => `$${o.startsWith('-') ? '-' : ''}${wtex(o.replace('-', ''))}$`), correct: at, correction };
};
export const WRITE = [
  wr('-0,35', '-7/20', ['7/20', '-7/2'], 0, '$-0{,}35=-\\frac{35}{100}=-\\frac{7}{20}$ .'),
  wr('1,5/6', '1/4', ['5/2', '1/40'], 1, '$\\frac{1{,}5}{6}=\\frac{15}{60}=\\frac{1}{4}$ .'),
  wr('-3,6/0,4', '-9', ['9', '-1/9'], 2, '$\\frac{-3{,}6}{0{,}4}=\\frac{-36}{4}=-9$ .'),
  wr('2,4/1,6', '3/2', ['2/3', '4/5'], 0, '$\\frac{2{,}4}{1{,}6}=\\frac{24}{16}=\\frac{3}{2}$ .'),
];

/* ── ex-26 + deep-56 : un entier et une fraction plus petite que 1 (nombres POSITIFS) ──────────────────────── */
const intfrac = (w, [k, a, b], wrongs, at) => {
  const key = `${k}+\\frac{${a}}{${b}}`;
  const options = [...wrongs];
  options.splice(at, 0, key);
  return { w, parts: [k, a, b], key, wrongs, label: M(w), options: options.map((o) => `$${o}$`), correct: at, correction: `$${wtex(w)}=${key}$ ، لأنّ $${k}\\times${b}+${a}=${w.split('/')[0]}$ .` };
};
export const INTFRAC = [
  intfrac('17/5', [3, 2, 5], ['2+\\frac{7}{5}', '3+\\frac{1}{5}'], 0),
  intfrac('23/6', [3, 5, 6], ['4+\\frac{1}{6}', '3+\\frac{2}{6}'], 2),
  intfrac('41/9', [4, 5, 9], ['3+\\frac{14}{9}', '4+\\frac{4}{9}'], 1),
];
export const WHY_NOT_DECIMAL = { w: '41/9', options: ['لأنّ المقام $9=3\\times3$ فيه عامل أوّلي غير $2$ و $5$ ، ولا يُختزل الكسر', 'لأنّ $41$ عدد أوّلي', 'لأنّ $41$ أكبر من $9$'], correct: 0 };

/* ── ex-27 : comparer deux nombres ناطقة (symbole) ──────────────────────────────────────────────────────────── */
const cmpRow = (a, b, key, correction) => ({ a, b, key, label: `${M(a)} ؟ ${M(b)}`, options: ['$>$', '$<$', '$=$'], correct: ['>', '<', '='].indexOf(key), correction });
export const COMPARE = [
  cmpRow('-7/12', '-5/8', '>', '$24$ : $-\\frac{14}{24}$ و $-\\frac{15}{24}$ ، و $-14>-15$ .'),
  cmpRow('5/-6', '-7/9', '<', '$18$ : $-\\frac{15}{18}$ و $-\\frac{14}{18}$ ، و $-15<-14$ .'),
  cmpRow('-0,9/6', '-1/8', '<', '$24$ : $\\frac{-3{,}6}{24}$ و $\\frac{-3}{24}$ ، و $-3{,}6<-3$ .'),
  cmpRow('-11/16', '-17/24', '>', '$48$ : $-\\frac{33}{48}$ و $-\\frac{34}{48}$ ، و $-33>-34$ .'),
];
/** ex-28 (cite self-9) : égaux ou non ? */
export const EQUAL = [
  cmpRow('10,5/-7', '-4,5/3', '=', 'كلاهما يساوي $-1{,}5$ : $\\frac{10{,}5}{-7}=-1{,}5$ و $\\frac{-4{,}5}{3}=-1{,}5$ .'),
  cmpRow('-1,2/1,8', '4/-6', '=', 'كلاهما يساوي $-\\frac{2}{3}$ .'),
  cmpRow('15/-20', '-7/10', '<', '$20$ : $-\\frac{15}{20}$ و $-\\frac{14}{20}$ ، و $-15<-14$ .'),
];
/** self-10 : vrai ou faux. */
export const TRUEFALSE = [
  { a: '-2/9', op: '<', b: '-1/9', answer: true, why: 'نكتب بالمقام نفسه $9$ : $-2<-1$ .' },
  { a: '-2/9', op: '>', b: '-2/7', answer: true, why: '$63$ : $-\\frac{14}{63}$ و $-\\frac{18}{63}$ ، و $-14>-18$ .' },
  { a: '-2/9', op: '>', b: '-1/9', answer: false, why: '$-2<-1$ ، فالعدد $-\\frac{2}{9}$ أصغر.' },
];
/** ex-30 (cite ex-31, ex-33) : ranger. */
export const ORDER = {
  list: ['-7/4', '1,3', '-3/2', '9/5', '-2'],
  key: ['-2', '-7/4', '-3/2', '1,3', '9/5'],
  wrongs: [['-3/2', '-7/4', '-2', '1,3', '9/5'], ['-2', '-3/2', '-7/4', '1,3', '9/5']],
  at: 1,
};
const chain = (ws) => `$${ws.map(wtex).join('<')}$`;
/** deep-69 / ex-32 : −1/3 entre −1/2 et −1/6. */
export const MIDWAY = { lo: '-1/2', mid: '-1/3', hi: '-1/6', options: ['في منتصف المسافة بينهما تمامًا', 'أقرب إلى $-\\frac{1}{2}$', 'أقرب إلى $-\\frac{1}{6}$'], correct: 0 };

const rows = (list) => list.map(({ label, options, correct, correction }) => ({ label, options, correct, correction }));

export const EXERCISES = [
  {
    id: 'act-5', source: S('act-5', 25, 'أنشطة'), cites: [], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'أيّ حواصل القسمة التالية عدد عشري؟ اختر كتابته العشرية، أو قيمته المقرّبة بالنقصان إلى $0{,}01$ إن لم يكن عشريًّا:',
    interaction: 'batch',
    question: { rows: rows(DECIMALS.map((r) => ({ ...r, options: r.options.map((o) => o.t) }))), explain: 'نقسم البسط على المقام: إن انتهت الكتابة فالعدد عشري، وإلا أخذنا قيمة مقرّبة.' },
    commonError: 'ظنّ العدد السالب غير عشري، أو إهمال الفاصلة.',
  },
  {
    id: 'act-5-signs', source: S('act-5', 25, 'أنشطة'), cites: [], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'حدّد إشارة كلّ حاصل قسمة دون أن تحسبه:',
    interaction: 'batch',
    question: { rows: rows(SIGNS1), explain: 'حاصل قسمة عددين لهما الإشارة نفسها موجب، ومختلفي الإشارة سالب.' },
    commonError: 'ظنّ إشارتين سالبتين تعطيان عددًا سالبًا.',
  },
  {
    id: 'ex-22', source: S('ex-22', 31), cites: [], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'صنّف كلّ عدد في أخصّ فئة له:',
    interaction: 'batch',
    question: { rows: rows(CLASSIFY), explain: 'نبسّط العدد أوّلًا ثمّ نحكم على كتابته.' },
    commonError: 'اعتبار العدد الناطق غير العشري «ليس عددًا».',
  },
  {
    id: 'ex-23', source: S('ex-23', 31), cites: [], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'اكتب كلّ عدد ناطق على الشكل $\\frac{a}{b}$ أو $-\\frac{a}{b}$ حيث $a$ و $b$ عددان طبيعيان:',
    interaction: 'batch',
    question: { rows: rows(WRITE), explain: 'نحذف الفاصلة بضرب البسط والمقام في $10$ أو $100$ ثمّ نختزل.' },
    commonError: 'إسقاط الإشارة أو قلب الكسر.',
  },
  {
    id: 'ex-24', source: S('ex-24', 31), cites: [], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'حدّد إشارة كلّ عدد ناطق:',
    interaction: 'batch',
    question: { rows: rows(SIGNS2), explain: 'نعدّ الإشارتين السالبتين في البسط وفي المقام.' },
    commonError: 'إسقاط إحدى الإشارتين.',
  },
  {
    id: 'ex-26', source: S('ex-26', 31), cites: [], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'اكتب كلّ عدد على شكل مجموع عدد طبيعي وكسر أصغر من $1$ :',
    interaction: 'batch',
    question: { rows: rows(INTFRAC), explain: 'نقسم البسط على المقام: الحاصل هو العدد الطبيعي والباقي بسط الكسر.' },
    commonError: 'ترك كسر أكبر من $1$ .',
  },
  {
    id: 'deep-56', source: S('deep-56', 34, 'أتعمّق'), cites: [], learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'لماذا العدد $\\frac{41}{9}$ ليس عشريًّا؟',
    interaction: 'choice',
    question: { options: WHY_NOT_DECIMAL.options, correct: WHY_NOT_DECIMAL.correct, cols: 1, explain: 'الكسر المختزل يكون عشريًّا إذا لم يكن في مقامه إلا العاملان $2$ و $5$ ؛ و $9=3\\times3$ .' },
    commonError: 'البحث عن العلّة في البسط.',
  },
  {
    id: 'ex-27', source: S('ex-27', 31), cites: [], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'قارن بين كلّ عددين ناطقين بكتابتهما بالمقام الموجب نفسه:',
    interaction: 'batch',
    question: { rows: rows(COMPARE), explain: 'بمقام موجب مشترك نقارن البسطين: على يسار الصفر الأبعد عن الصفر أصغر.' },
    commonError: 'مقارنة المقامين أو اعتبار الأبعد عن الصفر أكبر.',
  },
  {
    id: 'ex-30', source: S('ex-30', 31), cites: [S('ex-31', 31), S('ex-33', 32)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'رتّب تصاعديًّا (بالمقام $20$ ) الأعداد $-\\frac{7}{4}$ ، $1{,}3$ ، $-\\frac{3}{2}$ ، $\\frac{9}{5}$ ، $-2$ :',
    interaction: 'choice',
    question: {
      options: (() => { const o = [...ORDER.wrongs.map(chain)]; o.splice(ORDER.at, 0, chain(ORDER.key)); return o; })(), correct: ORDER.at, cols: 1,
      explain: 'بالمقام $20$ : $-\\frac{40}{20}$ ، $-\\frac{35}{20}$ ، $-\\frac{30}{20}$ ، $\\frac{26}{20}$ ، $\\frac{36}{20}$ ؛ ثمّ نرتّب البسوط.',
    },
    commonError: 'ترتيب الأعداد السالبة حسب بعدها عن الصفر.',
  },
  {
    id: 'ex-28', source: S('ex-28', 31), cites: [S('self-9', 33, 'أؤكّد تعلّماتي')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'ادرس في كلّ حالة: هل العددان متساويان؟ وإلا فأيّهما أصغر؟',
    interaction: 'batch',
    question: { rows: rows(EQUAL), explain: 'نكتب العددين بمقام موجب مشترك ونقارن البسطين.' },
    commonError: 'الحكم بالاختلاف من اختلاف الكتابتين.',
  },
  {
    id: 'self-10', source: S('self-10', 33, 'أؤكّد تعلّماتي'), cites: [], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'صحيح أم خطأ؟',
    interaction: 'trueFalse',
    question: { rows: TRUEFALSE.map((r) => ({ text: `$${wtex(r.a)}${r.op}${wtex(r.b)}$`, answer: r.answer, why: r.why })), explain: 'نكتب العددين بمقام موجب مشترك.' },
    commonError: 'اعتبار الأبعد عن الصفر أكبر.',
  },
  {
    id: 'deep-69', source: S('deep-69', 34, 'أتعمّق'), cites: [S('ex-32', 32)], learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'على حبل مدرّج عُلّم عليه العددان $-\\frac{1}{2}$ و $-\\frac{1}{6}$ ، أين يقع $-\\frac{1}{3}$ ؟',
    interaction: 'choice',
    question: { options: MIDWAY.options, correct: MIDWAY.correct, cols: 1, explain: 'بالأسداس: $-\\frac{3}{6}$ ، $-\\frac{2}{6}$ ، $-\\frac{1}{6}$ : العدد $-\\frac{2}{6}$ في المنتصف.' },
    commonError: 'تقدير المسافة من المقامين فقط.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/**
 * Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `truth` : ce que le test recalcule.
 */
export const FINAL = [
  { id: 'E1', lp: LP.P2, source: null, prompt: 'أيّ عدد يساوي $\\frac{9}{-12}$ ؟', options: ['$-\\frac{3}{4}$', '$\\frac{3}{4}$', '$\\frac{4}{3}$', '$-\\frac{12}{9}$'], correct: 0, truth: { kind: 'equal', w: '9/-12' } },
  { id: 'E2', lp: LP.P2, source: null, prompt: '$\\frac{-14}{-6}=$', options: ['$\\frac{7}{3}$', '$-\\frac{7}{3}$', '$-\\frac{3}{7}$', '$\\frac{3}{7}$'], correct: 0, truth: { kind: 'equal', w: '-14/-6' } },
  { id: 'E3', lp: LP.P3, source: null, prompt: 'يقع العدد $-\\frac{11}{4}$ بين', options: ['$-3$ و $-2$', '$-2$ و $-1$', '$2$ و $3$', '$-4$ و $-3$'], correct: 0, truth: { kind: 'between', w: '-11/4' } },
  { id: 'E4', lp: LP.P3, source: null, prompt: 'الترتيب التصاعدي للأعداد $-\\frac{5}{6}$ ، $-\\frac{3}{4}$ ، $-\\frac{2}{3}$ هو', options: ['$-\\frac{5}{6}<-\\frac{3}{4}<-\\frac{2}{3}$', '$-\\frac{2}{3}<-\\frac{3}{4}<-\\frac{5}{6}$', '$-\\frac{3}{4}<-\\frac{5}{6}<-\\frac{2}{3}$'], correct: 0, truth: { kind: 'ascending', ws: ['-5/6', '-3/4', '-2/3'] } },
  { id: 'E5', lp: LP.P1, source: null, prompt: 'أيّ هذه الأعداد ليس عشريًّا؟', options: ['$\\frac{5}{12}$', '$\\frac{7}{8}$', '$-\\frac{9}{20}$', '$-\\frac{13}{25}$'], correct: 0, truth: { kind: 'notDecimal', ws: ['5/12', '7/8', '-9/20', '-13/25'] } },
];
