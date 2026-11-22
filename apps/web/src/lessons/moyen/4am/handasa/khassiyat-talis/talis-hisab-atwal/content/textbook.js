/**
 * Le contenu du MANUEL pour le درس « خاصية طالس وحساب الأطوال » (unité 9) — données pures (aucun JSX), au mot
 * près ; chaque bloc cite son élément de docs/sources/4am/unit9/extraction.json : أستعدّ 1–3 (p. 103, module 0)
 * et 4–5 (revisités au module 4), نشاط 1 (p. 104), معارف 1 et 2 (p. 106), طرائق « حساب أطوال » et دوري الآن
 * (p. 107), QCM 1–2 (p. 112). Ce que la plateforme ajoute est déclaré (`addition(…)`).
 * Deux coquilles du manuel sont CORRIGÉES ici (extraction › correction) : l'exemple de معارف 2 (MN/AC → MN/BC)
 * et la ligne de la طريقة (1/2 → 2/1) ; l'item 5 de أستعدّ (ADE → ADF) est dans PREP_REVISITED.
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;

/** نشاط 1 (p. 104) — « خاصية طالس » : la حالة الأولى, la حالة الثانية, le texte à compléter. */
export const ACTIVITY = {
  source: src('act-1', 104, 'أنشطة', 1),
  title: 'خاصية طالس',
  situation: 'عرض سينمائي مجّاني في الحي يتطوّع به نادي المتوسطة لأهل الحي: جهاز الإسقاط في A يرسل حزمة ضوئية نحو الشاشة الكبيرة. أين نضع شاشة صغيرة لتأتي الصورة عليها تصغيرا للصورة الكبيرة؟',
  case1: '(d) و (d′) مستقيمان متقاطعان في النقطة A. B نقطة من (d) و C نقطة من (d′)، تختلفان عن A. B′ نقطة من [AB] و C′ نقطة من [AC] بحيث (B′C′)//(BC)، كما في الشكل. انقل وأتمم: $\\dfrac{AB\'}{AB} = \\dfrac{\\ldots}{\\ldots} = \\dfrac{\\ldots}{\\ldots}$',
  case1Numeric: [
    'نفرض أن $AB = 6\\,\\mathrm{cm}$ ، $AC = 7\\,\\mathrm{cm}$ و $AB\' = 3{,}2\\,\\mathrm{cm}$ . احسب AC′.',
    'إذا كان $BC = 6{,}1\\,\\mathrm{cm}$ ، احسب B′C′.',
  ],
  case2: 'لاحظ وضعية النقط A، B، B′ و النقط A، C، C′ في الشكل المرفق. أ) أنشئ النقطتين B″ و C″ نظيرتي النقطتين B′ و C′ على الترتيب بالنسبة إلى A. ب) علما أن (B′C′)//(BC)، برّر توازي المستقيمين (BC) و (B″C″). جـ) اشرح لماذا $\\dfrac{AB\'\'}{AB} = \\dfrac{AC\'\'}{AC} = \\dfrac{B\'\'C\'\'}{BC}$ . د) استنتج أن $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{B\'C\'}{BC}$ .',
  case2Numeric: [
    'نفرض أن $AB = 3{,}2\\,\\mathrm{cm}$ ، $AC = 4{,}5\\,\\mathrm{cm}$ و $BC = 3\\,\\mathrm{cm}$ . احسب AC′ علما أن $AB\' = 1{,}6\\,\\mathrm{cm}$ .',
    'استنتج قيمة B′C′.',
  ],
  part3: 'انقل ما يلي وأتمم: « A، B، B′ تقع على استقامية والنقط A، C، C′ تقع كذلك على استقامية. إذا كان المستقيمان (BC) و … متوازيين فإن $\\dfrac{\\ldots}{AB} = \\dfrac{AC\'}{\\ldots} = \\dfrac{\\ldots}{BC}$ ». يسمى هذا النص «خاصية طالس».',
  statement: 'إذا كان المستقيمان $(BC)$ و $(B\'C\')$ متوازيين فإن $\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC} = \\dfrac{B\'C\'}{BC}$',
  numbers: { AB: 6, AC: 7, BC: 6.1, ABp: 3.2 },
  numbers2: { AB: 3.2, AC: 4.5, BC: 3, ABp: 1.6 },
  answer: { ACp: '56/15', BpCp: '244/75', ACp2: 2.25, BpCp2: 1.5 },
};

