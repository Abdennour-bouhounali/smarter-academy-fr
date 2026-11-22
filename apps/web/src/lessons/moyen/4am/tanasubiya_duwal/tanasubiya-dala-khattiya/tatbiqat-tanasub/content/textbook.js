/**
 * Le contenu du MANUEL pour le درس 4 « تطبيقات التناسبية (النسب المئوية والمقادير المركبة) » —
 * données pures (aucun JSX), au mot près ; chaque bloc cite son élément de
 * docs/sources/4am/unit6/extraction.json. Les modules rendent ces données ; ils n'en réécrivent
 * aucune. Les nombres groupés (« 12 850 ») sont écrits dans une île mathématique ou sans espace
 * (ARABIC_RTL_CONTRACT « grouped thousands ») ; les unités composées (m/s, km/h) dans une île.
 *
 * Deux coquilles du manuel sont CORRIGÉES (décision du propriétaire, 2026-10-02), avec UNE ligne
 * discrète : نشاط 6 السؤال 3 (le cuivre : 8 cm³, pas 6 cm³) et معارف (kW et kWh, pas « kw/h »).
 */
import { src, addition } from '../../_unit/unitMeta.js';

/* ── Le laboratoire du module 1 (percent-tag) : les nombres de chaque niveau ─────────────────── */
export const LAB = {
  beginner: { price: '1200', steps: '+5', theme: 'mall' },   // نشاط 5 السؤال 3
  advanced: { price: '30', steps: '-30|+15', theme: 'tank' }, // طرائق p. 71 (le réservoir)
};

/* ── نشاط 5 (p. 67) — « استعمال النسبة المئوية » ──────────────────────────────────────────── */
const ACT5_SRC = src('act-5', 67, 'أنشطة', 5);
export const ACTIVITY = {
  source: ACT5_SRC,
  title: 'استعمال النسبة المئوية',
  text: 'نشاط 5 — استعمال النسبة المئوية.',
  questions: [
    '1) إليك توزيع تلاميذ متوسطة حسب المستوى و الجنس. احسب النسبة المئوية للبنات في هذه المتوسطة.',
    '2) تستهلك سيارة $6{,}7L$ من البنزين لكل $100km$ . بعد ضبط المحرك، انخفض استهلاك البنزين إلى $6{,}1L$ لكل $100km$ . عبّر عن هذا الانخفاض بواسطة نسبة مئوية.',
    '3) أقدم تاجر على رفع سعر منتوج بـ 5%. أ) إذا علمت أن سعر المنتوج قبل الزيادة هو 1200DA ، فما هو سعره بعد هذه الزيادة؟ ب) عبّر عن السعر $y$ للمنتوج بعد الزيادة بدلالة السعر $x$ قبل الزيادة.',
  ],
  table: {
    levels: ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة'],
    pupils: [100, 95, 90, 90],
    girlsPercent: [50, 40, 60, 70],
  },
  closing: 'زيادة سعر بـ 5% تعني ضربه في $1{,}05$ : $1200 \\times 1{,}05 = 1260$ ، والسعر بعد الزيادة دالة خطية للسعر قبلها: $y = 1{,}05x$ .',
};

/** Les réponses de l'activité, calculées comme le manuel les attend (extraction › answer). */
export const ACT5_ANSWERS = {
  girls: 'عدد البنات: $100 \\times \\dfrac{50}{100} + 95 \\times \\dfrac{40}{100} + 90 \\times \\dfrac{60}{100} + 90 \\times \\dfrac{70}{100} = 50 + 38 + 54 + 63 = 205$ ، من أصل $100 + 95 + 90 + 90 = 375$ تلميذًا.',
  girlsPercent: 'النسبة المئوية للبنات: $\\dfrac{205}{375} \\times 100 \\simeq 54{,}67$ ، أي حوالي $54{,}67\\%$ . لا نجمع النسب $50 + 40 + 60 + 70$ ولا نأخذ متوسطها: الأقسام لا تضمّ العدد نفسه من التلاميذ.',
  fuel: 'الانخفاض $6{,}7 - 6{,}1 = 0{,}6L$ من أصل $6{,}7L$ : $\\dfrac{0{,}6}{6{,}7} \\times 100 \\simeq 8{,}96$ ، أي انخفاض بحوالي $8{,}96\\%$ . وللتحقق: $6{,}7 \\times (1 - 0{,}0896) \\simeq 6{,}1$ .',
  price: '$1200 \\times \\dfrac{5}{100} = 60$ ، فالسعر بعد الزيادة $1200 + 60 = 1260$ ، أي مباشرة $1200 \\times 1{,}05 = 1260$ .',
  fn: 'السعر بعد الزيادة هو السعر قبلها مضروبًا في $1 + \\dfrac{5}{100} = 1{,}05$ : $y = 1{,}05x$ ، وهي دالة خطية معاملها $1{,}05$ .',
};

