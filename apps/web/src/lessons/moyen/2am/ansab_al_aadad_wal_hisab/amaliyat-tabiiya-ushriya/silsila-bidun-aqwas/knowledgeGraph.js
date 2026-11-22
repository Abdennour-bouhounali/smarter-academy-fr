/**
 * La carte PROGRESSIVE du درس « سلسلة عمليات دون أقواس وأولوية العمليات » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient
 * de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [+ − : gauche → droite] (M1) → [× ÷ : gauche → droite] (M1) → [× ÷ avant + −] (M1) ── erreur courante ── ⛔ [on additionne d'abord ?]
 *        puis │
 *   [les règles] (M2) → [un accord] (M2) → [méthode : étape par étape] (M3) → [traduire une histoire] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'jam',
  nodes: [
    {
      id: 'jam', kind: 'concept', lane: 'center', requires: 'yasar-yamin-jam', notebook: true,
      title: 'الجمع والطرح من اليسار', subtitle: '$26 - 9 + 4 = 21$',
      context: { text: GUIDE.tram },
      reveals: ['darb'],
    },
    {
      id: 'darb', kind: 'relationship', lane: 'center', requires: 'yasar-yamin-darb', notebook: true,
      title: 'الضرب والقسمة من اليسار', subtitle: '$150 \\div 6 \\times 4 = 100$',
      context: { text: KNOWLEDGE.mulDiv.text },
      reveals: ['khata-jam', 'awlawiya'],
    },
    {
      id: 'awlawiya', kind: 'relationship', lane: 'end', requires: 'awlawiya', notebook: true,
      title: 'الضرب والقسمة أوّلًا', subtitle: '$15 + 3 \\times 4 = 27$',
      context: { text: KNOWLEDGE.priority.text },
      reveals: ['khata-awlawiya', 'qawaid'],
    },
    {
      // ⛔ erreur courante — additionner les deux derniers nombres d'abord dans une chaîne + −.
      id: 'khata-jam', kind: 'common_mistake', lane: 'start', requires: 'yasar-yamin-jam',
      title: 'نجمع الأخيرين أوّلًا؟', subtitle: '$26 - 13 = 13$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.addfirst.wrong },
          { role: 'why', text: GUIDE.addfirst.why },
          { role: 'right', text: GUIDE.addfirst.right },
        ],
      },
      reveals: [],
    },
    {
      // ⛔ erreur courante — additionner avant de multiplier.
      id: 'khata-awlawiya', kind: 'common_mistake', lane: 'start', requires: 'awlawiya',
      title: 'نجمع قبل أن نضرب؟', subtitle: '$18 \\times 4 = 72$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.nopriority.wrong },
          { role: 'why', text: GUIDE.nopriority.why },
          { role: 'right', text: GUIDE.nopriority.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'qawaid', kind: 'term', lane: 'center', requires: 'qawaid-hisab', notebook: true,
      title: 'قواعد حساب سلسلة دون أقواس', subtitle: '$\\times \\div \\to + -$',
      context: { text: KNOWLEDGE.priority.text },
      reveals: ['ittifaq'],
    },
    {
      id: 'ittifaq', kind: 'concept', lane: 'center', requires: 'ittifaq', notebook: true,
      title: 'اتّفاق تتبعه الآلة', subtitle: '$15 + 3 \\times 4 = 27$',
      context: { text: KNOWLEDGE.agreement.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-marahil', notebook: true,
      title: 'مرحلة بعد مرحلة', subtitle: '$4{,}5 + 16 - 3$',
      context: { text: METHOD.priority.rule, note: METHOD.mulDivOnly.rule },
      reveals: ['tarjama'],
    },
    {
      id: 'tarjama', kind: 'method', lane: 'center', requires: 'tarjama-silsila', notebook: true,
      title: 'من وضعية إلى سلسلة', subtitle: '$200 - 3 \\times 45 - 25$',
      context: { text: METHOD.translate.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tarjama-silsila',
      title: 'الخلاصة', subtitle: '$\\times \\div \\to + -$ ، ومن اليسار',
      context: { text: KNOWLEDGE.priority.text, note: KNOWLEDGE.agreement.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jam', to: 'darb', label: 'ثم' },
    { from: 'darb', to: 'awlawiya', label: 'ثم' },
    { from: 'darb', to: 'khata-jam', label: 'خطأ شائع' },
    { from: 'awlawiya', to: 'khata-awlawiya', label: 'خطأ شائع' },
    { from: 'awlawiya', to: 'qawaid', label: 'نسمّي' },
    { from: 'qawaid', to: 'ittifaq', label: 'ونتّفق' },
    { from: 'ittifaq', to: 'tariqa', label: 'نحسب' },
    { from: 'tariqa', to: 'tarjama', label: 'نترجم' },
    { from: 'tarjama', to: 'khulasa', label: 'نستخلص' },
  ],
};
