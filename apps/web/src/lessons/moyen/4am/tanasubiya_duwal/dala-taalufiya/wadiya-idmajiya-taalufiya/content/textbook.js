import { addition, BASE } from '../../_unit/unitMeta.js';

/**
 * أدمج تعلّماتي — unité 7 « الدالة التآلفية ».
 *
 * Le manuel fourni (pp. 77–79) n'a NI « أدمج تعلّماتي », NI « أؤكّد تعلّماتي », NI « أتعمّق » pour cette
 * unité (extraction › discrepancies › scope) : la situation et le test sont des AJOUTS DÉCLARÉS de la
 * plateforme (`addition('synthesis_generation')`), écrits dans la forme et le vocabulaire du manuel
 * (دالة تآلفية، الترتيب عند المبدأ، معامل التوجيه، تناسب التغيّرات، جملة معادلتين، التفسير البياني) et sur
 * le modèle des synthèses des unités 2 à 6 (une situation, ses trois phases « قراءة · تحليل · تنفيذ »).
 * Format de l'unité 1 (décision du propriétaire, 2026-10-13) : ni QCM ni problèmes d'approfondissement.
 *
 * Aucune phrase de ce fichier n'est présentée comme celle du manuel : aucun `src()`.
 */

/* ── « أستعدّ » (module 0) ────────────────────────────────────────────────────────────────────
 * Huit affirmations de la plateforme (« عبارة إضافية من المنصّة ») sur ce que la situation mobilise,
 * une par ressource des cinq دروس de l'unité : l'image (درس 1), l'antécédent (درس 1), la famille
 * affine / linéaire / constante (درس 1), le ترتيب عند المبدأ lu sur la droite (درس 2), le معامل التوجيه
 * de deux points (درس 2), تناسب التغيّرات (درس 3), la solution d'une جملة = le point d'intersection
 * (درس 4), comparer deux tarifs (درس 5). Quatre vraies, quatre fausses ; jamais les nombres de la
 * situation. */
export const PREP_ITEMS = [
  { n: 1, skill: 'sura', text: 'صورة العدد $-2$ بالدالة التآلفية $x \\longmapsto 4x + 9$ هي $1$.', answer: true,
    why: '$4 \\times (-2) + 9 = -8 + 9 = 1$.', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'sabiq', text: 'العدد الذي صورته $11$ بالدالة التآلفية $x \\longmapsto 2x - 5$ هو $17$.', answer: false,
    why: 'نحلّ $2x - 5 = 11$ : $2x = 16$ ومنه $x = 8$. أمّا $17$ فهو صورة العدد $11$.', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'naw', text: 'الدالة $x \\longmapsto 7$ دالة تآلفية.', answer: true,
    why: 'إنها من الشكل $x \\longmapsto ax + b$ حيث $a = 0$ و $b = 7$ : دالة ثابتة، وهي حالة خاصة من الدوال التآلفية.', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'tartib', text: 'المستقيم الممثل للدالة $x \\longmapsto -3x + 2$ يقطع محور التراتيب في النقطة $(2 ; 0)$.', answer: false,
    why: 'صورة 0 هي $-3 \\times 0 + 2 = 2$ : المستقيم يقطع محور التراتيب في النقطة $(0 ; 2)$ ، والعدد 2 هو الترتيب عند المبدأ.', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'tawjih', text: 'إذا كان المستقيم الممثل لدالة تآلفية يشمل النقطتين $(0 ; 1)$ و $(1 ; 4)$ فإنّ معامل توجيهه $3$.', answer: true,
    why: 'عندما نتقدّم وحدة واحدة إلى اليمين (من 0 إلى 1) يصعد الترتيب من 1 إلى 4 : $a = \\dfrac{4 - 1}{1 - 0} = 3$.', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'taghayyur', text: '$f$ دالة تآلفية حيث $f(1) = 5$ و $f(3) = 11$ ، إذن معاملها $a = \\dfrac{11}{3}$.', answer: false,
    why: 'بتناسب التغيّرات: $a = \\dfrac{f(3) - f(1)}{3 - 1} = \\dfrac{11 - 5}{2} = 3$. القسمة $\\dfrac{11}{3}$ تصلح للدالة الخطية فقط.', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'jumla', text: 'إذا تقاطع المستقيمان الممثلان لمعادلتي جملة في النقطة $(2 ; -1)$ فإنّ الثنائية $(2 ; -1)$ حلّ لهذه الجملة.', answer: true,
    why: 'نقطة التقاطع تنتمي إلى المستقيمين معا، فإحداثيتاها تحقّقان المعادلتين في آن واحد.', source: addition('prerequisite_diagnostic') },
  { n: 8, skill: 'mufadala', text: 'صيغة أ تكلّف $500 + 20x$ وصيغة ب تكلّف $40x$. من أجل $x = 30$ الصيغة ب هي الأرخص.', answer: false,
    why: 'من أجل $x = 30$ : الصيغة أ $500 + 20 \\times 30 = 1100$ والصيغة ب $40 \\times 30 = 1200$ ، فالصيغة أ هي الأرخص.', source: addition('prerequisite_diagnostic') },
];

