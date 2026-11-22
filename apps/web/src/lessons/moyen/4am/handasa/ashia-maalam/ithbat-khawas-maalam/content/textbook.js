/**
 * Le contenu du درس 4 « توظيف الحساب الشعاعي والإحداثيات لإثبات الخواص الهندسية » (unité 12 « الأشعة في معلم »,
 * manuel pp. 139–149) — données pures (aucun JSX). Chaque bloc porte sa `source` :
 *
 *   method-proof   طرائق p. 145 « إنجاز برهان » — module 3, résolu ligne à ligne ;
 *   method-unknown طرائق p. 145 « حساب مسافات » — module 3 ; c'est AUSSI le niveau متقدم du laboratoire du module 1
 *                  (DÉCLARÉ : la leçon n'a pas d'activité du manuel, son entrée est ce laboratoire — extraction › notes ›
 *                  labAdvancedLevel) ;
 *   now-145 (1, 2) دوري الآن p. 145 — module 3 (l'élève les prouve) ;
 *   ex-13, 18, 19, 21, 24, 26, 27 : content/exercises.js (module 4).
 *
 * La leçon n'a PAS de معارف du manuel : la démarche « prouver une nature par le calcul » (triangle : trois carrés de
 * distances ; quadrilatère : vecteurs égaux puis diagonales et côtés consécutifs ; cercle : distance au centre) et la
 * perpendicularité sans produit scalaire sont une formalisation DÉCLARÉE de la plateforme (`knowledge_formalization`,
 * « معارف من المنصّة ») ; le ملعب الحي, « أستعدّ » et les énoncés du test sont `addition(…)`. Les textes du manuel sont au
 * mot près. CORRECTIONS (extraction › discrepancies) : ex-13 (unité absente → 1cm), ex-21 (« أربع نقط » → ثلاث), ex-26
 * (« الرباعي ABCD » croisé → ACBD) ; ex-24 Q3 lu « AB و BC » (une ligne) ; method-proof : la plateforme ajoute √32 = 4√2.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
const FORMAL = addition('knowledge_formalization');
export const LP = {
  P1: '4am_ithbat-khawas-maalam_P1',
  P2: '4am_ithbat-khawas-maalam_P2',
  P3: '4am_ithbat-khawas-maalam_P3',
};

/* ── module 1 : le laboratoire (mêmes nombres que levels.js › shape-prover) ─────────────── */

export const LAB = {
  beginner: { mode: 'triangle', A: [0, 0], B: [3, 1], C: [-1, 2] },
  advanced: { mode: 'unknown', A: [0, 2], B: [-4, 0], rail: { x: -2, min: -5, max: 4, start: 4 }, D: [2, 2] },
};

/** Le monde du laboratoire (plateforme) : le ملعب الحي et son « فار ». */
export const PITCH = {
  source: PLATFORM,
  text: 'في ملعب الحي الذي نظّفه شباب الحيّ تطوّعًا، يضع المدرّب شواخص على أرضية مرصوفة: هي مَعلم متعامد ومتجانس، الوحدة ضلع مربّع واحد. يطلب أشكالا دقيقة لتمارين التمرير، وزميلك يصوّر التحدّي بهاتفه، والفار هو الحَكَم: لا يقبل شكلا إلا إذا أثبته الحساب بالإحداثيات، مهما بدا صحيحا للعين.',
};

