/**
 * الدرس — إنتاج عبارة حرفية واستعمالها (2AM, unité 4 « مفهوم معادلة »), la PREMIÈRE leçon de l'unité (aucun item du programme : `programmeItems: []`, décision D10), générée DANS son entrée du catalogue (même code), cycle moyen phase 3,
 * 2026-10-29. Manuel 2AM (الجيل الثاني, منشورات الشهاب) : نشاط 1 و 2 p. 56, معارف 1 و 2 p. 58, طرائق 1 و 2 p. 59, أوظّف pp. 62–63, أتعمّق p. 66.
 * Source de vérité : docs/sources/2am/unit4/extraction.json ; plan : docs/sources/2am/unit4/plan/ibara-harfiya-intaj.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter–§4quinquies) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « خلايا الشمع » — au منحل du grand-père, Yacine construit pour le salon des sciences un rang de cellules hexagonales en tiges de cire ; deux cellules voisines PARTAGENT une tige. La main tient n, le nombre de cellules
 *   (elle glisse des cellules du plateau, le cadre n'en tient que 8, le plateau 50 tiges) : le compteur dit 6, 11, 16… ; il faut une RÈGLE pour 40 cellules, donc une LETTRE. Une règle fausse (6n : les tiges partagées comptées deux fois ;
 *   5n : la première oubliée) est refutée par le DESSIN. متقدم : le compteur est caché jusqu'à ce que le nombre soit tapé, une bande de deux rangs (8n + 3), deux écritures du même décompte, puis deux lettres (n et m).
 *   Rejetées : (a) l'activité 1 du manuel (tables carrées jointes, figures données : la main ne fait rien) → application de أتمرّن ; (b) le تحدّي (pommiers en carrés et coupe-vent : son idée entre par le labo, son monde est celui du livre) ;
 *   (c) une machine à calcul (`linear-machine`, les programmes de l'unité 1) : elle produit une valeur, pas le besoin d'une lettre.
 *   Ordre des idées : construire 1, 2, 3 cellules → la règle avec une lettre (judgée sur CHAQUE rang) → la valeur pour 40 → deux écritures du même décompte → bande et deux lettres → معارف (l'expression littérale, les conventions, a², a³) →
 *   طريقة (en fonction de x, un contour compté de deux façons, un programme, simplifier) → pratique, trois مسائل, test.
 *
 * HISTOIRE DES الكفاءات (positions gardées : les identifiants sont positionnels) — brouillon → texte final :
 *   P1  « التعبير عن وضعية بعبارة حرفية يمثّل فيها حرف عددا مجهولا أو متغيّرا » → + GÉNÉRALISER un motif croissant (method-2, challenge, deep-47 : le labo) ;
 *   P2  « حساب قيمة عبارة حرفية ... (يدويا أو بجدول إكسل) » → « إكسل » devient « جدول » (la plateforme n'a pas de tableur pour les formules ; le labo a son tableau n / tiges) ; deux lettres (ex-17) ;
 *   P3  « تبسيط كتابة ... » → + a × b = b × a et la FACTORISATION k·a + m·a = (k + m)·a (know-2, ex-22), lue comme la distributivité de l'unité 1 (rappelée, avec lien).
 * Le réseau : AUCUN item (la leçon est « isolée ») : ni « راجع قبل أن تنطلق », ni lien du réseau, ni successeur. 1AM r08/r09 sont des leçons PRÉVUES (« تذكّر — السنة الأولى », sans lien).
 * Entre leçons de la MÊME année, sans lien du réseau : P1 ← 2am_wasf-silsila-hisab_P3 (programme → chaîne) et P3 ← 2am_tawzi-darb-jam-tarh_P3 (la distributivité à l'envers).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/ibara-harfiya-intaj';

export const LESSON_CONFIG = {
  id: 'ibara-harfiya-intaj',
  kind: 'lesson',
  unit: 'mafhum-muadala',
  unitTitle: 'مفهوم معادلة',
  sequentialUnlock: true,
  title: 'إنتاج عبارة حرفية واستعمالها',
  description: 'نبني صفًّا من خلايا الشمع في منحل الجدّ ونكتب عدد أعواده بحرف، ثم نحسب قيمة العبارة الحرفية ونبسّط كتابتها.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🐝',
  estimatedDurationMin: 67,
  textbookRef: { unit: 4, activity: 56, pages: '56, 58, 59' },
  skills: [
    'التعبير عن وضعية بعبارة حرفية يمثّل فيها حرف عددًا مجهولًا أو متغيّرًا، ومنها تعميم نمط متزايد، مثل محيط مربّع ضلعه $x$ : $4x$ ، وعدد الأعواد في صفّ من $n$ خلية: $5n+1$',
    'حساب قيمة عبارة حرفية بحرف أو بحرفين من أجل قيم معطاة باحترام أولوية العمليات، وتنظيم القيم في جدول، مثل قيمة $3x+4y+1$ من أجل $x=2$ و $y=3$',
    'تبسيط كتابة عبارة حرفية: حذف إشارة $\\times$ أمام حرف أو قوس ($7\\times a=7a$ ، $7\\times(a+1)=7(a+1)$)، واستعمال $1\\times a=a$ و $0\\times a=0$ و $a\\times b=b\\times a$ ، والكتابتين $a^2$ و $a^3$ ، وتجميع حدود مثل $2a+5a-3a=(2+5-3)a=4a$',
  ],
  teachingScope: {
    include: ['كتابة عبارة حرفية من وضعية أو من برنامج حساب أو بتعميم نمط متزايد', 'حساب قيمة عبارة بحرف أو بحرفين وتنظيمها في جدول', 'تبسيط الكتابة: حذف ×، $1\\times a$ ، $0\\times a$ ، $a\\times b=b\\times a$ ، $a^2$ ، $a^3$ ، $ka+ma=(k+m)a$'],
    exclude: ['حلّ معادلة (الدرس: حلّ مشكل باستعمال معادلة)', 'اختبار مساواة أو متباينة وإثبات التساوي (الدرس: اختبار صحة مساواة أو متباينة)', 'نشر جداء قوسين (السنة الثالثة)', 'حذف أقواس مسبوقة بإشارة $-$ (السنة الثالثة)', 'الأعداد السالبة'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'بطاقة المسبح البلدي',
    statement: 'يدفع المشترك في المسبح البلدي $1500$ DA للتسجيل السنوي و $120$ DA لكلّ حصّة.',
    questions: [
      { label: '1)', text: 'عبّر بدلالة عدد الحصص $x$ عن المبلغ الذي يدفعه المشترك.' },
      { label: '2)', text: 'احسب المبلغ من أجل $10$ حصص ثم $25$ حصّة ثم $50$ حصّة.' },
      { label: '3)', text: 'أكمل جدول القيم من أجل $x=0$ و $x=1$ و $x=2$ .' },
      { label: '4)', text: 'ماذا يمثّل العدد $1500$ في جدول القيم؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'التسجيل السنوي', icon: 'coin', lines: [{ label: 'يُدفع مرّة واحدة', value: '1500', unit: 'DA' }] }, { title: 'الحصّة', icon: 'coin', lines: [{ label: 'لكلّ حصّة', value: '120', unit: 'DA' }] }], ariaLabel: 'بطاقتان: التسجيل السنوي ألف وخمسمئة دينار ومئة وعشرون دينارًا لكلّ حصّة' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les chaînes (unité 1 : `silsila-bidun-aqwas`, `silsila-bi-aqwas` — items 1 à 3), la dernière opération (`wasf-silsila-hisab`, item 4), la distributivité (`tawzi-darb-jam-tarh`, item 5) et « مجموع a و b » (1AM r09, leçon PRÉVUE, item 6).
  priorKnowledge: ['silsila-bidun-aqwas-2am', 'silsila-bi-aqwas-2am', 'wasf-silsila-hisab-2am', 'tawzi-darb-jam-tarh-2am', 'ibara-harfiya-1am'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `wax-cells` (la main tient n, le nombre de cellules du rang, puis écrit la règle) :
    //   مبتدئ — w1 construire 1, 2, 3 (6, 11, 16) · w2 la règle 5n + 1 · w3 la valeur de 40 cellules (201).
    //   متقدم — le compteur est CACHÉ jusqu'à ce que le nombre soit tapé : a1 la bande de deux rangs (8n + 3) · a2 deux écritures du même décompte · a3 deux lettres (n et m : 5n + 1 + 8m + 3 ; n = 6, m = 4 : 66).
    {
      kind: 'manipulation', code: 'wax-cells-build', type: 'wax-cells', module: 1,
      level: 'beginner',
      title: 'خلايا الشمع: أبني صفًّا ثم أكتب القاعدة',
      objective: 'نكتشف أنّ حرفًا واحدًا يعدّ ما لا نستطيع رسمه: الخلية الأولى تحتاج ستّة أعواد وكلّ خلية بعدها تضيف خمسة لأنّها تشترك في عود، فنكتب القاعدة بالحرف',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'apiary' },
      learningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2'],
      sourceElementIds: ['challenge'],
    },
    {
      kind: 'manipulation', code: 'wax-cells-predict', type: 'wax-cells', module: 1,
      level: 'advanced',
      title: 'خلايا الشمع: أتوقّع ثم أتأكّد',
      objective: 'نكتشف أنّ حرفًا واحدًا يعدّ ما لا نستطيع رسمه: الخلية الأولى تحتاج ستّة أعواد وكلّ خلية بعدها تضيف خمسة لأنّها تشترك في عود، فنكتب القاعدة بالحرف',
      autonomy: 'يكتب التلميذ عدد الأعواد قبل أن يظهر على اللوح، ثم يكتب قاعدة شريط من صفّين، ويقارن كتابتين للعدد نفسه، ويستعمل حرفين',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'apiary' },
      learningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2'],
      sourceElementIds: ['method-2'],
    },
    {
      kind: 'manipulation', code: 'wax-cells-maarif', type: 'wax-cells', module: 2,
      title: 'خلايا الشمع: القاعدة بالحرف n',
      objective: 'نكتشف أنّ حرفًا واحدًا يعدّ ما لا نستطيع رسمه: الخلية الأولى تحتاج ستّة أعواد وكلّ خلية بعدها تضيف خمسة لأنّها تشترك في عود، فنكتب القاعدة بالحرف',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'apiary' },
      learningPointIds: ['2am_ibara-harfiya-intaj_P1'],
      sourceElementIds: ['know-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — بطاقة المسبح البلدي', learningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حبل حديقة المدرسة', learningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — برنامج الساحر', learningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ سلاسل العمليات، وآخر عملية، والخاصية التوزيعية، ومجموع عددين.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — خلايا الشمع', desc: 'ابنِ صفًّا من خلايا الشمع واكتب عدد أعواده بحرف: ماذا يقول الصفّ لأربعين خلية؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 20, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — العبارة الحرفية', desc: 'تعريف العبارة الحرفية، وحذف إشارة الضرب، والمربّع والمكعّب.',
      stage: 'discovery', teachesLearningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2', '2am_ibara-harfiya-intaj_P3'],
      color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أكتب وأبسّط', desc: 'من الكلمات إلى الحرف، وتعميم نمط، وبرنامج حساب، وتبسيط الكتابة.',
      stage: 'formalization', teachesLearningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ستة تمارين: كراسي المطعم، وعبارات في n، وتعليمة لقائمة حسابات، ومحيطات، وقيم عبارات، وتبسيط.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2', '2am_ibara-harfiya-intaj_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — بطاقة المسبح البلدي', desc: 'مسألة الدرس: جزء ثابت وجزء لكلّ حصّة وجدول قيم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — حبل حديقة المدرسة', desc: 'بُعدان لمستطيل من حبل طوله 24 م: أحدهما بدلالة الآخر ومساحته.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P2'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — برنامج الساحر', desc: 'برنامج حساب يعطي النتيجة نفسها دائمًا: نكتبه بعبارة ونبسّطها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_ibara-harfiya-intaj_P1', '2am_ibara-harfiya-intaj_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
