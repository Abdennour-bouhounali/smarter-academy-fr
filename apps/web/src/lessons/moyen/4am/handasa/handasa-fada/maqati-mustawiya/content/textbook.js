/**
 * Le contenu du MANUEL pour le درس « المقاطع المستوية للمجسمات المألوفة » (unité 14) — données pures (aucun JSX), au mot près ;
 * chaque bloc cite son élément de docs/sources/4am/unit14/extraction.json : نشاط 2, 3, 4, 5 (pp. 164–165, module 1), معارف 3
 * (p. 168, module 2), طرائق « حساب نصف قطر مقطع كرة بمستو » et دوري الآن (p. 169, module 3). Ce que la plateforme ajoute est
 * déclaré (`addition(…)`) : les réponses que le livre demande sans les écrire, la معرفة de la pyramide et du cône (page absente du
 * scan), le « أستعدّ » (le livre n'a pas d'item pour cette leçon).
 * Lectures honorées (extraction › discrepancies) : act-3 — l'étiquette « I » égarée de la partie 2 est retirée ; act-5 — F, G, H
 * définis (« نقط تقاطع (P) مع [SB]، [SC]، [SD] ») ; know-3 — l'intitulé « ب) مقطع بلاطة قائمة بمستو » rétabli ; la معرفة
 * pyramide / cône écrite par la plateforme ; method-section-radius — « فيثاغورث » uniformisé en « فيثاغورس ».
 * Les crochets [NS], [CG]… sont des îles $…$ (un crochet nu est miroité en RTL).
 */
import { src, addition } from '../../_unit/unitMeta.js';

const PLATFORM = addition('interaction_generation');
export const PLATFORM_SOURCE = PLATFORM;
export const FORMALIZATION_SOURCE = addition('knowledge_formalization');

/** نشاط 2 (p. 164) — « مقطع كُرة بمستو ». */
export const ACTIVITY = {
  source: src('act-2', 164, 'أنشطة', 2),
  title: 'مقطع كُرة بمستو',
  situation: 'في نادي العلوم بالثانوية تبني الطابعة ثلاثية الأبعاد المجسم طبقة بعد طبقة: الفوهة تمرّ في مستو أفقي وتضع خيط البلاستيك حيث يقطع هذا المستوي المجسم. كل طبقة هي إذن مقطع المجسم بمستو. ما شكل طبقات كرة؟ وطبقات بلاطة أو أسطوانة أو هرم؟',
  intro: 'وحدة الأطوال هي السنتيمتر. (d) كرة مركزها O و نصف قطرها 3 . I نقطة من قطرها $[NS]$ . (P) هو المستوي العمودي في النقطة I على المستقيم $(NS)$ . يُسمّى الطول OI المسافة بين النقطة O و المستوي (P)، نضع $OI = x$ . (انظر الشكل). نسمي مقطع الكرة (d) بالمستوي (P) مجموعة النقط المشتركة بين الكرة (d) و المستوي (P).',
  part1: '1) لتكن M نقطة من هذا المقطع، اكتب عبارة $IM^2$ بدلالة x. حدّد في كل حالة ممّا يلي طبيعة و عناصر المقطع المتحصّل عليه. $x = 0$ ؛ $x = 1{,}25$ ؛ $x = 2$ ؛ $x = 2{,}8$',
  part2: '2) حدّد موضع النقطة M في حالة $x = 3$ . ما هي النقط المشتركة بين الكرة و المستوي في هذه الحالة؟',
  questions: [
    'لتكن M نقطة من المقطع: اكتب $IM^2$ بدلالة x.',
    'حدّد طبيعة المقطع وعناصره عندما $x = 0$ ؛ $1{,}25$ ؛ $2$ ؛ $2{,}8$ .',
    'حدّد موضع M عندما $x = 3$ : ما النقط المشتركة بين الكرة والمستوي؟',
  ],
  closing: 'كلما ابتعد المستوي (P) عن المركز O صغُر نصف قطر المقطع؛ وعندما $x = 3$ تنطبق M على I = N: للكرة و المستوي نقطة مشتركة وحيدة، المستوي مماس للكرة في N.',
};
/** Les réponses du نشاط 2 (extraction › act-2 › answer, calculées) — ce que la plateforme écrit sous les questions. */
export const ACTIVITY_LINES = {
  source: PLATFORM,
  im2: 'المثلث OIM قائم في I لأن $(IM)$ محتواة في (P) العمودي على $(NS)$ ، و $OM = 3$ لأن M من الكرة؛ حسب خاصية فيثاغورس: $IM^2 = OM^2 - OI^2 = 9 - x^2$ .',
  x0: '$x = 0$ : $IM^2 = 9$ و $IM = 3$ : المقطع دائرة مركزها I = O ونصف قطرها 3 (دائرة كبرى).',
  x125: '$x = 1{,}25$ : $IM^2 = 9 - 1{,}5625 = 7{,}4375$ و $IM = \\dfrac{\\sqrt{119}}{4} \\approx 2{,}73$ : دائرة مركزها I.',
  x2: '$x = 2$ : $IM^2 = 9 - 4 = 5$ و $IM = \\sqrt{5} \\approx 2{,}24$ : دائرة مركزها I.',
  x28: '$x = 2{,}8$ : $IM^2 = 9 - 7{,}84 = 1{,}16$ و $IM = \\dfrac{\\sqrt{29}}{5} \\approx 1{,}08$ : دائرة مركزها I.',
  x3: '$x = 3$ : $IM^2 = 9 - 9 = 0$ ، فـ M منطبقة على I = N: للكرة والمستوي نقطة مشتركة وحيدة N، والمستوي مماس للكرة في N.',
};

