/**
 * La carte PROGRESSIVE du درس « التناسبية والتمثيل البياني » (3AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A. Aucune mathématique n'est écrite ici : chaque texte vient de la
 * leçon (content/textbook.js, `GUIDE`). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   [عمود = نقطة] (M1) → [نقط مع O] (M1) → [ما ليس تناسبيًا] (M1) ── خطأ شائع ── ⛔ [الاستقامة تكفي؟]
 *        ثم │
 *   [ترتيب الفاصلة 1] (M1) → [الفاصلة والترتيب] (M2) → [التمثيل البياني] (M2) → [y = ax] (M3) → [قراءة قيمة] (M3) → 🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'nuqta',
  nodes: [
    {
      id: 'nuqta', kind: 'concept', lane: 'center', requires: 'nuqta-jadwal', notebook: true,
      title: 'عمود الجدول نقطة', subtitle: '$(x\\ ;\\ y)$',
      context: { text: GUIDE.onePin },
      reveals: ['maa-o'],
    },
    {
      id: 'maa-o', kind: 'relationship', lane: 'center', requires: 'khassiya-tanasub', notebook: true,
      title: 'نقط التناسبية مع O', subtitle: 'مستقيم يمرّ بـ $O$',
      context: { text: KNOWLEDGE.property1.text },
      reveals: ['khata-istiqama', 'ghayr'],
    },
    {
      id: 'ghayr', kind: 'relationship', lane: 'end', requires: 'ghayr-tanasubi', notebook: true,
      title: 'ما ليس تناسبيًا', subtitle: 'لا يمرّ بـ $O$ أو ليست مستقيمة',
      context: { text: KNOWLEDGE.refuse.text },
      reveals: ['muamil'],
    },
    {
      // ⛔ خطأ شائع — croire que l'alignement suffit (le refus du labo : la règle touche les quatre punaises, O reste dehors).
      id: 'khata-istiqama', kind: 'common_mistake', lane: 'start', requires: 'ghayr-tanasubi',
      title: 'الاستقامة تكفي؟', subtitle: 'على استقامة لا تعني تناسبية',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.lineAny.wrong },
          { role: 'why', text: GUIDE.lineAny.why },
          { role: 'right', text: GUIDE.lineAny.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'muamil', kind: 'term', lane: 'center', requires: 'muamil-qiraa', notebook: true,
      title: 'معامل التناسبية', subtitle: 'ترتيب الفاصلة $1$',
      context: { text: GUIDE.onO },
      reveals: ['ihdathiyat'],
    },
    {
      id: 'ihdathiyat', kind: 'term', lane: 'center', requires: 'ihdathiyat', notebook: true,
      title: 'الفاصلة والترتيب', subtitle: '$(x\\ ;\\ y)$',
      context: { text: KNOWLEDGE.definition.text },
      reveals: ['tamthil'],
    },
    {
      id: 'tamthil', kind: 'relationship', lane: 'center', requires: 'tamthil-tanasub', notebook: true,
      title: 'التمثيل البياني للتناسبية', subtitle: 'استقامة مع $O$',
      context: { text: KNOWLEDGE.property2.text, note: KNOWLEDGE.refuse.text },
      reveals: ['yax'],
    },
    {
      id: 'yax', kind: 'method', lane: 'center', requires: 'y-ax', notebook: true,
      title: 'العلاقة y = ax', subtitle: '$y = a \\times x$',
      context: { text: KNOWLEDGE.coefficient.text },
      reveals: ['qiraa'],
    },
    {
      id: 'qiraa', kind: 'method', lane: 'center', requires: 'qiraa-qima', notebook: true,
      title: 'قراءة قيمة مجهولة', subtitle: 'ترتيب أو فاصلة',
      context: { text: METHOD.read.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'qiraa-qima',
      title: 'الخلاصة', subtitle: 'نقط مع $O$ ⟺ تناسبية',
      context: { text: KNOWLEDGE.property1.text, note: KNOWLEDGE.property2.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nuqta', to: 'maa-o', label: 'ثم' },
    { from: 'maa-o', to: 'ghayr', label: 'وإن لم' },
    { from: 'maa-o', to: 'khata-istiqama', label: 'خطأ شائع' },
    { from: 'ghayr', to: 'muamil', label: 'نقرأ' },
    { from: 'muamil', to: 'ihdathiyat', label: 'نسمّي' },
    { from: 'ihdathiyat', to: 'tamthil', label: 'ثم' },
    { from: 'tamthil', to: 'yax', label: 'نكتب' },
    { from: 'yax', to: 'qiraa', label: 'نستعملها' },
    { from: 'qiraa', to: 'khulasa', label: 'نستخلص' },
  ],
};
