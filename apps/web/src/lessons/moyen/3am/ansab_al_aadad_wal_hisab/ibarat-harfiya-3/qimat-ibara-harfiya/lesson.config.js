/**
 * الدرس — حساب قيمة عبارة حرفية (3AM, unité 4 « الحساب الحرفي ») — le TROISIÈME درس de l'unité, généré DANS son entrée du catalogue (item 3am.m5.r03),
 * cycle moyen phase 3, Phase 0 « priorité du propriétaire » (#15, 2026-10-26) : les leçons 4AM « الدالة التآلفية » (images f(−2), f(1/2)) et presque
 * tous les exercices d'algèbre du BEM (« احسب قيمة العبارة من أجل x = … ») en ont besoin. Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des
 * الكفاءات : نشاط 4 p. 57, معارف 4 p. 60, طريقة 4 p. 61, دوري الآن ① p. 61, تمارين 1–4 p. 62, أؤكّد 3 p. 65, أتعمّق 37 et 39 p. 66, ICT p. 69, أستعدّ 1–4 p. 55.
 * Source : docs/sources/3am/unit4/extraction.json ; plan : docs/sources/3am/unit4/plan/qimat-ibara-harfiya.md.
 * FRONTIÈRE (écrite dans build-extraction.py) : cette leçon SUBSTITUE (un nombre relatif ou rationnel, une ou deux lettres, × visible, parenthèses d'un négatif, priorité
 * des opérations, valeur exacte avec π contre valeur approchée) et porte la LOGIQUE du contre-exemple (une valeur qui sépare deux expressions prouve qu'elles sont différentes ;
 * des valeurs égales ne prouvent rien : on développe). Simplifier et développer sont des OUTILS déjà publiés (`tabsit-hadhf-aqwas`, `nashr-jabri-3am`), jamais enseignés ici ;
 * comparer par le signe de la différence est `muqaranat-natiqayn` ; résoudre une équation est l'unité 5 ; la notation A(−3) est celle de 4AM (on écrit « من أجل x = −3 »).
 * Le réseau : ses liens « راجع » — 3am.m1.r08 (حساب مجموع وفرق وجداء وحاصل قسمة عددين ناطقين, leçon NON publiée `amaliyat-natiqa`) et 1am.m5.r08 (تطبيق قاعدة حرفية,
 * leçon 1AM `tatbiq-qaida-harfiya`, publiée le 2026-10-30) — sont mesurés par « أستعدّ » ; la puissance d'un relatif (`quwat-adad-nisbi`, publiée) et la priorité des opérations y sont
 * mesurées hors réseau. Aucune arête de الكفاءات n'est écrite vers une leçon non publiée.
 * 2026-10-30 : `tatbiq-qaida-harfiya` (1AM, 1am.m5.r08) est publiée — arêtes LP P1 ← 1am_tatbiq-qaida-harfiya_P2 (remplacer le(s) lettre(s) par une valeur et calculer) et P3 ← 1am_tatbiq-qaida-harfiya_P3
 * (un contre-exemple suffit) le long du lien du réseau 1am.m5.r08 → 3am.m5.r03 (`extends`) ; le « تذكّر — السنة الأولى » (lien déjà branché par `getLessonPath`) pointe vers la leçon.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre.
 *   Entrée retenue : le MUR DE BILLES du نادي العلوم (labo `marble-run`, thème `marblerun`). Les stations du mur sont les opérations de l'expression (la copieuse du carré,
 *   la presse du produit, le basculeur du moins, la jonction du + et du −) ; la main choisit la VALEUR de la lettre (une bille lâchée dans le réservoir, qui envoie une bille
 *   IDENTIQUE à chaque entrée de la lettre) puis ÉCRIT sous le mur la ligne de la substitution. Le mur calcule ce que l'expression SIGNIFIE ; un lecteur strict calcule ce que la
 *   LIGNE dit — sans le × les chiffres se fondent (43), sans parenthèses −2² se lit −4 — et la station où ils se séparent s'allume. La valeur n'est jamais dite : elle sort du mur.
 *   مبتدئ : 4x + 7 en 3 puis en −2, puis x² − 3x en −2 (puces des stations pendant la course). متقدم : la valeur est PRÉDITE au clavier avant le lancement : 5 − 2x² en −3, 6x − 1 en
 *   −1/2, 3x − 2y en (−1 ; 4) (deux réservoirs). Le module de la طريقة pose le MÊME labo en monde `twins` : deux murs sous UN réservoir, un contre-exemple à trouver ou « انشر ».
 *   Rejetées : (a) le نشاط 4 du manuel comme entrée (A à trois valeurs puis le jugement d'un développement : rien n'y rend les parenthèses ou le × NÉCESSAIRES — il devient une
 *   APPLICATION, E1) ; (b) une machine « boîte noire » x ↦ valeur (c'est `linear-machine` de 4AM, et une boîte noire cache ce que la leçon apprend : où entre le nombre) ;
 *   (c) un tableau de valeurs à remplir sans fin (rien ne s'y décide). Ordre des idées : le même nombre à chaque entrée, le × qui se voit (P1, P2) → les parenthèses d'un négatif, le
 *   carré d'un négatif (P2) → une fraction, deux lettres, prédire avant de lancer (P1) → معارف : les mots (التعويض, القيمة), la méthode (P1, P2) → طريقة : les deux murs jumeaux,
 *   le contre-exemple et pourquoi l'accord de valeurs ne prouve rien, « les valeurs réfutent, le développement prouve » (P3) → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/qimat-ibara-harfiya';

export const LESSON_CONFIG = {
  id: 'qimat-ibara-harfiya',
  kind: 'lesson',
  unit: 'ibarat-harfiya-3',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  title: 'حساب قيمة عبارة حرفية',
  description: 'على مسار الكريات في نادي العلوم نُسقط كريةً في خزّان الحرف ونكتب السطر الذي يحسب العبارة، فنكتشف أنّ العدد نفسه يدخل كل مكان للحرف، وأنّ علامة الضرب تُظهَر، وأنّ العدد السالب يوضع بين قوسين، ثم نقارن عبارتين بالقيم فنعرف أنّ قيمة تختلف عندها العبارتان تثبت أنهما غير متساويتين، أمّا تساوي القيم فلا يثبت التساوي.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🎯',
  estimatedDurationMin: 88,
  textbookRef: { unit: 4, activity: 4, pages: '55, 57, 60, 61, 62, 65, 66, 69' },
  skills: [
    'تعويض الحرف (أو الحرفين) بقيمة نسبية أو ناطقة في عبارة حرفية وحساب قيمتها باحترام أولوية العمليات، مثل قيمة $2x^2-5x+1$ من أجل $x=3$',
    'إظهار علامة الضرب المضمَرة ووضع القيمة السالبة بين قوسين عند التعويض: $5x$ من أجل $x=-3$ تُكتب $5\\times(-3)$ ، و $x^2$ تُكتب $(-3)^2=9$ لا $-3^2$',
    'الحكم على تساوي عبارتين بالقيم: قيمة واحدة تختلف عندها العبارتان تثبت أنهما غير متساويتين (مثال مضاد)، أمّا تساوي قيمتيهما من أجل بعض القيم فلا يثبت تساويهما',
  ],
  teachingScope: {
    include: ['تعويض حرف أو حرفين بعدد نسبي أو ناطق', 'إظهار علامة الضرب والأقواس حول العدد السالب', 'أولوية العمليات داخل السطر المعوَّض (القوة قبل الضرب قبل الجمع)', 'القيمة المضبوطة بدلالة $\\pi$ والقيمة المقرّبة', 'المثال المضاد: قيمة تبطل المساواة، وتساوي القيم لا يثبتها'],
    exclude: ['تبسيط عبارة جبرية ونشرها (درسان منشوران: أداتان فقط)', 'مقارنة عددين بإشارة الفرق', 'حلّ المعادلات', 'الرمز $A(-3)$ والدوال (4 متوسط)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — la parcelle du jardin du collège.
  lessonProblem: {
    module: 5,
    title: 'حديقة القسم',
    statement: 'قطعة أرض مستطيلة بعداها بالمتر $(x+3)$ و $(2x-1)$ يعتني بها تلاميذ القسم. كيس البذور يكفي 20 م².',
    questions: [
      { label: '1)', text: 'انشر وبسّط عبارة المساحة $S$.' },
      { label: '2)', text: 'احسب $S$ من أجل $x=2{,}5$.' },
      { label: '3)', text: 'هل يكفي كيس واحد من البذور من أجل هذه القيمة؟ علّل.' },
      { label: '4)', text: 'احسب $S$ من أجل $x=3{,}5$.' },
    ],
    illustration: { kind: 'plan', shape: 'rect', fill: 'garden', w: '2x - 1', h: 'x + 3', unit: 'م', ariaLabel: 'قطعة أرض مستطيلة بعداها x + 3 و 2x − 1 بالمتر' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les deux liens « راجع » du réseau (les rationnels, la règle littérale de 1AM) et, hors réseau, la puissance d'un négatif et la priorité.
  priorKnowledge: ['amaliyat-natiqa-3am', 'tatbiq-qaida-harfiya-1am', 'quwat-adad-nisbi-3am', 'awlawiya-amaliyat'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `marble-run` (la main lâche la bille et ÉCRIT la ligne), thème `marblerun` :
    //   مبتدئ — 4x + 7 en 3 puis −2, x² − 3x en −2 (puces des stations) ; متقدم — 5 − 2x² en −3, 6x − 1 en −1/2, 3x − 2y (deux réservoirs), valeur prédite avant le lancement.
    {
      kind: 'manipulation', code: 'marble-run-simple', type: 'marble-run', module: 1,
      level: 'beginner',
      title: 'مسار الكريات: العدد في كل مكان',
      objective: 'نعوّض الحرف بالعدد نفسه في كل مكان منه، ونُظهر علامة الضرب، ونضع العدد السالب بين قوسين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'marblerun' },
      learningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'marble-run-advanced', type: 'marble-run', module: 1,
      level: 'advanced',
      title: 'مسار الكريات: كسر وحرفان',
      objective: 'نعوّض الحرف بالعدد نفسه في كل مكان منه، ونُظهر علامة الضرب، ونضع العدد السالب بين قوسين',
      autonomy: 'يتوقّع التلميذ القيمة قبل التشغيل، ويكتب بنفسه السطر لكسر وحرفين',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'marblerun' },
      learningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2'],
      sourceElementIds: ['know-4'],
    },
    // Module 3 — le MÊME labo, monde `twins`, posé seul (`levels={false}`) : deux murs sous un réservoir, le contre-exemple, « انشر ».
    {
      kind: 'manipulation', code: 'marble-run-twins', type: 'marble-run', module: 3,
      title: 'مسار الكريات: المساران المتوأمان',
      learningPointIds: ['3am_qimat-ibara-harfiya_P3', '3am_qimat-ibara-harfiya_P1'],
      sourceElementIds: ['method-4'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حديقة القسم', learningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2', '3am_qimat-ibara-harfiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — برنامجا حساب', learningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — من جرجرة إلى شطّ ملغيغ', learningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ عمليات على الكسور، قاعدة حرفية، قوة عدد سالب، أولوية العمليات.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مسار الكريات', desc: 'نُسقط كريةً في خزّان الحرف ونكتب السطر الذي يحسب العبارة، ثم نقارنه بسلّة النتيجة.',
      stage: 'trigger', teachesLearningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — عوّض ثم احسب', desc: 'كيف نحسب قيمة عبارة حرفية؟ تعويض الحرف في كل مكان، علامة الضرب، الأقواس، أولوية العمليات، حرفان.',
      stage: 'discovery', teachesLearningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — مثال مضاد أم نشر؟', desc: 'مساران متوأمان: قيمة تفرّق بين عبارتين تثبت أنهما مختلفتان، وتساوي القيم لا يكفي لإثبات التساوي.',
      stage: 'formalization', teachesLearningPointIds: ['3am_qimat-ibara-harfiya_P3', '3am_qimat-ibara-harfiya_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'نشر زميل يُحكم عليه بالقيم، قيم بأعداد سالبة وكسرية، اختبار مساواتين، كرة مرمية، العدد π، جدول قيم.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2', '3am_qimat-ibara-harfiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حديقة القسم', desc: 'مسألة الدرس: مساحة قطعة أرض بدلالة x، قيمتها من أجل قيمتين، وهل يكفي كيس بذور واحد.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2', '3am_qimat-ibara-harfiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — برنامجا حساب', desc: 'برنامجان يتّفقان من أجل عدد واحد: نبحث عن مثال مضاد ثم نقارن برنامجًا ثالثًا بالنشر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — من جرجرة إلى شطّ ملغيغ', desc: 'درجة الحرارة حسب الارتفاع: قيم موجبة وسالبة، وشطّ ملغيغ تحت سطح البحر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qimat-ibara-harfiya_P1', '3am_qimat-ibara-harfiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
