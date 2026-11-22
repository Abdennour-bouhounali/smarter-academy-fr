import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — le « أستعدّ » du manuel (p. 43, items 1–11) est
 * réparti entre les leçons 1 à 3 (extraction › destinations › prep) : la
 * synthèse n'en reçoit aucun. Ses affirmations sont donc des AFFIRMATIONS DE
 * LA PLATEFORME (SourceTag « عبارة إضافية من المنصّة »), dans la forme du
 * manuel, sur ce que la situation mobilise : résoudre une
 * équation (درس 1), le produit nul (درس 2), résoudre une inéquation et la
 * représenter (درس 3), traduire un texte (درس 4), développer / factoriser
 * (الوحدة 3). Jamais les nombres du مسبح (75, 560, 5).
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'muadala', text: 'حل المعادلة $3x - 7 = 11$ هو 6.', answer: true, why: '$3 \\times 6 - 7 = 18 - 7 = 11$ : الحل الوحيد هو 6.', source: addition('prerequisite_diagnostic') },
  { n: 2, skill: 'muadala', text: 'حل المعادلة $5x + 2 = 2x - 4$ هو 2.', answer: false, why: '$5x - 2x = -4 - 2$ أي $3x = -6$ ، إذن $x = -2$ (ننقل الحد بتغيير إشارته).', source: addition('prerequisite_diagnostic') },
  { n: 3, skill: 'jidaa', text: 'المعادلة $(x + 4)(2x - 6) = 0$ تقبل حلين هما $-4$ و 3.', answer: true, why: 'جداء معدوم: $x + 4 = 0$ أو $2x - 6 = 0$ ، أي $x = -4$ أو $x = 3$.', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'mutarajiha', text: 'حلول المتراجحة $-2x > 8$ هي الأعداد $x$ حيث $x > -4$.', answer: false, why: 'نقسم الطرفين على $-2$ ، وهو عدد سالب، فنغيّر اتجاه المتراجحة: $x < -4$.', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'tamthil', text: 'لتمثيل حلول المتراجحة $x \\leq 5$ نلوّن بالأحمر الجزء الواقع على يسار العدد 5، والعدد 5 حل لها.', answer: true, why: 'الحلول هي الأعداد الأصغر من 5 أو المساوية له: الجزء على اليسار، و 5 منها لأنّ $5 \\leq 5$ صحيحة.', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'tarrid', text: 'إذا كان ثمن كرّاس $x$ دج، فإنّ ثمن 4 كراريس وقلم ثمنه 30 دج هو $4(x + 30)$.', answer: false, why: 'القلم يُشترى مرّة واحدة: الثمن $4x + 30$ ، أمّا $4(x + 30)$ فثمن 4 كراريس و 4 أقلام.', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'tahlil', text: '$(2x - 1)^2 - (2x - 1)(x + 3) = (2x - 1)(x - 4)$', answer: true, why: 'العامل المشترك $2x - 1$ : $(2x - 1)[(2x - 1) - (x + 3)] = (2x - 1)(x - 4)$.', source: addition('prerequisite_diagnostic') },
];

/**
 * « أدمج تعلّماتي » (p. 52) — la وضعية du مسبح البلدي : c'est le DÉFI 🏆 (module 8, Module08Ahill.jsx, qui lit `text` et `source`). Ses
 * trois phases d'analyse (`analysis`) restent comme source. La photographie du manuel est redessinée (components/MuadalatFigures › PoolScene).
 * Aucun écran avant le module 7 ne montre ces nombres ni ce lieu (content/forbidden.js, content/mission.test.js).
 * Règle du propriétaire (2026-11-12) : la monnaie est « دج », jamais « دينار » ni « DA ».
 */
export const SITUATION = {
  source: src('situation', 52, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: 'لممارسة رياضة السباحة في المسبح البلدي، يقترح نادٍ رياضيٌّ على التلاميذ المتمدرسين صيغتين للاشتراك. الصيغة الأولى: الدفع الفوري 75 دج لكل حصة. الصيغة الثانية: اشتراك سنوي قدره 560 دج ودفع فوري قدره 5 دج لكل حصة. ابتداءً من أي عدد للحصص تكون التسعيرة الثانية أفضل ؟',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'ترجمة كل صيغة بعبارة حرفية، لتحديد الصيغة الأفضل نقارن الصيغتين.' },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', text: 'يمكن التفكير في التجريب، كتابة متراجحة مناسبة وحلّها فيما بعد.' },
    { label: 'تنفيذ استراتيجية الحل', text: 'إجراء تجريب، حل متراجحة، ثم تفسير النتائج.' },
  ],
  // Les nombres de la situation : la plateforme ne les retape nulle part ailleurs.
  numbers: { perSession1: 75, yearly: 560, perSession2: 5 },
};

