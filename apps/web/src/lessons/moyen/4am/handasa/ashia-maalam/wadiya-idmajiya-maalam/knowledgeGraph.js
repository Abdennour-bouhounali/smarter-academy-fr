/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 12 « الأشعة في معلم ») — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ; modèle : ashia-insihab/wadiya-idmajiya-ashia.
 *
 *   — aucune connaissance nouvelle : les outils des دروس 1 à 4 que la وضعية mobilise (lire les points, le demi-cercle par son
 *     centre-milieu, la ligne brisée par ses distances, la comparaison exacte puis approchée) et la démarche du manuel ;
 *   — la وضعية du manuel est résolue au module 7 (enseignement) ; l'évaluation est un AUTRE couple de pistes (Constantine),
 *     dont aucune réponse n'est ici (A.10 règle 14) ;
 *   — les deux erreurs sont celles que le module 7 corrige avec son « لماذا؟ » : 2πr au lieu de πr, |Δx| + |Δy| au
 *     lieu de √(Δx² + Δy²).
 *
 *                      [مساران في معلم]                       مفهوم
 *                              │ نبدأ بـ
 *                      [قراءة المسارين]                         تعريف
 *                              │ المسار (1)
 *     خطأ شائع ┌──────── [نصف دائرة في معلم]                  علاقة
 *                              │ المسار (2)
 *     خطأ شائع ┌──────── [طول خط منكسر]                      علاقة
 *                              │ نقارن
 *                      [مقارنة طولين]                          طريقة
 *                              │ نجمعها
 *                      [من النص إلى الجواب] → 🎯             طريقة
 */
import { REMARKS, SITUATION } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'qiraat-masarayn',
      title: 'مساران في معلم', subtitle: 'أيّهما أقصر؟',
      context: { text: REMARKS.tajnid },
      reveals: ['qiraa'],
    },
    { id: 'qiraa', kind: 'definition', lane: 'center', requires: 'qiraat-masarayn', notebook: true, title: 'قراءة المسارين', subtitle: 'أنصاف دوائر وقطع', reveals: ['daira'] },
    { id: 'daira', kind: 'relationship', lane: 'end', requires: 'nisf-daira-markaz', notebook: true, title: 'نصف دائرة في معلم', subtitle: 'المركز منتصف القطر', reveals: ['muhitKhata', 'munkasir'] },
    {
      // ⛔ خطأ شائع — module 7, étape 4 : 2πr au lieu de πr (MISC-MAALAM-NISF-DAIRA-MUHIT).
      id: 'muhitKhata', kind: 'common_mistake', lane: 'start', requires: 'nisf-daira-markaz',
      title: 'محيط الدائرة كاملة؟', subtitle: 'نصفه فقط',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.muhitWrong },
          { role: 'why', text: REMARKS.muhitWhy },
          { role: 'right', text: REMARKS.muhitRight },
        ],
      },
      reveals: [],
    },
    { id: 'munkasir', kind: 'relationship', lane: 'end', requires: 'tul-khatt-munkasir', notebook: true, title: 'طول خط منكسر', subtitle: 'مجموع المسافات', reveals: ['jamKhata', 'muqarana'] },
    {
      // ⛔ خطأ شائع — module 7, étape 6 : |Δx| + |Δy| (MISC-MAALAM-MASAFA-JADHR-JAM).
      id: 'jamKhata', kind: 'common_mistake', lane: 'start', requires: 'tul-khatt-munkasir',
      title: 'نجمع الفرقين؟', subtitle: 'الوتر لا الضلعان',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.jamWrong },
          { role: 'why', text: REMARKS.jamWhy },
          { role: 'right', text: REMARKS.jamRight },
        ],
      },
      reveals: [],
    },
    { id: 'muqarana', kind: 'method', lane: 'center', requires: 'muqaranat-masarayn', notebook: true, title: 'مقارنة طولين', subtitle: 'مضبوطة ثم مقرّبة', reveals: ['marahil'] },
    { id: 'marahil', kind: 'method', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'من النص إلى الجواب', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse du manuel, nommées par lui.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tariqat-wadiya',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: SITUATION.analysis.map((a) => a.label) },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'qiraa', label: 'نبدأ بـ' },
    { from: 'qiraa', to: 'daira', label: 'المسار (1)' },
    { from: 'daira', to: 'muhitKhata', label: 'خطأ شائع' },
    { from: 'daira', to: 'munkasir', label: 'المسار (2)' },
    { from: 'munkasir', to: 'jamKhata', label: 'خطأ شائع' },
    { from: 'munkasir', to: 'muqarana', label: 'نقارن' },
    { from: 'muqarana', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'khulasa', label: 'نستخلص' },
  ],
};