/* ── نشاط 6 (p. 67) — « المقادير المركّبة » (السؤال 3 مصحّح) ─────────────────────────────────── */
const ACT6_SRC = src('act-6', 67, 'أنشطة', 6);
export const ACTIVITY_6 = {
  source: ACT6_SRC,
  title: 'المقادير المركّبة',
  questions: [
    '1) تسير سيّارة بسرعة متوسطة قدرها $25m/s$ على طريق حُدّدت السرعة القصوى فيه بـ $80km/h$ . هل ارتكب سائق هذه السيّارة مخالفة ؟',
    '2) تُوَفِّر محطة توزيع المياه الصالحة للشرب $7\\,200\\,000L$ في الساعة. عبّر عن تدفق المياه من هذه المحطة بالوحدة متر مكعب في الثانية الواحدة $(m^3/s)$ .',
    // Le texte CORRIGÉ (extraction › act-6 › correction) : 8 cm³ de cuivre, pas 6 cm³.
    '3) يزن $3dm^3$ من الذهب $57{,}9kg$ ويزن $6cm^3$ من الفضة $63g$ ، أما $8cm^3$ من النحاس فيَزن $71{,}2g$ . ماهو المعدن الأثقل؟',
  ],
  correctionNote: 'صحّحت المنصّة خطأً مطبعيًا في السؤال 3: حجم النحاس $8cm^3$ (لا $6cm^3$)، لأنّ كتلته الحجمية $8{,}9g/cm^3$ .',
  answers: {
    speed: '$25m/s = 25 \\times 3600m/h = 90\\,000m/h = 90km/h$ ، و $90 > 80$ : ارتكب السائق مخالفة.',
    flow: '$7\\,200\\,000L = 7200m^3$ في $3600s$ ، إذن التدفق $\\dfrac{7200}{3600} = 2m^3/s$ .',
    gold: 'الذهب: $57{,}9kg = 57\\,900g$ و $3dm^3 = 3000cm^3$ ، إذن $\\dfrac{57\\,900}{3000} = 19{,}3g/cm^3$ .',
    silver: 'الفضة: $\\dfrac{63}{6} = 10{,}5g/cm^3$ .',
    copper: 'النحاس: $\\dfrac{71{,}2}{8} = 8{,}9g/cm^3$ .',
    heaviest: 'نقارن كتلة $1cm^3$ من كل معدن (الكتلة الحجمية): الذهب هو الأثقل ( $19{,}3g/cm^3$ ).',
  },
};

