/**
 * الدرس 4 — ترييض مشكلة
 * Unité 4 du manuel (4AM) : طرائق p. 49 (« ترييض مشكلة » : le père de 36 ans et ses
 * trois enfants, دوري الآن 2), exercices 10–13 (p. 50), 30 et 33 (p. 51), 37–40
 * (p. 53, أتعمّق). Le manuel n'a ni نشاط ni « أستعدّ » pour ce sujet : le laboratoire
 * est l'entrée de la PLATEFORME dans la طريقة, déclarée (`platform_adaptation`) ;
 * « أستعدّ » est fait d'affirmations de la plateforme.
 * Puis trois « مسائل » de la plateforme (modules 4–6).
 * Source de vérité : docs/sources/4am/unit4/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue (module 1) : la course des âges (growth-race) — un père de 30 ans et son fils de 6 ans (niveau مبتدئ, ouvert par
 *   défaut), puis l'exercice du manuel, le père de 36 ans et ses trois enfants (متقدم). Le manuel n'a pas d'activité pour ce sujet :
 *   la course EST l'entrée de la plateforme (déjà déclarée `platform_adaptation`, inchangée) ; l'élève pose lui-même « + x » sur chaque
 *   personne qui grandit, et le labo refuse un enfant oublié.
 *   Rejetées : (1) la solution de la طريقة (أ ب جـ التحقق) lue d'abord — elle donne la réponse avant tout geste (elle vient au
 *   module 2, APRÈS la course) ; (2) l'énoncé du manuel en carte au-dessus du labo (retirée : devenu le `lead` du labo متقدم).
 *   Ordre des idées : « + x » sur chacun (la course) → POURQUOI chaque enfant porte son « + x » (le labo a déjà fait construire
 *   l'équation) → résoudre 36 + x = 3x + 18 → la brique « tarrid-namdhaja » APRÈS → le التحقق → M2 : la solution du manuel ligne à
 *   ligne → les quatre étapes (la brique APRÈS la question) → دوري الآن 2 → la course à solution négative (la brique APRÈS la question)
 *   → un حل qui ne convient pas (la brique APRÈS).
 *   Aucune destination du manuel n'a bougé ; aucune ressource `platform_designed_entry` ajoutée (non touché : déjà `platform_adaptation`).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/tarrid-mushkila';

export const LESSON_CONFIG = {
  id: 'tarrid-mushkila',
  kind: 'lesson',
  unit: 'muadalat-mutarajihat',
  unitTitle: 'معادلات ومتراجحات من الدرجة الأولى بمجهول واحد',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ par le propriétaire le 2026-11-08 ; rollout leçon par leçon,
  // docs/reports/MISSION_ROLLOUT_PROGRESS.md — unité 4, leçon 4, 2026-11-11) — implique le regard « focus » ; l'enseignant et le mode classe ne
  // voient aucun changement. LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre (aucun nombre, aucun « ثلاثة ») ; les outils sont les
  // connaissances de knowledge.jsx ; les points d'étape (conseil du 2026-11-11) RAPPROCHENT sans rien résoudre : ni les nombres de la مسألة, ni une
  // solution négative lue comme « منذ n سنوات », ni un entier choisi après une inégalité stricte — content/mission.test.js et
  // _unit/missionStrings.test.js. La scène : « جدار القامات » (`family-heights`), une toise de bois sans aucun nombre.
  studentView: 'mission',
  knowledgeMapOpen: true,
  mission: {
    scene: 'family-heights',
    title: 'جدار القامات: متى يلحق الأبناء بأبيهم؟',
    opening: {
      text: 'يطرح أبٌ على أبنائه ألغازًا عن أعمارهم: «أعماركم مجتمعةً أصغر من عمري اليوم، لكنّكم تكبرون كلّكم… بعد كم سنة يصير مجموع أعماركم مساويًا عمري؟ وهل يتحقّق كل ما أقوله عن أعمارنا؟»',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'tarrid-namdhaja', icon: '🧩', label: 'من النص إلى المعادلة' },
      { id: 'tarrid-tariqa', icon: '🪜', label: 'أربع خطوات للترييض' },
      { id: 'tarrid-mutarajiha', icon: '📏', label: 'مشكلة تترجمها متراجحة' },
      { id: 'tahaqquq-waqi', icon: '✅', label: 'حلّ يلائم الواقع' },
    ],
    climaxModule: 4,
    checkpoints: [
      {
        id: 'cp-muhit', afterModule: 1,
        prompt: 'عرض مستطيل $x$ متر، وطوله يزيد عن عرضه بـ 3 أمتار. محيطه بدلالة $x$ :',
        options: ['$4x + 6$', '$2x + 3$', '$x^2 + 3x$'],
        correct: 0,
        explain: '$2(x + x + 3) = 4x + 6$ . من أجل $x = 2$ الضلعان 2 و 5 والمحيط 14 ؛ $2x + 3$ يعطي 7 (نصف المحيط) و $x^2 + 3x$ يعطي 10 (المساحة).',
      },
      {
        id: 'cp-la-yatajawaz', afterModule: 2,
        prompt: '«ثمن $x$ دفترًا، بـ 45 دينارًا للدفتر، لا يتجاوز 400 دينار» تُكتب:',
        options: ['$45x \\leq 400$', '$45x \\geq 400$', '$45x = 400$'],
        correct: 0,
        explain: '«لا يتجاوز» تعني أصغر من أو يساوي. 8 دفاتر تكلّف 360 دينارًا فهي ضمن الحدّ.',
      },
      {
        id: 'cp-tahaqquq', afterModule: 3,
        prompt: '«عدد إذا أضفنا إليه ضعفه نجد 57» : وجدنا $x = 19$ . أيّ حساب يتحقّق من الجواب في النص؟',
        options: ['$19 + 2 \\times 19 = 57$', '$19 + 2 = 21$', '$2 \\times 19 = 38$'],
        correct: 0,
        explain: 'النص يقول: العدد زائد ضعفه، أي $19 + 38 = 57$ .',
      },
    ],
  },
  title: 'ترييض مشكلة',
  description: 'حل مشكلات بتوظيف المعادلات والمتراجحات: اختيار المجهول المناسب، ترجمة نص المشكلة إلى معادلة أو متراجحة من الدرجة الأولى بمجهول واحد، حلها، ثم تفسير النتائج والتأكد من ملاءمتها للواقع.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 53,
  textbookRef: { unit: 4, activity: null, pages: '49, 50, 51, 53' },
  skills: [
    'اختيار المجهول المناسب وتسميته x',
    'ترجمة نص مشكلة (أعمار، أعداد، محيطات، مساحات، تكاليف) إلى معادلة أو متراجحة من الدرجة الأولى بمجهول واحد',
    'حل المعادلة أو المتراجحة المحصل عليها',
    'التحقق من الحل وتفسيره والتأكد من ملاءمته للواقع',
  ],
  teachingScope: {
    include: [
      'طريقة ترييض مشكلة: نسمّي x، نعبّر بالمعادلة، نحلّ، نتحقّق',
      'نمذجة وضعية بمتراجحة (مسدّس منتظم ومربّع: ما أقصر ضلع للمسدّس؟)',
      'التأكد من ملاءمة الحل للواقع: عدد طبيعي، طول موجب، حل مرفوض',
      'تمارين من إنتاج المنصّة: أعداد مجهولة، أعمار، محيطات، مساحات',
    ],
    exclude: [
      'تقنيات حل المعادلة من الدرجة الأولى (الدرس 1)',
      'خاصية الجداء المعدوم (الدرس 2)',
      'تقنيات حل المتراجحة وتمثيل حلولها (الدرس 3)',
    ],
  },
  // « مسألة الدرس » (rollout مسائل, 2026-10-06) : montrée dès le sommaire,
  // rappelée au module 1, résolue pas à pas au module 4 (content/problems.js).
  // Prolonge la course des âges du niveau متقدم : un père et trois enfants, d'autres nombres.
  lessonProblem: {
    module: 4,
    title: 'عائلة مراد: الأب وأبناؤه الثلاثة يكبرون معًا',
    statement: 'نحن في سنة 2026. عمر السيّد مراد 44 سنة، وعمر زوجته 39 سنة، وقد تزوّجا منذ 18 سنة. لهما ثلاثة أبناء أعمارهم 5 و 9 و 16 سنة. يحبّ مراد، تشجيعًا لأبنائه على حبّ العلم، أن يطرح عليهم ألغازًا عن أعمارهم.',
    illustration: { kind: 'scene', icon: 'person', bg: 'amber', extra: ['person', 'person', 'person'], chips: [{ label: 'عمر مراد', value: 44, unit: 'سنة' }, { label: 'عمر زوجته', value: 39, unit: 'سنة', tone: 'rose' }, { label: 'زواجهما منذ', value: 18, unit: 'سنة', tone: 'green' }, { label: 'الأبناء', value: '5 · 9 · 16', unit: 'سنة', tone: 'amber' }], ariaLabel: 'عائلة مراد: الأب عمره 44 سنة والأم 39 سنة وتزوّجا منذ 18 سنة، وثلاثة أبناء أعمارهم 5 و 9 و 16 سنة' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (prérequis du propriétaire) : résoudre une
  // équation du premier degré (leçon 1), une équation produit nul (leçon 2), une
  // inéquation (leçon 3), les formules de périmètre/aire, les coûts et pourcentages.
  priorKnowledge: ['hal-muadala', 'jidaa-maadum', 'hal-mutarajiha', 'muhit-misaha', 'taklifa-nisba'],
  resources: [
    // Module 1 : PAS d'activité du manuel (la leçon est une page de طرائق) — le
    // laboratoire est l'entrée de la plateforme dans la طريقة « ترييض مشكلة ».
    // مبتدئ : deux personnes, un « + x » chacune ; متقدم : l'exercice du manuel
    // (le père de 36 ans et trois enfants : trois « + x » à porter).
    {
      kind: 'manipulation', code: 'growth-race-30-6', type: 'growth-race', module: 1,
      level: 'beginner',
      title: 'أب عمره 26 سنة وابنه سنتان: متى يكون عمر الأب أربعة أضعاف عمر ابنه؟',
      objective: 'ترييض مشكلة: نسمّي x، كل ما يتغيّر مع x يحمل x، فالمعادلة لحظة تساوي الطرفين — ثم نحلّ ونتحقّق',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'smaller_numbers_for_first_contact', theme: 'family' },
      learningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'],
      sourceElementIds: ['method-modelling'],
    },
    {
      kind: 'manipulation', code: 'growth-race-36-4-6-8', type: 'growth-race', module: 1,
      level: 'advanced',
      title: 'أب عمره 52 سنة وأبناؤه الأربعة 7 و 8 و 10 و 12: متى يتساوى عمره مع مجموع أعمارهم؟',
      objective: 'ترييض مشكلة: نسمّي x، كل ما يتغيّر مع x يحمل x، فالمعادلة لحظة تساوي الطرفين — ثم نحلّ ونتحقّق',
      autonomy: 'أربعة أبناء دون أي اقتراح: التلميذ يقرّر وحده أنّ كل واحد منهم يحمل «+ x» (المجموع يزيد بـ 4x لا بـ x)، ثم يجد بنفسه لحظة التساوي ويتحقّق منها بقيمة قبلها وقيمة بعدها',
      experience: { type: 'platform_adaptation', reason: 'improved_interactivity_and_age_appropriateness', theme: 'family' },
      learningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'],
      sourceElementIds: ['method-modelling'],
    },
    // Module 2 : le même instrument, un seul niveau, sur une question dont la
    // solution est NÉGATIVE (« ثلاثة أضعاف » : 36 + x = 3(14 + x) ⇔ x = −3) — la
    // solution ne convient pas à l'histoire (P2).
    {
      kind: 'manipulation', code: 'growth-race-36-14', type: 'growth-race', module: 2,
      title: 'أخوان عمراهما 11 و 13 سنة: متى يصير مجموع عمريهما 18؟',
      learningPointIds: ['4am_tarrid-mushkila_P2'],
      sourceElementIds: ['method-modelling'],
    },
    // Modules 4–6 — les « مسائل » : exercices complets de type امتحان, ajouts
    // de la plateforme (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — عائلة مراد: متى يتساوى عمر الأب ومجموع أعمار أبنائه؟', learningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — السوق الأسبوعي: ثمن الخضر، كيس البطاطا والبرتقال', learningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — خزّانا الماء على السطح: متى يتساويان؟', learningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'تسع عبارات: حل معادلة ومعادلة جداء معدوم، حل متراجحة، المحيطات والمساحات، والتكاليف والنسب. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'sibaq', path: `${LESSON_BASE_PATH}/sibaq`,
      title: 'سباق الأعمار — من النص إلى المعادلة', desc: 'ضع «+ x» على كل من يكبر، ثم مدّد الزمن: متى يتساوى عمر الأب ومجموع أعمار أبنائه؟',
      stage: 'trigger', teachesLearningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أبني النموذج' },
    { id: '02', number: 2, slug: 'tarayiq', path: `${LESSON_BASE_PATH}/tarayiq`,
      title: 'طرائق — ترييض مشكلة', desc: 'الخطوات الأربع سطرًا سطرًا، ثم مسدّس ومربّع (متراجحة)، وسباق بلا لقاء، وورقة زميلة.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'],
      color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'أتعلّم الطريقة' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'عشرة تمارين من المنصّة: أعداد، أعمار، قراءة رواية، محيطات ومساحات.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'],
      color: 'amber', style: 'featured', estimatedMin: 15, difficulty: 3, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — أعمار عائلة مراد', desc: 'مسألة الدرس: أب وثلاثة أبناء. نسمّي، نترجم، نحلّ، نتحقّق — وحلّ سالب يجب تفسيره.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — السوق الأسبوعي', desc: 'ثمن الطماطم والبطاطا، ثم كيس الفلاح: متى يكون أربح؟ وكم كيلوغرامًا من البرتقال بما بقي؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — خزّانا الماء', desc: 'خزّانان يمتلئان بمعدّلين مختلفين: متى يتساويان؟ حلّ لا يلائم الواقع، ومدّة تكفي العائلتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-mushkila_P1', '4am_tarrid-mushkila_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين: الترييض، ثم الحل والتفسير.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
