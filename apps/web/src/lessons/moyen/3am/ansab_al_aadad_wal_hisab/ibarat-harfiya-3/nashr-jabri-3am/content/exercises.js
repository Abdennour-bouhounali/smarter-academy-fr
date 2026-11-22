/**
 * Les exercices du درس « نشر عبارات جبرية » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, autres contextes, la même
 * compétence). Chaque exercice porte en `source` l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace
 * (traçabilité de `check:textbook`) ; jamais montré à l'élève (`SourceTag` muet, `src()` sans `number`).
 * Les expressions sont des DONNÉES (`products` : { sign, f1, f2 } avec des termes { c, p }) : chaque option est écrite par `tex()` à partir de
 * ses termes, chaque clé est CALCULÉE ici (`expand`) et RE-vérifiée, avec un autre code, par ./content.test.js (neuf valeurs de x), qui
 * contrôle aussi que chaque distracteur est FAUX.
 * Destinations (docs/sources/3am/unit4/extraction.json) : act-3, ex-8, ex-15, ex-16, ex-18, now-59 ②, deep-43 (ب, جـ) → module 4 ;
 * `prep` (10, 11) → module 0 ; le reste des éléments de la leçon est repris par sa banque d'exercices.
 */
import { termsTex, expand, reduce } from '@smarter-academy/core/arithmetic/polynomials.js';
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '3am_nashr-jabri-3am_P1',
  P2: '3am_nashr-jabri-3am_P2',
  P3: '3am_nashr-jabri-3am_P3',
  P4: '3am_nashr-jabri-3am_P4',
};

/* ── Outils de rédaction ───────────────────────────────────────────────────────────────────────── */
const t = (c, p = 0) => ({ c, p });
const pr = (sign, f1, f2) => ({ sign, f1, f2 });
/** Des termes écrits en LaTeX, entre `$` : « $3x^2-5$ ». */
export const tex = (terms) => `$${termsTex(terms)}$`;
/** Le développement réduit d'une somme de produits (clé de chaque ligne). */
export const expandAll = (products) => reduce(products.flatMap((p) => expand(p.f1, p.f2).map((q) => ({ c: p.sign * q.c, p: q.p }))));
/** Une somme de produits en LaTeX : « 3(2-5x)-4(x-1) ». */
export const productsTex = (products) => products.map((p, i) => {
  const f = (terms) => (terms.length === 1 ? termsTex(terms) : `(${termsTex(terms)})`);
  const body = `${f(p.f1)}${f(p.f2)}`;
  return `${p.sign < 0 ? '-' : (i ? '+' : '')}${body}`;
}).join('');
const place = (right, wrongs, at) => { const opts = [...wrongs]; const i = at % (wrongs.length + 1); opts.splice(i, 0, right); return { options: opts, correct: i }; };
const row = (label, right, wrongs, at, correction, data) => ({ label, ...place(right, wrongs, at), correction, data });
/** « انشر وبسّط » : `products` développés, `wrongs` = des listes de termes FAUSSES. */
const expandRow = (products, wrongs, at, why, label) => {
  const result = expandAll(products);
  return row(label ?? `$${productsTex(products)}$`, tex(result), wrongs.map(tex), at, why, { kind: 'expand', products, result, wrongs });
};

/* ── Les exercices ─────────────────────────────────────────────────────────────────────────────── */
/** ex-8 — k(a ± b) : un facteur numérique ou monôme, des signes. */
export const ROWS_8 = [
  expandRow([pr(1, [t(5)], [t(2, 1), t(-3)])], [[t(10, 1), t(-3)], [t(10, 1), t(15)]], 0, 'العدد 5 يضرب الحدّين: $5\\times2x=10x$ و $5\\times(-3)=-15$.'),
  expandRow([pr(1, [t(-3)], [t(4), t(-2, 1)])], [[t(-6, 1), t(-12)], [t(6, 1), t(12)]], 1, '$(-3)\\times4=-12$ و $(-3)\\times(-2x)=+6x$ ، فنرتّب: $6x-12$.'),
  expandRow([pr(1, [t(3, 1)], [t(1, 1), t(4)])], [[t(3, 2), t(4)], [t(15, 2)]], 2, '$3x\\times x=3x^2$ و $3x\\times4=12x$.'),
  expandRow([pr(1, [t(-2, 1)], [t(5), t(-3, 1)])], [[t(-6, 2), t(-10, 1)], [t(6, 2), t(10, 1)]], 0, '$(-2x)\\times5=-10x$ و $(-2x)\\times(-3x)=+6x^2$ ، فنرتّب: $6x^2-10x$.'),
  expandRow([pr(1, [t(-4)], [t(-1, 1), t(-2)])], [[t(-4, 1), t(-8)], [t(4, 1), t(-8)]], 1, 'كل جداء عددين سالبين موجب: $(-4)(-x)=4x$ و $(-4)(-2)=8$.'),
];

