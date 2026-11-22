/**
 * La carte PROGRESSIVE du درس « العدد الناطق » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient
 * de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [مكان واحد وكتابات كثيرة] (M1) → [مقام موجب] (M1) ── خطأ شائع ── ⛔ [إشارتان سالبتان]
 *        ثم │
 *   [ترتيب بمقام مشترك] (M1) → [أعداد هي ناطقة] (M2) → [مقام موجب مشترك] (M3) ── خطأ شائع ── ⛔ [ترتيب السالبة] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'makan',
  nodes: [
    {
      id: 'makan', kind: 'concept', lane: 'center', requires: 'adad-natiq', notebook: true,
      title: 'مكان واحد وكتابات كثيرة', subtitle: '$-\\frac{7}{3}$',
      context: { text: GUIDE.rope },
      reveals: ['maqam'],
    },
    {
      id: 'maqam', kind: 'relationship', lane: 'center', requires: 'maqam-mujab', notebook: true,
      title: 'الكتابة بمقام موجب', subtitle: '$-\\frac{3}{4}$',
      context: { text: KNOWLEDGE.standard.text },
      reveals: ['khata-twoneg', 'tartib'],
    },
    {
      // ⛔ خطأ شائع — (−a)/(−b) pris pour un nombre négatif.
      id: 'khata-twoneg', kind: 'common_mistake', lane: 'start', requires: 'maqam-mujab',
      title: 'إشارتان سالبتان؟', subtitle: '$\\frac{-9}{-12}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.twoneg.wrong },
          { role: 'why', text: GUIDE.twoneg.why },
          { role: 'right', text: GUIDE.twoneg.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tartib', kind: 'relationship', lane: 'end', requires: 'tartib-natiqa', notebook: true,
      title: 'ترتيب بمقام مشترك', subtitle: '$\\frac{21}{12},\\ \\frac{8}{12}$',
      context: { text: METHOD.choose.rule },
      reveals: ['shamil'],
    },
    {
      id: 'shamil', kind: 'concept', lane: 'center', requires: 'adad-natiq-shamil', notebook: true,
      title: 'أعداد هي ناطقة', subtitle: '$-3=\\frac{-3}{1}$',
      context: { text: KNOWLEDGE.inclusions.text, note: KNOWLEDGE.definition.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-muqarana', notebook: true,
      title: 'مقام موجب مشترك', subtitle: '$-10{,}5<-9{,}8$',
      context: { text: METHOD.compare.rule, note: METHOD.place.rule },
      reveals: ['khata-order', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — ordre des négatifs par distance.
      id: 'khata-order', kind: 'common_mistake', lane: 'end', requires: 'tariqa-muqarana',
      title: 'ترتيب الأعداد السالبة؟', subtitle: '$-\\frac{5}{6},\\ -\\frac{3}{4}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.negorder.wrong },
          { role: 'why', text: GUIDE.negorder.why },
          { role: 'right', text: GUIDE.negorder.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tariqa-muqarana',
      title: 'الخلاصة', subtitle: '$\\frac{6}{-8}=-\\frac{3}{4}$',
      context: { text: KNOWLEDGE.standard.text, note: METHOD.choose.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'makan', to: 'maqam', label: 'ثم' },
    { from: 'maqam', to: 'khata-twoneg', label: 'خطأ شائع' },
    { from: 'maqam', to: 'tartib', label: 'نرتّب' },
    { from: 'tartib', to: 'shamil', label: 'نسمّي' },
    { from: 'shamil', to: 'tariqa', label: 'نطبّق' },
    { from: 'tariqa', to: 'khata-order', label: 'خطأ شائع' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