/** La وضعية de lancement pour la مذكرة du professeur (`ACTIVITY` : situation, questions, closing, source). */
export const ACTIVITY = {
  source: src('method-unknown', 145, 'طرائق'),
  situation: 'شواخص ملعب الحي في مَعلم متعامد ومتجانس: نحرّك شاخصا، ونرسل إلى الفار ما نريد إثباته وبطاقات الدليل (مربعات المسافات، مركبتا شعاعين، منتصفا القطرين)، فلا يقبل إلا ما يثبته الحساب. المستوى المتقدّم هو طريقة الكتاب (ص 145): $C(-2\\,;\\,y)$ ينزلق حتى يكون $(AB) \\perp (BC)$ .',
  text: 'المستوي مزود بمعلم متعامد ومتجانس، مبدؤه O. (الوحدة 1cm) $A(0\\,;\\,2)$ ، $B(-4\\,;\\,0)$ ، $C(-2\\,;\\,y)$ ثلاث نقط. عيّن y حتى يكون المستقيمان (AB) و (BC) متعامدين.',
  questions: [
    'لماذا رفض الفار مثلثا يبدو قائما على الشكل؟',
    'لإثبات أن المثلث ABC قائم في A، أيّ مساواة نتحقق منها؟',
    'لماذا لا يكفي أن يكون $\\overrightarrow{AB} = \\overrightarrow{DC}$ لنقول إن ABCD مستطيل؟',
    'كيف نثبت أن نقطة تنتمي إلى دائرة علم مركزها ونصف قطرها؟',
  ],
  closing: 'نثبت طبيعة شكل في معلم بمساواة محسوبة من الإحداثيات، وبأدلة كافية: مربعات المسافات لمثلث، وتساوي شعاعين ثم القطرين أو ضلعين متتاليين لرباعي، والمسافة إلى المركز لدائرة.',
};

/** Les phrases que le module 1 écrit et que la carte reprend mot pour mot (A.10 : jamais retapées). */
export const REMARKS = {
  look: 'ما نراه على المرصوفة يوحي ولا يثبت: الزاوية التي تبدو قائمة قد لا تكون كذلك. الدليل مساواة محسوبة من الإحداثيات.',
  watarWrong: 'لإثبات أن ABC قائم في A نتحقق أن $AB^2 + BC^2 = AC^2$ .',
  watarWhy: 'هذه المساواة تضع $AC^2$ وحده في طرف: هي تثبت زاوية قائمة في B ، المقابلة للضلع [AC].',
  watarRight: 'الزاوية القائمة في A تقابل الضلع [BC]، أطول الأضلاع: نتحقق أن $AB^2 + AC^2 = BC^2$ .',
  kafiWrong: '$\\overrightarrow{AB} = \\overrightarrow{DC}$ ، إذن الرباعي ABCD مستطيل.',
  kafiWhy: 'تساوي الشعاعين يثبت أن ABCD متوازي أضلاع فقط؛ وكثير من متوازيات الأضلاع ليست مستطيلات.',
  kafiRight: 'نضيف دليلا ثانيا: القطران متقايسان ( $AC = BD$ ) ، فمتوازي الأضلاع ABCD مستطيل.',
  diagAlone: 'قطران متقايسان وحدهما لا يكفيان: عند $D(2\\,;\\,2)$ كان $AC^2 = BD^2 = 40$ والرباعي ABCD ليس متوازي أضلاع.',
};

/* ── module 2 : معارف من المنصّة (le manuel n'a pas de معارف pour cette leçon) ──────────── */

/** Prouver la nature d'un triangle — FORMULÉ par la plateforme (d'après طرائق p. 145 et les exercices 18, 19, 21, 26). */
export const TRIANGLE = {
  source: FORMAL,
  title: 'إثبات طبيعة مثلث في معلم',
  lines: [
    'نحسب مربعات الأطوال الثلاثة من الإحداثيات، مثلا $AB^2 = (x_B - x_A)^2 + (y_B - y_A)^2$ ، ونقارنها (نقارن المربعات لنتجنّب الجذور).',
    'مربعان متساويان، مثل $CA^2 = CB^2$ : المثلث متساوي الساقين رأسه C. المربعات الثلاثة متساوية: متقايس الأضلاع.',
    'مجموع المربعين الأصغرين يساوي المربع الأكبر، مثل $AB^2 + AC^2 = BC^2$ : المثلث قائم في A ، الرأس المقابل لأطول ضلع (الخاصية العكسية لخاصية فيثاغورس). وإلا فليس قائما.',
  ],
};

/** La perpendicularité en 4AM : pas de produit scalaire — FORMULÉ par la plateforme (طرائق p. 145, ex-18). */
export const PERP = {
  source: FORMAL,
  title: 'إثبات تعامد مستقيمين',
  lines: [
    'لإثبات أن $(AB) \\perp (BC)$ نثبت أن المثلث ABC قائم في B : $BA^2 + BC^2 = AC^2$ .',
    'أو: إذا كان المثلث متساوي الساقين رأسه B و I منتصف القاعدة [AC] ، فإن المتوسط (BI) هو أيضا ارتفاع: $(BI) \\perp (AC)$ .',
  ],
};

