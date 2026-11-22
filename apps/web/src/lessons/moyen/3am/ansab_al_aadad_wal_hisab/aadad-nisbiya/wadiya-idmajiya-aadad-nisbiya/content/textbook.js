/**
 * Le contenu de « أدمج تعلّماتي — الأعداد النسبية » (3AM, unité 1) — données pures. Le manuel (p. 20 : `integration` et `evaluation`, p. 6 : تحدّ ②, p. 7 : أستعدّ 2–4,
 * p. 18 : deep-38) est la RÉFÉRENCE ; chaque texte montré à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : autres nombres, autre mise en scène — la Lune, Vénus
 * et Mars deviennent une nuit à l'Assekrem ; Paris et Chicago deviennent Sétif et Montréal). Aucune ligne n'envoie au manuel : `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » — six affirmations. Une est la ré-écriture de l'item 2–4 du manuel (le repère : la fiche « فاصلة »), les cinq autres sont de la plateforme et mesurent
 * ce que les situations mobilisent : le produit de deux et de plusieurs relatifs, le quotient et les priorités.
 */
export const PREP_ITEMS = [
  { n: 2, skill: 'ihdathiyat', text: 'النقطة $M(-2\\,;\\,3)$ فاصلتها $3$ .', answer: false, why: 'الفاصلة هي الإحداثي الأوّل: فاصلة $M$ هي $-2$ ، وترتيبها $3$ .' },
].map((it) => ({ ...it, source: src('prep', 7, 'أستعدّ', it.n) }));

