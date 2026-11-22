/**
 * La carte PROGRESSIVE du درس « الخاصية العكسية لخاصية طالس وإثبات التوازي » — KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — نشاط 2 (content/textbook.js › ACTIVITY),
 * معارف 3 et son مثال (KNOWLEDGE3), ملاحظة 1 de معارف 1 (KNOW1_REMARK1), la طريقة p. 109 (METHOD), « أستعدّ »
 * (PREP_ITEMS : le produit en croix) et l'exercice 16 (يونس et إيناس, content/exercises.js). Chaque nœud est gardé
 * par l'item de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré ici.
 *
 *   core   six items (notebook, dont « شرط الترتيب » en انتبه) + l'مثال OM/OR ;
 *   guide  تذكّر (الجداء المتصالب), خطأ شائع (قيمتان مقرّبتان), خلاصة.
 *
 *                 [الخاصية في النشاط]                              m1
 *                         │ تصبح خاصية
 *                [الخاصية العكسية لطالس]                           m2
 *          مثال ┌─────────────────────┐ انتبه إلى
 *     [مثال: الشكل OMNPR]       ⚠ [شرط الترتيب]
 *                         ┌──────────┘ وإذا اختلفت النسبتان
 *                  [نسبتان مختلفتان]
 *       تذكّر ┌──────────────┴──────────────┐ نطبّقهما
 *   🔁 [الجداء المتصالب]          [إثبات توازي مستقيمين]          m3
 *                       خطأ شائع ┌──────────┴──────────┐ والعكس
 *                       ⛔ [قيمتان مقرّبتان]   [إثبات عدم التوازي]
 *                                                     │ نستخلص
 *                                                  🎯 [خلاصة]
 */
import { ACTIVITY, KNOWLEDGE3, KNOW1_REMARK1, METHOD, PREP_ITEMS } from './content/textbook';
import { EX } from './content/exercises';

const ex16 = EX['ex-16'];

export const KNOWLEDGE_GRAPH = {
  root: 'nashat',
  nodes: [
    {
      id: 'nashat', kind: 'concept', lane: 'center', requires: 'aksiya-nashat', notebook: true,
      title: 'الخاصية في النشاط', subtitle: "$\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC}$",
      context: { text: ACTIVITY.statement, note: ACTIVITY.remark },
      reveals: ['khassiya'],
    },
    {
      id: 'khassiya', kind: 'relationship', lane: 'center', requires: 'khassiya-aksiya', notebook: true,
      title: 'الخاصية العكسية لطالس', subtitle: "$(B'C') \\parallel (BC)$",
      reveals: ['mithal', 'tartib'],
    },
    {
      id: 'mithal', kind: 'example', lane: 'start', requires: 'khassiya-aksiya',
      title: 'مثال: الشكل OMNPR', subtitle: '$1{,}25$',
      context: { text: KNOWLEDGE3.example[0], note: KNOWLEDGE3.example[1] },
      reveals: [],
    },
    {
      // ⚠ انتبه — un item du manuel (la ملاحظة de معارف 3), porté par un nœud d'avertissement (A.5).
      id: 'tartib', kind: 'warning', lane: 'end', requires: 'shart-tartib', notebook: true,
      title: 'شرط الترتيب', subtitle: "$\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{1}{2}$",
      reveals: ['nisbatan'],
    },
    {
      id: 'nisbatan', kind: 'relationship', lane: 'center', requires: 'nisbatan-mukhtalifatan', notebook: true,
      title: 'نسبتان مختلفتان', subtitle: '$\\dfrac{2}{3} \\neq \\dfrac{1}{2}$',
      context: { text: KNOW1_REMARK1.text, note: KNOW1_REMARK1.answer },
      reveals: ['kasr', 'tariqa'],
    },
    {
      // 🔁 تذكّر — l'item 1 de « أستعدّ » : l'égalité de deux fractions par le produit en croix.
      id: 'kasr', kind: 'prerequisite', lane: 'start', requires: 'nisbatan-mukhtalifatan',
      title: 'الجداء المتصالب', subtitle: '$4 \\times 15 = 6 \\times 10$',
      context: { text: PREP_ITEMS[0].why, note: PREP_ITEMS[1].why },
      reveals: [],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'end', requires: 'tariqa-tawazi', notebook: true,
      title: 'إثبات توازي مستقيمين', subtitle: '$3{,}5 \\times 1{,}8 = 1{,}5 \\times 4{,}2$',
      context: { text: METHOD.ruleParallel[0], list: METHOD.part1 },
      reveals: ['khata', 'adam'],
    },
    {
      // ⛔ خطأ شائع — l'exercice 16 : deux valeurs approchées égales prises pour une preuve.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'tariqa-tawazi',
      title: 'قيمتان مقرّبتان', subtitle: '$\\approx 1{,}7$',
      context: {
        parts: [
          { role: 'wrong', text: ex16.items[0] },
          { role: 'why', text: ex16.commonError },
          { role: 'right', text: ex16.items[1] },
        ],
      },
      reveals: [],
    },
    {
      id: 'adam', kind: 'method', lane: 'end', requires: 'tariqa-adam-tawazi', notebook: true,
      title: 'إثبات عدم التوازي', subtitle: '$16 \\neq 16{,}1$',
      context: { text: METHOD.ruleNotParallel[0], list: METHOD.part2 },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la propriété du manuel et la remarque sur l'ordre, assemblées (A.7).
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-adam-tawazi',
      title: 'خلاصة', subtitle: 'نسبتان + ترتيب',
      context: { text: KNOWLEDGE3.property[3], note: KNOWLEDGE3.remark },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nashat', to: 'khassiya', label: 'تصبح خاصية' },
    { from: 'khassiya', to: 'mithal', label: 'مثال' },
    { from: 'khassiya', to: 'tartib', label: 'انتبه إلى' },
    { from: 'tartib', to: 'nisbatan', label: 'وإذا اختلفت النسبتان' },
    { from: 'nisbatan', to: 'tariqa', label: 'نطبّقهما' },
    { from: 'nisbatan', to: 'kasr', label: 'تذكّر' },
    { from: 'tariqa', to: 'khata', label: 'خطأ شائع' },
    { from: 'tariqa', to: 'adam', label: 'والعكس' },
    { from: 'adam', to: 'khulasa', label: 'نستخلص' },
  ],
};
