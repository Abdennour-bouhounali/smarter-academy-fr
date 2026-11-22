import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — le « أستعدّ » du manuel (p. 139, items 1–6) appartient aux leçons 1 à 3 (extraction ›
 * destinations › prep) : la synthèse n'en reçoit aucun. Ses affirmations sont donc des AFFIRMATIONS DE LA PLATEFORME
 * (« عبارة إضافية من المنصّة »), dans la forme du manuel, sur ce que la وضعية et l'épreuve finale mobilisent :
 * lire un point (درس 1), les composantes AB (درس 2), le milieu et la distance (درس 3), la nature par le calcul (درس 4), la
 * longueur d'un demi-cercle et la valeur approchée d'une racine (années précédentes, الوحدة 2), l'ordre des sommets d'un
 * متوازي أضلاع (الوحدة 11). Quatre vraies, quatre fausses ; jamais les nombres de la وضعية,
 * du lab ni du إختبار.
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'nuqta', text: 'النقطة $K(5\\,;\\,-4)$ تقع تحت محور الفواصل وعلى يمين محور التراتيب.', answer: true,
    why: 'فاصلة K موجبة (5) فهي على يمين محور التراتيب، وترتيبها سالب (−4) فهي تحت محور الفواصل.', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'murakkibat', text: 'إذا كان $E(1\\,;\\,4)$ و $F(-2\\,;\\,6)$ فإنّ $\\overrightarrow{EF}\\begin{pmatrix} 3 \\\\ -2 \\end{pmatrix}$ .', answer: false,
    why: 'مركبتا $\\overrightarrow{EF}$ هما $x_F - x_E = -2 - 1 = -3$ و $y_F - y_E = 6 - 4 = 2$ : النهاية ناقص المبدأ، أي $\\overrightarrow{EF}\\begin{pmatrix} -3 \\\\ 2 \\end{pmatrix}$ .', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'muntasaf', text: 'منتصف القطعة $[RS]$ حيث $R(-5\\,;\\,2)$ و $S(1\\,;\\,6)$ هو النقطة $(-2\\,;\\,4)$ .', answer: true,
    why: '$\\dfrac{-5 + 1}{2} = -2$ و $\\dfrac{2 + 6}{2} = 4$ : نصف مجموع الإحداثيتين.', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'masafa', text: 'في معلم متعامد ومتجانس، المسافة بين $U(0\\,;\\,0)$ و $V(5\\,;\\,12)$ هي $17$ .', answer: false,
    why: '$UV = \\sqrt{5^2 + 12^2} = \\sqrt{169} = 13$ . العدد 17 هو $5 + 12$ : جمعنا المركبتين بدل الجذر.', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'nisfDaira', text: 'طول نصف دائرة (القوس وحده) قطرها $6\\,\\mathrm{cm}$ هو $6\\pi\\,\\mathrm{cm}$ .', answer: false,
    why: 'محيط الدائرة $2\\pi r = \\pi d = 6\\pi$ ، ونصف الدائرة نصفه: $3\\pi\\,\\mathrm{cm}$ (نصف القطر 3).', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'tabia', text: 'إذا كان $RS^2 + ST^2 = RT^2$ فإنّ المثلث $RST$ قائم في $S$ .', answer: true,
    why: 'عكس خاصية فيثاغورس: الضلع الأطول $[RT]$ يقابل الزاوية القائمة، والزاوية القائمة في الرأس المقابل له، أي S.', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'muqarraba', text: 'القيمة المقرّبة إلى $0{,}01$ للعدد $\\sqrt{30}$ هي $5{,}48$ .', answer: true,
    why: '$\\sqrt{30} \\approx 5{,}477$ ، والرقم الثالث بعد الفاصلة 7 فنرفع: $5{,}48$ .', source: addition('prerequisite_diagnostic') },
  { n: 8, skill: 'tartib', text: 'إذا كان $\\overrightarrow{GH} = \\overrightarrow{UV}$ فإنّ الرباعي $GHUV$ متوازي أضلاع.', answer: false,
    why: '$\\overrightarrow{GH} = \\overrightarrow{UV}$ يعني أنّ $GHVU$ متوازي أضلاع (ترتيب الرؤوس)؛ الرباعي GHUV متقاطع الأضلاع.', source: addition('prerequisite_diagnostic') },
];

