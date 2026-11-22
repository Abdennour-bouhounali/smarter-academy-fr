/**
 * La carte PROGRESSIVE du درس 3 « العلاقات بين النسب المثلثية والإنشاءات الهندسية » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — نشاط 5 (content/textbook.js › ACT5), معارف 4
 * (KNOW4), طرائق ص 121 (METHOD_REL, METHOD_CONSTRUCT), « إن أمكن » (POSSIBLE, déclaré) et les phrases que les modules
 * écrivent (LINES : explications des questions des modules 1 et 3, réutilisées par leurs corrections).
 * Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   core   huit items (notebook) — dont « إن أمكن » porté par un nœud `warning` (A.5) ;
 *   guide  خطأ شائع « مجموع النسبتين » (module 1, étape 3), خطأ شائع « 1 − 0,6 » (module 3, étape 1),
 *          خطأ شائع « العددان على الضلعين » (module 3, étape 4 et le laboratoire), خلاصة.
 * Rien de l'إختبار أولي n'est montré ici.
 *
 *                 [تخمين من الجدول]                         m1
 *                       │ نبرهن
 *                   [البرهان]
 *          خطأ شائع ┌────┴────┐ الخاصية
 *    ⛔ [مجموع النسبتين]       │
 *                            [العلاقتان]                     m2
 *                    مثال ┌───────┴───────┐ الكتابة
 *                 [الزاوية 60°]       [sin²x]
 *                      │ نسبة من نسبة
 *               [نسبة من نسبة]                               m3
 *       خطأ شائع ┌──────┴──────┐ إن أمكن
 *     ⛔ [1 − 0,6]          ⚠ [نسبة ممكنة؟]
 *                                 │ إنشاء
 *                          [إنشاء زاوية]
 *                  خطأ شائع ┌─────┴─────┐ نستخلص
 *                ⛔ [على الضلعين]    🎯 [خلاصة]
 */
import { KNOW4, METHOD_REL, POSSIBLE, LINES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'takhmin',
  nodes: [
    {
      id: 'takhmin', kind: 'idea', lane: 'center', requires: 'takhmin-alaqat', notebook: true,
      title: 'تخمين من الجدول', subtitle: '$0{,}87^2 + 0{,}50^2 = 1{,}0069$',
      reveals: ['burhan'],
    },
    {
      // ⛔ خطأ شائع — le distracteur « cos x + sin x = 1 » de l'étape 3 du module 1 (MISC-MUTH-JAMA-NISAB).
      id: 'khata-jam', kind: 'common_mistake', lane: 'start', requires: 'takhmin-alaqat',
      title: 'مجموع النسبتين', subtitle: '$\\dfrac{4}{5} + \\dfrac{3}{5} = \\dfrac{7}{5}$',
      context: {
        parts: [
          { role: 'wrong', text: LINES.sumWrong },
          { role: 'why', text: LINES.sumWhy },
          { role: 'right', text: LINES.sumRight },
        ],
      },
      reveals: [],
    },
    {
      id: 'burhan', kind: 'relationship', lane: 'end', requires: 'burhan-alaqat', notebook: true,
      title: 'البرهان بفيثاغورس', subtitle: '$BC^2 = AB^2 + AC^2$',
      reveals: ['khata-jam', 'alaqatan'],
    },
    {
      id: 'alaqatan', kind: 'retain', lane: 'center', requires: 'alaqatan', notebook: true,
      title: 'العلاقتان', subtitle: '$\\cos^2 x + \\sin^2 x = 1$',
      context: { text: KNOW4.property, note: KNOW4.correction },
      reveals: ['kitaba', 'mithal'],
    },
    {
      id: 'kitaba', kind: 'term', lane: 'end', requires: 'kitabat-murabba', notebook: true,
      title: 'الكتابة sin²x', subtitle: '$\\sin^2 x = (\\sin x)^2$',
      reveals: [],
    },
    {
      id: 'mithal', kind: 'example', lane: 'start', requires: 'mithal-60', notebook: true,
      title: 'الزاوية 60°', subtitle: '$\\dfrac{1}{4} + \\dfrac{3}{4} = 1$',
      reveals: ['hisab'],
    },
    {
      id: 'hisab', kind: 'method', lane: 'center', requires: 'hisab-nisba', notebook: true,
      title: 'نسبة من نسبة', subtitle: '$\\sin x = 0{,}8$',
      context: { text: METHOD_REL.solution[0], note: METHOD_REL.solution[1] },
      reveals: ['khata-jadhr', 'imkan'],
    },
    {
      // ⛔ خطأ شائع — le distracteur 0,4 de l'étape 1 du module 3 (MISC-MUTH-JADHR-NASI).
      id: 'khata-jadhr', kind: 'common_mistake', lane: 'start', requires: 'hisab-nisba',
      title: 'واحد ناقص النسبة', subtitle: '$0{,}6^2 + 0{,}4^2 = 0{,}52$',
      context: {
        parts: [
          { role: 'wrong', text: LINES.rootWrong },
          { role: 'why', text: LINES.rootWhy },
          { role: 'right', text: LINES.rootRight },
        ],
      },
      reveals: [],
    },
    {
      id: 'imkan', kind: 'warning', lane: 'end', requires: 'shart-imkan', notebook: true,
      title: 'إن أمكن', subtitle: '$0 < \\sin x < 1$',
      context: { text: POSSIBLE.lines[0], note: POSSIBLE.lines[1] },
      reveals: ['insha'],
    },
    {
      id: 'insha', kind: 'method', lane: 'center', requires: 'insha-zawiya', notebook: true,
      title: 'إنشاء زاوية', subtitle: '$\\sin x = \\dfrac{2}{5}$',
      reveals: ['khata-watar', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — le distracteur de l'étape 4 du module 3 et le refus « legs » du laboratoire (MISC-MUTH-INSHA-WATAR).
      id: 'khata-watar', kind: 'common_mistake', lane: 'start', requires: 'insha-zawiya',
      title: 'العددان على الضلعين', subtitle: '$\\tan x = \\dfrac{2}{5}$',
      context: {
        parts: [
          { role: 'wrong', text: LINES.legsWrong },
          { role: 'why', text: LINES.legsWhy },
          { role: 'right', text: LINES.legsRight },
        ],
      },
      reveals: [],
    },
    {
      // 🎯 خلاصة — la règle de construction et la vérification, telles que les modules les écrivent.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'insha-zawiya',
      title: 'خلاصة', subtitle: '$\\tan x = \\dfrac{\\sin x}{\\cos x}$',
      context: { text: LINES.construct, list: [LINES.check] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'takhmin', to: 'burhan', label: 'نبرهن' },
    { from: 'burhan', to: 'khata-jam', label: 'خطأ شائع' },
    { from: 'burhan', to: 'alaqatan', label: 'الخاصية' },
    { from: 'alaqatan', to: 'kitaba', label: 'الكتابة' },
    { from: 'alaqatan', to: 'mithal', label: 'مثال' },
    { from: 'mithal', to: 'hisab', label: 'نسبة من نسبة' },
    { from: 'hisab', to: 'khata-jadhr', label: 'خطأ شائع' },
    { from: 'hisab', to: 'imkan', label: 'إن أمكن' },
    { from: 'imkan', to: 'insha', label: 'إنشاء' },
    { from: 'insha', to: 'khata-watar', label: 'خطأ شائع' },
    { from: 'insha', to: 'khulasa', label: 'نستخلص' },
  ],
};
