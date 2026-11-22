/**
 * الدرس — الكتابات الكسرية لحاصل قسمة واختزال كسر (1AM, unité 4 « الكتابات الكسرية »).
 * Manuel 1AM (الجيل الثاني) : نشاط 4 p. 54, معارف 3 p. 55 (+ « 0,7 = 7/10 » de معارف 1), طريقة p. 56 « اختزال كتابة
 * كسرية » et دوري الآن ②③, exercices 15–27 p. 58, أقوّم 4–5 p. 59 au إختبار أولي, أتعمّق 1 et 8 p. 60 (مسائل), le تحدّ de
 * l'unité p. 51 et la calculatrice p. 62. Généré DANS son entrée du catalogue (items 1am.m5.r01, 1am.m5.r02, 1am.m5.x1),
 * cycle moyen phase 3, 2026-10-14 — AVANT « حاصل القسمة والكسر » (file du réseau) : le sens quotient n'est que rappelé.
 * Source : docs/sources/1am/unit4/extraction.json ; brief : docs/sources/1am/unit4/brief-authors.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le plateau de la grand-mère (قلب اللوز, 3/5 pour les voisins) — la main tient le COUTEAU : le nombre de
 *   morceaux change, la part ne bouge jamais ; la proposition 4/6 est jugée par le plateau (plateforme). Rejetée : le نشاط 4 du
 *   manuel comme entrée (trois rectangles et la comparaison posée avant tout geste) ; il reste le niveau متقدم, avec le cadeau
 *   du grand-père 27/45 prédit puis réduit. Ordre des idées : couteau (même part, d'autres écritures) → comparaison →
 *   compléter (brique APRÈS la réponse) → POURQUOI 27/45 = 3/5 → معارف : appliquer la règle, la règle ENSUITE, l'écriture
 *   décimale, l'irréductible → méthode.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/1am/ansab_al_aadad_wal_hisab/ikhtizal-kitaba-kasriya';

export const LESSON_CONFIG = {
  id: 'ikhtizal-kitaba-kasriya',
  kind: 'lesson',
  unit: 'kitabat-kasriya',
  unitTitle: 'الكتابات الكسرية',
  sequentialUnlock: true,
  title: 'الكتابات الكسرية لحاصل قسمة واختزال كسر',
  description: 'نفس العدد له كتابات كسرية عديدة: نضرب البسط والمقام في نفس العدد أو نقسمهما عليه، نمرّ بين الكسر العشري والكتابة العشرية، ونختزل كسرا بقواعد قابلية القسمة حتى أبسط شكل ممكن.',
  level: 'moyen',
  grade: '1am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🍰',
  estimatedDurationMin: 89,
  textbookRef: { unit: 4, activity: 4, pages: '51, 52, 54, 55, 56, 58, 59, 60, 62' },
  skills: [
    'إنتاج كتابات كسرية مختلفة لنفس العدد بضرب البسط والمقام في نفس العدد غير المعدوم أو بقسمتهما عليه',
    'الانتقال بين الكتابة العشرية لعدد عشري وكتابته على شكل كسر عشري، وتحويل كتابة كسرية إلى كسر عشري ثم إلى كتابة عشرية عندما يكون ذلك ممكنا',
    'اختزال كتابة كسرية بالبحث عن قاسم مشترك للبسط والمقام بقواعد قابلية القسمة، مرّة أو عدّة مرّات حتى أبسط شكل ممكن',
  ],
  teachingScope: {
    include: ['كتابات كسرية متساوية لنفس العدد (الضرب والقسمة في نفس العدد)', 'الكسر العشري والكتابة العشرية', 'اختزال كسر بقواعد قابلية القسمة حتى أبسط شكل ممكن'],
    exclude: ['الكسر حاصل قسمة و $\\frac{a}{b}\\times b=a$ (درس «حاصل القسمة والكسر»: تذكير فقط)', 'أخذ كسر من عدد (درس لاحق)', 'الاختزال بالقاسم المشترك الأكبر (السنة الرابعة)'],
  },
  // « مسألة الدرس » : elle prolonge le grand-père du نشاط 4 (deux parts d'un même montant), résolue au module 6.
  lessonProblem: {
    module: 6,
    title: 'هديّة الجدّ',
    statement: 'بمناسبة نجاحهما، يعرض الجدّ على حفيديه أمين وريم أن يأخذ أمين $\\frac{18}{30}$ من مبلغ 4500 دج، وأن تأخذ ريم $\\frac{9}{15}$ من نفس المبلغ. قالت ريم بإنصاف: «أظنّ أنّ حصّتينا متساويتان».',
    questions: [
      { label: '1)', text: 'اختزل الكسر $\\frac{18}{30}$ إلى أبسط شكل ممكن، ثم الكسر $\\frac{9}{15}$.' },
      { label: '2)', text: 'هل ريم على حق؟ علّل دون حساب الحصّتين.' },
      { label: '3)', text: 'اكتب الكسر $\\frac{9}{15}$ على شكل كسر عشري مقامه 10، ثم أعط كتابته العشرية.' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'حصّة أمين', icon: 'coin', lines: [{ label: 'الكسر', value: '18/30' }, { label: 'من مبلغ (دج)', value: 4500 }] }, { title: 'حصّة ريم', icon: 'coin', lines: [{ label: 'الكسر', value: '9/15' }, { label: 'من مبلغ (دج)', value: 4500 }] }], ariaLabel: 'بطاقتان: حصّة أمين 18/30 من 4500 دج، وحصّة ريم 9/15 من 4500 دج' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : la fraction partie d'un tout (primaire, manuel p. 52 item 9), l'item du réseau
  // `1am.m1.r02` (écriture décimale ↔ fraction décimale, manuel items 1–2 + plateforme) et `1am.m3.r02` (قواعد قابلية القسمة).
  priorKnowledge: ['kasr-juz-ibtidai', 'kitaba-ashriya-kasriya', 'qawaid-qabiliyat-qisma'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `fraction-knife` (le couteau tient d, le nombre de morceaux) :
    //   مبتدئ — le plateau de قلب اللوز de grand-mère, la part des voisins 3/5, la proposition d'Amine « 4/6 ».
    //   متقدم — les trois rectangles du نشاط 4 (3/5, 6/10, 12/20) puis le cadeau du grand-père 27/45, prédit puis réduit.
    {
      kind: 'manipulation', code: 'fraction-knife-tray', type: 'fraction-knife', module: 1,
      level: 'beginner',
      title: 'صينية الجدّة: حصّة الجيران',
      objective: 'نفس الحصّة لها كتابات كسرية عديدة: نضرب البسط والمقام في نفس العدد، أو نقسمهما على نفس العدد فنختزل الكسر',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'sweets-tray' },
      learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1', '1am_ikhtizal-kitaba-kasriya_P2'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'fraction-knife-paper', type: 'fraction-knife', module: 1,
      level: 'advanced',
      title: 'نشاط 4: المستطيلات الثلاثة وهديّة الجدّ',
      objective: 'نفس الحصّة لها كتابات كسرية عديدة: نضرب البسط والمقام في نفس العدد، أو نقسمهما على نفس العدد فنختزل الكسر',
      autonomy: 'يتوقّع التلميذ بنفسه عدد القطع الذي تبقى فيه هديّة الجدّ مقروءة، ثم يقطع ليختبر توقّعه ويختزل $\\frac{27}{45}$ دون حساب المبلغ',
      experience: { type: 'textbook', reason: '' },
      learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1', '1am_ikhtizal-kitaba-kasriya_P3'],
      sourceElementIds: ['act-4'],
    },
    { kind: 'situation', code: 'masala-1', module: 6, title: 'مسألة الدرس — هديّة الجدّ', learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1', '1am_ikhtizal-kitaba-kasriya_P2', '1am_ikhtizal-kitaba-kasriya_P3'] },
    { kind: 'situation', code: 'masala-2', module: 7, title: 'مسألة — مثلثان في مربع', learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1', '1am_ikhtizal-kitaba-kasriya_P3'] },
    { kind: 'situation', code: 'masala-3', module: 8, title: 'مسألة — الرمز 5Δ2□', learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ الكتابة العشرية، الكسور، قواعد قابلية القسمة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 8, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط 4 — نفس الحصّة', desc: 'نقطع الصينية قطعًا أكثر أو أقل: متى تبقى الحصّة مكتوبة بكسر؟',
      stage: 'trigger', teachesLearningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — الكتابات الكسرية لحاصل القسمة', desc: 'القاعدة، الكسر العشري والكتابة العشرية، ومعنى «اختزلنا الكسر».',
      stage: 'discovery', teachesLearningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1', '1am_ikhtizal-kitaba-kasriya_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — اختزال كتابة كسرية', desc: 'الكسر 45/567: نبحث عن قاسم مشترك بقواعد قابلية القسمة.',
      stage: 'formalization', teachesLearningPointIds: ['1am_ikhtizal-kitaba-kasriya_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'تمارين الكتاب 15 ، 18 ، 20 ، 21 ، 23 ، 25 و 27.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1', '1am_ikhtizal-kitaba-kasriya_P2', '1am_ikhtizal-kitaba-kasriya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'tahaddi', path: `${LESSON_BASE_PATH}/tahaddi`,
      title: 'تحدّي الوحدة — أين أضع الفاصلة؟', desc: 'من الكسر العشري إلى الكتابة العشرية، ثم الآلة الحاسبة تختزل.',
      stage: 'practice_lab', teachesLearningPointIds: ['1am_ikhtizal-kitaba-kasriya_P2', '1am_ikhtizal-kitaba-kasriya_P3'],
      color: 'rose', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أرفع التحدّي' },
    { id: '06', number: 6, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — هديّة الجدّ', desc: 'مسألة الدرس: كسران لنفس الحصّة؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1', '1am_ikhtizal-kitaba-kasriya_P2', '1am_ikhtizal-kitaba-kasriya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مثلثان في مربع', desc: 'نعبّر بكسر عن جزء ملوّن، ثم نختزله.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1', '1am_ikhtizal-kitaba-kasriya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — الرمز 5Δ2□', desc: 'أرقام مجهولة وقابلية القسمة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['1am_ikhtizal-kitaba-kasriya_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '09', number: 9, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
