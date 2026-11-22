/**
 * La carte PROGRESSIVE du درس 3 de l'unité 2 — « حل المعادلة من الشكل x² = a »
 * (docs/architecture/KNOWLEDGE_MAP.md, Part A ; référence : qasim-adad-tabii).
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon —
 * le manuel (content/textbook.js : نشاط 3, معارف 3, طرائق, أستعدّ), les
 * exercices et leurs `method` / `commonError` / corrections
 * (content/exercises.js), les questions des محاور. Chaque nœud est gardé par
 * l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                    [المعادلة من الشكل x² = a]          مفهوم      (محور 1)
 *                               │ يعتمد على
 *                   [عددان متعاكسان، مربع واحد]          علاقة 📓
 *               تذكّر ┌──────────┴──────────┐ مثال
 *          📌 [مربع عدد سالب]          [جدول النشاط]
 *                                           │ خطأ شائع
 *                                     ⛔ [مراد نسي حلا]
 *                               │ يؤدي إلى
 *                    [عدد الحلول حسب إشارة a]            علاقة 📓   (محور 2)
 *               مثال ┌──────────┴──────────┐ انتبه إلى
 *             [أمثلة محلولة]        ⚠️ [مربع أي عدد موجب]
 *                    └──────────┬──────────┘ نحلّها بـ
 *                       [طريقة حل المعادلة]              طريقة 📓   (محور 3)
 *               مثال ┌──────────┴──────────┐ خطأ شائع
 *            [أمثلة الطريقة]       ⛔ [إهمال إشارة −x²]
 *                    └──────────┬──────────┘ نستخلص
 *                           🎯 [الخلاصة]
 *
 * (Schéma en ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 */
import { ACTIVITY, KNOWLEDGE, METHOD, PREP_ITEMS } from './content/textbook';
import { EX } from './content/exercises';

const { prop1, prop2 } = KNOWLEDGE;
const now = EX['now-23-2'];

// Le tableau de l'activité 3 : les carrés se CALCULENT à partir des x du manuel.
const texOf = (v) => {
  const sign = v < 0 ? '-' : '';
  const a = Math.abs(v);
  if (Number.isInteger(a)) return `${sign}${a}`;
  const den = 2; // les valeurs non entières du manuel sont des demis (±3/2)
  return `${sign}\\dfrac{${a * den}}{${den}}`;
};
const squareTex = (v) => {
  const a = Math.abs(v);
  if (Number.isInteger(a)) return String(a * a);
  return `\\dfrac{${(a * 2) ** 2}}{4}`;
};
const row = (v) => `$\\left(${texOf(v)}\\right)^2 = ${squareTex(v)}$`;
const [xNeg] = ACTIVITY.numbers.table;

