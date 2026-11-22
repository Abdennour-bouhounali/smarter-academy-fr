/**
 * أدمج تعلّماتي — الوحدة 3 « الأعداد النسبية » (2AM, kind: synthesis) — généré DANS son entrée du catalogue (cycle moyen phase 3, 2AM مقطع 2am.m4, paire 5, 2026-10-30), sur le modèle de la
 * synthèse 2AM de l'unité 2 (`wadiya-idmajiya-kusur-amaliyat`). Synthèse de l'unité, affichée après les six leçons (ce n'est PAS un septième درس). Manuel 2AM, RÉFÉRENCE : أدمج تعلّماتي p. 52
 * (`integration` : la feuille de septembre d'une famille ; `evaluation` : les décalages horaires), تحدّي p. 38 (les Grands Lacs) — docs/sources/2am/unit3/extraction.json, relus à 170 dpi.
 * Le plan : docs/sources/2am/unit3/plan/wadiya-idmajiya-adad-nisbiya-2.md. Aucune notion nouvelle ; aucun labo (les situations recombinent les outils des six leçons).
 *
 * CONCEPTION (guide §4ter) — format de l'unité 1 / 3AM : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية النهائية للاختبار »
 * (lire et analyser, rien n'est résolu) · 8 « وضعية الاختبار النهائي » (évaluée). Indépendance du manuel (§4ter-bis) : la feuille d'Excel devient le budget d'un mois semaine par semaine
 * (montants propres, ni prêt ni intérêt), la recherche sur internet des fuseaux horaires devient un tableau de décalages d'HIVER DONNÉS, les Grands Lacs deviennent chott Melghir / Tahat (« حوالي ») ;
 * la situation finale est un camp d'hiver à Djelfa (températures minimales et maximales de cinq jours, points d'un repère). Le manuel n'est cité nulle part à l'élève.
 * Une seule الكفاءة (P1), comme les synthèses de 3AM et de 4AM, `programmeItems: []`. `pointPrerequisites` P1 ← une الكفاءة clé de chacune des six leçons (la même qui sert de « أستعدّ »).
 * La carte de l'unité reçoit le تحدّي redessiné de la plateforme (units_2am_2026_2027.json › challengeAr).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-adad-nisbiya-2';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-adad-nisbiya-2',
  kind: 'synthesis',
  unit: 'adad-nisbiya-2',
  unitTitle: 'الأعداد النسبية',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — الأعداد النسبية',
  description: 'ست وضعيات تدريبية تجمع التعليم والمقارنة والجمع والطرح والمجموع الجبري والمسافة، ثم وضعية الاختبار النهائي: مخيّم شتوي في الجلفة ودرجات الحرارة الصغرى والكبرى في خمسة أيام.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 30,
  textbookRef: { unit: 3, pages: '38, 52' },
  skills: ['حلّ وضعية إدماجية بتوظيف الأعداد النسبية: التعليم على مستقيم مدرّج وفي معلم، المقارنة والترتيب، الجمع والطرح والمجموع الجبري، والمسافة بين نقطتين'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: ميزانية الأسرة في شهر، فارق التوقيت، بين شطّ ملغيغ وقمّة تاهات، تبليط قاعة القسم، مصعد البرج، ورقة إجابات سليم', 'وضعية الاختبار النهائي: مخيّم شتوي في الجلفة (ترتيب الدرجات الصغرى، فارق اليوم، تغيّر الصغرى، مجموع التغيّرات، نقطة اليوم في معلم)'],
    exclude: ['أي مفهوم جديد', 'جداء أو حاصل قسمة عددين نسبيين (السنة الثالثة)', 'المعادلات (الوحدة 4)', 'التناظر المركزي (وحدة لاحقة)', 'إثبات طبيعة رباعي (وحدة لاحقة)'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : une idée clé de chacune des six leçons de l'unité.
  priorKnowledge: ['faasila', 'salibayn', 'nuqta-ala-mihwar', 'jam-ishara-mukhtalifa', 'qaidat-majmu-jabri', 'qaidat-masafa'],
  resources: [
    { kind: 'situation', code: 'situation-mukhayyam-jalfa', module: 7, title: 'وضعية: مخيّم شتوي في الجلفة', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js) ; le module 7 analyse la situation évaluée au module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — ميزانية الأسرة في شهر', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'], sourceElementIds: ['integration'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — فارق التوقيت', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'], sourceElementIds: ['evaluation'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — بين شطّ ملغيغ وقمّة تاهات', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'], sourceElementIds: ['challenge'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — تبليط قاعة القسم', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — مصعد البرج', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — ورقة إجابات سليم', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'أتحقّق من أنّي أعلّم وأقارن وأجمع وأطرح وأحسب المسافة قبل الوضعيات.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — ميزانية الأسرة في شهر', desc: 'حصيلة كلّ أسبوع بمجموع جبري، ترتيب الحصائل، حصيلة الشهر وهل ادّخرت الأسرة، ثم الفرق بين حصيلتين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — فارق التوقيت', desc: 'مستقيم مدرّج للفوارق، ترتيبها، الساعة في كلّ مدينة، فارق بين مدينتين، ثم اتّصال بين طوكيو وواشنطن.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — بين شطّ ملغيغ وقمّة تاهات', desc: 'فرق ارتفاعين موجب وسالب، علوّ الطائرة فوق كلّ منهما، قاع بئر تحت مستوى البحر، ثم ترتيب خمسة ارتفاعات.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — تبليط قاعة القسم', desc: 'رأس رابع لمستطيل في معلم، طولان بطرح فاصلتين أو ترتيبين، المساحة، عدد البلاطات وثمنها، ثم نقطة داخل القسم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — مصعد البرج', desc: 'مجموع جبري لستة حدود، الطوابق التي مرّ بها المصعد، أعلى وأدنى طابق، ثم الفرق بينهما.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — ورقة إجابات سليم', desc: 'أحكم على خمس إجابات وأصحّح الخاطئة منها مع التعليل، ثم نقطة سليم.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'tahlil-wadiya', path: `${LESSON_BASE_PATH}/tahlil-wadiya`, title: 'تحليل الوضعية النهائية للاختبار', desc: 'اقرأ وضعية المخيّم الشتوي، افرز المعطيات، واختر الحسابات وترتيبها قبل أن تحلّها — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'أحلّ وضعية المخيّم الشتوي في خمس مراحل تُقيَّم: ترتيب الصغرى، فارق اليوم، تغيّر الصغرى، مجموع التغيّرات، ثم نقطة اليوم.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 12, difficulty: 4, actionText: 'أحلّ' },
  ],
};
