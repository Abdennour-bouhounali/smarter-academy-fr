/**
 * Le contenu du MANUEL pour le درس « كتابة الأعداد الطبيعية ودلالة الأرقام » (1AM, unité 1) — données pures, au mot près,
 * chaque bloc cite son élément de docs/sources/1am/unit1/extraction.json. Frontière avec kusur-ashriya-kitaba (même item
 * 1am.m1.r02) : ici l'entier (lecture, écriture, classes, rangs, رقم / عدد, مفكوك d'un entier) ; les noms des rangs
 * décimaux (الأعشار…) seulement comme NOMS de rangs — les fractions décimales sont la leçon suivante.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * نشاط 1 « أكوّن أعدادا » (p. 9) — une APPLICATION, pas l'entrée de la leçon (règle du propriétaire, 2026-10-14 : le manuel
 * est la référence des الكفاءات, pas le script ; LESSON_DEVELOPMENT_GUIDE §4ter). L'entrée est l'atelier des crayons
 * (`WORKSHOP`) ; ces trois questions sont posées dans أتمرّن (module 4, `EX['act-1']`) une fois l'échange découvert.
 */
export const ACTIVITY = {
  source: src('act-1', 9, 'اكتشف', 1),
  title: 'أكوّن أعدادا',
  questions: [
    'استعمل جميع الأرقام 0 ، 1 ، 3 ، 8 على أن تأخذ كل رقم مرّة واحدة لتكتب: أ) أكبر عدد طبيعي ممكن. ب) أصغر عدد طبيعي ممكن.',
    'العددان 25، 52 مكتوبان باستعمال الرقمين 2 و 5. هل للرقمين 2 و 5 نفس الدلالة في كتابتي العددين 25، 52؟ اشرح.',
    'اكتب بالأرقام ثمّ بالحروف العدد الذي يلي ثمّ العدد الذي يسبق العدد تسعمائة وتسعة وتسعون.',
  ],
  digits: [0, 1, 3, 8],
  answers: { largest: 8310, smallest: 1038, next: 1000, previous: 998 },
};

/**
 * L'ENTRÉE de la leçon (module 1), choisie par la plateforme : l'atelier où l'on ne peut ÉCRIRE le nombre de crayons
 * qu'après avoir lié chaque dizaine. Rejetée comme entrée : l'activité du manuel (trois questions posées avant toute
 * expérience — l'élève répond de mémoire, il ne découvre rien). Les questions du module portent sur les nombres que
 * l'élève a lui-même obtenus au labo.
 */
export const WORKSHOP = {
  source: addition('platform_designed_entry'),
  sevens: 'في 2577 يعدّ الرقم 7 الذي في عمود الأقلام 7 أقلام، ويعدّ الرقم 7 الذي في عمود الحزم 7 حزم، أي 70 قلمًا: نفس الرقم، وقيمتان مختلفتان حسب العمود.',
  cascade: '10 أقلام تصير حزمة، فتصير الحزم 10 فتُربط علبة، فتصير العلب 10 فتُربط صندوقًا: ثلاث ربطات متتالية، و $999 + 1 = 1000$.',
  zero: 'في 2017 لا علبة: نكتب 0 في عمود العلب. بدونه نكتب 217، فينزل الرقم 2 من الصناديق (الآلاف) إلى العلب (المئات).',
};

/** Le labo (MANIPULATION_CONTRACT « rank-exchange ») : les nombres des deux niveaux et du standalone `money` (ex-2). */
export const LAB = {
  pack: { 3: 1, 2: 13, 1: 24, 0: 37 },
  packValue: 2577,
  unpack: { n: 2017, rank: 1, count: 201 },
  next: 999,
  borrow: 1000,
  dictation: [7065, 4908732],
  money: { n: 1345, rank: 2, notes: 13, left: 45 },
};

/** L'ouverture de l'unité (p. 7) : les systèmes de numération des civilisations. */
export const OPENER = {
  source: src('opener', 7, 'تمهيد'),
  text: 'يقدم لنا علماء الآثار والمؤرخون أمثلة عديدة ومختلفة عن طرق العدّ البدائية عند الإنسان، كتلك التي كانت تستعمل العصي والحصى، وأصابع اليد وغيرها ؛ بينما طوّرت حضارات أخرى نظام العدّ والحساب، منها الحضارة البابلية في وادي الرافدين وحضارة الفراعنة في وادي النيل وحضارة السند في الهند والحضارة الرومانية والإغريقية في أوروبا.',
};

