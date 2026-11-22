/**
 * Les exercices du درس « تبسيط عبارة جبرية وحذف الأقواس » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, autres contextes, la
 * même compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il
 * remplace (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` muet, `src()` sans `number`).
 * Les expressions sont des DONNÉES (termes { c, p } et groupes de brackets.js) : chaque option est écrite par `tex()` à partir de ses termes,
 * chaque clé est CALCULÉE ici et RE-vérifiée, avec un autre code, par ./content.test.js, qui contrôle aussi que chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit4/extraction.json) : act-1, act-2, ex-5 (+ ex-7), ex-6, ex-12 (+ ex-13), ex-14 (+ deep-36),
 * deep-43 (+ now-59 ①) → module 4 ; self-1, self-2, self-6 → le إختبار أولي (module 8).
 */
import { termsTex } from '@smarter-academy/core/arithmetic/polynomials.js';
import * as B from '@smarter-academy/core/arithmetic/brackets.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_tabsit-hadhf-aqwas_P1',
  P2: '3am_tabsit-hadhf-aqwas_P2',
  P3: '3am_tabsit-hadhf-aqwas_P3',
  P4: '3am_tabsit-hadhf-aqwas_P4',
};

/* ── Outils de rédaction ───────────────────────────────────────────────────────────────────────── */
const t = (c, p = 0) => ({ c, p });
const g = B.group;
/** Des termes écrits en LaTeX, entre `$` : « $3x^2-5$ ». */
export const tex = (terms, letter = 'x') => `$${termsTex(terms, { letter })}$`;
/** Une expression à parenthèses en LaTeX, entre `$`. */
export const texE = (expr, letter = 'x') => `$${B.expressionTex(expr, { letter })}$`;
/** Les options d'une ligne : la bonne à la position `at`, les autres dans l'ordre. */
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction, data) => ({ label, ...place(right, wrongs, at), correction, data });

/** « اكتب بدون أقواس وبأبسط شكل » : `expr` à parenthèses, la forme réduite est calculée, `wrongs` = des listes de termes FAUSSES. */
const bracketRow = (expr, wrongs, at, why, letter = 'x') => {
  const result = B.simplify(expr);
  return row(texE(expr, letter), tex(result, letter), wrongs.map((w) => tex(w, letter)), at, why, { kind: 'brackets', expr, result, wrongs, letter });
};
/** Une somme ou un produit de monômes à simplifier : `terms` (somme) ou `factors` (produit). */
const sumRow = (label, terms, wrongs, at, why, letter = 'x') => {
  const result = B.simplify(terms);
  return row(label, tex(result, letter), wrongs.map((w) => tex(w, letter)), at, why, { kind: 'sum', terms, result, wrongs, letter });
};
const prodRow = (label, factors, wrongs, at, why, letter = 'x') => {
  const result = [B.multiplyMonomials(...factors)];
  return row(label, tex(result, letter), wrongs.map((w) => tex(w, letter)), at, why, { kind: 'product', factors, result, wrongs, letter });
};

/* ── Les exercices ─────────────────────────────────────────────────────────────────────────────── */
export const ROWS_12 = [
  bracketRow([t(5, 1), g(-1, [t(3, 1), t(2)])], [[t(2, 1), t(2)], [t(8, 1), t(-2)]], 0,
    'القوسان مسبوقان بـ $-$ فتتغيّر إشارة كل حدّ بينهما: $5h-3h-2=2h-2$.', 'h'),
  bracketRow([t(-6), g(1, [t(-1, 1), t(4)])], [[t(1, 1), t(-2)], [t(-1, 1), t(-10)]], 1,
    'القوسان مسبوقان بـ $+$ فنُبقي الإشارات: $-6-x+4=-x-2$.'),
  bracketRow([t(8), g(-1, [t(-1, 1), t(3)])], [[t(-1, 1), t(11)], [t(1, 1), t(11)]], 2,
    'القوسان مسبوقان بـ $-$ : $8+x-3=x+5$.'),
  bracketRow([t(15), g(-1, [t(3), t(-5, 1)]), g(1, [t(2, 1), t(-7)])], [[t(-3, 1), t(5)], [t(3, 1), t(5)]], 0,
    'نغيّر إشارتي حدّي القوسين الأوّلين ونُبقي إشارتي الأخيرين: $15-3+5a+2a-7=7a+5$.', 'a'),
  bracketRow([t(2, 1), t(9), g(-1, [t(5, 1), t(4)]), g(1, [t(1), t(-6, 1)])], [[t(-9, 1), t(14)], [t(3, 1), t(6)]], 1,
    'نحذف: $2a+9-5a-4+1-6a$ ثم نجمع المتشابهة: $(2-5-6)a+(9-4+1)=-9a+6$.', 'a'),
];

