/**
 * La carte PROGRESSIVE du درس « المتطابقات الشهيرة » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A (référence : qasim-adad-tabii).
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon —
 * نشاط 2, ديكارت, معارف 2 et la طريقة (content/textbook.js), les exercices et
 * leurs `method` / `commonError` (content/exercises.js). Chaque nœud est gardé
 * par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 *                         [مربع مجموع]                          (محور 1)
 *              مثال ┌──────────┼────────────┐ بالأعداد
 *          [جدول ديكارت]  وللفرق │       [الحساب الذهني]
 *        خطأ شائع │              │              │ خطأ شائع
 *      ⛔ [نسيان 2ab]      [مربع فرق]    ⛔ [تربيع الجزأين فقط]
 *                  والجداء ┌────┴────┐ خطأ شائع
 *        [جداء مجموع حدين وفرقهما]   ⛔ [مربع فرق ≠ فرق مربعين]   (محور 2)
 *                 │ ثلاث متطابقات
 *           [المتطابقة]                                         (محور 3)
 *                 │ نوظّفها
 *       [نشر بمتطابقة شهيرة]                                    (محور 4)
 *                 │ نستخلص
 *          🎯 [ثلاث متطابقات]
 *
 * Les couloirs (lane) sont choisis pour la mise en page testée
 * (lessonGraphs.test.js) : le jidaa à côté de l'erreur du carré d'une
 * différence, jamais l'étiquette d'une longue arête posée sur un nœud.
 */
import { KNOWLEDGE, METHOD, PLATFORM } from './content/textbook';
import { EX } from './content/exercises';

const { squareSum, squareDiff, sumDiff } = KNOWLEDGE;
const ex9 = EX['ex-9'];
const ex11 = EX['ex-11'];
const ex13 = EX['ex-13'];

export const KNOWLEDGE_GRAPH = {
  root: 'majmu',
  nodes: [
    {
      id: 'majmu', kind: 'relationship', lane: 'center', requires: 'murabba-majmu', notebook: true,
      title: 'مربع مجموع', subtitle: squareSum.text,
      reveals: ['dikart', 'dhihni', 'farq'],
    },
    {
      // Le tableau de Descartes : la lecture par aires d'un carré, la grille du terrain — sur l'exemple de la PLATEFORME (2x + 2)² et ses mots
      // (rollout 2026-11-11 : ni le paragraphe ni la figure du manuel dans la carte ouverte).
      id: 'dikart', kind: 'example', lane: 'start', requires: 'murabba-majmu',
      title: 'جدول ديكارت', subtitle: PLATFORM.descartes.result,
      context: { text: PLATFORM.descartes.text, note: PLATFORM.figureSum },
      reveals: ['khata-majmu'],
    },
    {
      // ⛔ خطأ شائع — l'exercice 9 (commonError) et le terrain : les deux bandes ab manquent.
      id: 'khata-majmu', kind: 'common_mistake', lane: 'start', requires: 'murabba-majmu',
      title: 'نسيان الحد المضاعف', subtitle: '$(x + 5)^2 \\neq x^2 + 25$',
      context: {
        parts: [
          { role: 'wrong', text: ex9.commonError },
          { role: 'why', text: ex9.question.explain },
          { role: 'right', text: ex9.question.rows[0].correction },
        ],
      },
      reveals: [],
    },
    {
      id: 'dhihni', kind: 'method', lane: 'end', requires: 'hisab-mutamaan', notebook: true,
      title: 'الحساب الذهني بمتطابقة', subtitle: '$21^2 = (20 + 1)^2$',
      reveals: ['khata-dhihni'],
    },
    {
      // ⛔ خطأ شائع — l'exercice 11 (commonError) : 21² ≠ 400 + 1.
      id: 'khata-dhihni', kind: 'common_mistake', lane: 'end', requires: 'hisab-mutamaan',
      title: 'تربيع الجزأين فقط', subtitle: '$21^2 \\neq 400 + 1$',
      context: {
        parts: [
          { role: 'wrong', text: ex11.commonError },
          { role: 'why', text: ex11.question.explain },
          { role: 'right', text: ex11.method },
        ],
      },
      reveals: [],
    },
    {
      id: 'farq', kind: 'relationship', lane: 'center', requires: 'murabba-farq', notebook: true,
      title: 'مربع فرق', subtitle: squareDiff.text,
      reveals: ['khata-farq', 'jidaa'],
    },
    {
      // ⛔ خطأ شائع — l'exercice 13 (commonError) : (x − 4)² ≠ x² − 16.
      id: 'khata-farq', kind: 'common_mistake', lane: 'end', requires: 'murabba-farq',
      title: 'مربع فرق ليس فرق مربعين', subtitle: '$(x - 4)^2 \\neq x^2 - 16$',
      context: {
        parts: [
          { role: 'wrong', text: ex13.commonError },
          { role: 'why', text: ex13.question.explain },
          { role: 'right', text: ex13.question.rows[0].correction },
        ],
      },
      reveals: [],
    },
    {
      id: 'jidaa', kind: 'relationship', lane: 'start', requires: 'jidaa-majmu-farq', notebook: true,
      title: 'جداء مجموع حدين وفرقهما', subtitle: sumDiff.text,
      reveals: ['mutatabiqa'],
    },
    {
      id: 'mutatabiqa', kind: 'definition', lane: 'center', requires: 'mutatabiqa', notebook: true,
      title: 'المتطابقة',
      reveals: ['tariqa'],
    },
    {
      id: 'tariqa', kind: 'method', lane: 'center', requires: 'tariqat-nashr', notebook: true,
      title: 'نشر بمتطابقة شهيرة', subtitle: '$(2x + 1)^2 = 4x^2 + 4x + 1$',
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — les trois identités de معارف 2 et la règle de la طريقة, réunies.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-nashr',
      title: 'ثلاث متطابقات شهيرة', subtitle: sumDiff.text,
      context: {
        text: KNOWLEDGE.remarkable,
        list: [squareSum.text, squareDiff.text, sumDiff.text],
        note: METHOD.rule,
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'majmu', to: 'dikart', label: 'مثال' },
    { from: 'dikart', to: 'khata-majmu', label: 'خطأ شائع' },
    { from: 'majmu', to: 'dhihni', label: 'بالأعداد' },
    { from: 'dhihni', to: 'khata-dhihni', label: 'خطأ شائع' },
    { from: 'majmu', to: 'farq', label: 'وللفرق' },
    { from: 'farq', to: 'khata-farq', label: 'خطأ شائع' },
    { from: 'farq', to: 'jidaa', label: 'والجداء' },
    { from: 'jidaa', to: 'mutatabiqa', label: 'ثلاث متطابقات' },
    { from: 'mutatabiqa', to: 'tariqa', label: 'نوظّفها' },
    { from: 'tariqa', to: 'khulasa', label: 'نستخلص' },
  ],
};
