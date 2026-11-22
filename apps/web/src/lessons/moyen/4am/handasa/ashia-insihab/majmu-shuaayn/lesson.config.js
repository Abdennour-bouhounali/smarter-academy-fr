/**
 * الدرس 3 — مجموع شعاعين (علاقة شال وقاعدة متوازي الأضلاع) (unité 11 « الأشعة والانسحاب », manuel pp. 127–138).
 * Éléments (extraction › destinations) : le تحدّ de la page d'unité (p. 127, DOUBLON DÉCLARÉ — l'entrée de la leçon),
 * نشاط 3 et 4 (p. 129), معارف 4, 5, 6 (p. 132) avec l'encadré « ميشال شال » (p. 127, doublon déclaré, la note d'histoire),
 * طرائق « إنشاء ممثل لمجموع شعاعين » et دوري الآن 2 (p. 133), le TP GeoGebra (p. 138), تمارين 10, 11, 13, 14, 15, 16
 * (p. 135), QCM 4, 5, 7 (p. 136, doublon déclaré) au إختبار أولي.
 *
 * Le parcours (REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH → FORMALIZE → AUTOMATIZE → TRANSFER) :
 *   0 أستعدّ          diagnostic : image par une translation, منحى / اتجاه / طول, vecteurs égaux ⇔ parallélogramme,
 *                     symétrique / milieu, Pythagore, le sinus (unité 10)
 *   1 التحدّ ونشاطا 3 و 4 (trigger) REAL (le nageur et le courant ; la trottinette dans Alger) → MANIPULATE (le lab
 *                     vector-sum : enchaîner deux trajets, tourner la vitesse du nageur) → UNDERSTAND (نشاط 3 : deux
 *                     translations successives = une seule, de vecteur AC ; نشاط 4 : AB + BC, AB + AD, AB + BA)
 *   2 معارف (discovery) FORMALIZE : علاقة شال (+ ميشال شال), le vecteur nul, les vecteurs opposés, la règle du
 *                     parallélogramme ; retour au تحدّ : sin θ = 2/4 → 30°, 2√3 ≈ 3,46 km/h (pont vers l'unité 10)
 *   3 طرائق (formalization) TOUCH : la méthode du manuel révélée ligne à ligne, دوري الآن 2, le TP GeoGebra (optionnel)
 *   4 أوظّف تعلّماتي (practice_lab) AUTOMATIZE → TRANSFER : تمارين 10, 11, 13, 14, 15, 16
 *   puis trois « مسائل » de la plateforme (modules 5–7 : content/problems.js), avant le test
 *   8 إختبار أولي (evaluation)
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la trottinette dans Alger (labo `vector-sum`, niveau مبتدئ, ouvert par défaut) — la main pose le second trajet
 *   au bout du premier, le compteur lit plus que la distance droite quand on tourne : « enchaîner » se voit avant de s'écrire
 *   AB + BC = AC. Rejetée comme entrée : le تحدّ du nageur tel quel (une question posée de mémoire — « viser B ? » — avant que la main
 *   ait rien enchaîné) ; il reste le niveau متقدم du MÊME labo et devient l'étape 2 du module 1, une fois la somme comprise.
 *   Ordre des idées : pourquoi le compteur lit plus (ses propres trajets) → le nageur : viser B ne suffit pas → نشاط 3 (deux
 *   translations = une) puis la brique APRÈS la réponse → نشاط 4 (somme, 0, opposés) → module 2 : chaque question AVANT sa boîte et
 *   sa brique (RS + ST, EF + FE, EFGH) → le retour au تحدّ par le calcul. Modules 3–8 inchangés (méthode révélée ligne à ligne,
 *   exercices, مسائل, test).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/majmu-shuaayn';

export const LESSON_CONFIG = {
  id: 'majmu-shuaayn',
  kind: 'lesson',
  unit: 'ashia-insihab',
  unitTitle: 'الأشعة والانسحاب',
  sequentialUnlock: true,
  title: 'مجموع شعاعين (علاقة شال وقاعدة متوازي الأضلاع)',
  description: 'انسحابان متتابعان يعطيان انسحابا واحدا: شعاعه هو مجموع الشعاعين. نجمع شعاعين متعاقبين بعلاقة شال، وشعاعين لهما نفس المبدأ بقاعدة متوازي الأضلاع، ونتعرف على الشعاعين المتعاكسين والشعاع المعدوم — ونعبر النهر مع سبّاح التحدّي.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '➕',
  estimatedDurationMin: 55,
  lessonProblem: {
    module: 5,
    title: 'نادي السباحة: عبور نهر عرضه 60 m',
    statement: 'في حصّة تدريب لنادي السباحة على نهر، يتعاون فيها السبّاحون ويشجّع بعضهم بعضًا، ينطلق كل سبّاح من النقطة $A$ على إحدى الحافتين ليصل إلى النقطة $B$ المقابلة لها على الحافة الأخرى: المسار $[AB]$ عمودي على الحافتين وطوله 60 m (الشكل المقابل). يجري الماء موازيًا للحافتين بسرعة $0{,}8\\,\\mathrm{m/s}$ ، وهي طول الشعاع $\\vec{c}$ . سرعة أنس في ماء ساكن $0{,}6\\,\\mathrm{m/s}$ ، وسرعة وليد في ماء ساكن $1{,}7\\,\\mathrm{m/s}$ . درجة حرارة الماء 19 درجة، وانطلقت الحصّة على الساعة 10 صباحًا.',
    // Le support de la مسألة 1, montré aussi par la carte « مسألة الدرس » (une seule source) — unités : 1 = 10 m.
    figure: {
      points: { A: [0, 0], B: [0, 6], P: [-4, 0], Q: [6, 0], R: [-4, 6], S: [6, 6], U: [1.5, 3], V: [5.5, 3] },
      hidden: ['P', 'Q', 'R', 'S', 'U', 'V'],
      segments: [
        { from: 'P', to: 'Q', tone: 'sky', bold: true }, { from: 'R', to: 'S', tone: 'sky', bold: true },
        { from: 'A', to: 'B', dashed: true, label: '60 m' },
      ],
      rightAngles: [['Q', 'A', 'B']],
      vectors: [{ from: 'U', to: 'V', label: 'c', tone: 'sky' }],
      labels: { A: 's', B: 'n' },
      ariaLabel: 'نهر بين حافتين متوازيتين: النقطة A على الحافة السفلى والنقطة B مقابلتها على الحافة العليا، والمسار [AB] طوله 60 m عمودي على الحافتين، وشعاع سرعة التيار c موازٍ للحافتين نحو اليمين',
    },
  },
  textbookRef: { unit: 11, activity: 3, pages: '127, 129, 132, 133, 135, 136, 138' },
  skills: [
    'إدراك أن انسحابين متتابعين يعطيان انسحابا واحدا شعاعه مجموع الشعاعين',
    'جمع شعاعين متعاقبين بعلاقة شال، وشعاعين لهما نفس المبدأ بقاعدة متوازي الأضلاع، وإنشاء ممثل للمجموع',
    'التعرف على الشعاعين المتعاكسين والشعاع المعدوم واستعمالهما في تبسيط الكتابات الشعاعية',
  ],
  teachingScope: {
    include: [
      'تحدّ الوحدة: السبّاح والتيار (ص 127)',
      'نشاط 3: صورة نقطة بانسحابين متتابعين، علاقة شال (ص 129)',
      'نشاط 4: إنشاء ممثل لمجموع شعاعين، الشعاع المعدوم، الشعاعان المتعاكسان (ص 129)',
      'معارف 4 و 5 و 6 (ص 132) وطرائق «إنشاء ممثل لمجموع شعاعين» ودوري الآن 2 (ص 133)',
      'التمارين 10 و 11 و 13 و 14 و 15 و 16 (ص 135)',
    ],
    exclude: [
      'تعريف الشعاع وتساوي شعاعين (الدرس 1) ومتوازي الأضلاع والمنتصف (الدرس 2)، إلا تذكيرًا',
      'إنجاز البراهين بالأشعة (الدرس 4) والوضعية الإدماجية (أدمج تعلّماتي)',
      'مركبتا شعاع في معلم (الوحدة 12)',
    ],
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (leçons 1–2 de l'unité, années précédentes, unité 10).
  priorKnowledge: ['surat-insihab', 'anasir-shuaa', 'tasawi-mutawazi', 'muntasaf-nazira', 'fithaghuras', 'jayb'],
  resources: [
    // Module 1 : l'entrée. مبتدئ (plateforme) la trottinette dans Alger — enchaîner deux trajets (علاقة شال, le retour 0) ;
    // متقدم (ouvert par défaut : le تحدّ que le module porte) le nageur — la règle du parallélogramme, 30° exact.
    {
      kind: 'manipulation', code: 'vector-sum-scooter', type: 'vector-sum', module: 1,
      level: 'beginner',
      title: 'دراجة كهربائية في الجزائر: مشواران متتابعان',
      objective: 'مجموع شعاعين هو شعاع الانسحاب الناتج عن انسحابين متتابعين: نجمع شعاعين متعاقبين بعلاقة شال وشعاعين لهما نفس المبدأ بقاعدة متوازي الأضلاع',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'scooter' },
      learningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P2', '4am_majmu-shuaayn_P4'],
      sourceElementIds: ['act-3', 'act-4'],
    },
    {
      kind: 'manipulation', code: 'vector-sum-swimmer-4-2', type: 'vector-sum', module: 1,
      level: 'advanced',
      title: 'تحدّ الوحدة: سبّاح بسرعة 4 km/h وتيار بسرعة 2 km/h',
      objective: 'مجموع شعاعين هو شعاع الانسحاب الناتج عن انسحابين متتابعين: نجمع شعاعين متعاقبين بعلاقة شال وشعاعين لهما نفس المبدأ بقاعدة متوازي الأضلاع',
      autonomy: 'لا شيء مقترح: لا خانة ولا اتجاه مسبق، التلميذ يدير بنفسه سرعة السبّاح ويقرّر أين يصوّب، فيرى أن التصويب نحو B يرميه مع التيار، ويبحث عن الزاوية الوحيدة التي تجعل قطر متوازي الأضلاع على (AB)',
      experience: { type: 'textbook', reason: '', theme: 'swim' },
      learningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P3'],
      sourceElementIds: ['challenge'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — نادي السباحة: عبور نهر عرضه 60 m', learningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P2', '4am_majmu-shuaayn_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مروحية الإسعاف: إجلاء مريض ثم العودة إلى القاعدة', learningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P2', '4am_majmu-shuaayn_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — قارب يعبر الخليج والتيار البحري', learningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صورة نقطة بانسحاب، عناصر شعاع، تساوي شعاعين ومتوازي الأضلاع، المنتصف، فيثاغورس والجيب. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'tahaddi-anshita', path: `${LESSON_BASE_PATH}/tahaddi-anshita`,
      title: 'التحدّ ونشاطا 3 و 4', desc: 'سبّاح يعبر النهر والتيار يجرفه، ودراجة كهربائية تقطع مشوارين في الجزائر: انسحابان متتابعان يعطيان انسحابا واحدا.',
      stage: 'trigger', teachesLearningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 15, difficulty: 2, actionText: 'أعبر النهر' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — علاقة شال وقاعدة متوازي الأضلاع', desc: 'مجموع شعاعين، الشعاع المعدوم، الشعاعان المتعاكسان، قاعدة متوازي الأضلاع، ثم حلّ التحدّ بالحساب.',
      stage: 'discovery', teachesLearningPointIds: ['4am_majmu-shuaayn_P2', '4am_majmu-shuaayn_P3', '4am_majmu-shuaayn_P4'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف المعارف' },
    { id: '03', number: 3, slug: 'taraiq', path: `${LESSON_BASE_PATH}/taraiq`,
      title: 'طرائق — إنشاء ممثل لمجموع شعاعين', desc: 'التمرين المحلول من الكتاب سطرا سطرا، دوري الآن على مستطيل، وجيوجبرا.',
      stage: 'formalization', teachesLearningPointIds: ['4am_majmu-shuaayn_P2', '4am_majmu-shuaayn_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'أنشئ' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين الكتاب 10 و 11 و 13 و 14 و 15 و 16 (ص 135).',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P2', '4am_majmu-shuaayn_P3', '4am_majmu-shuaayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — عبور النهر', desc: 'مسألة الدرس: سبّاحان وتيار؛ قاعدة متوازي الأضلاع، علاقة شال، وطول المجموع ليس مجموع الطولين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P2', '4am_majmu-shuaayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مروحية الإسعاف', desc: 'من القاعدة إلى قرية جبلية ثم إلى المستشفى، ثم العودة: علاقة شال، الشعاعان المتعاكسان، والمسافة المقطوعة أمام الوقود المتوفّر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P2', '4am_majmu-shuaayn_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — قارب يعبر الخليج', desc: 'المحرّك والتيار البحري: قاعدة متوازي الأضلاع على خريطة مرصوفة، السرعة الفعلية وثمن الوقود الضائع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_majmu-shuaayn_P1', '4am_majmu-shuaayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع: انسحابان متتابعان، علاقة شال، قاعدة متوازي الأضلاع، الشعاعان المتعاكسان.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
