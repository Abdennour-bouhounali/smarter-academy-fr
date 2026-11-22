/**
 * أدمج تعلّماتي — الوحدة 4 « الحساب الحرفي » (3AM, kind: synthesis) — généré DANS son entrée du catalogue (cycle moyen phase 3, « Phase 0 », priorité du propriétaire, 2026-10-26), sur le modèle
 * des synthèses de l'unité 1 et de l'unité 2. Synthèse de l'unité, affichée après les quatre leçons (ce n'est PAS un cinquième درس). Manuel 3AM, RÉFÉRENCE : أدمج تعلّماتي p. 68 (`integration` : les départs
 * décalés ; `evaluation` : la distance d'arrêt), أتعمّق 35 p. 66 (trois triangles dans un rectangle), 47 p. 67 (carré magique) — docs/sources/3am/unit4/extraction.json. Le plan :
 * docs/sources/3am/unit4/plan/wadiya-idmajiya-ibarat-harfiya-3.md. Aucune notion nouvelle ; aucun labo.
 *
 * CONCEPTION (guide §4ter) — format de l'unité 1 / 4AM : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية النهائية للاختبار »
 * (lire et analyser, rien n'est résolu) · 8 « وضعية الاختبار النهائي » (évaluée, quatre épreuves + un bonus non compté). Indépendance du manuel (§4ter-bis) : la piste devient celle de l'école
 * (couloirs de 1,2 m), le carré magique et les trois triangles ont d'autres cases et d'autres nombres, la distance d'arrêt d'autres formules ; le manuel n'est cité nulle part à l'élève.
 * Deux الكفاءات (P1 mobiliser les outils, P2 traduire puis décider), comme les synthèses de 4AM, `programmeItems: []`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-ibarat-harfiya-3';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-ibarat-harfiya-3',
  kind: 'synthesis',
  unit: 'ibarat-harfiya-3',
  unitTitle: 'الحساب الحرفي',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — الحساب الحرفي',
  description: 'ست وضعيات تدريبية تجمع التبسيط والنشر وحساب القيمة والمقارنة بإشارة الفرق، ثم وضعية الاختبار النهائي: انطلاقات متفاوتة في مضمار المدرسة.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 3,
  masteryThreshold: 0.8,
  emoji: '🏃',
  estimatedDurationMin: 70,
  textbookRef: { unit: 4, pages: '66, 67, 68' },
  skills: ['حل وضعية إدماجية بتوظيف الحساب الحرفي: التبسيط والنشر وحساب قيمة عبارة والمقارنة بإشارة الفرق، وترييض وضعية ثم اتخاذ قرار مبرَّر'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: مربّع سحري، ساحة وممرّ، برامج حساب، اشتراكا قاعة، مثلّثات في مستطيل، مسافة التوقّف', 'وضعية الاختبار النهائي: الانطلاقات المتفاوتة في مضمار المدرسة (أطوال بالحروف، فروق مبسَّطة، قيم، قرار) وتحدٍّ إضافي'],
    exclude: ['أي مفهوم جديد', 'المتطابقات الشهيرة (4AM)', 'التحليل إلى جداء عوامل', 'حلّ معادلة بتقنية خاصة', 'معالجة متباينة (الطرفان)', 'رمز الدالة (A(−3) ...)'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : les quatre leçons de l'unité.
  priorKnowledge: ['tabsit-hadhf-aqwas-3am', 'nashr-jabri-3am', 'qimat-ibara-harfiya-3am', 'muqaranat-natiqayn-3am'],
  resources: [
    { kind: 'situation', code: 'situation-madmar', module: 7, title: 'وضعية: انطلاقات متفاوتة في مضمار المدرسة', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'], sourceElementIds: ['integration'] },
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — المربّع السحري', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1'], sourceElementIds: ['deep-47'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — ساحة وممرّ', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1', '3am_wadiya-idmajiya-ibarat-harfiya-3_P2'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — برامج الحساب', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — اشتراكا القاعة', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — مثلّثات في مستطيل', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1', '3am_wadiya-idmajiya-ibarat-harfiya-3_P2'], sourceElementIds: ['deep-35'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — مسافة التوقّف', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'], sourceElementIds: ['evaluation'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ التبسيط والنشر وحساب القيمة والمقارنة بإشارة الفرق.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — المربّع السحري', desc: 'مجاميع عبارات بدلالة a لتتميم مربّع سحري، ثم التحقّق بقيمتين لـ a.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — ساحة وممرّ', desc: 'نشر عبارة مساحة وتبسيطها، ثم قيمتها بـ x = 3,5 وثمن العشب.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1', '3am_wadiya-idmajiya-ibarat-harfiya-3_P2'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — برامج الحساب', desc: 'ثلاثة برامج حساب: مثال مضادّ يبطل المساواة، والنشر يبرهنها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — اشتراكا القاعة', desc: 'عرضان يُقارنان بتبسيط فرقهما وتعيين إشارته حسب عدد الحصص.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — مثلّثات في مستطيل', desc: 'مساحات بدلالة x، مجموعها المبسَّط، ثم مقارنته بمساحة المثلث الرابع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1', '3am_wadiya-idmajiya-ibarat-harfiya-3_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — مسافة التوقّف', desc: 'قيمة عبارة بأعداد عشرية، ثم القرار بمقارنة عددين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`, title: 'تحليل الوضعية النهائية للاختبار', desc: 'اقرأ وضعية المضمار، افرز المعطيات، وخطّط لحلّها في ثلاث مراحل — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1', '3am_wadiya-idmajiya-ibarat-harfiya-3_P2'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'أربع مراحل تُقيَّم: أطوال المسارات، والفروق المبسَّطة، والقيم التقريبية، والقرار — ثم تحدٍّ إضافي.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 12, difficulty: 4, actionText: 'أحلّ' },
  ],
};
