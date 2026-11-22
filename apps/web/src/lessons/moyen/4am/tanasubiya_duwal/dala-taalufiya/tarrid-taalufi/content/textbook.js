/**
 * Le contenu du درس 5 « حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية » — données pures (aucun JSX).
 * Chaque bloc porte sa `source` :
 *
 *   act-4  نشاط 4 p. 79, question 1 SEULEMENT (doublon déclaré : extraction → destinations › act-4 ›
 *          duplicatedIn) — l'abonnement du supporter : 2000DA + 200DA par match ; 7 matchs → 3400DA ;
 *          4800DA → 14 matchs. Au mot près. Les questions 2 (f(x) = 200x + 2000, تناسب التغيّرات) sont
 *          celles de la leçon 3.
 *
 * Tout le reste est un AJOUT de la plateforme, déclaré : le manuel n'a pour ce sujet ni معارف, ni طرائق,
 * ni exercice (`addition('knowledge_formalization')` pour la connaissance écrite dans le vocabulaire du
 * manuel, `addition('interactive_example')` pour les exemples, `addition('prerequisite_diagnostic')`
 * pour « أستعدّ »). Aucune phrase de la plateforme ne porte `src()`.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** نشاط 4 (p. 79), question 1 — au mot près (extraction › act-4 › text). */
export const ACT_4 = {
  source: src('act-4', 79, 'أنشطة', 4),
  title: 'تناسب التغيّرات',
  text: '1) لمتابعة مباريات كرة القدم، يعرض مركّب رياضي، يدعو مناصريه إلى الروح الرياضية ونظافة المدرّجات، على مناصري فريق المدينة الصيغة التالية: اشتراك سنوي لموسم رياضي حيث يدفع كل مناصر مبلغ 2000DA يضاف إليه مبلغ 200DA يدفعه عند كل دخول للملعب لمشاهدة مقابلة فريقه المفضّل.',
  questions: [
    'إذا تابع مناصر 7 مقابلات خلال موسم رياضي، فما هو المبلغ الإجمالي الذي يدفعه؟',
    'إذا دفع مناصر مبلغا إجماليا قدره 4800DA، فما هو عدد المقابلات التي تابعها؟',
  ],
  // extraction › act-4 › answer (calculées) : 2000 + 200 × 7 = 3400 ; (4800 − 2000) / 200 = 14
  numbers: { fixed: 2000, perMatch: 200, matches: 7, seven: 3400, budget: 4800, matches4800: 14 },
};

/** Ce que la مذكرة du professeur lit comme « وضعية الانطلاق ». */
export const ACTIVITY = {
  source: ACT_4.source,
  title: 'نشاط 4 (السؤال 1) — اشتراك المناصر',
  text: ACT_4.text,
  questions: ACT_4.questions,
  closing: 'المبلغ الإجمالي $f(x) = 200x + 2000$ : الاشتراك 2000DA يُدفع مرّة واحدة، و 200DA تُدفع $x$ مرّة. 7 مقابلات تكلّف 3400DA ، و 4800DA توافق 14 مقابلة.',
  numbers: ACT_4.numbers,
};

/**
 * La comparaison du module 2 : le stade propose AUSSI le billet seul. C'est un AJOUT de la plateforme
 * (le manuel ne compare pas) : il prolonge نشاط 4 dans son propre monde.
 * 200x + 2000 = 400x ⇔ x = 10 ; f(10) = g(10) = 4000.
 */
export const TICKET = {
  source: addition('interactive_example'),
  text: 'يعرض المركّب الرياضي صيغة ثانية دون اشتراك: 400DA عند كل دخول إلى الملعب. أيّ الصيغتين يختار المناصر؟',
  numbers: { perMatch: 400, cross: 10, costAtCross: 4000 },
};

