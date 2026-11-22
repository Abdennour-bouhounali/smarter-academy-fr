/**
 * Le contenu du درس 4 « حل مشكلات وإنجاز براهين بتوظيف الأشعة والانسحاب » (unité 11 « الأشعة والانسحاب », manuel
 * pp. 127–138) — données pures (aucun JSX). Chaque bloc porte sa `source` :
 *
 *   ex-18        أتعمّق p. 137 — le niveau متقدم du laboratoire du module 1 (DÉCLARÉ : la leçon n'a pas d'activité du
 *                manuel, son entrée est ce laboratoire ; extraction › notes › labAdvancedLevel) ; l'énoncé est rendu au
 *                module 4 (content/exercises.js) ;
 *   method-proof طرائق p. 133 « استعمال تساوي شعاعين لإنجاز برهان » — module 2, résolu ligne à ligne ;
 *   now-133 (1)  دوري الآن p. 133 — module 2 (l'élève le prouve) ;
 *   now-138      دوري الآن p. 138 — module 3, FAIT au laboratoire (mode construct) ;
 *   ex-17, ex-20, ex-21, ex-23, ex-24 : content/exercises.js (module 4).
 *
 * La leçon n'a PAS de معارف du manuel : la démarche de la preuve vectorielle (traduire · transformer · conclure), le
 * tableau de ce qu'une égalité vectorielle permet de conclure, la construction d'une somme de plusieurs vecteurs et
 * l'image d'un cercle sont une formalisation DÉCLARÉE de la plateforme (`knowledge_formalization`, « معارف من
 * المنصّة ») ; le métro d'Alger, les énoncés du test et « أستعدّ » sont `addition(…)`. Les textes du manuel sont au mot
 * près. CORRECTIONS : ex-21 (« L منتصف [ED] » → K, extraction › ex-21 › correction) ; ex-24 (I et les longueurs ne
 * servent pas, une ligne) ; now-138 : le manuel ne donne NI figure NI position de A, B, C, E — la plateforme les place
 * sur une مرصوفة (les nombres du builder, `iA…iE`) et le dit.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
const FORMAL = addition('knowledge_formalization');
export const LP = {
  P1: '4am_barahin-ashia_P1',
  P2: '4am_barahin-ashia_P2',
  P3: '4am_barahin-ashia_P3',
};

/* ── module 1 : le laboratoire (mêmes nombres que levels.js › vector-chain) ─────────────── */

export const LAB = {
  beginner: {
    mode: 'reduce', stations: { A: [0, 0], B: [5, 1], C: [7, 4], D: [2, 3] },
    segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']],
    givens: [{ para: 'ABCD' }],
    missions: [{ start: ['BC', 'AB'] }, { start: ['AB', 'AD'] }],
  },
  advanced: {
    mode: 'reduce',
    stations: { A: [0, 0], B: [6, 0], C: [2, 4], D: [-4, 4], O: [1, 2], H: [7, 2], L: [3, 6], K: [9, 6] },
    segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C'], ['B', 'D']],
    givens: [{ mid: ['O', 'A', 'C'] }, { sym: ['D', 'B', 'O'] }, { para: 'ABCD' }, { eq: ['BH', 'AO'] }, { eq: ['CL', 'OC'] }, { def: 'CK', sum: ['AB', 'AO'] }],
    missions: [
      { lhs: 'OL', start: ['OC', 'CL'], target: 'AC' },
      { lhs: 'HK', pre: ['HB', 'BC', 'CK'], start: ['HB', 'BC', 'AB', 'AO'], target: 'AC' },
    ],
  },
  /** دوري الآن ص 138 : A, B, C, E placés par la PLATEFORME (le manuel ne les dessine pas) ; (Γ) de rayon 2. */
  construct: {
    mode: 'construct', stations: { A: [0, 0], B: [4, 1], C: [1, 3], E: [6, 4] }, radius: 2,
    builds: [{ terms: ['AB', 'AC'], centre: 'E', name: 'E_1' }, { terms: ['BE', 'CA'], centre: 'E', name: 'E_2' }],
  },
};