export const PREP_PLATFORM_ITEMS = [
  { skill: 'jidaa', text: '$(-4) \\times (-2{,}5) = 10$ .', answer: true, why: 'للعددين الإشارة نفسها: الجداء موجب، و $4 \\times 2{,}5 = 10$ .' },
  { skill: 'jidaaIda', text: '$(-1) \\times 2 \\times (-3) \\times (-5) = 30$ .', answer: false, why: 'ثلاثة عوامل سالبة (عدد فردي): الجداء سالب، فهو $-30$ .' },
  { skill: 'jidaaIda', text: '$(-0{,}7)^2 = 0{,}49$ .', answer: true, why: '$(-0{,}7) \\times (-0{,}7) = 0{,}49$ : مربع عدد نسبي لا يكون سالبًا.' },
  { skill: 'qisma', text: '$(-45) \\div 9 = 5$ .', answer: false, why: 'إشارتان مختلفتان: الحاصل سالب، $(-45) \\div 9 = -5$ . نتحقّق: $9 \\times (-5) = -45$ .' },
  { skill: 'awlawiya', text: '$8 - 2 \\times (-3) = 14$ .', answer: true, why: 'الضرب أوّلًا: $2 \\times (-3) = -6$ ثم $8 - (-6) = 8 + 6 = 14$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/**
 * La وضعية des modules 7 et 8 — « أدمج تعلّماتي » / « وضعية للتقويم » (p. 20) REDESSINÉE : deux températures, deux échelles (Celsius et Fahrenheit), la règle
 * `T_F = 1,8 × T_C + 32`. Le manuel l'écrit « de fahrenheit vers celsius » alors que la règle convertit de celsius vers fahrenheit : la plateforme dit les choses dans le bon sens.
 */
export const SITUATION = {
  source: src('evaluation', 20, 'وضعية للتقويم'),
  title: 'درجتا الحرارة في سطيف ومونتريال',
  text: 'أرسل ياسين من سطيف رسالة إلى ابن عمّه في مونتريال: «الحرارة عندنا $-3\\,^\\circ\\mathrm{C}$ ». فأجابه ابن عمّه: «وعندنا $-13\\,^\\circ\\mathrm{F}$ ». نستعمل للانتقال من السيلسيوس إلى الفهرنهايت القاعدة $T_F = 1{,}8 \\times T_C + 32$ . أيّ المدينتين أشدّ برودة؟',
  data: [
    { id: 'sif', text: 'الحرارة في سطيف −3°C (سيلسيوس)', useful: true },
    { id: 'mon', text: 'الحرارة في مونتريال −13°F (فهرنهايت)', useful: true },
    { id: 'rule', text: 'القاعدة T_F = 1,8 × T_C + 32', useful: true },
    { id: 'msg', text: 'الرسالة أرسلها ياسين إلى ابن عمّه', useful: false },
    { id: 'nums', text: 'العددان 1,8 و 32 في القاعدة درجتا حرارة', useful: false },
  ],
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'نريد مقارنة درجتي حرارة معطاتين بسلّمين مختلفين: $-3$ بالسيلسيوس و $-13$ بالفهرنهايت. العددان $1{,}8$ و $32$ ثابتان في القاعدة وليسا درجتي حرارة.' },
    { label: 'تحليل التعليمة واختيار إستراتيجية حل مناسبة', text: 'من سيلسيوس إلى فهرنهايت: نضرب في $1{,}8$ ثم نضيف $32$ . وللعكس نسير في الاتجاه المعاكس بالترتيب المعاكس: نطرح $32$ ثم نقسم على $1{,}8$ . نحوّل الدرجتين إلى السلّم نفسه ثم نقارن.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'ننجز الحسابات مراعين قاعدة الإشارات وأولوية العمليات، ونتحقّق، ثم نكتب الجواب بجملة واضحة.' },
  ],
};

/** Les corrections des questions du module 7 (reprises par la carte). */
export const REMARKS = {
  scaleWrong: 'نقارن العددين $-3$ و $-13$ مباشرة: $-3 > -13$ ، فمونتريال أشدّ برودة.',
  scaleWhy: 'العددان ليسا بالسلّم نفسه: $-3$ بالسيلسيوس و $-13$ بالفهرنهايت. لا نقارن إلا درجتين بسلّم واحد.',
  scaleRight: 'نحوّل إحدى الدرجتين إلى سلّم الأخرى، ثم نقارن.',
  chainWrong: 'للانتقال من الفهرنهايت إلى السيلسيوس نقسم على $1{,}8$ ثم نطرح $32$ .',
  chainWhy: 'الحساب الأصلي ضرب في $1{,}8$ ثم جمع $32$ ؛ نعكسه بالترتيب المعاكس: نبدأ بما فُعل أخيرًا، أي نطرح $32$ أوّلًا ثم نقسم على $1{,}8$ .',
  chainRight: 'من $T_F$ نطرح $32$ ثم نقسم الناتج على $1{,}8$ ، ونضع الطرح بين قوسين: $(T_F - 32) \\div 1{,}8$ .',
  notSolvedHere: 'الحلّ نفسه في «وضعية الاختبار النهائي»: هنا فهمنا واختطّينا الاستراتيجية فقط.',
};

/**
 * Les cinq étapes du test (module 8), évaluées. Chaque distracteur est FAUX et porte l'erreur de l'unité qui le produit (vérifié dans content.test.js).
 */
export const FINAL = [
  { id: 'E1', skill: 'fahrenheit', text: 'المرحلة 1 — درجة الحرارة في سطيف بالفهرنهايت هي ...',
    options: ['$1{,}8 \\times (-3) + 32 = 26{,}6$', '$-5{,}4 - 32 = -37{,}4$', '$1{,}8 \\times 3 + 32 = 37{,}4$', '$1{,}8 \\times (-3 + 32) = 52{,}2$'], correct: 0,
    explain: '$1{,}8 \\times (-3) = -5{,}4$ (إشارتان مختلفتان) ثم $-5{,}4 + 32 = 26{,}6$ . الخطأ الأوّل جمع $32$ كأنّه طُرح، والثاني أسقط الإشارة، والثالث أجرى الجمع بين قوسين قبل الضرب.' },
  { id: 'E2', skill: 'celsius', text: 'المرحلة 2 — درجة الحرارة في مونتريال بالسيلسيوس هي ...',
    options: ['$(-13 - 32) \\div 1{,}8 = -25$', '$(-13 + 32) \\div 1{,}8 \\approx 10{,}56$', '$-13 - 32 \\div 1{,}8 \\approx -30{,}78$', '$(-13 - 32) \\times 1{,}8 = -81$'], correct: 0,
    explain: 'نعكس السلسلة: نطرح $32$ أوّلًا ($-13 - 32 = -45$) ثم نقسم على $1{,}8$ : $(-45) \\div 1{,}8 = -25$ . نتحقّق: $1{,}8 \\times (-25) + 32 = -45 + 32 = -13$ .' },
  { id: 'E3', skill: 'compare', text: 'المرحلة 3 — أيّ المدينتين أشدّ برودة؟',
    options: ['مونتريال، لأنّ $-25 < -3$ (بالسيلسيوس)', 'سطيف، لأنّ $-3 < -13$', 'سطيف، لأنّ $-3\\,^\\circ\\mathrm{C}$ أبعد عن الصفر من $-13\\,^\\circ\\mathrm{F}$', 'المدينتان متساويتان في البرودة'], correct: 0,
    explain: 'نقارن بالسلّم نفسه: $-25\\,^\\circ\\mathrm{C} < -3\\,^\\circ\\mathrm{C}$ (و $-13\\,^\\circ\\mathrm{F} < 26{,}6\\,^\\circ\\mathrm{F}$ ). مقارنة $-3$ بـ $-13$ مباشرة خطأ لأنّ العددين ليسا بالسلّم نفسه.' },
  { id: 'E4', skill: 'compare', text: 'المرحلة 4 — الفارق بين الدرجتين بالسيلسيوس ($-3 - (-25)$) هو ...',
    options: ['$22\\,^\\circ\\mathrm{C}$', '$-28\\,^\\circ\\mathrm{C}$', '$28\\,^\\circ\\mathrm{C}$', '$-22\\,^\\circ\\mathrm{C}$'], correct: 0,
    explain: 'طرح عدد سالب هو جمع نظيره: $-3 - (-25) = -3 + 25 = 22$ . الفارق بين درجتي حرارة عدد موجب.' },
  { id: 'E5', skill: 'verify', text: 'المرحلة 5 — نتحقّق من أنّ الدرجة $-40$ هي نفسها في السلّمين.',
    options: ['$1{,}8 \\times (-40) + 32 = -72 + 32 = -40$ : القيمتان متساويتان', '$1{,}8 \\times (-40) + 32 = 72 + 32 = 104$ : القيمتان مختلفتان', '$1{,}8 \\times (-40) + 32 = -72 - 32 = -104$ : القيمتان مختلفتان', '$1{,}8 \\times (-40 + 32) = -14{,}4$ : القيمتان مختلفتان'], correct: 0,
    explain: '$1{,}8 \\times (-40) = -72$ ثم $-72 + 32 = -40$ ، فالدرجة $-40$ تساوي $-40$ في السلّمين.' },
];
