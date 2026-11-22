/**
 * La carte PROGRESSIVE du درس « نشر وتبسيط عبارة جبرية » —
 * docs/architecture/KNOWLEDGE_MAP.md, Part A.
 *
 * Aucune mathématique n'est écrite ici : chaque texte vient de la leçon — le
 * manuel (content/textbook.js : معارف 1 p. 34 — la définition et les propriétés) et la PLATEFORME,
 * les exercices et leurs `commonError` (content/exercises.js), et les deux
 * phrases de la plateforme que le module 1 affiche (PLATFORM_NOTES). Les
 * développements des deux terrains sont CALCULÉS (core/polynomials) à partir
 * des facteurs de l'activité ; 3 × (9 + 5) à partir de ses nombres.
 * Chaque nœud est gardé par l'item de knowledge.jsx qui l'établit (`requires`).
 *
 * (Schéma en ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                         [النشر]                                    مفهوم
 *                 معناه ┌────┴────┐ مثال
 *               [التعريف]       [ملعب المتوسطة]                       محور 1
 *          نتحقق منه بـ │           │ تذكّر
 *          🔍 [جداء أم مجموع؟]  📌 [التوزيعية]
 *                                   │ وأيضًا
 *                              [جداء قوسين]
 *                                   │ مثال
 *                              [الملعب ذو الممرّ]
 *                    حالة خاصّة ┌───┘
 *                 [k(a ± b)]                                         محور 2
 *                     │ مثال
 *                 [مثالان]
 *                     │ نبسّط
 *               [تبسيط عبارة]
 *                     │ خطأ شائع
 *              ⛔ [حدّان غير متشابهين]
 *                     │ خطأ شائع
 *              ⛔ [قوسان مسبوقان بـ −]
 *                     │ نستخلص
 *                  🎯 [الخلاصة]
 */
import * as polynomials from '@smarter-academy/core/arithmetic/polynomials.js';
import { ACTIVITY, KNOWLEDGE, PLATFORM_NOTES } from './content/textbook';
import { EX } from './content/exercises';

const { expand, termsTex, factorTex } = polynomials;
const { k, a, b } = ACTIVITY.numbers.q1a;
const [beg1, beg2] = ACTIVITY.factors.beginner;
const [adv1, adv2] = ACTIVITY.factors.advanced;
// Les deux terrains, développés par le calcul (jamais retapés).
const pitchSmall = `$${factorTex(beg1)}${factorTex(beg2)} = ${termsTex(expand(beg1, beg2))}$`;
const pitchBig = `$${factorTex(adv1)}${factorTex(adv2)} = ${termsTex(expand(adv1, adv2))}$`;
// Question 1 (lecture corrigée) : 3 × (9 + 5) = 27 + 15 = 42.
const twoWays = `$${k} \\times (${a} + ${b}) = ${k * a} + ${k * b} = ${k * (a + b)}$`;
const [propSum, propDiff, propDouble] = KNOWLEDGE.properties;
const ex6 = EX['ex-6'];
// Les exemples et les phrases des nœuds sont ceux de la PLATEFORME (indépendance du manuel, rollout 2026-11-11) : ni le texte des questions de
// l'activité, ni les exemples du livre ; « مثالا الكتاب » est devenu « مثالان ».
const EXAMPLES = ['$6(x - 2) = 6 \\times x - 6 \\times 2 = 6x - 12$', '$(2x + 1)(x + 3) = 2x^2 + 6x + x + 3 = 2x^2 + 7x + 3$'];

