/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 7) — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèle : tanasubiya-dala-khattiya/wadiya-idmajiya-khattiya.
 *
 *   — aucune connaissance nouvelle : les ressources des cinq دروس telles que la sortie à la plage les
 *     mobilise (les participants par deux droites, le bus « الأمل » affine, le bus « النورس » par deux
 *     devis, la comparaison par l'intersection, les trois tarifs de kayak, l'interprétation), la
 *     démarche en trois phases ;
 *   — les réponses de « إختبار أولي » (la sortie aux Sablettes : (36 ; 4), 180x + 4000, 38 élèves…)
 *     n'y figurent pas (A.10 règle 14) ;
 *   — les trois erreurs sont celles que le module 7 corrige, avec leur « لماذا؟ » : le couple lu à
 *     l'envers (MISC-JUMLA-BAYANI-MAQLUB), la différence des prix prise pour a (MISC-TAGHAYYUR-BIDUN-QISMA),
 *     le petit forfait cru toujours moins cher (MISC-TARRID-AFDAL-DAIMAN).
 *
 *                       [رحلة القسم إلى الشاطئ]                       مفهوم
 *                                │ نبدأ بـ
 *        خطأ شائع ┌──── [عدد المشاركين]                               طريقة
 *  ⛔ [ثنائية مقلوبة]            │ ثم الحافلة
 *                          [الأمل: دالة تآلفية]                         علاقة
 *                                │ والنورس
 *        خطأ شائع ┌──── [عرضان: عددان وصورتاهما]                      طريقة
 *  ⛔ [فرق دون قسمة]             │ نقارن
 *        خطأ شائع ┌──── [المقارنة بين صيغتين]                         طريقة
 *  ⛔ [الأرخص دائما؟]            │ على الشاطئ
 *                          [ثلاث صيغ] → [التفسير] → [من النص إلى الجواب]
 *                                │ نستخلص
 *                           🎯 [ثلاث مراحل]
 */
import { SITUATION, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'jumla-bayaniya',
      title: 'رحلة القسم إلى الشاطئ', subtitle: SITUATION.caption,
      context: { text: SITUATION.intro },
      reveals: ['jumla'],
    },
    { id: 'jumla', kind: 'method', lane: 'center', requires: 'jumla-bayaniya', notebook: true, title: 'عدد المشاركين', subtitle: 'نقطة تقاطع مستقيمين', reveals: ['maqlub', 'taklifa'] },
    {
      // ⛔ خطأ شائع — module 7, étape 3 : le couple lu à l'envers (4 ; 32).
      id: 'maqlub', kind: 'common_mistake', lane: 'start', requires: 'jumla-bayaniya',
      title: 'ثنائية مقلوبة', subtitle: 'الفاصلة أولا',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.pairWrong },
          { role: 'why', text: REMARKS.pairWhy },
          { role: 'right', text: REMARKS.pairRight },
        ],
      },
      reveals: [],
    },
    { id: 'taklifa', kind: 'relationship', lane: 'end', requires: 'taklifa-taalufiya', notebook: true, title: 'الأمل: دالة تآلفية', subtitle: 'ثابت + ثمن التلميذ', reveals: ['thunaiyatan'] },
    { id: 'thunaiyatan', kind: 'method', lane: 'end', requires: 'min-thunaiyatayn', notebook: true, title: 'النورس: عرضان', subtitle: 'تناسب التغيّرات', reveals: ['farq', 'ikhtiyar'] },
    {
      // ⛔ خطأ شائع — module 7, étape 5 : la différence des prix prise pour le coefficient.
      id: 'farq', kind: 'common_mistake', lane: 'start', requires: 'min-thunaiyatayn',
      title: 'فرق دون قسمة', subtitle: 'ثمن 12 تلميذا',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.taghayyurWrong },
          { role: 'why', text: REMARKS.taghayyurWhy },
          { role: 'right', text: REMARKS.taghayyurRight },
        ],
      },
      reveals: [],
    },
    { id: 'ikhtiyar', kind: 'method', lane: 'end', requires: 'ikhtiyar-sigha', notebook: true, title: 'المقارنة بين صيغتين', subtitle: 'نقطة التقاطع', reveals: ['afdal', 'thalath'] },
    {
      // ⛔ خطأ شائع — module 7, étape 6 : le plus petit forfait cru toujours moins cher.
      id: 'afdal', kind: 'common_mistake', lane: 'start', requires: 'ikhtiyar-sigha',
      title: 'الأرخص دائما؟', subtitle: 'بحسب عدد التلاميذ',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.afdalWrong },
          { role: 'why', text: REMARKS.afdalWhy },
          { role: 'right', text: REMARKS.afdalRight },
        ],
      },
      reveals: [],
    },
    { id: 'thalath', kind: 'method', lane: 'end', requires: 'thalath-sigh', notebook: true, title: 'ثلاث صيغ للكراء', subtitle: 'المستقيم الأدنى', reveals: ['tafsir'] },
    { id: 'tafsir', kind: 'relationship', lane: 'center', requires: 'tafsir-natija', notebook: true, title: 'تفسير النتيجة', subtitle: 'عدد طبيعي، بالدينار', reveals: ['marahil'] },
    { id: 'marahil', kind: 'method', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'من النص إلى الجواب', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les trois phases de l'analyse (module 7), comme dans les synthèses du manuel.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: SITUATION.analysis.map((a) => a.label) },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'jumla', label: 'نبدأ بـ' },
    { from: 'jumla', to: 'maqlub', label: 'خطأ شائع' },
    { from: 'jumla', to: 'taklifa', label: 'ثم الحافلة' },
    { from: 'taklifa', to: 'thunaiyatan', label: 'والنورس' },
    { from: 'thunaiyatan', to: 'farq', label: 'خطأ شائع' },
    { from: 'thunaiyatan', to: 'ikhtiyar', label: 'نقارن' },
    { from: 'ikhtiyar', to: 'afdal', label: 'خطأ شائع' },
    { from: 'ikhtiyar', to: 'thalath', label: 'على الشاطئ' },
    { from: 'thalath', to: 'tafsir', label: 'ثم نفسّر' },
    { from: 'tafsir', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'khulasa', label: 'نستخلص' },
  ],
};