/** Les calculs du نشاط 1 écrits par la plateforme (le livre les demande sans les écrire). */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  case1AC: '$\\dfrac{AB\'}{AB} = \\dfrac{AC\'}{AC}$ أي $\\dfrac{3{,}2}{6} = \\dfrac{AC\'}{7}$ ومنه $AC\' = \\dfrac{7 \\times 3{,}2}{6} = \\dfrac{56}{15} \\approx 3{,}73\\,\\mathrm{cm}$ .',
  case1BC: '$\\dfrac{B\'C\'}{BC} = \\dfrac{AB\'}{AB} = \\dfrac{8}{15}$ ومنه $B\'C\' = \\dfrac{8}{15} \\times 6{,}1 = \\dfrac{244}{75} \\approx 3{,}25\\,\\mathrm{cm}$ .',
  case2Sym: 'التناظر المركزي بالنسبة إلى A يحوّل المستقيم $(B\'C\')$ إلى المستقيم $(B\'\'C\'\')$ الموازي له ويحفظ الأطوال: $AB\'\' = AB\'$ ، $AC\'\' = AC\'$ ، $B\'\'C\'\' = B\'C\'$ . و $(B\'C\') \\parallel (BC)$ إذن $(B\'\'C\'\') \\parallel (BC)$ .',
  case2AC: '$\\dfrac{AB\'}{AB} = \\dfrac{1{,}6}{3{,}2} = \\dfrac{1}{2}$ ومنه $AC\' = \\dfrac{1}{2} \\times 4{,}5 = 2{,}25\\,\\mathrm{cm}$ .',
  case2BC: '$B\'C\' = \\dfrac{1}{2} \\times 3 = 1{,}5\\,\\mathrm{cm}$ .',
};

/** معارف 1 (p. 106) — خاصية طالس, ses trois figures, le tableau de proportionnalité, les deux ملاحظتان. */
export const KNOW1 = {
  source: src('know-1', 106, 'معارف', 1),
  title: 'خاصية طالس',
  property: '(BM) و (CN) مستقيمان متقاطعان في النقطة A. إذا كان (MN) و (BC) متوازيين فإنّ $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$ .',
  positions: ['M و N على [AB] و [AC]', 'M و N على امتداد [AB] و [AC]', 'M و N من الجهة الأخرى للنقطة A'],
  results: 'الجدول الآتي هو جدول تناسبية:',
  resultsTable: '$\\begin{array}{|c|c|c|c|} \\hline \\text{AMN} & AM & AN & MN \\\\ \\hline \\text{ABC} & AB & AC & BC \\\\ \\hline \\end{array}$',
  resultsRows: 'السطر الأول: أطوال أضلاع المثلث AMN ؛ السطر الثاني: أطوال أضلاع المثلث ABC.',
  resultsEnd: 'والمثلث AMN هو تكبير أو تصغير للمثلث ABC.',
  remark1: '(BM) و (CN) مستقيمان متقاطعان في النقطة A. يكفي عدم تساوي نسبتين من النسب $\\dfrac{AM}{AB}$ ، $\\dfrac{AN}{AC}$ و $\\dfrac{MN}{BC}$ للقول أنّ المستقيمين (MN) و (BC) غير متوازيين.',
  remark1Answer: '$\\dfrac{AM}{AB} = \\dfrac{2}{3}$ و $\\dfrac{AN}{AC} = \\dfrac{1}{2}$ : النسبتان مختلفتان، (MN) و (BC) غير متوازيين.',
  remark2: 'تسمح خاصية طالس بحساب الأطوال والنسب وإثبات عدم توازي مستقيمين.',
};

/** معارف 2 (p. 106) — خاصية طالس وتناسب الأطوال : k, تكبير / تصغير ; l'exemple CORRIGÉ (MN/AC → MN/BC). */
export const KNOW2 = {
  source: src('know-2', 106, 'معارف', 2),
  title: 'خاصية طالس وتناسب الأطوال',
  lines: [
    'ABC و AB′C′ مثلثان في وضعية طالس.',
    'لاستنتاج الأطوال المتناسبة في المثلثين ننظم رؤوسهما كالآتي: $\\begin{array}{ccc} A & B & C \\\\ A & B\' & C\' \\end{array}$',
    'ثم ننشئ جدول التناسبية التالي: $\\begin{array}{|c|c|c|} \\hline AB & AC & BC \\\\ \\hline AB\' & AC\' & B\'C\' \\\\ \\hline \\end{array} \\; \\times k$',
    'معامل التناسبية هو العدد الموجب تماما k. ولدينا $AB\' = k \\times AB$ و $AC\' = k \\times AC$ و $B\'C\' = k \\times BC$ .',
    'في الحالة $k < 1$ : k هو معامل التصغير والمثلث AB′C′ تصغير للمثلث ABC.',
    'في الحالة $k > 1$ : k هو معامل التكبير والمثلث AB′C′ تكبير للمثلث ABC.',
  ],
  example: 'المثلثان AMN و ABC في وضعية طالس. لدينا $\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC} = \\dfrac{1}{3}$ ومنه $AM = \\dfrac{1}{3}AB$ و $AN = \\dfrac{1}{3}AC$ و $MN = \\dfrac{1}{3}BC$ . لدينا معامل التناسبية هو $\\dfrac{1}{3}$ إذن المثلث AMN هو تصغير للمثلث ABC.',
  correction: 'تنبيه: النسبة الثالثة هي $\\dfrac{MN}{BC}$ لا $\\dfrac{MN}{AC}$ ، فالضلع الموافق للضلع $[MN]$ هو $[BC]$ (ومنه $MN = \\dfrac{1}{3}BC$).',
};

