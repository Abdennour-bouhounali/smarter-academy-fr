/**
 * Le contenu du درس « تساوي كسرين ومقارنتهما » (3AM, unité 2) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/3am/unit2/extraction.json : أنشطة 2 et 3 p. 24, معارف 3 p. 26,
 * طرائق 1–4 et « دورك الآن » 1 p. 27, أستعدّ 3–5 p. 23) ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes définitions et notations, autres mots,
 * autres exemples, autres nombres). La `source` de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** LE LABO DE L'ENTRÉE — la machine à teinter (`shade-match`, thème `paintshop`) : expérience de la plateforme, tâches du preset `levels.js`. */
export const LAB = {
  source: addition('platform_designed_entry'),
  beginner: {},
  advanced: {},
  /** Le monde `equal` de معارف : la référence 6/8 et quatre seaux candidats (9/12 et 15/20 la raccordent, 7/9 et 12/15 non). */
  equal: { world: 'equal', tasks: [{ id: 'e1', kind: 'pick', a: 6, b: 8, candidates: [[9, 12], [15, 20], [7, 9], [12, 15]] }] },
};

/** « تذكّر — السنة الثانية » : comparer deux fractions de même dénominateur, de même numérateur, ou dont un dénominateur est multiple de l'autre (leçon 2AM `muqarana-kasrayn`, NON publiée : pas de lien). RAPPELÉ, jamais reconstruit. */
export const RECALL = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — السنة الثانية',
  text: 'في السنة الثانية قارنّا كسرين لهما نفس المقام (الأصغر بسطًا هو الأصغر)، وكسرين لهما نفس البسط (الأصغر مقامًا هو الأكبر)، وكسرين مقام أحدهما مضاعف لمقام الآخر: نكتب الثاني بمقام الأول، فـ $\\frac{3}{4}>\\frac{7}{12}$ لأنّ $\\frac{3}{4}=\\frac{9}{12}$ . وفي هذا الدرس نتعلّم ما بقي: كسران مقاماهما أيّ عددين.',
  lesson: 'muqarana-kasrayn',
};

/** معارف 3 (p. 26) — réécrits, avec les exemples de la plateforme. */
export const KNOWLEDGE = {
  scale: {
    source: src('know-3', 26, 'معارف', 3),
    text: 'لا يتغيّر الكسر إذا ضربنا بسطه ومقامه في العدد غير المعدوم نفسه أو قسمناهما عليه: $\\frac{a}{b}=\\frac{a\\times k}{b\\times k}=\\frac{a\\div k}{b\\div k}$ . مثلًا $\\frac{12}{18}=\\frac{12\\div6}{18\\div6}=\\frac{2}{3}$ ، و $\\frac{2}{3}=\\frac{2\\times5}{3\\times5}=\\frac{10}{15}$ .',
  },
  property: {
    source: src('know-3', 26, 'معارف', 3),
    text: 'إذا كان $b\\neq0$ و $d\\neq0$ فإنّ $\\frac{a}{b}=\\frac{c}{d}$ يكافئ $a\\times d=b\\times c$ . أي إذا تساوى الكسران تساوى جداءاهما المتصالبان، وإذا تساوى جداءاهما المتصالبان تساوى الكسران. مثلًا $\\frac{15}{35}=\\frac{3}{7}$ لأنّ $15\\times7=105$ و $35\\times3=105$ ؛ و $\\frac{12}{16}\\neq\\frac{9}{13}$ لأنّ $12\\times13=156$ و $16\\times9=144$ .',
  },
  proof: {
    source: src('act-2', 24, 'أنشطة', 2),
    text: 'لماذا؟ نكتب الكسرين بالمقام نفسه $b\\times d$ : $\\frac{a}{b}=\\frac{a\\times d}{b\\times d}$ و $\\frac{c}{d}=\\frac{b\\times c}{b\\times d}$ . كسران لهما المقام نفسه يتساويان إذا وفقط إذا تساوى بسطاهما، أي $a\\times d=b\\times c$ . ففي مثالنا $\\frac{6}{8}=\\frac{6\\times12}{8\\times12}=\\frac{72}{96}$ و $\\frac{9}{12}=\\frac{9\\times8}{12\\times8}=\\frac{72}{96}$ ، فبسطاهما متساويان: $6\\times12=8\\times9$ .',
  },
  rule: {
    source: src('know-3', 26, 'معارف', 3),
    text: 'لمقارنة كسرين مقاماهما مختلفان نكتبهما بالمقام نفسه، وهو مضاعف مشترك للمقامين: حاصل ضربهما يصلح دائمًا، وأصغر مضاعف مشترك أقصر. ثمّ نقارن البسطين. وبالجداءين المتصالبين: $\\frac{a}{b}<\\frac{c}{d}$ يكافئ $a\\times d<b\\times c$ .',
  },
  examples: {
    source: src('know-3', 26, 'معارف', 3),
    text: '$\\frac{5}{6}$ و $\\frac{7}{8}$ : المقام المشترك $24$ ، $\\frac{5}{6}=\\frac{20}{24}$ و $\\frac{7}{8}=\\frac{21}{24}$ ، فـ $\\frac{5}{6}<\\frac{7}{8}$ . $\\frac{11}{18}$ و $\\frac{7}{12}$ : المقام المشترك $36$ ، $\\frac{11}{18}=\\frac{22}{36}$ و $\\frac{7}{12}=\\frac{21}{36}$ ، فـ $\\frac{11}{18}>\\frac{7}{12}$ .',
  },
};

