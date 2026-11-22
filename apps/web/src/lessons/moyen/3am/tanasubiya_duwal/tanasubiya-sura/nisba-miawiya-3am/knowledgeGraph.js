/**
 * La carte PROGRESSIVE du درس « النسبة المئوية » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte
 * vient de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [قيمة الخانة] (M1) → [t % من عدد] (M1) → [زيادة / تخفيض] (M1) ── خطأ شائع ── ⛔ [t يُضاف إلى العدد؟]
 *        ثم │
 *   [النسبة المئوية] (M2) → [جدول 100 ↔ الكلّ] (M2) → [ثلاث حالات] (M3) → [تغيّران متتاليان] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'khana',
  nodes: [
    {
      id: 'khana', kind: 'concept', lane: 'center', requires: 'khana-qima', notebook: true,
      title: 'قيمة الخانة الواحدة', subtitle: '$\\frac{x}{100}$',
      context: { text: GUIDE.oneCell },
      reveals: ['hissa'],
    },
    {
      id: 'hissa', kind: 'relationship', lane: 'center', requires: 'hissa-t', notebook: true,
      title: 'نسبة مئوية من عدد', subtitle: '$x \\times \\frac{t}{100}$',
      context: { text: KNOWLEDGE.property.text },
      reveals: ['khata-add', 'ziyada'],
    },
    {
      id: 'ziyada', kind: 'relationship', lane: 'end', requires: 'ziyada-nuqsan', notebook: true,
      title: 'زيادة أو تخفيض بنسبة مئوية', subtitle: '$\\left(1 \\pm \\frac{t}{100}\\right)x$',
      context: { text: KNOWLEDGE.change.text, note: GUIDE.moved },
      reveals: ['nisba'],
    },
    {
      // ⛔ خطأ شائع — ajouter t au nombre au lieu de t % de ce nombre (le refus du labo, أتمرّن ex-7).
      id: 'khata-add', kind: 'common_mistake', lane: 'start', requires: 'ziyada-nuqsan',
      title: 'نُضيف t إلى العدد؟', subtitle: '$400 + 15$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.addT.wrong },
          { role: 'why', text: GUIDE.addT.why },
          { role: 'right', text: GUIDE.addT.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'nisba', kind: 'term', lane: 'center', requires: 'nisba-taarif', notebook: true,
      title: 'النسبة المئوية', subtitle: '$t\\% = \\frac{t}{100}$',
      context: { text: KNOWLEDGE.definition.text },
      reveals: ['jadwal'],
    },
    {
      id: 'jadwal', kind: 'method', lane: 'center', requires: 'nisba-jadwal', notebook: true,
      title: 'جدول 100 ↔ الكلّ', subtitle: '$\\frac{a}{b} = \\frac{t}{100}$',
      context: { text: KNOWLEDGE.table.text },
      reveals: ['halat'],
    },
    {
      id: 'halat', kind: 'method', lane: 'center', requires: 'tariqat-hisab', notebook: true,
      title: 'ثلاث حالات', subtitle: 'الجزء · النسبة · الكلّ',
      context: { text: METHOD.cases.rule },
      reveals: ['tatabu'],
    },
    {
      id: 'tatabu', kind: 'method', lane: 'center', requires: 'tatabu', notebook: true,
      title: 'تغيّران متتاليان', subtitle: '$1{,}2 \\times 0{,}8 = 0{,}96$',
      context: { text: METHOD.change.rule, note: KNOWLEDGE.base.text },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tatabu',
      title: 'الخلاصة', subtitle: '$x \\times \\frac{t}{100}$',
      context: { text: KNOWLEDGE.property.text, note: KNOWLEDGE.change.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'khana', to: 'hissa', label: 'ثم' },
    { from: 'hissa', to: 'ziyada', label: 'ثم' },
    { from: 'hissa', to: 'khata-add', label: 'خطأ شائع' },
    { from: 'ziyada', to: 'nisba', label: 'نسمّي' },
    { from: 'nisba', to: 'jadwal', label: 'نحسب' },
    { from: 'jadwal', to: 'halat', label: 'نستعملها' },
    { from: 'halat', to: 'tatabu', label: 'ثم' },
    { from: 'tatabu', to: 'khulasa', label: 'نستخلص' },
  ],
};