/** نشاط 3 (pp. 164–165) — « مقطع بلاطة قائمة بمستو ». */
export const ACTIVITY_3 = {
  source: src('act-3', 164, 'أنشطة', 3),
  title: 'مقطع بلاطة قائمة بمستو',
  part1: '1) نقطع البلاطة القائمة ABCDEFGH بمستو يوازي الوجه CBFG. من بين الشكلين الآتيين، ما هو الشكل الذي يُبيّن المقطع المُناسب؟ اشرح ثُمّ احسب مساحة هذا المقطع.',
  part2: '2) نقطع البلاطة القائمة ABCDEFGH بمستو يوازي الحرف $[CG]$ . حيث $BN = 17\\,\\mathrm{cm}$ و $DM = 21\\,\\mathrm{cm}$ . من بين الشكلين (1) و(2)، ما هو الشكل الذي يُبيّن المقطع المناسب؟ اشرح، ثُمّ احسب مساحة هذا المقطع.',
  dims: 'أبعاد البلاطة في الشكلين: $DC = 25\\,\\mathrm{cm}$ ، $DA = 20\\,\\mathrm{cm}$ ، $DH = 6\\,\\mathrm{cm}$ .',
  strayLabel: 'في شكلي الجزء 2 من الكتاب حرف «I» لا يسمّي أي نقطة من النص (بقي من الجزء 1)؛ حذفته المنصّة.',
};
export const ACTIVITY_3_LINES = {
  source: PLATFORM,
  face: 'الشكل (1) هو المناسب: المستوي يقطع الأحرف $[DC]$ و $[AB]$ و $[EF]$ و $[HG]$ العمودية على الوجه CBFG، فالمقطع IJKL يوازي هذا الوجه؛ في الشكل (2) المستوي يشمل الحرف $[GF]$ من الوجه CBFG فلا يوازيه.',
  faceArea: 'المقطع IJKL مستطيل له نفس بعدي الوجه CBFG: $IJ = CB = 20$ و $IL = CG = 6$ ، ومساحته $20 \\times 6 = 120\\,\\mathrm{cm}^2$ .',
  edge: 'الشكل (2) هو المناسب: $[MO]$ و $[NP]$ يوازيان $[CG]$ فالمستوي MNPO يوازي الحرف $[CG]$ ؛ في الشكل (1) المستوي MNG يشمل G من $[CG]$ فيقطعه ولا يوازيه.',
  edgeLengths: '$CM = DC - DM = 25 - 21 = 4$ و $CN = BC - BN = 20 - 17 = 3$ ؛ المثلث MCN قائم في C: $MN^2 = 4^2 + 3^2 = 25$ و $MN = 5\\,\\mathrm{cm}$ .',
  edgeArea: 'المقطع MNPO مستطيل بعداه $MN = 5$ و $MO = CG = 6$ ، ومساحته $5 \\times 6 = 30\\,\\mathrm{cm}^2$ .',
};

