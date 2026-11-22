/**
 * La carte PROGRESSIVE du درس « خاصية طالس وحساب الأطوال » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 (content/textbook.js ›
 * ACTIVITY), معارف 1 et 2 (KNOW1, KNOW2), la طريقة et ce que la plateforme en formalise (METHOD, METHOD_RULE)
 * et les `commonError` des exercices 2 et 5 (content/exercises.js). Chaque nœud est gardé par l'item de
 * knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *                 [خاصية طالس — نص النشاط]           m1
 *                          │ يصبح خاصية
 *                    [خاصية طالس]                    m2
 *          ثلاث وضعيات ┌────┴──────┐ إذا اختلفت نسبتان
 *          [ثلاث وضعيات]       [نسبتان غير متساويتين]
 *       خطأ شائع │                    │ النسبة المشتركة
 *   ⛔ [قطعة أم ضلع؟]            [معامل التناسبية k]
 *                            مثال ┌─────┴─────┐ خطأ شائع
 *                          [k = 1/3]     ⛔ [تكبير أم تصغير؟]
 *                                 │ نحسب بها
 *                          [حساب طول]                m3
 *                     مثال ┌─────┴─────┐ نستخلص
 *                    [DN = 2,5]     🎯 [خلاصة]
 */
import { ACTIVITY, KNOW1, KNOW2, METHOD, METHOD_RULE } from './content/textbook';
import { EX } from './content/exercises';

const ex2 = EX['ex-2'];
const ex5c = EX['ex-5-c'];

export const KNOWLEDGE_GRAPH = {
  root: 'nashat',
  nodes: [
    {
      id: 'nashat', kind: 'concept', lane: 'center', requires: 'talis-nashat', notebook: true,
      title: 'نص النشاط: خاصية طالس', subtitle: "$\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC}$",
      reveals: ['khassiya'],
    },
    {
      id: 'khassiya', kind: 'relationship', lane: 'center', requires: 'khassiyat-talis', notebook: true,
      title: 'خاصية طالس', subtitle: '$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$',
      reveals: ['thalath', 'adam'],
    },
    {
      id: 'thalath', kind: 'example', lane: 'start', requires: 'khassiyat-talis',
      title: 'ثلاث وضعيات', subtitle: 'M و N',
      context: { text: KNOW1.property, list: KNOW1.positions },
      reveals: ['khata-qitaa'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 2 : la قطعة BE au lieu du côté AE.
      id: 'khata-qitaa', kind: 'common_mistake', lane: 'start', requires: 'khassiyat-talis',
      title: 'قطعة أم ضلع؟', subtitle: '$\\dfrac{AB}{AE}$',
      context: {
        parts: [
          { role: 'wrong', text: ex2.commonError },
          { role: 'why', text: KNOW1.resultsRows },
          { role: 'right', text: ex2.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'adam', kind: 'relationship', lane: 'end', requires: 'adam-tawazi', notebook: true,
      title: 'نسبتان غير متساويتين', subtitle: '$\\dfrac{2}{3} \\neq \\dfrac{1}{2}$',
      reveals: ['muamil'],
    },
    {
      id: 'muamil', kind: 'definition', lane: 'center', requires: 'muamil-tanasub', notebook: true,
      title: 'معامل التناسبية k', subtitle: "$AB' = k \\times AB$",
      reveals: ['mithal-k', 'tariqa'],
    },
    {
      id: 'mithal-k', kind: 'example', lane: 'start', requires: 'muamil-tanasub',
      title: 'تصغير بمعامل الثلث', subtitle: '$k = \\dfrac{1}{3}$',
      context: { text: KNOW2.example, note: KNOW2.correction },
      reveals: ['khata-k'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 5 : 1/3 donné comme coefficient d'agrandissement.
      id: 'khata-k', kind: 'common_mistake', lane: 'start', requires: 'muamil-tanasub',
      title: 'تكبير أم تصغير؟', subtitle: '$k > 1$',
      context: {
        parts: [
          { role: 'wrong', text: ex5c.commonError },
          { role: 'why', text: KNOW2.lines[4] },
          { role: 'right', text: KNOW2.lines[5] },
        ],
      },
      reveals: [],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'hisab-atwal', notebook: true,
      title: 'حساب طول', subtitle: '$\\dfrac{MA}{MD} = \\dfrac{AB}{DN}$',
      reveals: ['mithal-tariqa', 'khulasa'],
    },
    {
      id: 'mithal-tariqa', kind: 'example', lane: 'start', requires: 'hisab-atwal',
      title: 'متوازي الأضلاع ABCD', subtitle: '$DN = 2{,}5$',
      context: { text: METHOD.solution[1], note: METHOD.solution[2] },
      reveals: [],
    },
    {
      // 🎯 خلاصة — le texte du نشاط 1, puis ce que la propriété permet (ملاحظة 2).
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'hisab-atwal',
      title: 'خلاصة', subtitle: '$k$',
      context: { text: ACTIVITY.statement, note: KNOW1.remark2, list: [METHOD_RULE.lines[2]] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nashat', to: 'khassiya', label: 'يصبح خاصية' },
    { from: 'khassiya', to: 'thalath', label: 'ثلاث وضعيات' },
    { from: 'thalath', to: 'khata-qitaa', label: 'خطأ شائع' },
    { from: 'khassiya', to: 'adam', label: 'إذا اختلفت نسبتان' },
    { from: 'adam', to: 'muamil', label: 'النسبة المشتركة' },
    { from: 'muamil', to: 'mithal-k', label: 'مثال' },
    { from: 'mithal-k', to: 'khata-k', label: 'خطأ شائع' },
    { from: 'muamil', to: 'tariqa', label: 'نحسب بها' },
    { from: 'tariqa', to: 'mithal-tariqa', label: 'مثال' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
