/**
 * La carte PROGRESSIVE du درس 3 « تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de
 * content/textbook.js (KNOWLEDGE, MISTAKES, TAKEAWAY) — la formalisation déclarée de la plateforme et le
 * نشاط 4. Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   core   cinq items (notebook) + un exemple (l'escalier du stade) ;
 *   guide  انتبه (x₁ ≠ x₂), deux خطأ شائع (a = différence des images ; b = image ÷ nombre — le module 2 les
 *          explique), خلاصة.
 * Rien de l'إختبار أولي n'y est montré.
 *
 *                 [تناسب التغيّرات]                       m1
 *            مثال ┌───────┴───────┐ لماذا؟
 *        [سلّم الملعب]        [البرهان]                    m2
 *               انتبه إلى ┌───────┴───────┐ نحسب
 *               ⚠ [x₁ ≠ x₂]          [حساب a]
 *                  خطأ شائع ┌───────┴───────┐ ثم
 *                   ⛔ [فرق الصورتين]     [حساب b]
 *                      خطأ شائع ┌───────┴───────┐ أو
 *                       ⛔ [الصورة ÷ العدد]  [الجملة]
 *                                              │ نستخلص
 *                                          🎯 [خلاصة]
 */
import { KNOWLEDGE, MISTAKES, TAKEAWAY } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'tanasub',
  nodes: [
    {
      id: 'tanasub', kind: 'relationship', lane: 'center', requires: 'tanasub-taghayyurat', notebook: true,
      title: 'تناسب التغيّرات', subtitle: '$\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2} = a$',
      reveals: ['mithal-stade', 'burhan'],
    },
    {
      id: 'mithal-stade', kind: 'example', lane: 'start', requires: 'tanasub-taghayyurat',
      title: 'سلّم الملعب', subtitle: '$a = 200$',
      context: { text: KNOWLEDGE.tanasub.example },
      reveals: [],
    },
    {
      id: 'burhan', kind: 'relationship', lane: 'end', requires: 'burhan-taghayyurat', notebook: true,
      title: 'لماذا يساوي الحاصل a؟', subtitle: 'b يختفي في الفرق',
      reveals: ['tanbih', 'hisab-a'],
    },
    {
      // ⚠ انتبه — la condition de la propriété (le laboratoire refuse x₁ = x₂).
      id: 'tanbih', kind: 'warning', lane: 'start', requires: 'burhan-taghayyurat',
      title: 'عددان متمايزان', subtitle: '$x_1 \\neq x_2$',
      context: { text: KNOWLEDGE.burhan.warning },
      reveals: [],
    },
    {
      id: 'hisab-a', kind: 'method', lane: 'end', requires: 'hisab-muamil-a', notebook: true,
      title: 'حساب a', subtitle: 'فرق الصورتين ÷ فرق العددين',
      reveals: ['khata-farq', 'hisab-b'],
    },
    {
      // ⛔ خطأ شائع — a = 36 au تحدّ (MISC-TAGHAYYUR-BIDUN-QISMA), expliqué au module 2.
      id: 'khata-farq', kind: 'common_mistake', lane: 'start', requires: 'hisab-muamil-a',
      title: 'فرق الصورتين وحده', subtitle: '$36$',
      context: { parts: [{ role: 'wrong', text: MISTAKES.bidunQisma.wrong }, { role: 'why', text: MISTAKES.bidunQisma.why }, { role: 'right', text: MISTAKES.bidunQisma.right }] },
      reveals: [],
    },
    {
      id: 'hisab-b', kind: 'method', lane: 'end', requires: 'hisab-b', notebook: true,
      title: 'حساب b', subtitle: '$b = f(x_1) - a x_1$',
      reveals: ['khata-nisba', 'jumla'],
    },
    {
      // ⛔ خطأ شائع — b = 50 ÷ 10 = 5 (MISC-TAGHAYYUR-B-NISBA), expliqué au module 2.
      id: 'khata-nisba', kind: 'common_mistake', lane: 'start', requires: 'hisab-b',
      title: 'الصورة على العدد', subtitle: '$5$',
      context: { parts: [{ role: 'wrong', text: MISTAKES.bNisba.wrong }, { role: 'why', text: MISTAKES.bNisba.why }, { role: 'right', text: MISTAKES.bNisba.right }] },
      reveals: [],
    },
    {
      id: 'jumla', kind: 'method', lane: 'end', requires: 'tariqat-jumla-ab', notebook: true,
      title: 'جملة معادلتين', subtitle: 'المجهولان a و b',
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-jumla-ab',
      title: 'خلاصة', subtitle: 'عددان وصورتاهما يكفيان',
      context: { text: TAKEAWAY.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tanasub', to: 'mithal-stade', label: 'مثال' },
    { from: 'tanasub', to: 'burhan', label: 'لماذا؟' },
    { from: 'burhan', to: 'tanbih', label: 'انتبه إلى' },
    { from: 'burhan', to: 'hisab-a', label: 'نحسب' },
    { from: 'hisab-a', to: 'khata-farq', label: 'خطأ شائع' },
    { from: 'hisab-a', to: 'hisab-b', label: 'ثم' },
    { from: 'hisab-b', to: 'khata-nisba', label: 'خطأ شائع' },
    { from: 'hisab-b', to: 'jumla', label: 'أو' },
    { from: 'jumla', to: 'khulasa', label: 'نستخلص' },
  ],
};
