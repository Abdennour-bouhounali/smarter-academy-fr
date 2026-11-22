/**
 * Les exercices du درس « المتباينات والعمليات » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque
 * exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de
 * `check:textbook`) ; `src()` sans numéro n'est jamais montré à l'élève. Les expressions sont des DONNÉES en texte simple (`x+3`, `-(1/2)m+3`),
 * écrites en LaTeX par `tx()` ; ./content.test.js lit chaque option ÉCRITE et la recalcule avec un autre code (rationnels BigInt, échantillonnage
 * de témoins) : la bonne réponse est vraie pour TOUT témoin, chaque distracteur est faux pour au moins un.
 * Destinations (docs/sources/3am/unit5/extraction.json) : act-2, act-2b, ex-6, ex-7, ex-13 … ex-17, ex-23, ex-24, ex-26 → module 4 ;
 * self-3, self-4 → le إختبار أولي (module 8). ex-8 … ex-12 et ex-18 sont citées par la banque.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_mutabayinat-amaliyat_P1',
  P2: '3am_mutabayinat-amaliyat_P2',
  P3: '3am_mutabayinat-amaliyat_P3',
  P4: '3am_mutabayinat-amaliyat_P4',
};

const S = (id, page, n) => src(id, page, 'أوظّف تعلّماتي', n);
const T = (s) => `$${s}$`;

/** Du texte simple au LaTeX : « x-1/4<=1/2 » → « x-\frac{1}{4}\leq 1/2 » etc. */
export function tx(plain) {
  return String(plain).replace(/\s+/g, '')
    .replace(/<=/g, '\\leq ').replace(/>=/g, '\\geq ')
    .replace(/(\d+)\.(\d+)/g, '$1{,}$2')
    .replace(/\((\d+)\/(\d+)\)/g, '\\frac{$1}{$2}')
    .replace(/([a-zA-Z])\/(\d+)/g, '\\frac{$1}{$2}')
    .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
}
const ineq = (plain) => T(tx(plain));
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });

/** Les symboles proposés dans les lignes « أكمل بالرمز ». */
export const SYMBOL_TEX = { '<': '$<$', '>': '$>$', '<=': '$\\leq$', '>=': '$\\geq$', none: 'لا يمكن الحكم' };

/* ── E1 : a + c, a − c (act-2, ex-6) — la bonne réponse est la borne EXACTE ─────────────────────────────────────── */
export const E1 = [
  { v: 'x', given: 'x>7', expr: 'x+3', key: 'x+3>10', wrongs: ['x+3<10', 'x+3>21', 'x+3>13'], why: 'نضيف $3$ إلى طرفي $x>7$ : $x+3>10$ .' },
  { v: 'x', given: 'x<-5', expr: 'x-2', key: 'x-2<-7', wrongs: ['x-2>-7', 'x-2<-10', 'x-2>-3'], why: 'نطرح $2$ من طرفي $x<-5$ : $x-2<-7$ .' },
  { v: 'x', given: 'x>=-4', expr: 'x+4', key: 'x+4>=0', wrongs: ['x+4<=0', 'x+4>=8', 'x+4>0'], why: 'نضيف $4$ إلى طرفي $x\\geq -4$ : $x+4\\geq 0$ ؛ و $\\geq$ تبقى $\\geq$.' },
  { v: 'x', given: 'x<=3/4', expr: 'x-1/4', key: 'x-1/4<=1/2', wrongs: ['x-1/4>=1/2', 'x-1/4<=1/4', 'x-1/4<1/2'], why: 'نطرح $\\frac{1}{4}$ من طرفي $x\\leq\\frac{3}{4}$ : $x-\\frac{1}{4}\\leq\\frac{1}{2}$ .' },
];

