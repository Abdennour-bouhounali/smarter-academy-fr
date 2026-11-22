/**
 * La carte PROGRESSIVE du درس « حساب مركبتي شعاع وتساوي شعاعين في معلم » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — نشاط 2 (ACTIVITY), معارف 3 ب et جـ (KNOW3B,
 * KNOW_EQUAL), la طريقة p. 143 (METHOD_EQUAL), la méthode de la plateforme (METHOD_UNKNOWN) et les erreurs que la
 * leçon explique (MISTAKES : la soustraction à l'envers, l'ordre des lettres, coordonnées ≠ composantes).
 * Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`). Rien de l'إختبار أولي n'est montré.
 *
 *                 [النهاية ناقص المبدأ]                      m1
 *                         │ نكتبها قانونا
 *                 [حساب مركبتي شعاع]                         m2
 *        خطأ شائع ┌────────┘ (le nœud dit aussi : composantes ≠ coordonnées de B)
 *        ⛔ [المبدأ ناقص النهاية؟]                              m2
 *                         │ نقارن بها
 *                 [الشعاعان المتساويان]                       m2
 *              نتحقق ┌────┴────┐ نحسب بها
 *        [التحقق من التساوي]  [نقطة مجهولة]                   m3
 *                                 │ انتبه إلى
 *                          ⚠ [ترتيب الحروف] → 🎯 [خلاصة]       m3
 */
import { ACTIVITY, KNOW3B, KNOW_EQUAL, METHOD_EQUAL, METHOD_UNKNOWN, MISTAKES } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'farq',
  nodes: [
    {
      id: 'farq', kind: 'relationship', lane: 'center', requires: 'farq-ihdathiyat', notebook: true,
      title: 'النهاية ناقص المبدأ', subtitle: '$a = x_B - x_A$',
      reveals: ['qanun'],
    },
    {
      id: 'qanun', kind: 'relationship', lane: 'center', requires: 'qanun-murakkibatayn', notebook: true,
      title: 'حساب مركبتي شعاع', subtitle: KNOW3B.formula,
      context: { text: KNOW3B.example, note: MISTAKES.coords },
      reveals: ['maqlub', 'tasawi'],
    },
    {
      // ⛔ خطأ شائع — la soustraction à l'envers (le saut du héros dans le sens contraire).
      id: 'maqlub', kind: 'common_mistake', lane: 'start', requires: 'qanun-murakkibatayn',
      title: 'المبدأ ناقص النهاية؟', subtitle: '$\\overrightarrow{BA}$',
      context: {
        parts: [
          { role: 'wrong', text: MISTAKES.reversed.wrong },
          { role: 'why', text: MISTAKES.reversed.why },
          { role: 'right', text: MISTAKES.reversed.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'tasawi', kind: 'relationship', lane: 'end', requires: 'tasawi-murakkibat', notebook: true,
      title: 'الشعاعان المتساويان', subtitle: "$x = x'$ و $y = y'$",
      context: { text: KNOW_EQUAL.example1, note: ACTIVITY.closing },
      reveals: ['tahaqquq', 'majhula'],
    },
    {
      id: 'tahaqquq', kind: 'method', lane: 'start', requires: 'tahaqquq-tasawi', notebook: true,
      title: 'التحقق من تساوي شعاعين', subtitle: '$\\overrightarrow{AB} = \\overrightarrow{DC}$',
      context: { text: METHOD_EQUAL.rule, note: METHOD_EQUAL.solution[4] },
      reveals: [],
    },
    {
      id: 'majhula', kind: 'method', lane: 'end', requires: 'nuqta-majhula', notebook: true,
      title: 'نقطة مجهولة', subtitle: '$2 - x_D = 3$',
      context: { text: METHOD_UNKNOWN.solution[0], list: METHOD_UNKNOWN.solution.slice(1, 4) },
      reveals: ['tartib'],
    },
    {
      // ⚠ انتبه — l'ordre des lettres (le quadrilatère croisé du lab).
      id: 'tartib', kind: 'warning', lane: 'end', requires: 'nuqta-majhula',
      title: 'ترتيب الحروف', subtitle: 'ABCD',
      context: { text: MISTAKES.order.text, note: MISTAKES.order.note },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la propriété, l'égalité, la méthode.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'nuqta-majhula',
      title: 'خلاصة', subtitle: 'مركبتان · تساوي · مجهول',
      context: { text: KNOW3B.property, list: [METHOD_EQUAL.rule, METHOD_UNKNOWN.solution[0]] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'farq', to: 'qanun', label: 'نكتبها قانونا' },
    { from: 'qanun', to: 'maqlub', label: 'خطأ شائع' },
    { from: 'qanun', to: 'tasawi', label: 'نقارن بها' },
    { from: 'tasawi', to: 'tahaqquq', label: 'نتحقق' },
    { from: 'tasawi', to: 'majhula', label: 'نحسب بها' },
    { from: 'majhula', to: 'tartib', label: 'انتبه إلى' },
    { from: 'tartib', to: 'khulasa', label: 'نستخلص' },
  ],
};
