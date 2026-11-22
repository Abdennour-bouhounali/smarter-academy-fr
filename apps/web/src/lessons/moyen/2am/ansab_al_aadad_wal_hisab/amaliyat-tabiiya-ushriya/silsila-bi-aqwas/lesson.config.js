/**
 * الدرس — سلسلة عمليات تتضمّن أقواسا (2AM, unité 1 « العمليات على الأعداد الطبيعية والأعداد العشرية ») — générée DANS son entrée du catalogue (items 2am.m1.r01 + 2am.m1.r02), cycle
 * moyen phase 3 (2026-10-29), deuxième leçon de l'unité (la première, `silsila-bidun-aqwas`, a semé `_unit/`, l'extraction et `chainOps.js`). Manuel 2AM (الجيل الثاني, منشورات الشهاب),
 * RÉFÉRENCE des الكفاءات : أستعدّ p. 7 (items 8 et 10), نشاط 3 et 4 pp. 8–9, معارف 2 p. 10, طريقة 1 et 2 p. 11, تمارين 8, 10, 13–17, ict p. 21.
 * Source : docs/sources/2am/unit1/extraction.json (plan : docs/sources/2am/unit1/plan/silsila-bi-aqwas.md). Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `1am.m1.r05 → 2am.m1.r01` (requires, `mana-jam-tarh`, 1AM PUBLIÉE) : « أستعدّ » le mesure ; la leçon précédente de l'unité (`silsila-bidun-aqwas`) est un rappel AVEC lien (« تذكّر »).
 * `pointPrerequisites` : P2 ← P1, P3 ← P1, P4 ← P1 + P3, et P1 ← `2am_silsila-bidun-aqwas_P2` (la priorité des × ÷ sur + −, la même ligne de l'unité, item de programme partagé r01).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « حاسبة التعاونية » (labo `coop-calculator`, thème `coopshop`). Au comptoir de la coopérative de l'école, Hiba doit faire calculer à la grande calculatrice scientifique ce que
 *   raconte l'histoire : le livre à 45 DA et sa couverture à 15 DA, partagés par 4 amis. Elle tape 45 + 15 ÷ 4 et la machine imprime 48,75 DA — plus que le livre entier ! La machine n'a pas tort : elle
 *   obéit aux priorités de la leçon précédente et divise 15 tout seul. La MAIN pose les parenthèses de la ligne tapée (variable du labo) ; l'ARBITRE est la machine et l'histoire, jamais un corrigé.
 *   Les parenthèses ordonnent le calcul à la machine ET au lecteur ; certaines ne changent rien (9 + (2 × 5)) ; plusieurs besoins à la fois donnent des parenthèses dans des parenthèses (de l'intérieur,
 *   l'extérieure écrite [ ]) ; la barre de fraction est un jeu de parenthèses silencieuses, et la calculatrice ne la comprend pas. La calculatrice est P4 elle-même, la barre est P3.
 *   Rejetées : (a) le نشاط 3 du manuel (vérifier six résultats donnés, avec et sans parenthèses) : l'élève n'a rien en jeu — devient une APPLICATION (أتمرّن 1) ; (b) placer des parenthèses pour atteindre
 *   une cible (ex-10) : un bon casse-tête mais une cible sans raison — gardé en أتمرّن (3) ; la tâche k4 du labo en retient l'idée avec une histoire.
 *   Ordre des idées : un résultat que l'histoire réfute (k1, k2) → les parenthèses d'abord → une paire inutile (k3) → des parenthèses dans des parenthèses (k4) → la barre (a1) → une moyenne (a2) →
 *   معارف nomme P1–P3 → طريقة : imbriquées, barre, touches → أتمرّن, trois مسائل, le test.
 *   Hors périmètre : nommer une chaîne par sa dernière opération (`wasf-silsila-hisab`), la distributivité et l'écriture 3(4 + 5) (`tawzi-darb-jam-tarh`), retirer des parenthèses après − (3AM), les
 *   sommes algébriques avec signes (2AM unité 3) ; les ordres de grandeur ne servent que de contrôle (banque).
 *   Changements d'الكفاءات (ordre gardé) : P1 « وتمييز الأقواس الضرورية من غير الضرورية » ajouté et l'exemple du manuel remplacé par 6 × (15 − 9) ; P2 « وكتابة الأقواس الخارجية على شكل معقوفين » ;
 *   P3 « والانتقال بين الكتابتين » ajouté et l'exemple remplacé par (36+12)/(20−8) ; P4 « بالأقواس اللازمة » et « تفسير نتيجة خاطئة لحساب حُجز دونها » ajoutés.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/silsila-bi-aqwas';

export const LESSON_CONFIG = {
  id: 'silsila-bi-aqwas',
  kind: 'lesson',
  unit: 'amaliyat-tabiiya-ushriya',
  unitTitle: 'العمليات على الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'سلسلة عمليات تتضمّن أقواسا',
  description: 'عند منضدة تعاونية المدرسة يضع التلميذ الأقواس في حساب على آلة حاسبة علمية فيرى الآلة والوضعية تحكمان: فنكتشف أنّ الأقواس تفرض أوّل ما يُحسب، وأنّ بعضها لا يغيّر شيئًا، وأنّ الأقواس المتداخلة تُحسب من الداخل، وأنّ خطّ الكسر قوسان للبسط والمقام.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧮',
  estimatedDurationMin: 90,
  textbookRef: { unit: 1, activity: 2, pages: '7, 8, 9, 10, 11, 14, 15, 21' },
  skills: [
    'إنجاز سلسلة عمليات تتضمّن أقواسا بإجراء العمليات داخل الأقواس أوّلًا، وتمييز الأقواس الضرورية من غير الضرورية، مثل $E = 6 \\times (15 - 9)$',
    'إنجاز سلسلة بمستويات مختلفة من الأقواس بدءًا من الأقواس الداخلية، وكتابة الأقواس الخارجية على شكل معقوفين [ ]',
    'اعتبار البسط والمقام في كتابة كسرية عبارتين بين قوسين، والانتقال بين الكتابتين: $\\frac{36+12}{20-8} = (36+12) \\div (20-8)$',
    'كتابة حساب على الآلة الحاسبة بالأقواس اللازمة دون خطأ، وتفسير نتيجة خاطئة لحساب حُجز دونها',
  ],
  teachingScope: {
    include: ['الأقواس تفرض أوّل ما يُحسب، وقوسان لا يغيّران ترتيب الحساب غير ضروريين', 'أقواس داخل أقواس: نبدأ بالداخلية ونكتب الخارجية معقوفين [ ]', 'خطّ الكسر ↔ قسمة عبارتين بين قوسين، في الاتجاهين', 'كتابة الأزرار على الآلة الحاسبة العلمية بالأقواس اللازمة وتفسير عرض خاطئ', 'ترجمة وضعية تحتاج أقواسًا'],
    exclude: ['تسمية سلسلة بآخر عملية فيها (درس وصف سلسلة حسابات)', 'خاصية توزيع الضرب على الجمع والطرح وكتابة $3(4+5)$ (درس توزيع الضرب على الجمع والطرح)', 'حذف الأقواس بعد إشارة الطرح والمجاميع الجبرية بإشارات (الأعداد النسبية)', 'كلّ نتيجة وسيطة سالبة'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'رفوف المكتبة',
    statement: 'في مكتبة القسم $18$ قاموسًا و $129$ قصّة. توضع الكتب كلّها في رفوف، في كلّ رفّ $7$ كتب.',
    questions: [
      { label: '1)', text: 'اكتب سلسلة تعطي عدد الرفوف اللازمة.' },
      { label: '2)', text: 'احسب عدد الرفوف.' },
      { label: '3)', text: 'حسب زميلك السلسلة $18 + 129 \\div 7$ : ما الخطأ؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'القواميس', lines: [{ label: 'العدد', value: '18' }] }, { title: 'القصص', lines: [{ label: 'العدد', value: '129' }] }, { title: 'الرفّ الواحد', lines: [{ label: 'كتب', value: '7' }] }], ariaLabel: 'ثلاث بطاقات: 18 قاموسًا، و 129 قصّة، وفي الرفّ الواحد 7 كتب' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (1am.m1.r05), la leçon précédente de l'unité et les bases 1AM mesurées sans lien.
  priorKnowledge: ['silsila-bidun-aqwas-2am', 'mana-jam-tarh-1am', 'darb-ashari-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `coop-calculator` (la main pose les parenthèses), thème `coopshop`.
    {
      kind: 'manipulation', code: 'coop-calculator-simple', type: 'coop-calculator', module: 1,
      level: 'beginner',
      title: 'حاسبة التعاونية: ضع الأقواس',
      objective: 'أستعمل الأقواس لأفرض ترتيب الحساب على الآلة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'coopshop' },
      learningPointIds: ['2am_silsila-bi-aqwas_P1', '2am_silsila-bi-aqwas_P2'],
      sourceElementIds: ['act-3', 'act-4'],
    },
    {
      kind: 'manipulation', code: 'coop-calculator-build', type: 'coop-calculator', module: 1,
      level: 'advanced',
      title: 'حاسبة التعاونية: اكتب الحساب كلّه',
      objective: 'أستعمل الأقواس لأفرض ترتيب الحساب على الآلة',
      autonomy: 'تُروى الوضعية أو يُعطى كسر على بطاقة، فيكتب التلميذ الحساب كلّه بأزرار الآلة بما يلزم من أقواس',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'coopshop' },
      learningPointIds: ['2am_silsila-bi-aqwas_P3', '2am_silsila-bi-aqwas_P4'],
      sourceElementIds: ['know-2', 'method-2'],
    },
    // Module 2 — le MÊME type, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'coop-calculator-alone', type: 'coop-calculator', module: 2,
      title: 'أين نضع القوسين؟',
      learningPointIds: ['2am_silsila-bi-aqwas_P1', '2am_silsila-bi-aqwas_P2'],
      sourceElementIds: ['know-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — رفوف المكتبة', learningPointIds: ['2am_silsila-bi-aqwas_P1'], sourceElementIds: ['act-3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — معدّل الفصل', learningPointIds: ['2am_silsila-bi-aqwas_P1', '2am_silsila-bi-aqwas_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — الآلة الحاسبة', learningPointIds: ['2am_silsila-bi-aqwas_P3', '2am_silsila-bi-aqwas_P4'], sourceElementIds: ['ict'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ أولوية العمليات، القسمة والكسر، وجمع الأعداد العشرية وضربها في وضعية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 7, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — حاسبة التعاونية', desc: 'ضع الأقواس في حساب على آلة حاسبة علمية حتى تطبع ما تقوله الوضعية: ماذا تفعل الأقواس؟ هل تلزم دائمًا؟ ماذا لو جاءت أقواس داخل أقواس؟ وكيف نكتب كسرًا على الآلة؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_silsila-bi-aqwas_P1', '2am_silsila-bi-aqwas_P2', '2am_silsila-bi-aqwas_P3', '2am_silsila-bi-aqwas_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 15, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الأقواس وخطّ الكسر', desc: 'نسمّي ما فعلناه: قاعدة الأقواس، والأقواس غير الضرورية، والمتداخلة والمعقوفان، وخطّ الكسر قوسان للبسط والمقام.',
      stage: 'discovery', teachesLearningPointIds: ['2am_silsila-bi-aqwas_P1', '2am_silsila-bi-aqwas_P2', '2am_silsila-bi-aqwas_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — من الداخل إلى الخارج', desc: 'نحسب أقواسًا متداخلة من الداخل، ونكتب كسرًا دون خطّ الكسر، ونحجز حسابه على الآلة بأقواسه.',
      stage: 'formalization', teachesLearningPointIds: ['2am_silsila-bi-aqwas_P2', '2am_silsila-bi-aqwas_P3', '2am_silsila-bi-aqwas_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'قارن بأقواس وبدونها، احسب، ضع القوسين، احسب أقواسًا متداخلة، اكتب الكسر بالاتجاهين، فسّر عرض الآلة، واربط المسائل بعباراتها.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_silsila-bi-aqwas_P1', '2am_silsila-bi-aqwas_P2', '2am_silsila-bi-aqwas_P3', '2am_silsila-bi-aqwas_P4'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — رفوف المكتبة', desc: 'مسألة الدرس: قواميس وقصص في رفوف، وسلسلة تحتاج قوسين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_silsila-bi-aqwas_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — معدّل الفصل', desc: 'معدّلا سارة وأمين بمعامل الاختبار، ومن يتجاوز عتبة 10.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_silsila-bi-aqwas_P1', '2am_silsila-bi-aqwas_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — الآلة الحاسبة', desc: 'أزرار كسر على الآلة، وتفسير عرض خاطئ حجزه زميل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_silsila-bi-aqwas_P3', '2am_silsila-bi-aqwas_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