/** Prouver la nature d'un quadrilatère — FORMULÉ par la plateforme (معارف du درس 2 et des quadrilatères usuels). */
export const QUAD = {
  source: FORMAL,
  title: 'إثبات طبيعة رباعي في معلم',
  lines: [
    'متوازي أضلاع: $\\overrightarrow{AB} = \\overrightarrow{DC}$ (نفس المركبتين) ، أو للقطرين [AC] و [BD] نفس المنتصف.',
    'مستطيل: متوازي أضلاع وقطراه متقايسان ( $AC = BD$ ).',
    'معيّن: متوازي أضلاع فيه ضلعان متتاليان متقايسان ( $AB = BC$ ).',
    'مربّع: متوازي أضلاع قطراه متقايسان وفيه ضلعان متتاليان متقايسان (مستطيل ومعيّن معا).',
  ],
  warning: 'نبدأ دائما بإثبات أنه متوازي أضلاع: قطران متقايسان أو ضلعان متقايسان وحدهما لا يكفيان.',
};

/** Un point d'un cercle — FORMULÉ par la plateforme (دوري الآن 2 p. 145, ex-18, ex-19). */
export const CIRCLE = {
  source: FORMAL,
  title: 'إثبات انتماء نقطة إلى دائرة',
  lines: [
    'تنتمي النقطة M إلى الدائرة التي مركزها O ونصف قطرها r إذا وفقط إذا كان $OM = r$ ، أي $OM^2 = r^2$ .',
    'الدائرة التي قطرها [AB] : مركزها I منتصف [AB] ونصف قطرها $IA = \\dfrac{AB}{2}$ ؛ نقارن IM بـ IA.',
  ],
  trap: 'نقارن OM بنصف القطر r ، لا بالقطر 2r.',
};

/* ── module 3 : طرائق p. 145 ─────────────────────────────────────────────── */

/** طرائق p. 145 « إنجاز برهان », au mot près (extraction › method-proof). */
export const METHOD_PROOF = {
  source: src('method-proof', 145, 'طرائق'),
  title: 'إنجاز برهان',
  exercise: 'تمرين: المستوي مزود بمعلم متعامد ومتجانس، مبدؤه O. $A(6\\,;\\,-1)$ ، $B(2\\,;\\,3)$ ، $C(2\\,;\\,-5)$ نقط من المستوي. 1) علّم النقط A، B، C. 2) برهن أن المثلث ABC قائم في A ومتساوي الساقين.',
  solution: [
    'حل: 1) تعليم النقط A، B، C (الشكل)',
    '2) لإثبات أن المثلث ABC قائم في A ومتساوي الساقين نحتاج إلى حساب الأطوال AB ، AC ، BC.',
    'لدينا $x_B - x_A = 2 - 6 = -4$ و $y_B - y_A = 3 + 1 = 4$ . إذن $\\overrightarrow{AB}\\begin{pmatrix} -4 \\\\ 4 \\end{pmatrix}$ .',
    'لدينا $x_C - x_A = 2 - 6 = -4$ و $y_C - y_A = -5 + 1 = -4$ . إذن $\\overrightarrow{AC}\\begin{pmatrix} -4 \\\\ -4 \\end{pmatrix}$ .',
    'لدينا $x_C - x_B = 2 - 2 = 0$ و $y_C - y_B = -5 - 3 = -8$ إذن $\\overrightarrow{BC}\\begin{pmatrix} 0 \\\\ -8 \\end{pmatrix}$ .',
    'إذن $AB = \\sqrt{(-4)^2 + (4)^2} = \\sqrt{32}$ ، و $AC = \\sqrt{(-4)^2 + (-4)^2} = \\sqrt{32}$ أي $AC = \\sqrt{32}$ ، و $BC = \\sqrt{(-8)^2 + (0)^2} = \\sqrt{64} = 8$ أي BC = 8 .',
    'لدينا $AB^2 + AC^2 = (\\sqrt{32})^2 + (\\sqrt{32})^2 = 64$ و $BC^2 = 64$ . بالتالي $AB^2 + AC^2 = BC^2$ .',
    'ينتج حسب الخاصية العكسية لخاصية فيثاغورث أن المثلث ABC قائم في A وحيث أن AB = AC فإن ABC قائم ومتساوي الساقين.',
  ],
  /** La plateforme ajoute la forme simplifiée (unité 2) — une ligne, le manuel garde √32. */
  simplify: 'ملاحظة من المنصّة: $\\sqrt{32} = \\sqrt{16 \\times 2} = 4\\sqrt{2}$ (الحساب على الجذور).',
};