/* ── معارف (p. 70) — « تطبيقات التناسبية » (الطاقة مصحّحة) ──────────────────────────────────── */
const KNOW_SRC = src('know-4', 70, 'معارف');
export const KNOW = {
  source: KNOW_SRC,
  title: 'تطبيقات التناسبية',
  percentTable: [
    { case: 'أخذ $t\\%$ من $x$', means: 'يعني ضرب $x$ في $\\dfrac{t}{100}$', fn: '$x \\longmapsto \\dfrac{t}{100}x$' },
    { case: 'زيادة $x$ بـ $t\\%$', means: 'يعني ضرب $x$ في $1 + \\dfrac{t}{100}$', fn: '$x \\longmapsto \\left(1 + \\dfrac{t}{100}\\right)x$' },
    { case: 'تخفيض $x$ بـ $t\\%$', means: 'يعني ضرب $x$ في $1 - \\dfrac{t}{100}$', fn: '$x \\longmapsto \\left(1 - \\dfrac{t}{100}\\right)x$' },
  ],
  percentExamples: [
    'أخذ 5% من $x$ يعني ضرب $x$ في 0,05 والدالة الخطية المرفقة هي $x \\longmapsto 0{,}05x$ .',
    'زيادة $x$ بـ 5% يعني ضرب $x$ في 1,05 والدالة الخطية المرفقة هي $x \\longmapsto 1{,}05x$ .',
    'تخفيض $x$ بـ 5% يعني ضرب $x$ في 0,95 والدالة الخطية المرفقة هي $x \\longmapsto 0{,}95x$ .',
  ],
  productQuantity: 'المقادير المركبة: عندما نحسب جداء مقدارين نتحصل على مقدار جداء.',
  productExamples: [
    'مساحة مستطيل: طول مستطيل هو $8cm$ وعرضه هو $3cm$ . مساحته هي $(8 \\times 3)cm^2$ أي $24cm^2$ . $\\mathcal{A}$ هي مساحة مستطيل، $L$ طوله و $\\ell$ عرضه. نكتب $\\mathcal{A} = L \\times \\ell$ . $\\mathcal{A}$ هو مقدار جداء.',
    // Le texte CORRIGÉ (extraction › know-4 › correction) : kW et kWh.
    'الطاقة الكهربائية: يستهلك جهاز كهربائي استطاعته $1{,}2kW$ لمدة $5h$ طاقة قدرها $1{,}2kW \\times 5h$ أي $6kWh$ . إذن الطاقة الكهربائية $E$ التي يستهلكها جهاز إستطاعته $P$ في مدة زمنية $t$ هي $E = P \\times t$ .',
  ],
  correctionNote: 'صحّحت المنصّة خطأً مطبعيًا: الاستطاعة بالكيلوواط $kW$ والطاقة بالكيلوواط ساعي $kWh$ (لا « $kw/h$ »).',
  quotientQuantity: 'مقدار حاصل القسمة: عندما نحسب حاصل قسمة مقدارين، نتحصل على مقدار حاصل القسمة.',
  quotientExamples: [
    'السرعة المتوسطة لمتحرك هي حاصل قسمة المسافة المقطوعة على مدة قطع هذه المسافة. نكتب $v(km/h) = \\dfrac{d(km)}{t(h)}$ أو $v(m/s) = \\dfrac{d(m)}{t(s)}$ .',
    'الكتلة الحجمية لجسم هي حاصل قسمة كتلة هذا الجسم على حجمه. نكتب $m_v = \\dfrac{m}{V}(kg/m^3)$ .',
    'السرعة المتوسطة لدراجة عندما تقطع مسافة $42km$ في $1{,}5h$ هي $\\left(\\dfrac{42}{1{,}5}\\right)km/h$ أي $28km/h$ .',
    'الكتلة الحجمية لجسم كتلته $2{,}4kg$ وحجمه $0{,}01m^3$ هي $\\left(\\dfrac{2{,}4}{0{,}01}\\right)kg/m^3$ أي $240kg/m^3$ .',
  ],
};

/* ── طرائق (p. 71) ────────────────────────────────────────────────────────────────────────── */
export const METHOD_PERCENT = {
  source: src('method-percent', 71, 'طرائق'),
  title: 'استعمال النسب المئوية',
  exercise: 'خزان ماء مملوء تبلغ سعته $30m^3$ ، يحرص صاحبه على عدم تبذير الماء. أفرغنا 30% منه ثم أضفنا 15% مما فيه. كم أصبح حجم محتواه؟',
  // La solution du manuel, découpée en lignes (MethodSteps) — la dernière est sa phrase.
  solution: [
    'تفريغ 30% يعني الضرب في $1 - \\dfrac{30}{100} = 0{,}7$ : $30 \\times 0{,}7 = 21$ .',
    'إضافة 15% مما فيه يعني الضرب في $1 + \\dfrac{15}{100} = 1{,}15$ : $21 \\times 1{,}15 = 24{,}15$ .',
    'يصبح حجم الماء في الخزان $24{,}15m^3$ لأن $30 \\times \\left(1 - \\dfrac{30}{100}\\right) \\times \\left(1 + \\dfrac{15}{100}\\right) = 24{,}15$ .',
  ],
  method: 'تخفيض $x$ بـ $t\\%$ ثم زيادة الناتج بـ $t\'\\%$ ، يعني ضرب $x$ في الجداء $\\left(1 - \\dfrac{t}{100}\\right) \\times \\left(1 + \\dfrac{t\'}{100}\\right)$ .',
};

