/**
 * La carte PROGRESSIVE du درس « النسب المثلثية لزاوية حادة في مثلث قائم » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 et 2 (content/textbook.js ›
 * ACTIVITY, ACTIVITY_2), نشاط 3 (ACT3), معارف 1 et 2 (KNOW1, KNOW2), les طرائق et ce que la plateforme en formalise
 * (METHODS, METHOD_RULE) et le `commonError` de l'exercice 10 (content/exercises.js). Chaque nœud est gardé par l'item
 * de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *                  [جيب تمام زاوية حادة]                  m1
 *                           │ في كل المثلثات القائمة
 *                 [نسب لا تتعلق إلا بالزاوية]              m1
 *                 الجيب ┌───────┴───────┐ الظل
 *            [جيب زاوية حادة]      [ظل زاوية حادة]          m2
 *                 مثال │               │ مضبوطة أم مقرّبة
 *              [EFG، √13]       [القيمة المضبوطة]
 *           الوتر أطول │               │
 *              [بين 0 و 1]             │ نحسب بها
 *             خطأ شائع │               │
 *          ⛔ [جيب تمام > 1؟]  [حساب طول ضلع]              m3
 *                                 مثال ┌──┴──┐ نستخلص
 *                               [BC ≈ 5,92]  🎯 [خلاصة]
 */
import { ACTIVITY_2, KNOW1, KNOW2, METHODS, METHOD_RULE } from './content/textbook';
import { EX } from './content/exercises';

const ex10 = EX['ex-10'];

export const KNOWLEDGE_GRAPH = {
  root: 'cos',
  nodes: [
    {
      id: 'cos', kind: 'definition', lane: 'center', requires: 'cos-nashat', notebook: true,
      title: 'جيب تمام زاوية حادة', subtitle: '$\\cos\\widehat{C} = \\dfrac{AC}{BC}$',
      reveals: ['nisab'],
    },
    {
      id: 'nisab', kind: 'relationship', lane: 'center', requires: 'nisab-zawiya', notebook: true,
      title: 'نسب لا تتعلق إلا بالزاوية', subtitle: '$\\dfrac{AC}{BC} \\approx 0{,}64$',
      reveals: ['jayb', 'thill'],
    },
    {
      id: 'jayb', kind: 'definition', lane: 'start', requires: 'jayb', notebook: true,
      title: 'جيب زاوية حادة', subtitle: '$\\sin\\widehat{B} = \\dfrac{AC}{BC}$',
      reveals: ['mithal'],
    },
    {
      id: 'mithal', kind: 'example', lane: 'start', requires: 'jayb',
      title: 'المثلث EFG', subtitle: '$\\sqrt{13}$',
      context: { text: KNOW1.example2, note: KNOW1.exact },
      reveals: ['hudud'],
    },
    {
      id: 'hudud', kind: 'relationship', lane: 'start', requires: 'hudud', notebook: true,
      title: 'بين 0 و 1', subtitle: '$0 < \\sin\\widehat{B} < 1$',
      reveals: ['khata'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 10 (نبيلة : cos A = 1,5).
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'hudud',
      title: 'جيب تمام أكبر من 1؟', subtitle: '$1{,}5 > 1$',
      context: {
        parts: [
          { role: 'wrong', text: ex10.commonError },
          { role: 'why', text: KNOW1.remark },
          { role: 'right', text: ex10.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'thill', kind: 'definition', lane: 'end', requires: 'thill', notebook: true,
      title: 'ظل زاوية حادة', subtitle: '$\\tan\\widehat{B} = \\dfrac{AC}{AB}$',
      reveals: ['qiyam'],
    },
    {
      id: 'qiyam', kind: 'concept', lane: 'end', requires: 'qiyam-madbuta', notebook: true,
      title: 'القيمة المضبوطة', subtitle: '$\\dfrac{\\sqrt{3}}{3}$',
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'hisab-tul', notebook: true,
      title: 'حساب طول ضلع', subtitle: '$BC = \\dfrac{2{,}5}{\\sin 25^{\\circ}}$',
      reveals: ['mithal-tariqa', 'khulasa'],
    },
    {
      id: 'mithal-tariqa', kind: 'example', lane: 'start', requires: 'hisab-tul',
      title: 'بالجيب', subtitle: '$BC \\approx 5{,}92$',
      context: { text: METHODS.sin.solution[1], note: METHODS.sin.solution[4] },
      reveals: [],
    },
    {
      // 🎯 خلاصة — le choix du rapport (plateforme, déclaré), puis ce que le نشاط 2 a montré.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'hisab-tul',
      title: 'خلاصة', subtitle: '$\\cos$ · $\\sin$ · $\\tan$',
      context: { text: METHOD_RULE.lines[1], note: ACTIVITY_2.conjecture, list: [KNOW2.remark] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'cos', to: 'nisab', label: 'في كل المثلثات القائمة' },
    { from: 'nisab', to: 'jayb', label: 'الجيب' },
    { from: 'nisab', to: 'thill', label: 'الظل' },
    { from: 'jayb', to: 'mithal', label: 'مثال' },
    { from: 'mithal', to: 'hudud', label: 'الوتر أطول' },
    { from: 'hudud', to: 'khata', label: 'خطأ شائع' },
    { from: 'thill', to: 'qiyam', label: 'مضبوطة أم مقرّبة' },
    { from: 'qiyam', to: 'tariqa', label: 'نحسب بها' },
    { from: 'tariqa', to: 'mithal-tariqa', label: 'مثال' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