/** معارف 1 (p. 11) — كتابة الأعداد الطبيعية. */
export const KNOWLEDGE = {
  source: src('know-1', 11, 'أحوصل تعلّماتي', 1),
  digits: 'نستعمل الأرقام 0 ، 1 ، 2 ، 3 ، 4 ، 5 ، 6 ، 7 ، 8 ، 9 لكتابة الأعداد الطبيعية.',
  example2017: 'العدد 2017 مشكل من أربعة أرقام. الرقم 7 يمثل رقم الآحاد، الرقم 1 يمثل رقم العشرات، الرقم 0 يمثل رقم المئات، الرقم 2 يمثل رقم الآلاف.',
  example5: 'العدد 5 مشكّل من رقم واحد.',
  readingTitle: 'قراءة وكتابة عدد طبيعي',
  reading: 'لتسهيل قراءة وكتابة عدد طبيعي كبير، نقوم بترك فراغ عقب كل ثلاثة أرقام (تقسيم العدد إلى فئات من ثلاثة أرقام)، مبتدئين من اليمين.',
  // Les exemples du manuel ; l'écriture en lettres suit la convention de la plateforme (discrepancies › words : « خمسة »).
  readingExamples: [
    { raw: '45671', spaced: '45\\,671', words: 'خمسة وأربعون ألفا وستمائة وواحد وسبعون' },
    { raw: '4908732', spaced: '4\\,908\\,732', words: 'أربعة ملايين وتسعمائة وثمانية آلاف وسبعمائة واثنان وثلاثون' },
  ],
};

/** معارف 4 (p. 13), item a — le tableau des rangs (le مفكوك décimal, item b, est la leçon suivante). */
export const RANKS = {
  source: src('know-4', 13, 'أحوصل تعلّماتي', 4),
  box: 'يأخذ كل رقم معناه تبعا لموقعه في الكتابة العشرية.',
  number: '6\\,392{,}459',
  integerHeaders: ['الآلاف', 'المئات', 'العشرات', 'الآحاد'],
  decimalHeaders: ['الأعشار', 'الأجزاء من مائة', 'الأجزاء من ألف'],
  integerDigits: [6, 3, 9, 2],
  decimalDigits: [4, 5, 9],
  roles: '2 هو رقم الآحاد، 9 هو رقم العشرات، 3 هو رقم المئات، 6 هو رقم الآلاف، 4 هو رقم الأعشار، 5 هو رقم الأجزاء من مائة، 9 هو رقم الأجزاء من ألف.',
};

/** Le مفكوك d'un ENTIER : la partie entière de l'exemple p. 13 (formalisation déclarée — le manuel décompose 6 392,459 entier). */
export const DECOMPOSITION = {
  source: addition('knowledge_formalization'),
  text: 'كل عدد طبيعي هو مجموع جداءات أرقامه في قيم مراتبها (1 ، 10 ، 100 ، 1000 ، …). نسمّي هذه الكتابة المفكوك النموذجي للعدد.',
  example: '$6\\,392 = 6 \\times 1000 + 3 \\times 100 + 9 \\times 10 + 2$',
  zero: '$2017 = 2 \\times 1000 + 1 \\times 10 + 7$ : رقم المئات 0، فلا يظهر حدّ المئات في المفكوك، لكنّ الصفر يبقى في الكتابة.',
};

/** « رقم » / « عدد » d'un rang : la طريقة de la plateforme sur l'exercice 2 (p. 17) et l'exercice 1. */
export const METHOD = {
  source: addition('method_from_exercise'),
  title: 'رقم المرتبة وعدد وحداتها',
  box: 'رقم مرتبة هو الرقم المكتوب في موقعها. عدد وحدات مرتبة (عدد العشرات، عدد المئات…) هو العدد الذي نقرؤه عندما نحذف الأرقام التي على يمينها: عدد العشرات في 2017 هو 201، وعدد المئات فيه هو 20.',
  exercise: 'في حصّالة يونس 1345 دج قطعًا نقدية، ويريد مبادلتها بأوراق من فئة 100 دج. كم ورقة يأخذ؟ وكم يبقى له قطعًا نقدية؟',
  solution: [
    'نكتب العدد 1345 ونحدّد موقع المئات: الرقم 3.',
    'كل ورقة 100 دج تعوّض 100 قطعة من 1 دج: الألف (1) فيه 10 مئات، والمئات (3): المجموع 13 مئة.',
    'نحذف الرقمين اللذين على يمين المئات (45): نقرأ 13. إذن عدد المئات في 1345 هو 13، أي 13 ورقة، ويبقى 45 دج قطعًا نقدية.',
    'نتحقّق: $1345 = 13 \\times 100 + 45$.',
  ],
};

