import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — le « أستعدّ » du manuel (p. 103, items 1–5) appartient à la leçon 1 (extraction ›
 * destinations › prep) : la synthèse n'en reçoit aucun. Ses affirmations sont donc des AFFIRMATIONS DE LA
 * PLATEFORME (« عبارة إضافية من المنصّة »), dans la forme du manuel, sur ce que le تحدّ, la وضعية et le test
 * final mobilisent : Thalès et sa réciproque (دروس 1 و 2), le quatrième proportionnel, la coupe
 * axiale d'un cône et le volume d'un cylindre (années précédentes), une équation du premier degré, les
 * médianes d'un triangle (ex. 20). Quatre vraies, trois fausses ; jamais les nombres de la minaret ni du cône.
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'talis', text: 'ABC مثلث، M نقطة من [AB] و N نقطة من [AC] حيث (MN)//(BC). ينتج $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$ .', answer: true,
    why: 'المستقيمان (BM) و (CN) متقاطعان في A و (MN)//(BC): المثلثان AMN و ABC في وضعية طالس، فأطوالهما متناسبة (خاصية طالس).', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'aksiya', text: 'إذا كان $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ فإنّ (MN)//(BC) مهما كان موقع النقطتين M و N على المستقيمين (AB) و (AC).', answer: false,
    why: 'تساوي النسبتين لا يكفي: يجب أيضا أن تكون النقط A ، B ، M مرتبة بنفس ترتيب النقط A ، C ، N (الخاصية العكسية لخاصية طالس).', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'tanasub', text: 'من المساواة $\\dfrac{x}{4} = \\dfrac{15}{6}$ ينتج $x = 10$ .', answer: true,
    why: 'الجداء التصالبي: $6 \\times x = 4 \\times 15 = 60$ إذن $x = 10$ .', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'maqta', text: 'مقطع مخروط دوران بمستوٍ يشمل محوره هو دائرة.', answer: false,
    why: 'المستوي الذي يشمل المحور يقطع المخروط وفق مثلث متساوي الساقين رأسه رأس المخروط؛ المستوي الموازي للقاعدة هو الذي يعطي دائرة.', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'hajm', text: 'حجم أسطوانة دوران نصف قطر قاعدتها $2\\,\\mathrm{cm}$ وارتفاعها $7\\,\\mathrm{cm}$ هو $28\\pi\\,\\mathrm{cm}^3$ .', answer: true,
    why: '$V = \\pi \\times r^2 \\times h = \\pi \\times 2^2 \\times 7 = 28\\pi$ .', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'muadala', text: 'حلّ المعادلة $3x = 2(20 - x)$ هو $x = 10$ .', answer: false,
    why: '$3x = 40 - 2x$ إذن $5x = 40$ ومنه $x = 8$ ؛ أمّا 10 فلا يحقّقها: $30 \\neq 20$ .', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'mutawassitat', text: 'متوسطات مثلث الثلاثة تتقاطع في نقطة واحدة تسمّى مركز ثقل المثلث.', answer: true,
    why: 'خاصية المتوسطات في مثلث (السنة الثالثة): تتقاطع في نقطة واحدة هي مركز الثقل.', source: addition('prerequisite_diagnostic') },
];

/**
 * Le تحدّ de la page d'unité (p. 103) — DOUBLON DÉCLARÉ (extraction › destinations › challenge › duplicatedIn :
 * cette leçon, module 7). Le texte du manuel, son « الشكل المقابل » redessiné (components/MinaretFigure.jsx, le même
 * dessin que la page d'unité), et ses nombres : bâton 1 m à 10 m du pied, ombres finissant ensemble à 11,6 m.
 */
export const CHALLENGE = {
  source: src('challenge', 103, 'تحدّ'),
  text: 'في فترة معينة من يوم مشمس، تساءل فريد عن ارتفاع مئذنة المسجد الموجود بالحي الذي يسكن فيه. اقترح عليه مقران طريقة مكّنتهما من رسم الشكل المقابل ببعض القياسات. اشرح الطريقة المقترحة ثم ساعدهما على إيجاد ارتفاع المئذنة.',
  numbers: { stick: '1', stickAt: '10', tip: '11,6' },
};

