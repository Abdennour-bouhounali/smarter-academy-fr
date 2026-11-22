/**
 * Les exercices du درس « مقارنة الأعداد العشرية وترتيبها » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres contextes, autres
 * nombres, la même compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres
 * éléments qu'il remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` est muet). Toutes les clés sont
 * recalculées en arithmétique EXACTE dans ./content.test.js, et chaque distracteur y est vérifié FAUX.
 * Destinations (docs/sources/1am/unit1/extraction.json) : act-5 (application), ex-17 … ex-20 → module 4 ; deep-3 ③④ et TIC (ict) →
 * exercices du module 4 ; أقوّم تعلّماتي 8 et 9 → le إختبار أولي (module 8).
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '1am_muqaranat-adad-ashriya_P1',
  P2: '1am_muqaranat-adad-ashriya_P2',
  P3: '1am_muqaranat-adad-ashriya_P3',
};

/* ── Outils de rédaction (la clé d'une ligne de comparaison est CALCULÉE ici et re-vérifiée par le test, indépendamment) ───────────── */
const T = (s) => `$${s}$`;
const tex = (s) => String(s).replace(',', '{,}');
const dec = (s) => { const [i, f = ''] = String(s).replace(',', '.').split('.'); return { n: BigInt(i + f), k: f.length }; };
const cmpDec = (a, b) => {
  const x = dec(a); const y = dec(b); const k = Math.max(x.k, y.k);
  const p = x.n * 10n ** BigInt(k - x.k); const q = y.n * 10n ** BigInt(k - y.k);
  return p < q ? 0 : p > q ? 1 : 2; // index dans SYMS : < , > , =
};
/** Un opérande : un nombre décimal ou un nombre naturel, ou une fraction décimale n / 10^k (valeur calculée sans flottants). */
const x = (s) => ({ tex: tex(s), val: String(s) });
const frac = (n, k) => {
  const digits = String(n).padStart(k + 1, '0');
  return { tex: `\\frac{${n}}{${10 ** k}}`, val: k === 0 ? digits : `${digits.slice(0, -k)},${digits.slice(-k)}` };
};
const SYMS = ['<', '>', '='];
/** Une ligne « compare » : les trois symboles dans un ordre fixe, la clé suit la comparaison exacte. */
const rel = (p, q, correction) => ({ label: T(`${p.tex}\\ \\ldots\\ ${q.tex}`), options: SYMS.map(T), correct: cmpDec(p.val, q.val), correction });
/** Une chaîne ordonnée « a < b < c » (ou « > »). */
const chain = (vals, sym) => T(vals.map(tex).join(`\\,${sym}\\,`));

