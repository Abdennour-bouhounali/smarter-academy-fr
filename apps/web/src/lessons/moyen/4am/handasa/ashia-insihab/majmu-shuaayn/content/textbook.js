/**
 * Le contenu du درس 3 « مجموع شعاعين (علاقة شال وقاعدة متوازي الأضلاع) » (unité 11, manuel pp. 127–138) — données
 * pures (aucun JSX). Chaque bloc porte sa `source` :
 *
 *   challenge      تحدّ p. 127 (page d'unité, DOUBLON DÉCLARÉ — extraction › destinations › challenge › duplicatedIn :
 *                  « l'entrée de la leçon ») — module 1, résolu au module 2 (réponse calculée de l'extraction) ;
 *   act-3, act-4   أنشطة p. 129 — module 1 ;
 *   intro-chasles  مدخل الباب p. 127 (DOUBLON DÉCLARÉ, la note d'histoire) — module 2 ;
 *   know-4, 5, 6   معارف p. 132 — module 2 ;
 *   method-sum, now-133 (item 2), tice (p. 138) — module 3 ;
 *   ex-10 … ex-16  content/exercises.js (module 4) ; QCM 4, 5, 7 (p. 136, doublon déclaré) — module 5.
 *
 * Les textes du manuel sont au mot près (extraction, `verified: true`). Lectures et complétions de l'extraction reprises :
 * les débuts de lignes de نشاط 4 coupés par la marge (complétés), l'étiquette illisible de la flèche du courant (le texte
 * suffit), le TP où « انقر على النقطة D » vient sans que D ait été créé (la plateforme ajoute « ارسم نقطة D »), la commande
 * floue « Vecteur(A;B)?Vecteur(A;C) » lue « + ». Les noms d'outils GeoGebra sont ceux, FRANÇAIS, du manuel : du code LTR
 * isolé (LRI … PDI), jamais traduit.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
export const LP = {
  P1: '4am_majmu-shuaayn_P1',
  P2: '4am_majmu-shuaayn_P2',
  P3: '4am_majmu-shuaayn_P3',
  P4: '4am_majmu-shuaayn_P4',
};
/** Un nom d'outil ou une commande GeoGebra : code LTR isolé dans une phrase arabe (ARABIC_RTL_CONTRACT). */
const gg = (s) => `⁦${s}⁩`;

/* ── module 1 : le تحدّ, نشاط 3 et نشاط 4 ─────────────────────────────────────── */

/** تحدّ (p. 127), au mot près (unités dans les îlots : ARABIC_RTL_CONTRACT « A unit after a math island »). */
export const CHALLENGE = {
  source: src('challenge', 127, 'تحدّ'),
  text: 'انطلق سبّاح محترف، يتدرّب بجدّ وإتقان، من الموقع A وهو يريد الوصول إلى الموقع B من النهر. المسار [AB] عمودي على حافتي هذا النهر (الشكل). في تلك اللحظة، و للأسف، اشتد تيار الماء في النهر حيث بلغت سرعته $2\\,\\mathrm{km/h}$ . إذا علمت أن سرعة السبّاح هي $4\\,\\mathrm{km/h}$ ، ففي أيّ اتجاه ينبغي عليه السباحة حتى يصل إلى النقطة B؟',
  ariaLabel: 'نهر بين حافتين: النقطة A على الحافة القريبة والنقطة B مقابلتها على الحافة الأخرى، والمسار [AB] عمودي على الحافتين، وسهم سرعة التيار 2 km/h يتجه من اليسار إلى اليمين',
  numbers: { swim: 4, current: 2 },
};

