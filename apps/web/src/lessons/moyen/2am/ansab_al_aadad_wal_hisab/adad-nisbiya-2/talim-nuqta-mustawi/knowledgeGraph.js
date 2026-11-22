/**
 * La carte PROGRESSIVE du درس « تعليم نقطة في المستوي » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est
 * écrite ici : chaque texte vient de la leçon (content/textbook.js : معارف, طريقة, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx
 * qui l'établit (`requires`).
 *
 *                               [الإحداثيان]                                 مفهوم
 *             قراءة ┌───────────────┼───────────────┐ المبدأ
 *        [الفاصلة أولًا]       [نقطة على محور]      [تتعلّق بالمبدأ]
 *     خطأ شائع │                    │                    │ ثم
 *   ⛔ [تبديل العددين]         [النظيرة]        [المعلم] → [المناطق] → [الطريقة] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'ihdathiyan-nuqta-node',
  nodes: [
    {
      id: 'ihdathiyan-nuqta-node', kind: 'concept', lane: 'center', requires: 'ihdathiyan',
      title: 'إحداثيا نقطة', subtitle: '$(x\\,;\\,y)$',
      context: { text: KNOWLEDGE.coordinates.text },
      reveals: ['awwalan', 'mabda'],
    },
    {
      id: 'awwalan', kind: 'relationship', lane: 'start', requires: 'ihdathiyan', notebook: true,
      title: 'الفاصلة أولًا', subtitle: '$J(2\\,;\\,1)$',
      context: { text: KNOWLEDGE.coordinates.text },
      reveals: ['tartib-node'],
    },
    {
      id: 'tartib-node', kind: 'relationship', lane: 'start', requires: 'tartib-ihdathiyayn', notebook: true,
      title: 'ترتيب الإحداثيين مهمّ', subtitle: '$(2\\,;\\,1)\\neq(1\\,;\\,2)$',
      context: { text: GUIDE.swap.why },
      reveals: ['khata-tabdil'],
    },
    {
      // ⛔ خطأ شائع — les deux nombres échangés (carnet impossible, bank).
      id: 'khata-tabdil', kind: 'common_mistake', lane: 'start', requires: 'tartib-ihdathiyayn',
      title: 'تبديل العددين: نقطة أخرى', subtitle: '$(2\\,;1)\\neq(1\\,;2)$',
      context: { parts: [{ role: 'wrong', text: GUIDE.swap.wrong }, { role: 'why', text: GUIDE.swap.why }, { role: 'right', text: GUIDE.swap.right }] },
      reveals: [],
    },
    {
      id: 'mabda', kind: 'relationship', lane: 'end', requires: 'ihdathiyat-mabda', notebook: true,
      title: 'الإحداثيات تتعلّق بالمبدأ', subtitle: '$(5\\,;4)\\to(2\\,;1)$',
      context: { text: KNOWLEDGE.origin.text },
      reveals: ['mihwar'],
    },
    {
      id: 'mihwar', kind: 'relationship', lane: 'center', requires: 'nuqta-ala-mihwar', notebook: true,
      title: 'نقطة على أحد المحورين', subtitle: '$(0\\,;\\,-2)$',
      context: { text: KNOWLEDGE.axes.text, note: GUIDE.onAxis },
      reveals: ['nadhira'],
    },
    {
      id: 'nadhira', kind: 'relationship', lane: 'center', requires: 'nadhira-mihwar', notebook: true,
      title: 'نظيرة نقطة بالنسبة إلى محور', subtitle: '$(3\\,;-1)\\to(3\\,;1)$',
      context: { text: KNOWLEDGE.symmetric.text },
      reveals: ['maalam'],
    },
    {
      id: 'maalam', kind: 'term', lane: 'center', requires: 'maalam-mutajanis', notebook: true,
      title: 'المعلم المتعامد والمتجانس', subtitle: '$(Ox)\\perp(Oy)$',
      context: { text: KNOWLEDGE.frame.text, note: GUIDE.units },
      reveals: ['ihdathiyan-node'],
    },
    {
      id: 'ihdathiyan-node', kind: 'term', lane: 'center', requires: 'ihdathiyan-nuqta', notebook: true,
      title: 'الفاصلة والترتيب', subtitle: '$A(-3\\,;\\,2)$',
      context: { text: KNOWLEDGE.coordinates.text, note: KNOWLEDGE.coordinates.example },
      reveals: ['mihwarayn-node'],
    },
    {
      id: 'mihwarayn-node', kind: 'term', lane: 'center', requires: 'mihwarayn', notebook: true,
      title: 'محور الفواصل ومحور التراتيب', subtitle: '$(Ox)\\ ,\\ (Oy)$',
      context: { text: KNOWLEDGE.axes.text },
      reveals: ['manatiq-node'],
    },
    {
      id: 'manatiq-node', kind: 'relationship', lane: 'center', requires: 'manatiq', notebook: true,
      title: 'أربع مناطق وإشارة الإحداثيين', subtitle: '$(\\pm x\\,;\\,\\pm y)$',
      context: { text: KNOWLEDGE.regions.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-wad', notebook: true,
      title: 'أضع نقطة وأجد نظيرتها', subtitle: 'موازيان ثم تقاطع',
      context: { text: METHOD.place.rule.slice(1).join(' ') },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-wad',
      title: 'الخلاصة', subtitle: '$M(x\\,;\\,y)$',
      context: { text: KNOWLEDGE.coordinates.text, note: KNOWLEDGE.coordinates.example },
      reveals: [],
    },
  ],
  edges: [
    { from: 'ihdathiyan-nuqta-node', to: 'awwalan', label: 'قراءة' },
    { from: 'ihdathiyan-nuqta-node', to: 'mabda', label: 'مبدأ' },
    { from: 'mabda', to: 'mihwar', label: 'ثم' },
    { from: 'awwalan', to: 'tartib-node', label: 'ثم' },
    { from: 'tartib-node', to: 'khata-tabdil', label: 'خطأ شائع' },
    { from: 'mihwar', to: 'nadhira', label: 'ثم' },
    { from: 'nadhira', to: 'maalam', label: 'نسمّي' },
    { from: 'maalam', to: 'ihdathiyan-node', label: 'ثم' },
    { from: 'ihdathiyan-node', to: 'mihwarayn-node', label: 'ثم' },
    { from: 'mihwarayn-node', to: 'manatiq-node', label: 'ثم' },
    { from: 'manatiq-node', to: 'tariqa', label: 'نستعملها' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
