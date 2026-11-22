/**
 * الدرس — مقارنة الأعداد العشرية وترتيبها (1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية »). Le QUATRIÈME درس de l'unité par ordre du
 * manuel, généré DANS son entrée du catalogue (item 1am.m1.r04), cycle moyen phase 3, batch 4 entrée 2, 2026-10-15 — APRÈS
 * `kitabat-adad-tabii` (les rangs d'une écriture) et `kusur-ashriya-kitaba` (la virgule, 2,50 = 2,5), sur lesquels il s'appuie sans les
 * reconstruire (lien du réseau 1am.m1.r02 → 1am.m1.r04). Manuel 1AM (الجيل الثاني) : نشاط 5 p. 10, معارف 6 et 7 p. 15, طريقة 3 p. 16 avec
 * « دوري الآن », exercices 17–20 p. 18, أقوّم 8 et 9 p. 19, أتعمّق 3 ③④ p. 20, TIC p. 22, استحضر مكتسباتي item 5 p. 8.
 * Source : docs/sources/1am/unit1/extraction.json ; brief des auteurs : docs/sources/1am/unit1/brief-authors.md (« Lesson 4 »).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours, et la leçon ne renvoie jamais au livre
 * (§4ter-bis) : tout est réécrit, autres contextes, autres nombres.
 *   Entrée retenue : la piste de saut en longueur d'une journée sportive (labo `ruler-compare`, monde `jump`). Deux sauts sont mesurés
 *   à la règle ; la main tient la GRADUATION de la règle (m, dm, cm, mm). À chaque graduation un saut se LIT comme un nombre ENTIER de
 *   graduations plus un reste hachuré ; le verdict « < = > » n'est permis que lorsque la règle SÉPARE les deux sauts. C'est là que la
 *   comparaison devient NÉCESSAIRE sous la main : 4,6 m contre 4,35 m (le piège « 35 > 6 » tombe dès que la règle est au centimètre :
 *   460 contre 435), 8,05 contre 8,5 (le zéro garde la place), 12,70 contre 12,7 (l'égalité), 9,87 contre 10,2 (les parties entières
 *   décident, la règle la plus grossière suffit). La comparaison rang par rang (le premier rang où les chiffres diffèrent décide) et
 *   la complétion par des zéros (deux entiers de graduations) sont DÉCOUVERTES, jamais annoncées ; متقدم : ranger une suite sur le podium.
 *   Rejetées : (a) le نشاط 5 du manuel comme entrée (quatre réponses d'élèves à juger, « ما رأيك؟ » avant tout geste : une question à
 *   laquelle on répond de mémoire) — il devient une APPLICATION en أتمرّن ; (b) une demi-droite graduée où l'on place deux points
 *   (c'est le terrain de la leçon suivante de l'unité, `adad-ashri-mustaqim-mudarraj`, avec son zoom) ; (c) un tableau de notes à trier
 *   (un contexte de tri, mais où la main ne tient aucune variable : il devient l'exercice TIC en أتمرّن).
 *   Ordre des idées : la règle sépare les sauts (4,6 contre 4,35 : P1/P2) → le zéro qui garde la place (8,05 contre 8,5 : P1/P2) → deux
 *   écritures du même nombre (12,70 = 12,7 : P2) → la partie entière décide (9,87 contre 10,2 : P1) → ranger une suite (P3) → معارف
 *   (les noms, les symboles < >, croissant et décroissant) → طريقة (comparer puis ranger avec la règle des deux cas) → أتمرّن (les
 *   activités du manuel posées en application) → trois مسائل → إختبار أولي.
 *   « أستعدّ » mesure `1am.m1.r02` (le lien du réseau : les rangs d'une écriture décimale et le zéro inutile 6,50 = 6,5) et la
 *   comparaison des entiers du primaire.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/muqaranat-adad-ashriya';

export const LESSON_CONFIG = {
  id: 'muqaranat-adad-ashriya',
  kind: 'lesson',
  unit: 'adad-tabiiya-ashriya',
  unitTitle: 'الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'مقارنة الأعداد العشرية وترتيبها',
  description: 'في حفرة القفز نغيّر تدريج المسطرة حتى تفصل بين قفزتين: نقارن الجزأين الصحيحين ثم الأرقام العشرية رتبةً برتبة، ونكمل بأصفار غير ضرورية لنعيد المقارنة إلى عددين طبيعيين، ثم نرتّب سلسلة أعداد عشرية بالرمزين < و >.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 82,
  textbookRef: { unit: 1, activity: 5, pages: '8, 10, 15, 16, 18, 19, 20, 22' },
  skills: [
    'مقارنة عددين عشريين (مكتوبين بالفاصلة أو على شكل كسرين عشريين) جزآهما الصحيحان مختلفان أو متساويان، بمقارنة الجزأين الصحيحين ثم الأرقام رتبة برتبة',
    'تفادي الخطإ الشائع «$3{,}14 > 3{,}2$ لأن $14>2$» بإتمام الأرقام العشرية بأصفار غير ضرورية ليصير للعددين عدد الأرقام نفسه بعد الفاصلة (مثل $3{,}2=3{,}20$)',
    'ترتيب سلسلة أعداد عشرية تصاعديا أو تنازليا واستعمال الرمزين $<$ و $>$، وتشكيل أصغر أو أكبر عدد عشري من أرقام معطاة',
  ],
  teachingScope: {
    include: ['مقارنة عددين عشريين بمقارنة الجزأين الصحيحين ثم الأرقام رتبة برتبة', 'إتمام الأرقام العشرية بأصفار غير ضرورية', 'الرمزان < و > وقراءتهما', 'الترتيب التصاعدي والتنازلي لسلسلة أعداد عشرية', 'أصغر وأكبر عدد عشري من أرقام معطاة'],
    exclude: ['الكتابة العشرية والكسر العشري وإزاحة الفاصلة (درس «الكسور العشرية والكتابة العشرية»)', 'تمثيل الأعداد العشرية على نصف مستقيم مدرّج (الدرس الموالي)', 'الحصر والقيم المقرّبة (درس لاحق)', 'إدراج عدد عشري بين عددين'],
  },
  // « مسألة الدرس » : comparer, ranger et trouver le plus grand et le plus petit, dans la même histoire (module 5).
  lessonProblem: {
    module: 5,
    title: 'سلال التعاونية',
    statement: 'جمعت تعاونية المدرسة أربع سلال من التفاح ووزنتها بالكيلوغرام: كتلة السلة الأولى 3,25 والثانية 3,205 والثالثة 3,5 والرابعة 3,052. تقدّم السلة الأثقل هديةً لدار المسنّين المجاورة تضامنًا معهم. اشترى أحد الأولياء 12 تفاحة من السلة الثانية.',
    questions: [
      { label: '1)', text: 'قارن بين كتلتي السلة الأولى والسلة الثانية.' },
      { label: '2)', text: 'رتّب كتل السلال الأربع ترتيبًا تصاعديًا.' },
      { label: '3)', text: 'أيّ السلال تُهدى لدار المسنّين؟' },
    ],
    illustration: { kind: 'tags', cards: [
      { title: 'السلة الأولى', icon: 'crate', lines: [{ label: 'الكتلة', value: '3,25', unit: 'كغ' }] },
      { title: 'السلة الثانية', icon: 'crate', lines: [{ label: 'الكتلة', value: '3,205', unit: 'كغ' }] },
      { title: 'السلتان الأخريان', icon: 'crate', lines: [{ label: 'الثالثة', value: '3,5', unit: 'كغ' }, { label: 'الرابعة', value: '3,052', unit: 'كغ' }] },
    ], ariaLabel: 'أربع سلال تفاح كتلها 3,25 و 3,205 و 3,5 و 3,052 كيلوغرامات' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : comparer des entiers (primaire), les rangs d'une écriture décimale (item du réseau `1am.m1.r02`,
  // leçon kitabat-adad-tabii) et le zéro inutile (leçon kusur-ashriya-kitaba, même item).
  priorKnowledge: ['muqarana-tabii-ibtidai', 'maratib-ibtidai', 'asfar-ibtidai'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `ruler-compare` (la main tient la GRADUATION de la règle), monde `jump` :
    //   مبتدئ — quatre comparaisons de sauts (plateforme) : 4,6 / 4,35, 8,05 / 8,5, 12,70 / 12,7, 9,87 / 10,2.
    //   متقدم — ranger deux suites sur le podium (croissant puis décroissant, avec des égaux et un entier).
    {
      kind: 'manipulation', code: 'ruler-compare-compare', type: 'ruler-compare', module: 1,
      level: 'beginner',
      title: 'حفرة القفز: أيّ القفزتين أبعد؟',
      objective: 'نقارن عددين عشريين بمقارنة جزأيهما الصحيحين ثم الأرقام رتبة برتبة، أو بإتمام الأرقام بأصفار غير ضرورية حتى نقارن عددين طبيعيين، ونرتّب سلسلة أعداد عشرية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'sandpit' },
      learningPointIds: ['1am_muqaranat-adad-ashriya_P1', '1am_muqaranat-adad-ashriya_P2'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'ruler-compare-order', type: 'ruler-compare', module: 1,
      level: 'advanced',
      title: 'حفرة القفز: منصّة التتويج',
      objective: 'نقارن عددين عشريين بمقارنة جزأيهما الصحيحين ثم الأرقام رتبة برتبة، أو بإتمام الأرقام بأصفار غير ضرورية حتى نقارن عددين طبيعيين، ونرتّب سلسلة أعداد عشرية',
      autonomy: 'يختار التلميذ بنفسه تدريج المسطرة الذي يكفي لقراءة السلسلة كلها، ثم يضع القفزات في أماكنها على المنصّة تصاعديًا أو تنازليًا',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'sandpit' },
      learningPointIds: ['1am_muqaranat-adad-ashriya_P2', '1am_muqaranat-adad-ashriya_P3'],
      sourceElementIds: ['act-5'],
    },
    // Module 3 — le MÊME instrument posé seul (`levels={false}`) : une suite de six nombres à ranger avec les deux cas de la méthode.
    {
      kind: 'manipulation', code: 'ruler-compare-method', type: 'ruler-compare', module: 3,
      title: 'ألف مقارنة وأرتّب: ست قفزات على المنصّة',
      learningPointIds: ['1am_muqaranat-adad-ashriya_P1', '1am_muqaranat-adad-ashriya_P3'],
      sourceElementIds: ['method-3', 'now-16'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — سلال التعاونية', learningPointIds: ['1am_muqaranat-adad-ashriya_P1', '1am_muqaranat-adad-ashriya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — خزّانات الماء', learningPointIds: ['1am_muqaranat-adad-ashriya_P2', '1am_muqaranat-adad-ashriya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — بطاقات الأرقام', learningPointIds: ['1am_muqaranat-adad-ashriya_P2', '1am_muqaranat-adad-ashriya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ مقارنة الأعداد الطبيعية، رتب العدد العشري، الصفر الأخير.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — القفز الطويل', desc: 'قفزتان تفصل بينهما المسطرة: أيّهما أبعد؟ ثم منصّة التتويج.',
      stage: 'trigger', teachesLearningPointIds: ['1am_muqaranat-adad-ashriya_P1', '1am_muqaranat-adad-ashriya_P2', '1am_muqaranat-adad-ashriya_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المقارنة والترتيب', desc: 'الجزء الصحيح أوّلًا، ثم الأرقام رتبةً برتبة، وإتمام الأصفار، والرمزان < و >.',
      stage: 'discovery', teachesLearningPointIds: ['1am_muqaranat-adad-ashriya_P1', '1am_muqaranat-adad-ashriya_P2', '1am_muqaranat-adad-ashriya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أقارن وأرتّب', desc: '23,48 و 23,5: حالتان، ثم ترتيب سلسلة بالمنصّة.',
      stage: 'formalization', teachesLearningPointIds: ['1am_muqaranat-adad-ashriya_P1', '1am_muqaranat-adad-ashriya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'أقوال أربعة أصدقاء، علاقات كسور وأعداد، ترتيب تصاعدي وتنازلي، بطاقات الأرقام، علامات القسم.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_muqaranat-adad-ashriya_P1', '1am_muqaranat-adad-ashriya_P2', '1am_muqaranat-adad-ashriya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — سلال التعاونية', desc: 'مسألة الدرس: مقارنة، ترتيب، وأثقل سلة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_muqaranat-adad-ashriya_P1', '1am_muqaranat-adad-ashriya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — خزّانات الماء', desc: 'أعداد متساوية بكتابتين، وأيّ الخزّانات أمتلأ؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_muqaranat-adad-ashriya_P2', '1am_muqaranat-adad-ashriya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — بطاقات الأرقام', desc: 'أصغر وأكبر عدد عشري من أرقام معطاة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_muqaranat-adad-ashriya_P2', '1am_muqaranat-adad-ashriya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
