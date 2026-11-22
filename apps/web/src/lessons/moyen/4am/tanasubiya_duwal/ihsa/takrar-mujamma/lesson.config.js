/**
 * الدرس 1 — التكرار المجمع والتواتر المجمع (الصاعد والنازل)
 * Unité 8 du manuel (4AM) « الإحصاء » : « أستعدّ » item 4 (p. 91), نشاط 1 et 2 (p. 92), معارف 1 et 2 (p. 94),
 * طرائق « حساب التكرار والتواتر المجمعين » + دوري الآن (p. 95), exercices 1–6 (p. 98) et 21 (p. 101),
 * QCM 1–2 (p. 100). Source de vérité : docs/sources/4am/unit8/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ           — les acquis : تكرار, تواتر, « على الأكثر / على الأقل », ترتيب تصاعدي ;
 *   M1 نشاط 1           — REAL (la file du manège / les 20 élèves) → DISCOVER → MANIPULATE (cumul-gate : la barre
 *                         de la toise, t compté des deux côtés, le tableau rempli par ses propres comptes),
 *                         puis les questions du نشاط 1 et le مخطط des âges ; la brique qui NOMME (les phrases du manuel) ;
 *   M2 معارف            — UNDERSTAND (معارف 1 : la somme des effectifs) → TOUCH THE MATH (نشاط 2 : ÷ 30, des fractions)
 *                         → FORMALIZE (معارف 2, « التواتر », ce que montrent les deux bouts des colonnes) ;
 *   M3 طرائق            — FORMALIZE (les deux طرائق du manuel : valeurs, puis فئات) + دوري الآن ;
 *   M4 أوظّف تعلّماتي   — AUTOMATIZE (ex-1, 2, 4, 5, 21) et TRANSFER (ex-3 accidents en %, ex-6 électricité) ;
 *   M5–M7 مسائل         — puis trois « مسائل » de la plateforme (modules 5–7) ;
 *   M8 إختبار أولي      — QCM 1–2 et quatre épreuves de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la toise du manège (labo `cumul-gate`, thème `funpark`, niveau مبتدئ par défaut : « يجب أن تكون قامتك 130cm على
 *   الأقل », 8 enfants) — la main déplace la toise et ANNONCE un nombre que la porte accepte ou refuse avec un témoin : « على الأقل » et
 *   « على الأكثر » se vivent avant de se nommer (resource `platform_designed_entry`). Rejetée : le نشاط 1 du manuel lu comme une page
 *   (la liste de 20 valeurs, « rangez-les », « combien ≥ 159 ? ») : il reste le niveau متقدم du MÊME labo (les 20 élèves, le tableau
 *   rempli par les annonces) et les questions des étapes 1–4, désormais posées APRÈS les annonces de l'élève.
 *   Ordre des idées : annonces à la porte → l'ordre croissant → 159 « au moins » / 160 « au plus » → les deux tableaux, puis les phrases
 *   du manuel qui nomment (brique APRÈS) → le مخطط des âges (même idée sans personnes). Module 3 : « hisab-mujamma » et « tawatur-fiat »
 *   APRÈS la réponse. Modules 2 et 4 : déjà conformes (PredictRule avant les boîtes ; rappels de briques déjà nommées), laissés tels quels.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/takrar-mujamma';

export const LESSON_CONFIG = {
  id: 'takrar-mujamma',
  kind: 'lesson',
  unit: 'ihsa',
  unitTitle: 'الإحصاء',
  sequentialUnlock: true,
  title: 'التكرار المجمع والتواتر المجمع (الصاعد والنازل)',
  description: 'مدخل الوحدة: قامات التلاميذ وعلاماتهم تقود إلى التكرار المجمع الصاعد والنازل لقيمة أو لفئة، ثم إلى التكرار النسبي المجمع (التواتر المجمع الصاعد والنازل)، وتنظيم المعطيات في جداول تكرارية مجمعة وقراءتها وتفسيرها.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📶',
  estimatedDurationMin: 50,
  textbookRef: { unit: 8, activity: 1, pages: '91, 92, 94, 95, 98, 100, 101' },
  skills: [
    'حساب التكرار المجمع الصاعد والتكرار المجمع النازل لقيمة من سلسلة إحصائية',
    'حساب التواتر المجمع الصاعد والنازل لقيمة أو لفئة',
    'تنظيم المعطيات في جدول تكرارات مجمعة وقراءته وتفسيره («على الأكثر»، «على الأقل»)',
  ],
  teachingScope: {
    include: [
      'نشاط 1: قامات 20 تلميذا — «159cm على الأقل» و«160cm على الأكثر»، جدولا الصاعد والنازل، ومخطط الأعمار',
      'نشاط 2: علامات 30 تلميذا — التكرار النسبي المجمع الصاعد والنازل',
      'تعريفا التكرار المجمع الصاعد والنازل (معارف 1) والتكرار النسبي المجمع = التواتر المجمع (معارف 2)',
      'طريقتا الحساب لقيمة ولفئة (طرائق، الزلازل والعمال) ودوري الآن',
    ],
    exclude: [
      'المدى والوسيط والمتوسط (الدرس 2)',
      'المجدولات وتمثيل السلسلة بمخطط في الإكسال (الدرس 3، ومنه السؤال هـ من التمرين 1)',
      'تفسير المؤشرات ومقارنة السلاسل (الدرس 4)',
    ],
  },
  // « مسألة الدرس » (déploiement des مسائل, 2026-10-06) : montrée dès le sommaire, rappelée au module 1,
  // résolue pas à pas au module 5 (content/problems.js). Prolonge le niveau متقدم de la toise : des
  // قامات devant deux seuils, « على الأقل » et « على الأكثر », d'autres nombres.
  lessonProblem: {
    module: 5,
    title: 'حديقة التسلية: قامات 25 طفلًا أمام لعبتين',
    statement: 'نظّم مخيّم صيفي رحلة إلى حديقة التسلية لـ 25 طفلًا، يرافقهم 3 مؤطّرين يحرصون على سلامتهم. انطلقت الحافلة على الساعة 8 صباحًا بدقّة، احترامًا للوقت. عند المدخل قيست قامات الأطفال (بالسنتيمتر) ونُظّمت في الجدول المقابل. يشترط «المنزلق المائي» قامة 140cm على الأقل، أمّا «القطار الصغير» فمخصّص للأطفال الذين قامتهم 135cm على الأكثر. ثمن تذكرة المنزلق 300 دج وثمن تذكرة القطار 150 دج، وقد خصّص المخيّم 6500 دج لتذاكر اللعبتين.',
    // Le support de la مسألة 1, montré aussi par la carte « مسألة الدرس » (une seule source).
    table: {
      head: ['القامة (cm)', '130', '135', '140', '145', '150'],
      rows: [['عدد الأطفال', '2', '4', '7', '8', '4']],
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (années antérieures) : le تكرار d'une valeur, le تواتر (= التكرار
  // النسبي), « على الأكثر / على الأقل », le ترتيب تصاعدي.
  priorKnowledge: ['takrar-qima', 'tawatur-nisbi', 'ala-aqal-akthar', 'tartib-tasaudi'],
  resources: [
    // Le module 1 ouvre sur LA TOISE DU MANÈGE (cumul-gate). متقدم (ouvert par défaut : le نشاط 1 du manuel) :
    // les 20 élèves dans l'ordre du manuel, le tableau des questions 4–5 ; مبتدئ : la file d'un manège.
    {
      kind: 'manipulation', code: 'cumul-gate-funpark-8', type: 'cumul-gate', module: 1,
      level: 'beginner',
      title: 'طابور اللعبة: 130cm على الأقل',
      objective: 'التكرار المجمع الصاعد لقيمة t هو عدد القيم الأصغر من أو تساوي t، والنازل عدد القيم الأكبر من أو تساوي t؛ والقيمة t تُعدّ في الجهتين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'funpark' },
      learningPointIds: ['4am_takrar-mujamma_P1'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'cumul-gate-act1-20', type: 'cumul-gate', module: 1,
      level: 'advanced',
      title: 'نشاط 1: قامات 20 تلميذا',
      objective: 'التكرار المجمع الصاعد لقيمة t هو عدد القيم الأصغر من أو تساوي t، والنازل عدد القيم الأكبر من أو تساوي t؛ والقيمة t تُعدّ في الجهتين',
      autonomy: 'عشرون تلميذا في ترتيب الكتاب (غير مرتّبين): التلميذ يقرّر بنفسه أن يرتّبهم، ويختار الشرط والقيمة t، ويعلن العدد دون أي اقتراح؛ كل عدد صحيح يملأ خانة من جدول الكتاب، والخطأ يُرفض بشاهد (المنسيّون الذين قامتهم t بالضبط، أو غير المضائين)',
      experience: { type: 'textbook', reason: '', theme: 'school' },
      learningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P3'],
      sourceElementIds: ['act-1'],
    },
    // Les trois « مسائل » (track: 'problem') : situations de la plateforme, résolues pas à pas.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حديقة التسلية: المنزلق والقطار', learningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — نادي الجيدو: أعمار 40 منخرطًا', learningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — مزرعة الدلاع: أوزان 200 حبّة في فئات', learningPointIds: ['4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'خمس عبارات: تكرار قيمة، التواتر، «على الأكثر / على الأقل»، والترتيب التصاعدي. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 1 — بوابة القامة', desc: 'حرّك شريط المقياس وأعلن كم تلميذا قامته t على الأكثر أو على الأقل، ثم أسئلة النشاط: الترتيب، 159cm على الأقل، 160cm على الأكثر، الجدولان، ومخطط الأعمار.',
      stage: 'trigger', teachesLearningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'أجرّب البوابة' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — التكرار والتواتر المجمعان', desc: 'تعريفا التكرار المجمع الصاعد والنازل، نشاط 2 (علامات 30 تلميذا مقسومة على 30)، التواتر المجمع، وما نقرؤه في طرفي الجدول.',
      stage: 'discovery', teachesLearningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — الحساب لقيمة ولفئة', desc: 'الزلازل (لكل قيمة) والعمال (لكل فئة، مدرّج تكراري)، ثم دوري الآن.',
      stage: 'formalization', teachesLearningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 1 إلى 6 و 21: درجات الحرارة، العلامات، حوادث المرور، القامات، مدة التنقل، استهلاك الكهرباء.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert ; jamais de preuve de maîtrise (MASAIL_GENERATION_GUIDE.md).
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حديقة التسلية', desc: 'مسألة الدرس: قامات 25 طفلًا أمام المنزلق والقطار — كم طفلًا يركب كل لعبة، بأيّ نسبة، وهل تكفي ميزانية التذاكر؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — نادي الجيدو', desc: 'أعمار 40 منخرطًا: المشاركون في بطولة الأشبال ونسبتهم، خطأ في جدول الأمين، والموسم القادم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_takrar-mujamma_P1', '4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — مزرعة الدلاع', desc: 'أوزان 200 حبّة دلاع في فئات: التواتر المجمع بنسبة مئوية، ادّعاء عامل، ومدخول الفلاح.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_takrar-mujamma_P2', '4am_takrar-mujamma_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'ستة أسئلة تُقيّم الكفاءات الثلاث، منها السؤالان 1 و 2 من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