/** La وضعية de lancement pour la مذكرة du professeur (`ACTIVITY` : situation, questions, closing, source). */
export const ACTIVITY = {
  source: CHALLENGE.source,
  situation: CHALLENGE.text,
  text: CHALLENGE.text,
  questions: [
    'إذا سبح نحو B مباشرة، هل يصل إليها؟ لماذا؟',
    'ما السرعة الفعلية للسبّاح؟ كيف ننشئ شعاعها انطلاقا من شعاعي سرعته الذاتية وسرعة التيار؟',
    'في أيّ اتجاه ينبغي أن يسبح حتى يصل إلى B؟ وما سرعته الفعلية حينئذ؟',
  ],
  closing: 'الحركة الفعلية هي مجموع شعاعين: انسحابان متتابعان يعطيان انسحابا واحدا، وشعاعه هو مجموع الشعاعين.',
};

/** Le monde du niveau مبتدئ (plateforme) : la trottinette électrique louée dans Alger. */
export const SCOOTER = {
  source: PLATFORM,
  text: 'ياسين يستأجر دراجة كهربائية بالتطبيق في وسط الجزائر العاصمة ليساعد والدته في قضاء حاجاتها: مشوار أول من المحطة A إلى المحطة B، ثم مشوار ثانٍ. أين يبدأ المشوار الثاني؟ وما الانتقال الذي قام به فعلا من A؟',
};

/** نشاط 3 (p. 129), au mot près ; figure : content/figures.js › FIG_ACT3. */
export const ACT3 = {
  source: src('act-3', 129, 'أنشطة', 3),
  title: 'مجموع شعاعين',
  parts: [
    '1) انقل الشكل المقابل على ورقة مرصوفة حيث ABC مثلث و M نقطة من المستوي.',
    '2) أنشئ النقطة M′ صورة M بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ .',
    '3) عيّن النقطة M″ صورة M′ بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ .',
    '4) ما هي طبيعة كل من الرباعيين AMM′B و BM′M″C؟',
    '5) برهن أن الرباعي ACM″M متوازي أضلاع. ما هي صورة M بالانسحاب الذي شعاعه $\\overrightarrow{AC}$ ؟',
    '6) بتطبيق الانسحاب الذي شعاعه $\\overrightarrow{AB}$ متبوعا بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ ؛ ما هو الانسحاب الذي نتحصل عليه؟',
    '7) انقل وأتمم: «مجموع الشعاعين … و … يساوي الشعاع …»',
  ],
  after: 'الانسحاب الذي وجدته يسمح لنا بكتابة المساواة: $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ . هذه المساواة تسمى علاقة «شال».',
};

/** نشاط 4 (p. 129), au mot près (débuts de lignes complétés par l'extraction) ; figure : FIG_ACT4. */
export const ACT4 = {
  source: src('act-4', 129, 'أنشطة', 4),
  title: 'إنشاء ممثل لمجموع شعاعين',
  intro: 'A، B، C ثلاث نقط ليست على استقامة واحدة. (الشكل)',
  parts: [
    '1) أنشئ ممثلا للشعاع $\\overrightarrow{AB} + \\overrightarrow{BC}$ .',
    '2) أنشئ النقطة D بحيث الرباعي ABCD متوازي أضلاع.',
    '3) أنشئ ممثلا للشعاع $\\overrightarrow{AB} + \\overrightarrow{AD}$ .',
    '4) عيّن ممثلا للشعاع $\\overrightarrow{AB} + \\overrightarrow{BA}$ ثم للشعاع $\\overrightarrow{BA} + \\overrightarrow{AB}$ .',
    '5) قارن بين الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ .',
  ],
  afterZero: 'نقول أن كلا من الشعاعين $\\overrightarrow{AA}$ و $\\overrightarrow{BB}$ هو الشعاع المعدوم ونرمز له بالرمز $\\vec{0}$ .',
  afterOpposite: 'نقول عن الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ أنهما متعاكسان ونكتب $\\overrightarrow{AB} = -\\overrightarrow{BA}$ .',
};

/* ── module 2 : معارف ─────────────────────────────────────────────────────── */

