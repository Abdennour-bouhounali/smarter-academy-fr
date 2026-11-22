/**
 * الدرس — جداء كسرين (2AM, unité 2 « الكسور والعمليات عليها ») — la QUATRIÈME leçon de l'unité (2am.m1.r07), générée DANS son entrée du catalogue (même code, même item), cycle moyen phase 3,
 * 2026-10-29. Manuel 2AM (الجيل الثاني, منشورات الشهاب) : نشاط 5 p. 25, معارف 2 p. 28, طريقة 4 p. 29, أوظّف pp. 31–32, أؤكّد p. 33, أتعمّق pp. 34–35.
 * Source de vérité : docs/sources/2am/unit2/extraction.json ; plan : docs/sources/2am/unit2/plan/jida-kasrayn.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter–§4quinquies) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « ستائر النافذة » — la maîtresse veut le coin le plus sombre de la fenêtre de la classe : un rideau latéral couvre une partie de la LARGEUR, un store à enrouleur une partie de la HAUTEUR ;
 *   seul le verre couvert par les DEUX est doublement ombré. La main tient les DEUX facteurs (deux tirages perpendiculaires qui se collent aux crans du rail et du cordon), les ombres découpent le verre en
 *   b × d petits carrés dont a × c sont sombres : l'aire du coin est le PRODUIT ; l'élève écrit la fraction, et les fausses écritures (17/12, 6/7, 8/9...) sont posées devant lui par un cadre en pointillé de leur aire.
 *   Rejetées : (a) l'activité 5 du manuel (un gâteau déjà découpé en 7 × 3 : le découpage est DONNÉ, la main ne fait rien) → application de أتمرّن ; (b) le papier plié (les plis sont illisibles au 1/5) ;
 *   (c) une parcelle plantée sur une partie d'une partie (le monde du semis est celui de `seed-rake` en 3AM, et les sujets d'examen reprennent déjà les terrains).
 *   Ordre des idées : deux tirages → le coin doublement ombré nommé par une fraction (on compte les petits carrés) → la règle (numérateurs × numérateurs, dénominateurs × dénominateurs) → « de » = × (3/4 de 2/3) → un naturel × une fraction
 *   (rideau sur deux fenêtres) → des facteurs > 1 (mur de verre) → معارف → طريقة (d'une quantité, d'une fraction, décimal × fraction) → pratique, trois مسائل (d'un reste), test.
 *
 * HISTOIRE DES الكفاءات (positions gardées : les identifiants sont positionnels) — brouillon → texte final :
 *   P1  « حساب جداء كسرين بضرب البسطين ... » → + son sens (AIRE d'un rectangle de côtés a/b et c/d, activité 5) et l'ARITHMÉTIQUE d'après : « ثمّ اختزال الناتج » (1AM `ikhtizal`, rappelé) ;
 *   P2  « حساب جداء عدد (طبيعي أو عشري) في كسر » → + la formule n × a/b = (n × a)/b et deux exemples (4 × 3/11 ; 5/7 × 2,8) ;
 *   P3  « أخذ كسر من عدد، مثل 2/7 de 35 » → SENS ÉTENDU : « كسر من كمية » ET « كسر من كسر » (le sens du produit que l'activité 5 montre), et « كسر الباقي » (book ex-28, ex-34, deep-39). « a/b d'un NOMBRE par trois
 *       procédés » est la leçon PRÉVUE de 1AM `akhdh-kasr-min-adad` : rappelée par un « تذكّر » sans lien.
 * Le réseau : 2am.m1.r07 PROLONGE 1am.m5.r03 (`kusur-ashriya-kitaba`, publiée), valeur ajoutée « ضرب كسرين كيفيين، لا الكسور العشرية فقط » : M2 s'ouvre sur un « تذكّر — السنة الأولى » AVEC lien.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/jida-kasrayn';

export const LESSON_CONFIG = {
  id: 'jida-kasrayn',
  kind: 'lesson',
  unit: 'kusur-amaliyat',
  unitTitle: 'الكسور والعمليات عليها',
  sequentialUnlock: true,
  title: 'جداء كسرين',
  description: 'نسحب ستارتين على نافذة القسم فنكتشف أنّ جزءًا من جزء يُحسب بضرب البسطين والمقامين، ونضرب عددًا في كسر، ونترجم «كسر من كمية» و«كسر من الباقي» إلى جداء.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🪟',
  estimatedDurationMin: 66,
  textbookRef: { unit: 2, activity: 5, pages: '25, 28, 29' },
  skills: [
    'حساب جداء كسرين بضرب البسطين فيما بينهما والمقامين فيما بينهما: $\\frac{a}{b}\\times\\frac{c}{d}=\\frac{a\\times c}{b\\times d}$ ، وتفسيره بمساحة مستطيل بُعداه $\\frac{a}{b}$ و $\\frac{c}{d}$ ، ثمّ اختزال الناتج',
    'حساب جداء عدد (طبيعي أو عشري) في كسر: $n\\times\\frac{a}{b}=\\frac{n\\times a}{b}$ ، مثل $4\\times\\frac{3}{11}=\\frac{12}{11}$ و $\\frac{5}{7}\\times 2{,}8=\\frac{14}{7}=2$',
    'ترجمة «كسر من كمية» و«كسر من كسر» بجداء، مثل $\\frac{3}{8}$ من $48$ هو $48\\times\\frac{3}{8}=18$ و $\\frac{3}{4}$ من $\\frac{2}{5}$ هو $\\frac{3}{10}$ ، وتوظيفها في وضعيات «كسر من الباقي»',
  ],
  teachingScope: {
    include: ['جداء كسرين ومعناه بالمساحة، ثم اختزال الناتج', 'جداء عدد طبيعي أو عشري في كسر', 'كسر من كمية، وكسر من كسر، وكسر من الباقي', 'ثلاثة عوامل'],
    exclude: ['مقلوب عدد وقسمة على كسر (السنة الثالثة)', 'الاختزال قبل الضرب كقاعدة (السنة الثالثة)', 'الأعداد السالبة', 'النسبة المئوية'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'تعاونية البرتقال',
    statement: 'باعت تعاونية $\\frac{1}{4}$ من غلّتها من البرتقال، ثم باعت $\\frac{2}{3}$ مما بقي. غلّة التعاونية $2400$ kg.',
    questions: [
      { label: '1)', text: 'ما الجزء من الغلّة الذي بقي بعد البيع الأوّل؟' },
      { label: '2)', text: 'ما الكسر الذي يمثّله البيع الثاني من الغلّة كلّها؟' },
      { label: '3)', text: 'ما الجزء من الغلّة الذي بيع في المرّتين معًا؟' },
      { label: '4)', text: 'كم كيلوغرامًا بقي بعد البيعين؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'البيع الأوّل', icon: 'crate', lines: [{ label: 'بيع', value: '1/4', unit: 'الغلّة' }] }, { title: 'البيع الثاني', icon: 'crate', lines: [{ label: 'بيع', value: '2/3', unit: 'الباقي' }] }], ariaLabel: 'بطاقتان: ربع الغلّة في البيع الأوّل وثلثا الباقي في البيع الثاني' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m5.r03` (le produit de fractions décimales — items 1 et 2), le quotient (item 3), l'aire d'un rectangle (item 4), « كسر من عدد » (item 5, leçon PRÉVUE de 1AM) et « الباقي » (item 6, leçon PUBLIÉE `jam-tarh-kusur`).
  priorKnowledge: ['kusur-ashriya-darb-1am', 'kasr-hasil-qisma-1am', 'misahat-mustatil', 'akhdh-kasr-1am', 'jam-tarh-kusur-2am'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `window-blinds` (la main tient les DEUX facteurs : le rideau latéral a/b de la largeur et le store c/d de la hauteur) :
    //   مبتدئ — w1 2/3 × 3/4 · w2 1/2 × 3/5 · w3 4/5 × 2/3 (la règle).
    //   متقدم — le produit est ÉCRIT avant de tirer : 3/2 × 2/3 · 5/4 × 3/5 · 7/4 × 4/3 (mur de 4 fenêtres) · 2 × 3/5.
    {
      kind: 'manipulation', code: 'window-blinds-pull', type: 'window-blinds', module: 1,
      level: 'beginner',
      title: 'ستائر النافذة: أسحب الستارتين ثم أكتب الجزء المظلم',
      objective: 'نكتشف أنّ الجزء من الجزء يُحسب بالضرب: الظلّان يقسّمان الزجاج إلى مربّعات صغيرة، عددها جداء المقامين، والداكن منها جداء البسطين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'classwindow' },
      learningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P2', '2am_jida-kasrayn_P3'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'window-blinds-predict', type: 'window-blinds', module: 1,
      level: 'advanced',
      title: 'ستائر النافذة: أتوقّع ثم أتأكّد',
      objective: 'نكتشف أنّ الجزء من الجزء يُحسب بالضرب: الظلّان يقسّمان الزجاج إلى مربّعات صغيرة، عددها جداء المقامين، والداكن منها جداء البسطين',
      autonomy: 'يكتب التلميذ الجزء المظلم مرّتين قبل أن يسحب الستارتين، ثم يسحب ليتأكّد، ويجرّب عاملين أكبر من $1$ وعددًا طبيعيًا مضروبًا في كسر',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'classwindow' },
      learningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P2', '2am_jida-kasrayn_P3'],
      sourceElementIds: ['method-4'],
    },
    {
      kind: 'manipulation', code: 'window-blinds-maarif', type: 'window-blinds', module: 2,
      title: 'ستائر النافذة: ثلاثة أرباع في خُمسين',
      objective: 'نكتشف أنّ الجزء من الجزء يُحسب بالضرب: الظلّان يقسّمان الزجاج إلى مربّعات صغيرة، عددها جداء المقامين، والداكن منها جداء البسطين',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'classwindow' },
      learningPointIds: ['2am_jida-kasrayn_P1'],
      sourceElementIds: ['know-2c'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — تعاونية البرتقال', learningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — رحلة العائلة', learningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P3'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ورود الحديقة', learningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ ضرب الكسور العشرية، والكسر حاصل قسمة، ومساحة المستطيل، وكسر من عدد، والباقي.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — ستائر النافذة', desc: 'اسحب الستارة الجانبية والستارة الدوّارة على نافذة القسم: ما الجزء المظلم مرّتين؟',
      stage: 'trigger', teachesLearningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P2', '2am_jida-kasrayn_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 20, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — جداء كسرين', desc: 'قاعدة ضرب كسرين، وضرب عدد طبيعي في كسر، وكسر من كسر.',
      stage: 'discovery', teachesLearningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P2', '2am_jida-kasrayn_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أترجم «من» إلى ضرب', desc: 'كسر من عدد، كسر من كسر، وعدد عشري مضروب في كسر.',
      stage: 'formalization', teachesLearningPointIds: ['2am_jida-kasrayn_P2', '2am_jida-kasrayn_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'سبعة تمارين: لوح الحلوى، وجداءات واختزال، والعدد الدخيل، وحجم علبة، وحقل، ونصف وضعف وثلث، وقاعة عرض.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P2', '2am_jida-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — تعاونية البرتقال', desc: 'مسألة الدرس: ربع الغلّة ثم ثلثا الباقي.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — رحلة العائلة', desc: 'ثلث الخزّان ثم نصف الباقي: كم لترًا بقي؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ورود الحديقة', desc: 'مستطيل ورود مأخوذ من مستطيل الحديقة: مساحته بطريقتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_jida-kasrayn_P1', '2am_jida-kasrayn_P3'],
      color: 'amber', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