/**
 * « أدمج تعلّماتي » (p. 148) — la وضعية des deux coureurs, au mot près, et son « تحليل الوضعية » en trois étapes NOMMÉES
 * par le manuel. La figure (content/figures.js › SITUATION_FIGURE) suit l'extraction : le parcours (1) de A(−2 ; 0) à
 * B(4 ; 0) en trois demi-cercles de rayon 1 (centres (−1 ; 0), (1 ; 0), (3 ; 0)), le parcours (2) la ligne brisée
 * M(−2 ; 3) → (1 ; 1) → (3 ; 2) → N(4 ; −2) ; les deux sommets intermédiaires sont nommés P et Q par la plateforme (le
 * manuel ne les nomme pas), comme le point E(2 ; 0). Réponse : 3π ≈ 9,42 km contre √13 + √5 + √17 ≈ 9,96 km.
 * `questions` : ce que la مذكرة du professeur lit (buildLessonMemo › SITUATION).
 */
export const SITUATION = {
  source: src('situation', 148, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: 'يتدرّب عدّاءان استعدادا لمنافسة دُوليّة على مسارين مُمثّلين بالمنحنيين (1) و (2) في الشكل المقابل. حدّد أقصر المسارين (1) و (2).',
  scale: '$1\\,\\mathrm{cm}$ على المعلم يمثل $1\\,\\mathrm{km}$ في الواقع.',
  questions: [
    'عمّ يتحدث النص؟ كيف أرتب المعطيات والتعليمات الواردة في نص المشكل؟',
    'كيف أفسّر التمثيلين البيانيين (1) و (2)؟',
    'إحداثيتا كل نقطة من نقاط المسار (1) مع حامل محور الفواصل، طول المسار (1) بمحيط ثلاثة أنصاف دوائر، وإحداثيتا كل طرف من قطع المسار (2).',
  ],
  closing: 'المسار (1) ثلاثة أنصاف دوائر طوله $3\\pi \\approx 9{,}42\\,\\mathrm{km}$ ، والمسار (2) ثلاث قطع طوله $\\sqrt{13} + \\sqrt{5} + \\sqrt{17} \\approx 9{,}96\\,\\mathrm{km}$ : المسار (1) هو الأقصر بفارق حوالي $0{,}54\\,\\mathrm{km}$ .',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', items: ['عمّ يتحدث النص؟', 'كيف أرتب المعطيات والتعليمات الواردة في نص المشكل؟'] },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', items: ['كيف أفسّر التمثيلين البيانيين (1) و (2)؟'] },
    { label: 'تنفيذ استراتيجية الحل المختارة', items: ['إحداثيتا كل نقطة من نقاط المسار (1) مع حامل محور الفواصل.', 'أعبّر عن طول المسار (1) بمحيط ثلاثة أنصاف دوائر.', 'أبحث عن إحداثيتي كل طرف من قِطع المسار (2).'] },
  ],
  names: addition('synthesis_generation'),
};

/** Le texte d'une analyse (puces du manuel) en une ligne. */
export const analysisText = (a) => a.items.join(' — ');

/**
 * Les props du laboratoire du module 7 — `route-compare` (écrit pour cette leçon : logic/routeCompare.js,
 * vectors/RouteCompare.jsx), écrites ici une fois : le module les étale, le test de rendu (lab.render.test.jsx) monte le
 * workspace avec ces mêmes objets. Ce sont les nombres de levels.js (une seule source).
 *   مبتدئ  un rallye au Sahara (`rally`) : A(−3 ; 0) → demi-cercle autour d'une dune (centre I(−1 ; 0)) → C(1 ; 0) → B(3 ; 0),
 *          contre A → D(−1 ; −2) → B : 2π + 2 ≈ 8,28 contre 2√2 + 2√5 ≈ 7,30 — la ligne brisée gagne ;
 *   متقدم  la وضعية (`cross`, le cross des Sablettes) : 3π ≈ 9,42 contre √13 + √5 + √17 ≈ 9,96 — les arcs gagnent.
 */
export const LAB = {
  beginner: {
    numbers: {
      routes: [
        { start: [-3, 0], pieces: [{ to: [1, 0], arc: 'cw' }, { to: [3, 0] }], names: ['A', 'C', 'B'], centres: ['I'] },
        { start: [-3, 0], pieces: [{ to: [-1, -2] }, { to: [3, 0] }], names: ['A', 'D', 'B'] },
      ],
      unit: 'km',
    },
    theme: 'rally',
  },
  advanced: {
    numbers: {
      routes: [
        { start: [-2, 0], pieces: [{ to: [0, 0], arc: 'cw' }, { to: [2, 0], arc: 'ccw' }, { to: [4, 0], arc: 'cw' }], names: ['A', 'O', 'E', 'B'], centres: ['I', 'J', 'K'] },
        { start: [-2, 3], pieces: [{ to: [1, 1] }, { to: [3, 2] }, { to: [4, -2] }], names: ['M', 'P', 'Q', 'N'] },
      ],
      unit: 'km',
    },
    theme: 'cross',
  },
};
/** Ce que le lab fait trouver (vérifié par lab.render.test.jsx) : les deux longueurs, exactes et approchées, le plus court. */
export const LAB_EXPECT = {
  beginner: { l1: '2\\pi + 2', l2: '2\\sqrt{2} + 2\\sqrt{5}', a1: '8,28', a2: '7,30', shorter: 2 },
  advanced: { l1: '3\\pi', l2: '\\sqrt{13} + \\sqrt{5} + \\sqrt{17}', a1: '9,42', a2: '9,96', shorter: 1 },
};