export const KNOWLEDGE_GRAPH = {
  root: 'nashr',
  nodes: [
    {
      id: 'nashr', kind: 'concept', lane: 'center', requires: 'nashr-taarif',
      title: 'النشر', subtitle: '$k(a + b) = ka + kb$',
      context: { text: KNOWLEDGE.definition, note: ACTIVITY.title },
      reveals: ['taarif', 'mal3ab'],
    },
    {
      id: 'taarif', kind: 'definition', lane: 'start', requires: 'nashr-taarif', notebook: true,
      title: 'التعريف', subtitle: 'من جداء إلى مجموع',
      reveals: ['tamyiz'],
    },
    {
      // 🔍 تحقّق — la question 2 de l'activité et sa règle (PLATFORM_NOTES.classify).
      id: 'tamyiz', kind: 'check', lane: 'start', requires: 'nashr-taarif',
      title: 'جداء أم مجموع؟', subtitle: '$x(2x + 5)$',
      context: { text: PLATFORM_NOTES.classify, list: ['$x(2x + 5)$ ، $3x(2 - x)$ ، $(3x - 1)(3 + x)$', '$x + (4 - 3x)$ ، $x(x + 2) - 1 + (x + 2)$'] },
      reveals: [],
    },
    {
      // Le terrain du niveau مبتدئ : pour x = 9, c'est la question 1.
      id: 'mal3ab', kind: 'example', lane: 'end', requires: 'nashr-taarif',
      title: 'ملعب المتوسطة', subtitle: pitchSmall,
      context: { text: 'نحسب $3 \\times (9 + 5)$ بطريقتين: جداء البعدين، أو مجموع مساحتي المنطقتين.', formula: twoWays, list: [pitchSmall] },
      reveals: ['tadhakkur'],
    },
    {
      // 📌 تذكّر — la distributivité de la 3AM, diagnostiquée par « أستعدّ » (items 3 et 4).
      id: 'tadhakkur', kind: 'prerequisite', lane: 'end', requires: 'nashr-taarif',
      title: 'الخاصية التوزيعية', subtitle: '$-2(a - 1) = -2a + 2$',
      // la phrase citée vient du module 0 (le conseil de « أستعدّ ») : chaque aide cite la leçon mot pour mot (lessonGraphs.test.js)
      context: { text: 'العدد الذي أمام القوسين يُضرب في كل حد بداخلهما، مع إشارته.', list: ['$-2(a - 1) = -2a + 2$', '$4(2 - b) = 8 - 4b$'] },
      reveals: ['qawsayn'],
    },
    {
      id: 'qawsayn', kind: 'relationship', lane: 'end', requires: 'nashr-qawsayn', notebook: true,
      title: 'جداء قوسين', subtitle: propDouble,
      reveals: ['mal3ab-kabir'],
    },
    {
      id: 'mal3ab-kabir', kind: 'example', lane: 'end', requires: 'nashr-qawsayn',
      title: 'الملعب ذو الممرّ', subtitle: '$(3x - 1)(3 + x)$',
      context: { text: 'ملعب بعداه $3x - 1$ و $3 + x$ : أربع مناطق، منها اثنتان مقتطعتان.', formula: pitchBig },
      reveals: ['tawziiya'],
    },
    {
      id: 'tawziiya', kind: 'relationship', lane: 'start', requires: 'tawziiya-nashr', notebook: true,
      title: 'ضرب عدد في مجموع أو فرق', subtitle: '$k(a - b) = ka - kb$',
      reveals: ['amthila'],
    },
    {
      id: 'amthila', kind: 'example', lane: 'start', requires: 'tawziiya-nashr',
      title: 'مثالان', subtitle: '$6(x - 2) = 6x - 12$',
      context: { list: EXAMPLES, note: `${propSum} ، ${propDiff}` },
      reveals: ['tabsit'],
    },
    {
      id: 'tabsit', kind: 'method', lane: 'center', requires: 'tabsit', notebook: true,
      title: 'تبسيط عبارة', subtitle: '$8x - x = 7x$',
      reveals: ['khata-hudud'],
    },
    {
      // ⛔ خطأ شائع — le geste refusé du laboratoire et le distracteur de la question 3.
      id: 'khata-hudud', kind: 'common_mistake', lane: 'center', requires: 'tabsit',
      title: 'حدّان غير متشابهين', subtitle: '$3x^2 + 8x$',
      context: {
        parts: [
          { role: 'wrong', text: PLATFORM_NOTES.unlikeWrong },
          { role: 'why', text: PLATFORM_NOTES.unlike },
          { role: 'right', text: PLATFORM_NOTES.unlikeRight },
        ],
      },
      reveals: ['khata-qaws'],
    },
    {
      // ⛔ خطأ شائع — le premier élève de l'exercice 6.
      id: 'khata-qaws', kind: 'common_mistake', lane: 'center', requires: 'tabsit',
      title: 'قوسان مسبوقان بإشارة ناقص', subtitle: '$-(2x^2 + 3x)$',
      context: {
        parts: [
          { role: 'wrong', text: 'كتابة $-(2x^2 + 3x + 2x + 3) = -2x^2 + 3x + 2x + 3$ : تغيير إشارة الحدّ الأول وحده.' },
          { role: 'why', text: ex6.commonError },
          { role: 'right', text: ex6.question.rows[2].correction },
        ],
      },
      reveals: ['khulasa'],
    },
    {
      // 🎯 خلاصة — la définition, les trois propriétés et la réduction, réunies.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tabsit',
      title: 'الخلاصة', subtitle: '$(a + b)(c + d)$',
      context: {
        text: 'ننشر جداءً فنكتبه مجموعًا: $k(a + b) = ka + kb$ ، $k(a - b) = ka - kb$ و $(a + b)(c + d) = ac + ad + bc + bd$.',
        note: 'ثم نبسّط: نحذف الأقواس ونجمع الحدود المتشابهة فقط.',
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nashr', to: 'taarif', label: 'معناه' },
    { from: 'nashr', to: 'mal3ab', label: 'مثال' },
    { from: 'taarif', to: 'tamyiz', label: 'نتحقق منه بـ' },
    { from: 'mal3ab', to: 'tadhakkur', label: 'تذكّر' },
    { from: 'tadhakkur', to: 'qawsayn', label: 'وأيضًا' },
    { from: 'qawsayn', to: 'mal3ab-kabir', label: 'مثال' },
    { from: 'mal3ab-kabir', to: 'tawziiya', label: 'حالة خاصّة' },
    { from: 'tawziiya', to: 'amthila', label: 'مثال' },
    { from: 'amthila', to: 'tabsit', label: 'نبسّط' },
    { from: 'tabsit', to: 'khata-hudud', label: 'خطأ شائع' },
    { from: 'khata-hudud', to: 'khata-qaws', label: 'خطأ شائع' },
    { from: 'khata-qaws', to: 'khulasa', label: 'نستخلص' },
  ],
};
