import { src, addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » (module 0) — les items 1 et 2 du « أستعدّ » du manuel (p. 31,
 * extraction › destinations › prep › items 1-2 : la valeur d'une expression
 * pour un x donné), puis des AFFIRMATIONS DE LA PLATEFORME (SourceTag
 * « عبارة إضافية من المنصّة ») dans la forme du manuel sur ce que la situation
 * mobilise : un développement (درس 1), une identité (درس 2), une factorisation
 * (درس 3), une aire, Pythagore. Jamais les nombres du bassin (10, 44, 11).
 */
export const PREP_ITEMS = [
  { n: 1, skill: 'qima', text: 'من أجل $x = 0$ العبارة $3x - 3$ تساوي 0.', answer: false, why: '$3 \\times 0 - 3 = -3$', source: src('prep', 31, 'أستعدّ', 1) },
  { n: 2, skill: 'qima', text: 'من أجل $x = \\sqrt{3}$ العبارة $x^2 - 3$ تساوي 0.', answer: true, why: '$(\\sqrt{3})^2 - 3 = 3 - 3 = 0$', source: src('prep', 31, 'أستعدّ', 2) },
  { n: 3, skill: 'nashr', text: 'نشر الجداء $(x + 3)(x + 2)$ هو $x^2 + 5x + 6$.', answer: true, why: '$(x + 3)(x + 2) = x^2 + 2x + 3x + 6 = x^2 + 5x + 6$', source: addition('prerequisite_diagnostic') },
  { n: 4, skill: 'mutatabiqa', text: '$(x + 4)^2 = x^2 + 16$', answer: false, why: 'ينقص الحد المضاعف: $(x + 4)^2 = x^2 + 2 \\times x \\times 4 + 4^2 = x^2 + 8x + 16$', source: addition('prerequisite_diagnostic') },
  { n: 5, skill: 'tahlil', text: 'تحليل العبارة $x^2 - 9$ هو $(x - 3)(x + 3)$.', answer: true, why: '$x^2 - 9 = x^2 - 3^2 = (x - 3)(x + 3)$ : فرق مربعين.', source: addition('prerequisite_diagnostic') },
  { n: 6, skill: 'masaha', text: 'مساحة مثلث قائم طولا ضلعيه القائمين 6cm و 8cm هي $48\\,cm^2$.', answer: false, why: 'مساحة المثلث القائم نصف جداء ضلعيه القائمين: $\\dfrac{6 \\times 8}{2} = 24$، أي $24\\,cm^2$.', source: addition('prerequisite_diagnostic') },
  { n: 7, skill: 'fithaghuras', text: 'المثلث الذي أطوال أضلاعه 6cm و 8cm و 10cm قائم.', answer: true, why: '$6^2 + 8^2 = 36 + 64 = 100 = 10^2$ : حسب الخاصية العكسية لفيثاغورس المثلث قائم.', source: addition('prerequisite_diagnostic') },
];

/**
 * « أدمج تعلّماتي » (p. 40) — la وضعية, au mot près (+ une phrase de contexte, valeur « التعاون », 2026-10-13 ; le texte du manuel reste dans extraction.json), et son « تحليل الوضعية »
 * en trois étapes (le manuel les nomme). L'« مساعدة » du manuel est la seule
 * factorisation donnée : la plateforme n'enseigne rien de plus (le produit est
 * nul quand un facteur est nul — on vérifie par substitution).
 */
export const SITUATION = {
  source: src('situation', 40, 'أدمج تعلّماتي'),
  title: 'وضعية',
  text: 'يتعاون سكّان الحيّ على تهيئة حديقة عامة يرتادها الجميع. الشكل الملوّن بالأزرق هو حوض شكله مربع، طول ضلعه 10m. نريد تهيئة شريط منتظم حول هذا الحوض يخصص للراجلين عرضه $x$. ماهي قيمة $x$ حتى تكون مساحة الشريط تساوي $44m^2$؟',
  help: 'مساعدة : $x^2 + 10x - 11 = (x - 1)(x + 11)$',
  figure: 'حوض مربع ضلعه 10m (أزرق)، يحيط به من كل الجهات شريط عرضه $x$.',
  caption: 'الحوض والشريط',
  analysis: [
    { label: 'قراءة الوضعية وفهمها', text: 'المطلوب البحث عن العرض $x$ للشريط الذي من أجله تكون مساحة هذا الشريط $44m^2$.' },
    { label: 'تحليل الوضعية واختيار استراتيجية حل مناسبة', text: 'التعبير عن مساحة الشريط بدلالة $x$ (هناك طرق متعددة)؛ توظيف المعلومة « مساحة هذا الشريط $44m^2$ »' },
    { label: 'تنفيذ استراتيجية الحل', text: 'كتابة المساواة المناسبة ، حل معادلة ، ...' },
  ],
};

/** « تحدّ » de la page d'unité (p. 31) — l'accroche de la synthèse, résolue à la fin du module 7 (extraction › challenge › duplicatedIn). */
export const CHALLENGE = {
  source: src('challenge', 31, 'تحدّ'),
  text: 'لاحظ الشكل المقابل حيث ABC مثلث. ما هي قيمة العدد $x$ التي من أجلها يكون المثلث ABC قائما في A ؟',
  figure: 'مثلث ABC حيث $AB = x + 1$ ، $AC = x + 2$ ، $BC = x + 3$.',
};

/**
 * Le module 7 « وضعية الوحدة » dans le lecteur de mission (2026-11-12) : la وضعية en mots de la plateforme (le texte du manuel reste dans
 * `SITUATION.text`, lu par le module 8 — jamais retouché), SANS l'« مساعدة » (sa forme développée x² + 10x − 11 est une réponse du défi 🏆),
 * et ses données à trier (InfoSorter). Nombres et unités séparés par une espace (« 10 أمتار ») : collés à une lettre, ils se brouillent en RTL.
 */
export const M7_SITUATION = {
  text: 'يتعاون سكّان الحيّ على تهيئة حديقة عامة يرتادها الجميع. في وسطها حوض مربّع الشكل طول ضلعه 10 أمتار، ونريد أن نحيطه من كل الجهات بشريط منتظم للراجلين عرضه $x$ مترًا. ما قيمة $x$ حتى تكون مساحة الشريط 44 مترًا مربّعًا؟',
  data: [
    { id: 'hawd', text: 'الحوض مربّع طول ضلعه 10 أمتار', useful: true },
    { id: 'shrit', text: 'الشريط يحيط بالحوض من كل الجهات، وعرضه x', useful: true },
    { id: 'masaha', text: 'مساحة الشريط 44 مترًا مربّعًا', useful: true },
    { id: 'taawun', text: 'سكّان الحيّ يتعاونون على تهيئة الحديقة', useful: false },
    { id: 'jamia', text: 'الحديقة يرتادها الجميع', useful: false },
    { id: 'rajilin', text: 'الشريط مخصّص للراجلين', useful: false },
  ],
};

/**
 * Les corrections des questions du module 7 et de la carte des معارف — EN LETTRES (la synthèse dans le lecteur, 2026-11-12) : la carte et les
 * cartes de mémoire sont ouvertes dès le premier écran, donc AVANT le module 7 — elles ne montrent ni le bassin ni le ruban ni leurs nombres
 * (content/forbidden.js › SITUATION_TEXT). Elles parlent d'une NAPPE d'eau carrée de côté a (une نافورة) entourée d'un ممرّ de largeur x.
 * Importées par la carte (knowledgeGraph.js) : une aide de la carte cite la leçon mot pour mot. Toute égalité dans `$…$`.
 */
export const REMARKS = {
  dilWrong: 'ضلع المربّع الخارجي هو $a + x$ : نضيف عرض الممرّ مرّة واحدة.',
  dilWhy: 'الممرّ يحيط بالنافورة من كل الجهات: على الضلع الواحد ممرّ من جهة وممرّ من الجهة المقابلة.',
  dilRight: 'ضلع المربّع الخارجي هو $x + a + x = a + 2x$.',
  murabbaWrong: 'نكتب $(a + 2x)^2 = a^2 + 4x^2$ ، فتصبح مساحة الممرّ $4x^2$ فقط.',
  murabbaWhy: 'مربّع مجموع ليس مجموع المربّعين: ينقص الحدّ المضاعف، وهو في الشكل المستطيلات الأربعة التي بعداها $a$ و $x$.',
  murabbaRight: 'مربّع مجموع: $(a + 2x)^2 = a^2 + 4ax + 4x^2$.',
  twoWays: 'طريقتان لمساحة الممرّ: مساحة المربّع الخارجي ناقص مساحة النافورة، أو أربعة مستطيلات بعداها $a$ و $x$ وأربعة أركان مربّعة ضلعها $x$.',
  perimeterWhy: 'محيط النافورة في عرض الممرّ يعطي المستطيلات الأربعة فقط: تنقص الأركان الأربعة، مساحة كل منها $x^2$.',
  divide: 'نكتب المساواة «مساحة الممرّ = $S$»، ثم نقسم طرفيها على 4: $x^2 + ax = \\dfrac{S}{4}$ .',
  help: 'إذا كان أحد عاملي جداء معدومًا فإنّ الجداء معدوم: هذا ما يجعل الشكل المحلّل المعطى مفيدًا لحلّ المعادلة.',
  check: 'نتحقّق من كل قيمة بالتعويض في مساحة الممرّ، ونرفض القيمة السالبة لأنّ العرض طول.',
  mujab: 'العرض طول، فهو عدد موجب: من القيمتين اللتين تعدمان الجداء نحتفظ بالموجبة وحدها.',
  notSolvedHere: 'الحلّ نفسه في «التحدّي 🏆»: هنا فهمنا الوضعية واخترنا الاستراتيجية فقط.',
};

/** La démarche EN LETTRES (la carte des معارف ouverte dès le premier écran) — aucun nombre du défi ni de la وضعية. */
export const METHOD_LETTERS = {
  question: 'نافورة مربّعة ضلعها $a$ يحيط بها ممرّ عرضه $x$ مساحته $S$ معلومة: ما عرض الممرّ؟',
  read: 'المطلوب عرض الممرّ $x$ : نعرف ضلع النافورة $a$ ونعرف مساحة الممرّ $S$ .',
  strategy: 'نعبّر عن ضلع المربّع الخارجي بدلالة $x$ ، ثم عن مساحة الممرّ: المربّع الخارجي ناقص النافورة.',
  execute: 'نكتب المساواة «مساحة الممرّ = $S$» ونبسّطها، نستعمل الشكل المحلّل المعطى، ثم نحتفظ بالقيمة الموجبة ونتحقّق منها.',
  steps: ['قراءة الوضعية وفهمها', 'تحليل الوضعية واختيار استراتيجية حلّ مناسبة', 'تنفيذ استراتيجية الحلّ'],
};
