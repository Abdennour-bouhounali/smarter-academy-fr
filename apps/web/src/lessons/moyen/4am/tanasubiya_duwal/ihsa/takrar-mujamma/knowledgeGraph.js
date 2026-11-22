/**
 * La carte PROGRESSIVE du درس 1 « التكرار المجمع والتواتر المجمع » — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le نشاط 1 et ses calculs
 * (content/textbook.js › ACTIVITY, ACTIVITY_LINES), معارف 1 et 2 (KNOWLEDGE), ce que la plateforme formalise
 * (PROPERTY, déclaré), les طرائق (METHOD_VALUES, METHOD_CLASSES) et le `commonError` de l'exercice 1
 * (content/exercises.js). Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *   core   six items (notebook) + deux exemples (معارف 1, الزلازل) ;
 *   guide  خطأ شائع « تفوق / على الأقل » (تمرين 1), خلاصة.
 * Rien de l'إختبار أولي n'est montré ici.
 *
 *                [الصاعد والنازل لقيمة]            m1
 *                        │ نعرّفه
 *                  [التكرار المجمع]                m2
 *            مثال ┌───────┴───────┐ نقسم على N
 *       [علامات 20 تلميذا]     [التواتر المجمع]
 *     خطأ شائع │                  │ نقرأ طرفيه
 *     ⛔ [تفوق ≠ على الأقل]  [طرفا الجدول]
 *                                 │ نحسبه
 *                       [حساب التكرار المجمع لقيمة]   m3
 *                    مثال ┌───────┴───────┐ لفئة
 *                  [الزلازل]       [التواتر المجمع لفئة]
 *                                         │ نستخلص
 *                                     🎯 [خلاصة]
 */
import { ACTIVITY, ACTIVITY_LINES, KNOWLEDGE, PROPERTY, METHOD_VALUES, METHOD_CLASSES } from './content/textbook';
import { EX } from './content/exercises';

const ex1 = EX['ex-1-a'];
const ex1c = EX['ex-1-c'];

export const KNOWLEDGE_GRAPH = {
  root: 'nashat',
  nodes: [
    {
      id: 'nashat', kind: 'concept', lane: 'center', requires: 'mujamma-nashat', notebook: true,
      title: 'الصاعد والنازل لقيمة', subtitle: '$\\leq t$ ، $\\geq t$',
      context: { text: ACTIVITY.namingUp, note: ACTIVITY.namingDown },
      reveals: ['tarif'],
    },
    {
      id: 'tarif', kind: 'definition', lane: 'center', requires: 'takrar-mujamma', notebook: true,
      title: 'التكرار المجمع', subtitle: '$3 + 4 + 7 = 14$',
      reveals: ['mithal-20', 'tawatur'],
    },
    {
      id: 'mithal-20', kind: 'example', lane: 'start', requires: 'takrar-mujamma',
      title: 'علامات 20 تلميذا', subtitle: '$14$ ، $17$',
      context: { text: KNOWLEDGE.cumul.exampleLines[0], note: KNOWLEDGE.cumul.exampleLines[1] },
      reveals: ['khata-sarama'],
    },
    {
      // ⛔ خطأ شائع — le `commonError` de l'exercice 1 : « تفوق » prise pour « على الأقل ».
      id: 'khata-sarama', kind: 'common_mistake', lane: 'start', requires: 'takrar-mujamma',
      title: 'تفوق أم على الأقل؟', subtitle: '$>$ ، $\\geq$',
      context: {
        parts: [
          { role: 'wrong', text: ex1.commonError },
          { role: 'why', text: ex1.question.explain },
          { role: 'right', text: ex1c.question.explain },
        ],
      },
      reveals: [],
    },
    {
      id: 'tawatur', kind: 'definition', lane: 'end', requires: 'tawatur-mujamma', notebook: true,
      title: 'التواتر المجمع', subtitle: '$\\dfrac{14}{20}$',
      reveals: ['khasiya'],
    },
    {
      id: 'khasiya', kind: 'relationship', lane: 'center', requires: 'khasiyat-mujamma', notebook: true,
      title: 'طرفا الجدول', subtitle: '$14 + 13 = 20 + 7$',
      context: { text: PROPERTY.lines[0], note: PROPERTY.lines[2] },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'hisab-mujamma', notebook: true,
      title: 'الحساب لقيمة', subtitle: '$5 + 3 = 8$',
      reveals: ['mithal-zalazil', 'fiat'],
    },
    {
      id: 'mithal-zalazil', kind: 'example', lane: 'start', requires: 'hisab-mujamma',
      title: 'شدّة الزلازل', subtitle: '$17$',
      context: { text: METHOD_VALUES.solution[1], note: METHOD_VALUES.solution[2] },
      reveals: [],
    },
    {
      id: 'fiat', kind: 'method', lane: 'end', requires: 'tawatur-fiat', notebook: true,
      title: 'التواتر المجمع لفئة', subtitle: '$0{,}1 + 0{,}15 = 0{,}25$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la définition du manuel, puis ce que les deux bouts du tableau disent.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tawatur-fiat',
      title: 'خلاصة', subtitle: '$\\dfrac{20}{20} = 1$',
      context: { text: KNOWLEDGE.cumul.up, note: METHOD_CLASSES.rule[0], list: [ACTIVITY_LINES.atLeast159] },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nashat', to: 'tarif', label: 'نعرّفه' },
    { from: 'tarif', to: 'mithal-20', label: 'مثال' },
    { from: 'mithal-20', to: 'khata-sarama', label: 'خطأ شائع' },
    { from: 'tarif', to: 'tawatur', label: 'نقسم على الكلي' },
    { from: 'tawatur', to: 'khasiya', label: 'نقرأ طرفيه' },
    { from: 'khasiya', to: 'tariqa', label: 'نحسبه' },
    { from: 'tariqa', to: 'mithal-zalazil', label: 'مثال' },
    { from: 'tariqa', to: 'fiat', label: 'لفئة' },
    { from: 'fiat', to: 'khulasa', label: 'نستخلص' },
  ],
};