export const ROWS_5 = [
  prodRow('$6x\\times4x$', [t(6, 1), t(4, 1)], [[t(10, 2)], [t(24, 1)]], 0, 'نضرب الأعداد معًا والحروف معًا: $6\\times4=24$ و $x\\times x=x^2$.'),
  prodRow('$2\\times5x\\times3x$', [t(2), t(5, 1), t(3, 1)], [[t(30, 1)], [t(10, 3)]], 1, '$2\\times5\\times3=30$ و $x\\times x=x^2$.'),
  sumRow('$9x+4x+x$', [t(9, 1), t(4, 1), t(1, 1)], [[t(14, 2)], [t(13, 1)]], 2, 'حدود متشابهة: $(9+4+1)x=14x$.'),
  sumRow('$8x-11x$', [t(8, 1), t(-11, 1)], [[t(3, 1)], [t(-3, 2)]], 0, '$(8-11)x=-3x$.'),
  sumRow('$5y^2+2y^2$', [t(5, 2), t(2, 2)], [[t(7, 4)], [t(10, 2)]], 1, 'نجمع المعاملين ونُبقي $y^2$ : $7y^2$.', 'y'),
];
/** Dernière ligne de ex-5 : deux termes NON semblables ne se réunissent pas (ex-7 du manuel). */
const ROW_IRREDUCIBLE = {
  label: '$3x^2+2x$',
  options: ['لا يمكن تبسيطها أكثر', '$5x^2$', '$5x^3$'], correct: 0,
  correction: '$x^2$ و $x$ ليسا متشابهين. عند $x=2$ قيمة العبارة 16، وقيمة $5x^2$ تساوي 20، وقيمة $5x^3$ تساوي 40.',
  data: { kind: 'irreducible', terms: [t(3, 2), t(2, 1)], wrongs: [[t(5, 2)], [t(5, 3)]] },
};

/** act-2 : deux chaînes de calcul écrites par trois élèves ; la valeur de chacune est CALCULÉE ici. */
const CHAINS = [
  { story: 'خزّان فيه 80 لترًا، استُهلك منها 23 لترًا في الذهاب و 18 لترًا في العودة', keyValue: 39,
    items: [['$80-(23+18)$', 80 - (23 + 18)], ['$80-23-18$', 80 - 23 - 18], ['$80-(23-18)$', 80 - (23 - 18)]] },
  { story: 'حافلة فيها 45 راكبًا، صعد منها إلى المحطة 12 ونزل 5', keyValue: 52,
    items: [['$45+12-5$', 45 + 12 - 5], ['$45-12-5$', 45 - 12 - 5], ['$45+(12-5)$', 45 + (12 - 5)]] },
];
const CHAIN_ROWS = CHAINS.flatMap((c) => c.items.map(([expr, value], i) => ({
  text: `${expr} تحسب ما يبقى أو ما يصير في المسألة (${c.story === CHAINS[0].story ? 'الخزّان' : 'الحافلة'}).`,
  answer: value === c.keyValue,
  why: value === c.keyValue ? `${expr} تساوي ${value} وهي القيمة الصحيحة.` : `${expr} تساوي ${value} لا ${c.keyValue}: القوسان غيّرا ما نطرحه.`,
  data: { value, keyValue: c.keyValue, i },
})));

