/**
 * الدرس — مقارنة عددين ناطقين (3AM, unité 4 « الحساب الحرفي »). Le QUATRIÈME درس de l'unité, généré DANS son entrée du catalogue (item 3am.m5.r04), cycle moyen phase 3,
 * Phase 0 « priorité du propriétaire » (#16, 2026-10-26). Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 5 p. 57, معارف 5 p. 60, طريقة 5 p. 61, دوري الآن ② p. 61,
 * تمارين 27–32 p. 64, أؤكّد 9–10 p. 65, أتعمّق 38 p. 66. Source : docs/sources/3am/unit4/extraction.json ; plan : docs/sources/3am/unit4/plan/muqaranat-natiqayn.md.
 * FRONTIÈRE (écrite dans build-extraction.py) : cette leçon compare par le SIGNE D'UNE DIFFÉRENCE (a > b ⟺ a − b > 0, l'ordre lu sur la différence seule, deux rationnels, des quotients
 * décimaux, un multiple de π, deux expressions dont le A − B simplifié se lit directement : constante, x − c, c − x). Elle ne refait pas la comparaison de deux fractions par dénominateur commun ni par
 * produits en croix (unité 2, `tasawi-muqaranat-kasrayn`, item 3am.m1.r05 — recalled in one « تذكّر » box), n'additionne, ne soustrait, ne multiplie ni ne divise JAMAIS les deux membres d'une
 * inégalité (unité 5 `mutabayinat-amaliyat`, 4AM) ; la valeur d'une expression (`qimat-ibara-harfiya`), simplifier (`tabsit-hadhf-aqwas`) et développer (`nashr-jabri-3am`) sont des OUTILS déjà publiés.
 * Le réseau : son seul lien « راجع » — 3am.m1.r05 (مقارنة كسرين, leçon publiée `tasawi-muqaranat-kasrayn`, lien `consolidates`) — est mesuré par « أستعدّ » ; la différence de deux fractions
 * (`jam-tarh-kasrayn`), l'ordre des relatifs (`muqarana-nisbiya`, 2AM) et la réduction d'une expression (`tabsit-hadhf-aqwas`) y sont mesurés hors réseau.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre.
 *   Entrée retenue : le GALVANOMÈTRE du labo de physique (labo `difference-meter`, thème `physicslab`). Sur une rail de verre graduée comme une droite, deux perles portent a et b ; un
 *   galvanomètre à aiguille a DEUX sondes et lit « rouge MOINS noir ». La main BRANCHE chaque sonde sur une perle — elle décide QUEL nombre est soustrait — et lit UNE aiguille : à droite, à gauche ou sur
 *   zéro. Sur des perles visibles (مبتدئ) le côté de l'aiguille suit toujours l'ordre ; « بدّل المجسّين » fait traverser l'aiguille sans changer la carte juste ; −3/2 et −1/2 montrent que le plus éloigné
 *   de zéro n'est pas le plus grand ; deux perles à 0,85 px l'une de l'autre (9/11 et 13/16) se recouvrent mais l'aiguille tranche. متقدم : un VOLET couvre l'aiguille tant que la différence n'est pas ÉCRITE ;
 *   un RIDEAU cache les perles : seule la lecture « a − b = −0,3 » est donnée, et elle suffit. Monde `race` (طريقة) : les perles sont A(x) et B(x), la main tient x, l'aiguille lit A − B et traverse zéro
 *   où les perles se croisent ; la main simplifie A − B puis remplit une carte d'ordre par région de x.
 *   Rejetées : (a) le نشاط 5 du manuel comme entrée (cinq paires bien écartées sur une droite : l'œil ordonne, la différence est redondante — le tableau devient une APPLICATION, E1, avec d'autres paires) ;
 *   (b) comparer par dénominateur commun (c'est la méthode de l'unité 2, déjà consolidée) ; (c) un tableau de signes sans geste. Ordre des idées : le côté de l'aiguille suit l'ordre, l'échange ne le
 *   change pas, le plus éloigné de zéro n'est pas le plus grand (P1) → des perles que l'œil ne sépare pas (P2) → متقدم : écrire la différence avant l'aiguille, ordonner à partir de la différence seule
 *   (P1, P2) → معارف : « معناه », les trois cas, la conclusion écrite → طريقة : deux expressions avec x sous la main (P3) → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/muqaranat-natiqayn';

export const LESSON_CONFIG = {
  id: 'muqaranat-natiqayn',
  kind: 'lesson',
  unit: 'ibarat-harfiya-3',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  title: 'مقارنة عددين ناطقين',
  description: 'على سكّة مختبر الفيزياء نصل مجسّين بحبّتين فيقرأ المقياس الفرق بينهما، فنكتشف أنّ جهة الإبرة تدلّ على الأكبر، وأنّ الفرق وحده يكفي لنعرف الترتيب، ثم نقارن عبارتين حرفيتين بتبسيط فرقهما وقراءة إشارته.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 88,
  textbookRef: { unit: 4, activity: 5, pages: '57, 60, 61, 64, 65, 66' },
  skills: [
    'الربط بين ترتيب عددين وإشارة فرقهما: $a>b$ معناه $a-b>0$ ، و $a<b$ معناه $a-b<0$ ، و $a=b$ معناه $a-b=0$ ، ومعرفة الترتيب من الفرق وحده',
    'مقارنة عددين ناطقين (موجبين أو سالبين، بكتابة كسرية أو عشرية) بحساب فرقهما وتعيين إشارته',
    'مقارنة عبارتين حرفيتين بتبسيط فرقهما وتعيين إشارته حسب قيم $x$ ، مثل $A-B=x-4$ موجب عندما $x>4$',
  ],
  teachingScope: {
    include: ['الربط بين الترتيب وإشارة الفرق في حالاته الثلاث', 'معرفة الترتيب من الفرق وحده', 'مقارنة عددين ناطقين بحساب الفرق (كسور، أعداد سالبة، أعداد عشرية بالآلة الحاسبة، مضاعفات $\\pi$)', 'مقارنة عبارتين حرفيتين بتبسيط $A-B$ وقراءة إشارته حسب $x$'],
    exclude: ['مقارنة كسرين بتوحيد المقام أو بالجداءين المتصالبين (الوحدة الثانية)', 'العمليات على المتباينات: إضافة عدد إلى طرفي متباينة أو ضربهما أو القسمة (الوحدة الخامسة)', 'حلّ المتراجحات (4 متوسط)', 'الرمز $A(-3)$ والدوال (4 متوسط)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — la مسابقة de deux classes.
  lessonProblem: {
    module: 5,
    title: 'مسابقة القسمين',
    statement: 'في مسابقة الرياضيات بالمتوسطة أجاب 25 تلميذًا من 31 في القسم الأول إجابة صحيحة عن السؤال الأخير، وأجاب 29 تلميذًا من 36 في القسم الثاني إجابة صحيحة.',
    questions: [
      { label: '1)', text: 'اكتب نسبة الإجابات الصحيحة في كل قسم.' },
      { label: '2)', text: 'احسب الفرق بين النسبتين (الأولى ناقص الثانية).' },
      { label: '3)', text: 'أيّ القسمين أحسن نتيجة؟' },
      { label: '4)', text: 'قالت المعلّمة إنّ الفرق صغير جدًّا: هل كان النظر إلى الكسرين يكفي؟' },
    ],
    illustration: { kind: 'tags', cards: [
      { title: 'القسم الأول', lines: [{ label: 'إجابات صحيحة', value: '25' }, { label: 'عدد التلاميذ', value: '31' }] },
      { title: 'القسم الثاني', lines: [{ label: 'إجابات صحيحة', value: '29' }, { label: 'عدد التلاميذ', value: '36' }] },
    ], ariaLabel: 'القسم الأول: 25 إجابة صحيحة من 31 تلميذًا، والقسم الثاني: 29 إجابة صحيحة من 36 تلميذًا' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (la comparaison de deux fractions, `tasawi-muqaranat-kasrayn`) et, hors réseau, la différence de deux fractions,
  // l'ordre des relatifs de 2AM et la réduction d'une expression.
  priorKnowledge: ['tasawi-muqaranat-kasrayn-3am', 'jam-tarh-kasrayn-3am', 'muqarana-nisbiya-2am', 'tabsit-hadhf-aqwas-3am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `difference-meter` (la main branche les sondes et lit l'aiguille), thème `physicslab` :
    //   مبتدئ — d1 5/4 et 3/4, d2 −3/2 et −1/2 (échange exigé), d3 9/11 et 13/16 (0,85 px) ; متقدم — volet d'écriture (d4 17/12 et 10/7, d5 −7/6 et −9/8), d6 le rideau (a − b = −0,3).
    {
      kind: 'manipulation', code: 'difference-meter-simple', type: 'difference-meter', module: 1,
      level: 'beginner',
      title: 'مقياس الفرق: جهة الإبرة',
      objective: 'نقرأ إشارة الفرق على المقياس فنعرف أيّ العددين أكبر',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'physicslab' },
      learningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P2'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'difference-meter-advanced', type: 'difference-meter', module: 1,
      level: 'advanced',
      title: 'مقياس الفرق: الغطاء والستارة',
      objective: 'نقرأ إشارة الفرق على المقياس فنعرف أيّ العددين أكبر',
      autonomy: 'يكتب التلميذ الفرق قبل أن يُرفع الغطاء عن الإبرة، ويرتّب عددين لا يراهما من فرقهما وحده',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'physicslab' },
      learningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P2'],
      sourceElementIds: ['ex-27'],
    },
    // Module 3 — le MÊME labo, monde `race`, posé seul (`levels={false}`) : deux expressions de x, A − B simplifiée, une carte d'ordre par région.
    {
      kind: 'manipulation', code: 'difference-meter-race', type: 'difference-meter', module: 3,
      title: 'مقياس الفرق: حبّتان تتحرّكان مع x',
      learningPointIds: ['3am_muqaranat-natiqayn_P3', '3am_muqaranat-natiqayn_P1'],
      sourceElementIds: ['method-5'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — مسابقة القسمين', learningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P2'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — حافلة الرحلة', learningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — قنّينتا العصير', learningPointIds: ['3am_muqaranat-natiqayn_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ مقارنة كسرين، فرق كسرين، ترتيب عددين سالبين، تبسيط عبارة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مقياس الفرق', desc: 'نصل مجسّين بحبّتين على سكّة المختبر ونقرأ إبرة المقياس، ثم نختار بطاقة الترتيب.',
      stage: 'trigger', teachesLearningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الفرق يرتّب', desc: 'العلاقة بين الترتيب وإشارة الفرق في حالاتها الثلاث، وكيف نستعملها لنقارن عددين.',
      stage: 'discovery', teachesLearningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحسب الفرق وأقرأ إشارته', desc: 'نقارن عددين ناطقين بحساب فرقهما، ثم عبارتين حرفيتين بتبسيط فرقهما وقراءة إشارته حسب قيم x.',
      stage: 'formalization', teachesLearningPointIds: ['3am_muqaranat-natiqayn_P2', '3am_muqaranat-natiqayn_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'أزواج لا تفصلها العين، الترتيب من الفرق وحده، أعداد سالبة وعشرية، العدد π، عبارتان في x، محيطان ومساحتان.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P2', '3am_muqaranat-natiqayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — مسابقة القسمين', desc: 'مسألة الدرس: نسبتان قريبتان جدًّا، فرقهما، وأيّ القسمين أحسن.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — حافلة الرحلة', desc: 'ثمنا حافلتين بدلالة المسافة: نبسّط الفرق ونقرأ إشارته لنعرف متى تكون الأولى أرخص.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_muqaranat-natiqayn_P1', '3am_muqaranat-natiqayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — قنّينتا العصير', desc: 'ثمنا اللتر في قنّينتين: الفرق، الأرخص، وهل يستحقّ الفرق عناء الاختيار.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_muqaranat-natiqayn_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