/** ex-16 — (a + b)(c + d) : quatre produits, des signes, deux termes semblables à réunir. */
export const ROWS_16 = [
  expandRow([pr(1, [t(1, 1), t(2)], [t(1, 1), t(7)])], [[t(1, 2), t(14)], [t(1, 2), t(14, 1), t(9)]], 0, 'أربعة جداءات: $x^2+7x+2x+14=x^2+9x+14$.'),
  expandRow([pr(1, [t(1, 1), t(-3)], [t(1, 1), t(5)])], [[t(1, 2), t(-15)], [t(1, 2), t(-2, 1), t(-15)]], 1, '$x^2+5x-3x-15=x^2+2x-15$.'),
  expandRow([pr(1, [t(2, 1), t(1)], [t(3), t(-1, 1)])], [[t(-2, 2), t(7, 1), t(3)], [t(2, 2), t(5, 1), t(3)]], 2, '$6x-2x^2+3-x=-2x^2+5x+3$.'),
  expandRow([pr(1, [t(3, 1), t(-4)], [t(2, 1), t(-5)])], [[t(6, 2), t(-23, 1), t(-20)], [t(6, 2), t(-7, 1), t(20)]], 0, '$6x^2-15x-8x+20$ : جداء $-4$ و $-5$ يساوي $+20$.'),
];

/** now-59 ② — deux sommes de produits à développer puis réduire. */
export const ROWS_59 = [
  expandRow([pr(1, [t(2, 1)], [t(3), t(-4, 1)]), pr(-1, [t(5)], [t(1, 1), t(-2)])], [[t(-8, 2), t(1, 1), t(-10)], [t(-8, 2), t(11, 1), t(10)]], 1,
    'نشر كل جداء: $6x-8x^2-5x+10$ ثم نجمع: $-8x^2+x+10$. الإشارة $-$ قبل $5(x-2)$ تغيّر إشارة الحدّين.'),
  expandRow([pr(1, [t(-1, 1), t(4)], [t(2), t(3, 1)])], [[t(-3, 2), t(14, 1), t(8)], [t(-3, 2), t(10, 1), t(-8)]], 2,
    '$-2x-3x^2+8+12x=-3x^2+10x+8$.'),
];

/** act-2-like : la même aire comptée de deux façons (rectangle de 4 m de large). */
const AREA = [
  row('طول الأرض كلها بدلالة $x$', '$x+6$', ['$6x$', '$x-6$'], 0, 'العشب طوله $x$ والأزهار طولها $6$: الطول كله $x+6$.', { kind: 'text' }),
  row('مساحتها كجداء لبعديها', '$4(x+6)$', ['$4x+6$', '$4+(x+6)$'], 1, 'المساحة جداء العرض 4 في الطول $(x+6)$ كله.', { kind: 'text' }),
  row('مساحتها كمجموع مساحة العشب ومساحة الأزهار', '$4x+24$', ['$4x+6$', '$4x+10$'], 2, 'العشب $4\\times x$ والأزهار $4\\times6=24$.', { kind: 'text' }),
  row('المساواة التي نستنتجها', '$4(x+6)=4x+24$', ['$4(x+6)=4x+6$', '$4(x+6)=4x\\times24$'], 0, 'عند $x=5$ : $4\\times11=44$ و $20+24=44$.', { kind: 'text' }),
  row('مستطيل مقسوم بنقطتين إلى أربعة أجزاء، بعداه $(a+b)$ و $(c+d)$ : مساحته كمجموع أجزائه', '$ac+ad+bc+bd$', ['$ac+bd$', '$ab+cd$'], 1, 'أربع مساحات: لكل حدّ من القوس الأول جداء مع كل حدّ من الثاني.', { kind: 'text' }),
];

