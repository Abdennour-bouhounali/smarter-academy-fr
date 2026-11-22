/**
 * La carte PROGRESSIVE du درس « حصر عدد عشري موجب » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte
 * vient de la leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`). 4AM emploie cette compétence
 * (√n arrondie à un rang avec 1,41 < √2 < 1,42, la trigonométrie, les moyennes arrondies) sans lien du réseau : les aides le disent sans lien.
 *
 *   [المدوّر] (M1)
 *      │ الطريق المعاكس                       │ علامتان
 *   [الحصر من المدوّر] (M1)               [القيمتان المقرّبتان] (M1) ── ثم ──▶ [الحصر إلى رتبة] (M2)
 *      │ خطأ شائع                                                          │ خطأ شائع             │ تطبيق
 *   ⛔ [التدوير حذف؟]                                                ⛔ [الطرف الأيمن؟]     [حاصل القسمة] (M3) → [أحصر وأدوّر] → [أحصر من المدوّر] → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'mudawwar',
  nodes: [
    {
      id: 'mudawwar', kind: 'concept', lane: 'center', requires: 'tadwir', notebook: true,
      title: 'المدوّر', subtitle: '$6{,}358\\to6{,}4$',
      context: { text: KNOWLEDGE.round.text, note: KNOWLEDGE.round.example },
      reveals: ['ma-aksi', 'muqarraban'],
    },
    {
      id: 'ma-aksi', kind: 'relationship', lane: 'start', requires: 'hasr-min-mudawwar', notebook: true,
      title: 'من المدوّر إلى الحصر', subtitle: '$r-\\frac{1}{2}u\\le x<r+\\frac{1}{2}u$',
      context: { text: KNOWLEDGE.fromRound.text, note: KNOWLEDGE.fromRound.example },
      reveals: ['khata-hadhf'],
    },
    {
      // ⛔ خطأ شائع — « التدوير حذف للأرقام » (labo : 1,25 يقرأ 1,3 ; اختبار أولي 3).
      id: 'khata-hadhf', kind: 'common_mistake', lane: 'start', requires: 'hasr-min-mudawwar',
      title: 'التدوير حذف؟', subtitle: '$3{,}68$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.trunc.wrong },
          { role: 'why', text: GUIDE.trunc.why },
          { role: 'right', text: GUIDE.trunc.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'muqarraban', kind: 'relationship', lane: 'end', requires: 'qimatan-muqarraban', notebook: true,
      title: 'القيمتان المقرّبتان', subtitle: '$0{,}285<\\frac{2}{7}<0{,}286$',
      context: { text: KNOWLEDGE.chain.text, note: KNOWLEDGE.chain.example },
      reveals: ['rutba'],
    },
    {
      id: 'rutba', kind: 'relationship', lane: 'end', requires: 'hasr-rutba', notebook: true,
      title: 'الحصر إلى رتبة', subtitle: '$6{,}35\\le 6{,}358<6{,}36$',
      context: { text: GUIDE.together, note: KNOWLEDGE.chain.example },
      reveals: ['khata-yamin', 'hasil'],
    },
    {
      id: 'khata-yamin', kind: 'common_mistake', lane: 'end', requires: 'hasr-rutba',
      title: 'الطرف الأيمن مشمول؟', subtitle: '$x\\le 3{,}65$',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.closed.wrong },
          { role: 'why', text: GUIDE.closed.why },
          { role: 'right', text: GUIDE.closed.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'hasil', kind: 'term', lane: 'center', requires: 'tariqa-hasil', notebook: true,
      title: 'حاصل القسمة', subtitle: '$\\frac{355}{113}$',
      context: { text: KNOWLEDGE.quotient.text },
      reveals: ['tariqa-rutba'],
    },
    {
      id: 'tariqa-rutba', kind: 'method', lane: 'center', requires: 'tariqa-hasr-rutba', notebook: true,
      title: 'أحصر عددًا وأدوّره', subtitle: '$7{,}48\\le 7{,}4826<7{,}49$',
      context: { text: METHOD.rank.rule },
      reveals: ['tariqa-mudawwar'],
    },
    {
      id: 'tariqa-mudawwar', kind: 'method', lane: 'center', requires: 'tariqa-hasr-mudawwar', notebook: true,
      title: 'أحصر عددًا علمت مدوّره', subtitle: '$3{,}715\\le a<3{,}725$',
      context: { text: METHOD.fromRound.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqa-hasr-mudawwar',
      title: 'الخلاصة', subtitle: '$r-\\frac{1}{2}u\\le x<r+\\frac{1}{2}u$',
      context: { text: GUIDE.together, note: GUIDE.halfOpen },
      reveals: [],
    },
  ],
  edges: [
    { from: 'mudawwar', to: 'ma-aksi', label: 'الطريق المعاكس' },
    { from: 'ma-aksi', to: 'khata-hadhf', label: 'خطأ شائع' },
    { from: 'mudawwar', to: 'muqarraban', label: 'علامتان' },
    { from: 'muqarraban', to: 'rutba', label: 'ثم' },
    { from: 'rutba', to: 'khata-yamin', label: 'خطأ شائع' },
    { from: 'rutba', to: 'hasil', label: 'تطبيق' },
    { from: 'hasil', to: 'tariqa-rutba', label: 'نستعملها' },
    { from: 'tariqa-rutba', to: 'tariqa-mudawwar', label: 'ثم' },
    { from: 'tariqa-mudawwar', to: 'khulasa', label: 'نستخلص' },
  ],
};