/** « طريقة » — le manuel dit « يمكن استعمال عدة طرق » (p. 27) : chaque طريقة a ici SON exemple, aux nombres de la plateforme. */
export const METHOD = {
  cross: {
    source: src('method-1', 27, 'طرائق', 1),
    exercise: 'بيّن أنّ الكسرين $\\frac{156}{84}$ و $\\frac{13}{7}$ متساويان.',
    solution: [
      'نحسب الجداءين المتصالبين: $156\\times7=1092$ .',
      'و $84\\times13=1092$ .',
      'الجداءان متساويان، فالكسران متساويان: $\\frac{156}{84}=\\frac{13}{7}$ .',
    ],
    rule: 'لإثبات تساوي كسرين نحسب جداءيهما المتصالبين: إن تساويا فالكسران متساويان.',
  },
  digits: {
    source: src('method-2', 27, 'طرائق', 2),
    exercise: 'بحساب ذهني فقط، بيّن أنّ $\\frac{3217}{5419}\\neq\\frac{4826}{8133}$ .',
    solution: [
      'رقم آحاد $3217\\times8133$ هو رقم آحاد $7\\times3=21$ ، أي $1$ .',
      'ورقم آحاد $5419\\times4826$ هو رقم آحاد $9\\times6=54$ ، أي $4$ .',
      'الجداءان المتصالبان مختلفان دون أن نكمل الحساب، فالكسران غير متساويين.',
    ],
    remark: 'رقما الآحاد المختلفان يكفيان لإثبات أنّ كسرين غير متساويين، أمّا تساويهما فلا يُثبت التساوي.',
    rule: 'قد يكفي رقما آحاد الجداءين المتصالبين لإثبات أنّ كسرين غير متساويين.',
  },
  one: {
    source: src('method-3', 27, 'طرائق', 3),
    exercise: 'قارن بين $\\frac{125}{97}$ و $\\frac{61}{340}$ .',
    solution: [
      '$125>97$ ، فالكسر الأول أكبر من $1$ .',
      '$61<340$ ، فالكسر الثاني أصغر من $1$ .',
      'إذن $\\frac{61}{340}<\\frac{125}{97}$ .',
    ],
    rule: 'إذا كان أحد الكسرين أكبر من $1$ والآخر أصغر منه فالمقارنة تنتهي، وكذلك إذا فصل بينهما كسر وسيط.',
  },
  multiple: {
    source: src('method-4', 27, 'طرائق', 4),
    exercise: 'قارن بين $\\frac{11}{6}$ و $\\frac{9}{4}$ .',
    solution: [
      '$12$ مضاعف مشترك للعددين $6$ و $4$ .',
      '$\\frac{11}{6}=\\frac{22}{12}$ و $\\frac{9}{4}=\\frac{27}{12}$ .',
      '$22<27$ ، إذن $\\frac{11}{6}<\\frac{9}{4}$ .',
    ],
    rule: 'نكتب الكسرين بمضاعف مشترك للمقامين ثمّ نقارن البسطين.',
  },
  numerator: {
    source: addition('knowledge_formalization'),
    exercise: 'قارن بين $\\frac{13}{20}$ و $\\frac{13}{21}$ .',
    solution: [
      'البسطان متساويان ($13$) ، فالمقام الأصغر يعطي أجزاءً أكبر.',
      '$20<21$ ، إذن $\\frac{13}{20}>\\frac{13}{21}$ .',
    ],
    rule: 'إذا تساوى بسطا كسرين فالأكبر هو ذو المقام الأصغر.',
  },
  choose: {
    source: addition('knowledge_formalization'),
    rule: 'لمقارنة كسرين: نوحّد المقامين، أو نقارن الجداءين المتصالبين، أو نقارن كلًّا منهما بالعدد $1$ أو بكسر وسيط، أو نستعمل نفس البسط.',
  },
};