/** طرائق p. 145 « حساب مسافات », au mot près (extraction › method-unknown) ; le développement sauté par le manuel est
 * écrit par la plateforme (`expand`, extraction › answer). */
export const METHOD_UNKNOWN = {
  source: src('method-unknown', 145, 'طرائق'),
  title: 'حساب مسافات',
  exercise: 'تمرين: المستوي مزود بمعلم متعامد ومتجانس، مبدؤه O. (الوحدة 1cm) $A(0\\,;\\,2)$ ، $B(-4\\,;\\,0)$ ، $C(-2\\,;\\,y)$ ثلاث نقط. عيّن y حتى يكون المستقيمان (AB) و (BC) متعامدين.',
  solution: [
    'حل: يكون المستقيمان (AB) و (BC) متعامدين إذا كان المثلث ABC قائم في B. إذن يكفي تعيين y بحيث يكون ABC قائم في B.',
    'أي نعيّن y بحيث يكون $AB^2 + BC^2 = AC^2$ .',
    'لدينا $\\overrightarrow{AB}\\begin{pmatrix} -4 \\\\ -2 \\end{pmatrix}$ ، $\\overrightarrow{AC}\\begin{pmatrix} -2 \\\\ y - 2 \\end{pmatrix}$ ، $\\overrightarrow{BC}\\begin{pmatrix} 2 \\\\ y \\end{pmatrix}$ .',
    'إذن $AB^2 = 20$ ، $AC^2 = 4 + (y - 2)^2$ ، $BC^2 = 4 + y^2$ .',
    'بما أنّ $AB^2 + BC^2 = AC^2$ وبالتعويض نجد: $20 + 4 + y^2 = 4 + (y - 2)^2$ . ومنه ينتج $y = -4$ .',
  ],
  expand: 'التفصيل (من المنصّة): $24 + y^2 = 4 + y^2 - 4y + 4$ ، يحذف $y^2$ من الطرفين فتصبح المعادلة من الدرجة الأولى: $24 = 8 - 4y$ ، أي $4y = -16$ ، ومنه $y = -4$ .',
  check: 'تحقّق: $C(-2\\,;\\,-4)$ ، $AB^2 + BC^2 = 20 + 20 = 40 = AC^2$ : المثلث ABC قائم في B (ومتساوي الساقين).',
};

/** دوري الآن p. 145, au mot près (extraction › now-145) ; réponses de l'extraction (answerSource: computed). */
export const NOW145 = {
  item1: {
    source: src('now-145', 145, 'دوري الآن', 1),
    text: '$A(2\\,;\\,2)$ ، $B(2\\,;\\,-2)$ ، $C(-2\\,;\\,-2)$ ، $D(-2\\,;\\,2)$ نقط من المستوي المزوّد بمعلم متعامد ومتجانس. برهن أن الرباعي ABCD مربع.',
  },
  item2: {
    source: src('now-145', 145, 'دوري الآن', 2),
    text: '$A(-2\\,;\\,0)$ ، $B(0\\,;\\,-2)$ نقطتان في معلم متعامد ومتجانس، مبدؤه النقطة O. • عيّن إحداثيتي I مركز الدائرة التي قطرها [AB]. • برهن أنّ النقطة O تنتمي إلى هذه الدائرة.',
  },
};

/* ── module 0 : « أستعدّ » (plateforme — les items « أستعدّ » du manuel vont aux leçons 1 à 3) ── */

