/**
 * Le contenu du MANUEL pour le درس « الكرة والجلة (مفهوم والتمثيل الهندسي) » (unité 14, entrée de l'unité) — données pures
 * (aucun JSX), au mot près ; chaque bloc cite son élément de docs/sources/4am/unit14/extraction.json :
 * أستعدّ 1 et 2 (p. 163, module 0), نشاط 1 (p. 164, module 1), معارف 1 (p. 166, module 2), طرائق « تمثيل كرة » et « تمثيل نقطة
 * من كرة أو من جلّة » et دوري الآن (p. 167, module 3). Ce que la plateforme ajoute est déclaré (`addition(…)`) :
 * les affirmations de « أستعدّ » sur les prérequis du propriétaire, l'accroche et les réponses du نشاط 1 (le manuel les demande
 * sans les écrire), la méthode « حساب OM في معلم للفضاء » (le point P4 « في المعلم الفضائي » : Pythagore deux fois —
 * `knowledge_formalization`), les exercices de أوظّف (le scan n'a aucune page d'exercices) et les épreuves du إختبار.
 * Écarts honorés (extraction › discrepancies) : know-1 — figures en « œuf » REDESSINÉES (content/figures.js, une ligne sous
 * chacune) ; « الدوائر الصُغرى » (le texte) et non « دوائر صغيرة » (l'étiquette de la figure) ; prep — « (9π)cm² » s'écrit
 * $9\pi\,\mathrm{cm}^2$ (la parenthèse du manuel n'est pas un produit caché).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
export const FORMALIZATION_SOURCE = addition('knowledge_formalization');

/** نشاط 1 (p. 164) — « الكُرة و الجُلّة ». */
export const ACTIVITY = {
  source: src('act-1', 164, 'أنشطة', 1),
  title: 'الكُرة و الجُلّة',
  situation: 'في حصة التربية البدنية: كرة اليد خفيفة ترتدّ، والكرية الحديدية ثقيلة لا ترتدّ. كلتاهما «مستديرة» — فما الفرق بينهما رياضيا؟',
  part1: '1) ميّز بين نقاط دائرة و نقاط قرص لهما نفس المركز و نصف قطر كل منهما $4\\,\\mathrm{cm}$ .',
  part2: '2) الكرة المستعملة في رياضة كرة اليد هو مجسّم كُروي أجوف، إنّه نموذج لكائن رياضياتي يُسمّى الكُرة. بينما الكُرية المستعملة في رياضة الكرة الحديدية هي مُجسّم كروي مملوء، إنّه نموذج لكائن رياضياتي يُسمّى الجُلّة.',
  part3: '3) اذكر مُجسمات أخرى متواجدة في محيطك تُعتبر نموذجًا لكرة أو جُلّة.',
  part4: '4) r عدد موجب تماما. انقل ثم اتمم ما يلي: مجموعة النقط من الفضاء التي تبعد بمسافة ثابتة r عن نقطة ثابتة O هي..... ذات المركز O و نصف القطر r. مجموعة النقط من الفضاء التي تبعد بمسافة أصغر من أو تُساوي r عن نقطة ثابتة O هي..... ذات المركز O و نصف القطر r.',
  questions: [
    'ميّز بين نقاط دائرة ونقاط قرص لهما نفس المركز ونصف القطر $4\\,\\mathrm{cm}$ .',
    'كرة اليد مجسّم أجوف والكرية الحديدية مجسّم مملوء: أيّهما نموذج للكرة وأيّهما نموذج للجلة؟',
    'اذكر مجسمات أخرى من محيطك تعتبر نموذجا لكرة أو لجلة.',
    'أتمم: مجموعة النقط من الفضاء التي تبعد بمسافة ثابتة r عن O هي …، والتي تبعد بمسافة أصغر من أو تساوي r هي ….',
  ],
  closing: 'مجموعة النقط من الفضاء التي تبعد بمسافة ثابتة r عن نقطة ثابتة O هي الكُرة ذات المركز O و نصف القطر r. مجموعة النقط من الفضاء التي تبعد بمسافة أصغر من أو تُساوي r عن نقطة ثابتة O هي الجُلّة ذات المركز O و نصف القطر r.',
};
/** Les réponses du نشاط 1 (extraction › answer, calculées) — le manuel les demande sans les écrire. */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  q1: 'نقاط الدائرة M تحقّق $OM = 4\\,\\mathrm{cm}$ (على الحافة فقط)؛ نقاط القرص تحقّق $OM \\le 4\\,\\mathrm{cm}$ (الحافة والداخل).',
  q3: 'أمثلة: كرة القدم وفقاعة الصابون (نموذج لكرة)؛ حبّة البرتقال والبلية الزجاجية وحبّة اللؤلؤ (نموذج لجلة).',
  lab: 'في المسبار: $OM^2$ يُقارن بـ $R^2$ — النقطة على الكرة إذا كان $OM = R$ ، وفي الجلة إذا كان $OM \\le R$ .',
};

