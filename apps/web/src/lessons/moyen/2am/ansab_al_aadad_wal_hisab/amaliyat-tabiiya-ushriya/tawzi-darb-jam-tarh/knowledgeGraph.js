/**
 * La carte PROGRESSIVE du درس « توزيع الضرب على الجمع والطرح » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [somme] (M1) → [différence] (M1) ── ⛔ [premier terme seul] ; → [facteur commun] (M1) ── ⛔ [signe changé]
 *        puis │
 *   [la règle : نشر / تحليل] (M2) → [méthode : calcul mental] (M3) → [méthode : la lettre] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'jam',
  nodes: [
    {
      id: 'jam', kind: 'concept', lane: 'center', requires: 'tawzi-jam', notebook: true,
      title: 'ضرب عدد في مجموع', subtitle: '$6 \\times (3 + 2) = 30$',
      context: { text: GUIDE.workshop },
      reveals: ['tarh'],
    },
    {
      id: 'tarh', kind: 'relationship', lane: 'center', requires: 'tawzi-tarh', notebook: true,
      title: 'ضرب عدد في فرق', subtitle: '$7 \\times (10 - 2) = 56$',
      context: { text: KNOWLEDGE.exampleDiff.text },
      reveals: ['khata-awwal', 'tahlil'],
    },
    {
      id: 'tahlil', kind: 'relationship', lane: 'end', requires: 'tahlil', notebook: true,
      title: 'العامل المشترك', subtitle: '$12 \\times 5 + 12 \\times 3 = 96$',
      context: { text: KNOWLEDGE.common.text },
      reveals: ['khata-ishara', 'qaida'],
    },
    {
      // ⛔ erreur courante — ne multiplier que le premier terme : trois cartables servis seulement.
      id: 'khata-awwal', kind: 'common_mistake', lane: 'start', requires: 'tawzi-jam',
      title: 'نضرب الحدّ الأول وحده؟', subtitle: '$6 \\times 3 + 2 \\ne 30$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.firstOnly.wrong },
          { role: 'why', text: GUIDE.firstOnly.why },
          { role: 'right', text: GUIDE.firstOnly.right },
        ],
      },
      reveals: [],
    },
    {
      // ⛔ erreur courante — changer le signe entre les deux produits.
      id: 'khata-ishara', kind: 'common_mistake', lane: 'start', requires: 'tawzi-tarh',
      title: 'نغيّر الإشارة؟', subtitle: '$7 \\times (10 - 2) \\ne 70 + 14$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.signChange.wrong },
          { role: 'why', text: GUIDE.signChange.why },
          { role: 'right', text: GUIDE.signChange.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'qaida', kind: 'term', lane: 'center', requires: 'qaidat-tawzi', notebook: true,
      title: 'خاصية التوزيع: نشر وتحليل', subtitle: '$4 \\times (9 + 6) = 60$',
      context: { text: KNOWLEDGE.property.text, note: KNOWLEDGE.names.text },
      reveals: ['dhihni'],
    },
    {
      id: 'dhihni', kind: 'method', lane: 'center', requires: 'tariqa-dhihni', notebook: true,
      title: 'الحساب الذهني بالتوزيع', subtitle: '$99 \\times 7 = 693$',
      context: { text: METHOD.near.rule, note: METHOD.common.rule },
      reveals: ['harf'],
    },
    {
      id: 'harf', kind: 'method', lane: 'center', requires: 'tariqa-harf', notebook: true,
      title: 'نشر عبارة فيها حرف', subtitle: '$4 \\times (x - 3) = 4x - 12$',
      context: { text: METHOD.letter.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-harf',
      title: 'الخلاصة', subtitle: 'العدد يضرب كلّ حدّ، ومنه ننشر ونحلّل ونحسب ذهنيًا',
      context: { text: KNOWLEDGE.property.text, note: METHOD.near.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jam', to: 'tarh', label: 'ثم' },
    { from: 'tarh', to: 'khata-awwal', label: 'خطأ شائع' },
    { from: 'tarh', to: 'tahlil', label: 'ونقرأ العكس' },
    { from: 'tahlil', to: 'khata-ishara', label: 'خطأ شائع' },
    { from: 'tahlil', to: 'qaida', label: 'نسمّي' },
    { from: 'qaida', to: 'dhihni', label: 'نحسب' },
    { from: 'dhihni', to: 'harf', label: 'ونضع حرفًا' },
    { from: 'harf', to: 'khulasa', label: 'نستخلص' },
  ],
};
