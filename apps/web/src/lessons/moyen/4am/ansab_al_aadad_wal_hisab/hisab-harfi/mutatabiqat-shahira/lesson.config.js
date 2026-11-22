/**
 * الدرس 2 من الوحدة 3 — المتطابقات الشهيرة
 * Manuel 4AM, unité 3 : نشاط 2 (pp. 32–33), ديكارت (p. 31), معارف 2 (p. 34),
 * طرائق (p. 35), دوري الآن 1 (p. 36), تمارين 9–19 (pp. 37–38), 28 أ (p. 39),
 * أتعمّق 35–36 (p. 41), أؤكّد تعلّماتي 7, 8, 13 (p. 40), أستعدّ 5–6 (p. 31),
 * puis trois « مسائل » de la plateforme (modules 5–7).
 * Source de vérité : docs/sources/4am/unit3/extraction.json.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le ملعب جواري carré `pitch-expansion` ((x + 3)², puis (x − 2)²), le labo EN TÊTE du module sans carte : la main
 *   étire x, porte les quatre zones et voit qu'avec deux carrés la somme ne rejoint jamais l'aire (les deux bandes manquent) ; la
 *   question « pourquoi » porte sur ses propres essais. Candidats écartés : (a) l'activité 2 du manuel telle quelle — l'identité
 *   du carré MNPQ et des calculs (8 + 2)², (3 + 0,5)² faits de tête avant tout besoin (elle devient la 2e étape, un calcul à deux
 *   façons APRÈS le « pourquoi ») ; (b) l'accroche de l'ouvrier (404 m² ou 484 m² ?) en carte au-dessus du labo — un second
 *   départ concurrent et une question tranchée avant que l'élève ait la moindre règle : elle devient l'APPLICATION finale du
 *   module 1 (et celle de l'entraîneur, +5 / −5, la finale du module 2). Le labo reste `platform_adaptation` : c'est la figure du
 *   livre (MNPQ, KLMN) redessinée en terrain, pas une situation de la plateforme étrangère au livre.
 *   Ordre des idées : pourquoi deux carrés ne suffisent pas → deux façons de calculer (8 + 2)² → l'aire en a, b → انقل وأكمل (brique
 *   `murabba-majmu` APRÈS) → développer → tableau de Descartes → calcul mental ; puis moitié « différence » : pourquoi le coin se
 *   rajoute → mêmes étapes → l'ouvrier. Module 2 : pourquoi le terme en x disparaît → preuve par les aires → انقل وأكمل (brique après)
 *   → développer → calcul mental (105 × 95) → l'entraîneur. Module 3 (معارف) : le contre-exemple d'abord, la brique `mutatabiqa`
 *   (la définition) APRÈS ; les trois identités reviennent en rappel. Modules 0, 4–8 : pratique, مسائل, test — inchangés.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/mutatabiqat-shahira';

export const LESSON_CONFIG = {
  id: 'mutatabiqat-shahira',
  kind: 'lesson',
  unit: 'hisab-harfi',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ par le propriétaire le 2026-11-08 ; rollout leçon par leçon,
  // docs/reports/MISSION_ROLLOUT_PROGRESS.md — unité 3, leçon 2, 2026-11-11) — implique le regard « focus » ; l'enseignant et le mode classe ne
  // voient aucun changement.
  studentView: 'mission',
  // LA MISSION : l'ouverture garde l'énoncé de la مسألة et avoue qu'on ne sait pas encore la résoudre ; les outils sont les connaissances de
  // knowledge.jsx ; les points d'étape (conseil du 2026-11-11, verdict L2 et « added rulings ») RAPPROCHENT de la mission sans en résoudre aucune
  // question : ni ses nombres (27, 729, 720, 171, 900, x = 30), ni sa méthode (un carré mental ancré sur 30 — d'où le point d'étape 2
  // (x + 6)(x − 6) au lieu de 41 × 39), ni sa correction (le coin retranché deux fois) — content/mission.test.js et _unit/missionStrings.test.js.
  // La scène : les gradins le long de deux côtés voisins du terrain carré (« stands-pitch », sur le kit commun de l'unité
  // lessons/common/mission/pitchSceneKit.jsx), le coin commun jamais mis en valeur.
  mission: {
    scene: 'stands-pitch',
    title: 'مدرّجات ملعب الحيّ: كم يبقى للّعب؟',
    opening: {
      text: 'ملعب مربّع ضلعه $x$ مترًا، يُقتطع منه على ضلعين متجاورين شريطان عرض كل منهما $3\\,m$ للمدرّجات. ما مساحة أرضية اللعب بدلالة $x$ ؟ وقال عامل: «تبقى $x^2 - 6x$» — هل هو محقّ؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'murabba-farq', icon: '⬛', label: 'مربّع فرق' },
      { id: 'hisab-mutamaan', icon: '🧮', label: 'الحساب الذهني بمتطابقة' },
      { id: 'tariqat-nashr', icon: '🧩', label: 'نشر عبارة بمتطابقة شهيرة' },
    ],
    climaxModule: 5,
    checkpoints: [
      {
        id: 'cp-murabba', afterModule: 1,
        prompt: '$(x + 8)^2 = \\ldots$',
        options: ['$x^2 + 16x + 64$', '$x^2 + 64$', '$x^2 + 8x + 64$'],
        correct: 0,
        explain: 'مربّع مجموع: $x^2 + 2 \\times x \\times 8 + 8^2$ . من أجل $x = 1$ : $81$ ، أمّا $x^2 + 64$ فتعطي $65$ .',
      },
      {
        id: 'cp-jidaa', afterModule: 2,
        prompt: '$(x + 6)(x - 6) = \\ldots$',
        options: ['$x^2 - 36$', '$x^2 + 36$', '$x^2 - 12x + 36$'],
        correct: 0,
        explain: 'جداء مجموع حدّين وفرقهما: $x^2 - 6^2 = x^2 - 36$ . المنطقتان المضافة والمقتطعة متساويتان فتتعادمان.',
      },
      {
        id: 'cp-mutatabiqa', afterModule: 3,
        prompt: 'المساواة $x^2 + 4 = 4x$ صحيحة من أجل $x = 2$ . هل هي متطابقة؟',
        options: ['لا: من أجل $x = 1$ الطرفان $5$ و $4$', 'نعم: صحيحة من أجل $x = 2$', 'نعم: لأنّ فيها مربّعًا'],
        correct: 0,
        explain: 'المتطابقة صحيحة من أجل كل القيم: قيمة واحدة لا تكفي لإثباتها، وقيمة واحدة تكفي لنفيها.',
      },
      {
        id: 'cp-naw', afterModule: 4,
        prompt: 'قبل نشر $(4x - 7)^2$ : ما نوعها، وما الحدّان؟',
        options: ['مربّع فرق؛ $a = 4x$ و $b = 7$', 'مربّع فرق؛ $a = 4$ و $b = 7$', 'جداء مجموع وفرق؛ $a = 4x$ و $b = 7$'],
        correct: 0,
        explain: 'العاملان متساويان، وبين حدّيهما $-$ : مربّع فرق، الحدّ الأول $4x$ كاملًا (بمعامله) والثاني $7$ .',
      },
    ],
  },
  title: 'المتطابقات الشهيرة',
  description: 'مربع مجموع، مربع فرق، وجداء مجموع حدين وفرقهما — نقرؤها على مساحات ملعب مربّع نمدّده ونقتطع منه، ونبرهنها بالنشر، ثم نوظّفها لنشر العبارات وللحساب الذهني دون وضع العملية (مثل 41² أو 102 × 98).',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '²',
  estimatedDurationMin: 55,
  textbookRef: { unit: 3, activity: 2, pages: '31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41' },
  skills: [
    'نشر مربع مجموع: (a + b)² = a² + 2ab + b²',
    'نشر مربع فرق: (a − b)² = a² − 2ab + b²',
    'نشر جداء مجموع حدين وفرقهما: (a + b)(a − b) = a² − b²',
    'الحساب الذهني المتمعّن فيه دون وضع العملية: 41² ، 49² ، 102 × 98',
  ],
  teachingScope: {
    include: [
      'تعريف المتطابقة والمتطابقات الشهيرة الثلاث، بأمثلة',
      'قراءة المتطابقات على مساحات ملعب مربّع وعلى جدول ديكارت',
      'نشر وتبسيط عبارات فيها مربعات وجداءات شهيرة، بمعاملات عشرية وكسرية وجذرية',
      'الحساب المتمعّن فيه: مربع عدد، جداء عددين متناظرين حول عدد مدوّر، فرق مربعين',
    ],
    exclude: [
      'التحليل باستعمال المتطابقات الشهيرة (الدرس 3)',
      'النشر بالخاصية التوزيعية وحدها دون متطابقة (الدرس 1)',
    ],
  },
  // « مسألة الدرس » : montrée dès le sommaire et au module 1, résolue au module 5
  // (content/problems.js › masala-1 reprend ce texte tel quel).
  lessonProblem: {
    module: 5,
    title: 'ملعب الحيّ: مدرّجات على ضلعين',
    statement: 'ملعب جواري في أحد أحياء مدينة سطيف مربّع الشكل، طول ضلعه $x$ مترًا. تعاونت جمعية الحيّ مع البلدية لتشجيع الأطفال على الرياضة، فقرّرتا أن تقتطعا منه، على طول ضلعين متجاورين، شريطين عرض كل منهما $3\\,m$ لتبني عليهما مدرّجات للمتفرّجين، فتبقى أرضية اللعب مربّعة الشكل. طول ضلع الملعب الحالي $30\\,m$. ستُغطّى أرضية اللعب بعشب اصطناعي ثمن المتر المربّع منه 1200 دج، وتُبلَّط المدرّجات ببلاط ثمن المتر المربّع منه 900 دج. يلعب في الملعب فريقان من 5 لاعبين، وقد فُتح سنة 2016.',
    illustration: { kind: 'plan', shape: 'cut', fill: 'grass', w: 'x', h: 'x', cut: '3', cutH: '3', unit: 'm', cutWord: 'مدرّجات', ariaLabel: 'ملعب مربّع طول ضلعه x يُقتطع من ركنه شريطان عرض كل منهما 3 m للمدرّجات' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : toutes les connaissances dès le début, sans verrou par محور.
  knowledgeMapOpen: true,
  // Leçon 1 de l'unité (nashr-qawsayn : (a + b)(c + d) ; tabsit-hudud : termes
  // semblables) et années antérieures (murabba-adad : carré d'un relatif, d'un
  // décimal, d'un produit ; quwa-ashara : puissances de 10).
  priorKnowledge: ['nashr-qawsayn', 'tabsit-hudud', 'murabba-adad', 'quwa-ashara'],
  resources: [
    // Module 1 : LE TERRAIN CARRÉ à deux niveaux (MANIPULATION_CONTRACT §7bis-levels).
    //   مبتدئ  — (x + 3)² : le carré MNPQ (act-2a) devenu un terrain qu'on allonge.
    //   متقدم  — (x − 2)² : le carré KLMN (act-2b) : deux bandes RETRANCHÉES, un coin RESTAURÉ.
    {
      kind: 'manipulation', code: 'pitch-expansion-square-sum', type: 'pitch-expansion', module: 1,
      level: 'beginner',
      title: 'ملعب مربّع ضلعه x + 3',
      objective: 'مساحة ملعب مربّع ضلعه مجموع حدّين أو فرقهما تساوي مجموع مساحات مناطقه، من أجل كل قيمة للحرف: (a ± b)² = a² ± 2ab + b²',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'football' },
      learningPointIds: ['4am_mutatabiqat-shahira_P1'],
      sourceElementIds: ['act-2a', 'history-descartes'],
    },
    {
      kind: 'manipulation', code: 'pitch-expansion-square-diff', type: 'pitch-expansion', module: 1,
      level: 'advanced',
      title: 'ملعب مربّع ضلعه x − 2: شريطان مقتطعان',
      objective: 'مساحة ملعب مربّع ضلعه مجموع حدّين أو فرقهما تساوي مجموع مساحات مناطقه، من أجل كل قيمة للحرف: (a ± b)² = a² ± 2ab + b²',
      autonomy: 'مربّع فرق: يُقتطع من الملعب شريطان ويبقى ركن اقتُطع مرّتين؛ على التلميذ أن يقرّر بنفسه أي منطقة تُطرح وأيها تُضاف، وأن يجمع الحدّين المتشابهين السالبين، دون أن يُقال له إن الركن يُضاف',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'football' },
      learningPointIds: ['4am_mutatabiqat-shahira_P2'],
      sourceElementIds: ['act-2b'],
    },
    // Module 2 : LE TERRAIN RECTANGULAIRE (a + b)(a − b), les nombres de act-2c جـ.
    //   مبتدئ  — (x + 3)(x − 3)
    //   متقدم  — (2x + 5)(2x − 5) (defaultLevel)
    {
      kind: 'manipulation', code: 'pitch-expansion-sum-diff-x', type: 'pitch-expansion', module: 2,
      level: 'beginner',
      title: 'ملعب طوله x + 3 وعرضه x − 3',
      objective: 'مساحة ملعب طوله مجموع حدّين وعرضه فرقهما: المنطقتان المضافة والمقتطعة متساويتان فتتعادمان، ويبقى (a + b)(a − b) = a² − b² من أجل كل قيمة للحرف',
      autonomy: '',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'football' },
      learningPointIds: ['4am_mutatabiqat-shahira_P3'],
      sourceElementIds: ['act-2c'],
    },
    {
      kind: 'manipulation', code: 'pitch-expansion-sum-diff-2x', type: 'pitch-expansion', module: 2,
      level: 'advanced',
      title: 'ملعب طوله 2x + 5 وعرضه 2x − 5',
      objective: 'مساحة ملعب طوله مجموع حدّين وعرضه فرقهما: المنطقتان المضافة والمقتطعة متساويتان فتتعادمان، ويبقى (a + b)(a − b) = a² − b² من أجل كل قيمة للحرف',
      autonomy: 'الحد الأول 2x: على التلميذ أن يقرأ الضلع 2x حدًّا واحدًا مربّعه 4x² لا 2x²، وأن يجد بنفسه المنطقتين المتعاكستين 10x و −10x ويجمعهما حتى تتعادما',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'football' },
      learningPointIds: ['4am_mutatabiqat-shahira_P3'],
      sourceElementIds: ['act-2c'],
    },
    // Les « مسائل » (modules 5–7) : situations de la plateforme, de type امتحان.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ملعب الحيّ: مدرّجات على ضلعين', learningPointIds: ['4am_mutatabiqat-shahira_P2', '4am_mutatabiqat-shahira_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — المسبح البلدي: ممرّ حول الحوض', learningPointIds: ['4am_mutatabiqat-shahira_P1', '4am_mutatabiqat-shahira_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — جولة الحساب الذهني في مسابقة المتوسطة', learningPointIds: ['4am_mutatabiqat-shahira_P1', '4am_mutatabiqat-shahira_P2', '4am_mutatabiqat-shahira_P3', '4am_mutatabiqat-shahira_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: صحيح أم خاطئ؟ نشر جداء قوسين وتبسيطه، ومربّع عدد نسبي أو جداء.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat-murabba', path: `${LESSON_BASE_PATH}/nashat-murabba`,
      title: 'مربّع مجموع ومربّع فرق', desc: 'ملعب مربّع يكبر: مدّد ضلعه، احسب مساحات مناطقه، اكتب القاعدة، ثم احسب مربّعات أعداد ذهنيًا.',
      stage: 'trigger', teachesLearningPointIds: ['4am_mutatabiqat-shahira_P1', '4am_mutatabiqat-shahira_P2', '4am_mutatabiqat-shahira_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'nashat-jidaa', path: `${LESSON_BASE_PATH}/nashat-jidaa`,
      title: 'جداء مجموع حدين وفرقهما', desc: 'ملعب يطول ويضيق بالقدر نفسه: أي منطقتين تتعادمان؟ ثم جداءات تُحسب دون وضع العملية.',
      stage: 'discovery', teachesLearningPointIds: ['4am_mutatabiqat-shahira_P3', '4am_mutatabiqat-shahira_P4'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المتطابقات الشهيرة', desc: 'تعريف المتطابقة، والمتطابقات الثلاث بأمثلة.',
      stage: 'discovery', teachesLearningPointIds: ['4am_mutatabiqat-shahira_P1', '4am_mutatabiqat-shahira_P2', '4am_mutatabiqat-shahira_P3'],
      color: 'violet', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'أتعلّم' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'الطريقة سطرًا سطرًا، ثم تمارين في النشر والحساب الذهني، وتمارين للتعمّق.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_mutatabiqat-shahira_P1', '4am_mutatabiqat-shahira_P2', '4am_mutatabiqat-shahira_P3', '4am_mutatabiqat-shahira_P4'],
      color: 'amber', style: 'featured', estimatedMin: 15, difficulty: 3, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ملعب الحيّ', desc: 'مسألة الدرس: شريطان يُقتطعان من ملعب مربّع. مساحة أرضية اللعب، كلام العامل، وثمن العشب والمدرّجات.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mutatabiqat-shahira_P2', '4am_mutatabiqat-shahira_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — المسبح البلدي', desc: 'ممرّ عرضه x حول حوض مربّع: مساحته بدلالة x، وهل يكفي البلاط الموجود؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mutatabiqat-shahira_P1', '4am_mutatabiqat-shahira_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — مسابقة الحساب الذهني', desc: 'أربعة أعداد تُحسب دون وضع العملية، جواب خاطئ، ونقاط الفريق.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_mutatabiqat-shahira_P1', '4am_mutatabiqat-shahira_P2', '4am_mutatabiqat-shahira_P3', '4am_mutatabiqat-shahira_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