/**
 * LES LABORATOIRES (plan-compare, contrat du brief §6) — le module étale EXACTEMENT ces objets ;
 * lab.render.test.jsx les monte dans le workspace.
 *   m1 مبتدئ  — salle de jeux : carte mensuelle 500DA + 150DA l'heure (plateforme, plus petits nombres)
 *   m1 متقدم  — نشاط 4 : 2000 + 200 par match, cibles du manuel (7 matchs ; 4800DA)
 *   m2 مبتدئ  — le stade : l'abonnement contre le billet seul → égalité à 10 matchs (4000DA)
 *   m2 متقدم  — la salle de jeux, trois formules du mois : 100DA l'heure ; carte 600DA + 40DA l'heure ;
 *               illimité 1800DA → la moins chère change à 10 h (1000DA) puis à 30 h (1800DA) ; 100x = 1800
 *               (18 h) est une égalité « au-dessus » de la carte
 */
export const LAB = {
  m1: {
    beginner: { plans: '150x+500', mode: 'model', theme: 'gaming', title: 'قاعة الألعاب: بطاقة شهرية وساعات لعب' },
    advanced: { plans: '200x+2000', mode: 'model', ask: 'x:7|y:4800', theme: 'stadium', title: 'نشاط 4: اشتراك المناصر 2000DA و 200DA للمقابلة' },
  },
  m2: {
    beginner: { plans: '200x+2000|400x', mode: 'compare', theme: 'stadium', title: 'الاشتراك أم التذكرة وحدها؟' },
    advanced: { plans: '100x|40x+600|1800', mode: 'compare', xMax: '40', theme: 'gaming', title: 'قاعة الألعاب: ثلاث صيغ للشهر' },
  },
};

/* ── La connaissance (écrite par la plateforme dans le vocabulaire du manuel) ─────────────────── */

/** P1 — modéliser un coût « partie fixe + partie variable ». */
export const MODEL_RULE = {
  source: addition('knowledge_formalization'),
  text: 'عندما تتكوّن تكلفة من جزء ثابت $b$ يُدفع مرّة واحدة وجزء يُدفع عن كل وحدة بسعر $a$ ، فإن تكلفة $x$ وحدة هي $f(x) = ax + b$ : الدالة $f : x \\longmapsto ax + b$ دالة تآلفية. مثلا في قاعة الألعاب: بطاقة شهرية 500DA ثم 150DA للساعة تعطي $f(x) = 150x + 500$ .',
};

/** P1 — lire une image et chercher le nombre dont l'image est connue, dans la situation. */
export const IMAGE_RULE = {
  source: addition('knowledge_formalization'),
  text: 'مبلغ $x$ وحدة معلومة هو صورة $x$ : $f(7) = 200 \\times 7 + 2000 = 3400$ . وعدد الوحدات لمبلغ معلوم $m$ هو العدد الذي صورته $m$ : نحلّ المعادلة $ax + b = m$ ، مثل $200x + 2000 = 4800$ أي $200x = 2800$ ومنه $x = 14$ .',
};

/** P2 — l'égalité des deux coûts : l'équation, et le croisement des droites. */
export const EQUAL_RULE = {
  source: addition('knowledge_formalization'),
  text: 'تتساوى تكلفتا صيغتين $f$ و $g$ عندما $f(x) = g(x)$ : حلّ هذه المعادلة هو فاصلة نقطة تقاطع المستقيمين اللذين يمثّلانهما. في الملعب: $200x + 2000 = 400x$ أي $200x = 2000$ ومنه $x = 10$ ، والنقطة $(10 ; 4000)$ .',
};

/** P2 — la meilleure formule : l'inéquation, et la droite la plus basse. */
export const CHEAPER_RULE = {
  source: addition('knowledge_formalization'),
  text: 'تكون الصيغة $f$ أرخص من $g$ عندما $f(x) < g(x)$ : نحلّ هذه المتراجحة. بيانيا، الصيغة الأرخص هي التي يقع مستقيمها تحت الآخر. في الملعب: $200x + 2000 < 400x$ أي $x > 10$ : الاشتراك أرخص ابتداءً من 11 مقابلة، والتذكرة أرخص لأقل من 10 مقابلات. الصيغة الأفضل تتعلّق بقيمة $x$ .',
};