/* ── LA SITUATION (module 7) — رحلة إلى شاطئ تيبازة ─────────────────────────────────────────────
 * Une situation composite qui a besoin des CINQ دروس, chaque partie renvoyant au sien :
 *   1) les participants : x + y = 36 et 300x + 600y = 12000 → y = −x + 36 et y = −x/2 + 20, lues comme
 *      deux droites ; le point commun (32 ; 4)                                                  → درس 4
 *   2) la حافلة : « الأمل » f(x) = 150x + 6000, image de 32 = 10800, antécédent de 12000 = 40   → درس 1
 *      « النورس » donnée par DEUX devis (24 ; 9800) et (36 ; 12200) → g(x) = 200x + 5000         → درس 3
 *      les deux droites, leurs ترتيب عند المبدأ 6000 et 5000, l'intersection (20 ; 9000)         → درس 2
 *      au-delà de 20 élèves « الأمل » est moins chère : pour 32, 10800 < 11400                     → درس 5
 *   3) la plage : trois tarifs de kayak 150x, 50x + 300 et 600 ; 5 heures → ب (550 DA) ; ب est la moins
 *      chère entre 3 et 6 heures, أ avant 3, جـ après 6 (le laboratoire plan-compare)              → درس 5
 *   4) l'interprétation : il reste 12000 − 10800 = 1200 DA ; deux kayaks pour 5 h au tarif ب coûtent
 *      1100 DA ≤ 1200 : c'est suffisant.
 * Les nombres sont ceux de `NUMBERS` ; lab.render.test.jsx les recalcule avec packages/core (affine.js). */
export const NUMBERS = {
  persons: 36, pupilPays: 300, adultPays: 600, collected: 12000, pupils: 32, adults: 4,
  amal: '150x+6000', nawras: { x1: 24, y1: 9800, x2: 36, y2: 12200 }, nawrasRule: '200x+5000',
  amal32: 10800, nawras32: 11400, busCross: { x: 20, y: 9000 }, maxPupils: 40,
  kayak: { A: '150x', B: '50x+300', C: '600' }, hours: 5, kayakBest: 550, remaining: 1200, twoKayaks: 1100,
  bike: { A: '50x+200', B: '100x' },
};