/** نشاط 4 (p. 165) — « مقطع أسطوانة الدوران بمستو ». */
export const ACTIVITY_4 = {
  source: src('act-4', 165, 'أنشطة', 4),
  title: 'مقطع أسطوانة الدوران بمستو',
  intro: 'أسطوانة دوران نصف قطر قاعدتها $1{,}7\\,\\mathrm{cm}$ و ارتفاعها $6\\,\\mathrm{cm}$ . في الشكل (1): المستوي (P) يقطع الأسطوانة و يُوازي محورها حيث يكون بُعد النقطة O عن المستقيم $(IK)$ هو $0{,}8\\,\\mathrm{cm}$ . في الشكل (2): المستوي (P) يقطع الأسطوانة و يُوازي قاعدتها.',
  question: 'حدّد في كل شكل طبيعة المقطع الناتج ثمّ أنشئه بأبعاده الحقيقية.',
};
export const ACTIVITY_4_LINES = {
  source: PLATFORM,
  axis: 'الشكل (1): المقطع KILJ مستطيل (المستوي يوازي المحور)، أحد بعديه $KJ = IL = 6\\,\\mathrm{cm}$ (ارتفاع الأسطوانة).',
  width: 'H منتصف الوتر $[KI]$ لأن $OK = OI = 1{,}7$ ، والمثلث OHI قائم في H: $HI^2 = 1{,}7^2 - 0{,}8^2 = 2{,}89 - 0{,}64 = 2{,}25$ ، $HI = 1{,}5$ و $KI = 3\\,\\mathrm{cm}$ .',
  draw: 'نُنشئ مستطيلا بُعداه $3\\,\\mathrm{cm}$ و $6\\,\\mathrm{cm}$ .',
  base: 'الشكل (2): المقطع دائرة مركزها B على المحور ونصف قطرها $1{,}7\\,\\mathrm{cm}$ ، تقايس القاعدة.',
};

/** نشاط 5 (p. 165) — « مقطع هرم بمستو » (doublé dans « التكبير والتصغير »). */
export const ACTIVITY_5 = {
  source: src('act-5', 165, 'أنشطة', 5),
  title: 'مقطع هرم بمستو',
  intro: 'SABCD هرم منتظم قاعدته المربع ABCD حيث $AB = 4\\,\\mathrm{cm}$ . E نقطة من الحرف $[SA]$ حيث $SE = \\dfrac{3}{4}SA$ . (P) هو المستوي الموازي للقاعدة و الذي يشمل النقطة E. نقبل أنّ $(AD) \\parallel (EH)$ و $(BC) \\parallel (FG)$ و $(DC) \\parallel (HG)$ و $(AB) \\parallel (EF)$ و $(EG) \\parallel (AC)$ .',
  completion: 'أتمّت المنصّة النص: F و G و H هي نقط تقاطع (P) مع الأحرف $[SB]$ و $[SC]$ و $[SD]$ على الترتيب.',
  part1: '1) احسب EH ؛ HG ؛ FG ؛ EF.',
  part2: '2) احسب AC ثم استنتج أنّ $EG = 3\\sqrt{2}\\,\\mathrm{cm}$ .',
  part3: '3) تحقّق أنّ $EG^2 = EF^2 + FG^2$ ثم استنتج طبيعة الرباعي EFGH.',
};
export const ACTIVITY_5_LINES = {
  source: PLATFORM,
  thales: 'في المثلث SAB: E من $[SA]$ و F من $[SB]$ و $(EF) \\parallel (AB)$ ، حسب خاصية طالس $\\dfrac{EF}{AB} = \\dfrac{SE}{SA} = \\dfrac{3}{4}$ ، إذن $EF = 3\\,\\mathrm{cm}$ ؛ وبنفس الطريقة في المثلثات SAD و SBC و SDC: $EH = FG = HG = 3\\,\\mathrm{cm}$ .',
  diag: '$AC^2 = 4^2 + 4^2 = 32$ ، $AC = 4\\sqrt{2}\\,\\mathrm{cm}$ ؛ وفي المثلث SAC: $EG = \\dfrac{3}{4} \\times 4\\sqrt{2} = 3\\sqrt{2}\\,\\mathrm{cm}$ .',
  square: '$EG^2 = 18$ و $EF^2 + FG^2 = 9 + 9 = 18$ : المثلث EFG قائم في F. أضلاع EFGH الأربعة متقايسة وله زاوية قائمة: EFGH مربع ضلعه $3\\,\\mathrm{cm}$ .',
  reduction: 'المقطع EFGH تصغير للقاعدة ABCD بنسبة $\\dfrac{3}{4}$ .',
};

