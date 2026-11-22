import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — le « أستعدّ » du manuel (p. 163, items 1–8) appartient aux quatre leçons (extraction › destinations ›
 * prep) : la synthèse n'en reçoit aucun. Ses affirmations sont donc des AFFIRMATIONS DE LA PLATEFORME (« عبارة إضافية من
 * المنصّة »), dans la forme du manuel, sur ce que les six وضعيات d'entraînement, la وضعية du seau et le إختبار mobilisent : la كرة et la
 * جلّة (درس 1), l'aire de la sphère et le volume de la boule (درس 2), la section d'une sphère, celle d'un cône parallèle à sa
 * base et celle d'une أسطوانة parallèle à son axe (درس 3), l'effet de k sur les volumes (درس 4), puis le volume du cône et de
 * l'أسطوانة, Thalès (unité 9) et le litre (depuis le 2026-10-13 : onze affirmations, pour les six وضعيات d'entraînement). Six vraies,
 * cinq fausses ; jamais les nombres de la وضعية (40, 30, 7, 28, 35), du lab (le petit seau 3 / 4 / 6) ni du إختبار (le verre de frappé 8 / 12 / 12 / 9).
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'kura', text: 'إذا كانت النقطة $M$ تبعد عن النقطة $O$ بـ $7\\,\\mathrm{cm}$ فإنّ $M$ نقطة من الكرة التي مركزها $O$ ونصف قطرها $9\\,\\mathrm{cm}$ .', answer: false,
    why: 'نقط الكرة تحقّق $OM = R$ ؛ هنا $OM = 7 < 9$ : النقطة $M$ من الجلة التي مركزها $O$ ونصف قطرها $9\\,\\mathrm{cm}$ ، وليست من الكرة.', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'misaha', text: 'مساحة كرة نصف قطرها $5\\,\\mathrm{cm}$ هي $100\\pi\\,\\mathrm{cm}^2$ .', answer: true,
    why: '$\\mathcal{A} = 4\\pi R^2 = 4\\pi \\times 25 = 100\\pi\\,\\mathrm{cm}^2$ .', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'hajm', text: 'حجم جلة نصف قطرها $1{,}5\\,\\mathrm{cm}$ هو $4{,}5\\pi\\,\\mathrm{cm}^3$ .', answer: true,
    why: '$\\mathcal{V} = \\dfrac{4}{3}\\pi R^3 = \\dfrac{4}{3}\\pi \\times 3{,}375 = 4{,}5\\pi\\,\\mathrm{cm}^3$ .', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'maqtaKura', text: 'يقطع مستو كرة نصف قطرها $13\\,\\mathrm{cm}$ ويبعد عن مركزها بـ $5\\,\\mathrm{cm}$ : المقطع دائرة نصف قطرها $8\\,\\mathrm{cm}$ .', answer: false,
    why: 'حسب خاصية فيثاغورس نصف قطر المقطع $\\sqrt{13^2 - 5^2} = \\sqrt{144} = 12\\,\\mathrm{cm}$ ، لا $13 - 5 = 8$ .', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'maqtaMukhrut', text: 'مقطع مخروط دوران بمستو مواز لقاعدته دائرة، وهي تصغير لدائرة القاعدة.', answer: true,
    why: 'المستوي الموازي للقاعدة يقطع المخروط وفق دائرة مركزها على المحور؛ المخروط الصغير الذي فوقها تصغير للمخروط، ودائرته تصغير للقاعدة.', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'takbir', text: 'إذا ضُربت كل أبعاد مجسم في $3$ فإنّ حجمه يُضرب في $9$ .', answer: false,
    why: 'في تكبير نسبته $k$ تُضرب الأطوال في $k$ والمساحات في $k^2$ والحجوم في $k^3$ : الحجم يُضرب في $3^3 = 27$ .', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'mukhrut', text: 'حجم مخروط دوران نصف قطر قاعدته $3\\,\\mathrm{cm}$ وارتفاعه $10\\,\\mathrm{cm}$ هو $30\\pi\\,\\mathrm{cm}^3$ .', answer: true,
    why: '$\\mathcal{V} = \\dfrac{1}{3}\\pi r^2 h = \\dfrac{1}{3}\\pi \\times 9 \\times 10 = 30\\pi\\,\\mathrm{cm}^3$ .', source: addition('prerequisite_diagnostic') },
  { n: 8, skill: 'talis', text: 'في المثلث $SAB$ ، $M$ من $[SA]$ و $N$ من $[SB]$ و $(MN) \\parallel (AB)$ . إذا كان $SM = 2$ و $SA = 5$ و $AB = 10$ فإنّ $MN = 4$ .', answer: true,
    why: 'حسب خاصية طالس $\\dfrac{SM}{SA} = \\dfrac{MN}{AB}$ أي $\\dfrac{2}{5} = \\dfrac{MN}{10}$ ، ومنه $MN = 4$ .', source: addition('prerequisite_diagnostic') },
  { n: 9, skill: 'litr', text: '$2500\\,\\mathrm{cm}^3 = 25\\,\\mathrm{L}$', answer: false,
    why: '$1\\,\\mathrm{L} = 1\\,\\mathrm{dm}^3 = 1000\\,\\mathrm{cm}^3$ ، ومنه $2500\\,\\mathrm{cm}^3 = 2{,}5\\,\\mathrm{L}$ .', source: addition('prerequisite_diagnostic') },
  { n: 10, skill: 'maqtaUstuwana', text: 'يقطع مستوٍ موازٍ لمحور أسطوانة دوران نصف قطر قاعدتها $5\\,\\mathrm{cm}$ ويبعد عنه $3\\,\\mathrm{cm}$ : المقطع مستطيل عرضه $8\\,\\mathrm{cm}$ .', answer: true,
    why: 'المقطع مستطيل، ونصف عرضه $\\sqrt{5^2 - 3^2} = \\sqrt{16} = 4\\,\\mathrm{cm}$ حسب خاصية فيثاغورس في القاعدة، فعرضه $2 \\times 4 = 8\\,\\mathrm{cm}$ .', source: addition('prerequisite_diagnostic') },
  { n: 11, skill: 'hajmUstuwana', text: 'حجم أسطوانة دوران نصف قطر قاعدتها $2\\,\\mathrm{cm}$ وارتفاعها $5\\,\\mathrm{cm}$ هو $10\\pi\\,\\mathrm{cm}^3$ .', answer: false,
    why: '$\\mathcal{V} = \\pi r^2 h = \\pi \\times 4 \\times 5 = 20\\pi\\,\\mathrm{cm}^3$ ؛ $10\\pi$ خطأ بأخذ $r$ بدل $r^2$ .', source: addition('prerequisite_diagnostic') },
];

