/**
 * La carte PROGRESSIVE du درس « استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية » — docs/architecture/
 * KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 4 (content/textbook.js › ACTIVITY),
 * معارف 3 (KNOW3), ce que la plateforme formalise (KEYS_RULE, ROUNDING_RULE) et les `commonError` des exercices 3
 * et 23 (content/exercises.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 * Rien de l'إختبار أولي n'est montré.
 *
 *          [نسبة زاوية بالحاسبة]                 m1
 *                   │ وبالعكس
 *          [قيس زاوية من نسبتها]                 m1
 *      مثال ┌───────┤
 *  [x ≈ 31,33°]     │ بشرط
 *  خطأ شائع │       │
 *  ⛔ [النسبة ليست القيس]
 *          [الحاسبة بالدرجة]                     m2
 *      مثال ┌───────┤
 *  [sin 54° ≈ 0,81] │ ثم ندوّر
 *     انتبه │       │
 *  ⚠ [وضع الراديان]
 *          [تدوير النتيجة]                        m2
 *  خطأ شائع ┌───────┴──────────┐ نستخلص
 *   ⛔ [بتر أم تدوير؟]      🎯 [خلاصة]
 */
import { ACTIVITY, KNOW3, KEYS_RULE, ROUNDING_RULE } from './content/textbook';
import { EX } from './content/exercises';

const ex23 = EX['ex-23-a'];
const ex3 = EX['ex-3-b'];

export const KNOWLEDGE_GRAPH = {
  root: 'nisba',
  nodes: [
    {
      id: 'nisba', kind: 'method', lane: 'center', requires: 'hasiba-nisba', notebook: true,
      title: 'نسبة زاوية بالحاسبة', subtitle: '$\\cos 40^{\\circ} \\approx 0{,}77$',
      reveals: ['zawiya'],
    },
    {
      id: 'zawiya', kind: 'method', lane: 'center', requires: 'hasiba-zawiya', notebook: true,
      title: 'قيس زاوية من نسبتها', subtitle: '$\\sin x = 0{,}52$',
      reveals: ['mithal-052', 'daraja'],
    },
    {
      id: 'mithal-052', kind: 'example', lane: 'start', requires: 'hasiba-zawiya',
      title: 'ثلاث دقّات لزاوية واحدة', subtitle: '$x \\approx 31{,}33^{\\circ}$',
      context: { text: ACTIVITY.part2, note: ACTIVITY.closing },
      reveals: ['khata-qays'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 23 (ليلى) : la valeur du cosinus écrite à la place de l'angle.
      id: 'khata-qays', kind: 'common_mistake', lane: 'start', requires: 'hasiba-zawiya',
      title: 'النسبة ليست القيس', subtitle: '$\\cos\\widehat{KML} \\neq \\widehat{KML}$',
      context: {
        parts: [
          { role: 'wrong', text: ex23.commonError },
          { role: 'why', text: ex23.question.explain },
          { role: 'right', text: KEYS_RULE.inverse },
        ],
      },
      reveals: [],
    },
    {
      id: 'daraja', kind: 'relationship', lane: 'center', requires: 'barmaja-daraja', notebook: true,
      title: 'الحاسبة بالدرجة', subtitle: '$\\sin 30^{\\circ} = 0{,}5$',
      reveals: ['mithal-54', 'tadwir'],
    },
    {
      id: 'mithal-54', kind: 'example', lane: 'start', requires: 'barmaja-daraja',
      title: 'نسب الزاوية 54°', subtitle: '$\\sin 54^{\\circ} \\approx 0{,}81$',
      context: { text: KNOW3.example1.text, list: KNOW3.example1.steps.map((s) => s.result) },
      reveals: ['tanbih-rad'],
    },
    {
      // ⚠ انتبه — la condition de معارف 3 (« يجب برمجتها بالوحدة الدرجة ») et ce que donne le mode R (le lab).
      id: 'tanbih-rad', kind: 'warning', lane: 'start', requires: 'barmaja-daraja',
      title: 'وضع الراديان', subtitle: '$\\sin 30 \\approx -0{,}988$',
      context: { text: KEYS_RULE.radTrap, note: KNOW3.intro },
      reveals: [],
    },
    {
      id: 'tadwir', kind: 'method', lane: 'center', requires: 'tadwir-dalaqa', notebook: true,
      title: 'تدوير النتيجة', subtitle: '$23{,}578\\ldots \\approx 24$',
      reveals: ['khata-batr', 'khulasa'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 3 : tronquer l'écran au lieu de l'arrondir.
      id: 'khata-batr', kind: 'common_mistake', lane: 'start', requires: 'tadwir-dalaqa',
      title: 'بتر أم تدوير؟', subtitle: '$0{,}766\\ldots \\approx 0{,}77$',
      context: {
        parts: [
          { role: 'wrong', text: ex3.commonError },
          { role: 'why', text: ROUNDING_RULE.lines[2] },
          { role: 'right', text: ROUNDING_RULE.lines[1] },
        ],
      },
      reveals: [],
    },
    {
      // 🎯 خلاصة — la phrase de clôture du نشاط 4, puis la dernière ligne de la règle d'arrondi.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tadwir-dalaqa',
      title: 'خلاصة', subtitle: '$\\sin^{-1}$',
      context: { text: ACTIVITY.closing, list: [ROUNDING_RULE.lines[3]] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nisba', to: 'zawiya', label: 'وبالعكس' },
    { from: 'zawiya', to: 'mithal-052', label: 'مثال' },
    { from: 'mithal-052', to: 'khata-qays', label: 'خطأ شائع' },
    { from: 'zawiya', to: 'daraja', label: 'بشرط' },
    { from: 'daraja', to: 'mithal-54', label: 'مثال' },
    { from: 'mithal-54', to: 'tanbih-rad', label: 'انتبه' },
    { from: 'daraja', to: 'tadwir', label: 'ثم ندوّر' },
    { from: 'tadwir', to: 'khata-batr', label: 'خطأ شائع' },
    { from: 'tadwir', to: 'khulasa', label: 'نستخلص' },
  ],
};
