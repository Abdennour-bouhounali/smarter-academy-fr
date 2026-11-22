/**
 * La carte PROGRESSIVE du درس « مقارنة الأعداد العشرية وترتيبها » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_COMPARE`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                         [حفرة القفز] (M1)                              مفهوم
 *                    نقارن ┌─────┴─────┐ ونتمّ
 *          [رتبةً برتبة] (M1)              [إتمام الأصفار] (M1)
 *       خطأ شائع │                            │ خطأ شائع
 *  ⛔ [العدد الطبيعي بعد الفاصلة؟]        ⛔ [الأطول هو الأكبر؟]
 *                                          │ ثم
 *                               [ترتيب سلسلة] (M1)
 *                                          │ ونكتب
 *                                [الرمزان < و >] (M2)
 *                                          │ بطريقة
 *                               [أقارن وأرتّب] (M3)
 *                                          │ نستخلص
 *                                     🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_COMPARE, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'hufra',
  nodes: [
    {
      id: 'hufra', kind: 'concept', lane: 'center', requires: 'taqarun-rutab',
      title: 'حفرة القفز', subtitle: '4,6 م و 4,35 م',
      context: { text: 'قفزتان تُقاسان بمسطرة: لا نحكم بين 4,6 و 4,35 حتى تفصل المسطرة بينهما.', note: 'كلما دقّ تدريج المسطرة ظهرت الأرقام التي تفصل بين العددين.' },
      reveals: ['rutab', 'asfar'],
    },
    {
      id: 'rutab', kind: 'concept', lane: 'start', requires: 'taqarun-rutab', notebook: true,
      title: 'رتبةً برتبة', subtitle: 'الجزء الصحيح ثم الأعشار …',
      context: { text: KNOWLEDGE.wholeParts.text, note: KNOWLEDGE.rankByRank.text },
      reveals: ['khataNatural'],
    },
    {
      // ⛔ خطأ شائع — les chiffres après la virgule lus comme un entier naturel (`GUIDE.digitsAsNatural`).
      id: 'khataNatural', kind: 'common_mistake', lane: 'start', requires: 'taqarun-rutab',
      title: 'العدد الطبيعي بعد الفاصلة؟', subtitle: '$4{,}35<4{,}6$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.digitsAsNatural.wrong },
          { role: 'why', text: GUIDE.digitsAsNatural.why },
          { role: 'right', text: GUIDE.digitsAsNatural.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'asfar', kind: 'relationship', lane: 'end', requires: 'itmam-asfar', notebook: true,
      title: 'إتمام الأصفار', subtitle: '$4{,}6=4{,}60$',
      context: { text: KNOWLEDGE.zeros.text, note: KNOWLEDGE.trap.text },
      reveals: ['khataLonger', 'silsila'],
    },
    {
      // ⛔ خطأ شائع — « le plus long est le plus grand » (`GUIDE.longerBigger`).
      id: 'khataLonger', kind: 'common_mistake', lane: 'end', requires: 'itmam-asfar',
      title: 'الأطول هو الأكبر؟', subtitle: '$2{,}105<2{,}3$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.longerBigger.wrong },
          { role: 'why', text: GUIDE.longerBigger.why },
          { role: 'right', text: GUIDE.longerBigger.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'silsila', kind: 'concept', lane: 'center', requires: 'tartib-silsila', notebook: true,
      title: 'ترتيب سلسلة', subtitle: 'تصاعدي وتنازلي',
      context: { text: KNOWLEDGE.order.text, note: KNOWLEDGE.order.how },
      reveals: ['ramz'],
    },
    {
      id: 'ramz', kind: 'relationship', lane: 'start', requires: 'ramz-muqarana', notebook: true,
      title: 'الرمزان < و >', subtitle: 'يفتح الرمز نحو الأكبر',
      context: { text: KNOWLEDGE.symbols.definition },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-muqarana', notebook: true,
      title: 'أقارن وأرتّب', subtitle: '23,48 و 23,5',
      context: { text: METHOD_COMPARE.exercise, note: METHOD_COMPARE.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-muqarana',
      title: 'الخلاصة', subtitle: 'الجزء الصحيح ، الرتبة ، الأصفار',
      context: { text: 'الجزء الصحيح أوّلًا ثم الأرقام رتبةً برتبة؛ نتمّ بأصفار غير ضرورية لنقارن عددين طبيعيين؛ ولا يكون العدد الأطول هو الأكبر.', note: KNOWLEDGE.order.how },
      reveals: [],
    },
  ],
  edges: [
    { from: 'hufra', to: 'rutab', label: 'نقارن' },
    { from: 'hufra', to: 'asfar', label: 'ونتمّ' },
    { from: 'rutab', to: 'khataNatural', label: 'خطأ شائع' },
    { from: 'asfar', to: 'khataLonger', label: 'خطأ شائع' },
    { from: 'asfar', to: 'silsila', label: 'ثم' },
    { from: 'silsila', to: 'ramz', label: 'ونكتب' },
    { from: 'ramz', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
