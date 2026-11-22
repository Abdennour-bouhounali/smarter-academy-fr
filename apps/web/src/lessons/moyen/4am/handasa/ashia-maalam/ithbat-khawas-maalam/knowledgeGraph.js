/**
 * La carte PROGRESSIVE du درس 4 « توظيف الحساب الشعاعي والإحداثيات لإثبات الخواص الهندسية » (unité 12).
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A ; modèle : ashia-insihab/barahin-ashia.
 *
 *   — ce que le فار exige (module 1 : la figure ne prouve pas, le côté seul, l'isocèle, des preuves suffisantes) ; la
 *     méthode pour un triangle, la perpendicularité, l'échelle des quadrilatères, le cercle (module 2) ; les deux طرائق
 *     du manuel (module 3) ;
 *   — deux erreurs que la leçon corrige avec leur « لماذا؟ » : prouver « قائم في A » avec le mauvais côté seul (module 1,
 *     étape 2 ; refus « watar » du laboratoire) ; conclure « مستطيل » d'un parallélogramme seul (module 1, étape 4 ; refus
 *     « missing » du laboratoire) ; une خلاصة ;
 *   — aucune réponse du « إختبار أولي » (A.10 règle 14).
 *
 *                 [نثبت بالحساب]                                   مفهوم
 *                        │ أولا
 *                 [الشكل لا يبرهن]                                  انتبه
 *                        │ لمثلث قائم
 *   خطأ شائع ┌──── [عكس فيثاغورس] → [متساوي الساقين] → [أدلة كافية] ────┐ خطأ شائع
 *                        │ نرتّبها في
 *                 [طبيعة مثلث] → [تعامد] → [طبيعة رباعي] → [دائرة]
 *                        │ طريقتا الكتاب
 *                 [إنجاز برهان] → [إحداثية مجهولة] → 🎯
 */
import { ACTIVITY, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'ithbat',
  nodes: [
    {
      id: 'ithbat', kind: 'concept', lane: 'center', requires: 'dalil-hisabi',
      title: 'نثبت بالحساب', subtitle: 'مثلث · رباعي · دائرة',
      context: { text: ACTIVITY.closing },
      reveals: ['dalil'],
    },
    { id: 'dalil', kind: 'relationship', lane: 'center', requires: 'dalil-hisabi', notebook: true, title: 'الشكل لا يبرهن', reveals: ['qaim'] },
    { id: 'qaim', kind: 'relationship', lane: 'center', requires: 'qaim-fithaghuras', notebook: true, title: 'زاوية قائمة بعكس فيثاغورس', reveals: ['watarKhata', 'saqayn'] },
    {
      // ⛔ خطأ شائع — module 1, étape 2 (et le refus « watar » du laboratoire) : le mauvais côté seul (MISC-MAALAM-FITHAGHURAS-WATAR).
      id: 'watarKhata', kind: 'common_mistake', lane: 'start', requires: 'qaim-fithaghuras',
      title: 'الضلع الخطأ وحده', subtitle: 'أطول ضلع',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.watarWrong },
          { role: 'why', text: REMARKS.watarWhy },
          { role: 'right', text: REMARKS.watarRight },
        ],
      },
      reveals: [],
    },
    { id: 'saqayn', kind: 'relationship', lane: 'end', requires: 'mutasawi-saqayn', notebook: true, title: 'متساوي الساقين بمربعين', reveals: ['kafi'] },
    { id: 'kafi', kind: 'warning', lane: 'center', requires: 'adilla-kafiya', notebook: true, title: 'أدلة كافية', reveals: ['kafiKhata', 'muthallath'] },
    {
      // ⛔ خطأ شائع — module 1, étape 4 (et le refus « missing » du laboratoire) : parallélogramme ⇒ rectangle (MISC-MAALAM-MUTAWAZI-KAFI).
      id: 'kafiKhata', kind: 'common_mistake', lane: 'start', requires: 'adilla-kafiya',
      title: 'متوازي الأضلاع وحده', subtitle: 'ليس مستطيلا',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.kafiWrong },
          { role: 'why', text: REMARKS.kafiWhy },
          { role: 'right', text: REMARKS.kafiRight },
        ],
      },
      reveals: [],
    },
    { id: 'muthallath', kind: 'method', lane: 'end', requires: 'tabiat-muthallath', notebook: true, title: 'طبيعة مثلث', subtitle: 'ثلاثة مربعات', reveals: ['taamud'] },
    { id: 'taamud', kind: 'relationship', lane: 'center', requires: 'taamud', notebook: true, title: 'تعامد مستقيمين', reveals: ['rubai'] },
    { id: 'rubai', kind: 'method', lane: 'center', requires: 'tabiat-rubai', notebook: true, title: 'طبيعة رباعي', subtitle: 'متوازي أضلاع أولا', reveals: ['daira'] },
    { id: 'daira', kind: 'relationship', lane: 'end', requires: 'intima-daira', notebook: true, title: 'نقطة على دائرة', reveals: ['burhan'] },
    { id: 'burhan', kind: 'method', lane: 'center', requires: 'tariqat-burhan', notebook: true, title: 'طريقة الكتاب: إنجاز برهان', reveals: ['majhul'] },
    { id: 'majhul', kind: 'method', lane: 'center', requires: 'tariqat-majhul', notebook: true, title: 'إحداثية مجهولة', subtitle: 'معادلة من الدرجة الأولى', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — la phrase de clôture de la leçon, au mot près.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-majhul',
      title: 'مساواة محسوبة وأدلة كافية',
      context: { text: ACTIVITY.closing },
      reveals: [],
    },
  ],
  edges: [
    { from: 'ithbat', to: 'dalil', label: 'أولا' },
    { from: 'dalil', to: 'qaim', label: 'لمثلث قائم' },
    { from: 'qaim', to: 'watarKhata', label: 'خطأ شائع' },
    { from: 'qaim', to: 'saqayn', label: 'ولمتساوي الساقين' },
    { from: 'saqayn', to: 'kafi', label: 'بشرط' },
    { from: 'kafi', to: 'kafiKhata', label: 'خطأ شائع' },
    { from: 'kafi', to: 'muthallath', label: 'نرتّبها في' },
    { from: 'muthallath', to: 'taamud', label: 'تطبيق' },
    { from: 'taamud', to: 'rubai', label: 'ثم' },
    { from: 'rubai', to: 'daira', label: 'ثم' },
    { from: 'daira', to: 'burhan', label: 'طريقتا الكتاب' },
    { from: 'burhan', to: 'majhul', label: 'وبمجهول' },
    { from: 'majhul', to: 'khulasa', label: 'نستخلص' },
  ],
};
