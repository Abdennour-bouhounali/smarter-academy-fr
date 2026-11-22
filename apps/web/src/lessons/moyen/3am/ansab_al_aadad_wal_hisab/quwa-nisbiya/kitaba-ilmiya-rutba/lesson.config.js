/**
 * الدرس — الكتابة العلمية ورتبة القدر (3AM, unité 3 « القوى ذات أسس نسبية صحيحة ») — généré DANS son entrée du catalogue (items 3am.m3.r04 et 3am.m3.r05), cycle moyen
 * phase 3, Phase 0 « owner priority » (2026-10-26), après les leçons publiées `quwa-adad-ashara` (r03) et `qawaid-quwa-ashara` (r02), qu'il RAPPELLE sans les refaire.
 * Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 5 p. 41, معارف 4–5 p. 44, طرائق et دوري الآن p. 45, أوظّف 21–33 p. 47–48, 52, 54, 57–62, 65–67, 70 p. 50–51,
 * أؤكّد 12–21 p. 49. Source : docs/sources/3am/unit3/extraction.json (relue à 120–220 dpi le 2026-10-26). Rien n'est montré tel quel (§4ter-bis).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le « سلّم الأحجام » (labo `size-ladder`, thème `fair-wall`). Dans le couloir de la foire des sciences, un grand mur porte un slide de barreaux de bois : chaque barreau va d'une puissance de 10
 *   à la suivante et porte neuf cases (graduations 1 … 10 LOGARITHMIQUES). La main tient la POSITION d'une carte de longueur : son barreau n, puis sa case (la partie entière de a), puis l'AIMANT (arrondi à
 *   l'unité). La normalisation 1 ≤ a < 10 devient NÉCESSAIRE : la carte ne tient que sur sa décade ; sa case donne a ; le barreau est l'encadrement ; l'aimant est le rang de grandeur ; deux cartes se comparent
 *   par leurs barreaux d'abord. مبتدئ : c1 la منارة (265 م) · c2 un trajet de 1 950 000 م · c3 une feuille de cahier (0,0001 م, sur le bord GAUCHE du barreau −4) · c4 comparer 0,0006 م et 0,0001 م.
 *   متقدم (écritures non scientifiques, on écrit a et n avant de suspendre) : c5 1 200 km · c6 0,048 × 10⁻³ م · c7 12 742 km · c8 comparer 9,8 × 10⁻⁵ et 1,2 × 10⁻⁴.
 *   Rejetées : (a) l'activité 5-1 du manuel (16 384 × 31 250 à la calculatrice : lire la notation E) — c'est la lecture d'une machine, pas une idée (devient une ligne de la banque) ; (b) les trois
 *   élèves « 150 × 10⁶ / 15 × 10⁷ / 1,5 × 10⁸ : qui a raison ? » comme entrée — la même idée est VÉCUE dans le lab (la carte 35,2 × 10⁴ refuse le barreau 4) ; (c) l'ouverture de l'unité astronomique (non
 *   reprise : la plateforme a ses objets). Ordre des idées : barreau = encadrement → case = a → pourquoi 2,65 × 10² et non 26,5 × 10¹ (P1) → l'aimant = rang de grandeur (P3) → comparer deux cartes → معارف :
 *   « هل هي كتابة علمية ؟ » puis les quatre encadrés → طريقة : quatre méthodes (décimal ; k × 10ᵖ ; encadrement et rang ; calculer puis écrire) → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/kitaba-ilmiya-rutba';

export const LESSON_CONFIG = {
  id: 'kitaba-ilmiya-rutba',
  kind: 'lesson',
  unit: 'quwa-nisbiya',
  unitTitle: 'القوى ذات أسس نسبية صحيحة',
  sequentialUnlock: true,
  title: 'الكتابة العلمية ورتبة القدر',
  description: 'جدار معرض العلوم عليه سلّم من درجات، كل درجة تبدأ عند قوة للعدد 10 وتنتهي عند القوة الموالية: نعلّق بطاقات أطوال على درجاتها وفي خانتها فنكتشف الكتابة العلمية $a \\times 10^n$ والحصر بين قوتين متتاليتين للعدد 10 ورتبة القدر، ونقارن بها مقادير كبيرة جدًا وصغيرة جدًا.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🪜',
  estimatedDurationMin: 87,
  textbookRef: { unit: 3, activity: 5, pages: '41, 44, 45, 47, 48, 49, 50, 51' },
  skills: [
    'تعيين الكتابة العلمية لعدد عشري: $a \\times 10^n$ حيث $1 \\le a < 10$ و $n$ عدد صحيح نسبي، انطلاقًا من كتابته العشرية أو من كتابة مثل $35{,}2 \\times 10^4$ أو من نتيجة حساب بقوى العدد 10',
    'حصر عدد عشري موجب بين قوتين متتاليتين للعدد 10 انطلاقًا من كتابته العلمية: $10^n \\le A < 10^{n+1}$',
    'إعطاء رتبة قدر عدد موجب $a\' \\times 10^n$ حيث $a\'$ مدوّر $a$ إلى الوحدة، واستعمال الكتابة العلمية لمقارنة مقادير كبيرة جدًا أو صغيرة جدًا وترتيبها',
  ],
  teachingScope: {
    include: ['الكتابة العلمية $a \\times 10^n$ حيث $1 \\le a < 10$ لعدد عشري موجب (أو سالب بإشارته) انطلاقًا من كتابته العشرية أو من $k \\times 10^p$ أو من نتيجة حساب', 'الحصر $10^n \\le A < 10^{n+1}$ لعدد موجب', 'رتبة القدر $a\' \\times 10^n$ ($a\'$ مدوّر $a$ إلى الوحدة، و $a\' = 10$ تُكتب $1 \\times 10^{n+1}$)', 'مقارنة أعداد مكتوبة كتابة علمية وترتيبها'],
    exclude: ['قوى العدد 10 وتعريفها وكتابتها العشرية (درس «قوى العدد 10»)', 'القواعد الثلاث لحساب قوى العدد 10 (درس «قواعد الحساب على قوى العدد 10»)', 'قوة عدد غير 10 (درس «قوة عدد نسبي»)', 'رتبة المقدار لنتيجة حساب (السنة الأولى: تُذكَّر فقط)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'ألكوم سات 1',
    statement: 'يدور القمر الصناعي الجزائري «ألكوم سات 1» على ارتفاع حوالي $36\\,000\\ \\mathrm{km}$ فوق خط الاستواء، وتنتقل إشارته بسرعة حوالي $3 \\times 10^{8}\\ \\mathrm{m}$ في الثانية.',
    questions: [
      { label: '1)', text: 'اكتب هذا الارتفاع بالمتر كتابة علمية.' },
      { label: '2)', text: 'أعط حصرًا لهذا الارتفاع بين قوتين متتاليتين للعدد 10 .' },
      { label: '3)', text: 'كم ثانية تستغرق الإشارة لتنزل من القمر إلى الأرض؟' },
      { label: '4)', text: 'أعط رتبة قدر هذه المدّة.' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'ألكوم سات 1', lines: [{ label: 'الارتفاع', value: '36 000 كم' }] }, { title: 'الإشارة', lines: [{ label: 'السرعة', value: '3 × 10⁸ م/ث' }] }], ariaLabel: 'بطاقتان: القمر الصناعي ألكوم سات 1 على ارتفاع حوالي 36 000 كيلومتر، وإشارته تنتقل بسرعة حوالي 3 × 10⁸ متر في الثانية' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m1.r06` (رتبة المقدار, non publié), le مدوّر, `3am.m3.r03` (leçon `quwa-adad-ashara`) et `3am.m3.r02` (leçon `qawaid-quwa-ashara`).
  priorKnowledge: ['rutbat-miqdar', 'mudawwar', 'kitaba-quwa', 'qawaid-ashara'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `size-ladder` (la main tient la POSITION d'une carte : barreau, case, aimant), thème `fair-wall` :
    //   مبتدئ — c1 la منارة 265 م · c2 1 950 000 م · c3 0,0001 م · c4 comparer 0,0006 et 0,0001 ;
    //   متقدم — c5 1 200 km · c6 0,048 × 10⁻³ م · c7 12 742 km · c8 comparer 9,8 × 10⁻⁵ et 1,2 × 10⁻⁴ ; on écrit a et n avant de suspendre.
    {
      kind: 'manipulation', code: 'size-ladder-cards', type: 'size-ladder', module: 1,
      level: 'beginner',
      title: 'سلّم الأحجام: نعلّق البطاقات',
      objective: 'بطاقة طول تقف على الدرجة التي تحتويها وفي خانتها: الدرجة هي الحصر بين قوتين متتاليتين للعدد 10، والخانة هي العدد $a$ في الكتابة العلمية، والمغناطيس يعطي رتبة القدر، والأعلى درجة أكبر',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'fair-wall' },
      learningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'size-ladder-writings', type: 'size-ladder', module: 1,
      level: 'advanced',
      title: 'سلّم الأحجام: كتابات أخرى',
      objective: 'بطاقة طول تقف على الدرجة التي تحتويها وفي خانتها: الدرجة هي الحصر بين قوتين متتاليتين للعدد 10، والخانة هي العدد $a$ في الكتابة العلمية، والمغناطيس يعطي رتبة القدر، والأعلى درجة أكبر',
      autonomy: 'البطاقات مكتوبة بالكيلومتر أو بقوة للعدد 10 ، ويكتب التلميذ العدد $a$ والأسّ $n$ قبل أن يعلّق البطاقة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'fair-wall' },
      learningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P3'],
      sourceElementIds: ['act-5'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ألكوم سات 1', learningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — تحت المجهر', learningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — على منوال اختبار الفصل', learningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ رتبة المقدار، والمدوّر إلى الوحدة، وكتابة عدد بقوى العدد 10 ، وجداء قوتين.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — سلّم الأحجام', desc: 'نعلّق بطاقات أطوال على سلّم المعرض: على أيّ درجة؟ وفي أيّ خانة؟ وماذا يفعل المغناطيس؟ وأيّ البطاقتين أكبر؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — هل هي كتابة علمية؟', desc: 'نحكم على ست كتابات، ثم نسمّي الكتابة العلمية والحصر ورتبة القدر وقاعدة المقارنة.',
      stage: 'discovery', teachesLearningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — من عدد إلى كتابته العلمية', desc: 'نكتب عددًا عشريًا كتابة علمية، ثم $k \\times 10^p$ ، ثم نحصره ونعطي رتبة قدره، ثم نحسب ونكتب النتيجة.',
      stage: 'formalization', teachesLearningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'أتمّ المساواة، وأكتب الكتابة العلمية، وأحكم على مقارنات، وأرتّب أعدادًا، وأحسب ثم أكتب، وكمية حقيقية.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'],
      color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ألكوم سات 1', desc: 'مسألة الدرس: ارتفاع قمر صناعي بالمتر، وحصره، والزمن الذي تستغرقه إشارته، ورتبة قدره.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — تحت المجهر', desc: 'حبّة طلع وبكتيريا وفيروس: كتابتها العلمية وترتيبها وعدد البكتيريا في قطر حبّة الطلع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — على منوال اختبار الفصل', desc: 'عددان $A$ و $B$ : كتابتهما العلمية، وحصر $B$ ، ورتبة قدريهما ورتبة قدر جدائهما.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_kitaba-ilmiya-rutba_P1', '3am_kitaba-ilmiya-rutba_P2', '3am_kitaba-ilmiya-rutba_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
