/**
 * أدمج تعلّماتي — الوحدة 14 « الهندسة في الفضاء » (kind: synthesis)
 * Manuel 4AM, unité 14 : le scan (pp. 163–169) n'a pas de « أدمج تعلّماتي » (extraction.json › scope, missingPages) ; la وضعية de synthèse est le تحدّ de la page d'ouverture (p. 163 : le seau en
 * مخروط مبتور — extraction › destinations › challenge → module 7). Tout le reste est un AJOUT DÉCLARÉ de la plateforme
 * (`synthesis_generation`, `prerequisite_diagnostic`, `exam_style_problem`). Ce n'est PAS un cinquième درس.
 *
 * DISPOSITION depuis le 2026-10-13 (décision du propriétaire, modèle : l'unité 1 `wadiya-idmajiya-aadad`) — neuf modules, le format de l'unité 1 et RIEN d'autre :
 *   0       أستعدّ — onze affirmations de la plateforme sur ce que les situations mobilisent
 *   1 à 6   « الوضعية التدريبية N » (`track: 'problem'`, GuidedProblem, content/problems.js) : la mappemonde de la bibliothèque,
 *           la sphère de pierre coupée, la poubelle cylindrique, le château d'eau et son modèle, le قمع d'huile d'olive, la boîte
 *           de deux balles — des AJOUTS DE LA PLATEFORME de type امتحان, chacune avec sa figure dessinée
 *   7       الوضعية وتحليلها — le seau du تحدّ (p. 163), LUE ET RÉSOLUE avec son lab `bucket-fill` (l'ancien module 1)
 *   8       إختبار أولي — le verre de frappé d'Oran, évalué (l'ancien module 4)
 * Les deux modules de QCM et d'approfondissement qui suivaient la وضعية n'entrent pas dans « أدمج تعلّماتي » (décision du propriétaire, 2026-10-13) : ils sont
 * supprimés (remap client `moduleLayoutMigrations.js` + migration Laravel, à la charge du lead) ;
 * le module 7 passe de `trigger` à `practice_lab` (un `trigger` ne peut plus suivre les مسائل : ordre des étapes).
 *
 * Le parcours pédagogique du module 7 (le seau), phase par phase :
 *   RÉEL               un seau d'eau (le تحدّ) : Ø 40 cm au bord, Ø 30 cm au fond, l'eau 7 cm sous le bord
 *   DÉCOUVRIR          le lab : l'élève fait monter l'eau au niveau du dessin, puis cherche le sommet du cône
 *   MANIPULER          UN workspace, le lab `bucket-fill` (écrit pour cette leçon, vraie scène 3D) : l'eau, le sommet S
 *                      descendu sur l'axe jusqu'à ce que les génératrices passent par le bord, la méthode de calcul choisie
 *                      (مبتدئ : un petit seau de plage plein, 3 / 4 / 6 ; متقدم : le تحدّ)
 *   COMPRENDRE         étapes 1–2 : lire le dessin (les cotes empilées), la forme de l'eau (un autre tronc de cône)
 *   TOUCHER LES MATHS  étapes 3–5 : Thalès dans la coupe axiale (SO = 105, ρ = 19), la réduction k = 15/19
 *   FORMALISER         étapes 6–8 : V = V₁ − V₂ = V₁(1 − k³) = 24388π/3 ≈ 25,54 L, la vérification, les briques
 *   TRANSFÉRER         module 8 — un verre de frappé à Oran en « إختبار أولي » (réponses nulle part ailleurs)
 *
 * Toutes les valeurs ci-dessous sont des LITTÉRAUX (lues par scripts/validate-lessons.mjs).
 */
export const LESSON_BASE_PATH = '/courses/moyen/4am/handasa/wadiya-idmajiya-fada';