/** معارف 3 (p. 168) — « المقاطع المستوية لمجسمات مألوفة ». */
export const KNOW3 = {
  source: src('know-3', 168, 'معارف', 3),
  title: 'المقاطع المستوية لمجسمات مألوفة',
  sphereTitle: 'أ) مقطع كُرة بمستو',
  property: 'خاصية: مقطع كُرة بمستو هو دائرة.',
  setup: '(S) كرة مركزها O و نصف قطرها R. ليكن $[NS]$ أحد أقطارها. (P) هو المستوي العمودي على $(NS)$ في النقطة A. يُعبّر الطول OA عن المسافة بين النقطة O و المستوي (P). نضع $OA = h$ .',
  outside: 'إذا كان $h > R$ فإنّ المستوي (P) لا يقطع الكُرة.',
  inside: 'إذا كان $0 < h < R$ فإنّ مقطع الكرة (S) بالمستوي (P) هو الدائرة ذات المركز A و نصف القطر AM حيث $AM = \\sqrt{MO^2 - OA^2}$ لأنّه من أجل كل نقطة M من هذه الدائرة فإنّ المثلث OAM قائم في A.',
  zero: 'إذا كان $h = 0$ (أيّ أنّ النقطتين A و O منطبقتان) فإنّ مقطع الكرة (S) بالمستوي (P) هو الدائرة التي مركزها O و نصف قطرها R. مقطع الكرة بهذا المستوي في هذه الحالة هي دائرة كبرى.',
  tangent: 'إذا كان $h = R$ : المستوي (P) و الكرة (S) يشتركان في نقطة واحدة إمّا N و إمّا S. في هذه الحالة يكون المستوي (P) مماسًا للكرة في إحدى النقطتين إمّا N و إمّا S. تُسمى النقطة S، نقطة تماس الكرة بالمستوي (P).',
  cuboidTitle: 'ب) مقطع بلاطة قائمة بمستو',
  cuboidRestored: 'في الكتاب سقط العنوان «ب)» بين «أ)» و «جـ)»؛ أعادته المنصّة.',
  cuboidFace: 'مقطع بلاطة قائمة بمستو مُواز لأحد أوجهها هو مستطيل له نفس بُعدي الوجه الموازي له.',
  cuboidEdge: 'مقطع بلاطة قائمة بمستو مُواز لأحد أحرفه هو مستطيل طوله أو عرضه يُساوي طول ذلك الحرف.',
  cylinderTitle: 'جـ) المقاطع المستوية لأسطوانة الدوران',
  cylinderBase: 'مقطع أسطوانة الدوران، نصف قطرها R بمستو مُواز لقاعدتها هو دائرة، نصف قطرها R و مركزها نقطة من محورها.',
  cylinderAxis: 'مقطع أسطوانة الدوران بمستو مُواز لمحورها هو مستطيل، طوله أو عرضه يُساوي ارتفاع الأسطوانة.',
};

/** د) — la معرفة que la page absente du scan contenait : pyramide et cône (ajout DÉCLARÉ, à partir du نشاط 5). */
export const KNOW_APEX = {
  source: FORMALIZATION_SOURCE,
  title: 'د) مقطع هرم أو مخروط دوران بمستو موازٍ للقاعدة',
  pyramid: 'مقطع هرم بمستو موازٍ لقاعدته هو مضلّع من نفس طبيعة القاعدة، وهو تصغير لها: إذا قطع المستوي الحرف $[SA]$ في E فإن نسبة التصغير هي $k = \\dfrac{SE}{SA}$ ، وكل ضلع من المقطع يساوي k مرة الضلع الموافق من القاعدة.',
  cone: 'مقطع مخروط دوران رأسه S وقاعدته دائرة مركزها O ونصف قطرها R بمستو موازٍ لقاعدته هو دائرة مركزها O′ على المحور $[SO]$ ، وهي تصغير للقاعدة نصف قطرها $r = k \\times R$ حيث $k = \\dfrac{SO\'}{SO}$ .',
  note: 'صفحة هذه المعرفة غير موجودة في صفحات الكتاب المتوفرة؛ كتبتها المنصّة انطلاقا من نشاط 5.',
};

