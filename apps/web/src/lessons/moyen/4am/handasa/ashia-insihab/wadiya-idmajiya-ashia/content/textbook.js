import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — le « أستعدّ » du manuel (p. 128, items 1–7) appartient aux leçons 1 et 2 (extraction ›
 * destinations › prep) : la synthèse n'en reçoit aucun. Ses affirmations sont donc des AFFIRMATIONS DE LA PLATEFORME
 * (« عبارة إضافية من المنصّة »), dans la forme du manuel, sur ce que la وضعية et l'épreuve finale mobilisent :
 * l'égalité de deux vecteurs (درس 1), l'image par une translation (درس 1), AB = DC ⇔ ABCD متوازي أضلاع et l'ordre des
 * lettres (درس 2), la relation de Chasles (درس 3), et trois outils des années précédentes — la distance entre deux
 * parallèles, l'inégalité triangulaire, Pythagore — plus la droite des milieux (ex. 22). Quatre vraies, quatre
 * fausses ; jamais les nombres de la وضعية (7, 6, 2).
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'tasawi', text: 'إذا كان $KL = RS$ (طولان متساويان) فإنّ $\\overrightarrow{KL} = \\overrightarrow{RS}$ .', answer: false,
    why: 'تساوي الطولين لا يكفي: شعاعان متساويان لهما نفس المنحى ونفس الاتجاه ونفس الطول. مثلا $\\overrightarrow{KL}$ و $\\overrightarrow{LK}$ لهما نفس الطول وهما متعاكسان.', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'sura', text: 'إذا كانت $E$ صورة $F$ بالانسحاب الذي شعاعه $\\overrightarrow{UV}$ فإنّ $\\overrightarrow{FE} = \\overrightarrow{UV}$ .', answer: true,
    why: 'صورة نقطة F بالانسحاب الذي شعاعه $\\overrightarrow{UV}$ هي النقطة E حيث $\\overrightarrow{FE} = \\overrightarrow{UV}$ : الشعاع يبدأ من النقطة وينتهي عند صورتها.', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'tartib', text: 'K و L و P و Q أربع نقط ليست على استقامة واحدة. إذا كان $\\overrightarrow{KL} = \\overrightarrow{PQ}$ فإنّ الرباعي KLPQ متوازي أضلاع.', answer: false,
    why: '$\\overrightarrow{KL} = \\overrightarrow{PQ}$ يعني أنّ KLQP متوازي أضلاع (ترتيب الرؤوس): الضلعان المتقابلان هما [KL] و [QP]. أمّا KLPQ فهو رباعي متقاطع الأضلاع.', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'shal', text: 'من أجل كل ثلاث نقط R و S و T لدينا $\\overrightarrow{RS} + \\overrightarrow{ST} = \\overrightarrow{RT}$ .', answer: true,
    why: 'هذه علاقة شال: نهاية الشعاع الأول هي مبدأ الثاني، والمجموع يبدأ من مبدأ الأول وينتهي عند نهاية الثاني.', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'bud', text: '(d) و (d′) مستقيمان متوازيان. كل قطعة مستقيمة تصل نقطة من (d) بنقطة من (d′) طولها هو المسافة بين المستقيمين.', answer: false,
    why: 'المسافة بين مستقيمين متوازيين هي طول قطعة عمودية عليهما، وهي أقصر من كل قطعة مائلة تصلهما.', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'mutabayina', text: 'من أجل كل نقطة M لدينا $SM + MT \\geq ST$ ، والمساواة $SM + MT = ST$ صحيحة فقط إذا كانت M نقطة من القطعة [ST].', answer: true,
    why: 'المتباينة المثلثية: الطريق المستقيم من S إلى T هو الأقصر، وكل مرور بنقطة خارج [ST] يطيله.', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'fithaghuris', text: 'في المثلث RST القائم في S حيث $RS = 9$ و $ST = 12$ ، لدينا $RT = 15$ .', answer: true,
    why: 'خاصية فيثاغورس: $RT^2 = 9^2 + 12^2 = 81 + 144 = 225$ ومنه $RT = 15$ .', source: addition('prerequisite_diagnostic') },
  { n: 8, skill: 'muntasafayn', text: 'في المثلث UVW، إذا كانت I منتصف [UV] و J منتصف [UW] فإنّ (IJ)//(VW) و $IJ = VW$ .', answer: false,
    why: 'خاصية مستقيم المنتصفين: (IJ)//(VW) لكن $IJ = \\dfrac{VW}{2}$ ، نصف طول الضلع الثالث.', source: addition('prerequisite_diagnostic') },
];

