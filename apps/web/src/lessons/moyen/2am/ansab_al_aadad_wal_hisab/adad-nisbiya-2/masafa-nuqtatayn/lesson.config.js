/**
 * الدرس — المسافة بين نقطتين على مستقيم مدرّج (2AM, unité 3 « الأعداد النسبية ») — DANS son entrée du catalogue (item 2am.m4.r07), cycle moyen phase 3,
 * 2AM مقطع 2am.m4, paire 4 (2026-10-29). Manuel 2AM (الجيل الثاني, منشورات الشهاب, scan), RÉFÉRENCE des الكفاءات : نشاط 5 p. 41, معارف 2 (c) p. 44, تمرين 35 p. 48, أؤكّد 9 p. 49,
 * أعمّق 40–42 p. 50, تكنولوجيا 1 p. 53 (PDF = livre − 3). Le manuel n'a PAS de طريقة pour cet item : la plateforme écrit la sienne. Source : docs/sources/2am/unit3/extraction.json. Rien n'est montré tel quel (§4ter-bis).
 * Le réseau : `2am.m4.r05` (جمع وطرح عددين نسبيين, PUBLIÉE) `requires` `2am.m4.r07` : « أستعدّ » mesure la soustraction ; la comparaison (2am.m4.r02, sans arête) est mesurée aussi, la graduation (r01) et la
 * distance à zéro. `pointPrerequisites` : P2 ← P1 (interne) ; P1 ← `2am_jam-tarh-nisbiya_P3` (la distance EST une différence de relatifs). Aucune arête vers 4AM (garde `decomposition.test.js`).
 * `noRebuildForLesson` vide : aucun `extends` / `consolidates`.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le « مسماك الفرق » (labo `gap-caliper`, monde `meteoboard`). Un compas en laiton est serré sur une graine d'un grand thermomètre ; la main tourne la vis pour OUVRIR le compas jusqu'à ce que
 *   l'autre mâchoire touche la seconde graine : l'ouverture (toujours ≥ 0) est la distance. Les deux graines de part et d'autre du zéro additionnent deux morceaux, deux graines du même côté se retranchent, une ouverture
 *   ne peut pas être négative ; à متقدم l'ouverture est ÉCRITE avant de tourner la vis, le compas peut être serré sur la graine du HAUT (AB = BA), et une ouverture FIXE balancée vers le haut puis vers le bas trouve DEUX points.
 *   Rejetées : (a) le نشاط 5 du manuel comme entrée (quatre segments mesurés, puis la règle conjecturée — aucune nécessité) → application en أتمرّن ; (b) deux sondes qui lisent une différence SIGNÉE (`difference-meter`, 3AM) ;
 *   (c) une barre rigide posée entre deux points (la longueur est donnée, rien n'est prédit).
 *   Ordre des idées : deux lectures de part et d'autre du zéro → deux négatives → deux positives → une lecture au zéro → la règle (grande − petite) → positive, AB = BA → une ouverture fixe balancée (deux points) →
 *   معارف → طريقة → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/masafa-nuqtatayn';
export const LESSON_CONFIG = {
  id: 'masafa-nuqtatayn',
  kind: 'lesson',
  unit: 'adad-nisbiya-2',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'المسافة بين نقطتين على مستقيم مدرّج',
  description: 'مسماك نحاسي على مقياس حرارة كبير: بفتحه حتى يلمس الخرزة الثانية نكتشف أنّ المسافة بين نقطتين هي الفاصلة الكبرى ناقص الصغرى، وأنّها موجبة دائمًا، ونجد النقطتين اللتين تبعدان بمسافة معلومة عن نقطة.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🌡️',
  estimatedDurationMin: 75,
  textbookRef: { unit: 3, activity: 5, pages: '41, 44, 48, 49, 50, 53' },
  skills: [
    'حساب المسافة بين نقطتين على مستقيم مدرّج بطرح الفاصلة الصغرى من الفاصلة الكبرى، مثل $A(+4{,}5)$ و $B(-3)$ : $AB=(+4{,}5)-(-3)=7{,}5$',
    'معرفة أنّ المسافة بين نقطتين عدد موجب دائمًا وأنّ $AB=BA$ ، وإيجاد فاصلتي النقطتين اللتين تبعدان بمسافة معلومة عن نقطة معلومة (حلّان)',
  ],
  teachingScope: {
    include: ['المسافة بين نقطتين على مستقيم مدرّج: الفاصلة الكبرى ناقص الصغرى', 'المسافة عدد موجب دائمًا و $AB=BA$', 'النقطتان اللتان تبعدان مسافة معلومة عن نقطة', 'منتصف قطعة كتطبيق: الفاصلة الصغرى زائد نصف المسافة'],
    exclude: ['صيغة المنتصف $\\frac{a+b}{2}$ (السنة الرابعة)', 'المسافة في المستوي (السنة الرابعة)', 'الأعداد الكسرية (السنة الثالثة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — l'écart de température de trois villes.
  lessonProblem: {
    module: 5,
    title: 'فارق الحرارة في ثلاث مدن',
    statement: 'سجّل نادي الأرصاد في يوم شتوي أصغر درجة وأكبر درجة حرارة لثلاث مدن بالدرجة المئوية: الجلفة $-5$ و $+8$ ، تمنراست $+4$ و $+22$ ، قسنطينة $-1$ و $+12$ .',
    table: { caption: 'الدرجتان الصغرى والكبرى بالدرجة المئوية', head: ['', 'الجلفة', 'تمنراست', 'قسنطينة'], rows: [['الصغرى', '-5', '4', '-1'], ['الكبرى', '8', '22', '12']] },
    questions: [
      { label: '1)', text: 'احسب فارق كلّ مدينة، أي المسافة بين صغراها وكبراها.' },
      { label: '2)', text: 'أيّ المدن لها أكبر فارق؟' },
      { label: '3)', text: 'مدينة رابعة صغراها موجبة وتبعد $6$ درجات عن صغرى الجلفة: ما صغراها؟' },
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (2am.m4.r05) et trois idées voisines mesurées (comparaison, graduation, distance à zéro).
  priorKnowledge: ['tarh-bi-muakis', 'muqarana-nisbiya-2am', 'faasila-nuqta', 'masafa-ila-sifr'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `gap-caliper` (la main tient l'OUVERTURE d'un compas), monde `meteoboard` :
    //   مبتدئ — g1 −4 / +9 (13), g2 −7 / −2 (5), g3 +3 / +11 (8), g4 −6 / 0 (6) ; متقدم — a1 prédire 8,5, a2 une ouverture fixe balancée (deux points), a3 le compas sur la graine du haut (9,5).
    {
      kind: 'manipulation', code: 'gap-caliper-beginner', type: 'gap-caliper', module: 1,
      level: 'beginner',
      title: 'مسماك الفرق: فتحة المسماك',
      objective: 'المسافة بين نقطتين على مستقيم مدرّج هي الفاصلة الكبرى ناقص الفاصلة الصغرى، وهي موجبة دائمًا ولا تتغيّر إذا بدّلنا النقطتين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'meteoboard' },
      learningPointIds: ['2am_masafa-nuqtatayn_P1'],
      sourceElementIds: ['act-5', 'know-2c'],
    },
    {
      kind: 'manipulation', code: 'gap-caliper-advanced', type: 'gap-caliper', module: 1,
      level: 'advanced',
      title: 'مسماك الفرق: أتوقّع الفتحة',
      objective: 'المسافة بين نقطتين على مستقيم مدرّج هي الفاصلة الكبرى ناقص الفاصلة الصغرى، وهي موجبة دائمًا ولا تتغيّر إذا بدّلنا النقطتين',
      autonomy: 'تكتب الفتحة قبل أن تدير البرغي، وتشدّ المسماك على الخرزة العليا، وتجد النقطتين اللتين تبعدان بفتحة ثابتة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'meteoboard' },
      learningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'],
      sourceElementIds: ['act-5', 'deep-41'],
    },
    // Module 2 — le MÊME labo, posé seul (`levels={false}`) : le compas serré sur A(−4), ouvert jusqu'à B(+3).
    {
      kind: 'manipulation', code: 'gap-caliper-maarif', type: 'gap-caliper', module: 2,
      title: 'مسماك الفرق بنقطتين جديدتين',
      learningPointIds: ['2am_masafa-nuqtatayn_P1'],
      sourceElementIds: ['know-2c'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — فارق الحرارة في ثلاث مدن', learningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — محطّات الحافلة', learningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ارتفاعات البرج', learningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ طرح الأعداد النسبية، المقارنة، التدريجة والمسافة إلى الصفر.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مسماك الفرق', desc: 'نفتح مسماكًا نحاسيًا على مقياس حرارة كبير حتى يلمس الخرزة الثانية: كم تكون الفتحة إذا عبر الصفر؟ وإذا كانت الخرزتان سالبتين؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 18, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — قاعدة المسافة', desc: 'نفتح المسماك بين نقطتين جديدتين، ثم نسمّي القاعدة: الفاصلة الكبرى ناقص الصغرى، والمسافة موجبة دائمًا.',
      stage: 'discovery', teachesLearningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحسب مسافة وأجد نقطتين', desc: 'نعيّن الفاصلة الكبرى ونطرح منها الصغرى، ونجد النقطتين اللتين تبعدان مسافة معلومة عن نقطة.',
      stage: 'formalization', teachesLearningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ثلاث مسافات وتحقّق، ست مسافات بالعشريات، أزواج بمسافة معلومة، منتصف قطعة، ونقطة على بعد معلوم.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — فارق الحرارة في ثلاث مدن', desc: 'مسألة الدرس: فارق كلّ مدينة، أكبر فارق، وصغرى مدينة رابعة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — محطّات الحافلة', desc: 'مسافات بين ثلاث محطّات، وكشك في المنتصف، والمحطة الأقرب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ارتفاعات البرج', desc: 'مسافات بين المرأب والطابق الثالث والسطح، والذهاب والإياب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_masafa-nuqtatayn_P1', '2am_masafa-nuqtatayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
