/**
 * Le contenu du درس « قواعد الحساب على قوى العدد 10 » (3AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit3/extraction.json :
 * نشاط 4 p. 41, معارف 3 p. 42, طرائق et دوري الآن p. 43, أوظّف p. 46–47 et 50, أؤكّد p. 49 — relus à 130–260 dpi le 2026-10-26) ; chaque texte montré à l'élève
 * est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes règles et notations, autres mots, autres exemples, autres nombres). La `source` de chaque bloc
 * garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO — la مسطرة التحويل (`unit-ladder`, thème `tech-bench`) : expérience de la plateforme. Les nombres sont ceux du preset `levels.js`
 * (مبتدئ : u1 km→m→mm · u2 km→cm · u3 mm→µm ; متقدم : u4 km²→m² · u5 m³→cm³ · u6 mm²→m² · u7 m³→dm³).
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  // act-4 (p. 41) : écrire les facteurs. REJETÉ comme entrée (le train de `quwat-adad-nisbi` l'a fait) ; le décompte survit comme la JUSTIFICATION de chaque brique.
  evidence: src('act-4', 41, 'أنشطة'),
};

/** معارف 3 (p. 42) — les trois règles, réécrites : mêmes énoncés, autres exemples. */
export const KNOWLEDGE = {
  product: {
    source: src('know-3', 42, 'معارف'),
    text: 'من أجل عددين صحيحين نسبيين $m$ و $n$ : $10^m \\times 10^n = 10^{m+n}$ . نجمع الأسّين.',
    example: 'مثلًا: $10^{5} \\times 10^{-8} = 10^{5+(-8)} = 10^{-3}$ .',
  },
  quotient: {
    source: src('know-3', 42, 'معارف'),
    text: 'من أجل عددين صحيحين نسبيين $m$ و $n$ : $\\frac{10^m}{10^n} = 10^{m-n}$ . ننقص أسّ المقام من أسّ البسط.',
    example: 'مثلًا: $\\frac{10^{6}}{10^{4}} = 10^{2}$ ، و $\\frac{10^{3}}{10^{-4}} = 10^{3-(-4)} = 10^{7}$ .',
  },
  power: {
    source: src('know-3', 42, 'معارف'),
    text: 'من أجل عددين صحيحين نسبيين $m$ و $n$ : $(10^m)^n = 10^{m \\times n}$ . نضرب الأسّين.',
    example: 'مثلًا: $(10^{-2})^{4} = 10^{-8}$ ، و $(10^{4})^{-2} = 10^{-8}$ .',
  },
  noSum: {
    source: addition('knowledge_formalization'),
    text: 'لا قاعدة لجمع قوتين ولا لنصف قوة: $10^{2} + 10^{3} = 100 + 1\\,000 = 1\\,100$ وليس $10^{5}$ ؛ ونصف $10^{10}$ هو $5 \\times 10^{9}$ وليس $10^{5}$ .',
  },
};

/** « تذكّر » — ce que `quwat-adad-nisbi` enseigne et que cette leçon ne reconstruit PAS (puissance bâtie facteur par facteur, quotient comme annulation). */
export const RECALL_QUWAT = {
  source: addition('prior_lesson_reminder'),
  title: 'تذكّر — قوة عدد نسبي',
  text: 'في درس «قوة عدد نسبي» رأيتَ كيف تُبنى القوة عاملًا بعد عامل، وكيف يُختصر الكسر حين نقسم قوة على قوة. هنا نكتفي بقوى العدد 10 فنقرأ القواعد على أعمدة وحدات.',
  lesson: 'quwat-adad-nisbi',
  path: '/courses/moyen/3am/ansab_al_aadad_wal_hisab/quwat-adad-nisbi',
  linkText: 'أراجع درس «قوة عدد نسبي»',
};

/** طرائق p. 43 (A … I) et دوري الآن p. 43 (P … U) — réécrits, autres nombres. */
export const METHOD = {
  chain: {
    source: src('method-43c', 43, 'طرائق'),
    exercise: 'اكتب على شكل قوة واحدة للعدد 10 : $A = \\frac{10^{5} \\times 10^{-2}}{10^{-4}}$ ؛ $B = (10^{-2})^{3} \\times 10^{8}$ ؛ $C = \\frac{(10^{3})^{2}}{10^{4} \\times 10^{-5}}$ .',
    solution: [
      '$A$ : في البسط نجمع الأسّين: $10^{5} \\times 10^{-2} = 10^{3}$ ، ثم نقسم: $A = \\frac{10^{3}}{10^{-4}} = 10^{3-(-4)} = 10^{7}$ .',
      '$B$ : قوة قوة أولًا: $(10^{-2})^{3} = 10^{-6}$ ، ثم الجداء: $B = 10^{-6} \\times 10^{8} = 10^{2}$ .',
      '$C$ : في البسط $(10^{3})^{2} = 10^{6}$ وفي المقام $10^{4} \\times 10^{-5} = 10^{-1}$ ، ثم $C = \\frac{10^{6}}{10^{-1}} = 10^{7}$ .',
    ],
    rule: 'نختصر أولًا ما في البسط وما في المقام (قوة قوة، ثم جداءات)، ثم نطبّق قاعدة القسمة فنصل إلى قوة واحدة للعدد 10 .',
    numbers: { A: 7, B: 2, C: 7 },
  },
  times: {
    source: src('now-43', 43, 'دوري الآن'),
    alsoCites: src('method-43c', 43, 'طرائق'),
    exercise: 'احسب وأعط النتيجة على الشكل $k \\times 10^{p}$ : $D = 6 \\times 10^{4} \\times 5 \\times 10^{-7}$ ؛ $E = \\frac{8 \\times 10^{5}}{2 \\times 10^{-3}}$ .',
    solution: [
      '$D$ : نجمع الأعداد معًا والقوى معًا: $D = (6 \\times 5) \\times (10^{4} \\times 10^{-7}) = 30 \\times 10^{-3}$ .',
      'هذه النتيجة صحيحة كما هي: $30 \\times 10^{-3} = 0{,}03$ . ولا نغيّرها هنا.',
      '$E$ : $E = \\frac{8}{2} \\times \\frac{10^{5}}{10^{-3}} = 4 \\times 10^{5-(-3)} = 4 \\times 10^{8}$ .',
    ],
    rule: 'نجمع الأعداد مع الأعداد وقوى العدد 10 مع قوى العدد 10 ، ثم نطبّق القواعد ؛ وتبقى النتيجة على الشكل $k \\times 10^{p}$ دون تعديل.',
    numbers: { D: { k: '30', p: -3 }, E: { k: '4', p: 8 } },
  },
};

