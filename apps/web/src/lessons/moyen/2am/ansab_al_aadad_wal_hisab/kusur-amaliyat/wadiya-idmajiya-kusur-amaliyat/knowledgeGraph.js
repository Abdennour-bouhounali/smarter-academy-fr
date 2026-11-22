/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — الكسور والعمليات عليها » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15).
 * Aucune connaissance nouvelle : la DÉMARCHE de la terre de la coopérative (des fractions de la terre et du verger). La SOLUTION n'y figure pas (A.10 règle 14) :
 * tout nœud est gardé par un item du module 7, alors que le module 8 est l'évaluation.
 *
 *                       [ما مساحة التفّاح؟]                       مفهوم
 *                              نفهمها │
 *                       [كسر من ماذا؟]                            فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نرتّب
 *       ⛔ [ثلثان من الأرض]              [ترتيب الحسابات]            طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'kasr-minhu', title: 'ما مساحة التفّاح؟', subtitle: SITUATION.title, context: { text: SITUATION.text }, reveals: ['kasr'] },
    { id: 'kasr', kind: 'idea', lane: 'center', requires: 'kasr-minhu', notebook: true, title: 'كسر من ماذا؟', subtitle: 'من الأرض أو من البستان', context: { text: SITUATION.analysis[0].text }, reveals: ['khata', 'tartib'] },
    {
      // ⛔ خطأ شائع — la question 5 du module 7.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'kasr-minhu',
      title: 'ثلثان من الأرض', subtitle: '$\\frac{2}{3}$ من الأرض كلّها؟',
      context: { parts: [{ role: 'wrong', text: REMARKS.wholeWrong }, { role: 'why', text: REMARKS.wholeWhy }, { role: 'right', text: REMARKS.wholeRight }] },
      reveals: [],
    },
    { id: 'tartib', kind: 'method', lane: 'end', requires: 'tartib-hisab', notebook: true, title: 'ترتيب الحسابات', subtitle: 'المزروع ثم البستان ثم التفّاح', context: { text: SITUATION.analysis[1].text }, reveals: ['khulasa'] },
    { id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ', context: { list: SITUATION.analysis.map((a) => a.label) }, reveals: [] },
  ],
  edges: [
    { from: 'wadiya', to: 'kasr', label: 'نفهمها' },
    { from: 'kasr', to: 'khata', label: 'خطأ شائع' },
    { from: 'kasr', to: 'tartib', label: 'نرتّب' },
    { from: 'khata', to: 'khulasa', label: 'نستخلص' },
    { from: 'tartib', to: 'khulasa', label: 'نستخلص' },
  ],
};
