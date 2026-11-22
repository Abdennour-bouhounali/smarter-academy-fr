/**
 * La carte PROGRESSIVE du درس « مقلوب عدد وقسمة كسرين » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient
 * de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [المقلوب] (M1) → [القسمة ضرب في المقلوب] (M1) → [a/b ÷ c/d] (M1) ── خطأ شائع ── ⛔ [نضرب الكسرين كما هما؟]
 *        ثم │
 *   [مقلوب طبيعي / عشري / كسر] (M2) → [0 بلا مقلوب] (M2) → [اختزال قبل الضرب] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'maqlub',
  nodes: [
    {
      id: 'maqlub', kind: 'concept', lane: 'center', requires: 'maqlub', notebook: true,
      title: 'مقلوب عدد غير معدوم', subtitle: '$x \\times \\frac{1}{x} = 1$',
      context: { text: GUIDE.one },
      reveals: ['qisma'],
    },
    {
      id: 'qisma', kind: 'relationship', lane: 'center', requires: 'qisma-darb', notebook: true,
      title: 'القسمة ضرب في المقلوب', subtitle: '$a \\div b = a \\times \\frac{1}{b}$',
      context: { text: KNOWLEDGE.property.text },
      reveals: ['khata-noflip', 'kasrayn'],
    },
    {
      id: 'kasrayn', kind: 'relationship', lane: 'end', requires: 'qismat-kasrayn', notebook: true,
      title: 'قسمة كسر على كسر', subtitle: '$\\frac{a}{b} \\times \\frac{d}{c}$',
      context: { text: KNOWLEDGE.examples.text },
      reveals: ['tarif'],
    },
    {
      // ⛔ خطأ شائع — multiplier les deux fractions telles quelles au lieu de multiplier par le مقلوب du second.
      id: 'khata-noflip', kind: 'common_mistake', lane: 'start', requires: 'qismat-kasrayn',
      title: 'نضرب الكسرين كما هما؟', subtitle: '$\\frac{25}{27}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.noflip.wrong },
          { role: 'why', text: GUIDE.noflip.why },
          { role: 'right', text: GUIDE.noflip.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tarif', kind: 'term', lane: 'center', requires: 'maqlub-tarif', notebook: true,
      title: 'مقلوب طبيعي أو عشري أو كسر', subtitle: '$\\frac{1}{a}$ ، $\\frac{b}{a}$',
      context: { text: KNOWLEDGE.definition.text },
      reveals: ['sifr'],
    },
    {
      id: 'sifr', kind: 'concept', lane: 'center', requires: 'sifr-item', notebook: true,
      title: 'العدد 0 بلا مقلوب', subtitle: '$0 \\times x = 0$',
      context: { text: KNOWLEDGE.zero.text },
      reveals: ['ikhtizal'],
    },
    {
      id: 'ikhtizal', kind: 'method', lane: 'center', requires: 'ikhtizal-qabl', notebook: true,
      title: 'الاختزال قبل الضرب', subtitle: '$\\frac{14}{15} \\times \\frac{10}{21}$',
      context: { text: METHOD.simplify.rule, note: METHOD.compound.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'ikhtizal-qabl',
      title: 'الخلاصة', subtitle: '$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$',
      context: { text: KNOWLEDGE.property.text, note: KNOWLEDGE.zero.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'maqlub', to: 'qisma', label: 'ثم' },
    { from: 'qisma', to: 'kasrayn', label: 'ثم' },
    { from: 'qisma', to: 'khata-noflip', label: 'خطأ شائع' },
    { from: 'kasrayn', to: 'tarif', label: 'نسمّي' },
    { from: 'tarif', to: 'sifr', label: 'ونستثني' },
    { from: 'sifr', to: 'ikhtizal', label: 'نحسب' },
    { from: 'ikhtizal', to: 'khulasa', label: 'نستخلص' },
  ],
};