export const SITUATION = {
  source: addition('synthesis_generation'),
  title: 'وضعية: رحلة إلى شاطئ تيبازة',
  caption: 'رحلة إلى الشاطئ',
  intro: 'في نهاية السنة الدراسية، ينظّم تلاميذ قسم السنة الرابعة متوسط رحلة إلى شاطئ تيبازة، يرافقهم بعض الأولياء، وقد اتفقوا على تنظيف الشاطئ قبل العودة.',
  part1: '1) ركب الحافلة 36 شخصا بين تلاميذ ومرافقين. ساهم كل تلميذ بـ 300 DA وكل مرافق بـ 600 DA ، فجُمع مبلغ 12000 DA. نسمّي $x$ عدد التلاميذ و $y$ عدد المرافقين.',
  part2: '2) الحافلة: ثمن الرحلة دالة لعدد التلاميذ $x$ (المرافقون لا يدفعون للناقل)؛ نرمز بـ $f(x)$ لثمن الناقل «الأمل» وبـ $g(x)$ لثمن الناقل «النورس».',
  part2a: '• الناقل «الأمل»: مبلغ ثابت قدره 6000 DA يضاف إليه 150 DA عن كل تلميذ.',
  part2b: '• الناقل «النورس»: ثمنه دالة تآلفية لعدد التلاميذ، وقد أرسل عرضين: 9800 DA من أجل 24 تلميذا، و 12200 DA من أجل 36 تلميذا.',
  part2q: 'أيّ الناقلين يختار القسم؟',
  part3: '3) على الشاطئ، لكراء قارب كاياك تقترح المحطة ثلاث صيغ بدلالة عدد ساعات الكراء $x$ :',
  plans: [
    'الصيغة أ: 150 DA للساعة.',
    'الصيغة ب: رسم ثابت 300 DA ثم 50 DA للساعة.',
    'الصيغة جـ: 600 DA جزافيا لليوم كله.',
  ],
  part3q: 'يبقى القسم 5 ساعات على الشاطئ، ويخصّص ما تبقّى من المبلغ المجموع بعد دفع ثمن الحافلة لكراء قاربين. ما الصيغة الأنسب؟ وهل يكفي المبلغ المتبقّي؟',
  /** Les trois phases de l'analyse, dans la forme des synthèses du manuel (unités 2 à 6) — textes de la plateforme. */
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'نحدّد المهام: عدد التلاميذ والمرافقين، الناقل الأرخص، والصيغة الأنسب لكراء القاربين، ثم الحكم على كفاية المبلغ المتبقّي. ونحدّد المتغيّرات: $x$ عدد التلاميذ في الجزأين 1 و 2، و $x$ عدد ساعات الكراء في الجزء 3.' },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', text: 'كل جزء يعيدنا إلى درس من الوحدة: عددان مجهولان ومعلومتان (جملة معادلتين نفسّرها بيانيا)، ثمن بجزء ثابت وجزء متغيّر (دالة تآلفية)، ثمن معلوم بعرضين فقط (عددان وصورتاهما)، ثم مقارنة صيغ (نقطة تقاطع المستقيمات).' },
    { label: 'تنفيذ استراتيجية الحل المختارة', text: 'نحلّ الجملة بيانيا، نحسب صورة 32 بدالة «الأمل»، نعيّن دالة «النورس» بتناسب التغيّرات، نقرأ نقطة تقاطع المستقيمين ونقارن، ثم نقرأ الصيغة الأرخص لـ 5 ساعات ونفسّر النتيجة بالدينار.' },
  ],
};

/** Les دروس de l'unité, pour les renvois « عند الحاجة أعود إلى الدرس ». */
export const LESSON_TITLES = {
  'mafhum-taalufiya': 'الدرس 1 — مفهوم وتعيين دالة تآلفية',
  'tamthil-bayani-taalufi': 'الدرس 2 — التمثيل البياني لدالة تآلفية وقراءته بيانيًا',
  'tanasub-taghayyurat': 'الدرس 3 — تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما',
  'tafsir-bayani-jumla': 'الدرس 4 — التفسير البياني لحل جملة معادلتين',
  'tarrid-taalufi': 'الدرس 5 — حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية',
};
export const lessonPath = (code) => `${BASE}/${code}`;

/** Chaque partie de la situation et le درس qu'elle mobilise (module 7, étape 2 ; renvois). */
export const PARTS = [
  { id: 'part-1', label: 'عدد التلاميذ $x$ وعدد المرافقين $y$', lesson: 'tafsir-bayani-jumla' },
  { id: 'part-2a', label: 'ثمن الناقل «الأمل» للقسم', lesson: 'mafhum-taalufiya' },
  { id: 'part-2b', label: 'دستور ثمن الناقل «النورس»', lesson: 'tanasub-taghayyurat' },
  { id: 'part-2c', label: 'اختيار الناقل وصيغة الكراء', lesson: 'tarrid-taalufi' },
];

