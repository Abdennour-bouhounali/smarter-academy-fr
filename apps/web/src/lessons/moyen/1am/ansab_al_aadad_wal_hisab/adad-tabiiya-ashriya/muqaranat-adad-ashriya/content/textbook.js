/**
 * Le contenu du درس « مقارنة الأعداد العشرية وترتيبها » (1AM, unité 1) — données pures. Le manuel (docs/sources/1am/unit1/extraction.json)
 * est la RÉFÉRENCE des الكفاءات : ici tout est réécrit par la plateforme (autres mots, autres nombres, autres contextes — guide
 * §4ter-bis), chaque bloc citant seulement l'élément dont il est tiré (`src`) pour la traçabilité de `check:textbook`.
 * Les nombres du labo (`LAB`) sont ceux des préréglages de `manipulations/levels.js › ruler-compare` et de la tâche posée seule au module 3.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les nombres des labos (mêmes valeurs que `levels.js` pour les deux niveaux ; `method` est passé par le module 3). */
export const LAB = {
  beginner: [
    { kind: 'compare', a: '4,6', b: '4,35' },
    { kind: 'compare', a: '8,05', b: '8,5' },
    { kind: 'compare', a: '12,70', b: '12,7' },
    { kind: 'compare', a: '9,87', b: '10,2' },
  ],
  advanced: [
    { kind: 'order', values: ['7,4', '7,04', '7,45', '6,98', '7,405'], dir: 'asc' },
    { kind: 'order', values: ['2,5', '2,05', '0,75', '2,500', '3'], dir: 'desc' },
  ],
  method: [{ kind: 'order', values: ['15,39', '9,105', '15,4', '15,04', '9,15', '15,309'], dir: 'asc' }],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  symbols: {
    source: src('know-6', 15, 'أحوصل تعلّماتي', 6),
    definition: 'مقارنة عددين عشريين هي أن نعرف هل هما متساويان أم أحدهما أكبر من الآخر، ونكتب النتيجة بأحد الرموز $=$ أو $<$ أو $>$ . الرمز يفتح فمه نحو العدد الأكبر: $4{,}35<4{,}6$ نقرؤها «4,35 أصغر من 4,6» أو «4,6 أكبر من 4,35»، وهي تعني الشيء نفسه $4{,}6>4{,}35$ .',
  },
  wholeParts: {
    source: src('method-3', 16, 'أكتسب طرائق', 3),
    text: 'إذا اختلف الجزآن الصحيحان فالعدد الذي جزؤه الصحيح أكبر هو الأكبر، مهما كانت أرقامه بعد الفاصلة، لأنّ كل ما بعد الفاصلة أقل من وحدة واحدة: $9{,}87<10{,}2$ لأنّ $9<10$ .',
  },
  rankByRank: {
    source: src('method-3', 16, 'أكتسب طرائق', 3),
    text: 'إذا تساوى الجزآن الصحيحان نقارن رقمي الأعشار، فإن تساويا قارنّا رقمي الأجزاء من مائة، ثم من ألف، وهكذا. أوّل رتبة يختلف فيها الرقمان تحسم المقارنة: $8{,}05<8{,}5$ لأنّ رقم الأعشار $0<5$ .',
  },
  zeros: {
    source: src('method-3', 16, 'أكتسب طرائق', 3),
    text: 'يمكن أن نتمّ أحد العددين أو كليهما بأصفار غير ضرورية حتى يصير لهما عدد الأرقام نفسه بعد الفاصلة، فلا يتغيّر العددان: $4{,}6=4{,}60$ . ثم نقارن عددين طبيعيين من القطع نفسها: 60 جزءًا من مائة أكثر من 35 جزءًا من مائة، إذن $4{,}6>4{,}35$ .',
  },
  trap: {
    source: src('act-5', 10, 'اكتشف', 5),
    text: 'لا نقرأ الأرقام بعد الفاصلة كأنّها عدد طبيعي: $4{,}35$ ليس أكبر من $4{,}6$ بحجّة أنّ $35>6$ ، وليس العدد الأطول (الأكثر أرقامًا بعد الفاصلة) هو الأكبر.',
  },
  order: {
    source: src('know-7', 15, 'أحوصل تعلّماتي', 7),
    text: 'نرتّب أعدادًا ترتيبًا تصاعديًا حين نكتبها من الأصغر إلى الأكبر، وترتيبًا تنازليًا حين نكتبها من الأكبر إلى الأصغر. مثال تصاعدي: $0{,}7<1{,}07<1{,}5<2{,}25<3$ .',
    how: 'لترتيب سلسلة نقارن أعدادها مثنى مثنى: نبدأ بالجزء الصحيح، ثم نفصل بين الأعداد التي تتساوى أجزاؤها الصحيحة رتبةً برتبة.',
  },
};

