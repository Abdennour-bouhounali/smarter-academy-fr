/**
 * أدمج تعلّماتي — الوحدة 1 « العمليات على الأعداد الطبيعية والأعداد العشرية » (2AM, kind: synthesis) — généré DANS son entrée du catalogue (cycle moyen phase 3, 2026-10-29), sur le modèle des
 * synthèses de 3AM et de 4AM. Synthèse de l'unité, affichée après les quatre leçons PUBLIÉES (silsila-bidun-aqwas, silsila-bi-aqwas, wasf-silsila-hisab, tawzi-darb-jam-tarh) ; ce n'est PAS un cinquième
 * درس. Manuel 2AM, RÉFÉRENCE : تمهيد p. 6 (`opener` : l'histoire des chiffres → « هل تعلم » du module 0), أدمج تعلّماتي p. 20 (`integration` : un programme de calcul ; `evaluation` : un stock et une
 * trousse), أتعمّق pp. 18–19 (`deep-*`, tous dans la banque) — docs/sources/2am/unit1/extraction.json. Le plan : docs/sources/2am/unit1/plan/wadiya-idmajiya-amaliyat-tabiiya-ushriya.md.
 * Aucune notion nouvelle ; aucun labo.
 *
 * CONCEPTION (guide §4ter) — format des synthèses : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية النهائية للاختبار » (lire et analyser,
 * rien n'est résolu) · 8 « وضعية الاختبار النهائي » (évaluée, cinq épreuves). Indépendance du manuel (§4ter-bis) : le programme de Fahrenheit (déjà pris par la synthèse 3AM de l'unité 1) devient un
 * programme de la distance de l'orage ; la trousse du menuisier devient un atelier de nichoirs avec d'autres nombres ; le manuel n'est cité nulle part à l'élève. Une seule الكفاءة (P1), `programmeItems: []`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-amaliyat-tabiiya-ushriya';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-amaliyat-tabiiya-ushriya',
  kind: 'synthesis',
  unit: 'amaliyat-tabiiya-ushriya',
  unitTitle: 'العمليات على الأعداد الطبيعية والأعداد العشرية',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية',
  description: 'ست وضعيات تدريبية تجمع سلاسل العمليات والأقواس ووصف السلسلة وتوزيع الضرب، ثم وضعية الاختبار النهائي: ورشة بيوت العصافير في نادي البيئة.',
  level: 'moyen',
  grade: '2am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 3,
  masteryThreshold: 0.8,
  emoji: '🧮',
  estimatedDurationMin: 70,
  textbookRef: { unit: 1, pages: '6, 18, 19, 20' },
  skills: ['حل وضعية إدماجية بترجمتها إلى سلاسل عمليات (دون أقواس أو بأقواس أو بخطّ كسر) ووصفها وحسابها، وتوظيف توزيع الضرب على الجمع والطرح لتبسيط الحساب'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: برنامج الرعد، قفّة السوق، معدّل سمير، فاتورة الكهربائي، دكّان الحيّ، ورقة زميلة', 'وضعية الاختبار النهائي: ورشة بيوت العصافير (عدد البيوت الممكنة، ما يبقى، الربح بسلسلة واحدة، قرار الشراء)'],
    exclude: ['أي مفهوم جديد', 'الكسور كعمليات (الوحدة 2)', 'الأعداد النسبية (الوحدة 3)', 'الحروف خارج برنامج «اختر عددًا»', 'كلّ نتيجة وسيطة سالبة'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : les quatre leçons de l'unité.
  priorKnowledge: ['silsila-bidun-aqwas-2am', 'silsila-bi-aqwas-2am', 'wasf-silsila-hisab-2am', 'tawzi-darb-jam-tarh-2am'],
  resources: [
    { kind: 'situation', code: 'situation-nichoirs', module: 7, title: 'وضعية: ورشة بيوت العصافير', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'], sourceElementIds: ['evaluation'] },
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — برنامج الرعد', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'], sourceElementIds: ['integration'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — قفّة السوق', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — معدّل سمير', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — فاتورة الكهربائي', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — دكّان الحيّ', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — ورقة زميلة', learningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'], sourceElementIds: ['deep-40'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ست عبارات: صحيح أم خاطئ؟ الأولوية والأقواس وخطّ الكسر ووصف السلسلة وتوزيع الضرب.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — برنامج الرعد', desc: 'برنامج حساب يقدّر بُعد العاصفة: نطبّقه ونصفه ونعكسه.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — قفّة السوق', desc: 'نترجم مشتريات إلى سلسلة بأقواس ونحسب ما يبقى.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — معدّل سمير', desc: 'معدّل بخطّ كسر، وحجزه على الآلة الحاسبة بالأقواس اللازمة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — فاتورة الكهربائي', desc: 'نكتب فاتورة من وصفها، ونصفها، ونقارن عرضين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — دكّان الحيّ', desc: 'حساب ذهني بتوزيع الضرب على الطرح وعلى الجمع.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — ورقة زميلة', desc: 'نحكم على حسابات زميلة ونصحّح الخاطئ منها، ثم تحدّي الأعداد الأربعة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'tahlil-wadiya', path: `${LESSON_BASE_PATH}/tahlil-wadiya`, title: 'تحليل الوضعية النهائية للاختبار', desc: 'اقرأ وضعية بيوت العصافير، افرز المعطيات، وخطّط لحلّها في ثلاث مراحل — دون حلّها بعد.',
      stage: 'practice_lab', teachesLearningPointIds: ['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'], color: 'amber', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'خمس مراحل تُقيَّم: ما تكفيه كل مادّة، وعدد البيوت، وما يبقى، والربح بسلسلة واحدة، وقرار الشراء.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 12, difficulty: 4, actionText: 'أحلّ' },
  ],
};
