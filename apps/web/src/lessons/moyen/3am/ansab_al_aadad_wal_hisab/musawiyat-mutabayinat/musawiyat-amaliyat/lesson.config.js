/**
 * الدرس — المساويات والعمليات (3AM, unité 5 « المساويات – المتباينات – المعادلات ») — générée DANS son entrée du catalogue (item 3am.m5.r05,
 * côté ÉGALITÉS), cycle moyen phase 3, Phase A de la file (2026-10-21, entrée #5) : les درس 4AM « معادلة من الدرجة الأولى » et « متراجحة من
 * الدرجة الأولى » s'appuient sur elle. Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 1 p. 72, معارف 1 p. 74,
 * طرائق p. 75 (توظيف خواص المساويات والعمليات), exercices 1–5 p. 78, أؤكّد 1–2 p. 81, أستعدّ 1, 3, 4, 9 p. 71. Source :
 * docs/sources/3am/unit5/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : ses liens « راجع » — 2am.m4.r09 (اختبار صحة مساواة, leçon 2AM `ikhtibar-musawat-mutabayina`) et 3am.m1.r01 (جداء عددين نسبيين,
 * `jidaa-adadayn-nisbiyayn`) — mènent à des leçons NON publiées : « أستعدّ » les mesure, la leçon ne les reconstruit pas, et
 * `pointPrerequisites` ne porte que des arêtes internes.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le « مضمار المساواة » (labo `equality-lanes`, thème `stadium`). Une égalité dont x est un nombre CACHÉ ; deux coureurs, سلمى et
 *   أمين, se tiennent chacun à la VALEUR de leur membre sur un mur gradué : vraie ⇔ même graduation. La MAIN tient c, le nombre d'une opération
 *   (+ − × ÷, de −9 à 9), et choisit QUI la reçoit. C'est là que « la même opération des deux côtés » devient nécessaire sous la main : donnée à un
 *   seul coureur, elle les sépare du poids de c ; aux deux, ils restent côte à côte et la nouvelle égalité s'écrit d'elle-même. Les tâches
 *   (مبتدئ : 10 = 4x − 2 ⟹ 8 = 4x − 4, 12 = 4x, 30 = 12x − 6, 5 = 2x − 1 ; متقدم : 5 = −3x + 1 avec c NÉGATIFS et deux opérations jusqu'à x seul)
 *   sont des égalités à ATTEINDRE : il faut choisir l'opération ET le nombre. « ÷ 0 » est refusé ; « × 0 » garde l'égalité vraie mais la vide (0 = 0).
 *   Rejetées : (a) le نشاط 1 du manuel comme entrée (« أحمد ومريم ont le même argent, le père ajoute 200 DA » puis « calcule (a + c) − (b + c) »,
 *   on répond de tête : une preuve, pas une manipulation) — il devient une APPLICATION en أتمرّن ; (b) la balance de Roberval (c'est le labo
 *   `equation-balance` du 4AM « معادلات ومتراجحات » : on ne le re-peint pas, et la main y tient le CONTENU d'un plateau, pas le nombre d'une opération) ;
 *   (c) une calculatrice qui affiche « vrai / faux » : l'écran répond sans que la main décide.
 *   Ordre des idées : même opération aux deux ⟹ même graduation, un seul ⟹ écart (P1) → × ÷ et leurs refus, c négatif accepté (P2) → معارف : nommer
 *   les deux propriétés avec ses nombres (P1, P2) → طريقة : transformer une égalité connue, juger qu'une égalité en découle ou non (P3) → أتمرّن (le
 *   نشاط 1, les exercices 1–5 réécrits) → trois مسائل → إختبار أولي. Le « résoudre » (x isolé, ax + b = cx + d) et les inégalités ne sont PAS ici :
 *   `muadalat-darajat-ula` et `mutabayinat-amaliyat`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 * 2026-10-29 : `ikhtibar-musawat-mutabayina` (2AM, 2am.m4.r09) est publiée — arêtes LP P1 ← 2am_ikhtibar-musawat-mutabayina_P1 et P3 ← _P1 (lien du
 * réseau 2am.m4.r09 → 3am.m5.r05) ; « تذكّر — السنة الثانية » ajouté (RECALL.year2) en tête du module معارف, lié à la leçon.
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/musawiyat-amaliyat';

export const LESSON_CONFIG = {
  id: 'musawiyat-amaliyat',
  kind: 'lesson',
  unit: 'musawiyat-mutabayinat',
  unitTitle: 'المساويات – المتباينات – المعادلات',
  sequentialUnlock: true,
  title: 'المساويات والعمليات',
  description: 'سلمى وأمين يقفان على مضمار مدرّج، كلٌّ عند قيمة أحد طرفي مساواة: نكتشف أنّ العملية نفسها على الطرفين تُبقي المساواة صحيحة، وأنّها إن مسّت طرفًا واحدًا كسرتها، ثم نحوّل مساواة معطاة إلى أخرى ونحكم على مساواة بالخواص.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏃',
  estimatedDurationMin: 83,
  textbookRef: { unit: 5, activity: 1, pages: '71, 72, 74, 75, 78, 81' },
  skills: [
    'معرفة أنّه إذا كان $a = b$ فإنّ $a + c = b + c$ و $a - c = b - c$ : لا تتغيّر مساواة عندما نضيف إلى طرفيها معًا (أو نطرح منهما) العدد نفسه',
    'معرفة أنّه إذا كان $a = b$ فإنّ $a \\times c = b \\times c$ و $\\frac{a}{c} = \\frac{b}{c}$ مع $c \\neq 0$ ($c$ موجب أو سالب)',
    'توظيف خواص المساويات والعمليات للتحقق من صحة مساواة أو لتحويل مساواة معطاة إلى مساواة أخرى',
  ],
  teachingScope: {
    include: ['إذا كان $a = b$ فإنّ $a \\pm c = b \\pm c$ ، $ac = bc$ ، $\\frac{a}{c} = \\frac{b}{c}$ ($c \\neq 0$) ، وأنّ العملية تُجرى على الطرفين معًا', 'تحويل مساواة معطاة بمجهول إلى مساواة أخرى، والحكم على مساواة بالخواص', 'أعداد ناطقة سالبة وكسرية'],
    exclude: ['حل معادلة من الشكل $ax + b = cx + d$ وترييض مشكلة (درس «المعادلات من الدرجة الأولى بمجهول واحد»)', 'المتباينات والعمليات (درس لاحق)', 'حصر عدد عشري (درس لاحق)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'هديّة لأمّ سلمى',
    statement: 'تدّخر سلمى لتشتري هديّة لأمّها برًّا بها. ثمن الهدية $x$ دينارًا، وتعلم سلمى أنّ ثلاثة أمثال هذا الثمن ناقصًا 40 دج يساوي 200 دج، أي $3x - 40 = 200$ .',
    questions: [
      { label: '1)', text: 'اكتب المساواة التي نحصل عليها بإضافة 40 إلى طرفي المساواة $3x - 40 = 200$ .' },
      { label: '2)', text: 'استنتج من المساواة السابقة قيمة $6x$ دون أن تبحث عن $x$ .' },
      { label: '3)', text: 'قال أمين: «بقسمة الطرفين على 3 نجد $x - 40 = \\frac{200}{3}$ ». هل هو على صواب؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'ثمن الهدية', lines: [{ label: 'ثلاثة أمثاله', value: '3x' }] }, { title: 'ما تنقصه', lines: [{ label: 'دينارًا', value: '40' }] }, { title: 'الناتج', lines: [{ label: 'دج', value: '200' }] }], ariaLabel: 'ثلاث بطاقات: ثلاثة أمثال الثمن 3x، ناقص 40 دج، يساوي 200 دج' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les deux liens « راجع » du réseau (2am.m4.r09 et 3am.m1.r01).
  priorKnowledge: ['ikhtibar-musawat', 'jidaa-nisbi'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `equality-lanes` (la main tient c), thème `stadium`.
    {
      kind: 'manipulation', code: 'equality-lanes-simple', type: 'equality-lanes', module: 1,
      level: 'beginner',
      title: 'مضمار المساواة: 10 = 4x − 2',
      objective: 'العملية نفسها بالعدد نفسه على طرفي مساواة تُبقي المساواة صحيحة (نتيجتان متساويتان)، وإن أُجريت على طرف واحد انكسرت المساواة؛ والقسمة على 0 مستحيلة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'stadium' },
      learningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P2'],
      sourceElementIds: ['method-1a'],
    },
    {
      kind: 'manipulation', code: 'equality-lanes-negative', type: 'equality-lanes', module: 1,
      level: 'advanced',
      title: 'مضمار المساواة: 5 = −3x + 1',
      objective: 'العملية نفسها بالعدد نفسه على طرفي مساواة تُبقي المساواة صحيحة (نتيجتان متساويتان)، وإن أُجريت على طرف واحد انكسرت المساواة؛ والقسمة على 0 مستحيلة',
      autonomy: 'أعداد c سالبة وعمليتان متتاليتان للوصول إلى المساواة المطلوبة: يختار التلميذ العملية والعدد والمتلقّي دون تعليمة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'stadium' },
      learningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P2', '3am_musawiyat-amaliyat_P3'],
      sourceElementIds: ['method-1b'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — هديّة لأمّ سلمى', learningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — الأمانة في الميزان', learningPointIds: ['3am_musawiyat-amaliyat_P2', '3am_musawiyat-amaliyat_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — عدد غامض', learningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P2', '3am_musawiyat-amaliyat_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ اختبار حلّ مساواة وجداء أعداد نسبية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مضمار المساواة', desc: 'متسابقان عند قيمتي طرفي مساواة: ماذا يحدث لهما حين تتلقّى كلتاهما العملية نفسها؟ وحين تتلقّاها واحدة فقط؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المساويات والعمليات', desc: 'نسمّي ما فعلناه: الجمع والطرح، ثم الضرب والقسمة، بأعداد نختارها.',
      stage: 'discovery', teachesLearningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P2'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحوّل مساواة وأحكم عليها', desc: 'من مساواة معطاة: أيّ المساويات صحيحة وأيّها لا؟ دون البحث عن x.',
      stage: 'formalization', teachesLearningPointIds: ['3am_musawiyat-amaliyat_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'مبلغان متساويان، أكمل المساواة، عدد مجهول، صحيح أم خاطئ، اضرب في عدد سالب، وأكمل بعد معلومة.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P2', '3am_musawiyat-amaliyat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — هديّة لأمّ سلمى', desc: 'مسألة الدرس: 3x − 40 = 200 ، أيّ المساويات تنتج عنها؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — الأمانة في الميزان', desc: 'خمسة أكياس وكيس سكر: ماذا نستنتج من مساواة الكتل؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_musawiyat-amaliyat_P2', '3am_musawiyat-amaliyat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — عدد غامض', desc: 'نحوّل 4 − 3x = 7 خطوة خطوة، ونتحقق من نتيجة كل خطوة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_musawiyat-amaliyat_P1', '3am_musawiyat-amaliyat_P2', '3am_musawiyat-amaliyat_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