/** معارف 1 (p. 166) — « الكُرة و الجلّة ». */
export const KNOW1 = {
  source: src('know-1', 166, 'معارف', 1),
  title: 'الكُرة و الجلّة',
  intro: 'تعاريف: O نقطة من الفضاء و R عدد موجب تماما.',
  defSphere: 'الكرة التي مركزها O و نصف قطرها R هي مجموعة النقط M من الفضاء حيث $OM = R$ .',
  defBall: 'الجلة التي مركزها O و نصف قطرها R هي مجموعة النقط M من الفضاء حيث $OM \\le R$ .',
  diameters: 'على الشكل المقابل، القِطع $[NS]$ ، $[N\'S\']$ و $[N_1S_1]$ لها نفس المنتصف O. إنها أقطار للكرة، طول كل منها هو $2R$ .',
  example: 'مثال: $(\\delta)$ هي الكرة التي مركزها O و نصف قطرها R، $(\\beta)$ هي الجلة التي مركزها O و نصف قطرها R. لدينا M نقطة من الكرة $(\\delta)$ لأنّ $OM = R$ . P ليست نقطة من الكرة $(\\delta)$ لأنّ $OP < R$ . نقول إنّ P تنتمي إلى الجلة $(\\beta)$ . Q ليست نقطة من الكرة $(\\delta)$ و من الجلة $(\\beta)$ لأنّ $OQ > R$ .',
  noteRotation: 'عند تدوير دائرة مركزها O و نصف قطرها R حول أحد أقطارها فإنّه يُولد من هذا الدوران كرة مركزها O و نصف قطرها R.',
  noteGreat: 'تُسمى الدوائر التي مركزها O و نصف قطرها مُساوٍ لنصف قطر الكرة، بالدوائر الكُبرى في الكرة.',
  noteSmall: 'تُسمّى الدوائر التي مركزها يختلف عن O و نصف قطرها أصغر من نصف قطر الكرة، بالدوائر الصُغرى في الكرة.',
};