/** ex-15 — l'erreur « le 3 qui n'est pas dans la parenthèse a été multiplié » (autres nombres). */
const ERROR_ROWS = [
  row('كتب زميل: $A=4+(x-3)\\times6=4\\times x\\times6-4\\times3\\times6=24x-72$. ما الخطأ؟', 'ضرب العدد 4 في القوس مع أنّه خارجه، فالعدد 6 وحده يضرب $(x-3)$', ['نسي تغيير إشارة $-3$', 'حسب $4\\times6$ خطأً'], 0,
    'عند $x=5$ : $4+(2)\\times6=16$ أمّا $24\\times5-72=48$.', { kind: 'text' }),
  row('النشر الصحيح مبسّطًا: $A=4+(x-3)\\times6$', '$6x-14$', ['$24x-72$', '$6x-18$'], 2,
    'ننشر $6(x-3)=6x-18$ ثم نضيف العدد 4 الذي بقي كما هو: $6x-18+4=6x-14$.', { kind: 'sumExpand', constant: 4, product: pr(1, [t(6)], [t(1, 1), t(-3)]), result: [t(6, 1), t(-14)], wrongs: [[t(24, 1), t(-72)], [t(6, 1), t(-18)]] }),
];

/** ex-18 — le nouveau développement d'un camarade, à contrôler par une valeur. */
const CHECK_ROWS = [
  row('كتب زميل: $(3x+1)(x+4)=3x^2+12x+4$. عند $x=1$ يعطي الطرف الأول 20 والطرف الثاني', '$19$', ['$20$', '$16$'], 0, '$3+12+4=19$ وهو لا يساوي 20، فالنشر خاطئ.', { kind: 'text' }),
  expandRow([pr(1, [t(3, 1), t(1)], [t(1, 1), t(4)])], [[t(3, 2), t(12, 1), t(4)], [t(3, 2), t(7, 1), t(4)]], 1, 'أربعة جداءات: $3x^2+12x+x+4=3x^2+13x+4$. نسي الزميل الجداء $1\\times x$.', '$(3x+1)(x+4)$ بعد نشرها وتبسيطها'),
];