/** طرائق (p. 107) — « حساب أطوال » : l'exercice résolu, la ligne CORRIGÉE (1/2 → 2/1). */
export const METHOD = {
  source: src('method-lengths', 107, 'طرائق'),
  title: 'حساب أطوال',
  exercise: 'ABCD متوازي أضلاع حيث $AB = 5$ و $BC = 3$ (الوحدة $1\\,\\mathrm{cm}$). M نقطة من القطعة [AD] حيث $AM = 2$ . المستقيم (BM) يقطع المستقيم (DC) في N. انجز شكلا مناسبا ثم احسب DN.',
  solution: [
    'حساب DN: لدينا $(AB) \\parallel (CD)$ (لأنّ ABCD متوازي أضلاع)، بما أن N تقع على (DC) إذن $(DN) \\parallel (AB)$ ، ينتج أنّ المثلثين MAB و MDN في وضعية طالس، وبالتالي يكون $\\dfrac{MA}{MD} = \\dfrac{MB}{MN} = \\dfrac{AB}{DN}$ .',
    'نحتفظ بالمساواة المناسبة $\\dfrac{MA}{MD} = \\dfrac{AB}{DN}$',
    'أي $\\dfrac{2}{1} = \\dfrac{5}{DN}$ ومنه $DN = \\dfrac{5}{2} = 2{,}5$ .',
  ],
  correction: 'تنبيه: نكتب $\\dfrac{2}{1} = \\dfrac{5}{DN}$ لا $\\dfrac{1}{2} = \\dfrac{5}{DN}$ ، لأن $MA = 2$ و $MD = 3 - 2 = 1$ .',
};

/**
 * Ce que la plateforme FORMALISE de la طريقة (déclaré `knowledge_formalization`) : les quatre gestes que
 * la solution du manuel enchaîne, nommés.
 */
export const METHOD_RULE = {
  source: addition('knowledge_formalization'),
  lines: [
    'نتأكد من وضعية طالس: مستقيمان متقاطعان، ومستقيمان متوازيان يقطعانهما.',
    'نكتب النسب الثلاث المتساوية، بالترتيب نفسه: طول من المثلث الأول على الطول الموافق له في الثاني.',
    'نحتفظ بالمساواة المناسبة: نسبتان فيهما الطول المطلوب وثلاثة أطوال معلومة.',
    'نحسب الطول المطلوب بالجداء المتصالب.',
  ],
};

/** دوري الآن (p. 107). */
export const NOW = {
  source: src('now-107', 107, 'دوري الآن'),
  text: 'في الشكل المقابل المستقيمان (UT) و (VW) متقاطعان في النقطة E. والمستقيمان (UV) و (WT) متوازيان. احسب الطول EW.',
  answer: 3.15,
  explain: 'المثلثان EUV و ETW في وضعية طالس: $\\dfrac{EW}{EV} = \\dfrac{ET}{EU}$ أي $\\dfrac{EW}{2{,}25} = \\dfrac{5{,}25}{3{,}75}$ ومنه $EW = \\dfrac{2{,}25 \\times 5{,}25}{3{,}75} = 3{,}15$ .',
};

/** « أؤكّد تعلّماتي » (p. 112) — items 1 et 2 (extraction › destinations › qcm : duplicatedIn ce درس, module 8 — ex-module 5 avant les « مسائل »). */
const QCM_SRC = (n) => src('qcm', 112, 'أؤكّد تعلّماتي', n);
export const QCM = {
  1: { source: QCM_SRC(1), text: 'في الشكل الآتي (BC)//(IJ). ينتج ………' },
  2: { source: QCM_SRC(2), text: 'في الشكل الآتي، (LM)//(BC) ينتج ………' },
};

