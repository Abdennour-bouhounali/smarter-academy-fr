/**
 * La carte PROGRESSIVE du درس « الكتابة العلمية ورتبة القدر » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de
 * la leçon (content/textbook.js : les quatre définitions réécrites, les méthodes, les phrases de correction partagées `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx
 * qui l'établit (`requires`).
 *
 *   [الكتابة العلمية] (M1) → [الحصر] (M1) → [رتبة القدر] (M1) → [المقارنة] (M1) ┬ ⛔ [الأسّ = عدد الأرقام؟]   ⛔ [نحذف ما بعد الفاصلة؟]   (la lane `start`)
 *                                                                              └ [ما الذي يجعلها علمية؟] (M2) → [طريقة] (M3) → [نحسب ثم نكتب] (M3) → 🎯 [الخلاصة]
 *
 * Les deux autres erreurs types (comparer les a sans les barreaux ; « k × 10ᵖ est scientifique tel quel ») sont corrigées au module 1 / 2 et dans la banque : le test de mise en
 * page (lessonGraphs.test.js) n'accepte qu'un parent avec DEUX erreurs dans la même lane et un enfant central en lane `end`.
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'ilmiya',
  nodes: [
    {
      id: 'ilmiya', kind: 'concept', lane: 'center', requires: 'kitaba-ilmiya', notebook: true,
      title: 'الكتابة العلمية', subtitle: '$a \\times 10^n$ ، $1 \\le a < 10$',
      context: { text: KNOWLEDGE.sci.text, note: KNOWLEDGE.sci.example },
      reveals: ['hasr'],
    },
    {
      id: 'hasr', kind: 'relationship', lane: 'center', requires: 'hasr-quwatayn', notebook: true,
      title: 'الحصر', subtitle: '$10^n \\le A < 10^{n+1}$',
      context: { text: KNOWLEDGE.bracket.text, note: KNOWLEDGE.bracket.example },
      reveals: ['rutba'],
    },
    {
      id: 'rutba', kind: 'relationship', lane: 'center', requires: 'rutbat-qadr', notebook: true,
      title: 'رتبة القدر', subtitle: '$a\' \\times 10^n$',
      context: { text: KNOWLEDGE.order.text, note: KNOWLEDGE.order.example },
      reveals: ['muqarana'],
    },
    {
      id: 'muqarana', kind: 'relationship', lane: 'center', requires: 'muqarana-ilmiya', notebook: true,
      title: 'المقارنة', subtitle: 'الأسّان أوّلًا',
      context: { text: KNOWLEDGE.compare.text, note: KNOWLEDGE.compare.example },
      reveals: ['khata-raqam', 'khata-batr', 'shart'],
    },
    {
      // ⛔ خطأ شائع — l'exposant pris pour le nombre de chiffres.
      id: 'khata-raqam', kind: 'common_mistake', lane: 'start', requires: 'muqarana-ilmiya',
      title: 'الأسّ = عدد الأرقام؟', subtitle: '$265 = 2{,}65 \\times 10^2$',
      context: { parts: [{ role: 'wrong', text: GUIDE.digits.wrong }, { role: 'why', text: GUIDE.digits.why }, { role: 'right', text: GUIDE.digits.right }] },
      reveals: [],
    },
    {
      // ⛔ خطأ شائع — le rang de grandeur par troncature.
      id: 'khata-batr', kind: 'common_mistake', lane: 'start', requires: 'muqarana-ilmiya',
      title: 'نحذف ما بعد الفاصلة؟', subtitle: '$2{,}65 \\to 3$',
      context: { parts: [{ role: 'wrong', text: GUIDE.trunc.wrong }, { role: 'why', text: GUIDE.trunc.why }, { role: 'right', text: GUIDE.trunc.right }] },
      reveals: [],
    },
    {
      id: 'shart', kind: 'term', lane: 'end', requires: 'shart-ilmiya', notebook: true,
      title: 'ما الذي يجعلها علمية؟', subtitle: '$45 \\times 10^{-2} = 4{,}5 \\times 10^{-1}$',
      context: { text: GUIDE.form.why, note: GUIDE.form.right },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'end', requires: 'tariqa-ilmiya', notebook: true,
      title: 'من عدد إلى كتابته العلمية', subtitle: '$47\\,300\\,000 = 4{,}73 \\times 10^7$',
      context: { text: METHOD.decimal.rule },
      reveals: ['hisab'],
    },
    {
      id: 'hisab', kind: 'method', lane: 'center', requires: 'hisab-ilmiya', notebook: true,
      title: 'نحسب ثم نكتب', subtitle: '$\\frac{9 \\times 10^3}{4{,}5 \\times 10^{-3}} = 2 \\times 10^6$',
      context: { text: METHOD.compute.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'hisab-ilmiya',
      title: 'الخلاصة', subtitle: 'الدرجة والخانة والمغناطيس',
      context: { text: 'الكتابة العلمية $a \\times 10^n$ : $1 \\le a < 10$ . الحصر: $10^n \\le A < 10^{n+1}$ . رتبة القدر: $a\' \\times 10^n$ بتدوير $a$ إلى الوحدة. وللمقارنة نقارن الأسّين أوّلًا.', note: KNOWLEDGE.order.example },
      reveals: [],
    },
  ],
  edges: [
    { from: 'ilmiya', to: 'hasr', label: 'ثم' },
    { from: 'hasr', to: 'rutba', label: 'ثم' },
    { from: 'rutba', to: 'muqarana', label: 'ثم' },
    { from: 'muqarana', to: 'khata-raqam', label: 'خطأ شائع' },
    { from: 'muqarana', to: 'khata-batr', label: 'خطأ شائع' },
    { from: 'muqarana', to: 'shart', label: 'وانتبه' },
    { from: 'shart', to: 'tariqa', label: 'نطبّق' },
    { from: 'tariqa', to: 'hisab', label: 'ثم' },
    { from: 'hisab', to: 'khulasa', label: 'نستخلص' },
  ],
};