/** مدخل الباب (p. 127) — l'encadré « ميشال شال », extrait (doublon déclaré, la note d'histoire). */
export const HISTORY = {
  source: src('intro-chasles', 127, 'مدخل الباب'),
  title: 'ميشال شال (1793م-1880م)',
  text: 'فيما يخص ميشال شال، لقد اهتم بدوره بإبراز الأهمية التي تتضمنها التحويلات الهندسية المحافظة لبعض الخواص مثل الاستقامية، التوازي... إنه يُعتبر أحد الباحثين الذين قدموا نتائج هامة في ميدان الحساب الشعاعي. ورغم أنه لم يكتب بصفة صريحة العلاقة الشعاعية، فقد نُسبت إليه وحملت اسمه إلى يومنا هذا: «علاقة شال» وهي $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ .',
};

/** معارف 4 (p. 132), au mot près. */
export const KNOW4 = {
  source: src('know-4', 132, 'معارف', 4),
  title: 'مجموع شعاعين',
  images: 'A، B، C ثلاث نقط. إذا كانت صورة نقطة كيفية M بالانسحاب الذي شعاعه $\\overrightarrow{AB}$ هي M′ و صورة M′ بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ هي M″ فإن: M″ هي صورة M بالانسحاب الذي شعاعه $\\overrightarrow{AC}$ . ونقول $\\overrightarrow{AC}$ هو مجموع الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BC}$ .',
  sum: 'A، B، C ثلاث نقط. مجموع الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BC}$ هو الشعاع $\\overrightarrow{AC}$ . نكتب $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ . المساواة $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ تسمى علاقة شـال (لاحظ أن نهاية الشعاع $\\overrightarrow{AB}$ هو مبدأ الشعاع $\\overrightarrow{BC}$).',
  zero: 'إذا كانت A منطبقة على B، نقول أن $\\overrightarrow{AB}$ هو الشعاع المعدوم ويرمز إليه بـ $\\vec{0}$ . لدينا $\\overrightarrow{AA} = \\overrightarrow{BB} = \\vec{0}$ .',
};

/** معارف 5 (p. 132), au mot près ; figure : FIG_KNOW5. */
export const KNOW5 = {
  source: src('know-5', 132, 'معارف', 5),
  title: 'الشعاعان المتعاكسان',
  text: 'A، B نقطتان. نعلم أنّ $\\overrightarrow{BA} + \\overrightarrow{AB} = \\vec{0}$ . نقول أن الشعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{BA}$ متعاكسان، ونكتب $\\overrightarrow{BA} = -\\overrightarrow{AB}$ . للشعاعين المتعاكسين نفس الطول، ونفس المنحى واتجاهين متعاكسين.',
  example: 'مثال: الشعاعان $\\vec{u}$ و $\\vec{v}$ متعاكسان. $\\vec{v} = -\\vec{u}$',
};

/** معارف 6 (p. 132), au mot près ; figure : FIG_KNOW6. */
export const KNOW6 = {
  source: src('know-6', 132, 'معارف', 6),
  title: 'قاعدة متوازي الأضلاع',
  property: 'A، B و C ثلاث نقط ليست على استقامية. $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ معناه ABDC متوازي أضلاع.',
  remark: 'ملاحظة: D هي نظيرة A بالنسبة إلى منتصف القطر [BC].',
};

/** Retour au تحدّ (module 2) : la réponse CALCULÉE de l'extraction (challenge › answer), ligne à ligne. */
export const CHALLENGE_SOLVED = {
  source: CHALLENGE.source,
  lines: [
    'سرعة السبّاح بالنسبة إلى الماء $\\vec{s}$ (طويلتها 4) وسرعة التيار $\\vec{c}$ (طويلتها 2): الحركة الفعلية هي $\\vec{s} + \\vec{c}$ ، قطر متوازي الأضلاع ASDC المنشأ على الشعاعين من A ، ويجب أن تكون على منحى (AB).',
    'التيار عمودي على (AB): المثلث ACD قائم في A ، وتره [CD] يساوي طول $\\vec{s}$ أي 4 ، والضلع [AC] المقابل للزاوية θ بين $\\vec{s}$ و (AB) طوله 2.',
    '$\\sin\\theta = \\dfrac{2}{4} = \\dfrac{1}{2}$ ومنه $\\theta = 30^{\\circ}$ : يسبح عكس التيار (نحو أعلى النهر) بزاوية $30^{\\circ}$ مع (AB)، أي $60^{\\circ}$ مع الحافة.',
    'سرعته الفعلية: $AD = \\sqrt{4^2 - 2^2} = \\sqrt{12} = 2\\sqrt{3} \\approx 3{,}46\\,\\mathrm{km/h}$ .',
  ],
  bridge: 'الجيب والحاسبة من الوحدة 10 (حساب المثلثات) يعطيان الزاوية: الأشعة تبني الشكل، والنسب المثلثية تحسبه.',
};

