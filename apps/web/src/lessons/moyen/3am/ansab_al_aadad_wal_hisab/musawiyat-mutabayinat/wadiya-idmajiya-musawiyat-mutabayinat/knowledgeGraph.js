/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي — المساويات – المتباينات – المعادلات » — la séance d'INTÉGRATION de l'unité (KNOWLEDGE_MAP.md, Part A, A.15).
 * Aucune connaissance nouvelle : la DÉMARCHE de la poursuite de Tipaza (traduire, résoudre, vérifier, décider). Les valeurs du module 8 (les deux camions) n'y figurent pas :
 * tout nœud est gardé par un item du module 7.
 *
 *                       [متى يلحق رضا بياسين؟]                     مفهوم
 *                              نفهمها │
 *                       [نترجم ثم نساوي]                           فكرة أساسية
 *                  خطأ شائع ┌────────┴────────┐ نحلّ
 *       ⛔ [نجمع السرعتين]            [نحلّ ونتحقّق]                طريقة
 *                  نستخلص │                  │ نقرّر
 *                         │             [نقرّر بمتباينة]           طريقة
 *                         └─────┬───────────┘ نستخلص
 *                         🎯 [أربعة أوقات]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    { id: 'wadiya', kind: 'concept', lane: 'center', requires: 'tarjama-muadala', title: 'متى يلحق رضا بياسين؟', subtitle: SITUATION.title, context: { text: SITUATION.text }, reveals: ['tarjama'] },
    { id: 'tarjama', kind: 'idea', lane: 'center', requires: 'tarjama-muadala', notebook: true, title: 'نترجم ثم نساوي', subtitle: 'مجهول ثم معادلة', context: { text: SITUATION.analysis[1].text }, reveals: ['khata', 'hall'] },
    {
      // ⛔ خطأ شائع — جمع السرعتين بدل المساواة بين بعدين.
      id: 'khata', kind: 'common_mistake', lane: 'start', requires: 'tarjama-muadala',
      title: 'نجمع السرعتين', subtitle: '$40t + 36t = 2$ ؟',
      context: { parts: [{ role: 'wrong', text: REMARKS.sumWrong }, { role: 'why', text: REMARKS.sumWhy }, { role: 'right', text: REMARKS.sumRight }] },
      reveals: [],
    },
    { id: 'hall', kind: 'method', lane: 'end', requires: 'hall-wa-tahaqqaq', notebook: true, title: 'نحلّ ونتحقّق', subtitle: 'ثم نعوّض في الطرفين', context: { text: SITUATION.analysis[2].text }, reveals: ['qarar'] },
    { id: 'qarar', kind: 'method', lane: 'end', requires: 'qarar-bi-hasr', notebook: true, title: 'نقرّر بمتباينة أو حصر', subtitle: 'مقارنة بالقيمة المسموحة', context: { text: REMARKS.gapBound }, reveals: ['khulasa'] },
    { id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'qarar-bi-hasr', title: 'خمسة أوقات', subtitle: 'مجهول · ترجمة · معادلة · تحقّق · خلاصة', context: { list: SITUATION.analysis.map((a) => a.label) }, reveals: [] },
  ],
  edges: [
    { from: 'wadiya', to: 'tarjama', label: 'نفهمها' },
    { from: 'tarjama', to: 'khata', label: 'خطأ شائع' },
    { from: 'tarjama', to: 'hall', label: 'نحلّ' },
    { from: 'hall', to: 'qarar', label: 'نقرّر' },
    { from: 'khata', to: 'khulasa', label: 'نستخلص' },
    { from: 'qarar', to: 'khulasa', label: 'نستخلص' },
  ],
};