export const METHOD_COMPOUND = {
  source: src('method-compound', 71, 'طرائق'),
  title: 'استعمال المقادير المركّبة',
  exercise: 'تبلغ مساحة الجزائر $2\\,381\\,740km^2$ وعدد سكانها 41,2 مليون في سنة 2017. ما هي الكثافة السكانية؟',
  solution: [
    'الكثافة السكانية مقدار حاصل قسمة: عدد السكان على المساحة.',
    'كثافة السكان في الجزائر هي حوالي 17 نسمة في الكيلومتر المربع لأن $\\dfrac{41{,}2}{2{,}381740} \\simeq 17{,}298$ .',
  ],
  method: 'نحسب الكثافة السكانية في منطقة بقسمة عدد سكانها على مساحتها بالكيلومتر المربع.',
};

/** دوري الآن (p. 71). */
export const NOW_71 = {
  source: src('now-71', 71, 'دوري الآن'),
  text: 'كان سعر سيارة $1\\,800\\,000\\mathrm{DA}$ . ارتفع سعرها بـ 3% ثم انخفض بـ 2% ثم انخفض مرة أخرى بـ 1%. في أي عدد يجب ضرب $1\\,800\\,000$ لإيجاد السعر الجديد؟',
  explain: '$1{,}03 \\times 0{,}98 \\times 0{,}99 = 0{,}999306$ : السعر الجديد $1\\,800\\,000 \\times 0{,}999306 = 1\\,798\\,750{,}8\\mathrm{DA}$ . جمع النسب $3 - 2 - 1 = 0$ يوهم أنّ السعر لم يتغيّر، وهو تغيّر.',
};

/**
 * Une phrase de la PLATEFORME pour le point P3 du catalogue (« ترجمة وقراءة وضعيات يتدخل فيها
 * مقدار معطى بدلالة مقدار آخر ») : le manuel écrit E = P × t, v = d/t et m_v = m/V ; le
 * catalogue écrit m = ρ·V. On les relit « un مقدار en fonction d'un autre » — déclarée.
 */
export const BIDALALA = {
  source: addition('interaction_generation'),
  text: 'عندما يكون المقدار المركّب ثابتًا، يُعطى مقدار بدلالة مقدار آخر بضرب في عدد ثابت: المسافة $d = v \\times t$ بدلالة المدة، الكتلة $m = \\rho \\times V$ بدلالة الحجم، الطاقة $E = P \\times t$ بدلالة المدة، والسعر بعد زيادة 5% $y = 1{,}05x$ بدلالة السعر قبلها.',
  example: 'دراجة سرعتها المتوسطة ثابتة $28km/h$ : المسافة المقطوعة بدلالة المدة $t$ (بالساعة) هي $d = 28t$ ، وهي دالة خطية معاملها السرعة.',
};

/** Les conversions d'unités d'un مقدار مركّب (نشاط 6) : une phrase de la plateforme. */
export const TAHWIL = {
  source: addition('interaction_generation'),
  text: 'لتحويل وحدة مقدار مركّب نحوّل وحدة البسط ووحدة المقام كلًّا على حدة: $25m/s$ تعني $25m$ في $1s$ ، أي $25 \\times 3600 = 90\\,000m$ في $3600s = 1h$ ، أي $90km/h$ .',
  rule: '$1h = 3600s$ ، $1km = 1000m$ ، $1m^3 = 1000L$ ، $1dm^3 = 1L = 1000cm^3$ .',
};

