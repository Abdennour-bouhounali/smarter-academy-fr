/**
 * La carte PROGRESSIVE du درس « التعليم في المستوي » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_PLANE`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                       [مسيّرة الساحة] (M1)                              مفهوم
 *              نقود ┌──────────┴──────────┐ ونقرأ
 *   [الترتيب مهمّ] (M1)             [نقطة على خطّ] (M1)
 *     خطأ شائع │ ثم                       │ خطأ شائع │ ثم
 *  ⛔ [العددان نفسهما؟]            ⛔ [فاصلتها 0؟]   [إحداثيا نقطة] (M1)
 *                                             خطأ شائع │ ثم
 *                                         ⛔ [فوق أم تحت؟]  [الموازيان] (M1)
 *                                                       │ نسمّي
 *                                                  [المعلم المتعامد] (M2)
 *                                                       │ بطريقة
 *                                                  [أعلّم نقطًا] (M3)
 *                                                       │ نستخلص
 *                                                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_PLANE, GUIDE } from './content/textbook';

const mistake = (id, lane, requires, title, subtitle, g, reveals = []) => ({
  id, kind: 'common_mistake', lane, requires, title, subtitle,
  context: { parts: [{ role: 'wrong', text: g.wrong }, { role: 'why', text: g.why }, { role: 'right', text: g.right }] },
  reveals,
});

export const KNOWLEDGE_GRAPH = {
  root: 'saha',
  nodes: [
    {
      id: 'saha', kind: 'concept', lane: 'center', requires: 'tartib-adadayn',
      title: 'مسيّرة الساحة', subtitle: 'السارية هي المبدأ',
      context: { text: 'مسيّرة تصوّر ساحة المدرسة من الأعلى ولا تسير مائلة: تقطع أوّلًا مسافة على الخط الأفقي ثمّ مسافة على الخط الشاقولي.', note: 'ثمّ يصير لكلّ مكان عددان نكتبهما بين قوسين.' },
      reveals: ['tartib', 'muhwar'],
    },
    {
      id: 'tartib', kind: 'concept', lane: 'start', requires: 'tartib-adadayn', notebook: true,
      title: 'الترتيب مهمّ', subtitle: '$(3\\,;\\,-2)$ و $(-2\\,;\\,3)$',
      context: { text: KNOWLEDGE.order.text },
      reveals: ['khataSwap'],
    },
    mistake('khataSwap', 'start', 'tartib-adadayn', 'العددان نفسهما؟', '$(3\\,;\\,-2)$ أم $(-2\\,;\\,3)$ ؟', GUIDE.swapOrder),
    {
      id: 'muhwar', kind: 'relationship', lane: 'end', requires: 'nuqta-ala-muhwar', notebook: true,
      title: 'نقطة على أحد الخطّين', subtitle: '$(4\\,;\\,0)$ و $(0\\,;\\,-3)$',
      context: { text: KNOWLEDGE.onAxis.text },
      reveals: ['khataZero', 'ihdathi'],
    },
    mistake('khataZero', 'end', 'nuqta-ala-muhwar', 'فاصلتها صفر؟', 'محور الفواصل', GUIDE.zeroAxis),
    {
      id: 'ihdathi', kind: 'concept', lane: 'center', requires: 'ihdathiyyan', notebook: true,
      title: 'إحداثيا نقطة', subtitle: '$G(-3\\,;\\,2)$',
      context: { text: KNOWLEDGE.coordinates.definition },
      reveals: ['khataDown', 'muwazi'],
    },
    mistake('khataDown', 'start', 'ihdathiyyan', 'فوق أم تحت؟', 'ترتيب $-2$', GUIDE.signDown),
    {
      id: 'muwazi', kind: 'relationship', lane: 'end', requires: 'muwaziyan', notebook: true,
      title: 'الموازيان للمحورين', subtitle: 'ورق بلا مربّعات',
      context: { text: KNOWLEDGE.parallels.text },
      reveals: ['mualam'],
    },
    {
      id: 'mualam', kind: 'concept', lane: 'center', requires: 'mu-allam-mutaamid', notebook: true,
      title: 'المعلم المتعامد', subtitle: '$O$ ، محور الفواصل ، محور التراتيب',
      context: { text: KNOWLEDGE.frame.definition },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-talim', notebook: true,
      title: 'أعلّم نقطًا', subtitle: '$A(-4\\,;\\,3)$ و $B(4\\,;\\,0)$',
      context: { text: METHOD_PLANE.exercise, note: METHOD_PLANE.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-talim',
      title: 'الخلاصة', subtitle: 'الفاصلة ثمّ الترتيب',
      context: { text: 'المعلم المتعامد مستقيمان مدرّجان متعامدان لهما المبدأ نفسه؛ نعلّم كلّ نقطة بعددين نكتبهما بالترتيب: الفاصلة على محور الفواصل ثمّ الترتيب على محور التراتيب؛ ونقطة المحور الأفقي ترتيبها صفر.', note: 'تبديل العددين يعطي نقطة أخرى.' },
      reveals: [],
    },
  ],
  edges: [
    { from: 'saha', to: 'tartib', label: 'نقود' },
    { from: 'saha', to: 'muhwar', label: 'ونقرأ' },
    { from: 'tartib', to: 'khataSwap', label: 'خطأ شائع' },
    { from: 'muhwar', to: 'khataZero', label: 'خطأ شائع' },
    { from: 'muhwar', to: 'ihdathi', label: 'ثم' },
    { from: 'ihdathi', to: 'khataDown', label: 'خطأ شائع' },
    { from: 'ihdathi', to: 'muwazi', label: 'ثم' },
    { from: 'muwazi', to: 'mualam', label: 'نسمّي' },
    { from: 'mualam', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