/* ── module 3 : طرائق ────────────────────────────────────────────────────── */

/** طرائق (p. 133) « إنشاء ممثل لمجموع شعاعين », au mot près ; figures : FIG_METHOD, FIG_METHOD_SOL. */
export const METHOD = {
  source: src('method-sum', 133, 'طرائق'),
  title: 'إنشاء ممثل لمجموع شعاعين',
  exercise: 'تمرين: 1) لاحظ الشكل المقابل ثم انقله. أنشئ النقطة M حيث $\\overrightarrow{CM} = \\overrightarrow{AB}$ . 2) أنشئ النقطة N حيث $\\overrightarrow{AN} = \\overrightarrow{AB} + \\overrightarrow{AD}$ .',
  solution: [
    'حل: 1) $\\overrightarrow{CM} = \\overrightarrow{AB}$ يعني الرباعي ABMC متوازي أضلاع أي [AM] و [BC] لهما نفس المنتصف.',
    'و بالتالي M هي نظيرة A بالنسبة إلى I منتصف [BC] (الشكل).',
    '2) لإنشاء $\\overrightarrow{AB} + \\overrightarrow{AD}$ نعيّن شعاعا مبدؤه B ويساوي $\\overrightarrow{AD}$ وليكن $\\overrightarrow{BE}$ .',
    'أي $\\overrightarrow{BE} = \\overrightarrow{AD}$ ومنه $\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AB} + \\overrightarrow{BE} = \\overrightarrow{AE}$ (حسب علاقة شال).',
    'ينتج أن $\\overrightarrow{AN} = \\overrightarrow{AE}$ أي N تنطبق على E.',
  ],
  rule: 'طريقة: لإنشاء ممثل لمجموع شعاعين يمكن استعمال علاقة شال أو قاعدة متوازي الأضلاع.',
};

/** دوري الآن (p. 133), item 2, au mot près ; figure : FIG_NOW133. */
export const NOW = {
  source: { ...src('now-133', 133, 'دوري الآن'), item: 2 },
  text: 'ABCD مستطيل. أ) أنشئ ممثلا لكل شعاع من الشعاعين التاليين: $\\overrightarrow{AB} + \\overrightarrow{BD}$ ، $\\overrightarrow{DA} + \\overrightarrow{DB}$ . ب) أنشئ الممثل الذي مبدؤه A للشعاع $\\overrightarrow{AC} + \\overrightarrow{BC}$',
};