/** طرائق (p. 167) — « تمثيل كرة ». */
export const METHOD_DRAW = {
  source: src('method-sphere-draw', 167, 'طرائق', 1),
  title: 'تمثيل كرة',
  exercise: 'تمرين: مثّل كرة مركزها O و نصف قطرها $2{,}5\\,\\mathrm{cm}$ .',
  solution: [
    'حل: يُمكن تمثيل الكرة في المستوي كما يلي:',
    'أ) نرسم دائرة كُبرى مركزها O و نصف قطرها $2{,}5\\,\\mathrm{cm}$ (الشكل 1).',
    'ب) نرسم باليد الحرّة دائرة كُبرى أخرى بيضوية الشكل داخل النطاق المُلوّن (الشكل 2). الجزء الأمامي للشكل البيضوي يكون بخط مستمر و الجزء الخلفي يكون بخط متقطّع.',
    'جـ) الشكل 3 هو تمثيل للكرة.',
  ],
};
/** طرائق (p. 167) — « تمثيل نقطة من كرة أو من جلّة ». */
export const METHOD_POINT = {
  source: src('method-point', 167, 'طرائق', 2),
  title: 'تمثيل نقطة من كرة أو من جلّة',
  exercise: 'تمرين: لاحظ الشكل المقابل. A نقطة من الكرة التي مركزها O و نصف قطرها R و B نقطة من الجلة المعيّنة بهذه الكرة. انقل الشكل ثم مثّل النقطتين A و B.',
  solution: [
    'حل: 1) تمثيل A : نرسم $[OA]$ ثم دائرة كبرى ذات نصف القطر $[OA]$ .',
    '2) تمثيل B : نرسم نصف القطر $[OM]$ للكرة حيث B تقع عليه ثم نرسم إحدى الدوائر الكبرى ذات نصف القطر $[OM]$ .',
  ],
  rule: 'طريقة: لتمثيل نقطة على كرة أو داخلها نستعمل إحدى الدوائر الكبرى لهذه الكرة.',
};
/** دوري الآن (p. 167). */
export const NOW_167 = {
  source: src('now-167', 167, 'دوري الآن', 1),
  text: 'يقطع مستقيم (d) كرة مركزها O و نصف قطرها $2\\,\\mathrm{cm}$ في نقطتين A و B حيث $AB = 2\\,\\mathrm{cm}$ . 1) أنجز شكلا مناسبا. 2) برهن أنّ $\\widehat{AOB} = 60^\\circ$ . 3) I هو منتصف $[AB]$ . احسب OI.',
  figureNote: 'الكتاب يطلب إنجاز الشكل: هذا شكل من المنصّة، المستوي $(OAB)$ يقطع الكرة وفق دائرة كبرى.',
  answer2: 'A و B من الكرة: $OA = OB = 2\\,\\mathrm{cm}$ ، و $AB = 2\\,\\mathrm{cm}$ : المثلث AOB متقايس الأضلاع، إذن $\\widehat{AOB} = 60^\\circ$ .',
  answer3: 'المثلث AOB متساوي الساقين و I منتصف $[AB]$ ، إذن $(OI) \\perp (AB)$ و $AI = 1\\,\\mathrm{cm}$ ؛ حسب خاصية فيثاغورس في المثلث AIO القائم في I: $OI^2 = 2^2 - 1^2 = 3$ ، أي $OI = \\sqrt{3} \\approx 1{,}73\\,\\mathrm{cm}$ .',
};

/**
 * Une méthode de la PLATEFORME (le point P4 « في المعلم الفضائي » ; le scan n'a pas de page pour lui) : la distance OM dans un
 * repère orthonormé de l'espace, par la خاصية فيثاغورس appliquée deux fois — ce que le lab du module 1 fait lire en direct.
 */
export const METHOD_DISTANCE = {
  source: FORMALIZATION_SOURCE,
  title: 'موقع نقطة بالنسبة إلى كرة في معلم للفضاء',
  lines: [
    'في معلم متعامد ومتجانس للفضاء مبدؤه O، نعتبر النقطة $M(x\\,;\\,y\\,;\\,z)$ ومسقطها $M_0(x\\,;\\,y\\,;\\,0)$ على المستوي الأفقي.',
    'حسب خاصية فيثاغورس مرتين: $OM_0^2 = x^2 + y^2$ ، ثم $OM^2 = OM_0^2 + z^2 = x^2 + y^2 + z^2$ .',
    'نقارن $OM^2$ بـ $R^2$ : إذا كان $OM^2 = R^2$ فـ M على الكرة، وإذا كان $OM^2 < R^2$ فـ M داخل الجلة وليست على الكرة، وإذا كان $OM^2 > R^2$ فـ M خارج الجلة.',
  ],
  example: 'مثال: الكرة التي مركزها O ونصف قطرها 3، والنقطة $K(2\\,;\\,1\\,;\\,2)$ : $OK^2 = 4 + 1 + 4 = 9 = 3^2$ ، إذن K على الكرة.',
};

