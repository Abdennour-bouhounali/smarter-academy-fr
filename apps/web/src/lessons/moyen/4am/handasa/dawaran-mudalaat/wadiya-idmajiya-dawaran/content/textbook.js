import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — le « أستعدّ » du manuel (p. 151, items 1–5) appartient aux quatre leçons (extraction ›
 * destinations › prep) : la synthèse n'en reçoit aucun. Ses affirmations sont donc des AFFIRMATIONS DE LA PLATEFORME
 * (« عبارة إضافية من المنصّة »), dans la forme du manuel, sur ce que la وضعية mobilise :
 * l'image d'un point par un دوران (درس 1), le دوران garde les longueurs (درس 2), l'angle inscrit moitié de l'angle au centre
 * (درس 3), l'angle au centre 360°/n et la définition d'un polygone régulier (درس 4), puis des outils des années précédentes et
 * de l'unité 10 — les angles d'un triangle isocèle, la hauteur d'un triangle isocèle, le sinus, le périmètre du cercle. Cinq
 * vraies, quatre fausses ; jamais les nombres de la وضعية (3 m, 6, 60°), du lab ni du
 * إختبار (5 m, 8, 45°).
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'sura', text: 'إذا كانت $K\'$ صورة $K$ بالدوران الذي مركزه $O$ وزاويته $50^\\circ$ فإنّ $OK\' = OK$ و $\\widehat{KOK\'} = 50^\\circ$ .', answer: true,
    why: 'صورة نقطة K بالدوران الذي مركزه O وزاويته α هي النقطة K′ حيث $OK\' = OK$ و $\\widehat{KOK\'} = \\alpha$ (في الاتجاه المحدّد).', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'khawas', text: 'صورة قطعة طولها $7\\,\\mathrm{cm}$ بدوران زاويته $100^\\circ$ قطعة أطول منها.', answer: false,
    why: 'الدوران يحافظ على الأطوال مهما كانت زاويته: صورة القطعة طولها $7\\,\\mathrm{cm}$ أيضا.', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'muhitiya', text: 'زاوية محيطية قيسها $35^\\circ$ تحصر نفس القوس مع زاوية مركزية قيسها $17{,}5^\\circ$ .', answer: false,
    why: 'الزاوية المحيطية نصف الزاوية المركزية التي تحصر معها نفس القوس، فالمركزية ضعفها: $2 \\times 35^\\circ = 70^\\circ$ .', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'markaziya', text: 'في مضلع منتظم له 9 أضلاع، قيس الزاوية المركزية التي تحصر ضلعا هو $40^\\circ$ .', answer: true,
    why: 'الزوايا المركزية التسع متقايسة وتملأ دورة كاملة: $\\dfrac{360^\\circ}{9} = 40^\\circ$ .', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'muntazam', text: 'كل معيّن هو مضلع منتظم لأنّ أضلاعه الأربعة متقايسة.', answer: false,
    why: 'المضلع المنتظم أضلاعه متقايسة وزواياه متقايسة؛ المعيّن الذي ليس مربعا زواياه غير متقايسة، فهو ليس منتظما.', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'saqayn', text: 'في مثلث متساوي الساقين زاويته الرئيسية $40^\\circ$ ، قيس كل من زاويتي القاعدة $70^\\circ$ .', answer: true,
    why: 'زاويتا القاعدة متقايستان ومجموع زوايا المثلث $180^\\circ$ : $\\dfrac{180^\\circ - 40^\\circ}{2} = 70^\\circ$ .', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'irtifa', text: 'في مثلث متساوي الساقين رأسه الرئيسي $U$ ، الارتفاع النازل من $U$ ينصّف الزاوية الرئيسية ويقطع القاعدة في منتصفها.', answer: true,
    why: 'في المثلث المتساوي الساقين، الارتفاع المتعلق بالقاعدة هو أيضا منصّف الزاوية الرئيسية ومحور القاعدة.', source: addition('prerequisite_diagnostic') },
  { n: 8, skill: 'jaib', text: 'في المثلث $RST$ القائم في $S$ حيث $RT = 25$ و $ST = 7$ ، لدينا $\\sin\\widehat{R} = \\dfrac{7}{25}$ .', answer: true,
    why: 'جيب زاوية حادة = طول الضلع المقابل على طول الوتر: الضلع المقابل للزاوية R هو $[ST]$ والوتر $[RT]$ .', source: addition('prerequisite_diagnostic') },
  { n: 9, skill: 'muhit', text: 'طول دائرة نصف قطرها $7\\,\\mathrm{cm}$ هو $49\\pi\\,\\mathrm{cm}$ .', answer: false,
    why: 'طول الدائرة (محيطها) $2\\pi r = 14\\pi\\,\\mathrm{cm}$ ؛ أمّا $\\pi r^2 = 49\\pi$ فهي مساحة القرص بالسنتيمتر المربع.', source: addition('prerequisite_diagnostic') },
];