export const EXERCISES = [
  {
    id: 'act-5', source: src('act-5', 10, 'اكتشف', 5), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'تنافس أربعة أصدقاء في تحديد أيّ العددين أكبر: $5{,}3$ أم $5{,}12$ ؟ هذه أقوالهم، فهل ما قاله كلّ منهم صحيح؟',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'لينا: «$5{,}12>5{,}3$ لأنّ $12>3$ ».', answer: false, why: 'لا نقرأ الأرقام بعد الفاصلة عددًا طبيعيًا: $5{,}3=5{,}30$ ، و 30 جزءًا من مائة أكثر من 12 جزءًا.' },
        { text: 'يوسف: «$5{,}3=5+\\frac{30}{100}$ و $5{,}12=5+\\frac{12}{100}$ ، إذن $5{,}12<5{,}3$ ».', answer: true, why: 'كتب العددين بالقطع نفسها (أجزاء من مائة) ثم قارن 30 و 12.' },
        { text: 'ريان: «الجزآن الصحيحان متساويان، ورقم الأعشار 3 أكبر من 1، إذن $5{,}3>5{,}12$ ».', answer: true, why: 'أوّل رتبة يختلف فيها الرقمان هي رتبة الأعشار: $3>1$ .' },
        { text: 'سيف: «$5{,}3<5{,}12$ لأنّ في $5{,}12$ رقمين بعد الفاصلة».', answer: false, why: 'ليس العدد الأطول هو الأكبر: $5{,}3=5{,}30>5{,}12$ .' },
      ],
      explain: 'نقارن بالقطع نفسها: بإتمام الأصفار، أو رتبةً برتبة من الأعشار.',
    },
    commonError: 'قراءة الأرقام بعد الفاصلة عددًا طبيعيًا، أو الاعتقاد أنّ الأطول هو الأكبر.',
  },
  {
    id: 'ex-17', source: src('ex-17', 18, 'أتمرّن', 17), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'أتمّ كل مقارنة بالرمز المناسب $<$ أو $>$ أو $=$ :',
    interaction: 'batch',
    question: {
      rows: [
        rel(frac(3, 1), frac(9, 1), 'الكسران من الأعشار: $3<9$ ، إذن $\\frac{3}{10}<\\frac{9}{10}$ .'),
        rel(frac(63, 2), frac(36, 2), 'كسران من الأجزاء من مائة: $63>36$ .'),
        rel(frac(17, 1), frac(105, 2), '$\\frac{17}{10}=1{,}7$ و $\\frac{105}{100}=1{,}05$ : $1{,}7>1{,}05$ .'),
        rel(frac(6, 1), frac(60, 2), '$\\frac{6}{10}=\\frac{60}{100}$ : كل عُشر عشرة أجزاء من مائة.'),
        rel(frac(2019, 2), x('20,9'), '$\\frac{2019}{100}=20{,}19$ ، ثم $20{,}19<20{,}9$ لأنّ رقم الأعشار 1 أقل من 9.'),
        rel(frac(3047, 2), x('30,47'), '$\\frac{3047}{100}=30{,}47$ : العددان متساويان.'),
      ],
      explain: 'نكتب الكسرين العشريين بالفاصلة ثم نقارنهما، أو نقارن بسطيهما إن كان المقام نفسه.',
    },
    commonError: 'مقارنة البسطين دون النظر إلى المقامين.',
  },
  {
    id: 'ex-18', source: src('ex-18', 18, 'أتمرّن', 18), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'أتمّ كل مقارنة بالرمز المناسب $<$ أو $>$ أو $=$ :',
    interaction: 'batch',
    question: {
      rows: [
        rel(x('57'), x('8,9'), 'الجزء الصحيح 57 أكبر من 8، مهما كانت الأرقام بعد الفاصلة.'),
        rel(x('6,28'), x('6,31'), 'الجزآن الصحيحان متساويان؛ رقم الأعشار $2<3$ ، إذن $6{,}28<6{,}31$ .'),
        rel(x('14,205'), x('14,25'), 'نتمّ بصفر: $14{,}25=14{,}250$ ، و 205 جزءًا من ألف أقل من 250.'),
        rel(x('0,7'), x('0,699'), 'نتمّ بصفرين: $0{,}7=0{,}700$ ، و 700 جزء من ألف أكثر من 699.'),
        rel(x('31,4'), x('31,40'), 'الصفر الأخير لا يغيّر العدد.'),
        rel(x('12,09'), x('12,9'), 'رقم الأعشار 0 في الأول و 9 في الثاني، إذن $12{,}09<12{,}9$ .'),
      ],
      explain: 'الجزء الصحيح أوّلًا، ثم الأرقام رتبةً برتبة، أو نتمّ بأصفار فنقارن عددين طبيعيين.',
    },
    commonError: 'الحكم بأنّ $14{,}205>14{,}25$ لأنّ $205>25$ .',
  },
  {
    id: 'ex-19', source: src('ex-19', 18, 'أتمرّن', 19), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'أيّ السلاسل الآتية مرتّبة ترتيبًا تصاعديًا (من الأصغر إلى الأكبر) للأعداد المذكورة في كل حالة؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: T('4{,}5\\ ;\\ 4{,}25\\ ;\\ 4{,}05\\ ;\\ 3{,}9'), options: [chain(['3,9', '4,05', '4,25', '4,5'], '<'), chain(['4,05', '4,25', '4,5', '3,9'], '<'), chain(['4,5', '4,25', '4,05', '3,9'], '<')], correct: 0, correction: 'أصغر جزء صحيح 3 فهو الأصغر؛ ثم أعشار الباقية: 0 و 2 و 5.' },
        { label: T('0{,}7\\ ;\\ 0{,}07\\ ;\\ 0{,}17\\ ;\\ 1{,}07\\ ;\\ 0{,}71'), options: [chain(['0,07', '0,17', '0,7', '0,71', '1,07'], '<'), chain(['0,07', '0,7', '0,17', '0,71', '1,07'], '<'), chain(['0,7', '0,07', '0,17', '1,07', '0,71'], '<')], correct: 0, correction: '1,07 هو الأكبر بجزئه الصحيح؛ ثم أعشار 0,07 و 0,17 و 0,7 و 0,71: 0 و 1 و 7 و 7، ويفصل بين الأخيرين رقم الأجزاء من مائة.' },
        { label: T('12\\ ;\\ 11{,}99\\ ;\\ 12{,}01\\ ;\\ 12{,}1'), options: [chain(['11,99', '12', '12,01', '12,1'], '<'), chain(['12', '11,99', '12,01', '12,1'], '<'), chain(['11,99', '12,01', '12', '12,1'], '<')], correct: 0, correction: 'العدد الطبيعي 12 هو 12,00: فهو أكبر من 11,99 وأصغر من 12,01.' },
      ],
      explain: 'نبدأ بالجزء الصحيح، ثم نفصل بين المتساوين رتبةً برتبة.',
    },
    commonError: 'ترتيب الأعداد كأنّ أرقامها كلها عدد طبيعي واحد.',
  },
  {
    id: 'ex-20', source: src('ex-20', 18, 'أتمرّن', 20), cites: [src('now-16', 16, 'دوري الآن')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'أيّ السلاسل الآتية مرتّبة ترتيبًا تنازليًا (من الأكبر إلى الأصغر) للأعداد المذكورة في كل حالة؟',
    interaction: 'batch',
    question: {
      rows: [
        { label: T('6{,}3\\ ;\\ 6{,}03\\ ;\\ 6{,}303\\ ;\\ 5{,}99'), options: [chain(['6,303', '6,3', '6,03', '5,99'], '>'), chain(['6,3', '6,303', '6,03', '5,99'], '>'), chain(['5,99', '6,03', '6,3', '6,303'], '>')], correct: 0, correction: 'نتمّ بأصفار: 6,300 و 6,030 و 6,303: فالأكبر 6,303 ثم 6,3 ثم 6,03، وأخيرًا 5,99.' },
        { label: T('0{,}9\\ ;\\ 0{,}099\\ ;\\ 1\\ ;\\ 0{,}91'), options: [chain(['1', '0,91', '0,9', '0,099'], '>'), chain(['1', '0,9', '0,91', '0,099'], '>'), chain(['0,91', '1', '0,9', '0,099'], '>')], correct: 0, correction: 'العدد 1 هو الأكبر؛ ثم 0,91 و 0,90 (=0,9) ثم 0,099.' },
      ],
      explain: 'ترتيب تنازلي: نكتب الأكبر أوّلًا، وكل رمز > يفتح نحو اليمين نحو الأقل.',
    },
    commonError: 'الخلط بين الترتيب التصاعدي والتنازلي.',
  },
  {
    id: 'deep-3', source: src('deep-3', 20, 'أتعمّق', 3), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'عندك أربع بطاقات: 5 ، 0 ، 8 ، 3. تستعمل كل بطاقة مرّة واحدة، وتضع فاصلة واحدة في مكان تختاره (دون كتابة صفر غير ضروري).',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'أصغر عدد عشري يمكن تشكيله', options: [T('0{,}358'), T('0{,}385'), T('3{,}058')], correct: 0, correction: 'نضع الصفر قبل الفاصلة والرقم الأصغر 3 في الأعشار، ثم 5 ثم 8: $0{,}358$ .' },
        { label: 'أكبر عدد عشري يمكن تشكيله', options: [T('850{,}3'), T('508{,}3'), T('85{,}03')], correct: 0, correction: '$850{,}3$ : أكبر رقم في الجزء الصحيح أوّلًا؛ و $853{,}0$ مرفوض لأنّ صفره الأخير غير ضروري.' },
      ],
      explain: 'الجزء الصحيح الأكبر يصنع العدد الأكبر؛ ولا يكون الصفر الأخير بعد الفاصلة.',
    },
    commonError: 'كتابة الصفر في أول الجزء الصحيح أو الاحتفاظ بصفر أخير غير ضروري.',
  },
  {
    id: 'ict', source: src('ict', 22, 'استعمل تكنولوجيات الإعلام والاتصال'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'علامات ستة تلاميذ في فرض الرياضيات: ريم 14,5 ؛ ياسين 14,25 ؛ سلمى 9,75 ؛ أيمن 14,05 ؛ لينا 16 ؛ كريم 9,5.',
    interaction: 'batch',
    question: {
      rows: [
        { label: 'صاحب أكبر علامة', options: ['لينا', 'ريم', 'ياسين'], correct: 0, correction: '16 أكبر من كل علامة أخرى (الجزء الصحيح 16 أكبر من 14).' },
        { label: 'صاحب أصغر علامة', options: ['كريم', 'سلمى', 'أيمن'], correct: 0, correction: 'العلامتان 9,5 و 9,75 جزؤهما الصحيح 9؛ و $9{,}5=9{,}50<9{,}75$ .' },
        { label: 'التلاميذ الثلاثة الذين علاماتهم 14 وكسر، من الأكبر علامةً إلى الأصغر', options: ['ريم ثم ياسين ثم أيمن', 'ياسين ثم ريم ثم أيمن', 'أيمن ثم ياسين ثم ريم'], correct: 0, correction: 'أعشارهم 5 و 2 و 0: $14{,}5>14{,}25>14{,}05$ .' },
      ],
      explain: 'نقارن علامات التلاميذ كما نقارن أيّ أعداد عشرية.',
    },
    commonError: 'الظنّ أنّ 14,05 أكبر من 14,25 لأنّ 5 أكبر من 2 في الجزء الأخير.',
  },
];

