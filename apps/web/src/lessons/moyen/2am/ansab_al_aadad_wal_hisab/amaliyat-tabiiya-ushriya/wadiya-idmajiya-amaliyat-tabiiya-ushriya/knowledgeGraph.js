/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15). Aucune connaissance nouvelle :
 * la DÉMARCHE de l'atelier de nichoirs (diviser chaque matière, garder la plus petite, décider). La SOLUTION n'y figure pas (A.10 règle 14) : tout nœud est gardé par un item du module 7.
 *
 *                       [ماذا نصنع؟]                               مفهوم
 *                              نفهمها │
 *                       [كلّ مادّة وحدها]                          فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نرتّب
 *       ⛔ [نأخذ الأكبر]            [نأخذ الأصغر]                  طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'kull-madda', title: 'ماذا يصنع النادي؟', subtitle: SITUATION.title, context: { text: SITUATION.text }, reveals: ['kull'] },
    { id: 'kull', kind: 'idea', lane: 'center', requires: 'kull-madda', notebook: true, title: 'كلّ مادّة وحدها', subtitle: 'مخزون وحاجة لكلّ مادّة', context: { text: SITUATION.analysis[0].text }, reveals: ['khata', 'asghar'] },
    {
      // ⛔ خطأ شائع — la question 4 du module 7.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'al-asghar',
      title: 'نأخذ الأكبر', subtitle: 'هل يعوّض الوفير ما نفد؟',
      context: { parts: [{ role: 'wrong', text: REMARKS.maxWrong }, { role: 'why', text: REMARKS.maxWhy }, { role: 'right', text: REMARKS.minWhy }] },
      reveals: [],
    },
    { id: 'asghar', kind: 'method', lane: 'end', requires: 'al-asghar', notebook: true, title: 'نأخذ الأصغر', subtitle: 'نقسم ثم نقارن ثم نحسب الباقي', context: { text: SITUATION.analysis[1].text }, reveals: ['khulasa'] },
    { id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ', context: { list: SITUATION.analysis.map((a) => a.label) }, reveals: [] },
  ],
  edges: [
    { from: 'wadiya', to: 'kull', label: 'نفهمها' },
    { from: 'kull', to: 'khata', label: 'خطأ شائع' },
    { from: 'kull', to: 'asghar', label: 'نرتّب' },
    { from: 'khata', to: 'khulasa', label: 'نستخلص' },
    { from: 'asghar', to: 'khulasa', label: 'نستخلص' },
  ],
};