/** أوظّف تكنولوجيات الإعلام والاتصال (p. 138), parties 2 à 4 au mot près — outils GeoGebra en code LTR isolé. */
export const TICE = {
  source: src('tice', 138, 'أوظّف تكنولوجيات الإعلام و الاتصال'),
  title: 'الأشعة و الانسحاب باستخدام البرمجية جيوجبرا',
  steps: [
    `ارسم نقطتين A و B كما في الجزء 1 ثم نقطة C، وارسم الشعاعين بالأداة ${gg('Vecteur')} .`,
    `احجز ${gg('Saisie Vecteur(A;B)+Vecteur(A;C)')} فيظهر ممثل w للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ .`,
    `انقر على [أداة] و اختر [شعاع من نقطة] ثم انقر على الشعاع $\\vec{w}$ و على النقطة A فنحصل على شعاع $\\overrightarrow{AA'}$ .`,
    `انقر على [أداة] و اختر ${gg('Relation')} و انقر على $\\vec{w}$ ثم على $\\overrightarrow{AA'}$ . ماذا تلاحظ؟`,
    `ارسم نقطة M و الممثل $\\overrightarrow{ME}$ للشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ . استعمل الأيقونة ${gg('Relation')} لمقارنة الشعاعين $\\overrightarrow{ME}$ و $\\overrightarrow{AB} + \\overrightarrow{AC}$ . ماذا تلاحظ؟ اشرح.`,
    'ارسم نقطة D.',
    `انقر على [أداة الدائرة] و اختر ${gg('Cercle (centre-rayon)')} و انقر على النقطة D و احجز 1 في النافذة الظاهرة ثم ${gg('OK')} و تظهر الدائرة (Γ) التي مركزها D و نصف قطرها 1.`,
    `انقر على [أداة] و اختر ${gg('Translation')} و اضغط على الدائرة (Γ) ثم على الشعاع $\\overrightarrow{BC}$ فتظهر الدائرة (Γ′) صورة (Γ) بالانسحاب الذي شعاعه $\\overrightarrow{BC}$ .`,
  ],
  /** L'index de la ligne AJOUTÉE par la plateforme (le manuel clique sur D sans l'avoir créé). */
  addedStep: 5,
  addedSource: addition('interaction_generation'),
  note: 'أضافت المنصّة الخطوة «ارسم نقطة D»: الكتاب يطلب النقر على النقطة D دون أن يطلب رسمها من قبل.',
};

/* ── les phrases que les modules écrivent et que la carte reprend mot pour mot (A.10) ── */

export const REMARKS = {
  chainEnd: 'لاحظ أن نهاية الشعاع $\\overrightarrow{AB}$ هي مبدأ الشعاع $\\overrightarrow{BC}$ : المجموع يبدأ من مبدأ الأول وينتهي عند نهاية الثاني.',
  reverseWrong: '$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{CA}$',
  reverseWhy: 'الانسحاب المحصّل ينقل A إلى C لا C إلى A: الدراجة انطلقت من A ووصلت إلى C.',
  reverseRight: '$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ : من مبدأ الأول إلى نهاية الثاني.',
  gapWarning: 'علاقة شال لا تُطبَّق على $\\overrightarrow{AB} + \\overrightarrow{CD}$ إلا إذا كانت نهاية الأول هي بداية الثاني: الدراجة لا تقفز من B إلى C.',
  lengthsWrong: 'سرعة السبّاح الفعلية $4 + 2 = 6\\,\\mathrm{km/h}$ لأن السرعتين تُجمعان.',
  lengthsWhy: 'نجمع الشعاعين لا الطولين: السرعة الفعلية قطر متوازي الأضلاع المنشأ على $\\vec{s}$ و $\\vec{c}$ ، والمشوار المنعطف أطول من الخط المستقيم.',
  lengthsRight: 'الطولان لا يُجمعان إلا إذا كان للشعاعين نفس المنحى ونفس الاتجاه: هنا $AD = 2\\sqrt{3} \\approx 3{,}46\\,\\mathrm{km/h}$ .',
  diagonalWrong: 'في متوازي الأضلاع ABDC: $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{BC}$ .',
  diagonalWhy: '[BC] هو القطر الآخر: لا يمرّ بالمبدأ المشترك A.',
  diagonalRight: 'المجموع هو القطر الصادر من المبدأ المشترك: $\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ .',
  zeroNumber: '$\\overrightarrow{AB} + \\overrightarrow{BA}$ هو الشعاع المعدوم $\\vec{0}$ ، لا العدد 0: نقطة البداية ونقطة النهاية واحدة.',
  takeaway: 'شعاعان متعاقبان: علاقة شال؛ شعاعان لهما نفس المبدأ: قاعدة متوازي الأضلاع؛ والشعاعان المتعاكسان مجموعهما الشعاع المعدوم.',
};

