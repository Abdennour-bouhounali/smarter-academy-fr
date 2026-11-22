/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 14 « الهندسة في الفضاء ») — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ; modèle : la synthèse de l'unité 13.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE appliquée à la وضعية du seau (compléter le cône par Thalès, le volume d'un
 *     tronc de cône comme différence de deux cônes dont l'un est la réduction de l'autre, l'arrondi et le litre) ;
 *   — la وضعية est résolue au module 7 (enseignement) ; l'évaluation est un AUTRE tronc de cône (le verre de frappé d'Oran),
 *     dont aucune réponse n'est ici (A.10 règle 14) ;
 *   — les deux erreurs sont celles que le module 7 corrige avec son « لماذا؟ » : le rayon MOYEN pour la surface de l'eau
 *     (MISC-MABTUR-TALIS) et k au lieu de k³ (MISC-MABTUR-FARQ).
 *
 *                      [الماء في الدلو]                       مفهوم
 *                              │ نبدأ بـ
 *     خطأ شائع ┌──────── [نكمل المخروط]                       طريقة
 *                              │ ثم
 *     خطأ شائع ┌──────── [V = V₁(1 − k³)]                      علاقة
 *                              │ نجمعها
 *                       [من النص إلى الحجم] → 🎯               طريقة
 */
import { REMARKS, SITUATION } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'mukhrut-mukammal',
      title: 'الماء في الدلو', subtitle: 'مخروط مبتور',
      context: { text: REMARKS.tajnid },
      reveals: ['mukammal'],
    },
    { id: 'mukammal', kind: 'method', lane: 'center', requires: 'mukhrut-mukammal', notebook: true, title: 'نكمل المخروط', subtitle: 'خاصية طالس', reveals: ['avgKhata', 'mabtur'] },
    {
      // ⛔ خطأ شائع — module 7, étape 4 : le rayon moyen (MISC-MABTUR-TALIS).
      id: 'avgKhata', kind: 'common_mistake', lane: 'start', requires: 'mukhrut-mukammal',
      title: 'المتوسط؟', subtitle: 'الماء ليس في المنتصف',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.avgWrong },
          { role: 'why', text: REMARKS.avgWhy },
          { role: 'right', text: REMARKS.avgRight },
        ],
      },
      reveals: [],
    },
    { id: 'mabtur', kind: 'relationship', lane: 'end', requires: 'hajm-mabtur', notebook: true, title: 'حجم المخروط المبتور', subtitle: '$V = V_1\\left(1 - k^3\\right)$', reveals: ['kKhata', 'marahil'] },
    {
      // ⛔ خطأ شائع — module 7, étape 6 : k au lieu de k³ (MISC-MABTUR-FARQ).
      id: 'kKhata', kind: 'common_mistake', lane: 'start', requires: 'hajm-mabtur',
      title: 'k أم k³؟', subtitle: 'الحجوم',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.kWrong },
          { role: 'why', text: REMARKS.kWhy },
          { role: 'right', text: REMARKS.kRight },
        ],
      },
      reveals: [],
    },
    { id: 'marahil', kind: 'method', lane: 'center', requires: 'tariqat-wadiya-fada', notebook: true, title: 'من النص إلى الحجم', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tariqat-wadiya-fada',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: SITUATION.analysis.map((a) => a.label) },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'mukammal', label: 'نبدأ بـ' },
    { from: 'mukammal', to: 'avgKhata', label: 'خطأ شائع' },
    { from: 'mukammal', to: 'mabtur', label: 'ثم' },
    { from: 'mabtur', to: 'kKhata', label: 'خطأ شائع' },
    { from: 'mabtur', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'khulasa', label: 'نستخلص' },
  ],
};
