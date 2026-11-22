/**
 * La carte PROGRESSIVE du درس « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                       [حاصل القسمة قيمة مضبوطة]                          مفهوم
 *            نحصره ┌──────────────┴──────────────┐ ينتهي أو لا
 *      [القيمتان المقرّبتان] (M1)        [عشري أم لا] (M1)
 *            مثال │                          نسمّي │
 *       [8 على 3 ، 0,01]               [النسبة والكتابة الكسرية] (M2)
 *     خطأ شائع │                              نحوّل │
 *   ⛔ [الباقي بعد الفاصلة]              [القسمة على عدد عشري] (M2)
 *                                           نحسب بـ │
 *                                         [طريقة الحصر] (M3)
 *                                           نستخلص │
 *                                         🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'madbuta',
  nodes: [
    {
      id: 'madbuta', kind: 'concept', lane: 'center', requires: 'qima-madbuta', notebook: true,
      title: 'القيمة المضبوطة', subtitle: '$a \\div b = \\frac{a}{b}$',
      context: { text: KNOWLEDGE.madbuta.text, note: 'هل يوجد عدد عشري يساويه؟' },
      reveals: ['muqarraba'],
    },
    {
      id: 'muqarraba', kind: 'relationship', lane: 'start', requires: 'qiyam-muqarraba-ushr', notebook: true,
      title: 'تكفي ولا تكفي', subtitle: '$2{,}66 < \\frac{8}{3} < 2{,}67$',
      reveals: ['ex-8-3', 'ashri'],
    },
    {
      id: 'ex-8-3', kind: 'example', lane: 'start', requires: 'qiyam-muqarraba-ushr',
      title: '8 م في 3 حبال', subtitle: '$3 \\times 2{,}66 < 8 < 3 \\times 2{,}67$',
      context: { text: GUIDE.bracket, formula: '$2{,}66 < \\frac{8}{3} < 2{,}67$' },
      reveals: ['khata-baqi'],
    },
    {
      // ⛔ خطأ شائع — le reste écrit après la virgule (8 ÷ 3 = 2,2 parce que 8 = 3 × 2 + 2).
      id: 'khata-baqi', kind: 'common_mistake', lane: 'start', requires: 'qiyam-muqarraba-ushr',
      title: 'الباقي بعد الفاصلة؟', subtitle: '$8 = 3 \\times 2 + 2$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.comma.wrong },
          { role: 'why', text: GUIDE.comma.why },
          { role: 'right', text: GUIDE.comma.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'ashri', kind: 'warning', lane: 'end', requires: 'ashri-am-la', notebook: true,
      title: 'عشري إذا انتهت القسمة', subtitle: '$4 \\times 2{,}25 = 9$',
      context: { text: GUIDE.exact, note: GUIDE.never },
      reveals: ['tahwil'],
    },
    {
      id: 'tahwil', kind: 'method', lane: 'end', requires: 'tahwil-qasim', notebook: true,
      title: 'الحدّان معًا', subtitle: '$\\frac{4{,}6}{0{,}7} = \\frac{46}{7}$',
      context: { text: GUIDE.unit },
      reveals: ['nisba'],
    },
    {
      id: 'nisba', kind: 'term', lane: 'end', requires: 'nisba-kasriya', notebook: true,
      title: 'نسبة a إلى b', subtitle: '$\\frac{12}{28} = \\frac{3}{7}$',
      context: { text: KNOWLEDGE.nisba.text },
      reveals: ['qasim'],
    },
    {
      id: 'qasim', kind: 'method', lane: 'end', requires: 'qisma-ashari', notebook: true,
      title: 'القسمة على عدد عشري', subtitle: '$\\frac{4{,}2}{0{,}35} = \\frac{420}{35}$',
      context: { text: KNOWLEDGE.clear.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'hasr-ushri-tariqa', notebook: true,
      title: 'طريقة الحصر', subtitle: '$35{,}71 < \\frac{1250}{35} < 35{,}72$',
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'hasr-ushri-tariqa',
      title: 'الخلاصة', subtitle: '$\\frac{a}{b}$ ، $x < \\frac{a}{b} < x + 10^{-k}$',
      context: { text: KNOWLEDGE.madbuta.muqarraba, note: METHOD.rule },
      reveals: [],
    },
  ],
  edges: [
    { from: 'madbuta', to: 'muqarraba', label: 'نحصره' },
    { from: 'muqarraba', to: 'ashri', label: 'ينتهي أو لا' },
    { from: 'muqarraba', to: 'ex-8-3', label: 'مثال' },
    { from: 'ex-8-3', to: 'khata-baqi', label: 'خطأ شائع' },
    { from: 'ashri', to: 'tahwil', label: 'ننتقل إلى' },
    { from: 'tahwil', to: 'nisba', label: 'ونسمّي' },
    { from: 'nisba', to: 'qasim', label: 'نحوّل' },
    { from: 'qasim', to: 'tariqa', label: 'نحسب بـ' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