/** L'encadré d'ouverture (p. 103) « طالس » — DOUBLON DÉCLARÉ (duplicatedIn : module 7) : la méthode de l'ombre. */
export const INTRO_THALES = {
  source: src('intro-thales', 103, 'مدخل الباب'),
  title: 'طالس',
  text: 'يُعتبر طالس أحد حكماء الإغريق السبعة والذي كان مهتما بدراسة الهندسة وله العديد من الأعمال العلمية منها: - مبرهنة حول نسب بين أطوال قطع المستقيمين المتقاطعين في نقطة عندما يقطعهما مستقيمان متوازيان. - قياس ارتفاع أهرامات مصر بطريقة الظل.',
};

/**
 * « أدمج تعلّماتي » (p. 112) — la وضعية du cylindre dans le cône, au mot près (les mesures écrites en îlots
 * mathématiques : « 18cm » nu s'inverse en RTL), et son « تحليل الوضعية » en trois étapes NOMMÉES par le manuel.
 * `questions` : ce que la مذكرة du professeur lit (buildLessonMemo › SITUATION).
 */
export const SITUATION = {
  source: src('situation', 112, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: 'الشكل المقابل يمثّل أسطوانة دوران ارتفاعها $h$ ونصف قطر قاعدتها $r$ ، مرسومة داخل مخروط دوران ارتفاعه $18\\,\\mathrm{cm}$ ونصف قطر قاعدته $6\\,\\mathrm{cm}$ . احسب حجم هذه الأسطوانة في الحالة $h = r$ .',
  questions: [
    'ما المطلوب في النص؟',
    'أي شكل هندسي يمكن ربطه بالصورة المعطاة؟',
    'تفسير الشكل بمثلثين يشتركان في النقطة O، ثم تطبيق خاصية طالس وحل معادلة لإيجاد r.',
  ],
  closing: 'المقطع المحوري يحوّل المجسّمين إلى مثلثين في وضعية طالس: نحصل على معادلة في r ثم على الحجم.',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', items: ['ما المطلوب في النص؟', 'أي شكل هندسي يمكن ربطه بالصورة المعطاة؟', 'ما هي الموارد المعرفية التي لها علاقة بهذه الوضعية؟'] },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', items: ['اختر أجزاء الصورة التي اعتمد عليها لانجاز الشكل المطلوب.', 'اختر الخواص الهندسية المناسبة لحساب r.'] },
    { label: 'تنفيذ استراتيجية الحل المختارة', items: ['تفسير الشكل بمثلثين يشتركان في النقطة O.', 'تطبيق خاصية طالس وحل معادلة لإيجاد r.'] },
  ],
  numbers: { H: 18, R: 6 },
};

/** Le texte d'une analyse (puces du manuel) en une ligne. */
export const analysisText = (a) => a.items.map((s) => `• ${s}`).join(' ');

/**
 * Les props des DEUX laboratoires du module 7, dans UN workspace (MANIPULATION_CONTRACT §2undecies) — écrites ici une
 * fois : le module les étale, le test de rendu (lab.render.test.jsx) monte le workspace avec ces mêmes objets.
 *   مبتدئ  shadow-world, le تحدّ dans « ساحة الحيّ » : la minaret de 7,25 m (AM = 1 × 11,6 ÷ 1,6) ; à 15:00 son ombre finit à
 *          11,6 m et le bâton planté à 10 m y fait finir la sienne — l'élève y arrive par ses propres mesures et sa règle ;
 *   متقدم  cone-cylinder, la وضعية : cône H = 18, R = 6 (le cylindre h = r est sur la règle).
 */
export const LAB = {
  beginner: { minaret: '7,25', theme: 'minaret' },
  advanced: { H: 18, R: 6, theme: 'cornet' },
};

/**
 * Les phrases de la correction du module 7, importées aussi par knowledge.jsx et la carte (knowledgeGraph.js) :
 * une aide de la carte cite la leçon mot pour mot. Toute égalité dans `$…$`.
 */
