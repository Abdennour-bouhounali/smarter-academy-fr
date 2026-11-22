/**
 * La carte PROGRESSIVE du درس « الكتابات الكسرية لحاصل قسمة واختزال كسر » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (نشاط 4, معارف 3, « 0,7 = 7/10 », طريقة
 * p. 56, les phrases de correction `GUIDE` partagées avec les modules).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                  [نفس العدد، كتابات عديدة]                          مفهوم
 *        نضرب أو نقسم ┌──────────┴──────────┐ نشاط 4
 *        [كتابات متساوية] (M1)        [المستطيلات الثلاثة]
 *      خطأ شائع │
 *   ⛔ [نضيف نفس العدد؟]
 *          ومنه │
 *     [الكسر العشري] (M2)
 *            و │
 *     [اختزال كسر] (M2)
 *     بطريقة │
 *     [طريقة الاختزال] (M3)
 *   خطأ شائع │
 *   ⛔ [قاسم لحدّ واحد؟]
 *    نستخلص │
 *     🎯 [الخلاصة]
 */
import { ACTIVITY, KNOWLEDGE, GUIDE, METHOD } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'kitabat',
  nodes: [
    {
      id: 'kitabat', kind: 'concept', lane: 'center', requires: 'kitabat-mutasawiya',
      title: 'نفس العدد، كتابات عديدة', subtitle: 'حصّة لا تتحرّك',
      context: { text: ACTIVITY.text, note: 'قطعنا نفس الحصّة قطعًا أكثر أو أقل.' },
      reveals: ['mustatilat', 'mutasawiya'],
    },
    {
      id: 'mutasawiya', kind: 'relationship', lane: 'start', requires: 'kitabat-mutasawiya', notebook: true,
      title: 'كتابات متساوية', subtitle: '$\\frac{a\\times k}{b\\times k}$',
      reveals: ['khataJam'],
    },
    {
      id: 'mustatilat', kind: 'example', lane: 'end', requires: 'kitabat-mutasawiya',
      title: 'المستطيلات الثلاثة', subtitle: '3/5 ، 6/10 ، 12/20',
      context: { text: ACTIVITY.parts[1], note: KNOWLEDGE.example1 },
      reveals: [],
    },
    {
      // ⛔ خطأ شائع — la proposition d'Amine (4/6) réfutée par le plateau (`GUIDE.addSame`).
      id: 'khataJam', kind: 'common_mistake', lane: 'start', requires: 'kitabat-mutasawiya',
      title: 'نضيف نفس العدد؟', subtitle: '$\\frac{3}{5}\\neq\\frac{4}{6}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.addSame.wrong },
          { role: 'why', text: GUIDE.addSame.why },
          { role: 'right', text: GUIDE.addSame.right },
        ],
      },
      reveals: ['ashri'],
    },
    {
      id: 'ashri', kind: 'concept', lane: 'center', requires: 'kasr-ashri', notebook: true,
      title: 'الكسر العشري', subtitle: '$0{,}7=\\frac{7}{10}$',
      reveals: ['ikhtizal'],
    },
    {
      id: 'ikhtizal', kind: 'concept', lane: 'center', requires: 'ikhtizal', notebook: true,
      title: 'اختزال كسر', subtitle: '$\\frac{54}{45}=\\frac{6}{5}$',
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-ikhtizal', notebook: true,
      title: 'طريقة الاختزال', subtitle: 'قاسم مشترك',
      reveals: ['khataQasim'],
    },
    {
      // ⛔ خطأ شائع — diviser par un diviseur d'UN seul terme (le grand-père, `GUIDE.oneTerm`).
      id: 'khataQasim', kind: 'common_mistake', lane: 'end', requires: 'tariqat-ikhtizal',
      title: 'قاسم لحدّ واحد؟', subtitle: '$27=5\\times 5+2$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.oneTerm.wrong },
          { role: 'why', text: GUIDE.oneTerm.why },
          { role: 'right', text: GUIDE.oneTerm.right },
        ],
      },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-ikhtizal',
      title: 'الخلاصة', subtitle: '×k · ÷k · أبسط شكل',
      context: { text: GUIDE.simplest, note: METHOD.title },
      reveals: [],
    },
  ],
  edges: [
    { from: 'kitabat', to: 'mutasawiya', label: 'نضرب أو نقسم' },
    { from: 'kitabat', to: 'mustatilat', label: 'نشاط 4' },
    { from: 'mutasawiya', to: 'khataJam', label: 'خطأ شائع' },
    { from: 'khataJam', to: 'ashri', label: 'ومنه' },
    { from: 'ashri', to: 'ikhtizal', label: 'و' },
    { from: 'ikhtizal', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khataQasim', label: 'خطأ شائع' },
    { from: 'khataQasim', to: 'khulasa', label: 'نستخلص' },
  ],
};
