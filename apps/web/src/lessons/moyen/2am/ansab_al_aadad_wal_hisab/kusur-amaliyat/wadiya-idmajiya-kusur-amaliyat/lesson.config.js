/**
 * أدمج تعلّماتي — الوحدة 2 « الكسور والعمليات عليها » (2AM, kind: synthesis) — généré DANS son entrée du catalogue (cycle moyen phase 3, 2026-10-29), sur le modèle de la synthèse
 * 3AM de l'unité 2 (`wadiya-idmajiya-kusur-natiqa`). Synthèse de l'unité, affichée après les cinq leçons (ce n'est PAS un sixième درس). Manuel 2AM, RÉFÉRENCE : أدمج تعلّماتي p. 36
 * (`integration` : l'assainissement dans le monde ; `evaluation` : le crédit téléphonique de Rachid), تحدّي p. 22 (les cinq cartes), opener p. 22 (هل تعلم) —
 * docs/sources/2am/unit2/extraction.json. Le plan : docs/sources/2am/unit2/plan/wadiya-idmajiya-kusur-amaliyat.md. Aucune notion nouvelle ; aucun labo.
 *
 * CONCEPTION (guide §4ter) — format de l'unité 1 / 3AM : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية النهائية للاختبار »
 * (lire et analyser, rien n'est résolu) · 8 « وضعية الاختبار النهائي » (évaluée). Indépendance du manuel (§4ter-bis) : l'assainissement mondial devient le réseau d'eau d'une commune,
 * le crédit de Rachid la باقة d'internet d'une famille (1/3 puis 3/4 du reste), les cartes du تحدّي celles de Sara (1/2, 1/3, 1/4, 1/6, 1/12) ; le manuel n'est cité nulle part à l'élève.
 * Une seule الكفاءة (P1), comme les synthèses de 3AM et de 4AM, `programmeItems: []`. La carte de l'unité garde le texte du تحدّي du manuel jusqu'à la décision du propriétaire.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-kusur-amaliyat';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-kusur-amaliyat',
  kind: 'synthesis',
  unit: 'kusur-amaliyat',
  unitTitle: 'الكسور والعمليات عليها',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — الكسور والعمليات عليها',
  description: 'ست وضعيات تدريبية تجمع القسمة والحصر والجمع والطرح والجداء والمقارنة، ثم وضعية الاختبار النهائي: أرض التعاونية وكسور الأرض وكسور البستان.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 30,
  textbookRef: { unit: 2, pages: '22, 36' },
  skills: ['حلّ وضعية إدماجية بتوظيف الكسور والعمليات عليها: القسمة الإقليدية والحصر والقيم المقرّبة، الجمع والطرح، الجداء، والمقارنة'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: شبكة مياه البلدية، باقة الإنترنت، بطاقات المجموع، قماش الستائر، تبرّعات المستويات، ورقة إجابات رياض', 'وضعية الاختبار النهائي: أرض التعاونية (كسور من الأرض كلّها وكسور من البستان ثم المساحات ومردود القمح)'],
    exclude: ['أي مفهوم جديد', 'الكسور التي ليس مقام أحدها مضاعفًا للآخر (السنة الثالثة)', 'القسمة على كسر (السنة الثالثة)', 'النسب المئوية', 'المعادلات'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : une الكسر clé de chacune des cinq leçons de l'unité.
  priorKnowledge: ['qisma-iqlidiya-hasr-2am', 'kasr-hasil-qisma-2am', 'jam-tarh-kusur-2am', 'jida-kasrayn-2am', 'muqarana-kasrayn-2am'],
  resources: [
    { kind: 'situation', code: 'situation-ard-taawuniya', module: 7, title: 'وضعية: أرض التعاونية', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'], sourceElementIds: ['challenge'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; le module 7 analyse la situation évaluée au module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — شبكة مياه البلدية', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'], sourceElementIds: ['integration'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — باقة الإنترنت', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'], sourceElementIds: ['evaluation'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — بطاقات المجموع', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'], sourceElementIds: ['challenge'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — قماش الستائر', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — تبرّعات المستويات', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — ورقة إجابات رياض', learningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ القسمة الإقليدية والقيم المقرّبة والجمع والطرح والجداء والمقارنة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — شبكة مياه البلدية', desc: 'كسران من عدد الأسر، مقارنة الجزء بالنصف، عدد الأسر، ثم حصر نصيب الأسرة من ماء الخزّان.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — باقة الإنترنت', desc: 'كسر من الباقي، ما بقي في آخر الشهر، ثم حجم الباقة كلّها من جزئها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — بطاقات المجموع', desc: 'خمس بطاقات كسرية: المقام المشترك، الترتيب، ثم أربع بطاقات وثلاث بطاقات مجموعها 1.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — قماش الستائر', desc: 'القسمة الإقليدية بعد تحويل الوحدة، حاصل القسمة على عدد عشري وحصره، ثم قرار.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — تبرّعات المستويات', desc: 'حصّة المستوى الرابع، ترتيب الحصص، المبالغ، ثم هل جمعت سنتان أكثر من النصف.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — ورقة إجابات رياض', desc: 'أحكم على خمس إجابات وأصحّح الخاطئة منها مع التعليل، ثم نقطة رياض.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'tahlil-wadiya', path: `${LESSON_BASE_PATH}/tahlil-wadiya`, title: 'تحليل الوضعية النهائية للاختبار', desc: 'اقرأ وضعية أرض التعاونية، افرز المعطيات، واختر الحسابات وترتيبها في ثلاث مراحل — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_wadiya-idmajiya-kusur-amaliyat_P1'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'خمس مراحل تُقيَّم: الجزء المزروع، والبستان وأكبر المزروعات، والتفّاح، والمساحات، ثم مردود القمح.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 12, difficulty: 4, actionText: 'أحلّ' },
  ],
};