/**
 * LA وضعية — le تحدّ de la page d'ouverture (p. 163), au mot près (extraction › challenge ; destinations : wadiya-idmajiya-fada,
 * module 7, doublon déclaré sur la page d'unité). Le scan n'a PAS de « أدمج تعلّماتي » (scope.missing_pages) : la وضعية de
 * synthèse EST le تحدّ (extraction › discrepancies › objectives). Son analyse en trois phases (قراءة · تحليل · تنفيذ, la démarche
 * des synthèses du manuel) est écrite par la plateforme : `analysisSource` = addition('synthesis_generation').
 *
 * LECTURE DU SCHÉMA DÉCIDÉE (extraction › discrepancies › challenge, 300 dpi) : les deux cotes verticales sont EMPILÉES — 7 cm
 * du bord à l'eau, puis 28 cm de l'eau au fond ⇒ H = 35 cm, eau sur 28 cm, ρ = 19 (Thalès), SO = 105, k = 15/19,
 * V = 24388π/3 ≈ 25 539,1 cm³ ≈ 25,54 L. La lecture rejetée (H = 28, eau sur 21 cm → 96075π/16 ≈ 18 864,3 cm³) reste dans
 * l'extraction (`answer.alternative`) et n'est jamais montrée comme réponse. Le texte cite l'énoncé ; la cote lue sur le
 * dessin est dite en une ligne (`reading`), comme une donnée.
 * `questions` : ce que la مذكرة du professeur lit (buildLessonMemo › SITUATION).
 */