/**
 * Les props du laboratoire `plan-compare` du module 7 (RÉUTILISÉ de la leçon 5 « حل مشكلات وترييض
 * وضعيات », manipulations/affine/PlanCompare.jsx) à ses DEUX niveaux — contrat des props du brief de
 * l'unité 7 §6. Écrites ici une fois : le module les étale, lab.render.test.jsx monte le workspace avec
 * exactement ces props. Monde `rental` (location à la plage).
 *   مبتدئ  deux tarifs de VÉLO : la carte 200 DA + 50 DA de l'heure contre 100 DA de l'heure ; l'élève
 *          MODÉLISE d'abord la carte (b payé une fois, a payé x fois), puis compare — égalité à 4 h (400 DA).
 *   متقدم  les trois tarifs de KAYAK de la situation : 150x, 50x + 300, 600 ; deux points de croisement
 *          utiles (3 h et 6 h), trois plages d'heures — sans échafaudage de modélisation.
 */
export const LAB = {
  beginner: { plans: '50x+200|100x', mode: 'model|compare', xMax: '8', yMax: '800', theme: 'rental' },
  advanced: { plans: '150x|50x+300|600', mode: 'compare', xMax: '10', yMax: '1600', theme: 'rental' },
};

/**
 * Les méthodes et les corrections du module 7 — importées aussi par la carte (knowledgeGraph.js) :
 * une aide de la carte cite la leçon mot pour mot. Toute égalité dans `$…$`.
 */
export const REMARKS = {
  eqY: 'من $300x + 600y = 12000$ : $600y = -300x + 12000$ ، ثم نقسم على 600 : $y = -\\dfrac{1}{2}x + 20$. ومن $x + y = 36$ : $y = -x + 36$.',
  jumla: 'المستقيمان $y = -x + 36$ و $y = -\\dfrac{1}{2}x + 20$ يتقاطعان في النقطة $(32 ; 4)$ : $32 + 4 = 36$ و $300 \\times 32 + 600 \\times 4 = 9600 + 2400 = 12000$.',
  pairWrong: 'نقرأ نقطة التقاطع فنكتب الثنائية $(4 ; 32)$ : 4 تلاميذ و 32 مرافقا.',
  pairWhy: 'الثنائية حلّ الجملة هي إحداثيتا نقطة التقاطع: الفاصلة أولا ثم الترتيب، والفاصلة هنا عدد التلاميذ $x$.',
  pairRight: 'الفاصلة 32 والترتيب 4 : الثنائية $(32 ; 4)$ ، أي 32 تلميذا و 4 مرافقين.',
  amal: 'ثمن «الأمل»: $f(x) = 150x + 6000$ ، دالة تآلفية معاملها 150 (ثمن التلميذ) وترتيبها عند المبدأ 6000 (المبلغ الثابت). من أجل 32 تلميذا: $f(32) = 150 \\times 32 + 6000 = 4800 + 6000 = 10800$.',
  amalMax: 'العدد الذي صورته 12000 : $150x + 6000 = 12000$ ، أي $150x = 6000$ ومنه $x = 40$ تلميذا.',
  nisyanB: 'العدد $150 \\times 32 = 4800$ هو الجزء المتغيّر وحده: نسينا المبلغ الثابت 6000 DA.',
  nawras: 'من العرضين: $a = \\dfrac{12200 - 9800}{36 - 24} = \\dfrac{2400}{12} = 200$ ، ثم $b = 9800 - 200 \\times 24 = 9800 - 4800 = 5000$ : $g(x) = 200x + 5000$.',
  taghayyurWrong: 'نأخذ فرق الثمنين $12200 - 9800 = 2400$ معاملا: $g(x) = 2400x + 5000$.',
  taghayyurWhy: 'الفرق 2400 DA هو ثمن 12 تلميذا إضافيا، لا ثمن تلميذ واحد.',
  taghayyurRight: 'نقسم على فرق العددين: $a = \\dfrac{2400}{12} = 200\\,\\mathrm{DA}$ للتلميذ.',
  cross: 'المستقيمان يقطعان محور التراتيب في 6000 و 5000 ، ويتقاطعان في النقطة $(20 ; 9000)$ : $150 \\times 20 + 6000 = 200 \\times 20 + 5000 = 9000$.',
  choice: 'بعد 20 تلميذا يصبح مستقيم «الأمل» تحت مستقيم «النورس»: من أجل 32 تلميذا $f(32) = 10800$ و $g(32) = 200 \\times 32 + 5000 = 11400$ ، فـ «الأمل» أرخص.',
  afdalWrong: '«النورس» أرخص دائما لأنّ مبلغه الثابت 5000 DA أصغر من 6000 DA.',
  afdalWhy: 'المبلغ الثابت يحسم المقارنة عند 0 تلميذ فقط؛ ثمن التلميذ عند «النورس» أكبر، فمستقيمه يصعد أسرع ويتجاوز مستقيم «الأمل» عند 20 تلميذا.',
  afdalRight: 'نقارن بحسب قيمة المتغيّر: قبل 20 تلميذا «النورس» أرخص، وبعد 20 تلميذا «الأمل» أرخص.',
  kayak5: 'من أجل 5 ساعات: الصيغة أ $150 \\times 5 = 750$ ، الصيغة ب $50 \\times 5 + 300 = 550$ ، الصيغة جـ $600$ : الصيغة ب هي الأرخص.',
  kayakRanges: 'أ و ب تتساويان عند 3 ساعات ($150 \\times 3 = 50 \\times 3 + 300 = 450$) ، و ب و جـ عند 6 ساعات ($50 \\times 6 + 300 = 600$) : أ هي الأرخص قبل 3 ساعات، ب بين 3 و 6 ساعات، جـ بعد 6 ساعات.',
  rest: 'المبلغ المتبقّي: $12000 - 10800 = 1200\\,\\mathrm{DA}$ ، والقاربان بالصيغة ب لـ 5 ساعات: $2 \\times 550 = 1100\\,\\mathrm{DA}$. إذن $1100 < 1200$ : المبلغ يكفي ويبقى 100 DA.',
  tafsir: 'الجواب عدد طبيعي من التلاميذ أو من الساعات، بالدينار، ولا يتجاوز المبلغ المتاح: إذا لم يكن الحل عددا طبيعيا ندوّر نحو الأسفل.',
  notTheTest: 'وضعية «إختبار أولي» رحلة أخرى بأعداد أخرى: نفس المراحل الثلاث ونفس الدروس الخمسة.',
};

