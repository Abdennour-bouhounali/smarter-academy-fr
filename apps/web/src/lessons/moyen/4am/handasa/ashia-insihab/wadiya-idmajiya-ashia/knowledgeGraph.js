/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 11 « الأشعة والانسحاب ») — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèle : handasa/hisab-muthallathat/wadiya-idmajiya-muthallathat.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE du manuel appliquée à la وضعية (ce qui est fixe et ce qui varie, la
 *     translation de B par NM qui fait un متوازي أضلاع, la ligne droite [AB′]) ;
 *   — la وضعية du manuel est résolue au module 7 (enseignement) ; l'évaluation est une AUTRE passerelle (Oran), dont
 *     aucune réponse n'est ici (A.10 règle 14) ;
 *   — les deux erreurs sont celles que le module 7 corrige avec leur « لماذا؟ » : translater par MN au lieu
 *     de NM, et poser le passage sur [AB].
 *
 *                       [أقصر مسلك يعبر طريقا]                  مفهوم
 *                                 │ نبدأ بـ
 *                       [الثابت والمتغيّر]                       تعريف
 *                                 │ نحوّل
 *     خطأ شائع ┌──────── [نقل B بشعاع الممر]                    طريقة
 *                                 │ ثم
 *     خطأ شائع ┌──────── [M على [AB′]]                          علاقة
 *                                 │ نجمعها
 *                       [من النص إلى الجواب]                     طريقة
 *                                 │ نستخلص
 *                       [ثلاث مراحل] → 🎯
 */
import { REMARKS, SITUATION } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'thabit-mutaghayyir',
      title: 'أقصر مسلك يعبر طريقا', subtitle: 'الممر عمودي',
      context: { text: REMARKS.tajnid },
      reveals: ['thabit'],
    },
    { id: 'thabit', kind: 'definition', lane: 'center', requires: 'thabit-mutaghayyir', notebook: true, title: 'الثابت والمتغيّر', subtitle: 'MN عرض الطريق', reveals: ['insihab'] },
    { id: 'insihab', kind: 'method', lane: 'end', requires: 'insihab-mamar', notebook: true, title: 'نقل B بشعاع الممر', subtitle: 'NB = MB′', reveals: ['ittijahKhata', 'aqsar'] },
    {
      // ⛔ خطأ شائع — module 7, étape 4 : B translaté par MN (MISC-SHUAA-ITTIJAH-MUAKKAS).
      id: 'ittijahKhata', kind: 'common_mistake', lane: 'start', requires: 'insihab-mamar',
      title: 'MN بدل NM؟', subtitle: 'الاتجاه',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.ittijahWrong },
          { role: 'why', text: REMARKS.ittijahWhy },
          { role: 'right', text: REMARKS.ittijahRight },
        ],
      },
      reveals: [],
    },
    { id: 'aqsar', kind: 'relationship', lane: 'end', requires: 'aqsar-masar', notebook: true, title: 'أقصر مسلك', subtitle: "M على [AB′]", reveals: ['mubashirKhata', 'marahil'] },
    {
      // ⛔ خطأ شائع — module 7, étape 6 : le passage posé sur [AB] (MISC-SHUAA-MAMAR-MUBASHIR).
      id: 'mubashirKhata', kind: 'common_mistake', lane: 'start', requires: 'aqsar-masar',
      title: 'الممر على [AB]؟', subtitle: 'الممر عمودي',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.mubashirWrong },
          { role: 'why', text: REMARKS.mubashirWhy },
          { role: 'right', text: REMARKS.mubashirRight },
        ],
      },
      reveals: [],
    },
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
    { from: 'wadiya', to: 'thabit', label: 'نبدأ بـ' },
    { from: 'thabit', to: 'insihab', label: 'نحوّل المسلك' },
    { from: 'insihab', to: 'ittijahKhata', label: 'خطأ شائع' },
    { from: 'insihab', to: 'aqsar', label: 'ثم' },
    { from: 'aqsar', to: 'mubashirKhata', label: 'خطأ شائع' },
    { from: 'aqsar', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'khulasa', label: 'نستخلص' },
  ],
};