/**
 * « أدمج تعلّماتي » (p. 160) — la وضعية du jardin public, au mot près, et son « تحليل الوضعية » en trois étapes NOMMÉES par le
 * manuel. Pas de figure dans le manuel : le lab (le massif et ses lampadaires) et le plan (content/figures.js › PLAN, après
 * l'étape d'exécution) sont ceux de la plateforme. Réponse (extraction › situation › answer) : un hexagone régulier inscrit,
 * 360°/6 = 60°, des triangles équilatéraux ⇒ d = r = 3 m ; au compas, la même ouverture 3 cm six fois (échelle 1 cm ↔ 1 m) ;
 * (ajout de l'extraction) le long du bord, π ≈ 3,14 m. `questions` : ce que la مذكرة du professeur lit (buildLessonMemo › SITUATION).
 */
export const SITUATION = {
  source: src('situation', 160, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: 'لإضافة لمسة جمالية على الحديقة العمومية للبلدية ارتأت المصلحة المعنية تخصيص حيّز دائريّ نصف قطره 3m لغرس الأزهار على أن تحيط به 6 أعمدة كهربائية متباعدة بنفس المسافة. اقترح مخططا لوضع هذه الأعمدة على محيط الحيز، مُحدّدا المسافة بين كل عمودين.',
  questions: [
    'ما هو شكل الجزء المخصص لزراعة الأزهار؟ كيف توضع الأعمدة الكهربائية؟',
    'ماهي المهمة المطلوب إنجازها؟ كيف سيتم ذلك؟ ماذا يلزم لاختيار موقع الأعمدة؟',
    'ما هي المسافة التي تفصل بين عمودين متتاليين؟',
    'نختار مقياسا مناسبا، ثم نُنشئ مضلعا منتظما بحيث يكون كل رأس من المضلع هو موقع عمود إنارة.',
  ],
  closing: 'الأعمدة الستة رؤوس سداسي منتظم مركزه مركز الحيّز: كل عمود صورة السابق بالدوران الذي زاويته $60^\\circ$ ، والمسافة بين عمودين متتاليين تساوي نصف القطر: $3\\,\\mathrm{m}$ .',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', items: ['ما هو شكل الجزء المخصص لزراعة الأزهار؟', 'كيف توضع الأعمدة الكهربائيّة؟'] },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', items: ['ماهي المهمة المطلوب إنجازها؟ كيف سيتم ذلك؟', 'ماذا يلزم لاختيار موقع الأعمدة؟', 'ما هي المسافة التي تفصل بين عمودين متتاليين؟'] },
    { label: 'تنفيذ استراتيجية الحل المختارة', items: ['نختار مقياس مناسب، ثم نُنشئ مضلعا منتظما بحيث يكون كل رأس من المضلع هو موقع عمود إنارة.'] },
  ],
  numbers: { n: 6, r: 3 },
  // « على طول الحافة » (π ≈ 3,14 m) : l'ajout déclaré de l'extraction (situation › answer › alongTheEdge).
  edge: addition('synthesis_generation'),
};

/** Le texte d'une analyse (puces du manuel) en une ligne. */
export const analysisText = (a) => a.items.join(' — ');

/**
 * Les props du laboratoire du module 7 — `lamp-ring` (écrit pour cette leçon : logic/lampRing.js, rotation/LampRing.jsx),
 * écrites ici une fois : le module les étale, le test de rendu (lab.render.test.jsx) monte le workspace avec ces mêmes objets.
 * Ce sont les nombres de levels.js (une seule source).
 *   مبتدئ  un petit massif de 2 m et 4 lampadaires (plateforme) : un carré, l'angle au centre droit, 2√2 ≈ 2,83 m ;
 *   متقدم  la وضعية : 6 lampadaires sur 3 m, 60°, d = r = 3 m ; puis, en extra après la règle, 12 lampadaires (30°, ≈ 1,55 m) — jamais les 8 du إختبار.
 */
