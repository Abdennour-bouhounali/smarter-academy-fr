/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 8 « الإحصاء ») — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèle : tanasubiya-dala-khattiya/wadiya-idmajiya-khattiya.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE du manuel appliquée aux médailles (lire le tableau,
 *     la médiane qui révèle la première valeur cachée, la moyenne qui donne l'équation de la seconde,
 *     le tout à partir de 69 %);
 *   — la situation du manuel est résolue au module 7 (enseignement) ; l'évaluation est une AUTRE
 *     compétition, dont aucune réponse n'est ici (A.10 règle 14) ;
 *   — les trois erreurs sont celles que le module 7 corrige (inverser valeur et effectif ; la médiane
 *     « au milieu de la ligne du tableau » ; oublier l'effectif 2 de la valeur cachée ; prendre 69 % de 30),
 *     avec leur « لماذا؟ ».
 *
 *                 [القيم المخفية وعدد الدول]                       مفهوم
 *                              │ نبدأ بـ
 *     خطأ شائع ┌──── [قراءة الجدول]                                 طريقة
 *                              │ ثم
 *     خطأ شائع ┌──── [الوسيط يكشف]                                  طريقة
 *                              │ ثم
 *     خطأ شائع ┌──── [المتوسط يكشف]                                 طريقة
 *                              │ الجزء 2
 *     خطأ شائع ┌──── [الكل من نسبة]                                 طريقة
 *                              │ نجمعها
 *                     [من النص إلى الجواب] → 🎯
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'qiraat-jadwal',
      title: 'القيم المخفية وعدد الدول', subtitle: SITUATION.caption,
      context: { text: SITUATION.q1 },
      reveals: ['jadwal'],
    },
    { id: 'jadwal', kind: 'method', lane: 'center', requires: 'qiraat-jadwal', notebook: true, title: 'قراءة جدول التكرارات', subtitle: 'قيمة وتكرار', reveals: ['qiraaKhata', 'wasit'] },
    {
      // ⛔ خطأ شائع — module 7, étape 1 : le 11 sous la valeur 1 lu comme 11 médailles.
      id: 'qiraaKhata', kind: 'common_mistake', lane: 'start', requires: 'qiraat-jadwal',
      title: 'القيمة أم التكرار؟', subtitle: 'لا يتبادلان',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.readWrong },
          { role: 'why', text: REMARKS.readWhy },
          { role: 'right', text: REMARKS.readRight },
        ],
      },
      reveals: [],
    },
    { id: 'wasit', kind: 'method', lane: 'end', requires: 'qima-makhfiya-wasit', notebook: true, title: 'الوسيط يكشف القيمة الأولى', subtitle: 'برتبتيه', reveals: ['wasitKhata', 'mutawassit'] },
    {
      // ⛔ خطأ شائع — module 7, étape 3 : la médiane lue au milieu de la LIGNE du tableau (MISC-IHSA-WASIT-QIMA-WUSTA-JADWAL).
      id: 'wasitKhata', kind: 'common_mistake', lane: 'start', requires: 'qima-makhfiya-wasit',
      title: 'وسط سطر الجدول', subtitle: 'الرتب لا الأعمدة',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.wasitWrong },
          { role: 'why', text: REMARKS.wasitWhy },
          { role: 'right', text: REMARKS.wasitRight },
        ],
      },
      reveals: [],
    },
    { id: 'mutawassit', kind: 'method', lane: 'end', requires: 'qima-makhfiya-mutawassit', notebook: true, title: 'المتوسط يكشف القيمة الثانية', subtitle: 'معادلة', reveals: ['tarjihKhata', 'nisba'] },
    {
      // ⛔ خطأ شائع — module 7, étape 5 : l'effectif 2 de la première valeur cachée oublié (MISC-IHSA-MUTAWASSIT-BILA-TARJIH).
      id: 'tarjihKhata', kind: 'common_mistake', lane: 'start', requires: 'qima-makhfiya-mutawassit',
      title: 'نسيان التكرار', subtitle: 'القيمة تُحسب بتكرارها',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.tarjihWrong },
          { role: 'why', text: REMARKS.tarjihWhy },
          { role: 'right', text: REMARKS.tarjihRight },
        ],
      },
      reveals: [],
    },
    { id: 'nisba', kind: 'method', lane: 'end', requires: 'kull-min-nisba', notebook: true, title: 'الكل من نسبة جزء', subtitle: 'أخذ نسبة من عدد', reveals: ['nisbaKhata', 'marahil'] },
    {
      // ⛔ خطأ شائع — module 7, étape 7 : 69 % de 30 au lieu du tout (MISC-IHSA-NISBA-MIN-ADAD).
      id: 'nisbaKhata', kind: 'common_mistake', lane: 'start', requires: 'kull-min-nisba',
      title: '69% من 30؟', subtitle: '30 جزء لا كل',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.nisbaWrong },
          { role: 'why', text: REMARKS.nisbaWhy },
          { role: 'right', text: REMARKS.nisbaRight },
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
    { from: 'wadiya', to: 'jadwal', label: 'نبدأ بـ' },
    { from: 'jadwal', to: 'qiraaKhata', label: 'خطأ شائع' },
    { from: 'jadwal', to: 'wasit', label: 'ثم' },
    { from: 'wasit', to: 'wasitKhata', label: 'خطأ شائع' },
    { from: 'wasit', to: 'mutawassit', label: 'ثم' },
    { from: 'mutawassit', to: 'tarjihKhata', label: 'خطأ شائع' },
    { from: 'mutawassit', to: 'nisba', label: 'الجزء 2' },
    { from: 'nisba', to: 'nisbaKhata', label: 'خطأ شائع' },
    { from: 'nisba', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'khulasa', label: 'نستخلص' },
  ],
};
