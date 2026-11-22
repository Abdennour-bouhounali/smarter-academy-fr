/**
 * Les exercices du درس « مقارنة عددين ناطقين » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, autres contextes, la même compétence). Chaque exercice porte en `source`
 * l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` muet, `src()` sans `number`).
 * Les lignes de calcul sont des DONNÉES : `data: { kind, … }` ; les options sont écrites avec les petits outils de mise en forme ci-dessous (fractions « p/q » → LaTeX) et ./content.test.js RECALCULE
 * chaque clé avec une arithmétique de rationnels BigInt écrite à part (jamais le cœur) et vérifie que chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit4/extraction.json) : act-5, ex-27…ex-32, now-61 ②, self-9, self-10, deep-38 → module 4 ; know-5 → module 2 ; method-5 → module 3 ; les épreuves du إختبار أولي sont de la plateforme.
 */
import { src } from '../../_unit/unitMeta.js';
import { parseDec } from '@smarter-academy/core';

/** Une saisie signée : la virgule décimale, le vrai moins et les chiffres arabes-indiens sont acceptés. */
export const parseNum = (str) => parseDec(String(str).replace(/[−–]/g, '-'));

export const LP = {
  P1: '3am_muqaranat-natiqayn_P1',
  P2: '3am_muqaranat-natiqayn_P2',
  P3: '3am_muqaranat-natiqayn_P3',
};

/* ── Outils de rédaction ───────────────────────────────────────────────────────────────────────── */
const big = (s) => BigInt(s);
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const fr = (s) => { const [n, d = '1'] = String(s).split('/'); let N = big(n); let D = big(d); if (D < 0n) { N = -N; D = -D; } const g = gcd(N, D); return { n: N / g, d: D / g }; };
const sub = (x, y) => { const p = fr(x); const q = fr(y); return { n: p.n * q.d - q.n * p.d, d: p.d * q.d }; };
const reduce = (f) => { const g = gcd(f.n, f.d); let n = f.n / g; let d = f.d / g; if (d < 0n) { n = -n; d = -d; } return { n, d }; };
const txt = (f) => (f.d === 1n ? `${f.n}` : `${f.n}/${f.d}`);
/** « p/q » ou entier → LaTeX ; le moins devant la fraction. */
export const T = (s) => { const f = typeof s === 'string' || typeof s === 'number' ? fr(s) : s; const a = f.n < 0n ? -f.n : f.n; return f.d === 1n ? `${f.n}` : `${f.n < 0n ? '-' : ''}\\frac{${a}}{${f.d}}`; };
const M = (tex) => `$${tex}$`;
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction, data) => ({ label, ...place(right, wrongs, at), correction, data });
/** Un nombre entre parenthèses dans une écriture si négatif : « (−\frac16) » pour une soustraction. */
const paren = (s) => (fr(s).n < 0n ? `\\left(${T(s)}\\right)` : T(s));

/** « a − b » de deux fractions : la phrase juste et deux distracteurs (l'ordre inversé ; la différence faite en soustrayant les termes). */
function diffRow(a, b, at, { names = ['a', 'b'] } = {}) {
  const [na, nb] = names;
  const d = reduce(sub(a, b));
  const A = fr(a); const B = fr(b);
  const order = d.n > 0n ? '>' : '<';
  const flip = order === '>' ? '<' : '>';
  const dTex = T(d);
  const terms = reduce({ n: A.n - B.n, d: A.d - B.d });          // les termes soustraits (jamais nuls ici)
  const right = `$${na}-${nb}=${dTex}$ إذن $${na}${order}${nb}$`;
  const wrongOrder = `$${na}-${nb}=${dTex}$ إذن $${na}${flip}${nb}$`;
  const wrongTerms = `$${na}-${nb}=${T(terms)}$ إذن $${na}${terms.n > 0n ? '>' : '<'}${nb}$`;
  return row(`$${na}=${T(a)}$ و $${nb}=${T(b)}$`, right, [wrongOrder, wrongTerms], at, `${diffLine(a, b)} ${order === '>' ? 'موجب' : 'سالب'}: $${na}${order}${nb}$.`, { kind: 'diff', a: String(a), b: String(b), key: txt(d), order });
}
/** Le calcul « p/q − r/s = (…)/(…) = d » en LaTeX (dénominateur commun : le produit des dénominateurs). */
function diffLine(a, b) {
  const A = fr(a); const B = fr(b);
  const D = A.d * B.d;
  const nA = A.n * B.d; const nB = B.n * A.d;
  const top = nA - nB;
  const d = reduce({ n: top, d: D });
  const unreduced = `${top < 0n ? '-' : ''}\\frac{${top < 0n ? -top : top}}{${D}}`;
  const same = d.d === D && d.n === top;
  return `$${T(a)}-${paren(b)}=\\frac{${nA}-${nB < 0n ? `(${nB})` : nB}}{${D}}=${unreduced}${same ? '' : `=${T(d)}`}$ ،`;
}