/**
 * Les phrases de la correction du module 7, importées aussi par knowledge.jsx et la carte (knowledgeGraph.js) : une aide
 * de la carte cite la leçon mot pour mot. Toute égalité dans `$…$`.
 */
export const REMARKS = {
  muhit: '«محيط نصف دائرة» في الوضعية هو طول القوس وحده: العدّاء يجري على القوس لا على القطر.',
  // قراءة
  mawdu: 'النص يقارن طولي مسارين مرسومين في معلم متعامد ومتجانس، حيث $1\\,\\mathrm{cm}$ على المعلم يمثّل $1\\,\\mathrm{km}$ : المطلوب أقصر المسارين، لا أسرع العدّاءين.',
  tartib: 'المسار (1) يبدأ من $A$ وينتهي عند $B$ ، والمسار (2) يبدأ من $M$ وينتهي عند $N$ : ليس للمسارين نفس البداية ولا نفس النهاية.',
  // تحليل
  tafsir1: 'المسار (1) ثلاثة أنصاف دوائر أطرافها على محور الفواصل، والمسار (2) خط منكسر من ثلاث قطع مستقيمة.',
  markaz: 'مركز نصف دائرة قطرها $[XY]$ هو منتصف $[XY]$ ، ونصف قطرها $r = \\dfrac{XY}{2}$ ، وطولها $\\pi r$ (نصف محيط الدائرة $2\\pi r$ ).',
  qita: 'طول قطعة $[XY]$ في معلم متعامد ومتجانس هو $XY = \\sqrt{(x_Y - x_X)^2 + (y_Y - y_X)^2}$ ، وطول خط منكسر هو مجموع أطوال قطعه.',
  // تنفيذ — المسار (1)
  axe: 'المسار (1) يقطع محور الفواصل في $A(-2\\,;\\,0)$ و $O(0\\,;\\,0)$ و $E(2\\,;\\,0)$ و $B(4\\,;\\,0)$ : ترتيب كل نقطة من محور الفواصل يساوي 0.',
  centres: 'مراكز أنصاف الدوائر هي منتصفات $[AO]$ و $[OE]$ و $[EB]$ : $I(-1\\,;\\,0)$ و $J(1\\,;\\,0)$ و $K(3\\,;\\,0)$ ، ونصف قطر كل منها $r = 1$ .',
  L1: 'طول المسار (1): $3 \\times \\pi \\times 1 = 3\\pi \\approx 9{,}42\\,\\mathrm{km}$ .',
  // تنفيذ — المسار (2)
  sommets: 'أطراف قطع المسار (2): $M(-2\\,;\\,3)$ و $P(1\\,;\\,1)$ و $Q(3\\,;\\,2)$ و $N(4\\,;\\,-2)$ .',
  MP: '$\\overrightarrow{MP}\\begin{pmatrix} 3 \\\\ -2 \\end{pmatrix}$ ومنه $MP = \\sqrt{3^2 + (-2)^2} = \\sqrt{13}$ .',
  PQ: '$\\overrightarrow{PQ}\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$ ومنه $PQ = \\sqrt{2^2 + 1^2} = \\sqrt{5}$ .',
  QN: '$\\overrightarrow{QN}\\begin{pmatrix} 1 \\\\ -4 \\end{pmatrix}$ ومنه $QN = \\sqrt{1^2 + (-4)^2} = \\sqrt{17}$ .',
  L2: 'طول المسار (2): $\\sqrt{13} + \\sqrt{5} + \\sqrt{17} \\approx 9{,}96\\,\\mathrm{km}$ .',
  // la conclusion et la vérification
  muqarana: 'القيمتان المضبوطتان $3\\pi$ و $\\sqrt{13} + \\sqrt{5} + \\sqrt{17}$ لا تُقارنان بالعين: نقارن قيمتيهما المقرّبتين $9{,}42 < 9{,}96$ .',
  natija: 'المسار (1) هو الأقصر، بفارق حوالي $0{,}54\\,\\mathrm{km}$ فقط: الفرق صغير، والحساب وحده يفصل.',
  tadwir: 'ندوّر في الأخير: $3{,}61 + 2{,}24 + 4{,}12 = 9{,}97$ بينما $\\sqrt{13} + \\sqrt{5} + \\sqrt{17} \\approx 9{,}9647$ أي $9{,}96$ .',
  ikhtisar: 'لو جرى العدّاء الثاني مستقيما من $M$ إلى $N$ لقطع $MN = \\sqrt{61} \\approx 7{,}81\\,\\mathrm{km}$ فقط، لكنّ ذلك ليس مساره: المسار (2) يمرّ بـ $P$ و $Q$ .',
  tajnid: 'في كل وضعية في معلم: نقرأ إحداثيات النقط المهمة، ونحوّل كل جزء إلى حساب (منتصف، مسافة، $\\pi r$ )، ثم نجمع ونقارن ونفسّر.',
  // la carte : l'erreur « |Δx| + |Δy| » (MISC-MAALAM-MASAFA-JADHR-JAM)
  jamWrong: 'نحسب $MP$ بجمع فرقي الإحداثيتين: $3 + 2 = 5$ .',
  jamWhy: '$|x_P - x_M| + |y_P - y_M|$ هو طول الطريق على أضلاع المرصوفة، لا طول القطعة المستقيمة (وتر المثلث القائم).',
  jamRight: '$MP = \\sqrt{3^2 + (-2)^2} = \\sqrt{13} \\approx 3{,}61$',
  // la carte : l'erreur « 2πr » (MISC-MAALAM-NISF-DAIRA-MUHIT)
  muhitWrong: 'طول نصف دائرة نصف قطرها 1 هو $2\\pi$ .',
  muhitWhy: '$2\\pi r$ هو محيط الدائرة كاملة؛ العدّاء يجري على نصفها فقط.',
  muhitRight: 'طول نصف الدائرة $\\pi r$ ، أي $\\pi$ لنصف قطر 1، و $3\\pi$ للأنصاف الثلاثة.',
};

