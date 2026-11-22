/**
 * La carte PROGRESSIVE du درس « التكبير والتصغير وأثره على المقادير الفضائية » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — la معرفة de la plateforme (content/textbook.js ›
 * KNOW), les méthodes (METHOD_ROOTS, METHOD_IMAGE), les erreurs que le lab et les modules réfutent (MISTAKES). Chaque nœud est
 * gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *          [نشاط 6: ثلاثة أخماس]                          m1
 *                  │ نسمّيه
 *          [التكبير والتصغير بالنسبة k]                    m2
 *     خطأ شائع ┌───┤ أثره على
 *  ⛔ [+1 لكل حرف؟]  [الأطوال والمساحات والحجوم]
 *            خطأ شائع ┌───┤ حالة خاصة
 *     ⛔ [الحجم × k؟]   [مقطع الهرم والمخروط]
 *                              │ نحسب k
 *                       [إيجاد k]                          m3
 *                              │ من المساحات والحجوم
 *                    [من النسبة إلى k]
 *            خطأ شائع ┌───┤ ثم
 *    ⛔ [k = نسبة المساحات؟] [مقادير المجسّم الناتج]
 *                              │ نستخلص
 *                         🎯 [خلاصة]
 */
import { KNOW, METHOD_ROOTS, METHOD_IMAGE, MISTAKES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'tajribi',
  nodes: [
    {
      id: 'tajribi', kind: 'example', lane: 'center', requires: 'takbir-tajribi', notebook: true,
      title: 'نشاط 6: تصغير بالنسبة 3/5', subtitle: '$12{,}96 = \\left(\\tfrac{3}{5}\\right)^3 \\times 60$',
      reveals: ['tarif'],
    },
    {
      id: 'tarif', kind: 'definition', lane: 'center', requires: 'takbir-tarif', notebook: true,
      title: 'التكبير والتصغير', subtitle: '$k > 1$ · $0 < k < 1$',
      reveals: ['jam', 'khassiya'],
    },
    {
      // ⛔ خطأ شائع — le contraste « + 1 cm » du lab (5 × 4 × 3 → 6 × 5 × 4) ; le لماذا est la définition.
      id: 'jam', kind: 'common_mistake', lane: 'start', requires: 'takbir-tarif',
      title: 'إضافة 1 لكل حرف؟', subtitle: '$\\tfrac{6}{5} \\neq \\tfrac{5}{4}$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.plusOne.wrong },
          { role: 'why', text: KNOW.definition },
          { role: 'right', text: MISTAKES.plusOne.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khassiya', kind: 'relationship', lane: 'end', requires: 'takbir-khassiya', notebook: true,
      title: 'الأطوال والمساحات والحجوم', subtitle: '$k$ · $k^2$ · $k^3$',
      reveals: ['hajm', 'maqta'],
    },
    {
      // ⛔ خطأ شائع — la prédiction « × k » que le décompte des cubes réfute ; le لماذا est la propriété.
      id: 'hajm', kind: 'common_mistake', lane: 'start', requires: 'takbir-khassiya',
      title: 'الحجم يُضرب في k؟', subtitle: '$2^3 = 8$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.volumeK.wrong },
          { role: 'why', text: KNOW.property },
          { role: 'right', text: MISTAKES.volumeK.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'maqta', kind: 'relationship', lane: 'center', requires: 'maqta-tasghir', notebook: true,
      title: 'مقطع الهرم والمخروط', subtitle: '$k = \\tfrac{SE}{SA}$',
      reveals: ['tk'],
    },
    {
      id: 'tk', kind: 'method', lane: 'center', requires: 'tariqat-k', notebook: true,
      title: 'إيجاد k من طولين', subtitle: 'الناتج ÷ الأصلي',
      reveals: ['tj'],
    },
    {
      id: 'tj', kind: 'method', lane: 'center', requires: 'tariqat-judhur', notebook: true,
      title: 'من النسبة إلى k', subtitle: '$k^2 = q$ · $k^3 = q$',
      reveals: ['jadhr', 'tm'],
    },
    {
      // ⛔ خطأ شائع — prendre le rapport des aires pour k (MISC-TAKBIR-MISAHA-K à l'envers) ; le لماذا est la méthode.
      id: 'jadhr', kind: 'common_mistake', lane: 'start', requires: 'tariqat-judhur',
      title: 'k هي نسبة المساحات؟', subtitle: '$\\sqrt{\\tfrac{9}{25}} = \\tfrac{3}{5}$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.rootHalf.wrong },
          { role: 'why', text: METHOD_ROOTS.rule },
          { role: 'right', text: MISTAKES.rootHalf.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tm', kind: 'method', lane: 'end', requires: 'tariqat-maqadir', notebook: true,
      title: 'مقادير المجسّم الناتج', subtitle: '$\\mathcal{V}\' = k^3 \\times \\mathcal{V}$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la propriété et la méthode, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-maqadir',
      title: 'خلاصة', subtitle: 'طول · مساحة · حجم',
      context: { text: KNOW.property, note: METHOD_IMAGE.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tajribi', to: 'tarif', label: 'نسمّيه' },
    { from: 'tarif', to: 'jam', label: 'خطأ شائع' },
    { from: 'tarif', to: 'khassiya', label: 'أثره على' },
    { from: 'khassiya', to: 'hajm', label: 'خطأ شائع' },
    { from: 'khassiya', to: 'maqta', label: 'حالة خاصة' },
    { from: 'maqta', to: 'tk', label: 'نحسب k' },
    { from: 'tk', to: 'tj', label: 'من نسبة' },
    { from: 'tj', to: 'jadhr', label: 'خطأ شائع' },
    { from: 'tj', to: 'tm', label: 'ثم' },
    { from: 'tm', to: 'khulasa', label: 'نستخلص' },
  ],
};