/** Les cartes d'ordre à partir d'une « différence connue » : trois options a>b, a<b, a=b. */
const ORDER_OPTS = ['$a>b$', '$a<b$', '$a=b$'];
const knownRow = (label, key, data) => ({ label: M(label), options: ORDER_OPTS, correct: ['>', '<', '='].indexOf(key), correction: data.fix, data: { kind: 'known', key, ...data } });

/* ── act-5 → E1 : cinq paires dont l'œil ne départage pas la première ────────────────────────────── */
export const PAIRS_E1 = [['4/5', '3/4'], ['5/6', '7/8'], ['-7/4', '2/9'], ['-2/9', '-3/5'], ['-4/3', '-3/8']];
export const ROWS_E1 = PAIRS_E1.map(([a, b], i) => diffRow(a, b, [0, 1, 2, 1, 0][i]));
export const FIGURE_E1 = {
  points: { a: [0.8, 0], b: [0.75, 0], u: [1, 0], z: [0, 0] },
  axes: { every: 1 },
  labels: { a: 'n', b: 's', u: 'n', z: 'sw' },
  ariaLabel: 'مستقيم مدرّج عليه العددان 4/5 و 3/4 متجاوران جدًّا قرب العدد 1',
  maxWidth: 360,
};

/* ── ex-27 → E2 : l'ordre lu sur la différence SEULE ──────────────────────────────────────────────── */
export const ROWS_E2 = [
  knownRow('a-b=0{,}04', '>', { left: 'a', value: '4/100', fix: 'الفرق $a-b$ موجب، فـ $a>b$.' }),
  knownRow('a-b=-\\frac73', '<', { left: 'a', value: '-7/3', fix: 'الفرق $a-b$ سالب، فـ $a<b$.' }),
  knownRow('b-a=5', '<', { left: 'b', value: '5', fix: 'الفرق $b-a$ موجب، فـ $b>a$ أي $a<b$.' }),
  knownRow('b-a=-10^{-3}', '>', { left: 'b', value: '-1/1000', fix: 'الفرق $b-a$ سالب، فـ $b<a$ أي $a>b$ ؛ العدد $-10^{-3}$ هو $-\\frac1{1000}$.' }),
  knownRow('a-b=0', '=', { left: 'a', value: '0', fix: 'الفرق معدوم، فـ $a=b$.' }),
  knownRow('a-b\\geq2', '>', { left: 'a', bound: '2', dir: '>=', fix: 'الفرق $a-b$ أكبر من $2$ أو يساويه فهو موجب، فـ $a>b$.' }),
];