export const REMARKS = {
  // le تحدّ
  zillMethod: 'نغرس عصا شاقولية بحيث ينتهي ظلّها حيث ينتهي ظلّ المئذنة، في نقطة نسمّيها O.',
  zillWhy: 'العصا والمئذنة عموديتان على الأرض فهما متوازيتان، وظلّاهما ينتهيان في O: المثلثان OBE و OAM في وضعية طالس.',
  zillWrong: 'نغرس العصا في أيّ مكان ونقارن ظلّها بظلّ المئذنة.',
  zillWrongWhy: 'إذا لم ينتهِ الظلّان في النقطة نفسها فلا رأس مشترك للمثلثين: الشعاعان منفصلان والمثلثان ليسا في وضعية طالس.',
  zillRight: 'نحرّك العصا حتى ينتهي ظلّها حيث ينتهي ظلّ المئذنة تمامًا.',
  zillOB: 'ظلّ العصا: $OB = 11{,}6 - 10 = 1{,}6$ ، وظلّ المئذنة $OA = 11{,}6$ .',
  zillEq: '$\\dfrac{AM}{BE} = \\dfrac{OA}{OB}$ أي $\\dfrac{AM}{1} = \\dfrac{11{,}6}{1{,}6}$ ومنه $AM = 7{,}25$ : ارتفاع المئذنة $7{,}25\\,\\mathrm{m}$ .',
  // la وضعية — la coupe
  maqta: 'نقطع المجسّمين بالمستوي الذي يشمل محورهما: يظهر المثلث القائم OSK للمخروط ( $SK = 6$ و $SO = 18$ ) والمستطيل SDCT للأسطوانة ( $ST = h$ و $TC = r$ ).',
  tawazi: '(TC) و (SK) عموديان كلاهما على المحور (SO) فهما متوازيان، والنقطة C من المولّد [OK].',
  talisSection: 'المثلثان OTC و OSK في وضعية طالس: $\\dfrac{OT}{OS} = \\dfrac{TC}{SK}$ أي $\\dfrac{18 - h}{18} = \\dfrac{r}{6}$ .',
  otWrong: 'نكتب $\\dfrac{r}{6} = \\dfrac{h}{18}$ .',
  otWhy: 'الضلع الذي رأسه O في المثلث الصغير هو $OT = 18 - h$ ، أمّا h فهو ST: طول الأسطوانة من قاعدة المخروط.',
  otRight: '$\\dfrac{r}{6} = \\dfrac{18 - h}{18}$',
  // la وضعية — l'équation, le volume, la vérification
  muadala: 'مع $h = r$ : $\\dfrac{r}{6} = \\dfrac{18 - r}{18}$ أي $18r = 6(18 - r)$ أي $18r = 108 - 6r$ ومنه $24r = 108$ .',
  halR: '$r = \\dfrac{108}{24} = 4{,}5$ ، إذن $h = r = 4{,}5\\,\\mathrm{cm}$ .',
  hajm: '$V = \\pi \\times r^2 \\times h = \\pi \\times 4{,}5^2 \\times 4{,}5 = 91{,}125\\pi$ ، أي $V \\approx 286{,}28\\,\\mathrm{cm}^3$ .',
  qutrWrong: 'نحسب الحجم بالقطر: $\\pi \\times 9^2 \\times 4{,}5$ .',
  qutrWhy: 'قانون حجم الأسطوانة $V = \\pi r^2 h$ بنصف القطر r ، والقطر $2r = 9$ يضاعف الحجم أربع مرات.',
  qutrRight: '$V = \\pi \\times 4{,}5^2 \\times 4{,}5 = 91{,}125\\pi$',
  mulaama: 'نتحقّق: $4{,}5 < 6$ (الأسطوانة لا تخرج من المخروط) و $4{,}5 < 18$ ، و $\\dfrac{4{,}5}{6} = \\dfrac{18 - 4{,}5}{18} = 0{,}75$ .',
  jumla: 'حجم الأسطوانة في الحالة $h = r$ هو $91{,}125\\pi\\,\\mathrm{cm}^3$ ، أي $286{,}28\\,\\mathrm{cm}^3$ تقريبا.',
  tajnid: 'وضعية طالس تظهر حيث يوجد مستقيمان متوازيان يقطعان مستقيمين متقاطعين: ظلّان، مقطع محوري، ضفّتا نهر، قاعدتا شبه منحرف.',
};

/**
 * Les mêmes idées EN LETTRES, pour ce qui est ouvert dès le premier écran (lecteur de mission, `knowledgeMapOpen`, 2026-11-10) : les cartes de
 * connaissance (knowledge.jsx) et la carte des معارف (knowledgeGraph.js). Aucun nombre de la وضعية de l'unité (module 7 : 18 / 6, 4,5, 24r = 108,
 * 91,125π) ni du défi 🏆 (module 8) — content/forbidden.js, content/mission.test.js. Le module 7 garde REMARKS, ses nombres, à SON heure.
 */
