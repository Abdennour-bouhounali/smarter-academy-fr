/**
 * La carte PROGRESSIVE du درس « المعادلات من الدرجة الأولى بمجهول واحد » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est
 * écrite ici : chaque texte vient de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [الحدّ يعبر] (M1) ── خطأ شائع ── ⛔ [نقله بنفس إشارته؟]
 *        ثم │
 *   [نقسم على المعامل] (M1) → [المعادلة] (M2) → [الحلّ] (M2) → [التعويض] (M2) → [مراحل الحلّ] (M3) → [الترييض] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'naql',
  nodes: [
    {
      id: 'naql', kind: 'concept', lane: 'center', requires: 'naql-hadd', notebook: true,
      title: 'الحدّ الذي يعبر', subtitle: '$x + 3 = 7 \\Rightarrow x = 7 - 3$',
      context: { text: KNOWLEDGE.sign.text, note: GUIDE.moved },
      reveals: ['qisma'],
    },
    {
      id: 'qisma', kind: 'relationship', lane: 'end', requires: 'qisma-muamil', notebook: true,
      title: 'نقسم على معامل x', subtitle: '$ax = n \\Rightarrow x = \\frac{n}{a}$',
      context: { text: KNOWLEDGE.divide.text },
      reveals: ['khata-naql', 'muadala'],
    },
    {
      // ⛔ خطأ شائع — transporter un terme sans changer son signe (le refus du labo, أتمرّن ex-34).
      id: 'khata-naql', kind: 'common_mistake', lane: 'start', requires: 'qisma-muamil',
      title: 'ننقله بالإشارة نفسها؟', subtitle: '$x + 3 = 7$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.signKept.wrong },
          { role: 'why', text: GUIDE.signKept.why },
          { role: 'right', text: GUIDE.signKept.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'muadala', kind: 'term', lane: 'center', requires: 'muadala-taarif', notebook: true,
      title: 'معادلة من الدرجة الأولى', subtitle: '$ax + b = cx + d$',
      context: { text: KNOWLEDGE.definition.text },
      reveals: ['hall'],
    },
    {
      id: 'hall', kind: 'term', lane: 'center', requires: 'hall-muadala', notebook: true,
      title: 'حلّ المعادلة', subtitle: '$3x + 2 = x + 8 \\Rightarrow x = 3$',
      context: { text: KNOWLEDGE.solution.text },
      reveals: ['taawid'],
    },
    {
      id: 'taawid', kind: 'method', lane: 'center', requires: 'tahqqaq-taawid', notebook: true,
      title: 'التحقق بالتعويض', subtitle: '$11 = 11$',
      context: { text: KNOWLEDGE.check.text },
      reveals: ['hall-tariqa'],
    },
    {
      id: 'hall-tariqa', kind: 'method', lane: 'center', requires: 'tariqat-hall', notebook: true,
      title: 'مراحل حلّ معادلة', subtitle: '$6x - 5 = 2x + 7$',
      context: { text: METHOD.solve.rule },
      reveals: ['tarhiq'],
    },
    {
      id: 'tarhiq', kind: 'method', lane: 'center', requires: 'tarhiq-mushkila', notebook: true,
      title: 'ترييض مشكلة', subtitle: '$3x + 40 = 5x - 20$',
      context: { text: KNOWLEDGE.model.text, note: KNOWLEDGE.model.example },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tarhiq-mushkila',
      title: 'الخلاصة', subtitle: '$x = \\frac{n}{a}$',
      context: { text: KNOWLEDGE.sign.text, note: KNOWLEDGE.divide.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'naql', to: 'qisma', label: 'ثم' },
    { from: 'qisma', to: 'khata-naql', label: 'خطأ شائع' },
    { from: 'qisma', to: 'muadala', label: 'نسمّي' },
    { from: 'muadala', to: 'hall', label: 'حلّها' },
    { from: 'hall', to: 'taawid', label: 'نتحقّق' },
    { from: 'taawid', to: 'hall-tariqa', label: 'نستعملها' },
    { from: 'hall-tariqa', to: 'tarhiq', label: 'ثم' },
    { from: 'tarhiq', to: 'khulasa', label: 'نستخلص' },
  ],
};
