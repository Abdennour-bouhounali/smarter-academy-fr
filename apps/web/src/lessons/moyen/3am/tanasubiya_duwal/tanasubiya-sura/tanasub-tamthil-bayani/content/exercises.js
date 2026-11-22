/**
 * Les exercices du درس « التناسبية والتمثيل البياني » — RÉÉCRITS par la plateforme (guide §4ter-bis : autres nombres, même compétence). Chaque exercice porte en `source`
 * l'élément du manuel dont il est tiré et, dans `cites`, les autres éléments qu'il remplace (traçabilité de `check:textbook`) ; `src()` sans numéro, jamais montré à
 * l'élève. Chaque valeur est CALCULÉE ici avec `packages/core/arithmetic/graphs3.js` et RE-vérifiée par ./content.test.js avec un autre code (BigInt), qui contrôle aussi
 * que chaque distracteur est FAUX et REMESURE chaque figure.
 * Destinations (docs/sources/3am/unit6/extraction.json) : act-1, ex-1 … ex-5, deep-31, deep-32, deep-33, deep-41 → module 4 ; self-1, self-2 → le إختبار أولي (module 8).
 * `deep-33` (la preuve de y = ax par Thalès, étudié plus tard dans le manuel) n'est PAS posée : l'exercice qui la remplace fait CALCULER le même fait.
 */
import * as G from '@smarter-academy/core/arithmetic/graphs3.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { src } from '../../_unit/unitMeta.js';
import { planeFigure, brokenFigure } from './figures.js';

export const LP = {
  P1: '3am_tanasub-tamthil-bayani_P1',
  P2: '3am_tanasub-tamthil-bayani_P2',
  P3: '3am_tanasub-tamthil-bayani_P3',
  P4: '3am_tanasub-tamthil-bayani_P4',
};

const S = (id, page, section = 'أوظّف تعلّماتي') => src(id, page, section);
const num = (v) => Lin.toNumber(v);
const VERDICT = ['نقط على مستقيم يمرّ بـ $O$ : وضعية تناسبية', 'نقط على مستقيم لا يمرّ بـ $O$ : ليست تناسبية', 'نقط ليست على استقامة : ليست تناسبية'];
const KIND_INDEX = { prop: 0, aligned: 1, bent: 2 };

/* ── act-1 : trois offres de cahiers (APPLICATION de l'entrée) ───────────────────────────────────────────────────────── */
export const OFFERS = [
  { text: 'المحلّ الأول: $12$ دج للكرّاس الواحد.', rule: { a: '12' } },
  { text: 'المحلّ الثاني: $10$ دج للكرّاس الواحد مع $20$ دج ثمن بطاقة عضوية.', rule: { a: '10', b: '20' } },
  { text: 'المحلّ الثالث: $12$ دج للكرّاس من الأول إلى الخامس، ثم $8$ دج للكرّاس ابتداء من السادس.', rule: { a: '12', k: 5, a2: '8' } },
];
export const OFFER_XS = [2, 5, 8, 10];
const offerRow = (o) => {
  const pts = G.pointsOf(o.rule, OFFER_XS);
  const kind = G.classify(pts);
  const prices = pts.map((p) => G.text(p.y)).join(' ، ');
  const why = { prop: 'الثمن $12 \\times$ عدد الكرّاسات: كلّ النقط على مستقيم واحد يمرّ بـ $O$ .', aligned: 'النقط على مستقيم لكنّه يقطع المحور العمودي عند $20$ لا عند $0$ ( $20$ دج تُدفع مرّة واحدة ).', bent: 'بعد الكرّاس الخامس يتغيّر ثمن الكرّاس، فلا تبقى النقط على استقامة.' }[kind];
  return { label: `${o.text} الأثمان لـ $2$ و $5$ و $8$ و $10$ كرّاسات: $${prices}$ .`, options: VERDICT, correct: KIND_INDEX[kind], correction: why, kind };
};

/* ── ex-1 : trois graphiques ─────────────────────────────────────────────────────────────────────────────────────────── */
export const GRAPHS = [
  { id: 'g1', points: [[1, 2], [2, 4], [3, 6], [4, 8]] },
  { id: 'g2', points: [[1, 3], [2, 4], [3, 5], [4, 6]] },
  { id: 'g3', points: [[1, 1], [2, 3], [3, 6], [4, 10]] },
];
export const GRAPH_NAMES = ['الشكل (أ)', 'الشكل (ب)', 'الشكل (جـ)'];
const graphKind = (g) => G.classify(g.points.map(([x, y]) => G.pt(x, y)));
const GRAPH_WHY = {
  prop: 'النقط على مستقيم واحد يمرّ بـ $O$ : كلّ ترتيب ضعف الفاصلة.',
  aligned: 'النقط على مستقيم لكنّه لا يمرّ بـ $O$ : ترتيب الفاصلة $1$ هو $3$ بينما ترتيب $2$ هو $4$ لا $6$ .',
  bent: 'الفروق بين الترتيبات تكبر ($2$ ثم $3$ ثم $4$ ) : النقط ليست على استقامة.',
};