/** Le monde du laboratoire (plateforme) : les correspondances du métro d'Alger. */
export const METRO = {
  source: PLATFORM,
  text: 'في مترو الجزائر تُختصر الرحلة بتذكرة واحدة: من محطة إلى محطة، مهما كانت المحطات التي مررت بها. كل تذكرة شعاع: $\\overrightarrow{AB}$ تعني «من A إلى B». تربط تذكرتين إذا كانت الثانية تنطلق من حيث وصلت الأولى، وتستطيع أن تنقل تذكرة إلى محطة أخرى إذا كانت المعطيات تضمن أنها الرحلة نفسها.',
};

/** أتعمّق p. 137 — تمرين 18, au mot près (le niveau متقدم du laboratoire, et le module 4). */
export const EX18 = {
  source: src('ex-18', 137, 'أتعمّق', 18),
  text: 'ABC مثلث كيفي، النقطة O هي منتصف [AC] و D نظيرة B بالنسبة إلى O. 1) أنشئ النقط H، K و L حيث $\\overrightarrow{BH} = \\overrightarrow{AO}$ ، $\\overrightarrow{CL} = \\overrightarrow{OC}$ و $\\overrightarrow{CK} = \\overrightarrow{AB} + \\overrightarrow{AO}$ . 2) برهن أن $\\overrightarrow{HK} = \\overrightarrow{OL} = \\overrightarrow{AC}$ . 3) ما هي طبيعة الرباعي OHKL. 4) المستقيمان (CK) و (LH) متقاطعان في النقطة G. برهن أن G مركز ثقل المثلث OKL.',
};

/** La وضعية de lancement pour la مذكرة du professeur (`ACTIVITY` : situation, questions, closing, source). */
export const ACTIVITY = {
  source: EX18.source,
  situation: 'خريطة مترو الجزائر: كل محطة نقطة، وكل تذكرة شعاع. نختصر رحلة من عدة تذاكر إلى تذكرة واحدة، ثم نبرهن على شكل التمرين 18 (ص 137) أن $\\overrightarrow{OL} = \\overrightarrow{AC}$ و $\\overrightarrow{HK} = \\overrightarrow{AC}$ .',
  text: EX18.text,
  questions: [
    'متى نستطيع أن نربط شعاعين بعلاقة شال؟',
    'كيف نختصر $\\overrightarrow{AB} + \\overrightarrow{AD}$ في متوازي الأضلاع ABCD؟',
    'لماذا لا يكفي أن نرى على الشكل أن $\\overrightarrow{OL} = \\overrightarrow{AC}$ ؟',
    'ماذا نستنتج من $\\overrightarrow{OL} = \\overrightarrow{HK}$ ؟',
  ],
  closing: 'نختصر عبارة شعاعية بثلاث أدوات: علاقة شال، تعويض شعاع بشعاع يساويه حسب المعطيات، وحذف شعاعين متعاكسين؛ والمساواة التي نصل إليها تبرهن خاصية هندسية.',
};

/** Les phrases que le module 1 écrit et que la carte reprend mot pour mot (A.10 : jamais retapées). */
export const REMARKS = {
  shalRule: 'نربط $\\overrightarrow{XY}$ و $\\overrightarrow{YZ}$ لأن نهاية الأول هي مبدأ الثاني: $\\overrightarrow{XY} + \\overrightarrow{YZ} = \\overrightarrow{XZ}$ . ترتيب الحدّين في المجموع لا يهم: $\\overrightarrow{BC} + \\overrightarrow{AB} = \\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ .',
  rabtWrong: '$\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{BD}$ ، بربط الشعاعين كما هما.',
  rabtWhy: 'الشعاعان لا يتتابعان: نهاية $\\overrightarrow{AB}$ هي B ومبدأ $\\overrightarrow{AD}$ هو A ، فلا تنطبق علاقة شال مباشرة.',
  rabtRight: 'نعوّض $\\overrightarrow{AD}$ بـ $\\overrightarrow{BC}$ (لأن ABCD متوازي أضلاع) ثم $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ .',
  swapRule: 'نعوّض شعاعا بشعاع يساويه إذا كانت المعطيات تضمن ذلك: في متوازي الأضلاع ABCD لدينا $\\overrightarrow{AD} = \\overrightarrow{BC}$ و $\\overrightarrow{AB} = \\overrightarrow{DC}$ .',
  zeroRule: 'شعاعان متعاكسان مجموعهما الشعاع المعدوم: $\\overrightarrow{OA} + \\overrightarrow{AO} = \\overrightarrow{OO} = \\overrightarrow{0}$ ، وليس العدد 0.',
  seeWrong: '$\\overrightarrow{OL}$ و $\\overrightarrow{AC}$ يبدوان متساويين على الشكل، إذن $\\overrightarrow{OL} = \\overrightarrow{AC}$ .',
  seeWhy: 'هذه المساواة هي المطلوب برهانه: الشكل قد يكون غير دقيق، وما نراه عليه لا يثبت شيئا.',
  seeRight: 'لا نستعمل إلا المعطيات (منتصف، متوازي أضلاع، تعريف نقطة) وعلاقة شال: $\\overrightarrow{OL} = \\overrightarrow{OC} + \\overrightarrow{CL} = \\overrightarrow{AO} + \\overrightarrow{OC} = \\overrightarrow{AC}$ .',
};

