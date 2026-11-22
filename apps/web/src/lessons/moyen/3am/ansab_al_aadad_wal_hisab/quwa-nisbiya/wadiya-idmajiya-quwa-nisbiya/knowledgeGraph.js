/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15).
 * Aucune connaissance nouvelle : la DÉMARCHE de la feuille d'or de Nour (unifier l'unité, diviser deux longueurs, lire l'ordre de grandeur). La SOLUTION n'y figure pas (A.10 règle 14) :
 * tout nœud est gardé par un item du module 7, alors que le module 8 est l'évaluation.
 *
 *                       [كم طبقة من الذرّات؟]                    مفهوم
 *                              نفهمها │
 *                       [نوحّد الوحدة أوّلًا]                    فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نقسم
 *       ⛔ [pm و µm كما هما]            [كم مرّة؟ قسمة طولين]      طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'wahda-mushtaraka', title: 'كم طبقة من الذرّات؟', subtitle: SITUATION.title, context: { text: SITUATION.text }, reveals: ['wahda'] },
    { id: 'wahda', kind: 'idea', lane: 'center', requires: 'wahda-mushtaraka', notebook: true, title: 'نوحّد الوحدة أوّلًا', subtitle: 'المتر وقوى العدد 10', context: { text: SITUATION.analysis[0].text }, reveals: ['khata', 'qisma'] },
    {
      // ⛔ خطأ شائع — la question 4 du module 7.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'wahda-mushtaraka',
      title: 'نقسم دون تحويل', subtitle: '$\\mu\\mathrm{m}$ على $\\mathrm{pm}$ كما هما؟',
      context: { parts: [{ role: 'wrong', text: 'نقسم $0{,}1$ على $288$ لأنّهما العددان المكتوبان.' }, { role: 'why', text: REMARKS.unitWhy }, { role: 'right', text: REMARKS.unitRight }] },
      reveals: [],
    },
    { id: 'qisma', kind: 'method', lane: 'end', requires: 'qisma-tulayn', notebook: true, title: 'كم مرّة؟ قسمة طولين', subtitle: 'السُّمك على القطر', context: { text: SITUATION.analysis[1].text }, reveals: ['khulasa'] },
    { id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'rutba-ilmiya', notebook: true, title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ', context: { list: SITUATION.analysis.map((a) => a.label) }, reveals: [] },
  ],
  edges: [
    { from: 'wadiya', to: 'wahda', label: 'نفهمها' },
    { from: 'wahda', to: 'khata', label: 'خطأ شائع' },
    { from: 'wahda', to: 'qisma', label: 'نقسم' },
    { from: 'khata', to: 'khulasa', label: 'نستخلص' },
    { from: 'qisma', to: 'khulasa', label: 'نستخلص' },
  ],
};