export const KNOWLEDGE_GRAPH = {
  root: 'muadala',
  nodes: [
    {
      id: 'muadala', kind: 'concept', lane: 'center', requires: 'murabba-mutaakisayn',
      title: 'المعادلة من الشكل x² = a', subtitle: '$x^2 = a$',
      context: { text: ACTIVITY.situation },
      reveals: ['mutaakisayn'],
    },
    {
      id: 'mutaakisayn', kind: 'relationship', lane: 'center', requires: 'murabba-mutaakisayn', notebook: true,
      title: 'عددان متعاكسان، مربع واحد', subtitle: '$(-\\sqrt{a})^2 = a$',
      reveals: ['tadhakkar', 'jadwal', 'hulul'],
    },
    {
      // 📌 تذكّر — « أستعدّ » : le carré d'un nombre négatif (priorKnowledge
      // murabba-adad), avec le conseil du diagnostic.
      id: 'tadhakkar', kind: 'prerequisite', lane: 'start', requires: 'murabba-mutaakisayn',
      title: 'مربع عدد سالب', subtitle: '$(-6)^2 = 36$',
      context: { text: 'جداء عددين سالبين عدد موجب', list: [PREP_ITEMS[1].why, PREP_ITEMS[0].why] },
      reveals: [],
    },
    {
      id: 'jadwal', kind: 'example', lane: 'end', requires: 'murabba-mutaakisayn',
      title: 'جدول النشاط', subtitle: row(xNeg),
      context: {
        text: 'عمودا العددين المتعاكسين في الجدول لهما نفس المربع.',
        list: ACTIVITY.numbers.table.map(row),
        formula: '$(-b)^2 = (-b) \\times (-b) = b \\times b = b^2$',
      },
      reveals: ['khata-murad'],
    },
    {
      // ⛔ خطأ شائع — le مراد du manuel (نشاط 3, 2 أ), la question 4 du
      // module 1, et le `commonError` de l'exercice 11.
      id: 'khata-murad', kind: 'common_mistake', lane: 'end', requires: 'murabba-mutaakisayn',
      title: 'مراد نسي حلا', subtitle: '$(-3)^2 = 9$',
      context: {
        parts: [
          { role: 'wrong', text: 'قال مراد: «إنّ حل المعادلة $x^2 = 9$ هو 3، لأنّ $3^2 = 9$»' },
          { role: 'why', text: '$3^2 = 9$ و $(-3)^2 = 9$: لعددين متعاكسين نفس المربع.' },
          { role: 'right', text: prop2.examples[0] },
          { role: 'example', text: EX['ex-11'].commonError },
        ],
      },
      reveals: [],
    },
    {
      id: 'hulul', kind: 'relationship', lane: 'center', requires: 'hulul-x2-a', notebook: true,
      title: 'عدد الحلول حسب إشارة a', subtitle: 'حلان · حل واحد · لا حل',
      reveals: ['amthila', 'intabih'],
    },
    {
      id: 'amthila', kind: 'example', lane: 'start', requires: 'hulul-x2-a',
      title: 'أمثلة محلولة', subtitle: '$x^2 = 5$',
      context: { list: prop2.examples },
      reveals: [],
    },
    {
      // ⚠️ انتبه — la note de la خاصية 1 et la ligne جـ) de la طريقة.
      id: 'intabih', kind: 'warning', lane: 'end', requires: 'hulul-x2-a',
      title: 'مربع أي عدد موجب', subtitle: '$x^2 \\geq 0$',
      context: { text: prop1.note, note: METHOD.solution[2] },
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-hall-x2', notebook: true,
      title: 'طريقة حل المعادلة', subtitle: '$x^2 = (\\sqrt{a})^2$',
      reveals: ['amthila-tariqa', 'khata-ishara'],
    },
    {
      id: 'amthila-tariqa', kind: 'example', lane: 'start', requires: 'tariqat-hall-x2',
      title: 'أمثلة الطريقة', subtitle: '$x^2 = \\dfrac{1}{4}$',
      context: { list: METHOD.solution.slice(0, 2) },
      reveals: [],
    },
    {
      // ⛔ خطأ شائع — دوري الآن 2 : `commonError`, la correction de la ligne
      // « −x² = 2 », et la `method` de l'exercice.
      id: 'khata-ishara', kind: 'common_mistake', lane: 'end', requires: 'tariqat-hall-x2',
      title: 'إهمال الإشارة', subtitle: '$-x^2 = 2$',
      context: {
        parts: [
          { role: 'wrong', text: now.commonError },
          { role: 'why', text: now.question.rows[0].correction },
          { role: 'right', text: now.method },
        ],
      },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la خاصية 2 et la طريقة, réunies.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-hall-x2',
      title: 'إشارة a أولًا', subtitle: '$x = \\sqrt{a}$ أو $x = -\\sqrt{a}$',
      context: {
        text: 'لحل $x^2 = a$ ننظر أولًا إلى إشارة $a$: حلان متعاكسان $\\sqrt{a}$ و $-\\sqrt{a}$ إذا كان $a > 0$، حل واحد هو 0 إذا كان $a = 0$، ولا حل إذا كان $a < 0$.',
        note: 'وإذا لم تكن المعادلة على هذا الشكل، نعزل $x^2$ أولًا.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'muadala', to: 'mutaakisayn', label: 'يعتمد على' },
    { from: 'mutaakisayn', to: 'tadhakkar', label: 'تذكّر' },
    { from: 'mutaakisayn', to: 'jadwal', label: 'مثال' },
    { from: 'jadwal', to: 'khata-murad', label: 'خطأ شائع' },
    { from: 'mutaakisayn', to: 'hulul', label: 'يؤدي إلى' },
    { from: 'hulul', to: 'amthila', label: 'مثال' },
    { from: 'hulul', to: 'intabih', label: 'انتبه إلى' },
    { from: 'amthila', to: 'tariqa', label: 'نحلّها بـ' },
    { from: 'intabih', to: 'tariqa', label: 'نحلّها بـ' },
    { from: 'tariqa', to: 'amthila-tariqa', label: 'مثال' },
    { from: 'tariqa', to: 'khata-ishara', label: 'خطأ شائع' },
    { from: 'khata-ishara', to: 'khulasa', label: 'نستخلص' },
    { from: 'amthila-tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
