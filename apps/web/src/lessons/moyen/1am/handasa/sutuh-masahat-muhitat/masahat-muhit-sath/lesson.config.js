/**
 * الدرس — مساحة سطح مستو ومحيطه (1AM, unité 11 « السطوح المستوية : الأطوال، المحيطات، المساحات »). Le PREMIER درس de l'unité, généré
 * DANS son entrée du catalogue (items 1am.m2.r06 et 1am.m2.r07), cycle moyen phase 3, batch 4 entrée 3, 2026-10-15 — la première
 * leçon de géométrie-mesure de 1AM : il fonde les deux notions (aire = combien de dalles, périmètre = quelle longueur de clôture)
 * sur lesquelles reposent les quatre leçons suivantes (unités de mesure, rectangle et carré, triangle rectangle, cercle). Manuel 1AM
 * (الجيل الثاني) : نشاط 1 p. 149, معارف 1 p. 151, طريقة 1 p. 152, exercices 1–6 p. 155, أقوّم 1–2 p. 157, أتعمّق 2 p. 158,
 * استحضر مكتسباتي items 1–3 p. 148, تمهيد p. 147. Source : docs/sources/1am/unit11/extraction.json ; brief des auteurs :
 * docs/sources/1am/unit11/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre
 * (§4ter-bis) : tout est réécrit, autres contextes, autres formes, autres nombres.
 *   Entrée retenue : le حوش d'une maison paré de zellige (labo `tile-yard`, monde `yard`). La main tient UNE DALLE (une unité d'aire) :
 *   douze dalles à déplacer, et la clôture de bois tout autour suit. L'aire (le nombre de dalles) ne bouge jamais, le périmètre (le
 *   nombre d'éléments de clôture) change à chaque dalle déplacée — deux nombres LUS, jamais tapés, que le même geste meut
 *   indépendamment : c'est là que distinguer aire et périmètre devient NÉCESSAIRE sous la main. مبتدئ : douze dalles, la clôture la
 *   plus courte puis exactement 20 éléments (on garde les cours dans un cahier) ; متقدم : un rouleau de clôture de longueur FIXE (12), les
 *   dalles sont libres : même périmètre, aires différentes (5 à 9). On peut aussi « marcher autour de la clôture » : le périmètre est
 *   une longueur parcourue, l'aire ce qu'on foule. Le labo REFUSE (une dalle qui scinderait la cour, qui ne touche que par un coin, qui
 *   fermerait un trou, ou qui ferait dépasser le rouleau). L'aire est ensuite MESURÉE au module 3 avec le MÊME labo (monde `floor`) :
 *   un sol à paver avec des dalles entières, des demi-dalles le long d'un bord en biais, puis une unité double (21 unités ① = 10,5 unités ②).
 *   Rejetées : (a) le نشاط 1 du manuel comme entrée (remplir un tableau aire / périmètre de quatre figures, une question à laquelle on
 *   répond en comptant, sans que la main décide de rien) — il devient une APPLICATION en أتمرّن ; (b) découper et déplacer des pièces
 *   sur du papier (l'aire est conservée, mais le périmètre n'y est pas un nombre sous la main) ; (c) comparer des figures déjà faites à
 *   l'œil (aucun geste). Ordre des idées : l'aire est un nombre de dalles et ne bouge pas quand on les déplace, le périmètre bouge
 *   (P1/P3) → le périmètre est la longueur d'un bord, il raccourcit quand les dalles se touchent par plus de côtés (P1) → même clôture,
 *   aires différentes (P3) → معارف (les mots, les trois situations de deux surfaces) → طريقة (compter dalles entières et demi-dalles,
 *   puis une unité double : P2) → أتمرّن (les activités du manuel posées en application) → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure les acquis du primaire (mesurer une longueur par report d'une unité, nommer un polygone et ses côtés, compter par
 *   rangées) : le réseau n'a aucun lien « راجع » vers cette leçon.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/handasa/masahat-muhit-sath';

export const LESSON_CONFIG = {
  id: 'masahat-muhit-sath',
  kind: 'lesson',
  unit: 'sutuh-masahat-muhitat',
  unitTitle: 'السطوح المستوية: الأطوال، المحيطات، المساحات',
  sequentialUnlock: true,
  title: 'مساحة سطح مستو ومحيطه',
  description: 'في حوش مفروش بالزليج ننقل البلاطات فتبقى المساحة (عدد البلاطات) ويتغيّر المحيط (طول السياج)، ونعيّن مساحة أرضية برصفها ببلاطات كاملة وأنصاف بلاطات وبوحدتين مختلفتين، ثم نقارن سطوحًا: مساحتان متساويتان بمحيطين مختلفين، ومحيطان متساويان بمساحتين مختلفتين.',
  level: 'moyen',
  grade: '1am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الأنشطة الهندسية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🟫',
  estimatedDurationMin: 86,
  textbookRef: { unit: 11, activity: 1, pages: '147, 148, 149, 151, 152, 155, 157, 158' },
  skills: [
    'التمييز بين محيط سطح (طول حدّه، يُعدّ بوحدات الطول على حدّه) ومساحته (الحيّز الذي يشغله، يُعدّ بوحدات المساحة التي تغطّيه)',
    'تعيين مساحة سطح مستو برصفه بوحدة مساحة (مربعات، أنصاف مربعات) والتعبير عن المساحة نفسها بوحدتين مختلفتين بينهما علاقة (إحداهما ضعف الأخرى)',
    'مقارنة مساحات ومحيطات سطوح: سطحان لهما نفس المساحة دون نفس المحيط، وسطحان لهما نفس المحيط دون نفس المساحة',
  ],
  teachingScope: {
    include: ['المساحة عدد وحدات المساحة التي تغطّي السطح، والمحيط طول حدّه', 'نقل بلاطات: المساحة ثابتة والمحيط يتغيّر', 'الرصف ببلاطات كاملة وأنصاف بلاطات', 'مساحة واحدة بوحدتين إحداهما ضعف الأخرى', 'مقارنة سطوح: نفس المساحة دون نفس المحيط والعكس'],
    exclude: ['الوحدات mm² … km² والتحويلات بينها (درس «وحدات الطول ووحدات المساحة»)', 'قانونا محيط ومساحة المستطيل والمربع (الدرس «محيط ومساحة المستطيل والمربع»)', 'مساحة المثلث القائم (درس لاحق)', 'محيط القرص والعدد π (درس لاحق)'],
  },
  // « مسألة الدرس » : une ساحة d'un quartier à daller et à clôturer ; compter, chiffrer, comparer deux dispositions (module 5).
  lessonProblem: {
    module: 5,
    title: 'ساحة الحيّ',
    statement: 'قرّرت جمعية الحيّ تبليط ساحة صغيرة لألعاب الأطفال ببلاطات مربّعة متماثلة ثم إحاطتها بسياج خشبي. رُسمت الساحة على ورقة مرصوفة: كل خانة بلاطة، وضلع الخانة عصا من السياج. تعاونت العائلات على الشراء: ثمن البلاطة الواحدة 40 دج وثمن العصا الواحدة 150 دج. واقترح أحد المتطوّعين ترتيبًا آخر لنفس البلاطات يجعل الساحة مستطيلًا من ثلاثة صفوف في كل صفّ أربع بلاطات.',
    questions: [
      { label: '1)', text: 'كم بلاطة تغطّي الساحة المرسومة، وكم عصا تلزم لسياجها؟' },
      { label: '2)', text: 'ما ثمن البلاطات وما ثمن السياج؟' },
      { label: '3)', text: 'ما المبلغ الذي توفّره الجمعية من ثمن السياج إذا اعتمدت الترتيب المقترح؟' },
    ],
    figure: {
      points: { a: [0, 3], b: [4, 3], c: [4, 2], d: [5, 2], e: [5, 1], f: [3, 1], g: [3, 0], h: [0, 0] },
      hidden: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      segments: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f'], ['f', 'g'], ['g', 'h'], ['h', 'a']],
      polygons: [{ points: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], tone: 'sky' }],
      grid: true,
      maxWidth: 230,
      ariaLabel: 'ساحة اللعب مرسومة على ورقة مرصوفة: ثلاثة صفوف من البلاطات، في الصفّ الأول أربع وفي الثاني خمس وفي الثالث ثلاث',
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les acquis du primaire (le réseau ne donne aucun lien « راجع » vers cette leçon).
  priorKnowledge: ['qiyas-atwal-ibtidai', 'mudalaat-ibtidai', 'safoof-ibtidai'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `tile-yard` (la main tient UNE DALLE), monde `yard`, thème `courtyard` :
    //   مبتدئ — douze dalles à déplacer : la clôture la plus courte, puis exactement 20 éléments ; un cahier garde les cours.
    //   متقدم — un rouleau de clôture de 12 éléments : des cours à 5, …, 9 dalles avec le même périmètre.
    {
      kind: 'manipulation', code: 'tile-yard-fence', type: 'tile-yard', module: 1,
      level: 'beginner',
      title: 'حوش الزليج: اثنتا عشرة بلاطة',
      objective: 'نميّز بين مساحة سطح (عدد البلاطات التي تغطّيه) ومحيطه (طول السياج الذي يحيط به): نقل البلاطات يغيّر المحيط دون المساحة، وبحبل واحد نحصل على مساحات مختلفة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'courtyard' },
      learningPointIds: ['1am_masahat-muhit-sath_P1', '1am_masahat-muhit-sath_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'tile-yard-rope', type: 'tile-yard', module: 1,
      level: 'advanced',
      title: 'حوش الزليج: حبل السياج',
      objective: 'نميّز بين مساحة سطح (عدد البلاطات التي تغطّيه) ومحيطه (طول السياج الذي يحيط به): نقل البلاطات يغيّر المحيط دون المساحة، وبحبل واحد نحصل على مساحات مختلفة',
      autonomy: 'يحدّد التلميذ بنفسه كم بلاطة يضع داخل سياج بطول ثابت، ويحتفظ بالأحواش التي تستعمل الحبل كله ليقارنها',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'courtyard' },
      learningPointIds: ['1am_masahat-muhit-sath_P1', '1am_masahat-muhit-sath_P3'],
      sourceElementIds: ['act-1'],
    },
    // Module 3 — le MÊME labo, monde `floor`, posé seul (`levels={false}`) : une terrasse à paver (demi-dalles), puis une unité double.
    {
      kind: 'manipulation', code: 'tile-yard-floor', type: 'tile-yard', module: 3,
      title: 'بلاط الشرفة: كم وحدة مساحة؟',
      learningPointIds: ['1am_masahat-muhit-sath_P2'],
      sourceElementIds: ['method-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ساحة الحيّ', learningPointIds: ['1am_masahat-muhit-sath_P1', '1am_masahat-muhit-sath_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حوض أزهار', learningPointIds: ['1am_masahat-muhit-sath_P2', '1am_masahat-muhit-sath_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ورشة الزليج', learningPointIds: ['1am_masahat-muhit-sath_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ قياس الأطوال، المضلّعات، المحيط، العدّ بالصفوف.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — حوش الزليج', desc: 'اثنتا عشرة بلاطة وسياج خشبي: ننقل البلاطات ونرى ما يتغيّر وما لا يتغيّر.',
      stage: 'trigger', teachesLearningPointIds: ['1am_masahat-muhit-sath_P1', '1am_masahat-muhit-sath_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المساحة والمحيط', desc: 'من يشتري الخشب ومن يشتري البلاطات؟ وسطحان: ماذا يتساوى وماذا يختلف؟',
      stage: 'discovery', teachesLearningPointIds: ['1am_masahat-muhit-sath_P1', '1am_masahat-muhit-sath_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أعيّن المساحة برصف', desc: 'بلاطات كاملة وأنصاف بلاطات، ثم وحدة مساحة مزدوجة.',
      stage: 'formalization', teachesLearningPointIds: ['1am_masahat-muhit-sath_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'جدول المساحات والمحيطات، الخيط حول الشكل، الزاوية والوسط، أنصاف البلاطات، ثلاثة أزواج، مستطيل ومربع.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_masahat-muhit-sath_P1', '1am_masahat-muhit-sath_P2', '1am_masahat-muhit-sath_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ساحة الحيّ', desc: 'مسألة الدرس: عدّ البلاطات والعصي، الثمن، وترتيب أوفر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_masahat-muhit-sath_P1', '1am_masahat-muhit-sath_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — حوض أزهار', desc: 'مساحة سطح أنصاف بلاطاته تتتامّ، ومستطيلان لهما المساحة نفسها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_masahat-muhit-sath_P2', '1am_masahat-muhit-sath_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ورشة الزليج', desc: 'مساحة جدار بوحدتين، وعدد البلاطات الكبيرة التي نشتريها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_masahat-muhit-sath_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
