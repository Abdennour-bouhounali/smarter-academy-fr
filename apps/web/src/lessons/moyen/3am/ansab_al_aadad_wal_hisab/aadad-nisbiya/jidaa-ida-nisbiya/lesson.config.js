/**
 * الدرس — جداء عدة أعداد نسبية (3AM, unité 1 « الأعداد النسبية ») — la DEUXIÈME leçon de l'unité générée, DANS son entrée du catalogue
 * (item 3am.m1.r01, partagé avec `jidaa-adadayn-nisbiyayn`, publiée avant), cycle moyen phase 3, « Phase 0 » (priorité du propriétaire, 2026-10-26).
 * Manuel 3AM (الجيل الثاني, منشورات الشهاب), RÉFÉRENCE des الكفاءات : معارف pp. 10 et 12 (know-3 … know-7), طرائق pp. 11 et 13, دوري الآن p. 11,
 * exercices 5, 9–14, 18, 20 pp. 14–15, أؤكّد 6, 7, 12 p. 17, أتعمّق 35, 39, 42, 44, 46, 49, 51 pp. 18–19, أستعدّ 1, 5, 6, 8, 9 p. 7, le تحدّ ① p. 6.
 * Source : docs/sources/3am/unit1/extraction.json. Rien n'est montré tel quel : tout est réécrit (§4ter-bis). Le plan : docs/sources/3am/unit1/plan/jidaa-ida-nisbiya.md.
 * Le réseau : son lien « راجع » — 2am.m4.r05 (جمع وطرح الأعداد النسبية) — mène à une leçon NON publiée : « أستعدّ » le mesure, avec le produit de deux relatifs
 * (la leçon précédente de l'unité, publiée : rappelée en معارف par une « تذكّر » liée), le معاكس (2am.m4.r01) et la parité d'un entier, en `priorKnowledge` hors réseau.
 * `pointPrerequisites` : arêtes internes ET arêtes vers la leçon précédente du MÊME item (aucun lien du réseau n'est franchi).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le « مسار الروبوت » (labo `robot-track`, thème `roboticsClub`). Un robot part de 1 sur un tapis gradué ; chaque carte de son programme
 *   multiplie sa position : une carte positive l'éloigne du poteau 0 du même côté, une carte NÉGATIVE le fait sauter par-dessus (le symétrique : × (−1) est
 *   le demi-tour). La main tient le SIGNE de chaque carte et l'ORDRE des cartes : pour viser −24 avec 2, 3 et 4 il faut UNE ou TROIS cartes négatives, jamais
 *   deux ; réordonner ne déplace jamais l'arrêt final. La règle de la parité est ce dont la main a besoin pour viser.
 *   Rejetées : (a) le manuel n'a AUCUNE activité pour plusieurs facteurs (la règle est énoncée en معارف avec deux exemples : un énoncé, pas une découverte) ;
 *   (b) un long produit à calculer au stylo puis « observer » le signe : rien ne résiste ; (c) une calculatrice : l'écran donne la réponse sans que la main décide.
 *   Ordre des idées : ×(−1) = le symétrique (P1) → le côté dépend du NOMBRE de cartes négatives (P2) → l'ordre ne compte pas, on regroupe (P2) → معارف : le carré
 *   ne peut jamais être négatif (P3) et les trois rôles du signe − (P1) → طريقة : un long produit ; la distributivité dans les deux sens pour le calcul mental (P4)
 *   → أتمرّن → trois مسائل (le تحدّ ①, un carré magique, un calcul mental) → test.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 * 2026-10-29 : `jam-tarh-nisbiya` (2AM, 2am.m4.r05) est publiée — arête LP P4 ← 2am_jam-tarh-nisbiya_P2 et _P3 (lien du réseau
 * 2am.m4.r05 → 3am.m1.r01).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/jidaa-ida-nisbiya';

export const LESSON_CONFIG = {
  id: 'jidaa-ida-nisbiya',
  kind: 'lesson',
  unit: 'aadad-nisbiya',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'جداء عدة أعداد نسبية',
  description: 'نبرمج روبوتًا على مسار مدرّج: نكتشف أنّ جهة توقّفه تتبع عدد البطاقات السالبة وحده، ثم نعرف أنّ مربّع عدد لا يكون سالبًا، ونحسب جداء عدة أعداد ونوظّف توزيع الضرب في حساب ذهني.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🤖',
  estimatedDurationMin: 88,
  textbookRef: { unit: 1, activity: null, method: [11, 13], pages: '6, 7, 10, 11, 12, 13, 14, 15, 17, 18, 19' },
  skills: [
    'ضرب عدد نسبي في $(-1)$ وتفسير $(-1) \\times a = -a$ كمعاكس العدد $a$ وتمييز أدوار الإشارة $-$',
    'تعيين إشارة جداء عدة أعداد نسبية غير معدومة حسب زوجية عدد عوامله السالبة ثم حسابه بضرب المسافات إلى الصفر مع تغيير ترتيب العوامل',
    'معرفة أنّ مربّع عدد نسبي $a^2 = a \\times a$ موجب دائمًا وأنّ $(-a)^2 = a^2$',
    'توظيف توزيع الضرب على الجمع أو الطرح في الاتجاهين لتبسيط حساب عددي على أعداد نسبية',
  ],
  teachingScope: {
    include: ['الضرب في $-1$ ومعاكس عدد، وأدوار الإشارة $-$', 'إشارة جداء عدة أعداد نسبية وحسابه وتغيير ترتيب العوامل', 'مربّع عدد نسبي $a^2 = a \\times a$', 'توزيع الضرب على الجمع والطرح في الاتجاهين على الأعداد'],
    exclude: ['جداء عددين نسبيين وقاعدة الإشارات وتبريرها (درس «جداء عددين نسبيين»)', 'القوة $a^n$ والمقارنة بين $-a^2$ و $(-a)^2$ (درس «قوة عدد نسبي»)', 'توزيع الضرب بالرموز الحرفية (درس «النشر»)', 'القسمة (درس «حاصل قسمة عددين نسبيين»)'],
  },
  // « مسألة الدرس » : montrée dès le sommaire, résolue au module 5 (content/problems.js) — le تحدّ ① de la page d'ouverture, refait avec 2025 nombres.
  lessonProblem: {
    module: 5,
    title: '2025 عددًا متساوية',
    statement: 'كتبت سلمى 2025 عددًا نسبيًا كلّها متساوية، فوجدت أنّ مجموعها $-2025$ .',
    questions: [
      { label: '1)', text: 'ما هو كل عدد؟' },
      { label: '2)', text: 'ما إشارة جداء هذه الأعداد؟' },
      { label: '3)', text: 'ما قيمة الجداء؟' },
      { label: '4)', text: 'لو كان عدد الأعداد 2026 ومجموعها $-2026$ ، فما قيمة جداء هذه الأعداد؟' },
    ],
    illustration: { kind: 'scene', icon: 'book', bg: 'blue', chips: [{ label: 'عدد الأعداد', value: 2025, tone: 'blue' }, { label: 'مجموعها', value: '−2025', tone: 'rose' }, { label: 'كلّها', value: 'متساوية', tone: 'amber' }], ariaLabel: 'سلمى كتبت 2025 عددًا نسبيًا متساويًا مجموعها يساوي سالب 2025' },
  },
  knowledgeMap: true,
  knowledgeMapMode: 'progressive',
  // Ce que « أستعدّ » diagnostique : le lien « راجع » du réseau (2am.m4.r05) et trois prérequis hors réseau (le produit de deux relatifs, le معاكس, la parité).
  priorKnowledge: ['jam-tarh-nisbi', 'jidaa-adadayn', 'maakus-adad', 'zawjiya'],
  resources: [
    // Module 1 — L'ENTRÉE, WORKSPACE À DEUX NIVEAUX, un seul type `robot-track` (la main tient les SIGNES et l'ORDRE des cartes), thème `roboticsClub` :
    //   مبتدئ — m1 placer −1 (5 → −5), m2 une carte ramène à 5, m3 le drapeau −24 avec 2, 3, 4 (signes à la main), m4 le drapeau 24 avec au moins deux négatives ;
    //   متقدم — prédire le côté et la distance d'un programme fixe, ordonner −5, 4, −0,5, 2 pour être à −2 après deux cartes, la carte 3 puis (−1) répétée n fois.
    {
      kind: 'manipulation', code: 'robot-track-cards', type: 'robot-track', module: 1,
      level: 'beginner',
      title: 'مسار الروبوت: بطاقات وإشارات',
      objective: 'كل بطاقة سالبة تقلب الروبوت إلى الجهة الأخرى من الصفر: جهة توقّفه تتبع عدد البطاقات السالبة وحده، سالبة إذا كان فرديًا وموجبة إذا كان زوجيًا، ولا تتبع ترتيبها',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'roboticsClub' },
      learningPointIds: ['3am_jidaa-ida-nisbiya_P1', '3am_jidaa-ida-nisbiya_P2'],
      sourceElementIds: ['know-3', 'know-5'],
    },
    {
      kind: 'manipulation', code: 'robot-track-predict', type: 'robot-track', module: 1,
      level: 'advanced',
      title: 'مسار الروبوت: توقّع وترتيب',
      objective: 'كل بطاقة سالبة تقلب الروبوت إلى الجهة الأخرى من الصفر: جهة توقّفه تتبع عدد البطاقات السالبة وحده، سالبة إذا كان فرديًا وموجبة إذا كان زوجيًا، ولا تتبع ترتيبها',
      autonomy: 'يتوقّع التلميذ جهة توقّف الروبوت وبُعده قبل أن يشغّله، ويرتّب بطاقات برنامج حتى يبلغ موضعًا بعد بطاقتين، ويختار عدد بطاقات (−1) المكرّرة',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'roboticsClub' },
      learningPointIds: ['3am_jidaa-ida-nisbiya_P2'],
      sourceElementIds: ['know-5', 'method-4'],
    },
    // Module 2 — le MÊME type, monde `square`, posé seul (`levels={false}`) : déclaré SANS niveau.
    {
      kind: 'manipulation', code: 'robot-track-square', type: 'robot-track', module: 2,
      title: 'المربّع على المسار',
      learningPointIds: ['3am_jidaa-ida-nisbiya_P3'],
      sourceElementIds: ['know-6'],
    },
    { kind: 'situation', code: 'masala-1', module: 5, title: 'مسألة الدرس — 2025 عددًا متساوية', learningPointIds: ['3am_jidaa-ida-nisbiya_P1', '3am_jidaa-ida-nisbiya_P2'], sourceElementIds: ['challenge'] },
    { kind: 'situation', code: 'masala-2', module: 6, title: 'مسألة — مربّع النادي السحري', learningPointIds: ['3am_jidaa-ida-nisbiya_P1', '3am_jidaa-ida-nisbiya_P2'] },
    { kind: 'situation', code: 'masala-3', module: 7, title: 'مسألة — حساب ذهني في التعاونية', learningPointIds: ['3am_jidaa-ida-nisbiya_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ جداء عددين، ومعاكس عدد، والأعداد الفردية، وجمع الأعداد النسبية.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'نشاط — مسار الروبوت', desc: 'نبرمج روبوتًا بالبطاقات: أين يتوقّف حين نقلب إشارة بطاقة؟ ومتى يتوقّف في الجهة السالبة؟',
      stage: 'trigger', teachesLearningPointIds: ['3am_jidaa-ida-nisbiya_P1', '3am_jidaa-ida-nisbiya_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — المربّع وأدوار الإشارة', desc: 'بطاقة تُوضع مرّتين: هل يتوقّف الروبوت في الجهة السالبة؟ ثم ثلاثة أدوار للإشارة −.',
      stage: 'discovery', teachesLearningPointIds: ['3am_jidaa-ida-nisbiya_P1', '3am_jidaa-ida-nisbiya_P3'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'tariqa', path: `${LESSON_BASE_PATH}/tariqa`,
      title: 'طريقة — أحسب جداء عدة أعداد وأستعمل التوزيع', desc: 'نعدّ العوامل السالبة ونغيّر ترتيب العوامل، ثم نوزّع الضرب في الاتجاهين لنحسب ذهنيًا.',
      stage: 'formalization', teachesLearningPointIds: ['3am_jidaa-ida-nisbiya_P2', '3am_jidaa-ida-nisbiya_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتعلّم الطريقة' },
    { id: '04', number: 4, slug: 'atamarran', path: `${LESSON_BASE_PATH}/atamarran`,
      title: 'أتمرّن', desc: 'معاكس عدد، جداءات، إشارات جداءات طويلة، برنامجا حساب، وتوزيع الضرب بطريقتين.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_jidaa-ida-nisbiya_P1', '3am_jidaa-ida-nisbiya_P2', '3am_jidaa-ida-nisbiya_P4'],
      color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'أتدرّب' },
    { id: '05', number: 5, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — 2025 عددًا متساوية', desc: 'مسألة الدرس: مجموع 2025 عددًا متساويًا هو −2025، فما جداؤها؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jidaa-ida-nisbiya_P1', '3am_jidaa-ida-nisbiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — مربّع النادي السحري', desc: 'مربّع ضربي من تسع خانات سالبة: لماذا كل جداءاته سالبة؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jidaa-ida-nisbiya_P1', '3am_jidaa-ida-nisbiya_P2'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — حساب ذهني في التعاونية', desc: 'جداء يعبّر عن خسارة التعاونية، نحسبه ذهنيًا بالتوزيع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_jidaa-ida-nisbiya_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 8, difficulty: 2, actionText: 'أدخل التقويم' },
  ],
};
