/**
 * الدرس 1 — حل معادلة من الدرجة الأولى بمجهول واحد
 * Unité 4 (4AM). Depuis le rollout mission (2026-11-11, conseil du 2026-11-11, verdict X1/X2) la plateforme écrit TOUT avec ses propres nombres et ses
 * propres mots : plus aucun nombre, énoncé ni renvoi du manuel n'est montré à l'élève ; les `id`, `skill`, `learningPointIds` et `src(...)` (traçabilité) sont gardés.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue (module 1) : la balance du vestiaire (equation-balance) — l'élève doit savoir ce que contient UN sac sans l'ouvrir, donc agir sur les
 *   DEUX plateaux. Ordre des idées : agir sur la balance (manches 2x + 3 = 11, 4x + 3 = −9, 3x − 2 = 10) → d'où vient une équation (le programme de calcul,
 *   (2x + 5) × 2 − 7 = 4x + 3) → خديجة (baudruche = −1) → la règle (« أتوقّع القاعدة ») → نسيم : 4x + 3 = 6x ouvre le module 2, où l'on lit ax = b puis b/a.
 *   « مسألة الدرس » : des sacs dans LES DEUX plateaux, avec des baudruches, puis un prix (module 5).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/muadala-ula';

export const LESSON_CONFIG = {
  id: 'muadala-ula',
  kind: 'lesson',
  unit: 'muadalat-mutarajihat',
  unitTitle: 'معادلات ومتراجحات من الدرجة الأولى بمجهول واحد',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ le 2026-11-08 ; unité 4, leçon 1, 2026-11-11) — implique le regard « focus » ;
  // l'enseignant et le mode classe ne voient aucun changement.
  studentView: 'mission',
  // LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre ; les outils sont les connaissances de knowledge.jsx ; les points d'étape RAPPROCHENT
  // de la mission sans en résoudre aucune question : ni ses nombres (7 sacs, 26 balles, 70200…), ni sa réponse, ni sa correction — content/mission.test.js et
  // _unit/missionStrings.test.js. La scène : le vestiaire et sa balance (« locker-balance »).
  mission: {
    scene: 'locker-balance',
    title: 'ميزان غرفة الملابس: ماذا في الكيس المغلق؟',
    opening: {
      text: 'في غرفة ملابس الفريق ميزان بكفّتين، وهو متوازن. في كل كفّة أكياس مغلقة متماثلة، ومعها كرات في كفّة وبالونات تشدّ الكفّة الأخرى إلى الأعلى. لا أحد يفتح الأكياس… فكم كرة في الكيس الواحد؟ وكم دفع النادي ثمنًا للكرة الواحدة؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'muadala-tarafayn', icon: '⚖️', label: 'العملية نفسها على الطرفين' },
      { id: 'hal-ax-b', icon: '✂️', label: 'كيس واحد وحده: القسمة على المعامل' },
      { id: 'tariqat-hal', icon: '🧭', label: 'طريقة حل معادلة' },
    ],
    climaxModule: 5,
    checkpoints: [
      {
        id: 'cp-tarafayn', afterModule: 1,
        prompt: '$x + 8 = 11$ . نطرح 8 من الطرفين فنجد:',
        options: ['$x = 3$', '$x = 19$', '$x = -3$'],
        correct: 0,
        explain: '$x + 8 - 8 = 11 - 8$ أي $x = 3$ . أمّا $19 = 11 + 8$ فيضيف بدل أن يطرح، و $-3 = 8 - 11$ يعكس الفرق.',
      },
      {
        id: 'cp-hal', afterModule: 2,
        prompt: '$8x = 4$ ، إذن $x =$',
        options: ['$\\dfrac{1}{2}$', '$2$', '$-4$'],
        correct: 0,
        explain: '$x = \\dfrac{4}{8} = \\dfrac{1}{2}$ . أمّا 2 فهو حاصل القسمة مقلوبًا، و $-4 = 4 - 8$ طرح لا قسمة.',
      },
      {
        id: 'cp-tahaqquq', afterModule: 3,
        prompt: 'نتحقّق من أنّ 3 حلّ للمعادلة $3x - 5 = x + 1$ : قيمة كل طرف من أجل $x = 3$ هي',
        options: ['$4$', '$9$', '$14$'],
        correct: 0,
        explain: '$3 \\times 3 - 5 = 4$ و $3 + 1 = 4$ . أمّا 9 فتنسى الحدّ $-5$ ، و 14 تجمعه.',
      },
      {
        id: 'cp-nashr', afterModule: 4,
        prompt: 'ننشر ثم نحلّ: $3(x - 1) = 9$ ، إذن $x =$',
        options: ['$4$', '$\\dfrac{10}{3}$', '$2$'],
        correct: 0,
        explain: '$3x - 3 = 9$ ثم $3x = 12$ ثم $x = 4$ . أمّا $\\dfrac{10}{3}$ فتضرب الحدّ الأول وحده، و 2 تطرح 3 بدل أن تضيفه.',
      },
    ],
  },
  title: 'حل معادلة من الدرجة الأولى بمجهول واحد',
  description: 'حل معادلة من الدرجة الأولى بمجهول واحد بإجراء العمليات نفسها على طرفيها: نقل المجاهيل إلى طرف والمعاليم إلى الطرف الآخر وتجميع الحدود المتشابهة حتى الشكل ax = b حيث a ≠ 0، ثم استخراج الحل الوحيد b/a والتحقق منه بالتعويض.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 52,
  textbookRef: { unit: 4, activity: 1, pages: '43, 44, 46, 47, 50, 52' },
  skills: [
    'ترجمة برنامج حساب إلى عبارة جبرية ثم إلى معادلة',
    'إجراء العملية نفسها على طرفي معادلة للحصول على معادلة لها الحل نفسه',
    'نقل المجاهيل إلى طرف والمعاليم إلى الطرف الآخر وتجميع الحدود المتشابهة حتى الشكل ax = b',
    'استخراج الحل الوحيد b/a للمعادلة ax = b حيث a ≠ 0، والتحقق منه بالتعويض',
  ],
  teachingScope: {
    include: [
      'برنامج الحساب ومعادلتا خديجة ونسيم على الميزان',
      'المعادلة ax = b حيث a ≠ 0 وحلها الوحيد b/a',
      'طريقة الحل: إضافة عدد أو طرحه من الطرفين، نقل المجاهيل والمعاليم، القسمة على المعامل',
      'معادلات بمعاملات عشرية أو كسرية أو جذرية، وبعد النشر والتبسيط',
      'التحقق من الحل بالتعويض في المعادلة الأولى',
    ],
    exclude: [
      'معادلات الجداء المعدوم (الدرس 2)',
      'المتراجحات (الدرس 3)',
      'ترييض المشكلات (الدرس 4)',
      'نظرية المعادلات التي ليس لها حل أو لها ما لا نهاية من الحلول: نكتفي بملاحظة أنّه لا يوجد أي عدد يحقّق المساواة',
    ],
  },
  // « مسألة الدرس » : montrée dès le sommaire et rappelée au module 1 (la balance du
  // vestiaire, d'autres nombres, l'inconnue dans les deux plateaux),
  // résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'ميزان غرفة الملابس: أكياس في الكفّتين',
    statement: 'في غرفة ملابس فريق كرة القدم، وقد حافظ اللاعبون على نظافتها وترتيبها، ميزان بكفّتين، وأكياس مغلقة متماثلة في كل منها العدد نفسه من الكرات. الكرة تزن $1$ ، والبالون المنفوخ يشدّ الكفّة إلى الأعلى فيزن $-1$ ، والكيس يزن ما فيه: $x$. وضع المدرّب في الكفّة اليسرى 7 أكياس و 4 بالونات، وفي الكفّة اليمنى كيسين و 26 كرة، فتوازن الميزان. في الفريق 22 لاعبًا. اشترى النادي الكرات التي في الأكياس التسعة بـ 70200 دج، وكل الكرات لها الثمن نفسه.',
    illustration: { kind: 'scene', icon: 'sack', bg: 'violet', chips: [{ label: 'يسار: أكياس', value: 7 }, { label: 'يسار: بالونات', value: 4 }, { label: 'يمين: أكياس', value: 2 }, { label: 'يمين: كرات', value: 26 }], extra: ['ball', 'sack'], ariaLabel: 'ميزان بكفّتين: في اليسرى 7 أكياس و 4 بالونات، وفي اليمنى كيسان و 26 كرة' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : toutes les connaissances dès le début.
  knowledgeMapOpen: true,
  // Les acquis que « أستعدّ » diagnostique : tester une égalité par substitution, les opérations sur les deux membres d'une égalité, le نشر et le تبسيط
  // (leçon nashr-tabsit).
  priorKnowledge: ['taawid-musawat', 'amaliyat-tarafayn', 'nashr-tabsit'],
  resources: [
    // Le module 1 ouvre sur la BALANCE du vestiaire (equation-balance). مبتدئ = 2x + 3 = 11, متقدم = 4x + 3 = −9 (plateforme).
    {
      kind: 'manipulation', code: 'balance-2x-3-11', type: 'equation-balance', module: 1,
      level: 'beginner',
      title: 'ميزان: كيسان و 3 كرات مقابل 11 كرة',
      objective: 'حل معادلة من الدرجة الأولى بإجراء العملية نفسها على طرفيها حتى الشكل ax = b ثم x = b/a',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'balance-4x-3-m9', type: 'equation-balance', module: 1,
      level: 'advanced',
      title: 'ميزان: 4 أكياس و 3 كرات مقابل 9 بالونات',
      objective: 'حل معادلة من الدرجة الأولى بإجراء العملية نفسها على طرفيها حتى الشكل ax = b ثم x = b/a',
      autonomy: 'لا توجد كرة في الكفّة اليمنى لتؤخذ: على التلميذ أن يكتشف وحده أنّ وضع بالون هو العملية نفسها (طرح 1)، وأنّ الكيس يحتوي على بالونات (حل سالب) — دون أي اقتراح للخطوات',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'football' },
      learningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'],
      sourceElementIds: ['act-1'],
    },
    // معارف : un exemple travaillé, posé en laboratoire (un niveau).
    {
      kind: 'manipulation', code: 'balance-4x-1-x-8', type: 'equation-balance', module: 2,
      title: 'ميزان: 4 أكياس وكرة مقابل كيس و 8 كرات',
      learningPointIds: ['4am_muadala-ula_P1', '4am_muadala-ula_P2'],
      sourceElementIds: ['know-1'],
    },
    // Modules 5–7 — les « مسائل » : exercices complets de type امتحان, ajouts
    // de la plateforme (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ميزان غرفة الملابس: أكياس في الكفّتين', learningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — سيارات الأجرة في وهران: أيّ تسعيرة؟', learningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — نادي الإنترنت: بطاقة الاشتراك أم لا؟', learningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات من السهل إلى الأصعب: العمليات على طرفي مساواة وهل العدد حلّ للمعادلة. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'أوازن الميزان', desc: 'أبقِ ميزان غرفة الملابس متوازنًا حتى تعرف ما في كيس واحد، ثم اكتشف من أين تأتي المعادلة.',
      stage: 'trigger', teachesLearningPointIds: ['4am_muadala-ula_P1', '4am_muadala-ula_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أوازن الميزان' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — كيس واحد وحده', desc: 'أكياس في الكفّتين، وكيس لا يحوي عددًا صحيحًا: الشكل ax = b حيث a ≠ 0 وحلّه الوحيد b/a.',
      stage: 'discovery', teachesLearningPointIds: ['4am_muadala-ula_P1', '4am_muadala-ula_P2'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tarayiq', path: `${LESSON_BASE_PATH}/tarayiq`,
      title: 'طرائق — حل معادلة', desc: 'حلّان سطرًا سطرًا (معادلة بسيطة ومعادلة بمعاملات عشرية)، ثم دورك.',
      stage: 'formalization', teachesLearningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تسعة تمارين متدرّجة: من ax = b إلى معادلات تُنشر وتُبسَّط، ومعادلة لا يحقّقها أي عدد.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_muadala-ula_P1', '4am_muadala-ula_P2'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ميزان غرفة الملابس', desc: 'مسألة الدرس: أكياس في الكفّتين، ثم أكياس من البالونات، ثم ثمن الكرة. حلّ كامل خطوة بخطوة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — سيارات الأجرة', desc: 'ثلاث تسعيرات في وهران: كم كيلومترًا؟ متى تتساوى الأجرتان؟ وأيّها أرخص إلى المطار؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — نادي الإنترنت', desc: 'بطاقة اشتراك أم لا؟ نتحقّق من ادّعاء بالتعويض، ثم معادلة فيها أقواس.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_muadala-ula_P2', '4am_muadala-ula_P1'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءتين.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
