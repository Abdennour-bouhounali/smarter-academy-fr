/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — مفهوم معادلة » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15).
 * Aucune connaissance nouvelle : la DÉMARCHE de la sortie au musée (un montant fixe, un montant par élève, une inéquation testée, une équation à deux étapes). La SOLUTION n'y figure pas
 * (A.10 règle 14) : tout nœud est gardé par un item du module 7, alors que le module 8 est l'évaluation.
 *
 *                       [كم تكلّف الرحلة؟]                        مفهوم
 *                              نفهمها │
 *                       [ثابت وعن كلّ تلميذ]                      فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نختار
 *       ⛔ [قسمة التكلفة كلّها]          [أيّ حساب لأيّ سؤال]         طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'thabit-wa-liktul', title: 'كم تكلّف الرحلة؟', subtitle: SITUATION.title, context: { text: SITUATION.text }, reveals: ['thabit'] },
    { id: 'thabit', kind: 'idea', lane: 'center', requires: 'thabit-wa-liktul', notebook: true, title: 'ثابت وعن كلّ تلميذ', subtitle: 'الحافلة والتذكرة', context: { text: SITUATION.analysis[0].text }, reveals: ['khata', 'ikhtiyar'] },
    {
      // ⛔ خطأ شائع — la question 6 du module 7.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'ikhtiyar-hisab',
      title: 'قسمة التكلفة كلّها', subtitle: 'هل عدد التلاميذ ناتج قسمة التكلفة على سعر التذكرة؟',
      context: { parts: [{ role: 'wrong', text: REMARKS.trapWrong }, { role: 'why', text: REMARKS.trapWhy }, { role: 'right', text: REMARKS.trapRight }] },
      reveals: [],
    },
    { id: 'ikhtiyar', kind: 'method', lane: 'end', requires: 'ikhtiyar-hisab', notebook: true, title: 'أيّ حساب لأيّ سؤال', subtitle: 'قيمة، متباينة، معادلة', context: { text: SITUATION.analysis[1].text }, reveals: ['khulasa'] },
    { id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ', context: { list: SITUATION.analysis.map((a) => a.label) }, reveals: [] },
  ],
  edges: [
    { from: 'wadiya', to: 'thabit', label: 'نفهمها' },
    { from: 'thabit', to: 'khata', label: 'خطأ شائع' },
    { from: 'thabit', to: 'ikhtiyar', label: 'نختار' },
    { from: 'khata', to: 'khulasa', label: 'نستخلص' },
    { from: 'ikhtiyar', to: 'khulasa', label: 'نستخلص' },
  ],
};