/* ── module 0 : « أستعدّ » (plateforme — les items du manuel vont aux leçons 1 et 2) ── */

export const PREP_ITEMS = [
  { skill: 'sura', text: 'إذا كانت N′ صورة N بالانسحاب الذي شعاعه $\\overrightarrow{EF}$ فإن $\\overrightarrow{N\'N} = \\overrightarrow{EF}$ .', answer: false, why: 'صورة N هي N′ حيث $\\overrightarrow{NN\'} = \\overrightarrow{EF}$ : من النقطة إلى صورتها، لا من الصورة إلى النقطة.', source: addition('prerequisite_diagnostic') },
  { skill: 'anasir', text: 'للشعاعين $\\overrightarrow{RS}$ و $\\overrightarrow{SR}$ نفس المنحى ونفس الطول.', answer: true, why: 'كلاهما محمول على المستقيم (RS) وطوله RS ؛ يختلفان في الاتجاه فقط (من R نحو S أو من S نحو R).', source: addition('prerequisite_diagnostic') },
  { skill: 'tasawi', text: 'K، L، M، N أربع نقط ليست على استقامة واحدة. إذا كان $\\overrightarrow{KL} = \\overrightarrow{NM}$ فإن الرباعي KLMN متوازي أضلاع.', answer: true, why: '$\\overrightarrow{KL} = \\overrightarrow{NM}$ تعني أن [KM] و [LN] لهما نفس المنتصف: KLMN متوازي أضلاع (انتبه إلى ترتيب الحروف).', source: addition('prerequisite_diagnostic') },
  { skill: 'muntasaf', text: 'إذا كانت H نظيرة E بالنسبة إلى النقطة O فإن E منتصف القطعة [OH].', answer: false, why: 'O هي منتصف [EH]: النظيرة بالنسبة إلى O تعني أن O في منتصف المسافة بين E و H.', source: addition('prerequisite_diagnostic') },
  { skill: 'fithaghuras', text: 'مثلث قائم ضلعا زاويته القائمة 5 و 12، طول وتره 13.', answer: true, why: 'حسب خاصية فيثاغورس: $5^2 + 12^2 = 25 + 144 = 169 = 13^2$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'jayb', text: 'في المثلث RST القائم في R: $\\sin\\widehat{S} = \\dfrac{RS}{ST}$ .', answer: false, why: 'الجيب = المقابل ÷ الوتر: المقابل للزاوية S هو [RT] ، فـ $\\sin\\widehat{S} = \\dfrac{RT}{ST}$ ( $\\dfrac{RS}{ST}$ هو جيب التمام).', source: addition('prerequisite_diagnostic') },
];

/* ── module 5 : « إختبار أولي » — les QCM 4, 5, 7 du manuel et deux situations de la plateforme ── */

export const QCM_SOURCE = (n) => ({ ...src('qcm', 136, 'أؤكّد تعلّماتي'), item: n });
export const TEST = {
  source: PLATFORM,
  title: 'خمسة أسئلة: انسحابان، شال، متوازي الأضلاع، المتعاكسان',
  ride: 'في لعبة على الهاتف، بطل اللعبة في النقطة K: يقفز بالانسحاب الذي شعاعه $\\overrightarrow{EF}$ ثم بالانسحاب الذي شعاعه $\\overrightarrow{FG}$ .',
  opposite: 'T و R نقطتان مختلفتان.',
};

/** Les laboratoires du module 1 (vector-sum) — leurs nombres sont ceux de levels.js (le niveau se reconnaît à ses nombres). */
export const LAB = {
  beginner: { mode: 'chasles', A: [1, 1], u: [3, 1], legs: [[1, 3], [3, 1], [-3, -1]], decoys: [[1, 4], [6, 0]], theme: 'scooter' },
  advanced: { mode: 'parallelogram', swim: 4, current: 2, width: 60, theme: 'swim' },
};
