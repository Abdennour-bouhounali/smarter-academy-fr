/**
 * الدرس — قواعد الحساب على قوى العدد 10 (3AM, unité 3 « القوى ذات أسس نسبية صحيحة ») — généré DANS son entrée du catalogue (item 3am.m3.r02), cycle moyen
 * phase 3, Phase 0 « owner priority » (2026-10-26), après la leçon publiée `quwa-adad-ashara` (dont il reprend l'item `3am.m3.r01` comme « راجع »).
 * Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 4 p. 41, معارف 3 p. 42, طرائق et دوري الآن p. 43, أوظّف 14–20 p. 46–47 et 50, 55–56 p. 50,
 * أؤكّد 4–10 p. 49. Source : docs/sources/3am/unit3/extraction.json (relue à 130–260 dpi le 2026-10-26). Rien n'est montré tel quel (§4ter-bis).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : la « مسطرة التحويل » (labo `unit-ladder`, thème `tech-bench`). Une règle de laiton du club de technologie est gravée de COLONNES (entre deux colonnes
 *   voisines : × 10) ; des plaques d'unités (km … nm) pendent au-dessus, avec leur valeur en mètres. La main TEND un ruban d'une plaque à l'autre et lit le nombre de colonnes.
 *   Deux rubans enchaînés (km → m → mm) s'ajoutent (la somme : le ruban pointillé du total) ; un ruban de part et d'autre du mètre (km → cm) mesure l'ÉCART entre deux rangs ;
 *   les tables d'aire et de volume re-pavent la règle (2 puis 3 colonnes par unité) et la main CHOISIT le mode : la puissance d'une puissance. مبتدئ : u1 km→m→mm (prédiction 6 / 9 / 3) ·
 *   u2 km→cm (5 / 1 / 6) · u3 mm→µm ; متقدم (sans facteur écrit) : km²→m² · m³→cm³ · mm²→m² (ruban bleu, −6) · m³→dm³.
 *   Rejetées : (a) l'نشاط 4 du manuel (écrire les facteurs de 10³ × 10⁴, 10⁹/10⁵, (10³)⁵) — c'est le train de `quwat-adad-nisbi` avec la base 10, le décompte survit comme la
 *   JUSTIFICATION de chaque brique ; (b) montrer la règle comme un tableau d'exemples — elle serait lue, pas produite. Le cahier corrigé en rouge de l'نشاط 4 devient le module 2
 *   (lignes à juger, mêmes types d'erreur, autres nombres) ; le rappel de `quwat-adad-nisbi` est un encadré « تذكّر » lié.
 *   Ordre des idées : rubans enchaînés → somme (P1) → ruban de part et d'autre du mètre → écart (P2) → tables d'aire et de volume → produit des exposants (P3) → دفتر رياض : les trois
 *   règles nommées, le piège de la somme → طريقة : une seule puissance et k × 10ᵖ non normalisé (P4) → أتمرّن → trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/qawaid-quwa-ashara';

export const LESSON_CONFIG = {
  id: 'qawaid-quwa-ashara',
  kind: 'lesson',
  unit: 'quwa-nisbiya',
  unitTitle: 'القوى ذات أسس نسبية صحيحة',
  sequentialUnlock: true,
  title: 'قواعد الحساب على قوى العدد 10',
  description: 'مسطرة تحويل في قسم التكنولوجيا نمدّ عليها شريطًا بين لوحات الوحدات ونعدّ الأعمدة: نكتشف قواعد جداء قوتين للعدد 10 وحاصل قسمتهما وقوة قوة، ونكتب عبارة على شكل قوة واحدة، ونحسب جداء وحاصل قسمة أعداد من الشكل $k \\times 10^p$ .',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📏',
  estimatedDurationMin: 86,
  textbookRef: { unit: 3, activity: 4, pages: '41, 42, 43, 46, 47, 49, 50' },
  skills: [
    'استعمال القاعدة $10^m \\times 10^n = 10^{m+n}$ من أجل $m$ و $n$ عددين صحيحين نسبيين',
    'استعمال القاعدة $\\frac{10^m}{10^n} = 10^{m-n}$ من أجل $m$ و $n$ عددين صحيحين نسبيين',
    'استعمال القاعدة $(10^m)^n = 10^{m \\times n}$ من أجل $m$ و $n$ عددين صحيحين نسبيين',
    'تبسيط عبارة تتضمّن قوى العدد 10 وكتابتها على شكل قوة واحدة، وحساب جداء أو حاصل قسمة أعداد مكتوبة على الشكل $a \\times 10^p$ (مثل $7 \\times 10^3 \\times 3 \\times 10^9 = 21 \\times 10^{12}$)',
  ],
  teachingScope: {
    include: ['$10^m \\times 10^n = 10^{m+n}$ و $\\frac{10^m}{10^n} = 10^{m-n}$ و $(10^m)^n = 10^{m \\times n}$ من أجل $m$ و $n$ صحيحين نسبيين', 'كتابة سلسلة من الجداءات والقسمات على شكل قوة واحدة للعدد 10', 'جداء وحاصل قسمة أعداد من الشكل $k \\times 10^p$ ونتيجتها دون تعديل (مثل $21 \\times 10^{12}$)', 'تحويلات الطول والمساحة والحجم كقوى للعدد 10'],
    exclude: ['الكتابة العلمية ورتبة القدر والحصر (درس لاحق)', 'قوة عدد غير 10 (درس «قوة عدد نسبي»)', 'تعريف $10^n$ وكتابته العشرية (درس «قوى العدد 10»)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'ذاكرة الهاتف',
    statement: 'في هاتف رانيا: $1\\ \\mathrm{Ko}$ (كيلو أكتي) $= 10^{3}$ أكتي، وكل وحدة تالية تساوي $10^{3}$ من الوحدة التي قبلها: $1\\ \\mathrm{Mo} = 10^{3}\\ \\mathrm{Ko}$ و $1\\ \\mathrm{Go} = 10^{3}\\ \\mathrm{Mo}$ و $1\\ \\mathrm{To} = 10^{3}\\ \\mathrm{Go}$ . سعة الهاتف $128\\ \\mathrm{Go}$ ، وحجم الصورة الواحدة حوالي $4\\ \\mathrm{Mo}$ .',
    questions: [
      { label: '1)', text: 'عبّر عن $1\\ \\mathrm{Go}$ بالأكتي على شكل قوة واحدة للعدد 10 .' },
      { label: '2)', text: 'عبّر عن $1\\ \\mathrm{To}$ بالأكتي على شكل قوة للعدد 10 .' },
      { label: '3)', text: 'كم صورة تتّسع لها ذاكرة الهاتف؟' },
      { label: '4)', text: 'كم جيغا أكتي في تيرا أكتي واحد؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'ذاكرة الهاتف', lines: [{ label: 'السعة', value: '128 Go' }] }, { title: 'الصورة', lines: [{ label: 'حجمها', value: '4 Mo' }] }, { title: 'سلّم الوحدات', lines: [{ label: 'كل وحدة', value: '10³ ما قبلها' }] }], ariaLabel: 'ثلاث بطاقات: سعة الهاتف 128 جيغا أكتي، وحجم الصورة 4 ميغا أكتي، وكل وحدة تساوي ألف مرّة التي قبلها' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (3am.m3.r01 → quwa-adad-ashara) et les unités / produits (ajouts de la plateforme).
  priorKnowledge: ['quwa-ashara', 'wahdat'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `unit-ladder` (la main tend un ruban entre deux plaques ; en متقدم elle choisit le mode), thème `tech-bench` :
    //   مبتدئ — u1 km→m→mm (prédiction) ; u2 km→cm (prédiction) ; u3 mm→µm ;
    //   متقدم — km²→m² ; m³→cm³ ; mm²→m² (ruban bleu) ; m³→dm³, aucun facteur écrit avant « ثبّت ».
    {
      kind: 'manipulation', code: 'unit-ladder-columns', type: 'unit-ladder', module: 1,
      level: 'beginner',
      title: 'مسطرة التحويل: نعدّ الأعمدة',
      objective: 'شريط بين لوحتين يقطع عددًا من الأعمدة: شريطان متتابعان يتّصل عددا أعمدتهما، وشريط على جهتي لوحة المتر يقيس البعد بين رتبتين، وفي جدولَي المساحة والحجم تأخذ كل وحدة أكثر من عمود',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tech-bench' },
      learningPointIds: ['3am_qawaid-quwa-ashara_P1', '3am_qawaid-quwa-ashara_P2'],
      sourceElementIds: ['act-4'],
    },
    {
      kind: 'manipulation', code: 'unit-ladder-tables', type: 'unit-ladder', module: 1,
      level: 'advanced',
      title: 'مسطرة التحويل: الطول والمساحة والحجم',
      objective: 'شريط بين لوحتين يقطع عددًا من الأعمدة: شريطان متتابعان يتّصل عددا أعمدتهما، وشريط على جهتي لوحة المتر يقيس البعد بين رتبتين، وفي جدولَي المساحة والحجم تأخذ كل وحدة أكثر من عمود',
      autonomy: 'يختار التلميذ الجدول (طول أو مساحة أو حجم) ولا عامل مكتوبًا على الشريط حتى يثبّته',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tech-bench' },
      learningPointIds: ['3am_qawaid-quwa-ashara_P3'],
      sourceElementIds: ['act-4'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — ذاكرة الهاتف', learningPointIds: ['3am_qawaid-quwa-ashara_P1', '3am_qawaid-quwa-ashara_P2', '3am_qawaid-quwa-ashara_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — الخزّان والمزرعة', learningPointIds: ['3am_qawaid-quwa-ashara_P3', '3am_qawaid-quwa-ashara_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — برنامج الحساب', learningPointIds: ['3am_qawaid-quwa-ashara_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ قوى العدد 10 وكتابتها العشرية، وجداء ألف في مئة، ووحدات الطول.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مسطرة التحويل', desc: 'نمدّ شريطًا بين لوحات الوحدات ونعدّ الأعمدة: كم ميليمترًا في كيلومتر؟ وماذا يتغيّر في جدولَي المساحة والحجم؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_qawaid-quwa-ashara_P1', '3am_qawaid-quwa-ashara_P2', '3am_qawaid-quwa-ashara_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — دفتر رياض', desc: 'دفتر زميلة فيه ستة سطور: أيّها صحيح؟ ثم نسمّي القواعد الثلاث ونعرف أنّه لا قاعدة للجمع.',
      stage: 'discovery', teachesLearningPointIds: ['3am_qawaid-quwa-ashara_P1', '3am_qawaid-quwa-ashara_P2', '3am_qawaid-quwa-ashara_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — قوة واحدة، وعدد × قوة', desc: 'نختصر عبارة إلى قوة واحدة للعدد 10 ، ونحسب جداءات وحاصل قسمة أعداد من الشكل $k \\times 10^p$ .',
      stage: 'formalization', teachesLearningPointIds: ['3am_qawaid-quwa-ashara_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'قوة واحدة، أيّها يساوي $10^{-4}$ ؟، صحيح أم خاطئ، عبارة بقوى وأعداد عشرية، $k \\times 10^p$ وبرنامج حساب.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_qawaid-quwa-ashara_P1', '3am_qawaid-quwa-ashara_P2', '3am_qawaid-quwa-ashara_P3', '3am_qawaid-quwa-ashara_P4'],
      color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ذاكرة الهاتف', desc: 'مسألة الدرس: من الكيلو أكتي إلى التيرا أكتي، وعدد الصور في ذاكرة هاتف.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qawaid-quwa-ashara_P1', '3am_qawaid-quwa-ashara_P2', '3am_qawaid-quwa-ashara_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — الخزّان والمزرعة', desc: 'من المتر المكعّب إلى اللتر والسنتيمتر المكعّب، وعدد القطرات، ومزرعة بالهكتار.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qawaid-quwa-ashara_P3', '3am_qawaid-quwa-ashara_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — برنامج الحساب', desc: 'برنامج من ضرب وقسمة على قوى العدد 10 : ضرب واحد في قوة واحدة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_qawaid-quwa-ashara_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
