/**
 * الدرس — الكسر: نسبة وحاصل قسمة وقيم مقرّبة (2AM, unité 2 « الكسور والعمليات عليها ») — la DEUXIÈME leçon de l'unité (2am.m1.r05, r06), générée DANS son entrée du catalogue (même code,
 * mêmes items), cycle moyen phase 3, 2026-10-28. Manuel 2AM (الجيل الثاني, منشورات الشهاب) : أنشطة 2 et 3 p. 24, معارف 1 p. 26, طرائق p. 27, دوري الآن pp. 27 et 29, أوظّف pp. 30 et 33, أتعمّق pp. 34–35,
 * تكنولوجيات p. 37, أستعدّ p. 23. Source de vérité : docs/sources/2am/unit2/extraction.json ; plan : docs/sources/2am/unit2/plan/kasr-hasil-qisma.md.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter–§4quinquies) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « حبال المرسى » — au port des pêcheurs, une corde de 8 m à couper en 3 cordes égales, posées bout à bout ; la main tient le QUOTIENT candidat à un rang (1, 0,1, 0,01), le
 *   cadran ne s'ouvre qu'une fois l'encadrement du rang trouvé, et au niveau متقدم la main change l'UNITÉ du ruban (m → dm : les deux longueurs ×10). Le fait est PHYSIQUE (la corde suffit ou
 *   déborde), jamais une règle donnée.
 *   Rejetées : (a) les نشاطات 2 et 3 du manuel (un gâteau en 8 parts, six boîtes de jus à 160 DA) — c'est le contenu de 1AM (leçon publiée hasil-qisma-kasr) et il ne donne aucune raison d'approcher :
 *   ils deviennent des applications de أتمرّن ; (b) un partage de facture (1000 DA en 7) — l'argent n'a pas de rang sous le centime et appelle l'arrondi AU PLUS PROCHE (3AM) ; (c) une balance dont
 *   l'écran arrondit — c'est `scoop-scale`, 3AM.
 *   Ordre des idées : l'encadrement à l'unité (rappel) → 0,1 → 0,01 → jamais exact (8 ÷ 3) contre exact (9 ÷ 4) → noms (valeur exacte, valeurs approchées par défaut / par excès) → les mots « نسبة » et « كتابة
 *   كسرية » (معارف) → changer l'unité du ruban = ×10ⁿ aux deux termes → effectuer la division → pratique, trois مسائل, test.
 *
 * HISTOIRE DES الكفاءات (positions gardées : les identifiants sont positionnels) — brouillon → texte final :
 *   P1  « التعرّف على الكسر a/b كنسبة وكحاصل القسمة » → la NOMMER « نسبة a إلى b » et distinguer « كسر » (termes naturels) de « كتابة كسرية » (termes décimaux) — a ÷ b = a/b est 1AM (rappelé) ;
 *   P2  « كتابات كسرية متساوية » → tout transformer en dénominateur naturel par ×10, ×100, ×1000 choisis sur le DIVISEUR — a/b = ka/kb est 1AM (rappelé) ;
 *   P3  « قسمة على عدد عشري → naturel » → effectuer cette division et la poursuivre après la virgule ;
 *   P4  « القيمة المقرّبة إلى الوحدة … » → par défaut et par excès à 0,1 / 0,01 (0,001) et le HASR qu'elles donnent (l'unité est qisma-iqlidiya-hasr P2, rappelée).
 * Le réseau : 2am.m1.r05 PROLONGE 1am.m3.r04 (planifiée, hasr-qiyam-muqarraba) : « تذكّر » sans lien ; 2am.m1.r06 est partagé avec qisma-iqlidiya-hasr (P4 ← 2am_qisma-iqlidiya-hasr_P2).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/kasr-hasil-qisma';

export const LESSON_CONFIG = {
  id: 'kasr-hasil-qisma',
  kind: 'lesson',
  unit: 'kusur-amaliyat',
  unitTitle: 'الكسور والعمليات عليها',
  sequentialUnlock: true,
  title: 'الكسر: نسبة وحاصل قسمة وقيم مقرّبة',
  description: 'نقطع حبلًا إلى حبال متساوية فنكتشف أنّ بعض القسمات لا تنتهي: نسمّي الحاصل نسبة وقيمة مضبوطة، ونحصره بقيمتين مقرّبتين بالنقصان وبالزيادة إلى $0{,}1$ ثم إلى $0{,}01$ ، ونقسم على عدد عشري بجعل القاسم طبيعيًا.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🪢',
  estimatedDurationMin: 87,
  textbookRef: { unit: 2, activity: 2, pages: '24, 26, 27' },
  skills: [
    'تسمية الكتابة الكسرية $\\frac{a}{b}$ لحاصل قسمة عددين عشريين نسبة $a$ إلى $b$ ، والتمييز بين الكسر والكتابة الكسرية، وهي القيمة المضبوطة لحاصل القسمة',
    'تحويل كتابة كسرية حدّاها عشريان إلى كتابة مقامها طبيعي بضرب الحدّين في $10$ أو $100$ أو $1000$ بحسب عدد الأرقام بعد الفاصلة في المقام',
    'قسمة عدد عشري على عدد عشري غير طبيعي: تحويلها إلى قسمة على عدد طبيعي ثم إنجازها ومواصلتها بعد الفاصلة',
    'تعيين القيمتين المقرّبتين بالنقصان وبالزيادة إلى $0{,}1$ أو $0{,}01$ لحاصل قسمة وحصره بهما',
  ],
  teachingScope: {
    include: ['«نسبة a إلى b» والكتابة الكسرية لعددين عشريين', 'ضرب الحدّين في 10 أو 100 أو 1000 لجعل المقام طبيعيًا', 'إنجاز القسمة ومواصلتها بعد الفاصلة', 'القيمتان المقرّبتان إلى 0,1 وإلى 0,01 (و 0,001) وحصر الحاصل بهما'],
    exclude: ['التدوير إلى أقرب قيمة (السنة الثالثة)', 'استعمال الحاسبة لعرض القيم (السنة الثالثة)', 'إعادة بناء a ÷ b = a/b أو a/b = ka/kb (السنة الأولى: نتذكّرها فقط)', 'العمليات على الكسور (دروس لاحقة من الوحدة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'زيت التعاونية: 10 لترات',
    statement: 'تقتسم ثلاث عائلات من تعاونية فلاحية بالتساوي $10$ لترات من زيت الزيتون، فالاقتسام العادل يعمّ الخير على الجميع، وتملك كلّ عائلة قارورة. يُحمَّل الزيت صباحًا على الساعة 6.',
    questions: [
      { label: '1)', text: 'عبّر عن حصّة كلّ عائلة بكتابة كسرية، ثم بيّن هل هي عدد عشري.' },
      { label: '2)', text: 'احصر حصّة كلّ عائلة إلى $0{,}01$ .' },
      { label: '3)', text: 'هل تكفي قارورة سعتها $3{,}3$ L ؟ وهل تكفي قارورة سعتها $3{,}5$ L ؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'الزيت', icon: 'olive', lines: [{ label: 'الكمّية', value: 10, unit: 'لتر' }] }, { title: 'العائلات', icon: 'person', lines: [{ label: 'العدد', value: 3, unit: 'عائلة' }] }], ariaLabel: 'بطاقتان: 10 لترات من الزيت، وثلاث عائلات' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : `1am.m3.r04` (la valeur approchée à l'unité, planifiée), `1am.m3.r03` (la division décimale, planifiée) et les bases publiées de 1AM (le quotient comme fraction, les écritures égales).
  priorKnowledge: ['kasr-hasil-qisma-1am', 'kasr-mutasawi-1am', 'qisma-ashriya-1am', 'qima-muqarraba-wahda'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul type `mooring-lines` (la main tient le quotient candidat) :
    //   مبتدئ — couper une corde en b cordes égales (8 m en 3, 9 m en 4, 9,5 m en 3) ; q = la longueur d'une corde.
    //   متقدم — des cordes de b m, b décimal (4,6 m et 0,7 m …) ; la main choisit l'UNITÉ du ruban ; q = le nombre de cordes.
    {
      kind: 'manipulation', code: 'mooring-lines-share', type: 'mooring-lines', module: 1,
      level: 'beginner',
      title: 'حبال المرسى: قطع حبل إلى حبال متساوية',
      objective: 'حاصل قسمة لا تنتهي هو عدد واحد نحصره بقيمتين مقرّبتين بالنقصان وبالزيادة، نضيّق الحصر بتدقيق الرتبة، وقد تنتهي القسمة فيقع الحاصل على عدد عشري',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'harbor' },
      learningPointIds: ['2am_kasr-hasil-qisma_P4'],
      sourceElementIds: ['method-2'],
    },
    {
      kind: 'manipulation', code: 'mooring-lines-count', type: 'mooring-lines', module: 1,
      level: 'advanced',
      title: 'حبال المرسى: حبال طول كلّ منها عدد عشري',
      objective: 'حاصل قسمة لا تنتهي هو عدد واحد نحصره بقيمتين مقرّبتين بالنقصان وبالزيادة، نضيّق الحصر بتدقيق الرتبة، وقد تنتهي القسمة فيقع الحاصل على عدد عشري',
      autonomy: 'القاسم عدد عشري: يختار التلميذ وحدة الشريط التي تجعله طبيعيًا (ضرب الحدّين في 10) قبل أن يتحرّك المشبك، ثم يحصر عدد الحبال إلى 0,01',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'harbor' },
      learningPointIds: ['2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P3', '2am_kasr-hasil-qisma_P4'],
      sourceElementIds: ['method-1'],
    },
    {
      kind: 'manipulation', code: 'mooring-lines-maarif', type: 'mooring-lines', module: 2,
      title: 'حبال المرسى: عشرة أمتار في سبعة حبال',
      objective: 'حاصل قسمة لا تنتهي هو عدد واحد نحصره بقيمتين مقرّبتين بالنقصان وبالزيادة، نضيّق الحصر بتدقيق الرتبة، وقد تنتهي القسمة فيقع الحاصل على عدد عشري',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'harbor' },
      learningPointIds: ['2am_kasr-hasil-qisma_P1', '2am_kasr-hasil-qisma_P4'],
      sourceElementIds: ['know-1c'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — زيت التعاونية: 10 لترات', learningPointIds: ['2am_kasr-hasil-qisma_P1', '2am_kasr-hasil-qisma_P4'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — نادي الدرّاجات', learningPointIds: ['2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P3', '2am_kasr-hasil-qisma_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — خزّان القرية', learningPointIds: ['2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P3', '2am_kasr-hasil-qisma_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ الكسر حاصل قسمة، والكتابات المتساوية، والقيمة المقرّبة إلى الوحدة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 7, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — حبال المرسى', desc: 'قطّع الحبل إلى حبال متساوية وضع القطع بعضها بعد بعض: هل يكفي الحبل؟ ثم دقّق الرتبة.',
      stage: 'trigger', teachesLearningPointIds: ['2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 16, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — النسبة والقيم المقرّبة', desc: 'القيمة المضبوطة، القيمتان المقرّبتان، نسبة a إلى b، والقسمة على عدد عشري.',
      stage: 'discovery', teachesLearningPointIds: ['2am_kasr-hasil-qisma_P1', '2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P4'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أقسم على عدد عشري وأحصر الحاصل', desc: 'أجعل القاسم طبيعيًا ثم أواصل القسمة بعد الفاصلة حتى الرتبة المطلوبة.',
      stage: 'formalization', teachesLearningPointIds: ['2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P3', '2am_kasr-hasil-qisma_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'ستة تمارين: النسبة، والقسمة على عدد عشري، والقيم المقرّبة.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_kasr-hasil-qisma_P1', '2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P3', '2am_kasr-hasil-qisma_P4'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — زيت التعاونية', desc: 'مسألة الدرس: 10 لترات من الزيت، وثلاث عائلات، وقارورة لكلّ عائلة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_kasr-hasil-qisma_P1', '2am_kasr-hasil-qisma_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — نادي الدرّاجات', desc: 'المسافة في ساعة واحدة: كتابة كسرية، قسمة على عدد عشري، وحصر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P3', '2am_kasr-hasil-qisma_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — خزّان القرية', desc: 'قارورات الماء: كم مملوءة؟ وكم تلزم؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_kasr-hasil-qisma_P2', '2am_kasr-hasil-qisma_P3', '2am_kasr-hasil-qisma_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
