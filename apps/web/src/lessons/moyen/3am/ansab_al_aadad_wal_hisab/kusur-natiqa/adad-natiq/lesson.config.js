/**
 * الدرس — العدد الناطق (3AM, unité 2 « العمليات على الكسور والأعداد الناطقة », leçon 4 sur 5 + synthèse) — générée DANS son entrée du catalogue (item 3am.m1.r07),
 * cycle moyen phase 3, « priorité propriétaire » (2026-10-26), à partir de son PLAN (docs/sources/3am/unit2/plan/adad-natiq.md). Manuel 3AM (الجيل الثاني,
 * منشورات الشهاب), RÉFÉRENCE des الكفاءات : نشاط 5 p. 25, معارف 5 p. 28, طريقة 10 p. 29, تمارين 22–33 p. 31, أؤكّد تعلّماتي 4, 9, 10 p. 33, أتعمّق 56, 69 p. 34, أستعدّ 8 et 12 p. 23.
 * Source : docs/sources/3am/unit2/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis).
 * Le réseau : `3am.m1.r07` EXTENDS `1am.m5.r01` (les écritures fractionnaires d'un quotient ; leçon 1AM `hasil-qisma-kasr` PUBLIÉE : lien) et suit `3am.m1.r02` (le quotient de deux relatifs ;
 * leçon `qismat-nisbiyayn` PUBLIÉE : lien) : « أستعدّ » mesure les deux avec des affirmations de la plateforme, معارف ouvre sur deux « تذكّر » avec lien.
 * `pointPrerequisites` : P1 ← `1am_hasil-qisma-kasr_P1`, P2 ← `3am_qismat-nisbiyayn_P3` (les trois écritures égales d'un quotient), puis P2 ← P1 et P3 ← P2 dans la leçon.
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : « حبل الأعداد » (labo `number-line-pegs`, thème `clothesline`). La MAIN porte une carte portant une ÉCRITURE a/b et l'ACCROCHE sur un حبل gradué là où elle croit que le nombre habite ;
 *   « تحقّق » laisse le vent la faire glisser jusqu'à son vrai piquet : 6/(−8) et (−3)/4 s'EMPILENT sur −3/4, (−9)/(−12) tombe du côté POSITIF (le signe d'un quotient, RAPPELÉ de l'unité 1), −7/3 a une
 *   place exacte entre −3 et −2 bien que sa kitaba décimale ne finisse jamais : c'est le nombre ناطق. Rejetées : (a) le نشاط 5 du manuel (listes décimal ou non, signes, puis une droite à dessiner) — il ouvre sur ce que
 *   la 1AM a fait et la droite vient en 3e, copiée ; il devient les applications d'أتمرّن ; (b) un taux de variation avec le temps — honnête, mais `elevator-reel` (unité 1) fait déjà défiler un temps signé ; (c) des
 *   molettes pour le facteur manquant — c'est `code-lockers`. Ordre des idées : écritures d'un même nombre sur un piquet, deux négatifs côté positif (P2) → −7/3 : place exacte, pas de décimale (P1) → la forme
 *   modèle (P2) → les inclusions (P1) → l'ordre et la place par un même dénominateur positif (P3) → معارف → طريقة → أتمرّن → trois مسائل → إختبار أولي. Ni opérations sur les ناطقة (`amaliyat-natiqa`),
 *   ni comparaison par une différence (unité 4), ni π (4AM), ni symboles ℕ ℤ 𝔻 ℚ (lycée).
 *
 * HISTOIRE DES الكفاءات (le plan, §2 ; décisions notées pour le propriétaire) :
 *   P1 reçoit les inclusions (naturels, relatifs entiers et décimaux relatifs sont ناطقة) ; « décimal ou non, valeur approchée » reste 1AM `hasil-qisma-kasr` (RAPPELÉ).
 *   P2 : SENS CHANGÉ — la RÈGLE DU SIGNE d'un quotient est `qismat-nisbiyayn` P3 (unité 1) : ici elle est RAPPELÉE et utilisée ; ce qui est nouveau est « un nombre, plusieurs écritures, une place » : la forme modèle
 *   (dénominateur positif, fraction réduite) et la reconnaissance des écritures égales. P3 nomme la méthode du livre (même dénominateur positif) ; comparer par le signe d'une différence reste `muqaranat-natiqayn`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/adad-natiq';

export const LESSON_CONFIG = {
  id: 'adad-natiq',
  kind: 'lesson',
  unit: 'kusur-natiqa',
  unitTitle: 'العمليات على الكسور والأعداد الناطقة',
  sequentialUnlock: true,
  title: 'العدد الناطق',
  description: 'حبل الأعداد: نعلّق بطاقات عليها كتابات مختلفة لحاصل قسمة، فنكتشف أنّ العدد الناطق مكانه واحد وكتابته كثيرة، ثمّ نكتبه بمقام موجب ونرتّب أعدادًا ناطقة ونمثّلها على مستقيم مدرّج.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧺',
  estimatedDurationMin: 89,
  textbookRef: { unit: 2, activity: 5, pages: '23, 25, 28, 29, 31, 33, 34' },
  skills: [
    'التعرّف على العدد الناطق كحاصل قسمة عدد نسبي على عدد نسبي غير معدوم $\\frac{a}{b}$ ، ومعرفة أنّ الأعداد الطبيعية والأعداد الصحيحة النسبية والأعداد العشرية النسبية أعداد ناطقة',
    'كتابة عدد ناطق على الشكل $\\frac{a}{b}$ أو $-\\frac{a}{b}$ بمقام موجب ($a$ و $b$ طبيعيان)، والتعرّف على الكتابات المتساوية لنفس العدد الناطق',
    'تمثيل أعداد ناطقة على مستقيم مدرّج، ومقارنتها وترتيبها بكتابتها بنفس المقام الموجب وبقواعد مقارنة الأعداد النسبية',
  ],
  teachingScope: {
    include: ['العدد الناطق كحاصل قسمة عددين نسبيين ومعرفة أنّ الطبيعية والصحيحة النسبية والعشرية النسبية ناطقة', 'الكتابة المعيارية بمقام موجب وكسر مختزل، والكتابات المتساوية', 'تمثيل أعداد ناطقة على مستقيم مدرّج ومقارنتها وترتيبها بمقام موجب مشترك، وكتابة عدد ناطق موجب مجموع عدد طبيعي وكسر أصغر من 1'],
    exclude: ['قاعدة إشارة حاصل القسمة (درس حاصل قسمة عددين نسبيين، تُستذكر)', 'عشري أم لا وقيمة مقرّبة (السنة الأولى، تُستذكر)', 'العمليات على الأعداد الناطقة (الدرس التالي) والمقارنة بإشارة الفرق (وحدة لاحقة)', 'الأعداد غير الناطقة والعدد π (السنة الرابعة)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js).
  lessonProblem: {
    module: 5,
    title: 'أيّ مدينة بردت أسرع؟',
    statement: 'في ليلة شتوية نزلت الحرارة بانتظام: في سطيف من $3^\\circ$ إلى $-4^\\circ$ في $3$ ساعات، وفي باتنة من $1^\\circ$ إلى $-8^\\circ$ في $4$ ساعات، وفي خنشلة من $0^\\circ$ إلى $-13^\\circ$ في $6$ ساعات.',
    questions: [
      { label: '1)', text: 'اكتب تغيّر الحرارة في الساعة لكلّ مدينة عددًا ناطقًا بمقام موجب.' },
      { label: '2)', text: 'رتّبها تصاعديًّا.' },
      { label: '3)', text: 'أيّ مدينة بردت أسرع؟' },
    ],
    illustration: { kind: 'tags', cards: [{ title: 'سطيف', lines: [{ label: 'من', value: '3°' }, { label: 'إلى', value: '-4°' }, { label: 'في', value: '3 ساعات' }] }, { title: 'باتنة', lines: [{ label: 'من', value: '1°' }, { label: 'إلى', value: '-8°' }, { label: 'في', value: '4 ساعات' }] }, { title: 'خنشلة', lines: [{ label: 'من', value: '0°' }, { label: 'إلى', value: '-13°' }, { label: 'في', value: '6 ساعات' }] }], ariaLabel: 'ثلاث بطاقات: سطيف من 3 درجات إلى سالب 4 في 3 ساعات، باتنة من 1 إلى سالب 8 في 4 ساعات، خنشلة من 0 إلى سالب 13 في 6 ساعات' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (1am.m5.r01), le quotient de deux relatifs (3am.m1.r02, publiée) et l'ordre des relatifs (2AM).
  priorKnowledge: ['hasil-qisma-kasr-1am', 'qismat-nisbiyayn-3am', 'muqarana-nisbiya-2am'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `number-line-pegs` (la main accroche une écriture), thème `clothesline`.
    {
      kind: 'manipulation', code: 'number-line-pegs-simple', type: 'number-line-pegs', module: 1,
      level: 'beginner',
      title: 'حبل الأعداد: علّق كلّ بطاقة في مكانها',
      objective: 'للعدد الناطق مكان واحد على المستقيم وكتابات كثيرة: بطاقات مختلفة الكتابة تستقرّ على الملقط نفسه إذا كانت العدد نفسه، وحاصل قسمة عددين سالبين يقع على الجهة الموجبة؛ ولترتيب أعداد ناطقة نكتبها بنفس المقام الموجب ثمّ نقارنها كأعداد نسبية',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'clothesline' },
      learningPointIds: ['3am_adad-natiq_P1', '3am_adad-natiq_P2', '3am_adad-natiq_P3'],
      sourceElementIds: ['act-5'],
    },
    {
      kind: 'manipulation', code: 'number-line-pegs-order', type: 'number-line-pegs', module: 1,
      level: 'advanced',
      title: 'حبل الأعداد: رتّب بلا تدريج',
      objective: 'للعدد الناطق مكان واحد على المستقيم وكتابات كثيرة: بطاقات مختلفة الكتابة تستقرّ على الملقط نفسه إذا كانت العدد نفسه، وحاصل قسمة عددين سالبين يقع على الجهة الموجبة؛ ولترتيب أعداد ناطقة نكتبها بنفس المقام الموجب ثمّ نقارنها كأعداد نسبية',
      autonomy: 'لا تدريج بين الأعداد الصحيحة: يعلّق التلميذ كلّ البطاقات بترتيبها ثمّ يحكم الحبل على الترتيب وعلى الوحدة التي يقع فيها كلّ عدد',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'clothesline' },
      learningPointIds: ['3am_adad-natiq_P1', '3am_adad-natiq_P2', '3am_adad-natiq_P3'],
      sourceElementIds: ['method-10'],
    },
    // Module 2 — le MÊME type, monde `writings`, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'number-line-pegs-writings', type: 'number-line-pegs', module: 2,
      title: 'خمس كتابات على الحبل',
      learningPointIds: ['3am_adad-natiq_P2'],
      sourceElementIds: ['know-5'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — أيّ مدينة بردت أسرع؟', learningPointIds: ['3am_adad-natiq_P2', '3am_adad-natiq_P3'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — الغوّاص', learningPointIds: ['3am_adad-natiq_P1', '3am_adad-natiq_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — سدّ بني هارون', learningPointIds: ['3am_adad-natiq_P2', '3am_adad-natiq_P3'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ الكتابة الكسرية لحاصل قسمة، وحاصل قسمة عددين نسبيين، وترتيب الأعداد النسبية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — حبل الأعداد', desc: 'أين تستقرّ البطاقات؟ ولماذا تتكدّس بطاقات مختلفة الكتابة على ملقط واحد؟ وكيف نرتّب أعدادًا ناطقة؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_adad-natiq_P1', '3am_adad-natiq_P2', '3am_adad-natiq_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — العدد الناطق', desc: 'نسمّي ما فعلناه: العدد الناطق، والأعداد التي هي ناطقة، والكتابة المعيارية.',
      stage: 'discovery', teachesLearningPointIds: ['3am_adad-natiq_P1', '3am_adad-natiq_P2'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — مقام موجب مشترك', desc: 'نكتب عددًا ناطقًا بمقام موجب، ونقارن عددين، ونمثّل أعدادًا بالأسداس، ونكتب عددًا مجموع عدد طبيعي وكسر.',
      stage: 'formalization', teachesLearningPointIds: ['3am_adad-natiq_P2', '3am_adad-natiq_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'عشري أم لا، الإشارة، تصنيف وكتابة، عدد طبيعي وكسر، مقارنة وترتيب وتمثيل.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_adad-natiq_P1', '3am_adad-natiq_P2', '3am_adad-natiq_P3'],
      color: 'amber', style: 'featured', estimatedMin: 15, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — أيّ مدينة بردت أسرع؟', desc: 'مسألة الدرس: تغيّر الحرارة في الساعة في ثلاث مدن، وترتيبها، والمدينة الأسرع تبريدًا.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_adad-natiq_P2', '3am_adad-natiq_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — الغوّاص', desc: 'تغيّر العمق في الدقيقة، وبين أيّ عددين صحيحين يقع، وهل هو عدد عشري؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_adad-natiq_P1', '3am_adad-natiq_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — سدّ بني هارون', desc: 'التغيّر اليومي للمنسوب، والتغيّر الأبعد عن الصفر، وترتيب أربعة أعداد.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_adad-natiq_P2', '3am_adad-natiq_P3'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الثلاث.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
