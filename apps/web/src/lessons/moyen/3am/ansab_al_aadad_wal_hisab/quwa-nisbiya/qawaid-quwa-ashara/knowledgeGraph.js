/**
 * La carte PROGRESSIVE du درس « قواعد الحساب على قوى العدد 10 » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la
 * leçon (content/textbook.js : les trois règles réécrites, les deux méthodes, les phrases de correction partagées `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx
 * qui l'établit (`requires`).
 *
 *   [جداء: نجمع] (M1) → [قسمة: ننقص] (M1) → [قوة قوة: نضرب] (M1) → [القواعد الثلاث] (M2) ┬ ⛔ [الجداء: نضرب الأسّين؟]   ⛔ [قسمة: أنسى الإشارة؟]   (la lane `start`)
 *                                                                                      └ [لا قاعدة للجمع] (M2) → [اختصار إلى قوة] (M3) → [عدد × قوة] (M3) → 🎯 [الخلاصة]
 *
 * Les deux autres erreurs types (exposants ajoutés dans une puissance de puissance ; somme de deux puissances) sont corrigées au module 2 et dans la
 * banque : le test de mise en page (lessonGraphs.test.js) n'accepte qu'un parent avec DEUX erreurs dans la même lane et un enfant central en lane `end`.
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'jidaa',
  nodes: [
    {
      id: 'jidaa', kind: 'concept', lane: 'center', requires: 'jidaa-quwa-ashara', notebook: true,
      title: 'جداء قوتين', subtitle: '$10^m \\times 10^n = 10^{m+n}$',
      context: { text: KNOWLEDGE.product.text, note: KNOWLEDGE.product.example },
      reveals: ['hasil'],
    },
    {
      id: 'hasil', kind: 'relationship', lane: 'center', requires: 'hasil-quwa-ashara', notebook: true,
      title: 'حاصل قسمة قوتين', subtitle: '$\\frac{10^m}{10^n} = 10^{m-n}$',
      context: { text: KNOWLEDGE.quotient.text, note: KNOWLEDGE.quotient.example },
      reveals: ['quwat'],
    },
    {
      // ⛔ خطأ شائع — les exposants multipliés dans un produit.
      id: 'khata-darb', kind: 'common_mistake', lane: 'start', requires: 'qawaid-thalatha',
      title: 'الجداء: نضرب الأسّين؟', subtitle: '$10^3 \\times 10^3 = 10^6$',
      context: { parts: [{ role: 'wrong', text: GUIDE.darb.wrong }, { role: 'why', text: GUIDE.darb.why }, { role: 'right', text: GUIDE.darb.right }] },
      reveals: [],
    },
    {
      // ⛔ خطأ شائع — le signe d'un exposant négatif ignoré dans un quotient.
      id: 'khata-ishara', kind: 'common_mistake', lane: 'start', requires: 'qawaid-thalatha',
      title: 'قسمة: أنسى الإشارة؟', subtitle: '$\\frac{10^5}{10^{-2}} = 10^7$',
      context: { parts: [{ role: 'wrong', text: GUIDE.ishara.wrong }, { role: 'why', text: GUIDE.ishara.why }, { role: 'right', text: GUIDE.ishara.right }] },
      reveals: [],
    },
    {
      id: 'quwat', kind: 'relationship', lane: 'center', requires: 'quwat-quwa-ashara', notebook: true,
      title: 'قوة قوة', subtitle: '$(10^m)^n = 10^{m \\times n}$',
      context: { text: KNOWLEDGE.power.text, note: KNOWLEDGE.power.example },
      reveals: ['qawaid'],
    },
    {
      id: 'qawaid', kind: 'relationship', lane: 'center', requires: 'qawaid-thalatha', notebook: true,
      title: 'القواعد الثلاث', subtitle: 'نجمع ، ننقص ، نضرب',
      context: { text: 'جداء: نجمع الأسّين. قسمة: ننقص أسّ المقام. قوة قوة: نضرب الأسّين.' },
      reveals: ['khata-darb', 'khata-ishara', 'majmu'],
    },
    {
      id: 'majmu', kind: 'term', lane: 'end', requires: 'majmu-laysa', notebook: true,
      title: 'لا قاعدة للجمع', subtitle: '$10^2 + 10^3 = 1\\,100$',
      context: { text: KNOWLEDGE.noSum.text },
      reveals: ['tabsit'],
    },
    {
      id: 'tabsit', kind: 'method', lane: 'end', requires: 'tabsit-ashara', notebook: true,
      title: 'اختصار إلى قوة واحدة', subtitle: '$\\frac{10^5 \\times 10^{-2}}{10^{-4}} = 10^7$',
      context: { text: METHOD.chain.rule },
      reveals: ['adad'],
    },
    {
      id: 'adad', kind: 'method', lane: 'center', requires: 'adad-fi-quwa', notebook: true,
      title: 'عدد × قوة للعدد 10', subtitle: '$7 \\times 10^3 \\times 3 \\times 10^9 = 21 \\times 10^{12}$',
      context: { text: METHOD.times.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'adad-fi-quwa',
      title: 'الخلاصة', subtitle: 'نجمع ، ننقص ، نضرب',
      context: { text: 'جداء: نجمع الأسّين. قسمة: ننقص أسّ المقام. قوة قوة: نضرب الأسّين. ولا قاعدة للجمع.', note: KNOWLEDGE.noSum.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jidaa', to: 'hasil', label: 'ثم' },
    { from: 'hasil', to: 'quwat', label: 'ثم' },
    { from: 'quwat', to: 'qawaid', label: 'نلخّص' },
    { from: 'qawaid', to: 'khata-darb', label: 'خطأ شائع' },
    { from: 'qawaid', to: 'khata-ishara', label: 'خطأ شائع' },
    { from: 'qawaid', to: 'majmu', label: 'وانتبه' },
    { from: 'majmu', to: 'tabsit', label: 'نختصر' },
    { from: 'tabsit', to: 'adad', label: 'ثم' },
    { from: 'adad', to: 'khulasa', label: 'نستخلص' },
  ],
};