/**
 * « أستعدّ » — les items 1–3 du manuel (p. 103) et trois affirmations de la plateforme. Trois acquis : le
 * quatrième proportionnel / produit en croix (rabi-mutanasib), la droite des milieux (mustaqim-muntasafayn),
 * le tableau de proportionnalité (jadwal-tanasub). Aucune n'utilise les nombres du نشاط 1.
 */
const PREP_ADD = addition('prerequisite_diagnostic');
const PREP_SRC = (n) => src('prep', 103, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: 1, skill: 'rabi', text: 'من المساواة $\\dfrac{3}{4} = \\dfrac{1{,}5}{x}$ ينتج أن $x = 2$ .', answer: true, why: '$3 \\times x = 4 \\times 1{,}5 = 6$ إذن $x = 2$ .', source: PREP_SRC(1) },
  { n: 2, skill: 'muntasaf', text: 'ABC مثلث. I منتصف [AB] و J منتصف [AC]. ينتج أن $(IJ) \\parallel (BC)$ .', answer: true, why: 'المستقيم الذي يشمل منتصفي ضلعين في مثلث يوازي حامل الضلع الثالث.', source: PREP_SRC(2) },
  { n: 3, skill: 'muntasaf', text: 'ABC مثلث. I منتصف [AB] و J منتصف [AC]. ينتج أن $IJ = \\dfrac{1}{2}BC$ .', answer: true, why: 'طول القطعة الواصلة بين منتصفي ضلعين في مثلث يساوي نصف طول الضلع الثالث.', source: PREP_SRC(3) },
  { n: 4, skill: 'rabi', text: 'من المساواة $\\dfrac{2}{5} = \\dfrac{x}{10}$ ينتج أن $x = 25$ .', answer: false, why: '$5 \\times x = 2 \\times 10 = 20$ إذن $x = 4$ ؛ العدد 25 يأتي من قلب إحدى النسبتين.', source: PREP_ADD },
  { n: 5, skill: 'muntasaf', text: 'ABC مثلث فيه $AC = 10$ . I منتصف [AB] والمستقيم الذي يشمل I ويوازي (BC) يقطع [AC] في J. إذن $AJ = 4$ .', answer: false, why: 'المستقيم الذي يشمل منتصف ضلع ويوازي ضلعا ثانيا يقطع الضلع الثالث في منتصفه: $AJ = 5$ .', source: PREP_ADD },
  { n: 6, skill: 'jadwal', text: 'الجدول $\\begin{array}{|c|c|c|} \\hline 2 & 4 & 5 \\\\ \\hline 5 & 7 & 8 \\\\ \\hline \\end{array}$ جدول تناسبية لأننا نضيف 3 إلى كل عدد.', answer: false, why: 'في جدول تناسبية نضرب في العدد نفسه: $\\dfrac{5}{2} = 2{,}5$ لكن $\\dfrac{7}{4} = 1{,}75$ . إضافة العدد نفسه لا تعطي جدول تناسبية.', source: PREP_ADD },
];

/** « أستعدّ » items 4 et 5 (p. 103) — revisités au module 4 (« الآن يمكنك أن تقرّر »). Item 5 CORRIGÉ (ADE → ADF). */
export const PREP_REVISITED = [
  { n: 4, text: 'ABC مثلث حيث (AB)//(DE). إذن $BE = 4$ .', answer: true,
    why: '$\\dfrac{CD}{CA} = \\dfrac{CE}{CB}$ أي $\\dfrac{6}{9} = \\dfrac{8}{CB}$ إذن $CB = 12$ و $BE = 12 - 8 = 4$ (الطول $AB = 7$ لا يُستعمل).', source: PREP_SRC(4) },
  { n: 5, text: 'في الشكل المقابل حيث (CE)//(DF) ينتج: أطوال المثلث ACE متناسبة مع أطوال المثلث ADF.', answer: true,
    why: 'C من (AD) و E من (AF) و $(CE) \\parallel (DF)$ : المثلثان ACE و ADF في وضعية طالس فأطوال أضلاعهما متناسبة.', source: PREP_SRC(5),
    correction: 'تنبيه: المثلث المقصود هو ADF ، فالمثلث ADE ليس في وضعية طالس مع المثلث ACE.' },
];

