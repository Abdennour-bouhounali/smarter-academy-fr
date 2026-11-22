/**
 * La carte PROGRESSIVE du درس « مقارنة عددين ناطقين » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_DIFF`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                   [الإبرة تدلّ على الأكبر] (M1)                                    مفهوم
 *              نبدّل ┌──────────┴──────────┐ ونكتفي
 *   [التبديل يغيّر الجهة] (M1)                  [الفرق وحده يكفي] (M1)
 *        خطأ شائع │                              خطأ شائع │       │ فنصوغ
 *   ⛔ [الأبعد عن الصفر؟]          ⛔ [نطرح البسطين والمقامين؟]     [معنى الترتيب بالفرق] (M2)
 *                                                                │ ثم
 *                                                        [احسب الفرق ثم اكتب] (M2)
 *                                                                │ ونعمّم
 *                                                        [أبسّط A − B] (M3)
 *                                                                │ نستخلص
 *                                                        🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_DIFF, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'ishara',
  nodes: [
    {
      id: 'ishara', kind: 'concept', lane: 'center', requires: 'ishara-farq', notebook: true,
      title: 'الإبرة تدلّ على الأكبر', subtitle: 'جهة الإبرة هي إشارة الفرق',
      context: { text: KNOWLEDGE.side.text },
      reveals: ['ibdal', 'alone'],
    },
    {
      id: 'ibdal', kind: 'relationship', lane: 'start', requires: 'ibdal-mujassayn', notebook: true,
      title: 'التبديل يغيّر الجهة فقط', subtitle: 'a − b و b − a',
      context: { text: KNOWLEDGE.swap.text },
      reveals: ['khataAbs'],
    },
    {
      // ⛔ خطأ شائع — le plus éloigné de zéro prend pour le plus grand (`GUIDE.absFarther`).
      id: 'khataAbs', kind: 'common_mistake', lane: 'start', requires: 'ibdal-mujassayn',
      title: 'الأبعد عن الصفر هو الأكبر؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.absFarther.wrong },
          { role: 'why', text: GUIDE.absFarther.why },
          { role: 'right', text: GUIDE.absFarther.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'alone', kind: 'relationship', lane: 'end', requires: 'farq-wahdahu', notebook: true,
      title: 'الفرق وحده يكفي', subtitle: 'ولو لم نرَ العددين',
      context: { text: KNOWLEDGE.alone.text },
      reveals: ['khataSub', 'maana'],
    },
    {
      // ⛔ خطأ شائع — la différence de deux fractions faite terme à terme (`GUIDE.subTerms`).
      id: 'khataSub', kind: 'common_mistake', lane: 'end', requires: 'farq-wahdahu',
      title: 'نطرح البسطين والمقامين؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.subTerms.wrong },
          { role: 'why', text: GUIDE.subTerms.why },
          { role: 'right', text: GUIDE.subTerms.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'maana', kind: 'relationship', lane: 'center', requires: 'maana-farq', notebook: true,
      title: 'معنى الترتيب بإشارة الفرق', subtitle: 'ثلاث حالات',
      context: { text: KNOWLEDGE.rule.text, note: KNOWLEDGE.example1.text },
      reveals: ['hisab'],
    },
    {
      id: 'hisab', kind: 'method', lane: 'center', requires: 'hisab-farq', notebook: true,
      title: 'احسب الفرق ثم اكتب الاستنتاج', subtitle: 'كسور وأعداد سالبة',
      context: { text: METHOD_DIFF.rule, note: KNOWLEDGE.example2.text },
      reveals: ['ibaratan'],
    },
    {
      id: 'ibaratan', kind: 'method', lane: 'center', requires: 'farq-ibaratayn', notebook: true,
      title: 'أبسّط A − B وأقرأ إشارته', subtitle: 'عبارتان حرفيتان',
      context: { text: KNOWLEDGE.expr.text },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'farq-ibaratayn',
      title: 'الخلاصة', subtitle: 'مقارنة عددين ناطقين',
      context: { text: 'ترتيب عددين تحدّده إشارة فرقهما: $a>b$ معناه $a-b>0$ ؛ نحسب الفرق ونقرأ إشارته، ولعبارتين نبسّط $A-B$ ونقرأ إشارته حسب قيم $x$.', note: KNOWLEDGE.swap.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'ishara', to: 'ibdal', label: 'نبدّل' },
    { from: 'ibdal', to: 'khataAbs', label: 'خطأ شائع' },
    { from: 'ishara', to: 'alone', label: 'ونكتفي' },
    { from: 'alone', to: 'khataSub', label: 'خطأ شائع' },
    { from: 'alone', to: 'maana', label: 'فنصوغ' },
    { from: 'maana', to: 'hisab', label: 'ثم' },
    { from: 'hisab', to: 'ibaratan', label: 'ونعمّم' },
    { from: 'ibaratan', to: 'khulasa', label: 'نستخلص' },
  ],
};