/* ── ex-28 → E3 : le signe de x − y d'abord, puis la valeur ──────────────────────────────────────── */
export const PAIRS_E3 = [['15', '6'], ['-4', '-10'], ['-13', '2'], ['5', '-7']];
const SIGNS = ['موجبة', 'سالبة', 'معدومة'];
const signRow = (x, y) => {
  const d = Number(x) - Number(y);
  return { label: `$x=${x}$ و $y=${y}$ : إشارة $x-y$ دون حسابه`, options: SIGNS, correct: d > 0 ? 0 : d < 0 ? 1 : 2, correction: `${Number(x) > Number(y) ? `$${x}$ أكبر من $${y}$` : `$${x}$ أصغر من $${y}$`}، فالفرق ${d > 0 ? 'موجب' : 'سالب'}.`, data: { kind: 'sign', x, y, key: d > 0 ? '+' : d < 0 ? '-' : '0' } };
};
const valRow = (x, y, wrongs, at) => {
  const d = Number(x) - Number(y);
  const px = Number(x) < 0 ? `(${x})` : x; const py = Number(y) < 0 ? `(${y})` : y;
  return row(`قيمة $x-y$ من أجل $x=${x}$ و $y=${y}$ :`, M(String(d)), wrongs.map((w) => M(String(w))), at, `$${px}-${py}=${d}$.`, { kind: 'num', expr: `${x}-(${y})`, key: String(d) });
};
export const ROWS_E3 = [
  signRow('15', '6'), valRow('15', '6', [-9, 21], 0),
  signRow('-4', '-10'), valRow('-4', '-10', [-6, -14], 1),
  signRow('-13', '2'), valRow('-13', '2', [15, -11], 2),
  signRow('5', '-7'), valRow('5', '-7', [-12, -2], 0),
];

/* ── ex-30, now-61 ② → E4 : quatre paires de fractions, une de signes contraires ─────────────────── */
export const PAIRS_E4 = [['6/11', '7/13'], ['-9/10', '-8/9'], ['13/15', '-1/6'], ['5/6', '7/9']];
export const ROWS_E4 = PAIRS_E4.map(([a, b], i) => diffRow(a, b, [1, 2, 0, 1][i], { names: ['a', 'b'] }));

/* ── ex-29, ex-31 → E5 : à la calculatrice, deux quotients ou une seule différence ───────────────── */
export const ROWS_E5 = [
  row('قيمة الفرق $\\frac{47{,}3}{6{,}98}-\\frac{20{,}85}{3{,}08}$ تظهر على الشاشة تقريبًا:', '$0{,}0070$', ['$0{,}7$', '$-0{,}0070$'], 0,
    'الخارجان $6{,}7765\\ldots$ و $6{,}7694\\ldots$ قريبان جدًّا؛ أمّا الفرق فهو $\\frac{755}{107492}\\approx0{,}0070$.', { kind: 'calc', a: '2365/349', b: '2085/308', key: '755/107492', approx: '0.0070' }),
  row('ماذا نستنتج من إشارة هذا الفرق؟', 'العدد الأوّل $\\frac{47{,}3}{6{,}98}$ أكبر من الثاني', ['العدد الثاني أكبر من الأوّل', 'العددان متساويان لأنّ الفرق صغير'], 1,
    'الفرق موجب فـ $a>b$ ؛ والفرق الصغير ليس معدومًا.', { kind: 'text' }),
  row('أيّ الشاشتين تكفي لنحكم بسرعة؟', 'شاشة الفرق: تكفي إشارتها وحدها', ['شاشتا الخارجين: الفرق لا يعطي شيئًا', 'لا تكفي أيّ منهما'], 2,
    'الخارجان يتّفقان في ثلاثة أرقام فيلزم قراءتها كلها؛ أمّا الفرق فتكفي فيه إشارة واحدة.', { kind: 'text' }),
];

