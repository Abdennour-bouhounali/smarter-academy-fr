/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 6) — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèle : jumal-muadalatayn/wadiya-idmajiya-jumal.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE du manuel appliquée au téléphérique (le câble
 *     par Pythagore, la durée, le coût linéaire, le plus grand prix permis) ;
 *   — les réponses du manuel (500√26 m, la durée, 3,8x, 526 DA) n'y figurent pas : ce sont
 *     celles de l'évaluation (A.10 règle 14). Les exemples sont ceux de la plateforme
 *     (l'autre téléphérique 300 m → 800 m ; la famille à −50 % / −25 %) ;
 *   — les trois erreurs sont celles que le module 7 corrige (additionner les côtés au lieu de
 *     Pythagore ; écrire le montant de la RÉDUCTION pour le ticket enfant ; arrondir le prix
 *     maximal vers le haut), avec leur « لماذا؟ ».
 *
 *                     [ما مدة الصعود؟ ما أكبر سعر؟]                 مفهوم
 *                                │ نبدأ بـ
 *        خطأ شائع ┌──── [طول الحبل]                                طريقة
 *  ⛔ [جمع الضلعين]             │ ثم
 *                            [المدة]                                طريقة
 *                                │ وفي الجزء 2
 *        خطأ شائع ┌──── [التكلفة دالة خطية]                        علاقة
 *  ⛔ [تذكرة الطفل]             │ نقرأ على بيانها
 *        خطأ شائع ┌──── [أكبر سعر]                                 طريقة
 *  ⛔ [التدوير]                 │ نجمعها
 *                         [من النص إلى الجواب]                      طريقة
 *                                │ نستخلص
 *                         🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'masafa-fithaghuras',
      title: 'المدة وأكبر سعر للتذكرة', subtitle: SITUATION.caption,
      context: { text: SITUATION.q1 },
      reveals: ['hatab'],
    },
    { id: 'hatab', kind: 'method', lane: 'center', requires: 'masafa-fithaghuras', notebook: true, title: 'طول الحبل', subtitle: 'مبرهنة فيثاغورس', reveals: ['jamKhata', 'mudda'] },
    {
      // ⛔ خطأ شائع — module 7, étapes 2 et 3 : « AB = AH + BH » et sa correction.
      id: 'jamKhata', kind: 'common_mistake', lane: 'start', requires: 'masafa-fithaghuras',
      title: 'جمع الضلعين', subtitle: 'الوتر ليس مجموعا',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.sumWrong },
          { role: 'why', text: REMARKS.sumWhy },
          { role: 'right', text: REMARKS.sumRight },
        ],
      },
      reveals: [],
    },
    { id: 'mudda', kind: 'method', lane: 'end', requires: 'mudda-sura', notebook: true, title: 'المدة', subtitle: 'المسافة على السرعة', reveals: ['taklifa'] },
    { id: 'taklifa', kind: 'relationship', lane: 'end', requires: 'taklifa-khattiya', notebook: true, title: 'التكلفة دالة خطية', subtitle: 'عدد ثابت في السعر', reveals: ['tiflKhata', 'mizaniya'] },
    {
      // ⛔ خطأ شائع — module 7, étape 6 : le ticket enfant écrit avec le MONTANT de la réduction (MISC-TAKHFID-NISBA).
      id: 'tiflKhata', kind: 'common_mistake', lane: 'start', requires: 'taklifa-khattiya',
      title: 'تذكرة الطفل', subtitle: 'ما يدفعه لا ما يُخصم',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.takhfidWrong },
          { role: 'why', text: REMARKS.takhfidWhy },
          { role: 'right', text: REMARKS.takhfidRight },
        ],
      },
      reveals: [],
    },
    { id: 'mizaniya', kind: 'method', lane: 'end', requires: 'hadd-mizaniya', notebook: true, title: 'أكبر سعر', subtitle: 'تقاطع مع خط الميزانية', reveals: ['tadwir', 'marahil'] },
    {
      // ⛔ خطأ شائع — module 7, étape 8 : arrondir le prix maximal vers le HAUT (MISC-TARRID-TAFSIR).
      id: 'tadwir', kind: 'common_mistake', lane: 'start', requires: 'hadd-mizaniya',
      title: 'التدوير نحو الأعلى', subtitle: 'تجاوز الميزانية',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.tadwirWrong },
          { role: 'why', text: REMARKS.tadwirWhy },
          { role: 'right', text: REMARKS.tadwirRight },
        ],
      },
      reveals: [],
    },
    { id: 'marahil', kind: 'method', lane: 'end', requires: 'tariqat-wadiya', notebook: true, title: 'من النص إلى الجواب', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse du manuel, nommées par lui.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: SITUATION.analysis.map((a) => a.label) },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'hatab', label: 'نبدأ بـ' },
    { from: 'hatab', to: 'jamKhata', label: 'خطأ شائع' },
    { from: 'hatab', to: 'mudda', label: 'ثم' },
    { from: 'mudda', to: 'taklifa', label: 'الجزء 2' },
    { from: 'taklifa', to: 'tiflKhata', label: 'خطأ شائع' },
    { from: 'taklifa', to: 'mizaniya', label: 'على بيانها' },
    { from: 'mizaniya', to: 'tadwir', label: 'خطأ شائع' },
    { from: 'mizaniya', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'khulasa', label: 'نستخلص' },
  ],
};
