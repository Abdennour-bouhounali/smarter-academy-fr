/**
 * Le contenu du درس « خاصية فيثاغورس » (3AM, unité 11) — données pures. Le manuel (docs/sources/3am/unit11/extraction.json) est la
 * RÉFÉRENCE des الكفاءات : ici tout est réécrit par la plateforme (autres mots, autres triangles, autres nombres — guide §4ter-bis),
 * chaque bloc citant seulement l'élément dont il est tiré (`src`) pour la traçabilité de `check:textbook`. Chaque nombre est recalculé
 * en arithmétique exacte dans ./content.test.js (core/arithmetic/pythagoras.js).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les réglages du labo (mêmes valeurs que `levels.js › pythagoras-tanks`) et ce qu'il fait atteindre. */
export const LAB = {
  beginner: { mode: 'angle', b: 3, c: 4 },
  advanced: { mode: 'length', b: 5, c: 12 },
  water: 25, // 3² + 4²
  right: 90,
  thirteen: 13, // √(5² + 12²)
  surd: { b: 2, c: 3, square: 13, text: '√13', screen: '3,605551275', rounded: '3,61' },
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  machine: {
    source: addition('platform_designed_entry'),
    text: 'كل حوض مربع رقيق، فكمية الماء فيه هي مساحة المربع: الحوضان المنشآن على [AB] و [AC] فيهما $AB^2+AC^2$ من الماء، والحوض المنشأ على [BC] يسع $BC^2$.',
  },
  hypotenuse: {
    source: src('know-1', 170, 'معارف', 1),
    text: 'في مثلث قائم، الضلع المقابل للزاوية القائمة يُسمّى الوتر، وهو أطول أضلاع المثلث: إذا كان $ABC$ قائما في $A$ فوتره $[BC]$.',
  },
  property: {
    source: src('know-1', 170, 'معارف', 1),
    text: 'خاصية فيثاغورس: إذا كان مثلث قائما، فإنّ مربع طول وتره يساوي مجموع مربعي طولي الضلعين الآخرين. إذا كان $ABC$ قائما في $A$ فإنّ $BC^2=AB^2+AC^2$.',
  },
  onlyRight: {
    source: src('know-1', 170, 'معارف', 1),
    text: 'هذه المساواة لا تُكتب إلا في مثلث قائم: نتأكّد أوّلًا أنّ المثلث قائم، ونعيّن رأس زاويته القائمة، فيكون الوتر هو الضلع المقابل له.',
  },
  notRight: {
    source: src('know-1', 170, 'معارف', 1),
    text: 'إذا كان في مثلث مربع طول أطول أضلاعه لا يساوي مجموع مربعي طولي الضلعين الآخرين، فإنّ هذا المثلث غير قائم.',
  },
  computeSide: {
    source: src('know-1', 170, 'معارف', 1),
    text: 'خاصية فيثاغورس تسمح بحساب طول ضلع في مثلث قائم إذا عُلم طولا الضلعين الآخرين: مربع الوتر هو مجموع مربعي الضلعين القائمين، ومربع ضلع قائم هو الفرق بين مربع الوتر ومربع الضلع القائم الآخر.',
  },
  root: {
    source: src('act-2', 168, 'أنشطة', 2),
    text: 'إذا كان $DF^2=20$ فإنّ $DF=\\sqrt{20}$: هذه هي القيمة المضبوطة. اللمسة $\\sqrt{\\ }$ للآلة الحاسبة تعرض 4,472135955، فقيمة مقرّبة إلى $0{,}01$ هي $4{,}47$. وإذا كان المربع مربع عدد عشري، مثل $6{,}25=2{,}5^2$، فالطول عدد عشري مضبوط.',
  },
};

/** طريقة 1 — « أحسب طول ضلع في مثلث قائم » : مثال محلول سطرًا سطرًا (MethodSteps). */
export const METHOD_SIDE = {
  source: src('method-1', 171, 'طرائق', 1),
  title: 'أحسب طول ضلع في مثلث قائم',
  exercise: '1) ABC مثلث قائم في C حيث $AC=1{,}5\\,\\mathrm{cm}$ و $BC=2\\,\\mathrm{cm}$. احسب $AB$. 2) DEF مثلث قائم في D حيث $EF=6\\,\\mathrm{cm}$ و $DE=4\\,\\mathrm{cm}$. احسب القيمة المضبوطة للطول $DF$ ثم قيمة مقرّبة له إلى $0{,}01$.',
  solution: [
    '1) المثلث ABC قائم في C، فوتره $[AB]$. حسب خاصية فيثاغورس: $AB^2=AC^2+BC^2$',
    '$AB^2=1{,}5^2+2^2=2{,}25+4=6{,}25$ ، و $2{,}5\\times2{,}5=6{,}25$ ، إذن $AB=2{,}5\\,\\mathrm{cm}$',
    '2) المثلث DEF قائم في D، فوتره $[EF]$. حسب خاصية فيثاغورس: $EF^2=DE^2+DF^2$',
    '$6^2=4^2+DF^2$ أي $36=16+DF^2$ ، ومنه $DF^2=36-16=20$',
    '$DF=\\sqrt{20}\\,\\mathrm{cm}$ (القيمة المضبوطة). بالآلة الحاسبة نضغط √ ثم 20 ثم = فيظهر 4,472135955 ، إذن $DF\\approx4{,}47\\,\\mathrm{cm}$',
  ],
  rule: 'نرسم شكلا بيد حرّة ونعيّن الزاوية القائمة والوتر، ثم نكتب مساواة فيثاغورس ونعوّض: نجمع لنحصل على مربع الوتر ونطرح لنحصل على مربع ضلع قائم، ثم نستعمل اللمسة √ عند الحاجة.',
};

