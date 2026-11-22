/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — الأعداد النسبية » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15).
 * Aucune connaissance nouvelle : la DÉMARCHE de la situation de Sétif et Montréal (comparer deux températures de deux échelles). La SOLUTION n'y figure pas (A.10 règle 14) :
 * tout nœud est gardé par un item du module 7, alors que le module 8 est l'évaluation.
 *
 *                      [أيّ المدينتين أشدّ برودة؟]                 مفهوم
 *                              نفهمها │
 *                       [سلّمان مختلفان]                         فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نحوّل
 *          ⛔ [مقارنة مباشرة]            [عكس سلسلة]              طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'saffan-wahid', title: 'أيّ المدينتين أشدّ برودة؟', subtitle: SITUATION.title, context: { text: SITUATION.text }, reveals: ['saffan'] },
    { id: 'saffan', kind: 'idea', lane: 'center', requires: 'saffan-wahid', notebook: true, title: 'سلّمان مختلفان', subtitle: 'سيلسيوس وفهرنهايت', context: { text: SITUATION.analysis[0].text }, reveals: ['khata', 'aksiya'] },
    {
      // ⛔ خطأ شائع — la question 3 du module 7.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'saffan-wahid',
      title: 'مقارنة مباشرة', subtitle: '$-3$ و $-13$',
      context: { parts: [{ role: 'wrong', text: REMARKS.scaleWrong }, { role: 'why', text: REMARKS.scaleWhy }, { role: 'right', text: REMARKS.scaleRight }] },
      reveals: [],
    },
    { id: 'aksiya', kind: 'method', lane: 'end', requires: 'silsila-aksiya', notebook: true, title: 'عكس سلسلة حسابات', subtitle: 'نطرح 32 ثم نقسم على 1,8', context: { text: SITUATION.analysis[1].text }, reveals: ['khulasa'] },
    { id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ', context: { list: SITUATION.analysis.map((a) => a.label) }, reveals: [] },
  ],
  edges: [
    { from: 'wadiya', to: 'saffan', label: 'نفهمها' },
    { from: 'saffan', to: 'khata', label: 'خطأ شائع' },
    { from: 'saffan', to: 'aksiya', label: 'نحوّل' },
    { from: 'khata', to: 'khulasa', label: 'نستخلص' },
    { from: 'aksiya', to: 'khulasa', label: 'نستخلص' },
  ],
};
