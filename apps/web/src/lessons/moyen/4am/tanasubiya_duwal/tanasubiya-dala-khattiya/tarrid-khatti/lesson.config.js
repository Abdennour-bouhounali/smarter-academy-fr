/**
 * الدرس 5 — حل مشكلات وترييض وضعيات بتوظيف الدالة الخطية والتناسبية
 * Unité 6 du manuel (4AM) : نشاط 4 p. 67 (trois graphiques), طرائق p. 71 (le ressort), le تحدّ
 * de la page d'unité p. 65 (doublon déclaré), أتعمّق 28, 29, 31, 34, 35, 36 (p. 75). Le manuel n'a
 * pas d'item « أستعدّ » pour ce sujet : module 0 fait d'affirmations de la plateforme.
 * Puis trois « مسائل » de la plateforme (modules 4–6).
 * Source de vérité : docs/sources/4am/unit6/extraction.json.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le CÂBLE du téléphérique (origin-line, niveau مبتدئ) — la main FAIT PIVOTER le câble autour de la station O
 *   jusqu'à ce qu'il touche trois pylônes ; ce que l'élève voit, c'est qu'une droite qui passe par O suffit, et le laboratoire
 *   écrit y = a·x ; ajout déclaré de la plateforme (`platform_designed_entry`). Rejeté : le نشاط 4 du manuel (trois graphiques :
 *   pommes de terre, périmètre, aire — « lequel est proportionnel ? ») comme entrée — c'est un choix à vue entre trois dessins,
 *   sans geste ; il devient la PREMIÈRE question APRÈS le câble (« le câble passe par O : lequel des trois lui ressemble ? »).
 *   Rejeté aussi : le ressort de la طريقة (a = 0,3) en premier contact — le coefficient hors des nœuds de la grille ; il reste
 *   le niveau متقدم. Ordre des idées : câble réglé (mes essais) → quel graphique du livre lui ressemble → a = 50 sur (3 ; 150),
 *   brique « tanasub-bayan » APRÈS la réponse → ce que signifie a → pourquoi (2) et (3) ne conviennent pas, brique
 *   « laysat-tanasub » APRÈS la réponse → (module 2) le tableau du ressort d'abord, la solution du livre ensuite, les trois
 *   formes et l'interprétation en question d'abord, brique après.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/tanasubiya_duwal/tarrid-khatti';

export const LESSON_CONFIG = {
  id: 'tarrid-khatti',
  kind: 'lesson',
  unit: 'tanasubiya-dala-khattiya',
  unitTitle: 'الدالة الخطية والتناسبية',
  sequentialUnlock: true,
  title: 'حل مشكلات وترييض وضعيات بتوظيف الدالة الخطية والتناسبية',
  description: 'نمذجة وضعيات واقعية ومسائل هندسية وعددية تعبر عن علاقات تناسبية بالدوال الخطية، والانتقال بين أشكال التعبير عن التناسبية (جدول، دستور $f(x) = ax$ ، تمثيل بياني)، ثم صياغة العلاقة بين المتغيرات وتفسير النتائج في سياق الوضعية.',
  level: 'moyen',
  grade: '4am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان التناسبية والدوال',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 50,
  textbookRef: { unit: 6, activity: 4, pages: '65, 67, 71, 75' },
  skills: [
    'التعرّف على وضعية تناسبية من تمثيلها البياني: نقط على مستقيم يشمل المبدأ',
    'تعيين معامل التناسبية وتفسيره في سياق الوضعية (سعر الوحدة، السرعة، الاستطالة لكل غرام)',
    'الانتقال بين الجدول والدستور $f(x) = ax$ والتمثيل البياني',
    'حساب مقدار بدلالة مقدار آخر بالاستعانة بجدول تناسبية، وتفسير النتيجة بوحدتها والتحقق من معقوليتها',
  ],
  teachingScope: {
    include: [
      'نشاط 4 ص 67: ثلاثة تمثيلات بيانية، أيّها تناسبي؟ معامل التناسبية وتفسيره',
      'طرائق ص 71: النابض، الجدول ثم الدستور ثم القراءة',
      'التحدّي ص 65: مركبتان، إحداهما فقط بسرعة ثابتة',
      'تمارين أتعمّق 28، 29، 31، 34، 35، 36 ص 75',
    ],
    exclude: [
      'تعريف الدالة الخطية وحساب صورة عدد (الدرس 2)',
      'تقنيات رسم التمثيل البياني والقراءة البيانية (الدرس 3)',
      'تعريف النسبة المئوية والمقادير المركبة (الدرس 4)',
    ],
  },
  // « مسألة الدرس » (module 4) : montrée dès le sommaire et rappelée au module 1, prolongement du
  // ressort du niveau متقدم (même instrument, d'autres nombres) — content/problems.js.
  lessonProblem: {
    module: 4,
    title: 'نابض في مخبر العلوم: من قياسين إلى الدستور',
    statement: 'في مخبر العلوم بالمتوسطة، يجرّب فوج من 4 تلاميذ متعاونين، يدوّنون قياساتهم بأمانة، نابضًا جديدًا طوله دون أيّ جسم 12cm. يستطيل النابض بشكل متناسب مع الكتلة المعلّقة به: كتلة 6g تعطي استطالة 1,5cm، وكتلة 16g تعطي استطالة 4cm. نسمّي $x$ الكتلة المعلّقة (بالغرام) و $y$ استطالة النابض (بالسنتيمتر). يفسد النابض إذا تجاوزت استطالته 7cm.',
    illustration: { kind: 'scene', icon: 'sack', bg: 'violet', chips: [{ label: 'طول النابض', value: 12, unit: 'cm', tone: 'violet' }, { label: 'كتلة 6 g', value: '1,5', unit: 'cm', tone: 'blue' }, { label: 'كتلة 16 g', value: 4, unit: 'cm', tone: 'green' }, { label: 'حدّ التلف', value: 7, unit: 'cm', tone: 'rose' }], ariaLabel: 'نابض في مخبر العلوم طوله 12 cm: الكتلة 6 g تعطي استطالة 1,5 cm والكتلة 16 g تعطي 4 cm، ويفسد إذا تجاوزت استطالته 7 cm' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Les acquis que « أستعدّ » diagnostique (prérequis du propriétaire) : déterminer une fonction
  // linéaire (leçon 2), son graphique et la lecture graphique (leçon 3), les pourcentages (leçon 4),
  // les étapes du ترييض (unité 4, ترييض مشكلة).
  priorKnowledge: ['tayin-dala-khattiya', 'qiraa-bayaniya', 'nisba-mia', 'sura-mutawassita', 'tarrid-khutuwat'],
  resources: [
    // Module 1 : نشاط 4 (« quel graphique est proportionnel ? a ? sens géométrique de a ? ») rendu
    // manipulable. مبتدئ : le câble du téléphérique, ancré en O, à faire passer par trois pylônes
    // (a = 0,5 ; contexte plateforme : les points kg × DA du manuel n'entrent dans aucun monde du lab —
    // content/textbook.js › LAB) ; متقدم : le ressort de la طريقة (p. 71) et ses deux lectures.
    {
      kind: 'manipulation', code: 'origin-line-telefrik-0-5', type: 'origin-line', module: 1,
      level: 'beginner',
      title: 'التلفريك: الحبل يمرّ برؤوس الأعمدة',
      objective: 'ترييض وضعية تناسبية: نقط القياس على مستقيم يشمل المبدأ، معامل توجيهه a هو معامل التناسبية، فنكتب y = ax ونقرأ به',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'cablecar' },
      learningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'origin-line-nabid-0-3', type: 'origin-line', module: 1,
      level: 'advanced',
      title: 'النابض: الاستطالة بدلالة الكتلة المعلّقة',
      objective: 'ترييض وضعية تناسبية: نقط القياس على مستقيم يشمل المبدأ، معامل توجيهه a هو معامل التناسبية، فنكتب y = ax ونقرأ به',
      autonomy: 'معامل عشري (0,3) لا يُقرأ على عقدة الشبكة: التلميذ يضبط المستقيم بنفسه على أربع نقط قياس، ثم يستعمله وحده لقراءة صورة 10 والعدد الذي صورته 2,1 خارج مجال القياسات',
      experience: { type: 'textbook', reason: '', theme: 'spring' },
      learningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2'],
      sourceElementIds: ['act-4', 'method-spring'],
    },
    // Les trois « مسائل » (modules 4–6) : exercices complets de type امتحان, ajouts déclarés
    // de la plateforme (content/problems.js), sans aucune preuve de maîtrise.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — نابض في مخبر العلوم: الدستور، الصورة، وأكبر كتلة', learningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2', '4am_tarrid-khatti_P3'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — محلّ نسخ الوثائق: ثمن الصفحة من التمثيل البياني', learningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2', '4am_tarrid-khatti_P3'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — عسل النحّال: جدول الأثمان والقارورات ومدخول الموسم', learningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2', '4am_tarrid-khatti_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'تسع عبارات: تعيين دالة خطية، القراءة البيانية، النسب المئوية والسرعة المتوسطة، خطوات الترييض. صحيح أم خاطئ؟',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'tamthilat', path: `${LESSON_BASE_PATH}/tamthilat`,
      title: 'نشاط 4 — أيّ تمثيل يعبّر عن وضعية تناسبية؟', desc: 'أدِر المستقيم حول المبدأ حتى يمرّ بكل النقط: حبل التلفريك ثم النابض. ثم التمثيلات الثلاثة للكتاب: سعر البطاطا، محيط مستطيل، مساحة مربع. الكتاب ص 67.',
      stage: 'trigger', teachesLearningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أضبط المستقيم' },
    { id: '02', number: 2, slug: 'tarayiq', path: `${LESSON_BASE_PATH}/tarayiq`,
      title: 'طرائق — النابض والتحدّي', desc: 'أتمم جدول النابض، ثم حلّ الكتاب سطرًا سطرًا، الجسر بين الجدول والدستور والتمثيل، تفسير النتيجة، وتحدّي المركبتين.',
      stage: 'discovery', teachesLearningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2', '4am_tarrid-khatti_P3'],
      color: 'violet', style: 'featured', estimatedMin: 14, difficulty: 3, actionText: 'أتعلّم الطريقة' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تمارين أتعمّق 28، 29، 31، 34، 35، 36: درّاج، تسعيرتان، سدّ، تخفيضات وقسم يلعب كرة القدم.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2', '4am_tarrid-khatti_P3'],
      color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — النابض الجديد', desc: 'مسألة الدرس: من قياسين إلى الدستور، صورة كتلة، الكتلة التي تعطي استطالة، وأكبر كتلة يتحمّلها النابض.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2', '4am_tarrid-khatti_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — محلّ نسخ الوثائق', desc: 'ثمن الصفحة من التمثيل البياني، ثمن سلاسل القسم، وكم سلسلة بالميزانية؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2', '4am_tarrid-khatti_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — عسل النحّال', desc: 'من جدول الأثمان إلى الدستور، قارورات كاملة، ومدخول الموسم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_tarrid-khatti_P1', '4am_tarrid-khatti_P2', '4am_tarrid-khatti_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث: النمذجة، الانتقال بين الأشكال، التفسير.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