/** طريقة 2 — « أُثبت أنّ مثلثا غير قائم » (la moitié « non » de la méthode du manuel ; la moitié « oui » est la réciproque). */
export const METHOD_NOT_RIGHT = {
  source: src('method-2', 171, 'طرائق', 2),
  title: 'أُثبت أنّ مثلثا غير قائم',
  exercise: 'مثلث KLM أطوال أضلاعه $KL=4{,}5\\,\\mathrm{cm}$ و $LM=6\\,\\mathrm{cm}$ و $KM=7{,}4\\,\\mathrm{cm}$. هل هو قائم؟',
  solution: [
    'أطول الأضلاع هو $[KM]$: لو كان المثلث قائما لكان $[KM]$ وتره.',
    '$KM^2=7{,}4^2=54{,}76$',
    '$KL^2+LM^2=4{,}5^2+6^2=20{,}25+36=56{,}25$',
    '$KM^2\\neq KL^2+LM^2$ ، فحسب خاصية فيثاغورس المثلث KLM غير قائم.',
  ],
  rule: 'نعيّن أطول الأضلاع، ثم نقارن مربع طوله بمجموع مربعي طولي الضلعين الآخرين: إذا لم يتساويا فالمثلث غير قائم.',
};

/** Les lectures de la طريقة (module 3) : l'échelle contre le mur (un côté de l'angle droit) et √20 arrondi. */
export const LADDER = { ladder: '2,5', foot: '0,7', height: '2,4' };
export const SURD20 = { square: 20, rounded1: '4,5', truncated1: '4,4', screen: '4,472135955' };

/** « أستعدّ » — huit affirmations : aire d'un carré / d'un rectangle (1am.m2.r08), carrés de nombres (3am.m3.r06), le triangle rectangle. */
export const PREP_ITEMS = [
  { skill: 'masaha', text: 'مساحة مربع طول ضلعه $7\\,\\mathrm{cm}$ هي $49\\,\\mathrm{cm}^2$.', answer: true, why: 'مساحة المربع هي طول ضلعه مضروبًا في نفسه: $7\\times7=49$.', source: addition('prerequisite_diagnostic') },
  { skill: 'masaha', text: 'مستطيل طوله $6\\,\\mathrm{cm}$ وعرضه $2{,}5\\,\\mathrm{cm}$ مساحته $17\\,\\mathrm{cm}^2$.', answer: false, why: 'مساحة المستطيل هي الطول في العرض: $6\\times2{,}5=15\\,\\mathrm{cm}^2$ (أمّا 17 فنصف محيطه).', source: addition('prerequisite_diagnostic') },
  { skill: 'quwa', text: '$2{,}6^2=5{,}2$', answer: false, why: 'مربع عدد هو جداؤه في نفسه: $2{,}6\\times2{,}6=6{,}76$ ، لا $2\\times2{,}6$.', source: src('prep', 167, 'أستعدّ', 2) },
  { skill: 'quwa', text: '$5^2+12^2=169$', answer: true, why: '$25+144=169$.', source: src('prep', 167, 'أستعدّ', 3) },
  { skill: 'quwa', text: '$(-3)^2=-9$', answer: false, why: 'مربع عدد سالب موجب: $(-3)\\times(-3)=9$.', source: addition('prerequisite_diagnostic') },
  { skill: 'quwa', text: '$10^2-6^2=4^2$', answer: false, why: '$100-36=64=8^2$ ، و $4^2=16$.', source: src('prep', 167, 'أستعدّ', 4) },
  { skill: 'masaha', text: 'طول ضلع مربع مساحته $81\\,\\mathrm{cm}^2$ هو $9\\,\\mathrm{cm}$.', answer: true, why: '$9\\times9=81$.', source: src('prep', 167, 'أستعدّ', 7) },
  { skill: 'qaim', text: 'في مثلث قائم، الوتر هو الضلع المقابل للزاوية القائمة، وهو أطول أضلاعه.', answer: true, why: 'الزاوية القائمة أكبر زوايا المثلث القائم، والضلع المقابل لها هو الأطول.', source: src('prep', 167, 'أستعدّ', 1) },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  addLengths: {
    wrong: 'في مثلث قائم ضلعاه القائمان 5 و 12: الوتر $5+12=17$.',
    why: 'خاصية فيثاغورس تجمع المربعات لا الأطوال: $5^2+12^2=169$ ، والوتر 13. ثم إنّ 17 لا يمكن أن يغلق المثلث: طول ضلع أقلّ من مجموع الضلعين الآخرين.',
    right: '$BC^2=5^2+12^2=169$ ، إذن $BC=13$.',
  },
  wrongHyp: {
    wrong: 'EFG قائم في E: $EG^2=EF^2+FG^2$.',
    why: 'الوتر يقابل الزاوية القائمة: المثلث قائم في E فوتره $[FG]$ ، لا $[EG]$.',
    right: '$FG^2=EF^2+EG^2$ ، ومنه $EG^2=FG^2-EF^2$ (نطرح لنحصل على ضلع قائم).',
  },
  looksRight: {
    wrong: 'المثلث KLM (4,5 و 6 و 7,4) يبدو قائما، إذن هو قائم.',
    why: 'الرسم لا يكفي: $7{,}4^2=54{,}76$ و $4{,}5^2+6^2=56{,}25$ ، والعددان مختلفان.',
    right: 'المثلث KLM غير قائم، رغم أنّ زاويته الكبرى قريبة جدا من الزاوية القائمة.',
  },
};
