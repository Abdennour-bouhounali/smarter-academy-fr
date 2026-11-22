/**
 * La carte PROGRESSIVE du درس « مقارنة كسرين » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *             [نفس المقام] (M1)                          مفهوم
 *        نوحّد ┌─────────┴─────────┐ خطأ شائع
 *   [توحيد المقامين] (M1)       ⛔ [البسطان وحدهما]
 *             نقارن │
 *        [نفس البسط] (M1)
 *             نحدّ │
 *        [العدد 1] (M1)
 *             نسمّي │
 *        [قواعد المقارنة] (M2)
 *             نرتّب │
 *        [ترتيب كسور] (M3)
 *             نستخلص │
 *               🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'maqam',
  nodes: [
    {
      id: 'maqam', kind: 'concept', lane: 'center', requires: 'nafs-al-maqam', notebook: true,
      title: 'نفس المقام', subtitle: '$\\frac{5}{8}<\\frac{7}{8}$',
      context: { text: GUIDE.sameDen, note: 'أيّ الأنبوبين زيته أعلى؟' },
      reveals: ['tawhid'],
    },
    {
      // ⛔ خطأ شائع — comparer les seuls numérateurs quand les dénominateurs diffèrent (3/4 et 7/12).
      id: 'khata-bast', kind: 'common_mistake', lane: 'start', requires: 'nafs-al-maqam',
      title: 'البسطان وحدهما؟', subtitle: '$\\frac{7}{12}<\\frac{3}{4}$',
      context: { parts: [
        { role: 'wrong', text: GUIDE.numWrong.wrong },
        { role: 'why', text: GUIDE.numWrong.why },
        { role: 'right', text: GUIDE.numWrong.right },
      ] },
      reveals: [],
    },
    {
      id: 'tawhid', kind: 'method', lane: 'end', requires: 'tawhid-li-muqarana', notebook: true,
      title: 'توحيد المقامين', subtitle: '$\\frac{3}{4}=\\frac{9}{12}$',
      context: { text: GUIDE.multiple, formula: KNOWLEDGE.multiple.text },
      reveals: ['khata-bast', 'bast'],
    },
    {
      id: 'bast', kind: 'relationship', lane: 'center', requires: 'nafs-al-bast', notebook: true,
      title: 'نفس البسط', subtitle: '$\\frac{3}{5}>\\frac{3}{8}$',
      context: { text: GUIDE.sameNum },
      reveals: ['wahid'],
    },
    {
      id: 'wahid', kind: 'example', lane: 'center', requires: 'muqarana-bi-1', notebook: true,
      title: 'المقارنة بالعدد 1', subtitle: '$\\frac{5}{6}<1<\\frac{9}{8}$',
      context: { text: GUIDE.one, formula: KNOWLEDGE.one.text },
      reveals: ['qawaid'],
    },
    {
      id: 'qawaid', kind: 'term', lane: 'center', requires: 'qawaid-muqarana', notebook: true,
      title: 'قواعد المقارنة', subtitle: '$\\frac{3}{5}=\\frac{12}{20}>\\frac{11}{20}$',
      context: { text: KNOWLEDGE.sameDen.text, formula: KNOWLEDGE.sameNum.text },
      reveals: ['tartib'],
    },
    {
      id: 'tartib', kind: 'method', lane: 'center', requires: 'tartib-kusur', notebook: true,
      title: 'ترتيب كسور', subtitle: '$\\frac{7}{12}<\\frac{2}{3}<\\frac{3}{4}<\\frac{5}{6}$',
      context: { text: METHOD.solution[1] },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-tawhid', notebook: true,
      title: 'الخلاصة', subtitle: '$\\frac{a}{b}\\ ?\\ \\frac{c}{d}$',
      context: { text: METHOD.rule, note: METHOD.solution[3] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'maqam', to: 'tawhid', label: 'نوحّد' },
    { from: 'tawhid', to: 'khata-bast', label: 'خطأ شائع' },
    { from: 'tawhid', to: 'bast', label: 'ونقارن' },
    { from: 'bast', to: 'wahid', label: 'ونحدّ' },
    { from: 'wahid', to: 'qawaid', label: 'نسمّي' },
    { from: 'qawaid', to: 'tartib', label: 'نرتّب' },
    { from: 'tartib', to: 'khulasa', label: 'نستخلص' },
  ],
};
