/**
 * Les exercices du درس « النسبة المئوية » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source`
 * l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais
 * montré à l'élève. Chaque valeur est CALCULÉE ici avec `packages/core/arithmetic/percent3.js` et RE-vérifiée par ./content.test.js avec un autre code
 * (BigInt), qui contrôle aussi que chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit6/extraction.json) : act-2, ex-6 … ex-16, deep-30 (a), deep-39, deep-40 → module 4 (les 8 exercices ci-dessous les citent) ;
 * self-3 … self-6 → le إختبار أولي (module 8).
 */
import * as P from '@smarter-academy/core/arithmetic/percent3.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_nisba-miawiya-3am_P1',
  P2: '3am_nisba-miawiya-3am_P2',
  P3: '3am_nisba-miawiya-3am_P3',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const T = (s) => `$${s}$`;
const num = (v) => Lin.toNumber(v);
const pct = (v) => `${P.text(v)}\\%`;
/** Les options d'une ligne : la bonne à la position `at`, les autres ensuite dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction) => ({ label, ...place(right, wrongs, at), correction });

/* ── ex-6 : un nombre sur un autre, en pourcentage ────────────────────────────────────────────────────────────────── */
export const RATES = [
  { a: 9, b: 20, wrongs: ['9\\%', '55\\%'], why: '$\\frac{9}{20} = \\frac{45}{100}$ : $45\\%$ . ($9\\%$ تأخذ عدد الجزء نسبةً؛ و $55\\%$ هي الجزء الباقي.)' },
  { a: 3, b: 8, wrongs: ['3\\%', '62{,}5\\%'], why: '$\\frac{3}{8} = 0{,}375$ : $37{,}5\\%$ . ($62{,}5\\%$ est la part des $5$ restants.)' },
  { a: 21, b: 60, wrongs: ['21\\%', '65\\%'], why: '$\\frac{21}{60} = 0{,}35$ : $35\\%$ .' },
  { a: 18, b: 24, wrongs: ['18\\%', '25\\%'], why: '$\\frac{18}{24} = 0{,}75$ : $75\\%$ . ($25\\%$ est la part des $6$ restants.)' },
];

