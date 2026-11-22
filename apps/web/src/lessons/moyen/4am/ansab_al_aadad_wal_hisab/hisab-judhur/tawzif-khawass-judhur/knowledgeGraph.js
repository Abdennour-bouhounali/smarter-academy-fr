/**
 * La carte PROGRESSIVE du درس 5 « توظيف خواص الجذور التربيعية » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — les
 * deux encadrés « طريقة » et les solutions de la page 25 (content/textbook.js),
 * les `commonError` des exercices (content/exercises.js), « أستعدّ », et les
 * corrections des محاور. Chaque nœud est gardé par l'item de knowledge.jsx qui
 * l'établit (`requires`).
 *
 *   core   three méthodes (notebook) + trois exemples du manuel ;
 *   guide  تذكّر (√(a²b) = a√b, leçon 4, via « أستعدّ »), deux خطأ شائع
 *          (b qui n'est pas le plus petit — ex. 18 ; √(a − b) = √a − √b —
 *          ex. 38), une تحقّق (√11 × √11 = 11 — module 3), une خلاصة.
 * Rien de l'évaluation (√75, 2/√3, ex. 26, √7/(2√5)) n'est montré ici.
 *
 *                   [b أصغر ما يمكن]              طريقة (m1)
 *                          │ مثال
 *                    [8، 18 و 98]
 *       يعتمد على ┌─────────┼─────────┐ الجذر نفسه
 *  📌 [√(a²b) = a√b]  خطأ شائع │
 *              ⛔ [مربّع ليس الأكبر]  [جمع جذور متشابهة]     طريقة (m2)
 *                                   │ مثال
 *                                [A = −4√2]
 *                      خطأ شائع ┌───┴───┐ وفي المقام؟
 *                  ⛔ [جذر الفرق]   [مقام ناطق]            طريقة (m3)
 *                                     │ مثال
 *                                  [2 على √11]
 *                                     │ نتحقق منه بـ
 *                                 🔍 [√11 × √11]
 *                                     │ نستخلص
 *                                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_SIMPLIFY, METHOD_RATIONALIZE, PREP_ITEMS } from './content/textbook';
import { EX } from './content/exercises';

const a2b = PREP_ITEMS[7];
const ex18 = EX['ex-18-1'];
const ex38 = EX['ex-38-C'];

export const KNOWLEDGE_GRAPH = {
  root: 'asghar',
  nodes: [
    {
      id: 'asghar', kind: 'method', lane: 'center', requires: 'kitaba-a-jidhr-b', notebook: true,
      title: 'b أصغر ما يمكن', subtitle: '$n = a^2 \\times b$',
      context: { text: KNOWLEDGE.simplest },
      reveals: ['ex8'],
    },
    {
      // 📌 تذكّر — √(a²b) = a√b (leçon 4), diagnostiqué par « أستعدّ » (item 8 de la plateforme).
      id: 'tadhakkar', kind: 'prerequisite', lane: 'start', requires: 'kitaba-a-jidhr-b',
      title: 'جذر جداء فيه مربّع', subtitle: '$\\sqrt{a^2 b} = a\\sqrt{b}$',
      context: { text: a2b.why },
      reveals: [],
    },
    {
      id: 'ex8', kind: 'example', lane: 'end', requires: 'kitaba-a-jidhr-b',
      title: '8، 18 و 98', subtitle: '$\\sqrt{98} = 7\\sqrt{2}$',
      context: { text: '$\\sqrt{8} = \\sqrt{2^2 \\times 2} = 2\\sqrt{2}$ ، $\\sqrt{18} = \\sqrt{3^2 \\times 2} = 3\\sqrt{2}$ و $\\sqrt{98} = \\sqrt{7^2 \\times 2} = 7\\sqrt{2}$ .' },
      reveals: ['tadhakkar', 'khata-asghar', 'tawzii'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 18 et le distracteur 6√8 du module 1.
      id: 'khata-asghar', kind: 'common_mistake', lane: 'end', requires: 'kitaba-a-jidhr-b',
      title: 'مربّع ليس الأكبر', subtitle: '$6\\sqrt{8}$ أم $12\\sqrt{2}$؟',
      context: {
        parts: [
          { role: 'wrong', text: 'نكتب $\\sqrt{288} = 6\\sqrt{8}$ ونتوقّف.' },
          { role: 'why', text: ex18.commonError },
          { role: 'right', text: 'نبحث عن أكبر مربع $a^2$ يقسم $n$: $288 = 12^2 \\times 2$ ، إذن $\\sqrt{288} = 12\\sqrt{2}$.' },
        ],
      },
      reveals: [],
    },
    {
      id: 'tawzii', kind: 'method', lane: 'center', requires: 'tabsit-tawzii', notebook: true,
      title: 'جمع جذور متشابهة', subtitle: '$(x + y + z)\\sqrt{b}$',
      context: { text: KNOWLEDGE.distributive },
      reveals: ['exA'],
    },
    {
      id: 'exA', kind: 'example', lane: 'center', requires: 'tabsit-tawzii',
      title: 'تبسيط A', subtitle: '$A = -4\\sqrt{2}$',
      context: { text: METHOD_SIMPLIFY.solution[1] },
      reveals: ['khata-jam', 'nisba'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 38 (C) et son distracteur √63 + 6√7.
      id: 'khata-jam', kind: 'common_mistake', lane: 'start', requires: 'tabsit-tawzii',
      title: 'جذر الفرق', subtitle: '$\\sqrt{175} - \\sqrt{112}$',
      context: {
        parts: [
          { role: 'wrong', text: ex38.commonError },
          { role: 'why', text: 'الخاصية التوزيعية تجمع حدودًا لها نفس الجذر: $x\\sqrt{b} + y\\sqrt{b} = (x + y)\\sqrt{b}$. أما $\\sqrt{8} + \\sqrt{18}$ فلا يساوي $\\sqrt{26}$: $2\\sqrt{2} + 3\\sqrt{2} = 5\\sqrt{2}$.' },
          { role: 'right', text: ex38.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'nisba', kind: 'method', lane: 'end', requires: 'naqt-maqam', notebook: true,
      title: 'مقام ناطق', subtitle: '$\\dfrac{a}{\\sqrt{b}} = \\dfrac{a\\sqrt{b}}{b}$',
      context: { text: METHOD_RATIONALIZE.method },
      reveals: ['ex11'],
    },
    {
      id: 'ex11', kind: 'example', lane: 'end', requires: 'naqt-maqam',
      title: '2 على جذر 11', subtitle: '$\\dfrac{2\\sqrt{11}}{11}$',
      context: { text: METHOD_RATIONALIZE.solution[0], note: METHOD_RATIONALIZE.solution[1] },
      reveals: ['tahaqqaq'],
    },
    {
      // 🔍 تحقّق — la prédiction du module 3 et sa correction.
      id: 'tahaqqaq', kind: 'check', lane: 'end', requires: 'naqt-maqam',
      title: 'لماذا يصير المقام ناطقًا؟', subtitle: '$\\sqrt{11} \\times \\sqrt{11} = 11$',
      context: { text: 'لأن $\\sqrt{11} \\times \\sqrt{11} = \\sqrt{121} = 11$ عدد ناطق، أما $2\\sqrt{11}$ ، $11\\sqrt{11}$ و $\\sqrt{22}$ فأعداد غير ناطقة.' },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les trois encadrés « طريقة » de la page 25, réunis.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'naqt-maqam',
      title: 'ثلاث طرائق', subtitle: 'أكبر مربّع · الخاصية التوزيعية · مقام ناطق',
      context: {
        text: 'نكتب كل جذر على الشكل $a\\sqrt{b}$ حيث $b$ أصغر ما يمكن (أكبر مربع $a^2$ يقسم $n$)، ثم نجمع الحدود التي لها نفس الجذر بالخاصية التوزيعية.',
        note: 'وإذا كان في المقام جذر $\\sqrt{b}$، نضرب البسط والمقام في $\\sqrt{b}$.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'asghar', to: 'ex8', label: 'مثال' },
    { from: 'ex8', to: 'tadhakkar', label: 'يعتمد على' },
    { from: 'ex8', to: 'khata-asghar', label: 'خطأ شائع' },
    { from: 'ex8', to: 'tawzii', label: 'الجذر نفسه' },
    { from: 'tawzii', to: 'exA', label: 'مثال' },
    { from: 'exA', to: 'khata-jam', label: 'خطأ شائع' },
    { from: 'exA', to: 'nisba', label: 'وفي المقام؟' },
    { from: 'nisba', to: 'ex11', label: 'مثال' },
    { from: 'ex11', to: 'tahaqqaq', label: 'نتحقق منه بـ' },
    { from: 'tahaqqaq', to: 'khulasa', label: 'نستخلص' },
  ],
};