/* ── module 2 : طرائق ─────────────────────────────────────────────────── */

/** طرائق p. 133 « استعمال تساوي شعاعين لإنجاز برهان », au mot près (extraction › method-proof). */
export const METHOD_PROOF = {
  source: src('method-proof', 133, 'طرائق'),
  title: 'استعمال تساوي شعاعين لإنجاز برهان',
  exercise: 'تمرين: ABC مثلث، I منتصف [BC] و D نقطة حيث $\\overrightarrow{AI} = \\overrightarrow{ID}$ . برهن أن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
  solution: [
    'حل: نبرهن أن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
    '$\\overrightarrow{AB} = \\overrightarrow{CD}$ يعني الرباعي ABDC متوازي أضلاع.',
    '$\\overrightarrow{AI} = \\overrightarrow{ID}$ يعني أن I منتصف القطعة [AD]، علما أن I منتصف [BC].',
    'إذن في الرباعي ABDC القطران [AD] و [BC] لهما نفس المنتصف I.',
    'و بالتالي الرباعي ABDC متوازي أضلاع. ينتج أن $\\overrightarrow{AB} = \\overrightarrow{CD}$ .',
  ],
  rule: 'طريقة: لإثبات أن شعاعين $\\overrightarrow{AB}$ و $\\overrightarrow{CD}$ متساويان، يكفي إثبات أن الرباعي ABDC متوازي أضلاع.',
};

/** La démarche de la preuve vectorielle — FORMULÉE par la plateforme (le manuel n'a pas de معارف pour cette leçon). */
export const PROOF_STEPS = {
  source: FORMAL,
  title: 'خطوات البرهان باستعمال الأشعة',
  lines: [
    'نترجم المطلوب إلى مساواة شعاعية: «I منتصف [AB]» تصبح $\\overrightarrow{AI} = \\overrightarrow{IB}$ ، و «ABCD متوازي أضلاع» تصبح $\\overrightarrow{AB} = \\overrightarrow{DC}$ .',
    'نحوّل أحد الطرفين خطوة خطوة: علاقة شال (نُدخل محطة أو نربط شعاعين متتابعين)، تعويض شعاع بشعاع يساويه حسب المعطيات، حذف شعاعين متعاكسين.',
    'نصل إلى الطرف الآخر، ثم نستنتج الخاصية الهندسية المطلوبة.',
  ],
};

/** Ce qu'une égalité vectorielle permet de conclure — FORMULÉ par la plateforme (rangé d'après معارف 2–3 du manuel). */
export const CONCLUSIONS = {
  source: FORMAL,
  title: 'ماذا نستنتج من مساواة شعاعية؟',
  lines: [
    'إذا كان $\\overrightarrow{AB} = \\overrightarrow{DC}$ والنقط A و B و C ليست على استقامة واحدة، فإن الرباعي ABCD متوازي أضلاع.',
    'إذا كان $\\overrightarrow{AI} = \\overrightarrow{IB}$ ، فإن I منتصف القطعة [AB].',
    'إذا كان $\\overrightarrow{AB} = \\overrightarrow{BC}$ ، فإن B منتصف [AC]، وبالتالي النقط A و B و C على استقامة واحدة.',
    'إذا كان $\\overrightarrow{AB} = \\overrightarrow{CD}$ ، فإن للمستقيمين (AB) و (CD) نفس المنحى: هما متوازيان (أو منطبقان).',
  ],
  warning: 'علاقة شال $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ صحيحة مهما كانت النقطة B: وحدها لا تثبت أن B تقع على [AC].',
};

