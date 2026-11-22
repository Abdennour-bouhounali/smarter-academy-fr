/**
 * La carte PROGRESSIVE du درس « وصف سلسلة حسابات » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [la dernière opération nomme] (M1) → [termes, facteurs, dividende] (M1) → [la phrase] (M1) ── erreur courante ── ⛔ [on nomme par la première opération] · ⛔ [on oublie les parenthèses]
 *        puis │
 *   [la règle] (M2) → [méthode : décrire] (M3) → [méthode : écrire] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'akhir',
  nodes: [
    {
      id: 'akhir', kind: 'concept', lane: 'center', requires: 'akhir-amaliya', notebook: true,
      title: 'آخر عملية تسمّي السلسلة', subtitle: '$7 + 4 \\times 5 = 27$',
      context: { text: GUIDE.cork },
      reveals: ['hudud'],
    },
    {
      id: 'hudud', kind: 'relationship', lane: 'center', requires: 'hudud-awamil', notebook: true,
      title: 'حدّان وعاملان ومقسوم وقاسم', subtitle: '$(18 + 6) \\div 3 = 8$',
      context: { text: KNOWLEDGE.terms.text },
      reveals: ['khata-awwal', 'wasf'],
    },
    {
      id: 'wasf', kind: 'relationship', lane: 'end', requires: 'wasf-jumla', notebook: true,
      title: 'جملة تصف السلسلة', subtitle: '$6 \\times (9 - 2) + 5 = 47$',
      context: { text: KNOWLEDGE.sentence.text },
      reveals: ['khata-aqwas', 'qaida'],
    },
    {
      // ⛔ erreur courante — nommer la chaîne par la première opération faite : la coupe mord une agrafe.
      id: 'khata-awwal', kind: 'common_mistake', lane: 'start', requires: 'hudud-awamil',
      title: 'نسمّيها بأوّل عملية؟', subtitle: '$7 + 4 \\times 5 \\ne 11 \\times 5$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.firstop.wrong },
          { role: 'why', text: GUIDE.firstop.why },
          { role: 'right', text: GUIDE.firstop.right },
        ],
      },
      reveals: [],
    },
    {
      // ⛔ erreur courante — écrire la chaîne d'une phrase sans la parenthèse qu'elle exige.
      id: 'khata-aqwas', kind: 'common_mistake', lane: 'start', requires: 'wasf-jumla',
      title: 'نكتبها دون قوسين؟', subtitle: '$4 \\times 9 + 6 = 42$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.nobracket.wrong },
          { role: 'why', text: GUIDE.nobracket.why },
          { role: 'right', text: GUIDE.nobracket.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'qaida', kind: 'term', lane: 'center', requires: 'qaidat-tasmiya', notebook: true,
      title: 'قاعدة التسمية والوصف', subtitle: '$(9 + 2) \\times 7 = 77$',
      context: { text: KNOWLEDGE.last.text, note: KNOWLEDGE.order.text },
      reveals: ['wasf-tariqa'],
    },
    {
      id: 'wasf-tariqa', kind: 'method', lane: 'center', requires: 'tariqa-wasf', notebook: true,
      title: 'أصف السلسلة بجملة', subtitle: '$12 \\times (15 - 9) = 72$',
      context: { text: METHOD.describe.rule },
      reveals: ['kitaba'],
    },
    {
      id: 'kitaba', kind: 'method', lane: 'center', requires: 'tariqa-kitaba', notebook: true,
      title: 'أكتب السلسلة من جملتها', subtitle: '$(27 + 9) \\div 6 = 6$',
      context: { text: METHOD.write.rule, note: METHOD.bracket.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-kitaba',
      title: 'الخلاصة', subtitle: 'آخر عملية تسمّي السلسلة وتبدأ بها الجملة',
      context: { text: KNOWLEDGE.last.text, note: KNOWLEDGE.sentence.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'akhir', to: 'hudud', label: 'ثم' },
    { from: 'hudud', to: 'khata-awwal', label: 'خطأ شائع' },
    { from: 'hudud', to: 'wasf', label: 'ثم' },
    { from: 'wasf', to: 'khata-aqwas', label: 'خطأ شائع' },
    { from: 'wasf', to: 'qaida', label: 'نسمّي' },
    { from: 'qaida', to: 'wasf-tariqa', label: 'نصف' },
    { from: 'wasf-tariqa', to: 'kitaba', label: 'ونكتب' },
    { from: 'kitaba', to: 'khulasa', label: 'نستخلص' },
  ],
};
