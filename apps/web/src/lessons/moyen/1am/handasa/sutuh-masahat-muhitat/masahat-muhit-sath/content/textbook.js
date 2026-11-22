/**
 * Le contenu du درس « مساحة سطح مستو ومحيطه » (1AM, unité 11) — données pures. Le manuel (docs/sources/1am/unit11/extraction.json)
 * est la RÉFÉRENCE des الكفاءات : ici tout est réécrit par la plateforme (autres mots, autres formes, autres contextes — guide
 * §4ter-bis), chaque bloc citant seulement l'élément dont il est tiré (`src`) pour la traçabilité de `check:textbook`.
 * Les nombres des labos (`LAB`) sont ceux des préréglages de `manipulations/levels.js › tile-yard` et des tâches du module 3.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/** Les réglages des labos (mêmes valeurs que `levels.js` pour le module 1 ; `FLOOR` est passé par le module 3). */
export const LAB = {
  beginner: { world: 'yard', mode: 'fence' },
  advanced: { world: 'yard', mode: 'rope' },
  FLOOR: ['terrace-halves', 'terrace-double'],
  // les lectures du monde `floor` (brief des auteurs) : 14 dalles entières + 4 demi-dalles = 16 ; 21 dalles simples = 10,5 doubles
  floor: { wholes: 14, halves: 4, halvesArea: '16', ones: '21', twos: '10,5' },
  // les valeurs que le labo fait atteindre (le test les recalcule avec sa propre arithmétique)
  tiles: 12,
  shortestFence: 14,
  rope: 12,
  ropeAreas: [5, 6, 7, 8, 9],
};

/** Les connaissances (معارف) — les mots de la plateforme. */
export const KNOWLEDGE = {
  area: {
    source: src('know-1', 151, 'أوظّف تعلّماتي', 1),
    text: 'مساحة سطح هي عدد وحدات المساحة التي تغطّيه تمامًا، بلا فراغ وبلا تراكب. وحدة المساحة سطحٌ نتّخذه مقياسًا، كبلاطة مربّعة ضلعها وحدة طول.',
  },
  perimeter: {
    source: src('know-1', 151, 'أوظّف تعلّماتي', 1),
    text: 'محيط سطح مستوٍ هو طول حدّه: نعدّ وحدات الطول، أي أضلاع البلاطات الواقعة على الحدّ، ونجمع أطوال أجزاء الحدّ كلّها. السياج الذي يحيط بالحوش مرّة واحدة طوله محيطه.',
  },
  different: {
    source: addition('knowledge_formalization'),
    text: 'المساحة تجيب عن «كم بلاطة تغطّي هذا السطح؟» والمحيط يجيب عن «كم عصا سياج تحيط به؟»: عددان مختلفان لسطح واحد، بوحدتين مختلفتين، ولا يُعرف أحدهما من الآخر.',
  },
  moving: {
    source: addition('knowledge_formalization'),
    text: 'إذا نقلنا بلاطات من موضع إلى آخر دون أن نضيف بلاطة أو نزيلها بقيت المساحة كما هي، أمّا المحيط فيتغيّر عادةً: تلتصق البلاطات بأضلاع أكثر فيقصر الحدّ، أو بأضلاع أقل فيطول.',
  },
  sameAreaOnly: {
    source: src('know-1', 151, 'أوظّف تعلّماتي', 1),
    text: 'قد يكون لسطحين مختلفين المساحة نفسها دون أن يكون لهما المحيط نفسه: عشر بلاطات في صفّين لها سياج غير سياج عشر بلاطات في مستطيل آخر مقطوع الزوايا.',
  },
  samePerimeterOnly: {
    source: src('know-1', 151, 'أوظّف تعلّماتي', 1),
    text: 'وقد يكون لسطحين المحيط نفسه دون أن تكون لهما المساحة نفسها: بالسياج نفسه نحيط بعدد مختلف من البلاطات.',
  },
  sameBoth: {
    source: src('know-1', 151, 'أوظّف تعلّماتي', 1),
    text: 'وقد يكون لسطحين المساحة نفسها والمحيط نفسه ومع ذلك يختلف شكلاهما.',
  },
  honeycomb: {
    source: src('opener', 147, 'تمهيد'),
    text: 'لماذا قرص الشمع سداسي؟ لأنّ السداسيات المنتظمة تملأ المستوى بلا فراغ، ومن بين كل طرق تقسيم المستوى إلى خلايا متساوية المساحة تحتاج الخلايا السداسية إلى أقصر حدود، أي إلى أقل شمع لمساحة معطاة.',
  },
  halves: {
    source: src('method-1', 152, 'أكتسب طرائق', 1),
    text: 'حين يقطع حدّ السطح مربّعًا بقطره نعدّ نصف مربّع، وكل نصفين يكوّنان مربّعًا واحدًا: ست بلاطات كاملة وأربعة أنصاف هي ثماني بلاطات.',
  },
  units: {
    source: src('method-1', 152, 'أكتسب طرائق', 1),
    text: 'عدد وحدات المساحة يتغيّر بتغيّر الوحدة: إذا كانت الوحدة ② ضعف الوحدة ① فعدد وحدات ② نصف عدد وحدات ①، وإذا كانت الوحدة ② نصف الوحدة ① فعدد وحدات ② ضعفه. المساحة نفسها، أمّا الأعداد فمختلفة.',
  },
  unitLength: {
    source: src('know-1', 151, 'أوظّف تعلّماتي', 1),
    text: 'وحدة الطول التي نقيس بها المحيط هي ضلع بلاطة الوحدة؛ وكل وحدة طول ترافقها وحدة مساحة هي المربّع الذي ضلعه تلك الوحدة.',
  },
};

