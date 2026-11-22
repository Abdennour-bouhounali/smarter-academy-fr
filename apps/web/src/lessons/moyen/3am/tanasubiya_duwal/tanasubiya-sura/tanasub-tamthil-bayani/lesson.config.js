/**
 * الدرس — التناسبية والتمثيل البياني (3AM, unité 6 « التناسبية ») — générée DANS son entrée du catalogue (item 3am.m7.r01), cycle moyen phase 3, Phase A de la file
 * (2026-10-21, entrée #9) : les درس 4AM « معامل التناسبية », « الدالة الخطية », « التمثيل البياني لدالة خطية », « تطريد خطي », « تطريد تآلفي » s'appuient sur elle.
 * Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 1 p. 88, معارف 1 p. 90, طرائق p. 91, exercices 1–5 p. 94–95, أؤكّد 1–2 p. 97, أتعمّق 31, 32, 33, 41
 * p. 98–99, أستعدّ 1, 4, 5, 6 p. 87. Source : docs/sources/3am/unit6/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : ses liens « راجع » — 2am.m6.r01 (التعرّف على وضعية تناسبية من جدول, leçon 2AM `wadiya-tanasubiya-jadwal`) et 2am.m4.r04 (إحداثيا نقطة, leçon 2AM
 * `talim-nuqta-mustawi`) — mènent à des leçons NON publiées : « أستعدّ » les mesure, la leçon ne les reconstruit pas, et `pointPrerequisites` ne porte que des arêtes internes.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « سكك الدبابيس » (labo `pin-rails`, thème `stall`). Les prix d'une papeterie deviennent des POINTS : la main GLISSE chaque punaise le long de la rainure
 *   de sa colonne jusqu'à son prix (la punaise lâchée au mauvais prix retombe : le tableau fait foi), puis POSE une règle droite sur deux nœuds de son choix (O ou une
 *   punaise). C'est là que « points alignés AVEC O » devient nécessaire sous la main : la règle par O touche tout dans la boutique à prix unique, touche les quatre punaises
 *   mais laisse O dehors quand une carte de membre s'ajoute (« تقطع المحور عند 10 »), ne touche jamais tout quand le prix change après 8 boîtes. مبتدئ : trois boutiques
 *   (la première avec tableau, les deux autres sont des « photos » de points). متقدم : des sacs de dattes (1,5 kg) et un caisson vide de 4 kg + 0,5 kg par sac, puis trois LECTURES :
 *   la punaise de lecture glisse sur sa rainure (1 sac, 7 sacs) ou le long de sa rangée (15 kg) jusqu'à la droite — le coefficient se lit à l'abscisse 1.
 *   Rejetées : (a) le نشاط 1 du manuel comme entrée (les trois offres s'évaluent d'abord par le calcul du quotient dans le tableau, le graphique n'étant demandé qu'APRÈS :
 *   une décoration, pas une nécessité) — il devient une APPLICATION en أتمرّن ; (b) un traceur qu'on balaie le long de l'axe (la main tient x et un tableau se remplit : c'est
 *   `ratio-ride`, 4AM) ; (c) la droite épinglée à O qu'on fait pivoter (`origin-line`, 4AM : les points y sont imposés sur y = ax, la pente est la variable) — ici la main ne
 *   choisit pas une pente, elle CHOISIT LES DEUX NŒUDS et c'est ce que la règle touche qui juge la situation.
 *   Ordre des idées : un tableau de prix donne des points (P1) → la règle par O touche tout, une règle par les punaises laisse O dehors, aucune règle ne touche tout (P2, P3) →
 *   le coefficient se lit à l'abscisse 1 et la punaise de lecture se pose sur la droite (P4) → معارف : les coordonnées, les deux propriétés et leurs refus → طريقة : y = ax,
 *   lire une valeur, juger un graphique → أتمرّن (le نشاط 1, les exercices 1–5, أتعمّق 31, 32, 33, 41 réécrits) → trois مسائل → إختبار أولي. La vitesse, la distance-temps et
 *   le pourcentage ne sont PAS ici : `haraka-muntazama-sura` et `nisba-miawiya-3am`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 * 2026-10-29 : `talim-nuqta-mustawi` (2AM, 2am.m4.r04) est publiée — arêtes LP P1 ← 2am_talim-nuqta-mustawi_P3 et P4 ← 2am_talim-nuqta-mustawi_P2
 * (lien du réseau 2am.m4.r04 → 3am.m7.r01) ; le panneau « راجع » vers r04 devient un lien tout seul.
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/tanasubiya_duwal/tanasub-tamthil-bayani';

export const LESSON_CONFIG = {
  id: 'tanasub-tamthil-bayani',
  kind: 'lesson',
  unit: 'tanasubiya-sura',
  unitTitle: 'التناسبية',
  sequentialUnlock: true,
  title: 'التناسبية والتمثيل البياني',
  description: 'دكّان أدوات مدرسية: نرفع الدبابيس على سكّتها إلى الأثمان فتصير نقطًا في معلم، ثم نضع مسطرة على نقطتين فنكتشف أنّ الوضعية التناسبية تُمثَّل بنقط على مستقيم يمرّ بـ $O$ ، ونقرأ معامل التناسبية ونستخرج قيمًا مجهولة.',
  level: 'moyen',
  grade: '3am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان الدوال وتنظيم المعطيات',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📍',
  estimatedDurationMin: 86,
  textbookRef: { unit: 6, activity: 1, pages: '87, 88, 90, 91, 94, 95, 97, 98, 99' },
  skills: [
    'تمثيل جدول معطيات بنقط في معلم متعامد ومتجانس (كل عمود من الجدول نقطة: فاصلتها العدد الأوّل وترتيبها العدد الثاني)',
    'التعرّف على وضعية تناسبية من تمثيل بياني نقطه على استقامة واحدة مع مبدأ المعلم',
    'التعرّف على أن تمثيلا بيانيا لا يمر بالمبدأ أو نقطه غير مستقيمة لا يمثل وضعية تناسبية',
    'قراءة معامل التناسبية واستغلال التمثيل البياني لإيجاد قيم مجهولة ($y = ax$)',
  ],
  teachingScope: {
    include: ['تمثيل جدول بنقط في معلم، وخاصيتا التناسبية والاستقامة مع $O$ ، ورفض التمثيل الذي لا يمرّ بـ $O$ أو نقطه غير مستقيمة', 'معامل التناسبية $a$ ومعنى $y = ax$ وإيجاد قيم مجهولة من البيان أو بالحساب'],
    exclude: ['الحركة المنتظمة والسرعة والمسافة والزمن (درس لاحق)', 'النسبة المئوية (درس «النسبة المئوية»)', 'الدالة التآلفية $y = ax + b$ دراسةً (درس من السنة الرابعة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'عسل التعاونية',
    statement: 'تبيع تعاونية فلاحية عسل نحل الحيّ في علب متماثلة. ثمن $2$ علبة $900$ دج، وثمن $4$ علب $1800$ دج، وثمن $6$ علب $2700$ دج؛ وتتقاسم الأرباح بالتساوي على المزارعين تعاونًا فيما بينهم.',
    questions: [
      { label: '1)', text: 'ما إحداثيا النقطة التي تمثّل ثمن $6$ علب في معلم؟' },
      { label: '2)', text: 'هل تُمثّل النقط الثلاث وضعية تناسبية؟' },
      { label: '3)', text: 'ما ثمن $9$ علب؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: '2 علبة', lines: [{ label: 'دج', value: '900' }] }, { title: '4 علب', lines: [{ label: 'دج', value: '1800' }] }, { title: '6 علب', lines: [{ label: 'دج', value: '2700' }] }], ariaLabel: 'ثلاث بطاقات: ثمن 2 علبة 900 دج، ثمن 4 علب 1800 دج، ثمن 6 علب 2700 دج' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les deux liens « راجع » du réseau (2am.m6.r01 et 2am.m4.r04).
  priorKnowledge: ['tanasubiya-jadwal-2am', 'talim-nuqta-2am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `pin-rails` (la main lève des punaises et pose la règle), thème `stall`.
    {
      kind: 'manipulation', code: 'pin-rails-shops', type: 'pin-rails', module: 1,
      level: 'beginner',
      title: 'سكك الدبابيس: ثلاثة محلّات',
      objective: 'جدول الأسعار يعطي نقطًا في معلم؛ وتكون الوضعية تناسبية عندما تمسّ مسطرة واحدة النقط كلّها وتمرّ بـ O ، أمّا النقط المستقيمة التي لا تمرّ بـ O أو النقط غير المستقيمة فليست تناسبية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'stall' },
      learningPointIds: ['3am_tanasub-tamthil-bayani_P1', '3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P3'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'pin-rails-read', type: 'pin-rails', module: 1,
      level: 'advanced',
      title: 'سكك الدبابيس: الحكم والقراءة',
      objective: 'جدول الأسعار يعطي نقطًا في معلم؛ وتكون الوضعية تناسبية عندما تمسّ مسطرة واحدة النقط كلّها وتمرّ بـ O ، أمّا النقط المستقيمة التي لا تمرّ بـ O أو النقط غير المستقيمة فليست تناسبية',
      autonomy: 'لوحات نقط بلا جدول يُحكم عليها بالمسطرة وحدها، ثم دبّوس قراءة يوضع على المستقيم في ثلاث حالات: كيس واحد، سبعة أكياس، كتلة معلومة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'stall' },
      learningPointIds: ['3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P3', '3am_tanasub-tamthil-bayani_P4'],
      sourceElementIds: ['method-1b'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — عسل التعاونية', learningPointIds: ['3am_tanasub-tamthil-bayani_P1', '3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — خزّان الحيّ', learningPointIds: ['3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ميزان الأمانة', learningPointIds: ['3am_tanasub-tamthil-bayani_P3', '3am_tanasub-tamthil-bayani_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: صحيح أم خاطئ؟ جدول تناسبية وإحداثيا نقطة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — سكك الدبابيس', desc: 'أثمان تتحوّل إلى نقط على لوحة: ماذا تمسّ المسطرة؟ وأين تقع النقط في وضعية تناسبية؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_tanasub-tamthil-bayani_P1', '3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P3', '3am_tanasub-tamthil-bayani_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — التناسبية والبيان', desc: 'نسمّي ما رأيناه: الإحداثيان، وخاصيتا التمثيل البياني لوضعية تناسبية.',
      stage: 'discovery', teachesLearningPointIds: ['3am_tanasub-tamthil-bayani_P1', '3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P3'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أقرأ بيانًا وأحكم عليه', desc: 'العلاقة y = ax، وقراءة قيمة مجهولة على البيان، والحكم على تمثيل.',
      stage: 'formalization', teachesLearningPointIds: ['3am_tanasub-tamthil-bayani_P3', '3am_tanasub-tamthil-bayani_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ثلاثة عروض كرّاريس، ثلاثة معالم، ماء وماء مالح، علب، براميل، آلة، نقطة، وكوكب.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_tanasub-tamthil-bayani_P1', '3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P3', '3am_tanasub-tamthil-bayani_P4'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — عسل التعاونية', desc: 'مسألة الدرس: نقطة ثمن، وهل الوضعية تناسبية، وثمن 9 علب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tanasub-tamthil-bayani_P1', '3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — خزّان الحيّ', desc: 'نقط على استقامة لا تمرّ بـ O: ماذا نستنتج؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tanasub-tamthil-bayani_P2', '3am_tanasub-tamthil-bayani_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ميزان الأمانة', desc: 'معامل التناسبية، وثمن 6 كغ، وكتلة بثمن معلوم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_tanasub-tamthil-bayani_P3', '3am_tanasub-tamthil-bayani_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
