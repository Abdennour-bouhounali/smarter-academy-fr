/**
 * La carte PROGRESSIVE du درس « الزاوية المحيطية والزاوية المركزية والعلاقة بينهما » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 4 (content/textbook.js › ACTIVITY,
 * ACTIVITY_LINES), معارف 4 (KNOW4), la طريقة de la plateforme (METHOD) et les `commonError` / corrections des exercices
 * 10 et 16 (content/exercises.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de
 * l'إختبار أولي n'est montré.
 *
 *                 [زاوية مركزية وزاوية محيطية]          m1
 *                          │ قال مزيان
 *                 [المركزية ضعف المحيطية]
 *                          │ نعرّفهما
 *                     [تعريف الزاويتين]                 m2
 *              انتبه إلى ┌──────┴──────┐ خاصية 1
 *          ⚠ [رأس خارج الدائرة]   [المحيطية نصف المركزية]
 *                     خطأ شائع ┌──────┴──────┐ نستنتج
 *                  ⛔ [ضعف لا نصف]     [محيطيتان متقايستان]
 *                         انتبه إلى ┌──────┴──────┐ نوظّف
 *                       ⚠ [نفس القوس]     [من القوس إلى الزاوية]   m3
 *                                               │ حالة خاصة
 *                                         [حالة القطر]
 *                                               │ نستخلص
 *                                          🎯 [خلاصة]
 */
import { ACTIVITY, KNOW4, METHOD } from './content/textbook';
import { EX } from './content/exercises';

const ex10 = EX['ex-10-a'];
const ex16 = EX['ex-16-a'];

export const KNOWLEDGE_GRAPH = {
  root: 'tasmiya',
  nodes: [
    {
      id: 'tasmiya', kind: 'concept', lane: 'center', requires: 'tasmiya', notebook: true,
      title: 'زاوية مركزية وزاوية محيطية', subtitle: '$\\widehat{AOB}$ ، $\\widehat{ADB}$',
      reveals: ['alaqa'],
    },
    {
      id: 'alaqa', kind: 'relationship', lane: 'center', requires: 'alaqa-nashat', notebook: true,
      title: 'المركزية ضعف المحيطية', subtitle: '$\\widehat{AOB} = 2\\widehat{ADB}$',
      reveals: ['tarif'],
    },
    {
      id: 'tarif', kind: 'definition', lane: 'center', requires: 'tarif', notebook: true,
      title: 'تعريف الزاويتين', subtitle: 'رأسها المركز أو نقطة من الدائرة',
      reveals: ['ras', 'nisf'],
    },
    {
      // ⚠ انتبه — la condition de la définition (le sommet SUR le cercle), dite par la طريقة et l'exercice 12.
      id: 'ras', kind: 'warning', lane: 'start', requires: 'tarif',
      title: 'رأس خارج الدائرة', subtitle: 'ليست محيطية',
      context: { text: METHOD.notInscribed, note: KNOW4.inscribed },
      reveals: [],
    },
    {
      id: 'nisf', kind: 'relationship', lane: 'end', requires: 'khassiya-nisf', notebook: true,
      title: 'المحيطية نصف المركزية', subtitle: '$\\widehat{AMB} = \\frac{1}{2}\\widehat{AOB}$',
      reveals: ['dif', 'tasawi'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 10, la خاصية 1 et la correction de l'exercice 10.
      id: 'dif', kind: 'common_mistake', lane: 'start', requires: 'khassiya-nisf',
      title: 'ضعف لا نصف', subtitle: '$\\widehat{BOC} = 120^\\circ$',
      context: {
        parts: [
          { role: 'wrong', text: ex10.commonError },
          { role: 'why', text: KNOW4.property1 },
          { role: 'right', text: ex10.question.rows[0].correction },
        ],
      },
      reveals: [],
    },
    {
      id: 'tasawi', kind: 'relationship', lane: 'end', requires: 'khassiya-tasawi', notebook: true,
      title: 'محيطيتان تحصران نفس القوس', subtitle: '$\\widehat{AMB} = \\widehat{ANB}$',
      reveals: ['qaws', 'tariqa'],
    },
    {
      // ⚠ انتبه — « le même arc » : l'étape 2 de la طريقة et le `commonError` de l'exercice 16.
      id: 'qaws', kind: 'warning', lane: 'start', requires: 'khassiya-tasawi',
      title: 'نفس القوس', subtitle: 'القوس لا يحوي الرأس',
      context: { text: METHOD.steps[1], note: ex16.commonError },
      reveals: [],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'end', requires: 'tariqa-qaws', notebook: true,
      title: 'من القوس إلى الزاوية', subtitle: 'الرأس ثم القوس ثم الزاوية',
      reveals: ['qutr'],
    },
    {
      id: 'qutr', kind: 'relationship', lane: 'center', requires: 'qutr-qaima', notebook: true,
      title: 'حالة القطر', subtitle: '$\\widehat{BAC} = 90^\\circ$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les deux propriétés du manuel, au mot près, et la conclusion du نشاط 4.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'qutr-qaima',
      title: 'خلاصة', subtitle: 'نصف المركزية',
      context: { text: KNOW4.property1, note: ACTIVITY.closing },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tasmiya', to: 'alaqa', label: 'قال مزيان' },
    { from: 'alaqa', to: 'tarif', label: 'نعرّفهما' },
    { from: 'tarif', to: 'ras', label: 'انتبه إلى' },
    { from: 'tarif', to: 'nisf', label: 'خاصية 1' },
    { from: 'nisf', to: 'dif', label: 'خطأ شائع' },
    { from: 'nisf', to: 'tasawi', label: 'نستنتج' },
    { from: 'tasawi', to: 'qaws', label: 'انتبه إلى' },
    { from: 'tasawi', to: 'tariqa', label: 'نوظّف' },
    { from: 'tariqa', to: 'qutr', label: 'حالة خاصة' },
    { from: 'qutr', to: 'khulasa', label: 'نستخلص' },
  ],
};
