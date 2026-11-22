/**
 * La carte PROGRESSIVE du درس 3 « إنشاءات هندسية وتطبيقات خاصية طالس » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — la méthode du rayon auxiliaire et sa
 * justification (content/textbook.js › METHOD_RAY, formulées et déclarées), طرائق ص 107 (METHOD_DIVIDE,
 * METHOD_LENGTH), طرائق ص 109 (METHOD_RATIO), les deux points (TWO_POINTS, déclaré), √13 (ROOT13), et les
 * phrases que les modules écrivent (LINES : les explications des questions des modules 1 et 2).
 * Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   core   sept items (notebook) ;
 *   guide  خطأ شائع « عدد العلامات » (module 1, étape 1), خطأ شائع « الجزء والكل » (module 2, étape 1), خلاصة ;
 *          « فتحة المدور » (module 1, étape 3) est la note du nœud « لماذا تتقايس؟ ».
 * Rien de l'إختبار أولي n'est montré ici.
 *
 *            [تقسيم قطعة إلى n قطع]                       m1
 *                       │ لماذا؟
 *                [لماذا تتقايس؟]
 *         خطأ شائع ┌──────┴──────┐ طريقة الكتاب
 *     ⛔ [عدد العلامات]     [ثلاث نقط على مستقيم يشمل B]
 *                                         │ بنسبة معلومة
 *                                  [نقطة بنسبة معلومة]            m2
 *                           خطأ شائع ┌────┴─────┐ وخارجها
 *                       ⛔ [الجزء والكل]   [نقطتان من (AB)]
 *                                                │ طول معلوم
 *                                         [إنشاء طول معلوم]
 *                                                │ غير ناطق
 *                                         [طول غير ناطق]
 *                                                │ نستخلص
 *                                            🎯 [خلاصة]
 */
import { METHOD_RAY, METHOD_DIVIDE, METHOD_LENGTH, METHOD_RATIO, TWO_POINTS, ROOT13, LINES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'taqsim',
  nodes: [
    {
      id: 'taqsim', kind: 'method', lane: 'center', requires: 'taqsim-qitaa', notebook: true,
      title: 'تقسيم قطعة إلى n قطع', subtitle: '$AP_1 = P_1P_2 = P_2P_3$',
      reveals: ['tabrir'],
    },
    {
      id: 'tabrir', kind: 'relationship', lane: 'center', requires: 'tabrir-taqsim', notebook: true,
      title: 'لماذا تتقايس القطع؟', subtitle: '$\\dfrac{AM_k}{AB} = \\dfrac{k}{n}$',
      context: { text: METHOD_RAY.why, note: LINES.opening },
      reveals: ['khata-alamat', 'kitab'],
    },
    {
      // ⛔ خطأ شائع — le distracteur de l'étape 1 du module 1 (deux marques pour trois parts).
      id: 'khata-alamat', kind: 'common_mistake', lane: 'start', requires: 'taqsim-qitaa',
      title: 'كم علامة؟', subtitle: '$n$',
      context: {
        parts: [
          { role: 'wrong', text: LINES.marksWrong },
          { role: 'why', text: LINES.marksWhy },
          { role: 'right', text: LINES.marksRight },
        ],
      },
      reveals: [],
    },
    {
      id: 'kitab', kind: 'method', lane: 'end', requires: 'tariqat-kitab-taqsim', notebook: true,
      title: 'طريقة ثانية', subtitle: '$BM = MN = NA$',
      context: { text: METHOD_DIVIDE.solution[0], note: METHOD_DIVIDE.solution[5] },
      reveals: ['nisba'],
    },
    {
      id: 'nisba', kind: 'method', lane: 'center', requires: 'nuqta-nisba', notebook: true,
      title: 'نقطة بنسبة معلومة', subtitle: '$\\dfrac{MA}{MB} = \\dfrac{AF}{BE}$',
      context: { text: METHOD_RATIO.solution[0], note: METHOD_RATIO.solution[3] },
      reveals: ['khata-nisba', 'nuqtatan'],
    },
    {
      // ⛔ خطأ شائع — le distracteur 3/2 de l'étape 1 du module 2 (MISC-TALIS-NISBA-JUZ-KULL).
      id: 'khata-nisba', kind: 'common_mistake', lane: 'start', requires: 'nuqta-nisba',
      title: 'الجزء والكل', subtitle: '$\\dfrac{3}{5}$',
      context: {
        parts: [
          { role: 'wrong', text: LINES.partWholeWrong },
          { role: 'why', text: LINES.partWholeWhy },
          { role: 'right', text: LINES.partWhole },
        ],
      },
      reveals: [],
    },
    {
      id: 'nuqtatan', kind: 'relationship', lane: 'end', requires: 'nuqtatan', notebook: true,
      title: 'نقطتان من (AB)', subtitle: '$\\dfrac{AN}{AB} = 3$',
      context: { text: TWO_POINTS.lines[0], list: [TWO_POINTS.lines[1], TWO_POINTS.lines[2]], note: TWO_POINTS.example },
      reveals: ['tul'],
    },
    {
      id: 'tul', kind: 'method', lane: 'center', requires: 'insha-tul', notebook: true,
      title: 'إنشاء طول معلوم', subtitle: '$AB = \\dfrac{14}{3}$',
      context: { text: METHOD_LENGTH.solution[0], note: METHOD_LENGTH.why },
      reveals: ['ghayr-natiq'],
    },
    {
      id: 'ghayr-natiq', kind: 'method', lane: 'center', requires: 'tul-ghayr-natiq', notebook: true,
      title: 'طول غير ناطق', subtitle: '$\\dfrac{2\\sqrt{13}}{3}$',
      context: { text: ROOT13.lines[0], note: ROOT13.lines[2] },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la méthode et le quatrième proportionnel, tels que les modules les écrivent.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tul-ghayr-natiq',
      title: 'خلاصة', subtitle: '$\\dfrac{k}{n}$',
      context: { text: METHOD_RAY.why, list: [LINES.length] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'taqsim', to: 'tabrir', label: 'لماذا؟' },
    { from: 'tabrir', to: 'khata-alamat', label: 'خطأ شائع' },
    { from: 'tabrir', to: 'kitab', label: 'طريقة ثانية' },
    { from: 'kitab', to: 'nisba', label: 'بنسبة معلومة' },
    { from: 'nisba', to: 'khata-nisba', label: 'خطأ شائع' },
    { from: 'nisba', to: 'nuqtatan', label: 'وخارجها' },
    { from: 'nuqtatan', to: 'tul', label: 'طول معلوم' },
    { from: 'tul', to: 'ghayr-natiq', label: 'غير ناطق' },
    { from: 'ghayr-natiq', to: 'khulasa', label: 'نستخلص' },
  ],
};