/* ── self-9, self-10 → E6 : un multiple de π, une fraction et un quotient décimal ────────────────── */
export const ROWS_E6 = [
  row('قيمة $a-b$ من أجل $a=\\frac\\pi4$ و $b=\\frac\\pi5$ :', '$\\frac{\\pi}{20}$', ['$-\\frac{\\pi}{20}$', '$\\frac{\\pi}{9}$'], 0,
    '$\\frac\\pi4-\\frac\\pi5=\\frac{5\\pi-4\\pi}{20}=\\frac\\pi{20}$.', { kind: 'pi', key: '1/20' }),
  row('ماذا نستنتج دون تقريب $\\pi$ ؟', '$a>b$ لأنّ $\\frac{\\pi}{20}>0$', ['$a<b$ لأنّ $\\pi$ كبير', 'لا يمكن الحكم دون القيمة المقرّبة لـ $\\pi$'], 2,
    '$\\pi>0$ فـ $\\frac\\pi{20}>0$ : لا نحتاج إلى قيمة $\\pi$.', { kind: 'text' }),
  row('قيمة $\\frac5{17}-\\frac{0{,}88}{3}$ هي', '$\\frac1{1275}$', ['$-\\frac1{1275}$', '$\\frac{4{,}12}{14}$'], 1,
    '$\\frac{0{,}88}{3}=\\frac{22}{75}$ و $\\frac5{17}-\\frac{22}{75}=\\frac{375-374}{1275}=\\frac1{1275}$.', { kind: 'diff', a: '5/17', b: '22/75', key: '1/1275', order: '>' }),
  row('فأيّ العددين أكبر؟', '$\\frac5{17}$', ['$\\frac{0{,}88}{3}$', 'متساويان'], 0,
    'الفرق موجب: $\\frac5{17}>\\frac{0{,}88}{3}$.', { kind: 'text' }),
];

/* ── ex-32 → E7 : deux expressions de x : des valeurs, A − B simplifiée, la région ────────────────── */
const exprRow = (name, expr, x, key, wrongs, at, why) => row(`قيمة $${name}=${expr.tex}$ من أجل $x=${x}$ :`, M(key), wrongs.map(M), at, why, { kind: 'exprvalue', expr: expr.src, x, key });
const A7 = { src: '6x-5', tex: '6x-5' }; const B7 = { src: '5x+1', tex: '5x+1' };
export const ROWS_E7 = [
  exprRow('A', A7, '0', '-5', ['5', '-6'], 0, '$6\\times0-5=-5$.'),
  exprRow('B', B7, '0', '1', ['0', '-1'], 1, '$5\\times0+1=1$.'),
  exprRow('A', A7, '6', '31', ['41', '-31'], 2, '$6\\times6-5=36-5=31$.'),
  exprRow('B', B7, '6', '31', ['41', '25'], 0, '$5\\times6+1=31$ : القيمتان متساويتان.'),
  exprRow('A', A7, '8', '43', ['53', '48'], 1, '$6\\times8-5=48-5=43$.'),
  exprRow('B', B7, '8', '41', ['39', '40'], 2, '$5\\times8+1=41$.'),
  row('بعد التبسيط: $A-B=$', '$x-6$', ['$11x-4$', '$x+6$'], 0, '$6x-5-(5x+1)=6x-5-5x-1=x-6$ ؛ نغيّر إشارة كل حدّ داخل القوسين.', { kind: 'poly', expr: '(6x-5)-(5x+1)', key: 'x-6' }),
  row('متى تكون $A>B$ ؟', 'عندما $x>6$', ['عندما $x<6$', 'من أجل كل قيمة لـ $x$'], 1, '$x-6>0$ تعني $x>6$ ؛ ومن أجل $x=6$ فالقيمتان $31$ و $31$.', { kind: 'region', a: '6x-5', b: '5x+1', key: 'x>6' }),
];