/**
 * طرائق (module 3) — LA méthode de la plateforme, sur deux forfaits de téléphone :
 *   f(x) = 50x + 600 (abonnement 600DA + 50DA le Go) ; g(x) = 200x (200DA le Go)
 *   50x + 600 = 200x ⇔ 600 = 150x ⇔ x = 4 ; f(4) = g(4) = 800 ; f(x) < g(x) ⇔ x > 4.
 * Forme lue par <MethodSteps> : exercise, solution[], rule.
 */
export const METHOD = {
  source: addition('knowledge_formalization'),
  title: 'ترييض وضعية بدالة تآلفية والمفاضلة بين صيغتين',
  exercise: 'يعرض متعامل هاتف نقّال على أمين باقتين للأنترنت كل شهر. الباقة A: اشتراك شهري 600DA ثم 50DA لكل 1Go. الباقة B: 200DA لكل 1Go دون اشتراك. أيّ باقة يختار أمين؟',
  solution: [
    '1) نختار المتغير: نسمّي $x$ عدد الجيغا (Go) التي يستهلكها أمين في الشهر.',
    '2) نعبّر عن كل تكلفة بدالة تآلفية: الباقة A $f(x) = 50x + 600$ ، والباقة B $g(x) = 200x$ .',
    '3) نحلّ: تتساوى التكلفتان عندما $50x + 600 = 200x$ أي $600 = 150x$ ومنه $x = 4$ ، و $f(4) = g(4) = 800$ . والباقة A أرخص عندما $50x + 600 < 200x$ أي $600 < 150x$ ومنه $x > 4$ .',
    '4) نقرأ بيانيا: المستقيمان يتقاطعان في النقطة $(4 ; 800)$ ؛ قبل الفاصلة 4 مستقيم الباقة B تحت مستقيم الباقة A، وبعدها العكس.',
    '5) نجيب في سياق الوضعية: إذا استهلك أمين أقل من 4Go يختار الباقة B، وإذا استهلك أكثر من 4Go يختار الباقة A، ومن أجل 4Go تتساوى الباقتان (800DA).',
  ],
  rule: [
    'لترييض وضعية والمفاضلة بين صيغتين: نختار المتغير، نعبّر عن كل تكلفة بدالة تآلفية، نحلّ المعادلة $f(x) = g(x)$ ثم المتراجحة $f(x) < g(x)$ ، نقرأ النتيجة على التمثيل البياني، ونجيب بجملة في سياق الوضعية.',
  ],
  numbers: { cross: 4, cost: 800 },
};

/** La règle de la méthode, une phrase (carte des connaissances, مذكرة). */
export const METHOD_RULE = {
  source: addition('knowledge_formalization'),
  text: METHOD.rule[0],
};

/**
 * Module 2, étape 4 : lire deux tarifs sur un graphique (dessiné : components/TaxiGraph.jsx).
 * Deux applications de transport : A 120DA à la prise en charge + 40DA le km ; B 60DA le km.
 * 120 + 40x = 60x ⇔ x = 6 (360DA) ; à 4 km : A 280DA, B 240DA ; à 9 km : A 480DA, B 540DA.
 */
export const TAXI = {
  source: addition('interactive_example'),
  text: 'تطبيقان للنقل في المدينة. التطبيق A: 120DA عند الانطلاق ثم 40DA لكل كيلومتر. التطبيق B: 60DA لكل كيلومتر. التمثيل البياني يعطي ثمن الرحلة بدلالة المسافة $x$ (km).',
  A: { a: 40, b: 120 }, B: { a: 60, b: 0 }, xMax: 10, yMax: 600, cross: 6, costAtCross: 360,
};