/** دوري الآن p. 133 — item 1, au mot près ; la preuve de l'extraction (answerSource: computed). */
export const NOW133 = {
  source: src('now-133', 133, 'دوري الآن', 1),
  text: 'ABDC متوازي أضلاع. E نظيرة A بالنسبة إلى C. برهن أن $\\overrightarrow{BC} = \\overrightarrow{DE}$ .',
  proof: 'ABDC متوازي أضلاع: $\\overrightarrow{AC} = \\overrightarrow{BD}$ ؛ C منتصف [AE]: $\\overrightarrow{AC} = \\overrightarrow{CE}$ . إذن $\\overrightarrow{BD} = \\overrightarrow{CE}$ فـ BDEC متوازي أضلاع ومنه $\\overrightarrow{BC} = \\overrightarrow{DE}$ .',
};

/* ── module 3 : إنشاءات ──────────────────────────────────────────────────── */

/** دوري الآن p. 138, au mot près ; la figure manque au manuel : complétée par la plateforme (dite). */
export const NOW138 = {
  source: src('now-138', 138, 'دوري الآن', 1),
  text: 'نعتبر النقط A، B، C، E و الدّائرة (Γ) التي مركزها E و نصف قطرها 2 . $(\\Gamma_1)$ هي صورة (Γ) بالانسحاب الذي شعاعه $\\overrightarrow{AB} + \\overrightarrow{AC}$ و $(\\Gamma_2)$ هي صورة (Γ) بالانسحاب الذي شعاعه $\\overrightarrow{BE} + \\overrightarrow{CA}$ . أنشئ الدّوائر (Γ) و $(\\Gamma_1)$ و $(\\Gamma_2)$ .',
  completion: 'الكتاب لا يحدّد موضع النقط A و B و C و E ولا يرسم شكلا: وضعتها المنصّة على مرصوفة (ونصف قطر (Γ) وحدتان) لتنشئ الدوائر فعلا.',
};

/** Construire un représentant d'une somme de plusieurs vecteurs ; l'image d'un cercle — FORMULÉ par la plateforme. */
export const CONSTRUCT = {
  source: FORMAL,
  title: 'إنشاء ممثّل مجموع عدة أشعة',
  lines: [
    'لإنشاء النقطة M حيث $\\overrightarrow{EM} = \\vec{u} + \\vec{v} + \\vec{w}$ : نرسم من E ممثّل $\\vec{u}$ ، ثم من نهايته ممثّل $\\vec{v}$ ، ثم من نهاية هذا ممثّل $\\vec{w}$ ؛ M هي النهاية الأخيرة (علاقة شال).',
    'أو نرسم المجموع حيث تكون الأشعة (قاعدة متوازي الأضلاع) ثم ننقله ليبدأ من E .',
  ],
  circle: 'صورة دائرة مركزها E ونصف قطرها r بالانسحاب الذي شعاعه $\\vec{u}$ هي الدائرة التي مركزها صورة E ونصف قطرها r : الانسحاب يحافظ على الأطوال.',
  startWrong: 'لإنشاء $\\overrightarrow{AB} + \\overrightarrow{AC}$ من E نرسم من E ممثّل $\\overrightarrow{AB}$ ، ثم من E أيضا ممثّل $\\overrightarrow{AC}$ ، ونصل نهايتيهما.',
  startWhy: 'في علاقة شال يبدأ الممثّل الثاني من نهاية الأول؛ رسم الممثّلين من E يعطي ضلعي متوازي أضلاع لا مجموعهما.',
  startRight: 'نرسم من E ممثّل $\\overrightarrow{AB}$ ، ثم من نهايته ممثّل $\\overrightarrow{AC}$ : نهاية الثاني هي $E_1$ .',
};

/* ── module 4 : les corrections et remarques du manuel ─────────────────── */

export const EX21_CORRECTION = 'صحّحت المنصّة خطأً مطبعيًا: بالمعطيات المطبوعة ( BLKD متوازي أضلاع و $\\overrightarrow{LE} = \\overrightarrow{LA} + \\overrightarrow{LK}$ ) منتصف [ED] هو K لا L ؛ فالمطلوب: «أثبت أنّ K منتصف [ED]».';
export const EX24_NOTE = 'النقطة I والطولان 6cm و 5cm تفيد في رسم الشكل فقط، ولا يحتاجها البرهان.';
/** La leçon du ex-23 que la carte reprend : un milieu par deux vecteurs opposés. */
export const MIDPOINT_OPPOSITE = 'إذا كان $\\overrightarrow{AL} = -\\overrightarrow{AK}$ (أي $\\overrightarrow{AK} + \\overrightarrow{AL} = \\overrightarrow{0}$ ) فإن A منتصف [KL].';

