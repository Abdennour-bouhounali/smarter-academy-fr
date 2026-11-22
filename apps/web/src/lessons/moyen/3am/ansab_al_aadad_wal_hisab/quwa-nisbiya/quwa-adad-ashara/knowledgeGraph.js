/**
 * La carte PROGRESSIVE du درس « قوى العدد 10 » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte
 * vient de la leçon (content/textbook.js : معارف 1–2 réécrits, la طريقة et le مفكوك, les phrases de correction partagées `GUIDE`). Chaque nœud est
 * gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                               [10ⁿ] (M1)                                   مفهوم
 *                    عدد الأصفار ┌──────────┴──────────┐ خطأ شائع
 *                        [n zéros] (M1)         ⛔ [10³ = 30 ؟]
 *             خطأ شائع │ ثم │
 *   ⛔ [عدد الأرقام؟]   [الأس صفر] (M1) → [الأس السالب] (M1)
 *                                         خطأ شائع │ │ ثم
 *                         ⛔ [10⁻³ سالب؟]  ⛔ [أصفار بعد الفاصلة؟]   [الأسماء والبادئات] (M2)
 *                                                       ثم │
 *                  [العدّ] (M3) → [المفكوك] (M3) → [k × 10ⁿ] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'ashara',
  nodes: [
    {
      id: 'ashara', kind: 'concept', lane: 'center', requires: 'ashara-taarif', notebook: true,
      title: 'القوة 10ⁿ', subtitle: '$10^n = 10 \\times \\ldots \\times 10$',
      context: { text: KNOWLEDGE.definition.text, note: KNOWLEDGE.definition.example },
      reveals: ['asfar'],
    },
    {
      // ⛔ خطأ شائع — 10ⁿ lu comme 10 × n (la plaque ne montre jamais 30 pour 3 crans).
      id: 'khata-darb', kind: 'common_mistake', lane: 'start', requires: 'ashara-asfar',
      title: 'عشرة أس ثلاثة تساوي ثلاثين؟', subtitle: '$10^3 = 1\\,000$',
      context: { parts: [{ role: 'wrong', text: GUIDE.darb.wrong }, { role: 'why', text: GUIDE.darb.why }, { role: 'right', text: GUIDE.darb.right }] },
      reveals: [],
    },
    {
      id: 'asfar', kind: 'relationship', lane: 'center', requires: 'ashara-asfar', notebook: true,
      title: 'عدد الأصفار', subtitle: '$10^6 = 1\\,000\\,000$',
      context: { text: GUIDE.zeros },
      reveals: ['khata-darb', 'khata-raqam', 'sifr'],
    },
    {
      id: 'khata-raqam', kind: 'common_mistake', lane: 'start', requires: 'ashara-asfar',
      title: 'نعدّ الأرقام أم الأصفار؟', subtitle: '$1\\,000\\,000 = 10^6$',
      context: { parts: [{ role: 'wrong', text: GUIDE.raqam.wrong }, { role: 'why', text: GUIDE.raqam.why }, { role: 'right', text: GUIDE.raqam.right }] },
      reveals: [],
    },
    {
      id: 'sifr', kind: 'term', lane: 'end', requires: 'ashara-sifr', notebook: true,
      title: 'الأس صفر', subtitle: '$10^0 = 1$',
      context: { text: KNOWLEDGE.zero.text, note: GUIDE.zero },
      reveals: ['salib'],
    },
    {
      id: 'salib', kind: 'term', lane: 'end', requires: 'ashara-salib', notebook: true,
      title: 'الأس السالب', subtitle: '$10^{-n} = \\frac{1}{10^n}$',
      context: { text: KNOWLEDGE.inverse.text, note: KNOWLEDGE.inverse.example },
      reveals: ['khata-salib', 'khata-fasila', 'asma'],
    },
    {
      id: 'khata-salib', kind: 'common_mistake', lane: 'end', requires: 'ashara-salib',
      title: 'أس سالب: عدد سالب؟', subtitle: '$10^{-3} = 0{,}001$',
      context: { parts: [{ role: 'wrong', text: GUIDE.salib.wrong }, { role: 'why', text: GUIDE.salib.why }, { role: 'right', text: GUIDE.salib.right }] },
      reveals: [],
    },
    {
      id: 'khata-fasila', kind: 'common_mistake', lane: 'start', requires: 'ashara-salib',
      title: 'أصفار بعد الفاصلة؟', subtitle: '$10^{-3} = 0{,}001$',
      context: { parts: [{ role: 'wrong', text: GUIDE.fasila.wrong }, { role: 'why', text: GUIDE.fasila.why }, { role: 'right', text: GUIDE.fasila.right }] },
      reveals: [],
    },
    {
      id: 'asma', kind: 'term', lane: 'center', requires: 'ashara-asma', notebook: true,
      title: 'الأسماء والبادئات', subtitle: 'كيلو $10^3$ ، ميلي $10^{-3}$',
      context: { text: KNOWLEDGE.names.text, note: GUIDE.wihda.right },
      reveals: ['adad'],
    },
    {
      id: 'adad', kind: 'method', lane: 'center', requires: 'ashara-adad', notebook: true,
      title: 'عدّ الأصفار أو الرتبة', subtitle: '$0{,}0001 = 10^{-4}$',
      context: { text: METHOD.count.rule },
      reveals: ['mafkuk'],
    },
    {
      id: 'mafkuk', kind: 'method', lane: 'center', requires: 'ashara-mafkuk', notebook: true,
      title: 'مفكوك عدد عشري', subtitle: '$3985 = 3 \\times 10^3 + 9 \\times 10^2 + 8 \\times 10^1 + 5 \\times 10^0$',
      context: { text: METHOD.expand.rule },
      reveals: ['kn'],
    },
    {
      id: 'kn', kind: 'method', lane: 'center', requires: 'ashara-kn', notebook: true,
      title: 'الكتابة k × 10ⁿ', subtitle: '$45\\,000 = 45 \\times 10^3$',
      context: { text: METHOD.times.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'ashara-kn',
      title: 'الخلاصة', subtitle: '$10^0 = 1$ ، $10^{-n} = \\frac{1}{10^n}$',
      context: { text: KNOWLEDGE.inverse.text, note: KNOWLEDGE.definition.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'ashara', to: 'asfar', label: 'نعدّ' },
    { from: 'asfar', to: 'khata-darb', label: 'خطأ شائع' },
    { from: 'asfar', to: 'khata-raqam', label: 'خطأ شائع' },
    { from: 'asfar', to: 'sifr', label: 'حالة خاصّة' },
    { from: 'sifr', to: 'salib', label: 'ثم' },
    { from: 'salib', to: 'khata-salib', label: 'خطأ شائع' },
    { from: 'salib', to: 'khata-fasila', label: 'خطأ شائع' },
    { from: 'salib', to: 'asma', label: 'نسمّي' },
    { from: 'asma', to: 'adad', label: 'نستعملها' },
    { from: 'adad', to: 'mafkuk', label: 'ثم' },
    { from: 'mafkuk', to: 'kn', label: 'ثم' },
    { from: 'kn', to: 'khulasa', label: 'نستخلص' },
  ],
};