/* ── E2 : act-2 partie 5, « أكمل إن أمكن » : des constantes différentes peuvent rendre la comparaison indécidable ─────── */
export const E2 = {
  vars: ['a', 'b'], given: 'a<b', options: ['<', '>', 'none'],
  rows: [
    { L: 'a+2/3', R: 'b+2/3', left: 'a+\\frac{2}{3}', right: 'b+\\frac{2}{3}', key: '<', why: 'نضيف العدد نفسه $\\frac{2}{3}$ إلى طرفي $a<b$ .' },
    { L: 'a-5', R: 'b-5', left: 'a-5', right: 'b-5', key: '<', why: 'نطرح العدد نفسه $5$ من الطرفين.' },
    { L: 'a+1/4', R: 'b+3/4', left: 'a+\\frac{1}{4}', right: 'b+\\frac{3}{4}', key: '<', why: '$a+\\frac{1}{4}<b+\\frac{1}{4}<b+\\frac{3}{4}$ : نضيف $\\frac{1}{4}$ إلى الطرفين ثم نزيد الطرف الأيمن.' },
    { L: 'a-1', R: 'b-3', left: 'a-1', right: 'b-3', key: 'none', why: 'نطرح $1$ من $a$ و $3$ من $b$ : الفرق $(a-1)-(b-3)=a-b+2$ لا نعرف إشارته. فمن أجل $a=0,\\ b=1$ نجد $-1>-2$ ، ومن أجل $a=0,\\ b=5$ نجد $-1<2$ .' },
  ],
};

/* ── E3 : act-2b, ex-18 — × et ÷ par un positif ou un négatif ───────────────────────────────────────────────────── */
export const E3 = {
  vars: ['k', 'l'], given: 'k<l', options: ['<', '>', 'none'],
  rows: [
    { L: '4k', R: '4l', left: '4k', right: '4l', key: '<', why: 'نضرب طرفي $k<l$ في $4$ وهو موجب: الاتجاه لا يتغيّر.' },
    { L: '-5k', R: '-5l', left: '-5k', right: '-5l', key: '>', why: 'نضرب في $-5$ وهو سالب: الاتجاه ينعكس.' },
    { L: 'k/3', R: 'l/3', left: '\\frac{k}{3}', right: '\\frac{l}{3}', key: '<', why: 'نقسم على $3$ وهو موجب: الاتجاه لا يتغيّر.' },
    { L: 'k/-2', R: 'l/-2', left: '\\frac{k}{-2}', right: '\\frac{l}{-2}', key: '>', why: 'نقسم على $-2$ وهو سالب: الاتجاه ينعكس.' },
    { L: '-(2/5)k', R: '-(2/5)l', left: '-\\frac{2}{5}k', right: '-\\frac{2}{5}l', key: '>', why: 'نضرب في $-\\frac{2}{5}$ وهو سالب: الاتجاه ينعكس.' },
  ],
};

/* ── E4 : ex-13, now-75-1 — m > 2 et cinq expressions ───────────────────────────────────────────────────────────── */
export const E4 = [
  { v: 'm', given: 'm>2', expr: 'm+6', key: 'm+6>8', wrongs: ['m+6<8', 'm+6>12', 'm+6>=10'], why: 'نضيف $6$ إلى الطرفين.' },
  { v: 'm', given: 'm>2', expr: 'm-9', key: 'm-9>-7', wrongs: ['m-9<-7', 'm-9>-5', 'm-9>11'], why: 'نطرح $9$ من الطرفين: $2-9=-7$ .' },
  { v: 'm', given: 'm>2', expr: '5m', key: '5m>10', wrongs: ['5m<10', '5m>12', '5m>=20'], why: 'نضرب في $5$ وهو موجب: الاتجاه نفسه.' },
  { v: 'm', given: 'm>2', expr: '-4m', key: '-4m<-8', wrongs: ['-4m>-8', '-4m<-12', '-4m>8'], why: 'نضرب في $-4$ وهو سالب: الاتجاه ينعكس.' },
  { v: 'm', given: 'm>2', expr: '-(1/2)m+3', key: '-(1/2)m+3<2', wrongs: ['-(1/2)m+3>2', '-(1/2)m+3<0', '-(1/2)m+3<1'], why: 'نضرب في $-\\frac{1}{2}$ فنجد $-\\frac{1}{2}m<-1$ (ينعكس الاتجاه) ، ثم نضيف $3$ .' },
];

