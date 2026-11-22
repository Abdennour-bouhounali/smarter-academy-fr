/**
 * La carte PROGRESSIVE du درس « الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — معارف 3 (KNOW3), le rappel du درس 1 et les étapes de preuve (KNOW2_REMINDER, PROOF_STEPS), les طرائق (METHOD_IMAGE,
 * METHOD_EQUAL) et les deux erreurs que la leçon explique (MISTAKES : l'ordre des lettres du milieu, l'ordre des sommets).
 * Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *                 [منتصف مشترك]                         m1
 *                       │ حالة خاصة
 *              [المنتصف وتساوي شعاعين]                  m2
 *        خطأ شائع ┌─────┴─────┐ بالقطرين
 *        ⛔ [AI = BI؟]   [متوازي الأضلاع]               m2
 *                    نبني به ┌──┴──┐ انتبه إلى
 *                 [صورة نقطة]   ⚠ [ترتيب الرؤوس]         m3 / m2
 *              مثال ┌──┴──┐ نبرهن بـ
 *            [D نظيرة A]  [إثبات تساوي شعاعين]          m3
 *                                 │ نستخلص
 *                             🎯 [خلاصة]
 */
import { KNOW3, KNOW2_REMINDER, PROOF_STEPS, METHOD_IMAGE, METHOD_EQUAL, MISTAKES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'mushtarak',
  nodes: [
    {
      id: 'mushtarak', kind: 'relationship', lane: 'center', requires: 'muntasaf-mushtarak', notebook: true,
      title: 'منتصف مشترك', subtitle: '$\\overrightarrow{AB} = \\overrightarrow{CD}$',
      reveals: ['muntasaf'],
    },
    {
      id: 'muntasaf', kind: 'relationship', lane: 'center', requires: 'muntasaf-shuaa', notebook: true,
      title: 'المنتصف وتساوي شعاعين', subtitle: '$\\overrightarrow{AI} = \\overrightarrow{IB}$',
      reveals: ['khata', 'mutawazi'],
    },
    {
      // ⛔ خطأ شائع — l'ordre des lettres (le lab : AI et BI au milieu ; معارف 3, le distracteur de M2).
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'muntasaf-shuaa',
      title: 'AI = BI؟', subtitle: '$\\overrightarrow{AI} \\neq \\overrightarrow{BI}$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.midpoint.wrong },
          { role: 'why', text: MISTAKES.midpoint.why },
          { role: 'right', text: MISTAKES.midpoint.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'mutawazi', kind: 'relationship', lane: 'end', requires: 'mutawazi-shuaa', notebook: true,
      title: 'متوازي الأضلاع', subtitle: '$\\overrightarrow{AB} = \\overrightarrow{DC}$',
      reveals: ['tartib', 'surat'],
    },
    {
      // ⚠ انتبه — l'ordre des sommets (la banderole croisée).
      id: 'tartib', kind: 'warning', lane: 'end', requires: 'mutawazi-shuaa',
      title: 'ترتيب الرؤوس', subtitle: 'ABDC',
      context: { text: MISTAKES.order.text, note: MISTAKES.order.note },
      reveals: [],
    },
    {
      id: 'surat', kind: 'method', lane: 'center', requires: 'surat-nuqta', notebook: true,
      title: 'صورة نقطة بانسحاب', subtitle: '$\\overrightarrow{CD} = \\overrightarrow{AB}$',
      reveals: ['mithal', 'ithbat'],
    },
    {
      id: 'mithal', kind: 'example', lane: 'start', requires: 'surat-nuqta',
      title: 'D نظيرة A', subtitle: 'ACDB',
      context: { text: METHOD_IMAGE.solution[3], note: METHOD_IMAGE.note },
      reveals: [],
    },
    {
      id: 'ithbat', kind: 'method', lane: 'end', requires: 'ithbat-tasawi', notebook: true,
      title: 'إثبات تساوي شعاعين', subtitle: '$\\overrightarrow{OD} = \\overrightarrow{BC}$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la règle de la طريقة, puis le milieu (معارف 3) et le متوازي أضلاع (rappel du درس 1).
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'ithbat-tasawi',
      title: 'خلاصة', subtitle: 'متوازي أضلاع · منتصف',
      context: { text: METHOD_EQUAL.rule, list: [KNOW3.property[1], KNOW2_REMINDER.remark], note: PROOF_STEPS.lines[0] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'mushtarak', to: 'muntasaf', label: 'حالة خاصة' },
    { from: 'muntasaf', to: 'khata', label: 'خطأ شائع' },
    { from: 'muntasaf', to: 'mutawazi', label: 'بالقطرين' },
    { from: 'mutawazi', to: 'tartib', label: 'انتبه إلى' },
    { from: 'mutawazi', to: 'surat', label: 'نبني به' },
    { from: 'surat', to: 'mithal', label: 'مثال' },
    { from: 'surat', to: 'ithbat', label: 'نبرهن بـ' },
    { from: 'ithbat', to: 'khulasa', label: 'نستخلص' },
  ],
};