export const SITUATION = {
  source: src('challenge', 163, 'تحدّ'),
  title: 'وضعية: دلو الماء',
  text: 'يُمثّل الشكل المقابل دلوًا فيه ماء، و هو ناتج من مخروط مبتور. إذا علمت أنّ مستوى الماء يبعد عن الحافة العُلوية للدلو بـ $7\\,\\mathrm{cm}$ ، فاحسب حجم الماء المحتوى في هذا الدلو.',
  reading: 'على الشكل: قطر الحافة العلوية $40\\,\\mathrm{cm}$ وقطر القاع $30\\,\\mathrm{cm}$ ، وعلى اليسار سهمان متتاليان: $7\\,\\mathrm{cm}$ من الحافة إلى سطح الماء ثم $28\\,\\mathrm{cm}$ من سطح الماء إلى القاع.',
  questions: [
    'ما شكل الدلو؟ ما أبعاده؟ ما ارتفاع الماء فيه؟',
    'ما شكل الماء في الدلو؟ كيف نحسب حجم مخروط مبتور بأدوات الوحدة؟',
    'أين رأس المخروط الذي نتج منه الدلو؟ ما نصف قطر سطح الماء؟',
    'ما نسبة التصغير بين المخروطين؟ ما حجم الماء بالسنتيمتر المكعب ثم باللتر؟',
  ],
  closing: 'الماء مخروط مبتور: نكمله إلى مخروط رأسه S على بعد $105\\,\\mathrm{cm}$ تحت القاع، فنصف قطر سطح الماء $19\\,\\mathrm{cm}$ ، والمخروط الصغير تصغير للكبير نسبته $\\dfrac{15}{19}$ ، وحجم الماء $V = \\dfrac{24388}{3}\\pi \\approx 25\\,539{,}1\\,\\mathrm{cm}^3$ أي حوالي $25{,}54\\,\\mathrm{L}$ .',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', items: ['ما شكل الدلو وما أبعاده؟', 'أين سطح الماء؟ ما المطلوب؟'] },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', items: ['ما شكل الماء في الدلو؟', 'نكمل المخروط: أين رأسه؟ ما نصف قطر سطح الماء؟', 'ما العلاقة بين المخروطين الكبير والصغير؟'] },
    { label: 'تنفيذ استراتيجية الحل المختارة', items: ['نحسب حجم المخروطين ثم الفرق، وندوّر النتيجة ونحوّلها إلى اللتر.'] },
  ],
  analysisSource: addition('synthesis_generation'),
  numbers: { r: 15, R: 20, H: 35, depth: 28 },
};

/** Le texte d'une analyse (questions de la plateforme) en une ligne. */
export const analysisText = (a) => a.items.join(' — ');

/**
 * Les props du laboratoire du module 7 — `bucket-fill` (écrit pour cette leçon : logic/bucketFill.js, space/BucketFill.jsx),
 * écrites ici une fois : le module les étale, le test de rendu (lab.render.test.jsx) monte le workspace avec ces mêmes objets.
 * Ce sont les nombres de levels.js (une seule source).
 *   مبتدئ  un petit seau de plage plein (plateforme) : r = 3, R = 4, H = 6 ⇒ SO = 18, k = 3/4, V = 74π ≈ 232,48 cm³ ;
 *   متقدم  le تحدّ : r = 15, R = 20, H = 35, eau sur 28 cm ⇒ SO = 105, ρ = 19, k = 15/19, V = 24388π/3 ≈ 25,54 L.
 */
export const LAB = {
  beginner: { numbers: { r: 3, R: 4, H: 6, depth: 6 }, theme: 'beach-bucket' },
  advanced: { numbers: { r: 15, R: 20, H: 35, depth: 28 }, theme: 'beach-bucket' },
};
/** Ce que le lab fait trouver (vérifié par lab.render.test.jsx avec space.js). */
export const LAB_EXPECT = {
  beginner: { apex: 18, k: [3, 4], volumeK: [74, 1], approx: '232,48' },
  advanced: { apex: 105, k: [15, 19], volumeK: [24388, 3], approx: '25539,05', litres: '25,54' },
};

