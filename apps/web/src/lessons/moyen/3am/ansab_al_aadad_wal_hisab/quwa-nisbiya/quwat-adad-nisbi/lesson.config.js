/**
 * الدرس — قوة عدد نسبي (3AM, unité 3 « القوى ذات أسس نسبية صحيحة ») — la PREMIÈRE leçon de 3AM générée, DANS son entrée du
 * catalogue (items 3am.m3.r06, r07, r08), cycle moyen phase 3, Phase A de la file (2026-10-21) : le درس 4AM « الجذر التربيعي »
 * s'appuie sur elle. Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : معارف 6–8 p. 44, طرائق p. 45 (قواعد
 * الحساب على قوى عدد نسبي), دوري الآن ② p. 45, نشاط 6 p. 41, exercices 34–49, 51, 53 pp. 48–50, أؤكّد 22–25 p. 49, أستعدّ 16–17
 * p. 39, تحدّي p. 38. Source : docs/sources/3am/unit3/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : ses liens « راجع » — 3am.m1.r01 (جداء عددين نسبيين), 2am.m1.r01 (سلسلة عمليات), 3am.m3.r02 (قواعد قوى العدد 10) —
 * mènent à des leçons NON publiées : « أستعدّ » les mesure, la leçon ne les reconstruit pas (les règles des puissances de 10 sont
 * RAPPELÉES dans معارف par un « تذكّر »), et `pointPrerequisites` ne porte que des arêtes internes.
 * 2026-10-29 : la leçon 2AM `silsila-bidun-aqwas` (2am.m1.r01) est publiée — le catalogue porte P4 ← `2am_silsila-bidun-aqwas_P2`
 * (le long du lien `2am.m1.r01 → 3am.m3.r08`) et طريقة (étape 2) un « تذكّر — السنة الثانية » avec son lien.
 * 2026-10-29 : la leçon 2AM `silsila-bi-aqwas` (2am.m1.r01–r02) est publiée — P4 ← aussi `2am_silsila-bi-aqwas_P1`, `_P3` (les parenthèses,
 * la barre de fraction) et طريقة (étape 4) un second « تذكّر — السنة الثانية » avec son lien.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le « قطار القوى » (labo `power-train`, monde `build`, thème `railway`). Un train part de la gare en portant 1 ;
 *   chaque wagon attelé MULTIPLIE ce qu'il porte par a (à droite de la locomotive) ou le DIVISE par a (à gauche). La main tient
 *   l'EXPOSANT n — la longueur signée du train, une poignée sur un rail gradué. C'est là que la puissance devient nécessaire sous la
 *   main : pour porter 16 avec des wagons « × (−2) » il faut en compter quatre, et le cinquième fait −32 ; la charge change de
 *   signe À CHAQUE wagon (la parité se VOIT : des paires de wagons négatifs liées) ; 1 n'est porté que par la locomotive seule (a⁰ = 1) ;
 *   1/9 n'existe pas à droite — il faut des wagons « ÷ (−3) » (a⁻ⁿ = 1/aⁿ). مبتدئ : base −2, les charges 16, −32, 1, charges
 *   écrites au-dessus de chaque wagon ; متقدم : base −3, −27, 81, 1/9, −1/27, aucune charge intermédiaire écrite.
 *   Rejetées : (a) le نشاط 6 du manuel comme entrée (« اكتب على الشكل aⁿ : 3² × 3⁵ … ») — il applique des règles que l'élève
 *   n'a pas encore vues pour un nombre relatif ; il devient une APPLICATION en أتمرّن ; (b) le تحدّي (des fleurs qui triplent
 *   chaque jour) — une croissance à base positive : ni le signe ni l'exposant négatif n'y sont visibles ; il devient la مسألة 1 ;
 *   (c) la touche « ^ » d'une calculatrice : l'écran donne la réponse sans que la main décide rien.
 *   Ordre des idées : le signe change à chaque wagon → aⁿ en n facteurs, signe selon la parité (P1) → aucun wagon : a⁰ = 1 (P2) →
 *   wagons « ÷ » : a⁻ⁿ = 1/aⁿ (P2, متقدم) → معارف : DEUX trains attelés (monde `couple`) — les wagons se suivent, un « × » et un « ÷ »
 *   s'annulent : aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ ÷ aⁿ = aᵐ⁻ⁿ ; puis (aᵐ)ⁿ et (ab)ⁿ en écrivant les facteurs (P3) → طريقة : simplifier une
 *   expression à deux bases, la priorité des puissances et le piège −3² (P3, P4) → أتمرّن (le نشاط 6 et les exercices réécrits) →
 *   trois مسائل → إختبار أولي.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/quwat-adad-nisbi';

export const LESSON_CONFIG = {
  id: 'quwat-adad-nisbi',
  kind: 'lesson',
  unit: 'quwa-nisbiya',
  unitTitle: 'القوى ذات أسس نسبية صحيحة',
  sequentialUnlock: true,
  title: 'قوة عدد نسبي',
  description: 'قطار ينطلق حاملًا العدد 1 وكل عربة تضرب حمولته في عدد نسبي أو تقسمها عليه: نكتشف القوة $a^n$ وإشارتها حسب زوجية الأس، و $a^0 = 1$ و $a^{-n} = \\frac{1}{a^n}$ ، ثم نربط قطارين لنستخرج قواعد الحساب على القوى ونحسب سلاسل عمليات تتضمن قوى.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🚂',
  estimatedDurationMin: 87,
  textbookRef: { unit: 3, activity: 6, pages: '38, 39, 41, 44, 45, 48, 49, 50' },
  skills: [
    'حساب القوة $a^n$ لعدد نسبي $a$ وتعيين إشارتها: موجبة إذا كان $a$ موجبًا أو $n$ زوجيًا، وسالبة إذا كان $a$ سالبًا و $n$ فرديًا',
    'معرفة أنّ $a^0 = 1$ وأنّ $a^{-n} = \\frac{1}{a^n}$ (مقلوب $a^n$) من أجل $a \\neq 0$ واستعمال ذلك في الحساب',
    'استعمال القواعد $a^m \\times a^n = a^{m+n}$ و $\\frac{a^m}{a^n} = a^{m-n}$ و $(a^m)^n = a^{mn}$ و $(ab)^n = a^n b^n$ لكتابة عبارة على شكل قوة واحدة أو تبسيطها',
    'إجراء سلسلة حسابات تتضمن قوى باحترام أولوية القوى على باقي العمليات والتمييز بين $-a^n$ و $(-a)^n$',
  ],
  teachingScope: {
    include: ['$a^n$ جداء $n$ عاملًا يساوي $a$ لعدد نسبي $a$ ، وإشارتها حسب إشارة $a$ وزوجية $n$', '$a^0 = 1$ و $a^1 = a$ و $a^{-n} = \\frac{1}{a^n}$ من أجل $a \\neq 0$', 'قواعد الجداء وحاصل القسمة وقوة القوة وقوة الجداء (وقوة حاصل القسمة)', 'أولوية القوى في سلسلة حسابات، و $-a^n$ مقابل $(-a)^n$'],
    exclude: ['الكتابة العشرية لقوى العدد 10 وقواعدها (درسا «قوى العدد 10» و «قواعد الحساب على قوى العدد 10»: نتذكّرها فقط)', 'الكتابة العلمية ورتبة القدر (درس لاحق)', 'جداء عددين نسبيين وسلسلة العمليات (نتذكّرهما)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — le تحدّي réécrit (1, 3, 9, … : 3ⁿ⁻¹).
  lessonProblem: {
    module: 5,
    title: 'حملة الكتب: 1 ثم 3 ثم 9',
    statement: 'أطلقت سلمى حملة لجمع الكتب لمكتبة المتوسطة، لأنّ الكتاب صديق لا يملّ. في كل يوم يُخبر كل من عرف بالحملة لأوّل مرّة في اليوم السابق ثلاثة زملاء جدد، فيكون عدد الذين يعرفون بها لأوّل مرّة: 1 في اليوم الأول (سلمى)، و 3 في اليوم الثاني، و 9 في اليوم الثالث.',
    questions: [
      { label: '1)', text: 'كم تلميذًا يعرف بالحملة لأوّل مرّة في اليوم الرابع؟ اكتب هذا العدد على شكل قوة للعدد 3.' },
      { label: '2)', text: 'اكتب عدد الذين يعرفون بالحملة لأوّل مرّة في اليوم السابع على شكل قوة للعدد 3، ثم احسبه.' },
      { label: '3)', text: 'قال أمين: «في اليوم العاشر يعرف بالحملة لأوّل مرّة 300 تلميذ». هل هو على صواب؟' },
    ],
    illustration: { kind: 'timeline', icon: 'book', marks: [{ label: 'اليوم الأول', value: 1 }, { label: 'اليوم الثاني', value: 3 }, { label: 'اليوم الثالث', value: 9 }, { label: 'اليوم العاشر' }], ariaLabel: 'محور الأيام: 1 تلميذ في اليوم الأول، 3 في الثاني، 9 في الثالث، وعدد مجهول في اليوم العاشر' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : les trois liens « راجع » du réseau (3am.m1.r01, 2am.m1.r01, 3am.m3.r02).
  priorKnowledge: ['jidaa-nisbi', 'silsila-amaliyat', 'qawaid-quwa-ashara'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `power-train` (la main tient l'EXPOSANT), monde `build`, thème `railway` :
    //   مبتدئ — base −2 : les charges 16, −32 puis 1 (charges écrites sur chaque wagon, paires négatives liées) ;
    //   متقدم — base −3 : −27, 81, 1/9, −1/27 (wagons « ÷ » sous zéro, aucune charge intermédiaire écrite).
    {
      kind: 'manipulation', code: 'power-train-build', type: 'power-train', module: 1,
      level: 'beginner',
      title: 'قطار القوى: عربات تضرب في −2',
      objective: 'القطار الذي ينطلق حاملًا 1 ويُربط به n عربة تضرب في a يحمل $a^n$: تتغيّر إشارته مع كل عربة إذا كان a سالبًا، ويحمل 1 بلا عربة، و $\\frac{1}{a^n}$ بـ n عربة تقسم على a',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'railway' },
      learningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P2'],
      sourceElementIds: ['know-6'],
    },
    {
      kind: 'manipulation', code: 'power-train-inverse', type: 'power-train', module: 1,
      level: 'advanced',
      title: 'قطار القوى: عربات تضرب في −3 أو تقسم عليه',
      objective: 'القطار الذي ينطلق حاملًا 1 ويُربط به n عربة تضرب في a يحمل $a^n$: تتغيّر إشارته مع كل عربة إذا كان a سالبًا، ويحمل 1 بلا عربة، و $\\frac{1}{a^n}$ بـ n عربة تقسم على a',
      autonomy: 'أساس آخر (−3) وأهداف كسرية تتطلّب عربات قسمة، ولا حمولة مكتوبة فوق كل عربة: يتوقّع التلميذ إشارة الحمولة وعدد العربات وجهتها قبل أن يربطها',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'railway' },
      learningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P2'],
      sourceElementIds: ['know-6'],
    },
    // Module 2 — le MÊME labo, monde `couple`, posé seul (`levels={false}`) : deux trains attelés (règles du produit et du quotient).
    {
      kind: 'manipulation', code: 'power-train-couple', type: 'power-train', module: 2,
      title: 'قطاران موصولان',
      learningPointIds: ['3am_quwat-adad-nisbi_P3'],
      sourceElementIds: ['know-7'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حملة الكتب', learningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — الورقة المطويّة', learningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P4'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ثلاثة أعداد', learningPointIds: ['3am_quwat-adad-nisbi_P2', '3am_quwat-adad-nisbi_P3', '3am_quwat-adad-nisbi_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ جداء أعداد نسبية، سلسلة عمليات، وقوى العدد 10.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — قطار القوى', desc: 'قطار ينطلق حاملًا 1، وكل عربة تضرب حمولته في عدد سالب: متى تكون الحمولة سالبة؟ وماذا يحمل بلا عربة؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — قواعد الحساب على القوى', desc: 'نربط قطارين: ماذا يحدث للأسس؟ ثم قوة قوة وقوة جداء.',
      stage: 'discovery', teachesLearningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P2', '3am_quwat-adad-nisbi_P3'],
      color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أبسّط وأحسب بالأولويات', desc: 'عبارة بأساسين نبسّطها، وسلسلة حسابات تُحسب فيها القوى أوّلًا.',
      stage: 'formalization', teachesLearningPointIds: ['3am_quwat-adad-nisbi_P3', '3am_quwat-adad-nisbi_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'على شكل قوة واحدة، حساب ذهني، الأس نفسه، الأقواس، عدد ناقص، أس سالب، حديقة مربّعة، ومجموع قوى.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P2', '3am_quwat-adad-nisbi_P3', '3am_quwat-adad-nisbi_P4'],
      color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حملة الكتب', desc: 'مسألة الدرس: 1 ثم 3 ثم 9 … هل يصل الخبر إلى 300 تلميذ في اليوم العاشر؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — الورقة المطويّة', desc: 'كل طيّة تضاعف السُّمك: بعد كم طيّة يتجاوز المتر؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_quwat-adad-nisbi_P1', '3am_quwat-adad-nisbi_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ثلاثة أعداد', desc: 'نكتب على شكل قوة، نحسب بالأولويات، ونقارن.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_quwat-adad-nisbi_P2', '3am_quwat-adad-nisbi_P3', '3am_quwat-adad-nisbi_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