/** أتعمّق 2 (p. 20) — المليون والمليار. */
export const BIG = {
  source: src('deep-2', 20, 'أتعمّق', 2),
  facts: ['المليون يساوي ألف ألف.', 'المليار يساوي ألف مليون.'],
  planets: [
    { name: 'عطارد', d: 57900000 },
    { name: 'الزّهرة', d: 108200000 },
    { name: 'الأرض', d: 149600000 },
    { name: 'المريخ', d: 227900000 },
    { name: 'المشتري', d: 778300000 },
    { name: 'زحل', d: 1427000000 },
    { name: 'أورانوس', d: 2877380000 },
    { name: 'نبتون', d: 4467070000 },
  ],
};

/** « أستعدّ » — استحضر مكتسباتي (p. 8), items 1, 2, 3, 4, 6, reformulés en affirmations vrai / faux. */
export const PREP_ITEMS = [
  { n: 1, skill: 'maratib', text: 'رقم العشرات في العدد 2017 هو 0.', answer: false, why: 'في 2017: رقم الآحاد 7، رقم العشرات 1، رقم المئات 0، رقم الآلاف 2.' },
  { n: 2, skill: 'maratib', text: 'عدد العشرات في العدد 2017 هو 201.', answer: true, why: '$2017 = 201 \\times 10 + 7$ : في 2017 توجد 201 عشرة كاملة.' },
  { n: 3, skill: 'kitaba', text: 'العدد «سبعة آلاف وخمسة وستون» يُكتب بالأرقام 765.', answer: false, why: 'لا توجد مئات: نكتب 0 في مرتبتها. العدد هو 7065.' },
  { n: 4, skill: 'kitaba', text: 'العدد 20892 يُقرأ: عشرون ألفا وثمانمائة واثنان وتسعون.', answer: true, why: '$20\\,892$ : فئة الآلاف 20، وفئة الوحدات 892.' },
  { n: 6, skill: 'maratib', text: 'رقم الأجزاء من عشرة في العدد 217,48 هو 4.', answer: true, why: 'الرقم الأوّل بعد الفاصلة هو رقم الأعشار (الأجزاء من عشرة): 4.' },
].map((it) => ({ ...it, source: src('prep', 8, 'استحضر مكتسباتي', it.n) }));

/** Un item de la PLATEFORME (aucun lien de révision dans le réseau : le primaire, la lecture d'un nombre de trois chiffres). */
export const PREP_PLATFORM_ITEMS = [
  { skill: 'kitaba', text: 'العدد 608 يُقرأ: ستمائة وثمانية.', answer: true, why: '6 مئات، 0 عشرات، 8 آحاد: ستمائة وثمانية.' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules et la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  concat: {
    wrong: 'صندوق و 13 علبة و 24 حزمة و 37 قلمًا: نكتب الأعداد جنبًا إلى جنب 1132437.',
    why: 'العمود لا يحمل أكثر من 9: كل 10 أقلام حزمة، وكل 10 حزم علبة، وكل 10 علب صندوق. بعد الربط نجد 2 صناديق و 5 علب و 7 حزم و 7 أقلام.',
    right: 'نربط كل عشرة في واحدة من المرتبة التالية، ثم نقرأ الأرقام: 2577.',
  },
  digitCount: {
    wrong: 'رقم العشرات في 2017 هو 1، إذن في 2017 عشرة واحدة.',
    why: 'الآلاف والمئات فيها عشرات أيضًا: كل ألف فيه 100 عشرة. فتحنا الصندوقين فوجدنا 200 حزمة، مع الحزمة 1: 201.',
    right: 'رقم العشرات 1، أمّا عدد العشرات فهو 201 (نحذف رقم الآحاد: $2017 = 201 \\times 10 + 7$).',
  },
  zero: {
    wrong: '«سبعة آلاف وخمسة وستون» تُكتب 765.',
    why: 'في 765 يقع 7 في مرتبة المئات: سبعمائة وخمسة وستون.',
    right: 'لا مئات في العدد، فنكتب 0 في مرتبتها: 7065.',
  },
  classes: 'نجزّئ العدد إلى فئات من ثلاثة أرقام مبتدئين من اليمين، ونقرأ كل فئة كعدد أصغر من 1000 ثم اسمها (ألف، مليون، مليار).',
};
