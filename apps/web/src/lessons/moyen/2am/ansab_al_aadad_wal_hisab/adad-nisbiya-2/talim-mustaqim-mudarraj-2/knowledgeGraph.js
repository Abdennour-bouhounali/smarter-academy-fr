/**
 * La carte PROGRESSIVE du درس « التعليم على مستقيم مدرّج » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est
 * écrite ici : chaque texte vient de la leçon (content/textbook.js : معارف, طريقة, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx
 * qui l'établit (`requires`).
 *
 *                               [الفاصلة]                                   مفهوم
 *            قراءة ┌───────────────┼───────────────┐ مبدأ
 *        [قراءة فاصلة] (M1)   [المسافة إلى الصفر]  [تتعلّق بالمبدأ] (M1)
 *     خطأ شائع │                    │                    │ ثم
 *   ⛔ [3 بدل 15؟]            [المتعاكسان]        [اختيار التدريجة] (M1) → [أختار تدريجة] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'faasila-nuqta',
  nodes: [
    {
      id: 'faasila-nuqta', kind: 'concept', lane: 'center', requires: 'faasila',
      title: 'فاصلة نقطة', subtitle: 'عدد التدريجات × قيمة التدريجة',
      context: { text: KNOWLEDGE.abscissa.text },
      reveals: ['qiraa', 'mabda', 'mutaakisan-1'],
    },
    {
      id: 'qiraa', kind: 'relationship', lane: 'start', requires: 'faasila', notebook: true,
      title: 'قراءة فاصلة', subtitle: '$3\\times 10=30$',
      context: { text: KNOWLEDGE.abscissa.text },
      reveals: ['khata-bida'],
    },
    {
      // ⛔ خطأ شائع — les graduations comptées sans leur valeur (أتمرّن ex-4, banque).
      id: 'khata-bida', kind: 'common_mistake', lane: 'start', requires: 'faasila',
      title: 'ثلاث تدريجات تعني الفاصلة 3؟', subtitle: '$3\\times 5=15$',
      context: { parts: [{ role: 'wrong', text: GUIDE.unitIgnored.wrong }, { role: 'why', text: GUIDE.unitIgnored.why }, { role: 'right', text: GUIDE.unitIgnored.right }] },
      reveals: [],
    },
    {
      id: 'mabda', kind: 'relationship', lane: 'end', requires: 'faasila-tataghayyar', notebook: true,
      title: 'الفاصلة تتعلّق بالمبدأ', subtitle: '$30\\to 50$',
      context: { text: KNOWLEDGE.origin.text },
      reveals: [],
    },
    {
      id: 'mutaakisan-1', kind: 'relationship', lane: 'center', requires: 'mutaakisan', notebook: true,
      title: 'فاصلتان متعاكستان', subtitle: '$-30$ و $+30$',
      context: { text: KNOWLEDGE.opposites.text },
      reveals: ['ikhtiyar'],
    },
    {
      id: 'ikhtiyar', kind: 'relationship', lane: 'center', requires: 'ikhtiyar-tadrij', notebook: true,
      title: 'اختيار التدريجة', subtitle: '$150\\div 25=6$',
      context: { text: GUIDE.tooSmall },
      reveals: ['tarif'],
    },
    {
      id: 'tarif', kind: 'term', lane: 'center', requires: 'tarif-faasila', notebook: true,
      title: 'الفاصلة والكتابة A(−3)', subtitle: '$A(-3)$',
      context: { text: KNOWLEDGE.abscissa.text, note: KNOWLEDGE.abscissa.example },
      reveals: ['masafa'],
    },
    {
      id: 'masafa', kind: 'term', lane: 'center', requires: 'masafa-ila-sifr', notebook: true,
      title: 'المسافة إلى الصفر', subtitle: '$|{-7}|=7$',
      context: { text: KNOWLEDGE.distance.text, note: GUIDE.negDistance },
      reveals: ['mutaakisan-node'],
    },
    {
      id: 'mutaakisan-node', kind: 'term', lane: 'center', requires: 'mafhum-mutaakisan', notebook: true,
      title: 'العددان المتعاكسان', subtitle: '$(+3)$ و $(-3)$',
      context: { text: KNOWLEDGE.opposites.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-tadrij', notebook: true,
      title: 'أختار تدريجة وأقرأ بدقّة', subtitle: 'أبعد عدد ثم التحقّق',
      context: { text: METHOD.choose.rule.slice(1).join(' ') },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-tadrij',
      title: 'الخلاصة', subtitle: '$A(-3)$',
      context: { text: KNOWLEDGE.abscissa.text, note: KNOWLEDGE.abscissa.example },
      reveals: [],
    },
  ],
  edges: [
    { from: 'faasila-nuqta', to: 'qiraa', label: 'قراءة' },
    { from: 'faasila-nuqta', to: 'mabda', label: 'مبدأ' },
    { from: 'faasila-nuqta', to: 'mutaakisan-1', label: 'نظير' },
    { from: 'qiraa', to: 'khata-bida', label: 'خطأ شائع' },
    { from: 'mutaakisan-1', to: 'ikhtiyar', label: 'ثم' },
    { from: 'ikhtiyar', to: 'tarif', label: 'نسمّي' },
    { from: 'tarif', to: 'masafa', label: 'ثم' },
    { from: 'masafa', to: 'mutaakisan-node', label: 'ثم' },
    { from: 'mutaakisan-node', to: 'tariqa', label: 'نستعملها' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
