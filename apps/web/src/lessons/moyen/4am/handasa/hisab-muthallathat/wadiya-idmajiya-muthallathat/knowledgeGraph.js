/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 10 « حساب المثلثات في المثلث القائم ») — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèle : handasa/khassiyat-talis/wadiya-idmajiya-talis.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE du manuel appliquée à la وضعية (Thalès dans la ligne de visée, la
 *     tangente dans le petit triangle, la vérification et l'arrondi en fin de calcul), et le rappel de l'outil du test final (un
 *     triangle rectangle à l'intérieur d'un solide) ;
 *   — la وضعية du manuel est résolue au module 7 (enseignement) ; l'évaluation est une AUTRE minaret et un conteneur,
 *     dont aucune réponse n'est ici (A.10 règle 14) ;
 *   — les trois erreurs sont celles que les modules 1 et 3 corrigent avec leur « لماذا؟ » : la distance poteau–مقام au
 *     lieu de la distance totale, le rapport pris pour la mesure de l'angle, l'arrondi de AD avant le sinus.
 *
 *                     [طول وزاوية لا نقيسهما]                     مفهوم
 *                               │ نبدأ بـ
 *     خطأ شائع ┌────── [طالس في خط النظر]                         طريقة
 *                               │ ثم
 *     خطأ شائع ┌────── [زاوية النظر بالظل]                         طريقة
 *                               │ ثم
 *                       [التحقّق والتدوير]                          علاقة
 *                               │ نجمعها
 *                     [من النص إلى الجواب]                          طريقة
 *                               │ في المجسّمات
 *     خطأ شائع ┌────── [مثلث قائم داخل مجسّم] → 🎯
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'talis-khatt-nazar',
      title: 'طول وزاوية لا نقيسهما', subtitle: 'طالس ثم الظل',
      context: { text: REMARKS.tajnid },
      reveals: ['nazar'],
    },
    { id: 'nazar', kind: 'method', lane: 'center', requires: 'talis-khatt-nazar', notebook: true, title: 'طالس في خط النظر', subtitle: 'ارتفاع المقام', reveals: ['nazarKhata', 'zawiya'] },
    {
      // ⛔ خطأ شائع — module 7, étape 3 : la distance poteau–مقام au lieu de AM (MISC-MUTH-TALIS-NAZAR).
      id: 'nazarKhata', kind: 'common_mistake', lane: 'start', requires: 'talis-khatt-nazar',
      title: 'PM بدل AM؟', subtitle: 'المسافة الكلية',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.nazarWrong },
          { role: 'why', text: REMARKS.nazarWhy },
          { role: 'right', text: REMARKS.nazarRight },
        ],
      },
      reveals: [],
    },
    { id: 'zawiya', kind: 'method', lane: 'end', requires: 'zawiya-bi-zill', notebook: true, title: 'زاوية النظر بالظل', subtitle: 'اللمسة العكسية', reveals: ['qaysKhata', 'mulaama'] },
    {
      // ⛔ خطأ شائع — module 7, étape 6 : le rapport 0,94 pris pour la mesure (MISC-MUTH-NISBA-BADAL-QAYS).
      id: 'qaysKhata', kind: 'common_mistake', lane: 'start', requires: 'zawiya-bi-zill',
      title: 'النسبة بدل القيس', subtitle: 'الظل ليس الزاوية',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.qaysWrong },
          { role: 'why', text: REMARKS.qaysWhy },
          { role: 'right', text: REMARKS.qaysRight },
        ],
      },
      reveals: [],
    },
    { id: 'mulaama', kind: 'relationship', lane: 'end', requires: 'mulaamat-natija', notebook: true, title: 'التحقّق والتدوير', reveals: ['marahil'] },
    { id: 'marahil', kind: 'method', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'من النص إلى الجواب', reveals: ['fada'] },
    { id: 'fada', kind: 'method', lane: 'center', requires: 'muthallath-fada', notebook: true, title: 'مثلث قائم داخل مجسّم', subtitle: 'الحاوية والمجسّمات', reveals: ['fadaKhata', 'khulasa'] },
    {
      // ⛔ خطأ شائع — module 7 (rappel `muthallath-fada`) : AD arrondi à 4 avant le sinus (MISC-MUTH-TADWIR-MUBAKKIR).
      id: 'fadaKhata', kind: 'common_mistake', lane: 'start', requires: 'muthallath-fada',
      title: 'التدوير قبل الأوان', subtitle: 'AD مدوّرا',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.fadaWrong },
          { role: 'why', text: REMARKS.fadaWhy },
          { role: 'right', text: REMARKS.fadaRight },
        ],
      },
      reveals: [],
    },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse du manuel, nommées par lui.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'muthallath-fada',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: SITUATION.analysis.map((a) => a.label) },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'nazar', label: 'نبدأ بـ' },
    { from: 'nazar', to: 'nazarKhata', label: 'خطأ شائع' },
    { from: 'nazar', to: 'zawiya', label: 'المثلث الصغير' },
    { from: 'zawiya', to: 'qaysKhata', label: 'خطأ شائع' },
    { from: 'zawiya', to: 'mulaama', label: 'ثم' },
    { from: 'mulaama', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'fada', label: 'في المجسّمات' },
    { from: 'fada', to: 'fadaKhata', label: 'خطأ شائع' },
    { from: 'fada', to: 'khulasa', label: 'نستخلص' },
  ],
};