/** طريقة — « أعيّن المساحة برصف » : مثال محلول سطرًا سطرًا (MethodSteps). L'unité double est l'objet de `KNOWLEDGE.units` (après la question du module 3). */
export const METHOD_TILING = {
  source: src('method-1', 152, 'أكتسب طرائق', 1),
  title: 'أعيّن مساحة سطح برصف',
  exercise: 'رُصّت أرضية بتسع بلاطات كاملة وستة أنصاف بلاطة. ما مساحتها بوحدة المساحة، وهي البلاطة الكاملة؟',
  solution: [
    '1. نعدّ البلاطات الكاملة: 9 بلاطات.',
    '2. نعدّ الأنصاف: 6 أنصاف، وكل نصفين يكوّنان بلاطة، فهي $6\\div2=3$ بلاطات.',
    '3. نجمع: $9+3=12$ .',
    '4. مساحة الأرضية 12 وحدة مساحة، أي ما يعادل 12 بلاطة كاملة.',
  ],
  rule: 'نغطّي السطح بوحدة المساحة ثم نعدّ: البلاطات الكاملة، ثم نضمّ كل نصفين في بلاطة واحدة، ثم نجمع.',
};

/** « أستعدّ » — six affirmations : mesurer une longueur (1–2), le polygone (3–4), le mot « محيط » (5), compter par rangées (6). */
export const PREP_ITEMS = [
  { skill: 'qiyas', text: 'نقيس طول قطعة مستقيمة بوحدة طول بأن نعدّ كم مرّة تتّسع الوحدة فيها.', answer: true, why: 'قياس طول هو عدّ وحدات الطول التي تملأه.', source: addition('prerequisite_diagnostic') },
  { skill: 'qiyas', text: 'طول خطّ مكسور مؤلّف من قطعتين طولاهما 3 و 5 وحدات هو 15 وحدة.', answer: false, why: 'نجمع طولي القطعتين: $3+5=8$ وحدات.', source: addition('prerequisite_diagnostic') },
  { skill: 'mudalaa', text: 'المضلّع شكل مغلق تحدّه قطع مستقيمة فقط، ولا يوجد فيه قوس.', answer: true, why: 'أضلاع المضلّع قطع مستقيمة تتتابع حتى تغلق الشكل.', source: addition('prerequisite_diagnostic') },
  { skill: 'mudalaa', text: 'المستطيل مضلّع له خمسة أضلاع.', answer: false, why: 'للمستطيل أربعة أضلاع.', source: addition('prerequisite_diagnostic') },
  { skill: 'qiyas', text: 'يُسمّى طول الخط الذي يحيط بسطح محيط هذا السطح.', answer: true, why: 'محيط سطح هو طول حدّه.', source: src('prep', 148, 'استحضر مكتسباتي', 1) },
  { skill: 'adad', text: 'أرضية رُصّت بثلاثة صفوف في كل صفّ خمس بلاطات، فعدد بلاطاتها 8.', answer: false, why: 'ثلاثة صفوف من خمس بلاطات: $5+5+5=15$ بلاطة، لا 8.', source: addition('prerequisite_diagnostic') },
];

/** Les erreurs courantes, mot pour mot (knowledgeGraph.js les cite). */
export const GUIDE = {
  confusion: {
    wrong: 'محيط الحوش هو عدد بلاطاته: حوش من اثنتي عشرة بلاطة محيطه 12.',
    why: 'عدد البلاطات هو المساحة. المحيط هو طول السياج الذي يحيط بها، وحوش $3\\times4$ مثلًا يحتاج إلى 14 عصا لا 12.',
    right: 'المساحة 12 بلاطة، والمحيط 14 عصا: عددان مختلفان لسطح واحد.',
  },
  longerBigger: {
    wrong: 'الحوش الأطول سياجًا هو الأكبر مساحة.',
    why: 'بالبلاطات الاثنتي عشرة نفسها يطول السياج أو يقصر حسب الترتيب، والمساحة ثابتة: 12 بلاطة سواء كان السياج 14 أو 26 عصا.',
    right: 'قد يزيد المحيط والمساحة ثابتة.',
  },
  halfIgnored: {
    wrong: 'نهمل نصف البلاطة لأنّها ليست بلاطة كاملة.',
    why: 'نصفا بلاطة يكوّنان بلاطة كاملة، فإهمالهما ينقص المساحة.',
    right: 'نضمّ كل نصفين في بلاطة واحدة عند العدّ.',
  },
};
