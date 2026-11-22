/**
 * الدرس 4 — تطبيقات التناسبية (النسب المئوية والمقادير المركبة)
 * Unité 6 du manuel (4AM) : « أستعدّ » items 6–9 (p. 65), نشاط 5 et نشاط 6 (p. 67), معارف p. 70,
 * طرائق p. 71 (النسب المئوية، المقادير المركّبة، دوري الآن), exercices 3, 4, 5 (p. 72) et 19 → 27
 * (p. 73), QCM 7 et 8 (p. 74). Source de vérité : docs/sources/4am/unit6/extraction.json.
 * Puis trois « مسائل » de la plateforme (modules 5–7), avant le إختبار أولي (module 8).
 *
 * RETROFIT « méthode » (2026-10-15, LESSON_DEVELOPMENT_GUIDE §4ter–§4quinquies). ENTRÉE — candidats : (A) l'activité 5 du
 * manuel telle quelle (le pourcentage de filles puis la baisse de consommation, deux calculs posés de mémoire, AVANT toute
 * manipulation) ; (B) l'étiquette de prix qu'on étire (percent-tag, +5 % sur 1200 DA) où « ajouter 5 » est refusé et où seul le
 * multiplicateur 1,05 fait grandir la barre « après ». CHOIX : B (c'était déjà le niveau مبتدئ ; le labo reste l'entrée, il est le
 * premier élément du module, sans brief ni titre d'atelier). REJETÉ : A comme entrée — ses questions 1 et 2 passent APRÈS le labo
 * comme applications de « prendre t % » (briques nisba-akhdh, takhfid-darb). ORDRE des idées (module 1) : par quel nombre ma barre
 * a-t-elle été multipliée (brique ziyada-darb) → y = 1,05x sur MON tableau (brique dala-murfaqa) → pourcentage de filles →
 * baisse de consommation → −20 % puis +20 % (chaîne du labo avancé). Module 2 (sans labo) : le brief ne nomme plus
 * « مقادير مركّبة » ; module 3 : encadrés et briques APRÈS la réponse (tableau des pourcentages, tatabu-darb, miqdar-jida,
 * miqdar-bidalala). Mathématiques, الكفاءات, ordre, slugs, nombre de modules INCHANGÉS ; `experience.reason` du labo inchangé
 * (le labo n'est pas une entrée « platform_designed_entry » : il reprend l'activité 5 du manuel). Modules 4–8 inchangés.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/tatbiqat-tanasub';

export const LESSON_CONFIG = {
  id: 'tatbiqat-tanasub',
  kind: 'lesson',
  unit: 'tanasubiya-dala-khattiya',
  unitTitle: 'الدالة الخطية والتناسبية',
  sequentialUnlock: true,
  title: 'تطبيقات التناسبية (النسب المئوية والمقادير المركبة)',
  description: 'نمذجة الزيادة والتخفيض بـ $t\\%$ بالدالة الخطية المرفقة $x \\longmapsto \\left(1 + \\dfrac{t}{100}\\right)x$ أو $x \\longmapsto \\left(1 - \\dfrac{t}{100}\\right)x$ ، المقادير المركبة الناتجة عن جداء (الطاقة $E = P \\times t$ ) أو حاصل قسمة (السرعة المتوسطة، الكتلة الحجمية)، وترجمة وضعيات يتدخل فيها مقدار بدلالة مقدار آخر.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🏷️',
  estimatedDurationMin: 59,
  textbookRef: { unit: 6, activity: 5, pages: '65, 67, 70, 71, 72, 73, 74' },
  skills: [
    'حساب نسبة مئوية لجزء من كلّ، وأخذ نسبة مئوية من مقدار',
    'نمذجة زيادة أو تخفيض بـ $t\\%$ بالضرب في $1 + \\dfrac{t}{100}$ أو $1 - \\dfrac{t}{100}$ ، وكتابة الدالة الخطية المرفقة',
    'حساب أثر تغيّرات مئوية متتابعة بضرب المضاعفات',
    'حساب مقادير مركّبة (السرعة المتوسطة، التدفق، الكتلة الحجمية، الطاقة) وتحويل وحداتها',
    'التعبير عن مقدار بدلالة مقدار آخر وقراءة وضعيات من هذا النوع',
  ],
  teachingScope: {
    include: [
      'نشاط 5: النسبة المئوية للبنات، انخفاض استهلاك البنزين، زيادة 5% على 1200DA',
      'نشاط 6: السرعة $25m/s$ والسرعة القصوى $80km/h$ ، تدفق المحطة، الكتل الحجمية للذهب والفضة والنحاس (السؤال 3 مصحّح)',
      'معارف ص 70: جدول النسب المئوية، مقدار جداء ومقدار حاصل القسمة (الطاقة مصحّحة)',
      'طرائق ص 71: الخزان (تغيّران متتابعان)، الكثافة السكانية للجزائر، دوري الآن',
      'تمارين الكتاب 3، 4، 5 و 19 ← 27',
    ],
    exclude: [
      'جدول التناسبية ومعامله والرابع المتناسب — الدرس 1',
      'تعريف الدالة الخطية وصورة عدد والعدد الذي له صورة — الدرس 2',
      'التمثيل البياني للدالة الخطية — الدرس 3',
      'الفائدة المركّبة والنسب المئوية على عدة سنوات',
    ],
  },
  lessonProblem: {
    module: 5,
    title: 'صهريج السقي: سحب 25% ثم ضخّ 20% ممّا بقي',
    statement: 'يعتني فلّاح بإتقان ببستان زيتونه حبًّا لأرضه، وفيه صهريج لسقي الأشجار سعته $40m^3$ ، كان مملوءًا تمامًا صباح يوم الإثنين. سحب الفلاح 25% من الماء لسقي 120 شجرة زيتون، ثم ضخّ في المساء كمية من الماء تساوي 20% ممّا بقي في الصهريج. تضخّ المضخّة الكهربائية الماء بتدفق ثابت قدره 800 لتر في الساعة، واستطاعتها $1{,}5kW$ . عمق البئر الذي تضخّ منه 35 مترًا.',
    illustration: { kind: 'tanks', tanks: [{ label: 'صهريج السقي', value: 40, unit: 'm³', level: 1 }], ariaLabel: 'صهريج لسقي أشجار الزيتون سعته 40 m³ كان مملوءًا تمامًا' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique : prendre t % (item 6), augmenter / diminuer d'un
  // pourcentage par le calcul de 3AM (items 7, 8), la vitesse moyenne (item 9), l'image par une
  // fonction linéaire x ⟼ ax (leçon dala-khattiya), les conversions d'unités (temps, volume).
  priorKnowledge: ['akhdh-nisba-miawiya', 'hisab-ziyada-takhfid', 'sura-mutawassita', 'sura-dala-khattiya', 'tahwil-wahdat'],
  resources: [
    // Le module 1 ouvre sur L'ÉTIQUETTE QU'ON ÉTIRE (percent-tag). مبتدئ = نشاط 5 السؤال 3 (+5 % sur
    // 1200 DA, la vitrine des soldes), ouvert par défaut ; متقدم = le réservoir des طرائق (−30 % puis
    // +15 %), parié puis construit.
    {
      kind: 'manipulation', code: 'percent-tag-1200-5', type: 'percent-tag', module: 1,
      level: 'beginner',
      title: 'نشاط 5: زيادة 5% على 1200DA',
      objective: 'تغيّر مقدار بنسبة مئوية ضرب في مضاعف: زيادة x بـ t% تضربه في 1 + t/100 وتخفيضه في 1 − t/100 — دالة خطية — والتغيّرات المتتابعة تُضرب مضاعفاتها ولا تُجمع نسبها',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'improved_interactivity_and_age_appropriateness', theme: 'mall' },
      learningPointIds: ['4am_tatbiqat-tanasub_P1'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'percent-tag-tank-30-15', type: 'percent-tag', module: 1,
      level: 'advanced',
      title: 'الخزان: نفرغ 30% ثم نضيف 15%',
      objective: 'تغيّر مقدار بنسبة مئوية ضرب في مضاعف: زيادة x بـ t% تضربه في 1 + t/100 وتخفيضه في 1 − t/100 — دالة خطية — والتغيّرات المتتابعة تُضرب مضاعفاتها ولا تُجمع نسبها',
      autonomy: 'تغيّران متتابعان دون اقتراح: التلميذ يراهن أولًا على التغيّر الكلي، ثم يبني التغيّرين بنفسه، ويواجه رهانه بمستوى الماء، ثم يبني سلسلة معاكسة (−20% ثم +20%) ليرى أنها لا تعيد الحجم الأول',
      experience: { type: 'textbook', reason: '', theme: 'tank' },
      learningPointIds: ['4am_tatbiqat-tanasub_P1', '4am_tatbiqat-tanasub_P3'],
      sourceElementIds: ['method-percent'],
    },
    // Les trois « مسائل » (ajouts de la plateforme, content/problems.js).
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — صهريج السقي: سحب 25% ثم ضخّ 20%', learningPointIds: ['4am_tatbiqat-tanasub_P1', '4am_tatbiqat-tanasub_P2', '4am_tatbiqat-tanasub_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — ألبسة العيد: زيادة 20% ثم تخفيض 20%', learningPointIds: ['4am_tatbiqat-tanasub_P1'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — سكان البلدية: النموّ والكثافة وماء الشرب', learningPointIds: ['4am_tatbiqat-tanasub_P1', '4am_tatbiqat-tanasub_P2', '4am_tatbiqat-tanasub_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: أخذ نسبة مئوية، زيادة وتخفيض، السرعة المتوسطة، صورة عدد بدالة خطية، تحويل الوحدات. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat-nisab', path: `${LESSON_BASE_PATH}/nashat-nisab`,
      title: 'نشاط 5 — النسب المئوية', desc: 'بطاقة سعر في واجهة التخفيضات: مدّدها بزيادة أو تخفيض، جرّب إضافة t بدل الضرب، ثم أجب عن أسئلة النشاط 5.',
      stage: 'trigger', teachesLearningPointIds: ['4am_tatbiqat-tanasub_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أمدّد بطاقة السعر' },
    { id: '02', number: 2, slug: 'maqadir-murakkaba', path: `${LESSON_BASE_PATH}/maqadir-murakkaba`,
      title: 'نشاط 6 — المقادير المركّبة', desc: 'سرعة سيارة أمام لافتة 80، تدفق محطة المياه، وأيّ المعادن أثقل: مقادير هي حاصل قسمة مقدارين، وتحويل وحداتها.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tatbiqat-tanasub_P2', '4am_tatbiqat-tanasub_P3'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أحسب المقادير' },
    { id: '03', number: 3, slug: 'maarif-tarayiq', path: `${LESSON_BASE_PATH}/maarif-tarayiq`,
      title: 'معارف وطرائق', desc: 'جدول النسب المئوية، الخزان (تغيّران متتابعان)، دوري الآن، مقدار الجداء ومقدار حاصل القسمة، والكثافة السكانية للجزائر.',
      stage: 'formalization', teachesLearningPointIds: ['4am_tatbiqat-tanasub_P1', '4am_tatbiqat-tanasub_P2', '4am_tatbiqat-tanasub_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'أتعلّم الطرائق' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 3، 4، 5 و 19 ← 27 في أربع مجموعات: تعيين دالة خطية، النسب المئوية، تغيّرات متتابعة، المقادير المركّبة.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tatbiqat-tanasub_P1', '4am_tatbiqat-tanasub_P2', '4am_tatbiqat-tanasub_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — صهريج السقي', desc: 'مسألة الدرس: سحب 25% ثم ضخّ 20% ممّا بقي، هل نقص الماء بـ 5% فقط؟ ثم المدة والطاقة لملء الصهريج.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tatbiqat-tanasub_P1', '4am_tatbiqat-tanasub_P2', '4am_tatbiqat-tanasub_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — ألبسة العيد', desc: 'زيادة 20% ثم تخفيض 20%: هل عادت الأسعار إلى ما كانت عليه؟ وكم دفع الأب؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tatbiqat-tanasub_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — سكان البلدية', desc: 'نموّ السكان بـ 2,5%، الكثافة السكانية، وهل تكفي محطة المياه؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tatbiqat-tanasub_P1', '4am_tatbiqat-tanasub_P2', '4am_tatbiqat-tanasub_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث، منها سؤالان من أؤكّد تعلّماتي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