/* ── deep-38 → E8 : un rectangle et un carré en x : mêmes périmètres, aires qui diffèrent de 4 ───── */
export const FIGURE_E8 = {
  points: { R1: [0, 0], R2: [7, 0], R3: [7, 3], R4: [0, 3], S1: [9, 0], S2: [14, 0], S3: [14, 5], S4: [9, 5] },
  segments: [{ from: 'R1', to: 'R2', label: 'x + 5' }, { from: 'R2', to: 'R3', label: 'x + 1' }, ['R3', 'R4'], ['R4', 'R1'], { from: 'S1', to: 'S2', label: 'x + 3' }, ['S2', 'S3'], ['S3', 'S4'], ['S4', 'S1']],
  polygons: [{ points: ['R1', 'R2', 'R3', 'R4'], tone: 'sky' }, { points: ['S1', 'S2', 'S3', 'S4'], tone: 'amber' }],
  ariaLabel: 'مستطيل بعداه x + 5 و x + 1 ومربع طول ضلعه x + 3 مرسومان من أجل x = 2',
  maxWidth: 420,
};
export const ROWS_E8 = [
  row('محيط المستطيل $2[(x+5)+(x+1)]$ يساوي', '$4x+12$', ['$4x+6$', '$2x+12$'], 0, '$2(2x+6)=4x+12$.', { kind: 'poly', expr: '2((x+5)+(x+1))', key: '4x+12' }),
  row('محيط المربع $4(x+3)$ يساوي', '$4x+12$', ['$4x+3$', '$x+12$'], 1, '$4x+12$.', { kind: 'poly', expr: '4(x+3)', key: '4x+12' }),
  row('الفرق بين المحيطين:', '$0$', ['$12$', '$4$'], 2, '$(4x+12)-(4x+12)=0$ : المحيطان متساويان من أجل كل $x$.', { kind: 'poly', expr: '(4x+12)-(4x+12)', key: '0' }),
  row('مساحة المستطيل $(x+5)(x+1)$ بعد النشر:', '$x^2+6x+5$', ['$x^2+5$', '$x^2+6x+6$'], 1, '$x^2+x+5x+5=x^2+6x+5$.', { kind: 'poly', expr: '(x+5)(x+1)', key: 'x^2+6x+5' }),
  row('مساحة المربع $(x+3)^2$ بعد النشر:', '$x^2+6x+9$', ['$x^2+9$', '$x^2+3x+9$'], 2, '$(x+3)(x+3)=x^2+3x+3x+9=x^2+6x+9$.', { kind: 'poly', expr: '(x+3)(x+3)', key: 'x^2+6x+9' }),
  row('فرق المساحتين (المستطيل − المربع):', '$-4$', ['$4$', '$0$'], 0, '$(x^2+6x+5)-(x^2+6x+9)=5-9=-4$ : مساحة المربع أكبر بـ $4$ دائمًا.', { kind: 'poly', expr: '(x^2+6x+5)-(x^2+6x+9)', key: '-4' }),
  row('قالت سلمى: «لهما المحيط نفسه دائمًا»، وقال أمين: «لهما المساحة نفسها دائمًا». من على حق؟', 'سلمى: المحيطان متساويان دائمًا، والمربع أكبر مساحة بـ $4$ دائمًا', ['أمين: المساحتان متساويتان دائمًا', 'كلاهما مخطئ'], 1,
    'فرق المحيطين $0$ وفرق المساحتين $-4$ : سلمى على حق.', { kind: 'text' }),
];

