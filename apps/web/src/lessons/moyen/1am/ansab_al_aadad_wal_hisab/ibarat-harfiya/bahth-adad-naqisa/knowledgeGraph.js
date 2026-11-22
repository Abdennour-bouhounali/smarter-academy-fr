/**
 * La carte PROGRESSIVE du درس « البحث عن أعداد ناقصة » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_FIND`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                         [الحزام المعاكس] (M1)                              مفهوم
 *                 نبحث ┌─────┴─────┐ ونقلب
 *       [العدد الناقص في مجموع] (M1)      [العدد الناقص في فرق] (M1)
 *          خطأ شائع │                      خطأ شائع │ ثم
 *   ⛔ [أجمع مرّة أخرى؟]          ⛔ [أجمع في a − □ ؟]  [العدد الناقص في جداء] (M1)
 *                                                    خطأ شائع │ ونتحقّق
 *                                            ⛔ [أضرب مرّة أخرى؟]  [التحقّق بالتعويض] (M1)
 *                                                          خطأ شائع │ ونسمّي
 *                                                  ⛔ [التقريب يكفي؟]  [المساواة والعدد الناقص] (M2)
 *                                                                            │ بطريقة
 *                                                                   [أجد وأتحقّق] (M3)
 *                                                                            │ نستخلص
 *                                                                       🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_FIND, GUIDE } from './content/textbook';

const mistake = (id, lane, requires, title, subtitle, g, reveals = []) => ({
  id, kind: 'common_mistake', lane, requires, title, subtitle,
  context: { parts: [{ role: 'wrong', text: g.wrong }, { role: 'why', text: g.why }, { role: 'right', text: g.right }] },
  reveals,
});

export const KNOWLEDGE_GRAPH = {
  root: 'masna',
  nodes: [
    {
      id: 'masna', kind: 'concept', lane: 'center', requires: 'naqis-majmu',
      title: 'الحزام المعاكس', subtitle: 'آلة وعدد ناقص',
      context: { text: 'آلة في ورشة تعبئة أخرجت عددًا معلومًا، وعلينا أن نعرف العدد الذي دخل: نُرجع الحزام إلى الوراء بالبطاقة المناسبة.', note: 'ثمّ ندفع الصندوق إلى الأمام لنتحقّق.' },
      reveals: ['majmu', 'farq'],
    },
    {
      id: 'majmu', kind: 'concept', lane: 'start', requires: 'naqis-majmu', notebook: true,
      title: 'العدد الناقص في مجموع', subtitle: '$\\square+9=54$',
      context: { text: KNOWLEDGE.sum.text, note: KNOWLEDGE.hole.definition },
      reveals: ['khataSame'],
    },
    mistake('khataSame', 'start', 'naqis-majmu', 'أجمع مرّة أخرى؟', '$54+9$', GUIDE.same),
    {
      id: 'farq', kind: 'relationship', lane: 'end', requires: 'naqis-farq', notebook: true,
      title: 'العدد الناقص في فرق', subtitle: '$\\square-14=54$ و $80-\\square=54$',
      context: { text: KNOWLEDGE.diff.first, note: KNOWLEDGE.diff.second },
      reveals: ['khataTrap', 'judaa'],
    },
    mistake('khataTrap', 'end', 'naqis-farq', 'أجمع في a − □ ؟', '$80-\\square=54$', GUIDE.trap),
    {
      id: 'judaa', kind: 'concept', lane: 'center', requires: 'naqis-judaa', notebook: true,
      title: 'العدد الناقص في جداء', subtitle: '$6\\times\\square=54$',
      context: { text: KNOWLEDGE.product.text },
      reveals: ['khataDiv', 'tahaqquq'],
    },
    mistake('khataDiv', 'start', 'naqis-judaa', 'أضرب مرّة أخرى؟', '$54\\times 6$', GUIDE.divRev),
    {
      id: 'tahaqquq', kind: 'relationship', lane: 'end', requires: 'tahaqquq', notebook: true,
      title: 'التحقّق بالتعويض', subtitle: '$45+9=54$',
      context: { text: KNOWLEDGE.check.text },
      reveals: ['khataApprox', 'musawat'],
    },
    mistake('khataApprox', 'end', 'tahaqquq', 'التقريب يكفي؟', '$2{,}86\\times 7$', GUIDE.approx),
    {
      id: 'musawat', kind: 'concept', lane: 'center', requires: 'musawat-naqisa', notebook: true,
      title: 'المساواة والعدد الناقص', subtitle: '$\\square=b-a$',
      context: { text: KNOWLEDGE.hole.definition, note: KNOWLEDGE.diff.second },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-naqisa', notebook: true,
      title: 'أجد وأتحقّق', subtitle: '$26{,}5$',
      context: { text: METHOD_FIND.exercise, note: METHOD_FIND.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-naqisa',
      title: 'الخلاصة', subtitle: 'أترجم ، أُرجع ، أتحقّق',
      context: { text: 'العدد الناقص □ هو الذي يُحقّق المساواة ؛ نجده بالعملية العكسية: الطرح للجمع، والجمع للطرح، والقسمة للضرب، وفي a − □ = b نحسب a − b ؛ ونتحقّق دائمًا بالتعويض.', note: 'إذا لم تتوقّف القسمة كتبنا الناتج كسرًا.' },
      reveals: [],
    },
  ],
  edges: [
    { from: 'masna', to: 'majmu', label: 'نبحث' },
    { from: 'masna', to: 'farq', label: 'ونقلب' },
    { from: 'majmu', to: 'khataSame', label: 'خطأ شائع' },
    { from: 'farq', to: 'khataTrap', label: 'خطأ شائع' },
    { from: 'farq', to: 'judaa', label: 'ثم' },
    { from: 'judaa', to: 'khataDiv', label: 'خطأ شائع' },
    { from: 'judaa', to: 'tahaqquq', label: 'ونتحقّق' },
    { from: 'tahaqquq', to: 'khataApprox', label: 'خطأ شائع' },
    { from: 'tahaqquq', to: 'musawat', label: 'ونسمّي' },
    { from: 'musawat', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
