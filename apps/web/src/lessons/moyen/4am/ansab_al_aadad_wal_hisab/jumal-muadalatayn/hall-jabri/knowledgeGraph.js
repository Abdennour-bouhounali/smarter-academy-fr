/**
 * La carte PROGRESSIVE du درس 2 « حل جملة معادلتين من الدرجة الأولى بمجهولين جبرياً » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 2 et ses deux
 * élèves (content/textbook.js › ACTIVITY, IDEAS), l'exercice résolu et l'encadré des طرائق p. 59
 * (METHOD, METHOD_BOX), la règle de choix (CHOICE), et les `commonError` / `method` des
 * exercices (content/exercises.js). Chaque nœud est gardé par l'item de knowledge.jsx qui
 * l'établit (`requires`). Rien de l'إختبار أولي (QCM 5 et 6, les jumal de la plateforme) n'y est.
 *
 *              [نتخلّص من أحد المجهولين]                m1
 *                        │ مثال
 *                  [التلميذان]
 *                        │ ثم
 *               [الحل ثنائية لا عدد واحد]
 *           بالتعويض ┌───┴───┐ بالجمع
 *          [طريقة التعويض]   [طريقة الجمع]                 m2
 *                │ مثال            │ مثال
 *          [الجملة (1)]        [الجملة (2)]
 *                │ خطأ شائع   نختار ┌──┴──┐ خطأ شائع
 *        ⛔[المعادلة نفسها] [اختيار الطريقة] ⛔[طرف واحد]
 *                                       │ نتحقق منه بـ
 *                              🔍 [في المعادلتين]
 *                                       │ نستخلص
 *                                   🎯 [خلاصة]
 */
import { ACTIVITY, IDEAS, METHOD, METHOD_BOX, CHOICE } from './content/textbook';
import { EX } from './content/exercises';

const ex5 = EX['ex-5-a'];
const ex7 = EX['ex-7-a'];

export const KNOWLEDGE_GRAPH = {
  root: 'takhallus',
  nodes: [
    {
      id: 'takhallus', kind: 'idea', lane: 'center', requires: 'takhallus-majhul', notebook: true,
      title: 'نتخلّص من أحد المجهولين', subtitle: 'معادلة بمجهول واحد',
      context: { text: IDEAS.takhallus },
      reveals: ['talamidh'],
    },
    {
      id: 'talamidh', kind: 'example', lane: 'center', requires: 'takhallus-majhul',
      title: 'إكرام وإسحاق', subtitle: '$x = 3$',
      context: { list: [ACTIVITY.students[1][0], ACTIVITY.students[2][0], ACTIVITY.students[2][1]] },
      reveals: ['thunaiya'],
    },
    {
      id: 'thunaiya', kind: 'retain', lane: 'center', requires: 'hall-thunaiya', notebook: true,
      title: 'الحل ثنائية لا عدد واحد', subtitle: '$(3 ; 6)$',
      context: { text: IDEAS.thunaiya },
      reveals: ['tawid', 'jam'],
    },
    {
      id: 'tawid', kind: 'method', lane: 'start', requires: 'tariqat-tawid', notebook: true,
      title: 'طريقة التعويض',
      context: { text: METHOD_BOX.items[0] },
      reveals: ['mithal1'],
    },
    {
      id: 'mithal1', kind: 'example', lane: 'start', requires: 'tariqat-tawid',
      title: 'المثال الأوّل بالتعويض', subtitle: '$y = -3$',
      context: { text: METHOD.one.solution[1], note: METHOD.one.solution[2] },
      reveals: ['khata-nafs'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 5 (x + 2y = 9 → 9 = 9).
      id: 'khata-nafs', kind: 'common_mistake', lane: 'start', requires: 'tariqat-tawid',
      title: 'التعويض في المعادلة نفسها', subtitle: '$9 = 9$',
      context: {
        parts: [
          { role: 'wrong', text: ex5.commonError },
          { role: 'why', text: METHOD_BOX.items[0] },
          { role: 'right', text: ex5.method },
        ],
      },
      reveals: [],
    },
    {
      id: 'jam', kind: 'method', lane: 'end', requires: 'tariqat-jam', notebook: true,
      title: 'طريقة الجمع',
      context: { text: METHOD_BOX.items[1] },
      reveals: ['mithal2'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 7 (un seul membre multiplié).
      id: 'khata-taraf', kind: 'common_mistake', lane: 'end', requires: 'tariqat-jam',
      title: 'ضرب طرف واحد', subtitle: '$-3x + 6y = 3$',
      context: {
        parts: [
          { role: 'wrong', text: ex7.commonError },
          { role: 'why', text: METHOD_BOX.items[1] },
          { role: 'right', text: ex7.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'mithal2', kind: 'example', lane: 'end', requires: 'tariqat-jam',
      title: 'المثال الثاني بالجمع', subtitle: '$y = 3$',
      context: { text: METHOD.two.solution[1], note: METHOD.two.solution[2] },
      reveals: ['khata-taraf', 'ikhtiyar'],
    },
    {
      id: 'ikhtiyar', kind: 'tip', lane: 'center', requires: 'ikhtiyar-tariqa', notebook: true,
      title: 'اختيار الطريقة الأنسب',
      context: { text: CHOICE.rule, list: [CHOICE.sub, CHOICE.add] },
      reveals: ['tahaqquq'],
    },
    {
      // 🔍 تحقّق — l'exercice résolu vérifie la ثنائية dans les deux équations.
      id: 'tahaqquq', kind: 'check', lane: 'center', requires: 'ikhtiyar-tariqa',
      title: 'نتحقّق في المعادلتين',
      context: { text: IDEAS.check, note: METHOD.one.solution[4] },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — l'encadré « طريقة » du manuel.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'ikhtiyar-tariqa',
      title: 'خلاصة', subtitle: 'التعويض أو الجمع',
      context: { text: METHOD_BOX.text, list: METHOD_BOX.items },
      reveals: [],
    },
  ],
  edges: [
    { from: 'takhallus', to: 'talamidh', label: 'مثال' },
    { from: 'talamidh', to: 'thunaiya', label: 'ثم' },
    { from: 'thunaiya', to: 'tawid', label: 'بالتعويض' },
    { from: 'thunaiya', to: 'jam', label: 'بالجمع' },
    { from: 'tawid', to: 'mithal1', label: 'مثال' },
    { from: 'mithal1', to: 'khata-nafs', label: 'خطأ شائع' },
    { from: 'jam', to: 'mithal2', label: 'مثال' },
    { from: 'mithal2', to: 'khata-taraf', label: 'خطأ شائع' },
    { from: 'mithal2', to: 'ikhtiyar', label: 'نختار' },
    { from: 'ikhtiyar', to: 'tahaqquq', label: 'نتحقق منه بـ' },
    { from: 'tahaqquq', to: 'khulasa', label: 'نستخلص' },
  ],
};
