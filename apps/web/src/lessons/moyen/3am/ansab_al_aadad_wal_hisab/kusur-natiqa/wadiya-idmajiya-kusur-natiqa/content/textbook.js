/**
 * Le contenu de « أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة » (3AM, unité 2) — données pures. Le manuel (p. 22 : opener et تحدّ ; p. 33 : أؤكّد 8 et 12 ;
 * p. 36 : `integration` et `evaluation`) est la RÉFÉRENCE ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène).
 * Le تحدّ de Hicham (1/4, 1/5, 2/3 du reste) devient la tirelire de Meriem (1/3, 1/4, puis 3/5 du reste ; 1500 DA restent) ; aucune ligne n'envoie au manuel : `SourceTag` est muet.
 * Les deux erreurs d'impression du manuel (`method-9` : 23/33 pour 15/11 ; la « solution brève » de l'intégration : 59/7 pour 57/7) ne sont JAMAIS montrées.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » — six affirmations de la plateforme qui mesurent UNE الكفاءة clé de chacune des cinq leçons de l'unité. Les items 1 et 6 sont la réécriture (autres nombres) de
 * أؤكّد 8 et 12 ; ils citent leur origine par `cites`.
 */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'maqlub', text: 'مقلوب العدد $\\frac{1}{4} + \\frac{2}{3}$ هو $\\frac{12}{11}$ .', answer: true,
    why: '$\\frac{1}{4} + \\frac{2}{3} = \\frac{3}{12} + \\frac{8}{12} = \\frac{11}{12}$ ، ومقلوب $\\frac{11}{12}$ هو $\\frac{12}{11}$ .', cites: [src('self-8', 33, 'أؤكّد تعلّماتي', 8)] },
  { skill: 'tasawi', text: '$\\frac{5}{8} > \\frac{3}{5}$ .', answer: true, why: 'بالمقام $40$ : $\\frac{25}{40} > \\frac{24}{40}$ .' },
  { skill: 'jamTarh', text: '$\\frac{5}{6} - \\frac{1}{4} = \\frac{7}{12}$ .', answer: true, why: 'المقام المشترك $12$ : $\\frac{10}{12} - \\frac{3}{12} = \\frac{7}{12}$ .' },
  { skill: 'natiq', text: '$\\frac{9}{-12} = \\frac{3}{4}$ .', answer: false, why: 'المقام سالب والبسط موجب: الناتج سالب. $\\frac{9}{-12} = -\\frac{9}{12} = -\\frac{3}{4}$ .' },
  { skill: 'amaliyat', text: '$-\\frac{2}{3} \\div \\frac{4}{9} = -\\frac{3}{2}$ .', answer: true, why: 'الإشارتان مختلفتان فالحاصل سالب، ونضرب في المقلوب: $\\frac{2}{3} \\times \\frac{9}{4} = \\frac{18}{12} = \\frac{3}{2}$ .' },
  { skill: 'maqlub', text: 'إذا كان $\\frac{x}{y} = \\frac{3}{4}$ و $\\frac{y}{z} = \\frac{2}{5}$ فإنّ $\\frac{x}{z} = \\frac{3}{10}$ .', answer: true,
    why: '$\\frac{x}{z} = \\frac{x}{y} \\times \\frac{y}{z} = \\frac{3}{4} \\times \\frac{2}{5} = \\frac{6}{20} = \\frac{3}{10}$ .', cites: [src('self-12', 33, 'أؤكّد تعلّماتي', 12)] },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** « هل تعلم » de la fin du module 0 (le cadre d'ouverture de l'unité, réécrit ; rien au-delà de ce qu'il dit). */
export const DID_YOU_KNOW = {
  source: src('opener', 22, 'تمهيد (نص تاريخي)'),
  text: 'الكتابة الكسرية التي نستعملها اليوم وصلتنا من علماء الحضارة العربية الإسلامية. في القرن العاشر الميلادي عبّر أبو الوفاء البوزجاني عن النسبة بين قيمتين بعدد، وفي سنة $1427$ عرض غياث الدين الكاشي نظرية الكسور العشرية وبيّن أنّ العمليات على الكسور تؤول إلى عمليات على الأعداد الصحيحة.',
};

/**
 * La وضعية des modules 7 et 8 — le « تحدّي » de l'unité REDESSINÉ : la tirelire de Meriem. Deux fractions du TOUT (1/3, 1/4), une fraction du RESTE (3/5), puis le tout retrouvé
 * d'un reste connu. Les clés (7/12, 5/12, 1/4, 1/6, 9000 DA) vivent dans `FINAL` et dans le module 8 ; le module 7 n'en montre aucune.
 */
export const SITUATION = {
  source: src('challenge', 22, 'تحدّي'),
  title: 'حصّالة مريم',
  text: 'أنفقت مريم $\\frac{1}{3}$ مما ادّخرته في حصّالتها على حقيبة مدرسية، و $\\frac{1}{4}$ منه على كتب، ثم أهدت $\\frac{3}{5}$ ما بقي لجمعية خيرية في الحيّ، فبقي لها في النهاية $1500$ DA . ما المبلغ الذي ادّخرته مريم؟',
  data: [
    { id: 'bag', text: 'أنفقت 1/3 من المدّخرات على حقيبة', useful: true },
    { id: 'books', text: 'أنفقت 1/4 من المدّخرات على كتب', useful: true },
    { id: 'gift', text: 'أهدت 3/5 مما بقي لجمعية خيرية', useful: true },
    { id: 'left', text: 'بقي لها في النهاية 1500 DA', useful: true },
    { id: 'cat', text: 'الحصّالة على شكل قطّة', useful: false },
    { id: 'kind', text: 'الجمعية الخيرية في حيّ مريم', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'نريد المبلغ الكلّي الذي ادّخرته مريم. الكسران $\\frac{1}{3}$ و $\\frac{1}{4}$ كسران من المبلغ كلّه، أمّا $\\frac{3}{5}$ فهو كسر من الباقي بعد الحقيبة والكتب، لا من المبلغ كلّه. والمبلغ $1500$ DA هو ما بقي في النهاية، لا المبلغ المدّخر.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'نجمع ما أُنفق أوّلًا، ثم نطرحه من الكلّ لنعرف الباقي، ثم نأخذ كسر الهدية من ذلك الباقي، ثم نطرح الهدية منه فنعرف ما بقي في النهاية. أخيرًا نعرف المبلغ الكلّي من كسر معلوم قيمته: نقسم القيمة على الكسر.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'ننجز الحسابات على الكسور مراعين الأولوية، ونختزل النتائج، ونتحقّق، ثم نكتب الجواب بجملة واضحة.' },
  ],
};

/** Les corrections des questions du module 7 (reprises par la carte). La solution n'y figure pas. */
export const REMARKS = {
  wholeWrong: 'نعدّ $\\frac{3}{5}$ كسرًا من المبلغ كلّه: $\\frac{1}{3} + \\frac{1}{4} + \\frac{3}{5}$ .',
  wholeWhy: 'سيصير ما أنفقته مريم $\\frac{71}{60}$ من مدّخراتها، وهو أكبر من الكلّ؛ وما يبقى $1 - \\frac{1}{3} - \\frac{1}{4} - \\frac{3}{5} = -\\frac{11}{60}$ سالب، وهذا مستحيل.',
  wholeRight: 'الثلاثة أخماس كسر من الباقي بعد الحقيبة والكتب: نحسب الباقي أوّلًا ثم نأخذ ثلاثة أخماسه.',
  baseWhy: 'الكسر يعني دائمًا «كسر من شيء ما»، والشيء هنا يتغيّر: المدّخرات كلّها للحقيبة والكتب، والباقي بعدهما للهدية.',
  orderWhy: 'كل حساب يحتاج نتيجة الحساب الذي قبله: لا نعرف الباقي قبل أن نعرف المُنفَق، ولا نأخذ كسرًا من الباقي قبل أن نعرف الباقي.',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا الوضعية واختطّينا الاستراتيجية فقط.',
};

/**
 * Les cinq étapes du test (module 8), évaluées. Chaque distracteur est FAUX et porte l'erreur de l'unité qui le produit (vérifié dans content.test.js).
 *   E1 la somme (ACROSS : numérateurs et dénominateurs ajoutés ; produit ; le reste donné pour la somme)   E2 le reste
 *   E3 la fraction du reste (SYN-WHOLE : « du tout » ; base fausse ; somme)                               E4 ce qui reste (SYN-WHOLE : 1 − 1/3 − 1/4 − 3/5 ; la somme moins la remise ; la remise prise pour le reste)
 *   E5 le tout d'un reste connu (÷ lu ×, mauvaise base, comparaison de fractions de touts différents).
 */
export const FINAL = [
  { id: 'E1', skill: 'jam', text: 'المرحلة 1 — الكسر الذي يمثّل ما أنفقته مريم على الحقيبة والكتب هو ...',
    options: ['$\\frac{1}{3} + \\frac{1}{4} = \\frac{7}{12}$', '$\\frac{1 + 1}{3 + 4} = \\frac{2}{7}$', '$\\frac{1}{3} \\times \\frac{1}{4} = \\frac{1}{12}$', '$1 - \\frac{7}{12} = \\frac{5}{12}$'], correct: 0,
    explain: 'ما أنفقته أجزاء من المبلغ نفسه، فنجمعها بمقام مشترك: $\\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}$ . الخطأ الأوّل جمع البسطين والمقامين، والثاني ضرب بدل الجمع، والثالث هو الباقي لا المُنفَق.' },
  { id: 'E2', skill: 'rest', text: 'المرحلة 2 — الكسر الذي يمثّل الباقي بعد الحقيبة والكتب هو ...',
    options: ['$1 - \\frac{7}{12} = \\frac{5}{12}$', '$\\frac{7}{12}$', '$1 - \\frac{2}{7} = \\frac{5}{7}$', '$1 - \\frac{1}{12} = \\frac{11}{12}$'], correct: 0,
    explain: 'الباقي هو الكلّ ناقص المُنفَق: $\\frac{12}{12} - \\frac{7}{12} = \\frac{5}{12}$ . الخطأ الأوّل أخذ المُنفَق على أنّه الباقي، والآخران طرحا من الكلّ مجموعًا خاطئًا.' },
  { id: 'E3', skill: 'gift', text: 'المرحلة 3 — الكسر الذي تمثّله الهدية من المبلغ كلّه هو ...',
    options: ['$\\frac{3}{5} \\times \\frac{5}{12} = \\frac{1}{4}$', '$\\frac{3}{5}$', '$\\frac{3}{5} \\times \\frac{7}{12} = \\frac{7}{20}$', '$\\frac{3}{12} + \\frac{5}{12} = \\frac{2}{3}$'], correct: 0,
    explain: 'الثلاثة أخماس هي من الباقي $\\frac{5}{12}$ : $\\frac{3}{5} \\times \\frac{5}{12} = \\frac{15}{60} = \\frac{1}{4}$ . الخطأ الأوّل جعلها من المبلغ كلّه، والثاني أخذها من المُنفَق، والثالث جمع كسرين بلا معنى في الوضعية.' },
  { id: 'E4', skill: 'left', text: 'المرحلة 4 — الكسر الذي يمثّل ما بقي لمريم في النهاية هو ...',
    options: ['$\\frac{5}{12} - \\frac{1}{4} = \\frac{1}{6}$', '$1 - \\frac{1}{3} - \\frac{1}{4} - \\frac{3}{5} = -\\frac{11}{60}$', '$\\frac{1}{4}$', '$\\frac{7}{12} - \\frac{1}{4} = \\frac{1}{3}$'], correct: 0,
    explain: 'نطرح الهدية من الباقي: $\\frac{5}{12} - \\frac{3}{12} = \\frac{2}{12} = \\frac{1}{6}$ . الخطأ الأوّل عدّ $\\frac{3}{5}$ من الكلّ فخرج عدد سالب، والثاني هو الهدية لا الباقي، والثالث طرحها من المُنفَق.' },
  { id: 'E5', skill: 'total', text: 'المرحلة 5 — بقي في النهاية $1500$ DA . ما المبلغ الذي ادّخرته مريم؟ وما أكبر إنفاق لها؟',
    options: ['$9000$ DA ؛ أكبر إنفاق هو الحقيبة ($3000$ DA)', '$250$ DA ؛ أكبر إنفاق هو الحقيبة', '$9000$ DA ؛ أكبر إنفاق هو الهدية لأنّ $\\frac{3}{5} > \\frac{1}{3}$', '$6000$ DA ؛ أكبر إنفاق هو الحقيبة ($2000$ DA)'], correct: 0,
    explain: '$1500 \\div \\frac{1}{6} = 1500 \\times 6 = 9000$ DA . الحقيبة $\\frac{1}{3} \\times 9000 = 3000$ ، والكتب $\\frac{1}{4} \\times 9000 = 2250$ ، والهدية $\\frac{1}{4} \\times 9000 = 2250$ . لا نقارن $\\frac{3}{5}$ بـ $\\frac{1}{3}$ لأنّهما كسران من شيئين مختلفين.' },
];