/**
 * Les phrases de la correction du module 7 (et 9), importées aussi par knowledge.jsx et la carte (knowledgeGraph.js) : une aide
 * de la carte cite la leçon mot pour mot. Toute égalité dans `$…$`. Les nombres viennent de space.js (lab.render.test.jsx les
 * recalcule).
 */
export const REMARKS = {
  // قراءة
  qiraa: 'الدلو مخروط مبتور: نصف قطر حافته العلوية $R = 20\\,\\mathrm{cm}$ ونصف قطر قاعه $r = 15\\,\\mathrm{cm}$ . السهمان على الشكل متتاليان: ارتفاع الدلو $7 + 28 = 35\\,\\mathrm{cm}$ ، وعمق الماء $28\\,\\mathrm{cm}$ .',
  mutlub: 'المطلوب حجم الماء لا حجم الدلو: الماء يملأ الدلو من القاع إلى سطح الماء فقط.',
  // تحليل
  shakl: 'سطح الماء مستو مواز للقاع، ومقطع المخروط بمستو مواز لقاعدته دائرة: الماء مخروط مبتور آخر قاعدتاه قاع الدلو وسطح الماء، وارتفاعه $28\\,\\mathrm{cm}$ .',
  takmil: 'نمدّد جداري الدلو إلى الأسفل فيلتقيان على المحور في رأس المخروط S. في المقطع المحوري $(OA) \\parallel (O_1B)$ ، فحسب خاصية طالس $\\dfrac{SO}{SO_1} = \\dfrac{OA}{O_1B}$ أي $\\dfrac{SO}{SO + 35} = \\dfrac{15}{20}$ ، ومنه $20 \\times SO = 15 \\times SO + 525$ و $SO = 105\\,\\mathrm{cm}$ .',
  talisRho: 'W مركز سطح الماء و $SW = 105 + 28 = 133\\,\\mathrm{cm}$ . في المقطع المحوري $(OA) \\parallel (WM)$ : $\\dfrac{WM}{OA} = \\dfrac{SW}{SO}$ ، ومنه نصف قطر سطح الماء $WM = 15 \\times \\dfrac{133}{105} = 19\\,\\mathrm{cm}$ .',
  avgWrong: 'نصف قطر سطح الماء هو متوسط نصفي قطري القاعدتين: $\\dfrac{15 + 20}{2} = 17{,}5\\,\\mathrm{cm}$ .',
  avgWhy: 'المتوسط لا يصحّ إلا إذا كان سطح الماء في منتصف ارتفاع الدلو؛ هنا الماء على عمق $28\\,\\mathrm{cm}$ من $35\\,\\mathrm{cm}$ ، أقرب إلى الحافة.',
  avgRight: 'جدار الدلو خطّ مستقيم: نصف القطر يزيد بـ $5\\,\\mathrm{cm}$ على $35\\,\\mathrm{cm}$ ، فعلى ارتفاع $28\\,\\mathrm{cm}$ يزيد بـ $\\dfrac{5 \\times 28}{35} = 4\\,\\mathrm{cm}$ : نصف قطر سطح الماء $15 + 4 = 19\\,\\mathrm{cm}$ .',
  k: 'المخروط الصغير (من S إلى القاع) تصغير للمخروط الكبير (من S إلى سطح الماء) نسبته $k = \\dfrac{SO}{SW} = \\dfrac{105}{133} = \\dfrac{15}{19}$ ، وهي أيضا نسبة نصفي القطرين $\\dfrac{OA}{WM} = \\dfrac{15}{19}$ .',
  hajm: 'حجم الماء = حجم المخروط الكبير − حجم المخروط الصغير: $V_1 = \\dfrac{1}{3}\\pi \\times 19^2 \\times 133 = \\dfrac{48013}{3}\\pi$ و $V_2 = \\dfrac{1}{3}\\pi \\times 15^2 \\times 105 = 7875\\pi$ ، ومنه $V = V_1 - V_2 = \\dfrac{24388}{3}\\pi\\,\\mathrm{cm}^3$ .',
  k3: 'المخروط الصغير تصغير للكبير نسبته k، والحجوم تُضرب في $k^3$ : $V_2 = k^3 V_1$ ، فحجم الماء $V = V_1 - k^3 V_1 = V_1\\left(1 - k^3\\right)$ .',
  kWrong: 'حجم المخروط الصغير هو $k \\times V_1$ ، فحجم الماء $V_1(1 - k)$ .',
  kWhy: 'في تصغير نسبته k تُضرب الأطوال في k والمساحات في $k^2$ والحجوم في $k^3$ ؛ والحساب بـ k يعطي أقل من نصف الحجم الحقيقي.',
  kRight: 'حجم المخروط الصغير $V_2 = \\left(\\dfrac{15}{19}\\right)^3 \\times \\dfrac{48013}{3}\\pi = 7875\\pi$ ، وهو نفسه $\\dfrac{1}{3}\\pi \\times 15^2 \\times 105$ .',
  // تنفيذ
  tadwir: '$\\dfrac{24388}{3}\\pi \\approx 25\\,539{,}1\\,\\mathrm{cm}^3$ ، و $1\\,\\mathrm{L} = 1000\\,\\mathrm{cm}^3$ : حجم الماء حوالي $25{,}54\\,\\mathrm{L}$ (ندوّر في آخر الحساب).',
  tahaqquq: 'الماء يملأ $\\dfrac{4}{5}$ ارتفاع الدلو، لكنّ حجمه أقل من $\\dfrac{4}{5}$ حجم الدلو (حوالي $27{,}12\\,\\mathrm{L}$ ): الجزء الذي بقي فارغا في الأعلى هو الأعرض.',
  formulaOut: 'صيغة حجم المخروط المبتور $\\dfrac{\\pi h}{3}\\left(R^2 + Rr + r^2\\right)$ تعطي نفس النتيجة $\\dfrac{24388}{3}\\pi$ ، لكنها خارج البرنامج: نحسب بالفرق بين حجمي مخروطين.',
  tajnid: 'نكمل المخروط بخاصية طالس في المقطع المحوري، ثم نحسب حجم المخروط المبتور كفرق حجمي مخروطين، والصغير تصغير للكبير حجمه $k^3$ مرة حجمه.',
};

