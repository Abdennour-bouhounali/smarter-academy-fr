/**
 * أدمج تعلّماتي — الوحدة 1 « الأعداد النسبية » (3AM, kind: synthesis) — la PREMIÈRE synthèse 1AM–3AM générée, DANS son entrée du catalogue (cycle moyen phase 3, « Phase 0 »,
 * priorité du propriétaire, 2026-10-26). Synthèse de l'unité, affichée après les trois leçons (ce n'est PAS un quatrième درس). Manuel 3AM, RÉFÉRENCE : أدمج تعلّماتي p. 20
 * (`integration` : amplitudes thermiques ; `evaluation` : Fahrenheit), تحدّ ② p. 6 (décompositions de −36), أستعدّ 2–4 p. 7 (repère), أتعمّق 38 p. 18 (banque) — docs/sources/3am/unit1/extraction.json.
 * Le plan : docs/sources/3am/unit1/plan/wadiya-idmajiya-aadad-nisbiya.md. Aucune notion nouvelle ; aucun labo (les situations réutilisent les outils des trois leçons).
 *
 * CONCEPTION (guide §4ter) — format de l'unité 1 / 4AM : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية النهائية للاختبار »
 * (lire et analyser, rien n'est résolu) · 8 « وضعية الاختبار النهائي » (évaluée). Indépendance du manuel (§4ter-bis) : la Lune, Vénus et Mars deviennent une nuit à l'Assekrem ; Paris et Chicago
 * deviennent Sétif et Montréal ; le manuel n'est cité nulle part à l'élève. Une seule الكفاءة (P1), comme les synthèses de 4AM, `programmeItems: []` (la synthèse n'a pas d'item propre).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-aadad-nisbiya';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-aadad-nisbiya',
  kind: 'synthesis',
  unit: 'aadad-nisbiya',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — الأعداد النسبية',
  description: 'ست وضعيات تدريبية تجمع جداء الأعداد النسبية وحاصل قسمتها وسلاسل الحسابات، ثم وضعية الاختبار النهائي: مقارنة درجتي حرارة بسلّمي سيلسيوس وفهرنهايت.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🌡️',
  estimatedDurationMin: 30,
  textbookRef: { unit: 1, pages: '6, 7, 18, 20' },
  skills: ['حل وضعية إدماجية بتوظيف جداء وحاصل قسمة الأعداد النسبية وسلسلة حسابات عليها'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: حرارة، رصيد، إحداثيات، نقاط، تفكيك عدد سالب، تصحيح حسابات', 'وضعية الاختبار النهائي: التحويل بين السيلسيوس والفهرنهايت ومقارنة درجتين'],
    exclude: ['أي مفهوم جديد', 'حل معادلة بتقنية خاصة (تُوجد المجاهيل بحاصل قسمة أو تُتحقَّق بالتعويض)', 'العمليات على الكسور (الوحدة 2)'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : le produit de deux et de plusieurs relatifs, le quotient, les priorités, la somme algébrique, le repère.
  priorKnowledge: ['jidaa-nisbi', 'jidaa-ida', 'qisma-nisbi', 'awlawiya-amaliyat', 'majmu-jabri', 'ihdathiyat'],
  resources: [
    { kind: 'situation', code: 'situation-sitif-montreal', module: 7, title: 'وضعية: درجتا الحرارة في سطيف ومونتريال', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'], sourceElementIds: ['evaluation'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; le module 7 analyse la situation évaluée au module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — ليلة في الأسكرام', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — رصيد جمعية الحيّ', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — خريطة الكنز', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — مسابقة الأسئلة', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — تفكيك −36', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — ورقة إجابات رياض', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ الجداء والقسمة وأولوية العمليات وإحداثيات نقطة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — ليلة في الأسكرام', desc: '12°C عند 18:00 تنخفض 1,5°C كل ساعة: الحرارة عند 23:00، متى الصفر، أدنى درجة، السعة بالكلفن والمتوسّط.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — رصيد جمعية الحيّ', desc: 'يتغيّر رصيد الجمعية كل أسبوع: بعد 6 أسابيع، وقبل 6 أسابيع، ومتى ينفد.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — خريطة الكنز', desc: 'أضرب إحداثيات نقط في −1، وأحسب موقع الكنز بجداء وحاصل قسمة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — مسابقة الأسئلة', desc: '+5 و −3 و 0: نقاط المتسابقين، نقطة مجهولة بحاصل قسمة، ثم المتوسّط.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — تفكيك −36', desc: 'كل كتابات −36 جداءً لعددين صحيحين نسبيين: أصغر مجموع ومجموع معدوم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — ورقة إجابات رياض', desc: 'أحكم على خمس إجابات وأصحّح الخاطئة منها مع التعليل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`, title: 'تحليل الوضعية النهائية للاختبار', desc: 'اقرأ وضعية سطيف ومونتريال، افرز المعطيات، واختر العمليات وترتيبها في ثلاث مراحل — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'خمس مراحل تُقيَّم: التحويل إلى الفهرنهايت، ثم إلى السيلسيوس، المقارنة، الفارق، والتحقّق.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 12, difficulty: 4, actionText: 'أحلّ' },
  ],
};
