/**
 * Le contenu du درس 3 « إنشاءات هندسية وتطبيقات خاصية طالس (تقسيم قطعة مستقيم) » (unité 9 « خاصية طالس »,
 * manuel pp. 107, 109, 111–113) — données pures (aucun JSX). Chaque bloc porte sa `source` :
 *
 *   method-divide            طرائق p. 107 « تقسيم قطعة مستقيمة » (module 1) ;
 *   method-construct-length  طرائق p. 107 « إنشاء قطعة مستقيم طولها معلوم » : AB = 14/3 (module 2) ;
 *   method-ratio-point       طرائق p. 109 : M de [AB] avec MA/MB = 3/2, et le point K de la figure (module 2) ;
 *   now-109                  دوري الآن p. 109 : CA/CB = 2/5 (module 2) ;
 *   qcm item 4               أؤكّد تعلّماتي p. 112 (module 7, l'إختبار أولي — extraction › destinations › qcm).
 * Les exercices ex-17, ex-18, ex-19, ex-21 sont dans content/exercises.js.
 *
 * La leçon n'a PAS d'activité du manuel : son entrée est le laboratoire segment-divider (déclaré
 * `platform_adaptation`). Ce que la plateforme FORMULE (la méthode générale du rayon auxiliaire, les deux
 * points de (AB), la longueur non rationnelle √13) est déclaré : `addition('knowledge_formalization')` ou
 * `addition('interaction_generation')`. Les textes du manuel sont au mot près ; aucune coquille dans ces
 * éléments (extraction : `verified: true`, aucune entrée `discrepancies`). Les figures sont des DONNÉES
 * GeoFigure (redessinées d'après extraction › figure, jamais une image du manuel).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
const FORMAL = addition('knowledge_formalization');
export const LP = {
  P1: '4am_inshaat-talis_P1',
  P2: '4am_inshaat-talis_P2',
};

/* ── l'entrée : la banderole du tifo (plateforme) ─────────────────────────────── */

/** Le monde du laboratoire : la banderole géante que les ultras du quartier peignent pour le derby. */
export const TIFO = {
  source: PLATFORM,
  headline: 'تيفو الدربي: لافتة بثلاثة أشرطة متساوية',
  text: 'أنصار فريق الحي يحضّرون «تيفو» عملاقا للدربي، ويتعاونون على إنجازه بروح رياضية: لافتة تُطلى بثلاثة أشرطة متساوية الطول، أخضر وأبيض وأحمر. رسموا اللافتة [AB] بطول 10cm على ورقة التصميم.',
  question: 'كيف نقسم [AB] إلى ثلاث قطع متقايسة؟ $10 \\div 3 = 3{,}333\\ldots$ : لا يُقاس هذا الطول بالضبط بمسطرة مدرّجة. سنستعمل المسطرة غير المدرّجة والمدور والكوس فقط.',
};

/** Les laboratoires (segment-divider) — le module 1 et le module 2 les étalent ; leurs nombres sont ceux de levels.js. */
export const LAB = {
  m1: {
    beginner: { mode: 'equal', parts: 3, theme: 'tifo', title: 'لافتة التيفو: ثلاث قطع متقايسة' },
    advanced: { mode: 'ratio', p: 3, q: 2, marks: 5, theme: 'tifo', title: 'نقطة تقسم اللافتة بنسبة 3 إلى 2' },
  },
  // دوري الآن ص 109 : CA/CB = 2/5, le même instrument posé seul (un seul niveau)
  m2: { mode: 'ratio', p: 2, q: 5, marks: 5, theme: 'tifo', title: 'دوري الآن: النقطة C حيث CA على CB يساوي 2 على 5' },
};

/* ── module 1 : partager en parts égales ───────────────────────────────────── */

