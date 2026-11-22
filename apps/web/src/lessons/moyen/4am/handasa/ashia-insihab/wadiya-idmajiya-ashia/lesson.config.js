/**
 * أدمج تعلّماتي — الوحدة 11 « الأشعة والانسحاب » (kind: synthesis)
 * Manuel 4AM, unité 11 : « أدمج تعلّماتي » (وضعية « ممر الراجلين » + تحليل الوضعية, p. 136) — extraction.json ›
 * destinations. Ce n'est PAS un cinquième درس.
 *
 * Format (décision du propriétaire, 2026-10-13 ; modèle : unité 1 `wadiya-idmajiya-aadad`) — NEUF modules :
 *   0      أستعدّ
 *   1 à 6  SIX « وضعيات تدريبية » (`content/problems.js`, ajouts de la plateforme de type امتحان)
 *   7      الوضعية وتحليلها (la وضعية du manuel lue dans les trois phases قراءة · تحليل · تنفيذ, avec son lab `bridge-path`)
 *   8      وضعية الاختبار النهائي (`itqan`, BossFinal) — la وضعية TRANSPOSÉE (passerelle sur l'autoroute à Oran)
 * Les QCM et les exercices d'approfondissement du manuel n'entrent pas dans cette séance (extraction.json › notIntegrated).
 *
 * Le parcours, phase par phase :
 *   RÉEL               module 7 — la commune place un passage piéton devant l'école : le plus court trajet du quartier
 *   DÉCOUVRIR          module 7 — le lab : l'élève déplace le passage, lit la longueur du trajet, en essaie plusieurs
 *   MANIPULER          module 7 — UN workspace, le lab `bridge-path` (écrit pour cette leçon) : il porte B sur B′ par la
 *                      translation de vecteur NM (refusée si BB′ ≠ NM), puis redresse la ligne A–M–B′
 *                      (مبتدئ : une passerelle sur la gorge du Rhummel ; متقدم : la وضعية avec l'exemple de l'extraction)
 *   COMPRENDRE         module 7 — étapes 1–3 : ce qui est fixe / variable, la distance entre deux parallèles, la ligne droite
 *   TOUCHER LES MATHS  module 7 — étapes 4–7 : MB′BN متوازي أضلاع, NB = MB′, M sur [AB′], AB′ = √85 par Pythagore
 *   FORMALISER         module 7 — les briques et les trois phases du manuel (قراءة · تحليل · تنفيذ)
 *   TRANSFÉRER         module 8 — la وضعية TRANSPOSÉE (passerelle sur l'autoroute à Oran) en « وضعية الاختبار النهائي »
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/wadiya-idmajiya-ashia';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-ashia',
  kind: 'synthesis',
  unit: 'ashia-insihab',
  unitTitle: 'الأشعة والانسحاب',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — ترييض وضعية هندسية مركبة بتوظيف الأشعة والانسحاب',
  description: 'إدماج المعارف: أقصر مسلك يعبر ممرا للراجلين بين حافتين متوازيتين (الانسحاب، تساوي شعاعين، متوازي الأضلاع، والخط المستقيم) — بالتحليل المنهجي (قراءة · تحليل · تنفيذ)، تسبقها ست وضعيات تدريبية (الانسحاب، متوازي الأضلاع، علاقة شال، منتصف القطرين، أقصر مسلك) وتنتهي بوضعية الاختبار النهائي.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🌉',
  estimatedDurationMin: 35,
  textbookRef: { unit: 11, pages: '136' },
  skills: [
    'تجنيد الانسحاب وتساوي شعاعين ومتوازي الأضلاع وعلاقة شال لحل وضعية مركبة: أقصر مسلك يعبر ممرا عموديا على حافتين متوازيتين',
    'قراءة الوضعية وتحليلها: التعبير عن طول المسلك بـ AM + MN + NB، وتعيين النقط الثابتة والمتغيّرة، ونمذجة المشكلة بشكل',
    'اختيار استراتيجية الحل وتنفيذها: إنشاء B′ صورة B بالانسحاب الذي شعاعه NM، واستعمال متوازي الأضلاع والخط المستقيم لتعيين M و N وحساب أقصر طول',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية: الانسحاب وتساوي شعاعين، متوازي الأضلاع، علاقة شال، منتصفا القطرين، وأقصر مسلك', 'أدمج تعلّماتي: وضعية «ممر الراجلين» وتحليلها في ثلاث مراحل', 'وضعية الاختبار النهائي: جسر للراجلين فوق الطريق السيار بوهران'],
    exclude: ['أي مفهوم جديد', 'ضرب شعاع في عدد حقيقي', 'الأشعة في معلم (الوحدة 12)'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que la وضعية et la وضعية finale mobilisent, diagnostiqué par « أستعدّ » (affirmations de la
  // plateforme) : deux vecteurs égaux, l'image par une translation, AB = DC ⇔ ABCD متوازي أضلاع (l'ordre), Chasles —
  // les dourous 1 à 3 —, la distance entre deux parallèles, l'inégalité triangulaire, Pythagore, la droite des milieux.
  priorKnowledge: ['tasawi-shuaayn', 'sura-insihab', 'mutawazi-tartib', 'alaqat-shal', 'bud-mutawaziyayn', 'mutabayina-muthallathiya', 'fithaghuris', 'mustaqim-muntasafayn'],
  resources: [
    // Modules 1–6 — six وضعيات d'entraînement de type امتحان (content/problems.js), ajouts de la plateforme ;
    // le module 7 lit et analyse la وضعية du manuel, le module 8 est la وضعية الاختبار النهائي.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — زخرفة الجدار بالانسحاب', learningPointIds: ['4am_wadiya-idmajiya-ashia_P3'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — رأس حديقة متوازية الأضلاع وسياجها', learningPointIds: ['4am_wadiya-idmajiya-ashia_P3'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — رحلة الكشافة ومجموع شعاعين', learningPointIds: ['4am_wadiya-idmajiya-ashia_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — مصباح عند منتصف القطرين', learningPointIds: ['4am_wadiya-idmajiya-ashia_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — جسر فوق القناة وأقصر مسلك', learningPointIds: ['4am_wadiya-idmajiya-ashia_P2'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — دعامتا المنحدر ومنتصف قطعة', learningPointIds: ['4am_wadiya-idmajiya-ashia_P3'] },
    { kind: 'situation', code: 'situation-mamar-rajilin', module: 7, title: 'وضعية: ممر الراجلين أمام المدرسة', learningPointIds: ['4am_wadiya-idmajiya-ashia_P1', '4am_wadiya-idmajiya-ashia_P2', '4am_wadiya-idmajiya-ashia_P3'], sourceElementIds: ['situation'] },
    // Module 7 — مبتدئ : une passerelle sur la gorge du Rhummel (nombres de la plateforme, fantôme de NM attaché à B).
    {
      kind: 'manipulation', code: 'bridge-path-rhummel', type: 'bridge-path', module: 7, level: 'beginner',
      title: 'جسر للراجلين فوق وادي الرمال بقسنطينة (مثال من المنصّة)',
      objective: 'أقصر مسلك يعبر ممرا عموديا على حافتين متوازيتين: ننقل B بالانسحاب الذي شعاعه NM إلى B′ ثم تكون M على [AB′]',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'bridge' },
      learningPointIds: ['4am_wadiya-idmajiya-ashia_P2', '4am_wadiya-idmajiya-ashia_P3'],
      sourceElementIds: ['situation'],
    },
    // Module 7 — متقدم : la وضعية du manuel (rue, deux trottoirs, l'école) avec l'exemple chiffré de l'extraction.
    {
      kind: 'manipulation', code: 'bridge-path-mamar', type: 'bridge-path', module: 7, level: 'advanced',
      title: 'وضعية الكتاب: ممر الراجلين بين الحي والمدرسة',
      objective: 'أقصر مسلك يعبر ممرا عموديا على حافتين متوازيتين: ننقل B بالانسحاب الذي شعاعه NM إلى B′ ثم تكون M على [AB′]',
      autonomy: 'وضعية الكتاب: تسعة عشر موضعا للممر بخطوة نصف مربع، ولا شعاع مساعد عند B؛ التلميذ يقارن الأطوال بنفسه، ثم يضع B′ دون اقتراح (يُرفض كل شعاع يختلف عن NM في المنحى أو الاتجاه أو الطول)، ثم يجد الموضع الذي يستقيم فيه المسلك A ثم M ثم B′',
      experience: { type: 'textbook', reason: '', theme: 'crosswalk' },
      learningPointIds: ['4am_wadiya-idmajiya-ashia_P1', '4am_wadiya-idmajiya-ashia_P2', '4am_wadiya-idmajiya-ashia_P3'],
      sourceElementIds: ['situation'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'ثماني عبارات: صحيح أم خاطئ؟ تساوي شعاعين، صورة نقطة بانسحاب، متوازي الأضلاع وترتيب رؤوسه، علاقة شال، المسافة بين مستقيمين متوازيين، أقصر طريق بين نقطتين، خاصية فيثاغورس، ومستقيم المنتصفين.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la وضعية الاختبار النهائي (module 8, toujours ouverte) ; elles
    // comptent dans la complétion, jamais dans la maîtrise — docs/lessons/MASAIL_GENERATION_GUIDE.md, §14 (synthèses).
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — زخرفة الجدار', desc: 'شريط زليج يتكرّر بالانسحاب: شعاعان متساويان ومتوازي أضلاع، ثم علاقة شال وعدد المثلثات التي يتّسع لها الجدار.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ashia_P3'],
      color: 'sky', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — حديقة الحي', desc: 'ثلاثة رؤوس لمتوازي أضلاع: تعيين الرأس الرابع بتساوي شعاعين، ثم محيط السياج وثمنه.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ashia_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — رحلة الكشافة', desc: 'مسار من مقطعين: علاقة شال، ثم المسافة المباشرة وما توفّره العودة المباشرة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ashia_P1'],
      color: 'teal', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — مصباح القاعة', desc: 'قاعة على شكل متوازي أضلاع: برهان أنّ منتصف أحد القطرين منتصف الآخر، ثم طول الكبلات وثمنها.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ashia_P1', '4am_wadiya-idmajiya-ashia_P3'],
      color: 'violet', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — جسر فوق القناة', desc: 'أقصر مسلك يعبر قناة: ننقل B بشعاع الجسر، ثم نحسب الطول والزمن.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ashia_P1', '4am_wadiya-idmajiya-ashia_P2', '4am_wadiya-idmajiya-ashia_P3'],
      color: 'rose', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — منحدر المكتبة', desc: 'دعامتان متساويتان في متوازي أضلاع وانسحاب: منتصف قطعة، ثم الطول والثمن.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-ashia_P1', '4am_wadiya-idmajiya-ashia_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'الوضعية وتحليلها', desc: 'ممر الراجلين أمام المدرسة: قراءة الوضعية، تحويل المسلك بالانسحاب الذي شعاعه NM إلى مسلك له نفس الطول، تعيين M و N وحساب أقصر طول.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-ashia_P1', '4am_wadiya-idmajiya-ashia_P2', '4am_wadiya-idmajiya-ashia_P3'],
      color: 'amber', style: 'featured', estimatedMin: 22, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'وضعية الاختبار النهائي', desc: 'وضعية أخرى: جسر للراجلين فوق الطريق السيار بوهران.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 4, actionText: 'أحلّ' },
  ],
};