/** « أقوّم تعلّماتي » 8 et 9 (p. 19) — repris dans le إختبار أولي (module 8). */
export const SELF = {
  8: { source: src('self-8', 19, 'أقوّم تعلّماتي', 8) },
  9: { source: src('self-9', 19, 'أقوّم تعلّماتي', 9) },
};

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque
 * distracteur FAUX. `kind` dit ce que le test recalcule : `trueStatement` (une seule option est une relation vraie), `larger`
 * (le plus grand de `pair`), `ascending` (une seule chaîne est croissante), `max` (le plus grand de `set`).
 */
export const FINAL = [
  { id: 'E1', skill: 'compare', lp: LP.P1, source: SELF[8].source, kind: 'trueStatement', stem: 'أيّ هذه المقارنات صحيحة؟',
    options: ['$7{,}09<7{,}5$', '$7{,}09>7{,}5$', '$7{,}5<7{,}09$', '$7{,}50<7{,}5$'], correct: 0, cols: 2,
    explain: 'الجزآن الصحيحان متساويان، ورقم الأعشار 0 أقل من 5، إذن $7{,}09<7{,}5$ . أمّا $7{,}50$ فيساوي $7{,}5$ .' },
  { id: 'E2', skill: 'zeros', lp: LP.P2, source: SELF[8].source, kind: 'trueStatement', stem: 'أيّ هذه المقارنات صحيحة؟',
    options: ['$2{,}40=2{,}4$', '$2{,}40>2{,}4$', '$2{,}04=2{,}4$', '$2{,}04>2{,}4$'], correct: 0, cols: 2,
    explain: 'الصفر الأخير بعد الفاصلة لا يغيّر العدد: $2{,}40=2{,}4$ . أمّا $2{,}04$ فرقم أعشاره 0، وهو أصغر من $2{,}4$ .' },
  { id: 'E3', skill: 'zeros', lp: LP.P2, source: null, kind: 'larger', pair: ['0,7', '0,25'], stem: 'أيّ العددين أكبر: $0{,}7$ أم $0{,}25$ ؟',
    options: ['$0{,}7$', '$0{,}25$', 'العددان متساويان'], correct: 0, cols: 3,
    explain: '$0{,}7=0{,}70$ ، و 70 جزءًا من مائة أكثر من 25 جزءًا. لا ننظر إلى 25 و 7 كأنّهما عددان طبيعيان.' },
  { id: 'E4', skill: 'order', lp: LP.P3, source: SELF[9].source, kind: 'ascending', stem: 'أيّ السلاسل الآتية مرتّبة ترتيبًا تصاعديًا؟',
    options: ['$3{,}99<4{,}03<4{,}13<4{,}3$', '$4{,}03<3{,}99<4{,}13<4{,}3$', '$3{,}99<4{,}13<4{,}03<4{,}3$', '$4{,}3<4{,}13<4{,}03<3{,}99$'], correct: 0, cols: 1,
    explain: 'أصغر جزء صحيح 3 فالعدد $3{,}99$ أوّلًا؛ ثم أعشار 4,03 و 4,13 و 4,3: 0 و 1 و 3.' },
  { id: 'E5', skill: 'order', lp: LP.P3, source: null, kind: 'max', set: ['12,09', '12,9', '12,085', '11,99'], stem: 'أيّ هذه الأعداد هو الأكبر: $12{,}09$ ، $12{,}9$ ، $12{,}085$ ، $11{,}99$ ؟',
    options: ['$12{,}9$', '$12{,}09$', '$12{,}085$', '$11{,}99$'], correct: 0, cols: 2,
    explain: '$11{,}99$ جزؤه الصحيح 11 فهو أصغر؛ والبقية جزؤها الصحيح 12: أعشارها 9 و 0 و 0 ، فالأكبر هو $12{,}9$ .' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