export const LAB = {
  beginner: { numbers: { n: 4, r: 2 }, theme: 'flower-bed' },
  advanced: { numbers: { n: 6, r: 3, extra: 12 }, theme: 'flower-bed' },
};
/** Ce que le lab fait trouver (vérifié par lab.render.test.jsx) : l'angle, la distance exacte et approchée. */
export const LAB_EXPECT = {
  beginner: { alpha: 90, gapTex: '2\\sqrt{2}\\,\\mathrm{m} \\approx 2{,}83\\,\\mathrm{m}', approx: '2,83', edge: '3,14' },
  advanced: { alpha: 60, gapTex: '3\\,\\mathrm{m}', approx: '3,00', edge: '3,14' },
};

/**
 * Les phrases de la correction du module 7, importées aussi par knowledge.jsx et la carte (knowledgeGraph.js) : une aide de
 * la carte cite la leçon mot pour mot. Toute égalité dans `$…$`.
 */
export const REMARKS = {
  // قراءة
  hayyiz: 'الحيّز دائرة مركزها O ونصف قطرها $3\\,\\mathrm{m}$ ، والأعمدة الستة على محيطها (حافة الحوض) لا داخله، والمسافات بين كل عمودين متتاليين متساوية.',
  mutlub: 'العدد معطى (6 أعمدة) ونصف القطر معطى: المطلوب مخطط لمواضع الأعمدة والمسافة بين كل عمودين متتاليين.',
  // تحليل
  muntazam: 'ست نقط على دائرة، متباعدة بنفس المسافة، هي رؤوس سداسي منتظم مركزه مركز الدائرة.',
  zawiya: 'الأقواس الستة بين الأعمدة متقايسة وتملأ الدورة كاملة حول O: الزاوية المركزية بين عمودين متتاليين $\\dfrac{360^\\circ}{6} = 60^\\circ$ .',
  dawaran: 'كل عمود صورة الذي قبله بالدوران الذي مركزه O وزاويته $60^\\circ$ ، والعمود السابع يعود إلى الأول لأنّ $6 \\times 60^\\circ = 360^\\circ$ .',
  amdaWrong: '6 أعمدة تعطي 5 مسافات فقط، فالزاوية بين عمودين متتاليين $\\dfrac{360^\\circ}{5} = 72^\\circ$ .',
  amdaWhy: 'هذا صحيح على خط مستقيم، لكن الدائرة مغلقة: بعد العمود السادس نعود إلى الأول، فهناك 6 أقواس لا 5.',
  amdaRight: 'n عمودا على دائرة تحدّد n قوسا متقايسة: الزاوية المركزية بين عمودين متتاليين $\\dfrac{360^\\circ}{n}$ .',
  tasawi: 'الدوران يحافظ على الأطوال: صورة القطعة $[P_1P_2]$ هي $[P_2P_3]$ ، فالمسافات بين كل عمودين متتاليين متساوية، والأعمدة كلها على بعد $3\\,\\mathrm{m}$ من O.',
  daira: 'وجود الأعمدة على الدائرة لا يكفي: عمودان قريبان وعمودان بعيدان كلها على الدائرة. الذي يجعل المسافات متساوية هو تساوي الزوايا المركزية.',
  // la distance
  mutaqayis: 'المثلث $OP_1P_2$ متساوي الساقين ( $OP_1 = OP_2 = 3$ ) وزاويته الرئيسية $60^\\circ$ ، فزاويتا القاعدة $\\dfrac{180^\\circ - 60^\\circ}{2} = 60^\\circ$ : هو متقايس الأضلاع ومنه $P_1P_2 = 3\\,\\mathrm{m}$ .',
  jaib: 'الارتفاع $[OH]$ في المثلث المتساوي الساقين $OP_1P_2$ ينصّف الزاوية $\\widehat{P_1OP_2}$ والقاعدة $[P_1P_2]$ : في المثلث $OHP_1$ القائم في H لدينا $\\sin 30^\\circ = \\dfrac{P_1H}{3}$ ، ومنه $P_1H = 3 \\times 0{,}5 = 1{,}5$ و $P_1P_2 = 2 \\times 1{,}5 = 3$ (بالمتر).',
  qanun: 'بصفة عامة، المسافة بين عمودين متتاليين من n عمودا على دائرة نصف قطرها r هي $d = 2r\\sin\\dfrac{180^\\circ}{n}$ ؛ وفي السداسي نجد $d = r$ .',
  dilWrong: 'المسافة بين عمودين متتاليين تساوي دائما نصف القطر.',
  dilWhy: 'هذا صحيح في السداسي المنتظم فقط، لأنّ زاويته المركزية $60^\\circ$ تجعل المثلث متقايس الأضلاع؛ بأربعة أعمدة على نفس الحوض الزاوية المركزية $90^\\circ$ .',
  dilRight: 'بأربعة أعمدة على حوض نصف قطره $3\\,\\mathrm{m}$ : $d = 2 \\times 3 \\times \\sin 45^\\circ = 3\\sqrt{2} \\approx 4{,}24\\,\\mathrm{m}$ .',
  qawsWrong: 'المسافة بين عمودين متتاليين هي طول القوس بينهما.',
  qawsWhy: 'القوس هو الطريق على طول حافة الحوض؛ أمّا المسافة بين العمودين فهي طول القطعة المستقيمة بينهما (الوتر)، وهي أقصر.',
  qawsRight: 'على طول الحافة $\\dfrac{2\\pi \\times 3}{6} = \\pi \\approx 3{,}14\\,\\mathrm{m}$ ، وفي خط مستقيم $3\\,\\mathrm{m}$ .',
  // تنفيذ
  sullam: 'بالمقياس $1\\,\\mathrm{cm}$ على المخطط لكل $1\\,\\mathrm{m}$ في الحديقة: نرسم دائرة نصف قطرها $3\\,\\mathrm{cm}$ ، ثم نحمل عليها بالمدوّر، بنفس الفتحة $3\\,\\mathrm{cm}$ ، ست نقط متتالية: هي مواضع الأعمدة.',
  kabl: 'طول الكابل الذي يربط الأعمدة الستة على التوالي هو محيط السداسي: $6 \\times 3 = 18$ (بالمتر).',
  tajnid: 'نترجم «متباعدة بنفس المسافة» بمضلع منتظم، ونضع رؤوسه بالدوران الذي زاويته الزاوية المركزية، ثم نحسب المسافة في المثلث القائم الذي يرسمه الارتفاع.',
};

