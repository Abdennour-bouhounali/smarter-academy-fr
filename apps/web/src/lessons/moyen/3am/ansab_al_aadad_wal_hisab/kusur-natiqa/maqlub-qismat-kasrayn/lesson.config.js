/**
 * الدرس — مقلوب عدد وقسمة كسرين (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة ») — générée DANS son entrée du catalogue (items 3am.m1.r03 et 3am.m1.r04),
 * cycle moyen phase 3, « priorité propriétaire » (2026-10-25) : elle SEMENCE l'unité (`_unit/`, extraction de toute l'unité). Manuel 3AM (الجيل الثاني, منشورات
 * الشهاب), RÉFÉRENCE des الكفاءات : نشاط 1 p. 24, معارف 1 et 2 p. 26, تمارين 1, 2, 4–7 p. 30, أؤكّد 1, 7, 11 p. 33, أتعمّق 59 et 71 p. 34–35, أستعدّ p. 23.
 * Source : docs/sources/3am/unit2/extraction.json (plan : docs/sources/3am/unit2/plan/maqlub-qismat-kasrayn.md). Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `3am.m1.r02 → r03` (requires, qismat-nisbiyayn : a ÷ b = q ⇔ b × q = a, leçon du même cahier NON publiée) et `2am.m1.r07 → r03` (jida-kasrayn, 2AM,
 * NON publiée) : « أستعدّ » mesure les DEUX avec des affirmations de la plateforme, معارف ouvre sur un « تذكّر — السنة الثانية » sans lien ; `pointPrerequisites` :
 * arêtes internes seulement (aucune arête vers une leçon non publiée).
 * 2026-10-29 : `jida-kasrayn` (2AM) publiée — P1 ← `2am_jida-kasrayn_P1` (le long de `2am.m1.r07 → r03`), et le « تذكّر — السنة الثانية »
 * de معارف porte désormais son lien (`getLessonPath`).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « دوّاسة الدرّاجة » (labo `gear-crank`, thème `bikestand`). La MAIN tourne la manivelle d'une درّاجة de club : le nombre de tours de pédale est la
 *   variable (un cran = une dent du plateau = 1/F de tour), les tours de la roue en sont la CONSÉQUENCE (dents / R). Avec un plateau de 24 dents et un pignon de 32,
 *   un tour de pédale ne fait faire que 3/4 de tour à la roue : pour 6 tours de roue il faut 8 tours de pédale — 6 ÷ 3/4 = 8 est PLUS GRAND que 6, la surprise que
 *   « diviser rapetisse » ne prévoit pas. Un tour de roue demande 4/3 tour de pédale : le rapport inverse, le مقلوب (3/4 × 4/3 = 1). Puis 6 tours de roue = 6 × un tour
 *   de roue = 6 × 4/3 : diviser par 3/4 est multiplier par son مقلوب. En متقدم la cible est une fraction (9/2 tours) : prédire AVANT de partir, la course réfute
 *   « multiplier par le rapport » (27/8) et « retourner le premier » (1/6).
 *   Rejetées : (a) le نشاط 1 du manuel (une bande à partager en deux) — il ne montre que le PARTAGE par un naturel, où « diviser rapetisse » reste vrai, donc la règle
 *   ÷ c/d n'est jamais NÉCESSAIRE : il devient une APPLICATION en أتمرّن ; (b) les bouteilles de 3/4 L dans 6 L — bon sens (combien de fois) mais c'est l'expérience
 *   de `egg-trays` (des unités dans des plateaux) : il devient la مسألة 1 ; (c) un curseur qui affiche le résultat (l'écran répond sans que la main ni la tête
 *   décident).
 *   Ordre des idées : tours de pédale pour une cible de tours de roue (÷ un naturel, puis ÷ 3/4 : la surprise) → UN tour de roue demande 4/3 : le مقلوب, 3/4 × 4/3 = 1
 *   (P1) → 6 = 6 × 1 donc 6 ÷ 3/4 = 6 × 4/3 (P2) → une cible fractionnaire : a/b ÷ c/d = a/b × d/c (P3) → معارف nomme le مقلوب (naturel, décimal, fraction ; 0 n'en a
 *   pas ; la notation ⁻¹) → طريقة : simplifier avant de multiplier, fractions composées → أتمرّن → trois مسائل → إختبار أولي. Ni la somme ni la comparaison de fractions
 *   (leçons suivantes de l'unité), ni le مقلوب d'un nombre NÉGATIF (`amaliyat-natiqa`).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/maqlub-qismat-kasrayn';

export const LESSON_CONFIG = {
  id: 'maqlub-qismat-kasrayn',
  kind: 'lesson',
  unit: 'kusur-natiqa',
  unitTitle: 'العمليات على الكسور والأعداد الناطقة',
  sequentialUnlock: true,
  title: 'مقلوب عدد وقسمة كسرين',
  description: 'دوّاسة درّاجة تُدير العجلة: كم دورة للدوّاسة تلزم لعدد من دورات العجلة؟ فنكتشف مقلوب عدد، ونقسم كسرًا على كسر بضربه في مقلوب الكسر الثاني، ونختزل قبل الضرب.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🚲',
  estimatedDurationMin: 87,
  textbookRef: { unit: 2, activity: 1, pages: '23, 24, 26, 30, 33, 34, 35' },
  skills: [
    'تعيين مقلوب عدد غير معدوم (طبيعي أو عشري أو كسر موجب): مقلوب $a$ هو $\\frac{1}{a}$ ومقلوب $\\frac{a}{b}$ هو $\\frac{b}{a}$ ، وجداء عدد ومقلوبه يساوي $1$ ؛ والعدد $0$ ليس له مقلوب',
    'التعبير عن القسمة على عدد غير معدوم بالضرب في مقلوبه: $a \\div b = a \\times \\frac{1}{b}$',
    'قسمة كسرين: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$ ، مع الاختزال قبل الضرب وكتابة الناتج على أبسط شكل',
  ],
  teachingScope: {
    include: ['مقلوب عدد طبيعي أو عشري أو كسر موجب، و $x \\times \\frac{1}{x} = 1$ ، و $0$ ليس له مقلوب', 'القسمة على عدد هي الضرب في مقلوبه', 'قسمة كسرين وقسمة عدد على كسر وكسر على عدد، والاختزال قبل الضرب، والكسر المركّب بحدود موجبة'],
    exclude: ['مقلوب عدد سالب وكلّ قسمة بإشارات (درس العمليات على الأعداد الناطقة)', 'جمع كسرين وطرحهما ومقارنتهما (دروس لاحقة من الوحدة)', 'حلّ المعادلات (وحدة لاحقة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'زيت الزيتون',
    statement: 'عصرت عائلة سليم $\\frac{45}{4}$ لترًا من زيت الزيتون وتريد تعبئته في قوارير سعة كلّ منها $\\frac{3}{4}$ لتر.',
    questions: [
      { label: '1)', text: 'كم قارورة تملأ؟' },
      { label: '2)', text: 'لو استعملت قوارير صغيرة سعة كلّ منها $\\frac{5}{8}$ لتر، فكم قارورة تملأ؟' },
      { label: '3)', text: 'أهدت العائلة الجيران $3$ قوارير من الصغيرة: كم لترًا أهدت؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'الزيت', lines: [{ label: 'لتر', value: '45/4' }] }, { title: 'قارورة', lines: [{ label: 'لتر', value: '3/4' }] }, { title: 'قارورة صغيرة', lines: [{ label: 'لتر', value: '5/8' }] }], ariaLabel: 'ثلاث بطاقات: الزيت 45 على 4 لترًا، قارورة 3 على 4 لتر، قارورة صغيرة 5 على 8 لتر' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les liens « راجع » du réseau (2am.m1.r07 et 3am.m1.r02).
  priorKnowledge: ['jida-kasrayn-2am', 'qisma-darb-3am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `gear-crank` (la main tourne la manivelle), thème `bikestand`.
    {
      kind: 'manipulation', code: 'gear-crank-simple', type: 'gear-crank', module: 1,
      level: 'beginner',
      title: 'دوّاسة الدرّاجة: 6 دورات للعجلة',
      objective: 'دورة واحدة للدوّاسة تُدير العجلة $\\frac{F}{R}$ دورة، فعدد دورات الدوّاسة لدورة واحدة للعجلة هو المقلوب $\\frac{R}{F}$ ؛ وللعجلة $n$ دورة نضرب $n$ في هذا المقلوب، أي نقسم على $\\frac{F}{R}$',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'bikestand' },
      learningPointIds: ['3am_maqlub-qismat-kasrayn_P1', '3am_maqlub-qismat-kasrayn_P2'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'gear-crank-fractions', type: 'gear-crank', module: 1,
      level: 'advanced',
      title: 'دوّاسة الدرّاجة: هدف كسري وتوقّع',
      objective: 'دورة واحدة للدوّاسة تُدير العجلة $\\frac{F}{R}$ دورة، فعدد دورات الدوّاسة لدورة واحدة للعجلة هو المقلوب $\\frac{R}{F}$ ؛ وللعجلة $n$ دورة نضرب $n$ في هذا المقلوب، أي نقسم على $\\frac{F}{R}$',
      autonomy: 'الهدف كسر من الدورات، وعدد دورات الدوّاسة يُكتب كتابةً قبل الانطلاق ثم تحسمه الدرّاجة، ثم تنقل السلسلة فيتبادل الصحن والترس مكانيهما',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'bikestand' },
      learningPointIds: ['3am_maqlub-qismat-kasrayn_P2', '3am_maqlub-qismat-kasrayn_P3'],
      sourceElementIds: ['know-2'],
    },
    // Module 2 — le MÊME type, monde `reverse`, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'gear-crank-reverse', type: 'gear-crank', module: 2,
      title: 'السلسلة المنقولة',
      learningPointIds: ['3am_maqlub-qismat-kasrayn_P1'],
      sourceElementIds: ['know-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — زيت الزيتون', learningPointIds: ['3am_maqlub-qismat-kasrayn_P2', '3am_maqlub-qismat-kasrayn_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — أحواض الحديقة', learningPointIds: ['3am_maqlub-qismat-kasrayn_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حملة التشجير', learningPointIds: ['3am_maqlub-qismat-kasrayn_P3'], sourceElementIds: ['deep-71'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ ضرب كسرين وربط القسمة بالضرب.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — دوّاسة الدرّاجة', desc: 'كم دورة للدوّاسة تلزم لدورات معلومة للعجلة؟ ولماذا تلزم دورات أكثر من دورات العجلة؟ وما مقلوب عدد؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_maqlub-qismat-kasrayn_P1', '3am_maqlub-qismat-kasrayn_P2', '3am_maqlub-qismat-kasrayn_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المقلوب والقسمة', desc: 'نسمّي ما فعلناه: مقلوب عدد طبيعي أو عشري أو كسر، والعدد الذي ليس له مقلوب، والقسمة ضربٌ في المقلوب.',
      stage: 'discovery', teachesLearningPointIds: ['3am_maqlub-qismat-kasrayn_P1', '3am_maqlub-qismat-kasrayn_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — الاختزال قبل الضرب', desc: 'قسمة كسرين بالاختزال قبل الضرب، والكسر المركّب، وعبارتان خاطئتان يجب تجنّبهما.',
      stage: 'formalization', teachesLearningPointIds: ['3am_maqlub-qismat-kasrayn_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'جدارية تتقاسمها أفواج، مقلوبات، جداءات ذهنية، اختزال قبل الضرب، كتابة كسر مبسّط، ومستطيل خشبي.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_maqlub-qismat-kasrayn_P1', '3am_maqlub-qismat-kasrayn_P2', '3am_maqlub-qismat-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — زيت الزيتون', desc: 'مسألة الدرس: قوارير سعتها كسر، ثم قوارير أصغر، ثم هدية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_maqlub-qismat-kasrayn_P2', '3am_maqlub-qismat-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — أحواض الحديقة', desc: 'طول مستطيل من مساحته وعرضه، ثم عدد الأحواض.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_maqlub-qismat-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حملة التشجير', desc: 'الكلّ من جزء من جزء: كسر المشاركين وعدد تلاميذ القسم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_maqlub-qismat-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
