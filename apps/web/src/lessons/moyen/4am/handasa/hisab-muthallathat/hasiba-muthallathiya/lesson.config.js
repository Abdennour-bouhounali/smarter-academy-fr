/**
 * الدرس 2 — استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية (الوحدة 10 « حساب المثلثات في المثلث القائم »)
 * Manuel (4AM) : « أستعدّ » 2–3 (p. 115, module 0), نشاط 4 (p. 117, module 1), معارف 3 (p. 120, module 2), exercices 3,
 * 7, 8, 11 et 23 (pp. 122–123, module 3). Le manuel n'a pas de طرائق pour cette leçon : les méthodes de la calculatrice
 * sont les deux exemples de معارف 3. Source de vérité : docs/sources/4am/unit10/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ          — l'arrondi d'un décimal (le manuel), l'arrondi et la troncature, les rapports de la leçon 1 ;
 *   M1 نشاط 4          — REAL (un drone filme la Corniche) → DISCOVER → MANIPULATE (trig-calculator : la calculatrice
 *                        démarre en R, le dessin contredit ; les touches inverses ; le trait de coupe de l'arrondi) ;
 *                        le tableau et les trois angles du نشاط répondus depuis les essais de l'élève ; deux briques ;
 *   M2 معارف 3         — UNDERSTAND (la programmation en degrés, l'exemple 1), TOUCH THE MATH (le piège R, l'angle
 *                        depuis un rapport : l'exemple 2 et sa coquille corrigée), FORMALIZE (l'arrondi, plateforme) ;
 *   M3 أوظّف تعلّماتي  — AUTOMATIZE (ex-3 mesure contre calculatrice, ex-7 le programme, ex-8, ex-11) et TRANSFER
 *                        (ex-23 : corriger ليلى et رضا) ;
 *   M4–M6 مسائل        — puis trois « مسائل » de la plateforme (modules 4–6) : le drone de la Corniche (مسألة الدرس),
 *                        la مئذنة du quartier, le pont sur l'oued — content/problems.js ;
 *   M7 إختبار أولي     — six épreuves de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la CALCULATRICE DU DRONE (trig-calculator, مبتدئ 30°/45°/60°) — la main appuie sur les touches et le dessin du
 *   drone CONTREDIT le premier résultat (mode R) : c'est là que « programmer en degrés » devient nécessaire (ajout déclaré de la
 *   plateforme, `platform_designed_entry`). Rejetée : le نشاط 4 comme entrée seule (un tableau de sept angles à remplir, puis
 *   trois angles : des touches sans enjeu) ; il reste le niveau متقدم du même labo, et ses réponses (tableau, angles) ne
 *   s'affichent qu'APRÈS la réponse. Ordre des idées : le labo seul (plus de carte `brief`, ni titre/lead du workspace ni du labo) →
 *   le tableau (cos 75°, la monotonie ; brique hasiba-nisba après) → l'angle depuis un rapport (brique hasiba-zawiya après) ;
 *   معارف : chaque étape pose d'abord SA question (la calculatrice en R, B depuis cos 0,8, l'arrondi de A) et seulement après
 *   l'encadré / l'exemple du manuel et la brique (barmaja-daraja, hasiba-zawiya, tadwir-dalaqa). Aucune destination du manuel n'a bougé.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/hasiba-muthallathiya';

export const LESSON_CONFIG = {
  id: 'hasiba-muthallathiya',
  kind: 'lesson',
  unit: 'hisab-muthallathat',
  unitTitle: 'حساب المثلثات في المثلث القائم',
  sequentialUnlock: true,
  title: 'استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية',
  description: 'حاسبة الدرون: الحاسبة المبرمجة بالدرجة تعطي قيمة مقربة لنسبة زاوية معلومة، واللمسات العكسية تعيّن قيس زاوية حادة من إحدى نسبها، ثم ندوّر النتيجة إلى الدقة المطلوبة.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧮',
  estimatedDurationMin: 45,
  textbookRef: { unit: 10, activity: 4, pages: '115, 117, 120, 122, 123' },
  skills: [
    'حساب النسب المثلثية لزاوية معلومة بالحاسبة المبرمجة بالدرجة',
    'تعيين قيس زاوية حادة من إحدى نسبها باللمسات العكسية',
    'تدوير نتيجة الحاسبة إلى الوحدة أو إلى الجزء من 10 أو من 100',
  ],
  teachingScope: {
    include: [
      'نشاط 4: جدول النسب المثلثية للزوايا 10° إلى 75° والزوايا الثلاث من نسبها بثلاث دقّات',
      'معارف 3: برمجة الحاسبة بالدرجة، المثال 1 (sin 54°، cos 54°، tan 54°) والمثال 2 (A ≈ 24°، B ≈ 17°)',
      'تدوير نتيجة الحاسبة والفرق بين المدوّر والقيمة المقربة بالنقصان',
      'تمارين الكتاب 3 و 7 و 8 و 11 و 23',
    ],
    exclude: [
      'تعريف النسب المثلثية والقيم المضبوطة (الدرس 1)',
      'العلاقات بين النسب المثلثية والإنشاءات الهندسية (الدرس 3)',
      'ترييض وضعيات وحساب أطوال غير مباشرة (الدرس 4)',
    ],
  },
  // « مسألة الدرس » (MASAIL_GENERATION_GUIDE.md) : le monde du lab متقدم (la calculatrice du drone qui filme la
  // Corniche : le faisceau DT, l'altitude DH, la distance au sol TH), d'autres nombres ; montrée au sommaire et au
  // module 1, résolue au module 4. Sa figure (triangle 36 / 48 / 60, droit en H) vit ICI : une seule source.
  lessonProblem: {
    module: 4,
    title: 'درون الكورنيش: زاوية الكاميرا وارتفاع الطيران',
    statement: 'في مهرجان خيري على الكورنيش لجمع التبرّعات لفائدة اليتامى، يتطوّع مصوّر بدرون $D$ لتصوير منصّة العرض $T$ على الأرض. الدرون ثابت فوق النقطة $H$ من الأرض على ارتفاع $DH = 36$ m، والمسافة الأفقية $TH = 48$ m، ومستشعر الكاميرا يقيس طول الشعاع $DT = 60$ m (في الشكل المقابل، المثلث $DHT$ قائم في $H$). بطارية الدرون تكفي 25 دقيقة من الطيران. الحاسبة مبرمجة بالدرجة إلا إذا قيل غير ذلك.',
    figure: {
      points: { T: [0, 0], H: [48, 0], D: [48, 36] },
      segments: [
        { from: 'T', to: 'H', label: '48 m' },
        { from: 'H', to: 'D', label: '36 m' },
        { from: 'T', to: 'D', label: '60 m', tone: 'amber' },
      ],
      rightAngles: [['T', 'H', 'D']],
      angles: [{ at: 'T', from: 'H', to: 'D', label: '?' }],
      ariaLabel: 'المثلث DHT قائم في H: الدرون D على ارتفاع DH يساوي 36 m فوق النقطة H، والمسافة الأفقية TH تساوي 48 m، وشعاع الكاميرا DT يساوي 60 m، والزاوية المطلوبة عند المنصّة T',
      maxWidth: 320,
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : l'arrondi d'un décimal, arrondi et valeur approchée par défaut, les
  // rapports trigonométriques (leçon 1).
  priorKnowledge: ['tadwir-adad', 'qima-muqarraba', 'nisba-muthallathiya'],
  resources: [
    // Le module 1 ouvre sur LA CALCULATRICE DU DRONE (trig-calculator). متقدم (ouvert par défaut : le نشاط 4) : le
    // tableau 10°…75° puis, ouverte par l'élève, l'étape des trois angles ; مبتدئ : trois angles remarquables.
    {
      kind: 'manipulation', code: 'trig-calculator-drone-30-45-60', type: 'trig-calculator', module: 1,
      level: 'beginner',
      title: 'حاسبة الدرون: 30° و 45° و 60°',
      objective: 'الحاسبة المبرمجة بالدرجة تعطي قيمة مقربة لنسبة زاوية معلومة، واللمسات العكسية تعطي قيس الزاوية من نسبتها، ثم ندوّر النتيجة حسب الدقة المطلوبة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'drone' },
      learningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P3'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'trig-calculator-act4', type: 'trig-calculator', module: 1,
      level: 'advanced',
      title: 'نشاط 4: الجدول من 10° إلى 75° ثم الزوايا من نسبها',
      objective: 'الحاسبة المبرمجة بالدرجة تعطي قيمة مقربة لنسبة زاوية معلومة، واللمسات العكسية تعطي قيس الزاوية من نسبتها، ثم ندوّر النتيجة حسب الدقة المطلوبة',
      autonomy: 'جدول الكتاب كاملا (سبع زوايا وثلاث نسب) دون أي زاوية مقترحة، ثم ينتقل التلميذ بنفسه إلى العكس: يختار اللمسة العكسية المناسبة لكل نسبة، ويدوّر الشاشة نفسها ثلاث مرات (إلى 1/100 وإلى 1/10 وإلى الوحدة)؛ نسيان 2nd أو اختيار الدالة الخطأ يُرفض',
      experience: { type: 'platform_adaptation', reason: 'improved_interactivity_and_age_appropriateness', theme: 'drone' },
      learningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'],
      sourceElementIds: ['act-4'],
    },
    // Modules 4–6 — les « مسائل » (content/problems.js) : exercices complets de type امتحان, ajouts de la plateforme.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — درون الكورنيش: زاوية الكاميرا وارتفاع الطيران', learningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — ارتفاع مئذنة مسجد الحيّ', learningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — جسر للراجلين فوق الوادي', learningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: تدوير عدد عشري، المدوّر والقيمة المقربة بالنقصان، والنسب المثلثية في مثلث قائم. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 4 — حاسبة الدرون', desc: 'اضغط بنفسك لمسات الحاسبة والدرون يصوّر بالزاوية التي تكتبها: أتمم جدول النسب، ثم جد الزاوية من نسبتها ودوّرها بثلاث دقّات.',
      stage: 'trigger', teachesLearningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أشغّل الحاسبة' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الحاسبة بالدرجة والتدوير', desc: 'برمجة الحاسبة بالدرجة، حساب نسب الزاوية 54°، تعيين زاوية من جيبها أو ظلها، وقاعدة التدوير.',
      stage: 'discovery', teachesLearningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 3 و 7 و 8 و 11 و 23: القياس والحاسبة، كتابة البرنامج، وتصويب أخطاء ليلى ورضا.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui reste toujours ouvert ; jamais de preuve de
    // maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — درون الكورنيش', desc: 'مسألة الدرس: زاوية الكاميرا من ظلها، ارتفاع جديد بحاسبة كانت بالراديان، وأكبر زاوية يسمح بها شرط البلدية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مئذنة مسجد الحيّ', desc: 'ارتفاع المئذنة من زاوية الارتفاع، «خطأ رياضي» على حاسبة سليم، وثمن سلسلة المصابيح.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — جسر فوق الوادي', desc: 'عرض الوادي من زاوية التسديد، التحقّق بقياس الليزر، وعدد وحدات الجسر وثمنها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_hasiba-muthallathiya_P1', '4am_hasiba-muthallathiya_P2', '4am_hasiba-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'ستة أسئلة تُقيّم الكفاءات الثلاث: النسبة بالحاسبة، الزاوية من نسبتها، والتدوير.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
