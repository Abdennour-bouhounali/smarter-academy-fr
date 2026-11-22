/**
 * أدمج تعلّماتي — الوحدة 3 « القوى ذات أسس نسبية صحيحة » (3AM, kind: synthesis) — généré DANS son entrée du catalogue (cycle moyen phase 3, Phase A, priorité du propriétaire,
 * 2026-10-28), sur le modèle de la synthèse de l'unité 2 (`wadiya-idmajiya-kusur-natiqa`). Synthèse de l'unité, affichée après les quatre leçons (ce n'est PAS un cinquième درس). Manuel 3AM,
 * RÉFÉRENCE : أدمج تعلّماتي et وضعية للتقويم p. 52, أوظّف تكنولوجيات الإعلام والاتصال p. 53 — docs/sources/3am/unit3/extraction.json. Le plan :
 * docs/sources/3am/unit3/plan/wadiya-idmajiya-quwa-nisbiya.md. Aucune notion nouvelle ; aucun labo.
 *
 * CONCEPTION (guide §4ter) — format des synthèses de l'unité 1 / 2 : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية النهائية للاختبار »
 * (lire et analyser, rien n'est résolu) · 8 « وضعية الاختبار النهائي » (évaluée). Indépendance du manuel (§4ter-bis) : la molécule de CO₂ du manuel devient une feuille d'or (atome de 288 pm,
 * épaisseur 0,1 µm), les globules rouges et l'échiquier de l'ICT sont réécrits avec d'autres nombres ; le manuel n'est cité nulle part à l'élève. Une seule الكفاءة (P1), comme les synthèses
 * des unités 1 et 2, `programmeItems: []`. La carte de l'unité garde le texte du تحدّ du manuel jusqu'à la décision du propriétaire (plan § 10, question 1).
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-quwa-nisbiya';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-quwa-nisbiya',
  kind: 'synthesis',
  unit: 'quwa-nisbiya',
  unitTitle: 'القوى ذات أسس نسبية صحيحة',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة',
  description: 'ست وضعيات تدريبية تجمع قوى العدد 10 وقواعدها والكتابة العلمية ورتبة القدر وقوة عدد نسبي، ثم وضعية الاختبار النهائي: رقاقة الذهب وذرّاتها.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🧩',
  estimatedDurationMin: 30,
  textbookRef: { unit: 3, pages: '52, 53' },
  skills: ['حل وضعية إدماجية بتوظيف قوى العدد 10 وقواعدها والكتابة العلمية ورتبة القدر وقوة عدد نسبي وأولوية العمليات'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: رقعة القمح، بكتيريا المخبر، دفتر سلمى، الكريات الحمراء، ثلاثة أعداد، الجزائر بالأرقام', 'وضعية الاختبار النهائي: رقاقة الذهب (تحويل pm وµm إلى المتر، قسمة بالكتابة العلمية، رتبة القدر والحصر)'],
    exclude: ['أي مفهوم جديد', 'نظرية فيثاغورس', 'خاصية طالس', 'الجذر التربيعي', 'الكسور خارج ما ورد في الوحدة 2'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : une الكفاءة clé de chacune des quatre leçons de l'unité.
  priorKnowledge: ['ashara-salib', 'hasil-quwa-ashara', 'kitaba-ilmiya', 'rutbat-qadr', 'ishara-quwa', 'awlawiya-quwa'],
  resources: [
    { kind: 'situation', code: 'situation-raqaqat-dhahab', module: 7, title: 'وضعية: رقاقة الذهب', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'], sourceElementIds: ['integration'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; le module 7 analyse la situation évaluée au module 8.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — رقعة القمح', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'], sourceElementIds: ['ict'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — بكتيريا المخبر', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — دفتر سلمى', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — الكريات الحمراء', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'], sourceElementIds: ['evaluation'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — ثلاثة أعداد', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — الجزائر بالأرقام', learningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ قوى العدد 10 وقواعدها والكتابة العلمية ورتبة القدر وقوة عدد نسبي.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — رقعة القمح', desc: 'حبّات القمح في خانات رقعة شطرنج: قوى العدد 2، رتبة القدر، ثم كتلة القمح بالكيلوغرام بالكتابة العلمية.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — بكتيريا المخبر', desc: 'تضاعف عشري كل ساعة: العدد بعد 5 ساعات وبعد h ساعة، وأوّل ساعة نبلغ فيها مليون مليون بكتيريا.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — دفتر سلمى', desc: 'أحكم على ستة سطور وأصحّح الخاطئة منها مع التعليل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — الكريات الحمراء', desc: 'حجم الدم بـ mm³، عدد الكريات الحمراء، ارتفاع عمودها بالمتر ثم رتبة قدره بالكيلومتر.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — ثلاثة أعداد', desc: 'قيمة A وكتابته العلمية، وB قوة للعدد 10، وقيمة C، ثم المقارنة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — الجزائر بالأرقام', desc: 'مساحة الجزائر وعدد سكانها بالكتابة العلمية، وتحويل km² إلى m²، ثم رتبة قدر مساحة كل ساكن.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'tahlil-wadiya', path: `${LESSON_BASE_PATH}/tahlil-wadiya`, title: 'تحليل الوضعية النهائية للاختبار', desc: 'اقرأ وضعية رقاقة الذهب، افرز المعطيات، واختر الحسابات وترتيبها في ثلاث مراحل — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_wadiya-idmajiya-quwa-nisbiya_P1'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'خمس مراحل تُقيَّم: قطر الذرّة، وسُمك الرقيقة، وعدد الطبقات، ورتبة قدرها، ثم الذرّات المتجاورة على ميلّيمتر.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 12, difficulty: 4, actionText: 'أحلّ' },
  ],
};
