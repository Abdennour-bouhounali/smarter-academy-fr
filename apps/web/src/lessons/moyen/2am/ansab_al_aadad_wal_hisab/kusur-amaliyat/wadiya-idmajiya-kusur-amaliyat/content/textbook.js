/**
 * Le contenu de « أدمج تعلّماتي — الكسور والعمليات عليها » (2AM, unité 2) — données pures. Le manuel (p. 22 : opener et تحدّي ; p. 36 : `integration` et `evaluation`) est la RÉFÉRENCE ;
 * chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène). Les cinq cartes du تحدّي deviennent celles de Sara
 * (1/2, 1/3, 1/4, 1/6, 1/12 : UN choix de quatre fait 1 — les cartes imprimées n'en ont aucun) ; la situation finale est une terre de coopérative (120 m × 80 m ; 3/8, 1/4, 1/8 DE LA TERRE,
 * puis 2/3 DU VERGER ; 1750 kg de blé) ; aucune ligne n'envoie au manuel : `SourceTag` est muet.
 * Frontière 2AM : dénominateurs dont l'un est multiple des autres ; jamais de division PAR une fraction (le tout se trouve d'une fraction unité par une multiplication).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » — six affirmations de la plateforme qui mesurent UNE الكفاءة clé de chacune des cinq leçons de l'unité ; la sixième reprend les cartes du تحدّي (somme égale à 1).
 */
export const PREP_ITEMS = [];

