/**
 * الدرس — وصف سلسلة حسابات (2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية ») — générée DANS son entrée du catalogue (items 2am.m1.r01 + 2am.m1.r02), cycle moyen phase 3
 * (2026-10-29), troisième leçon de l'unité (après `silsila-bidun-aqwas` et `silsila-bi-aqwas`, PUBLIÉES). Manuel 2AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات :
 * أستعدّ p. 7 (items 1 et 2), نشاط 5 p. 9, معارف 3 p. 12, تمارين 9, 18, 19, 20, أؤكّد 5, أتعمّق 47–49 ; pas de page « طرائق » (`textbookRef.method: null`).
 * Source : docs/sources/2am/unit1/extraction.json (plan : docs/sources/2am/unit1/plan/wasf-silsila-hisab.md). Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `1am.m1.r05 → 2am.m1.r01` (requires, `mana-jam-tarh`, 1AM PUBLIÉE) : « أستعدّ » mesure le vocabulaire مجموع / فرق / حدّا ; les deux leçons précédentes de l'unité sont des
 * rappels AVEC lien (« تذكّر », module 2). `pointPrerequisites` : P2 ← P1, P3 ← P2, P1 ← `2am_silsila-bi-aqwas_P1`, P3 ← `2am_silsila-bi-aqwas_P1` (écrire avec les parenthèses
 * nécessaires), P2 ← `1am_mana-jam-tarh_P2` (le vocabulaire de la phrase).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : (d) « مقصّ السلسلة » (labo `chain-cutter`, thème `corkboard`). Sur la سبّورة فلّين du القسم est épinglé un ruban de papier imprimé « 7 + 4 × 5 » ; Yasmine veut le dicter
 *   à une amie au téléphone sans lire chaque signe. La MAIN choisit OÙ couper le ruban en deux morceaux qui se calculent chacun seul et se recollent, par l'opération de la coupe, en la valeur du
 *   ruban. Couper à « × » donne 11 × 5 = 55, mais le ruban vaut 27 : les ciseaux mordent une AGRAFE (4 × 5 a été agrafé en premier, au calcul). Couper à « + » donne 7 + 20 = 27 : la seule
 *   coupe libre est l'opération faite en DERNIER, et c'est elle qui NOMME le ruban (une somme). On recoupe chaque morceau jusqu'aux nombres : la phrase se forme ; à l'envers, on COLLE des blocs
 *   d'après une phrase (avec les crochets que la phrase exige). L'ARBITRE est le ruban (l'agrafe), jamais un corrigé ; une coupe qui rend la même valeur PAR HASARD (c6) est refusée quand même.
 *   Rejetées : (a) le نشاط 5 du manuel (souligner la dernière opération de quatre chaînes puis coller les étiquettes) : la règle « dernière opération » est dans la consigne même — devient
 *   une APPLICATION (أتمرّن 1) ; (b) les ARBRES de calcul (`ex-9`) : la structure est déjà dessinée, l'élève ne fait que la lire — gardés en application (أتمرّن 5) ; (c) la DICTÉE au téléphone
 *   (décrire pour que l'ami réécrive la même chaîne) : un vrai besoin de description mais une vérification lente et verbale — gardée comme registre de la مسألة 2 (un message codé).
 *   Ordre des idées : une coupe libre (c1) → le nom (c1–c4 : somme, produit, différence, quotient) → les noms des morceaux (termes, facteurs, dividende, diviseur) → recouper : la phrase
 *   complète (c5) → même valeur par hasard, mauvaise coupe (c6) → coller d'après une phrase (متقدم : a1–a4) → معارف → طريقة → أتمرّن, trois مسائل (programmes), le test.
 *   Hors périmètre : la distributivité « جداء عدد ومجموع … يساوي … » (`tawzi-darb-jam-tarh`), les lettres au-delà de la lecture d'un programme (2AM `ibara-harfiya-intaj`), les sommes
 *   algébriques (2AM unité 3) ; toute valeur montrée est ≥ 0.
 *   Changements d'الكفاءات (ordre gardé) : P1 « وتعيين حدّيها أو عامليها » ajouté ; P2 l'exemple du manuel (3 × (5 + 7)) remplacé par 4 × (9 + 6) ; P3 « بالأقواس اللازمة » ajouté,
 *   « أو من برنامج حساب » ajouté (deep-47 à 49) et « ثم حسابها ».
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/wasf-silsila-hisab';

export const LESSON_CONFIG = {
  id: 'wasf-silsila-hisab',
  kind: 'lesson',
  unit: 'amaliyat-tabiiya-ushriya',
  unitTitle: 'العمليات على الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'وصف سلسلة حسابات',
  description: 'على سبّورة فلّين في القسم يقصّ التلميذ شريطًا مطبوعًا إلى قطعتين تُحسب كلّ منهما وحدها، فيكتشف أنّ آخر عملية تُنجز هي التي تسمّي السلسلة (مجموع، فرق، جداء، حاصل قسمة)، وأنّ لها حدّين أو عاملين أو مقسومًا وقاسمًا، ثم يصف السلسلة بجملة ويكتبها من جملة بالأقواس اللازمة.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '✂️',
  estimatedDurationMin: 90,
  textbookRef: { unit: 1, activity: 5, pages: '7, 9, 12, 14, 15, 17, 19' },
  skills: [
    'تعيين آخر عملية تُنجز في سلسلة عمليات وتسمية السلسلة بها (مجموع، فرق، جداء أو حاصل قسمة) وتعيين حدّيها أو عامليها',
    'وصف سلسلة عمليات بجملة، مثل «$4 \\times (9 + 6)$ جداء العدد 4 ومجموع العددين 9 و 6»',
    'كتابة سلسلة عمليات بالأقواس اللازمة انطلاقًا من وصفها اللفظي أو من برنامج حساب، ثم حسابها',
  ],
  teachingScope: {
    include: ['آخر عملية تُنجز في سلسلة هي التي تسمّيها: مجموع، فرق، جداء، حاصل قسمة', 'حدّا المجموع والفرق وعاملا الجداء والمقسوم والقاسم', 'وصف سلسلة بجملة، وكلّ قطعة ليست عددًا تُوصف بالطريقة نفسها', 'كتابة سلسلة من جملة أو من برنامج حساب بالأقواس اللازمة ثم حسابها'],
    exclude: ['خاصية توزيع الضرب على الجمع والطرح (درس توزيع الضرب على الجمع والطرح)', 'العبارات الحرفية وتبسيطها (درس لاحق)', 'المجاميع الجبرية بإشارات (الأعداد النسبية)', 'كلّ نتيجة وسيطة سالبة'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'برنامج حساب',
    statement: 'يقترح مدرّس نادي الرياضيات برنامج حساب: «اختر عددًا، أضف إليه $4$ ، ثم اضرب الناتج في $3$ .»',
    questions: [
      { label: '1)', text: 'طبّق البرنامج على $5$ ثم على $2{,}5$ .' },
      { label: '2)', text: 'اكتب سلسلة تترجم البرنامج للعدد $5$ .' },
      { label: '3)', text: 'صِف هذه السلسلة بجملة.' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'البرنامج', lines: [{ label: 'أضف', value: '4' }, { label: 'اضرب في', value: '3' }] }, { title: 'نطبّقه على', lines: [{ label: 'العدد الأول', value: '5' }, { label: 'العدد الثاني', value: '2,5' }] }], ariaLabel: 'بطاقتان: البرنامج يضيف 4 ثم يضرب في 3؛ ونطبّقه على العددين 5 و 2,5' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (1am.m1.r05), les deux leçons précédentes de l'unité et les bases 1AM (produit, division) mesurées sans lien.
  priorKnowledge: ['silsila-bidun-aqwas-2am', 'silsila-bi-aqwas-2am', 'mana-jam-tarh-1am', 'darb-ashari-1am', 'qisma-ashriya-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `chain-cutter` (la main choisit où couper / quoi coller), thème `corkboard`.
    {
      kind: 'manipulation', code: 'chain-cutter-simple', type: 'chain-cutter', module: 1,
      level: 'beginner',
      title: 'مقصّ السلسلة: قصّ الشريط وسمِّه',
      objective: 'أكتشف العملية التي تسمّي سلسلة عمليات',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'corkboard' },
      learningPointIds: ['2am_wasf-silsila-hisab_P1', '2am_wasf-silsila-hisab_P2'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'chain-cutter-build', type: 'chain-cutter', module: 1,
      level: 'advanced',
      title: 'مقصّ السلسلة: ألصق القطع من جملة',
      objective: 'أكتشف العملية التي تسمّي سلسلة عمليات',
      autonomy: 'تُعطى جملة أو شريط، فيقصّ التلميذ ويسمّي، أو يلصق قطعًا بعملية وبالمشابك اللازمة حتى تصير الجملة سلسلة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'corkboard' },
      learningPointIds: ['2am_wasf-silsila-hisab_P2', '2am_wasf-silsila-hisab_P3'],
      sourceElementIds: ['know-3', 'ex-18'],
    },
    // Module 2 — le MÊME type, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'chain-cutter-alone', type: 'chain-cutter', module: 2,
      title: 'أين يُقصّ الشريط؟',
      learningPointIds: ['2am_wasf-silsila-hisab_P1', '2am_wasf-silsila-hisab_P2'],
      sourceElementIds: ['know-3'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — برنامج حساب', learningPointIds: ['2am_wasf-silsila-hisab_P3'], sourceElementIds: ['deep-47'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — الرسالة المشفّرة', learningPointIds: ['2am_wasf-silsila-hisab_P3'], sourceElementIds: ['ex-18'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — لغز سالم', learningPointIds: ['2am_wasf-silsila-hisab_P2', '2am_wasf-silsila-hisab_P3'], sourceElementIds: ['deep-49'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ مفردات الجمع والطرح والضرب والقسمة، وأولوية العمليات والأقواس.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 7, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مقصّ السلسلة', desc: 'قصّ شريطًا مطبوعًا على سبّورة القسم إلى قطعتين تُحسب كلّ منهما وحدها: عند أيّ عملية ينجح القصّ؟ وماذا نسمّي كلّ قطعة؟ وكيف تُصاغ الجملة كاملة؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_wasf-silsila-hisab_P1', '2am_wasf-silsila-hisab_P2', '2am_wasf-silsila-hisab_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 15, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — آخر عملية تسمّي السلسلة', desc: 'نسمّي ما فعلناه: قاعدة التسمية بآخر عملية، وحدّا السلسلة وعاملاها، والجملة التي تصفها، وأهمّية الترتيب في الفرق والقسمة.',
      stage: 'discovery', teachesLearningPointIds: ['2am_wasf-silsila-hisab_P1', '2am_wasf-silsila-hisab_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أصف وأكتب', desc: 'نصف سلسلة بجملة ثم نحسبها، ونكتب سلسلة من جملة بالأقواس اللازمة ثم نحسبها.',
      stage: 'formalization', teachesLearningPointIds: ['2am_wasf-silsila-hisab_P2', '2am_wasf-silsila-hisab_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'سمِّ السلاسل واحسبها، اكتب من جملة، صِف بجملة، احسب عبارات بأعداد معطاة، اقرأ شجرة، واربط كلّ سلسلة باسمها.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_wasf-silsila-hisab_P1', '2am_wasf-silsila-hisab_P2', '2am_wasf-silsila-hisab_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — برنامج حساب', desc: 'مسألة الدرس: برنامج «اختر عددًا» يُطبَّق على عددين ثم يُترجم إلى سلسلة ويُوصف.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wasf-silsila-hisab_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — الرسالة المشفّرة', desc: 'ثلاث جمل تعطي رمز قفل، وخطأ في كتابة إحداها بلا قوسين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wasf-silsila-hisab_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — لغز سالم', desc: 'برنامج لغز يُطبَّق على عددين، تُكتب سلسلته وتُوصف، ثم يُعكس البرنامج.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wasf-silsila-hisab_P2', '2am_wasf-silsila-hisab_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
