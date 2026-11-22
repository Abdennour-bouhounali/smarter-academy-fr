/**
 * Le contenu de « أدمج تعلّماتي — الحساب الحرفي » (3AM, unité 4) — données pures. Le manuel (p. 68 : `integration` et `evaluation` ; p. 67 : `deep-47` ; p. 66 : `deep-35`) est la RÉFÉRENCE ;
 * chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène). L'intégration du manuel (les départs décalés d'une piste d'athlétisme,
 * écart ≈ 2π pour un couloir de 1 m) devient la piste de l'école (couloirs de 1,2 m, trois coureuses) ; aucune ligne n'envoie au manuel : `SourceTag` est muet.
 * Le تحدّ de l'unité (élément `challenge`) est cité par la banque de `nashr-jabri-3am`, pas ici : le bonus du module 8 est un ANALOGUE de la plateforme (somme 48,5, on ajoute 4 à chacun).
 * Rien ici ne montre une valeur de la solution au module 7 (cf. content.test.js).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** « أستعدّ » — six affirmations de la plateforme, UNE ou DEUX par leçon de l'unité. Aucune ne donne les nombres des situations. */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'tabsit', text: '$7x - 3 - (2x - 5) = 5x + 2$ .', answer: true, why: 'نحذف الأقواس مسبوقة بإشارة «ناقص» فتتغيّر إشارة كل حدّ: $7x - 3 - 2x + 5 = 5x + 2$ .' },
  { skill: 'nashr', text: '$(x - 3)(x + 2) = x^2 - x - 6$ .', answer: true, why: 'ننشر: $x^2 + 2x - 3x - 6 = x^2 - x - 6$ .' },
  { skill: 'qimat', text: 'قيمة العبارة $x^2 - 2x$ من أجل $x = -3$ هي $3$ .', answer: false, why: 'نضع العدد السالب بين قوسين: $(-3)^2 - 2 \\times (-3) = 9 + 6 = 15$ .' },
  { skill: 'qimat', text: 'إذا كانت لعبارتين القيمة نفسها من أجل $x = 0$ فهما متساويتان.', answer: false, why: 'قيمة واحدة متطابقة لا تُثبت شيئًا: يكفي مثال واحد تختلف فيه القيمتان لنُبطل المساواة، أمّا إثباتها فبالنشر.' },
  { skill: 'muqaranat', text: '$\\frac{4}{7} - \\frac{5}{9} = \\frac{1}{63}$ ، إذن $\\frac{4}{7} > \\frac{5}{9}$ .', answer: true, why: 'بالمقام $63$ : $\\frac{36}{63} - \\frac{35}{63} = \\frac{1}{63} > 0$ ، والفرق الموجب يعني أنّ الأوّل أكبر.' },
  { skill: 'muqaranat', text: 'إذا كان $A - B = x - 2$ فإنّ $A > B$ من أجل $x = 5$ .', answer: true, why: 'من أجل $x = 5$ : $A - B = 5 - 2 = 3 > 0$ ، إذن $A > B$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/**
 * La وضعية des modules 7 et 8 — l'intégration du manuel REDESSINÉE : la piste de l'école. Les clés (P₁ = 2y + πx, P₂ − P₁ = 2,4π ≈ 7,54 m, P₃ − P₁ = 4,8π ≈ 15,08 m, 170 + 73π ≈ 399,34 m)
 * vivent dans `FINAL` et dans le module 8 ; le module 7 n'en montre aucune.
 */
export const SITUATION = {
  source: src('integration', 68, 'أدمج تعلّماتي'),
  title: 'انطلاقات متفاوتة في مضمار المدرسة',
  text: 'يتكوّن مضمار مدرستنا من مستقيمين طول كلٍّ منهما $y$ ونصفي دائرة. عرض كل رواق $1{,}2\\,\\text{m}$ ، وقطر نصف الدائرة عند خطّ الرواق الأوّل $x$ . في سباق دورة كاملة تنطلق ريم (الرواق الثاني) أمام سلمى (الرواق الأوّل)، وتنطلق إيناس (الرواق الثالث) أمامهما. لماذا؟ وبكم مترًا؟ (تذكّر: محيط دائرة قطرها $d$ هو $\\pi \\times d$ .)',
  data: [
    { id: 'width', text: 'عرض كل رواق 1,2 م', useful: true },
    { id: 'shape', text: 'كل رواق: مستقيمان طول كلٍّ منهما y ونصفا دائرة', useful: true },
    { id: 'diam', text: 'قطر نصف الدائرة عند الرواق الأوّل x', useful: true },
    { id: 'lanes', text: 'سلمى في الرواق الأوّل وريم في الثاني وإيناس في الثالث', useful: true },
    { id: 'lap', text: 'السباق دورة كاملة', useful: true },
    { id: 'color', text: 'لون المضمار أحمر', useful: false },
    { id: 'fest', text: 'السباق في حفل نهاية السنة', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'نريد أن نعرف لماذا تتقدّم ريم وإيناس عند الانطلاق، وبكم مترًا. كل متسابقة تدور دورة كاملة في رواقها، والمستقيمان في الرواقات الثلاثة متساويان، أمّا نصفا الدائرة فيتّسعان كلّما ابتعدنا عن الداخل.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'لا نعرف $x$ ولا $y$ : لن نجرّب قيمًا معيّنة، بل نكتب طول مسار كل رواق بدلالة الحرفين، ثم نبسّط الفرق بين مسارين لنرى هل يتعلّق بهما، وأخيرًا نعوّض ونقرّر.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'ننجز الكتابة، ثم التبسيط، ثم الحساب بقيمة تقريبية للعدد $\\pi$ ، ونكتب الجواب بجملة واضحة تفسّر الانطلاقات المتفاوتة.' },
  ],
};

/** Les corrections des questions du module 7 (reprises par la carte). La solution n'y figure pas. */
export const REMARKS = {
  sameWhy: 'في الرواقات الثلاثة مستقيمان بالطول نفسه $y$ ؛ ما يتغيّر هو قطر نصفي الدائرة، لأنّ كل رواق يتّسع من الجانبين.',
  letterWhy: 'لا نعرف قيمتي $x$ و $y$ ، وقيمة واحدة مجرَّبة لا تحكم على كل المضامير. نكتب الأطوال بالحروف ثم نبسّط الفرق: إن اختفى منه حرف فهذا الحرف لا يؤثّر في الفرق.',
  valueWrong: 'نعوّض $x$ و $y$ بعددين نختارهما ونحكم على كل المضامير.',
  valueWhy: 'ما نجده يخصّ العددين المختارين وحدهما؛ مضمار آخر بعدين آخرين قد يعطي فرقًا آخر ما لم نبرهن بالحروف.',
  orderWhy: 'التبسيط قبل التعويض: نكتب الأطوال، ثم نبسّط الفرق فيصبح أقصر وأسهل، وبعدها نعوّض بقيمة تقريبية للعدد $\\pi$ .',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا الوضعية واختطّينا الاستراتيجية فقط.',
};

/**
 * Les quatre étapes évaluées du module 8 (+ le bonus non compté `BONUS`). Chaque distracteur est FAUX et porte une erreur de l'unité (vérifié dans content.test.js) :
 *   E1 les trois longueurs (largeur du couloir ajoutée au diamètre ; π oublié sur l'ajout ; un seul droit)   E2 les différences (droits non simplifiés ; π perdu ; somme au lieu de différence)
 *   E3 les valeurs (valeur exacte non convertie ; triple d'un écart ; division par π)    E4 la longueur de la piste et la décision (droits oubliés ; parenthèse fautive ; écart dit nul).
 */
export const FINAL = [
  { id: 'E1', skill: 'ecrire', text: 'المرحلة 1 — أطوال مسارات الرواقات الثلاثة ($P_1$ و $P_2$ و $P_3$) هي ...',
    options: [
      '$P_1 = 2y + \\pi x$ ؛ $P_2 = 2y + \\pi(x + 2{,}4)$ ؛ $P_3 = 2y + \\pi(x + 4{,}8)$',
      '$P_1 = 2y + \\pi x$ ؛ $P_2 = 2y + \\pi(x + 1{,}2)$ ؛ $P_3 = 2y + \\pi(x + 2{,}4)$',
      '$P_1 = 2y + \\pi x$ ؛ $P_2 = 2y + \\pi x + 2{,}4$ ؛ $P_3 = 2y + \\pi x + 4{,}8$',
      '$P_1 = y + \\pi x$ ؛ $P_2 = y + \\pi(x + 2{,}4)$ ؛ $P_3 = y + \\pi(x + 4{,}8)$'],
    correct: 0,
    explain: 'كل رواق يتّسع بعرضه من الجانبين، فيزيد القطر $2 \\times 1{,}2 = 2{,}4$ عن الرواق السابق، ومحيط الدائرة $\\pi \\times$ القطر، مع المستقيمين $2y$ . الخطأ الثاني زاد القطر بعرض واحد، والثالث نسي ضرب الزيادة في $\\pi$ ، والرابع عدّ مستقيمًا واحدًا.' },
  { id: 'E2', skill: 'basit', text: 'المرحلة 2 — بعد التبسيط، $P_2 - P_1$ و $P_3 - P_1$ يساويان ...',
    options: [
      '$P_2 - P_1 = 2{,}4\\pi$ و $P_3 - P_1 = 4{,}8\\pi$ ، ولا يتعلّقان بـ $x$ ولا بـ $y$',
      '$P_2 - P_1 = 2y + 2{,}4\\pi$ و $P_3 - P_1 = 2y + 4{,}8\\pi$',
      '$P_2 - P_1 = 2{,}4$ و $P_3 - P_1 = 4{,}8$',
      '$P_2 - P_1 = 4y + 2\\pi x + 2{,}4\\pi$ و $P_3 - P_1 = 4y + 2\\pi x + 4{,}8\\pi$'],
    correct: 0,
    explain: '$2y + \\pi(x + 2{,}4) - (2y + \\pi x) = 2y + \\pi x + 2{,}4\\pi - 2y - \\pi x = 2{,}4\\pi$ : الحدّان $2y$ و $\\pi x$ يختفيان، فالفرق لا يتعلّق بشكل المضمار. الخطأ الثاني لم يطرح المستقيمين، والثالث أضاع $\\pi$ ، والرابع جمع بدل أن يطرح.' },
  { id: 'E3', skill: 'qima', text: 'المرحلة 3 — بمفتاح $\\pi$ في الآلة الحاسبة وتدوير النتيجة إلى $0{,}01$ ، تتقدّم ريم على سلمى بحوالي ... وتتقدّم إيناس عليها بحوالي ...',
    options: ['$7{,}54\\,\\text{m}$ و $15{,}08\\,\\text{m}$', '$2{,}4\\,\\text{m}$ و $4{,}8\\,\\text{m}$', '$7{,}54\\,\\text{m}$ و $22{,}62\\,\\text{m}$', '$0{,}76\\,\\text{m}$ و $1{,}53\\,\\text{m}$'],
    correct: 0,
    explain: '$2{,}4\\pi \\approx 7{,}5398 \\approx 7{,}54$ و $4{,}8\\pi \\approx 15{,}0796 \\approx 15{,}08$ . الثاني ترك $\\pi$ ، والثالث أخذ ثلاثة أضعاف الأوّل لإيناس، والرابع قسم على $\\pi$ بدل أن يضرب.' },
  { id: 'E4', skill: 'qarar', text: 'المرحلة 4 — طول مسار سلمى من أجل $y = 85$ و $x = 73$ ، وما يفسّر انطلاق إيناس أمامها ...',
    options: [
      '$P_1 = 170 + 73\\pi \\approx 399{,}34\\,\\text{m}$ ؛ رواق إيناس أطول بحوالي $15{,}08\\,\\text{m}$ فتتقدّم بهذا المقدار لتقطع المسافة نفسها',
      '$P_1 = 73\\pi \\approx 229{,}34\\,\\text{m}$ ؛ رواق إيناس أطول بحوالي $15{,}08\\,\\text{m}$ فتتقدّم بهذا المقدار لتقطع المسافة نفسها',
      '$P_1 = (170 + 73)\\pi \\approx 763{,}41\\,\\text{m}$ ؛ رواق إيناس أطول بحوالي $15{,}08\\,\\text{m}$ فتتقدّم بهذا المقدار لتقطع المسافة نفسها',
      '$P_1 = 170 + 73\\pi \\approx 399{,}34\\,\\text{m}$ ؛ الرواقات متساوية الطول، فلا سبب لانطلاق إيناس أمامها'],
    correct: 0,
    explain: '$2 \\times 85 = 170$ و $73\\pi \\approx 229{,}34$ ، فالمجموع $\\approx 399{,}34$ . الرواق الثالث أطول من الأوّل بـ $4{,}8\\pi \\approx 15{,}08\\,\\text{m}$ ، فتنطلق إيناس متقدّمة بهذا المقدار فيقطع الجميع المسافة نفسها من الانطلاق إلى خط الوصول. الثاني نسي المستقيمين، والثالث ضرب المجموع كلّه في $\\pi$ ، والرابع ادّعى تساوي الرواقات.' },
];

/** تحدٍّ — bonus NON compté (module 8, après le test) : un analogue de la plateforme, jamais l'élément `challenge` du manuel. */
export const BONUS = {
  text: 'عددان مجموعهما $48{,}5$ . بكم يزداد جداؤهما إذا أضفنا $4$ لكلٍّ منهما؟',
  options: ['$210$', '$16$', '$194$', '$226$'],
  correct: 0,
  explain: '$(a + 4)(b + 4) - ab = ab + 4a + 4b + 16 - ab = 4(a + b) + 16 = 4 \\times 48{,}5 + 16 = 210$ : الجداء $ab$ يختفي، فالزيادة لا تتعلّق بالعددين وحدهما بل بمجموعهما. الثاني نسي $4(a+b)$ ، والثالث نسي الحدّ $16$ ، والرابع أضاف $16$ مرّتين.',
};
