/**
 * La carte PROGRESSIVE du درس 4 « ترييض وقراءة وضعيات إحصائية وتفسير المؤشرات » — KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique n'est écrite ici : chaque texte vient de content/textbook.js. Rien de l'إختبار أولي.
 *
 *   [متوسط مجموعات] ┬ خطأ شائع → ⛔ [متوسط المتوسطين]                                            m1
 *                    └ مثال → [قسمان، معدّل واحد] → يؤدي إلى → [نقارن السلسلة كاملة]
 *     → نقرأ المعطيات → [قراءة مخطط] → ثم → [ترجمة إلى جدول] ─ انتبه إلى → ⚠ [عمود يجمع قناتين]   m2
 *     → نحسب ونقارن → [موقع وتشتت] ─ خطأ شائع → ⛔ [المتوسط وحده] ; → [حذف قيم] → [أقرأ، أحسب…] → 🎯 m3
 */
import { ACTIVITY, MISTAKE_MM, MISTAKE_MEAN_ONLY, COMBINED_BAR, METHOD, COMPARE_RULE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'majmuat',
  nodes: [
    {
      id: 'majmuat', kind: 'relationship', lane: 'center', requires: 'mutawassit-majmuat', notebook: true,
      title: 'متوسط مجموعات', subtitle: 'المتوسط المتوازن',
      reveals: ['qismani'],
    },
    {
      id: 'khata-mm', kind: 'common_mistake', lane: 'end', requires: 'mutawassit-majmuat',
      title: 'متوسط المتوسطين؟', subtitle: 'التكرارات مختلفة',
      context: { parts: [{ role: 'wrong', text: MISTAKE_MM.wrong }, { role: 'why', text: MISTAKE_MM.why }, { role: 'right', text: MISTAKE_MM.right }] },
      reveals: [],
    },
    {
      id: 'qismani', kind: 'example', lane: 'start', requires: 'mutawassit-majmuat',
      title: 'قسمان، معدّل واحد', subtitle: '$\\dfrac{384}{33}$',
      context: { text: ACTIVITY.closing },
      reveals: ['khata-mm', 'kamila'],
    },
    {
      id: 'kamila', kind: 'idea', lane: 'center', requires: 'silsila-kamila', notebook: true,
      title: 'نقارن السلسلة كاملة', subtitle: 'لا مجموعة بمجموعة',
      reveals: ['qiraa'],
    },
    {
      id: 'qiraa', kind: 'method', lane: 'start', requires: 'qiraat-mukhattat', notebook: true,
      title: 'قراءة مخطط بالأعمدة', subtitle: 'المحور · التدريج · العمود',
      reveals: ['amud', 'tarjama'],
    },
    {
      id: 'amud', kind: 'warning', lane: 'end', requires: 'tarjama-jadwal',
      title: 'عمود يجمع قناتين', subtitle: '$1250 - 700 = 550$',
      context: { text: COMBINED_BAR.text },
      reveals: [],
    },
    {
      id: 'tarjama', kind: 'method', lane: 'center', requires: 'tarjama-jadwal', notebook: true,
      title: 'من المخطط إلى الجدول', subtitle: 'تكرار · تواتر · مجمع',
      reveals: ['tashattut'],
    },
    {
      id: 'tashattut', kind: 'relationship', lane: 'center', requires: 'mawqi-tashattut', notebook: true,
      title: 'مؤشر موقع ومؤشر تشتت', subtitle: 'المتوسط · الوسيط · المدى',
      reveals: ['khata-wahid', 'hadhf'],
    },
    {
      id: 'khata-wahid', kind: 'common_mistake', lane: 'end', requires: 'tariqat-qarar',
      title: 'المتوسط وحده؟', subtitle: 'المدى 7 و 2',
      context: { parts: [{ role: 'wrong', text: MISTAKE_MEAN_ONLY.wrong }, { role: 'why', text: MISTAKE_MEAN_ONLY.why }, { role: 'right', text: MISTAKE_MEAN_ONLY.right }] },
      reveals: [],
    },
    {
      id: 'hadhf', kind: 'idea', lane: 'start', requires: 'hadhf-qiyam', notebook: true,
      title: 'حذف قيم', subtitle: '$N = 31$',
      reveals: ['qarar'],
    },
    {
      id: 'qarar', kind: 'method', lane: 'center', requires: 'tariqat-qarar', notebook: true,
      title: 'أقرأ، أحسب، أقارن، أقرّر', subtitle: 'قرار مبرّر',
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-qarar',
      title: 'خلاصة', subtitle: 'موقع + تشتت',
      context: { text: METHOD.rule[0], note: COMPARE_RULE.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'qismani', to: 'khata-mm', label: 'خطأ شائع' },
    { from: 'majmuat', to: 'qismani', label: 'مثال' },
    { from: 'qismani', to: 'kamila', label: 'نستنتج' },
    { from: 'kamila', to: 'qiraa', label: 'نقرأ المعطيات' },
    { from: 'qiraa', to: 'tarjama', label: 'ثم' },
    { from: 'qiraa', to: 'amud', label: 'انتبه إلى' },
    { from: 'tarjama', to: 'tashattut', label: 'نحسب ونقارن' },
    { from: 'tashattut', to: 'khata-wahid', label: 'خطأ شائع' },
    { from: 'tashattut', to: 'hadhf', label: 'قيمة متطرفة' },
    { from: 'hadhf', to: 'qarar', label: 'نرتّب الخطوات' },
    { from: 'qarar', to: 'khulasa', label: 'نستخلص' },
  ],
};
