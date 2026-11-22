/**
 * Le contenu de « أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية » (2AM, unité 1) — données pures. Le manuel (p. 6 `opener` ; p. 20 `evaluation`) est la RÉFÉRENCE ; chaque texte
 * montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène). La trousse du menuisier devient un atelier de nichoirs (6 planches, 4 équerres, 16 vis
 * par nichoir) ; l'histoire des chiffres est redite avec les mots de la plateforme, sans rien affirmer au-delà de la boîte du manuel ; aucune ligne n'envoie au manuel : `SourceTag` est muet.
 * Rien ici ne montre une valeur de la solution au module 7 (cf. content.test.js).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** « أستعدّ » — six affirmations de la plateforme, UNE ou DEUX par leçon de l'unité. Aucune ne donne les nombres des situations. */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'silsila', text: '$40 - 15 + 5 = 20$ .', answer: false, why: 'الجمع والطرح وحدهما يُنجزان من اليسار إلى اليمين: $40 - 15 = 25$ ثم $25 + 5 = 30$ .' },
  { skill: 'silsila', text: '$3 + 5 \\times 2 = 13$ .', answer: true, why: 'الضرب أوّلًا: $5 \\times 2 = 10$ ثم $3 + 10 = 13$ .' },
  { skill: 'aqwas', text: '$\\dfrac{18 + 6}{4 - 1} = 8$ .', answer: true, why: 'خطّ الكسر يجمع البسط ويجمع المقام: $24 \\div 3 = 8$ .' },
  { skill: 'wasf', text: '$(9 - 4) \\times 6$ عبارة عن فرق.', answer: false, why: 'آخر عملية تُنجز هي الضرب: العبارة جداء الفرق $9 - 4$ والعدد $6$ ، وقيمتها $5 \\times 6 = 30$ .' },
  { skill: 'tawzi', text: '$8 \\times (5 + 0{,}5) = 40 + 0{,}5$ .', answer: false, why: 'الضرب يوزَّع على الحدّين معًا: $8 \\times 5 + 8 \\times 0{,}5 = 40 + 4 = 44$ .' },
  { skill: 'tawzi', text: '$99 \\times 6 = 600 - 6$ .', answer: true, why: '$99 \\times 6 = (100 - 1) \\times 6 = 600 - 6 = 594$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** « هل تعلم » (module 0) — l'`opener` du manuel, redit avec les mots de la plateforme. Aucun nombre de la solution. */
export const HISTORY = {
  source: src('opener', 6, 'تمهيد'),
  title: 'هل تعلم؟ رحلة الأرقام',
  text: 'الأرقام التي نكتب بها اليوم وُلدت في الهند، ثم أخذها علماء الحضارة الإسلامية وطوّروها، ومنهم الخوارزمي الذي استعمل الصفر في حساباته. ومن بجاية في الجزائر تعلّم الإيطالي فيبوناتشي هذه الأرقام ونقلها إلى أوروبا، فانتشر الحساب العشري في العالم.',
};

/** Les trois leçons rappelées avec leur lien vivant (module 7, « تذكّر »). */
export const RECALL = [
  { lesson: 'silsila-bidun-aqwas', label: 'سلسلة عمليات دون أقواس' },
  { lesson: 'silsila-bi-aqwas', label: 'سلسلة عمليات تتضمّن أقواسًا' },
  { lesson: 'wasf-silsila-hisab', label: 'وصف سلسلة حسابات' },
  { lesson: 'tawzi-darb-jam-tarh', label: 'توزيع الضرب على الجمع والطرح' },
];

/**
 * La وضعية des modules 7 et 8 — l'`evaluation` du manuel REDESSINÉE : l'atelier de nichoirs. Les clés (7 ; 6 ; 7 — 6 — 9, 2, 24 — 6 × 450 − (6 × 85 + 120) = 2070 — 2 équerres) vivent dans `FINAL`
 * et dans le module 8 ; le module 7 n'en montre aucune.
 */
export const SITUATION = {
  source: src('evaluation', 20, 'وضعية للتقويم'),
  title: 'ورشة بيوت العصافير',
  text: 'يصنع نادي البيئة بيوتًا للعصافير. كلّ بيت يحتاج إلى $6$ ألواح خشبية و $4$ زوايا معدنية و $16$ برغيًا. في مخزن النادي $45$ لوحًا و $26$ زاوية و $120$ برغيًا. يُطلى كلّ بيت بطلاء ثمنه $85\\,\\mathrm{DA}$ ، وتُشترى علبة غراء واحدة بـ $120\\,\\mathrm{DA}$ لكلّ البيوت، ويُباع البيت في معرض المدرسة بـ $450\\,\\mathrm{DA}$ . كم بيتًا يصنع النادي؟ وما ربحه؟',
  data: [
    { id: 'kit', text: 'ما يحتاجه كلّ بيت: 6 ألواح و 4 زوايا و 16 برغيًا', useful: true },
    { id: 'stock', text: 'ما في المخزن: 45 لوحًا و 26 زاوية و 120 برغيًا', useful: true },
    { id: 'paint', text: 'طلاء كلّ بيت 85 DA', useful: true },
    { id: 'glue', text: 'علبة غراء واحدة لكلّ البيوت بـ 120 DA', useful: true },
    { id: 'price', text: 'ثمن بيع البيت 450 DA', useful: true },
    { id: 'garden', text: 'تُعلَّق البيوت في حديقة المدرسة', useful: false },
    { id: 'club', text: 'يضمّ نادي البيئة عددًا من التلاميذ', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'نريد عدد البيوت التي يستطيع النادي صنعها كاملة، ثم ربحه. كلّ بيت يحتاج إلى المواد الثلاث معًا، ولكلّ مادّة مخزونها، أمّا الطلاء فثمنه على كلّ بيت والغراء ثمنه مرّة واحدة.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'نبحث لكلّ مادّة على حدة كم بيتًا يكفيها، لأنّ بيتًا ناقصًا لا يُباع؛ ثم نختار الحاصل الذي يحترم المواد كلّها. بعدها نحسب ما بقي في المخزن، ونكتب الربح بسلسلة واحدة تحتاج إلى قوسين.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'ننجز القسمات ونأخذ الأجزاء الصحيحة، ونقرّر عدد البيوت، ثم نحسب الباقي والربح، ونجيب بجملة واضحة تذكر القرار.' },
  ],
};

/** Les corrections des questions du module 7 (reprises par la carte). La solution n'y figure pas. */
export const REMARKS = {
  perMaterial: 'لكلّ مادّة مخزونها وحاجة البيت الواحد منها: نقسم المخزون على الحاجة وحدها، ونأخذ الجزء الصحيح من الحاصل لأنّ البيت الناقص لا يُباع.',
  minWhy: 'كلّ بيت يحتاج إلى المواد كلّها معًا، فالمادّة الأقلّ كفاية هي التي تحدّ العدد؛ وما زاد من المواد الأخرى يبقى في المخزن.',
  maxWrong: 'نأخذ أكبر الحواصل لأنّه يعطي بيوتًا أكثر.',
  maxWhy: 'مادّة نفدت لا تعوّضها مادّة وفيرة: بيت بلا زاوية لا يكتمل، فالأكبر وعد لا يتحقّق.',
  sumWrong: 'نجمع المخزون كلّه ونقسمه على مجموع حاجات البيت.',
  sumWhy: 'قطعة من نوع لا تعوّض قطعة من نوع آخر: لوح زائد لا يحلّ مكان زاوية ناقصة.',
  bracketWhy: 'ثمن الطلاء وثمن الغراء يُطرحان معًا من المبيعات: القوسان يجعلان جمعهما أوّلًا، ولولاهما طُرح الطلاء وحده وأُضيف الغراء.',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا الوضعية واختطّينا الاستراتيجية فقط.',
};

/**
 * Les cinq étapes évaluées du module 8. Chaque distracteur est FAUX et porte une erreur de l'unité (vérifié dans content.test.js) :
 *   E1 les trois quotients (arrondi vers le haut ; décimal gardé ; soustraction au lieu de division)   E2 le nombre de nichoirs (le plus grand quotient ; leur somme ; l'excédent)
 *   E3 ce qui reste (calculé pour 7 nichoirs ; « rien » ; le reste pris pour l'utilisé)   E4 le gain en une chaîne (parenthèse oubliée ; parenthèse fautive ; deux oublis)   E5 les équerres à acheter.
 */
export const FINAL = [
  { id: 'E1', skill: 'qisma', text: 'المرحلة 1 — بقسمة المخزون على حاجة البيت الواحد وأخذ الجزء الصحيح، تكفي الألواح لـ ... بيتًا والزوايا لـ ... والبراغي لـ ...',
    options: ['$7$ ؛ $6$ ؛ $7$', '$8$ ؛ $7$ ؛ $8$', '$7{,}5$ ؛ $6{,}5$ ؛ $7{,}5$', '$39$ ؛ $22$ ؛ $104$'],
    correct: 0,
    explain: '$45 \\div 6 = 7{,}5$ و $26 \\div 4 = 6{,}5$ و $120 \\div 16 = 7{,}5$ ؛ البيت الناقص لا يُباع فنأخذ الجزء الصحيح: $7$ و $6$ و $7$ . الخيار الثاني قرّب إلى الأعلى، والثالث أبقى الجزء العشري، والرابع طرح بدل أن يقسم.' },
  { id: 'E2', skill: 'aqall', text: 'المرحلة 2 — عدد البيوت التي يمكن صنعها كاملة هو ...',
    options: ['$6$', '$7$', '$13$', '$20$'],
    correct: 0,
    explain: 'كلّ بيت يحتاج إلى المواد الثلاث معًا، فالأصغر بين $7$ و $6$ و $7$ هو الذي يحدّ العدد: $6$ بيوت. الخيار الثاني أخذ الأكبر، والثالث جمع $7$ و $6$ ، والرابع جمع الأعداد الثلاثة.' },
  { id: 'E3', skill: 'baqi', text: 'المرحلة 3 — بعد صنع هذه البيوت يبقى في المخزن ...',
    options: ['$9$ ألواح ، وزاويتان ، و $24$ برغيًا', '$3$ ألواح ، ولا زاوية ، و $8$ براغٍ', 'لا شيء يبقى', '$36$ لوحًا ، و $24$ زاوية ، و $96$ برغيًا'],
    correct: 0,
    explain: 'مع $6$ بيوت: $45 - 6 \\times 6 = 9$ و $26 - 6 \\times 4 = 2$ و $120 - 6 \\times 16 = 24$ . الخيار الثاني حُسب لسبعة بيوت، والثالث ظنّ أنّ المخزن يفرغ، والرابع ذكر المستهلَك لا الباقي.' },
  { id: 'E4', skill: 'ribh', text: 'المرحلة 4 — سلسلة واحدة تعطي ربح النادي وقيمتها هي ...',
    options: ['$6 \\times 450 - (6 \\times 85 + 120) = 2070$', '$6 \\times 450 - 6 \\times 85 + 120 = 2310$', '$6 \\times (450 - 85 + 120) = 2910$', '$6 \\times 450 - 85 + 120 = 2735$'],
    correct: 0,
    explain: 'المبيعات $6 \\times 450 = 2700$ ، والتكلفة طلاء $6$ بيوت وعلبة غراء واحدة: $6 \\times 85 + 120 = 630$ ، فالربح $2700 - 630 = 2070$ . القوسان يطرحان التكلفة كلّها. الخيار الثاني أضاف الغراء، والثالث ضرب الغراء في عدد البيوت، والرابع طرح طلاء بيت واحد.' },
  { id: 'E5', skill: 'qarar', text: 'المرحلة 5 — لصنع $7$ بيوت يجب أن يشتري النادي من الزوايا ...',
    options: ['زاويتين', '4 زوايا', 'زاوية واحدة', '28 زاوية'],
    correct: 0,
    explain: '$7$ بيوت تحتاج إلى $4 \\times 7 = 28$ زاوية وفي المخزن $26$ ، فينقص $28 - 26 = 2$ . الخيار الثاني أخذ حاجة بيت واحد، والثالث نقص بزاوية، والرابع أخذ الحاجة كلّها دون خصم المخزون.' },
];
