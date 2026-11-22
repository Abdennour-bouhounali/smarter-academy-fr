/**
 * الدرس — المتباينات والعمليات (3AM, unité 5 « المساويات – المتباينات – المعادلات ») — généré DANS son entrée du catalogue (item 3am.m5.r05,
 * côté INÉGALITÉS), cycle moyen phase 3, Phase 0 « priorité du propriétaire » (2026-10-26) : le درس 4AM « متراجحة من الدرجة الأولى »
 * (`mutarajiha-ula`, 4am.m3.r04) s'appuie sur ses trois premières الكفاءات (conserver le sens, l'inverser sous un facteur négatif). Manuel 3AM
 * (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 2 pp. 72–73, معارف 2 p. 74, طرائق p. 75 (توظيف خواص المتباينات والعمليات),
 * أوظّف تعلّماتي 6–19 et 23–27 pp. 78–79, أؤكّد 3–4 p. 81, أستعدّ 7–8 p. 71. Plan : docs/sources/3am/unit5/plan/mutabayinat-amaliyat.md.
 * Source : docs/sources/3am/unit5/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : ses liens « راجع » — 2am.m4.r09 (اختبار صحة متباينة, `ikhtibar-musawat-mutabayina`, 2AM, non publiée) et 3am.m1.r01 (جداء عددين
 * نسبيين, `jidaa-adadayn-nisbiyayn`, publiée) — sont mesurés par « أستعدّ » avec l'ordre des relatifs (2AM `muqarana-nisbiya`, publiée, sans lien du
 * réseau) et la leçon sœur `musawiyat-amaliyat` (publiée, MÊME item 3am.m5.r05 : `pointPrerequisites` P1 ← P1, P2 ← P2, P3 ← P2, aucune arête de réseau
 * n'est franchie). La comparaison par le signe de la différence (`muqaranat-natiqayn`, publiée) est RAPPELÉE dans une « تذكّر », jamais reconstruite.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : les « خيوط النول » (labo `loom-threads`, thème `loom`). Un métier à tisser de غرداية : deux poutres graduées, un fil de laine ROUGE
 *   attaché à a et un BLEU à b (a < b) sur la poutre haute ; chaque nombre de la poutre haute est relié par un fil de chaîne à son IMAGE sur la basse.
 *   La MAIN tient UN nœud de la poutre basse : le PEIGNE (+ c) le pose à l'image du fil de 0, le CLOU (× c, le fil de 0 cloué en 0) à l'image du fil de 1 ;
 *   sa position EST c et toute la ligne suit. La mission demande de mettre le rouge à DROITE du bleu : aucun peigne, aucun clou positif n'y arrive (les fils
 *   restent parallèles ou convergent), et l'élève trouve le seul geste qui y réussit — un facteur NÉGATIF croise les fils. Le clou à 0 écrase tout (0 = 0).
 *   Tâches (مبتدئ : 1 < 3 « rouge à droite », atteindre 6 et 3 depuis −2 < −1, faire se rejoindre ; متقدم : deux étapes jusqu'à 5 et 0, transporter la
 *   bande x < 3 à −6 avec la bande à droite, atteindre −1 et −3/2 par × (−1/2)).
 *   Rejetées : (a) le نشاط 2b du manuel comme entrée (un tableau ac / bc pour quatre triplets : chaque ligne se répond par le calcul, le renversement est un fait
 *   lu et non une nécessité — il devient l'application E3 de أتمرّن) ; (b) un mur à deux coureurs avec « < » (le `equality-lanes` de la leçon sœur repeint :
 *   même mur, même « qui reçoit c ») ; (c) une barre qui bascule autour d'un pivot (c'est le `origin-line` du 4AM : une droite que la pente tourne).
 *   Ordre des idées : décaler ne change jamais l'ordre (P1) → étirer par un positif non plus (P2) → étirer par un négatif l'échange toujours, × 0 écrase (P3) →
 *   معارف : pourquoi (le signe d'une différence rappelé), nommer P1–P3, ≤ ≥ et la division → طريقة : déduire jusqu'à « x seul », comparer deux expressions,
 *   encadrer ax + b (P4) → أتمرّن (le نشاط 2 et les exercices 6–27 réécrits) → trois مسائل → إختبار أولي. Le mot « متراجحة », « حلّ », l'ensemble des
 *   solutions et la droite graduée sont au 4AM (`mutarajiha-ula`) ; la comparaison par le signe de a − b est à `muqaranat-natiqayn`.
 *   الكفاءات : P1 et P2/P3 reprennent la formulation du catalogue en ajoutant « c ناطق » et la DIVISION (P2 : par un positif, P3 : par un négatif, où les
 *   élèves de 4AM échouent le plus) ; P4 rend « لمقارنة عبارات أو لحصرها » opérationnel (استنتاج، حصر، مقارنة) et nomme ≤ et ≥.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 * 2026-10-29 : `ikhtibar-musawat-mutabayina` (2AM, 2am.m4.r09) est publiée — arête LP P1 ← 2am_ikhtibar-musawat-mutabayina_P3 (lien du réseau
 * 2am.m4.r09 → 3am.m5.r05) ; « تذكّر — السنة الثانية » ajouté (RECALL.year2), premier encadré du module معارف, lié à la leçon.
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/mutabayinat-amaliyat';

export const LESSON_CONFIG = {
  id: 'mutabayinat-amaliyat',
  kind: 'lesson',
  unit: 'musawiyat-mutabayinat',
  unitTitle: 'المساويات – المتباينات – المعادلات',
  sequentialUnlock: true,
  title: 'المتباينات والعمليات',
  description: 'على نول في غرداية خيطان أحمر وأزرق مربوطان في عارضة عليا: نكتشف أنّ الإزاحة والتمديد بعدد موجب لا يغيّران ترتيبهما وأنّ التمديد بعدد سالب يعكسه، ثم نستنتج متباينة من أخرى ونقارن عبارتين ونحصر عبارة.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧶',
  estimatedDurationMin: 85,
  textbookRef: { unit: 5, activity: 2, pages: '71, 72, 73, 74, 75, 78, 79, 81' },
  skills: [
    'معرفة أنّه إذا كان $a<b$ فإنّ $a+c<b+c$ و $a-c<b-c$ ($c$ عدد ناطق): لا يتغيّر اتجاه متباينة عندما نضيف إلى طرفيها (أو نطرح منهما) العدد نفسه',
    'معرفة أنّه إذا كان $a<b$ و $c>0$ فإنّ $ac<bc$ و $\\frac{a}{c}<\\frac{b}{c}$ : ضرب طرفي متباينة في (أو قسمتهما على) العدد الموجب تمامًا نفسه لا يغيّر اتجاهها',
    'معرفة أنّه إذا كان $a<b$ و $c<0$ فإنّ $ac>bc$ و $\\frac{a}{c}>\\frac{b}{c}$ : ضرب طرفي متباينة في (أو قسمتهما على) العدد السالب تمامًا نفسه يغيّر اتجاهها',
    'توظيف خواص المتباينات (وكذلك $\\leq$ و $\\geq$) لاستنتاج متباينة من أخرى، ولحصر عبارة من الشكل $ax+b$ علمًا بحصر $x$ ، ولمقارنة عبارتين',
  ],
  teachingScope: {
    include: ['إذا كان $a<b$ فإنّ $a\\pm c<b\\pm c$ ، و $ac<bc$ و $\\frac{a}{c}<\\frac{b}{c}$ مع $c>0$ ، و $ac>bc$ و $\\frac{a}{c}>\\frac{b}{c}$ مع $c<0$ ، وكذلك مع $\\leq$ و $\\geq$', 'استنتاج متباينة من أخرى حتى تصير طرفها الأول $x$ ، وحصر عبارة $ax+b$ ، ومقارنة عبارتين بالخواص', 'أعداد ناطقة سالبة وكسرية'],
    exclude: ['كلمة «متراجحة» وحلّ متراجحة ومجموعة الحلول وتمثيلها على مستقيم مدرّج (درس السنة الرابعة)', 'تعليم مقارنة عددين بإشارة فرقهما (درس «مقارنة عددين ناطقين»)', 'ضرب متباينتين مع بعضهما', 'حصر عدد عشري بالتدوير (درس لاحق)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'المسابقة الثقافية',
    statement: 'في المسابقة الثقافية للمتوسطة يبدأ كل متسابق بـ 50 نقطة، ويخسر 3 نقاط عن كل إجابة خاطئة. نرمز بـ $e$ إلى عدد الإجابات الخاطئة، فتكون النتيجة $S=50-3e$ .',
    questions: [
      { label: '1)', text: 'أخطأ أمين أكثر من 8 مرّات، أي $e>8$ . اكتب المتباينة التي يحقّقها $-3e$ .' },
      { label: '2)', text: 'استنتج متباينة لنتيجة أمين $S$ .' },
      { label: '3)', text: 'أخطأت سلمى 5 مرّات على الأكثر، أي $0\\leq e\\leq 5$ . احصر نتيجتها $S$ .' },
      { label: '4)', text: 'مَن نتيجته أكبر، أمين أم سلمى؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'نقاط البداية', lines: [{ label: 'نقطة', value: '50' }] }, { title: 'كل خطأ', lines: [{ label: 'نقاط', value: '−3' }] }, { title: 'أخطاء أمين', lines: [{ label: 'أكثر من', value: '8' }] }], ariaLabel: 'ثلاث بطاقات: نقاط البداية 50، وكل خطأ يخسر 3 نقاط، وأمين أخطأ أكثر من 8 مرّات' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : 2am.m4.r09 et 3am.m1.r01 (réseau), l'ordre des relatifs (2AM, hors réseau) et la leçon sœur publiée.
  priorKnowledge: ['ikhtibar-musawat', 'jidaa-nisbi', 'muqarana-nisbiya-2am', 'musawiyat-amaliyat-3am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `loom-threads` (la main tient un nœud), thème `loom`.
    {
      kind: 'manipulation', code: 'loom-threads-simple', type: 'loom-threads', module: 1,
      level: 'beginner',
      title: 'خيوط النول: 1 < 3',
      objective: 'الإزاحة بالعدد نفسه والتمديد بعدد موجب لا يغيّران ترتيب الخيطين، والتمديد بعدد سالب يبدّل موضعيهما، والتمديد بالعدد 0 يجمعهما في نقطة واحدة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'loom' },
      learningPointIds: ['3am_mutabayinat-amaliyat_P1', '3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P3'],
      sourceElementIds: ['act-2b'],
    },
    {
      kind: 'manipulation', code: 'loom-threads-advanced', type: 'loom-threads', module: 1,
      level: 'advanced',
      title: 'خيوط النول: عمليتان وحزمة',
      objective: 'الإزاحة بالعدد نفسه والتمديد بعدد موجب لا يغيّران ترتيب الخيطين، والتمديد بعدد سالب يبدّل موضعيهما، والتمديد بالعدد 0 يجمعهما في نقطة واحدة',
      autonomy: 'عارضة ثالثة لعمليتين متتاليتين، وحزمة خيوط كاملة تُنقل إلى العارضة السفلى، وأعداد في أنصاف الأعداد الصحيحة: يختار التلميذ الأداة والعدد دون تعليمة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'loom' },
      learningPointIds: ['3am_mutabayinat-amaliyat_P1', '3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P3'],
      sourceElementIds: ['know-2b'],
    },
    // Module 2 — le même labo posé SEUL (`levels={false}`), une mission : × (−2) fait passer −3 < 2 à 6 > −4.
    {
      kind: 'manipulation', code: 'loom-threads-alone', type: 'loom-threads', module: 2,
      title: 'خيوط النول: من −3 < 2 إلى 6 > −4',
      learningPointIds: ['3am_mutabayinat-amaliyat_P3'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — المسابقة الثقافية', learningPointIds: ['3am_mutabayinat-amaliyat_P3', '3am_mutabayinat-amaliyat_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مصعد العمارة', learningPointIds: ['3am_mutabayinat-amaliyat_P1', '3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — سياج حديقة المدرسة', learningPointIds: ['3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P4'], sourceElementIds: ['ex-27'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ اختبار متباينة بقيمة، وجداء أعداد نسبية، وترتيب عددين، وعملية على طرفي مساواة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — خيوط النول', desc: 'خيطان أحمر وأزرق على نول: ماذا يحدث لترتيبهما حين نزيح الخيوط كلّها، وحين نمدّدها بعدد موجب، وبعدد سالب، وبالعدد صفر؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_mutabayinat-amaliyat_P1', '3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 15, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — لماذا ينقلب الاتجاه؟', desc: 'نبرّر بإشارة الفرق، ثم نسمّي الخواص الثلاث بأعداد نختارها، ونضيف ≤ و ≥ والقسمة.',
      stage: 'discovery', teachesLearningPointIds: ['3am_mutabayinat-amaliyat_P1', '3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P3'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أستنتج وأقارن وأحصر', desc: 'نستنتج متباينة خطوة خطوة حتى يصير طرفها الأول x، ونقارن عبارتين، ونحصر عبارة من الشكل ax + b.',
      stage: 'formalization', teachesLearningPointIds: ['3am_mutabayinat-amaliyat_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ثمانية تمارين: أكمل بالمتباينة، وأكمل إن أمكن، واستنتج، وطرفها الأول x، وحصر، وحصر معكوس.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_mutabayinat-amaliyat_P1', '3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P3', '3am_mutabayinat-amaliyat_P4'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — المسابقة الثقافية', desc: 'مسألة الدرس: S = 50 − 3e ، أيّ متباينة تنتج عن e > 8 وعن 0 ≤ e ≤ 5؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_mutabayinat-amaliyat_P3', '3am_mutabayinat-amaliyat_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مصعد العمارة', desc: 'حمولة المصعد 630 kg على الأكثر: كم صندوقًا يمكن للعامل أن يحمل؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_mutabayinat-amaliyat_P1', '3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — سياج حديقة المدرسة', desc: 'طول مجهول بين 12 و 15: نحصر المحيط والمساحة ونحكم على لفّة سياج.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_mutabayinat-amaliyat_P2', '3am_mutabayinat-amaliyat_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