/** طرائق (p. 169) — « حساب نصف قطر مقطع كُرة بمستو ». */
export const METHOD_RADIUS = {
  source: src('method-section-radius', 169, 'طرائق', 1),
  exercise: 'تمرين: يقطع مستو (P) كرة مركزها O و نصف قطرها $2{,}5\\,\\mathrm{cm}$ وفق دائرة مركزها O′ نقطة تقاطع المستقيم الذي يشمل O و العمودي على هذا المستوي حيث $OO\' = 1{,}5\\,\\mathrm{cm}$ . أنجز تمثيلا مناسبا ثُم عيّن نصف قطر الدائرة.',
  solution: [
    'حل: لتكن M نقطة من الدائرة (مقطع الكرة بهذا المستوي (P)).',
    'OM هو نصف قطر الكرة و O′M نصف قطر الدائرة و $(O\'M) \\perp (OO\')$ .',
    'بتطبيق خاصية فيثاغورس في المثلث OO′M القائم في O′، يكون $OM^2 = OO\'^2 + O\'M^2$ و منه $2{,}5^2 = 1{,}5^2 + O\'M^2$ .',
    'أي $O\'M^2 = 2{,}5^2 - 1{,}5^2$ و عليه $O\'M^2 = 4$ أي $O\'M = \\sqrt{4} = 2$ .',
    'إذن نصف قطر الدائرة هو $2\\,\\mathrm{cm}$ .',
  ],
  rule: 'طريقة: يُمكن استعمال خاصية فيثاغورس لحساب نصف قطر مقطع كُرة بمستو لا يمر بمركزها.',
  spelling: 'يكتب الكتاب «فيثاغورث» في الحل و«فيثاغورس» في الطريقة: نكتب «فيثاغورس».',
};

/** دوري الآن (p. 169). */
export const NOW_169 = {
  source: src('now-169', 169, 'دوري الآن', 1),
  text: '(P) مستو مُواز لمحور أسطوانة دوران ارتفاعها $3\\,\\mathrm{cm}$ و نصف قطر قاعدتها $2\\,\\mathrm{cm}$ . يقطع الأسطوانة وفق الرباعي ABCD. 1) ما نوع الرباعي ABCD. 2) نفرض أنّ المسافة بين النقطة O و المستقيم $(AB)$ هي $1\\,\\mathrm{cm}$ . احسب القيمة المضبوطة لمساحة الرباعي ABCD.',
  answer1: 'ABCD مستطيل (مقطع أسطوانة دوران بمستو مُواز لمحورها) أحد بعديه $BC = AD = 3\\,\\mathrm{cm}$ ، ارتفاع الأسطوانة.',
  answer2: 'ليكن H المسقط العمودي لـ O على $(AB)$ : $OH = 1$ و H منتصف الوتر $[AB]$ ؛ $AH^2 = 2^2 - 1^2 = 3$ ، $AH = \\sqrt{3}$ و $AB = 2\\sqrt{3}\\,\\mathrm{cm}$ ؛ مساحة ABCD $= 2\\sqrt{3} \\times 3 = 6\\sqrt{3}\\,\\mathrm{cm}^2 \\approx 10{,}39\\,\\mathrm{cm}^2$ .',
};
/** La méthode que le نشاط 4 et le دوري الآن appliquent, écrite par la plateforme (une ligne par geste). */
export const METHOD_CYLINDER = {
  source: FORMALIZATION_SOURCE,
  rule: 'لحساب عرض مقطع أسطوانة دوران نصف قطرها r بمستو موازٍ لمحورها يبعد عنه بـ d: نرسم القاعدة، ونطبّق خاصية فيثاغورس في المثلث القائم الذي وتره نصف القطر: نصف العرض $\\sqrt{r^2 - d^2}$ ، والعرض $2\\sqrt{r^2 - d^2}$ ، والبعد الآخر ارتفاع الأسطوانة.',
};

/** Les erreurs que la leçon corrige (le لماذا vient des معارف et du نشاط 2) — citées par la carte (knowledgeGraph.js). */
export const MISTAKES = {
  tarh: {
    wrong: 'نصف قطر مقطع الكرة هو $R - h$ : عند $h = 3$ في كرة نصف قطرها 5 يكون 2.',
    why: 'نقطة من دائرة نصف قطرها 2 في هذا المستوي تبعد عن O بـ $\\sqrt{3^2 + 2^2} = \\sqrt{13}$ ، لا 5: فهي ليست من الكرة.',
    right: 'المثلث OAM قائم في A: $AM^2 = OM^2 - OA^2 = 25 - 9 = 16$ ، فنصف قطر المقطع 4.',
  },
  haram: {
    wrong: 'مقطع الهرم بمستو موازٍ للقاعدة له نفس أبعاد القاعدة.',
    right: 'المقطع تصغير للقاعدة بنسبة $\\dfrac{SE}{SA}$ : في نشاط 5 ضلعه $\\dfrac{3}{4} \\times 4 = 3$ لا 4.',
  },
};

