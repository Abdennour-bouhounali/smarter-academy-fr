/**
 * La carte PROGRESSIVE du درس « مساحة الكرة وحجم الجلة » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — Archimède (content/textbook.js › ARCH_LINES,
 * ACTIVITY), معارف 2 (KNOW2), la règle de l'arrondi (QIMA), les طرائق déclarées (METHOD, METHOD_INVERSE), les erreurs que
 * les modules corrigent (MISTAKES). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit. Rien du إختبار.
 *
 *          [القشرة: 4 أقراص]                       m1
 *                 │ ومن العصير
 *          [العصير: الثلثان]
 *                 │ نصوغ
 *            [مساحة الكرة]                          m2
 *     خطأ شائع ┌──────┤ ومعها
 *  ⛔ [قرص واحد؟]  [حجم الجلة]
 *                      │ نحسب بـ
 *              [المضبوطة والمدوّرة]
 *                انتبه إلى ┌──┤ طريقة
 *          ⚠ [في آخر الحساب]  [من القطر]            m3
 *                  خطأ شائع ┌──┤ العكس
 *             ⛔ [القطر بدل نصف القطر] [من المساحة إلى R]
 *                                │ نستخلص
 *                             🎯 [خلاصة]
 */
import { ARCH_LINES, ACTIVITY, KNOW2, QIMA, METHOD, MISTAKES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'qishra',
  nodes: [
    {
      id: 'qishra', kind: 'concept', lane: 'center', requires: 'arkhimidis-misaha', notebook: true,
      title: 'القشرة: أربعة أقراص', subtitle: '$4 \\times \\pi R^2$',
      reveals: ['asir'],
    },
    {
      id: 'asir', kind: 'concept', lane: 'center', requires: 'arkhimidis-hajm', notebook: true,
      title: 'العصير: ثلثا الأسطوانة', subtitle: '$\\frac{2}{3} \\times 2\\pi R^3$',
      reveals: ['misaha'],
    },
    {
      id: 'misaha', kind: 'definition', lane: 'center', requires: 'misahat-kura', notebook: true,
      title: 'مساحة الكرة', subtitle: '$\\mathcal{A} = 4\\pi R^2$',
      reveals: ['khataQurs', 'hajm'],
    },
    {
      // ⛔ خطأ شائع — un seul disque : le lab le refuse (« قرص واحد فقط »), la brique d'Archimède dit pourquoi.
      id: 'khataQurs', kind: 'common_mistake', lane: 'end', requires: 'misahat-kura',
      title: 'قرص واحد؟', subtitle: '$\\pi R^2$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.qurs.wrong },
          { role: 'why', text: ARCH_LINES.areaEqual },
          { role: 'right', text: MISTAKES.qurs.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'hajm', kind: 'definition', lane: 'start', requires: 'hajm-julla', notebook: true,
      title: 'حجم الجلة', subtitle: '$\\mathcal{V} = \\frac{4}{3}\\pi R^3$',
      reveals: ['qima'],
    },
    {
      id: 'qima', kind: 'relationship', lane: 'center', requires: 'qima-muqarraba', notebook: true,
      title: 'المضبوطة والمدوّرة', subtitle: 'بدلالة π ثم ندوّر',
      reveals: ['tadwir', 'thisab'],
    },
    {
      // ⚠ انتبه — arrondir à la fin seulement (la ligne 5 de la طريقة).
      id: 'tadwir', kind: 'warning', lane: 'end', requires: 'qima-muqarraba',
      title: 'ندوّر في آخر الحساب',
      context: { text: QIMA.exact, note: METHOD.solution[4] },
      reveals: [],
    },
    {
      id: 'thisab', kind: 'method', lane: 'start', requires: 'tariqa-hisab', notebook: true,
      title: 'من القطر إلى المساحة', subtitle: '$R = D \\div 2$',
      reveals: ['khataQutr', 'aksiya'],
    },
    {
      // ⛔ خطأ شائع — le diamètre substitué au rayon ; le لماذا est la ligne 1 de la طريقة.
      id: 'khataQutr', kind: 'common_mistake', lane: 'start', requires: 'tariqa-hisab',
      title: 'القطر بدل نصف القطر', subtitle: '$256\\pi \\neq 64\\pi$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.qutr.wrong },
          { role: 'why', text: METHOD.solution[0] },
          { role: 'right', text: MISTAKES.qutr.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'aksiya', kind: 'method', lane: 'center', requires: 'tariqa-aksiya', notebook: true,
      title: 'من المساحة إلى نصف القطر', subtitle: '$R^2 = \\frac{k}{4}$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — Archimède en une phrase, puis les deux définitions du manuel.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tariqa-aksiya',
      title: 'خلاصة', subtitle: '$4\\pi R^2$ · $\\frac{4}{3}\\pi R^3$',
      context: { text: ACTIVITY.closing, note: KNOW2.volume },
      reveals: [],
    },
  ],
  edges: [
    { from: 'qishra', to: 'asir', label: 'ومن العصير' },
    { from: 'asir', to: 'misaha', label: 'نصوغ' },
    { from: 'misaha', to: 'khataQurs', label: 'خطأ شائع' },
    { from: 'misaha', to: 'hajm', label: 'ومعها' },
    { from: 'hajm', to: 'qima', label: 'نحسب بـ' },
    { from: 'qima', to: 'tadwir', label: 'انتبه إلى' },
    { from: 'qima', to: 'thisab', label: 'طريقة' },
    { from: 'thisab', to: 'khataQutr', label: 'خطأ شائع' },
    { from: 'thisab', to: 'aksiya', label: 'العكس' },
    { from: 'aksiya', to: 'khulasa', label: 'نستخلص' },
  ],
};