/* ── « أؤكّد تعلّماتي » (p. 74) — items 7 et 8 (destinations › qcm › duplicatedIn) ────────────── */
const QCM_SRC = (n) => src('qcm', 74, 'أؤكّد تعلّماتي', n);
export const QCM = {
  7: {
    n: 7, source: QCM_SRC(7),
    text: '$7cm^3$ من الذهب يزن $135{,}1g$ . إذن الكتلة الحجمية للذهب هي :',
    options: ['$19\\,300kg/m^3$', '$19{,}3kg/L$', '$19{,}3g/cm^3$'],
    correct: [0, 1, 2],
    explain: '$\\dfrac{135{,}1}{7} = 19{,}3g/cm^3$ . و $1cm^3$ يزن $19{,}3g$ ، إذن $1L = 1000cm^3$ يزن $19\\,300g = 19{,}3kg$ ، و $1m^3 = 1000L$ يزن $19\\,300kg$ : الكتابات الثلاث صحيحة.',
  },
  8: {
    n: 8, source: QCM_SRC(8),
    text: 'يمكن ترجمة خفض مقدار بـ 10% بالدّالة الخطية :',
    options: ['$f : x \\longmapsto 0{,}9x$', '$g : x \\longmapsto x - 10$', '$h : x \\longmapsto \\dfrac{10}{100}x$'],
    correct: 0,
    explain: 'خفض $x$ بـ 10% يعني ضربه في $1 - \\dfrac{10}{100} = 0{,}9$ . الدالة $g$ تطرح العدد 10 (ليست خطية)، والدالة $h$ تعطي مقدار الخفض وحده.',
  },
};

/* ── « أستعدّ » — items 6 à 9 du manuel (p. 65), puis la plateforme ──────────────────────────── */
/**
 * Les items 6–9 (extraction › prep › items 6-9 → tatbiqat-tanasub) : prendre t %, augmenter /
 * diminuer d'un pourcentage (calcul de 3AM), la vitesse moyenne. Puis des affirmations de la
 * PLATEFORME, même forme, pour les autres acquis supposés : l'image par une fonction linéaire et
 * sa forme x ⟼ ax (leçon dala-khattiya), les conversions d'unités (temps, volume). Aucune
 * n'utilise les nombres du module 1 (1200 DA, 5 %, 30 m³, 30 %, 15 %).
 */
const PREP = (n) => src('prep', 65, 'أستعدّ', n);
export const PREP_ITEMS = [
  { n: 6, skill: 'nisba', text: 'أخذ 2% من 150DA معناه أخذ 3DA.', answer: true, why: '$150 \\times \\dfrac{2}{100} = 3$', source: PREP(6) },
  { n: 7, skill: 'ziyada', text: 'سعر جهاز هو $12\\,850\\mathrm{DA}$ . بعد زيادة بنسبة 8%، أصبح سعره $13\\,800\\mathrm{DA}$ .', answer: false, why: '$12\\,850 \\times \\dfrac{8}{100} = 1028$ ، فالسعر الجديد $12\\,850 + 1028 = 13\\,878$ ، وليس $13\\,800$ .', source: PREP(7) },
  { n: 8, skill: 'ziyada', text: 'سعر جهاز هو 6900DA. تخفيض بـ 15% على سعر الجهاز يقدر بـ 1380DA.', answer: false, why: '$6900 \\times \\dfrac{15}{100} = 1035$ ؛ المبلغ 1380 يوافق 20%.', source: PREP(8) },
  { n: 9, skill: 'sura', text: 'قطع درّاج مسافة $30km$ في مدة زمنية قدرها $1h30min$ . إذن السرعة المتوسطة للدرّاج تساوي $20km/h$ .', answer: true, why: '$1h30min = 1{,}5h$ و $\\dfrac{30}{1{,}5} = 20$', source: PREP(9) },
  { skill: 'dala', text: 'صورة العدد 40 بالدالة الخطية $x \\longmapsto 0{,}3x$ هي 12.', answer: true, why: '$0{,}3 \\times 40 = 12$', source: addition('prerequisite_diagnostic') },
  { skill: 'dala', text: 'الدالة $x \\longmapsto x + 4$ دالة خطية.', answer: false, why: 'الدالة الخطية من الشكل $x \\longmapsto ax$ ؛ هنا صورة 0 هي 4 وليست 0.', source: addition('prerequisite_diagnostic') },
  { skill: 'wahda', text: '$1m^3 = 100L$ .', answer: false, why: '$1m^3 = 1000dm^3$ و $1dm^3 = 1L$ ، إذن $1m^3 = 1000L$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'wahda', text: '$2h = 7200s$ .', answer: true, why: '$1h = 60min = 3600s$ ، إذن $2h = 2 \\times 3600s = 7200s$ .', source: addition('prerequisite_diagnostic') },
];