/** « أستعدّ » — sept affirmations de la plateforme (`3am.m3.r01` et les unités) ; le manuel n'a pas d'item pour cette leçon. */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'quwa', text: '$10^{5} = 100\\,000$ .', answer: true, why: 'الرقم 1 متبوعًا بخمسة أصفار: $10^5 = 100\\,000$ .' },
  { skill: 'quwa', text: '$10^{-3} = -1\\,000$ .', answer: false, why: 'الأس السالب لا يجعل العدد سالبًا: $10^{-3} = \\frac{1}{1000} = 0{,}001$ .' },
  { skill: 'quwa', text: '$10^{0} = 0$ .', answer: false, why: 'بلا أيّ عامل يبقى العدد 1 : $10^0 = 1$ .' },
  { skill: 'quwa', text: '$0{,}0001 = 10^{-4}$ .', answer: true, why: 'الرقم 1 في الرتبة الرابعة بعد الفاصلة، إذن $0{,}0001 = 10^{-4}$ .' },
  { skill: 'wahdat', text: '$1\\,000 \\times 100 = 100\\,000$ .', answer: true, why: '$1\\,000 \\times 100$ : ثلاثة أصفار ثم صفران، فخمسة أصفار: $100\\,000$ .' },
  { skill: 'wahdat', text: '$1\\ \\mathrm{km} = 100\\ \\mathrm{m}$ .', answer: false, why: 'الكيلومتر الواحد ألف متر: $1\\ \\mathrm{km} = 1\\,000\\ \\mathrm{m}$ .' },
  { skill: 'quwa', text: '$\\frac{1}{100} = 0{,}01$ .', answer: true, why: 'جزء من مئة: $\\frac{1}{100} = 0{,}01$ ، أي $10^{-2}$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
export const PREP_ITEMS = [];

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  hop: 'قطع الشريطان 3 أعمدة ثم 3 أعمدة، فالمجموع 6 أعمدة: $10^{3} \\times 10^{3} = 10^{3+3} = 10^{6}$ . أمّا $3 \\times 3 = 9$ فلا يوافق الشريط المنقّط الذي قطع 6 أعمدة فقط.',
  gap: 'بين لوحة كم ولوحة سم 5 أعمدة: $\\frac{10^{3}}{10^{-2}} = 10^{3-(-2)} = 10^{5}$ . اللوحتان على جهتي لوحة المتر، فنجمع المسافتين ولا نكتفي بالفرق $3 - 2$ .',
  area: 'في جدول المساحة تأخذ كل وحدة عمودين: $(10^{3})^{2} = 10^{3 \\times 2} = 10^{6}$ . وفي جدول الحجم ثلاثة أعمدة: $(10^{2})^{3} = 10^{6}$ .',
  darb: {
    wrong: '$10^{3} \\times 10^{3} = 10^{9}$ لأنّ $3 \\times 3 = 9$ .',
    why: 'في الجداء الأسّان يُجمعان: كل أسّ يعدّ أعمدة، وأعمدة الشريط الثاني تُضاف إلى أعمدة الأول.',
    right: '$10^{3} \\times 10^{3} = 10^{3+3} = 10^{6}$ .',
  },
  ishara: {
    wrong: '$\\frac{10^{5}}{10^{-2}} = 10^{3}$ لأنّ $5 - 2 = 3$ .',
    why: 'الأس $-2$ سالب: نطرح عددًا سالبًا فنجمع. بين $10^{5}$ و $10^{-2}$ سبعة أعمدة لا ثلاثة.',
    right: '$\\frac{10^{5}}{10^{-2}} = 10^{5-(-2)} = 10^{7}$ .',
  },
  quwaJam: {
    wrong: '$(10^{2})^{5} = 10^{7}$ لأنّ $2 + 5 = 7$ .',
    why: 'خمس مرّات عمودان، أي ضرب: كل وحدة تأخذ 2 من الأعمدة وعددها 5 .',
    right: '$(10^{2})^{5} = 10^{2 \\times 5} = 10^{10}$ .',
  },
  majmu: {
    wrong: '$10^{2} + 10^{3} = 10^{5}$ .',
    why: 'القواعد الثلاث للجداء والقسمة وقوة القوة فقط ؛ في الجمع نحسب كل قوة ثم نجمع العددين.',
    right: '$10^{2} + 10^{3} = 100 + 1\\,000 = 1\\,100$ .',
  },
  nisf: {
    wrong: 'نصف $10^{10}$ هو $10^{5}$ .',
    why: 'نصف عدد لا يقسم أسّه على 2 : نقسم العدد نفسه على 2 .',
    right: '$\\frac{10^{10}}{2} = 5 \\times 10^{9}$ .',
  },
};
