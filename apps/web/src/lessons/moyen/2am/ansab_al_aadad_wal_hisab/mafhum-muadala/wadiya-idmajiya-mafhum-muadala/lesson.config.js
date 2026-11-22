/**
 * أدمج تعلّماتي — الوحدة 4 « مفهوم معادلة » (2AM, kind: synthesis) — généré DANS son entrée du catalogue (cycle moyen phase 3, 2026-10-30), sur le modèle de la synthèse de l'unité 2
 * (`wadiya-idmajiya-kusur-amaliyat`). Synthèse de l'unité, affichée après les trois leçons (ce n'est PAS une quatrième leçon). Manuel 2AM, RÉFÉRENCE : أدمج تعلّماتي p. 68 (`integration` : le club,
 * `evaluation` : la distance de freinage), أوظّف تكنولوجيات الإعلام والاتصال p. 69 (`ict` : le tableur), أتعمّق p. 67 (`deep-58` → banc) — docs/sources/2am/unit4/extraction.json.
 * Le plan : docs/sources/2am/unit4/plan/wadiya-idmajiya-mafhum-muadala.md. Aucune notion nouvelle ; aucun labo.
 *
 * CONCEPTION (guide §4ter) — format de l'unité 1 / 3AM : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية النهائية للاختبار »
 * (lire et analyser, rien n'est résolu) · 8 « وضعية الاختبار النهائي » (évaluée). Indépendance du manuel (§4ter-bis) : le club devient un club d'informatique (1200 + 150n contre 600 + 180n), la distance
 * de freinage la règle des pointures (valeurs exactes), le tableur un programme de calcul « + 5, × 2, + 3 fois le nombre → 65 », le تحدّي de l'unité la rangée de cellules ; le manuel n'est cité nulle part
 * à l'élève. Une seule الكفاءة (P1), comme les synthèses des unités précédentes, `programmeItems: []`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-mafhum-muadala';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-mafhum-muadala',
  kind: 'synthesis',
  unit: 'mafhum-muadala',
  unitTitle: 'مفهوم معادلة',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — مفهوم معادلة',
  description: 'ست وضعيات تدريبية تجمع العبارة الحرفية وقيمها واختبار المساواة والمتباينة وحلّ المعادلة، ثم وضعية الاختبار النهائي: رحلة مدرسية إلى متحف.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 30,
  textbookRef: { unit: 4, pages: '68, 69' },
  skills: ['حلّ وضعية إدماجية بإنتاج عبارة حرفية وحساب قيمها وتبسيطها، واختبار صحّة مساواة أو متباينة بقيم معطاة، وحلّ معادلة من الأشكال $a\\times x=b$ ، $\\frac xa=b$ ، $\\frac ax=b$ أو من خطوتين'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: نادي الإعلام الآلي، قاعدة مقاس الحذاء، حديقة بدلالة x، ورقة إجابات سارة، صفّ الخلايا، برنامج الحساب', 'وضعية الاختبار النهائي: الرحلة المدرسية (عبارة التكلفة وقيمتها واختبار متباينة وحلّ معادلة من خطوتين والتحقّق من نصيب كلّ تلميذ)'],
    exclude: ['أي مفهوم جديد', 'حلّ معادلة يظهر فيها المجهول في الطرفين', 'العمليات على طرفي المعادلة', 'فكّ الأقواس بعد إشارة الطرح', 'الأعداد السالبة'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : une الكفاءة clé de chacune des trois leçons de l'unité.
  priorKnowledge: ['ibara-harfiya-intaj-2am', 'ikhtibar-musawat-mutabayina-2am', 'hall-mushkil-muadala-2am'],
  resources: [
    { kind: 'situation', code: 'situation-rihla-madrasiya', module: 7, title: 'وضعية: الرحلة المدرسية', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; le module 7 analyse la situation évaluée au module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — نادي الإعلام الآلي', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'], sourceElementIds: ['integration'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — قاعدة مقاس الحذاء', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'], sourceElementIds: ['evaluation'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — حديقة بدلالة x', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — ورقة إجابات سارة', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — صفّ الخلايا', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — برنامج الحساب', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'], sourceElementIds: ['ict'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ العبارة الحرفية وقيمتها وتبسيطها، اختبار المساواة، وحلّ المعادلة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — نادي الإعلام الآلي', desc: 'عبارتا صيغتين، جدول قيم، اختبار مساواة من أجل 20 حصّة، وقيم تجعل متباينة صحيحة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — قاعدة مقاس الحذاء', desc: 'قيمة صيغة بمبلغ ثابت، طول قدم من مقاس بمعادلة من خطوتين، واختبار شرط بمتباينة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — حديقة بدلالة x', desc: 'محيط حديقة بدلالة x مبسّطًا، معادلة المحيط، البعدان، المساحة والتحقّق.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — ورقة إجابات سارة', desc: 'أحكم على خمس إجابات وأصحّح الخاطئة منها مع التعليل، ثم نقطة سارة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — صفّ الخلايا', desc: 'تعميم نمط بعبارة، قيمتها لأربعين خلية، ثمّ عدد الخلايا من عدد الأعواد بمعادلة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — برنامج الحساب', desc: 'عبارة برنامج حساب وتبسيطها، جدول قيم، العدد المختار بالجدول وبالمعادلة، ثم التحقّق.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'tahlil-wadiya', path: `${LESSON_BASE_PATH}/tahlil-wadiya`, title: 'تحليل الوضعية النهائية للاختبار', desc: 'اقرأ وضعية الرحلة المدرسية، افرز المعطيات، واختر الحسابات وترتيبها في ثلاث مراحل — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'خمس مراحل تُقيَّم: عبارة التكلفة، قيمتها، متباينة تُختبر، معادلة بخطوتين، ثم التحقّق من نصيب كلّ تلميذ.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 12, difficulty: 4, actionText: 'أحلّ' },
  ],
};
