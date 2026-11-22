/**
 * الدرس 1 من الوحدة 3 — نشر وتبسيط عبارة جبرية
 * Manuel 4AM, unité 3 « الحساب الحرفي » : أستعدّ items 3, 4, 7, 8 (p. 31), نشاط 1 (p. 32),
 * معارف 1 (p. 34), دوري الآن 1 (p. 35), exercices 1–8 (p. 37), QCM 1–3 (p. 40),
 * puis trois « مسائل » de la plateforme (modules 4–6).
 * Source de vérité : docs/sources/4am/unit3/extraction.json.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 *
 * CONCEPTION (LESSON_DEVELOPMENT_GUIDE §4ter, rétrofit du 2026-10-15) — le manuel fixe les الكفاءات, pas le parcours.
 *   Entrée retenue : le terrain de la متوسطة `pitch-expansion` niveau مبتدئ, 3(x + 5) (largeur 3, longueur x + 5 après l'ajout d'une
 *   bande de 5) : deux zones, la main étire x et porte chaque aire dans « المجموع » — « écrire l'aire en somme » devient un geste
 *   avant d'être un mot ; x = 9 donne le calcul 3 × (9 + 5) du livre, tiré des essais de l'élève. Le labo est EN TÊTE du module (le
 *   contexte est son `lead`). Candidats écartés : (a) l'activité 1 du livre telle quelle — (4 − 2,5)(3 + 1,2), « جداء أم مجموع ? »,
 *   انشر… — trois consignes calculées de tête, avant tout besoin (ses questions restent les étapes 1 à 3 et le niveau متقدم
 *   (3x − 1)(3 + x) en est la question 3 sur terrain) ; (b) l'accroche du terrain en CARTE au-dessus du labo (l'ancien parcours) —
 *   un second départ concurrent. Le labo débutant est une situation de la plateforme (3(x + 5) n'est pas dans le livre) :
 *   `platform_designed_entry`.
 *   Ordre des idées : les zones d'un terrain 3(x + 5) et 3 × (9 + 5) → جداء أم مجموع ? (brique `nashr-taarif` APRÈS) → انشر
 *   x(3x + 1), 5x(1 − x) → le terrain (3x − 1)(3 + x) vérifié pour deux x (brique `nashr-qawsayn` APRÈS le نشر) → les deux
 *   formes d'une même aire. Module 2 (معارف) : l'exemple du livre dans le même labo ; définition, brique et exemple du livre APRÈS
 *   leur question ; التبسيط (brique `tabsit` APRÈS). Modules 0, 3–7 : pratique, مسائل, test — inchangés.
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/nashr-tabsit';

export const LESSON_CONFIG = {
  id: 'nashr-tabsit',
  kind: 'lesson',
  unit: 'hisab-harfi',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  // Regard de l'élève : 'mission' (modèle du pilote qasim-adad-tabii, VALIDÉ par le propriétaire le 2026-11-08 ; rollout leçon par leçon,
  // docs/reports/MISSION_ROLLOUT_PROGRESS.md — unité 3, leçon 1, 2026-11-11) — implique le regard « focus » ; l'enseignant et le mode classe ne
  // voient aucun changement.
  studentView: 'mission',
  // LA MISSION : l'ouverture avoue qu'on ne sait pas encore la résoudre ; les outils sont les connaissances de knowledge.jsx ; les points d'étape
  // (conseil du 2026-11-11, verdict L1) RAPPROCHENT de la mission sans en résoudre aucune question : ni ses nombres (1820, 1760, 1944, 124,
  // 186000, 1500, 350, x = 30), ni sa méthode (réduire deux termes croisés OPPOSÉS, lire l'écart à un grand x comme le terme oublié, soustraire
  // deux développements, un prix), ni sa correction — content/mission.test.js et _unit/missionStrings.test.js. La scène : le terrain du quartier
  // et les bancs le long du couloir coupé (« neighbourhood-pitch », sur le kit commun de l'unité lessons/common/mission/pitchSceneKit.jsx).
  mission: {
    scene: 'neighbourhood-pitch',
    title: 'مقاعد الممرّ: كم عشبًا يحتاج ملعب الحيّ؟',
    opening: {
      text: 'يهيّئ متطوّعو الحيّ ملعبًا على أرض مستطيلة عرضها $x$ مترًا. يُقتطع من عرضها شريط عرضه 4 أمتار تُصفّ فيه مقاعد المتفرّجين، وطول الملعب يزيد بـ 10 أمتار على ضعف عرض الأرض. ما مساحة الملعب بدلالة $x$ ؟ وكم يكلّف العشب الذي يُضاف إن اتّسعت الأرض مترًا؟',
      cta: 'لا أعرف بعد… هيا نجمع الأدوات',
    },
    tools: [
      { id: 'nashr-qawsayn', icon: '🧩', label: 'نشر جداء قوسين' },
      { id: 'tawziiya-nashr', icon: '✖️', label: 'ضرب عدد في مجموع أو فرق' },
      { id: 'tabsit', icon: '🧹', label: 'تبسيط عبارة' },
    ],
    climaxModule: 4,
    checkpoints: [
      {
        id: 'cp-ishara', afterModule: 1,
        prompt: '$-3(x - 2) = \\ldots$',
        options: ['$-3x + 6$', '$-3x - 6$', '$-3x - 2$'],
        correct: 0,
        explain: 'العدد $-3$ يُضرب في الحدّين: $(-3) \\times x = -3x$ و $(-3) \\times (-2) = 6$ .',
      },
      {
        id: 'cp-qawsayn', afterModule: 2,
        prompt: '$(x + 1)(x + 6) = \\ldots$',
        options: ['$x^2 + 7x + 6$', '$x^2 + 6$', '$x^2 + 6x + 6$'],
        correct: 0,
        explain: 'أربع مناطق: $x^2$ ، $6x$ ، $x$ و $6$ ، ثم نجمع الحدّين المتشابهين $6x + x = 7x$ .',
      },
      {
        id: 'cp-mutashabih', afterModule: 3,
        prompt: '$2x^2 + 3x$ : هل نكتبه حدًّا واحدًا؟',
        options: ['لا: $2x^2$ و $3x$ غير متشابهين', 'نعم: $5x^2$', 'نعم: $5x^3$'],
        correct: 0,
        explain: '$x^2$ مساحة مربّع و $x$ مساحة شريط: لا نجمع إلا الحدود التي لها قوة الحرف نفسها.',
      },
    ],
  },
  title: 'نشر وتبسيط عبارة جبرية',
  description: 'كتابة عبارة جبرية مكتوبة على شكل جداء على شكل مجموع أو فرق بتطبيق الخاصية التوزيعية k(a + b) = ka + kb و k(a − b) = ka − kb والقاعدة العامة (a + b)(c + d) = ac + ad + bc + bd، ثم تبسيطها بحذف الأقواس وتجميع الحدود المتشابهة.',
  level: 'moyen',
  grade: '4am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان أنساب الأعداد والحساب',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 50,
  textbookRef: { unit: 3, activity: 1, pages: '31, 32, 34, 35, 37, 40' },
  skills: [
    'التمييز بين عبارة تدلّ على جداء وعبارة تدلّ على مجموع، وكتابة جداء على شكل مجموع أو فرق',
    'نشر جداء عدد في مجموع أو فرق: k(a + b) = ka + kb و k(a − b) = ka − kb',
    'نشر جداء قوسين: (a + b)(c + d) = ac + ad + bc + bd',
    'تبسيط عبارة جبرية بحذف الأقواس وجمع الحدود المتشابهة',
  ],
  teachingScope: {
    include: ['تعريف النشر: كتابة عبارة جداء على شكل مجموع أو فرق', 'الخاصية التوزيعية k(a + b) و k(a − b) وجداء قوسين (a + b)(c + d)', 'تبسيط عبارة: حذف الأقواس (المسبوقة بـ − أيضًا) وجمع الحدود المتشابهة', 'التحقّق من نشر بحساب قيمة العبارة من أجل قيمة لـ x'],
    exclude: ['المتطابقات الشهيرة والحساب المتمعن فيه (الدرس 2)', 'تحليل عبارة جبرية إلى جداء عوامل (الدرس 3)'],
  },
  lessonProblem: {
    module: 4,
    title: 'ملعب وممرّ المتفرّجين: مناطق مقتطعة وتوسيع الأرض',
    statement: 'يهيّئ نادي كرة القدم لحيّ النصر، بتعاون متطوّعيه، ملعبًا لتدريب أطفال الحيّ على أرض مستطيلة. عرض الأرض $x$ مترًا، ويُقتطع منه على طول الملعب شريط عرضه 4 m يبقى ممرًّا للمتفرّجين؛ أمّا طول الملعب فيزيد بـ 10 m على ضعف عرض الأرض. يقسّم المدرّب الملعب بخطوط إلى مناطق للتمارين، كما في الملعب المقسّم: منطقة لكل حدّ من الطول مع كل حدّ من العرض. يُغطّى الملعب بعشب اصطناعي ثمن المتر المربّع منه 1500 دج. عرض الأرض في هذا الحيّ 30 مترًا، أي $x = 30$. يتّسع مدرّج الملعب لـ 350 متفرّجًا، ويتدرّب الفريق 3 مرّات في الأسبوع.',
    illustration: { kind: 'plan', shape: 'cut', fill: 'grass', w: '2x + 10', h: 'x', cutH: '4', unit: 'm', cutWord: 'ممرّ', ariaLabel: 'أرض ملعب مستطيلة عرضها x وطولها 2x + 10 يُقتطع منها شريط عرضه 4 m للمتفرّجين' },
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // La carte TOUTE OUVERTE (règle des pilotes, propriétaire 2026-11-08) : toutes les connaissances dès le début, sans verrou par محور.
  knowledgeMapOpen: true,
  // Les acquis que « أستعدّ » (p. 31, items 3, 4, 7, 8 + six ajouts) diagnostique.
  priorKnowledge: ['khassiya-tawziiya', 'awlawiyat-hisab', 'jidaa-x-fi-x', 'hadhf-aqwas'],
  resources: [
    // Module 1 — WORKSPACE À DEUX NIVEAUX, un seul instrument : le terrain découpé.
    //   مبتدئ  — 3(x + 5) : deux zones, une seule distributivité ; pour x = 9 c'est
    //            le calcul 3 × (9 + 5) de la question 1 (lecture corrigée).
    //   متقدم  — (3x − 1)(3 + x) (question 3 de l'activité) : quatre zones dont deux
    //            retranchées, des termes semblables à réunir.
    {
      kind: 'manipulation', code: 'pitch-expansion-3-x5', type: 'pitch-expansion', module: 1,
      level: 'beginner',
      title: 'ملعب عرضه 3 وطوله x + 5',
      objective: 'النشر: مساحة الملعب (جداء بعديه) تساوي مجموع مساحات مناطقه، من أجل كل قيمة لـ x',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'football' },
      learningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P2'],
      sourceElementIds: ['act-1'],
    },
    {
      kind: 'manipulation', code: 'pitch-expansion-3x-1-3-x', type: 'pitch-expansion', module: 1,
      level: 'advanced',
      title: 'ملعب بعداه 3x − 1 و 3 + x',
      objective: 'النشر: مساحة الملعب (جداء بعديه) تساوي مجموع مساحات مناطقه، من أجل كل قيمة لـ x',
      autonomy: 'أربع مناطق منها اثنتان مقتطعتان (حدّ سالب): التلميذ يحسبها كلها بنفسه، يجمع الحدود المتشابهة ويُرفض جمع حدّين غير متشابهين، ثم يتحقّق من المساواة من أجل قيمتين لـ x على الأقل',
      experience: { type: 'platform_adaptation', reason: 'multiple_representations', theme: 'football' },
      learningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'],
      sourceElementIds: ['act-1'],
    },
    // Module 2 (معارف) — l'exemple du livre (2x − 1)(x + 4) dans le MÊME instrument ;
    // un seul niveau (`levels={false}`) : c'est un exemple travaillé.
    {
      kind: 'manipulation', code: 'pitch-expansion-2x-1-x4', type: 'pitch-expansion', module: 2,
      title: 'ملعب بعداه 2x − 1 و x + 4',
      learningPointIds: ['4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'],
      sourceElementIds: ['know-1'],
    },
    // Les trois « مسائل » de la plateforme (modules 4–6) — content/problems.js.
    { kind: 'situation', code: 'masala-1', module: 4, title: 'مسألة الدرس — ملعب وممرّ المتفرّجين: مناطق مقتطعة وتوسيع الأرض', learningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'] },
    { kind: 'situation', code: 'masala-2', module: 5, title: 'مسألة — توسيع أرضية القاعة المتعدّدة الرياضات', learningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'] },
    { kind: 'situation', code: 'masala-3', module: 6, title: 'مسألة — فاتورة الكهرباء: جزء ثابت وجزء متغيّر', learningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P2', '4am_nashr-tabsit_P4'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'عشر عبارات: صحيح أم خاطئ؟ الخاصية التوزيعية، أولويات العمليات، x × x و x + x، حذف الأقواس.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    { id: '01', number: 1, slug: 'nashat', path: `${LESSON_BASE_PATH}/nashat`,
      title: 'ملعب يكبر: نشر عبارة جبرية', desc: 'ملعب يكبر: احسب مساحته منطقةً منطقة، ثم بطريقتين، جداء أم مجموع، انشر وبسّط.',
      stage: 'trigger', teachesLearningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P2', '4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'أجرّب' },
    { id: '02', number: 2, slug: 'maarif', path: `${LESSON_BASE_PATH}/maarif`,
      title: 'معارف — النشر', desc: 'التعريف، الخاصيات الثلاث وملعب آخر، ثم التبسيط بجمع الحدود المتشابهة، وورقة زميلة.',
      stage: 'discovery', teachesLearningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P2', '4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'أكتشف' },
    { id: '03', number: 3, slug: 'awazzif', path: `${LESSON_BASE_PATH}/awazzif`,
      title: 'أوظّف تعلّماتي', desc: 'تسعة تمارين متدرّجة: انشر، بسّط، وتحقّق.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_nashr-tabsit_P2', '4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'],
      color: 'amber', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'أتدرّب' },
    // Les « مسائل » (track: 'problem') : practice_lab, avant le test, qui
    // reste toujours ouvert. Elles comptent dans la complétion, jamais dans
    // la maîtrise — docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
    { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
      title: 'مسألة 1 — ممرّ المتفرّجين', desc: 'مسألة الدرس: ملعب فيه شريط مقتطع؛ انشر مساحته وتحقّق منها، ثم كم يكلّف العشب المضاف؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '05', number: 5, slug: 'masala-2', path: `${LESSON_BASE_PATH}/masala-2`,
      title: 'مسألة 2 — القاعة المتعدّدة الرياضات', desc: 'أرضية تُوسَّع بـ x مترًا في الطول والعرض: هل نسي العامل منطقة؟ وهل تكفي الميزانية؟',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P3', '4am_nashr-tabsit_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '06', number: 6, slug: 'masala-3', path: `${LESSON_BASE_PATH}/masala-3`,
      title: 'مسألة 3 — فاتورة الكهرباء', desc: 'جزء ثابت وجزء لكل كيلوواط ساعي: فرق لا يتعلّق بـ x، ومجموع فواتير السنة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_nashr-tabsit_P1', '4am_nashr-tabsit_P2', '4am_nashr-tabsit_P4'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
    { id: '07', number: 7, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'خمسة أسئلة تُقيّم الكفاءات الأربع.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 3, actionText: 'أدخل التقويم' },
  ],
};