export const EXERCISES = [
  {
    id: 'act-1', source: src('act-1', 56, 'أنشطة'), learningPointId: LP.P4, difficulty: 'facile',
    statement: 'شريط زخرفة مؤلّف من أربع قطع متتابعة، طول كلٍّ منها $3x$. وعلى لوح من الخشب مستطيل بعداه $5x$ و $3x$ قُسّم إلى مربّعات ضلع كلٍّ منها $x$.',
    interaction: 'batch',
    question: {
      rows: [
        row('العبارة التي هي جداء', '$4\\times(3x)$', ['$3x+3x+3x+3x$'], 0, 'آخر عملية فيها ضرب: أربعة أضعاف $3x$.', { kind: 'form', sum: false }),
        row('العبارة التي هي مجموع', '$3x+3x+3x+3x$', ['$4\\times(3x)$'], 1, 'آخر عملية فيها جمع: أربع قطع طول كلٍّ منها $3x$.', { kind: 'form', sum: true }),
        row('طول الشريط مبسّطًا', '$12x$', ['$7x$', '$12x^2$'], 0, '$4\\times3x=12x$ ، وكذلك $3x+3x+3x+3x=12x$.', { kind: 'num', value: [12, 1] }),
        row('عدد المربّعات التي تغطّي اللوح', '$15$', ['$8$', '$15x$'], 1, 'خمسة أعمدة وثلاثة صفوف: $5\\times3=15$ مربّعًا.', { kind: 'num', value: [15, 0] }),
        row('مساحة اللوح مبسّطة', '$15x^2$', ['$8x$', '$15x$'], 2, 'خمسة عشر مربّعًا مساحة كلٍّ منها $x^2$ ، وكذلك $5x\\times3x=15x^2$.', { kind: 'num', value: [15, 2] }),
      ],
      explain: 'الجداء نبسّطه بضرب الأعداد معًا والحروف معًا، والمجموع بجمع معاملات الحدود المتشابهة.',
    },
    commonError: 'الخلط بين ضرب $x$ في $x$ ($x^2$) وجمع $x$ مع $x$ ($2x$)، أو بين المجموع والجداء.',
  },
  {
    id: 'act-2', source: src('act-2', 56, 'أنشطة'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'كتب ثلاثة تلاميذ سلسلة حساب لكل من المسألتين: خزّان فيه 80 لترًا استُهلك منها 23 لترًا في الذهاب و 18 لترًا في العودة، وحافلة فيها 45 راكبًا صعد منها 12 ونزل 5. اختر السلاسل الصحيحة.',
    interaction: 'trueFalse',
    question: { rows: CHAIN_ROWS, explain: 'قوسان مسبوقان بـ $-$ يغيّران إشارة كل ما بينهما، أمّا المسبوقان بـ $+$ فلا يغيّران شيئًا.' },
    commonError: 'ظنّ أنّ القوسين لا يغيّران شيئًا حتى بعد الإشارة $-$.',
  },
  {
    id: 'ex-5', source: src('ex-5', 62, 'توزيعية الضرب'), cites: [src('ex-7', 62, 'توزيعية الضرب')], learningPointId: LP.P1, difficulty: 'facile',
    statement: 'اكتب كلًّا من العبارات الآتية على أبسط شكل ممكن.',
    interaction: 'batch',
    question: { rows: [...ROWS_5, ROW_IRREDUCIBLE], explain: 'نجمع المعاملات في المجموع، ونضرب الأعداد والحروف في الجداء، ولا نخلط حدّين غير متشابهين.' },
    commonError: 'جمع حدّين غير متشابهين، أو جمع الأسس عند جمع الحدود.',
  },
  {
    id: 'ex-6', source: src('ex-6', 62, 'توزيعية الضرب'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'كتب زميل لك المساواتين الآتيتين، وكلتاهما خاطئة.',
    interaction: 'batch',
    question: {
      rows: [
        row('« $4x-3=x$ » : لماذا هذه المساواة خاطئة؟', '$4x$ و $3$ ليسا حدّين متشابهين فلا يُجمعان', ['$4x-3$ تساوي $7x$', 'الطرح لا يُجرى على الحروف'], 0,
          'عند $x=2$ قيمة $4x-3$ تساوي 5 وقيمة $x$ تساوي 2.', { kind: 'text' }),
        row('« $3x+7x=10x^2$ » : ما الصواب؟', '$3x+7x=10x$ : نجمع المعاملين ونُبقي الحرف كما هو', ['$3x+7x=21x$', '$3x+7x=10x^2$ صحيحة'], 1,
          'عند $x=2$ قيمة $3x+7x$ تساوي 20، أمّا $10x^2$ فتساوي 40.', { kind: 'text' }),
      ],
      explain: 'بعد التبسيط يبقى لكل حدّ جزؤه الحرفي، ولا نجمع إلا حدودًا لها الجزء الحرفي نفسه.',
    },
    commonError: 'جمع حدّين غير متشابهين، أو رفع الحرف إلى القوة 2 عند جمع حدّين.',
  },
  {
    id: 'ex-12', source: src('ex-12', 62, 'حذف الأقواس'), cites: [src('ex-13', 63, 'حذف الأقواس')], learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'اكتب كل عبارة بدون أقواس وبأبسط شكل ممكن، ثم اختر الصورة الصحيحة.',
    interaction: 'batch',
    question: { rows: ROWS_12, explain: 'نحذف الأقواس بقاعدتها (نغيّر كل الإشارات بعد $-$) ثم نجمع الحدود المتشابهة.' },
    commonError: 'تغيير إشارة الحدّ الأول وحده بعد الإشارة $-$ ، أو إبقاء كل الإشارات.',
  },
  {
    id: 'ex-14', source: src('ex-14', 63, 'حذف الأقواس'), cites: [src('deep-36', 66, 'أتعمّق')], learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'في المثلث ABC قيس الزاوية $\\widehat{B}$ هو $x$ درجة وقيس الزاوية $\\widehat{C}$ هو $(x-20)$ درجة. مجموع قيوس زوايا مثلث 180 درجة.',
    interaction: 'batch',
    question: {
      rows: [
        row('قيس الزاوية $\\widehat{A}$ بدلالة $x$ على أبسط شكل', '$200-2x$', ['$160-2x$', '$180-x$'], 0, '$180-x-(x-20)=180-x-x+20=200-2x$ : لا ننسى تغيير إشارة $-20$.', { kind: 'angle' }),
        row('قيس $\\widehat{A}$ عندما $x=45$', '$110$', ['$70$', '$135$'], 1, '$200-2\\times45=110$.', { kind: 'angleAt', x: 45, value: 110 }),
        row('هل يمكن أن يكون $x=120$؟', 'لا: قيس $\\widehat{A}$ يصير سالبًا', ['نعم', 'نعم لأنّ $120<180$'], 0, '$200-2\\times120=-40$ وقيس زاوية لا يكون سالبًا.', { kind: 'angleAt', x: 120, value: -40 }),
        row('محيط مثلث أضلاعه $4x+12$ و $3x+9$ و $5x+15$ (بالمتر)', '$12x+36$', ['$12x^3+36$', '$12x+15$'], 2, 'نجمع: $(4+3+5)x+(12+9+15)=12x+36$.', { kind: 'perimeter' }),
      ],
      explain: 'عند طرح مقدار بين قوسين نغيّر إشارة كل حدّ فيه، ثم نجمع المتشابهة.',
    },
    commonError: 'نسيان تغيير إشارة الحدّ الثاني من القوسين: $180-x-x-20$.',
  },
  {
    id: 'deep-43', source: src('deep-43', 67, 'أتعمّق'), cites: [src('now-59', 59, 'دوري الآن', 1)], learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'صحيح أم خاطئ؟ برّر بحذف الأقواس والتبسيط.',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'من أجل كل $x$ : $5x-(3x+2)=2x-2$.', answer: true, why: '$5x-3x-2=2x-2$.', data: { expr: [t(5, 1), g(-1, [t(3, 1), t(2)])], claim: [t(2, 1), t(-2)] } },
        { text: 'من أجل كل $x$ : $7-(x-3)=7-x-3$.', answer: false, why: 'تتغيّر إشارة $-3$ أيضًا: $7-(x-3)=7-x+3=10-x$.', data: { expr: [t(7), g(-1, [t(1, 1), t(-3)])], claim: [t(-1, 1), t(4)] } },
        { text: 'مجموع عددين طبيعيين متتابعين $n$ و $n+1$ يساوي $2n+1$ ، فهو عدد فردي دائمًا.', answer: true, why: '$n+(n+1)=2n+1$ وهو أكبر بواحد من عدد زوجي.', data: { expr: [t(1, 1), g(1, [t(1, 1), t(1)])], claim: [t(2, 1), t(1)] } },
        { text: 'من أجل كل $x$ : $-2x\\times3x=-6x$.', answer: false, why: 'نضرب الأعداد والحروف: $-2\\times3=-6$ و $x\\times x=x^2$ ، فالناتج $-6x^2$.', data: { kind: 'product' } },
        { text: 'من أجل كل $x$ : $-2x^2+7-(-x+5x^2)+(-9x+1)=-7x^2-8x+8$.', answer: true, why: '$-2x^2+7+x-5x^2-9x+1=-7x^2-8x+8$.', data: { expr: [t(-2, 2), t(7), g(-1, [t(-1, 1), t(5, 2)]), g(1, [t(-9, 1), t(1)])], claim: [t(-7, 2), t(-8, 1), t(8)] } },
        { text: 'من أجل كل $a$ : $12-(2-4a)=10-4a$.', answer: false, why: 'تتغيّر إشارة $-4a$ أيضًا: $12-2+4a=10+4a$.', data: { expr: [t(12), g(-1, [t(2), t(-4, 1)])], claim: [t(-4, 1), t(10)] } },
      ],
      explain: 'للحكم على مساواة من أجل كل قيمة نبسّط الطرفين ونقارنهما، ولا يكفي اختبار قيمة واحدة.',
    },
    commonError: 'الاكتفاء بتجريب قيمة واحدة للحكم على مساواة.',
  },
];

