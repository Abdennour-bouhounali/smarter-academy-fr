/**
 * La carte PROGRESSIVE du درس « التعليم على مستقيم مدرّج » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_GRAD`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                          [طريق القرية] (M1)                              مفهوم
 *               نحمل ┌────────┴────────┐ ونقرأ
 *    [الوحدة في الجهتين] (M1)        [فاصلة نقطة] (M1)
 *       خطأ شائع │ ثم                  │ خطأ شائع │ ثم
 *   ⛔ [الصفر في أقصى اليسار؟]  ⛔ [غرب = موجبة؟]  [نقطتان متناظرتان] (M1)
 *                                          خطأ شائع │ ثم
 *                                   ⛔ [النظيرة نفسها؟]  [الحصر] (M1)
 *                                                  خطأ شائع │ نسمّي
 *                                            ⛔ [بين −1 و 0؟]  [المستقيم المدرّج] (M2)
 *                                                          │ بطريقة
 *                                                    [أدرّج وأعلّم] (M3)
 *                                                          │ نستخلص
 *                                                     🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_GRAD, GUIDE } from './content/textbook';

const mistake = (id, lane, requires, title, subtitle, g, reveals = []) => ({
  id, kind: 'common_mistake', lane, requires, title, subtitle,
  context: { parts: [{ role: 'wrong', text: g.wrong }, { role: 'why', text: g.why }, { role: 'right', text: g.right }] },
  reveals,
});

export const KNOWLEDGE_GRAPH = {
  root: 'tarik',
  nodes: [
    {
      id: 'tarik', kind: 'concept', lane: 'center', requires: 'tadrij-jihatayn',
      title: 'طريق القرية', subtitle: 'المحطّة هي المبدأ',
      context: { text: 'على طريق مستقيمة لا يُكتب إلا الصفر عند المحطّة: ما نحمله من خطوات شرقًا يعطي أعدادًا، وما نحمله غربًا يعطي أعدادًا أخرى.', note: 'ثمّ يصير لكلّ بيت عدد يسمّى فاصلته.' },
      reveals: ['wahda', 'fasila'],
    },
    {
      id: 'wahda', kind: 'concept', lane: 'start', requires: 'tadrij-jihatayn', notebook: true,
      title: 'الوحدة في الجهتين', subtitle: '$-1\\ ;\\ 0\\ ;\\ 1$',
      context: { text: KNOWLEDGE.bothSides.text, note: KNOWLEDGE.line.definition },
      reveals: ['khataLeft'],
    },
    mistake('khataLeft', 'start', 'tadrij-jihatayn', 'الصفر في أقصى اليسار؟', '$0$ أم $-3$ ؟', GUIDE.leftIsZero),
    {
      id: 'fasila', kind: 'relationship', lane: 'end', requires: 'fasila-nuqta', notebook: true,
      title: 'فاصلة نقطة', subtitle: '$A(-3)$ و $B(2{,}7)$',
      context: { text: KNOWLEDGE.abscissa.definition },
      reveals: ['khataWest', 'mutanazir'],
    },
    mistake('khataWest', 'end', 'fasila-nuqta', 'غرب المبدإ فاصلة موجبة؟', '$3$ أم $-3$ ؟', GUIDE.westPositive),
    {
      id: 'mutanazir', kind: 'concept', lane: 'center', requires: 'nuqtatan-mutanazirtan', notebook: true,
      title: 'نقطتان متناظرتان', subtitle: '$A(-3)$ و $A\'(3)$',
      context: { text: KNOWLEDGE.symmetric.text },
      reveals: ['khataSym', 'hasr'],
    },
    mistake('khataSym', 'start', 'nuqtatan-mutanazirtan', 'النظيرة بالفاصلة نفسها؟', '$-3\\to 3$', GUIDE.symSame),
    {
      id: 'hasr', kind: 'relationship', lane: 'end', requires: 'hasr-fasila', notebook: true,
      title: 'الحصر بين علامتين', subtitle: '$-2<-1{,}5<-1$',
      context: { text: KNOWLEDGE.bounds.text, note: KNOWLEDGE.origin.text },
      reveals: ['khataTrunc', 'mustaqim'],
    },
    mistake('khataTrunc', 'end', 'hasr-fasila', 'بين $-1$ و $0$ ؟', '$-1{,}5$', GUIDE.truncBound),
    {
      id: 'mustaqim', kind: 'concept', lane: 'center', requires: 'mustaqim-mudarraj', notebook: true,
      title: 'المستقيم المدرّج', subtitle: '$O$ ، الاتجاه ، $OI$',
      context: { text: KNOWLEDGE.line.definition },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tadrij-wa-talim', notebook: true,
      title: 'أدرّج وأعلّم', subtitle: '$M(-4)$ و $N(1{,}6)$',
      context: { text: METHOD_GRAD.exercise, note: METHOD_GRAD.rule },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tadrij-wa-talim',
      title: 'الخلاصة', subtitle: 'المبدأ ، الاتجاه ، الوحدة',
      context: { text: 'ندرّج المستقيم بنقل الوحدة نفسها من جهتي المبدإ؛ فاصلة النقطة هي بعدها عن المبدإ مع إشارة جهتها؛ والنقطتان المتناظرتان فاصلتاهما متعاكستان؛ وما لا يقع على علامة نحصره بين علامتين متتاليتين.', note: 'الصفر هو المبدأ، لا أوّل علامة مكتوبة.' },
      reveals: [],
    },
  ],
  edges: [
    { from: 'tarik', to: 'wahda', label: 'نحمل' },
    { from: 'tarik', to: 'fasila', label: 'ونقرأ' },
    { from: 'wahda', to: 'khataLeft', label: 'خطأ شائع' },
    { from: 'fasila', to: 'khataWest', label: 'خطأ شائع' },
    { from: 'fasila', to: 'mutanazir', label: 'ثم' },
    { from: 'mutanazir', to: 'khataSym', label: 'خطأ شائع' },
    { from: 'mutanazir', to: 'hasr', label: 'ثم' },
    { from: 'hasr', to: 'khataTrunc', label: 'خطأ شائع' },
    { from: 'hasr', to: 'mustaqim', label: 'نسمّي' },
    { from: 'mustaqim', to: 'tariqa', label: 'بطريقة' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
