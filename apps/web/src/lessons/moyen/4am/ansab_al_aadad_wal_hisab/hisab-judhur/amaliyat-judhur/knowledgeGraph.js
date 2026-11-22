/**
 * La carte PROGRESSIVE du درس « العمليات على الجذور التربيعية » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A (référence : qasim-adad-tabii).
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon —
 * معارف 4 et نشاط 4 (content/textbook.js), « أستعدّ » 5–6, les exercices et
 * leurs `method` / `commonError` (content/exercises.js). Chaque nœud est
 * gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                          [جداء جذرين]                          علاقة (محور 1)
 *            نبرهنه ┌───────────┼────────────┐ وللقسمة
 *          [البرهان بالتربيع]  مثال│        [حاصل قسمة جذرين]
 *           تذكّر │        [الجذر 12 في الجذر 3]      │ مثال
 *        📌 [مربع جداء]  انتبه إلى│  │ في الاتجاه     [25 على 9]
 *              ⚠️ [عددان سالبان]  │  الآخر          │ أما الجمع
 *                                 │     [لا مساواة في الجمع والطرح] (محور 2)
 *                                 │                 │ خطأ شائع
 *                                 │      ⛔ [توزيع الجذر على الجمع]
 *                       [جذر جداء فيه مربّع] (محور 3)
 *                                 │ نستخلص
 *                         🎯 [جداء وقسمة نعم، جمع لا]
 *
 * La relation « في الاتجاه الآخر » est DESSINÉE depuis l'exemple (√12 × √3 se
 * lit aussi de droite à gauche : √28 = √4 × √7), mais c'est la racine qui la
 * RÉVÈLE en dernier (`reveals`) : l'ordre de découverte suit محور 1, 2 puis 3.
 */
import { ACTIVITY, KNOWLEDGE, PREP_ITEMS } from './content/textbook';
import { EX } from './content/exercises';

const { product, quotient, sum } = KNOWLEDGE;
const prep5 = PREP_ITEMS.find((it) => it.n === 5);
const ex33 = EX['ex-33'];
const ex15 = EX['ex-15'];
// La phrase de la correction du module 1 (Module01NashatJidaa, 3 جـ).
const PROOF_IDEA = 'عددان موجبان لهما نفس المربع متساويان: كلاهما العدد الموجب الذي مربعه $a \\times b$.';

export const KNOWLEDGE_GRAPH = {
  root: 'jidaa',
  nodes: [
    {
      id: 'jidaa', kind: 'relationship', lane: 'center', requires: 'jidaa-jidhrayn', notebook: true,
      title: 'جداء جذرين', subtitle: '$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$',
      reveals: ['burhan', 'ex12', 'qisma', 'a2b'],
    },
    {
      // L'idée de la preuve (نشاط 4، 3 أ ب جـ) : deux nombres positifs de même carré.
      id: 'burhan', kind: 'idea', lane: 'start', requires: 'jidaa-jidhrayn',
      title: 'البرهان بالتربيع', subtitle: '$(\\sqrt{a} \\times \\sqrt{b})^2 = a \\times b$',
      context: { text: PROOF_IDEA, note: ACTIVITY.questions[4] },
      reveals: ['tadhakkar'],
    },
    {
      // 📌 تذكّر — « أستعدّ » 5 : (ab)² = a² × b², la clé de la preuve (نشاط 4، 3 ب).
      id: 'tadhakkar', kind: 'prerequisite', lane: 'start', requires: 'jidaa-jidhrayn',
      title: 'مربع جداء', subtitle: '$(ab)^2 = a^2 \\times b^2$',
      context: { text: prep5.text, note: prep5.why },
      reveals: [],
    },
    {
      id: 'ex12', kind: 'example', lane: 'start', requires: 'jidaa-jidhrayn',
      title: 'الجذر 12 في الجذر 3', subtitle: '$\\sqrt{12} \\times \\sqrt{3} = 6$',
      context: { text: product.examples[0], list: [product.examples[2]] },
      reveals: ['salib'],
    },
    {
      // ⚠️ انتبه — la remarque du manuel sur deux nombres négatifs (خاصية 1 et 2).
      id: 'salib', kind: 'warning', lane: 'start', requires: 'jidaa-jidhrayn',
      title: 'عددان سالبان', subtitle: '$\\sqrt{(-9) \\times (-4)} = 6$',
      context: { text: product.remarks[2], note: product.examples[4] },
      reveals: [],
    },
    {
      id: 'qisma', kind: 'relationship', lane: 'end', requires: 'qismat-jidhrayn', notebook: true,
      title: 'حاصل قسمة جذرين', subtitle: '$\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}$',
      reveals: ['ex25'],
    },
    {
      id: 'ex25', kind: 'example', lane: 'end', requires: 'qismat-jidhrayn',
      title: '25 على 9', subtitle: '$\\sqrt{\\dfrac{25}{9}} = \\dfrac{5}{3}$',
      context: { text: quotient.examples[1], list: [quotient.examples[0], quotient.examples[2]] },
      reveals: ['jam'],
    },
    {
      id: 'jam', kind: 'retain', lane: 'end', requires: 'la-tawzi-jam', notebook: true,
      title: 'لا مساواة في الجمع والطرح', subtitle: '$\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}$',
      reveals: ['khata'],
    },
    {
      // ⛔ خطأ شائع — محور 2 (16 + 9) et l'exercice 33 (commonError : ED = 3/2).
      id: 'khata', kind: 'common_mistake', lane: 'end', requires: 'la-tawzi-jam',
      title: 'توزيع الجذر على الجمع', subtitle: '$\\sqrt{16 + 9} \\neq 7$',
      context: {
        parts: [
          { role: 'wrong', text: ex33.commonError },
          { role: 'why', text: sum.examples[0] },
          { role: 'right', text: ex33.question.rows[0].correction },
        ],
      },
      reveals: [],
    },
    {
      id: 'a2b', kind: 'relationship', lane: 'center', requires: 'jidhr-a2b', notebook: true,
      title: 'جذر جداء فيه مربّع', subtitle: '$\\sqrt{a^2 b} = a\\sqrt{b}$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les deux propriétés et la remarque 3, réunies.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'jidhr-a2b',
      title: 'جداء وقسمة نعم، جمع لا', subtitle: '$\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$',
      context: {
        text: `${product.text} ${quotient.text}`,
        note: sum.text,
        list: [ex15.method],
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'jidaa', to: 'burhan', label: 'نبرهنه' },
    { from: 'burhan', to: 'tadhakkar', label: 'تذكّر' },
    { from: 'jidaa', to: 'ex12', label: 'مثال' },
    { from: 'ex12', to: 'salib', label: 'انتبه إلى' },
    { from: 'jidaa', to: 'qisma', label: 'وللقسمة' },
    { from: 'qisma', to: 'ex25', label: 'مثال' },
    { from: 'ex25', to: 'jam', label: 'أما الجمع' },
    { from: 'jam', to: 'khata', label: 'خطأ شائع' },
    { from: 'ex12', to: 'a2b', label: 'في الاتجاه الآخر' },
    { from: 'a2b', to: 'khulasa', label: 'نستخلص' },
  ],
};