/**
 * « أدمج تعلّماتي » (p. 136) — la وضعية « ممر الراجلين », au mot près, et son « تحليل الوضعية » en trois étapes NOMMÉES
 * par le manuel. Le manuel ne donne AUCUN nombre : l'exemple chiffré est celui de la plateforme (extraction ›
 * situation › answer › illustration, déclaré) — sur la ورقة مرصوفة, la route a 2 carreaux de large, A est 3 carreaux
 * au-dessus du bord haut, B 3 carreaux au-dessous du bord bas, 7 carreaux d'écart : B′ est 1 carreau sous le bord bas,
 * M au milieu de l'écart horizontal (3,5 carreaux de A), le minimum √85 + 2 ≈ 11,22.
 * `questions` : ce que la مذكرة du professeur lit (buildLessonMemo › SITUATION).
 */
export const SITUATION = {
  source: src('situation', 136, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: 'تجنُّبا لحوادث المرور الأليمة، قرّرت إحدى البلديات وضع ممر الراجلين بين حافتين متوازيتين للطريق وهذا لأجل مساعدة أطفال الحي للتنقل إلى المدرسة بأمان. حدّد موقع الممر بحيث يكون طول المسلك من A إلى B مرورا بالموضعين M و N أقصر ما يمكن.',
  questions: [
    'نُعبّر على طول المسلك بـ: AM + MN + NB ما هي النقط الثابتة و النقط المتغيّرة؟',
    'ما هو أقصر مسافة بين مستقيمين متوازيين؟ وفي حالة نقطتين متمايزتين A و B′ ما هو الشرط الذي تحقّقه النّقطة M حتى تكون AM + MB′ أقصر ما يمكن؟',
    'تعيين B′ صورة B بالإنسحاب الذي شعاعه NM ودراسة الشكل الرباعي MB′BN، ثم تعيين موقعي M و N.',
  ],
  closing: 'الانسحاب الذي شعاعه NM ينقل B إلى B′ ويجعل MB′BN متوازي أضلاع، فيصبح المسلك AM + MB′ + MN: أقصر ما يمكن عندما تكون M على [AB′].',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', items: ['نُعبّر على طول المسلك بـ: $AM + MN + NB$ ما هي النقط الثابتة و النقط المتغيّرة؟'] },
    { label: 'تحليل الوضعية واختيار استراتيجية حل', items: ['إنجاز شكل هندسي لتمثيل الوضعية. ما هي أقصر مسافة بين مستقيمين متوازيين؟', "في حالة نقطتين متمايزتين A و B′ ما هو الشرط الذي تحقّقه النّقطة M حتى تكون $AM + MB'$ أقصر ما يمكن.", 'التفكير في استبدال المسلك المطلوب بمسلك له نفس الطول.'] },
    { label: 'تنفيذ استراتيجية الحل المختارة', items: ['تعيين B′ صورة B بالإنسحاب الذي شعاعه $\\overrightarrow{NM}$ . دراسة الشكل الرباعي MB′BN.', "ما هو موقع النقطة M حتى يكون $AM + MB'$ أقصر ما يمكن؟ ما هو موقع النقطة N؟"] },
  ],
  // L'exemple chiffré de la plateforme (en carreaux) : bords y = 0 et y = 2, A(−3 ; 5), B(4 ; −3) — les nombres du lab متقدم.
  numbers: { width: 2, A: [-3, 5], B: [4, -3] },
  example: addition('synthesis_generation'),
};

/** Le texte d'une analyse (puces du manuel) en une ligne. */
export const analysisText = (a) => a.items.map((s) => `• ${s}`).join(' ');

/**
 * Les props du laboratoire du module 7 — `bridge-path` (écrit pour cette leçon : logic/bridgePath.js,
 * vectors/BridgePath.jsx), écrites ici une fois : le module les étale, le test de rendu (lab.render.test.jsx) monte le
 * workspace avec ces mêmes objets.
 *   مبتدئ  une passerelle sur la gorge du Rhummel à Constantine (`bridge`) : A 1 carreau au-dessus, B 2 au-dessous,
 *          3 d'écart, gorge de 2 — la place optimale (1 carreau de A) n'est pas au milieu ; un fantôme de NM attaché à B ;
 *   متقدم  la وضعية du manuel (`crosswalk`) avec les nombres de l'exemple : minimum √85 + 2 ≈ 11,22, M à 3,5 carreaux
 *          de A ; aucune aide pour poser B′.
 */