/** Les erreurs que la leçon corrige (le لماذا vient des معارف) — citées par la carte (knowledgeGraph.js). */
export const MISTAKES = {
  julla: {
    wrong: 'النقطة P التي تحقّق $OP < R$ تنتمي إلى الكرة لأنها «داخل الكرة».',
    right: 'P تنتمي إلى الجلة $(\\beta)$ ، وليست من الكرة $(\\delta)$ : الكرة سطح أجوف، نقطها فقط تحقّق $OM = R$ .',
  },
  great: {
    wrong: 'كل دائرة مرسومة على الكرة هي دائرة كبرى.',
    right: 'الدائرة الكبرى مركزها O ونصف قطرها R؛ دائرة مركزها O₁ يختلف عن O دائرة صغرى، نصف قطرها أصغر من R.',
  },
};

/**
 * « أستعدّ » — les items 1 et 2 du manuel (p. 163 ; 3–8 sont aux autres دروس de l'unité) et quatre affirmations de la
 * plateforme sur les prérequis du propriétaire : le diamètre d'un cercle, cercle ou disque, la perspective (المنظور
 * متساوي القياس), Pythagore (la distance OM dans l'espace en a besoin). Une affirmation par compétence. Aucune n'utilise
 * 4 cm (le نشاط 1) ni les nœuds du lab.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: '1', skill: 'muhit', text: 'محيط دائرة نصف قطرها $3\\,\\mathrm{cm}$ هو $6\\,\\mathrm{cm}$ .', answer: false, why: 'المحيط $= 2\\pi r = 2 \\times \\pi \\times 3 = 6\\pi\\,\\mathrm{cm} \\approx 18{,}85\\,\\mathrm{cm}$ ، لا $6\\,\\mathrm{cm}$ (نُسي العدد $\\pi$).', source: src('prep', 163, 'أستعدّ', 1) },
  { n: '2', skill: 'misaha', text: 'مساحة قرص نصف قطره $3\\,\\mathrm{cm}$ هو $9\\pi\\,\\mathrm{cm}^2$ .', answer: true, why: 'المساحة $= \\pi r^2 = \\pi \\times 3^2 = 9\\pi\\,\\mathrm{cm}^2$ .', source: src('prep', 163, 'أستعدّ', 2) },
  { n: 'p1', skill: 'qutr', text: 'قطر دائرة نصف قطرها $5\\,\\mathrm{cm}$ طوله $10\\,\\mathrm{cm}$ .', answer: true, why: 'القطر قطعة منتصفها المركز وطرفاها على الدائرة: طوله ضعف نصف القطر، $2 \\times 5 = 10$ .', source: PREP_ADD },
  { n: 'p2', skill: 'qurs', text: 'النقطة K تبعد بـ $2\\,\\mathrm{cm}$ عن مركز دائرة نصف قطرها $6\\,\\mathrm{cm}$ ، إذن K نقطة من هذه الدائرة.', answer: false, why: 'نقط الدائرة تبعد عن المركز بـ $6\\,\\mathrm{cm}$ تماما؛ K تبعد بـ $2\\,\\mathrm{cm} < 6\\,\\mathrm{cm}$ : إنها من القرص، داخل الدائرة.', source: PREP_ADD },
  { n: 'p3', skill: 'manzur', text: 'في تمثيل مكعب بالمنظور متساوي القياس، نرسم الأحرف غير المرئية بخط متقطّع.', answer: true, why: 'هذه قاعدة التمثيل بالمنظور: ما يُرى بخط مستمر، وما يختفي خلف المجسم بخط متقطّع.', source: PREP_ADD },
  { n: 'p4', skill: 'fithaghuras', text: 'ABC مثلث قائم في A حيث $AB = 3$ و $AC = 4$ ، إذن $BC = 7$ .', answer: false, why: 'حسب خاصية فيثاغورس: $BC^2 = 3^2 + 4^2 = 25$ ، إذن $BC = 5$ لا $7$ (لا نجمع الطولين).', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = la lampe-globe (plateforme) ; متقدم = le نشاط 1 et l'exemple de معارف 1. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { R: 3, bound: 4, probes: [[1, 2, 2], [1, 1, 1], [2, 2, 2]] } },
  advanced: { source: ACTIVITY.source, numbers: { R: 4, bound: 5, tasks: ['surface', 'inside', 'outside', 'diameter', 'great-circle', 'small-circle'] } },
};
