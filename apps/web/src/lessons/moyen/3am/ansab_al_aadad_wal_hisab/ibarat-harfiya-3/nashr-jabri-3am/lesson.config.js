/**
 * الدرس — نشر عبارات جبرية (3AM, unité 4 « الحساب الحرفي ») — le DEUXIÈME درس de l'unité, généré DANS son entrée du catalogue (item 3am.m5.r02),
 * cycle moyen phase 3, Phase A de la file (#4, 2026-10-21) : les leçons 4AM « نشر وتبسيط », « المتطابقات الشهيرة » et « تحليل عبارة » en ont
 * besoin. Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 3 p. 57, معارف 3 p. 58, طرائق 2–3 p. 59, دوري الآن ②
 * p. 59, exercices 8–11 p. 62 et 15–26 pp. 63–64, أؤكّد 4, 5, 7, 8 p. 65, أتعمّق 40–46 pp. 66–67, تحدّي p. 54, أستعدّ 9–11 p. 55.
 * Source : docs/sources/3am/unit4/extraction.json ; brief des auteurs (addendum) : docs/sources/3am/unit4/brief-authors.md.
 * FRONTIÈRE avec `tabsit-hadhf-aqwas` (publiée, écrite dans build-extraction.py) : celle-ci SIMPLIFIE ; ici on DISTRIBUE — k(a + b),
 * (a + b)(c + d), l'aire d'un rectangle comptée de deux façons, « développer puis réduire ». Les identités remarquables ne sont pas nommées
 * (4AM `mutatabiqat-shahira`), on ne factorise pas (4AM `tahlil-ibara`), une valeur ne sert qu'à CONTRÔLER un développement (r03 est
 * `qimat-ibara-harfiya`).
 * Le réseau : ses liens « راجع » — 3am.m1.r01 (جداء عددين نسبيين, lecon NON publiée `jidaa-adadayn-nisbiyayn`) et 3am.m5.r01 (PUBLIÉE :
 * `tabsit-hadhf-aqwas`) — sont mesurés par « أستعدّ » (« راجع قبل أن تنطلق ») ; la leçon publiée est RAPPELÉE par une « تذكّر » en معارف (jamais
 * reconstruite) et P4 s'appuie sur sa P1 (les termes semblables) par une arête de الكفاءات le long du lien du réseau 3am.m5.r01 → 3am.m5.r02.
 * Les labos `PitchExpansion` / `TurfFactoring` de 4AM « الحساب الحرفي » ne sont ni réutilisés ni redessinés ; ni le labo `like-terms`.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre.
 *   Entrée retenue : le JARDIN DE L'ÉCOLE vu d'en haut (labo `area-split`, monde `plot`, thème `schoolgarden`). Un terrain rectangulaire dont les
 *   deux côtés sont écrits avec x (3(x + 4), (x + 3)(x + 2), 2(x − 3), (x − 2)(x − 3)) : la jardinière veut connaître l'aire de chaque ZONE
 *   (pelouse, massif, allée dallée), donc la lire en morceaux. La main fait glisser la COUPURE le long d'un côté, jusqu'à l'endroit où l'écriture
 *   du côté change de terme, puis DÉCIDE ce que chaque parcelle compte (une aire qui s'ajoute, ou une allée qui s'ôte ; le COIN que deux allées
 *   ôtent deux fois se rend). C'est là que développer devient NÉCESSAIRE sous la main : une seule écriture « (x + 3)(x + 2) » ne dit rien de la
 *   pelouse ni du massif ; le juge est l'aire comptée du terrain, au x que la main règle aussi (deux compteurs toujours égaux, un signe faux est
 *   refusé avec les deux aires). مبتدئ : 3(x + 4) puis 2(x − 3) (accolades, aires écrites, la forme réduite s'écrit seule) ; متقدم : (x + 3)(x + 2)
 *   — quatre parcelles, deux coupures, deux parcelles semblables à réunir — puis (x − 2)(x − 3) (le coin) ; plus d'accolades ni d'aires : la
 *   main écrit le coefficient de chaque puissance. Le module de la طريقة pose le MÊME labo en monde `arrows` : les flèches rouges du facteur
 *   vers chaque terme de l'autre parenthèse (−3(x − 4), (2x + 1)(x − 3), 3(2 − x) − 4(x − 1)) ; la valeur du produit refuse un mauvais signe.
 *   Rejetées : (a) le نشاط 3 du manuel comme entrée (deux rectangles ABCD et LMPQ déjà découpés : l'élève LIT la figure, sa main ne décide
 *   rien) — il devient une APPLICATION en أتمرّن ; (b) un terrain de football aux zones à porter dans une somme (c'est le labo 4AM
 *   `pitch-expansion`, que la leçon ne reconstruit pas) ; (c) un tableau de multiplication (« chaque terme avec chaque terme ») : il
 *   donne la règle sans résistance et ne porte aucun signe négatif ; (d) une facture (3 boîtes de (x stylos + 4 cahiers)) : k(a + b) y est
 *   trivial et (a + b)(c + d) n'y a pas de sens. Ordre des idées : l'aire comptée de deux façons (P3) → une allée ôtée : k(a − b) = ka − kb
 *   (P1) → le coin rendu : (−)×(−) = + (P2) → معارف : les mots (نشر, توزيع), « chaque terme du premier avec chaque terme du second » (P1, P2),
 *   le pont avec la règle des parenthèses du درس précédent (−(a − b) = (−1)(a − b)) → طريقة : les flèches, puis « développer, réduire, ordonner »
 *   (P4) → أتمرّن (le نشاط 3, les exercices 8, 15, 16, 18, 59 et أتعمّق 43 réécrits) → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/nashr-jabri-3am';

export const LESSON_CONFIG = {
  id: 'nashr-jabri-3am',
  kind: 'lesson',
  unit: 'ibarat-harfiya-3',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  title: 'نشر عبارات جبرية',
  description: 'على أرض حديقة المدرسة نقطع الأرض إلى أجزاء ونقرّر ما تحسبه كل قطعة، فنكتشف أنّ مساحة المستطيل تُحصى بجداء بعديه وبمجموع مساحات أجزائه، وأنّ الممرّ يُطرح وأنّ ركن الممرّين يُردّ، ثم نرسم الأسهم من كل حدّ إلى كل حدّ لننشر $k(a+b)$ و $(a+b)(c+d)$ ونبسّط الناتج.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '✖️',
  estimatedDurationMin: 88,
  textbookRef: { unit: 4, activity: 3, pages: '54, 55, 57, 58, 59, 62, 63, 64, 65, 66, 67' },
  skills: [
    'نشر عبارة من الشكل $k(a+b)$ بالخاصية التوزيعية: $k(a+b)=ka+kb$ و $k(a-b)=ka-kb$ ، مع $k$ سالب أو قوسين مسبوقين بإشارة $-$',
    'نشر عبارة من الشكل $(a+b)(c+d)=ac+ad+bc+bd$ حيث $a$ و $b$ و $c$ و $d$ أعداد نسبية: كل حدّ من القوس الأول يضرب كل حدّ من القوس الثاني',
    'تبرير قاعدة النشر بحساب مساحة مستطيل بطريقتين: جداء بعديه ومجموع مساحات أجزائه (والممرّ يُطرح وركن الممرّين يُردّ)',
    'نشر ثم تبسيط عبارة جبرية وترتيب حدودها حسب قوى $x$ تنازليًا، ومراقبة النشر بقيمة لـ $x$',
  ],
  teachingScope: {
    include: ['نشر $k(a+b)$ و $k(a-b)$ مع $k$ سالب', 'نشر $(a+b)(c+d)$ بإشارات مختلفة', 'مساحة مستطيل بطريقتين وربطها بالنشر', 'نشر ثم جمع الحدود المتشابهة وترتيبها تنازليًا', 'مراقبة نشر بقيمة لـ $x$ (للمراقبة فقط)'],
    exclude: ['الحساب على الجذور', 'تسمية المتطابقات الشهيرة وقوانينها (4 متوسط)', 'التحليل إلى جداء عوامل (4 متوسط)', 'حساب قيمة عبارة حرفية ومثال مضاد (درس «حساب قيمة عبارة حرفية»)', 'مقارنة عددين ناطقين'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — la cour de l'école et son bandeau d'arbres.
  lessonProblem: {
    module: 5,
    title: 'ساحة المدرسة',
    statement: 'تريد المدرسة تهيئة ساحة مستطيلة بعداها بالمتر $(x+7)$ و $(x+4)$ ، وتتعاون الأقسام على غرسها. يُخصَّص منها شريط عرضه 2 م على طول البعد $(x+7)$ لغرس الأشجار، ويُزرع العشب في بقية الساحة، وثمن المتر المربّع من العشب 150 دج.',
    questions: [
      { label: '1)', text: 'انشر وبسّط عبارة مساحة الساحة كلها.' },
      { label: '2)', text: 'عبّر عن مساحة الجزء المعشوشب بأبسط شكل، ثم احسبها من أجل $x=5$.' },
      { label: '3)', text: 'ما ثمن العشب بالدينار من أجل $x=5$؟' },
    ],
    illustration: { kind: 'plan', shape: 'rect', fill: 'garden', w: 'x + 7', h: 'x + 4', unit: 'م', ariaLabel: 'ساحة مستطيلة بعداها x + 7 و x + 4 بالمتر' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les deux liens « راجع » du réseau (le produit de deux rationnels de 3AM, la simplification publiée) et l'aire écrite.
  priorKnowledge: ['jidaa-adadayn-nisbiyayn', 'tabsit-hadhf-aqwas', 'tabir-harfi'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `area-split` (la main porte la COUPURE et décide ce que compte chaque parcelle),
    //   monde `plot`, thème `schoolgarden` :
    //   مبتدئ — 3(x + 4) puis 2(x − 3) : accolades, aires écrites, la forme réduite s'écrit seule.
    //   متقدم — (x + 3)(x + 2) puis (x − 2)(x − 3) (le coin) : l'élève écrit le coefficient de chaque puissance, « تحقّق » juge.
    {
      kind: 'manipulation', code: 'area-split-plot-simple', type: 'area-split', module: 1,
      level: 'beginner',
      title: 'أرض الحديقة: الأرض والممرّ',
      objective: 'نحسب مساحة المستطيل مرّتين: جداء بعديه ومجموع مساحات أجزائه، فينتج النشر ؛ والممرّ المبلّط يُطرح وركن الممرّين يُردّ',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'schoolgarden' },
      learningPointIds: ['3am_nashr-jabri-3am_P1', '3am_nashr-jabri-3am_P3'],
      sourceElementIds: ['act-3'],
    },
    {
      kind: 'manipulation', code: 'area-split-plot-corner', type: 'area-split', module: 1,
      level: 'advanced',
      title: 'أرض الحديقة: أربع قطع وركن',
      objective: 'نحسب مساحة المستطيل مرّتين: جداء بعديه ومجموع مساحات أجزائه، فينتج النشر ؛ والممرّ المبلّط يُطرح وركن الممرّين يُردّ',
      autonomy: 'يكتب التلميذ بنفسه معامل كل قوة بعد جمع القطع المتشابهة، ويقرّر وحده إشارة قطعة الركن',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'schoolgarden' },
      learningPointIds: ['3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P3'],
      sourceElementIds: ['act-3'],
    },
    // Module 3 — le MÊME labo, monde `arrows`, posé seul (`levels={false}`) : les flèches du facteur vers chaque terme, le signe de chaque produit.
    {
      kind: 'manipulation', code: 'area-split-arrows', type: 'area-split', module: 3,
      title: 'اللوح: الأسهم الحمراء',
      learningPointIds: ['3am_nashr-jabri-3am_P1', '3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P4'],
      sourceElementIds: ['method-2', 'method-3'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ساحة المدرسة', learningPointIds: ['3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — برنامج حساب', learningPointIds: ['3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — أرض وممرّان', learningPointIds: ['3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P3', '3am_nashr-jabri-3am_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ جداء عددين نسبيين، تبسيط عبارة، مساحة مستطيل ومحيطه.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — أرض الحديقة', desc: 'قطعة أرض مستطيلة بعداها بدلالة x: نقطعها ونقرّر ما تحسبه كل قطعة، ثم نقارن العدّادين.',
      stage: 'trigger', teachesLearningPointIds: ['3am_nashr-jabri-3am_P1', '3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — كل حدّ مع كل حدّ', desc: 'ما معنى النشر؟ كيف يُضرب كل حدّ في كل حدّ؟ وما صلة ذلك بحذف الأقواس؟',
      stage: 'discovery', teachesLearningPointIds: ['3am_nashr-jabri-3am_P1', '3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أنشر وأبسّط', desc: 'أسهم حمراء من كل حدّ إلى كل حدّ، وإشارة كل جداء، ثم نجمع المتشابهة ونرتّب.',
      stage: 'formalization', teachesLearningPointIds: ['3am_nashr-jabri-3am_P1', '3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'مستطيلان مقسومان، عبارات للنشر، خطأ في ورقة زميل، نشر مضاعف، مراقبة نشر، صحيح أم خاطئ.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_nashr-jabri-3am_P1', '3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P3', '3am_nashr-jabri-3am_P4'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ساحة المدرسة', desc: 'مسألة الدرس: مساحة ساحة بدلالة x، والجزء المعشوشب منها، وثمن العشب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — برنامج حساب', desc: 'برنامج حساب في نادي الأعداد: نكتب نتيجته ثم ننشرها ونبسّطها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — أرض وممرّان', desc: 'مساحة أرض مربّعة بعد اقتطاع ممرّين، وردّ الركن، وثمن العشب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_nashr-jabri-3am_P2', '3am_nashr-jabri-3am_P3', '3am_nashr-jabri-3am_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
