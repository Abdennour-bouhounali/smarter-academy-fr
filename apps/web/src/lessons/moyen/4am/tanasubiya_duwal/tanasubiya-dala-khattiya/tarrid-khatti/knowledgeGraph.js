/**
 * La carte PROGRESSIVE du درس 5 « حل مشكلات وترييض وضعيات بتوظيف الدالة الخطية والتناسبية » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte
 * vient de content/textbook.js (نشاط 4, la طريقة du ressort). Rien de l'إختبار أولي n'y figure.
 *
 *   [وضعية تناسبية] → مثال → [البطاطا] → نقارن → [ليست تناسبية] ┬ خطأ شائع → ⛔ [محيط المستطيل]  m1
 *                                                              └ نحسب بجدول → [الطريقة] → مثال → [النابض]
 *        → ثلاثة أشكال → [جدول، دستور، بيان] → ثم نفسّر → [التفسير] → نتحقق منه بـ → 🔍 → نستخلص → 🎯  m2
 */
import { ACT_4, METHOD_SPRING, MISTAKE_NOT_O, INTERPRET, PROPORTIONAL_GRAPH } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'tanasub',
  nodes: [
    {
      id: 'tanasub', kind: 'concept', lane: 'center', requires: 'tanasub-bayan', notebook: true,
      title: 'وضعية تناسبية', subtitle: 'مستقيم يشمل المبدأ',
      reveals: ['batata'],
    },
    {
      id: 'batata', kind: 'example', lane: 'center', requires: 'tanasub-bayan',
      title: 'سعر البطاطا', subtitle: '$a = 50$',
      context: { text: PROPORTIONAL_GRAPH.text, note: ACT_4.meaning },
      reveals: ['laysa'],
    },
    {
      id: 'laysa', kind: 'idea', lane: 'center', requires: 'laysat-tanasub', notebook: true,
      title: 'ليست كل وضعية تناسبية', subtitle: 'محيط · مساحة',
      reveals: ['khata', 'tariqa'],
    },
    {
      // ⛔ خطأ شائع — le distracteur de نشاط 4 (le graphique 2 « aligné ») : module 1, étape 4.
      id: 'khata', kind: 'common_mistake', lane: 'end', requires: 'laysat-tanasub',
      title: 'نقط على استقامة', subtitle: 'لا يكفي',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKE_NOT_O.wrong },
          { role: 'why', text: MISTAKE_NOT_O.why },
          { role: 'right', text: MISTAKE_NOT_O.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'start', requires: 'tariqat-jadwal', notebook: true,
      title: 'الاستعانة بجدول تناسبية', subtitle: 'مقدار بدلالة آخر',
      reveals: ['nabid'],
    },
    {
      id: 'nabid', kind: 'example', lane: 'start', requires: 'tariqat-jadwal',
      title: 'النابض', subtitle: '$y = 0{,}3x$',
      context: { text: METHOD_SPRING.solution[1], note: METHOD_SPRING.solution[0] },
      reveals: ['thalath'],
    },
    {
      id: 'thalath', kind: 'relationship', lane: 'center', requires: 'tamthilat-thalath', notebook: true,
      title: 'ثلاثة أشكال، معامل واحد', subtitle: 'جدول · دستور · بيان',
      reveals: ['tafsir'],
    },
    {
      id: 'tafsir', kind: 'idea', lane: 'center', requires: 'tafsir-siyaq', notebook: true,
      title: 'تفسير النتيجة', subtitle: 'جملة · وحدة · معقولية',
      reveals: ['tahaqquq'],
    },
    {
      // 🔍 تحقّق — la réponse du manuel écrite en phrase, avec son unité.
      id: 'tahaqquq', kind: 'check', lane: 'end', requires: 'tafsir-siyaq',
      title: 'جواب بجملة ووحدة', subtitle: '10g ← 3cm',
      context: { text: METHOD_SPRING.solution[2], note: METHOD_SPRING.solution[3] },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la règle de la طريقة, et l'interprétation.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tafsir-siyaq',
      title: 'خلاصة', subtitle: 'نمذج، نحسب، نفسّر',
      context: { text: METHOD_SPRING.rule, note: INTERPRET.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tanasub', to: 'batata', label: 'مثال' },
    { from: 'batata', to: 'laysa', label: 'نقارن' },
    { from: 'laysa', to: 'khata', label: 'خطأ شائع' },
    { from: 'laysa', to: 'tariqa', label: 'نحسب بجدول' },
    { from: 'tariqa', to: 'nabid', label: 'مثال' },
    { from: 'nabid', to: 'thalath', label: 'ثلاثة أشكال' },
    { from: 'thalath', to: 'tafsir', label: 'ثم نفسّر' },
    { from: 'tafsir', to: 'tahaqquq', label: 'نتحقق منه بـ' },
    { from: 'tahaqquq', to: 'khulasa', label: 'نستخلص' },
  ],
};