/**
 * « أستعدّ » — le manuel n'a aucun item pour cette leçon (extraction › destinationRationale › prep) : six affirmations de la
 * plateforme sur les المكتسبات القبلية du propriétaire et sur la leçon « الكرة والجلة ». Une affirmation par compétence ; aucune
 * n'utilise les nombres des نشاطات (3 ; 1,25 ; 25 × 20 × 6 ; 1,7 et 0,8 ; 4 et 3/4).
 */
const PREP_ADD = addition('prerequisite_diagnostic');
export const PREP_ITEMS = [
  { n: 'p1', skill: 'fithaghuras', text: 'المثلث KLM قائم في L حيث $KM = 13\\,\\mathrm{cm}$ و $KL = 5\\,\\mathrm{cm}$ ، إذن $LM = 8\\,\\mathrm{cm}$ .', answer: false, why: 'الوتر هو $[KM]$ : $LM^2 = KM^2 - KL^2 = 169 - 25 = 144$ ، إذن $LM = 12\\,\\mathrm{cm}$ لا $13 - 5 = 8$ .', source: PREP_ADD },
  { n: 'p2', skill: 'balata', text: 'للبلاطة القائمة (متوازي المستطيلات) ستة أوجه كلها مستطيلات، و 12 حرفا.', answer: true, why: 'ستة أوجه مستطيلة متقايسة مثنى مثنى، و 12 حرفا: 4 أطوال و 4 عروض و 4 ارتفاعات.', source: PREP_ADD },
  { n: 'p3', skill: 'ustuwana', text: 'قاعدتا أسطوانة الدوران قرصان متقايسان، ومحورها المستقيم الذي يشمل مركزيهما عمودي على القاعدتين.', answer: true, why: 'أسطوانة الدوران يولّدها مستطيل يدور حول أحد أضلاعه: القاعدتان قرصان متقايسان والمحور يعامدهما.', source: PREP_ADD },
  { n: 'p4', skill: 'qutr', text: 'طول قطر مربع ضلعه $5\\,\\mathrm{cm}$ هو $10\\,\\mathrm{cm}$ .', answer: false, why: 'حسب خاصية فيثاغورس: $5^2 + 5^2 = 50$ ، فالقطر $\\sqrt{50} = 5\\sqrt{2} \\approx 7{,}07\\,\\mathrm{cm}$ .', source: PREP_ADD },
  { n: 'p5', skill: 'kura', text: 'إذا كانت M نقطة من الكرة التي مركزها O ونصف قطرها R فإن $OM < R$ .', answer: false, why: 'نقط الكرة (السطح) تحقّق $OM = R$ ؛ أما $OM < R$ فلنقط داخل الجلة (الدرس الأول).', source: PREP_ADD },
  { n: 'p6', skill: 'talis', text: 'في المثلث RTV: U من $[RT]$ و W من $[RV]$ و $(UW) \\parallel (TV)$ ، إذن $\\dfrac{UW}{TV} = \\dfrac{RU}{RT}$ .', answer: true, why: 'هذه خاصية طالس: $\\dfrac{RU}{RT} = \\dfrac{RW}{RV} = \\dfrac{UW}{TV}$ .', source: PREP_ADD },
];

/** Les deux mondes du lab (levels.js) : مبتدئ = une sphère R = 5 (plateforme) ; متقدم = le نشاط 2 puis les نشاطات 3–5. */
export const LAB = {
  beginner: { source: PLATFORM, numbers: { solids: ['sphere'], R: 5, step: 1, stops: [0, 3, 4, 5], start: 2 } },
  advanced: {
    source: ACTIVITY.source,
    numbers: {
      solids: ['sphere', 'cuboid', 'cylinder', 'pyramid'], R: 3, step: '1/20', stops: [0, 1.25, 2, 2.8, 3], start: 1.5, foot: 'I',
      cuboid: { dims: [25, 20, 6], dm: 21, bn: 17 }, cylinder: { r: 1.7, h: 6, d: 0.8 }, pyramid: { side: 4, height: 6, ratio: '3/4' },
    },
  },
};