/** Le monde مبتدئ du lab (plateforme) : la projection du quartier, AB = 4, AC = 5, BC = 3. */
export const CINEMA = { source: PLATFORM, numbers: { AB: 4, AC: 5, BC: 3, mode: 'projector' } };
/**
 * Le monde du مبتدئ (2026-10-13) : « ساحة الحيّ » (shadow-world). Ce lab-ci DÉCOUVRE la règle (ombre ÷ hauteur : le même
 * nombre pour tous les objets verticaux, car les rayons du soleil sont parallèles) avant que نشاط 1 (متقدم) la lise
 * sur le faisceau. Une minaret de 5 m (≠ celle de la synthèse, 7,25 m : le تحدّ de l'unité reste entier pour elle).
 */
export const SHADOW_WORLD = {
  source: PLATFORM,
  beginner: { minaret: '5', theme: 'minaret' },
  advanced: { minaret: '6,5', theme: 'minaret' },
};

/**
 * Ce que la plateforme ÉCRIT autour de « ساحة الحيّ » (module 1) : la situation, le passage de la Place à la figure,
 * l'égalité de Thalès qu'elle porte, un calcul sur les objets de la place (le lampadaire de 2,75 m et le palmier à 14:00, k = 1,2 — depuis le
 * 2026-11-10 : 3 m et 4,5 m étaient des nombres de la مسألة du module 5, content/forbidden.js).
 * Le manuel (نشاط 1) suit : ses figures générales A, B, C, B′, C′ disent la MÊME chose avec d'autres lettres.
 */
export const SHADOW_STEPS = {
  source: PLATFORM,
  situation: 'ساحة الحيّ بعد الظهر: مئذنة، نخلة، عمود إنارة، وأنت. الشمس تصنع ظلًّا لكل شيء. كيف نعرف ارتفاع شيء لا نستطيع الصعود إليه؟',
  bridge: 'نمثّل ما رأيته في الساحة: $A$ قاعدة المئذنة و $M$ قمّتها، $B$ قاعدة العصا و $E$ قمّتها، و $O$ نهاية الظلّ المشتركة حين ينتهي ظلّا العصا والمئذنة معًا.',
  parallel: 'المئذنة والعصا شاقوليتان، أي عموديتان على الأرض $(OA)$ ، فهما متوازيتان: $(AM) \\parallel (BE)$ . وشعاع الشمس $(OM)$ يمرّ برأسيهما معًا: إنه القاطع الذي يربط المثلثين $OBE$ و $OAM$ .',
  equality: 'المثلثان $OBE$ و $OAM$ في وضعية طالس: لهما الرأس $O$ و $(BE) \\parallel (AM)$ ، إذن $\\dfrac{OB}{OA} = \\dfrac{OE}{OM} = \\dfrac{BE}{AM}$ . وهذا ما كتبتَه بقاعدتك في الساحة: النسبة بين الظلّ والطول واحدة لكل الأشياء الشاقولية في اللحظة نفسها.',
  calc: 'الساعة 14:00 في ساحة الحيّ: عمود الإنارة طوله $2{,}75\\,\\mathrm{m}$ وظلّه $3{,}3\\,\\mathrm{m}$ ، وظلّ النخلة $9{,}3\\,\\mathrm{m}$ .',
  calcLine: 'أشعّة الشمس متوازية: النسبة بين الظلّ والطول واحدة للعمود وللنخلة. $\\dfrac{9{,}3}{3{,}3} = \\dfrac{h}{2{,}75}$ ومنه $h = \\dfrac{9{,}3 \\times 2{,}75}{3{,}3} = 7{,}75\\,\\mathrm{m}$ . (أو: $\\dfrac{3{,}3}{2{,}75} = 1{,}2$ فالظلّ يساوي $1{,}2$ مرّة الطول، و $\\dfrac{9{,}3}{1{,}2} = 7{,}75$ .)',
  // les deux réponses fausses que le module reconnaît : multiplier au lieu de diviser, retrancher l'écart (ombre − hauteur du lampadaire)
  wrong: { times: 11.16, minus: 8.75 },
  answers: { palm: 7.75 },
  // LECTEUR DE MISSION (2026-11-10) : l'élève y a joué le labo à un couloir (un lampadaire, un château d'eau) — pas la minaret du monde de la page
  equalityPlayer: 'المثلثان $OBE$ و $OAM$ في وضعية طالس: لهما الرأس $O$ و $(BE) \\parallel (AM)$ ، إذن $\\dfrac{OB}{OA} = \\dfrac{OE}{OM} = \\dfrac{BE}{AM}$ . وهذا ما وجدته في الساحة: النسبة بين الظلّ والطول واحدة لكل الأشياء الشاقولية في اللحظة نفسها.',
};
