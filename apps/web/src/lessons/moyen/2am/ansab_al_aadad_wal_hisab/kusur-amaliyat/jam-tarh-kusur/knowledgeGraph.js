/**
 * La carte PROGRESSIVE du درس « جمع وطرح كسرين » (2AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la leçon
 * (content/textbook.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                       [نجمع أجزاء من الحجم نفسه]                         مفهوم
 *             نحوّل ┌──────────────┴──────────────┐ نطرح
 *      [الأحمر أبيض] (M1)                   [الباقي من الكلّ] (M1)
 *        خطأ شائع │                                │ نعود
 *   ⛔ [جمع المقامين]                        [الطرح مثل الجمع] (M1)
 *                       نكتب │
 *                  [عدد طبيعي وكسر] (M1)
 *                               نحسب بـ │
 *                           [طريقة التوحيد] (M3)
 *                               نستخلص │
 *                               🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'same',
  nodes: [
    {
      id: 'same', kind: 'concept', lane: 'center', requires: 'nafs-al-maqam', notebook: true,
      title: 'أجزاء من الحجم نفسه', subtitle: '$\\frac{5}{12}+\\frac{4}{12}=\\frac{9}{12}$',
      context: { text: GUIDE.sameOnly, note: 'ماذا لو اختلف حجم الجزأين؟' },
      reveals: ['tawhid'],
    },
    {
      id: 'tawhid', kind: 'method', lane: 'end', requires: 'tawhid-mudaaf', notebook: true,
      title: 'الأحمر يساوي k من الأبيض', subtitle: '$\\frac{1}{4}=\\frac{3}{12}$',
      context: { text: GUIDE.redToWhite },
      reveals: ['khata-jam', 'baqi'],
    },
    {
      // ⛔ خطأ شائع — l'addition des numérateurs ET des dénominateurs (5/12 + 1/4 = 6/16).
      id: 'khata-jam', kind: 'common_mistake', lane: 'start', requires: 'tawhid-mudaaf',
      title: 'جمع المقامين؟', subtitle: '$\\frac{5}{12}+\\frac{1}{4}\\neq\\frac{6}{16}$',
      context: { parts: [
        { role: 'wrong', text: GUIDE.across.wrong },
        { role: 'why', text: GUIDE.across.why },
        { role: 'right', text: GUIDE.across.right },
      ] },
      reveals: [],
    },
    {
      id: 'baqi', kind: 'relationship', lane: 'center', requires: 'al-baqi', notebook: true,
      title: 'الباقي من الكلّ', subtitle: '$1-\\frac{9}{12}=\\frac{3}{12}$',
      context: { text: GUIDE.rest },
      reveals: ['tarh'],
    },
    {
      id: 'tarh', kind: 'method', lane: 'center', requires: 'tarh-kajam', notebook: true,
      title: 'الطرح مثل الجمع', subtitle: '$\\frac{3}{4}-\\frac{5}{12}=\\frac{4}{12}$',
      context: { text: GUIDE.back },
      reveals: ['tabii'],
    },
    {
      id: 'tabii', kind: 'example', lane: 'center', requires: 'adad-tabii-kasr', notebook: true,
      title: 'عدد طبيعي وكسر', subtitle: '$1+\\frac{5}{6}=\\frac{11}{6}$',
      context: { text: GUIDE.loop, formula: KNOWLEDGE.natural.text },
      reveals: ['qaida'],
    },
    {
      id: 'qaida', kind: 'term', lane: 'center', requires: 'qaida-jam-tarh', notebook: true,
      title: 'قاعدتا الجمع والطرح', subtitle: '$\\frac{a}{c}\\pm\\frac{b}{c}=\\frac{a\\pm b}{c}$',
      context: { text: KNOWLEDGE.same.text },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqa-tawhid', notebook: true,
      title: 'طريقة التوحيد', subtitle: '$\\frac{7}{15}+\\frac{2}{5}=\\frac{13}{15}$',
      context: { text: METHOD.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-tawhid',
      title: 'الخلاصة', subtitle: '$\\frac{a}{b}\\pm\\frac{c}{d}$ ، $1-\\frac{a}{b}$',
      context: { text: KNOWLEDGE.multiple.text, note: KNOWLEDGE.rest.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'same', to: 'tawhid', label: 'نحوّل' },
    { from: 'tawhid', to: 'khata-jam', label: 'خطأ شائع' },
    { from: 'tawhid', to: 'baqi', label: 'نطرح من الكلّ' },
    { from: 'baqi', to: 'tarh', label: 'نعود' },
    { from: 'tarh', to: 'tabii', label: 'ونكتب' },
    { from: 'tabii', to: 'qaida', label: 'نسمّي' },
    { from: 'qaida', to: 'tariqa', label: 'نحسب بـ' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
