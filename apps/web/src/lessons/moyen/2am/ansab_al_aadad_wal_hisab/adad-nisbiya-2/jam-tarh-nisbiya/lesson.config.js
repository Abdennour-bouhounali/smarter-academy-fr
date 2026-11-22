/**
 * الدرس — جمع وطرح عددين نسبيين (2AM, unité 3 « الأعداد النسبية ») — DANS son entrée du catalogue (item 2am.m4.r05), cycle moyen phase 3, 2AM مقطع 2am.m4, paire 2 (2026-10-29).
 * Manuel 2AM (الجيل الثاني, منشورات الشهاب, scan), RÉFÉRENCE des الكفاءات : نشاط 3 et 4 p. 41, معارف 2 p. 44, طرائق 3 et 4 et دوري الآن p. 45, exercices 25–34 p. 48, أؤكّد 7 et 8 p. 49, أتعمّق 38, 45, 48, 57.
 * Source : docs/sources/2am/unit3/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis). Plan : docs/sources/2am/unit3/plan/jam-tarh-nisbiya.md.
 * Le réseau : `2am.m4.r01 → 2am.m4.r05` (requires) ; la leçon `talim-mustaqim-mudarraj-2` est publiée : « أستعدّ » mesure ses idées (distance à zéro, opposé, droite graduée) et le panneau « راجع »
 * y mène tout seul. Edges LP (même année, final الكفاءات) : P1, P2 et P3 ← `2am_talim-mustaqim-mudarraj-2_P1` (distances à zéro, opposé) ; internes P3 ← P1, P3 ← P2. `noRebuildForLesson` vide (r05 n'a ni extends ni consolidates).
 * La leçon CONSTRUIT les deux règles (la 1AM ne rencontrait les négatifs qu'en contexte).
 * Changements des الكفاءات (README, question 5) : P1 gagne l'exemple $(-3{,}2)+(-5)=(-8{,}2)$ ; P2 gagne « la somme de deux opposés est nulle » ; P3 gagne le résultat $=(+12)$.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « أكياس المنطاد » (labo `balloon-ballast`, monde `balloonvalley`). L'altitude d'un montgolfière est sa CHARGE : une nacelle de flamme (+1 m) et un sac (−1 m) ; une flamme avec un sac ne changent rien
 *   (paire neutre). La main tient la charge : attacher / jeter une flamme ou un sac (et à متقدم une paire neutre). Additionner (−4) = attacher quatre sacs ; soustraire (−3) = jeter trois sacs, le montgolfière MONTE comme si
 *   on avait attaché trois flammes : soustraire un nombre, c'est ajouter son opposé ; et quand il n'y a rien à jeter on attache d'abord des paires neutres (le truc du livre « (−7)+(+7) », fait avec les mains).
 *   Rejetées : (a) le نشاط 3 du manuel (les totaux d'un jeu à remplir, la règle seulement « conjecturée ») ; (b) le thermomètre (la soustraction d'un négatif n'a pas de geste) ; (c) des sauts sur une droite
 *   (`division-jumps`, retourner est une convention à mémoriser). Le نشاط 4 (−2 °C puis 5 de moins ; (+5)−(−7)) devient une APPLICATION en أتمرّن.
 *   Ordre des idées : même signe (attacher des sacs : les distances s'additionnent) → signes différents (des paires se verrouillent : on soustrait, signe du plus chargé) → opposés (tout se verrouille : 0) →
 *   soustraire un négatif (jeter des sacs : le montgolfière monte) → soustraire sans rien à jeter (paires neutres) → « soustraire = ajouter l'opposé » → معارف → طريقة → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/jam-tarh-nisbiya';
export const LESSON_CONFIG = {
  id: 'jam-tarh-nisbiya',
  kind: 'lesson',
  unit: 'adad-nisbiya-2',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'جمع وطرح عددين نسبيين',
  description: 'منطاد فوق وادي التاسيلي: بربط نفخات اللهب وأكياس الرمل وبرمي بعضها نبني قاعدتي جمع عددين نسبيين، ونكتشف أنّ طرح عدد هو جمع معاكسه.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎈',
  estimatedDurationMin: 88,
  textbookRef: { unit: 3, activity: 3, pages: '41, 44, 45, 48, 49, 50, 51' },
  skills: [
    'جمع عددين نسبيين لهما الإشارة نفسها: نجمع مسافتيهما إلى الصفر ونحتفظ بالإشارة المشتركة، مثل $(-3{,}2)+(-5)=(-8{,}2)$',
    'جمع عددين نسبيين من إشارتين مختلفتين: نطرح المسافة الصغرى إلى الصفر من الكبرى ونأخذ إشارة العدد الأبعد عن الصفر؛ ومجموع عددين متعاكسين معدوم',
    'طرح عدد نسبي بإضافة معاكسه، مثل $(+5)-(-7)=(+5)+(+7)=(+12)$',
  ],
  teachingScope: {
    include: ['جمع عددين نسبيين (الإشارة نفسها، إشارتان مختلفتان، متعاكسان) بالأعداد الصحيحة والعشرية', 'طرح عدد نسبي بإضافة معاكسه', 'إتمام عدد ناقص في مجموع أو فرق بالتفكير في القاعدة، وهرم المجاميع'],
    exclude: ['سلاسل من ثلاثة حدود أو أكثر والكتابة المبسّطة مثل $5-3$ (درس المجموع الجبري)', 'المسافة بين نقطتين على مستقيم مدرّج (درس لاحق: هنا «بكم ارتفع» فرق)', 'جداء الأعداد النسبية (السنة الثالثة)', 'الكسور كأعداد نسبية (السنة الثالثة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — صباحات الجلفة.
  lessonProblem: {
    module: 5,
    title: 'صباحات الجلفة',
    statement: 'سجّلت محطة الأرصاد في الجلفة $-4\\,{}^{\\circ}\\mathrm{C}$ عند الفجر، ثم ارتفعت الحرارة $11$ درجة حتى الظهر، ثم انخفضت $9$ درجات في المساء.',
    table: { caption: 'حرارة الجلفة وتغيّراتها بالدرجات', head: ['الفجر (الحرارة)', 'إلى الظهر (التغيّر)', 'إلى المساء (التغيّر)'], rows: [['-4', '+11', '-9']] },
    questions: [
      { label: '1)', text: 'احسب حرارة الظهر.' },
      { label: '2)', text: 'احسب حرارة المساء.' },
      { label: '3)', text: 'بكم تختلف حرارة المساء عن حرارة الفجر؟' },
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (2am.m4.r01), la comparaison (muqarana-nisbiya) et les décimaux de 1AM.
  priorKnowledge: ['masafa-ila-sifr', 'adad-mutaakis', 'faasila-nuqta', 'muqarana-nisbiya-2am', 'jam-tarh-ashri'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `balloon-ballast` (la main tient la CHARGE), monde `balloonvalley` :
    //   مبتدئ — t1 (+6)+(−4), t2 (−3)+(−5), t3 (−9)+(+5), t4 (−6)+(+6) ; متقدم — a1 (−7)−(−3), a2 (+5)−(−7), a3 (−2)−(+5), a4 (+6)−(+7) (l'altitude écrite AVANT d'exécuter).
    {
      kind: 'manipulation', code: 'balloon-ballast-beginner', type: 'balloon-ballast', module: 1,
      level: 'beginner',
      title: 'أكياس المنطاد: الجمع',
      objective: 'جمع عددين نسبيين هو ربط الأعداد في سلّة منطاد: المسافتان تُجمعان إذا اتّفقت الإشارتان، وتتقابل نفخة وكيس إذا اختلفتا',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'balloonvalley' },
      learningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2'],
      sourceElementIds: ['act-3', 'know-2a'],
    },
    {
      kind: 'manipulation', code: 'balloon-ballast-advanced', type: 'balloon-ballast', module: 1,
      level: 'advanced',
      title: 'أكياس المنطاد: الطرح',
      objective: 'جمع عددين نسبيين هو ربط الأعداد في سلّة منطاد: المسافتان تُجمعان إذا اتّفقت الإشارتان، وتتقابل نفخة وكيس إذا اختلفتا',
      autonomy: 'الارتفاع يُكتب قبل أن ينفّذ التلميذ البطاقة، وحين لا يوجد في السلّة ما يُرمى يربط أزواجًا محايدة أولًا',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'balloonvalley' },
      learningPointIds: ['2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      sourceElementIds: ['act-4', 'know-2b'],
    },
    // Module 2 — le MÊME labo, posé seul (`levels={false}`) : deux cartes (−8)+(+3) puis (+4)−(−6).
    {
      kind: 'manipulation', code: 'balloon-ballast-maarif', type: 'balloon-ballast', module: 2,
      title: 'أكياس المنطاد ببطاقتين جديدتين',
      learningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      sourceElementIds: ['know-2a', 'know-2b'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — صباحات الجلفة', learningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مصعد البرج', learningPointIds: ['2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — مسابقة بين قسمين', learningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ المسافة إلى الصفر والمعاكس وجمع العشريات.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — أكياس المنطاد', desc: 'منطاد فوق وادي التاسيلي: نربط نفخات اللهب وأكياس الرمل ونرميها، فنكتشف كيف نجمع عددين نسبيين وكيف نطرح عددًا نسبيًا.',
      stage: 'trigger', teachesLearningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الجمع والطرح', desc: 'نجرّب بطاقتين، ثم نسمّي قاعدتي الجمع وقاعدة الطرح.',
      stage: 'discovery', teachesLearningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أكتب الحساب', desc: 'أكتب مجموعًا وفرقًا بخطوات واضحة، بالأعداد العشرية أيضًا.',
      stage: 'formalization', teachesLearningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'حصيلة جولتين، طقس الجلفة، مجاميع وفروق، عدد ناقص، هرم، وفكرة خاطئة.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — صباحات الجلفة', desc: 'مسألة الدرس: حرارة الفجر والظهر والمساء، والفرق بين الفجر والمساء.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مصعد البرج', desc: 'طابق الوصول بعد الصعود والنزول، وكم طابقًا بين طابقين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — مسابقة بين قسمين', desc: 'نقاط موجبة وسالبة لقسمين، ومقارنة حصيلتيهما.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jam-tarh-nisbiya_P1', '2am_jam-tarh-nisbiya_P2', '2am_jam-tarh-nisbiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
