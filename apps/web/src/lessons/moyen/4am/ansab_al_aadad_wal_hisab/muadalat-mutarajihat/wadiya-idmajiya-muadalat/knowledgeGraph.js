/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 4) — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèles : hisab-harfi/wadiya-idmajiya-harfi et hisab-judhur/wadiya-idmajiya-judhur.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE du manuel (traduire chaque
 *     formule, essayer, écrire l'inéquation qui départage, interpréter) ;
 *   — la carte est OUVERTE dès le premier écran (lecteur de mission, 2026-11-12) : ni la وضعية du défi
 *     ni ses nombres — la question et la démarche EN LETTRES (content/textbook.js › METHOD_LETTERS) ;
 *     l'interprétation est montrée sur l'exemple 50x contre 200 + 10x (x > 5 → 6 séances) ;
 *   — les deux erreurs sont celles que le module 7 corrige (l'abonnement payé à
 *     chaque séance, la valeur d'égalité prise pour la réponse), avec leur « لماذا؟ ».
 *
 *                       [أيّ صيغة أفضل؟]                          مفهوم
 *                            نترجمها │
 *                     [ترجمة صيغة تسعير]                          طريقة
 *              خطأ شائع ┌────────┴────────┐ نجرّب
 *      ⛔ [الاشتراك في كل حصة]        [التجريب]                    طريقة
 *                                         │ نقارن بـ
 *                                [متراجحة للمفاضلة]                علاقة
 *                                         │ نحلّ ونفسّر
 *                    خطأ شائع ┌───── [تفسير النتائج]               طريقة
 *            ⛔ [قيمة التساوي جوابًا]      │ نجمعها
 *                                 [من النص إلى الخيار]             طريقة
 *                                         │ نستخلص
 *                                   🎯 [ثلاث مراحل]
 */
import { METHOD_LETTERS, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'tarjama-sigha',
      title: 'أيّ صيغة أفضل؟', subtitle: 'صيغتان للاشتراك',
      context: { text: METHOD_LETTERS.question },
      reveals: ['tarjama'],
    },
    { id: 'tarjama', kind: 'method', lane: 'center', requires: 'tarjama-sigha', notebook: true, title: 'ترجمة صيغة تسعير', reveals: ['thabit', 'tajrib'] },
    {
      // ⛔ خطأ شائع — module 7, étape 2 : la ligne « (560 + 5)x » et sa correction (MISC-WADIYA-TARJAMA).
      id: 'thabit', kind: 'common_mistake', lane: 'start', requires: 'tarjama-sigha',
      title: 'الاشتراك في كل حصة', subtitle: 'مبلغ ثابت أم لكل حصة؟',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.tarjamaWrong },
          { role: 'why', text: REMARKS.tarjamaWhy },
          { role: 'right', text: REMARKS.tarjamaRight },
        ],
      },
      reveals: [],
    },
    { id: 'tajrib', kind: 'method', lane: 'end', requires: 'tajrib', notebook: true, title: 'التجريب', subtitle: 'جدول التكاليف', reveals: ['mufadala'] },
    { id: 'mufadala', kind: 'relationship', lane: 'end', requires: 'mutarajiha-mufadala', notebook: true, title: 'متراجحة للمفاضلة', subtitle: 'الأفضل هو الأقل تكلفة', reveals: ['tafsir'] },
    { id: 'tafsir', kind: 'method', lane: 'end', requires: 'tafsir-natija', notebook: true, title: 'تفسير النتائج', reveals: ['tasawi', 'tariqa'] },
    {
      // ⛔ خطأ شائع — module 7, étape 5 : le distracteur « 5 حصص » (MISC-WADIYA-QIMAT-TASAWI).
      id: 'tasawi', kind: 'common_mistake', lane: 'start', requires: 'tafsir-natija',
      title: 'قيمة التساوي جوابًا', subtitle: 'ابتداءً من أيّ عدد؟',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.tasawiWrong },
          { role: 'why', text: REMARKS.tasawiWhy },
          { role: 'right', text: REMARKS.tasawiRight },
        ],
      },
      reveals: [],
    },
    { id: 'tariqa', kind: 'method', lane: 'end', requires: 'tariqat-wadiya', notebook: true, title: 'من النص إلى الخيار الأفضل', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse du manuel, nommées par lui.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: METHOD_LETTERS.steps },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'tarjama', label: 'نترجمها' },
    { from: 'tarjama', to: 'thabit', label: 'خطأ شائع' },
    { from: 'tarjama', to: 'tajrib', label: 'نجرّب' },
    { from: 'tajrib', to: 'mufadala', label: 'نقارن بـ' },
    { from: 'mufadala', to: 'tafsir', label: 'نحلّ ونفسّر' },
    { from: 'tafsir', to: 'tasawi', label: 'خطأ شائع' },
    { from: 'tafsir', to: 'tariqa', label: 'نجمعها' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