/** طريقة 3 — مقارنة عددين عشريين وترتيب سلسلة (p. 16 : 15,26 et 19,2 ; les nombres sont remplacés par ceux de la plateforme, les mots aussi). */
export const METHOD_COMPARE = {
  source: src('method-3', 16, 'أكتسب طرائق', 3),
  title: 'مقارنة عددين عشريين وترتيب سلسلة',
  exercise: 'قارن بين $23{,}48$ و $23{,}5$ ، ثم رتّب تصاعديًا الأعداد $23{,}5$ ، $19{,}9$ ، $23{,}48$ ، $23{,}05$ .',
  solution: [
    '1. الجزآن الصحيحان للعددين $23{,}48$ و $23{,}5$ متساويان (23)، فنقارن رقمي الأعشار.',
    '2. رقم الأعشار 4 في الأول و 5 في الثاني، و $4<5$ ، إذن $23{,}48<23{,}5$ .',
    '3. للتأكّد نتمّ بصفر: $23{,}5=23{,}50$ ، و 48 جزءًا من مائة أقل من 50 جزءًا من مائة.',
    '4. لترتيب الأعداد الأربعة: أصغر جزء صحيح هو 19 فالعدد $19{,}9$ هو الأصغر.',
    '5. الباقية جزؤها الصحيح 23: أعشارها 5 و 4 و 0، إذن $23{,}05<23{,}48<23{,}5$ .',
    '6. الترتيب التصاعدي: $19{,}9<23{,}05<23{,}48<23{,}5$ .',
  ],
  rule: 'الجزآن الصحيحان أوّلًا، فإن تساويا فالأرقام رتبةً برتبة من الأعشار؛ ولترتيب سلسلة نقارنها مثنى مثنى.',
};

/** « أستعدّ » — six affirmations : la comparaison des entiers (items 1–2, item 5 du manuel réécrit), les rangs (3–4) et le zéro inutile (5–6, lien du réseau 1am.m1.r02). */
export const PREP_ITEMS = [
  { skill: 'tabii', text: 'العددان 462 و 624 لهما الأرقام نفسها، و $462<624$ .', answer: true, why: 'عدد المئات 4 أقل من 6، فالأول أصغر.', source: src('prep', 8, 'استحضر مكتسباتي', 5) },
  { skill: 'tabii', text: 'العدد 987 أكبر من العدد 1203 لأنّ 987 فيه رقم 9 .', answer: false, why: '1203 فيه أربعة أرقام و987 ثلاثة فقط: $987<1203$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'maratib', text: 'رقم الأعشار في العدد $17{,}48$ هو 4.', answer: true, why: 'الرقم الأول بعد الفاصلة يعدّ أعشارًا.', source: addition('prerequisite_diagnostic') },
  { skill: 'maratib', text: 'رقم الأجزاء من مائة في العدد $6{,}305$ هو 3.', answer: false, why: '3 هو رقم الأعشار؛ ورقم الأجزاء من مائة هو 0.', source: addition('prerequisite_diagnostic') },
  { skill: 'asfar', text: '$6{,}50=6{,}5$ .', answer: true, why: 'الصفر الأخير بعد الفاصلة لا يغيّر العدد.', source: addition('prerequisite_diagnostic') },
  { skill: 'asfar', text: '$0{,}05=0{,}5$ .', answer: false, why: 'الصفر في $0{,}05$ يحفظ مكان الأعشار: 5 أجزاء من مائة لا 5 أعشار.', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  digitsAsNatural: {
    wrong: 'نقارن $4{,}35$ و $4{,}6$ كأنّهما $435$ و $46$ فنقول إنّ $4{,}35>4{,}6$ .',
    why: 'الأرقام بعد الفاصلة تعدّ قطعًا أصغر فأصغر: $4{,}6=4{,}60$ ، و 60 جزءًا من مائة أكثر من 35 جزءًا من مائة.',
    right: '$4{,}35<4{,}6$ : رقم الأعشار 3 أقل من 6.',
  },
  longerBigger: {
    wrong: 'العدد الأكثر أرقامًا بعد الفاصلة هو الأكبر: $2{,}105>2{,}3$ .',
    why: '$2{,}3=2{,}300$ ، و 300 جزء من ألف أكثر من 105 أجزاء من ألف.',
    right: '$2{,}105<2{,}3$ .',
  },
  trailingZero: {
    wrong: '$4{,}70>4{,}7$ لأنّ في الأول رقمًا أكثر.',
    why: 'الصفر الأخير بعد الفاصلة لا يغيّر العدد: $4{,}70=4{,}7$ .',
    right: '$4{,}70=4{,}7$ .',
  },
};