/** طرائق (p. 107) — « تقسيم قطعة مستقيمة », au mot près (extraction › method-divide). */
export const METHOD_DIVIDE = {
  source: src('method-divide', 107, 'طرائق'),
  title: 'تقسيم قطعة مستقيمة',
  exercise: 'ABC مثلث. D هي نظيرة B بالنسبة إلى C و E نظيرة C بالنسبة إلى D. قسّم الضلع [AB] إلى 3 قطع متقايسة.',
  solution: [
    'المستقيم الذي يشمل C و يوازي (AE) يقطع (AB) في M. المستقيم الذي يشمل D و يوازي (AE) يقطع (AB) في N.',
    '• المثلثان BCM و BEA في وضعية طالس إذن $\\dfrac{BM}{BA} = \\dfrac{BC}{BE} = \\dfrac{1}{3}$ ومنه $BM = \\dfrac{BA}{3}$ (*)',
    '• المثلثان BDN و BEA في وضعية طالس إذن $\\dfrac{BN}{BA} = \\dfrac{BD}{BE} = \\dfrac{2}{3}$ ومنه $BN = \\dfrac{2BA}{3}$',
    '• لدينا $NA = BA - BN = BA - \\dfrac{2BA}{3} = \\dfrac{BA}{3}$ (**)',
    '• لدينا C منتصف [BD] و (MC)//(ND) إذن M منتصف [BN] ومنه BM = MN (***)',
    'من (*) و (**) و (***) نستنتج أنّ $BM = MN = NA = \\dfrac{BA}{3}$ . و هكذا قسمنا الضلع [AB] إلى 3 قطع متقايسة.',
  ],
  // extraction › figure : B, C, D, E alignés dans cet ordre, BC = CD = DE ; parallèles à (AE) par C et D.
  figure: {
    points: { A: [4, 6], B: [0, 0], C: [3, 1], D: [6, 2], E: [9, 3], M: [4 / 3, 2], N: [8 / 3, 4] },
    segments: [
      ['A', 'B'], ['A', 'C'],
      { from: 'B', to: 'C', ticks: 1 }, { from: 'C', to: 'D', ticks: 1 }, { from: 'D', to: 'E', ticks: 1 },
      { from: 'A', to: 'E', arrows: 1, tone: 'indigo' },
      { from: 'C', to: 'M', arrows: 1, tone: 'indigo' }, { from: 'D', to: 'N', arrows: 1, tone: 'indigo' },
    ],
    labels: { M: 'w', N: 'w', A: 'n', B: 's', E: 'e' },
    ariaLabel: 'مثلث ABC، النقط B و C و D و E على استقامة و BC = CD = DE، والموازيان للمستقيم (AE) المارّان بـ C و D يقطعان [AB] في M و N',
    maxWidth: 320,
  },
};

/** La méthode générale du rayon auxiliaire — FORMULÉE par la plateforme (le manuel la suppose dans ex-17/18). */
export const METHOD_RAY = {
  source: FORMAL,
  title: 'تقسيم قطعة [AB] إلى n قطع متقايسة',
  lines: [
    'نرسم نصف مستقيم [Ax) لا يحمل [AB]، ونعيّن عليه بالمدور n قطعا متقايسة متتالية ابتداءً من A.',
    'نصل العلامة رقم n بالنقطة B.',
    'نرسم بالمسطرة والكوس الموازيات لهذا المستقيم المارّة بالعلامات الأخرى: تقطع [AB] في نقط التقسيم.',
  ],
  why: 'في المثلث الذي رؤوسه A والعلامة n و B، كل موازٍ مارّ بالعلامة k يقطع [AB] في نقطة $M_k$ حيث $\\dfrac{AM_k}{AB} = \\dfrac{k}{n}$ (خاصية طالس)، فالقطع متقايسة، مهما كانت فتحة المدور وميل نصف المستقيم.',
  // le dessin de la justification : n = 3, une ouverture quelconque
  figure: {
    points: { A: [0, 0], B: [9, 0], P1: [1.2, 1.6], P2: [2.4, 3.2], P3: [3.6, 4.8], M1: [3, 0], M2: [6, 0] },
    segments: [
      { from: 'A', to: 'B', bold: true },
      { from: 'A', to: 'P1', ticks: 1 }, { from: 'P1', to: 'P2', ticks: 1 }, { from: 'P2', to: 'P3', ticks: 1 },
      { from: 'P3', to: 'B', arrows: 1, tone: 'indigo' },
      { from: 'P2', to: 'M2', arrows: 1, tone: 'emerald' }, { from: 'P1', to: 'M1', arrows: 1, tone: 'emerald' },
    ],
    rays: [{ from: 'A', through: 'P3', name: 'x', extend: 0.35 }],
    labels: { A: 's', B: 's', M1: 's', M2: 's', P1: 'nw', P2: 'nw', P3: 'nw' },
    ariaLabel: 'نصف مستقيم [Ax) عليه ثلاث قطع متقايسة AP1 و P1P2 و P2P3، والمستقيم (P3B) والموازيان له المارّان بـ P1 و P2 يقطعان [AB] في M1 و M2',
    maxWidth: 320,
  },
};