export const PREP_PLATFORM_ITEMS = [
  { skill: 'qisma', text: '$158 = 12 \\times 13 + 2$ تعبّر عن القسمة الإقليدية لـ $158$ على $12$ .', answer: true,
    why: '$12 \\times 13 = 156$ و $156 + 2 = 158$ والباقي $2$ أصغر من القاسم $12$ ، فهي قسمة إقليدية.' },
  { skill: 'kasr', text: '$3{,}33$ قيمة مقرّبة إلى $0{,}01$ بالزيادة لـ $\\frac{10}{3}$ .', answer: false,
    why: '$\\frac{10}{3} = 3{,}333\\ldots$ فهو بين $3{,}33$ و $3{,}34$ : $3{,}33$ قيمة مقرّبة بالنقصان، والقيمة المقرّبة بالزيادة هي $3{,}34$ .' },
  { skill: 'jamTarh', text: '$\\frac{5}{6} - \\frac{1}{3} = \\frac{1}{2}$ .', answer: true, why: '$\\frac{1}{3} = \\frac{2}{6}$ ، فـ $\\frac{5}{6} - \\frac{2}{6} = \\frac{3}{6} = \\frac{1}{2}$ .' },
  { skill: 'jida', text: '$\\frac{3}{4}$ من $\\frac{2}{9}$ هو $\\frac{1}{6}$ .', answer: true, why: '«كسر من كسر» جداء: $\\frac{3}{4} \\times \\frac{2}{9} = \\frac{6}{36} = \\frac{1}{6}$ .' },
  { skill: 'muqarana', text: '$\\frac{5}{12} > \\frac{1}{2}$ .', answer: false, why: '$\\frac{1}{2} = \\frac{6}{12}$ و $5 < 6$ ، فـ $\\frac{5}{12} < \\frac{1}{2}$ .' },
  { skill: 'jamTarh', text: '$\\frac{1}{2} + \\frac{1}{4} + \\frac{1}{6} + \\frac{1}{12} = 1$ .', answer: true, why: 'بالمقام $12$ : $\\frac{6}{12} + \\frac{3}{12} + \\frac{2}{12} + \\frac{1}{12} = \\frac{12}{12} = 1$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** « هل تعلم » de la fin du module 0 (l'ouverture historique de l'unité, réécrite ; rien au-delà de ce qu'il dit, aucun calcul). */
export const DID_YOU_KNOW = {
  source: src('opener', 22, 'تمهيد (نص تاريخي)'),
  text: 'كتب المصريون القدماء الكسور منذ آلاف السنين، وكان بسط الكسر عندهم هو العدد $1$ دائمًا، مثل $\\frac{1}{3}$ و $\\frac{1}{4}$ و $\\frac{1}{100}$ ، والاستثناء الوحيد هو $\\frac{2}{3}$ . وإذا أرادوا كسرًا آخر عبّروا عنه بمجموع كسور من هذا النوع. وكان للكسور عندهم رموز خاصّة تُنقش على الحجر وأوراق البردي.',
};

/**
 * La وضعية des modules 7 et 8 — le « تحدّي » de l'unité REDESSINÉ : la terre de la coopérative. Trois fractions de la TERRE (3/8, 1/4, 1/8), une fraction du VERGER (2/3),
 * puis les aires et le rendement du blé. Les clés (3/4, 1/4, 1/6, 9600 m², 1600 m², 0,48 < … < 0,49) vivent dans `FINAL` et dans le module 8 ; le module 7 n'en montre aucune.
 */
export const SITUATION = {
  source: src('challenge', 22, 'تحدّي'),
  title: 'أرض التعاونية',
  text: 'أرض تعاونية فلاحية مستطيلة طولها $120\\,\\text{m}$ وعرضها $80\\,\\text{m}$ . زُرع $\\frac{3}{8}$ منها قمحًا، و $\\frac{1}{4}$ بطاطا، و $\\frac{1}{8}$ زيتونًا، وما بقي جُعل بستانًا. غُرس $\\frac{2}{3}$ البستان أشجار تفّاح. أنتج حقل القمح $1750\\,\\text{kg}$ . ما مساحة التفّاح؟ وكم كيلوغرامًا يُنتَج في المتر المربّع الواحد من القمح؟',
  data: [
    { id: 'dims', text: 'طول الأرض 120 m وعرضها 80 m', useful: true },
    { id: 'wheat', text: 'القمح 3/8 من الأرض', useful: true },
    { id: 'potato', text: 'البطاطا 1/4 من الأرض', useful: true },
    { id: 'olive', text: 'الزيتون 1/8 من الأرض', useful: true },
    { id: 'apple', text: 'التفّاح 2/3 من البستان', useful: true },
    { id: 'yield', text: 'حقل القمح أنتج 1750 kg', useful: true },
    { id: 'name', text: 'اسم التعاونية «النخيل»', useful: false },
    { id: 'road', text: 'الأرض تقع قرب الطريق الوطني', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'نريد مساحة التفّاح ومردود القمح في المتر المربّع. الكسور $\\frac{3}{8}$ و $\\frac{1}{4}$ و $\\frac{1}{8}$ كسور من الأرض كلّها، أمّا $\\frac{2}{3}$ فهو كسر من البستان وحده لا من الأرض. والكتلة $1750\\,\\text{kg}$ هي إنتاج حقل القمح وحده.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'نجمع الأجزاء المزروعة، ثم نطرح مجموعها من الكلّ لنعرف جزء البستان، ثم نأخذ $\\frac{2}{3}$ من كسر البستان لنعرف كسر التفّاح من الأرض، ثم نحسب مساحة الأرض ومساحة التفّاح بضرب كسر في عدد. أخيرًا نقسم $1750$ على مساحة حقل القمح ونحصر الناتج.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'ننجز الحسابات على الكسور مراعين أنّ مقام أحدها مضاعف للآخرين، ونختزل النتائج، ونتحقّق، ثم نكتب الجواب بجملة واضحة.' },
  ],
};

/** Les corrections des questions du module 7 (reprises par la carte). La solution n'y figure pas. */
export const REMARKS = {
  wholeWrong: 'نعدّ $\\frac{2}{3}$ كسرًا من الأرض كلّها: $\\frac{3}{8} + \\frac{1}{4} + \\frac{1}{8} + \\frac{2}{3}$ .',
  wholeWhy: 'سيصير مجموع الأجزاء $\\frac{9}{12} + \\frac{8}{12} = \\frac{17}{12}$ من الأرض، وهو أكبر من الكلّ؛ وهذا مستحيل.',
  wholeRight: 'الثلثان كسر من البستان وحده: نحسب كسر البستان أوّلًا ثم نأخذ ثلثيه.',
  baseWhy: 'الكسر يعني دائمًا «كسر من شيء ما»، والشيء هنا يتغيّر: الأرض كلّها للقمح والبطاطا والزيتون، والبستان وحده للتفّاح.',
  orderWhy: 'كل حساب يحتاج نتيجة الذي قبله: لا نعرف البستان قبل جمع الأجزاء المزروعة، ولا نأخذ كسرًا من البستان قبل أن نعرفه.',
  yieldWhy: 'المردود في المتر المربّع يخصّ حقل القمح: نقسم كتلة القمح على مساحة حقل القمح، لا على مساحة الأرض كلّها.',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا الوضعية واختطّينا الاستراتيجية فقط.',
};

/**
 * Les cinq étapes du test (module 8), évaluées. Chaque distracteur est FAUX et porte l'erreur de l'unité qui le produit (vérifié dans content.test.js).
 *   E1 la somme (ACROSS : numérateurs et dénominateurs ajoutés ; NOSCALE : 1/4 lu 1/8 ; DENSUM : numérateurs réécrits mais dénominateurs ajoutés)
 *   E2 le verger et le plus grand (le reste pour le verger ; le plus grand dénominateur ; un terme oublié)
 *   E3 la fraction du verger DE LA TERRE (2/3 « de la terre » ; somme au lieu de produit ; produit croisé)
 *   E4 les aires (périmètre pour aire ; 2/3 de la terre ; le verger entier pour le tiers)
 *   E5 l'encadrement du rendement à 0,01 (arrondi ; quotient retourné ; aire de la pomme de terre).
 */
export const FINAL = [
  { id: 'E1', skill: 'jam', text: 'المرحلة 1 — الكسر الذي يمثّله ما زُرع قمحًا وبطاطا وزيتونًا من الأرض هو ...',
    options: ['$\\frac{3}{8} + \\frac{1}{4} + \\frac{1}{8} = \\frac{3}{8} + \\frac{2}{8} + \\frac{1}{8} = \\frac{3}{4}$', '$\\frac{3 + 1 + 1}{8 + 4 + 8} = \\frac{5}{20}$', '$\\frac{3}{8} + \\frac{1}{8} + \\frac{1}{8} = \\frac{5}{8}$', '$\\frac{3 + 2 + 1}{8 + 8 + 8} = \\frac{6}{24}$'], correct: 0,
    explain: 'الأجزاء من الأرض نفسها، فنجمعها بمقام مشترك هو $8$ : $\\frac{3}{8} + \\frac{2}{8} + \\frac{1}{8} = \\frac{6}{8} = \\frac{3}{4}$ . الخطأ الأوّل جمع البسوط والمقامات، والثاني كتب $\\frac{1}{4}$ على أنّه $\\frac{1}{8}$ ، والثالث كتب البسوط صحيحة لكنّه جمع المقامات.' },
  { id: 'E2', skill: 'rest', text: 'المرحلة 2 — الكسر الذي يمثّله البستان من الأرض، وأكبر الأجزاء المزروعة.',
    options: ['البستان $1 - \\frac{3}{4} = \\frac{1}{4}$ ؛ الأكبر القمح ($\\frac{3}{8} > \\frac{1}{4} > \\frac{1}{8}$)', 'البستان $\\frac{3}{4}$ ؛ الأكبر القمح', 'البستان $\\frac{1}{4}$ ؛ الأكبر الزيتون لأنّ مقامه $8$ هو الأكبر', 'البستان $1 - \\frac{3}{8} = \\frac{5}{8}$ ؛ الأكبر القمح'], correct: 0,
    explain: 'ما بقي هو الكلّ ناقص المزروع: $\\frac{4}{4} - \\frac{3}{4} = \\frac{1}{4}$ . وبالمقام $8$ : $\\frac{3}{8} > \\frac{2}{8} > \\frac{1}{8}$ فالقمح أكبر. الخطأ الأوّل أخذ المزروع على أنّه البستان، والثاني ظنّ أنّ المقام الأكبر يعطي الكسر الأكبر، والثالث نسي البطاطا والزيتون.' },
  { id: 'E3', skill: 'apple', text: 'المرحلة 3 — الكسر الذي يمثّله التفّاح من الأرض كلّها هو ...',
    options: ['$\\frac{2}{3} \\times \\frac{1}{4} = \\frac{2}{12} = \\frac{1}{6}$', '$\\frac{2}{3}$ من الأرض', '$\\frac{2}{3} + \\frac{1}{4} = \\frac{11}{12}$', '$\\frac{2 \\times 4}{3 \\times 1} = \\frac{8}{3}$'], correct: 0,
    explain: 'الثلثان هما من البستان $\\frac{1}{4}$ لا من الأرض: $\\frac{2}{3} \\times \\frac{1}{4} = \\frac{2}{12} = \\frac{1}{6}$ . الخطأ الأوّل جعلهما من الأرض كلّها، والثاني جمع بدل الضرب، والثالث ضرب بالتصالب.' },
  { id: 'E4', skill: 'area', text: 'المرحلة 4 — ما مساحة الأرض كلّها؟ وما مساحة التفّاح؟',
    options: ['$120 \\times 80 = 9600\\,\\text{m}^2$ ؛ التفّاح $\\frac{1}{6} \\times 9600 = 1600\\,\\text{m}^2$', '$2 \\times (120 + 80) = 400\\,\\text{m}^2$ ؛ التفّاح $\\frac{1}{6} \\times 400 = \\frac{200}{3}\\,\\text{m}^2$', '$9600\\,\\text{m}^2$ ؛ التفّاح $\\frac{2}{3} \\times 9600 = 6400\\,\\text{m}^2$', '$9600\\,\\text{m}^2$ ؛ التفّاح $\\frac{1}{4} \\times 9600 = 2400\\,\\text{m}^2$'], correct: 0,
    explain: 'مساحة المستطيل جداء بعديه: $9600$ ، وربعها بستان وسدسها تفّاح: $\\frac{1}{6} \\times 9600 = 1600$ . الخطأ الأوّل حسب المحيط ($400$) بدل المساحة، والثاني أخذ $\\frac{2}{3}$ من الأرض كلّها، والثالث عدّ البستان كلّه تفّاحًا.' },
  { id: 'E5', skill: 'yield', text: 'المرحلة 5 — احصر مردود القمح في المتر المربّع الواحد إلى $0{,}01$ (بالنقصان وبالزيادة).',
    options: ['$0{,}48 < \\frac{1750}{3600} < 0{,}49$ kg', '$0{,}49 < \\frac{1750}{3600} < 0{,}50$ kg', '$2{,}05 < \\frac{3600}{1750} < 2{,}06$ kg', '$0{,}72 < \\frac{1750}{2400} < 0{,}73$ kg'], correct: 0,
    explain: 'حقل القمح $\\frac{3}{8} \\times 9600 = 3600\\,\\text{m}^2$ ، و $\\frac{1750}{3600} = 0{,}4861\\ldots$ فهو بين $0{,}48$ و $0{,}49$ ( $3600 \\times 0{,}48 = 1728 \\le 1750 < 1764 = 3600 \\times 0{,}49$ ). الخطأ الأوّل جعل $0{,}49$ حدًّا أدنى، والثاني قلب القسمة، والثالث قسم على مساحة حقل البطاطا.' },
];