export const EXERCISES = [
  {
    id: 'act-2', source: S('act-2', 88, 'أنشطة'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'مدينة عدد سكّانها $250\\,000$ نسمة، و $28\\%$ منهم تقلّ أعمارهم عن $15$ سنة.',
    interaction: 'numeric',
    question: { prompt: 'عدد السكّان الذين أعمارهم $15$ سنة فأكثر:', expected: num(P.partOf(250000, 72)), display: '180000', explain: 'الباقون $100\\% - 28\\% = 72\\%$ ، و $250\\,000 \\times \\frac{72}{100} = 180\\,000$ نسمة.' },
    commonError: 'حساب $28\\%$ فقط ونسيان أنّ السؤال عن الباقين.',
  },
  {
    id: 'ex-6', source: S('ex-6', 95), cites: [S('deep-30', 98, 'أتعمّق')], learningPointId: LP.P2, difficulty: 'facile',
    statement: 'عبّر بنسبة مئوية عن كلّ مما يلي:',
    interaction: 'batch',
    question: {
      rows: RATES.map((d, i) => row(`${d.a} من ${d.b}`, T(pct(P.rateOf(d.a, d.b))), d.wrongs.map(T), i + 1, d.why)),
      explain: 'نكتب $\\frac{a}{b} = \\frac{t}{100}$ فنجد $t = \\frac{a \\times 100}{b}$ .',
    },
    commonError: 'جعل عدد الجزء هو النسبة المئوية.',
  },
  {
    id: 'ex-7', source: S('ex-7', 95), cites: [S('ex-15', 95)], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'لعبة ثمنها $240$ دج ارتفع ثمنها بـ $15\\%$ .',
    interaction: 'numeric',
    question: { prompt: 'ثمنها الجديد بالدينار:', expected: num(P.changed(240, 'up', 15)), explain: 'الزيادة $240 \\times 0{,}15 = 36$ دج، فالثمن $240 + 36 = 276$ ؛ أو مباشرة $240 \\times 1{,}15 = 276$ .' },
    commonError: 'إضافة $15$ دج إلى الثمن.',
  },
  {
    id: 'ex-8', source: S('ex-8', 95), cites: [S('ex-10', 95), S('ex-14', 95), S('ex-16', 96)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'انتقل ثمن بضاعة من $4000$ دج إلى $4120$ دج.',
    interaction: 'numeric',
    question: { prompt: 'النسبة المئوية للزيادة (اكتب العدد فقط):', expected: num(P.changeRate(4000, 4120)), explain: 'الزيادة $120$ دج من الثمن الأول $4000$ : $\\frac{120}{4000} = \\frac{3}{100}$ ، أي $3\\%$ .' },
    commonError: 'قسمة الزيادة على الثمن الجديد.',
  },
  {
    id: 'ex-9', source: S('ex-9', 95), cites: [S('ex-11', 95), S('ex-12', 95)], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'يحضّر محمد مشروبًا من $12\\ \\mathrm{cL}$ من عصير يحوي $75\\%$ ماء و $8\\ \\mathrm{cL}$ من عصير آخر يحوي $90\\%$ ماء.',
    interaction: 'numeric',
    question: { prompt: 'النسبة المئوية للماء في المشروب (اكتب العدد فقط):', expected: num(P.rateOf(Lin.add(P.partOf(12, 75), P.partOf(8, 90)), 20)), explain: 'الماء $12 \\times 0{,}75 = 9$ و $8 \\times 0{,}9 = 7{,}2$ ، المجموع $16{,}2\\ \\mathrm{cL}$ من $20\\ \\mathrm{cL}$ : $\\frac{16{,}2}{20} = 0{,}81$ ، أي $81\\%$ (لا متوسط $75\\%$ و $90\\%$).' },
    commonError: 'أخذ متوسط النسبتين دون اعتبار حجمي العصيرين.',
  },
  {
    id: 'ex-13', source: S('ex-13', 95), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'تغطي الغابات $30\\%$ من مساحة ولاية، ومساحة الغابات $1200\\ \\mathrm{km^2}$ .',
    interaction: 'numeric',
    question: { prompt: 'مساحة الولاية بـ $\\mathrm{km^2}$ :', expected: num(P.wholeOf(1200, 30)), explain: 'الجزء $1200$ يقابله $30$ والكلّ يقابله $100$ : الكلّ $= \\frac{1200 \\times 100}{30} = 4000\\ \\mathrm{km^2}$ .' },
    commonError: 'حساب $30\\%$ من $1200$ بدل البحث عن الكلّ.',
  },
  {
    id: 'deep-39', source: S('deep-39', 99, 'أتعمّق'), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'اشترت سلمى معطفًا بـ $4500$ دج بعد ارتفاع الأسعار بـ $25\\%$ .',
    interaction: 'numeric',
    question: { prompt: 'ثمنه قبل ارتفاع الأسعار بالدينار:', expected: num(P.beforeChange(4500, 'up', 25)), explain: '$4500$ دج هي $125\\%$ من الثمن الأول: $4500 \\div 1{,}25 = 3600$ . ($25\\%$ تُحسب من $3600$ لا من $4500$.)' },
    commonError: 'طرح $25\\%$ من $4500$ مباشرة.',
  },
  {
    id: 'deep-40', source: S('deep-40', 99, 'أتعمّق'), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'غسّالة ثمنها $20000$ دج خضعت لتخفيضين متتاليين: $20\\%$ ثم $10\\%$ .',
    interaction: 'numeric',
    question: { prompt: 'النسبة المئوية الكلية للتخفيض (اكتب العدد فقط):', expected: -num(P.chain(20000, [['down', 20], ['down', 10]]).rate), explain: '$20000 \\times 0{,}8 = 16000$ ثم $16000 \\times 0{,}9 = 14400$ ؛ التخفيض $5600$ من $20000$ أي $28\\%$ ، لا $30\\%$ .' },
    commonError: 'جمع النسبتين: $20 + 10 = 30$ .',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `truth` : le calcul qui fait la clé. */
export const FINAL = [
  { id: 'E1', source: null, prompt: '$35\\%$ من $80$ هي:', options: ['$28$', '$45$', '$2800$', '$2{,}8$'], correct: 0, truth: { kind: 'of', x: '80', t: '35' } },
  { id: 'E2', source: S('self-3', 97, 'أؤكّد تعلّماتي'), prompt: 'في قسم $25$ تلميذًا، $40\\%$ منهم بنات، وفي قسم آخر $15$ تلميذًا، $80\\%$ منهم بنات. النسبة المئوية للبنات في القسمين معًا:', options: ['$55\\%$', '$60\\%$', '$120\\%$', '$22\\%$'], correct: 0, truth: { kind: 'combined', parts: [['25', '40'], ['15', '80']] } },
  { id: 'E3', source: S('self-4', 97, 'أؤكّد تعلّماتي'), prompt: 'لباس ثمنه $12000$ دج بيع بعد تخفيض بـ $20\\%$ . ثمن البيع بالدينار:', options: ['$9600$', '$2400$', '$11980$', '$14400$'], correct: 0, truth: { kind: 'change', x: '12000', dir: 'down', t: '20' } },
  { id: 'E4', source: S('self-5', 97, 'أؤكّد تعلّماتي'), prompt: 'غرض ثمنه $300$ دج انخفض بـ $10\\%$ ثم ارتفع بـ $10\\%$ . ثمنه الجديد بالدينار:', options: ['$297$', '$300$', '$330$', '$270$'], correct: 0, truth: { kind: 'chain', x: '300', steps: [['down', '10'], ['up', '10']] } },
  { id: 'E5', source: S('self-6', 97, 'أؤكّد تعلّماتي'), prompt: 'قطع أيوب $72\\ \\mathrm{km}$ أي $40\\%$ من مسافة رحلته. مسافة الرحلة بالكيلومتر:', options: ['$180$', '$28{,}8$', '$112$', '$288$'], correct: 0, truth: { kind: 'whole', part: '72', t: '40' } },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