export const EXERCISES = [
  {
    id: 'act-3', source: src('act-3', 57, 'أنشطة', 3), learningPointId: LP.P3, difficulty: 'facile',
    statement: 'قطعة أرض مستطيلة عرضها 4 م، يُزرع عشب على طول $x$ م منها وتُغرس أزهار على 6 م الباقية.',
    interaction: 'batch',
    question: { rows: AREA, explain: 'مساحة المستطيل جداء بعديه، وهي أيضًا مجموع مساحات أجزائه: النتيجتان متساويتان.' },
    commonError: 'ضرب العدد في الحدّ الأول وحده، أو جمعه بدل ضربه.',
  },
  {
    id: 'ex-8', source: src('ex-8', 62, 'توزيعية الضرب'), learningPointId: LP.P1, difficulty: 'facile',
    statement: 'انشر كل عبارة وبسّطها، ثم اختر الناتج الصحيح.',
    interaction: 'batch',
    question: { rows: ROWS_8, explain: 'العامل يضرب كل حدّ في القوس مع إشارته: $k(a+b)=ka+kb$.' },
    commonError: 'ضرب العامل في الحدّ الأول وحده، أو إهمال إشارة الجداء عندما يكون العامل سالبًا.',
  },
  {
    id: 'ex-15', source: src('ex-15', 63, 'توزيعية الضرب'), learningPointId: LP.P1, difficulty: 'moyen',
    statement: 'طُلب نشر العبارة $A=4+(x-3)\\times6$. هذه ورقة زميلك.',
    interaction: 'batch',
    question: { rows: ERROR_ROWS, explain: 'العامل يضرب القوس الذي بجانبه فقط، والحدّ الذي ليس في القوس يبقى كما هو.' },
    commonError: 'ضرب حدّ خارج القوس في العامل أيضًا.',
  },
  {
    id: 'ex-16', source: src('ex-16', 63, 'نشر العبارة (a+b)(c+d)'), cites: [src('ex-17', 63, 'نشر العبارة (a+b)(c+d)')], learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'انشر وبسّط كل جداء، ثم اختر الناتج الصحيح.',
    interaction: 'batch',
    question: { rows: ROWS_16, explain: 'كل حدّ من القوس الأول يضرب كل حدّ من الثاني (أربعة جداءات) ثم نجمع المتشابهة.' },
    commonError: 'ضرب الحدّين الأوّلين والأخيرين فقط، أو إهمال إشارة جداء عددين سالبين.',
  },
  {
    id: 'ex-18', source: src('ex-18', 63, 'نشر العبارة (a+b)(c+d)'), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'نشر زميلك الجداء ثم تبسيطه، فأردتَ مراقبة عمله بقيمة لـ $x$.',
    interaction: 'batch',
    question: { rows: CHECK_ROWS, explain: 'إذا اختلفت قيمتا العبارة وصورتها المنشورة عند قيمة واحدة فالنشر خاطئ.' },
    commonError: 'نسيان أحد الجداءات الأربعة.',
  },
  {
    id: 'now-59', source: src('now-59', 59, 'دوري الآن', 2), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'انشر وبسّط كلًّا من العبارتين، ورتّب الحدود تنازليًا.',
    interaction: 'batch',
    question: { rows: ROWS_59, explain: 'ننشر كل جداء مع إشارته (الإشارة $-$ قبل الجداء تغيّر إشارة حدّيه) ثم نجمع المتشابهة ونرتّب.' },
    commonError: 'عدم تغيير إشارة الجداء الذي تسبقه إشارة $-$ ، أو عدم جمع المتشابهة.',
  },
  {
    id: 'deep-43', source: src('deep-43', 67, 'أتعمّق'), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'صحيح أم خاطئ؟ برّر بالنشر والتبسيط، ولا تكتفِ بتجريب قيمة واحدة.',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'من أجل كل $x$ : $-4(x-5)=-4x-20$.', answer: false, why: 'العامل $-4$ يضرب $-5$ أيضًا: $(-4)(-5)=+20$ ، فالناتج $-4x+20$.', data: { products: [pr(1, [t(-4)], [t(1, 1), t(-5)])], claim: [t(-4, 1), t(-20)] } },
        { text: 'من أجل كل $x$ : $(x+3)(x-5)+15=x(x-2)$.', answer: true, why: '$x^2-5x+3x-15+15=x^2-2x$.', data: { products: [pr(1, [t(1, 1), t(3)], [t(1, 1), t(-5)]), pr(1, [t(15)], [t(1)])], claim: [t(1, 2), t(-2, 1)] } },
        { text: 'من أجل كل $x$ : $2(x-1)+3(x+4)=5x+10$.', answer: true, why: '$2x-2+3x+12=5x+10$.', data: { products: [pr(1, [t(2)], [t(1, 1), t(-1)]), pr(1, [t(3)], [t(1, 1), t(4)])], claim: [t(5, 1), t(10)] } },
        { text: 'من أجل كل $x$ : $(x+4)(x-4)=x^2-8$.', answer: false, why: '$x^2-4x+4x-16=x^2-16$ : الحدّان الوسطيان يتلاشيان.', data: { products: [pr(1, [t(1, 1), t(4)], [t(1, 1), t(-4)])], claim: [t(1, 2), t(-8)] } },
        { text: 'من أجل كل $x$ : $5(2-x)=10-x$.', answer: false, why: 'العدد 5 يضرب الحدّين: $5(2-x)=10-5x$.', data: { products: [pr(1, [t(5)], [t(2), t(-1, 1)])], claim: [t(-1, 1), t(10)] } },
      ],
      explain: 'للحكم على مساواة من أجل كل قيمة ننشر الطرفين ونقارنهما، ولا تكفي قيمة واحدة.',
    },
    commonError: 'الاكتفاء بتجريب قيمة واحدة، أو نسيان جداء عند النشر.',
  },
];

/** « أؤكّد تعلّماتي » 4, 5, 7, 8 (p. 65) — la source des épreuves du إختبار أولي (module 8), réécrites avec d'autres nombres. */
export const SELF = {
  4: { source: src('self-4', 65, 'أؤكّد تعلّماتي', 4) },
  7: { source: src('self-7', 65, 'أؤكّد تعلّماتي', 7) },
};

