/**
 * أدمج تعلّماتي — الوحدة 2 « العمليات على الكسور والأعداد الناطقة » (3AM, kind: synthesis) — généré DANS son entrée du catalogue (cycle moyen phase 3, « Phase 0 », priorité du propriétaire,
 * 2026-10-26), sur le modèle de la synthèse de l'unité 1 (`wadiya-idmajiya-aadad-nisbiya`). Synthèse de l'unité, affichée après les cinq leçons (ce n'est PAS un sixième درس). Manuel 3AM,
 * RÉFÉRENCE : أدمج تعلّماتي p. 36 (`integration` : bassin ; `evaluation` : quatre frères), تحدّ p. 22 (la tirelire de Hicham), أؤكّد 8 et 12 p. 33 (أستعدّ 1 et 6), opener p. 22 (هل تعلم),
 * أتعمّق 61, 67, 70, 72, 75, 78 pp. 34–35 (banque) — docs/sources/3am/unit2/extraction.json. Le plan : docs/sources/3am/unit2/plan/wadiya-idmajiya-kusur-natiqa.md. Aucune notion nouvelle ; aucun labo.
 *
 * CONCEPTION (guide §4ter) — format de l'unité 1 / 4AM : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية النهائية للاختبار »
 * (lire et analyser, rien n'est résolu) · 8 « وضعية الاختبار النهائي » (évaluée). Indépendance du manuel (§4ter-bis) : le bassin devient celui d'un club (5 × 3 × 3/2 m, 1/3 puis 3/8 du reste),
 * les quatre frères (2/5, 1/2 du reste, 1800 DA), la tirelire de Meriem remplace celle de Hicham (1/3, 1/4, 3/5 du reste, 1500 DA) ; le manuel n'est cité nulle part à l'élève. Une seule
 * الكفاءة (P1), comme les synthèses de 4AM et de l'unité 1, `programmeItems: []`. La carte de l'unité garde le texte du تحدّ du manuel jusqu'à la décision du propriétaire (plan, question 2).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-kusur-natiqa';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-kusur-natiqa',
  kind: 'synthesis',
  unit: 'kusur-natiqa',
  unitTitle: 'العمليات على الكسور والأعداد الناطقة',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة',
  description: 'ست وضعيات تدريبية تجمع المقلوب وقسمة الكسور والمقارنة والجمع والطرح والأعداد الناطقة، ثم وضعية الاختبار النهائي: حصّالة مريم وكسور الباقي.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '💰',
  estimatedDurationMin: 30,
  textbookRef: { unit: 2, pages: '22, 33, 34, 35, 36' },
  skills: ['حل وضعية إدماجية بتوظيف العمليات على الكسور والأعداد الناطقة: المقلوب والقسمة، المقارنة، الجمع والطرح، وسلاسل الحساب'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: تبليط حوض، جائزة الإخوة، جرار العسل، رحلة الدرّاجات، ليلة باردة، ورقة إجابات', 'وضعية الاختبار النهائي: حصّالة مريم (كسور من الكلّ وكسور من الباقي ثم المبلغ الكلّي)'],
    exclude: ['أي مفهوم جديد', 'النسب المئوية (وحدة لاحقة)', 'حلّ معادلة بتقنية خاصة (يُوجد الكلّ المجهول بقسمة واحدة على كسر)', 'خاصية طالس', 'القوى'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : une الكفاءة clé de chacune des cinq leçons de l'unité et le produit « une fraction d'une quantité » de 2AM.
  priorKnowledge: ['maqlub-qismat-kasrayn-3am', 'tasawi-muqaranat-kasrayn-3am', 'jam-tarh-kasrayn-3am', 'adad-natiq-3am', 'amaliyat-natiqa-3am', 'jida-kasrayn-2am'],
  resources: [
    { kind: 'situation', code: 'situation-hasala-mariam', module: 7, title: 'وضعية: حصّالة مريم', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'], sourceElementIds: ['challenge'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; le module 7 analyse la situation évaluée au module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — تبليط حوض النادي', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'], sourceElementIds: ['integration'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — جائزة الإخوة', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'], sourceElementIds: ['evaluation'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — جرار العسل', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — رحلة الدرّاجات', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — ليلة باردة في سطيف', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — ورقة إجابات سارة', learningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ المقلوب والمقارنة والجمع والطرح والعدد الناطق وسلسلة حساب.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — تبليط حوض النادي', desc: 'مساحة أوجه حوض بأبعاد كسرية، ثم كسر الباقي يومًا بعد يوم حتى كسر اليوم الثالث من الكلّ.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — جائزة الإخوة', desc: 'حصّة الأخ الثاني، والعبارة التي تمثّل حصّة أخت، ثم قيمة الجائزة من حصّتي الأختين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — جرار العسل', desc: 'قسمة كمية على سعة كسرية، والباقي، ثم ثمن الكيلوغرام في جرّتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — رحلة الدرّاجات', desc: 'ما قُطع وما بقي كسرين، ثم طول المسار من 16 km الباقية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — ليلة باردة في سطيف', desc: 'حرارة تنخفض بانتظام بكسرين مختلفين، ومتوسّط التغيّر ومقارنة سرعتي الانخفاض.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — ورقة إجابات سارة', desc: 'أحكم على خمس إجابات وأصحّح الخاطئة منها مع التعليل، ثم هرم مجاميع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'tahlil-wadiya', path: `${LESSON_BASE_PATH}/tahlil-wadiya`, title: 'تحليل الوضعية النهائية للاختبار', desc: 'اقرأ وضعية حصّالة مريم، افرز المعطيات، واختر الحسابات وترتيبها في ثلاث مراحل — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_wadiya-idmajiya-kusur-natiqa_P1'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'خمس مراحل تُقيَّم: المُنفَق، والباقي، والهدية، وما بقي في النهاية، ثم المبلغ الكلّي وأكبر إنفاق.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 12, difficulty: 4, actionText: 'أحلّ' },
  ],
};
