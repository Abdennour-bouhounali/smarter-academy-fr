/**
 * La carte PROGRESSIVE du درس « جمع وطرح كسرين » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient
 * de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [أجزاء من النوع نفسه] (M1) → [مضاعف مشترك] (M1) ── خطأ شائع ── ⛔ [جمع البسطين والمقامين]
 *        ثم │
 *   [أصغر مضاعف مشترك] (M1) → [قاعدة الجمع والطرح] (M2) → [مضاعفات المقام الأكبر] (M3) ── خطأ شائع ── ⛔ [عدد طبيعي ناقص كسر] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'ajza',
  nodes: [
    {
      id: 'ajza', kind: 'concept', lane: 'center', requires: 'tawhid-qabl-jam', notebook: true,
      title: 'أجزاء من النوع نفسه', subtitle: '$\\frac{3}{12}+\\frac{2}{12}$',
      context: { text: GUIDE.garden },
      reveals: ['mushtarak'],
    },
    {
      id: 'mushtarak', kind: 'relationship', lane: 'center', requires: 'mudaaf-mushtarak', notebook: true,
      title: 'مضاعف مشترك للمقامين', subtitle: '$12,\\ 24,\\ 36$',
      context: { text: KNOWLEDGE.same.text },
      reveals: ['khata-across', 'asghar'],
    },
    {
      // ⛔ خطأ شائع — additionner les numérateurs et les dénominateurs.
      id: 'khata-across', kind: 'common_mistake', lane: 'start', requires: 'mudaaf-mushtarak',
      title: 'جمع البسطين والمقامين؟', subtitle: '$\\frac{1}{4}+\\frac{1}{6}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.across.wrong },
          { role: 'why', text: GUIDE.across.why },
          { role: 'right', text: GUIDE.across.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'asghar', kind: 'relationship', lane: 'end', requires: 'asghar-mudaaf', notebook: true,
      title: 'أصغر مضاعف مشترك', subtitle: '$12$',
      context: { text: KNOWLEDGE.rule.text },
      reveals: ['qaida'],
    },
    {
      id: 'qaida', kind: 'concept', lane: 'center', requires: 'qaida-jam-tarh', notebook: true,
      title: 'قاعدة الجمع والطرح', subtitle: '$\\frac{a}{N}+\\frac{b}{N}=\\frac{a+b}{N}$',
      context: { text: KNOWLEDGE.rule.text, note: KNOWLEDGE.examples.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-multiples', notebook: true,
      title: 'مضاعفات المقام الأكبر', subtitle: '$18,\\ 36$',
      context: { text: METHOD.smallest.rule, note: METHOD.natural.rule },
      reveals: ['khata-integer', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — n − a/b calculé comme (n − a)/b.
      id: 'khata-integer', kind: 'common_mistake', lane: 'end', requires: 'tariqa-multiples',
      title: 'عدد طبيعي ناقص كسر؟', subtitle: '$3-\\frac{5}{8}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.integer.wrong },
          { role: 'why', text: GUIDE.integer.why },
          { role: 'right', text: GUIDE.integer.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tariqa-multiples',
      title: 'الخلاصة', subtitle: '$\\frac{1}{4}+\\frac{1}{6}=\\frac{5}{12}$',
      context: { text: KNOWLEDGE.rule.text, note: METHOD.choose.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'ajza', to: 'mushtarak', label: 'ثم' },
    { from: 'mushtarak', to: 'khata-across', label: 'خطأ شائع' },
    { from: 'mushtarak', to: 'asghar', label: 'نختار' },
    { from: 'asghar', to: 'qaida', label: 'نسمّي' },
    { from: 'qaida', to: 'tariqa', label: 'نجد' },
    { from: 'tariqa', to: 'khata-integer', label: 'خطأ شائع' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