/* ── E5 : ex-14 … ex-16, now-75-2 — une inégalité de premier terme x ─────────────────────────────────────────────── */
export const E5 = [
  { v: 'x', given: '3x-4<=11', givenTex: '3x-4\\leq 11', key: 'x<=5', wrongs: ['x>=5', 'x<=7/3', 'x<5'], why: 'نضيف $4$ : $3x\\leq 15$ ، ثم نقسم على $3$ وهو موجب: $x\\leq 5$ .' },
  { v: 'x', given: '-2x+5>13', givenTex: '-2x+5>13', key: 'x<-4', wrongs: ['x>-4', 'x<-9', 'x>4'], why: 'نطرح $5$ : $-2x>8$ ، ثم نقسم على $-2$ وهو سالب فينعكس الاتجاه: $x<-4$ .' },
  { v: 'x', given: '6>=-(1/3)x', givenTex: '6\\geq -\\frac{x}{3}', key: 'x>=-18', wrongs: ['x<=-18', 'x>=-2', 'x>=18'], why: 'نضرب في $-3$ فينعكس الاتجاه: $-18\\leq x$ أي $x\\geq -18$ .' },
];

/* ── E6 : ex-17, ex-7 — ≤ et ≥ ────────────────────────────────────────────────────────────────────────────────── */
export const E6 = {
  vars: ['a', 'b'], given: 'a>=b', options: ['<=', '>=', '<', '>'],
  rows: [
    { L: 'b', R: 'a', left: 'b', right: 'a', key: '<=', why: '$a\\geq b$ تعني $b\\leq a$ .' },
    { L: 'a-b', R: '0', left: 'a-b', right: '0', key: '>=', why: 'نطرح $b$ من طرفي $a\\geq b$ : $a-b\\geq 0$ .' },
    { L: '3a+1', R: '3b+1', left: '3a+1', right: '3b+1', key: '>=', why: 'نضرب في $3$ ثم نضيف $1$ : الاتجاه لا يتغيّر.' },
    { L: '2-a', R: '2-b', left: '2-a', right: '2-b', key: '<=', why: 'نضرب في $-1$ فينعكس الاتجاه، ثم نضيف $2$ .' },
  ],
};

/* ── E7 : ex-23, ex-24 — حصر محيط وطول ضلع ───────────────────────────────────────────────────────────────────────── */
const brk = (lo, expr, hi, loRel = '<', hiRel = '<') => T(`${tx(String(lo))}${loRel === '<=' ? '\\leq ' : '<'}${tx(expr)}${hiRel === '<=' ? '\\leq ' : '<'}${tx(String(hi))}`);
export const E7 = [
  { v: 'x', interval: { lo: '4', loRel: '<', hi: '13/2', hiRel: '<' }, expr: '4x', label: 'محيط المربّع $4x$ (cm)', key: { lo: '16', hi: '26' }, wrongs: [{ lo: '8', hi: '21/2' }, { lo: '26', hi: '16' }, { lo: '4', hi: '13/2' }], why: 'نضرب الأطراف الثلاثة في $4$ : $16<4x<26$ .' },
  { v: 'P', interval: { lo: '12', loRel: '<', hi: '27/2', hiRel: '<' }, expr: 'P/3', label: 'طول ضلع المثلث $\\frac{P}{3}$ (cm)', key: { lo: '4', hi: '9/2' }, wrongs: [{ lo: '9', hi: '21/2' }, { lo: '36', hi: '81/2' }, { lo: '9/2', hi: '4' }], why: 'نقسم الأطراف الثلاثة على $3$ : $4<\\frac{P}{3}<4{,}5$ .' },
];
const decTex = (frac) => { const [n, d] = String(frac).split('/'); return d ? String(Number(n) / Number(d)).replace('.', '{,}') : n; };
export const bracketTex = (b, expr) => T(`${decTex(b.lo)}<${tx(expr)}<${decTex(b.hi)}`);

/* ── E8 : ex-26 — un encadrement « à l'envers » ──────────────────────────────────────────────────────────────── */
export const E8 = {
  v: 'x', given: { expr: '2x+1', lo: '3', loRel: '<=', hi: '9', hiRel: '<' },
  key: { lo: '1', loRel: '<=', hi: '4', hiRel: '<' },
  wrongs: [{ lo: '2', loRel: '<=', hi: '8', hiRel: '<' }, { lo: '1', loRel: '<', hi: '4', hiRel: '<=' }, { lo: '6', loRel: '<=', hi: '18', hiRel: '<' }],
  why: 'نطرح $1$ من الأطراف الثلاثة: $2\\leq 2x<8$ ، ثم نقسم على $2$ : $1\\leq x<4$ .',
};
const b8 = (o) => brk(o.lo, 'x', o.hi, o.loRel, o.hiRel);

