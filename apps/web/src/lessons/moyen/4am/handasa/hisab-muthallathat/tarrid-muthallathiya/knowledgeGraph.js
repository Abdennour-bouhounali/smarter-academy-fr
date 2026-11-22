/**
 * La carte PROGRESSIVE du درس 4 « حل مشكلات وترييض وضعيات بتوظيف النسب المثلثية » (unité 10).
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A ; modèle : khassiyat-talis/inshaat-talis.
 *
 *   — la DÉMARCHE de modélisation : la situation devient un triangle rectangle, le rapport se choisit, l'inconnue se
 *     sort par × ou ÷, la hauteur inaccessible (module 1) ; les étapes, l'arrondi final, le triangle entier, l'angle par
 *     deux côtés (module 2) ; prouver l'angle droit (module 3) ;
 *   — trois erreurs que la leçon corrige avec leur « لماذا؟ » : le sinus pour une hauteur vue d'une distance (module 1,
 *     étape 4, et le refus du laboratoire), la multiplication pour un وتر (module 1, étape 3, l'échelle de 1,37 m),
 *     l'arrondi utilisé trop tôt (module 2, ex-26 : 5,8 au lieu de 5,7) ; une vérification (module 2) ; une خلاصة ;
 *   — aucune réponse du « إختبار أولي » (A.10 règle 14).
 *
 *                 [وضعية ← مثلث قائم]                       مفهوم
 *                          │ نبدأ بـ
 *                 [من الوضعية إلى المثلث]                    طريقة
 *                          │ ثم نختار
 *     خطأ شائع ┌──── [أيّ نسبة؟]                              قاعدة
 *                          │ ثم
 *     خطأ شائع ┌──── [نضرب أم نقسم؟]                          قاعدة
 *                          │ في الملعب
 *                 [ارتفاع لا نصل إليه]                       طريقة
 *                          │ نجمعها
 *                 [خطوات الترييض]                            طريقة
 *                          │ انتبه إلى
 *     خطأ شائع ┌──── [ندوّر في النهاية]                       قاعدة
 *                          │ ثم
 *        تحقّق ┌──── [حلّ المثلث كاملا]                      طريقة
 *                          │ ثم
 *                 [زاوية من ضلعين] → [هل المثلث قائم؟] → 🎯
 */
