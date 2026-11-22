/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 3) — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèle : hisab-judhur/wadiya-idmajiya-judhur/knowledgeGraph.js.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE (modéliser, deux façons d'écrire l'aire du ممرّ, la forme factorisée DONNÉE, choisir la forme) ;
 *   — la synthèse dans le lecteur de mission (2026-11-12) : la carte est TOUTE OUVERTE dès le premier écran (`knowledgeMapOpen`), donc AVANT le
 *     module 7 — elle parle EN LETTRES (une نافورة carrée de côté a, un ممرّ de largeur x, d'aire S : content/textbook.js › METHOD_LETTERS) et
 *     ne montre ni le bassin, ni le ruban, ni leurs nombres, ni la solution du défi 🏆 (content/forbidden.js, content/mission.test.js) ;
 *   — les deux erreurs sont celles que le module 7 corrige (le ممرّ compté d'un seul côté, le carré d'une somme sans 2ab), avec leur « لماذا؟ ».
 *
 *                     [ما عرض الممرّ؟]                          مفهوم
 *                          نفهمها │
 *                    [نمذجة بدلالة x]                          طريقة
 *              خطأ شائع ┌────────┴────────┐ نحسب بها
 *        ⛔ [الممرّ من جهة واحدة]   [مساحة الممرّ]               علاقة
 *                     خطأ شائع ┌────────┴────────┐ المساواة
 *              ⛔ [مربّع مجموع بلا 2ab]   [الشكل المحلّل المعطى]   علاقة
 *                                              │ نطبّقها
 *                                    [من الشكل إلى المعادلة]    طريقة
 *                                              │ نستخلص
 *                                       🎯 [ثلاث مراحل]
 */
import { REMARKS, METHOD_LETTERS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'namdhaja',
      title: 'ما عرض الممرّ؟', subtitle: 'نافورة وممرّ حولها',
      context: { text: METHOD_LETTERS.question, note: METHOD_LETTERS.read },
      reveals: ['namdhaja'],
    },
    { id: 'namdhaja', kind: 'method', lane: 'center', requires: 'namdhaja', notebook: true, title: 'نمذجة بدلالة x', reveals: ['dil', 'masaha'] },
    {
      // ⛔ خطأ شائع — le côté extérieur a + x (le ممرّ d'un seul côté) et sa correction.
      id: 'dil', kind: 'common_mistake', lane: 'start', requires: 'namdhaja',
      title: 'الممرّ من جهة واحدة', subtitle: 'ضلع المربّع الخارجي',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.dilWrong },
          { role: 'why', text: REMARKS.dilWhy },
          { role: 'right', text: REMARKS.dilRight },
        ],
      },
      reveals: [],
    },
    { id: 'masaha', kind: 'relationship', lane: 'end', requires: 'masaha-tariqatan', notebook: true, title: 'مساحة الممرّ', subtitle: 'طريقتان', reveals: ['murabba', 'musaada'] },
    {
      // ⛔ خطأ شائع — (a + b)² = a² + b² : les quatre bandes oubliées.
      id: 'murabba', kind: 'common_mistake', lane: 'start', requires: 'masaha-tariqatan',
      title: 'مربّع مجموع بلا 2ab', subtitle: 'المستطيلات المنسية',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.murabbaWrong },
          { role: 'why', text: REMARKS.murabbaWhy },
          { role: 'right', text: REMARKS.murabbaRight },
        ],
      },
      reveals: [],
    },
    { id: 'musaada', kind: 'relationship', lane: 'end', requires: 'musaada-jadaa', notebook: true, title: 'الشكل المحلّل المعطى', subtitle: 'جداء أحد عامليه معدوم', reveals: ['tariqa'] },
    {
      id: 'tariqa', kind: 'method', lane: 'end', requires: 'tariqat-wadiya', notebook: true, title: 'من الشكل إلى المعادلة',
      context: { text: METHOD_LETTERS.strategy, note: METHOD_LETTERS.execute },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse d'une وضعية.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: METHOD_LETTERS.steps },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'namdhaja', label: 'نفهمها' },
    { from: 'namdhaja', to: 'dil', label: 'خطأ شائع' },
    { from: 'namdhaja', to: 'masaha', label: 'نحسب بها' },
    { from: 'masaha', to: 'murabba', label: 'خطأ شائع' },
    { from: 'masaha', to: 'musaada', label: 'المساواة' },
    { from: 'musaada', to: 'tariqa', label: 'نطبّقها' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
