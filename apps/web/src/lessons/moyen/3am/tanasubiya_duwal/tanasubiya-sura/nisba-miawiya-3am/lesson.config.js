/**
 * الدرس — النسبة المئوية (3AM, unité 6 « التناسبية ») — générée DANS son entrée du catalogue (item 3am.m7.r06), cycle moyen phase 3, Phase A de la file
 * (2026-10-21, entrée #10) : la leçon 4AM « تطبيقات التناسبية » s'appuie sur elle. Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات :
 * نشاط 2 p. 88, معارف 2 p. 90, طرائق (زيادة وتخفيض) p. 91, exercices 6–16 p. 95–96, أؤكّد 3–6 p. 97, أتعمّق 30 (أ), 39–40 p. 98–99, أستعدّ 7–9 p. 87.
 * Source : docs/sources/3am/unit6/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : son item CONSOLIDE `2am.m6.r04` (حساب نسبة مئوية وتوظيفها, leçon 2AM `nisba-miawiya`, NON publiée) : « أستعدّ » le mesure, معارف ouvre sur
 * un « تذكّر — السنة الثانية » (aucun lien tant que la leçon de base n'est pas publiée), la leçon ne reconstruit pas le pourcentage — elle le TRAITE comme
 * une situation de proportionnalité (le coefficient t/100, le tableau 100 ↔ b, × (1 ± t/100)). `pointPrerequisites` : arêtes internes seulement.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « الصينية المئة » (labo `hundred-grid`, thème `pantry`). Le stock d'une جمعيّة خيريّة (des sacs de tamr) est coupé en CENT cases égales ;
 *   la MAIN peint t cases et le panier reçoit t paquets. C'est là que « t % de x » devient nécessaire sous la main : on ne peut remplir le panier sans savoir
 *   ce que vaut UNE case (x ÷ 100), et la réponse s'écrit AVANT l'ouverture (of, change, whole) ou se CHERCHE en regardant le panier se remplir (rate). Une
 *   hausse de t % AJOUTE t cases aux cent, une baisse en retire t ; la chaîne +20 % puis −20 % repart d'un NOUVEAU stock et ne ramène pas à 200.
 *   مبتدئ (plateforme) : 15 % de 240, le taux qui remplit 60 sur 150, +15 % de 200, −20 % de 250. متقدم : 70 % de 75 et 25 % de 32 (taux cherchés),
 *   84 est 60 % de ? (le stock entier), puis la chaîne +20 % puis −20 % sur 200.
 *   Rejetées : (a) le نشاط 2 du manuel comme entrée (la population de l'Algérie, 29 % de 40 millions : on calcule de tête une proportion déjà vue en
 *   2AM — un test, pas une manipulation) — il devient une APPLICATION en أتمرّن ; (b) l'étiquette de prix qu'on étire (`percent-tag`, 4AM « تطبيقات
 *   التناسبية » : barre continue, pari sur une chaîne — on ne la re-peint pas ; ici la main PEINT des cases et la valeur d'une case est le coefficient
 *   t/100 devenu visible) ; (c) un curseur de pourcentage qui affiche le résultat (l'écran répond sans que la main ni la tête décident).
 *   Ordre des idées : la valeur d'une case et t cases (P1) → le taux qui remplit un panier, le stock entier (P2) → +t % ajoute t cases, −t % en retire t, et la
 *   chaîne ne revient pas (P3) → معارف : « تذكّر », la définition, le tableau 100 ↔ b et a/b = t/100 → طريقة : les trois cas et les variations successives →
 *   أتمرّن (le نشاط 2, les exercices 6–16, أتعمّق 30 (أ), 39, 40 réécrits) → trois مسائل → إختبار أولي. La vitesse et les graphiques ne sont PAS ici :
 *   `haraka-muntazama-sura` et `tanasub-tamthil-bayani`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/tanasubiya_duwal/nisba-miawiya-3am';

export const LESSON_CONFIG = {
  id: 'nisba-miawiya-3am',
  kind: 'lesson',
  unit: 'tanasubiya-sura',
  unitTitle: 'التناسبية',
  sequentialUnlock: true,
  title: 'النسبة المئوية',
  description: 'مخزن جمعيّة خيريّة مقسوم إلى مئة خانة متساوية: نرسم خانات فتمتلئ السلّة، فنكتشف أنّ $t\\%$ من عدد هي $\\frac{t}{100}$ منه، ونحسب نسبة مئوية من جدول تناسبية، ونحسب ناتج زيادة أو تخفيض بنسبة مئوية.',
  level: 'moyen',
  grade: '3am',
  chapter: 'tanasubiya_duwal',
  chapterTitle: 'ميدان الدوال وتنظيم المعطيات',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '💯',
  estimatedDurationMin: 86,
  textbookRef: { unit: 6, activity: 2, pages: '87, 88, 90, 91, 95, 97, 99' },
  skills: [
    'حساب $t\\%$ من عدد بضربه في $\\frac{t}{100}$',
    'حساب نسبة مئوية بجدول تناسبية أو بالكتابة $\\frac{a}{b}=\\frac{t}{100}$',
    'حساب ناتج زيادة أو تخفيض بنسبة $t\\%$ بالضرب في $1+\\frac{t}{100}$ أو $1-\\frac{t}{100}$',
  ],
  teachingScope: {
    include: ['$t\\%$ من عدد هي $\\frac{t}{100}$ منه (معامل تناسبية)', 'نسبة مئوية من جدول تناسبية أو من $\\frac{a}{b}=\\frac{t}{100}$ ، وإيجاد الكلّ من جزئه', 'الزيادة والتخفيض بنسبة مئوية، وتغيّران متتاليان'],
    exclude: ['الحركة المنتظمة والسرعة (درس لاحق)', 'التمثيل البياني لوضعية تناسبية (درس «التناسبية والتمثيل البياني»)', 'الفائدة المركّبة والربا'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'حقائب موسم الدخول المدرسي',
    statement: 'تبيع مكتبة الحيّ حقيبة مدرسية بـ $2400$ دج. وفي موسم الدخول المدرسي خفّضت المكتبة ثمنها بـ $15\\%$ تيسيرًا على الأسر، ثم رفعت الثمن الجديد بـ $15\\%$ بعد نهاية الموسم.',
    questions: [
      { label: '1)', text: 'ما مبلغ التخفيض؟' },
      { label: '2)', text: 'ما ثمن الحقيبة في الموسم؟' },
      { label: '3)', text: 'ما ثمن الحقيبة بعد نهاية الموسم؟ هل عاد إلى $2400$ دج؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'ثمن الحقيبة', lines: [{ label: 'دج', value: '2400' }] }, { title: 'في الموسم', lines: [{ label: 'تخفيض', value: '15%' }] }, { title: 'بعد الموسم', lines: [{ label: 'زيادة', value: '15%' }] }], ariaLabel: 'ثلاث بطاقات: ثمن الحقيبة 2400 دج، تخفيض 15 بالمئة في الموسم، ثم زيادة 15 بالمئة بعد الموسم' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (2am.m6.r04).
  priorKnowledge: ['nisba-miawiya-2am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `hundred-grid` (la main peint t cases), thème `pantry`.
    {
      kind: 'manipulation', code: 'hundred-grid-simple', type: 'hundred-grid', module: 1,
      level: 'beginner',
      title: 'الصينية المئة: 15% من 240',
      objective: 'مخزون مقسوم إلى مئة خانة متساوية: كلّ خانة تساوي المخزون مقسومًا على 100 ، و t خانة تساوي t % منه ؛ والزيادة بـ t % تُضيف t خانة والتخفيض يرفع t خانة',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'pantry' },
      learningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P2', '3am_nisba-miawiya-3am_P3'],
      sourceElementIds: ['method-2'],
    },
    {
      kind: 'manipulation', code: 'hundred-grid-chain', type: 'hundred-grid', module: 1,
      level: 'advanced',
      title: 'الصينية المئة: نسبة مجهولة وسلسلة تغيّرات',
      objective: 'مخزون مقسوم إلى مئة خانة متساوية: كلّ خانة تساوي المخزون مقسومًا على 100 ، و t خانة تساوي t % منه ؛ والزيادة بـ t % تُضيف t خانة والتخفيض يرفع t خانة',
      autonomy: 'النسبة المئوية تُبحث من الجزء والكلّ، والمخزون الكامل يُبحث من جزء ونسبته، وزيادة 20% ثم تخفيض 20% على مخزون جديد: يختار التلميذ عدد الخانات دون تعليمة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'pantry' },
      learningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P2', '3am_nisba-miawiya-3am_P3'],
      sourceElementIds: ['method-2'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — حقائب موسم الدخول المدرسي', learningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — فوجا المتطوّعين', learningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — ثمن الهاتف قبل الزيادة', learningPointIds: ['3am_nisba-miawiya-3am_P2', '3am_nisba-miawiya-3am_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ نسبة مئوية من عدد، ونسبة جزء من كلّ.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — الصينية المئة', desc: 'مخزن مقسوم إلى مئة خانة: ماذا تحمل السلّة حين نرسم t خانة؟ وماذا يحدث للمخزون إذا زاد أو نقص بنسبة مئوية؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P2', '3am_nisba-miawiya-3am_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — النسبة المئوية', desc: 'نسمّي ما فعلناه: النسبة المئوية معامل تناسبية، وجدول 100 ↔ الكلّ.',
      stage: 'discovery', teachesLearningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P2'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — جزء ونسبة وزيادة وتخفيض', desc: 'حالات النسبة المئوية الثلاث، ثم زيادة وتخفيض بنسبة مئوية وتغيّرات متتالية.',
      stage: 'formalization', teachesLearningPointIds: ['3am_nisba-miawiya-3am_P2', '3am_nisba-miawiya-3am_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'سكّان مدينة، نسب من أعداد، زيادة في ثمن، نسبة مجتمعة، الكلّ من جزئه، وتخفيضان متتاليان.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P2', '3am_nisba-miawiya-3am_P3'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — حقائب موسم الدخول المدرسي', desc: 'مسألة الدرس: تخفيض 15% ثم زيادة 15%.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — فوجا المتطوّعين', desc: 'نسبة الفتيات في فوجين من حجمين مختلفين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_nisba-miawiya-3am_P1', '3am_nisba-miawiya-3am_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — ثمن الهاتف قبل الزيادة', desc: 'من ثمن بعد زيادة إلى الثمن الأصلي، ثم التخفيض.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_nisba-miawiya-3am_P2', '3am_nisba-miawiya-3am_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
