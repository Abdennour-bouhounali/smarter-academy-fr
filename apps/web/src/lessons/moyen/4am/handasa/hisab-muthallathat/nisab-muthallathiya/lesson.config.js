/**
 * الدرس 1 — النسب المثلثية لزاوية حادة في مثلث قائم (مدخل الوحدة 10 « حساب المثلثات في المثلث القائم »)
 * Manuel (4AM) : « أستعدّ » 1, 4–6 (p. 115, module 0), نشاط 1 et 2 (p. 116, module 1), نشاط 3, معارف 1 et 2 et
 * l'encadré « نصير الدين الطوسي » (doublon, les noms) (pp. 115–118, module 2), طرائق sin / cos / tan + دوري الآن (p. 119,
 * module 3), exercices 1, 2, 4, 5, 6, 9, 10, 12, 14, 15 (pp. 122–123, module 4), QCM 1–5 (p. 124, doublon, module 8).
 * Source de vérité : docs/sources/4am/unit10/extraction.json.
 *
 * LE PARCOURS (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   M0 أستعدّ          — la somme des angles, l'hypoténuse, côtés opposé / adjacent, le cosinus de 3AM, Pythagore, Thalès ;
 *   M1 نشاط 1 و 2      — REAL (les rampes du skatepark) → DISCOVER → MANIPULATE (ramp-ratios : nommer les côtés,
 *                        composer cos / sin / tan, lever la rampe ; trois rampes à 40° puis un autre angle) ; les
 *                        questions des نشاط 1 et 2 répondues depuis les lectures de l'élève, la preuve par Thalès ;
 *   M2 معارف           — UNDERSTAND (نشاط 3 : compléter avec les mots), FORMALIZE (معارف 1–2 avec WordFraction, la
 *                        coquille de معارف 2 corrigée), TOUCH THE MATH (valeur exacte / approchée, 0 < sin, cos < 1) ;
 *   M3 طرائق           — FORMALIZE (les trois longueurs révélées ligne à ligne, les touches en code LTR) + دوري الآن ;
 *   M4 أوظّف تعلّماتي  — AUTOMATIZE (ex-1, 2, 4, 5, 6, 9, 12) et TRANSFER (ex-10 l'impossible 1,5 ; ex-14 la preuve ;
 *                        ex-15 le bon rapport) ;
 *   M5–M7 مسائل        — puis trois « مسائل » de la plateforme (modules 5–7) : les trois rampes du skatepark (مسألة الدرس), la rampe d'accès d'une متوسطة, le toit d'une maison ;
 *   M8 إختبار أولي     — QCM 1–5 et une épreuve de la plateforme ; P1, P2, P3 couverts.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la rampe du skatepark du niveau مبتدئ (labo `ramp-ratios`, mode « name », 30° et planche de 4 m) — la main
 *   lève la rampe, doit NOMMER les côtés avant de pouvoir composer cos / sin / tan, et voit les nombres bouger : le besoin des mots
 *   précède les mots. Le labo ouvre le module sans carte ni titre (contexte dans son `lead`). Rejetée : la page du نشاط 1 telle quelle
 *   (une figure à 25° et quatre phrases à compléter de mémoire : un test, pas une découverte) ; elle devient l'application « dans le
 *   triangle du livre » des étapes 1–3, APRÈS les lectures de l'élève. Le نشاط 2 reste le niveau متقدم (ses 3 rampes à 40°).
 *   Ordre des idées : nommer et composer (labo) → transporter au triangle du livre (cos 25°, cos B̂) → ce que l'élève a lu (valeurs
 *   arrondies, brique cos-nashat) → conjecture sur ses 3 rampes → preuve par Thalès → brique nisab-zawiya. Module 2 : chaque
 *   question (sin P̂, tan R̂ sur PQR) AVANT sa définition ; l'encadré Tusi / brique rappel, la brique jayb + exemple EFG, la brique
 *   thill + remarques + qiyam-madbuta viennent APRÈS la réponse. Modules 3–8 : déjà conformes (révélation ligne à ligne, bricks
 *   gated), inchangés.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/nisab-muthallathiya';

export const LESSON_CONFIG = {
  id: 'nisab-muthallathiya',
  kind: 'lesson',
  unit: 'hisab-muthallathat',
  unitTitle: 'حساب المثلثات في المثلث القائم',
  sequentialUnlock: true,
  title: 'النسب المثلثية لزاوية حادة في مثلث قائم',
  description: 'مدخل الوحدة: منحدرات حديقة التزلج تقود إلى جيب التمام والجيب والظل لزاوية حادة في مثلث قائم، نسبٌ بين أطوال الأضلاع لا تتعلق إلا بقيس الزاوية، والجيب وجيب التمام محصوران بين 0 و 1، ثم نوظّفها لحساب أطوال مجهولة.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🛹',
  estimatedDurationMin: 55,
  textbookRef: { unit: 10, activity: 1, pages: '115, 116, 118, 119, 122, 123, 124' },
  skills: [
    'تسمية الوتر والضلعين المقابل والمجاور بالنسبة إلى زاوية حادة، وكتابة جيب التمام والجيب والظل',
    'إدراك أن الجيب وجيب التمام لزاوية حادة عددان محصوران تماما بين 0 و 1',
    'حساب طول ضلع في مثلث قائم بتوظيف الجيب أو جيب التمام أو الظل',
  ],
  teachingScope: {
    include: [
      'نشاط 1: الوتر، المجاور والمقابل للزاوية C، جيب التمام cos 25° = AC/BC، القيم المدوّرة',
      'نشاط 2: النسبتان AC/BC و AC/AB لا تتعلقان بالأطوال (التخمين والبرهان بخاصية طالس)، الجيب والظل',
      'نشاط 3 ومعارف 1 و 2: تعريف الجيب والظل، القيمة المضبوطة والقيمة المقربة، 0 < sin, cos < 1',
      'طرائق: حساب طول ضلع باستعمال الجيب أو جيب التمام أو الظل، ودوري الآن',
    ],
    exclude: [
      'استعمال الحاسبة لتعيين قيس زاوية بمعرفة نسبتها (الدرس 2)',
      'العلاقات بين النسب المثلثية والإنشاءات الهندسية (الدرس 3)',
      'ترييض وضعيات ومشكلات (الدرس 4) والوضعية الإدماجية (أدمج تعلّماتي)',
    ],
  },
  // La « مسألة الدرس » (module 5) : le monde du lab متقدم (des rampes à angle fixé), d'autres nombres. Figure en
  // littéraux : B(0, 0), A(2,4 ; 0), C(2,4 ; 1,8) — le triangle 1,8 / 2,4 / 3 dessiné vrai (problems.test.js).
  lessonProblem: {
    module: 5,
    title: 'حديقة التزلّج: ثلاثة منحدرات وألواح المخزن',
    statement: 'في حديقة التزلّج بالحيّ، يتعاون العمّال وشباب الحيّ على بناء منحدرات خشبية، كلّ منحدر مثلث قائم: اللوح المائل، والارتفاع، والأرضية. المنحدر الأول (الشكل المقابل) مثلث $ABC$ قائم في $A$: طول لوحه $BC = 3$ m وارتفاعه $AC = 1{,}8$ m. منحدر المبتدئين $A\'B\'C\'$ قائم في $A\'$ ، له الزاوية نفسها $\\widehat{B\'} = \\widehat{B}$ ، وطول لوحه $B\'C\' = 2$ m. منحدر المحترفين $MNP$ قائم في $M$ ، زاويته $\\widehat{N} = 40^{\\circ}$ ، وارتفاعه $MP$ يساوي ارتفاع منحدر المبتدئين. في المخزن ألواح جاهزة بطولين فقط: 1,8 m و 2 m. تفتح الحديقة على الساعة 9 صباحًا وتستقبل نحو 200 متزلّج في الأسبوع.',
    figure: {
      points: { B: [0, 0], A: [2.4, 0], C: [2.4, 1.8] },
      segments: [{ from: 'B', to: 'C', label: '3 m' }, { from: 'A', to: 'C', label: '1,8 m' }, ['A', 'B']],
      rightAngles: [['B', 'A', 'C']],
      angles: [{ at: 'B', from: 'A', to: 'C' }],
      ariaLabel: 'المنحدر الأول: مثلث ABC قائم في A، طول اللوح BC هو 3 m والارتفاع AC هو 1,8 m',
      maxWidth: 320,
    },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : la somme des angles d'un triangle, l'hypoténuse, côtés opposé et adjacent
  // d'un angle aigu, le cosinus (3AM), Pythagore, Thalès (unité 9, la preuve du نشاط 2).
  priorKnowledge: ['majmu-zawaya', 'watar', 'muqabil-mujawir', 'jayb-tamam-3am', 'fithaghuras', 'talis-wahda-9'],
  resources: [
    // Le module 1 ouvre sur LES RAMPES (ramp-ratios). متقدم (ouvert par défaut : le نشاط 2) : B̂ = 40° imposé, trois
    // rampes que l'élève construit (4, 6, 8 en repères) puis un autre angle ; مبتدئ : la rampe à nommer (30°, planche 4 m).
    {
      kind: 'manipulation', code: 'ramp-ratios-skatepark-30-4', type: 'ramp-ratios', module: 1,
      level: 'beginner',
      title: 'منحدر حديقة التزلج: سمِّ الأضلاع وركّب النسب',
      objective: 'في مثلث قائم، بالنسبة إلى زاوية حادة: جيب التمام = المجاور ÷ الوتر، الجيب = المقابل ÷ الوتر، الظل = المقابل ÷ المجاور؛ هذه النسب لا تتعلق إلا بقيس الزاوية، والجيب وجيب التمام محصوران بين 0 و 1',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'skatepark' },
      learningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P2'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'ramp-ratios-act2-40', type: 'ramp-ratios', module: 1,
      level: 'advanced',
      title: 'نشاط 2: ثلاثة منحدرات بزاوية 40°',
      objective: 'في مثلث قائم، بالنسبة إلى زاوية حادة: جيب التمام = المجاور ÷ الوتر، الجيب = المقابل ÷ الوتر، الظل = المقابل ÷ المجاور؛ هذه النسب لا تتعلق إلا بقيس الزاوية، والجيب وجيب التمام محصوران بين 0 و 1',
      autonomy: 'لا شيء مقترح: التلميذ يبني بنفسه المنحدرات بأطوال يختارها عند الزاوية المفروضة 40°، ويحكم قبل القراءة هل تغيّرت النسبتان AC/BC و AC/AB، ثم يقرّر أن يدير الزاوية ليختبر تخمينه',
      experience: { type: 'textbook', reason: '', theme: 'skatepark' },
      learningPointIds: ['4am_nisab-muthallathiya_P1'],
      sourceElementIds: ['act-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حديقة التزلّج: ثلاثة منحدرات', learningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — منحدر الكرسي المتحرّك في المتوسطة', learningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — سقف بيت بالقرميد', learningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P2', '4am_nisab-muthallathiya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: مجموع زوايا مثلث، الوتر، الضلعان المقابل والمجاور، جيب التمام، خاصية فيثاغورس وخاصية طالس. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 1 و 2 — منحدرات حديقة التزلج', desc: 'سمِّ أضلاع المنحدر وركّب جيب التمام والجيب والظل، ثم ابنِ ثلاثة منحدرات بزاوية 40°: هل تتعلق النسب بالطول؟ ثم أسئلة النشاطين وبرهان طالس.',
      stage: 'trigger', teachesLearningPointIds: ['4am_nisab-muthallathiya_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب المنحدرات' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الجيب والظل', desc: 'نشاط 3، تعريف جيب زاوية حادة وظلها، القيمة المضبوطة والقيمة المقربة، ولماذا الجيب وجيب التمام بين 0 و 1.',
      stage: 'discovery', teachesLearningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P2'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — حساب طول ضلع', desc: 'ثلاث طرائق من الكتاب، بالجيب وجيب التمام والظل، سطرا سطرا مع برنامج الحاسبة، ثم دوري الآن.',
      stage: 'formalization', teachesLearningPointIds: ['4am_nisab-muthallathiya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 1 و 2 و 4 و 5 و 6 و 9 و 10 و 12 و 14 و 15.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P2', '4am_nisab-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — منحدرات حديقة التزلّج', desc: 'مسألة الدرس: ثلاثة منحدرات، الجيب والظل لمنحدر أول، الزاوية نفسها بلوح أقصر، ثم أيّ لوح من المخزن يكفي منحدر المحترفين؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — منحدر الكرسي المتحرّك', desc: 'منحدر بزاوية 5° نحو باب متوسطة: طوله، هل يتّسع له الفضاء أمام الباب، وثمن الدرابزين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — سقف البيت', desc: 'سقف مائل بزاوية 42°: ارتفاعه، طول وجهه ولماذا قول العامل خاطئ، ثم ثمن القرميد.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_nisab-muthallathiya_P1', '4am_nisab-muthallathiya_P2', '4am_nisab-muthallathiya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'ستة أسئلة تُقيّم الكفاءات الثلاث، منها الأسئلة 1 إلى 5 من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
