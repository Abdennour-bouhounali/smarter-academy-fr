/**
 * La carte PROGRESSIVE du درس « الأعداد النسبية وسياقات استعمالها » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_READ`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                       [أسبوع في الجلفة] (M1)                            مفهوم
 *              نقرأ ┌─────┴─────┐ ونقارن
 *     [أعداد تحت الصفر] (M1)        [الإشارة والمسافة] (M1)
 *       خطأ شائع │                     │ خطأ شائع │ ثم
 *  ⛔ [الأكبر هو الأبرد؟]      ⛔ [مسافة سالبة؟]  [العددان المتعاكسان] (M1)
 *                                          خطأ شائع │ ثم
 *                                  ⛔ [المعاكس هو العدد نفسه؟]  [العدد النسبي] (M2)
 *                                                       │ بطريقة
 *                                              [أقرأ وأكتب] (M3)
 *                                                       │ نستخلص
 *                                                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_READ, GUIDE } from './content/textbook';

const mistake = (id, lane, requires, title, subtitle, g, reveals = []) => ({
  id, kind: 'common_mistake', lane, requires, title, subtitle,
  context: { parts: [{ role: 'wrong', text: g.wrong }, { role: 'why', text: g.why }, { role: 'right', text: g.right }] },
  reveals,
});

export const KNOWLEDGE_GRAPH = {
  root: 'jaw',
  nodes: [
    {
      id: 'jaw', kind: 'concept', lane: 'center', requires: 'sayaqat-salib',
      title: 'أسبوع في الجلفة', subtitle: 'قراءات المحرار',
      context: { text: 'كلّ صباح تُقرأ درجة الحرارة بالكلمات، وعلى الجهاز لا يظهر إلا الصفر: ما فوقه شيء وما تحته شيء آخر.', note: 'ثمّ تصير كلّ قراءة عددًا نكتبه ونقارنه.' },
      reveals: ['salib', 'ishara'],
    },
    {
      id: 'salib', kind: 'concept', lane: 'start', requires: 'sayaqat-salib', notebook: true,
      title: 'أعداد تحت الصفر', subtitle: '$-3<0<3$',
      context: { text: KNOWLEDGE.contexts.text, note: KNOWLEDGE.need.text },
      reveals: ['khataBig'],
    },
    mistake('khataBig', 'start', 'sayaqat-salib', 'الأكبر هو الأبرد؟', '$-3<5$', GUIDE.biggestColdest),
    {
      id: 'ishara', kind: 'relationship', lane: 'end', requires: 'ishara-masafa', notebook: true,
      title: 'الإشارة والمسافة', subtitle: '$-3$ و $3$',
      context: { text: KNOWLEDGE.signDistance.text },
      reveals: ['khataDist', 'mutaakis'],
    },
    mistake('khataDist', 'end', 'ishara-masafa', 'مسافة سالبة؟', '$-3\\to 3$', GUIDE.negDistance),
    {
      id: 'mutaakis', kind: 'concept', lane: 'center', requires: 'adad-mutaakisan', notebook: true,
      title: 'العددان المتعاكسان', subtitle: '$4$ و $-4$',
      context: { text: KNOWLEDGE.opposites.definition },
      reveals: ['khataOpp', 'nisbi'],
    },
    mistake('khataOpp', 'start', 'adad-mutaakisan', 'المعاكس هو نفسه؟', '$-4\\to 4$', GUIDE.oppSame),
    {
      id: 'nisbi', kind: 'relationship', lane: 'end', requires: 'adad-nisbi', notebook: true,
      title: 'العدد النسبي', subtitle: 'موجب وسالب والصفر',
      context: { text: KNOWLEDGE.relative.definition, note: KNOWLEDGE.zero.text },
      reveals: ['khataZero', 'tariqa'],
    },
    mistake('khataZero', 'end', 'adad-nisbi', 'الصفر لا معاكس له؟', '$0\\to 0$', GUIDE.zeroNone),
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'qiraat-adad-nisbi', notebook: true,
      title: 'أقرأ وأكتب', subtitle: '$3$ و $-4$ و $4$',
      context: { text: METHOD_READ.exercise, note: METHOD_READ.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'qiraat-adad-nisbi',
      title: 'الخلاصة', subtitle: 'الإشارة ، المسافة ، المعاكس',
      context: { text: 'العدد النسبي موجب أو سالب: فوق الصفر بلا إشارة وتحته بإشارة −؛ مسافته إلى الصفر عدد موجب دائمًا؛ ومعاكسه له المسافة نفسها على الجهة الأخرى، والصفر معاكس نفسه.', note: 'الأبرد هو الأصغر عددًا، لا الأكبر.' },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jaw', to: 'salib', label: 'نقرأ' },
    { from: 'jaw', to: 'ishara', label: 'ونقارن' },
    { from: 'salib', to: 'khataBig', label: 'خطأ شائع' },
    { from: 'ishara', to: 'khataDist', label: 'خطأ شائع' },
    { from: 'ishara', to: 'mutaakis', label: 'ثم' },
    { from: 'mutaakis', to: 'khataOpp', label: 'خطأ شائع' },
    { from: 'mutaakis', to: 'nisbi', label: 'ثم' },
    { from: 'nisbi', to: 'khataZero', label: 'خطأ شائع' },
    { from: 'nisbi', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