/** Les titres des leçons de l'unité (catalogue), et la leçon de Thalès (unité 9) pour le renvoi du module 7. */
export const LESSON_TITLES = {
  'kura-julla': 'الدرس 1 — الكرة والجلة',
  'misaha-hajm-kura': 'الدرس 2 — مساحة الكرة وحجم الجلة',
  'maqati-mustawiya': 'الدرس 3 — المقاطع المستوية للمجسمات المألوفة',
  'takbir-tasghir': 'الدرس 4 — التكبير والتصغير',
  'talis-hisab-atwal': 'الوحدة 9 — خاصية طالس',
};

/**
 * « إختبار أولي » (module 8) — la وضعية TRANSPOSÉE une seconde fois (`synthesis_generation`) : un verre de frappé en tronc de
 * cône (Ø 8 cm au fond, Ø 12 cm à l'ouverture, 12 cm de haut) rempli sur 9 cm. SO = 24 (Thalès : SO/(SO + 12) = 4/6),
 * ρ = 5,5, k = 24/33 = 8/11, V₁ = 1331π/4, V₂ = 128π, V = 819π/4 ≈ 643,24 cm³ ≈ 0,64 L. Aucune réponse n'apparaît ailleurs.
 */
export const TEST = {
  source: addition('synthesis_generation'),
  title: 'وضعية أخرى: كأس فرابيه في مقهى بوهران',
  text: 'في مقهى بوهران يحرص النادل على الأمانة فيقدّم الفرابيه بالمقدار المعلن في كأس على شكل مخروط مبتور: قطر قاعه $8\\,\\mathrm{cm}$ ، وقطر فتحته $12\\,\\mathrm{cm}$ ، وارتفاعه $12\\,\\mathrm{cm}$ . صبّ النادل المشروب حتى عمق $9\\,\\mathrm{cm}$ من القاع. نكمل الكأس إلى مخروط رأسه S تحت القاع؛ O مركز القاع و W مركز سطح المشروب.',
  numbers: { r: 4, R: 6, H: 12, depth: 9 },
};