export const EXERCISES = [
  {
    id: 'ex-6', source: S('ex-6', 78, 6), cites: [src('act-2', 72, 'أنشطة', 2)], learningPointId: LP.P1, difficulty: 'facile',
    statement: '$x$ عدد ناطق. أكمل كل جملة بالمتباينة المناسبة:',
    interaction: 'batch',
    question: { rows: E1.map((r, i) => row(T(`${tx(r.given)}\\ \\Longrightarrow\\ ${tx(r.expr)}\\ \\ldots`), ineq(r.key), r.wrongs.map(ineq), i + 1, r.why)), explain: 'نضيف العدد نفسه إلى الطرفين أو نطرحه منهما: الاتجاه لا يتغيّر.' },
    commonError: 'قلب الاتجاه بعد الطرح، أو إجراء العملية على طرف واحد.',
  },
  {
    id: 'act-2', source: src('act-2', 73, 'أنشطة', 2), learningPointId: LP.P1, difficulty: 'moyen',
    statement: '$a$ و $b$ عددان ناطقان حيث $a<b$ . أكمل إن أمكن بـ $<$ أو $>$ :',
    interaction: 'batch',
    question: { rows: E2.rows.map((r, i) => row(T(`${r.left}\\ \\square\\ ${r.right}`), SYMBOL_TEX[r.key], E2.options.filter((o) => o !== r.key).map((o) => SYMBOL_TEX[o]), i, r.why)), explain: 'نغيّر الطرفين بالمقدار نفسه ثم نقارن؛ وإذا اختلف المقداران فقد لا نستطيع الحكم.' },
    commonError: 'إضافة عددين مختلفين إلى طرفي متباينة والظنّ أنّ الاتجاه يبقى.',
  },
  {
    id: 'act-2b', source: src('act-2b', 73, 'أنشطة', 2), cites: [S('ex-18', 79, 18)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: '$k$ و $l$ عددان ناطقان حيث $k<l$ . أكمل كل جملة:',
    interaction: 'batch',
    question: { rows: E3.rows.map((r, i) => row(T(`${r.left}\\ \\square\\ ${r.right}`), SYMBOL_TEX[r.key], E3.options.filter((o) => o !== r.key).map((o) => SYMBOL_TEX[o]), i, r.why)), explain: 'الضرب أو القسمة في عدد موجب تمامًا يحفظ الاتجاه، وفي عدد سالب تمامًا يعكسه.' },
    commonError: 'الاحتفاظ بالاتجاه بعد الضرب في عدد سالب، أو عكسه بعد الضرب في عدد موجب.',
  },
  {
    id: 'ex-13', source: S('ex-13', 78, 13), cites: [src('now-75-1', 75, 'دوري الآن', 1)], learningPointId: LP.P4, difficulty: 'moyen',
    statement: '$m$ عدد ناطق حيث $m>2$ . استنتج متباينة لكل من العبارات الآتية:',
    interaction: 'batch',
    question: { rows: E4.map((r, i) => row(T(tx(r.expr)), ineq(r.key), r.wrongs.map(ineq), i + 2, r.why)), explain: 'نطبّق العملية نفسها على طرفي $m>2$ ، ونغيّر الاتجاه عند الضرب في عدد سالب.' },
    commonError: 'نسيان تغيير الاتجاه عند الضرب في $-4$ ، أو نسيان الحدّ $+3$ .',
  },
  {
    id: 'ex-14', source: S('ex-14', 78, 14), cites: [S('ex-15', 78, 15), S('ex-16', 78, 16)], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'استنتج من كل متباينة متباينة طرفها الأول $x$ :',
    interaction: 'batch',
    question: { rows: E5.map((r, i) => row(T(r.givenTex), ineq(r.key), r.wrongs.map(ineq), i + 1, r.why)), explain: 'نعزل الحدّ الذي فيه $x$ بالجمع أو الطرح، ثم نقسم؛ وإذا قسمنا على عدد سالب انعكس الاتجاه.' },
    commonError: 'قسمة الطرفين على عدد سالب دون تغيير الاتجاه.',
  },
  {
    id: 'ex-17', source: S('ex-17', 78, 17), cites: [S('ex-7', 78, 7)], learningPointId: LP.P4, difficulty: 'moyen',
    statement: '$a$ و $b$ عددان ناطقان حيث $a\\geq b$ . أكمل كل جملة بالرمز المناسب:',
    interaction: 'batch',
    question: { rows: E6.rows.map((r, i) => row(T(`${r.left}\\ \\square\\ ${r.right}`), SYMBOL_TEX[r.key], E6.options.filter((o) => o !== r.key).map((o) => SYMBOL_TEX[o]), i, r.why)), explain: 'الخواص نفسها صحيحة مع $\\leq$ و $\\geq$ .' },
    commonError: 'استبدال $\\geq$ بـ $>$ فتضيع حالة التساوي.',
  },
  {
    id: 'ex-23', source: S('ex-23', 79, 23), cites: [S('ex-24', 79, 24)], learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'ضلع مربّع طوله $x$ بالسنتيمتر حيث $4<x<6{,}5$ ، ومثلث متقايس الأضلاع محيطه $P$ حيث $12<P<13{,}5$ . أجب:',
    interaction: 'batch',
    question: { rows: E7.map((r, i) => row(r.label, bracketTex(r.key, r.expr), r.wrongs.map((w) => bracketTex(w, r.expr)), i + 1, r.why)), explain: 'نطبّق العملية نفسها على الأطراف الثلاثة.' },
    commonError: 'ضرب طرف واحد من الطرفين، أو كتابة الطرفين في غير ترتيبهما.',
  },
  {
    id: 'ex-26', source: S('ex-26', 79, 26), learningPointId: LP.P4, difficulty: 'moyen',
    statement: '$x$ عدد حيث $3\\leq 2x+1<9$ . استنتج حصرًا للعدد $x$ :',
    interaction: 'batch',
    question: { rows: [row(T('3\\leq 2x+1<9\\ \\Longrightarrow\\ \\ldots'), b8(E8.key), E8.wrongs.map(b8), 2, E8.why)], explain: 'نعزل $x$ في الأطراف الثلاثة: نطرح $1$ ثم نقسم على $2$ .' },
    commonError: 'طرح $1$ دون القسمة على $2$ ، أو تغيير رمز الطرفين.',
  },
];
export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. */
const opt = (plain) => ineq(plain);
export const FINAL = [
  { id: 'E1', source: null, lp: LP.P1, prompt: '$a<b$ . أيّ عبارة صحيحة دائمًا؟', given: 'a<b', vars: ['a', 'b'], key: 'a-4<b-4', wrongs: ['a-4>b-4', 'a+4<b-4', 'a-4=b-4'], options: ['a-4<b-4', 'a-4>b-4', 'a+4<b-4', 'a-4=b-4'].map(opt), correct: 0 },
  { id: 'E2', source: null, lp: LP.P2, prompt: '$x<6$ ، إذن:', given: 'x<6', vars: ['x'], key: '3x<18', wrongs: ['3x>18', '3x<6', '3x<2'], options: ['3x<18', '3x>18', '3x<6', '3x<2'].map(opt), correct: 0 },
  { id: 'E3', source: src('self-3', 81, 'أؤكّد تعلّماتي', 3), lp: LP.P3, prompt: '$y\\geq -2$ ، إذن:', given: 'y>=-2', vars: ['y'], key: '-5y<=10', wrongs: ['-5y>=10', '-5y>=-10', '-5y<=-10'], options: ['-5y<=10', '-5y>=10', '-5y>=-10', '-5y<=-10'].map(opt), correct: 0 },
  { id: 'E4', source: src('self-4', 81, 'أؤكّد تعلّماتي', 4), lp: LP.P4, prompt: '$-4x>12$ ، ومتباينة طرفها الأول $x$ هي:', given: '-4x>12', vars: ['x'], key: 'x<-3', wrongs: ['x>-3', 'x>3', 'x<-12'], options: ['x<-3', 'x>-3', 'x>3', 'x<-12'].map(opt), correct: 0 },
  {
    id: 'E5', source: null, lp: LP.P4, prompt: '$2\\leq t\\leq 4$ ، وحصر $5-2t$ هو:', given: { expr: 't', lo: '2', hi: '4' }, expr: '5-2t', key: { lo: '-3', hi: '1' },
    wrongs: [{ lo: '1', hi: '3' }, { lo: '9', hi: '13' }, { lo: '-8', hi: '-4' }],
    options: [[-3, 1], [1, 3], [9, 13], [-8, -4]].map(([lo, hi]) => T(`${lo}\\leq 5-2t\\leq ${hi}`)), correct: 0,
  },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