export const LESSON_CONFIG = {
  id: 'wadiya-idmajiya-fada',
  kind: 'synthesis',
  unit: 'handasa-fada',
  unitTitle: 'الهندسة في الفضاء',
  sequentialUnlock: true,
  title: 'أدمج تعلّماتي — ترييض وضعيات فضائية مركبة بتوظيف المقاطع والحجوم والتكبير والتصغير',
  description: 'إدماج المعارف: ست وضعيات تدريبية فضائية (الكرة والجلة، مقاطع الكرة والأسطوانة، التصغير وأثره على المساحات والحجوم، المخروط وخاصية طالس) ثم تحليل دلو ماء على شكل مخروط مبتور (تحدّي الوحدة) — نكمل المخروط بخاصية طالس في المقطع المحوري، ونحسب حجم الماء كفرق حجمي مخروطين أحدهما تصغير للآخر (k³)، بالتحليل المنهجي (قراءة · تحليل · تنفيذ)، يتبعه اختبار أولي بوضعية أخرى.',
  level: 'moyen',
  grade: '4am',
  chapter: 'handasa',
  chapterTitle: 'ميدان الهندسة',
  passingScore: 4,
  masteryThreshold: 0.8,
  emoji: '🪣',
  estimatedDurationMin: 35,
  textbookRef: { unit: 14, pages: '163' },
  skills: [
    'تجنيد موارد الوحدة (الكرة والجلة، المساحة والحجم، المقاطع المستوية، التكبير والتصغير) لحل وضعية فضائية مركبة: حجم الماء في دلو',
    'قراءة الوضعية وتحليلها: قراءة أبعاد الشكل، نمذجة الماء بمخروط مبتور، والربط بين المخروط الكامل والمخروط المقتطع منه',
    'اختيار استراتيجية الحل وتنفيذها: خاصية طالس في المقطع المحوري، حجم المخروط، نسبة التصغير k وأثرها k³ على الحجوم، ثم التدوير والتحويل إلى اللتر',
  ],
  teachingScope: {
    include: ['ست وضعيات تدريبية: الكرة والجلة، مقطع كرة وأسطوانة، التصغير والحجوم، المخروط وخاصية طالس', 'تحليل الوضعية النهائية: تحدّي الوحدة (الدلو) في ثلاث مراحل', 'وضعية الاختبار النهائي: وضعية أخرى بأعداد أخرى'],
    exclude: ['أي مفهوم جديد', 'صيغة حجم المخروط المبتور كقانون للحفظ (خارج البرنامج)', 'المساحة الجانبية للمخروط'],
  },
  knowledgeMap: true,
  // La carte PROGRESSIVE (knowledgeGraph.js) — KNOWLEDGE_MAP.md, Part A.
  knowledgeMapMode: 'progressive',
  // Ce que les six وضعيات, la وضعية du seau et le إختبار mobilisent, diagnostiqué par « أستعدّ » (affirmations de la
  // plateforme) : la كرة et la جلّة (درس 1), l'aire et le volume (درس 2), les sections d'une sphère, d'un cône et d'une أسطوانة
  // (درس 3), l'effet de k (درس 4), le volume du cône et de l'أسطوانة, Thalès (unité 9) et le litre.
  priorKnowledge: ['kura-julla', 'misaha-kura', 'hajm-julla', 'maqta-kura', 'maqta-mukhrut', 'takbir-k3', 'hajm-makhrut', 'talis', 'litr', 'maqta-ustuwana', 'hajm-ustuwana'],
  resources: [
    // Modules 1–6 — six وضعيات d'entraînement (content/problems.js), ajouts de la plateforme ; le module 7 est la وضعية du تحدّ.
    { kind: 'situation', code: 'wadiya-1', module: 1, title: 'وضعية 1 — الكرة الأرضية في المكتبة: موضع نقط ومساحة وحجم', learningPointIds: ['4am_wadiya-idmajiya-fada_P1'] },
    { kind: 'situation', code: 'wadiya-2', module: 2, title: 'وضعية 2 — الكرة الحجرية: مقطع كرة بمستو ومساحته', learningPointIds: ['4am_wadiya-idmajiya-fada_P1'] },
    { kind: 'situation', code: 'wadiya-3', module: 3, title: 'وضعية 3 — حاوية النفايات: مقاطع أسطوانة وسعتها', learningPointIds: ['4am_wadiya-idmajiya-fada_P1'] },
    { kind: 'situation', code: 'wadiya-4', module: 4, title: 'وضعية 4 — نموذج الخزّان المائي: التصغير وأثره على المساحة والحجم', learningPointIds: ['4am_wadiya-idmajiya-fada_P1'] },
    { kind: 'situation', code: 'wadiya-5', module: 5, title: 'وضعية 5 — القمع وزيت الزيتون: مخروط مصغّر وخاصية طالس', learningPointIds: ['4am_wadiya-idmajiya-fada_P1'] },
    { kind: 'situation', code: 'wadiya-6', module: 6, title: 'وضعية 6 — علبة كرات التنس: كرتان داخل أسطوانة', learningPointIds: ['4am_wadiya-idmajiya-fada_P1'] },
    { kind: 'situation', code: 'situation-dalw', module: 7, title: 'وضعية: حجم الماء في دلو على شكل مخروط مبتور', learningPointIds: ['4am_wadiya-idmajiya-fada_P1', '4am_wadiya-idmajiya-fada_P2', '4am_wadiya-idmajiya-fada_P3'], sourceElementIds: ['challenge'] },
    // Module 7 — مبتدئ : un petit seau de plage plein (nombres de la plateforme : r = 3, R = 4, H = 6 ⇒ SO = 18, k = 3/4, 74π).
    {
      kind: 'manipulation', code: 'bucket-fill-small', type: 'bucket-fill', module: 7, level: 'beginner',
      title: 'دلو رمل صغير ممتلئ (مثال من المنصّة)',
      objective: 'حساب حجم ماء في دلو على شكل مخروط مبتور: نكمل المخروط بخاصية طالس، والمخروط الصغير تصغير للكبير نسبته k، فحجم الماء هو حجم الكبير مضروبا في (1 − k³)',
      autonomy: '',
      experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'beach-bucket' },
      learningPointIds: ['4am_wadiya-idmajiya-fada_P2', '4am_wadiya-idmajiya-fada_P3'],
      sourceElementIds: ['challenge'],
    },
    // Module 7 — متقدم : le تحدّ du manuel (Ø 40 / Ø 30, H = 35, eau sur 28 cm).
    {
      kind: 'manipulation', code: 'bucket-fill-challenge', type: 'bucket-fill', module: 7, level: 'advanced',
      title: 'تحدّي الكتاب: دلو قطراه 40 و 30 سنتيمترا، والماء على بعد 7 سنتيمترات من الحافة',
      objective: 'حساب حجم ماء في دلو على شكل مخروط مبتور: نكمل المخروط بخاصية طالس، والمخروط الصغير تصغير للكبير نسبته k، فحجم الماء هو حجم الكبير مضروبا في (1 − k³)',
      autonomy: 'تحدّي الكتاب بأعداده: مستوى الماء يُقرأ من الشكل (من الحافة لا من القاع)، والرأس S يُبحث عنه على مجال واسع حتى يمرّ الخطّان بحافة الدلو، ثم يختار التلميذ بنفسه طريقة حساب الحجم بين أربع طرائق قبل أن يرى الحجم',
      experience: { type: 'textbook', reason: '', theme: 'beach-bucket' },
      learningPointIds: ['4am_wadiya-idmajiya-fada_P1', '4am_wadiya-idmajiya-fada_P2', '4am_wadiya-idmajiya-fada_P3'],
      sourceElementIds: ['challenge'],
    },
  ],
  modules: [
    { id: '00', number: 0, slug: 'astaidd', path: `${LESSON_BASE_PATH}/astaidd`,
      title: 'أستعدّ', desc: 'إحدى عشرة عبارة: صحيح أم خاطئ؟ الكرة والجلة، مساحة الكرة وحجم الجلة، مقطع كرة ومقطع مخروط ومقطع أسطوانة، أثر التكبير على الحجم، حجم المخروط وحجم الأسطوانة، خاصية طالس، واللتر.',
      stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'أتحقّق من مكتسباتي' },
    // Les وضعيات d'entraînement (track: 'problem') : practice_lab, avant la وضعية du seau (module 7) et le test (8, toujours ouvert). Elles comptent dans la complétion, jamais dans la maîtrise — docs/lessons/MASAIL_GENERATION_GUIDE.md, §14.
    { id: '01', number: 1, slug: 'wadiya-1', path: `${LESSON_BASE_PATH}/wadiya-1`,
      title: 'الوضعية التدريبية 1 — الكرة الأرضية في المكتبة', desc: 'كرة مركزها O ونصف قطرها 9 سنتيمترات: موضع ثلاث نقط بالنسبة إلى الكرة والجلة، ثم مساحة الكرة وحجم الجلة.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-fada_P1'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '02', number: 2, slug: 'wadiya-2', path: `${LESSON_BASE_PATH}/wadiya-2`,
      title: 'الوضعية التدريبية 2 — الكرة الحجرية وقاعدتها', desc: 'كرة من الحجر يقطعها مستوٍ: طبيعة المقطع ونصف قطره بخاصية فيثاغورس، مساحة القاعدة، وبعد المستوي عن المركز.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-fada_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '03', number: 3, slug: 'wadiya-3', path: `${LESSON_BASE_PATH}/wadiya-3`,
      title: 'الوضعية التدريبية 3 — حاوية النفايات', desc: 'أسطوانة نصف قطرها 17 سنتيمترا وارتفاعها 60: مقطع موازٍ للقاعدة وسعتها باللتر، ثم مقطع موازٍ للمحور ومساحته.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-fada_P1'],
      color: 'amber', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '04', number: 4, slug: 'wadiya-4', path: `${LESSON_BASE_PATH}/wadiya-4`,
      title: 'الوضعية التدريبية 4 — نموذج الخزّان المائي', desc: 'خزّان كروي نصف قطره 6 أمتار ونموذجه 15 سنتيمترا: نسبة التصغير، ومساحتان وحجمان.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-fada_P1'],
      color: 'emerald', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '05', number: 5, slug: 'wadiya-5', path: `${LESSON_BASE_PATH}/wadiya-5`,
      title: 'الوضعية التدريبية 5 — القمع وزيت الزيتون', desc: 'قمع مخروطي ارتفاعه 15 سنتيمترا وزيت يبلغ 10: نسبة التصغير، نصف قطر السطح بخاصية طالس، وحجم الزيت.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-fada_P1'],
      color: 'teal', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '06', number: 6, slug: 'wadiya-6', path: `${LESSON_BASE_PATH}/wadiya-6`,
      title: 'الوضعية التدريبية 6 — علبة كرات التنس', desc: 'كرتان نصف قطر كل منهما 3 سنتيمترات في علبة أسطوانية: الحجوم، والفراغ، ونسبة الحجمين.',
      stage: 'practice_lab', track: 'problem', teachesLearningPointIds: ['4am_wadiya-idmajiya-fada_P1'],
      color: 'violet', style: 'featured', estimatedMin: 5, difficulty: 3, actionText: 'أحلّ الوضعية' },
    { id: '07', number: 7, slug: 'al-wadiya', path: `${LESSON_BASE_PATH}/al-wadiya`,
      title: 'الوضعية وتحليلها', desc: 'الدلو المملوء بالماء: قراءة الشكل، شكل الماء، إكمال المخروط بخاصية طالس، نسبة التصغير k، ثم حجم الماء كفرق حجمي مخروطين، باللتر.',
      stage: 'practice_lab', teachesLearningPointIds: ['4am_wadiya-idmajiya-fada_P1', '4am_wadiya-idmajiya-fada_P2', '4am_wadiya-idmajiya-fada_P3'],
      color: 'amber', style: 'featured', estimatedMin: 22, difficulty: 3, actionText: 'أقرأ الوضعية' },
    { id: '08', number: 8, slug: 'itqan', path: `${LESSON_BASE_PATH}/itqan`,
      title: 'إختبار أولي', desc: 'وضعية أخرى: كأس فرابيه على شكل مخروط مبتور في مقهى بوهران.',
      stage: 'evaluation', color: 'slate', style: 'boss', estimatedMin: 7, difficulty: 4, actionText: 'أحلّ' },
  ],
};