/** « أستعدّ » — أستعدّ p. 23, items 3 et 5, RÉÉCRITS en affirmations (l'item 4, les figures, est posé par la banque). */
export const PREP_ITEMS = [
  { n: 3, skill: 'tawhid', text: '$\\frac{3}{4}$ يساوي $\\frac{18}{24}$ .', answer: true, why: '$3\\times6=18$ و $4\\times6=24$ : ضربنا البسط والمقام في العدد نفسه.' },
  { n: 5, skill: 'muqarana', text: '$\\frac{7}{10}>\\frac{3}{5}$ .', answer: true, why: '$\\frac{3}{5}=\\frac{6}{10}$ ، و $7>6$ .' },
].map((it) => ({ ...it, source: src('prep', 23, 'أستعدّ', it.n) }));

/**
 * Les items de la PLATEFORME : le réseau dit que la leçon étend `2am.m1.r08` (comparer deux fractions de même dénominateur, de même numérateur ou dont un
 * dénominateur est multiple de l'autre) — « أستعدّ » doit les mesurer (LEARNING_NET.md §4.4).
 */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'muqarana', text: '$\\frac{7}{12}<\\frac{11}{12}$ .', answer: true, why: 'المقامان متساويان، فالأصغر هو ذو البسط الأصغر: $7<11$ .' },
  { skill: 'muqarana', text: '$\\frac{5}{8}>\\frac{5}{6}$ .', answer: false, why: 'البسطان متساويان، والمقام الأصغر يعطي أجزاءً أكبر: $\\frac{5}{8}<\\frac{5}{6}$ .' },
  { skill: 'tawhid', text: '$\\frac{3}{4}>\\frac{7}{12}$ لأنّ $\\frac{3}{4}=\\frac{9}{12}$ .', answer: true, why: '$\\frac{9}{12}>\\frac{7}{12}$ لأنّ $9>7$ .' },
  { skill: 'tawhid', text: '$\\frac{2}{5}>\\frac{3}{10}$ .', answer: true, why: '$\\frac{2}{5}=\\frac{4}{10}$ ، و $4>3$ .' },
  { skill: 'muqarana', text: '$\\frac{9}{7}<1$ .', answer: false, why: 'البسط $9$ أكبر من المقام $7$ ، فالكسر أكبر من $1$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  addsame: {
    wrong: 'أضفنا $4$ إلى بسط الكسر $\\frac{3}{4}$ وإلى مقامه، فظننّا أنّ الكسر الجديد $\\frac{7}{8}$ يساوي الكسر الأصلي.',
    why: 'الجداءان المتصالبان $3\\times8=24$ و $4\\times7=28$ مختلفان: الإضافة لا تحفظ الكسر، والضرب في العدد نفسه هو الذي يحفظه.',
    right: '$\\frac{3}{4}=\\frac{6}{8}$ لأنّ $3\\times8=4\\times6$ .',
  },
  numerators: {
    wrong: 'قارنّا بسطي الكسرين $\\frac{7}{9}$ و $\\frac{10}{13}$ فقط، فقلنا إنّ الثاني أكبر لأنّ بسطه أكبر.',
    why: 'البسطان لا يكفيان إذا اختلف المقامان: الجداءان المتصالبان هما اللذان يحكمان.',
    right: '$7\\times13=91$ أكبر من $9\\times10=90$ ، فالكسر الأول هو الأكبر.',
  },
  calc: {
    wrong: 'الحاسبة تعرض الرقم نفسه للكسرين $\\frac{355}{113}$ و $\\frac{35500000001}{11300000000}$ ، فنقول إنّهما متساويان.',
    why: 'الحاسبة تعرض عددًا محدودًا من الأرقام فتُخفي فرقًا صغيرًا جدًّا، أمّا الجداءان المتصالبان فيكشفانه.',
    right: 'رقما آحاد الجداءين المتصالبين $0$ و $3$ مختلفان، فالكسران غير متساويين.',
  },
  paint: 'دلو مرجع فيه $3$ طلقات أزرق مع $4$ علب أبيض: يطابقه دلو فيه $6$ طلقات مع $8$ علب، لأنّ $6\\times4=24=3\\times8$ ؛ ولا يطابقه دلو فيه $7$ طلقات مع $10$ علب، لأنّ $7\\times4=28$ أصغر من $3\\times10=30$ فهو أفتح.',
};
