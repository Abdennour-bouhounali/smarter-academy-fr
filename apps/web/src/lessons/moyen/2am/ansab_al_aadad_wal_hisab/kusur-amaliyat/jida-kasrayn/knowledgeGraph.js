/**
 * La carte PROGRESSIVE du درس « جداء كسرين » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                    [الجزء من الجزء جداء]                              مفهوم
 *             نسمّي ┌──────────┴──────────┐ خطأ شائع
 *       [قاعدة الجداء] (M1)             ⛔ [جمع الكسرين]
 *                 نوسّع │
 *        [جداء أكبر من 1] (M1)
 *                 نكتب │
 *        [عدد طبيعي وكسر] (M1)
 *                 نترجم │
 *          [كسر من كمية] (M3)
 *                 نأخذ │
 *          [كسر من الباقي] (M3)
 *                 نستخلص │
 *                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'juz',
  nodes: [
    {
      id: 'juz', kind: 'concept', lane: 'center', requires: 'juz-min-juz', notebook: true,
      title: 'الجزء من الجزء جداء', subtitle: '$\\frac{2}{3}\\times\\frac{3}{4}=\\frac{6}{12}$',
      context: { text: GUIDE.panes, note: 'ماذا يمثّل الركن الذي تغطّيه الستارتان معًا؟' },
      reveals: ['qaida'],
    },
    {
      // ⛔ خطأ شائع — la somme des deux fractions prise pour la partie doublement ombrée (2/3 + 3/4 = 17/12).
      id: 'khata-jam', kind: 'common_mistake', lane: 'start', requires: 'juz-min-juz',
      title: 'جمع الكسرين؟', subtitle: '$\\frac{2}{3}\\times\\frac{3}{4}\\neq\\frac{17}{12}$',
      context: { parts: [
        { role: 'wrong', text: GUIDE.sumWrong.wrong },
        { role: 'why', text: GUIDE.sumWrong.why },
        { role: 'right', text: GUIDE.sumWrong.right },
      ] },
      reveals: [],
    },
    {
      id: 'qaida', kind: 'method', lane: 'end', requires: 'qaida-jida', notebook: true,
      title: 'قاعدة جداء كسرين', subtitle: '$\\frac{a}{b}\\times\\frac{c}{d}=\\frac{a\\times c}{b\\times d}$',
      context: { text: GUIDE.product, formula: KNOWLEDGE.product.text },
      reveals: ['khata-jam', 'akbar'],
    },
    {
      id: 'akbar', kind: 'relationship', lane: 'center', requires: 'jida-akbar-min-wahid', notebook: true,
      title: 'جداء أكبر من الواحد', subtitle: '$\\frac{7}{4}\\times\\frac{4}{3}=\\frac{7}{3}$',
      context: { text: GUIDE.big },
      reveals: ['tabii'],
    },
    {
      id: 'tabii', kind: 'example', lane: 'center', requires: 'adad-fi-kasr', notebook: true,
      title: 'عدد طبيعي في كسر', subtitle: '$2\\times\\frac{3}{5}=\\frac{6}{5}$',
      context: { text: GUIDE.natural, formula: KNOWLEDGE.natural.text },
      reveals: ['maarif'],
    },
    {
      id: 'maarif', kind: 'term', lane: 'center', requires: 'qaida-jida-maarif', notebook: true,
      title: 'قواعد الجداء', subtitle: '$\\frac{3}{4}\\times\\frac{2}{5}=\\frac{3}{10}$',
      context: { text: KNOWLEDGE.product.text, formula: KNOWLEDGE.decimal.text },
      reveals: ['min'],
    },
    {
      id: 'min', kind: 'method', lane: 'center', requires: 'kasr-min-adad', notebook: true,
      title: 'كسر من كمية', subtitle: '$\\frac{3}{8}\\times 48=18$',
      context: { text: KNOWLEDGE.of.text },
      reveals: ['baqi'],
    },
    {
      id: 'baqi', kind: 'term', lane: 'center', requires: 'kasr-min-baqi', notebook: true,
      title: 'كسر من الباقي', subtitle: '$\\frac{2}{3}\\times\\frac{3}{4}=\\frac{1}{2}$',
      context: { text: KNOWLEDGE.rest.text },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'kasr-min-baqi',
      title: 'الخلاصة', subtitle: '$\\frac{a}{b}\\times\\frac{c}{d}$ ، $n\\times\\frac{a}{b}$',
      context: { text: METHOD.rule, note: KNOWLEDGE.decimal.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'juz', to: 'qaida', label: 'نسمّي' },
    { from: 'qaida', to: 'khata-jam', label: 'خطأ شائع' },
    { from: 'qaida', to: 'akbar', label: 'نوسّع' },
    { from: 'akbar', to: 'tabii', label: 'ونكتب' },
    { from: 'tabii', to: 'maarif', label: 'نسمّي' },
    { from: 'maarif', to: 'min', label: 'نترجم' },
    { from: 'min', to: 'baqi', label: 'نأخذ' },
    { from: 'baqi', to: 'khulasa', label: 'نستخلص' },
  ],
};