/* ── les autres données ──────────────────────────────────────────────────────────────────────────────────────────────── */
const FLOW = [[2, 5], [4, 10], [6, 15]]; // ex-2 : le robinet, 2,5 L par minute
const SALT = [[2, 2.5], [4, 5], [8, 10]]; // ex-4 : l'eau salée, 1,25 kg par litre
const BARREL = [[12, 30], [20, 50], [36, 90], [80, 200]]; // ex-5 : les barils, 2,5 L par cm
const STEPS = [[1, 3], [2, 3], [5, 9]]; // deep-31 : la bétonnière
const PIN = [5, 12]; // deep-32 : A(5 ; 12)
const PLANET = [[2, 7.4], [5, 18.5], [10, 37], [20, 74]]; // deep-41 : g = 3,7

export const EXERCISES = [
  {
    id: 'act-1', source: S('act-1', 88, 'أنشطة'), learningPointId: LP.P3, difficulty: 'moyen',
    statement: 'تبيع ثلاثة محلّات الكرّاريس بعروض مختلفة. لكلّ عرض مثّلنا في معلم نقط الأثمان لـ $2$ و $5$ و $8$ و $10$ كرّاسات.',
    interaction: 'batch',
    question: { rows: OFFERS.map(offerRow), explain: 'نتحقّق في كلّ عرض: هل النقط على استقامة؟ وهل تمرّ بـ $O$ ؟' },
    commonError: 'الحكم بأنّ كلّ نقط على استقامة تمثّل تناسبية.',
  },
  {
    id: 'ex-1', source: S('ex-1', 94), learningPointId: LP.P2, difficulty: 'facile',
    statement: 'مثّلنا ثلاثة جداول في ثلاثة معالم مربّعة. لكلّ شكل، ماذا تقول عن النقط الأربع؟',
    figures: GRAPHS.map((g, i) => planeFigure(g.points, { ariaLabel: `${GRAPH_NAMES[i]}: أربع نقط في معلم`, maxWidth: 220 })),
    interaction: 'batch',
    question: {
      rows: GRAPHS.map((g, i) => ({ label: GRAPH_NAMES[i], options: VERDICT, correct: KIND_INDEX[graphKind(g)], correction: GRAPH_WHY[graphKind(g)] })),
      explain: 'نبحث أوّلًا عن الاستقامة، ثم عن مرور المستقيم بـ $O$ .',
    },
    commonError: 'الاكتفاء بأنّ الترتيب يزيد مع الفاصلة.',
  },
  {
    id: 'ex-2', source: S('ex-2', 94), learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'يمثّل البيان حجم الماء المتدفّق من صنبور بالليتر بدلالة المدّة بالدقيقة، ونقطه $A(2\\ ;\\ 5)$ و $B(4\\ ;\\ 10)$ و $C(6\\ ;\\ 15)$ على مستقيم يمرّ بـ $O$ .',
    figure: planeFigure(FLOW, { ariaLabel: 'ثلاث نقط A و B و C على مستقيم يمرّ بالمبدأ O', rays: ['C'], maxWidth: 260 }),
    interaction: 'numeric',
    question: { prompt: 'حجم الماء المتدفّق بعد $9$ دقائق بالليتر:', expected: num(G.valueAt(G.coefficient(FLOW.map(([x, y]) => G.pt(x, y))), 9)), explain: 'المعامل $\\frac{5}{2} = 2{,}5$ ، فـ $y = 2{,}5 \\times 9 = 22{,}5$ لتر.' },
    commonError: 'قراءة النقطة الأخيرة وإضافة الفرق بدل الضرب في المعامل.',
  },
  {
    id: 'ex-3', source: S('ex-3', 94), learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'علب متماثلة: $5$ علب تزن $4\\ \\mathrm{kg}$ و $3$ علب تزن $2{,}4\\ \\mathrm{kg}$ .',
    interaction: 'trueFalse',
    question: {
      rows: [
        { text: 'كتلة العلب بدلالة عددها تُمثَّل بنقط على استقامة واحدة مع $O$ .', answer: true, why: '$\\frac{4}{5} = \\frac{2{,}4}{3} = 0{,}8$ : معامل ثابت، فالوضعية تناسبية.' },
        { text: '$9$ علب تزن $7{,}4\\ \\mathrm{kg}$ .', answer: false, why: '$9 \\times 0{,}8 = 7{,}2\\ \\mathrm{kg}$ لا $7{,}4$ .' },
        { text: '$10$ علب تزن $8\\ \\mathrm{kg}$ .', answer: true, why: '$10 \\times 0{,}8 = 8\\ \\mathrm{kg}$ .' },
      ],
    },
    commonError: 'قبول قيمة قريبة من الصحيحة.',
  },
  {
    id: 'ex-4', source: S('ex-4', 94), learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'يمثّل البيان كتلة ماء مالح بالكيلوغرام بدلالة حجمه باللتر: نقطه $A(2\\ ;\\ 2{,}5)$ و $B(4\\ ;\\ 5)$ و $C(8\\ ;\\ 10)$ على مستقيم يمرّ بـ $O$ .',
    figure: planeFigure(SALT, { ariaLabel: 'ثلاث نقط A و B و C على مستقيم يمرّ بالمبدأ O', rays: ['C'], maxWidth: 260 }),
    interaction: 'numeric',
    question: { prompt: 'كتلة $7$ لترات منه بالكيلوغرام:', expected: num(G.valueAt(G.coefficient(SALT.map(([x, y]) => G.pt(x, y))), 7)), explain: 'المعامل $\\frac{2{,}5}{2} = 1{,}25$ ، فـ $y = 1{,}25 \\times 7 = 8{,}75$ كغ.' },
    commonError: 'الحساب بالمعامل $2{,}5$ بدل ترتيب النقطة التي فاصلتها $1$ .',
  },
  {
    id: 'ex-5', source: S('ex-5', 95), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'جدول براميل لتخزين الماء: الارتفاع بالسنتيمتر $12, 20, 36, 80$ والسعة باللتر $30, 50, 90, 200$ على الترتيب. الجدول جدول تناسبية.',
    interaction: 'numeric',
    question: { prompt: 'ارتفاع برميل سعته $250$ لترًا بالسنتيمتر:', expected: num(G.abscissaAt(G.coefficient(BARREL.map(([x, y]) => G.pt(x, y))), 250)), explain: 'المعامل $\\frac{30}{12} = 2{,}5$ لتر لكلّ سنتيمتر، فـ $x = \\frac{250}{2{,}5} = 100$ سم.' },
    commonError: 'قسمة الارتفاع على السعة بدل العكس.',
  },
  {
    id: 'deep-31', source: S('deep-31', 98, 'أتعمّق'), learningPointId: LP.P3, difficulty: 'difficile',
    statement: 'يمثّل البيان حجم الخرسانة بالمتر المكعّب التي تنتجها آلة بدلالة زمن تشغيلها بالساعة: نقطه $A(1\\ ;\\ 3)$ و $B(2\\ ;\\ 3)$ و $C(5\\ ;\\ 9)$ موصولة بـ $O$ بخطوط.',
    figure: brokenFigure(STEPS, { ariaLabel: 'خطّ منكسر يمرّ بـ O ثم A ثم B ثم C، وبين A و B أفقي' }),
    interaction: 'choice',
    question: {
      prompt: 'هل حجم الخرسانة متناسب مع زمن التشغيل؟',
      options: ['لا: بين الساعة الأولى والثانية لم تنتج الآلة شيئًا فلا يبقى الخط مستقيمًا يمرّ بـ $O$ ', 'نعم: الحجم يزيد مع الزمن', 'نعم: الخطّ يمرّ بـ $O$ '],
      correct: 0,
      explain: 'النقط ليست على استقامة (توقّفت الآلة بين $A$ و $B$ ) ، فالتمثيل لا يُمثّل وضعية تناسبية؛ ازدياد الحجم لا يكفي.',
    },
    commonError: 'الاكتفاء بأنّ الحجم يزيد مع الزمن.',
  },
  {
    id: 'deep-32', source: S('deep-32', 98, 'أتعمّق'), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'وضعت سلمى في معلم النقطة $A(5\\ ;\\ 12)$ ، وتريد أن تضع نقطة $B$ فاصلتها $7$ بحيث تكون $O$ و $A$ و $B$ على استقامة واحدة.',
    figure: planeFigure([PIN], { ariaLabel: 'النقطة A(5 ; 12) في معلم', maxWidth: 240 }),
    interaction: 'numeric',
    question: { prompt: 'ترتيب النقطة $B$ :', expected: num(G.valueAt(Lin.div(PIN[1], PIN[0]), 7)), explain: 'النقط على استقامة مع $O$ فالترتيب متناسب مع الفاصلة: $a = \\frac{12}{5} = 2{,}4$ ، فـ $y = 2{,}4 \\times 7 = 16{,}8$ .' },
    commonError: 'إضافة الفرق $7 - 5$ إلى الترتيب $12$ .',
  },
  {
    id: 'deep-33', source: S('deep-33', 98, 'أتعمّق'), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'نصف المستقيم $[Ot)$ يمرّ بـ $O$ وبالنقطة $A(1\\ ;\\ 2{,}5)$ . النقطة $M(x\\ ;\\ y)$ من نصف المستقيم هذا وفاصلتها $6$ .',
    interaction: 'numeric',
    question: { prompt: 'ترتيب النقطة $M$ :', expected: num(G.valueAt('2.5', 6)), explain: 'كلّ نقطة من $[Ot)$ تحقّق $y = 2{,}5 \\times x$ ، فـ $y = 2{,}5 \\times 6 = 15$ .' },
    commonError: 'استعمال $y = x + 2{,}5$ .',
  },
  {
    id: 'deep-41', source: S('deep-41', 99, 'أتعمّق'), learningPointId: LP.P4, difficulty: 'difficile',
    statement: 'نزن على كوكب بعيد أجساما كتلها $2, 5, 10, 20$ كغ فنجد أوزانها بالنيوتن $7{,}4, 18{,}5, 37, 74$ على الترتيب. الجدول جدول تناسبية، والوزن $p = g \\times m$ .',
    interaction: 'numeric',
    question: { prompt: 'تسارع الجاذبية $g$ لهذا الكوكب (اكتب العدد فقط):', expected: num(G.coefficient(PLANET.map(([x, y]) => G.pt(x, y)))), explain: '$g = \\frac{p}{m} = \\frac{7{,}4}{2} = 3{,}7$ ؛ وهو ثابت في كلّ الأعمدة (معامل التناسبية).' },
    commonError: 'قسمة الكتلة على الوزن.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const DATA = { FLOW, SALT, BARREL, STEPS, PIN, PLANET };

/** Les données des épreuves du إختبار أولي (module 8) — LITTÉRALES dans le module, recomptées par content.test.js. `truth` : le calcul qui fait la clé. */
export const FINAL = [
  { id: 'E1', source: null, prompt: 'يربط جدول $7$ علب بـ $14$ دج. النقطة التي تمثّل هذا العمود في المعلم هي:', options: ['$(7\\ ;\\ 14)$', '$(14\\ ;\\ 7)$', '$(21\\ ;\\ 0)$', '$(7\\ ;\\ 7)$'], correct: 0, truth: { kind: 'point', x: '7', y: '14' } },
  { id: 'E2', source: S('self-2', 97, 'أؤكّد تعلّماتي'), prompt: 'مثّلنا في معلم الجدول $3, 6, 9 \\to 12, 24, 36$ . النقط الثلاث هي:', options: ['على استقامة واحدة مع $O$ ', 'على مستقيم لا يمرّ بـ $O$ ', 'ليست على استقامة'], correct: 0, truth: { kind: 'table', xs: ['3', '6', '9'], ys: ['12', '24', '36'] } },
  { id: 'E3', source: S('self-1', 97, 'أؤكّد تعلّماتي'), prompt: 'رُسمت النقط $(1\\ ;\\ 3)$ و $(2\\ ;\\ 5)$ و $(4\\ ;\\ 9)$ في معلم. هل هي تمثيل لوضعية تناسبية؟', options: ['لا: على استقامة لكنّ المستقيم لا يمرّ بـ $O$ ', 'نعم: هي على استقامة واحدة', 'نعم: الترتيب يزيد مع الفاصلة', 'لا: ليست على استقامة'], correct: 0, truth: { kind: 'table', xs: ['1', '2', '4'], ys: ['3', '5', '9'] } },
  { id: 'E4', source: null, prompt: 'نقط وضعية تناسبية على مستقيم يمرّ بـ $O$ وبالنقطة $(4\\ ;\\ 10)$ . ترتيب النقطة التي فاصلتها $6$ هو:', options: ['$15$', '$12$', '$16$', '$24$'], correct: 0, truth: { kind: 'value', through: ['4', '10'], x: '6' } },
  { id: 'E5', source: null, prompt: 'قرأنا على بيان وضعية تناسبية أنّ $(5\\ ;\\ 12)$ إحدى نقطه. معامل التناسبية هو:', options: ['$2{,}4$', '$\\frac{5}{12}$', '$60$', '$7$'], correct: 0, truth: { kind: 'coefficient', x: '5', y: '12' } },
];
export const SELF = Object.fromEntries(FINAL.filter((f) => f.source).map((f) => [f.id, f]));