/* ── module 2 : طرائق — une longueur, un rapport ─────────────────────────────── */

/** طرائق (p. 107) — « إنشاء قطعة مستقيم طولها معلوم », au mot près (extraction › method-construct-length). */
export const METHOD_LENGTH = {
  source: src('method-construct-length', 107, 'طرائق'),
  title: 'إنشاء قطعة مستقيم طولها معلوم',
  exercise: '(وحدة الأطوال هي السنتيمتر) أنشئ قطعة مستقيم [AB] بحيث يكون $AB = \\dfrac{14}{3}$ .',
  solution: [
    'ملاحظة: يمكن كتابة $AB = \\dfrac{14}{3}$ على الشكل $3 \\times AB = 7 \\times 2$ ثم على شكل تناسب $\\dfrac{3}{7} = \\dfrac{2}{AB}$ وتوظيف خاصية طالس.',
    'نرسم نصفي مستقيمين [Ax) و [Ay)، ونعيّن على [Ax) نقطتين C و D حيث AC = 3 و AD = 7. كما نعيّن على [Ay) نقطة E حيث AE = 2.',
    'نرسم الموازي للمستقيم (CE) الذي يشمل D فيقطع [Ay) في نقطة B.',
    'إنّ $AB = \\dfrac{14}{3}$ (ويمكن تبرير ذلك باستعمال خاصية طالس).',
  ],
  why: '(CE)//(DB) و C من [AD] و E من [AB] : $\\dfrac{AC}{AD} = \\dfrac{AE}{AB}$ أي $\\dfrac{3}{7} = \\dfrac{2}{AB}$ ومنه $AB = \\dfrac{14}{3}$ .',
  // [Ax) incliné (65°), [Ay) horizontal ; AC = 3, AD = 7, AE = 2, AB = 14/3
  figure: {
    points: { A: [0, 0], C: [1.268, 2.719], D: [2.958, 6.344], E: [2, 0], B: [14 / 3, 0] },
    segments: [
      { from: 'A', to: 'C', label: '3', labelSide: 1 }, { from: 'A', to: 'E', label: '2' },
      { from: 'C', to: 'E', arrows: 1, tone: 'indigo' }, { from: 'D', to: 'B', arrows: 1, tone: 'indigo' },
    ],
    rays: [{ from: 'A', through: 'D', name: 'x', extend: 0.15 }, { from: 'A', through: 'B', name: 'y', extend: 0.2 }],
    labels: { A: 'sw', C: 'w', D: 'w', E: 's', B: 's' },
    ariaLabel: 'نصفا مستقيمين [Ax) و [Ay)، على الأول C و D حيث AC = 3 و AD = 7، وعلى الثاني E حيث AE = 2، والموازي للمستقيم (CE) المارّ بـ D يقطع [Ay) في B',
    maxWidth: 300,
  },
};

