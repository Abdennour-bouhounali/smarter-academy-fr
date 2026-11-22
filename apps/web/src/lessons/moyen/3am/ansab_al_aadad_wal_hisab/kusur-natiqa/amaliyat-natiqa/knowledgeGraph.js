/**
 * La carte PROGRESSIVE du درس « العمليات على الأعداد الناطقة » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient
 * de la leçon (content/textbook.js, `KNOWLEDGE`, `METHOD`, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [جمع وطرح] (M1) → [جداء] (M1) ── خطأ شائع ── ⛔ [إشارة أوّل حدّ]
 *        ثم │
 *   [قسمة بالمقلوب] (M1) ── خطأ شائع ── ⛔ [مقلوب سالب] → [أولوية العمليات] (M1) → [مقلوب ناطق] (M2) → [سلسلة حسابات] (M3) ── خطأ شائع ── ⛔ [من اليسار] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'jam',
  nodes: [
    {
      id: 'jam', kind: 'concept', lane: 'center', requires: 'jam-natiqa', notebook: true,
      title: 'جمع وطرح عددين ناطقين', subtitle: '$-\\frac{5}{4}+\\frac{11}{6}$',
      context: { text: KNOWLEDGE.sum.text, note: GUIDE.arcade },
      reveals: ['jida'],
    },
    {
      id: 'jida', kind: 'relationship', lane: 'center', requires: 'jida-natiqa', notebook: true,
      title: 'جداء عددين ناطقين', subtitle: '$\\frac{a\\times c}{b\\times d}$',
      context: { text: KNOWLEDGE.prod.text },
      reveals: ['khata-sumsign', 'qisma'],
    },
    {
      // ⛔ خطأ شائع — la somme prend le signe du premier terme.
      id: 'khata-sumsign', kind: 'common_mistake', lane: 'start', requires: 'jam-natiqa',
      title: 'إشارة الحدّ الأوّل؟', subtitle: '$-\\frac{15}{12}+\\frac{22}{12}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.sumsign.wrong },
          { role: 'why', text: GUIDE.sumsign.why },
          { role: 'right', text: GUIDE.sumsign.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'qisma', kind: 'relationship', lane: 'end', requires: 'qisma-natiqa', notebook: true,
      title: 'القسمة بالمقلوب', subtitle: '$\\frac{a}{b}\\times\\frac{d}{c}$',
      context: { text: KNOWLEDGE.quot.text },
      reveals: ['khata-recip', 'awla'],
    },
    {
      // ⛔ خطأ شائع — le مقلوب d'un négatif perd son signe.
      id: 'khata-recip', kind: 'common_mistake', lane: 'start', requires: 'qisma-natiqa',
      title: 'مقلوب عدد سالب؟', subtitle: '$-\\frac{3}{4}\\to-\\frac{4}{3}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.recipsign.wrong },
          { role: 'why', text: GUIDE.recipsign.why },
          { role: 'right', text: GUIDE.recipsign.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'awla', kind: 'concept', lane: 'center', requires: 'awlawiya', notebook: true,
      title: 'أولوية العمليات', subtitle: '$\\times\\ \\div\\ \\to\\ +\\ -$',
      context: { text: METHOD.chain.rule },
      reveals: ['maqlub'],
    },
    {
      id: 'maqlub', kind: 'concept', lane: 'center', requires: 'maqlub-natiq', notebook: true,
      title: 'مقلوب عدد ناطق', subtitle: '$-5\\to-\\frac{1}{5}$',
      context: { text: KNOWLEDGE.recip.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-amaliyat', notebook: true,
      title: 'حساب سلسلة', subtitle: '$-\\frac{137}{420}$',
      context: { text: METHOD.choose.rule, note: METHOD.sumDec.rule },
      reveals: ['khata-order', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — de gauche à droite sans priorité.
      id: 'khata-order', kind: 'common_mistake', lane: 'end', requires: 'tariqa-amaliyat',
      title: 'من اليسار إلى اليمين؟', subtitle: '$\\frac{1}{2}-\\frac{3}{4}\\times\\frac{2}{3}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.priority.wrong },
          { role: 'why', text: GUIDE.priority.why },
          { role: 'right', text: GUIDE.priority.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tariqa-amaliyat',
      title: 'الخلاصة', subtitle: 'الإشارة أوّلًا',
      context: { text: METHOD.choose.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jam', to: 'jida', label: 'ثم' },
    { from: 'jida', to: 'khata-sumsign', label: 'خطأ شائع' },
    { from: 'jida', to: 'qisma', label: 'ثم' },
    { from: 'qisma', to: 'khata-recip', label: 'خطأ شائع' },
    { from: 'qisma', to: 'awla', label: 'ننظّم' },
    { from: 'awla', to: 'maqlub', label: 'نسمّي' },
    { from: 'maqlub', to: 'tariqa', label: 'نطبّق' },
    { from: 'tariqa', to: 'khata-order', label: 'خطأ شائع' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