/* ── module 0 : « أستعدّ » (plateforme — les items 1–7 du manuel vont aux leçons 1 et 2) ── */

const PREP = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { skill: 'shal', text: 'لكل النقط M و N و P لدينا $\\overrightarrow{MN} + \\overrightarrow{NP} = \\overrightarrow{PM}$ .', answer: false, why: 'المجموع يبدأ من مبدأ الأول وينتهي عند نهاية الثاني: $\\overrightarrow{MN} + \\overrightarrow{NP} = \\overrightarrow{MP}$ ، و $\\overrightarrow{PM}$ معاكس له.', source: PREP },
  { skill: 'qaida', text: 'إذا كان RSTU متوازي أضلاع فإن $\\overrightarrow{RS} + \\overrightarrow{RU} = \\overrightarrow{RT}$ .', answer: true, why: 'قاعدة متوازي الأضلاع: مجموع شعاعين لهما نفس المبدأ R هو القطر الصادر من R ، أي $\\overrightarrow{RT}$ .', source: PREP },
  { skill: 'tasawi', text: 'إذا كان $\\overrightarrow{EF} = \\overrightarrow{GH}$ والنقط ليست على استقامة واحدة فإن الرباعي EFGH متوازي أضلاع.', answer: false, why: '$\\overrightarrow{EF} = \\overrightarrow{GH}$ يعني أن EFHG (لا EFGH) متوازي أضلاع: ترتيب الرؤوس مهم.', source: PREP },
  { skill: 'muntasaf', text: 'إذا كانت T منتصف القطعة [VW] فإن $\\overrightarrow{VT} = \\overrightarrow{TW}$ .', answer: true, why: 'T منتصف [VW] : الشعاعان $\\overrightarrow{VT}$ و $\\overrightarrow{TW}$ لهما نفس المنحى ونفس الاتجاه ونفس الطول.', source: PREP },
  { skill: 'mutaakisan', text: '$\\overrightarrow{XY} + \\overrightarrow{YX} = 2\\overrightarrow{XY}$ .', answer: false, why: '$\\overrightarrow{XY}$ و $\\overrightarrow{YX}$ متعاكسان: $\\overrightarrow{XY} + \\overrightarrow{YX} = \\overrightarrow{XX} = \\overrightarrow{0}$ .', source: PREP },
  { skill: 'rubaiyat', text: 'متوازي أضلاع قطراه متقايسان هو مستطيل.', answer: true, why: 'من خواص الرباعيات الشهيرة: متوازي الأضلاع الذي قطراه متقايسان مستطيل، والذي قطراه متعامدان معين.', source: PREP },
];

/* ── module 8 : « إختبار أولي » — des points et des situations qui n'apparaissent nulle part ailleurs ─── */

export const TEST = {
  source: PLATFORM,
  title: 'ستّ وضعيات جديدة',
  metro: 'ثلاث محطات R و S و T في خط ترامواي قسنطينة، ويحترم ركّابه مواعيده.',
  park: 'EFGH متوازي أضلاع يمثّل حديقة في وهران يحافظ أهلها على نظافتها.',
  uvwx: 'UVWX رباعي حيث $\\overrightarrow{UV} = \\overrightarrow{XW}$ والنقط U و V و W ليست على استقامة واحدة.',
  npq: 'N و P و Q ثلاث نقط حيث $\\overrightarrow{NP} + \\overrightarrow{NQ} = \\overrightarrow{0}$ .',
  drone: 'في عرض طائرات مسيّرة فوق خليج الجزائر أتقن مبرمجوه تنسيقه، تنطلق طائرة من النقطة P وتتحرّك بالأشعة $\\overrightarrow{AB}$ ثم $\\overrightarrow{CD}$ ثم $\\overrightarrow{EF}$ ، فتصل إلى النقطة M حيث $\\overrightarrow{PM} = \\overrightarrow{AB} + \\overrightarrow{CD} + \\overrightarrow{EF}$ .',
  circle: '(C) دائرة مركزها Ω ونصف قطرها 3، و U و V و W ثلاث نقط.',
};
