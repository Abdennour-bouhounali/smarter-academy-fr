/**
 * La carte PROGRESSIVE du درس « المضلعات المنتظمة وتطبيقاتها » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le تحدّ et le lab (content/textbook.js ›
 * CHALLENGE, FORGE_LINE), معارف 5 (KNOW5), les طرائق, et les AIDES que les modules montrent (AIDS : la mise en garde du
 * module 2, les erreurs que les modules 2 et 3 corrigent). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit
 * (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *            [الرؤوس صور بالدوران]                                   m1
 *                     │ مثال
 *            [المثلث في دائرته]
 *                     │ نسمّيه
 *              [المضلع المنتظم]                                       m2
 *      انتبه إلى ┌────────┴────────┐ رؤوسه على
 *   ⚠ [الشرطان معا]          [الدائرة المحيطة]
 *                                   │ نقيس
 *                          [الزاوية المركزية]
 *         خطأ شائع ┌────────────────┴──────┐ يؤدي إلى
 *   ⛔ [قسمة 180 بدل 360]          [المضلع صورة نفسه]
 *                                          │ نستنتج                    m3
 *                                   [زاوية المضلع] → [إنشاء] → [طول الضلع]
 *                          خطأ شائع ┌──────────────────┴──────┐ نستخلص
 *                ⛔ [الضلع ونصف القطر]                  🎯 [خلاصة]
 */
import { AIDS, KNOW5 } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'ruus',
  nodes: [
    {
      id: 'ruus', kind: 'concept', lane: 'center', requires: 'ruus-bidawaran', notebook: true,
      title: 'الرؤوس صور بالدوران', subtitle: '$n \\times \\alpha = 360^\\circ$',
      reveals: ['muthallath'],
    },
    {
      id: 'muthallath', kind: 'example', lane: 'center', requires: 'muthallath-120', notebook: true,
      title: 'المثلث في دائرته', subtitle: '$3 \\times 120^\\circ = 360^\\circ$',
      reveals: ['tarif'],
    },
    {
      id: 'tarif', kind: 'definition', lane: 'center', requires: 'tarif-muntazam', notebook: true,
      title: 'المضلع المنتظم', subtitle: 'أضلاع متقايسة وزوايا متقايسة',
      reveals: ['adla', 'daira'],
    },
    {
      // ⚠ انتبه — la correction du module 2 (le losange, le rectangle) : les DEUX conditions de la définition.
      id: 'adla', kind: 'warning', lane: 'start', requires: 'tarif-muntazam',
      title: 'الشرطان معا', subtitle: 'المعين والمستطيل',
      context: { text: AIDS.adla, note: AIDS.rect },
      reveals: [],
    },
    {
      id: 'daira', kind: 'relationship', lane: 'end', requires: 'daira-muhita', notebook: true,
      title: 'الدائرة المحيطة', subtitle: 'رؤوسه على دائرة واحدة',
      reveals: ['markaziya'],
    },
    {
      id: 'markaziya', kind: 'relationship', lane: 'center', requires: 'markaziya-360', notebook: true,
      title: 'الزاوية المركزية', subtitle: '$\\dfrac{360^\\circ}{n}$',
      reveals: ['khata180', 'surat'],
    },
    {
      // ⛔ خطأ شائع — le distracteur « 22,5° » du module 2 et le `explainFor` des modules 3 et 4.
      id: 'khata180', kind: 'common_mistake', lane: 'start', requires: 'markaziya-360',
      title: 'قسمة 180 بدل 360', subtitle: '$\\dfrac{180^\\circ}{n}$',
      context: {
        parts: [
          { role: 'wrong', text: AIDS.wrong180 },
          { role: 'why', text: AIDS.why180 },
          { role: 'right', text: AIDS.right180 },
        ],
      },
      reveals: [],
    },
    {
      id: 'surat', kind: 'relationship', lane: 'end', requires: 'surat-mudalla', notebook: true,
      title: 'المضلع صورة نفسه', subtitle: '$\\widehat{AOB}$',
      reveals: ['zawiya'],
    },
    {
      id: 'zawiya', kind: 'method', lane: 'center', requires: 'zawiyat-mudalla', notebook: true,
      title: 'زاوية المضلع', subtitle: '$180^\\circ - \\dfrac{360^\\circ}{n}$',
      reveals: ['insha'],
    },
    {
      id: 'insha', kind: 'method', lane: 'center', requires: 'insha-mudalla', notebook: true,
      title: 'إنشاء مضلع منتظم', subtitle: 'دوران ثم محوران',
      reveals: ['dil'],
    },
    {
      id: 'dil', kind: 'method', lane: 'center', requires: 'dil-mudalla', notebook: true,
      title: 'طول الضلع', subtitle: '$r\\sqrt{3}$ ، $r\\sqrt{2}$ ، $r$',
      reveals: ['khataDil', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — le `explainFor` de la طريقة « طول ضلع » (√3 au lieu de 3) et le `commonError` de l'exercice 15.
      id: 'khataDil', kind: 'common_mistake', lane: 'start', requires: 'dil-mudalla',
      title: 'الضلع ونصف القطر', subtitle: 'السداسي فقط',
      context: {
        parts: [
          { role: 'wrong', text: AIDS.wrongDil },
          { role: 'why', text: AIDS.whyDil },
          { role: 'right', text: AIDS.rightDil },
        ],
      },
      reveals: [],
    },
    {
      // 🎯 خلاصة — la règle du lab (module 1) et la خاصية 2 de معارف 5, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'dil-mudalla',
      title: 'خلاصة', subtitle: '$\\dfrac{360^\\circ}{n}$',
      context: { text: AIDS.takeaway, note: KNOW5.p2 },
      reveals: [],
    },
  ],
  edges: [
    { from: 'ruus', to: 'muthallath', label: 'مثال' },
    { from: 'muthallath', to: 'tarif', label: 'نسمّيه' },
    { from: 'tarif', to: 'adla', label: 'انتبه إلى' },
    { from: 'tarif', to: 'daira', label: 'رؤوسه على' },
    { from: 'daira', to: 'markaziya', label: 'نقيس' },
    { from: 'markaziya', to: 'khata180', label: 'خطأ شائع' },
    { from: 'markaziya', to: 'surat', label: 'يؤدي إلى' },
    { from: 'surat', to: 'zawiya', label: 'نستنتج' },
    { from: 'zawiya', to: 'insha', label: 'نبني بها' },
    { from: 'insha', to: 'dil', label: 'ونحسب' },
    { from: 'dil', to: 'khataDil', label: 'خطأ شائع' },
    { from: 'dil', to: 'khulasa', label: 'نستخلص' },
  ],
};
