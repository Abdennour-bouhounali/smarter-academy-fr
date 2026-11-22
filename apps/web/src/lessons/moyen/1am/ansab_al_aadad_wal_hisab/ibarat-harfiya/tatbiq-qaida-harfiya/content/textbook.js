/**
 * Le contenu du درس « تطبيق قاعدة حرفية » (1AM, unité 6) — données pures. Le manuel (docs/sources/1am/unit6/extraction.json) est la RÉFÉRENCE des الكفاءات : ici tout est réécrit par la plateforme
 * (autres mots, autres nombres, autres contextes — guide §4ter-bis), chaque bloc citant seulement l'élément dont il est tiré (`src`) pour la traçabilité de `check:textbook`.
 * Les valeurs du labo (`LAB`) sont celles des préréglages de `manipulations/levels.js › letter-dial` et des deux tâches posées seules au module 3.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les tâches des labos (mêmes valeurs que `levels.js` pour les deux niveaux ; `method` est passé par le module 3). */
export const LAB = {
  beginner: [
    { id: 'b1', kind: 'set', name: 'price', formula: '5*n+20', dials: { n: { max: 30 } }, target: { n: 12 } },
    { id: 'b2', kind: 'find', name: 'price', formula: '5*n+20', dials: { n: { max: 30 } }, out: '95' },
    { id: 'b3', kind: 'set', name: 'promo', formula: '5*n+20-n', dials: { n: { max: 30 } }, target: { n: 10 } },
  ],
  advanced: [
    { id: 'a1', kind: 'set', name: 'fence', formula: '2*(a+b)', dials: { a: { max: 30 }, b: { max: 30 } }, target: { a: 15, b: 8 } },
    { id: 'a2', kind: 'set', name: 'fence', formula: '2*(a+b)', dials: { a: { max: 30 }, b: { max: 30 } }, target: { a: 8, b: 15 } },
    { id: 'a3', kind: 'claim', name: 'claim', left: 'a+b', right: 'a*b', dials: { a: { max: 12, start: 2 }, b: { max: 12, start: 2 } } },
  ],
  method: [
    { id: 'm1', kind: 'set', name: 'price', formula: '4*n+15', dials: { n: { max: 20 } }, target: { n: 9 } },
    { id: 'm2', kind: 'claim', name: 'claim', left: '2*a', right: 'a+2', dials: { a: { max: 12, start: 2 } } },
  ],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  expr: {
    source: src('know-1', 81, 'أحوصل تعلّماتي', 1),
    definition: 'العبارة الحرفية عبارة نرمز فيها إلى عدد أو عدّة أعداد بحروف، مثل $5\\times n+20$ أو $2\\times(a+b)$ : إذا وضعنا مكان الحرف عددًا حصلنا على عدد.',
  },
  conv: {
    source: src('know-1', 81, 'أحوصل تعلّماتي', 1),
    text: 'يمكن حذف إشارة الضرب بين عدد وحرف، وبين حرفين، وأمام قوس: $2\\times x=2x$ ، $a\\times b=ab$ ، $3\\times(x+2)=3(x+2)$ ؛ ونكتب العدد قبل الحرف.',
  },
  convNum: {
    source: src('know-1', 81, 'أحوصل تعلّماتي', 1),
    text: 'لكنّ الإشارة بين عددين لا تُحذف: $2\\times 3=6$ ولو حذفناها لقرأنا $23$ . وحين نضع $3$ مكان $x$ في $2x$ تعود الإشارة: $2x=2\\times 3=6$ .',
  },
  rule: {
    source: src('know-2', 81, 'أستعمل عبارة حرفية'),
    definition: 'القاعدة الحرفية مساواة تسمح بحساب مقدار بمعرفة مقادير أخرى، مثل $P=2\\times(a+b)$ الذي يعطي طول سياج حديقة مستطيلة بعداها $a$ و $b$ .',
  },
  apply: {
    source: src('know-2', 81, 'أستعمل عبارة حرفية'),
    text: 'نطبّق قاعدة حرفية بأن نضع قيمة كلّ حرف في كلّ موضع يظهر فيه، ثمّ نحسب بالأولويات: ما بين القوسين أوّلًا، ثمّ الضرب، ثمّ الجمع والطرح. مثال: من أجل $a=15$ و $b=8$ نجد $P=2\\times(15+8)=2\\times 23=46$ .',
  },
  counter: {
    source: src('act-4', 80, 'أبرّر بالمثال المضاد'),
    text: 'لنبيّن أنّ قاعدة ليست صحيحة دائمًا يكفي مثال واحد لا تصحّ فيه، ويُسمّى مثالًا مضادًّا: $3+4=7$ بينما $3\\times 4=12$ . أمّا الأمثلة التي تصحّ فيها القاعدة فلا تثبت أنّها صحيحة دائمًا: $2+2=2\\times 2$ .',
  },
  recall: {
    source: addition('recall_of_primary'),
    text: 'تذكّر: في الابتدائي رأينا أنّ محيط مستطيل بعداه $a$ و $b$ هو $2\\times(a+b)$ ومساحته $a\\times b$ . هنا نستعمل المحيط كقاعدة جاهزة نطبّقها.',
  },
};

