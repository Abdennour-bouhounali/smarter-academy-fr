/**
 * الدرس — خاصية فيثاغورس (3AM, unité 11 « خاصية فيثاغورس، جيب تمام زاوية »). Le PREMIER درس généré de l'unité, généré DANS son
 * entrée du catalogue (items 3am.m4.r03 et 3am.m4.x1), cycle moyen phase 3, file A entrée 2, 2026-10-20 — prérequis direct de
 * QUATRE unités de 4AM (racine carrée `jidhr-tarbii`, trigonométrie `alaqat-muthallathiya`, repère `muntasaf-masafa` /
 * `ithbat-khawas-maalam`, espace `maqati-mustawiya`). Manuel 3AM (الجيل الثاني) : أستعدّ p. 167, أنشطة 1–2 p. 168, معارف 1 p. 170,
 * طرائق p. 171 (calcul d'un côté ; la moitié FEJ de « المثلث قائم أم لا »), ex 1–9, 11–17 pp. 174–175, أؤكّد 1–4 p. 177, أتعمّق 31 p. 178.
 * Source : docs/sources/3am/unit11/extraction.json (frontière avec la réciproque `aksiya-fitaghuras` dans build-extraction.py) ;
 * brief : docs/sources/3am/unit11/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre
 * (§4ter-bis) : tout est réécrit, autres contextes, autres nombres.
 *   Entrée retenue : la machine d'un معرض العلوم (labo `pythagoras-tanks`, thème `sciencefair`) — trois bassins carrés minces de même
 *   épaisseur (l'eau se mesure en AIRE) sur les côtés d'un triangle articulé en A. La main tient l'ANGLE en A (مبتدئ, 3 et 4) ; « اسكب »
 *   verse l'eau des deux petits bassins (9 + 16 = 25 cm²) dans le grand (BC²) : il déborde à tout angle aigu, il reste un vide à tout
 *   angle obtus, il n'est plein juste qu'à 90°. C'est là que BC² = AB² + AC² devient NÉCESSAIRE sous la main : on ne peut pas remplir le
 *   grand bassin sans faire l'angle droit, et la contraposée (« ≠ ⇒ non rectangle ») est vue dans le même geste. متقدم : la main tient la
 *   LONGUEUR BC sur un ruban au dixième (5 et 12) — il faut PRÉVOIR 13 ; puis 2 et 3 : aucun dixième ne remplit (3,6 déborde, 3,7 laisse
 *   un vide) et la touche √ de la calculatrice donne √13 exact (la touche seulement : la racine carrée est construite en 4AM par
 *   `jidhr-tarbii`, jamais ici).
 *   Rejetées : (a) le نشاط 1 du manuel comme entrée (le découpage de Perigal : on « constate » que cinq pièces recouvrent le grand carré
 *   pour UN triangle rectangle donné — aucune variable sous la main, aucun contraste avec un triangle non rectangle, et la contraposée
 *   n'y apparaît pas) — il devient une APPLICATION en أتمرّن (des aires de carrés sur les côtés) ; (b) mesurer à la règle les côtés de
 *   triangles imprimés et calculer des carrés (une vérification numérique sans geste, des mesures approchées qui noient l'égalité) ;
 *   (c) un quadrillage où l'on compte les carreaux des trois carrés (le grand carré penché ne se compte pas, et l'angle n'y varie pas).
 *   Ordre des idées : le plein juste n'arrive qu'à l'angle droit (P1) → tout autre angle déborde ou laisse un vide : BC² ≠ AB² + AC²
 *   ⇒ non rectangle (P4) → prévoir 13 avec 5 et 12 (P2, l'hypoténuse) → معارف (le وتر en face de l'angle droit, l'égalité pour un
 *   triangle nommé, deux triangles dans une figure, la نتيجة) → طريقة : un côté de l'angle droit par différence, la touche √ (√20, P3),
 *   prouver « غير قائم » par le plus long côté (P4) → أتمرّن (le نشاط 1 en application, les exercices réécrits) → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure les deux liens « راجع » du réseau : 1am.m2.r08 (aire d'un carré, d'un rectangle — `mustatil-murabba-masaha`) et
 *   3am.m3.r06 (puissance d'un relatif : les carrés — `quwat-adad-nisbi`), avec le vocabulaire du triangle rectangle.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/handasa/khassiyat-fitaghuras';

export const LESSON_CONFIG = {
  id: 'khassiyat-fitaghuras',
  kind: 'lesson',
  unit: 'fitaghuras-jayb-tamam',
  unitTitle: 'خاصية فيثاغورس، جيب تمام زاوية',
  sequentialUnlock: true,
  title: 'خاصية فيثاغورس',
  description: 'في آلة من ثلاثة أحواض مربعة على أضلاع مثلث نسكب ماء الحوضين الصغيرين في الكبير: لا يمتلئ تمامًا إلا حين تكون الزاوية قائمة. ثم نحسب الوتر أو ضلعًا قائمًا، ونستعمل اللمسة √ للقيمة المضبوطة أو المقرّبة، ونُثبت أنّ مثلثًا غير قائم.',
  level: 'moyen',
  grade: '3am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الأنشطة الهندسية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 86,
  textbookRef: { unit: 11, activity: 1, pages: '167, 168, 170, 171, 174, 175, 177, 178' },
  skills: [
    'معرفة خاصية فيثاغورس: إذا كان $ABC$ قائما في $A$ فإن $BC^2=AB^2+AC^2$ (مربع طول الوتر، وهو الضلع المقابل للزاوية القائمة، يساوي مجموع مربعي طولي الضلعين الآخرين)',
    'حساب طول الوتر أو طول ضلع قائم في مثلث قائم بمعرفة طولي الضلعين الآخرين (بكتابة مساواة فيثاغورس المناسبة ثم التعويض)',
    'استعمال اللمسة $\\sqrt{\\ }$ للآلة الحاسبة لإعطاء القيمة المضبوطة أو قيمة مقرّبة لطول',
    'استعمال خاصية فيثاغورس لإثبات أن مثلثا غير قائم (مربع طول أطول أضلاعه لا يساوي مجموع مربعي طولي الضلعين الآخرين)',
  ],
  teachingScope: {
    include: ['الوتر: الضلع المقابل للزاوية القائمة وأطول الأضلاع', 'خاصية فيثاغورس ولا تُطبَّق إلا في مثلث قائم', 'حساب الوتر بالجمع وحساب ضلع قائم بالطرح', 'اللمسة √: القيمة المضبوطة √n وقيمة مقرّبة إلى 0,1 أو 0,01', 'إثبات أنّ مثلثا غير قائم بمقارنة مربع أطول أضلاعه بمجموع مربعي الضلعين الآخرين'],
    exclude: ['الخاصية العكسية لفيثاغورس وإثبات أنّ مثلثا قائم (الدرس «الخاصية العكسية لفيثاغورس»)', 'بناء الجذر التربيعي وحصره (السنة الرابعة متوسط)', 'جيب تمام زاوية حادة (الدرسان التاليان)'],
  },
  // « مسألة الدرس » : un chemin en diagonale dans le jardin de l'école ; le coin d'un parterre est-il droit ? (module 5).
  lessonProblem: {
    module: 5,
    title: 'ممرّ الحديقة',
    statement: 'تتعاون جمعية التلاميذ على تهيئة حديقة المدرسة، وهي مستطيل ABCD طوله AB = 12 m وعرضه BC = 9 m. قرّروا شقّ ممرّ مستقيم من الركن A إلى الركن C وتبليطه، وثمن تبليط المتر الواحد من الممرّ 850 دج. وفي ركن الحديقة حوض أزهار مثلث EFG أراده البستاني قائما في E، فقاس أضلاعه: EF = 1,2 m و EG = 1,6 m و FG = 2,1 m.',
    questions: [
      { label: '1)', text: 'احسب طول الممرّ AC.' },
      { label: '2)', text: 'ما ثمن تبليط الممرّ؟' },
      { label: '3)', text: 'هل حوض الأزهار EFG قائم في E؟ برّر.' },
    ],
    figure: {
      points: { A: [0, 0], B: [12, 0], C: [12, 9], D: [0, 9] },
      segments: [{ from: 'A', to: 'B', label: '12 m' }, { from: 'B', to: 'C', label: '9 m' }, ['C', 'D'], ['D', 'A'], { from: 'A', to: 'C', tone: 'emerald' }],
      polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'emerald' }],
      rightAngles: [['A', 'B', 'C']],
      maxWidth: 300,
      ariaLabel: 'حديقة مستطيلة ABCD طولها 12 m وعرضها 9 m، وممرّ مستقيم من الركن A إلى الركن C',
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les deux liens « راجع » du réseau (1am.m2.r08, 3am.m3.r06) et le triangle rectangle.
  priorKnowledge: ['masahat-murabba-mustatil', 'murabba-adad', 'muthallath-qaim'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `pythagoras-tanks`, thème `sciencefair` :
    //   مبتدئ — bras 3 et 4 : la main tient l'ANGLE ; plein juste à 90° seulement, puis un angle plus petit et un plus grand.
    //   متقدم — 5 et 12 : la main tient la LONGUEUR BC (ruban au dixième) ; puis 2 et 3 : la touche √ donne √13.
    {
      kind: 'manipulation', code: 'pythagoras-tanks-angle', type: 'pythagoras-tanks', module: 1,
      level: 'beginner',
      title: 'آلة الأحواض: زاوية الفتح',
      objective: 'اكتشاف أنّ ماء المربعين المنشأين على الضلعين AB و AC يملأ المربع المنشأ على BC تمامًا فقط حين تكون الزاوية في A قائمة: BC² = AB² + AC²، وأنّ عدم التساوي يعني أنّ المثلث غير قائم',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'sciencefair' },
      learningPointIds: ['3am_khassiyat-fitaghuras_P1', '3am_khassiyat-fitaghuras_P4'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'pythagoras-tanks-length', type: 'pythagoras-tanks', module: 1,
      level: 'advanced',
      title: 'آلة الأحواض: طول الضلع الثالث',
      objective: 'اكتشاف أنّ ماء المربعين المنشأين على الضلعين AB و AC يملأ المربع المنشأ على BC تمامًا فقط حين تكون الزاوية في A قائمة: BC² = AB² + AC²، وأنّ عدم التساوي يعني أنّ المثلث غير قائم',
      autonomy: 'يتنبّأ التلميذ بطول BC الذي يملأ الحوض قبل أن يسكب (لا تظهر الزاوية)، ثم يكتشف أنّ أيّ علامة على الشريط لا تكفي مع 2 و 3 فيستعمل اللمسة √',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'sciencefair' },
      learningPointIds: ['3am_khassiyat-fitaghuras_P1', '3am_khassiyat-fitaghuras_P2', '3am_khassiyat-fitaghuras_P3'],
      sourceElementIds: ['ex-6'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ممرّ الحديقة', learningPointIds: ['3am_khassiyat-fitaghuras_P2', '3am_khassiyat-fitaghuras_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — رافعة السيارة', learningPointIds: ['3am_khassiyat-fitaghuras_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — شاشة الهاتف', learningPointIds: ['3am_khassiyat-fitaghuras_P2', '3am_khassiyat-fitaghuras_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: صحيح أم خاطئ؟ مساحة المربع والمستطيل، مربع عدد، المثلث القائم.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — آلة الأحواض المربعة', desc: 'ثلاثة أحواض مربعة على أضلاع مثلث: متى يملأ ماء الحوضين الصغيرين الحوض الكبير تمامًا؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_khassiyat-fitaghuras_P1', '3am_khassiyat-fitaghuras_P2', '3am_khassiyat-fitaghuras_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — خاصية فيثاغورس', desc: 'الوتر، المساواة في مثلث مسمّى، مثلثان في شكل واحد، ومثلث غير قائم.',
      stage: 'discovery', teachesLearningPointIds: ['3am_khassiyat-fitaghuras_P1', '3am_khassiyat-fitaghuras_P4'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحسب طول ضلع وأُثبت أنّ مثلثا غير قائم', desc: 'سلّم على حائط، الوتر والضلع القائم، اللمسة √، وأطول الأضلاع.',
      stage: 'formalization', teachesLearningPointIds: ['3am_khassiyat-fitaghuras_P2', '3am_khassiyat-fitaghuras_P3', '3am_khassiyat-fitaghuras_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'مربعات على الأضلاع، المساواة، الضلع الثالث، تصويب برهان، قطر وارتفاع، الآلة الحاسبة، مثلث يبدو قائما.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_khassiyat-fitaghuras_P1', '3am_khassiyat-fitaghuras_P2', '3am_khassiyat-fitaghuras_P3', '3am_khassiyat-fitaghuras_P4'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ممرّ الحديقة', desc: 'مسألة الدرس: طول الممرّ القطري، ثمن تبليطه، وهل حوض الأزهار قائم؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_khassiyat-fitaghuras_P2', '3am_khassiyat-fitaghuras_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — رافعة السيارة', desc: 'معيّن من أربعة أذرع: كم ترتفع السيارة؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_khassiyat-fitaghuras_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — شاشة الهاتف', desc: 'قطر الشاشة بالقيمة المضبوطة والمقرّبة، وهل الإعلان صادق؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_khassiyat-fitaghuras_P2', '3am_khassiyat-fitaghuras_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
