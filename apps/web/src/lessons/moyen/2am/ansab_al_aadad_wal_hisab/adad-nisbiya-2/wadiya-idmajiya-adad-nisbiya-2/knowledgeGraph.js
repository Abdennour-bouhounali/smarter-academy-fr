/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — الأعداد النسبية » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15).
 * Aucune connaissance nouvelle : la DÉMARCHE du camp d'hiver à Djelfa (quel calcul répond à quelle question). La SOLUTION n'y figure pas (A.10 règle 14) :
 * tout nœud est gardé par un item du module 7, alors que le module 8 est l'évaluation.
 *
 *                       [ماذا نريد أن نعرف؟]                      مفهوم
 *                              نفهمها │
 *                       [أيّ حساب لأيّ سؤال؟]                     فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نرتّب
 *       ⛔ [القديم ناقص الجديد]          [التغيّرات ثم مجموعها]        طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'ikhtiyar-hisab', title: 'ماذا نريد أن نعرف؟', subtitle: SITUATION.title, context: { text: SITUATION.analysis[0].text }, reveals: ['hisab'] },
    { id: 'hisab', kind: 'idea', lane: 'center', requires: 'ikhtiyar-hisab', notebook: true, title: 'أيّ حساب لأيّ سؤال؟', subtitle: 'ترتيب · مسافة · تغيّر · مجموع', context: { text: SITUATION.analysis[1].text }, reveals: ['khata', 'tartib'] },
    {
      // ⛔ خطأ شائع — la question 6 du module 7.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'ikhtiyar-hisab',
      title: 'القديم ناقص الجديد', subtitle: 'تغيّر بعد ارتفاع يخرج سالبًا',
      context: { parts: [{ role: 'wrong', text: REMARKS.oldNewWrong }, { role: 'why', text: REMARKS.oldNewWhy }, { role: 'right', text: REMARKS.oldNewRight }] },
      reveals: [],
    },
    { id: 'tartib', kind: 'method', lane: 'end', requires: 'taghayyur-wa-majmu', notebook: true, title: 'التغيّرات ثم مجموعها', subtitle: 'الجديد ناقص القديم ثم المجموع الجبري', context: { text: SITUATION.analysis[2].text }, reveals: ['khulasa'] },
    { id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya-2', notebook: true, title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ', context: { list: SITUATION.analysis.map((a) => a.label) }, reveals: [] },
  ],
  edges: [
    { from: 'wadiya', to: 'hisab', label: 'نفهمها' },
    { from: 'hisab', to: 'khata', label: 'خطأ شائع' },
    { from: 'hisab', to: 'tartib', label: 'نرتّب' },
    { from: 'khata', to: 'khulasa', label: 'نستخلص' },
    { from: 'tartib', to: 'khulasa', label: 'نستخلص' },
  ],
};