/**
 * Les cinq épreuves du إختبار أولي (module 8), en DONNÉES pour que ./content.test.js recalcule chaque clé et vérifie chaque distracteur FAUX.
 * `kind` dit ce que le test recalcule : `areaPair` (la seule paire d'écritures qui donne l'aire), `expand` (une somme de produits développée).
 */
export const FINAL = [
  { id: 'E1', skill: 'area', lp: LP.P3, source: null, kind: 'areaPair',
    stem: 'مستطيل بعداه $(x+2)$ و $5$. أيّ زوج من العبارتين يعبّر كلٌّ منهما عن مساحته؟',
    options: ['$5(x+2)$ و $5x+10$', '$5(x+2)$ و $5x+2$', '$5+(x+2)$ و $5x+10$', '$5x+2$ و $5x+10$'], correct: 0, cols: 1,
    pairs: [{ left: [pr(1, [t(5)], [t(1, 1), t(2)])], right: [t(5, 1), t(10)] }, { left: [pr(1, [t(5)], [t(1, 1), t(2)])], right: [t(5, 1), t(2)] },
      { left: [pr(1, [t(1)], [t(1, 1), t(7)])], right: [t(5, 1), t(10)] }, { left: [pr(1, [t(1)], [t(5, 1), t(2)])], right: [t(5, 1), t(10)] }],
    area: [pr(1, [t(5)], [t(1, 1), t(2)])],
    explain: 'المساحة جداء البعدين $5(x+2)$ وهي مجموع مساحتين $5x+10$ : النشر هو الانتقال من الأولى إلى الثانية.' },
  { id: 'E2', skill: 'one', lp: LP.P1, source: SELF[4].source, kind: 'expand', products: [pr(1, [t(-3)], [t(2, 1), t(-5)])], wrongs: [[t(-6, 1), t(-15)], [t(6, 1), t(-15)], [t(-6, 1), t(5)]],
    stem: 'انشر العبارة $-3(2x-5)$.',
    options: ['$-6x+15$', '$-6x-15$', '$6x-15$', '$-6x+5$'], correct: 0, cols: 2,
    explain: '$(-3)\\times2x=-6x$ و $(-3)\\times(-5)=+15$.' },
  { id: 'E3', skill: 'two', lp: LP.P2, source: null, kind: 'expand', products: [pr(1, [t(1, 1), t(3)], [t(1, 1), t(-4)])], wrongs: [[t(1, 2), t(1, 1), t(-12)], [t(1, 2), t(-12)], [t(1, 2), t(-1, 1), t(12)]],
    stem: 'انشر وبسّط $(x+3)(x-4)$.',
    options: ['$x^2-x-12$', '$x^2+x-12$', '$x^2-12$', '$x^2-x+12$'], correct: 0, cols: 2,
    explain: '$x^2-4x+3x-12=x^2-x-12$.' },
  { id: 'E4', skill: 'order', lp: LP.P4, source: SELF[7].source, kind: 'expand', products: [pr(1, [t(2)], [t(1, 1), t(-1)]), pr(1, [t(1, 1), t(3)], [t(1, 1), t(-2)])], wrongs: [[t(1, 2), t(3, 1), t(-4)], [t(1, 2), t(1, 1), t(-8)], [t(1, 2), t(3, 1), t(8)]],
    stem: 'انشر وبسّط $A=2(x-1)+(x+3)(x-2)$.',
    options: ['$x^2+3x-8$', '$x^2+3x-4$', '$x^2+x-8$', '$x^2+3x+8$'], correct: 0, cols: 2,
    explain: '$2x-2+x^2+x-6=x^2+3x-8$.' },
  { id: 'E5', skill: 'order', lp: LP.P4, source: null, kind: 'expand', products: [pr(1, [t(1, 1), t(-1)], [t(1, 1), t(5)]), pr(-1, [t(1, 1)], [t(1, 1), t(3)])], wrongs: [[t(1, 2), t(1, 1), t(-5)], [t(7, 1), t(-5)], [t(1, 1), t(5)]],
    stem: 'انشر وبسّط $B=(x-1)(x+5)-x(x+3)$.',
    options: ['$x-5$', '$x^2+x-5$', '$7x-5$', '$x+5$'], correct: 0, cols: 2,
    explain: '$x^2+4x-5-x^2-3x=x-5$ : يتلاشى الحدّان $x^2$.' },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
