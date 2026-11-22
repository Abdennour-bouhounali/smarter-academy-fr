/**
 * الدرس — حصر عدد عشري موجب (3AM, unité 5 « المساويات – المتباينات – المعادلات ») — généré DANS son entrée du catalogue (item 3am.m5.x1, « حصر عدد
 * موجب مكتوب في الشكل العشري باستعمال التدوير إلى رتبة معيّنة »), cycle moyen phase 3, Phase 0 « priorité du propriétaire » (2026-10-26). Manuel 3AM
 * (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 3 p. 73, معارف 3 p. 76, طرائق p. 77 (+ دوري الآن 1), أوظّف تعلّماتي 20, 21, 22, 25, 28, 62
 * pp. 79 et 83, أؤكّد تعلّماتي 5 p. 81, أستعدّ 13–15 p. 71. Plan : docs/sources/3am/unit5/plan/hasr-adad-ushri.md. Source : docs/sources/3am/unit5/extraction.json.
 * Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : son seul lien « راجع » est `1am.m3.r05` (تدوير عدد عشري إلى الوحدة, `hasr-qiyam-muqarraba`, 1AM, non publiée) ; « أستعدّ » le mesure avec la
 * division décimale lue sur la calculatrice (2AM `kasr-hasil-qisma`, hors réseau) et la leçon sœur publiée `mutabayinat-amaliyat` (la propriété × positif, utilisée
 * dans les exercices 28 et 62 et les مسائل). Aucune arête de réseau ne sort de cet item ; 4AM l'emploie (`jidhr-tarbii`, la trigonométrie, la statistique).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « ميزان العطّار » (labo `scoop-scale`, thème `attar`). Dans un دكّان, la main VERSE et PINCE du cumin sur une balance dont le grand écran
 *   ARRONDIT la masse (1 décimale) pendant qu'une bande de précision écrit la masse exacte : « le moins de cumin que l'écran lit 1,3 kg », « le plus » — l'élève
 *   trouve où l'écran bascule (1,25 inclus, 1,35 exclu). Un second écran arrondit au kilo (1,50 et 2,49 pour « 2 ») ; au niveau متقدم un sachet modèle de 2/7 kg
 *   et une lampe : on peut toujours en trouver un plus léger ou plus lourd, jamais « égal » — un quotient se loge entre deux repères sans les atteindre.
 *   Rejetées : (a) le نشاط 3 1) du manuel comme entrée (un périmètre P qui se lit 10,7 : trois valeurs et une zone dessinée de mémoire de la règle, répondue par
 *   tâtonnement — il devient l'application E1 de أتمرّن) ; (b) une règle graduée zoomée rang par rang (c'est `ruler-compare` : la main tient la graduation) ;
 *   (c) une sonde sur une droite qui laisse des traces (c'est `solution-ray`, 4AM) ; la main tient ici la QUANTITÉ, la balance REFUSE.
 *   Ordre des idées : une lecture arrondie est un INTERVALLE [r − ½u ; r + ½u[ (P3) → sa largeur dépend du rang (P3) → un quotient est logé entre deux repères sans
 *   les atteindre (P2, P4) → معارف : « تذكّر — السنة الأولى », la chaîne de repères d'UN nombre, le rang suivant, le chemin inverse → طريقة : trois méthodes →
 *   أتمرّن → trois مسائل → إختبار أولي.
 *   الكفاءات : P1 précise « وتسمية طرفي الحصر قيمتين مقرّبتين » (1AM `1am.m3.r04`/`r05`, 2AM `2am.m1.r06` le couvrent déjà : la leçon les RAPPELLE, ne les rebâtit pas) ;
 *   P2 ajoute « وحصره بهما » ; P3 ajoute l'INVERSE (« حصر عدد عُلم مدوّره ») — les mots mêmes du programme (« باستعمال التدوير »), du manuel (know-3, act-3, now-77-1) et
 *   de la valeur ajoutée du réseau, que le brouillon oubliait ; P4 ajoute « وتعيين مدوّره ».
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/hasr-adad-ushri';

export const LESSON_CONFIG = {
  id: 'hasr-adad-ushri',
  kind: 'lesson',
  unit: 'musawiyat-mutabayinat',
  unitTitle: 'المساويات – المتباينات – المعادلات',
  sequentialUnlock: true,
  title: 'حصر عدد عشري موجب',
  description: 'في دكّان عطّار تدوِّر الميزان الكتلة على شاشته: نكتشف كلّ الكتل التي تُقرأ بالعدد نفسه، ثم نحصر عددًا عشريًا موجبًا بين قيمتيه المقرّبتين، ونعيّن مدوّره، ونحصر حاصل قسمة نقرؤه على الآلة الحاسبة.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 82,
  textbookRef: { unit: 5, activity: 3, pages: '71, 73, 76, 77, 79, 81, 83' },
  skills: [
    'حصر عدد عشري موجب بين عددين طبيعيين متتاليين، وتسمية طرفي الحصر قيمتين مقرّبتين إلى الوحدة بالنقصان وبالزيادة',
    'إعطاء القيمتين المقرّبتين بالنقصان وبالزيادة إلى $\\frac{1}{10}$ أو $\\frac{1}{100}$ أو $\\frac{1}{1000}$ لعدد عشري موجب، وحصره بهما (مثل $4{,}6 \\le 4{,}679 < 4{,}7$)',
    'تعيين مدوّر عدد عشري موجب إلى رتبة معيّنة (أقرب القيمتين المقرّبتين)، وحصر عدد عُلم مدوّره: مدوّره إلى $0{,}1$ هو $10{,}7$ يعني $10{,}65 \\le x < 10{,}75$',
    'حصر حاصل قسمة إلى رتبة معيّنة بقراءة شاشة الآلة الحاسبة، وتعيين مدوّره',
  ],
  teachingScope: {
    include: ['حصر عدد عشري موجب بين عددين طبيعيين متتاليين وبين قيمتيه المقرّبتين بالنقصان وبالزيادة إلى $\\frac{1}{10}$ و $\\frac{1}{100}$ و $\\frac{1}{1000}$', 'تدوير عدد عشري إلى رتبة (نصف إلى الأعلى)، وحصر عدد عُلم مدوّره: $r-\\frac{1}{2}\\times10^{-k}\\le x<r+\\frac{1}{2}\\times10^{-k}$', 'حصر حاصل قسمة مقروء على شاشة الآلة الحاسبة وتعيين مدوّره', 'توظيف الحصر مع خاصية الضرب في عدد موجب لحصر عبارة'],
    exclude: ['الأعداد السالبة (البند يقول «موجب»)', 'ترتيب الأعداد العشرية كمهارة (السنة الأولى)', 'الكتابة العلمية والحصر بين قوتين متتاليتين للعدد 10 (درس «الكتابة العلمية ورتبة القدر»)', 'خواص المتباينات نفسها (درس «المتباينات والعمليات»)', 'الجذر التربيعي (السنة الرابعة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'كيس السميد',
    statement: 'على أكياس مطحنة مكتوب 25 kg . ميزان المطحنة يكتب الكتلة مدوّرة إلى $0{,}1$ kg ، وقرأ على أحد الأكياس $24{,}9$ kg .',
    questions: [
      { label: '1)', text: 'احصر الكتلة الحقيقية $m$ لهذا الكيس.' },
      { label: '2)', text: 'هل يمكن أن تكون $m=24{,}96$ kg ؟' },
      { label: '3)', text: 'هل الكيس أخفّ من 25 kg بالتأكيد؟' },
      { label: '4)', text: 'احصر كتلة 40 كيسًا من هذا النوع.' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'ما كُتب على الكيس', lines: [{ label: 'كتلته kg', value: '25' }] }, { title: 'ما قرأه الميزان', lines: [{ label: 'مدوَّرة إلى 0,1 kg', value: '24,9' }] }, { title: 'عدد الأكياس', lines: [{ label: 'كيسًا', value: '40' }] }], ariaLabel: 'ثلاث بطاقات: الكيس مكتوب عليه 25 كيلوغرامًا، والميزان يدوِّر إلى جزء من عشرة وقرأ 24,9، وعدد الأكياس 40' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : 1am.m3.r05 (réseau), la division décimale lue sur la calculatrice (2AM, hors réseau) et la leçon sœur publiée.
  priorKnowledge: ['tadwir-wahda', 'qiyam-muqarraba', 'qisma-ashriya-2am', 'mutabayinat-amaliyat-3am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `scoop-scale` (la main tient la masse), thème `attar`.
    {
      kind: 'manipulation', code: 'scoop-scale-simple', type: 'scoop-scale', module: 1,
      level: 'beginner',
      title: 'ميزان العطّار: 1,3 kg',
      objective: 'الكتل التي تقرأ عليها الشاشة المدوِّرة عددًا معيّنًا تملأ مجالًا يبدأ من نصف رتبة تحت العدد ويبلغ دون نصف رتبة فوقه، والقيمة التي لا تنتهي أرقامها يُحصَر بين علامتين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'attar' },
      learningPointIds: ['3am_hasr-adad-ushri_P2', '3am_hasr-adad-ushri_P3'],
      sourceElementIds: ['act-3'],
    },
    {
      kind: 'manipulation', code: 'scoop-scale-advanced', type: 'scoop-scale', module: 1,
      level: 'advanced',
      title: 'ميزان العطّار: 5,68 kg وكيس الفلفل',
      objective: 'الكتل التي تقرأ عليها الشاشة المدوِّرة عددًا معيّنًا تملأ مجالًا يبدأ من نصف رتبة تحت العدد ويبلغ دون نصف رتبة فوقه، والقيمة التي لا تنتهي أرقامها يُحصَر بين علامتين',
      autonomy: 'شاشة تدوِّر إلى جزء من مئة وشريط دقّة إلى جزء من ألف، ثم كيس فلفل يقارن به مصباح نموذجًا وزنه 2/7 kg: يجد التلميذ العلامتين المتتاليتين دون تعليمة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'attar' },
      learningPointIds: ['3am_hasr-adad-ushri_P2', '3am_hasr-adad-ushri_P3', '3am_hasr-adad-ushri_P4'],
      sourceElementIds: ['know-3'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — كيس السميد', learningPointIds: ['3am_hasr-adad-ushri_P3', '3am_hasr-adad-ushri_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — رحلة العائلة', learningPointIds: ['3am_hasr-adad-ushri_P2', '3am_hasr-adad-ushri_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — سباق 100 م', learningPointIds: ['3am_hasr-adad-ushri_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ تدوير إلى الوحدة، وحصر بين عددين طبيعيين، وقراءة شاشة الآلة الحاسبة، وضرب متباينة في عدد موجب.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — ميزان العطّار', desc: 'ميزان رقمي يدوِّر الكتلة على شاشته: ما هي كلّ الكتل التي تقرأ عليها الشاشة 1,3 kg؟ وهل يبلغ ميزانٌ ما حاصل القسمة 2/7؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_hasr-adad-ushri_P2', '3am_hasr-adad-ushri_P3', '3am_hasr-adad-ushri_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الحصر والتدوير', desc: 'نحصر عددًا بين علامتين من كل رتبة، ونعيّن مدوّره، ونحصر عددًا علمنا مدوّره.',
      stage: 'discovery', teachesLearningPointIds: ['3am_hasr-adad-ushri_P1', '3am_hasr-adad-ushri_P2', '3am_hasr-adad-ushri_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحصر وأدوّر', desc: 'ثلاث طرائق: حصر عدد إلى رتبة، وحصر عدد من مدوّره، وحصر حاصل قسمة مقروء على الآلة الحاسبة.',
      stage: 'formalization', teachesLearningPointIds: ['3am_hasr-adad-ushri_P2', '3am_hasr-adad-ushri_P3', '3am_hasr-adad-ushri_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'سبعة تمارين: كتلة مدوّرة، وحاصل قسمة على الآلة، وعدد علمنا مدوّره، و π، وحجم علبة، ومقارنة بالحصر.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_hasr-adad-ushri_P1', '3am_hasr-adad-ushri_P2', '3am_hasr-adad-ushri_P3', '3am_hasr-adad-ushri_P4'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — كيس السميد', desc: 'مسألة الدرس: ميزان مطحنة يدوِّر إلى 0,1 kg وقرأ 24,9 kg على كيس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_hasr-adad-ushri_P3', '3am_hasr-adad-ushri_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — رحلة العائلة', desc: 'استهلاك سيارة على مسافة 437 km: نحصر حاصل قسمة ونعيّن مدوّره.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_hasr-adad-ushri_P2', '3am_hasr-adad-ushri_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — سباق 100 م', desc: 'ميقاتي يدوِّر الزمن إلى 0,01 s: من هو الأسرع؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_hasr-adad-ushri_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