/** Les titres des leçons du propriétaire (catalogue). */
export const LESSON_TITLES = {
  'mafhum-dawaran': 'الدرس 1 — مفهوم الدوران وإنشاء صور أشكال هندسية بدوران',
  'khawas-dawaran': 'الدرس 2 — خواص الدوران وتوظيفها في الأشكال الهندسية',
  'zawiya-muhitiya': 'الدرس 3 — الزاوية المحيطية والزاوية المركزية والعلاقة بينهما',
  'mudalaat-muntazama': 'الدرس 4 — المضلعات المنتظمة وتطبيقاتها',
};

/**
 * « وضعية الاختبار النهائي » (module 8) — la وضعية TRANSPOSÉE (`synthesis_generation`, extraction › situation › duplicatedIn module 8) :
 * mêmes ressources, autres nombres, pour que les réponses n'apparaissent nulle part ailleurs dans la leçon. Un rond-point à
 * Oran de rayon 5 m et 8 lampadaires : l'octogone régulier, 360°/8 = 45°, le triangle rectangle OHP₁ (22,5° en O),
 * d = 2 × 5 × sin 22,5° ≈ 3,83 m, le câble du tour 8 × d ≈ 30,61 m (30,64 en arrondissant trop tôt).
 */
export const TEST = {
  source: addition('synthesis_generation'),
  title: 'وضعية أخرى: أعمدة الإنارة حول دوّار بوهران',
  text: 'قرّرت بلدية وهران تزيين دوّار (ملتقى طرق دائري) نصف قطره $5\\,\\mathrm{m}$ بثمانية أعمدة إنارة مثبّتة على حافته، متباعدة بنفس المسافة، وحرصت على إتقان العمل وسلامة المارّة ليلًا. نسمّي O مركز الدوّار، و $P_1$ و $P_2$ عمودين متتاليين، و H منتصف $[P_1P_2]$ .',
};