/** طرائق (p. 109) — « إنشاء النقطة التي تقسم قطعة مستقيم إلى نسبة معلومة », au mot près. */
export const METHOD_RATIO = {
  source: src('method-ratio-point', 109, 'طرائق'),
  title: 'إنشاء النقطة التي تقسم قطعة مستقيم إلى نسبة معلومة',
  exercise: '[AB] قطعة مستقيم. أنشئ نقطة M من القطعة [AB] حيث $\\dfrac{MA}{MB} = \\dfrac{3}{2}$ . (استعمل مسطرة غير مدرّجة ومدور)',
  solution: [
    'نرسم مستقيمين (d₁) و (d₂) متوازيين ويشملان النقطتين A و B على الترتيب ومدرجين بانتظام وبنفس الوحدة.',
    'للحصول على وضعية طالس يكفي تعيين نقطة E على (d₂) بحيث BE = 2 ونقطتين K و F على (d₁) بحيث AK = AF = 3.',
    'لدينا (EF) يقطع (AB) في M.',
    'بتطبيق خاصية طالس في المثلثين MAF و MBE ينتج أن $\\dfrac{MA}{MB} = \\dfrac{AF}{EB} = \\dfrac{3}{2}$ .',
    'وبالتالي M هي النقطة من [AB] تقسم [AB] في النسبة $\\dfrac{3}{2}$ .',
  ],
  // extraction › figure : F et E de part et d'autre de (AB) ; K sur (d₁) du côté de E, (EK) coupe (AB) hors de [AB] en N.
  figure: {
    points: {
      A: [0, 0], B: [5, 0], F: [-1.026, -2.819], K: [1.026, 2.819], E: [5.684, 1.879], M: [3, 0], N: [15, 0],
      a1: [-1.4, -3.85], a2: [1.4, 3.85], b1: [4.32, -1.88], b2: [6.03, 2.82],
    },
    segments: [
      { from: 'a1', to: 'a2', tone: 'indigo' }, { from: 'b1', to: 'b2', tone: 'indigo' },
      { from: 'A', to: 'N', dashed: true }, { from: 'A', to: 'B', bold: true },
      { from: 'F', to: 'E', tone: 'rose' }, { from: 'K', to: 'N', tone: 'amber' },
    ],
    hidden: ['a1', 'a2', 'b1', 'b2'],
    labels: { A: 'sw', B: 's', F: 'w', K: 'w', E: 'e', M: 's', N: 's' },
    ariaLabel: 'مستقيمان متوازيان (d1) و (d2) يشملان A و B، F على (d1) تحت A و K فوقها حيث AK = AF = 3، و E على (d2) فوق B حيث BE = 2، (EF) يقطع [AB] في M و (EK) يقطع المستقيم (AB) في N بعد B',
    maxWidth: 380,
  },
};

/** دوري الآن (p. 109), au mot près ; ses réponses sont CALCULÉES (extraction › now-109 › answer). */
export const NOW = {
  source: src('now-109', 109, 'دوري الآن'),
  text: '(xy) مستقيم، A و B نقطتان منه. استعمل مسطرة غير مدرّجة ومدور لإنشاء نقطة C من المستقيم (xy) حيث $\\dfrac{CA}{CB} = \\dfrac{2}{5}$ .',
  hint: 'موازيان مدرّجان بنفس الوحدة يشملان A و B: AF = 2 من جهة و BE = 5 من الجهة الأخرى يعطيان C بين A و B ؛ و AK = 2 من جهة E تعطي نقطة ثانية خارج [AB] .',
  inside: '$AC = \\dfrac{2}{7}AB$',
  outside: '$AC = \\dfrac{2}{3}AB$',
};