/** طريقة (plateforme : le manuel n'en donne pas pour cette leçon) — appliquer une règle littérale et vérifier le calcul. */
export const METHOD_APPLY = {
  source: addition('platform_method'),
  title: 'أطبّق قاعدة حرفية',
  exercise: 'احسب قيمة $A=3\\times(x+2)-y$ من أجل $x=4$ و $y=5$ .',
  solution: [
    '1. أكتب العبارة وأضع قيمة كلّ حرف في كلّ موضع يظهر فيه : $A=3\\times(4+2)-5$ .',
    '2. أحسب ما بين القوسين أوّلًا : $A=3\\times 6-5$ .',
    '3. أحسب الضرب قبل الطرح : $A=18-5$ .',
    '4. أُنهي الحساب وأجيب : $A=13$ .',
  ],
  rule: 'أعوّض كلّ حرف بقيمته في كلّ موضع، أحسب بالأولويات (الأقواس، ثمّ الضرب، ثمّ الجمع والطرح)، ثمّ أجيب. ولا أكتب العدد بجانب العدد : $3\\times 4$ لا $34$ .',
};

/** « أستعدّ » — six affirmations : le calcul décimal (items 1–2, lien 1am.m1.r05), l'ordre des opérations (3–4) et le périmètre et l'aire d'un rectangle (5–6, lien 1am.m2.r08 : acquis du primaire). */
export const PREP_ITEMS = [
  { skill: 'jam', text: '$3{,}5\\times 4=14$ .', answer: true, why: '4 fois 3 unités font 12 et 4 fois 5 dixièmes font 2 unités : $3{,}5\\times 4=14$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'jam', text: '$12-4{,}7=8{,}3$ .', answer: false, why: '$12-4{,}7=7{,}3$ ، ونتحقّق : $7{,}3+4{,}7=12$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'awla', text: '$2+3\\times 4=20$ .', answer: false, why: 'الضرب قبل الجمع : $3\\times 4=12$ ثمّ $2+12=14$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'awla', text: '$(2+3)\\times 4=20$ .', answer: true, why: 'ما بين القوسين أوّلًا : $2+3=5$ ثمّ $5\\times 4=20$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'mustatil', text: 'محيط مستطيل بعداه $8$ سم و $5$ سم هو $26$ سم.', answer: true, why: '$2\\times(8+5)=2\\times 13=26$ : نجمع بعدين متجاورين ثمّ نضاعف.', source: addition('prerequisite_diagnostic') },
  { skill: 'mustatil', text: 'مساحة المستطيل نفسه هي $26$ سم².', answer: false, why: 'المساحة جداء البعدين : $8\\times 5=40$ سم² ؛ أمّا $26$ فهو المحيط.', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  glued: {
    wrong: 'في $5n$ من أجل $n=12$ أكتب $512$ : أضع العددين متجاورين.',
    why: 'بين $5$ و $n$ إشارة ضرب لا تُكتب : $5\\times 12=60$ وليس $512$ .',
    right: '$5\\times 12=60$ .',
  },
  once: {
    wrong: 'في $5\\times n+20-n$ من أجل $n=10$ أضع $10$ في الموضع الأوّل فقط : $5\\times 10+20-n$ .',
    why: 'الحرف $n$ مكتوب في موضعين، فنضع $10$ فيهما معًا.',
    right: '$5\\times 10+20-10=60$ .',
  },
  order: {
    wrong: 'في $2\\times(a+b)$ من أجل $a=15$ و $b=8$ أحسب $2\\times 15+8=38$ .',
    why: 'القوسان يجمعان $a$ و $b$ أوّلًا : $15+8=23$ ثمّ نضرب في $2$ .',
    right: '$2\\times(15+8)=2\\times 23=46$ .',
  },
  many: {
    wrong: 'القاعدة $a+b=a\\times b$ صحّت من أجل $2$ و $2$ فهي صحيحة دائمًا.',
    why: 'مثال تصحّ فيه القاعدة لا يثبت شيئًا : $3+4=7$ بينما $3\\times 4=12$ .',
    right: 'نبحث عن قيمتين تختلف عندهما الجهتان : هذا مثال مضادّ.',
  },
};
