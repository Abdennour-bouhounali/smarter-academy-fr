/**
 * أدمج تعلّماتي — الوحدة 5 « المساويات – المتباينات – المعادلات » (3AM, kind: synthesis) — généré DANS son entrée du catalogue (cycle moyen phase 3, queue #20, priorité du propriétaire,
 * 2026-10-28), sur le modèle des synthèses des unités 1 à 4 (`wadiya-idmajiya-kusur-natiqa`, `wadiya-idmajiya-quwa-nisbiya`). Synthèse de l'unité, affichée après les quatre leçons (ce n'est PAS
 * un cinquième درس). Manuel 3AM, RÉFÉRENCE : أدمج تعلّماتي et وضعية للتقويم p. 84 (`integration` : deux cyclistes ; `evaluation` : sacs de farine et de sucre), تحدّي et opener p. 70 —
 * docs/sources/3am/unit5/extraction.json. Le plan : docs/sources/3am/unit5/plan/wadiya-idmajiya-musawiyat-mutabayinat.md. Aucune notion nouvelle ; aucun labo (le plan envisageait `term-ferry`
 * au module 7 : repli retenu — une synthèse n'a pas de labo, et la solution x = 1/2 est fractionnaire).
 *
 * CONCEPTION (guide §4ter) — format des synthèses précédentes : 0 أستعدّ · 1–6 six « الوضعية التدريبية N » (`track: 'problem'`, content/problems.js) · 7 « تحليل الوضعية » (la poursuite de
 * Tipaza, analysée ET résolue étape par étape, puis trois décisions : ligne d'arrivée, arrondi à la minute, borne de l'écart) · 8 « وضعية الاختبار النهائي » (les deux camions : une AUTRE
 * situation, évaluée). Indépendance du manuel (§4ter-bis) : les cyclistes 50 / 45 km/h deviennent 40 / 36 km/h avec 2 km d'écart, les sacs deviennent des caisses de dattes et des oranges, le
 * تحدّي (15 750 DA) devient la situation 1 (T inconnu, 24 800 DA distribués) ; le manuel n'est cité nulle part à l'élève. DEUX الكفاءات (P1 propriétés et encadrements, P2 modéliser et résoudre),
 * `programmeItems: []`.
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab/wadiya-idmajiya-musawiyat-mutabayinat';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-musawiyat-mutabayinat',
  kind: 'synthesis',
  unit: 'musawiyat-mutabayinat',
  unitTitle: 'المساويات – المتباينات – المعادلات',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — المساويات – المتباينات – المعادلات',
  description: 'ست وضعيات تدريبية تجمع خواص المساويات والمتباينات والحصر والمعادلة من الدرجة الأولى، ثم تحليل ملاحقة في سباق دراجات ووضعية الاختبار النهائي: شاحنتا التمر والبرتقال.',
  level: 'moyen',
  grade: '3am',
  chapter: 'ansab_al_aadad_wal_hisab',
  chapterTitle: 'ميدان الأنشطة العددية',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🚴',
  estimatedDurationMin: 28,
  textbookRef: { unit: 5, pages: '70, 84' },
  skills: ['حل وضعية إدماجية بتوظيف خواص المساويات والمتباينات والحصر ومعادلة من الدرجة الأولى: الترجمة والحلّ والتحقّق ثم القرار'],
  teachingScope: {
    include: ['ست وضعيات تدريبية: مكافأة النجاح، كراريس سلمى، رفّ التوابل، سيارة الأجرة، غرفة التبريد، أعمار العائلة', 'تحليل ملاحقة في سباق دراجات (معادلة، تحقّق، قرار بمتباينة وتدوير)', 'وضعية الاختبار النهائي: شاحنتا التمر والبرتقال (معادلة وحلّها وتحقّق، ثم متباينة وحصر)'],
    exclude: ['أي مفهوم جديد', 'جملة معادلتين', 'جداء معدوم', 'حلّ متراجحة ومجموعة الحلول على مستقيم', 'التدوير إلى رتبة سالبة'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les situations mobilisent, diagnostiqué par « أستعدّ » : une الكفاءة clé de chacune des quatre leçons de l'unité.
  priorKnowledge: ['musawiyat-amaliyat-3am', 'mutabayinat-amaliyat-3am', 'hasr-adad-ushri-3am', 'muadalat-darajat-ula-3am'],
  resources: [
    { kind: 'situation', code: 'situation-mulahaqa-tibaza', module: 7, title: 'وضعية: ملاحقة في سباق تيبازة', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1', '3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'], sourceElementIds: ['integration', 'opener'] },
    { kind: 'situation', code: 'situation-shahinatan', module: 8, title: 'وضعية: شاحنتا التمر والبرتقال', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1', '3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'], sourceElementIds: ['evaluation'] },
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; le module 7 analyse une situation de poursuite, le module 8 évalue les deux camions.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — مكافأة النجاح', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'], sourceElementIds: ['challenge'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — كراريس سلمى', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — رفّ التوابل', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — سيارة الأجرة', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — غرفة التبريد', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — أعمار العائلة', learningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'] },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'سبع عبارات: صحيح أم خاطئ؟ خواص المساويات والمتباينات، والتدوير والحصر، وحلّ معادلة.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant l'analyse (module 7) et la situation évaluée (module 8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — مكافأة النجاح', desc: 'ترجمة توزيع مبلغ بمعادلة، حلّها والتحقّق منها، ثم تدوير النتيجة وحصرها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — كراريس سلمى', desc: 'خواص المساويات: طرح عدد من الطرفين، ثم الضرب، ثم القسمة، ثم التحقّق.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — رفّ التوابل', desc: 'حصر كتلة من قراءة ميزان مدوَّرة، ثم حصر كتلة عدّة علب، ثم قرار.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — سيارة الأجرة', desc: 'ثمن رحلة: قيمة عبارة، فمعادلة لإيجاد المسافة، فشرط بمتباينة، فقرار.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — غرفة التبريد', desc: 'حصر حرارة بالفهرنهايت، ثم مؤشّر يعتمد على الضرب في عدد سالب، ثم الحكم على قول زميل.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — أعمار العائلة', desc: 'معادلة بمجهول في الطرفين، ثم التحقّق، ثم شرط «أقلّ تمامًا» وأصغر عدد صحيح يحقّقه.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'tahlil-wadiya', path: `${LESSON_BASE_PATH}/tahlil-wadiya`, title: 'تحليل الوضعية', desc: 'ملاحقة في سباق دراجات: المجهول والترجمة والمعادلة والتحقّق، ثم قرارات بمتباينة وتدوير.',
      stage: 'practice_lab', teachesLearningPointIds: ['3am_wadiya-idmajiya-musawiyat-mutabayinat_P1', '3am_wadiya-idmajiya-musawiyat-mutabayinat_P2'], color: 'amber', style: 'featured', estimatedMin: 16, difficulty: 3, actionText: 'أحلّل الوضعية' },
    { id: '08', number: 8, slug: 'ahill', path: `${LESSON_BASE_PATH}/ahill`, title: 'وضعية الاختبار النهائي', desc: 'خمس مراحل تُقيَّم: المعادلة، وحلّها، وكتلة الحمولة، وعدد الصناديق الممكن، ثم حصر الحمولة.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 6, difficulty: 4, actionText: 'أحلّ' },
  ],
};
