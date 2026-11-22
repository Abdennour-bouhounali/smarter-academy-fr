/**
 * La carte PROGRESSIVE du درس « الأعداد العشرية ونصف المستقيم المدرّج » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_PLACE`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                       [يوم رياضي] (M1)                                 مفهوم
 *              نقسّم ┌─────┴─────┐ ونقرأ
 *     [الوحدة وعشر تدريجات] (M1)      [فاصلة نقطة] (M1)
 *       خطأ شائع │                     │ خطأ شائع │ ثم
 *  ⛔ [تدريجة = وحدة؟]      ⛔ [أقلب الرقمين؟]  [الحصر] (M1)
 *                                          خطأ شائع │ ثم
 *                                  ⛔ [بين تدريجتين = مضبوطة؟]  [مبدأ لا يظهر] (M2)
 *                                                       │ بطريقة
 *                                              [أعلّم وأقرأ] (M3)
 *                                                       │ نستخلص
 *                                                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_PLACE, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'maydan',
  nodes: [
    {
      id: 'maydan', kind: 'concept', lane: 'center', requires: 'tadrij-nisf-mustaqim',
      title: 'يوم رياضي', subtitle: 'شريط لا يظهر إلا مبدؤه',
      context: { text: 'شريط قياس يبدأ من لوح الانطلاق ولا نرى منه إلا المبدأ: لا نغرس علمًا قبل أن نختار الوحدة ونقسّمها.', note: 'ثم تصير كلّ نقطة من الشريط عددًا نقرؤه ونكتبه.' },
      reveals: ['wahda', 'faasila'],
    },
    {
      id: 'wahda', kind: 'concept', lane: 'start', requires: 'tadrij-nisf-mustaqim', notebook: true,
      title: 'الوحدة وعشر تدريجات', subtitle: '$\\frac{1}{10}=0{,}1$',
      context: { text: KNOWLEDGE.halfLine.definition },
      reveals: ['khataTick'],
    },
    {
      // ⛔ خطأ شائع — la graduation PETITE comptée comme une unité entière (`GUIDE.ticksAsUnits`).
      id: 'khataTick', kind: 'common_mistake', lane: 'start', requires: 'tadrij-nisf-mustaqim',
      title: 'تدريجة صغيرة = وحدة؟', subtitle: '$2+\\frac{4}{10}=2{,}4$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.ticksAsUnits.wrong },
          { role: 'why', text: GUIDE.ticksAsUnits.why },
          { role: 'right', text: GUIDE.ticksAsUnits.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'faasila', kind: 'relationship', lane: 'end', requires: 'faasila-nuqta', notebook: true,
      title: 'فاصلة نقطة', subtitle: '$O(0)$ و $A(2{,}4)$',
      context: { text: KNOWLEDGE.abscissa.definition, note: KNOWLEDGE.writings.text },
      reveals: ['khataSwap', 'hasr'],
    },
    {
      // ⛔ خطأ شائع — les deux chiffres lus dans l'ordre inverse (`GUIDE.swapDigits`).
      id: 'khataSwap', kind: 'common_mistake', lane: 'end', requires: 'faasila-nuqta',
      title: 'أقلب الرقمين؟', subtitle: '$A(2{,}4)\\neq A(4{,}2)$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.swapDigits.wrong },
          { role: 'why', text: GUIDE.swapDigits.why },
          { role: 'right', text: GUIDE.swapDigits.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'hasr', kind: 'concept', lane: 'center', requires: 'hasr-faasila', notebook: true,
      title: 'الحصر بين تدريجتين', subtitle: '$2{,}3<C<2{,}4$',
      context: { text: KNOWLEDGE.bounds.text },
      reveals: ['khataBetween', 'mabda'],
    },
    {
      // ⛔ خطأ شائع — une fausse lecture exacte d'un point entre deux graduations (`GUIDE.betweenIsExact`).
      id: 'khataBetween', kind: 'common_mistake', lane: 'start', requires: 'hasr-faasila',
      title: 'بين تدريجتين = مضبوطة؟', subtitle: '$2{,}3<C<2{,}4$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.betweenIsExact.wrong },
          { role: 'why', text: GUIDE.betweenIsExact.why },
          { role: 'right', text: GUIDE.betweenIsExact.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'mabda', kind: 'relationship', lane: 'end', requires: 'mabda-ghayr-zahir', notebook: true,
      title: 'مبدأ لا يظهر', subtitle: 'نقرأ الأعداد المكتوبة',
      context: { text: KNOWLEDGE.hiddenOrigin.text, note: KNOWLEDGE.smallerScale.text },
      reveals: ['khataZero', 'tariqa'],
    },
    {
      // ⛔ خطأ شائع — « la première marque visible est 0 » (`GUIDE.firstMarkIsZero`).
      id: 'khataZero', kind: 'common_mistake', lane: 'end', requires: 'mabda-ghayr-zahir',
      title: 'أوّل علامة ظاهرة = 0؟', subtitle: '$O(0)$ خارج الصورة',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.firstMarkIsZero.wrong },
          { role: 'why', text: GUIDE.firstMarkIsZero.why },
          { role: 'right', text: GUIDE.firstMarkIsZero.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-taalim', notebook: true,
      title: 'أعلّم وأقرأ', subtitle: '$M(2{,}7)$ و $K(3{,}5)$',
      context: { text: METHOD_PLACE.exercise, note: METHOD_PLACE.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-taalim',
      title: 'الخلاصة', subtitle: 'المبدأ ، الوحدة ، الفاصلة',
      context: { text: 'ندرّج نصف المستقيم بمبدأ ووحدة مقسّمة إلى عشرة أجزاء؛ فاصلة النقطة عدد يعيّنها: الوحدات الكاملة ثم التدريجات الصغيرة (كلّ واحدة $0{,}1$)؛ وبين تدريجتين نحصر.', note: 'حتى حين لا يظهر المبدأ نقرأ الأعداد المكتوبة على التدريجات.' },
      reveals: [],
    },
  ],
  edges: [
    { from: 'maydan', to: 'wahda', label: 'نقسّم' },
    { from: 'maydan', to: 'faasila', label: 'ونقرأ' },
    { from: 'wahda', to: 'khataTick', label: 'خطأ شائع' },
    { from: 'faasila', to: 'khataSwap', label: 'خطأ شائع' },
    { from: 'faasila', to: 'hasr', label: 'ثم' },
    { from: 'hasr', to: 'khataBetween', label: 'خطأ شائع' },
    { from: 'hasr', to: 'mabda', label: 'ثم' },
    { from: 'mabda', to: 'khataZero', label: 'خطأ شائع' },
    { from: 'mabda', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