export const EXERCISES = [
  {
    id: 'act-5', source: src('act-5', 57, 'أنشطة', 5), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'في كل حالة احسب الفرق $a-b$ واستنتج الترتيب ثم اختر الجملة الصحيحة. المستقيم المدرّج لا يفصل بين العددين الأوّلين.',
    interaction: 'batch',
    question: { rows: ROWS_E1, explain: 'نحسب الفرق ثم نقرأ إشارته: موجب فـ $a>b$ ، وسالب فـ $a<b$.' },
    commonError: 'طرح البسطين وطرح المقامين، أو قراءة إشارة الفرق معكوسة.',
    figure: FIGURE_E1,
  },
  {
    id: 'ex-27', source: src('ex-27', 64, 'مقارنة عددين ناطقين', 27), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'في كل حالة لا نعرف $a$ ولا $b$ ، بل فرقهما فقط. قارن $a$ و $b$.',
    interaction: 'batch',
    question: { rows: ROWS_E2, explain: 'إشارة الفرق وحدها تكفي لنعرف الترتيب.' },
    commonError: 'قراءة إشارة $b-a$ كأنها إشارة $a-b$.',
  },
  {
    id: 'ex-28', source: src('ex-28', 64, 'مقارنة عددين ناطقين', 28), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'في كل حالة قارن $x$ و $y$ لتعرف إشارة $x-y$ دون حسابه، ثم تحقّق بحسابه.',
    interaction: 'batch',
    question: { rows: ROWS_E3, explain: 'إذا كان $x>y$ فالفرق $x-y$ موجب، وإذا كان $x<y$ فهو سالب.' },
    commonError: 'الظنّ أنّ الأبعد عن الصفر هو الأكبر مع الأعداد السالبة.',
  },
  {
    id: 'ex-30', source: src('ex-30', 64, 'مقارنة عددين ناطقين', 30), cites: [src('now-61', 61, 'دوري الآن', 2)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'قارن العددين الناطقين في كل حالة بحساب فرقهما.',
    interaction: 'batch',
    question: { rows: ROWS_E4, explain: 'نوحّد المقامين فنحسب الفرق ثم نقرأ إشارته.' },
    commonError: 'طرح البسطين وطرح المقامين.',
  },
  {
    id: 'ex-29', source: src('ex-29', 64, 'مقارنة عددين ناطقين', 29), cites: [src('ex-31', 64, 'مقارنة عددين ناطقين', 31)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'مع الآلة الحاسبة: نريد مقارنة $\\frac{47{,}3}{6{,}98}$ و $\\frac{20{,}85}{3{,}08}$. يقسم زميلك كل عدد على حدة، وتحسب أنت الفرق مرة واحدة.',
    interaction: 'batch',
    question: { rows: ROWS_E5, explain: 'الفرق يختصر القراءة في إشارة واحدة، والخارجان يلزم فيهما مقارنة عدّة أرقام.' },
    commonError: 'الحكم بالتساوي لأنّ الفرق صغير.',
  },
  {
    id: 'self-9', source: src('self-9', 65, 'أؤكّد تعلّماتي', 9), cites: [src('self-10', 65, 'أؤكّد تعلّماتي', 10)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'قارن بحساب الفرق: عددين فيهما $\\pi$ ثم عددًا كسريًا وعددًا عشريًا.',
    interaction: 'batch',
    question: { rows: ROWS_E6, explain: 'لا نقرّب $\\pi$ : الفرق $\\frac\\pi{20}$ موجب بوضوح.' },
    commonError: 'تقريب $\\pi$ قبل الحساب فتضيع الدقة.',
  },
  {
    id: 'ex-32', source: src('ex-32', 64, 'مقارنة عددين ناطقين', 32), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'لتكن $A=6x-5$ و $B=5x+1$. احسب القيمتين من أجل ثلاث قيم لـ $x$ ، ثم بسّط $A-B$ واقرأ إشارته.',
    interaction: 'batch',
    question: { rows: ROWS_E7, explain: 'نبسّط $A-B$ فنجد $x-6$ ؛ إشارته تقول أيّ العبارتين أكبر حسب قيم $x$.' },
    commonError: 'الظنّ أنّ العبارة ذات المعامل الأكبر هي الأكبر دائمًا.',
  },
  {
    id: 'deep-38', source: src('deep-38', 66, 'أتعمّق', 38), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'من أجل $x>0$ ارسم مستطيلًا بعداه $x+5$ و $x+1$ ومربعًا طول ضلعه $x+3$. قارن محيطيهما ثم مساحتيهما بإشارة الفرق.',
    interaction: 'batch',
    question: { rows: ROWS_E8, explain: 'فرق المحيطين $0$ وفرق المساحتين ثابت $-4$ : إشارته لا تتغيّر مع $x$.' },
    commonError: 'الاكتفاء بقيمة واحدة لـ $x$ والتعميم.',
    figure: FIGURE_E8,
  },
];

/** « أؤكّد تعلّماتي » 9–10 (p. 65) — la source de deux épreuves du إختبار أولي (module 8) est de la plateforme ; ces éléments sont cités par le module 4. */
export const SELF = { 9: { source: src('self-9', 65, 'أؤكّد تعلّماتي', 9) }, 10: { source: src('self-10', 65, 'أؤكّد تعلّماتي', 10) } };

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque distracteur FAUX. `claims` : pour chaque option, l'énoncé qu'elle porte
 * (`diff`, `order`) — l'option juste est la seule dont les deux affirmations sont vraies.
 */
export const FINAL = [
  { id: 'E1', skill: 'known', lp: LP.P1, kind: 'known', left: 'a', value: '-1/5', stem: 'إذا كان $a-b=-0{,}2$ فإنّ',
    options: ['$a<b$', '$a>b$ لأنّ $0{,}2$ موجب', 'لا نستطيع الحكم دون معرفة $a$ و $b$', '$a=b$'], correct: 0, cols: 2,
    explain: 'الفرق $a-b$ سالب، إذن $a<b$ ؛ وإشارته وحدها تكفي.' },
  { id: 'E2', skill: 'frac', lp: LP.P2, kind: 'cmp', a: '5/6', b: '7/9', stem: 'لمقارنة العددين $\\frac56$ و $\\frac79$ :',
    options: ['$\\frac56-\\frac79=\\frac1{18}>0$ ، إذن $\\frac56>\\frac79$', '$\\frac56-\\frac79=\\frac{-2}{-3}$ ، إذن $\\frac56>\\frac79$', '$\\frac56<\\frac79$ لأنّ $5<7$', '$\\frac1{18}>0$ ، إذن $\\frac56<\\frac79$'], correct: 0, cols: 1,
    claims: [{ diff: '1/18', order: '>' }, { diff: '2/3', order: '>' }, { diff: null, order: '<' }, { diff: '1/18', order: '<' }],
    explain: '$\\frac56-\\frac79=\\frac{15-14}{18}=\\frac1{18}>0$ ؛ نوحّد المقامين ولا نطرح البسطين والمقامين.' },
  { id: 'E3', skill: 'neg', lp: LP.P2, kind: 'cmp', a: '-3/4', b: '-5/7', stem: 'لمقارنة العددين $-\\frac34$ و $-\\frac57$ :',
    options: ['$-\\frac34<-\\frac57$ لأنّ الفرق $-\\frac1{28}$', '$-\\frac34>-\\frac57$ لأنّ $\\frac34>\\frac57$', 'العددان متساويان', '$-\\frac34>-\\frac57$ لأنّ الفرق $\\frac1{28}$'], correct: 0, cols: 1,
    claims: [{ diff: '-1/28', order: '<' }, { diff: null, order: '>' }, { diff: null, order: '=' }, { diff: '1/28', order: '>' }],
    explain: '$-\\frac34-\\left(-\\frac57\\right)=\\frac{-21+20}{28}=-\\frac1{28}<0$ ؛ مع العدد السالب الأبعد عن الصفر هو الأصغر.' },
  { id: 'E4', skill: 'expr', lp: LP.P3, kind: 'expr', a: '2x+7', b: 'x+10', stem: 'من أجل $x>3$ ، قارن $A=2x+7$ و $B=x+10$ :',
    options: ['$A>B$ لأنّ $A-B=x-3>0$', '$A<B$ لأنّ $A-B=x-3>0$', '$A-B=3x+17$ ، إذن $A>B$', '$A=B$ من أجل كل $x$'], correct: 0, cols: 1,
    claims: [{ diff: 'x-3', order: '>' }, { diff: 'x-3', order: '<' }, { diff: '3x+17', order: '>' }, { diff: '0', order: '=' }],
    explain: '$A-B=2x+7-x-10=x-3$ ، وهو موجب عندما $x>3$ ، إذن $A>B$.' },
  { id: 'E5', skill: 'sense', lp: LP.P1, kind: 'meaning', stem: 'إذا كان $b-a>0$ فإنّ',
    options: ['$a<b$', '$a>b$', '$a=b$', '$a$ و $b$ موجبان'], correct: 0, cols: 2,
    explain: '$b-a>0$ معناه $b>a$ أي $a<b$.' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