export const LAB = {
  beginner: { numbers: { width: 2, A: [0, 3], B: [3, -2] }, theme: 'bridge' },
  advanced: { numbers: SITUATION.numbers, theme: 'crosswalk' },
};
/** Ce que le lab fait trouver (vérifié par lab.render.test.jsx) : B′, la place de M (abscisse), le minimum. */
export const LAB_EXPECT = {
  beginner: { Bp: [3, 0], x: '1', min: '3√2 + 2', total: '6,24' },
  advanced: { Bp: [4, -1], x: '0,5', min: '√85 + 2', total: '11,22' },
};

/**
 * Les phrases de la correction du module 7, importées aussi par knowledge.jsx et la carte (knowledgeGraph.js) :
 * une aide de la carte cite la leçon mot pour mot. Toute égalité dans `$…$`.
 */
export const REMARKS = {
  example: 'مثال من المنصّة (الكتاب لا يعطي أعدادا): على ورقة مرصوفة، عرض الطريق مربعان، الحي A فوق الحافة العليا بثلاثة مربعات، والمدرسة B تحت الحافة السفلى بثلاثة مربعات، والمسافة الأفقية بينهما سبعة مربعات.',
  // قراءة
  thabit: 'A (الحي) و B (المدرسة) ثابتتان، والطول MN ثابت لأنه عرض الطريق (الممر عمودي على الحافتين)؛ أمّا M و N فمتغيّرتان: تتحرّكان مع الممر.',
  bud: 'أقصر مسافة بين مستقيمين متوازيين هي طول قطعة عمودية عليهما: لهذا يكون الممر عموديا على الحافتين، وطوله MN هو عرض الطريق.',
  mutabayina: "من أجل كل نقطة M لدينا $AM + MB' \\geq AB'$ ، والمساواة فقط إذا كانت M على القطعة $[AB']$ .",
  // تحليل : remplacer le trajet par un trajet de même longueur
  istibdal: "B′ صورة B بالانسحاب الذي شعاعه $\\overrightarrow{NM}$ معناه $\\overrightarrow{BB'} = \\overrightarrow{NM}$ .",
  mutawazi: "$\\overrightarrow{NM} = \\overrightarrow{BB'}$ ، فالرباعي MB′BN متوازي أضلاع (ضلعاه المتقابلان [NM] و [BB′]) ومنه $NB = MB'$ .",
  masar: "$AM + MN + NB = AM + MB' + MN$ : المسلك المطلوب له نفس طول المسلك من A إلى B′ مرورا بـ M، زائد عرض الطريق الثابت.",
  // تنفيذ
  M: "MN ثابت، فالمسلك أقصر ما يمكن عندما يكون $AM + MB'$ أصغر ما يمكن، أي عندما تكون M على $[AB']$ : M نقطة تقاطع $[AB']$ مع الحافة العليا.",
  N: 'N صورة M بالانسحاب الذي شعاعه $\\overrightarrow{MN}$ : المسقط العمودي للنقطة M على الحافة السفلى.',
  min: "أقصر طول للمسلك هو $AB' + MN$ .",
  // l'exemple chiffré
  Bp: 'في المثال: B تحت الحافة السفلى بثلاثة مربعات، و $\\overrightarrow{NM}$ يصعد مربعين، فالنقطة B′ تحت الحافة السفلى بمربع واحد.',
  ABp: "من A إلى B′: سبعة مربعات أفقيا وستة شاقوليا (3 + 2 + 1)، فحسب خاصية فيثاغورس $AB'^2 = 7^2 + 6^2 = 85$ و $AB' = \\sqrt{85}$ .",
  Lmin: "أقصر مسلك: $L = AB' + MN = \\sqrt{85} + 2 \\approx 11{,}22$ ضلع مربع.",
  AB: 'الطول $AB = \\sqrt{7^2 + 8^2} = \\sqrt{113} \\approx 10{,}63$ أصغر من ذلك، لكنه ليس طول مسلك ممكن: لا يمكن عبور الطريق مائلا على [AB]، فالممر عمودي على الحافتين.',
  sym: 'في المثال، A و B على نفس البعد من الطريق (ثلاثة مربعات)، فالنقطة M في منتصف المسافة الأفقية و $AM = NB$ ؛ لو تغيّر بعد B لتغيّر موقع M (المختبر، المستوى المبتدئ).',
  // la carte : l'erreur « la ligne droite [AB] » (MISC-SHUAA-MAMAR-MUBASHIR)
  mubashirWrong: 'نصل A بـ B بقطعة مستقيمة ونضع الممر حيث تقطع [AB] حافة الطريق.',
  mubashirWhy: 'الممر عمودي على الحافتين وطوله ثابت، فالمسلك لا يتبع [AB]: مرورا بموضع تقاطع [AB] مع الحافة يكون المسلك أطول من الأقصر.',
  mubashirRight: "ننقل B بالانسحاب الذي شعاعه $\\overrightarrow{NM}$ إلى B′ ثم نصل A بـ B′.",
  // la carte : l'erreur de sens (MISC-SHUAA-ITTIJAH-MUAKKAS)
  ittijahWrong: "ننقل B بالانسحاب الذي شعاعه $\\overrightarrow{MN}$ .",
  ittijahWhy: "$\\overrightarrow{MN}$ و $\\overrightarrow{NM}$ متعاكسان: B تنزل بدل أن تصعد، فلا يكون MB′BN متوازي أضلاع ولا يتحقّق $NB = MB'$ .",
  ittijahRight: "$\\overrightarrow{BB'} = \\overrightarrow{NM}$ : نفس منحى الممر ونفس اتجاهه من N نحو M ونفس طوله.",
  tajnid: 'في كل وضعية نبحث عن الأشعة المتساوية التي يعطيها الانسحاب، ثم عن متوازي الأضلاع الذي ينقل طولا إلى مكان آخر، ثم عن الخط المستقيم الذي يعطي أقصر مسافة.',
};

