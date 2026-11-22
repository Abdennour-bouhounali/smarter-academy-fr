/**
 * الدرس — التعليم على مستقيم مدرّج (1AM, unité 5 « الأعداد النسبية »). Le DEUXIÈME درس de l'unité (ordre 21 du catalogue), généré DANS son entrée du catalogue (items 1am.m5.r06 et 1am.m5.r05),
 * cycle moyen phase 3, 1AM paire 2 A, 2026-10-30. Il suit `adad-nisbiya-siyaqat` (signe, distance à zéro, opposés) et `adad-ashri-mustaqim-mudarraj` (la demi-droite graduée décimale).
 * Manuel 1AM (الجيل الثاني) : نشاط 1 (la demi-droite à abscisses négatives, p. 65), نشاط 2 (p. 66), معارف 2 (p. 67), طريقة et « دوري الآن » (p. 68), exercices 10–15 (pp. 71–72),
 * أقوّم تعلّماتي 5 et 6 (p. 73), أتعمّق 2 et 3 (p. 74). Source : docs/sources/1am/unit5/extraction.json ; brief des auteurs : docs/sources/1am/unit5/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre (§4ter-bis) : tout est réécrit, autres contextes, autres nombres.
 *   Entrée retenue : la route d'un village (labo `stride-stamp`, thème `villageroad`). La station de bus est l'origine O, l'école est à l'est et la place de la mosquée à l'ouest ; la route ne porte que le 0.
 *   La main PORTE un bâton d'une foulée à partir de O, vers l'est puis vers l'OUEST : les ticks 1, 2, 3 et −1, −2, −3 n'apparaissent que tamponnés ; la route est finie (une foulée trop longue ne
 *   rejoint pas −3) ; puis le jumeau d'une maison de l'autre côté de O ; puis trois maisons A(−3), B(2,7), C(−1,5). متقدم : le drapeau de l'origine sur une droite dont seules deux graduations sont
 *   écrites (−3 et 3 ; −8 et −2 de deux en deux) et l'encadrement d'une maison entre deux ticks consécutifs.
 *   Rejetées : (a) la carte des températures d'`act-2` (la main ne tient rien : la température est l'entrée de la leçon précédente) ; (b) l'échelle verticale `frost-gauge` (leçon précédente) et le repère
 *   du plan `courtyard-drone` (leçon suivante) ; (c) la somme de relatifs et la distance entre deux points (2AM) ; (d) ranger des relatifs (2AM) : ici tout se lit sur UNE droite et se place par son abscisse.
 *   Ordre des idées : porter la foulée des deux côtés de O (P1) → le jumeau, les abscisses opposées (P3) → placer A(−3), B(2,7), C(−1,5) (P3, P2) → retrouver l'origine, encadrer (P2) → معارف
 *   (le nom : droite graduée = origine, sens, unité ; abscisse ; symétriques ; encadrement) → طريقة (graduer et placer deux points) → أتمرّن → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure `1am.m5.r04` (lire une abscisse décimale sur une demi-droite graduée) et `1am.m5.r05` (signe, distance à zéro, opposé) : ce sont les deux prérequis du réseau de l'item.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/talim-mustaqim-mudarraj';

export const LESSON_CONFIG = {
  id: 'talim-mustaqim-mudarraj',
  kind: 'lesson',
  unit: 'adad-nisbiya',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'التعليم على مستقيم مدرّج',
  description: 'على طريق قرية نحمل خطوة واحدة من محطّة الحافلة شرقًا وغربًا فتظهر العلامات الموجبة والسالبة، ثمّ نضع البيوت بفواصلها، ونجد المبدأ حين يُمحى، ونحصر النقطة بين علامتين.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🛣️',
  estimatedDurationMin: 84,
  textbookRef: { unit: 5, activity: 2, pages: '65, 66, 67, 68, 71, 72, 73, 74' },
  skills: [
    'تدريج مستقيم باختيار مبدإ واتجاه ووحدة ونقلها من جهتي المبدإ',
    'قراءة فاصلة نقطة معلومة على مستقيم مدرّج (بشكل مضبوط أو بحصر)، ولو لم يُعلَّم المبدإ',
    'تعليم نقطة ذات فاصلة نسبية معلومة مثل $A(-3)$ و $B(2{,}7)$ على مستقيم مدرّج',
  ],
  teachingScope: {
    include: ['اختيار المبدإ والاتجاه والوحدة', 'نقل الوحدة من جهتي المبدإ', 'فاصلة نقطة على مستقيم مدرّج', 'النقطتان المتناظرتان بالنسبة إلى المبدإ وفاصلتاهما المتعاكستان', 'قراءة الفاصلة بحصرها بين علامتين', 'إيجاد المبدإ من علامتين مكتوبتين'],
    exclude: ['الأعداد السالبة في الحرارة والارتفاع والطوابق ومسافة العدد إلى الصفر وعدده المعاكس (الدرس السابق)', 'تدريج نصف مستقيم بالأعداد العشرية (درس سابق ورد في «أستعدّ»)', 'المعلم المتعامد وإحداثيا نقطة (درس «التعليم في المستوي»)', 'مقارنة الأعداد النسبية وجمعها والمسافة بين نقطتين (السنة الثانية)'],
  },
  // « مسألة الدرس » : طريق القرية — فواصل أربعة أماكن، الأبعد عن المحطّة ليس صاحب أكبر فاصلة، ثمّ نظير المخبزة (module 5).
  lessonProblem: {
    module: 5,
    title: 'طريق القرية',
    statement: 'في قرية طريق مستقيمة، ومحطّة الحافلة $O$ هي المبدأ فيها، ونتّجه نحو الشرق ونأخذ الكيلومتر وحدة. تقع المدرسة $S$ على بعد 3 km شرق المحطّة، والمسجد $M$ على بعد 3,5 km غرب المحطّة، والمخبزة $B$ على بعد 1,5 km غرب المحطّة، والمستوصف $C$ على بعد 2 km شرق المحطّة. تشتري المخبزة 12 كيسًا من الدقيق كلّ أسبوع.',
    questions: [
      { label: '1)', text: 'اكتب فاصلة كلّ مكان من الأماكن الأربعة على الطريق المدرّجة، ثمّ بعد المسجد عن المحطّة.' },
      { label: '2)', text: 'أيّ المكانين أبعد عن المحطّة: المسجد أم المدرسة؟ وهل الأبعد هو صاحب أكبر فاصلة؟' },
      { label: '3)', text: 'بين أيّ علامتين صحيحتين تقع المخبزة؟ وما فاصلة نقطتها النظيرة بالنسبة إلى المحطّة؟' },
    ],
    illustration: { kind: 'tags', cards: [
      { title: 'شرق المحطّة', icon: 'house', lines: [{ label: 'المدرسة', value: '3', unit: 'km' }, { label: 'المستوصف', value: '2', unit: 'km' }] },
      { title: 'غرب المحطّة', icon: 'house', lines: [{ label: 'المسجد', value: '3,5', unit: 'km' }, { label: 'المخبزة', value: '1,5', unit: 'km' }] },
    ], ariaLabel: 'مدرسة ومستوصف في الشرق على بعد ثلاثة واثنين كيلومتر، ومسجد ومخبزة في الغرب على بعد ثلاثة ونصف وواحد ونصف كيلومتر من المحطّة' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m5.r04` (lire une abscisse décimale sur une demi-droite graduée) et `1am.m5.r05` (signe, distance à zéro, opposé).
  priorKnowledge: ['faasila-nisf-mustaqim-1am', 'adad-nisbi-1am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `stride-stamp` (la main PORTE un bâton-foulée, le jumeau d'une maison, une maison, le drapeau de l'origine, un cadre d'une foulée), monde `villageroad` :
    //   مبتدئ — b1 la foulée longue portée à 3 et −3 (la route s'arrête avant −3) ; b2 le jumeau de −3 puis de 2 ; b3 A(−3) · B(2,7) · C(−1,5).
    //   متقدم — a1 les graduations écrites −3 et 3 ; a2 −8 et −2 de deux en deux ; a3 encadrer −1,5 · 2,7 · −0,4.
    {
      kind: 'manipulation', code: 'stride-stamp-road', type: 'stride-stamp', module: 1,
      level: 'beginner',
      title: 'طريق القرية: خطوة الطابع',
      objective: 'نحمل وحدة طول واحدة من المبدإ في الجهتين فتظهر علامات موجبة وسالبة، ونضع نقاطًا بفواصلها',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'villageroad' },
      learningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'],
      sourceElementIds: ['act-1-line', 'act-2'],
    },
    {
      kind: 'manipulation', code: 'stride-stamp-origin', type: 'stride-stamp', module: 1,
      level: 'advanced',
      title: 'طريق القرية: المبدأ المفقود والحصر',
      objective: 'نحمل وحدة طول واحدة من المبدإ في الجهتين فتظهر علامات موجبة وسالبة، ونضع نقاطًا بفواصلها',
      autonomy: 'يجد التلميذ المبدأ من علامتين مكتوبتين فقط دون أن يُعطى الصفر، ثمّ يحصر بيتًا بين علامتين متتاليتين بإطار طوله خطوة واحدة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'villageroad' },
      learningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'],
      sourceElementIds: ['act-1-line', 'act-2', 'ex-13', 'know-2'],
    },
    // Module 3 — le MÊME instrument posé seul (`levels={false}`) : une tâche à deux maisons (M(−4) et N(1,6)), avec les gestes de la méthode.
    {
      kind: 'manipulation', code: 'stride-stamp-method', type: 'stride-stamp', module: 3,
      title: 'أدرّج مستقيمًا وأعلّم نقطتين',
      learningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P3'],
      sourceElementIds: ['method-1'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — طريق القرية', learningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — شريط الزمن', learningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — شريط الخيّاطة', learningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ قراءة فاصلة على نصف مستقيم مدرّج، والعدد السالب ومسافته ومعاكسه.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — طريق القرية', desc: 'طريق لا يُكتب عليها إلا الصفر عند المحطّة: أحمل عصا الخطوة شرقًا وغربًا، وأضع بيوتًا بفواصلها، وأجد المبدأ المفقود.',
      stage: 'trigger', teachesLearningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المستقيم المدرّج', desc: 'المبدأ والاتجاه والوحدة، الجهتان، فاصلة نقطة، النقطتان المتناظرتان، والحصر بين علامتين.',
      stage: 'discovery', teachesLearningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أدرّج وأعلّم', desc: 'أختار المبدأ والاتجاه والوحدة، أنقل الوحدة من جهتي المبدإ، ثمّ أضع نقطة بفاصلتها.',
      stage: 'formalization', teachesLearningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'قراءة فواصل بالتدريجات الصغيرة، إيجاد المبدإ، البعد بالسنتيمتر، النظير، والمجاورة، وصحيح أم خاطئ.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — طريق القرية', desc: 'مسألة الدرس: الفواصل، الأبعد عن المحطّة، والنظيرة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — شريط الزمن', desc: 'اختيار وحدة تتّسع لها الورقة، ثمّ الأبعاد بالسنتيمتر، ثمّ نظير نقطة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — شريط الخيّاطة', desc: 'مبدأ مفقود: قيمة التباعد، فاصلة الدبوس، والعلامة الأبعد.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_talim-mustaqim-mudarraj_P1', '1am_talim-mustaqim-mudarraj_P2', '1am_talim-mustaqim-mudarraj_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
