/**
 * La carte PROGRESSIVE du درس « حاصل القسمة والكسر » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (نشاط 1, معارف 1, `GUIDE`, la طريقة).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                  [الكعكات والأطفال]                              مفهوم
 *        نكتب ┌──────────┴──────────┐ نشاط 1
 *   [الكسر حاصل قسمة] (M1)        [خمسة أرغفة لستة]
 *      خطأ شائع │
 *   ⛔ [الكسر مقلوب؟]
 *          ومنه │
 *   [الكسر مضروبًا في مقامه] (M2)
 *       وأيضًا │
 *   [عشري وغير عشري] (M2)
 *      خطأ شائع │
 *   ⛔ [العشري دائمًا؟]
 *       بطريقة │
 *   [إيجاد العدد الناقص] (M3)
 *      نستخلص │
 *   🎯 [الخلاصة]
 */
import { ACTIVITY, KNOWLEDGE, GUIDE, METHOD } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'hasil',
  nodes: [
    {
      id: 'hasil', kind: 'concept', lane: 'center', requires: 'kasr-hasil-qisma',
      title: 'كعكات لأطفال', subtitle: 'حصّة لكل واحد',
      context: { text: ACTIVITY.text, note: 'وزّعنا الكعكات بالتساوي على الأطفال.' },
      reveals: ['raghif', 'kasr'],
    },
    {
      id: 'kasr', kind: 'relationship', lane: 'start', requires: 'kasr-hasil-qisma', notebook: true,
      title: 'الكسر حاصل قسمة', subtitle: '$a\\div b=\\frac{a}{b}$',
      reveals: ['khataQalb'],
    },
    {
      id: 'raghif', kind: 'example', lane: 'end', requires: 'kasr-hasil-qisma',
      title: 'خمسة أرغفة لستة أشخاص', subtitle: '$5\\div 6=\\frac{5}{6}$',
      context: { text: ACTIVITY.parts[2], note: KNOWLEDGE.example1 },
      reveals: [],
    },
    {
      // ⛔ خطأ شائع — le quotient écrit à l'envers (`GUIDE.upsideDown`).
      id: 'khataQalb', kind: 'common_mistake', lane: 'start', requires: 'kasr-hasil-qisma',
      title: 'الكسر مقلوب؟', subtitle: '$5\\div 6\\neq\\frac{6}{5}$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.upsideDown.wrong },
          { role: 'why', text: GUIDE.upsideDown.why },
          { role: 'right', text: GUIDE.upsideDown.right },
        ],
      },
      reveals: ['natija'],
    },
    {
      id: 'natija', kind: 'concept', lane: 'center', requires: 'natija-darb', notebook: true,
      title: 'الكسر مضروبًا في مقامه', subtitle: '$\\frac{a}{b}\\times b=a$',
      reveals: ['ashri'],
    },
    {
      id: 'ashri', kind: 'concept', lane: 'center', requires: 'ashri-ghayr-ashri', notebook: true,
      title: 'عشري وغير عشري', subtitle: '$\\frac{7}{3}$ و $2{,}33$',
      context: { text: KNOWLEDGE.example2, note: KNOWLEDGE.remarks[1] },
      reveals: ['khataAshri'],
    },
    {
      // ⛔ خطأ شائع — la division décimale « donne toujours la part exacte » (`GUIDE.decimalOnly`).
      id: 'khataAshri', kind: 'common_mistake', lane: 'end', requires: 'ashri-ghayr-ashri',
      title: 'العشري دائمًا؟', subtitle: '$3\\times 0{,}66=1{,}98$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.decimalOnly.wrong },
          { role: 'why', text: GUIDE.decimalOnly.why },
          { role: 'right', text: GUIDE.decimalOnly.right },
        ],
      },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-adad-naqis', notebook: true,
      title: 'إيجاد العدد الناقص', subtitle: '$b\\times\\ldots=a$',
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-adad-naqis',
      title: 'الخلاصة', subtitle: '÷ · × b · عشري أو لا',
      context: { text: GUIDE.notAlwaysDecimal, note: METHOD.title },
      reveals: [],
    },
  ],
  edges: [
    { from: 'hasil', to: 'kasr', label: 'نكتب' },
    { from: 'hasil', to: 'raghif', label: 'نشاط 1' },
    { from: 'kasr', to: 'khataQalb', label: 'خطأ شائع' },
    { from: 'khataQalb', to: 'natija', label: 'ومنه' },
    { from: 'natija', to: 'ashri', label: 'وأيضًا' },
    { from: 'ashri', to: 'khataAshri', label: 'خطأ شائع' },
    { from: 'khataAshri', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