/** L'erreur que le laboratoire refuse (MISC-TARRID-JUZ-THABIT) — reprise par la carte. */
export const MISTAKE_FIXED = {
  source: addition('knowledge_formalization'),
  wrong: 'نمذجة الاشتراك كأنه يُدفع عند كل مقابلة: $f(x) = 2000x + 200$ .',
  why: 'الاشتراك يُدفع مرّة واحدة في الموسم: من أجل 7 مقابلات يعطي هذا النموذج $2000 \\times 7 + 200 = 14200$ DA بدل 3400DA.',
  right: 'الجزء الثابت هو $b$ والجزء الذي يُدفع عند كل مقابلة هو $ax$ : $f(x) = 200x + 2000$ .',
};

/** L'erreur que la peinture refuse (MISC-TARRID-AFDAL-DAIMAN) — reprise par la carte. */
export const MISTAKE_ALWAYS = {
  source: addition('knowledge_formalization'),
  wrong: 'القول إن صيغة التذكرة هي الأرخص دائمًا لأن «لا اشتراك فيها».',
  why: 'من أجل 15 مقابلة: الاشتراك $200 \\times 15 + 2000 = 5000$ DA والتذكرة $400 \\times 15 = 6000$ DA.',
  right: 'الصيغة الأفضل تتعلّق بعدد المقابلات: تتغيّر عند فاصلة نقطة التقاطع $x = 10$ .',
};

/**
 * « أستعدّ » — le manuel n'a AUCUN item pour cette leçon (ses items vont aux leçons 1 et 2) : huit
 * affirmations de la PLATEFORME dans la forme du manuel, deux par prérequis du propriétaire (équation,
 * inéquation, image / antécédent par une fonction affine, lecture graphique), les deux réponses
 * présentes. Aucune n'utilise les nombres de نشاط 4 (2000, 200, 7, 4800) ni du billet (400).
 */
export const PREP_ITEMS = [
  { skill: 'muadala', text: 'حلّ المعادلة $6x + 15 = 51$ هو $x = 6$ .', answer: true, why: '$6x = 51 - 15 = 36$ ومنه $x = 6$ . تحقّق: $6 \\times 6 + 15 = 51$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'muadala', text: 'حلّ المعادلة $3x + 12 = 5x$ هو $x = -6$ .', answer: false, why: '$12 = 5x - 3x = 2x$ ومنه $x = 6$ . تحقّق: $3 \\times 6 + 12 = 30 = 5 \\times 6$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'mutarajiha', text: 'حلول المتراجحة $2x + 9 < 4x + 1$ هي الأعداد $x > 4$ .', answer: true, why: '$9 - 1 < 4x - 2x$ أي $8 < 2x$ ومنه $x > 4$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'mutarajiha', text: 'إذا كان $-3x < 12$ فإنّ $x < -4$ .', answer: false, why: 'نقسم على $-3$ وهو سالب فنغيّر اتجاه المتراجحة: $x > -4$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'sura', text: 'إذا كان $f(x) = 30x + 150$ فإنّ صورة العدد 5 بالدالة $f$ هي 300.', answer: true, why: '$f(5) = 30 \\times 5 + 150 = 150 + 150 = 300$ .', source: addition('prerequisite_diagnostic') },
  { skill: 'sura', text: 'إذا كان $f(x) = 30x + 150$ فإنّ العدد الذي صورته 450 هو 15.', answer: false, why: 'نحلّ $30x + 150 = 450$ : $30x = 300$ ومنه $x = 10$ . العدد 15 هو $450 \\div 30$ ، دون طرح 150.', source: addition('prerequisite_diagnostic') },
  { skill: 'bayan', text: 'التمثيل البياني للدالة $x \\longmapsto 2x + 3$ مستقيم يقطع محور التراتيب في النقطة $(0 ; 3)$ .', answer: true, why: '$f(0) = 2 \\times 0 + 3 = 3$ : الترتيب عند المبدأ هو 3.', source: addition('prerequisite_diagnostic') },
  { skill: 'bayan', text: 'إذا كان التمثيل البياني لدالة تآلفية $f$ يشمل النقطة $(4 ; 9)$ فإنّ $f(9) = 4$ .', answer: false, why: 'الفاصلة هي العدد والترتيب هو صورته: $f(4) = 9$ .', source: addition('prerequisite_diagnostic') },
];