/** Les titres des leçons du propriétaire (catalogue). */
export const LESSON_TITLES = {
  'murakkibata-shuaa': 'الدرس 1 — قراءة مركبتي شعاع وتمثيلهما في معلم',
  'hisab-murakkibatay': 'الدرس 2 — حساب مركبتي شعاع وتساوي شعاعين في معلم',
  'muntasaf-masafa': 'الدرس 3 — إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم',
  'ithbat-khawas-maalam': 'الدرس 4 — توظيف الحساب الشعاعي والإحداثيات لإثبات الخواص الهندسية',
};

/**
 * « إختبار أولي » (module 8) — la وضعية TRANSPOSÉE (`synthesis_generation`) : mêmes ressources, autres nombres, pour que
 * les réponses n'apparaissent nulle part ailleurs dans la leçon. Deux pistes de VTT dans la forêt de جبل الوحش à Constantine
 * (1 cm ↔ 1 km) : la piste (1) de C(−3 ; 0) à D(5 ; 0) en DEUX demi-cercles de diamètres [CK] et [KD], K(1 ; 0) (centres
 * (−1 ; 0) et (3 ; 0), rayon 2 : 4π ≈ 12,57 km) ; la piste (2) la ligne brisée E(−3 ; 7) → F(0 ; 3) → G(3 ; 6) → H(5 ; 4)
 * (5 + 3√2 + 2√2 = 5 + 5√2 ≈ 12,07 km). Cette fois la ligne brisée gagne, de 0,50 km.
 */
export const TEST = {
  source: addition('synthesis_generation'),
  title: 'وضعية أخرى: مسلكان للدراجات الجبلية في غابة جبل الوحش بقسنطينة',
  text: 'يتدرّب درّاجان على مسلكين في غابة جبل الوحش بقسنطينة، مرسومين في معلم متعامد ومتجانس حيث $1\\,\\mathrm{cm}$ يمثّل $1\\,\\mathrm{km}$ . المسلك (1) من $C(-3\\,;\\,0)$ إلى $D(5\\,;\\,0)$ مكوّن من نصفي دائرتين قطراهما $[CK]$ و $[KD]$ حيث $K(1\\,;\\,0)$ . المسلك (2) خط منكسر يمرّ على الترتيب بالنقط $E(-3\\,;\\,7)$ ثم $F(0\\,;\\,3)$ ثم $G(3\\,;\\,6)$ ثم $H(5\\,;\\,4)$ . يحرص الدرّاجان على نظافة الغابة وعلى ألّا يتركا فيها أثرًا.',
};