/** Les deux points de (AB) — FORMULÉ par la plateforme à partir de la figure p. 109 (K, N) et de دوري الآن. */
export const TWO_POINTS = {
  source: FORMAL,
  title: 'نقطتان من المستقيم (AB)',
  lines: [
    'إذا كان $p \\neq q$ فإن نقطتين من المستقيم (AB) تحقّقان $\\dfrac{MA}{MB} = \\dfrac{p}{q}$ :',
    'العلامتان في جهتين مختلفتين: النقطة M بين A و B و $\\dfrac{AM}{AB} = \\dfrac{p}{p + q}$ ؛',
    'العلامتان في نفس الجهة: النقطة N خارج [AB] — بعد B إذا كان $p > q$ وقبل A إذا كان $p < q$ .',
  ],
  example: 'مثال: $\\dfrac{AM}{AB} = \\dfrac{3}{3 + 2} = \\dfrac{3}{5}$ و $\\dfrac{AN}{AB} = \\dfrac{3}{3 - 2} = 3$ .',
};

/** Une longueur NON rationnelle (اقتراح المنصّة, LP2 « نسبة غير ناطقة ») : √13 puis ses 2/3 par Thalès. */
export const ROOT13 = {
  source: PLATFORM,
  title: 'قطعة طولها $\\dfrac{2}{3}\\sqrt{13}$',
  lines: [
    'نرسم مثلثا قائما ضلعا زاويته القائمة 2 و 3 (بالمسطرة والكوس والمدور): وتره $\\sqrt{2^2 + 3^2} = \\sqrt{13}$ حسب خاصية فيثاغورس.',
    'ننقل الوتر بالمدور فنحصل على قطعة [AB] طولها $\\sqrt{13}$ دون أي قياس.',
    'نقسم [AB] إلى 3 قطع متقايسة بنصف مستقيم مساعد وموازيات، ونأخذ قطعتين: $AM = \\dfrac{2}{3}AB = \\dfrac{2\\sqrt{13}}{3}$ .',
  ],
  figure: {
    points: { A: [0, 0], B: [3, 0], H: [3, 2], P1: [0.9, 1.6], P2: [1.8, 3.2], P3: [2.7, 4.8], M: [2, 0] },
    segments: [
      { from: 'A', to: 'B', label: '3', labelSide: -1 }, { from: 'B', to: 'H', label: '2' }, { from: 'A', to: 'H', label: '√13', tone: 'violet', bold: true },
      { from: 'A', to: 'P1', ticks: 1 }, { from: 'P1', to: 'P2', ticks: 1 }, { from: 'P2', to: 'P3', ticks: 1 },
    ],
    rightAngles: [['A', 'B', 'H']],
    hidden: ['P1', 'P2', 'P3', 'M'],
    labels: { A: 'sw', B: 'se', H: 'ne' },
    ariaLabel: 'مثلث قائم في B ضلعاه AB = 3 و BH = 2 ووتره AH طوله جذر 13، وعلى نصف مستقيم مبدؤه A ثلاث قطع متقايسة',
    maxWidth: 260,
  },
};

/* ── module 0 : « أستعدّ » (plateforme — le manuel n'a pas d'item pour cette leçon) ─────────── */

/**
 * Sept affirmations, une par acquis : tracer une parallèle à l'équerre (insha-muwazi), reporter une longueur
 * au compas (qitaa-mutaqayisa), le quatrième proportionnel (kitabat-tanasub), Thalès (talis-nisab, leçon 1),
 * la réciproque (talis-aksiya, leçon 2), la droite des milieux (mustaqim-muntasafayn), Pythagore
 * (fithaghuris). Aucune n'utilise les nombres du module 1 (10 cm, 3 parts) ni ceux des طرائق.
 */
