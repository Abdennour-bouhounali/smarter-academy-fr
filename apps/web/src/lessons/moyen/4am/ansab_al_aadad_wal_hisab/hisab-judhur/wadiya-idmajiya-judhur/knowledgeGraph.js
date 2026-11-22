/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 2) — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèle : aadad-tabiiya-natiqa/wadiya-idmajiya-aadad/knowledgeGraph.js.
 *
 *   — EN LETTRES (2026-11-12, la synthèse dans le lecteur de mission : la carte est ouverte dès le premier écran) : ni la زربية, ni
 *     ses nombres — un rectangle d'aire S, long du double de sa largeur ℓ (content/textbook.js › METHOD_LETTERS) ;
 *   — aucune connaissance nouvelle : deux rappels (aire du rectangle, les deux
 *     solutions de x² = a) et la DÉMARCHE de la situation ;
 *   — la SOLUTION (ℓ = 2√3 m ≈ 346 cm, L = 4√3 m ≈ 693 cm) n'y figure pas :
 *     c'est la réponse de l'évaluation (A.10 règle 14) ;
 *   — les deux erreurs sont celles que le module 7 corrige (l'équation qui
 *     emploie le prix, l'arrondi trop tôt), avec son « لماذا؟ » ;
 *   — les six وضعيات d'entraînement (modules 1 à 6) ne sont pas dans la carte : d'autres nombres, la carte reste
 *     celle de la situation évaluée (module 8).
 *
 *                      [ما بُعدا المستطيل؟]                  مفهوم
 *                           نفهمها │
 *                       [قراءة الوضعية]                    فكرة أساسية
 *                  تذكّر ┌──────┴──────┐ يعتمد على
 *          [مساحة المستطيل]        [حلّان متعاكسان]         علاقة
 *          خطأ شائع │                    │ نطبّقه
 *         ⛔ [معطى مشوِّش]        [من المساحة إلى البعدين]  طريقة
 *                  │                      │ خطأ شائع
 *                  │                ⛔ [التدوير المبكر]
 *                  └──────┬───────────────┘ نستخلص
 *                     🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS, METHOD_LETTERS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'masahat-mustatil',
      title: 'ما بُعدا المستطيل؟', subtitle: 'طوله ضعف عرضه',
      context: { text: METHOD_LETTERS.question },
      reveals: ['fahm'],
    },
    {
      id: 'fahm', kind: 'idea', lane: 'center', requires: 'masahat-mustatil',
      title: 'قراءة الوضعية', subtitle: 'المعطيات المفيدة',
      context: { text: METHOD_LETTERS.read, list: METHOD_LETTERS.useful },
      reveals: ['masaha', 'hall'],
    },
    {
      id: 'masaha', kind: 'relationship', lane: 'start', requires: 'masahat-mustatil', notebook: true,
      title: 'مساحة المستطيل', subtitle: '$L \\times \\ell$',
      context: { text: REMARKS.masaha },
      reveals: ['mushawwish'],
    },
    {
      // ⛔ خطأ شائع — module 7, question 3 : le distracteur « 2ℓ² = 12000 » et sa correction.
      id: 'mushawwish', kind: 'common_mistake', lane: 'start', requires: 'masahat-mustatil',
      title: 'معطى مشوِّش', subtitle: 'الثمن بالدينار',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.sirWrong },
          { role: 'why', text: REMARKS.sirWhy },
          { role: 'right', text: REMARKS.sirRight },
        ],
      },
      reveals: [],
    },
    {
      id: 'hall', kind: 'relationship', lane: 'end', requires: 'tadhkir-x2-a', notebook: true,
      title: 'حلّان متعاكسان', subtitle: '$x^2 = a$',
      context: { text: REMARKS.mujab },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'end', requires: 'tariqat-wadiya', notebook: true,
      title: 'من المساحة إلى البعدين', subtitle: 'نحلّ ثم ندوّر',
      context: { text: METHOD_LETTERS.strategy, note: METHOD_LETTERS.execute },
      reveals: ['tadwir'],
    },
    {
      // ⛔ خطأ شائع — module 7, question 5 : « ندوّر العرض أولًا ثم نضاعفه ».
      id: 'tadwir', kind: 'common_mistake', lane: 'end', requires: 'tariqat-wadiya',
      title: 'التدوير المبكر', subtitle: 'ندوّر في النهاية',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.tadwirWrong },
          { role: 'why', text: REMARKS.tadwirWhy },
          { role: 'right', text: REMARKS.tadwirRight },
        ],
        note: REMARKS.notSolvedHere,
      },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse du manuel, nommées par lui.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: SITUATION.analysis.map((a) => a.label) },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'fahm', label: 'نفهمها' },
    { from: 'fahm', to: 'masaha', label: 'تذكّر' },
    { from: 'masaha', to: 'mushawwish', label: 'خطأ شائع' },
    { from: 'fahm', to: 'hall', label: 'يعتمد على' },
    { from: 'hall', to: 'tariqa', label: 'نطبّقه' },
    { from: 'tariqa', to: 'tadwir', label: 'خطأ شائع' },
    { from: 'mushawwish', to: 'khulasa', label: 'نستخلص' },
    { from: 'tadwir', to: 'khulasa', label: 'نستخلص' },
  ],
};
