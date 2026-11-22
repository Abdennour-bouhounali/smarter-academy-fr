/**
 * La carte PROGRESSIVE du درس 5 « حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient
 * de content/textbook.js (نشاط 4 p. 79, et les formulations déclarées de la plateforme). Rien de
 * l'إختبار أولي n'y figure.
 *
 *   [ترييض تكلفة] → مثال → [اشتراك المناصر] ┬ خطأ شائع → ⛔ [الاشتراك x مرّة]                     m1
 *                                            └ نحسب به → [صورة وعدد صورته]
 *     → نقارن صيغتين → [تساوي التكلفتين] → مثال → [الملعب (10 ; 4000)] → ثم نختار → [الصيغة الأرخص]  m2
 *        ┬ خطأ شائع → ⛔ [الأرخص دائمًا]
 *        └ نرتّب الخطوات → [خطوات الترييض] → نستخلص → 🎯                                             m3
 */
import { ACTIVITY, MISTAKE_FIXED, MISTAKE_ALWAYS, EQUAL_RULE, METHOD, CHEAPER_RULE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'namdhaja',
  nodes: [
    {
      id: 'namdhaja', kind: 'concept', lane: 'center', requires: 'namdhaja-taalufiya', notebook: true,
      title: 'ترييض تكلفة', subtitle: '$f(x) = ax + b$',
      reveals: ['ishtirak'],
    },
    {
      id: 'ishtirak', kind: 'example', lane: 'center', requires: 'namdhaja-taalufiya',
      title: 'اشتراك المناصر', subtitle: '$f(x) = 200x + 2000$',
      context: { text: ACTIVITY.closing },
      reveals: ['khata-thabit', 'sura'],
    },
    {
      // ⛔ خطأ شائع — le modèle que « تحقّق » refuse dans le laboratoire (MISC-TARRID-JUZ-THABIT), module 1.
      id: 'khata-thabit', kind: 'common_mistake', lane: 'end', requires: 'namdhaja-taalufiya',
      title: 'الاشتراك يُدفع x مرّة', subtitle: 'جزء ثابت',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKE_FIXED.wrong },
          { role: 'why', text: MISTAKE_FIXED.why },
          { role: 'right', text: MISTAKE_FIXED.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'sura', kind: 'method', lane: 'start', requires: 'sura-fi-wadiya', notebook: true,
      title: 'مبلغ معلوم أو عدد معلوم', subtitle: 'صورة · عدد صورته',
      reveals: ['tasawi'],
    },
    {
      id: 'tasawi', kind: 'relationship', lane: 'center', requires: 'tasawi-taqatu', notebook: true,
      title: 'تساوي التكلفتين', subtitle: '$f(x) = g(x)$',
      reveals: ['malab'],
    },
    {
      id: 'malab', kind: 'example', lane: 'start', requires: 'tasawi-taqatu',
      title: 'الاشتراك والتذكرة', subtitle: '$(10 ; 4000)$',
      context: { text: EQUAL_RULE.text },
      reveals: ['afdal'],
    },
    {
      id: 'afdal', kind: 'idea', lane: 'center', requires: 'sigha-afdal', notebook: true,
      title: 'الصيغة الأرخص', subtitle: '$f(x) < g(x)$',
      reveals: ['khata-daiman', 'khutuwat'],
    },
    {
      // ⛔ خطأ شائع — la couleur que la peinture refuse (MISC-TARRID-AFDAL-DAIMAN), module 2.
      id: 'khata-daiman', kind: 'common_mistake', lane: 'end', requires: 'sigha-afdal',
      title: 'الأرخص دائمًا؟', subtitle: 'تتعلّق بـ x',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKE_ALWAYS.wrong },
          { role: 'why', text: MISTAKE_ALWAYS.why },
          { role: 'right', text: MISTAKE_ALWAYS.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'khutuwat', kind: 'method', lane: 'start', requires: 'khutuwat-mufadala', notebook: true,
      title: 'خطوات المفاضلة', subtitle: 'متغير · دالتان · حل · جواب',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la méthode, et la règle du choix.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'khutuwat-mufadala',
      title: 'خلاصة', subtitle: 'الأفضل يتعلّق بـ x',
      context: { text: METHOD.rule[0], note: CHEAPER_RULE.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'namdhaja', to: 'ishtirak', label: 'مثال' },
    { from: 'ishtirak', to: 'khata-thabit', label: 'خطأ شائع' },
    { from: 'ishtirak', to: 'sura', label: 'نحسب به' },
    { from: 'sura', to: 'tasawi', label: 'نقارن صيغتين' },
    { from: 'tasawi', to: 'malab', label: 'مثال' },
    { from: 'malab', to: 'afdal', label: 'ثم نختار' },
    { from: 'afdal', to: 'khata-daiman', label: 'خطأ شائع' },
    { from: 'afdal', to: 'khutuwat', label: 'نرتّب الخطوات' },
    { from: 'khutuwat', to: 'khulasa', label: 'نستخلص' },
  ],
};