import { ACTIVITY, REMARKS, CHECKS, METHOD } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'tarid',
  nodes: [
    {
      id: 'tarid', kind: 'concept', lane: 'center', requires: 'tarid-muthallath',
      title: 'وضعية ← مثلث قائم', subtitle: 'المعلوم والمطلوب',
      context: { text: ACTIVITY.closing },
      reveals: ['muthallath'],
    },
    { id: 'muthallath', kind: 'method', lane: 'center', requires: 'tarid-muthallath', notebook: true, title: 'من الوضعية إلى المثلث', reveals: ['nisba'] },
    { id: 'nisba', kind: 'relationship', lane: 'center', requires: 'ikhtiyar-nisba', notebook: true, title: 'أيّ نسبة؟', subtitle: 'المعلوم والمطلوب معًا', reveals: ['nisbaKhata', 'maqam'] },
    {
      // ⛔ خطأ شائع — module 1, étape 4 (et le refus du laboratoire) : le sinus pour une hauteur vue d'une distance.
      id: 'nisbaKhata', kind: 'common_mistake', lane: 'start', requires: 'ikhtiyar-nisba',
      title: 'الجيب لكل ارتفاع؟', subtitle: 'الوتر مجهول',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.nisbaWrong },
          { role: 'why', text: REMARKS.nisbaWhy },
          { role: 'right', text: REMARKS.nisbaRight },
        ],
      },
      reveals: [],
    },
    { id: 'maqam', kind: 'relationship', lane: 'end', requires: 'majhul-maqam', notebook: true, title: 'نضرب أم نقسم؟', reveals: ['darbKhata', 'nazar'] },
    {
      // ⛔ خطأ شائع — module 1, étape 3 : L = 1,6 × sin 59° (MISC-MUTH-DARB-BADAL-QISMA).
      id: 'darbKhata', kind: 'common_mistake', lane: 'start', requires: 'majhul-maqam',
      title: 'الضرب بدل القسمة', subtitle: 'المجهول في المقام',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.darbWrong },
          { role: 'why', text: REMARKS.darbWhy },
          { role: 'right', text: REMARKS.darbRight },
        ],
      },
      reveals: [],
    },
    { id: 'nazar', kind: 'method', lane: 'end', requires: 'zawiyat-nazar', notebook: true, title: 'ارتفاع لا نصل إليه', subtitle: 'زاوية النظر', reveals: ['khatawat'] },
    { id: 'khatawat', kind: 'method', lane: 'center', requires: 'khatawat-tarid', notebook: true, title: 'خطوات الترييض', reveals: ['tadwir'] },
    { id: 'tadwir', kind: 'relationship', lane: 'center', requires: 'tadwir-akhir', notebook: true, title: 'ندوّر في النهاية', reveals: ['tadwirKhata', 'hall'] },
    {
      // ⛔ خطأ شائع — module 2, ex-26 : l'arrondi 1,9 réutilisé (MISC-MUTH-TADWIR-MUBAKKIR).
      id: 'tadwirKhata', kind: 'common_mistake', lane: 'start', requires: 'tadwir-akhir',
      title: 'قيمة مدوّرة في حساب موالٍ', subtitle: 'يتراكم الخطأ',
      context: {
        parts: [
          { role: 'wrong', text: CHECKS.earlyWrong },
          { role: 'why', text: CHECKS.earlyWhy },
          { role: 'right', text: CHECKS.earlyRight },
        ],
      },
      reveals: [],
    },
    { id: 'hall', kind: 'method', lane: 'end', requires: 'hall-muthallath', notebook: true, title: 'حلّ المثلث كاملا', reveals: ['tahaqquq', 'zawiya'] },
    {
      // ✓ تحقّق — module 2, étapes 2 et 3.
      id: 'tahaqquq', kind: 'check', lane: 'start', requires: 'hall-muthallath',
      title: 'هل النتيجة ممكنة؟',
      context: { text: CHECKS.verify },
      reveals: [],
    },
    { id: 'zawiya', kind: 'method', lane: 'end', requires: 'zawiya-min-dilain', notebook: true, title: 'زاوية من ضلعين', reveals: ['qaim'] },
    { id: 'qaim', kind: 'warning', lane: 'center', requires: 'burhan-qaim', notebook: true, title: 'هل المثلث قائم؟', subtitle: 'نبرهن قبل الحساب', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — le cœur des étapes de la plateforme, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'burhan-qaim',
      title: 'نسمّي، نختار، نستخرج',
      context: { list: [METHOD.lines[1], METHOD.lines[2], METHOD.lines[3]] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tarid', to: 'muthallath', label: 'نبدأ بـ' },
    { from: 'muthallath', to: 'nisba', label: 'ثم نختار' },
    { from: 'nisba', to: 'nisbaKhata', label: 'خطأ شائع' },
    { from: 'nisba', to: 'maqam', label: 'ثم' },
    { from: 'maqam', to: 'darbKhata', label: 'خطأ شائع' },
    { from: 'maqam', to: 'nazar', label: 'في الملعب' },
    { from: 'nazar', to: 'khatawat', label: 'نجمعها' },
    { from: 'khatawat', to: 'tadwir', label: 'انتبه إلى' },
    { from: 'tadwir', to: 'tadwirKhata', label: 'خطأ شائع' },
    { from: 'tadwir', to: 'hall', label: 'ثم' },
    { from: 'hall', to: 'tahaqquq', label: 'نتحقق' },
    { from: 'hall', to: 'zawiya', label: 'ثم' },
    { from: 'zawiya', to: 'qaim', label: 'قبل كل حساب' },
    { from: 'qaim', to: 'khulasa', label: 'نستخلص' },
  ],
};
