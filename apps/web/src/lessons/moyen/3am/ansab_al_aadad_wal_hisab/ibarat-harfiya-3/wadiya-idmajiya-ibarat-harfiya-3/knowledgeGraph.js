/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — الحساب الحرفي » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15). Aucune connaissance nouvelle : la DÉMARCHE de la piste
 * de l'école (écrire en lettres, simplifier la différence, décider). La SOLUTION n'y figure pas (A.10 règle 14) : tout nœud est gardé par un item du module 7, le module 8 est l'évaluation.
 *
 *                       [لماذا تتقدّم ريم؟]                        مفهوم
 *                              نفهمها │
 *                       [ما الذي يتغيّر؟]                          فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نرتّب
 *       ⛔ [نجرّب عددين فقط]            [نكتب بالحروف]                طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'ma-yataghayyar', title: 'لماذا تتقدّم ريم؟', subtitle: SITUATION.title, context: { text: SITUATION.text }, reveals: ['taghyir'] },
    { id: 'taghyir', kind: 'idea', lane: 'center', requires: 'ma-yataghayyar', notebook: true, title: 'ما الذي يتغيّر؟', subtitle: 'نصفا الدائرة لا المستقيمان', context: { text: SITUATION.analysis[0].text }, reveals: ['khata', 'huruf'] },
    {
      // ⛔ خطأ شائع — la question 4 du module 7.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'bil-huruf',
      title: 'نجرّب عددين فقط', subtitle: 'هل يحكم عددان على كل مضمار؟',
      context: { parts: [{ role: 'wrong', text: REMARKS.valueWrong }, { role: 'why', text: REMARKS.valueWhy }, { role: 'right', text: REMARKS.letterWhy }] },
      reveals: [],
    },
    { id: 'huruf', kind: 'method', lane: 'end', requires: 'bil-huruf', notebook: true, title: 'نكتب بالحروف', subtitle: 'نكتب ثم نبسّط ثم نعوّض', context: { text: SITUATION.analysis[1].text }, reveals: ['khulasa'] },
    { id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ', context: { list: SITUATION.analysis.map((a) => a.label) }, reveals: [] },
  ],
  edges: [
    { from: 'wadiya', to: 'taghyir', label: 'نفهمها' },
    { from: 'taghyir', to: 'khata', label: 'خطأ شائع' },
    { from: 'taghyir', to: 'huruf', label: 'نرتّب' },
    { from: 'khata', to: 'khulasa', label: 'نستخلص' },
    { from: 'huruf', to: 'khulasa', label: 'نستخلص' },
  ],
};