/** Les titres des leçons du propriétaire (catalogue). */
export const LESSON_TITLES = {
  'insihab-shuaa': 'الدرس 1 — مفهوم الانسحاب والشعاع وتساوي شعاعين',
  'shuaayn-mutasawiyayn': 'الدرس 2 — الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة',
  'majmu-shuaayn': 'الدرس 3 — مجموع شعاعين (علاقة شال وقاعدة متوازي الأضلاع)',
  'barahin-ashia': 'الدرس 4 — حل مشكلات وإنجاز براهين بتوظيف الأشعة والانسحاب',
};

/**
 * « وضعية الاختبار النهائي » (module 8) — la وضعية TRANSPOSÉE (`synthesis_generation`) : mêmes ressources, autres nombres, pour
 * que les réponses n'apparaissent nulle part ailleurs dans la leçon. Une passerelle au-dessus de l'autoroute à Oran
 * (un carreau = 10 m) : largeur 30 m, la station du tramway A à 20 m au-dessus du bord haut, le stade B à 40 m au-dessous
 * du bord bas, 90 m d'écart horizontal. B′ est 10 m sous le bord bas ; AB′ = √(90² + 60²) = 30√13 ≈ 108,17 m ;
 * minimum ≈ 138,17 m ; M à 30 m de la verticale de A (un tiers de l'écart).
 */
export const TEST = {
  source: addition('synthesis_generation'),
  title: 'وضعية أخرى: جسر للراجلين فوق الطريق السيار بوهران',
  text: 'حفاظًا على سلامة المشجّعين وحرصًا على وصولهم في الوقت، قرّرت ولاية وهران بناء جسر للراجلين [MN] فوق الطريق السيار، عموديا على حافتيه المتوازيتين، ليعبر المشجّعون من محطة الترامواي A إلى الملعب B. على الخريطة (ورقة مرصوفة، ضلع المربع يمثّل $10\\,\\mathrm{m}$ ): عرض الطريق $30\\,\\mathrm{m}$ ، والمحطة A فوق الحافة العليا بـ $20\\,\\mathrm{m}$ ، والملعب B تحت الحافة السفلى بـ $40\\,\\mathrm{m}$ ، والمسافة الأفقية بين A و B تساوي $90\\,\\mathrm{m}$ . نريد أن يكون طول المسلك من A إلى B مرورا بـ M ثم N أقصر ما يمكن.',
};
