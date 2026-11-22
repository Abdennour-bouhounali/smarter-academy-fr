/**
 * Le contenu de « أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة » (3AM, unité 3) — données pures. Le manuel (p. 52 : `integration` et `evaluation` ; p. 53 : `ict`) est la
 * RÉFÉRENCE ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène). La molécule de CO₂ du manuel devient une
 * FEUILLE D'OR (atome de 288 pm, feuille de 0,1 µm) ; les globules rouges deviennent la situation 4 ; l'échiquier de l'ICT, la situation 1. Aucune ligne n'envoie au manuel :
 * `SourceTag` est muet. Les erreurs d'impression du manuel (la « solution brève » de l'intégration, le tableau des préfixes) ne sont JAMAIS montrées.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » — six affirmations de la plateforme qui mesurent UNE الكفاءة clé de chacune des quatre leçons de l'unité.
 */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'ashara', text: '$10^{-4} = 0{,}0001$ .', answer: true, why: '$10^{-4} = \\frac{1}{10^{4}} = \\frac{1}{10\\,000} = 0{,}0001$ : الواحد في الرتبة الرابعة بعد الفاصلة.' },
  { skill: 'qawaid', text: '$10^{6} \\times 10^{-2} = 10^{-12}$ .', answer: false, why: 'في الجداء نجمع الأسّين: $6 + (-2) = 4$ ، إذن $10^{6} \\times 10^{-2} = 10^{4}$ .' },
  { skill: 'ilmiya', text: 'الكتابة العلمية للعدد $45\\,000$ هي $45 \\times 10^{3}$ .', answer: false, why: 'في الكتابة العلمية يكون العدد الأوّل من $1$ إلى أقل من $10$ : $45\\,000 = 4{,}5 \\times 10^{4}$ .' },
  { skill: 'ilmiya', text: 'رتبة قدر العدد $6{,}7 \\times 10^{5}$ هي $7 \\times 10^{5}$ .', answer: true, why: 'نُدوّر $6{,}7$ إلى الوحدة فنجد $7$ ، فرتبة القدر $7 \\times 10^{5}$ .' },
  { skill: 'quwa', text: '$(-2)^{4} = -16$ .', answer: false, why: 'الأسّ زوجي فالنتيجة موجبة: $(-2)^{4} = (-2) \\times (-2) \\times (-2) \\times (-2) = 16$ .' },
  { skill: 'quwa', text: '$5 - 2 \\times 3^{2} = -13$ .', answer: true, why: 'القوة أوّلًا: $3^{2} = 9$ ، ثم الضرب $2 \\times 9 = 18$ ، ثم الطرح $5 - 18 = -13$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** « هل تعلم » de la fin du module 0 (réécrit : les préfixes du système métrique sont des puissances de 10). */
export const DID_YOU_KNOW = {
  source: src('integration', 52, 'أدمج تعلّماتي'),
  text: 'أسماء مثل «ميلي» و«ميكرو» و«نانو» و«بيكو» ما هي إلا قوى للعدد $10$ : $10^{-3}$ و $10^{-6}$ و $10^{-9}$ و $10^{-12}$ . بها يقيس العلماء سُمك رقاقة أو قطر ذرّة بالمتر نفسه.',
};

/**
 * La وضعية des modules 7 et 8 — « رقاقة الذهب » (l'intégration du manuel REDESSINÉE : atomes et préfixes). Les clés (2,88 × 10⁻¹⁰ m ; 10⁻⁷ m ; 3,47 × 10² ; 3 × 10² ;
 * entre 10⁶ et 10⁷) vivent dans `FINAL` et dans le module 8 ; le module 7 n'en montre aucune.
 */
export const SITUATION = {
  source: src('integration', 52, 'أدمج تعلّماتي'),
  title: 'رقاقة الذهب',
  text: 'في ورشة لتذهيب إطارات الصور تستعمل الحِرفيّة نور رقائق من الذهب سُمك الواحدة منها حوالي $0{,}1\\ \\mu\\mathrm{m}$ ، وثمن الرقيقة $350$ DA . قطر ذرّة الذهب حوالي $288\\ \\mathrm{pm}$ . تذكّر أنّ: ميلي $10^{-3}$ ، ميكرو $10^{-6}$ ، نانو $10^{-9}$ ، بيكو $10^{-12}$ .',
  data: [
    { id: 'thick', text: 'سُمك الرقيقة حوالي 0,1 µm', useful: true },
    { id: 'atom', text: 'قطر ذرّة الذهب حوالي 288 pm', useful: true },
    { id: 'prefix', text: 'جدول البادئات: ميلي وميكرو ونانو وبيكو', useful: true },
    { id: 'price', text: 'ثمن الرقيقة 350 DA', useful: false },
    { id: 'frames', text: 'الورشة تذهّب إطارات الصور', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'نريد أن نعرف كم طبقة من الذرّات تحويها الرقيقة، ثم كم ذرّة تصطفّ جنبًا إلى جنب على طول ميلّيمتر. السُّمك وقطر الذرّة قياسان للطول، لكن بوحدتين مختلفتين: $\\mu\\mathrm{m}$ و $\\mathrm{pm}$ . أمّا ثمن الرقيقة فلا علاقة له بالسؤال.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'نحوّل القياسين إلى وحدة واحدة هي المتر مستعملين قوى العدد $10$ ، ثم نقسم السُّمك على قطر الذرّة لنعرف عدد الطبقات، وبالطريقة نفسها نقسم ميلّيمترًا على قطر الذرّة. نكتب النتيجة كتابة علمية ثم نأخذ رتبة قدرها وحصرها.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'ننجز الحسابات على قوى العدد $10$ ونقسم الأعداد العشرية على حدة، ثم نتحقّق أنّ النتيجة معقولة، ونكتب جوابًا واضحًا بجملة.' },
  ],
};

/** Les corrections des questions du module 7 (reprises par la carte). La solution n'y figure pas. */
export const REMARKS = {
  unitWhy: 'قياسان بوحدتين مختلفتين لا يُقسم أحدهما على الآخر كما هما: $\\mu\\mathrm{m}$ و $\\mathrm{pm}$ ليستا الوحدة نفسها، فنوحّد الوحدة أوّلًا.',
  unitRight: 'نحوّلهما إلى المتر مستعملين قوى العدد $10$ ، فيصير القسمة بين عددين بالوحدة نفسها.',
  divWhy: 'عدد الطبقات هو عدد المرّات التي يتّسع فيها قطر الذرّة داخل السُّمك: سُمك مقسوم على قطر، لا قطر على سُمك ولا جداء.',
  orderWhy: 'رتبة القدر تُقرأ من الكتابة العلمية للنتيجة: نُدوّر العدد $a$ إلى الوحدة ونُبقي القوة، لا من عدد أرقام النتيجة.',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا الوضعية واختطّينا الاستراتيجية فقط.',
};

/**
 * Les cinq étapes du test (module 8), évaluées. Chaque distracteur est FAUX et porte l'erreur de l'unité qui le produit (vérifié dans content.test.js).
 *   E1 le diamètre en m (préfixe gardé sans normaliser ; 288 × 10⁻¹⁰ non normalisé ; préfixe pris pour nano)      E2 le sous-multiple (10⁻⁵ ; 10⁻⁶ µm gardé ; 10⁻⁸)
 *   E3 le quotient (exposants ADDITIONNÉS ; mauvais exposant ; quotient inversé)                                 E4 la rang de grandeur (arrondi par excès ; 1 ; mauvais exposant)
 *   E5 l'encadrement (rang décalé vers le bas ; vers le haut ; exposants négatifs).
 */
export const FINAL = [
  { id: 'E1', skill: 'atom', text: 'المرحلة 1 — قطر ذرّة الذهب بالمتر (كتابة علمية) هو ...',
    options: ['$2{,}88 \\times 10^{-10}\\ \\mathrm{m}$', '$2{,}88 \\times 10^{-12}\\ \\mathrm{m}$', '$288 \\times 10^{-10}\\ \\mathrm{m}$', '$2{,}88 \\times 10^{-9}\\ \\mathrm{m}$'], correct: 0,
    explain: '$288\\ \\mathrm{pm} = 288 \\times 10^{-12}\\ \\mathrm{m} = 2{,}88 \\times 10^{2} \\times 10^{-12} = 2{,}88 \\times 10^{-10}\\ \\mathrm{m}$ . الخطأ الأوّل أبقى الأسّ $-12$ دون إزاحة الفاصلة، والثاني كتب $288 \\times 10^{-10}$ وهو ليس القطر ($2{,}88 \\times 10^{-8}$)، والثالث أخذ الأسّ $-9$ فكأنّه حوّل من $\\mathrm{nm}$ لا من $\\mathrm{pm}$ .' },
  { id: 'E2', skill: 'thick', text: 'المرحلة 2 — سُمك الرقيقة بالمتر هو ...',
    options: ['$10^{-7}\\ \\mathrm{m}$', '$10^{-5}\\ \\mathrm{m}$', '$10^{-6}\\ \\mathrm{m}$', '$10^{-8}\\ \\mathrm{m}$'], correct: 0,
    explain: '$0{,}1\\ \\mu\\mathrm{m} = 0{,}1 \\times 10^{-6}\\ \\mathrm{m} = 10^{-1} \\times 10^{-6} = 10^{-7}\\ \\mathrm{m}$ . الخطأ الأوّل عدّ $0{,}1$ كأنّه $10$ ، والثاني أهمل العامل $0{,}1$ فأبقى $10^{-6}$ ، والثالث أزاح الفاصلة مرّتين بدل مرّة.' },
  { id: 'E3', skill: 'layers', text: 'المرحلة 3 — عدد طبقات الذرّات في الرقيقة (كتابة علمية، بالتقريب) هو ...',
    options: ['$3{,}47 \\times 10^{2}$', '$3{,}47 \\times 10^{-17}$', '$3{,}47 \\times 10^{3}$', '$2{,}88 \\times 10^{-3}$'], correct: 0,
    explain: '$\\frac{10^{-7}}{2{,}88 \\times 10^{-10}} = \\frac{1}{2{,}88} \\times 10^{-7+10} \\approx 0{,}347 \\times 10^{3} = 3{,}47 \\times 10^{2}$ . الخطأ الأوّل جمع الأسّين ($-7 + (-10)$) بدل طرحهما، والثاني نسي إزاحة الفاصلة فأبقى $10^{3}$ ، والثالث قسم قطر الذرّة على السُّمك.' },
  { id: 'E4', skill: 'order', text: 'المرحلة 4 — رتبة قدر عدد الطبقات هي ...',
    options: ['$3 \\times 10^{2}$', '$4 \\times 10^{2}$', '$1 \\times 10^{2}$', '$3 \\times 10^{3}$'], correct: 0,
    explain: 'عدد الطبقات $3{,}47 \\times 10^{2}$ ، ونُدوّر $3{,}47$ إلى الوحدة فنجد $3$ ، فرتبة القدر $3 \\times 10^{2}$ . الخطأ الأوّل دوّر إلى $4$ ، والثاني أخذ $1$ ، والثالث غيّر الأسّ.' },
  { id: 'E5', skill: 'row', text: 'المرحلة 5 — عدد الذرّات المتجاورة على طول $1\\ \\mathrm{mm}$ محصور بين ...',
    options: ['$10^{6}$ و $10^{7}$', '$10^{5}$ و $10^{6}$', '$10^{7}$ و $10^{8}$', '$10^{-7}$ و $10^{-6}$'], correct: 0,
    explain: '$\\frac{10^{-3}}{2{,}88 \\times 10^{-10}} \\approx 0{,}347 \\times 10^{7} = 3{,}47 \\times 10^{6}$ ، و $10^{6} \\le 3{,}47 \\times 10^{6} < 10^{7}$ . الحصران الثاني والثالث يتجاوران الصحيح بدرجة، والرابع أسّاه سالبان.' },
];
