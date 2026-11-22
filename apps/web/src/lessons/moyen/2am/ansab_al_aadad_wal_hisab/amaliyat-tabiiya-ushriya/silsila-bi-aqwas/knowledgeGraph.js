/**
 * La carte PROGRESSIVE du درس « سلسلة عمليات تتضمّن أقواسا » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [les parenthèses d'abord] (M1) → [une paire inutile] (M1) → [imbriquées] (M1) → [la barre] (M1) ── erreur courante ── ⛔ [on oublie les parenthèses] · ⛔ [le numérateur seul]
 *        puis │
 *   [la règle] (M2) → [méthode : de l'intérieur] (M3) → [méthode : la calculatrice] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'awwalan',
  nodes: [
    {
      id: 'awwalan', kind: 'concept', lane: 'center', requires: 'aqwas-awwalan', notebook: true,
      title: 'الأقواس أوّلًا', subtitle: '$(45 + 15) \\div 4 = 15$',
      context: { text: GUIDE.coop },
      reveals: ['ghayr-daruriya'],
    },
    {
      id: 'ghayr-daruriya', kind: 'relationship', lane: 'center', requires: 'aqwas-ghayr-daruriya', notebook: true,
      title: 'قوسان غير ضروريين', subtitle: '$9 + (2 \\times 5) = 19$',
      context: { text: KNOWLEDGE.useless.text },
      reveals: ['khata-aqwas', 'mutadakhila'],
    },
    {
      id: 'mutadakhila', kind: 'relationship', lane: 'end', requires: 'aqwas-mutadakhila', notebook: true,
      title: 'أقواس داخل أقواس', subtitle: '$2 \\times [50 - (12 + 8)] = 60$',
      context: { text: KNOWLEDGE.nested.text },
      reveals: ['khatt-kasr'],
    },
    {
      id: 'khatt-kasr', kind: 'relationship', lane: 'end', requires: 'khatt-kasr', notebook: true,
      title: 'خطّ الكسر', subtitle: '$\\frac{40+8}{15-9} = 8$',
      context: { text: KNOWLEDGE.bar.text },
      reveals: ['khata-kasr', 'qaida'],
    },
    {
      // ⛔ erreur courante — oublier les parenthèses : la machine divise le dernier nombre seul.
      id: 'khata-aqwas', kind: 'common_mistake', lane: 'start', requires: 'aqwas-awwalan',
      title: 'ننسى القوسين؟', subtitle: '$45 + 15 \\div 4 = 48{,}75$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.ignored.wrong },
          { role: 'why', text: GUIDE.ignored.why },
          { role: 'right', text: GUIDE.ignored.right },
        ],
      },
      reveals: [],
    },
    {
      // ⛔ erreur courante — le numérateur seul entre parenthèses.
      id: 'khata-kasr', kind: 'common_mistake', lane: 'start', requires: 'khatt-kasr',
      title: 'نقسم على جزء من المقام؟', subtitle: '$(40 + 8) \\div 15 - 9$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.barsplit.wrong },
          { role: 'why', text: GUIDE.barsplit.why },
          { role: 'right', text: GUIDE.barsplit.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'qaida', kind: 'term', lane: 'center', requires: 'qaidat-aqwas', notebook: true,
      title: 'قاعدة الأقواس', subtitle: '$(\\;) \\succ \\times \\div \\succ + -$',
      context: { text: KNOWLEDGE.brackets.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-mutadakhila', notebook: true,
      title: 'من الداخل إلى الخارج', subtitle: '$4 \\times [18 - 15] = 12$',
      context: { text: METHOD.nested.rule },
      reveals: ['alat'],
    },
    {
      id: 'alat', kind: 'method', lane: 'center', requires: 'tariqa-khatt-kasr-alat', notebook: true,
      title: 'الكسر على الآلة', subtitle: '$54 \\div (4 \\times 3 - 3) + 2 = 8$',
      context: { text: METHOD.keys.rule, note: METHOD.bar.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-khatt-kasr-alat',
      title: 'الخلاصة', subtitle: '$(\\;) \\succ \\times \\div \\succ + -$ ، والكسر قوسان',
      context: { text: KNOWLEDGE.brackets.text, note: KNOWLEDGE.bar.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'awwalan', to: 'ghayr-daruriya', label: 'ثم' },
    { from: 'ghayr-daruriya', to: 'khata-aqwas', label: 'خطأ شائع' },
    { from: 'ghayr-daruriya', to: 'mutadakhila', label: 'ثم' },
    { from: 'mutadakhila', to: 'khatt-kasr', label: 'ثم' },
    { from: 'khatt-kasr', to: 'khata-kasr', label: 'خطأ شائع' },
    { from: 'khatt-kasr', to: 'qaida', label: 'نسمّي' },
    { from: 'qaida', to: 'tariqa', label: 'نحسب' },
    { from: 'tariqa', to: 'alat', label: 'ونحجز' },
    { from: 'alat', to: 'khulasa', label: 'نستخلص' },
  ],
};