export const CARD = {
  maqta: 'نقطع المجسّمين بالمستوي الذي يشمل محورهما: يظهر المثلث القائم OSK للمخروط ( $SK = R$ و $SO = H$ ) والمستطيل SDCT للأسطوانة ( $ST = h$ و $TC = r$ ).',
  tawazi: REMARKS.tawazi,
  talisSection: 'المثلثان OTC و OSK في وضعية طالس: $\\dfrac{OT}{OS} = \\dfrac{TC}{SK}$ أي $\\dfrac{H - h}{H} = \\dfrac{r}{R}$ .',
  muadala: 'مع $h = r$ : $\\dfrac{r}{R} = \\dfrac{H - r}{H}$ ، نضرب ضربًا متصالبًا: $H \\times r = R \\times (H - r)$ ، ثم نجمع حدود r في طرف واحد.',
  halR: 'نقسم على معامل r ، ونتحقّق أنّ القيمة التي وجدناها تحقّق المساواة الأولى.',
  hajm: '$V = \\pi \\times r^2 \\times h$ : نكتب القيمة المضبوطة بدلالة $\\pi$ ثم القيمة المقرّبة.',
  mulaama: 'نتحقّق: $r < R$ (الأسطوانة لا تخرج من المخروط) و $h < H$ ، و $\\dfrac{r}{R} = \\dfrac{H - h}{H}$ .',
  otWrong: 'نكتب $\\dfrac{r}{R} = \\dfrac{h}{H}$ .',
  otWhy: 'الضلع الذي رأسه O في المثلث الصغير هو $OT = H - h$ ، أمّا h فهو ST: طول الأسطوانة من قاعدة المخروط.',
  otRight: '$\\dfrac{r}{R} = \\dfrac{H - h}{H}$',
  qutrWrong: 'نحسب الحجم بالقطر: $\\pi \\times (2r)^2 \\times h$ .',
  qutrWhy: 'قانون حجم الأسطوانة $V = \\pi r^2 h$ بنصف القطر r ، والقطر $2r$ يضاعف الحجم أربع مرات.',
  qutrRight: '$V = \\pi \\times r^2 \\times h$',
};

export const LESSON_TITLES = {
  'talis-hisab-atwal': 'الدرس 1 — خاصية طالس وحساب الأطوال',
  'aksiya-talis': 'الدرس 2 — الخاصية العكسية لخاصية طالس وإثبات التوازي',
  'inshaat-talis': 'الدرس 3 — إنشاءات هندسية وتطبيقات خاصية طالس',
};

/**
 * « وضعية الاختبار النهائي » (module 8) — la وضعية et le تحدّ TRANSPOSÉS (`synthesis_generation`) : mêmes ressources, autres
 * nombres, pour que leurs réponses n'apparaissent nulle part ailleurs dans la leçon.
 *   le cornet  H = 12, R = 6 : r ÷ 6 = (12 − h) ÷ 12 ; h = r ⇒ 18r = 72 ⇒ r = 4 ; V = 64π ≈ 201,06 cm³ ;
 *   la minaret  bâton de 1,5 m à 12 m, ombres finissant ensemble à 14 m ⇒ OB = 2 ⇒ AM = 1,5 × 14 ÷ 2 = 10,5 m.
 */
export const TEST = {
  source: addition('synthesis_generation'),
  title: 'وضعية أخرى: علبة مثلجات في مخروط، ومنارة الحيّ',
  cone: { H: 12, R: 6, text: 'في مطعم المتوسطة، وحرصًا على نظافة العمل وإتقانه، يضع الطبّاخ علبة مثلجات على شكل أسطوانة دوران ارتفاعها $h$ ونصف قطر قاعدتها $r$ ، مرسومة داخل مخروط دوران ارتفاعه $12\\,\\mathrm{cm}$ ونصف قطر قاعدته $6\\,\\mathrm{cm}$ ، بنفس الطريقة التي في الوضعية.' },
  minaret: { stick: '1,5', stickAt: '12', tip: '14', text: 'تحبّ ريم العلم وتقيس لتتعلّم، فغرست عصا شاقولية طولها $1{,}5\\,\\mathrm{m}$ على بعد $12\\,\\mathrm{m}$ من قاعدة منارة، فانتهى ظلّها حيث ينتهي ظلّ المنارة، على بعد $14\\,\\mathrm{m}$ من قاعدة المنارة.' },
};
