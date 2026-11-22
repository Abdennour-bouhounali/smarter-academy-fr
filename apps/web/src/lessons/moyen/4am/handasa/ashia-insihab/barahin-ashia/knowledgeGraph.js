/**
 * La carte PROGRESSIVE du درس 4 « حل مشكلات وإنجاز براهين بتوظيف الأشعة والانسحاب » (unité 11).
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A ; modèle : hisab-muthallathat/tarrid-muthallathiya.
 *
 *   — les trois OUTILS qui réduisent une expression (module 1 : raccorder, échanger, annuler) et la limite de la
 *     figure ; la DÉMARCHE de la preuve, la طريقة du manuel, ce qu'on peut conclure (module 2) ; la construction d'une
 *     somme et l'image d'un cercle (module 3) ; le milieu par deux opposés (module 4) ;
 *   — deux erreurs que la leçon corrige avec leur « لماذا؟ » : raccorder deux vecteurs qui ne se suivent pas (module 1,
 *     le refus du laboratoire, étape 2) ; tracer les deux représentants depuis E (module 3, étape 1) ; une خلاصة ;
 *   — aucune réponse du « إختبار أولي » (A.10 règle 14).
 *
 *                 [نختصر لنبرهن]                                  مفهوم
 *                        │ نبدأ بـ
 *   خطأ شائع ┌──── [نربط المتتابعين]                            قاعدة
 *                        │ وإلا
 *                 [نعوّض بما يساويه] → [متعاكسان] → [الشكل لا يبرهن]
 *                        │ نرتّبها في
 *                 [خطوات البرهان] → [ABDC] → [ماذا نستنتج؟]
 *                        │ ننشئ
 *   خطأ شائع ┌──── [ممثّل مجموع] → [صورة دائرة] → [منتصف] → 🎯
 */
import { ACTIVITY, REMARKS, CONSTRUCT, PROOF_STEPS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'burhan',
  nodes: [
    {
      id: 'burhan', kind: 'concept', lane: 'center', requires: 'rabt-shal',
      title: 'نختصر لنبرهن', subtitle: 'شال · تعويض · حذف',
      context: { text: ACTIVITY.closing },
      reveals: ['rabt'],
    },
    { id: 'rabt', kind: 'relationship', lane: 'center', requires: 'rabt-shal', notebook: true, title: 'نربط المتتابعين', reveals: ['rabtKhata', 'taawid'] },
    {
      // ⛔ خطأ شائع — module 1 (le refus du laboratoire, étape 2) : AB + AD « = BD » (MISC-SHUAA-SHAL-RABT).
      id: 'rabtKhata', kind: 'common_mistake', lane: 'start', requires: 'rabt-shal',
      title: 'ربط شعاعين لا يتتابعان', subtitle: 'B ≠ A',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.rabtWrong },
          { role: 'why', text: REMARKS.rabtWhy },
          { role: 'right', text: REMARKS.rabtRight },
        ],
      },
      reveals: [],
    },
    { id: 'taawid', kind: 'relationship', lane: 'end', requires: 'taawid-musawi', notebook: true, title: 'نعوّض بما يساويه', subtitle: 'حسب المعطيات', reveals: ['sifr'] },
    { id: 'sifr', kind: 'relationship', lane: 'end', requires: 'mutaakisan-sifr', notebook: true, title: 'شعاعان متعاكسان', reveals: ['shakl'] },
    { id: 'shakl', kind: 'warning', lane: 'center', requires: 'shakl-la-yubarhin', notebook: true, title: 'الشكل لا يبرهن', reveals: ['khatawat'] },
    { id: 'khatawat', kind: 'method', lane: 'center', requires: 'khatawat-burhan', notebook: true, title: 'خطوات البرهان', subtitle: 'نترجم · نحوّل · نستنتج', reveals: ['abdc'] },
    { id: 'abdc', kind: 'method', lane: 'end', requires: 'tariqat-abdc', notebook: true, title: 'طريقة الكتاب', subtitle: 'ABDC', reveals: ['istintaj'] },
    { id: 'istintaj', kind: 'relationship', lane: 'center', requires: 'istintajat', notebook: true, title: 'ماذا نستنتج؟', reveals: ['insha'] },
    { id: 'insha', kind: 'method', lane: 'center', requires: 'insha-majmu', notebook: true, title: 'ممثّل مجموع عدة أشعة', reveals: ['inshaKhata', 'daira'] },
    {
      // ⛔ خطأ شائع — module 3, étape 1 (et le refus du laboratoire « ownStart / notTip ») : deux représentants depuis E.
      id: 'inshaKhata', kind: 'common_mistake', lane: 'start', requires: 'insha-majmu',
      title: 'الممثّلان من النقطة نفسها', subtitle: 'المبدأ عند النهاية',
      context: {
        parts: [
          { role: 'wrong', text: CONSTRUCT.startWrong },
          { role: 'why', text: CONSTRUCT.startWhy },
          { role: 'right', text: CONSTRUCT.startRight },
        ],
      },
      reveals: [],
    },
    { id: 'daira', kind: 'relationship', lane: 'end', requires: 'surat-daira', notebook: true, title: 'صورة دائرة', subtitle: 'نفس نصف القطر', reveals: ['muntasaf'] },
    { id: 'muntasaf', kind: 'relationship', lane: 'center', requires: 'muntasaf-mutaakisan', notebook: true, title: 'منتصف بشعاعين متعاكسين', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les étapes de la plateforme, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'muntasaf-mutaakisan',
      title: 'نترجم، نحوّل، نستنتج',
      context: { list: PROOF_STEPS.lines },
      reveals: [],
    },
  ],
  edges: [
    { from: 'burhan', to: 'rabt', label: 'نبدأ بـ' },
    { from: 'rabt', to: 'rabtKhata', label: 'خطأ شائع' },
    { from: 'rabt', to: 'taawid', label: 'وإلا' },
    { from: 'taawid', to: 'sifr', label: 'ثم نحذف' },
    { from: 'sifr', to: 'shakl', label: 'انتبه' },
    { from: 'shakl', to: 'khatawat', label: 'نرتّبها في' },
    { from: 'khatawat', to: 'abdc', label: 'مثال' },
    { from: 'abdc', to: 'istintaj', label: 'نستنتج' },
    { from: 'istintaj', to: 'insha', label: 'ننشئ' },
    { from: 'insha', to: 'inshaKhata', label: 'خطأ شائع' },
    { from: 'insha', to: 'daira', label: 'تطبيق' },
    { from: 'daira', to: 'muntasaf', label: 'ثم' },
    { from: 'muntasaf', to: 'khulasa', label: 'نستخلص' },
  ],
};