const PREP = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { skill: 'masafa', text: 'المسافة بين النقطتين $E(1\\,;\\,-2)$ و $F(4\\,;\\,2)$ هي $EF = 5$ .', answer: true, why: '$EF = \\sqrt{(4 - 1)^2 + (2 + 2)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$ .', source: PREP },
  { skill: 'murakkibat', text: 'إذا كان $G(5\\,;\\,1)$ و $H(2\\,;\\,3)$ فإن مركبتي $\\overrightarrow{GH}$ هما $\\begin{pmatrix} 3 \\\\ -2 \\end{pmatrix}$ .', answer: false, why: 'النهاية ناقص المبدأ: $x_H - x_G = 2 - 5 = -3$ و $y_H - y_G = 3 - 1 = 2$ ، أي $\\overrightarrow{GH}\\begin{pmatrix} -3 \\\\ 2 \\end{pmatrix}$ .', source: PREP },
  { skill: 'muntasaf', text: 'منتصف القطعة [KL] حيث $K(-3\\,;\\,4)$ و $L(5\\,;\\,0)$ هو النقطة $(1\\,;\\,2)$ .', answer: true, why: '$\\left(\\dfrac{-3 + 5}{2}\\,;\\,\\dfrac{4 + 0}{2}\\right) = (1\\,;\\,2)$ .', source: PREP },
  { skill: 'fithaghuras', text: 'المثلث الذي أطوال أضلاعه $6$ و $8$ و $9$ قائم.', answer: false, why: 'أطول ضلع 9 : $6^2 + 8^2 = 100$ و $9^2 = 81$ ، والمساواة غير محققة فالمثلث ليس قائما (الخاصية العكسية لخاصية فيثاغورس).', source: PREP },
  { skill: 'mutawazi', text: 'إذا كان $\\overrightarrow{PQ} = \\overrightarrow{SR}$ والنقط P و Q و R ليست على استقامة واحدة، فإن الرباعي PQRS متوازي أضلاع.', answer: true, why: 'من P إلى Q كما من S إلى R : الرباعي PQRS متوازي أضلاع (الوحدة 11).', source: PREP },
  { skill: 'rubaiyat', text: 'متوازي أضلاع قطراه متقايسان هو معيّن.', answer: false, why: 'متوازي الأضلاع الذي قطراه متقايسان مستطيل؛ والذي فيه ضلعان متتاليان متقايسان (أو قطراه متعامدان) معيّن.', source: PREP },
  { skill: 'daira', text: 'تنتمي النقطة M إلى الدائرة التي مركزها O وقطرها $10$ إذا كان $OM = 10$ .', answer: false, why: 'قطر الدائرة 10 فنصف قطرها 5 : تنتمي M إلى الدائرة إذا كان $OM = 5$ .', source: PREP },
];

/* ── module 5 : « إختبار أولي » — des points et des situations qui n'apparaissent nulle part ailleurs ─── */

export const TEST = {
  source: PLATFORM,
  title: 'ست وضعيات جديدة',
  triangle: 'في ملعب حيّ بباب الزوار، ثلاثة شواخص $K(1\\,;\\,1)$ و $L(5\\,;\\,3)$ و $M(3\\,;\\,7)$ في معلم متعامد ومتجانس.',
  right: 'EFG مثلث في معلم متعامد ومتجانس.',
  quad: 'ساحة ألعاب في وهران رؤوسها $A(-2\\,;\\,1)$ ، $B(2\\,;\\,-1)$ ، $C(3\\,;\\,1)$ ، $D(-1\\,;\\,3)$ في معلم متعامد ومتجانس.',
  suffice: 'عن رباعي PQRS نعلم فقط أن $\\overrightarrow{PQ} = \\overrightarrow{SR}$ و $PR = QS$ .',
  centre: 'دائرة وسط ملعب في قسنطينة، مركزها $\\Omega(2\\,;\\,-1)$ ونصف قطرها $5$ ، في معلم متعامد ومتجانس.',
  diameter: '$P(-3\\,;\\,1)$ و $Q(5\\,;\\,-3)$ ، و $(\\mathcal{C})$ الدائرة التي قطرها [PQ] ، و $R(3\\,;\\,3)$ .',
};