export const PREP_ITEMS = [
  { skill: 'muwazi', text: 'لرسم المستقيم الذي يشمل نقطة K ويوازي مستقيمًا (d) بالمسطرة والكوس: نضع ضلعًا للكوس على (d) والمسطرة على ضلع آخر له، ثم نزلق الكوس على المسطرة حتى يشمل الضلع الأول النقطة K.', answer: true, why: 'الكوس ينزلق دون أن يدور، فيبقى ضلعه الأول موازيًا لـ (d) في كل مواضعه.', source: addition('prerequisite_diagnostic') },
  { skill: 'mudawwar', text: 'بفتحة مدور ثابتة نعيّن على نصف مستقيم [Oz) النقط R و S و T بحيث $OR = RS = ST$ . عندئذ $OT = 2OR$ .', answer: false, why: 'ثلاث قطع متقايسة: $OT = OR + RS + ST = 3OR$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'tanasub', text: 'من التناسب $\\dfrac{4}{6} = \\dfrac{10}{x}$ نستنتج أنّ $x = 15$ .', answer: true, why: 'الجداء المتصالب: $4 \\times x = 6 \\times 10$ ، فـ $x = \\dfrac{60}{4} = 15$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'talis', text: 'EFG مثلث، R من [EF] و S من [EG] و $(RS) // (FG)$ . إذا كان $ER = 2$ و $EF = 8$ فإنّ $\\dfrac{ES}{EG} = \\dfrac{1}{2}$ .', answer: false, why: 'حسب خاصية طالس $\\dfrac{ES}{EG} = \\dfrac{ER}{EF} = \\dfrac{2}{8} = \\dfrac{1}{4}$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'aksiya', text: 'النقط O و U و V في استقامية، والنقط O و W و Z في استقامية وبنفس الترتيب، و $\\dfrac{OU}{OV} = \\dfrac{OW}{OZ}$ : عندئذ $(UW) // (VZ)$ .', answer: true, why: 'هذه هي الخاصية العكسية لخاصية طالس: النسبتان متساويتان والنقط مرتبة بنفس الترتيب.', source: addition('prerequisite_diagnostic') },
  { skill: 'muntasaf', text: 'KLQ مثلث و I منتصف [KL]. المستقيم الذي يشمل I ويوازي (LQ) يقطع [KQ] في J : عندئذ J منتصف [KQ].', answer: true, why: 'في مثلث، المستقيم الذي يشمل منتصف ضلع ويوازي ضلعا ثانيا يقطع الضلع الثالث في منتصفه.', source: addition('prerequisite_diagnostic') },
  { skill: 'fithaghuris', text: 'مثلث قائم ضلعا زاويته القائمة 1 و 4 : طول وتره 5.', answer: false, why: 'حسب خاصية فيثاغورس: $1^2 + 4^2 = 17$ ، فطول الوتر $\\sqrt{17}$ وليس 5 (لأن $5^2 = 25$ ).', source: addition('prerequisite_diagnostic') },
];

/* ── module 7 : l'item 4 de « أؤكّد تعلّماتي » (p. 112) ──────────────────────── */

const g = (x) => [x, 0];
const h = (x) => [x * 0.7, x * 0.5];
/** QCM item 4, au mot près ; les TROIS réponses sont justes (extraction › qcm › items[3].correct). */
export const QCM4 = {
  source: src('qcm', 112, 'أؤكّد تعلّماتي', 4),
  text: 'نختار تدريجا منتظما على [AB] ونرسم مستقيمات موازية لـ (BC)، كما هو مبيّن في الشكل. ينتج …',
  options: [
    '$\\dfrac{AN}{AC} = \\dfrac{AM}{AB} = \\dfrac{3}{5}$',
    '$\\dfrac{AM}{AB} = \\dfrac{NM}{CB} = \\dfrac{3}{5}$',
    '$5 \\times NM = 3 \\times CB$',
  ],
  // [AB] partagé en 5 parts égales, M la 3e graduation ; parallèles à (BC) qui coupent [AC] ; N sur [AC].
  figure: {
    points: { A: [0, 0], B: [10, 0], C: [7, 5], M: g(6), N: h(6), g1: g(2), g2: g(4), g4: g(8), h1: h(2), h2: h(4), h4: h(8) },
    segments: [
      ['A', 'B'], ['A', 'C'], { from: 'B', to: 'C', arrows: 1, tone: 'indigo' },
      { from: 'g1', to: 'h1', arrows: 1, tone: 'indigo' }, { from: 'g2', to: 'h2', arrows: 1, tone: 'indigo' },
      { from: 'M', to: 'N', arrows: 1, tone: 'indigo' }, { from: 'g4', to: 'h4', arrows: 1, tone: 'indigo' },
      { from: 'A', to: 'g1', ticks: 1 }, { from: 'g1', to: 'g2', ticks: 1 }, { from: 'g2', to: 'M', ticks: 1 }, { from: 'M', to: 'g4', ticks: 1 }, { from: 'g4', to: 'B', ticks: 1 },
    ],
    hidden: ['g1', 'g2', 'g4', 'h1', 'h2', 'h4'],
    labels: { A: 'sw', B: 'se', C: 'n', M: 's', N: 'nw' },
    ariaLabel: 'مثلث ABC، الضلع [AB] مقسم بتدريج منتظم إلى 5 قطع متقايسة و M النقطة الثالثة من A، وموازيات للمستقيم (BC) تمر بنقط التدريج وتقطع [AC]، و N نقطة تقاطع الموازي المار بـ M مع [AC]',
    maxWidth: 320,
  },
};

/* ── ce que la مذكرة du professeur lit comme « وضعية الانطلاق » ────────────────────── */

export const ACTIVITY = {
  source: PLATFORM,
  title: 'لافتة التيفو: تقسيم قطعة دون قياس',
  text: TIFO.text,
  questions: [
    'كم علامة متقايسة نعيّن على نصف المستقيم، وأيّها نصل بالنقطة B ؟',
    'لماذا تكون القطع متقايسة؟ (خاصية طالس)',
    'هل يجب أن تكون فتحة المدور مساوية لـ $\\dfrac{10}{3}$ ؟',
  ],
  closing: 'ثلاث علامات متقايسة على نصف مستقيم مبدؤه A، نصل الثالثة بـ B ونرسم الموازيات: $\\dfrac{AM_1}{AB} = \\dfrac{1}{3}$ و $\\dfrac{AM_2}{AB} = \\dfrac{2}{3}$ مهما كانت فتحة المدور.',
};

/* ── les phrases que les modules écrivent (la carte des connaissances les cite) ─────────── */

export const LINES = {
  marksRight: 'لـ 3 قطع نعيّن 3 علامات متقايسة ونصل الثالثة بـ B : عدد القطع هو رتبة العلامة الموصولة.',
  marksWrong: 'نعيّن علامتين فقط ونصل الثانية بـ B (كأن 3 قطع تحتاج نقطتي تقسيم فقط).',
  marksWhy: 'بعلامتين نقسم [AB] إلى قطعتين: الموازي المارّ بالعلامة الأولى يقطع [AB] في منتصفها.',
  opening: 'فتحة المدور لا تهمّ: المهم أن تكون العلامات متقايسة. فتحتا 2cm و 3cm تعطيان نقطتي التقسيم نفسيهما لأن $\\dfrac{AM_1}{AB} = \\dfrac{1}{3}$ في الحالتين.',
  partWhole: 'لا نخلط بين $\\dfrac{MA}{MB}$ و $\\dfrac{AM}{AB}$ : إذا كان $\\dfrac{MA}{MB} = \\dfrac{3}{2}$ فإنّ AM ثلاثة أجزاء من خمسة، أي $\\dfrac{AM}{AB} = \\dfrac{3}{5}$ .',
  partWholeWrong: 'نكتب $\\dfrac{AM}{AB} = \\dfrac{3}{2}$ ، أي نأخذ نسبة الجزأين على أنها نسبة الجزء إلى الكل.',
  partWholeWhy: 'MA و MB جزءان من AB : $AB = MA + MB$ ، فـ AB خمسة أجزاء متساوية و AM ثلاثة منها.',
  length: 'من $\\dfrac{3}{7} = \\dfrac{2}{AB}$ نجد $3 \\times AB = 7 \\times 2$ أي $AB = \\dfrac{14}{3}$ : الطول المطلوب هو الرابع المتناسب.',
};