/** « أؤكّد تعلّماتي » 1, 2, 6 (p. 65) — réécrites avec d'autres nombres dans le إختبار أولي (module 8). */
export const SELF = {
  1: { source: src('self-1', 65, 'أؤكّد تعلّماتي', 1) },
  2: { source: src('self-2', 65, 'أؤكّد تعلّماتي', 2) },
  6: { source: src('self-6', 65, 'أؤكّد تعلّماتي', 6) },
};

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque distracteur FAUX.
 * `kind` dit ce que le test recalcule : `sumForm` (la seule option qui est une SOMME), `product` (un produit de monômes),
 * `sum` (une somme à réduire), `brackets` (une expression à parenthèses réduite).
 */
export const FINAL = [
  { id: 'E1', skill: 'form', lp: LP.P4, source: SELF[1].source, kind: 'sumForm',
    stem: 'أيّ هذه العبارات تُمثّل مجموعًا؟',
    options: ['$(2x+5)(x+1)$', '$6-3x+x^2$', '$(4x-1)^2$', '$3x(2x-5)$'], correct: 1, cols: 1,
    explain: 'آخر عملية في $6-3x+x^2$ جمع (وطرح)، أمّا في العبارات الأخرى فآخر عملية ضرب.' },
  { id: 'E2', skill: 'simplify', lp: LP.P1, source: SELF[2].source, kind: 'product', factors: [t(-6, 1), t(4, 1)], wrongs: [[t(-24, 1)], [t(-2, 2)], [t(-10, 2)]],
    stem: 'بسّط العبارة $-6x\\times4x$.',
    options: ['$-24x^2$', '$-24x$', '$-2x^2$', '$-10x^2$'], correct: 0, cols: 2,
    explain: 'نضرب الأعداد: $-6\\times4=-24$ ، ونضرب الحروف: $x\\times x=x^2$.' },
  { id: 'E3', skill: 'simplify', lp: LP.P1, source: null, kind: 'sum', terms: [t(9, 2), t(-4, 1), t(-5, 2), t(1, 1)], wrongs: [[t(4, 2), t(3, 1)], [t(14, 2), t(-3, 1)], [t(4, 1), t(-3, 2)]],
    stem: 'بسّط العبارة $9x^2-4x-5x^2+x$.',
    options: ['$4x^2-3x$', '$4x^2+3x$', '$14x^2-3x$', '$4x-3x^2$'], correct: 0, cols: 2,
    explain: 'نجمع حدود $x^2$ : $9-5=4$ ، وحدود $x$ : $-4+1=-3$ ، فنجد $4x^2-3x$.' },
  { id: 'E4', skill: 'plus', lp: LP.P2, source: null, kind: 'brackets', expr: [t(12), g(1, [t(3, 1), t(-7)])], wrongs: [[t(3, 1), t(-19)], [t(-3, 1), t(5)], [t(3, 1), t(19)]],
    stem: 'اكتب $12+(3x-7)$ بدون أقواس وفي أبسط شكل.',
    options: ['$3x+5$', '$3x-19$', '$-3x+5$', '$3x+19$'], correct: 0, cols: 2,
    explain: 'القوسان مسبوقان بـ $+$ فنُبقي الإشارتين: $12+3x-7=3x+5$.' },
  { id: 'E5', skill: 'minus', lp: LP.P3, source: SELF[6].source, kind: 'brackets', expr: [g(1, [t(6, 1), t(2)]), g(-1, [t(4, 1), t(-5)])], wrongs: [[t(2, 1), t(-3)], [t(10, 1), t(-3)], [t(10, 1), t(7)]],
    stem: 'بسّط العبارة $A=(6a+2)-(4a-5)$ بعد حذف القوسين.',
    options: ['$2a+7$', '$2a-3$', '$10a-3$', '$10a+7$'], correct: 0, cols: 2,
    explain: 'القوسان الثانيان مسبوقان بـ $-$ فتتغيّر إشارة كل حدّ: $6a+2-4a+5=2a+7$.' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
