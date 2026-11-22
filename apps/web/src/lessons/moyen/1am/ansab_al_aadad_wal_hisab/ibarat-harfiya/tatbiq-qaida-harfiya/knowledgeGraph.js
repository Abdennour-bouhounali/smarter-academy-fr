/**
 * La carte PROGRESSIVE du درس « تطبيق قاعدة حرفية » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_APPLY`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                              [قرص الحروف] (M1)                                  مفهوم
 *                    نضع ┌──────┴──────┐ ونحسب
 *        [القيمة في كلّ موضع] (M1)        [الأقواس والأولويات] (M1)
 *       خطأ شائع │   │ خطأ شائع             خطأ شائع │ ثم
 *  ⛔ [نكتبها بجانبه؟] ⛔ [موضع واحد؟]      ⛔ [الضرب أوّلًا؟]   [المثال المضادّ] (M1)
 *                                                      خطأ شائع │ ونسمّي
 *                                              ⛔ [مثال صحيح يكفي؟]  [العبارة والاصطلاح] (M2)
 *                                                                │ بطريقة
 *                                                       [أطبّق قاعدة] (M3)
 *                                                                │ نستخلص
 *                                                           🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_APPLY, GUIDE } from './content/textbook';

const mistake = (id, lane, requires, title, subtitle, g, reveals = []) => ({
  id, kind: 'common_mistake', lane, requires, title, subtitle,
  context: { parts: [{ role: 'wrong', text: g.wrong }, { role: 'why', text: g.why }, { role: 'right', text: g.right }] },
  reveals,
});

export const KNOWLEDGE_GRAPH = {
  root: 'dial',
  nodes: [
    {
      id: 'dial', kind: 'concept', lane: 'center', requires: 'qaida-tatbiq', notebook: true,
      title: 'قرص الحروف', subtitle: 'قيمة وبطاقة',
      context: { text: 'في مكتبة تصوير قاعدة سعر مكتوبة بحرف: ندير القرص فتنزل قيمته مكان الحرف وتحسب البطاقة.', note: 'والقيمة تنزل في كلّ موضع فيه الحرف.' },
      reveals: ['mawdi', 'awla'],
    },
    {
      id: 'mawdi', kind: 'concept', lane: 'start', requires: 'kull-mawdi', notebook: true,
      title: 'القيمة في كلّ موضع', subtitle: '$5\\times n+20-n$',
      context: { text: KNOWLEDGE.apply.text },
      reveals: ['khataGlued'],
    },
    mistake('khataGlued', 'start', 'qaida-tatbiq', 'أكتب القيمة بجانب العدد؟', '$5$ و $12$', GUIDE.glued),
    {
      id: 'awla', kind: 'relationship', lane: 'end', requires: 'awlawiya-qaida', notebook: true,
      title: 'الأقواس والأولويات', subtitle: '$2\\times(a+b)$',
      context: { text: 'ما بين القوسين أوّلًا، ثمّ الضرب، ثمّ الجمع والطرح.', note: KNOWLEDGE.rule.definition },
      reveals: ['khataOrder', 'mudad'],
    },
    mistake('khataOrder', 'end', 'awlawiya-qaida', 'أبدأ بالضرب؟', '$2\\times 15+8$', GUIDE.order),
    {
      id: 'mudad', kind: 'concept', lane: 'center', requires: 'mithal-mudad', notebook: true,
      title: 'المثال المضادّ', subtitle: '$3+4\\neq 3\\times 4$',
      context: { text: KNOWLEDGE.counter.text },
      reveals: ['khataMany', 'ibara'],
    },
    mistake('khataMany', 'start', 'mithal-mudad', 'مثال صحيح يكفي؟', '$2+2=2\\times 2$', GUIDE.many),
    {
      id: 'ibara', kind: 'concept', lane: 'end', requires: 'ibara-harfiya', notebook: true,
      title: 'العبارة والاصطلاح', subtitle: '$2x=2\\times x$',
      context: { text: KNOWLEDGE.conv.text, note: KNOWLEDGE.convNum.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-tatbiq', notebook: true,
      title: 'أطبّق قاعدة', subtitle: '$13$',
      context: { text: METHOD_APPLY.exercise, note: METHOD_APPLY.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-tatbiq',
      title: 'الخلاصة', subtitle: 'أضع ، أحسب ، أختبر',
      context: { text: 'نطبّق قاعدة حرفية بوضع قيمة كلّ حرف في كلّ موضع يظهر فيه ثمّ الحساب بالأولويات ؛ ونحذف إشارة الضرب بين عدد وحرف لا بين عددين ؛ ويكفي مثال مضادّ واحد لإسقاط قاعدة تدّعي الصحّة دائمًا.', note: 'الأمثلة الصحيحة لا تثبت صحّة القاعدة.' },
      reveals: [],
    },
  ],
  edges: [
    { from: 'dial', to: 'mawdi', label: 'نضع' },
    { from: 'dial', to: 'awla', label: 'ونحسب' },
    { from: 'mawdi', to: 'khataGlued', label: 'خطأ شائع' },
    { from: 'awla', to: 'khataOrder', label: 'خطأ شائع' },
    { from: 'awla', to: 'mudad', label: 'ثم' },
    { from: 'mudad', to: 'khataMany', label: 'خطأ شائع' },
    { from: 'mudad', to: 'ibara', label: 'ونسمّي' },
    { from: 'ibara', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