/**
 * La وضعية DE L'UNITÉ telle que le module 7 la lit (la synthèse dans le lecteur de mission, 2026-11-12) : la MÊME situation que le défi 🏆, dite
 * avec les mots de la plateforme, et ses données à trier (« مفيد » / « غير مفيد »). Le module 7 l'ANALYSE et ne la résout jamais.
 */
export const M7_SITUATION = {
  text: 'حرصًا على صحّة التلاميذ، يقترح نادٍ رياضيّ لممارسة السباحة في المسبح البلدي صيغتين للاشتراك. الصيغة الأولى: 75 دج لكل حصّة. الصيغة الثانية: اشتراك سنوي قدره 560 دج يُدفع مرّة واحدة، ثم 5 دج لكل حصّة. يفتح المسبح أبوابه كل يوم، وتدوم الحصّة ساعة واحدة. ابتداءً من أيّ عدد للحصص تكون الصيغة الثانية أفضل؟',
  data: [
    { id: 'first', text: 'الصيغة الأولى: 75 دج لكل حصّة', useful: true },
    { id: 'yearly', text: 'الصيغة الثانية: اشتراك 560 دج يُدفع مرّة واحدة', useful: true },
    { id: 'second', text: 'الصيغة الثانية: 5 دج لكل حصّة', useful: true },
    { id: 'days', text: 'يفتح المسبح أبوابه كل يوم', useful: false },
    { id: 'hour', text: 'تدوم الحصّة ساعة واحدة', useful: false },
    { id: 'health', text: 'النادي يحرص على صحّة التلاميذ', useful: false },
  ],
};

/**
 * La démarche EN LETTRES (la carte des معارف et les cartes de mémoire sont ouvertes dès le premier écran, donc AVANT le module 7 : elles ne
 * montrent ni le مسبح ni ses nombres — content/forbidden.js › SITUATION_TEXT) : une formule à a دج la séance, une formule à un abonnement f et
 * b دج la séance (a > b).
 */
export const METHOD_LETTERS = {
  question: 'صيغة أولى بـ $a$ دج لكل حصّة، وصيغة ثانية باشتراك $f$ دج يُدفع مرّة واحدة ثم $b$ دج لكل حصّة، حيث $a > b$ : ابتداءً من كم حصّة تكون الثانية أفضل؟',
  read: 'نسمّي $x$ عدد الحصص، ونترجم كل صيغة: $ax$ و $f + bx$ .',
  strategy: 'نجرّب عدّة أعداد للحصص، ثم نكتب المتراجحة $f + bx < ax$ .',
  execute: 'نحلّ المتراجحة، ثم نختار أصغر عدد طبيعي يحقّقها: عدد التساوي ليس الجواب.',
  steps: ['قراءة الوضعية وفهمها', 'تحليل الوضعية واختيار استراتيجية حلّ مناسبة', 'تنفيذ استراتيجية الحلّ'],
};

/**
 * Les corrections du module 7 et de la carte des معارف — EN LETTRES ou sur l'exemple de la carte (50x contre 200 + 10x : égalité à 5, meilleure à
 * partir de 6), jamais le défi. Importées aussi par la carte (knowledgeGraph.js) : une aide de la carte cite la leçon mot pour mot.
 */
export const REMARKS = {
  tarjamaWrong: 'نكتب تكلفة الصيغة الثانية $(f + b)x$ : نضرب الاشتراك أيضًا في عدد الحصص.',
  tarjamaWhy: 'الاشتراك يُدفع مرّة واحدة مهما كان عدد الحصص؛ وحده ثمن الحصّة يتكرّر مع كل حصّة.',
  tarjamaRight: 'من أجل $x$ حصّة: تكلفة الصيغة الأولى $ax$ ، وتكلفة الصيغة الثانية $f + bx$ .',
  tajrib: 'التجريب: نحسب تكلفة الصيغتين من أجل عدّة أعداد للحصص، فنرى متى تتساويان ومتى تصبح الثانية أقلّ تكلفة.',
  mufadala: '«الصيغة الثانية أفضل» تعني أنّ تكلفتها أقلّ: $f + bx < ax$ .',
  istirjaa: 'في كل حصّة توفّر الصيغة الثانية $a - b$ دج؛ تتساوى التكلفتان حين يساوي هذا التوفير الاشتراك: $(a - b)x = f$ .',
  tasawiWrong: 'من $x > 5$ نستنتج أنّ الصيغة الثانية تصبح أفضل ابتداءً من 5 حصص.',
  tasawiWhy: 'من أجل 5 حصص تتساوى التكلفتان، و 5 لا يحقّق $x > 5$ : لا تكون الصيغة الثانية أفضل.',
  tasawiRight: 'عدد الحصص عدد طبيعي: أصغر عدد طبيعي يحقّق $x > 5$ هو 6.',
  notSolvedHere: 'هنا قرأنا الوضعية، ترجمنا الصيغتين وكتبنا المتراجحة. حلّها ينتظرك في التحدّي.',
};