/**
 * « إختبار أولي » (module 8) — une AUTRE sortie, mêmes cinq ressources, autres nombres : la situation
 * du module 7 a été résolue en classe, l'évaluation est la transposition.
 *   participants  x + y = 40 et 250x + 500y = 11000 → (36 ; 4)
 *   « الفجر »     h(x) = 120x + 6400 ; h(36) = 10720
 *   « الموج »     deux devis (20 ; 7600) et (30 ; 9400) → k(x) = 180x + 4000 ; k(36) = 10480 ; égalité à 40
 *   pédalos       200x, 100x + 300, 800 ; 6 heures → جـ (800 DA)
 *   budget        180x + 4000 ≤ 11000 → x ≤ 38,8… → 38 élèves au plus (arrondi vers le bas)
 */
export const TEST = {
  source: addition('synthesis_generation'),
  title: 'رحلة إلى شاطئ الصابلات',
  intro: 'قسم آخر ينظّم رحلة إلى شاطئ الصابلات بالجزائر العاصمة ليكتشف تلاميذه جمال وطنهم.',
  part1: '1) ركب الحافلة 40 شخصا بين تلاميذ ومرافقين. ساهم كل تلميذ بـ 250 DA وكل مرافق بـ 500 DA ، فجُمع مبلغ 11000 DA ( $x$ عدد التلاميذ و $y$ عدد المرافقين).',
  part2: '2) الناقل «الفجر» يطلب 6400 DA ثابتة و 120 DA عن كل تلميذ. الناقل «الموج» ثمنه دالة تآلفية لعدد التلاميذ: 7600 DA لـ 20 تلميذا و 9400 DA لـ 30 تلميذا.',
  part3: '3) كراء قارب بدوّاسات: الصيغة أ 200 DA للساعة؛ الصيغة ب رسم ثابت 300 DA ثم 100 DA للساعة؛ الصيغة جـ 800 DA جزافيا لليوم.',
  numbers: { persons: 40, pupilPays: 250, adultPays: 500, collected: 11000, pupils: 36, adults: 4, fajr: '120x+6400', mawj: { x1: 20, y1: 7600, x2: 30, y2: 9400 }, mawjRule: '180x+4000', boat: { A: '200x', B: '100x+300', C: '800' }, hours: 6, maxPupils: 38 },
};
