/**
 * La carte PROGRESSIVE du درس « خاصية فيثاغورس » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_SIDE`, `METHOD_NOT_RIGHT`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                         [آلة الأحواض] (M1)
 *                                │ تمتلئ تمامًا
 *                         [خاصية فيثاغورس] (M1)
 *                 وإلّا │                    │ نحسب
 *          [غير قائم] (M1)            [حساب الوتر] (M1) ── خطأ شائع ⛔ [نجمع الأطوال؟]
 *                                   نسمّي │
 *                              [الوتر] (M2)
 *              أطول ضلع │                 │ وبالطرح
 *     [أُثبت: غير قائم] (M3)        [حساب ضلع قائم] (M3) ── خطأ شائع ⛔ [وتر خاطئ]
 *          خطأ شائع │                      │ ثم
 *     ⛔ [يبدو قائما؟]                 [اللمسة √] (M3) ── نستخلص ── 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_SIDE, METHOD_NOT_RIGHT, GUIDE } from './content/textbook';

const parts = (g) => ({ parts: [{ role: 'wrong', text: g.wrong }, { role: 'why', text: g.why }, { role: 'right', text: g.right }] });

export const KNOWLEDGE_GRAPH = {
  root: 'aala',
  nodes: [
    {
      id: 'aala', kind: 'concept', lane: 'center', requires: 'fitaghuras',
      title: 'آلة الأحواض', subtitle: 'ماء ومربعات',
      context: { text: KNOWLEDGE.machine.text },
      reveals: ['fitaghuras'],
    },
    {
      id: 'fitaghuras', kind: 'relationship', lane: 'center', requires: 'fitaghuras', notebook: true,
      title: 'خاصية فيثاغورس', subtitle: '$BC^2=AB^2+AC^2$',
      context: { text: KNOWLEDGE.property.text },
      reveals: ['ghayrQaim', 'hisabWatar'],
    },
    {
      id: 'ghayrQaim', kind: 'relationship', lane: 'start', requires: 'ghayr-qaim', notebook: true,
      title: 'غير قائم', subtitle: 'مساواة لا تتحقّق',
      context: { text: KNOWLEDGE.notRight.text },
      reveals: [],
    },
    {
      id: 'ithbat', kind: 'method', lane: 'start', requires: 'ithbat-ghayr-qaim', notebook: true,
      title: 'أُثبت أنّه غير قائم', subtitle: 'أطول الأضلاع',
      context: { text: METHOD_NOT_RIGHT.exercise, note: METHOD_NOT_RIGHT.rule },
      reveals: ['khataYabdu'],
    },
    {
      // ⛔ خطأ شائع — juger « à l'œil » (`GUIDE.looksRight`).
      id: 'khataYabdu', kind: 'common_mistake', lane: 'start', requires: 'ithbat-ghayr-qaim',
      title: 'يبدو قائما؟', subtitle: '',
      context: parts(GUIDE.looksRight),
      reveals: [],
    },
    {
      id: 'watar', kind: 'concept', lane: 'start', requires: 'watar', notebook: true,
      title: 'الوتر', subtitle: 'يقابل الزاوية القائمة',
      context: { text: KNOWLEDGE.hypotenuse.text, note: KNOWLEDGE.onlyRight.text },
      reveals: ['hisabDil', 'ithbat'],
    },
    {
      // ⛔ خطأ شائع — un côté de l'angle droit pris pour l'hypoténuse (`GUIDE.wrongHyp`).
      id: 'khataWatar', kind: 'common_mistake', lane: 'end', requires: 'hisab-dil',
      title: 'وتر خاطئ', subtitle: '',
      context: parts(GUIDE.wrongHyp),
      reveals: [],
    },
    {
      id: 'hisabWatar', kind: 'method', lane: 'end', requires: 'hisab-watar', notebook: true,
      title: 'حساب الوتر', subtitle: 'نجمع المربعين',
      context: { text: KNOWLEDGE.computeSide.text },
      reveals: ['khataJam', 'watar'],
    },
    {
      // ⛔ خطأ شائع — additionner les longueurs (`GUIDE.addLengths`).
      id: 'khataJam', kind: 'common_mistake', lane: 'end', requires: 'hisab-watar',
      title: 'نجمع الأطوال؟', subtitle: '',
      context: parts(GUIDE.addLengths),
      reveals: [],
    },
    {
      id: 'hisabDil', kind: 'method', lane: 'end', requires: 'hisab-dil', notebook: true,
      title: 'حساب ضلع قائم', subtitle: 'نطرح المربعين',
      context: { text: METHOD_SIDE.solution[3], note: METHOD_SIDE.rule },
      reveals: ['lamsa', 'khataWatar'],
    },
    {
      id: 'lamsa', kind: 'method', lane: 'center', requires: 'lamsa-jidhr', notebook: true,
      title: 'اللمسة √', subtitle: 'مضبوطة ومقرّبة',
      context: { text: KNOWLEDGE.root.text },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'lamsa-jidhr',
      title: 'الخلاصة', subtitle: 'مثلث قائم ومربعات',
      context: { text: 'في مثلث قائم مربع الوتر هو مجموع مربعي الضلعين الآخرين: نحسب به الوتر بالجمع والضلع القائم بالطرح، ونأخذ الطول بالآلة الحاسبة؛ وإذا لم تتحقّق المساواة لأطول الأضلاع فالمثلث غير قائم.', note: KNOWLEDGE.notRight.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'aala', to: 'fitaghuras', label: 'تمتلئ تمامًا' },
    { from: 'fitaghuras', to: 'ghayrQaim', label: 'وإلّا' },
    { from: 'fitaghuras', to: 'hisabWatar', label: 'نحسب' },
    { from: 'hisabWatar', to: 'khataJam', label: 'خطأ شائع' },
    { from: 'hisabWatar', to: 'watar', label: 'نسمّي' },
    { from: 'watar', to: 'hisabDil', label: 'وبالطرح' },
    { from: 'watar', to: 'ithbat', label: 'أطول ضلع' },
    { from: 'ithbat', to: 'khataYabdu', label: 'خطأ شائع' },
    { from: 'hisabDil', to: 'lamsa', label: 'ثم' },
    { from: 'hisabDil', to: 'khataWatar', label: 'خطأ شائع' },
    { from: 'lamsa', to: 'khulasa', label: 'نستخلص' },
  ],
};
