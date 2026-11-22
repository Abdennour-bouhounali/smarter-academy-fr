/**
 * La carte PROGRESSIVE du درس 1 « حل معادلة من الدرجة الأولى بمجهول واحد » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — la balance et le
 * la balance (content/textbook.js › BALANCE_LINES), معارف, les طرائق, et les
 * `commonError` / `method` / corrections des exercices (content/exercises.js). Chaque nœud
 * est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   core   trois items (notebook) + trois exemples (كيس البالونات، المثال، المعاملات العشرية) ;
 *   guide  خطأ شائع (12 transporté sans changer de signe), انتبه (aucune
 *          valeur ne vérifie l'égalité, 4 ≠ 1), خطأ شائع (b/a renversé), تحقّق (la
 *          substitution), خلاصة (la méthode et la propriété).
 * Rien de l'إختبار أولي (−2 + x = 5, 4x = 5x, 5x = −3, 6x − 4 = 2x + 8, 3(x − 2) = x + 4)
 * n'est montré ici.
 *
 *                  [العملية نفسها على الطرفين]            m1
 *                           │ مثال
 *                      [كيس البالونات]
 *          خطأ شائع ┌───────┴───────┐ يؤول إلى
 *   ⛔ [نقل دون تغيير الإشارة]    [المعادلة ax = b]       m2
 *                                   │ مثال
 *                              [مثال]
 *                 انتبه إلى ┌───────┴───────┐ خطأ شائع
 *        ⚠ [لا يحقّقها أي عدد]     ⛔ [b/a وليس a/b]
 *                                   │ طريقة
 *                              [طريقة الحل]              m3
 *                                   │ مثال
 *                            [معاملات عشرية]
 *                                   │ نتحقق منه بـ
 *                           🔍 [نتحقّق بالتعويض]
 *                                   │ نستخلص
 *                               🎯 [خلاصة]
 */
import { KNOWLEDGE, METHOD, BALANCE_LINES } from './content/textbook';
import { EX } from './content/exercises';

const ex3 = EX['ex-3-a'];
const ex1 = EX['ex-1-a'];
const ex9 = EX['ex-9-b'];

export const KNOWLEDGE_GRAPH = {
  root: 'tawazun',
  nodes: [
    {
      id: 'tawazun', kind: 'concept', lane: 'center', requires: 'muadala-tarafayn', notebook: true,
      title: 'العملية نفسها على الطرفين', subtitle: 'ميزان متوازن',
      context: { text: BALANCE_LINES.rule },
      reveals: ['fatima'],
    },
    {
      id: 'fatima', kind: 'example', lane: 'center', requires: 'muadala-tarafayn',
      title: 'كيس من البالونات', subtitle: '$x = -4$',
      context: { text: BALANCE_LINES.example, note: BALANCE_LINES.verify },
      reveals: ['khata-naql', 'hal'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 3 (x + 12 = 4 → 16).
      id: 'khata-naql', kind: 'common_mistake', lane: 'start', requires: 'muadala-tarafayn',
      title: 'نقل حدّ دون تغيير إشارته', subtitle: '$x + 12 = 4$',
      context: {
        parts: [
          { role: 'wrong', text: ex3.commonError },
          { role: 'why', text: ex3.method },
          { role: 'right', text: ex3.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'hal', kind: 'relationship', lane: 'end', requires: 'hal-ax-b', notebook: true,
      title: 'المعادلة ax = b', subtitle: '$x = \\dfrac{b}{a}$',
      context: { text: KNOWLEDGE.property },
      reveals: ['ex92'],
    },
    {
      id: 'ex92', kind: 'example', lane: 'center', requires: 'hal-ax-b',
      title: 'مثال', subtitle: '$x = \\dfrac{11}{4}$',
      context: { text: KNOWLEDGE.example },
      reveals: ['la-hal', 'khata-qisma'],
    },
    {
      // ⚠ انتبه — la deuxième équation des dénominateurs : 2 ≠ 5, aucune valeur ne convient.
      id: 'la-hal', kind: 'warning', lane: 'start', requires: 'hal-ax-b',
      title: 'لا يحقّقها أي عدد', subtitle: '$2 \\neq 5$',
      context: { text: ex9.question.explain },
      reveals: [],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 1 (3x = 14 → 3/14).
      id: 'khata-qisma', kind: 'common_mistake', lane: 'end', requires: 'hal-ax-b',
      title: 'b على a وليس a على b', subtitle: '$3x = 14$',
      context: {
        parts: [
          { role: 'wrong', text: ex1.commonError },
          { role: 'why', text: ex1.method },
          { role: 'right', text: ex1.question.explain },
        ],
      },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-hal', notebook: true,
      title: 'طريقة الحل',
      context: { text: METHOD.rule },
      reveals: ['exB'],
    },
    {
      id: 'exB', kind: 'example', lane: 'center', requires: 'tariqat-hal',
      title: 'معاملات عشرية', subtitle: '$x = -3$',
      context: { text: METHOD.b.solution[1], note: METHOD.b.solution[2] },
      reveals: ['tahaqquq'],
    },
    {
      // 🔍 تحقّق — la substitution, faite par la balance (les sacs ouverts) et au module 1.
      id: 'tahaqquq', kind: 'check', lane: 'end', requires: 'tariqat-hal',
      title: 'نتحقّق بالتعويض', subtitle: '$x = -4$',
      context: { text: BALANCE_LINES.verify },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la méthode (P2) puis la propriété (P1).
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-hal',
      title: 'خلاصة', subtitle: 'الطرفان معًا ثم القسمة على a',
      context: { text: METHOD.rule, note: KNOWLEDGE.property },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tawazun', to: 'fatima', label: 'مثال' },
    { from: 'fatima', to: 'khata-naql', label: 'خطأ شائع' },
    { from: 'fatima', to: 'hal', label: 'يؤول إلى' },
    { from: 'hal', to: 'ex92', label: 'مثال' },
    { from: 'ex92', to: 'la-hal', label: 'انتبه إلى' },
    { from: 'ex92', to: 'khata-qisma', label: 'خطأ شائع' },
    { from: 'khata-qisma', to: 'tariqa', label: 'طريقة' },
    { from: 'tariqa', to: 'exB', label: 'مثال' },
    { from: 'exB', to: 'tahaqquq', label: 'نتحقق منه بـ' },
    { from: 'tahaqquq', to: 'khulasa', label: 'نستخلص' },
  ],
};
