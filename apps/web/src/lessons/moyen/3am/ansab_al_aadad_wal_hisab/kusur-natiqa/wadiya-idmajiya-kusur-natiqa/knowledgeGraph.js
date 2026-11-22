/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15).
 * Aucune connaissance nouvelle : la DÉMARCHE de la tirelire de Meriem (des fractions du tout et du reste). La SOLUTION n'y figure pas (A.10 règle 14) :
 * tout nœud est gardé par un item du module 7, alors que le module 8 est l'évaluation.
 *
 *                       [كم ادّخرت مريم؟]                         مفهوم
 *                              نفهمها │
 *                       [كسر من ماذا؟]                            فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نرتّب
 *       ⛔ [ثلاثة أخماس الكلّ]            [ترتيب الحسابات]            طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'kasr-minhu', title: 'كم ادّخرت مريم؟', subtitle: SITUATION.title, context: { text: SITUATION.text }, reveals: ['kasr'] },
    { id: 'kasr', kind: 'idea', lane: 'center', requires: 'kasr-minhu', notebook: true, title: 'كسر من ماذا؟', subtitle: 'من الكلّ أو من الباقي', context: { text: SITUATION.analysis[0].text }, reveals: ['khata', 'tartib'] },
    {
      // ⛔ خطأ شائع — la question 5 du module 7.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'kasr-minhu',
      title: 'ثلاثة أخماس الكلّ', subtitle: '$\\frac{3}{5}$ من المبلغ كلّه؟',
      context: { parts: [{ role: 'wrong', text: REMARKS.wholeWrong }, { role: 'why', text: REMARKS.wholeWhy }, { role: 'right', text: REMARKS.wholeRight }] },
      reveals: [],
    },
    { id: 'tartib', kind: 'method', lane: 'end', requires: 'tartib-hisab', notebook: true, title: 'ترتيب الحسابات', subtitle: 'المُنفَق ثم الباقي ثم الهدية', context: { text: SITUATION.analysis[1].text }, reveals: ['khulasa'] },
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
