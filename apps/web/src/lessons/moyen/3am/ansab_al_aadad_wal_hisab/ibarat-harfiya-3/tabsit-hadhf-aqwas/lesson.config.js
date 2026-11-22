/**
 * الدرس — تبسيط عبارة جبرية وحذف الأقواس (3AM, unité 4 « الحساب الحرفي ») — le PREMIER درس de l'unité, généré DANS son entrée du catalogue
 * (item 3am.m5.r01), cycle moyen phase 3, Phase A de la file (#3, 2026-10-20) : les leçons 4AM « العمليات على الجذور » et « المعادلات » en
 * ont besoin. Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : أنشطة 1–2 p. 56, معارف 1–2 p. 58, طريقة « حذف الأقواس وتبسيط
 * عبارة حرفية » p. 59, دوري الآن ① p. 59, exercices 5–7 p. 62 et 12–14 pp. 62–63, أؤكّد 1, 2, 6 p. 65, أتعمّق 36 et 43 pp. 66–67, أستعدّ
 * 5–8 p. 55, تمهيد p. 54. Source : docs/sources/3am/unit4/extraction.json ; brief des auteurs : docs/sources/3am/unit4/brief-authors.md.
 * FRONTIÈRE avec `nashr-jabri-3am` (écrite dans build-extraction.py) : ici on SIMPLIFIE (termes semblables, produit de monômes, parenthèses
 * précédées de + ou −, somme / produit) ; la distributivité k(a + b) et (a + b)(c + d) est la leçon suivante.
 * Le réseau : ses liens « راجع » — 2am.m1.r03 (distributivité) et 3am.m1.r08 (opérations sur les nombres rationnels) — mènent à des
 * leçons NON publiées (`tawzi-darb-jam-tarh`, `amaliyat-natiqa`) : « أستعدّ » les mesure (« راجع قبل أن تنطلق »), la leçon ne les reconstruit
 * pas, et `pointPrerequisites` ne porte que des arêtes internes (LEARNING_NET §4.8) — 2026-10-29 : `tawzi-darb-jam-tarh` (2AM) publiée,
 * P1 ← `2am_tawzi-darb-jam-tarh_P3` (le long de `2am.m1.r03 → 3am.m5.r01` ; 3x + 5x = (3 + 5)x est une factorisation). Les labos `PitchExpansion` / `TurfFactoring` de 4AM
 * « الحساب الحرفي » ne sont ni réutilisés ni redessinés (ils lisent une expression comme une AIRE ; ici la main porte un TERME).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre.
 *   Entrée retenue : la table du club de mathématiques (labo `like-terms`, monde `collect`, thème `workbench`). Chaque terme d'une expression
 *   est une PILE de pièces de bois à sa forme (x² une plaque carrée de côté x, x une réglette de longueur x, 1 un petit cube ; un terme négatif
 *   est la même pièce en finition « opposée ») ; la main PORTE chaque pile dans la صينية de sa forme. C'est là que regrouper les termes
 *   semblables devient NÉCESSAIRE sous la main : une pile ne se range que dans le plateau de sa forme, la table refuse sinon avec les valeurs
 *   des deux pièces à x, des pièces opposées se détruisent deux à deux, et la valeur de l'expression écrite et celle de la table restent
 *   égales à tout x (la main règle x). مبتدئ : 2x + 3 + 4x + 1 + x puis 5x + 6 − 2x − 4 (lectures visibles, la forme réduite s'écrit seule) ;
 *   متقدم : 4x² + 7 − x − 2x² + 5x − 9 puis 3x² − 4x + 6 + x − 3x² − 2 (plus de lecture : l'élève écrit le coefficient de chaque plateau, la
 *   plaque x² se vide — un terme disparaît). Le module de la طريقة pose le MÊME labo en monde `brackets` : des caisses « +( ) » / « −( ) » dont la
 *   main sort chaque pile « telle quelle » ou « signe changé » ; la valeur de l'expression refuse la mauvaise sortie (P2, P3).
 *   Rejetées : (a) le نشاط 1 du manuel comme entrée (la ligne brisée de longueur ℓ : 4 × 3ℓ ou 3ℓ + 3ℓ + 3ℓ + 3ℓ — deux écritures d'un même
 *   nombre, la question se résout en lisant) — il devient une APPLICATION en أتمرّن ; (b) le نشاط 2 (trois élèves écrivent des chaînes de calculs
 *   avec ou sans parenthèses) — l'élève y juge à l'estime sans que sa main décide quoi que ce soit ; il devient une APPLICATION en أتمرّن ;
 *   (c) une facture d'articles (3 stylos + 2 cahiers…) — on y réunit des objets de nature différente mais x et x² n'y ont aucune forme à
 *   comparer ; (d) l'aire d'un terrain en x (PitchExpansion de 4AM, que la leçon ne reconstruit pas). Ordre des idées : une pile ne se range
 *   que dans sa forme, x et x² ne se mélangent pas (P1) → des opposés se détruisent, les coefficients s'ajoutent, la valeur ne change pas (P1)
 *   → معارف : mots (somme / produit : la dernière opération, P4 ; produit de monômes 3x × 5x = 15x², P1) → طريقة : les caisses « +( ) » puis
 *   « −( ) » (P2, P3), puis la méthode revue ligne à ligne → أتمرّن (le نشاط 1, le نشاط 2 et les exercices réécrits) → trois مسائل →
 *   إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/tabsit-hadhf-aqwas';

export const LESSON_CONFIG = {
  id: 'tabsit-hadhf-aqwas',
  kind: 'lesson',
  unit: 'ibarat-harfiya-3',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  title: 'تبسيط عبارة جبرية وحذف الأقواس',
  description: 'على طاولة نادي الرياضيات نرتّب حزمًا من القطع الخشبية في صوانٍ لكل شكل فنكتشف أنّ الحدود المتشابهة وحدها تجتمع، ثم نُخرج حدود قوسين مسبوقين بـ + أو − من صندوقها فنرى متى تبقى الإشارات ومتى تتغيّر كلها، ونميّز المجموع من الجداء ونبسّط كلًّا منهما.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧮',
  estimatedDurationMin: 88,
  textbookRef: { unit: 4, activity: 1, pages: '54, 55, 56, 58, 59, 62, 63, 65, 66, 67' },
  skills: [
    'تبسيط عبارة جبرية: مجموع بجمع الحدود المتشابهة (التي لها الجزء الحرفي نفسه) وجداء حدود بضرب الأعداد معًا والحروف معًا، مثل $3x+5x=8x$ و $3x\\times5x=15x^2$',
    'حذف قوسين مسبوقين بالإشارة $+$ (وغير متبوعين بـ $\\times$ أو $\\div$) دون تغيير إشارات الحدود التي بينهما',
    'حذف قوسين مسبوقين بالإشارة $-$ مع تغيير إشارة كل حدّ بينهما: $a-(b-c)=a-b+c$ ، ثم تبسيط العبارة الناتجة',
    'التمييز بين عبارة على شكل مجموع وعبارة على شكل جداء (آخر عملية فيها)',
  ],
  teachingScope: {
    include: ['الحدود المتشابهة وجمع معاملاتها وتلاشي الحدّين المتعاكسين', 'جداء حدود: $3x\\times5x=15x^2$', 'حذف الأقواس المسبوقة بـ $+$ أو $-$ ثم التبسيط', 'العبارة المجموع والعبارة الجداء', 'التحقّق بقيمة العبارة من أجل قيمة معيّنة لـ $x$'],
    exclude: ['نشر $k(a+b)$ و $(a+b)(c+d)$ (درس «نشر عبارات جبرية»)', 'حساب قيمة عبارة وعدد سالب بين قوسين ومثال مضاد (درس «حساب قيمة عبارة حرفية»)', 'مقارنة عددين بإشارة الفرق (درس «مقارنة عددين ناطقين»)', 'التحليل إلى جداء عوامل'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — un jardin triangulaire en x, la clôture sans l'entrée.
  lessonProblem: {
    module: 5,
    title: 'حديقة الحيّ',
    statement: 'تريد جمعية الحيّ إحاطة حديقة مثلّثة الشكل بسياج، وتتبرّع العائلات بثمنه بكل سخاء. أطوال أضلاع الحديقة بالمتر: $2x+5$ و $x+8$ و $3x-1$ . وسيُترك في أحد الأضلاع مدخل عرضه $(x-3)$ متر دون سياج، وثمن المتر الواحد من السياج 300 دج.',
    questions: [
      { label: '1)', text: 'عبّر عن محيط الحديقة بأبسط شكل.' },
      { label: '2)', text: 'عبّر عن طول السياج بعد ترك المدخل، ثم احسب قيمته من أجل $x=5$.' },
      { label: '3)', text: 'ما ثمن السياج بالدينار من أجل $x=5$؟' },
    ],
    illustration: { kind: 'plan', shape: 'tri', fill: 'garden', sides: ['2x + 5', 'x + 8', '3x - 1'], unit: 'م', ariaLabel: 'حديقة مثلثة أضلاعها 2x + 5 و x + 8 و 3x − 1 بالمتر' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les deux liens « راجع » du réseau (la distributivité de 2AM, le calcul rationnel de 3AM) et l'écriture littérale.
  priorKnowledge: ['tawzi-darb-jam-tarh', 'amaliyat-natiqa', 'tabir-harfi'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `like-terms` (la main porte un TERME), monde `collect`, thème `workbench` :
    //   مبتدئ — 2x + 3 + 4x + 1 + x puis 5x + 6 − 2x − 4 : lectures visibles, la forme réduite s'écrit seule.
    //   متقدم — 4x² + 7 − x − 2x² + 5x − 9 puis 3x² − 4x + 6 + x − 3x² − 2 : l'élève écrit le coefficient de chaque plateau, « تحقّق » juge.
    {
      kind: 'manipulation', code: 'like-terms-collect-simple', type: 'like-terms', module: 1,
      level: 'beginner',
      title: 'طاولة الحدود: حزم في صوانٍ',
      objective: 'نجمع الحدود المتشابهة فقط (لها الجزء الحرفي نفسه) بجمع معاملاتها، والحدّان المتعاكسان يتلاشيان، وقيمة العبارة لا تتغيّر بالتبسيط',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'workbench' },
      learningPointIds: ['3am_tabsit-hadhf-aqwas_P1'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'like-terms-collect-square', type: 'like-terms', module: 1,
      level: 'advanced',
      title: 'طاولة الحدود: صينية $x^2$ تُفرَّغ',
      objective: 'نجمع الحدود المتشابهة فقط (لها الجزء الحرفي نفسه) بجمع معاملاتها، والحدّان المتعاكسان يتلاشيان، وقيمة العبارة لا تتغيّر بالتبسيط',
      autonomy: 'يكتب التلميذ بنفسه معامل كل صينية قبل أن يُحكَم عليه، ويرى أنّ صينية $x^2$ قد تفرغ فيزول حدّها',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'workbench' },
      learningPointIds: ['3am_tabsit-hadhf-aqwas_P1'],
      sourceElementIds: ['act-1'],
    },
    // Module 3 — le MÊME labo, monde `brackets`, posé seul (`levels={false}`) : des caisses « +( ) » puis « −( ) », puis les deux.
    {
      kind: 'manipulation', code: 'like-terms-brackets', type: 'like-terms', module: 3,
      title: 'طاولة الحدود: صناديق الأقواس',
      learningPointIds: ['3am_tabsit-hadhf-aqwas_P2', '3am_tabsit-hadhf-aqwas_P3'],
      sourceElementIds: ['method-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حديقة الحيّ', learningPointIds: ['3am_tabsit-hadhf-aqwas_P1', '3am_tabsit-hadhf-aqwas_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حافلة الرحلة', learningPointIds: ['3am_tabsit-hadhf-aqwas_P1', '3am_tabsit-hadhf-aqwas_P2', '3am_tabsit-hadhf-aqwas_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — قاعة النادي', learningPointIds: ['3am_tabsit-hadhf-aqwas_P1', '3am_tabsit-hadhf-aqwas_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ توزيع الضرب على الجمع، الأعداد النسبية، الكتابة بالحروف.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — طاولة النادي', desc: 'حزم من القطع الخشبية تُرتَّب في صوانٍ: أيّ الحزم تجتمع وأيّها لا؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_tabsit-hadhf-aqwas_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — مجموع أم جداء؟', desc: 'من أين جاءت الحروف؟ ما آخر عملية في العبارة؟ وكيف نبسّط جداء حدود؟',
      stage: 'discovery', teachesLearningPointIds: ['3am_tabsit-hadhf-aqwas_P1', '3am_tabsit-hadhf-aqwas_P4'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحذف الأقواس', desc: 'صناديق مسبوقة بـ + وصناديق مسبوقة بـ −: متى تبقى الإشارات ومتى تتغيّر؟',
      stage: 'formalization', teachesLearningPointIds: ['3am_tabsit-hadhf-aqwas_P2', '3am_tabsit-hadhf-aqwas_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'شريط الزخرفة، سلاسل الحساب، تبسيط حدود، حذف أقواس، زوايا مثلث، صحيح أم خاطئ.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_tabsit-hadhf-aqwas_P1', '3am_tabsit-hadhf-aqwas_P2', '3am_tabsit-hadhf-aqwas_P3', '3am_tabsit-hadhf-aqwas_P4'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حديقة الحيّ', desc: 'مسألة الدرس: محيط مثلث بدلالة x، والسياج بعد ترك المدخل، وثمنه.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tabsit-hadhf-aqwas_P1', '3am_tabsit-hadhf-aqwas_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — حافلة الرحلة', desc: 'عدد التلاميذ بعد محطة: أقواس مسبوقة بـ − وأخرى بـ +.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tabsit-hadhf-aqwas_P1', '3am_tabsit-hadhf-aqwas_P2', '3am_tabsit-hadhf-aqwas_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — قاعة النادي', desc: 'مساحة قاعة (جداء) ومحيطها (مجموع) بدلالة x، وثمن الأشغال.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tabsit-hadhf-aqwas_P1', '3am_tabsit-hadhf-aqwas_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
